// Inizializzazione servizio globale
const RUOLO_AMMINISTRATORE = 1;
const RUOLO_PROMOTORE = 0;

const PIATTA_NESSUNA    = 'N';
const PIATTA_HUBSCUOLA  = 'H';
const PIATTA_BSMART     = 'B';

SIRIOApp.service("SystemInformation",['$http','$state','$rootScope','$mdDialog',function($http,$state,$rootScope,$mdDialog)
{
  var Self                   = this;
  this.HTTPError             = '';
  this.SubHTTPError          = '';
  this.HTTPResponse          = 0;
  this.UserInformation       = {};
  this.UploadRunning         = false;
  this.GiorniSettimana       = ['Lunedì','Martedì','Mercoledì','Giovedì','Venerdì','Sabato','Domenica']; 
  this.DataBetweenController = {};
  this.DataBetweenDelivery   = {};
  this.VDocDelivery          = 'VERSIONE DOCUMENTO 2.4 DEL 04/03/2021';
  this.VDocAdoption          = 'VERSIONE DOCUMENTO 1.1 DEL 16/10/2020';
  this.VDocLogStorage        = 'VERSIONE DOCUMENTO 1.0 DEL 08/09/2020';
  this.VDocInventory         = 'VERSIONE DOCUMENTO 1.1 DEL 13/10/2020';
  this.VDocCarico            = 'VERSIONE DOCUMENTO 2.2 DEL 11/11/2020';
  this.VDocListaDocIst       = 'VERSIONE DOCUMENTO 2.3 DEL 04/03/2021';

  this.s2ab = function(s)
  {
    var buf = new ArrayBuffer(s.length);
    var view = new Uint8Array(buf);
    for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
  }
  
  this.GetCellaIntestazione = function(Valore)
  {
    return({ t : 's', 
             v : Valore,
             s : {
                   font : { 
                            bold : true  
                          },
                   fill : {
                            fgColor : { rgb: "FFFFAA00" }
                          },
                   border: {
                             bottom : {
                                         style : 'thin',
                                         color : { rgb: "0000000" }
                                      }
                           }
                 }
           });
  }
  
  this.GetCellaDati = function(Tipo,Valore)
  {
    return({ t : Tipo, 
             v : Valore,
             s : {
                   border: {
                             bottom : {
                                         style : 'thin',
                                         color : { rgb: "0000000" }
                                      },
                             top    : {
                                         style : 'thin',
                                         color : { rgb: "0000000" }
                                      },
                             left   : {
                                         style : 'thin',
                                         color : { rgb: "0000000" }
                                      },
                             right  : {
                                         style : 'thin',
                                         color : { rgb: "0000000" }
                                      }
                           }
                 }
           });
  }
  
  this.ApplyOnError = function(Error,SubError,OnError)
  {
     Self.HTTPError = Error;
     Self.SubHTTPError = SubError;
     if(OnError != undefined) 
        OnError(Error);
     if($state.current.name != 'notExistingPage') $state.go('loginPage');
  }
  
  this.FindResults = function(Results,Name)
  {
     if(Results != undefined)
     {
        try
        {
          return Results.find(function(SingleResult)
           {
             return SingleResult.Name == Name;
           }).View;
        } 
        catch(Errore)
        {
          return undefined;
        }
     } 
     else return undefined;
  };
   
  this.ForeignKeyError = false;
  this.MessaggioErroreSQL = '';
  
  this.CheckAnswerHTTP = function(Answer)
  {
    Self.HTTPResponse = Answer.Response;
    this.ForeignKeyError = false;
    var ForeignKeys = [{Name : 'FK_ADOZIONI_TITOLO_CLASSI', Messaggio : 'IMPOSSIBILE ELIMINARE! Classe associata ad adozione!'},
                       {Name : 'FK_ADOZIONI_TITOLO_TITOLI', Messaggio : 'IMPOSSIBILE ELIMINARE! Titolo associato ad adozione!'},
                       {Name : 'FK_CLASSI_COMBINAZIONE', Messaggio : 'IMPOSSIBILE ELIMINARE! Classe associata a combinazione!'},
                       {Name : 'FK_CLASSI_ISTITUTO', Messaggio : 'IMPOSSIBILE ELIMINARE! Classe associata ad istituto!'},
                       {Name : 'FK__MAGAZZINO_VOLANTE', Messaggio : 'IMPOSSIBILE ELIMINARE! Chiave primaria magazzino volante!'},
                       {Name : 'FK__TITOLI', Messaggio : 'IMPOSSIBILE ELIMINARE! Chiave primaria titolo!'},
                       {Name : 'FK_DETTAGLIO_SPEDIZIONI', Messaggio : 'IMPOSSIBILE ELIMINARE! Chiave primaria dettaglio spedizione!'},
                       {Name : 'FK_DETTAGLIO_SPEDIZIONI_TITOLO', Messaggio : 'IMPOSSIBILE ELIMINARE! Titolo associato al dettaglio di una spedizione!'},
                       {Name : 'FK_DOCENTI_MATERIE_INSEGAMENTO_1', Messaggio : 'IMPOSSIBILE ELIMINARE! Materia insegnamento associata ad un docente!'},
                       {Name : 'FK_DOCENTI_MATERIE_INSEGAMENTO_2', Messaggio : 'IMPOSSIBILE ELIMINARE! Materia insegnamento associata ad un docente!'},
                       {Name : 'FK_DOCENTI_MATERIE_INSEGAMENTO_3', Messaggio : 'IMPOSSIBILE ELIMINARE! Materia insegnamento associata ad un docente!'},
                       {Name : 'FK_docenti_disponibilita_docenti', Messaggio : 'IMPOSSIBILE ELIMINARE! Docente associato a disponibilità oraria di un docente!'},
                       {Name : 'FK_docenti_disponibilita_istituti', Messaggio : 'IMPOSSIBILE ELIMINARE! Istituto associato a disponibilità oraria di un docente!'},
                       {Name : 'FK_INS_DOCENTI_CLASSE', Messaggio : 'IMPOSSIBILE ELIMINARE! Classe associata ad un insegnamento di un docente!'},
                       {Name : 'FK_INS_DOCENTI_MATERIA', Messaggio : 'IMPOSSIBILE ELIMINARE! Materia associata ad un insegnamento di un docente!'},
                       {Name : 'FK_ISTITUTI_PROVINCE', Messaggio : 'IMPOSSIBILE ELIMINARE! Provincia associata a un istituto!'},
                       {Name : 'FK_ISTITUTI_TIPOLOGIE_ISTITUTO', Messaggio : 'IMPOSSIBILE ELIMINARE! Istituto associato ad una tipologia!'},
                       {Name : 'FK_ISTITUTI_UTENTI', Messaggio : 'IMPOSSIBILE ELIMINARE! Utente assegnato ad un istituto!'},
                       {Name : 'FK__DOCENTI', Messaggio : 'IMPOSSIBILE ELIMINARE! Docente associato a un istituto!'},
                       {Name : 'FK__ISTITUTI', Messaggio : 'IMPOSSIBILE ELIMINARE! Istituto associato a un docente!'},
                       {Name : 'FK_ISTITUTI', Messaggio : 'IMPOSSIBILE ELIMINARE! Chiave primaria istituto!'},
                       {Name : 'FK_TITOLI', Messaggio : 'IMPOSSIBILE ELIMINARE! Chiave primaria titolo!'},
                       {Name : 'FK__UTENTI', Messaggio : 'IMPOSSIBILE ELIMINARE! Utente associato a movimento magazzino volante!'},
                       {Name : 'FK_MOVIMENTI_MAG_TITOLO', Messaggio : 'IMPOSSIBILE ELIMINARE! Titolo associato a movimento di magazzino!'},
                       {Name : 'FK_MOVIMENTI_MAG_VOL_TITOLO', Messaggio : 'IMPOSSIBILE ELIMINARE! Titolo associato a movimento di magazzino volante!'},
                       {Name : 'FK_ORDINI_INGRESSO_TITOLI', Messaggio : 'IMPOSSIBILE ELIMINARE! Titolo associato ad un carico!'},
                       {Name : 'FK_SPEDIZIONI_DOCENTI', Messaggio : 'IMPOSSIBILE ELIMINARE! Docente associato ad una spedizione!'},
                       {Name : 'FK_SPEDIZIONI_ISTITUTI', Messaggio : 'IMPOSSIBILE ELIMINARE! Istituto associato ad una spedizione!'},
                       {Name : 'FK_SPEDIZIONI_PROVINCE_ALL', Messaggio : 'IMPOSSIBILE ELIMINARE! Provincia associata ad una spedizione!'},
                       {Name : 'FK_SPEDIZIONI_UTENTI', Messaggio : 'IMPOSSIBILE ELIMINARE! Utente associato ad una spedizione!'},
                       {Name : 'FK_TITOLI_MATERIE_INSEGNAMENTO', Messaggio : 'IMPOSSIBILE ELIMINARE! Materia associata ad un titolo!'}];
   
    switch(Answer.Response)
    {
       case HTTP_OPERATION_OK           : Self.HTTPError = ''; break;
       case HTTP_ERROR_NOT_LOGGED       : Self.HTTPError = 'Utente non loggato'; break;
       case HTTP_ERROR_LOST_PARAMETER   : Self.HTTPError = 'Parametri mancanti'; break;
       case HTTP_ERROR_CONNECTION_SQL   : Self.HTTPError = 'Errore di connessione al server SQL'; break;
       case HTTP_ERROR_SQL              : Self.HTTPError = 'Query error'; 
                                          for(let i = 0;i < ForeignKeys.length;i ++)
                                              if((Answer.Error.toUpperCase().includes(ForeignKeys[i].Name.toUpperCase())))
                                              {
                                                 this.MessaggioErroreSQL = ForeignKeys[i].Messaggio;
                                                 this.ForeignKeyError  = true;
                                              }
                                          break;
       case HTTP_ERROR_WRONG_PASSWORD   : Self.HTTPError = 'Password errata'; break;
       case HTTP_ERROR_WRONG_USER       : Self.HTTPError = 'Account errato'; break;
       case HTTP_ERROR_MODEL_LOAD       : Self.HTTPError = 'Errore di caricamento del modello'; break;
       case HTTP_ERROR_PARAMETERS       : Self.HTTPError = 'Parametri errati'; break; 
       case HTTP_ERROR_ACCESS_DENIED    : Self.HTTPError = 'Accesso negato. Sospetto attacco DDoS'; break;
       case HTTP_ERROR_SMTP_GENERIC     : Self.HTTPError = 'Errore invio email'; break;
       case HTTP_ERROR_EXTRA_SCRIPT     : Self.HTTPError = 'Errore script customizzato'; break;
       default                          : Self.HTTPError = 'Errore sconosciuto'; break;
    }

    Self.SubHTTPError = ''; 
    if(Answer.Response == undefined)
       Self.SubHTTPError = Answer;
    else
    {
      if(Answer.Response == HTTP_ERROR_CONNECTION_SQL ||
         Answer.Response == HTTP_ERROR_MODEL_LOAD ||
         Answer.Response == HTTP_ERROR_SQL ||
         Answer.Response == HTTP_ERROR_EXTRA_SCRIPT ||
         Answer.Response == HTTP_ERROR_PARAMETERS ||
         Answer.Response == HTTP_ERROR_SMTP_GENERIC) 
         if(Answer.Error != undefined)
            Self.SubHTTPError += '[' + Answer.Error + ']';
     }
     return(Answer.Response == HTTP_OPERATION_OK)
  }

  this.GetInformation = function(OnSuccess,OnError)
  {
     var LocalApplyOnError = function(Error,SubError,OnError)
     {
        Self.UserInformation = {};
        Self.ApplyOnError(Error,SubError,OnError);
        ScopeHeaderController.ChangeStatoLogin(false);
     };
     
     $http.get(URL_SERVER + "SIRIOConnection.php?SIRIOModel=AccountInfo")
       .then(function(Answer) 
       {
          if(Self.CheckAnswerHTTP(Answer.data))
          {
             let Result = Self.FindResults(Answer.data.Results,'UserInformation');
             if(Result != undefined)
             {
                Self.UserInformation = { 
                                         Ruolo : Result[0].ROLE, 
                                         OrdinamentoDoc : Result[0].ORDINAMENTO_DOC, 
                                         Username : Result[0].USERNAME
                                       };
                $rootScope.currentUserLogged = 'UTENTE : ' + Self.UserInformation.Username.toUpperCase() + ' -';
                ScopeHeaderController.ChangeStatoLogin(true);
                OnSuccess();
             }
             else LocalApplyOnError('Modello non conforme','',OnError);
          }
          else LocalApplyOnError(Self.HTTPError,Self.SubHTTPError,OnError);
       })
       .catch(function(Error) 
       {
         LocalApplyOnError(Error.statusText,'',OnError);
       });
  };
  
  this.Login = function(UserName,Password,OnSuccess,OnError) 
  {
    $http.post(URL_SERVER + "SIRIOLogin.php",'SIRIOUserName=' + UserName + '&SIRIOPassword='+ Password )
      .then(function(Answer) 
      {
         if(Self.CheckAnswerHTTP(Answer.data))
            OnSuccess();
         else Self.ApplyOnError(Self.HTTPError,Self.SubHTTPError,OnError); 
      })
      .catch(function(Error) 
      {
        Self.ApplyOnError(Error.statusText,'',OnError);
      });
  };  
  
  this.Logout = function()
  {
    $http.post(URL_SERVER + "SIRIOLogout.php" )
      .then(function(Answer) 
      {
         if(Self.CheckAnswerHTTP(Answer.data))
         {
            Self.UserInformation = {};
            Self.HTTPError = '';
            Self.SubHTTPError = '';
            $rootScope.viewToolbar = false;
            $rootScope.currentUserLogged = '';
            $state.go('loginPage');
         }
         else Self.ApplyOnError(Self.HTTPError,Self.SubHTTPError); 
      })
      .catch(function(Error) 
      {
        Self.ApplyOnError(Error.statusText,'');
      });
  };
    
  this.ChangePassword = function(VecchiaPassword,NuovaPassword,OnSuccess)
  {
    $http.post(URL_SERVER + "SIRIOChangePassword.php", 'SIRIOPassword='+ VecchiaPassword + '&SIRIONewPassword=' + NuovaPassword )
      .then(function(Answer) 
      {
         if(Self.CheckAnswerHTTP(Answer.data))
            OnSuccess(Answer.data.ResponseChangePassword);
         else Self.ApplyOnError(Self.HTTPError,Self.SubHTTPError); 
      })
      .catch(function(Error) 
      {
        Self.ApplyOnError(Error.statusText,'');
      });
  };
  
  this.GetSQL = function(Modello,Parametri,OnSuccess,NomeQuery)
  {
    var URL = URL_SERVER + "SIRIOConnection.php?SIRIOModel=" + Modello;
    if(NomeQuery != undefined)
       Parametri.SIRIOSelectQuery = NomeQuery;
    for(var k in Parametri) 
        URL += '&' + k + '=' + Parametri[k];
    
    $http.get(URL)
      .then(function(Answer) 
      {
         if(Self.CheckAnswerHTTP(Answer.data))
         {
           OnSuccess(Answer.data.Results);
         }
         else Self.ApplyOnError(Self.HTTPError,Self.SubHTTPError);
      })
      .catch(function(Error) 
      {
       Self.ApplyOnError(Error,'');
      });
  }
  
  this.ExecuteExternalScript =  function(ExternalScript,Parametri,OnSuccess,alertMessages = false)
  {
   $http.post(URL_SERVER + ExternalScript + '.php',(Parametri != undefined ? "SIRIOParams=" + JSON.stringify(Parametri) : ""))
      .then(function(Answer) 
      {
         if(Self.CheckAnswerHTTP(Answer.data))
         {
            if(OnSuccess != undefined)
               OnSuccess(Answer.data);
         }
         else 
         {
            if(alertMessages || Self.ForeignKeyError) 
               ZCustomAlert($mdDialog,'ATTENZIONE!',Self.MessaggioErroreSQL);
            else Self.ApplyOnError(Self.HTTPError,Self.SubHTTPError); 
         }
      })
      .catch(function(Error) 
      {
         Self.ApplyOnError(Error.statusText,'');
      });
 }

  this.PostSQL = function(Modello,Oggetto,OnSuccess,InvioMail = false,alertMessages = false)
  {
    $http.post(URL_SERVER + (InvioMail ? "SIRIOSendMail.php" : "SIRIOConnection.php"), 
               "SIRIOModel=" + Modello + "&SIRIOEditParams=" + JSON.stringify(Oggetto))
      .then(function(Answer) 
      {
         if(Self.CheckAnswerHTTP(Answer.data))
         {
            if(OnSuccess != undefined)
               OnSuccess(Answer.data);
         }
         else 
         {
            if(alertMessages || Self.ForeignKeyError) 
               ZCustomAlert($mdDialog,'ATTENZIONE!',Self.MessaggioErroreSQL);//Self.HTTPError  + (Self.SubHTTPError != '' ? "\n" + Self.SubHTTPError : '') 
            else Self.ApplyOnError(Self.HTTPError,Self.SubHTTPError); 
         }
      })
      .catch(function(Error) 
      {
        Self.ApplyOnError(Error.statusText,'');
      });
  }
}]);
