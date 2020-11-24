SIRIOApp.controller("teacherListPageController",['$scope','SystemInformation','$state','$rootScope','$mdDialog','$sce','$filter','ZConfirm', function($scope,SystemInformation,$state,$rootScope,$mdDialog,$sce,$filter,ZConfirm)
{
  $scope.ListaDocenti                      = [];
  $scope.EditingOn                         = false;
  $scope.DocenteInEditing                  = {};
  $scope.ListaMaterie                      = [];
  $scope.ListaPiattaforme                  = [{Sigla:PIATTA_HUBSCUOLA,Valore:"HubScuola"},{Sigla:PIATTA_BSMART,Valore:"BSmart"},{Sigla:PIATTA_NESSUNA,Valore:"Nessuna Piattaforma"}];
  $scope.GiorniSettimana                   = SystemInformation.GiorniSettimana;
  $scope.IstitutoDaAssociare               = -1;
  $scope.ANomeFiltro                       = '';
  $scope.IstitutoVisualizzato              = -1;
  $scope.ListaInsegnamenti                 = [];
  $scope.TitoloFiltro                      = -1;
  $scope.AProvinciaFiltro                  = -1;
  $scope.IstitutoFiltrato                  = -1;
  $scope.MateriaFiltro                     = -1;
  $scope.ListaIstitutiTitolo               = [];
  $scope.IstitutoMultipla                  = -1;
  $scope.GiorniSettimanaD                  = SystemInformation.GiorniSettimana;
  $scope.DisponibilitaInEditing            = [];
  SystemInformation.DataBetweenController  = [];
  $scope.NomeFiltro                        = '';
  $scope.CoordMateriaFiltro                = false;

  $scope.AbilitaInvioMultiplo              = function()
                                            {
                                              let DocentiFiltrati = $filter('DocenteByFiltro')($scope.ListaDocenti,
                                                                                               $scope.ANomeFiltro,
                                                                                               $scope.MateriaFiltro,
                                                                                               $scope.CoordMateriaFiltro);
                                              return(DocentiFiltrati.length < MAX_N_DESTINATARI_MAIL &&
                                                     DocentiFiltrati.length > 0);
                                           };

  /*$scope.CheckOldMateria  = false;
  $scope.CheckOldTitolo   = false;*/
  $scope.CheckOldIstituto = false;

  ScopeHeaderController.CheckButtons();

  $scope.IsAdministrator = function ()
  {
    return SystemInformation.UserInformation.Ruolo == RUOLO_AMMINISTRATORE;
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
  
  $scope.GridOptions2 = {
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
                        
  $scope.GridOptions3 = {
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
  
  SystemInformation.GetSQL('Subject',{}, function(Results)
  {
    ListaMaterieOpt = SystemInformation.FindResults(Results,'SubjectInfoList');
    if (ListaMaterieOpt != undefined) 
    {
      for(let i = 0; i < ListaMaterieOpt.length; i++)
          ListaMaterieOpt[i] = {
                                 Chiave : ListaMaterieOpt[i].CHIAVE,
                                 Nome   : ListaMaterieOpt[i].DESCRIZIONE
                               }
      $scope.ListaMaterie  = ListaMaterieOpt;
    }
    else SystemInformation.ApplyOnError('Modello materie non conforme','');     
  });   

  SystemInformation.GetSQL('Institute', {}, function(Results)  
  { 
    var ListaIstitutiAssegnati = [];  
    IstitutiInfoLista = SystemInformation.FindResults(Results,'InstituteInfoList');
    if(IstitutiInfoLista != undefined)
    {      
       for(let i = 0; i < IstitutiInfoLista.length; i++)
       {
           if(IstitutiInfoLista[i].NR_DOCENTI > 0)
              ListaIstitutiAssegnati.push({
                                            Chiave   : IstitutiInfoLista[i].CHIAVE,
                                            Istituto : IstitutiInfoLista[i].NOME
                                          });
       
           IstitutiInfoLista[i] = { 
                                    Chiave   : IstitutiInfoLista[i].CHIAVE,
                                    Istituto : IstitutiInfoLista[i].NOME
                                  }
       }
       $scope.ListaIstituti         = ListaIstitutiAssegnati;
       $scope.ListaIstitutiNoFilter = Array.from(ListaIstitutiAssegnati);       
       //$scope.ListaIstitutiPopup    = IstitutiInfoLista;
    }
    else SystemInformation.ApplyOnError('Modello istituti non conforme','');   
  });

  SystemInformation.GetSQL('Institute', {}, function(Results)  
  { 
    IstitutiInfoListaP = SystemInformation.FindResults(Results,'InstituteInfoListOnlyVisibile');
    if(IstitutiInfoListaP != undefined)
    {      
       for(let i = 0; i < IstitutiInfoListaP.length; i++)     
           IstitutiInfoListaP[i] = { 
                                    Chiave   : IstitutiInfoListaP[i].CHIAVE,
                                    Istituto : IstitutiInfoListaP[i].NOME
                                  }    
       $scope.ListaIstitutiPopup = IstitutiInfoListaP;
    }
    else SystemInformation.ApplyOnError('Modello istituti non conforme','');   
  },'SelectSQLOnlyVisible');
  
  SystemInformation.GetSQL('Accessories',{}, function(Results)
  {
    ListaProvinceTmp    = SystemInformation.FindResults(Results,'ProvinceList');
    if (ListaProvinceTmp != undefined) 
    {
      for(let i = 0; i < ListaProvinceTmp.length; i++)
          ListaProvinceTmp[i] = {
                                  Chiave : ListaProvinceTmp[i].CHIAVE,
                                  Nome   : ListaProvinceTmp[i].NOME
                                }
      $scope.ListaProvinceF = ListaProvinceTmp;
    }
    else SystemInformation.ApplyOnError('Modello province non conforme','');

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
  
  SystemInformation.GetSQL('Book', {}, function(Results)  
  {  
    TitoliInfoLista = SystemInformation.FindResults(Results,'BookListNoFilter');
    if(TitoliInfoLista != undefined)
    { 
       for(let i = 0; i < TitoliInfoLista.length; i++)
           TitoliInfoLista[i] = { 
                                  Chiave : TitoliInfoLista[i].CHIAVE,
                                  Nome   : TitoliInfoLista[i].TITOLO,
                                  Codice : TitoliInfoLista[i].CODICE_ISBN
                                }
       $scope.ListaTitoliF = TitoliInfoLista;
       $scope.ListaTitoli  = TitoliInfoLista;
    }
    else SystemInformation.ApplyOnError('Modello titoli non conforme','');   
  },'SelectSQLNoFilter');
  
  $scope.queryMateria = function(searchTextMat)
  {
     searchTextMat = searchTextMat.toUpperCase();
     return($scope.ListaMaterie.grep(function(Elemento) 
     { 
       return(Elemento.Nome.toUpperCase().indexOf(searchTextMat) != -1);
     }));
  }
  
  $scope.selectedItemChangeMateria = function(itemMat)
  {
    if(itemMat != undefined)
    {
       $scope.MateriaFiltro        = itemMat.Chiave
       /*$scope.OldMateriaFiltro     = itemMat.Chiave
       $scope.OldMateriaNome       = itemMat.Nome;
       $scope.CheckOldMateria      = true;*/
    }
    else $scope.MateriaFiltro = -1;
  }

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
      $scope.TitoloFiltro        = itemTit.Chiave;
      /*$scope.OldTitoloFiltro     = itemTit.Chiave;
      $scope.OldTitoloNome       = itemTit.Nome
      $scope.CheckOldTitolo      = true*/
    }
    else
    {
      $scope.TitoloFiltro  = -1;
      $scope.ListaIstituti = $scope.ListaIstitutiNoFilter;
    } 
    $scope.RefreshListaDocenti();
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
    {
      $scope.IstitutoFiltrato     = itemIstituto.Chiave;
      $scope.IstitutoFiltratoNome = itemIstituto.Istituto;
      $scope.OldIstitutoFiltro    = itemIstituto.Chiave;
      $scope.OldIstitutoNome      = itemIstituto.Istituto;
      $scope.CheckOldIstituto     = true;
    }
    else $scope.IstitutoFiltrato = -1;
    $scope.RefreshListaDocenti();
  }

  $scope.GetMaterieDoc = function(Docente)
  {
     var Result = '';
     if(Docente.DescrMateria1 == '' && Docente.DescrMateria2 == '' && Docente.DescrMateria3 == '') Result = 'NESSUNA MATERIA';
     else
     {
       if (Docente.DescrMateria1 != '')
          Result += Docente.DescrMateria1 + '</br>';
       if (Docente.DescrMateria2 != '')            
          Result += Docente.DescrMateria2 + '</br>'
       if (Docente.DescrMateria3 != '')            
          Result += Docente.DescrMateria3
     }             
     return($sce.trustAsHtml(Result.substr(0,Result.length)));
  }
  
  $scope.RefreshListaDocenti = function ()
  {
    $scope.GridOptions.query.page = 1;
    var RicercaPerTitolo = false;
    var ObjParametri     = {};

    if($scope.AProvinciaFiltro != -1)
        ObjParametri.FiltroP = $scope.AProvinciaFiltro;
    if($scope.IstitutoFiltrato != -1)
    {
       ObjParametri.FiltroI      = $scope.IstitutoFiltrato;
       $scope.RicercaPerIstituto = true;
       $scope.IstitutoMultipla   = $scope.IstitutoFiltrato;
    }

    if($scope.TitoloFiltro != -1)
    {
       ObjParametri.FiltroT = $scope.TitoloFiltro;
       RicercaPerTitolo     = true;
    }
    else $scope.ListaIstitutiTitolo = [];
    
    SystemInformation.GetSQL('Teacher', ObjParametri, function(Results)  
    {
      DocentiInfoLista = SystemInformation.FindResults(Results,'TeacherInfoList');
      if(DocentiInfoLista != undefined)
      {
        for(let i = 0; i < DocentiInfoLista.length; i++)
        {
          DocentiInfoLista[i] = { 
                                  Chiave              : DocentiInfoLista[i].CHIAVE,
                                  RagioneSociale      : DocentiInfoLista[i].RAGIONE_SOCIALE,
                                  Materia1            : DocentiInfoLista[i].MATERIA_1      == null ? -1 : DocentiInfoLista[i].MATERIA_1,
                                  DescrMateria1       : DocentiInfoLista[i].NOME_MATERIA1  == null ? '' : DocentiInfoLista[i].NOME_MATERIA1,
                                  Materia2            : DocentiInfoLista[i].MATERIA_2      == null ? -1 : DocentiInfoLista[i].MATERIA_2,
                                  DescrMateria2       : DocentiInfoLista[i].NOME_MATERIA2  == null ? '' : DocentiInfoLista[i].NOME_MATERIA2,
                                  Materia3            : DocentiInfoLista[i].MATERIA_3      == null ? -1 : DocentiInfoLista[i].MATERIA_3,
                                  DescrMateria3       : DocentiInfoLista[i].NOME_MATERIA3  == null ? '' : DocentiInfoLista[i].NOME_MATERIA3,
                                  Titolo              : DocentiInfoLista[i].TITOLO         == null ? '' : DocentiInfoLista[i].TITOLO,
                                  Indirizzo           : DocentiInfoLista[i].INDIRIZZO      == null ? '' : DocentiInfoLista[i].INDIRIZZO,
                                  Comune              : DocentiInfoLista[i].COMUNE         == null ? '' : DocentiInfoLista[i].COMUNE,
                                  Cap                 : DocentiInfoLista[i].CAP            == null ? '' : DocentiInfoLista[i].CAP,
                                  Provincia           : DocentiInfoLista[i].PROVINCIA      == null ? 0  : DocentiInfoLista[i].PROVINCIA,
                                  ProvinciaNome       : DocentiInfoLista[i].PROVINCIA_NOME == null ? '' : DocentiInfoLista[i].PROVINCIA_NOME,
                                  Email               : DocentiInfoLista[i].EMAIL          == undefined || DocentiInfoLista[i].EMAIL == '' ? 'Non disponibile' : DocentiInfoLista[i].EMAIL,
                                  CoordMateria_1      : DocentiInfoLista[i].COORD_MATERIA_1 == undefined ? -1 : DocentiInfoLista[i].COORD_MATERIA_1,
                                  CoordMateria_2      : DocentiInfoLista[i].COORD_MATERIA_2 == undefined ? -1 : DocentiInfoLista[i].COORD_MATERIA_2,
                                  CoordMateria_3      : DocentiInfoLista[i].COORD_MATERIA_3 == undefined ? -1 : DocentiInfoLista[i].COORD_MATERIA_3,
                                  SpedizioniAssegnate : parseInt(DocentiInfoLista[i].NR_SPEDIZIONI)
                                };
        }
        $scope.ListaDocenti = DocentiInfoLista;
       
        if (RicercaPerTitolo)
        {
          var ListaIstitutiTitoloTmp = [];
          SystemInformation.GetSQL('Book', { FiltroT : ObjParametri.FiltroT}, function(Results)
          {
            ListaIstitutiTitoloTmp = SystemInformation.FindResults(Results,'InstituteForBook');
            if(ListaIstitutiTitoloTmp != undefined)
            {
               for(let i = 0; i < ListaIstitutiTitoloTmp.length;i ++)
               {
                   ListaIstitutiTitoloTmp[i] = {
                                                 Chiave   : ListaIstitutiTitoloTmp[i].CHIAVE,
                                                 Istituto : ListaIstitutiTitoloTmp[i] == null ? 'N.D.' : ListaIstitutiTitoloTmp[i].NOME.toUpperCase()
                                               }
               }
               $scope.ListaIstituti = ListaIstitutiTitoloTmp;
               
            }
            else SystemInformation.ApplyOnError('Modello istituti per titolo filtrato non conforme','')
          },'SelectInstituteList')
        }
      }
      else SystemInformation.ApplyOnError('Modello docente non conforme','');   
    });
  }
  
  $scope.InvioMail = function (Docente)
  {
    SystemInformation.DataBetweenController.DocMail = Docente.Email;
    $state.go('mailPage');
  }

  $scope.InvioMultiploMail = function (Nome)
  {
    var ContatoreMailValide = 0;
    var ListaMailFiltrata = $filter('DocenteByFiltro')($scope.ListaDocenti,Nome,$scope.MateriaFiltro,$scope.CoordMateriaFiltro);
    SystemInformation.DataBetweenController  = { ListaDocMail : []};
    
    if(ListaMailFiltrata.length >= MAX_N_DESTINATARI_MAIL)
    {
       ZCustomAlert($mdDialog,'ATTENZIONE!',"IMPOSSIBILE SPEDIRE UNA MAIL MULTIPLA A PIU' DI " + MAX_N_DESTINATARI_MAIL.toString() + " DESTINATARI");
       return
    }

    if(ListaMailFiltrata.length != 0)
    {
       for(let i = 0;i < ListaMailFiltrata.length; i ++)
       {
           if(ListaMailFiltrata[i].Email != 'Non disponibile')
              if(ListaMailFiltrata[i].Email.includes('@'))
              {
                 SystemInformation.DataBetweenController.ListaDocMail.push(ListaMailFiltrata[i].Email);
                 ContatoreMailValide ++; 
              }
       }
       
       if(ContatoreMailValide == 0)
       {
          ZCustomAlert($mdDialog,'ATTENZIONE',"NESSUN INDIRIZZO EMAIL TRA I DOCENTI SELEZIONATI PUO' ESSERE INCLUSO COME DESTINATARIO");
          return
       }
       else
       {
          SystemInformation.DataBetweenController.MailMultipla = true;
          SystemInformation.DataBetweenController.Provenienza  = 'TeacherPage';
          $state.go("mailPage");
       }
     }
     else
     {
       ZCustomAlert($mdDialog,'ATTENZIONE',"NESSUN DOCENTE SELEZIONATO PER L'INVIO DELLA MAIL");
       return
     }
  }
  
  $scope.NuovaSpedizioneMultipla = function (Nome)
  {
    var ListaFiltrata = $filter('DocenteByFiltro')($scope.ListaDocenti,Nome,$scope.MateriaFiltro,$scope.CoordMateriaFiltro);
    SystemInformation.DataBetweenController  = { ListaDocSped : []};

    if(ListaFiltrata.length == 0)
    {
      ZCustomAlert($mdDialog,'ATTENZIONE',"NESSUN DOCENTE SELEZIONATO PER LA SPEDIZIONE")
      return
    }
       
    
    for(let i = 0; i < ListaFiltrata.length; i ++)
    {
        var Docente = {
                        "ChiaveDocente"        : ListaFiltrata[i].Chiave,
                        "NomeDocente"          : ListaFiltrata[i].RagioneSociale,
                        "TitoloDocente"        : ListaFiltrata[i].Titolo,
                        "IndirizzoDocente"     : ListaFiltrata[i].Indirizzo,
                        "ComuneDocente"        : ListaFiltrata[i].Comune,
                        "CapDocente"           : ListaFiltrata[i].Cap,
                        "ProvinciaDocente"     : ListaFiltrata[i].Provincia,
                        "ProvinciaDocenteNome" : ListaFiltrata[i].ProvinciaNome                                              
                      }
        SystemInformation.DataBetweenController.ListaDocSped.push(Docente);
    }
    
    SystemInformation.DataBetweenController.IstitutoPerIndirizzo = $scope.IstitutoMultipla;
    SystemInformation.DataBetweenController.SpedizioneMultipla   = true;
    SystemInformation.DataBetweenController.Provenienza          = 'TeacherPage';
    $scope.RicercaPerIstituto = false;  
    $state.go("deliveryModDetailPage");
  }
  
  $scope.GetOrariSelected = function(Istituto)
  {
      if($scope.DocenteInEditing.ListaIstitutiDoc != undefined)
         for(let i = 0; i < $scope.DocenteInEditing.ListaIstitutiDoc.length;i++)
             if($scope.DocenteInEditing.ListaIstitutiDoc[i].CHIAVE == Istituto)
                return($scope.DocenteInEditing.ListaIstitutiDoc[i].Orari); 
      return([]);
  }
  
  $scope.ImpostaDisponibilita = function (Istituto)
  {
    if($scope.DocenteInEditing.ListaIstitutiDoc != undefined)
       for(let i = 0;i < $scope.DocenteInEditing.ListaIstitutiDoc.length;i ++)
           if($scope.DocenteInEditing.ListaIstitutiDoc[i].CHIAVE == Istituto)
           {
              $scope.DisponibilitaInEditing = $scope.DocenteInEditing.ListaIstitutiDoc[i].Disponibilita;        
              break;
           }
  }
  
  $scope.ModificaDocente = function(docente)
  {
    $scope.ProvinciaOldFiltro                         = $scope.AProvinciaFiltro;
    $scope.NomeOldFiltro                              = $scope.ANomeFiltro;
    $scope.EditingOn                                  = true;   
    $scope.DocenteInEditing                           = {};
    $scope.DocenteInEditing.ListaIstitutiDocEliminati = [];
    $scope.DocenteInEditing.ListaOrariEliminati       = [];
    $scope.ListaMaterieDoc                            = [];
    $scope.IstitutoVisualizzato      = -1;
    /*$scope.IstitutoForNewDocente     = -1;
    $scope.IstitutoForNewDocenteNome = '';
    if($scope.IstitutoFiltrato != -1)
    {
       $scope.IstitutoForNewDocente     = $scope.IstitutoFiltrato;
       $scope.IstitutoForNewDocenteNome = $scope.IstitutoFiltratoNome;
    }*/   
    SystemInformation.GetSQL('Teacher', {CHIAVE : docente.Chiave}, function(Results)
    {
      DocenteDettaglio    = SystemInformation.FindResults(Results,'TeacherDettaglio');
      Istituti            = SystemInformation.FindResults(Results,'TeacherInstitute');
      OrariAll            = SystemInformation.FindResults(Results,'TeacherLesson');
      DisponibilitaAll    = SystemInformation.FindResults(Results,'TeacherAvailability');

      if(DocenteDettaglio != undefined && Istituti != undefined && OrariAll != undefined && DisponibilitaAll != undefined)
      {
        DocenteDettaglio[0].COORD_MATERIA_1 == undefined ? "-2" : DocenteDettaglio[0].COORD_MATERIA_1;
        DocenteDettaglio[0].COORD_MATERIA_2 == undefined ? "-2" : DocenteDettaglio[0].COORD_MATERIA_2;
        DocenteDettaglio[0].COORD_MATERIA_3 == undefined ? "-2" : DocenteDettaglio[0].COORD_MATERIA_3;
       
        $scope.DocenteInEditing.Chiave           = DocenteDettaglio[0].CHIAVE;
        $scope.DocenteInEditing.RagioneSociale   = DocenteDettaglio[0].RAGIONE_SOCIALE;
        $scope.DocenteInEditing.Titolo           = DocenteDettaglio[0].TITOLO;
        $scope.DocenteInEditing.NumeroTelefono_1 = DocenteDettaglio[0].TEL_PRIMO;
        $scope.DocenteInEditing.NumeroTelefono_2 = DocenteDettaglio[0].TEL_SECONDO;
        $scope.DocenteInEditing.NumeroTelefono_3 = DocenteDettaglio[0].TEL_TERZO;
        $scope.DocenteInEditing.Email            = DocenteDettaglio[0].EMAIL;
        $scope.DocenteInEditing.EmailSecondaria  = DocenteDettaglio[0].EMAIL_2;
        $scope.DocenteInEditing.Materia_1        = DocenteDettaglio[0].MATERIA_1 == undefined ? -1 : DocenteDettaglio[0].MATERIA_1;
        $scope.DocenteInEditing.Materia_2        = DocenteDettaglio[0].MATERIA_2 == undefined ? -1 : DocenteDettaglio[0].MATERIA_2;
        $scope.DocenteInEditing.Materia_3        = DocenteDettaglio[0].MATERIA_3 == undefined ? -1 : DocenteDettaglio[0].MATERIA_3;
        $scope.DocenteInEditing.CoordMateria_1   = DocenteDettaglio[0].COORD_MATERIA_1 == DocenteDettaglio[0].MATERIA_1 ? true : false;
        $scope.DocenteInEditing.CoordMateria_2   = DocenteDettaglio[0].COORD_MATERIA_2 == DocenteDettaglio[0].MATERIA_2 ? true : false; 
        $scope.DocenteInEditing.CoordMateria_3   = DocenteDettaglio[0].COORD_MATERIA_3 == DocenteDettaglio[0].MATERIA_3 ? true : false;   
        $scope.DocenteInEditing.Piattaforma      = DocenteDettaglio[0].PIATTAFORMA;
        $scope.DocenteInEditing.Indirizzo        = DocenteDettaglio[0].INDIRIZZO;
        $scope.DocenteInEditing.Comune           = DocenteDettaglio[0].COMUNE;
        $scope.DocenteInEditing.Cap              = DocenteDettaglio[0].CAP;
        $scope.DocenteInEditing.Provincia        = DocenteDettaglio[0].PROVINCIA == undefined ? -1 : DocenteDettaglio[0].PROVINCIA;
        $scope.DocenteInEditing.Note             = DocenteDettaglio[0].NOTE;
        $scope.DocenteInEditing.ListaIstitutiDoc = Istituti;       
        $scope.DocenteInEditing.ListaIstitutiDoc.forEach(function(Istituto){Istituto.Orari = [],Istituto.Disponibilita = GetArrayDisponibilitaVuoto()});       
        
        for (let i = 0; i < $scope.DocenteInEditing.ListaIstitutiDoc.length;i ++)
        {
          $scope.DocenteInEditing.ListaIstitutiDoc[i].PROVINCIA_LISTA_ALL == undefined ? -1 : $scope.DocenteInEditing.ListaIstitutiDoc[i].PROVINCIA_LISTA_ALL;
          for (let j = 0; j < OrariAll.length;j ++)
          {
               if (OrariAll[j].ISTITUTO == $scope.DocenteInEditing.ListaIstitutiDoc[i].CHIAVE)
                   $scope.DocenteInEditing.ListaIstitutiDoc[i].Orari.push(OrariAll[j]);
          }
          for (let k = 0; k < DisponibilitaAll.length;k ++)
          {
            if (DisponibilitaAll[k].ISTITUTO == $scope.DocenteInEditing.ListaIstitutiDoc[i].CHIAVE)
                $scope.DocenteInEditing.ListaIstitutiDoc[i].Disponibilita[DisponibilitaAll[k].GIORNO][DisponibilitaAll[k].POSIZIONE] = 
                                  { DA : (DisponibilitaAll[k].DA == undefined ? undefined : ZDateFromHTMLInput('1970-01-01',DisponibilitaAll[k].DA)), 
                                     A : (DisponibilitaAll[k].A == undefined ? undefined :  ZDateFromHTMLInput('1970-01-01',DisponibilitaAll[k].A)) };
          }
        }
        if($scope.DocenteInEditing.ListaIstitutiDoc.length != 0)
           $scope.DisponibilitaInEditing = $scope.DocenteInEditing.ListaIstitutiDoc[0].Disponibilita; 
                
        if (DocenteDettaglio[0].MATERIA_1 != undefined)
        {
          let Materia = {"Chiave" : DocenteDettaglio[0].MATERIA_1, "MateriaNome" : DocenteDettaglio[0].NOME_MATERIA1}
          $scope.ListaMaterieDoc.push(Materia);
        }
        if (DocenteDettaglio[0].MATERIA_2 != undefined)
        {
          let Materia = {"Chiave" : DocenteDettaglio[0].MATERIA_2, "MateriaNome" : DocenteDettaglio[0].NOME_MATERIA2}
          $scope.ListaMaterieDoc.push(Materia);
        }
        if (DocenteDettaglio[0].MATERIA_3 != undefined)
        {
          let Materia = {"Chiave" : DocenteDettaglio[0].MATERIA_3, "MateriaNome" : DocenteDettaglio[0].NOME_MATERIA3}
          $scope.ListaMaterieDoc.push(Materia);
        }        
        
        for (let i = 0; i < $scope.DocenteInEditing.ListaIstitutiDoc.length;i ++)
          for (let j = 0; j < $scope.DocenteInEditing.ListaIstitutiDoc[i].Orari.length;j ++)
          {
               $scope.DocenteInEditing.ListaIstitutiDoc[i].Orari[j].Nuovo      = false;
               $scope.DocenteInEditing.ListaIstitutiDoc[i].Orari[j].Modificato = false;
               $scope.DocenteInEditing.ListaIstitutiDoc[i].Orari[j].Eliminato  = false;
               
               MateriaCorrispondente = $scope.ListaMaterieDoc.find(function(AMateria){return(AMateria.Chiave == $scope.DocenteInEditing.ListaIstitutiDoc[i].Orari[j].MATERIA);});               
               $scope.DocenteInEditing.ListaIstitutiDoc[i].Orari[j].MateriaNome = MateriaCorrispondente.MateriaNome;
                              
               $scope.DocenteInEditing.ListaIstitutiDoc[i].Orari[j].ClasseNome = $scope.DocenteInEditing.ListaIstitutiDoc[i].Orari[j].ANNO + $scope.DocenteInEditing.ListaIstitutiDoc[i].Orari[j].SEZIONE + ' - ' + $scope.DocenteInEditing.ListaIstitutiDoc[i].Orari[j].COMBINAZIONE;
          }               
        
        if($scope.DocenteInEditing.ListaIstitutiDoc.length > 0) 
           $scope.IstitutoVisualizzato = $scope.DocenteInEditing.ListaIstitutiDoc[0].CHIAVE       
      }       
      else SystemInformation.ApplyOnError('Modello docente non conforme','');      
    },'SQLDettaglio');    
  }
  
  var GetArrayDisponibilitaVuoto = function()
  {
    var Result = [];
    for(let i = 0; i < 7; i++)
    {
        Result.push([{DA : "", A : ""},{DA : "", A : ""},{DA : "", A : ""}]);
    }
    return Result;
  } 
    
  $scope.NuovoDocente = function()
  { 
    $scope.ProvinciaOldFiltro        = $scope.AProvinciaFiltro;
    $scope.EditingOn                 = true;
    //$scope.IstitutoForNewDocente     = -1;
    //$scope.IstitutoForNewDocenteNome = '';
    $scope.DocenteInEditing = {
                                Chiave           : -1,
                                RagioneSociale   : '',
                                Titolo           : 'Egr.Prof.',
                                NumeroTelefono_1 : '',
                                NumeroTelefono_2 : '',
                                NumeroTelefono_3 : '',
                                Email            : '',
                                EmailSecondaria  : '',
                                Materia_1        : -1,
                                Materia_2        : -1,
                                Materia_3        : -1,
                                CoordMateria_1   : false,
                                CoordMateria_2   : false,
                                CoordMateria_3   : false,
                                Piattaforma      : '',
                                Indirizzo        : '',
                                Comune           : '',
                                Cap              : '',
                                Provincia        : -1,
                                Note             : '',
                                ListaIstitutiDoc : []
                              };
    $scope.DisponibilitaInEditing = GetArrayDisponibilitaVuoto();
    /*if($scope.IstitutoFiltrato != -1)
    {
       $scope.IstitutoForNewDocente     = $scope.IstitutoFiltrato;
       $scope.IstitutoForNewDocenteNome = $scope.IstitutoFiltratoNome;
    }*/
    
    SystemInformation.GetSQL('Teacher',{},function(Results)
    {
      $scope.ListaDocToTransfer = [];
      ListaDocentiForTransfer   = SystemInformation.FindResults(Results,'TeacherSmallList');
      ListaIstitutiForTransfer  = SystemInformation.FindResults(Results,'TeacherForInstitute');
      if(ListaDocentiForTransfer != undefined && ListaIstitutiForTransfer != undefined)
      {
        for(let i = 0;i < ListaDocentiForTransfer.length;i ++)
        {
            ListaDocentiForTransfer[i] = {ChiaveDoc : ListaDocentiForTransfer[i].CHIAVE, NomeDoc : ListaDocentiForTransfer[i].RAGIONE_SOCIALE, ListaIstDoc : [],ListaIstDocChiavi : []}
            for(let j = 0;j < ListaIstitutiForTransfer.length;j ++)
                if(ListaIstitutiForTransfer[j].DOCENTE == ListaDocentiForTransfer[i].ChiaveDoc)
                {
                   ListaDocentiForTransfer[i].ListaIstDoc.push(ListaIstitutiForTransfer[j].NOME_ISTITUTO);
                   ListaDocentiForTransfer[i].ListaIstDocChiavi.push(ListaIstitutiForTransfer[j].ISTITUTO);   //({ChiaveIst : ListaIstitutiForTransfer[j].ISTITUTO, NomeIst : ListaIstitutiForTransfer[j].NOME_ISTITUTO})
                }                       
            $scope.ListaDocToTransfer.push(ListaDocentiForTransfer[i])              
        }
                
        $scope.queryDoc = function(searchTextDoc)
        {
           $scope.DocenteInEditing.RagioneSociale = searchTextDoc;
           searchTextDoc = searchTextDoc.toUpperCase();
           return($scope.ListaDocToTransfer.grep(function(Elemento) 
           { 
             return(Elemento.NomeDoc.toUpperCase().indexOf(searchTextDoc) != -1);
           }));
        }
        
        $scope.selectedItemChangeDoc = function(itemDoc)
        {
          if(itemDoc != undefined)
          {
            if($scope.OldIstitutoFiltro != -1)
            {
              var AssociaAnotherDoc = function()
              {
                 var GiaAssociato = false;
                 for(let i = 0;i < itemDoc.ListaIstDocChiavi.length;i ++)
                 {   
                     if(itemDoc.ListaIstDocChiavi[i] == $scope.OldIstitutoFiltro)
                     {
                        GiaAssociato = true;
                        ZCustomAlert($mdDialog,'ATTENZIONE!',"DOCENTE GIA' ASSOCIATO ALL'INDIRIZZO SELEZIONATO!")
                     }
                  }
                  
                  if(!GiaAssociato)
                  {
                    $ObjQuery = {Operazioni : []};
                    $ObjQuery.Operazioni.push({
                                                Query     : "InsertInstituteTeacher",
                                                Parametri : {
                                                              DOCENTE  : itemDoc.ChiaveDoc,
                                                              ISTITUTO : $scope.OldIstitutoFiltro
                                                            }
                                              })
                    SystemInformation.PostSQL('Teacher',$ObjQuery,function(Answer)
                    {
                      ZCustomAlert($mdDialog,'OK',"DOCENTE ASSOCIATO CORRETTAMENTE ALL'ISTITUTO DESIDERATO")
                      $ObjQuery = {};
                      $scope.searchTextDoc = '';
                      $scope.DocenteInEditing.RagioneSociale = ''
                    })
                  }  
                }
              
                var NonAssociarlo = function()
                {
                  $scope.DocenteInEditing.RagioneSociale = itemDoc.NomeDoc
                }
                ZConfirm.GetConfirmBox('AVVISO',"QUESTO DOCENTE E' ASSEGNATO AI SEGUENTI ISTITUTI: " + itemDoc.ListaIstDoc.toString() + ".\nVUOI ASSEGNARLO ALL'ISTITUTO >> " + $scope.OldIstitutoNome + " << ?",AssociaAnotherDoc,NonAssociarlo);      
            }            
          }
        }  
      }
      else SystemInformation.ApplyOnError('Modello docenti e relativi istituti non conforme')
    },'SelectTeacherTransfer')
  }
  
  $scope.OnAnnullaDocenteClicked = function()
  {
    $scope.AProvinciaFiltro = $scope.ProvinciaOldFiltro;
    
    /*if($scope.CheckOldMateria)
    {
       $scope.MateriaFiltro = $scope.OldMateriaFiltro;
       $scope.searchTextMat = $scope.OldMateriaNome;
    }
    if($scope.CheckOldTitolo)
    {
       $scope.TitoloFiltro  = $scope.OldTitoloFiltro;
       $scope.searchTextTit = $scope.OldTitoloNome;
    }*/
    if($scope.CheckOldIstituto)
    {
       $scope.IstitutoFiltro     = $scope.OldIstitutoFiltro;
       $scope.searchTextIstituto = $scope.OldIstitutoNome;
    }
    $scope.EditingOn = false;
    $scope.RefreshListaDocenti();
    //if($scope.IstitutoForNewDocente != -1)
       //$scope.searchTextIstituto = $scope.IstitutoForNewDocenteNome;
  }
  
  $scope.SetAsIndirizzoDocente = function (ChiaveIst)
  {
    DatiIstituto = $scope.DocenteInEditing.ListaIstitutiDoc.find(function(AIstituto){return(AIstituto.CHIAVE == ChiaveIst);});
    var ImpostaIndirizzo = function()
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
          
          if(StringaDatiMancanti != '')
          {
            ZCustomAlert($mdDialog,'ATTENZIONE','DATI ISTITUTO MANCANTI (' + StringaDatiMancanti + ') IMPOSSIBILE IMPOSTARE COME INDIRIZZO PREDEFINITO DEL DOCENTE!');
            return
          }
          else ZCustomAlert($mdDialog,'OK',"INDIRIZZO DELL'ISTITUTO IMPOSTATO COME PREDEFINITO")
       }
       else
       {
          $scope.DocenteInEditing.Indirizzo = DatiIstituto.INDIRIZZO;
          $scope.DocenteInEditing.Comune    = DatiIstituto.COMUNE;
          $scope.DocenteInEditing.Cap       = DatiIstituto.CAP;
          $scope.DocenteInEditing.Provincia = DatiIstituto.PROVINCIA_LISTA_ALL;
          DatiIstituto = {};
       }
    }
    ZConfirm.GetConfirmBox('AVVISO',"Impostare l'indirizzo dell'istituto " + DatiIstituto.ISTITUTO + " come indirizzo del docente?",ImpostaIndirizzo,function(){});      

  }
  
  $scope.ConfermaDocente = function()
  {
    if($scope.DocenteInEditing.RagioneSociale == '')
    {
       alert('Nome del docente mancante!');
       return;
    }
    var $ObjQuery    = { Operazioni : [] }; 
    $scope.DocenteInEditing.RagioneSociale = $scope.DocenteInEditing.RagioneSociale.toUpperCase(); 
    var ParamDocente = {
                         CHIAVE          : $scope.DocenteInEditing.Chiave,
                         RAGIONE_SOCIALE : $scope.DocenteInEditing.RagioneSociale == undefined ? '' : $scope.DocenteInEditing.RagioneSociale.xSQL(),
                         TITOLO          : $scope.DocenteInEditing.Titolo == undefined ? '' :  $scope.DocenteInEditing.Titolo.xSQL(),
                         TEL_PRIMO       : $scope.DocenteInEditing.NumeroTelefono_1 == undefined ? '' : $scope.DocenteInEditing.NumeroTelefono_1.xSQL(),
                         TEL_SECONDO     : $scope.DocenteInEditing.NumeroTelefono_2 == undefined ? '' : $scope.DocenteInEditing.NumeroTelefono_2.xSQL(),
                         TEL_TERZO       : $scope.DocenteInEditing.NumeroTelefono_3 == undefined ? '' : $scope.DocenteInEditing.NumeroTelefono_3.xSQL(),
                         EMAIL           : $scope.DocenteInEditing.Email == undefined ? '' : $scope.DocenteInEditing.Email.xSQL(),
                         EMAIL_2         : $scope.DocenteInEditing.EmailSecondaria == undefined ? '' : $scope.DocenteInEditing.EmailSecondaria.xSQL(),
                         MATERIA_1       : $scope.DocenteInEditing.Materia_1 == -1 ? null : $scope.DocenteInEditing.Materia_1,
                         MATERIA_2       : $scope.DocenteInEditing.Materia_2 == -1 ? null : $scope.DocenteInEditing.Materia_2,
                         MATERIA_3       : $scope.DocenteInEditing.Materia_3 == -1 ? null : $scope.DocenteInEditing.Materia_3,
                         COORD_MATERIA_1 : ($scope.DocenteInEditing.CoordMateria_1 == true && $scope.DocenteInEditing.Materia_1 != null) ? $scope.DocenteInEditing.Materia_1 : null,
                         COORD_MATERIA_2 : ($scope.DocenteInEditing.CoordMateria_2 == true && $scope.DocenteInEditing.Materia_2 != null) ? $scope.DocenteInEditing.Materia_2 : null,
                         COORD_MATERIA_3 : ($scope.DocenteInEditing.CoordMateria_3 == true && $scope.DocenteInEditing.Materia_3 != null) ? $scope.DocenteInEditing.Materia_3 : null, 
                         PIATTAFORMA     : $scope.DocenteInEditing.Piattaforma.xSQL(),
                         INDIRIZZO       : $scope.DocenteInEditing.Indirizzo == undefined ? '' : $scope.DocenteInEditing.Indirizzo.xSQL(),
                         COMUNE          : $scope.DocenteInEditing.Comune == undefined? '' : $scope.DocenteInEditing.Comune.xSQL(),
                         CAP             : $scope.DocenteInEditing.Cap == undefined ? '' : $scope.DocenteInEditing.Cap.xSQL(),
                         PROVINCIA       : $scope.DocenteInEditing.Provincia == -1 ? null : $scope.DocenteInEditing.Provincia,
                         NOTE            : $scope.DocenteInEditing.Note == undefined ? '' : $scope.DocenteInEditing.Note.xSQL()  
                       }
                    
    var NuovoDocente = ($scope.DocenteInEditing.Chiave == -1);
    if(NuovoDocente)     
    {           
      $ObjQuery.Operazioni.push({
                                  Query     : 'InsertTeacher',
                                  Parametri : ParamDocente
                                }); 
    }
    else
    {
      $ObjQuery.Operazioni.push({
                                  Query     : 'UpdateTeacher',
                                  Parametri : ParamDocente
                                });
    };
    
    if (!NuovoDocente && $scope.DocenteInEditing.ListaIstitutiDocEliminati.length != 0)
    {
       for(let j = 0; j < $scope.DocenteInEditing.ListaIstitutiDocEliminati.length ;j ++)
       {
         var ParamIstitutoDoc = {
                                  DOCENTE  : $scope.DocenteInEditing.Chiave,
                                  ISTITUTO : $scope.DocenteInEditing.ListaIstitutiDocEliminati[j].CHIAVE
                                }
         if ($scope.DocenteInEditing.ListaIstitutiDocEliminati[j].Eliminato)
         {
           $ObjQuery.Operazioni.push({
                                       Query     : 'DeleteAvailabilityAfterDeleteInstitute',
                                       Parametri : ParamIstitutoDoc
                                     }); 
           
           $ObjQuery.Operazioni.push({
                                       Query     : 'DeleteLessonAfterDeleteInstitute',
                                       Parametri : ParamIstitutoDoc
                                     });            
           
           $ObjQuery.Operazioni.push({
                                       Query     : 'DeleteInstituteTeacher',
                                       Parametri : ParamIstitutoDoc
                                     });
         }
       }
       SystemInformation.PostSQL('Teacher',$ObjQuery,function(Answer)
       {
         $scope.DocenteInEditing.ListaIstitutiDocEliminati = [];
         $ObjQuery.Operazioni = [];
       });  
    }

    if (!NuovoDocente && $scope.DocenteInEditing.ListaOrariEliminati.length != 0)
    {
       for(let j = 0; j < $scope.DocenteInEditing.ListaOrariEliminati.length ;j ++)
       {
         var ParamOrario = {
                             CHIAVE : $scope.DocenteInEditing.ListaOrariEliminati[j].CHIAVE
                           }
         if ($scope.DocenteInEditing.ListaOrariEliminati[j].Eliminato)
         {
          $ObjQuery.Operazioni.push({
                                      Query     : 'DeleteLesson',
                                      Parametri : ParamOrario
                                    });
         }
       }
       SystemInformation.PostSQL('Teacher',$ObjQuery,function(Answer)
       {
         $scope.DocenteInEditing.ListaOrariEliminati = [];
         $ObjQuery.Operazioni = [];
       });  
    }
    
    for(let i = 0; i < $scope.DocenteInEditing.ListaIstitutiDoc.length ;i ++)
    { 
      var ParamIstitutoDoc = {
                                  DOCENTE  : $scope.DocenteInEditing.Chiave,
                                  ISTITUTO : $scope.DocenteInEditing.ListaIstitutiDoc[i].CHIAVE
                             }    
      
      if(NuovoDocente && !($scope.DocenteInEditing.ListaIstitutiDoc[i].Eliminato))  
      { 
        $ObjQuery.Operazioni.push({
                                    Query     : 'InsertInstituteTeacherAfterInsert',
                                    Parametri : ParamIstitutoDoc
                                  });
      }
      if(!NuovoDocente && $scope.DocenteInEditing.ListaIstitutiDoc[i].Nuovo && !($scope.DocenteInEditing.ListaIstitutiDoc[i].Eliminato))
      {  
        $ObjQuery.Operazioni.push({
                                    Query     : 'InsertInstituteTeacher',
                                    Parametri : ParamIstitutoDoc
                                  });
      }      
    }

    for (let i = 0;i < $scope.DocenteInEditing.ListaIstitutiDoc.length;i ++)
    {
         for (let j = 0;j < $scope.DocenteInEditing.ListaIstitutiDoc[i].Orari.length;j ++)
         {
           var ParamOrario = {
                               CHIAVE   : $scope.DocenteInEditing.ListaIstitutiDoc[i].Orari[j].CHIAVE,
                               MATERIA  : $scope.DocenteInEditing.ListaIstitutiDoc[i].Orari[j].MATERIA,
                               DOCENTE  : $scope.DocenteInEditing.Chiave,
                               CLASSE   : $scope.DocenteInEditing.ListaIstitutiDoc[i].Orari[j].CLASSE,
                               ISTITUTO : $scope.DocenteInEditing.ListaIstitutiDoc[i].Orari[j].ISTITUTO          
                             }
           if (NuovoDocente && $scope.DocenteInEditing.ListaIstitutiDoc[i].Orari[j].Nuovo)
              $ObjQuery.Operazioni.push({
                                          Query     : 'InsertLessonAfterInsert',
                                          Parametri : ParamOrario,
                                          ResetKeys : [2]
                                        });
           
           if (!NuovoDocente && $scope.DocenteInEditing.ListaIstitutiDoc[i].Orari[j].Nuovo)
              $ObjQuery.Operazioni.push({
                                          Query     : 'InsertLesson',
                                          Parametri : ParamOrario,
                                          ResetKeys : [1]
                                        });
           
           if (!NuovoDocente && $scope.DocenteInEditing.ListaIstitutiDoc[i].Orari[j].Modificato)               
              ParamOrario = {
                              CHIAVE  : $scope.DocenteInEditing.ListaIstitutiDoc[i].Orari[j].CHIAVE,
                              MATERIA : $scope.DocenteInEditing.ListaIstitutiDoc[i].Orari[j].MATERIA,                             
                              CLASSE  : $scope.DocenteInEditing.ListaIstitutiDoc[i].Orari[j].CLASSE                             
                            };
              $ObjQuery.Operazioni.push({
                                          Query     : 'UpdateLesson',
                                          Parametri : ParamOrario
                                        });
         }
         
         for(let k = 0;k < $scope.DocenteInEditing.ListaIstitutiDoc[i].Disponibilita.length;k ++)
         {
             for(let l = 0;l < $scope.DocenteInEditing.ListaIstitutiDoc[i].Disponibilita[k].length;l ++)
             { 
                 var IsTimeValid = function(TimeString)
                 {
                     return(TimeString != null && TimeString != undefined && TimeString != "");
                 }
                 
                 if(IsTimeValid($scope.DocenteInEditing.ListaIstitutiDoc[i].Disponibilita[k][l].DA) || 
                    IsTimeValid($scope.DocenteInEditing.ListaIstitutiDoc[i].Disponibilita[k][l].A))
                 {
                    var ParamDisponibilita = {
                                                DocenteDisp  : $scope.DocenteInEditing.Chiave,
                                                IstitutoDisp : $scope.DocenteInEditing.ListaIstitutiDoc[i].CHIAVE,
                                                GiornoDisp   : k,
                                                PosDisp      : l                                                                
                                              }
                    if(IsTimeValid($scope.DocenteInEditing.ListaIstitutiDoc[i].Disponibilita[k][l].DA))
                       ParamDisponibilita.DaDisp = ZFormatDateTime('hh:nn',$scope.DocenteInEditing.ListaIstitutiDoc[i].Disponibilita[k][l].DA);
                    if(IsTimeValid($scope.DocenteInEditing.ListaIstitutiDoc[i].Disponibilita[k][l].A))
                       ParamDisponibilita.ADisp = ZFormatDateTime('hh:nn',$scope.DocenteInEditing.ListaIstitutiDoc[i].Disponibilita[k][l].A);
                     if(!NuovoDocente)
                     { 
                        $ObjQuery.Operazioni.push({
                                                    Query     : 'InsertUpdateTeacherAvailability',
                                                    Parametri : ParamDisponibilita
                                                  });
                     }
                     else
                     {
                        $ObjQuery.Operazioni.push({
                                                    Query     : 'InsertUpdateTeacherAvailabilityAfterInsert',
                                                    Parametri : ParamDisponibilita
                                                  });                  
                     }
                 }
                 else
                 {
                        $ObjQuery.Operazioni.push({
                                                    Query     : 'DeleteTeacherAvailability',
                                                    Parametri : {
                                                                  Docente   : $scope.DocenteInEditing.Chiave,
                                                                  Istituto  : $scope.DocenteInEditing.ListaIstitutiDoc[i].CHIAVE,
                                                                  Giorno    : k,
                                                                  Posizione : l                                                                
                                                                }
                                                  });
                 }
             }
         }
    }
 
    SystemInformation.PostSQL('Teacher',$ObjQuery,function(Answer)
    {
      $scope.DocenteInEditing.ListaIstitutiDoc = [];
      $scope.EditingOn                         = false;
      $scope.DisponibilitaInEditing            = []; 

      $scope.RefreshListaDocenti();
      /*if($scope.CheckOldMateria)
      {
         $scope.MateriaFiltro    = $scope.OldMateriaFiltro;
         $scope.searchTextMat    = $scope.OldMateriaNome;
      }
      if($scope.CheckOldTitolo)
      {
         $scope.TitoloFiltro  = $scope.OldTitoloFiltro;
         $scope.searchTextTit = $scope.OldTitoloNome;
      }*/
      if($scope.CheckOldIstituto)
      {
         $scope.IstitutoFiltro     = $scope.OldIstitutoFiltro;
         $scope.searchTextIstituto = $scope.OldIstitutoNome;
      }
      //if($scope.IstitutoForNewDocente != -1)
         //$scope.searchTextIstituto = $scope.IstitutoForNewDocenteNome;
      SystemInformation.GetSQL('Institute', {}, function(Results)  
      { 
        var ListaIstitutiAssegnati = [];  
        IstitutiInfoLista = SystemInformation.FindResults(Results,'InstituteInfoList');
        if(IstitutiInfoLista != undefined)
        {      
           for(let i = 0; i < IstitutiInfoLista.length; i++)
           {
               if(IstitutiInfoLista[i].NR_DOCENTI > 0)
                  ListaIstitutiAssegnati.push({
                                                Chiave   : IstitutiInfoLista[i].CHIAVE,
                                                Istituto : IstitutiInfoLista[i].NOME
                                              });
           
               IstitutiInfoLista[i] = { 
                                        Chiave   : IstitutiInfoLista[i].CHIAVE,
                                        Istituto : IstitutiInfoLista[i].NOME
                                      }
           }
           $scope.ListaIstituti      = ListaIstitutiAssegnati;                                  
           $scope.ListaIstitutiNoFilter = Array.from(ListaIstitutiAssegnati);       
        }
        else SystemInformation.ApplyOnError('Modello istituti non conforme','');   
      });      
    });  
  }
  
 $scope.EliminaDocente = function(Docente)
 {
   var EliminaDoc = function()
   {
     var $ObjQuery    = { Operazioni : [] };
     var ParamDocente = { CHIAVE : Docente.Chiave };     
     
     $ObjQuery.Operazioni.push({
                                 Query     : 'DeleteTeacherAvailabilityAll',
                                 Parametri : ParamDocente
                               }); 

     $ObjQuery.Operazioni.push({
                                 Query     : 'DeleteTeacherDeliveryBookAll',
                                 Parametri : ParamDocente
                               }); 
     
     $ObjQuery.Operazioni.push({
                                 Query     : 'DeleteTeacherDelivery',
                                 Parametri : ParamDocente
                               });                               

     $ObjQuery.Operazioni.push({
                                 Query     : 'DeleteLessonAll',
                                 Parametri : ParamDocente
                               }); 
     
     $ObjQuery.Operazioni.push({
                                 Query     : 'DeleteInstituteTeacherAll',
                                 Parametri : ParamDocente
                               });      
     
     $ObjQuery.Operazioni.push({
                                 Query     : 'DeleteTeacher',
                                 Parametri : ParamDocente
                               });
                               
     SystemInformation.PostSQL('Teacher',$ObjQuery,function(Answer)
     {
       $scope.RefreshListaDocenti();
       $scope.AProvinciaFiltro = $scope.ProvinciaOldFiltro;
     });  
   }
   ZConfirm.GetConfirmBox('AVVISO',"Eliminare il docente: " + Docente.RagioneSociale + " ?",EliminaDoc,function(){});      
  }
  
  $scope.AggiungiIstituto = function(ev) 
  { 
    $mdDialog.show({ 
                     controller          : DialogControllerIstituto,
                     templateUrl         : "template/associateInstituteTeacherPopup.html",
                     targetEvent         : ev,
                     scope               : $scope,
                     preserveScope       : true,
                     clickOutsideToClose : true
                   })
    .then(function(answer) 
    {}, 
    function() 
    {});
  };
  
  function DialogControllerIstituto($scope,$mdDialog)  
  {    
    $scope.hide = function() 
    {
      $mdDialog.hide();
    };

    $scope.AnnullaPopup = function() 
    { 
      $scope.IstitutoDaAssociare = -1;
      $scope.NomeFiltro = '';      
      $mdDialog.cancel();
    };

    $scope.ConfermaPopup = function(istituto) 
    {     
      if(istituto == -1) 
      { 
        ZCustomAlert($mdDialog,'ATTENZIONE','NESSUN ISTITUTO SELEZIONATO!');      
        return
      }
      else
      { 
        let IstitutoExist  = $scope.DocenteInEditing.ListaIstitutiDoc.find(function(AIstituto) { return(AIstituto.CHIAVE == istituto);});
        let IstitutoNome   = $scope.ListaIstitutiPopup.find(function(AIstituto) { return(AIstituto.Chiave == istituto);});
        if (IstitutoExist != undefined) ZCustomAlert($mdDialog,'AVVISO',"ISTITUTO GIA' ASSOCIATO AL DOCENTE ATTUALE!")
        else
        { 
          NuovoIstituto = {
                            "Nuovo"         : true,
                            "Eliminato"     : false,
                            "CHIAVE"        : istituto,
                            "ISTITUTO"      : IstitutoNome.Istituto,
                            "Orari"         : [],
                            "Disponibilita" : []
                          }

          NuovoIstituto.Disponibilita = GetArrayDisponibilitaVuoto();                          

          $scope.DocenteInEditing.ListaIstitutiDoc.push(NuovoIstituto);
          $scope.IstitutoDaAssociare = -1;
          $scope.IstitutoVisualizzato = $scope.DocenteInEditing.ListaIstitutiDoc[$scope.DocenteInEditing.ListaIstitutiDoc.length-1].CHIAVE;          
          $scope.DocenteInEditing.ListaIstitutiDoc.sort(function(a,b) 
          {
              var IstA = a.ISTITUTO.toUpperCase();
              var IstB = b.ISTITUTO.toUpperCase();
              return (IstA < IstB) ? -1 : (IstA > IstB) ? 1 : 0;
          });          
          $scope.NomeFiltro = '';          
          $mdDialog.hide();
        }
      }        
    };
  }

  $scope.DissociaIstituto = function (Istituto)
  { 
    if ($scope.DocenteInEditing.ListaIstitutiDoc.length == 0) 
        ZCustomAlert($mdDialog,'ATTENZIONE','NESSUN ISTITUTO SELEZIONATO DA DISSOCIARE!')       
    else
    {
      IstitutoCorrispondente = $scope.DocenteInEditing.ListaIstitutiDoc.find(function(AIstituto) { return(AIstituto.CHIAVE == Istituto);});
      var DissocIstDoc = function()
      {
         for(let j = 0; j < $scope.DocenteInEditing.ListaIstitutiDoc.length; j++)
         {
           var EliminaIstituto = function(j)
           {
             $scope.DocenteInEditing.ListaIstitutiDoc.splice(j,1);
             $scope.IstitutoVisualizzato = $scope.DocenteInEditing.ListaIstitutiDoc.length == 0 ? -1 : $scope.DocenteInEditing.ListaIstitutiDoc[0].CHIAVE            
           }
           if($scope.DocenteInEditing.ListaIstitutiDoc[j].CHIAVE == Istituto)
           {
             if ($scope.DocenteInEditing.ListaIstitutiDoc[j].Nuovo)
                EliminaIstituto(j);
             else 
             {                   
               $scope.DocenteInEditing.ListaIstitutiDocEliminati.push($scope.DocenteInEditing.ListaIstitutiDoc[j]);
               $scope.DocenteInEditing.ListaIstitutiDocEliminati[$scope.DocenteInEditing.ListaIstitutiDocEliminati.length-1].Eliminato = true;
               EliminaIstituto(j);
             }                         
           }
         }   
      }
      ZConfirm.GetConfirmBox('AVVISO','Dissociare l\'istituto: ' + IstitutoCorrispondente.ISTITUTO + ' dal docente?',DissocIstDoc,function(){});      
    }
  }  
  
  $scope.NuovoOrario = function (ev,Istituto,Docente)
  { 
    if(Istituto == -1)
    {  
      ZCustomAlert($mdDialog,'ATTENZIONE',"IMPOSSIBILE AGGIUNGERE ORARIO, NESSUN ISTITUTO SELEZIONATO!")       
    }
    else
    {     
      $mdDialog.show({ 
                       controller          : DialogControllerOrario,
                       templateUrl         : "template/lessonTeacherPopup.html",
                       targetEvent         : ev,
                       scope               : $scope,
                       preserveScope       : true,
                       clickOutsideToClose : true,
                       locals              : {Istituto,Docente}
                     })
      .then(function(answer) 
      {}, 
      function() 
      {});
    }
  };
 
  function DialogControllerOrario($scope,$mdDialog,Istituto,Docente)  
  { 
    $scope.OrarioInEditing = {
                               "CHIAVE"     : -1,
                               "MATERIA"    : -1,
                               "CLASSE"     : -1,
                               "ISTITUTO"   : Istituto,
                               "DOCENTE"    : Docente,
                               "Nuovo"      : true,
                               "Modificato" : false,
                               "Eliminato"  : false
                             } 

    SystemInformation.GetSQL('Institute',{CHIAVE : Istituto}, function(Results)
    {
      ListaClassiIst = SystemInformation.FindResults(Results,'ClassiInstitute');
      if (ListaClassiIst != undefined)
      {  
         for(let i = 0; i < ListaClassiIst.length; i++)
             ListaClassiIst[i] = { 
                                   Chiave       : ListaClassiIst[i].CHIAVE,
                                   Anno         : ListaClassiIst[i].ANNO,
                                   Sezione      : ListaClassiIst[i].SEZIONE,
                                   Istituto     : ListaClassiIst[i].ISTITUTO,
                                   Combinazione : ListaClassiIst[i].COMBINAZIONE_DESCR
                                 }
         $scope.ListaClassiIstituto = ListaClassiIst;
      }
      else SystemInformation.ApplyOnError('Modello classe istituto non conforme o nessuna classe associata all\'istituto attuale','')     
    },"SQLDettaglio");

    $scope.hide = function() 
    {
      $mdDialog.hide();
    };

    $scope.AnnullaPopupOrario = function() 
    {
      $mdDialog.cancel();
    };

    $scope.ConfermaPopupOrario = function(orario)
    { 
      //devo mettere controllo incrociato per non sovrapporre orari 
      if($scope.OrarioInEditing.MATERIA == -1 || $scope.OrarioInEditing.CLASSE == -1)
      {
        ZCustomAlert($mdDialog,'ATTENZIONE','DATI ORARIO MANCANTI!');
        return
      }
      else
      { 
        MateriaCorrispondente = $scope.ListaMaterie.find(function(AMateria){return(AMateria.Chiave == orario.MATERIA);});
        ClasseCorrispondente  = $scope.ListaClassiIstituto.find(function(AClasse){return(AClasse.Chiave == orario.CLASSE);});
            
        orario.ClasseNome  = ClasseCorrispondente.Anno + ClasseCorrispondente.Sezione + ' - ' + ClasseCorrispondente.Combinazione;
        orario.MateriaNome = MateriaCorrispondente.Nome;
                
        IstCorrispondente = $scope.DocenteInEditing.ListaIstitutiDoc.findIndex(function(AIstituto){return (AIstituto.CHIAVE == orario.ISTITUTO);});
        $scope.DocenteInEditing.ListaIstitutiDoc[IstCorrispondente].Orari.push(orario);
      }        
      $mdDialog.hide();     
    }
  } 
  
  $scope.ModificaOrario = function (Orario)
  {     
    $mdDialog.show({ 
                     controller          : DialogControllerOrarioMod,
                     templateUrl         : "template/lessonTeacherPopup.html",
                     targetEvent         : Orario,
                     scope               : $scope,
                     preserveScope       : true,
                     clickOutsideToClose : true,
                     locals              : {Orario}
                   })
    .then(function(answer) 
    {}, 
    function() 
    {});
  };
  
  function DialogControllerOrarioMod($scope,$mdDialog,Orario)  
  { 
    OrarioOld = {
                  "MATERIA"  : Orario.MATERIA,
                  "CLASSE"   : Orario.CLASSE,
                  "ORARIO"   : Orario.ORARIO,
                  "ISTITUTO" : Orario.ISTITUTO
                }    
    $scope.OrarioInEditing = {
                                 "CHIAVE"     : Orario.CHIAVE,
                                 "MATERIA"    : Orario.MATERIA,
                                 "CLASSE"     : Orario.CLASSE,                                
                                 "ISTITUTO"   : Orario.ISTITUTO,
                                 "DOCENTE"    : Orario.Docente,
                                 "Nuovo"      : Orario.Nuovo,
                                 "Modificato" : Orario.Modificato,
                                 "Eliminato"  : Orario.Eliminato                                
                               } 

    SystemInformation.GetSQL('Institute',{CHIAVE : Orario.ISTITUTO}, function(Results)
    {
      ListaClassiIst = SystemInformation.FindResults(Results,'ClassiInstitute');
      if (ListaClassiIst != undefined)
      {  
         for(let i = 0; i < ListaClassiIst.length; i++)
             ListaClassiIst[i] = { 
                                   Chiave       : ListaClassiIst[i].CHIAVE,
                                   Anno         : ListaClassiIst[i].ANNO,
                                   Sezione      : ListaClassiIst[i].SEZIONE,
                                   Istituto     : ListaClassiIst[i].ISTITUTO,
                                   Combinazione : ListaClassiIst[i].COMBINAZIONE_DESCR
                                 }
         $scope.ListaClassiIstituto = ListaClassiIst;
      }
      else SystemInformation.ApplyOnError('Modello classe istituto non conforme o nessuna classe associata all\'istituto attuale','')     
    },"SQLDettaglio");

    $scope.hide = function() 
    {
      $mdDialog.hide();
    };

    $scope.AnnullaPopupOrario = function() 
    {
      $mdDialog.cancel();
    };

    $scope.ConfermaPopupOrario = function(Orario)
    { 
      IstCorrispondente  = $scope.DocenteInEditing.ListaIstitutiDoc.findIndex(function(AIstituto){return (AIstituto.CHIAVE == Orario.ISTITUTO);});               
      OrarioCorrispondente = $scope.DocenteInEditing.ListaIstitutiDoc[IstCorrispondente].Orari.findIndex(function(AOrario){return (AOrario.ISTITUTO == OrarioOld.ISTITUTO && AOrario.CLASSE == OrarioOld.CLASSE && AOrario.MATERIA == OrarioOld.MATERIA && AOrario.ORARIO == OrarioOld.ORARIO);});        

      for (let m = 0;m < $scope.ListaClassiIstituto.length;m ++)
      {
           if ($scope.ListaClassiIstituto[m].Chiave == Orario.CLASSE)
           { 
             
             MateriaCorrispondente = $scope.ListaMaterie.find(function(AMateria){return(AMateria.Chiave == Orario.MATERIA);});
             ClasseCorrispondente  = $scope.ListaClassiIstituto.find(function(AClasse){return(AClasse.Chiave == Orario.CLASSE);});                        
                 
             $scope.DocenteInEditing.ListaIstitutiDoc[IstCorrispondente].Orari[OrarioCorrispondente].MateriaNome      = MateriaCorrispondente.Nome;
             $scope.DocenteInEditing.ListaIstitutiDoc[IstCorrispondente].Orari[OrarioCorrispondente].MATERIA          = Orario.MATERIA;            
             $scope.DocenteInEditing.ListaIstitutiDoc[IstCorrispondente].Orari[OrarioCorrispondente].ClasseNome       = ClasseCorrispondente.Anno + ClasseCorrispondente.Sezione + ' - ' + ClasseCorrispondente.Combinazione;
             $scope.DocenteInEditing.ListaIstitutiDoc[IstCorrispondente].Orari[OrarioCorrispondente].CLASSE           = $scope.ListaClassiIstituto[m].Chiave;
             $scope.DocenteInEditing.ListaIstitutiDoc[IstCorrispondente].Orari[OrarioCorrispondente].ANNO             = $scope.ListaClassiIstituto[m].Anno;               
             $scope.DocenteInEditing.ListaIstitutiDoc[IstCorrispondente].Orari[OrarioCorrispondente].SEZIONE          = $scope.ListaClassiIstituto[m].Sezione;
             $scope.DocenteInEditing.ListaIstitutiDoc[IstCorrispondente].Orari[OrarioCorrispondente].COMBINAZIONE     = $scope.ListaClassiIstituto[m].Combinazione; 
             if($scope.DocenteInEditing.ListaIstitutiDoc[IstCorrispondente].Orari[OrarioCorrispondente].Nuovo)
             {
               $scope.DocenteInEditing.ListaIstitutiDoc[IstCorrispondente].Orari[OrarioCorrispondente].Modificato = false;
               //$scope.DocenteInEditing.ListaIstitutiDoc[IstCorrispondente].Orari[OrarioCorrispondente].Eliminato  = false;
             }   
             else
             {                
               //$scope.DocenteInEditing.ListaIstitutiDoc[IstCorrispondente].Orari[OrarioCorrispondente].Nuovo      = false;
               //$scope.DocenteInEditing.ListaIstitutiDoc[IstCorrispondente].Orari[OrarioCorrispondente].Eliminato  = false;
               $scope.DocenteInEditing.ListaIstitutiDoc[IstCorrispondente].Orari[OrarioCorrispondente].Modificato = true;
             }
           } 
      }              
      $mdDialog.hide();     
    }
  }   
  
  $scope.EliminaOrario = function(Orario)
  {
    var EliminaOrDoc = function()
    {
      IstCorrispondente = $scope.DocenteInEditing.ListaIstitutiDoc.findIndex(function(AIstituto){return (AIstituto.CHIAVE == Orario.ISTITUTO);});   
      OrarioCorrispondente = $scope.DocenteInEditing.ListaIstitutiDoc[IstCorrispondente].Orari.findIndex(function(AOrario){return(AOrario.MATERIA == Orario.MATERIA && AOrario.CLASSE == Orario.CLASSE);});     
      if ($scope.DocenteInEditing.ListaIstitutiDoc[IstCorrispondente].Orari[OrarioCorrispondente].Nuovo)
          $scope.DocenteInEditing.ListaIstitutiDoc[IstCorrispondente].Orari.splice(OrarioCorrispondente,1)
      else
      {
        $scope.DocenteInEditing.ListaOrariEliminati.push($scope.DocenteInEditing.ListaIstitutiDoc[IstCorrispondente].Orari[OrarioCorrispondente]);
        $scope.DocenteInEditing.ListaOrariEliminati[$scope.DocenteInEditing.ListaOrariEliminati.length-1].Eliminato = true;
        $scope.DocenteInEditing.ListaIstitutiDoc[IstCorrispondente].Orari.splice(OrarioCorrispondente,1);
      }       
    }
    ZConfirm.GetConfirmBox('AVVISO','Eliminare l\'associazione di ' + Orario.MateriaNome + ' alla classe ' + Orario.ClasseNome + ' ?',EliminaOrDoc,function(){});      
     
  }
  
  $scope.NuovaSpedizione = function (ChiaveDocente)
  { 
    SystemInformation.DataBetweenController.ChiaveSpedizione = -1;
    SystemInformation.DataBetweenController.ChiaveDocente    = ChiaveDocente;
    SystemInformation.DataBetweenController.Provenienza      = 'TeacherPage';
    $state.go("deliveryModDetailPage");  
  }
  
  $scope.ListaSpedizioni = function(Docente) 
  { 
    $mdDialog.show({ 
                     controller          : DialogControllerListaSpedizioni,
                     templateUrl         : "template/teacherDeliveryListPopup.html",
                     targetEvent         : Docente,
                     scope               : $scope,
                     preserveScope       : true,
                     clickOutsideToClose : true,
                     locals              : {Docente}
                   })
    .then(function(answer) 
    {}, 
    function() 
    {});
  };
  
  function DialogControllerListaSpedizioni($scope,$mdDialog,Docente)   
  {
    $scope.GridOptions3 = {
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
    
    $scope.RefreshListaSpedizioni = function ()
    {
      var ListaSpedizioniDocDettaglio = [];
      $scope.ListaSpedizioniDoc       = [];    
      if($scope.IsAdministrator())
      {
         SystemInformation.GetSQL('Delivery',{CHIAVE : Docente.Chiave},function(Results)
         {
           $scope.ListaSpedizioniDoc    = SystemInformation.FindResults(Results,'TeacherDeliveryListAdm');
           ListaSpedizioniDocDettaglio  = SystemInformation.FindResults(Results,'TeacherDeliveryListAdmDettaglio');

           if($scope.ListaSpedizioniDoc != undefined && ListaSpedizioniDocDettaglio != undefined)
           {
              $scope.ListaSpedizioniDoc.forEach(function(Spedizione){Spedizione.DettagliTitoli = []});       
              for(let i = 0;i < $scope.ListaSpedizioniDoc.length;i ++)
              {
                  $scope.ListaSpedizioniDoc[i].DATA = ZFormatDateTime('dd/mm/yyyy',ZDateFromHTMLInput($scope.ListaSpedizioniDoc[i].DATA))
                  for(let j = 0;j < ListaSpedizioniDocDettaglio.length;j ++)
                  {
                      switch(ListaSpedizioniDocDettaglio[j].STATO)
                      {
                             case 'P' : ListaSpedizioniDocDettaglio[j].STATO = 'PRENOTATO'
                                        break;
                             case 'S' : ListaSpedizioniDocDettaglio[j].STATO = 'DA SPEDIRE'
                                        break;
                             case 'C' : ListaSpedizioniDocDettaglio[j].STATO = 'CONSEGNATO'
                                        break;
                             default  : ListaSpedizioniDocDettaglio[j].STATO = 'N.D';                                       
                      }
                      if($scope.ListaSpedizioniDoc[i].CHIAVE == ListaSpedizioniDocDettaglio[j].SPEDIZIONE)
                         $scope.ListaSpedizioniDoc[i].DettagliTitoli.push(ListaSpedizioniDocDettaglio[j]);
                  }                        
              } 
           }
           else SystemInformation.ApplyOnError('Modello lista spedizioni docente non conforme','');       
         },'SelectSQLDocenteAdmin')
      }
      else
      {
         SystemInformation.GetSQL('Delivery',{CHIAVE : Docente.Chiave},function(Results)
         {
           $scope.ListaSpedizioniDoc           = SystemInformation.FindResults(Results,'TeacherDeliveryListPrm');
           ListaSpedizioniDocDettaglio  = SystemInformation.FindResults(Results,'TeacherDeliveryListPrmDettaglio');
           if($scope.ListaSpedizioniDoc != undefined && ListaSpedizioniDocDettaglio != undefined)
           { 
              $scope.ListaSpedizioniDoc.forEach(function(Spedizione){Spedizione.DettagliTitoli = []});       
              for(let i = 0;i < $scope.ListaSpedizioniDoc.length;i ++)
              {
                  $scope.ListaSpedizioniDoc[i].DATA = ZFormatDateTime('dd/mm/yyyy',ZDateFromHTMLInput($scope.ListaSpedizioniDoc[i].DATA))
                  for(let j = 0;j < ListaSpedizioniDocDettaglio.length;j ++)
                  {
                      switch(ListaSpedizioniDocDettaglio[j].STATO)
                      {
                             case 'P' : ListaSpedizioniDocDettaglio[j].STATO = 'PRENOTATO'
                                        break;
                             case 'S' : ListaSpedizioniDocDettaglio[j].STATO = 'DA SPEDIRE'
                                        break;
                             case 'C' : ListaSpedizioniDocDettaglio[j].STATO = 'CONSEGNATO'
                                        break;
                                        
                      }
                      if($scope.ListaSpedizioniDoc[i].CHIAVE == ListaSpedizioniDocDettaglio[j].SPEDIZIONE)
                         $scope.ListaSpedizioniDoc[i].DettagliTitoli.push(ListaSpedizioniDocDettaglio[j]);
                  }                        
              }           
           }
           else SystemInformation.ApplyOnError('Modello lista spedizioni docente non conforme','');       
         },'SelectSQLDocentePromotore')       
      }
    }
    
    $scope.GetTitoliSpedizione = function(Spedizione)
    {
       var Result = '';
       for(let i = 0;i < Spedizione.DettagliTitoli.length;i ++)
       {
           Result += Spedizione.DettagliTitoli[i].CODICE + ' - ' + Spedizione.DettagliTitoli[i].NOME_TITOLO + ' - ' + Spedizione.DettagliTitoli[i].STATO + '</br>';
       }
       
       return($sce.trustAsHtml(Result.substr(0,Result.length)));
    }
    
    $scope.ModificaSpedizione = function(ChiaveSpedizione) 
    { 
      SystemInformation.DataBetweenController.ChiaveSpedizione = ChiaveSpedizione;
      SystemInformation.DataBetweenController.ChiaveDocente    = Docente.Chiave;
      SystemInformation.DataBetweenController.Provenienza      = 'TeacherPage';
      $state.go("deliveryModDetailPage");   
    };
    
    $scope.EliminaSpedizione = function (Spedizione)
    {
      var EliminaSpedDoc = function()
      {
        var $ObjQuery       = { Operazioni : [] };
        var ParamSpedizione = { CHIAVE : Spedizione.CHIAVE };
         
        $ObjQuery.Operazioni.push({
                                    Query     : 'DeleteDeliveryBookAll',
                                    Parametri : ParamSpedizione
                                  })
        
        $ObjQuery.Operazioni.push({
                                    Query     : 'DeleteDelivery',
                                    Parametri : ParamSpedizione
                                  });      
        
        SystemInformation.PostSQL('Delivery',$ObjQuery,function(Answer)
        {
          $ObjQuery.Operazioni = [];
          $scope.RefreshListaSpedizioni();
        }); 
      }
      ZConfirm.GetConfirmBox('AVVISO','Eliminare la spedizione della data ' + Spedizione.DATA + ' presso ' + Spedizione.PRESSO + ' ?',EliminaSpedDoc,function(){});              
    } 
    
    $scope.hide = function() 
    {
      $mdDialog.hide();
    };

    $scope.ChiudiPopup = function() 
    { 
      $scope.ListaSpedizioniDoc = [];
      $mdDialog.cancel();
    };   
    $scope.RefreshListaSpedizioni();    
  }
  
  $scope.RefreshListaDocenti(); 

}]);

SIRIOApp.filter('DocenteByFiltro',function()
{
  return function(ListaDocenti,ANomeFiltro,MateriaFiltro,CoordMateriaFiltro)
         {
           if(ANomeFiltro == '' && MateriaFiltro == -1 && CoordMateriaFiltro == false) 
              return(ListaDocenti);
           var ListaFiltrata = [];
           ANomeFiltro = ANomeFiltro.toUpperCase();
           MateriaFiltro = parseInt(MateriaFiltro);
           
           var DocenteOk = function(Docente)
           {  
              var Result = true;
              
              //if(ANomeFiltro != '')
              if(Docente.RagioneSociale.toUpperCase().indexOf(ANomeFiltro) < 0)
                 Result = false;
                  
              if(MateriaFiltro != -1)
                 if(Docente.Materia1 != MateriaFiltro && Docente.Materia2 != MateriaFiltro && Docente.Materia3 != MateriaFiltro)
                    Result = false;

              if(CoordMateriaFiltro)
                 if(Docente.CoordMateria_1 == -1 && Docente.CoordMateria_2 == -1 && Docente.CoordMateria_3 == -1)
                    Result = false;      
              return(Result);
           }
           
           ListaDocenti.forEach(function(Docente)
           { 
             if(DocenteOk(Docente)) 
                ListaFiltrata.push(Docente)                       
           });
           return(ListaFiltrata);
           
         }
});

SIRIOApp.filter('IstitutoByNomeFiltro',function()
{  
  return function(ListaIstitutiPopup,NomeFiltro)
         {  
                    
           if(NomeFiltro == '') return(ListaIstitutiPopup);
           var ListaFiltrataI = [];
           NomeFiltro = NomeFiltro.toUpperCase();
           var IstitutoOK = function(istituto)
           {  
              var Result = true;
              
              if(NomeFiltro != '')
                if(istituto.Istituto.toUpperCase().indexOf(NomeFiltro) < 0)
                   Result = false;
              return(Result);
           }
          
           ListaIstitutiPopup.forEach(function(istituto)
           { 
             if(IstitutoOK(istituto)) 
                ListaFiltrataI.push(istituto)                       
           });
           
           
           return(ListaFiltrataI);
         }           
});