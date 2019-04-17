var myfs = require("fs");
var webpage = require("index.html");
var mypage = new webpage();


SPI1.setup({
    mosi: B5,
    miso: B4,
    sck: B3
});
E.connectSDCard(SPI1, B6 /*CS*/ );

// create folder if it doesn't exist
if (true) {
    // html
    rootDir = myfs.readdirSync();
    if (rootDir.indexOf('html') < 0) {
        myfs.mkdirSync('html');
    }
}

var fullPath = 'html/index.html';
console.log('full path: ' + fullPath);
dataFile = E.openFile(fullPath, "a");
dataFile.write(mypage.gethtml());
dataFile.close();
console.log('file ' + fullPath + 'written');