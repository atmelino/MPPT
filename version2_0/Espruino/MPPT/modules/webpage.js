myhtml = `<html>
<head>
<style>
table, td {
  border: 1px solid black;
}
</style>
<script>

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
    //elementId.innerHTML += "";
  }
}

window.onload = () => {
  var ws = new WebSocket('ws://' + location.host, 'protocolOne');
  var led = document.getElementById('led');
  var table = document.getElementById("liveTable");
  ws.onmessage = evt => {
    receivedmessage=evt.data;
    printlnMessage("messages", JSON.stringify(receivedmessage));
    receiveddata = JSON.parse(receivedmessage);
    var x = document.getElementById("liveTable").rows.length;
    if(x>10){
      document.getElementById("liveTable").deleteRow(1);
      x-=1;
    }
    {
      var row = table.insertRow(x);
      row.insertCell(0).innerHTML =receiveddata.current_mA3;
      row.insertCell(1).innerHTML =receiveddata.number;
      row.insertCell(2).innerHTML =receiveddata.busVoltage1;
      row.insertCell(3).innerHTML =receiveddata.current_mA1;
      row.insertCell(3).innerHTML =receiveddata.power_mW1;
      row.insertCell(4).innerHTML =receiveddata.busVoltage3;
      row.insertCell(5).innerHTML =receiveddata.current_mA3;
      row.insertCell(6).innerHTML =receiveddata.power_mW3;

    }
};
  led.onchange = evt => {
    ws.send(led.value);
  };
};

</script>
</head>
<body>
  <p>
    LED on:
    <select id="led">
      <option>off</option><option>on</option>
    </select>
  </p>
 <div id="messagesDiv">
  <textarea
    id="messages"
    rows="10"
    cols="60"
    style="width: 100%;"
  ></textarea>
</div>
<div id="liveData">
  <table id="liveTable">
    <tr>
      <th>Date</th>
      <th>nr</th>
      <th>Sol V</th>
      <th>mA</th>
      <th>mW</th>
      <th>Bat V</th>
      <th>mA</th>
      <th>mW</th>
      <th>eff</th>
      <th>act</th>
      <th>tgt</th>
    </tr>
  </table>

  <div id="liveDatatmp"></div>
</div>
<div id="storedData" style="display: none">
  <table id="storedTable">
    <tr>
      <th>Date</th>
      <th>nr</th>
      <th>V</th>
      <th>mA</th>
      <th>mW</th>
      <th>V</th>
      <th>mA</th>
      <th>mW</th>
      <th>eff</th>
      <th>act</th>
      <th>tgt</th>
    </tr>
  </table>

  <div id="storedDatatmp"></div>
</div>
</div>


</body>
</html>`;

function webpage() {
  //print("MPPT web page");
}

webpage.prototype.gethtml = function() {
  return myhtml;
};

exports = webpage;
