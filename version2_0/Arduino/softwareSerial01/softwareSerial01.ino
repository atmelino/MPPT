/*

*/
#include <SoftwareSerial.h>
#include <ArduinoJson.h>

SoftwareSerial mySerial(2, 3); // RX, TX

void setup() {
  // Open serial communications and wait for port to open:
  Serial.begin(9600);
  while (!Serial) {
    ; // wait for serial port to connect. Needed for native USB port only
  }

  // set the data rate for the SoftwareSerial port
  mySerial.begin(9600);
}

void loop() { // run over and over
  StaticJsonBuffer<200> jsonBuffer;
  char json[50];
  String str;

  //read message from Espruino
  while (mySerial.available() > 0) {
    str = mySerial.readStringUntil('\n');

    //digitalWrite(LED_BUILTIN, HIGH);   // turn the LED on (HIGH is the voltage level)
    //delay(1000);                       // wait for a second
    //digitalWrite(LED_BUILTIN, LOW);    // turn the LED off by making the voltage LOW

    Serial.println("Arduino received:");
    Serial.println(str);
    str.toCharArray(json, 50);
    JsonObject& root = jsonBuffer.parseObject(json);
    if (!root.success()) {
      Serial.println("parseObject() failed");
    }
    else
    {
      if (root.containsKey("PWM")) {
        //Serial.println("PWM found");
        int pwmint = root["PWM"];
        Serial.println(pwmint);
      }
    }
    mySerial.write("Arduino sending response to Espruino\n");
  }
}
