// to start:
// Arduino UNO: node server.js /dev/ttyAMA0
// Arduino Pro Mini: node server.js /dev/ttyUSB0

var express = require("express"); // the express library
var http = require("http"); // the http library
var WebSocket = require("ws"); // the ws library
var WebSocketServer = WebSocket.Server; // the ws library's Server class
var server = express(); // the express server
var httpServer = http.createServer(server); // an http server
var wss = new WebSocketServer({ server: httpServer }); // a websocket server
const SerialPort = require("serialport");
var portName = process.argv[2]; // get the port name from the command line
const Readline = require("@serialport/parser-readline");
var config = require("./config.json");
console.log(config.port + " " + config.debuglevel);
//var myPort = new SerialPort(portName);
//const myPort = new SerialPort('/dev/ttyAMA0')
//const myPort = new SerialPort('/dev/ttyUSB0')
const myPort = new SerialPort(config.port);
const RTC = require("./RTC.js");
var rtc = new RTC();
var ip = require("ip");
const fs = require("fs");
var bufferarray = [];
var sendpacket = {
  type: "none",
  data: "empty"
};

debug = true;
debugMsg("server started", 0);

myPort.on("open", openPort); // called when the serial port opens

const parser = myPort.pipe(new Readline({ delimiter: "\r\n" }));
parser.on("data", listen); // called when there's new incoming serial data

// serve static files from /public:
server.use("/", express.static("./public"));

function openPort() {
  debugMsg("port open", 0);
  debugMsg("baud rate: " + myPort.baudRate, 0);
}

// define the webSocket connection callback function:
function connectClient(newClient) {
  // when a webSocket message comes in from this client:
  function readMessage(receivedpacket) {
    debugMsg(receivedpacket, 3);
    receivedmessage = JSON.parse(receivedpacket);
    if (receivedmessage.type == "storeddata") {
      var path = "./public/data";
      fs.readdir(path, function(err, items) {
        debugMsg(items, 1);
        if (wss.clients.size > 0) {
          // if there are any clients
          sendpacket.type = "listdir";
          sendpacket.data = items;
          broadcast(JSON.stringify(sendpacket)); // send them the data as a string
        }
      });
    }
    if (receivedmessage.type == "readfile") {
      var path = "./public/data/";
      fileName = receivedmessage.data;
      rnd = Math.random();
      //name = path + fileName + "?rnd=" + rnd;
      name = path + fileName;
      debugMsg(name, 1);

      fs.readFile(name, "utf8", function(err, contents) {
        //debugMsg(contents);
        sendpacket.type = "filedata";
        sendpacket.data = contents;
        broadcast(JSON.stringify(sendpacket)); // send them the data as a string
      });
    }
    if (receivedmessage.type == "PWM") {
      var arduinoMessage = {
        PWM: receivedmessage.data
      };
      var arduinoMessageJSON = JSON.stringify(arduinoMessage);
      debugMsg("serial port write" + arduinoMessageJSON, 1);
      myPort.write(arduinoMessageJSON);
    }
    if (receivedmessage.type == "SetRTC") {
      debugMsg("SetRTC" + JSON.stringify(receivedmessage), 1);
      //rtc.setDateNumbers(year, month, day, hours, minutes, seconds, dayofweek);
    }
  }

  // set up event listeners:
  newClient.on("message", readMessage);
  // acknowledge new client:
  //debugMsg("new client");
  debugMsg("connectClient - number of clients " + wss.clients.size, 1);
}

function listen(data) {
  debugMsg(data, 2);
  // toto: at first boot, rtc time gives 2019-02-01. setdate sets correct time
  var UTCdate = rtc.readDate();
  var localdate = new Date(
    UTCdate.getTime() - UTCdate.getTimezoneOffset() * 60000
  );
  var localdatestring = localdate
    .toISOString()
    .replace(/:/g, "_")
    .slice(0, 19);
  // fixed : check for error in parse, exit listen if error
  var receivedmessage;
  try {
    var receivedmessage = JSON.parse(data);
    //messageObject = JSON.parse(message);
    if (receivedmessage.type == "IP") {
      debugMsg("IP requested", 1);
      var ipaddress = ip.address();
      console.dir(ipaddress);
      var arduinoMessage = {
        IP: ipaddress
      };
      var arduinoMessageJSON = JSON.stringify(arduinoMessage);
      debugMsg("serial port write" + arduinoMessageJSON, 1);
      myPort.write(arduinoMessageJSON);
    }

    if (receivedmessage.type == "data") {
      line = receivedmessage.line;
      var dateline = localdatestring + " " + line;
      debugMsg(dateline, 1);
      bufferarray.push(dateline);
      // write file every 50 data

      if (bufferarray.length > 50) {
        var path = "./public/data/" + localdatestring + ".txt";
        buffer = new Buffer.from(bufferarray.join("\n"));
        bufferarray.length = 0;

        fs.open(path, "w", function(err, fd) {
          if (err) {
            throw "error opening file: " + err;
          }

          fs.write(fd, buffer, 0, buffer.length, null, function(err) {
            if (err) throw "error writing file: " + err;
            fs.close(fd, function() {
              debugMsg("file written " + path, 1);
            });
          });
        });
      }

      if (wss.clients.size > 0) {
        // if there are any clients
        //debugMsg('clients');
        sendpacket.type = "livedata";
        sendpacket.data = dateline;
        broadcast(JSON.stringify(sendpacket)); // send them the data as a string
        //broadcast(line);   // send them the data as a string
      }
    }
  } catch (e) {
    return console.error(e);
  }
}

// broadcast data to connected webSocket clients:
function broadcast(data) {
  //debugMsg("broadcast - number of clients " + wss.clients.size);

  wss.clients.forEach(function each(client) {
    //debugMsg('sending to client');
    client.send(data);
  });
}

// start the servers:
var server = httpServer.listen(8080, function() {
  var host = server.address().address;
  host = host == "::" ? "localhost" : host;
  var port = server.address().port;
  debugMsg("running at http://" + host + ":" + port, 1);
});

wss.on("connection", connectClient); // listen for webSocket messages

function debugMsg(message, level) {
  // reduce console ouput if running as service

  var debugLevel = 1;

  if (level <= debugLevel) console.log(message);
}
