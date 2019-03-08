var toggle = false;
function start() {
  setInterval(function() {
    toggle = !toggle;
    digitalWrite(LED2, toggle);
    console.log(toggle);
  }, 5000);
}
function onInit() {
  start();
}
