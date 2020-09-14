SIRIOApp.controller("deliveryListPageController",['$scope','SystemInformation','$state','$rootScope','$mdDialog','$sce','$filter',
function($scope,SystemInformation,$state,$rootScope,$mdDialog,$sce,$filter)
{
  $scope.DaSpedireFiltro  = true;
  $scope.PrenotataFiltro  = true;
  $scope.ConsegnataFiltro = false;
  $scope.ProvinciaFiltro  = -1;
  $scope.PromotoreFiltro  = -1;
  $scope.DataRicercaAl    = new Date();
  let TmpDate             = new Date($scope.DataRicercaAl);
  TmpDate.setDate(TmpDate.getDate() - 7);
  $scope.DataRicercaDal   = new Date(TmpDate);
  ListaSpedizioni         = [];
  
  ScopeHeaderController.CheckButtons(); 
  
  $scope.ConvertiData = function (Dati)
  {
     return(ZFormatDateTime('dd/mm/yyyy',ZDateFromHTMLInput(Dati.Data)));
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
  
  SystemInformation.GetSQL('Accessories',{}, function(Results)
  {
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
  
  $scope.IsAdministrator = function ()
  {
    return SystemInformation.UserInformation.Ruolo == RUOLO_AMMINISTRATORE;
  } 
  
  $scope.RefreshListaSpedizioniAll = function ()
  { 
    if($scope.DataRicercaDal == undefined || $scope.DataRicercaAl == undefined)
       return;
    let TmpDate = new Date($scope.DataRicercaAl);
    TmpDate.setDate($scope.DataRicercaAl.getDate() + 1);
     
    if($scope.isAdministrator)
    {
      SystemInformation.GetSQL('Delivery',{ Dal : ZHTMLInputFromDate($scope.DataRicercaDal), Al : ZHTMLInputFromDate(TmpDate) },function(Results)
      {
        ListaSpedizioniTmp = SystemInformation.FindResults(Results,'DeliveryListAll');
        if (ListaSpedizioniTmp != undefined) 
        {
          for(let i = 0; i < ListaSpedizioniTmp.length; i++)
              ListaSpedizioniTmp[i] = {
                                        Chiave       : ListaSpedizioniTmp[i].CHIAVE,
                                        Docente      : ListaSpedizioniTmp[i].DOCENTE,
                                        DocenteNome  : ListaSpedizioniTmp[i].NOME_DOCENTE,
                                        Data         : ListaSpedizioniTmp[i].DATA,
                                        Provincia    : ListaSpedizioniTmp[i].PROVINCIA,
                                        Stato        : ListaSpedizioniTmp[i].STATO,
                                        NrConsegnate : ListaSpedizioniTmp[i].NR_CONSEGNATE,
                                        NrDaSpedire  : ListaSpedizioniTmp[i].NR_DA_SPEDIRE,
                                        NrPrenotate  : ListaSpedizioniTmp[i].NR_PRENOTATE
                                      }
                  
          $scope.ListaSpedizioni = ListaSpedizioniTmp;
        }
        else SystemInformation.ApplyOnError('Modello spedizioni non conforme','')     
      },'SQLAdmin')     
    }
    else
    {    
      SystemInformation.GetSQL('Delivery',{ Dal : ZHTMLInputFromDate($scope.DataRicercaDal), Al : ZHTMLInputFromDate(TmpDate) },function(Results)
      {
        ListaSpedizioniTmp = SystemInformation.FindResults(Results,'MyDeliveryList');
        if (ListaSpedizioniTmp != undefined) 
        {
          for(let i = 0; i < ListaSpedizioniTmp.length; i++)
              
              ListaSpedizioniTmp[i] = {
                                        Chiave       : ListaSpedizioniTmp[i].CHIAVE,
                                        Presso       : ListaSpedizioniTmp[i].PRESSO,
                                        Docente      : ListaSpedizioniTmp[i].DOCENTE,
                                        DocenteNome  : ListaSpedizioniTmp[i].NOME_DOCENTE,
                                        Data         : ListaSpedizioniTmp[i].DATA,
                                        Provincia    : ListaSpedizioniTmp[i].PROVINCIA,
                                        Stato        : ListaSpedizioniTmp[i].STATO,
                                        NrConsegnate : ListaSpedizioniTmp[i].NR_CONSEGNATE,
                                        NrDaSpedire  : ListaSpedizioniTmp[i].NR_DA_SPEDIRE,
                                        NrPrenotate  : ListaSpedizioniTmp[i].NR_PRENOTATE,
                                        Promotore    : ListaSpedizioniTmp[i].PROMOTORE
                                      }
          $scope.ListaSpedizioni = ListaSpedizioniTmp;                  
        }
        else SystemInformation.ApplyOnError('Modello spedizioni non conforme','');     
      },'SQLPromotore');
    }
  }

  $scope.CreaXlsSpedizioni = function()
  {
    if($scope.DataRicercaDal == undefined || $scope.DataRicercaAl == undefined)
       return;
    let TmpDate = new Date($scope.DataRicercaAl);
    TmpDate.setDate($scope.DataRicercaAl.getDate() + 1);
    
    var WBook = {
	                  SheetNames : [],
	                  Sheets     : {}
                };
    
    
    var SheetName =  "SPEDIZIONI";
    var BodySheet = {};
    /*BodySheet['A1'] = SystemInformation.GetCellaIntestazione('DESTINATARIO');
    BodySheet['B1'] = SystemInformation.GetCellaIntestazione('DOCENTE');
    BodySheet['C1'] = SystemInformation.GetCellaIntestazione('INDIRIZZO');
    BodySheet['D1'] = SystemInformation.GetCellaIntestazione('DATA');
    BodySheet['E1'] = SystemInformation.GetCellaIntestazione('ISBN');
    BodySheet['F1'] = SystemInformation.GetCellaIntestazione('TITOLO');
    BodySheet['G1'] = SystemInformation.GetCellaIntestazione('QUANTITA');
    BodySheet['H1'] = SystemInformation.GetCellaIntestazione('STATO');*/
   
    let SpedizioniFiltrate = $filter('SpedizioneByFiltro')($scope.ListaSpedizioni,
                                                           $scope.ProvinciaFiltro,
                                                           $scope.PrenotataFiltro,
                                                           $scope.DaSpedireFiltro,
                                                           $scope.ConsegnataFiltro,
                                                           $scope.PromotoreFiltro);
    if($scope.IsAdministrator())
    {
       BodySheet       = {};
       BodySheet['A1'] = SystemInformation.GetCellaIntestazione('DESTINATARIO');
       BodySheet['B1'] = SystemInformation.GetCellaIntestazione('DOCENTE');
       BodySheet['C1'] = SystemInformation.GetCellaIntestazione('INDIRIZZO');
       BodySheet['D1'] = SystemInformation.GetCellaIntestazione('DATA');
       BodySheet['E1'] = SystemInformation.GetCellaIntestazione('PROMOTORE');
       BodySheet['F1'] = SystemInformation.GetCellaIntestazione('ISBN');
       BodySheet['G1'] = SystemInformation.GetCellaIntestazione('TITOLO');
       BodySheet['H1'] = SystemInformation.GetCellaIntestazione('QUANTITA');
       BodySheet['I1'] = SystemInformation.GetCellaIntestazione('STATO');
       
       SystemInformation.GetSQL('Delivery',{ Dal : ZHTMLInputFromDate($scope.DataRicercaDal), Al : ZHTMLInputFromDate(TmpDate) },function(Results)
       {
         var ListaSpedizioniToFilter = [];
         var SpedCorrisp             = {};
         var ListaSpedizioniFinale   = [];

         ListaSpedizioniToFilter = SystemInformation.FindResults(Results,'DeliveryListAdminXls');
         if(ListaSpedizioniToFilter != undefined)
         {
            for(let i = 0;i < ListaSpedizioniToFilter.length;i ++)
            {
                SpedCorrisp = SpedizioniFiltrate.find(function(ASpedizione){return (ASpedizione.Chiave == ListaSpedizioniToFilter[i].CHIAVE);});
                if(SpedCorrisp)
                   ListaSpedizioniFinale.push(ListaSpedizioniToFilter[i]);
            }              
            var ChiaveSpedizione = -1;
            for(let j = 0;j < ListaSpedizioniFinale.length;j ++)
            {
                switch(ListaSpedizioniFinale[j].STATO)
                {
                       case 'S' : ListaSpedizioniFinale[j].STATO = 'DA SPEDIRE';
                                  break;
                       case 'P' : ListaSpedizioniFinale[j].STATO = 'PRENOTATO';
                                  break;
                       case 'C' : ListaSpedizioniFinale[j].STATO = 'CONSEGNATO';
                                  break;
                }
                
                if (ChiaveSpedizione != ListaSpedizioniFinale[j].CHIAVE)
                {
                    BodySheet['A' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaSpedizioniFinale[j].PRESSO);
                    BodySheet['B' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaSpedizioniFinale[j].NOME_DOCENTE == undefined ? '' : ListaSpedizioniFinale[j].NOME_DOCENTE);
                    BodySheet['C' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaSpedizioniFinale[j].INDIRIZZO + ', ' + ListaSpedizioniFinale[j].COMUNE + ', ' + ListaSpedizioniFinale[j].CAP + ', ' + ListaSpedizioniFinale[j].NOME_PROVINCIA);
                    BodySheet['D' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ZFormatDateTime('dd/mm/yyyy',ZDateFromHTMLInput(ListaSpedizioniFinale[j].DATA)));
                    BodySheet['E' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaSpedizioniFinale[j].NOME_PROMOTORE.toUpperCase()); 
                    BodySheet['F' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaSpedizioniFinale[j].CODICE_TITOLO);
                    BodySheet['G' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaSpedizioniFinale[j].NOME_TITOLO);
                    BodySheet['H' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaSpedizioniFinale[j].QUANTITA);
                    BodySheet['I' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaSpedizioniFinale[j].STATO);
                    
                    ChiaveSpedizione = ListaSpedizioniFinale[j].CHIAVE;
                }
                else
                {   
                    BodySheet['A' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s','');
                    BodySheet['B' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s','');
                    BodySheet['C' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s','');
                    BodySheet['D' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s','');
                    BodySheet['E' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',''); 
                    BodySheet['F' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaSpedizioniFinale[j].CODICE_TITOLO);
                    BodySheet['G' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaSpedizioniFinale[j].NOME_TITOLO);
                    BodySheet['H' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaSpedizioniFinale[j].QUANTITA);
                    BodySheet['I' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaSpedizioniFinale[j].STATO);
                   
                    ChiaveSpedizione = ListaSpedizioniFinale[j].CHIAVE;
                }                    
            }
            
            BodySheet["!cols"] = [             
                                   {wpx: 150},
                                   {wpx: 150},
                                   {wpx: 250},
                                   {wpx: 150},
                                   {wpx: 150},
                                   {wpx: 150},
                                   {wpx: 200},
                                   {wpx: 50},
                                   {wpx: 100}
                                 ];
            BodySheet['!ref'] = 'A1:I1' + parseInt(ListaSpedizioniFinale.length + 1);
            
            WBook.SheetNames.push(SheetName);
            WBook.Sheets[SheetName] = BodySheet;
            
            var wbout = XLSX.write(WBook, {bookType:'xlsx', bookSST:true, type: 'binary'});
            saveAs(new Blob([SystemInformation.s2ab(wbout)],{type:"application/octet-stream"}), "Spedizioni.xlsx")                                       
         }
         else SystemInformation.ApplyOnError('Modello spedizioni di confronto per xls non conforme','')
       },'SQLAdminXls');
    }
    else
    {
       BodySheet       = {};
       BodySheet['A1'] = SystemInformation.GetCellaIntestazione('DESTINATARIO');
       BodySheet['B1'] = SystemInformation.GetCellaIntestazione('DOCENTE');
       BodySheet['C1'] = SystemInformation.GetCellaIntestazione('INDIRIZZO');
       BodySheet['D1'] = SystemInformation.GetCellaIntestazione('DATA');
       BodySheet['E1'] = SystemInformation.GetCellaIntestazione('ISBN');
       BodySheet['F1'] = SystemInformation.GetCellaIntestazione('TITOLO');
       BodySheet['G1'] = SystemInformation.GetCellaIntestazione('QUANTITA');
       BodySheet['H1'] = SystemInformation.GetCellaIntestazione('STATO');
       
       SystemInformation.GetSQL('Delivery',{ Dal : ZHTMLInputFromDate($scope.DataRicercaDal), Al : ZHTMLInputFromDate(TmpDate) },function(Results)
       {
         var ListaSpedizioniToFilter = [];
         var SpedCorrisp             = {};
         var ListaSpedizioniFinale   = [];

         ListaSpedizioniToFilter = SystemInformation.FindResults(Results,'MyDeliveryListXls');
         if(ListaSpedizioniToFilter != undefined)
         {
            for(let i = 0;i < ListaSpedizioniToFilter.length;i ++)
            {
               SpedCorrisp = SpedizioniFiltrate.find(function(ASpedizione){return (ASpedizione.Chiave == ListaSpedizioniToFilter[i].CHIAVE);});
               if(SpedCorrisp)
                  ListaSpedizioniFinale.push(ListaSpedizioniToFilter[i]);
            }                              
            var ChiaveSpedizione = -1;                          
            for(let j = 0;j < ListaSpedizioniFinale.length;j ++)
            {
                switch(ListaSpedizioniFinale[j].STATO)
                {
                       case 'S' : ListaSpedizioniFinale[j].STATO = 'DA SPEDIRE';
                                  break;
                       case 'P' : ListaSpedizioniFinale[j].STATO = 'PRENOTATO';
                                  break;
                       case 'C' : ListaSpedizioniFinale[j].STATO = 'CONSEGNATO';
                                  break;
                }
                
                if (ChiaveSpedizione != ListaSpedizioniFinale[j].CHIAVE)
                {
                    BodySheet['A' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaSpedizioniFinale[j].PRESSO);
                    BodySheet['B' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaSpedizioniFinale[j].NOME_DOCENTE == undefined ? '' : ListaSpedizioniFinale[j].NOME_DOCENTE);
                    BodySheet['C' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaSpedizioniFinale[j].INDIRIZZO + ', ' + ListaSpedizioniFinale[j].COMUNE + ', ' + ListaSpedizioniFinale[j].CAP + ', ' + ListaSpedizioniFinale[j].NOME_PROVINCIA);
                    BodySheet['D' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ZFormatDateTime('dd/mm/yyyy',ZDateFromHTMLInput(ListaSpedizioniFinale[j].DATA)));
                    BodySheet['E' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaSpedizioniFinale[j].CODICE_TITOLO);
                    BodySheet['F' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaSpedizioniFinale[j].NOME_TITOLO);
                    BodySheet['G' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaSpedizioniFinale[j].QUANTITA);
                    BodySheet['H' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaSpedizioniFinale[j].STATO);
                    
                    ChiaveSpedizione = ListaSpedizioniFinale[j].CHIAVE;
                }
                else
                {
                    BodySheet['E' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaSpedizioniFinale[j].CODICE_TITOLO);
                    BodySheet['F' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaSpedizioniFinale[j].NOME_TITOLO);
                    BodySheet['G' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaSpedizioniFinale[j].QUANTITA);
                    BodySheet['H' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaSpedizioniFinale[j].STATO);
                    
                    ChiaveSpedizione = ListaSpedizioniFinale[j].CHIAVE;
                }                    
            }
            
            BodySheet["!cols"] = [             
                                   {wpx: 150},
                                   {wpx: 150},
                                   {wpx: 250},
                                   {wpx: 150},
                                   {wpx: 150},
                                   {wpx: 200},
                                   {wpx: 50},
                                   {wpx: 100}
                                 ];
            BodySheet['!ref'] = 'A1:H1' + parseInt(ListaSpedizioniFinale.length + 1);
            
            WBook.SheetNames.push(SheetName);
            WBook.Sheets[SheetName] = BodySheet;
            
            var wbout = XLSX.write(WBook, {bookType:'xlsx', bookSST:true, type: 'binary'});
            saveAs(new Blob([SystemInformation.s2ab(wbout)],{type:"application/octet-stream"}), "Spedizioni.xlsx")                            
         }
         else SystemInformation.ApplyOnError('Modello spedizioni di confronto per xls non conforme','')
       },'SQLPromotoreXls');        
    }
  }
  
  $scope.ModificaSpedizione = function (ChiaveSpedizione,ChiaveDocente = -1)
  {
    SystemInformation.DataBetweenController.ChiaveSpedizione = ChiaveSpedizione;
    SystemInformation.DataBetweenController.ChiaveDocente    = ChiaveDocente;
    SystemInformation.DataBetweenController.Provenienza      = 'DeliveryPage';
    $state.go("deliveryModDetailPage"); 
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
            var $ObjQuery = { Operazioni : [] }; 
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
              $scope.RefreshListaSpedizioniAll();
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
        $scope.RefreshListaSpedizioniAll();
        $ObjQuery.Operazioni = [];
      });
    }
  }

  $scope.NuovaSpedizioneCasaEditrice = function ()
  {
    SystemInformation.DataBetweenController.ChiaveSpedizione = -1;
    SystemInformation.DataBetweenController.ChiaveDocente    = -1;
    SystemInformation.DataBetweenController.Provenienza      = 'DeliveryPage';
    $state.go("deliveryModDetailPage");  
  }  
  
  $scope.RefreshListaSpedizioniAll();
  
}]);

SIRIOApp.filter('SpedizioneByFiltro',function()
{
  return function(ListaSpedizioni,ProvinciaFiltro,PrenotataFiltro,DaSpedireFiltro,ConsegnataFiltro,PromotoreFiltro)
         {
           if (ListaSpedizioni != undefined)
           {  
             if(ProvinciaFiltro == -1 && !PrenotataFiltro && !DaSpedireFiltro && !ConsegnataFiltro && PromotoreFiltro == -1) 
                return(ListaSpedizioni);
             var ListaFiltrata = [];
             ProvinciaFiltro = parseInt(ProvinciaFiltro);
             
             var SpedizioneOk = function(Spedizione)
             {  
                var Result = true;
                if(ProvinciaFiltro != -1)
                   if(Spedizione.Provincia != ProvinciaFiltro)
                      Result = false;
                      
                if(PromotoreFiltro != -1)
                    if(Spedizione.Promotore != PromotoreFiltro)
                       Result = false;
                
                if(Result)
                   Result = (Spedizione.NrPrenotate  != 0 && PrenotataFiltro) ||
                            (Spedizione.NrDaSpedire  != 0 && DaSpedireFiltro) ||
                            (Spedizione.NrConsegnate != 0 && ConsegnataFiltro);
                     
                return(Result);
             }
             
              ListaSpedizioni.forEach(function(Spedizione)
              { 
                if(SpedizioneOk(Spedizione)) 
                   ListaFiltrata.push(Spedizione)                       
              });
              
              return(ListaFiltrata);
           }
         }
});

