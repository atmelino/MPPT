/*

*/

uint8_t myLed = 5;  // on-board blue led (also internally pulled up)
uint8_t duty = 0;          // a value from 0 to 255 representing the hue
uint32_t freq = 82000;
uint8_t resolution_bits = 8;
uint8_t channel = 1;
uint8_t PWM_OUT = 4;
uint8_t PWM_ENABLE_PIN = 2;


// the setup routine runs once when you press reset:
void setup()
{
  Serial.begin(115200);

  pinMode(myLed, OUTPUT);
  digitalWrite(myLed, LOW);// Turn off on-board blue led

  // enable MOSFET driver chip
  pinMode(PWM_ENABLE_PIN, OUTPUT); // GPIO as output
  digitalWrite(PWM_ENABLE_PIN, HIGH);

  ledcAttachPin(PWM_OUT, 1); // assign IR2104 PWM signal to channels

  // Initialize channels
  // channels 0-15, resolution 1-16 bits, freq limits depend on resolution
  ledcSetup( channel,  freq, resolution_bits);
  //ledcSetup(1, 82000, 8); // 12 kHz PWM, 8-bit resolution

}

// void loop runs over and over again
void loop()
{
  for (duty = 0; duty < 255; duty++) { // Slew through the duty spectrum

    Serial.println(duty);
    ledcWrite(1, duty); // write red component to channel 1, etc.

    delay(100); // full cycle of rgb over 256 dutys takes 26 seconds
  }

  digitalWrite(myLed, HIGH);
  delay(10);
  digitalWrite(myLed, LOW); // indicate end of cycle
}
