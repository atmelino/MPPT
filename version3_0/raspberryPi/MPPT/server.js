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
// hardware
var rpio = require('rpio');
rpio.i2cBegin();
const RTC = require('./RTC.js');
var rtc = new RTC(rpio);
const INA3221 = require("./INA3221.js");
var ina3221 = new INA3221(rpio);
var inaValues;
// other
var loopTimer;
var loopPeriod = 1000;
var PWM_actual = 0.0;
var count = 0;


function makeLine() {
    var solarvals = inaValues.busVoltage3 + ' ' + inaValues.current_mA3 + ' ' + inaValues.power_mW3;
    var batteryvals = inaValues.busVoltage1 + ' ' + inaValues.current_mA1 + ' ' + inaValues.power_mW1;
    var line = inaValues.dateString.replace(/ /g, "_") + ' ' + inaValues.number + ' ' + solarvals + ' ' + batteryvals + ' ' + PWM_actual + '\n';
    return line;
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

    console.log(makeDataLine());


    // let line1 = "bus " + inaValues.busVoltage1.toFixed(3) + " V shunt " + inaValues.shuntVoltage1.toFixed(3) + " mV current " + inaValues.current_mA1.toFixed(3) + " mA";
    // line3 = "bus " + inaValues.busVoltage3.toFixed(3) + " V shunt " + inaValues.shuntVoltage3.toFixed(3) + " mV current " + inaValues.current_mA3.toFixed(3) + " mA";
    // console.log("channel 1: " + line1 + " channel 3: " + line3);


}

function start() {

    //debugMsgln("server started", 0);





    loopTimer = setInterval(mainLoop, loopPeriod);


}

start();

