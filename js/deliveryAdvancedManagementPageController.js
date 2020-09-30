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
  $scope.DataRicercaDal   = new Date(TmpDate);
  
  $scope.ListaTitoliFiltroTmp = [];
  $scope.ListaTitoliFiltro    = [];
  $scope.ListaTitoliPopup     = [];  
  $scope.CodiceFiltro         = '';
  $scope.NomeFiltro           = '';
  $scope.CumulativoPossibile  = false;
  $scope.CheckAll             = false;
  $scope.UncheckAll           = false;
 
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
  
  $scope.ConvertiData = function (Dati)
  {
     return(ZFormatDateTime('dd/mm/yyyy',ZDateFromHTMLInput(Dati.Data)));
  }  
  
  $scope.IsAdministrator = function ()
  {
    return SystemInformation.UserInformation.Ruolo == RUOLO_AMMINISTRATORE;
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
                                  Quantita       : TitoliInfoLista[i].QUANTITA_MGZN,  // CONTROLLA QUESTA QUANTITA
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
       return(Elemento.Nome.toUpperCase().indexOf(searchTextDocente) != -1);
     }));
  }
  
  $scope.selectedItemChangeDocente = function(itemDocente)
  {
    if(itemDocente != undefined)
       $scope.DocenteFiltro = itemDocente.Chiave;
    else $scope.DocenteFiltro = -1;
  }  

  $scope.queryIstituto = function(searchTextIstituto)
  {
     searchTextIstituto = searchTextIstituto.toUpperCase();
     return($scope.ListaIstituti.grep(function(Elemento) 
     { 
       return(Elemento.Istituto.toUpperCase().indexOf(searchTextIstituto) != -1);
     }));
  }
  
  $scope.selectedItemChangeIstituto = function(itemIstituto)
  {
    if(itemIstituto != undefined)
       $scope.IstitutoFiltro = itemIstituto.Chiave;
    else $scope.IstitutoFiltro = -1;
  }

  $scope.CheckCumulativo = function()
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
           return
        }
        else $scope.CumulativoPossibile = true;
    }
  }

  $scope.InviaCumulativo = function()
  {
    var $ObjQuery = {Operazioni:[]};
    var ParametriSpedizione = '';
    for(let i = 0;i < $scope.ListaSpedizioni.length;i ++)
    {
        if($scope.ListaSpedizioni[i].Tipo == 1 && $scope.ListaSpedizioni[i].Selezionato)
           ParametriSpedizione += ParametriSpedizione + $scope.ListaSpedizioni[i].ChiaveDettaglio + ',';
          
    }
    ParametriSpedizione = ParametriSpedizione.substring(0, ParametriSpedizione.length - 1) 
    $ObjQuery.Operazioni.push({
                                Query     : 'ChangeDeliveryToSendAdvanced',
                                Parametri : {ChiaveDettaglio : ParametriSpedizione}
                              }); 
    SystemInformation.PostSQL('Delivery',$ObjQuery,function(Answer)
    {
      $scope.RefreshListaSpedizioniAll();
    });
  }  
  
  $scope.RefreshListaSpedizioniAll = function()
  { 
    if($scope.DataRicercaDal == undefined || $scope.DataRicercaAl == undefined)
       return;
    let TmpDate = new Date($scope.DataRicercaAl);
    TmpDate.setDate($scope.DataRicercaAl.getDate() + 1);
    
    var ParamSpedizione = {
                            Dal          : ZHTMLInputFromDate($scope.DataRicercaDal), 
                            Al           : ZHTMLInputFromDate(TmpDate),
                            ChiaviTitolo : []
                          };
    
    if($scope.ListaTitoliFiltro.length > 0)
    {
       for(let i = 0;i < $scope.ListaTitoliFiltro.length;i ++)
           ParamSpedizione.ChiaviTitolo.push($scope.ListaTitoliFiltro[i].Chiave)
       ParamSpedizione.ChiaviTitolo = ParamSpedizione.ChiaviTitolo.toString()         
    }
    else return 
     
    if($scope.IsAdministrator())
    {
      SystemInformation.GetSQL('Delivery',ParamSpedizione,function(Results)
      {
        ListaSpedizioniTmp = SystemInformation.FindResults(Results,'DettaglioDisponibiliAdmin');
        if (ListaSpedizioniTmp != undefined) 
        {
          var LastSpedizione = -1;
          $scope.ListaSpedizioni = [];
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
                                             DocenteNome      : ListaSpedizioniTmp[i].NOME_DOCENTE == null ? 'N.D.' : ListaSpedizioniTmp[i].NOME_DOCENTE,
                                             Provincia        : ListaSpedizioniTmp[i].PROVINCIA,
                                             Promotore        : ListaSpedizioniTmp[i].PROMOTORE,
                                             Istituto         : ListaSpedizioniTmp[i].ISTITUTO
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
                                           Selezionato     : false
                                        });
            
          }                  
        }
        else SystemInformation.ApplyOnError('Modello spedizione non conforme','')     
      },'SQLDettaglioTitoliDisponibiliAdmin')     
    }
    else
    {    
      SystemInformation.GetSQL('Delivery',ParamSpedizione,function(Results)
      {
        ListaSpedizioniTmp = SystemInformation.FindResults(Results,'DettaglioDisponibiliPromotore');
        if (ListaSpedizioniTmp != undefined) 
        {
          var LastSpedizione = -1;
          $scope.ListaSpedizioni = [];
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
                                             DocenteNome      : ListaSpedizioniTmp[i].NOME_DOCENTE == null ? 'N.D.' : ListaSpedizioniTmp[i].NOME_DOCENTE,
                                             Provincia        : ListaSpedizioniTmp[i].PROVINCIA,
                                             Promotore        : ListaSpedizioniTmp[i].PROMOTORE,
                                             Istituto         : ListaSpedizioniTmp[i].ISTITUTO
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
                                           Selezionato     : false
                                        });
            
          }                  
        }
        else SystemInformation.ApplyOnError('Modello spedizione non conforme','')     
      },'SQLDettaglioTitoliDisponibiliPromotore')  
    }
  }
  
  $scope.SelezionaTutto = function()
  {
    if($scope.ListaSpedizioni != undefined)
    {
     if(CheckAll)
     {
      for(let i = 0;i < $scope.ListaSpedizioni.length;i ++)
          if($scope.ListaSpedizioni[i].Tipo == 1)
             $scope.ListaSpedizioni[i].Selezionato = true;
     }
    }
  }
  
  $scope.DeselezionaTutto = function()
  {
    if($scope.ListaSpedizioni != undefined)
    {
      for(let i = 0;i < $scope.ListaSpedizioni.length;i ++)
          if($scope.ListaSpedizioni[i].Tipo == 1)
             $scope.ListaSpedizioni[i].Selezionato = false;
    }
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
         alert('Nessun titolo selezionato!');
         return
      }
      else
      {
         for(let j = 0;j < $scope.ListaTitoliFiltroTmp.length;j ++)
                $scope.ListaTitoliFiltro.push($scope.ListaTitoliFiltroTmp[j]);
         if(ContatoreDoppi != 0)
            alert('Alcuni titoli erano già stati inseriti nel filtro!');          
         $scope.ListaTitoliFiltroTmp = [];
         $scope.NomeFiltro   = '';
         $scope.CodiceFiltro = '';        
         $mdDialog.hide();
         $scope.RefreshListaSpedizioniAll();
      }      
    };
  }
  
  $scope.RimuoviTitolo = function(Titolo)
  {
    TitoloCorrisp = $scope.ListaTitoliFiltro.findIndex(function(ATitolo){return(ATitolo.Chiave == Titolo.Chiave);});
    $scope.ListaTitoliFiltro.splice(TitoloCorrisp,1);
    $scope.RefreshListaSpedizioniAll();
  }
  
  //$scope.RefreshListaSpedizioniAll();
  //$scope.CheckCumulativo();

}]);

SIRIOApp.filter('TitoloPopupByFiltro',function()
{
  return function(ListaTitoliPopup,NomeFiltro,CodiceFiltro)
         {
           if(NomeFiltro == '' && CodiceFiltro == '') 
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

SIRIOApp.filter('SpedizioneByFiltroAvanzato',function()
{
  return function(ListaSpedizioni,ProvinciaFiltro,PromotoreFiltro,IstitutoFiltro,DocenteFiltro)
         {
           if (ListaSpedizioni != undefined)
           {  
             if(ProvinciaFiltro == -1 && PromotoreFiltro == -1 && IstitutoFiltro == -1 && DocenteFiltro == -1) 
                return(ListaSpedizioni);
             var ListaFiltrata = [];
             ProvinciaFiltro = parseInt(ProvinciaFiltro);
             
             var SpedizioneOk = function(Spedizione)
             {  
                var Result = true;
                if(ProvinciaFiltro != -1)
                   if(Spedizione.Provincia != ProvinciaFiltro)
                      Result = false;
                
                if(DocenteFiltro != -1)
                   if(Spedizione.Docente != DocenteFiltro)
                      Result = false;
                      
                if(IstitutoFiltro != -1)
                    if(Spedizione.Istituto != IstitutoFiltro)
                       Result = false;
                
                if(PromotoreFiltro != -1)
                    if(Spedizione.Promotore != PromotoreFiltro)
                       Result = false;
                     
                return(Result);
             }
             
             var AddTitoli = false;
             
             for(let i = 0; i < ListaDettaglio.length; i++)
             {
                 if(ListaDettaglio[i].Tipo == 0)
                 {
                  if(SpedizioniOk(ListaDettaglio[i]))
                  {
                     ListaFiltrata.push(ListaDettaglio[i]);
                     AddTitoli = true;
                  }
                  else AddTitoli = false
                 }
                 else
                 {
                  if(AddTitoli)
                     ListaFiltrata.push(ListaDettaglio[i]);
                 }
             }                            
             return(ListaFiltrata);
           }
         }         
});
