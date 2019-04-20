/*

  The circuit:
    SD card attached to SPI bus as follows:
 ** MOSI - pin 11
 ** MISO - pin 12
 ** CLK - pin 13
 ** CS -Pin 4

*/

// include the SD library:
#include <SPI.h>
#include <mySD.h>
#include <SoftwareSerial.h>

// set up variables using the SD utility library functions:
Sd2Card card;
SdVolume volume;
SdFile root;
const int chipSelect = 4;
SoftwareSerial mySerial(2, 3); // RX, TX

void setup() {
  pinMode(LED_BUILTIN, OUTPUT);

  // Open serial communications and wait for port to open:
  Serial.begin(9600);
  while (!Serial) {
    ; // wait for serial port to connect. Needed for native USB port only
  }
  Serial.println("program started");

  // set the data rate for the SoftwareSerial port
  mySerial.begin(28800);

}

void loop() {

  String str;
  String fullpath;
  String filename;
  String curDirname;
  String dataString;
  int dirIndex;
  File curDir;
  File myFile;

  //read message from Espruino
  while (mySerial.available() > 0) {
    str = mySerial.readStringUntil('\n');

    //Serial.println("Arduino received:");
    Serial.println(str);
    //mySerial.println(str);
    char task = str[0];

    // read parameters
    dirIndex = str.indexOf(':', 2 );
    //curDirname = "/2019/4/17";
    //filename = str.substring(2, 14);
    curDirname = str.substring(2, dirIndex);
    filename = str.substring(dirIndex + 1, dirIndex + 14);
    fullpath = curDirname + "/" + filename;
    //Serial.println(filename);
    Serial.println(fullpath);
    dataString = "bla";
    
    switch (task) {
      case 'i':    //
        if (!SD.begin(4)) {
          Serial.println("init card fail");
          mySerial.println("init card fail");
        } else {
          Serial.println("init card ok");
          mySerial.write("init card ok\n");
        }
        delay(10);
        break;
      case 'l':    //
        curDir = SD.open("/2019/4/17");
        printDirectory(curDir);
        break;
      case 'r':    //
        // open the file for reading:
        myFile = SD.open(fullpath);
        if (myFile) {
          // read from the file until there's nothing else in it:
          while (myFile.available()) {
            mySerial.write(myFile.read());
          }
          myFile.close();
        } else {
          // if the file didn't open, print an error:
          Serial.println(fullpath);
          mySerial.println(fullpath);
        }
        break;
      case 'w':    //
        // open the file for write/append
        myFile = SD.open(fullpath, FILE_WRITE);
        // File dataFile = SD.open("datalog.txt", FILE_WRITE);
        // if the file is available, write to it:
        if (myFile) {
          myFile.println(dataString);
          myFile.close();
          //Serial.println(dataString);
        }
        // if the file isn't open, pop up an error:
        else {
          Serial.println("error opening file");
        }
        break;

    }

    delay(10);
  }

}

void printDirectory(File dir) {
  while (true) {

    File entry =  dir.openNextFile();
    if (! entry) {
      // no more files
      break;
    }
    mySerial.println(entry.name());
    entry.close();
  }
}

//fullpath = "/2019/4/17/23_04_00.txt";
