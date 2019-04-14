var toggle = false;
function start() {
  setInterval(function() {
    toggle = !toggle;
    digitalWrite(LED1, !toggle); // red LED
    digitalWrite(LED2, toggle); // green LED
    console.log(toggle);
  }, 1000);
}
  start();
