SIRIOApp.controller("storageLogPageController",['$scope','SystemInformation','$state','$rootScope','$mdDialog', function($scope,SystemInformation,$state,$rootScope,$mdDialog)
{
  $scope.DataRicercaAl     = new Date();
  let TmpDate              = new Date($scope.DataRicercaAl);
  TmpDate.setDate(TmpDate.getDate() - 7);
  $scope.DataRicercaDal    = new Date(TmpDate);
  $scope.TitoloFiltro      = undefined;
  $scope.Magazzino         = 'G';
  
  ScopeHeaderController.CheckButtons();
  
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
            alert('IL MAGAZZINO E IL MAGAZZINO VOLANTE NON CONTENGONO TITOLI!')
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
            alert('IL MAGAZZINO E IL MAGAZZINO VOLANTE NON CONTENGONO TITOLI!')
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
                       
  SystemInformation.GetSQL('Book', {}, function(Results)  
  {  
    TitoliInfoLista = SystemInformation.FindResults(Results,'BookListFilter');
    if(TitoliInfoLista != undefined)
    { 
       for(let i = 0; i < TitoliInfoLista.length; i++)
           TitoliInfoLista[i] = { 
                                  Chiave : TitoliInfoLista[i].CHIAVE,
                                  Nome   : TitoliInfoLista[i].TITOLO,
                                  Codice : TitoliInfoLista[i].CODICE_ISBN
                                }
       $scope.ListaTitoli  = TitoliInfoLista;
    }
    else SystemInformation.ApplyOnError('Modello titoli non conforme','');   
  },'SelectSQLFilter');
  
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
    if(itemTit == undefined)
       return
    else $scope.TitoloFiltro = itemTit.Chiave;
  }
  
  var TroncaTitolo = function(str, n)
  {
    return (str.length > n) ? str.substr(0, n-1) + '(...)' : str;
  };

  $scope.RicercaLog = function ()
  {
    if((($scope.DataRicercaDal == undefined || $scope.DataRicercaAl == undefined) || ($scope.DataRicercaDal == '' || $scope.DataRicercaAl == '')) || ($scope.DataRicercaDal == undefined && $scope.DataRicercaAl == undefined && $scope.TitoloFiltro == undefined) || ($scope.DataRicercaDal > $scope.DataRicercaAl))
       alert('Dati ricerca non validi')
    else
    { 
          
       if($scope.TitoloFiltro != undefined && $scope.Magazzino == 'G')
       {
         var ParamRicercaLog = {
                                 TITOLO : $scope.TitoloFiltro,
                                 DAL    : ZHTMLInputFromDate($scope.DataRicercaDal),
                                 AL     : ZHTMLInputFromDate($scope.DataRicercaAl)     
                               }
         SystemInformation.GetSQL('StorageLog',ParamRicercaLog, function(Results)
         { 
           $scope.TitoloFiltro = undefined;
           $scope.TitoloFiltrato = null;
           $scope.SearchTextTit = '';
           var ListaMovimenti = SystemInformation.FindResults(Results,'GetLogInfoMgznBook');
           if(ListaMovimenti != undefined)
           {             
             if (ListaMovimenti.length == 0)
             {
                 var doc = new jsPDF();
                 doc.setProperties({title: 'STAMPA LOG'});
                 doc.setFontSize(10); 
                 doc.setFontType('bold');
                 doc.setTextColor(255,0,0);
                 doc.text(60,20,'NESSUN MOVIMENTO NELLA DATA SELEZIONATA');
                 document.getElementById('logPdf').src = doc.output('datauristring')
             }
             else
             {
                 var Data           = new Date();
                 var DataAnno       = Data.getFullYear();
                 var DataMese       = Data.getMonth()+1; 
                 var DataGiorno     = Data.getDate();
                 var DataReport     = DataGiorno.toString() + '/' + DataMese.toString() +  '/' + DataAnno.toString();
               
                 var doc = new jsPDF();
                 doc.setProperties({title: 'STAMPA LOG'});
                 doc.setFontSize(10); 
                 doc.setFontType('bold');
                 doc.text(10,20,'REPORT MOVIMENTI MAGAZZINO PRINCIPALE ' + DataReport + ' DEL TITOLO:');
                 doc.text(10,25,ListaMovimenti[0].NOME_TITOLO + ' (ISBN: ' + ListaMovimenti[0].CODICE + ' )');
                 doc.setFontSize(8);
                 var CoordY = 35;
                 
                 doc.setFontSize(8); 
                 doc.setFontType('bold');
                 doc.text(10,CoordY+10,'DATA');
                 doc.text(30,CoordY+10,'QUANTITA');
                 doc.text(50,CoordY+10,'DESCRIZIONE');
                 
                 for(let i = 0;i < ListaMovimenti.length;i ++)
                 {
                   if (CoordY >= 280) 
                   {
                     doc.addPage();
                     CoordY = 20;
                     doc.setFontSize(8); 
                     doc.setFontType('bold');
                     doc.text(10,CoordY,'DATA');
                     doc.text(30,CoordY,'QUANTITA');
                     doc.text(50,CoordY,'DESCRIZIONE');
                   }
                   doc.setFontType('italic');
                   doc.setFontSize(7);
                   CoordY += 5;
                   var Q  = doc.getTextWidth('QUANTITA');
                   var Qt = doc.getTextWidth(ListaMovimenti[i].QUANTITA);
                   doc.text(10,CoordY+10,ZFormatDateTime('dd/mm/yyyy',ZDateFromHTMLInput(ListaMovimenti[i].DATA)));
                   doc.text(30 + Q + 1 - Qt,CoordY+10,ListaMovimenti[i].QUANTITA);
                   doc.text(50,CoordY+10,ListaMovimenti[i].DESCRIZIONE);
                   doc.setFontSize(6);
                   doc.setFontType('normal');
                   doc.text(10,290,SystemInformation.VDocLogStorage);
                   doc.setFontSize(7);
                 } 
                 //document.getElementById('logPdf').src = doc.output('datauristring');
                 doc.save('storageLogPdf.pdf',{});      
                 //$scope.TitoloFiltrato = undefined;                
             }
           }
           else SystemInformation.ApplyOnError('Modello movimento titolo magazzino principale non valido','');         
         },'SelectLogMgznBookSQL')
       }
       
       if($scope.TitoloFiltro == undefined && $scope.Magazzino == 'G')
       {
         var ParamRicercaLog = {
                                 DAL    : ZHTMLInputFromDate($scope.DataRicercaDal),
                                 AL     : ZHTMLInputFromDate($scope.DataRicercaAl)   
                               }
         SystemInformation.GetSQL('StorageLog',ParamRicercaLog, function(Results)
         {
           $scope.TitoloFiltro = undefined;
           $scope.TitoloFiltrato = null;
           $scope.SearchTextTit = '';           
           var ListaMovimenti = SystemInformation.FindResults(Results,'GetLogInfoMgzn');
           if(ListaMovimenti != undefined)
           {
             if (ListaMovimenti.length == 0)
             {
                 var doc = new jsPDF();
                 doc.setProperties({title: 'STAMPA LOG'});
                 doc.setFontSize(10); 
                 doc.setFontType('bold');
                 doc.setTextColor(255,0,0);
                 doc.text(60,20,'NESSUN MOVIMENTO NELLA DATA SELEZIONATA');
                 document.getElementById('logPdf').src = doc.output('datauristring')
             }
             else
             {
                 var Data           = new Date();
                 var DataAnno       = Data.getFullYear();
                 var DataMese       = Data.getMonth()+1; 
                 var DataGiorno     = Data.getDate();
                 var DataReport     = DataGiorno.toString() + '/' + DataMese.toString() +  '/' + DataAnno.toString();
               
                 var doc = new jsPDF();
                 doc.setProperties({title: 'STAMPA LOG'});
                 doc.setFontSize(10); 
                 doc.setFontType('bold');
                 doc.text(10,20,'REPORT MOVIMENTI GLOBALI MAGAZZINO PRINCIPALE ' + DataReport);
                 doc.setFontSize(8);
                 var CoordY = 30;
                 
                 doc.setFontSize(8); 
                 doc.setFontType('bold');
                 doc.text(10,CoordY+10,'DATA');
                 doc.text(25,CoordY+10,'QNT');
                 doc.text(35,CoordY+10,'ISBN');
                 doc.text(55,CoordY+10,'TITOLO');
                 doc.text(130,CoordY+10,'DESCRIZIONE');
                 
                 for(let i = 0;i < ListaMovimenti.length;i ++)
                 {
                   if (CoordY >= 280) 
                   {
                     doc.addPage();
                     CoordY = 20;
                     doc.setFontSize(8); 
                     doc.setFontType('bold');
                     doc.text(10,CoordY,'DATA');
                     doc.text(25,CoordY,'QNT');
                     doc.text(35,CoordY+10,'ISBN');
                     doc.text(55,CoordY+10,'TITOLO');
                     doc.text(150,CoordY,'DESCRIZIONE');
                   }
                   doc.setFontType('italic');
                   doc.setFontSize(7);
                   CoordY += 5;
                   var Q  = doc.getTextWidth('QNT');
                   var Qt = doc.getTextWidth(ListaMovimenti[i].QUANTITA);
                   doc.text(10,CoordY+10,ZFormatDateTime('dd/mm/yyyy',ZDateFromHTMLInput(ListaMovimenti[i].DATA)));
                   doc.text(25 + Q + 1 - Qt,CoordY+10,ListaMovimenti[i].QUANTITA);
                   doc.text(35,CoordY+10,ListaMovimenti[i].CODICE);
                   doc.text(55,CoordY+10,TroncaTitolo(ListaMovimenti[i].NOME_TITOLO,50));
                   doc.text(130,CoordY+10,ListaMovimenti[i].DESCRIZIONE);
                   doc.setFontSize(6);
                   doc.setFontType('normal');
                   doc.text(10,290,SystemInformation.VDocLogStorage);
                   doc.setFontSize(7);
                 } 
                 //document.getElementById('logPdf').src = doc.output('datauristring');
                 doc.save('storageLogPdf.pdf',{});
             }
           }
           else SystemInformation.ApplyOnError('Modello movimenti globali magazzino principale non valido','');       
         },'SelectLogMgznSQL')          
       }
       
       if($scope.TitoloFiltro != undefined && $scope.Magazzino == 'V')
       {
         var ParamRicercaLog = {
                                 TITOLO : $scope.TitoloFiltro,
                                 DAL    : ZHTMLInputFromDate($scope.DataRicercaDal),
                                 AL     : ZHTMLInputFromDate($scope.DataRicercaAl)     
                               }
         SystemInformation.GetSQL('StorageLog',ParamRicercaLog, function(Results)
         {
           $scope.TitoloFiltro = undefined;
           $scope.TitoloFiltrato = null;
           $scope.SearchTextTit = ''; 
           var ListaMovimenti = SystemInformation.FindResults(Results,'GetLogInfoMgznVolBook');
           if(ListaMovimenti != undefined)
           {
             if (ListaMovimenti.length == 0)
             {
                 for(let i = 0;i < ListaMovimenti.length;i ++)                 
                     ListaMovimenti[i] = {
                                           CODICE      : ListaMovimenti[i].CODICE == null ? 'N.D' : ListaMovimenti[i].CODICE, 
                                           TITOLO      : ListaMovimenti[i].TITOLO == null ? 'N.D' : ListaMovimenti[i].TITOLO, 
                                           NOME_TITOLO : ListaMovimenti[i].NOME_TITOLO == null ? 'N.D' : ListaMovimenti[i].NOME_TITOLO,  
                                           QUANTITA    : ListaMovimenti[i].QUANTITA == null ? 'N.D' : ListaMovimenti[i].QUANTITA,
                                           DESCRIZIONE : ListaMovimenti[i].DESCRIZIONE == null ? 'N.D' : ListaMovimenti[i].DESCRIZIONE, 
                                           DATA        : ListaMovimenti[i].DATA == null ? 'N.D' : ListaMovimenti[i].DATA
                                         }
                 var doc = new jsPDF();
                 doc.setProperties({title: 'STAMPA LOG'});
                 doc.setFontSize(10); 
                 doc.setFontType('bold');
                 doc.setTextColor(255,0,0);
                 doc.text(60,20,'NESSUN MOVIMENTO NELLA DATA SELEZIONATA');
                 document.getElementById('logPdf').src = doc.output('datauristring')
             }
             else
             {                
                 var Data           = new Date();
                 var DataAnno       = Data.getFullYear();
                 var DataMese       = Data.getMonth()+1; 
                 var DataGiorno     = Data.getDate();
                 var DataReport     = DataGiorno.toString() + '/' + DataMese.toString() +  '/' + DataAnno.toString();
               
                 var doc = new jsPDF();
                 doc.setProperties({title: 'STAMPA LOG'});
                 doc.setFontSize(10); 
                 doc.setFontType('bold');
                 doc.text(10,20,'REPORT MOVIMENTI MAGAZZINO VOLANTE ' + DataReport + ' DEL TITOLO:');
                 doc.text(10,25,ListaMovimenti[0].NOME_TITOLO + ' (ISBN: ' + ListaMovimenti[0].CODICE + ' )');
                 doc.setFontSize(8);
                 var CoordY = 35;
                 
                 doc.setFontSize(8); 
                 doc.setFontType('bold');
                 doc.text(10,CoordY+10,'DATA');
                 doc.text(30,CoordY+10,'QUANTITA');
                 doc.text(50,CoordY+10,'DESCRIZIONE');
                 
                 for(let i = 0;i < ListaMovimenti.length;i ++)
                 {
                   if (CoordY >= 280) 
                   {
                     doc.addPage();
                     CoordY = 20;
                     doc.setFontSize(8); 
                     doc.setFontType('bold');
                     doc.text(10,CoordY,'DATA');
                     doc.text(30,CoordY,'QUANTITA');
                     doc.text(50,CoordY,'DESCRIZIONE');
                   }
                   doc.setFontType('italic');
                   doc.setFontSize(7);
                   CoordY += 5;
                   var Q  = doc.getTextWidth('QUANTITA');
                   var Qt = doc.getTextWidth(ListaMovimenti[i].QUANTITA);
                   doc.text(10,CoordY+10,ZFormatDateTime('dd/mm/yyyy',ZDateFromHTMLInput(ListaMovimenti[i].DATA)));
                   doc.text(30 + Q + 1 - Qt,CoordY+10,ListaMovimenti[i].QUANTITA);
                   doc.text(50,CoordY+10,ListaMovimenti[i].DESCRIZIONE);
                   doc.setFontSize(6);
                   doc.setFontType('normal');
                   doc.text(10,290,SystemInformation.VDocLogStorage);
                   doc.setFontSize(7);
                 } 
                //document.getElementById('logPdf').src = doc.output('datauristring');
                doc.save('storageLogPdf.pdf',{});
             }
           }
           else SystemInformation.ApplyOnError('Modello movimento titolo magazzino volante non valido','');        
         },'SelectLogMgznVolBookSQL')
       }
       
       if($scope.TitoloFiltro == undefined && $scope.Magazzino == 'V')
       {
         var ParamRicercaLog = {
                                 DAL    : ZHTMLInputFromDate($scope.DataRicercaDal),
                                 AL     : ZHTMLInputFromDate($scope.DataRicercaAl)     
                               }
         SystemInformation.GetSQL('StorageLog',ParamRicercaLog, function(Results)
         {
           $scope.TitoloFiltro = undefined;
           $scope.TitoloFiltrato = null;
           $scope.SearchTextTit = ''; 
           var ListaMovimenti = SystemInformation.FindResults(Results,'GetLogInfoMgznVol');
           if(ListaMovimenti != undefined)
           {
             if (ListaMovimenti.length == 0)
             {
                 for(let i = 0;i < ListaMovimenti.length;i ++)                 
                     ListaMovimenti[i] = {
                                           CODICE      : ListaMovimenti[i].CODICE == null ? 'N.D' : ListaMovimenti[i].CODICE, 
                                           TITOLO      : ListaMovimenti[i].TITOLO == null ? 'N.D' : ListaMovimenti[i].TITOLO, 
                                           NOME_TITOLO : ListaMovimenti[i].NOME_TITOLO == null ? 'N.D' : ListaMovimenti[i].NOME_TITOLO,  
                                           QUANTITA    : ListaMovimenti[i].QUANTITA == null ? 'N.D' : ListaMovimenti[i].QUANTITA, 
                                           DESCRIZIONE : ListaMovimenti[i].DESCRIZIONE == null ? 'N.D' : ListaMovimenti[i].DESCRIZIONE,
                                           DATA        : ListaMovimenti[i].DATA == null ? 'N.D' : ListaMovimenti[i].DATA
                                         }
                 var doc = new jsPDF();
                 doc.setProperties({title: 'STAMPA LOG'});
                 doc.setFontSize(10); 
                 doc.setFontType('bold');
                 doc.setTextColor(255,0,0);
                 doc.text(60,20,'NESSUN MOVIMENTO NELLA DATA SELEZIONATA');
                 document.getElementById('logPdf').src = doc.output('datauristring')
             }
             else
             {           
                 var Data           = new Date();
                 var DataAnno       = Data.getFullYear();
                 var DataMese       = Data.getMonth()+1; 
                 var DataGiorno     = Data.getDate();
                 var DataReport     = DataGiorno.toString() + '/' + DataMese.toString() +  '/' + DataAnno.toString();
               
                 var doc = new jsPDF();
                 doc.setProperties({title: 'STAMPA LOG'});
                 doc.setFontSize(10); 
                 doc.setFontType('bold');
                 doc.text(10,20,'REPORT MOVIMENTI GLOBALI MAGAZZINO VOLANTE ' + DataReport);
                 doc.setFontSize(8);
                 var CoordY = 30;
                 
                 doc.setFontSize(8); 
                 doc.setFontType('bold');
                 doc.text(10,CoordY+10,'DATA');
                 doc.text(25,CoordY+10,'QNT');
                 doc.text(35,CoordY+10,'ISBN');
                 doc.text(55,CoordY+10,'TITOLO');
                 doc.text(150,CoordY+10,'DESCRIZIONE');
                 
                 for(let i = 0;i < ListaMovimenti.length;i ++)
                 {
                   if (CoordY >= 280) 
                   {
                     doc.addPage();
                     CoordY = 20;
                     doc.setFontSize(8); 
                     doc.setFontType('bold');
                     doc.text(10,CoordY,'DATA');
                     doc.text(25,CoordY,'QNT');
                     doc.text(35,CoordY+10,'ISBN');
                     doc.text(55,CoordY,'TITOLO');
                     doc.text(130,CoordY,'DESCRIZIONE');
                   }
                   doc.setFontType('italic');
                   doc.setFontSize(7);
                   CoordY += 5;
                   var Q  = doc.getTextWidth('QNT');
                   var Qt = doc.getTextWidth(ListaMovimenti[i].QUANTITA);
                   doc.text(10,CoordY+10,ZFormatDateTime('dd/mm/yyyy',ZDateFromHTMLInput(ListaMovimenti[i].DATA)));
                   doc.text(25 + Q + 1 - Qt,CoordY+10,ListaMovimenti[i].QUANTITA);
                   doc.text(35,CoordY+10,ListaMovimenti[i].CODICE);
                   doc.text(55,CoordY+10,TroncaTitolo(ListaMovimenti[i].NOME_TITOLO,50));
                   doc.text(130,CoordY+10,ListaMovimenti[i].DESCRIZIONE);
                   doc.setFontSize(6);
                   doc.setFontType('normal');
                   doc.text(10,290,SystemInformation.VDocLogStorage);
                   doc.setFontSize(7);
                 } 
                //document.getElementById('logPdf').src = doc.output('datauristring');
                doc.save('storageLogPdf.pdf',{});
             }
           }
           else SystemInformation.ApplyOnError('Modello movimenti globali magazzino volante non valido','');         
         },'SelectLogMgznVolSQL')          
       }   
    } 
  }    
}]);