<?php 
      include_once 'SIRIOCfg.php';
      include_once 'SIRIODef.php';
      include_once PATH_LIBRERIE . 'ZAdvQuery.php';
      
      header("Content-Type: application/json;charset=ISO-8859-15");
      header("Access-Control-Allow-Origin: *");
      header("Access-Control-Allow-Methods:POST,GET");  

      class TExtraScript extends TAdvQuery
      {
            private $FTitoli = [];
            private function FGetQuantitaTitoloDaSpedire($Titolo)
            {
              for ($i = 0; $i < count($this->FTitoli); $i++)
              {
                if ($this->FTitoli[$i]->Titolo == $Titolo)
                  return $this->FTitoli[$i]->Quantita;                
              }
              return 0;
            }

            private function FGetListaTitoli($PDODBase)
            {
              $SQLBody = "SELECT TITOLO, SUM(QUANTITA) AS QUANTITA
                            FROM dettaglio_spedizioni 
                           WHERE dettaglio_spedizioni.STATO = 'S'
                          GROUP BY TITOLO";
              if ($Query = $PDODBase->query($SQLBody))
              {
                while($Row = $Query->fetch(PDO::FETCH_ASSOC))
                {
                  $ObjQuery = new stdClass();
                  $ObjQuery->Titolo = $Row['TITOLO'];                  
                  $ObjQuery->Quantita = $Row['QUANTITA'];
                  array_push($this->FTitoli, $ObjQuery);
                }
              }
            }

            protected function FExtraScriptServerSide($PDODBase,&$JSONAnswer)
            {  
                  $this->FGetListaTitoli($PDODBase);
                  $JSONAnswer->ListaSpedizioni = array();                  
                  $Parametri = JSON_decode($_POST['SIRIOParams']);
                  $SQLBody = "SELECT spedizioni.*,
                                     dettaglio_spedizioni.CHIAVE AS CHIAVE_DETTAGLIO,
                                     dettaglio_spedizioni.TITOLO,
                                     dettaglio_spedizioni.QUANTITA,
                                     dettaglio_spedizioni.STATO,
                                     dettaglio_spedizioni.DATA_ULTIMA_MODIFICA,
                                     docenti.RAGIONE_SOCIALE AS NOME_DOCENTE,
                                     titoli.TITOLO AS NOME_TITOLO,
                                     titoli.CODICE_ISBN AS CODICE_TITOLO,
                                     titoli.QUANTITA_MGZN AS QUANTITA_MAGAZZINO
                                     " .
                                "FROM spedizioni
                                      JOIN dettaglio_spedizioni ON (spedizioni.CHIAVE = dettaglio_spedizioni.SPEDIZIONE) 
                                      LEFT OUTER JOIN docenti ON (docenti.CHIAVE = spedizioni.DOCENTE)
                                      LEFT OUTER JOIN titoli ON (dettaglio_spedizioni.TITOLO = titoli.CHIAVE)" .
                               " WHERE spedizioni.DATA >= '".$Parametri->Dal."' AND spedizioni.DATA <='".$Parametri->Al."' ".($Parametri->Admin == 'T' ? " " : (" AND spedizioni.PROMOTORE=" .$_SESSION[SESSION_USERKEY])). " ORDER BY spedizioni.CHIAVE, spedizioni.DATA DESC";

                  $LastChiaveSpedizione = -1; 
                  if ($Query = $PDODBase->query($SQLBody))
                  {
                    while($Row = $Query->fetch(PDO::FETCH_ASSOC))
                    {
                      if ($LastChiaveSpedizione != $Row ['CHIAVE'])
                      {
                        $LastChiaveSpedizione = $Row ['CHIAVE'];
                        $Spedizione = new stdClass();
                        array_push($JSONAnswer->ListaSpedizioni,$Spedizione);
                        $Spedizione->Chiave = $LastChiaveSpedizione;   
                        $Spedizione->Data = $Row ['DATA']; 
                        $Spedizione->Presso = $Row ['PRESSO'];     
                        $Spedizione->Docente = $Row ['DOCENTE'];     
                        $Spedizione->DocenteNome = $Row ['NOME_DOCENTE'];         
                        $Spedizione->Provincia = $Row ['PROVINCIA'];
                        $Spedizione->NrConsegnate = 0;
                        $Spedizione->NrDaSpedire = 0;
                        $Spedizione->NrPrenotate = 0;  
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
                      }

                      if ($this->FGetQuantitaTitoloDaSpedire($Row['TITOLO']) < $Row['QUANTITA_MAGAZZINO'])
                        $Spedizione->Spedibile = true;      
                      $DettaglioSpedizione = new stdClass();
                      $DettaglioSpedizione->Chiave = $Row['CHIAVE_DETTAGLIO']; 
                      $DettaglioSpedizione->Titolo = $Row['TITOLO'];
                      $DettaglioSpedizione->NomeTitolo = $Row['NOME_TITOLO']; 
                      $DettaglioSpedizione->CodiceTitolo = $Row['CODICE_TITOLO'];
                      $DettaglioSpedizione->StatoTitolo = '';

                      $DettaglioSpedizione->Data = $Row['DATA_ULTIMA_MODIFICA']; 
                      
                      switch($Row['STATO'])
                      {
                        case 'P'  : $DettaglioSpedizione->StatoTitolo = 'PRENOTATO';
                                    $Spedizione->NrPrenotate++;
                                    break;
                        case 'S'  : $DettaglioSpedizione->StatoTitolo = 'DA SPEDIRE';
                                    $Spedizione->NrDaSpedire++;
                                    break;
                        case 'C'  : $DettaglioSpedizione->StatoTitolo = 'CONSEGNATO';
                                    $Spedizione->NrConsegnate++;
                                    break;
                        default   : $DettaglioSpedizione->StatoTitolo = 'N.D';                                                                                          
                      }

                      if(is_null($Row['NOME_TITOLO']))
                          $DettaglioSpedizione->NomeTitolo = 'N.D';
                      if(is_null($Row['CODICE_TITOLO']))
                          $DettaglioSpedizione->CodiceTitolo = 'N.D';
                                    
                                    
                      array_push($Spedizione->DettagliTitoli,$DettaglioSpedizione);                        
                    }
                  }
           }     
      }

      $SIRIOConnection = new TExtraScript();
      $SIRIOConnection->ServerSideScript();
?>