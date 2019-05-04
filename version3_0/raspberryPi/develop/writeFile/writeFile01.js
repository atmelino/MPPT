var rpio = require('rpio');
rpio.i2cBegin();
const fs = require("fs");
const fse = require("fs-extra");
//const readdirp = require('readdirp');
var recursive = require("recursive-readdir");
const RTC = require('./RTC.js');
var rtc = new RTC(rpio);


function writeDataFile(dateTimeString) {
    const year = dateTimeString.slice(0, 4);
    const month = dateTimeString.slice(5, 7);

    console.log(year + " " + month);

    //listFiles();

    makeDataDir(year, month);

    const filename = dateTimeString.replace(/:/g, "_");

    const dir = "./public/data/" + year + "/" + month + "/";
    var path = dir + filename + ".txt";

    console.log(path);

    var content = "hello";



    // fs.writeFile(path, content, function (err) {
    //     if (err) {
    //         return console.log(err);
    //     }

    //     console.log("The file was saved!");
    // });



    buffer = new Buffer.from(content);
    fs.open(path, "w", function (err, fd) {
        if (err) {
            throw "error opening file: " + err;
        }
        fs.write(fd, buffer, 0, buffer.length, null, function (err) {
            if (err) throw "error writing file: " + err;
            fs.close(fd, function () {
                console.log("file written " + path, 1);
            });
        });
    });

    listFiles();

}

function makeDataDir(year, month) {
    const dir = "./public/data/" + year + "/" + month;
    fse.ensureDirSync(dir);
    console.log("existence of folder ensured" + dir, 1);
}

function listFiles() {
    recursive(".", ["node_modules/*"], function (err, files) {
        console.log(files);
    });

}


//var dateTimeString = "2019-05-04_00:26:31";
var dateTimeString = rtc.readDateTimeString();

writeDataFile(dateTimeString);
