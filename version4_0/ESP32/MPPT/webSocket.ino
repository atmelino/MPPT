
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
      listDirSD(SD, "/", 2);
    }

    if (type == "getSettings") {
      char data[100];
      readFileSPIFFS("/settings.json",  data);
      Serial.println(data);
      StaticJsonDocument<100> docSettings;
      char json_stringSettings[200];
      DeserializationError error = deserializeJson(docSettings, data);
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
      doc["type"] = "getStatus";
      doc["DataFilesYesNo"] = (DataFilesYesNo ? "true" : "false");
      serializeJson(doc, json_string);
      ws.printfAll(json_string);
    }

    if (type == "DataFileLines") {
      String dfls = doc["data"];
      //Serial.println(dfls);
      DataFileLines = dfls.toInt();
      //Serial.println("new DataFileLines=");
      //Serial.println(DataFileLines);
      saveSettings();
    }

    if (type == "listyears") {
      char json_string[200];
      StaticJsonDocument<200> doc;
      char yearList[200];;
      getDirSD(SD, "/", yearList);
      Serial.println(yearList);
      doc["type"] = "listyears";
      doc["data"] = yearList;
      serializeJson(doc, json_string);
      Serial.println(json_string);
      //ws.printfAll(json_string);

      char* mymsg = "{\"type\":\"listyears\",\"data\":[\"file1.js\",\"file2.js\"]}";
      ws.printfAll(mymsg);

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
