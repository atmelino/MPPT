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
var pages = [];
//var pages = "";
var startPage = 16;
var pfound;
var ifound;

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

function replaceAt(original, index, replacement) {
    // console.log("original \n" + original);
    // console.log("index " + index);
    // console.log("replacement " + replacement);

    return original.substr(0, index) + replacement + original.substr(index + replacement.length);
}

function newLogEntry(logEntry, actuallyDoErase, actuallyDoWrite) {
    currentDate = rtc.readDateTime();
    currentDateString = rtc.dateTimeToString(currentDate);

    console.log("reading pages");
    for (var p = startPage; p < startPage + 16; p++) {
        var page = myflash.readPageString(p);
        console.log("page " + p);
        console.log(page);
        pages.push(page);
        //pages += page;
        found = page.indexOf("endlog");
        if (found > 0) {
            ifound = found;
            pfound = p;
            console.log("endlog found in page " + pfound + " at position " + ifound);
        }
    }

    //console.log("currentDate: " + currentDateString);
    var logLine = currentDateString + " " + logEntry + "\n" + "endlog\n";
    console.log("endlog found in page " + pfound + " at position " + ifound);

    var newpage = replaceAt(pages[pfound - startPage], ifound, logLine);
    console.log("original page:\n" + pages[pfound - startPage]);
    console.log("new page:\n" + newpage);





    // var newpages = pages.replace("endlog\n", logLine);
    // console.log("new line\n");
    // console.log(pages);
    // console.log(newpages);


    // for (var p = 0; p < 16; p++) {
    //     console.log("log page: " + p);
    //     console.log(pages[p]);
    // }



    //console.log(pages[0]);

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

    showFlashType();

    //showPages(15, 18);
    //showPages(15, 3);

    var logEntry = "system start ";
    //    newLogEntry(logEntry, false, false);
    //newLogEntry(logEntry,false, true);
    //newLogEntry(logEntry, true, true);

    //showPages(15, 18);
    //showPages(15, 3);


    var mysector = myflash.readSector(1);
    //console.log(mysector);
    console.log(myutils.hexdump(mysector, 16));

    //const uint8 = new Uint8Array(16 * 256);
    // (value, start position, end position);
    //uint8.fill(100, 0, 16 * 256);

    //console.log(uint8);
    //console.log(myutils.hexdump(uint8, 16));

    console.log("before:");
    showPages(15, 18);
    myflash.erase16Pages(startPage);
    myflash.writeSector(startPage, mysector);
    console.log("after:");
    showPages(15, 18);

}


setTimeout(function () {
    start();
}, (1000));
