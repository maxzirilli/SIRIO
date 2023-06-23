SIRIOApp.controller("inventoryManagementController",['$scope','SystemInformation','$state','$mdDialog','ZConfirm',function($scope,SystemInformation,$state,$mdDialog,ZConfirm)
{
 
  $scope.ListaTitoliAll      = [];
  $scope.ListaCodiciToHandle = [];
  $scope.CodiceBippato       = '';

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
   
  $scope.IsAdministrator = SystemInformation.IsAdministrator;

  $scope.InventarioMagazzinoXls = function()
  { 
    SystemInformation.GetSQL('Accessories',{},function(Results)
    {
      var ListaTitoli    = [];
      var ListaTitoliTmp = [];
      var ListaTitoliTmp = SystemInformation.FindResults(Results,'BookListInventory');
      if (ListaTitoliTmp != undefined)
      {
          if(ListaTitoliTmp.length == 0)
          {
            ZCustomAlert($mdDialog,'AVVISO','IL MAGAZZINO E IL MAGAZZINO VOLANTE NON CONTENGONO TITOLI!')
            return
          }
          else
          {
            for(let i = 0; i < ListaTitoliTmp.length; i++)
            ListaTitoliTmp[i] = {
                                  CODICE     : ListaTitoliTmp[i].CODICE_ISBN == undefined ? 'N.D.' : ListaTitoliTmp[i].CODICE_ISBN,
                                  TITOLO     : ListaTitoliTmp[i].TITOLO == undefined ? 'N.D.' : ListaTitoliTmp[i].TITOLO,
                                  POS_MGZN   : ListaTitoliTmp[i].POS_MAGAZZINO == undefined ? 'N.D.' : ListaTitoliTmp[i].POS_MAGAZZINO,
                                  Q_MGZN     : ListaTitoliTmp[i].QUANTITA_MGZN  == undefined ? 'N.D.' : ListaTitoliTmp[i].QUANTITA_MGZN,
                                  Q_MGZN_VOL : ListaTitoliTmp[i].QUANTITA_MGZN_VOL  == undefined ? 'N.D.' : ListaTitoliTmp[i].QUANTITA_MGZN_VOL                         
                                }
            ListaTitoli  = ListaTitoliTmp;

            var Data           = new Date();
            var DataAnno       = Data.getFullYear();
            var DataMese       = Data.getMonth()+1; 
            var DataGiorno     = Data.getDate();
            var DataInventario = DataGiorno.toString() + '/' + DataMese.toString() +  '/' + DataAnno.toString();

            var WBook = {
                          SheetNames : [],
                          Sheets     : {}
                        };
                          
            var SheetName   = 'INVENTARIO MAGAZZINO - ' + DataInventario;
            var BodySheet   = {};               
            BodySheet       = {};
            BodySheet['A1'] = SystemInformation.GetCellaIntestazione('ISBN');
            BodySheet['B1'] = SystemInformation.GetCellaIntestazione('TITOLO');
            BodySheet['C1'] = SystemInformation.GetCellaIntestazione('QUANTITA MAGAZZINO');
            BodySheet['D1'] = SystemInformation.GetCellaIntestazione('QUANTITA MAGAZZINO VOLANTE');
            BodySheet['E1'] = SystemInformation.GetCellaIntestazione('POSIZIONE MAGAZZINO');
            
            for(let j = 0;j < ListaTitoli.length;j ++)
            {                
                BodySheet['A' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaTitoli[j].CODICE);
                BodySheet['B' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaTitoli[j].TITOLO);
                BodySheet['C' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaTitoli[j].Q_MGZN);
                BodySheet['D' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaTitoli[j].Q_MGZN_VOL);
                BodySheet['E' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaTitoli[j].POS_MGZN);
            }   
            
            BodySheet["!cols"] = [             
                                  {wpx: 150},
                                  {wpx: 150},
                                  {wpx: 150},
                                  {wpx: 150},
                                  {wpx: 150}
                                ];
            
            BodySheet['!ref'] = 'A1:E1' + parseInt(ListaTitoli.length + 1);
            
            WBook.SheetNames.push(SheetName);
            WBook.Sheets[SheetName] = BodySheet;            
            
            var wbout = XLSX.write(WBook, {bookType:'xlsx', bookSST:true, type: 'binary'});
            saveAs(new Blob([SystemInformation.s2ab(wbout)],{type:"application/octet-stream"}),"InventarioXLS" + DataInventario + ".xlsx") 
          }      
      }
      else SystemInformation.ApplyOnError('Modello titoli magazzino non conforme','');
    },'SelectTitoliInventarioSQL')  
  }    

  $scope.InventarioMagazzinoPdf = function()
  {
    var ListaTitoli = [];
    var Data           = new Date();
    var DataAnno       = Data.getFullYear();
    var DataMese       = Data.getMonth()+1; 
    var DataGiorno     = Data.getDate();
    var DataSpedizione = DataGiorno.toString() + '/' + DataMese.toString() +  '/' + DataAnno.toString();
    
    var TroncaTitolo = function(str, n)
    {
      return (str.length > n) ? str.substr(0, n-1) + '(...)' : str;
    };
    
    SystemInformation.GetSQL('Accessories',{},function(Results)
    {
      var ListaTitoli    = [];
      var ListaTitoliTmp = [];
      var ListaTitoliTmp = SystemInformation.FindResults(Results,'BookListInventory');
      if (ListaTitoliTmp != undefined)
      {
          if(ListaTitoliTmp.length == 0)
          {
            ZCustomAlert($mdDialog,'AVVISO','IL MAGAZZINO E IL MAGAZZINO VOLANTE NON CONTENGONO TITOLI!')
            return
          }
          else
          {
            for(let i = 0; i < ListaTitoliTmp.length; i++)
            ListaTitoliTmp[i] = {
                                  CODICE     : ListaTitoliTmp[i].CODICE_ISBN == undefined ? 'N.D.' : ListaTitoliTmp[i].CODICE_ISBN,
                                  TITOLO     : ListaTitoliTmp[i].TITOLO  == undefined ? 'N.D.' : ListaTitoliTmp[i].TITOLO,
                                  POS_MGZN   : ListaTitoliTmp[i].POS_MAGAZZINO == undefined ? 'N.D.' : ListaTitoliTmp[i].POS_MAGAZZINO,
                                  Q_MGZN     : ListaTitoliTmp[i].QUANTITA_MGZN  == undefined ? 'N.D.' : ListaTitoliTmp[i].QUANTITA_MGZN,
                                  Q_MGZN_VOL : ListaTitoliTmp[i].QUANTITA_MGZN_VOL  == undefined ? 'N.D.' : ListaTitoliTmp[i].QUANTITA_MGZN_VOL                         
                                }
            ListaTitoli  = ListaTitoliTmp;

            var Data           = new Date();
            var DataAnno       = Data.getFullYear();
            var DataMese       = Data.getMonth()+1; 
            var DataGiorno     = Data.getDate();
            var DataInventario = DataGiorno.toString() + '/' + DataMese.toString() +  '/' + DataAnno.toString();

            var doc = new jsPDF();
            doc.setProperties({title: 'INVENTARIO MAGAZZINO - ' + DataInventario});
            doc.setFontSize(10); 
            doc.setFontType('bold');
            doc.text(10,20,'INVENTARIO - IN DATA ' + DataSpedizione);
            doc.setFontSize(7);
            
            var CoordY = 30;
            doc.setFontSize(7);
            doc.text(10,CoordY,'Q.MGZN');
            doc.text(25,CoordY,'Q.MGZN VOL');
            doc.text(50,CoordY,'ISBN');
            doc.text(70,CoordY,'TITOLO');
            doc.text(180,CoordY,'UBICAZIONE');
            doc.setFontType('normal');
            CoordY += 5;              

            
            for(let i = 0;i < ListaTitoli.length;i ++)
            {
                if(CoordY >= 280) 
                {
                  doc.addPage();
                  CoordY = 20;
                  doc.setFontType('bold');
                  doc.setFontSize(7);
                  doc.text(10,CoordY,'Q.MGZN');
                  doc.text(25,CoordY,'Q.MGZN VOL');
                  doc.text(50,CoordY,'ISBN');
                  doc.text(70,CoordY,'TITOLO');
                  doc.text(180,CoordY,'UBICAZIONE');
                  CoordY += 5;              
                }
                doc.setFontType('normal');
                var Q   = doc.getTextWidth('Q.MGZN');
                var Qt  = doc.getTextWidth(ListaTitoli[i].Q_MGZN);
                var QV  = doc.getTextWidth('Q.MGZN VOL');
                var QtV = doc.getTextWidth(ListaTitoli[i].Q_MGZN_VOL);
                doc.text(10 + Q + 1 - Qt,CoordY,ListaTitoli[i].Q_MGZN);
                doc.text(25 + QV + 1 - QtV,CoordY,ListaTitoli[i].Q_MGZN_VOL);
                doc.text(50,CoordY,ListaTitoli[i].CODICE);
                doc.text(70,CoordY,TroncaTitolo(ListaTitoli[i].TITOLO,75));
                doc.text(180,CoordY,ListaTitoli[i].POS_MGZN);
                CoordY += 5;
                doc.setFontSize(6);
                doc.setFontType('normal');
                doc.text(10,290,SystemInformation.VDocInventory);
                doc.setFontSize(7);            
            }
            doc.save("InventarioPDF" + DataInventario + ".pdf",{});  
          }      
      }
      else SystemInformation.ApplyOnError('Modello titoli magazzino non conforme','');
    },'SelectTitoliInventarioSQL')  
  }

  $scope.GetInventarioSalvato = function()
  {
    var InventarioTmp = [];
    SystemInformation.GetSQL('Book',{},function(Results)
    {
      InventarioTmp = SystemInformation.FindResults(Results,'SelectInventoryTemp');
      if(InventarioTmp != undefined)
      {
        if(InventarioTmp.length != 0)
        {
           for(let i = 0; i < InventarioTmp.length;i ++)
               InventarioTmp[i] = {
                                    Chiave          : InventarioTmp[i].CHIAVE_TITOLO,
                                    Codice          : InventarioTmp[i].CODICE,
                                    Nome            : InventarioTmp[i].NOME_TITOLO,
                                    QuantitaMgzn    : parseInt(InventarioTmp[i].QUANTITA_MGZN),
                                    QuantitaMgznVol : parseInt(InventarioTmp[i].QUANTITA_MGZN_VOL),
                                    Ubicazione      : InventarioTmp[i].UBICAZIONE == null ? 'N.D.' : InventarioTmp[i].UBICAZIONE
                                  }
          $scope.ListaCodiciToHandle = InventarioTmp; 
        }
        else $scope.ListaCodiciToHandle = []
      }
      else SystemInformation.ApplyOnError('Modello inventario temporaneo non conforme','')
    },'SelectInventarioTemporaneo')
  }

  $scope.SaveModifica = function(Titolo)
  {
    $ObjQuery = {Operazioni : []};
    
    $ObjQuery.Operazioni.push({
                                Query     : "UpdateInventoryTemp",
                                Parametri : {CodiceTit : Titolo.Codice,QTit : Titolo.QuantitaMgzn, QVolTit : Titolo.QuantitaMgznVol, UbcznTit : Titolo.Ubicazione == undefined ? '' : Titolo.Ubicazione}
                              })

    SystemInformation.PostSQL('Book',$ObjQuery,function(Answer)
    {      
    })
  }

  $scope.ResetInventario = function()
  {
    $scope.SelezioneGruppiInventario = function ()
    {
        $mdDialog.show({ 
                        controller          : DialogControllerSelezioneGruppiInventario,
                        templateUrl         : "template/inventoryGroupSelect.html",
                        scope               : $scope,
                        preserveScope       : true,
                        clickOutsideToClose : true,
                      })
        .then(function(answer) 
        {
        }, 
        function() 
        {
        });
    }

    function DialogControllerSelezioneGruppiInventario($scope,$mdDialog)
    {
      $scope.ListaGruppiToAdd    = [];
      $scope.CheckGruppi         = 'G';
      
      $scope.hide = function() 
      {
        $mdDialog.hide();
      };
  
      $scope.AnnullaPopup = function() 
      {
        for(let i = 0;i < $scope.ListaGruppiPopup.length;i ++)
            $scope.ListaGruppiPopup[i].DaAggiungere = false;          
        $scope.ListaGruppiToAdd  = [];
        $mdDialog.cancel();
      };
  
      $scope.ConfermaPopup = function()
      { 
        var ContatoreGruppi = 0; 
        for(let j = 0;j < $scope.ListaGruppiPopup.length;j ++)
        {
          if($scope.ListaGruppiPopup[j].DaAggiungere)
          {
             $scope.ListaGruppiToAdd.push($scope.ListaGruppiPopup[j].Chiave);
             ContatoreGruppi++; 
             $scope.ListaGruppiPopup[j].DaAggiungere = false; 
          }
        }
        if(ContatoreGruppi == 0 && $scope.CheckGruppi == 'G')
        {
           ZCustomAlert($mdDialog,'ATTENZIONE','NESSUN GRUPPO SELEZIONATO')
        }
        else
        {
          $mdDialog.hide();
          SecondaConferma($scope.ListaGruppiToAdd)  
        }   
        
      }
    }

    var PrimaConferma = function()
    {
      ZConfirm.GetConfirmBox('AVVISO',"SEI SICURO DI ESEGUIRE IL RESET DELL'INVENTARIO? L'OPERAZIONE E' IRREVERSIBILE!",SelezionaGruppiEditore,function(){});      
    }
    
    var SelezionaGruppiEditore = function()
    {
      $scope.ListaGruppiPopup = [];
      SystemInformation.GetSQL('PublisherGroup', {}, function(Results)  
      {
        GruppiInfoList = SystemInformation.FindResults(Results,'GroupInfoListHandled');
        if(GruppiInfoList != undefined)
        { 
           for(let i = 0;i < GruppiInfoList.length;i ++)
           GruppiInfoList[i] = {
                                 Chiave       : GruppiInfoList[i].CHIAVE,
                                 Descrizione  : GruppiInfoList[i].DESCRIZIONE,
                                 DaAggiungere : true
                               }
           $scope.ListaGruppiPopup = GruppiInfoList;
           $scope.SelezioneGruppiInventario();
        } 
        else SystemInformation.ApplyOnError('Modello promotori case editrici non conforme','');   
      },'SelectSQLHandled');
    }
    
    var SecondaConferma = function()
    {  
      $ObjQuery = { Operazioni : [] };
      
      if($scope.ListaGruppiToAdd.length > 0 && $scope.CheckGruppi == 'G')
      {
        for(let i = 0;i < $scope.ListaGruppiToAdd.length;i ++)
        {
           $ObjQuery.Operazioni.push({
                                       Query     : 'ResetGroupInventory',
                                       Parametri : { ChiaveEditore : parseInt($scope.ListaGruppiToAdd[i]) }
                                     })
           SystemInformation.PostSQL('Book',$ObjQuery,function(Answer)
           {
             $ObjQuery = {};
             if(i == $scope.ListaGruppiToAdd.length - 1)
                ZCustomAlert($mdDialog,'AVVISO','I MAGAZZINI DEI GRUPPI SELEZIONATI SONO STATI STATO RESETTATI CON SUCCESSO!');
           })
        }
      }
      else
      {
        $ObjQuery.Operazioni.push({
                                    Query     : 'ResetAllInventory',
                                    Parametri : {}
                                  })
        SystemInformation.PostSQL('Book',$ObjQuery,function(Answer)
        {
          ZCustomAlert($mdDialog,'AVVISO','I MAGAZZINI SONO STATI STATO RESETTATI CON SUCCESSO!');
          $ObjQuery = {};
        })
      }   
    }

    ZConfirm.GetConfirmBox('AVVISO','Questa operazione eseguirà il reset di tutte le quantità dei titoli nel magazzino e nel magazzino volante. Confermi?',PrimaConferma,function(){});      
  } 

  SystemInformation.GetSQL('Book',{},function(Results)
  {
    ListaTitoliAllTmp = SystemInformation.FindResults(Results,'BookListInventoryAll')
    if(ListaTitoliAllTmp != undefined)
    {
       for(let i = 0;i < ListaTitoliAllTmp.length;i ++)
           ListaTitoliAllTmp[i] = {
                                    ChiaveTitolo      : ListaTitoliAllTmp[i].CHIAVE,
                                    CodiceTitolo      : ListaTitoliAllTmp[i].CODICE_ISBN,
                                    NomeTitolo        : ListaTitoliAllTmp[i].TITOLO,
                                    QuantitaTitolo    : ListaTitoliAllTmp[i].QUANTITA_MGZN,
                                    QuantitaTitoloVol : ListaTitoliAllTmp[i].QUANTITA_MGZN_VOL,
                                    Ubicazione        : ListaTitoliAllTmp[i].POS_MAGAZZINO == null ? 'N.D.' : ListaTitoliAllTmp[i].POS_MAGAZZINO
                                  }
            $scope.ListaTitoliAll = ListaTitoliAllTmp
    }
    else SystemInformation.ApplyOnError('Modello lista titoli inventario non conforme','')
  },'SelectAllTitoliInventario')

  $scope.EliminaInserimento = function(Inserimento)
  {
    InserimentoTrovatoIndex = $scope.ListaCodiciToHandle.findIndex(function(ACodice){return(ACodice.Codice == Inserimento.Codice);});
    InserimentoTrovato = $scope.ListaCodiciToHandle.find(function(ACodice){return(ACodice.Codice == Inserimento.Codice);});    
    $ObjQuery = {Operazioni : []};
    $ObjQuery.Operazioni.push({
                                Query     : "DeleteInventoryTempBook",
                                Parametri : {CODICE_CORRISP : InserimentoTrovato.Codice}
                              })

    SystemInformation.PostSQL('Book',$ObjQuery,function(Answer)
    {      
        $scope.ListaCodiciToHandle.splice(InserimentoTrovatoIndex,1);
        if($scope.CodiceBippato == Inserimento.Codice)
        {
          $scope.CodiceBippato = '';
          $scope.CodiceFocused = undefined;
        }
    })  
  }

  $scope.SvuotaInventarioTemporaneo = function()
  {
    $ObjQuery = {Operazioni : []};
    $ObjQuery.Operazioni.push({
                                Query     : "ResetInventoryTempAll",
                                Parametri : {}
                               })
    SystemInformation.PostSQL('Book',$ObjQuery,function(Answer)
    {

    })
  }

  $scope.ResetIsbnInput = function()
  {
    $scope.CodiceBippatoVisible = '';
    //$scope.CodiceFocused = undefined;
  }  

  $scope.AggiungiInserimento = function(KeyPressed)
  {
    $scope.CodiceBippato = $scope.CodiceBippatoVisible;
    
    if($scope.CodiceFocused == undefined)
       $scope.CodiceFocused = {Chiave : -1, Codice : -1, Nome : '', QuantitaMgzn : 0, QuantitaMgznVol : 0, Ubicazione : '', ModificaAbilitata : false};

    if(KeyPressed.keyCode == 13)
    {
      if($scope.CodiceFocused.Codice == $scope.CodiceBippato)
      {
         var TitoloInLista = $scope.ListaCodiciToHandle.findIndex(function(ACodice){return(ACodice.Codice == $scope.CodiceBippato);});
         if(TitoloInLista != undefined)
         {
            $scope.ListaCodiciToHandle[TitoloInLista].QuantitaMgzn += 1;
            $scope.SaveModifica($scope.ListaCodiciToHandle[TitoloInLista]);
         }
         $scope.CodiceBippato = $scope.CodiceFocused.Codice;
      }
      else
      {
           var TitoloTrovato = $scope.ListaTitoliAll.find(function(ACodice){return(ACodice.CodiceTitolo == $scope.CodiceBippato);});
           if(TitoloTrovato == undefined)
           {
            ZCustomAlert($mdDialog,'ATTENZIONE',"NESSUN TITOLO IN MAGAZZINO ASSOCIATO A QUESTO TITOLO! SI CONSIGLIA DI CONTROLLARE IL DATABASE O DI VERIFICARE L'INSERIMENTO DEL CODICE!")
             $scope.CodiceBippato = '';
             return
           }
           else
           {
              var TitoloInLista = $scope.ListaCodiciToHandle.findIndex(function(ACodice){return(ACodice.Codice == $scope.CodiceBippato);});
              if(TitoloInLista != -1)
              {
                 $scope.ListaCodiciToHandle[TitoloInLista].QuantitaMgzn += 1;
                 $scope.SaveModifica($scope.ListaCodiciToHandle[TitoloInLista]);
                 $scope.CodiceBippato = $scope.ListaCodiciToHandle[TitoloInLista].Codice;
              }
              else
              {
                 $scope.CodiceFocused                 = {Codice : 0, Nome : '', QuantitaMgzn : 0, QuantitaMgznVol : 0, ModificaAbilitata : false};
                 $scope.CodiceFocused.Chiave          = TitoloTrovato.ChiaveTitolo;
                 $scope.CodiceFocused.Codice          = $scope.CodiceBippato;
                 $scope.CodiceFocused.Nome            = TitoloTrovato.NomeTitolo;
                 $scope.CodiceFocused.QuantitaMgzn    = 1;
                 $scope.CodiceFocused.QuantitaMgznVol = 0;
                 $scope.CodiceFocused.Ubicazione      = TitoloTrovato.Ubicazione;
                 if($scope.CodiceBippato != -1)
                 {
                   $scope.ListaCodiciToHandle.unshift($scope.CodiceFocused); //PUSH
                   LastTitoloToSave = $scope.ListaCodiciToHandle.find(function(ACodice){return(ACodice.Codice == $scope.CodiceBippato);})                 
                   $scope.SaveModifica(LastTitoloToSave);
                 }
                 $scope.CodiceBippato = $scope.CodiceFocused.Codice;
              }
            }
      }
      $scope.CodiceBippatoVisible = '';
    }  
  }

  $scope.ChiudiGestioneInventario = function()
  {
    if ($scope.ListaCodiciToHandle.length == 0)
    {
        $scope.ListaCodiciToHandle = [];
        $scope.CodiceBippato       = '';
        $scope.CodiceFocused       = undefined;
        $state.go("startPage")
    }
    else
    { 
        var Procedi = function()
        {
          ZConfirm.GetConfirmBox('AVVISO',"CONFERMI?",ProcediFinale,function(){});
        }
        var ProcediFinale = function()
        {  
          $scope.SvuotaInventarioTemporaneo();
          $scope.ListaCodiciToHandle = [];
          $scope.CodiceBippato       = '';
          $scope.CodiceFocused = undefined;
          $state.go("startPage");
        }
        ZConfirm.GetConfirmBox('AVVISO',"SEI SICURO DI VOLER ANNULLARE TUTTI GLI INSERIMENTI ESEGUITI?",Procedi,function(){});
    }
  }

  $scope.ConfermaGestioneInventario = function()
  {
    var InventarioConfermato = function()
    {
       $ObjQuery = {Operazioni : [] }
       for(let i = 0;i < $scope.ListaCodiciToHandle.length;i ++)
       {
           ParametriInserimento = {
                                    ChiaveTitolo             : $scope.ListaCodiciToHandle[i].Chiave,
                                    QuantitaTitolo           : $scope.ListaCodiciToHandle[i].QuantitaMgzn,
                                    QuantitaVolanteTitolo    : $scope.ListaCodiciToHandle[i].QuantitaMgznVol,
                                    PosizioneMagazzinoTitolo : $scope.ListaCodiciToHandle[i].Ubicazione
                                  }
           $ObjQuery.Operazioni.push({
                                       Query     : "UpdateBookFromInventory",
                                       Parametri : ParametriInserimento
                                     })
       }
       SystemInformation.PostSQL('Book',$ObjQuery,function(Answer)
       {
         ZCustomAlert($mdDialog,'AVVISO','AGGIORNAMENTO DEL MAGAZZINO COMPLETATO CON SUCCESSO!')
        
         /*$scope.ListaCodiciToHandle.sort(function(a,b)
         {
           let TitoloA = a.Nome;
           let TitoloB = b.Nome;
           return (TitoloA < TitoloB) ? -1 : (TitoloA > TitoloB) ? 1 : 0;
         });*/       

         var Data           = new Date();
         var DataAnno       = Data.getFullYear();
         var DataMese       = Data.getMonth()+1; 
         var DataGiorno     = Data.getDate();
         var DataInventario = DataGiorno.toString() + '/' + DataMese.toString() +  '/' + DataAnno.toString();
         var WBook = {
                       SheetNames : [],
                       Sheets     : {}
                     };
                       
         var SheetName   = 'INVENTARIO (DA CODICE) - ' + DataInventario;
         var BodySheet   = {};               
         BodySheet       = {};
         BodySheet['A1'] = SystemInformation.GetCellaIntestazione('ISBN');
         BodySheet['B1'] = SystemInformation.GetCellaIntestazione('TITOLO');
         BodySheet['C1'] = SystemInformation.GetCellaIntestazione('QUANTITA MAGAZZINO');
         BodySheet['D1'] = SystemInformation.GetCellaIntestazione('QUANTITA MAGAZZINO VOLANTE');
         BodySheet['E1'] = SystemInformation.GetCellaIntestazione('UBICAZIONE');
         
         for(let i = 0;i < $scope.ListaCodiciToHandle.length;i ++)
         {                
             BodySheet['A' + parseInt(i + 2)] = SystemInformation.GetCellaDati('s',$scope.ListaCodiciToHandle[i].Codice);
             BodySheet['B' + parseInt(i + 2)] = SystemInformation.GetCellaDati('s',$scope.ListaCodiciToHandle[i].Nome);
             BodySheet['C' + parseInt(i + 2)] = SystemInformation.GetCellaDati('s',$scope.ListaCodiciToHandle[i].QuantitaMgzn.toString());
             BodySheet['D' + parseInt(i + 2)] = SystemInformation.GetCellaDati('s',$scope.ListaCodiciToHandle[i].QuantitaMgznVol.toString());
             BodySheet['E' + parseInt(i + 2)] = SystemInformation.GetCellaDati('s',$scope.ListaCodiciToHandle[i].Ubicazione);
         }   
         
         BodySheet["!cols"] = [             
                               {wpx: 300},
                               {wpx: 300},
                               {wpx: 300},
                               {wpx: 300},
                               {wpx: 300}
                             ];
         
         BodySheet['!ref'] = 'A1:E1' + parseInt($scope.ListaCodiciToHandle.length + 1);
         
         WBook.SheetNames.push(SheetName);
         WBook.Sheets[SheetName] = BodySheet;            
         
         var wbout = XLSX.write(WBook, {bookType:'xlsx', bookSST:true, type: 'binary'});
         saveAs(new Blob([SystemInformation.s2ab(wbout)],{type:"application/octet-stream"}),"InventarioDaCodiceXLS" + DataInventario + ".xlsx");            
         
         $scope.SvuotaInventarioTemporaneo();
         $scope.ListaCodiciToHandle = [];
         $scope.CodiceBippato       = '';
         $scope.CodiceFocused       = undefined;
         $state.go("startPage")
       })
    }
    ZConfirm.GetConfirmBox('ATTENZIONE',"CONFERMARE L'INVENTARIO ESEGUITO? L'OPERAZIONE E' IRREVERSIBILE!",InventarioConfermato,function(){});
  }

  $scope.GetInventarioSalvato();

}]);