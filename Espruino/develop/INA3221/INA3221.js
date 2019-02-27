// Setup I2C
var i2c = new I2C();
i2c.setup({ sda: B4, scl: B3 });
addr = 0x40;


function readWord(register) {
    i2c.writeTo(this.addr, 0x06);
    i2c.writeTo(this.addr, 0x02);
    var dbytes = i2c.readFrom(this.addr, 2);
    var line = dbytes[0].toString(16) + dbytes[1].toString(16);
    print(line);
    //print(dbytes[0].toString(16));
    //print(dbytes[1].toString(16));
    //Serial.write(dbytes[0].toString(16));


    var dword = dbytes[1] | dbytes[0] << 8;
    if (dword > 32767)
        dword -= 65536;
    value = dword * 0.005;
    return value;

}



function start() {
    console.log('configuration register');
    //var config = read(0);
    //print(config.toString());

    var i;
    for (i = 0; i < 5; i++) {
        var shuntVoltage1 = readWord(0x01);
        print("shuntVoltage1 " + shuntVoltage1.toString());
        //var busVoltage1 = readWord(0x02);
        //print("busVoltage1 " + busVoltage1.toString());
    }

    // setInterval(function () {
    //     console.log('reading..');
    //     var shuntVoltage1 = read(2);
    //     print("shuntVoltage1 " + shuntVoltage1.toString());
    //     var busVoltage1 = read(4);
    //     print("busVoltage1 " + busVoltage1.toString());
    // }, 2000);
}

start();


