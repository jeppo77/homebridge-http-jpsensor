var http = require("http");
var Service, Characteristic;


module.exports = function(homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;

    homebridge.registerAccessory("homebridge-http-JPSENSOR", "http-JPSENSOR", Http_jpsensor);
}

function Http_jpsensor(log, config) {
    this.log = log;
    this.leakDetected = Characteristic.LeakDetected.LEAK_NOT_DETECTED;

    this.name = config["name"];
    this.port = config["port"] || 5555;

var that = this;
    this.server = http.createServer(function(request, response) {

        if (request.url == "/true")
            that.leakDetected = Characteristic.LeakDetected.LEAK_DETECTED;
        else
            that.leakDetected = Characteristic.LeakDetected.LEAK_NOT_DETECTED;

            that.log("Leak sensor set to %d", that.leakDetected);

        that.JPService.setCharacteristic(Characteristic.LeakDetected, that.leakDetected);
        response.end('Successfully requested: ' + request.url);
    });

    this.JPService = new Service.LeakSensor(this.name);
    this.JPService.getCharacteristic(Characteristic.LeakDetected)
        .on('get', this.getState.bind(this));

    this.server.listen(this.port, function() {
        that.log("Leak sensor server listening on: http://<ipaddress>:%s", that.port);
    });
}

Http_jpsensor.prototype.getState = function(callback) {
    callback(null, this.leakDetected);
};

Http_jpsensor.prototype.getServices = function() {
    return [this.JPService];
}
