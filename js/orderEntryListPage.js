SIRIOApp.controller("orderEntryPageController",['$scope','SystemInformation','$state','$rootScope', function($scope,SystemInformation,$state,$rootScope)
{

  $scope.EditingOn        = false;
  $scope.OrdineInEditing  = {};
  $scope.ListaOrdini      = [];  
  $scope.ListaTitoli      = []; 
  
  ScopeHeaderController.CheckButtons();
  
  $scope.ConvertiData = function (Dati)
  {
     return( ZFormatDateTime('dd/mm/yyyy',ZDateFromHTMLInput(Dati.Data)));
  }
  
  $scope.RefreshListaOrdini = function()
  {
    SystemInformation.GetSQL('OrderEntry', {}, function(Results)  
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
                                    Quantita    : OrdiniInfoLista[i].QUANTITA  
                                  }         
         $scope.ListaOrdini = OrdiniInfoLista;
         $scope.ConvertiData($scope.ListaOrdini);
      }
      else SystemInformation.ApplyOnError('Modello ordini non conforme','');   
    });
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
  
  SystemInformation.GetSQL('Book', {}, function(Results)  
  {  
    TitoliInfoLista = SystemInformation.FindResults(Results,'BookListFilter');
    if(TitoliInfoLista != undefined)
    { 
       for(let i = 0; i < TitoliInfoLista.length; i++)
           TitoliInfoLista[i] = { 
                                  Chiave : TitoliInfoLista[i].CHIAVE,
                                  Nome   : TitoliInfoLista[i].TITOLO,
                                  Codice : TitoliInfoLista[i].CODICE_ISBN
                                }
       $scope.ListaTitoli  = TitoliInfoLista;
    }
    else SystemInformation.ApplyOnError('Modello titoli non conforme','');   
  });
  
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
         alert('DATI MANCANTI');      
     var $ObjQuery   = { Operazioni : [] };          
     var ParamOrdine = {
                         CHIAVE   : $scope.OrdineInEditing.Chiave,
                         DATA     : $scope.OrdineInEditing.Data,
                         TITOLO   : $scope.OrdineInEditing.Titolo == -1 ? null : $scope.OrdineInEditing.Titolo,
                         QUANTITA : $scope.OrdineInEditing.Quantita == -1 ? null : $scope.OrdineInEditing.Quantita 
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
    if(confirm('Eliminare l\'ordine di ' + Ordine.Quantita + ' "' + Ordine.Nome_Titolo + '" ?'))
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
  }  
  
  $scope.RefreshListaOrdini();


}]);