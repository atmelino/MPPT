const I2CScanner = require('https://raw.githubusercontent.com/PaddeK/espruino-i2c-scanner/master/I2CScanner.js');

// Setup I2C
// Setup I2C
var i2c = new I2C();
i2c.setup({ sda: B4, scl: B3 });



//I2C1.setup({ scl: B4, sda: B3 });

// Start scan
I2CScanner.scan({ i2c: i2c, serial: USB });

