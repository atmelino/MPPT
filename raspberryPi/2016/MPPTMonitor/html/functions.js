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
		elementId.innerHTML += '\n';
	}

}

function clearMessage(target) {
	document.getElementById(target).innerHTML = '';
}

function sortByKey(array, key) {
	return array.sort(function(a, b) {
		var x = a[key];
		var y = b[key];
		return ((x < y) ? -1 : ((x > y) ? 1 : 0));
	});
}

function MySQLDate(inDate) {
	outDate = inDate.getFullYear() + '-' + ('00' + (inDate.getMonth() + 1)).slice(-2) + '-'
			+ ('00' + inDate.getDate()).slice(-2) + ' ' + ('00' + inDate.getHours()).slice(-2) + ':'
			+ ('00' + inDate.getMinutes()).slice(-2) + ':' + ('00' + inDate.getSeconds()).slice(-2);

	return outDate;
}

function getCookie(c_name) {
	var i, x, y, ARRcookies = document.cookie.split(";");
	for (i = 0; i < ARRcookies.length; i++) {
		x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
		y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
		x = x.replace(/^\s+|\s+$/g, "");
		if (x == c_name) {
			return unescape(y);
		}
	}
}

function existCookie(c_name) {
	var myBoolean = new Boolean(false);
	var i, x, y, ARRcookies = document.cookie.split(";");
	for (i = 0; i < ARRcookies.length; i++) {
		x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
		y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
		x = x.replace(/^\s+|\s+$/g, "");
		if (x == c_name) {
			myBoolean = true;
		}
	}
	return myBoolean;
}

function setCookie(c_name, value, exdays) {
	var exdate = new Date();
	exdate.setDate(exdate.getDate() + exdays);
	var c_value = escape(value) + ((exdays == null) ? "" : "; expires=" + exdate.toUTCString());
	document.cookie = c_name + "=" + c_value;
	// printlnMessage('messages', "cookie "+c_name+" set to "+ value);
}

function liveStored() {
	ldchecked = document.getElementById('live').checked;
	printlnMessage('messages', ldchecked);

	if (ldchecked == true) {
		$("#liveData").show();
		$("#storedData").hide();
		setCookie("livedata", 1, 365);
	} else {
		$("#storedData").show();
		$("#liveData").hide();
		setCookie("livedata", 0, 365);
	}
}

function reverse(sin) {
	// printlnMessage('messages', sin);

	len = sin.length;
	temp = sin.split('')
	// printlnMessage('messages', temp[1]);

	var sout = '';

	for ( var i = 1; i <= len; i++)
		sout += temp[len - i];

	// printlnMessage('messages', sout);

	return sout;
}
