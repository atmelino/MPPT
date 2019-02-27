// Setup I2C
var i2c = new I2C();
i2c.setup({ sda: B4, scl: B3 });
addr = 0x40;


function read() {
    i2c.writeTo(this.addr, 0x06);

    i2c.writeTo(this.addr, 0x01);

    var d = i2c.readFrom(this.addr, 8);

    return d;

}



function start() {
    setInterval(function () {
        console.log('reading..');
        var data = read();
        print(data.toString());
    }, 2000);
}

start();


