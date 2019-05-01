var rpio = require('rpio');
rpio.i2cBegin();

const RTC = require('./RTC.js');
var rtc = new RTC(rpio);

var UTCdate = rtc.readDate();
console.log(UTCdate);

