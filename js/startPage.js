SIRIOApp.controller("startPageController",['$scope','SystemInformation','$state','$rootScope','$mdDialog','$sce','$http','$mdDialog','ZConfirm',
function($scope,SystemInformation,$state,$rootScope,$mdDialog,$sce,$http,$mdDialog,ZConfirm)
{
  $scope.CalendarioVisibile = true;
  $scope.UrlCalendario      = '';
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

  $scope.ApriMailChimpUpload = function()
  {
    $state.go("mailchimpUploadPage");
  }

  $scope.ApriGestioneInventario = function()
  {
    $state.go("inventoryManagementPage");
  }

  $scope.ApriGestioneComunicazioni = function()
  {
    $state.go("communicationPage");
  }

  $scope.CheckAdozioniInScadenza = function()
  {
    $state.go("adoptionDeadlinePage");
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

  $scope.CreaXlsMailchimp = function()
  {
    SystemInformation.GetSQL('Teacher',{},function(Results)
    {
      DocenteDettaglioTmp = SystemInformation.FindResults(Results,'TeacherMailList');
      ListaIstituti = SystemInformation.FindResults(Results,'TeacherMailInstitute');
      if(ListaIstituti != undefined && DocenteDettaglioTmp != undefined)
      { 
         var ListaDocentiFinaleMultipleIst = [];
         for(let i = 0;i < DocenteDettaglioTmp.length;i ++)
         {
           
            if(DocenteDettaglioTmp[i].RAGIONE_SOCIALE != undefined)
            {
              var NomeCognome = DocenteDettaglioTmp[i].RAGIONE_SOCIALE;
              var NomeCognomeSplittato = NomeCognome.split(" ");
              DocenteDettaglioTmp[i].Nome    = NomeCognomeSplittato[NomeCognomeSplittato.length-1];
              DocenteDettaglioTmp[i].Cognome = (NomeCognomeSplittato.slice(0, -1)).toString();
              DocenteDettaglioTmp[i].Cognome = DocenteDettaglioTmp[i].Cognome.replace(",", " ");
            }
            else
            {
              DocenteDettaglioTmp[i].Nome    = 'SCONOSCIUTO';
              DocenteDettaglioTmp[i].Cognome = 'SCONOSCIUTO';
            }
            
            DocenteDettaglioTmp[i] = {
                                        Chiave         : DocenteDettaglioTmp[i].CHIAVE,
                                        Nome           : DocenteDettaglioTmp[i].Nome,
                                        Cognome        : DocenteDettaglioTmp[i].Cognome,
                                        Email          : DocenteDettaglioTmp[i].EMAIL,
                                        Comune         :  DocenteDettaglioTmp[i].COMUNE == undefined ? 'SCONOSCIUTO' : DocenteDettaglioTmp[i].COMUNE,
                                        Provincia      :  DocenteDettaglioTmp[i].TARGA_PROVINCIA == undefined ? 'SCONOSCIUTA' :  DocenteDettaglioTmp[i].TARGA_PROVINCIA,
                                        Materia1       :  DocenteDettaglioTmp[i].MATERIA_1_NOME == undefined ? '' :  DocenteDettaglioTmp[i].MATERIA_1_NOME,
                                        Materia2       :  DocenteDettaglioTmp[i].MATERIA_2_NOME == undefined ? '' :  DocenteDettaglioTmp[i].MATERIA_2_NOME,
                                        Materia3       :  DocenteDettaglioTmp[i].MATERIA_3_NOME == undefined ? '' :  DocenteDettaglioTmp[i].MATERIA_3_NOME,                                       
                                        StringaMaterie : '',
                                        ListaIst       : []
                                     }
            
            if(DocenteDettaglioTmp[i].Materia1 == '' && DocenteDettaglioTmp[i].Materia2 == '' && DocenteDettaglioTmp[i].Materia3 == '' )
               DocenteDettaglioTmp[i].StringaMaterie = 'SCONOSCIUTA'
            else 
            {
              if(DocenteDettaglioTmp[i].Materia1 != '')
                 DocenteDettaglioTmp[i].StringaMaterie = DocenteDettaglioTmp[i].StringaMaterie + DocenteDettaglioTmp[i].Materia1;
              if(DocenteDettaglioTmp[i].Materia2 != '')
                 DocenteDettaglioTmp[i].StringaMaterie = DocenteDettaglioTmp[i]. StringaMaterie + ' - ' + DocenteDettaglioTmp[i].Materia2;
              if(DocenteDettaglioTmp[i].Materia3 != '')
                 DocenteDettaglioTmp[i].StringaMaterie = DocenteDettaglioTmp[i].StringaMaterie + ' - ' + DocenteDettaglioTmp[i].Materia3;
            }
            for(let j = 0;j < ListaIstituti.length;j ++)
            {
              if(ListaIstituti[j].NOME_ISTITUTO == undefined)
                 ListaIstituti[j].NOME_ISTITUTO = 'SCONOSCIUTO';
              if(ListaIstituti[j].CODICE_ISTITUTO == undefined)
                 ListaIstituti[j].CODICE_ISTITUTO = 'SCONOSCIUTO';

              if(ListaIstituti[j].DOCENTE == DocenteDettaglioTmp[i].Chiave)
                 DocenteDettaglioTmp[i].ListaIst.push({Istituto : ListaIstituti[j].NOME_ISTITUTO,Codice : ListaIstituti[j].CODICE_ISTITUTO });
            }
            
            if(DocenteDettaglioTmp[i].ListaIst.length > 1)
            {
               ListaDocentiFinaleMultipleIst.push(DocenteDettaglioTmp[i])
               DocenteDettaglioTmp.splice(i,1);
               i--
            }
            if(DocenteDettaglioTmp[i].ListaIst.length == 0)
            {
              DocenteDettaglioTmp[i].ListaIst.push({Istituto :'NESSUN ISTITUTO',Codice : '-'}); 
            }

         }
         ListaDocentiFinale = DocenteDettaglioTmp;

         var WBook = {
                      SheetNames : [],
                      Sheets     : {}
                     };

        var SheetName       = "MAIL DOCENTI";
        var BodySheet       = {};
        var SheetNameMulti  = "MAIL DOCENTI - ISTITUTI MULTIPLI";
        var BodySheetMulti  = {};

        BodySheet['A1'] = SystemInformation.GetCellaIntestazione('EMAIL');
        BodySheet['B1'] = SystemInformation.GetCellaIntestazione('NOME');
        BodySheet['C1'] = SystemInformation.GetCellaIntestazione('COGNOME');
        BodySheet['D1'] = SystemInformation.GetCellaIntestazione('MATERIE');
        BodySheet['E1'] = SystemInformation.GetCellaIntestazione('PROVINCIA');
        BodySheet['F1'] = SystemInformation.GetCellaIntestazione('COMUNE');
        BodySheet['G1'] = SystemInformation.GetCellaIntestazione('ISTITUTO');
        BodySheet['H1'] = SystemInformation.GetCellaIntestazione('CODICE ISTITUTO');
        BodySheet['I1'] = SystemInformation.GetCellaIntestazione('CONSENSO');

        BodySheetMulti['A1'] = SystemInformation.GetCellaIntestazione('EMAIL');
        BodySheetMulti['B1'] = SystemInformation.GetCellaIntestazione('NOME');
        BodySheetMulti['C1'] = SystemInformation.GetCellaIntestazione('COGNOME');
        BodySheetMulti['D1'] = SystemInformation.GetCellaIntestazione('MATERIE');
        BodySheetMulti['E1'] = SystemInformation.GetCellaIntestazione('PROVINCIA');
        BodySheetMulti['F1'] = SystemInformation.GetCellaIntestazione('COMUNE');
        BodySheetMulti['G1'] = SystemInformation.GetCellaIntestazione('ISTITUTO');
        BodySheetMulti['H1'] = SystemInformation.GetCellaIntestazione('CODICE ISTITUTO');
        BodySheetMulti['I1'] = SystemInformation.GetCellaIntestazione('ISTITUTO');
        BodySheetMulti['J1'] = SystemInformation.GetCellaIntestazione('CODICE ISTITUTO');
        BodySheetMulti['K1'] = SystemInformation.GetCellaIntestazione('ISTITUTO');
        BodySheetMulti['L1'] = SystemInformation.GetCellaIntestazione('CODICE ISTITUTO');
        BodySheetMulti['M1'] = SystemInformation.GetCellaIntestazione('CONSENSO');

        for(let i = 0;i < ListaDocentiFinale.length;i ++)
        {
          BodySheet['A' + parseInt(i + 2)] = SystemInformation.GetCellaDati('s',ListaDocentiFinale[i].Email);
          BodySheet['B' + parseInt(i + 2)] = SystemInformation.GetCellaDati('s',ListaDocentiFinale[i].Nome);
          BodySheet['C' + parseInt(i + 2)] = SystemInformation.GetCellaDati('s',ListaDocentiFinale[i].Cognome);
          BodySheet['D' + parseInt(i + 2)] = SystemInformation.GetCellaDati('s',ListaDocentiFinale[i].StringaMaterie);
          BodySheet['E' + parseInt(i + 2)] = SystemInformation.GetCellaDati('s',ListaDocentiFinale[i].Provincia);
          BodySheet['F' + parseInt(i + 2)] = SystemInformation.GetCellaDati('s',ListaDocentiFinale[i].Comune);
          BodySheet['G' + parseInt(i + 2)] = SystemInformation.GetCellaDati('s',ListaDocentiFinale[i].ListaIst[0].Istituto);
          BodySheet['H' + parseInt(i + 2)] = SystemInformation.GetCellaDati('s',ListaDocentiFinale[i].ListaIst[0].Codice);
          BodySheet['I' + parseInt(i + 2)] = SystemInformation.GetCellaDati('s','Acconsento');
        }

        for(let i = 0;i < ListaDocentiFinaleMultipleIst.length;i ++)
        {

          if(ListaDocentiFinaleMultipleIst[i].ListaIst.length < 3)
             ListaDocentiFinaleMultipleIst[i].ListaIst.push({Istituto :'',Codice : ''}); 

          BodySheetMulti['A' + parseInt(i + 2)] = SystemInformation.GetCellaDati('s',ListaDocentiFinaleMultipleIst[i].Email);
          BodySheetMulti['B' + parseInt(i + 2)] = SystemInformation.GetCellaDati('s',ListaDocentiFinaleMultipleIst[i].Nome);
          BodySheetMulti['C' + parseInt(i + 2)] = SystemInformation.GetCellaDati('s',ListaDocentiFinaleMultipleIst[i].Cognome);
          BodySheetMulti['D' + parseInt(i + 2)] = SystemInformation.GetCellaDati('s',ListaDocentiFinaleMultipleIst[i].StringaMaterie);
          BodySheetMulti['E' + parseInt(i + 2)] = SystemInformation.GetCellaDati('s',ListaDocentiFinaleMultipleIst[i].Provincia);
          BodySheetMulti['F' + parseInt(i + 2)] = SystemInformation.GetCellaDati('s',ListaDocentiFinaleMultipleIst[i].Comune);
          BodySheetMulti['G' + parseInt(i + 2)] = SystemInformation.GetCellaDati('s',ListaDocentiFinaleMultipleIst[i].ListaIst[0].Istituto);
          BodySheetMulti['H' + parseInt(i + 2)] = SystemInformation.GetCellaDati('s',ListaDocentiFinaleMultipleIst[i].ListaIst[0].Codice);
          BodySheetMulti['I' + parseInt(i + 2)] = SystemInformation.GetCellaDati('s',ListaDocentiFinaleMultipleIst[i].ListaIst[1].Istituto);
          BodySheetMulti['J' + parseInt(i + 2)] = SystemInformation.GetCellaDati('s',ListaDocentiFinaleMultipleIst[i].ListaIst[1].Codice);
          BodySheetMulti['K' + parseInt(i + 2)] = SystemInformation.GetCellaDati('s',ListaDocentiFinaleMultipleIst[i].ListaIst[2].Istituto);
          BodySheetMulti['L' + parseInt(i + 2)] = SystemInformation.GetCellaDati('s',ListaDocentiFinaleMultipleIst[i].ListaIst[2].Codice);
          BodySheetMulti['M' + parseInt(i + 2)] = SystemInformation.GetCellaDati('s','Acconsento'); 
        }

        BodySheet["!cols"] = [             
                                {wpx: 200},
                                {wpx: 200},
                                {wpx: 200},
                                {wpx: 250},
                                {wpx: 200},
                                {wpx: 200},
                                {wpx: 300},
                                {wpx: 300},
                                {wpx: 200}
                             ];

        BodySheet['!ref'] = 'A1:I1' + parseInt(ListaDocentiFinale.length + 1);

        BodySheetMulti["!cols"] = [             
                                    {wpx: 200},
                                    {wpx: 200},
                                    {wpx: 200},
                                    {wpx: 250},
                                    {wpx: 200},
                                    {wpx: 200},
                                    {wpx: 300},
                                    {wpx: 300},
                                    {wpx: 300},
                                    {wpx: 300},
                                    {wpx: 300},
                                    {wpx: 300},
                                    {wpx: 200}
                                 ];
        BodySheetMulti['!ref'] = 'A1:M1' + parseInt(ListaDocentiFinaleMultipleIst.length + 1);

        WBook.SheetNames.push(SheetName);
        WBook.Sheets[SheetName] = BodySheet;
        WBook.SheetNames.push(SheetNameMulti);
        WBook.Sheets[SheetNameMulti] = BodySheetMulti;

        var wbout = XLSX.write(WBook, {bookType:'xlsx', bookSST:true, type: 'binary'});
        saveAs(new Blob([SystemInformation.s2ab(wbout)],{type:"application/octet-stream"}), "MailDocenti.xlsx")  
      }
      else SystemInformation.ApplyOnError('Modello mail docenti non conforme','');
    },'SelectMailchimpTeacher');
  }

  $scope.ApriComunicazione = function(Comunicazione)
  {
    $mdDialog.show({ 
                    controller          : DialogControllerComunicazione,
                    templateUrl         : "template/communicationPopup.html",
                    targetEvent         : Comunicazione,
                    scope               : $scope,
                    preserveScope       : true,
                    clickOutsideToClose : true,
                    locals              : {Comunicazione}
                  })
    .then(function(answer) 
    {}, 
    function() 
    {});
  }
  
  function DialogControllerComunicazione($scope,$mdDialog,Comunicazione)  
  { 
    $scope.ComunicazioneToView = {
                                   Titolo : Comunicazione.Titolo,
                                   Data   : $scope.ConvertiData(Comunicazione.Data),
                                   Testo  : Comunicazione.Testo,
                                   Link   : Comunicazione.Link,  
                                 }

    $scope.hide = function() 
    {
      $scope.ComunicazioneToView = {};
      $mdDialog.hide();
    };

    $scope.ChiudiPopupComunicazione = function() 
    {
      $scope.ComunicazioneToView = {};
      $mdDialog.cancel();
    };
  }

  $scope.ConvertiData = function (Data)
  {
     return(ZFormatDateTime('dd/mm/yyyy',ZDateFromHTMLInput(Data)));
  }
  
  $scope.RefreshListaComunicazioni = function ()
  {
    SystemInformation.GetSQL('Communication', {}, function(Results)  
    {
      CommInfoList = SystemInformation.FindResults(Results,'CommunicationInfoList');
      if(CommInfoList != undefined)
      { 
        for(let i = 0;i < CommInfoList.length;i ++)
            CommInfoList[i] = { 
                                 Chiave : CommInfoList[i].CHIAVE,
                                 Data   : CommInfoList[i].DATA,
                                 Titolo : CommInfoList[i].TITOLO,   
                                 Testo  : CommInfoList[i].TESTO,  
                                 Link   : CommInfoList[i].LINK
                              };         
          $scope.ListaComunicazioni = CommInfoList;
      }
      else SystemInformation.ApplyOnError('Modello comunicazioni non conforme','');   
    });
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

  $scope.GetUrlCalendario = function()
  {
    SystemInformation.GetSQL('CompanyData',{}, function (Results)
    {
      DatiDittaSql     = SystemInformation.FindResults(Results,'GetCompanyData');
      if (DatiDittaSql != undefined)
      {
         $scope.UrlCalendario = DatiDittaSql[0].URL_CALENDARIO;
         if(DatiDittaSql[0].CALENDARIO_VISIBILE == 'T')
         {
           $scope.CalendarioVisibile = true;
           $scope.UrlCalendario = $sce.trustAsResourceUrl($scope.UrlCalendario);
         }
         else
         {
            $scope.CalendarioVisibile = false; 
            $scope.RefreshListaUltimeSpedizioni();
         } 
      }
      else SystemInformation.ApplyOnError('Modello url calendario non conforme','');
    });
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
    var SpedDisp = function()
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
                                       "Quantita"        : SpedizioneDettaglio[i].QUANTITA,
                                       "Stato"           : SpedizioneDettaglio[i].STATO
                                     });
            }
            var $ObjQuery            = { Operazioni : [] }; 
            var TitoliNonDisponibili = [];
            var TitoliDaSpedire      = [];
            var TitoliAlreadyGestiti = [];
            for(let j = 0;j < ListaTitoliSped.length;j ++)
            {
              if(ListaTitoliSped[j].Stato == 'P' && (parseInt(ListaTitoliSped[j].Quantita) <= parseInt(ListaTitoliSped[j].QuantitaMgzn)))
              {
                 var ParamSpedizione = {
                                         "CHIAVE" : ListaTitoliSped[j].ChiaveDettaglio
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
                if(ListaTitoliSped[j].Stato == 'C' || ListaTitoliSped[j].Stato == 'S')
                {
                  var OggettoNd = '';
                  OggettoAg     = '\n' + 'Nr° : ' + ListaTitoliSped[j].Quantita.toString() + ' - ' + ListaTitoliSped[j].TitoloNome.toString();
                  TitoliAlreadyGestiti.push(OggettoAg);
                }
                else
                {
                  var OggettoNd = '';
                  OggettoNd     = '\n' + 'Nr° : ' + ListaTitoliSped[j].Quantita.toString() + ' - ' + ListaTitoliSped[j].TitoloNome.toString();
                  TitoliNonDisponibili.push(OggettoNd);
                } 
              }              
            }
            SystemInformation.PostSQL('Delivery',$ObjQuery,function(Results)
            {                            
              if(TitoliNonDisponibili.length != 0 && TitoliDaSpedire.length == 0 && TitoliAlreadyGestiti.length == 0)               
                ZCustomAlert($mdDialog,'AVVISO','I seguenti titoli non sono disponibili per essere spediti:  ' + TitoliNonDisponibili)
              else if (TitoliNonDisponibili.length == 0 && TitoliDaSpedire.length != 0 && TitoliAlreadyGestiti.length == 0)
                ZCustomAlert($mdDialog,'AVVISO','I seguenti titoli sono stati segnati come DA SPEDIRE : ' + TitoliDaSpedire)
              else if (TitoliNonDisponibili.length != 0 && TitoliDaSpedire.length != 0 && TitoliAlreadyGestiti.length == 0)
                ZCustomAlert($mdDialog,'AVVISO','I seguenti titoli sono stati segnati come DA SPEDIRE : ' + TitoliDaSpedire + ' --- I seguenti titoli non sono disponibili per essere spediti:  ' + TitoliNonDisponibili)
              else if (TitoliNonDisponibili.length != 0 && TitoliDaSpedire.length != 0 && TitoliAlreadyGestiti.length != 0)
                ZCustomAlert($mdDialog,'AVVISO','I seguenti titoli sono stati segnati come DA SPEDIRE : ' + TitoliDaSpedire + ' --- I seguenti titoli non sono disponibili per essere spediti:  ' + TitoliNonDisponibili +  ' --- I seguenti titoli sono già stati gestiti:  ' + TitoliAlreadyGestiti)
              else if (TitoliNonDisponibili.length == 0 && TitoliDaSpedire.length != 0 && TitoliAlreadyGestiti.length != 0)
                ZCustomAlert($mdDialog,'AVVISO','I seguenti titoli sono stati segnati come DA SPEDIRE : ' + TitoliDaSpedire + ' --- I seguenti titoli sono già stati gestiti:  ' + TitoliAlreadyGestiti);
              else (TitoliNonDisponibili.length != 0 && TitoliDaSpedire.length == 0 && TitoliAlreadyGestiti.length != 0)   
                ZCustomAlert($mdDialog,'AVVISO','I seguenti titoli non sono disponibili per essere spediti:  ' + TitoliNonDisponibili + ' --- I seguenti titoli sono già stati gestiti:  ' + TitoliAlreadyGestiti)
              $scope.UltimeVentiSpedizioni = [];
              $scope.RefreshListaUltimeSpedizioni(); 
            })                       
         }
         else SystemInformation.ApplyOnError('Modello dettaglio spedizione non conforme','');
       },'SQLDettaglioSpedizioneGenerico');
    }
    ZConfirm.GetConfirmBox('AVVISO','Passare tutti i titoli della spedizione da PRENOTATI(DISPONIBILI) a DA SPEDIRE?',SpedDisp,function(){});

  }  
  
  $scope.RefreshListaUltimeSpedizioni = function ()
  {  
    if($scope.IsAdministrator())
    {
       SystemInformation.GetSQL('Delivery',{},function(Results)
       {
         UltimeVentiSpedizioniTmp          = SystemInformation.FindResults(Results,'DeliveryListLastTwentyAdm');
         //UltimeVentiSpedizioniDettaglioTmp = SystemInformation.FindResults(Results,'DeliveryListLastTwentyAdmDettaglio');
         if (UltimeVentiSpedizioniTmp != undefined) 
         {
           for(let i = 0; i < UltimeVentiSpedizioniTmp.length; i++)
           {
               UltimeVentiSpedizioniTmp[i] = {
                                               Chiave          : UltimeVentiSpedizioniTmp[i].CHIAVE,
                                               Presso          : UltimeVentiSpedizioniTmp[i].PRESSO,
                                               Docente         : UltimeVentiSpedizioniTmp[i].DOCENTE == null ? -1 : UltimeVentiSpedizioniTmp[i].DOCENTE,
                                               DocenteNome     : UltimeVentiSpedizioniTmp[i].NOME_DOCENTE == null ? 'N.D.' : UltimeVentiSpedizioniTmp[i].NOME_DOCENTE,
                                               Data            : ZFormatDateTime('dd/mm/yyyy',ZDateFromHTMLInput(UltimeVentiSpedizioniTmp[i].DATA)),
                                               NrConsegnate    : UltimeVentiSpedizioniTmp[i].NR_CONSEGNATE,
                                               NrDaSpedire     : UltimeVentiSpedizioniTmp[i].NR_DA_SPEDIRE,
                                               NrPrenotate     : UltimeVentiSpedizioniTmp[i].NR_PRENOTATE,
                                               Spedibile       : false,
                                               DettagliTitoli  : []                                               
                                             }
               SystemInformation.GetSQL('Delivery',{CHIAVE : UltimeVentiSpedizioniTmp[i].Chiave},function(Results)
               {
                 UltimeVentiSpedizioniDettaglioTmp = SystemInformation.FindResults(Results,'GenericDeliveryDettaglio');
                 if(UltimeVentiSpedizioniDettaglioTmp != undefined)
                 {
                    for(let j = 0;j < UltimeVentiSpedizioniDettaglioTmp.length;j ++)
                    {                     
                        if (UltimeVentiSpedizioniDettaglioTmp[j].SPEDIBILE == 1)
                        {                                                                   
                            UltimeVentiSpedizioniTmp[i].Spedibile = true;
                        }
                        switch(UltimeVentiSpedizioniDettaglioTmp[j].STATO)
                        {
                               case 'P' : UltimeVentiSpedizioniDettaglioTmp[j].STATO = 'PRENOTATO'
                                          break;
                               case 'S' : UltimeVentiSpedizioniDettaglioTmp[j].STATO = 'DA SPEDIRE'
                                          break;
                               case 'C' : UltimeVentiSpedizioniDettaglioTmp[j].STATO = 'CONSEGNATO'
                                          break;
                               default  : UltimeVentiSpedizioniDettaglioTmp[j].STATO = 'N.D';                                       
                                          
                        }
                        UltimeVentiSpedizioniDettaglioTmp[j] = {
                                                                 Chiave       : UltimeVentiSpedizioniDettaglioTmp[j].CHIAVE,
                                                                 Titolo       : UltimeVentiSpedizioniDettaglioTmp[j].TITOLO,
                                                                 NomeTitolo   : UltimeVentiSpedizioniDettaglioTmp[j].NOME_TITOLO == undefined ? 'N.D' : UltimeVentiSpedizioniDettaglioTmp[j].NOME_TITOLO,
                                                                 CodiceTitolo : UltimeVentiSpedizioniDettaglioTmp[j].CODICE_TITOLO == undefined ? 'N.D' : UltimeVentiSpedizioniDettaglioTmp[j].CODICE_TITOLO,
                                                                 StatoTitolo  : UltimeVentiSpedizioniDettaglioTmp[j].STATO                         
                                                               }

                        UltimeVentiSpedizioniTmp[i].DettagliTitoli.push(UltimeVentiSpedizioniDettaglioTmp[j]);                                                               
                    }                    
                 }
                 else SystemInformation.ApplyOnError('Modello dettaglio spedizioni non conforme','');     
               },'SQLDettaglio')      
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
           {
               UltimeVentiSpedizioniTmp[i] = {
                                               Chiave          : UltimeVentiSpedizioniTmp[i].CHIAVE,
                                               Presso          : UltimeVentiSpedizioniTmp[i].PRESSO,
                                               Docente         : UltimeVentiSpedizioniTmp[i].DOCENTE == null ? -1 : UltimeVentiSpedizioniTmp[i].DOCENTE,
                                               DocenteNome     : UltimeVentiSpedizioniTmp[i].NOME_DOCENTE == null ? 'N.D.' : UltimeVentiSpedizioniTmp[i].NOME_DOCENTE,
                                               Data            : ZFormatDateTime('dd/mm/yyyy',ZDateFromHTMLInput(UltimeVentiSpedizioniTmp[i].DATA)),
                                               NrConsegnate    : UltimeVentiSpedizioniTmp[i].NR_CONSEGNATE,
                                               NrDaSpedire     : UltimeVentiSpedizioniTmp[i].NR_DA_SPEDIRE,
                                               NrPrenotate     : UltimeVentiSpedizioniTmp[i].NR_PRENOTATE,
                                               Spedibile       : false,
                                               DettagliTitoli  : []                                               
                                             }
               SystemInformation.GetSQL('Delivery',{CHIAVE : UltimeVentiSpedizioniTmp[i].Chiave},function(Results)
               {
                 UltimeVentiSpedizioniDettaglioTmp = SystemInformation.FindResults(Results,'GenericDeliveryDettaglio');
                 if(UltimeVentiSpedizioniDettaglioTmp != undefined)
                 {
                    for(let j = 0;j < UltimeVentiSpedizioniDettaglioTmp.length;j ++)
                    {                     
                        if (UltimeVentiSpedizioniDettaglioTmp[j].SPEDIBILE == 1)
                        {                                                                   
                            UltimeVentiSpedizioniTmp[i].Spedibile = true;
                        }
                        switch(UltimeVentiSpedizioniDettaglioTmp[j].STATO)
                        {
                               case 'P' : UltimeVentiSpedizioniDettaglioTmp[j].STATO = 'PRENOTATO'
                                          break;
                               case 'S' : UltimeVentiSpedizioniDettaglioTmp[j].STATO = 'DA SPEDIRE'
                                          break;
                               case 'C' : UltimeVentiSpedizioniDettaglioTmp[j].STATO = 'CONSEGNATO'
                                          break;
                               default  : UltimeVentiSpedizioniDettaglioTmp[j].STATO = 'N.D';                                       
                                          
                        }
                        UltimeVentiSpedizioniDettaglioTmp[j] = {
                                                                 Chiave       : UltimeVentiSpedizioniDettaglioTmp[j].CHIAVE,
                                                                 Titolo       : UltimeVentiSpedizioniDettaglioTmp[j].TITOLO,
                                                                 NomeTitolo   : UltimeVentiSpedizioniDettaglioTmp[j].NOME_TITOLO == undefined ? 'N.D' : UltimeVentiSpedizioniDettaglioTmp[j].NOME_TITOLO,
                                                                 CodiceTitolo : UltimeVentiSpedizioniDettaglioTmp[j].CODICE_TITOLO == undefined ? 'N.D' : UltimeVentiSpedizioniDettaglioTmp[j].CODICE_TITOLO,
                                                                 StatoTitolo  : UltimeVentiSpedizioniDettaglioTmp[j].STATO                         
                                                               }

                        UltimeVentiSpedizioniTmp[i].DettagliTitoli.push(UltimeVentiSpedizioniDettaglioTmp[j]);                                                               
                    }                    
                 }
                 else SystemInformation.ApplyOnError('Modello dettaglio spedizioni non conforme','');     
               },'SQLDettaglio')  
           }
           $scope.UltimeVentiSpedizioni = UltimeVentiSpedizioniTmp;
         }
         else SystemInformation.ApplyOnError('Modello spedizioni non conforme','');     
       },'SQLUltime20Promotore')          
    }
  }
  
  $scope.GetTitoliSpedizione = function(Spedizione)
  {
     var Result = '';
     for(let i = 0;i < Spedizione.DettagliTitoli.length;i ++)
     {
         Result += Spedizione.DettagliTitoli[i].CodiceTitolo + ' - ' + Spedizione.DettagliTitoli[i].NomeTitolo + ' - ' + Spedizione.DettagliTitoli[i].StatoTitolo + '</br>';
     }
     
     return($sce.trustAsHtml(Result.substr(0,Result.length)));
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
    var EliminaSped = function()
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
    ZConfirm.GetConfirmBox('AVVISO','Eliminare la spedizione del ' + Spedizione.Data + ' presso ' + Spedizione.Presso + ' ?',EliminaSped,function(){});
  }  
  
  $scope.RefreshListaUltimeSpedizioni(); 
  $scope.RefreshListaComunicazioni();
  $scope.GetUrlCalendario();

}]);


