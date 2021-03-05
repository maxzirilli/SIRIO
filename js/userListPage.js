SIRIOApp.controller("userListPageController",['$scope','SystemInformation','$state','$rootScope','$mdDialog','ZConfirm', function($scope,SystemInformation,$state,$rootScope,$mdDialog,ZConfirm)
{ 

  $scope.ListaUtenti     = [];
  $scope.EditingOn       = false;
  $scope.UtenteInEditing = {};
  $scope.NuovoUtente     = false;
  $scope.MyKey           = [];
  $scope.ListaOrdinamenti = [{Sigla:'A',Descrizione:"ALFABETICO"},{Sigla:'M',Descrizione:"MATERIA"}];
  $scope.NrMedioAlunni  = 20;
  
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
  
  $scope.RefreshListaUtenti = function ()
  {
    SystemInformation.GetSQL('User', {}, function(Results)  
    {
      UtentiInfoList = SystemInformation.FindResults(Results,'UserInfoList');
      $scope.MyKey   = SystemInformation.FindResults(Results,'MyUserKey');
      if(UtentiInfoList != undefined && $scope.MyKey != undefined)
      { 
        for(let i = 0;i < UtentiInfoList.length;i ++)
       
            UtentiInfoList[i] = { 
                                   Chiave         : UtentiInfoList[i].CHIAVE,
                                   RagioneSociale : UtentiInfoList[i].RAGIONE_SOCIALE,
                                   Username       : UtentiInfoList[i].USERNAME,   
                                   Email          : UtentiInfoList[i].EMAIL,  
                                   Ruolo          : UtentiInfoList[i].ROLE,
                                   Ordinamento    : UtentiInfoList[i].ORDINAMENTO_DOC
                                };
          
          $scope.ListaUtenti = UtentiInfoList;
      }
      else SystemInformation.ApplyOnError('Modello utente non conforme','');   
    });
  }
  
  $scope.ModificaUtente = function(Utente)
  {
    $scope.EditingOn   = true;

    $scope.UtenteInEditing.CHIAVE          = Utente.Chiave;
    $scope.UtenteInEditing.USERNAME        = Utente.Username;
    $scope.UtenteInEditing.EMAIL           = Utente.Email;
    $scope.UtenteInEditing.ROLE            = Utente.Ruolo;
    $scope.UtenteInEditing.RAGIONE_SOCIALE = Utente.RagioneSociale;
    $scope.UtenteInEditing.ORDINAMENTO_DOC = Utente.Ordinamento;
  }
  
  $scope.NuovoUtente = function()
  { 
    $scope.EditingOn   = true;
    
    $scope.UtenteInEditing = {
                               CHIAVE          : -1,
                               USERNAME        : '',
                               RAGIONE_SOCIALE : '',
                               EMAIL           : '',
                               ROLE            : 0,
                               ORDINAMENTO_DOC : 'A'      
                             }
  }
  
  $scope.OnAnnullaUtenteClicked = function()
  {
    $scope.EditingOn = false;
    $scope.RefreshListaUtenti();
  } 
  
  $scope.ConfermaUtente = function()
  {       
     var $ObjQuery = { Operazioni : [] };          
     var ParamUtente = {
                         CHIAVE          : $scope.UtenteInEditing.CHIAVE,
                         USERNAME        : $scope.UtenteInEditing.USERNAME,
                         RAGIONE_SOCIALE : $scope.UtenteInEditing.RAGIONE_SOCIALE,
                         EMAIL           : $scope.UtenteInEditing.EMAIL,
                         ROLE            : $scope.UtenteInEditing.ROLE,
                         ORDINAMENTO_DOC : $scope.UtenteInEditing.ORDINAMENTO_DOC
                       };
                     
     var NuovoUtente = ($scope.UtenteInEditing.CHIAVE == -1);
     if(NuovoUtente)     
     { 
          
       $ObjQuery.Operazioni.push({
                                   Query     : 'InsertUser',
                                   Parametri : ParamUtente
                                 }); 
     }
     else
     {
       $ObjQuery.Operazioni.push({
                                   Query     : 'UpdateUser',
                                   Parametri : ParamUtente
                                 });
     };
  
     SystemInformation.PostSQL('User',$ObjQuery,function(Answer)
     {
       $scope.EditingOn = false;
       $scope.RefreshListaUtenti();
     });  
  }
  
  $scope.EliminaUtente = function(Utente)
  {
    if (Utente.Chiave == $scope.MyKey[0].CHIAVE)
    {
        ZCustomAlert($mdDialog,'ATTENZIONE','IMPOSSIBILE ELIMINARE IL PROPRIO ACCOUNT DA QUESTA POSIZIONE');
        return
    }
    else
    {
        var EliminaUser = function()
        {
          var $ObjQuery = { Operazioni : [] };
          var ParamUtente = { CHIAVE : Utente.Chiave };
           
          $ObjQuery.Operazioni.push({
                                      Query     : 'DeleteUser',
                                      Parametri : ParamUtente
                                    });
                                    
          SystemInformation.PostSQL('User',$ObjQuery,function(Answer)
          {
            $scope.RefreshListaUtenti();
          });  
        }
        ZConfirm.GetConfirmBox('AVVISO','Eliminare l\'utente: ' + Utente.Username + ' ?',EliminaUser,function(){});
    }
  }

  function CreaStatisticaXls(StatisticaFinale)
  { 
    var WBook = {
                  SheetNames : [],
                  Sheets     : {}
                };

    var SheetName          = "STATISTICA PROMOTORI";
    var BodySheet          = {};
    
    BodySheet['A1'] = SystemInformation.GetCellaIntestazione('PROMOTORE');
    BodySheet['B1'] = SystemInformation.GetCellaIntestazione('ISTITUTO');
    BodySheet['C1'] = SystemInformation.GetCellaIntestazione('ISBN');
    BodySheet['D1'] = SystemInformation.GetCellaIntestazione('TOTALE');
    
    var ChiavePrmt = -1;
    var ChiaveIst  = -1;
    var TotaleIst  = 0;
    var TotalePrmt = 0;
    var TotaleTuttiPrmt = 0;
    var j = 0;

    for(let i = 0;i < StatisticaFinale.length;i ++)
    {
       if(StatisticaFinale[i].ChiavePromotore != ChiavePrmt)
       {
          if(i != 0)
          {
             j++;
             BodySheet['D' + parseInt(j + 1)] = SystemInformation.GetCellaDati('s',TotalePrmt.toFixed(2).toString());
             TotaleTuttiPrmt = TotaleTuttiPrmt + TotalePrmt;
             TotalePrmt = 0;
             BodySheet['A' + parseInt(j + 3)] = SystemInformation.GetCellaDati('s',StatisticaFinale[i].NomePromotore);
          }
          else BodySheet['A' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',StatisticaFinale[i].NomePromotore);
       }
       if(StatisticaFinale[i].ChiaveIstituto != ChiaveIst)
       {
          if(i != 0)
          {
             j++;
             BodySheet['D' + parseInt(j + 1)] = SystemInformation.GetCellaDati('s',TotaleIst.toFixed(2).toString())
             TotaleIst = 0;
          }
          BodySheet['B' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',StatisticaFinale[i].NomeIstituto);
       }
       BodySheet['C' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',StatisticaFinale[i].CodiceTitolo);
       BodySheet['D' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',(StatisticaFinale[i].NumeroAdozioniIst*StatisticaFinale[i].PrezzoTitolo*$scope.NrMedioAlunni).toString());
       TotaleIst = TotaleIst + (StatisticaFinale[i].NumeroAdozioniIst*StatisticaFinale[i].PrezzoTitolo*$scope.NrMedioAlunni);
       TotalePrmt = TotalePrmt + (StatisticaFinale[i].NumeroAdozioniIst*StatisticaFinale[i].PrezzoTitolo*$scope.NrMedioAlunni);      
       j++;

       if(i == StatisticaFinale.length - 1)
       {
          j++;
          BodySheet['D' + parseInt(j + 1)] = SystemInformation.GetCellaDati('s',TotaleIst.toFixed(2).toString())
          TotaleIst = 0;
          j++;
          BodySheet['D' + parseInt(j + 1)] = SystemInformation.GetCellaDati('s',TotalePrmt.toFixed(2).toString());
          TotaleTuttiPrmt = TotaleTuttiPrmt + TotalePrmt;
          TotalePrmt = 0;
       }

       ChiavePrmt = StatisticaFinale[i].ChiavePromotore;
       ChiaveIst  = StatisticaFinale[i].ChiaveIstituto;
    }
    
    j++;
    BodySheet['D' + parseInt(j + 1)] = SystemInformation.GetCellaDati('s',TotaleTuttiPrmt.toFixed(2).toString())

    BodySheet["!cols"] = [ 
                          {wpx: 250},            
                          {wpx: 250},
                          {wpx: 250},
                          {wpx: 250}
                        ];

    BodySheet['!ref'] = 'A1:D1' + parseInt(StatisticaFinale.length + 1) + j;
    
    WBook.SheetNames.push(SheetName);
    WBook.Sheets[SheetName] = BodySheet;

    var Data           = new Date();
    var DataAnno       = Data.getFullYear();
    var DataMese       = Data.getMonth()+1; 
    var DataGiorno     = Data.getDate();
    var DataStatistica = DataGiorno.toString() + '/' + DataMese.toString() +  '/' + DataAnno.toString();

    var wbout = XLSX.write(WBook, {bookType:'xlsx', bookSST:true, type: 'binary'});
    saveAs(new Blob([SystemInformation.s2ab(wbout)],{type:"application/octet-stream"}), 'StatisticaPromotori' + DataStatistica + ".xlsx");
  }

  $scope.ApriStatisticaXls = function(ev)
  {    
      $mdDialog.show({ 
                       controller          : DialogControllerXlsStatistica,
                       templateUrl         : "template/documentAdoptionStatisticsPopup.html",
                       targetEvent         : ev,
                       scope               : $scope,
                       preserveScope       : true,
                       clickOutsideToClose : true
                     })
      .then(function(answer) 
      {
      }, 
      function() 
      {
      });
  }

  function DialogControllerXlsStatistica($scope,$mdDialog)
  {
    $scope.DataRicercaAl    = new Date();
    let TmpDate             = new Date($scope.DataRicercaAl);
    var AnnoCorrente        = new Date().getFullYear();
    $scope.DataRicercaDal   = new Date(AnnoCorrente, 0, 1)

    $scope.hide = function() 
    {
      $mdDialog.hide();
    };

    $scope.AnnullaPopupStatistica = function() 
    {
      $scope.DataRicercaAl    = new Date();
      let TmpDate             = new Date($scope.DataRicercaAl);
      TmpDate.setDate(TmpDate.getDate() - 30);
      $scope.DataRicercaDal   = new Date(TmpDate);
      $scope.ListaGruppiToAdd     = [];
      $mdDialog.cancel();
    };

    $scope.ConfermaXlsStatistica = function()
    { 
      if($scope.DataRicercaDal == undefined || $scope.DataRicercaAl == undefined)
      return;
      
      //let TmpDate = new Date($scope.DataRicercaAl);
      //TmpDate.setDate($scope.DataRicercaAl.getDate() + 1);
      var ParamStatistica = {
                              DataDal : ZHTMLInputFromDate($scope.DataRicercaDal), 
                              DataAl  : ZHTMLInputFromDate($scope.DataRicercaAl) //TmpDate
                            };
      SystemInformation.GetSQL('User',ParamStatistica,function(Results)
      {
        var StatisticaFinale = [];
        StatisticaTmp = SystemInformation.FindResults(Results,'GetUserStatistics')
        if (StatisticaTmp != undefined)
        {
          if(StatisticaTmp.length == 0)
              ZCustomAlert($mdDialog,'AVVISO','NESSUN FATTURATO NELLA DATA INDICATA')
          else
          {
            $scope.NrMedioAlunni = parseInt(StatisticaTmp[0].NR_ALUNNI);

            for(let i = 0;i < StatisticaTmp.length;i ++)
            StatisticaTmp[i] = {
                                 ChiavePromotore   :  parseInt(StatisticaTmp[i].PROMOTORE),
                                 NomePromotore     : StatisticaTmp[i].RAGIONE_SOCIALE,
                                 ChiaveIstituto    :  parseInt(StatisticaTmp[i].CHIAVE_ISTITUTO),
                                 NomeIstituto      : StatisticaTmp[i].NOME_ISTITUTO,
                                 CodiceTitolo      : StatisticaTmp[i].CODICE_ISBN,
                                 NomeTitolo        : StatisticaTmp[i].TITOLO,
                                 PrezzoTitolo      : StatisticaTmp[i].PREZZO.replace(",", "."),
                                 NumeroAdozioniIst : parseInt(StatisticaTmp[i].NUMERO_ADOZIONI_X_ISTITUTO)
                               }
            StatisticaFinale = StatisticaTmp           
            CreaStatisticaXls(StatisticaFinale)
            $mdDialog.hide();
          }
        }
        else SystemInformation.ApplyOnError("Modello statistica fatturato promotori non conforme","")
      },'SelectStatistica');       
    }
  }

  $scope.RefreshListaUtenti();
  
}]);