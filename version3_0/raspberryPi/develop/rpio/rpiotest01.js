var rpio = require('rpio');

var relaypin=16;
var LEDgreen=11;
var LEDorange=13;
var LEDred=15;

/*
 * Set the initial state to low.  The state is set prior to the pin
 * being actived, so is safe for devices which require a stable setup.
 */
rpio.open(relaypin, rpio.OUTPUT, rpio.LOW);
rpio.open(LEDgreen, rpio.OUTPUT, rpio.LOW);
rpio.open(LEDorange, rpio.OUTPUT, rpio.LOW);
rpio.open(LEDred, rpio.OUTPUT, rpio.LOW);
 
/*
 * The sleep functions block, but rarely in these simple programs does
 * one care about that.  Use a setInterval()/setTimeout() loop instead
 * if it matters.
 */
for (var i = 0; i < 5; i++) {
        /* On for 1 second */
        console.log('Pin LEDgreen high');
        rpio.write(LEDgreen, rpio.HIGH);
        rpio.sleep(1);
 
        /* Off for half a second (500ms) */
        console.log('Pin LEDgreen low');
        rpio.write(LEDgreen, rpio.LOW);
        rpio.msleep(1);

        /* On for 1 second */
        console.log('Pin LEDorange high');
        rpio.write(LEDorange, rpio.HIGH);
        rpio.sleep(1);
 
        /* Off for half a second (500ms) */
        console.log('Pin LEDorange low');
        rpio.write(LEDorange, rpio.LOW);
        rpio.msleep(1);

        /* On for 1 second */
        console.log('Pin LEDred high');
        rpio.write(LEDred, rpio.HIGH);
        rpio.sleep(1);
 
        /* Off for half a second (500ms) */
        console.log('Pin LEDred low');
        rpio.write(LEDred, rpio.LOW);
        rpio.msleep(1);

        /* On for 1 second */
        console.log('Pin relaypin high');
        rpio.write(relaypin, rpio.HIGH);
        rpio.sleep(3);
 
        /* Off for half a second (500ms) */
        console.log('Pin relaypin low');
        rpio.write(relaypin, rpio.LOW);
        rpio.msleep(4);
}

