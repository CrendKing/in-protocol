let d2 = require('./d2/handler');
let eh = require('./eh/handler');

let {Ci, Cm} = require('chrome');
Cm.QueryInterface(Ci.nsIComponentRegistrar);

let d2_factory = new d2.D2Factory();
let eh_factory = new eh.EHFactory();

exports.register = function (options, callbacks) {
  Cm.registerFactory(d2.D2Protocol.prototype.classID,
                     d2.D2Protocol.prototype.classDescription,
                     d2.D2Protocol.prototype.contractID,
                     d2_factory);
  Cm.registerFactory(eh.EHProtocol.prototype.classID,
                     eh.EHProtocol.prototype.classDescription,
                     eh.EHProtocol.prototype.contractID,
                     eh_factory);
};

exports.unregister = function (reason) {
  Cm.unregisterFactory(d2.D2Protocol.prototype.classID, d2_factory);
  Cm.unregisterFactory(eh.EHProtocol.prototype.classID, eh_factory);
};