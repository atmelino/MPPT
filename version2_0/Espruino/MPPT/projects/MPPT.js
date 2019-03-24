
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
var toggle = false;
var result1;
var result2;
var allChannelsResult;


var webpage = require("webpage");
var mypage=new webpage();

var wifi = require('Wifi');
var clients = [];
var WIFI_NAME = "NETGEAR53";
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
    ws.on('message', msg => {
        digitalWrite(LED2, msg == 'on');
        digitalWrite(B0, msg == 'on');
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

function getChannel1() {
    result1 = ina.readChannel1();
    var bV1 = result1.busVoltage.toString();
    var sV1 = result1.shuntVoltage.toString();
    var I1 = result1.current_mA;
    var P1 = I1 * bV1;
    var line1 = "channel 1: bus " + bV1 + " V shunt " + sV1 + " mV current " + I1 + " mA power " + P1 + "mW";
    return line1;
}

function getChannel2() {
    result2 = ina.readChannel2();
    var bV2 = result2.busVoltage.toString();
    var sV2 = result2.shuntVoltage.toString();
    var I2 = result2.current_mA;
    var P2 = I2 * bV2;
    var line2 = "channel 2: bus " + bV2 + " V shunt " + sV2 + " mV current " + I2 + " mA power " + P2 + "mW";
    return line2;
}

function getChannel3() {
    result3 = ina.readChannel3();
    var bV3 = result3.busVoltage.toString();
    var sV3 = result3.shuntVoltage.toString();
    var I3 = result3.current_mA;
    var P3 = I3 * bV3;
    var line3 = "channel 3: bus " + bV3 + " V shunt " + sV3 + " mV current " + I3 + " mA power " + P3 + "mW";
    return line3;
}

function start() {
    userMessage("Start Wifi");
    startWifi();

    userMessage('Turning PWM on');
    digitalWrite(B1, 1);
    analogWrite(A0, 0.8, { freq: 80000 });
    // Turn relay on
    digitalWrite(B0, 1);


    interval = setInterval(function () {
        digitalPulse(B13, 1, 50); // pulse  led as indicator
        digitalPulse(B14, 1, 50); // pulse  led as indicator
        digitalPulse(B15, 1, 50); // pulse  led as indicator
        userMessage(rtc.readDateTime());
        //userMessage(getChannel1());
        //userMessage(getChannel3());
        //broadcast('hello');
        //broadcast(getChannel1());
        allChannelsResult=ina.readAllChannels();
        //console.log(JSON.stringify(allChannelsResult));
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




