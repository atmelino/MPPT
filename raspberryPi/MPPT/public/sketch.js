// where the serial server is (your local machine):
var host = document.location.host;
var socket; // the websocket
var sendmessage = {
  type: "none",
  data: "empty"
};

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
  //console.log('readMessage');
  //printlnMessage("messages", event.type);
  receivedmessage = JSON.parse(event.data);
  if (receivedmessage.type != "livedata") {
    printlnMessage("messages", event.data);
  }
  if (receivedmessage.type == "livedata") {
    //printlnMessage("messages", event.data);
    //document.getElementById("liveDatatmp").innerHTML = receivedmessage.data;
    refreshTable("liveTable", receivedmessage.data);
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
    str = receivedmessage.data.replace(/(?:\r\n|\r|\n)/g, "<br>");
    //document.getElementById("storedDatatmp").innerHTML = str;
    fillTable("storedTable", receivedmessage.data);
    //fillTable(receivedmessage.data);
  }

  if (receivedmessage.type == "status") {
    printlnMessage("messages", JSON.stringify(receivedmessage));
    document.getElementById("LogPeriod").value = receivedmessage.data.LogPeriod;
    document.getElementById("LogFilePeriod").value =
      receivedmessage.data.LogFilePeriod;
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
  for (var j = 0; j < 11; j++) {
    cell[j] = row.insertCell(j);
    cell[j].innerHTML = splitString[j];
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

function liveStored() {
  ldchecked = document.getElementById("live").checked;
  //printlnMessage("messages", ldchecked);

  if (ldchecked == true) {
    show("liveData");
    hide("storedData");
    invisible("fileSelect");
    //setCookie("livedata", 1, 365);
  } else {
    const year = getSelectedText("yearsComboBox");
    sendmessage.type = "listmonths";
    sendmessage.data = {
      year: year
    };
    socket.send(JSON.stringify(sendmessage));
    show("storedData");
    visible("fileSelect");
    hide("liveData");
    //setCookie("livedata", 0, 365);
  }
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

function AddItem(Element, Text, Value) {
  // Create an Option object
  var opt = document.createElement("option");

  // Add an Option object to Drop Down/List Box
  document.getElementById(Element).options.add(opt);

  // Assign text and value to Option object
  opt.text = Text;
  opt.value = Value;
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

function getSelectedText(elementId) {
  var elt = document.getElementById(elementId);
  if (elt.selectedIndex == -1) return null;
  return elt.options[elt.selectedIndex].text;
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

function showHide(name) {
  var x = document.getElementById(name);
  if (x.style.display === "none") {
    x.style.display = "block";
  } else {
    x.style.display = "none";
  }
}

function show(name) {
  var x = document.getElementById(name);
  x.style.display = "block";
}

function visible(name) {
  var x = document.getElementById(name);
  x.style.visibility = "visible";
}

function hide(name) {
  var x = document.getElementById(name);
  x.style.display = "none";
}

function invisible(name) {
  var x = document.getElementById(name);
  x.style.visibility = "hidden";
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
  manualchecked = document.getElementById("manual").checked;
  sendmessage.type = "PWMMode";
  if (manualchecked == true) {
    show("PWMmanualdiv");
    hide("MPPTdiv");
    value = "manual";
  } else {
    show("MPPTdiv");
    hide("PWMmanualdiv");
    value = "MPPT";
  }
  sendmessage.data = value;
  socket.send(JSON.stringify(sendmessage));
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

function enableLogs() {
  enableLogschecked = document.getElementById("enableLogs").checked;
  sendmessage.type = "enableLogs";
  if (enableLogschecked == true) {
    document.getElementById("enableLogscontent").style.display = "block";
    value = "true";
  } else {
    document.getElementById("enableLogscontent").style.display = "none";
    value = "false";
  }
  sendmessage.data = value;
  socket.send(JSON.stringify(sendmessage));
}

function setLogPeriodButton() {
  var value = document.getElementById("LogPeriod").value;
  sendmessage.type = "LogPeriod";
  sendmessage.data = value;
  socket.send(JSON.stringify(sendmessage));
}

function setLogFilePeriodButton() {
  var value = document.getElementById("LogFilePeriod").value;
  sendmessage.type = "LogFilePeriod";
  sendmessage.data = value;
  socket.send(JSON.stringify(sendmessage));
}

function requestStatus() {
  document.getElementById("LogPeriod").value = "query..";
  document.getElementById("LogFilePeriod").value = "query..";
  document.getElementById("bufferLength").value = "query..";
  sendmessage.type = "status";
  sendmessage.data = " ";
  socket.send(JSON.stringify(sendmessage));
}
