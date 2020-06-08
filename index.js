const fetch = require('node-fetch');
const urlJoin = require('url-join');
const AbortController = require('abort-controller');

const Ext = require('./ext');

function log(logger, verbose, ...args) {
  if (!verbose || !logger) {
    return;
  }
  logger.log(...args);
}
function wait(interval) {
  return new Promise((resolve) => {
    setTimeout(resolve, interval);
  });
}
async function use(fn) {
  this.preFlightStack.push(fn);
}
async function postUse(fn) {
  this.postFlightStack.push(fn);
}
async function fetchWithRetrial(originalOpts, preFlightStack, postFlightStack, url, opts) {
  let i = 1;
  let shouldRetry = true;
  let res;
  const controller = new AbortController();
  const finalOpts = {
    ...originalOpts,
    ...opts
  }
  const {
    interval,
    logger,
    retryCondition,
    retryCallback,
  } = finalOpts;
  const newPreFlightStack = [].concat(preFlightStack || []);
  for (const stack of newPreFlightStack) {
    // BE CAREFUL/TODO: How to avoid mutation here?
    await stack(finalOpts);
  }
  while(i <= finalOpts.maxAttempts && shouldRetry) {
    const timeout = setTimeout(controller.abort.bind(controller), finalOpts.timeout);
    logger(`Attempt: ${i} - ${finalOpts.maxAttempts}`);
    i += 1;
    try {
      const newOpts = {...finalOpts, signal: controller.signal}
      res = await fetch(url, newOpts);
      shouldRetry = retryCondition &&
        'function' === typeof retryCondition &&
        await finalOpts.retryCondition(res);
      if (shouldRetry) {
        logger(`Got ${res.status} for ${url}. Wait for ${interval} ms before starting new request`);
        if (retryCallback &&
          'function' === typeof retryCallback) {
            await finalOpts.retryCallback(res)
          }
      }
    } catch (error) {
      logger(error);
      if (i > finalOpts.maxAttempts) {
        throw error;
      }
    }
    clearTimeout(timeout);
    if (shouldRetry) {
      await wait(interval);
    }
  }
  const newPostFlightStack = [].concat(postFlightStack || []);
  for (const stack of newPostFlightStack) {
    res = await stack(finalOpts, res);
  }
  return res;
}
function defaultRetryCondition(res) {
  const shouldRetryStatus =
    (res.status >= 100 && res.status <= 199) ||
    (res.status === 429) ||
    (res.status >= 500 && res.status <= 599);
  return shouldRetryStatus;
}

function FetchWrapper(baseUrl, opts = {
  headers,
  timeout,
  maxAttempts,
  retryCondition,
  interval,
  logger,
  verbose,
}) {
  this.baseUrl = baseUrl;
  this.preFlightStack = [];
  this.postFlightStack = [];
  this.opts = opts || {};
  this.opts.timeout = this.opts.timeout || 30000;
  this.opts.maxAttempts = this.opts.maxAttempts || 1;
  this.opts.headers = this.opts.headers || {};
  this.opts.retryCondition = this.opts.retryCondition || defaultRetryCondition;
  this.opts.interval = this.opts.interval || 0;
  
  const newVerbose = !!opts.verbose;
  const newLogger = opts.logger || console;
  this.fetch = fetchWithRetrial.bind(this, {
    ...this.opts,
    logger: log.bind(this, newLogger, newVerbose),
  }, this.preFlightStack, this.postFlightStack);
}

function action(method) {
  return function (uri = '', opts = {}) {
    const headers = {...this.opts.headers, ...opts.headers };
    const newOpts = { ...opts, method, headers};
    const url = urlJoin(this.baseUrl, uri);
    return this.fetch(url, newOpts);
  }
}


['post',
  'patch',
  'get',
  'put',
  'delete',
  'options',
  'head',
  'trace',
  'connect'
].forEach((method) => {
  FetchWrapper.prototype[method] = action(method);
});

FetchWrapper.json = function(baseUrl, opts = {
  headers,
  timeout,
  maxAttempts,
  retryCondition,
  interval,
  logger,
  verbose,
}) {
  const fetch = new FetchWrapper(baseUrl, opts);
  use.bind(fetch)(Ext.preJson);
  postUse.bind(fetch)(Ext.postJson);
  return fetch;
}

module.exports = FetchWrapper;
