const FetchWrapper = require('../index');
const http = require('http');
const assert = require('assert');
describe('node fetch wrapper test', () => {
  it('should respect the timeout property', () => {
    const server = http.createServer(function (req, res) {
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
      server.close();
      assert.equal(success, false, 'request shoud fail');
    });
  });
})