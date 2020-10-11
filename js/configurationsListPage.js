SIRIOApp.controller("configurationsListPageController",['$scope','SystemInformation','$state','$rootScope', function($scope,SystemInformation,$state,$rootScope)
{ 
  $scope.ListaConfigurazioni        = ['Materie','Tipologie','Tipologie Escluse','Province','Combinazioni','Dati Pagina43'];
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
 
  $scope.ModificaMateria = function (Materia)
  {
    var MateriaInEditing = prompt ("Modifica materia:",Materia.Descrizione);
    if (MateriaInEditing === null) $scope.RefreshListaMaterie()
    else 
    {   
      var ParamMateria = {
                           CHIAVE      : Materia.Chiave,
                           DESCRIZIONE : MateriaInEditing.toUpperCase()
                         }
      $scope.ConfermaMateria(ParamMateria);
    }    
  }
  
  $scope.NuovaMateria = function ()
  { 
    var MateriaInEditing = prompt ("Nuova materia:","");
    if (MateriaInEditing === null) $scope.RefreshListaMaterie()
    else 
    {       
      var ParamMateria = {
                           CHIAVE      : -1,
                           DESCRIZIONE : MateriaInEditing.toUpperCase()
                         }
      $scope.ConfermaMateria(ParamMateria);
    }
  }
  
  $scope.ConfermaMateria = function (param)
  { 
    MateriaExist = $scope.ListaMaterie.find(function(AMateria){return (AMateria.Descrizione == param.DESCRIZIONE);});
    if(MateriaExist)
       alert('Materia già esistente!')
    else
    {
       var $ObjQuery     = { Operazioni : [] };     
       var NuovaMateria = (param.CHIAVE == -1);
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
    if(confirm('Eliminare la materia: ' + Materia.Descrizione + ' ?'))
    {
      var $ObjQuery = { Operazioni : [] };
      var ParamMateria = { CHIAVE : Materia.Chiave };
       
      $ObjQuery.Operazioni.push({
                                  Query     : 'DeleteSubject',
                                  Parametri : ParamMateria
                                });
      
      $ObjQuery.Operazioni.push({
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
                                });
                                                                
      SystemInformation.PostSQL('Subject',$ObjQuery,function(Answer)
      {
        $scope.RefreshListaMaterie();
      });  
    }
  }
  
  //TIPOLOGIE  
  
  $scope.ModificaTipologia = function (Tipologia)
  {
    var TipologiaInEditing = prompt ("Modifica tipologia:",Tipologia.Descrizione);
    if (TipologiaInEditing === null) $scope.RefreshListaTipologie()
    else 
    {   
      var ParamTipologia = {
                             CHIAVE      : Tipologia.Chiave,
                             DESCRIZIONE : TipologiaInEditing.toUpperCase()
                           }
      $scope.ConfermaTipologia(ParamTipologia);
    }    
  }
  
  $scope.NuovaTipologia = function ()
  { 
    var TipologiaInEditing = prompt ("Nuova tipologia:","");
    if (TipologiaInEditing === null) $scope.RefreshListaTipologie()
    else 
    {       
      var ParamTipologia = {
                             CHIAVE      : -1,
                             DESCRIZIONE : TipologiaInEditing.toUpperCase()
                           }
      $scope.ConfermaTipologia(ParamTipologia);
    }
  }
  
  $scope.ConfermaTipologia = function (param)
  { 
    TipologiaExist = $scope.ListaTipologie.find(function(ATipologia){return (ATipologia.Descrizione == param.DESCRIZIONE);});
    if(TipologiaExist)
       alert('Tipologia già esistente!')
    else
    {     
       var $ObjQuery      = { Operazioni : [] };     
       var NuovaTipologia = (param.CHIAVE == -1);
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
    if(confirm('Eliminare la tipologia: ' + Tipologia.Descrizione + ' ?'))
    {
      var $ObjQuery      = { Operazioni : [] };
      var ParamTipologia = { CHIAVE : Tipologia.Chiave };
       
      $ObjQuery.Operazioni.push({
                                  Query     : 'DeleteInstituteInstituteType',
                                  Parametri : ParamTipologia
                                });
      
      $ObjQuery.Operazioni.push({
                                  Query     : 'DeleteInstituteType',
                                  Parametri : ParamTipologia
                                });
                                                                
      SystemInformation.PostSQL('InstituteType',$ObjQuery,function(Answer)
      {
        $scope.RefreshListaTipologie();
      });  
    }
  }
  
  //TIPOLOGIE ESCLUSE  
  
  $scope.ModificaTipologiaEsclusa = function (TipologiaEsclusa)
  {
    var TipologiaEsclusaInEditing = prompt ("Modifica tipologia esclusa:",TipologiaEsclusa.Descrizione);
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
  
  $scope.NuovaTipologiaEsclusa = function ()
  { 
    var TipologiaEsclusaInEditing = prompt ("Nuova tipologia esclusa:","");
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
  
  $scope.ConfermaTipologiaEsclusa = function (param)
  { 
    TipologiaExclExist = $scope.ListaTipologieEscluse.find(function(ATipologiaExcl){return (ATipologiaExcl.Descrizione == param.DESCRIZIONE);});
    if(TipologiaExclExist)
       alert('Tipologia esclusa già esistente!')
    else
    {   
       var $ObjQuery             = { Operazioni : [] };     
       var NuovaTipologiaEsclusa = (param.CHIAVE == -1);
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
    if(confirm('Eliminare la tipologia esclusa: ' + TipologiaEsclusa.Descrizione + ' ?'))
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
  }

  //PROVINCE
  
  $scope.ModificaProvincia = function (Provincia)
  {
    var ProvinciaInEditing = prompt ("Modifica provincia:",Provincia.Nome);
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
  
  $scope.NuovaProvincia = function ()
  { 
    var ProvinciaInEditing = prompt ("Nuova provincia:","");
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
  
  $scope.ConfermaProvincia = function (param)
  { 
    ProvinciaExist = $scope.ListaProvince.find(function(AProvincia){return (AProvincia.Nome == param.NOME);});
    if(ProvinciaExist)
       alert('Provincia gestita già esistente!')
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
    if(confirm('Eliminare la provincia: ' + Provincia.Nome + ' ?'))
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
  }

  //COMBINAZIONI  
 
  $scope.ModificaCombinazione = function (Combinazione)
  {
    var CombinazioneInEditing = prompt ("Modifica combinazione:",Combinazione.Descrizione);
    if (CombinazioneInEditing === null) $scope.RefreshListaCombinazioni()
    else 
    {   
      var ParamCombinazione = {
                                CHIAVE      : Combinazione.Chiave,
                                DESCRIZIONE : CombinazioneInEditing.toUpperCase()
                              }
      $scope.ConfermaCombinazione(ParamCombinazione);
    }    
  }
  
  $scope.NuovaCombinazione = function ()
  { 
    var CombinazioneInEditing = prompt ("Nuova combinazione:","");
    if (CombinazioneInEditing === null) $scope.RefreshListaCombinazioni()
    else 
    {       
      var ParamCombinazione = {
                                CHIAVE      : -1,
                                DESCRIZIONE : CombinazioneInEditing.toUpperCase()
                              }
      $scope.ConfermaCombinazione(ParamCombinazione);
    }
  }
  
  $scope.ConfermaCombinazione = function (param)
  { 
    CombinazioneExist = $scope.ListaCombinazioni.find(function(ACombinazione){return (ACombinazione.Descrizione == param.DESCRIZIONE);});
    if(CombinazioneExist)
       alert('Combinazione già esistente!')
    else
    {
       var $ObjQuery         = { Operazioni : [] };     
       var NuovaCombinazione = (param.CHIAVE == -1);
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
    if(confirm('Eliminare la combinazione: ' + Combinazione.Descrizione + ' ?'))
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
  
  $scope.GetDatiDitta();  
  $scope.RefreshListaProvince();
  $scope.RefreshListaTipologieEscluse();
  $scope.RefreshListaTipologie();  
  $scope.RefreshListaMaterie();
  $scope.RefreshListaCombinazioni();

}]);