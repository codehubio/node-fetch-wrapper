[![Build Status](https://travis-ci.org/codehubio/node-fetch-wrapper.svg?branch=master)](https://travis-ci.org/codehubio/node-fetch-wrapper)
[![Dependencies Status](https://david-dm.org/codehubio/node-fetch-wrapper/status.png)](https://david-dm.org/codehubio/node-fetch-wrapper)
# a wrapper for node-fetch

a simple wrapper for [node-fetch](https://www.npmjs.com/package/node-fetch), with support for timeout and retry.

## installation
```npm install node-fetch-wrapper```

## test
```npm test```

## example

```
// init a wrapper with base url http://example.com 
const FetchWrapper = require('node-fetch-wrapper');
const wrapper = new FetchWrapper('http://example.com', {
  // each request's timeout is 15 seconds
  timeout: 15000,
  // will try 3 times before finish
  maxAttempts: 3
  // wait for 1 seconds after each trial
  interval: 1000,
  // show debug info
  verbose: true
});

// identical to fetch('http://example.com/data')
wrapper.get('data');

// identical to fetch('https://example.com/write', { method: 'post', body: 'some body'})
wrapper.post('write', {
  body: 'some body'
);

```
