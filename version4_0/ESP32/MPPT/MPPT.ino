



#include <Wire.h>
#include <SDL_Arduino_INA3221.h>

SDL_Arduino_INA3221 ina3221;

// the three channels of the INA3221 named for SunAirPlus Solar Power Controller channels (www.switchdoc.com)
#define CHANNEL_BATTERY 2
#define CHANNEL_SOLAR 3
#define OUTPUT_CHANNEL 1

uint8_t pulseWidth = 0;          // a value from 0 to 255 representing the hue
uint32_t freq = 82000;
uint8_t resolution_bits = 8;
uint8_t channel = 1;
uint8_t PWM_OUT = 4;
uint8_t PWM_ENABLE_PIN = 2;
uint8_t myLed = 5;  // on-board blue led (also internally pulled up)
byte requestedPulseWidth = 130;

static char line[4][21] = {"                    ", "                    ", "                    ", "                    "};
float sv[3], bv[3], cmA[3], lv[3], pw[3];
static char bvstr[10];
static char cmAstr[10];
static char pwstr[10];
static char pwmstr[10];
static char tapwmstr[10];

int count = 0;

void setup(void)
{

  Serial.begin(115200);
  Serial.println("MPPT ESP32");
  Serial.println("no  Volt     mA   mW     Volt     mA   mW   eff    PWM   target");

  ina3221.begin();

  pinMode(myLed, OUTPUT);
  digitalWrite(myLed, LOW);// Turn off on-board blue led
  //digitalWrite(myLed, HIGH);

  // enable MOSFET driver chip
  pinMode(PWM_ENABLE_PIN, OUTPUT); // GPIO as output
  digitalWrite(PWM_ENABLE_PIN, LOW);

  ledcAttachPin(PWM_OUT, 1); // assign IR2104 PWM signal to channels

  // Initialize channels
  // channels 0-15, resolution 1-16 bits, freq limits depend on resolution
  ledcSetup( channel,  freq, resolution_bits);
  //ledcSetup(1, 82000, 8); // 12 kHz PWM, 8-bit resolution

}

void loop(void)
{
  count++;

  Serial.println("------------------------------");



//  float shuntvoltage1 = 0;
//  float busvoltage1 = 0;
//  float current_mA1 = 0;
//  float loadvoltage1 = 0;
//
//  busvoltage1 = ina3221.getBusVoltage_V(CHANNEL_BATTERY);
//  shuntvoltage1 = ina3221.getShuntVoltage_mV(CHANNEL_BATTERY);
//  current_mA1 = -ina3221.getCurrent_mA(CHANNEL_BATTERY);  // minus is to get the "sense" right.   - means the battery is charging, + that it is discharging
//  loadvoltage1 = busvoltage1 + (shuntvoltage1 / 1000);
//
//  Serial.print("LIPO_Battery Bus Voltage:   "); Serial.print(busvoltage1); Serial.println(" V");
//  Serial.print("LIPO_Battery Shunt Voltage: "); Serial.print(shuntvoltage1); Serial.println(" mV");
//  Serial.print("LIPO_Battery Load Voltage:  "); Serial.print(loadvoltage1); Serial.println(" V");
//  Serial.print("LIPO_Battery Current 1:       "); Serial.print(current_mA1); Serial.println(" mA");
//  Serial.println("");


  // acquire voltages and currents
  for (int i = 0; i < 3; i++) {
    bv[i] = ina3221.getBusVoltage_V(i + 1);
    sv[i] = ina3221.getShuntVoltage_mV(i + 1);
    cmA[i] = ina3221.getCurrent_mA(i + 1);
    lv[i] = bv[i] + (sv[i] / 1000);
    pw[i] = bv[i] * cmA[i];
  }


  printValuesSerial(  bv, cmA,  pw);
  
  float shuntvoltage2 = sv[2];
  float busvoltage2 = bv[2];
  float current_mA2 = cmA[2];
  float loadvoltage2 = lv[2];

//  busvoltage2 = ina3221.getBusVoltage_V(CHANNEL_SOLAR);
//  shuntvoltage2 = ina3221.getShuntVoltage_mV(CHANNEL_SOLAR);
//  current_mA2 = -ina3221.getCurrent_mA(CHANNEL_SOLAR);
//  loadvoltage2 = busvoltage2 + (shuntvoltage2 / 1000);

  Serial.print("Solar Cell Bus Voltage 2:   "); Serial.print(busvoltage2); Serial.println(" V");
  Serial.print("Solar Cell Shunt Voltage 2: "); Serial.print(shuntvoltage2); Serial.println(" mV");
  Serial.print("Solar Cell Load Voltage 2:  "); Serial.print(loadvoltage2); Serial.println(" V");
  Serial.print("Solar Cell Current 2:       "); Serial.print(current_mA2); Serial.println(" mA");
  Serial.println("");

  
  delay(2000);

  //pulseWidth += 5;
  pulseWidth = 200;
  ledcWrite(1, pulseWidth); // write red component to channel 1, etc.

}


void printValuesSerial(  float bv[], float cmA[], float pw[]) {
  float eff = pw[CHANNEL_BATTERY] / pw[CHANNEL_SOLAR];
  makeLines( bv, cmA,  pw) ;
  //Serial.print("{\"type\":\"data\",\"line\":\"");
  Serial.print(count);
  Serial.print(" ");
  Serial.print(line[0]);
  Serial.print(" ");
  Serial.print(line[1]);
  Serial.print(" ");
  Serial.print(eff);
  Serial.print(" ");
  Serial.print(pulseWidth);
  Serial.print(" ");
  Serial.print(requestedPulseWidth);
  Serial.print("\"}");
  Serial.println();
}

void makeLines( float bv[], float cmA[], float pw[])  {
  int i;
  i = CHANNEL_SOLAR;
  dtostrf(bv[i], 5, 2, bvstr);
  dtostrf(cmA[i], 7, 2, cmAstr);
  dtostrf(pw[i], 7, 2, pwstr);
  memcpy(line[0], bvstr, 5);
  line[0][5] = ' ';
  memcpy(&line[0][6], cmAstr, 6);
  line[0][12] = ' ';
  memcpy(&line[0][13], pwstr, 6);

  i = CHANNEL_BATTERY;
  dtostrf(bv[i], 5, 2, bvstr);
  dtostrf(cmA[i], 7, 2, cmAstr);
  dtostrf(pw[i], 7, 2, pwstr);
  memcpy(line[1], bvstr, 5);
  line[1][5] = ' ';
  memcpy(&line[1][6], cmAstr, 6);
  line[1][12] = ' ';
  memcpy(&line[1][13], pwstr, 6);

  dtostrf(pulseWidth, 5, 2, pwmstr);
  dtostrf(requestedPulseWidth, 5, 2, tapwmstr);
  memcpy(line[2], pwmstr, 5);
  line[2][5] = ' ';
  memcpy(&line[2][6], tapwmstr, 6);
}
