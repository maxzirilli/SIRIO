<?php 
      include_once 'SIRIOCfg.php';
      include_once 'SIRIODef.php';
      include_once PATH_LIBRERIE . 'ZAdvQuery.php';


      header("Content-Type: application/json;charset=ISO-8859-15");
      header("Access-Control-Allow-Origin: *");
      header("Access-Control-Allow-Methods:POST,GET");  


      class TExtraAdoption extends TAdvQuery
      {
            protected function FExtraScriptServerSide($PDODBase,&$JSONAnswer)
            {
                  $JSONAnswer->ListaAdozioniInScadenza = array();                  
                  $Parametri   = JSON_decode($_POST['SIRIOParams']);

                  $SQLBody = "SELECT titoli.CODICE_ISBN AS CODICE_TITOLO,".
                                    "titoli.TITOLO AS NOME_TITOLO,".
                                    "titoli.CHIAVE AS CHIAVE_TITOLO,".
                                    "istituti.CHIAVE AS CHIAVE_ISTITUTO,".
                                    "istituti.NOME AS NOME_ISTITUTO,".
                                    "utenti.USERNAME AS NOME_PROMOTORE". 
                       " FROM titoli,adozioni_titolo,istituti LEFT OUTER JOIN utenti ON (utenti.CHIAVE = istituti.PROMOTORE),classi" .
                      " WHERE titoli.CODICE_ISBN IN ('". str_replace(",","','",$Parametri->ListaCodici) . "')" .
                        " AND adozioni_titolo.TITOLO = titoli.CHIAVE".
                        " AND classi.CHIAVE = adozioni_titolo.CLASSE".
                        " AND istituti.CHIAVE = classi.ISTITUTO".
                      " GROUP BY istituti.CHIAVE ".
                      " ORDER BY titoli.TITOLO,utenti.USERNAME,istituti.NOME";                                            
                   
                   if($Query = $PDODBase->query($SQLBody))
                   {
                      $ChiaveTitolo = -1;
                      
                      while($Row = $Query->fetch(PDO::FETCH_ASSOC))
                      {
                         if($Row ['CHIAVE_TITOLO'] != $ChiaveTitolo)
                         {
                          $Titolo       = new stdClass();
                          $Titolo->Chiave = $Row ['CHIAVE_TITOLO']; 
                          $Titolo->Codice = $Row ['CODICE_TITOLO']; 
                          $Titolo->Titolo = $Row ['NOME_TITOLO'];
                          $Titolo->ListaIstituti = array();
                          array_push($JSONAnswer->ListaAdozioniInScadenza,$Titolo);
                         }
                         $ChiaveTitolo = $Row ['CHIAVE_TITOLO'];

                         $DettaglioIstituto = new stdClass();
                         $DettaglioIstituto->ChiaveIstituto = $Row ['CHIAVE_ISTITUTO'];
                         $DettaglioIstituto->Istituto       = $Row ['NOME_ISTITUTO'];
                         if(!is_null($Row['NOME_PROMOTORE'])) 
                           $DettaglioIstituto->Promotore    = $Row ['NOME_PROMOTORE'];
                         else $DettaglioIstituto->Promotore = '-';
                         array_push($JSONAnswer->ListaAdozioniInScadenza[count($JSONAnswer->ListaAdozioniInScadenza) - 1]->ListaIstituti,$DettaglioIstituto);
                      }
                      $Query = null;
                    }        
           }     
      }

      $SIRIOConnection = new TExtraAdoption();
      $SIRIOConnection->ServerSideScript();
?>