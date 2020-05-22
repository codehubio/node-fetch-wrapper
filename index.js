const fetch = require('node-fetch');
const urlJoin = require('url-join');
const AbortController = require('abort-controller');

function FetchWrapper(baseUrl, headers = {}, timeout = 30000) {
  this.baseUrl = baseUrl;
  this.timeout = timeout;
  this.controller = new AbortController();
  this.headers = headers;
}

function action(method) {
  return function (uri = '', opts = {}) {
    const controller = this.controller;
    const timeout = setTimeout(controller.abort.bind(controller), this.timeout);
    const headers = {...this.headers, ...opts.headers };
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
