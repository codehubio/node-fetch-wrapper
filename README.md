[![Build Status](https://travis-ci.org/codehubio/node-fetch-wrapper.svg?branch=master)](https://travis-ci.org/codehubio/node-fetch-wrapper)
[![Dependencies Status](https://david-dm.org/codehubio/node-fetch-wrapper/status.png)](https://david-dm.org/codehubio/node-fetch-wrapper)
# a wrapper for node-fetch

a simple wrapper for [node-fetch](https://www.npmjs.com/package/node-fetch), with support for timeout and retry. once enabled (maxAttempts set to > 1), it will
  - retry when request times out (this is unchangeable).
  - retry when request matches specific user-defined condition.

## installation
```npm install node-fetch-wrapper```

## test
```npm test```
## general usage

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
  verbose: true,
  // retry on which condtion,
  retryCondition: defaultRetryCondition,
  // this function will be called before each retrying attempts. default unassigned.
  retryCallback: function (res) {
    console.log('callbacked');
  }
});
```
#### by default, the retryCondition has value:
```
function defaultRetryCondition(res) {
  const shouldRetryStatus =
    (res.status >= 100 && res.status <= 199) ||
    (res.status === 429) ||
    (res.status >= 500 && res.status <= 599);
  return shouldRetryStatus;
}
```

## example

basically, this module acts like node-fetch (same input/output) with some additional support for timeout/retry
```

// identical to fetch('http://example.com/data')
wrapper.get('data');

// identical to fetch('https://example.com/write', { method: 'post', body: 'some body'}).
// note: general setting can be overwritten in specific request
wrapper.post('write', {
  body: 'some body',
  maxAttempts: 5
  retryCondition: function(res) {
    return res.body === 'fail';
  }
});

```

**this module can also be used specifically for json:**

```
const jsonWrapper = new FetchWrapper.json('http://example.com', {
  // each request's timeout is 15 seconds
  timeout: 15000,
  // will try 3 times before finish
  maxAttempts: 3
  // wait for 1 seconds after each trial
  interval: 1000,
  // show debug info
  verbose: true,
  // retry on which condtion,
  // default
  retryCondition: defaultRetryCondition
});
```

remember to specify json in the request, otherwise error will be thrown

```
const res = jsonWrapper.post('write', {
  body: 'some body',
  maxAttempts: 5
  json: {
    key1: 'value1'
  }
});

```

this does additional work that calls *res.json()* and assign the *body* back to *res* object.


