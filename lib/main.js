const {Cc, Ci, Cm, Cu, components} = require('chrome');
Cm.QueryInterface(Ci.nsIComponentRegistrar);

Cu.import('resource://gre/modules/Services.jsm');
Cu.import('resource://gre/modules/XPCOMUtils.jsm');

const SCHEME = 'd2';
const DOUBLE_SLASH = '//';
const D2_PROXY_URL = 'http://ei2-d2-proxy-vip-1.stg.linkedin.com:21360/d2/';

function D2Protocol() {}
D2Protocol.prototype = Object.freeze({
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

    let d2_uri = D2_PROXY_URL + path;
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
});

function D2Factory() {}
D2Factory.prototype = Object.freeze({
  createInstance: function(aOuter, iid) {
    if (aOuter) {
      throw Cr.NS_ERROR_NO_AGGREGATION;
    }
    return new D2Protocol();
  }
});

let d2_factory = new D2Factory();

exports.main = function (options, callbacks) {
  Cm.registerFactory(D2Protocol.prototype.classID,
                     D2Protocol.prototype.classDescription,
                     D2Protocol.prototype.contractID,
                     d2_factory);
};

exports.onUnload = function (reason) {
  Cm.unregisterFactory(D2Protocol.prototype.classID, d2_factory);
};