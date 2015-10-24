/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */
var PortManager = {
  port_map:{},
  getPort: function(portType, portNumber) {
    var self = this;
    return new Promise(function(resolve, reject) {
      var portName = portType + portNumber;
      var port = self.port_map[portName];
      if (port) {
        resolve(port);
      } else {
        var dammyPort = {
          port_type: portType,
          port_number: portNumber,
          write8: function(v1, v2) {
            console.log(portType+portNumber+".write8("+v1+","+v2+")");
          },
          setDeviceAddress: function(address) {
            console.log(portType+portNumber+".setDeviceAddress("+address+")");
          }
        };
        self.port_map[portName] = dammyPort;
        resolve(dammyPort);
      }
    });
  }
}
