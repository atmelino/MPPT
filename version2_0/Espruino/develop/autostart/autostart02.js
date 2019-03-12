var toggle = false;
var interval;

function start() {
  setInterval(function() {
    toggle = !toggle;
    digitalWrite(LED2, toggle);
    console.log(toggle);
  }, 1000);
}
function onInit() {
  console.log('blink test  Press button on Espruino to stop');

  start();
}

setWatch(function (e) {
    console.log("Stop program");
    clearInterval(interval);
}, BTN, { repeat: true, edge: 'rising' });
