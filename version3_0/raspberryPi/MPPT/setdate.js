// to start:
// sudo node setdate.js

var rpio = require('rpio');
rpio.i2cBegin();

const RTC = require('./RTC.js');
var rtc = new RTC(rpio);

var currentDate = new Date(Date.now());
console.log("Date from computer UTC : " + currentDate.toISOString());

var year = currentDate.getFullYear();
var month = currentDate.getMonth() + 1;
console.log('Date from computer UTC : ' + currentDate.toISOString());

var year = currentDate.getFullYear();
var month = currentDate.getMonth() +1;
var day = currentDate.getDate();
var hours = currentDate.getHours();
var minutes = currentDate.getMinutes();
var seconds = currentDate.getSeconds();
var dayofweek = currentDate.getDay();
console.log(
  year + " " + month + " " + day + " " + hours + " " + minutes + " " + seconds
);
var cd = new Date(year, month, day, hours, minutes, seconds);
console.log("Date from computer UTC : " + cd.toISOString());
console.log(year + ' ' + month + ' ' + day + ' ' + hours + ' ' + minutes + ' ' + seconds);
var cd = new Date(year, month, day, hours, minutes, seconds);
console.log('Date from computer UTC : ' + cd.toISOString());
console.log();

// set the date on the RTC Pi using the date object
//rtc.setDate(cd);
//rtc.setDate(currentDate);
rtc.setDateNumbers(year, month, day, hours, minutes, seconds, dayofweek);

// read the date from the RTC and write it to the console
var rtcdate = rtc.readDateTimeUTC();
console.log("Date from RTC UTC      : " + rtcdate.toISOString());
console.log("Date from RTC local    : " + rtcdate.toLocaleString());

var convdate = new Date(
  rtcdate.getTime() - rtcdate.getTimezoneOffset() * 60000
);
console.log("Date from RTC local    : " + convdate.toISOString());
var ld = convdate.toISOString().slice(0, 19);
console.log("Date from RTC local    : " + ld);
var dayofweek=2;
rtc.setDateNumbers(year, month, day, hours, minutes, seconds,dayofweek) ;

// read the date from the RTC and write it to the console
var rtcdate = rtc.readDateTimeUTC();
console.log('Date from RTC UTC      : ' + rtcdate.toISOString());
console.log('Date from RTC local    : ' + rtcdate.toLocaleString());

var convdate = new Date(rtcdate.getTime() - rtcdate.getTimezoneOffset() * 60000)
console.log('Date from RTC local    : ' + convdate.toISOString());
var ld = convdate.toISOString().slice(0, 19);
console.log('Date from RTC local    : ' + ld);
//console.log(' ');
//console.log('TimezoneOffset : '+cd.getTimezoneOffset());
