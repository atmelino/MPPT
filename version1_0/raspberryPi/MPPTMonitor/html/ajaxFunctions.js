function printCookies() {
	printlnMessage('messages', "printCookies()");
	ajaxprintCookiesRequest = new XMLHttpRequest();
	ajaxprintCookiesRequest.onreadystatechange = ajaxCalled_printCookies;

	myParams = {
		fs : 'printCookies'
	};
	var requeststring;
	requeststring = "deviceWebSocket.php?json=" + JSON.stringify(myParams);
	ajaxprintCookiesRequest.open("GET", encodeURI(requeststring), true);
	ajaxprintCookiesRequest.send(null);

}

// Create a function that will receive data sent from the server
function ajaxCalled_printCookies() {
	if (ajaxprintCookiesRequest.readyState == 4) {
		printlnMessage('messages', "ajaxCalled_printCookies()");
		printlnMessage('messages', ajaxprintCookiesRequest.responseText);
	}
}

function ajax_networkIP() {
	// printlnMessage('messages',"ajax_networkIP() called");
	try {
		// Opera 8.0+, Firefox, Safari
		ajaxnetworkIPRequest = new XMLHttpRequest();
	} catch (e) {
		// Internet Explorer Browsers
		try {
			ajaxnetworkIPRequest = new ActiveXObject("Msxml2.XMLHTTP");
		} catch (e) {
			try {
				ajaxnetworkIPRequest = new ActiveXObject("Microsoft.XMLHTTP");
			} catch (e) {
				// Something went wrong
				alert("Your browser broke!");
				return false;
			}
		}
	}

	ajaxnetworkIPRequest.onreadystatechange = ajaxCalled_networkIP;
	myParams = {
		fs : 'networkIP'
	};
	var requeststring;
	requeststring = "deviceWebSocket.php?json=" + JSON.stringify(myParams);
	ajaxnetworkIPRequest.open("GET", encodeURI(requeststring), true);
	ajaxnetworkIPRequest.send(null);
}

function ajaxCalled_networkIP() {

	if (ajaxnetworkIPRequest.readyState == 4) {
		// printlnMessage('messages',"ajaxCalled_ajaxCalled_networkIP() state
		// 4");

		networkIPAjax = ajaxnetworkIPRequest.responseText;
		// printlnMessage('messages',networkIPAjax);
		// printlnMessage('messages',"Ethernet= " + networkIPAjax);
		networkIPJSON = JSON.parse(networkIPAjax);
		// printlnMessage('messages',"Ethernet= " + networkIPJSON.eth0IP);
		var eth0IP = networkIPJSON.eth0IP;
		var eth1IP = networkIPJSON.eth1IP;
		var eth2IP = networkIPJSON.eth2IP;
		var eth3IP = networkIPJSON.eth3IP;
		var wlan0IP = networkIPJSON.wlan0IP;
		var wlan1IP = networkIPJSON.wlan1IP;
		var wlan2IP = networkIPJSON.wlan2IP;
		var wlan3IP = networkIPJSON.wlan3IP;
		var wlanIP = "";
		var ethIP = "";

		if (eth0IP != "")
			ethIP = eth0IP;
		if (eth1IP != "")
			ethIP = eth1IP;
		if (eth2IP != "")
			ethIP = eth2IP;
		if (eth3IP != "")
			ethIP = eth3IP;
		if (wlan0IP != "")
			wlanIP = wlan0IP;
		if (wlan1IP != "")
			wlanIP = wlan1IP;
		if (wlan2IP != "")
			wlanIP = wlan2IP;
		if (wlan3IP != "")
			wlanIP = wlan3IP;

		var text = 'WLAN:' + wlanIP + ' Ethernet: ' + ethIP;
		document.getElementById('IPAddress').innerHTML = text;

		// var text2="User:<br> <select id='userComboBox'
		// onchange='userComboSelect()'><option>default</option></select>";
		// document.getElementById('userCell').innerHTML = text2;

	}
}

function ajaxSystemCommand(cmd, callback) {
	// printlnMessage('messages',"ajaxSystemCommand() called");
	try {
		// Opera 8.0+, Firefox, Safari
		ajaxSystemCommandRequest = new XMLHttpRequest();
	} catch (e) {
		// Internet Explorer Browsers
		try {
			ajaxSystemCommandRequest = new ActiveXObject("Msxml2.XMLHTTP");
		} catch (e) {
			try {
				requeststring
				ajaxSystemCommandRequest = new ActiveXObject(
						"Microsoft.XMLHTTP");
			} catch (e) {
				// Something went wrong
				alert("Your browser broke!");
				return false;
			}
		}
	}

	ajaxSystemCommandRequest.onreadystatechange = callback;
	myParams = {
		fs : 'SystemCommand',
		cmd : cmd
	};
	var requeststring;
	requeststring = "deviceWebSocket.php?json=" + JSON.stringify(myParams);
	ajaxSystemCommandRequest.open("GET", encodeURI(requeststring), true);
	ajaxSystemCommandRequest.send(null);
}

// Create a function that will receive data sent from the server
function ajaxCalled_SystemCommand() {
	if (ajaxSystemCommandRequest.readyState == 4) {
		myarray = ajaxSystemCommandRequest.responseText;
		printlnMessage('messages', ajaxSystemCommandRequest.responseText);
	}
}

// Create a function that will receive data sent from the server
function ajaxCalled_SystemCommandScript() {
	if (ajaxSystemCommandRequest.readyState == 4) {
		// printlnMessage('messages', 'ValuesAjax:');
		ValuesAjax = ajaxSystemCommandRequest.responseText;
		// printlnMessage('messages', ValuesAjax);
		ValuesJSON = JSON.parse(ValuesAjax);
		// printlnMessage('messages', JSON.stringify(ValuesJSON));
		// printlnMessage('messages', 'after JSON');
		var length = (ValuesJSON.output).length;
		printlnMessage('messages', 'length of output array=' + length);

		var found = 0;
		for ( var i = 0; i < length; i++) {
			s = ValuesJSON.output[i];
			if (s.indexOf("deviceWebSocket.py") >= 0 && s.indexOf("grep") == -1)
				found = 1;
		}

		if (found == 0)
			document.getElementById('scriptRunning').src = "images/checkMarkRed.png";
		else
			document.getElementById('scriptRunning').src = "images/checkMarkGreen.png";
	}
}

// Create a function that will receive data sent from the server
function ajaxCalled_SystemCommandSWVersion() {
	if (ajaxSystemCommandRequest.readyState == 4) {
		// printlnMessage('messages', 'ValuesAjax:');
		ValuesAjax = ajaxSystemCommandRequest.responseText;
		// printlnMessage('messages', ValuesAjax);
		ValuesJSON = JSON.parse(ValuesAjax);
		// printlnMessage('messages', JSON.stringify(ValuesJSON));
		// printlnMessage('messages', 'after JSON');
		var length = (ValuesJSON.output).length;
		// printlnMessage('messages', length);

		// var found = 0;
		for ( var i = 0; i < length; i++) {
			s = ValuesJSON.output[i];
			if (s.indexOf("deviceWebSocket.py") >= 0 && s.indexOf("grep") == -1)
				found = 1;
		}

		// document.getElementById('SWVersion').innerHTML = s[0];
		document.getElementById('SWVersion').innerHTML = 'hello';
	}
}

// Ajax function that can be called multiple times, simultaneously
function ajaxSysCmd(id, cmd) {
	var arrAjaxSysCmdHandlers = [];
	if (arrAjaxSysCmdHandlers[id] === undefined) {
		if (window.XMLHttpRequest) {
			// code for IE7+, Firefox, Chrome, Opera, Safari
			arrAjaxSysCmdHandlers[id] = new XMLHttpRequest();
		} else {
			// code for IE6, IE5
			arrAjaxSysCmdHandlers[id] = new ActiveXObject("Microsoft.XMLHTTP");
		}
	}

	arrAjaxSysCmdHandlers[id].onreadystatechange = function() {
		if (arrAjaxSysCmdHandlers[id].readyState == 4
				&& arrAjaxSysCmdHandlers[id].status == 200) {
			var ValuesAjax = arrAjaxSysCmdHandlers[id].responseText;
			printlnMessage('messages', ValuesAjax);
			ValuesJSON = JSON.parse(ValuesAjax);
			// printlnMessage('messages', "id= " + id + " output= " +
			// ValuesJSON.output);

			if (id == 'swVersion') {
				// printlnMessage('messages', 'processing swVersion');
				var res = ValuesJSON.output[0].split(" ");
				var date = res[0].replace('(', '');
				document.getElementById('swVersion').innerHTML = 'SW Version '
						+ date + ' ' + res[1];

			}
		}
	};
	var requeststring;
	myParams = {
		fs : 'SystemCommand',
		cmd : cmd
	};
	requeststring = "deviceWebSocket.php?json=" + JSON.stringify(myParams);
	arrAjaxSysCmdHandlers[id].open("GET", requeststring, true);
	arrAjaxSysCmdHandlers[id].send();
}

function ajax_commandSequence(params) {
	// printlnMessage('messages', "ajax_commandSequence called");
	try {
		// Opera 8.0+, Firefox, Safari
		ajaxcommandSequenceRequest = new XMLHttpRequest();
	} catch (e) {
		// Internet Explorer Browsers
		try {
			ajaxcommandSequenceRequest = new ActiveXObject("Msxml2.XMLHTTP");
		} catch (e) {
			try {
				ajaxcommandSequenceRequest = new ActiveXObject(
						"Microsoft.XMLHTTP");
			} catch (e) {
				// Something went wrong
				alert("Your browser broke!");
				return false;
			}
		}
	}

	showCommands = getCookie('showCommands');
	if (showCommands == 1)
		printlnMessage('messages', params.commands);
	ajaxcommandSequenceRequest.onreadystatechange = ajaxCalled_commandSequence;

	myParams = {
		fs : 'sendCommands',
		simulation : params.simulation,
		commands : params.commands,
		param : params.param
	};
	var requeststring;
	requeststring = "deviceWebSocket.php?json=" + JSON.stringify(myParams);
	// printlnMessage('messages',requeststring);
	ajaxcommandSequenceRequest.open("GET", requeststring, true);
	ajaxcommandSequenceRequest.send(null);
}

// Create a function that will receive data sent from the server
function ajaxCalled_commandSequence() {
	if (ajaxcommandSequenceRequest.readyState == 4) {
		// printlnMessage('messages',"ajaxCalled_commandSequence called");
		// printlnMessage('messages', ajaxcommandSequenceRequest.responseText);
	}
}

function ajax_lsttyS0() {
	try {
		// Opera 8.0+, Firefox, Safaristyle="white-space: nowrap"
		ajaxlsttyS0Request = new XMLHttpRequest();
	} catch (e) {
		// Internet Explorer Browsers
		try {
			ajaxlsttyS0Request = new ActiveXObject("Msxml2.XMLHTTP");
		} catch (e) {
			try {
				ajaxlsttyS0Request = new ActiveXObject("Microsoft.XMLHTTP");
			} catch (e) {
				// Something went wrong
				alert("Your browser broke!");
				return false;
			}
		}
	}

	ajaxlsttyS0Request.onreadystatechange = ajaxCalled_lsttyS0;
	myParams = {
		fs : 'SystemCommand',
		cmd : 'ls -la /dev/ttyS0'
	};
	var requeststring;
	requeststring = "deviceWebSocket.php?json=" + JSON.stringify(myParams);
	ajaxlsttyS0Request.open("GET", encodeURI(requeststring), true);
	ajaxlsttyS0Request.send(null);
}

function ajaxCalled_lsttyS0() {
	if (ajaxlsttyS0Request.readyState == 4) {
		// printlnMessage('messages', 'ajaxCalled_setSPMessage called');
		ValuesJSON = JSON.parse(ajaxlsttyS0Request.responseText);
		document.getElementById('SPMessage').innerHTML = ValuesJSON.output;
	}
}

function ajax_lsttyACM0() {
	try {
		// Opera 8.0+, Firefox, Safari
		ajaxlsttyACM0Request = new XMLHttpRequest();
	} catch (e) {
		// Internet Explorer Browsers
		try {
			ajaxlsttyACM0Request = new ActiveXObject("Msxml2.XMLHTTP");
		} catch (e) {
			try {
				ajaxlsttyACM0Request = new ActiveXObject("Microsoft.XMLHTTP");
			} catch (e) {
				// Something went wrong
				alert("Your browser broke!");
				return false;
			}
		}
	}

	ajaxlsttyACM0Request.onreadystatechange = ajaxCalled_lsttyACM0;
	myParams = {
		fs : 'SystemCommand',
		cmd : 'ls -la /dev/ttyACM0'
	};
	var requeststring;
	requeststring = "deviceWebSocket.php?json=" + JSON.stringify(myParams);
	ajaxlsttyACM0Request.open("GET", encodeURI(requeststring), true);
	ajaxlsttyACM0Request.send(null);
}

function ajaxCalled_lsttyACM0() {
	if (ajaxlsttyACM0Request.readyState == 4) {
		// printlnMessage('messages', 'ajaxCalled_setUSBMessage called');
		ValuesJSON = JSON.parse(ajaxlsttyACM0Request.responseText);
		document.getElementById('USBMessage').innerHTML = ValuesJSON.output;
	}
}

function ajaxWaitForReadPipe(callback) {
	// printlnMessage('messages', "wait for event");
	// Opera 8.0+, Firefox, Safari
	ajaxReadPipeRequest = new XMLHttpRequest();
	ajaxReadPipeRequest.onreadystatechange = callback;
	myParams = {
		fs : 'ReadPipe'
	};
	var requeststring;
	requeststring = "deviceWebSocket.php?json=" + JSON.stringify(myParams);
	ajaxlsttyACM0Request.open("GET", encodeURI(requeststring), true);
	ajaxReadPipeRequest.send(null);
}

// Create a function that will receive data sent from the server
function ajaxCalled_ReadPipeUpdateStatus() {
	if (ajaxReadPipeRequest.readyState == 4) {
		// printlnMessage('messages', 'ajaxCalled_ReadPipeUpdateStatus()
		// called');
		document.getElementById('divStatus').innerHTML = ajaxReadPipeRequest.responseText;
		ajaxWaitForReadPipe(ajaxCalled_ReadPipeUpdateStatus);
	}
}

function ajaxWaitForReadSocket(callback) {

	ajaxReadSocketRequest = new XMLHttpRequest();
	ajaxReadSocketRequest.onreadystatechange = callback;
	var date = new Date();
	var socketMessageDate = MySQLDate(date);
	// printlnMessage('messages', socketMessageDate);
	myParams = {
		fs : 'ReadSocket',
		socketMessageDate : socketMessageDate,
		clientStatus : clientStatus
	};
	var requeststring;
	requeststring = "deviceWebSocket.php?json=" + JSON.stringify(myParams);
	ajaxReadSocketRequest.open("GET", requeststring, true);
	ajaxReadSocketRequest.send(null);
}

// Create a function that will receive data sent from the server
function ajaxCalled_ReadSocketUpdateStatus() {
	if (ajaxReadSocketRequest.readyState == 4) {
		// printlnMessage('messages', 'ajaxCalled_ReadSocketUpdateStatus()
		// called');
		ReadSocketAjax = ajaxReadSocketRequest.responseText;
		// printlnMessage('messages', ReadSocketAjax);

		ReadSocketJSON = JSON.parse(ReadSocketAjax);

		if (ReadSocketJSON.success == 'Unable to open') {
			// printlnMessage('messages', 'script not running');
			if (document.getElementById('divStatus').innerHTML == 'connecting ..')
				document.getElementById('divStatus').innerHTML = 'not connected';
			else
				document.getElementById('divStatus').innerHTML = 'connecting ..';
			setTimeout(ajaxWaitForReadSocket, 2000,
					ajaxCalled_ReadSocketUpdateStatus);
		} else {
			// printlnMessage('messages', ReadSocketAjax);

			if (ReadSocketJSON.status == 'measure') {
				// printlnMessage('messages', 'data received');
				// printlnMessage('messages', ReadSocketAjax);
				clientStatus = 'client waits for data';

				Line = ReadSocketJSON.Line;
				// printlnMessage('messages', Line);
				$("#liveData").append(Line + '<br>');
				if (document.getElementById('autoscroll').checked) {
					scrollToBottom();
				}
			}
			if (ReadSocketJSON.status == 'complete') {
				clientStatus = 'client message';
			}

			document.getElementById('divStatus').innerHTML = ReadSocketJSON.status;

			ajaxWaitForReadSocket(ajaxCalled_ReadSocketUpdateStatus);
		}
	}
}
