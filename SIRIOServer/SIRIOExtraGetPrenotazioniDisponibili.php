<?php

use LDAP\Result;

      include_once 'SIRIOCfg.php';
      include_once 'SIRIODef.php';
      include_once 'SIRIOGlobale.php';
      include_once PATH_LIBRERIE . 'ZAdvQuery.php';
      
      //header("Content-Type: application/json;charset=ISO-8859-15");
      header("Access-Control-Allow-Origin: *");
      header("Access-Control-Allow-Methods:POST,GET");  

      class TPrenotazione 
      {
         public $Chiave = -1;
         public $Quantita = 0;
         public $Titolo = -1;
         public $Disponibile = false;
         public $Disponibilita = 0;

         function __construct($Chiave,$Quantita,$Titolo)
         {
            $this->Chiave      = $Chiave;
            $this->Quantita    = $Quantita;
            $this->Titolo      = $Titolo;
         }
      }

      class TTitolo 
      {
        public $Chiave = -1;
        public $Nome = '';
        public $Codice = '';
        public $Disponibilita = 0;
        public $Contatore = 0;

        function __construct($Chiave,$Nome,$Codice)
        {
          $this->Chiave = $Chiave;
          $this->Nome   = $Nome;
          $this->Codice = $Codice;
        }

        function SetDisponibilita($Disponibilita)
        {
          $this->Disponibilita = $Disponibilita;
          $this->Contatore     = $Disponibilita;
        }
      }
      

      class TExtraGetSpedizioniDisponibili extends TAdvQuery
      {
            private $FListaTitoli = array();

            private function FGetTitolo($Titolo,$Nome,$Codice)
            {
              foreach ($this->FListaTitoli as $SingoloTitolo)
                  if($SingoloTitolo->Chiave == $Titolo)
                    return $SingoloTitolo;
               $EmptyTitolo = new TTitolo($Titolo,$Nome,$Codice);
               array_push($this->FListaTitoli,$EmptyTitolo);
               return $EmptyTitolo;
            }

          protected function FExtraScriptIgnoreLogin()
          {
            return true;
          }

            protected function FExtraScriptServerSide($PDODBase,&$JSONAnswer)
            {

               $SQLBody      = "SELECT dettaglio_spedizioni.CHIAVE,
                                       dettaglio_spedizioni.TITOLO,
                                       spedizioni.DATA,
                                       dettaglio_spedizioni.QUANTITA,
                                       titoli.QUANTITA_MGZN,
                                       titoli.TITOLO AS NOME_TITOLO,
                                       titoli.CODICE_ISBN AS CODICE_TITOLO
                                  FROM dettaglio_spedizioni JOIN spedizioni ON (dettaglio_spedizioni.SPEDIZIONE = spedizioni.CHIAVE)
                                       JOIN titoli ON (dettaglio_spedizioni.TITOLO = titoli.CHIAVE)
                                 WHERE dettaglio_spedizioni.STATO = 'P'
                                 ORDER BY spedizioni.DATA";

            
               $JSONAnswer->LsPrenotazioni = array();
               $WhereChiaviTitoli = '';
               if($Query = $PDODBase->query($SQLBody))
                   while($Row = $Query->fetch(PDO::FETCH_ASSOC))
                   {
                     array_push($JSONAnswer->LsPrenotazioni,new TPrenotazione($Row['CHIAVE'],$Row['QUANTITA'],$Row['TITOLO']));
                     $TitoloPrenotazione = new TTitolo($Row['TITOLO'],$Row['NOME_TITOLO'],$Row['CODICE_TITOLO']);
                     $TitoloPrenotazione->SetDisponibilita($Row['QUANTITA_MGZN']);
                     array_push($this->FListaTitoli,$TitoloPrenotazione);
                     $WhereChiaviTitoli .= $Row['TITOLO'] . ',';
                   }
               

               if($WhereChiaviTitoli != '')
                  $WhereChiaviTitoli = substr($WhereChiaviTitoli, 0, -1);

               $SQLBody      = "SELECT SUM(QUANTITA) AS QUANTITA,
                                       titoli.CHIAVE AS TITOLO,
                                       titoli.TITOLO AS NOME_TITOLO,
                                       titoli.CODICE_ISBN AS CODICE_TITOLO
                                  FROM dettaglio_spedizioni JOIN titoli ON (dettaglio_spedizioni.TITOLO = titoli.CHIAVE)
                                 WHERE STATO = 'S' AND titoli.CHIAVE IN ($WhereChiaviTitoli)
                                 GROUP BY TITOLO";

               if($Query = $PDODBase->query($SQLBody))
                   while($Row = $Query->fetch(PDO::FETCH_ASSOC))
                   {
                      $TitoloPrenotazione = $this->FGetTitolo($Row['TITOLO'],$Row['NOME_TITOLO'],$Row['CODICE_TITOLO']);
                      $TitoloPrenotazione->SetDisponibilita($Row['QUANTITA'] + $TitoloPrenotazione->Disponibilita);
                      $TitoloPrenotazione->Contatore += $Row['QUANTITA'];
                   }
               
               foreach ($JSONAnswer->LsPrenotazioni as $Prenotazione)
               {
                  $TitoloPrenotazione =  $this->FGetTitolo($Prenotazione->Titolo,'','');
                  $Prenotazione->Disponibile = $TitoloPrenotazione->Contatore >= $Prenotazione->Quantita;
                  $Prenotazione->Disponibilita = $TitoloPrenotazione->Disponibilita;
                  $TitoloPrenotazione->Contatore -= $Prenotazione->Quantita;
                  // if($TitoloPrenotazione->Codice == '9788824756686')
                  // {
                  //    error_log('VEGETA');
                  //   error_log(json_encode($TitoloPrenotazione));
                  //   error_log(json_encode($Prenotazione));
                  //   error_log(json_encode($Prenotazione->Quantita));
                  //   error_log(json_encode($Prenotazione->Disponibile));
                  // }
               }

               $JSONAnswer->Titoli = $this->FListaTitoli;
            }     
      }

      $SIRIOConnection = new TExtraGetSpedizioniDisponibili();
      $SIRIOConnection->ServerSideScript();
?>