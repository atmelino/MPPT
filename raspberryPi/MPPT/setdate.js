// to start:
// sudo node setdate.js

const RTC = require("./RTC.js");
var rtc = new RTC();

//var UTCdate = rtc.readDate();
//console.log(UTCdate);

var currentDate = new Date(Date.now());
<<<<<<< HEAD
console.log("Date from computer UTC : " + currentDate.toISOString());

var year = currentDate.getFullYear();
var month = currentDate.getMonth() + 1;
=======
console.log('Date from computer UTC : ' + currentDate.toISOString());

var year = currentDate.getFullYear();
var month = currentDate.getMonth() +1;
>>>>>>> 8efc94d880afbf2d077fadadf48ef0eb6d61e73c
var day = currentDate.getDate();
var hours = currentDate.getHours();
var minutes = currentDate.getMinutes();
var seconds = currentDate.getSeconds();
<<<<<<< HEAD
var dayofweek = currentDate.getDay();
console.log(
  year + " " + month + " " + day + " " + hours + " " + minutes + " " + seconds
);
var cd = new Date(year, month, day, hours, minutes, seconds);
console.log("Date from computer UTC : " + cd.toISOString());
=======
console.log(year + ' ' + month + ' ' + day + ' ' + hours + ' ' + minutes + ' ' + seconds);
var cd = new Date(year, month, day, hours, minutes, seconds);
console.log('Date from computer UTC : ' + cd.toISOString());
>>>>>>> 8efc94d880afbf2d077fadadf48ef0eb6d61e73c
console.log();

// set the date on the RTC Pi using the date object
//rtc.setDate(cd);
//rtc.setDate(currentDate);
<<<<<<< HEAD
rtc.setDateNumbers(year, month, day, hours, minutes, seconds, dayofweek);

// read the date from the RTC and write it to the console
var rtcdate = rtc.readDate();
console.log("Date from RTC UTC      : " + rtcdate.toISOString());
console.log("Date from RTC local    : " + rtcdate.toLocaleString());

var convdate = new Date(
  rtcdate.getTime() - rtcdate.getTimezoneOffset() * 60000
);
console.log("Date from RTC local    : " + convdate.toISOString());
var ld = convdate.toISOString().slice(0, 19);
console.log("Date from RTC local    : " + ld);
=======
var dayofweek=2;
rtc.setDateNumbers(year, month, day, hours, minutes, seconds,dayofweek) ;

// read the date from the RTC and write it to the console
var rtcdate = rtc.readDate();
console.log('Date from RTC UTC      : ' + rtcdate.toISOString());
console.log('Date from RTC local    : ' + rtcdate.toLocaleString());

var convdate = new Date(rtcdate.getTime() - rtcdate.getTimezoneOffset() * 60000)
console.log('Date from RTC local    : ' + convdate.toISOString());
var ld = convdate.toISOString().slice(0, 19);
console.log('Date from RTC local    : ' + ld);
>>>>>>> 8efc94d880afbf2d077fadadf48ef0eb6d61e73c
//console.log(' ');
//console.log('TimezoneOffset : '+cd.getTimezoneOffset());
