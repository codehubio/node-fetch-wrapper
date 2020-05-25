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
            maxAttempts: 2,
            verbose: true,
            interval: 200
          });
          await wrapper.get();
          reject('should fail');
        } catch (error) {
          resolve(error);
        }
      });
    });
  });
  it('should retry on 503 by default', async () => {
    let count = 0;
    await new Promise((resolve, reject) => {
      server = http.createServer(function (req, res) {
        count += 1;
        res.writeHead(503);
        res.end();
      }).listen(5000, async () => {
        const wrapper = new FetchWrapper('http://localhost:5000/', {
          timeout: 500,
          maxAttempts: 3,
          verbose: true,
          interval: 200
        });
        try {
          await wrapper.get();
          assert.equal(count, 3, 'should retry 3 times');
          resolve(true)
        } catch (error) {
          reject(error);
        }
      });
    });
  });
  it('should NOT retry on success', async () => {
    let count = 0;
    await new Promise((resolve, reject) => {
      server = http.createServer(function (req, res) {
        count += 1;
        res.writeHead(count !== 2 ? 503 : 200);
        res.end();
      }).listen(5000, async () => {
        const wrapper = new FetchWrapper('http://localhost:5000/', {
          timeout: 500,
          maxAttempts: 3,
          verbose: true,
          interval: 200
        });
        try {
          await wrapper.get();
          assert.equal(count, 2, 'should retry 2 times');
          resolve(true)
        } catch (error) {
          reject(error);
        }
      });
    });
  });
  it('should respect custom retry condition', async () => {
    let count = 0;
    await new Promise((resolve, reject) => {
      server = http.createServer(function (req, res) {
        count += 1;
        res.writeHead(200);
        res.end();
      }).listen(5000, async () => {
        const wrapper = new FetchWrapper('http://localhost:5000/', {
          timeout: 500,
          maxAttempts: 3,
          verbose: true,
          interval: 200,
          retryCondition: function(res) {
            return res.status === 200;
          }
        });
        try {
          await wrapper.get();
          assert.equal(count, 3, 'should retry 3 times');
          resolve(true)
        } catch (error) {
          reject(error);
        }
      });
    });
  });
  it('should rewrite custom retry condition', async () => {
    let count = 0;
    await new Promise((resolve, reject) => {
      server = http.createServer(function (req, res) {
        count += 1;
        res.writeHead(500);
        res.end();
      }).listen(5000, async () => {
        const wrapper = new FetchWrapper('http://localhost:5000/', {
          timeout: 500,
          maxAttempts: 3,
          verbose: true,
          interval: 200,
          retryCondition: function(res) {
            return res.status === 200;
          }
        });
        try {
          await wrapper.get('', {
            maxAttempts: 4,
            retryCondition: function(res) {
              return res.status === 500;
            }
          });
          assert.equal(count, 4, 'should retry 4 times');
          resolve(true)
        } catch (error) {
          reject(error);
        }
      });
    });
  });
  it('should not retry on 404 by default', async () => {
    let count = 0;
    await new Promise((resolve, reject) => {
      server = http.createServer(function (req, res) {
        count += 1;
        res.writeHead(404);
        res.end();
      }).listen(5000, async () => {
        const wrapper = new FetchWrapper('http://localhost:5000/', {
          timeout: 150,
          maxAttempts: 2,
          verbose: true,
          interval: 100
        });
        try {
          await wrapper.get();
          assert.equal(count, 1, 'should not retry');
          resolve(true);
        } catch (error) {
          reject(new Error());
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
            verbose: true,
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
            verbose: true,
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