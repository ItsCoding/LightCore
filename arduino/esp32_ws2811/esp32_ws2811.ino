#include <ESP32Time.h>
#include <FastLED.h>
#include "WiFi.h"
#include "AsyncUDP.h"
#include "time.h"


#define PIN 4
// Set to the number of LEDs in your LED strip
#define NUM_LEDS 40
#define PRINT_FPS 1
#define ACK_PORT 58880
#if PRINT_FPS
    uint16_t fpsCounter = 0;
    uint32_t secondTimer = 0;
#endif

TaskHandle_t  Core0TaskHnd ;  
TaskHandle_t  Core1TaskHnd ; 
String nodeName = "blume-1";
const char* ssid     = "FakeGigabit";
const char* password = "Schreib was rein.";
unsigned int localPort = 7777;
uint8_t N = 0;
uint32_t NC = 0;
uint8_t offset = 0;
const char* ntpServer = "pool.ntp.org";
ESP32Time rtc(0);


AsyncUDP udp;
WiFiUDP sendingUDP;
CRGB leds[NUM_LEDS];

unsigned long getTimeByNtp() {
  time_t now;
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) {
    //Serial.println("Failed to obtain time");
    return(0);
  }
  time(&now);
  return now;
}

void setup() 
{
  
   Serial.begin(115200);
   // put your setup code here, to run once:
   WiFi.mode(WIFI_STA);
   WiFi.setSleep(false);
   WiFi.hostname(nodeName.c_str());
   WiFi.begin(ssid, password);
   while (WiFi.status() != WL_CONNECTED) {
      delay(500);
      Serial.print(".");
   }
   FastLED.addLeds<NEOPIXEL, PIN>(leds, NUM_LEDS);

   //Print debug infos
   Serial.println("");
   Serial.print("Connected to ");
   Serial.println(ssid);
   Serial.print("IP address: ");
   Serial.println(WiFi.localIP());
   Serial.print("MAC: ");
   Serial.println(WiFi.macAddress());
   Serial.print("Device Name: ");
   Serial.println(nodeName); 

   configTime(0, 0, ntpServer);
   rtc.setTime(getTimeByNtp());
   Serial.print("Epoch: ");
   Serial.println(rtc.getEpoch());
      
   xTaskCreatePinnedToCore(CoreTask0,"CPU_0",1000,NULL,1,&Core0TaskHnd,0);
   //xTaskCreatePinnedToCore(CoreTask1,"CPU_1",1000,NULL,1,&Core0TaskHnd,1);
   if(udp.listen(localPort)) {
        Serial.print("UDP Listening on Port: ");
        Serial.println(localPort);
        udp.onPacket([](AsyncUDPPacket packet) {
            int len = packet.length();
            uint8_t * udpData = packet.data();            
            long paketID = 0;
            paketID += udpData[0] << 24;
            paketID += udpData[1] << 16;
            paketID += udpData[2] << 8;
            paketID += udpData[3];
            for(int i = 4; i < len; i+=5) {
              //packetBuffer[len] = 0;
             
              offset = udpData[i];
              N = packet.data()[i+1];      
              NC = (uint32_t)N + (uint32_t)offset * (uint32_t)256;
              leds[NC].setRGB((uint8_t)packet.data()[i+2],(uint8_t)packet.data()[i+4], (uint8_t)packet.data()[i+3]);
            }
            #if PRINT_FPS
                fpsCounter++;
                Serial.print("/");//Monitors connection(shows jumps/jitters in packets)
            #endif
            #if PRINT_FPS
                if (millis() - secondTimer >= 1000U) {
                    secondTimer = millis();
                    Serial.printf("FPS: %d\n", fpsCounter);
                    fpsCounter = 0;
                }   
            #endif
            char packetResponse[10];
            sprintf(packetResponse, "%i", paketID);   
            sendingUDP.beginPacket(packet.remoteIP(), ACK_PORT);
            // Just test touch pin - Touch0 is T0 which is on GPIO 4.
            sendingUDP.printf(packetResponse);
            sendingUDP.endPacket();        
            //packet.printf(packetResponse);
        });
    }
}

void loop() 
{
  //Serial.print ("Application CPU is on core:"); //1
  //Serial.println (xPortGetCoreID());
  /**delay (500);
  sendingUDP.beginPacket("10.40.0.241", ACK_PORT);
  // Just test touch pin - Touch0 is T0 which is on GPIO 4.
  sendingUDP.printf("Hello World");
  sendingUDP.endPacket();
  Serial.println("I am alive"); **/
}  

void CoreTask0( void * parameter ) 
{ 
  for (;;) 
  { 
    //Serial.print("CoreTask0 runs on Core: "); //0
    //Serial.println(xPortGetCoreID());
    FastLED.show();       
    yield();
    delay (10);
  } 
} 