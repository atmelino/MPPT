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
#include <SD.h>
#include <ArduinoJson.h>
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

  // set the data rate for the SoftwareSerial port
  mySerial.begin(9600);

}
void(* resetFunc) (void) = 0;//declare reset function at address 0

void loop() { // run over and over
  //StaticJsonBuffer<100> jsonBuffer;
  //char json[50];
  String str;

  //read message from Espruino
  while (mySerial.available() > 0) {
    str = mySerial.readStringUntil('\n');

    //digitalWrite(LED_BUILTIN, HIGH);   // turn the LED on (HIGH is the voltage level)
    //delay(1000);                       // wait for a second
    //digitalWrite(LED_BUILTIN, LOW);    // turn the LED off by making the voltage LOW

    //Serial.println("Arduino received:");
    Serial.println(str);
    //    str.toCharArray(json, 50);
    //    JsonObject& root = jsonBuffer.parseObject(json);
    //    if (!root.success()) {
    //      Serial.println("parseObject() failed");
    //    }
    //    else
    //    {
    //      if (root.containsKey("PWM")) {
    //        //Serial.println("PWM found");
    //        int pwmint = root["PWM"];
    //        Serial.println(pwmint);
    //      }
    //    }


    Serial.print("\nInitializing SD card...");

    // we'll use the initialization code from the utility libraries
    // since we're just testing if the card is working!
    if (!card.init(SPI_HALF_SPEED, chipSelect)) {
      Serial.println("initialization failed.");
      resetFunc();  //call reset

      //while (1);
    } else {
      Serial.println("Wiring is correct and a card is present.");
    }

    // print the type of card
    Serial.println();
    Serial.print("Card type:         ");
    switch (card.type()) {
      case SD_CARD_TYPE_SD1:
        Serial.println("SD1");
        break;
      case SD_CARD_TYPE_SD2:
        Serial.println("SD2");
        break;
      case SD_CARD_TYPE_SDHC:
        Serial.println("SDHC");
        break;
      default:
        Serial.println("Unknown");
    }

    // Now we will try to open the 'volume'/'partition' - it should be FAT16 or FAT32
    if (!volume.init(card)) {
      Serial.println("Could not find FAT16/FAT32 partition.\nMake sure you've formatted the card");
      while (1);
    }

    Serial.print("Clusters:          ");
    Serial.println(volume.clusterCount());
    Serial.print("Blocks x Cluster:  ");
    Serial.println(volume.blocksPerCluster());

    Serial.print("Total Blocks:      ");
    Serial.println(volume.blocksPerCluster() * volume.clusterCount());
    Serial.println();

    // print the type and size of the first FAT-type volume
    uint32_t volumesize;
    Serial.print("Volume type is:    FAT");
    Serial.println(volume.fatType(), DEC);

    volumesize = volume.blocksPerCluster();    // clusters are collections of blocks
    volumesize *= volume.clusterCount();       // we'll have a lot of clusters
    volumesize /= 2;                           // SD card blocks are always 512 bytes (2 blocks are 1KB)
    Serial.print("Volume size (Kb):  ");
    //    Serial.println(volumesize);
    Serial.print("Volume size (Mb):  ");
    volumesize /= 1024;
    Serial.println(volumesize);
    Serial.print("Volume size (Gb):  ");
    Serial.println((float)volumesize / 1024.0);

    Serial.println("\nFiles found on the card (name, date and size in bytes): ");
    root.openRoot(volume);

    // list all files in the card with date and size
    //root.ls(LS_R | LS_DATE | LS_SIZE);


    mySerial.write("Arduino sending response to Espruino\n");
    mySerial.print("Clusters:          ");
    mySerial.println(volume.clusterCount());
    mySerial.print("Blocks x Cluster:  ");
    mySerial.println(volume.blocksPerCluster());

    mySerial.print("Total Blocks:      ");
    mySerial.println(volume.blocksPerCluster() * volume.clusterCount());
    mySerial.println();



  }
}
