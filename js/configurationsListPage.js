SIRIOApp.controller("configurationsListPageController",['$scope','SystemInformation','$state','$rootScope','$mdDialog','ZConfirm','ZPrompt','ZSelect','$sce', function($scope,SystemInformation,$state,$rootScope,$mdDialog,ZConfirm,ZPrompt,ZSelect,$sce)
{ 
  $scope.ListaConfigurazioni        = ['COMBINAZIONI CLASSI','CASE EDITRICI GESTITE','DATI PAGINA 43',"GRUPPI CASE EDITRICI","LUOGHI DISPONIBILITA' DOCENTI",'MATERIE','PROVINCE GESTITE','TIPOLOGIE ISTITUTI GESTITE','TIPOLOGIE ISTITUTI ESCLUSE'];
  $scope.ConfigurazioneSelezionata  = 0;
  
  $scope.ListaMaterie               = [];
  $scope.MateriaInEditing           = {};
  $scope.NuovaMateria               = false;
  
  $scope.ListaTipologie             = [];
  $scope.TipologiaInEditing         = {};
  $scope.NuovaTipologia             = false;
  
  $scope.ListaTipologieEscluse      = [];
  $scope.TipologiaEsclusaInEditing  = {};
  $scope.NuovaTipologiaEsclusa      = false;
  
  $scope.ListaProvince              = [];
  $scope.ProvinciaInEditing         = {};
  $scope.NuovaProvincia             = false;

  $scope.ListaCombinazioni          = [];
  $scope.CombinazioneInEditing      = {};
  $scope.NuovaCombinazione          = false;

  $scope.ListaCase                  = [];
  $scope.CasaInEditing              = {};
  $scope.NuovaCasa                  = false;

  $scope.ListaLuoghi               = [];
  $scope.LuogoInEditing            = {};
  $scope.NuovoLuogo                = false;

  $scope.ListaGruppi               = [];
  $scope.GruppoInEditing           = {};
  $scope.NuovoGruppo               = false;

  $scope.ListaGruppiIstituti       = [];
 
  $scope.TuttiGruppi               = true;
  $scope.PopupGruppiSelect         = [];
  
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
                                               limit: 10,
                                               page: 1
                                             },
                           limitOptions    : [10, 20, 30]
                         };
                         
  $scope.GridOptions_4 = {
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
                         
  $scope.GridOptions_5 = {
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
                        
$scope.GridOptions_6 = {
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

$scope.GridOptions_7 = {
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

$scope.GridOptions_8 = {
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

  $scope.GetListaGruppiIstituti = function()
  {
    SystemInformation.GetSQL('InstituteType', {}, function(Results)  
    {
      GroupsInfoList = SystemInformation.FindResults(Results,'InstituteGroupInfo');
      if(GroupsInfoList != undefined)
      { 
         for(let i = 0;i < GroupsInfoList.length;i ++)
         GroupsInfoList[i] = {
                               Chiave      : GroupsInfoList[i].CHIAVE,
                               Descrizione : GroupsInfoList[i].DESCRIZIONE,
                               Checked     : false
                             }
         $scope.ListaGruppiIstituti = GroupsInfoList;
      }
      else SystemInformation.ApplyOnError('Modello gruppi istituti non conforme','');   
    },'SelectGroups');
  }
                           
  $scope.RefreshListaMaterie = function ()
  {
    SystemInformation.GetSQL('Subject', {}, function(Results)  
    {
      SubjectInfoList = SystemInformation.FindResults(Results,'SubjectInfoListAll');
      SubjectGroups   = SystemInformation.FindResults(Results,'SubjectGroups');
  
      if(SubjectInfoList != undefined && SubjectGroups != undefined)
      { 
         for(let i = 0;i < SubjectInfoList.length;i ++)
         SubjectInfoList[i] = {
                                Chiave           : SubjectInfoList[i].CHIAVE,
                                Descrizione      : SubjectInfoList[i].DESCRIZIONE,
                                Nascosta         : SubjectInfoList[i].NASCOSTA == 1 ? true : false,
                                GruppiIstOld     : [],
                                GruppiIstStringa : []
                              }
         $scope.ListaMaterie = SubjectInfoList;

         for(let i = 0;i < SubjectGroups.length;i ++)
         {
           for(let j = 0;j < $scope.ListaMaterie.length;j ++)
           {
               if(SubjectGroups[i].MATERIA == $scope.ListaMaterie[j].Chiave)
               {
                  $scope.ListaMaterie[j].GruppiIstOld.push(parseInt(SubjectGroups[i].GRUPPO_IST));
                  $scope.ListaMaterie[j].GruppiIstStringa.push(SubjectGroups[i].DESCR_GRUPPO)
               }
           }
         }
      }
      else SystemInformation.ApplyOnError('Modello materie non conforme','');   
    },'SelectAllSQL');
  }

  $scope.GetStringaGruppiMaterie = function(materia)
  {
    var Stringa = 'TUTTI';
    if(materia.GruppiIstStringa.length != 4)
    {
       Stringa = '';
       for(let i = 0; i < materia.GruppiIstStringa.length;i ++)
           Stringa += materia.GruppiIstStringa[i] + ' </br>';
    }
    return($sce.trustAsHtml(Stringa));
  }
  
  $scope.RefreshListaTipologie = function ()
  {
    SystemInformation.GetSQL('InstituteType', {}, function(Results)  
    {
      TypeInfoList = SystemInformation.FindResults(Results,'InstituteTypeInfoList');
      if(TypeInfoList != undefined)
      { 
         for(let i = 0;i < TypeInfoList.length;i ++)
         TypeInfoList[i] = {
                             Chiave      : TypeInfoList[i].CHIAVE,
                             Descrizione : TypeInfoList[i].DESCRIZIONE
                           }
         $scope.ListaTipologie = TypeInfoList
      }      
      else SystemInformation.ApplyOnError('Modello tipologie non conforme','');   
    });
  }
  
  $scope.RefreshListaTipologieEscluse = function ()
  {
    SystemInformation.GetSQL('InstituteExclType', {}, function(Results)  
    {
      ExcludedTypeInfoList = SystemInformation.FindResults(Results,'InstituteExclTypeInfoList');
      if(ExcludedTypeInfoList != undefined)
      { 
         for(let i = 0;i < ExcludedTypeInfoList.length;i ++)
         ExcludedTypeInfoList[i] = {
                                     Chiave      : ExcludedTypeInfoList[i].CHIAVE,
                                     Descrizione : ExcludedTypeInfoList[i].DESCRIZIONE
                                   }
         $scope.ListaTipologieEscluse = ExcludedTypeInfoList
      } 
      else SystemInformation.ApplyOnError('Modello tipologie escluse non conforme','');   
    });
  }

  $scope.RefreshListaProvince = function ()
  {
    SystemInformation.GetSQL('Province', {}, function(Results)  
    {
      ProvinceInfoList = SystemInformation.FindResults(Results,'ProvinceInfoList');
      if(ProvinceInfoList != undefined)
      { 
         for(let i = 0;i < ProvinceInfoList.length;i ++)
         ProvinceInfoList[i] = {
                                 Chiave      : ProvinceInfoList[i].CHIAVE,
                                 Descrizione : ProvinceInfoList[i].NOME
                               }
         $scope.ListaProvince = ProvinceInfoList
      }
      else SystemInformation.ApplyOnError('Modello province non conforme','');   
    });
  }

  $scope.RefreshListaCombinazioni = function ()
  {
    SystemInformation.GetSQL('Combination', {}, function(Results)  
    {
      CombinazioniInfoList = SystemInformation.FindResults(Results,'CombinationInfoList');
      if(CombinazioniInfoList != undefined)
      { 
         for(let i = 0;i < CombinazioniInfoList.length;i ++)
         CombinazioniInfoList[i] = {
                                     Chiave      : CombinazioniInfoList[i].CHIAVE,
                                     Descrizione : CombinazioniInfoList[i].DESCRIZIONE
                                   }
         $scope.ListaCombinazioni = CombinazioniInfoList
      } 
      else SystemInformation.ApplyOnError('Modello materie non conforme','');   
    });
  }

  $scope.RefreshListaCase = function ()
  {
    SystemInformation.GetSQL('Publisher', {}, function(Results)  
    {
      CaseInfoList = SystemInformation.FindResults(Results,'PublisherInfoList');
      if(CaseInfoList != undefined)
      { 
         for(let i = 0;i < CaseInfoList.length;i ++)
         CaseInfoList[i] = {
                             Chiave       : CaseInfoList[i].CHIAVE,
                             Descrizione  : CaseInfoList[i].DESCRIZIONE,
                             GruppoChiave : CaseInfoList[i].GRUPPO == undefined ? -1 : CaseInfoList[i].GRUPPO,
                             GruppoNome   : CaseInfoList[i].GRUPPO_NOME == undefined ? '' : CaseInfoList[i].GRUPPO_NOME
                           }
         $scope.ListaCase = CaseInfoList
      } 
      else SystemInformation.ApplyOnError('Modello case editrici non conforme','');   
    });
  }

  $scope.RefreshListaLuoghi = function ()
  {
    SystemInformation.GetSQL('Schedule', {}, function(Results)  
    {
      LuoghiInfoList = SystemInformation.FindResults(Results,'ScheduleInfoList');
      if(LuoghiInfoList != undefined)
      { 
         for(let i = 0;i < LuoghiInfoList.length;i ++)
         LuoghiInfoList[i] = {
                             Chiave      : LuoghiInfoList[i].CHIAVE,
                             Descrizione : LuoghiInfoList[i].DESCRIZIONE
                           }
         $scope.ListaLuoghi = LuoghiInfoList
      } 
      else SystemInformation.ApplyOnError('Modello luoghi disponibilità docenti non conforme','');   
    });
  }

  $scope.RefreshListaGruppi = function ()
  {
    SystemInformation.GetSQL('PublisherGroup', {}, function(Results)  
    {
      GruppiInfoList = SystemInformation.FindResults(Results,'GroupInfoList');
      if(GruppiInfoList != undefined)
      { 
         for(let i = 0;i < GruppiInfoList.length;i ++)
         GruppiInfoList[i] = {
                               Chiave      : parseInt(GruppiInfoList[i].CHIAVE),
                               Descrizione : GruppiInfoList[i].DESCRIZIONE,
                               Checked     : false
                             }
         $scope.ListaGruppi = GruppiInfoList
      } 
      else SystemInformation.ApplyOnError('Modello gruppi case editrici non conforme','');   
    });
  }
  
  $scope.GetDatiDitta = function ()
  {
    SystemInformation.GetSQL('CompanyData',{}, function (Results)
    {
      $scope.DatiDitta = {};
      DatiDittaSql     = SystemInformation.FindResults(Results,'GetCompanyData');
      if (DatiDittaSql != undefined)
      {
        $scope.DatiDitta.INDIRIZZO           = DatiDittaSql[0].INDIRIZZO;
        $scope.DatiDitta.TELEFONO            = DatiDittaSql[0].TELEFONO;
        $scope.DatiDitta.EMAIL               = DatiDittaSql[0].EMAIL;
        $scope.DatiDitta.EMAIL_ARCHIVIO      = DatiDittaSql[0].EMAIL_ARCHIVIO;
        $scope.DatiDitta.SITO_WEB            = DatiDittaSql[0].SITO_WEB;
        $scope.DatiDitta.URL_CALENDARIO      = DatiDittaSql[0].URL_CALENDARIO;
        $scope.DatiDitta.CALENDARIO_VISIBILE = DatiDittaSql[0].CALENDARIO_VISIBILE == 'T' ? true : false;
        $scope.DatiDitta.NR_ALUNNI           = parseInt(DatiDittaSql[0].NR_ALUNNI);
      }
      else SystemInformation.ApplyOnError('Modello dati ditta non conforme','');
    });
  }
 
  //MATERIE  

  $scope.RendiVisibileMateria = function(ChiaveMateria,NomeMateria)
  {
     var ConfermaVisibilita = function()
     {
        var $ObjQuery = { Operazioni : [] };         
        $ObjQuery.Operazioni.push({
                                    Query     : 'UnhideSubject',
                                    Parametri : {CHIAVE : ChiaveMateria}
                                  }); 
        
        SystemInformation.PostSQL('Subject',$ObjQuery,function(Answer)
        {
          $scope.RefreshListaMaterie(); 
        });
     }
     ZConfirm.GetConfirmBox('AVVISO',"Rendere visibile nuovamente la materia?" + NomeMateria + " ?",ConfermaVisibilita,function(){});

  }

  $scope.UnisciMateria = function(MateriaOld,MateriaOldDescrizione)
  {
     $mdDialog.show({ 
      controller          : DialogControllerUnisciMaterie,
      templateUrl         : "template/hideSubjectPopup.html",
      targetEvent         : MateriaOld,
      scope               : $scope,
      preserveScope       : true,
      clickOutsideToClose : true,
      locals              : {MateriaOld,MateriaOldDescrizione}
    })
    .then(function(answer) 
    {}, 
    function() 
    {});
  }

  function DialogControllerUnisciMaterie($scope,$mdDialog,MateriaOld,MateriaOldDescrizione)
  {
    $scope.MateriaOldDescrizione = MateriaOldDescrizione; 
    $scope.ListaMaterieF         = [];
    $scope.ListaMaterieF         = Array.from($scope.ListaMaterie);
    for(let i = 0;i < $scope.ListaMaterieF.length;i ++)
        if($scope.ListaMaterieF[i].Chiave == MateriaOld)
           $scope.ListaMaterieF.splice(i, 1);
           

    $scope.queryMateria = function(searchTextMat)
    {
       searchTextMat = searchTextMat.toUpperCase();
       return($scope.ListaMaterieF.grep(function(Elemento) 
       { 
         return(Elemento.Descrizione.toUpperCase().indexOf(searchTextMat) != -1);
       }));
    }
    
    $scope.selectedItemChangeMateria = function(itemMat)
    {
      if(itemMat != undefined)
      {
        $scope.MateriaScelta     = itemMat.Chiave;
        $scope.MateriaSceltaNome = itemMat.Descrizione;
      }
      else $scope.MateriaScelta  = -1;
    }
    
    $scope.hide = function() 
    {
      $mdDialog.hide();
    };

    $scope.AnnullaPopup = function() 
    { 
      $scope.ListaMaterieF         = [];
      $scope.MateriaOldDescrizione = '';
      $scope.MateriaScelta         = -1;
      $scope.MateriaSceltaNome     = '';
      $mdDialog.cancel();
    };

    $scope.ConfermaPopup = function()
    {
      if($scope.MateriaScelta == -1) 
      { 
        ZCustomAlert($mdDialog,'ATTENZIONE','NESSUNA MATERIA SELEZIONATA!');      
        return
      }
      else
      {
        var ConfermaPassaggio = function()          
        {
           var $ObjQuery = {Operazioni:[]}
           ParametriUnione = {
                               OldMateria : parseInt(MateriaOld), 
                               NewMateria : parseInt($scope.MateriaScelta) 
                             }
           $ObjQuery.Operazioni.push({
                                       Query     : 'MergeSubjects',
                                       Parametri : ParametriUnione
                                     });
           SystemInformation.PostSQL('Subject',$ObjQuery,function(Answer)
           {
             $scope.ListaMaterieF         = [];
             $scope.MateriaOldDescrizione = '';
             $scope.MateriaScelta         = -1;
             $scope.MateriaSceltaNome     = '';
             $mdDialog.hide();
             $scope.RefreshListaMaterie();                 
           });
        }
        ZConfirm.GetConfirmBox('AVVISO',"Cliccando CONFERMA la materia " + $scope.MateriaOldDescrizione + " sarà sostituita ovunque dalla materia " + $scope.MateriaSceltaNome + ".Confermi?",ConfermaPassaggio,function(){});              
     }   
    }
  }

  $scope.ModificaMateria = function(Materia)
  {
      $mdDialog.show({ 
                      controller          : DialogModificaMateria,
                      templateUrl         : "template/subjectPopup.html",
                      scope               : $scope,
                      preserveScope       : true,
                      clickOutsideToClose : true,
                      locals              : {Materia}
                    })
      .then(function(answer) 
      {
      }, 
      function() 
      {
      });
  }

  function DialogModificaMateria(Materia)
  {
    if ($scope.MateriaInEditing.Chiave != -1 || $scope.MateriaInEditing == undefined)
        $scope.MateriaInEditing = {
                                    Chiave       : Materia.Chiave,
                                    Descrizione  : Materia.Descrizione,
                                    GruppiIstOld : Materia.GruppiIstOld,
                                    ListaGruppi  : Array.from($scope.ListaGruppiIstituti)
                                  }

    if($scope.MateriaInEditing.GruppiIstOld.length != 0)
    {
       for(let i = 0;i < $scope.MateriaInEditing.GruppiIstOld.length;i ++)
       {
           for(let j = 0;j < $scope.MateriaInEditing.ListaGruppi.length;j ++)
               if ($scope.MateriaInEditing.GruppiIstOld[i] == $scope.MateriaInEditing.ListaGruppi[j].Chiave)
                   $scope.MateriaInEditing.ListaGruppi[j].Checked = true;
       }
    }
    else for(let i = 0;i < $scope.MateriaInEditing.ListaGruppi.length;i ++)
                   $scope.MateriaInEditing.ListaGruppi[i].Checked = true;


    $scope.AnnullaPopupMateria = function()
    {
      $mdDialog.hide();
      $scope.MateriaInEditing = {};
    }
    

    $scope.ConfermaPopupMateria = function(Materia)
    {
      MateriaExist = $scope.ListaMaterie.find(function(AMateria){return ((AMateria.Descrizione == Materia.Descrizione) && (AMateria.Chiave != Materia.Chiave));});
      if(MateriaExist)
         ZCustomAlert($mdDialog,'ATTENZIONE','Materia già esistente!')
      else
      {
         var $ObjQuery     = { Operazioni : [] };     
         if(Materia.Chiave == -1)     
         {           
           $ObjQuery.Operazioni.push({
                                       Query     : 'InsertSubject',
                                       Parametri : {
                                                     DESCRIZIONE : Materia.Descrizione.xSQL(),
                                                   }
                                     });
           
           for(let i = 0;i < Materia.ListaGruppi.length;i ++)
           {
               if(Materia.ListaGruppi[i].Checked)
                  $ObjQuery.Operazioni.push({
                                              Query     : 'InsertSubjectGroupAfterInsert',
                                              Parametri : {
                                                            GRUPPO : Materia.ListaGruppi[i].Chiave
                                                          }
                                            });
           }
         }
         else
         {
           $ObjQuery.Operazioni.push({
                                       Query     : 'UpdateSubject',
                                       Parametri : {
                                                     CHIAVE      : Materia.Chiave,
                                                     DESCRIZIONE : Materia.Descrizione.xSQL(),
                                                   }
                                     });

           for(let i = 0;i < Materia.ListaGruppi.length;i ++)
           {
               var Trovato = Materia.GruppiIstOld.find(function(AGruppo){return (AGruppo == Materia.ListaGruppi[i].Chiave);});
               if(Trovato == undefined && Materia.ListaGruppi[i].Checked)
               {
                   $ObjQuery.Operazioni.push({
                                               Query     : 'InsertSubjectGroup',
                                               Parametri : {
                                                             MATERIA    : Materia.Chiave,
                                                             GRUPPO_IST : Materia.ListaGruppi[i].Chiave
                                                           }
                                             });
               }
               if(Trovato != undefined && !Materia.ListaGruppi[i].Checked)
               {
                  $ObjQuery.Operazioni.push({
                                              Query     : 'DeleteSubjectGroup',
                                              Parametri : {
                                                            MATERIA    : Materia.Chiave,
                                                            GRUPPO_IST : Materia.ListaGruppi[i].Chiave
                                                          }
                                            });
               }
           }
         };
      
         SystemInformation.PostSQL('Subject',$ObjQuery,function(Answer)
         {
           $ObjQuery               = {};
           $scope.MateriaInEditing = {};
           $mdDialog.hide();
           $scope.RefreshListaMaterie();
         });
      }
    }
  }

  $scope.NuovaMateria = function (ev) 
  {
    $scope.MateriaInEditing = {
                                Chiave       : -1,
                                Descrizione  : '',
                                GruppiIstOld : [],
                                ListaGruppi  : Array.from($scope.ListaGruppiIstituti)
                              }
    $scope.ModificaMateria($scope.MateriaInEditing)
  };
  
  $scope.EliminaMateria = function(Materia)
  {
    var EliminaMat = function()
    {
      var $ObjQuery = { Operazioni : [] };
      var ParamMateria = { CHIAVE : Materia.Chiave };
       
      $ObjQuery.Operazioni.push({
                                  Query     : 'DeleteAllGroupSubject',
                                  Parametri : ParamMateria
                                });     

      $ObjQuery.Operazioni.push({
                                  Query     : 'DeleteSubject',
                                  Parametri : ParamMateria
                                });
      
      /*$ObjQuery.Operazioni.push({
                                  Query     : 'DeleteTeacherSubject1',
                                  Parametri : ParamMateria
                                });
      
      $ObjQuery.Operazioni.push({
                                  Query     : 'DeleteTeacherSubject2',
                                  Parametri : ParamMateria
                                });
      
      $ObjQuery.Operazioni.push({
                                  Query     : 'DeleteTeacherSubject3',
                                  Parametri : ParamMateria
                                });*/
                                                                
      SystemInformation.PostSQL('Subject',$ObjQuery,function(Answer)
      {
        $scope.RefreshListaMaterie();
      });  
    }
    ZConfirm.GetConfirmBox('AVVISO','ELIMINARE LA MATERIA: ' + Materia.Descrizione + ' ?',EliminaMat,function(){});      
  }
  
  //TIPOLOGIE  
  
  $scope.ModificaTipologia = function (Tipologia)
  {
    var ModificaTip = function(Answer)
    {
      TipologiaInEditing = Answer;
      if (TipologiaInEditing === "") $scope.RefreshListaTipologie()
      else 
      {   
        var ParamTipologia = {
                               CHIAVE      : Tipologia.Chiave,
                               DESCRIZIONE : TipologiaInEditing.toUpperCase()
                             }
        $scope.ConfermaTipologia(ParamTipologia);
      }    
    } 
    ZPrompt.GetPromptBox('MODIFICA INSERIMENTO','MODIFICA TIPOLOGIA ISTITUTO: ',Tipologia.Descrizione,ModificaTip,function(){});   
  }
  
  $scope.NuovaTipologia = function ()
  { 
    var CreaTip = function(Answer)
    {
      TipologiaInEditing = Answer;
      if (TipologiaInEditing === "") $scope.RefreshListaTipologie()
      else 
      {       
        var ParamTipologia = {
                               CHIAVE      : -1,
                               DESCRIZIONE : TipologiaInEditing.toUpperCase()
                             }
        $scope.ConfermaTipologia(ParamTipologia);
      }
    }  
    ZPrompt.GetPromptBox('NUOVO INSERIMENTO','NUOVA TIPOLOGIA ISTITUTO: ',"",CreaTip,function(){});  
  }
  
  $scope.ConfermaTipologia = function (param)
  { 
    TipologiaExist = $scope.ListaTipologie.find(function(ATipologia){return (ATipologia.Descrizione == param.DESCRIZIONE);});
    if(TipologiaExist)
    ZCustomAlert($mdDialog,'ATTENZIONE','Tipologia già esistente!')
    else
    {     
       var $ObjQuery      = { Operazioni : [] };     
       var NuovaTipologia = (param.CHIAVE == -1);
       param.DESCRIZIONE = param.DESCRIZIONE.xSQL();
       if(NuovaTipologia)     
       {           
         $ObjQuery.Operazioni.push({
                                     Query     : 'InsertInstituteType',
                                     Parametri : param
                                   }); 
       }
       else
       {
         $ObjQuery.Operazioni.push({
                                     Query     : 'UpdateInstituteType',
                                     Parametri : param
                                   });
       };
    
       SystemInformation.PostSQL('InstituteType',$ObjQuery,function(Answer)
       {
         if(param.CHIAVE == -1)
            param.CHIAVE = Answer.NewKey1;
         $scope.RefreshListaTipologie();
       }); 
    }    
  }
  
  $scope.EliminaTipologia = function(Tipologia)
  {
    var EliminaTip = function()
    {
      var $ObjQuery      = { Operazioni : [] };
      var ParamTipologia = { CHIAVE : Tipologia.Chiave };
       
      /*$ObjQuery.Operazioni.push({
                                  Query     : 'DeleteInstituteInstituteType',
                                  Parametri : ParamTipologia
                                });*/
      
      $ObjQuery.Operazioni.push({
                                  Query     : 'DeleteInstituteType',
                                  Parametri : ParamTipologia
                                });
                                                                
      SystemInformation.PostSQL('InstituteType',$ObjQuery,function(Answer)
      {
        $scope.RefreshListaTipologie();
      });  
    }
    ZConfirm.GetConfirmBox('AVVISO','ELIMINARE LA TIPOLOGIA: ' + Tipologia.Descrizione + ' ?',EliminaTip,function(){});      
  }
  
  //TIPOLOGIE ESCLUSE  
  
  $scope.ModificaTipologiaEsclusa = function (TipologiaEsclusa)
  {    
    var ModificaTipExcl = function(Answer)
    {
      var TipologiaEsclusaInEditing = Answer;
      if (TipologiaEsclusaInEditing === null) $scope.RefreshListaTipologieEscluse()
      else 
      {   
        var ParamTipologiaEsclusa = {
                                      CHIAVE      : TipologiaEsclusa.Chiave,
                                      DESCRIZIONE : TipologiaEsclusaInEditing.toUpperCase()
                                    }
        $scope.ConfermaTipologiaEsclusa(ParamTipologiaEsclusa);
      }    
    }
    ZPrompt.GetPromptBox('MODIFICA INSERIMENTO','MODIFICA TIPOLOGIA ESCLUSA ISTITUTO: ',TipologiaEsclusa.Descrizione,ModificaTipExcl,function(){});      
  }
  
  $scope.NuovaTipologiaEsclusa = function ()
  {
    var CreaTipExcl = function(Answer)
    {
      var TipologiaEsclusaInEditing = Answer;
      if (TipologiaEsclusaInEditing === null) $scope.RefreshListaTipologieEscluse()
      else 
      {       
        var ParamTipologiaEsclusa = {
                                      CHIAVE      : -1,
                                      DESCRIZIONE : TipologiaEsclusaInEditing.toUpperCase()
                                    }
        $scope.ConfermaTipologiaEsclusa(ParamTipologiaEsclusa);
      }
    }    
    ZPrompt.GetPromptBox('NUOVO INSERIMENTO','NUOVA TIPOLOGIA ISTITUTO ESCLUSA: ',"",CreaTipExcl,function(){});      
  }
  
  $scope.ConfermaTipologiaEsclusa = function (param)
  { 
    TipologiaExclExist = $scope.ListaTipologieEscluse.find(function(ATipologiaExcl){return (ATipologiaExcl.Descrizione == param.DESCRIZIONE);});
    if(TipologiaExclExist)
       ZCustomAlert($mdDialog,'ATTENZIONE','Tipologia esclusa già esistente!')
    else
    {   
       var $ObjQuery             = { Operazioni : [] };     
       var NuovaTipologiaEsclusa = (param.CHIAVE == -1);
       param.DESCRIZIONE = param.DESCRIZIONE.xSQL();
       if(NuovaTipologiaEsclusa)     
       {           
         $ObjQuery.Operazioni.push({
                                     Query     : 'InsertInstituteExclType',
                                     Parametri : param
                                   }); 
       }
       else
       {
         $ObjQuery.Operazioni.push({
                                     Query     : 'UpdateInstituteExclType',
                                     Parametri : param
                                   });
       };
    
       SystemInformation.PostSQL('InstituteExclType',$ObjQuery,function(Answer)
       {
         if(param.CHIAVE == -1)
            param.CHIAVE = Answer.NewKey1;
         $scope.RefreshListaTipologieEscluse();
       });
    }    
  }
  
  $scope.EliminaTipologiaEsclusa = function(TipologiaEsclusa)
  {
    var EliminaTipExcl = function()
    {
      var $ObjQuery             = { Operazioni : [] };
      var ParamTipologiaEsclusa = { CHIAVE : TipologiaEsclusa.Chiave };
      
      $ObjQuery.Operazioni.push({
                                  Query     : 'DeleteInstituteExclType',
                                  Parametri : ParamTipologiaEsclusa
                                });
                                                                
      SystemInformation.PostSQL('InstituteExclType',$ObjQuery,function(Answer)
      {
        $scope.RefreshListaTipologieEscluse();
      });  
    }
    ZConfirm.GetConfirmBox('AVVISO','ELIMINARE LA TIPOLOGIA ESCLUSA: ' + TipologiaEsclusa.Descrizione + ' ?',EliminaTipExcl,function(){});      
  }

  //PROVINCE
  
  $scope.ModificaProvincia = function (Provincia)
  {
    var ModificaProv = function(Answer)
    {
      ProvinciaInEditing = Answer;
      if (ProvinciaInEditing === null) $scope.RefreshListaProvince()
      else 
      {   
        var ParamProvincia = {
                              CHIAVE : Provincia.Chiave,
                              NOME   : ProvinciaInEditing.toUpperCase()
                            }
        $scope.ConfermaProvincia(ParamProvincia);
      }    
    }
    ZPrompt.GetPromptBox('MODIFICA INSERIMENTO','MODIFICA PROVINCIA GESTITA: ',Provincia.Descrizione,ModificaProv,function(){});      
  }
  
  $scope.NuovaProvincia = function ()
  { 
    var CreaProv = function(Answer)
    {
      ProvinciaInEditing = Answer;
      if (ProvinciaInEditing === null) $scope.RefreshListaProvince()
      else 
      {       
        var ParamProvincia = {
                              CHIAVE : -1,
                              NOME   : ProvinciaInEditing.toUpperCase()
                            }
        $scope.ConfermaProvincia(ParamProvincia);
      }
    }
    ZPrompt.GetPromptBox('NUOVO INSERIMENTO','NUOVA PROVINCIA GESTITA: ',"",CreaProv,function(){});      
  }
  
  $scope.ConfermaProvincia = function (param)
  { 
    ProvinciaExist = $scope.ListaProvince.find(function(AProvincia){return (AProvincia.Nome == param.NOME);});
    if(ProvinciaExist)
       ZCustomAlert($mdDialog,'ATTENZIONE','Provincia gestita già esistente!')
    else
    {   
       var $ObjQuery       = { Operazioni : [] };     
       var NuovaProvincia  = (param.CHIAVE == -1);
       if(NuovaProvincia)     
       {           
         $ObjQuery.Operazioni.push({
                                     Query     : 'InsertProvince',
                                     Parametri : param
                                   }); 
       }
       else
       {
         $ObjQuery.Operazioni.push({
                                     Query     : 'UpdateProvince',
                                     Parametri : param
                                   });
       };
    
       SystemInformation.PostSQL('Province',$ObjQuery,function(Answer)
       {
         if(param.CHIAVE == -1)
            param.CHIAVE = Answer.NewKey1;
         $scope.RefreshListaProvince();
       });
    }    
  }
  
  $scope.EliminaProvincia = function(Provincia)
  {
    var EliminaProv = function()
    {
      var $ObjQuery      = { Operazioni : [] };
      var ParamProvincia = { CHIAVE : Provincia.Chiave };
       
      $ObjQuery.Operazioni.push({
                                  Query     : 'DeleteProvince',
                                  Parametri : ParamProvincia
                                });
                                                                
      SystemInformation.PostSQL('Province',$ObjQuery,function(Answer)
      {
        $scope.RefreshListaProvince();
      });  
    }
    ZConfirm.GetConfirmBox('AVVISO','ELIMINARE LA PROVINCIA: ' + Provincia.Descrizione + ' ?',EliminaProv,function(){});          
  }

  //COMBINAZIONI  
 
  $scope.ModificaCombinazione = function (Combinazione)
  {
    var ModificaComb = function(Answer)
    {
      CombinazioneInEditing = Answer;
      if (CombinazioneInEditing === "") $scope.RefreshListaCombinazioni()
      else 
      {   
        var ParamCombinazione = {
                                  CHIAVE      : Combinazione.Chiave,
                                  DESCRIZIONE : CombinazioneInEditing.toUpperCase()
                                }
        $scope.ConfermaCombinazione(ParamCombinazione);
      }
    }    
    ZPrompt.GetPromptBox('MODIFICA INSERIMENTO','MODIFICA COMBINAZIONE: ',Combinazione.Descrizione,ModificaComb,function(){});         
  }
  
  $scope.NuovaCombinazione = function ()
  { 
    var CreaComb = function(Answer)
    {
      CombinazioneInEditing = Answer;
      if (CombinazioneInEditing === "") $scope.RefreshListaCombinazioni()
      else 
      {       
        var ParamCombinazione = {
                                  CHIAVE      : -1,
                                  DESCRIZIONE : CombinazioneInEditing.toUpperCase()
                                }
        $scope.ConfermaCombinazione(ParamCombinazione);
      }
    }    
    ZPrompt.GetPromptBox('NUOVO INSERIMENTO','NUOVA COMBINAZIONE: ',"",CreaComb,function(){});      
  }
  
  $scope.ConfermaCombinazione = function (param)
  { 
    CombinazioneExist = $scope.ListaCombinazioni.find(function(ACombinazione){return (ACombinazione.Descrizione == param.DESCRIZIONE);});
    if(CombinazioneExist)
       ZCustomAlert($mdDialog,'ATTENZIONE','Combinazione già esistente!')
    else
    {
       var $ObjQuery         = { Operazioni : [] };     
       var NuovaCombinazione = (param.CHIAVE == -1);
       param.DESCRIZIONE = param.DESCRIZIONE.xSQL();
       if(NuovaCombinazione)     
       {           
         $ObjQuery.Operazioni.push({
                                     Query     : 'InsertCombination',
                                     Parametri : param
                                   }); 
       }
       else
       {
         $ObjQuery.Operazioni.push({
                                     Query     : 'UpdateCombination',
                                     Parametri : param
                                   });
       };
    
       SystemInformation.PostSQL('Combination',$ObjQuery,function(Answer)
       {
         if(param.CHIAVE == -1)
            param.CHIAVE = Answer.NewKey1;
         $scope.RefreshListaCombinazioni();
       });
    }    
  }
  
  $scope.EliminaCombinazione = function(Combinazione)
  {
    var EliminaComb = function()
    {
      var $ObjQuery         = { Operazioni : [] };
      var ParamCombinazione = { CHIAVE : Combinazione.Chiave };
       
      $ObjQuery.Operazioni.push({
                                  Query     : 'DeleteCombination',
                                  Parametri : ParamCombinazione
                                });
                                                                
      SystemInformation.PostSQL('Combination',$ObjQuery,function(Answer)
      {
        $scope.RefreshListaCombinazioni();
      });  
    }
    ZConfirm.GetConfirmBox('AVVISO','ELIMINARE LA COMBINAZIONE: ' + Combinazione.Descrizione + ' ?',EliminaComb,function(){});          
  }

  //CASE EDITRICI  
 
  $scope.ModificaCasa = function (Casa)
  {
    var ModificaCsEd = function(Answer)
    {
      CasaInEditing = Answer;
      if (CasaInEditing === "") $scope.RefreshListaCase()
      else 
      {   
        var ParamCasa = {
                          CHIAVE      : Casa.Chiave,
                          DESCRIZIONE : CasaInEditing.toUpperCase()
                        }
        $scope.ConfermaCasa(ParamCasa);
      }
    }   
    ZPrompt.GetPromptBox('MODIFICA INSERIMENTO','MODIFICA CASA EDITRICE: ',Casa.Descrizione,ModificaCsEd,function(){});         
  }

  $scope.ModificaGruppoCasa = function (Casa)
  {
    var ModificaGruppoCasa = function(Answer)
    {
      CasaInEditing = Answer;
      var ParamCasa = {
                        CHIAVE      : Casa.Chiave,
                        GRUPPO      : Answer
                      }
      $scope.ConfermaGruppoCasa(ParamCasa);
    }   
    ZSelect.GetSelectBox('MODIFICA INSERIMENTO','MODIFICA GRUPPO APPARTENENZA: ',parseInt(Casa.GruppoChiave),$scope.ListaGruppi,'GRUPPO',ModificaGruppoCasa,function(){});         
  }

  $scope.ConfermaGruppoCasa = function(param)
  {
    var $ObjQuery = { Operazioni : [] };
    if(param.GRUPPO == -1)  
       param.GRUPPO = null;   
    $ObjQuery.Operazioni.push({
                                Query     : 'UpdatePublisherGroup',
                                Parametri : param
                              });
 
    SystemInformation.PostSQL('Publisher',$ObjQuery,function(Answer)
    {
      $scope.RefreshListaCase();
    });
  }
  
  $scope.NuovaCasa = function ()
  { 
    var CreaCsEd = function(Answer)
    {
      CasaInEditing = Answer;
      if (CasaInEditing === null) $scope.RefreshListaCase()
      else 
      {       
        var ParamCasa = {
                          CHIAVE      : -1,
                          DESCRIZIONE : CasaInEditing.toUpperCase()
                        }
        $scope.ConfermaCasa(ParamCasa);
      }
    }
    ZPrompt.GetPromptBox('NUOVO INSERIMENTO','NUOVA CASA EDITRICE: ',"",CreaCsEd,function(){});         
  }
  
  $scope.ConfermaCasa = function (param)
  { 
    CasaExist = $scope.ListaCase.find(function(ACasa){return (ACasa.Descrizione == param.DESCRIZIONE);});
    if(CasaExist)
       ZCustomAlert($mdDialog,'ATTENZIONE','Casa editrice gestita già esistente!')
    else
    {
       var $ObjQuery = { Operazioni : [] };     
       var NuovaCasa = (param.CHIAVE == -1);
       param.DESCRIZIONE = param.DESCRIZIONE.xSQL();
       if(NuovaCasa)     
       {           
         $ObjQuery.Operazioni.push({
                                     Query     : 'InsertPublisher',
                                     Parametri : param
                                   }); 
       }
       else
       {
         $ObjQuery.Operazioni.push({
                                     Query     : 'UpdatePublisher',
                                     Parametri : param
                                   });
       };
    
       SystemInformation.PostSQL('Publisher',$ObjQuery,function(Answer)
       {
         if(param.CHIAVE == -1)
            param.CHIAVE = Answer.NewKey1;
         $scope.RefreshListaCase();
       });
    }    
  }
  
  $scope.EliminaCasa = function(Casa)
  {
    var EliminaCasEd = function()
    {
      var $ObjQuery = { Operazioni : [] };
      var ParamCasa = { CHIAVE : Casa.Chiave };
       
      $ObjQuery.Operazioni.push({
                                  Query     : 'DeletePublisher',
                                  Parametri : ParamCasa
                                });
                                                                
      SystemInformation.PostSQL('Publisher',$ObjQuery,function(Answer)
      {
        $scope.RefreshListaCase();
      });  
    }
    ZConfirm.GetConfirmBox('AVVISO','ELIMINARE LA CASA EDITRICE: ' + Casa.Descrizione + ' ?',EliminaCasEd,function(){});          
  }

  //GRUPPI CASE EDITRICI  
 
  $scope.ModificaGruppo = function (Gruppo)
  {
    var ModificaGruppo = function(Answer)
    {
      GruppoInEditing = Answer;
      if (GruppoInEditing === "") $scope.RefreshListaGruppi()
      else 
      {   
        var ParamGruppo = {
                            CHIAVE      : Gruppo.Chiave,
                            DESCRIZIONE : GruppoInEditing.toUpperCase()
                          }
        $scope.ConfermaGruppo(ParamGruppo);
      }
    }   
    ZPrompt.GetPromptBox('MODIFICA INSERIMENTO','MODIFICA GRUPPO CASA EDITRICE: ',Gruppo.Descrizione,ModificaGruppo,function(){});         
  }
  
  $scope.NuovoGruppo = function ()
  { 
    var CreaGruppo = function(Answer)
    {
      GruppoInEditing = Answer;
      if (GruppoInEditing === null) $scope.RefreshListaGruppi()
      else 
      {       
        var ParamGruppo = {
                            CHIAVE      : -1,
                            DESCRIZIONE : GruppoInEditing.toUpperCase()
                          }
        $scope.ConfermaGruppo(ParamGruppo);
      }
    }
    ZPrompt.GetPromptBox('NUOVO INSERIMENTO','NUOVO GRUPPO CASA EDITRICE: ',"",CreaGruppo,function(){});         
  }
  
  $scope.ConfermaGruppo = function (param)
  { 
    GruppoExist = $scope.ListaGruppi.find(function(AGruppo){return (AGruppo.Descrizione == param.DESCRIZIONE);});
    if(GruppoExist)
       ZCustomAlert($mdDialog,'ATTENZIONE','Gruppo case editrici già esistente!')
    else
    {
       var $ObjQuery     = { Operazioni : [] };     
       var NuovoGruppo   = (param.CHIAVE == -1);
       param.DESCRIZIONE = param.DESCRIZIONE.xSQL();
       if(NuovoGruppo)     
       {           
         $ObjQuery.Operazioni.push({
                                     Query     : 'InsertGroup',
                                     Parametri : param
                                   }); 
       }
       else
       {
         $ObjQuery.Operazioni.push({
                                     Query     : 'UpdateGroup',
                                     Parametri : param
                                   });
       };
    
       SystemInformation.PostSQL('PublisherGroup',$ObjQuery,function(Answer)
       {
         if(param.CHIAVE == -1)
            param.CHIAVE = Answer.NewKey1;
         $scope.RefreshListaGruppi();
       });
    }    
  }
  
  $scope.EliminaGruppo = function(Gruppo)
  {
    var EliminaGruppo = function()
    {
      var $ObjQuery   = { Operazioni : [] };
      var ParamGruppo = { CHIAVE : Gruppo.Chiave };
       
      $ObjQuery.Operazioni.push({
                                  Query     : 'DeleteGroup',
                                  Parametri : ParamGruppo
                                });
                                                                
      SystemInformation.PostSQL('PublisherGroup',$ObjQuery,function(Answer)
      {
        $scope.RefreshListaGruppi();
      });  
    }
    ZConfirm.GetConfirmBox('AVVISO','ELIMINARE IL GRUPPO DI CASE EDITRICI: ' + Gruppo.Descrizione + ' ?',EliminaGruppo,function(){});          
  }

  //LUOGHI DISPONIBILITA'
 
  $scope.ModificaLuogo = function (Luogo)
  {
    var ModificaLuogo = function(Answer)
    {
      LuogoInEditing = Answer;
      if (LuogoInEditing === "") $scope.RefreshListLuoghi()
      else 
      {   
        var ParamLuogo = {
                            CHIAVE      : Luogo.Chiave,
                            DESCRIZIONE : LuogoInEditing.toUpperCase()
                          }
        $scope.ConfermaLuogo(ParamLuogo);
      }
    }   
    ZPrompt.GetPromptBox('MODIFICA INSERIMENTO',"MODIFICA LUOGO DISPONIBILITA': ",Luogo.Descrizione,ModificaLuogo,function(){});         
  }
  
  $scope.NuovoLuogo = function ()
  { 
    var CreaLuogo = function(Answer)
    {
      LuogoInEditing = Answer;
      if (LuogoInEditing === null) $scope.RefreshListaCase()
      else 
      {       
        var ParamLuogo = {
                          CHIAVE      : -1,
                          DESCRIZIONE : LuogoInEditing.toUpperCase()
                         }
        $scope.ConfermaLuogo(ParamLuogo);
      }
    }
    ZPrompt.GetPromptBox('NUOVO INSERIMENTO',"NUOVO LUOGO DISPONIBILITA': ","",CreaLuogo,function(){});         
  }
  
  $scope.ConfermaLuogo = function (param)
  { 
    LuogoExist = $scope.ListaLuoghi.find(function(ALuogo){return (ALuogo.Descrizione == param.DESCRIZIONE);});
    if(LuogoExist)
        ZCustomAlert($mdDialog,'ATTENZIONE','Luogo disponibilità già esistente!')
    else
    {
        var $ObjQuery         = { Operazioni : [] };     
        var NuovoLuogo = (param.CHIAVE == -1);
        param.DESCRIZIONE = param.DESCRIZIONE.xSQL();
        if(NuovoLuogo)     
        {           
          $ObjQuery.Operazioni.push({
                                      Query     : 'InsertSchedule',
                                      Parametri : param
                                    }); 
        }
        else
        {
          $ObjQuery.Operazioni.push({
                                      Query     : 'UpdateSchedule',
                                      Parametri : param
                                    });
        };
    
        SystemInformation.PostSQL('Schedule',$ObjQuery,function(Answer)
        {
          if(param.CHIAVE == -1)
            param.CHIAVE = Answer.NewKey1;
          $scope.RefreshListaLuoghi();
        });
    }    
  }
  
  $scope.EliminaLuogo = function(Luogo)
  {
    var EliminaLuogo = function()
    {
      var $ObjQuery = { Operazioni : [] };
      var ParamLuogo = { CHIAVE : Luogo.Chiave };
        
      $ObjQuery.Operazioni.push({
                                  Query     : 'DeleteSchedule',
                                  Parametri : ParamLuogo
                                });
                                                                
      SystemInformation.PostSQL('Schedule',$ObjQuery,function(Answer)
      {
        $scope.RefreshListaLuoghi();
      });  
    }
    ZConfirm.GetConfirmBox('AVVISO',"ELIMINARE LUOGO DISPONIBILITA': " + Luogo.Descrizione + ' ?',EliminaLuogo,function(){});          

  }

  //DATI DITTA
  
  $scope.ConfermaDati = function ()
  {
    var $ObjQuery = { Operazioni : [] };
    $ObjQuery.Operazioni.push({
                                Query : 'UpdateCompanyData',
                                Parametri : {
                                              "INDIRIZZO"           : $scope.DatiDitta.INDIRIZZO.xSQL(),
                                              "TELEFONO"            : $scope.DatiDitta.TELEFONO.xSQL(),
                                              "EMAIL"               : $scope.DatiDitta.EMAIL.xSQL(),
                                              "EMAIL_ARCHIVIO"      : $scope.DatiDitta.EMAIL_ARCHIVIO.xSQL(),
                                              "SITO_WEB"            : $scope.DatiDitta.SITO_WEB.xSQL(),
                                              "URL_CALENDARIO"      : $scope.DatiDitta.URL_CALENDARIO.trim().xSQL(),
                                              "CALENDARIO_VISIBILE" : $scope.DatiDitta.CALENDARIO_VISIBILE ? 'T' : 'F',
                                              "NR_ALUNNI"           : parseInt($scope.DatiDitta.NR_ALUNNI)
                                            }
                                
                              });
    SystemInformation.PostSQL('CompanyData',$ObjQuery,function()
    {
      $ObjQuery = {};
      $state.go('startPage');
    });    
  }
  
  $scope.AnnullaDati = function ()
  {
    $state.go('startPage');
  }
  
  $scope.GetListaGruppiIstituti();
  $scope.RefreshListaCombinazioni();
  $scope.RefreshListaCase();
  $scope.GetDatiDitta();
  $scope.RefreshListaMaterie();
  $scope.RefreshListaTipologie();
  $scope.RefreshListaTipologieEscluse();
  $scope.RefreshListaProvince();
  $scope.RefreshListaLuoghi();
  $scope.RefreshListaGruppi();

}]);