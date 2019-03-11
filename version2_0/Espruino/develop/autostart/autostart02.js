var toggle = false;
function start() {
  setInterval(function() {
    toggle = !toggle;
    digitalWrite(LED2, toggle);
    console.log(toggle);
  }, 1000);
}
function onInit() {
  start();
}
