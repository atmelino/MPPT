// Setup I2C
var i2c = new I2C();
i2c.setup({sda:B4, scl:B3});
// initialise INA226
var INA226 = require("INA226");
var ina = new INA226(i2c, { 
  average:1024, // how many samples to take and average (1024 = about 1 reading a second)
  shunt:0.1, // the shunt resistor's value
  maxCurrent: 10  // max current we expect to measure (the lower this is the more accurate measurements are)
});
// You can now simply read the data
print(ina.read());
/* Outputs something like:
{ "vshunt": 0.024475, 
  "vbus": 9.80875, 
  "power": 0.23651123046, 
  "current": 0.0244140625,
  "overflow": false 
}
*/
