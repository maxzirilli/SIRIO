SIRIOApp.controller("adoptionDeadlinePageController",['$scope','SystemInformation','$state','$rootScope','$mdDialog','ZConfirm', function($scope,SystemInformation,$state,$rootScope,$mdDialog,ZConfirm)
{ 
  $scope.ListaCodici = '';

  SystemInformation.GetSQL('Book', {}, function(Results)  
  {  
    TitoliInfoLista = SystemInformation.FindResults(Results,'BookListFilter');
    if(TitoliInfoLista != undefined)
    { 
       for(let i = 0; i < TitoliInfoLista.length; i++)
           TitoliInfoLista[i] = { 
                                  Chiave    : TitoliInfoLista[i].CHIAVE,
                                  Nome      : TitoliInfoLista[i].TITOLO,
                                  Codice    : TitoliInfoLista[i].CODICE_ISBN
                                }
       $scope.ListaTitoli = TitoliInfoLista;
    }
    else SystemInformation.ApplyOnError('Modello titoli non conforme','');   
  },'SelectSQLFilter');

  function Base64DecodeUnicode(str) 
  {
    percentEncodedStr = atob(str).split('').map(function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''); 
    return decodeURIComponent(percentEncodedStr);
  } 

  $scope.CaricaCodici = function()
  { 
    document.getElementById('fileLoadCVSDocument').click();    
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
        var i              = 0;
        $scope.ListaCodici = '';
        
        var CreaLista = function()
        {
          while (i < CsvSplitted.length - 1)          
          {
            let RecordCodice  = CsvSplitted[i++].split(";");
            RecordCodice[0]   = RecordCodice[0].trim();
            /*let TitoloCorrisp = $scope.ListaTitoli.find(function(ATitolo) {return(ATitolo.Codice == RecordCodice[0]);});
            if (TitoloCorrisp != undefined)
            {
                $scope.ListaCodici += RecordCodice[0] + '\n';
            }
            else            
            {                                    
            }*/
            $scope.ListaCodici += RecordCodice[0] + '\n';                                              
          }                                                           
        }
        CreaLista();        
      }
    }          
    reader.readAsDataURL(file);          
  }
  
  $scope.InviaCodici = function()
  {
    var ListaParametro =  $scope.ListaCodici.replace(/\s/gm,",");

    SystemInformation.ExecuteExternalScript('SIRIOExtraAdoption',{ListaCodici : ListaParametro},function(Answer) 
    {
      var ListaAdozioniInScadenza = Answer.ListaAdozioniInScadenza; 
    }); 
  }
}]);