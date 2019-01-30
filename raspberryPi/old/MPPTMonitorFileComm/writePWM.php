<?php

error_reporting(E_ALL);

//$json=$_GET['json'];
//$decoded = json_decode($_GET['json']);
//$PWM=$decoded->PWM;


$PWM=$_GET['PWM'];

$myarray['message']='';
$myarray['message'].=$decoded;
$myarray['message'].='PWM='.$PWM;

//$path    = 'writeFiles';
$file = 'writeFiles/PWM.txt';

//file_put_contents($file, $PWM);


$fp = fopen('writeFiles/PWM.txt', 'w');
fwrite($fp, $PWM);
fclose($fp);


$myarray['message'].="done";

#echo 'end PHP program';

$encoded= json_encode($myarray);
echo $encoded;


?>
