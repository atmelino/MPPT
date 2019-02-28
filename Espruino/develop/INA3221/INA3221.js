var interval;

// Setup I2C
var i2c = new I2C();
i2c.setup({ sda: B4, scl: B3 });
addr = 0x40;

function readWord(register) {
    i2c.writeTo(this.addr, 0x06);
    i2c.writeTo(this.addr, register);
    var dbytes = i2c.readFrom(this.addr, 2);
    var dword = dbytes[1] | dbytes[0] << 8;
    if (dword > 32767)
        dword -= 65536;

    //var line = dbytes[0].toString(16) + dbytes[1].toString(16) + " " + dword.toString(16);
    //print(line);

    return dword;
}

function getShuntVoltage(channel) {
    return readWord(0x01) * 0.005;
}

function getBusVoltage(channel) {
    return readWord(0x02) * 0.001;
}


function start() {

    console.log('configuration register');
    //var config = read(0);
    //print(config.toString());

    // var i;
    // for (i = 0; i < 5; i++) {
    //     var shuntVoltage1 = getShuntVoltage(1);
    //     print("shuntVoltage1 " + shuntVoltage1.toString());
    //     var busVoltage1 = getBusVoltage(1);
    //     print("busVoltage1 " + busVoltage1.toString());
    // }

    interval = setInterval(function () {
        //console.log('reading..');
        var shuntVoltage1 = getShuntVoltage(1);
        print("shuntVoltage1 " + shuntVoltage1.toString());
        var busVoltage1 = getBusVoltage(1);
        print("busVoltage1 " + busVoltage1.toString());
    }, 2000);
  
}

start();

    setWatch(function (e) {
        console.log("Stop timer");
        clearInterval(interval);
    }, BTN, { repeat: true, edge: 'rising' });



