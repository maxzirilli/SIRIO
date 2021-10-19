<?php 
      require_once "mailer/PHPMailerAutoload.php";

      /*require_once 'mailer/src/Exception.php';
      require_once 'mailer/src/PHPMailer.php';
      require_once 'mailer/src/SMTP.php';*/

      include_once 'SIRIOCfg.php';
      include_once 'SIRIODef.php';
      include_once PATH_LIBRERIE . 'ZAdvQuery.php';
      
      header("Content-Type: application/json;charset=ISO-8859-15");
      header("Access-Control-Allow-Origin: *");
      header("Access-Control-Allow-Methods:POST"); 

      $SIRIOConnection = new TAdvQuery();
      $SIRIOConnection->SendMail();
?>