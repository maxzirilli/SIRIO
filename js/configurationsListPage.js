SIRIOApp.controller("configurationsListPageController",['$scope','SystemInformation','$state','$rootScope','$mdDialog','ZConfirm','ZPrompt', function($scope,SystemInformation,$state,$rootScope,$mdDialog,ZConfirm,ZPrompt)
{ 
  $scope.ListaConfigurazioni        = ['COMBINAZIONI CLASSI','CASE EDITRICI GESTITE','DATI PAGINA 43','MATERIE','TIPOLOGIE GESTITE','TIPOLOGIE ESCLUSE','PROVINCE GESTITE'];
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
                           
  $scope.RefreshListaMaterie = function ()
  {
    SystemInformation.GetSQL('Subject', {}, function(Results)  
    {
      SubjectInfoList = SystemInformation.FindResults(Results,'SubjectInfoList');
      if(SubjectInfoList != undefined)
      { 
         for(let i = 0;i < SubjectInfoList.length;i ++)
         SubjectInfoList[i] = {
                                Chiave      : SubjectInfoList[i].CHIAVE,
                                Descrizione : SubjectInfoList[i].DESCRIZIONE
                              }
         $scope.ListaMaterie = SubjectInfoList
      }
      else SystemInformation.ApplyOnError('Modello materie non conforme','');   
    });
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
                             Chiave      : CaseInfoList[i].CHIAVE,
                             Descrizione : CaseInfoList[i].DESCRIZIONE
                           }
         $scope.ListaCase = CaseInfoList
      } 
      else SystemInformation.ApplyOnError('Modello case editrici non conforme','');   
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
        $scope.DatiDitta.INDIRIZZO      = DatiDittaSql[0].INDIRIZZO;
        $scope.DatiDitta.TELEFONO       = DatiDittaSql[0].TELEFONO;
        $scope.DatiDitta.EMAIL          = DatiDittaSql[0].EMAIL;
        $scope.DatiDitta.EMAIL_ARCHIVIO = DatiDittaSql[0].EMAIL_ARCHIVIO;
        $scope.DatiDitta.SITO_WEB       = DatiDittaSql[0].SITO_WEB;
      }
      else SystemInformation.ApplyOnError('Modello dati ditta non conforme','');
    });
  }
 
  //MATERIE  

  $scope.ModificaMateria = function (ev,Materia) 
  {    
    ModificaMat = function(Answer)
    {
      MateriaInEditing = Answer;
      if (MateriaInEditing === '') $scope.RefreshListaMaterie()
      else 
      {       
        var ParamMateria = {
                            CHIAVE      : Materia.Chiave,
                            DESCRIZIONE : MateriaInEditing.toUpperCase()
                          }
        $scope.ConfermaMateria(ParamMateria);
      }
    }
    ZPrompt.GetPromptBox('MODIFICA INSERIMENTO','MODIFICA MATERIA: ',Materia.Descrizione,ModificaMat,function(){});  
  };

  $scope.NuovaMateria = function (ev) 
  {
    var CreaMat = function(Answer)
    {
      MateriaInEditing = Answer;
      if (MateriaInEditing === '') $scope.RefreshListaMaterie()
      else 
      {       
        var ParamMateria = {
                            CHIAVE      : -1,
                            DESCRIZIONE : MateriaInEditing.toUpperCase()
                          }
        $scope.ConfermaMateria(ParamMateria);
      }   
    }
    ZPrompt.GetPromptBox('NUOVO INSERIMENTO','NUOVA MATERIA: ',"",CreaMat,function(){});  
  };
  
  $scope.ConfermaMateria = function (param)
  { 
    MateriaExist = $scope.ListaMaterie.find(function(AMateria){return (AMateria.Descrizione == param.DESCRIZIONE);});
    if(MateriaExist)
       ZCustomAlert($mdDialog,'ATTENZIONE','Materia già esistente!')
    else
    {
       var $ObjQuery     = { Operazioni : [] };     
       var NuovaMateria = (param.CHIAVE == -1);
       param.DESCRIZIONE = param.DESCRIZIONE.xSQL();
       if(NuovaMateria)     
       {           
         $ObjQuery.Operazioni.push({
                                     Query     : 'InsertSubject',
                                     Parametri : param
                                   }); 
       }
       else
       {
         $ObjQuery.Operazioni.push({
                                     Query     : 'UpdateSubject',
                                     Parametri : param
                                   });
       };
    
       SystemInformation.PostSQL('Subject',$ObjQuery,function(Answer)
       {
         if(param.CHIAVE == -1)
            param.CHIAVE = Answer.NewKey1;
         $scope.RefreshListaMaterie();
       });
    }    
  }
  
  $scope.EliminaMateria = function(Materia)
  {
    var EliminaMat = function()
    {
      var $ObjQuery = { Operazioni : [] };
      var ParamMateria = { CHIAVE : Materia.Chiave };
       
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
       var $ObjQuery         = { Operazioni : [] };     
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
  
  //DATI DITTA
  
  $scope.ConfermaDati = function ()
  {
    var $ObjQuery = { Operazioni : [] };
    $ObjQuery.Operazioni.push({
                                Query : 'UpdateCompanyData',
                                Parametri : {
                                              "INDIRIZZO"      : $scope.DatiDitta.INDIRIZZO.xSQL(),
                                              "TELEFONO"       : $scope.DatiDitta.TELEFONO.xSQL(),
                                              "EMAIL"          : $scope.DatiDitta.EMAIL.xSQL(),
                                              "EMAIL_ARCHIVIO" : $scope.DatiDitta.EMAIL_ARCHIVIO.xSQL(),
                                              "SITO_WEB"       : $scope.DatiDitta.SITO_WEB.xSQL()
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
  
  $scope.RefreshListaCombinazioni();
  $scope.RefreshListaCase();
  $scope.GetDatiDitta();
  $scope.RefreshListaMaterie();
  $scope.RefreshListaTipologie();
  $scope.RefreshListaTipologieEscluse();
  $scope.RefreshListaProvince();

}]);