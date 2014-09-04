let fabrics = require('./fabrics');

exports['test fabrics'] = function (assert) {
  for (fabric_id in fabrics.d2_proxy_urls) {
    assert.ok(fabric_id in fabrics.fabric_names);
  }
  assert.ok(fabrics.d2_proxy_urls.length == fabrics.fabric_names.length);
}

exports['test default_fabric'] = function (assert) {
  assert.ok(fabrics.default_fabric in fabrics.d2_proxy_urls);
  assert.ok(fabrics.default_fabric in fabrics.fabric_names);
}

require('sdk/test').run(exports);