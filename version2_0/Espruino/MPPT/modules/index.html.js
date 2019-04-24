myhtml = `
<html>

<head>
    <script>
        var ws;
        var sendmessage = {
            type: 'none',
            data: 'empty'
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
            }
        }

        window.onload = () => {

            printlnMessage('messages', "window.onload");

            ws = new WebSocket('ws://' + location.host, 'protocolOne');
            ws.onmessage = evt => {
                receivedmessage = JSON.parse(evt.data);

                printlnMessage('messages', JSON.stringify(receivedmessage));

                if (receivedmessage.type == 'values') {
                    var liveTable = document.getElementById('liveData');
                    receiveddata = receivedmessage.data;
                    liveTable.innerHTML = receiveddata;
                }
            };
        };
    </script>
</head>

<body>
    <div id='messagesDiv'>
        <textarea id='messages' rows='10' cols='60' style='width: 100%;'></textarea>
    </div>
    <div id='liveData'>
    </div>
</body>

</html>
`;

function webpage() {
//print('MPPT web page');
}

webpage.prototype.gethtml = function () {
return myhtml;
};

exports = webpage;