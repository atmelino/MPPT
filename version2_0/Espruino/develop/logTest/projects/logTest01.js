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
i2c.setup({ sda: B9, scl: B8 });
var RTC = require("DS1307");
var rtc = new RTC(i2c, {
    address: 0x68
});
//var pages = [];
var pages = "";


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

    currentDate = rtc.readDateTime();
    currentDateString = rtc.dateTimeToString(currentDate);
    console.log("currentDate: " + currentDateString);

    for (var logpage = startPage; logpage < startPage + 16; logpage++) {
        var page = myflash.readPageString(logpage);
        //pages.push(page);
        pages += page;
    }

    var logLine = currentDateString + " " + logEntry + "\n" + "endlog\n";

    var newpages = pages.replace("endlog\n", logLine);


    console.log("new line\n");
    console.log(pages);
    console.log(newpages);


    // for (var p = 0; p < 16; p++) {
    //     console.log("log page: " + p);
    //     console.log(pages[p]);
    // }


    //var lines = pages[0].split('\n');
    // console.log(lines);
    // var a = lines.indexOf("endlog");
    // console.log(a);

    // lines[a] = logLine;
    // lines[a + 1] = "endlog\n";
    // console.log(lines);

    // pages[0] = lines.join('');

    console.log(pages[0]);

    if (actuallyDoErase) {
        console.log("erase 16 pages at " + startPage);
        myflash.erase16Pages(startPage);
    }

    if (actuallyDoWrite) {
        console.log("write html");
        myflash.writePage(16, pages[0]);
    }

}


function start() {
    startPage = 16;

    showFlashType();

    //showPages(15, 18);
    //showPages(15, 3);

    var logEntry = "system start ";
    newLogEntry(logEntry, false, false);
    //newLogEntry(logEntry,false, true);
    //newLogEntry(logEntry, true, true);

    //showPages(15, 18);
    //showPages(15, 3);

}


setTimeout(function () {
    start();
}, (1000));
