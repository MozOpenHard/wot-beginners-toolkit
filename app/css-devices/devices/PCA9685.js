/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */
var PCA9685Manager = {
  device_map: {},
  getPCA9685:function (port, address) {
    var self = this;
    return new Promise(function(resolve, reject) {
      var addressMap = self.device_map[port];
      if (addressMap) {
        var device = addressMap[address];
        if (device) {
          resolve(device);
          return;
        }
      } else {
        self.device_map[port] = {};
      }
      port.setDeviceAddress(address);
      var thread = (function* (){
        port.write8(0x00, 0x00);
        yield Utility.sleep(10, thread);
        port.write8(0x01, 0x04);
        yield Utility.sleep(10, thread);
        port.write8(0x00, 0x10);
        yield Utility.sleep(10, thread);
        port.write8(0xfe, 0x64);
        yield Utility.sleep(10, thread);
        port.write8(0x00, 0x00);
        yield Utility.sleep(10, thread);
        port.write8(0x06, 0x00);
        yield Utility.sleep(10, thread);
        port.write8(0x07, 0x00);
        yield Utility.sleep(300, thread);

        var device = new PCA9685(port, address);
        self.device_map[port][address] = device;
        resolve(device);
      })();
      thread.next();
    });
  }
}

var PCA9685 = function(port, address) {
  this.port = port;
  this.address = address;
}

PCA9685.prototype = {
  pwm:function(pin, angle) {
    //console.log("pwm:"+pin+","+angle);
    var self = this;
    var port = this.port;
    var address = this.address;

    var portStart = 8;
    var portInterval = 4;

    var center = 0.001500; // sec ( 1500 micro sec)
    var range  = 0.000600; // sec ( 600 micro sec) a bit large?
    var angleRange = 255.0;//50

    if ( angle > angleRange){
      angle = angleRange;
    } else if ( angle < -angleRange ){
      angle = - angleRange;
    }

    var freq = 1600; // Hz 61(old)
    var tickSec = ( 1 / freq ) / 4096; // 1bit resolution( sec )4096
    var centerTick = center / tickSec;
    var rangeTick = range / tickSec;
    var gain = rangeTick / angleRange; // [tick / angle]
    var ticks = Math.round(centerTick + gain * angle);
    var tickH = (( ticks >> 8 ) & 0x0f);
    var tickL = (ticks & 0xff);
    address = pin;
    return new Promise(function(resolve, reject) {
      var thread = (function*() {
        port.setDeviceAddress(address);
        var value =  Math.round(portStart + pin * portInterval);
        port.write8(value + 1, tickH);
        yield Utility.sleep(1, thread);
        port.write8(value, tickL);
        resolve();
      })();
      thread.next();
    });
  }
}
