SIRIOApp.controller("csvBookController",['$scope','SystemInformation','$state','$rootScope','$mdDialog',
function($scope,SystemInformation,$state,$rootScope,$mdDialog)
{
  ScopeHeaderController.CheckButtons();
  $scope.Contatore = 0;
  $scope.FileLength = 0;  
  
  function Base64DecodeUnicode(str) 
   {
     percentEncodedStr = atob(str).split('').map(function(c) {
     return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
     }).join(''); 
     return decodeURIComponent(percentEncodedStr);
   } 
  
  $scope.CVSLoaded = function(fileInfo)
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
            let RecordTitolo = CsvSplitted[i++].SplitCSVWithDoublequotes();
            RecordTitolo[8]  = RecordTitolo[8].trim();
            RecordTitolo[9]  = RecordTitolo[9].trim();
            RecordTitolo[8]  = RecordTitolo[8].trim();
            RecordTitolo[7]  = RecordTitolo[7].trim();
            RecordTitolo[11] = RecordTitolo[11].trim();
            RecordTitolo[0]  = RecordTitolo[0].trim();
            RecordTitolo[5]  = RecordTitolo[5].trim();
            RecordTitolo[4]  = RecordTitolo[4].trim();
            RecordTitolo[13] = RecordTitolo[13].trim();
            RecordTitolo[14] = RecordTitolo[14].trim();
            RecordTitolo[15] = RecordTitolo[15].trim();

            $ObjQuery.Operazioni.push({ 
                                        Query     : 'UpdateDatabaseBook',
                                        Parametri : {                                                      
                                                      CodiceTitolo            : RecordTitolo[6].xSQL(),
                                                      TitoloTitolo            : RecordTitolo[8].xSQL(),                                                      
                                                      SottotitoloTitolo       : RecordTitolo[9].xSQL() == 'ND' ? '' : RecordTitolo[9].xSQL(),
                                                      DescrizioneMateria      : RecordTitolo[5].xSQL(),
                                                      AutoriTitolo            : RecordTitolo[7].xSQL(),
                                                      EditoreTitolo           : RecordTitolo[11].xSQL() == 'ND' ? '' : RecordTitolo[11].xSQL(),                                                      
                                                      VolumeTitolo            : isNaN(RecordTitolo[10].xSQL()) ? 0 : RecordTitolo[10].xSQL(),
                                                      IstitutoTitolo          : RecordTitolo[0].xSQL(),
                                                      AnnoTitolo              : RecordTitolo[1].xSQL(),
                                                      SezioneTitolo           : RecordTitolo[2].xSQL(),                                                      
                                                      DescrizioneCombinazione : RecordTitolo[4].xSQL(),
                                                      PrezzoTitolo            : RecordTitolo[12].xSQL(),
                                                      NuovaAdozioneTitolo     : (RecordTitolo[13].xSQL()).toUpperCase() == 'SI' ? 1 : 0,
                                                      DaAcquistareTitolo      : (RecordTitolo[14].xSQL()).toUpperCase() == 'SI' ? 1 : 0,
                                                      ConsigliatoTitolo       : (RecordTitolo[15].xSQL()).toUpperCase() == 'SI' ? 1 : 0,                                                      
                                                    }
                                                    
                                      });            
                                                                
            $scope.Contatore++;
            if($ObjQuery.Operazioni.length == 10)
            {
              SystemInformation.PostSQL('Book',$ObjQuery,function()
              {
                $ObjQuery.Operazioni = [];
                SendDieciTitoli()
              },false,true);  
            }
          }
          if($ObjQuery.Operazioni.length < 10)
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
    document.getElementById('fileLoadCVSDocument').click();    
  }
  
}]);