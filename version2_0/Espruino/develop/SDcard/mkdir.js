

var myfs = require("fs");

function makeYearDir(year) {



}

try {
    var rootDir, yearDir, monthDir, dayDir;
    var year = "2020";
    var month = '6';
    var yearMonth = year + '/' + month;
    var day = '14';
    var yearMonthDay = year + '/' + month + '/' + day;
    var fullPath;
    // console.log(yearMonth);

    SPI1.setup({ mosi: B5, miso: B4, sck: B3 });
    E.connectSDCard(SPI1, B6 /*CS*/);

    rootDir = myfs.readdirSync();
    console.log(rootDir);
    console.log(rootDir.indexOf(year));
    if (rootDir.indexOf(year) < 0) {
        myfs.mkdirSync(year);
    }
    rootDir = myfs.readdirSync();
    console.log(rootDir);

    yearDir = myfs.readdirSync(year);
    console.log(yearDir);
    console.log(yearDir.indexOf(month));
    if (yearDir.indexOf(month) < 0) {
        myfs.mkdirSync(yearMonth);
    }
    yearDir = myfs.readdirSync(year);
    console.log(yearDir);

    monthDir = myfs.readdirSync(yearMonth);
    console.log(monthDir);
    console.log(monthDir.indexOf(day));
    if (monthDir.indexOf(day) < 0) {
        myfs.mkdirSync(yearMonthDay);
    }
    monthDir = myfs.readdirSync(yearMonth);
    console.log(monthDir);


    // write a file in year
    fullPath = year + '/' + 'hello_more_than_8_char.txt';
    console.log('full path: ' + fullPath);
    dataFile = E.openFile(fullPath, "a");
    dataFile.write('hello');
    dataFile.close();
    yearDir = myfs.readdirSync(year);
    console.log('year dir: ' + yearDir);

    // write a file in year
    fullPath = '2019/4/hello_in_month.txt';
    console.log('full path: ' + fullPath);
    dataFile = E.openFile(fullPath, "a");
    dataFile.write('hello');
    dataFile.close();
    monthDir = myfs.readdirSync('2019/4');
    console.log('month dir: ' + monthDir);


    // write a file in day
    fullPath = '2019/4/12/04_12_19_02_12_35.txt';
    console.log('full path: ' + fullPath);
    dataFile = E.openFile(fullPath, "a");
    dataFile.write('hello');
    dataFile.close();
    dayDir = myfs.readdirSync('2019/4/12');
    console.log('day dir: ' + dayDir);





    E.unmountSD();

}
catch (e) {
    E.unmountSD();
    console.log(e.message);
}
// finally {
//     E.unmountSD();
// }