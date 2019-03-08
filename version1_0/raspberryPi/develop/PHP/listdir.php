<?php

error_reporting(E_ALL);




//$path    = 'writeFiles';
$path    = '.';
//$files = array_diff(scandir($path), array('.', '..'));
$files = scandir($path);

var_dump($files);
echo $files;


?>
