SIRIOApp.controller("storageLogPageController",['$scope','SystemInformation','$state','$rootScope','$mdDialog', function($scope,SystemInformation,$state,$rootScope,$mdDialog)
{
  $scope.DataRicercaAl     = new Date();
  let TmpDate              = new Date($scope.DataRicercaAl);
  TmpDate.setDate(TmpDate.getDate() - 7);
  $scope.DataRicercaDal    = new Date(TmpDate);
  $scope.TitoloFiltro      = undefined;
  $scope.Magazzino         = 'G';
  
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
  });
  
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
    $scope.TitoloFiltro = itemTit.Chiave;
  }

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
           var ListaMovimenti = SystemInformation.FindResults(Results,'GetLogInfoMgznBook');
           if(ListaMovimenti != undefined)
           {
             if (ListaMovimenti.length == 0)
                 alert('Nessun movimento del titolo nella data selezionata')
             else
             {
                 var Data           = new Date();
                 var DataAnno       = Data.getFullYear();
                 var DataMese       = Data.getMonth(); 
                 var DataGiorno     = Data.getDate();
                 var DataReport     = DataGiorno.toString() + '/' + DataMese.toString() +  '/' + DataAnno.toString();
               
                 var doc = new jsPDF();
                 doc.setFontSize(10); 
                 doc.setFontType('bold');
                 doc.text(10,20,'REPORT MOVIMENTI MAGAZZINO PRINCIPALE ' + DataReport + ' DEL TITOLO:');
                 doc.text(10,25,ListaMovimenti[0].NOME_TITOLO);
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
                   doc.text(10,CoordY+10,ListaMovimenti[i].DATA);
                   doc.text(30 + Q + 1 - Qt,CoordY+10,ListaMovimenti[i].QUANTITA);
                   doc.text(50,CoordY+10,ListaMovimenti[i].DESCRIZIONE);
                 } 
                 document.getElementById('logPdf').src = doc.output('datauristring');
                 $scope.TitoloFiltro = undefined;                
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
           var ListaMovimenti = SystemInformation.FindResults(Results,'GetLogInfoMgzn');
           if(ListaMovimenti != undefined)
           {
             if (ListaMovimenti.length == 0)
                 alert('Nessun movimento del titolo nella data selezionata')
             else
             {
                 var Data           = new Date();
                 var DataAnno       = Data.getFullYear();
                 var DataMese       = Data.getMonth(); 
                 var DataGiorno     = Data.getDate();
                 var DataReport     = DataGiorno.toString() + '/' + DataMese.toString() +  '/' + DataAnno.toString();
               
                 var doc = new jsPDF();
                 doc.setFontSize(10); 
                 doc.setFontType('bold');
                 doc.text(10,20,'REPORT MOVIMENTI GLOBALI MAGAZZINO PRINCIPALE ' + DataReport);
                 doc.setFontSize(8);
                 var CoordY = 30;
                 
                 doc.setFontSize(8); 
                 doc.setFontType('bold');
                 doc.text(10,CoordY+10,'DATA');
                 doc.text(30,CoordY+10,'QUANTITA');
                 doc.text(50,CoordY+10,'TITOLO');
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
                     doc.text(30,CoordY,'QUANTITA');
                     doc.text(50,CoordY,'TITOLO');
                     doc.text(150,CoordY,'DESCRIZIONE');
                   }
                   doc.setFontType('italic');
                   doc.setFontSize(7);
                   CoordY += 5;
                   var Q  = doc.getTextWidth('QUANTITA');
                   var Qt = doc.getTextWidth(ListaMovimenti[i].QUANTITA);
                   doc.text(10,CoordY+10,ListaMovimenti[i].DATA);
                   doc.text(30 + Q + 1 - Qt,CoordY+10,ListaMovimenti[i].QUANTITA);
                   doc.text(50,CoordY+10,ListaMovimenti[i].NOME_TITOLO);
                   doc.text(150,CoordY+10,ListaMovimenti[i].DESCRIZIONE);
                 } 
                 document.getElementById('logPdf').src = doc.output('datauristring');
                 $scope.TitoloFiltro = undefined;
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
           var ListaMovimenti = SystemInformation.FindResults(Results,'GetLogInfoMgznVolBook');
           if(ListaMovimenti != undefined)
           {
             if (ListaMovimenti.length == 0)
                 alert('Nessun movimento del titolo nella data selezionata')
             else
             {                
                 var Data           = new Date();
                 var DataAnno       = Data.getFullYear();
                 var DataMese       = Data.getMonth(); 
                 var DataGiorno     = Data.getDate();
                 var DataReport     = DataGiorno.toString() + '/' + DataMese.toString() +  '/' + DataAnno.toString();
               
                 var doc = new jsPDF();
                 doc.setFontSize(10); 
                 doc.setFontType('bold');
                 doc.text(10,20,'REPORT MOVIMENTI MAGAZZINO VOLANTE ' + DataReport + ' DEL TITOLO:');
                 doc.text(10,25,ListaMovimenti[0].NOME_TITOLO);
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
                   doc.text(10,CoordY+10,ListaMovimenti[i].DATA);
                   doc.text(30 + Q + 1 - Qt,CoordY+10,ListaMovimenti[i].QUANTITA);
                   doc.text(50,CoordY+10,ListaMovimenti[i].DESCRIZIONE);
                 } 
                document.getElementById('logPdf').src = doc.output('datauristring');
                $scope.TitoloFiltro = undefined;
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
           var ListaMovimenti = SystemInformation.FindResults(Results,'GetLogInfoMgznVol');
           if(ListaMovimenti != undefined)
           {
             if (ListaMovimenti.length == 0)
                 alert('Nessun movimento del titolo nella data selezionata')
             else
             {           
                 var Data           = new Date();
                 var DataAnno       = Data.getFullYear();
                 var DataMese       = Data.getMonth(); 
                 var DataGiorno     = Data.getDate();
                 var DataReport     = DataGiorno.toString() + '/' + DataMese.toString() +  '/' + DataAnno.toString();
               
                 var doc = new jsPDF();
                 doc.setFontSize(10); 
                 doc.setFontType('bold');
                 doc.text(10,20,'REPORT MOVIMENTI GLOBALI MAGAZZINO VOLANTE ' + DataReport);
                 doc.setFontSize(8);
                 var CoordY = 30;
                 
                 doc.setFontSize(8); 
                 doc.setFontType('bold');
                 doc.text(10,CoordY+10,'DATA');
                 doc.text(30,CoordY+10,'QUANTITA');
                 doc.text(50,CoordY+10,'TITOLO');
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
                     doc.text(30,CoordY,'QUANTITA');
                     doc.text(50,CoordY,'TITOLO');
                     doc.text(150,CoordY,'DESCRIZIONE');
                   }
                   doc.setFontType('italic');
                   doc.setFontSize(7);
                   CoordY += 5;
                   var Q  = doc.getTextWidth('QUANTITA');
                   var Qt = doc.getTextWidth(ListaMovimenti[i].QUANTITA);
                   doc.text(10,CoordY+10,ListaMovimenti[i].DATA);
                   doc.text(30 + Q + 1 - Qt,CoordY+10,ListaMovimenti[i].QUANTITA);
                   doc.text(50,CoordY+10,ListaMovimenti[i].NOME_TITOLO);
                   doc.text(150,CoordY+10,ListaMovimenti[i].DESCRIZIONE);
                 } 
                document.getElementById('logPdf').src = doc.output('datauristring');
                $scope.TitoloFiltro = undefined;
             }
           }
           else SystemInformation.ApplyOnError('Modello movimenti globali magazzino volante non valido','');         
         },'SelectLogMgznVolSQL')          
       }   
    } 
  }    
}]);