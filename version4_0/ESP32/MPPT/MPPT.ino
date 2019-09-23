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

// pin assignment
const int ledPin = 2; // on-board blue led (also internally pulled up)
const int PWM_OUT = 4;
const int PWM_ENABLE_PIN = 15;
const int RelayPin = 32;

// PWM
uint8_t PWM_actual = 100; // a value from 0 to 255
uint8_t PWM_requested = 130;
boolean PWMModeMPPT = true;
//uint32_t freq = 82000;
uint32_t freq = 80000;
uint8_t resolution_bits = 8;
uint8_t channel = 1;

// Replace with your network credentials
const char* ssid = "NETGEAR53";
const char* password = "";
int count = 0;

RTC_DS1307 rtc;
char dateTime[20];
SDL_Arduino_INA3221 ina3221;
#define CHB 1 // Battery INA channel 2 but 1 for array
#define CHS 2// Solar INA channel 3 but 2 for array
float sv[3], bv[3], cmA[3], lv[3], pw[3];
char headerLine[80];
# define maxLines 240
char dataLines[maxLines][80];
int linePointer = 0;
boolean DataFilesYesNo = true;
int DataFileLines = 10;

AsyncWebServer server(80);
AsyncWebSocket ws("/ws");
void onWsEvent(AsyncWebSocket * server, AsyncWebSocketClient * client, AwsEventType type, void * arg, uint8_t *data, size_t len) {
  StaticJsonDocument<256> doc;
  //Serial.println("WebSocket onWsEvent");
  if (type == WS_EVT_CONNECT) {
    Serial.println("Websocket client connection received");
    //client->text("Hello from ESP32 Server");
  } else if (type == WS_EVT_DISCONNECT) {
    Serial.println("Client disconnected");
  } else if (type == WS_EVT_DATA) {
    //Serial.println("WebSocket onWsEvent WS_EVT_DATA");
    AwsFrameInfo * info = (AwsFrameInfo*)arg;
    String msg = "";
    Serial.printf("ws[%s][%u] text-message[%llu]: ", server->url(), client->id(), len);
    for (size_t i = 0; i < len; i++) {
      msg += (char) data[i];
    }
    Serial.printf("%s\n", msg.c_str());

    auto error = deserializeJson(doc, msg);
    if (error) {
      Serial.print(F("deserializeJson() failed with code "));
      Serial.println(error.c_str());
      return;
    }

    String type = doc["type"];
    Serial.print("message type: ");
    Serial.println(type);

    if (type == "PWM") {
      String PWM = doc["data"];
      PWM_actual = PWM.toInt();
      ledcWrite(1, PWM_actual);
    }

    if (type == "SetRTC") {
      // rtc.adjust(DateTime(2014, 1, 21, 3, 0, 0));
      rtc.adjust(DateTime(F(__DATE__), F(__TIME__)));
    }

    if (type == "enableDataFiles") {
      String enableDataFiles = doc["data"];
      if (doc["data"] == "true") {
        DataFilesYesNo = true;
        //Serial.println("save DataFiles to SD true");
      } else {
        DataFilesYesNo = false;
        //Serial.println("save DataFiles to SD false");
      }
      saveSettings();
    }

    if (type == "listSPIFFS") {
      File root = SPIFFS.open("/");
      File file = root.openNextFile();
      while (file) {
        Serial.print("FILE: ");
        Serial.println(file.name());
        file = root.openNextFile();
      }
    }

    if (type == "listSD") {
      listDir(SD, "/", 2);
    }

    if (type == "getSettings") {
      char data[100];
      readFileSPIFFS("/settings.json",  data);
      Serial.println(data);

      StaticJsonDocument<100> docSettings;
      char json_stringSettings[200];
      DeserializationError error = deserializeJson(docSettings, data);
      //      if (error) {
      //        Serial.print(F("deserializeJson() failed: "));
      //        Serial.println(error.c_str());
      //      } else {
      //        Serial.println("no error");
      //
      //        char json_string[256];
      //        serializeJson(docSettings, json_stringSettings);
      //        Serial.println(json_stringSettings);
      //        const char* df = docSettings["DataFilesYesNo"];
      //        Serial.println(df);
      //      }

      StaticJsonDocument<200> doc;
      char json_string[256];
      doc["type"] = "getSettings";
      doc["data"] = docSettings;
      serializeJson(doc, json_string);
      Serial.println(json_string);
      ws.printfAll(json_string);
    }

    if (type == "getStatus") {
      StaticJsonDocument<200> doc;
      char json_string[256];
      doc["type"] = "getSettings";
      doc["DataFilesYesNo"] = (DataFilesYesNo ? "true" : "false");
      serializeJson(doc, json_string);
      ws.printfAll(json_string);
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
    StaticJsonDocument<200> doc;
    char data[100];
    readFileSPIFFS("/settings.json",  data);
    Serial.println(data);
    auto error = deserializeJson(doc, data);
    if (error) {
      Serial.print(F("deserializeJson() failed with code "));
      Serial.println(error.c_str());
      return;
    }
    String df = doc["DataFilesYesNo"];
    Serial.println(df);
    if (df == "true")
      DataFilesYesNo = true;
    else
      DataFilesYesNo = false;

    //digitalWrite(ledPin, HIGH);
    //delay(300);
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
  Serial.println(headerLine);

  ina3221.begin();

  pinMode(ledPin, OUTPUT);
  digitalWrite(ledPin, LOW);// Turn off on-board blue led
  //digitalWrite(ledPin, HIGH);


  if (!SD.begin()) {
    Serial.println("Card Mount Failed");
    return;
  } else {
    Serial.println("Card Mount success");
    listDir(SD, "/", 2);
  }

  // PWM
  pinMode(PWM_ENABLE_PIN, OUTPUT); // GPIO as output
  digitalWrite(PWM_ENABLE_PIN, HIGH);
  ledcAttachPin(PWM_OUT, 1); // assign IR2104 PWM signal to channels
  // channels 0-15, resolution 1-16 bits, freq limits depend on resolution
  ledcSetup( channel,  freq, resolution_bits);
  //PWM_actual += 5;
  PWM_actual = 190;
  ledcWrite(1, PWM_actual); //

  // Relay to battery
  pinMode(RelayPin, OUTPUT);
  digitalWrite(RelayPin, HIGH);

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

  float batteryVoltage = bv[CHB];
  float solarVoltage = bv[CHS];
  float batteryCurrent = cmA[CHB];

  if (PWMModeMPPT) {
    if (batteryVoltage > 8.4) { // prevent battery overvoltage
      //Serial.println("battery over voltage");
      PWM_actual -= 5;
      setPWM();
    }
    if (abs(batteryCurrent) > 1050) {
      //Serial.println("battery over current");
      PWM_actual -= 5;
      setPWM();
    }
    if (solarVoltage > 10.0 && batteryVoltage >= 8.2) {
      //Serial.println("increase voltage slow");
      PWM_actual += 1;
      setPWM();
    }
    if (solarVoltage > 10.0 && batteryVoltage < 8.2) {
      //Serial.println("increase voltage fast");
      PWM_actual += 5;
      setPWM();
    }
    if (solarVoltage <= 10.0 && batteryVoltage >= 7.6) {
      //Serial.println("solar under voltage");
      stopPWM();
    }
    if (solarVoltage <= 10.0 && batteryVoltage < 7.6) { // prevent battery over discharge
      //Serial.println("solar and battery under voltage");
      //logEntry("low battery shutdown");
      stopPWM();
      //DataFilesYesNo = false;
      //        if (true) {
      //          LEDblink();
      //          clearInterval(loopTimer);
      //          // give it a bit of time before turning off power
      //          setInterval(function () {
      //            rpio.write(relaypin, rpio.LOW);// disconnect battery
      //          }, 10000);
      //        }
    }

  } else {
    if (batteryVoltage > 8.4) // prevent battery overvoltage
    {
      //Serial.println("battery over voltage");
      PWM_actual -= 5;
      PWM_requested = PWM_actual;
      setPWM();
    } else {
      PWM_actual = PWM_requested;
      setPWM();
    }
  }

  makeDataLine();
  //Serial.println(dataLines[linePointer]);
  sendDataLine();

  linePointer++;
  if (linePointer >= maxLines  || linePointer >=  DataFileLines)
  {
    linePointer = 0;

    for (size_t i = 0; i < DataFileLines; i++) {
      Serial.println(dataLines[i]);
    }

    if (DataFilesYesNo) {
      writeDataFile(dateTime);
    }
  }

  //debugMsgln("Keep every " + keepMeasurement + " measurements", 0);
  //debugMsgln("count " + count + " remainder " + count % keepMeasurement, 0);
  //    if (count % keepMeasurement == 0) {
  //      bufferarray.push(line);
  //    }

  delay(1000);

}


void saveSettings()
{
  StaticJsonDocument<200> doc;
  char json_string[256];
  doc["DataFilesYesNo"] = (DataFilesYesNo ? "true" : "false");
  serializeJson(doc, json_string);
  writeFileSPIFFS( "/settings.json", json_string);
  Serial.println(json_string);
  ws.printfAll(json_string);
}


void writeDataFile(char* dateTime) {
  char filename[40];
  char year[5] = {'2', '0', '0', '0', '\0'};
  char month[3] = {'0', '0', '\0'};
  //Serial.println(dateTime);

  dateTime[13] = '_';
  dateTime[16] = '_';
  memcpy(year, dateTime, 4);
  memcpy(month, dateTime + 5, 2);
  //Serial.println(year);
  //Serial.println(month);

  makeDataDir(year, month);

  sprintf(filename, "/%s/%s/%s.txt", year, month, dateTime);
  Serial.println(filename);
  writeFileSD(SD, filename, dataLines[0]);
}


void makeDataDir(char *year, char* month) {
  char yearpath[10];
  char yearmonthpath[10];
  sprintf(yearpath, "/%s", year);
  sprintf(yearmonthpath, "/%s/%s", year, month);

  Serial.print(yearpath);
  if (!SD.exists(yearpath)) {
    Serial.println(" not exists");
    createDirSD(SD, yearpath);
  } else
    Serial.println(" exists");

  Serial.print(yearmonthpath);
  if (!SD.exists(yearmonthpath)) {
    Serial.println(" not exists");
    createDirSD(SD, yearmonthpath);
  } else
    Serial.println(" exists");
}

void setPWM() {
  digitalWrite(PWM_ENABLE_PIN, HIGH);  // PWM on, enable IR2104
  //if (PWM_actual > 254)    PWM_actual = 254;
  ledcWrite(1, PWM_actual); //
}

void stopPWM() {
  PWM_actual = 0;
  digitalWrite(PWM_ENABLE_PIN, LOW); // PWM off, disable IR2104
}


void sendDataLine() {
  StaticJsonDocument<200> doc;
  char json_string[256];
  doc["type"] = "livedata";
  doc["data"] = dataLines[linePointer];
  serializeJson(doc, json_string);
  //Serial.println(json_string);
  ws.printfAll(json_string);
}

void makeDataLine() {
  makeDateTime();
  char* format = "%s %5d %.3f %.3f %.3f %.3f %.3f %.3f %4d";
  sprintf(dataLines[linePointer], format, dateTime, count, bv[CHS], cmA[CHS], pw[CHS], bv[CHB], cmA[CHB], pw[CHB], PWM_actual);
}

void makeHeaderLine() {
  char* format = "%19s %5s %6s %6s %6s %5s %5s %5s %3s";
  sprintf(headerLine, format, "Date", "no", "Volt", "mA", "mW", "Volt", "mA", "mW", "PWM");
}

void makeDateTime() {
  DateTime now = rtc.now();
  char* format = "%4d-%02d-%02d_%02d:%02d:%02d\0";
  sprintf(dateTime, format, now.year(), now.month(), now.day(), now.hour(), now.minute(), now.second());
}
