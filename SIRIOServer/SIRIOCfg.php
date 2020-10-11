<?php
    // Configurazione coordinate server SQL
    define('MYSQLSERVER','localhost');
    define('MYSQLDBASE','sirio');
    define('MYSQLACCOUNT', 'root');
    define('MYSQLPASSWORD', '');
    
    // Impostazioni mail
    define('SMTP_HOST','tls://smtp.gmail.com');
    define('SMTP_PORT',587);
    define('SMTP_SECURE','tls');
    define('SMTP_AUTH',true);
    define('SMTP_USER','massimiliano.zirilli@gmail.com');
    define('SMTP_PASSWORD','ShakaVsPhoenix75');
    define('SMTP_FROM_MAIL','noreply@genovadanza.com');
    define('SMTP_FROM_NAME','ZMSoftware');

    // Path librerie
    define('PATH_LIBRERIE',"d:\\GoogleDrive\\Lavoro\\Librerie\\PHP\\");
    define('SLASH',"\\");

    error_reporting(E_ALL);
    ini_set("display_errors", 0);
    ini_set("log_errors", 1);
    ini_set("error_log", "LogSIRIO.txt");

?>