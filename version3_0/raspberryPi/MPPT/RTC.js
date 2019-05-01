/**
 * RTC Class
 */

// Define registers values from datasheet
const SECONDS = 0x00;
const MINUTES = 0x01;
const HOURS = 0x02;
const DAYOFWEEK = 0x03;
const DAY = 0x04;
const MONTH = 0x05;
const YEAR = 0x06;
const CONTROL = 0x07;

// variables
var rtcAddress = 0x68;  // I2C address
// initial configuration - square wave and output disabled, frequency set
// to 32.768KHz.
var config = 0x03;
// the DS1307 does not store the current century so that has to be added on
// manually.
var century = 2000;

class RTC {

    /**
     * Initialise the RTC Pi I2C connection and set the default configuration to the control register
     */
    constructor(rpio) {
        this.dateTime =
            {
                seconds: 0,
                minutes: 0,
                hours: 0,
                dow: 0,
                date: 0,
                month: 0,
                year: 0
            };
        this.rpio = rpio;
        this.i2cWriteByte(CONTROL, config);
    }

    // Private functions

    /**
     * Write a single byte to the I2C bus.
     * @param  {number} register - Target register
     * @param  {number} val - Value to be written
     */
    i2cWriteByte(register, val) {
        var txbuf = new Buffer([register, val]);
        this.rpio.i2cSetSlaveAddress(rtcAddress);
        this.rpio.i2cWrite(txbuf);
    }

    /**
     * Convert a BCD formatted number to decimal.
     * @param  {number} val - BCD value
     * @returns {number} - Decimal value
     */
    bcdToDec(val) {
        return val - 6 * (val >> 4);
    }

    /**
     * Convert a decimal to BCD formatted number.
     * @param  {number} val - Decimal value
     * @returns {number} - BCD value
     */
    decToBcd(val) {
        return val / 10 << 4 | val % 10;
    }

    /**
     * Calculate the current century
     * @param  {number} val - Year
     */
    getCentury(val) {
        if (val.length > 2) {
            var y = val[0] + val[1];
            century = int(y) * 100;
        }
    }

    // public functions

    /**
     * Set the date and time on the RTC
     * @param  {Date} date - Use a javascript Date object
     */
    setDate(date) {
        this.getCentury(date.getFullYear());
        this.i2cWriteByte(SECONDS, this.decToBcd(date.getSeconds()));
        this.i2cWriteByte(MINUTES, this.decToBcd(date.getMinutes()));
        this.i2cWriteByte(HOURS, this.decToBcd(date.getHours()));
        this.i2cWriteByte(DAYOFWEEK, this.decToBcd(date.getDay()));
        this.i2cWriteByte(DAY, this.decToBcd(date.getDate()));
        this.i2cWriteByte(MONTH, this.decToBcd(date.getMonth() - 1));
        this.i2cWriteByte(YEAR, this.decToBcd(date.getFullYear() - century));
    }

    setDateNumbers(year, month, day, hours, minutes, seconds, dayofweek) {
        this.i2cWriteByte(SECONDS, this.decToBcd(seconds));
        this.i2cWriteByte(MINUTES, this.decToBcd(minutes));
        this.i2cWriteByte(HOURS, this.decToBcd(hours));
        this.i2cWriteByte(DAY, this.decToBcd(day));
        this.i2cWriteByte(MONTH, this.decToBcd(month - 1));
        this.i2cWriteByte(YEAR, this.decToBcd(year - century));
        this.i2cWriteByte(DAYOFWEEK, this.decToBcd(dayofweek));
    }


    readDate() {
        var txbuf = new Buffer(1);
        var rxbuf = new Buffer(7);
        txbuf[0] = 0;

        this.rpio.i2cSetSlaveAddress(rtcAddress);
        this.rpio.i2cWrite(txbuf);
        this.rpio.i2cRead(rxbuf, 7);

        this.dateTime.year = this.bcdToDec(rxbuf[6]);
        this.dateTime.month = this.bcdToDec(rxbuf[5]);
        this.dateTime.date = this.bcdToDec(rxbuf[4]);
        this.dateTime.hours = this.bcdToDec(rxbuf[2]);
        this.dateTime.minutes = this.bcdToDec(rxbuf[1]);
        this.dateTime.seconds = this.bcdToDec(rxbuf[0]);

        var d = new Date(this.bcdToDec(rxbuf[6]) + century, this.bcdToDec(rxbuf[5]), this.bcdToDec(rxbuf[4]), this.bcdToDec(rxbuf[2]), this.bcdToDec(rxbuf[1]), this.bcdToDec(rxbuf[0]), 0);

        //return this.dateTime;
        return d;
    }

    dateTimeString() {
        var newUTCdate;

        var localdate = new Date(
            newUTCdate.getTime() - newUTCdate.getTimezoneOffset() * 60000
        );
        var localdatestring = localdate
            .toISOString()
            .replace(/:/g, "_")
            .slice(0, 19);
        return localdatestring;
    }

}



module.exports = RTC;



