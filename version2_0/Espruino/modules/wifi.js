var wifi = {
  "connect": function (a,b,c) {
  var d="";c=c||function(){};void 0!==b.password&&(d=b.password);u(k.CLIENT,function(b){if(b)return c(b);f.cmd("AT+CWJAP="+JSON.stringify(a)+","+JSON.stringify(d)+
"\r\n",2E4,function m(a){if(0<=["WIFI DISCONNECT","WIFI CONNECTED","WIFI GOT IP","+CWJAP:1"].indexOf(a))return m;"OK"!=a?setTimeout(c,0,"WiFi connect failed: "+(a?a:"Timeout")):setTimeout(c,0,null)})})
},
  "disconnect": function (a) {C(k.CLIENT,a)},
  "startAP": function (a,b,c) {
  c=c||function(){};b=b||{};if(!b.password||8>b.password.length)throw Error("Password must be at least 8 characters");var d=b.password?"3":"0";if(b.authMode&&(d={open:0,wpa:2,wpa2:3,wpa_wpa2:4}[b.authMode],void 0===d))throw Error("Unknown authMode "+
b.authMode);void 0===b.channel&&(b.channel=5);u(k.AP,function(e){if(e)return c(e);f.cmd("AT+CWSAP="+JSON.stringify(a)+","+JSON.stringify(b.password)+","+b.channel+","+d+"\r\n",5E3,function(a){"OK"!=a?c("CWSAP failed: "+(a?a:"Timeout")):(n|=k.AP,c(null))})})
},
  "stopAP": function (a) {n&=~k.AP;C(k.AP,a)},
  "scan": function (a) {
  var b=[];u(k.CLIENT,function(c){if(c)return a(c);f.cmdReg("AT+CWLAP\r\n",5E3,"+CWLAP:",function(a){a=a.slice(8,-1).split(",");b.push({ssid:JSON.parse(a[1]),authMode:H[a[0]],
rssi:parseInt(a[2]),mac:JSON.parse(a[3]),channel:JSON.parse(a[4])})},function(d){a(null,b)})})
},
  "getIP": function (a) {var b={};f.cmd("AT+CIFSR\r\n",1E3,function h(d){if(void 0===d)a("Timeout");else{if("+CIFSR:STAIP"==d.substr(0,12))b.ip=d.slice(14,-1);else if("+CIFSR:STAMAC"==d.substr(0,13))b.mac=d.slice(15,-1);else if("OK"==d){a(null,b);return}return h}})},
  "setIP": function (a,b) {
  if("object"==typeof a&&a.ip){var c=[JSON.stringify(a.ip)];a.gw&&(c.push(JSON.stringify(a.gw)),c.push(JSON.stringify(a.netmask||
"255.255.255.0")));c="AT+CIPSTA_CUR="+c.join(",")+"\r\n";var d=3E3}else c="AT+CWDHCP_CUR=1,1\r\n",d=2E4;f.cmd(c,d,function(a){if("OK"==a)b(null);else return b("setIP failed: "+(a?a:"Timeout"))})
},
  "getAPIP": function (a) {
  var b={};f.cmd("AT+CIPAP_CUR?\r\n",1E3,function h(d){if(void 0===d)a("Timeout");else if("OK"==d)f.cmd("AT+CIPAPMAC_CUR?\r\n",1E3,function m(d){if(void 0===d)a("Timeout");else if("OK"==d)a(null,b);else return"+CIPAPMAC_CUR"==d.substr(0,14)&&(b.mac=JSON.parse(d.substr(10))),m});
else return"+CIPAP_CUR"==d.substr(0,10)&&(d=d.split(":"),"gateway"==d[1]&&"gw"==d[1],b[d[1]]=JSON.parse(d[2])),h})
},
  "setAPIP": function (a,b) {var c=[JSON.stringify(a.ip)];a.gw&&(c.push(JSON.stringify(a.gw)),c.push(JSON.stringify(a.netmask||"255.255.255.0")));f.cmd("AT+CIPAP_CUR="+c.join(",")+"\r\n",3E3,function(a){if("OK"==a)b(null);else return b("setAPIP failed: "+(a?a:"Timeout"))})},
  "setHostname": function (a,b) {
  u(k.CLIENT,function(c){if(c)return b(c);f.cmd("AT+CWHOSTNAME="+JSON.stringify(a)+
"\r\n",500,function(a){b("OK"==a?null:a)})})
},
  "ping": function (a,b) {var c;f.cmd('AT+PING="'+a+'"\r\n',1E3,function l(a){if(a&&"+"==a[0])return c=a.substr(1),l;"OK"==a?b(c):b()})},
  "turbo": function (a,b) {var c=a?!0===a?921600:a:115200;f.cmd("AT+UART_CUR="+c+",8,1,0,2\r\n",500,function(a){"OK"!=a?b&&b("Baud rate switch to "+c+" failed: "+(a?a:"Timeout")):(t.setup(c,{rx:A3,tx:A2,cts:x}),b&&b(null))})},
  "debug": function () {return {wifiMode:p,connected:n,socks:e,sockData:g}},
  "at": {
    "debug": function (a) {m=!1!==a;return{line:b,lineCallback:g,handlers:e,lineHandlers:h,waiting:k,dataCount:d}},
    "cmd": function (a,b,c) {
  if(g)m&&console.log("Queued "+JSON.stringify(a)),k.push([a,b,c]);else if(m&&console.log("["+JSON.stringify(a)),n.write(a),b){var d=setTimeout(function(){g=void 0;c&&c();void 0===g&&0<k.length&&f.cmd.apply(f,k.shift())},
b),e=function(a){g=void 0;var b;c&&(b=c(a))?(g=e,c=b):clearTimeout(d);void 0===g&&0<k.length&&f.cmd.apply(f,k.shift())};g=e}
},
    "write": function (a) {n.write(a)},
    "cmdReg": function (a,b,c,d,e) {f.registerLine(c,d);f.cmd(a,b,function(a){f.unregisterLine(c);e(a)})},
    "registerLine": function (a,b) {if(h[a])throw Error(a+" already registered");h[a]=b},
    "unregisterLine": function (a) {delete h[a]},
    "register": function (a,b) {if(e[a])throw Error(a+" already registered");e[a]=b},
    "unregister": function (a) {delete e[a]},
    "isBusy": function () {
  return void 0!==
g
},
    "getData": function (a,b) {if(d)throw Error("Already grabbing data");d=a;l=b}
   }
 };



