/**
 * INA3221 Class
 */

// variables
var ina3221Address = 0x40;  // I2C address

class INA3221 {

    constructor(rpio) {
        this.options = {
            shunt1: 0.1,
            shunt2: 0.1,
            shunt3: 0.1
        };
        this.result = {
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
        this.rpio = rpio;
    }

    // Private functions

    readWord(register) {
        var dbytes = new Buffer(2);
        this.i2cWriteByte(register, 0x06);
        this.rpio.i2cSetSlaveAddress(ina3221Address);
        this.rpio.i2cRead(dbytes, 2);
        var dword = dbytes[1] | (dbytes[0] << 8);
        if (dword > 32767) dword -= 65536;

        //var line = dbytes[0].toString(16) + dbytes[1].toString(16) + " " + dword.toString(16);
        //console.log(line);

        return dword;
    };


    /**
     * Write a single byte to the I2C bus.
     * @param  {number} register - Target register
     * @param  {number} val - Value to be written
     */
    i2cWriteByte(register, val) {
        var txbuf = new Buffer([register, val]);
        this.rpio.i2cSetSlaveAddress(ina3221Address);
        this.rpio.i2cWrite(txbuf);
    }

    // public functions

    getShuntVoltage1() {
        return this.readWord(0x01) * 0.005;
    };

    getBusVoltage1() {
        return this.readWord(0x02) * 0.001;
    };

    getShuntVoltage2() {
        return this.readWord(0x03) * 0.005;
    };

    getBusVoltage2() {
        return this.readWord(0x04) * 0.001;
    };

    getShuntVoltage3() {
        return this.readWord(0x05) * 0.005;
    };

    getBusVoltage3() {
        return this.readWord(0x06) * 0.001;
    };

    readChannel1() {
        this.result.shuntVoltage1 = this.getShuntVoltage1();
        this.result.busVoltage1 = this.getBusVoltage1();
        this.result.current_mA1 = this.result.shuntVoltage1 / this.options.shunt1;
        return this.result;
    };

    readChannel2() {
        this.result.shuntVoltage2 = this.getShuntVoltage2();
        this.result.busVoltage2 = this.getBusVoltage2();
        this.result.current_mA2 = this.result.shuntVoltage2 / this.options.shunt2;
        return this.result;
    };

    readChannel3() {
        this.result.shuntVoltage3 = this.getShuntVoltage3();
        this.result.busVoltage3 = this.getBusVoltage3();
        this.result.current_mA3 = this.result.shuntVoltage3 / this.options.shunt3;
        return this.result;
    };

    readAllChannels() {
        this.result.shuntVoltage1 = this.getShuntVoltage1();
        this.result.busVoltage1 = this.getBusVoltage1();
        this.result.current_mA1 = this.result.shuntVoltage1 / this.options.shunt1;
        this.result.shuntVoltage2 = this.getShuntVoltage2();
        this.result.busVoltage2 = this.getBusVoltage2();
        this.result.current_mA2 = this.result.shuntVoltage2 / this.options.shunt2;
        this.result.shuntVoltage3 = this.getShuntVoltage3();
        this.result.busVoltage3 = this.getBusVoltage3();
        this.result.current_mA3 = this.result.shuntVoltage3 / this.options.shunt3;
        return this.result;
    };

}

module.exports = INA3221;



