var myfl = require("W25Q");
var myflash = new myfl(SPI1, B6 /*CS*/);

SPI1.setup({
    mosi: B5,
    miso: B4,
    sck: B3
});

var myJedec = myflash.getJedec();
console.log("manufacturer ID: " + myJedec.manufacturerId.toString(16));
console.log("      device ID: " + myJedec.deviceId.toString(16));
console.log("capacity: " + myflash.getCapacity());

function hexdump(buffer, blockSize) {
    var lines = [];
    blockSize = blockSize || 16;
    var myblock = new Uint8Array(blockSize);
    var hex = "0123456789ABCDEF";
    for (var b = 0; b < buffer.length; b += blockSize) {
        var addr = ("0000" + b.toString(16)).slice(-4);
        var codes = "";
        for (i = 0; i < myblock.length; i++) {
            myblock[i] = buffer[i + b];
            codes += ("0" + myblock[i].toString(16)).slice(-2) + " ";
        }
        var chars = "";
        for (i = 0; i < myblock.length; i++) {
            if (myblock[i] < 32 || myblock[i] > 127)
                myblock[i] = 46;
            chars += String.fromCharCode(myblock[i]);
        }
        lines.push(addr + " " + codes + "  " + chars);
    }
    return lines.join("\n");
}

function showPage(number) {
    console.log("page " + number + ":");
    console.log(hexdump(myflash.readPage(number), 16));
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


