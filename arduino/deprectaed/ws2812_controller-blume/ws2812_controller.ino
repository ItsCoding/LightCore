#include <NeoPixelSegmentBus.h>
#include <NeoPixelBrightnessBus.h>
#include <NeoPixelBus.h>
#include <NeoPixelAnimator.h>

/*
* This example works for ESP8266 & ESP32 and uses the NeoPixelBus library instead of the one bundle
* Sketch written by Joey Babcock - https://joeybabcock.me/blog/, and Scott Lawson (Below) 
* Codebase created by ScottLawsonBC - https://github.com/scottlawsonbc
*/

#if defined(ESP8266)
#include <ESP8266WiFi.h>
#include <WiFiUdp.h>
#elif defined(ESP32)
#include <WiFi.h>
#else
#error "This is not a ESP8266 or ESP32!"
#endif
#define PIN 25
// Set to the number of LEDs in your LED strip
#define NUM_LEDS 892
// Maximum number of packets to hold in the buffer. Don't change this.
#define BUFFER_LEN 1350
// Toggles FPS output (1 = print FPS over serial, 0 = disable output)
#define PRINT_FPS 1

//NeoPixelBus settings
// Wifi and socket settings
String nodeName = "blume-1";
const char* ssid     = "FakeGigabit";
const char* password = "Schreib was rein.";
unsigned int localPort = 7777;
char packetBuffer[BUFFER_LEN];

uint8_t N = 0;
uint32_t NC = 0;
uint8_t offset = 0;
WiFiUDP port;
// Network information
// IP must match the IP in config.py
//IPAddress ip(10, 40, 0, 188);
//IPAddress ip(192, 168, 62, 137);
// Set gateway to your router's gateway
//IPAddress gateway(10, 40, 0, 1);
//IPAddress subnet(255, 255, 255, 0);
//Adafruit_NeoPixel strip = Adafruit_NeoPixel(NUM_LEDS, PIN, NEO_GRB + NEO_KHZ800);
NeoPixelBus<NeoGrbFeature, NeoEsp32I2s1800KbpsMethod> strip(NUM_LEDS, PIN);

void setup() {
    Serial.begin(115200);
    WiFi.mode(WIFI_STA);
    WiFi.hostname(nodeName.c_str());
    //WiFi.config(ip, gateway, subnet);
    WiFi.begin(ssid, password);
    Serial.println("");
    // Connect to wifi and print the IP address over serial
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    
    Serial.println("");
    Serial.print("Connected to ");
    Serial.println(ssid);
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());
    
    port.begin(localPort);
    Serial.println("Port open");
    strip.Begin();
    Serial.println("Strip open");
}

#if PRINT_FPS
    uint16_t fpsCounter = 0;
    uint32_t secondTimer = 0;
#endif

void loop() {
    int packetSize = port.parsePacket();
    if (packetSize) {
        int len = port.read(packetBuffer, BUFFER_LEN);
        //Serial.println(len);
        for(int i = 0; i < len; i+=5) {
            packetBuffer[len] = 0;
            offset = packetBuffer[i];
            N = packetBuffer[i+1];      
            NC = (uint32_t)N + (uint32_t)1 + (uint32_t)offset * (uint32_t)256;
            strip.SetPixelColor(NC, RgbColor((uint8_t)packetBuffer[i+2],(uint8_t)packetBuffer[i+3], (uint8_t)packetBuffer[i+4]));

        }
        strip.Show();
        #if PRINT_FPS
            fpsCounter++;
            Serial.print("/");//Monitors connection(shows jumps/jitters in packets)
        #endif
    }
    #if PRINT_FPS
        if (millis() - secondTimer >= 1000U) {
            secondTimer = millis();
            Serial.printf("FPS: %d\n", fpsCounter);
            fpsCounter = 0;
        }   
    #endif
}
