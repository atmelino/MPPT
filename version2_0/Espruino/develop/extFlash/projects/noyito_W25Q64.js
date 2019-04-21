SPI1.setup({ mosi: B5, miso: B4, sck: B3 });
var myflash = require("W25Q");
var myfl = require("W25Q");
var myflash = new myfl(SPI1, B6/*CS*/);
var myJedec = myflash.getJedec();
//var mydata = Array(256).fill(0);
var mydata = Array(20).fill(0);

function readPage() {
    //for (i = 0; i < 256; i++) {
    for (i = 0; i < 20; i++) {
        myflash.seek(0, i);
        mydata[i] = myflash.read();
    }
    return mydata;
    //console.log("data: " + mydata);
}

console.log("manufacturer ID: " + myJedec.manufacturerId.toString(16));
console.log("      device ID: " + myJedec.deviceId.toString(16));
console.log("capacity: " + myflash.getCapacity());

//console.log("data before read: " + mydata);
console.log("data before erase");
console.log(readPage());

// if (true) {
//     console.log("erase 16 pages at 0");
//     myflash.erase16Pages(0);
// }

// console.log("data after erase");
// console.log(readPage());

// var myarray = [10, 20, 30];
// myflash.writePage(0, myarray);

// console.log("data after write");
// console.log(readPage());

