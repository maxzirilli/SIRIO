SIRIOApp.controller("inventoryManagementController",['$scope','SystemInformation','$state','$mdDialog','ZConfirm',function($scope,SystemInformation,$state,$mdDialog,ZConfirm)
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

  $scope.ResetInventario = function()
  {
    var PrimaConferma = function()
    {
      ZConfirm.GetConfirmBox('AVVISO',"SEI SICURO DI ESEGUIRE IL RESET DELL'INVENTARIO? L'OPERAZIONE E' IRREVERSIBILE!",SecondaConferma,function(){});      
    }
    var SecondaConferma = function()
    {      
      $ObjQuery = { Operazioni : [] };
      $ObjQuery.Operazioni.push({
                                  Query     : 'ResetAllInventory',
                                  Parametri : {}
                                })
      SystemInformation.PostSQL('Book',$ObjQuery,function(Answer)
      {
        ZCustomAlert($mdDialog,'AVVISO','I MAGAZZINI SONO STATI STATO RESETTATI CON SUCCESSO!');
        $ObjQuery = {};
      })   
    }
    ZConfirm.GetConfirmBox('AVVISO','Questa operazione eseguirà il reset di tutte le quantità dei titoli nel magazzino e nel magazzino volante. Confermi?',PrimaConferma,function(){});      
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
                                    QuantitaTitoloVol : ListaTitoliAllTmp[i].QUANTITA_MGZN_VOL,
                                    Ubicazione        : ListaTitoliAllTmp[i].POS_MAGAZZINO == null ? 'N.D.' : ListaTitoliAllTmp[i].POS_MAGAZZINO
                                  }
            $scope.ListaTitoliAll = ListaTitoliAllTmp
    }
    else SystemInformation.ApplyOnError('Modello lista titoli inventario non conforme','')
  },'SelectAllTitoliInventario')

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
       $scope.CodiceFocused = {Chiave : -1, Codice : -1, Nome : '', QuantitaMgzn : 0, QuantitaMgznVol : 0, UbicazioneMgzn : '', ModificaAbilitata : false};

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
            ZCustomAlert($mdDialog,'ATTENZIONE',"NESSUN TITOLO IN MAGAZZINO ASSOCIATO A QUESTO TITOLO! SI CONSIGLIA DI CONTROLLARE IL DATABASE O DI VERIFICARE L'INSERIMENTO DEL CODICE!")
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
                 $scope.CodiceFocused                 = {Codice : 0, Nome : '', QuantitaMgzn : 0, QuantitaMgznVol : 0, ModificaAbilitata : false};
                 $scope.CodiceFocused.Chiave          = TitoloTrovato.ChiaveTitolo;
                 $scope.CodiceFocused.Codice          = $scope.CodiceBippato;
                 $scope.CodiceFocused.Nome            = TitoloTrovato.NomeTitolo;
                 $scope.CodiceFocused.QuantitaMgzn    = 1;
                 $scope.CodiceFocused.QuantitaMgznVol = 0;
                 $scope.CodiceFocused.Ubicazione      = TitoloTrovato.UbicazioneMgzn
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
        var Procedi = function()
        {
          ZConfirm.GetConfirmBox('AVVISO',"CONFERMI?",ProcediFinale,function(){});
        }
        var ProcediFinale = function()
        {
          $scope.ListaCodiciToHandle = [];
          $scope.CodiceBippato       = '';
          $scope.CodiceFocused = undefined;
          $state.go("startPage");
        }
        ZConfirm.GetConfirmBox('AVVISO',"SEI SICURO DI VOLER ANNULLARE TUTTI GLI INSERIMENTI ESEGUITI?",Procedi,function(){});
    }
  }

  $scope.ConfermaGestioneInventario = function()
  {
     $ObjQuery = {Operazioni : [] }
     for(let i = 0;i < $scope.ListaCodiciToHandle.length;i ++)
     {
         ParametriInserimento = {
                                  ChiaveTitolo             : $scope.ListaCodiciToHandle[i].Chiave,
                                  QuantitaTitolo           : $scope.ListaCodiciToHandle[i].QuantitaMgzn,
                                  QuantitaVolanteTitolo    : $scope.ListaCodiciToHandle[i].QuantitaMgznVol,
                                  PosizioneMagazzinoTitolo : $scope.ListaCodiciToHandle[i].Ubicazione
                                }
         $ObjQuery.Operazioni.push({
                                     Query     : "UpdateBookFromInventory",
                                     Parametri : ParametriInserimento
                                   })
     }
     SystemInformation.PostSQL('Book',$ObjQuery,function(Answer)
     {
       ZCustomAlert($mdDialog,'AVVISO','AGGIORNAMENTO DEL MAGAZZINO COMPLETATO CON SUCCESSO!')
      
       $scope.ListaCodiciToHandle.sort(function(a,b)
       {
         let TitoloA = a.Nome;
         let TitoloB = b.Nome;
         return (TitoloA < TitoloB) ? -1 : (TitoloA > TitoloB) ? 1 : 0;
       });        

       var Data           = new Date();
       var DataAnno       = Data.getFullYear();
       var DataMese       = Data.getMonth()+1; 
       var DataGiorno     = Data.getDate();
       var DataInventario = DataGiorno.toString() + '/' + DataMese.toString() +  '/' + DataAnno.toString();
       var WBook = {
                     SheetNames : [],
                     Sheets     : {}
                   };
                     
       var SheetName   = 'INVENTARIO (DA CODICE) - ' + DataInventario;
       var BodySheet   = {};               
       BodySheet       = {};
       BodySheet['A1'] = SystemInformation.GetCellaIntestazione('ISBN');
       BodySheet['B1'] = SystemInformation.GetCellaIntestazione('TITOLO');
       BodySheet['C1'] = SystemInformation.GetCellaIntestazione('QUANTITA MAGAZZINO');
       BodySheet['D1'] = SystemInformation.GetCellaIntestazione('QUANTITA MAGAZZINO VOLANTE');
       BodySheet['E1'] = SystemInformation.GetCellaIntestazione('UBICAZIONE');
       
       for(let i = 0;i < $scope.ListaCodiciToHandle.length;i ++)
       {                
           BodySheet['A' + parseInt(i + 2)] = SystemInformation.GetCellaDati('s',$scope.ListaCodiciToHandle[i].Codice);
           BodySheet['B' + parseInt(i + 2)] = SystemInformation.GetCellaDati('s',$scope.ListaCodiciToHandle[i].Nome);
           BodySheet['C' + parseInt(i + 2)] = SystemInformation.GetCellaDati('s',$scope.ListaCodiciToHandle[i].QuantitaMgzn.toString());
           BodySheet['D' + parseInt(i + 2)] = SystemInformation.GetCellaDati('s',$scope.ListaCodiciToHandle[i].QuantitaMgznVol.toString());
           BodySheet['E' + parseInt(i + 2)] = SystemInformation.GetCellaDati('s',$scope.ListaCodiciToHandle[i].Ubicazione);
       }   
       
       BodySheet["!cols"] = [             
                             {wpx: 300},
                             {wpx: 300},
                             {wpx: 300},
                             {wpx: 300},
                             {wpx: 300}
                           ];
       
       BodySheet['!ref'] = 'A1:E1' + parseInt($scope.ListaCodiciToHandle.length + 1);
       
       WBook.SheetNames.push(SheetName);
       WBook.Sheets[SheetName] = BodySheet;            
       
       var wbout = XLSX.write(WBook, {bookType:'xlsx', bookSST:true, type: 'binary'});
       saveAs(new Blob([SystemInformation.s2ab(wbout)],{type:"application/octet-stream"}),"InventarioDaCodiceXLS" + DataInventario + ".xlsx");            
       
       $scope.ListaCodiciToHandle = [];
       $scope.CodiceBippato       = '';
       $scope.CodiceFocused       = undefined;
       $state.go("startPage")
     })
  }

}]);