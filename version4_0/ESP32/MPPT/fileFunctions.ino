void saveSettings()
{
  StaticJsonDocument<200> doc;
  char json_string[256];
  doc["DataFilesYesNo"] = (DataFilesYesNo ? "true" : "false");
  doc["keepMeasurement"] = keepMeasurement;
  doc["DataFileLines"] = DataFileLines;
  doc["debugLevel"] = debugLevel;
  serializeJson(doc, json_string);
  writeFileSPIFFS( "/settings.json", json_string);
  Serial.println(json_string);
  ws.printfAll(json_string);
}

void getSettings() {
  StaticJsonDocument<200> doc;
  char data[200];
  readFileSPIFFS("/settings.json",  data);
  Serial.println(data);
  auto error = deserializeJson(doc, data);
  if (error) {
    Serial.print(F("deserializeJson() failed with code "));
    Serial.println(error.c_str());
    return;
  }
  String df = doc["DataFilesYesNo"];
  if (df == "true")
    DataFilesYesNo = true;
  else
    DataFilesYesNo = false;
  String km = doc["keepMeasurement"];
  keepMeasurement = km.toInt();
  String dfls = doc["DataFileLines"];
  DataFileLines = dfls.toInt();
  String dl = doc["debugLevel"];
  debugLevel = dl.toInt();
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
  String content;
  for (int i = 0; i < DataFileLines; i++) {
    //    appendFileSD(SD, filename, dataLines[i]);
    content += dataLines[i];
  }
  writeFileSD(SD, filename, content.c_str());

  debugPrint("Saved file ", 1);
  debugPrintln(filename, 1);
}

void makeDataDir(char *year, char* month) {
  char yearpath[10];
  char yearmonthpath[10];
  sprintf(yearpath, "/%s", year);
  sprintf(yearmonthpath, "/%s/%s", year, month);

  if (!SD.exists(yearpath)) {
    debugPrint(yearpath, 3);
    debugPrintln(" not exists", 3);
    createDirSD(SD, yearpath);
  } else {
    debugPrint(yearpath, 3);
    debugPrintln(" exists", 3);
  }

  if (!SD.exists(yearmonthpath)) {
    debugPrint(yearmonthpath, 3);
    debugPrintln(" not exists", 3);
    createDirSD(SD, yearmonthpath);
  } else {
    debugPrint(yearmonthpath, 3);
    debugPrintln(" exists", 3);
  }
}

void listDirSD(fs::FS & fs, const char * dirname, uint8_t levels) {
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
        listDirSD(fs, file.name(), levels - 1);
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

void  getDirSD(fs::FS & fs, const char * path, String &content) {
  int len = strlen(path);
  int trim;
  if (len == 1) trim = 1; else trim = len + 1;
  boolean first = true;
  String fullPath;
  content += "[";
  File root = fs.open(path);
  File file = root.openNextFile();
  while (file) {
    if (file.isDirectory()) {
      if (!first)
        content += ",";
      first = false;
      fullPath = file.name();
      //char debugMessage[100];
      //sprintf(debugMessage, "file.name() returns %s length %d", file.name(), len );
      //debugPrintln(debugMessage, 2);
      content += "\"";
      content += fullPath.substring(trim);
      content += "\"";
    }
    file = root.openNextFile();
  }
  content += "]";
  debugPrint(content.c_str(), 2);
}

void  getFileListSD(fs::FS & fs, const char * path, String &content) {
  debugPrint("Listing directory: ", 1);
  debugPrintln(path, 1);
  int len = strlen(path);
  boolean first = true;
  String fullPath;
  content += "[";
  File root = fs.open(path);
  File file = root.openNextFile();
  while (file) {
    if (!file.isDirectory()) {
      if (!first)
        content += ",";
      first = false;
      fullPath = file.name();
      content += "\"";
      content += fullPath.substring(len + 1);
      content += "\"";
    }
    file = root.openNextFile();
  }
  content += "]";
  debugPrint(content.c_str(), 3);
}

void getFileSD(fs::FS & fs, const char * path, String &content) {
  //void getFileSD(fs::FS & fs, const char * path, String content) {
  debugPrint("Reading file: ", 1);
  debugPrintln(path, 1);
  char c;
  File file = fs.open(path);
  if (!file) {
    debugPrintln("Failed to open file for reading", 1);
    return;
  }
  while (file.available()) {
    c = file.read();
    if (c == '\n')
      content += "\\n";
    else
      content += c;
  }
  file.close();
  debugPrint(content.c_str(), 3);
  debugPrintln("file end", 1);
}

void createDirSD(fs::FS & fs, const char * path) {
  Serial.printf("Creating Dir: %s\n", path);
  if (fs.mkdir(path)) {
    Serial.println("Dir created");
  } else {
    Serial.println("mkdir failed");
  }
}

void writeFileSD(fs::FS & fs, const char * path, const char * message) {
  Serial.printf("Writing file:%s\n", path);

  File file = fs.open(path, FILE_WRITE);
  if (!file) {
    Serial.println("Failed to open file for writing");
    return;
  }
  if (file.print(message)) {
    Serial.println("File written");
  } else {
    Serial.println("Write failed");
  }
  file.close();
}

void readFileSD(fs::FS & fs, const char * path) {
  Serial.printf("Reading file: %s\n", path);
  File file = fs.open(path);
  if (!file) {
    Serial.println("Failed to open file for reading");
    return;
  }
  //Serial.println("Read from file: ");
  while (file.available()) {
    Serial.write(file.read());
  }
  file.close();
  Serial.println("file end");
}


void appendFileSD(fs::FS & fs, const char * path, const char * message) {
  //Serial.printf("Appending to file: %s\n", path);
  File file = fs.open(path, FILE_APPEND);
  if (!file) {
    Serial.println("Failed to open file for appending");
    return;
  }
  if (file.print(message)) {
    debugPrintln("Message appended", 3);
  } else {
    Serial.println("Append failed");
  }
  file.close();
}

void deleteFileSD(fs::FS & fs, const char * path) {
  Serial.printf("Deleting file: %s\n", path);
  if (fs.remove(path)) {
    Serial.println("File deleted");
  } else {
    Serial.println("Delete failed");
  }
}


void writeFileSPIFFS(char* name, char* data)
{
  File file = SPIFFS.open(name, FILE_WRITE);

  if (!file) {
    Serial.println("There was an error opening the file for writing");
    return;
  }
  if (file.print(data)) {
    Serial.println("File was written");
  } else {
    Serial.println("File write failed");
  }
  file.close();
}


void readFileSPIFFS(char* name, char* data)
{ //todo: make sure it doesn't overflow
  File file2 = SPIFFS.open(name);
  char c;
  int i = 0;

  if (!file2) {
    Serial.println("Failed to open file for reading");
    return;
  }
  while (file2.available()) {
    c = file2.read();
    data[i] = c;
    i++;
  }
  file2.close();
  data[i] = '\0';
}
