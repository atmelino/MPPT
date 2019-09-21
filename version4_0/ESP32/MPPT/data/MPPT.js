// where the serial server is (your local machine):
var host = document.location.host;
var socket; // the websocket
var sendmessage = {
    type: "none",
    data: "empty"
};

function myonload() {
    alert("onload");
}

function setup() {
    if ("WebSocket" in window) {
        printlnMessage("messages", "WebSocket is supported by your Browser!");

        // Let us open a web socket
        //socket = new WebSocket("ws://192.168.1.7/ws");
        socket = new WebSocket("ws://" + host + "/ws");
        printlnMessage("messages", host);

        socket.onopen = function () {
            // Web Socket is connected, send data using send()
            sendmessage.type = "msg";
            sendmessage.data = "websocket connected";
            socket.send(JSON.stringify(sendmessage));
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
    //printlnMessage("messages", "Message is received..." + event.data);
    receivedmessage = JSON.parse(event.data);
    if (receivedmessage.type == "livedata") {
        //printlnMessage("messages", event.data);
        //document.getElementById("liveDatatmp").innerHTML = receivedmessage.data;
        refreshTable("liveTable", receivedmessage.data);
    }
    if (receivedmessage.type == "getSettings") {
        printlnMessage("messages", received_msg);
    }
    if (receivedmessage.type == "getStatus") {
        printlnMessage("messages", received_msg);
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

function settingsClicked() {
    requestStatus();
    var settings = document.getElementById("settings");
    settings.style.display = "block";
    //alert('status');
}

function requestStatus() {
    document.getElementById("keepMeasurement").value = "query..";
    document.getElementById("DataFileLines").value = "query..";
    document.getElementById("bufferLength").value = "query..";
    // sendmessage.type = "status";
    // sendmessage.data = " ";
    // socket.send(JSON.stringify(sendmessage));
}

function PWMMode() {
    PWMmanualchecked = document.getElementById("PWMmanual").checked;
    //sendmessage.type = "PWMMode";
    if (PWMmanualchecked == true) {
        visible("PWMmanualdiv");
        value = "PWMmanual";
    } else {
        invisible("PWMmanualdiv");
        value = "MPPT";
    }
    //sendmessage.data = value;
    //socket.send(JSON.stringify(sendmessage));
}

function setPWMButton() {
    var value = document.getElementById("PWM").value;
    sendmessage.type = "PWM";
    sendmessage.data = value;
    socket.send(JSON.stringify(sendmessage));

    // if (existCookie('simulation') != true)
    //   setCookie('simulation', 0, 100);
    // if (getCookie('simulation') == '1')
    //   sim = 1;
    // else
    //   sim = 0;
}

function showMessages() {
    if (document.getElementById("showMessages").checked) {
        show("messagesDiv");
    } else {
        hide("messagesDiv");
    }
}

function clearMessages() {
    document.getElementById("messages").value = "";
}

function listSPIFFS() {
    sendmessage.type = "listSPIFFS";
    sendmessage.data = "now!";
    socket.send(JSON.stringify(sendmessage));
}

function getSettings() {
    sendmessage.type = "getSettings";
    sendmessage.data = "now!";
    socket.send(JSON.stringify(sendmessage));
}

function getStatus() {
    sendmessage.type = "getStatus";
    sendmessage.data = "now!";
    socket.send(JSON.stringify(sendmessage));
}

function enableDataFiles() {
    enableDataFileschecked = document.getElementById("enableDataFiles").checked;
    sendmessage.type = "enableDataFiles";
    if (enableDataFileschecked == true) {
        document.getElementById("enableDataFilescontent").style.display = "block";
        value = "true";
    } else {
        document.getElementById("enableDataFilescontent").style.display = "none";
        value = "false";
    }
    sendmessage.data = value;
    socket.send(JSON.stringify(sendmessage));
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

function visible(name) {
    var x = document.getElementById(name);
    x.style.visibility = "visible";
}

function invisible(name) {
    var x = document.getElementById(name);
    x.style.visibility = "hidden";
}


function show(name) {
    var x = document.getElementById(name);
    x.style.display = "block";
}

function hide(name) {
    var x = document.getElementById(name);
    x.style.display = "none";
}



