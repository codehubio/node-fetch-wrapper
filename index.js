const fetch = require('node-fetch');
const urlJoin = require('url-join');
const AbortController = require('abort-controller');

function FetchWrapper(baseUrl, opts = {
  headers, timeout, maxAttempts
}) {
  this.baseUrl = baseUrl;
  
  this.opts = opts || {};;
  this.opts.timeout = this.opts.timeout || 30000;
  this.opts.maxAttempts = this.opts.maxAttempts || 1;
  this.opts.headers = this.opts.headers || {};
  
  this.controller = new AbortController();
}

function action(method) {
  return function (uri = '', opts = {}) {
    const controller = this.controller;
    const timeout = setTimeout(controller.abort.bind(controller), this.opts.timeout);
    const headers = {...this.opts.headers, ...opts.headers };
    const newOpts = { ...opts, method, headers, signal: controller.signal };
    const url = urlJoin(this.baseUrl, uri);
    return fetch(url, newOpts);
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
