SIRIOApp.controller("csvTeacherController",['$scope','SystemInformation','$state','$rootScope','$mdDialog',
function($scope,SystemInformation,$state,$rootScope,$mdDialog)
{
  ScopeHeaderController.CheckButtons();
  $scope.Contatore = 0;
  $scope.FileLength = 0;  
  
  function Base64DecodeAnsi(str) 
  { 
    percentEncodedStr = atob(str);
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
        var CsvSplitted    = (Base64DecodeAnsi(Csv[1])).split("\n");
        var $ObjQuery      = { Operazioni : [] };          
        $scope.FileLength  = CsvSplitted.length - 1;
        $scope.Contatore   = 0;
        var i = 2;        
        var LybroKey = -1;
        var MaterieDocente = [];
        
        var UpdateMaterieDocente = function(Docente)
        {
           if(Docente != -1)
           {
             for (let j = 0; j < MaterieDocente.length; j ++)
             {
               $ObjQuery.Operazioni.push({ 
                                           Query     : "UpdateSubjectTeacherLybro",
                                           Parametri : { 
                                                         DocenteLKey  : Docente,
                                                         MateriaLybro : MaterieDocente[j]
                                                       }                                        
                                         });
             }
             MaterieDocente = [];
           }
        }
         
        var SendDieciQuery = function()
        {
          while (i < CsvSplitted.length - 1)
          {
            let RecordDocente = CsvSplitted[i++].split(";");
            let Provincia     = ListaProvince.find(function(AProvincia){return(AProvincia.NOME == RecordDocente[19]);});
            let ProvinciaDoc  = ListaProvinceAll.find(function(AProvinciaDoc){return(AProvinciaDoc.NOME == RecordDocente[5]);});
            RecordDocente[19] = RecordDocente[19].trim();
            RecordDocente[5]  = RecordDocente[5].trim();            
           
            if (LybroKey != RecordDocente[0] && ProvinciaDoc != undefined)
            {
                UpdateMaterieDocente(LybroKey);
                RecordDocente[1] = RecordDocente[1].trim();
                RecordDocente[2] = RecordDocente[2].trim();
                RecordDocente[5] = ProvinciaDoc.CHIAVE;
                $ObjQuery.Operazioni.push({
                                           Query     : "InsertTeacherLybro",
                                           Parametri : {
                                                         RAGIONE_SOCIALE : RecordDocente[1].xSQL(),
                                                         TITOLO          : RecordDocente[2].xSQL() == '' ? null : RecordDocente[2].xSQL(),
                                                         TEL_PRIMO       : RecordDocente[7].xSQL() == '' ? null : RecordDocente[7].xSQL(),
                                                         TEL_SECONDO     : RecordDocente[9].xSQL() == '' ? null : RecordDocente[9].xSQL(),
                                                         TEL_TERZO       : RecordDocente[11].xSQL() == '' ? null : RecordDocente[11].xSQL(),
                                                         PIATTAFORMA     : 'N',
                                                         INDIRIZZO       : RecordDocente[3].xSQL() == '' ? null : RecordDocente[3].xSQL(),
                                                         COMUNE          : RecordDocente[4].xSQL() == '' ? null : RecordDocente[4].xSQL(),
                                                         CAP             : RecordDocente[6].xSQL() == '' ? null : RecordDocente[6].xSQL(),
                                                         PROVINCIA       : RecordDocente[5].xSQL() == '' ? null : RecordDocente[5].xSQL(),
                                                         LYBRO_KEY       : parseInt(RecordDocente[0].xSQL())                                                         
                                                       },
                                           ResetKeys : [1]
                                         });
               LybroKey = RecordDocente[0];
            }
            RecordDocente[34] = RecordDocente[34].trim();
            MateriaToAdd = RecordDocente[34].xSQL();
            if(MateriaToAdd != '')
               MaterieDocente.push(MateriaToAdd);
            
            if (Provincia != undefined && RecordDocente[15] != '')
            {
              RecordDocente[15] = RecordDocente[15].trim();
              RecordDocente[16] = RecordDocente[16].trim();
              RecordDocente[19] = Provincia.CHIAVE;                
              $ObjQuery.Operazioni.push({
                                         Query     : "UpdateDatabaseInstituteFromTeacher",
                                         Parametri : {                                                   
                                                       CodiceIstituto    : RecordDocente[15].xSQL(),  
                                                       NomeIstituto      : RecordDocente[16].xSQL() == '' ? null : RecordDocente[16].xSQL(),
                                                       IndirizzoIstituto : RecordDocente[17].xSQL() == '' ? null : RecordDocente[17].xSQL(),
                                                       ComuneIstituto    : RecordDocente[18].xSQL() == '' ? null : RecordDocente[18].xSQL(),
                                                       ProvinciaIstituto : RecordDocente[19].xSQL() == '' ? null : RecordDocente[19].xSQL(),
                                                       EmailIstituto     : RecordDocente[29].xSQL() == '' ? null : RecordDocente[29].xSQL(),
                                                       SitoWebIstituto   : RecordDocente[30].xSQL() == '' ? null : RecordDocente[30].xSQL(),
                                                       CapIstituto       : RecordDocente[20].xSQL() == '' ? null : RecordDocente[20].xSQL(),
                                                       PresideIstituto   : RecordDocente[31].xSQL() == '' ? null : RecordDocente[31].xSQL(),
                                                       VicePresIstituto  : RecordDocente[32].xSQL() == '' ? null : RecordDocente[32].xSQL(),
                                                       DirAmmIstituto    : RecordDocente[33].xSQL() == '' ? null : RecordDocente[33].xSQL(),
                                                       Telefono1         : RecordDocente[21].xSQL() == '' ? null : RecordDocente[21].xSQL(),
                                                       Referente1        : RecordDocente[22].xSQL() == '' ? null : RecordDocente[22].xSQL(), 
                                                       Telefono2         : RecordDocente[23].xSQL() == '' ? null : RecordDocente[23].xSQL(),
                                                       Referente2        : RecordDocente[24].xSQL() == '' ? null : RecordDocente[24].xSQL(),
                                                       Telefono3         : RecordDocente[25].xSQL() == '' ? null : RecordDocente[25].xSQL(),
                                                       Referente3        : RecordDocente[26].xSQL() == '' ? null : RecordDocente[26].xSQL(),
                                                       DocenteLybro      : parseInt(RecordDocente[0].xSQL())                                                      
                                                     }
                                       });                                       
            }
            $scope.Contatore ++;
            if($ObjQuery.Operazioni.length > 10)
            {
              SystemInformation.PostSQL('Teacher',$ObjQuery,SendDieciQuery,false,true); 
              $ObjQuery.Operazioni = [];
              return; 
            }
          }
          UpdateMaterieDocente(LybroKey);
          if($ObjQuery.Operazioni.length < 10)
             SystemInformation.PostSQL('Teacher',$ObjQuery,function() 
             { 
               $scope.Contatore = 0;
               document.getElementById('fileLoadCSVDocument').value = null;
               ZCustomAlert($mdDialog,'OK','UPLOAD ESEGUITO')                                                                
             },false,true)
        }             
        SystemInformation.GetSQL('Accessories',{},function(Results)
        {
          ListaProvince       = SystemInformation.FindResults(Results,'ProvinceList');
          ListaProvinceAll    = SystemInformation.FindResults(Results,'ProvinceListAll');
          if (ListaProvince != undefined && ListaProvinceAll != undefined) 
          {
              SendDieciQuery();
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