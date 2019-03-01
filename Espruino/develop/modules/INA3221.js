/* Copyright (c) 2019 Tobias Berthold. See the file LICENSE for copying permission. */
/*
Driver for the TI INA3221 chip. This chip allows voltage and current measurement for 
three separate channels.
Usage:
ina3221=require('INA3221.js');
result=ina3221.readChannel1();
*/

var C = {
  MY: 0x001, // description
  PRIVATE: 0x001, // description
  CONSTANTS: 0x00423 // description
};

function INA3221(address) {
  this.options.address = address || 0x40; // default address if A0/A1 are GND
}

/** 'public' constants here */
INA3221.prototype.C = {
  MY: 0x013, // description
  PUBLIC: 0x0541, // description
  CONSTANTS: 0x023 // description
};

options = {
  address: 0x40,
  shunt1: 0.1,
  shunt2: 0.1,
  shunt3: 0.1
};

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

// Setup I2C
var i2c = new I2C();
i2c.setup({ sda: B4, scl: B3 });
addr = 0x40;

function readWord(register) {
  i2c.writeTo(options.address, 0x06);
  i2c.writeTo(options.address, register);
  var dbytes = i2c.readFrom(options.address, 2);
  var dword = dbytes[1] | (dbytes[0] << 8);
  if (dword > 32767) dword -= 65536;

  //var line = dbytes[0].toString(16) + dbytes[1].toString(16) + " " + dword.toString(16);
  //print(line);

  return dword;
}

function getShuntVoltage1() {
  return readWord(0x01) * 0.005;
}

function getBusVoltage1() {
  return readWord(0x02) * 0.001;
}

function getShuntVoltage2() {
  return readWord(0x03) * 0.005;
}

function getBusVoltage2() {
  return readWord(0x04) * 0.001;
}

function getShuntVoltage3() {
  return readWord(0x05) * 0.005;
}

function getBusVoltage3() {
  return readWord(0x06) * 0.001;
}

export function readChannel1() {
  result.shuntVoltage1 = getShuntVoltage1();
  result.busVoltage1 = getBusVoltage1();
  result.current_mA1 = result.shuntVoltage1 / options.shunt1;
  return result;
}

export function readChannel2() {
  result.shuntVoltage2 = getShuntVoltage2();
  result.busVoltage2 = getBusVoltage2();
  result.current_mA2 = result.shuntVoltage2 / options.shunt2;
  return result;
}

exports = INA3221;
