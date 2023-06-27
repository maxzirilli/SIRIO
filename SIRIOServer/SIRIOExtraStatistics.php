<?php 
      include_once 'SIRIOCfg.php';
      include_once 'SIRIODef.php';
      include_once 'SIRIOGlobale.php';
      include_once PATH_LIBRERIE . 'ZAdvQuery.php';
      
      header("Content-Type: application/json;charset=ISO-8859-15");
      header("Access-Control-Allow-Origin: *");
      header("Access-Control-Allow-Methods:POST,GET");  

      const STATISTICA_PRIMA_ATTUALE      = -1;
      const STATISTICA_PRIMA_DATATA       = 1;
      const STATISTICA_SECONDA_DATATA     = 2;

      const FILTRO_ISTITUTI_QUALSIASI     = -1;
      const FILTRO_ISTITUTI_SS2           = -2;

      const FILTRO_GR_EDITORI_QUALSIASI   = -1;
      const FILTRO_GR_EDITORI_GESTITI     = -2;
      const FILTRO_GR_EDITORI_NON_GESTITI = -3;
      const FILTRO_GR_EDITORI_RIVALI      = -4;

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
                             istituti.CODICE AS CODICE_ISTITUTO,
                             istituti.NOME AS NOME_ISTITUTO,    
                             statistiche.TITOLO AS CHIAVE_TITOLO,
                             titoli.TITOLO  AS NOME_TITOLO,
                             titoli.EDITORE AS EDITORE_TITOLO,
                             titoli.CODICE_ISBN AS CODICE_TITOLO,
                             titoli.PREZZO AS PREZZO_TITOLO,
                             case_editrici.CHIAVE AS CHIAVE_EDITORE_TITOLO,
                             statistiche.NR_CLASSI
                        FROM statistiche
                             JOIN titoli ON (statistiche.TITOLO = titoli.CHIAVE)
                             LEFT OUTER JOIN case_editrici ON (case_editrici.DESCRIZIONE = titoli.EDITORE)
                             JOIN istituti ON (statistiche.ISTITUTO = istituti.CHIAVE),
                             tipologie_gruppi_istituti
                             JOIN istituti_gruppi ON (tipologie_gruppi_istituti.GRUPPO_IST = istituti_gruppi.CHIAVE)
                       WHERE istituti.TIPOLOGIA = tipologie_gruppi_istituti.TIPOLOGIA"  . $Where .
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
              $RigaTmp->CodiceIstituto      = $Elemento ['CODICE_ISTITUTO']; 
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
               $RigaTmp->C_IST   = $Elemento->CodiceIstituto;
               $RigaTmp->N_IST   = $Elemento->NomeIstituto;
               $RigaTmp->CLS_A   = 0;
               $RigaTmp->CLS_B   = 0;
               return $RigaTmp;
            }

            private function GetWhereConditions($Parametri,$ParametriPrimaStatistica,$LsChiaviIstitutiCorrispondenti)
            {
               $CondizioniWhere = array();
               $AStringa        = "";     
               $Condizione      = new stdClass();

               if($Parametri->FiltroPromotore != -1)
               {
                 $Condizione = "istituti.PROMOTORE =".$Parametri->FiltroPromotore;
                 array_push($CondizioniWhere,$Condizione);
               } 

               if($Parametri->FiltroIstitutiEntrambi)
               {
                  if(count($LsChiaviIstitutiCorrispondenti) > 0)
                     $StringaIstituti = implode(",", $LsChiaviIstitutiCorrispondenti);
                  else $StringaIstituti = '-1';
                 
                  if($ParametriPrimaStatistica == STATISTICA_PRIMA_ATTUALE)
                     $Condizione = "istituti.CHIAVE IN (". $StringaIstituti . ") ";
                  else $Condizione = "statistiche.ISTITUTO IN (". $StringaIstituti . ") ";
                  array_push($CondizioniWhere,$Condizione);
               }


               if($Parametri->FiltroGruppoIst != FILTRO_ISTITUTI_QUALSIASI)
               {
                  if($Parametri->FiltroGruppoIst == FILTRO_ISTITUTI_SS2)
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
                 if($ParametriPrimaStatistica == STATISTICA_PRIMA_ATTUALE)
                    $Condizione = "adozioni_titolo.TITOLO =".$Parametri->FiltroTitolo;   
                 else $Condizione = "statistiche.TITOLO =".$Parametri->FiltroTitolo;
                 array_push($CondizioniWhere,$Condizione);
               }

               if($Parametri->FiltroIstituto != -1)
               {
                 if($ParametriPrimaStatistica == STATISTICA_PRIMA_ATTUALE)
                    $Condizione = "istituti.CHIAVE =".$Parametri->FiltroIstituto;
                 else $Condizione = "statistiche.ISTITUTO =".$Parametri->FiltroIstituto;
                 array_push($CondizioniWhere,$Condizione);
               }

               if($Parametri->FiltroMateria != -1)
               {
                 $Condizione = "titoli.MATERIA =".$Parametri->FiltroMateria;
                 array_push($CondizioniWhere,$Condizione);
               }

               if($Parametri->FiltroCasaEditrice != -1)
               {
                 $Condizione = "case_editrici.CHIAVE =".$Parametri->FiltroCasaEditrice;
                 array_push($CondizioniWhere,$Condizione);
               }


               switch($Parametri->FiltroGruppoEd)
               {
                 case FILTRO_GR_EDITORI_QUALSIASI   : break;
                 case FILTRO_GR_EDITORI_GESTITI     : array_push($CondizioniWhere,"istituti.PROVINCIA IN  (SELECT province_x_gruppi_editoriali.PROVINCIA
                                                                                                             FROM gruppi_x_case_ed
                                                                                                                  JOIN case_editrici_amiche ON (case_editrici_amiche.CHIAVE = gruppi_x_case_ed.CASA_ED)
                                                                                                                  JOIN gruppi_case_ed ON (gruppi_case_ed.CHIAVE = gruppi_x_case_ed.GRUPPO)
                                                                                                                  JOIN province_x_gruppi_editoriali ON (province_x_gruppi_editoriali.GRUPPO = gruppi_x_case_ed.GRUPPO)
                                                                                                            WHERE gruppi_case_ed.RIVALE = 'F' AND
                                                                                                                  titoli.EDITORE = case_editrici_amiche.DESCRIZIONE
                                                                                                           GROUP BY PROVINCIA)");
                           break;
                 //condizione da recuperare nel caso non vada bene quella che ho messo (case_editrici.DESCRIZIONE IS NULL OR (case_editrici.CHIAVE IN (SELECT CHIAVE FROM case_editrici_nemiche)))
                 case FILTRO_GR_EDITORI_NON_GESTITI : array_push($CondizioniWhere,"(case_editrici.DESCRIZIONE IS NULL OR
                                                                                    istituti.PROVINCIA IN  (SELECT province_x_gruppi_editoriali.PROVINCIA
                                                                                                              FROM gruppi_x_case_ed
                                                                                                                  JOIN case_editrici_nemiche ON (case_editrici_nemiche.CHIAVE = gruppi_x_case_ed.CASA_ED)
                                                                                                                  JOIN gruppi_case_ed ON (gruppi_case_ed.CHIAVE = gruppi_x_case_ed.GRUPPO)
                                                                                                                  JOIN province_x_gruppi_editoriali ON (province_x_gruppi_editoriali.GRUPPO = gruppi_x_case_ed.GRUPPO)
                                                                                                              WHERE gruppi_case_ed.RIVALE = 'T' AND
                                                                                                                    titoli.EDITORE = case_editrici_nemiche.DESCRIZIONE
                                                                                                              GROUP BY PROVINCIA))");
                                                      break;
                 case FILTRO_GR_EDITORI_RIVALI      : array_push($CondizioniWhere,"istituti.PROVINCIA IN  (SELECT province_x_gruppi_editoriali.PROVINCIA
                                                                                                            FROM gruppi_x_case_ed
                                                                                                                JOIN case_editrici_nemiche ON (case_editrici_nemiche.CHIAVE = gruppi_x_case_ed.CASA_ED)
                                                                                                                JOIN gruppi_case_ed ON (gruppi_case_ed.CHIAVE = gruppi_x_case_ed.GRUPPO)
                                                                                                                JOIN province_x_gruppi_editoriali ON (province_x_gruppi_editoriali.GRUPPO = gruppi_x_case_ed.GRUPPO)
                                                                                                            WHERE gruppi_case_ed.RIVALE = 'T' AND
                                                                                                                  titoli.EDITORE = case_editrici_nemiche.DESCRIZIONE
                                                                                                            GROUP BY PROVINCIA)");
                                                       break;
                 default                            : if(!($Parametri->FiltroGruppoRivaleSelected))
                                                            array_push($CondizioniWhere,"titoli.EDITORE IN (SELECT DESCRIZIONE
                                                                                                              FROM case_editrici_amiche
                                                                                                                  JOIN gruppi_x_case_ed ON (case_editrici_amiche.CHIAVE = gruppi_x_case_ed.CASA_ED)
                                                                                                            WHERE gruppi_x_case_ed.GRUPPO = " . $Parametri->FiltroGruppoEd . ")");
                                                      else array_push($CondizioniWhere,"titoli.EDITORE IN (SELECT DESCRIZIONE
                                                                                                              FROM case_editrici_nemiche
                                                                                                                  JOIN gruppi_x_case_ed ON (case_editrici_nemiche.CHIAVE = gruppi_x_case_ed.CASA_ED)
                                                                                                            WHERE gruppi_x_case_ed.GRUPPO = " . $Parametri->FiltroGruppoEd . ")");                           
                                                      array_push($CondizioniWhere,"istituti.PROVINCIA IN (SELECT PROVINCIA FROM province_x_gruppi_editoriali WHERE GRUPPO = " . $Parametri->FiltroGruppoEd . ")");
                                                      error_log($Parametri->FiltroGruppoEd);
                                                      break;
               } 

               if($Parametri->FiltroVolUniciPrimi == "T")
               {
                 $Condizione = "(titoli.VOLUME = 0 OR titoli.VOLUME = 1)";
                 array_push($CondizioniWhere,$Condizione);
               }

               if($ParametriPrimaStatistica == STATISTICA_PRIMA_DATATA)
               {
                  $Condizione = "statistiche.DATA ='".$Parametri->PrimaStatistica."'";
                  array_push($CondizioniWhere,$Condizione);
               }
               if($ParametriPrimaStatistica == STATISTICA_SECONDA_DATATA)
               {
                  if($Parametri->SecondaStatistica != -1)
                  {
                    $Condizione = "statistiche.DATA ='".$Parametri->SecondaStatistica."'";
                    array_push($CondizioniWhere,$Condizione);
                  }
               }

               for($i = 0;$i < Count($CondizioniWhere);$i++)
               {
                  $AStringa .= " AND " . $CondizioniWhere[$i] . " ";
               }
               return $AStringa;
            }

            protected function FExtraScriptServerSide($PDODBase,&$JSONAnswer)
            {
               $Parametri                      = JSON_decode($_POST['SIRIOParams']);
               $PrimaStatistica                = array();
               $SecondaStatistica              = array();
               $JSONAnswer->StatisticaFinale   = array();
               $LsChiaviIstitutiCorrispondenti = array();


               if($Parametri->FiltroIstitutiEntrambi)
               {
                  //La query non va bene perché non si tiene conto della data
                  $SQLBody = "SELECT statistiche.ISTITUTO AS CHIAVE_ISTITUTO
                                FROM statistiche
                               WHERE statistiche.ISTITUTO IN (SELECT istituti_x_titoli.ISTITUTO 
                                                                FROM istituti_x_titoli)
                               GROUP BY ISTITUTO";

                  if($Query = $PDODBase->query($SQLBody))
                  {
                    while($Row = $Query->fetch(PDO::FETCH_ASSOC))
                          array_push($LsChiaviIstitutiCorrispondenti,$Row['CHIAVE_ISTITUTO']);  
                  }
               }

               //PRIMA STATISTICA
               if($Parametri->PrimaStatistica == STATISTICA_PRIMA_ATTUALE)
               {
                  $StringaWhere = $this->GetWhereConditions($Parametri,STATISTICA_PRIMA_ATTUALE,$LsChiaviIstitutiCorrispondenti);
                  $SQLBody      = Global_GetSqlAdozioniAttuali($StringaWhere);
               }
               else 
               {
                  $StringaWhere = $this->GetWhereConditions($Parametri,STATISTICA_PRIMA_DATATA,$LsChiaviIstitutiCorrispondenti);
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
               $StringaWhere = $this->GetWhereConditions($Parametri,STATISTICA_SECONDA_DATATA,$LsChiaviIstitutiCorrispondenti);
               $SQLBody      = $this->GetSQLFromStatistic($StringaWhere);
               if($Query = $PDODBase->query($SQLBody))
               {
                   while($Row = $Query->fetch(PDO::FETCH_ASSOC))
                   {
                     $RigaTmp = $this->CreateTmpRow($Row);
                     array_push($SecondaStatistica,$RigaTmp);
                   }
               }

               //STATISTICA FINALE
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
                  $Riga         = $this->CreateFinalRow($SecondaStatistica[$IndexSecondo]);
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