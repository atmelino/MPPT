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
        //x+=myflash.read();
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
        console.log("codes: " + codes);

        var chars = "                ";
        for (i = 0; i < myblock.length; i++) {
            if (myblock[i] < '\x1F')
                myblock[i] = '.';
        }

        //var chars = block.replace(/[\x00-\x1F\x20]/g, '.');

        //chars += " ".repeat(blockSize - block.length);

        //lines.push(addr + " " + codes + "  " + chars);
        lines.push(addr + " " + codes + "  " + myblock);
    }





    return lines.join("\n");
}

console.log(hexdump("bla1bla2bla3bla4bla5bla6bla7bla8", 16));


console.log("manufacturer ID: " + myJedec.manufacturerId.toString(16));
console.log("      device ID: " + myJedec.deviceId.toString(16));
console.log("capacity: " + myflash.getCapacity());

//console.log("data before read: " + mydata);
console.log("data before erase");
//console.log(readPage(0));
//console.log(readPage(1));

//console.log(hexdump(String(readPage(0), 16)));
console.log(hexdump(readPage(0), 16));
console.log(readPage(0));



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

