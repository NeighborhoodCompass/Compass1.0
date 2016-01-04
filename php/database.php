<?php

/**
 * Connect to the mysql database.
 */
$conn = mysql_connect("localhost", "your_username", "your_password") or die(mysql_error());
mysql_select_db('your_database', $conn) or die(mysql_error());

?>
