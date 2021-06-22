<?php 
      include_once 'SIRIOCfg.php';
      include_once 'SIRIODef.php';
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

            private function GetSQLFromView($Where)
            {
              return("SELECT istituti.CHIAVE AS CHIAVE_ISTITUTO,
                             istituti.NOME AS NOME_ISTITUTO,
                             istituti.CODICE AS CODICE_ISTITUTO,
                             adozioni_titolo.TITOLO AS CHIAVE_TITOLO,
                             titoli.TITOLO  AS NOME_TITOLO,
                             titoli.CODICE_ISBN AS CODICE_TITOLO,
                             titoli.PREZZO AS PREZZO_TITOLO,
                             COUNT(CLASSE) AS NR_CLASSI
                        FROM adozioni_titolo,titoli,istituti,classi "
                     .$Where.
                  " GROUP BY CHIAVE_ISTITUTO,CHIAVE_TITOLO
                    ORDER BY CHIAVE_ISTITUTO,CHIAVE_TITOLO");
            }

            private function GetSQLFromStatistic($Where)
            {
              return("SELECT istituti.CHIAVE AS CHIAVE_ISTITUTO,
                             istituti.NOME AS NOME_ISTITUTO,
                             istituti.CODICE AS CODICE_ISTITUTO,
                             statistiche.TITOLO AS CHIAVE_TITOLO,
                             titoli.TITOLO  AS NOME_TITOLO,
                             titoli.CODICE_ISBN AS CODICE_TITOLO,
                             titoli.PREZZO AS PREZZO_TITOLO,
                             statistiche.NR_CLASSI
                        FROM statistiche,titoli,istituti "
                     .$Where.
                    " ORDER BY CHIAVE_ISTITUTO,CHIAVE_TITOLO");
            }

            private function CreateTmpRow($Elemento)
            {
              $RigaTmp                 = new stdClass();
              $RigaTmp->ChiaveTitolo   = $Elemento ['CHIAVE_TITOLO'];
              $RigaTmp->CodiceTitolo   = $Elemento ['CODICE_TITOLO']; 
              $RigaTmp->NomeTitolo     = $Elemento ['NOME_TITOLO'];
              $RigaTmp->PrezzoTitolo   = $Elemento ['PREZZO_TITOLO'];
              $RigaTmp->ChiaveIstituto = $Elemento ['CHIAVE_ISTITUTO']; 
              $RigaTmp->NomeIstituto   = $Elemento ['NOME_ISTITUTO']; 
              $RigaTmp->CodiceIstituto = $Elemento ['CODICE_ISTITUTO']; 
              $RigaTmp->NumeroClassi   = $Elemento ['NR_CLASSI']; 
              return $RigaTmp;
            }

            private function CreateFinalRow($Elemento)
            {
               $RigaTmp        = new stdClass();
               $RigaTmp->K_TIT = $Elemento->ChiaveTitolo;
               $RigaTmp->C_TIT = $Elemento->CodiceTitolo; 
               $RigaTmp->N_TIT = $Elemento->NomeTitolo;
               $RigaTmp->P_TIT = $Elemento->PrezzoTitolo;
               $RigaTmp->K_IST = $Elemento->ChiaveIstituto; 
               $RigaTmp->N_IST = $Elemento->NomeIstituto;
               $RigaTmp->C_IST = $Elemento->CodiceIstituto;
               $RigaTmp->CLS_A = 0;
               $RigaTmp->CLS_B = 0;
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
                 $Condizione = "istituti.TIPOLOGIA IN (SELECT TIPOLOGIA FROM tipologie_gruppi_istituti WHERE GRUPPO_IST =".$ListaParametri->FiltroGruppoIst.")";
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
                 $Condizione = "titoli.EDITORE IN (SELECT DESCRIZIONE FROM case_editrici WHERE GRUPPO =".$ListaParametri->FiltroGruppoEd.")";
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

               $Condizione = "statistiche.TITOLO = titoli.CHIAVE";
               array_push($CondizioniWhere,$Condizione);
               $Condizione = "statistiche.ISTITUTO = istituti.CHIAVE";
               array_push($CondizioniWhere,$Condizione);

               for($i = 0;$i < Count($CondizioniWhere);$i++)
                   $AStringa = $AStringa.($i == 0 ? " WHERE " : " AND ").$CondizioniWhere[$i];
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
                    $Condizione = "istituti.TIPOLOGIA IN (SELECT TIPOLOGIA FROM tipologie_gruppi_istituti WHERE GRUPPO_IST =".$Parametri->FiltroGruppoIst.")";
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
                    $Condizione = "titoli.EDITORE IN (SELECT DESCRIZIONE FROM case_editrici WHERE GRUPPO =".$Parametri->FiltroGruppoEd.")";
                    array_push($CondizioniWhere,$Condizione);
                  }

                  $Condizione = "adozioni_titolo.titolo = titoli.CHIAVE";
                  array_push($CondizioniWhere,$Condizione);
                  $Condizione = "adozioni_titolo.CLASSE = classi.CHIAVE";
                  array_push($CondizioniWhere,$Condizione);
                  $Condizione = "classi.ISTITUTO = istituti.CHIAVE";
                  array_push($CondizioniWhere,$Condizione);
                  
                  for($i = 0;$i < Count($CondizioniWhere);$i++)
                      $StringaWhere = $StringaWhere.($i == 0 ? " WHERE " : " AND ").$CondizioniWhere[$i];

                  $SQLBody = $this->GetSQLFromView($StringaWhere);
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
                 $Riga = $this->CreateFinalRow($PrimaStatistica[$IndexPrimo]);

                 if(($PrimaStatistica[$IndexPrimo]->ChiaveTitolo == $SecondaStatistica[$IndexSecondo]->ChiaveTitolo) && 
                    ($PrimaStatistica[$IndexPrimo]->ChiaveIstituto == $SecondaStatistica[$IndexSecondo]->ChiaveIstituto))
                 {
                    $Riga->CLS_A  = $PrimaStatistica[$IndexPrimo]->NumeroClassi;
                    $Riga->CLS_B  = $SecondaStatistica[$IndexSecondo]->NumeroClassi; 
                    $IndexPrimo++;
                    $IndexSecondo++;
                 }
                 else
                 {
                    if($this->ABeforeB($PrimaStatistica[$IndexPrimo],$SecondaStatistica[$IndexSecondo]))
                    {
                       $Riga->CLS_A  = $PrimaStatistica[$IndexPrimo]->NumeroClassi;
                       $Riga->CLS_B  = 0;
                       $IndexPrimo++;
                    }
                    else
                    {
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
                  $Riga         = $this->CreateFinalRow($PrimaStatistica[$IndexPrimo]);
                  $Riga->CLS_A  = 0;
                  $Riga->CLS_B  = $SecondaStatistica[$IndexSecondo]->NumeroClassi; 
                  array_push($JSONAnswer->StatisticaFinale,$Riga); 
                  $IndexSecondo++;
               }
            }     
      }

      $SIRIOConnection = new TExtraStatistic();
      $SIRIOConnection->ServerSideScript();
?>