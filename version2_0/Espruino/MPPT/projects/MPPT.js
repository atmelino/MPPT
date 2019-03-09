
// Setup I2C
var i2c = new I2C();
i2c.setup({ sda: B4, scl: B3 });

var RTC = require("DS1307");
var rtc = new RTC(i2c, {
    address: 0x68
});
var INA3221 = require("INA3221");
var ina = new INA3221(i2c, {
    address: 0x40,
    shunt: 0.1 // the shunt resistor's value
});
var interval;


function getChannel1() {
    result1 = ina.readChannel1();
    var bV1 = result1.busVoltage1.toString();
    var sV1 = result1.shuntVoltage1.toString();
    var I1 = result1.current_mA1;
    var P1 = I1 * bV1;
    var line1 = "channel 1: bus " + bV1 + " V shunt " + sV1 + " mV current " + I1 + " mA power " + P1 + "mW";
    return line1;
}

function getChannel2() {
    result2 = ina.readChannel2();
    var bV2 = result2.busVoltage2.toString();
    var sV2 = result2.shuntVoltage2.toString();
    var I2 = result2.current_mA2;
    var P2 = I2 * bV2;
    var line2 = "channel 2: bus " + bV2 + " V shunt " + sV2 + " mV current " + I2 + " mA power " + P2 + "mW";
    return line2;
}

function start() {
    console.log('DS1307 test  Press button on Espruino to stop');

    interval = setInterval(function () {
        console.log(rtc.readDateTime());
        print(getChannel2());
    }, 1000);
}

start();

setWatch(function (e) {
    console.log("Stop program");
    clearInterval(interval);
}, BTN, { repeat: true, edge: 'rising' });




