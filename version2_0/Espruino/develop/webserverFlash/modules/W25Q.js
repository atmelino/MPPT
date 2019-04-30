/* Copyright (c) 2015 Dennis Bemmann. See the file LICENSE for copying permission. */
/*
W25Q.js
========

Driver for Winbond 25Q series SPI Flash RAM
Tested with W25Q80BV, http://www.adafruit.com/datasheets/W25Q80BV.pdf

Still under development, so no documentation yet
*/

function W25Q(spi, csPin) {
  this.spi = spi;
  this.csPin = csPin;
}

W25Q.prototype.seek = function (pageNumber, offset) {
  // seeks to an address for sequential reading
  this.command(0x03);
  this.setAddress(pageNumber, offset);
  // stays selected until client finishes reading
};

W25Q.prototype.read = function () {
  // reads a byte
  return this.spi.send(0);
};

W25Q.prototype.waitReady = function () {
  // waits until chip is ready
  this.command(0x05);
  while (this.read() & 1);
  digitalWrite(this.csPin, 1);
};

W25Q.prototype.eraseChip = function () {
  // overwrite whole chip with 0xFF
  this.command(0x06);
  this.command(0xC7);
  this.waitReady();
};

W25Q.prototype.erase16Pages = function (pageNumber) {
  // overwrite 16 pages (of 256 bytes each) with 0xFF
  this.command(0x06);
  this.command(0x20);
  this.setAddress(pageNumber, 0);
  this.waitReady();
};

W25Q.prototype.writePageOld = function (pageNumber, arrayBuffer) {
  // overwrites a page (256 bytes)
  // that memory MUST be erased first
  this.startWrite(pageNumber, 0);
  for (var i = 0; i < arrayBuffer.length; i++)
    this.write(arrayBuffer[i]);
  this.finish();
};

W25Q.prototype.writePage = function (pageNumber, arrayBuffer) {
  // overwrites a page (256 bytes)
  // that memory MUST be erased first
  //console.log(arrayBuffer);
  this.startWrite(pageNumber, 0);
  this.spi.write(arrayBuffer);
  this.finish();
};

W25Q.prototype.writePageFillSpace = function (pageNumber, arrayBuffer) {
  // overwrites a page (256 bytes)
  // that memory MUST be erased first
  this.startWrite(pageNumber, 0);
  // for (var i = 0; i < arrayBuffer.length; i++) 
  // this.write(arrayBuffer[i]);
  for (var i = 0; i < 256; i++) {
    if (i < arrayBuffer.length)
      this.write(arrayBuffer[i]);
    else
      this.write(' ');
  }
  this.finish();
};

W25Q.prototype.writeSectorOld = function (pageNumber, arrayBuffer) {
  // overwrites a sector (256*16 bytes)
  // that memory MUST be erased first
  // todo: check if arrayBuffer has 256*16 bytes
  //console.log("writeSector length in bytes " + arrayBuffer.length)
  for (p = 0; p < 16; p++) {
    pageStart = p * 256;
    pageToWrite = pageNumber + p;
    //console.log("pageToWrite " + pageToWrite);
    this.startWrite(pageToWrite, 0);
    for (var i = 0; i < 256; i++) {
      //console.log("byte written " + arrayBuffer[pageStart + i]);
      this.write(arrayBuffer[pageStart + i]);
    }
    this.finish();
  }
};

W25Q.prototype.writeSector = function (pageNumber, arrayBuffer) {
  // overwrites a sector (256*16 bytes)
  // that memory MUST be erased first
  // todo: deal with too few bytes in arrayBuffer
  //console.log("writeSector length in bytes " + arrayBuffer.length)
  //console.log("arrayBuffer " + arrayBuffer);
  for (p = 0; p < 16; p++) {
    pageToWrite = pageNumber + p;
    pageStart = p * 256;
    pageEnd = pageStart + 256;
    page = arrayBuffer.slice(pageStart, pageEnd);
    // console.log("pageToWrite " + pageToWrite);
    // console.log("page " + page);
    this.startWrite(pageToWrite, 0);
    this.spi.write(page);
    this.finish();
  }
};

W25Q.prototype.startWrite = function (pageNumber, offset) {
  // seeks to address for sequential overwriting of memory
  // that memory MUST be erased first!
  // to end the operation, call finish
  this.command(0x06);
  this.command(0x02);
  this.setAddress(pageNumber, offset);
};

W25Q.prototype.send = function (data) {
  // sends data and returns result
  return this.spi.send(data);
};

W25Q.prototype.write = function (data) {
  // writes data without returning result
  this.spi.write(data);
};

W25Q.prototype.finish = function () {
  // ends current operation, for example a sequential write
  digitalWrite(this.csPin, 1);
  this.waitReady();
};

W25Q.prototype.getJedec = function () {
  // gets chips's JEDEC information
  this.command([0x90, 0, 0, 0]);
  var res = {};
  res.manufacturerId = this.read();
  res.deviceId = this.read();
  digitalWrite(this.csPin, 1);
  return res;
};

W25Q.prototype.getCapacity = function () {
  // gets chip's capacity
  this.command(0x9f);
  this.read();
  var cap = this.read() * 16384;
  digitalWrite(this.csPin, 1);
  return cap;
};

W25Q.prototype.command = function (cmd) {
  // for internal use only
  digitalWrite(this.csPin, 1);
  digitalWrite(this.csPin, 0);
  this.spi.write(cmd);
};

W25Q.prototype.setAddress = function (pageNumber, offset) {
  // for internal use only
  this.spi.write([
    (pageNumber >> 8) & 0xFF,
    (pageNumber >> 0) & 0xFF,
    (offset >> 0) & 0xFF
  ]);
};

W25Q.prototype.readPageOld = function (page) {
  var x = new Uint8Array(256);
  this.seek(page, 0);
  for (i = 0; i < 256; i++) {
    x[i] = this.spi.send(0);
  }
  return x;
}

W25Q.prototype.readPage = function (pageNumber) {
  this.seek(pageNumber, 0);
  return this.spi.send({ data: 0, count: 256 });
}

W25Q.prototype.readSector = function (sector) {
  var pageNumber = sector * 16;
  this.seek(pageNumber, 0);
  return this.spi.send({ data: 0, count: 256 * 16 });
}

W25Q.prototype.readPageString = function (page) {
  var x = "";
  this.seek(page, 0);
  for (i = 0; i < 256; i++) {
    x += String.fromCharCode(this.spi.send(0));
  }
  return x;
}

exports.connect = function (spi, csPin) {
  var flash = new W25Q(spi, csPin);
  jedec = flash.getJedec();
  if ((jedec.manufacturerId != 0xEF) || (jedec.deviceId != 0x13)) flash = null;
  return flash;
};

exports = W25Q;