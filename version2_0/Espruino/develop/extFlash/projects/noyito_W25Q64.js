var myfl = require("W25Q");
var myflash = new myfl(SPI1, B6 /*CS*/);
var myut = require("utils");
var myutils = new myut();

SPI1.setup({
    mosi: B5,
    miso: B4,
    sck: B3
});

var myJedec = myflash.getJedec();
console.log("manufacturer ID: " + myJedec.manufacturerId.toString(16));
console.log("      device ID: " + myJedec.deviceId.toString(16));
console.log("capacity: " + myflash.getCapacity());


function showPages(start, number) {
    for (var index = start; index < start + number; index++) {
        console.log("page " + index + ":");
        console.log(myutils.hexdump(myflash.readPage(index), 16));
        //console.log(myflash.readPage(index), 16);
    }
}

function readPages(start, number) {
    for (var index = start; index < start + number; index++) {
        //console.log("page " + index + ":");
        myflash.readPage(index);
    }
}

function readPagesOld(start, number) {
    for (var index = start; index < start + number; index++) {
        //console.log("page " + index + ":");
        myflash.readPageOld(index);
    }
}


function start() {
    console.log();

    // performance test
    var start, end;

    var writePageTest = false;
    if (writePageTest) {
        var page = 345;
        showPages(page, 1);
        const uint8 = new Uint8Array(256);
        //console.log("buffer to write:");
        //console.log(myutils.hexdump(uint8, 16));

        uint8.fill(101, 0, 256);        //(value, start position, end position);
        myflash.erase16Pages(page);
        start = new Date();
        myflash.writePageOld(page, uint8);
        end = new Date();
        console.log("old: " + (end - start));
        showPages(page, 1);

        uint8.fill(102, 0, 256);        //(value, start position, end position);
        myflash.erase16Pages(page);
        start = new Date();
        myflash.writePage(page, uint8);
        end = new Date();
        console.log("new: " + (end - start));
        showPages(page, 1);
    }

    var readPageTest = false;
    if (readPageTest) {
        start = new Date();
        readPagesOld(111, 60);
        end = new Date();
        console.log("old: " + (end - start));

        start = new Date();
        readPages(111, 60);
        end = new Date();
        console.log("new: " + (end - start));
    }

    var writeSectorTest = true;
    if (writeSectorTest) {
        var startPage = 400;

        console.log("write sector test");

        console.log("before:");
        showPages(startPage - 1, 18);
        const uint8 = new Uint8Array(16 * 256);

        uint8.fill(107, 0, 16 * 256);        //(value, start position, end position);
        console.log("erase 16 pages at " + startPage);
        myflash.erase16Pages(startPage);
        start = new Date();
        myflash.writeSectorOld(startPage, uint8);
        end = new Date();
        console.log("old: " + (end - start));
        console.log("after old:");
        showPages(startPage - 1, 18);

        uint8.fill(102, 0, 16 * 256);        //(value, start position, end position);
        console.log("erase 16 pages at " + startPage);
        myflash.erase16Pages(startPage);
        start = new Date();
        myflash.writeSector(startPage, uint8);
        end = new Date();
        console.log("new: " + (end - start));
        console.log("after new:");
        showPages(startPage - 1, 18);

        //console.log(uint8);
        //console.log(myutils.hexdump(uint8, 16));

    }
    console.log();

}


setTimeout(function () {
    start();
}, (1000));