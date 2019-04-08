

var logFile;
var logInterval;


// Wire up up MOSI, MISO, SCK and CS pins (along with 3.3v and GND)
SPI1.setup({ mosi: B5, miso: B4, sck: B3 });
E.connectSDCard(SPI1, B6 /*CS*/);
// see what's on the device
console.log(require("fs").readdirSync());

console.log("push button to start logging");






function doLog() {
  digitalPulse(LED2, 1, 50); // pulse green led as indicator
  logFile.write(getTime() + "," + E.getTemperature() + "\r\n"); // write the time and temperature for example
}

setWatch(function () {
  if (logFile === undefined) {
    console.log("logging started");
    console.log("push button to stop logging");

    logFile = E.openFile("log.txt", "a");
    console.log(require("fs").readFileSync("log.txt"));
    digitalWrite(LED1, 1); // red indicator on
    logInterval = setInterval(doLog, 1000);
  } else {
    clearInterval(logInterval);
    logInterval = undefined;
    logFile.close();
    logFile = undefined;
    console.log("now unmounting the SD card");
    E.unmountSD(); // card can now be pulled out
    digitalWrite(LED1, 0); // red indicator off
  }
}, BTN, { repeat: true, edge: 'rising', debounce: 50 });
setDeepSleep(1);



