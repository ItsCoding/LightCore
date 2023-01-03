#include <Adafruit_NeoPixel.h>
#include <ESP8266WiFi.h>
#include <PubSubClient.h>

#define PIN D1
const char* SSID = "FakeGigabit";
const char* PSK = "Schreib was rein.";
const char* MQTT_BROKER = "10.40.0.12";

WiFiClient espClient;
PubSubClient client(espClient);
Adafruit_NeoPixel strip = Adafruit_NeoPixel(100, PIN, NEO_GRB + NEO_KHZ400);

void setup() {
  pinMode(13, OUTPUT);
  Serial.begin(115200);
  setup_wifi();
  strip.begin();
  strip.show();
  client.setServer(MQTT_BROKER, 1883);
  client.setCallback(callback);
}

void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(SSID, PSK);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Received message [");
  Serial.print(topic);
  Serial.print("] ");
  int pixelIndex = 0;
  char msg[length+1];
  for (int i = 0; i < length; i++) {
    msg[i] = (char)payload[i];
  }
  Serial.println(msg);
  Serial.println("=================");
  char *pixels = NULL;
  pixels = strtok(msg,"-");
  while(pixels != NULL)
  {
    Serial.println(pixels);
    int r;
    int b;
    int g;
    sscanf(pixels, "%3d,%3d,%3d", &r, &g, &b);    
    strip.setPixelColor(pixelIndex, r,g,b);
    Serial.println("Setting color to: ");
    Serial.println(r);
    Serial.println(g);
    Serial.println(b);
    pixelIndex++;
    pixels = strtok(NULL, "-"); 
  }
  Serial.println("Pixels is now null");
  strip.show();
}

void reconnect() {
  while (!client.connected()) {
    Serial.println("Reconnecting MQTT...");
    if (!client.connect("ESP8266Client")) {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" retrying in 5 seconds");
      delay(5000);
    }
  }
  client.subscribe("/leds/0");
  Serial.println("MQTT Connected...");
}
int x = 0;
int z = 0;
void loop() {
  if (!client.connected()) {
    reconnect();
  }
  x++;
  if(x > 5){
      x = 0;
      z++;
      Serial.println(z);
    }
  client.loop();
}
