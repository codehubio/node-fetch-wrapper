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
    setTimeout(() => {
      resolve();
    }, interval);
  });
}
async function fetchWithRetrial(currentAttempt, {
  attempts,
  interval,
  logger,
}, url, opts) {
  if (currentAttempt > attempts) {
    throw new Error(`Tried ${currentAttempt} times and reached over ${attempts} attempt(s)`);
  }
  const boundFetch = fetchWithRetrial.bind(this, currentAttempt + 1, { attempts, interval, logger}, url, opts);
  try {
    const res =  await fetch(url, opts);
    if (res.ok) {
      return res;
    }
    logger(`Got ${res.status} for ${url}. Wait for ${interval} ms before starting new request`);
    await wait(interval);
    return await boundFetch();
  } catch (error) {
    logger(`Got ${error.message}. Wait for ${interval} ms before starting new request`);
    await wait(interval);
    return await boundFetch();
  }
}

function FetchWrapper(baseUrl, opts = {
  headers, timeout, maxAttempts, interval, logger, verbose,
}) {
  this.baseUrl = baseUrl;
  this.opts = opts || {};;
  this.opts.timeout = this.opts.timeout || 30000;
  this.opts.maxAttempts = this.opts.maxAttempts || 1;
  this.opts.headers = this.opts.headers || {};
  
  const newVerbose = !!opts.verbose;
  const newLogger = opts.logger || console;
  this.fetch = fetchWithRetrial.bind(this, 1, {
    attempts: this.opts.maxAttempts,
    interval: this.opts.interval || 0,
    logger: log.bind(this, newLogger, newVerbose),
  });
  this.controller = new AbortController();
}

function action(method) {
  return function (uri = '', opts = {}) {
    const controller = this.controller;
    const timeout = setTimeout(controller.abort.bind(controller), this.opts.timeout);
    const headers = {...this.opts.headers, ...opts.headers };
    const newOpts = { ...opts, method, headers, signal: controller.signal };
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
