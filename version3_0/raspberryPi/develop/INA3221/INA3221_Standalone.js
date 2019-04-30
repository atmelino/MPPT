

options = {
    address: 0x40,
    shunt1: 0.1,
    shunt2: 0.1,
    shunt3: 0.1
};

result = {
    BusVoltage1: 0,
    ShuntVoltage1: 0,
    current_mA1: 0,
    BusVoltage2: 0,
    ShuntVoltage2: 0,
    current_mA2: 0,
    BusVoltage3: 0,
    ShuntVoltage3: 0,
    current_mA3: 0
};



var interval;

// Setup I2C
var i2c = new I2C();
i2c.setup({ sda: B4, scl: B3 });
addr = 0x40;

function readWord(register) {
    i2c.writeTo(options.address, 0x06);
    i2c.writeTo(options.address, register);
    var dbytes = i2c.readFrom(options.address, 2);
    var dword = dbytes[1] | dbytes[0] << 8;
    if (dword > 32767)
        dword -= 65536;

    //var line = dbytes[0].toString(16) + dbytes[1].toString(16) + " " + dword.toString(16);
    //print(line);

    return dword;
}

function getShuntVoltage1() {
    return readWord(0x01) * 0.005;
}

function getBusVoltage1() {
    return readWord(0x02) * 0.001;
}

function getShuntVoltage2() {
    return readWord(0x03) * 0.005;
}

function getBusVoltage2() {
    return readWord(0x04) * 0.001;
}

function getShuntVoltage3() {
    return readWord(0x05) * 0.005;
}

function getBusVoltage3() {
    return readWord(0x06) * 0.001;
}

function readChannel1() {
    result.shuntVoltage1 = getShuntVoltage1();
    result.busVoltage1 = getBusVoltage1();
    result.current_mA1 = result.shuntVoltage1 / options.shunt1;
}

function readChannel2() {
    result.shuntVoltage2 = getShuntVoltage2();
    result.busVoltage2 = getBusVoltage2();
    result.current_mA2 = result.shuntVoltage2 / options.shunt2;
}



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



