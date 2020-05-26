function preJson(opts) {
  if (!opts || !opts.json) {
    return;
  }
  opts.headers = opts.headers || {};
  opts.body = JSON.stringify(opts.json);
  opts.headers['content-type'] = 'application/json';
}

async function postJson(opts, res) {
  if (!opts || !opts.json) {
    return;
  }
  const body = await res.json();
  return { ...res, body };
}

module.exports.preJson = preJson;
module.exports.postJson = postJson;