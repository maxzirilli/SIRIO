SIRIOApp.controller("adoptionDeadlinePageController",['$scope','SystemInformation','$state','$rootScope','$mdDialog','ZConfirm',function($scope,SystemInformation,$state,$rootScope,$mdDialog,ZConfirm)
{
  $scope.ListaCodici = '';

  ScopeHeaderController.CheckButtons();

  function Base64DecodeUnicode(str) 
  {
    percentEncodedStr = atob(str).split('').map(function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''); 
    return decodeURIComponent(percentEncodedStr);
  } 

  $scope.CaricaCodici = function()
  { 
    $scope.ListaCodici = '';
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
        
        var CreaLista = function()
        {
          while (i < CsvSplitted.length)          
          {
            let RecordCodice  = CsvSplitted[i++].split(";");
            RecordCodice[0]   = RecordCodice[0].trim();
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

      if(ListaAdozioniInScadenza.length != 0)
      {           
        var WBook = {
                      SheetNames : [],
                      Sheets     : {}
                    };
    
        var SheetName          = "ADOZIONI IN SCADENZA";
        var BodySheet          = {}; 
        
        BodySheet['A1'] = SystemInformation.GetCellaIntestazione('CODICE_ISBN');
        BodySheet['B1'] = SystemInformation.GetCellaIntestazione('TITOLO');
        BodySheet['C1'] = SystemInformation.GetCellaIntestazione('ISTITUTO');
        BodySheet['D1'] = SystemInformation.GetCellaIntestazione('PROMOTORE');

        //var ChiaveTitolo = -1;
        var CountRighe = 0;
        for(let i = 0;i < ListaAdozioniInScadenza.length;i ++)
        {         
            //if(ChiaveTitolo != ListaAdozioniInScadenza[i].Titolo.Chiave)
            //{
              //BodySheet['A' + parseInt(CountRighe + 2)] = SystemInformation.GetCellaDati('s',ListaAdozioniInScadenza[i].Codice);
              //BodySheet['B' + parseInt(CountRighe + 2)] = SystemInformation.GetCellaDati('s',ListaAdozioniInScadenza[i].Titolo);
            //}
            //ChiaveTitolo = ListaAdozioniInScadenza[i].Chiave;
            
            for(let j = 0;j < ListaAdozioniInScadenza[i].ListaIstituti.length;j++)
            {              
                BodySheet['A' + parseInt(CountRighe + 2)] = SystemInformation.GetCellaDati('s',ListaAdozioniInScadenza[i].Codice);
                BodySheet['B' + parseInt(CountRighe + 2)] = SystemInformation.GetCellaDati('s',ListaAdozioniInScadenza[i].Titolo);
                BodySheet['C' + parseInt(CountRighe + 2)] = SystemInformation.GetCellaDati('s',ListaAdozioniInScadenza[i].ListaIstituti[j].Istituto);
                BodySheet['D' + parseInt(CountRighe + 2)] = SystemInformation.GetCellaDati('s',ListaAdozioniInScadenza[i].ListaIstituti[j].Promotore);
                CountRighe++;
            }
        }
    
        BodySheet["!cols"] = [ 
                              {wpx: 150},            
                              {wpx: 400},
                              {wpx: 400},
                              {wpx: 250}
                            ];
    
        BodySheet['!ref'] = 'A1:D1' + CountRighe + 1;
        
        WBook.SheetNames.push(SheetName);
        WBook.Sheets[SheetName] = BodySheet;
    
        var Data           = new Date();
        var DataAnno       = Data.getFullYear();
        var DataMese       = Data.getMonth()+1; 
        var DataGiorno     = Data.getDate();
        var DataDocumento  = DataGiorno.toString() + '/' + DataMese.toString() +  '/' + DataAnno.toString();
    
        var wbout = XLSX.write(WBook, {bookType:'xlsx', bookSST:true, type: 'binary'});

        $scope.ListaCodici = '';
        saveAs(new Blob([SystemInformation.s2ab(wbout)],{type:"application/octet-stream"}), 'AdozioniInScadenza' + DataDocumento + ".xlsx")
      }
      else ZCustomAlert($mdDialog,'AVVISO','NESSUNA ADOZIONE TROVATA CON I CODICI INSERITI!');
    }); 
  }

}]);