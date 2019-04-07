
// Setup I2C
var i2c = new I2C();
i2c.setup({ sda: B9, scl: B8 });
var RTC = require("DS1307");
var rtc = new RTC(i2c, {
    address: 0x68
});
var INA3221 = require("INA3221");
var ina = new INA3221(i2c, {
    address: 0x40,
    shunt: 0.1 // the shunt resistor's value
});
var loopTimer;
var loopPeriod = 1000;
var counter = 0;
var PWM_actual = 0.0;
var PWM_target = 0;
var allChannelsResult;
var webpage = require("webpage");
var mypage = new webpage();
var wifi = require('Wifi');
var clients = [];
var WIFI_NAME = "NETGEAR53";
//var WIFI_NAME = "TP-LINK_MR3040_4B611E";
var WIFI_OPTIONS = {
    password: ""
};


function userMessage(msg) {
    const consExist = false;
    if (consExist)
        console.log(msg);
}

// Create and start server
function startServer() {
    const s = require('ws').createServer(pageHandler);
    s.on('websocket', wsHandler);
    s.listen(80);
}

// Page request handler
function pageHandler(req, res) {
    res.writeHead(200, {
        'Content-Type': 'text/html'
    });
    res.end(mypage.gethtml());
}

// WebSocket request handler
function wsHandler(ws) {
    clients.push(ws);
    ws.on('message', receivedpacket => {
        //console.log(WIFI_OPTIONS);
        console.log(receivedpacket);
        receivedmessage = JSON.parse(receivedpacket);
        //console.log(JSON.stringify(receivedmessage));
        if (receivedmessage.type == 'PWMminus') {
            PWM_actual -= 0.01;
            analogWrite(A0, PWM_actual, { freq: 80000 });
        }
        if (receivedmessage.type == 'PWMplus') {
            PWM_actual += 0.01;
            analogWrite(A0, PWM_actual, { freq: 80000 });
        }
        if (receivedmessage.type == "setRTC") {
            var year = receivedmessage.data.year;
            var month = receivedmessage.data.month;
            var day = receivedmessage.data.day;
            var hours = receivedmessage.data.hours;
            var minutes = receivedmessage.data.minutes;
            var seconds = receivedmessage.data.seconds;
            var dayofweek = receivedmessage.data.dayofweek;
            //console.log(year);
            rtc.setDate(day, month, year);
            rtc.setTime(hours, minutes, seconds);
        }
        if (receivedmessage.type == "loopPeriod") {
            // console.log(JSON.stringify(receivedmessage));
            loopPeriod = receivedmessage.data;
            clearInterval(loopTimer);
            loopTimer = setInterval(mainLoop, loopPeriod);
        }
        if (receivedmessage.type == "LED") {
            digitalWrite(LED2, receivedmessage.data == 'on');
        }
    });
    ws.on('close', evt => {
        var x = clients.indexOf(ws);
        if (x > -1) {
            clients.splice(x, 1);
        }
    });
}

// Send msg to all current websocket connections
function broadcast(msg) {
    clients.forEach(cl => cl.send(msg));
}

function startWifi() {
    // Connect to WiFi
    digitalPulse(LED1, 1, 200); // pulse  led as indicator
    digitalPulse(LED1, 0, 200); // pulse  led as indicator
    digitalPulse(LED1, 1, 200); // pulse  led as indicator
    wifi.connect(WIFI_NAME, WIFI_OPTIONS, err => {
        if (err !== null) {
            throw err;
        }
        // Print IP address
        wifi.getIP((err, info) => {
            if (err !== null) {
                throw err;
            }
            userMessage("http://" + info.ip);
            startServer();
            digitalPulse(LED2, 1, 200); // pulse  led as indicator
            digitalPulse(LED2, 0, 200); // pulse  led as indicator
            digitalPulse(LED2, 1, 200); // pulse  led as indicator
        });
    });
}


function start() {
    userMessage("Start Wifi");
    startWifi();

    userMessage('Turning PWM on');
    // digitalWrite(B1, 1); // PWM on enable IR2104
    // analogWrite(A0, PWM_actual, { freq: 80000 });
    // Turn relay between battery and MC on
    digitalWrite(B0, 1);

    loopTimer = setInterval(mainLoop, loopPeriod);
}


function mainLoop() {
    allChannelsResult = ina.getAllChannels();
    solarVoltage = allChannelsResult.busVoltage3;
    batteryVoltage = allChannelsResult.busVoltage1;
    batteryCurrent = allChannelsResult.current_mA1;

    // LED indicators
    if (batteryVoltage < 7.7)
        digitalPulse(B13, 1, 50); // red LED
    if (batteryVoltage >= 7.7 && batteryVoltage < 8.0)
        digitalPulse(B14, 1, 50); // orange LED
    if (batteryVoltage >= 8.0)
        digitalPulse(B15, 1, 50); // green LED

    // prevent battery overvoltage and overcurrent
    if (batteryVoltage > 8.4 || Math.abs(batteryCurrent) > 300) {
        PWM_actual -= 0.01;
        analogWrite(A0, PWM_actual, { freq: 80000 });
    }

    if (solarVoltage <= 9.0) {
        PWM_actual = 0.0;
        analogWrite(A0, PWM_actual, { freq: 0 });
        digitalWrite(B1, 0); // PWM off disable IR2104
    }

    if (solarVoltage > 9.0) {
        digitalWrite(B0, 1); // connect battery
        if (batteryVoltage < 8.2) {
            PWM_actual += 0.02;
        }
        if (batteryVoltage >= 8.2 && batteryVoltage < 8.4) {
            PWM_actual += 0.001;
        }
        analogWrite(A0, PWM_actual, { freq: 80000 });
        digitalWrite(B1, 1); // PWM on enable IR2104
    }

    // prevent battery over discharge
    if (batteryVoltage < 7.6 && solarVoltage <= 8.0) {
        digitalWrite(B0, 0); //turn system off
    }

    currentDate = rtc.readDateTime();
    allChannelsResult.date = currentDate;
    allChannelsResult.number = counter++;
    allChannelsResult.PWM_actual = PWM_actual;
    allChannelsResult.PWM_target = PWM_target;
    broadcast(JSON.stringify(allChannelsResult));
    //printValues();
}

function printValues() {
    var solarvals = allChannelsResult.busVoltage3 + ' V ' + allChannelsResult.current_mA3 + ' mA ' + allChannelsResult.power_mW3 + ' mW ';
    var batteryvals = allChannelsResult.busVoltage1 + ' V ' + allChannelsResult.current_mA1 + ' mA ' + allChannelsResult.power_mW1 + ' mW ';
    var line = allChannelsResult.date + ' ' + allChannelsResult.number + ' ' + solarvals + ' ' + batteryvals;
    console.log(line);
}

function onInit() {
    userMessage('MPPT test  Press button on Espruino to stop');
    //console.log(mypage.gethtml());
    start();
}

setWatch(function (e) {
    userMessage("Stop program");
    clearInterval(loopTimer);
}, BTN, { repeat: true, edge: 'rising' });


