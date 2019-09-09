#include <WiFi.h>
#include <ESPAsyncWebServer.h>
#include "SPIFFS.h"


const char* ssid = "NETGEAR53";
const char* password = "";
AsyncWebServer server(80);
AsyncWebSocket ws("/ws");


void onWsEvent(AsyncWebSocket * server, AsyncWebSocketClient * client, AwsEventType type, void * arg, uint8_t *data, size_t len) {
  if (type == WS_EVT_CONNECT) {
    Serial.println("Websocket client connection received");
    client->text("Hello from ESP32 Server");
  } else if (type == WS_EVT_DISCONNECT) {
    Serial.println("Client disconnected");
  }
}

void setup() {
  Serial.begin(115200);

  // Initialize SPIFFS
  if (!SPIFFS.begin(true)) {
    Serial.println("An Error has occurred while mounting SPIFFS");
    return;
  }

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi..");
  }

  Serial.println(WiFi.localIP());

  ws.onEvent(onWsEvent);
  server.addHandler(&ws);

  // Route for root / web pages and javascript
  server.on("/", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/index.html", "text/html");
  });
  server.on("/MPPT.js", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/MPPT.js", "text/javascript");
  });

  server.begin();
}

void loop() {}
