//var webpage = require("webpageShort");
//var webpage = require("index.html");
var webpage = require("indexShort.html");
var mypage = new webpage();
var myfl = require("W25Q");
var myflash = new myfl(SPI1, B6 /*CS*/);

SPI1.setup({
    mosi: B5,
    miso: B4,
    sck: B3
});

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


var myhtml = mypage.gethtml();
console.log(myhtml.length);
console.log(myhtml);
var myhtml2 = myhtml.replace(/\s\s+/g, ' ');
console.log(myhtml2.length);
console.log(myhtml2);

var page1=myhtml2.substring(0, 256);
var page2=myhtml2.substring(256, 512);
console.log(page1.length);
console.log(page1);
console.log(page2.length);
console.log(page2);



function start() {
    var firstpage = 112;
    console.log();
    showPage(firstpage);
    showPage(firstpage + 1);

    if (true) {
        console.log("erase 16 pages at "+firstpage);
        myflash.erase16Pages(firstpage);
    }
    showPage(firstpage);
    showPage(firstpage+1);

    console.log("write html");
    myflash.writePage(firstpage, page1);
    myflash.writePage(firstpage+1, page2);
    showPage(firstpage);
    showPage(firstpage+1);


}
