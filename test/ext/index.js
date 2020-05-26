const FetchWrapper = require('../../index');
const http = require('http');
const assert = require('assert');
describe('node fetch wrapper ext test', () => {
  let server;
  afterEach(() => {
    server.close();
    server = null;
  });
  it('should apply json header', async () => {
    await new Promise((resolve, reject) => {
      server = http.createServer(function (req, res) {
        assert.equal(req.headers['content-type'], 'application/json', 'Content-Type should be application/json');
        res.write('{"a": "test"}');
        res.end();
      }).listen(5000, async () => {
        try {
          const wrapper = new FetchWrapper.json('http://localhost:5000/', {
            timeout: 150,
            maxAttempts: 1,
          });
          const res = await wrapper.post('/', {
            json: {
              key1: 'value1',
            }
          });
          assert.equal(res.body.a, 'test', 'Should parse to JSON automatically');
          resolve(true);
        } catch (error) {
          console.log(error);
          reject('should success');
        }
      });
    });
  });
})