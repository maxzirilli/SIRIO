<?php 
      include_once 'SIRIOCfg.php';
      include_once 'SIRIODef.php';
      include_once 'SIRIOGlobale.php';
      include_once PATH_LIBRERIE . 'ZAdvQuery.php';
      
      header("Content-Type: application/json;charset=ISO-8859-15");
      header("Access-Control-Allow-Origin: *");
      header("Access-Control-Allow-Methods:POST,GET");  

      class TExtraGetLsTeacher extends TAdvQuery
      {
            private function CreateRowDocente($Elemento)
            {
              $DocTmp                            = new stdClass();
              $DocTmp->CHIAVE            = $Elemento ['CHIAVE'];
              $DocTmp->NASCOSTO          = $Elemento ['NASCOSTO'];
              $DocTmp->RAGIONE_SOCIALE   = $Elemento ['RAGIONE_SOCIALE'];
              $DocTmp->EMAIL             = $Elemento ['EMAIL'];
              $DocTmp->TITOLO            = $Elemento ['TITOLO'];
              $DocTmp->INDIRIZZO         = $Elemento ['INDIRIZZO']; 
              $DocTmp->COMUNE            = $Elemento ['COMUNE'];
              $DocTmp->CAP               = $Elemento ['CAP'];
              $DocTmp->PROVINCIA         = $Elemento ['PROVINCIA']; 
              $DocTmp->NOME_MATERIA1     = $Elemento ['NOME_MATERIA1'];
              $DocTmp->NOME_MATERIA2     = $Elemento ['NOME_MATERIA2'];
              $DocTmp->NOME_MATERIA3     = $Elemento ['NOME_MATERIA3'];
              $DocTmp->PROVINCIA_NOME    = $Elemento ['PROVINCIA_NOME'];
              $DocTmp->NR_SPED_TOT       = $Elemento ['NR_SPED_TOT'];
              $DocTmp->NR_SPED_LAST_ANNO = $Elemento ['NR_SPED_LAST_ANNO'];
              $DocTmp->MATERIA_1         = $Elemento ['MATERIA_1'];      
              $DocTmp->MATERIA_2         = $Elemento ['MATERIA_2'];
              $DocTmp->MATERIA_3         = $Elemento ['MATERIA_3'];
              $DocTmp->COORD_MATERIA_1   = $Elemento ['COORD_MATERIA_1'];
              $DocTmp->COORD_MATERIA_2   = $Elemento ['COORD_MATERIA_2'];
              $DocTmp->COORD_MATERIA_3   = $Elemento ['COORD_MATERIA_3'];
              return $DocTmp;
            }

            private function GetWhereConditions($Parametri)
            {
               $CondizioniWhere = array();
               $AStringa        = "";     
               $Condizione      = new stdClass();

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

               if($Parametri->FiltroCasaEditrice != -1)
               {
                 $Condizione = "case_editrici.CHIAVE =".$Parametri->FiltroCasaEditrice;
                 array_push($CondizioniWhere,$Condizione);
               }

               switch($Parametri->FiltroGruppoEd)
               {
                 case -1 : break;
                 case -2 : array_push($CondizioniWhere,"case_editrici.CHIAVE IN (SELECT CHIAVE FROM case_editrici_amiche)");
                           array_push($CondizioniWhere,"istituti.PROVINCIA IN (SELECT PROVINCIA FROM province_x_gruppi_editoriali WHERE GRUPPO = case_editrici.GRUPPO)");
                           break;
                 case -3 : array_push($CondizioniWhere,"(case_editrici.DESCRIZIONE IS NULL OR " . 
                                                       "(case_editrici.CHIAVE IN (SELECT CHIAVE FROM case_editrici_nemiche)))");
                           break;
                 case -4 : array_push($CondizioniWhere,"case_editrici.CHIAVE IN (SELECT CHIAVE FROM case_editrici_nemiche)");
                           break;
                 default : if(!($Parametri->FiltroGruppoRivaleSelected))
                                array_push($CondizioniWhere,"titoli.EDITORE = case_editrici.DESCRIZIONE AND case_editrici.CHIAVE IN (SELECT CHIAVE FROM case_editrici_amiche) AND case_editrici.GRUPPO =" . $Parametri->FiltroGruppoEd);
                           else array_push($CondizioniWhere,"titoli.EDITORE = case_editrici.DESCRIZIONE AND case_editrici.CHIAVE IN (SELECT CHIAVE FROM case_editrici_nemiche) AND case_editrici.GRUPPO =" . $Parametri->FiltroGruppoEd);                           
                           array_push($CondizioniWhere,"istituti.PROVINCIA IN (SELECT PROVINCIA FROM province_x_gruppi_editoriali WHERE GRUPPO = " . $Parametri->FiltroGruppoEd . ")");
                           break;
               } 

               if($Parametri->FiltroVolUniciPrimi == "T")
               {
                 $Condizione = "(titoli.VOLUME = 0 OR titoli.VOLUME = 1)";
                 array_push($CondizioniWhere,$Condizione);
               }

               for($i = 0;$i < Count($CondizioniWhere);$i++)
                    $AStringa .= " AND ".$CondizioniWhere[$i];
               return $AStringa;
            }

            protected function FExtraScriptServerSide($PDODBase,&$JSONAnswer)
            {
               $Parametri             = JSON_decode($_POST['SIRIOParams']);
               $JSONAnswer->LsDocenti = array();

               $StringaWhere = $this->GetWhereConditions($Parametri);
               $SQLBody      = "SELECT docenti.CHIAVE,
                                       docenti.NASCOSTO,
                                       docenti.RAGIONE_SOCIALE,
                                       docenti.EMAIL,
                                       docenti.TITOLO,
                                       docenti.INDIRIZZO,
                                       docenti.COMUNE,
                                       docenti.CAP,
                                       docenti.PROVINCIA,
                                      (SELECT materie_insegnamento.DESCRIZIONE 
                                         FROM materie_insegnamento 
                                        WHERE CHIAVE = docenti.MATERIA_1) AS NOME_MATERIA1,
                                      (SELECT materie_insegnamento.DESCRIZIONE 
                                         FROM materie_insegnamento 
                                        WHERE CHIAVE = docenti.MATERIA_2) AS NOME_MATERIA2,
                                      (SELECT materie_insegnamento.DESCRIZIONE 
                                         FROM materie_insegnamento 
                                        WHERE CHIAVE = docenti.MATERIA_3) AS NOME_MATERIA3,
                                      (SELECT province_all.NOME 
                                         FROM province_all 
                                        WHERE CHIAVE = docenti.PROVINCIA) AS PROVINCIA_NOME,
                                      (SELECT COUNT(*) 
                                         FROM spedizioni
                                        WHERE spedizioni.DOCENTE = docenti.CHIAVE) AS NR_SPED_TOT,
                                      (SELECT COUNT(*) 
                                         FROM spedizioni 
                                        WHERE spedizioni.DOCENTE = docenti.CHIAVE 
                                          AND YEAR(spedizioni.DATA) = YEAR(CURDATE())) AS NR_SPED_LAST_ANNO, 
                                      docenti.MATERIA_1,
                                      docenti.MATERIA_2,
                                      docenti.MATERIA_3,
                                      docenti.COORD_MATERIA_1,
                                      docenti.COORD_MATERIA_2,
                                      docenti.COORD_MATERIA_3 
                                 FROM docenti,
                                      classi,
                                      gruppi_case_ed,
                                      province_all,
                                      istituti_x_docenti,
                                      istituti,
                                      istituti_gruppi,
                                      insegnamenti_docente,
                                      adozioni_titolo,
                                      materie_insegnamento,
                                      titoli,
                                      case_editrici " .
                                      $StringaWhere . "
                                ORDER BY docenti.RAGIONE_SOCIALE";

               if($Query = $PDODBase->query($SQLBody))
               {
                   while($Row = $Query->fetch(PDO::FETCH_ASSOC))
                   {
                     $RigaTmp = $this->CreateRowDocente($Row);
                     array_push($JSONAnswer->LsDocenti,$RigaTmp);
                   }
               }
            }     
      }

      $SIRIOConnection = new TExtraGetLsTeacher();
      $SIRIOConnection->ServerSideScript();
?>