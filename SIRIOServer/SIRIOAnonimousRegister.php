<?php 
      include_once 'ZAdvQuery.php';


      header("Content-Type: application/json;charset=ISO-8859-15");
      header("Access-Control-Allow-Origin: *");
      header("Access-Control-Allow-Methods:POST,GET");  
 
// Versione 1.0  06 Aprile 2021
//               - Prima versione

      class TAdvQueryAnonRegister extends TAdvQuery
      {
           protected function FDoRegister($PDODBase,&$JSONAnswer)
           {
             
               // TODO: Qui sviluppi il metodo
               //mi basta il throw se c'è errore utente esistente
           }     
      }

      $SIRIOConnection = new TAdvQueryAnonRegister();
      $SIRIOConnection->Register();
?>