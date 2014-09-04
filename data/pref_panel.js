self.port.on('load_fabrics', function (fabrics) {
  let fabric_selector = document.getElementById('fabric_selector');

  for (let fabric_id in fabrics.fabric_names) {
    let option = document.createElement('option');
    option.value = fabric_id;
    option.text = fabrics.fabric_names[fabric_id];
    if (fabric_id == fabrics.default_fabric) {
      option.selected = true;
    }

    fabric_selector.add(option);
  }

  fabric_selector.addEventListener('change', function () {
    self.port.emit('change_fabric', fabric_selector.options[fabric_selector.selectedIndex].value);
  });
});