var myfl = require("W25Q");
var myflash = new myfl(SPI1, B6 /*CS*/);

SPI1.setup({
    mosi: B5,
    miso: B4,
    sck: B3
});

var myJedec = myflash.getJedec();

function readPage(page) {
    var x = new Uint8Array(256);
    for (i = 0; i < 256; i++) {
        myflash.seek(page, i);
        x[i] = myflash.read();
    }
    return x;
}


function hexdump(buffer, blockSize) {

    var lines = [];
    // for (var j = 0; j < buffer.length; j++) {
    //     console.log("j: " + j + " " + buffer[j].toString(16) + " ");
    // }
    blockSize = blockSize || 16;
    var myblock = new Uint8Array(blockSize);
    var hex = "0123456789ABCDEF";
    for (var b = 0; b < buffer.length; b += blockSize) {

        var addr = ("0000" + b.toString(16)).slice(-4);

        var codes = "";
        for (i = 0; i < myblock.length; i++) {
            myblock[i] = buffer[i + b];
            codes += ("0" + myblock[i].toString(16)).slice(-2) + " ";
        }

        var chars = "";
        for (i = 0; i < myblock.length; i++) {
            if (myblock[i] < 32 || myblock[i] > 127)
                myblock[i] = 46;
            chars += String.fromCharCode(myblock[i]);
        }

        lines.push(addr + " " + codes + "  " + chars);
    }

    return lines.join("\n");
}

console.log();
//console.log(hexdump("bla1bla2bla3bla4bla5bla6bla7bla", 16));


console.log("manufacturer ID: " + myJedec.manufacturerId.toString(16));
console.log("      device ID: " + myJedec.deviceId.toString(16));
console.log("capacity: " + myflash.getCapacity());

console.log("data before erase");

//console.log("page 0:");
//console.log(hexdump(readPage(0), 16));
// console.log("page 200:");
// console.log(hexdump(readPage(200), 16));
// console.log("page 100000:");
// console.log(hexdump(readPage(100000), 16));



console.log("page 1:");
console.log(hexdump(readPage(1), 16));

console.log("page 199:");
console.log(hexdump(readPage(199), 16));
console.log("page 200:");
console.log(hexdump(readPage(200), 16));
console.log("page 201:");
console.log(hexdump(readPage(201), 16));





// if (true) {
//     console.log("erase 16 pages at 0");
//     myflash.erase16Pages(0);
// }

// console.log("data after erase");
// console.log(readPage());

// var myarray = [10, 20, 30];
// myflash.writePage(0, myarray);

// console.log("data after write");
// console.log(readPage());

