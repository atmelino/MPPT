var http = require("http");
var wifi = require('Wifi');

var WIFI_NAME = "NETGEAR53";
//var WIFI_NAME = "TP-LINK_MR3040_4B611E";
var WIFI_OPTIONS = {
    password: ""
};



// Create and start server
function startServer() {
    http.createServer(function (req, res) {
        res.writeHead(200);
        res.end("Hello World");
      }).listen(80);
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




