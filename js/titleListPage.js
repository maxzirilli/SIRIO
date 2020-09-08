SIRIOApp.controller("titleListPageController",['$scope','SystemInformation','$state','$rootScope','$mdDialog', function($scope,SystemInformation,$state,$rootScope,$mdDialog)
{
  $scope.EditingOn            = false;
  $scope.StampaOn             = false;
  $scope.TitoloInEditing      = {};
  $scope.MateriaFiltro        = -1;
  $scope.NomeFiltro           = '';
  $scope.CodiceFiltro         = '';
  $scope.ListaTitoli          = [];
  $scope.IstitutoDaAssociare  = -1;
  $scope.IstitutoFiltrato     = -1;
  $scope.SelectVolumiTitolo   = ['UNICO'];
  
  
  for(let i = 1;i < VOLUME_MASSIMO;i ++)
  {
      i = i.toString();
      $scope.SelectVolumiTitolo.push(i);
  }  
  
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
                       
  $scope.GridOptions2 = {
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
                         

  SystemInformation.GetSQL('Subject',{}, function(Results)
  {
    ListaMaterieOpt = SystemInformation.FindResults(Results,'SubjectInfoList');
    if (ListaMaterieOpt != undefined) 
    {
      for(let i = 0; i < ListaMaterieOpt.length; i++)
          ListaMaterieOpt[i] = {
                                 Chiave  : ListaMaterieOpt[i].CHIAVE,
                                 Materia : ListaMaterieOpt[i].DESCRIZIONE
                               }
      $scope.ListaMaterie = ListaMaterieOpt;
    }
    else SystemInformation.ApplyOnError('Modello materie non conforme','');     
  });

  
  SystemInformation.GetSQL('Institute', {}, function(Results)  
  {  
    IstitutiInfoLista = SystemInformation.FindResults(Results,'InstituteInfoList');
    if(IstitutiInfoLista != undefined)
    { 
       for(let i = 0; i < IstitutiInfoLista.length; i++)
           IstitutiInfoLista[i] = { 
                                    Chiave   : IstitutiInfoLista[i].CHIAVE,
                                    Istituto : IstitutiInfoLista[i].NOME
                                  }
       $scope.ListaIstitutiPopup = IstitutiInfoLista;
       $scope.ListaIstituti = IstitutiInfoLista;
    }
    else SystemInformation.ApplyOnError('Modello istituti non conforme','');   
  });
  
  $scope.queryIstituto = function(searchTextIstituto)
  {
     searchTextIstituto = searchTextIstituto.toUpperCase();
     return($scope.ListaIstituti.grep(function(Elemento) 
     { 
       return(Elemento.Istituto.toUpperCase().indexOf(searchTextIstituto) != -1);
     }));
  }
  
  $scope.selectedItemChangeIstituto = function(itemIstituto)
  {
    if(itemIstituto != undefined)
       $scope.IstitutoFiltrato = itemIstituto.Chiave;
    else $scope.IstitutoFiltrato = -1;
    $scope.RefreshListaTitoli();
  } 
  
  $scope.RefreshListaTitoli = function()
  {
    var ObjParametri = {};

    if($scope.IstitutoFiltrato != -1)
       ObjParametri.FiltroI = $scope.IstitutoFiltrato;

    SystemInformation.GetSQL('Book', ObjParametri, function(Results)  
    {
      TitoliInfoLista = SystemInformation.FindResults(Results,'BookInfoList');
      if(TitoliInfoLista != undefined)
      { 
         for (let i = 0;i < TitoliInfoLista.length; i ++) 
         {
           TitoliInfoLista[i] = { 
                                  Chiave             : TitoliInfoLista[i].CHIAVE,
                                  Codice             : TitoliInfoLista[i].CODICE_ISBN,
                                  Titolo             : TitoliInfoLista[i].TITOLO,
                                  Materia            : TitoliInfoLista[i].MATERIA,
                                  NomeMateria        : TitoliInfoLista[i].NOME_MATERIA,
                                  Pos_Magazzino      : TitoliInfoLista[i].POS_MAGAZZINO == null ? 'N.D.' : TitoliInfoLista[i].POS_MAGAZZINO,
                                  Autori             : TitoliInfoLista[i].AUTORI,
                                  Q_Magazzino        : TitoliInfoLista[i].QUANTITA_MGZN == undefined ? 0 : TitoliInfoLista[i].QUANTITA_MGZN,
                                  Q_MagazzinoVolante : TitoliInfoLista[i].QUANTITA_MGZN_VOL == undefined ? 0 : TitoliInfoLista[i].QUANTITA_MGZN_VOL
                                };
         }
         $scope.ListaTitoli = TitoliInfoLista;
      }
      else SystemInformation.ApplyOnError('Modello titoli non conforme','');   
    });
  }
  
  $scope.StampaAdozioni = function (Titolo)
  {
    $scope.StampaOn  = true;
    $scope.EditingOn = false;
    SystemInformation.GetSQL('Book', {CHIAVE : Titolo.Chiave}, function(Results)
    {
      var TitoloInStampa = {};
      Istituti           = SystemInformation.FindResults(Results,'BookInstitute');
      Adozioni           = SystemInformation.FindResults(Results,'BookAdoption');
      if(Istituti != undefined && Adozioni != undefined)
      {
         TitoloInStampa.ListaIstitutiTit = Istituti;
         TitoloInStampa.ListaIstitutiTit.forEach(function(Istituto){Istituto.Adozioni = []});
         
         for (let i = 0; i < TitoloInStampa.ListaIstitutiTit.length;i ++)
              for (let j = 0; j < Adozioni.length;j ++)
                   if (Adozioni[j].ISTITUTO == TitoloInStampa.ListaIstitutiTit[i].CHIAVE)
                       TitoloInStampa.ListaIstitutiTit[i].Adozioni.push(Adozioni[j]);
         if(TitoloInStampa.ListaIstitutiTit.length != 0)
         {
            var Data       = new Date();
            var DataAnno   = Data.getFullYear();
            var DataMese   = Data.getMonth()+1; 
            var DataGiorno = Data.getDate();
            var DataSpedizione = DataGiorno.toString() + '/' + DataMese.toString() +  '/' + DataAnno.toString();
          
            var doc = new jsPDF();
            doc.setProperties({title: 'ADOZIONI TITOLO ' + DataSpedizione});
            doc.setFontSize(10); 
            doc.setFontType('bold');
            doc.text(10,20,'ADOZIONI DEL TITOLO:');
            doc.text(10,25,Titolo.Titolo + ' (ISBN: ' + Titolo.Codice + ' )');
            doc.setFontSize(8);
            var CoordY = 35;
            
            for(let k = 0;k < TitoloInStampa.ListaIstitutiTit.length;k ++)
            {   
                if (CoordY >= 280) 
                {
                  doc.addPage();
                  CoordY = 20;
                }
                doc.setFontSize(8);
                doc.setFontType('bold');
                doc.text(10,CoordY+5,'ISTITUTO: ' + TitoloInStampa.ListaIstitutiTit[k].ISTITUTO);
                CoordY += 5;
                doc.setFontSize(7);
                doc.setFontType('italic'); 

                var StringaClassi = [];
                if(TitoloInStampa.ListaIstitutiTit[k].Adozioni.length == 0)
                {
                   StringaClassi.push('TITOLO ADOTTATO DA NESSUNA CLASSE');
                   doc.text(10,CoordY+5,StringaClassi.toString());
                }
                else
                {
                   //COSA FARE PER TORNARE A CAPO SE TROPPO LUNGA STRINGA CLASSI?
                   for(let l = 0;l < TitoloInStampa.ListaIstitutiTit[k].Adozioni.length;l ++)
                   {                                                 
                       StringaClassi.push(TitoloInStampa.ListaIstitutiTit[k].Adozioni[l].ANNO + TitoloInStampa.ListaIstitutiTit[k].Adozioni[l].SEZIONE);
                   }
                   doc.text(10,CoordY+5,'CLASSI: ' + StringaClassi.toString());
                }
                CoordY += 10;
                doc.setFontSize(6);
                doc.text(10,290,SystemInformation.VDocAdoption)               
            }           
            document.getElementById('adoptionPdf').src = doc.output('datauristring')
         }
         else
         {
            var Data       = new Date();
            var DataAnno   = Data.getFullYear();
            var DataMese   = Data.getMonth()+1; 
            var DataGiorno = Data.getDate();
            var DataSpedizione = DataGiorno.toString() + '/' + DataMese.toString() +  '/' + DataAnno.toString();
            var doc = new jsPDF();
            doc.setProperties({title: 'ADOZIONI TITOLO ' + DataSpedizione});
            doc.setFontSize(10); 
            doc.setFontType('bold');
            doc.setTextColor(255,0,0);
            doc.text(80,20,'TITOLO NON ADOTTATO IN NESSUN ISTITUTO');
            document.getElementById('adoptionPdf').src = doc.output('datauristring')
         }
      }
    },'SQLDettaglio')
  }
  
  $scope.GetAdozioniSelected = function(Istituto)
  {
    if($scope.TitoloInEditing.ListaIstitutiTit != undefined)
       for(let i = 0; i < $scope.TitoloInEditing.ListaIstitutiTit.length;i ++)
           if($scope.TitoloInEditing.ListaIstitutiTit[i].CHIAVE == Istituto)
              return($scope.TitoloInEditing.ListaIstitutiTit[i].Adozioni); 
    return([]);
  }

  $scope.ModificaTitolo = function (titolo)
  {
    $scope.EditingOn                                 = true;
    $scope.TitoloInEditing                           = {};
    $scope.TitoloInEditing.ListaIstitutiTitEliminati = [];
    $scope.TitoloInEditing.ListaAdozioniEliminate    = [];
    $scope.IstitutoVisualizzato                      = -1;
    
    SystemInformation.GetSQL('Book', {CHIAVE : titolo.Chiave}, function(Results)
    {
      TitoloDettaglio    = SystemInformation.FindResults(Results,'BookDettaglio');
      Istituti           = SystemInformation.FindResults(Results,'BookInstitute');
      AdozioniAll        = SystemInformation.FindResults(Results,'BookAdoption');

      if(TitoloDettaglio != undefined && Istituti != undefined && AdozioniAll != undefined)
      {
        $scope.TitoloInEditing.Chiave           = TitoloDettaglio[0].CHIAVE;
        $scope.TitoloInEditing.Codice           = TitoloDettaglio[0].CODICE_ISBN       == null ? '' : TitoloDettaglio[0].CODICE_ISBN;
        $scope.TitoloInEditing.Titolo           = TitoloDettaglio[0].TITOLO            == null ? '' : TitoloDettaglio[0].TITOLO;
        $scope.TitoloInEditing.Sottotitolo      = TitoloDettaglio[0].SOTTOTITOLO       == null ? '' : TitoloDettaglio[0].SOTTOTITOLO;
        $scope.TitoloInEditing.Materia          = TitoloDettaglio[0].MATERIA           == null ? -1 : TitoloDettaglio[0].MATERIA;
        $scope.TitoloInEditing.Autori           = TitoloDettaglio[0].AUTORI            == null ? '' : TitoloDettaglio[0].AUTORI;
        $scope.TitoloInEditing.Editore          = TitoloDettaglio[0].EDITORE           == null ? '' : TitoloDettaglio[0].EDITORE;
        $scope.TitoloInEditing.Volume           = TitoloDettaglio[0].VOLUME            == null ? 0  : parseInt(TitoloDettaglio[0].VOLUME);
        $scope.TitoloInEditing.Pos_Magazzino    = TitoloDettaglio[0].POS_MAGAZZINO     == null ? '' : TitoloDettaglio[0].POS_MAGAZZINO;
        $scope.TitoloInEditing.Prezzo           = TitoloDettaglio[0].PREZZO            == null ? '' : TitoloDettaglio[0].PREZZO;
        $scope.TitoloInEditing.Q_Mgzn           = TitoloDettaglio[0].QUANTITA_MGZN     == null ? 0  : parseInt(TitoloDettaglio[0].QUANTITA_MGZN);
        $scope.TitoloInEditing.Q_Mgzn_Vol       = TitoloDettaglio[0].QUANTITA_MGZN_VOL == null ? 0  : parseInt(TitoloDettaglio[0].QUANTITA_MGZN_VOL);        
        $scope.TitoloInEditing.ListaIstitutiTit = Istituti;
        $scope.TitoloInEditing.ListaIstitutiTit.forEach(function(Istituto){Istituto.Adozioni = []});

        for (let i = 0; i < $scope.TitoloInEditing.ListaIstitutiTit.length;i ++)
          for (let j = 0; j < AdozioniAll.length;j ++)
            if (AdozioniAll[j].ISTITUTO == $scope.TitoloInEditing.ListaIstitutiTit[i].CHIAVE)
                $scope.TitoloInEditing.ListaIstitutiTit[i].Adozioni.push(AdozioniAll[j]); 
        
        for (let i = 0; i < $scope.TitoloInEditing.ListaIstitutiTit.length;i ++)
          for (let j = 0; j < $scope.TitoloInEditing.ListaIstitutiTit[i].Adozioni.length;j ++)
          {
               $scope.TitoloInEditing.ListaIstitutiTit[i].Adozioni[j].Nuovo      = false;
               $scope.TitoloInEditing.ListaIstitutiTit[i].Adozioni[j].Modificato = false;
               $scope.TitoloInEditing.ListaIstitutiTit[i].Adozioni[j].Eliminato  = false;
          }
           
        if($scope.TitoloInEditing.ListaIstitutiTit.length > 0) 
           $scope.IstitutoVisualizzato = $scope.TitoloInEditing.ListaIstitutiTit[0].CHIAVE              
      }       
      else SystemInformation.ApplyOnError('Modello titolo non conforme',''); 
    },'SQLDettaglio'); 
  }
  
  $scope.NuovoTitolo = function()
  { 
    $scope.EditingOn       = true;    
    $scope.TitoloInEditing = {
                               Chiave           : -1,
                               Codice           : '',
                               Titolo           : '',
                               Sottotitolo      : '',
                               Materia          : -1,
                               Autori           : '',
                               Editore          : '',
                               Volume           : 0,
                               Pos_Magazzino    : '',
                               Prezzo           : '',
                               Q_Mgzn           : 0,
                               Q_Mgzn_Vol       : 0,
                               ListaIstitutiTit : []
                             };
  }
  
  $scope.OnAnnullaTitoloClicked = function()
  {
    $scope.EditingOn = false;
    $scope.RefreshListaTitoli();
  }
  
  $scope.ConfermaTitolo = function ()
  {
    var $ObjQuery    = { Operazioni : [] };
    var ParamTitolo  = {
                         CHIAVE            : $scope.TitoloInEditing.Chiave,
                         CODICE_ISBN       : $scope.TitoloInEditing.Codice.xSQL(),
                         TITOLO            : $scope.TitoloInEditing.Titolo.xSQL() == '' ? null : $scope.TitoloInEditing.Titolo.xSQL(),
                         SOTTOTITOLO       : $scope.TitoloInEditing.Sottotitolo.xSQL() == '' ? null : $scope.TitoloInEditing.Sottotitolo.xSQL(),
                         MATERIA           : $scope.TitoloInEditing.Materia.xSQL() == -1 ? null : $scope.TitoloInEditing.Materia.xSQL(),
                         AUTORI            : $scope.TitoloInEditing.Autori.xSQL() == '' ? null : $scope.TitoloInEditing.Autori.xSQL(),
                         EDITORE           : $scope.TitoloInEditing.Editore.xSQL() == '' ? null : $scope.TitoloInEditing.Editore.xSQL(),
                         VOLUME            : $scope.TitoloInEditing.Volume,
                         POS_MAGAZZINO     : $scope.TitoloInEditing.Pos_Magazzino.xSQL() == '' ? null : $scope.TitoloInEditing.Pos_Magazzino.xSQL(),
                         PREZZO            : $scope.TitoloInEditing.Prezzo == '' ? null : $scope.TitoloInEditing.Prezzo,
                         QUANTITA_MGZN     : $scope.TitoloInEditing.Q_Mgzn,
                         QUANTITA_MGZN_VOL : $scope.TitoloInEditing.Q_Mgzn_Vol                     
                       }

    var NuovoTitolo = ($scope.TitoloInEditing.Chiave == -1);
    if(NuovoTitolo)     
    {           
      $ObjQuery.Operazioni.push({
                                  Query     : 'InsertBook',
                                  Parametri : ParamTitolo
                                }); 
    }
    else
    {
      ParamTitolo = {}
      ParamTitolo = {
                      ChiaveTitolo      : $scope.TitoloInEditing.Chiave,
                      Codice            : $scope.TitoloInEditing.Codice.xSQL(),
                      Titolo            : $scope.TitoloInEditing.Titolo.xSQL() == '' ? null : $scope.TitoloInEditing.Titolo.xSQL(),
                      Sottotitolo       : $scope.TitoloInEditing.Sottotitolo.xSQL() == '' ? null : $scope.TitoloInEditing.Sottotitolo.xSQL(),
                      Materia           : $scope.TitoloInEditing.Materia.xSQL() == -1 ? null : $scope.TitoloInEditing.Materia.xSQL(),
                      Autori            : $scope.TitoloInEditing.Autori.xSQL() == '' ? null : $scope.TitoloInEditing.Autori.xSQL(),
                      Editore           : $scope.TitoloInEditing.Editore.xSQL() == '' ? null : $scope.TitoloInEditing.Editore.xSQL(),
                      Volume            : $scope.TitoloInEditing.Volume,
                      Prezzo            : $scope.TitoloInEditing.Prezzo == '' ? null : $scope.TitoloInEditing.Prezzo,
                      PosMgzn           : $scope.TitoloInEditing.Pos_Magazzino.xSQL() == '' ? null : $scope.TitoloInEditing.Pos_Magazzino.xSQL(),
                      QuantitaMgzn      : $scope.TitoloInEditing.Q_Mgzn,
                      QuantitaMgznVol   : $scope.TitoloInEditing.Q_Mgzn_Vol 
                    }                               
      $ObjQuery.Operazioni.push({
                                  Query     : 'UpdateBook',
                                  Parametri : ParamTitolo
                                });
    };

    if (!NuovoTitolo && $scope.TitoloInEditing.ListaIstitutiTitEliminati.length != 0)
    {
       for(let j = 0; j < $scope.TitoloInEditing.ListaIstitutiTitEliminati.length ;j ++)
       {
         var ParamIstitutoTit = {
                                  TITOLO   : $scope.TitoloInEditing.Chiave,
                                  ISTITUTO : $scope.TitoloInEditing.ListaIstitutiTitEliminati[j].CHIAVE
                                }
         if ($scope.TitoloInEditing.ListaIstitutiTitEliminati[j].Eliminato)
         { 
           $ObjQuery.Operazioni.push({
                                      Query     : 'DeleteAdoptionAfterDeleteInstitute',
                                      Parametri : ParamIstitutoTit
                                    });  
           $ObjQuery.Operazioni.push({
                                       Query     : 'DeleteInstituteBook',
                                       Parametri : ParamIstitutoTit
                                     });        
         }
       }
       SystemInformation.PostSQL('Book',$ObjQuery,function(Answer)
       {
         $scope.TitoloInEditing.ListaIstitutiTitEliminati = [];
         $ObjQuery.Operazioni = [];
       });  
    } 
    
    if (!NuovoTitolo && $scope.TitoloInEditing.ListaAdozioniEliminate.length != 0)
    {
       for(let j = 0; j < $scope.TitoloInEditing.ListaAdozioniEliminate.length ;j ++)
       {
         var ParamAdozione = {
                               CHIAVE : $scope.TitoloInEditing.ListaAdozioniEliminate[j].CHIAVE
                             }
         if ($scope.TitoloInEditing.ListaAdozioniEliminate[j].Eliminato)
         {
          $ObjQuery.Operazioni.push({
                                      Query     : 'DeleteAdoption',
                                      Parametri : ParamAdozione
                                    });
         }
       }
       SystemInformation.PostSQL('Book',$ObjQuery,function(Answer)
       {
         $scope.TitoloInEditing.ListaAdozioniEliminate = [];
         $ObjQuery.Operazioni = [];
       });  
    } 
    
    for(let i = 0; i < $scope.TitoloInEditing.ListaIstitutiTit.length;i ++)
    { 
      var ParamIstitutoTit = {
                               TITOLO   : $scope.TitoloInEditing.Chiave,
                               ISTITUTO : $scope.TitoloInEditing.ListaIstitutiTit[i].CHIAVE
                             }    
      
      if(NuovoTitolo && !($scope.TitoloInEditing.ListaIstitutiTit[i].Eliminato))  
      { 
        $ObjQuery.Operazioni.push({
                                    Query     : 'InsertInstituteBookAfterInsert',
                                    Parametri : ParamIstitutoTit
                                  });
      }
      if(!NuovoTitolo && $scope.TitoloInEditing.ListaIstitutiTit[i].Nuovo && !($scope.TitoloInEditing.ListaIstitutiTit[i].Eliminato))
      {  
        $ObjQuery.Operazioni.push({
                                    Query     : 'InsertInstituteBook',
                                    Parametri : ParamIstitutoTit
                                  });
      }      
    }

    for (let i = 0;i < $scope.TitoloInEditing.ListaIstitutiTit.length;i ++)
    {
         for (let j = 0;j < $scope.TitoloInEditing.ListaIstitutiTit[i].Adozioni.length;j ++)
         {
           var ParamAdozione = {
                                 CHIAVE   : $scope.TitoloInEditing.ListaIstitutiTit[i].Adozioni[j].CHIAVE,
                                 TITOLO   : $scope.TitoloInEditing.Chiave,
                                 CLASSE   : $scope.TitoloInEditing.ListaIstitutiTit[i].Adozioni[j].CLASSE,
                                 ISTITUTO : $scope.TitoloInEditing.ListaIstitutiTit[i].Adozioni[j].ISTITUTO          
                               }
           if (NuovoTitolo && $scope.TitoloInEditing.ListaIstitutiTit[i].Adozioni[j].Nuovo)
              $ObjQuery.Operazioni.push({
                                          Query     : 'InsertAdoptionAfterInsert',
                                          Parametri : ParamAdozione,
                                          ResetKeys : [2]
                                        });
           
           if (!NuovoTitolo && $scope.TitoloInEditing.ListaIstitutiTit[i].Adozioni[j].Nuovo)
              $ObjQuery.Operazioni.push({
                                          Query     : 'InsertAdoption',
                                          Parametri : ParamAdozione,
                                          ResetKeys : [1]
                                        });
           
           if (!NuovoTitolo && $scope.TitoloInEditing.ListaIstitutiTit[i].Adozioni[j].Modificato)               
              ParamAdozione = {
                                CHIAVE : $scope.TitoloInEditing.ListaIstitutiTit[i].Adozioni[j].CHIAVE,
                                CLASSE : $scope.TitoloInEditing.ListaIstitutiTit[i].Adozioni[j].CLASSE                               
                              };
              $ObjQuery.Operazioni.push({
                                          Query     : 'UpdateAdoption',
                                          Parametri : ParamAdozione
                                        });
         }
    }         

    SystemInformation.PostSQL('Book',$ObjQuery,function(Answer)
    {
      $scope.TitoloInEditing.ListaIstitutiTit = [];
      $scope.EditingOn = false;
      $scope.RefreshListaTitoli();
    });    
  }
  
  $scope.EliminaTitolo = function(Titolo)
  {
    if(confirm('Eliminare il titolo: ' + Titolo.Titolo + ' ?'))
    {
      var $ObjQuery           = { Operazioni : [] };
      var ParamTitolo         = { CHIAVE     : Titolo.Chiave };
      
      $ObjQuery.Operazioni.push({
                                  Query     : 'DeleteAdoptionAll',
                                  Parametri : ParamTitolo
                                });

      $ObjQuery.Operazioni.push({
                                  Query     : 'DeleteInstituteBookAll',
                                  Parametri : ParamTitolo
                                }); 
      
      $ObjQuery.Operazioni.push({
                                  Query     : 'DeleteBook',
                                  Parametri : ParamTitolo
                                });
                                                               
      SystemInformation.PostSQL('Book',$ObjQuery,function(Answer)
      {
        $scope.RefreshListaTitoli();
      });  
    }
  }
  
  $scope.AggiungiIstituto = function(ev) 
  { 
    $mdDialog.show({ 
                     controller          : DialogControllerIstituto,
                     templateUrl         : "template/associateInstituteTeacherPopup.html",
                     targetEvent         : ev,
                     scope               : $scope,
                     preserveScope       : true,
                     clickOutsideToClose : true
                   })
    .then(function(answer) 
    {
      //A promise that can be resolved with $mdDialog.hide() or rejected with $mdDialog.cancel().
    }, 
    function() 
    {
      //A promise that can be resolved with $mdDialog.hide() or rejected with $mdDialog.cancel().
    });
  };
  
  function DialogControllerIstituto($scope,$mdDialog)  
  {    
    $scope.hide = function() 
    {
      $mdDialog.hide();
    };

    $scope.AnnullaPopup = function() 
    { 
      $scope.IstitutoDaAssociare = -1;
      $mdDialog.cancel();
    };

    $scope.ConfermaPopup = function(istituto) 
    {     
      if(istituto == -1) 
      { 
        alert ('Nessun istituto selezionato!');      
        return
      }
      else
      { 
        let IstitutoExist  = $scope.TitoloInEditing.ListaIstitutiTit.find(function(AIstituto) { return(AIstituto.CHIAVE == istituto);});
        let IstitutoNome   = $scope.ListaIstitutiPopup.find(function(AIstituto) { return(AIstituto.Chiave == istituto);});
        if (IstitutoExist != undefined) alert ('Istituto già associato al titolo attuale!')
        else
        { 
          NuovoIstituto = {
                            "Nuovo"      : true,
                            "Modificato" : false,
                            //"Eliminato"  : false,
                            "CHIAVE"     : istituto,
                            "ISTITUTO"   : IstitutoNome.Istituto,
                            "Adozioni"   : []
                          }                            

          $scope.TitoloInEditing.ListaIstitutiTit.push(NuovoIstituto);
          $scope.IstitutoDaAssociare = -1;          
          $scope.IstitutoVisualizzato = $scope.TitoloInEditing.ListaIstitutiTit[$scope.TitoloInEditing.ListaIstitutiTit.length-1].CHIAVE;
          $scope.TitoloInEditing.ListaIstitutiTit.sort(function(a,b) 
          {
              var IstA = a.ISTITUTO.toUpperCase();
              var IstB = b.ISTITUTO.toUpperCase();
              return (IstA < IstB) ? -1 : (IstA > IstB) ? 1 : 0;
          });                   
          $scope.NomeFiltro = '';
          $mdDialog.hide();
        }
      }        
    }
  }
  
  $scope.DissociaIstituto = function (Istituto)
  { 
    if ($scope.TitoloInEditing.ListaIstitutiTit.length == 0) 
        alert('Nessun istituto selezionato da dissociare!')       
    else
    {
      IstitutoCorrispondente = $scope.TitoloInEditing.ListaIstitutiTit.find(function(AIstituto) { return(AIstituto.CHIAVE == Istituto);});
      if(confirm('Dissociare l\'istituto: ' + IstitutoCorrispondente.ISTITUTO + ' dal titolo?'))
      {
         for(let j = 0; j < $scope.TitoloInEditing.ListaIstitutiTit.length; j++)
         {
           var EliminaIstituto = function(j)
           {
             $scope.TitoloInEditing.ListaIstitutiTit.splice(j,1);
             $scope.IstitutoVisualizzato = $scope.TitoloInEditing.ListaIstitutiTit.length == 0 ? -1 : $scope.TitoloInEditing.ListaIstitutiTit[0].CHIAVE            
           }
           if($scope.TitoloInEditing.ListaIstitutiTit[j].CHIAVE == Istituto)
           {
             if ($scope.TitoloInEditing.ListaIstitutiTit[j].Nuovo)
                EliminaIstituto(j);
             else 
             {                   
               $scope.TitoloInEditing.ListaIstitutiTitEliminati.push($scope.TitoloInEditing.ListaIstitutiTit[j]);
               $scope.TitoloInEditing.ListaIstitutiTitEliminati[$scope.TitoloInEditing.ListaIstitutiTitEliminati.length-1].Eliminato = true;
               EliminaIstituto(j);
             }                         
           }
         }   
      }
    }
  }
    
  $scope.NuovaAdozione = function (ev,Istituto,Titolo)
  { 
    if(Istituto == -1)
    {  
      alert("Impossibile aggiungere adozione, nessun istituto selezionato!")       
    }
    else
    {     
      $mdDialog.show({ 
                       controller          : DialogControllerAdozione,
                       templateUrl         : "template/adoptionBookPopup.html",
                       targetEvent         : ev,
                       scope               : $scope,
                       preserveScope       : true,
                       clickOutsideToClose : true,
                       locals              : {Istituto,Titolo}
                     })
      .then(function(answer) 
      {
        //A promise that can be resolved with $mdDialog.hide()...
      }, 
      function() 
      {
        //...or rejected with $mdDialog.cancel().
      });
    }
  };

  function DialogControllerAdozione($scope,$mdDialog,Istituto,Titolo)  
  { 
    $scope.AdozioneInEditing = {
                                 "CHIAVE"     : -1,
                                 "CLASSE"     : -1,
                                 "ANNO"       : '',
                                 "SEZIONE"    : '',
                                 "ISTITUTO"   : Istituto,
                                 "TITOLO"     : Titolo,
                                 "Nuovo"      : true,
                                 "Modificato" : false,
                                 "Eliminato"  : false
                               } 

    SystemInformation.GetSQL('Institute',{CHIAVE : Istituto}, function(Results)
    {
      ListaClassiIst = SystemInformation.FindResults(Results,'ClassiInstitute');
      if (ListaClassiIst != undefined)
      {  
         for(let i = 0; i < ListaClassiIst.length; i++)
             ListaClassiIst[i] = { 
                                   Chiave   : ListaClassiIst[i].CHIAVE,
                                   Anno     : ListaClassiIst[i].ANNO,
                                   Sezione  : ListaClassiIst[i].SEZIONE,
                                   Istituto : ListaClassiIst[i].NOME
                                 }
         $scope.ListaClassiIstituto = ListaClassiIst;
      }
      else SystemInformation.ApplyOnError('Modello classe istituto non conforme o nessuna classe associata all\'istituto attuale','')     
    },"SQLDettaglio");

    $scope.hide = function() 
    {
      $mdDialog.hide();
    };

    $scope.AnnullaPopupAdozione = function() 
    {
      $mdDialog.cancel();
    };

    $scope.ConfermaPopupAdozione = function(adozione)
    { 
      if($scope.AdozioneInEditing.CLASSE == -1)
      {
        alert ('Deve essere inserita una classe!');
        return
      }
      else
      {        
        IstCorrispondente  = $scope.TitoloInEditing.ListaIstitutiTit.findIndex(function(AIstituto){return (AIstituto.CHIAVE == adozione.ISTITUTO);});       
        AdozCorrispondente = $scope.TitoloInEditing.ListaIstitutiTit[IstCorrispondente].Adozioni.findIndex(function(AAdozione){return (AAdozione.CLASSE == adozione.CLASSE);});
        
        if(AdozCorrispondente != -1 && $scope.TitoloInEditing.ListaIstitutiTit[IstCorrispondente].Adozioni[AdozCorrispondente].CLASSE == adozione.CLASSE)
        {
          alert('Titolo già assegnato a questa classe!');
          return
        }
        else
        {        
          $scope.TitoloInEditing.ListaIstitutiTit[IstCorrispondente].Adozioni.push(adozione);
          
          for (let m = 0;m < $scope.ListaClassiIstituto.length;m ++)
          {
               if ($scope.ListaClassiIstituto[m].Chiave == $scope.TitoloInEditing.ListaIstitutiTit[IstCorrispondente].Adozioni[$scope.TitoloInEditing.ListaIstitutiTit[IstCorrispondente].Adozioni.length-1].CLASSE)
               {
                 $scope.TitoloInEditing.ListaIstitutiTit[IstCorrispondente].Adozioni[$scope.TitoloInEditing.ListaIstitutiTit[IstCorrispondente].Adozioni.length-1].ANNO    = $scope.ListaClassiIstituto[m].Anno;
                 $scope.TitoloInEditing.ListaIstitutiTit[IstCorrispondente].Adozioni[$scope.TitoloInEditing.ListaIstitutiTit[IstCorrispondente].Adozioni.length-1].SEZIONE = $scope.ListaClassiIstituto[m].Sezione;
               } 
          }
        }
      }        
      $mdDialog.hide();     
    }
  }

  $scope.ModificaAdozione = function (Adozione)
  {     
    $mdDialog.show({ 
                     controller          : DialogControllerAdozioneMod,
                     templateUrl         : "template/adoptionBookPopup.html",
                     targetEvent         : Adozione,
                     scope               : $scope,
                     preserveScope       : true,
                     clickOutsideToClose : true,
                     locals              : {Adozione}
                   })
    .then(function(answer) 
    {
      //A promise that can be resolved with $mdDialog.hide()...
    }, 
    function() 
    {
      //...or rejected with $mdDialog.cancel().
    });
  };
  
  function DialogControllerAdozioneMod($scope,$mdDialog,Adozione)  
  { 
    AdozioneOld = Adozione.CLASSE;
    $scope.AdozioneInEditing = {
                                 "CHIAVE"     : Adozione.CHIAVE,
                                 "CLASSE"     : Adozione.CLASSE,
                                 "ANNO"       : Adozione.ANNO,
                                 "SEZIONE"    : Adozione.SEZIONE,
                                 "ISTITUTO"   : Adozione.ISTITUTO,
                                 "TITOLO"     : Adozione.TITOLO,
                                 "Nuovo"      : Adozione.Nuovo,
                                 "Modificato" : Adozione.Modificato,
                                 "Eliminato"  : Adozione.Eliminato                                
                               } 

    SystemInformation.GetSQL('Institute',{CHIAVE : Adozione.ISTITUTO}, function(Results)
    {
      ListaClassiIst = SystemInformation.FindResults(Results,'ClassiInstitute');
      if (ListaClassiIst != undefined)
      {  
         for(let i = 0; i < ListaClassiIst.length; i++)
             ListaClassiIst[i] = { 
                                   Chiave   : ListaClassiIst[i].CHIAVE,
                                   Anno     : ListaClassiIst[i].ANNO,
                                   Sezione  : ListaClassiIst[i].SEZIONE,
                                   Istituto : ListaClassiIst[i].NOME
                                 }
         $scope.ListaClassiIstituto = ListaClassiIst;
      }
      else SystemInformation.ApplyOnError('Modello classe istituto non conforme o nessuna classe associata all\'istituto attuale','')     
    },"SQLDettaglio");

    $scope.hide = function() 
    {
      $mdDialog.hide();
    };

    $scope.AnnullaPopupAdozione = function() 
    {
      $mdDialog.cancel();
    };

    $scope.ConfermaPopupAdozione = function(Adozione)
    { 
      IstCorrispondente  = $scope.TitoloInEditing.ListaIstitutiTit.findIndex(function(AIstituto){return (AIstituto.CHIAVE == Adozione.ISTITUTO);});       
      AdozExist          = $scope.TitoloInEditing.ListaIstitutiTit[IstCorrispondente].Adozioni.find(function(AAdozione){return (AAdozione.CLASSE == Adozione.CLASSE);});
      if(AdozExist != undefined)
      {
        alert ('Il titolo è gia associato a questa classe!');
        return
      }      
      /*else if($scope.AdozioneInEditing.CLASSE == Adozione.CLASSE)
      {
        alert ('Deve essere inserita una classe diversa per la modifica!');
        return
      }*/
      else
      {       
        AdozCorrispondente = $scope.TitoloInEditing.ListaIstitutiTit[IstCorrispondente].Adozioni.findIndex(function(AAdozione){return (AAdozione.CLASSE == AdozioneOld && AAdozione.ISTITUTO == Adozione.ISTITUTO);});        

        for (let m = 0;m < $scope.ListaClassiIstituto.length;m ++)
        {
             if ($scope.ListaClassiIstituto[m].Chiave == Adozione.CLASSE)
             {
               $scope.TitoloInEditing.ListaIstitutiTit[IstCorrispondente].Adozioni[AdozCorrispondente].CLASSE     = $scope.ListaClassiIstituto[m].Chiave;
               $scope.TitoloInEditing.ListaIstitutiTit[IstCorrispondente].Adozioni[AdozCorrispondente].ANNO       = $scope.ListaClassiIstituto[m].Anno;
               $scope.TitoloInEditing.ListaIstitutiTit[IstCorrispondente].Adozioni[AdozCorrispondente].SEZIONE    = $scope.ListaClassiIstituto[m].Sezione;
               if($scope.TitoloInEditing.ListaIstitutiTit[IstCorrispondente].Adozioni[AdozCorrispondente].Nuovo)
               {
                 $scope.TitoloInEditing.ListaIstitutiTit[IstCorrispondente].Adozioni[AdozCorrispondente].Modificato = false;
                 //$scope.TitoloInEditing.ListaIstitutiTit[IstCorrispondente].Adozioni[AdozCorrispondente].Eliminato  = false;
               }   
               else
               {                
                 //$scope.TitoloInEditing.ListaIstitutiTit[IstCorrispondente].Adozioni[AdozCorrispondente].Nuovo      = false;
                 //$scope.TitoloInEditing.ListaIstitutiTit[IstCorrispondente].Adozioni[AdozCorrispondente].Eliminato  = false;
                 $scope.TitoloInEditing.ListaIstitutiTit[IstCorrispondente].Adozioni[AdozCorrispondente].Modificato = true;
               }
             } 
        }
      }        
      $mdDialog.hide();     
    }
  } 

  $scope.EliminaAdozione = function(Adozione)
  {
    if(confirm('Eliminare l\'adozione di \"' + $scope.TitoloInEditing.Titolo + '\" dalla classe ' + Adozione.ANNO + Adozione.SEZIONE + ' ?'))
    { 
      IstCorrispondente      = $scope.TitoloInEditing.ListaIstitutiTit.findIndex(function(AIstituto){return(AIstituto.CHIAVE == Adozione.ISTITUTO);});   
      AdozioneCorrispondente = $scope.TitoloInEditing.ListaIstitutiTit[IstCorrispondente].Adozioni.findIndex(function(AAdozione){return(AAdozione.CLASSE == Adozione.CLASSE);});         
      if ($scope.TitoloInEditing.ListaIstitutiTit[IstCorrispondente].Adozioni[AdozioneCorrispondente].Nuovo)
          $scope.TitoloInEditing.ListaIstitutiTit[IstCorrispondente].Adozioni.splice(AdozioneCorrispondente,1)
      else
      {
        $scope.TitoloInEditing.ListaAdozioniEliminate.push($scope.TitoloInEditing.ListaIstitutiTit[IstCorrispondente].Adozioni[AdozioneCorrispondente]);
        $scope.TitoloInEditing.ListaAdozioniEliminate[$scope.TitoloInEditing.ListaAdozioniEliminate.length-1].Eliminato = true;
        $scope.TitoloInEditing.ListaIstitutiTit[IstCorrispondente].Adozioni.splice(AdozioneCorrispondente,1);
      }      
    }  
  }
  
  $scope.RefreshListaTitoli();

}]);

SIRIOApp.filter('TitoloByFiltro',function()
{  
  return function(ListaTitoli,MateriaFiltro,NomeFiltro,CodiceFiltro)
         {          
           if(MateriaFiltro == -1 && NomeFiltro == '' && CodiceFiltro == '') return(ListaTitoli);
           var ListaFiltrata = [];
           NomeFiltro = NomeFiltro.toUpperCase();
           
           var TitoloOk = function(Titolo)
           {  
              var Result = true;
              
              if(NomeFiltro != '')
                if(Titolo.Titolo.toUpperCase().indexOf(NomeFiltro) < 0)
                   Result = false;
                  
              if(MateriaFiltro != -1)
                 if(Titolo.Materia != MateriaFiltro)
                    Result = false;
                   
              if(CodiceFiltro != '')
                 if(Titolo.Codice.indexOf(CodiceFiltro) < 0)
                    Result = false;
              return(Result);
           }
          
           ListaTitoli.forEach(function(Titolo)
           { 
             if(TitoloOk(Titolo)) 
                ListaFiltrata.push(Titolo)                       
           });
           
           return(ListaFiltrata);
         }           
});

SIRIOApp.filter('IstitutoByNomeFiltro',function()
{  
  return function(ListaistitutiPopup,NomeFiltro)
         {  
                    
           if(NomeFiltro == '') return(ListaistitutiPopup);
           var ListaFiltrataI = [];
           NomeFiltro = NomeFiltro.toUpperCase();
           var IstitutoOK = function(istituto)
           {  
              var Result = true;
              
              if(NomeFiltro != '')
                if(istituto.Istituto.toUpperCase().indexOf(NomeFiltro) < 0)
                   Result = false;
              return(Result);
           }
          
           ListaistitutiPopup.forEach(function(istituto)
           { 
             if(IstitutoOK(istituto)) 
                ListaFiltrataI.push(istituto)                       
           });
           
           return(ListaFiltrataI);
         }           
});