// to start: sudo node server.js

var express = require("express"); // the express library
var http = require("http"); // the http library
var WebSocket = require("ws"); // the ws library
var WebSocketServer = WebSocket.Server; // the ws library's Server class
var server = express(); // the express server
// serve static files from /public:
server.use("/", express.static("./public"));
var httpServer = http.createServer(server); // an http server
var wss = new WebSocketServer({ server: httpServer }); // a websocket server
var config = require("./config.json");
console.log("debug level " + config.debuglevel);
const RTC = require("./RTC.js");
var rtc = new RTC();
var ip = require("ip");
const fs = require("fs");
const fse = require("fs-extra");
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
var simmonth = 40;
var loopTimer;
var loopPeriod = 1000;


// define the webSocket connection callback function:
function connectClient(newClient) {
  // when a webSocket message comes in from this client:
  function readMessage(receivedpacket) {
    debugMsgln(receivedpacket, 3);
    receivedmessage = JSON.parse(receivedpacket);

    if (receivedmessage.type == "listyears") {
      var path = "./public/data";
      fs.readdir(path, function (err, items) {
        debugMsgln(items, 1);
        if (wss.clients.size > 0) {
          // if there are any clients
          sendpacket.type = "listyears";
          sendpacket.data = items;
          broadcast(JSON.stringify(sendpacket)); // send them the data as a string
        }
      });
    }
    if (receivedmessage.type == "listmonths") {
      const year = receivedmessage.data.year;
      var path = "./public/data/" + year;
      debugMsgln(path, 1);
      fs.readdir(path, function (err, items) {
        debugMsgln(items, 1);
        if (wss.clients.size > 0) {
          // if there are any clients
          sendpacket.type = "listmonths";
          sendpacket.data = items;
          broadcast(JSON.stringify(sendpacket)); // send them the data as a string
        }
      });
    }
    if (receivedmessage.type == "listdir") {
      const year = receivedmessage.data.year;
      const month = receivedmessage.data.month;
      var path = "./public/data/" + year + "/" + month;
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
      const year = receivedmessage.data.year;
      const month = receivedmessage.data.month;
      const fileName = receivedmessage.data.fileName;
      var path = "./public/data/" + year + "/" + month + "/";
      rnd = Math.random();
      //name = path + fileName + "?rnd=" + rnd;
      name = path + fileName;
      debugMsg("r", 1);
      debugMsgln("readfile: " + name, 2);

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
      if (receivedmessage.data == "true") {
        logYesNo = true;
        debugMsgln("enableLogs: " + logYesNo, 1);
      } else {
        logYesNo = false;
        debugMsgln("enableLogs: " + logYesNo, 1);
      }
    }
    if (receivedmessage.type == "LogPeriod") {
      debugMsgln("log period: " + receivedmessage.data, 1);
      LogPeriod = receivedmessage.data;
    }
    if (receivedmessage.type == "LogFilePeriod") {
      debugMsgln("log file period: " + receivedmessage.data, 1);
      LogFilePeriod = receivedmessage.data;
    }
    if (receivedmessage.type == "status") {
      debugMsgln("status", 1);
      sendpacket.type = "status";
      sendpacket.data = {
        LogPeriod: LogPeriod,
        LogFilePeriod: LogFilePeriod,
        bufferLength: bufferarray.length
      };
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
  var newUTCdate;
  debugMsgln(data, 2);
  if (config.clock == "RTC") newUTCdate = rtc.readDate();
  if (config.clock == "PC") newUTCdate = new Date();
  if (config.clock == "Sim") {
    tmpDate = new Date();
    newUTCdate = new Date(tmpDate.getTime() + simmonth * 2700000000);
  }
  const t1 = oldBufferDate.toISOString();
  const t2 = newUTCdate.toISOString();
  var localdate = new Date(
    newUTCdate.getTime() - newUTCdate.getTimezoneOffset() * 60000
  );
  var localdatestring = localdate
    .toISOString()
    .replace(/:/g, "_")
    .slice(0, 19);
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
        debugMsg(".", 1);
        debugMsgln(t1 + " " + t2 + " " + diffBuffer + " " + diffFile, 2);
        if (diffBuffer < 100) {
          debugMsg("Real Time Clock Error", 0);
          return; // something wrong with the clock
        }
        // add line to buffer every LogPeriod seconds
        if (diffBuffer >= 1000 * LogPeriod) {
          oldBufferDate = newUTCdate;
          debugMsg("b", 1);
          debugMsgln("add a line to buffer", 2);
          bufferarray.push(dateline);
          // write file every LogFilePeriod seconds
          //if (bufferarray.length > 59) {
          if (diffFile >= 1000 * LogFilePeriod) {
            oldFileDate = newUTCdate;
            writeDataFile(localdate);
          }
        }
      }
    }
  } catch (e) {
    return console.error(e);
  }
}

function writeDataFile(localdate) {
  const year = localdate.getFullYear();
  const month = localdate.getMonth() + 1;
  makeDataDir(year, month);
  var localdatestring = localdate
    .toISOString()
    .replace(/:/g, "_")
    .slice(0, 19);
  const dir = "./public/data/" + year + "/" + month + "/";
  //  var path = "./public/data/" + localdatestring + ".txt";
  var path = dir + localdatestring + ".txt";

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

function makeDataDir(year, month) {
  //const dir = "./data/2019";
  const dir = "./public/data/" + year + "/" + month;
  fse.ensureDirSync(dir);
  debugMsgln("existence of folder ensured" + dir, 1);
}

function debugMsgln(message, level) {
  // reduce console ouput if running as service
  if (level <= debugLevel) console.log(message);
}

function debugMsg(message, level) {
  // reduce console ouput if running as service
  if (level <= debugLevel) process.stdout.write(message);
  countDots++;
  if (countDots > 40) {
    countDots = 0;
    console.log();
  }
}


function mainLoop() {
  //console.log("I'm running! :-)");

  var newUTCdate;
  if (config.clock == "RTC") newUTCdate = rtc.readDate();
  if (config.clock == "PC") newUTCdate = new Date();
  if (config.clock == "Sim") {
    tmpDate = new Date();
    newUTCdate = new Date(tmpDate.getTime() + simmonth * 2700000000);
  }
  const t1 = oldBufferDate.toISOString();
  const t2 = newUTCdate.toISOString();
  var localdate = new Date(
    newUTCdate.getTime() - newUTCdate.getTimezoneOffset() * 60000
  );
  var localdatestring = localdate
    .toISOString()
    .replace(/:/g, "_")
    .slice(0, 19);
  console.log(localdatestring);

}


function start() {

  debugMsgln("server started", 0);

  loopTimer = setInterval(mainLoop, loopPeriod);


}

start();

