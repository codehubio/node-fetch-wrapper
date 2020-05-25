[![Build Status](https://travis-ci.org/codehubio/node-fetch-wrapper.svg?branch=master)](https://travis-ci.org/codehubio/node-fetch-wrapper)
[![Dependencies Status](https://david-dm.org/codehubio/node-fetch-wrapper/status.png)](https://david-dm.org/codehubio/node-fetch-wrapper)
# a wrapper for node-fetch

a simple wrapper for [node-fetch](https://www.npmjs.com/package/node-fetch), with support for timeout.

## installation
```npm install node-fetch-wrapper```

## test
```npm test```

## example

```
// init a wrapper with base url http://example.com 
// no default header
// request's timeout is 15 seconds
const FetchWrapper = require('node-fetch-wrapper');
const wrapper = new FetchWrapper('http://example.com', {
  timeout: 15000
});

// identical to fetch('http://example.com/data')
wrapper.get('data');

// identical to fetch('https://example.com/write', { method: 'post', body: 'some body'})
wrapper.post('write', {
  body: 'some body'
);

```
