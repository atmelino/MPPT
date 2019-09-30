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
    if (receivedmessage.type == "listyears") {
        printlnMessage("messages", "Message is received..." + event.data);
        //printlnMessage("messages", "array for years " + receivedmessage.data);
        setYearsComboBox(receivedmessage.data);
        //filesComboSelect();
    }
    if (receivedmessage.type == "listmonths") {
        printlnMessage("messages", "Message is received..." + event.data);
        setMonthsComboBox(receivedmessage.data);
        //filesComboSelect();
    }
    if (receivedmessage.type == "listdays") {
        printlnMessage("messages", "Message is received...listdays");
        //printlnMessage("messages", "Message is received..." + event.data);
        setDaysComboBox(receivedmessage.data);
        daysComboSelect();
    }


    if (receivedmessage.type == "getSettings") {
        printlnMessage("messages", received_msg);
        document.getElementById("dataFilesBox").style.filter = "none";
        if (receivedmessage.data.DataFilesYesNo == "true") {
            //printlnMessage("messages", "enableDataFiles true");
            document.getElementById("enableDataFiles").checked = true;
            document.getElementById("enableDataFilescontent").style.display = "block";
        }
        if (receivedmessage.data.DataFilesYesNo == "false") {
            //printlnMessage("messages", "enableDataFiles false");
            document.getElementById("enableDataFiles").checked = false;
            document.getElementById("enableDataFilescontent").style.display = "none";
        }
        document.getElementById("DataFileLines").value = receivedmessage.data.DataFileLines;
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

function liveStored() {
    ldchecked = document.getElementById("live").checked;
    //printlnMessage("messages", ldchecked);

    if (ldchecked == true) {
        show("liveData");
        hide("storedData");
        invisible("fileSelect");
        //setCookie("livedata", 1, 365);
    } else {
        sendmessage.type = "listyears";
        socket.send(JSON.stringify(sendmessage));
        show("storedData");
        visible("fileSelect");
        hide("liveData");
        //setCookie("livedata", 0, 365);
    }
}

function setYearsComboBox(items) {
    printlnMessage("messages", "setYearsComboBox items=" + items);
    printlnMessage("messages", "items[1]=" + items[1]);

    elementId = document.getElementById("yearsComboBox");
    elementId.options.length = 0;

    for (var i = 0; i < items.length; i++) {
        AddItem("yearsComboBox", items[i], items[i]);
    }
    yearsComboSelect();
}

function yearsComboSelect() {
    const year = getSelectedText("yearsComboBox");
    sendmessage.type = "listmonths";
    sendmessage.data = "/" + year;
    socket.send(JSON.stringify(sendmessage));
}

function setMonthsComboBox(items) {
    elementId = document.getElementById("monthsComboBox");
    elementId.options.length = 0;
    for (var i = 0; i < items.length; i++) {
        AddItem("monthsComboBox", items[i], items[i]);
    }
    monthsComboSelect();
}

function monthsComboSelect() {
    year = getSelectedText("yearsComboBox");
    month = getSelectedText("monthsComboBox");
    sendmessage.type = "listdays";
    sendmessage.data = "/" + year + "/" + month;
    socket.send(JSON.stringify(sendmessage));
}

function setDaysComboBox(items) {
    // printlnMessage('messages',items);
    elementId = document.getElementById("daysComboBox");
    elementId.options.length = 0;
    for (var i = 0; i < items.length; i++) {
        AddItem("daysComboBox", items[i], items[i]);
    }
}




function settingsClicked() {
    //myitems = ['file1.js','file2.js','file3.js'];
    //printlnMessage("messages", myitems[1]);

    getSettings();
    var settings = document.getElementById("settings");
    settings.style.display = "block";
    //alert('status');
}

function getSettings() {
    printlnMessage("messages", "getSettings");
    document.getElementById("keepMeasurement").value = "query..";
    document.getElementById("DataFileLines").value = "query..";
    document.getElementById("bufferLength").value = "query..";
    sendmessage.type = "getSettings";
    sendmessage.data = "now!";
    socket.send(JSON.stringify(sendmessage));
}

function getStatus() {
    printlnMessage("messages", "getStatus");
    document.getElementById("keepMeasurement").value = "query..";
    document.getElementById("DataFileLines").value = "query..";
    document.getElementById("bufferLength").value = "query..";
    sendmessage.type = "getStatus";
    sendmessage.data = "now!";
    socket.send(JSON.stringify(sendmessage));
}

function DebugLevel() {
    if (document.getElementById("debug0").checked)
        debugLevel = 0;
    if (document.getElementById("debug1").checked)
        debugLevel = 1;
    if (document.getElementById("debug2").checked)
        debugLevel = 2;
    if (document.getElementById("debug3").checked)
        debugLevel = 3;
    printlnMessage("messages", "Serial Debug Level=" + debugLevel);
    sendmessage.type = "debugLevel";
    sendmessage.data = debugLevel;
    socket.send(JSON.stringify(sendmessage));
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

function listSD() {
    sendmessage.type = "listSD";
    sendmessage.data = "now!";
    socket.send(JSON.stringify(sendmessage));
}

function printSDFile() {
    var value = document.getElementById("fileName").value;
    sendmessage.type = "printSDFile";
    sendmessage.data = value;
    socket.send(JSON.stringify(sendmessage));
}


function getSettings() {
    sendmessage.type = "getSettings";
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

function setDataFileLinesButton() {
    var value = document.getElementById("DataFileLines").value;
    sendmessage.type = "DataFileLines";
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

function AddItem(Element, Text, Value) {
    // Create an Option object
    var opt = document.createElement("option");

    // Add an Option object to Drop Down/List Box
    document.getElementById(Element).options.add(opt);

    // Assign text and value to Option object
    opt.text = Text;
    opt.value = Value;
}


function getSelectedText(elementId) {
    var elt = document.getElementById(elementId);
    if (elt.selectedIndex == -1) return null;
    return elt.options[elt.selectedIndex].text;
}

