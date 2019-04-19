

//Serial1.setup(9600, { rx: serial_pin, tx: serial_pin });

Serial1.setup(9600, { tx: B6, rx: B7 });



Serial1.print("i:\n");


var cmd = "";
Serial1.on('data', function (data) {
    cmd += data;
    //print(cmd);

    if (data === '\n') {
        print(cmd);
        cmd = '';
    }
});


//Serial1.print("Espruino sending request to Arduino\n");
// var arduinoMessage = {
//     PWM: 21
// };
// var arduinoMessageJSON = JSON.stringify(arduinoMessage);
// Serial1.write(arduinoMessageJSON);
