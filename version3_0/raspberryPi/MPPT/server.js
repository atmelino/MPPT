var rpio = require('rpio');
rpio.i2cBegin();
const RTC = require('./RTC.js');
var rtc = new RTC(rpio);
const INA3221 = require("./INA3221.js");
var ina3221 = new INA3221(rpio);
var inaValues;
var loopTimer;
var loopPeriod = 1000;
var UTCdate;

UTCdate = rtc.readDate();
console.log(UTCdate);

inaValues = ina3221.readAllChannels();
solarVoltage = inaValues.busVoltage3;
batteryVoltage = inaValues.busVoltage1;
batteryCurrent = inaValues.current_mA1;
let line1 = "bus " + inaValues.busVoltage1.toFixed(3) + " V shunt " + inaValues.shuntVoltage1.toFixed(3) + " mV current " + inaValues.current_mA1.toFixed(3) + " mA";
line3 = "bus " + inaValues.busVoltage3.toFixed(3) + " V shunt " + inaValues.shuntVoltage3.toFixed(3) + " mV current " + inaValues.current_mA3.toFixed(3) + " mA";
console.log("channel 1: " + line1 + " channel 3: " + line3);

UTCdate = rtc.readDate();
console.log(UTCdate);


function mainLoop() {
    // inaValues = ina3221.readAllChannels();
    // solarVoltage = inaValues.busVoltage3;
    // batteryVoltage = inaValues.busVoltage1;
    // batteryCurrent = inaValues.current_mA1;
    // let line1 = "bus " + inaValues.busVoltage1.toFixed(3) + " V shunt " + inaValues.shuntVoltage1.toFixed(3) + " mV current " + inaValues.current_mA1.toFixed(3) + " mA";
    // line3 = "bus " + inaValues.busVoltage3.toFixed(3) + " V shunt " + inaValues.shuntVoltage3.toFixed(3) + " mV current " + inaValues.current_mA3.toFixed(3) + " mA";
    // console.log("channel 1: " + line1 + " channel 3: " + line3);

    // var UTCdate = rtc.readDate();
    // console.log(UTCdate);

}

function start() {

    //debugMsgln("server started", 0);





    //loopTimer = setInterval(mainLoop, loopPeriod);


}

start();

