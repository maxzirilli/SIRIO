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
        var i = 1;

        var SendDieciMail = function()
        {             
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
               
               $ObjQuery.Operazioni.push({
                                           Query     : 'UpdateTeacherMailFromMailChimp',
                                           Parametri : {
                                                         MailDocente : RecordTitolo[0].xSQL(),
                                                         NomeDocente : RecordTitolo[1].xSQL() + ' ' + RecordTitolo[2].xSQL()
                                                       }
                                         });
               $scope.Contatore++;
            }
            if($ObjQuery.Operazioni.length == 20)
            {
              SystemInformation.PostSQL('Teacher',$ObjQuery,SendDieciMail,false,true)
              $ObjQuery.Operazioni = [];
              return;  
            }
          }
          if($ObjQuery.Operazioni.length < 20)
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
               })
             },false,true) 
        }
        SendDieciMail();           
      }                        
    }
    reader.readAsDataURL(file);  
  }
    
  $scope.CaricaDocumento = function()
  { 
    document.getElementById('fileLoadCSVDocument').click();    
  }    
  
}]);