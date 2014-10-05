let url = require('./url');
let fabrics = require('../fabrics');
let pref = require('../pref');

let {Cc, Ci, Cu, components} = require('chrome');

Cu.import('resource://gre/modules/Services.jsm');
Cu.import('resource://gre/modules/XPCOMUtils.jsm');

let SCHEME = 'd2';
let DOUBLE_SLASH = '//';

function get_fabric_url(fabric) {
  return url.d2_proxy_url[fabric];
}

let current_d2_proxy_url = get_fabric_url(fabrics.default_fabric);

function D2Protocol() {}
D2Protocol.prototype = {
  classDescription: 'D2 Protocol Handler',
  contractID: '@mozilla.org/network/protocol;1?name=' + SCHEME,
  classID: components.ID('{c2bd92c0-309d-11e4-8c21-0800200c9a66}'),
  QueryInterface: XPCOMUtils.generateQI([Ci.nsIProtocolHandler]),

  defaultPort: -1,
  protocolFlags: Ci.nsIProtocolHandler.URI_NORELATIVE |
                 Ci.nsIProtocolHandler.URI_NOAUTH |
                 Ci.nsIProtocolHandler.URI_LOADABLE_BY_ANYONE,
  scheme: SCHEME,

  allowPort: function(port, scheme) {
    return false;
  },

  newChannel: function(aURI) {
    let path;
    if (aURI.path.startsWith(DOUBLE_SLASH)) {
      path = aURI.path.substr(DOUBLE_SLASH.length)
    } else {
      path = aURI.path;
    }

    let d2_uri = current_d2_proxy_url + path;
    let channel = Services.io.newChannel(d2_uri, aURI.originCharset, null);

    // setting .originalURI will not only let other code know where this
    // originally came from, but the UI will actually show that .originalURI
    channel.originalURI = aURI;

    return channel;
  },

  newURI: function(aSpec, aOriginCharset, aBaseURI) {
    // ignore origin charset
    // protocol does not support relative URI, ignore base URI
    let uri = Cc['@mozilla.org/network/simple-uri;1'].createInstance(Ci.nsIURI);
    uri.spec = aSpec;
    uri.originCharset = aOriginCharset;
    return uri;
  }
};

function D2Factory() {}
D2Factory.prototype = {
  createInstance: function(aOuter, iid) {
    if (aOuter) {
      throw Cr.NS_ERROR_NO_AGGREGATION;
    }
    return new D2Protocol();
  }
};

pref.pref_panel.port.on('change_fabric', function (new_fabric) {
  current_d2_proxy_url = get_fabric_url(new_fabric);
});

exports.D2Protocol = D2Protocol;
exports.D2Factory = D2Factory;