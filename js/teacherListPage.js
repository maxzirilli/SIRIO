SIRIOApp.controller("teacherListPageController", ['$scope', 'SystemInformation', '$state', '$rootScope', '$mdDialog', '$sce', '$filter', 'ZConfirm', function ($scope, SystemInformation, $state, $rootScope, $mdDialog, $sce, $filter, ZConfirm) 
{
  $scope.MailOn                 = false;
  $scope.ListaDocenti           = [];
  $scope.EditingOn              = false;
  $scope.DocenteInEditing       = {};
  $scope.ListaMaterie           = [];
  $scope.ListaPiattaforme       = [{ Sigla: PIATTA_HUBSCUOLA, Valore: "HubScuola" }, { Sigla: PIATTA_BSMART, Valore: "BSmart" }, { Sigla: PIATTA_NESSUNA, Valore: "Nessuna Piattaforma" }];
  $scope.GiorniSettimana        = SystemInformation.GiorniSettimana;
  $scope.IstitutoDaAssociare    = -1;
  $scope.ANomeFiltro            = '';
  $scope.ListaMateriePerDoc     = [];
  $scope.IstitutoVisualizzato   = -1;
  $scope.ListaInsegnamenti      = [];
  $scope.TitoloFiltro           = -1;
  $scope.AProvinciaFiltro       = -1;
  $scope.IstitutoFiltrato       = -1;
  $scope.MateriaFiltro          = -1;
  $scope.ListaIstitutiTitolo    = [];
  $scope.IstitutoMultipla       = -1;
  $scope.GiorniSettimanaD       = SystemInformation.GiorniSettimana;
  $scope.DisponibilitaInEditing = [];
  $scope.NomeFiltro             = '';
  $scope.CodiceFiltro           = '';
  $scope.CoordMateriaFiltro     = false;
  $scope.OldPagina              = 0;
  $scope.AdozioniGestite        = true;
  $scope.ListaGiorni            = [{ Numero: 0, Descrizione: 'LUNEDI' }, { Numero: 1, Descrizione: 'MARTEDI' }, { Numero: 2, Descrizione: 'MERCOLEDI' }, { Numero: 3, Descrizione: 'GIOVEDI' },
                                   { Numero: 4, Descrizione: 'VENERDI' }, { Numero: 5, Descrizione: 'SABATO' }, { Numero: 6, Descrizione: 'DOMENICA' }];
  $scope.ListaOrariTabella      = [];
  $scope.ListaAnni              = [];
  $scope.ListaAllegatiMail      = [];
  currentYear                   = new Date().getFullYear();
  earliestYear                  = 2020;
  while(currentYear >= earliestYear) 
  {
    $scope.ListaAnni.push(currentYear);
    currentYear--;
  }
  $scope.AnnoRicercaSpedizioni  = $scope.ListaAnni[0];
  $scope.AnnoFiltro             = -1;
  $scope.CombinazioneFiltro     = -1;
  $scope.ListaCombinazioni      = [];

  $scope.AbilitaInvioMultiplo = function () 
  {
    var DocentiConMail  = 0;
    let DocentiFiltrati = $filter('DocenteByFiltro')($scope.ListaDocenti,$scope.ANomeFiltro,$scope.MateriaFiltro,$scope.CoordMateriaFiltro);

    for(let i = 0; i < DocentiFiltrati.length; i ++)
        if(DocentiFiltrati[i].Email != 'Non disponibile')
           DocentiConMail++;

    return(DocentiConMail < MAX_N_DESTINATARI_MAIL &&
           DocentiConMail > 0);
  };

  if (!(SystemInformation.DataBetweenController.OldPaginaDocenti != 1 && SystemInformation.DataBetweenController.OldPaginaDocenti != undefined))
        SystemInformation.DataBetweenController = {};

  $scope.CheckOldIstituto = false;

  ScopeHeaderController.CheckButtons();

  if(SystemInformation.DataBetweenDelivery.Provenienza == 'TeacherPage') 
  {
     $scope.MateriaFiltro      = parseInt(SystemInformation.DataBetweenDelivery.MateriaFiltro);
     $scope.searchTextMat      = SystemInformation.DataBetweenDelivery.MateriaFiltroNome
     $scope.IstitutoFiltrato   = parseInt(SystemInformation.DataBetweenDelivery.IstitutoFiltrato);
     $scope.searchTextIstituto = SystemInformation.DataBetweenDelivery.IstitutoFiltratoNome;
     SystemInformation.DataBetweenDelivery = {};
  }

  $scope.IsAdministrator = SystemInformation.IsAdministrator;

  $scope.GridOptions = {
                         rowSelection: false,
                         multiSelect: true,
                         autoSelect: true,
                         decapitate: false,
                         largeEditDialog: false,
                         boundaryLinks: false,
                         limitSelect: true,
                         pageSelect: true,
                         query: 
                         {
                           limit: 50,
                           page: 1
                         },
                         limitOptions: [25, 50, 75, 100]
                      };

  $scope.GridOptions2 = {
                          rowSelection: false,
                          multiSelect: true,
                          autoSelect: true,
                          decapitate: false,
                          largeEditDialog: false,
                          boundaryLinks: false,
                          limitSelect: true,
                          pageSelect: true,
                          query: 
                          {
                            limit: 10,
                            page: 1
                          },
                          limitOptions: [10, 20, 30]
                        };

  $scope.GridOptions3 = {
                          rowSelection: false,
                          multiSelect: true,
                          autoSelect: true,
                          decapitate: false,
                          largeEditDialog: false,
                          boundaryLinks: false,
                          limitSelect: true,
                          pageSelect: true,
                          query: 
                          {
                            limit: 10,
                            page: 1
                          },
                          limitOptions: [10, 20, 30]
                       };

  $scope.GridOptions4 = {
                          rowSelection: false,
                          multiSelect: true,
                          autoSelect: true,
                          decapitate: false,
                          largeEditDialog: false,
                          boundaryLinks: false,
                          limitSelect: true,
                          pageSelect: true,
                          query: 
                          {
                            limit: 10,
                            page: 1
                          },
                          limitOptions: [10, 20, 30]
                        };

  $scope.GridOptionsAdoz = {
                             rowSelection: false,
                             multiSelect: true,
                             autoSelect: true,
                             decapitate: false,
                             largeEditDialog: false,
                             boundaryLinks: false,
                             limitSelect: true,
                             pageSelect: true,
                             query: 
                             {
                               limit: 10,
                               page: 1
                             },
                             limitOptions: [10, 20, 30]
                           };

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
          ListaMaterieOpt[i] = {
                                 Chiave: ListaMaterieOpt[i].CHIAVE,
                                 Nome: ListaMaterieOpt[i].DESCRIZIONE
                               }
     }
      $scope.ListaMaterie = ListaMaterieOpt;
    }
    else SystemInformation.ApplyOnError('Modello materie non conforme', '');
  });

  SystemInformation.GetSQL('Schedule', {}, function (Results) 
  {
    ListaOrariTabellaTmp = SystemInformation.FindResults(Results, 'ScheduleInfoList');
    if(ListaOrariTabellaTmp != undefined) 
    {
       for(let i = 0; i < ListaOrariTabellaTmp.length; i++)
           ListaOrariTabellaTmp[i] = {
                                       Chiave: ListaOrariTabellaTmp[i].CHIAVE,
                                       Descrizione: ListaOrariTabellaTmp[i].DESCRIZIONE
                                     }
        $scope.ListaOrariTabella = ListaOrariTabellaTmp;
    }
    else SystemInformation.ApplyOnError('Modello orari disponibilità non conforme', '');
  });

  SystemInformation.GetSQL('Institute', {}, function (Results) 
  {
    var ListaIstitutiAssegnati = [];
    IstitutiInfoLista = SystemInformation.FindResults(Results, 'InstituteInfoList');
    if (IstitutiInfoLista != undefined) {
     for(let i = 0; i < IstitutiInfoLista.length; i++) 
     {
        /*if(IstitutiInfoLista[i].NR_DOCENTI > 0) //CONTROLLARE*/
        ListaIstitutiAssegnati.push({
                                      Chiave: IstitutiInfoLista[i].CHIAVE,
                                      Codice: IstitutiInfoLista[i].CODICE,
                                      Istituto: IstitutiInfoLista[i].NOME
                                    });

        IstitutiInfoLista[i] = {
                                 Chiave: IstitutiInfoLista[i].CHIAVE,
                                 Codice: IstitutiInfoLista[i].CODICE,
                                 Istituto: IstitutiInfoLista[i].NOME
                               }
     }
     $scope.ListaIstituti = ListaIstitutiAssegnati;
     $scope.ListaIstitutiNoFilter = Array.from(ListaIstitutiAssegnati);
    }
    else SystemInformation.ApplyOnError('Modello istituti non conforme', '');
  });

  SystemInformation.GetSQL('Institute', {}, function (Results) 
  {
   IstitutiInfoListaP = SystemInformation.FindResults(Results, 'InstituteInfoListOnlyVisibile');
   if(IstitutiInfoListaP != undefined) 
   {
      for(let i = 0; i < IstitutiInfoListaP.length; i++)
          IstitutiInfoListaP[i] = {
                                    Chiave: IstitutiInfoListaP[i].CHIAVE,
                                    Codice: IstitutiInfoListaP[i].CODICE,
                                    Istituto: IstitutiInfoListaP[i].NOME
                                  }
      $scope.ListaIstitutiPopup = IstitutiInfoListaP;
   }
   else SystemInformation.ApplyOnError('Modello istituti non conforme', '');
  }, 'SelectSQLOnlyVisible');

  SystemInformation.GetSQL('Accessories', {}, function (Results) 
  {
    ListaProvinceTmp = SystemInformation.FindResults(Results, 'ProvinceList');
    if(ListaProvinceTmp != undefined) 
    {
      for(let i = 0; i < ListaProvinceTmp.length; i++)
          ListaProvinceTmp[i] = {
                                  Chiave: ListaProvinceTmp[i].CHIAVE,
                                  Nome: ListaProvinceTmp[i].NOME
                                }
      $scope.ListaProvinceF = ListaProvinceTmp;
    }
    else SystemInformation.ApplyOnError('Modello province non conforme', '');

    ListaProvinceAllTmp = SystemInformation.FindResults(Results, 'ProvinceListAll');
    if(ListaProvinceAllTmp != undefined) 
    {
      for (let i = 0; i < ListaProvinceAllTmp.length; i++)
           ListaProvinceAllTmp[i] = {
                                      Chiave: ListaProvinceAllTmp[i].CHIAVE,
                                      Nome: ListaProvinceAllTmp[i].NOME
                                    }
      $scope.ListaProvinceAll = ListaProvinceAllTmp;
    }
    else SystemInformation.ApplyOnError('Modello province di italia non conforme', '');
  });

  SystemInformation.GetSQL('Book', {}, function (Results) 
  {
    TitoliInfoLista = SystemInformation.FindResults(Results, 'BookListNoFilter');
    if(TitoliInfoLista != undefined) 
    {
       for(let i = 0; i < TitoliInfoLista.length; i++)
           TitoliInfoLista[i] = {
                                  Chiave: TitoliInfoLista[i].CHIAVE,
                                  Nome: TitoliInfoLista[i].TITOLO,
                                  Codice: TitoliInfoLista[i].CODICE_ISBN
                                }
       $scope.ListaTitoliF = TitoliInfoLista;
       $scope.ListaTitoli = TitoliInfoLista;
    }
    else SystemInformation.ApplyOnError('Modello titoli non conforme', '');
  },'SelectSQLNoFilter');

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
    $scope.GridOptions.query.page = 1;
  }

  $scope.searchTextChangeTit = function(text)
  {
    if(!text)
       $scope.selectedItemChangeTitolo(undefined)
  }

  $scope.queryTitolo = function (searchTextTit) 
  {
    searchTextTit = searchTextTit.toUpperCase();
    return ($scope.ListaTitoli.grep(function (Elemento)
    {
      return (Elemento.Nome.toUpperCase().indexOf(searchTextTit) != -1 || Elemento.Codice.indexOf(searchTextTit) != -1);
    }));
  }

  $scope.selectedItemChangeTitolo = function (itemTit) 
  {
    if(itemTit != undefined)
       $scope.TitoloFiltro = itemTit.Chiave;
    else 
    {
      $scope.TitoloFiltro = -1;
      $scope.ListaIstituti = $scope.ListaIstitutiNoFilter;
    }
    $scope.RefreshListaDocenti();
  }

  $scope.searchTextChangeIst = function(text)
  {
    if(!text)
       $scope.selectedItemChangeIstituto(undefined)
  }

  $scope.queryIstituto = function (searchTextIstituto) 
  {
     searchTextIstituto = searchTextIstituto.toUpperCase();
     return ($scope.ListaIstituti.grep(function (Elemento) 
     {
        return (Elemento.Istituto.toUpperCase().indexOf(searchTextIstituto) != -1 || Elemento.Codice.indexOf(searchTextIstituto) != -1);
     }));
  }

  $scope.selectedItemChangeIstituto = function (itemIstituto) 
  {
    if(itemIstituto != undefined) 
    {
       $scope.IstitutoFiltrato = itemIstituto.Chiave;
       $scope.IstitutoFiltratoNome = itemIstituto.Istituto;
       $scope.OldIstitutoFiltro = itemIstituto.Chiave;
       $scope.OldIstitutoNome = itemIstituto.Istituto;
       $scope.CheckOldIstituto = true;
    }
    else $scope.IstitutoFiltrato = -1;
    $scope.RefreshListaDocenti();
  }

  $scope.VisualizzaAdozioni = function (ChiaveIstituto) 
  {
   $scope.thisIstituto = ChiaveIstituto;
   $scope.AnnoFiltro = -1;
   $scope.CombinazioneFiltro = -1;
   $scope.ListaCombinazioni = [];
   $scope.ListaAnni = [];

   SystemInformation.GetSQL('Institute', { CHIAVE: ChiaveIstituto }, function (Results) 
   {
     IstitutoListaAdozioni = SystemInformation.FindResults(Results, $scope.AdozioniGestite ? 'GetHandledAdoptionListInstitute' : 'GetAdoptionListInstitute');
     if (IstitutoListaAdozioni != undefined) 
     {
      $scope.IstitutoListaAdozioni = [];

      var ClassKey = -1;
      for(let i = 0; i < IstitutoListaAdozioni.length; i++) 
      {
         if(IstitutoListaAdozioni[i].CLASSE != ClassKey) 
         {
             $scope.IstitutoListaAdozioni.push({
                                                ClasseChiave: IstitutoListaAdozioni[i].CLASSE,
                                                AnnoClasse: IstitutoListaAdozioni[i].ANNO_CLASSE,
                                                SezioneClasse: IstitutoListaAdozioni[i].SEZIONE_CLASSE,
                                                NomeClasse: IstitutoListaAdozioni[i].ANNO_CLASSE + IstitutoListaAdozioni[i].SEZIONE_CLASSE,
                                                CombinazioneClasse: IstitutoListaAdozioni[i].COMBINAZIONE_CLASSE == null ? 'N.D' : IstitutoListaAdozioni[i].COMBINAZIONE_CLASSE,
                                                ListaTitoliClasse: []
                                               })

             var CombinazioneExist = $scope.ListaCombinazioni.findIndex(function (ACombinazione) { return (ACombinazione == IstitutoListaAdozioni[i].COMBINAZIONE_CLASSE); });
             if (CombinazioneExist == -1)
                 $scope.ListaCombinazioni.push(IstitutoListaAdozioni[i].COMBINAZIONE_CLASSE);

             var AnnoExist = $scope.ListaAnni.findIndex(function (AAnno) { return (AAnno == IstitutoListaAdozioni[i].ANNO_CLASSE); });
             if (AnnoExist == -1)
                 $scope.ListaAnni.push(IstitutoListaAdozioni[i].ANNO_CLASSE);
          }
          if($scope.AdozioniGestite ? (IstitutoListaAdozioni[i].EDITORE_GESTITO == undefined ? false : true) : true)
             $scope.IstitutoListaAdozioni[$scope.IstitutoListaAdozioni.length - 1].ListaTitoliClasse.push({
                                                                                                            Titolo: IstitutoListaAdozioni[i].NOME_TITOLO,
                                                                                                            Codice: IstitutoListaAdozioni[i].CODICE_TITOLO,
                                                                                                            Materia : IstitutoListaAdozioni[i].MATERIA_TITOLO,
                                                                                                            Editore: IstitutoListaAdozioni[i].EDITORE_TITOLO == undefined ? 'N.D.' : IstitutoListaAdozioni[i].EDITORE_TITOLO,
                                                                                                            Prezzo: (IstitutoListaAdozioni[i].PREZZO_TITOLO == '' || IstitutoListaAdozioni[i].PREZZO_TITOLO == null) ? 'N.D.' : IstitutoListaAdozioni[i].PREZZO_TITOLO + '€',
                                                                                                            //EditoreGestito: $scope.AdozioniGestite ? 'GESTITO' : (IstitutoListaAdozioni[i].CHIAVE_EDITORE == undefined ? 'NON GESTITO' : 'GESTITO'),
                                                                                                            IsGestito: (IstitutoListaAdozioni[i].EDITORE_GESTITO == undefined ? false : true)//$scope.AdozioniGestite ? true : (IstitutoListaAdozioni[i].EDITORE_GESTITO == undefined ? false : true)
                                                                                                           })
           ClassKey = IstitutoListaAdozioni[i].CLASSE;
        }

        $scope.ListaAnni.sort();
        $scope.ListaCombinazioni.sort();
        $scope.IstitutoListaAdozioni.sort((adozione_1, adozione_2) => {
        const compareCombinazione = adozione_1.CombinazioneClasse.localeCompare(adozione_2.CombinazioneClasse);
        const compareAnno = adozione_1.AnnoClasse.localeCompare(adozione_2.AnnoClasse);
        const compareSezione = adozione_1.SezioneClasse.localeCompare(adozione_2.SezioneClasse);

        return compareCombinazione || compareAnno || compareSezione;
      })

      $mdDialog.show({
                      controller: AdozioniIstitutoController,
                      templateUrl: "template/adoptionInstitutePopup.html",
                      //targetEvent         : null,
                      scope: $scope,
                      preserveScope: true,
                      clickOutsideToClose: true
                     })
                     .then(function (answer) { },
                           function () { });
     }
     else SystemInformation.ApplyOnError('Modello adozioni non conforme', '');
    }, $scope.AdozioniGestite ? 'SQLDettaglioAdozioniGestite' : 'SQLDettaglioAdozioni');
  }

  function AdozioniIstitutoController($scope, $mdDialog) 
  {
     $scope.ChiudiPopupAdozioni = function () 
     {
       $mdDialog.hide();
     }

     $scope.GetTitoliClasseIstituto = function (Classe) 
     {
      var Result = '';
      if (Classe.ListaTitoliClasse.length == 0) 
          Result = 'NESSUN TITOLO ADOTTATO'
      else 
      {
        for (let i = 0; i < Classe.ListaTitoliClasse.length; i++) 
        {
             if (Classe.ListaTitoliClasse[i].IsGestito)
                 Result += '<p style="Background-color:' + COLOR_ADOZIONI_GESTITE + ';">' + Classe.ListaTitoliClasse[i].Materia + ' - ' + Classe.ListaTitoliClasse[i].Codice + ' - ' + Classe.ListaTitoliClasse[i].Titolo + ' - ' + Classe.ListaTitoliClasse[i].Editore + ' - ' + Classe.ListaTitoliClasse[i].Prezzo + '</p>'
             else Result += '<p>' + Classe.ListaTitoliClasse[i].Materia + ' - ' + Classe.ListaTitoliClasse[i].Codice + ' - ' + Classe.ListaTitoliClasse[i].Titolo + ' - ' + Classe.ListaTitoliClasse[i].Editore + ' - ' + Classe.ListaTitoliClasse[i].Prezzo + '</p>'
        }
      }
      return ($sce.trustAsHtml(Result.substr(0, Result.length)));
     }
  }

  $scope.CreaPdfListaDocenti = function (ChiaveIstituto) 
  {
    var ListaDocenti = [];
    var ListaDisponibilita = [];
    var ModelloOrdinamento = 'SelectInstituteTeacherListOrdAlf'
    if (SystemInformation.UserInformation.OrdinamentoDoc === 'M')
     ModelloOrdinamento = 'SelectInstituteTeacherListOrderMat'
    else ModelloOrdinamento = 'SelectInstituteTeacherListOrderAlf';

    SystemInformation.GetSQL('Institute', { CHIAVE: ChiaveIstituto }, function (Results) 
    {
      var InfoIstituto = {};
      InfoIstitutoTmp = SystemInformation.FindResults(Results, 'InstituteInformationAll');
      ClassiIstituto = SystemInformation.FindResults(Results, 'AllClassiInstitute');
      ListaDocenti = SystemInformation.FindResults(Results, 'InstituteTeacherList');
      ContaClassi = SystemInformation.FindResults(Results, 'CountClassi');
      ListaDisponibilita = SystemInformation.FindResults(Results, 'InstituteTeacherAvailability');
      ListaClassiDocenti = SystemInformation.FindResults(Results, 'InstituteTeacherClasses');

     if(ListaDocenti != undefined && ListaDisponibilita != undefined && ClassiIstituto != undefined && InfoIstitutoTmp != undefined && ContaClassi != undefined && ListaClassiDocenti != undefined) 
     {
        InfoIstituto.Codice = InfoIstitutoTmp[0].CODICE == null ? '' : InfoIstitutoTmp[0].CODICE;
        InfoIstituto.Nome = InfoIstitutoTmp[0].NOME == null ? '' : InfoIstitutoTmp[0].NOME;
        InfoIstituto.Tipologia = InfoIstitutoTmp[0].NOME_TIPOLOGIA == null ? '' : InfoIstitutoTmp[0].NOME_TIPOLOGIA;
        InfoIstituto.Indirizzo = InfoIstitutoTmp[0].CODICE == null ? '' : InfoIstitutoTmp[0].INDIRIZZO;
        InfoIstituto.Comune = InfoIstitutoTmp[0].COMUNE == null ? '' : InfoIstitutoTmp[0].COMUNE;
        InfoIstituto.Provincia = InfoIstitutoTmp[0].NOME_PROVINCIA == null ? -1 : InfoIstitutoTmp[0].NOME_PROVINCIA;
        InfoIstituto.Cap = InfoIstitutoTmp[0].CAP == null ? '' : InfoIstitutoTmp[0].CAP;
        InfoIstituto.Email = InfoIstitutoTmp[0].EMAIL == null ? '' : InfoIstitutoTmp[0].EMAIL;
        InfoIstituto.Pec = InfoIstitutoTmp[0].PEC == null ? '' : InfoIstitutoTmp[0].PEC;
        InfoIstituto.SitoWeb = InfoIstitutoTmp[0].SITO_WEB == null ? '' : InfoIstitutoTmp[0].SITO_WEB;
        InfoIstituto.SedeSuccursale = InfoIstitutoTmp[0].SEDE == null ? 1 : InfoIstitutoTmp[0].SEDE;
        InfoIstituto.Referente_1 = InfoIstitutoTmp[0].REFERENTE_1 == null ? '' : InfoIstitutoTmp[0].REFERENTE_1;
        InfoIstituto.NumeroTelefono_1 = InfoIstitutoTmp[0].TELEFONO_1 == null ? '' : InfoIstitutoTmp[0].TELEFONO_1;
        InfoIstituto.Referente_2 = InfoIstitutoTmp[0].REFERENTE_2 == null ? '' : InfoIstitutoTmp[0].REFERENTE_2;
        InfoIstituto.NumeroTelefono_2 = InfoIstitutoTmp[0].TELEFONO_2 == null ? '' : InfoIstitutoTmp[0].TELEFONO_2;
        InfoIstituto.Referente_3 = InfoIstitutoTmp[0].REFERENTE_3 == null ? '' : InfoIstitutoTmp[0].REFERENTE_3;
        InfoIstituto.NumeroTelefono_3 = InfoIstitutoTmp[0].TELEFONO_3 == null ? '' : InfoIstitutoTmp[0].TELEFONO_3;
        InfoIstituto.PromotoreAssegnato = InfoIstitutoTmp[0].PROMOTORE == null ? -1 : InfoIstitutoTmp[0].PROMOTORE;
        InfoIstituto.Preside = InfoIstitutoTmp[0].PRESIDE == null ? '' : InfoIstitutoTmp[0].PRESIDE;
        InfoIstituto.Vicepreside = InfoIstitutoTmp[0].VICEPRESIDE == null ? '' : InfoIstitutoTmp[0].VICEPRESIDE;
        InfoIstituto.DirAmmnstr = InfoIstitutoTmp[0].DIR_AMMNSTR == null ? '' : InfoIstitutoTmp[0].DIR_AMMNSTR;

        var Data = new Date();
        var DataAnno = Data.getFullYear();
        var DataMese = Data.getMonth() + 1;
        var DataGiorno = Data.getDate();
        var DataDocumento = DataGiorno.toString() + '/' + DataMese.toString() + '/' + DataAnno.toString();
        var doc = new jsPDF();
        doc.setProperties({ title: 'FOGLIO SCUOLA ' + DataDocumento });

        var CoordY = 10;
        var CoordX = 5;
        doc.setFontSize(7);
        doc.text(CoordX, CoordY, 'ANNO ' + DataAnno + ' / ' + (DataAnno + 1));
        doc.text(CoordX + 30, CoordY, InfoIstituto.Nome);
        doc.text(CoordX, CoordY + 3, 'PAGINA43');
        doc.text(CoordX + 190, CoordY + 3, 'GENOVA');
        CoordX = 10;

        doc.rect(5, 15, 200, 275);

        doc.rect(155, 15, 50, 12);
        doc.rect(155, 15, 50, 22);

        doc.rect(5, 15, 200, 80);
        doc.rect(5, 15, 200, 60);
        doc.rect(5, 15, 200, 40);
        doc.rect(5, 15, 150, 40);
        doc.rect(5, 158, 130, 72);
        doc.rect(5, 158, 200, 72);
        doc.rect(5, 200, 130, 30);
        doc.rect(5, 185, 130, 15);
        doc.rect(5, 95, 200, 10);
        doc.rect(5, 95, 100, 10);
        doc.rect(5, 105, 200, 12);
        doc.rect(5, 105, 60, 12);
        doc.rect(5, 105, 100, 12);
        doc.rect(5, 105, 160, 12);

        doc.rect(5, 117, 80, 20);
        doc.rect(5, 117, 160, 20);
        doc.rect(5, 117, 200, 20);
        doc.rect(5, 117, 200, 10);

        doc.rect(5, 137, 200, 10);
        doc.rect(5, 137, 50, 10);
        doc.rect(5, 137, 100, 10);
        doc.rect(5, 137, 150, 10);
        doc.rect(5, 137, 50, 21);
        doc.rect(5, 137, 100, 21);

        doc.text(CoordX, CoordY + 12, 'Scuola');
        doc.text(CoordX + 147, CoordY + 12, 'Cod.Ministeriale');
        doc.text(CoordX + 172, CoordY + 12, 'Ist.Riferimento');
        doc.setFontType('bold');
        doc.text(CoordX + 147, CoordY + 15, InfoIstituto.Codice);
        doc.text(CoordX + 172, CoordY + 15, InfoIstituto.Codice);
        doc.setFontType('normal');
        doc.text(CoordX + 147, CoordY + 20, 'Partita IVA');
        doc.text(CoordX + 147, CoordY + 30, 'Raccolto da');
        doc.setFontSize(8);
        doc.setFontType('bold');
        doc.text(CoordX, CoordY + 15, InfoIstituto.Nome + '          ' + InfoIstituto.Tipologia);
        doc.setFontSize(7);
        doc.setFontType('normal');
        doc.text(CoordX, CoordY + 25, InfoIstituto.Indirizzo);
        doc.text(CoordX, CoordY + 28, InfoIstituto.Cap + ' ' + InfoIstituto.Comune + ' (' + InfoIstituto.Provincia + ')');
        doc.text(CoordX, CoordY + 38, 'Sede centrale');
        doc.text(CoordX, CoordY + 48, 'Dipendenze');
        doc.text(CoordX, CoordY + 68, 'Plessi');
        doc.text(CoordX, CoordY + 88, 'Indirizzo posta elettronica');
        doc.setFontType('bold');
        doc.text(CoordX, CoordY + 92, InfoIstituto.Email);
        doc.setFontType('normal');
        doc.text(CoordX + 100, CoordY + 88, 'Pagina Web');
        doc.setFontType('bold');
        doc.text(CoordX + 100, CoordY + 92, InfoIstituto.SitoWeb);
        doc.setFontType('normal');

        doc.text(CoordX, CoordY + 98, 'Tel.Istituto');
        doc.setFontType('bold');
        doc.text(CoordX, CoordY + 102, InfoIstituto.NumeroTelefono_1);
        doc.setFontType('normal');
        doc.text(CoordX + 60, CoordY + 98, 'Fax(uff.)');
        doc.setFontType('bold');
        doc.text(CoordX + 60, CoordY + 102, InfoIstituto.NumeroTelefono_2);
        doc.setFontType('normal');
        doc.text(CoordX + 100, CoordY + 98, 'Dirigente scolastico');
        doc.setFontType('bold');
        doc.text(CoordX + 100, CoordY + 102, InfoIstituto.NumeroTelefono_3);
        doc.setFontType('normal');
        doc.text(CoordX + 160, CoordY + 98, 'Segreteria');
        doc.setFontType('bold');
        doc.text(CoordX + 160, CoordY + 102, '');
        doc.setFontType('normal');

        doc.text(CoordX, CoordY + 110, 'Dirigente scolastico');
        doc.setFontType('bold');
        doc.text(CoordX, CoordY + 116, InfoIstituto.Preside);
        doc.setFontType('normal');
        doc.text(CoordX + 80, CoordY + 110, 'Segreteria');
        doc.setFontType('bold');
        doc.text(CoordX + 80, CoordY + 116, '');
        doc.setFontType('normal');
        doc.text(CoordX + 160, CoordY + 110, 'Dir.Amministrativo');
        doc.setFontType('bold');
        doc.text(CoordX + 160, CoordY + 116, InfoIstituto.DirAmmnstr);
        doc.setFontType('normal');

        doc.text(CoordX, CoordY + 120, 'Vice');
        doc.setFontType('bold');
        doc.text(CoordX, CoordY + 124, InfoIstituto.Vicepreside);
        doc.setFontType('normal');
        doc.text(CoordX + 80, CoordY + 120, 'Segreteria didattica');
        doc.setFontType('bold');
        doc.text(CoordX + 80, CoordY + 124, '');
        doc.setFontType('normal');
        doc.text(CoordX + 160, CoordY + 120, 'Resp.Bibilioteca');
        doc.setFontType('bold');
        doc.text(CoordX + 160, CoordY + 124, '');
        doc.setFontType('normal');

        doc.text(CoordX, CoordY + 130, 'Passaggio');
        doc.text(CoordX, CoordY + 134, '');
        doc.text(CoordX + 50, CoordY + 130, 'Giorno mercato');
        doc.text(CoordX + 50, CoordY + 134, '');
        doc.text(CoordX + 100, CoordY + 130, 'Seggio');
        doc.text(CoordX + 100, CoordY + 134, '');
        doc.text(CoordX + 150, CoordY + 130, 'Chiusure');
        doc.text(CoordX + 150, CoordY + 134, '');

        doc.text(CoordX, CoordY + 140, 'Festa patrono');
        doc.text(CoordX, CoordY + 144, '');
        doc.text(CoordX + 50, CoordY + 140, 'Limitazioni traffico');
        doc.text(CoordX + 50, CoordY + 144, '');
        doc.text(CoordX + 100, CoordY + 140, "Comodato d'uso");
        doc.text(CoordX + 100, CoordY + 144, '');

        CoordY += 4; //PIGRIZIA

        doc.text(CoordX, CoordY + 148, 'Sezioni');
        doc.setFontType('bold');
        doc.text(CoordX, CoordY + 152, '1 - ');
        doc.text(CoordX + 103, CoordY + 152, ContaClassi[0].PRIME_CLASSI.toString());
        doc.text(CoordX, CoordY + 156, '2 - ');
        doc.text(CoordX + 103, CoordY + 156, ContaClassi[0].SECONDE_CLASSI.toString());
        doc.text(CoordX, CoordY + 160, '3 - ');
        doc.text(CoordX + 103, CoordY + 160, ContaClassi[0].TERZE_CLASSI.toString());
        doc.text(CoordX, CoordY + 164, '4 - ');
        doc.text(CoordX + 103, CoordY + 164, ContaClassi[0].QUARTE_CLASSI.toString());
        doc.text(CoordX, CoordY + 168, '5 - ');
        doc.text(CoordX + 103, CoordY + 168, ContaClassi[0].QUINTE_CLASSI.toString());
        doc.setFontType('normal');

        doc.rect(190, 158, 15, 41); //ore
        doc.rect(190, 158, 15, 5);
        doc.rect(190, 158, 15, 9);
        doc.rect(190, 158, 15, 13);
        doc.rect(190, 158, 15, 17);
        doc.rect(190, 158, 15, 21);
        doc.rect(190, 158, 15, 25);
        doc.rect(190, 158, 15, 29);
        doc.rect(190, 158, 15, 33);
        doc.rect(190, 158, 15, 37);
        doc.rect(190, 158, 15, 41)

        doc.rect(160, 163.5, 15, 35);
        doc.rect(160, 163.5, 15, 3);
        doc.rect(160, 163.5, 15, 6);
        doc.rect(160, 163.5, 15, 9);
        doc.rect(160, 163.5, 15, 12);
        doc.rect(160, 163.5, 15, 15);
        doc.rect(160, 163.5, 15, 18);
        doc.rect(160, 163.5, 15, 21);
        doc.rect(160, 163.5, 15, 24);
        doc.rect(160, 163.5, 15, 27);
        doc.rect(160, 163.5, 15, 31);

        doc.rect(108, 158, 13, 27); //alunni

        doc.text(CoordX + 100, CoordY + 148, 'Classi');
        doc.text(CoordX + 114, CoordY + 148, 'Alunni');
        doc.text(CoordX + 130, CoordY + 148, 'Orario');
        doc.text(CoordX + 162.5, CoordY + 148, 'Inizio mattino');
        doc.text(CoordX + 170, CoordY + 152, '2° Ora');
        doc.text(CoordX + 170, CoordY + 156, '3° Ora');
        doc.text(CoordX + 170, CoordY + 160, '4° Ora');
        doc.text(CoordX + 170, CoordY + 164, '5° Ora');
        doc.text(CoordX + 170, CoordY + 168, '6° Ora');
        doc.text(CoordX + 170, CoordY + 172, '7° Ora');
        doc.text(CoordX + 170, CoordY + 176, '8° Ora');
        doc.text(CoordX + 170, CoordY + 180, '9° Ora');
        doc.text(CoordX + 168.5, CoordY + 184, '10° Ora');

        doc.text(CoordX + 130, CoordY + 152, 'Inizio preinterv.');
        doc.text(CoordX + 130, CoordY + 156, 'Fine preinterv.');
        doc.text(CoordX + 130, CoordY + 160, 'Inizio intervallo');
        doc.text(CoordX + 130, CoordY + 164, 'Fine intervallo');
        doc.text(CoordX + 130, CoordY + 168, 'Fine mattino');
        doc.text(CoordX + 130, CoordY + 172, 'Inizio mensa');
        doc.text(CoordX + 130, CoordY + 176, 'Fine mensa');
        doc.text(CoordX + 130, CoordY + 180, 'Inizio intervallo');
        doc.text(CoordX + 130, CoordY + 184, 'Fine intervallo');

        doc.text(CoordX, CoordY + 175, 'Totali');
        doc.setFontType('bold');
        doc.text(CoordX + 103, CoordY + 175, ClassiIstituto.length.toString());
        doc.setFontType('normal');

        doc.text(CoordX, CoordY + 190, 'Specializzazioni');
        doc.text(CoordX, CoordY + 220, 'Note');
        doc.text(CoordX + 150, CoordY + 220, 'Vacanze');

        doc.setFontSize(6);
        doc.setFontType('bold');
        doc.text(5, 295, SystemInformation.VDocListaDocIst);
        doc.text(CoordX + 185, 295, 'GENOVA');

      if(ListaDocenti.length != 0) 
      {
         ListaDocenti.forEach(function (Docente) { Docente.DISPONIBILITA = [], Docente.CLASSI = [] });

         for(let i = 0; i < ListaDocenti.length; i++) 
         {
            for(let j = 0; j < ListaDisponibilita.length; j++)
                if(ListaDisponibilita[j].DOCENTE == ListaDocenti[i].DOCENTE)
                   ListaDocenti[i].DISPONIBILITA.push(ListaDisponibilita[j]);

            for(let k = 0; k < ListaClassiDocenti.length; k++)
                if(ListaClassiDocenti[k].DOCENTE == ListaDocenti[i].DOCENTE)
                   ListaDocenti[i].CLASSI.push(ListaClassiDocenti[k].ANNO_CLASSE + ListaClassiDocenti[k].SEZIONE_CLASSE);
         }

         for(let i = 0; i < ListaDocenti.length; i++) 
         {
            ListaDocenti[i].DISPONIBILITA.SETTIMANA = [['-', '-', '-', '-', '-', '-', '-', '-', '-', '-'],
                                                       ['-', '-', '-', '-', '-', '-', '-', '-', '-', '-'],
                                                       ['-', '-', '-', '-', '-', '-', '-', '-', '-', '-'],
                                                       ['-', '-', '-', '-', '-', '-', '-', '-', '-', '-'],
                                                       ['-', '-', '-', '-', '-', '-', '-', '-', '-', '-'],
                                                       ['-', '-', '-', '-', '-', '-', '-', '-', '-', '-'],
                                                       ['-', '-', '-', '-', '-', '-', '-', '-', '-', '-']];

            if(ListaDocenti[i].DISPONIBILITA.length != 0) 
            {
               for(let j = 0; j < ListaDocenti[i].DISPONIBILITA.length; j++) 
               {
                   switch(ListaDocenti[i].DISPONIBILITA[j].LUOGO_NOME) 
                   {
                    case 'RICEVIMENTO' : ListaDocenti[i].DISPONIBILITA.SETTIMANA[parseInt(ListaDocenti[i].DISPONIBILITA[j].GIORNO)][parseInt(ListaDocenti[i].DISPONIBILITA[j].ORA)] = 'R';
                                         break;
                    case 'SUCCURSALE'  : ListaDocenti[i].DISPONIBILITA.SETTIMANA[parseInt(ListaDocenti[i].DISPONIBILITA[j].GIORNO)][parseInt(ListaDocenti[i].DISPONIBILITA[j].ORA)] = 'S';
                                         break;
                    case 'ORARIO'      : ListaDocenti[i].DISPONIBILITA.SETTIMANA[parseInt(ListaDocenti[i].DISPONIBILITA[j].GIORNO)][parseInt(ListaDocenti[i].DISPONIBILITA[j].ORA)] = (parseInt(ListaDocenti[i].DISPONIBILITA[j].ORA) + 1).toString();
                                         break;
                   }
               }
            }
         }
         doc.addPage();
         doc.setFontSize(8);
         var CoordY = 10;
         doc.setFontSize(6);
         doc.setFontType('bold');
         doc.text(5, 295, SystemInformation.VDocListaDocIst);

         for(let i = 0; i < ListaDocenti.length; i++) 
         {
            if(CoordY >= 275) 
            {
               doc.addPage();
               CoordY = 10;
               doc.setFontSize(6);
               doc.setFontType('bold');
               doc.text(10, 295, SystemInformation.VDocListaDocIst);
            }
            doc.setFontSize(8);
            doc.setFontType('bold');
          
            doc.rect(7, CoordY, 198, 33);
            doc.text(10, CoordY + 5, ListaDocenti[i].NOME_DOCENTE);
            doc.text(10, CoordY + 10, (ListaDocenti[i].NOME_MATERIA_1 == undefined ? '' : ListaDocenti[i].NOME_MATERIA_1) + ' - ' + (ListaDocenti[i].NOME_MATERIA_2 == undefined ? '' : ListaDocenti[i].NOME_MATERIA_2) + ' - ' + (ListaDocenti[i].NOME_MATERIA_3 == undefined ? '' : ListaDocenti[i].NOME_MATERIA_3));
            doc.text(10, CoordY + 15, ListaDocenti[i].CLASSI.toString());
            CoordY += 20;
            doc.setFontSize(7);
            doc.setFontType('italic');
            doc.text(10, CoordY, 'LUNEDI');
            doc.text(38, CoordY, 'MARTEDI')
            doc.text(63, CoordY, 'MERCOLEDI')
            doc.text(88, CoordY, 'GIOVEDI')
            doc.text(113, CoordY, 'VENERDI')
            doc.text(138, CoordY, 'SABATO')
            CoordY += 5;

            for(let j = 0; j < ListaDocenti[i].DISPONIBILITA.SETTIMANA.length; j++) 
            {
                ListaDocenti[i].DISPONIBILITA.SETTIMANA[j] = ListaDocenti[i].DISPONIBILITA.SETTIMANA[j].toString();
                ListaDocenti[i].DISPONIBILITA.SETTIMANA[j] = ListaDocenti[i].DISPONIBILITA.SETTIMANA[j].replace(/,/g, ' ')
            }
            doc.setFontSize(7);
            doc.text(10, CoordY, ListaDocenti[i].DISPONIBILITA.SETTIMANA[0]);
            doc.text(38, CoordY, ListaDocenti[i].DISPONIBILITA.SETTIMANA[1]);
            doc.text(63, CoordY, ListaDocenti[i].DISPONIBILITA.SETTIMANA[2]);
            doc.text(88, CoordY, ListaDocenti[i].DISPONIBILITA.SETTIMANA[3]);
            doc.text(113, CoordY, ListaDocenti[i].DISPONIBILITA.SETTIMANA[4]);
            doc.text(138, CoordY, ListaDocenti[i].DISPONIBILITA.SETTIMANA[5]);
            CoordY += 10;
         }
      }
      doc.save('FOGLIO SCUOLA ' + DataDocumento + '.pdf', {});
     }
     else SystemInformation.ApplyOnError('Modello docenti e disponibilita per istituto non conforme', '');
    }, ModelloOrdinamento)
  }

  $scope.GetMaterieDoc = function (Docente) 
  {
    var Result = '';
    if(Docente.DescrMateria1 == '' && Docente.DescrMateria2 == '' && Docente.DescrMateria3 == '') Result = 'NESSUNA MATERIA';
    else
    {
      if(Docente.DescrMateria1 != '')
         Result += Docente.DescrMateria1 + '</br>';
      if(Docente.DescrMateria2 != '')
         Result += Docente.DescrMateria2 + '</br>'
      if(Docente.DescrMateria3 != '')
         Result += Docente.DescrMateria3
    }
    return ($sce.trustAsHtml(Result.substr(0, Result.length)));
  }

  $scope.RefreshListaDocenti = function () 
  {
    $scope.GridOptions.query.page = 1;
    var RicercaPerTitolo = false;
    var ObjParametri = {};

    if($scope.AProvinciaFiltro != -1)
       ObjParametri.FiltroP = $scope.AProvinciaFiltro;
    if($scope.IstitutoFiltrato != -1) 
    {
      ObjParametri.FiltroI = $scope.IstitutoFiltrato;
      $scope.RicercaPerIstituto = true;
      $scope.IstitutoMultipla = $scope.IstitutoFiltrato;
    }

    if($scope.TitoloFiltro != -1) 
    {
      ObjParametri.FiltroT = $scope.TitoloFiltro;
      RicercaPerTitolo = true;
    }
    else $scope.ListaIstitutiTitolo = [];

   SystemInformation.GetSQL('Teacher', ObjParametri, function (Results) 
   {
     DocentiInfoLista = SystemInformation.FindResults(Results, 'TeacherInfoList');
     if(DocentiInfoLista != undefined) 
     {
        for(let i = 0; i < DocentiInfoLista.length; i++) 
        {
            var AggiungiDoc = true;
            if(!$scope.IsAdministrator()) 
               if(DocentiInfoLista[i].NASCOSTO == 'T')
                  AggiungiDoc = false;
            if(AggiungiDoc) 
            {
             DocentiInfoLista[i] = {
                                     Chiave: DocentiInfoLista[i].CHIAVE,
                                     Nascosto: DocentiInfoLista[i].NASCOSTO,
                                     RagioneSociale: DocentiInfoLista[i].RAGIONE_SOCIALE,
                                     Materia1: DocentiInfoLista[i].MATERIA_1 == null ? -1 : DocentiInfoLista[i].MATERIA_1,
                                     DescrMateria1: DocentiInfoLista[i].NOME_MATERIA1 == null ? '' : DocentiInfoLista[i].NOME_MATERIA1,
                                     Materia2: DocentiInfoLista[i].MATERIA_2 == null ? -1 : DocentiInfoLista[i].MATERIA_2,
                                     DescrMateria2: DocentiInfoLista[i].NOME_MATERIA2 == null ? '' : DocentiInfoLista[i].NOME_MATERIA2,
                                     Materia3: DocentiInfoLista[i].MATERIA_3 == null ? -1 : DocentiInfoLista[i].MATERIA_3,
                                     DescrMateria3: DocentiInfoLista[i].NOME_MATERIA3 == null ? '' : DocentiInfoLista[i].NOME_MATERIA3,
                                     Titolo: DocentiInfoLista[i].TITOLO == null ? '' : DocentiInfoLista[i].TITOLO,
                                     Indirizzo: DocentiInfoLista[i].INDIRIZZO == null ? '' : DocentiInfoLista[i].INDIRIZZO,
                                     Comune: DocentiInfoLista[i].COMUNE == null ? '' : DocentiInfoLista[i].COMUNE,
                                     Cap: DocentiInfoLista[i].CAP == null ? '' : DocentiInfoLista[i].CAP,
                                     Provincia: DocentiInfoLista[i].PROVINCIA == null ? 0 : DocentiInfoLista[i].PROVINCIA,
                                     ProvinciaNome: DocentiInfoLista[i].PROVINCIA_NOME == null ? '' : DocentiInfoLista[i].PROVINCIA_NOME,
                                     Email: DocentiInfoLista[i].EMAIL == undefined ? 'Non disponibile' : (DocentiInfoLista[i].EMAIL.includes('@') ? DocentiInfoLista[i].EMAIL : 'Non disponibile'),
                                     CoordMateria_1: DocentiInfoLista[i].COORD_MATERIA_1 == undefined ? -1 : DocentiInfoLista[i].COORD_MATERIA_1,
                                     CoordMateria_2: DocentiInfoLista[i].COORD_MATERIA_2 == undefined ? -1 : DocentiInfoLista[i].COORD_MATERIA_2,
                                     CoordMateria_3: DocentiInfoLista[i].COORD_MATERIA_3 == undefined ? -1 : DocentiInfoLista[i].COORD_MATERIA_3,
                                     SpedizioniTotali: parseInt(DocentiInfoLista[i].NR_SPED_TOT),
                                     SpedizioniThisAnno: parseInt(DocentiInfoLista[i].NR_SPED_LAST_ANNO)
                                   };
          }
          else 
          {
            DocentiInfoLista.splice(i, 1);
            i--;
          }
       }
       $scope.ListaDocenti = DocentiInfoLista;

       if(RicercaPerTitolo) 
       {
          var ListaIstitutiTitoloTmp = [];
          SystemInformation.GetSQL('Book', { FiltroT: ObjParametri.FiltroT }, function (Results) 
          {
            ListaIstitutiTitoloTmp = SystemInformation.FindResults(Results, 'InstituteForBook');
            if(ListaIstitutiTitoloTmp != undefined) 
            {
               for(let i = 0; i < ListaIstitutiTitoloTmp.length; i++) 
               {
                   ListaIstitutiTitoloTmp[i] = {
                                                 Chiave: ListaIstitutiTitoloTmp[i].CHIAVE,
                                                 Codice : ListaIstitutiTitoloTmp[i].CODICE,
                                                 Istituto: ListaIstitutiTitoloTmp[i] == null ? 'N.D.' : ListaIstitutiTitoloTmp[i].NOME.toUpperCase()
                                               }
               }
               $scope.ListaIstituti = ListaIstitutiTitoloTmp;
            }
            else SystemInformation.ApplyOnError('Modello istituti per titolo filtrato non conforme', '')
          },'SelectInstituteList')
       }

       if(SystemInformation.DataBetweenController.Provenienza == 'MailPage' && SystemInformation.DataBetweenController.OldPaginaDocenti != 0) 
       {
          $scope.GridOptions.query.page = SystemInformation.DataBetweenController.OldPaginaDocenti;
          SystemInformation.DataBetweenController = {};
       }
     }
    else SystemInformation.ApplyOnError('Modello docente non conforme', '');
   });

  }

  $scope.NascondiDocente = function (Docente) 
  {
    var NascondiDoc = function () 
    {
       $ObjQuery = { Operazioni: [] };
       $ObjQuery.Operazioni.push({
       Query: "HideTeacher",
       Parametri: {
                    DOCENTE: Docente.Chiave
                  }
      })
      SystemInformation.PostSQL('Teacher', $ObjQuery, function (Answer) 
      {
        $ObjQuery = {};
        $scope.RefreshListaDocenti();
      });
    }
    ZConfirm.GetConfirmBox('AVVISO', "Nascondere il docente " + Docente.RagioneSociale + " ?", NascondiDoc, function () { });
  }

  $scope.RendiVisibileDocente = function (Docente) 
  {
    var VisualizzaDoc = function () 
    {
      $ObjQuery = { Operazioni: [] };
      $ObjQuery.Operazioni.push({
                                  Query: "ShowTeacher",
                                  Parametri: { DOCENTE: Docente.Chiave }
                                })
      SystemInformation.PostSQL('Teacher', $ObjQuery, function (Answer) 
      {
        $ObjQuery = {};
        $scope.RefreshListaDocenti();
      });
    }
    ZConfirm.GetConfirmBox('AVVISO', "Rendere visibile il docente " + Docente.RagioneSociale + " ?", VisualizzaDoc, function () { });
  }

  $scope.InvioMail = function (Docente) 
  {
     SystemInformation.DataBetweenController.DocMail = Docente.Email;
     $scope.MailOn = true;
     $scope.InizializzaMailPage();
  }

  $scope.InvioMultiploMail = function (Nome) 
  {
     var ListaMailFiltrata   = $filter('DocenteByFiltro')($scope.ListaDocenti, Nome, $scope.MateriaFiltro, $scope.CoordMateriaFiltro);
     SystemInformation.DataBetweenController = { ListaDocMail: [] };

     for(let i = 0; i < ListaMailFiltrata.length; i ++)
         if(ListaMailFiltrata[i].Email != 'Non disponibile')
            SystemInformation.DataBetweenController.ListaDocMail.push({ Chiave: ListaMailFiltrata[i].Chiave, Email: ListaMailFiltrata[i].Email, RagioneSociale: ListaMailFiltrata[i].RagioneSociale });

     SystemInformation.DataBetweenController.MailMultipla = true;
     $scope.MailOn = true;
     $scope.InizializzaMailPage();
  }

  $scope.NuovaSpedizioneMultipla = function (Nome) 
  {
    var ListaFiltrata = $filter('DocenteByFiltro')($scope.ListaDocenti, Nome, $scope.MateriaFiltro, $scope.CoordMateriaFiltro);
    SystemInformation.DataBetweenController = { ListaDocSped: [] };
    SystemInformation.DataBetweenController.Provenienza = 'TeacherPage';
    SystemInformation.DataBetweenController.MateriaFiltro = $scope.MateriaFiltro;
    SystemInformation.DataBetweenController.MateriaFiltroNome = $scope.searchTextMat;
    SystemInformation.DataBetweenController.IstitutoFiltrato = $scope.IstitutoFiltrato;
    SystemInformation.DataBetweenController.IstitutoFiltratoNome = $scope.searchTextIstituto;

    if(ListaFiltrata.length == 0) 
    {
      ZCustomAlert($mdDialog, 'ATTENZIONE', "NESSUN DOCENTE SELEZIONATO PER LA SPEDIZIONE")
      return
    }


    for(let i = 0; i < ListaFiltrata.length; i++) 
    {
       var Docente = {
                       "ChiaveDocente": ListaFiltrata[i].Chiave,
                       "NomeDocente": ListaFiltrata[i].RagioneSociale,
                       "TitoloDocente": ListaFiltrata[i].Titolo,
                       "IndirizzoDocente": ListaFiltrata[i].Indirizzo,
                       "ComuneDocente": ListaFiltrata[i].Comune,
                       "CapDocente": ListaFiltrata[i].Cap,
                       "ProvinciaDocente": ListaFiltrata[i].Provincia,
                       "ProvinciaDocenteNome": ListaFiltrata[i].ProvinciaNome
                      }
     SystemInformation.DataBetweenController.ListaDocSped.push(Docente);
    }

    SystemInformation.DataBetweenController.IstitutoPerIndirizzo = $scope.IstitutoMultipla;
    SystemInformation.DataBetweenController.SpedizioneMultipla = true;
    SystemInformation.DataBetweenController.Provenienza = 'TeacherPage';
    $scope.RicercaPerIstituto = false;
    $state.go("deliveryModDetailPage");
  }

  $scope.GetOrariSelected = function (Istituto) 
  {
    if($scope.DocenteInEditing.ListaIstitutiDoc != undefined)
       for(let i = 0; i < $scope.DocenteInEditing.ListaIstitutiDoc.length; i++)
           if($scope.DocenteInEditing.ListaIstitutiDoc[i].CHIAVE == Istituto)
              return ($scope.DocenteInEditing.ListaIstitutiDoc[i].Orari);
    return ([]);
  }

  $scope.ImpostaDisponibilita = function (Istituto) 
  {
    if($scope.DocenteInEditing.ListaIstitutiDoc != undefined)
       for(let i = 0; i < $scope.DocenteInEditing.ListaIstitutiDoc.length; i++)
           if($scope.DocenteInEditing.ListaIstitutiDoc[i].CHIAVE == Istituto) 
           {
             $scope.DisponibilitaInEditing = $scope.DocenteInEditing.ListaIstitutiDoc[i].Disponibilita;
             $scope.GiornoTabella = 0;
             break;
           }
  }

  $scope.ModificaDocente = function (docente) 
  {
    $scope.OldPagina = $scope.GridOptions.query.page;
    $scope.ProvinciaOldFiltro = $scope.AProvinciaFiltro;
    $scope.NomeOldFiltro = $scope.ANomeFiltro;
    $scope.EditingOn = true;
    $scope.DocenteInEditing = {};
    $scope.DocenteInEditing.ListaIstitutiDocEliminati = [];
    $scope.DocenteInEditing.ListaOrariEliminati = [];
    $scope.ListaMaterieDoc = [];
    $scope.IstitutoVisualizzato = -1;

    SystemInformation.GetSQL('Teacher', { CHIAVE: docente.Chiave }, function (Results) 
    {
      DocenteDettaglio = SystemInformation.FindResults(Results, 'TeacherDettaglio');
      Istituti = SystemInformation.FindResults(Results, 'TeacherInstitute');
      OrariAll = SystemInformation.FindResults(Results, 'TeacherLesson');
      DisponibilitaAll = SystemInformation.FindResults(Results, 'TeacherAvailability');

      if(DocenteDettaglio != undefined && Istituti != undefined && OrariAll != undefined && DisponibilitaAll != undefined) 
      {
         DocenteDettaglio[0].COORD_MATERIA_1 == undefined ? "-2" : DocenteDettaglio[0].COORD_MATERIA_1;
         DocenteDettaglio[0].COORD_MATERIA_2 == undefined ? "-2" : DocenteDettaglio[0].COORD_MATERIA_2;
         DocenteDettaglio[0].COORD_MATERIA_3 == undefined ? "-2" : DocenteDettaglio[0].COORD_MATERIA_3;

         $scope.DocenteInEditing.Chiave = DocenteDettaglio[0].CHIAVE;
         $scope.DocenteInEditing.RagioneSociale = DocenteDettaglio[0].RAGIONE_SOCIALE;
         $scope.DocenteInEditing.Titolo = DocenteDettaglio[0].TITOLO;
         $scope.DocenteInEditing.NumeroTelefono_1 = DocenteDettaglio[0].TEL_PRIMO;
         $scope.DocenteInEditing.NumeroTelefono_2 = DocenteDettaglio[0].TEL_SECONDO;
         $scope.DocenteInEditing.NumeroTelefono_3 = DocenteDettaglio[0].TEL_TERZO;
         $scope.DocenteInEditing.Email = DocenteDettaglio[0].EMAIL;
         $scope.DocenteInEditing.EmailSecondaria = DocenteDettaglio[0].EMAIL_2;
         $scope.DocenteInEditing.Materia_1 = DocenteDettaglio[0].MATERIA_1 == undefined ? -1 : DocenteDettaglio[0].MATERIA_1;
         $scope.DocenteInEditing.Materia_2 = DocenteDettaglio[0].MATERIA_2 == undefined ? -1 : DocenteDettaglio[0].MATERIA_2;
         $scope.DocenteInEditing.Materia_3 = DocenteDettaglio[0].MATERIA_3 == undefined ? -1 : DocenteDettaglio[0].MATERIA_3;
         $scope.DocenteInEditing.CoordMateria_1 = (DocenteDettaglio[0].COORD_MATERIA_1 != undefined && DocenteDettaglio[0].COORD_MATERIA_1 == DocenteDettaglio[0].MATERIA_1) ? true : false;
         $scope.DocenteInEditing.CoordMateria_2 = (DocenteDettaglio[0].COORD_MATERIA_2 != undefined && DocenteDettaglio[0].COORD_MATERIA_2 == DocenteDettaglio[0].MATERIA_2) ? true : false;
         $scope.DocenteInEditing.CoordMateria_3 = (DocenteDettaglio[0].COORD_MATERIA_3 != undefined && DocenteDettaglio[0].COORD_MATERIA_3 == DocenteDettaglio[0].MATERIA_3) ? true : false;
         $scope.DocenteInEditing.Piattaforma = DocenteDettaglio[0].PIATTAFORMA;
         $scope.DocenteInEditing.Piattaforma_2 = DocenteDettaglio[0].PIATTAFORMA_2;
         $scope.DocenteInEditing.Indirizzo = DocenteDettaglio[0].INDIRIZZO;
         $scope.DocenteInEditing.Comune = DocenteDettaglio[0].COMUNE;
         $scope.DocenteInEditing.Cap = DocenteDettaglio[0].CAP;
         $scope.DocenteInEditing.Provincia = DocenteDettaglio[0].PROVINCIA == undefined ? -1 : DocenteDettaglio[0].PROVINCIA;
         $scope.DocenteInEditing.Note = DocenteDettaglio[0].NOTE;
         $scope.DocenteInEditing.ListaIstitutiDoc = Istituti;
         $scope.DocenteInEditing.ListaIstitutiDoc.forEach(function (Istituto) { Istituto.Orari = [], Istituto.Disponibilita = GetArrayDisponibilitaVuoto() });

         for(let i = 0; i < $scope.DocenteInEditing.ListaIstitutiDoc.length; i++) 
         {
            $scope.DocenteInEditing.ListaIstitutiDoc[i].PROVINCIA_LISTA_ALL == undefined ? -1 : $scope.DocenteInEditing.ListaIstitutiDoc[i].PROVINCIA_LISTA_ALL;
            for(let j = 0; j < OrariAll.length; j++) 
            {
               if(OrariAll[j].ISTITUTO == $scope.DocenteInEditing.ListaIstitutiDoc[i].CHIAVE)
                  $scope.DocenteInEditing.ListaIstitutiDoc[i].Orari.push(OrariAll[j]);
            }
            for(let k = 0; k < DisponibilitaAll.length; k++) 
            {
               if(DisponibilitaAll[k].ISTITUTO == $scope.DocenteInEditing.ListaIstitutiDoc[i].CHIAVE) 
               {
                 $scope.DocenteInEditing.ListaIstitutiDoc[i].Disponibilita[DisponibilitaAll[k].GIORNO];
                 var TipoOrarioIndex = $scope.DocenteInEditing.ListaIstitutiDoc[i].Disponibilita[DisponibilitaAll[k].GIORNO].findIndex(function (AOrario) { return (AOrario.ChiaveTipologia == DisponibilitaAll[k].LUOGO); });
                 if(TipoOrarioIndex != -1) 
                 {
                    $scope.DocenteInEditing.ListaIstitutiDoc[i].Disponibilita[parseInt(DisponibilitaAll[k].GIORNO)][TipoOrarioIndex].Orari[parseInt(DisponibilitaAll[k].ORA)].Checked = true;
                    $scope.DocenteInEditing.ListaIstitutiDoc[i].Disponibilita[parseInt(DisponibilitaAll[k].GIORNO)][TipoOrarioIndex].Orari[parseInt(DisponibilitaAll[k].ORA)].Nuovo = false;
                 }
               }
            }
         }
         if($scope.DocenteInEditing.ListaIstitutiDoc.length != 0)
            $scope.DisponibilitaInEditing = $scope.DocenteInEditing.ListaIstitutiDoc[0].Disponibilita;

         $scope.GiornoTabella = 0;

         if(DocenteDettaglio[0].MATERIA_1 != undefined) 
         {
            let Materia = { "Chiave": DocenteDettaglio[0].MATERIA_1, "MateriaNome": DocenteDettaglio[0].NOME_MATERIA1 }
            $scope.ListaMaterieDoc.push(Materia);
         }
         if(DocenteDettaglio[0].MATERIA_2 != undefined) 
         {
            let Materia = { "Chiave": DocenteDettaglio[0].MATERIA_2, "MateriaNome": DocenteDettaglio[0].NOME_MATERIA2 }
            $scope.ListaMaterieDoc.push(Materia);
         }
         if(DocenteDettaglio[0].MATERIA_3 != undefined) 
         {
            let Materia = { "Chiave": DocenteDettaglio[0].MATERIA_3, "MateriaNome": DocenteDettaglio[0].NOME_MATERIA3 }
            $scope.ListaMaterieDoc.push(Materia);
         }

         for(let i = 0; i < $scope.DocenteInEditing.ListaIstitutiDoc.length; i++)
             for(let j = 0; j < $scope.DocenteInEditing.ListaIstitutiDoc[i].Orari.length; j++) 
             {
                 $scope.DocenteInEditing.ListaIstitutiDoc[i].Orari[j].Nuovo = false;
                 $scope.DocenteInEditing.ListaIstitutiDoc[i].Orari[j].Modificato = false;
                 $scope.DocenteInEditing.ListaIstitutiDoc[i].Orari[j].Eliminato = false;

                 MateriaCorrispondente = $scope.ListaMaterieDoc.find(function (AMateria) { return (AMateria.Chiave == $scope.DocenteInEditing.ListaIstitutiDoc[i].Orari[j].MATERIA); });
                 $scope.DocenteInEditing.ListaIstitutiDoc[i].Orari[j].MateriaNome = MateriaCorrispondente.MateriaNome;

                 $scope.DocenteInEditing.ListaIstitutiDoc[i].Orari[j].ClasseNome = $scope.DocenteInEditing.ListaIstitutiDoc[i].Orari[j].ANNO + $scope.DocenteInEditing.ListaIstitutiDoc[i].Orari[j].SEZIONE + ' - ' + $scope.DocenteInEditing.ListaIstitutiDoc[i].Orari[j].COMBINAZIONE;
             }

         if ($scope.DocenteInEditing.ListaIstitutiDoc.length > 0)
          $scope.IstitutoVisualizzato = $scope.DocenteInEditing.ListaIstitutiDoc[0].CHIAVE
      }
      else SystemInformation.ApplyOnError('Modello docente non conforme', '');
    }, 'SQLDettaglio');
  }

  var GetArrayDisponibilitaVuoto = function () 
  {
    var Result = [[], [], [], [], [], [], []];
    for(let i = 0; i < Result.length; i++) 
    {
     for(let j = 0; j < $scope.ListaOrariTabella.length; j++)
         Result[i].push({
                         Giorno: i,
                         ChiaveTipologia: $scope.ListaOrariTabella[j].Chiave,
                         Descrizione: $scope.ListaOrariTabella[j].Descrizione,
                         Orari: [{ Nuovo: false, Eliminato: false, Checked: false }, { Nuovo: false, Eliminato: false, Checked: false }, { Nuovo: false, Eliminato: false, Checked: false },
                                 { Nuovo: false, Eliminato: false, Checked: false }, { Nuovo: false, Eliminato: false, Checked: false }, { Nuovo: false, Eliminato: false, Checked: false },
                                 { Nuovo: false, Eliminato: false, Checked: false }, { Nuovo: false, Eliminato: false, Checked: false }, { Nuovo: false, Eliminato: false, Checked: false }, { Nuovo: false, Eliminato: false, Checked: false }]
                        });
    }
    return Result;
  }

  $scope.ModificaDisponibilita = function (Disponibilita) 
  {
   if(Disponibilita.Checked) 
   {
      if(!Disponibilita.Nuovo)
         Disponibilita.Nuovo = true
   }
   else 
   {
      if(!Disponibilita.Nuovo)
        Disponibilita.Eliminato = true;
   }
  }

  $scope.NuovoDocente = function () 
  {
    $scope.ProvinciaOldFiltro = $scope.AProvinciaFiltro;
    $scope.EditingOn = true;
    $scope.searchTextDoc = '';

    $scope.DocenteInEditing = 
    {
      Chiave: -1,
      RagioneSociale: '',
      Titolo: 'Egr.Prof.',
      NumeroTelefono_1: '',
      NumeroTelefono_2: '',
      NumeroTelefono_3: '',
      Email: '',
      EmailSecondaria: '',
      Materia_1: -1,
      Materia_2: -1,
      Materia_3: -1,
      CoordMateria_1: false,
      CoordMateria_2: false,
      CoordMateria_3: false,
      Piattaforma: 'N',
      Piattaforma_2: 'N',
      Indirizzo: '',
      Comune: '',
      Cap: '',
      Provincia: -1,
      Note: '',
      ListaIstitutiDoc: []
    };
    $scope.DisponibilitaInEditing = GetArrayDisponibilitaVuoto();

    SystemInformation.GetSQL('Teacher', {}, function (Results) 
    {
     $scope.ListaDocToTransfer = [];
     ListaDocentiForTransfer = SystemInformation.FindResults(Results, 'TeacherSmallList');
     ListaIstitutiForTransfer = SystemInformation.FindResults(Results, 'TeacherForInstitute');
     if(ListaDocentiForTransfer != undefined && ListaIstitutiForTransfer != undefined) 
     {
        for(let i = 0; i < ListaDocentiForTransfer.length; i++) 
        {
           ListaDocentiForTransfer[i] = { ChiaveDoc: ListaDocentiForTransfer[i].CHIAVE, NomeDoc: ListaDocentiForTransfer[i].RAGIONE_SOCIALE, ListaIstDoc: [], ListaIstDocChiavi: [] }
           for(let j = 0; j < ListaIstitutiForTransfer.length; j++)
               if(ListaIstitutiForTransfer[j].DOCENTE == ListaDocentiForTransfer[i].ChiaveDoc) 
               {
                  ListaDocentiForTransfer[i].ListaIstDoc.push(ListaIstitutiForTransfer[j].NOME_ISTITUTO);
                  ListaDocentiForTransfer[i].ListaIstDocChiavi.push(ListaIstitutiForTransfer[j].ISTITUTO);
               }
           $scope.ListaDocToTransfer.push(ListaDocentiForTransfer[i])
        }

        if($scope.IstitutoFiltrato != -1)
           $scope.ConfermaPopup($scope.IstitutoFiltrato)

        $scope.queryDoc = function (searchTextDoc) 
        {
          $scope.DocenteInEditing.RagioneSociale = searchTextDoc;
          searchTextDoc = searchTextDoc.toUpperCase();
          return ($scope.ListaDocToTransfer.grep(function (Elemento) 
          {
            return (Elemento.NomeDoc.toUpperCase().startsWith(searchTextDoc))
          }));
        }

        $scope.selectedItemChangeDoc = function (itemDoc) 
        {
          if(itemDoc != undefined) 
          {
            if($scope.OldIstitutoFiltro != -1) 
            {
              var AssociaAnotherDoc = function () 
              {
                var GiaAssociato = false;
                for(let i = 0; i < itemDoc.ListaIstDocChiavi.length; i++) 
                {
                 if(itemDoc.ListaIstDocChiavi[i] == $scope.OldIstitutoFiltro) 
                 {
                   GiaAssociato = true;
                   ZCustomAlert($mdDialog, 'ATTENZIONE!', "DOCENTE GIA' ASSOCIATO ALL'INDIRIZZO SELEZIONATO!")
                 }
                }

                if(!GiaAssociato) 
                {
                  $ObjQuery = { Operazioni: [] };
                  $ObjQuery.Operazioni.push({
                                              Query: "InsertInstituteTeacher",
                                              Parametri: {
                                                           DOCENTE: itemDoc.ChiaveDoc,
                                                           ISTITUTO: $scope.OldIstitutoFiltro
                                                         }
                                             })
                  SystemInformation.PostSQL('Teacher', $ObjQuery, function (Answer) 
                                           {
                                            ZCustomAlert($mdDialog, 'OK', "DOCENTE ASSOCIATO CORRETTAMENTE ALL'ISTITUTO DESIDERATO")
                                            $ObjQuery = {};
                                            $scope.selectedItemDoc = undefined;
                                            $scope.searchTextDoc = '';
                                            $scope.DocenteInEditing.RagioneSociale = '';
                                            $scope.OnAnnullaDocenteClicked();
                                           })
                }
              }

              var NonAssociarlo = function () 
              {
                $scope.DocenteInEditing.RagioneSociale = itemDoc.NomeDoc
              }
              ZConfirm.GetConfirmBox('AVVISO', "QUESTO DOCENTE E' ASSEGNATO AI SEGUENTI ISTITUTI: " + itemDoc.ListaIstDoc.toString() + ".\nVUOI ASSEGNARLO ALL'ISTITUTO >> " + $scope.OldIstitutoNome + " << ?", AssociaAnotherDoc, NonAssociarlo);
              $scope.DocenteInEditing.RagioneSociale = '';
            }
          }
        }
     }
     else SystemInformation.ApplyOnError('Modello docenti e relativi istituti non conforme')
    }, 'SelectTeacherTransfer')
  }

  $scope.OnAnnullaDocenteClicked = function () 
  {
    $scope.AProvinciaFiltro = $scope.ProvinciaOldFiltro; //??
    $scope.EditingOn = false;
    $scope.RefreshListaDocenti();
    $scope.GridOptions.query.page = $scope.OldPagina;
  }

  $scope.SetAsIndirizzoDocente = function (ChiaveIst) 
  {
    DatiIstituto = $scope.DocenteInEditing.ListaIstitutiDoc.find(function (AIstituto) { return (AIstituto.CHIAVE == ChiaveIst); });
    var ImpostaIndirizzo = function () 
    {
       if(DatiIstituto.INDIRIZZO == '' || DatiIstituto.COMUNE == '' || DatiIstituto.CAP == '' || DatiIstituto.PROVINCIA_LISTA_ALL == -1 || DatiIstituto.PROVINCIA_LISTA_ALL == undefined) 
       {
          StringaDatiMancanti = '';

          if(DatiIstituto.INDIRIZZO == '')
             StringaDatiMancanti += 'INDIRIZZO,'
          if(DatiIstituto.COMUNE == '')
             StringaDatiMancanti += 'COMUNE,'
          if(DatiIstituto.CAP == '')
             StringaDatiMancanti += 'CAP,'
          if(DatiIstituto.PROVINCIA_LISTA_ALL == -1 || DatiIstituto.PROVINCIA_LISTA_ALL == undefined)
             StringaDatiMancanti += 'PROVINCIA,'

          StringaDatiMancanti = StringaDatiMancanti.substring(0, StringaDatiMancanti.length - 1);

          if (StringaDatiMancanti != '') 
          {
            ZCustomAlert($mdDialog, 'ATTENZIONE', 'DATI ISTITUTO MANCANTI (' + StringaDatiMancanti + ') IMPOSSIBILE IMPOSTARE COME INDIRIZZO PREDEFINITO DEL DOCENTE!');
            return
          }
          else ZCustomAlert($mdDialog, 'OK', "INDIRIZZO DELL'ISTITUTO IMPOSTATO COME PREDEFINITO")
      }
      else 
      {
          $scope.DocenteInEditing.Indirizzo = DatiIstituto.INDIRIZZO;
          $scope.DocenteInEditing.Comune = DatiIstituto.COMUNE;
          $scope.DocenteInEditing.Cap = DatiIstituto.CAP;
          $scope.DocenteInEditing.Provincia = DatiIstituto.PROVINCIA_LISTA_ALL;
          DatiIstituto = {};
      }
    }
    ZConfirm.GetConfirmBox('AVVISO', "Impostare l'indirizzo dell'istituto " + DatiIstituto.ISTITUTO + " come indirizzo del docente?", ImpostaIndirizzo, function () { });
  }

  $scope.ConfermaDocente = function () 
  {
   if($scope.DocenteInEditing.RagioneSociale == '') 
   {
     alert('Nome del docente mancante!');
     return;
   }
   var $ObjQuery = { Operazioni: [] };
   $scope.DocenteInEditing.RagioneSociale = $scope.DocenteInEditing.RagioneSociale.toUpperCase();
   var ParamDocente = {
                        CHIAVE: $scope.DocenteInEditing.Chiave,
                        RAGIONE_SOCIALE: $scope.DocenteInEditing.RagioneSociale == undefined ? '' : $scope.DocenteInEditing.RagioneSociale.xSQL(),
                        TITOLO: $scope.DocenteInEditing.Titolo == undefined ? '' : $scope.DocenteInEditing.Titolo.xSQL(),
                        TEL_PRIMO: $scope.DocenteInEditing.NumeroTelefono_1 == undefined ? '' : $scope.DocenteInEditing.NumeroTelefono_1.xSQL(),
                        TEL_SECONDO: $scope.DocenteInEditing.NumeroTelefono_2 == undefined ? '' : $scope.DocenteInEditing.NumeroTelefono_2.xSQL(),
                        TEL_TERZO: $scope.DocenteInEditing.NumeroTelefono_3 == undefined ? '' : $scope.DocenteInEditing.NumeroTelefono_3.xSQL(),
                        EMAIL: $scope.DocenteInEditing.Email == undefined ? '' : $scope.DocenteInEditing.Email.xSQL(),
                        EMAIL_2: $scope.DocenteInEditing.EmailSecondaria == undefined ? '' : $scope.DocenteInEditing.EmailSecondaria.xSQL(),
                        MATERIA_1: $scope.DocenteInEditing.Materia_1 == -1 ? null : $scope.DocenteInEditing.Materia_1,
                        MATERIA_2: $scope.DocenteInEditing.Materia_2 == -1 ? null : $scope.DocenteInEditing.Materia_2,
                        MATERIA_3: $scope.DocenteInEditing.Materia_3 == -1 ? null : $scope.DocenteInEditing.Materia_3,
                        COORD_MATERIA_1: ($scope.DocenteInEditing.CoordMateria_1 == true && $scope.DocenteInEditing.Materia_1 != null) ? $scope.DocenteInEditing.Materia_1 : null,
                        COORD_MATERIA_2: ($scope.DocenteInEditing.CoordMateria_2 == true && $scope.DocenteInEditing.Materia_2 != null) ? $scope.DocenteInEditing.Materia_2 : null,
                        COORD_MATERIA_3: ($scope.DocenteInEditing.CoordMateria_3 == true && $scope.DocenteInEditing.Materia_3 != null) ? $scope.DocenteInEditing.Materia_3 : null,
                        PIATTAFORMA: $scope.DocenteInEditing.Piattaforma.xSQL(),
                        PIATTAFORMA_2: $scope.DocenteInEditing.Piattaforma_2.xSQL(),
                        INDIRIZZO: $scope.DocenteInEditing.Indirizzo == undefined ? '' : $scope.DocenteInEditing.Indirizzo.xSQL(),
                        COMUNE: $scope.DocenteInEditing.Comune == undefined ? '' : $scope.DocenteInEditing.Comune.xSQL(),
                        CAP: $scope.DocenteInEditing.Cap == undefined ? '' : $scope.DocenteInEditing.Cap.xSQL(),
                        PROVINCIA: $scope.DocenteInEditing.Provincia == -1 ? null : $scope.DocenteInEditing.Provincia,
                        NOTE: $scope.DocenteInEditing.Note == undefined ? '' : $scope.DocenteInEditing.Note.xSQL()
                      }

   var NuovoDocente = ($scope.DocenteInEditing.Chiave == -1);
   if(NuovoDocente) 
   {
      $ObjQuery.Operazioni.push({
                                 Query: 'InsertTeacher',
                                 Parametri: ParamDocente
                                });
   }
   else 
   {
      $ObjQuery.Operazioni.push({
                                 Query: 'UpdateTeacher',
                                 Parametri: ParamDocente
                                });
   };

   if (!NuovoDocente && $scope.DocenteInEditing.ListaIstitutiDocEliminati.length != 0) 
   {
    for (let j = 0; j < $scope.DocenteInEditing.ListaIstitutiDocEliminati.length; j++) 
    {
     var ParamIstitutoDoc = {
                             DOCENTE: $scope.DocenteInEditing.Chiave,
                             ISTITUTO: $scope.DocenteInEditing.ListaIstitutiDocEliminati[j].CHIAVE
                            }
     if ($scope.DocenteInEditing.ListaIstitutiDocEliminati[j].Eliminato) 
     {
      $ObjQuery.Operazioni.push({
                                  Query: 'DeleteAvailabilityAfterDeleteInstitute',
                                  Parametri: ParamIstitutoDoc
                                });

      $ObjQuery.Operazioni.push({
                                  Query: 'DeleteLessonAfterDeleteInstitute',
                                  Parametri: ParamIstitutoDoc
                                });

      $ObjQuery.Operazioni.push({
                                 Query: 'DeleteInstituteTeacher',
                                 Parametri: ParamIstitutoDoc
                                });
     }
    }
    SystemInformation.PostSQL('Teacher', $ObjQuery, function (Answer) 
    {
      $scope.DocenteInEditing.ListaIstitutiDocEliminati = [];
      $ObjQuery.Operazioni = [];
    });
   }

   if(!NuovoDocente && $scope.DocenteInEditing.ListaOrariEliminati.length != 0) 
   {
      for(let j = 0; j < $scope.DocenteInEditing.ListaOrariEliminati.length; j++) 
      {
          var ParamOrario = { CHIAVE: $scope.DocenteInEditing.ListaOrariEliminati[j].CHIAVE };
          if($scope.DocenteInEditing.ListaOrariEliminati[j].Eliminato) {
             $ObjQuery.Operazioni.push({
                                         Query: 'DeleteLesson',
                                         Parametri: ParamOrario
                                       });
       }
      }
      SystemInformation.PostSQL('Teacher', $ObjQuery, function (Answer) 
      {
        $scope.DocenteInEditing.ListaOrariEliminati = [];
        $ObjQuery.Operazioni = [];
      });
   }

   for(let i = 0; i < $scope.DocenteInEditing.ListaIstitutiDoc.length; i++) 
   {
      var ParamIstitutoDoc = {
                              DOCENTE: $scope.DocenteInEditing.Chiave,
                              ISTITUTO: $scope.DocenteInEditing.ListaIstitutiDoc[i].CHIAVE
                             }

     if(NuovoDocente && !($scope.DocenteInEditing.ListaIstitutiDoc[i].Eliminato)) 
     {
        $ObjQuery.Operazioni.push({
                                    Query: 'InsertInstituteTeacherAfterInsert',
                                    Parametri: ParamIstitutoDoc
                                  });
     }
     if(!NuovoDocente && $scope.DocenteInEditing.ListaIstitutiDoc[i].Nuovo && !($scope.DocenteInEditing.ListaIstitutiDoc[i].Eliminato)) 
     {
        $ObjQuery.Operazioni.push({
                                    Query: 'InsertInstituteTeacher',
                                    Parametri: ParamIstitutoDoc
                                  });
     }
   }

   for(let i = 0; i < $scope.DocenteInEditing.ListaIstitutiDoc.length; i++) 
   {
       for(let j = 0; j < $scope.DocenteInEditing.ListaIstitutiDoc[i].Orari.length; j++) 
       {
           var ParamOrario = {
                               CHIAVE: $scope.DocenteInEditing.ListaIstitutiDoc[i].Orari[j].CHIAVE,
                               MATERIA: $scope.DocenteInEditing.ListaIstitutiDoc[i].Orari[j].MATERIA,
                               DOCENTE: $scope.DocenteInEditing.Chiave,
                               CLASSE: $scope.DocenteInEditing.ListaIstitutiDoc[i].Orari[j].CLASSE,
                               ISTITUTO: $scope.DocenteInEditing.ListaIstitutiDoc[i].Orari[j].ISTITUTO
                             }
          if(NuovoDocente && $scope.DocenteInEditing.ListaIstitutiDoc[i].Orari[j].Nuovo)
            $ObjQuery.Operazioni.push({
                                       Query: 'InsertLessonAfterInsert',
                                       Parametri: ParamOrario,
                                       ResetKeys: [2]
                                      });

          if(!NuovoDocente && $scope.DocenteInEditing.ListaIstitutiDoc[i].Orari[j].Nuovo)
           $ObjQuery.Operazioni.push({
                                      Query: 'InsertLesson',
                                      Parametri: ParamOrario,
                                      ResetKeys: [1]
                                     });

          if(!NuovoDocente && $scope.DocenteInEditing.ListaIstitutiDoc[i].Orari[j].Modificato)
          {
           ParamOrario = {
                          CHIAVE: $scope.DocenteInEditing.ListaIstitutiDoc[i].Orari[j].CHIAVE,
                          MATERIA: $scope.DocenteInEditing.ListaIstitutiDoc[i].Orari[j].MATERIA,
                          CLASSE: $scope.DocenteInEditing.ListaIstitutiDoc[i].Orari[j].CLASSE
                         };
          $ObjQuery.Operazioni.push({
                                     Query: 'UpdateLesson',
                                     Parametri: ParamOrario
                                    });
          }
       }

    for(let k = 0; k < $scope.DocenteInEditing.ListaIstitutiDoc[i].Disponibilita.length; k++) 
    {
       for(let l = 0; l < $scope.DocenteInEditing.ListaIstitutiDoc[i].Disponibilita[k].length; l++)
           for(let m = 0; m < $scope.DocenteInEditing.ListaIstitutiDoc[i].Disponibilita[k][l].Orari.length; m++) 
           {
               if($scope.DocenteInEditing.ListaIstitutiDoc[i].Disponibilita[k][l].Orari[m].Checked) 
               {
                  if($scope.DocenteInEditing.ListaIstitutiDoc[i].Disponibilita[k][l].Orari[m].Nuovo) 
                  {
                     var ParamDisponibilita = {
                                               DocenteDisp: parseInt($scope.DocenteInEditing.Chiave),
                                               IstitutoDisp: parseInt($scope.DocenteInEditing.ListaIstitutiDoc[i].CHIAVE),
                                               GiornoDisp: parseInt(k),
                                               LuogoDisp: parseInt($scope.DocenteInEditing.ListaIstitutiDoc[i].Disponibilita[k][l].ChiaveTipologia),
                                               OraDisp: parseInt(m)
                                              }
                     if(!NuovoDocente) 
                     {
                        $ObjQuery.Operazioni.push({
                                                   Query: 'InsertUpdateTeacherAvailability',
                                                   Parametri: ParamDisponibilita
                                                  });
                     }
                     else
                     {
                        $ObjQuery.Operazioni.push({
                                                   Query: 'InsertUpdateTeacherAvailabilityAfterInsert',
                                                   Parametri: ParamDisponibilita
                                                  });
                     }
                  }
               }
               else 
               {
                 if($scope.DocenteInEditing.ListaIstitutiDoc[i].Disponibilita[k][l].Orari[m].Eliminato && !($scope.DocenteInEditing.ListaIstitutiDoc[i].Disponibilita[k][l].Orari[m].Nuovo)) 
                 {
                    var ParamDisponibilita = {
                                               DocenteDisp: parseInt($scope.DocenteInEditing.Chiave),
                                               IstitutoDisp: parseInt($scope.DocenteInEditing.ListaIstitutiDoc[i].CHIAVE),
                                               GiornoDisp: parseInt(k),
                                               LuogoDisp: parseInt($scope.DocenteInEditing.ListaIstitutiDoc[i].Disponibilita[k][l].ChiaveTipologia),
                                               OraDisp: parseInt(m)
                                              }

                    $ObjQuery.Operazioni.push({
                                               Query: 'DeleteTeacherAvailability',
                                               Parametri: ParamDisponibilita
                                              });

                 }
               }
           }
    }
   }

   SystemInformation.PostSQL('Teacher', $ObjQuery, function (Answer) 
   {
     $scope.DocenteInEditing.ListaIstitutiDoc = [];
     $scope.EditingOn = false;
     $scope.DisponibilitaInEditing = [];

     $scope.RefreshListaDocenti();
     $scope.GridOptions.query.page = $scope.OldPagina;

     SystemInformation.GetSQL('Institute', {}, function (Results) 
     {
       var ListaIstitutiAssegnati = [];
       IstitutiInfoLista = SystemInformation.FindResults(Results, 'InstituteInfoList');
       if(IstitutiInfoLista != undefined) 
       {
         for(let i = 0; i < IstitutiInfoLista.length; i++) 
         {
            if (IstitutiInfoLista[i].NR_DOCENTI > 0)
             ListaIstitutiAssegnati.push({
              Chiave: IstitutiInfoLista[i].CHIAVE,
              Istituto: IstitutiInfoLista[i].NOME
             });

            IstitutiInfoLista[i] = {
                                    Chiave: IstitutiInfoLista[i].CHIAVE,
                                    Istituto: IstitutiInfoLista[i].NOME
                                   }
         }
        $scope.ListaIstituti = ListaIstitutiAssegnati;
        $scope.ListaIstitutiNoFilter = Array.from(ListaIstitutiAssegnati);
       }
       else SystemInformation.ApplyOnError('Modello istituti non conforme', '');
     });
   });
  }

  $scope.EliminaDocente = function (Docente) 
  {
    var EliminaDoc = function () 
    {
      var $ObjQuery = { Operazioni: [] };
      var ParamDocente = { CHIAVE: Docente.Chiave };

      $ObjQuery.Operazioni.push({
                                 Query: 'DeleteTeacherAvailabilityAll',
                                 Parametri: ParamDocente
                                });

      $ObjQuery.Operazioni.push({
                                 Query: 'DeleteTeacherDeliveryBookAll',
                                 Parametri: ParamDocente
                                });

      $ObjQuery.Operazioni.push({
                                 Query: 'DeleteTeacherDelivery',
                                 Parametri: ParamDocente
                                });

      $ObjQuery.Operazioni.push({
                                 Query: 'DeleteLessonAll',
                                 Parametri: ParamDocente
                                });

      $ObjQuery.Operazioni.push({
                                 Query: 'DeleteInstituteTeacherAll',
                                 Parametri: ParamDocente
                                });

      $ObjQuery.Operazioni.push({
                                 Query: 'DeleteTeacher',
                                 Parametri: ParamDocente
                                });

      SystemInformation.PostSQL('Teacher', $ObjQuery, function (Answer) 
      {
        $scope.RefreshListaDocenti();
        $scope.AProvinciaFiltro = $scope.ProvinciaOldFiltro;
      });
    }
    ZConfirm.GetConfirmBox('AVVISO', "Eliminare il docente: " + Docente.RagioneSociale + " ?", EliminaDoc, function () { });
  }

  $scope.AggiungiIstituto = function (ev) 
  {
   $mdDialog.show({
                  controller: DialogControllerIstituto,
                  templateUrl: "template/associateInstituteTeacherPopup.html",
                  targetEvent: ev,
                  scope: $scope,
                  preserveScope: true,
                  clickOutsideToClose: true
                 })
                 .then(function (answer) { },
                       function () { });
  };

  function DialogControllerIstituto($scope, $mdDialog)
  {
    $scope.hide = function () 
    {
      $mdDialog.hide();
    };

    $scope.AnnullaPopup = function () 
    {
      $scope.IstitutoDaAssociare = -1;
      $scope.NomeFiltro = '';
      $mdDialog.cancel();
    };
  }

  $scope.ConfermaPopup = function (istituto) 
  {
    if(istituto == -1) 
    {
      ZCustomAlert($mdDialog, 'ATTENZIONE', 'NESSUN ISTITUTO SELEZIONATO!');
      return
    }
    else 
    {
      let IstitutoExist = $scope.DocenteInEditing.ListaIstitutiDoc.find(function (AIstituto) { return (AIstituto.CHIAVE == istituto); });
      let IstitutoNome = $scope.ListaIstitutiPopup.find(function (AIstituto) { return (AIstituto.Chiave == istituto); });
      if (IstitutoExist != undefined) 
          ZCustomAlert($mdDialog, 'AVVISO', "ISTITUTO GIA' ASSOCIATO AL DOCENTE ATTUALE!")
      else 
      {
          NuovoIstituto = {
                            "Nuovo": true,
                            "Eliminato": false,
                            "CHIAVE": istituto,
                            "ISTITUTO": IstitutoNome.Istituto,
                            "INDIRIZZO": '',
                            "CAP": '',
                            "COMUNE": '',
                            "PROVINCIA_LISTA_ALL": -1,
                            "Orari": [],
                            "Disponibilita": []
                           }

          NuovoIstituto.Disponibilita = GetArrayDisponibilitaVuoto();

          SystemInformation.GetSQL('Institute', { CHIAVE: istituto }, function (Results) 
          {
            IstitutoDettaglio = SystemInformation.FindResults(Results, 'InstituteInfoAddress');
            if(IstitutoDettaglio != undefined) 
            {
               NuovoIstituto.INDIRIZZO = IstitutoDettaglio[0].INDIRIZZO == null ? '' : IstitutoDettaglio[0].INDIRIZZO;
               NuovoIstituto.CAP = IstitutoDettaglio[0].CAP == null ? '' : IstitutoDettaglio[0].CAP;
               NuovoIstituto.COMUNE = IstitutoDettaglio[0].COMUNE == null ? '' : IstitutoDettaglio[0].COMUNE;
               NuovoIstituto.PROVINCIA = IstitutoDettaglio[0].PROVINCIA == null ? -1 : parseInt(IstitutoDettaglio[0].PROVINCIA);
               NuovoIstituto.PROVINCIA_LISTA_ALL = IstitutoDettaglio[0].PROVINCIA_LISTA_ALL == null ? -1 : parseInt(IstitutoDettaglio[0].PROVINCIA_LISTA_ALL);
               $scope.DocenteInEditing.ListaIstitutiDoc.push(NuovoIstituto);
               $scope.IstitutoDaAssociare = -1;
               $scope.IstitutoVisualizzato = $scope.DocenteInEditing.ListaIstitutiDoc[$scope.DocenteInEditing.ListaIstitutiDoc.length - 1].CHIAVE;
               $scope.ImpostaDisponibilita($scope.IstitutoVisualizzato);
               
               $scope.DocenteInEditing.ListaIstitutiDoc.sort(function (a, b) 
               {
                  var IstA = a.ISTITUTO.toUpperCase();
                  var IstB = b.ISTITUTO.toUpperCase();
                  return (IstA < IstB) ? -1 : (IstA > IstB) ? 1 : 0;
               });
               $scope.NomeFiltro = '';
               $mdDialog.hide();
            }
            else SystemInformation.ApplyOnError('Modello indirizzo istituto conforme');
          }, 'SelectSQLOnlyAddress');
      }
    }
  };

  $scope.DissociaIstituto = function (Istituto) 
  {
    if($scope.DocenteInEditing.ListaIstitutiDoc.length == 0)
       ZCustomAlert($mdDialog, 'ATTENZIONE', 'NESSUN ISTITUTO SELEZIONATO DA DISSOCIARE!')
    else 
    {
       IstitutoCorrispondente = $scope.DocenteInEditing.ListaIstitutiDoc.find(function (AIstituto) { return (AIstituto.CHIAVE == Istituto); });
       var DissocIstDoc = function () 
       {
         for(let j = 0; j < $scope.DocenteInEditing.ListaIstitutiDoc.length; j++) 
         {
            var EliminaIstituto = function (j) 
            {
              $scope.DocenteInEditing.ListaIstitutiDoc.splice(j, 1);
              $scope.IstitutoVisualizzato = $scope.DocenteInEditing.ListaIstitutiDoc.length == 0 ? -1 : $scope.DocenteInEditing.ListaIstitutiDoc[0].CHIAVE
              $scope.ImpostaDisponibilita($scope.DocenteInEditing.ListaIstitutiDoc[0].CHIAVE);
            }
            if($scope.DocenteInEditing.ListaIstitutiDoc[j].CHIAVE == Istituto) 
            {
               if($scope.DocenteInEditing.ListaIstitutiDoc[j].Nuovo)
                  EliminaIstituto(j);
               else 
               {
                 $scope.DocenteInEditing.ListaIstitutiDocEliminati.push($scope.DocenteInEditing.ListaIstitutiDoc[j]);
                 $scope.DocenteInEditing.ListaIstitutiDocEliminati[$scope.DocenteInEditing.ListaIstitutiDocEliminati.length - 1].Eliminato = true;
                 EliminaIstituto(j);
               }
            }
         }
       }
       ZConfirm.GetConfirmBox('AVVISO', 'Dissociare l\'istituto: ' + IstitutoCorrispondente.ISTITUTO + ' dal docente?', DissocIstDoc, function () { });
    }
  }

  $scope.NuovoOrario = function (ev, Istituto, Docente) 
  {
    if(Istituto == -1) 
       ZCustomAlert($mdDialog, 'ATTENZIONE', "IMPOSSIBILE AGGIUNGERE ORARIO, NESSUN ISTITUTO SELEZIONATO!")
    else if ($scope.DocenteInEditing.Materia_1 == -1 && $scope.DocenteInEditing.Materia_2 == -1 && $scope.DocenteInEditing.Materia_3 == -1)
             ZCustomAlert($mdDialog, 'ATTENZIONE', "IMPOSSIBILE AGGIUNGERE ORARIO, DOCENTE NON ASSOCIATO A NESSUNA MATERIA!")
    else 
    {
      $mdDialog.show({
                      controller: DialogControllerOrario,
                      templateUrl: "template/lessonTeacherPopup.html",
                      targetEvent: ev,
                      scope: $scope,
                      preserveScope: true,
                      clickOutsideToClose: true,
                      locals: { Istituto, Docente }
                     })
                     .then(function (answer) { },
                           function () { });
    }
  };

  function DialogControllerOrario($scope, $mdDialog, Istituto, Docente) 
  {
   $scope.OrarioInEditing = {
                             "CHIAVE": -1,
                             "MATERIA": -1,
                             "CLASSE": -1,
                             "ISTITUTO": Istituto,
                             "DOCENTE": Docente,
                             "Nuovo": true,
                             "Modificato": false,
                             "Eliminato": false
                            }

   SystemInformation.GetSQL('Institute', { CHIAVE: Istituto }, function (Results) 
   {
     ListaClassiIst = SystemInformation.FindResults(Results, 'ClassiInstitute');
     if (ListaClassiIst != undefined) 
     {
      for(let i = 0; i < ListaClassiIst.length; i++)
          ListaClassiIst[i] = {
                                Chiave: ListaClassiIst[i].CHIAVE,
                                Anno: ListaClassiIst[i].ANNO,
                                Sezione: ListaClassiIst[i].SEZIONE,
                                Istituto: ListaClassiIst[i].ISTITUTO,
                                Combinazione: ListaClassiIst[i].COMBINAZIONE_DESCR,
                                DaAggiungere: false
                              }
       $scope.ListaClassiIstituto = ListaClassiIst;
     }
     else SystemInformation.ApplyOnError('Modello classe istituto non conforme o nessuna classe associata all\'istituto attuale', '')
   }, "SQLDettaglio");

   $scope.hide = function () 
   {
     $mdDialog.hide();
   };

   $scope.AnnullaPopupOrario = function () 
   {
     $mdDialog.cancel();
   };

   $scope.ConfermaPopupOrario = function () 
   {
     if($scope.OrarioInEditing.MATERIA == -1 || $scope.OrarioInEditing.CLASSE == -1) 
     {
       ZCustomAlert($mdDialog, 'ATTENZIONE', 'DATI ORARIO MANCANTI!');
       return
     }
     else 
     {
        MateriaCorrispondente = $scope.ListaMateriePerDoc.find(function (AMateria) { return (AMateria.Chiave == $scope.OrarioInEditing.MATERIA); });
        ClasseCorrispondente = $scope.ListaClassiIstituto.find(function (AClasse) { return (AClasse.Chiave == $scope.OrarioInEditing.CLASSE); });

        $scope.OrarioInEditing.ClasseNome = ClasseCorrispondente.Anno + ClasseCorrispondente.Sezione + ' - ' + ClasseCorrispondente.Combinazione;
        $scope.OrarioInEditing.MateriaNome = MateriaCorrispondente.Nome;

        IstCorrispondente = $scope.DocenteInEditing.ListaIstitutiDoc.findIndex(function (AIstituto) { return (AIstituto.CHIAVE == $scope.OrarioInEditing.ISTITUTO); });

        var Trovato = false;
        for(let j = 0; j < $scope.DocenteInEditing.ListaIstitutiDoc[IstCorrispondente].Orari.length; j++)
            if($scope.DocenteInEditing.ListaIstitutiDoc[IstCorrispondente].Orari[j].MateriaNome == $scope.OrarioInEditing.MateriaNome && $scope.DocenteInEditing.ListaIstitutiDoc[IstCorrispondente].Orari[j].ClasseNome == $scope.OrarioInEditing.ClasseNome)
               Trovato = true;
        if(!Trovato)
           $scope.DocenteInEditing.ListaIstitutiDoc[IstCorrispondente].Orari.push($scope.OrarioInEditing);
        else ZCustomAlert($mdDialog, 'ATTENZIONE', "DOCENTE GIA' ASSOCIATO A QUESTO ORARIO")
     }
     $mdDialog.hide();
    }
  }

  $scope.NuovoOrarioMultiple = function (ev, Istituto, Docente) 
  {
    if(Istituto == -1) 
       ZCustomAlert($mdDialog, 'ATTENZIONE', "IMPOSSIBILE AGGIUNGERE ORARIO, NESSUN ISTITUTO SELEZIONATO!")
    else if($scope.DocenteInEditing.Materia_1 == -1 && $scope.DocenteInEditing.Materia_2 == -1 && $scope.DocenteInEditing.Materia_3 == -1) 
            ZCustomAlert($mdDialog, 'ATTENZIONE', "IMPOSSIBILE AGGIUNGERE ORARIO, DOCENTE NON ASSOCIATO A NESSUNA MATERIA!")
    else 
    {
      $mdDialog.show({
                      controller: DialogControllerOrarioMultiple,
                      templateUrl: "template/lessonTeacherPopupMultiple.html",
                      targetEvent: ev,
                      scope: $scope,
                      preserveScope: true,
                      clickOutsideToClose: true,
                      locals: { Istituto, Docente }
                     })
                     .then(function (answer) { },
                           function () { });
    }
  };

  function DialogControllerOrarioMultiple($scope, $mdDialog, Istituto, Docente) 
  {
    $scope.ListaClassiToAdd = [];
    $scope.ClasseMateria = parseInt($scope.DocenteInEditing.Materia_1);
    SystemInformation.GetSQL('Institute', { CHIAVE: Istituto }, function (Results) 
    {
      ListaClassiIst = SystemInformation.FindResults(Results, 'ClassiInstitute');
      if(ListaClassiIst != undefined) 
      {
         for(let i = 0; i < ListaClassiIst.length; i++)
            ListaClassiIst[i] = {
                                 Chiave: ListaClassiIst[i].CHIAVE,
                                 Anno: ListaClassiIst[i].ANNO,
                                 Sezione: ListaClassiIst[i].SEZIONE,
                                 Istituto: ListaClassiIst[i].ISTITUTO,
                                 Combinazione: ListaClassiIst[i].COMBINAZIONE_DESCR,
                                 DaAggiungere: false
                                }
         $scope.ListaClassiIstituto = ListaClassiIst;
      }
      else SystemInformation.ApplyOnError('Modello classe istituto non conforme o nessuna classe associata all\'istituto attuale', '')
    }, "SQLDettaglio");

    $scope.hide = function () 
    {
      $mdDialog.hide();
    };

    $scope.AnnullaPopupOrarioMultiple = function () 
    {
      for(let i = 0; i < $scope.ListaClassiIstituto.length; i++)
          $scope.ListaClassiIstituto[i].DaAggiungere = false;
      $scope.ListaClassiToAdd = [];
      $mdDialog.cancel();
    };

    $scope.ConfermaPopupOrarioMultiple = function () 
    {
      for(let j = 0; j < $scope.ListaClassiIstituto.length; j++) 
      {
         if ($scope.ListaClassiIstituto[j].DaAggiungere) 
         {
           $scope.ListaClassiToAdd.push($scope.ListaClassiIstituto[j]);
           $scope.ListaClassiIstituto[j].DaAggiungere = false;
         }
      }

      if($scope.ClasseMateria == -1 || $scope.ListaClassiToAdd.length == 0) 
      {
        ZCustomAlert($mdDialog, 'ATTENZIONE', 'DATI ORARI MANCANTI!');
        return
      }
      else 
      {
        MateriaCorrispondente = $scope.ListaMateriePerDoc.find(function (AMateria) { return (AMateria.Chiave == $scope.ClasseMateria); });
        for(let i = 0; i < $scope.ListaClassiToAdd.length; i++) 
        {
            ClasseCorrispondente = $scope.ListaClassiIstituto.find(function (AClasse) { return (AClasse.Chiave == $scope.ListaClassiToAdd[i].Chiave); });
            var Orario = {
                           "CHIAVE": -1,
                           "MATERIA": MateriaCorrispondente.Chiave,
                           "CLASSE": ClasseCorrispondente.Chiave,
                           "ISTITUTO": Istituto,
                           "DOCENTE": Docente,
                           "Nuovo": true,
                           "Modificato": false,
                           "Eliminato": false
                          }
            Orario.ClasseNome = ClasseCorrispondente.Anno + ClasseCorrispondente.Sezione + ' - ' + ClasseCorrispondente.Combinazione;
            Orario.MateriaNome = MateriaCorrispondente.Nome;

            IstCorrispondente = $scope.DocenteInEditing.ListaIstitutiDoc.findIndex(function (AIstituto) { return (AIstituto.CHIAVE == Orario.ISTITUTO); });
            var Trovato = false;
            for(let j = 0; j < $scope.DocenteInEditing.ListaIstitutiDoc[IstCorrispondente].Orari.length; j++)
                if($scope.DocenteInEditing.ListaIstitutiDoc[IstCorrispondente].Orari[j].MateriaNome == Orario.MateriaNome && $scope.DocenteInEditing.ListaIstitutiDoc[IstCorrispondente].Orari[j].ClasseNome == Orario.ClasseNome)
                   Trovato = true;
            if(!Trovato)
              $scope.DocenteInEditing.ListaIstitutiDoc[IstCorrispondente].Orari.push(Orario);
        }
      }
      $mdDialog.hide();
    }
  }

  $scope.ModificaOrario = function (Orario) 
  {
   $mdDialog.show({
                   controller: DialogControllerOrarioMod,
                   templateUrl: "template/lessonTeacherPopup.html",
                   targetEvent: Orario,
                   scope: $scope,
                   preserveScope: true,
                   clickOutsideToClose: true,
                   locals: { Orario }
                  })
                  .then(function (answer) { },
                        function () { });
  };

  function DialogControllerOrarioMod($scope, $mdDialog, Orario) 
  {
    OrarioOld = {
                 "MATERIA": Orario.MATERIA,
                 "CLASSE": Orario.CLASSE,
                 "ORARIO": Orario.ORARIO,
                 "ISTITUTO": Orario.ISTITUTO
                }
    $scope.OrarioInEditing = {
                               "CHIAVE": Orario.CHIAVE,
                               "MATERIA": Orario.MATERIA,
                               "CLASSE": Orario.CLASSE,
                               "ISTITUTO": Orario.ISTITUTO,
                               "DOCENTE": Orario.Docente,
                               "Nuovo": Orario.Nuovo,
                               "Modificato": Orario.Modificato,
                               "Eliminato": Orario.Eliminato
                              }

    SystemInformation.GetSQL('Institute', { CHIAVE: Orario.ISTITUTO }, function (Results) 
    {
      ListaClassiIst = SystemInformation.FindResults(Results, 'ClassiInstitute');
      if(ListaClassiIst != undefined) 
      {
         for(let i = 0; i < ListaClassiIst.length; i++)
             ListaClassiIst[i] = {
                                  Chiave: ListaClassiIst[i].CHIAVE,
                                  Anno: ListaClassiIst[i].ANNO,
                                  Sezione: ListaClassiIst[i].SEZIONE,
                                  Istituto: ListaClassiIst[i].ISTITUTO,
                                  Combinazione: ListaClassiIst[i].COMBINAZIONE_DESCR
                                 }
         $scope.ListaClassiIstituto = ListaClassiIst;
      }
      else SystemInformation.ApplyOnError('Modello classe istituto non conforme o nessuna classe associata all\'istituto attuale', '')
    }, "SQLDettaglio");

    $scope.hide = function () 
    {
      $mdDialog.hide();
    };

    $scope.AnnullaPopupOrario = function () 
    {
      $mdDialog.cancel();
    };

    $scope.ConfermaPopupOrario = function (Orario) 
    {
     IstCorrispondente = $scope.DocenteInEditing.ListaIstitutiDoc.findIndex(function (AIstituto) { return (AIstituto.CHIAVE == Orario.ISTITUTO); });
     OrarioCorrispondente = $scope.DocenteInEditing.ListaIstitutiDoc[IstCorrispondente].Orari.findIndex(function (AOrario) { return (AOrario.ISTITUTO == OrarioOld.ISTITUTO && AOrario.CLASSE == OrarioOld.CLASSE && AOrario.MATERIA == OrarioOld.MATERIA && AOrario.ORARIO == OrarioOld.ORARIO); });

     for(let m = 0; m < $scope.ListaClassiIstituto.length; m++) 
     {
        if($scope.ListaClassiIstituto[m].Chiave == Orario.CLASSE) 
        {
           MateriaCorrispondente = $scope.ListaMateriePerDoc.find(function (AMateria) { return (AMateria.Chiave == Orario.MATERIA); });
           ClasseCorrispondente = $scope.ListaClassiIstituto.find(function (AClasse) { return (AClasse.Chiave == Orario.CLASSE); });

           $scope.DocenteInEditing.ListaIstitutiDoc[IstCorrispondente].Orari[OrarioCorrispondente].MateriaNome = MateriaCorrispondente.Nome;
           $scope.DocenteInEditing.ListaIstitutiDoc[IstCorrispondente].Orari[OrarioCorrispondente].MATERIA = Orario.MATERIA;
           $scope.DocenteInEditing.ListaIstitutiDoc[IstCorrispondente].Orari[OrarioCorrispondente].ClasseNome = ClasseCorrispondente.Anno + ClasseCorrispondente.Sezione + ' - ' + ClasseCorrispondente.Combinazione;
           $scope.DocenteInEditing.ListaIstitutiDoc[IstCorrispondente].Orari[OrarioCorrispondente].CLASSE = $scope.ListaClassiIstituto[m].Chiave;
           $scope.DocenteInEditing.ListaIstitutiDoc[IstCorrispondente].Orari[OrarioCorrispondente].ANNO = $scope.ListaClassiIstituto[m].Anno;
           $scope.DocenteInEditing.ListaIstitutiDoc[IstCorrispondente].Orari[OrarioCorrispondente].SEZIONE = $scope.ListaClassiIstituto[m].Sezione;
           $scope.DocenteInEditing.ListaIstitutiDoc[IstCorrispondente].Orari[OrarioCorrispondente].COMBINAZIONE = $scope.ListaClassiIstituto[m].Combinazione;
           if ($scope.DocenteInEditing.ListaIstitutiDoc[IstCorrispondente].Orari[OrarioCorrispondente].Nuovo)
            $scope.DocenteInEditing.ListaIstitutiDoc[IstCorrispondente].Orari[OrarioCorrispondente].Modificato = false;
           else $scope.DocenteInEditing.ListaIstitutiDoc[IstCorrispondente].Orari[OrarioCorrispondente].Modificato = true;
        }
     }
     $mdDialog.hide();
    }
  }

  $scope.EliminaOrario = function (Orario) 
  {
   var EliminaOrDoc = function () 
   {
     IstCorrispondente = $scope.DocenteInEditing.ListaIstitutiDoc.findIndex(function (AIstituto) { return (AIstituto.CHIAVE == Orario.ISTITUTO); });
     OrarioCorrispondente = $scope.DocenteInEditing.ListaIstitutiDoc[IstCorrispondente].Orari.findIndex(function (AOrario) { return (AOrario.MATERIA == Orario.MATERIA && AOrario.CLASSE == Orario.CLASSE); });
     if($scope.DocenteInEditing.ListaIstitutiDoc[IstCorrispondente].Orari[OrarioCorrispondente].Nuovo)
        $scope.DocenteInEditing.ListaIstitutiDoc[IstCorrispondente].Orari.splice(OrarioCorrispondente, 1)
     else 
     {
        $scope.DocenteInEditing.ListaOrariEliminati.push($scope.DocenteInEditing.ListaIstitutiDoc[IstCorrispondente].Orari[OrarioCorrispondente]);
        $scope.DocenteInEditing.ListaOrariEliminati[$scope.DocenteInEditing.ListaOrariEliminati.length - 1].Eliminato = true;
        $scope.DocenteInEditing.ListaIstitutiDoc[IstCorrispondente].Orari.splice(OrarioCorrispondente, 1);
     }
   }
   ZConfirm.GetConfirmBox('AVVISO', 'Eliminare l\'associazione di ' + Orario.MateriaNome + ' alla classe ' + Orario.ClasseNome + ' ?', EliminaOrDoc, function () { });
  }

  $scope.NuovaSpedizione = function (ChiaveDocente) 
  {
    SystemInformation.DataBetweenController.ChiaveSpedizione = -1;
    SystemInformation.DataBetweenController.ChiaveDocente = ChiaveDocente;
    SystemInformation.DataBetweenController.Provenienza = 'TeacherPage';
    SystemInformation.DataBetweenController.MateriaFiltro = $scope.MateriaFiltro;
    SystemInformation.DataBetweenController.MateriaFiltroNome = $scope.searchTextMat;
    SystemInformation.DataBetweenController.IstitutoFiltrato = $scope.IstitutoFiltrato;
    SystemInformation.DataBetweenController.IstitutoFiltratoNome = $scope.searchTextIstituto;
    //SystemInformation.DataBetweenController.Pagina                  = $scope.GridOptions.query.page;
    $state.go("deliveryModDetailPage");
  }

  $scope.ListaSpedizioni = function (Docente) 
  {
    $mdDialog.show({
                    controller: DialogControllerListaSpedizioni,
                    templateUrl: "template/teacherDeliveryListPopup.html",
                    targetEvent: Docente,
                    scope: $scope,
                    preserveScope: true,
                    clickOutsideToClose: true,
                    locals: { Docente }
                   })
                   .then(function (answer) { },
                         function () { });
  };

  function DialogControllerListaSpedizioni($scope, $mdDialog, Docente) 
  {
    $scope.GridOptions3 = 
    {
     rowSelection: false,
     multiSelect: true,
     autoSelect: true,
     decapitate: false,
     largeEditDialog: false,
     boundaryLinks: false,
     limitSelect: true,
     pageSelect: true,
     query: {
             limit: 10,
             page: 1
            },
     limitOptions: [10, 20, 30]
    };

   $scope.RefreshListaSpedizioni = function () 
   {
     var ListaSpedizioniDocDettaglio = [];
     $scope.ListaSpedizioniDoc = [];
     if($scope.IsAdministrator()) 
     {
        SystemInformation.GetSQL('Delivery', { CHIAVE: Docente.Chiave, ANNO: $scope.AnnoRicercaSpedizioni }, function (Results) 
        {
          $scope.ListaSpedizioniDoc = SystemInformation.FindResults(Results, 'TeacherDeliveryListAdm');
          ListaSpedizioniDocDettaglio = SystemInformation.FindResults(Results, 'TeacherDeliveryListAdmDettaglio');

          if($scope.ListaSpedizioniDoc != undefined && ListaSpedizioniDocDettaglio != undefined) 
          {
             $scope.ListaSpedizioniDoc.forEach(function (Spedizione) { Spedizione.DettagliTitoli = [] });
             for(let i = 0; i < $scope.ListaSpedizioniDoc.length; i++) 
             {
                $scope.ListaSpedizioniDoc[i].DATA = ZFormatDateTime('dd/mm/yyyy', ZDateFromHTMLInput($scope.ListaSpedizioniDoc[i].DATA))
                for(let j = 0; j < ListaSpedizioniDocDettaglio.length; j++) 
                {
                   switch (ListaSpedizioniDocDettaglio[j].STATO) 
                   {
                    case 'P': ListaSpedizioniDocDettaglio[j].STATO = 'PRENOTATO'
                              break;
                    case 'S': ListaSpedizioniDocDettaglio[j].STATO = 'DA SPEDIRE'
                              break;
                    case 'C': ListaSpedizioniDocDettaglio[j].STATO = 'CONSEGNATO'
                              break;
                   }
                   if($scope.ListaSpedizioniDoc[i].CHIAVE == ListaSpedizioniDocDettaglio[j].SPEDIZIONE)
                      $scope.ListaSpedizioniDoc[i].DettagliTitoli.push(ListaSpedizioniDocDettaglio[j]);
                }
             }
          }
          else SystemInformation.ApplyOnError('Modello lista spedizioni docente non conforme', '');
        }, 'SelectSQLDocenteAdmin')
     }
     else 
     {
       SystemInformation.GetSQL('Delivery', { CHIAVE: Docente.Chiave, ANNO: $scope.AnnoRicercaSpedizioni }, function (Results) 
       {
         $scope.ListaSpedizioniDoc = SystemInformation.FindResults(Results, 'TeacherDeliveryListPrm');
         ListaSpedizioniDocDettaglio = SystemInformation.FindResults(Results, 'TeacherDeliveryListPrmDettaglio');
         if($scope.ListaSpedizioniDoc != undefined && ListaSpedizioniDocDettaglio != undefined) 
         {
           $scope.ListaSpedizioniDoc.forEach(function (Spedizione) { Spedizione.DettagliTitoli = [] });
           for(let i = 0; i < $scope.ListaSpedizioniDoc.length; i++) 
           {
              $scope.ListaSpedizioniDoc[i].DATA = ZFormatDateTime('dd/mm/yyyy', ZDateFromHTMLInput($scope.ListaSpedizioniDoc[i].DATA))
              for(let j = 0; j < ListaSpedizioniDocDettaglio.length; j++) 
              {
                 switch (ListaSpedizioniDocDettaglio[j].STATO) 
                 {
                  case 'P': ListaSpedizioniDocDettaglio[j].STATO = 'PRENOTATO'
                            break;
                  case 'S': ListaSpedizioniDocDettaglio[j].STATO = 'DA SPEDIRE'
                            break;
                  case 'C': ListaSpedizioniDocDettaglio[j].STATO = 'CONSEGNATO'
                            break;
               }
               if($scope.ListaSpedizioniDoc[i].CHIAVE == ListaSpedizioniDocDettaglio[j].SPEDIZIONE)
                  $scope.ListaSpedizioniDoc[i].DettagliTitoli.push(ListaSpedizioniDocDettaglio[j]);
              }
           }
         }
         else SystemInformation.ApplyOnError('Modello lista spedizioni docente non conforme', '');
       }, 'SelectSQLDocentePromotore')
     }
   }

   $scope.GetTitoliSpedizione = function (Spedizione) 
   {
     var Result = '';
     for(let i = 0; i < Spedizione.DettagliTitoli.length; i++) 
         Result += Spedizione.DettagliTitoli[i].CODICE + ' - ' + Spedizione.DettagliTitoli[i].NOME_TITOLO + ' - ' + Spedizione.DettagliTitoli[i].STATO + ' IN DATA ' + ZFormatDateTime('dd/mm/yyyy', ZDateFromHTMLInput(Spedizione.DettagliTitoli[i].DATA_ULTIMA_MODIFICA)) + '</br>';

     return ($sce.trustAsHtml(Result.substr(0, Result.length)));
   }

   $scope.ModificaSpedizione = function (ChiaveSpedizione) 
   {
     SystemInformation.DataBetweenController.ChiaveSpedizione = ChiaveSpedizione;
     SystemInformation.DataBetweenController.ChiaveDocente = Docente.Chiave;
     SystemInformation.DataBetweenController.Provenienza = 'TeacherPage';
     SystemInformation.DataBetweenController.MateriaFiltro = $scope.MateriaFiltro;
     SystemInformation.DataBetweenController.MateriaFiltroNome = $scope.searchTextMat;
     SystemInformation.DataBetweenController.IstitutoFiltrato = $scope.IstitutoFiltrato;
     SystemInformation.DataBetweenController.IstitutoFiltratoNome = $scope.searchTextIstituto;
     SystemInformation.DataBetweenController.Provenienza = 'TeacherPage';
     $state.go("deliveryModDetailPage");
   };

   $scope.EliminaSpedizione = function (Spedizione) 
   {
     var EliminaSpedDoc = function () 
     {
       var $ObjQuery = { Operazioni: [] };
       var ParamSpedizione = { CHIAVE: Spedizione.CHIAVE };

       $ObjQuery.Operazioni.push({
                                  Query: 'DeleteDeliveryBookAll',
                                  Parametri: ParamSpedizione
                                 })

       $ObjQuery.Operazioni.push({
                                  Query: 'DeleteDelivery',
                                  Parametri: ParamSpedizione
                                 });

       SystemInformation.PostSQL('Delivery', $ObjQuery, function (Answer)
       {
         $ObjQuery.Operazioni = [];
         $scope.RefreshListaSpedizioni();
       });
     }
     ZConfirm.GetConfirmBox('AVVISO', 'Eliminare la spedizione della data ' + Spedizione.DATA + ' ?', EliminaSpedDoc, function () { });
   }

   $scope.hide = function ()
   {
     $mdDialog.hide();
   };

   $scope.ChiudiPopup = function () 
   {
     $scope.ListaSpedizioniDoc = [];
     $mdDialog.cancel();
   };
   $scope.RefreshListaSpedizioni();
  }

  $scope.RefreshListaDocenti();

  /////////////////////////PAGINA MAIL

  $scope.ResetMailPage = function () 
  {
    $scope.MailMultipla             = false;
    $scope.ListaDocentiMailMultipla = [];
    $scope.NumeroDestinatari        = 0;
    $scope.ContatoreInvio           = 0;
    $scope.InvioInCorso             = false;
    $scope.OldPagDocenti            = 0;
    $scope.ListaAllegatiMail        = [];
    var Oggi                        = new Date();
    var Anno                        = Oggi.getFullYear();
    var Mese                        = Oggi.getMonth();
    var Giorno                      = Oggi.getDay();
    var Ora                         = Oggi.getHours();
    var Minuto                      = Oggi.getMinutes();
    var Secondo                     = Oggi.getSeconds();
    $scope.AllegatoId               = Anno.toString() + Mese.toString() + Giorno.toString() + Ora.toString() + Minuto.toString() + Secondo.toString() + (Math.floor(Math.random() * 100)).toString();
  }

  $scope.InizializzaMailPage = function () 
  {
    $scope.ResetMailPage();
    if (Array.isArray(SystemInformation.DataBetweenController.ListaDocMail) &&
        SystemInformation.DataBetweenController.ListaDocMail.length > 0 &&
        SystemInformation.DataBetweenController.MailMultipla) 
    {
        $scope.MailMultipla = true;
        $scope.ListaDocentiMailMultipla = Array.from(SystemInformation.DataBetweenController.ListaDocMail);
        $scope.NumeroDestinatari = $scope.ListaDocentiMailMultipla.length;
        SystemInformation.DataBetweenController = {};
    }

    $scope.MailInEditing = {
                             Destinatario : '',
                             Oggetto      : '',
                             Testo        : ''
                           };
    
    if(!$scope.MailMultipla)
        $scope.MailInEditing.Destinatario = SystemInformation.DataBetweenController.DocMail;
  }

  $scope.RimuoviDestinatario = function (Docente) 
  {
    DestinatarioIndex = $scope.ListaDocentiMailMultipla.findIndex(function (ADoc) { return (ADoc.Chiave == Docente.Chiave); })
    $scope.ListaDocentiMailMultipla.splice(DestinatarioIndex, 1);
  }

  $scope.VisualizzaAllegato = function (nomeFile) 
  {
    SystemInformation.HandleMailAttachment('GET', { Nome: nomeFile, Id: $scope.AllegatoId }, function (Answer) 
    {
      try 
      {
        saveAs(Base64AsBlob(Answer.Allegato), nomeFile);
      }
      catch (e) 
      {
        alert(e.message);
      }
    });
  }

  $scope.EliminaAllegato = function (nomeFile, index) 
  {
    SystemInformation.HandleMailAttachment('DEL', { Nome: nomeFile, Id: $scope.AllegatoId }, function () 
    {
      $scope.ListaAllegatiMail.splice(index, 1);
    });
  }

  $scope.AllegatoLoaded = function (fileInfo) 
  {
    var file = fileInfo.files[0];
    if (file) 
    {
     var reader = new FileReader();
     reader.onloadend = function (evt) 
     {
       var AllegatoBody = reader.result.split(",");
       var AllegatoNome = file.name;
       /*$scope.FileLength  = file.size;
       $scope.Contatore   = 0;*/

       for(let i = 0; i < $scope.ListaAllegatiMail.length; i++)
           if(AllegatoNome == $scope.ListaAllegatiMail[i].Nome) 
           {
              var Nome = AllegatoNome.substring(0, AllegatoNome.lastIndexOf("."));
              var Ext = AllegatoNome.split('.').pop();
              AllegatoNome = Nome + '(Copia).' + Ext;
           }

       SystemInformation.HandleMailAttachment('ADD', { Nome: AllegatoNome, Id: $scope.AllegatoId, Body: AllegatoBody[1] }, function () 
       {
         $scope.ListaAllegatiMail.push({ Nome: AllegatoNome });
         document.getElementById('FileLoadAllegato').value = null; 
       })
     }
    }
    reader.readAsDataURL(file);
  }

  $scope.CaricaAllegato = function () 
  {
    document.getElementById('FileLoadAllegato').click();
  }

  $scope.InviaMail = function () 
  {
    if($scope.ListaAllegatiMail.length == 0)
       $scope.AllegatoId = '';

    if (!$scope.MailMultipla) 
    {
       SystemInformation.PostSQL('MailTeacher', 
       {
         Oggetto: $scope.MailInEditing.Oggetto.xSQL(),
         Testo: $scope.MailInEditing.Testo.xSQL(),
         Destinatario: $scope.MailInEditing.Destinatario.xSQL()
       },
       function () 
       {
         $scope.MailInEditing = {};
         ZCustomAlert($mdDialog, 'OK', 'INVIO MAIL ESEGUITO');
         $scope.ResetMailPage();
         $scope.MailOn = false;
       }, true, false, $scope.AllegatoId)
   }
   else 
   {
     $scope.InvioInCorso   = true;
     $scope.ContatoreInvio = 0;
     var SendSingolaMail = function () 
     {
       SystemInformation.PostSQL('MailTeacher',
       {
         Oggetto: $scope.MailInEditing.Oggetto.xSQL(),
         Testo: $scope.MailInEditing.Testo.xSQL(),
         Destinatario: $scope.ListaDocentiMailMultipla[$scope.ContatoreInvio].Email.xSQL()
       },
       function () 
       {
         $scope.ContatoreInvio++;
         if($scope.ContatoreInvio >= $scope.ListaDocentiMailMultipla.length)
         {
            $scope.InvioInCorso = false;
            ZCustomAlert($mdDialog, 'OK', 'INVIO MAIL ESEGUITO');
            SystemInformation.DataBetweenController = {};
            $scope.ResetMailPage();
            $scope.MailOn = false;
         }
         else SendSingolaMail();
       },
       true, false, $scope.AllegatoId)
     }
     SendSingolaMail();
    }
  }

  $scope.OnAnnullaMailClicked = function () 
  {
    $scope.MailInEditing                    = {};
    SystemInformation.DataBetweenController = {};
    $scope.ResetMailPage();
    $scope.MailOn = false;
  }

 }]);

 SIRIOApp.filter('DocenteByFiltro', function () 
 {
   return function (ListaDocenti, ANomeFiltro, MateriaFiltro, CoordMateriaFiltro) 
   {
     if(ANomeFiltro == '' && MateriaFiltro == -1 && CoordMateriaFiltro == false)
        return (ListaDocenti);
     var ListaFiltrata = [];
     ANomeFiltro = ANomeFiltro.toUpperCase();
     MateriaFiltro = parseInt(MateriaFiltro);

     var DocenteOk = function (Docente) 
     {
       var Result = true;

       if(ANomeFiltro != '')
        //if(Docente.RagioneSociale.toUpperCase().indexOf(ANomeFiltro) < 0) //LASCIALO! VOGLIONO CERCARE SEMPRE INIZIANDO DAL COGNOME!
        if(!Docente.RagioneSociale.startsWith(ANomeFiltro))
            Result = false;

       if(MateriaFiltro != -1)
          if(Docente.Materia1 != MateriaFiltro && Docente.Materia2 != MateriaFiltro && Docente.Materia3 != MateriaFiltro)
             Result = false;

       if(CoordMateriaFiltro)
          if(Docente.CoordMateria_1 == -1 && Docente.CoordMateria_2 == -1 && Docente.CoordMateria_3 == -1)
             Result = false;

       return (Result);
     }

     ListaDocenti.forEach(function (Docente) 
     {
      if(DocenteOk(Docente))
         ListaFiltrata.push(Docente)
     });
     return(ListaFiltrata);
   }
 });

 SIRIOApp.filter('IstitutoByNomeFiltro', function () 
 {
   return function (ListaIstitutiPopup, NomeFiltro, CodiceFiltro) 
   {
     if (NomeFiltro == '' && CodiceFiltro == '') return (ListaIstitutiPopup);
     var ListaFiltrataI = [];
     NomeFiltro = NomeFiltro.toUpperCase();
     CodiceFiltro = CodiceFiltro.toUpperCase();
     var IstitutoOK = function (istituto) {
      var Result = true;

      if(NomeFiltro != '')
         if(istituto.Istituto.toUpperCase().indexOf(NomeFiltro) < 0)
            Result = false;

      if(CodiceFiltro != '')
         if(istituto.Codice.toUpperCase().indexOf(CodiceFiltro) < 0)
            Result = false;

      return (Result);
     }

     ListaIstitutiPopup.forEach(function (istituto) 
     {
       if(IstitutoOK(istituto))
          ListaFiltrataI.push(istituto)
     });
     return (ListaFiltrataI);
   }
 });

 SIRIOApp.filter('AdozioneByFiltroDoc', function () 
 {
  return function (IstitutoListaAdozioni, AnnoFiltro, CombinazioneFiltro) 
  {
    if(AnnoFiltro == -1 && CombinazioneFiltro == -1)
       return (IstitutoListaAdozioni);
    var ListaFiltrata = [];

    var AdozioneOk = function (Adozione) 
    {
      var Result = true;

      if(AnnoFiltro != -1)
         if(Adozione.AnnoClasse.toUpperCase().indexOf(AnnoFiltro) < 0)
            Result = false;

      if(CombinazioneFiltro != -1)
         if(Adozione.CombinazioneClasse.toUpperCase().indexOf(CombinazioneFiltro) < 0)
            Result = false;

      return(Result);
    }

   IstitutoListaAdozioni.forEach(function(Adozione) 
   {
     if(AdozioneOk(Adozione))
        ListaFiltrata.push(Adozione)
   });

   return (ListaFiltrata);
  }
});