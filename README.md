# a wrapper for node-fetch

this is a simple wrapper for [node-fetch](https://www.npmjs.com/package/node-fetch), with support for timeout.

## installation
```npm install node-fetch-wrapper```

## test
```npm test```

## example

```
// init a wrapper with base url http://example.com 
// request's timeout is 15 seconds
const wrapper = new FetchWrapper('http://example.com', 15000);

// identical to fetch('http://example.com/data')
await wrapper.get('data');

// identical to fetch('https://example.com/write', { method: 'post', body: 'some body'})
await wrapper.post('write', { body: 'some body });

```