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

  function Base64DecodeUnicode(str) 
  {
    percentEncodedStr = atob(str);
    return decodeURIComponent(percentEncodedStr);
  } 

  $scope.CSVLoaded = function (fileInfo) 
  {   
    var file = fileInfo.files[0];
    if(file) 
    {
      var reader = new FileReader();
      reader.onloadend = function(evt)
      {       
        var Csv           = reader.result.split(",");         
        var CsvSplitted   = (Base64DecodeUnicode(Csv[1])).split("\n");
        var $ObjQuery     = { Operazioni : [] };          
        $scope.FileLength = CsvSplitted.length -1;
        var $ObjQuery = { Operazioni : [] };
        $scope.Contatore  = 0;
        var ListaDocenti = [];
        var i = 1;
          
        while(i < CsvSplitted.length)
        {
          let RecordTitolo = CsvSplitted[i++].SplitCSVWithDoublequotes(';');
          if(RecordTitolo.length > 2)
          {
             RecordTitolo[0]  = RecordTitolo[0].trim();
             RecordTitolo[1]  = RecordTitolo[1].trim();
             RecordTitolo[2]  = RecordTitolo[2].trim(); 

             RecordTitolo[0] == '' ? RecordTitolo[0] = 'ND' : RecordTitolo[0];
             RecordTitolo[1] == '' ? RecordTitolo[1] = 'ND' : RecordTitolo[1];
             RecordTitolo[2] == '' ? RecordTitolo[2] = 'ND' : RecordTitolo[2];
             
             ListaDocenti.push({
                                 MailDocente : RecordTitolo[0].xSQL(),
                                 NomeDocente : RecordTitolo[1].xSQL() + ' ' + RecordTitolo[2].xSQL()
                               }); 
             $scope.Contatore++;
          } 
        }
        SystemInformation.ExecuteExternalScript('SIRIOExtraUpdateDocFromMailchimp', { ListaDocMailchimp : ListaDocenti }, function(Answer) 
        {
          var NuoviDocentiTmp   = Answer.NuoviDocenti;
          var OmonimiDocentiTmp = Answer.DocentiOmonimi;
          $ObjQuery = {Operazioni : []};
          $ObjQuery.Operazioni.push({
                                      Query     : 'UpdateDataImpMailchimp',
                                      Parametri : {}
                                    });
          SystemInformation.PostSQL('Accessories',$ObjQuery,function(Answer)
          {
            $scope.Contatore = 0;
            $ObjQuery = {Operazioni : []};
            document.getElementById('fileLoadCSVDocument').value = null;
            if(NuoviDocentiTmp.length > 0 && OmonimiDocentiTmp.length == 0)
               ZCustomAlert($mdDialog,'AVVISO','UPLOAD ESEGUITO! SONO STATI CREATI I SEGUENTI DOCENTI : ' + NuoviDocentiTmp.toString());

            if(NuoviDocentiTmp.length == 0 && OmonimiDocentiTmp.length > 0)
               ZCustomAlert($mdDialog,'ATTENZIONE','I SEGUENTI DOCENTI NON SONO STATI AGGIORNATI PERCHÈ SONO PRESENTI OMONIMI : ' + OmonimiDocentiTmp.toString());

            if(NuoviDocentiTmp.length > 0 && OmonimiDocentiTmp.length > 0)
               ZCustomAlert($mdDialog,'AVVISO','UPLOAD ESEGUITO! SONO STATI CREATI I SEGUENTI DOCENTI : ' + NuoviDocentiTmp.toString() + 
                                               '. INOLTRE I SEGUENTI DOCENTI NON SONO STATI AGGIORNATI PERCHÈ SONO PRESENTI OMONIMI : ' + OmonimiDocentiTmp.toString());

            if(NuoviDocentiTmp.length == 0 && OmonimiDocentiTmp.length == 0)
               ZCustomAlert($mdDialog,'AVVISO','UPLOAD ESEGUITO!');
          }) 
        })   
      }                      
    }
    reader.readAsDataURL(file);  
  }
    
  $scope.CaricaDocumento = function()
  { 
    document.getElementById('fileLoadCSVDocument').click();    
  }    
  
}]);