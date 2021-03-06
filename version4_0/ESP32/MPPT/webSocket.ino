
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
    String socketMsg = "";
    for (size_t i = 0; i < len; i++) {
      socketMsg += (char) data[i];
    }

    char debugMessage[200];
    sprintf(debugMessage, "ws[%s][%u] text-message[%llu]: ", server->url(), client->id(), len);
    debugPrint(debugMessage, 4);
    debugPrintln(socketMsg.c_str(), 4);

    auto error = deserializeJson(doc, socketMsg);
    if (error) {
      Serial.print(F("deserializeJson() failed with code "));
      Serial.println(error.c_str());
      return;
    }

    String type = doc["type"];
    //Serial.print("message type: ");
    //Serial.println(type);

    if (type == "PWM") {
      String PWM = doc["data"];
      PWM_actual = PWM.toInt();
      ledcWrite(1, PWM_actual);
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
      listDirSD(SD, "/", 2);
    }

    if (type == "getSettings") {
      char data[300];
      readFileSPIFFS("/settings.json",  data);
      debugPrintln(data, 2);
      String msg = "{\"type\":\"getSettings\",\"data\":";
      msg += data;
      msg += "}";
      debugPrintln("JSON to send:", 2);
      debugPrintln(msg.c_str(), 2);
      ws.printfAll(msg.c_str());
    }

    if (type == "getStatus") {
      StaticJsonDocument<200> doc;
      char json_string[256];
      doc["type"] = "getStatus";
      doc["DataFilesYesNo"] = (DataFilesYesNo ? "true" : "false");
      serializeJson(doc, json_string);
      ws.printfAll(json_string);
    }

    if (type == "debugLevel") {
      String dl = doc["data"];
      debugLevel = dl.toInt();
      saveSettings();
    }

    if (type == "keepMeasurement") {
      String km = doc["data"];
      keepMeasurement = km.toInt();
      saveSettings();
    }

    if (type == "DataFileLines") {
      String dfls = doc["data"];
      DataFileLines = dfls.toInt();
      saveSettings();
    }

    if (type == "measCount") {
      char debugMessage[100];
      sprintf(debugMessage, "measurements buffered : %d", linePointer );
      debugPrintln(debugMessage, 4);
      String msg = "{\"type\":\"measCount\",\"data\":";
      msg += linePointer;
      msg += "}";
      //debugPrintln("JSON to send:", 3);
      //debugPrintln(msg.c_str(), 3);
      ws.printfAll(msg.c_str());
    }

    if (type == "listyears") {
      String msg = "{\"type\":\"listyears\",\"data\":";
      getDirSD(SD, "/", msg);
      msg += "}";
      debugPrintln("JSON to send:", 3);
      debugPrintln(msg.c_str(), 3);
      ws.printfAll(msg.c_str());
    }

    if (type == "listmonths") {
      String path = doc["data"];
      String msg = "{\"type\":\"listmonths\",\"data\":";
      getDirSD(SD, path.c_str(), msg);
      msg += "}";
      debugPrintln("JSON to send:", 3);
      debugPrintln(msg.c_str(), 3);
      ws.printfAll(msg.c_str());
    }

    if (type == "listdays") {
      String path = doc["data"];
      String msg = "{\"type\":\"listdays\",\"data\":";
      getFileListSD(SD, path.c_str(), msg);
      msg += "}";
      debugPrintln("JSON to send:", 3);
      debugPrintln(msg.c_str(), 3);
      ws.printfAll(msg.c_str());
    }

    if (type == "readfile") {
      String path = doc["data"];
      String msg = "{\"type\":\"filedata\",\"data\":\"";
      getFileSD(SD, path.c_str(), msg);
      msg += "\"}";
      debugPrintln("JSON to send:", 3);
      debugPrintln(msg.c_str(), 3);
      ws.printfAll(msg.c_str());
    }

    if (type == "greenLED") {
      String greenLED = doc["data"];
      if (doc["data"] == "true") {
        digitalWrite(green_LED, HIGH);
      } else {
        digitalWrite(green_LED, LOW);
      }
    }

    if (type == "orangeLED") {
      String orangeLED = doc["data"];
      if (doc["data"] == "true") {
        digitalWrite(orange_LED, HIGH);
      } else {
        digitalWrite(orange_LED, LOW);
      }
    }

    if (type == "redLED") {
      String redLED = doc["data"];
      if (doc["data"] == "true") {
        digitalWrite(red_LED, HIGH);
      } else {
        digitalWrite(red_LED, LOW);
      }
    }

    if (type == "PWMDriver") {
      String PWMDriver = doc["data"];
      if (doc["data"] == "true") {
        debugPrintln("manual mode PWMDriver on", 3);
        startPWM();
      } else {
        debugPrintln("manual mode PWMDriver off", 3);
        stopPWM();
      }
    }

    if (type == "batteryRelay") {
      String batteryRelay = doc["data"];
      if (doc["data"] == "true") {
        debugPrintln("manual mode battery relay on", 3);
        digitalWrite(RelayPin, HIGH);
      } else {
        debugPrintln("manual mode battery relay off", 3);
        digitalWrite(RelayPin, LOW);
      }
    }

    if (type == "SetRTC") {
      String ys = doc["year"];
      int year = ys.toInt();
      String mo = doc["month"];
      int month = mo.toInt();
      String dy = doc["day"];
      int day = dy.toInt();
      String hr = doc["hours"];
      int hours = hr.toInt();
      String mn = doc["minutes"];
      int minutes = mn.toInt();
      char debugMessage[200];
      sprintf(debugMessage, "setRTC %d %d %d %d %d", year, month, day, hours, minutes);
      debugPrintln(debugMessage, 3);
      rtc.adjust(DateTime(year, month, day, hours, minutes, 0));
    }



    if (type == "printSDFile") {
      String pathS = doc["data"];
      char path[40];
      pathS.toCharArray(path, sizeof(path));
      readFileSD(SD, path);
      //readFileSD(SD, " / 2019 / 09 / 2019 - 09 - 24_01_45_37.txt");
    }


  }
}
