//var myflash = require("W25Q");
var myfl = require("W25Q");
var myflash = new myfl(SPI1, B6 /*CS*/ );
var myJedec = myflash.getJedec();
//var mydata = Array(256).fill(0);
var mydata = Array(20).fill(0);

function readPage(page) {
    //for (i = 0; i < 256; i++) {
    for (i = 0; i < 20; i++) {
        myflash.seek(page, i);
        mydata[i] = myflash.read();
    }
    return mydata;
    //console.log("data: " + mydata);
}


console.hex = (d) => console.log((Object(d).buffer instanceof ArrayBuffer ? new Uint8Array(d.buffer) :
    typeof d === 'string' ? (new TextEncoder('utf-8')).encode(d) :
    new Uint8ClampedArray(d)).reduce((p, c, i, a) => p + (i % 16 === 0 ? i.toString(16).padStart(6, 0) + '  ' : ' ') +
    c.toString(16).padStart(2, 0) + (i === a.length - 1 || i % 16 === 15 ?
        ' '.repeat((15 - i % 16) * 3) + Array.from(a).splice(i - i % 16, 16).reduce((r, v) =>
            r + (v > 31 && v < 127 || v > 159 ? String.fromCharCode(v) : '.'), '  ') + '\n' : ''), ''));


function padLeft(times, str) {
    return (Array(times).join(str) + this);
}

// function hexdump(buffer) {
//     let lines = [];

//     for (let i = 0; i < buffer.length; i += 16) {
//         let address = this.padLeft(8, i.toString(16)); // address
//         let block = buffer.slice(i, i + 16); // cut buffer into blocks of 16
//         let hexArray = [];
//         let asciiArray = [];
//         let padding = '';

//         for (let value of block) {
//             //hexArray.push(value.toString(16).padLeft(2, '0'));
//             hexArray.push(padLeft(2, value.toString(16)));
//             asciiArray.push(value >= 0x20 && value < 0x7f ? String.fromCharCode(value) : '.');
//         }

//         // if block is less than 16 bytes, calculate remaining space
//         if (hexArray.length < 16) {
//             let space = 16 - hexArray.length;
//             padding = ' '.repeat(space * 2 + space + (hexArray.length < 9 ? 1 : 0));
//             // calculate extra space if 8 or less
//         }

//         let hexString =
//             hexArray.length > 8 ?
//             hexArray.slice(0, 8).join(' ') + '  ' + hexArray.slice(8).join(' ') :
//             hexArray.join(' ');

//         let asciiString = asciiArray.join('');
//         let line = `${address}  ${hexString}  ${padding}|${asciiString}|`;

//         lines.push(line);
//     }

//     return lines.join('\n');
// }

// console.log(hexdump("bla1bla2"));


function hexdump(buffer, blockSize) {
    blockSize = blockSize || 16;
    var lines = [];
    var hex = "0123456789ABCDEF";
    for (var b = 0; b < buffer.length; b += blockSize) {
        var block = buffer.slice(b, Math.min(b + blockSize, buffer.length));
        var addr = ("0000" + b.toString(16)).slice(-4);
        var codes = block.split('').map(function (ch) {
            var code = ch.charCodeAt(0);
            return " " + hex[(0xF0 & code) >> 4] + hex[0x0F & code];
        }).join("");
        codes += "   ".repeat(blockSize - block.length);
        var chars = block.replace(/[\x00-\x1F\x20]/g, '.');
        chars += " ".repeat(blockSize - block.length);
        lines.push(addr + " " + codes + "  " + chars);
    }
    return lines.join("\n");
}

console.log(hexdump("bla1bla2",16));


SPI1.setup({
    mosi: B5,
    miso: B4,
    sck: B3
});

console.log("manufacturer ID: " + myJedec.manufacturerId.toString(16));
console.log("      device ID: " + myJedec.deviceId.toString(16));
console.log("capacity: " + myflash.getCapacity());

//console.log("data before read: " + mydata);
console.log("data before erase");
console.log(readPage(0));
console.log(readPage(1));




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