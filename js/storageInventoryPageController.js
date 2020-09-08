SIRIOApp.controller("storageInventoryPageController",['$scope','SystemInformation','$state','$rootScope','$mdDialog', function($scope,SystemInformation,$state,$rootScope,$mdDialog)
{  
  ScopeHeaderController.CheckButtons();

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
    var ListaTitoliTmp = SystemInformation.FindResults(Results,'BookList');
    for(let i = 0; i < ListaTitoliTmp.length; i++)
    ListaTitoliTmp[i] = {
                           CODICE     : ListaTitoliTmp[i].CODICE_ISBN,
                           TITOLO     : ListaTitoliTmp[i].TITOLO,
                           POS_MGZN   : ListaTitoliTmp[i].POS_MAGAZZINO == undefined ? 'N.D.' : ListaTitoliTmp[i].POS_MAGAZZINO,
                           Q_MGZN     : ListaTitoliTmp[i].QUANTITA_MGZN,
                           Q_MGZN_VOL : ListaTitoliTmp[i].QUANTITA_MGZN_VOL                         
                         }
    ListaTitoli  = ListaTitoliTmp;
    if (ListaTitoli != undefined)
    {
        var doc = new jsPDF();
        doc.setProperties({title: 'INVENTARIO MAGAZZINO ' + DataSpedizione});
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
        document.getElementById('inventoryPdf').src = doc.output('datauristring')
    }
    else SystemInformation.ApplyOnError('Modello titoli magazzino non conforme','');
  },'SelectTitoliSQL')

}]);