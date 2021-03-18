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
                  $ListaCodici = explode(",", $Parametri->ListaCodici);

                  for ($i = 0; $i < count($ListaCodici); $i++)
                  {
                        $SQLBody = "SELECT titoli.CODICE_ISBN AS CODICE_TITOLO,".
                                          "titoli.TITOLO AS NOME_TITOLO,".
                                          "titoli.CHIAVE AS CHIAVE_TITOLO,".
                                          "istituti.CHIAVE AS CHIAVE_ISTITUTO,".
                                          "istituti.NOME AS NOME_ISTITUTO,".
                                          "utenti.USERNAME AS NOME_PROMOTORE,".
                                    " FROM titoli,adozioni,istituti,utenti ".
                                    "WHERE titoli.CODICE = ".$ListaCodici[$i].
                                    "  AND utenti.CHIAVE IN (SELECT PROMOTORE FROM istituti WHERE CHIAVE IN (SELECT ISTITUTO FROM classi WHERE CHIAVE IN (SELECT CLASSE FROM adozioni_titolo WHERE TITOLO IN (SELECT CHIAVE FROM titoli WHERE CODICE_ISBN=".$ListaCodici[$i].")))) ".
                                    "  AND istituti.CHIAVE IN (SELECT ISTITUTO FROM classi WHERE CHIAVE IN (SELECT CLASSE FROM adozioni_titolo WHERE TITOLO IN (SELECT CHIAVE FROM titoli WHERE CODICE_ISBN=".$ListaCodici[$i].")))".
                                 " ORDER BY titoli.TITOLO,istituti.NOME";
                        
                        
                        if($Query = $PDODBase->query($SQLBody))
                        {
                           $ChiaveIstituto = -1;
                           while($Row = $Query->fetch(PDO::FETCH_ASSOC))
                           {
                              $Titolo = new stdClass();
                              $Titolo->Chiave = $Row ['CHIAVE_TITOLO']; 
                              $Titolo->Codice = $Row ['CODICE_TITOLO']; 
                              $Titolo->Titolo = $Row ['NOME_TITOLO'];
                              $Titolo->ListaIstituti = array();

                              if(!is_null($Row['CHIAVE_ISTITUTO'])) 
                              {
                                 $DettaglioIstituto = new stdClass();
                                 $DettaglioIstituto->ChiaveIstituto = $Row ['CHIAVE_ISTITUTO'];
                                 $DettaglioIstituto->Istituto       = $Row ['NOME_ISTITUTO'];
                                 if(!is_null($Row['NOME_PROMOTORE'])) 
                                   $DettaglioIstituto->Promotore    = $Row ['NOME_PROMOTORE'];
                                 else $DettaglioIstituto->Promotore = '-';

                                 if($ChiaveIstituto != $Row ['CHIAVE_ISTITUTO'])
                                    array_push($Titolo->ListaIstituti,$DettaglioIstituto); 
                              
                                 $ChiaveIstituto = $Row ['CHIAVE_ISTITUTO'];
                              }
                              else $ChiaveIstituto = -1;   
                           }
                           $Query = null;
                        }
                        array_push($JSONAnswer->ListaAdozioniInScadenza,$Titolo)        
                  }
           }     
      }

      $SIRIOConnection = new TExtraAdoption();
      $SIRIOConnection->ServerSideScript();
?>