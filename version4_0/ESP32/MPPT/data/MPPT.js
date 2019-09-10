// where the serial server is (your local machine):
var host = document.location.host;
var socket; // the websocket



function WebSocketTest() {
    if ("WebSocket" in window) {
        printlnMessage("messages", "WebSocket is supported by your Browser!");

        // Let us open a web socket
        //socket = new WebSocket("ws://192.168.1.7/ws");
        socket = new WebSocket("ws://" + host + "/ws");
        printlnMessage("messages", host);

        socket.onopen = function () {
            // Web Socket is connected, send data using send()
            socket.send("Message to send");
            printlnMessage("messages", "Message is sent...");
        };
        socket.onmessage = readMessage;
        socket.onclose = function () {
            // websocket is closed.
            printlnMessage("messages", "Connection is closed...");
        };
    } else {
        // The browser doesn't support WebSocket
        alert("WebSocket NOT supported by your Browser!");
    }
}

function readMessage(event) {
    var received_msg = event.data;
    printlnMessage("messages", "Message is received..." + event.data);
    receivedmessage = JSON.parse(event.data);
    if (receivedmessage.type == "livedata") {
        //printlnMessage("messages", event.data);
        //document.getElementById("liveDatatmp").innerHTML = receivedmessage.data;
        refreshTable("liveTable", receivedmessage.data);
    }
}

function refreshTable(tableName, data) {
    const singleWhiteSpaceData = data.replace(/  +/g, " ");
    const splitString = singleWhiteSpaceData.split(" ");
    var table = document.getElementById(tableName);
    var l = table.rows.length;
    if (l > 10) {
        table.deleteRow(1);
        l -= 1;
    }
    var row = table.insertRow(l);
    var cell = [];
    for (var j = 0; j < 9; j++) {
        cell[j] = row.insertCell(j);
        cell[j].innerHTML = splitString[j];
        if (j == 9) {
            document.getElementById("PWMact").value = splitString[j];
        }
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





