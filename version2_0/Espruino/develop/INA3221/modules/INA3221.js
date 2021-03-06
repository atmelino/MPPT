/* Copyright (c) 2019 Tobias Berthold. See the file LICENSE for copying permission. */
/*
Driver for the TI INA3221 chip. This chip allows voltage and current measurement for 
three separate channels.
Usage:
var INA3221 = require("INA3221.js");
var ina = new INA3221(i2c, {
    address: 0x40,
    shunt: 0.1 // the shunt resistor's value
});
result=ina.readChannel1();
*/


result = {
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

function INA3221(i2c, options) {
  print("INA3221 driver");
  this.i2c = i2c;
  //this.options.address = options.address || 0x40; // default address if A0/A1 are GND
}

options = {
  address: 0x40,
  shunt1: 0.1,
  shunt2: 0.1,
  shunt3: 0.1
};

INA3221.prototype.readWord = function (register) {
  this.i2c.writeTo(options.address, 0x06);
  this.i2c.writeTo(options.address, register);
  var dbytes = this.i2c.readFrom(options.address, 2);
  var dword = dbytes[1] | (dbytes[0] << 8);
  if (dword > 32767) dword -= 65536;

  //var line = dbytes[0].toString(16) + dbytes[1].toString(16) + " " + dword.toString(16);
  //print(line);

  return dword;
};

INA3221.prototype.getShuntVoltage1 = function () {
  return this.readWord(0x01) * 0.005;
};

INA3221.prototype.getBusVoltage1 = function () {
  return this.readWord(0x02) * 0.001;
};

INA3221.prototype.getShuntVoltage2 = function () {
  return this.readWord(0x03) * 0.005;
};

INA3221.prototype.getBusVoltage2 = function () {
  return this.readWord(0x04) * 0.001;
};
INA3221.prototype.getShuntVoltage3 = function () {
  return this.readWord(0x05) * 0.005;
};

INA3221.prototype.getBusVoltage3 = function () {
  return this.readWord(0x06) * 0.001;
};

INA3221.prototype.readChannel1 = function () {
  result.shuntVoltage1 = this.getShuntVoltage1();
  result.busVoltage1 = this.getBusVoltage1();
  result.current_mA1 = result.shuntVoltage1 / options.shunt1;
  return result;
};

INA3221.prototype.readChannel2 = function () {
  result.shuntVoltage2 = this.getShuntVoltage2();
  result.busVoltage2 = this.getBusVoltage2();
  result.current_mA2 = result.shuntVoltage2 / options.shunt2;
  return result;
};

INA3221.prototype.readChannel3 = function () {
  result.shuntVoltage3 = this.getShuntVoltage3();
  result.busVoltage3 = this.getBusVoltage3();
  result.current_mA3 = result.shuntVoltage3 / options.shunt3;
  return result;
};

exports = INA3221;
