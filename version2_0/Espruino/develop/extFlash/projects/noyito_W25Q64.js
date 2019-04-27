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
    //showPages(111, 60);

    // performance test
    var start, end;

    start = new Date();
    readPagesOld(111, 60);
    end = new Date();
    console.log("old: " + (end - start));

    start = new Date();
    readPages(111, 60);
    end = new Date();
    console.log("new: " + (end - start));


    var sectorTest=false;
    if (sectorTest) {
        var startPage = 16;
        console.log("before:");
        showPages(15, 18);
        console.log("erase 16 pages at " + startPage);
        myflash.erase16Pages(startPage);
        console.log("write sector");
        const uint8 = new Uint8Array(16 * 256);
        //(value, start position, end position);
        uint8.fill(100, 0, 16 * 256);
        console.log(uint8);
        console.log(myutils.hexdump(uint8, 16));
        myflash.writeSector(startPage, uint8);
        console.log("after:");
        showPages(15, 18);
    }

}


setTimeout(function () {
    start();
}, (1000));