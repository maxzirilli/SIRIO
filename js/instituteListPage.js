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
  //$scope.IstitutoDaUnire    = -1;
  
  ScopeHeaderController.CheckButtons();

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
                                      Nascosto      : (IstitutiInfoLista[i].NASCOSTO == null || IstitutiInfoLista[i].NASCOSTO == 0) ? false : true                        
                                    }
         
            $scope.ListaIstituti = IstitutiInfoLista
      }
      else SystemInformation.ApplyOnError('Modello istituti non conforme','');   
    });   
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
                                              ContoAdozioni = ContoAdozioni[0].COUNT_ADOZIONI;
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
                                                 ZConfirm.GetConfirmBox('AVVISO',"Sono presenti adozioni associate. Eliminare?",VaiAvanti,Fermati);
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
                                                                                                                                             Titolo : IstitutoListaAdozioni[i].NOME_TITOLO,
                                                                                                                                             Codice : IstitutoListaAdozioni[i].CODICE_TITOLO
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
         Result += 'ISBN: ' + Classe.ListaTitoliClasse[i].Codice + ' - ' + Classe.ListaTitoliClasse[i].Titolo + '</br>'
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
    var ListaDisponibilita = []
    SystemInformation.GetSQL('Institute',{CHIAVE : ChiaveIstituto},function(Results)
    {
      ListaDocenti       = SystemInformation.FindResults(Results,'InstituteTeacherList');
      ListaDisponibilita = SystemInformation.FindResults(Results,'InstituteTeacherAvailability');
      if(ListaDocenti != undefined && ListaDisponibilita != undefined)
      {
         if(ListaDocenti.length != 0)
         {
            ListaDocenti.forEach(function(Docente){Docente.DISPONIBILITA = []});
            
            for(let i = 0;i < ListaDocenti.length;i ++)
                for(let j = 0;j < ListaDisponibilita.length;j ++)
                    if (ListaDisponibilita[j].DOCENTE == ListaDocenti[i].DOCENTE)
                        ListaDocenti[i].DISPONIBILITA.push(ListaDisponibilita[j])
                       
            var Data           = new Date();
            var DataAnno       = Data.getFullYear();
            var DataMese       = Data.getMonth()+1; 
            var DataGiorno     = Data.getDate();
            var DataSpedizione = DataGiorno.toString() + '/' + DataMese.toString() +  '/' + DataAnno.toString();
          
            var doc = new jsPDF();
            doc.setProperties({title: 'LISTA DOCENTI ISTITUTO ' + DataSpedizione});
            doc.setFontSize(10); 
            doc.setFontType('bold');
            doc.text(10,20,"LISTA DOCENTI NELL'ISTITUTO:");
            doc.text(10,25,NomeIstituto + ' (CODICE: ' + CodiceIstituto + ' ), ' + ProvinciaIstituto);
            doc.setFontSize(8);
            var CoordY = 35;                       
            
            for(let k = 0;k < ListaDocenti.length;k ++)
            {
                if (CoordY >= 275) 
                {
                  doc.addPage();
                  CoordY = 10;
                }
                doc.setFontSize(8);
                doc.setFontType('bold');
                doc.text(10,CoordY+5,'DOCENTE: ' + ListaDocenti[k].NOME_DOCENTE);
                CoordY += 5;
                doc.setFontSize(7);
                doc.setFontType('italic');

                var StringaDisponibilita = [];
                if(ListaDocenti[k].DISPONIBILITA.length == 0)
                {
                   StringaDisponibilita.push('NESSUNA DISPONIBILITA ORARIA REGISTRATA');
                   doc.text(10,CoordY+5,StringaDisponibilita.toString());
                }
                else
                {  
                   CoordY += 5;
                   doc.text(40,CoordY,'DA');
                   doc.text(70,CoordY,'A');
                   doc.text(100,CoordY,'DA');
                   doc.text(130,CoordY,'A');
                   doc.text(160,CoordY,'DA');
                   doc.text(190,CoordY,'A');
                   CoordYTmp = CoordY;
                   CoordY += 5;
                   CoordYTmp = CoordY;
                   doc.text(10,CoordY,'Lun');
                   doc.setLineWidth(0.1);
                   doc.line(10, CoordY+1.5, 200, CoordY+2);
                   CoordY += 5;
                   doc.text(10,CoordY,'Mar');
                   doc.setLineWidth(0.1);
                   doc.line(10, CoordY+1.5, 200, CoordY+2);
                   CoordY += 5;
                   doc.text(10,CoordY,'Mer');
                   doc.setLineWidth(0.1);
                   doc.line(10, CoordY+1.5, 200, CoordY+2);
                   CoordY += 5;
                   doc.text(10,CoordY,'Gio');
                   doc.setLineWidth(0.1);
                   doc.line(10, CoordY+1.5, 200, CoordY+2);
                   CoordY += 5;
                   doc.text(10,CoordY,'Ven');
                   doc.setLineWidth(0.1);
                   doc.line(10, CoordY+1.5, 200, CoordY+2);
                   CoordY += 5;
                   doc.text(10,CoordY,'Sab');
                   doc.setLineWidth(0.1);
                   doc.line(10, CoordY+1.5, 200, CoordY+2);
                   CoordY += 5;
                   doc.text(10,CoordY,'Dom');
                   doc.setLineWidth(0.1);
                   doc.line(10, CoordY+1.5, 200, CoordY+2);
                   
                   for(let l = 0;l < ListaDocenti[k].DISPONIBILITA.length;l ++)
                   {
                      switch(parseInt(ListaDocenti[k].DISPONIBILITA[l].GIORNO))
                      {
                             case 0 : switch(parseInt(ListaDocenti[k].DISPONIBILITA[l].POSIZIONE))
                                      {
                                             case 0 : doc.text(40,CoordYTmp,ListaDocenti[k].DISPONIBILITA[l].DA == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].DA, 'HH:mm:ss').format('HH:mm'));
                                                      doc.text(70,CoordYTmp,ListaDocenti[k].DISPONIBILITA[l].A == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].A, 'HH:mm:ss').format('HH:mm'));
                                                      break;
                                             case 1 : doc.text(100,CoordYTmp,ListaDocenti[k].DISPONIBILITA[l].DA == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].DA, 'HH:mm:ss').format('HH:mm'));
                                                      doc.text(130,CoordYTmp,ListaDocenti[k].DISPONIBILITA[l].A == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].A, 'HH:mm:ss').format('HH:mm'));
                                                      break;
                                             case 2 : doc.text(160,CoordYTmp,ListaDocenti[k].DISPONIBILITA[l].DA == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].DA, 'HH:mm:ss').format('HH:mm'));
                                                      doc.text(190,CoordYTmp,ListaDocenti[k].DISPONIBILITA[l].A == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].A, 'HH:mm:ss').format('HH:mm'));
                                                      break;
                                      }
                                      break;
                             case 1 : switch(parseInt(ListaDocenti[k].DISPONIBILITA[l].POSIZIONE))
                                      {
                                             case 0 : doc.text(40,CoordYTmp+5,ListaDocenti[k].DISPONIBILITA[l].DA == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].DA, 'HH:mm:ss').format('HH:mm'));
                                                      doc.text(70,CoordYTmp+5,ListaDocenti[k].DISPONIBILITA[l].A == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].A, 'HH:mm:ss').format('HH:mm'));
                                                      break;
                                             case 1 : doc.text(100,CoordYTmp+5,ListaDocenti[k].DISPONIBILITA[l].DA == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].DA, 'HH:mm:ss').format('HH:mm'));
                                                      doc.text(130,CoordYTmp+5,ListaDocenti[k].DISPONIBILITA[l].A == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].A, 'HH:mm:ss').format('HH:mm'));
                                                      break;
                                             case 2 : doc.text(160,CoordYTmp+5,ListaDocenti[k].DISPONIBILITA[l].DA == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].DA, 'HH:mm:ss').format('HH:mm'));
                                                      doc.text(190,CoordYTmp+5,ListaDocenti[k].DISPONIBILITA[l].A == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].A, 'HH:mm:ss').format('HH:mm'));
                                                      break;
                                      }
                                      break;
                             case 2 : switch(parseInt(ListaDocenti[k].DISPONIBILITA[l].POSIZIONE))
                                      {
                                             case 0 : doc.text(40,CoordYTmp+10,ListaDocenti[k].DISPONIBILITA[l].DA == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].DA, 'HH:mm:ss').format('HH:mm'));
                                                      doc.text(70,CoordYTmp+10,ListaDocenti[k].DISPONIBILITA[l].A == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].A, 'HH:mm:ss').format('HH:mm'));
                                                      break;
                                             case 1 : doc.text(100,CoordYTmp+10,ListaDocenti[k].DISPONIBILITA[l].DA == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].DA, 'HH:mm:ss').format('HH:mm'));
                                                      doc.text(130,CoordYTmp+10,ListaDocenti[k].DISPONIBILITA[l].A == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].A, 'HH:mm:ss').format('HH:mm'));
                                                      break;
                                             case 2 : doc.text(160,CoordYTmp+10,ListaDocenti[k].DISPONIBILITA[l].DA == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].DA, 'HH:mm:ss').format('HH:mm'));
                                                      doc.text(190,CoordYTmp+10,ListaDocenti[k].DISPONIBILITA[l].A == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].A, 'HH:mm:ss').format('HH:mm'));
                                                      break;
                                      }
                                      break;
                             case 3 : switch(parseInt(ListaDocenti[k].DISPONIBILITA[l].POSIZIONE))
                                      {
                                             case 0 : doc.text(40,CoordYTmp+15,ListaDocenti[k].DISPONIBILITA[l].DA == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].DA, 'HH:mm:ss').format('HH:mm'));
                                                      doc.text(70,CoordYTmp+15,ListaDocenti[k].DISPONIBILITA[l].A == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].A, 'HH:mm:ss').format('HH:mm'));
                                                      break;
                                             case 1 : doc.text(100,CoordYTmp+15,ListaDocenti[k].DISPONIBILITA[l].DA == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].DA, 'HH:mm:ss').format('HH:mm'));
                                                      doc.text(130,CoordYTmp+15,ListaDocenti[k].DISPONIBILITA[l].A == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].A, 'HH:mm:ss').format('HH:mm'));
                                                      break;
                                             case 2 : doc.text(160,CoordYTmp+15,ListaDocenti[k].DISPONIBILITA[l].DA == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].DA, 'HH:mm:ss').format('HH:mm'));
                                                      doc.text(190,CoordYTmp+15,ListaDocenti[k].DISPONIBILITA[l].A == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].A, 'HH:mm:ss').format('HH:mm'));
                                                      break;
                                      }
                                      break;
                             case 4 : switch(parseInt(ListaDocenti[k].DISPONIBILITA[l].POSIZIONE))
                                      {
                                             case 0 : doc.text(40,CoordYTmp+20,ListaDocenti[k].DISPONIBILITA[l].DA == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].DA, 'HH:mm:ss').format('HH:mm'));
                                                      doc.text(70,CoordYTmp+20,ListaDocenti[k].DISPONIBILITA[l].A == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].A, 'HH:mm:ss').format('HH:mm'));
                                                      break;
                                             case 1 : doc.text(100,CoordYTmp+20,ListaDocenti[k].DISPONIBILITA[l].DA == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].DA, 'HH:mm:ss').format('HH:mm'));
                                                      doc.text(130,CoordYTmp+20,ListaDocenti[k].DISPONIBILITA[l].A == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].A, 'HH:mm:ss').format('HH:mm'));
                                                      break;
                                             case 2 : doc.text(160,CoordYTmp+20,ListaDocenti[k].DISPONIBILITA[l].DA == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].DA, 'HH:mm:ss').format('HH:mm'));
                                                      doc.text(190,CoordYTmp+20,ListaDocenti[k].DISPONIBILITA[l].A == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].A, 'HH:mm:ss').format('HH:mm'));
                                                      break; 
                                      }
                                      break;
                             case 5 : switch(parseInt(ListaDocenti[k].DISPONIBILITA[l].POSIZIONE))
                                      {
                                             case 0 : doc.text(40,CoordYTmp+25,ListaDocenti[k].DISPONIBILITA[l].DA == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].DA, 'HH:mm:ss').format('HH:mm'));
                                                      doc.text(70,CoordYTmp+25,ListaDocenti[k].DISPONIBILITA[l].A == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].A, 'HH:mm:ss').format('HH:mm'));
                                                      break;
                                             case 1 : doc.text(100,CoordYTmp+25,ListaDocenti[k].DISPONIBILITA[l].DA == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].DA, 'HH:mm:ss').format('HH:mm'));
                                                      doc.text(130,CoordYTmp+25,ListaDocenti[k].DISPONIBILITA[l].A == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].A, 'HH:mm:ss').format('HH:mm'));
                                                      break;
                                             case 2 : doc.text(160,CoordYTmp+25,ListaDocenti[k].DISPONIBILITA[l].DA == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].DA, 'HH:mm:ss').format('HH:mm'));
                                                      doc.text(190,CoordYTmp+25,ListaDocenti[k].DISPONIBILITA[l].A == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].A, 'HH:mm:ss').format('HH:mm'));
                                                      break;
                                      }
                                      break;
                             case 6 : switch(parseInt(ListaDocenti[k].DISPONIBILITA[l].POSIZIONE))
                                      {
                                             case 0 : doc.text(40,CoordYTmp+30,ListaDocenti[k].DISPONIBILITA[l].DA == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].DA, 'HH:mm:ss').format('HH:mm'));
                                                      doc.text(70,CoordYTmp+30,ListaDocenti[k].DISPONIBILITA[l].A == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].A, 'HH:mm:ss').format('HH:mm'));
                                                      break;
                                             case 1 : doc.text(100,CoordYTmp+30,ListaDocenti[k].DISPONIBILITA[l].DA == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].DA, 'HH:mm:ss').format('HH:mm'));
                                                      doc.text(130,CoordYTmp+30,ListaDocenti[k].DISPONIBILITA[l].A == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].A, 'HH:mm:ss').format('HH:mm'));
                                                      break;
                                             case 2 : doc.text(160,CoordYTmp+30,ListaDocenti[k].DISPONIBILITA[l].DA == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].DA, 'HH:mm:ss').format('HH:mm'));
                                                      doc.text(190,CoordYTmp+30,ListaDocenti[k].DISPONIBILITA[l].A == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].A, 'HH:mm:ss').format('HH:mm'));
                                                      break;
                                      }
                                      break;
                      }                             
                   }
                }
                CoordY += 5;
                doc.setFontSize(6);
                doc.text(10,290,SystemInformation.VDocAdoption)       

                doc.text(10,290,SystemInformation.VDocListaDocIst)               
            }
 
            document.getElementById('teacherListPdf').src = doc.output('datauristring');        
         }
         else
         {
            var Data           = new Date();
            var DataAnno       = Data.getFullYear();
            var DataMese       = Data.getMonth()+1; 
            var DataGiorno     = Data.getDate();
            var DataSpedizione = DataGiorno.toString() + '/' + DataMese.toString() +  '/' + DataAnno.toString();
            var doc = new jsPDF();
            doc.setProperties({title: 'LISTA DOCENTI ISTITUTO ' + DataSpedizione});
            doc.setFontSize(10); 
            doc.setFontType('bold');
            doc.setTextColor(255,0,0);
            doc.text(60,20,'NESSUN DOCENTE ASSEGNATO A QUESTO ISTITUTO');
            document.getElementById('teacherListPdf').src = doc.output('datauristring')          
         }         
      }
      else SystemInformation.ApplyOnError('Modello docenti e disponibilita per istituto non conforme','');     
    },'SelectInstituteTeacherList')
  }
  
  
  $scope.RefreshListaIstituti();
 
}]);


SIRIOApp.filter('IstitutoByFiltro',function()
{
  return function(ListaIstituti,ProvinciaFiltro,NomeFiltro,NascostoFiltro)
         {
           if(ProvinciaFiltro == -1 && NomeFiltro == '' && NascostoFiltro == true) return(ListaIstituti);
           var ListaFiltrata = [];
           NomeFiltro = NomeFiltro.toUpperCase();
           
           var IstitutoOK = function(Istituto)
           {  
              var Result = true;
              
              if(NomeFiltro != '')
                if(Istituto.Nome.toUpperCase().indexOf(NomeFiltro) < 0)
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