myhtml1 = `
<html>
hello

</html>
`;


myhtml = `
<html>

<body>
    <div id='menuheader'>
        <div style='display: table; background-color: #eeeeff;'>
            <div style='display: table-row'>
                <div style='width: 20%; display: table-cell; white-space: nowrap;'>
                    Date
                    <span id='clientDate'></span>
                    <button id='setRTC' onclick='setRTCButton()'>set RTC</button>
                </div>
                <div style='width: 12%; display: table-cell; white-space: nowrap;'>
                    <button id='settingsButton' onclick='settingsClicked()'>Settings</button>
                </div>
            </div>
        </div>
    </div>
</body>

</html>
`;

function webpage() {
}

webpage.prototype.gethtml = function () {
return myhtml;
};

exports = webpage;