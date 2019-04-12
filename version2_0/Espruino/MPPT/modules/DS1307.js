/* Copyright (c) 2019 Tobias Berthold. See the file LICENSE for copying permission. */
/*
Module is to set date time and read date time from a DS1307 over I2C.
*/

function DS1307(i2c) {
  this.i2c = i2c;
}

//private
var C = {
  i2c_address: 0x68,
  secsReg: 0x00,
  minsReg: 0x01,
  hourReg: 0x02,
  dateReg: 0x04,
  monthReg: 0x05,
  yearReg: 0x06,
  dowReg: 0x03
};

var dateTime =
{
  seconds: 0,
  minutes: 0,
  hours: 0,
  dow: 0,
  date: 0,
  month: 0,
  year: 0
};


//private functions
// Convert Decimal value to BCD
function dec2bcd(val) {
  return parseInt(val, 16);
};

// Convert BCD value to decimal
function bcd2dec(val) {
  return ((val >> 4) * 10 + (val & 0x0F));
};

// Formatting
function format(val) {
  return ("0" + val).substr(-2);
};

// Public functions
// Set the day of the week
DS1307.prototype.setDow = function (day) {
  var days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  var idx = days.indexOf(day);
  if (idx < 0) {
    print("Not a valid day");
  }
  else {
    this.i2c.writeTo(C.i2c_address, [C.dowReg, (dec2bcd(1 + idx))]);
  }
};

// Set the date
DS1307.prototype.setDate = function (date, month, year) {
  this.i2c.writeTo(C.i2c_address, [C.dateReg, (dec2bcd(date))]);
  this.i2c.writeTo(C.i2c_address, [C.monthReg, (dec2bcd(month))]);
  this.i2c.writeTo(C.i2c_address, [C.yearReg, (dec2bcd(year))]);
};

// Set the time
DS1307.prototype.setTime = function (hour, minute) {
  this.i2c.writeTo(C.i2c_address, [C.secsReg, 0]);
  this.i2c.writeTo(C.i2c_address, [C.minsReg, (dec2bcd(minute))]);
  this.i2c.writeTo(C.i2c_address, [C.hourReg, (dec2bcd(hour))]);
};


// Read the current date & time
DS1307.prototype.readDateTime = function () {
  this.i2c.writeTo(C.i2c_address, C.secsReg/* address*/);
  var data = this.i2c.readFrom(C.i2c_address, 7/* bytes */); //read number of bytes from address
  dateTime.seconds = bcd2dec(data[0]);
  dateTime.minutes = bcd2dec(data[1]);
  dateTime.hours = bcd2dec(data[2]);
  dateTime.dow = bcd2dec(data[3]);
  dateTime.date = bcd2dec(data[4]);
  dateTime.month = bcd2dec(data[5]);
  dateTime.year = bcd2dec(data[6]);
  return dateTime;
};

// Return the current date & time as string 
DS1307.prototype.readDateTimeString = function () {
  this.readDateTime();
  return dateTimeToString(dateTime);
};

DS1307.prototype.dateTimeToString = function (dateTimePar) {
  var seconds = dateTimePar.seconds;
  var minutes = dateTimePar.minutes;
  var hours = dateTimePar.hours;
  var dow = dateTimePar.dow;
  var date = dateTimePar.date;
  var month = dateTimePar.month;
  var year = dateTimePar.year;
  var rtcDate = format(month) + "-" + format(date) + "-" + format(year);
  var rtcTime = format(hours) + ":" + format(minutes) + ":" + format(seconds);
  var rtcDateTime = rtcDate + " " + rtcTime;
  return rtcDateTime;
};

exports.connect = function (i2c, options) {
  return new DS1307(i2c, options);
};

exports = DS1307;
