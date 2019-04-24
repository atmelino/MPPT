var myfl = require("W25Q");
var myflash = new myfl(SPI1, B6 /*CS*/);
var myut=require("utils");
var myutils=new myut();

SPI1.setup({
    mosi: B5,
    miso: B4,
    sck: B3
});

var myJedec = myflash.getJedec();
console.log("manufacturer ID: " + myJedec.manufacturerId.toString(16));
console.log("      device ID: " + myJedec.deviceId.toString(16));
console.log("capacity: " + myflash.getCapacity());


function showPage(number) {
    console.log("page " + number + ":");
    console.log(myutils.hexdump(myflash.readPage(number), 16));
}

function start() {

    console.log();

    //console.log("data before erase");
    for (page = 190; page < 210; page++) {
        showPage(page);
    }

    // if (true) {
    //     console.log("erase 16 pages at 202");
    //     myflash.erase16Pages(202);
    // }

    // console.log("data after erase");
    // for (page = 190; page < 210; page++) {
    //     showPage(page);
    // }

}


// var myarray = [10, 20, 30];
// myflash.writePage(0, myarray);


