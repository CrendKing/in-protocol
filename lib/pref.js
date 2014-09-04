let fabrics = require('./fabrics');

let { ToggleButton } = require('sdk/ui/button/toggle');
let panels = require('sdk/panel');
let self = require('sdk/self');

let button = ToggleButton({
  id: 'd2-protocol-pref',
  label: 'D2 Protocol Preference',
  icon: './icon.png',
  onChange: handleChange
});

exports.pref_panel = panels.Panel({
  height: 100,
  contentURL: self.data.url('./pref_panel.html'),
  contentScriptFile: self.data.url('./pref_panel.js'),
  contentStyleFile: self.data.url('./pref_panel.css'),
  onHide: handleHide
});

function handleChange(state) {
  if (state.checked) {
    exports.pref_panel.show({
      position: button
    });
  }
}

function handleHide() {
  button.state('window', {checked: false});
}

exports.pref_panel.port.emit('load_fabrics', fabrics);