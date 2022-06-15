<?php
    // Configurazione coordinate server SQL
    define('MYSQLSERVER','localhost');
    define('MYSQLDBASE','sirio');
    define('MYSQLACCOUNT', 'root');
    define('MYSQLPASSWORD', '');
    
    // Impostazioni mail
    define('SMTP_HOST','smtps.aruba.it');
    define('SMTP_PORT',465);
    define('SMTP_SECURE','ssl');
    define('SMTP_AUTH',true);
    define('SMTP_USER', "info@zmsoftware.cloud");
    define('SMTP_PASSWORD', "andromeda75");
    define('SMTP_FROM_MAIL','noreply@zmsoftware.cloud');
    define('SMTP_FROM_NAME','ZmSoftware');
    
    // Path librerie
    define('PATH_LIBRERIE',"d:\\GoogleDrive\\Lavoro\\Librerie\\PHP\\");
    define('SLASH',"\\");

    error_reporting(E_ALL);
    ini_set("display_errors", 0);
    ini_set("log_errors", 1);
    ini_set("error_log", "LogSIRIO.txt");
?>