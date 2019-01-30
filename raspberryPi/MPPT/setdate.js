// to start:
// sudo node setdate.js 


const RTC = require('./RTC.js');
var rtc = new RTC();

//var UTCdate = rtc.readDate();
//console.log(UTCdate);

var currentTime = new Date(Date.now());
console.log('Date from computer: '+currentTime);

var year=currentTime.getFullYear();
var month=currentTime.getMonth()+1;
var day=currentTime.getDate();
var hours=currentTime.getHours();
var minutes=currentTime.getMinutes();
var seconds=currentTime.getSeconds();
var cd = new Date(year, month, day, hours, minutes, seconds, 00);

// set the date on the RTC Pi using the date object
rtc.setDate(cd);

// read the date from the RTC and write it to the console
var rtcdate=rtc.readDate();
console.log('UTC  : '+rtcdate.toISOString());
console.log('local: '+rtcdate.toLocaleString());

var convdate=new Date(rtcdate.getTime() - rtcdate.getTimezoneOffset() * 60000)
console.log('local: '+convdate.toISOString());
var ld = convdate.toISOString().slice(0,19); 
console.log('local: '+ld);
//console.log(' ');
//console.log('TimezoneOffset : '+cd.getTimezoneOffset());



