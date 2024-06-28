SIRIOApp.controller("deliveryAdvancedManagementPageController",['$scope','SystemInformation','$state','$rootScope','$mdDialog','$sce','$filter',
function($scope,SystemInformation,$state,$rootScope,$mdDialog,$sce,$filter)
{
  $scope.ProvinciaFiltro  = -1;
  $scope.PromotoreFiltro  = -1;
  $scope.IstitutoFiltro   = -1;
  $scope.DocenteFiltro    = -1;
  $scope.DataRicercaAl    = new Date();
  let TmpDate             = new Date($scope.DataRicercaAl);
  TmpDate.setDate(TmpDate.getDate() - 7);
  //$scope.DataRicercaDal   = new Date(TmpDate);
  var AnnoCorrente = new Date().getFullYear();
  $scope.DataRicercaDal   = new Date(AnnoCorrente, 0, 1)
  $scope.RicercaPerTitolo = false;
  
  $scope.ListaTitoliFiltroTmp = [];
  $scope.ListaTitoliFiltro    = [];
  $scope.ListaTitoliPopup     = [];  
  $scope.CodiceFiltro         = '';
  $scope.NomeFiltro           = '';
  $scope.CumulativoPossibile  = false;
  $scope.CheckAll             = false;
  $scope.UncheckAll           = false;
  $scope.ListaSpedizioni      = [];
  $scope.VisualizzaNonSpedibili = false     
  $scope.BloccoSpedizioniRecenti = true
 
  $scope.OnChangeStatoBlocco = function()
  {
    $scope.BloccoSpedizioniRecenti = !$scope.BloccoSpedizioniRecenti
    $scope.RefreshListaSpedizioniAll();
    $scope.CheckCumulativo();
  }

  ScopeHeaderController.CheckButtons();
  
  $scope.IsAdministrator = SystemInformation.IsAdministrator;

  $scope.IsAdministrator(); 
  
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
     return(ZFormatDateTime('dd/mm/yyyy',ZDateFromHTMLInput(Dati.Data)));
  }  
  
  SystemInformation.GetSQL('Accessories',{}, function(Results)
  {
    ListaProvinceAllTmp = SystemInformation.FindResults(Results,'ProvinceListAll');
    if (ListaProvinceAllTmp != undefined) 
    {
      for(let i = 0; i < ListaProvinceAllTmp.length; i++)
          ListaProvinceAllTmp[i] = {
                                     Chiave : ListaProvinceAllTmp[i].CHIAVE,
                                     Nome   : ListaProvinceAllTmp[i].NOME
                                   }
      $scope.ListaProvinceAll = ListaProvinceAllTmp;
    }
    else SystemInformation.ApplyOnError('Modello province di italia non conforme','');    
  });
  
  if($scope.IsAdministrator())
  {
     SystemInformation.GetSQL('Teacher',{}, function(Results)
     {
       $scope.ListaDocenti = [];
       ListaDocentiTmp = SystemInformation.FindResults(Results,'TeacherInfoListSmallAdmin');
       if (ListaDocentiTmp != undefined) 
       {
         for(let i = 0; i < ListaDocentiTmp.length; i++)
             ListaDocentiTmp[i] = {
                                    Chiave : ListaDocentiTmp[i].CHIAVE,
                                    Nome   : ListaDocentiTmp[i].RAGIONE_SOCIALE
                                  }
         $scope.ListaDocenti = ListaDocentiTmp;
       }
       else SystemInformation.ApplyOnError('Modello docenti non conforme','');    
     },'SelectSQLDocSpedAdmin')  
  }
  else
  {
     SystemInformation.GetSQL('Teacher',{}, function(Results)
     { 
       $scope.ListaDocenti = [];
       ListaDocentiTmp = SystemInformation.FindResults(Results,'TeacherInfoListSmallPromotore');
       if (ListaDocentiTmp != undefined) 
       {
         for(let i = 0; i < ListaDocentiTmp.length; i++)
             ListaDocentiTmp[i] = {
                                    Chiave : ListaDocentiTmp[i].CHIAVE,
                                    Nome   : ListaDocentiTmp[i].RAGIONE_SOCIALE
                                  }
         $scope.ListaDocenti = ListaDocentiTmp;
       }
       else SystemInformation.ApplyOnError('Modello docenti non conforme','');    
     },'SelectSQLDocSpedPromotore');
  }
  
  SystemInformation.GetSQL('Institute',{}, function(Results)
  {
    ListaIstitutiTmp = SystemInformation.FindResults(Results,'InstituteInfoListOnlyVisibile');
    if (ListaIstitutiTmp != undefined) 
    {
      for(let i = 0; i < ListaIstitutiTmp.length; i++)
          ListaIstitutiTmp[i] = {
                                   Chiave   : ListaIstitutiTmp[i].CHIAVE,
                                   CodiceIstituto :  ListaIstitutiTmp[i].CODICE,
                                   Istituto : ListaIstitutiTmp[i].NOME
                                 }
      $scope.ListaIstituti = ListaIstitutiTmp;
    }
    else SystemInformation.ApplyOnError('Modello istituti non conforme','');    
  },'SelectSQLOnlyVisible');
  
  SystemInformation.GetSQL('User',{}, function(Results)
  {
    ListaPromotoriTmp = SystemInformation.FindResults(Results,'UserInfoList');
    if (ListaPromotoriTmp != undefined) 
    {
      for(let i = 0; i < ListaPromotoriTmp.length; i++)
          ListaPromotoriTmp[i] = {
                                   Chiave : ListaPromotoriTmp[i].CHIAVE,
                                   Nome   : ListaPromotoriTmp[i].RAGIONE_SOCIALE
                                 }
      $scope.ListaPromotori = ListaPromotoriTmp;
    }
    else SystemInformation.ApplyOnError('Modello promotori non conforme','');    
  });
  
  SystemInformation.GetSQL('Accessories', {}, function(Results)  
  {  
    TitoliInfoLista = SystemInformation.FindResults(Results,'BookListAdv');
    if(TitoliInfoLista != undefined)
    { 
       for(let i = 0; i < TitoliInfoLista.length; i++)
           TitoliInfoLista[i] = { 
                                  Chiave         : TitoliInfoLista[i].CHIAVE,
                                  Nome           : TitoliInfoLista[i].TITOLO,
                                  Codice         : TitoliInfoLista[i].CODICE_ISBN,
                                  Quantita       : TitoliInfoLista[i].QUANTITA_MGZN,
                                  SommaPrenotati : 0,
                                  DaAggiungere   : false                                 
                                }
       $scope.ListaTitoliPopup = TitoliInfoLista;
    }
    else SystemInformation.ApplyOnError('Modello titoli non conforme','');   
  },'SelectTitoliSQLAdv');
  
  $scope.queryDocente = function(searchTextDocente)
  {
     searchTextDocente = searchTextDocente.toUpperCase();
     return($scope.ListaDocenti.grep(function(Elemento) 
     { 
       //return(Elemento.Nome.toUpperCase().indexOf(searchTextDocente) != -1);
       return(Elemento.Nome.toUpperCase().startsWith(searchTextDocente))
     }));
  }
  
  $scope.selectedItemChangeDocente = function(itemDocente)
  {
    if(itemDocente != undefined)
       $scope.DocenteFiltro = itemDocente.Chiave;     
    else $scope.DocenteFiltro = -1;
    $scope.RefreshListaSpedizioniAll()
  }  

  $scope.queryIstituto = function(searchTextIstituto)
  {
     searchTextIstituto = searchTextIstituto.toUpperCase();
     return($scope.ListaIstituti.grep(function(Elemento) 
     { 
       return(Elemento.Istituto.toUpperCase().indexOf(searchTextIstituto) != -1 || Elemento.CodiceIstituto.toUpperCase().indexOf(searchTextIstituto) != -1);
     }));
  }
  
  $scope.selectedItemChangeIstituto = function(itemIstituto)
  {
    if(itemIstituto != undefined)
       $scope.IstitutoFiltro = itemIstituto.Chiave;
    else $scope.IstitutoFiltro = -1;
    $scope.RefreshListaSpedizioniAll()
  }

  $scope.CheckCumulativo = function()
  {
    var ListaNonSpedibili         = [];
    $scope.VisualizzaNonSpedibili = false;
    $scope.ListaNonSpedibili      = '';
    $scope.CumulativoPossibile = $scope.ListaSpedizioni.length != 0
    if($scope.CumulativoPossibile)
    {
       var ContatoreCheck = 0;
       for(let k = 0;k < $scope.ListaSpedizioni.length;k ++)       
           if($scope.ListaSpedizioni[k].Tipo == 1 && $scope.ListaSpedizioni[k].Selezionato)
              ContatoreCheck++;              
       if(ContatoreCheck != 0)
       {
           for(let j = 0;j < $scope.ListaTitoliFiltro.length;j ++)
           {
               $scope.ListaTitoliFiltro[j].SommaPrenotati = 0;
               $scope.ListaTitoliFiltro[j].Quantita       = parseInt($scope.ListaTitoliFiltro[j].Quantita);
               for(let i = 0;i < $scope.ListaSpedizioni.length;i ++)
               {
                 $scope.ListaSpedizioni[i].Quantita = parseInt($scope.ListaSpedizioni[i].Quantita);
                 if($scope.ListaSpedizioni[i].Tipo == 1 && ($scope.ListaSpedizioni[i].Titolo == $scope.ListaTitoliFiltro[j].Chiave) && $scope.ListaSpedizioni[i].Selezionato)
                    $scope.ListaTitoliFiltro[j].SommaPrenotati += $scope.ListaSpedizioni[i].Quantita
               }
               if($scope.ListaTitoliFiltro[j].SommaPrenotati > $scope.ListaTitoliFiltro[j].Quantita)
               {
                  $scope.CumulativoPossibile = false;
                  ListaNonSpedibili.push($scope.ListaTitoliFiltro[j].Nome);
               }
               else $scope.CumulativoPossibile = true;
           }
           if(ListaNonSpedibili.length > 0)
           {
              for(let l = 0;l < ListaNonSpedibili.length;l ++)
                 $scope.ListaNonSpedibili += (l + 1) + '. - ' + ListaNonSpedibili[l] + "\n";
              $scope.ListaNonSpedibili      = $scope.ListaNonSpedibili.substring(0,$scope.ListaNonSpedibili.length - 1);
              $scope.VisualizzaNonSpedibili = true;         
           }          
       }          
    }
  }
  
  $scope.InviaCumulativo = function()
  {
    var $ObjQuery = {Operazioni:[]};
    var ParametriSpedizione = [];
    SystemInformation.DataBetweenController.ListaChiaviFromAdvanced = [];
    SystemInformation.DataBetweenController.Provenienza = 'ADVANCED';
    for(let i = 0;i < $scope.ListaSpedizioni.length;i ++)
    {
        if($scope.ListaSpedizioni[i].Tipo == 1 && $scope.ListaSpedizioni[i].Selezionato)
        {
          SystemInformation.DataBetweenController.ListaChiaviFromAdvanced.push($scope.ListaSpedizioni[i].ChiaveDettaglio)
          ParametriSpedizione.push($scope.ListaSpedizioni[i].ChiaveDettaglio);
        }      
    }
    $ObjQuery.Operazioni.push({
                                Query     : 'ChangeDeliveryToSendAdvanced',
                                Parametri : {ChiaveDettaglio : ParametriSpedizione.toString()}
                              }); 
    SystemInformation.PostSQL('Delivery',$ObjQuery,function(Answer)
    {
      $state.go('printLabelPage');
    });
  }  
  
  $scope.RefreshListaSpedizioniAll = function()
  {
    $scope.GridOptions.query.page = 1;

    if(!$scope.RicercaPerTitolo) 
    $scope.ListaTitoliFiltro = [];

    if($scope.DataRicercaDal == undefined || $scope.DataRicercaAl == undefined)
       return;
    let TmpDate = new Date($scope.DataRicercaAl);
    TmpDate.setDate($scope.DataRicercaAl.getDate() + 1);
    
    var ParamSpedizione = {
                            Dal          : ZHTMLInputFromDate($scope.DataRicercaDal), 
                            Al           : ZHTMLInputFromDate(TmpDate),
                            FiltroMain   : 1
                          };
    if($scope.IstitutoFiltro != -1)
       ParamSpedizione.FiltroI = $scope.IstitutoFiltro;
    if($scope.ProvinciaFiltro != -1)
       ParamSpedizione.FiltroP = $scope.ProvinciaFiltro;
    if($scope.DocenteFiltro != -1)
       ParamSpedizione.FiltroD = $scope.DocenteFiltro;
    if($scope.PromotoreFiltro != -1 && $scope.IsAdministrator())
       ParamSpedizione.FiltroPr = $scope.PromotoreFiltro;

    if($scope.RicercaPerTitolo && $scope.ListaTitoliFiltro.length > 0)
    {
      var ChiaviTitoli = [];
      for(let i = 0;i < $scope.ListaTitoliFiltro.length;i ++)
      {
          ChiaviTitoli.push($scope.ListaTitoliFiltro[i].Chiave) 
      }
      ParamSpedizione.FiltroT = ChiaviTitoli.toString();
    }
     
    var CompilaListaSpedizioni = function(ListaSpedizioniTmp,LsDisponibilita)
    {
       $scope.ListaSpedizioni = [];
       if (ListaSpedizioniTmp != undefined) 
       {
          for(let i = 0; i < ListaSpedizioniTmp.length; i++)
             for(let j = 0; j < LsDisponibilita.length; j++)
                if(ListaSpedizioniTmp[i].CHIAVE_DETTAGLIO == LsDisponibilita[j].Chiave)
                {
                   ListaSpedizioniTmp[i].Disponibile = LsDisponibilita[j].Disponibile
                   ListaSpedizioniTmp[i].Disponibilita = LsDisponibilita[j].Disponibilita;
                   break;
                }

          ListaSpedizioniTmp = ListaSpedizioniTmp.filter(function(SingolaSpedizione) 
          {
             return SingolaSpedizione.Disponibilita != 0 && SingolaSpedizione.Disponibilita != undefined;
          })

          var LastSpedizione = -1;
          for(let i = 0; i < ListaSpedizioniTmp.length; i++)
          {
            if(LastSpedizione != ListaSpedizioniTmp[i].CHIAVE)
            {
               LastSpedizione = ListaSpedizioniTmp[i].CHIAVE;
               $scope.ListaSpedizioni.push({ 
                                             ChiaveSpedizione : ListaSpedizioniTmp[i].CHIAVE,
                                             Tipo             : 0, 
                                             Data             : ListaSpedizioniTmp[i].DATA,
                                             Presso           : ListaSpedizioniTmp[i].PRESSO == null ? 'N.D.' : ListaSpedizioniTmp[i].PRESSO,
                                             Docente          : (ListaSpedizioniTmp[i].DOCENTE == null || ListaSpedizioniTmp[i].DOCENTE == undefined) ? -1 : ListaSpedizioniTmp[i].DOCENTE,
                                             DocenteNome      : ListaSpedizioniTmp[i].NOME_DOCENTE == null ? 'N.D.' : ListaSpedizioniTmp[i].NOME_DOCENTE,
                                             Provincia        : ListaSpedizioniTmp[i].PROVINCIA,
                                             Promotore        : ListaSpedizioniTmp[i].PROMOTORE,
                                             Istituto         : ListaSpedizioniTmp[i].ISTITUTO,
                                             NomeIstituto     : ListaSpedizioniTmp[i].NOME_ISTITUTO == null ? '' : ListaSpedizioniTmp[i].NOME_ISTITUTO
                                           })
            }
            $scope.ListaSpedizioni.push({ 
                                           ChiaveDettaglio : ListaSpedizioniTmp[i].CHIAVE_DETTAGLIO,
                                           Tipo            : 1, 
                                           Codice          : ListaSpedizioniTmp[i].CODICE_TITOLO == null ? 'N.D.' : ListaSpedizioniTmp[i].CODICE_TITOLO,
                                           TitoloNome      : ListaSpedizioniTmp[i].NOME_TITOLO == null ? 'N.D.' : ListaSpedizioniTmp[i].NOME_TITOLO,
                                           Titolo          : ListaSpedizioniTmp[i].TITOLO,
                                           Quantita        : ListaSpedizioniTmp[i].QUANTITA == null ? 'N.D.' : ListaSpedizioniTmp[i].QUANTITA,
                                           QuantitaMgzn    : ListaSpedizioniTmp[i].QUANTITA_DISP,
                                           Selezionato     : false,
                                           Data            : ListaSpedizioniTmp[i].DATA_ULTIMA_MODIFICA,
                                           Disponibile     : $scope.BloccoSpedizioniRecenti ? ListaSpedizioniTmp[i].Disponibile : true,
                                           Disponibilita   : ListaSpedizioniTmp[i].Disponibilita

                                        });
          }  
        }
        else SystemInformation.ApplyOnError('Modello spedizione non conforme','')     
    }

    SystemInformation.GetSQL('Delivery',ParamSpedizione,function(Results)
    {
      SystemInformation.ExecuteExternalScript('SIRIOExtraGetPrenotazioniDisponibili',{},function(Answer) 
      {
        CompilaListaSpedizioni(SystemInformation.FindResults(Results,$scope.IsAdministrator() ? 'DettaglioDisponibiliAdmin' : 'DettaglioDisponibiliPromotore'),
                               Answer.LsPrenotazioni);
        if(!$scope.RicercaPerTitolo)
        {
            Answer.LsTitoli.forEach(function(ATitolo)
            {
              $scope.ListaTitoliFiltro.push({
                                            Chiave         : ATitolo.Chiave,
                                            Nome           : ATitolo.Nome,
                                            Codice         : ATitolo.Codice,
                                            Quantita       : ATitolo.Disponibilita,
                                            SommaPrenotati : 0,
                                            DaAggiungere   : true 
                                          })
            })
        }
      })
    },$scope.IsAdministrator() ? 'SQLDettaglioTitoliDisponibiliAdmin' : 'SQLDettaglioTitoliDisponibiliPromotore')     
  }
  
  $scope.SelezionaTutto = function()
  {
    if($scope.ListaSpedizioni.length > 0)
    {
       for(let i = 0;i < $scope.ListaSpedizioni.length;i ++)
           if($scope.ListaSpedizioni[i].Tipo == 1 && $scope.ListaSpedizioni[i].Disponibile)
              $scope.ListaSpedizioni[i].Selezionato = true;    
    }
    $scope.CheckCumulativo();
  }
  
  $scope.DeselezionaTutto = function()
  {
    if($scope.ListaSpedizioni.length > 0)
    {
       for(let i = 0;i < $scope.ListaSpedizioni.length;i ++)
           if($scope.ListaSpedizioni[i].Tipo == 1)
              $scope.ListaSpedizioni[i].Selezionato = false;
      
    }
    $scope.CheckCumulativo();
  }
  
  $scope.AggiungiTitoloRicerca = function(ev)
  {
    $mdDialog.show({ 
                     controller          : DialogControllerTitolo,
                     templateUrl         : "template/addBookFilterPopup.html",
                     targetEvent         : ev,
                     scope               : $scope,
                     preserveScope       : true,
                     clickOutsideToClose : true
                   })
    .then(function(answer) 
    {
    }, 
    function() 
    {
    });
  }
  
  function DialogControllerTitolo($scope,$mdDialog)  
  {    
    $scope.hide = function() 
    {
      $mdDialog.hide();
    };

    $scope.AnnullaPopup = function() 
    {
      for(let i = 0;i < $scope.ListaTitoliPopup.length;i ++)
          $scope.ListaTitoliPopup[i].DaAggiungere = false;
      $scope.NomeFiltro        = '';
      $scope.CodiceFiltro      = '';              
      $scope.ListaTitoliToAdd  = [];
      $mdDialog.cancel();
    };

    $scope.ConfermaPopup = function()
    {
      $scope.ListaTitoliFiltro = [];
      var ContatoreTitoli = 0;
      var ContatoreDoppi  = 0;      
      for(let i = 0;i < $scope.ListaTitoliPopup.length;i ++)
          if($scope.ListaTitoliPopup[i].DaAggiungere)
          {
             let TitoloCorrisp = $scope.ListaTitoliFiltro.find(function(ATitolo){return(ATitolo.Chiave == $scope.ListaTitoliPopup[i].Chiave);});
             if(TitoloCorrisp == undefined)
             {
                $scope.ListaTitoliFiltroTmp.push($scope.ListaTitoliPopup[i]);
                ContatoreTitoli++;
             }
             else ContatoreDoppi++;
             //$scope.ListaTitoliFiltroTmp.push($scope.ListaTitoliPopup[i]);
             $scope.ListaTitoliPopup[i].DaAggiungere = false;
             TitoloCorrisp = undefined;
             //ContatoreTitoli++;
          }
      if(ContatoreTitoli == 0 && ContatoreDoppi == 0)
      {
         ZCustomAlert($mdDialog,'ATTENZIONE','NESSUN TITOLO SELEZIONATO!') 
         return
      }
      else
      {
         for(let j = 0;j < $scope.ListaTitoliFiltroTmp.length;j ++)
                $scope.ListaTitoliFiltro.push($scope.ListaTitoliFiltroTmp[j]);
         if(ContatoreDoppi != 0)
            ZCustomAlert($mdDialog,'AVVISO',"ALCUNI TITOLI ERANO GIA' STATI INSERITI NELLA RICERCA!")
         $scope.ListaTitoliFiltroTmp = [];
         $scope.NomeFiltro   = '';
         $scope.CodiceFiltro = '';
         $scope.RicercaPerTitolo = true;       
         $mdDialog.hide();
         $scope.RefreshListaSpedizioniAll();
      }      
    };
  }
  
  $scope.RimuoviTitolo = function(Titolo)
  {
    TitoloCorrisp = $scope.ListaTitoliFiltro.findIndex(function(ATitolo){return(ATitolo.Chiave == Titolo.Chiave);});
    $scope.ListaTitoliFiltro.splice(TitoloCorrisp,1);
    if($scope.ListaTitoliFiltro.length == 0)
       $scope.RicercaPerTitolo = false;
    else $scope.RicercaPerTitolo = true;
    $scope.RefreshListaSpedizioniAll();
  }
  
  $scope.RefreshListaSpedizioniAll();

}]);

SIRIOApp.filter('TitoloPopupByFiltro',function()
{
  return function(ListaTitoliPopup,NomeFiltro,CodiceFiltro,DisponibileFiltro)
         {
           if(NomeFiltro == '' && CodiceFiltro == '' && !DisponibileFiltro) 
             return(ListaTitoliPopup);
           var ListaFiltrata = [];
           NomeFiltro = NomeFiltro.toUpperCase();
           CodiceFiltro = CodiceFiltro.toUpperCase();
           
           var TitoloOk = function(Titolo)
           {  
              var Result = true;
              
              if(NomeFiltro != '')              
                if(Titolo.Nome.toUpperCase().indexOf(NomeFiltro) < 0)
                   Result = false;
              
              if(CodiceFiltro != '')
                 if(Titolo.Codice.toUpperCase().indexOf(CodiceFiltro) < 0)
                   Result = false; 
              
              if(DisponibileFiltro)
                 if(Titolo.Quantita <= 0)
                    Result = false;             
              
              return(Result);
           }
           
           ListaTitoliPopup.forEach(function(Titolo)
           { 
             if(TitoloOk(Titolo)) 
                ListaFiltrata.push(Titolo)                       
           });
           
           return(ListaFiltrata);
           
         }
});
