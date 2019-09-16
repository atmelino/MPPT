// Import required libraries
#include "WiFi.h"
#include "ESPAsyncWebServer.h"
#include "SPIFFS.h"
#include <Wire.h>
#include <SDL_Arduino_INA3221.h>
#include <ArduinoJson.h>
#include "FS.h"
#include "SD.h"
#include "SPI.h"
#include "RTClib.h"

RTC_DS1307 rtc;

SDL_Arduino_INA3221 ina3221;
#define CHB 1 // Battery INA channel 2 but 1 for array
#define CHS 2// Solar INA channel 3 but 2 for array

uint8_t pulseWidth = 0;          // a value from 0 to 255 representing the hue
//uint32_t freq = 82000;
uint32_t freq = 80000;
uint8_t resolution_bits = 8;
uint8_t channel = 1;
uint8_t PWM_OUT = 4;
uint8_t PWM_ENABLE_PIN = 15;
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

char dateTime[20];
char dataLine[200];

AsyncWebServer server(80);
AsyncWebSocket ws("/ws");
void onWsEvent(AsyncWebSocket * server, AsyncWebSocketClient * client, AwsEventType type, void * arg, uint8_t *data, size_t len) {
  Serial.println("WebSocket onWsEvent");
  if (type == WS_EVT_CONNECT) {
    Serial.println("Websocket client connection received");
    //client->text("Hello from ESP32 Server");
  } else if (type == WS_EVT_DISCONNECT) {
    Serial.println("Client disconnected");
  } else if (type == WS_EVT_DATA) {
    Serial.println("WebSocket onWsEvent WS_EVT_DATA");
    AwsFrameInfo * info = (AwsFrameInfo*)arg;
    String msg = "";
    if (info->final && info->index == 0 && info->len == len) {
      //the whole message is in a single frame and we got all of it's data
      Serial.printf("ws[%s][%u] %s-message[%llu]: ", server->url(), client->id(), (info->opcode == WS_TEXT) ? "text" : "binary", info->len);
      if (info->opcode == WS_TEXT) {
        for (size_t i = 0; i < info->len; i++) {
          msg += (char) data[i];
        }
      } else {
        char buff[3];
        for (size_t i = 0; i < info->len; i++) {
          sprintf(buff, "%02x ", (uint8_t) data[i]);
          msg += buff ;
        }
      }
      Serial.printf("%s\n", msg.c_str());
    }
  }
}


void setup(void)
{

  Serial.begin(115200);
  Serial.println("MPPT ESP32");

  if (! rtc.begin()) {
    Serial.println("Couldn't find RTC");
  }

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

  makeHeaderLine();
  Serial.println(dataLine);

  ina3221.begin();

  pinMode(ledPin, OUTPUT);
  digitalWrite(ledPin, LOW);// Turn off on-board blue led
  //digitalWrite(ledPin, HIGH);


  if (!SD.begin()) {
    Serial.println("Card Mount Failed");
    return;
  } else {
    Serial.println("Card Mount success");
    listDir(SD, "/", 0);

  }


  // enable MOSFET driver chip
  pinMode(PWM_ENABLE_PIN, OUTPUT); // GPIO as output
  digitalWrite(PWM_ENABLE_PIN, LOW);
  digitalWrite(PWM_ENABLE_PIN, HIGH);

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

  makeDataLine();
  Serial.println(dataLine);
  sendDataLine();

  delay(1000);

  //pulseWidth += 5;
  pulseWidth = 190;
  ledcWrite(1, pulseWidth); //

}

void sendDataLine() {
  StaticJsonDocument<200> doc;
  char json_string[256];
  doc["type"] = "livedata";
  doc["data"] = dataLine;
  serializeJson(doc, json_string);
  //Serial.println(json_string);

  ws.printfAll(json_string);

}

void makeDataLine() {
  char* myDate = "2019-09-09_14:57:34";
  makeDateTime();
  sprintf(dataLine, "%s %5d %.3f %.3f %.3f %.3f %.3f %.3f %4d", dateTime, count, bv[CHS], cmA[CHS], pw[CHS], bv[CHB], cmA[CHB], pw[CHB], pulseWidth);
}

void makeHeaderLine() {

  sprintf(dataLine, "%19s %5s %6s %6s %6s %5s %5s %5s %3s", "Date", "no", "Volt", "mA", "mW", "Volt", "mA", "mW", "PWM");
}

void makeDateTime() {
  DateTime now = rtc.now();

  sprintf(dateTime, "%4d-%02d-%02d_%02d:%02d:%02d\0", now.year(), now.month(), now.day(), now.hour(), now.minute(), now.second());
}

void listDir(fs::FS & fs, const char * dirname, uint8_t levels) {
  Serial.printf("Listing directory: %s\n", dirname);

  File root = fs.open(dirname);
  if (!root) {
    Serial.println("Failed to open directory");
    return;
  }
  if (!root.isDirectory()) {
    Serial.println("Not a directory");
    return;
  }

  File file = root.openNextFile();
  while (file) {
    if (file.isDirectory()) {
      Serial.print("  DIR : ");
      Serial.println(file.name());
      if (levels) {
        listDir(fs, file.name(), levels - 1);
      }
    } else {
      Serial.print("  FILE: ");
      Serial.print(file.name());
      Serial.print("  SIZE: ");
      Serial.println(file.size());
    }
    file = root.openNextFile();
  }
}
