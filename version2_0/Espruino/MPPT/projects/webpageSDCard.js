var myfs = require("fs");
var webpage = require("index.html");
var mypage = new webpage();
//console.log(mypage.gethtml());

SPI1.setup({ mosi: B5, miso: B4, sck: B3 });
E.connectSDCard(SPI1, B6 /*CS*/);

// create html folder if it doesn't exist
rootDir = myfs.readdirSync();
if (rootDir.indexOf('html') < 0) {
    myfs.mkdirSync('html');
}

// write web site code to SD card
var fullPath = '/html/index.html';
console.log('full path: ' + fullPath);
dataFile = E.openFile(fullPath, "w");
dataFile.write(mypage.gethtml());
dataFile.close();
console.log('file ' + fullPath + ' written');
console.log(myfs.readdirSync('html'));

console.log('unmount SD card');
E.unmountSD();

// read index.html
// SPI1.setup({ mosi: B5, miso: B4, sck: B3 });
// E.connectSDCard(SPI1, B6 /*CS*/);
// console.log('content of file:');
// var fileContent = myfs.readFileSync('html/index.html');
// console.log(fileContent);
// console.log('unmount SD card');
// E.unmountSD();



