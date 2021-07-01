<?php 
      include_once 'SIRIOCfg.php';
      include_once 'SIRIODef.php';
      include_once 'SIRIOGlobale.php';
      include_once PATH_LIBRERIE . 'ZAdvQuery.php';
      
      header("Content-Type: application/json;charset=ISO-8859-15");
      header("Access-Control-Allow-Origin: *");
      header("Access-Control-Allow-Methods:POST,GET");  

      class TExtraGetRegisterCurrentAdoption extends TAdvQuery
      {
        private function CreateTmpRow($Elemento)
        {
          $RigaTmp        = new stdClass();
          $RigaTmp->K_TIT = $Elemento ['CHIAVE_TITOLO'];
          $RigaTmp->C_TIT = $Elemento ['CODICE_TITOLO'];
          $RigaTmp->E_TIT = $Elemento ['EDITORE_TITOLO']; 
          $RigaTmp->N_TIT = $Elemento ['NOME_TITOLO'];
          $RigaTmp->P_TIT = $Elemento ['PREZZO_TITOLO'];
          $RigaTmp->K_IST = $Elemento ['CHIAVE_ISTITUTO']; 
          $RigaTmp->N_IST = $Elemento ['NOME_ISTITUTO']; 
          $RigaTmp->CLS   = $Elemento ['NR_CLASSI']; 
          return $RigaTmp;
        }

        protected function FExtraScriptServerSide($PDODBase,&$JSONAnswer)
        {
          $Parametri = JSON_decode($_POST['SIRIOParams']); 
          
          if ($Parametri->Registrazione == "T")
          {
            $SQLBody = Global_GetSqlAdozioniAttualiRegistrazione();
            $Query   = $PDODBase->query($SQLBody);
          }
          else
          {
            $SQLBody = Global_GetSqlAdozioniAttuali(' ');
            $JSONAnswer->AdozioniAttuali = array();
            if($Query = $PDODBase->query($SQLBody))
            {
                while($Row = $Query->fetch(PDO::FETCH_ASSOC))
                {
                  $Riga = $this->CreateTmpRow($Row);
                  array_push($JSONAnswer->AdozioniAttuali,$Riga);
                }
            }  
          }
        } 
      }

      $SIRIOConnection = new TExtraGetRegisterCurrentAdoption();
      $SIRIOConnection->ServerSideScript();
?>