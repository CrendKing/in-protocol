let url = require('./url');
let fabrics = require('../fabrics');
let pref = require('../pref');

let {Cc, Ci, Cu, components} = require('chrome');

Cu.import('resource://gre/modules/Services.jsm');
Cu.import('resource://gre/modules/XPCOMUtils.jsm');

let SCHEME = 'eh';
let DOUBLE_SLASH = '//';

function get_fabric_url_prefix(fabric) {
  return url.RANGE_URL_PREFIX + fabric + '.';
}

let current_eh_url_prefix = get_fabric_url_prefix(fabrics.default_fabric);

function EHProtocol() {}
EHProtocol.prototype = {
  classDescription: 'EH Protocol Handler',
  contractID: '@mozilla.org/network/protocol;1?name=' + SCHEME,
  classID: components.ID('{1874a4ee-f156-4772-a114-9fabd816067b}'),
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
    let query;
    if (aURI.path.startsWith(DOUBLE_SLASH)) {
      query = aURI.path.substr(DOUBLE_SLASH.length)
    } else {
      query = aURI.path;
    }

    let slash = query.lastIndexOf('/');
    let service_name;
    let metadata_name;
    if (slash == -1) {
      service_name = query;
      metadata_name = null;
    } else {
      service_name = query.substr(0, slash);
      metadata_name = query.substr(slash + 1).toUpperCase();
    }

    let eh_clusters_uri = current_eh_url_prefix + service_name + url.RANGE_URL_SUFFIX;
    if (metadata_name) {
      eh_clusters_uri += ':' + metadata_name
    }

    let channel = Services.io.newChannel(eh_clusters_uri, aURI.originCharset, null);

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

function EHFactory() {}
EHFactory.prototype = {
  createInstance: function(aOuter, iid) {
    if (aOuter) {
      throw Cr.NS_ERROR_NO_AGGREGATION;
    }
    return new EHProtocol();
  }
};

pref.pref_panel.port.on('change_fabric', function (new_fabric) {
  current_eh_url_prefix = get_fabric_url_prefix(new_fabric);
});

exports.EHProtocol = EHProtocol;
exports.EHFactory = EHFactory;