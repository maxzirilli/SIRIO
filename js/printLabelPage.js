SIRIOApp.controller("printLabelPageController",['$scope','SystemInformation','$state','$rootScope','$mdDialog','$sce','$filter','$mdDialog','ZConfirm',
function($scope,SystemInformation,$state,$rootScope,$mdDialog,$sce,$filter,$mdDialog,ZConfirm)
{
  $scope.ProvinciaFiltro  = -1;
  $scope.PromotoreFiltro  = -1;
  $scope.IstitutoFiltro   = -1;
  $scope.DocenteFiltro    = -1;
  $scope.DataRicercaAl    = new Date();
  let TmpDate             = new Date($scope.DataRicercaAl);
  TmpDate.setDate(TmpDate.getDate() - 30);
  var AnnoCorrente = new Date().getFullYear();
  $scope.DataRicercaDal   = new Date(AnnoCorrente, 0, 1)
  $scope.RicercaPerTitolo = false;
  $scope.ListaProvinceAll = [];
  
  $scope.ListaTitoliFiltroTmp   = [];
  $scope.ListaTitoliFiltro      = [];
  $scope.ListaTitoliPopup       = [];  
  $scope.CodiceFiltro           = '';
  $scope.NomeFiltro             = '';
  $scope.CheckAll               = false;
  $scope.UncheckAll             = false;
  $scope.ListaSpedizioni        = [];
  var DatiDitta                 = {};
  var ListaDaSpedireTmp         = [];
  $scope.SpedizioneImmediata    = false;
  $scope.AbilitaConfermaStampa  = false;
  var ListaSpedizioniToPrint    = [];

  ScopeHeaderController.CheckButtons();
  
  $scope.IsAdministrator = SystemInformation.IsAdministrator;
  
  $scope.AnnullaStampa = function ()
  {
    DatiDitta          = {};
    $scope.ListaSpedizioni = [];
    ListaDaSpedireTmp  = [];
    if(SystemInformation.DataBetweenDelivery.Provenienza == 'TeacherPage')
       $state.go("teacherListPage")
    else $state.go("startPage");
  }
  
  var TroncaTesto = function(str, n)
  {
    return (str.length > n) ? str.substr(0, n-1) + '(...)' : str;
  };
  
  SystemInformation.GetSQL('CompanyData',{}, function (Results)
  {
    DatiDittaSql     = SystemInformation.FindResults(Results,'GetCompanyData');
    if (DatiDittaSql != undefined)
    {
      DatiDitta.Indirizzo = DatiDittaSql[0].INDIRIZZO == undefined ? '' : DatiDittaSql[0].INDIRIZZO;
      DatiDitta.Telefono  = DatiDittaSql[0].TELEFONO == undefined ? '' : DatiDittaSql[0].TELEFONO;
      DatiDitta.Email     = DatiDittaSql[0].EMAIL == undefined ? '' : DatiDittaSql[0].EMAIL;
      DatiDitta.SitoWeb   = DatiDittaSql[0].SITO_WEB == undefined ? '' : DatiDittaSql[0].SITO_WEB;
    }
    else SystemInformation.ApplyOnError('Modello dati ditta non conforme','');
  }); 
  
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

  var NuovaStampa = function(ListaSpedizioniToPrint,ListaChiaviSpedizioni,DataSpedizione)
  {
     SystemInformation.GetSQL('PrintLabel',{ChiaviSpedizioni : ListaChiaviSpedizioni},function(Results)
     {
       ListaPrenotati = SystemInformation.FindResults(Results,'GetPrenotati');

       for(var i = 0; i < ListaSpedizioniToPrint.length; i ++)
       {
           for(var j = 0; j < ListaPrenotati.length; j ++)
           {
               if(ListaSpedizioniToPrint[i].CHIAVE == ListaPrenotati[j].SPEDIZIONE)
                  ListaSpedizioniToPrint[i].ListaPrenotati.push({
                                                                 "NOME_TITOLO" : ListaPrenotati[j].NOME_TITOLO == undefined ? 'N.D.' : ListaPrenotati[j].NOME_TITOLO,
                                                                 "QUANTITA"    : ListaPrenotati[j].QUANTITA == undefined ? 'N.D.' : ListaPrenotati[j].QUANTITA,
                                                                 "AUTORI"      : ListaPrenotati[j].AUTORI == undefined ? 'N.D' : ListaPrenotati[j].AUTORI,
                                                                 "EDITORE"     : ListaPrenotati[j].EDITORE == undefined ? 'N.D' : ListaPrenotati[j].EDITORE,
                                                                 "CODICE_ISBN" : ListaPrenotati[j].CODICE == undefined ? 'N.D' : ListaPrenotati[j].CODICE                                   
                                                                })
           }
       }
       
       var doc = new jsPDF('l', 'mm', [150, 100]);
       doc.setProperties({title: 'STAMPA ETICHETTE ' + DataSpedizione});

       for (let i = 0;i < ListaSpedizioniToPrint.length;i ++)
       {
            doc.setFontSize(8);            
            CoordY = 10;
            doc.setFontType('normal');
            doc.addImage(SystemInformation.Pagina43Logo,'JPEG',3,6,68,18);      
            doc.text(5,CoordY + 22,DatiDitta.Indirizzo);
            doc.text(5,CoordY + 25,'Tel : ' + DatiDitta.Telefono);
            doc.text(5,CoordY + 28,'Email : ' + DatiDitta.Email + '       SitoWeb : ' + DatiDitta.SitoWeb);

            doc.setFontType('courier');
            doc.setFontSize(12);
            if (ListaSpedizioniToPrint[i].DOCENTE != 'N.D.')
            {
                doc.text(30,CoordY + 40,ListaSpedizioniToPrint[i].TITOLO_DOCENTE);
                doc.setFontType('bold');
                doc.text(30,CoordY + 45,ListaSpedizioniToPrint[i].NOME_DOCENTE);
                doc.setFontType('normal');
                if(ListaSpedizioniToPrint[i].NOME_ISTITUTO != 'N.D.')
                   doc.text(30,CoordY + 53,(ListaSpedizioniToPrint[i].NOME_ISTITUTO))
                else 
                {
                  if(ListaSpedizioniToPrint[i].PRESSO != ListaSpedizioniToPrint[i].NOME_DOCENTE)
                     doc.text(30,CoordY + 53,(ListaSpedizioniToPrint[i].PRESSO))        
                }
                doc.text(30,CoordY + 60,ListaSpedizioniToPrint[i].INDIRIZZO);
                doc.text(30,CoordY + 65,ListaSpedizioniToPrint[i].CAP + ', ' + ListaSpedizioniToPrint[i].COMUNE + /*', ' + ListaSpedizioniToPrint[i].NOME_PROVINCIA +*/ ' (' + ListaSpedizioniToPrint[i].TARGA_PROVINCIA + ')');
            }
            else
            {                     
                doc.text(30,CoordY + 50,ListaSpedizioniToPrint[i].PRESSO);
                doc.text(30,CoordY + 60,ListaSpedizioniToPrint[i].INDIRIZZO);
                doc.text(30,CoordY + 65,ListaSpedizioniToPrint[i].CAP + ', ' + ListaSpedizioniToPrint[i].COMUNE + /*', ' + ListaSpedizioniToPrint[i].NOME_PROVINCIA +*/ ' (' + ListaSpedizioniToPrint[i].TARGA_PROVINCIA + ')');
            }
            
            doc.setFontType('italic');
            doc.setFontSize(12);
            doc.text(5,CoordY + 85, 'A cura di : ' + ListaSpedizioniToPrint[i].NOME_PROMOTORE.toUpperCase());
            
            doc.text(105,CoordY + 85, 'Peso Gr.........................');
            doc.line(105,CoordY + 86,145,CoordY + 86);

            doc.addPage();
            
            CoordY = 5;
            doc.setFontType('bold');
            doc.setFontSize(8);
            doc.text(5,CoordY + 5,'ISBN');
            doc.text(25,CoordY + 5,'TITOLO');
            doc.text(85,CoordY + 5,'EDITORE');
            doc.text(115,CoordY + 5,'QNT.');
            doc.text(130,CoordY + 5,'POS.MAG.');
            
            doc.setFontType('normal');

            CoordY = 15;
            
            for (let j = 0;j < ListaSpedizioniToPrint[i].ListaTitoli.length;j ++)
            {  
                if (CoordY >= 100) 
                {
                  doc.addPage();
                  CoordY = 10;
                  doc.setFontType('bold');
                  doc.setFontSize(8);
                  doc.text(5,CoordY,'ISBN');
                  doc.text(25,CoordY,'TITOLO');
                  doc.text(85,CoordY,'EDITORE');
                  doc.text(115,CoordY,'QNT.');
                  doc.text(130,CoordY,'POS.MAG.');
                  doc.setFontType('normal');
                  CoordY += 5;
                }
                   
                doc.text(5,CoordY + 0,ListaSpedizioniToPrint[i].ListaTitoli[j].CODICE_ISBN);                     
                doc.text(25,CoordY + 0,TroncaTesto(ListaSpedizioniToPrint[i].ListaTitoli[j].NOME_TITOLO,28));
                doc.text(85,CoordY + 0,TroncaTesto(ListaSpedizioniToPrint[i].ListaTitoli[j].EDITORE,15));
                var Q  = doc.getTextWidth('QNT.');
                var Qt = doc.getTextWidth(ListaSpedizioniToPrint[i].ListaTitoli[j].QUANTITA);
                doc.text(115 + Q + 1 - Qt,CoordY + 0,ListaSpedizioniToPrint[i].ListaTitoli[j].QUANTITA.toString());
                doc.text(130,CoordY + 0,ListaSpedizioniToPrint[i].ListaTitoli[j].POS_MGZN); 
                CoordY += 5;               
            }

            doc.setFontType('bold');
            doc.setFontSize(8);

            if(ListaSpedizioniToPrint[i].ListaPrenotati.length > 0)
            {
               doc.text(5,CoordY + 5,'TITOLI PRENOTATI :');
               doc.setFontType('normal');

               CoordY = CoordY + 10;

               for (let j = 0;j < ListaSpedizioniToPrint[i].ListaPrenotati.length;j ++)
               {  
                   if (CoordY >= 100) 
                   {
                     doc.addPage();
                     CoordY = 10;
                     doc.setFontType('bold');
                     doc.text(5,CoordY,'TITOLI PRENOTATI :');
                     doc.setFontSize(8);
                     doc.text(5,CoordY + 5,'ISBN');
                     doc.text(25,CoordY + 5,'TITOLO');
                     doc.text(85,CoordY + 5,'EDITORE');
                     doc.text(115,CoordY + 5,'QNT.');
                     doc.setFontType('normal');
                     CoordY += 10;
                   }
                      
                   doc.text(5,CoordY + 0,ListaSpedizioniToPrint[i].ListaPrenotati[j].CODICE_ISBN);                     
                   doc.text(25,CoordY + 0,TroncaTesto(ListaSpedizioniToPrint[i].ListaPrenotati[j].NOME_TITOLO,28));
                   doc.text(85,CoordY + 0,TroncaTesto(ListaSpedizioniToPrint[i].ListaPrenotati[j].EDITORE,15));
                   var Q  = doc.getTextWidth('QNT.');
                   var Qt = doc.getTextWidth(ListaSpedizioniToPrint[i].ListaPrenotati[j].QUANTITA);
                   doc.text(115 + Q + 1 - Qt,CoordY + 0,ListaSpedizioniToPrint[i].ListaPrenotati[j].QUANTITA.toString());
                   CoordY += 5;               
               } 
            }          
            doc.setFontSize(6);

            if(i != ListaSpedizioniToPrint.length - 1)
               doc.addPage();
      }
      doc.save('EtichettePDF' + DataSpedizione + '.pdf',{}); 
      $scope.AbilitaConfermaStampa = true;
     },'SelectPrenotati')
  }
  
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
                                     Nome   : ListaProvinceAllTmp[i].NOME,
                                     Targa  : ListaProvinceAllTmp[i].TARGA == undefined ? 'N.D' : ListaProvinceAllTmp[i].TARGA
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
                                   CodiceIstituto : ListaIstitutiTmp[i].CODICE,
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
    
    if($scope.IsAdministrator())
    {
      SystemInformation.GetSQL('Delivery',ParamSpedizione,function(Results)
      {
        var ListaSpedizioniTmp = [];
        ListaSpedizioniTmp     = SystemInformation.FindResults(Results,'DettaglioToSendAdmin');
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
                                            Presso           : ListaSpedizioniTmp[i].PRESSO == undefined ? '' : ListaSpedizioniTmp[i].PRESSO,
                                            DocenteNome      : ListaSpedizioniTmp[i].NOME_DOCENTE == undefined ? 'N.D.' : ListaSpedizioniTmp[i].NOME_DOCENTE,
                                            Provincia        : ListaSpedizioniTmp[i].PROVINCIA,
                                            Promotore        : ListaSpedizioniTmp[i].PROMOTORE,
                                            Istituto         : ListaSpedizioniTmp[i].ISTITUTO,
                                            NomeIstituto     : ListaSpedizioniTmp[i].NOME_ISTITUTO == undefined ? '' : ListaSpedizioniTmp[i].NOME_ISTITUTO
                                          })
            }
            $scope.ListaSpedizioni.push({ 
                                          ChiaveDettaglio : ListaSpedizioniTmp[i].CHIAVE_DETTAGLIO,
                                          Tipo            : 1, 
                                          Codice          : ListaSpedizioniTmp[i].CODICE_TITOLO == undefined ? 'N.D.' : ListaSpedizioniTmp[i].CODICE_TITOLO,
                                          TitoloNome      : ListaSpedizioniTmp[i].NOME_TITOLO == undefined ? 'N.D.' : ListaSpedizioniTmp[i].NOME_TITOLO,
                                          Titolo          : ListaSpedizioniTmp[i].TITOLO,
                                          Quantita        : ListaSpedizioniTmp[i].QUANTITA == undefined ? 'N.D.' : ListaSpedizioniTmp[i].QUANTITA,
                                          QuantitaMgzn    : ListaSpedizioniTmp[i].QUANTITA_DISP,
                                          Selezionato     : false,
                                          Data            : ListaSpedizioniTmp[i].DATA_ULTIMA_MODIFICA
                                        });
            if(!$scope.RicercaPerTitolo)
            {
                var TitoloTrovato = $scope.ListaTitoliFiltro.find(function(ATitolo){return(ATitolo.Chiave == ListaSpedizioniTmp[i].TITOLO);})
              
                if(TitoloTrovato == undefined)
                {
                  $scope.ListaTitoliFiltro.push({
                                                  Chiave         : ListaSpedizioniTmp[i].TITOLO,
                                                  Nome           : ListaSpedizioniTmp[i].NOME_TITOLO,
                                                  Codice         : ListaSpedizioniTmp[i].CODICE_TITOLO
                                                })
                }
            }
          }  
        }
        else SystemInformation.ApplyOnError('Modello spedizione non conforme','')     
      },'SQLDettaglioTitoliToSendAdmin')     
    }
    else
    {
      SystemInformation.GetSQL('Delivery',ParamSpedizione,function(Results)
      {
        var ListaSpedizioniTmp = [];
        ListaSpedizioniTmp     = SystemInformation.FindResults(Results,'DettaglioToSendPromotore');
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
                                            Presso           : ListaSpedizioniTmp[i].PRESSO == undefined ? '' : ListaSpedizioniTmp[i].PRESSO,
                                            DocenteNome      : ListaSpedizioniTmp[i].NOME_DOCENTE == undefined ? 'N.D.' : ListaSpedizioniTmp[i].NOME_DOCENTE,
                                            Provincia        : ListaSpedizioniTmp[i].PROVINCIA,
                                            Promotore        : ListaSpedizioniTmp[i].PROMOTORE,
                                            PromotoreNome    : ListaSpedizioniTmp[i].NOME_PROMOTORE,
                                            Istituto         : ListaSpedizioniTmp[i].ISTITUTO,
                                            NomeIstituto     : ListaSpedizioniTmp[i].NOME_ISTITUTO == undefined ? '' : ListaSpedizioniTmp[i].NOME_ISTITUTO   
                                          })
            }
            $scope.ListaSpedizioni.push({ 
                                          ChiaveDettaglio : ListaSpedizioniTmp[i].CHIAVE_DETTAGLIO,
                                          Tipo            : 1, 
                                          Codice          : ListaSpedizioniTmp[i].CODICE_TITOLO == undefined ? 'N.D.' : ListaSpedizioniTmp[i].CODICE_TITOLO,
                                          TitoloNome      : ListaSpedizioniTmp[i].NOME_TITOLO == undefined ? 'N.D.' : ListaSpedizioniTmp[i].NOME_TITOLO,
                                          Titolo          : ListaSpedizioniTmp[i].TITOLO,
                                          Quantita        : ListaSpedizioniTmp[i].QUANTITA == undefined ? 'N.D.' : ListaSpedizioniTmp[i].QUANTITA,
                                          Posizione       : ListaSpedizioniTmp[i].POS_MGZN == undefined ? 'N.D.' : ListaSpedizioniTmp[i].POS_MGZN,
                                          Selezionato     : false,
                                          Data            : ListaSpedizioniTmp[i].DATA_ULTIMA_MODIFICA
                                        });
            if(!$scope.RicercaPerTitolo)
            {
                var TitoloTrovato = $scope.ListaTitoliFiltro.find(function(ATitolo){return(ATitolo.Chiave == ListaSpedizioniTmp[i].TITOLO);})
              
                if(TitoloTrovato == undefined)
                {
                  $scope.ListaTitoliFiltro.push({
                                                  Chiave         : ListaSpedizioniTmp[i].TITOLO,
                                                  Nome           : ListaSpedizioniTmp[i].NOME_TITOLO,
                                                  Codice         : ListaSpedizioniTmp[i].CODICE_TITOLO
                                                })
                }
            }
          }  
        }
        else SystemInformation.ApplyOnError('Modello spedizione non conforme','') 
      },'SQLDettaglioTitoliToSendPrm') 
    }
  }

  if(Array.isArray(SystemInformation.DataBetweenController.ListaChiaviFromAdvanced) && SystemInformation.DataBetweenController.ListaChiaviFromAdvanced.length > 0)
  {
    $scope.SpedizioneImmediata              = (SystemInformation.DataBetweenController.Provenienza == 'NOT_ADVANCED' || SystemInformation.DataBetweenController.Provenienza == 'TeacherPage') ? true : false;
    ChiaviDaSpedireTmp                      = Array.from(SystemInformation.DataBetweenController.ListaChiaviFromAdvanced);
    SystemInformation.DataBetweenController = {};
    SystemInformation.GetSQL('PrintLabel',{ChiaviDaSpedire : ChiaviDaSpedireTmp},function(Results)
    {
      ListaDaSpedireTmp         = SystemInformation.FindResults(Results,'LabelPrintDeliveryToSend');
      var ListaChiaviSpedizioni = [];

      if(ListaDaSpedireTmp != undefined)
      {
          var ChiaveSpedizione = -1;
          for(let i = 0; i < ListaDaSpedireTmp.length; i ++)
          {
              if(ChiaveSpedizione != ListaDaSpedireTmp[i].SPEDIZIONE)
              {
                if (Spedizione != undefined)
                    ListaSpedizioniToPrint.push(Spedizione);
               
                var Spedizione = {};
                
                Spedizione = {
                               "PRESSO"         : ListaDaSpedireTmp[i].PRESSO == undefined ? 'N.D.' : ListaDaSpedireTmp[i].PRESSO,
                               "ISTITUTO"       : ListaDaSpedireTmp[i].ISTITUTO == undefined ? 'N.D.' : ListaDaSpedireTmp[i].ISTITUTO,
                               "NOME_ISTITUTO"  : ListaDaSpedireTmp[i].NOME_ISTITUTO == undefined ? 'N.D.' : ListaDaSpedireTmp[i].NOME_ISTITUTO,
                               "DOCENTE"        : ListaDaSpedireTmp[i].DOCENTE == undefined ? 'N.D.' : ListaDaSpedireTmp[i].DOCENTE,
                               "NOME_DOCENTE"   : ListaDaSpedireTmp[i].NOME_DOCENTE == undefined ? 'N.D.' : ListaDaSpedireTmp[i].NOME_DOCENTE,
                               "TITOLO_DOCENTE" : (ListaDaSpedireTmp[i].TITOLO_DOCENTE == undefined || ListaDaSpedireTmp[i].TITOLO_DOCENTE == '') ? 'Gent. Prof.' : ListaDaSpedireTmp[i].TITOLO_DOCENTE,
                               "INDIRIZZO"      : ListaDaSpedireTmp[i].INDIRIZZO == undefined ? 'N.D.' : ListaDaSpedireTmp[i].INDIRIZZO,
                               "COMUNE"         : ListaDaSpedireTmp[i].COMUNE == undefined ? 'N.D.' : ListaDaSpedireTmp[i].COMUNE,
                               "CAP"            : ListaDaSpedireTmp[i].CAP == undefined ? 'N.D.' : ListaDaSpedireTmp[i].CAP,
                               "PROVINCIA"      : ListaDaSpedireTmp[i].PROVINCIA == undefined ? 'N.D.' : ListaDaSpedireTmp[i].PROVINCIA,
                               "NOME_PROVINCIA" : ListaDaSpedireTmp[i].NOME_PROVINCIA == undefined ? 'N.D.' : ListaDaSpedireTmp[i].NOME_PROVINCIA,
                               "TARGA_PROVINCIA" : ListaDaSpedireTmp[i].TARGA_PROVINCIA == undefined ? 'N.D.' : ListaDaSpedireTmp[i].TARGA_PROVINCIA,
                               "NOME_PROMOTORE" : ListaDaSpedireTmp[i].NOME_PROMOTORE == undefined ? 'N.D.' : ListaDaSpedireTmp[i].NOME_PROMOTORE,
                               "ListaTitoli"    : [],
                               "ListaPrenotati" : []                                                                       
                             }
                ChiaveSpedizione = ListaDaSpedireTmp[i].SPEDIZIONE;
                ListaChiaviSpedizioni.push(ChiaveSpedizione);
              }
              Spedizione.ListaTitoli.push({
                                           "NOME_TITOLO" : ListaDaSpedireTmp[i].NOME_TITOLO == undefined ? 'N.D.' : ListaDaSpedireTmp[i].NOME_TITOLO,
                                           "QUANTITA"    : ListaDaSpedireTmp[i].QUANTITA == undefined ? 'N.D.' : ListaDaSpedireTmp[i].QUANTITA,
                                           "POS_MGZN"    : ListaDaSpedireTmp[i].POS_MGZN == undefined ? 'N.D.' : ListaDaSpedireTmp[i].POS_MGZN,
                                           "AUTORI"      : ListaDaSpedireTmp[i].AUTORI == undefined ? 'N.D' : ListaDaSpedireTmp[i].AUTORI,
                                           "EDITORE"     : ListaDaSpedireTmp[i].EDITORE == undefined ? 'N.D' : ListaDaSpedireTmp[i].EDITORE,
                                           "CODICE_ISBN" : ListaDaSpedireTmp[i].CODICE == undefined ? 'N.D' : ListaDaSpedireTmp[i].CODICE                                   
                                          })                                
          }             
          ListaSpedizioniToPrint.push(Spedizione);
 
          for(let i = 0;i < ListaSpedizioniToPrint.length;i ++)
          {
              ListaSpedizioniToPrint[i].ListaTitoli.sort(function(a,b)
              {
                let TitoloA = a.NOME_TITOLO;
                let TitoloB = b.NOME_TITOLO;
                return (TitoloA < TitoloB) ? -1 : (TitoloA > TitoloB) ? 1 : 0;
              });        
          }

         var Data       = new Date();
         var DataAnno   = Data.getFullYear();
         var DataMese   = Data.getMonth()+1; 
         var DataGiorno = Data.getDate();
         var DataSpedizione = DataGiorno.toString() + '/' + DataMese.toString() +  '/' + DataAnno.toString();

         if(SystemInformation.UserInformation.TipoStampa == 'V')
           {
              var doc = new jsPDF();
              doc.setProperties({title: 'STAMPA ETICHETTE ' + DataSpedizione});
              
              if(!$scope.SpedizioneImmediata)
              {
                 doc.setFontSize(10); 
                 doc.setFontType('bold');
                 doc.text(10,20,'REPORT SPEDIZIONI - IN DATA ' + DataSpedizione);
                 doc.setFontSize(7);
                 var CoordY = 20;
                 //doc.text(10,280,'BORDO INFERIORE');
                 
                 var ListaCumulativo = [];
                 
                 for(let i = 0;i < ListaSpedizioniToPrint.length;i ++)
                 {
                     for(let j = 0;j < ListaSpedizioniToPrint[i].ListaTitoli.length;j ++)
                     {
                         TitoloCorrisp = ListaCumulativo.findIndex(function(ATitolo){return(ATitolo.Codice == ListaSpedizioniToPrint[i].ListaTitoli[j].CODICE_ISBN);});
                         if(TitoloCorrisp == -1)
                         {
                             ListaCumulativo.push({
                                                   Codice     : ListaSpedizioniToPrint[i].ListaTitoli[j].CODICE_ISBN,
                                                   Nome       : ListaSpedizioniToPrint[i].ListaTitoli[j].NOME_TITOLO,
                                                   Quantita   : ListaSpedizioniToPrint[i].ListaTitoli[j].QUANTITA,
                                                   Posizione  : ListaSpedizioniToPrint[i].ListaTitoli[j].POS_MGZN
                                                 })
                         }
                         else 
                         {
                             ListaCumulativo[TitoloCorrisp].Quantita = parseInt(ListaCumulativo[TitoloCorrisp].Quantita) + parseInt(ListaSpedizioniToPrint[i].ListaTitoli[j].QUANTITA);   
                             ListaCumulativo[TitoloCorrisp].Quantita = ListaCumulativo[TitoloCorrisp].Quantita.toString()
                         } 
                     }
                 }
                 //CoordY = 20;
                 doc.setFontType('bold');
                 doc.setFontSize(8);
                 doc.text(10,CoordY+10,'QNT');
                 doc.text(20,CoordY+10,'ISBN');
                 doc.text(45,CoordY+10,'TITOLO');
                 doc.text(160,CoordY+10,'POS.MAGAZZINO');
                 doc.setFontSize(6);
             
                 for(let k = 0;k < ListaCumulativo.length;k ++)
                 {
                     if (CoordY >= 280) 
                     {
                       doc.addPage();
                       CoordY = 0;
                       doc.setFontType('bold');
                       doc.setFontSize(8);
                       doc.text(10,CoordY+10,'QNT');
                       doc.text(20,CoordY+10,'ISBN');
                       doc.text(45,CoordY+10,'TITOLO');
                       doc.text(160,CoordY+10,'POS.MAGAZZINO');
                       doc.setFontSize(6);
                       doc.setFontType('normal');
                       doc.text(10,290,SystemInformation.VDocDelivery)
                     }
                     
                     doc.setFontType('italic');
                     CoordY += 5;
                     var Q  = doc.getTextWidth('TOT');
                     var Qt = doc.getTextWidth(ListaCumulativo[k].Quantita);
                     doc.text(10 + Q + 1 - Qt,CoordY+10,ListaCumulativo[k].Quantita.toString());
                     doc.text(20,CoordY+10,ListaCumulativo[k].Codice);
                     doc.text(45,CoordY+10,TroncaTesto(ListaCumulativo[k].Nome,50));
                     doc.text(160,CoordY+10,ListaCumulativo[k].Posizione);            
                 }
                 doc.addPage();
              }

              if($scope.SpedizioneImmediata)
                 doc.deletePage(0) 

              for (let i = 0;i < ListaSpedizioniToPrint.length;i ++)
              {
                    if(ListaSpedizioniToPrint.length > 1)
                       doc.addPage();

                    doc.setFontSize(8);
                    if(BORDO_ETICHETTA)
                    {   
                      doc.setLineWidth(0.2);
                      doc.line(0,105,155,105);
                      doc.line(155,0,155,105);
                    }
                    
                    CoordY = 10;

                    //var Pagina43Logo = IMMAGINE BASE 64
                    
                    doc.setFontType('normal');
                    //doc.addImage(Pagina43Logo,'JPEG',5,8,70,20);
                    if(BORDO_ETICHETTA)
                    {   
                       var Ind = doc.getTextWidth(DatiDitta.Indirizzo);
                       var Tel = doc.getTextWidth('Tel : ' + DatiDitta.Telefono);
                       var Mail = doc.getTextWidth('Email : ' + DatiDitta.Email + ' SitoWeb : ' + DatiDitta.SitoWeb);           
                       doc.text(150 - Ind,CoordY,DatiDitta.Indirizzo);
                       doc.text(150 - Tel,CoordY + 5,'Tel : ' + DatiDitta.Telefono);
                       doc.text(150 - Mail,CoordY + 10,'Email : ' + DatiDitta.Email + ' SitoWeb : ' + DatiDitta.SitoWeb);
                    }
                    
                    doc.setFontType('courier');
                    doc.setFontSize(12);
                    if (ListaSpedizioniToPrint[i].DOCENTE != 'N.D.')
                    {
                        doc.text(50,CoordY + 40,ListaSpedizioniToPrint[i].TITOLO_DOCENTE);
                        doc.setFontType('bold');
                        doc.text(50,CoordY + 45,ListaSpedizioniToPrint[i].NOME_DOCENTE);
                        doc.setFontType('normal');
                        if(ListaSpedizioniToPrint[i].NOME_ISTITUTO != 'N.D.')
                           doc.text(50,CoordY + 53,(ListaSpedizioniToPrint[i].NOME_ISTITUTO))
                        else 
                        {
                          if(ListaSpedizioniToPrint[i].PRESSO != ListaSpedizioniToPrint[i].NOME_DOCENTE)
                            doc.text(50,CoordY + 53,(ListaSpedizioniToPrint[i].PRESSO))        
                        }
                        doc.text(50,CoordY + 60,ListaSpedizioniToPrint[i].INDIRIZZO);
                        doc.text(50,CoordY + 65,ListaSpedizioniToPrint[i].CAP + ', ' + ListaSpedizioniToPrint[i].COMUNE + /*', ' + ListaSpedizioniToPrint[i].NOME_PROVINCIA +*/ ' (' + ListaSpedizioniToPrint[i].TARGA_PROVINCIA + ')');                   doc.setFontType('italic');
                    }
                    else
                    {                   
                        doc.text(50,CoordY + 55,ListaSpedizioniToPrint[i].PRESSO);
                        doc.text(50,CoordY + 60,ListaSpedizioniToPrint[i].INDIRIZZO);
                        doc.text(50,CoordY + 65,ListaSpedizioniToPrint[i].CAP + ', ' + ListaSpedizioniToPrint[i].COMUNE + /*', ' + /*ListaSpedizioniToPrint[i].NOME_PROVINCIA +*/ ' (' + ListaSpedizioniToPrint[i].TARGA_PROVINCIA + ')' );  
                    }
                    
                    doc.setFontType('italic');
                    doc.setFontSize(12);

                    doc.text(5,CoordY + 85, 'A cura di : ' + ListaSpedizioniToPrint[i].NOME_PROMOTORE.toUpperCase());
                    
                    doc.text(90,CoordY + 85, 'Peso Gr.........................');
                    doc.line(90,CoordY + 86,130,CoordY + 86);

                    doc.setLineWidth(0.2);
                    doc.line(10,120,200,120);
                    
                    CoordY = 90;

                    doc.setFontType('normal');
                    doc.setFontSize(10);
                              
                    if (ListaSpedizioniToPrint[i].DOCENTE != 'N.D.')
                    {
                        doc.text(10,CoordY + 40,'DOCENTE:');
                        doc.text(10,CoordY + 45,ListaSpedizioniToPrint[i].NOME_DOCENTE);                      
                        if(ListaSpedizioniToPrint[i].NOME_ISTITUTO != 'N.D.')
                           doc.text(10,CoordY + 55,(ListaSpedizioniToPrint[i].NOME_ISTITUTO))
                        else 
                        {
                          if(ListaSpedizioniToPrint[i].PRESSO != ListaSpedizioniToPrint[i].NOME_DOCENTE)
                            doc.text(10,CoordY + 55,(ListaSpedizioniToPrint[i].PRESSO))        
                        }                  
                        doc.text(10,CoordY + 60,ListaSpedizioniToPrint[i].INDIRIZZO + ', ' + ListaSpedizioniToPrint[i].COMUNE + ', ' + ListaSpedizioniToPrint[i].CAP + /*', ' +  ListaSpedizioniToPrint[i].NOME_PROVINCIA +*/ ' (' + ListaSpedizioniToPrint[i].TARGA_PROVINCIA + ')')      
                    }
                    else
                    {
                        doc.text(10,CoordY + 55,'PRESSO : ' + ListaSpedizioniToPrint[i].PRESSO);
                        doc.text(10,CoordY + 60,ListaSpedizioniToPrint[i].INDIRIZZO + ', ' + ListaSpedizioniToPrint[i].COMUNE + ', ' + ListaSpedizioniToPrint[i].CAP + /*', ' +  ListaSpedizioniToPrint[i].NOME_PROVINCIA +*/ ' (' + ListaSpedizioniToPrint[i].TARGA_PROVINCIA + ')')      
                    }

                    CoordY = 80;
                    doc.setFontType('bold');
                    doc.setFontSize(9);
                    doc.text(10,CoordY + 80,'CODICE ISBN');
                    doc.text(40,CoordY + 80,'TITOLO');
                    doc.text(120,CoordY + 80,'EDITORE');
                    doc.text(150,CoordY + 80,'QUANTITA');
                    doc.text(170,CoordY + 80,'POS.MAGAZZINO');
                    
                    doc.setFontType('normal');
                    CoordY = 160; 
                    
                    for (let j = 0;j < ListaSpedizioniToPrint[i].ListaTitoli.length;j ++)
                    {
                        if (CoordY >= 280) 
                        {
                          doc.addPage();
                          CoordY = 20;
                          doc.setFontType('bold');
                          doc.setFontSize(9);
                          doc.text(10,CoordY,'CODICE ISBN');
                          doc.text(40,CoordY,'TITOLO');
                          doc.text(120,CoordY,'EDITORE');
                          doc.text(150,CoordY,'QUANTITA');
                          doc.text(170,CoordY,'POS.MAGAZZINO');
                          doc.setFontSize(8);
                          doc.setFontType('normal');
                        }  

                        doc.setFontSize(8);    
                        doc.text(10,CoordY+10,ListaSpedizioniToPrint[i].ListaTitoli[j].CODICE_ISBN);                  
                        doc.text(40,CoordY+10,TroncaTesto(ListaSpedizioniToPrint[i].ListaTitoli[j].NOME_TITOLO,35));
                        doc.text(120,CoordY+10,TroncaTesto(ListaSpedizioniToPrint[i].ListaTitoli[j].EDITORE,15));
                        var Q  = doc.getTextWidth('QUANTITA');
                        var Qt = doc.getTextWidth(ListaSpedizioniToPrint[i].ListaTitoli[j].QUANTITA);
                        doc.text(150 + Q + 1 - Qt,CoordY+10,ListaSpedizioniToPrint[i].ListaTitoli[j].QUANTITA.toString());
                        doc.text(170,CoordY+10,ListaSpedizioniToPrint[i].ListaTitoli[j].POS_MGZN); 
                        CoordY += 5;               
                    }          
                    doc.setFontSize(6);
                    doc.text(10,290,SystemInformation.VDocDelivery)
                    
              }
            doc.save('EtichettePDF' + DataSpedizione + '.pdf',{}); // USANDO IFRAME NON PERMETTE IL SALVATAGGIO!
            $scope.AbilitaConfermaStampa = true;
            /*var string = doc.output('datauristring');
            var iframe = "<iframe width='100%' height='100%' src='" + string + "'></iframe>"
            var x = window.open();
            x.document.open();
            x.document.write(iframe);
            x.document.close();*/
         }
         else NuovaStampa(ListaSpedizioniToPrint,ListaChiaviSpedizioni,DataSpedizione);
     }
     else SystemInformation.ApplyOnError('Modello lista spedizioni non conforme') 
    })
  }
  else $scope.RefreshListaSpedizioniAll();
 
  $scope.SelezionaTutto = function()
  {
    if($scope.ListaSpedizioni.length > 0)
    {
       for(let i = 0;i < $scope.ListaSpedizioni.length;i ++)
           if($scope.ListaSpedizioni[i].Tipo == 1)
              $scope.ListaSpedizioni[i].Selezionato = true;    
    }
  }
  
  $scope.DeselezionaTutto = function()
  {
    if($scope.ListaSpedizioni.length > 0)
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
                     templateUrl         : "template/addBookFilterPopupLabel.html",
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
         ZCustomAlert($mdDialog,'ATTENZIONE','NESSUN TITOLO SELEZIONATO!');
         return
      }
      else
      {
         for(let j = 0;j < $scope.ListaTitoliFiltroTmp.length;j ++)
                $scope.ListaTitoliFiltro.push($scope.ListaTitoliFiltroTmp[j]);
         if(ContatoreDoppi != 0)
            ZCustomAlert($mdDialog,'AVVISO',"ALCUNI TITOLI ERANO GIA' PRESENTI IN RICERCA!");          
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

  $scope.ConfermaEtichetteToSend = function()
  {
    var ChiaviDaSpedire = [];
    var ContatoreEtichette = 0;
     for(let i = 0;i < $scope.ListaSpedizioni.length;i ++)
     {
         if($scope.ListaSpedizioni[i].Selezionato)
         {
            ChiaviDaSpedire.push($scope.ListaSpedizioni[i].ChiaveDettaglio) 
            ContatoreEtichette++
         }            
     }
     if(ContatoreEtichette == 0)
     {
       ZCustomAlert($mdDialog,'ATTENZIONE',"NON E' STATA TROVATA NESSUNA ETICHETTA DA STAMPARE!");
       return
     }
     else
     {
       ChiaviDaSpedireTmp = ChiaviDaSpedire.toString();
       SystemInformation.GetSQL('PrintLabel',{ChiaviDaSpedire : ChiaviDaSpedireTmp},function(Results)
       {
         ListaDaSpedireTmp         = SystemInformation.FindResults(Results,'LabelPrintDeliveryToSend');
         var ListaChiaviSpedizioni = [];

         if(ListaDaSpedireTmp != undefined)
         {
             var ChiaveSpedizione = -1;
             for(let i = 0; i < ListaDaSpedireTmp.length; i ++)
             {
                 if(ChiaveSpedizione != ListaDaSpedireTmp[i].SPEDIZIONE)
                 {
                   if (Spedizione != undefined)
                       ListaSpedizioniToPrint.push(Spedizione);
                  
                   var Spedizione = {};
                   
                   Spedizione = {
                                  "CHIAVE"         : ListaDaSpedireTmp[i].SPEDIZIONE,
                                  "PRESSO"         : ListaDaSpedireTmp[i].PRESSO == undefined ? 'N.D.' : ListaDaSpedireTmp[i].PRESSO,
                                  "DOCENTE"        : ListaDaSpedireTmp[i].DOCENTE == undefined ? 'N.D.' : ListaDaSpedireTmp[i].DOCENTE,
                                  "ISTITUTO"       : ListaDaSpedireTmp[i].ISTITUTO == undefined ? 'N.D.' : ListaDaSpedireTmp[i].ISTITUTO,
                                  "NOME_ISTITUTO"  : ListaDaSpedireTmp[i].NOME_ISTITUTO == undefined ? 'N.D.' : ListaDaSpedireTmp[i].NOME_ISTITUTO,
                                  "NOME_DOCENTE"   : ListaDaSpedireTmp[i].NOME_DOCENTE == undefined ? 'N.D.' : ListaDaSpedireTmp[i].NOME_DOCENTE,
                                  "TITOLO_DOCENTE" : (ListaDaSpedireTmp[i].TITOLO_DOCENTE == undefined || ListaDaSpedireTmp[i].TITOLO_DOCENTE == '') ? 'Gent. Prof.' : ListaDaSpedireTmp[i].TITOLO_DOCENTE,
                                  "INDIRIZZO"      : ListaDaSpedireTmp[i].INDIRIZZO == undefined ? 'N.D.' : ListaDaSpedireTmp[i].INDIRIZZO,
                                  "COMUNE"         : ListaDaSpedireTmp[i].COMUNE == undefined ? 'N.D.' : ListaDaSpedireTmp[i].COMUNE,
                                  "CAP"            : ListaDaSpedireTmp[i].CAP == undefined ? 'N.D.' : ListaDaSpedireTmp[i].CAP,
                                  "PROVINCIA"      : ListaDaSpedireTmp[i].PROVINCIA == undefined ? 'N.D.' : ListaDaSpedireTmp[i].PROVINCIA,
                                  "NOME_PROVINCIA" : ListaDaSpedireTmp[i].NOME_PROVINCIA == undefined ? 'N.D.' : ListaDaSpedireTmp[i].NOME_PROVINCIA,
                                  "TARGA_PROVINCIA" : ListaDaSpedireTmp[i].TARGA_PROVINCIA == undefined ? 'N.D.' : ListaDaSpedireTmp[i].TARGA_PROVINCIA,
                                  "NOME_PROMOTORE" : ListaDaSpedireTmp[i].NOME_PROMOTORE == undefined ? 'N.D.' : ListaDaSpedireTmp[i].NOME_PROMOTORE,
                                  "ListaTitoli"    : [],  
                                  "ListaPrenotati" : []                                   
                                }
                   ChiaveSpedizione = ListaDaSpedireTmp[i].SPEDIZIONE;
                   ListaChiaviSpedizioni.push(ChiaveSpedizione);
                 }
                 Spedizione.ListaTitoli.push({
                                              "NOME_TITOLO" : ListaDaSpedireTmp[i].NOME_TITOLO == undefined ? 'N.D.' : ListaDaSpedireTmp[i].NOME_TITOLO,
                                              "QUANTITA"    : ListaDaSpedireTmp[i].QUANTITA == undefined ? 'N.D.' : ListaDaSpedireTmp[i].QUANTITA,
                                              "POS_MGZN"    : ListaDaSpedireTmp[i].POS_MGZN == undefined ? 'N.D.' : ListaDaSpedireTmp[i].POS_MGZN,
                                              "AUTORI"      : ListaDaSpedireTmp[i].AUTORI == undefined ? 'N.D' : ListaDaSpedireTmp[i].AUTORI,
                                              "EDITORE"     : ListaDaSpedireTmp[i].EDITORE == undefined ? 'N.D' : ListaDaSpedireTmp[i].EDITORE,
                                              "CODICE_ISBN" : ListaDaSpedireTmp[i].CODICE == undefined ? 'N.D' : ListaDaSpedireTmp[i].CODICE                                   
                                             })                                
             }             
             ListaSpedizioniToPrint.push(Spedizione);
    
             for(let i = 0;i < ListaSpedizioniToPrint.length;i ++)
             {
                 ListaSpedizioniToPrint[i].ListaTitoli.sort(function(a,b)
                 {
                   let TitoloA = a.NOME_TITOLO;
                   let TitoloB = b.NOME_TITOLO;
                   return (TitoloA < TitoloB) ? -1 : (TitoloA > TitoloB) ? 1 : 0;
                 });        
             }

            var Data       = new Date();
            var DataAnno   = Data.getFullYear();
            var DataMese   = Data.getMonth()+1; 
            var DataGiorno = Data.getDate();
            var DataSpedizione = DataGiorno.toString() + '/' + DataMese.toString() +  '/' + DataAnno.toString();
          
            if(SystemInformation.UserInformation.TipoStampa == 'V')
            {
               var doc = new jsPDF();
               doc.setProperties({title: 'STAMPA ETICHETTE ' + DataSpedizione});
               
               doc.setFontSize(10); 
               doc.setFontType('bold');
               doc.text(10,20,'REPORT SPEDIZIONI - IN DATA ' + DataSpedizione);
               doc.setFontSize(7);
               var CoordY = 30;
               //doc.text(10,280,'BORDO INFERIORE');
               
               var ListaCumulativo = [];
               
               for(let i = 0;i < ListaSpedizioniToPrint.length;i ++)
               {
                   for(let j = 0;j < ListaSpedizioniToPrint[i].ListaTitoli.length;j ++)
                   {
                       TitoloCorrisp = ListaCumulativo.findIndex(function(ATitolo){return(ATitolo.Codice == ListaSpedizioniToPrint[i].ListaTitoli[j].CODICE_ISBN);});
                       if(TitoloCorrisp == -1)
                       {
                           ListaCumulativo.push({
                                                 Codice     : ListaSpedizioniToPrint[i].ListaTitoli[j].CODICE_ISBN,
                                                 Nome       : ListaSpedizioniToPrint[i].ListaTitoli[j].NOME_TITOLO,
                                                 Quantita   : ListaSpedizioniToPrint[i].ListaTitoli[j].QUANTITA,
                                                 Posizione  : ListaSpedizioniToPrint[i].ListaTitoli[j].POS_MGZN
                                               })
                       }
                       else 
                       {
                           ListaCumulativo[TitoloCorrisp].Quantita = parseInt(ListaCumulativo[TitoloCorrisp].Quantita) + parseInt(ListaSpedizioniToPrint[i].ListaTitoli[j].QUANTITA);   
                           ListaCumulativo[TitoloCorrisp].Quantita = ListaCumulativo[TitoloCorrisp].Quantita.toString()
                       } 
                   }
               }
               CoordY = 20;
               doc.setFontType('bold');
               doc.setFontSize(8);
               doc.text(10,CoordY+10,'QNT');
               doc.text(20,CoordY+10,'ISBN');
               doc.text(45,CoordY+10,'TITOLO');
               doc.text(160,CoordY+10,'POS.MAGAZZINO');
               doc.setFontSize(6);
           
               for(let k = 0;k < ListaCumulativo.length;k ++)
               {
                   if (CoordY >= 280) 
                   {
                     doc.addPage();
                     CoordY = 0;
                     doc.setFontType('bold');
                     doc.setFontSize(8);
                     doc.text(10,CoordY+10,'QNT');
                     doc.text(20,CoordY+10,'ISBN');
                     doc.text(45,CoordY+10,'TITOLO');
                     doc.text(160,CoordY+10,'POS.MAGAZZINO');
                     doc.setFontSize(6);
                     doc.setFontType('normal');
                     doc.text(10,290,SystemInformation.VDocDelivery)
                   }
                   
                   doc.setFontType('italic');
                   CoordY += 5;
                   var Q  = doc.getTextWidth('TOT');
                   var Qt = doc.getTextWidth(ListaCumulativo[k].Quantita);
                   doc.text(10 + Q + 1 - Qt,CoordY+10,ListaCumulativo[k].Quantita.toString());
                   doc.text(20,CoordY+10,ListaCumulativo[k].Codice);
                   doc.text(45,CoordY+10,TroncaTesto(ListaCumulativo[k].Nome,50));
                   doc.text(160,CoordY+10,ListaCumulativo[k].Posizione);            
               }
               
               for (let i = 0;i < ListaSpedizioniToPrint.length;i ++)
               {
                     doc.addPage();
                     doc.setFontSize(8);
                     if(BORDO_ETICHETTA)
                     {   
                       doc.setLineWidth(0.2);
                       doc.line(0,105,155,105);
                       doc.line(155,0,155,105);
                     }
                     
                     CoordY = 10;

                     //var Pagina43Logo = IMMAGINE BASE 64
                     
                     doc.setFontType('normal');
                     //doc.addImage(Pagina43Logo,'JPEG',5,8,70,20);
                     
                     if(BORDO_ETICHETTA)
                     {
                        var Ind = doc.getTextWidth(DatiDitta.Indirizzo);
                        var Tel = doc.getTextWidth('Tel : ' + DatiDitta.Telefono);
                        var Mail = doc.getTextWidth('Email : ' + DatiDitta.Email + ' SitoWeb : ' + DatiDitta.SitoWeb);           
                        doc.text(150 - Ind,CoordY,DatiDitta.Indirizzo);
                        doc.text(150 - Tel,CoordY + 5,'Tel : ' + DatiDitta.Telefono);
                        doc.text(150 - Mail,CoordY + 10,'Email : ' + DatiDitta.Email + ' SitoWeb : ' + DatiDitta.SitoWeb);
                     }

                     doc.setFontType('courier');
                     doc.setFontSize(12);
                     if (ListaSpedizioniToPrint[i].DOCENTE != 'N.D.')
                     {
                         doc.text(50,CoordY + 40,ListaSpedizioniToPrint[i].TITOLO_DOCENTE);
                         doc.setFontType('bold');
                         doc.text(50,CoordY + 45,ListaSpedizioniToPrint[i].NOME_DOCENTE);
                         doc.setFontType('normal');
                         if(ListaSpedizioniToPrint[i].NOME_ISTITUTO != 'N.D.')
                            doc.text(50,CoordY + 53,(ListaSpedizioniToPrint[i].NOME_ISTITUTO))
                         else 
                         {
                           if(ListaSpedizioniToPrint[i].PRESSO != ListaSpedizioniToPrint[i].NOME_DOCENTE)
                              doc.text(50,CoordY + 53,(ListaSpedizioniToPrint[i].PRESSO))        
                         }
                         doc.text(50,CoordY + 60,ListaSpedizioniToPrint[i].INDIRIZZO);
                         doc.text(50,CoordY + 65,ListaSpedizioniToPrint[i].CAP + ', ' + ListaSpedizioniToPrint[i].COMUNE + /*', ' + ListaSpedizioniToPrint[i].NOME_PROVINCIA +*/ ' (' + ListaSpedizioniToPrint[i].TARGA_PROVINCIA + ')');
                     }
                     else
                     {                     
                         doc.text(50,CoordY + 50,ListaSpedizioniToPrint[i].PRESSO);
                         doc.text(50,CoordY + 60,ListaSpedizioniToPrint[i].INDIRIZZO);
                         doc.text(50,CoordY + 65,ListaSpedizioniToPrint[i].CAP + ', ' + ListaSpedizioniToPrint[i].COMUNE + /*', ' + ListaSpedizioniToPrint[i].NOME_PROVINCIA +*/ ' (' + ListaSpedizioniToPrint[i].TARGA_PROVINCIA + ')');
                     }
                     
                     doc.setFontType('italic');
                     doc.setFontSize(12);
                     doc.text(5,CoordY + 85, 'A cura di : ' + ListaSpedizioniToPrint[i].NOME_PROMOTORE.toUpperCase());
                     
                     doc.text(90,CoordY + 85, 'Peso Gr.........................');
                     doc.line(90,CoordY + 86,130,CoordY + 86);

                     doc.setLineWidth(0.2);
                     doc.line(10,120,200,120);
                     
                     CoordY = 90;
                     
                     doc.setFontType('normal');
                     doc.setFontSize(10);
                     if (ListaSpedizioniToPrint[i].DOCENTE != 'N.D.')
                     {
                         doc.text(10,CoordY + 40,'DOCENTE:');
                         doc.text(10,CoordY + 45,ListaSpedizioniToPrint[i].NOME_DOCENTE);
                         if(ListaSpedizioniToPrint[i].NOME_ISTITUTO != 'N.D.')
                            doc.text(10,CoordY + 55,(ListaSpedizioniToPrint[i].NOME_ISTITUTO))
                         else 
                         {
                           if(ListaSpedizioniToPrint[i].PRESSO != ListaSpedizioniToPrint[i].NOME_DOCENTE)
                             doc.text(10,CoordY + 55,(ListaSpedizioniToPrint[i].PRESSO))        
                         }  
                         doc.text(10,CoordY + 60,ListaSpedizioniToPrint[i].INDIRIZZO + ', ' + ListaSpedizioniToPrint[i].COMUNE + ', ' + ListaSpedizioniToPrint[i].CAP + /*', ' +  ListaSpedizioniToPrint[i].NOME_PROVINCIA +*/ ' (' + ListaSpedizioniToPrint[i].TARGA_PROVINCIA + ')')      
                     }
                     else
                     {
                         doc.text(10,CoordY + 55,'PRESSO : ' + ListaSpedizioniToPrint[i].PRESSO);
                         doc.text(10,CoordY + 60,ListaSpedizioniToPrint[i].INDIRIZZO + ', ' + ListaSpedizioniToPrint[i].COMUNE + ', ' + ListaSpedizioniToPrint[i].CAP + /*', ' +  ListaSpedizioniToPrint[i].NOME_PROVINCIA +*/ ' (' + ListaSpedizioniToPrint[i].TARGA_PROVINCIA + ')')      
                     }
                     
                     CoordY = 80;
                     doc.setFontType('bold');
                     doc.setFontSize(9);
                     doc.text(10,CoordY + 80,'CODICE ISBN');
                     doc.text(40,CoordY + 80,'TITOLO');
                     doc.text(120,CoordY + 80,'EDITORE');
                     doc.text(150,CoordY + 80,'QUANTITA');
                     doc.text(170,CoordY + 80,'POS.MAGAZZINO');
                     
                     doc.setFontType('normal');

                     CoordY = 160;
                     
                     for (let j = 0;j < ListaSpedizioniToPrint[i].ListaTitoli.length;j ++)
                     {  
                         if (CoordY >= 280) 
                         {
                           doc.addPage();
                           CoordY = 20;
                           doc.setFontType('bold');
                           doc.setFontSize(9);
                           doc.text(10,CoordY,'CODICE ISBN');
                           doc.text(40,CoordY,'TITOLO');
                           doc.text(120,CoordY,'EDITORE');
                           doc.text(150,CoordY,'QUANTITA');
                           doc.text(170,CoordY,'POS.MAGAZZINO');
                           doc.setFontSize(8);
                           doc.setFontType('normal');
                         } 
                            
                         doc.setFontSize(8);                   
                         doc.text(10,CoordY + 10,ListaSpedizioniToPrint[i].ListaTitoli[j].CODICE_ISBN);                     
                         doc.text(40,CoordY + 10,TroncaTesto(ListaSpedizioniToPrint[i].ListaTitoli[j].NOME_TITOLO,35));
                         doc.text(120,CoordY + 10,TroncaTesto(ListaSpedizioniToPrint[i].ListaTitoli[j].EDITORE,15));
                         var Q  = doc.getTextWidth('QUANTITA');
                         var Qt = doc.getTextWidth(ListaSpedizioniToPrint[i].ListaTitoli[j].QUANTITA);
                         doc.text(150 + Q + 1 - Qt,CoordY + 10,ListaSpedizioniToPrint[i].ListaTitoli[j].QUANTITA.toString());
                         doc.text(170,CoordY + 10,ListaSpedizioniToPrint[i].ListaTitoli[j].POS_MGZN); 
                         CoordY += 5;               
                     }          
                     doc.setFontSize(6);
                     doc.text(10,290,SystemInformation.VDocDelivery)
                     $scope.AbilitaConfermaStampa = true;
             }
             doc.save('EtichettePDF' + DataSpedizione + '.pdf',{});  // USANDO IFRAME NON PERMETTE IL SALVATAGGIO!

             /*var string = doc.output('datauristring');
             var iframe = "<iframe width='100%' height='100%' src='" + string + "'></iframe>"
             var x = window.open();
             x.document.open();
             x.document.write(iframe);
             x.document.close();*/
            }
            else NuovaStampa(ListaSpedizioniToPrint,ListaChiaviSpedizioni,DataSpedizione);
        }
        else SystemInformation.ApplyOnError('Modello lista spedizioni non conforme') 
    })
  }
}

$scope.ConfermaStampa = function ()
{
  var ConfermaStampaSped = function()
  {   
      var $ObjQuery = { Operazioni : [] };
      
      for (i = 0;i < ListaDaSpedireTmp.length;i ++)
      {    
            var SpedDettParam = {
                                  "CHIAVE" : ListaDaSpedireTmp[i].CHIAVE
                                };
            $ObjQuery.Operazioni.push({
                                        Query     : 'DeliveryBookToDelivered',
                                        Parametri : SpedDettParam
                                      });
      }
      SystemInformation.PostSQL('PrintLabel',$ObjQuery,function()
      {
        $ObjQuery              = {};
        DatiDitta              = {};
        $scope.ListaSpedizioni = [];
        ListaDaSpedireTmp      = [];
        if(SystemInformation.DataBetweenDelivery.Provenienza == 'TeacherPage')
           $state.go("teacherListPage")
        else $state.go("startPage");
      });
  }
  ZConfirm.GetConfirmBox('AVVISO','Tutte le etichette sono state stampate correttamente?',ConfermaStampaSped,function(){});
}

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