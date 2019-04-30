
const INA3221 = require("./INA3221.js");
var ina3221 = new INA3221();
var loopTimer;
var loopPeriod = 1000;

var bV1 = ina3221.getBusVoltage1();
var bV3 = ina3221.getBusVoltage3();


console.log("bus voltage 1 " + bV1);
console.log("bus voltage 3 " + bV3);


function mainLoop() {

    let result = ina3221.readAllChannels();
    //console.log(JSON.stringify(result));
    let line1 = "bus " + result.busVoltage1.toFixed(3) + " V shunt " + result.shuntVoltage1.toFixed(3) + " mV current " + result.current_mA1.toFixed(3) + " mA";
    //  console.log("channel 1: " + line1);
    // line = "bus " + result.busVoltage2 + " V shunt " + result.shuntVoltage2+ " mV current " + result.current_mA2 + " mA";
    // console.log("channel 2: "+line);
    line3 = "bus " + result.busVoltage3.toFixed(3) + " V shunt " + result.shuntVoltage3.toFixed(3) + " mV current " + result.current_mA3.toFixed(3) + " mA";
    //    console.log("channel 3: " + line3);


    console.log("channel 1: " + line1 + " channel 3: " + line3);

}

function start() {
    console.log("INA3221 test started");
    loopTimer = setInterval(mainLoop, loopPeriod);
}

start();

