

// Setup I2C
var i2c = new I2C();
i2c.setup({ sda: B4, scl: B3 });

// initialise INA3221
var INA3221 = require("INA3221");
var ina = new INA3221(i2c, {
    address: 0x40,
    shunt: 0.1 // the shunt resistor's value
});
// You can now simply read the data
print(ina.readChannel2());







// var interval;

// function start() {
//     interval = setInterval(function () {
//         readChannel1();
//         var line1 = "channel 1: bus " + result.busVoltage1.toString() + " V shunt " + result.shuntVoltage1.toString() + " mV current " + result.current_mA1 + " mA";
//         print(line1);
//         readChannel2();
//         var line2 = "channel 2: bus " + result.busVoltage2.toString() + " V shunt " + result.shuntVoltage2.toString() + " mV current " + result.current_mA2 + " mA";
//         print(line2);
//     }, 2000);
// }

// start();

// setWatch(function (e) {
//     console.log("Stop timer");
//     clearInterval(interval);
// }, BTN, { repeat: true, edge: 'rising' });

