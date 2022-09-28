<?php

use LDAP\Result;

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

            private function GetWhereTitoli($Parametri)
            {
               $Where = true;
               $Result = '';
               if($Parametri->FiltroTitolo != -1)
               {
                 $Result .= ($Where ? " WHERE " : " AND ") . "titoli.CHIAVE = " . $this->FPrepareParameterValue($Parametri->FiltroTitolo,':');
                 $Where = false;
               }
               if($Parametri->FiltroMateriaTitolo != -1)
               {
                 $Result .= ($Where ? " WHERE " : " AND ") . "titoli.MATERIA = " . $this->FPrepareParameterValue($Parametri->FiltroMateriaTitolo,':');
                 $Where = false;
               }
               if($Parametri->FiltroVolUniciPrimi == "T")
               {
                 $Result .= ($Where ? " WHERE " : " AND ") . "titoli.VOLUME = 0 OR titoli.VOLUME = 1";
                 $Where = false;
               }
               if($Parametri->FiltroCasaEditrice != -1)
               {
                 $Result .= ($Where ? " WHERE " : " AND ") . "case_editrici.CHIAVE = " . $this->FPrepareParameterValue($Parametri->FiltroCasaEditrice,':');
                 $Where = false;
               }
               if($Parametri->FiltroGruppoEd == -2)
               {
                 $Result .= ($Where ? " WHERE " : " AND ") . "case_editrici.CHIAVE IN (SELECT CHIAVE FROM case_editrici_amiche)";
                 $Where = false;
               }
               if($Parametri->FiltroGruppoEd == -3)
               {
                 $Result .= ($Where ? " WHERE " : " AND ") . "(case_editrici.DESCRIZIONE IS NULL OR (case_editrici.CHIAVE IN (SELECT CHIAVE FROM case_editrici_nemiche)))";
                 $Where = false;
               }
               if($Parametri->FiltroGruppoEd == -4)
               {
                 $Result .= ($Where ? " WHERE " : " AND ") . "case_editrici.CHIAVE IN (SELECT CHIAVE FROM case_editrici_nemiche)";
                 $Where = false;
               }
               if($Parametri->FiltroGruppoEd > 0)
               {
                 //$Result .= ($Where ? " WHERE " : " AND ") . "case_editrici.CHIAVE = " . $Parametri->FiltroCasaEditrice;
                 if($Parametri->FiltroIsGruppoEdRivale == 'F')
                    $Result .= ($Where ? " WHERE " : " AND ") . "case_editrici.CHIAVE IN (SELECT CHIAVE FROM case_editrici_amiche) AND case_editrici.GRUPPO = " . $this->FPrepareParameterValue($Parametri->FiltroGruppoEd,':');
                 else $Result .= ($Where ? " WHERE " : " AND ") . "case_editrici.CHIAVE IN (SELECT CHIAVE FROM case_editrici_nemiche) AND case_editrici.GRUPPO = " . $this->FPrepareParameterValue($Parametri->FiltroGruppoEd,':'); 
                 $Where = false;
               }
               return $Result;
            }

            private function GetWhereIstituti($Parametri)
            {
               $Where = true;
               $Result = '';
               if($Parametri->FiltroIstituto != -1)
               {
                 $Result .= ($Where ? " WHERE " : " AND ") . "istituti.CHIAVE = " . $this->FPrepareParameterValue($Parametri->FiltroIstituto,':');
                 $Where = false;
               }
               if($Parametri->FiltroProvincia != -1)
               {
                 $Result .= ($Where ? " WHERE " : " AND ") . "istituti.PROVINCIA = " . $this->FPrepareParameterValue($Parametri->FiltroProvincia,':');
                 $Where = false;
               }
               if($Parametri->FiltroPromotore != -1)
               {
                 $Result .= ($Where ? " WHERE " : " AND ") . "istituti.PROMOTORE = " . $this->FPrepareParameterValue($Parametri->FiltroPromotore,':');
                 $Where = false;
               }
               if($Parametri->FiltroGruppoIst != -1)
               {
                  $Result .= ($Where ? " WHERE " : " AND ") . "istituti.TIPOLOGIA = tipologie_gruppi_istituti.TIPOLOGIA";
                  $Where = false;
                  $Result .= " AND tipologie_gruppi_istituti.GRUPPO_IST = istituti_gruppi.CHIAVE";
                  if($Parametri->FiltroGruppoIst == -2)
                     $Result .= " AND istituti_gruppi.LICEO = 1";
                  else $Result .= " AND tipologie_gruppi_istituti.GRUPPO_IST = " . $this->FPrepareParameterValue($Parametri->FiltroGruppoIst,':');
               }
               return $Result;
            }

            protected function FExtraScriptServerSide($PDODBase,&$JSONAnswer)
            {
               $Parametri             = JSON_decode($_POST['SIRIOParams']);
               $JSONAnswer->LsDocenti = array();

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
                                 FROM docenti 
                                WHERE docenti.RAGIONE_SOCIALE IS NOT NULL ";
               if($Parametri->FiltroMateriaDocente != '-1')
                   $SQLBody .= " AND (docenti.MATERIA_1 =" . $this->FPrepareParameterValue($Parametri->FiltroMateriaDocente, ':') . 
                                    " OR docenti.MATERIA_2 =" . $this->FPrepareParameterValue($Parametri->FiltroMateriaDocente, ':') . 
                                    " OR docenti.MATERIA_3 =" . $this->FPrepareParameterValue($Parametri->FiltroMateriaDocente, ':') .  ")";
               if($Parametri->FiltroCoordinatore == 'T')
                   $SQLBody .= " AND (docenti.COORD_MATERIA_1 IS NOT NULL OR docenti.COORD_MATERIA_2 IS NOT  NULL OR docenti.COORD_MATERIA_3 IS NOT  NULL)";
               if($Parametri->FiltroIstituto  != -1 ||
                  $Parametri->FiltroGruppoIst != -1 || 
                  $Parametri->FiltroProvincia != -1 ||   
                  $Parametri->FiltroPromotore != -1)
                  $SQLBody .= " AND docenti.CHIAVE IN (SELECT istituti_x_docenti.DOCENTE 
                                                         FROM istituti_x_docenti 
                                                        WHERE ISTITUTO IN (SELECT istituti.CHIAVE 
                                                                             FROM istituti" . ($Parametri->FiltroGruppoIst != -1 ? ",tipologie_gruppi_istituti,istituti_gruppi " : " ") .
                                                                             $this->GetWhereIstituti($Parametri) . "))";
               if($Parametri->FiltroTitolo        != -1 ||
                  $Parametri->FiltroCasaEditrice  != -1 ||
                  $Parametri->FiltroGruppoEd      != -1 || 
                  $Parametri->FiltroMateriaTitolo != -1 || 
                  $Parametri->FiltroVolUniciPrimi != 'F')
                  $SQLBody .= " AND docenti.CHIAVE IN (SELECT insegnamenti_docente.DOCENTE
                                                         FROM insegnamenti_docente
                                                        WHERE insegnamenti_docente.CLASSE IN (SELECT adozioni_titolo.CLASSE
                                                                                                FROM adozioni_titolo
                                                                                               WHERE adozioni_titolo.TITOLO IN (SELECT titoli.CHIAVE
                                                                                                                                  FROM titoli 
                                                                                                                                       LEFT OUTER JOIN case_editrici ON (case_editrici.DESCRIZIONE = titoli.EDITORE)
                                                                                                                                       LEFT OUTER JOIN gruppi_case_ed ON (case_editrici.GRUPPO = gruppi_case_ed.CHIAVE)  " . 
                                                                                                                                  $this->GetWhereTitoli($Parametri) .")))";
                                                                
               $SQLBody .= " ORDER BY docenti.RAGIONE_SOCIALE";

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