const RTC = require('./RTC.js');
var rtc = new RTC();

var UTCdate = rtc.readDate();

console.log(UTCdate);

