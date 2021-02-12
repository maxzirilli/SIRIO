SIRIOApp.controller("instituteListPageController",['$scope','SystemInformation','$state','$rootScope','$mdDialog','$filter','$sce','ZConfirm', function($scope,SystemInformation,$state,$rootScope,$mdDialog,$filter,$sce,ZConfirm)
{
  $scope.EditingOn          = false;
  $scope.IstitutoInEditing  = {};
  $scope.ListaIstituti      = [];  
  $scope.ListaProvince      = [];
  $scope.ListaPromotori     = [];  
  $scope.SezioneMax         = -1;
  $scope.ListaSezioni       = ['A','B','C','D','E','F','G','H','I','L','M','N','O','P','Q','R','S','T','U','V','Z'];    
  $scope.Anno               = [1,2,3,4,5];
  $scope.ListaSezioniFinale = [];
  //$scope.ArrayClassiGlobale = [];
  $scope.ArrayClassiFinale  = [];
  $scope.ClasseCliccata     = [];
  $scope.IstitutiNascosti   = false;  
  $scope.ProvinciaFiltro    = -1;
  $scope.NomeFiltro         = ''; 
  $scope.NomeFiltroUnione   = '';
  $scope.ComuneFiltro       = '';
  //$scope.IstitutoDaUnire    = -1;
  $scope.CheckOldProvincia  = false;
  $scope.OldPagina          = 0;

  $scope.IsAdministrator = function ()
  {
    return SystemInformation.UserInformation.Ruolo == RUOLO_AMMINISTRATORE;
  }
  
  ScopeHeaderController.CheckButtons();

  $scope.TornaAIstituti = function()
  {
    $scope.EditingOn = false;
    $scope.StampaOn = false;
    if($scope.CheckOldProvincia)
       $scope.ProvinciaFiltro = $scope.OldProvincia;
    $scope.CheckOldProvincia = false;
  }

  SystemInformation.GetSQL('Accessories',{}, function(Results)
  {
    ListaProvinceOpt = SystemInformation.FindResults(Results,'ProvinceList');
    if (ListaProvinceOpt != undefined) 
    {
      var ListaProvinceTmp = []
      var AddProvincia = function (Chiave,Nome)
      {
        ListaProvinceTmp.push({
                                Chiave : Chiave,
                                Nome   : Nome
                              });
      }
      ListaProvinceOpt.forEach(function(provincia)
      {
        AddProvincia(provincia.CHIAVE,provincia.NOME)
      });
      $scope.ListaProvince = ListaProvinceTmp;
    }
    else SystemInformation.ApplyOnError('Modello province non conforme','');     
  });
  
  SystemInformation.GetSQL('Accessories',{}, function(Results)
  {
    ListaTipologieOpt = SystemInformation.FindResults(Results,'InstituteTypeList');
    if (ListaTipologieOpt != undefined) 
    {
      var ListaTipologieTmp = []
      var AddTipologia = function (Chiave,Descrizione)
      {
        ListaTipologieTmp.push({
                                Chiave      : Chiave,
                                Descrizione : Descrizione
                              });
      }
      ListaTipologieOpt.forEach(function(tipologia)
      {
        AddTipologia(tipologia.CHIAVE,tipologia.DESCRIZIONE)
      });
      $scope.ListaTipologie = ListaTipologieTmp;
    }
    else SystemInformation.ApplyOnError('Modello tipologie non conforme','');     
  });
  
  SystemInformation.GetSQL('User',{}, function(Results)
  {
    ListaPromotoriOpt = SystemInformation.FindResults(Results,'UserInfoList');
    if (ListaPromotoriOpt != undefined) 
    {
      var ListaPromotoriTmp = []
      var AddPromotore = function (Chiave,RagioneSociale)
      {
        ListaPromotoriTmp.push({
                                Chiave         : Chiave,
                                RagioneSociale : RagioneSociale
                              });
      }
      ListaPromotoriOpt.forEach(function(promotore)
      {
        AddPromotore(promotore.CHIAVE,promotore.RAGIONE_SOCIALE)
      });
      $scope.ListaPromotori = ListaPromotoriTmp;
    }
    else SystemInformation.ApplyOnError('Modello promotori non conforme','');     
  });

  SystemInformation.GetSQL('Combination',{},function(Results)
  {
    $scope.ListaCombinazioniAll = [];
    CombinationInfoList = SystemInformation.FindResults(Results,'CombinationInfoList');
    if(CombinationInfoList != undefined)
    {
      for(let i = 0;i < CombinationInfoList.length;i ++)
          CombinationInfoList[i] = {
                                      Chiave      : CombinationInfoList[i].CHIAVE,
                                      Descrizione : CombinationInfoList[i].DESCRIZIONE
                                    }
          $scope.ListaCombinazioniAll = CombinationInfoList
    }
    else SystemInformation.ApplyOnError('Modello tipi di combinazioni per classi non conforme','')
  })
    
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
  
  $scope.RefreshListaIstituti = function()
  {
    $scope.GridOptions.query.page = 1;
    if ($scope.IsAdministrator())
    {
        SystemInformation.GetSQL('Institute', {}, function(Results)  
        {
          IstitutiInfoLista = SystemInformation.FindResults(Results,'InstituteInfoList');
          if(IstitutiInfoLista != undefined)
          { 
            for(let i = 0;i < IstitutiInfoLista.length;i ++)
            
                IstitutiInfoLista[i] = {
                                          Chiave        : IstitutiInfoLista[i].CHIAVE,
                                          Codice        : (IstitutiInfoLista[i].CODICE == null || IstitutiInfoLista[i].CODICE == '') ? 'N.D.' : IstitutiInfoLista[i].CODICE,   
                                          Nome          : (IstitutiInfoLista[i].NOME == null || IstitutiInfoLista[i].NOME == '') ? 'N.D.' : IstitutiInfoLista[i].NOME,  
                                          Promotore     : IstitutiInfoLista[i].PROMOTORE,
                                          Provincia     : IstitutiInfoLista[i].PROVINCIA, 
                                          ProvinciaNome : IstitutiInfoLista[i].NOME_PROVINCIA,
                                          Nascosto      : (IstitutiInfoLista[i].NASCOSTO == null || IstitutiInfoLista[i].NASCOSTO == 0) ? false : true,
                                          NrDocenti     : parseInt(IstitutiInfoLista[i].NR_DOCENTI),
                                          NrAdozioni    : parseInt(IstitutiInfoLista[i].NR_ADOZIONI),
                                          Comune        : IstitutiInfoLista[i].COMUNE == undefined ? '' : IstitutiInfoLista[i].COMUNE                       
                                        }
            
                $scope.ListaIstituti = IstitutiInfoLista
          }
          else SystemInformation.ApplyOnError('Modello istituti non conforme','');   
        })   
    }
    else
    {
        SystemInformation.GetSQL('Institute', {}, function(Results)  
        {
          IstitutiInfoLista = SystemInformation.FindResults(Results,'InstituteInfoListPrm');
          if(IstitutiInfoLista != undefined)
          { 
            for(let i = 0;i < IstitutiInfoLista.length;i ++)
            
                IstitutiInfoLista[i] = {
                                          Chiave        : IstitutiInfoLista[i].CHIAVE,
                                          Codice        : (IstitutiInfoLista[i].CODICE == null || IstitutiInfoLista[i].CODICE == '') ? 'N.D.' : IstitutiInfoLista[i].CODICE,   
                                          Nome          : (IstitutiInfoLista[i].NOME == null || IstitutiInfoLista[i].NOME == '') ? 'N.D.' : IstitutiInfoLista[i].NOME,  
                                          Promotore     : IstitutiInfoLista[i].PROMOTORE,
                                          Provincia     : IstitutiInfoLista[i].PROVINCIA, 
                                          ProvinciaNome : IstitutiInfoLista[i].NOME_PROVINCIA,
                                          Nascosto      : (IstitutiInfoLista[i].NASCOSTO == null || IstitutiInfoLista[i].NASCOSTO == 0) ? false : true,
                                          NrDocenti     : parseInt(IstitutiInfoLista[i].NR_DOCENTI),
                                          NrAdozioni    : parseInt(IstitutiInfoLista[i].NR_ADOZIONI),
                                          Comune        : IstitutiInfoLista[i].COMUNE == undefined ? '' : IstitutiInfoLista[i].COMUNE                            
                                        }
            
                $scope.ListaIstituti = IstitutiInfoLista
          }
          else SystemInformation.ApplyOnError('Modello istituti non conforme','');   
        },'SelectSQLPrm') 
    }
    
  }
  
  $scope.CreaListaSelezione = function(sezMax)
  { 
    $scope.ListaSezioniFinale = [];
    for(i = 0; i <= sezMax; i ++)
        $scope.ListaSezioniFinale.push($scope.ListaSezioni[i]);
  }
  
  ResetClassi = function()  
  {
    for(let i = 0;i < $scope.Anno.length;i ++)
    {
      for(let j = 0;j < $scope.ListaSezioni.length;j ++)
      {
        $scope.ClasseCliccata[$scope.ListaSezioni[j] + $scope.Anno[i]] = false;
      }
    }
  }
  
  CaricaClassi = function(KeyComb)
  {
    var CombinazioneToView = $scope.IstitutoInEditing.ArrayClassiGlobale.findIndex(function(ACombinazione){return(ACombinazione.CombinazioneChiave == KeyComb);});    
    for (let k = 0; k < $scope.IstitutoInEditing.ArrayClassiGlobale[CombinazioneToView].ArrayClassiFinale.length ; k ++)
         $scope.ClasseCliccata[$scope.IstitutoInEditing.ArrayClassiGlobale[CombinazioneToView].ArrayClassiFinale[k].Sezione + $scope.IstitutoInEditing.ArrayClassiGlobale[CombinazioneToView].ArrayClassiFinale[k].Anno] = true;
  }
  
  $scope.ModificaListaClassi = function(sezione,anno)
  {
    var DatoTrovato = false;
    
    if($scope.ClasseCliccata[sezione + anno])                                                                       
    {  
        for(let i = 0; i < $scope.IstitutoInEditing.ArrayClassiGlobale[$scope.CombinazioneFocusedIndex].ArrayClassiFinale.length; i ++)
        {      
          if (($scope.IstitutoInEditing.ArrayClassiGlobale[$scope.CombinazioneFocusedIndex].ArrayClassiFinale[i].Sezione == sezione) && ($scope.IstitutoInEditing.ArrayClassiGlobale[$scope.CombinazioneFocusedIndex].ArrayClassiFinale[i].Anno == anno)) 
          {  
            $scope.IstitutoInEditing.ArrayClassiGlobale[$scope.CombinazioneFocusedIndex].ArrayClassiFinale[i].Eliminato = false;
            $scope.IstitutoInEditing.ArrayClassiGlobale[$scope.CombinazioneFocusedIndex].ArrayClassiFinale[i].Nuovo     = false;
            DatoTrovato                                                                   = true;  
          }
        }        
        if (!DatoTrovato) 
        {
          $scope.ClasseAggiunta = { 
                                    Chiave    : -1,
                                    Eliminato : false,
                                    Nuovo     : true,
                                    Sezione   : sezione,
                                    Anno      : anno     
                                  };
          $scope.IstitutoInEditing.ArrayClassiGlobale[$scope.CombinazioneFocusedIndex].ArrayClassiFinale.push($scope.ClasseAggiunta); 
          $scope.ClasseAggiunta = {};
        }
      }  
                          
    else
    {   
        for(let i = 0;i < $scope.IstitutoInEditing.ArrayClassiGlobale[$scope.CombinazioneFocusedIndex].ArrayClassiFinale.length;i ++)
        {
          if (($scope.IstitutoInEditing.ArrayClassiGlobale[$scope.CombinazioneFocusedIndex].ArrayClassiFinale[i].Sezione == sezione) && ($scope.IstitutoInEditing.ArrayClassiGlobale[$scope.CombinazioneFocusedIndex].ArrayClassiFinale[i].Anno == anno))
          {
                SystemInformation.GetSQL('Institute',
                                         {
                                           Istituto     : $scope.IstitutoInEditing.Chiave,
                                           Sezione      : $scope.IstitutoInEditing.ArrayClassiGlobale[$scope.CombinazioneFocusedIndex].ArrayClassiFinale[i].Sezione,
                                           Anno         : $scope.IstitutoInEditing.ArrayClassiGlobale[$scope.CombinazioneFocusedIndex].ArrayClassiFinale[i].Anno,
                                           Combinazione : $scope.IstitutoInEditing.ArrayClassiGlobale[$scope.CombinazioneFocusedIndex].CombinazioneChiave
                                         },
                                         function(Results)
                                         {
                                           ContoAdozioni = SystemInformation.FindResults(Results,'GetAdoptionClass');
                                           if(ContoAdozioni != undefined)
                                           {
                                              ContoAdozioni = parseInt(ContoAdozioni[0].COUNT_ADOZIONI);
                                              //var VaiAvanti = true;
                                              
                                                 
                                              var VaiAvanti = function()
                                              {
                                                 if ($scope.IstitutoInEditing.ArrayClassiGlobale[$scope.CombinazioneFocusedIndex].ArrayClassiFinale[i].Nuovo)                                                          
                                                     $scope.IstitutoInEditing.ArrayClassiGlobale[$scope.CombinazioneFocusedIndex].ArrayClassiFinale.splice(i,1)
                                                 else                                                                                             
                                                 {
                                                     $scope.IstitutoInEditing.ArrayClassiGlobale[$scope.CombinazioneFocusedIndex].ArrayClassiFinale[i].Nuovo = false;
                                                     $scope.IstitutoInEditing.ArrayClassiGlobale[$scope.CombinazioneFocusedIndex].ArrayClassiFinale[i].Eliminato = true;
                                                 }
                                              }
                                              var Fermati = function() 
                                              {
                                                $scope.ClasseCliccata[$scope.IstitutoInEditing.ArrayClassiGlobale[$scope.CombinazioneFocusedIndex].ArrayClassiFinale[i].Sezione + $scope.IstitutoInEditing.ArrayClassiGlobale[$scope.CombinazioneFocusedIndex].ArrayClassiFinale[i].Anno] = true;
                                              }
                                              if(ContoAdozioni != 0)
                                                 ZConfirm.GetConfirmBox('AVVISO',"Sono presenti adozioni associate. Eliminare?",VaiAvanti,Fermati)
                                              else VaiAvanti() 
                                           }
                                           else SystemInformation.ApplyOnError('Modello adozioni per classe non conforme','');                  
                                         },'GetAdozioniClasse');               
          }  
        }
      
    }            
  }

  $scope.AggiungiCombinazione = function(ev)
  {
    $mdDialog.show({ 
                     controller          : DialogControllerAggiungiCombinazione,
                     templateUrl         : "template/addCombinationInstitutePopup.html",
                     targetEvent         : ev,
                     scope               : $scope,
                     preserveScope       : true,
                     clickOutsideToClose : true,
                   })
      .then(function(answer) 
      {}, 
      function() 
      {});   
  }

  function DialogControllerAggiungiCombinazione($scope,$mdDialog)
  {
    $scope.queryCombinazione = function(searchTextComb)
    {
      searchTextComb = searchTextComb.toUpperCase();
      return($scope.ListaCombinazioniAll.grep(function(Elemento) 
      { 
        return(Elemento.Descrizione.toUpperCase().indexOf(searchTextComb) != -1);
      }));
    }
    
    $scope.selectedItemChangeCombinazione = function(itemComb)
    {
      if(itemComb != undefined)
      {
        $scope.CombinazioneToAdd = itemComb
      }
      else $scope.CombinazioneToAdd.Chiave = -1;
    }
    
    $scope.hide = function() 
    {
      $mdDialog.hide();
    };

    $scope.AnnullaPopupCombinazione = function() 
    { 
      $scope.searchTextComb    = '';
      $scope.CombinazionePopup = undefined;
      $mdDialog.cancel();
    };

    $scope.ConfermaPopupCombinazione = function ()
    {
      $scope.IstitutoInEditing.ArrayClassiGlobale.push({
                                                         CombinazioneChiave : $scope.CombinazioneToAdd.Chiave,
                                                         CombinazioneNome   : $scope.CombinazioneToAdd.Descrizione, 
                                                         ArrayClassiFinale  : [] 
                                                       })

      $scope.IstitutoInEditing.ArrayClassiGlobale.sort(function(a,b)
      {
        var CombA = a.CombinazioneNome.toUpperCase();
        var CombB = b.CombinazioneNome.toUpperCase();
        return (CombA < CombB) ? -1 : (CombA > CombB) ? 1 : 0; 
      })
      
      ResetClassi();
      $scope.CreaListaSelezione($scope.SezioneMax);
      $scope.CombinazioneSelected = $scope.CombinazioneToAdd.Chiave;
      $scope.CombinazioneFocusedIndex = $scope.IstitutoInEditing.ArrayClassiGlobale.findIndex(function(ACombinazione){return(ACombinazione.CombinazioneChiave == $scope.CombinazioneToAdd.Chiave);});     
    
      $scope.searchTextComb    = '';
      $scope.CombinazionePopup = undefined;
      $mdDialog.hide();
    }
  }

  $scope.CambiaCombinazione = function(KeyComb)
  {
    ResetClassi();
    $scope.CombinazioneFocused = {};
    $scope.CombinazioneFocusedIndex = $scope.IstitutoInEditing.ArrayClassiGlobale.findIndex(function(ACombinazione){return(ACombinazione.CombinazioneChiave == KeyComb);});    
    $scope.CombinazioneFocused = $scope.IstitutoInEditing.ArrayClassiGlobale.find(function(ACombinazione){return(ACombinazione.CombinazioneChiave == KeyComb);});    
    CaricaClassi($scope.CombinazioneFocused.CombinazioneChiave);
    $scope.SezioneMax = GetCodeSezione($scope.IstitutoInEditing.ArrayClassiGlobale[$scope.CombinazioneFocusedIndex].ArrayClassiFinale[$scope.IstitutoInEditing.ArrayClassiGlobale[$scope.CombinazioneFocusedIndex].ArrayClassiFinale.length-1].Sezione);
    $scope.CreaListaSelezione($scope.SezioneMax);
  }
  
  GetCodeSezione = function(Sezione)
  {
     switch(Sezione)
     {
       case 'A' : return(0);
                  break;
       case 'B' : return(1);
                  break;
       case 'C' : return(2);
                  break;
       case 'D' : return(3);
                  break;
       case 'E' : return(4);
                  break;           
       case 'F' : return(5);
                  break;
       case 'G' : return(6);
                  break;
       case 'H' : return(7);
                  break;
       case 'I' : return(8);
                  break;
       case 'L' : return(9);
                  break;
       case 'M' : return(10);
                  break;
       case 'N':  return(11);
                  break; 
       case 'O' : return(12);
                  break;
       case 'P' : return(13);
                  break;
       case 'Q' : return(14);
                  break;
       case 'R' : return(15);
                  break;
       case 'S' : return(16);
                  break;
       case 'T' : return(17);
                  break;
       case 'U' : return(18);
                  break;
       case 'V' : return(19);
                  break;         
       case 'Z' : return(20);
                  break;
       default  : return(-1);
                  break;
     }        
  }
  
  $scope.ModificaIstituto = function(istituto)
  {
    $scope.OldPagina = $scope.GridOptions.query.page;
    $scope.EditingOn = true;    
    SystemInformation.GetSQL('Institute', {CHIAVE : istituto.Chiave}, function(Results)
    {
      IstitutoDettaglio       = SystemInformation.FindResults(Results, 'InstituteDettaglio');
      IstitutoDettaglioClassi = SystemInformation.FindResults(Results,'ClassiInstitute');
      IstitutoListaAdozioni   = SystemInformation.FindResults(Results,'GetAdoptionListInstitute');
      if(IstitutoDettaglio != undefined && IstitutoDettaglioClassi != undefined && IstitutoListaAdozioni != undefined)
      {
        // Carica dati istituto 
        $scope.IstitutoInEditing.Chiave                = IstitutoDettaglio[0].CHIAVE;
        $scope.IstitutoInEditing.Codice                = IstitutoDettaglio[0].CODICE      == null ? '' : IstitutoDettaglio[0].CODICE;
        $scope.IstitutoInEditing.Nome                  = IstitutoDettaglio[0].NOME        == null ? '' : IstitutoDettaglio[0].NOME;
        $scope.IstitutoInEditing.Tipologia             = IstitutoDettaglio[0].TIPOLOGIA   == null ? -1 : IstitutoDettaglio[0].TIPOLOGIA;
        $scope.IstitutoInEditing.Indirizzo             = IstitutoDettaglio[0].CODICE      == null ? '' : IstitutoDettaglio[0].INDIRIZZO;
        $scope.IstitutoInEditing.Comune                = IstitutoDettaglio[0].COMUNE      == null ? '' : IstitutoDettaglio[0].COMUNE;
        $scope.IstitutoInEditing.Provincia             = IstitutoDettaglio[0].PROVINCIA   == null ? -1 : IstitutoDettaglio[0].PROVINCIA;
        $scope.IstitutoInEditing.Cap                   = IstitutoDettaglio[0].CAP         == null ? '' : IstitutoDettaglio[0].CAP;
        $scope.IstitutoInEditing.Email                 = IstitutoDettaglio[0].EMAIL       == null ? '' : IstitutoDettaglio[0].EMAIL;
        $scope.IstitutoInEditing.Pec                   = IstitutoDettaglio[0].PEC         == null ? '' : IstitutoDettaglio[0].PEC;
        $scope.IstitutoInEditing.SitoWeb               = IstitutoDettaglio[0].SITO_WEB    == null ? '' : IstitutoDettaglio[0].SITO_WEB;
        $scope.IstitutoInEditing.SedeSuccursale        = IstitutoDettaglio[0].SEDE        == null ? 1  : IstitutoDettaglio[0].SEDE;
        $scope.IstitutoInEditing.Referente_1           = IstitutoDettaglio[0].REFERENTE_1 == null ? '' : IstitutoDettaglio[0].REFERENTE_1;
        $scope.IstitutoInEditing.NumeroTelefono_1      = IstitutoDettaglio[0].TELEFONO_1  == null ? '' : IstitutoDettaglio[0].TELEFONO_1;
        $scope.IstitutoInEditing.Referente_2           = IstitutoDettaglio[0].REFERENTE_2 == null ? '' : IstitutoDettaglio[0].REFERENTE_2;
        $scope.IstitutoInEditing.NumeroTelefono_2      = IstitutoDettaglio[0].TELEFONO_2  == null ? '' : IstitutoDettaglio[0].TELEFONO_2;
        $scope.IstitutoInEditing.Referente_3           = IstitutoDettaglio[0].REFERENTE_3 == null ? '' : IstitutoDettaglio[0].REFERENTE_3;
        $scope.IstitutoInEditing.NumeroTelefono_3      = IstitutoDettaglio[0].TELEFONO_3  == null ? '' : IstitutoDettaglio[0].TELEFONO_3;
        $scope.IstitutoInEditing.PromotoreAssegnato    = IstitutoDettaglio[0].PROMOTORE   == null ? -1 : IstitutoDettaglio[0].PROMOTORE;
        $scope.IstitutoInEditing.Preside               = IstitutoDettaglio[0].PRESIDE     == null ? '' : IstitutoDettaglio[0].PRESIDE;
        $scope.IstitutoInEditing.Vicepreside           = IstitutoDettaglio[0].VICEPRESIDE == null ? '' : IstitutoDettaglio[0].VICEPRESIDE;
        $scope.IstitutoInEditing.DirAmmnstr            = IstitutoDettaglio[0].DIR_AMMNSTR == null ? '' : IstitutoDettaglio[0].DIR_AMMNSTR;
        $scope.IstitutoInEditing.ArrayClassiGlobale    = [];
        $scope.IstitutoInEditing.ListaAdozioniIstituto = [];
        $scope.SezioneMax                              = 10;

        
        var ClassKey = -1;
        for(let i = 0;i < IstitutoListaAdozioni.length;i ++)
        {
            if(IstitutoListaAdozioni[i].CLASSE != ClassKey)
            {
               $scope.IstitutoInEditing.ListaAdozioniIstituto.push({
                                                                      ClasseChiave       : IstitutoListaAdozioni[i].CLASSE,
                                                                      NomeClasse         : IstitutoListaAdozioni[i].ANNO_CLASSE + IstitutoListaAdozioni[i].SEZIONE_CLASSE,
                                                                      CombinazioneClasse : IstitutoListaAdozioni[i].COMBINAZIONE_CLASSE == null ? 'N.D' :  IstitutoListaAdozioni[i].COMBINAZIONE_CLASSE,
                                                                      ListaTitoliClasse  : []
                                                                   }) 
            }
            $scope.IstitutoInEditing.ListaAdozioniIstituto[$scope.IstitutoInEditing.ListaAdozioniIstituto.length-1].ListaTitoliClasse.push({
                                                                                                                                             Titolo         : IstitutoListaAdozioni[i].NOME_TITOLO,
                                                                                                                                             Codice         : IstitutoListaAdozioni[i].CODICE_TITOLO,
                                                                                                                                             Editore        : IstitutoListaAdozioni[i].EDITORE_TITOLO == undefined ? 'N.D.' : IstitutoListaAdozioni[i].EDITORE_TITOLO,
                                                                                                                                             Prezzo         : (IstitutoListaAdozioni[i].PREZZO_TITOLO == '' || IstitutoListaAdozioni[i].PREZZO_TITOLO == null) ? 'N.D.' : IstitutoListaAdozioni[i].PREZZO_TITOLO + '€',
                                                                                                                                             EditoreGestito :  IstitutoListaAdozioni[i].CHIAVE_EDITORE == null ? 'NON GESTITO' : 'GESTITO' 
                                                                                                                                           })
            ClassKey =  IstitutoListaAdozioni[i].CLASSE;                                                                                          
        }
             
        if(IstitutoDettaglioClassi.length > 0)
        { 
          var CombKey = -1;
          for(let i = 0;i < IstitutoDettaglioClassi.length;i ++)
          {    
              if(CombKey != IstitutoDettaglioClassi[i].COMBINAZIONE)
              {
                $scope.IstitutoInEditing.ArrayClassiGlobale.push({
                                                                   CombinazioneChiave : IstitutoDettaglioClassi[i].COMBINAZIONE,
                                                                   CombinazioneNome   : IstitutoDettaglioClassi[i].COMBINAZIONE_DESCR,
                                                                   ArrayClassiFinale  : []                                                                     
                                                                 })
              }
              $scope.IstitutoInEditing.ArrayClassiGlobale[$scope.IstitutoInEditing.ArrayClassiGlobale.length-1].ArrayClassiFinale.push({
                                                                                                                                         Eliminato : false,
                                                                                                                                         Nuovo     : false,
                                                                                                                                         Sezione   : IstitutoDettaglioClassi[i].SEZIONE,
                                                                                                                                         Anno      : IstitutoDettaglioClassi[i].ANNO     
                                                                                                                                       })
              CombKey = IstitutoDettaglioClassi[i].COMBINAZIONE;
                                                                                                                                                   
          }
          ResetClassi();         
          $scope.SezioneMax = GetCodeSezione($scope.IstitutoInEditing.ArrayClassiGlobale[0].ArrayClassiFinale[$scope.IstitutoInEditing.ArrayClassiGlobale[0].ArrayClassiFinale.length-1].Sezione);
          $scope.CreaListaSelezione($scope.SezioneMax);
          CaricaClassi($scope.IstitutoInEditing.ArrayClassiGlobale[0].CombinazioneChiave);
          $scope.CombinazioneSelected     = $scope.IstitutoInEditing.ArrayClassiGlobale[0].CombinazioneChiave;
          $scope.CombinazioneFocusedIndex = 0;

        }
      }       
      else SystemInformation.ApplyOnError('Modello istituto non conforme',''); 
    },'SQLDettaglio'); 
  }

  $scope.GetTitoliClasse = function(Classe)
  {
    var Result = '';
    if(Classe.ListaTitoliClasse.length == 0) Result = 'NESSUN TITOLO ADOTTATO'
    else
    {
       for(let i = 0;i < Classe.ListaTitoliClasse.length;i ++)
       {
         if(Classe.ListaTitoliClasse[i].EditoreGestito == 'GESTITO')
            Result += '<p style="Background-color:FF77E8;">' + Classe.ListaTitoliClasse[i].Codice + ' - ' + Classe.ListaTitoliClasse[i].Titolo + ' - ' + Classe.ListaTitoliClasse[i].Editore + ' - ' + Classe.ListaTitoliClasse[i].Prezzo + '</p>'
         else Result += '<p>' + Classe.ListaTitoliClasse[i].Codice + ' - ' + Classe.ListaTitoliClasse[i].Titolo + ' - ' + Classe.ListaTitoliClasse[i].Editore + ' - ' + Classe.ListaTitoliClasse[i].Prezzo + '</p>'

       }
    }
    return($sce.trustAsHtml(Result.substr(0,Result.length)));
  }

  $scope.NuovoIstituto = function()
  { 
    $scope.EditingOn = true; 
    //ResetClassi();
    $scope.IstitutoInEditing = {
                                 Chiave             : -1,
                                 Codice             : '',
                                 Nome               : '',
                                 Tipologia          : -1,
                                 Indirizzo          : '',
                                 Comune             : '',
                                 Provincia          : -1,
                                 Cap                : '',
                                 Email              : '',
                                 Pec                : '',
                                 SitoWeb            : '',
                                 SedeSuccursale     : 1,
                                 Referente_1        : '',
                                 NumeroTelefono_1   : '',
                                 Referente_2        : '',
                                 NumeroTelefono_2   : '',
                                 Referente_3        : '',
                                 NumeroTelefono_3   : '',
                                 PromotoreAssegnato : -1,
                                 Preside            : '',
                                 Vicepreside        : '',
                                 DirAmmnstr         : '',
                                 ArrayClassiGlobale : []
                               };
    $scope.SezioneMax = 10;
    $scope.CreaListaSelezione();  
  }
  
  $scope.OnAnnullaIstitutoClicked = function()
  {
    $scope.EditingOn = false;
    $scope.RefreshListaIstituti();
    $scope.GridOptions.query.page = $scope.OldPagina;
  }
  
  $scope.ConfermaIstituto = function() 
  {       
     var $ObjQuery     = { Operazioni : [] };          
     var ParamIstituto = {
                           CHIAVE      : $scope.IstitutoInEditing.Chiave,
                           CODICE      : $scope.IstitutoInEditing.Codice == '' ? null : $scope.IstitutoInEditing.Codice.xSQL(),
                           NOME        : $scope.IstitutoInEditing.Nome == '' ? null : $scope.IstitutoInEditing.Nome.xSQL(),
                           INDIRIZZO   : $scope.IstitutoInEditing.Indirizzo.xSQL(),
                           TIPOLOGIA   : $scope.IstitutoInEditing.Tipologia == -1 ? null : $scope.IstitutoInEditing.Tipologia,
                           COMUNE      : $scope.IstitutoInEditing.Comune.xSQL(),
                           PROVINCIA   : $scope.IstitutoInEditing.Provincia == -1 ? null : $scope.IstitutoInEditing.Provincia,
                           CAP         : $scope.IstitutoInEditing.Cap == '' ? null : $scope.IstitutoInEditing.Cap.xSQL(),
                           EMAIL       : $scope.IstitutoInEditing.Email == '' ? null : $scope.IstitutoInEditing.Email.xSQL(),
                           PEC         : $scope.IstitutoInEditing.Pec == '' ? null : $scope.IstitutoInEditing.Pec.xSQL(),
                           SITO_WEB    : $scope.IstitutoInEditing.SitoWeb == '' ? null : $scope.IstitutoInEditing.SitoWeb.xSQL(),
                           SEDE        : $scope.IstitutoInEditing.SedeSuccursale == null ? 1 : $scope.IstitutoInEditing.SedeSuccursale,
                           REFERENTE_1 : $scope.IstitutoInEditing.Referente_1 == '' ? null : $scope.IstitutoInEditing.Referente_1.xSQL(),
                           TELEFONO_1  : $scope.IstitutoInEditing.NumeroTelefono_1 == '' ? null : $scope.IstitutoInEditing.NumeroTelefono_1.xSQL(),
                           REFERENTE_2 : $scope.IstitutoInEditing.Referente_2 == '' ? null : $scope.IstitutoInEditing.Referente_2.xSQL(),
                           TELEFONO_2  : $scope.IstitutoInEditing.NumeroTelefono_2 == '' ? null : $scope.IstitutoInEditing.NumeroTelefono_2.xSQL(),
                           REFERENTE_3 : $scope.IstitutoInEditing.Referente_3 == '' ? null : $scope.IstitutoInEditing.Referente_3.xSQL(),
                           TELEFONO_3  : $scope.IstitutoInEditing.NumeroTelefono_3 == '' ? null : $scope.IstitutoInEditing.NumeroTelefono_3.xSQL(),
                           PROMOTORE   : $scope.IstitutoInEditing.PromotoreAssegnato == -1 ? null : $scope.IstitutoInEditing.PromotoreAssegnato,
                           PRESIDE     : $scope.IstitutoInEditing.Preside == '' ? null : $scope.IstitutoInEditing.Preside.xSQL(),
                           VICEPRESIDE : $scope.IstitutoInEditing.Vicepreside == '' ? null : $scope.IstitutoInEditing.Vicepreside.xSQL(),
                           DIR_AMMNSTR : $scope.IstitutoInEditing.DirAmmnstr == '' ? null : $scope.IstitutoInEditing.DirAmmnstr.xSQL()                         
                        };
                                                                  
     var NuovoIstituto = ($scope.IstitutoInEditing.Chiave == -1);
     if(NuovoIstituto)     
     {           
       $ObjQuery.Operazioni.push({
                                   Query     : 'InsertInstitute',
                                   Parametri : ParamIstituto
                                 });
     }
     else
     {
       $ObjQuery.Operazioni.push({
                                   Query     : 'UpdateInstitute',
                                   Parametri : ParamIstituto
                                 });
     };
     
     for(let j = 0;j < $scope.IstitutoInEditing.ArrayClassiGlobale.length;j ++)
     {
        for(let i = 0; i < $scope.IstitutoInEditing.ArrayClassiGlobale[j].ArrayClassiFinale.length ;i ++)
        {  
          var NuovaClasse         = ($scope.IstitutoInEditing.ArrayClassiGlobale[j].ArrayClassiFinale[i].Chiave == -1);
          var ParamClassiIstituto = {
                                      CHIAVE       : $scope.IstitutoInEditing.ArrayClassiGlobale[j].ArrayClassiFinale[i].Chiave,
                                      ANNO         : $scope.IstitutoInEditing.ArrayClassiGlobale[j].ArrayClassiFinale[i].Anno,
                                      SEZIONE      : $scope.IstitutoInEditing.ArrayClassiGlobale[j].ArrayClassiFinale[i].Sezione,
                                      ISTITUTO     : $scope.IstitutoInEditing.Chiave,
                                      COMBINAZIONE : $scope.IstitutoInEditing.ArrayClassiGlobale[j].CombinazioneChiave
                                    }
          if(NuovoIstituto && NuovaClasse && !($scope.IstitutoInEditing.ArrayClassiGlobale[j].ArrayClassiFinale[i].Eliminato))  
          { 
            $ObjQuery.Operazioni.push({
                                        Query     : 'InsertClassAfterInsert',
                                        Parametri : ParamClassiIstituto,
                                        ResetKeys : [2]
                                      });
          }
          if(!NuovoIstituto && NuovaClasse && $scope.IstitutoInEditing.ArrayClassiGlobale[j].ArrayClassiFinale[i].Nuovo && !($scope.IstitutoInEditing.ArrayClassiGlobale[j].ArrayClassiFinale[i].Eliminato))
          {  
            $ObjQuery.Operazioni.push({
                                        Query     : 'InsertClass',
                                        Parametri : ParamClassiIstituto,
                                        ResetKeys : [1]
                                      });
          }
          if (!NuovoIstituto && $scope.IstitutoInEditing.ArrayClassiGlobale[j].ArrayClassiFinale[i].Eliminato)
          {
            $ObjQuery.Operazioni.push({
                                        Query     : 'DeleteAdoption',
                                        Parametri : ParamClassiIstituto
                                      });
            $ObjQuery.Operazioni.push({
                                        Query     : 'DeleteClass',
                                        Parametri : ParamClassiIstituto
                                      });
          }         
        }
     }
  
     SystemInformation.PostSQL('Institute',$ObjQuery,function(Answer)
     {  
       $scope.EditingOn = false;
       $scope.RefreshListaIstituti();
       $scope.GridOptions.query.page = $scope.OldPagina;
     });  
  }
  
  $scope.EliminaIstituto = function(Istituto)
  {
    var EliminaIst = function()
    {
      var $ObjQuery           = { Operazioni : [] };
      var ParamIstituto       = { CHIAVE     : Istituto.Chiave };
      var ParamClassiIstituto = { ISTITUTO   : Istituto.Chiave}
       
      $ObjQuery.Operazioni.push({
                                  Query     : 'DeleteClass',
                                  Parametri : ParamClassiIstituto
                                });
      
      $ObjQuery.Operazioni.push({
                                  Query     : 'DeleteInstitute',
                                  Parametri : ParamIstituto
                                });
                                
    
                                
      SystemInformation.PostSQL('Institute',$ObjQuery,function(Answer)
      {
        $scope.RefreshListaIstituti();
      });  
    }
    ZConfirm.GetConfirmBox('AVVISO',"Eliminare l\'istituto: " + Istituto.Nome + ' ?',EliminaIst,function(){});
  }

  $scope.RendiVisibileIstituto = function (ChiaveIstituto,NomeIstituto)
  {
    var ConfermaVisibilita = function()
    {
       var $ObjQuery     = { Operazioni : [] };         
       $ObjQuery.Operazioni.push({
                                   Query     : 'SetInstituteVisibility',
                                   Parametri : {CHIAVE : ChiaveIstituto}
                                 }); 
       
       SystemInformation.PostSQL('Institute',$ObjQuery,function(Answer)
       {
         $scope.RefreshListaIstituti(); 
       });
    }
    ZConfirm.GetConfirmBox('AVVISO',"Rendere visibile nuovamente l'istituto " + NomeIstituto + " ?",ConfermaVisibilita,function(){});
  }
  
  $scope.UnisciIstituti = function(IstitutoOld) 
  { 
    $mdDialog.show({ 
                     controller          : DialogControllerUnisciIstituti,
                     templateUrl         : "template/transferTeacherInstitutePopup.html",
                     targetEvent         : IstitutoOld,
                     scope               : $scope,
                     preserveScope       : true,
                     clickOutsideToClose : true,
                     locals              : {IstitutoOld}
                   })
    .then(function(answer) 
    {}, 
    function() 
    {});
  };

  function DialogControllerUnisciIstituti($scope,$mdDialog,IstitutoOld)
  {
    SystemInformation.GetSQL('Institute',{},function(Results)
    {
      $scope.IstitutoOld = IstitutoOld.Nome;
      $scope.ListaIstitutiPopupUnione = [];
      var ListaIstitutiPopupTmp = []
      
      ListaIstitutiPopupTmp = SystemInformation.FindResults(Results,'InstituteInfoListOnlyVisibile');
      if(ListaIstitutiPopupTmp != undefined)
      {
         for(let i = 0;i < ListaIstitutiPopupTmp.length;i ++)         
             ListaIstitutiPopupTmp[i] = {
                                          Chiave    : ListaIstitutiPopupTmp[i].CHIAVE,
                                          Nome      : ListaIstitutiPopupTmp[i].NOME,
                                          Codice    : ListaIstitutiPopupTmp[i].CODICE,
                                          Provincia : ListaIstitutiPopupTmp[i].PROVINCIA              
                                        }
             $scope.ListaIstitutiPopupUnione = ListaIstitutiPopupTmp;
             
         $scope.hide = function() 
         {
           $mdDialog.hide();
         };

         $scope.AnnullaPopup = function() 
         { 
           $scope.IstitutoDaUnire = -1;
           $mdDialog.cancel();
         };
         
         $scope.ConfermaPopup = function(Istituto) 
         {     
           if(Istituto == -1) 
           { 
             ZCustomAlert($mdDialog,'ATTENZIONE','NESSUN ISTITUTO SELEZIONATO!');      
             return
           }
           else
           {
             IstitutoCorrisp = $scope.ListaIstitutiPopupUnione.find(function(AIstituto){return(AIstituto.Chiave == $scope.IstitutoDaUnire);});
             var ConfermaPassaggio = function()          
             {
                var $ObjQuery = {Operazioni:[]}
                ParametriUnione = {
                                    OldIstituto : IstitutoOld.Chiave, 
                                    NewIstituto : $scope.IstitutoDaUnire 
                                  }
                $ObjQuery.Operazioni.push({
                                            Query     : 'MergeInstitute',
                                            Parametri : ParametriUnione
                                          });
                SystemInformation.PostSQL('Institute',$ObjQuery,function(Answer)
                {
                  $scope.ListaIstitutiPopupUnione = [];
                  $mdDialog.hide();
                  $scope.RefreshListaIstituti();                 
                });
             }
             ZConfirm.GetConfirmBox('AVVISO',"Cliccando CONFERMA tutti i docenti verranno passati dall'istituto " + IstitutoOld.Nome + " all'istituto " + IstitutoCorrisp.Nome + ".Confermi?",ConfermaPassaggio,function(){});              
           }
                   
         };
             
             
      }
      else SystemInformation.ApplyOnError('Modello istituti visibili non conforme','')      
    },'SelectSQLOnlyVisible');
  } 
  
  $scope.CreaPdfListaDocenti = function (ChiaveIstituto,NomeIstituto,CodiceIstituto,ProvinciaIstituto)
  {
    $scope.StampaOn        = true;
    $scope.EditingOn       = false;
    var ListaDocenti       = [];
    var ListaDisponibilita = [];
    var ModelloOrdinamento = 'SelectInstituteTeacherListOrdAlf'
    if(SystemInformation.UserInformation.OrdinamentoDoc === 'M')
       ModelloOrdinamento = 'SelectInstituteTeacherListOrderMat'
    else ModelloOrdinamento = 'SelectInstituteTeacherListOrderAlf';

    SystemInformation.GetSQL('Institute',{CHIAVE : ChiaveIstituto},function(Results)
    {
      var InfoIstituto = {};
      InfoIstitutoTmp    = SystemInformation.FindResults(Results,'InstituteInformationAll');
      ClassiIstituto     = SystemInformation.FindResults(Results,'AllClassiInstitute');
      ListaDocenti       = SystemInformation.FindResults(Results,'InstituteTeacherList');
      ContaClassi        = SystemInformation.FindResults(Results,'CountClassi');
      ListaDisponibilita = SystemInformation.FindResults(Results,'InstituteTeacherAvailability');
      if(ListaDocenti != undefined && ListaDisponibilita != undefined && ClassiIstituto != undefined && InfoIstitutoTmp != undefined  && ContaClassi != undefined)
      {
         InfoIstituto.Codice                = InfoIstitutoTmp[0].CODICE          == null ? '' : InfoIstitutoTmp[0].CODICE;
         InfoIstituto.Nome                  = InfoIstitutoTmp[0].NOME            == null ? '' : InfoIstitutoTmp[0].NOME;
         InfoIstituto.Tipologia             = InfoIstitutoTmp[0].NOME_TIPOLOGIA  == null ? '' : InfoIstitutoTmp[0].NOME_TIPOLOGIA;
         InfoIstituto.Indirizzo             = InfoIstitutoTmp[0].CODICE          == null ? '' : InfoIstitutoTmp[0].INDIRIZZO;
         InfoIstituto.Comune                = InfoIstitutoTmp[0].COMUNE          == null ? '' : InfoIstitutoTmp[0].COMUNE;
         InfoIstituto.Provincia             = InfoIstitutoTmp[0].NOME_PROVINCIA  == null ? -1 : InfoIstitutoTmp[0].NOME_PROVINCIA;
         InfoIstituto.Cap                   = InfoIstitutoTmp[0].CAP             == null ? '' : InfoIstitutoTmp[0].CAP;
         InfoIstituto.Email                 = InfoIstitutoTmp[0].EMAIL           == null ? '' : InfoIstitutoTmp[0].EMAIL;
         InfoIstituto.Pec                   = InfoIstitutoTmp[0].PEC             == null ? '' : InfoIstitutoTmp[0].PEC;
         InfoIstituto.SitoWeb               = InfoIstitutoTmp[0].SITO_WEB        == null ? '' : InfoIstitutoTmp[0].SITO_WEB;
         InfoIstituto.SedeSuccursale        = InfoIstitutoTmp[0].SEDE            == null ? 1  : InfoIstitutoTmp[0].SEDE;
         InfoIstituto.Referente_1           = InfoIstitutoTmp[0].REFERENTE_1     == null ? '' : InfoIstitutoTmp[0].REFERENTE_1;
         InfoIstituto.NumeroTelefono_1      = InfoIstitutoTmp[0].TELEFONO_1      == null ? '' : InfoIstitutoTmp[0].TELEFONO_1;
         InfoIstituto.Referente_2           = InfoIstitutoTmp[0].REFERENTE_2     == null ? '' : InfoIstitutoTmp[0].REFERENTE_2;
         InfoIstituto.NumeroTelefono_2      = InfoIstitutoTmp[0].TELEFONO_2      == null ? '' : InfoIstitutoTmp[0].TELEFONO_2;
         InfoIstituto.Referente_3           = InfoIstitutoTmp[0].REFERENTE_3     == null ? '' : InfoIstitutoTmp[0].REFERENTE_3;
         InfoIstituto.NumeroTelefono_3      = InfoIstitutoTmp[0].TELEFONO_3      == null ? '' : InfoIstitutoTmp[0].TELEFONO_3;
         InfoIstituto.PromotoreAssegnato    = InfoIstitutoTmp[0].PROMOTORE       == null ? -1 : InfoIstitutoTmp[0].PROMOTORE;
         InfoIstituto.Preside               = InfoIstitutoTmp[0].PRESIDE         == null ? '' : InfoIstitutoTmp[0].PRESIDE;
         InfoIstituto.Vicepreside           = InfoIstitutoTmp[0].VICEPRESIDE     == null ? '' : InfoIstitutoTmp[0].VICEPRESIDE;
         InfoIstituto.DirAmmnstr            = InfoIstitutoTmp[0].DIR_AMMNSTR     == null ? '' : InfoIstitutoTmp[0].DIR_AMMNSTR;

         var Data           = new Date();
         var DataAnno       = Data.getFullYear();
         var DataMese       = Data.getMonth()+1; 
         var DataGiorno     = Data.getDate();
         var DataDocumento = DataGiorno.toString() + '/' + DataMese.toString() +  '/' + DataAnno.toString();               
         var doc = new jsPDF();           
         doc.setProperties({title: 'FOGLIO SCUOLA ' + DataDocumento});
                  
         var CoordY = 10;
         var CoordX = 5;
         doc.setFontSize(7);
         doc.text(CoordX,CoordY,'ANNO ' + DataAnno + ' / ' + (DataAnno + 1));
         doc.text(CoordX + 30,CoordY,InfoIstituto.Nome);
         doc.text(CoordX,CoordY+3,'PAGINA43');
         doc.text(CoordX + 190,CoordY+3,'GENOVA');
         CoordX = 10;

         doc.rect(5,15,200,275);

         doc.rect(155,15,50,12);
         doc.rect(155,15,50,22);

         doc.rect(5,15,200,80);
         doc.rect(5,15,200,60);
         doc.rect(5,15,200,40);
         doc.rect(5,15,150,40);
         doc.rect(5,158,130,72);
         doc.rect(5,158,200,72);
         doc.rect(5,200,130,30);
         doc.rect(5,185,130,15);         
         doc.rect(5,95,200,10);
         doc.rect(5,95,100,10);
         doc.rect(5,105,200,12);
         doc.rect(5,105,60,12);
         doc.rect(5,105,100,12);
         doc.rect(5,105,160,12);
         
         doc.rect(5,117,80,20);
         doc.rect(5,117,160,20);
         doc.rect(5,117,200,20);
         doc.rect(5,117,200,10);

         doc.rect(5,137,200,10);
         doc.rect(5,137,50,10);
         doc.rect(5,137,100,10);
         doc.rect(5,137,150,10);
         doc.rect(5,137,50,21);
         doc.rect(5,137,100,21);
         
         doc.text(CoordX,CoordY + 12,'Scuola');
         doc.text(CoordX + 147,CoordY + 12,'Cod.Ministeriale');
         doc.text(CoordX + 172,CoordY + 12,'Ist.Riferimento');
         doc.setFontType('bold');
         doc.text(CoordX + 147,CoordY + 15,InfoIstituto.Codice);
         doc.text(CoordX + 172,CoordY + 15,InfoIstituto.Codice);
         doc.setFontType('normal');
         doc.text(CoordX + 147,CoordY + 20,'Partita IVA');
         doc.text(CoordX + 147,CoordY + 30,'Raccolto da');
         doc.setFontSize(8);
         doc.setFontType('bold');
         doc.text(CoordX,CoordY + 15,InfoIstituto.Nome + '          ' + InfoIstituto.Tipologia);
         doc.setFontSize(7);
         doc.setFontType('normal');
         doc.text(CoordX,CoordY+25,InfoIstituto.Indirizzo);
         doc.text(CoordX,CoordY+28,InfoIstituto.Cap + ' ' + InfoIstituto.Comune + ' (' +InfoIstituto.Provincia + ')');         
         doc.text(CoordX,CoordY+38,'Sede centrale');         
         doc.text(CoordX,CoordY+48,'Dipendenze');         
         doc.text(CoordX,CoordY+68,'Plessi');        
         doc.text(CoordX,CoordY+88,'Indirizzo posta elettronica');
         doc.setFontType('bold');
         doc.text(CoordX,CoordY+92,InfoIstituto.Email);
         doc.setFontType('normal');
         doc.text(CoordX + 100,CoordY+88,'Pagina Web');
         doc.setFontType('bold');
         doc.text(CoordX + 100,CoordY+92,InfoIstituto.SitoWeb);
         doc.setFontType('normal');
         
         doc.text(CoordX,CoordY+98,'Tel.Istituto');
         doc.setFontType('bold');
         doc.text(CoordX,CoordY+102,InfoIstituto.NumeroTelefono_1);
         doc.setFontType('normal');
         doc.text(CoordX + 60,CoordY+98,'Fax(uff.)');
         doc.setFontType('bold');
         doc.text(CoordX + 60,CoordY+102,InfoIstituto.NumeroTelefono_2);
         doc.setFontType('normal');
         doc.text(CoordX + 100,CoordY+98,'Dirigente scolastico');
         doc.setFontType('bold');
         doc.text(CoordX + 100,CoordY+102,InfoIstituto.NumeroTelefono_3);
         doc.setFontType('normal');
         doc.text(CoordX + 160,CoordY+98,'Segreteria');
         doc.setFontType('bold');
         doc.text(CoordX + 160,CoordY+102,'');
         doc.setFontType('normal');
         
         doc.text(CoordX,CoordY+110,'Dirigente scolastico');
         doc.setFontType('bold');
         doc.text(CoordX,CoordY+116,InfoIstituto.Preside);
         doc.setFontType('normal');
         doc.text(CoordX + 80,CoordY+110,'Segreteria');
         doc.setFontType('bold');
         doc.text(CoordX + 80,CoordY+116,'');
         doc.setFontType('normal');
         doc.text(CoordX + 160,CoordY+110,'Dir.Amministrativo');
         doc.setFontType('bold');
         doc.text(CoordX + 160,CoordY+116,InfoIstituto.DirAmmnstr);
         doc.setFontType('normal');

         doc.text(CoordX,CoordY+120,'Vice');
         doc.setFontType('bold');
         doc.text(CoordX,CoordY+124,InfoIstituto.Vicepreside);
         doc.setFontType('normal');
         doc.text(CoordX + 80,CoordY+120,'Segreteria didattica');
         doc.setFontType('bold');
         doc.text(CoordX + 80,CoordY+124,'');
         doc.setFontType('normal');
         doc.text(CoordX + 160,CoordY+120,'Resp.Bibilioteca');
         doc.setFontType('bold');
         doc.text(CoordX + 160,CoordY+124,'');
         doc.setFontType('normal');

         doc.text(CoordX,CoordY+130,'Passaggio');
         doc.text(CoordX,CoordY+134,'');
         doc.text(CoordX + 50,CoordY+130,'Giorno mercato');
         doc.text(CoordX + 50,CoordY+134,'');
         doc.text(CoordX + 100,CoordY+130,'Seggio');
         doc.text(CoordX + 100,CoordY+134,'');
         doc.text(CoordX + 150,CoordY+130,'Chiusure');
         doc.text(CoordX + 150,CoordY+134,'');

         doc.text(CoordX,CoordY+140,'Festa patrono');
         doc.text(CoordX,CoordY+144,'');
         doc.text(CoordX + 50,CoordY+140,'Limitazioni traffico');
         doc.text(CoordX + 50,CoordY+144,'');
         doc.text(CoordX + 100,CoordY+140,"Comodato d'uso");
         doc.text(CoordX + 100,CoordY+144,'');

         CoordY += 4; //PIGRIZIA

         doc.text(CoordX,CoordY+148,'Sezioni');
         doc.setFontType('bold');
         doc.text(CoordX,CoordY+152,'1 - ');
         doc.text(CoordX + 103,CoordY+152,ContaClassi[0].PRIME_CLASSI.toString());
         doc.text(CoordX,CoordY+156,'2 - ');
         doc.text(CoordX + 103,CoordY+156,ContaClassi[0].SECONDE_CLASSI.toString());
         doc.text(CoordX,CoordY+160,'3 - ');
         doc.text(CoordX + 103,CoordY+160,ContaClassi[0].TERZE_CLASSI.toString());
         doc.text(CoordX,CoordY+164,'4 - ');
         doc.text(CoordX + 103,CoordY+164,ContaClassi[0].QUARTE_CLASSI.toString());
         doc.text(CoordX,CoordY+168,'5 - ');
         doc.text(CoordX + 103,CoordY+168,ContaClassi[0].QUINTE_CLASSI.toString());
         doc.setFontType('normal');

         doc.rect(190,158,15,41); //ore
         doc.rect(190,158,15,5);
         doc.rect(190,158,15,9);
         doc.rect(190,158,15,13);
         doc.rect(190,158,15,17);
         doc.rect(190,158,15,21);
         doc.rect(190,158,15,25);
         doc.rect(190,158,15,29);
         doc.rect(190,158,15,33);
         doc.rect(190,158,15,37);
         doc.rect(190,158,15,41) 
         
         doc.rect(160,163.5,15,35);
         doc.rect(160,163.5,15,3);
         doc.rect(160,163.5,15,6);
         doc.rect(160,163.5,15,9);
         doc.rect(160,163.5,15,12);
         doc.rect(160,163.5,15,15);
         doc.rect(160,163.5,15,18);
         doc.rect(160,163.5,15,21);
         doc.rect(160,163.5,15,24);
         doc.rect(160,163.5,15,27);
         doc.rect(160,163.5,15,31);        
         
         doc.rect(108,158,13,27); //alunni

         doc.text(CoordX + 100,CoordY+148,'Classi');
         doc.text(CoordX + 114,CoordY+148,'Alunni');
         doc.text(CoordX + 130,CoordY+148,'Orario');
         doc.text(CoordX + 162.5,CoordY+148,'Inizio mattino');
         doc.text(CoordX + 170,CoordY+152,'2° Ora');
         doc.text(CoordX + 170,CoordY+156,'3° Ora');
         doc.text(CoordX + 170,CoordY+160,'4° Ora');
         doc.text(CoordX + 170,CoordY+164,'5° Ora');
         doc.text(CoordX + 170,CoordY+168,'6° Ora');
         doc.text(CoordX + 170,CoordY+172,'7° Ora');
         doc.text(CoordX + 170,CoordY+176,'8° Ora');
         doc.text(CoordX + 170,CoordY+180,'9° Ora');
         doc.text(CoordX + 168.5,CoordY+184,'10° Ora');
         
         doc.text(CoordX + 130,CoordY+152,'Inizio preinterv.');
         doc.text(CoordX + 130,CoordY+156,'Fine preinterv.');
         doc.text(CoordX + 130,CoordY+160,'Inizio intervallo');
         doc.text(CoordX + 130,CoordY+164,'Fine intervallo');
         doc.text(CoordX + 130,CoordY+168,'Fine mattino');
         doc.text(CoordX + 130,CoordY+172,'Inizio mensa');
         doc.text(CoordX + 130,CoordY+176,'Fine mensa');
         doc.text(CoordX + 130,CoordY+180,'Inizio intervallo');
         doc.text(CoordX + 130,CoordY+184,'Fine intervallo');

         doc.text(CoordX,CoordY+175,'Totali');
         doc.setFontType('bold');
         doc.text(CoordX + 103,CoordY+175,ClassiIstituto.length.toString());
         doc.setFontType('normal');

         doc.text(CoordX,CoordY+190,'Specializzazioni');
         doc.text(CoordX,CoordY+220,'Note');
         doc.text(CoordX + 150,CoordY+220,'Vacanze');
         
         doc.setFontSize(6);
         doc.setFontType('bold');
         doc.text(5,295,SystemInformation.VDocListaDocIst);
         doc.text(CoordX + 185,295,'GENOVA');   
         
         if(ListaDocenti.length != 0)
         {
            ListaDocenti.forEach(function(Docente){Docente.DISPONIBILITA = []});

            for(let i = 0;i < ListaDocenti.length;i ++)
                for(let j = 0;j < ListaDisponibilita.length;j ++)
                    if (ListaDisponibilita[j].DOCENTE == ListaDocenti[i].DOCENTE)
                        ListaDocenti[i].DISPONIBILITA.push(ListaDisponibilita[j]);

            for(let i = 0;i < ListaDocenti.length;i ++)
            {
                ListaDocenti[i].DISPONIBILITA.SETTIMANA = [[false,false,false,false,false,false,false,false,false,false],
                                                          [false,false,false,false,false,false,false,false,false,false],
                                                          [false,false,false,false,false,false,false,false,false,false],
                                                          [false,false,false,false,false,false,false,false,false,false],
                                                          [false,false,false,false,false,false,false,false,false,false],
                                                          [false,false,false,false,false,false,false,false,false,false],
                                                          [false,false,false,false,false,false,false,false,false,false]];;
                
                if(ListaDocenti[i].DISPONIBILITA.length != 0)
                {
                   for(let j = 0;j < ListaDocenti[i].DISPONIBILITA.length;j ++)
                   {
                       ListaDocenti[i].DISPONIBILITA.SETTIMANA[parseInt(ListaDocenti[i].DISPONIBILITA[j].GIORNO)][parseInt(ListaDocenti[i].DISPONIBILITA[j].ORA)] = true;
                   }
                }
            }
            doc.addPage();
            doc.setFontSize(8);
            var CoordY = 10;
            doc.setFontSize(6);
            doc.setFontType('bold');
            doc.text(5,295,SystemInformation.VDocListaDocIst);  

            for(let i = 0;i < ListaDocenti.length;i ++)
            {
                if (CoordY >= 275) 
                {
                  doc.addPage();
                  CoordY = 10;
                  doc.setFontSize(6);
                  doc.setFontType('bold');
                  doc.text(10,275,SystemInformation.VDocListaDocIst); 
                }
                doc.setFontSize(8);
                doc.setFontType('bold');
                doc.text(10,CoordY+5,'DOCENTE: ' + ListaDocenti[i].NOME_DOCENTE);
                doc.text(10,CoordY+10,'MATERIE: ' + (ListaDocenti[i].NOME_MATERIA_1 == undefined ? '' : ListaDocenti[i].NOME_MATERIA_1) + ' - ' + (ListaDocenti[i].NOME_MATERIA_2 == undefined ? '' : ListaDocenti[i].NOME_MATERIA_2) + ' - ' + (ListaDocenti[i].NOME_MATERIA_3 == undefined ? '' : ListaDocenti[i].NOME_MATERIA_3));
                CoordY += 15;
                doc.setFontSize(7);
                doc.setFontType('italic');
                doc.text(10,CoordY,'LUNEDI');
                doc.text(30,CoordY,'MARTEDI')
                doc.text(50,CoordY,'MERCOLEDI')
                doc.text(70,CoordY,'GIOVEDI')
                doc.text(90,CoordY,'VENERDI')
                doc.text(110,CoordY,'SABATO')
                doc.text(130,CoordY,'DOMENICA')
                CoordY += 5;
                               
                for(let j = 0;j < ListaDocenti[i].DISPONIBILITA.SETTIMANA.length;j ++)
                {
                    for(let k = 0;k < ListaDocenti[i].DISPONIBILITA.SETTIMANA[j].length;k ++)
                        if(ListaDocenti[i].DISPONIBILITA.SETTIMANA[j][k])
                           ListaDocenti[i].DISPONIBILITA.SETTIMANA[j][k] = 'X'
                        else ListaDocenti[i].DISPONIBILITA.SETTIMANA[j][k] = '-'
                    
                    ListaDocenti[i].DISPONIBILITA.SETTIMANA[j] = ListaDocenti[i].DISPONIBILITA.SETTIMANA[j].toString();
                    ListaDocenti[i].DISPONIBILITA.SETTIMANA[j] = ListaDocenti[i].DISPONIBILITA.SETTIMANA[j].replace(/,/g, '')
                }                
                doc.setFontSize(7);
                doc.text(10,CoordY,ListaDocenti[i].DISPONIBILITA.SETTIMANA[0]);
                doc.text(30,CoordY,ListaDocenti[i].DISPONIBILITA.SETTIMANA[1]);
                doc.text(50,CoordY,ListaDocenti[i].DISPONIBILITA.SETTIMANA[2]);
                doc.text(70,CoordY,ListaDocenti[i].DISPONIBILITA.SETTIMANA[3]);
                doc.text(90,CoordY,ListaDocenti[i].DISPONIBILITA.SETTIMANA[4]);
                doc.text(110,CoordY,ListaDocenti[i].DISPONIBILITA.SETTIMANA[5]);
                doc.text(130,CoordY,ListaDocenti[i].DISPONIBILITA.SETTIMANA[6]);
                CoordY += 10;
            }            
         }
         document.getElementById('teacherListPdf').src = doc.output('datauristring');              
      }
      else SystemInformation.ApplyOnError('Modello docenti e disponibilita per istituto non conforme','');     
    },ModelloOrdinamento)
  }  
  
  $scope.RefreshListaIstituti();
 
}]);


SIRIOApp.filter('IstitutoByFiltro',function()
{
  return function(ListaIstituti,ProvinciaFiltro,NomeFiltro,NascostoFiltro,ComuneFiltro)
         {
           if(ProvinciaFiltro == -1 && NomeFiltro == '' && NascostoFiltro == true && ComuneFiltro == '') return(ListaIstituti);
           var ListaFiltrata = [];
           NomeFiltro = NomeFiltro.toUpperCase();
           ComuneFiltro = ComuneFiltro.toUpperCase();
           
           var IstitutoOK = function(Istituto)
           {  
              var Result = true;
              
              if(NomeFiltro != '')
                if(Istituto.Nome.toUpperCase().indexOf(NomeFiltro) < 0)
                   Result = false;

              if(ComuneFiltro != '')
                 if(Istituto.Comune.toUpperCase().indexOf(ComuneFiltro) < 0)
                    Result = false;
                  
              if(ProvinciaFiltro != -1)
                 if(ProvinciaFiltro != Istituto.Provincia)
                    Result = false;
                   
              if(!NascostoFiltro)
                 if(Istituto.Nascosto)
                    Result = false;
              
              return(Result);
           }
           
           ListaIstituti.forEach(function(Istituto)
           { 
             if(IstitutoOK(Istituto)) 
                ListaFiltrata.push(Istituto)                       
           });
            
           return(ListaFiltrata);
         }
});

SIRIOApp.filter('IstitutoByNomeFiltroUnione',function()
{
  return function(ListaIstitutiPopupUnione,NomeFiltroUnione)
         {
           if(NomeFiltroUnione == '') return(ListaIstitutiPopupUnione);
           var ListaFiltrata = [];
           NomeFiltroUnione = NomeFiltroUnione.toUpperCase();
           
           var IstitutoOK = function(Istituto)
           {  
              var Result = true;
              
              if(NomeFiltroUnione != '')
                if(Istituto.Nome.toUpperCase().indexOf(NomeFiltroUnione) < 0)
                   Result = false;
              
              return(Result);
           }
           
           ListaIstitutiPopupUnione.forEach(function(Istituto)
           { 
             if(IstitutoOK(Istituto)) 
                ListaFiltrata.push(Istituto)                       
           });
            
           return(ListaFiltrata);
         }
});