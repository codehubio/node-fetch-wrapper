const fetch = require('node-fetch');
const urlJoin = require('url-join');
const AbortController = require('abort-controller');
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
async function fetchWithRetrial({
  attempts,
  retryCondition,
  interval,
  logger,
}, url, opts) {
  let i = 1;
  let shouldRetry = true;
  let res;
  const controller = new AbortController();
  while(i <= attempts && shouldRetry) {
    const timeout = setTimeout(controller.abort.bind(controller), this.opts.timeout);
    logger(`Attempt: ${i} - ${attempts}`);
    i += 1;
    try {
      const newOpts = {...opts, signal: controller.signal}
      res = await fetch(url, newOpts);
      shouldRetry = retryCondition && await retryCondition(res);
      if (shouldRetry) {
        logger(`Got ${res.status} for ${url}. Wait for ${interval} ms before starting new request`);
      }
    } catch (error) {
      logger(error);
      if (i > attempts) {
        throw error;
      }
    }
    if (shouldRetry) {
      clearTimeout(timeout);
      await wait(interval);
    }
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
  this.opts = opts || {};;
  this.opts.timeout = this.opts.timeout || 30000;
  this.opts.maxAttempts = this.opts.maxAttempts || 1;
  this.opts.headers = this.opts.headers || {};
  this.opts.retryCondition = this.opts.retryCondition || defaultRetryCondition;
  
  const newVerbose = !!opts.verbose;
  const newLogger = opts.logger || console;
  this.fetch = fetchWithRetrial.bind(this, {
    attempts: this.opts.maxAttempts,
    interval: this.opts.interval || 0,
    retryCondition: this.opts.retryCondition.bind(this),
    logger: log.bind(this, newLogger, newVerbose),
  });
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
})

module.exports = FetchWrapper;
