// Setup I2C
var i2c = new I2C();
i2c.setup({ sda: B4, scl: B3 });

// initialise INA3221
var INA3221 = require("INA3221");
//var INA3221 = require("https://github.com/atmelino/MPPT/blob/master/Espruino/develop/INA3221/INA3221.js");

var ina = new INA3221(i2c, {
    address: 0x40,
    shunt: 0.1 // the shunt resistor's value
});

var interval;

function start() {
    interval = setInterval(function () {
        result1 = ina.readChannel1();
        var bV1 = result1.busVoltage1.toString();
        var sV1 = result1.shuntVoltage1.toString();
        var I1 = result1.current_mA1;
        var P1 = I1 * bV1;
        var line1 = "channel 1: bus " + bV1 + " V shunt " + sV1 + " mV current " + I1 + " mA power " + P1 + "mW";
        print(line1);
        result2 = ina.readChannel2();
        var bV2 = result2.busVoltage2.toString();
        var sV2 = result2.shuntVoltage2.toString();
        var I2 = result2.current_mA2;
        var P2 = I2 * bV2;
        var line2 = "channel 2: bus " + bV2 + " V shunt " + sV2 + " mV current " + I2 + " mA power " + P2 + "mW";
        print(line2);
        result3 = ina.readChannel3();
        var bV3 = result3.busVoltage3.toString();
        var sV3 = result3.shuntVoltage3.toString();
        var I3 = result3.current_mA3;
        var P3 = I3 * bV3;
        var line3 = "channel 3: bus " + bV3 + " V shunt " + sV3 + " mV current " + I3 + " mA power " + P3 + "mW";
        print(line3);
    }, 2000);
}

start();

setWatch(function (e) {
    console.log("Stop timer");
    clearInterval(interval);
}, BTN, { repeat: true, edge: 'rising' });

