var WIFI_NAME = "NETGEAR53";
var WIFI_OPTIONS = { password: "" };
var g;

var wifi = require("Wifi");

function onInit() {

  wifi.connect(WIFI_NAME, WIFI_OPTIONS, function (err) {
    if (err) {
      console.log("Connection error: " + err);
      return;
    }
    console.log("Connected!");
    getPage();
  });
}


function getPage() {
  require("http").get("http://www.pur3.co.uk/hello.txt", function (res) {
    console.log("Response: ", res);
    res.on('data', function (d) {
      console.log("--->" + d);
      wifi.getIP(function (err, data) {
        console.log("getIP() in callback: ", data.ip);
      });

    });
  });
}



