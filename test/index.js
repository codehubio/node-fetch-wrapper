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
          const wrapper = new FetchWrapper('http://localhost:5000/', {
            timeout: 150,
          });
          await wrapper.get();
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
          const wrapper = new FetchWrapper('http://localhost:5000/', {
            timeout: 150,
          });
          await wrapper.get();
          resolve('should be successful');
        } catch (error) {
          reject(error);
        }
      });
    });
  });
  it('should respect headers', async () => {
    await new Promise((resolve, reject) => {
      server = http.createServer(function (req, res) {
        assert.equal(req.headers['content-type'], 'application/json', 'Content-Type should be application/json');
        assert.equal(req.headers['customheader'], 'custom value', 'customHeader should be custom value');
        res.end();
      }).listen(5000, async () => {
        try {
          const wrapper = new FetchWrapper('http://localhost:5000/', {
            headers: {
              'content-type': 'application/json'
            },
            timeout: 150,
          });
          await wrapper.get('', {
            headers: {
              customHeader: 'custom value'
            }
          });
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  });
})