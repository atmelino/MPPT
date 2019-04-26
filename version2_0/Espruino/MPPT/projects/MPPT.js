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
var currentDateString;
var currentDate;
var counter = 0;
var PWM_actual = 0.0;
var PWM_target = 0;
var allChannelsResult;
var wifi = require('Wifi');
var clients = [];
var WIFI_NAME = "NETGEAR53";
//var WIFI_NAME = "TP-LINK_MR3040_4B611E";
var WIFI_OPTIONS = {
    password: ""
};
var myut = require("utils");
var myutils = new myut();
var myfs = require("fs");
var myws = require('ws');
var sendmessage = {
    type: "none",
    data: "empty"
};
var bufferarray = [];
var saveFileLines = 3;
var myfl = require("W25Q");
var myflash = new myfl(SPI1, B6 /*CS*/);
SPI1.setup({
    mosi: B5,
    miso: B4,
    sck: B3
});


function userMessage(msg) {
    const consExist = false;
    if (consExist)
        console.log(msg);
}

// Create and start server
function startServer() {
    const s = myws.createServer(pageHandler);
    s.on('websocket', wsHandler);
    s.listen(80);
}

// Page request handler
function pageHandler(req, res) {
    //console.log(JSON.stringify(req));
    clearInterval(loopTimer);
    var casevar;
    if (req.url == "/")
        casevar = 1;
    if (req.url == "/functions.js")
        casevar = 2;
    switch (casevar) {
        case 1:
            res.writeHead(200, {
                'Content-Type': 'text/html'
            });
            var HTMLpage = 112;
            var endFound = false;
            while (!endFound) {
                //console.log(HTMLpage);
                var page = myflash.readPageString(HTMLpage);
                res.write(page);
                HTMLpage++;
                if (page.includes("</html"))
                    endFound = true;
            }

            // numberOfPages = 80;
            // for (var p = startHTMLpage; p < startHTMLpage + numberOfPages; p++) {
            //     var page = myflash.readPageString(p);
            //     res.write(page);
            //     console.log(p);
            //     if (page.includes("</html")) {
            //         console.log("end of page found");
            //         //break;
            //     }
            // }

            res.end();
            break;
        case 2:
            console.log("/functions.js requested");
            res.writeHead(200);
            res.write("function domore() {alert('more');}");
            res.end();
            break;
        default:
            res.writeHead(200);
            res.end();
            break;
    }

    loopTimer = setInterval(mainLoop, loopPeriod);
}

function readHTML() {
    var webpage = require("index.html");
    var mypage = new webpage();
    var myhtml = mypage.gethtml().replace(/ +/g, ' ');
    return myhtml;
}

// WebSocket request handler
function wsHandler(ws) {
    clients.push(ws);
    ws.on('message', receivedpacket => {
        //console.log(WIFI_OPTIONS);
        //console.log(receivedpacket);
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
            SPI1.setup({ mosi: B5, miso: B4, sck: B3 });
            E.connectSDCard(SPI1, B6 /*CS*/);
            logFile = E.openFile("log.txt", "a");
            logFile.write(currentDateString + " loop period" + loopPeriod + "\n");
            logFile.close();
            E.unmountSD();
        }

        if (receivedmessage.type == "getLog") {
            var logContent;
            try {
                logFile = E.openFile("log.txt", "a");
                logContent = myfs.readFileSync("log.txt");
                logFile.close();
            }
            catch (e) {
                logContent = e.message;
            }
            finally {
                E.unmountSD();
                sendmessage.type = 'getLog';
                sendmessage.data = logContent;
                broadcast(JSON.stringify(sendmessage));
            }
        }

        if (receivedmessage.type == "getFile") {
            var fileContent;
            try {
                fileContent = myfs.readFileSync(receivedmessage.data);
            }
            catch (e) {
                fileContent = e.message;
            }
            finally {
                E.unmountSD();
                sendmessage.type = 'getFile';
                sendmessage.data = fileContent;
                broadcast(JSON.stringify(sendmessage));
            }
        }

        if (receivedmessage.type == "getDir") {
            var dirContent;
            try {
                dirContent = myfs.readdirSync(receivedmessage.data);
                //dirString = dirContent.join("\n");
                //console.log(dirString);
            }
            catch (e) {
                dirContent = e.message;
            }
            finally {
                E.unmountSD();
                sendmessage.type = 'getDir';
                sendmessage.data = dirContent;
                broadcast(JSON.stringify(sendmessage));
            }
        }

        if (receivedmessage.type == "enableDataFiles") {
            console.log(receivedmessage.data);
        }

        if (receivedmessage.type == "saveFileLines") {
            console.log(receivedmessage.data);
            saveFileLines = receivedmessage.data;
        }

        if (receivedmessage.type == "LED") {
            digitalWrite(LED2, receivedmessage.data == 'on'); // green LED
        }
    });

    ws.on('close', evt => {
        console.log("socket close " + JSON.stringify(evt));

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
    console.log("connect Wifi");
    // Connect to WiFi
    //digitalPulse(LED1, 1, [1000, 500, 1000]); // red LED
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
            console.log("Wifi connected");
            //digitalPulse(LED2, 1, [1000, 500, 1000]); // green LED
        });
    });
}


function start() {

    digitalWrite(B0, 1); // connect battery

    userMessage("Start Wifi");
    startWifi();

    // logFile = E.openFile("log.txt", "a");
    // currentDate = rtc.readDateTime();
    // logFile.write(currentDate + "," + "program start" + "\r\n");
    // logFile.close();
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
        digitalWrite(B1, 0); // PWM off disable IR2104
        analogWrite(A0, PWM_actual, { freq: 0 });
    }

    if (solarVoltage > 9.0) {
        digitalWrite(B0, 1); // connect battery
        if (batteryVoltage < 8.2) {
            PWM_actual += 0.02;
        }
        if (batteryVoltage >= 8.2 && batteryVoltage < 8.4) {
            PWM_actual += 0.001;
        }
        digitalWrite(B1, 1); // PWM on enable IR2104
        analogWrite(A0, PWM_actual, { freq: 80000 });
    }

    // prevent battery over discharge
    if (batteryVoltage < 7.6 && solarVoltage <= 8.0) {
        digitalWrite(B0, 0); //turn system off
    }

    currentDate = rtc.readDateTime();
    currentDateString = rtc.dateTimeToString(currentDate);
    allChannelsResult.dateString = currentDateString;
    allChannelsResult.number = counter++;
    allChannelsResult.PWM_actual = PWM_actual;
    allChannelsResult.PWM_target = PWM_target;
    sendmessage.type = 'values';
    sendmessage.data = allChannelsResult;


    //console.log("broadcast clients " + JSON.stringify(clients));
    broadcast(JSON.stringify(sendmessage));
    //printValues();

    var line = makeLine();
    //console.log(line);
    //console.log(bufferarray.length);

    bufferarray.push(line);
    if (bufferarray.length > saveFileLines) {
        //writeDataFile();

        //showPage(190);

        while (bufferarray.length > 0) {
            bufferarray.pop();
        }
    }
}


function showPages(start, number) {
    for (var index = start; index < start + number; index++) {
        console.log(index);
        console.log("page " + index + ":");
        console.log(myutils.hexdump(myflash.readPage(index), 16));
    }
}


function makeLine() {
    var solarvals = allChannelsResult.busVoltage3 + ' ' + allChannelsResult.current_mA3 + ' ' + allChannelsResult.power_mW3;
    var batteryvals = allChannelsResult.busVoltage1 + ' ' + allChannelsResult.current_mA1 + ' ' + allChannelsResult.power_mW1;
    var PWMvals = PWM_actual + ' ' + PWM_target;
    var line = allChannelsResult.dateString.replace(/ /g, "_") + ' ' + allChannelsResult.number + ' ' + solarvals + ' ' + batteryvals + ' ' + PWMvals + '\n';
    return line;
}

function printValues() {
    console.log(makeLine());
}

function writeDataFile() {
    buffer = bufferarray.join();

    var datestring = allChannelsResult.dateString.replace(/-/g, "_").replace(/:/g, "_").replace(/ /g, "_");
    var filename = datestring + ".txt";
    //digitalPulse(LED1, 1, [500, 300, 500]); // red LED

    try {
        var rootDir, yearDir, monthDir, dayDir;
        var year = "20" + currentDate.year;
        var month = "" + currentDate.month;
        var day = "" + currentDate.date;
        var yearMonth = year + '/' + month;
        var yearMonthDay = year + '/' + month + '/' + day;


        // create folder if it doesn't exist
        if (true) {
            // year
            rootDir = myfs.readdirSync();
            if (rootDir.indexOf(year) < 0) {
                myfs.mkdirSync(year);
            }

            // month
            yearDir = myfs.readdirSync(year);
            if (yearDir.indexOf(month) < 0) {
                myfs.mkdirSync(yearMonth);
            }

            // day
            monthDir = myfs.readdirSync(yearMonth);
            if (monthDir.indexOf(day) < 0) {
                myfs.mkdirSync(yearMonthDay);
            }
        }

        var fullPath = yearMonthDay + '/' + filename;
        console.log('full path: ' + fullPath);
        dataFile = E.openFile(fullPath, "a");
        dataFile.write(buffer);
        dataFile.close();
        console.log('file ' + fullPath + ' written');

    }
    catch (e) {
    }
    //digitalPulse(LED2, 1, [500, 300, 500]); // green LED

}

function onInit() {
    userMessage('MPPT test  Press button on Espruino to stop');
    start();
}

setWatch(function (e) {
    //console.log(myfs.readFileSync("log.txt")); //
    digitalPulse(LED1, 1, 200); // pulse red led as indicator
    userMessage("Stop program");
    clearInterval(loopTimer);
    digitalPulse(LED1, 1, 500); // pulse red led as indicator

}, BTN, { repeat: true, edge: 'rising' });

setTimeout(function () {
    save();
}, (1000));
