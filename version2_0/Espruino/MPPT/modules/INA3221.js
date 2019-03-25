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

channelResult = {
  busVoltage: 0,
  shuntVoltage: 0,
  current_mA: 0,
  power_mW: 0
};

allChannelsResult = {
  busVoltage1: 0,
  shuntVoltage1: 0,
  current_mA1: 0,
  power_mW1: 0,
  busVoltage2: 0,
  shuntVoltage2: 0,
  current_mA2: 0,
  power_mW2: 0,
  busVoltage3: 0,
  shuntVoltage3: 0,
  current_mA3: 0,
  power_mW3: 0
};

function INA3221(i2c, options) {
  //print("INA3221 driver");
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

INA3221.prototype.getshuntVoltage1 = function () {
  return this.readWord(0x01) * 0.005;
};

INA3221.prototype.getbusVoltage1 = function () {
  return this.readWord(0x02) * 0.001;
};

INA3221.prototype.getshuntVoltage2 = function () {
  return this.readWord(0x03) * 0.005;
};

INA3221.prototype.getbusVoltage2 = function () {
  return this.readWord(0x04) * 0.001;
};
INA3221.prototype.getshuntVoltage3 = function () {
  return this.readWord(0x05) * 0.005;
};

INA3221.prototype.getbusVoltage3 = function () {
  return this.readWord(0x06) * 0.001;
};

INA3221.prototype.readChannel1 = function () {
  channelResult.shuntVoltage = this.getshuntVoltage1();
  channelResult.busVoltage = this.getbusVoltage1();
  channelResult.current_mA = channelResult.shuntVoltage / options.shunt1;
  return channelResult;
};

INA3221.prototype.readChannel2 = function () {
  channelResult.shuntVoltage = this.getshuntVoltage2();
  channelResult.busVoltage = this.getbusVoltage2();
  channelResult.current_mA = channelResult.shuntVoltage / options.shunt2;
  return channelResult;
};

INA3221.prototype.readChannel3 = function () {
  channelResult.shuntVoltage = this.getshuntVoltage3();
  channelResult.busVoltage = this.getbusVoltage3();
  channelResult.current_mA = channelResult.shuntVoltage / options.shunt3;
  return channelResult;
};

INA3221.prototype.readAllChannels = function () {
  allChannelsResult.shuntVoltage1 = this.getshuntVoltage1();
  allChannelsResult.busVoltage1 = this.getbusVoltage1();
  allChannelsResult.current_mA1 = allChannelsResult.shuntVoltage1 / options.shunt1;
  allChannelsResult.power_mW1 = allChannelsResult.shuntVoltage1 *allChannelsResult.current_mA1;
  allChannelsResult.shuntVoltage2 = this.getshuntVoltage2();
  allChannelsResult.busVoltage2 = this.getbusVoltage2();
  allChannelsResult.current_mA2 = allChannelsResult.shuntVoltage2 / options.shunt2;
  allChannelsResult.power_mW2 = allChannelsResult.shuntVoltage3 *allChannelsResult.current_mA2;
  allChannelsResult.shuntVoltage3 = this.getshuntVoltage3();
  allChannelsResult.busVoltage3 = this.getbusVoltage3();
  allChannelsResult.current_mA3 = allChannelsResult.shuntVoltage3 / options.shunt3;
  allChannelsResult.power_mW3 = allChannelsResult.shuntVoltage3 *allChannelsResult.current_mA3;
  return allChannelsResult;
};



exports = INA3221;
