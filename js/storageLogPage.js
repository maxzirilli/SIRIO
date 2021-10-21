SIRIOApp.controller("storageLogPageController",['$scope','SystemInformation','$state','$rootScope','$mdDialog','ZConfirm', function($scope,SystemInformation,$state,$rootScope,$mdDialog,ZConfirm)
{
  $scope.DataRicercaAl     = new Date();
  let TmpDate              = new Date($scope.DataRicercaAl);
  TmpDate.setDate(TmpDate.getDate() - 30);
  //$scope.DataRicercaDal   = new Date(TmpDate);
  var AnnoCorrente = new Date().getFullYear();
  $scope.DataRicercaDal   = new Date(AnnoCorrente, 0, 1)
  $scope.TitoloFiltro      = undefined;
  $scope.Magazzino         = 'G';
  //$scope.ResearchOn        = false;
  
  ScopeHeaderController.CheckButtons();
                       
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
         ZCustomAlert($mdDialog,'ATTENZIONE','DATI RICERCA NON VALIDI')
    else
    { 
       //$scope.ResearchOn = true;   
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
                 //document.getElementById('logPdf').src = doc.output('datauristring')
                 doc.save('storageLogPdf.pdf',{});
             }
             else
             {
                 for(let i = 0;i < ListaMovimenti.length;i ++)                 
                     ListaMovimenti[i] = {
                                           CODICE      : ListaMovimenti[i].CODICE == undefined ? 'N.D' : ListaMovimenti[i].CODICE, 
                                           TITOLO      : ListaMovimenti[i].TITOLO == undefined ? 'N.D' : ListaMovimenti[i].TITOLO, 
                                           NOME_TITOLO : ListaMovimenti[i].NOME_TITOLO == undefined ? 'N.D' : ListaMovimenti[i].NOME_TITOLO,  
                                           QUANTITA    : ListaMovimenti[i].QUANTITA == undefined ? 'N.D' : ListaMovimenti[i].QUANTITA,
                                           DESCRIZIONE : ListaMovimenti[i].DESCRIZIONE == undefined ? 'N.D' : ListaMovimenti[i].DESCRIZIONE, 
                                           DATA        : ListaMovimenti[i].DATA == undefined ? 'N.D' : ListaMovimenti[i].DATA
                                         }
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
                   if (CoordY >= 270) 
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
                 //doc.save('storageLogPdf.pdf',{});      
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
                 //document.getElementById('logPdf').src = doc.output('datauristring')
                 doc.save('storageLogPdf.pdf',{});
             }
             else
             {
                 for(let i = 0;i < ListaMovimenti.length;i ++)                 
                     ListaMovimenti[i] = {
                                           CODICE      : ListaMovimenti[i].CODICE == undefined ? 'N.D' : ListaMovimenti[i].CODICE, 
                                           TITOLO      : ListaMovimenti[i].TITOLO == undefined ? 'N.D' : ListaMovimenti[i].TITOLO, 
                                           NOME_TITOLO : ListaMovimenti[i].NOME_TITOLO == undefined ? 'N.D' : ListaMovimenti[i].NOME_TITOLO,  
                                           QUANTITA    : ListaMovimenti[i].QUANTITA == undefined ? 'N.D' : ListaMovimenti[i].QUANTITA,
                                           DESCRIZIONE : ListaMovimenti[i].DESCRIZIONE == undefined ? 'N.D' : ListaMovimenti[i].DESCRIZIONE, 
                                           DATA        : ListaMovimenti[i].DATA == undefined ? 'N.D' : ListaMovimenti[i].DATA
                                         }
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
                 doc.text(110,CoordY+10,'DESCRIZIONE');
                 
                 for(let i = 0;i < ListaMovimenti.length;i ++)
                 {
                   if (CoordY >= 270) 
                   {
                     doc.addPage();
                     CoordY = 20;
                     doc.setFontSize(8); 
                     doc.setFontType('bold');
                     doc.text(10,CoordY,'DATA');
                     doc.text(25,CoordY,'QNT');
                     doc.text(35,CoordY,'ISBN');
                     doc.text(55,CoordY,'TITOLO');
                     doc.text(110,CoordY,'DESCRIZIONE');
                   }
                   doc.setFontType('italic');
                   doc.setFontSize(7);
                   CoordY += 5;
                   var Q  = doc.getTextWidth('QNT');
                   var Qt = doc.getTextWidth(ListaMovimenti[i].QUANTITA);
                   doc.text(10,CoordY+10,ZFormatDateTime('dd/mm/yyyy',ZDateFromHTMLInput(ListaMovimenti[i].DATA)));
                   doc.text(25 + Q + 1 - Qt,CoordY+10,ListaMovimenti[i].QUANTITA);
                   doc.text(35,CoordY+10,ListaMovimenti[i].CODICE);
                   doc.text(55,CoordY+10,TroncaTitolo(ListaMovimenti[i].NOME_TITOLO,30));
                   doc.text(110,CoordY+10,ListaMovimenti[i].DESCRIZIONE);
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
                 var doc = new jsPDF();
                 doc.setProperties({title: 'STAMPA LOG'});
                 doc.setFontSize(10); 
                 doc.setFontType('bold');
                 doc.setTextColor(255,0,0);
                 doc.text(60,20,'NESSUN MOVIMENTO NELLA DATA SELEZIONATA');
                 //document.getElementById('logPdf').src = doc.output('datauristring')ù
                 doc.save('storageLogPdf.pdf',{});
             }
             else
             {  
                 for(let i = 0;i < ListaMovimenti.length;i ++)                 
                     ListaMovimenti[i] = {
                                           CODICE      : ListaMovimenti[i].CODICE == undefined ? 'N.D' : ListaMovimenti[i].CODICE, 
                                           TITOLO      : ListaMovimenti[i].TITOLO == undefined ? 'N.D' : ListaMovimenti[i].TITOLO, 
                                           NOME_TITOLO : ListaMovimenti[i].NOME_TITOLO == undefined ? 'N.D' : ListaMovimenti[i].NOME_TITOLO,  
                                           QUANTITA    : ListaMovimenti[i].QUANTITA == undefined ? 'N.D' : ListaMovimenti[i].QUANTITA,
                                           DESCRIZIONE : ListaMovimenti[i].DESCRIZIONE == undefined ? 'N.D' : ListaMovimenti[i].DESCRIZIONE, 
                                           DATA        : ListaMovimenti[i].DATA == undefined ? 'N.D' : ListaMovimenti[i].DATA
                                         }              
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
                   if (CoordY >= 270) 
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
                 var doc = new jsPDF();
                 doc.setProperties({title: 'STAMPA LOG'});
                 doc.setFontSize(10); 
                 doc.setFontType('bold');
                 doc.setTextColor(255,0,0);
                 doc.text(60,20,'NESSUN MOVIMENTO NELLA DATA SELEZIONATA');
                 //document.getElementById('logPdf').src = doc.output('datauristring')
                 doc.save('storageLogPdf.pdf',{});
             }
             else
             {   
                 for(let i = 0;i < ListaMovimenti.length;i ++)                 
                     ListaMovimenti[i] = {
                                           CODICE      : ListaMovimenti[i].CODICE == undefined ? 'N.D' : ListaMovimenti[i].CODICE, 
                                           TITOLO      : ListaMovimenti[i].TITOLO == undefined ? 'N.D' : ListaMovimenti[i].TITOLO, 
                                           NOME_TITOLO : ListaMovimenti[i].NOME_TITOLO == undefined ? 'N.D' : ListaMovimenti[i].NOME_TITOLO,  
                                           QUANTITA    : ListaMovimenti[i].QUANTITA == undefined ? 'N.D' : ListaMovimenti[i].QUANTITA,
                                           DESCRIZIONE : ListaMovimenti[i].DESCRIZIONE == undefined ? 'N.D' : ListaMovimenti[i].DESCRIZIONE, 
                                           DATA        : ListaMovimenti[i].DATA == undefined ? 'N.D' : ListaMovimenti[i].DATA
                                         }        
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
                 doc.text(110,CoordY+10,'DESCRIZIONE');
                 
                 for(let i = 0;i < ListaMovimenti.length;i ++)
                 {
                   if (CoordY >= 270) 
                   {
                     doc.addPage();
                     CoordY = 20;
                     doc.setFontSize(8); 
                     doc.setFontType('bold');
                     doc.text(10,CoordY,'DATA');
                     doc.text(25,CoordY,'QNT');
                     doc.text(35,CoordY,'ISBN');
                     doc.text(55,CoordY,'TITOLO');
                     doc.text(110,CoordY,'DESCRIZIONE');
                   }
                   doc.setFontType('italic');
                   doc.setFontSize(7);
                   CoordY += 5;
                   var Q  = doc.getTextWidth('QNT');
                   var Qt = doc.getTextWidth(ListaMovimenti[i].QUANTITA);
                   doc.text(10,CoordY+10,ZFormatDateTime('dd/mm/yyyy',ZDateFromHTMLInput(ListaMovimenti[i].DATA)));
                   doc.text(25 + Q + 1 - Qt,CoordY+10,ListaMovimenti[i].QUANTITA);
                   doc.text(35,CoordY+10,ListaMovimenti[i].CODICE);
                   doc.text(55,CoordY+10,TroncaTitolo(ListaMovimenti[i].NOME_TITOLO,30));
                   doc.text(110,CoordY+10,ListaMovimenti[i].DESCRIZIONE);
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