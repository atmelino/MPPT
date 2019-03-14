// Wire up up MOSI, MISO, SCK and CS pins (along with 3.3v and GND)
SPI1.setup({mosi:B5, miso:B4, sck:B3});
E.connectSDCard(SPI1, B6 /*CS*/);
// see what's on the device
console.log(require("fs").readdirSync());
