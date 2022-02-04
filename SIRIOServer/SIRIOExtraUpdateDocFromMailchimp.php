<?php 
      include_once 'SIRIOCfg.php';
      include_once 'SIRIODef.php';
      include_once 'SIRIOGlobale.php';
      include_once PATH_LIBRERIE . 'ZAdvQuery.php';
      
      header("Content-Type: application/json;charset=ISO-8859-15");
      header("Access-Control-Allow-Origin: *");
      header("Access-Control-Allow-Methods:POST,GET");  

      class TExtraTeacherFromMailchimp extends TAdvQuery
      {
            private function FCheckDocente(&$Database,&$Answer,$ObjDocente)
            {
              $NrDocentiOmonimi = 0;
              $ChiaveDocente    = -1;
              $NewKey           = -1;

              $TransactionActive = $Database->InTransaction();
              $Database->beginTransaction();
              try
              {
                $SQLBody = "SELECT COUNT(*) AS COUNT_OMONIMI
                              FROM docenti 
                             WHERE UPPER(RAGIONE_SOCIALE) = UPPER('" . $ObjDocente->NomeDocente . "')";

                if($Query = $Database->query($SQLBody))
                {
                  while($Row = $Query->fetch(PDO::FETCH_ASSOC))
                  {
                     $NrDocentiOmonimi = $Row['COUNT_OMONIMI'];  
                  }
                }

                $SQLBody = "SELECT CHIAVE
                              FROM docenti 
                             WHERE UPPER(RAGIONE_SOCIALE) = UPPER('" . $ObjDocente->NomeDocente . "') LIMIT 1";

                if($Query = $Database->query($SQLBody))
                {
                  while($Row = $Query->fetch(PDO::FETCH_ASSOC))
                  {
                     $ChiaveDocente = $Row['CHIAVE'];
                  }
                }

                if($ChiaveDocente == -1 && $NrDocentiOmonimi == 0)
                {
                  $SQLBody = "INSERT INTO log_mailchimp (RAGIONE_SOCIALE,MAIL,CHIAVE_DOC,DATA)
                                                         VALUES('" . $ObjDocente->NomeDocente . "','" . $ObjDocente->MailDocente . "',NULL,NOW())";
                  $Database->query($SQLBody);
                  
                  $SQLBody = "UPDATE gen_key SET CHIAVE = CHIAVE + 1";
                  $Database->query($SQLBody);
                  
                  $SQLBody = "SELECT MAX(CHIAVE) AS MAX_CHIAVE FROM gen_key"; 
                  if($Query = $Database->query($SQLBody))
                  {
                    while($Row = $Query->fetch(PDO::FETCH_ASSOC))
                    {
                       $NewKey = $Row['MAX_CHIAVE'];  
                    }
                  }
                  
                  $SQLBody = "INSERT INTO docenti (CHIAVE,RAGIONE_SOCIALE,EMAIL) 
                                                   VALUES (". $NewKey. ",'" . $ObjDocente->NomeDocente . "','" . $ObjDocente->MailDocente . "')";  
                  $Query = $Database->query($SQLBody);

                  array_push($Answer->NuoviDocenti,' • ' . $ObjDocente->NomeDocente);
                }
                else 
                {
                  if($ChiaveDocente != -1 && $NrDocentiOmonimi < 2)
                  {
                     $SQLBody = "INSERT INTO log_mailchimp (RAGIONE_SOCIALE,MAIL,CHIAVE_DOC,DATA)
                                                            VALUES('" . $ObjDocente->NomeDocente . "','" . $ObjDocente->MailDocente . "'," . $ChiaveDocente . ",NOW());";     
                     $Database->query($SQLBody);

                     $SQLBody = "UPDATE docenti SET EMAIL = '" . $ObjDocente->MailDocente . "' WHERE CHIAVE =" . $ChiaveDocente;     
                     $Database->query($SQLBody);
                  }
                  else 
                  {
                     $SQLBody = "INSERT INTO log_mailchimp (RAGIONE_SOCIALE,MAIL,CHIAVE_DOC,DATA)
                                                            VALUES('" . $ObjDocente->NomeDocente. "','" . $ObjDocente->MailDocente . "',0,NOW());";     
                     $Database->query($SQLBody);
                     array_push($Answer->DocentiOmonimi,' • ' . $ObjDocente->NomeDocente);
                  }
                }
                   
                if(!$TransactionActive) 
                   $Database->commit();
              }
              catch(Exception $e)
              {
               if(!$TransactionActive) 
                  $Database->rollBack();
                  throw new Exception($e->getMessage());         
              }
               
            }

            protected function FExtraScriptServerSide($PDODBase,&$JSONAnswer)
            {
              $JSONAnswer->NuoviDocenti = array(); 
              $JSONAnswer->DocentiOmonimi = array();       
              $Parametri = JSON_decode($_POST['SIRIOParams']); 
              $ListaMailchimp = $Parametri->ListaDocMailchimp;

              for($i = 0; $i < count($ListaMailchimp); $i ++)
                  $this->FCheckDocente($PDODBase,$JSONAnswer,$ListaMailchimp[$i]);
            }
      }

      $SIRIOConnection = new TExtraTeacherFromMailchimp();
      $SIRIOConnection->ServerSideScript();
?>