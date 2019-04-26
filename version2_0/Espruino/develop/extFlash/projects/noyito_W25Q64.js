var myfl = require("W25Q");
var myflash = new myfl(SPI1, B6 /*CS*/ );
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

function start() {
    console.log();
    showPages(111, 6);

    //console.log("data before erase");
}


setTimeout(function () {
    start();
}, (1000));