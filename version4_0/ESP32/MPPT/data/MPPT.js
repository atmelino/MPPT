function SPIFFStest() {
    alert("js file in SPIFFS");
}

function WebSocketTest() {
    if ("WebSocket" in window) {
        printlnMessage("messages", "WebSocket is supported by your Browser!");

        // Let us open a web socket
        var ws = new WebSocket("ws://192.168.1.7/ws");
        ws.onopen = function () {
            // Web Socket is connected, send data using send()
            ws.send("Message to send");
            printlnMessage("messages", "Message is sent...");
        };
        ws.onmessage = function (evt) {
            var received_msg = evt.data;
            //SPIFFStest();
            printlnMessage("messages", "Message is received..." + evt.data);
        };
        ws.onclose = function () {
            // websocket is closed.
            printlnMessage("messages", "Connection is closed...");
        };
    } else {
        // The browser doesn't support WebSocket
        alert("WebSocket NOT supported by your Browser!");
    }
}
// Helper functions
function printMessage(target, message) {
    elementId = document.getElementById(target);
    if (elementId != null) {
        elementId.innerHTML += message;
        elementId.scrollTop = elementId.scrollHeight;
    }
}

function printlnMessage(target, message) {
    elementId = document.getElementById(target);
    if (elementId != null) {
        printMessage(target, message);
        elementId.innerHTML += "\n";
    }
}
