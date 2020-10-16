SIRIOApp.controller("inventoryManagementController",['$scope','SystemInformation','$state',function($scope,SystemInformation,$state)
{
 
  $scope.ListaTitoliAll      = [];
  $scope.ListaCodiciToHandle = [];
  $scope.CodiceBippato       = '';

  ScopeHeaderController.CheckButtons();

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
   
  $scope.IsAdministrator = function ()
  {
    return SystemInformation.UserInformation.Ruolo == RUOLO_AMMINISTRATORE;
  }

  SystemInformation.GetSQL('Book',{},function(Results)
  {
    ListaTitoliAllTmp = SystemInformation.FindResults(Results,'BookListInventoryAll')
    if(ListaTitoliAllTmp != undefined)
    {
       for(let i = 0;i < ListaTitoliAllTmp.length;i ++)
           ListaTitoliAllTmp[i] = {
                                    ChiaveTitolo      : ListaTitoliAllTmp[i].CHIAVE,
                                    CodiceTitolo      : ListaTitoliAllTmp[i].CODICE_ISBN,
                                    NomeTitolo        : ListaTitoliAllTmp[i].TITOLO,
                                    QuantitaTitolo    : ListaTitoliAllTmp[i].QUANTITA_MGZN,
                                    QuantitaTitoloVol : ListaTitoliAllTmp[i].QUANTITA_MGZN_VOL
                                  }
            $scope.ListaTitoliAll = ListaTitoliAllTmp
    }
    else SystemInformation.ApplyOnError('Modello lista titoli inventario non conforme','')
  },'SelectAllTitoliInventario')

  /*$scope.ModificaInserimento = function(Titolo)
  {
    if(!Titolo.ModificaAbilitata)
       Titolo.ModificaAbilitata = true;
    else Titolo.ModificaAbilitata = false;
  }*/

  $scope.EliminaInserimento = function(Inserimento)
  {
    InserimentoTrovato = $scope.ListaCodiciToHandle.findIndex(function(ACodice){return(ACodice.Codice == Inserimento.Codice);});
    $scope.ListaCodiciToHandle.splice(InserimentoTrovato,1);
    if($scope.CodiceBippato == Inserimento.Codice)
    {
       $scope.CodiceBippato = '';
       $scope.CodiceFocused = undefined;
    }   
  }

  $scope.ResetIsbnInput = function()
  {
    $scope.CodiceBippatoVisible = '';
    //$scope.CodiceFocused = undefined;
  }
  

  $scope.AggiungiInserimento = function(KeyPressed)
  {
    $scope.CodiceBippato = $scope.CodiceBippatoVisible;
    
    if($scope.CodiceFocused == undefined)
       $scope.CodiceFocused = {Chiave : -1, Codice : -1, Nome : '', QuantitaMgzn : 0, QuantitaMgznVol : 0, ModificaAbilitata : false};

    if(KeyPressed.keyCode == 13)
    {
      if($scope.CodiceFocused.Codice == $scope.CodiceBippato)
      {
         var TitoloInLista = $scope.ListaCodiciToHandle.findIndex(function(ACodice){return(ACodice.Codice == $scope.CodiceBippato);});
         if(TitoloInLista != undefined)
         {
            $scope.ListaCodiciToHandle[TitoloInLista].QuantitaMgzn += 1;
         }
         $scope.CodiceBippato = $scope.CodiceFocused.Codice;
      }
      else
      {
           var TitoloTrovato = $scope.ListaTitoliAll.find(function(ACodice){return(ACodice.CodiceTitolo == $scope.CodiceBippato);});
           if(TitoloTrovato == undefined)
           {
             alert("NESSUN TITOLO IN MAGAZZINO ASSOCIATO A QUESTO TITOLO! SI CONSIGLIA DI CONTROLLARE IL DATABASE O DI VERIFICARE L'INSERIMENTO DEL CODICE")
             $scope.CodiceBippato = '';
             return
           }
           else
           {
              var TitoloInLista = $scope.ListaCodiciToHandle.findIndex(function(ACodice){return(ACodice.Codice == $scope.CodiceBippato);});
              if(TitoloInLista != -1)
              {
                 $scope.ListaCodiciToHandle[TitoloInLista].QuantitaMgzn += 1;
                 $scope.CodiceBippato = $scope.ListaCodiciToHandle[TitoloInLista].Codice;
              }
              else
              {
                 alert('TITOLO CORRISPONDENTE : ' + TitoloTrovato.NomeTitolo.toUpperCase())
                 $scope.CodiceFocused                 = {Codice : 0, Nome : '', QuantitaMgzn : 0, QuantitaMgznVol : 0, ModificaAbilitata : false};
                 $scope.CodiceFocused.Chiave          = TitoloTrovato.ChiaveTitolo;
                 $scope.CodiceFocused.Codice          = $scope.CodiceBippato;
                 $scope.CodiceFocused.Nome            = TitoloTrovato.NomeTitolo;
                 $scope.CodiceFocused.QuantitaMgzn    = 1;
                 $scope.CodiceFocused.QuantitaMgznVol = 0;
                 if($scope.CodiceBippato != -1)
                    $scope.ListaCodiciToHandle.push($scope.CodiceFocused);
                 $scope.CodiceBippato = $scope.CodiceFocused.Codice;
              }
            }
      }
      $scope.CodiceBippatoVisible = '';
    }  
  }

  $scope.ChiudiGestioneInventario = function()
  {
    if ($scope.ListaCodiciToHandle.length == 0)
    {
        $scope.ListaCodiciToHandle = [];
        $scope.CodiceBippato       = '';
        $scope.CodiceFocused       = undefined;
        $state.go("startPage")
    }
    else
    {
        if(confirm("SEI SICURO DI VOLER ANNULLARE TUTTI GLI INSERIMENTI ESEGUITI?"))
           if(confirm("CONFERMI?"))
           {
             $scope.ListaCodiciToHandle = [];
             $scope.CodiceBippato       = '';
             $scope.CodiceFocused = undefined;
             $state.go("startPage");
           }
    }
  }

  $scope.ConfermaGestioneInventario = function()
  {
     $ObjQuery = {Operazioni : [] }
     for(let i = 0;i < $scope.ListaCodiciToHandle.length;i ++)
     {
         ParametriInserimento = {
                                  ChiaveTitolo          : $scope.ListaCodiciToHandle[i].Chiave,
                                  QuantitaTitolo        : $scope.ListaCodiciToHandle[i].QuantitaMgzn,
                                  QuantitaVolanteTitolo : $scope.ListaCodiciToHandle[i].QuantitaMgznVol
                                }
         $ObjQuery.Operazioni.push({
                                     Query     : "UpdateBookFromInventory",
                                     Parametri : ParametriInserimento
                                   })
     }
     SystemInformation.PostSQL('Book',$ObjQuery,function(Answer)
     {
       alert('AGGIORNAMENTO DEL MAGAZZINO COMPLETATO CON SUCCESSO')
       $scope.ListaCodiciToHandle = [];
       $scope.CodiceBippato       = '';
       $scope.CodiceFocused       = undefined;
       $state.go("startPage")
     })
  }

}]);