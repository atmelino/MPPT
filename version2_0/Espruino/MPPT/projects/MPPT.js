
// Setup I2C
var i2c = new I2C();
i2c.setup({ sda: B9, scl: B8 });

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
var toggle = false;


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

function getChannel3() {
    result3 = ina.readChannel3();
    var bV3 = result3.busVoltage3.toString();
    var sV3 = result3.shuntVoltage3.toString();
    var I3 = result3.current_mA3;
    var P3 = I3 * bV3;
    var line3 = "channel 3: bus " + bV3 + " V shunt " + sV3 + " mV current " + I3 + " mA power " + P3 + "mW";
    return line3;
}

function start() {
    console.log('Turning PWM on');
    digitalWrite(B1, 1);
    analogWrite(A0, 0.8, { freq: 80000 });


    interval = setInterval(function () {
        digitalPulse(B13, 1, 50); // pulse  led as indicator
        digitalPulse(B14, 1, 50); // pulse  led as indicator
        digitalPulse(B15, 1, 50); // pulse  led as indicator
        console.log(rtc.readDateTime());
        print(getChannel1());
        print(getChannel3());
    }, 1000);
}


function onInit() {
    console.log('MPPT test  Press button on Espruino to stop');

    start();
}

setWatch(function (e) {
    console.log("Stop program");
    clearInterval(interval);
}, BTN, { repeat: true, edge: 'rising' });




