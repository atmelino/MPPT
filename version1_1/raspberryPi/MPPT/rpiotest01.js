var rpio = require('rpio');




rpio.open(11, rpio.INPUT);
console.log('Pin 11 is currently ' + (rpio.read(11) ? 'high' : 'low'));

/*
 * Set the initial state to low.  The state is set prior to the pin
 * being actived, so is safe for devices which require a stable setup.
 */
rpio.open(12, rpio.OUTPUT, rpio.LOW);
 
/*
 * The sleep functions block, but rarely in these simple programs does
 * one care about that.  Use a setInterval()/setTimeout() loop instead
 * if it matters.
 */
for (var i = 0; i < 5; i++) {
        /* On for 1 second */
        console.log('Pin 12 high');
        rpio.write(12, rpio.HIGH);
        rpio.sleep(1);
 
        /* Off for half a second (500ms) */
        console.log('Pin 12 low');
        rpio.write(12, rpio.LOW);
        rpio.msleep(500);
}

