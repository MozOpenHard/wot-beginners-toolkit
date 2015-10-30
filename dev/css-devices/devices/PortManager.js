/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */
var PortManager = {
  port_map: {},
  getPort: function(portType, portNumber) {
    var self = this;
    return new Promise(function(resolve, reject) {
      var portName = portType + portNumber;
      var port = self.port_map[portName];
      if (port) {
        resolve(port);
      } else {
        navigator.requestI2CAccess().then(
          function(i2c) {
            var port = i2c.open(portNumber);
            self.port_map[portName] = port;
            resolve(port);
          }
        );
      }
    });
  }
}
