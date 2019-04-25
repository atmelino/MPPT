//var webpage = require("webpageShort");
//var webpage = require("index.html");
//var webpage = require("indexShort.html");
//var mypage;
var myfl = require("W25Q");
var myflash = new myfl(SPI1, B6 /*CS*/);
var myut = require("utils");
var myutils = new myut();

SPI1.setup({
    mosi: B5,
    miso: B4,
    sck: B3
});


function showFlashType() {
    var myJedec = myflash.getJedec();
    console.log("manufacturer ID: " + myJedec.manufacturerId.toString(16));
    console.log("      device ID: " + myJedec.deviceId.toString(16));
    console.log("capacity: " + myflash.getCapacity());
}

function showPagesCombined(start, number) { // uses lots of memory
    var output;
    for (var index = start; index < start + number; index++) {
        console.log(index);
        output += "page " + index + ":\n";
        output += myutils.hexdump(myflash.readPage(index), 16);
        output += "\n";
    }
    console.log("\n");
    console.log(output);
}

function showPages(start, number) {
    for (var index = start; index < start + number; index++) {
        console.log(index);
        console.log("page " + index + ":");
        console.log(myutils.hexdump(myflash.readPage(index), 16));
    }
}

function readHTML() {
    var webpage = require("index.html");
    var mypage = new webpage();
    var myhtml = mypage.gethtml().replace(/ +/g, ' ');
    return myhtml;
}


function writeHTML(myHTML, startPage, numberOfPages, actuallyDoErase, actuallyDoWrite) {

    sectorsToErase = Math.floor(numberOfPages / 16) + 1;
    console.log("sectors To Erase : " + sectorsToErase);

    for (var i = 0; i < sectorsToErase; i++) {
        var erasePage = startPage + i * 16;
        console.log("erase 16 pages at " + erasePage);
        if (actuallyDoErase)
            myflash.erase16Pages(erasePage);
    }

    for (var p = 0; p < numberOfPages; p++) {
        pageToWriteTo = startPage + p;
        var startindex = p * 256;
        var endindex = startindex + 256;
        var pageContent = myHTML.substring(startindex, endindex);
        console.log("write to page " + pageToWriteTo);
        //console.log(pageContent);
        if (actuallyDoWrite) {
            console.log("write html");
            myflash.writePage(pageToWriteTo, pageContent);
        }
    }
}

function start() {
    showFlashType();

    console.log("Reading HTML..");
    var myHTML = readHTML();
    HTMLbytes = myHTML.length;
    console.log(myHTML);
    console.log(HTMLbytes + " bytes");
    numberOfPages = Math.floor(HTMLbytes / 256) + 1;
    console.log("number of pages to write : " + numberOfPages);


    var startHTMLpage = 112;
    //writeHTML(myHTML, startHTMLpage, numberOfPages, false, false);
    writeHTML(myHTML, startHTMLpage, numberOfPages, true, true);


    //showPages(111, 50);
    //showPages(111, 6);

}

setTimeout(function () {
    start();
}, (1000));