var http = require("http");
var wifi = require('Wifi');

var WIFI_NAME = "NETGEAR53";
//var WIFI_NAME = "TP-LINK_MR3040_4B611E";
var WIFI_OPTIONS = {
    password: ""
};

myhtml1 = '<html> <body>  <div style="display: table;">  <div style="display: table-row">   Date  <span id="clientDate"></span>';
myhtml2 = '  </div>  <div style="display: table-cell; ">  <button>Settings</button>  </div>  </div> </body> </html>';

function onPageRequest(req, res) {
    var a = url.parse(req.url, true);
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write(myhtml1);
    res.write(myhtml2);
    res.end();
    if (a.query && "led" in a.query)
        digitalWrite(LED1, a.query["led"]);
}


// Create and start server
function startServer() {
    http.createServer(onPageRequest).listen(80);
    // http.createServer(function (req, res) {
    //     res.writeHead(200);
    //     res.end("Hello World");
    // }).listen(80);
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




