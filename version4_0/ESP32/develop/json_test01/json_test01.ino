


      char* mymsg = "{\"type\":\"listyears\",\"data\":[\"file1.js\",\"file2.js\"]}";
      //ws.printfAll(mymsg);
      
      
void  getDirSDfixed(fs::FS & fs, const char * dirname, char* yearList) {
  //String msg = "";
  String msg = "[\"file1.js\",\"file2.js\"]";
  File root = fs.open(dirname);
  File file = root.openNextFile();
  while (file) {
    if (file.isDirectory()) {
      Serial.print("  DIR : ");
      Serial.println(file.name());
    }
    file = root.openNextFile();
  }
  Serial.print("length of msg=");
  Serial.println(msg.length());
  msg.toCharArray(yearList, msg.length() + 1);
  Serial.println(yearList);
}
