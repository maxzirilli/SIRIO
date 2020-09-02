<?php 
      include_once 'SIRIOCfg.php';
      include_once 'SIRIODef.php';
      include_once PATH_LIBRERIE . 'ZAdvQuery.php';
      
      header("Content-Type: application/json;charset=ISO-8859-15");
      header("Access-Control-Allow-Origin: *");
      header("Access-Control-Allow-Methods:GET,POST");  

      $SIRIOConnection = new TAdvQuery();
      switch($_SERVER['REQUEST_METHOD'])
      {
         case 'POST'   : $SIRIOConnection->EditSQL();
                         break;
         case 'GET'    : $SIRIOConnection->Select();
                         break;
         default       : break;
      }
      

?>
