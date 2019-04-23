var http = require("http");
var wifi = require('Wifi');
var myfl = require("W25Q");
var myflash = new myfl(SPI1, B6 /*CS*/);

SPI1.setup({
    mosi: B5,
    miso: B4,
    sck: B3
});
var WIFI_NAME = "NETGEAR53";
//var WIFI_NAME = "TP-LINK_MR3040_4B611E";
var WIFI_OPTIONS = {
    password: ""
};

var myhtml1 = '<html> <body>  <div style="display: table;">  <div style="display: table-row">   Date  <span id="clientDate"></span>';
var myhtml2 = '  </div>  <div style="display: table-cell; ">  <button>Settings</button>  </div>  </div> </body> </html>';

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

function onPageRequest(req, res) {
    var a = url.parse(req.url, true);
    res.writeHead(200, { 'Content-Type': 'text/html' });

    var page1 = myflash.readPageString(112);
    console.log(page1);
    res.write(page1);
    var page2 = myflash.readPageString(113);
    console.log(page2);
    res.write(page2);

    res.end();
    if (a.query && "led" in a.query)
        digitalWrite(LED1, a.query["led"]);
}


// Create and start server
function startServer() {
    http.createServer(onPageRequest).listen(80);
}

function startWifi() {
    console.log("connect Wifi");
    // Connect to WiFi
    wifi.connect(WIFI_NAME, WIFI_OPTIONS, err => {
        if (err !== null) {
            throw err;
        }
        // Print IP address
        wifi.getIP((err, info) => {
            if (err !== null) {
                throw err;
            }
            console.log("http://" + info.ip);
            startServer();
            console.log("Wifi connected");
        });
    });
}

startWifi();

showPage(190);

