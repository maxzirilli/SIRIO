SIRIOApp.controller("deliveryListPageController",['$scope','SystemInformation','$state','$rootScope','$mdDialog','$sce','$filter','ZConfirm',
function($scope,SystemInformation,$state,$rootScope,$mdDialog,$sce,$filter,ZConfirm)
{
  $scope.DaSpedireFiltro  = true;
  $scope.PrenotataFiltro  = true;
  $scope.ConsegnataFiltro = false;
  $scope.ProvinciaFiltro  = -1;
  $scope.PromotoreFiltro  = -1;
  $scope.IstitutoFiltro   = -1;
  $scope.DocenteFiltro    = -1;
  ListaSpedizioni         = [];
  $scope.TitoloFiltro     = -1;
  $scope.DataRicercaAl    = new Date();
  let TmpDate             = new Date($scope.DataRicercaAl);
  TmpDate.setDate(TmpDate.getDate() - 7);
  $scope.DataRicercaDal   = new Date(TmpDate);
 
  ScopeHeaderController.CheckButtons(); 
  
  $scope.IsAdministrator = function ()
  {
    return SystemInformation.UserInformation.Ruolo == RUOLO_AMMINISTRATORE;
  }
  
  $scope.ConvertiData = function (Dati)
  {
     return(ZFormatDateTime('dd/mm/yyyy',ZDateFromHTMLInput(Dati.Data)));
  }
  
  $scope.GestioneAvanzataSpedizioni = function()
  {
    $state.go("deliveryAdvancedManagementPage");
  }

  function CreaDocumentoCumulativo(CumulativoTitoli,NomeDocumento)
  {           
    var WBook = {
                  SheetNames : [],
                  Sheets     : {}
                };

    var SheetName          = "CUMULATIVO PRENOTAZIONI";
    var BodySheet          = {};

    BodySheet['A1'] = SystemInformation.GetCellaIntestazione('EDITORE');
    BodySheet['B1'] = SystemInformation.GetCellaIntestazione('ISBN');
    BodySheet['C1'] = SystemInformation.GetCellaIntestazione('TITOLO');
    BodySheet['D1'] = SystemInformation.GetCellaIntestazione('QUANTITA TOTALE');
    
    var ListaTitoli  = [];
    for(let j = 0;j < CumulativoTitoli.length;j ++)
    {
        TitoloGiaInserito = ListaTitoli.findIndex(function(ATitolo){return(ATitolo.Chiave == CumulativoTitoli[j].Chiave)})
        if(TitoloGiaInserito == -1)
            ListaTitoli.push(CumulativoTitoli[j])
        else ListaTitoli[TitoloGiaInserito].Quantita += CumulativoTitoli[j].Quantita
    }
    var CasaEditrice = '-1';
    for(let k = 0;k < ListaTitoli.length;k ++)
    {
        if(CasaEditrice != ListaTitoli[k].Editore)
            BodySheet['A' + parseInt(k + 2)] = SystemInformation.GetCellaDati('s',ListaTitoli[k].Editore);

        BodySheet['B' + parseInt(k + 2)] = SystemInformation.GetCellaDati('s',ListaTitoli[k].Codice);
        BodySheet['C' + parseInt(k + 2)] = SystemInformation.GetCellaDati('s',ListaTitoli[k].Titolo);
        BodySheet['D' + parseInt(k + 2)] = SystemInformation.GetCellaDati('s',ListaTitoli[k].Quantita.toString());

        CasaEditrice = ListaTitoli[k].Editore;
    }

    BodySheet["!cols"] = [             
                          {wpx: 250},
                          {wpx: 250},
                          {wpx: 250},
                          {wpx: 250}
                        ];
    BodySheet['!ref'] = 'A1:D1' + parseInt(ListaTitoli.length + 1);
    
    WBook.SheetNames.push(SheetName);
    WBook.Sheets[SheetName]    = BodySheet;

    var Data           = new Date();
    var DataAnno       = Data.getFullYear();
    var DataMese       = Data.getMonth()+1; 
    var DataGiorno     = Data.getDate();
    var DataCumulativo = DataGiorno.toString() + '/' + DataMese.toString() +  '/' + DataAnno.toString();

    var wbout = XLSX.write(WBook, {bookType:'xlsx', bookSST:true, type: 'binary'});
    saveAs(new Blob([SystemInformation.s2ab(wbout)],{type:"application/octet-stream"}), NomeDocumento + DataCumulativo + ".xlsx");
  }

  //STAMPA CUMULATIVO PRENOTATI

  $scope.ApriCumulativoPrenotati = function(ev)
  {    
      $mdDialog.show({ 
                       controller          : DialogControllerXlsPrenotati,
                       templateUrl         : "template/documentBookedUpPopup.html",
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

  function DialogControllerXlsPrenotati($scope,$mdDialog)
  {
    $scope.DataRicercaAlPrnt    = new Date();
    let TmpDatePrnt             = new Date($scope.DataRicercaAlPrnt);
    TmpDatePrnt.setDate(TmpDatePrnt.getDate() - 7);
    $scope.DataRicercaDalPrnt   = new Date(TmpDatePrnt);

    $scope.hide = function() 
    {
      $mdDialog.hide();
    };

    $scope.AnnullaPopupPrenotati = function() 
    {
      $scope.DataRicercaAlPrnt    = new Date();
      let TmpDatePrnt             = new Date($scope.DataRicercaAlPrnt);
      TmpDatePrnt.setDate(TmpDatePrnt.getDate() - 7);
      $scope.DataRicercaDalPrnt   = new Date(TmpDatePrnt);
      $mdDialog.cancel();
    };

    $scope.CreaXlsPrenotati = function()
    {
      var CumulativoPrenotatiTmp = [];
      var CumulativoPrenotati    = []

      if($scope.DataRicercaDalPrnt == undefined || $scope.DataRicercaAlPrnt == undefined)
         return;
      let TmpDatePrnt = new Date($scope.DataRicercaAlPrnt);
      TmpDatePrnt.setDate($scope.DataRicercaAlPrnt.getDate() + 1);
      
      var ParamPrenotati = {
                              Dal : ZHTMLInputFromDate($scope.DataRicercaDalPrnt), 
                              Al  : ZHTMLInputFromDate(TmpDatePrnt)
                           };
      SystemInformation.GetSQL('Delivery',ParamPrenotati,function(Results)
      {
        CumulativoPrenotatiTmp = SystemInformation.FindResults(Results,'BookedUpCumulative')
        if (CumulativoPrenotatiTmp != undefined)
        {
            if(CumulativoPrenotatiTmp.length == 0)
               ZCustomAlert($mdDialog,'AVVISO','NESSUN TITOLO PRENOTATO NEL PERIODO INDICATO')
            else
            {
              for(let i = 0;i < CumulativoPrenotatiTmp.length;i ++)
                  CumulativoPrenotatiTmp[i] = {
                                                Editore  : CumulativoPrenotatiTmp[i].EDITORE_TITOLO == null ? 'EDITORE NON REGISTRATO' : CumulativoPrenotatiTmp[i].EDITORE_TITOLO,
                                                Chiave   : CumulativoPrenotatiTmp[i].TITOLO,
                                                Titolo   : CumulativoPrenotatiTmp[i].NOME_TITOLO == null ? 'NOME NON REGISTRATO' : CumulativoPrenotatiTmp[i].NOME_TITOLO,
                                                Codice   : CumulativoPrenotatiTmp[i].CODICE_TITOLO,
                                                Quantita : parseInt(CumulativoPrenotatiTmp[i].QUANTITA)
                                              }
              CumulativoPrenotati = CumulativoPrenotatiTmp
              
              CreaDocumentoCumulativo(CumulativoPrenotati,'CumulativoPrenotati')
              $mdDialog.hide();
            }
        }
        else SystemInformation.ApplyOnError('Modello cumulativo prenotati non conforme','')
      },'SQLCumulativoPrenotati')
    }
  }

  //STAMPA CUMULATIVO CONSEGNATI

  $scope.ApriCumulativoConsegnati = function(ev)
  {    
      $mdDialog.show({ 
                       controller          : DialogControllerXlsConsegnati,
                       templateUrl         : "template/documentDeliveredPopup.html",
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

  function DialogControllerXlsConsegnati($scope,$mdDialog)
  {
    $scope.DataRicercaAlCnsg    = new Date();
    let TmpDateCnsg             = new Date($scope.DataRicercaAlCnsg);
    TmpDateCnsg.setDate(TmpDateCnsg.getDate() - 7);
    $scope.DataRicercaDalCnsg   = new Date(TmpDateCnsg);

    $scope.hide = function() 
    {
      $mdDialog.hide();
    };

    $scope.AnnullaPopupConsegnati = function() 
    {
      $scope.DataRicercaAlCnsg    = new Date();
      let TmpDateCnsg             = new Date($scope.DataRicercaAlCnsg);
      TmpDateCnsg.setDate(TmpDateCnsg.getDate() - 7);
      $scope.DataRicercaDalCnsg   = new Date(TmpDateCnsg);
      $mdDialog.cancel();
    };

    $scope.CreaXlsConsegnati = function()
    {
      var CumulativoConsegnatiTmp = [];
      var CumulativoConsegnati    = [];

      if($scope.DataRicercaDalCnsg == undefined || $scope.DataRicercaAlCnsg == undefined)
         return;
      let TmpDateCnsg = new Date($scope.DataRicercaAlCnsg);
      TmpDateCnsg.setDate($scope.DataRicercaAlCnsg.getDate() + 1);
      
      var ParamConsegnati = {
                              Dal : ZHTMLInputFromDate($scope.DataRicercaDalCnsg), 
                              Al  : ZHTMLInputFromDate(TmpDateCnsg)
                            };
      SystemInformation.GetSQL('Delivery',ParamConsegnati,function(Results)
      {
        CumulativoConsegnatiTmp = SystemInformation.FindResults(Results,'DeliveredCumulative')
        if (CumulativoConsegnatiTmp != undefined)
        {
            if(CumulativoConsegnatiTmp.length == 0)
               ZCustomAlert($mdDialog,'AVVISO','NESSUN TITOLO CONSEGNATO NEL PERIODO INDICATO')
            else
            {
              for(let i = 0;i < CumulativoConsegnatiTmp.length;i ++)
              CumulativoConsegnatiTmp[i] = {
                                             Editore  : CumulativoConsegnatiTmp[i].EDITORE_TITOLO == null ? 'EDITORE NON REGISTRATO' : CumulativoConsegnatiTmp[i].EDITORE_TITOLO,
                                             Chiave   : CumulativoConsegnatiTmp[i].TITOLO,
                                             Titolo   : CumulativoConsegnatiTmp[i].NOME_TITOLO == null ? 'NOME NON REGISTRATO' : CumulativoConsegnatiTmp[i].NOME_TITOLO,
                                             Codice   : CumulativoConsegnatiTmp[i].CODICE_TITOLO,
                                             Quantita : parseInt(CumulativoConsegnatiTmp[i].QUANTITA)
                                           }
              CumulativoConsegnati = CumulativoConsegnatiTmp
          
              CreaDocumentoCumulativo(CumulativoConsegnati,'CumulativoConsegnati')
              $mdDialog.hide();        
            }              
        }
        else SystemInformation.ApplyOnError('Modello cumulativo consegnati non conforme','')
      },'SQLCumulativoConsegnati')
    }
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
  
  SystemInformation.GetSQL('Accessories',{}, function(Results)
  {
    ListaProvinceAllTmp = SystemInformation.FindResults(Results,'ProvinceListAllOnlyHandled');
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

  SystemInformation.GetSQL('Book', {}, function(Results)  
  {  
    TitoliInfoLista = SystemInformation.FindResults(Results,'BookListFilter');
    if(TitoliInfoLista != undefined)
    { 
       for(let i = 0; i < TitoliInfoLista.length; i++)
           TitoliInfoLista[i] = { 
                                  Chiave         : TitoliInfoLista[i].CHIAVE,
                                  Nome           : TitoliInfoLista[i].TITOLO,
                                  Codice         : TitoliInfoLista[i].CODICE_ISBN,                              
                                }
       $scope.ListaTitoliFilter = TitoliInfoLista;
    }
    else SystemInformation.ApplyOnError('Modello titoli non conforme','');   
  },'SelectSQLFilter');
  
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
  
  $scope.queryDocente = function(searchTextDocente)
  {
     searchTextDocente = searchTextDocente.toUpperCase();
     return($scope.ListaDocenti.grep(function(Elemento) 
     { 
       return(Elemento.Nome.toUpperCase().indexOf(searchTextDocente) != -1);
     }));
  }

  $scope.queryTitolo = function(searchTextTit)
  {
     searchTextTit = searchTextTit.toUpperCase();
     return($scope.ListaTitoliFilter.grep(function(Elemento) 
     { 
       return(Elemento.Nome.toUpperCase().indexOf(searchTextTit) != -1 || Elemento.Codice.indexOf(searchTextTit) != -1);
     }));
  }
  
  $scope.selectedItemChangeTitolo = function(itemTit)
  {
    if(itemTit != undefined)
       $scope.TitoloFiltro = itemTit.Chiave;
    else $scope.TitoloFiltro  = -1;
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
  
  $scope.RefreshListaSpedizioniAll = function ()
  {
    $scope.GridOptions.query.page = 1; 
    if($scope.DataRicercaDal == undefined || $scope.DataRicercaAl == undefined)
       return;
    let TmpDate = new Date($scope.DataRicercaAl);
    TmpDate.setDate($scope.DataRicercaAl.getDate() + 1);
     
    if($scope.IsAdministrator())
    {
      SystemInformation.GetSQL('Delivery',{ Dal : ZHTMLInputFromDate($scope.DataRicercaDal), Al : ZHTMLInputFromDate(TmpDate) },function(Results)
      {
        ListaSpedizioniTmp = SystemInformation.FindResults(Results,'DeliveryListAll');
        if (ListaSpedizioniTmp != undefined) 
        {
          for(let i = 0; i < ListaSpedizioniTmp.length; i++)
          {
              ListaSpedizioniTmp[i] = {
                                        Chiave          : ListaSpedizioniTmp[i].CHIAVE,
                                        Presso          : ListaSpedizioniTmp[i].PRESSO == undefined ? 'N.D.' : ListaSpedizioniTmp[i].PRESSO,
                                        Docente         : ListaSpedizioniTmp[i].DOCENTE == undefined ? -1 : ListaSpedizioniTmp[i].DOCENTE,
                                        DocenteNome     : ListaSpedizioniTmp[i].NOME_DOCENTE == undefined ? '' : ListaSpedizioniTmp[i].NOME_DOCENTE,
                                        Data            : ListaSpedizioniTmp[i].DATA,
                                        Provincia       : ListaSpedizioniTmp[i].PROVINCIA,
                                        NrConsegnate    : ListaSpedizioniTmp[i].NR_CONSEGNATE,
                                        NrDaSpedire     : ListaSpedizioniTmp[i].NR_DA_SPEDIRE,
                                        NrPrenotate     : ListaSpedizioniTmp[i].NR_PRENOTATE,
                                        Promotore       : ListaSpedizioniTmp[i].PROMOTORE,
                                        Istituto        : ListaSpedizioniTmp[i].ISTITUTO == null ? -1 : ListaSpedizioniTmp[i].ISTITUTO,
                                        Spedibile       : false,
                                        DettagliTitoli  : []
                                      }
              SystemInformation.GetSQL('Delivery',{CHIAVE : ListaSpedizioniTmp[i].Chiave},function(Results)
              {
                AdminSpedizioniDettaglioTmp = SystemInformation.FindResults(Results,'GenericDeliveryDettaglio');
                if(AdminSpedizioniDettaglioTmp != undefined)
                {
                   for(let j = 0;j < AdminSpedizioniDettaglioTmp.length;j ++)
                   {                     
                       if (AdminSpedizioniDettaglioTmp[j].SPEDIBILE == 1)
                       {                                                                   
                           ListaSpedizioniTmp[i].Spedibile = true;
                       }
                       switch(AdminSpedizioniDettaglioTmp[j].STATO)
                       {
                              case 'P' : AdminSpedizioniDettaglioTmp[j].STATO = 'PRENOTATO'
                                         break;
                              case 'S' : AdminSpedizioniDettaglioTmp[j].STATO = 'DA SPEDIRE'
                                         break;
                              case 'C' : AdminSpedizioniDettaglioTmp[j].STATO = 'CONSEGNATO'
                                         break;
                              default  : AdminSpedizioniDettaglioTmp[j].STATO = 'N.D';                                       
                                         
                       }
                       AdminSpedizioniDettaglioTmp[j] = {
                                                          Chiave       : AdminSpedizioniDettaglioTmp[j].CHIAVE,
                                                          Titolo       : AdminSpedizioniDettaglioTmp[j].TITOLO,
                                                          NomeTitolo   : AdminSpedizioniDettaglioTmp[j].NOME_TITOLO == undefined ? 'N.D' : AdminSpedizioniDettaglioTmp[j].NOME_TITOLO,
                                                          CodiceTitolo : AdminSpedizioniDettaglioTmp[j].CODICE_TITOLO == undefined ? 'N.D' : AdminSpedizioniDettaglioTmp[j].CODICE_TITOLO,
                                                          StatoTitolo  : AdminSpedizioniDettaglioTmp[j].STATO                         
                                                        }

                       ListaSpedizioniTmp[i].DettagliTitoli.push(AdminSpedizioniDettaglioTmp[j]);                                                               
                   }                    
                }
                else SystemInformation.ApplyOnError('Modello dettaglio spedizioni non conforme','');     
              },'SQLDettaglio')            
          }
          $scope.ListaSpedizioni = ListaSpedizioniTmp                           
        }
        else SystemInformation.ApplyOnError('Modello spedizioni non conforme','')     
      },'SQLAdmin')     
    }
    else
    {    
      SystemInformation.GetSQL('Delivery',{ Dal : ZHTMLInputFromDate($scope.DataRicercaDal), Al : ZHTMLInputFromDate(TmpDate) },function(Results)
      {
        ListaSpedizioniTmp = SystemInformation.FindResults(Results,'MyDeliveryList');
        if (ListaSpedizioniTmp != undefined) 
        {
          for(let i = 0; i < ListaSpedizioniTmp.length; i++)
          {
              ListaSpedizioniTmp[i] = {
                                        Chiave          : ListaSpedizioniTmp[i].CHIAVE,
                                        Presso          : ListaSpedizioniTmp[i].PRESSO == undefined ? 'N.D.' : ListaSpedizioniTmp[i].PRESSO,
                                        Docente         : ListaSpedizioniTmp[i].DOCENTE == undefined ? -1 : ListaSpedizioniTmp[i].DOCENTE,
                                        DocenteNome     : ListaSpedizioniTmp[i].NOME_DOCENTE == undefined ? '' : ListaSpedizioniTmp[i].NOME_DOCENTE,
                                        Data            : ListaSpedizioniTmp[i].DATA,
                                        Provincia       : ListaSpedizioniTmp[i].PROVINCIA,
                                        NrConsegnate    : ListaSpedizioniTmp[i].NR_CONSEGNATE,
                                        NrDaSpedire     : ListaSpedizioniTmp[i].NR_DA_SPEDIRE,
                                        NrPrenotate     : ListaSpedizioniTmp[i].NR_PRENOTATE,
                                        Promotore       : ListaSpedizioniTmp[i].PROMOTORE,
                                        Istituto        : ListaSpedizioniTmp[i].ISTITUTO == null ? -1 : ListaSpedizioniTmp[i].ISTITUTO,
                                        Spedibile       : false,
                                        DettagliTitoli  : []
                                      }
              SystemInformation.GetSQL('Delivery',{CHIAVE : ListaSpedizioniTmp[i].Chiave},function(Results)
              {
                PromotoreSpedizioniDettaglioTmp = SystemInformation.FindResults(Results,'GenericDeliveryDettaglio');
                if(PromotoreSpedizioniDettaglioTmp != undefined)
                {
                   for(let j = 0;j < PromotoreSpedizioniDettaglioTmp.length;j ++)
                   {                     
                       if (PromotoreSpedizioniDettaglioTmp[j].SPEDIBILE == 1)
                       {                                                                   
                           ListaSpedizioniTmp[i].Spedibile = true;
                       }
                       switch(PromotoreSpedizioniDettaglioTmp[j].STATO)
                       {
                              case 'P' : PromotoreSpedizioniDettaglioTmp[j].STATO = 'PRENOTATO'
                                         break;
                              case 'S' : PromotoreSpedizioniDettaglioTmp[j].STATO = 'DA SPEDIRE'
                                         break;
                              case 'C' : PromotoreSpedizioniDettaglioTmp[j].STATO = 'CONSEGNATO'
                                         break;
                              default  : PromotoreSpedizioniDettaglioTmp[j].STATO = 'N.D';                                       
                                         
                       }
                       PromotoreSpedizioniDettaglioTmp[j] = {
                                                              Chiave       : PromotoreSpedizioniDettaglioTmp[j].CHIAVE,
                                                              Titolo       : PromotoreSpedizioniDettaglioTmp[j].TITOLO,
                                                              NomeTitolo   : PromotoreSpedizioniDettaglioTmp[j].NOME_TITOLO == undefined ? 'N.D' : PromotoreSpedizioniDettaglioTmp[j].NOME_TITOLO,
                                                              CodiceTitolo : PromotoreSpedizioniDettaglioTmp[j].CODICE_TITOLO == undefined ? 'N.D' : PromotoreSpedizioniDettaglioTmp[j].CODICE_TITOLO,
                                                              StatoTitolo  : PromotoreSpedizioniDettaglioTmp[j].STATO                         
                                                            }

                       ListaSpedizioniTmp[i].DettagliTitoli.push(PromotoreSpedizioniDettaglioTmp[j]);                                                               
                   }                    
                }
                else SystemInformation.ApplyOnError('Modello dettaglio spedizioni non conforme','');     
              },'SQLDettaglio')            
          }
          $scope.ListaSpedizioni = ListaSpedizioniTmp                
        }
        else SystemInformation.ApplyOnError('Modello spedizioni non conforme','');     
      },'SQLPromotore');
    }
  }
  
  $scope.GetTitoliSpedizione = function(Spedizione)
  {
     var Result = '';
     for(let i = 0;i < Spedizione.DettagliTitoli.length;i ++)
     {
         Result += Spedizione.DettagliTitoli[i].CodiceTitolo + ' - ' + Spedizione.DettagliTitoli[i].NomeTitolo + ' - ' + Spedizione.DettagliTitoli[i].StatoTitolo + '</br>';
     }
     
     return($sce.trustAsHtml(Result.substr(0,Result.length)));
  }

  $scope.CreaXlsSpedizioni = function()
  {
    if($scope.DataRicercaDal == undefined || $scope.DataRicercaAl == undefined)
       return;
    let TmpDate = new Date($scope.DataRicercaAl);
    TmpDate.setDate($scope.DataRicercaAl.getDate() + 1);
    
    var WBook = {
	                  SheetNames : [],
	                  Sheets     : {}
                };
    
    
    var SheetName          = "SPEDIZIONI";
    var BodySheet          = {};
    var SheetNameCum       = "CUMULATIVO TITOLI";
    var BodySheetCum       = {};
    var ListaCumulativo    = [];
   
    let SpedizioniFiltrate = $filter('SpedizioneByFiltro')($scope.ListaSpedizioni,
                                                           $scope.ProvinciaFiltro,
                                                           $scope.PrenotataFiltro,
                                                           $scope.DaSpedireFiltro,
                                                           $scope.ConsegnataFiltro,
                                                           $scope.PromotoreFiltro,
                                                           $scope.IstitutoFiltro,
                                                           $scope.DocenteFiltro,
                                                           $scope.TitoloFiltro);
    if($scope.IsAdministrator())
    {
       BodySheet       = {};
       BodySheet['A1'] = SystemInformation.GetCellaIntestazione('DESTINATARIO');
       BodySheet['B1'] = SystemInformation.GetCellaIntestazione('DOCENTE');
       BodySheet['C1'] = SystemInformation.GetCellaIntestazione('INDIRIZZO');
       BodySheet['D1'] = SystemInformation.GetCellaIntestazione('DATA');
       BodySheet['E1'] = SystemInformation.GetCellaIntestazione('PROMOTORE');
       BodySheet['F1'] = SystemInformation.GetCellaIntestazione('ISBN');
       BodySheet['G1'] = SystemInformation.GetCellaIntestazione('TITOLO');
       BodySheet['H1'] = SystemInformation.GetCellaIntestazione('QUANTITA');
       BodySheet['I1'] = SystemInformation.GetCellaIntestazione('STATO');
   
       BodySheetCum       = {};
       BodySheetCum['A1'] = SystemInformation.GetCellaIntestazione('ISBN');
       BodySheetCum['B1'] = SystemInformation.GetCellaIntestazione('TITOLO');
       BodySheetCum['C1'] = SystemInformation.GetCellaIntestazione('TOTALE');
       BodySheetCum['D1'] = SystemInformation.GetCellaIntestazione('PRENOTATI');
       BodySheetCum['E1'] = SystemInformation.GetCellaIntestazione('DA SPEDIRE');
       BodySheetCum['F1'] = SystemInformation.GetCellaIntestazione('CONSEGNATI');

       
       SystemInformation.GetSQL('Delivery',{ Dal : ZHTMLInputFromDate($scope.DataRicercaDal), Al : ZHTMLInputFromDate(TmpDate) },function(Results)
       {
         var ListaSpedizioniToFilter = [];
         var SpedCorrisp             = {};
         var ListaSpedizioniFinale   = [];

         ListaSpedizioniToFilter = SystemInformation.FindResults(Results,'DeliveryListAdminXls');
         if(ListaSpedizioniToFilter != undefined)
         {
            for(let i = 0;i < ListaSpedizioniToFilter.length;i ++)
            {
                SpedCorrisp = SpedizioniFiltrate.find(function(ASpedizione){return (ASpedizione.Chiave == ListaSpedizioniToFilter[i].CHIAVE);});
                if(SpedCorrisp)
                   ListaSpedizioniFinale.push(ListaSpedizioniToFilter[i]);
            }              
            var ChiaveSpedizione = -1;
            for(let j = 0;j < ListaSpedizioniFinale.length;j ++)
            {                
                switch(ListaSpedizioniFinale[j].STATO)
                {
                       case 'S' : ListaSpedizioniFinale[j].STATO = 'DA SPEDIRE';
                                  break;
                       case 'P' : ListaSpedizioniFinale[j].STATO = 'PRENOTATO';
                                  break;
                       case 'C' : ListaSpedizioniFinale[j].STATO = 'CONSEGNATO';
                                  break;
                }
                
                if (ChiaveSpedizione != ListaSpedizioniFinale[j].CHIAVE)
                {
                    BodySheet['A' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaSpedizioniFinale[j].PRESSO);
                    BodySheet['B' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaSpedizioniFinale[j].NOME_DOCENTE == undefined ? '' : ListaSpedizioniFinale[j].NOME_DOCENTE);
                    BodySheet['C' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaSpedizioniFinale[j].INDIRIZZO + ', ' + ListaSpedizioniFinale[j].COMUNE + ', ' + ListaSpedizioniFinale[j].CAP + ', ' + ListaSpedizioniFinale[j].NOME_PROVINCIA);
                    BodySheet['D' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ZFormatDateTime('dd/mm/yyyy',ZDateFromHTMLInput(ListaSpedizioniFinale[j].DATA)));
                    BodySheet['E' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaSpedizioniFinale[j].NOME_PROMOTORE.toUpperCase()); 
                    BodySheet['F' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaSpedizioniFinale[j].CODICE_TITOLO);
                    BodySheet['G' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaSpedizioniFinale[j].NOME_TITOLO);
                    BodySheet['H' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaSpedizioniFinale[j].QUANTITA);
                    BodySheet['I' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaSpedizioniFinale[j].STATO);
                    
                    ChiaveSpedizione = ListaSpedizioniFinale[j].CHIAVE;
                }
                else
                {   
                    BodySheet['A' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s','');
                    BodySheet['B' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s','');
                    BodySheet['C' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s','');
                    BodySheet['D' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s','');
                    BodySheet['E' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',''); 
                    BodySheet['F' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaSpedizioniFinale[j].CODICE_TITOLO);
                    BodySheet['G' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaSpedizioniFinale[j].NOME_TITOLO);
                    BodySheet['H' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaSpedizioniFinale[j].QUANTITA);
                    BodySheet['I' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaSpedizioniFinale[j].STATO);
                   
                    ChiaveSpedizione = ListaSpedizioniFinale[j].CHIAVE;
                }
                
                TitoloCorrisp = ListaCumulativo.findIndex(function(ATitolo){return(ATitolo.Codice == ListaSpedizioniFinale[j].CODICE_TITOLO);});
                if(TitoloCorrisp == -1)
                {
                   ListaCumulativo.push({
                                          Codice     : ListaSpedizioniFinale[j].CODICE_TITOLO,
                                          Nome       : ListaSpedizioniFinale[j].NOME_TITOLO,
                                          Quantita   : ListaSpedizioniFinale[j].QUANTITA,
                                          Prenotati  : '0',
                                          DaSpedire  : '0',
                                          Consegnati : '0'
                                        })
                   switch(ListaSpedizioniFinale[j].STATO)
                   {
                          case 'PRENOTATO' : ListaCumulativo[ListaCumulativo.length-1].Prenotati = ListaSpedizioniFinale[j].QUANTITA;
                                     break;
                          case 'DA SPEDIRE' : ListaCumulativo[ListaCumulativo.length-1].DaSpedire = ListaSpedizioniFinale[j].QUANTITA;
                                     break;
                          case 'CONSEGNATO' : ListaCumulativo[ListaCumulativo.length-1].Consegnati = ListaSpedizioniFinale[j].QUANTITA;
                                     break
                   }
                }
                else 
                {
                   ListaCumulativo[TitoloCorrisp].Quantita = parseInt(ListaCumulativo[TitoloCorrisp].Quantita) + parseInt(ListaSpedizioniFinale[j].QUANTITA);   
                   ListaCumulativo[TitoloCorrisp].Quantita = ListaCumulativo[TitoloCorrisp].Quantita.toString()
                   
                   switch(ListaSpedizioniFinale[j].STATO)
                   {
                          case 'PRENOTATO' : ListaCumulativo[TitoloCorrisp].Prenotati = parseInt(ListaSpedizioniFinale[j].QUANTITA) + parseInt(ListaCumulativo[TitoloCorrisp].Prenotati);
                                     ListaCumulativo[TitoloCorrisp].Prenotati = ListaCumulativo[TitoloCorrisp].Prenotati.toString();
                                     break;
                          case 'DA SPEDIRE' : ListaCumulativo[TitoloCorrisp].DaSpedire = parseInt(ListaSpedizioniFinale[j].QUANTITA) + parseInt(ListaCumulativo[TitoloCorrisp].DaSpedire);
                                     ListaCumulativo[TitoloCorrisp].DaSpedire = ListaCumulativo[TitoloCorrisp].DaSpedire.toString();
                                     break;
                          case 'CONSEGNATO' : ListaCumulativo[TitoloCorrisp].Consegnati = parseInt(ListaSpedizioniFinale[j].QUANTITA) + parseInt(ListaCumulativo[TitoloCorrisp].Consegnati);
                                     ListaCumulativo[TitoloCorrisp].Consegnati = ListaCumulativo[TitoloCorrisp].Consegnati.toString();
                                     break;
                   }
                }                 
            }
            
            for(let k = 0;k < ListaCumulativo.length;k ++)
            {
              BodySheetCum['A' + parseInt(k + 2)] = SystemInformation.GetCellaDati('s',ListaCumulativo[k].Codice);
              BodySheetCum['B' + parseInt(k + 2)] = SystemInformation.GetCellaDati('s',ListaCumulativo[k].Nome);
              BodySheetCum['C' + parseInt(k + 2)] = SystemInformation.GetCellaDati('s',ListaCumulativo[k].Quantita);
              BodySheetCum['D' + parseInt(k + 2)] = SystemInformation.GetCellaDati('s',ListaCumulativo[k].Prenotati);
              BodySheetCum['E' + parseInt(k + 2)] = SystemInformation.GetCellaDati('s',ListaCumulativo[k].DaSpedire);
              BodySheetCum['F' + parseInt(k + 2)] = SystemInformation.GetCellaDati('s',ListaCumulativo[k].Consegnati);
            }
                
            
            BodySheet["!cols"] = [             
                                   {wpx: 150},
                                   {wpx: 150},
                                   {wpx: 250},
                                   {wpx: 150},
                                   {wpx: 150},
                                   {wpx: 150},
                                   {wpx: 200},
                                   {wpx: 50},
                                   {wpx: 100}
                                 ];
            BodySheet['!ref'] = 'A1:I1' + parseInt(ListaSpedizioniFinale.length + 1);
            
            BodySheetCum["!cols"] = [             
                                      {wpx: 150},
                                      {wpx: 200},
                                      {wpx: 100},
                                      {wpx: 100},
                                      {wpx: 100},
                                      {wpx: 100}
                                    ];
            BodySheetCum['!ref'] = 'A1:F1' + parseInt(ListaCumulativo.length + 1);
            
            WBook.SheetNames.push(SheetName);
            WBook.SheetNames.push(SheetNameCum);
            WBook.Sheets[SheetName]    = BodySheet;
            WBook.Sheets[SheetNameCum] = BodySheetCum;
            
            var wbout = XLSX.write(WBook, {bookType:'xlsx', bookSST:true, type: 'binary'});
            saveAs(new Blob([SystemInformation.s2ab(wbout)],{type:"application/octet-stream"}), "Spedizioni.xlsx")                                       
         }
         else SystemInformation.ApplyOnError('Modello spedizioni di confronto per xls non conforme','')
       },'SQLAdminXls');
    }
    else
    {
       BodySheet       = {};
       BodySheet['A1'] = SystemInformation.GetCellaIntestazione('DESTINATARIO');
       BodySheet['B1'] = SystemInformation.GetCellaIntestazione('DOCENTE');
       BodySheet['C1'] = SystemInformation.GetCellaIntestazione('INDIRIZZO');
       BodySheet['D1'] = SystemInformation.GetCellaIntestazione('DATA');
       BodySheet['E1'] = SystemInformation.GetCellaIntestazione('PROMOTORE');
       BodySheet['F1'] = SystemInformation.GetCellaIntestazione('ISBN');
       BodySheet['G1'] = SystemInformation.GetCellaIntestazione('TITOLO');
       BodySheet['H1'] = SystemInformation.GetCellaIntestazione('QUANTITA');
       BodySheet['I1'] = SystemInformation.GetCellaIntestazione('STATO');
       
       BodySheetCum       = {};
       BodySheetCum['A1'] = SystemInformation.GetCellaIntestazione('ISBN');
       BodySheetCum['B1'] = SystemInformation.GetCellaIntestazione('TITOLO');
       BodySheetCum['C1'] = SystemInformation.GetCellaIntestazione('TOTALE');
       BodySheetCum['D1'] = SystemInformation.GetCellaIntestazione('PRENOTATI');
       BodySheetCum['E1'] = SystemInformation.GetCellaIntestazione('DA SPEDIRE');
       BodySheetCum['F1'] = SystemInformation.GetCellaIntestazione('CONSEGNATI');
       
       SystemInformation.GetSQL('Delivery',{ Dal : ZHTMLInputFromDate($scope.DataRicercaDal), Al : ZHTMLInputFromDate(TmpDate) },function(Results)
       {
         var ListaSpedizioniToFilter = [];
         var SpedCorrisp             = {};
         var ListaSpedizioniFinale   = [];

         ListaSpedizioniToFilter = SystemInformation.FindResults(Results,'MyDeliveryListXls');
         if(ListaSpedizioniToFilter != undefined)
         {
            for(let i = 0;i < ListaSpedizioniToFilter.length;i ++)
            {
               SpedCorrisp = SpedizioniFiltrate.find(function(ASpedizione){return (ASpedizione.Chiave == ListaSpedizioniToFilter[i].CHIAVE);});
               if(SpedCorrisp)
                  ListaSpedizioniFinale.push(ListaSpedizioniToFilter[i]);
            }                              
            
            var ChiaveSpedizione = -1;                          
            for(let j = 0;j < ListaSpedizioniFinale.length;j ++)
            {
                switch(ListaSpedizioniFinale[j].STATO)
                {
                       case 'S' : ListaSpedizioniFinale[j].STATO = 'DA SPEDIRE';
                                  break;
                       case 'P' : ListaSpedizioniFinale[j].STATO = 'PRENOTATO';
                                  break;
                       case 'C' : ListaSpedizioniFinale[j].STATO = 'CONSEGNATO';
                                  break;
                }
                
                if (ChiaveSpedizione != ListaSpedizioniFinale[j].CHIAVE)
                {
                    BodySheet['A' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaSpedizioniFinale[j].PRESSO);
                    BodySheet['B' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaSpedizioniFinale[j].NOME_DOCENTE == undefined ? '' : ListaSpedizioniFinale[j].NOME_DOCENTE);
                    BodySheet['C' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaSpedizioniFinale[j].INDIRIZZO + ', ' + ListaSpedizioniFinale[j].COMUNE + ', ' + ListaSpedizioniFinale[j].CAP + ', ' + ListaSpedizioniFinale[j].NOME_PROVINCIA);
                    BodySheet['D' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ZFormatDateTime('dd/mm/yyyy',ZDateFromHTMLInput(ListaSpedizioniFinale[j].DATA)));
                    BodySheet['E' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaSpedizioniFinale[j].NOME_PROMOTORE.toUpperCase()); 
                    BodySheet['F' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaSpedizioniFinale[j].CODICE_TITOLO);
                    BodySheet['G' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaSpedizioniFinale[j].NOME_TITOLO);
                    BodySheet['H' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaSpedizioniFinale[j].QUANTITA);
                    BodySheet['I' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaSpedizioniFinale[j].STATO);
                    
                    ChiaveSpedizione = ListaSpedizioniFinale[j].CHIAVE;
                }
                else
                {
                    BodySheet['F' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaSpedizioniFinale[j].CODICE_TITOLO);
                    BodySheet['G' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaSpedizioniFinale[j].NOME_TITOLO);
                    BodySheet['H' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaSpedizioniFinale[j].QUANTITA);
                    BodySheet['I' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaSpedizioniFinale[j].STATO);
                    
                    ChiaveSpedizione = ListaSpedizioniFinale[j].CHIAVE;
                }
                
                TitoloCorrisp = ListaCumulativo.findIndex(function(ATitolo){return(ATitolo.Codice == ListaSpedizioniFinale[j].CODICE_TITOLO);});
                if(TitoloCorrisp == -1)
                {
                   ListaCumulativo.push({
                                          Codice   : ListaSpedizioniFinale[j].CODICE_TITOLO,
                                          Nome     : ListaSpedizioniFinale[j].NOME_TITOLO,
                                          Quantita : ListaSpedizioniFinale[j].QUANTITA,
                                          Prenotati  : '0',
                                          DaSpedire  : '0',
                                          Consegnati : '0'
                                        })
                   switch(ListaSpedizioniFinale[j].STATO)
                   {
                          case 'PRENOTATO' : ListaCumulativo[ListaCumulativo.length-1].Prenotati = ListaSpedizioniFinale[j].QUANTITA;
                                     break;
                          case 'DA SPEDIRE' : ListaCumulativo[ListaCumulativo.length-1].DaSpedire = ListaSpedizioniFinale[j].QUANTITA;
                                     break;
                          case 'CONSEGNATO' : ListaCumulativo[ListaCumulativo.length-1].Consegnati = ListaSpedizioniFinale[j].QUANTITA;
                                     break
                   }
                }                   
                else 
                {
                   ListaCumulativo[TitoloCorrisp].Quantita = parseInt(ListaCumulativo[TitoloCorrisp].Quantita) + parseInt(ListaSpedizioniFinale[j].QUANTITA);   
                   ListaCumulativo[TitoloCorrisp].Quantita = ListaCumulativo[TitoloCorrisp].Quantita.toString()
                   switch(ListaSpedizioniFinale[j].STATO)
                   {
                          case 'PRENOTATO' : ListaCumulativo[TitoloCorrisp].Prenotati = parseInt(ListaSpedizioniFinale[j].QUANTITA) + parseInt(ListaCumulativo[TitoloCorrisp].Prenotati);
                                     ListaCumulativo[TitoloCorrisp].Prenotati = ListaCumulativo[TitoloCorrisp].Prenotati.toString();
                                     break;
                          case 'DA SPEDIRE' : ListaCumulativo[TitoloCorrisp].DaSpedire = parseInt(ListaSpedizioniFinale[j].QUANTITA) + parseInt(ListaCumulativo[TitoloCorrisp].DaSpedire);
                                     ListaCumulativo[TitoloCorrisp].DaSpedire = ListaCumulativo[TitoloCorrisp].DaSpedire.toString();
                                     break;
                          case 'CONSEGNATO' : ListaCumulativo[TitoloCorrisp].Consegnati = parseInt(ListaSpedizioniFinale[j].QUANTITA) + parseInt(ListaCumulativo[TitoloCorrisp].Consegnati);
                                     ListaCumulativo[TitoloCorrisp].Consegnati = ListaCumulativo[TitoloCorrisp].Consegnati.toString();
                                     break;
                   }                                
                }                   
            }
            
            for(let k = 0;k < ListaCumulativo.length;k ++)
            {
              BodySheetCum['A' + parseInt(k + 2)] = SystemInformation.GetCellaDati('s',ListaCumulativo[k].Codice);
              BodySheetCum['B' + parseInt(k + 2)] = SystemInformation.GetCellaDati('s',ListaCumulativo[k].Nome);
              BodySheetCum['C' + parseInt(k + 2)] = SystemInformation.GetCellaDati('s',ListaCumulativo[k].Quantita);
              BodySheetCum['D' + parseInt(k + 2)] = SystemInformation.GetCellaDati('s',ListaCumulativo[k].Prenotati);
              BodySheetCum['E' + parseInt(k + 2)] = SystemInformation.GetCellaDati('s',ListaCumulativo[k].DaSpedire);
              BodySheetCum['F' + parseInt(k + 2)] = SystemInformation.GetCellaDati('s',ListaCumulativo[k].Consegnati);
            }
            
            
            BodySheet["!cols"] = [             
                                   {wpx: 150},
                                   {wpx: 150},
                                   {wpx: 250},
                                   {wpx: 150},
                                   {wpx: 150},
                                   {wpx: 200},
                                   {wpx: 50},
                                   {wpx: 100}
                                 ];
            BodySheet['!ref'] = 'A1:I1' + parseInt(ListaSpedizioniFinale.length + 1);
            
            BodySheetCum["!cols"] = [             
                                      {wpx: 150},
                                      {wpx: 200},
                                      {wpx: 100},
                                      {wpx: 100},
                                      {wpx: 100},
                                      {wpx: 100}
                                    ];
            BodySheetCum['!ref'] = 'A1:F1' + parseInt(ListaCumulativo.length + 1);
            
            WBook.SheetNames.push(SheetName);
            WBook.SheetNames.push(SheetNameCum);
            WBook.Sheets[SheetName]    = BodySheet;
            WBook.Sheets[SheetNameCum] = BodySheetCum;

            var Data           = new Date();
            var DataAnno       = Data.getFullYear();
            var DataMese       = Data.getMonth()+1; 
            var DataGiorno     = Data.getDate();
            var DataLista      = DataGiorno.toString() + '/' + DataMese.toString() +  '/' + DataAnno.toString();
            
            var wbout = XLSX.write(WBook, {bookType:'xlsx', bookSST:true, type: 'binary'});
            saveAs(new Blob([SystemInformation.s2ab(wbout)],{type:"application/octet-stream"}), "Spedizioni" + DataLista + ".xlsx")                            
         }
         else SystemInformation.ApplyOnError('Modello spedizioni di confronto per xls non conforme','')
       },'SQLPromotoreXls');        
    }
  }
  
  $scope.ModificaSpedizione = function (ChiaveSpedizione,ChiaveDocente = -1)
  {
    SystemInformation.DataBetweenController.ChiaveSpedizione = ChiaveSpedizione;
    SystemInformation.DataBetweenController.ChiaveDocente    = ChiaveDocente;
    SystemInformation.DataBetweenController.Provenienza      = 'DeliveryPage';
    $state.go("deliveryModDetailPage"); 
  }
  
  $scope.EliminaSpedizione = function (Spedizione)
  {
    var EliminaSped = function()
    {
      var $ObjQuery       = { Operazioni : [] };
      var ParamSpedizione = { CHIAVE : Spedizione.Chiave };
      
      $ObjQuery.Operazioni.push({
                                  Query     : 'DeleteDeliveryBookAll',
                                  Parametri : ParamSpedizione
                                });  

      $ObjQuery.Operazioni.push({
                                  Query     : 'DeleteDelivery',
                                  Parametri : ParamSpedizione
                                });
      
      SystemInformation.PostSQL('Delivery',$ObjQuery,function(Answer)
      {
        $scope.RefreshListaSpedizioniAll();
        $ObjQuery.Operazioni = [];
      });
    }
    ZConfirm.GetConfirmBox('AVVISO',"Eliminare la spedizione del " + Spedizione.Data + " presso " + Spedizione.Presso + " ?",EliminaSped,function(){});  
  }
  
  $scope.PassaADaSpedireDisponibili = function (ChiaveSped)
  {
    var PassaTitDaSped = function()
    {
      SystemInformation.GetSQL('Delivery',{CHIAVE : ChiaveSped},function(Results)
      {
        SpedizioneDettaglio = SystemInformation.FindResults(Results,'DeliveryDettaglio');
        if(SpedizioneDettaglio != undefined)
        {
            var ListaTitoliSped = [];
            for(let i = 0;i < SpedizioneDettaglio.length;i ++)
            {
                ListaTitoliSped.push({
                                      "TitoloNome"      : SpedizioneDettaglio[i].NOME_TITOLO,
                                      "Titolo"          : SpedizioneDettaglio[i].TITOLO,
                                      "ChiaveDettaglio" : SpedizioneDettaglio[i].CHIAVE,
                                      "QuantitaMgzn"    : SpedizioneDettaglio[i].QUANTITA_MGZN,
                                      "Quantita"        : SpedizioneDettaglio[i].QUANTITA
                                    });
            }
            var $ObjQuery = { Operazioni : [] }; 
            var TitoliNonDisponibili = [];
            var TitoliDaSpedire      = [];            
            for(let j = 0;j < ListaTitoliSped.length;j ++)
            {
              if(parseInt(ListaTitoliSped[j].Quantita) <= parseInt(ListaTitoliSped[j].QuantitaMgzn))
              {
                var ParamSpedizione = {
                                        "CHIAVE" : ListaTitoliSped[j].ChiaveDettaglio
                                      }
                $ObjQuery.Operazioni.push({
                                            Query     : 'ChangeDeliveryToSend',
                                            Parametri : ParamSpedizione
                                          })
                var OggettoD = '';
                OggettoD     = '\n' + 'Nr° : ' + ListaTitoliSped[j].Quantita.toString() + ' - ' + ListaTitoliSped[j].TitoloNome.toString();
                TitoliDaSpedire.push(OggettoD);
              }
              else
              {
                var OggettoNd = '';
                OggettoNd     = '\n' + 'Nr° : ' + ListaTitoliSped[j].Quantita.toString() + ' - ' + ListaTitoliSped[j].TitoloNome.toString();
                TitoliNonDisponibili.push(OggettoNd);
              }              
            }
            SystemInformation.PostSQL('Delivery',$ObjQuery,function(Results)
            {                            
              if(TitoliNonDisponibili.length != 0 && TitoliDaSpedire.length == 0)               
                ZCustomAlert($mdDialog,'AVVISO','I seguenti titoli non sono disponibili per essere spediti:  ' + TitoliNonDisponibili)
              else if (TitoliNonDisponibili.length == 0 && TitoliDaSpedire.length != 0)
                ZCustomAlert($mdDialog,'AVVISO','I seguenti titoli sono stati segnati come DA SPEDIRE : ' + TitoliDaSpedire)
              else if (TitoliNonDisponibili.length != 0 && TitoliDaSpedire.length != 0)
                ZCustomAlert($mdDialog,'AVVISO','I seguenti titoli sono stati segnati come DA SPEDIRE : ' + TitoliDaSpedire + '\n' + '\n' + 'I seguenti titoli non sono disponibili per essere spediti:  ' + TitoliNonDisponibili)
              $scope.ListaSpedizioni = [];
              $scope.RefreshListaSpedizioniAll();
            })                       
        }
        else SystemInformation.ApplyOnError('Modello dettaglio spedizione non conforme','');
      },'SQLDettaglioSpedizioneGenerico');
    }
    ZConfirm.GetConfirmBox('AVVISO',"Passare tutti i titoli della spedizione da PRENOTATI(DISPONIBILI) a DA SPEDIRE?",PassaTitDaSped,function(){}); 
  }

  $scope.NuovaSpedizioneCasaEditrice = function ()
  {
    SystemInformation.DataBetweenController.ChiaveSpedizione = -1;
    SystemInformation.DataBetweenController.ChiaveDocente    = -1;
    SystemInformation.DataBetweenController.Provenienza      = 'DeliveryPage';
    $state.go("deliveryModDetailPage");  
  }  
  
  $scope.RefreshListaSpedizioniAll();
  
}]);

SIRIOApp.filter('SpedizioneByFiltro',function()
{
  return function(ListaSpedizioni,ProvinciaFiltro,PrenotataFiltro,DaSpedireFiltro,ConsegnataFiltro,PromotoreFiltro,IstitutoFiltro,DocenteFiltro,TitoloFiltro)
         {
           if (ListaSpedizioni != undefined)
           {  
             if(ProvinciaFiltro == -1 && !PrenotataFiltro && !DaSpedireFiltro && !ConsegnataFiltro && PromotoreFiltro == -1 && IstitutoFiltro == -1 && DocenteFiltro == -1 && TitoloFiltro == -1) 
                return(ListaSpedizioni);
             var ListaFiltrata = [];
             ProvinciaFiltro = parseInt(ProvinciaFiltro);

             
             
             var SpedizioneOk = function(Spedizione)
             { 
                var TitoliTrovati = 0; 
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

                if(TitoloFiltro != -1)
                {
                  for(let i = 0;i < Spedizione.DettagliTitoli.length;i ++)
                    if(Spedizione.DettagliTitoli[i].Titolo == TitoloFiltro)
                       TitoliTrovati++
                  if (TitoliTrovati == 0) 
                      Result = false;
                }
                
                if(Result)
                   Result = (Spedizione.NrPrenotate  != 0 && PrenotataFiltro) ||
                            (Spedizione.NrDaSpedire  != 0 && DaSpedireFiltro) ||
                            (Spedizione.NrConsegnate != 0 && ConsegnataFiltro);
                     
                return(Result);
             }
             
              ListaSpedizioni.forEach(function(Spedizione)
              { 
                if(SpedizioneOk(Spedizione)) 
                   ListaFiltrata.push(Spedizione)                       
              });
              
              return(ListaFiltrata);
           }
         }
});

