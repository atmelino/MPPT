//var webpage = require("webpageShort");
var webpage = require("index.html");
//var webpage = require("indexShort.html");
var mypage = new webpage();
var myfl = require("W25Q");
var myflash = new myfl(SPI1, B6 /*CS*/ );
var myut = require("utils");
var myutils = new myut();

SPI1.setup({
    mosi: B5,
    miso: B4,
    sck: B3
});

function showPage(number) {
    console.log("page " + number + ":");
    console.log(myutils.hexdump(myflash.readPage(number), 16));
}

//var myhtml = mypage.gethtml();
//console.log(myhtml.length);
//console.log(myhtml);
var myhtml2 = mypage.gethtml().replace(/\s\s+/g, ' ');
console.log(myhtml2.length);
console.log(myhtml2);
var pagesneeded = Math.floor(myhtml2.length / 256) + 1;
var pagesToErase = Math.floor(pagesneeded / 16) + 1;
var bytesneeded = pagesneeded * 256;
console.log("pages needed " + pagesneeded);


var test = true;


function start() {
    var firstpage = 112;

    if (!test) {
        console.log("erase 16 pages at " + firstpage);
        myflash.erase16Pages(firstpage);
    }

    for (var index = 0; index < bytesneeded; index += 256) {
        var page = myhtml2.substring(index, index + 256);
        console.log("length " + page.length);
        console.log(page);
        if (!test) {
            console.log("write html");
            myflash.writePage(firstpage, page1);
            myflash.writePage(firstpage + 1, page2);
        }

    }


    console.log();
    showPage(firstpage);
    showPage(firstpage + 1);

}