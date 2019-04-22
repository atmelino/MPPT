var myfs = require("fs");
var webpage = require("webpageShort");
var mypage = new webpage();
var myfl = require("W25Q");
var myflash = new myfl(SPI1, B6 /*CS*/);

SPI1.setup({
    mosi: B5,
    miso: B4,
    sck: B3
});


var myhtml = mypage.gethtml();
console.log(mypage.gethtml());





function readPage(page) {
    var x = new Uint8Array(256);
    for (i = 0; i < 256; i++) {
        myflash.seek(page, i);
        x[i] = myflash.read();
        //myflash.waitReady();
    }
    return x;
}


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
    console.log(hexdump(readPage(number), 16));
}

function start() {

    console.log();

    showPage(190);

    if (true) {
        console.log("erase 16 pages at 190");
        myflash.erase16Pages(190);
    }

    showPage(190);


    console.log("write html");
    myflash.writePage(190, myhtml);

    showPage(190);

}
