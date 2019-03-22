

myhtml = `<html>
<head>
<script>
window.onload = () => {
  var ws = new WebSocket('ws://' + location.host, 'protocolOne');
  var btn = document.getElementById('btn');
  var led = document.getElementById('led');
  ws.onmessage = evt => {
    btn.innerText = evt.data;
    document.getElementById("content").innerHTML = evt.data;
};
  led.onchange = evt => {
    ws.send(led.value);
  };
};

</script>
</head>
<body>
  <p>Button: <span id="btn">up</span></p>
  <p>
    LED on:
    <select id="led">
      <option>off</option><option>on</option>
    </select>
  </p>
  Battery<br>
  <div id="content"></div>
</body>
</html>`;


function webpage() {
    //print("MPPT web page");
}

webpage.prototype.gethtml = function () {
    return myhtml;
};

exports = webpage;
