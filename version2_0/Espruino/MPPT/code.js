
// Setup I2C
var i2c = new I2C();
i2c.setup({ sda: B4, scl: B3 });

//i2c.setup({ scl: B6, sda: B7 });
var RTC = require("DS1307");

var rtc = new RTC(i2c, {
    address: 0x68
});

function start() {
    console.log('DS1307 test  Press button on Espruino to stop');

    interval = setInterval(function () {
        console.log(rtc.readDateTime());
        result1 = ina.readChannel1();
        var bV1 = result1.busVoltage1.toString();
        var sV1 = result1.shuntVoltage1.toString();
        var I1 = result1.current_mA1;
        var P1 = I1 * bV1;
        var line1 = "channel 1: bus " + bV1 + " V shunt " + sV1 + " mV current " + I1 + " mA power " + P1 + "mW";
        print(line1);
    }, 1000);
}

start();

setWatch(function (e) {
    console.log("Stop program");
    clearInterval(interval);
}, BTN, { repeat: true, edge: 'rising' });




