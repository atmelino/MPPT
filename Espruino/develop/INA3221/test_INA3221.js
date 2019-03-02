// Setup I2C
var i2c = new I2C();
i2c.setup({ sda: B4, scl: B3 });

// initialise INA3221
//var INA3221 = require("INA3221");
//var INA3221 = require("https://raw.githubusercontent.com/atmelino/MPPT/master/Espruino/develop/INA3221/INA3221.js");
var INA3221 = require("https://github.com/atmelino/MPPT/blob/master/Espruino/develop/INA3221/INA3221.js");

var ina = new INA3221(i2c, {
    address: 0x40,
    shunt: 0.1 // the shunt resistor's value
});

var interval;

function start() {
    interval = setInterval(function () {
        //result1=ina.readChannel1();
        //var line1 = "channel 1: bus " + result1.busVoltage1.toString() + " V shunt " + result1.shuntVoltage1.toString() + " mV current " + result1.current_mA1 + " mA";
        //print(line1);
        result2=ina.readChannel2();
        var line2 = "channel 2: bus " + result2.busVoltage2.toString() + " V shunt " + result2.shuntVoltage2.toString() + " mV current " + result2.current_mA2 + " mA";
        print(line2);
    }, 2000);
}

start();

setWatch(function (e) {
    console.log("Stop timer");
    clearInterval(interval);
}, BTN, { repeat: true, edge: 'rising' });

