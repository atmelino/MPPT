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
result=ina.getChannel1();
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
  channelResult.power_mW = channelResult.busVoltage * channelResult.current_mA;
};

INA3221.prototype.readChannel2 = function () {
  channelResult.shuntVoltage = this.getshuntVoltage2();
  channelResult.busVoltage = this.getbusVoltage2();
  channelResult.current_mA = channelResult.shuntVoltage / options.shunt2;
  channelResult.power_mW = channelResult.busVoltage * channelResult.current_mA;
};

INA3221.prototype.readChannel3 = function () {
  channelResult.shuntVoltage = this.getshuntVoltage3();
  channelResult.busVoltage = this.getbusVoltage3();
  channelResult.current_mA = channelResult.shuntVoltage / options.shunt3;
  channelResult.power_mW = channelResult.busVoltage * channelResult.current_mA;
};

INA3221.prototype.readAllChannels = function () {
  allChannelsResult.shuntVoltage1 = this.getshuntVoltage1();
  allChannelsResult.busVoltage1 = this.getbusVoltage1();
  allChannelsResult.current_mA1 = allChannelsResult.shuntVoltage1 / options.shunt1;
  allChannelsResult.power_mW1 = allChannelsResult.busVoltage1 * allChannelsResult.current_mA1;
  allChannelsResult.shuntVoltage2 = this.getshuntVoltage2();
  allChannelsResult.busVoltage2 = this.getbusVoltage2();
  allChannelsResult.current_mA2 = allChannelsResult.shuntVoltage2 / options.shunt2;
  allChannelsResult.power_mW2 = allChannelsResult.busVoltage3 * allChannelsResult.current_mA2;
  allChannelsResult.shuntVoltage3 = this.getshuntVoltage3();
  allChannelsResult.busVoltage3 = this.getbusVoltage3();
  allChannelsResult.current_mA3 = allChannelsResult.shuntVoltage3 / options.shunt3;
  allChannelsResult.power_mW3 = allChannelsResult.busVoltage3 * allChannelsResult.current_mA3;
};

INA3221.prototype.getChannel1 = function () {
  //print("getChannel1");
  this.readChannel1();
  //console.log(JSON.stringify(channelResult));
  return channelResult;
}

INA3221.prototype.getChannel2 = function () {
  this.readChannel2();
  return channelResult;
}

INA3221.prototype.getChannel3 = function () {
  this.readChannel3();
  return channelResult;
}

INA3221.prototype.getAllChannels = function () {
  this.readAllChannels();
  return allChannelsResult;
}

INA3221.prototype.getChannel1String = function () {
  this.readChannel1();
  var bV1 = channelResult.busVoltage.toString();
  var sV1 = channelResult.shuntVoltage.toString();
  var I1 = channelResult.current_mA;
  var P1 = channelResult.power_mW;
  var line1 = "channel 1: bus " + bV1 + " V shunt " + sV1 + " mV current " + I1 + " mA power " + P1 + "mW";
  return line1;
}

INA3221.prototype.getChannel2String = function () {
  this.readChannel2();
  var bV2 = channelResult.busVoltage.toString();
  var sV2 = channelResult.shuntVoltage.toString();
  var I2 = channelResult.current_mA;
  var P2 = channelResult.power_mW;
  var line2 = "channel 2: bus " + bV2 + " V shunt " + sV2 + " mV current " + I2 + " mA power " + P2 + "mW";
  return line2;
}

INA3221.prototype.getChannel3String = function () {
  this.readChannel3();
  var bV3 = channelResult.busVoltage.toString();
  var sV3 = channelResult.shuntVoltage.toString();
  var I3 = channelResult.current_mA;
  var P3 = channelResult.power_mW;
  var line3 = "channel 3: bus " + bV3 + " V shunt " + sV3 + " mV current " + I3 + " mA power " + P3 + "mW";
  return line3;
}


exports = INA3221;
