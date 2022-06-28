#include <WiFi.h>
#include <WebSocketClient.h>
#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEServer.h>

#define SERVICE_UUID        "3afccc12-6673-11eb-ae93-0242ac130002"
#define CHARACTERISTIC_UUID "41c9590c-6673-11eb-ae93-0242ac130002"

const char* ssid = "YOUR_SSID_HERE";
const char* password =  "YOUR_PASSWORD_HERE";

char path[] = "/?uuid=3afccc12-6673-11eb-ae93-0242ac130002";
char host[] = "HOST_HERE";

int LED_BUILTIN = 2;
int LED_PIN_5 = 5;
int LED_PIN_18 = 18;
 
WebSocketClient webSocketClient;
WiFiClient client;
 
void setup() {
  pinMode (LED_BUILTIN, OUTPUT);
  pinMode (LED_PIN_5, OUTPUT);
  pinMode (LED_PIN_18, OUTPUT);
  Serial.begin(115200);
 
  WiFi.begin(ssid, password);
 
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
 
  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
 
  delay(5000);
 
  if (client.connect(host, 3000)) {
    Serial.println("Connected");
  } else {
    Serial.println("Connection failed.");
    blink(300, LED_BUILTIN);
  }
 
  webSocketClient.path = path;
  webSocketClient.host = host;
  if (webSocketClient.handshake(client)) {
    Serial.println("Handshake successful");
    blink(300, LED_PIN_18);
  } else {
    Serial.println("Handshake failed.");
    blink(500, LED_BUILTIN);
  }

    BLEDevice::init("ESP32");
  BLEServer *pServer = BLEDevice::createServer();
  BLEService *pService = pServer->createService(SERVICE_UUID);
  BLECharacteristic *pCharacteristic = pService->createCharacteristic(
                                         CHARACTERISTIC_UUID,
                                         BLECharacteristic::PROPERTY_READ |
                                         BLECharacteristic::PROPERTY_WRITE
                                       );

  pCharacteristic->setValue("Hello World says Neil");
  pService->start();
  // BLEAdvertising *pAdvertising = pServer->getAdvertising();  // this still is working for backward compatibility
  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(true);
  pAdvertising->setMinPreferred(0x06);  // functions that help with iPhone connections issue
  pAdvertising->setMinPreferred(0x12);
  BLEDevice::startAdvertising();
  Serial.println("Characteristic defined! Now you can read it in your phone!");
}
 
void loop() {
  String data;
 
  if (client.connected()) {
    webSocketClient.getData(data);
    if (data.length() > 0) {
      Serial.print("Received data: ");
      Serial.println(data);
      if (data == "authorized") {
        blink(200, LED_PIN_18);
      } else if (data == "unauthorized") {
        blink(200, LED_PIN_5);  
      }
    }
 
  } else {
    Serial.println("Client disconnected.");
  }
 
  delay(3000);
 
}

void blink(int time, int pin) {
  int count = 5;
  while(count > 0) {
    digitalWrite(pin, HIGH);
    delay(time);
    digitalWrite(pin, LOW);
    delay(time);  
    count--;
  }
}
