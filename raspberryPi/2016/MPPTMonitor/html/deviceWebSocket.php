<?php
error_reporting(E_ALL);
//ini_set('display_errors', '1');


include("classDefs.php");
date_default_timezone_set('Europe/London');


global $functionString;
global $decoded;
global $debug;

$errorMessage='';
$functionstring='';



if ($_SERVER['REQUEST_METHOD']=='GET') {
	//print ("GET method");
	$json=$_GET['json'];
} else {
	//print ("POST method");
	$json=$_POST['json'];
}

$decoded = json_decode($json);
$functionString=$decoded->fs;
if(isset($decoded->plateDate))
{
	$debug=$decoded->debug;
}else
{
	$debug=0;
}


if ($debug)
	print ("deviceWebSocket.php called");


if(strcmp($functionString,'sendCommands')==0)
{
	//print ("sendCommands called\n");
	$json=$_GET['json'];
	print $json;
	sendtoPipe($json);
}

if(strcmp($functionString,'ReadPipe')==0)
{
	readPipe();
}


if(strcmp($functionString,'ReadSocket')==0)
{
	readSocket();
}

if($functionString=='lsttyS0'){
	//print ("lsttyS0 found\n");
	lsttyS0();
}

if($functionString=='lsttyUSB0')
	lsttyUSB0();


if(strcmp($functionString,'SystemCommand')==0)
{
	//print "calling SystemCommand()\n";
	SystemCommand();
}

if(strcmp($functionString,'wlan0IP')==0)
{
	wlan0IP();
}

if(strcmp($functionString,'networkIP')==0)
{
	networkIP();
}

if(strcmp($functionString,'printCookies')==0)
{
	printCookies();
}

if(strcmp($functionString,'SendJSONtoPython')==0)
{
	print "PHP: Send JSON called\n";
	$arr = array('a' => 1, 'b' => 2, 'c' => 3, 'd' => 4, 'e' => 5);
	$JSONarr=json_encode($arr);
	echo json_encode($arr);

	sendtoPipe($JSONarr);
}


function sendtoPipe($String)
{
	//print ("sending string to pipe".$cString."\n");
	$pipe = fopen('/dev/shm/deviceWebSocketPipe','r+');
	fwrite($pipe,$String);
	fclose($pipe);
}


function readPipe()
{
	//print ("read pipe\n");
	sleep(1); //. make it look like we did work.

	$pipe="/dev/shm/deviceWebSocketPipePytoJS";
	if(!file_exists($pipe)) {
		echo "I am not blocked!";
	}
	else {
		//block and read from the pipe
		$f = fopen($pipe,"r");
		echo fread($f,10);
	}
}


function readSocket()
{
	$myarray['message']='';
	$socketMessageDate=$decoded->socketMessageDate;
	$clientStatus=$decoded->clientStatus;

	//print 'readSocket() called';
	//ini_set("default_socket_timeout", 6); // set default socket connect timeout

	$fp = fsockopen("localhost", 12344, $errno, $errstr, 6);
	if (!$fp) {
		$myarray['success']='Unable to open';
		//echo "Unable to open";
	} else {
		$myarray['success']='port opened';
		fwrite($fp, $clientStatus.' '.$socketMessageDate);
		#stream_set_timeout($fp, 0);
		$res = fread($fp, 20000);
		$decodedIn = json_decode($res);

		$info = stream_get_meta_data($fp);
		fclose($fp);

		if ($info['timed_out']) {
			echo 'Connection timed out!';
		} else {
			//$myarray['response']=$res;
			$myarray['status']=$decodedIn->status;
			$myarray['counter']=$decodedIn->counter;
			$myarray['Line']=$decodedIn->Line;

		}

	}

	$encoded= json_encode($myarray);
	echo $encoded;

}



function eth0IP()
{
	//echo "Internet IP of Ethernet interface of this computer:";
	$eth0IP = system('ip addr list eth0 |grep "inet " |cut -d\' \' -f6|cut -d/ -f1');
	echo $eth0IP;
	//$pieces = explode(".", $eth0IP);
}

function wlan0IP()
{
	//echo "Internet IP of Ethernet interface of this computer:";
	$wlan0IP = system('ip addr list wlan1 |grep "inet " |cut -d\' \' -f6|cut -d/ -f1');
	echo $wlan0IP;
}

function networkIP()
{
	$eth0IP = exec('ip addr list eth0 |grep "inet " |cut -d\' \' -f6|cut -d/ -f1');
	$eth1IP = exec('ip addr list eth1 |grep "inet " |cut -d\' \' -f6|cut -d/ -f1');
	$eth2IP = exec('ip addr list eth2 |grep "inet " |cut -d\' \' -f6|cut -d/ -f1');
	$eth3IP = exec('ip addr list eth3 |grep "inet " |cut -d\' \' -f6|cut -d/ -f1');
	$wlan0IP = exec('ip addr list wlan0 |grep "inet " |cut -d\' \' -f6|cut -d/ -f1');
	$wlan1IP = exec('ip addr list wlan1 |grep "inet " |cut -d\' \' -f6|cut -d/ -f1');
	$wlan2IP = exec('ip addr list wlan2 |grep "inet " |cut -d\' \' -f6|cut -d/ -f1');
	$wlan3IP = exec('ip addr list wlan3 |grep "inet " |cut -d\' \' -f6|cut -d/ -f1');


	$myarray=array();

	$myarray['eth0IP']=$eth0IP;
	$myarray['eth1IP']=$eth1IP;
	$myarray['eth2IP']=$eth2IP;
	$myarray['eth3IP']=$eth3IP;
	$myarray['wlan0IP']=$wlan0IP;
	$myarray['wlan1IP']=$wlan1IP;
	$myarray['wlan2IP']=$wlan2IP;
	$myarray['wlan3IP']=$wlan3IP;

	// create response object
	$encoded= json_encode($myarray);
	echo $encoded;
}


function SystemCommand()
{
	$json=$_GET['json'];
	//echo "PHP get json:\n".$json."\n";
	$decoded = json_decode($_GET['json']);

	$output = array();
	$cmd=$decoded->cmd;
	//echo $cmd."\n";
	exec($cmd,$output);

	//var_dump($output);
	//echo $output;
	$myarray=array();
	$linearray=array();

	foreach($output as $mystring)
	{
		//echo $mystring."\n";
		$linearray[]=$mystring;
		//$linearray[]='hi';
	}

	$myarray['output']=$linearray;

	// create response object
	$encoded= json_encode($myarray);
	//$encoded= json_encode($linearray);
	echo $encoded;


	//$encoded= json_encode($output);
	//echo $encoded;
}


function printCookies()
{
	echo 'printCookies() called';
	print_r($_COOKIE);
}

function reportErrorData($con)
{

	$errorMessage=mysql_error();
	//echo "<br>";
}





?>
