// Import required libraries
#include "WiFi.h"
#include "ESPAsyncWebServer.h"
#include "SPIFFS.h"
#include <Wire.h>
#include <SDL_Arduino_INA3221.h>
#include <ArduinoJson.h>

SDL_Arduino_INA3221 ina3221;
// the three channels of the INA3221 named for SunAirPlus Solar Power Controller channels (www.switchdoc.com)
#define CHANNEL_BATTERY 1 // channel 2 but 1 for array
#define CHANNEL_SOLAR 2// channel 3 but 2 for array

uint8_t pulseWidth = 0;          // a value from 0 to 255 representing the hue
uint32_t freq = 82000;
uint8_t resolution_bits = 8;
uint8_t channel = 1;
uint8_t PWM_OUT = 4;
uint8_t PWM_ENABLE_PIN = 18;
const int ledPin = 2; // on-board blue led (also internally pulled up)

byte requestedPulseWidth = 130;

static char line[4][21] = {"                    ", "                    ", "                    ", "                    "};
float sv[3], bv[3], cmA[3], lv[3], pw[3];
static char bvstr[10];
static char cmAstr[10];
static char pwstr[10];
static char pwmstr[10];
static char tapwmstr[10];
// Replace with your network credentials
const char* ssid = "NETGEAR53";
const char* password = "";
int count = 0;
char JSONMessage[] = " {\"type\": \"livedata\", \"data\": 10}"; //Original message
StaticJsonDocument<200> doc;
char json_string[256];
char dataLine[100];

AsyncWebServer server(80);
AsyncWebSocket ws("/ws");
void onWsEvent(AsyncWebSocket * server, AsyncWebSocketClient * client, AwsEventType type, void * arg, uint8_t *data, size_t len) {
  if (type == WS_EVT_CONNECT) {
    Serial.println("Websocket client connection received");
    //client->text("Hello from ESP32 Server");


    doc["type"] = "livedata";
    //doc["data"] = line[0];
    doc["data"] = dataLine;
    
    //serializeJson(doc, Serial);
    //serializeJson(doc, char* output, size_t outputSize);
    serializeJson(doc, json_string);

    client->text(json_string);

  } else if (type == WS_EVT_DISCONNECT) {
    Serial.println("Client disconnected");
  }
}


void setup(void)
{

  Serial.begin(115200);
  Serial.println("MPPT ESP32");

  // Initialize SPIFFS
  if (!SPIFFS.begin(true)) {
    //Serial.println("An Error has occurred while mounting SPIFFS");
    return;
  }
  else {
    digitalWrite(ledPin, HIGH);
    delay(300);
  }
  // Connect to Wi-Fi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    digitalWrite(ledPin, LOW);
    delay(1000);
    digitalWrite(ledPin, HIGH);

    //Serial.println("Connecting to WiFi..");
  }

  // Print ESP32 Local IP Address
  Serial.println(WiFi.localIP());


  // Start server
  ws.onEvent(onWsEvent);
  server.addHandler(&ws);
  // Route for root / web pages and javascript
  server.on("/", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/index.html", "text/html");
  });
  server.on("/MPPT.css", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/MPPT.css", "text/css");
  });
  server.on("/MPPT.js", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/MPPT.js", "text/javascript");
  });
  server.begin();

  Serial.println("no  Volt     mA   mW     Volt     mA   mW   eff    PWM   target");

  ina3221.begin();

  pinMode(ledPin, OUTPUT);
  digitalWrite(ledPin, LOW);// Turn off on-board blue led
  //digitalWrite(ledPin, HIGH);

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

  // acquire voltages and currents
  for (int i = 0; i < 3; i++) {
    bv[i] = ina3221.getBusVoltage_V(i + 1);
    sv[i] = ina3221.getShuntVoltage_mV(i + 1);
    cmA[i] = ina3221.getCurrent_mA(i + 1);
    lv[i] = bv[i] + (sv[i] / 1000);
    pw[i] = bv[i] * cmA[i];
  }

  printValuesSerial(  bv, cmA,  pw);
  makeDataLine();
  Serial.println(dataLine);


  delay(2000);

  //pulseWidth += 5;
  pulseWidth = 200;
  ledcWrite(1, pulseWidth); //

}




void makeDataLine() {
  char* myDate = "2019-09-09_14:57:34";

  int i;
  i = CHANNEL_SOLAR;

  sprintf(dataLine, "%s %5d %.3f %.3f", myDate, count, bv[1],cmA[1]);

  //memcpy(dataLine, "2019-09-09_14:57:34 100 ", 0 );
  i = CHANNEL_SOLAR;
  dtostrf(bv[i], 5, 2, bvstr);
  dtostrf(cmA[i], 7, 2, cmAstr);
  dtostrf(pw[i], 7, 2, pwstr);
  line[0][5] = ' ';
  memcpy(&line[0][6], cmAstr, 6);
  line[0][12] = ' ';
  memcpy(&line[0][13], pwstr, 6);

  //  var solarvals = inaValues.busVoltage3.toFixed(3) + " " + inaValues.current_mA3.toFixed(3) + " " + inaValues.power_mW3.toFixed(3);
  //  var batteryvals = inaValues.busVoltage1.toFixed(3) + " " + inaValues.current_mA1.toFixed(3) + " " + inaValues.power_mW1.toFixed(3);
  //  var c = ("00000" + count).slice(-5);
  //  var line = dateTimeString + " " + c + " " + solarvals + " " + batteryvals + " " + PWM_actual.toFixed(2);
  //  return line;
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
