SIRIOApp.controller("flyingStoragePageController",['$scope','SystemInformation','$state','$rootScope','$mdDialog',function($scope,SystemInformation,$state,$rootScope,$mdDialog)
{  
  $scope.ListaVolante = [];
  $scope.EditingOn    = false;
  
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
$scope.GridOptions_2 = {
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
  
  $scope.ConvertiData = function (Dati)
  {
     return(ZFormatDateTime('dd/mm/yyyy',ZDateFromHTMLInput(Dati.DATA)));
  }
  
  $scope.RefreshListaMovimenti = function ()
  {
    SystemInformation.GetSQL('FlyingStorage',{},function(Results)
    {
      ListaVolanteTmp = SystemInformation.FindResults(Results,'FlyingInfoList');
      if(ListaVolanteTmp != undefined)
      {
        for(let i = 0; i < ListaVolanteTmp.length;i ++)
            ListaVolanteTmp[i] = {
                                   "CHIAVE"         : ListaVolanteTmp[i].CHIAVE,
                                   "DATA"           : ListaVolanteTmp[i].DATA,
                                   "PROMOTORE"      : ListaVolanteTmp[i].PROMOTORE,
                                   "NOME_PROMOTORE" : ListaVolanteTmp[i].NOME_PROMOTORE
                                 }
            $scope.ListaVolante = ListaVolanteTmp;  
      }
      else SystemInformation.ApplyOnError('Modello lista mag.volante non conforme','');    
    })
  }
  
  $scope.NuovoMovimento = function ()
  {
    $scope.EditingOn                 = true;
    $scope.MovimentoInEditing        = {};
    $scope.MovimentoInEditing.DATA   = new Date();
    $scope.MovimentoInEditing.CHIAVE = -1;
    $scope.ListaCarico               = [];
    $scope.ListaCaricoEliminati      = [];
    
    SystemInformation.GetSQL('Accessories', {}, function(Results)  
    {  
      TitoliInfoLista = SystemInformation.FindResults(Results,'BookList');
      if(TitoliInfoLista != undefined)
      { 
         for(let i = 0; i < TitoliInfoLista.length; i++)
             TitoliInfoLista[i] = { 
                                    Chiave        : TitoliInfoLista[i].CHIAVE,
                                    Nome          : TitoliInfoLista[i].TITOLO,
                                    Codice        : TitoliInfoLista[i].CODICE_ISBN,
                                    Quantita_Mgzn : TitoliInfoLista[i].QUANTITA_MGZN
                                  }
         $scope.ListaTitoli = TitoliInfoLista;
      }
      else SystemInformation.ApplyOnError('Modello titoli non conforme','');   
    },'SelectTitoliSQL');
  }
  
  $scope.EliminaMovimento = function (Movimento) 
  {
   if(confirm('Eliminare il movimento della data ' + Movimento.DATA + ' ?'))
   {
     var $ObjQuery       = { Operazioni : [] };
     var ParamMovimento  = { CHIAVE : Movimento.CHIAVE };
     
     $ObjQuery.Operazioni.push({
                                 Query     : 'DeleteMovementBookAll',
                                 Parametri : ParamMovimento
                               });  

     $ObjQuery.Operazioni.push({
                                 Query     : 'DeleteMovement',
                                 Parametri : ParamMovimento
                               });
     
     SystemInformation.PostSQL('FlyingStorage',$ObjQuery,function(Answer)
     {
       $scope.RefreshListaMovimenti();
       $ObjQuery.Operazioni = [];
     });
   }
  }
  
  $scope.ModificaMovimento = function (Movimento) //DA GESTIRE
  {
    $scope.EditingOn            = true;
    $scope.MovimentoInEditing   = {};
    $scope.ListaCaricoEliminati = [];
    
    SystemInformation.GetSQL('FlyingStorage',{CHIAVE : Movimento.CHIAVE},function(Results)
    {
      $scope.ListaCarico = SystemInformation.FindResults(Results,'FlyingDettaglio');
      if ($scope.ListaCarico != undefined)
      {
        $scope.MovimentoInEditing.CHIAVE = Movimento.CHIAVE;
        $scope.MovimentoInEditing.DATA   = new Date (Movimento.DATA); 
        
        for (let i = 0; i < $scope.ListaCarico.length;i ++)
        {
             $scope.ListaCarico[i].Nuovo      = false;
             $scope.ListaCarico[i].Modificato = false;
             $scope.ListaCarico[i].Eliminato  = false;
        }
        SystemInformation.GetSQL('Accessories', {}, function(Results)  
        {  
          TitoliInfoLista = SystemInformation.FindResults(Results,'BookList');
          if(TitoliInfoLista != undefined)
          { 
            for(let i = 0; i < TitoliInfoLista.length; i++)
                TitoliInfoLista[i] = { 
                                        Chiave        : TitoliInfoLista[i].CHIAVE,
                                        Nome          : TitoliInfoLista[i].TITOLO,
                                        Codice        : TitoliInfoLista[i].CODICE_ISBN,
                                        Quantita_Mgzn : TitoliInfoLista[i].QUANTITA_MGZN
                                      }
            $scope.ListaTitoli = TitoliInfoLista;
          }
          else SystemInformation.ApplyOnError('Modello titoli non conforme','');   
        },'SelectTitoliSQL');   
      }
      else SystemInformation.ApplyOnError('Modello dettaglio movimento non conforme','');
    },'SQLDettaglio');
  }
  
  $scope.AggiungiTitoloCarico = function (ev)
  {  
      $mdDialog.show({ 
                       controller          : DialogControllerTitoloVolante,
                       templateUrl         : "template/bookFlyingPopup.html",
                       targetEvent         : ev,
                       scope               : $scope,
                       preserveScope       : true,
                       clickOutsideToClose : true
                     })
      .then(function(answer) 
      {}, 
      function() 
      {});
    }
 
  function DialogControllerTitoloVolante($scope,$mdDialog)  
  {
    $scope.Titolo      = {};
    
    $scope.Titolo = {
                       "CHIAVE"      : -1,
                       "TITOLO"      : -1,
                       "CODICE_TITOLO" : -1,
                       "NOME_TITOLO" : '',
                       "QUANTITA"    : 0,
                       "Nuovo"       : true,
                       "Modificato"  : false,
                       "Eliminato"   : false,
                       "QuantitaMax" : 0                                   
                    } 
                              
    $scope.queryTitolo = function(searchTextTit)
    {
       if(searchTextTit != undefined)
       {
          searchTextTit = searchTextTit.toUpperCase();
          return($scope.ListaTitoli.grep(function(Elemento) 
          { 
            return(Elemento.Nome.toUpperCase().indexOf(searchTextTit) != -1 || Elemento.Codice.indexOf(searchTextTit) != -1);
          }));
      }
    }
    
    $scope.selectedItemChangeTitolo = function(itemTit)
    {
      if(itemTit != undefined)
      {
        $scope.Titolo.TITOLO        = itemTit.Chiave;
        $scope.Titolo.NOME_TITOLO   = itemTit.Nome;
        $scope.Titolo.CODICE_TITOLO = itemTit.Codice;
        $scope.Titolo.QuantitaMax   = itemTit.Quantita_Mgzn
      }
    }

    $scope.hide = function() 
    {
      $scope.searchTextTit = '';
      $scope.TitoloPopup = undefined;
      $mdDialog.hide();
    };

    $scope.AnnullaPopupTitolo = function() 
    {
      $scope.searchTextTit = '';
      $scope.TitoloPopup   = undefined;
      $mdDialog.cancel();
    };

    $scope.ConfermaPopupTitolo = function()
    { 
      if($scope.Titolo.TITOLO == -1 || $scope.Titolo.QUANTITA == 0)
      {
        alert ('Dati titolo mancanti!');
        return
      }
      else
      {                         
        $scope.ListaCarico.push($scope.Titolo);
        $scope.searchTextTit = '';
        $scope.TitoloPopup   = undefined;
        $mdDialog.hide();
      }             
    }
  }
  
  $scope.ModificaTitolo = function (Titolo)
  {  
      $mdDialog.show({ 
                       controller          : DialogControllerTitoloVolanteMod,
                       templateUrl         : "template/bookFlyingPopup.html",
                       targetEvent         : Titolo,
                       scope               : $scope,
                       preserveScope       : true,
                       clickOutsideToClose : true,
                       locals              : {Titolo}
                     })
      .then(function(answer) 
      {}, 
      function() 
      {});
    }
 
  function DialogControllerTitoloVolanteMod($scope,$mdDialog,Titolo)  
  {
    $scope.Titolo = {};

    $scope.Titolo = {
                       "CHIAVE"       : Titolo.CHIAVE,
                       "TITOLO"       : Titolo.TITOLO,
                       "NOME_TITOLO"  : Titolo.NOME_TITOLO,
                       "CODICE_TITOLO"  : Titolo.CODICE_TITOLO,
                       "QUANTITA"     : parseInt(Titolo.QUANTITA),
                       "QuantitaMgzn" : Titolo.QUANTITA_MGZN_MAX,
                       "Nuovo"        : false,
                       "Modificato"   : true,
                       "Eliminato"    : false                                   
                    }
    //$scope.searchTextTit = 'ISBN : ' + Titolo.CODICE_TITOLO + ' - ' + Titolo.NOME_TITOLO; 
    $scope.searchTextTit = Titolo.NOME_TITOLO;                        
   
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
      {
        $scope.Titolo.TITOLO        = itemTit.Chiave;
        $scope.Titolo.NOME_TITOLO   = itemTit.Nome;
        $scope.Titolo.CODICE_TITOLO = itemTit.Codice;
        $scope.Titolo.QuantitaMax   = itemTit.Quantita_Mgzn;
      }
    }

    $scope.hide = function() 
    {
      $scope.searchTextTit = '';
      $scope.TitoloPopup = undefined;
      $mdDialog.hide();
    };

    $scope.AnnullaPopupTitolo = function() 
    {
      $scope.searchTextTit = '';
      $scope.TitoloPopup   = undefined;
      $mdDialog.cancel();
    };

    $scope.ConfermaPopupTitolo = function()
    { 
      TitoloCorrispondente = $scope.ListaCarico.findIndex(function(ATitolo){return (ATitolo.CHIAVE == Titolo.CHIAVE);});
      if($scope.Titolo.TITOLO == -1 || $scope.Titolo.QUANTITA == 0)
      {
         alert ('Dati titolo mancanti!');
         return
      }
      else
      {        
         $scope.ListaCarico[TitoloCorrispondente].TITOLO      = $scope.Titolo.TITOLO;
         $scope.ListaCarico[TitoloCorrispondente].NOME_TITOLO = $scope.Titolo.NOME_TITOLO;
         $scope.ListaCarico[TitoloCorrispondente].QUANTITA    = $scope.Titolo.QUANTITA;
         if($scope.ListaCarico[TitoloCorrispondente].Nuovo)
            $scope.ListaCarico[TitoloCorrispondente].Modificato = false
         else
            $scope.ListaCarico[TitoloCorrispondente].Modificato = true;
      }
      $scope.TitoloPopup = undefined;
      $scope.searchTextTit = '';
      $mdDialog.hide();     
    }                
  }
  
  $scope.EliminaTitolo = function(Titolo)
  {
    if(confirm('Eliminare il titolo ' + Titolo.NOME_TITOLO + ' dal carico?'))
    {
      TitoloCorrispondente = $scope.ListaCarico.findIndex(function(ATitolo){return(ATitolo.CHIAVE == Titolo.CHIAVE);});     
      if ($scope.ListaCarico[TitoloCorrispondente].Nuovo)
          $scope.ListaCarico.splice(TitoloCorrispondente,1)
      else
      {
        $scope.ListaCaricoEliminati.push($scope.ListaCarico[TitoloCorrispondente]);
        $scope.ListaCaricoEliminati[$scope.ListaCaricoEliminati.length-1].Eliminato = true;
        $scope.ListaCarico.splice(TitoloCorrispondente,1);
      }       
    }      
  }
  
  $scope.OnAnnullaMovimento = function()
  {
    $scope.EditingOn = false;
    $scope.RefreshListaMovimenti();
  }
  
  $scope.ConfermaMovimento = function()
  {
    if ($scope.MovimentoInEditing.DATA == '' || $scope.MovimentoInEditing.DATA == undefined)
    {    
        alert ('DATA MOVIMENTO NON CORRETTA');
        return         
    }
    else
    {
      $ObjQuery = {Operazioni : []};
      ParamMovimento = {
                         "CHIAVE" : $scope.MovimentoInEditing.CHIAVE,
                         "DATA"   : $scope.MovimentoInEditing.DATA    
                       }
                            
      var NuovoMovimento = ($scope.MovimentoInEditing.CHIAVE == -1);
      if (NuovoMovimento)
      {
        $ObjQuery.Operazioni.push({
                                    Query     : 'InsertMovement',
                                    Parametri : ParamMovimento   
                                  })
      }
      else
      {
        $ObjQuery.Operazioni.push({
                                    Query     : 'UpdateMovement',
                                    Parametri : ParamMovimento   
                                  })         
      }
      
      if (!NuovoMovimento && $scope.ListaCaricoEliminati.length != 0)
      {
         for(let j = 0; j < $scope.ListaCaricoEliminati.length ;j ++)
         {
           var ParamTitolo = {
                               CHIAVE : $scope.ListaCaricoEliminati[j].CHIAVE
                             }
           if ($scope.ListaCaricoEliminati[j].Eliminato)
           {
            $ObjQuery.Operazioni.push({
                                        Query     : 'DeleteMovementBook',
                                        Parametri : ParamTitolo
                                      });
           }
         }
         SystemInformation.PostSQL('FlyingStorage',$ObjQuery,function(Answer)
         {
           $scope.ListaCaricoEliminati = [];
           $ObjQuery.Operazioni = [];
         });  
      }           
      
      for(let i = 0; i < $scope.ListaCarico.length;i ++)
      {
          var ParamTitolo = {
                              "TITOLO"     : $scope.ListaCarico[i].TITOLO,  
                              "QUANTITA"   : $scope.ListaCarico[i].QUANTITA
                            }
          if(NuovoMovimento && $scope.ListaCarico[i].Nuovo)
          {
             $ObjQuery.Operazioni.push({
                                         Query     : 'InsertMovementBookAfterInsert',
                                         Parametri : ParamTitolo,
                                         ResetKeys : [2]
                                       });
          }
          if(!NuovoMovimento && $scope.ListaCarico[i].Nuovo)
          {
             var ParamTitolo  = {
                                  "MOVIMENTO"  : $scope.MovimentoInEditing.CHIAVE,
                                  "TITOLO"     : $scope.ListaCarico[i].TITOLO,  
                                  "QUANTITA"   : $scope.ListaCarico[i].QUANTITA
                                }
             $ObjQuery.Operazioni.push({
                                         Query     : 'InsertMovementBook',
                                         Parametri : ParamTitolo,
                                         ResetKeys : [1]
                                       });
          }
          if(!NuovoMovimento && $scope.ListaCarico[i].Modificato)
          {
            var ParamTitolo  = {
                                 "CHIAVE"   : $scope.ListaCarico[i].CHIAVE,
                                 "TITOLO"   : $scope.ListaCarico[i].TITOLO,  
                                 "QUANTITA" : $scope.ListaCarico[i].QUANTITA
                               }
            $ObjQuery.Operazioni.push({
                                        Query     : 'UpdateMovementBook',
                                        Parametri : ParamTitolo
                                      });             
          }             
      }
      
      SystemInformation.PostSQL('FlyingStorage',$ObjQuery,function(Answer)
      {
        $ObjQuery.Operazioni      = [];
        $scope.MovimentoInEditing = {};
        $scope.EditingOn          = false;
        $scope.RefreshListaMovimenti();
      });
    }             
  } 
  
  $scope.RefreshListaMovimenti();
  
}]);
