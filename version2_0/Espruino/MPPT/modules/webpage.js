

myhtml = `<html>
<head>
<style>
table, td {
  border: 1px solid black;
}
</style>
<script>
window.onload = () => {
  var ws = new WebSocket('ws://' + location.host, 'protocolOne');
  var led = document.getElementById('led');
  var table = document.getElementById("liveTable");
  ws.onmessage = evt => {
    receivedmessage=evt.data;
    receiveddata = JSON.parse(receivedmessage);

    document.getElementById("content").innerHTML = receivedmessage;
    var x = document.getElementById("liveTable").rows.length;
    if(x<10){
      document.getElementById("message").innerHTML = x;
      var row = table.insertRow(x);
      var y = row.insertCell(0);
      y.innerHTML = "New cell";
      row.insertCell(1).innerHTML =receiveddata.current_mA3;
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
  <div id="message"></div>

  <div id="content"></div>

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

webpage.prototype.gethtml = function () {
  return myhtml;
};

exports = webpage;
