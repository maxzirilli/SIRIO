SIRIOApp.controller("orderEntryPageController",['$scope','SystemInformation','$state','$rootScope','$filter','$mdDialog','ZConfirm',function($scope,SystemInformation,$state,$rootScope,$filter,$mdDialog,ZConfirm)
{

  $scope.EditingOn             = false;
  $scope.TitoloFiltro          = -1;
  $scope.OrdineInEditing       = {};
  $scope.ListaOrdini           = [];  
  $scope.ListaTitoli           = [];
  $scope.Data                  = {};
  $scope.Data.DataRicercaAl    = new Date();
  let TmpDate                  = new Date($scope.Data.DataRicercaAl);
  TmpDate.setDate(TmpDate.getDate() - 7);
  $scope.Data.DataRicercaDal   = new Date(TmpDate);  
  
  ScopeHeaderController.CheckButtons();

  SystemInformation.GetSQL('Book', {}, function(Results)  
  {  
    TitoliInfoLista = SystemInformation.FindResults(Results,'BookListFilter');
    if(TitoliInfoLista != undefined)
    { 
       for(let i = 0; i < TitoliInfoLista.length; i++)
           TitoliInfoLista[i] = { 
                                  Chiave    : TitoliInfoLista[i].CHIAVE,
                                  Nome      : TitoliInfoLista[i].TITOLO,
                                  Codice    : TitoliInfoLista[i].CODICE_ISBN,
                                  Posizione : TitoliInfoLista[i].POS_MAGAZZINO
                                }
       $scope.ListaTitoli  = TitoliInfoLista;
       $scope.ListaTitoliF = TitoliInfoLista;
    }
    else SystemInformation.ApplyOnError('Modello titoli non conforme','');   
  },'SelectSQLFilter');
    
  var TroncaTitolo = function(str, n)
  {
    return (str.length > n) ? str.substr(0, n-1) + '(...)' : str;
  };   
  
  function Base64DecodeUnicode(str) 
  {
    percentEncodedStr = atob(str).split('').map(function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''); 
    return decodeURIComponent(percentEncodedStr);
  } 

  $scope.ConvertiData = function (Dati)
  {
     return( ZFormatDateTime('dd/mm/yyyy',ZDateFromHTMLInput(Dati.Data)));
  }
  
  $scope.GridOptions = {
                         rowSelection    : false,
                         multiSelect     : true,
                         autoSelect      : true,
                         decapitate      : false,
                         largeEditDialog : false,
                         boundaryLinks   : false,
                         limitSelect     : true,
                         pageSelect      : true,
                         query           : {
                                             limit: 10,
                                             page: 1
                                           },
                         limitOptions    : [10, 20, 30]
                       };
    
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
        var ListaCarico    = [];        
        var i = 0;
        
        var CreaOrdine = function()
        {
          while (i < CsvSplitted.length - 1)          
          {
            let RecordOrdine  = CsvSplitted[i++].split(";");
            RecordOrdine[0]   = RecordOrdine[0].trim();
            RecordOrdine[1]   = RecordOrdine[1].trim();            
            let TitoloCorrisp = $scope.ListaTitoli.find(function(ATitolo) {return(ATitolo.Codice == RecordOrdine[0]);});
            if (TitoloCorrisp == undefined)
            {
              ZCustomAlert($mdDialog,'ATTENZIONE',"IMPOSSIBILE ESEGUIRE IL CARICO,IL TITOLO CON CODICE ISBN >> ' + RecordOrdine[0] + ' << NON E' DI UN EDITORE GESTITO");
              return
            }
            else            
            { 
              $ObjQuery.Operazioni.push({ 
                                          Query     : 'InsertOrderEntry',
                                          Parametri : { 
                                                        CHIAVE    : -1,
                                                        DATA      : new Date(),                                        
                                                        TITOLO    : TitoloCorrisp.Chiave,
                                                        QUANTITA  : RecordOrdine[1]                                                                                                                
                                                      },
                                          ResetKeys :[1]
                                        });
              
              ListaCarico.push({                                
                                 Quantita   : RecordOrdine[1],
                                 Codice     : RecordOrdine[0],
                                 Nome       : TitoloCorrisp.Nome,
                                 Posizione  : TitoloCorrisp.Posizione == null ? 'N.D.' : TitoloCorrisp.Posizione                               
                               })                                        
            }                                              
            /*if($ObjQuery.Operazioni.length == 10)
            {
              SystemInformation.PostSQL('OrderEntry',$ObjQuery,CreaOrdine,false,true);  
              $ObjQuery.Operazioni = [];
              return;
            }*/
          }
          if($ObjQuery.Operazioni.length != 0)
             SystemInformation.PostSQL('OrderEntry',$ObjQuery,function() 
             { 
                ZCustomAlert($mdDialog,'AVVISO','CARICO ESEGUITO!');
                                       
                var Data           = new Date();
                var DataAnno       = Data.getFullYear();
                var DataMese       = Data.getMonth()+1; 
                var DataGiorno     = Data.getDate();
                var DataCarico     = DataGiorno.toString() + '/' + DataMese.toString() +  '/' + DataAnno.toString();
                
                var doc = new jsPDF();
                doc.setProperties({title: 'CARICO MAGAZZINO ' + DataCarico});
                doc.setFontSize(10); 
                doc.setFontType('bold');
                doc.text(10,20,'CARICO - IN DATA ' + DataCarico);
                
                var CoordY = 30;
                doc.setFontSize(7);
                doc.text(10,CoordY,'QNT');
                doc.text(25,CoordY,'ISBN');
                doc.text(45,CoordY,'TITOLO');
                doc.text(180,CoordY,'UBICAZIONE');
                doc.setFontType('normal');
                CoordY += 5;             
                
                for(let i = 0;i < ListaCarico.length;i ++)
                {
                    if (CoordY >= 280) 
                      {
                        doc.addPage();
                        CoordY = 20;
                        var CoordY = 30;
                        doc.setFontSize(7);
                        doc.text(10,CoordY,'QNT');
                        doc.text(25,CoordY,'ISBN');
                        doc.text(45,CoordY,'TITOLO');
                        doc.text(180,CoordY,'UBICAZIONE');
                        doc.setFontType('normal');
                        CoordY += 5;
                      }
                        doc.setFontType('normal');
                        var Q  = doc.getTextWidth('QNT');
                        var Qt = doc.getTextWidth(ListaCarico[i].Quantita);
                        doc.text(10 + Q + 1 - Qt,CoordY,ListaCarico[i].Quantita);
                        doc.text(25,CoordY,ListaCarico[i].Codice);
                        doc.text(45,CoordY,TroncaTitolo(ListaCarico[i].Nome,75));
                        doc.text(180,CoordY,ListaCarico[i].Posizione);
                        CoordY += 5;
                        doc.setFontSize(6);
                        doc.setFontType('normal');
                        doc.text(10,290,SystemInformation.VDocCarico);
                        doc.setFontSize(7);
                }
                doc.save("CaricoPDF" + DataCarico + ".pdf",{});
                $scope.RefreshListaOrdini()
             },false,true)                                                                 
        }
        CreaOrdine();        
      }
    }          
    reader.readAsDataURL(file);          
  }  
  
  $scope.NuovoOrdineCsv = function()
  { 
    document.getElementById('fileLoadCVSDocument').click();    
  }
  
  $scope.RefreshListaOrdini = function()
  {
    if($scope.Data.DataRicercaDal == undefined || $scope.Data.DataRicercaAl == undefined)
       return;
    let TmpDate = new Date($scope.Data.DataRicercaAl);
    TmpDate.setDate($scope.Data.DataRicercaAl.getDate() + 1);
    
    SystemInformation.GetSQL('OrderEntry', { Dal : ZHTMLInputFromDate($scope.Data.DataRicercaDal), Al : ZHTMLInputFromDate(TmpDate)}, function(Results)  
    {
      OrdiniInfoLista = SystemInformation.FindResults(Results,'OrderEntryInfoList');
      if(OrdiniInfoLista != undefined)
      { 
         for(let i = 0; i < OrdiniInfoLista.length; i ++)
             OrdiniInfoLista[i] = {
                                    Chiave      : OrdiniInfoLista[i].CHIAVE,
                                    Data        : OrdiniInfoLista[i].DATA,   
                                    Titolo      : OrdiniInfoLista[i].TITOLO, 
                                    Nome_Titolo : OrdiniInfoLista[i].NOME_TITOLO,                                   
                                    Quantita    : OrdiniInfoLista[i].QUANTITA,
                                    Codice      : OrdiniInfoLista[i].CODICE                                     
                                  }         
         $scope.ListaOrdini = OrdiniInfoLista;
         $scope.ConvertiData($scope.ListaOrdini);
      }
      else SystemInformation.ApplyOnError('Modello ordini non conforme','');   
    });
  }
  
  $scope.queryTitolo = function(searchTextTit)
  {
     searchTextTit = searchTextTit.toUpperCase();
     return($scope.ListaTitoli.grep(function(Elemento) 
     { 
       return(Elemento.Nome.toUpperCase().indexOf(searchTextTit) != -1 || Elemento.Codice.indexOf(searchTextTit) != -1);
     }));
  }
  
  $scope.selectedItemChangeTitolo = function(itemTit)
  {
    if(itemTit != undefined)
       $scope.OrdineInEditing.Titolo = itemTit.Chiave;      
  }
  
  $scope.queryTitoloMain = function(searchTextTitMain)
  {
     searchTextTitMain = searchTextTitMain.toUpperCase();
     return($scope.ListaTitoliF.grep(function(Elemento) 
     { 
       return(Elemento.Nome.toUpperCase().indexOf(searchTextTitMain) != -1 || Elemento.Codice.indexOf(searchTextTitMain) != -1);
     }));
  }
  
  $scope.selectedItemChangeTitoloMain = function(itemTitMain)
  {
    if(itemTitMain != undefined)
      $scope.TitoloFiltro = itemTitMain.Chiave;
    else $scope.TitoloFiltro = -1;
    $scope.RefreshListaOrdini(); 
  }
  
  $scope.ModificaOrdine = function(Ordine)
  { 
    $scope.EditingOn                   = true; 
    $scope.OrdineInEditing.Chiave      = Ordine.Chiave;
    $scope.OrdineInEditing.Data        = new Date(Ordine.Data);     
    $scope.OrdineInEditing.Titolo      = Ordine.Titolo;
    $scope.OrdineInEditing.Nome_Titolo = Ordine.Nome_Titolo;
    $scope.OrdineInEditing.Quantita    = parseInt(Ordine.Quantita);    
    $scope.TitoloVisualizzato          = $scope.ListaTitoli.find(function(Ordine) {return(Ordine.Chiave == $scope.OrdineInEditing.Titolo);});
  }
  
  $scope.NuovoOrdine = function()
  { 
    $scope.EditingOn = true; 
    $scope.OrdineInEditing = {
                               Chiave   : -1,
                               Data     : new Date(),
                               Titolo   : -1,
                               Quantita : 0                       
                             };
    $scope.TitoloVisualizzato = undefined;
  }
  
  $scope.OnAnnullaOrdineClicked = function()
  {
    $scope.EditingOn = false;
    $scope.RefreshListaOrdini();
  }
  
  $scope.ConfermaOrdine = function()
  {  
     if ($scope.OrdineInEditing.Titolo == -1 && $scope.OrdineInEditing.Quantita == -1)
         ZCustomAlert($mdDialog,'ATTENZIONE','DATI MANCANTI');      
     var $ObjQuery   = { Operazioni : [] };          
     var ParamOrdine = {
                         CHIAVE   : $scope.OrdineInEditing.Chiave,
                         DATA     : $scope.OrdineInEditing.Data,
                         TITOLO   : $scope.OrdineInEditing.Titolo,
                         QUANTITA : $scope.OrdineInEditing.Quantita 
                       }
                     
     var NuovoOrdine = ($scope.OrdineInEditing.Chiave == -1);
     if(NuovoOrdine)     
     {           
       $ObjQuery.Operazioni.push({
                                   Query     : 'InsertOrderEntry',
                                   Parametri : ParamOrdine
                                 }); 
     }
     else
     {
       $ObjQuery.Operazioni.push({
                                   Query     : 'UpdateOrderEntry',
                                   Parametri : ParamOrdine
                                 });
     };
  
     SystemInformation.PostSQL('OrderEntry',$ObjQuery,function(Answer)
     {
       $scope.EditingOn       = false;
       $scope.OrdineInEditing = {};
       $scope.RefreshListaOrdini();
     });  
  }
  
  $scope.EliminaOrdine = function(Ordine)
  {
    var EliminaOrd = function()
    {
      var $ObjQuery   = { Operazioni : [] };
      var ParamOrdine = { CHIAVE     : Ordine.Chiave };
       
      $ObjQuery.Operazioni.push({
                                  Query     : 'DeleteOrderEntry',
                                  Parametri : ParamOrdine
                                });
    
      SystemInformation.PostSQL('OrderEntry',$ObjQuery,function(Answer)
      {
        $scope.RefreshListaOrdini();
      });  
    }
    ZConfirm.GetConfirmBox('AVVISO',"Eliminare l\'ordine di " + Ordine.Quantita + " " + Ordine.Nome_Titolo + " ?",EliminaOrd,function(){});
  }  
  
  $scope.RefreshListaOrdini();

}]);

SIRIOApp.filter('OrdineByFiltro',function()
{
  return function(ListaOrdini,TitoloFiltro)
         {
           if(TitoloFiltro == -1) 
              return(ListaOrdini);
           var ListaFiltrata = [];
           TitoloFiltro = TitoloFiltro.toUpperCase();
           
           var OrdineOk = function(Ordine)
           {  
              var Result = true;
                  
              if(TitoloFiltro != -1)
                 if(Ordine.Titolo != TitoloFiltro)
                    Result = false;
              return(Result);
           }
           
            ListaOrdini.forEach(function(Ordine)
            { 
              if(OrdineOk(Ordine)) 
                 ListaFiltrata.push(Ordine)                       
            });
            
            return(ListaFiltrata);
           
         }
});