SIRIOApp.controller("flyingStoragePageController",['$scope','SystemInformation','$state','$rootScope','$mdDialog','ZConfirm','$sce',function($scope,SystemInformation,$state,$rootScope,$mdDialog,ZConfirm,$sce)
{  
  $scope.ListaVolante        = [];
  $scope.EditingOn           = false;
  $scope.ViewTotaleMagazzino = false;
  $scope.CodiceBippato       = '';
  $scope.ListaTotaleVolante  = [];
  $scope.TotaleLibri         = 0;
  $scope.ShowOnlyCurrentYear = true;
  
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

  $scope.GridOptions_3 = {
                          rowSelection    : false,
                          multiSelect     : true,
                          autoSelect      : true,
                          decapitate      : false,
                          largeEditDialog : false,
                          boundaryLinks   : false,
                          limitSelect     : true,
                          pageSelect      : true,
                          query           : {
                                              limit: 20,
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
    $scope.GridOptions.query.page = 1;

    var Parametri = {};
    
    if($scope.ShowOnlyCurrentYear)
       Parametri.BeforeCurrentYear = 1;

    SystemInformation.GetSQL('FlyingStorage',Parametri,function(Results)
    {
      ListaVolanteTmp     = SystemInformation.FindResults(Results,'SelectAllMovimenti');
      $scope.ListaVolante = [];
      if(ListaVolanteTmp != undefined)
      {
        var ChiaveMov       = -1;        
        for(let i = 0; i < ListaVolanteTmp.length;i ++)
        {
            if(ChiaveMov != ListaVolanteTmp[i].MOVIMENTO) 
            {
               $scope.ListaVolante.push({
                                          CHIAVE         : ListaVolanteTmp[i].MOVIMENTO,
                                          DATA           : ListaVolanteTmp[i].DATA,
                                          PROMOTORE      : ListaVolanteTmp[i].PROMOTORE,
                                          NOME_PROMOTORE : ListaVolanteTmp[i].USERNAME,
                                          ListaTitoli    : []
                                        })
               ChiaveMov = ListaVolanteTmp[i].MOVIMENTO;
            } 
            $scope.ListaVolante[$scope.ListaVolante.length - 1].ListaTitoli.push({
                                                                                   Quantita : ListaVolanteTmp[i].QUANTITA,
                                                                                   Titolo   : ListaVolanteTmp[i].NOME,
                                                                                   Codice   : ListaVolanteTmp[i].CODICE_ISBN
                                                                                 })
        } 
        $scope.ListaVolante.sort(function(a,b)
        {
          var MovA = new Date(a.DATA);
          var MovB = new Date(b.DATA);
          return (MovA > MovB) ? -1 : (MovA < MovB) ? 1 : 0; 
        });
      }
      else SystemInformation.ApplyOnError('Modello lista mag.volante non conforme','');    
    },'SelectSQLAll')
  }

  $scope.GetTitoliMovimento = function(Movimento)
  {
     var Result = '';
     for(let i = 0;i < Movimento.ListaTitoli.length;i ++)
     {
         Result += Movimento.ListaTitoli[i].Quantita + ' - ' + Movimento.ListaTitoli[i].Codice + ' - ' + Movimento.ListaTitoli[i].Titolo + '</br>';
     }
     
     return($sce.trustAsHtml(Result.substr(0,Result.length)));
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
                                  QuantitaMgzn  : parseInt(TitoliInfoLista[i].QUANTITA_MGZN)
                                }
       $scope.ListaTitoli = TitoliInfoLista;
    }
    else SystemInformation.ApplyOnError('Modello titoli non conforme','');   
  },'SelectTitoliSQL');
  
  $scope.NuovoMovimento = function ()
  {
    $scope.EditingOn                 = true;
    $scope.MovimentoInEditing        = {};
    $scope.MovimentoInEditing.DATA   = new Date();
    $scope.MovimentoInEditing.CHIAVE = -1;
    $scope.ListaCarico               = [];
    $scope.ListaCaricoEliminati      = [];
  }

  $scope.ModificaMovimento = function (Movimento) //DA GESTIRE
  {
    $scope.EditingOn            = true;
    $scope.MovimentoInEditing   = {};
    $scope.ListaCarico          = [];
    $scope.ListaCaricoEliminati = [];
    
    SystemInformation.GetSQL('FlyingStorage',{CHIAVE : Movimento.CHIAVE},function(Results)
    {
      ListaCaricoTmp = SystemInformation.FindResults(Results,'FlyingDettaglio');
      if (ListaCaricoTmp != undefined)
      {
        $scope.MovimentoInEditing.CHIAVE = Movimento.CHIAVE;
        $scope.MovimentoInEditing.DATA   = new Date (Movimento.DATA); 
        
        for (let i = 0; i < ListaCaricoTmp.length;i ++)
        {
             ListaCaricoTmp[i] = {
                                    Chiave      : ListaCaricoTmp[i].CHIAVE,
                                    Titolo      : ListaCaricoTmp[i].TITOLO,
                                    Codice      : ListaCaricoTmp[i].CODICE_TITOLO,
                                    Nome        : ListaCaricoTmp[i].NOME_TITOLO,
                                    Quantita    : parseInt(ListaCaricoTmp[i].QUANTITA),
                                    QuantitaMag : parseInt(ListaCaricoTmp[i].QUANTITA_MGZN_MAX),
                                    Nuovo       : false,
                                    Modificato  : false,
                                    Eliminato   : false,
                                 }
        }
        $scope.ListaCarico = ListaCaricoTmp
      }
      else SystemInformation.ApplyOnError('Modello dettaglio movimento non conforme','');
    },'SQLDettaglio');
  }

  $scope.ApriVolante = function()
  {
    $scope.ViewTotaleMagazzino = true;
    $scope.TotaleLibri         = 0;
    $scope.ListaTotaleVolante  = [];
    SystemInformation.GetSQL('FlyingStorage',{},function(Results)
    {
      ListaTitoliTmp = SystemInformation.FindResults(Results,'GetTotaleVolante');
      if(ListaTitoliTmp != undefined)
      {
        for(let i = 0; i < ListaTitoliTmp.length;i ++)
        {
            ListaTitoliTmp[i] = {
                                  Quantita : ListaTitoliTmp[i].QUANTITA,
                                  Isbn     : ListaTitoliTmp[i].CODICE_ISBN,
                                  Titolo   : ListaTitoliTmp[i].NOME
                                }
            $scope.TotaleLibri += parseInt(ListaTitoliTmp[i].Quantita);
        }
        $scope.ListaTotaleVolante = ListaTitoliTmp;  
      }
      else SystemInformation.ApplyOnError('Modello lista titoli mag.volante non conforme','');    
    },'SelectTotale');
  }

  $scope.ChiudiVolante = function()
  {
    $scope.ViewTotaleMagazzino = false;
    $scope.ListaTotaleVolante  = [];
  }

  $scope.ResetIsbnInput = function()
  {
    $scope.CodiceBippatoVisible = '';
  }  

  $scope.CheckQuantita = function(Titolo)
  {
    if(Titolo.QuantitaMag < Titolo.Quantita)
       ZCustomAlert($mdDialog,'ATTENZIONE! QUANTITA PRESENTE IN MAGAZZINO SUPERATA!')
    var TitoloInLista = $scope.ListaCarico.findIndex(function(ACodice){return(ACodice.Codice == Titolo.Codice);});   
    if(TitoloInLista != -1)
       $scope.ListaCarico[TitoloInLista].Modificato = true;
  }

  $scope.AggiungiInserimento = function(KeyPressed)
  {
    $scope.CodiceBippato = $scope.CodiceBippatoVisible;
    
    if($scope.CodiceFocused == undefined)
       $scope.CodiceFocused = {Chiave : -1, Codice : -1, Titolo : -1, Nome : '', Quantita : 0, QuantitaMag : 0};

    if(KeyPressed.keyCode == 13)
    {
      if($scope.CodiceFocused.Codice == $scope.CodiceBippato)
      {
         var TitoloInLista = $scope.ListaCarico.findIndex(function(ACodice){return(ACodice.Codice == $scope.CodiceBippato);});
         if(TitoloInLista != -1)
         {
            if($scope.ListaCarico[TitoloInLista].QuantitaMag >= ($scope.ListaCarico[TitoloInLista].Quantita + 1)) 
               $scope.ListaCarico[TitoloInLista].Quantita += 1
            else
            {
              ZCustomAlert($mdDialog,'QUANTITA IN MAGAZZINO NON DISPONIBILE!')
              $scope.CodiceBippatoVisible = '';
            } 
         }
         $scope.CodiceBippato = $scope.CodiceFocused.Codice;
      }
      else
      {
           var TitoloTrovato = $scope.ListaTitoli.findIndex(function(ACodice){return(ACodice.Codice == $scope.CodiceBippato);});
           if(TitoloTrovato == -1)
           {
             ZCustomAlert($mdDialog,'ATTENZIONE',"NESSUN TITOLO IN MAGAZZINO ASSOCIATO A QUESTO TITOLO! SI CONSIGLIA DI CONTROLLARE IL DATABASE O DI VERIFICARE L'INSERIMENTO DEL CODICE!")
             $scope.CodiceBippato = '';
             return
           }
           else
           {
              var TitoloInLista = $scope.ListaCarico.findIndex(function(ACodice){return(ACodice.Codice == $scope.CodiceBippato);});
              if(TitoloInLista != -1)
              {
                 if($scope.ListaCarico[TitoloInLista].QuantitaMag >= ($scope.ListaCarico[TitoloInLista].Quantita + 1)) 
                    $scope.ListaCarico[TitoloInLista].Quantita += 1
                 else
                 {
                   ZCustomAlert($mdDialog,'QUANTITA IN MAGAZZINO NON DISPONIBILE!')
                   $scope.CodiceBippatoVisible = '';
                 } 
                
                 $scope.CodiceBippato = $scope.ListaCarico[TitoloInLista].Codice;
              }
              else
              { 
                 if($scope.ListaTitoli[TitoloTrovato].QuantitaMgzn > 0)
                 {
                    $scope.CodiceFocused                 = {Chiave : -1,Codice : 0, Nome : '', Quantita : 0, QuantitaMag : 0,QuantitaMagStr : "0"};
                    $scope.CodiceFocused.Titolo          = $scope.ListaTitoli[TitoloTrovato].Chiave;
                    $scope.CodiceFocused.Codice          = $scope.CodiceBippato;
                    $scope.CodiceFocused.Nome            = $scope.ListaTitoli[TitoloTrovato].Nome;
                    $scope.CodiceFocused.Quantita        = 1;
                    $scope.CodiceFocused.QuantitaMag     = $scope.ListaTitoli[TitoloTrovato].QuantitaMgzn;
                    $scope.CodiceFocused.Nuovo           = true; 
                    $scope.CodiceFocused.Modificato      = false; 
                    $scope.CodiceFocused.Eliminato       = false;
                    if($scope.CodiceBippato != -1)
                    {
                      $scope.ListaCarico.unshift($scope.CodiceFocused); //PUSH
                    }
                    $scope.CodiceBippato = $scope.CodiceFocused.Codice;
                 }
                 else 
                 {
                  ZCustomAlert($mdDialog,'QUANTITA IN MAGAZZINO NON DISPONIBILE!')
                  $scope.CodiceBippatoVisible = '';
                 } 
                 $scope.CodiceBippato = $scope.CodiceFocused.Codice;
              }
            }
      }
      $scope.CodiceBippatoVisible = '';
    }  
  }
  
  $scope.EliminaMovimento = function (Movimento) 
  {
    var EliminaMov = function()
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
   ZConfirm.GetConfirmBox('AVVISO',"Eliminare il movimento della data " + Movimento.DATA + " ?",EliminaMov,function(){});
  }
  
  $scope.EliminaTitolo = function(Titolo)
  {
    var EliminaTit = function()
    {
      TitoloCorrispondente = $scope.ListaCarico.findIndex(function(ATitolo){return(ATitolo.Titolo == Titolo.Titolo);});     
      if ($scope.ListaCarico[TitoloCorrispondente].Nuovo)
          $scope.ListaCarico.splice(TitoloCorrispondente,1)
      else
      {
        $scope.ListaCaricoEliminati.push($scope.ListaCarico[TitoloCorrispondente]);
        $scope.ListaCaricoEliminati[$scope.ListaCaricoEliminati.length-1].Eliminato = true;
        $scope.ListaCarico.splice(TitoloCorrispondente,1);
      }
      if($scope.CodiceBippato == Titolo.Codice)
      {
        $scope.CodiceBippato = '';
        $scope.CodiceFocused = undefined;
      }       
    }
    ZConfirm.GetConfirmBox('AVVISO',"Eliminare il titolo  >>" + Titolo.Nome + "<< dal carico?",EliminaTit,function(){});      
  }
  
  $scope.OnAnnullaMovimento = function()
  {
    $scope.EditingOn          = false;
    $scope.ListaCarico        = [];
    $scope.CodiceBippato      = '';
    $scope.CodiceFocused      = undefined;
    $scope.MovimentoInEditing = {};
    $scope.RefreshListaMovimenti();
  }
  
  $scope.ConfermaMovimento = function()
  {
    if ($scope.MovimentoInEditing.DATA == '' || $scope.MovimentoInEditing.DATA == undefined)
    {    
        ZCustomAlert($mdDialog,'ATTENZIONE','DATA MOVIMENTO NON CORRETTA!');
        return         
    }
    else
    {
      $ObjQuery = {Operazioni : []};
      ParamMovimento = {
                         "CHIAVE" : $scope.MovimentoInEditing.CHIAVE,
                         "DATA"   : ConstPrepareForRecordDate($scope.MovimentoInEditing.DATA)
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
                               CHIAVE : $scope.ListaCaricoEliminati[j].Chiave
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
                              "TITOLO"     : $scope.ListaCarico[i].Titolo,  
                              "QUANTITA"   : $scope.ListaCarico[i].Quantita
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
                                  "CHIAVE"     : $scope.MovimentoInEditing.CHIAVE,
                                  "TITOLO"     : $scope.ListaCarico[i].Titolo,  
                                  "QUANTITA"   : $scope.ListaCarico[i].Quantita
                                }
             $ObjQuery.Operazioni.push({
                                         Query     : 'InsertMovementBook',
                                         Parametri : ParamTitolo,
                                         ResetKeys : [1]
                                       });
          }
          if(!NuovoMovimento && $scope.ListaCarico[i].Modificato && !$scope.ListaCarico[i].Nuovo)
          {
            var ParamTitolo  = {
                                 "CHIAVE"   : $scope.ListaCarico[i].Chiave,
                                 "TITOLO"   : $scope.ListaCarico[i].Titolo,  
                                 "QUANTITA" : $scope.ListaCarico[i].Quantita
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
        $scope.ListaCarico        = [];
        $scope.CodiceBippato      = '';
        $scope.CodiceFocused      = undefined;
        $scope.RefreshListaMovimenti();
      });
    }             
  } 
  
  $scope.RefreshListaMovimenti();
  
}]);
