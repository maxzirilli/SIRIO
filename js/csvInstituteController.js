SIRIOApp.controller("csvInstituteController",['$scope','SystemInformation','$state','$rootScope','$mdDialog',
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
        
        var SendDieciIstituti = function()
        {
          while (i < CsvSplitted.length - 1)          
          {
            let RecordIstituto = CsvSplitted[i++].split(",");       
            let Provincia = ListaProvince.find(function(AProvincia) { return(AProvincia.NOME == RecordIstituto[3]);});
            let TipologiaEsclusa = ListaTipologieEscluse.find(function(ATipologia) { return(ATipologia.DESCRIZIONE == RecordIstituto[13]);});
            if (Provincia != undefined && TipologiaEsclusa == undefined)                 
            { 
              RecordIstituto[7] = RecordIstituto[7].replace(/['"]+/g, '');
              RecordIstituto[7] = RecordIstituto[7].trim();
              RecordIstituto[13] = RecordIstituto[13].trim();
              RecordIstituto[3] = Provincia.CHIAVE;
              $ObjQuery.Operazioni.push({ 
                                          Query     : 'UpdateDatabaseInstitute',
                                          Parametri : {                                                      
                                                        CodiceIstituto    : RecordIstituto[6].xSQL(),  
                                                        NomeIstituto      : RecordIstituto[7].xSQL(),
                                                        IndirizzoIstituto : RecordIstituto[8].xSQL(),
                                                        ProvinciaIstituto : RecordIstituto[3],
                                                        ComuneIstituto    : RecordIstituto[11].xSQL(),
                                                        CapIstituto       : RecordIstituto[9].xSQL(),
                                                        EmailIstituto     : RecordIstituto[16].xSQL(),
                                                        PecIstituto       : RecordIstituto[17].xSQL(),
                                                        SitoWebIstituto   : RecordIstituto[18].xSQL(),
                                                        SedeIstituto      : RecordIstituto[14].xSQL() == 'SI' ? 1 : 0,
                                                        TipologiaIstituto : RecordIstituto[13].xSQL()                                                          
                                                      }
                                        }); 
            }                                              
            $scope.Contatore++;            
            if($ObjQuery.Operazioni.length == 10)
            {
              SystemInformation.PostSQL('Institute',$ObjQuery,SendDieciIstituti,false,true);  
              $ObjQuery.Operazioni = [];
              return;
            }
          }
          if($ObjQuery.Operazioni.length != 0 && $ObjQuery.Operazioni.length < 10)
             SystemInformation.PostSQL('Institute',$ObjQuery,function() 
             { 
               $scope.Contatore = 0;
               alert ('UPLOAD ESEGUITO!');                                                               
             },false,true)                                                                 
        } 
        SystemInformation.GetSQL('Accessories',{}, function(Results)
        { 
          ListaProvince = SystemInformation.FindResults(Results,'ProvinceList');
          if (ListaProvince != undefined) 
          {
            SystemInformation.GetSQL('InstituteExclType', {}, function(Results)  
            { 
                ListaTipologieEscluse = SystemInformation.FindResults(Results,'InstituteExclTypeInfoList');
                if(ListaTipologieEscluse != undefined)
                   SendDieciIstituti();            
                else SystemInformation.ApplyOnError('Modello tipologie escluse non conforme','')
            })
          }                
          else SystemInformation.ApplyOnError('Modello province non conforme','');          
        });                  
      }
    }          
    reader.readAsDataURL(file);          
  }
    
  $scope.CaricaDocumento = function()
  { 
    document.getElementById('fileLoadCVSDocument').click();    
  }
  
}]);