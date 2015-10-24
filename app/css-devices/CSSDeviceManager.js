/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */
var CSSDeviceManager = {
  device_map:{},
  style_observer_config: {attributes: true},
  start: function() {
    var self = this;
    self.style_observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.attributeName == "style") {
          var cssDeviceElement = mutation.target;
          var cssDevice = self.device_map[cssDeviceElement];
          self.update(cssDevice, cssDeviceElement);
        }
      });
    });

    var childObserver = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        var children = mutation.addedNodes;
        for (var i = 0, n = children.length; i < n; i++) {
          var child = children[i];
          var config = child.dataset.cssDevice;
          if (config) {
            self.createCSSDevice(config, child);
          }
        }
      });
    });
    childObserver.observe(document.body, {childList: true});

    var cssDeviceElements = document.querySelectorAll("[data-css-device]");
    for (var i = 0, n = cssDeviceElements.length; i < n; i++) {
      var cssDeviceElement = cssDeviceElements[i];
      var cssDevice = self.createCSSDevice(cssDeviceElement.dataset.cssDevice, cssDeviceElement);
    }

  },
  createCSSDevice: function(configString, cssDeviceElement) {
    var configAsJSONString =
      "{" +
      configString.replace(/\s/g, "")
      .replace(/([,:])?([^,;:]*)([,;])/g, "$1\"$2\"$3")
      .replace(/\"(\d+)\"/g, "$1")
      .replace(/:(([^,:]+,)+[^;]+);/g, ":[$1];")
      .replace(/;$/g, "")
      .replace(/;/g, ",")
      .replace(/(([-]|\w)+):/g, "\"$1\":") //attribute
      + "}";
    console.log(configAsJSONString);
    var config = JSON.parse(configAsJSONString);
    console.log(config);
    var self = this;
    var portType = config["port-type"];
    var portNumber = config["port-number"];
    PortManager.getPort(portType, portNumber).then(
      function(port) {
        var promise = null;
        switch (config.type) {
          case "multi-color-led": {
            promise = MultiColorLEDManager.createMultiColorLED(config, port);
            break;
          }
        }
        promise.then(
          function(cssDevice) {
            console.log(cssDevice);
            self.update(cssDevice, cssDeviceElement);
            self.device_map[cssDeviceElement] = cssDevice;
            self.style_observer.observe(cssDeviceElement, self.style_observer_config);
          },
          function(error) {
            throw new Error(error);
          }
        );
      },
      function(error) {
        console.error(error);
      }
    )
  },

  update: function(cssDevice, cssDeviceElement) {
    var style = window.getComputedStyle(cssDeviceElement, null);
    cssDevice.update(style);
  }
}
