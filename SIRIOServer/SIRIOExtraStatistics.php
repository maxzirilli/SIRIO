<?php 
      include_once 'SIRIOCfg.php';
      include_once 'SIRIODef.php';
      include_once 'SIRIOGlobale.php';
      include_once PATH_LIBRERIE . 'ZAdvQuery.php';
      
      header("Content-Type: application/json;charset=ISO-8859-15");
      header("Access-Control-Allow-Origin: *");
      header("Access-Control-Allow-Methods:POST,GET");  

      class TExtraStatistic extends TAdvQuery
      {
            private function ABeforeB($A,$B)
            {
              if($A->ChiaveIstituto < $B->ChiaveIstituto)
                 return true;
              else
              {
                if($A->ChiaveIstituto > $B->ChiaveIstituto)
                   return false;
                else 
                {
                  if($A->ChiaveTitolo < $B->ChiaveTitolo)
                     return true;
                  else return false;
                }
              }
            }

            private function GetSQLFromStatistic($Where)
            {
              return("SELECT istituti.CHIAVE AS CHIAVE_ISTITUTO,
                             istituti.NOME AS NOME_ISTITUTO,    
                             statistiche.TITOLO AS CHIAVE_TITOLO,
                             titoli.TITOLO  AS NOME_TITOLO,
                             titoli.EDITORE AS EDITORE_TITOLO,
                             titoli.CODICE_ISBN AS CODICE_TITOLO,
                             titoli.PREZZO AS PREZZO_TITOLO,
                             case_editrici.CHIAVE AS CHIAVE_EDITORE_TITOLO,
                             case_editrici.GRUPPO AS GRUPPO,
                             statistiche.NR_CLASSI
                        FROM statistiche,titoli LEFT OUTER JOIN case_editrici ON (case_editrici.DESCRIZIONE = titoli.EDITORE),
                             istituti,tipologie_gruppi_istituti,istituti_gruppi
                       WHERE statistiche.TITOLO = titoli.CHIAVE
                         AND statistiche.ISTITUTO = istituti.CHIAVE
                         AND tipologie_gruppi_istituti.GRUPPO_IST = istituti_gruppi.CHIAVE
                         AND istituti.TIPOLOGIA = tipologie_gruppi_istituti.TIPOLOGIA" 
                     .$Where.
                     " ORDER BY CHIAVE_ISTITUTO,CHIAVE_TITOLO");
                     
            }

            private function CreateTmpRow($Elemento)
            {
              $RigaTmp                      = new stdClass();
              $RigaTmp->ChiaveTitolo        = $Elemento ['CHIAVE_TITOLO'];
              $RigaTmp->CodiceTitolo        = $Elemento ['CODICE_TITOLO'];
              $RigaTmp->EditoreTitolo       = $Elemento ['EDITORE_TITOLO']; 
              $RigaTmp->NomeTitolo          = $Elemento ['NOME_TITOLO'];
              $RigaTmp->PrezzoTitolo        = $Elemento ['PREZZO_TITOLO'];
              $RigaTmp->ChiaveEditoreTitolo = $Elemento ['CHIAVE_EDITORE_TITOLO'];
              $RigaTmp->ChiaveIstituto      = $Elemento ['CHIAVE_ISTITUTO']; 
              $RigaTmp->NomeIstituto        = $Elemento ['NOME_ISTITUTO']; 
              $RigaTmp->NumeroClassi        = $Elemento ['NR_CLASSI']; 
              return $RigaTmp;
            }

            private function CreateFinalRow($Elemento)
            {
               $RigaTmp          = new stdClass();
               $RigaTmp->K_TIT   = $Elemento->ChiaveTitolo;
               $RigaTmp->C_TIT   = $Elemento->CodiceTitolo;
               $RigaTmp->E_TIT   = $Elemento->EditoreTitolo; 
               $RigaTmp->N_TIT   = $Elemento->NomeTitolo;
               $RigaTmp->P_TIT   = $Elemento->PrezzoTitolo;
               $RigaTmp->K_E_TIT = $Elemento->ChiaveEditoreTitolo;
               $RigaTmp->K_IST   = $Elemento->ChiaveIstituto; 
               $RigaTmp->N_IST   = $Elemento->NomeIstituto;
               $RigaTmp->CLS_A   = 0;
               $RigaTmp->CLS_B   = 0;
               return $RigaTmp;
            }

            private function GetStatisticsWhere($ListaParametri,$PrimaOSeconda)
            {
               $CondizioniWhere = array();
               $AStringa        = "";
               
               $Condizione = new stdClass();
               if($ListaParametri->FiltroPromotore != -1)
               {
                 $Condizione = "istituti.PROMOTORE =".$ListaParametri->FiltroPromotore;
                 array_push($CondizioniWhere,$Condizione);
               } 
               if($ListaParametri->FiltroGruppoIst != -1)
               {
                  if($ListaParametri->FiltroGruppoIst == -2)
                     $Condizione = "istituti_gruppi.LICEO = 1";
                  else $Condizione = "tipologie_gruppi_istituti.GRUPPO_IST =" .$ListaParametri->FiltroGruppoIst;                    
                  array_push($CondizioniWhere,$Condizione);
               } 
               if($ListaParametri->FiltroProvincia != -1)
               {
                 $Condizione = "istituti.PROVINCIA =".$ListaParametri->FiltroProvincia;
                 array_push($CondizioniWhere,$Condizione);
               } 
               if($ListaParametri->FiltroTitolo != -1)
               {
                 $Condizione = "statistiche.TITOLO =".$ListaParametri->FiltroTitolo;
                 array_push($CondizioniWhere,$Condizione);
               }
               if($ListaParametri->FiltroIstituto != -1)
               {
                 $Condizione = "statistiche.ISTITUTO =".$ListaParametri->FiltroIstituto;
                 array_push($CondizioniWhere,$Condizione);
               }
               if($ListaParametri->FiltroMateria != -1)
               {
                 $Condizione = "titoli.MATERIA =".$ListaParametri->FiltroMateria;
                 array_push($CondizioniWhere,$Condizione);
               }
               if($ListaParametri->FiltroGruppoEd != -1)
               {
                  if($ListaParametri->FiltroGruppoEd == -2)
                     $Condizione = "case_editrici.DESCRIZIONE IS NOT NULL";
                  else if($ListaParametri->FiltroGruppoEd == -3)
                          $Condizione = "case_editrici.DESCRIZIONE IS NULL";
                  else $Condizione = "titoli.EDITORE = case_editrici.DESCRIZIONE AND case_editrici.GRUPPO =".$ListaParametri->FiltroGruppoEd;
                  array_push($CondizioniWhere,$Condizione);
               }
               if($ListaParametri->FiltroVolUniciPrimi == "T")
               {
                 $Condizione = "(titoli.VOLUME = 0 OR titoli.VOLUME = 1)";
                 array_push($CondizioniWhere,$Condizione);
               }
               if($PrimaOSeconda == 1)
               {
                  if($ListaParametri->PrimaStatistica != -1)
                  {
                    $Condizione = "statistiche.DATA ='".$ListaParametri->PrimaStatistica."'";
                    array_push($CondizioniWhere,$Condizione);
                  }
               }
               else
               {
                  if($ListaParametri->SecondaStatistica != -1)
                  {
                    $Condizione = "statistiche.DATA ='".$ListaParametri->SecondaStatistica."'";
                    array_push($CondizioniWhere,$Condizione);
                  }
               }

               for($i = 0;$i < Count($CondizioniWhere);$i++)
                    $AStringa .= " AND ".$CondizioniWhere[$i];
               return $AStringa;
            }

            protected function FExtraScriptServerSide($PDODBase,&$JSONAnswer)
            {
               $Parametri                    = JSON_decode($_POST['SIRIOParams']);
               $PrimaStatistica              = array();
               $SecondaStatistica            = array();
               $JSONAnswer->StatisticaFinale = array();

               //PRIMA STATISTICA                 
               if($Parametri->PrimaStatistica == -1)
               {
                  $CondizioniWhere = array();
                  $StringaWhere    = "";

                  $Condizione = new stdClass();
                  if($Parametri->FiltroPromotore != -1)
                  {
                    $Condizione = "istituti.PROMOTORE =".$Parametri->FiltroPromotore;
                    array_push($CondizioniWhere,$Condizione);
                  } 
                  if($Parametri->FiltroGruppoIst != -1)
                  {
                    if($Parametri->FiltroGruppoIst == -2)
                       $Condizione = "istituti_gruppi.LICEO = 1";
                    else $Condizione = "tipologie_gruppi_istituti.GRUPPO_IST =" .$Parametri->FiltroGruppoIst;                    
                    array_push($CondizioniWhere,$Condizione);
                  }  
                  if($Parametri->FiltroProvincia != -1)
                  {
                    $Condizione = "istituti.PROVINCIA =".$Parametri->FiltroProvincia;
                    array_push($CondizioniWhere,$Condizione);
                  } 
                  if($Parametri->FiltroTitolo != -1)
                  {
                    $Condizione = "adozioni_titolo.TITOLO =".$Parametri->FiltroTitolo;
                    array_push($CondizioniWhere,$Condizione);
                  }
                  if($Parametri->FiltroIstituto != -1)
                  {
                    $Condizione = "istituti.CHIAVE =".$Parametri->FiltroIstituto;
                    array_push($CondizioniWhere,$Condizione);
                  }
                  if($Parametri->FiltroMateria != -1)
                  {
                    $Condizione = "titoli.MATERIA =".$Parametri->FiltroMateria;
                    array_push($CondizioniWhere,$Condizione);
                  }
                  if($Parametri->FiltroGruppoEd != -1)
                  {
                     if($Parametri->FiltroGruppoEd != -1)
                     {
                       if($Parametri->FiltroGruppoEd == -2)
                          $Condizione = "case_editrici.DESCRIZIONE IS NOT NULL ";
                       else if($Parametri->FiltroGruppoEd == -3)
                               $Condizione = "case_editrici.DESCRIZIONE IS NULL ";
                       else $Condizione = "titoli.EDITORE = case_editrici.DESCRIZIONE AND case_editrici.GRUPPO =".$Parametri->FiltroGruppoEd;
                       array_push($CondizioniWhere,$Condizione);
                     }
                  }
                  if($Parametri->FiltroVolUniciPrimi == "T")
                  {
                    $Condizione = "( titoli.VOLUME = 0 OR titoli.VOLUME = 1 )";
                    array_push($CondizioniWhere,$Condizione);
                  }
                  
                  for($i = 0;$i < Count($CondizioniWhere);$i++)
                      $StringaWhere .=  " AND " . $CondizioniWhere[$i];

                  $SQLBody = Global_GetSqlAdozioniAttuali($StringaWhere);
               }
               else 
               {
                  $StringaWhere = $this->GetStatisticsWhere($Parametri,1);
                  $SQLBody      = $this->GetSQLFromStatistic($StringaWhere);
               }

               if($Query = $PDODBase->query($SQLBody))
               {
                   while($Row = $Query->fetch(PDO::FETCH_ASSOC))
                   {
                     $RigaTmp = $this->CreateTmpRow($Row);
                     array_push($PrimaStatistica,$RigaTmp);
                   }
               }  
  
               //SECONDA STATISTICA 
               $StringaWhere = "";
               $StringaWhere = $this->GetStatisticsWhere($Parametri,2);
               $SQLBody      = "";
               $SQLBody      = $this->GetSQLFromStatistic($StringaWhere);

               if($Query = $PDODBase->query($SQLBody))
               {
                   while($Row = $Query->fetch(PDO::FETCH_ASSOC))
                   {
                     $RigaTmp = $this->CreateTmpRow($Row);
                     array_push($SecondaStatistica,$RigaTmp);
                   }
               }

               $IndexPrimo   = 0;
               $IndexSecondo = 0;

               while($IndexPrimo < count($PrimaStatistica) && $IndexSecondo < count($SecondaStatistica))
               {
                 $Riga = null;
                 if(($PrimaStatistica[$IndexPrimo]->ChiaveTitolo == $SecondaStatistica[$IndexSecondo]->ChiaveTitolo) && 
                    ($PrimaStatistica[$IndexPrimo]->ChiaveIstituto == $SecondaStatistica[$IndexSecondo]->ChiaveIstituto))
                 {
                    $Riga = $this->CreateFinalRow($PrimaStatistica[$IndexPrimo]);
                    $Riga->CLS_A  = $PrimaStatistica[$IndexPrimo]->NumeroClassi;
                    $Riga->CLS_B  = $SecondaStatistica[$IndexSecondo]->NumeroClassi; 
                    $IndexPrimo++;
                    $IndexSecondo++;
                 }
                 else
                 {
                    if($this->ABeforeB($PrimaStatistica[$IndexPrimo],$SecondaStatistica[$IndexSecondo]))
                    {
                       $Riga = $this->CreateFinalRow($PrimaStatistica[$IndexPrimo]);
                       $Riga->CLS_A  = $PrimaStatistica[$IndexPrimo]->NumeroClassi;
                       $Riga->CLS_B  = 0;
                       $IndexPrimo++;
                    }
                    else
                    {
                       $Riga = $this->CreateFinalRow($SecondaStatistica[$IndexSecondo]);
                       $Riga->CLS_A  = 0;
                       $Riga->CLS_B  = $SecondaStatistica[$IndexSecondo]->NumeroClassi;  
                       $IndexSecondo++;
                    }
                 }
                 array_push($JSONAnswer->StatisticaFinale,$Riga);
               }

               while($IndexPrimo < count($PrimaStatistica))
               {
                  $Riga         = $this->CreateFinalRow($PrimaStatistica[$IndexPrimo]);
                  $Riga->CLS_A  = $PrimaStatistica[$IndexPrimo]->NumeroClassi;
                  $Riga->CLS_B  = 0;
                  array_push($JSONAnswer->StatisticaFinale,$Riga);
                  $IndexPrimo++;
               }

               while($IndexSecondo < count($SecondaStatistica))
               {
                  $Riga         = $this->CreateFinalRow($SecondaStatistica[$IndexPrimo]);
                  $Riga->CLS_A  = 0;
                  $Riga->CLS_B  = $SecondaStatistica[$IndexSecondo]->NumeroClassi; 
                  array_push($JSONAnswer->StatisticaFinale,$Riga); 
                  $IndexSecondo++;
               }
               
               if($Parametri->FiltroNuoveAdozioni == "T")
               {
                 for($i = 0;$i < Count($JSONAnswer->StatisticaFinale);$i++)
                 {
                   if($JSONAnswer->StatisticaFinale[$i]->CLS_B > 0)
                   {
                      array_splice($JSONAnswer->StatisticaFinale,$i,1);
                      $i--;
                   }
                 }
               }
            }     
      }

      $SIRIOConnection = new TExtraStatistic();
      $SIRIOConnection->ServerSideScript();
?>