SIRIOApp.controller("deliveryListPageController",['$scope','SystemInformation','$state','$rootScope','$mdDialog','$sce','$filter','ZConfirm',
function($scope,SystemInformation,$state,$rootScope,$mdDialog,$sce,$filter,ZConfirm)
{
  $scope.DaSpedireFiltro     = true;
  $scope.PrenotataFiltro     = true;
  $scope.ConsegnataFiltro    = false;
  $scope.CaricamentoInCorso  = false;
  $scope.ProvinciaFiltro     = -1;
  $scope.PromotoreFiltro     = -1;
  $scope.IstitutoFiltro      = -1;
  $scope.DocenteFiltro       = -1;
  ListaSpedizioni            = [];
  $scope.TitoloFiltro        = -1;
  $scope.ListaGruppi         = [];
  $scope.StatisticaPromotori = [];
  $scope.PromotoreFiltroStatistica  = -1;
  $scope.TitoloFiltroStat    = -1;
  $scope.StatisticaFiltrata  = [];
  $scope.StatisticaVisible   = false;
  $scope.ListaMateriePerDoc  = [];
  $scope.DataRicercaAl       = new Date();
  let TmpDate                = new Date($scope.DataRicercaAl);
  TmpDate.setDate(TmpDate.getDate() - 7);
  //$scope.DataRicercaDal   = new Date(TmpDate);
  var AnnoCorrente = new Date().getFullYear();
  $scope.DataRicercaDal = new Date(AnnoCorrente, 0, 1)

  ScopeHeaderController.CheckButtons(); 

  $scope.GetListaGruppi = function()
  {
    SystemInformation.GetSQL('PublisherGroup', {}, function(Results)  
    {
      GruppiInfoList = SystemInformation.FindResults(Results,'GroupInfoListHandled');
      if(GruppiInfoList != undefined)
      { 
         for(let i = 0;i < GruppiInfoList.length;i ++)
         GruppiInfoList[i] = {
                               Chiave       : GruppiInfoList[i].CHIAVE,
                               Descrizione  : GruppiInfoList[i].DESCRIZIONE,
                               DaAggiungere : true
                             }
         $scope.ListaGruppi      = GruppiInfoList;
         $scope.ListaGruppiPopup = GruppiInfoList
      } 
      else SystemInformation.ApplyOnError('Modello gruppi case editrici non conforme','');   
    },'SelectSQLHandled');
  }
  
  $scope.IsAdministrator = SystemInformation.IsAdministrator;

  //if ($scope.IsAdministrator())  //PER PROBLEMA CRASH TROPPE QUERY
      //$scope.DataRicercaDal = new Date(TmpDate);
  
  $scope.ConvertiData = function (Dati)
  {
     return(ZFormatDateTime('dd/mm/yyyy',ZDateFromHTMLInput(Dati.Data)));
  }
  
  $scope.GestioneAvanzataSpedizioni = function()
  {
    $state.go("deliveryAdvancedManagementPage");
  }

  function CreaDocumentoCumulativo(CumulativoTitoli,NomeDocumento,NomePromotore)
  {
    var Data           = new Date();
    var DataAnno       = Data.getFullYear();
    var DataMese       = Data.getMonth()+1; 
    var DataGiorno     = Data.getDate();
    Data               = DataGiorno.toString() + '-' + DataMese.toString() +  '-' + DataAnno.toString();          
    var WBook = {
                  SheetNames : [],
                  Sheets     : {}
                };

    var SheetName          = NomeDocumento == 'CumulativoPrenotati' ? "CUMULATIVO PRENOTAZIONI" : "CUMULATIVO CONSEGNE";
    var BodySheet          = {};
    var SheetNameCum       = "CUMULATIVO TITOLI";
    var BodySheetCum       = {};
    var ListaCumulativo    = [];

    if(NomeDocumento != 'CumulativoPrenotati')
       $scope.CheckNegativi = 'T';

    BodySheet       = {};
    BodySheet['A1'] = SystemInformation.GetCellaIntestazione('ISTITUTO DEST.');
    BodySheet['B1'] = SystemInformation.GetCellaIntestazione('DOCENTE');
    BodySheet['C1'] = SystemInformation.GetCellaIntestazione('INDIRIZZO');
    BodySheet['D1'] = SystemInformation.GetCellaIntestazione('DATA');
    BodySheet['E1'] = SystemInformation.GetCellaIntestazione('PROMOTORE');
    BodySheet['F1'] = SystemInformation.GetCellaIntestazione('ISBN');
    BodySheet['G1'] = SystemInformation.GetCellaIntestazione('TITOLO');
    BodySheet['H1'] = SystemInformation.GetCellaIntestazione('QUANTITA');

    BodySheetCum       = {};
    BodySheetCum['A1'] = SystemInformation.GetCellaIntestazione('ISBN');
    BodySheetCum['B1'] = SystemInformation.GetCellaIntestazione('TITOLO');
    BodySheetCum['C1'] = SystemInformation.GetCellaIntestazione('TOTALE');
    
    var ChiaveSpedizione = -1;
    for(let i = 0; i < CumulativoTitoli.length; i++)
    {
        if (ChiaveSpedizione != CumulativoTitoli[i].Spedizione)
        {
            BodySheet['A' + parseInt(i + 2)] = SystemInformation.GetCellaDati('s',CumulativoTitoli[i].Istituto == undefined ? CumulativoTitoli[i].Presso : CumulativoTitoli[i].Istituto);
            BodySheet['B' + parseInt(i + 2)] = SystemInformation.GetCellaDati('s',CumulativoTitoli[i].Docente == undefined ? '' : CumulativoTitoli[i].Docente);
            BodySheet['C' + parseInt(i + 2)] = SystemInformation.GetCellaDati('s',CumulativoTitoli[i].Indirizzo + ', ' + CumulativoTitoli[i].Comune + ', ' + CumulativoTitoli[i].CAP + ', ' + CumulativoTitoli[i].Provincia);
            BodySheet['D' + parseInt(i + 2)] = SystemInformation.GetCellaDati('s',ZFormatDateTime('dd/mm/yyyy',ZDateFromHTMLInput(CumulativoTitoli[i].Data)));
            BodySheet['E' + parseInt(i + 2)] = SystemInformation.GetCellaDati('s',CumulativoTitoli[i].NomePromotore.toUpperCase()); 
            BodySheet['F' + parseInt(i + 2)] = SystemInformation.GetCellaDati('s',CumulativoTitoli[i].Codice);
            BodySheet['G' + parseInt(i + 2)] = SystemInformation.GetCellaDati('s',CumulativoTitoli[i].Titolo);
            BodySheet['H' + parseInt(i + 2)] = SystemInformation.GetCellaDati('s',CumulativoTitoli[i].Quantita.toString());
            
            ChiaveSpedizione = CumulativoTitoli[i].Spedizione;
        }
        else
        {   
            BodySheet['A' + parseInt(i + 2)] = SystemInformation.GetCellaDati('s','');
            BodySheet['B' + parseInt(i + 2)] = SystemInformation.GetCellaDati('s','');
            BodySheet['C' + parseInt(i + 2)] = SystemInformation.GetCellaDati('s','');
            BodySheet['D' + parseInt(i + 2)] = SystemInformation.GetCellaDati('s','');
            BodySheet['E' + parseInt(i + 2)] = SystemInformation.GetCellaDati('s',''); 
            BodySheet['F' + parseInt(i + 2)] = SystemInformation.GetCellaDati('s',CumulativoTitoli[i].Codice);
            BodySheet['G' + parseInt(i + 2)] = SystemInformation.GetCellaDati('s',CumulativoTitoli[i].Titolo);
            BodySheet['H' + parseInt(i + 2)] = SystemInformation.GetCellaDati('s',CumulativoTitoli[i].Quantita.toString());
            
            ChiaveSpedizione = CumulativoTitoli[i].Spedizione;
        }
        
        TitoloCorrisp = ListaCumulativo.findIndex(function(ATitolo){return(ATitolo.Codice == CumulativoTitoli[i].Codice);});
        if(TitoloCorrisp == -1)
        {
            ListaCumulativo.push({
                                  Codice     : CumulativoTitoli[i].Codice,
                                  Nome       : CumulativoTitoli[i].Titolo,
                                  Quantita   : CumulativoTitoli[i].Quantita,
                                })
        }
        else 
        {
            ListaCumulativo[TitoloCorrisp].Quantita = parseInt(ListaCumulativo[TitoloCorrisp].Quantita) + parseInt(CumulativoTitoli[i].Quantita);   
            ListaCumulativo[TitoloCorrisp].Quantita = ListaCumulativo[TitoloCorrisp].Quantita.toString()
        }                 
    }

    ListaCumulativo.sort(function(a,b){
                                        if ((a.Nome).toUpperCase() < (b.Nome).toUpperCase()) 
                                          return -1
                                        return 1
                                      })
    
    for(let k = 0;k < ListaCumulativo.length;k ++)
    {
        BodySheetCum['A' + parseInt(k + 2)] = SystemInformation.GetCellaDati('s',ListaCumulativo[k].Codice);
        BodySheetCum['B' + parseInt(k + 2)] = SystemInformation.GetCellaDati('s',ListaCumulativo[k].Nome);
        BodySheetCum['C' + parseInt(k + 2)] = SystemInformation.GetCellaDati('s',ListaCumulativo[k].Quantita = ListaCumulativo[k].Quantita.toString());     
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
    BodySheet['!ref'] = 'A1:I1' + parseInt(CumulativoTitoli.length + 1);
    
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
    saveAs(new Blob([SystemInformation.s2ab(wbout)],{type:"application/octet-stream"}), NomeDocumento + Data + '.xls')
  }

  function CreaDocumentoCumulativoFile(CumulativoTitoli,Editore)
  { 
    var Data           = new Date();
    var DataAnno       = Data.getFullYear();
    var DataMese       = Data.getMonth()+1; 
    var DataGiorno     = Data.getDate();
    Data               = DataGiorno.toString() + '-' + DataMese.toString() +  '-' + DataAnno.toString();
     
    var WBook = {
                  SheetNames : [],
                  Sheets     : {}
                };

    var SheetName          = "CUMULATIVO PRENOTATI";
    var BodySheet          = {};

    var ListaTitoli  = [];
    for(let j = 0;j < CumulativoTitoli.length;j ++)
    {
        TitoloGiaInserito = ListaTitoli.findIndex(function(ATitolo){return(ATitolo.Chiave == CumulativoTitoli[j].Chiave)})
        if(TitoloGiaInserito == -1)
            ListaTitoli.push(CumulativoTitoli[j])
        else ListaTitoli[TitoloGiaInserito].Quantita += CumulativoTitoli[j].Quantita
    }
    
    let Operazione = ''
    if(Editore == 'M')
    {
      for(let k = 0;k < ListaTitoli.length;k ++)
      {
        var InserisciTitolo = function()
        { 
          BodySheet['A' + parseInt(k + 1)] = SystemInformation.GetCellaDati('s',ListaTitoli[k].Codice);
          BodySheet['B' + parseInt(k + 1)] = SystemInformation.GetCellaDati('s',Math.abs((parseInt(ListaTitoli[k].QuantitaMag) - parseInt(ListaTitoli[k].Quantita) + parseInt(ListaTitoli[k].QuantitaNovita))).toString());
          BodySheet['C' + parseInt(k + 1)] = SystemInformation.GetCellaDati('s','WP')
        }

        if((parseInt(ListaTitoli[k].QuantitaMag) - parseInt(ListaTitoli[k].Quantita) + parseInt(ListaTitoli[k].QuantitaNovita)) < 0)
            InserisciTitolo()
        else
        {
          ListaTitoli.splice(k,1)
          k--
        } 
      }
      BodySheet['!ref'] = 'A1:C1' + parseInt(ListaTitoli.length + 1);
      
      BodySheet["!cols"] = [             
                            {wpx: 130},
                            {wpx: 50},
                            {wpx: 50}
                          ];
      Operazione = 'InsertDataUltimaEsportazioneMondadori'
    }
    else
    {
      for(let k = 0;k < ListaTitoli.length;k ++)
      {
        var InserisciTitolo = function()
        { 
          BodySheet['A' + parseInt(k + 1)] = SystemInformation.GetCellaDati('s',ListaTitoli[k].Codice);
          BodySheet['B' + parseInt(k + 1)] = SystemInformation.GetCellaDati('s',Math.abs((parseInt(ListaTitoli[k].QuantitaMag) - parseInt(ListaTitoli[k].Quantita) + parseInt(ListaTitoli[k].QuantitaNovita))).toString());
          BodySheet['C' + parseInt(k + 1)] = SystemInformation.GetCellaDati('s','0')
          BodySheet['D' + parseInt(k + 1)] = SystemInformation.GetCellaDati('s','WP')
        }

        if((parseInt(ListaTitoli[k].QuantitaMag) - parseInt(ListaTitoli[k].Quantita) + parseInt(ListaTitoli[k].QuantitaNovita)) < 0)
          InserisciTitolo()
        else
        {
          ListaTitoli.splice(k,1)
          k--
        } 
      }
      BodySheet['!ref'] = 'A1:D1' + parseInt(ListaTitoli.length + 1);
      
      BodySheet["!cols"] = [             
                            {wpx: 130},
                            {wpx: 50},
                            {wpx: 50},
                            {wpx: 50}
                          ];
      Operazione = 'InsertDataUltimaEsportazioneDeAgostini'
    }
    
    WBook.SheetNames.push(SheetName);
    WBook.Sheets[SheetName] = BodySheet;
    
    var wbout = XLSX.write(WBook, {bookType:'xlsx', bookSST:true, type: 'binary'});
    let ObjQuery = {Operazioni: []}
    ObjQuery.Operazioni.push({Query : Operazione, Parametri : {Data: ConstPrepareForRecordDate($scope.DataRicercaAlPrnt)}})

    SystemInformation.PostSQL('Esportazioni',ObjQuery,function()
                                                  {
                                                    if(Editore == 'M')
                                                      saveAs(new Blob([SystemInformation.s2ab(wbout)],{type:"application/octet-stream"}),  "CumulativoMondadori" + Data + ".xls")    
                                                    else saveAs(new Blob([SystemInformation.s2ab(wbout)],{type:"application/octet-stream"}),  "CumulativoDeAgostini" + Data + ".xls")
                                                  });
    
  }

  //STAMPA CUMULATIVO PRENOTATI

  $scope.SelezioneGruppiXls = function (ev,Tipo)
  {
      $mdDialog.show({ 
                      controller          : DialogControllerSelezioneGruppi,
                      templateUrl         : "template/deliveryGroupSelect.html",
                      targetEvent         : ev,
                      scope               : $scope,
                      preserveScope       : true,
                      clickOutsideToClose : true,
                      locals              : {Tipo}
                    })
      .then(function(answer) 
      {
      }, 
      function() 
      {
      });
  }

  function DialogControllerSelezioneGruppi($scope,$mdDialog,Tipo)
  {
    $scope.ListaGruppiToAdd        = [];
    $scope.CheckGruppi             = 'G';
    $scope.CheckNegativi           = 'N';
    $scope.CheckPromotori          = 'T';
    $scope.PromotoreScelto         = -1;
    $scope.PromotoreSceltoNome     = '';
    $scope.Tipo                    = Tipo;
    $scope.ViewFiltroIstituto      = Tipo == 'C';
    $scope.ViewFiltroRuoloDocente  = Tipo == 'C';
    $scope.IstitutoFiltroPopup     = -1;
    $scope.searchTextIstitutoPopup = "";
    $scope.searchTextMat           = "";
    $scope.MateriaFiltro           = -1
    $scope.MateriaFiltroNome       = "";

    $scope.searchTextChangeMat = function(text)
    {
      if(!text)
         $scope.selectedItemChangeMateria(undefined)
    }

    $scope.queryMateria = function (searchTextMat) 
    {
      searchTextMat = searchTextMat.toUpperCase();
      return ($scope.ListaMateriePerDoc.grep(function (Elemento) 
      {
        return (Elemento.Nome.toUpperCase().indexOf(searchTextMat) != -1);
      }));
    }

    $scope.selectedItemChangeMateria = function (itemMat) 
    {
      if(itemMat != undefined) 
      {
         $scope.MateriaFiltro     = itemMat.Chiave;
         $scope.MateriaFiltroNome = itemMat.Nome
      }
      else $scope.MateriaFiltro = -1;
    }

    $scope.GetNomePromotore = function()
    {
       if($scope.PromotoreScelto != -1)
       {
          var Promotore = $scope.ListaPromotori.find(function(AProm){return (AProm.Chiave == $scope.PromotoreScelto);});
          if(Promotore != undefined)
          {
             $scope.PromotoreSceltoNome = Promotore.Nome;
             $scope.PromotoreSceltoNome =  $scope.PromotoreSceltoNome.replace(" ", "_").toUpperCase();
          }
          else $scope.PromotoreSceltoNome = '';
       }     
    }

    $scope.queryIstitutoPopup = function(searchTextIstituto)
    {
       searchTextIstituto = searchTextIstituto.toUpperCase();
       return($scope.ListaIstituti.grep(function(Elemento) 
       { 
         return(Elemento.Istituto.toUpperCase().indexOf(searchTextIstituto) != -1 || Elemento.CodiceIstituto.toUpperCase().indexOf(searchTextIstituto) != -1);
       }));
    }
  
    $scope.selectedItemChangeIstitutoPopup = function(itemIstituto)
    {
      if(itemIstituto != undefined)
         $scope.IstitutoFiltroPopup = itemIstituto.Chiave;
      else $scope.IstitutoFiltroPopup = -1;
    }    
    
    $scope.hide = function() 
    {
      $mdDialog.hide();
    };

    $scope.AnnullaPopup = function() 
    {
      $scope.PromotoreScelto     = -1;
      $scope.PromotoreSceltoNome = '';
      $scope.MateriaFiltro       = -1;
      $scope.MateriaFiltroNome   = '';
      $scope.IstitutoFiltroPopup = -1;
      for(let i = 0;i < $scope.ListaGruppiPopup.length;i ++)
          $scope.ListaGruppiPopup[i].DaAggiungere = false;          
      $scope.ListaGruppiToAdd  = [];
      $mdDialog.cancel();
    };

    $scope.ConfermaPopup = function()
    { 
      if($scope.IsAdministrator())
      {
         if($scope.CheckPromotori == 'T')
         {
            $scope.PromotoreScelto     = -1;
            $scope.PromotoreSceltoNome = '';
         } 
      }
      else $scope.PromotoreScelto = SystemInformation.UserInformation.Chiave;



      ContatoreGruppi = 0; 
      for(let j = 0;j < $scope.ListaGruppiPopup.length;j ++)
      {
        if($scope.ListaGruppiPopup[j].DaAggiungere)
        {
           $scope.ListaGruppiToAdd.push($scope.ListaGruppiPopup[j]);
           ContatoreGruppi++; 
           $scope.ListaGruppiPopup[j].DaAggiungere = true;
        }
      }
      if(ContatoreGruppi == 0 && $scope.CheckGruppi == 'G')
      {
         ZCustomAlert($mdDialog,'ATTENZIONE','NESSUN GRUPPO SELEZIONATO')
      }
      else
      {
        $mdDialog.hide();
        if(Tipo == 'P')
          $scope.ApriCumulativoPrenotati();
        else $scope.ApriCumulativoConsegnati();   
      }                       
    };
  }

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
    TmpDatePrnt.setDate(TmpDatePrnt.getDate() - 30);
    $scope.DataRicercaDalPrnt   = new Date(TmpDatePrnt);

    $scope.hide = function() 
    {
      $mdDialog.hide();
    };

    $scope.AnnullaPopupPrenotati = function() 
    {
      $scope.DataRicercaAlPrnt    = new Date();
      let TmpDatePrnt             = new Date($scope.DataRicercaAlPrnt);
      TmpDatePrnt.setDate(TmpDatePrnt.getDate() - 30);
      $scope.DataRicercaDalPrnt   = new Date(TmpDatePrnt);
      $scope.ListaGruppiToAdd     = [];
      $mdDialog.cancel();
    };

    $scope.CreaXlsPrenotati = function()
    {
      var CumulativoPrenotatiTmp = [];
      var CumulativoPrenotati    = []
      var ArrayGruppi            = [];

      for(let i = 0;i < $scope.ListaGruppiToAdd.length;i ++)
           ArrayGruppi.push($scope.ListaGruppiToAdd[i].Chiave);
                
      if($scope.DataRicercaDalPrnt == undefined || $scope.DataRicercaAlPrnt == undefined)
         return;
      let TmpDatePrnt = new Date($scope.DataRicercaAlPrnt);
      TmpDatePrnt.setDate($scope.DataRicercaAlPrnt.getDate() + 1);
      
      var ParamPrenotati = {
                              Dal : ZHTMLInputFromDate($scope.DataRicercaDalPrnt), 
                              Al  : ZHTMLInputFromDate(TmpDatePrnt)
                           };
      
      if(ArrayGruppi.length > 0 && $scope.CheckGruppi == 'G')
         ParamPrenotati.ChiaveGruppi = ArrayGruppi.toString() 

      if($scope.PromotoreScelto != -1  && $scope.PromotoreScelto != undefined)
         ParamPrenotati.PromotoreScelto = $scope.PromotoreScelto;

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
                                                Gruppo         : CumulativoPrenotatiTmp[i].GRUPPO_CASA == undefined ? 'NESSUN GRUPPO' : CumulativoPrenotatiTmp[i].GRUPPO_CASA, 
                                                Editore        : CumulativoPrenotatiTmp[i].EDITORE_TITOLO == null ? 'EDITORE NON REGISTRATO' : CumulativoPrenotatiTmp[i].EDITORE_TITOLO,
                                                Chiave         : CumulativoPrenotatiTmp[i].TITOLO,
                                                Titolo         : CumulativoPrenotatiTmp[i].NOME_TITOLO == null ? 'NOME NON REGISTRATO' : CumulativoPrenotatiTmp[i].NOME_TITOLO,
                                                Codice         : CumulativoPrenotatiTmp[i].CODICE_TITOLO,
                                                Quantita       : parseInt(CumulativoPrenotatiTmp[i].QUANTITA),
                                                QuantitaMag    : parseInt(CumulativoPrenotatiTmp[i].QUANTITA_MAGAZZINO),
                                                QuantitaNovita : CumulativoPrenotatiTmp[i].Q_PREN_NOVITA == undefined ? 0 : parseInt(CumulativoPrenotatiTmp[i].Q_PREN_NOVITA),
                                                NomePromotore  : CumulativoPrenotatiTmp[i].NOME_PROMOTORE,
                                                Presso         : CumulativoPrenotatiTmp[i].PRESSO,
                                                Docente        : CumulativoPrenotatiTmp[i].NOME_DOCENTE,
                                                Indirizzo      : CumulativoPrenotatiTmp[i].INDIRIZZO,
                                                Comune         : CumulativoPrenotatiTmp[i].COMUNE,
                                                CAP            : CumulativoPrenotatiTmp[i].CAP,
                                                Provincia      : CumulativoPrenotatiTmp[i].NOME_PROVINCIA,
                                                Data           : CumulativoPrenotatiTmp[i].DATA,
                                                Istituto       : CumulativoPrenotatiTmp[i].NOME_ISTITUTO,
                                                Spedizione     : CumulativoPrenotatiTmp[i].CHIAVE
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
    TmpDateCnsg.setDate(TmpDateCnsg.getDate() - 30);
    $scope.DataRicercaDalCnsg   = new Date(TmpDateCnsg);

    $scope.hide = function() 
    {
      $mdDialog.hide();
    };

    $scope.AnnullaPopupConsegnati = function() 
    {
      $scope.DataRicercaAlCnsg    = new Date();
      let TmpDateCnsg             = new Date($scope.DataRicercaAlCnsg);
      TmpDateCnsg.setDate(TmpDateCnsg.getDate() - 30);
      $scope.DataRicercaDalCnsg   = new Date(TmpDateCnsg);
      $scope.ListaGruppiToAdd     = [];
      $mdDialog.cancel();
    };

    $scope.CreaXlsConsegnati = function()
    {
      var CumulativoConsegnatiTmp = [];
      var CumulativoConsegnati    = [];
      var ArrayGruppi             = [];

      for(let i = 0;i < $scope.ListaGruppiToAdd.length;i ++)
          ArrayGruppi.push($scope.ListaGruppiToAdd[i].Chiave);

      if($scope.DataRicercaDalCnsg == undefined || $scope.DataRicercaAlCnsg == undefined)
         return;
      let TmpDateCnsg = new Date($scope.DataRicercaAlCnsg);
      TmpDateCnsg.setDate($scope.DataRicercaAlCnsg.getDate() + 1);
      
      var ParamConsegnati = {
                              Dal : ZHTMLInputFromDate($scope.DataRicercaDalCnsg), 
                              Al  : ZHTMLInputFromDate(TmpDateCnsg)
                            };

      if($scope.IstitutoFiltroPopup != undefined && $scope.IstitutoFiltroPopup != -1)
         ParamConsegnati.ChiaveIstituto = $scope.IstitutoFiltroPopup;

      if(ArrayGruppi.length > 0 && $scope.CheckGruppi == 'G')
        ParamConsegnati.ChiaveGruppi = ArrayGruppi.toString() 
      
      if($scope.PromotoreScelto != -1 && $scope.PromotoreScelto != undefined)
         ParamConsegnati.PromotoreScelto = $scope.PromotoreScelto;

      if($scope.MateriaFiltro != -1 && $scope.MateriaFiltro != undefined)
         ParamConsegnati.MateriaDocente = $scope.MateriaFiltro;

      console.log(ParamConsegnati)
      
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
                                                  Gruppo        : CumulativoConsegnatiTmp[i].GRUPPO_CASA == undefined ? 'NESSUN GRUPPO' : CumulativoConsegnatiTmp[i].GRUPPO_CASA, 
                                                  Editore       : CumulativoConsegnatiTmp[i].EDITORE_TITOLO == null ? 'EDITORE NON REGISTRATO' : CumulativoConsegnatiTmp[i].EDITORE_TITOLO,
                                                  Chiave        : CumulativoConsegnatiTmp[i].TITOLO,
                                                  Titolo        : CumulativoConsegnatiTmp[i].NOME_TITOLO == null ? 'NOME NON REGISTRATO' : CumulativoConsegnatiTmp[i].NOME_TITOLO,
                                                  Codice        : CumulativoConsegnatiTmp[i].CODICE_TITOLO,
                                                  Quantita      : parseInt(CumulativoConsegnatiTmp[i].QUANTITA),
                                                  NomePromotore : CumulativoConsegnatiTmp[i].NOME_PROMOTORE,
                                                  Presso        : CumulativoConsegnatiTmp[i].PRESSO,
                                                  Docente       : CumulativoConsegnatiTmp[i].NOME_DOCENTE,
                                                  Indirizzo     : CumulativoConsegnatiTmp[i].INDIRIZZO,
                                                  Comune        : CumulativoConsegnatiTmp[i].COMUNE,
                                                  CAP           : CumulativoConsegnatiTmp[i].CAP,
                                                  Provincia     : CumulativoConsegnatiTmp[i].NOME_PROVINCIA,
                                                  Data          : CumulativoConsegnatiTmp[i].DATA,
                                                  Istituto      : CumulativoConsegnatiTmp[i].NOME_ISTITUTO,
                                                  Spedizione    : CumulativoConsegnatiTmp[i].CHIAVE
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

  $scope.ApriStatisticaPromotori = function(ev) 
  {    
      $mdDialog.show({ 
                       controller          : DialogControllerStatisticaPromotori,
                       templateUrl         : "template/documentPromotersStatisticsPopup.html",
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

  function DialogControllerStatisticaPromotori($scope,$mdDialog)
  {
    $scope.DataRicercaAlPromotori    = new Date();
    let TmpDatePrmt                  = new Date($scope.DataRicercaAlPromotori);
    TmpDatePrmt.setDate(TmpDatePrmt.getDate() - 30);
    $scope.DataRicercaDalPromotori   = new Date(TmpDatePrmt);
    $scope.PromotoreFiltroStatistica = -1;
    $scope.TitoloFiltroStat          = -1;
    $scope.StatisticaVisible         = false;
    $scope.searchTextTitStat         = undefined;
    $scope.StatisticaPromotori       = [];
    $scope.StatisticaFiltrata        = [];
    $scope.IstitutoFiltroStat        = -1;
    $scope.searchTextIstitutoStat    = "";

    $scope.SetStatistica = function()
    {
      $scope.StatisticaFiltrata = $filter('StatisticaByFiltro')($scope.StatisticaPromotori,
                                                                $scope.PromotoreFiltroStatistica,
                                                                $scope.TitoloFiltroStat);
    }

    $scope.hide = function() 
    {
      $scope.PromotoreFiltroStatistica = -1;
      $scope.IstitutoFiltroStat        = -1;
      $scope.TitoloFiltroStat          = -1;
      $scope.StatisticaVisible         = false;
      $scope.searchTextTitStat         = undefined;
      $mdDialog.hide();
    };

    $scope.AnnullaPopupStatisticaPromotori = function() 
    {
      $scope.DataRicercaAlPromotori    = new Date();
      let TmpDatePrmt                  = new Date($scope.DataRicercaAlPromotori);
      TmpDatePrmt.setDate(TmpDatePrmt.getDate() - 30);
      $scope.DataRicercaDalPromotori    = new Date(TmpDatePrmt);
      $scope.PromotoreFiltroStatistica = -1;
      $scope.TitoloFiltroStat          = -1;
      $scope.StatisticaVisible         = false;
      $scope.searchTextTitStat         = undefined;
      $mdDialog.cancel();
    };

    $scope.queryTitoloStat = function(searchTextTitStat)
    {
       searchTextTitStat = searchTextTitStat.toUpperCase();
       return($scope.ListaTitoliFilter.grep(function(Elemento) 
       { 
         return(Elemento.Nome.toUpperCase().indexOf(searchTextTitStat) != -1 || Elemento.Codice.indexOf(searchTextTitStat) != -1);
       }));
    }
    
    $scope.selectedItemChangeTitoloStat = function(itemTitStat)
    {
      if(itemTitStat != undefined)
         $scope.TitoloFiltroStat = itemTitStat.Chiave;
      else $scope.TitoloFiltroStat  = -1;
      $scope.SetStatistica();
    }  

    $scope.queryIstitutoStat = function(searchTextIstituto)
    {
       searchTextIstituto = searchTextIstituto.toUpperCase();
       return($scope.ListaIstituti.grep(function(Elemento) 
       { 
         return(Elemento.Istituto.toUpperCase().indexOf(searchTextIstituto) != -1 || Elemento.CodiceIstituto.toUpperCase().indexOf(searchTextIstituto) != -1);
       }));
    }
  
    $scope.selectedItemChangeIstitutoStat = function(itemIstituto)
    {
      if(itemIstituto != undefined)
         $scope.IstitutoFiltroStat = itemIstituto.Chiave;
      else $scope.IstitutoFiltroStat = -1;
      $scope.CreaStatisticaPromotori()
    }  

    $scope.CreaStatisticaPromotori = function()
    {                
      if($scope.DataRicercaDalPromotori == undefined || $scope.DataRicercaAlPromotori == undefined)
         return;
      let TmpDatePrmt = new Date($scope.DataRicercaAlPromotori);
      TmpDatePrmt.setDate($scope.DataRicercaAlPromotori.getDate() + 1);
      
      var ParamStatistica = {
                               Dal : ZHTMLInputFromDate($scope.DataRicercaDalPromotori), 
                               Al  : ZHTMLInputFromDate(TmpDatePrmt)
                            };

      if($scope.IstitutoFiltroStat != undefined && $scope.IstitutoFiltroStat != -1)
         ParamStatistica.ChiaveIstituto = $scope.IstitutoFiltroStat;

      SystemInformation.GetSQL('Statistics',ParamStatistica,function(Results)
      {
        $scope.StatisticaFiltrata  = [];
        $scope.StatisticaPromotori = [];
        var StatisticaTmp = SystemInformation.FindResults(Results,'DeliveryCount');
        if(StatisticaTmp != undefined)
        {
           $scope.StatisticaVisible = true;
           var PromotoreTmp = '-1';
           for(let i = 0; i < StatisticaTmp.length; i ++)
           {
               if(StatisticaTmp[i].PROMOTORE != undefined && StatisticaTmp[i].PROMOTORE != PromotoreTmp)
               {
                  StatisticaTmp[i] = {
                                       Titolo          : StatisticaTmp[i].TITOLO == undefined ? 'N.D.' : StatisticaTmp[i].TITOLO,
                                       ChiaveTitolo    : StatisticaTmp[i].CHIAVE_TITOLO,
                                       Isbn            : StatisticaTmp[i].CODICE == undefined ? 'N.D.' : StatisticaTmp[i].CODICE,
                                       Stato           : StatisticaTmp[i].STATO,
                                       Totale          : StatisticaTmp[i].TOTALE,
                                       ChiavePromotore : StatisticaTmp[i].CHIAVE_PROMOTORE,
                                       Promotore       : StatisticaTmp[i].PROMOTORE == undefined ? 'N.D.' : StatisticaTmp[i].PROMOTORE,
                                       Prenotati       : 0,
                                       DaSpedire       : 0,
                                       Consegnati      : 0
                                     }
                  $scope.StatisticaPromotori.push(StatisticaTmp[i]);
               }
               switch(StatisticaTmp[i].Stato)
               {
                 case 'P' : $scope.StatisticaPromotori[$scope.StatisticaPromotori.length - 1].Prenotati = StatisticaTmp[i].Totale;
                            break;
                 case 'S' : $scope.StatisticaPromotori[$scope.StatisticaPromotori.length - 1].DaSpedire = StatisticaTmp[i].Totale;
                            break;
                 case 'C' : $scope.StatisticaPromotori[$scope.StatisticaPromotori.length - 1].Consegnati = StatisticaTmp[i].Totale;
                            break;
               } 

               $scope.SetStatistica();
           }
        }
        else  SystemInformation.ApplyOnError('Modello statistica spedizioni/titoli per promotore non conforme','')
      },'SelectDeliveryCount')
    }
    $scope.CreaStatisticaPromotori();

  }

  $scope.EsportaStatisticaPromotori = function()
  {

    var NomePromotore  = "";
    var CodiceIstituto = "";
    var CodiceTitolo   = "";

    if($scope.PromotoreFiltroStatistica != -1)
    {
       var Promotore = $scope.ListaPromotori.find(function(AProm){return (AProm.Chiave == $scope.PromotoreFiltroStatistica);});
       if(Promotore != undefined)
       {
          NomePromotore = Promotore.Nome + '_';
          NomePromotore = NomePromotore.replace(" ", "_").toUpperCase();
       }
       else NomePromotore = '';
    } 

    if($scope.IstitutoFiltroStat != -1)
    {
       var Istituto = $scope.ListaIstituti.find(function(AIst){return (AIst.Chiave == $scope.IstitutoFiltroStat);});
       if(Istituto != undefined)
          CodiceIstituto = Istituto.CodiceIstituto + '_';
       else CodiceIstituto = '';
    } 

    if($scope.TitoloFiltroStat != -1)
    {
       var Titolo = $scope.ListaTitoliFilter.find(function(ATit){return (ATit.Chiave == $scope.TitoloFiltroStat);});
       if(Titolo != undefined)
          CodiceTitolo = Titolo.Codice + '_';
       else CodiceTitolo = '';
    }         

    var WBook = {
                  SheetNames : [],
                  Sheets     : {}
                };

    var SheetName          = "STATISTICA SPEDIZIONI PROMOTORI";
    var BodySheet          = {};
    
    BodySheet['A1'] = SystemInformation.GetCellaIntestazione('ISBN');
    BodySheet['B1'] = SystemInformation.GetCellaIntestazione('TITOLO');
    BodySheet['C1'] = SystemInformation.GetCellaIntestazione('PROMOTORE');
    BodySheet['D1'] = SystemInformation.GetCellaIntestazione('PRENOTATI');
    BodySheet['E1'] = SystemInformation.GetCellaIntestazione('DA SPEDIRE');
    BodySheet['F1'] = SystemInformation.GetCellaIntestazione('CONSEGNATI');

    var KeyTitolo = -1;
    for(let i = 0; i < $scope.StatisticaFiltrata.length; i ++)
    {
        if($scope.StatisticaFiltrata[i].ChiaveTitolo != KeyTitolo)
        {
           BodySheet['A' + parseInt(i + 2)] = SystemInformation.GetCellaDati('s',$scope.StatisticaFiltrata[i].Isbn);
           BodySheet['B' + parseInt(i + 2)] = SystemInformation.GetCellaDati('s',$scope.StatisticaFiltrata[i].Titolo);
        }
        BodySheet['C' + parseInt(i + 2)] = SystemInformation.GetCellaDati('s',$scope.StatisticaFiltrata[i].Promotore);
        BodySheet['D' + parseInt(i + 2)] = SystemInformation.GetCellaDati('s',$scope.StatisticaFiltrata[i].Prenotati.toString());
        BodySheet['E' + parseInt(i + 2)] = SystemInformation.GetCellaDati('s',$scope.StatisticaFiltrata[i].DaSpedire.toString());
        BodySheet['F' + parseInt(i + 2)] = SystemInformation.GetCellaDati('s',$scope.StatisticaFiltrata[i].Consegnati.toString());
        
        KeyTitolo = $scope.StatisticaFiltrata[i].ChiaveTitolo;
    }

    BodySheet["!cols"] = [
                          {wpx: 150}, 
                          {wpx: 1000},            
                          {wpx: 250},
                          {wpx: 100},
                          {wpx: 100},
                          {wpx: 100} 
                        ];

    BodySheet['!ref'] = 'A1:F1' + parseInt($scope.StatisticaFiltrata.length + 1);
    
    WBook.SheetNames.push(SheetName);
    WBook.Sheets[SheetName] = BodySheet;

    var Data           = new Date();
    var DataAnno       = Data.getFullYear();
    var DataMese       = Data.getMonth()+1; 
    var DataGiorno     = Data.getDate();
    var DataStatistica = DataGiorno.toString() + '/' + DataMese.toString() +  '/' + DataAnno.toString();

    var wbout = XLSX.write(WBook, {bookType:'xlsx', bookSST:true, type: 'binary'});
    saveAs(new Blob([SystemInformation.s2ab(wbout)],{type:"application/octet-stream"}), 'StatisticaSpedizioniPromotori_' + NomePromotore + CodiceIstituto + CodiceTitolo + DataStatistica + ".xlsx");
  }

  $scope.ApriCumulativoPrenotatiOrd = function(ev)
  {    
      $mdDialog.show({ 
                       controller          : DialogControllerOrdPrenotati,
                       templateUrl         : "template/documentBookedUpPopupOrd.html", 
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

  function DialogControllerOrdPrenotati($scope,$mdDialog)
  {
    $scope.CheckEditore         = 'D';
    SystemInformation.GetSQL('Esportazioni',{}, function(Results)
    { 
      let DateEsportazioni = SystemInformation.FindResults(Results,'GetDate');      
      if (DateEsportazioni != undefined) 
      {
        $scope.Esportazioni = DateEsportazioni[0]
        $scope.DataRicercaAlPrnt    = new Date();
        $scope.DataRicercaAlPrnt.setDate($scope.DataRicercaAlPrnt.getDate() - 1)
        $scope.CambiaValore()
      }                
      else SystemInformation.ApplyOnError('Errore nella data di esportazione','');          
    });    

    $scope.CambiaValore = function()
    {
      if ($scope.Esportazioni != undefined)
      {
        if ($scope.CheckEditore == 'D')
        {
          $scope.DataRicercaDalPrnt   = new Date($scope.Esportazioni.DEAGOSTINI);
        }
        else
        {
          $scope.DataRicercaDalPrnt   = new Date($scope.Esportazioni.MONDADORI);
        }
        $scope.DataRicercaDalPrnt.setDate($scope.DataRicercaDalPrnt.getDate() + 1)
      }
    };

    $scope.$watch('CheckEditore', $scope.CambiaValore)

    $scope.hide = function() 
    {
      $mdDialog.hide();
    };

    $scope.AnnullaPopupOrdPrenotati = function() 
    {
      $scope.DataRicercaAlPrnt   = new Date();      
      let TmpDatePrnt             = new Date($scope.DataRicercaAlPrnt);
      TmpDatePrnt.setDate(TmpDatePrnt.getDate() - 30);
      $scope.DataRicercaDalPrnt   = new Date(TmpDatePrnt);
      $scope.ListaGruppiToAdd     = [];
      $mdDialog.cancel();
    };

    $scope.CreaFilePrenotati = function()
    {
      var CumulativoPrenotatiTmp = [];
      var CumulativoPrenotati    = [];
                
      if($scope.DataRicercaDalPrnt == undefined || $scope.DataRicercaAlPrnt == undefined)
         return;
      let TmpDatePrnt = new Date($scope.DataRicercaAlPrnt);
      TmpDatePrnt.setDate($scope.DataRicercaAlPrnt.getDate() + 1);
      
      var ParamPrenotati = {
                              Dal          : ZHTMLInputFromDate($scope.DataRicercaDalPrnt), 
                              Al           : ZHTMLInputFromDate(TmpDatePrnt),
                              ChiaveGruppi : $scope.CheckEditore == 'D' ? CHIAVE_GRUPPO_DE_AGOSTINI : CHIAVE_GRUPPO_MONDADORI
                           };

      if(!$scope.IsAdministrator())
         ParamPrenotati.PromotoreScelto = SystemInformation.UserInformation.Chiave;

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
                                                Gruppo         : CumulativoPrenotatiTmp[i].GRUPPO_CASA == undefined ? 'NESSUN GRUPPO' : CumulativoPrenotatiTmp[i].GRUPPO_CASA, 
                                                Editore        : CumulativoPrenotatiTmp[i].EDITORE_TITOLO == null ? 'EDITORE NON REGISTRATO' : CumulativoPrenotatiTmp[i].EDITORE_TITOLO,
                                                Chiave         : CumulativoPrenotatiTmp[i].TITOLO,
                                                Titolo         : CumulativoPrenotatiTmp[i].NOME_TITOLO == null ? 'NOME NON REGISTRATO' : CumulativoPrenotatiTmp[i].NOME_TITOLO,
                                                Codice         : CumulativoPrenotatiTmp[i].CODICE_TITOLO,
                                                Quantita       : parseInt(CumulativoPrenotatiTmp[i].QUANTITA),
                                                QuantitaMag    : parseInt(CumulativoPrenotatiTmp[i].QUANTITA_MAGAZZINO),
                                                QuantitaNovita : CumulativoPrenotatiTmp[i].Q_PREN_NOVITA == undefined ? 0 : parseInt(CumulativoPrenotatiTmp[i].Q_PREN_NOVITA)
                                              }
              CumulativoPrenotati = CumulativoPrenotatiTmp
              
              CreaDocumentoCumulativoFile(CumulativoPrenotati,$scope.CheckEditore)
              $mdDialog.hide();
            }
        }
        else SystemInformation.ApplyOnError('Modello cumulativo prenotati non conforme','')
      },'SQLCumulativoPrenotati')
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
                          limitOptions    : [20, 40, 80]
                        };       
  
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

         SystemInformation.GetSQL('Subject', {}, function (Results) 
         {
           ListaMaterieOpt = SystemInformation.FindResults(Results, 'SubjectInfoList');
           if(ListaMaterieOpt != undefined) 
           {
            for (let i = 0; i < ListaMaterieOpt.length; i++)
            {
                 if(ListaMaterieOpt[i].PER_DOCENTI == 'T')
                 {
                    $scope.ListaMateriePerDoc.push({
                                                     Chiave : ListaMaterieOpt[i].CHIAVE,
                                                     Nome   : ListaMaterieOpt[i].DESCRIZIONE
                                                   })
                 }
            }
           }
           else SystemInformation.ApplyOnError('Modello materie docenti non conforme','');    
         })
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
                                   Chiave         : ListaIstitutiTmp[i].CHIAVE,
                                   CodiceIstituto : ListaIstitutiTmp[i].CODICE,
                                   Istituto       : ListaIstitutiTmp[i].NOME
                                 }
      $scope.ListaIstituti      = ListaIstitutiTmp;
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
       //return(Elemento.Nome.toUpperCase().indexOf(searchTextDocente) != -1);
       return(Elemento.Nome.toUpperCase().startsWith(searchTextDocente))
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
    $scope.GridOptions.query.page = 1;
  }  
  
  $scope.selectedItemChangeDocente = function(itemDocente)
  {
    if(itemDocente != undefined)
       $scope.DocenteFiltro = itemDocente.Chiave;
    else $scope.DocenteFiltro = -1;
    $scope.GridOptions.query.page = 1;
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
    $scope.GridOptions.query.page = 1;
  }    
  
  $scope.RefreshListaSpedizioniAll = function ()
  {
    $scope.PrimaRicercaEffettuata = true;
    $scope.CaricamentoInCorso = true;
    $scope.GridOptions.query.page = 1;
    if($scope.DataRicercaDal == undefined || $scope.DataRicercaAl == undefined)
       return;
    let TmpDate = new Date($scope.DataRicercaAl);
    TmpDate.setDate($scope.DataRicercaAl.getDate() + 1);
  
    SystemInformation.ExecuteExternalScript('SIRIOExtra',{ Dal : ZHTMLInputFromDate($scope.DataRicercaDal), Al : ZHTMLInputFromDate(TmpDate), Admin : ($scope.IsAdministrator() ? 'T' : 'F')},function(Answer) 
    {
      $scope.ListaSpedizioni = Answer.ListaSpedizioni;
      $scope.ListaSpedizioni.sort(function(a,b)
                                  {
                                    if (a.DATA > b.DATA)
                                      return 1
                                    return -1
                                  })
      $scope.CaricamentoInCorso = false;
    }); 
  }

  $scope.GetIfPrenotati = function(Spedizione)
  {
     for(let i = 0;i < Spedizione.DettagliTitoli.length;i ++)
     {
         if(Spedizione.DettagliTitoli[i].StatoTitolo == 'PRENOTATO')
            return true
     }
     
     return false;
  }
  
  $scope.GetTitoliSpedizione = function(Spedizione)
  {
     var style = 'style="font-weight: bold;color:black;"';

     var Result = '';
     for(let i = 0;i < Spedizione.DettagliTitoli.length;i ++)
     {
         if(Spedizione.DettagliTitoli[i].StatoTitolo == 'PRENOTATO')
            style = 'style="font-weight: bold;color:' + COLOR_STATO_PRENOTATA + ';"';
         if(Spedizione.DettagliTitoli[i].StatoTitolo == 'DA SPEDIRE')
            style = 'style="font-weight: bold;color:' + COLOR_STATO_DA_SPEDIRE + ';"';
         if(Spedizione.DettagliTitoli[i].StatoTitolo == 'CONSEGNATO')
            style = 'style="font-weight: bold;color:' + COLOR_STATO_CONSEGNATA + ';"';

         Result += '<span style="color:black;">' + Spedizione.DettagliTitoli[i].CodiceTitolo + ' - ' + Spedizione.DettagliTitoli[i].NomeTitolo + '</span></br><span ' + style + '>' + Spedizione.DettagliTitoli[i].StatoTitolo + '</span><span style="font-weight: bold;color:black;"> IN DATA ' + $scope.ConvertiData(Spedizione.DettagliTitoli[i]) + '</span><br><br>';

         //Result += '<span style="font-weight: bold;color:black;">' + Spedizione.DettagliTitoli[i].CodiceTitolo + ' - ' + Spedizione.DettagliTitoli[i].NomeTitolo + '</br><span style="font-weight:bold;">' + Spedizione.DettagliTitoli[i].StatoTitolo + ' IN DATA ' + $scope.ConvertiData(Spedizione.DettagliTitoli[i]) + '</span></br>';
     }
     
     return($sce.trustAsHtml(Result.substr(0,Result.length)));
  }

  $scope.GetNumberRows = function()
  {
    let SpedizioniFiltrate = $filter('SpedizioneByFiltro')($scope.ListaSpedizioni,
                                                           $scope.ProvinciaFiltro,
                                                           $scope.PrenotataFiltro,
                                                           $scope.DaSpedireFiltro,
                                                           $scope.ConsegnataFiltro,
                                                           $scope.PromotoreFiltro,
                                                           $scope.IstitutoFiltro,
                                                           $scope.DocenteFiltro,
                                                           $scope.TitoloFiltro);
    
    if(SpedizioniFiltrate != undefined)
       return SpedizioniFiltrate.length;
    else return 0;
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
       BodySheet['A1'] = SystemInformation.GetCellaIntestazione('ISTITUTO DEST.');
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
                    BodySheet['A' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaSpedizioniFinale[j].NOME_ISTITUTO == undefined ? ListaSpedizioniFinale[j].PRESSO : ListaSpedizioniFinale[j].NOME_ISTITUTO);
                    BodySheet['B' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaSpedizioniFinale[j].NOME_DOCENTE == undefined ? '' : ListaSpedizioniFinale[j].NOME_DOCENTE);
                    BodySheet['C' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaSpedizioniFinale[j].INDIRIZZO + ', ' + ListaSpedizioniFinale[j].COMUNE + ', ' + ListaSpedizioniFinale[j].CAP + ', ' + ListaSpedizioniFinale[j].NOME_PROVINCIA);
                    BodySheet['D' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ZFormatDateTime('dd/mm/yyyy',ZDateFromHTMLInput(ListaSpedizioniFinale[j].DATA)));
                    BodySheet['E' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaSpedizioniFinale[j].NOME_PROMOTORE.toUpperCase()); 
                    BodySheet['F' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaSpedizioniFinale[j].CODICE_TITOLO);
                    BodySheet['G' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaSpedizioniFinale[j].NOME_TITOLO);
                    BodySheet['H' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ConstDisponiAsString(ListaSpedizioniFinale[j].QUANTITA));
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
                    BodySheet['H' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ConstDisponiAsString(ListaSpedizioniFinale[j].QUANTITA));
                    BodySheet['I' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaSpedizioniFinale[j].STATO);
                   
                    ChiaveSpedizione = ListaSpedizioniFinale[j].CHIAVE;
                }
                
                TitoloCorrisp = ListaCumulativo.findIndex(function(ATitolo){return(ATitolo.Codice == ListaSpedizioniFinale[j].CODICE_TITOLO);});
                if(TitoloCorrisp == -1)
                {
                   ListaCumulativo.push({
                                          Codice     : ListaSpedizioniFinale[j].CODICE_TITOLO,
                                          Nome       : ListaSpedizioniFinale[j].NOME_TITOLO,
                                          Quantita   : ConstDisponiAsString(ListaSpedizioniFinale[j].QUANTITA),
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
              BodySheetCum['C' + parseInt(k + 2)] = SystemInformation.GetCellaDati('s',ConstDisponiAsString(ListaCumulativo[k].Quantita));
              BodySheetCum['D' + parseInt(k + 2)] = SystemInformation.GetCellaDati('s',ConstDisponiAsString(ListaCumulativo[k].Prenotati));
              BodySheetCum['E' + parseInt(k + 2)] = SystemInformation.GetCellaDati('s',ConstDisponiAsString(ListaCumulativo[k].DaSpedire));
              BodySheetCum['F' + parseInt(k + 2)] = SystemInformation.GetCellaDati('s',ConstDisponiAsString(ListaCumulativo[k].Consegnati));
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
            console.log(WBook)
            
            var wbout = XLSX.write(WBook, {bookType:'xlsx', bookSST:true, type: 'binary'});
            saveAs(new Blob([SystemInformation.s2ab(wbout)],{type:"application/octet-stream"}), "Spedizioni.xlsx")                                       
         }
         else SystemInformation.ApplyOnError('Modello spedizioni di confronto per xls non conforme','')
       },'SQLAdminXls');
    }
    else
    {
       BodySheet       = {};
       BodySheet['A1'] = SystemInformation.GetCellaIntestazione('ISTITUTO DEST.');
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
                    BodySheet['A' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaSpedizioniFinale[j].NOME_ISTITUTO == undefined ? ListaSpedizioniFinale[j].PRESSO : ListaSpedizioniFinale[j].NOME_ISTITUTO) ;
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
              BodySheetCum['C' + parseInt(k + 2)] = SystemInformation.GetCellaDati('s',ConstDisponiAsString(ListaCumulativo[k].Quantita));
              BodySheetCum['D' + parseInt(k + 2)] = SystemInformation.GetCellaDati('s',ConstDisponiAsString(ListaCumulativo[k].Prenotati));
              BodySheetCum['E' + parseInt(k + 2)] = SystemInformation.GetCellaDati('s',ConstDisponiAsString(ListaCumulativo[k].DaSpedire));
              BodySheetCum['F' + parseInt(k + 2)] = SystemInformation.GetCellaDati('s',ConstDisponiAsString(ListaCumulativo[k].Consegnati));
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
    ZConfirm.GetConfirmBox('AVVISO',"Eliminare la spedizione del " +  $scope.ConvertiData(Spedizione) + " presso " + Spedizione.Presso + " ?",EliminaSped,function(){});  
  }

  $scope.InviaDisponibili = function(__ChiaveTitolo)
  {
    var Invia = function()
    {
      SystemInformation.GetSQL('Delivery',{ChiaveTitolo : __ChiaveTitolo},function(Results)
      {
        var Disponibilita = SystemInformation.FindResults(Results,'GetDisponibilitaTitolo');
        var LsPrenotazioni = SystemInformation.FindResults(Results,'GetPrenotazioniTitolo');
        if(Disponibilita != undefined && LsPrenotazioni != undefined)
        {
          if(LsPrenotazioni.length != 0)
          {
             Disponibilita = Disponibilita[0].DISPONIBILITA
             if(Disponibilita != 0)
             {
                var QuantitaTotale = 0
                var CountDisponibilita = Disponibilita
                LsPrenotazioni.forEach((Prenotazione) => { QuantitaTotale += Prenotazione.QUANTITA })
                var $ObjQuery       = { Operazioni : [] };
                for(var i = 0; i < LsPrenotazioni.length;i++)
                {
                  let Prenotazione = LsPrenotazioni[i]
                  if(Prenotazione.QUANTITA <= CountDisponibilita)  
                  {
                    $ObjQuery.Operazioni.push({
                                                Query     : 'ChangeDeliveryToSend',
                                                Parametri : { CHIAVE : Prenotazione.CHIAVE_DETTAGLIO }
                                              }) 
                    CountDisponibilita -= Prenotazione.QUANTITA
                  }
                  else
                  {
                    $ObjQuery.Operazioni.push({
                                                Query     : 'ChangeDeliveryToSendAndQuantity',
                                                Parametri : { 
                                                              CHIAVE   : Prenotazione.CHIAVE_DETTAGLIO,
                                                              QUANTITA : CountDisponibilita 
                                                            }
                                              }) 
                    $ObjQuery.Operazioni.push({
                                                Query     : 'InsertDeliveryBook',
                                                Parametri : { 
                                                              SPEDIZIONE  : Prenotazione.CHIAVE_SPEDIZIONE,
                                                              TITOLO      : __ChiaveTitolo,
                                                              QUANTITA    : Prenotazione.QUANTITA - CountDisponibilita,
                                                              STATO       : 'P'
                                                             }
                                              }) 
                    CountDisponibilita = 0;
                  }
                  if(CountDisponibilita == 0) break;
                }
                SystemInformation.PostSQL('Delivery',$ObjQuery,function(Answer)
                {
                  if(Disponibilita >= QuantitaTotale)
                     ZCustomAlert($mdDialog,'AVVISO','Tutte le prenotazioni sono state spedite')
                  else ZCustomAlert($mdDialog,'AVVISO','Rimangono ' + (QuantitaTotale - Disponibilita) + ' prenotazioni da inviare')   
                  $scope.RefreshListaSpedizioniAll();
                  $ObjQuery.Operazioni = [];
                });
             }
             else ZCustomAlert($mdDialog,'AVVISO','Non sono disponibili titoli in magazzino')
          }  
          else ZCustomAlert($mdDialog,'AVVISO','Nessuna prenotazione per il titolo selezionato')
        }
        else SystemInformation.ApplyOnError('Modello dettaglio spedizione non conforme','');
      },'SQLXMultiSpedizioneTitolo');
    }
    ZConfirm.GetConfirmBox('AVVISO',"Spedire tutte le prenotazioni disponibili del libro selezionato?",Invia,function(){});  
  } 

  $scope.EliminaPrenotatiTitolo = function(__ChiaveTitolo)
  {
    var EliminaSped = function()
    {
      var $ObjQuery       = { Operazioni : [] };
      var ParamSpedizione = { ChiaveTitolo : __ChiaveTitolo };
      
      $ObjQuery.Operazioni.push({
                                  Query     : 'DeleteDeliverBookedXTitle',
                                  Parametri : ParamSpedizione
                                });  

      $ObjQuery.Operazioni.push({
                                  Query     : 'ClearEmptySpedizioni',
                                  Parametri : ParamSpedizione
                                });  
      
      SystemInformation.PostSQL('Delivery',$ObjQuery,function(Answer)
      {
        $scope.RefreshListaSpedizioniAll();
        $ObjQuery.Operazioni = [];
      });
    }
    ZConfirm.GetConfirmBox('AVVISO',"Eliminare tutte le prenotatazioni del titolo selezionato?\nN.B: Se la spedizione contiene solo titoli prenotati verrà cancellata!",EliminaSped,function(){});  
  }
  
  $scope.EliminaPrenotatiSpedizione = function (Spedizione)
  {
    var EliminaSped = function()
    {
      var $ObjQuery       = { Operazioni : [] };
      var ParamSpedizione = { CHIAVE : Spedizione.Chiave };
      
      $ObjQuery.Operazioni.push({
                                  Query     : 'DeleteDeliveryAllBooked',
                                  Parametri : ParamSpedizione
                                });  
      
      SystemInformation.PostSQL('Delivery',$ObjQuery,function(Answer)
      {
        $scope.RefreshListaSpedizioniAll();
        $ObjQuery.Operazioni = [];
      });
    }
    ZConfirm.GetConfirmBox('AVVISO',"Eliminare tutti i titoli prenotati della spedizione del " +  $scope.ConvertiData(Spedizione) + " presso " + Spedizione.Presso + " ?\nN.B: Se la spedizione contiene solo titoli prenotati verrà cancellata!",EliminaSped,function(){});  
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
                                      "Quantita"        : SpedizioneDettaglio[i].QUANTITA,
                                      "Stato"           : SpedizioneDettaglio[i].STATO
                                    });
            }
            var $ObjQuery = { Operazioni : [] }; 
            var TitoliNonDisponibili = [];
            var TitoliDaSpedire      = [];
            var TitoliAlreadyGestiti = [];              
            for(let j = 0;j < ListaTitoliSped.length;j ++)
            {
              if(ListaTitoliSped[j].Stato == 'P' && (parseInt(ListaTitoliSped[j].Quantita) <= parseInt(ListaTitoliSped[j].QuantitaMgzn)))
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
                if(ListaTitoliSped[j].Stato == 'C' || ListaTitoliSped[j].Stato == 'S')
                {
                  var OggettoNd = '';
                  OggettoAg     = '\n' + 'Nr° : ' + ListaTitoliSped[j].Quantita.toString() + ' - ' + ListaTitoliSped[j].TitoloNome.toString();
                  TitoliAlreadyGestiti.push(OggettoAg);
                }
                else
                {
                  var OggettoNd = '';
                  OggettoNd     = '\n' + 'Nr° : ' + ListaTitoliSped[j].Quantita.toString() + ' - ' + ListaTitoliSped[j].TitoloNome.toString();
                  TitoliNonDisponibili.push(OggettoNd);
                } 
              }             
            }
            SystemInformation.PostSQL('Delivery',$ObjQuery,function(Results) 
            {                            
              if(TitoliNonDisponibili.length != 0 && TitoliDaSpedire.length == 0 && TitoliAlreadyGestiti.length == 0)               
                 ZCustomAlert($mdDialog,'AVVISO','I seguenti titoli non sono disponibili per essere spediti:  ' + TitoliNonDisponibili)
              else if (TitoliNonDisponibili.length == 0 && TitoliDaSpedire.length != 0 && TitoliAlreadyGestiti.length == 0)
                       ZCustomAlert($mdDialog,'AVVISO','I seguenti titoli sono stati segnati come DA SPEDIRE : ' + TitoliDaSpedire)
              else if (TitoliNonDisponibili.length != 0 && TitoliDaSpedire.length != 0 && TitoliAlreadyGestiti.length == 0)
                       ZCustomAlert($mdDialog,'AVVISO','I seguenti titoli sono stati segnati come DA SPEDIRE : ' + TitoliDaSpedire + ' --- I seguenti titoli non sono disponibili per essere spediti:  ' + TitoliNonDisponibili)
              else if (TitoliNonDisponibili.length != 0 && TitoliDaSpedire.length != 0 && TitoliAlreadyGestiti.length != 0)
                       ZCustomAlert($mdDialog,'AVVISO','I seguenti titoli sono stati segnati come DA SPEDIRE : ' + TitoliDaSpedire + ' --- I seguenti titoli non sono disponibili per essere spediti:  ' + TitoliNonDisponibili +  ' --- I seguenti titoli sono già stati gestiti:  ' + TitoliAlreadyGestiti)
              else if (TitoliNonDisponibili.length == 0 && TitoliDaSpedire.length != 0 && TitoliAlreadyGestiti.length != 0)
                       ZCustomAlert($mdDialog,'AVVISO','I seguenti titoli sono stati segnati come DA SPEDIRE : ' + TitoliDaSpedire + ' --- I seguenti titoli sono già stati gestiti:  ' + TitoliAlreadyGestiti);
              else if (TitoliNonDisponibili.length != 0 && TitoliDaSpedire.length == 0 && TitoliAlreadyGestiti.length != 0)   
                    ZCustomAlert($mdDialog,'AVVISO','I seguenti titoli non sono disponibili per essere spediti:  ' + TitoliNonDisponibili + ' --- I seguenti titoli sono già stati gestiti:  ' + TitoliAlreadyGestiti)
  
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
  
  $scope.GetListaGruppi();
  //$scope.RefreshListaSpedizioniAll();
  
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

SIRIOApp.filter('StatisticaByFiltro',function()
{
  return function(StatisticaPromotori,PromotoreFiltroStatistica,TitoloFiltroStat)
         {
           if (StatisticaPromotori != undefined)
           {  
             if(PromotoreFiltroStatistica == -1 && TitoloFiltroStat == -1) 
                return(StatisticaPromotori);
             var ListaFiltrata = [];
           
             var StatisticaOk = function(statistica)
             { 
                var Result = true;
                if(PromotoreFiltroStatistica != -1)
                   if(statistica.ChiavePromotore != PromotoreFiltroStatistica)
                      Result = false;

                if(TitoloFiltroStat != -1)
                   if(statistica.ChiaveTitolo != TitoloFiltroStat)
                      Result = false;
                     
                return(Result);
             }
             
              StatisticaPromotori.forEach(function(statistica)
              { 
                if(StatisticaOk(statistica)) 
                   ListaFiltrata.push(statistica)                       
              });
              
              return(ListaFiltrata);
           }
         }
});

