const FetchWrapper = require('../index');
const http = require('http');
const assert = require('assert');
describe('node fetch wrapper test', () => {
  let server;
  afterEach(() => {
    server.close();
    server = null;
  });
  it('should respect the timeout property', async () => {
    await new Promise((resolve, reject) => {
      server = http.createServer(function (req, res) {
        setTimeout(() => {
          res.end();
        }, 200);
      }).listen(5000, async () => {
        try {
          const wrapper = new FetchWrapper('http://localhost:5000/', 150);
          const t = await wrapper.get();
          reject('should fail');
        } catch (error) {
          resolve(error);
        }
      });
    });
  });
  it('should be successul', async () => {
    await new Promise((resolve, reject) => {
      server = http.createServer(function (req, res) {
        setTimeout(() => {
          res.end();
        }, 100);
      }).listen(5000, async () => {
        try {
          const wrapper = new FetchWrapper('http://localhost:5000/', 150);
          const t = await wrapper.get();
          resolve('should be successful');
        } catch (error) {
          reject(error);
        }
      });
    });
  });
})