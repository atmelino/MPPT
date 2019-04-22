var myfl = require("W25Q");
var myflash = new myfl(SPI1, B6 /*CS*/);

SPI1.setup({
    mosi: B5,
    miso: B4,
    sck: B3
});

var myJedec = myflash.getJedec();
console.log("manufacturer ID: " + myJedec.manufacturerId.toString(16));
console.log("      device ID: " + myJedec.deviceId.toString(16));
console.log("capacity: " + myflash.getCapacity());


function readPage(page) {
    var x = new Uint8Array(256);
    for (i = 0; i < 256; i++) {
        myflash.seek(page, i);
        x[i] = myflash.read();
        //myflash.waitReady();
    }
    return x;
}


function hexdump(buffer, blockSize) {
    var lines = [];
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

function showPage(number) {
    console.log("page " + number + ":");
    console.log(hexdump(readPage(number), 16));
}

function start() {

    console.log();

    for (page = 190; page < 220; page++) {
        showPage(page);
    }

    if (true) {
        console.log("erase 16 pages at 202");
        myflash.erase16Pages(202);
    }

    for (page = 190; page < 220; page++) {
        showPage(page);
    }

}





// showPage(199);
// showPage(200);
// showPage(201);



//console.log("page 0:");
//console.log(hexdump(readPage(0), 16));
// console.log("page 200:");
// console.log(hexdump(readPage(200), 16));
// console.log("page 100000:");
// console.log(hexdump(readPage(100000), 16));



// console.log("page 1:");
// console.log(hexdump(readPage(1), 16));
// console.log("page 199:");
// console.log(hexdump(readPage(199), 16));
// console.log("page 200:");
// console.log(hexdump(readPage(200), 16));
// console.log("page 201:");
// console.log(hexdump(readPage(201), 16));





//console.log("data before erase");
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

