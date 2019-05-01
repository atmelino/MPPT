var rpio = require('rpio');

var relaypin=16;

/*
 * Set the initial state to low.  The state is set prior to the pin
 * being actived, so is safe for devices which require a stable setup.
 */
rpio.open(relaypin, rpio.OUTPUT, rpio.LOW);
 
/*
 * The sleep functions block, but rarely in these simple programs does
 * one care about that.  Use a setInterval()/setTimeout() loop instead
 * if it matters.
 */
for (var i = 0; i < 5; i++) {
        /* On for 1 second */
        console.log('Pin relaypin high');
        rpio.write(relaypin, rpio.HIGH);
        rpio.sleep(3);
 
        /* Off for half a second (500ms) */
        console.log('Pin relaypin low');
        rpio.write(relaypin, rpio.LOW);
        rpio.msleep(4);
}

