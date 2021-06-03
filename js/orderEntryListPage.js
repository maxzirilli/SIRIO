SIRIOApp.controller("orderEntryPageController",['$scope','SystemInformation','$state','$rootScope','$filter','$mdDialog','ZConfirm',function($scope,SystemInformation,$state,$rootScope,$filter,$mdDialog,ZConfirm)
{

  $scope.EditingOn             = false;
  $scope.ViewInfoCsv           = false;
  $scope.TitoloFiltro          = -1;
  $scope.OrdineInEditing       = {};
  $scope.ListaOrdini           = [];  
  $scope.ListaTitoli           = [];
  $scope.Data                  = {};
  $scope.Data.DataRicercaAl    = new Date();
  let TmpDate                  = new Date($scope.Data.DataRicercaAl);
  TmpDate.setDate(TmpDate.getDate() - 30);
  //$scope.DataRicercaDal   = new Date(TmpDate);
  var AnnoCorrente = new Date().getFullYear();
  $scope.Data.DataRicercaDal   = new Date(AnnoCorrente, 0, 1)  
  
  ScopeHeaderController.CheckButtons();

  $scope.ShowInfoCsv = function()
  {
    $scope.ViewInfoCsv = !$scope.ViewInfoCsv;
  }

  SystemInformation.GetSQL('Book', {}, function(Results)  
  {  
    TitoliInfoLista = SystemInformation.FindResults(Results,'BookListFilter');
    if(TitoliInfoLista != undefined)
    { 
       for(let i = 0; i < TitoliInfoLista.length; i++)
           TitoliInfoLista[i] = { 
                                  Chiave       : TitoliInfoLista[i].CHIAVE,
                                  Nome         : TitoliInfoLista[i].TITOLO,
                                  Quantita     : parseInt(TitoliInfoLista[i].QUANTITA_MGZN),
                                  Codice       : TitoliInfoLista[i].CODICE_ISBN,
                                  Posizione    : TitoliInfoLista[i].POS_MAGAZZINO == null ? '' : TitoliInfoLista[i].POS_MAGAZZINO,
                                  DaAggiungere : false
                                }
       $scope.ListaTitoli  = TitoliInfoLista;
       $scope.ListaTitoliF = TitoliInfoLista;
    }
    else SystemInformation.ApplyOnError('Modello titoli non conforme','');   
  },'SelectSQLFilter');

  SystemInformation.GetSQL('Book', {}, function(Results)  
  {  
    TitoliInfoListaNF = SystemInformation.FindResults(Results,'BookListNoFilter');
    if(TitoliInfoListaNF != undefined)
    { 
       for(let i = 0; i < TitoliInfoListaNF.length; i++)
           TitoliInfoListaNF[i] = { 
                                    Chiave    : TitoliInfoListaNF[i].CHIAVE,
                                    Nome      : TitoliInfoListaNF[i].TITOLO,
                                    Codice    : TitoliInfoListaNF[i].CODICE_ISBN,
                                    Editore   : TitoliInfoListaNF[i].EDITORE
                                  }
       $scope.ListaTitoliNoFilter = TitoliInfoListaNF
    }
    else SystemInformation.ApplyOnError('Modello titoli non filtrati non conforme','');   
  },'SelectSQLNoFilter');
    
  var TroncaTitolo = function(str, n)
  {
    return (str.length > n) ? str.substr(0, n-1) + '(...)' : str;
  };   
  
  function Base64DecodeUnicode(str) 
  {
    percentEncodedStr = atob(str).split('').map(function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''); 
    return decodeURIComponent(percentEncodedStr);
  } 

  $scope.ConvertiData = function (Dati)
  {
     return( ZFormatDateTime('dd/mm/yyyy',ZDateFromHTMLInput(Dati.Data)));
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
    
  $scope.CVSLoaded = function(fileInfo)
  { 
    var ListaCodiciEsclusi = [];
    var ListaTitoliEsclusi = [];
    var ListaTitoliErrati  = [];
    var file = fileInfo.files[0];
    if(file) 
    {
      var reader = new FileReader();
      reader.onloadend = function(evt)
      {
        var Csv            = reader.result.split(",");         
        var CsvSplitted    = (Base64DecodeUnicode(Csv[1])).split("\n");
        var $ObjQuery      = { Operazioni : [] };
        var ListaCarico    = [];        
        var i = 0;
        
        var CreaOrdine = function()
        {
          while (i < CsvSplitted.length - 1)          
          {
            let RecordOrdine  = CsvSplitted[i++].split(";");
            RecordOrdine[0]   = RecordOrdine[0].trim();
            RecordOrdine[1]   = RecordOrdine[1].trim();
            //RecordOrdine[2]   = RecordOrdine[2].trim(); //AGGIUNTA PRIMO CSV PER UBICAZIONI (PRIMA NON PRESENTE)          
            let TitoloCorrisp = $scope.ListaTitoli.find(function(ATitolo) {return(ATitolo.Codice == RecordOrdine[0]);});
            if (TitoloCorrisp == undefined)
            {
              //ZCustomAlert($mdDialog,'ATTENZIONE',"IMPOSSIBILE ESEGUIRE IL CARICO,IL TITOLO CON CODICE ISBN >> " + RecordOrdine[0] + " << NON E' DI UN EDITORE GESTITO");
              //return
              //
              ListaCodiciEsclusi.push({
                                        Codice     : RecordOrdine[0],
                                        Quantita   : RecordOrdine[1]//,
                                        //Ubicazione : RecordOrdine[2]
                                      })
            }
            else            
            { 
              $ObjQuery.Operazioni.push({ 
                                          Query     : 'InsertOrderEntryTest',
                                          Parametri : { 
                                                        //CHIAVE    : -1,
                                                        DataCarico       : new Date(),                                        
                                                        TitoloCarico     : TitoloCorrisp.Chiave,
                                                        QuantitaCarico   : RecordOrdine[1],
                                                        UbicazioneCarico : TitoloCorrisp.Posizione
                                                        //UBICAZIONE : RecordOrdine[2]  //AGGIUNTA PRIMO CSV PER UBICAZIONI (PRIMA NON PRESENTE)                                                                                                         
                                                      },
                                          //ResetKeys :[1]
                                        });
              
              ListaCarico.push({                                
                                 Quantita   : RecordOrdine[1],
                                 Codice     : RecordOrdine[0],
                                 Nome       : TitoloCorrisp.Nome,
                                 Posizione  : TitoloCorrisp.Posizione == null ? 'N.D.' : TitoloCorrisp.Posizione
                                 //Posizione  :  RecordOrdine[2] //AGGIUNTA PRIMO CSV PER UBICAZIONI (PRIMA NON PRESENTE)                               
                               })                                        
            }                                              
            /*if($ObjQuery.Operazioni.length == 10)
            {
              SystemInformation.PostSQL('OrderEntry',$ObjQuery,CreaOrdine,false,true);  
              $ObjQuery.Operazioni = [];
              return;
            }*/
          }
          if($ObjQuery.Operazioni.length != 0)
             SystemInformation.PostSQL('OrderEntry',$ObjQuery,function() 
             { 
                if(ListaCodiciEsclusi.length == 0) 
                   ZCustomAlert($mdDialog,'OK','CARICO ESEGUITO!')
                else ZCustomAlert($mdDialog,'AVVISO','CARICO ESEGUITO, MA ALCUNI TITOLI NON SONO STATI CARICATI CORRETTAMENTE, CONTROLLARE REPORT')
                                       
                var Data           = new Date();
                var DataAnno       = Data.getFullYear();
                var DataMese       = Data.getMonth()+1; 
                var DataGiorno     = Data.getDate();
                var DataCarico     = DataGiorno.toString() + '/' + DataMese.toString() +  '/' + DataAnno.toString();
                
                var doc = new jsPDF();
                doc.setProperties({title: 'CARICO MAGAZZINO ' + DataCarico});
                doc.setFontSize(10); 
                doc.setFontType('bold');
                doc.text(10,20,'CARICO - IN DATA ' + DataCarico);
                
                var CoordY = 30;
                doc.setFontSize(7);
                doc.text(10,CoordY,'QNT');
                doc.text(25,CoordY,'ISBN');
                doc.text(45,CoordY,'TITOLO');
                //doc.text(180,CoordY,'UBICAZIONE');
                doc.setFontType('normal');
                CoordY += 5;             
                
                for(let i = 0;i < ListaCarico.length;i ++)
                {
                    if (CoordY >= 280) 
                      {
                        doc.addPage();
                        CoordY = 20;
                        var CoordY = 30;
                        doc.setFontSize(7);
                        doc.text(10,CoordY,'QNT');
                        doc.text(25,CoordY,'ISBN');
                        doc.text(45,CoordY,'TITOLO');
                        doc.text(180,CoordY,'UBICAZIONE');
                        doc.setFontType('normal');
                        CoordY += 5;
                      }
                        doc.setFontType('normal');
                        var Q  = doc.getTextWidth('QNT');
                        var Qt = doc.getTextWidth(ListaCarico[i].Quantita);
                        doc.text(10 + Q + 1 - Qt,CoordY,ListaCarico[i].Quantita);
                        doc.text(25,CoordY,ListaCarico[i].Codice);
                        doc.text(45,CoordY,TroncaTitolo(ListaCarico[i].Nome,75));
                        doc.text(180,CoordY,ListaCarico[i].Posizione);
                        CoordY += 5;
                        doc.setFontSize(6);
                        doc.setFontType('normal');
                        doc.text(10,290,SystemInformation.VDocCarico);
                        doc.setFontSize(7);
                }

                if(ListaCodiciEsclusi.length != 0)
                {
                   for(let i = 0;i < ListaCodiciEsclusi.length;i ++)
                   {
                       TitoloTrovato = $scope.ListaTitoliNoFilter.find(function(ATitolo){return(ATitolo.Codice == ListaCodiciEsclusi[i].Codice);});
                       if(TitoloTrovato != undefined)
                       {
                          ListaTitoliEsclusi.push({
                                                    Codice     : TitoloTrovato.Codice,
                                                    Quantita   : ListaCodiciEsclusi[i].Quantita,
                                                    //Ubicazione : ListaCodiciEsclusi[i].Ubicazione == undefined ? '' : ListaCodiciEsclusi[i].Ubicazione,
                                                    Nome       : TitoloTrovato.Nome,
                                                    Editore    : TitoloTrovato.Editore                                                 
                                                  })
                       }
                       else ListaTitoliErrati.push({
                                                     Codice     : ListaCodiciEsclusi[i].Codice,
                                                     Quantita   : ListaCodiciEsclusi[i].Quantita,
                                                     //Ubicazione : ListaCodiciEsclusi[i].Ubicazione,                                               
                                                   })                        
                   }

                   if(ListaTitoliEsclusi.length != 0)
                   {
                      doc.addPage();
                      doc.setFontSize(10); 
                      doc.setFontType('bold');
                      doc.text(10,20,'TITOLI ESCLUSI DAL CARICO');                   
                      doc.text(10,30,'PRESENTI IN ANAGRAFICA - EDITORE NON GESTITO');
                      CoordY = 35;
                      doc.setFontSize(7);
                      doc.text(10,CoordY,'QNT');
                      doc.text(25,CoordY,'ISBN');
                      doc.text(45,CoordY,'TITOLO');
                      doc.text(120,CoordY,'EDITORE');
                      //doc.text(180,CoordY,'UBICAZIONE');
                      doc.setFontType('normal');
                      CoordY += 5;
                        
                      for(let i = 0;i < ListaTitoliEsclusi.length;i ++)
                      {
                        if (CoordY >= 280) 
                          {
                            doc.addPage();
                            var CoordY = 20;
                            doc.setFontSize(7);
                            doc.text(10,CoordY,'QNT');
                            doc.text(25,CoordY,'ISBN');
                            doc.text(45,CoordY,'TITOLO');
                            doc.text(120,CoordY,'EDITORE');
                            //doc.text(180,CoordY,'UBICAZIONE');
                            doc.setFontType('normal');
                            CoordY += 5;
                          }
                          doc.setFontType('normal');
                          Q  = doc.getTextWidth('QNT');
                          Qt = doc.getTextWidth(ListaTitoliEsclusi[i].Quantita);
                          doc.text(10 + Q + 1 - Qt,CoordY,ListaTitoliEsclusi[i].Quantita);
                          doc.text(25,CoordY,ListaTitoliEsclusi[i].Codice);
                          doc.text(45,CoordY,TroncaTitolo(ListaTitoliEsclusi[i].Nome,35));
                          doc.text(120,CoordY,ListaTitoliEsclusi[i].Editore);
                          //doc.text(180,CoordY,ListaTitoliEsclusi[i].Ubicazione);
                          CoordY += 5;
                          doc.setFontSize(6);
                          doc.setFontType('normal');
                          doc.text(10,290,SystemInformation.VDocCarico);
                          doc.setFontSize(7);
                      }
                   }

                   if(ListaTitoliErrati.length != 0)
                   {
                      if(CoordY >= 250)
                      {
                        doc.addPage();
                        doc.setFontSize(10); 
                        doc.setFontType('bold');
                        doc.text(10,25,'NON PRESENTI IN ANAGRAFICA O CODICE ERRATO');
                        CoordY = 30;
                        doc.setFontSize(7);
                        doc.text(10,CoordY,'QNT');
                        doc.text(25,CoordY,'ISBN');
                        //doc.text(60,CoordY,'UBICAZIONE');
                        doc.setFontType('normal');
                        CoordY += 5
                      }
                      else
                      {
                        doc.setFontSize(10); 
                        doc.setFontType('bold');
                        doc.text(10,CoordY + 10,'NON PRESENTI IN ANAGRAFICA / CODICE ERRATO');
                        doc.setFontSize(7);
                        doc.text(10,CoordY + 15,'QNT');
                        doc.text(25,CoordY + 15,'ISBN');
                        //doc.text(60,CoordY + 15,'UBICAZIONE');
                        doc.setFontType('normal');
                        CoordY += 20
                      }
    
                      for(let i = 0;i < ListaTitoliErrati.length;i ++)
                      {
                          if (CoordY >= 280) 
                          {
                            doc.addPage();
                            CoordY = 20;
                            doc.setFontSize(7);
                            doc.text(10,CoordY,'QNT');
                            doc.text(25,CoordY,'ISBN');
                            //doc.text(60,CoordY,'UBICAZIONE');
                            doc.setFontType('normal');
                            CoordY += 5;
                          }
                          doc.setFontType('normal');
                          Q  = doc.getTextWidth('QNT');
                          Qt = doc.getTextWidth(ListaTitoliErrati[i].Quantita);
                          doc.text(10 + Q + 1 - Qt,CoordY,ListaTitoliErrati[i].Quantita);
                          doc.text(25,CoordY,ListaTitoliErrati[i].Codice);
                          //doc.text(60,CoordY,ListaTitoliErrati[i].Ubicazione);
                          CoordY += 5;
                          doc.setFontSize(6);
                          doc.setFontType('normal');
                          doc.text(10,290,SystemInformation.VDocCarico);
                          doc.setFontSize(7);
                      }                      
                   }             
                }
                doc.save("CaricoPDF" + DataCarico + ".pdf",{});
                $scope.RefreshListaOrdini()
             },false,true)                                                                 
        }
        CreaOrdine();        
      }
    }          
    reader.readAsDataURL(file);          
  }  
  
  $scope.NuovoOrdineCsv = function()
  { 
    document.getElementById('fileLoadCVSDocument').click();    
  }
  
  $scope.RefreshListaOrdini = function()
  {
    $scope.GridOptions.query.page = 1;
    if($scope.Data.DataRicercaDal == undefined || $scope.Data.DataRicercaAl == undefined)
       return;
    let TmpDate = new Date($scope.Data.DataRicercaAl);
    TmpDate.setDate($scope.Data.DataRicercaAl.getDate() + 1);
    
    SystemInformation.GetSQL('OrderEntry', { Dal : ZHTMLInputFromDate($scope.Data.DataRicercaDal), Al : ZHTMLInputFromDate(TmpDate)}, function(Results)  
    {
      OrdiniInfoLista = SystemInformation.FindResults(Results,'OrderEntryInfoList');
      if(OrdiniInfoLista != undefined)
      { 
         for(let i = 0; i < OrdiniInfoLista.length; i ++)
             OrdiniInfoLista[i] = {
                                    Chiave      : OrdiniInfoLista[i].CHIAVE,
                                    Data        : OrdiniInfoLista[i].DATA,   
                                    Titolo      : OrdiniInfoLista[i].TITOLO, 
                                    Nome_Titolo : OrdiniInfoLista[i].NOME_TITOLO,                                   
                                    Quantita    : OrdiniInfoLista[i].QUANTITA,
                                    Ubicazione  : OrdiniInfoLista[i].UBICAZIONE == null ? OrdiniInfoLista[i].OLD_UBICAZIONE : OrdiniInfoLista[i].UBICAZIONE,
                                    Codice      : OrdiniInfoLista[i].CODICE                                    
                                  }         
         $scope.ListaOrdini = OrdiniInfoLista;
         $scope.ConvertiData($scope.ListaOrdini);
      }
      else SystemInformation.ApplyOnError('Modello ordini non conforme','');   
    });
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
       $scope.OrdineInEditing.Titolo = itemTit.Chiave;
       $scope.OrdineInEditing.Ubicazione = itemTit.Posizione;     
  }
  
  $scope.queryTitoloMain = function(searchTextTitMain)
  {
     searchTextTitMain = searchTextTitMain.toUpperCase();
     return($scope.ListaTitoliF.grep(function(Elemento) 
     { 
       return(Elemento.Nome.toUpperCase().indexOf(searchTextTitMain) != -1 || Elemento.Codice.indexOf(searchTextTitMain) != -1);
     }));
  }
  
  $scope.selectedItemChangeTitoloMain = function(itemTitMain)
  {
    if(itemTitMain != undefined)
      $scope.TitoloFiltro = itemTitMain.Chiave;
    else $scope.TitoloFiltro = -1;
    $scope.RefreshListaOrdini();
    $scope.GridOptions.query.page = 1;
  }
  
  $scope.NuovoOrdineMultiplo = function(ev)
  {
    $mdDialog.show({ 
                     controller          : DialogControllerOrdineMultiplo,
                     templateUrl         : "template/multipleOrderListPopup.html",
                     targetEvent         : ev,
                     scope               : $scope,
                     preserveScope       : true,
                     clickOutsideToClose : true
                   })
    .then(function(answer) 
    {}, 
    function() 
    {});
  }

  function DialogControllerOrdineMultiplo()
  {
    $scope.NomeFiltro        = '';
    $scope.CodiceFiltro      = '';
    $scope.ListaTitoliToAdd  = [];
    
    $scope.hide = function() 
    {
      $mdDialog.hide();
    };

    $scope.AnnullaPopupRicercaMultipla = function() 
    {
      for(let i = 0;i < $scope.ListaTitoli.length;i ++)
          $scope.ListaTitoli[i].DaAggiungere = false;
      $scope.NomeFiltro        = '';
      $scope.CodiceFiltro      = '';              
      $scope.ListaTitoliToAdd  = [];
      $mdDialog.cancel();
    };

    $scope.ConfermaPopupRicercaMultipla = function()
    {  
      for(let i = 0;i < $scope.ListaTitoli.length;i ++)
      {
        if($scope.ListaTitoli[i].DaAggiungere)
        {
           $scope.ListaTitoliToAdd.push($scope.ListaTitoli[i]); 
           $scope.ListaTitoli[i].DaAggiungere = false;
        }
      }                   
      $scope.NomeFiltro   = '';
      $scope.CodiceFiltro = '';        
      $mdDialog.hide();
      $scope.GestisciOrdineMultiplo($scope.ListaTitoliToAdd)          
    };
  }

  $scope.GestisciOrdineMultiplo = function(ListaTitoli) 
  {
    $mdDialog.show({ 
                      controller          : DialogControllerGestioneCaricoMultiplo,
                      templateUrl         : "template/handleMultipleOrderPopup.html",
                      targetEvent         : ListaTitoli,
                      scope               : $scope,
                      preserveScope       : true,
                      clickOutsideToClose : true,
                      locals              :{ListaTitoli}
                    })
    .then(function(answer) 
    {}, 
    function() 
    {});
  }

  function DialogControllerGestioneCaricoMultiplo($scope,$mdDialog,ListaTitoli)
  {
    $scope.ListaTitoliToHandle = ListaTitoli;
    $scope.dataOrdineMultiplo = new Date();

    for(let i = 0;i < $scope.ListaTitoliToHandle.length;i ++)
    {
      $scope.ListaTitoliToHandle[i] = {
                                        "TITOLO"            : $scope.ListaTitoliToHandle[i].Chiave,
                                        "UBICAZIONE"        : $scope.ListaTitoliToHandle[i].Posizione,
                                        "NOME_TITOLO"       : $scope.ListaTitoliToHandle[i].Nome,
                                        "QUANTITA"          : 1,
                                        "ISBN_TITOLO"       : $scope.ListaTitoliToHandle[i].Codice                               
                                      }
    }

    $scope.hide = function() 
    {
      $mdDialog.hide();
    };

    $scope.AnnullaMultiploCaricoPopup = function() 
    {
      $scope.ListaTitoliToHandle = [];
      $scope.dataOrdineMultiplo  = null;
      $mdDialog.cancel();
    };

    $scope.ConfermaMultiploCaricoPopup = function()
    {
      $ObjQuery = {Operazioni : []};
      for(let j = 0; j < $scope.ListaTitoliToHandle.length;j ++)
      {
          var ParamCarico = {
                              DataCarico       : $scope.dataOrdineMultiplo,
                              TitoloCarico     : $scope.ListaTitoliToHandle[j].TITOLO,  
                              QuantitaCarico   : $scope.ListaTitoliToHandle[j].QUANTITA,
                              UbicazioneCarico : $scope.ListaTitoliToHandle[j].UBICAZIONE
                            }

            $ObjQuery.Operazioni.push({
                                        Query     : 'InsertOrderEntryTest',
                                        Parametri : ParamCarico,
                                      });           
      }
      SystemInformation.PostSQL('OrderEntry',$ObjQuery,function(Answer)
      {
        $scope.ListaTitoliToHandle = [];
        $scope.dataOrdineMultiplo  = null;
        $mdDialog.hide();
        $scope.RefreshListaOrdini();
      }); 
    }
  }

  $scope.ModificaOrdine = function(Ordine)
  { 
    $scope.EditingOn                   = true; 
    $scope.OrdineInEditing.Chiave      = Ordine.Chiave;
    $scope.OrdineInEditing.Data        = new Date(Ordine.Data);     
    $scope.OrdineInEditing.Titolo      = Ordine.Titolo;
    $scope.OrdineInEditing.Ubicazione  = Ordine.Ubicazione;
    $scope.OrdineInEditing.Nome_Titolo = Ordine.Nome_Titolo;
    $scope.OrdineInEditing.Quantita    = parseInt(Ordine.Quantita);    
    $scope.TitoloVisualizzato          = $scope.ListaTitoli.find(function(Ordine) {return(Ordine.Chiave == $scope.OrdineInEditing.Titolo);});
  }
  
  $scope.NuovoOrdine = function()
  { 
    $scope.EditingOn = true; 
    $scope.OrdineInEditing = {
                               Chiave     : -1,
                               Data       : new Date(),
                               Titolo     : -1,
                               Quantita   : 0,
                               Ubicazione : ''                       
                             };
    $scope.TitoloVisualizzato = undefined;
  }
  
  $scope.OnAnnullaOrdineClicked = function()
  {
    $scope.EditingOn = false;
    $scope.RefreshListaOrdini();
  }
  
  $scope.ConfermaOrdine = function()
  {  
     if ($scope.OrdineInEditing.Titolo == -1 && $scope.OrdineInEditing.Quantita == -1)
         ZCustomAlert($mdDialog,'ATTENZIONE','DATI MANCANTI');      
     var $ObjQuery   = { Operazioni : [] };          
     var ParamOrdine = {
                         //CHIAVE     : $scope.OrdineInEditing.Chiave,
                         DataCarico       : $scope.OrdineInEditing.Data,
                         TitoloCarico     : $scope.OrdineInEditing.Titolo,
                         QuantitaCarico   : $scope.OrdineInEditing.Quantita,
                         UbicazioneCarico : $scope.OrdineInEditing.Ubicazione 
                       }
                     
     var NuovoOrdine = ($scope.OrdineInEditing.Chiave == -1);
     if(NuovoOrdine)     
     {           
       $ObjQuery.Operazioni.push({
                                   Query     : 'InsertOrderEntryTest',
                                   Parametri : ParamOrdine
                                 }); 
     }
     else
     {
       ParamOrdine.ChiaveCarico =  $scope.OrdineInEditing.Chiave;
       $ObjQuery.Operazioni.push({
                                   Query     : 'UpdateOrderEntryTest',
                                   Parametri : ParamOrdine
                                 });
     };
  
     SystemInformation.PostSQL('OrderEntry',$ObjQuery,function(Answer)
     {
       $scope.EditingOn       = false;
       $scope.OrdineInEditing = {};
       $scope.RefreshListaOrdini();
     });  
  }
  
  $scope.EliminaOrdine = function(Ordine)
  {
    var EliminaOrd = function()
    {
      var $ObjQuery   = { Operazioni : [] };
      var ParamOrdine = { 
                          ChiaveCarico   : Ordine.Chiave,
                          TitoloCarico   : Ordine.Titolo,
                          QuantitaCarico : Ordine.Quantita
                        };
       
      $ObjQuery.Operazioni.push({
                                  Query     : 'DeleteOrderEntryTest',
                                  Parametri : ParamOrdine
                                });
    
      SystemInformation.PostSQL('OrderEntry',$ObjQuery,function(Answer)
      {
        $scope.RefreshListaOrdini();
      });  
    }
    ZConfirm.GetConfirmBox('AVVISO',"Eliminare l\'ordine di " + Ordine.Quantita + " " + Ordine.Nome_Titolo + " ?",EliminaOrd,function(){});
  }  
  
  $scope.RefreshListaOrdini();

}]);

SIRIOApp.filter('OrdineByFiltro',function()
{
  return function(ListaOrdini,TitoloFiltro)
         {
           if(TitoloFiltro == -1) 
              return(ListaOrdini);
           var ListaFiltrata = [];
           TitoloFiltro = TitoloFiltro.toUpperCase();
          
           var OrdineOk = function(Ordine)
           {  
              var Result = true;
                  
              if(TitoloFiltro != -1)
                 if(Ordine.Titolo != TitoloFiltro)
                    Result = false;
              return(Result);
           }
          
           ListaOrdini.forEach(function(Ordine)
           { 
             if(OrdineOk(Ordine)) 
                ListaFiltrata.push(Ordine)                       
           });

           return(ListaFiltrata); 
         }
});

SIRIOApp.filter('MultiploCaricoPopupByFiltro',function()
{
  return function(ListaTitoliPopup,NomeFiltro,CodiceFiltro)
         {
           if(NomeFiltro == '' && CodiceFiltro == '') 
             return(ListaTitoliPopup);
           var ListaFiltrata = [];
           NomeFiltro = NomeFiltro.toUpperCase();
           CodiceFiltro = CodiceFiltro.toUpperCase();
           
           var TitoloOk = function(Titolo)
           {  
              var Result = true;
              
              if(NomeFiltro != '')              
                if(Titolo.Nome.toUpperCase().indexOf(NomeFiltro) < 0)
                   Result = false;
              
              if(CodiceFiltro != '')
                 if(Titolo.Codice.toUpperCase().indexOf(CodiceFiltro) < 0)
                   Result = false; 
              
              return(Result);
           }
           
           ListaTitoliPopup.forEach(function(Titolo)
           { 
             if(TitoloOk(Titolo)) 
                ListaFiltrata.push(Titolo)                       
           });
           
           return(ListaFiltrata);
           
         }
});