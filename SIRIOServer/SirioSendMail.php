<?php 
      include_once 'SIRIOCfg.php';
      include_once 'SIRIODef.php';
      include_once PATH_LIBRERIE . 'ZAdvQuery.php';
      /*require_once "mailer/PHPMailerAutoload.php";

      require_once 'mailer/src/Exception.php';
      require_once 'mailer/src/PHPMailer.php';
      require_once 'mailer/src/SMTP.php';*/

      if(version_compare(PHP_VERSION,'8.0.0') == -1)
         require_once PATH_LIBRERIE . str_replace("/",SLASH,"mailer_PHP7/PHPMailerAutoload.php");
      else 
      {
        require_once PATH_LIBRERIE . str_replace("/",SLASH,'mailer_PHP8/src/PHPMailer.php');
        require_once PATH_LIBRERIE . str_replace("/",SLASH,'mailer_PHP8/src/SMTP.php');
        require_once PATH_LIBRERIE . str_replace("/",SLASH,'mailer_PHP8/src/Exception.php');
      }
      
      header("Content-Type: application/json;charset=ISO-8859-15");
      header("Access-Control-Allow-Origin: *");
      header("Access-Control-Allow-Methods:POST"); 

      $SIRIOConnection = new TAdvQuery();
      $SIRIOConnection->SendMail(false);
?>