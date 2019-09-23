

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

void writeFileSD(fs::FS &fs, const char * path, const char * message) {
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

void createDirSD(fs::FS & fs, const char * path) {
  Serial.printf("Creating Dir: %s\n", path);
  if (fs.mkdir(path)) {
    Serial.println("Dir created");
  } else {
    Serial.println("mkdir failed");
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
