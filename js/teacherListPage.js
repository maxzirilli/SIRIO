SIRIOApp.controller("teacherListPageController",['$scope','SystemInformation','$state','$rootScope','$mdDialog','$sce','$filter', function($scope,SystemInformation,$state,$rootScope,$mdDialog,$sce,$filter)
{
  $scope.ListaDocenti         = [];
  $scope.EditingOn            = false;
  $scope.DocenteInEditing     = {};
  $scope.ListaMaterie         = [];
  $scope.ListaPiattaforme     = [{Sigla:PIATTA_HUBSCUOLA,Valore:"HubScuola"},{Sigla:PIATTA_BSMART,Valore:"BSmart"},{Sigla:PIATTA_NESSUNA,Valore:"Nessuna Piattaforma"}];
  $scope.GiorniSettimana      = SystemInformation.GiorniSettimana;
  $scope.IstitutoDaAssociare  = -1;
  $scope.NomeFiltro           = '';
  $scope.IstitutoVisualizzato = -1;
  $scope.ListaInsegnamenti    = [];
  $scope.NomeFiltro           = '';
  $scope.TitoloFiltro         = -1;
  $scope.AProvinciaFiltro     = -1;
  $scope.IstitutoFiltrato     = -1;
  $scope.MateriaFiltro        = -1;
  SystemInformation.DataBetweenController  = [];
  
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
    IstitutiInfoLista = SystemInformation.FindResults(Results,'InstituteInfoList');
    if(IstitutiInfoLista != undefined)
    { 
       for(let i = 0; i < IstitutiInfoLista.length; i++)
           IstitutiInfoLista[i] = { 
                                    Chiave     : IstitutiInfoLista[i].CHIAVE,
                                    Istituto   : IstitutiInfoLista[i].NOME
                                  }
       $scope.ListaIstituti = IstitutiInfoLista;
       $scope.ListaIstitutiPopup = IstitutiInfoLista;
    }
    else SystemInformation.ApplyOnError('Modello istituti non conforme','');   
  });
  
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
    TitoliInfoLista = SystemInformation.FindResults(Results,'BookListFilter');
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
  });
  
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
       $scope.MateriaFiltro = itemMat.Chiave
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
      $scope.TitoloFiltro = itemTit.Chiave;
    else $scope.TitoloFiltro = -1;
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
       $scope.IstitutoFiltrato = itemIstituto.Chiave;
    else $scope.IstitutoFiltrato = -1;
    $scope.RefreshListaDocenti();
  }   
  
  $scope.RefreshListaDocenti = function ()
  {
    var ObjParametri = {};
     
    if($scope.AProvinciaFiltro != -1)
        ObjParametri.FiltroP = $scope.AProvinciaFiltro;
    if($scope.IstitutoFiltrato != -1)
       ObjParametri.FiltroI = $scope.IstitutoFiltrato
    if($scope.TitoloFiltro != -1)
       ObjParametri.FiltroT = $scope.TitoloFiltro
    
    SystemInformation.GetSQL('Teacher', ObjParametri, function(Results)  
    {
      DocentiInfoLista = SystemInformation.FindResults(Results,'TeacherInfoList');
      if(DocentiInfoLista != undefined)
      {
        for(let i = 0; i < DocentiInfoLista.length; i++)
        {
          DocentiInfoLista[i] = { 
                                  Chiave         : DocentiInfoLista[i].CHIAVE,
                                  RagioneSociale : DocentiInfoLista[i].RAGIONE_SOCIALE,
                                  Materia1       : DocentiInfoLista[i].MATERIA_1      == null ? -1 : DocentiInfoLista[i].MATERIA_1,
                                  Materia2       : DocentiInfoLista[i].MATERIA_2      == null ? -1 : DocentiInfoLista[i].MATERIA_2,
                                  Materia3       : DocentiInfoLista[i].MATERIA_3      == null ? -1 : DocentiInfoLista[i].MATERIA_3,
                                  Titolo         : DocentiInfoLista[i].TITOLO         == null ? '' : DocentiInfoLista[i].TITOLO,
                                  Indirizzo      : DocentiInfoLista[i].INDIRIZZO      == null ? '' : DocentiInfoLista[i].INDIRIZZO,
                                  Comune         : DocentiInfoLista[i].COMUNE         == null ? '' : DocentiInfoLista[i].COMUNE,
                                  Cap            : DocentiInfoLista[i].CAP            == null ? '' : DocentiInfoLista[i].CAP,
                                  Provincia      : DocentiInfoLista[i].PROVINCIA      == null ? 0  : DocentiInfoLista[i].PROVINCIA,
                                  ProvinciaNome  : DocentiInfoLista[i].PROVINCIA_NOME == null ? '' : DocentiInfoLista[i].PROVINCIA_NOME,
                                  Email          : DocentiInfoLista[i].EMAIL          == undefined || DocentiInfoLista[i].EMAIL == '' ? 'Non disponibile' : DocentiInfoLista[i].EMAIL
                                };
        }
        $scope.ListaDocenti = DocentiInfoLista;
      }
      else SystemInformation.ApplyOnError('Modello docente non conforme','');   
    });
  }
  
  $scope.InvioMail = function (Docente)
  {
    SystemInformation.DataBetweenController.DocMail = Docente.Email;
    $state.go('mailPage');
  }
  
  $scope.NuovaSpedizioneMultipla = function (Nome)
  {
    var ListaFiltrata = $filter('DocenteByFiltro')($scope.ListaDocenti,Nome,$scope.MateriaFiltro);
    SystemInformation.DataBetweenController  = { ListaDocSped : []};
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
    SystemInformation.DataBetweenController.SpedizioneMultipla = true;
    SystemInformation.DataBetweenController.Provenienza        = 'TeacherPage'; 
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
  
  $scope.ModificaDocente = function(docente)
  {
    $scope.EditingOn                                  = true;   
    $scope.DocenteInEditing                           = {};
    $scope.DocenteInEditing.ListaIstitutiDocEliminati = [];
    $scope.DocenteInEditing.ListaOrariEliminati       = [];
    $scope.ListaMaterieDoc                            = [];
    $scope.IstitutoVisualizzato = -1;
    
    SystemInformation.GetSQL('Teacher', {CHIAVE : docente.Chiave}, function(Results)
    {
      DocenteDettaglio    = SystemInformation.FindResults(Results,'TeacherDettaglio');
      Istituti            = SystemInformation.FindResults(Results,'TeacherInstitute');
      OrariAll            = SystemInformation.FindResults(Results,'TeacherLesson');

      if(DocenteDettaglio != undefined && Istituti != undefined && OrariAll != undefined /*&& ClassiDoc != undefined*/)
      {
        $scope.DocenteInEditing.Chiave           = DocenteDettaglio[0].CHIAVE;
        $scope.DocenteInEditing.RagioneSociale   = DocenteDettaglio[0].RAGIONE_SOCIALE;
        $scope.DocenteInEditing.Titolo           = DocenteDettaglio[0].TITOLO;
        $scope.DocenteInEditing.NumeroTelefono_1 = DocenteDettaglio[0].TEL_PRIMO;
        $scope.DocenteInEditing.NumeroTelefono_2 = DocenteDettaglio[0].TEL_SECONDO;
        $scope.DocenteInEditing.NumeroTelefono_3 = DocenteDettaglio[0].TEL_TERZO;
        $scope.DocenteInEditing.Email            = DocenteDettaglio[0].EMAIL;
        $scope.DocenteInEditing.Materia_1        = DocenteDettaglio[0].MATERIA_1 == undefined ? -1 : DocenteDettaglio[0].MATERIA_1;
        $scope.DocenteInEditing.Materia_2        = DocenteDettaglio[0].MATERIA_2 == undefined ? -1 : DocenteDettaglio[0].MATERIA_2;
        $scope.DocenteInEditing.Materia_3        = DocenteDettaglio[0].MATERIA_3 == undefined ? -1 : DocenteDettaglio[0].MATERIA_3;
        $scope.DocenteInEditing.Piattaforma      = DocenteDettaglio[0].PIATTAFORMA;
        $scope.DocenteInEditing.Indirizzo        = DocenteDettaglio[0].INDIRIZZO;
        $scope.DocenteInEditing.Comune           = DocenteDettaglio[0].COMUNE;
        $scope.DocenteInEditing.Cap              = DocenteDettaglio[0].CAP;
        $scope.DocenteInEditing.Provincia        = DocenteDettaglio[0].PROVINCIA == undefined ? -1 : DocenteDettaglio[0].PROVINCIA;
        $scope.DocenteInEditing.Note             = DocenteDettaglio[0].NOTE;
        $scope.DocenteInEditing.ListaIstitutiDoc = Istituti;       
        $scope.DocenteInEditing.ListaIstitutiDoc.forEach(function(Istituto){Istituto.Orari = []});       
        
        for (let i = 0; i < $scope.DocenteInEditing.ListaIstitutiDoc.length;i ++)
          for (let j = 0; j < OrariAll.length;j ++)
            if (OrariAll[j].ISTITUTO == $scope.DocenteInEditing.ListaIstitutiDoc[i].CHIAVE)
                $scope.DocenteInEditing.ListaIstitutiDoc[i].Orari.push(OrariAll[j]);
                
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
                              
               $scope.DocenteInEditing.ListaIstitutiDoc[i].Orari[j].ClasseNome = $scope.DocenteInEditing.ListaIstitutiDoc[i].Orari[j].ANNO + $scope.DocenteInEditing.ListaIstitutiDoc[i].Orari[j].SEZIONE;

               for(let k = 0;k < $scope.GiorniSettimana.length; k ++)
                   if ((parseInt($scope.DocenteInEditing.ListaIstitutiDoc[i].Orari[j].GIORNO) - 1) == k )
                        $scope.DocenteInEditing.ListaIstitutiDoc[i].Orari[j].GiornoNome = $scope.GiorniSettimana[k];
          }               
        
        if($scope.DocenteInEditing.ListaIstitutiDoc.length > 0) 
           $scope.IstitutoVisualizzato = $scope.DocenteInEditing.ListaIstitutiDoc[0].CHIAVE       
      }       
      else SystemInformation.ApplyOnError('Modello docente non conforme','');      
    },'SQLDettaglio'); 
  }
    
  $scope.NuovoDocente = function()
  { 
    $scope.EditingOn        = true;    
    $scope.DocenteInEditing = {
                                Chiave           : -1,
                                RagioneSociale   : '',
                                Titolo           : 'Egr.Prof.',
                                NumeroTelefono_1 : '',
                                NumeroTelefono_2 : '',
                                NumeroTelefono_3 : '',
                                Email            : '',
                                Materia_1        : -1,
                                Materia_2        : -1,
                                Materia_3        : -1,
                                Piattaforma      : '',
                                Indirizzo        : '',
                                Comune           : '',
                                Cap              : '',
                                Provincia        : -1,
                                Note             : '',
                                ListaIstitutiDoc : []
                              };
  }
  
  $scope.OnAnnullaDocenteClicked = function()
  {
    $scope.EditingOn = false;
    $scope.RefreshListaDocenti();
  }
  
  $scope.ConfermaDocente = function()
  {  
    //attento a mostrare messaggio se manca nome docente nella tab orari  
    var $ObjQuery    = { Operazioni : [] };          
    var ParamDocente = {
                         CHIAVE          : $scope.DocenteInEditing.Chiave,
                         RAGIONE_SOCIALE : $scope.DocenteInEditing.RagioneSociale == undefined ? '' : $scope.DocenteInEditing.RagioneSociale.xSQL(),
                         TITOLO          : $scope.DocenteInEditing.Titolo == undefined ? '' :  $scope.DocenteInEditing.Titolo.xSQL(),
                         TEL_PRIMO       : $scope.DocenteInEditing.NumeroTelefono_1 == undefined ? '' : $scope.DocenteInEditing.NumeroTelefono_1.xSQL(),
                         TEL_SECONDO     : $scope.DocenteInEditing.NumeroTelefono_2 == undefined ? '' : $scope.DocenteInEditing.NumeroTelefono_2.xSQL(),
                         TEL_TERZO       : $scope.DocenteInEditing.NumeroTelefono_3 == undefined ? '' : $scope.DocenteInEditing.NumeroTelefono_3.xSQL(),
                         EMAIL           : $scope.DocenteInEditing.Email == undefined ? '' : $scope.DocenteInEditing.Email.xSQL(),
                         MATERIA_1       : $scope.DocenteInEditing.Materia_1 == -1 ? null : $scope.DocenteInEditing.Materia_1,
                         MATERIA_2       : $scope.DocenteInEditing.Materia_2 == -1 ? null : $scope.DocenteInEditing.Materia_2,
                         MATERIA_3       : $scope.DocenteInEditing.Materia_3 == -1 ? null : $scope.DocenteInEditing.Materia_3,
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
                               GIORNO   : $scope.DocenteInEditing.ListaIstitutiDoc[i].Orari[j].GIORNO,
                               ORARIO   : $scope.DocenteInEditing.ListaIstitutiDoc[i].Orari[j].ORARIO,
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
                              CLASSE  : $scope.DocenteInEditing.ListaIstitutiDoc[i].Orari[j].CLASSE,
                              GIORNO  : $scope.DocenteInEditing.ListaIstitutiDoc[i].Orari[j].GIORNO,
                              ORARIO  : $scope.DocenteInEditing.ListaIstitutiDoc[i].Orari[j].ORARIO                               
                            };
              $ObjQuery.Operazioni.push({
                                          Query     : 'UpdateLesson',
                                          Parametri : ParamOrario
                                        });
         }
    }      
 
    SystemInformation.PostSQL('Teacher',$ObjQuery,function(Answer)
    {
      $scope.DocenteInEditing.ListaIstitutiDoc = [];
      $scope.EditingOn = false;
      $scope.RefreshListaDocenti();
    });  
 }
  
 $scope.EliminaDocente = function(Docente)
 {
   if(confirm('Eliminare il docente: ' + Docente.RagioneSociale + ' ?'))
   {
     var $ObjQuery    = { Operazioni : [] };
     var ParamDocente = { CHIAVE : Docente.Chiave };

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
     });  
   }
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
    {
      //A promise that can be resolved with $mdDialog.hide()...
    }, 
    function() 
    {
      //...or rejected with $mdDialog.cancel().
    });
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
      $mdDialog.cancel();
    };

    $scope.ConfermaPopup = function(istituto) 
    {     
      if(istituto == -1) 
      { 
        alert ('Nessun istituto selezionato!');      
        return
      }
      else
      { 
        let IstitutoExist  = $scope.DocenteInEditing.ListaIstitutiDoc.find(function(AIstituto) { return(AIstituto.CHIAVE == istituto);});
        let IstitutoNome   = $scope.ListaIstitutiPopup.find(function(AIstituto) { return(AIstituto.Chiave == istituto);});
        if (IstitutoExist != undefined) alert ('Istituto già associato al docente attuale!')
        else
        { 
          NuovoIstituto = {
                            "Nuovo"     : true,
                            "Eliminato" : false,
                            "CHIAVE"    : istituto,
                            "ISTITUTO"  : IstitutoNome.Istituto,
                            "Orari"     : []
                          }                            

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
        alert('Nessun istituto selezionato da dissociare!')       
    else
    {
      IstitutoCorrispondente = $scope.DocenteInEditing.ListaIstitutiDoc.find(function(AIstituto) { return(AIstituto.CHIAVE == Istituto);});
      if(confirm('Dissociare l\'istituto: ' + IstitutoCorrispondente.ISTITUTO + ' dal docente?'))
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
    }
  }  
  
  $scope.NuovoOrario = function (ev,Istituto,Docente)
  { 
    if(Istituto == -1)
    {  
      alert("Impossibile aggiungere orario, nessun istituto selezionato!")       
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
      {
        //A promise that can be resolved with $mdDialog.hide()...
      }, 
      function() 
      {
        //...or rejected with $mdDialog.cancel().
      });
    }
  };
 
  function DialogControllerOrario($scope,$mdDialog,Istituto,Docente)  
  { 
    $scope.OrarioInEditing = {
                               "CHIAVE"     : -1,
                               "MATERIA"    : -1,
                               "CLASSE"     : -1,
                               "GIORNO"     : -1, 
                               "ORARIO"     : '',
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
                                   Chiave   : ListaClassiIst[i].CHIAVE,
                                   Anno     : ListaClassiIst[i].ANNO,
                                   Sezione  : ListaClassiIst[i].SEZIONE,
                                   Istituto : ListaClassiIst[i].NOME
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
      if($scope.OrarioInEditing.MATERIA == -1 || $scope.OrarioInEditing.CLASSE == -1 || $scope.OrarioInEditing.GIORNO == -1 || $scope.OrarioInEditing.ORARIO == '')
      {
        alert ('Dati orario mancanti!');
        return
      }
      else
      { 
        MateriaCorrispondente = $scope.ListaMaterie.find(function(AMateria){return(AMateria.Chiave == orario.MATERIA);});
        ClasseCorrispondente  = $scope.ListaClassiIstituto.find(function(AClasse){return(AClasse.Chiave == orario.CLASSE);});
        
        for(let i = 0;i <$scope.GiorniSettimana.length; i ++)
            if ((parseInt(orario.GIORNO) - 1) == i)
                 GiornoCorrispondente = $scope.GiorniSettimana[i];
            
        orario.ClasseNome  = ClasseCorrispondente.Anno + ClasseCorrispondente.Sezione;
        orario.MateriaNome = MateriaCorrispondente.Nome;
        orario.GiornoNome  = GiornoCorrispondente;        
                
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
    {
      //A promise that can be resolved with $mdDialog.hide() or rejected with $mdDialog.cancel()...
    }, 
    function() 
    {
      //...or rejected with $mdDialog.cancel().
    });
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
                                 "GIORNO"     : Orario.GIORNO,
                                 "ORARIO"     : Orario.ORARIO,
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
                                   Chiave   : ListaClassiIst[i].CHIAVE,
                                   Anno     : ListaClassiIst[i].ANNO,
                                   Sezione  : ListaClassiIst[i].SEZIONE,
                                   Istituto : ListaClassiIst[i].NOME
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
             for(let i = 0;i <$scope.GiorniSettimana.length; i ++)
                 if ((parseInt(Orario.GIORNO) - 1) == i)
                      GiornoCorrispondente = $scope.GiorniSettimana[i];
                 
             $scope.DocenteInEditing.ListaIstitutiDoc[IstCorrispondente].Orari[OrarioCorrispondente].MateriaNome = MateriaCorrispondente.Nome;
             $scope.DocenteInEditing.ListaIstitutiDoc[IstCorrispondente].Orari[OrarioCorrispondente].MATERIA     = Orario.MATERIA;            
             $scope.DocenteInEditing.ListaIstitutiDoc[IstCorrispondente].Orari[OrarioCorrispondente].ClasseNome  = ClasseCorrispondente.Anno + ClasseCorrispondente.Sezione;
             $scope.DocenteInEditing.ListaIstitutiDoc[IstCorrispondente].Orari[OrarioCorrispondente].CLASSE      = $scope.ListaClassiIstituto[m].Chiave;
             $scope.DocenteInEditing.ListaIstitutiDoc[IstCorrispondente].Orari[OrarioCorrispondente].ANNO        = $scope.ListaClassiIstituto[m].Anno;               
             $scope.DocenteInEditing.ListaIstitutiDoc[IstCorrispondente].Orari[OrarioCorrispondente].SEZIONE     = $scope.ListaClassiIstituto[m].Sezione;
             $scope.DocenteInEditing.ListaIstitutiDoc[IstCorrispondente].Orari[OrarioCorrispondente].GiornoNome  = GiornoCorrispondente;
             $scope.DocenteInEditing.ListaIstitutiDoc[IstCorrispondente].Orari[OrarioCorrispondente].GIORNO      = Orario.GIORNO;   
             $scope.DocenteInEditing.ListaIstitutiDoc[IstCorrispondente].Orari[OrarioCorrispondente].ORARIO      = Orario.ORARIO;   
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
    if(confirm('Eliminare l\'orario di ' + Orario.MateriaNome + ' del giorno ' + Orario.GiornoNome.toUpperCase() + ' ?'))
    {
      IstCorrispondente = $scope.DocenteInEditing.ListaIstitutiDoc.findIndex(function(AIstituto){return (AIstituto.CHIAVE == Orario.ISTITUTO);});   
      OrarioCorrispondente = $scope.DocenteInEditing.ListaIstitutiDoc[IstCorrispondente].Orari.findIndex(function(AOrario){return(AOrario.MATERIA == Orario.MATERIA && AOrario.ORA == Orario.ORA && AOrario.GIORNO == Orario.GIORNO && AOrario.CLASSE == Orario.CLASSE);});     
      if ($scope.DocenteInEditing.ListaIstitutiDoc[IstCorrispondente].Orari[OrarioCorrispondente].Nuovo)
          $scope.DocenteInEditing.ListaIstitutiDoc[IstCorrispondente].Orari.splice(OrarioCorrispondente,1)
      else
      {
        $scope.DocenteInEditing.ListaOrariEliminati.push($scope.DocenteInEditing.ListaIstitutiDoc[IstCorrispondente].Orari[OrarioCorrispondente]);
        $scope.DocenteInEditing.ListaOrariEliminati[$scope.DocenteInEditing.ListaOrariEliminati.length-1].Eliminato = true;
        $scope.DocenteInEditing.ListaIstitutiDoc[IstCorrispondente].Orari.splice(OrarioCorrispondente,1);
      }       
    }      
  }
  
  $scope.SelezionaIstitutoFiltro = function(ev) 
  { 
    $mdDialog.show({ 
                     controller          : DialogControllerIstitutoFiltro,
                     templateUrl         : "template/associateInstituteTeacherPopup.html",
                     targetEvent         : ev,
                     scope               : $scope,
                     preserveScope       : true,
                     clickOutsideToClose : true
                   })
    .then(function(answer) 
    {
      //A promise that can be resolved with $mdDialog.hide()...
    }, 
    function() 
    {
      //...or rejected with $mdDialog.cancel().
    });
  };
  
  function DialogControllerIstitutoFiltro($scope,$mdDialog)  
  {    
    $scope.hide = function() 
    {
      $mdDialog.hide();
    };

    $scope.AnnullaPopup = function() 
    { 
      $scope.IstitutoDaAssociare = -1;
      $mdDialog.cancel();
    };

    $scope.ConfermaPopup = function(istituto) 
    {     
      if(istituto == -1) 
      { 
        alert ('Nessun istituto selezionato!');      
        return
      }
      else
      { 
        let IstitutoNome   = $scope.ListaIstitutiPopup.find(function(AIstituto) { return(AIstituto.Chiave == istituto);});

          $scope.IstitutoFiltrato = {
                                      "CHIAVE"  : istituto,
                                      "NOME"    : IstitutoNome.Istituto
                                    }                            
          $scope.IstitutoDaAssociare = -1;         
          $mdDialog.hide();
      }
              
    };
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
    {
      //A promise that can be resolved with $mdDialog.hide()...
    }, 
    function() 
    {
      //...or rejected with $mdDialog.cancel().
    });
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
      $scope.ListaSpedizioniDoc = [];    
      if($scope.IsAdministrator())
      {
         SystemInformation.GetSQL('Delivery',{CHIAVE : Docente.Chiave},function(Results)
         {
           $scope.ListaSpedizioniDoc = SystemInformation.FindResults(Results,'TeacherDeliveryListAdm');
           if($scope.ListaSpedizioniDoc != undefined)
           {
             for(let i = 0;i < $scope.ListaSpedizioniDoc.length;i ++)
             {
                 $scope.ListaSpedizioniDoc[i].DATA = ZFormatDateTime('dd/mm/yyyy',ZDateFromHTMLInput($scope.ListaSpedizioniDoc[i].DATA))
             } 
           }
           else SystemInformation.ApplyOnError('Modello lista spedizioni docente non conforme','');       
         },'SelectSQLDocenteAdmin')
      }
      else
      {
         SystemInformation.GetSQL('Delivery',{CHIAVE : Docente.Chiave},function(Results)
         {
           $scope.ListaSpedizioniDoc = SystemInformation.FindResults(Results,'TeacherDeliveryListPrm');
           if($scope.ListaSpedizioniDoc != undefined)
           {
             for(let i = 0;i < $scope.ListaSpedizioniDoc.length;i ++)
             {
                 $scope.ListaSpedizioniDoc[i].DATA = ZFormatDateTime('dd/mm/yyyy',ZDateFromHTMLInput($scope.ListaSpedizioniDoc[i].DATA))
             } 
           }
           else SystemInformation.ApplyOnError('Modello lista spedizioni docente non conforme','');       
         },'SelectSQLDocentePromotore')       
      }
    }
    
    $scope.GetDescrStatoSpedizione = function(Spedizione)
    {
       var Result = '';
       if(Spedizione.NR_PRENOTATE != 0)
       {
          if(Spedizione.NR_DA_SPEDIRE == 0 && Spedizione.NR_CONSEGNATE == 0)
             Result += 'PRENOTATE<br/>';  
          else Result += Spedizione.NR_PRENOTATE + ' PRENOTATE<br/>';  
       }
       if(Spedizione.NR_DA_SPEDIRE != 0)
       {
          if(Spedizione.NR_CONSEGNATE == 0 && Spedizione.NR_PRENOTATE == 0)
             Result += 'DA SPEDIRE<br/>';  
          else Result += Spedizione.NR_DA_SPEDIRE + ' DA SPEDIRE<br/>';  
       }
       if(Spedizione.NR_CONSEGNATE != 0)
       {
          if(Spedizione.NR_DA_SPEDIRE == 0 && Spedizione.NR_PRENOTATE == 0)
             Result += 'CONSEGNATE<br/>';  
          else Result += Spedizione.NR_CONSEGNATE + 'CONSEGNATE<br/>';  
       }
       
       return($sce.trustAsHtml(Result.substr(0,Result.length - 5)));
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
      if(confirm('Eliminare la spedizione della data ' + Spedizione.DATA + ' presso ' + Spedizione.PRESSO + ' ?'))
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
  return function(ListaDocenti,NomeFiltro,MateriaFiltro)
         {
           if(NomeFiltro == '' && MateriaFiltro == -1) 
             return(ListaDocenti);
           var ListaFiltrata = [];
           NomeFiltro = NomeFiltro.toUpperCase();
           MateriaFiltro = parseInt(MateriaFiltro);
           
           var DocenteOk = function(Docente)
           {  
              var Result = true;
              
              if(NomeFiltro != '')
                if(Docente.RagioneSociale.toUpperCase().indexOf(NomeFiltro) < 0)
                   Result = false;
                  
              if(MateriaFiltro != -1)
                 if(Docente.Materia1 != MateriaFiltro && Docente.Materia2 != MateriaFiltro && Docente.Materia3 != MateriaFiltro)
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