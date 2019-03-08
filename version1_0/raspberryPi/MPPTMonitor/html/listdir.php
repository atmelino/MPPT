<?php

error_reporting(E_ALL);

//$json=$_GET['json'];
//$decoded = json_decode($_GET['json']);

$myarray['message']='';
$filesarray=array();

$path    = '../writeFiles';
//$path    = '.';
$files = array_diff(scandir($path), array('.', '..','readme'));
//$files = scandir($path);

foreach($files as $mystring)
{
	//$myarray['message'].=$mystring;
	$filesarray[]=$mystring;
}
$myarray['files']=$filesarray;

$myarray['message'].="done";

#echo 'end PHP program';

$encoded= json_encode($myarray);
echo $encoded;


?>
