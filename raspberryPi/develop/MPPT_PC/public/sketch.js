// where the serial server is (your local machine):
var host = document.location.host;
var socket; // the websocket
var sendpacket = {
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
  sendpacket.type = "Hello";
  socket.send(JSON.stringify(sendpacket));
}

function readMessage(event) {
  //console.log('readMessage');
  //printlnMessage("messages", event.type);
  receivedmessage = JSON.parse(event.data);
  if (receivedmessage.type == "livedata") {
    printlnMessage("messages", event.data);
    //document.getElementById("liveDatatmp").innerHTML = receivedmessage.data;
    refreshTable("liveTable", receivedmessage.data);
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

  if (receivedmessage.type == "query") {
    printlnMessage("messages", JSON.stringify(receivedmessage));
    document.getElementById("LogPeriod").value = receivedmessage.data.LogPeriod;
    document.getElementById("LogFilePeriod").value = receivedmessage.data.LogFilePeriod;
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
    //setCookie("livedata", 1, 365);
  } else {
    sendpacket.type = "storeddata";
    socket.send(JSON.stringify(sendpacket));
    show("storedData");
    hide("liveData");
    //setCookie("livedata", 0, 365);
  }
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

function filesComboSelect() {
  fileName = getSelectedText("filesComboBox");
  refreshData(fileName);
}

function getSelectedText(elementId) {
  var elt = document.getElementById(elementId);
  if (elt.selectedIndex == -1) return null;
  return elt.options[elt.selectedIndex].text;
}

function refreshData(fileName) {
  sendpacket.type = "readfile";
  sendpacket.data = fileName;
  socket.send(JSON.stringify(sendpacket));
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

function hide(name) {
  var x = document.getElementById(name);
  x.style.display = "none";
}

function settingsClicked() {
  document.getElementById("LogPeriod").value = 'query..';
  document.getElementById("LogFilePeriod").value = 'query..';
  sendpacket.type = "query";
  sendpacket.data = " ";
  socket.send(JSON.stringify(sendpacket));
  var settings = document.getElementById("settings");
  settings.style.display = "block";
  //alert('query');
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
  sendpacket.type = "PWM";
  sendpacket.data = value;
  socket.send(JSON.stringify(sendpacket));

  // if (existCookie('simulation') != true)
  //   setCookie('simulation', 0, 100);
  // if (getCookie('simulation') == '1')
  //   sim = 1;
  // else
  //   sim = 0;
}

function PWMMode() {
  manualchecked = document.getElementById("manual").checked;
  sendpacket.type = "PWMMode";
  if (manualchecked == true) {
    show("PWMmanualdiv");
    hide("MPPTdiv");
    value = "manual";
  } else {
    show("MPPTdiv");
    hide("PWMmanualdiv");
    value = "MPPT";
  }
  sendpacket.data = value;
  socket.send(JSON.stringify(sendpacket));
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

  sendpacket.type = "SetRTC";
  sendpacket.data = {
    year: year,
    month: month,
    day: day,
    hours: hours,
    minutes: minutes,
    seconds: seconds,
    dayofweek: dayofweek
  };
  socket.send(JSON.stringify(sendpacket));
  const msg = year + ' ' + month + ' ' + day + ' ' + hours + ' ' + minutes + ' ' + seconds;

  alert("Date set to " + msg);
}

function enableLogs() {
  enableLogschecked = document.getElementById("enableLogs").checked;
  sendpacket.type = "enableLogs";
  if (enableLogschecked == true) {
    document.getElementById("enableLogscontent").style.display = "block";
    value = "true";
  } else {
    document.getElementById("enableLogscontent").style.display = "none";
    value = "false";
  }
  sendpacket.data = value;
  socket.send(JSON.stringify(sendpacket));
}

function setLogPeriodButton() {
  var value = document.getElementById("LogPeriod").value;
  sendpacket.type = "LogPeriod";
  sendpacket.data = value;
  socket.send(JSON.stringify(sendpacket));

}

function setLogFilePeriodButton() {
  var value = document.getElementById("LogFilePeriod").value;
  sendpacket.type = "LogFilePeriod";
  sendpacket.data = value;
  socket.send(JSON.stringify(sendpacket));

}
