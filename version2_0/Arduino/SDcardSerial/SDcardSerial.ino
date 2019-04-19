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
  mySerial.begin(9600);

}

void loop() {

  String str;

  //read message from Espruino
  while (mySerial.available() > 0) {
    str = mySerial.readStringUntil('\n');

    //Serial.println("Arduino received:");
    Serial.println(str);
    //mySerial.println(str);
    char task = str[0];

    switch (task) {
      case 'i':    //
        if (!card.init(SPI_HALF_SPEED, chipSelect)) {
          Serial.println("init card fail");
          mySerial.println("init card fail");
        } else {
          Serial.println("init card ok");
          mySerial.write("init card ok\n");
        }
        // Now we will try to open the 'volume'/'partition' - it should be FAT16 or FAT32
        if (!volume.init(card)) {
          Serial.println("init volume fail");
          mySerial.println("init volume fail");
        } else {
          Serial.println("init volume ok");
          mySerial.write("init volume ok\n");
        }
        break;
      case 'l':    //
        Serial.println("\nFiles found on the card (name, date and size in bytes): ");
        root.openRoot(volume);

        // list all files in the card with date and size
        root.ls(LS_R | LS_DATE | LS_SIZE);
        break;
    }

    delay(10);


  }
}





//    Serial.print("\nInitializing SD card...");
//    // we'll use the initialization code from the utility libraries
//    // since we're just testing if the card is working!

//
//
//
//    Serial.print("Clusters:          ");
//    Serial.println(volume.clusterCount());
//    Serial.print("Blocks x Cluster:  ");
//    Serial.println(volume.blocksPerCluster());
//
//    Serial.print("Total Blocks:      ");
//    Serial.println(volume.blocksPerCluster() * volume.clusterCount());
//    Serial.println();
//
//    // print the type and size of the first FAT-type volume
//    uint32_t volumesize;
//    Serial.print("Volume type is:    FAT");
//    Serial.println(volume.fatType(), DEC);
//
//    volumesize = volume.blocksPerCluster();    // clusters are collections of blocks
//    volumesize *= volume.clusterCount();       // we'll have a lot of clusters
//    volumesize /= 2;                           // SD card blocks are always 512 bytes (2 blocks are 1KB)
//    Serial.print("Volume size (Kb):  ");
//    //    Serial.println(volumesize);
//    Serial.print("Volume size (Mb):  ");
//    volumesize /= 1024;
//    Serial.println(volumesize);
//    Serial.print("Volume size (Gb):  ");
//    Serial.println((float)volumesize / 1024.0);
//

//
//
//    mySerial.write("Arduino sending response to Espruino\n");
//    mySerial.print("Clusters:          ");
//    mySerial.println(volume.clusterCount());
//    mySerial.print("Blocks x Cluster:  ");
//    mySerial.println(volume.blocksPerCluster());
//
//    mySerial.print("Total Blocks:      ");
//    mySerial.println(volume.blocksPerCluster() * volume.clusterCount());
//    mySerial.println();
//digitalWrite(LED_BUILTIN, HIGH);   // turn the LED on (HIGH is the voltage level)
//delay(1000);                       // wait for a second
//digitalWrite(LED_BUILTIN, LOW);    // turn the LED off by making the voltage LOW
//void(* resetFunc) (void) = 0;//declare reset function at address 0
//resetFunc();  //call reset
