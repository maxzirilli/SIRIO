SIRIOApp.controller("mailChimpUploadController",['$scope','SystemInformation','$state','$rootScope','$mdDialog','$http',
function($scope,SystemInformation,$state,$rootScope,$mdDialog,$http)
{
  $scope.Contatore             = 0;
  $scope.FileLength            = 0;
  $scope.UltimaDataImportazione = '';

  ScopeHeaderController.CheckButtons();
  
  SystemInformation.GetSQL('Accessories',{},function(Results)
  {
    var TmpUltimaData = SystemInformation.FindResults(Results,'LastUpdateMailChimp')[0].ULTIMA_IMPORTAZIONE_MAIL;
    if(TmpUltimaData != undefined)
    {
       if(TmpUltimaData != null)
          $scope.UltimaDataImportazione = ZFormatDateTime('dd/mm/yyyy',ZDateFromHTMLInput(TmpUltimaData))
       else $scope.UltimaDataImportazione = '';
    }
    else SystemInformation.ApplyOnError('Modello data importazione non conforme')
  },'SelectDataImpSQL');
  
  $scope.CaricaMailChimp = function()
  {
    SystemInformation.GetSQL('Accessories',{},function(Results)
    {
      var UltimaData = SystemInformation.FindResults(Results,'LastUpdateMailChimp');
      if(UltimaData != undefined)
      {
        UltimaData = (UltimaData[0] == undefined ? null : UltimaData[0].ULTIMA_IMPORTAZIONE_MAIL);
        if(UltimaData == null)
        {
          $http.get('https://www.pagina43.it/ZMSoftware/MailChimpRetrieveValues.php?Passwd=ZMaxMailChimpVegeta75')
          .then(function(Answer) 
          {
            if(SystemInformation.CheckAnswerHTTP(Answer.data))
            {
              if(Answer.data.Contacts.length > 0)
              {
                $scope.FileLength  = Answer.data.Contacts.length;
                $scope.Contatore = 0;
                var $ObjQuery = { Operazioni : [] };
                var i = 0;
        
                var SendDieciMail = function()
                {
                  while(i < Answer.data.Contacts.length)
                  {
                    Answer.data.Contacts[i].Email   == undefined ? (Answer.data.Contacts[i].Email = 'ND') : (Answer.data.Contacts[i].Email = Answer.data.Contacts[i].Email.trim())
                    Answer.data.Contacts[i].Cognome == undefined ? (Answer.data.Contacts[i].Cognome = 'ND') : (Answer.data.Contacts[i].Cognome = Answer.data.Contacts[i].Cognome.trim())
                    Answer.data.Contacts[i].Nome    == undefined ? (Answer.data.Contacts[i].Nome = 'ND') : (Answer.data.Contacts[i].Nome = Answer.data.Contacts[i].Nome.trim())
                    
                    $ObjQuery.Operazioni.push({
                                                Query     : 'UpdateTeacherMailFromMailChimp',
                                                Parametri : {
                                                              MailDocente : Answer.data.Contacts[i].Email,
                                                              NomeDocente : Answer.data.Contacts[i].Cognome + ' ' + Answer.data.Contacts[i].Nome
                                                            }
                                              });
                    $scope.Contatore++;
                    i++;
                    if($ObjQuery.Operazioni.length == 20)
                    {
                      SystemInformation.PostSQL('Teacher',$ObjQuery,SendDieciMail,false,true);  
                      $ObjQuery.Operazioni = [];
                      return;
                    }
                  }
                  if($ObjQuery.Operazioni.length != 0 && $ObjQuery.Operazioni.length < 20)
                  SystemInformation.PostSQL('Teacher',$ObjQuery,function() 
                  {
                    $ObjQuery = {Operazioni : []};
                    $ObjQuery.Operazioni.push({
                                                Query     : 'UpdateDataImpMailchimp',
                                                Parametri : {}
                                               });
                    SystemInformation.PostSQL('Accessories',$ObjQuery,function(Answer)
                    {
                      $scope.Contatore = 0;
                      $ObjQuery = {Operazioni : []};
                      ZCustomAlert($mdDialog,'AVVISO','UPLOAD ESEGUITO!');  
                    },false,true)                                                                
                  },false,true)  
                }
                SendDieciMail()
               }
               else ZCustomAlert($mdDialog,'ATTENZIONE','NESSUN AGGIORNAMENTO DISPONIBILE!')
            }
            else SystemInformation.ApplyOnError('Errore di chiamata http a Pagina43 per lista mailchimp','');
          })
          .catch(function(Error) 
          {
            SystemInformation.ApplyOnError('Errore di chiamata http a Pagina43 per lista mailchimp','');
          });
        }
        else
        {
          var UrlConData = 'https://www.pagina43.it/ZMSoftware/MailChimpRetrieveValues.php?Passwd=ZMaxMailChimpVegeta75&FromData=' + UltimaData.toString();
          $http.get(UrlConData)
          .then(function(Answer) 
          {
            if(SystemInformation.CheckAnswerHTTP(Answer.data))
            {
             if(Answer.data.Contacts.length > 0)
             {
                $scope.FileLength  = Answer.data.Contacts.length;
                $scope.Contatore = 0;
                var $ObjQuery = { Operazioni : [] };
                var i = 0;
        
                var SendDieciMail = function()
                {
                  while(i < Answer.data.Contacts.length)
                  {
                    Answer.data.Contacts[i].Email   == undefined ? (Answer.data.Contacts[i].Email = 'ND') : (Answer.data.Contacts[i].Email = Answer.data.Contacts[i].Email.trim())
                    Answer.data.Contacts[i].Cognome == undefined ? (Answer.data.Contacts[i].Cognome = 'ND') : (Answer.data.Contacts[i].Cognome = Answer.data.Contacts[i].Cognome.trim())
                    Answer.data.Contacts[i].Nome    == undefined ? (Answer.data.Contacts[i].Nome = 'ND') : (Answer.data.Contacts[i].Nome = Answer.data.Contacts[i].Nome.trim())
                    
                    $ObjQuery.Operazioni.push({
                                                Query     : 'UpdateTeacherMailFromMailChimp',
                                                Parametri : {
                                                              MailDocente : Answer.data.Contacts[i].Email,
                                                              NomeDocente : Answer.data.Contacts[i].Cognome + ' ' + Answer.data.Contacts[i].Nome
                                                            }
                                              });
                    $scope.Contatore++;
                    i++;
                    if($ObjQuery.Operazioni.length == 20)
                    {
                      SystemInformation.PostSQL('Teacher',$ObjQuery,SendDieciMail,false,true);  
                      $ObjQuery.Operazioni = [];
                      return;
                    }
                  }
                  if($ObjQuery.Operazioni.length != 0 && $ObjQuery.Operazioni.length < 20)
                  SystemInformation.PostSQL('Teacher',$ObjQuery,function() 
                  { 
                    $ObjQuery = {Operazioni : []};
                    $ObjQuery.Operazioni.push({
                                                Query     : 'UpdateDataImpMailchimp',
                                                Parametri : {}
                                               });
                    SystemInformation.PostSQL('Accessories',$ObjQuery,function(Answer)
                    {
                      $scope.Contatore = 0;
                      $ObjQuery        = {Operazioni : []};
                      var Data         = new Date();
                      var DataAnno     = Data.getFullYear();
                      var DataMese     = Data.getMonth()+1; 
                      var DataGiorno   = Data.getDate();
                      scope.UltimaDataImportazione = DataGiorno.toString() + '/' + DataMese.toString() + '/' + DataAnno.toString();
                      ZCustomAlert($mdDialog,'AVVISO','UPLOAD ESEGUITO!'); 
                    },false,true)                                                             
                  },false,true)  
                }
              SendDieciMail()
              }
              else ZCustomAlert($mdDialog,'ATTENZIONE','NESSUN AGGIORNAMENTO DISPONIBILE!')
            }
            else SystemInformation.ApplyOnError('Errore di chiamata http a Pagina43 per lista mailchimp','');
          })
          .catch(function(Error) 
          {
            SystemInformation.ApplyOnError('Errore di chiamata http a Pagina43 per lista mailchimp','');
          });
        }    
      }
      else SystemInformation.ApplyOnError('Modello data importazione non conforme','')    
    },'SelectDataImpSQL')
  }
  
}]);