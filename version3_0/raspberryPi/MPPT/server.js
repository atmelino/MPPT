// to start: sudo node server.js

// server stuff
var express = require("express"); // the express library
var http = require("http"); // the http library
var WebSocket = require("ws"); // the ws library
var WebSocketServer = WebSocket.Server; // the ws library's Server class
var server = express(); // the express server
server.use("/", express.static("./public")); // serve static files from /public
var httpServer = http.createServer(server); // an http server
var wss = new WebSocketServer({ server: httpServer }); // a websocket server
// Rpi file system
const fs = require("fs");
const fse = require("fs-extra");
// hardware
var rpio = require('rpio');
rpio.i2cBegin();
const RTC = require('./RTC.js');
var rtc = new RTC(rpio);
const INA3221 = require("./INA3221.js");
var ina3221 = new INA3221(rpio);
var inaValues;
// other
var sendpacket = {
    type: "none",
    data: "empty"
};
var loopTimer;
var loopPeriod = 1000;
var PWM_actual = 0.0;
var count = 0;
var countDots = 0;
var debugLevel = 1;

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
                    broadcast(JSON.stringify(sendpacket)); // send the data as a string
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
                broadcast(JSON.stringify(sendpacket)); // send the data as a string
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
        if (receivedmessage.type == "enableDataFiles") {
            debugMsgln("enableDataFiles" + JSON.stringify(receivedmessage), 1);
            if (receivedmessage.data == "true") {
                DataYesNo = true;
                debugMsgln("enableDataFiles: " + DataYesNo, 1);
            } else {
                DataYesNo = false;
                debugMsgln("enableDataFiles: " + DataYesNo, 1);
            }
        }
        if (receivedmessage.type == "DataPeriod") {
            debugMsgln("data period: " + receivedmessage.data, 1);
            DataPeriod = receivedmessage.data;
        }
        if (receivedmessage.type == "DataFilePeriod") {
            debugMsgln("data file period: " + receivedmessage.data, 1);
            DataFilePeriod = receivedmessage.data;
        }
        if (receivedmessage.type == "status") {
            debugMsgln("status", 1);
            sendpacket.type = "status";
            sendpacket.data = {
                DataPeriod: DataPeriod,
                DataFilePeriod: DataFilePeriod,
                bufferLength: bufferarray.length
            };
            broadcast(JSON.stringify(sendpacket)); // send the data as a string
        }
    }

    // set up event listeners:
    newClient.on("message", readMessage);
    // acknowledge new client:
    //debugMsgln("new client");
    debugMsgln("connectClient - number of clients " + wss.clients.size, 1);
}

// broadcast data to connected webSocket clients:
function broadcast(data) {
    //debugMsgln("broadcast - number of clients " + wss.clients.size);

    wss.clients.forEach(function each(client) {
        //debugMsgln('sending to client');
        client.send(data);
    });
}

function makeDataLine() {
    var solarvals = inaValues.busVoltage3.toFixed(3) + " " + inaValues.current_mA3.toFixed(3) + " " + inaValues.power_mW3.toFixed(3);
    var batteryvals = inaValues.busVoltage1.toFixed(3) + " " + inaValues.current_mA1.toFixed(3) + " " + inaValues.power_mW1.toFixed(3);
    var c = ("00000" + count).slice(-5);
    var line = rtc.readDateTimeString() + " " + c + " " + solarvals + " " + batteryvals + " " + PWM_actual.toFixed(2);
    return line;
}

function mainLoop() {
    count++;
    //console.log(rtc.readDateTimeString());

    inaValues = ina3221.readAllChannels();
    solarVoltage = inaValues.busVoltage3;
    batteryVoltage = inaValues.busVoltage1;
    batteryCurrent = inaValues.current_mA1;
    // set LEDs


    line = makeDataLine();
    if (wss.clients.size > 0) {
        // if there are any clients
        //debugMsgln('clients');
        sendpacket.type = "livedata";
        sendpacket.data = line;
        broadcast(JSON.stringify(sendpacket)); // send them the data as a string
    }
    console.log(line);


    // let line1 = "bus " + inaValues.busVoltage1.toFixed(3) + " V shunt " + inaValues.shuntVoltage1.toFixed(3) + " mV current " + inaValues.current_mA1.toFixed(3) + " mA";
    // line3 = "bus " + inaValues.busVoltage3.toFixed(3) + " V shunt " + inaValues.shuntVoltage3.toFixed(3) + " mV current " + inaValues.current_mA3.toFixed(3) + " mA";
    // console.log("channel 1: " + line1 + " channel 3: " + line3);

}

function start() {

    var server = httpServer.listen(8080, function () {
        var host = server.address().address;
        host = host == "::" ? "localhost" : host;
        var port = server.address().port;
        debugMsgln("running at http://" + host + ":" + port, 1);
    });

    wss.on("connection", connectClient); // listen for webSocket messages


    loopTimer = setInterval(mainLoop, loopPeriod);
}

start();

