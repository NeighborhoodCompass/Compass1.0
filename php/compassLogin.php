<?php
$login = $_REQUEST['login'];
$password = $_REQUEST['password'];

if($login == 'staff'&&$password == 'compass'){
$allow = ("true");
echo json_encode($allow);
}
else{
$allow = ("false");
echo json_encode($allow);  
}
?>