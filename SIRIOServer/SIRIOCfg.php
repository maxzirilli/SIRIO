<?php
    // Configurazione coordinate server SQL
    define('MYSQLSERVER','localhost');
    define('MYSQLDBASE','sirio');
    define('MYSQLACCOUNT', 'root');
    define('MYSQLPASSWORD', '');
    
    // Impostazioni mail
    define('SMTP_HOST','pro.eu.turbo-smtp.com');
    define('SMTP_PORT',587);
    define('SMTP_SECURE',false);
    define('SMTP_AUTH',true);
    define('SMTP_USER','info@pagina43.it');
    define('SMTP_PASSWORD','7nvLBk46a');
    define('SMTP_FROM_MAIL','noreply@pagina43.it');
    define('SMTP_FROM_NAME','Pagina43');

    // Path librerie
    define('PATH_LIBRERIE',"d:\\GoogleDrive\\Lavoro\\Librerie\\PHP\\");
    define('SLASH',"\\");

    error_reporting(E_ALL);
    ini_set("display_errors", 0);
    ini_set("log_errors", 1);
    ini_set("error_log", "LogSIRIO.txt");

?>