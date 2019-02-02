// to start: sudo node server.js 
// port is in config.json
// Arduino UNO: /dev/ttyAMA0
// Arduino Pro Mini: /dev/ttyUSB0

var express = require("express"); // the express library
var http = require("http"); // the http library
var WebSocket = require("ws"); // the ws library
var WebSocketServer = WebSocket.Server; // the ws library's Server class
var server = express(); // the express server
var httpServer = http.createServer(server); // an http server
var wss = new WebSocketServer({ server: httpServer }); // a websocket server
const SerialPort = require("serialport");
const Readline = require("@serialport/parser-readline");
var config = require("./config.json");
console.log(config.port + " " + config.debuglevel);
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
var logYesNo = true;
var oldBufferDate = rtc.readDate();
var oldFileDate = oldBufferDate;
var debugLevel = 1;
var LogPeriod = 60;
var LogFilePeriod = 3600;
var countDots = 0;

debugMsgln("server started", 0);
myPort.on("open", openPort); // called when the serial port opens
const parser = myPort.pipe(new Readline({ delimiter: "\r\n" }));
parser.on("data", listen); // called when there's new incoming serial data
// serve static files from /public:
server.use("/", express.static("./public"));

function openPort() {
  debugMsgln("port open", 0);
  debugMsgln("baud rate: " + myPort.baudRate, 0);
}

// define the webSocket connection callback function:
function connectClient(newClient) {

  // when a webSocket message comes in from this client:
  function readMessage(receivedpacket) {
    debugMsgln(receivedpacket, 3);
    receivedmessage = JSON.parse(receivedpacket);
    if (receivedmessage.type == "storeddata") {
      var path = "./public/data";
      fs.readdir(path, function (err, items) {
        debugMsgln(items, 2);
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
      debugMsgln('readfile: ' + name, 1);

      fs.readFile(name, "utf8", function (err, contents) {
        //debugMsgln(contents);
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
      debugMsgln("serial port write" + arduinoMessageJSON, 1);
      myPort.write(arduinoMessageJSON);
    }
    if (receivedmessage.type == "SetRTC") {
      debugMsgln("SetRTC" + JSON.stringify(receivedmessage), 1);
      var year = receivedmessage.data.year;
      var month = receivedmessage.data.month;
      var day = receivedmessage.data.day;
      var hours = receivedmessage.data.hours;
      var minutes = receivedmessage.data.minutes;
      var seconds = receivedmessage.data.seconds;
      var dayofweek = receivedmessage.data.dayofweek;
      rtc.setDateNumbers(year, month, day, hours, minutes, seconds, dayofweek);
    }
    if (receivedmessage.type == "enableLogs") {
      debugMsgln("enableLogs" + JSON.stringify(receivedmessage), 1);
      if (receivedmessage.data == 'true') {
        logYesNo = true;
        debugMsgln("enableLogs: " + logYesNo, 1);
      } else {
        logYesNo = false;
        debugMsgln("enableLogs: " + logYesNo, 1);
      }
    }
    if (receivedmessage.type == "LogPeriod") {
      debugMsgln('log period: ' + receivedmessage.data, 1);
      LogPeriod = receivedmessage.data;
    }
    if (receivedmessage.type == "LogFilePeriod") {
      debugMsgln('log file period: ' + receivedmessage.data, 1);
      LogFilePeriod = receivedmessage.data;
    }
    if (receivedmessage.type == "query") {
      debugMsgln('query', 1);
      sendpacket.type = "query";
      sendpacket.data = { LogPeriod: LogPeriod, LogFilePeriod: LogFilePeriod };
      broadcast(JSON.stringify(sendpacket)); // send them the data as a string
    }
  }

  // set up event listeners:
  newClient.on("message", readMessage);
  // acknowledge new client:
  //debugMsgln("new client");
  debugMsgln("connectClient - number of clients " + wss.clients.size, 1);
}

function listen(data) {
  debugMsgln(data, 2);
  var newUTCdate = rtc.readDate();
  const t1 = oldBufferDate.toISOString();
  const t2 = newUTCdate.toISOString();
  var localdate = new Date(
    newUTCdate.getTime() - newUTCdate.getTimezoneOffset() * 60000
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
      debugMsgln("IP requested", 1);
      var ipaddress = ip.address();
      console.dir(ipaddress);
      var arduinoMessage = {
        IP: ipaddress
      };
      var arduinoMessageJSON = JSON.stringify(arduinoMessage);
      debugMsgln("serial port write" + arduinoMessageJSON, 1);
      myPort.write(arduinoMessageJSON);
    }

    if (receivedmessage.type == "data") {
      line = receivedmessage.line;
      var dateline = localdatestring + " " + line;
      debugMsgln(dateline, 2);
      if (wss.clients.size > 0) {
        // if there are any clients
        //debugMsgln('clients');
        sendpacket.type = "livedata";
        sendpacket.data = dateline;
        broadcast(JSON.stringify(sendpacket)); // send them the data as a string
      }

      if (logYesNo == true) {
        const diffBuffer = newUTCdate - oldBufferDate;
        const diffFile = newUTCdate - oldFileDate;
        debugMsg('.', 1);
        debugMsgln(t1 + ' ' + t2 + ' ' + diffBuffer + ' ' + diffFile, 2);
        if (diffBuffer < 100) {
          return; // something wrong with the clock
        }
        // add line to buffer every LogPeriod seconds 
        if (diffBuffer >= 1000 * LogPeriod) {
          oldBufferDate = newUTCdate;
          debugMsg('b', 1);
          debugMsgln('add a line to buffer', 2);
          bufferarray.push(dateline);
          // write file every LogFilePeriod seconds
          //if (bufferarray.length > 59) {
          if (diffFile >= 1000 * LogFilePeriod) {
            oldFileDate = newUTCdate;
            writeDataFile(localdatestring);
          }
        }
      }
    }
  } catch (e) {
    return console.error(e);
  }
}

function writeDataFile(localdatestring) {
  var path = "./public/data/" + localdatestring + ".txt";
  buffer = new Buffer.from(bufferarray.join("\n"));
  bufferarray.length = 0;

  fs.open(path, "w", function (err, fd) {
    if (err) {
      throw "error opening file: " + err;
    }

    fs.write(fd, buffer, 0, buffer.length, null, function (err) {
      if (err) throw "error writing file: " + err;
      fs.close(fd, function () {
        debugMsgln("file written " + path, 1);
      });
    });
  });
}


// broadcast data to connected webSocket clients:
function broadcast(data) {
  //debugMsgln("broadcast - number of clients " + wss.clients.size);

  wss.clients.forEach(function each(client) {
    //debugMsgln('sending to client');
    client.send(data);
  });
}

// start the servers:
var server = httpServer.listen(8080, function () {
  var host = server.address().address;
  host = host == "::" ? "localhost" : host;
  var port = server.address().port;
  debugMsgln("running at http://" + host + ":" + port, 1);
});

wss.on("connection", connectClient); // listen for webSocket messages

function debugMsgln(message, level) {
  // reduce console ouput if running as service
  if (level <= debugLevel) console.log(message);
}

function debugMsg(message, level) {
  // reduce console ouput if running as service
  if (level <= debugLevel) process.stdout.write(message);
  countDots++;
  if (countDots > 40) { countDots = 0; console.log(); }
}
