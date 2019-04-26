function utils() { }

utils.prototype.hexdump = function (buffer, blockSize) {
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


utils.prototype.hexdumpString = function (buffer, blockSize) {
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


exports = utils;