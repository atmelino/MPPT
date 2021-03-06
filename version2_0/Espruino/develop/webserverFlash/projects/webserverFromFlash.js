var http = require("http");
var wifi = require('Wifi');
var myfl = require("W25Q");
var myflash = new myfl(SPI1, B6 /*CS*/ );
var myut = require("utils");
var myutils = new myut();

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

function showPage(number) {
    console.log("page " + number + ":");
    console.log(myutils.hexdump(myflash.readPage(number), 16));
}

function onPageRequest(req, res) {
    var a = url.parse(req.url, true);
    res.writeHead(200, {
        'Content-Type': 'text/html'
    });

    // var page1 = myflash.readPageString(112);
    // console.log(page1);
    // res.write(page1);
    // var page2 = myflash.readPageString(113);
    // console.log(page2);
    // res.write(page2);

    var startHTMLpage = 112;
    numberOfPages = 44;
    for (var p = startHTMLpage; p < startHTMLpage + numberOfPages; p++) {
        var page = myflash.readPageString(p);
        console.log(page);
        res.write(page);
    }


    res.end();
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
function readHTML() {
    var webpage = require("index.html");
    var mypage = new webpage();
    var myhtml = mypage.gethtml().replace(/ +/g, ' ');
    return myhtml;
}

function startWebRead() {
    var startHTMLpage = 112;
    numberOfPages = 44;

    for (var p = startHTMLpage; p < startHTMLpage + numberOfPages; p++) {
        var page = myflash.readPageString(p);
        console.log(page);
    }
}


startWebRead();
//startWifi();




