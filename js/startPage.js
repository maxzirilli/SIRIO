SIRIOApp.controller("startPageController",['$scope','SystemInformation','$state','$rootScope','$mdDialog','$sce',
function($scope,SystemInformation,$state,$rootScope,$mdDialog,$sce)
{
  ScopeHeaderController.CheckButtons();
  $scope.MostraListaSpedizioni = false;  
  
  $scope.ApriListaUtenti = function()
  {    
    $state.go("userListPage"); 
  }  
  
  $scope.ApriListaIstituti = function()
  {    
    $state.go("instituteListPage"); 
  }
  
  $scope.ApriListaDocenti = function()
  {    
    $state.go("teacherListPage"); 
  } 
  
  $scope.ApriListaOrdiniIngresso = function()
  {    
    $state.go("orderEntryPage"); 
  } 

  $scope.ApriListaTitoli = function()
  {    
    $state.go("titleListPage"); 
  }   
  
  $scope.ApriListaConfigurazioni = function()
  {    
    $state.go("configurationsListPage"); 
  } 
  
  $scope.ApriCsvIstitutiUpload = function()
  {    
    $state.go("csvInstitutePage"); 
  }
  
  $scope.ApriCsvTitoliUpload = function()
  {    
    $state.go("csvBookPage"); 
  }
  
  $scope.ApriCsvDocentiUpload = function()
  {    
    $state.go("csvTeacherPage"); 
  }
  
  $scope.ApriListaSpedizioni = function()
  {    
    $state.go("deliveryListPage"); 
  } 
  
  $scope.ApriPaginaEtichette = function ()
  {
    $state.go("printLabelPage");
  }
  
  $scope.ApriLogMagazzini = function ()
  {
    $state.go("storageLogPage");
  }
  
  $scope.ApriMagazzinoVolante = function ()
  {
    $state.go("flyingStoragePage");
  }
  
  $scope.ApriCsvCataloghiMondadoriUpload = function ()
  {
    $state.go("csvCatalogMondadoriPage");
  }
  
  $scope.ApriCsvCataloghiDeAgostiniUpload = function ()
  {
    $state.go("csvCatalogDeAgostiniPage");
  }
  
  $scope.IsAdministrator = function ()
  {
    return SystemInformation.UserInformation.Ruolo == RUOLO_AMMINISTRATORE;
  } 

  $scope.NuovaSpedizioneCasaEditrice = function ()
  {
    SystemInformation.DataBetweenController.ChiaveSpedizione = -1;
    SystemInformation.DataBetweenController.ChiaveDocente    = -1;
    SystemInformation.DataBetweenController.Provenienza      = 'StartPage';
    $state.go("deliveryModDetailPage");  
  }

  $scope.GetDescrStatoSpedizione = function(Spedizione)
  {
     var Result = '';
     if(Spedizione.NrPrenotate != 0)
     {
        if(Spedizione.NrDaSpedire == 0 && Spedizione.NrConsegnate == 0)
           Result += 'PRENOTATE<br/>';  
        else Result += Spedizione.NrPrenotate + ' PRENOTATE<br/>';  
     }
     if(Spedizione.NrDaSpedire != 0)
     {
        if(Spedizione.NrConsegnate == 0 && Spedizione.NrPrenotate == 0)
           Result += 'DA SPEDIRE<br/>';  
        else Result += Spedizione.NrDaSpedire + ' DA SPEDIRE<br/>';  
     }
     if(Spedizione.NrConsegnate != 0)
     {
        if(Spedizione.NrDaSpedire == 0 && Spedizione.NrPrenotate == 0)
           Result += 'CONSEGNATE<br/>';  
        else Result += Spedizione.NrConsegnate + 'CONSEGNATE<br/>';  
     }
     
     return($sce.trustAsHtml(Result.substr(0,Result.length - 5)));
  } 

  $scope.PassaADaSpedireDisponibili = function (ChiaveSped)
  {
    if(confirm('Passare tutti i titoli della spedizione da PRENOTATI(DISPONIBILI) a DA SPEDIRE?'))
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
                                       "Quantita"        : SpedizioneDettaglio[i].QUANTITA
                                     });
            }
            var $ObjQuery            = { Operazioni : [] }; 
            var TitoliNonDisponibili = [];
            var TitoliDaSpedire      = [];            
            for(let j = 0;j < ListaTitoliSped.length;j ++)
            {
              if(parseInt(ListaTitoliSped[j].Quantita) <= parseInt(ListaTitoliSped[j].QuantitaMgzn))
              {
                 var ParamSpedizione = {
                                         "CHIAVE" : ListaTitoliSped[j].ChiaveDettaglio
                                         //"TITOLO" : ListaTitoliSped[j].Titolo
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
                var OggettoNd = '';
                OggettoNd     = '\n' + 'Nr° : ' + ListaTitoliSped[j].Quantita.toString() + ' - ' + ListaTitoliSped[j].TitoloNome.toString();
                TitoliNonDisponibili.push(OggettoNd);
              }              
            }
            SystemInformation.PostSQL('Delivery',$ObjQuery,function(Results)
            {                            
              $scope.RefreshListaUltimeSpedizioni(); 
              if(TitoliNonDisponibili.length != 0 && TitoliDaSpedire.length == 0)               
                 alert('I seguenti titoli non sono disponibili per essere spediti:  ' + TitoliNonDisponibili)
              else if (TitoliNonDisponibili.length == 0 && TitoliDaSpedire.length != 0)
                 alert('I seguenti titoli sono stati segnati come DA SPEDIRE : ' + TitoliDaSpedire)
              else if (TitoliNonDisponibili.length != 0 && TitoliDaSpedire.length != 0)
                 alert('I seguenti titoli sono stati segnati come DA SPEDIRE : ' + TitoliDaSpedire + '\n' + '\n' + 'I seguenti titoli non sono disponibili per essere spediti:  ' + TitoliNonDisponibili);              
            })                       
         }
         else SystemInformation.ApplyOnError('Modello dettaglio spedizione non conforme','');
       },'SQLDettaglioSpedizioneGenerico');
    }
  }  
  
  $scope.RefreshListaUltimeSpedizioni = function ()
  {  
    if($scope.IsAdministrator())
    {
       SystemInformation.GetSQL('Delivery',{},function(Results)
       {
         UltimeVentiSpedizioniTmp = SystemInformation.FindResults(Results,'DeliveryListLastTwentyAdm');
         if (UltimeVentiSpedizioniTmp != undefined) 
         {
           for(let i = 0; i < UltimeVentiSpedizioniTmp.length; i++)
               UltimeVentiSpedizioniTmp[i] = {
                                               Chiave       : UltimeVentiSpedizioniTmp[i].CHIAVE,
                                               Presso       : UltimeVentiSpedizioniTmp[i].PRESSO,
                                               Docente      : UltimeVentiSpedizioniTmp[i].DOCENTE == null ? -1 : UltimeVentiSpedizioniTmp[i].DOCENTE,
                                               DocenteNome  : UltimeVentiSpedizioniTmp[i].NOME_DOCENTE,
                                               Data         : ZFormatDateTime('dd/mm/yyyy',ZDateFromHTMLInput(UltimeVentiSpedizioniTmp[i].DATA)),
                                               NrConsegnate : UltimeVentiSpedizioniTmp[i].NR_CONSEGNATE,
                                               NrDaSpedire  : UltimeVentiSpedizioniTmp[i].NR_DA_SPEDIRE,
                                               NrPrenotate  : UltimeVentiSpedizioniTmp[i].NR_PRENOTATE                                               
                                             }
           $scope.UltimeVentiSpedizioni = UltimeVentiSpedizioniTmp;
         }
         else SystemInformation.ApplyOnError('Modello spedizioni non conforme','');     
       },'SQLUltime20Admin')     
    }
    else
    {
       SystemInformation.GetSQL('Delivery',{},function(Results)
       {
         UltimeVentiSpedizioniTmp = SystemInformation.FindResults(Results,'DeliveryListLastTwentyPrm');
         if (UltimeVentiSpedizioniTmp != undefined) 
         {
           for(let i = 0; i < UltimeVentiSpedizioniTmp.length; i++)
               UltimeVentiSpedizioniTmp[i] = {
                                               Chiave       : UltimeVentiSpedizioniTmp[i].CHIAVE,
                                               Presso       : UltimeVentiSpedizioniTmp[i].PRESSO,
                                               Docente      : UltimeVentiSpedizioniTmp[i].DOCENTE == null ? -1 : UltimeVentiSpedizioniTmp[i].DOCENTE,
                                               DocenteNome  : UltimeVentiSpedizioniTmp[i].NOME_DOCENTE,
                                               Data         : ZFormatDateTime('dd/mm/yyyy',ZDateFromHTMLInput(UltimeVentiSpedizioniTmp[i].DATA)),
                                               NrConsegnate : UltimeVentiSpedizioniTmp[i].NR_CONSEGNATE,
                                               NrDaSpedire  : UltimeVentiSpedizioniTmp[i].NR_DA_SPEDIRE,
                                               NrPrenotate  : UltimeVentiSpedizioniTmp[i].NR_PRENOTATE                                                
                                             }
           $scope.UltimeVentiSpedizioni = UltimeVentiSpedizioniTmp;
         }
         else SystemInformation.ApplyOnError('Modello spedizioni non conforme','');     
       },'SQLUltime20Promotore')          
    }
  }
       
  $scope.ModificaSpedizione = function (ChiaveSpedizione,ChiaveDocente = -1)
  {
    SystemInformation.DataBetweenController.ChiaveSpedizione = ChiaveSpedizione;
    SystemInformation.DataBetweenController.ChiaveDocente    = ChiaveDocente;
    SystemInformation.DataBetweenController.Provenienza      = 'StartPage';
    $state.go("deliveryModDetailPage"); 
  }

  $scope.EliminaSpedizione = function (Spedizione)
  {
    if (confirm('Eliminare la spedizione del ' + Spedizione.Data + ' presso ' + Spedizione.Presso + ' ?'))
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
        $scope.RefreshListaUltimeSpedizioni();
        $ObjQuery.Operazioni = [];
      });
    }
  }  
  
  $scope.RefreshListaUltimeSpedizioni();

}]);


