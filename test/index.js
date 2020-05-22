const FetchWrapper = require('../index');
const http = require('http');
const assert = require('assert');
describe('node fetch wrapper test', () => {
  let server;
  afterEach(() => {
    server.close();
    server = null;
  });
  it('should respect the timeout property', () => {
    server = http.createServer(function (req, res) {
      setTimeout(() => {
        res.end();
      }, 200);
    }).listen(5000, async () => {
      let success = false;
      try {
        const wrapper = new FetchWrapper('http://localhost:5000/', 150);
        const t = await wrapper.get();
        success = true;
      } catch (error) {
      }
      assert.equal(success, false, 'request shoud fail');
    });
  });
  it('should be successul', () => {
    server = http.createServer(function (req, res) {
      setTimeout(() => {
        res.end();
      }, 100);
    }).listen(5000, async () => {
      let success = false;
      try {
        const wrapper = new FetchWrapper('http://localhost:5000/', 150);
        const t = await wrapper.get();
        success = true;
      } catch (error) {
      }
      assert.equal(success, true, 'request shoud succeed');
    });
  });
})