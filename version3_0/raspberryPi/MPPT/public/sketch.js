// where the serial server is (your local machine):
var host = document.location.host;
var socket; // the websocket
var sendmessage = {
  type: "none",
  data: "empty"
};
var debugLevel = 1;

function setup() {
  // connect to server:
  socket = new WebSocket("ws://" + host);
  // socket connection listener:
  socket.onopen = sendIntro;
  // socket message listener:
  socket.onmessage = readMessage;
}

function sendIntro() {
  // convert the message object to a string and send it:
  sendmessage.type = "Hello";
  socket.send(JSON.stringify(sendmessage));
}

function readMessage(event) {
  //console.Data('readMessage');
  //printlnMessage("messages", event.type);
  receivedmessage = JSON.parse(event.data);
  if (receivedmessage.type != "livedata") {
    debugMsgln(event.data, 2);
  }
  if (receivedmessage.type == "livedata") {
    //printlnMessage("messages", event.data);
    //document.getElementById("liveDatatmp").innerHTML = receivedmessage.data;
    refreshTable("liveTable", receivedmessage.data);
  }
  if (receivedmessage.type == "listyears") {
    setYearsComboBox(receivedmessage.data);
    //filesComboSelect();
  }
  if (receivedmessage.type == "listmonths") {
    setMonthsComboBox(receivedmessage.data);
    //filesComboSelect();
  }
  if (receivedmessage.type == "listdir") {
    setFilesComboBox(receivedmessage.data);
    filesComboSelect();
  }
  if (receivedmessage.type == "filedata") {
    //str = receivedmessage.data.replace(/(?:\r\n|\r|\n)/g, "<br>");
    fillTable("storedTable", receivedmessage.data);
  }
  if (receivedmessage.type == "getLog") {
    var logDiv = document.getElementById('logDiv');
    var logContent = receivedmessage.data.replace(/\n/g, '<br>');
    logDiv.innerHTML = logContent;
  }
  if (receivedmessage.type == "status") {
    printlnMessage("messages", JSON.stringify(receivedmessage));
    document.getElementById("keepMeasurement").value = receivedmessage.data.keepMeasurement;
    document.getElementById("DataFileLines").value =
      receivedmessage.data.DataFileLines;
    document.getElementById("bufferLength").value =
      receivedmessage.data.bufferLength;
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

function fillTable(tableName, data) {
  const singleWhiteSpaceData = data.replace(/  +/g, " ");
  const lines = singleWhiteSpaceData.split("\n");
  var table = document.getElementById(tableName);
  for (var i = table.rows.length - 1; i > 0; i--) {
    table.deleteRow(i);
  }
  // for (var i in lines) {
  //   printlnMessage('messages', lines[i]);
  // }
  for (var i = 0; i < lines.length; i++) {
    const splitString = lines[i].replace(/  +/g, " ").split(" ");
    var row = table.insertRow(i + 1);
    var cell = [];
    for (var j = 0; j < 11; j++) {
      cell[j] = row.insertCell(j);
      cell[j].innerHTML = splitString[j];
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
  elementId = document.getElementById("yearsComboBox");
  elementId.options.length = 0;

  for (var i = 0; i < items.length; i++) {
    AddItem("yearsComboBox", items[i], items[i]);
  }
  yearsComboSelect();
}

function setMonthsComboBox(items) {
  elementId = document.getElementById("monthsComboBox");
  elementId.options.length = 0;

  for (var i = 0; i < items.length; i++) {
    AddItem("monthsComboBox", items[i], items[i]);
  }
  monthsComboSelect();
}

function setFilesComboBox(items) {
  // printlnMessage('messages',items);

  elementId = document.getElementById("filesComboBox");
  elementId.options.length = 0;

  for (var i = 0; i < items.length; i++) {
    AddItem("filesComboBox", items[i], items[i]);
  }
}

function yearsComboSelect() {
  const year = getSelectedText("yearsComboBox");
  sendmessage.type = "listmonths";
  sendmessage.data = {
    year: year
  };
  socket.send(JSON.stringify(sendmessage));
}

function monthsComboSelect() {
  year = getSelectedText("yearsComboBox");
  month = getSelectedText("monthsComboBox");
  sendmessage.type = "listdir";
  sendmessage.data = {
    year: year,
    month: month
  };
  socket.send(JSON.stringify(sendmessage));
}

function filesComboSelect() {
  year = getSelectedText("yearsComboBox");
  month = getSelectedText("monthsComboBox");
  fileName = getSelectedText("filesComboBox");
  refreshData(year, month, fileName);
}

function refreshData(year, month, fileName) {
  sendmessage.type = "readfile";
  sendmessage.data = {
    year: year,
    month: month,
    fileName: fileName
  };
  socket.send(JSON.stringify(sendmessage));
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

function PWMMode() {
  PWMmanualchecked = document.getElementById("PWMmanual").checked;
  sendmessage.type = "PWMMode";
  if (PWMmanualchecked == true) {
    visible("PWMmanualdiv");
    value = "PWMmanual";
  } else {
    invisible("PWMmanualdiv");
    value = "MPPT";
  }
  sendmessage.data = value;
  socket.send(JSON.stringify(sendmessage));
}

function settingsClicked() {
  requestStatus();
  var settings = document.getElementById("settings");
  settings.style.display = "block";
  //alert('status');
}

function showMessages() {
  if (document.getElementById("showMessages").checked) {
    //alert('checked');
    show("messagesDiv");
  } else {
    //alert('unchecked');
    hide("messagesDiv");
  }
}

function attribution() {
  const att0 = "Media Attribution:\n";
  const att1 =
    "https://github.com/google/WebFundamentals/tree/master/src/site/icons\n";
  const att2 =
    'http://www.apache.org/licenses/LICENSE-2.0"title="Apache License, Version 2.0\n';
  const att3 = "https://commons.wikimedia.org/w/index.php?curid=33691559";
  alert(att0 + att1 + att2 + att3);
}


function setRTC() {
  var currentDate = new Date(Date.now());
  var year = currentDate.getFullYear();
  var month = currentDate.getMonth() + 1;
  var day = currentDate.getDate();
  var hours = currentDate.getHours();
  var minutes = currentDate.getMinutes();
  var seconds = currentDate.getSeconds();
  var dayofweek = currentDate.getDay();

  sendmessage.type = "SetRTC";
  sendmessage.data = {
    year: year,
    month: month,
    day: day,
    hours: hours,
    minutes: minutes,
    seconds: seconds,
    dayofweek: dayofweek
  };
  socket.send(JSON.stringify(sendmessage));
  const msg =
    year +
    " " +
    month +
    " " +
    day +
    " " +
    hours +
    " " +
    minutes +
    " " +
    seconds;

  alert("Date set to " + msg);
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

function setkeepMeasurementButton() {
  var value = document.getElementById("keepMeasurement").value;
  sendmessage.type = "keepMeasurement";
  sendmessage.data = value;
  socket.send(JSON.stringify(sendmessage));
}

function setDataFileLinesButton() {
  var value = document.getElementById("DataFileLines").value;
  sendmessage.type = "DataFileLines";
  sendmessage.data = value;
  socket.send(JSON.stringify(sendmessage));
}

function requestStatus() {
  document.getElementById("keepMeasurement").value = "query..";
  document.getElementById("DataFileLines").value = "query..";
  document.getElementById("bufferLength").value = "query..";
  sendmessage.type = "status";
  sendmessage.data = " ";
  socket.send(JSON.stringify(sendmessage));
}

function saveNow() {
  sendmessage.type = "saveNow";
  sendmessage.data = " ";
  socket.send(JSON.stringify(sendmessage));
}

function showLog() {
  sendmessage.type = "getLog";
  sendmessage.data = " ";
  socket.send(JSON.stringify(sendmessage));
}


function hideLog() {
  var logDiv = document.getElementById('logDiv');
  logDiv.innerHTML = "";
}


// Helper functions

function debugMsgln(message, level) {
  if (level <= debugLevel)
    printlnMessage("messages", message);
}

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

function show(name) {
  var x = document.getElementById(name);
  x.style.display = "block";
}

function hide(name) {
  var x = document.getElementById(name);
  x.style.display = "none";
}

function showHide(name) {
  var x = document.getElementById(name);
  if (x.style.display === "none") {
    x.style.display = "block";
  } else {
    x.style.display = "none";
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


