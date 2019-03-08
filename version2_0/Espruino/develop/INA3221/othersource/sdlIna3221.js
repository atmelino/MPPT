/**
 * This module facilitates communication between a device host running the node.js mraa library
 * (such as an Intel Edison) and a SwitchDocLabs SunAirPlus over i2c. It should also be able
 * to be used for a INA3221 SwitchDoc Labs Breakout Board.
 *
 * Based on the python library at https://github.com/switchdoclabs/SDL_Pi_INA3221
 *
 * @module sdlIna3221
 * @author Tom Luczak
 * @license Apache-2.0
 */

var mraa = require('mraa');

/**
 * SunDocLabs INA3221 object
 * @constructor
 * @param {number} i2cBus - i2c Bus Number
 * @param {number} address - i2c address
 * @param {boolean} [debug] - log reads and writes to console
 * @param {number} [config] - configuration word
 */

exports.SdlIna3221 = function(i2cBus, address, debug, config) {
  this.sdl = new mraa.I2c(i2cBus);
  this.sdl.address(address);
  debug === true ? this.debug = true : this.debug = false;
  this.setConfig(config);
}

/**
 * Write a word of big endian data direct to register
 * @param {number} register - register to write to
 * @param {number} data - word of data
 */

exports.SdlIna3221.prototype.writeRegisterLittleEndian  = function(register, data) {
  var data = data & 0xFFFF;
  var lowbyte = data >> 8;
  var highbyte = (data & 0x00FF) << 8;
  var switchdata = lowbyte + highbyte;
  var x = this.sdl.writeWordReg(register, switchdata);
  if (this.debug)
    console.log('wrote: 0x' + switchdata.toString(16) + ' to 0x' + register.toString(16));
}

/**
 * Read a word of big endian data from register
 * @param {number} register - register to write to
 * @returns {number} - word of data converted to big endian
 */

exports.SdlIna3221.prototype.readRegisterLittleEndian = function(register) {
  var result = this.sdl.readWordReg(register) & 0xFFFF;
  var lowbyte = (result & 0xFF00) >> 8;
  var highbyte = (result & 0x00FF) << 8;
  var ret = lowbyte + highbyte;
  if (this.debug)
    console.log('Read 0x' + ret.toString(16) + ' from 0x' + register.toString(16));
  return ret;
}

/**
 * Read bus voltage from a given channel
 * @param {number} channel - channel to read from
 * @returns {number} - word of data converted to big endian
 */

exports.SdlIna3221.prototype.getBusVoltage_V = function(channel) {
  var raw = this.readRegisterLittleEndian(exports.INA3221_REG_BUSVOLTAGE_1+(channel -1) *2);
  if (raw > 32767) raw -= 65536;
  return raw * 0.001;
}

/**
 * Read solar bus voltage from SunAirPlus
 * @returns {number} - Voltage in Volts
 */

exports.SdlIna3221.prototype.getSolarBusVoltage = function() {
  return this.getBusVoltage_V(exports.SOLAR_CELL_CHANNEL);
}

/**
 * Read lipo bus voltage from SunAirPlus
 * @returns {number} - Voltage in Volts
 */

exports.SdlIna3221.prototype.getLipoBusVoltage = function() {
  return this.getBusVoltage_V(exports.LIPO_BATTERY_CHANNEL);
}

/**
 * Read output bus voltage from SunAirPlus
 * @returns {number} - Voltage in Volts
 */

exports.SdlIna3221.prototype.getOutputBusVoltage = function() {
  return this.getBusVoltage_V(exports.OUTPUT_CHANNEL);
}

/**
 * Read shunt voltage from a given channel
 * @param {number} channel - channel to read from
 * @returns {number} - shunt voltage in mV
 */

exports.SdlIna3221.prototype.getShuntVoltage_mV = function(channel) {
  var raw = this.readRegisterLittleEndian(exports.INA3221_REG_SHUNTVOLTAGE_1+(channel -1) *2);
  if (raw > 32767) raw -= 65536;
  return raw * 0.005;
}

/**
 * Read solar shunt voltage from SunAirPlus
 * @returns {number} - shunt voltage in mV
 */

exports.SdlIna3221.prototype.getSolarShuntVoltage = function() {
  return this.getShuntVoltage_mV(exports.SOLAR_CELL_CHANNEL);
}

/**
 * Read lipo shunt voltage from SunAirPlus
 * @returns {number} - shunt voltage in mV
 */

exports.SdlIna3221.prototype.getLipoShuntVoltage = function() {
  return this.getShuntVoltage_mV(exports.LIPO_BATTERY_CHANNEL);
}

/**
 * Read output shunt voltage from SunAirPlus
 * @returns {number} - shunt voltage in mV
 */

exports.SdlIna3221.prototype.getOutputShuntVoltage = function() {
  return this.getShuntVoltage_mV(exports.OUTPUT_CHANNEL);
}

/**
 * Read current from a given channel
 * @param {number} channel - channel to read from
 * @returns {number} - current in mV
 */

exports.SdlIna3221.prototype.getCurrent_mA = function(channel) {
  return this.getShuntVoltage_mV(channel) / exports.SHUNT_RESISTOR_VALUE;
}

/**
 * Read solar current from SunAirPlus
 * @returns {number} - current in mA
 */

exports.SdlIna3221.prototype.getSolarCurrent = function() {
  return this.getCurrent_mA(exports.SOLAR_CELL_CHANNEL);
}

/**
 * Read lipo current from SunAirPlus
 * @returns {number} - current in mA
 */

exports.SdlIna3221.prototype.getLipoCurrent = function() {
  return this.getCurrent_mA(exports.LIPO_BATTERY_CHANNEL);
}

/**
 * Read output current from SunAirPlus
 * @returns {number} - current in mA
 */

exports.SdlIna3221.prototype.getOutputCurrent = function() {
  return this.getCurrent_mA(exports.OUTPUT_CHANNEL);
}

/**
 * Sets and writes configuration
 * @param {number} [config] - configuration word
 */

exports.SdlIna3221.prototype.setConfig = function(config) {
  if (config !== undefined){
    var cnf = config;
  } else {
    var cnf = exports.INA3221_CONFIG_ENABLE_CHAN1 |
              exports.INA3221_CONFIG_ENABLE_CHAN2 |
              exports.INA3221_CONFIG_ENABLE_CHAN3 |
              exports.INA3221_CONFIG_AVG1 |
              exports.INA3221_CONFIG_VBUS_CT2 |
              exports.INA3221_CONFIG_VSH_CT2 |
              exports.INA3221_CONFIG_MODE_2 |
              exports.INA3221_CONFIG_MODE_1 |
              exports.INA3221_CONFIG_MODE_0;
  }
  this.writeRegisterLittleEndian(exports.INA3221_REG_CONFIG, cnf);
}

/** @constant
 *  @type {number}
 *  @default 0x40
 */

exports.INA3221_ADDRESS      = 0x40;

/** @constant
 *  @type {number}
 *  @default 0x01
 */

exports.INA3221_READ         = 0x01;

/** @constant
 *  @type {number}
 *  @default 0x00
 */

exports.INA3221_REG_CONFIG   = 0x00;

/** @constant
 *  @type {number}
 *  @default 0x8000
 */

exports.INA3221_CONFIG_RESET = 0x8000;

/** @constant
 *  @type {number}
 *  @default 0x4000
 */

exports.INA3221_CONFIG_ENABLE_CHAN1 = 0x4000;

/** @constant
 *  @type {number}
 *  @default 0x2000
 */

exports.INA3221_CONFIG_ENABLE_CHAN2 = 0x2000;

/** @constant
 *  @type {number}
 *  @default 0x1000
 */

exports.INA3221_CONFIG_ENABLE_CHAN3 = 0x1000;

/** @constant
 *  @type {number}
 *  @default 0x0800
 */

exports.INA3221_CONFIG_AVG2 = 0x0800;

/** @constant
 *  @type {number}
 *  @default 0x0400
 */

exports.INA3221_CONFIG_AVG1 = 0x0400;

/** @constant
 *  @type {number}
 *  @default 0x0200
 */

exports.INA3221_CONFIG_AVG0 = 0x0200;

/** @constant
 *  @type {number}
 *  @default 0x0100
 */

exports.INA3221_CONFIG_VBUS_CT2 = 0x0100;

/** @constant
 *  @type {number}
 *  @default 0x0080
 */

exports.INA3221_CONFIG_VBUS_CT1 = 0x0080;

/** @constant
 *  @type {number}
 *  @default 0x0040
 */

exports.INA3221_CONFIG_VBUS_CT0 = 0x0040;

/** @constant
 *  @type {number}
 *  @default 0x0020
 */

exports.INA3221_CONFIG_VSH_CT2 = 0x0020;

/** @constant
 *  @type {number}
 *  @default 0x0010
 */

exports.INA3221_CONFIG_VSH_CT1 = 0x0010;

/** @constant
 *  @type {number}
 *  @default 0x0008
 */

exports.INA3221_CONFIG_VSH_CT0 = 0x0008;

/** @constant
 *  @type {number}
 *  @default 0x0004
 */

exports.INA3221_CONFIG_MODE_2 = 0x0004;

/** @constant
 *  @type {number}
 *  @default 0x0002
 */

exports.INA3221_CONFIG_MODE_1 = 0x0002;

/** @constant
 *  @type {number}
 *  @default 0x0001
 */

exports.INA3221_CONFIG_MODE_0 = 0x0001;

/** @constant
 *  @type {number}
 *  @default 0x01
 */

exports.INA3221_REG_SHUNTVOLTAGE_1 = 0x01;

/** @constant
 *  @type {number}
 *  @default 0x02
 */

exports.INA3221_REG_BUSVOLTAGE_1   = 0x02;

/** @constant
 *  @type {number}
 *  @default 0.1
 */

exports.SHUNT_RESISTOR_VALUE = 0.1;

/** @constant
 *  @type {number}
 *  @default 1
 */

exports.LIPO_BATTERY_CHANNEL = 1;

/** @constant
 *  @type {number}
 *  @default 2
 */

exports.SOLAR_CELL_CHANNEL   = 2;

/** @constant
 *  @type {number}
 *  @default 3
 */

exports.OUTPUT_CHANNEL       = 3;
