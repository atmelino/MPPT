<?php

error_reporting(E_ALL);

//$json=$_GET['json'];
//$decoded = json_decode($_GET['json']);
$PWM='123';


//$path    = 'writeFiles';
$file = 'writeFiles/PWM.txt';

//file_put_contents($file, $PWM);


$fp = fopen($file, 'w');
fwrite($fp, 'Cats chase mice');
fclose($fp);



?>
