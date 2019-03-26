
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
var interval;
var counter = 0;
var PWM_actual = 0.79;
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
            console.log(year);
            rtc.setDate(day, month, year);
        }
        // digitalWrite(LED2, receivedmessage.type == 'on');
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
    digitalWrite(B1, 1);
    analogWrite(A0, PWM_actual, { freq: 80000 });
    // Turn relay between battery and MC on
    digitalWrite(B0, 1);

    interval = setInterval(function () {
        allChannelsResult = ina.getAllChannels();
        solarVoltage = allChannelsResult.busVoltage3;
        batteryVoltage = allChannelsResult.busVoltage1;
        if (batteryVoltage < 7.7)
            digitalPulse(B13, 1, 50); // red LED
        if (batteryVoltage >= 7.7 && batteryVoltage < 8.0)
            digitalPulse(B14, 1, 50); // orange LED
        if (batteryVoltage >= 8.0)
            digitalPulse(B15, 1, 50); // green LED
        userMessage(rtc.readDateTime());
        currentDate = rtc.readDateTime();
        // console.log('channel 1: '+JSON.stringify(ina.getChannel1()));
        // console.log('channel 2: '+JSON.stringify(ina.getChannel2()));
        // console.log('channel 3: '+JSON.stringify(ina.getChannel3()));
        //console.log('channel 1: ' + JSON.stringify(ina.getChannel1String()));
        //console.log('channel 3: ' + JSON.stringify(ina.getChannel3String()));
        //console.log(JSON.stringify(allChannelsResult));
        allChannelsResult.date = currentDate;
        allChannelsResult.number = counter++;
        allChannelsResult.PWM_actual = PWM_actual;
        allChannelsResult.PWM_target = PWM_target;
        broadcast(JSON.stringify(allChannelsResult));

    }, 1000);
}


function onInit() {
    userMessage('MPPT test  Press button on Espruino to stop');
    //console.log(mypage.gethtml());
    start();
}

setWatch(function (e) {
    userMessage("Stop program");
    clearInterval(interval);
}, BTN, { repeat: true, edge: 'rising' });


