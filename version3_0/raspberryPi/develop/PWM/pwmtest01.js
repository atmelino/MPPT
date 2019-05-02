var rpio = require('rpio');
const raspi = require('raspi');
const pwm = require('raspi-pwm');

var IR2104enablepin=18;

rpio.open(IR2104enablepin, rpio.OUTPUT, rpio.HIGH);


raspi.init(() => {
        const led = new pwm.PWM({ pin: 'P1-12', frequency: 80000 });
        led.write(0.5); // 50% Duty Cycle, aka half brightness
});

