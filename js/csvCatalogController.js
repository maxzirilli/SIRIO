SIRIOApp.controller("csvCatalogController",['$scope','SystemInformation','$state','$rootScope','$mdDialog',
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
  
  /*$scope.XLSLoaded = function(fileInfo)
  { 
    var file = fileInfo.files[0];
    if(file) 
    {
      var reader = new FileReader();
      reader.onloadend = function(evt)
      {      
        var Csv            = reader.result.split(",");         
        var CsvSplitted    = (Base64DecodeUnicode(Csv[1])).split("\n");
        var $ObjQuery      = { Operazioni : [] };          
        $scope.FileLength  = CsvSplitted.length - 1;
        $scope.Contatore   = 0;
        var i = 1;
        
        var SendDieciTitoli = function()
        {
          while (i < CsvSplitted.length - 1)          
          { 
            let RecordTitolo    = CsvSplitted[i++].SplitCSVWithDoublequotes();
            RecordTitolo[8]     = RecordTitolo[8].trim();
            RecordTitolo[9]     = RecordTitolo[9].trim();
            RecordTitolo[8]     = RecordTitolo[8].trim();
            RecordTitolo[7]     = RecordTitolo[7].trim();
            RecordTitolo[11]    = RecordTitolo[11].trim();
            RecordTitolo[0]     = RecordTitolo[0].trim();
            RecordTitolo[5]     = RecordTitolo[5].trim();            
            $ObjQuery.Operazioni.push({ 
                                        Query     : 'UpdateDatabaseBook',
                                        Parametri : {                                                      
                                                      CodiceTitolo       : RecordTitolo[6].xSQL(),
                                                      TitoloTitolo       : RecordTitolo[8].xSQL(),                                                      
                                                      SottotitoloTitolo  : RecordTitolo[9].xSQL() == 'ND' ? '' : RecordTitolo[9].xSQL(),
                                                      DescrizioneMateria : RecordTitolo[5].xSQL(),
                                                      AutoriTitolo       : RecordTitolo[7].xSQL(),
                                                      EditoreTitolo      : RecordTitolo[11].xSQL() == 'ND' ? '' : RecordTitolo[11].xSQL(),                                                      
                                                      VolumeTitolo       : RecordTitolo[10].xSQL() == 'U' ? 0 : RecordTitolo[10].xSQL(),
                                                      IstitutoTitolo     : RecordTitolo[0].xSQL(),
                                                      AnnoTitolo         : RecordTitolo[1].xSQL(),
                                                      SezioneTitolo      : RecordTitolo[2].xSQL(),
                                                      PrezzoTitolo       : RecordTitolo[12].xSQL()                                                      
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
               alert ('UPLOAD ESEGUITO!');                                                               
             },false,true)                                                                 
        }
        SendDieciTitoli();

      }  
    }          
    reader.readAsDataURL(file);          
  }*/
  
  $scope.CSVLoaded = function (fileInfo) 
  {   
    var file = fileInfo.files[0];
    if(file) 
    {
      var reader = new FileReader();
      reader.onloadend = function(evt)
      {       
        var Csv            = reader.result.split(",");         
        var CsvSplitted    = (Base64DecodeUnicode(Csv[1])).split("\n");
        var $ObjQuery      = { Operazioni : [] };          
        $scope.FileLength  = CsvSplitted.length - 1;
        $scope.Contatore   = 0;
        var i = 1;
      
        var SendDieciTitoli = function()
        {
          while (i < CsvSplitted.length - 1)          
          { 
            let RecordTitolo    = CsvSplitted[i++].SplitCSVWithDoublequotes(';');
            RecordTitolo[0]     = RecordTitolo[0].trim();
            RecordTitolo[1]     = RecordTitolo[1].trim();
            RecordTitolo[2]     = RecordTitolo[2].trim();
            RecordTitolo[3]     = RecordTitolo[3].trim();;
            RecordTitolo[3]     = RecordTitolo[3].toUpperCase();
            RecordTitolo[5]     = RecordTitolo[5].trim();            
            $ObjQuery.Operazioni.push({ 
                                        Query     : 'UpdateDatabaseBookCatalog',
                                        Parametri : {                                                      
                                                      CodiceTitolo       : RecordTitolo[0].xSQL(),
                                                      TitoloTitolo       : RecordTitolo[2].xSQL(),
                                                      SottotitoloTitolo  : '',                                                      
                                                      DescrizioneMateria : RecordTitolo[3].xSQL(),
                                                      AutoriTitolo       : RecordTitolo[1].xSQL(),
                                                      EditoreTitolo      : 'MONDADORI (C)',
                                                      PrezzoTitolo       : RecordTitolo[5],
                                                      VolumeTitolo       : 'U'                                                      
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
               alert ('UPLOAD ESEGUITO!');                                                               
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