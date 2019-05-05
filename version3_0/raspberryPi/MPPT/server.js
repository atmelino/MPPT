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
const raspi = require('raspi');
const pwm = require('raspi-pwm');
const RTC = require('./RTC.js');
var rtc = new RTC(rpio);
const INA3221 = require("./INA3221.js");
var ina3221 = new INA3221(rpio);
var inaValues;
var relaypin = 16;
var IR2104enablepin = 18;
var LEDgreen = 11;
var LEDorange = 13;
var LEDred = 15;
// other
DataFilesYesNo = true;
var keepMeasurement = 1;
var DataFileLines = 100;
var bufferarray = [];
var sendpacket = {
    type: "none",
    data: "empty"
};
var loopTimer;
var loopPeriod = 1000;
var buckConverter;
var PWM_actual = 0.3;
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
                //debugMsgln(items, 1);
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
            //debugMsgln(path, 1);
            fs.readdir(path, function (err, items) {
                //debugMsgln(items, 1);
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
                //debugMsgln(items, 2);
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
            //rnd = Math.random();
            //name = path + fileName + "?rnd=" + rnd;
            name = path + fileName;
            //debugMsg("r", 1);
            //debugMsgln("readfile: " + name, 2);

            fs.readFile(name, "utf8", function (err, contents) {
                //debugMsgln(contents);
                sendpacket.type = "filedata";
                sendpacket.data = contents;
                broadcast(JSON.stringify(sendpacket)); // send the data as a string
            });
        }
        if (receivedmessage.type == "getLog") {
            var path = "./public/data/log.txt";
            fs.readFile(path, "utf8", function (err, contents) {
                //debugMsgln(contents);
                sendpacket.type = "getLog";
                sendpacket.data = contents;
                broadcast(JSON.stringify(sendpacket)); // send the data as a string
            });
        }
        if (receivedmessage.type == "PWM") {
            debugMsgln("set PWM to " + receivedmessage.data, 1);
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
                DataFilesYesNo = true;
                debugMsgln("enableDataFiles: " + DataFilesYesNo, 1);
            } else {
                DataFilesYesNo = false;
                debugMsgln("enableDataFiles: " + DataFilesYesNo, 1);
            }
        }
        if (receivedmessage.type == "keepMeasurement") {
            debugMsgln("Keep every " + receivedmessage.data + " measurements", 1);
            keepMeasurement = receivedmessage.data;
        }
        if (receivedmessage.type == "DataFileLines") {
            debugMsgln("Save Data file every " + receivedmessage.data + " measurements", 1);
            DataFileLines = receivedmessage.data;
        }
        if (receivedmessage.type == "status") {
            //debugMsgln("status", 1);
            sendpacket.type = "status";
            sendpacket.data = {
                keepMeasurement: keepMeasurement,
                DataFileLines: DataFileLines,
                bufferLength: bufferarray.length
            };
            broadcast(JSON.stringify(sendpacket)); // send the data as a string
        }
        if (receivedmessage.type == "saveNow") {
            var dateTimeString = rtc.readDateTimeString();
            writeDataFile(dateTimeString);
        }
    }

    // set up event listeners:
    newClient.on("message", readMessage);
    // acknowledge new client:
    logEntry("connectClient - number of clients " + wss.clients.size);
    //debugMsgln("connectClient - number of clients " + wss.clients.size, 1);
}

// broadcast data to connected webSocket clients:
function broadcast(data) {
    //debugMsgln("broadcast - number of clients " + wss.clients.size);
    try {
        wss.clients.forEach(function each(client) {
            client.send(data);
        });
        //} catch (e) { console.log(e); }
    } catch (e) { console.log("WebSocket send requested but not open"); }
}

function LEDsoff() {
    rpio.write(LEDred, rpio.LOW);
    rpio.write(LEDorange, rpio.LOW);
    rpio.write(LEDgreen, rpio.LOW);
}

function setPWM() {
    rpio.write(IR2104enablepin, rpio.HIGH); // PWM on, enable IR2104
    buckConverter = new pwm.PWM({ pin: 'P1-12', frequency: 80000 });
    if (PWM_actual > 1.0)
        PWM_actual = 1.0;
    buckConverter.write(PWM_actual);
}

function stopPWM() {
    PWM_actual = 0.0;
    rpio.write(IR2104enablepin, rpio.LOW); // PWM off, disable IR2104
}

function makeDataLine(dateTimeString) {
    var solarvals = inaValues.busVoltage3.toFixed(3) + " " + inaValues.current_mA3.toFixed(3) + " " + inaValues.power_mW3.toFixed(3);
    var batteryvals = inaValues.busVoltage1.toFixed(3) + " " + inaValues.current_mA1.toFixed(3) + " " + inaValues.power_mW1.toFixed(3);
    var c = ("00000" + count).slice(-5);
    var line = dateTimeString + " " + c + " " + solarvals + " " + batteryvals + " " + PWM_actual.toFixed(2);
    return line;
}

function makeDataDir(year, month) {
    const dir = "./public/data/" + year + "/" + month;
    fse.ensureDirSync(dir);
    //console.log("existence of folder ensured" + dir, 1);
}

function writeDataFile(dateTimeString) {
    const year = dateTimeString.slice(0, 4);
    const month = dateTimeString.slice(5, 7);
    const filename = dateTimeString.replace(/:/g, "_");
    const dir = "./public/data/" + year + "/" + month + "/";
    var path = dir + filename + ".txt";

    makeDataDir(year, month);

    buffer = new Buffer.from(bufferarray.join("\n"));
    // clear bufferarray
    bufferarray.length = 0;

    fs.open(path, "w", function (err, fd) {
        if (err) {
            throw "error opening file: " + err;
        }
        fs.write(fd, buffer, 0, buffer.length, null, function (err) {
            if (err) throw "error writing file: " + err;
            fs.close(fd, function () {
                //console.log("file written " + path, 1);
            });
        });
    });
}

function logEntry(text) {
    var dateTimeString = rtc.readDateTimeString();
    var logLine = dateTimeString + " " + text + "\n";
    buffer = new Buffer.from(logLine);
    const dir = "./public/data/";
    var path = dir + "log.txt";
    fs.open(path, "a", function (err, fd) {
        if (err) {
            throw "error opening file: " + err;
        }
        fs.write(fd, buffer, 0, buffer.length, null, function (err) {
            if (err) throw "error writing file: " + err;
            fs.close(fd, function () {
            });
        });
    });
}

function mainLoop() {

    inaValues = ina3221.readAllChannels();
    solarVoltage = inaValues.busVoltage3;
    batteryVoltage = inaValues.busVoltage1;
    batteryCurrent = inaValues.current_mA1;

    // LED indicators
    if (batteryVoltage < 7.7) {
        rpio.write(LEDred, rpio.HIGH);
        setTimeout(LEDsoff, 100);
    }
    if (batteryVoltage >= 7.7 && batteryVoltage < 8.0) {
        rpio.write(LEDorange, rpio.HIGH);
        setTimeout(LEDsoff, 100);
    }
    if (batteryVoltage >= 8.0) {
        rpio.write(LEDgreen, rpio.HIGH);
        setTimeout(LEDsoff, 100);
    }

    switch (true) {
        case batteryVoltage > 8.4: // prevent battery overvoltage
            //console.log("battery over voltage");
            PWM_actual -= 0.01;
            setPWM();
            break;
        case Math.abs(batteryCurrent) > 1050:
            //console.log("battery over current");
            PWM_actual -= 0.01;
            setPWM();
            break;
        case solarVoltage > 10.0 && batteryVoltage >= 8.3:
            //console.log("increase voltage slow");
            // rpio.write(relaypin, rpio.HIGH); // connect battery
            PWM_actual += 0.001;
            setPWM();
            break;
        case solarVoltage > 10.0 && batteryVoltage < 8.3:
            //console.log("increase voltage fast");
            // rpio.write(relaypin, rpio.HIGH); // connect battery
            PWM_actual += 0.02;
            setPWM();
            break;
        case solarVoltage <= 10.0 && batteryVoltage >= 7.6:
            //console.log("solar under voltage");
            stopPWM();
            break;
        case solarVoltage <= 10.0 && batteryVoltage < 7.6: // prevent battery over discharge
            //console.log("solar and battery under voltage");
            logEntry("low battery shutdown");
            stopPWM();
            // give it a bit of time before turning off power
            // rpio.write(relaypin, rpio.LOW); // disconnect battery
            break;
    }

    count++;
    var dateTimeString = rtc.readDateTimeString();
    line = makeDataLine(dateTimeString);
    debugMsgln(line, 2);
    if (wss.clients.size > 0) {
        // if there are any clients
        //debugMsgln('clients');
        sendpacket.type = "livedata";
        sendpacket.data = line;
        broadcast(JSON.stringify(sendpacket)); // send them the data as a string
    }

    if (DataFilesYesNo) {
        //debugMsgln("Keep every " + keepMeasurement + " measurements", 0);
        //debugMsgln("count " + count + " remainder " + count % keepMeasurement, 0);

        if (count % keepMeasurement == 0) {
            //console.log("keep measurement");
            bufferarray.push(line);
        }
        if (bufferarray.length > DataFileLines) {
            writeDataFile(dateTimeString);
        }
    }
}


function start() {
    rpio.open(relaypin, rpio.OUTPUT, rpio.HIGH);
    rpio.open(LEDgreen, rpio.OUTPUT, rpio.LOW);
    rpio.open(LEDorange, rpio.OUTPUT, rpio.LOW);
    rpio.open(LEDred, rpio.OUTPUT, rpio.LOW);
    rpio.open(IR2104enablepin, rpio.OUTPUT, rpio.HIGH);
    raspi.init(setPWM);

    var server = httpServer.listen(8080, function () {
        var host = server.address().address;
        host = host == "::" ? "localhost" : host;
        var port = server.address().port;
        debugMsgln("running at http://" + host + ":" + port, 1);
    });

    wss.on("connection", connectClient); // listen for webSocket messages

    logEntry("system start");

    loopTimer = setInterval(mainLoop, loopPeriod);
}

start();
