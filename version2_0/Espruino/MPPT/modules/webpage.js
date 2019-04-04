myhtml = `
<html>

<head>
    <style>
        table,
        td {
            border: 1px solid black;
        }

        .popup {
            position: absolute;
            width: 600px;
            z-index: 999;
            display: none;
            top: 0;
            background-color: powderblue;
            border: 1px solid #ddd;
            border-radius: 5px;
            box-shadow: 0 2px 8px #aaa;
            overflow: hidden;
            padding: 10px;
        }

        .title_box {
            border: #3c5a86 1px dotted;
        }

        .title_box #title {
            position: relative;
            top: -0.5em;
            margin-left: 1em;
            display: inline;
            background-color: white;
        }
    </style>

    <script>
        var ws;
        var showMessagesFlag = false;
        var clientDateUTC;
        var clientDate;
        var sendmessage = {
            type: "none",
            data: "empty"
        };
        function printMessage(target, message) {
            elementId = document.getElementById(target);
            if (elementId != null) {
                elementId.innerHTML += message;
                elementId.scrollTop = elementId.scrollHeight;
            }
        }

        function printlnMessage(target, message) {
            elementId = document.getElementById(target);
            if (elementId != null) {
                printMessage(target, message);
                //elementId.innerHTML += "";
            }
        }

        function show(name) {
            var x = document.getElementById(name);
            x.style.display = "block";
        }

        function hide(name) {
            var x = document.getElementById(name);
            x.style.display = "none";
        }

        function showMessages() {
            if (document.getElementById("showMessages").checked) {
                showMessagesFlag = true;
                show("messagesDiv");
            } else {
                showMessagesFlag = false;
                hide("messagesDiv");
            }
        }

        function PWMminusButton() {
            sendmessage.type = 'PWMminus';
            ws.send(JSON.stringify(sendmessage));
        }

        function PWMplusButton() {
            sendmessage.type = 'PWMplus';
            ws.send(JSON.stringify(sendmessage));
        }

        function setRTCButton() {
            sendmessage.type = 'setRTC';
            // var year = clientDate.getFullYear();
            // var month = clientDate.getMonth() + 1;
            // var day = clientDate.getDate();
            // var hours = clientDate.getHours();
            // var minutes = clientDate.getMinutes();
            // var seconds = clientDate.getSeconds();
            // var dayofweek = clientDate.getDay();
            var year = clientDateUTC.getFullYear();
            var month = clientDateUTC.getMonth() + 1;
            var day = clientDateUTC.getDate();
            var hours = clientDateUTC.getHours();
            var minutes = clientDateUTC.getMinutes();
            var seconds = clientDateUTC.getSeconds();
            var dayofweek = clientDateUTC.getDay();
            setDate = {
                year: year,
                month: month,
                day: day,
                hours: hours,
                minutes: minutes,
                seconds: seconds,
                dayofweek: dayofweek
            }
            printlnMessage("messages", JSON.stringify(setDate));
            sendmessage.data = setDate;
            ws.send(JSON.stringify(sendmessage));
        }

        function setloopPeriod() {
            var value = document.getElementById("loopPeriod").value;
            sendmessage.type = 'loopPeriod';
            sendmessage.data = value;
            ws.send(JSON.stringify(sendmessage));
        }

        function LEDonOff() {
            sendmessage.type = 'LED';
            if (document.getElementById("LEDonOff").checked) {
                sendmessage.data = 'on';
            } else {
                sendmessage.data = 'off';
            }
            ws.send(JSON.stringify(sendmessage));
        }

        function settingsClicked() {
            var el = document.getElementById('settings');
            el.style.display = 'block';

            // Updates: set window background color black
            document.body.style.background = '#353333';
        }

        function closePopup() {
            var el = document.getElementById('settings');
            el.style.display = 'none';
            document.body.style.background = 'white';
        }


        window.onload = () => {
            ws = new WebSocket('ws://' + location.host, 'protocolOne');
            var table = document.getElementById("liveTable");
            ws.onmessage = evt => {
                receivedmessage = evt.data;
                if (showMessagesFlag) {
                    //printlnMessage("messages", JSON.stringify(receivedmessage));
                }
                receiveddata = JSON.parse(receivedmessage);
                var x = document.getElementById("liveTable").rows.length;
                if (x > 10) {
                    document.getElementById("liveTable").deleteRow(1);
                    x -= 1;
                }
                {
                    var row = table.insertRow(x);
                    row.insertCell(0).innerHTML = receiveddata.date;
                    row.insertCell(1).innerHTML = receiveddata.number;
                    row.insertCell(2).innerHTML = receiveddata.busVoltage3;
                    row.insertCell(3).innerHTML = receiveddata.current_mA3;
                    row.insertCell(4).innerHTML = receiveddata.power_mW3;
                    row.insertCell(5).innerHTML = receiveddata.busVoltage1;
                    row.insertCell(6).innerHTML = receiveddata.current_mA1;
                    row.insertCell(7).innerHTML = receiveddata.power_mW1;
                    row.insertCell(8).innerHTML = ' ';
                    row.insertCell(9).innerHTML = receiveddata.PWM_actual;
                    row.insertCell(10).innerHTML = receiveddata.PWM_target;
                }
                clientDateUTC = new Date(Date.now());
                clientDate = new Date(clientDateUTC.getTime() - clientDateUTC.getTimezoneOffset() * 60000);
                //var clientDateString = clientDate.toISOString().replace(/:/g, "_").slice(0, 19);
                //var clientDateString = clientDate.toISOString().slice(0, 19);
                var clientDateString = clientDate.toISOString().replace(/T/g, " ").slice(0, 19);
                document.getElementById("clientDate").innerHTML = clientDateString;
                if (showMessagesFlag) {
                    printlnMessage("messages", JSON.stringify(clientDate));
                }
            };
        };
    </script>

</head>

<body>
    <div id="menuheader">
        <div style="display: table; background-color: #eeeeff;">
            <div style="display: table-row">
                <div style="width: 20%; display: table-cell; white-space: nowrap;">
                    <label><input type="checkbox" onclick="LEDonOff()" id="LEDonOff" value="male" unchecked />
                        LED
                    </label>
                </div>
                <div style="width: 20%; display: table-cell; white-space: nowrap;">
                    <button id="PWMminus" onclick="PWMminusButton()">-</button>
                    PWM
                    <button id="PWMplus" onclick="PWMplusButton()">+</button>
                </div>
                <div style="width: 20%; display: table-cell; white-space: nowrap;">
                    Date
                    <span id="clientDate"></span>
                    <button id="setRTC" onclick="setRTCButton()">set RTC</button>
                </div>
                <div style="width: 12%; display: table-cell; white-space: nowrap;">
                    <button id="settingsButton" onclick="settingsClicked()">Settings</button>
                </div>
            </div>
        </div>
    </div>
    <div id="messagesDiv" style="display: none">
        <textarea id="messages" rows="10" cols="60" style="width: 100%;"></textarea>
    </div>
    <div id="liveData">
        <table id="liveTable">
            <tr>
                <th>Date</th>
                <th>nr</th>
                <th>Sol V</th>
                <th>mA</th>
                <th>mW</th>
                <th>Bat V</th>
                <th>mA</th>
                <th>mW</th>
                <th>eff</th>
                <th>act</th>
                <th>tgt</th>
            </tr>
        </table>
    </div>
    <div id="storedData" style="display: none">
        <table id="storedTable">
            <tr>
                <th>Date</th>
                <th>nr</th>
                <th>V</th>
                <th>mA</th>
                <th>mW</th>
                <th>V</th>
                <th>mA</th>
                <th>mW</th>
                <th>eff</th>
                <th>act</th>
                <th>tgt</th>
            </tr>
        </table>
    </div>


    <div id="settings" class="popup">
        <h4>Settings</h4>
        <label><input type="checkbox" onclick="showMessages()" name="showMessages" id="showMessages" value="male"
                unchecked />
            show messages
        </label>
        <button onclick="clearMessage('messages')">Clear messages</button>
        <div>
            <label style="white-space: nowrap"><input type="radio" name="mode" id="manual" onclick="PWMMode()"
                    checked="true" />PWM manual</label>
            <!-- -->
            <label style="white-space: nowrap"><input type="radio" name="mode" id="MPPT"
                    onclick="PWMMode()" />MPPT</label>
        </div>
        <br>
        <div>
            Measure Period
            <input id="loopPeriod" name="value" value="1000" />ms
            <button onclick="setloopPeriod()" id="setloopPeriod">
                Set</button><br>
            <label><input type="checkbox" onclick="sendDataCheckbox()" name="sendData" id="sendData" value="male"
                    checked />
                Server sends data </label>
        </div>
        <br>
        <!-- -->
        <div class="title_box" id="logsbox">
            <div id="title">
                <label><input type="checkbox" onclick="enableLogs()" name="enableLogs" id="enableLogs" value="male"
                        unchecked />
                    Log Files<br>
                    <!-- -->
                </label>
            </div>
            <div id="enableLogscontent">
                Log values every
                <input id="LogPeriod" name="value" value="query.." /> seconds
                <button onclick="setLogPeriodButton()" id="setLogPeriodButton">
                    Set</button><br>
                Save log file every
                <input id="LogFilePeriod" name="value" value="query.." /> seconds
                <button onclick="setLogFilePeriodButton()" id="setLogFilePeriodButton">
                    Set</button><br>
                current buffer length
                <input id="bufferLength" name="value" value="query.." />
                <button onclick="requestStatus()" id="requestStatus">
                    Refresh</button><br>
            </div>
        </div>
        <br>
        <button class="close_button" onClick="closePopup()">close</button>
    </div>
</body>

</html>
`;

function webpage() {
//print("MPPT web page");
}

webpage.prototype.gethtml = function () {
return myhtml;
};

exports = webpage;