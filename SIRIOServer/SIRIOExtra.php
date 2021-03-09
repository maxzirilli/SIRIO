<?php 
      include_once 'SIRIOCfg.php';
      include_once 'SIRIODef.php';
      include_once PATH_LIBRERIE . 'ZAdvQuery.php';
      
      header("Content-Type: application/json;charset=ISO-8859-15");
      header("Access-Control-Allow-Origin: *");
      header("Access-Control-Allow-Methods:POST,GET");  

      class TExtraScript extends TAdvQuery
      {
            protected function FExtraScriptServerSide($PDODBase,&$JSONAnswer)
            {
                  $JSONAnswer->ListaSpedizioni = array();                  
                  $Parametri = JSON_decode($_POST['SIRIOParams']);
                  $SQLBody = "SELECT *,".
                                     "(SELECT docenti.RAGIONE_SOCIALE ".
                                        "FROM docenti ".
                                       "WHERE docenti.CHIAVE = spedizioni.DOCENTE) AS NOME_DOCENTE,".
                                     "(SELECT COUNT(*) ".
                                        "FROM dettaglio_spedizioni ".
                                       "WHERE dettaglio_spedizioni.SPEDIZIONE = spedizioni.CHIAVE AND dettaglio_spedizioni.STATO = 'S') AS NR_DA_SPEDIRE,".
                                     "(SELECT COUNT(*)". 
                                        "FROM dettaglio_spedizioni ". 
                                       "WHERE dettaglio_spedizioni.SPEDIZIONE = spedizioni.CHIAVE AND dettaglio_spedizioni.STATO = 'C') AS NR_CONSEGNATE,".
                                     "(SELECT COUNT(*)". 
                                        "FROM dettaglio_spedizioni ". 
                                       "WHERE dettaglio_spedizioni.SPEDIZIONE = spedizioni.CHIAVE AND dettaglio_spedizioni.STATO = 'P') AS NR_PRENOTATE ". 
                                "FROM spedizioni ". 
                               "WHERE DATA >= '".$Parametri->Dal."' AND DATA <='".$Parametri->Al."' ".($Parametri->Admin == 'T' ? " " : (" AND PROMOTORE=" .$_SESSION[SESSION_USERKEY])). " ORDER BY DATA DESC";

                  if ($Query = $PDODBase->query($SQLBody))
                  {
                    while($Row = $Query->fetch(PDO::FETCH_ASSOC))
                    {
                        $Spedizione = new stdClass();
                        $Spedizione->Chiave = $Row ['CHIAVE'];   
                        $Spedizione->Data = $Row ['DATA']; 
                        $Spedizione->Presso = $Row ['PRESSO'];     
                        $Spedizione->Docente = $Row ['DOCENTE'];     
                        $Spedizione->DocenteNome = $Row ['NOME_DOCENTE'];         
                        $Spedizione->Provincia = $Row ['PROVINCIA'];     
                        $Spedizione->NrConsegnate = $Row ['NR_CONSEGNATE'];     
                        $Spedizione->NrDaSpedire = $Row ['NR_DA_SPEDIRE'];     
                        $Spedizione->NrPrenotate = $Row ['NR_PRENOTATE'];     
                        $Spedizione->Promotore = $Row ['PROMOTORE'];
                        $Spedizione->Istituto = $Row ['ISTITUTO'];        
                        $Spedizione->DettagliTitoli = array();
                        $Spedizione->Spedibile = false;

                        if(is_null($Row['PRESSO']))
                           $Spedizione->Presso = 'N.D.';
                        if(is_null($Row['DOCENTE']))
                           $Spedizione->Docente = -1;
                        if(is_null($Row['NOME_DOCENTE']))
                           $Spedizione->DocenteNome = ' ';
                        if(is_null($Row['ISTITUTO'])) 
                           $Spedizione->Istituto = -1;

                        $SQLBodyDettaglio = '';
                        $SQLBodyDettaglio = "SELECT *,".
                                                      "(SELECT TITOLO FROM titoli WHERE CHIAVE = dettaglio_spedizioni.TITOLO) AS NOME_TITOLO,".
                                                      "(SELECT CODICE_ISBN FROM titoli WHERE CHIAVE = dettaglio_spedizioni.TITOLO) AS CODICE_TITOLO,".
                                                      "CALCOLA_DISPONIBILITA(dettaglio_spedizioni.TITOLO) AS SPEDIBILE ". 
                                                "FROM dettaglio_spedizioni ". 
                                                "WHERE SPEDIZIONE=".$Spedizione->Chiave;
                        
                        if ($QueryDettaglio = $PDODBase->query($SQLBodyDettaglio))
                        {
                              while($RowDettaglio = $QueryDettaglio->fetch(PDO::FETCH_ASSOC))
                              {                                 
                                    if($RowDettaglio['SPEDIBILE'] == 1)
                                       $Spedizione->Spedibile = true;
                                    
                                    $DettaglioSpedizione = new stdClass();
                                    $DettaglioSpedizione->Chiave = $RowDettaglio['CHIAVE']; 
                                    $DettaglioSpedizione->Titolo = $RowDettaglio['TITOLO'];
                                    $DettaglioSpedizione->NomeTitolo = $RowDettaglio['NOME_TITOLO']; 
                                    $DettaglioSpedizione->CodiceTitolo = $RowDettaglio['CODICE_TITOLO'];
                                    $DettaglioSpedizione->StatoTitolo = '';
                                    
                                    switch($RowDettaglio['STATO'])
                                    {
                                          case 'P' : $DettaglioSpedizione->StatoTitolo = 'PRENOTATO';
                                                      break;
                                          case 'S' : $DettaglioSpedizione->StatoTitolo = 'DA SPEDIRE';
                                                      break;
                                          case 'C' : $DettaglioSpedizione->StatoTitolo = 'CONSEGNATO';
                                                      break;
                                          default  : $DettaglioSpedizione->StatoTitolo = 'N.D';                                                                                          
                                    }
      
                                    if(is_null($RowDettaglio['NOME_TITOLO']))
                                       $DettaglioSpedizione->NomeTitolo = 'N.D';
                                    if(is_null($RowDettaglio['CODICE_TITOLO']))
                                       $DettaglioSpedizione->CodiceTitolo = 'N.D';
                                    
                                    
                                    array_push($Spedizione->DettagliTitoli,$DettaglioSpedizione);         
                              } 
                        }
                        array_push($JSONAnswer->ListaSpedizioni,$Spedizione);   
                    }
                  }
           }     
      }

      $SIRIOConnection = new TExtraScript();
      $SIRIOConnection->ServerSideScript();
?>