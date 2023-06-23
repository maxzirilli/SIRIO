<?php

  function Global_GetSqlAdozioniAttuali($Where,$xInsert = false)
  {
    $Query = ($xInsert ? "SELECT adozioni_titolo.TITOLO AS CHIAVE_TITOLO,
                                 istituti.CHIAVE AS CHIAVE_ISTITUTO,
                                 COUNT(CLASSE) AS NR_CLASSI,
                                 NOW() AS DATA " 
                         :
                         "SELECT istituti.CHIAVE AS CHIAVE_ISTITUTO,
                                 istituti.CODICE AS CODICE_ISTITUTO,
                                 istituti.NOME AS NOME_ISTITUTO,    
                                 adozioni_titolo.TITOLO AS CHIAVE_TITOLO,
                                 titoli.TITOLO  AS NOME_TITOLO,
                                 titoli.EDITORE AS EDITORE_TITOLO,
                                 titoli.CODICE_ISBN AS CODICE_TITOLO,
                                 titoli.PREZZO AS PREZZO_TITOLO,
                                 case_editrici.CHIAVE AS CHIAVE_EDITORE_TITOLO,
                                 COUNT(CLASSE) AS NR_CLASSI")
                          .
                          " FROM adozioni_titolo,
                                 titoli LEFT OUTER JOIN case_editrici ON (case_editrici.DESCRIZIONE = titoli.EDITORE),
                                 istituti,
                                 classi,
                                 tipologie_gruppi_istituti,
                                 istituti_gruppi
                           WHERE adozioni_titolo.TITOLO = titoli.CHIAVE
                             AND istituti.TIPOLOGIA = tipologie_gruppi_istituti.TIPOLOGIA
                             AND tipologie_gruppi_istituti.GRUPPO_IST = istituti_gruppi.CHIAVE
                             AND adozioni_titolo.CLASSE = classi.CHIAVE
                             AND classi.ISTITUTO = istituti.CHIAVE 
                             AND adozioni_titolo.DA_ACQUISTARE = 1"
                        .$Where.
                      " GROUP BY CHIAVE_ISTITUTO,CHIAVE_TITOLO 
                        ORDER BY CHIAVE_ISTITUTO,CHIAVE_TITOLO";
     return $Query;
  }

  function Global_GetSqlAdozioniAttualiRegistrazione()
  {
    $Query = "INSERT INTO statistiche (TITOLO,ISTITUTO,NR_CLASSI,DATA) " .
              Global_GetSqlAdozioniAttuali("",true);    
     return $Query;
  }

?>