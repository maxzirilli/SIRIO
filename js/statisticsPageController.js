SIRIOApp.controller("statisticsPageController",['$scope','SystemInformation','$state','$mdDialog','ZConfirm', function($scope,SystemInformation,$state,$mdDialog,ZConfirm)
{ 
  $scope.NrAlunni               = 20;
  $scope.ListaStatistica        = [];
  $scope.ListaDate              = [];
  $scope.ListaPromotori         = []; 
  $scope.ListaIstituti          = [];
  $scope.ListaProvince          = [];
  $scope.ListaTitoli            = [];
  $scope.ListaGruppiIstituti    = [];
  $scope.ListaMaterie           = [];
  $scope.ListaGruppiEditoriali  = [];
  $scope.RegistraAdozVisible    = true;
  $scope.PromotoreFiltro        = -1;
  $scope.GruppoIstitutoFiltro   = -1;
  $scope.ProvinciaFiltro        = -1;
  $scope.TitoloFiltro           = -1;
  $scope.IstitutoFiltro         = -1;
  $scope.MateriaFiltro          = -1;
  $scope.GruppoEditorialeFiltro = -1;
  $scope.PrimaData              = -1;
  $scope.SecondaData            = null;
  $scope.RegistrazioneInCorso   = false;
  $scope.StatisticaPresente     = true;
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
                                             limit: 25,
                                             page: 1
                                           },
                         limitOptions    : [10, 25, 50, 100]
  };

  $scope.ConvertiData = function (Data)
  {
     return(ZFormatDateTime('dd/mm/yyyy',ZDateFromHTMLInput(Data)));
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
      $scope.TitoloFiltro = itemTit.Chiave;
    else $scope.TitoloFiltro = -1;
  }  
  
  $scope.queryIstituto = function(searchTextIstituto)
  {
     searchTextIstituto = searchTextIstituto.toUpperCase();
     return($scope.ListaIstituti.grep(function(Elemento) 
     { 
       return(Elemento.Nome.toUpperCase().indexOf(searchTextIstituto) != -1);
     }));
  }
  
  $scope.selectedItemChangeIstituto = function(itemIstituto)
  {
    if(itemIstituto != undefined)
      $scope.IstitutoFiltro = itemIstituto.Chiave
    else $scope.IstitutoFiltro = -1;
  }

  $scope.GetGruppiEditoriali = function()
  {
    SystemInformation.GetSQL('PublisherGroup', {}, function(Results)  
    {
      ListaGruppiEditorialiTmp = SystemInformation.FindResults(Results,'GroupInfoList');
      if(ListaGruppiEditorialiTmp != undefined)
      { 
         for(let i = 0;i < ListaGruppiEditorialiTmp.length;i ++)
             ListaGruppiEditorialiTmp[i] = {
                                             Chiave      : parseInt(ListaGruppiEditorialiTmp[i].CHIAVE),
                                             Descrizione : ListaGruppiEditorialiTmp[i].DESCRIZIONE
                                           }
         $scope.ListaGruppiEditoriali = ListaGruppiEditorialiTmp
         if($scope.ListaDate.length > 0)
         {
           $scope.SecondaData = $scope.ListaDate[0].DataStatistica;
           $scope.GeneraStatistica();
         }
         else $scope.StatisticaPresente = false;
      } 
      else SystemInformation.ApplyOnError('Modello gruppi editoriali non conforme','');   
    });
  }

  $scope.GetMaterie = function()
  {
    SystemInformation.GetSQL('Subject',{}, function(Results)
    {
      ListaMaterieTmp = SystemInformation.FindResults(Results,'SubjectInfoList');
      if (ListaMaterieTmp != undefined) 
      {
        for(let i = 0; i < ListaMaterieTmp.length; i++)
            ListaMaterieTmp[i] = {
                                   Chiave  : parseInt(ListaMaterieTmp[i].CHIAVE),
                                   Materia : ListaMaterieTmp[i].DESCRIZIONE
                                 }
        $scope.ListaMaterie = ListaMaterieTmp;
        $scope.GetGruppiEditoriali();
      }
      else SystemInformation.ApplyOnError('Modello materie non conforme','');     
    });
  }

  $scope.GetNrAlunni = function ()
  {
    SystemInformation.GetSQL('CompanyData',{}, function (Results)
    {
      DatiDitta = SystemInformation.FindResults(Results,'GetCompanyData');
      if (DatiDitta != undefined)
      {
        $scope.NrAlunni = parseInt(DatiDitta[0].NR_ALUNNI);
        $scope.GetMaterie();
      }
      else SystemInformation.ApplyOnError('Modello media numero alunni non conforme','');
    });
  }

  $scope.GetGruppiIstituti = function()
  {
    SystemInformation.GetSQL('InstituteType', {}, function(Results)  
    {
      ListaGruppiTmp = SystemInformation.FindResults(Results,'InstituteGroupInfo');
      if(ListaGruppiTmp != undefined)
      { 
         for(let i = 0;i < ListaGruppiTmp.length;i ++)
         ListaGruppiTmp[i] = {
                               Chiave      : parseInt(ListaGruppiTmp[i].CHIAVE),
                               Descrizione : ListaGruppiTmp[i].DESCRIZIONE
                             }
         $scope.ListaGruppiIstituti = ListaGruppiTmp;
         $scope.GetNrAlunni();
      }
      else SystemInformation.ApplyOnError('Modello gruppi istituti non conforme','');   
    },'SelectGroups');
  }
  
  $scope.GetTitoli = function()
  {
    SystemInformation.GetSQL('Book', {}, function(Results)  
    {  
      ListaTitoliTmp = SystemInformation.FindResults(Results,'BookListNoFilter');
      if(ListaTitoliTmp != undefined)
      { 
         for(let i = 0; i < ListaTitoliTmp.length; i++)
             ListaTitoliTmp[i] = { 
                                   Chiave : parseInt(ListaTitoliTmp[i].CHIAVE),
                                   Nome   : ListaTitoliTmp[i].TITOLO,
                                   Codice : ListaTitoliTmp[i].CODICE_ISBN
                                 }
         $scope.ListaTitoli  = ListaTitoliTmp;
         $scope.GetGruppiIstituti();
      }
      else SystemInformation.ApplyOnError('Modello titoli gestiti non conforme','');   
    },'SelectSQLNoFilter');
  }

  $scope.GetProvince = function()
  {
    SystemInformation.GetSQL('Accessories',{}, function(Results)
    {
      ListaProvinceTmp = SystemInformation.FindResults(Results,'ProvinceList');
      if (ListaProvinceTmp != undefined) 
      {
        for(let i = 0; i < ListaProvinceTmp.length; i++)
            ListaProvinceTmp[i] = {
                                    Chiave : parseInt(ListaProvinceTmp[i].CHIAVE),
                                    Nome   : ListaProvinceTmp[i].NOME
                                  }
        $scope.ListaProvince = ListaProvinceTmp;
        $scope.GetTitoli();
      }
      else SystemInformation.ApplyOnError('Modello province non conforme',''); 
    });
  }

  $scope.GetIstituti = function()
  {
    SystemInformation.GetSQL('Institute', {}, function(Results)  
    { 
      ListaIstitutiTmp = SystemInformation.FindResults(Results,'InstituteInfoListOnlyVisibile');
      if(ListaIstitutiTmp != undefined)
      {      
         for(let i = 0; i < ListaIstitutiTmp.length; i++)     
             ListaIstitutiTmp[i] = { 
                                     Chiave : parseInt(ListaIstitutiTmp[i].CHIAVE),
                                     Nome   : ListaIstitutiTmp[i].NOME
                                   }    
         $scope.ListaIstituti = ListaIstitutiTmp;
         $scope.GetProvince();
      }
      else SystemInformation.ApplyOnError('Modello istituti non conforme','');   
    },'SelectSQLOnlyVisible');
  }

  $scope.GetPromotori = function()
  {
    SystemInformation.GetSQL('User', {}, function(Results)  
    {
      ListaPromotoriTmp = SystemInformation.FindResults(Results,'UserInfoList');
      if(ListaPromotoriTmp != undefined)
      { 
        for(let i = 0;i < ListaPromotoriTmp.length;i ++)   
            ListaPromotoriTmp[i] = { 
                                       Chiave         : parseInt(ListaPromotoriTmp[i].CHIAVE),
                                       RagioneSociale : ListaPromotoriTmp[i].RAGIONE_SOCIALE,
                                       Username       : ListaPromotoriTmp[i].USERNAME,   
                                    };
          $scope.ListaPromotori = ListaPromotoriTmp;
          $scope.GetIstituti();
      }
      else SystemInformation.ApplyOnError('Modello promotori non conforme','');   
    });
  }

  $scope.GetDate = function()
  {
     SystemInformation.GetSQL('Statistics', {}, function(Results)  
     {
       ListaDateTmp = SystemInformation.FindResults(Results,'GetAllDates');
       if(ListaDateTmp != undefined)
       { 
         for(let i = 0;i < ListaDateTmp.length;i ++)
         {
             ListaDateTmp[i] = { 
                                  ChiaveTmp      : i,
                                  DataFormattata : $scope.ConvertiData(ListaDateTmp[i].DATA),
                                  DataStatistica : ListaDateTmp[i].DATA
                               };
         }
         $scope.ListaDate   = ListaDateTmp;
         /*if($scope.ListaDate.length == 0)
            $scope.SecondaData = null
         else $scope.SecondaData = $scope.ListaDate[0].DataStatistica;*/
         $scope.GetPromotori();     
       }
       else SystemInformation.ApplyOnError('Modello date statistiche precedenti conforme','');   
     },'SelecteDates');
  }

  $scope.GetAdozioniAttuali = function()
  {
    SystemInformation.GetSQL('Statistics', {}, function(Results)  
    {
      TmpStatistica = SystemInformation.FindResults(Results,'GetCurrentAdoptionState');
      if(TmpStatistica != undefined)
      { 
        for(let i = 0;i < TmpStatistica.length;i ++)
        {
            TmpStatistica[i] = { 
                                 ChiaveIstituto : TmpStatistica[i].K_IST == undefined ? -1 : parseInt(TmpStatistica[i].K_IST),
                                 CodiceIstituto : TmpStatistica[i].C_IST == undefined ? 'N.D.' : TmpStatistica[i].C_IST,
                                 NomeIstituto   : TmpStatistica[i].N_IST == undefined ? 'N.D.' : TmpStatistica[i].N_IST,
                                 ChiaveTitolo   : TmpStatistica[i].K_TIT == undefined ? -1 : parseInt(TmpStatistica[i].K_TIT),
                                 CodiceTitolo   : TmpStatistica[i].C_TIT == undefined ? 'N.D.' : TmpStatistica[i].C_TIT,
                                 NomeTitolo     : TmpStatistica[i].N_TIT == undefined ? 'N.D.' : TmpStatistica[i].N_TIT,
                                 PrezzoTitolo   : TmpStatistica[i].P_TIT == undefined ? '0.0' : TmpStatistica[i].P_TIT.replace(",", "."),
                                 ValoreAdozioni : 0.0,
                                 NrClassi       : TmpStatistica[i].CLS   == undefined ? 'N.D.' : parseInt(TmpStatistica[i].CLS),
                                 NrClassiPrec   : '-' 
                               };
            TmpStatistica[i].ValoreAdozioni = (parseFloat(TmpStatistica[i].PrezzoTitolo) * $scope.NrAlunni * TmpStatistica[i].NrClassi).toFixed(2).toString();
        }
        $scope.ListaStatistica = TmpStatistica;
        $scope.ListaStatistica.sort((a, b) => a.CodiceTitolo < b.CodiceTitolo ? -1 : 1).sort((a, b) => a.NomeTitolo < b.NomeTitolo ? -1 : 1).sort((a, b) => a.CodiceIstituto < b.CodiceIstituto ? -1 : 1).sort((a, b) => a.NomeIstituto < b.NomeIstituto ? -1 : 1);

        $scope.GetDate();
      }
      else SystemInformation.ApplyOnError('Modello stato adozioni attuale non conforme','');   
    });
  }

  $scope.GeneraStatistica = function()
  {
    if($scope.ListaDate.length != 0)
    {
      if($scope.SecondaData == null)
         $scope.SecondaData = $scope.ListaDate[0].DataStatistica;

      var ParamStatistica = {
                               FiltroPromotore   : $scope.PromotoreFiltro,     
                               FiltroGruppoIst   : $scope.GruppoIstitutoFiltro,
                               FiltroProvincia   : $scope.ProvinciaFiltro,     
                               FiltroTitolo      : $scope.TitoloFiltro,        
                               FiltroIstituto    : $scope.IstitutoFiltro,      
                               FiltroMateria     : $scope.MateriaFiltro,
                               FiltroGruppoEd    : $scope.GruppoEditorialeFiltro,     
                               PrimaStatistica   : $scope.PrimaData,        
                               SecondaStatistica : $scope.SecondaData  
                            };
      SystemInformation.ExecuteExternalScript('SIRIOExtraStatistics',ParamStatistica,function(Answer) 
      {
        var ListaAdozioniGenerata = Answer.StatisticaFinale;
        for (let i = 0;i < ListaAdozioniGenerata.length;i ++)
        {
             ListaAdozioniGenerata[i] = { 
                                          ChiaveIstituto : ListaAdozioniGenerata[i].K_IST == undefined ? -1 : parseInt(ListaAdozioniGenerata[i].K_IST),
                                          CodiceIstituto : ListaAdozioniGenerata[i].C_IST == undefined ? 'N.D.' : ListaAdozioniGenerata[i].C_IST,
                                          NomeIstituto   : ListaAdozioniGenerata[i].N_IST == undefined ? 'N.D.' : ListaAdozioniGenerata[i].N_IST,
                                          ChiaveTitolo   : ListaAdozioniGenerata[i].K_TIT == undefined ? -1 : parseInt(ListaAdozioniGenerata[i].K_TIT),
                                          CodiceTitolo   : ListaAdozioniGenerata[i].C_TIT == undefined ? 'N.D.' : ListaAdozioniGenerata[i].C_TIT,
                                          NomeTitolo     : ListaAdozioniGenerata[i].N_TIT == undefined ? 'N.D.' : ListaAdozioniGenerata[i].N_TIT,
                                          PrezzoTitolo   : ListaAdozioniGenerata[i].P_TIT == undefined ? '0.0' : ListaAdozioniGenerata[i].P_TIT.replace(",", "."),
                                          ValoreAdozioni : 0.0,
                                          NrClassi       : ListaAdozioniGenerata[i].CLS_A == undefined ? 'N.D.' : parseInt(ListaAdozioniGenerata[i].CLS_A),
                                          NrClassiPrec   : ListaAdozioniGenerata[i].CLS_B == undefined ? 'N.D.' : parseInt(ListaAdozioniGenerata[i].CLS_B),
                                        };
              ListaAdozioniGenerata[i].ValoreAdozioni = (parseFloat(ListaAdozioniGenerata[i].PrezzoTitolo) * $scope.NrAlunni * ListaAdozioniGenerata[i].NrClassi).toFixed(2).toString()
        };
        ListaAdozioniGenerata.sort((a, b) => a.CodiceTitolo < b.CodiceTitolo ? -1 : 1).sort((a, b) => a.NomeTitolo < b.NomeTitolo ? -1 : 1).sort((a, b) => a.CodiceIstituto < b.CodiceIstituto ? -1 : 1).sort((a, b) => a.NomeIstituto < b.NomeIstituto ? -1 : 1);
        $scope.ListaStatistica = ListaAdozioniGenerata;
      }); 
    }
    else ZCustomAlert($mdDialog,'ATTENZIONE','Non è presente nessuna statistica di confronto!');   
  }

  $scope.EliminaStatistica = function()
  {
    var EliminaStat = function()
    {
       var $ObjQuery = {Operazioni : []};
       $ObjQuery.Operazioni.push({
                                   Query     : 'DeleteStatistic',
                                   Parametri : { DATA : $scope.SecondaData }
                                 });
       SystemInformation.PostSQL('Statistics',$ObjQuery,function(Answer)
       {
          ZCustomAlert($mdDialog,'OK!',"LA STATISTICA SELEZIONATA E' STATA ELIMINATA");
          $scope.GetAdozioniAttuali();
       });
    };
    if($scope.SecondaData != null)
    {
       StatisticaIndex = $scope.ListaDate.findIndex(function(AStatistica){return(AStatistica.DataStatistica == $scope.SecondaData)});
       if(StatisticaIndex != -1)
          ZConfirm.GetConfirmBox('AVVISO','Eliminare la statistica relativa alla data ' + $scope.ListaDate[StatisticaIndex].DataFormattata + ' ?',EliminaStat,function(){});
    }
    else ZCustomAlert($mdDialog,'ATTENZIONE','Non è stata selezionata nessuna statistica!');
  }

  $scope.EsportaStatisticaXls = function()
  {
    var NomeDocumento = "STATISTICA";
    if($scope.PrimaData == -1)
       NomeDocumento += '_ATTUALE'
    else 
    {
       StatisticaIndex_1 = $scope.ListaDate.findIndex(function(AStatistica){return(AStatistica.DataStatistica == $scope.PrimaData)});
       if(StatisticaIndex_1 != -1)
          NomeDocumento += '_' + $scope.ListaDate[StatisticaIndex_1].DataFormattata;
    }
    if($scope.PrimaData == -1 && $scope.SecondaData == null)
       NomeDocumento = 'ADOZIONI_ATTUALI';
    
    StatisticaIndex_2 = $scope.ListaDate.findIndex(function(AStatistica){return(AStatistica.DataStatistica == $scope.SecondaData)});
    if(StatisticaIndex_2 != -1)
       NomeDocumento += '_' + $scope.ListaDate[StatisticaIndex_2].DataFormattata; 
    
    var WBook = {
                  SheetNames : [],
                  Sheets     : {}
                };

    var SheetName          = NomeDocumento;
    var BodySheet          = {};
    
    BodySheet['A1'] = SystemInformation.GetCellaIntestazione('CODICE ISTITUTO');
    BodySheet['B1'] = SystemInformation.GetCellaIntestazione('NOME ISTITUTO');
    BodySheet['C1'] = SystemInformation.GetCellaIntestazione('CODICE ISBN');
    BodySheet['D1'] = SystemInformation.GetCellaIntestazione('TITOLO');
    BodySheet['E1'] = SystemInformation.GetCellaIntestazione('VALORE ADOZIONI');
    BodySheet['F1'] = SystemInformation.GetCellaIntestazione('CLASSI 1');
    BodySheet['G1'] = SystemInformation.GetCellaIntestazione('CLASSI 2');

    for(let i = 0;i < $scope.ListaStatistica.length;i ++)
    {
          BodySheet['A' + parseInt(i + 2)] = SystemInformation.GetCellaDati('s', $scope.ListaStatistica[i].CodiceIstituto);
          BodySheet['B' + parseInt(i + 2)] = SystemInformation.GetCellaDati('s', $scope.ListaStatistica[i].NomeIstituto);          
          BodySheet['C' + parseInt(i + 2)] = SystemInformation.GetCellaDati('s', $scope.ListaStatistica[i].CodiceTitolo);
          BodySheet['D' + parseInt(i + 2)] = SystemInformation.GetCellaDati('s', $scope.ListaStatistica[i].NomeTitolo);
          BodySheet['E' + parseInt(i + 2)] = SystemInformation.GetCellaDati('s', $scope.ListaStatistica[i].ValoreAdozioni.toString());
          BodySheet['F' + parseInt(i + 2)] = SystemInformation.GetCellaDati('s', $scope.ListaStatistica[i].NrClassi.toString());
          BodySheet['G' + parseInt(i + 2)] = SystemInformation.GetCellaDati('s', $scope.ListaStatistica[i].NrClassiPrec.toString());   
    }

    BodySheet["!cols"] = [ 
                          {wpx: 250},            
                          {wpx: 250},
                          {wpx: 250},
                          {wpx: 250},
                          {wpx: 250},
                          {wpx: 250},
                          {wpx: 250}
                        ];

    BodySheet['!ref'] = 'A1:G1' + parseInt($scope.ListaStatistica.length + 1);
    
    WBook.SheetNames.push(SheetName);
    WBook.Sheets[SheetName] = BodySheet;

    var wbout = XLSX.write(WBook, {bookType:'xlsx', bookSST:true, type: 'binary'});
    saveAs(new Blob([SystemInformation.s2ab(wbout)],{type:"application/octet-stream"}), NomeDocumento + ".xlsx");

  }

  $scope.RegistraStatoAdozioni = function()
  { 
     var RegistraDati = function()
     {
       $scope.RegistrazioneInCorso = true;
       var $ObjQuery = {Operazioni : []};
       $ObjQuery.Operazioni.push({
                                   Query     : 'DeleteTodayStatistic',
                                   Parametri : {}
                                 });

       SystemInformation.PostSQL('Statistics',$ObjQuery,function(Answer)
       {
         $ObjQuery = {Operazioni : []};
         for(let i = 0;i < $scope.ListaStatistica.length;i ++)
         {
           var ParamElemento = {
                                 TITOLO    : $scope.ListaStatistica[i].ChiaveTitolo,
                                 ISTITUTO  : $scope.ListaStatistica[i].ChiaveIstituto,
                                 NR_CLASSI : $scope.ListaStatistica[i].NrClassi,
                                 DATA      : new Date()                        
                               };
           $ObjQuery.Operazioni.push({
                                       Query     : 'SaveStatisticRow',
                                       Parametri : ParamElemento
                                     });
         }
         SystemInformation.PostSQL('Statistics',$ObjQuery,function(Answer)
         {
           $ObjQuery = {Operazioni : []};
           ZCustomAlert($mdDialog,'OK!',"LO STATO DELLE ADOZIONI ATTUALI E' STATO SALVATO CORRETTAMENTE.");
           $scope.GetAdozioniAttuali();
           $scope.RegistrazioneInCorso = false;
           $scope.StatisticaPresente   = true;
         });
       });
     }
     ZConfirm.GetConfirmBox('AVVISO','Sei sicuro di voler registrare lo stato attuale delle adozioni?',RegistraDati,function(){});
  }

  $scope.GetAdozioniAttuali();

}]);