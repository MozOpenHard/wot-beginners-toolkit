var MCP3425Manager = {
  device_map: {},
  getMCP3425:function (port, address) {
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
      var thread = (function* (){
        var device = new MCP3425(port, address);
        self.device_map[port][address] = device;
        resolve(device);
      })();
      thread.next();
    });
  }
}

var MCP3425 = function(port, address) {
  this.port = port;
  this.address = address;
}

MCP3425.prototype = {
  read:function() {
    var self = this;
    var port = this.port;
    var address = this.address;
    return new Promise(function(resolve, reject) {

      port.open(address).then((slave)=>{
        var thread = (function*() {
          //port.setDeviceAddress(address);
          //port.open(address);
          slave.write8(0b10001000);
          yield Utility.sleep(200, thread);
          Promise.all([
            slave.read8(0x00, true)
          ]).then(function(v){
            resolve(v[0]);
          },function(){
            reject();
          });
        })();
        thread.next();
      });
    });
  }
}
