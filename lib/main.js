let protocol = require('./protocol');

exports.main = protocol.register;
exports.onUnload = protocol.unregister;