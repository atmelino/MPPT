var myut = require("utils");
var myutils = new myut();
var myfl = require("W25Q");
var myflash = new myfl(SPI1, B6 /*CS*/);
SPI1.setup({
    mosi: B5,
    miso: B4,
    sck: B3
});
var i2c = new I2C();
i2c.setup({
    sda: B9,
    scl: B8
});
var RTC = require("DS1307");
var rtc = new RTC(i2c, {
    address: 0x68
});
var startPage = 16;

function showFlashType() {
    var myJedec = myflash.getJedec();
    console.log("manufacturer ID: " + myJedec.manufacturerId.toString(16));
    console.log("      device ID: " + myJedec.deviceId.toString(16));
    console.log("capacity: " + myflash.getCapacity());
}

function showPages(start, number) {
    for (var index = start; index < start + number; index++) {
        //console.log(index);
        console.log("page " + index + ":");
        console.log(myutils.hexdump(myflash.readPage(index), 16));
    }
}

function newLogEntry(logEntry, actuallyDoErase, actuallyDoWrite) {

    // read sector
    console.log("reading sector");
    var mysector = myflash.readSector(1);
    //console.log(mysector);
    //console.log(myutils.hexdump(mysector, 16));
    // console.log("original sector in memory");
    // console.log(myutils.hexdump(mysector.slice(0, 32 * 10), 16));

    //modify sector
    if (mysector[0] != 123) { //initialize root
        logpos = {
            name: "logpos",
            pos: 0
        };
    } else { // update root
        var str = "";
        for (var i = 0; i < 32; i++) {
            str += String.fromCharCode(parseInt(mysector[i]));
        }
        logpos = JSON.parse(str);
    }
    console.log(logpos);

    // circular log
    if (logpos.pos > 126) {
        logpos.pos = 1;
    } else {
        logpos.pos += 1;
    }

    //logpos.pos = 120;

    console.log(logpos);
    rootentry = JSON.stringify(logpos);
    for (let i = 0; i < 32; i++) {
        if (i < rootentry.length)
            mysector[i] = rootentry.charCodeAt(i);
        else
            mysector[i] = 32;
    }
    currentDate = rtc.readDateTime();
    currentDateString = rtc.dateTimeToString(currentDate);
    var logLine = currentDateString + " " + logEntry + "\n" + "endlog\n";

    var index = logpos.pos * 32;
    for (let i = 0; i < 32; i++)
        mysector[index + i] = logLine.charCodeAt(i);


    // console.log("modified sector in memory");
    //console.log(myutils.hexdump(mysector, 16));
    // console.log(myutils.hexdump(mysector.slice(0, 32 * 10), 16));

    // write sector
    if (actuallyDoErase) {
        console.log("erase 16 pages at " + startPage);
        myflash.erase16Pages(startPage);
    }

    if (actuallyDoWrite) {
        console.log("write sector");
        myflash.writeSector(startPage, mysector);
    }

}

function readLog() {
    var mysector = myflash.readSector(1);
    //   return mysector;
    var str = "";
    for (var i = 0; i < mysector.length; i++) {
        str += String.fromCharCode(parseInt(mysector[i]));
    }
    return str;
}

function start() {
    // performance test
    var start, end;

    // showFlashType();
    console.log("before:");
    //showPages(15, 3);
    //showPages(15, 18);
    showPages(16, 1);
    showPages(31, 1);

    start = new Date();
    var logEntry = "system start ";
    //newLogEntry(logEntry, false, false);
    //newLogEntry(logEntry,false, true);
    newLogEntry(logEntry, true, true);
    end = new Date();
    console.log("duration: " + (end - start));

    console.log("after:");
    //showPages(15, 3);
    //showPages(15, 18);
    showPages(16, 1);
    showPages(30, 2);
}


setTimeout(function () {
    start();
}, (1000));