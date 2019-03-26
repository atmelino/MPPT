myhtml = `
<html>

<head>
    <style>
        table,
        td {
            border: 1px solid black;
        }
    </style>
    <script>
        var ws;
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
            var year = clientDate.getFullYear();
            var month = clientDate.getMonth() + 1;
            var day = clientDate.getDate();
            var hours = clientDate.getHours();
            var minutes = clientDate.getMinutes();
            var seconds = clientDate.getSeconds();
            var dayofweek = clientDate.getDay();
            setDate = {
                year: year,
                month: month,
                day: day,
                hours: hours,
                minutes: minutes,
                seconds: seconds,
                dayofweek: dayofweek
            }
            sendmessage.data = setDate;
            ws.send(JSON.stringify(sendmessage));
        }

        function LEDoption() {
            sendmessage.type = 'LED';
            sendmessage.data = 'on';
            ws.send(JSON.stringify(sendmessage));
        }


        window.onload = () => {
            ws = new WebSocket('ws://' + location.host, 'protocolOne');
            var table = document.getElementById("liveTable");
            ws.onmessage = evt => {
                receivedmessage = evt.data;
                printlnMessage("messages", JSON.stringify(receivedmessage));
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
                // clientDate = new Date();
                clientDate = new Date(Date.now());
                var clientDateString = clientDate.toISOString().replace(/:/g, "_").slice(0, 19);
                document.getElementById("clientDate").innerHTML = clientDateString;




                //document.getElementById("clientDate").innerHTML = year;


            };
        };
    </script>

</head>

<body>
    <div id="menuheader">
        LED on:
        <select id="led">
            <option>off</option>
            <option>on</option>
        </select>
        <button id="PWMminus" onclick="PWMminusButton()">-</button>
        PWM
        <button id="PWMplus" onclick="PWMplusButton()">+</button>
        Date
        <span id="clientDate"></span>
        <button id="setRTC" onclick="setRTCButton()">set RTC</button>

    </div>
    <div id="messagesDiv">
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
