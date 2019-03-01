ina3221=require('INA3221.js');

var interval;

function start() {

    //console.log('configuration register');
    //var config = read(0);
    //print(config.toString());

    interval = setInterval(function () {
        //console.log('reading..');
        //var shuntVoltage1 = getShuntVoltage(1);
        //print("shuntVoltage1 " + shuntVoltage1.toString());
        //var busVoltage1 = getBusVoltage(1);
        //print("busVoltage1 " + busVoltage1.toString());
        //var line1 = "channel 1: bus " + busVoltage1.toString() + " V shunt " + shuntVoltage1.toString() + " mV";

        readChannel1();
        var line1 = "channel 1: bus " + result.busVoltage1.toString() + " V shunt " + result.shuntVoltage1.toString() + " mV current " + result.current_mA1 + " mA";
        print(line1);
        readChannel2();
        var line2 = "channel 2: bus " + result.busVoltage2.toString() + " V shunt " + result.shuntVoltage2.toString() + " mV current " + result.current_mA2 + " mA";
        print(line2);
    }, 2000);
}

start();

setWatch(function (e) {
    console.log("Stop timer");
    clearInterval(interval);
}, BTN, { repeat: true, edge: 'rising' });

