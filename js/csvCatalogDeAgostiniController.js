SIRIOApp.controller("csvCatalogDeAgostiniController",['$scope','SystemInformation','$state','$rootScope','$mdDialog',
function($scope,SystemInformation,$state,$rootScope,$mdDialog)
{ 
  ScopeHeaderController.CheckButtons();
  $scope.Contatore = 0;
  $scope.FileLength = 0;  
  
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
        $scope.Contatore  = 0;
        var i = 3;
      
        var SendDieciTitoli = function()
        {
          while (i < CsvSplitted.length - 1)          
          { 
            let RecordTitolo = CsvSplitted[i++].SplitCSVWithDoublequotes(';');
            RecordTitolo[0]  = RecordTitolo[0].trim();
            RecordTitolo[1]  = RecordTitolo[1].trim();
            RecordTitolo[3]  = RecordTitolo[3].trim();;
            RecordTitolo[4]  = RecordTitolo[4].trim();
            RecordTitolo[5]  = RecordTitolo[5].trim();            
            $ObjQuery.Operazioni.push({ 
                                        Query     : 'UpdateDatabaseBookCatalogDeAgostini',
                                        Parametri : {                                                      
                                                      CodiceTitolo       : RecordTitolo[0].xSQL(),
                                                      TitoloTitolo       : RecordTitolo[1].xSQL(),
                                                      EditoreTitolo      : RecordTitolo[3].xSQL(),
                                                      VolumeTitolo       : isNaN(RecordTitolo[5].xSQL()) ? 0 : RecordTitolo[5].xSQL(),                                                      
                                                      PrezzoTitolo       : RecordTitolo[4].xSQL()
                                                    }                                                   
                                      });                                       
              $scope.Contatore++;
            if($ObjQuery.Operazioni.length == 10)
            {
              SystemInformation.PostSQL('Book',$ObjQuery,SendDieciTitoli,false,true);  
              $ObjQuery.Operazioni = [];
              return;
            }
          }
          if($ObjQuery.Operazioni.length != 0 && $ObjQuery.Operazioni.length < 10)
             SystemInformation.PostSQL('Book',$ObjQuery,function() 
             { 
               $scope.Contatore = 0;
               ZCustomAlert($mdDialog,'OK','UPLOAD ESEGUITO')                                                                
             },false,true)                                                                 
        }
        SendDieciTitoli();            
      }  
    }          
    reader.readAsDataURL(file);          
  }

  $scope.CaricaDocumento = function()
  { 
    document.getElementById('fileLoadCSVDocument').click();    
  }

}]);