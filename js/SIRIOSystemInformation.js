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
  this.BordoEtichetta        = true;
  this.VDocDelivery          = 'VERSIONE DOCUMENTO 2.0 DEL 14/10/2020';
  this.VDocAdoption          = 'VERSIONE DOCUMENTO 1.0 DEL 8/9/2020';
  this.VDocLogStorage        = 'VERSIONE DOCUMENTO 1.0 DEL 8/9/2020';
  this.VDocInventory         = 'VERSIONE DOCUMENTO 1.1 DEL 13/10/2020';
  this.VDocCarico            = 'VERSIONE DOCUMENTO 1.0 DEL 8/9/2020';
  this.VDocListaDocIst       = 'VERSIONE DOCUMENTO 1.0 DEL 8/9/2020';

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
   
   
  this.CheckAnswerHTTP = function(Answer)
  {
    Self.HTTPResponse = Answer.Response;
    switch(Answer.Response)
    {
       case HTTP_OPERATION_OK           : Self.HTTPError = ''; break;
       case HTTP_ERROR_NOT_LOGGED       : Self.HTTPError = 'Utente non loggato'; break;
       case HTTP_ERROR_LOST_PARAMETER   : Self.HTTPError = 'Parametri mancanti'; break;
       case HTTP_ERROR_CONNECTION_SQL   : Self.HTTPError = 'Errore di connessione al server SQL'; break;
       case HTTP_ERROR_SQL              : Self.HTTPError = 'Query error'; break;
       case HTTP_ERROR_WRONG_PASSWORD   : Self.HTTPError = 'Password errata'; break;
       case HTTP_ERROR_WRONG_USER       : Self.HTTPError = 'Account errato'; break;
       case HTTP_ERROR_MODEL_LOAD       : Self.HTTPError = 'Errore di caricamento del modello'; break;
       case HTTP_ERROR_PARAMETERS       : Self.HTTPError = 'Parametri errati'; break; 
       default                          : Self.HTTPError = 'Errore sconosciuto'; break;
    }
   Self.SubHTTPError = ''; 
   if(Answer.Response == HTTP_ERROR_CONNECTION_SQL ||
      Answer.Response == HTTP_ERROR_MODEL_LOAD ||
      Answer.Response == HTTP_ERROR_SQL ||
      Answer.Response == HTTP_ERROR_PARAMETERS) 
      if(Answer.Error != undefined)
         Self.SubHTTPError += '[' + Answer.Error + ']';
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
                Self.UserInformation = { Ruolo : Result[0].ROLE };
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
            if(alertMessages) alert(Self.HTTPError  + (Self.SubHTTPError != '' ? "\n" + Self.SubHTTPError : ''));
            else Self.ApplyOnError(Self.HTTPError,Self.SubHTTPError); 
         }
      })
      .catch(function(Error) 
      {
        Self.ApplyOnError(Error.statusText,'');
      });
  }
}]);
