SIRIOApp.controller("deliveryModDetailPageController",['$scope','SystemInformation','$state','$rootScope','$mdDialog','ZConfirm',
function($scope,SystemInformation,$state,$rootScope,$mdDialog,ZConfirm)
{ 
  $scope.SpedizioneMultipla              = false;
  $scope.ListaIstitutiDoc                = [];
  $scope.ListaTitoliEliminati            = [];
  $scope.NuovaSpedizioneCasaEd           = false;
  $scope.ListaIstitutiSped               = [];
  $scope.SpedizioneAIstituto             = false;
  $scope.IstitutoSelezionato             = '';
  
  ScopeHeaderController.CheckButtons();

  $scope.ConvertiData = function (Data)
  {
     return(ZFormatDateTime('dd/mm/yyyy',ZDateFromHTMLInput(Data)));
  }

  $scope.IndirizzoByIstituto = function (Istituto)
  {
    if(Istituto == -1)
    {
     $scope.SpedizioneInEditing.INDIRIZZO       = DocenteDettaglio[0].INDIRIZZO == null ? '' : DocenteDettaglio[0].INDIRIZZO;
     $scope.SpedizioneInEditing.COMUNE          = DocenteDettaglio[0].COMUNE    == null ? '' : DocenteDettaglio[0].COMUNE;
     $scope.SpedizioneInEditing.CAP             = DocenteDettaglio[0].CAP       == null ? '' : DocenteDettaglio[0].CAP;
     $scope.SpedizioneInEditing.PROVINCIA       = DocenteDettaglio[0].PROVINCIA == null ? -1 : DocenteDettaglio[0].PROVINCIA;
     $scope.SpedizioneInEditing.PROVINCIA_NOME  = ProvinciaDoc                  == undefined ? '' : ProvinciaDoc.Nome;
     $scope.SpedizioneInEditing.ISTITUTO        = -1
    }
    else
    {
      IstitutoCorrisp     = $scope.ListaIstitutiDoc.find(function(AIstituto){return(AIstituto.CHIAVE == Istituto);});
      ProvinciaAllCorrisp = $scope.ListaProvinceAll.find(function(AProvincia){return(AProvincia.Nome == IstitutoCorrisp.PROVINCIA_NOME);});
     
      $scope.SpedizioneInEditing.INDIRIZZO       = IstitutoCorrisp.INDIRIZZO  == null ? '': IstitutoCorrisp.INDIRIZZO;
      $scope.SpedizioneInEditing.COMUNE          = IstitutoCorrisp.COMUNE     == null ? '': IstitutoCorrisp.COMUNE;
      $scope.SpedizioneInEditing.CAP             = IstitutoCorrisp.CAP        == null ? '': IstitutoCorrisp.CAP;
      $scope.SpedizioneInEditing.PROVINCIA       = ProvinciaAllCorrisp.Chiave == undefined ? -1 : ProvinciaAllCorrisp.Chiave;
      $scope.SpedizioneInEditing.PROVINCIA_NOME  = ProvinciaAllCorrisp.Nome   == undefined ? '' : IstitutoCorrisp.Nome;
      $scope.SpedizioneInEditing.ISTITUTO        = Istituto;
    }
  }
  
  if(Array.isArray(SystemInformation.DataBetweenController.ListaDocSped) && SystemInformation.DataBetweenController.ListaDocSped.length > 0 && SystemInformation.DataBetweenController.SpedizioneMultipla)
  {    
     $scope.SpedizioneMultipla                = true;
     $scope.ListaDocentiSpedizione            = SystemInformation.DataBetweenController.ListaDocSped;
     $scope.ListaDocentiSpedizionePerMultipla = Array.from(SystemInformation.DataBetweenController.ListaDocSped);
     $scope.ListaDocentiEsclusi               = [];
     if(SystemInformation.DataBetweenController.IstitutoPerIndirizzo != undefined)
     {
        if(SystemInformation.DataBetweenController.IstitutoPerIndirizzo != -1)
           $scope.IstitutoSelezionato = SystemInformation.DataBetweenController.IstitutoPerIndirizzo
        else $scope.IstitutoSelezionato = '';     
     }
     
     for(let i = 0;i < $scope.ListaDocentiSpedizione.length;)
     {
         if ($scope.ListaDocentiSpedizione[i].IndirizzoDocente === "" || $scope.ListaDocentiSpedizione[i].ComuneDocente === "" || $scope.ListaDocentiSpedizione[i].CapDocente === "" || $scope.ListaDocentiSpedizione[i].ProvinciaDocente == -1 || $scope.ListaDocentiSpedizione[i].ProvinciaDocenteNome === "")
         {    
             $scope.ListaDocentiEsclusi.push($scope.ListaDocentiSpedizione[i]);
             $scope.ListaDocentiSpedizione.splice(i,1)
         }
         else i++;          
     }
  }     
    
  $scope.ChiaveSpedizione                                  = SystemInformation.DataBetweenController.ChiaveSpedizione;
  $scope.ChiaveDocente                                     = SystemInformation.DataBetweenController.ChiaveDocente;
  SystemInformation.DataBetweenController.ChiaveSpedizione = '';
  SystemInformation.DataBetweenController.ChiaveDocente    = '';
  
  if($scope.ChiaveDocente == undefined && $scope.ChiaveSpedizione == undefined && !($scope.SpedizioneMultipla))
  {
   SystemInformation.DataBetweenController = {};
   $state.go("deliveryListPage")
  }
  else
  {
    var LoadTitoli = function()
    {    
      SystemInformation.GetSQL('Accessories', {}, function(Results)  
      {  
        TitoliInfoLista = SystemInformation.FindResults(Results,'BookList');
        if(TitoliInfoLista != undefined)
        { 
           for(let i = 0; i < TitoliInfoLista.length; i++)
               TitoliInfoLista[i] = { 
                                      Chiave       : TitoliInfoLista[i].CHIAVE,
                                      Nome         : TitoliInfoLista[i].TITOLO == null ? 'N.D' : TitoliInfoLista[i].TITOLO,
                                      Quantita     : parseInt(TitoliInfoLista[i].QUANTITA_MGZN),
                                      QuantitaVol  : parseInt(TitoliInfoLista[i].QUANTITA_MGZN_VOL),
                                      QuantitaDisp : parseInt(TitoliInfoLista[i].QUANTITA_DISP),
                                      Codice       : TitoliInfoLista[i].CODICE_ISBN == null ? 'N.D.' : TitoliInfoLista[i].CODICE_ISBN,
                                      Autore       : TitoliInfoLista[i].AUTORI == null ? '' : TitoliInfoLista[i].AUTORI,
                                      DaAggiungere : false
                                    }
           $scope.ListaTitoli      = TitoliInfoLista;
           $scope.ListaTitoliPopup = TitoliInfoLista;
           $scope.ListaTitoliCsv   = TitoliInfoLista;
           GestioneParametri();
        }
        else SystemInformation.ApplyOnError('Modello titoli non conforme','');   
      },'SelectTitoliSQL');
    }
    
    var LoadProvince = function()
    {    
      SystemInformation.GetSQL('Accessories',{}, function(Results)
      {
        ListaProvinceAllTmp = SystemInformation.FindResults(Results,'ProvinceListAll');

        if (ListaProvinceAllTmp != undefined) 
        {
          for(let i = 0; i < ListaProvinceAllTmp.length; i++)
              ListaProvinceAllTmp[i] = {
                                         Chiave : ListaProvinceAllTmp[i].CHIAVE,
                                         Nome   : ListaProvinceAllTmp[i].NOME
                                       }
          $scope.ListaProvinceAll = ListaProvinceAllTmp;
          LoadTitoli();
        }
        else SystemInformation.ApplyOnError('Modello province non conforme','');    
      });
    }

    var LoadIstituti = function()
    {
      SystemInformation.GetSQL('Institute', {}, function(Results)  
      {  
        IstitutiInfoLista = SystemInformation.FindResults(Results,'InstituteInfoListOnlyVisibile');
        if(IstitutiInfoLista != undefined)
        { 
           for(let i = 0; i < IstitutiInfoLista.length; i++)
               IstitutiInfoLista[i] = { 
                                        Chiave     : IstitutiInfoLista[i].CHIAVE,
                                        Istituto   : IstitutiInfoLista[i].NOME
                                      }
           $scope.ListaIstituti = IstitutiInfoLista;
           LoadProvince();
        }
        else SystemInformation.ApplyOnError('Modello istituti non conforme','');   
      },'SelectSQLOnlyVisible');
    }

    var LoadTitoliNoFilter = function()
    {
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
           $scope.ListaTitoliCsvNoFilter = TitoliInfoListaNF;
           LoadIstituti()
        }
        else SystemInformation.ApplyOnError('Modello titoli non filtrati non conforme','');   
      },'SelectSQLNoFilter');
    }
    
    LoadTitoliNoFilter();
      
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
    $scope.GridOptions3 = {
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
                          
    var GestioneParametri = function()
    { 
       //NUOVA SPEDIZIONE DOCENTI MULTIPLA
       var IstitutiListaSped = [];
       if($scope.SpedizioneMultipla && $scope.ChiaveDocente == undefined && $scope.ChiaveSpedizione == undefined)
       {
          SystemInformation.GetSQL('Institute', {}, function(Results)  
          {  
            IstitutiListaSped = SystemInformation.FindResults(Results,'InstituteForDeliveryList');
            if(IstitutiListaSped != undefined)
            { 
               $scope.SpedizioneInEditing        = {};
               $scope.SpedizioneInEditing.CHIAVE = -1
               $scope.ListaTitoliSpedizione      = [];
               $scope.SpedizioneInEditing.DATA   = new Date();
               var IstitutoCorrisp               = {};
               
               for(let i = 0; i < IstitutiListaSped.length; i++)
                   IstitutiListaSped[i] = { 
                                            Chiave     : IstitutiListaSped[i].CHIAVE,
                                            Istituto   : IstitutiListaSped[i].NOME,
                                            Indirizzo  : IstitutiListaSped[i].INDIRIZZO,
                                            Comune     : IstitutiListaSped[i].COMUNE,
                                            Cap        : IstitutiListaSped[i].CAP,
                                            Provincia  : IstitutiListaSped[i].PROVINCIA_LISTA_ALL
                                          }
               $scope.ListaIstitutiSped = IstitutiListaSped;

               $scope.ResetCampi = function()
               {
                 $scope.SpedizioneAIstituto = !$scope.SpedizioneAIstituto;

                 if(!$scope.SpedizioneAIstituto)
                 {
                   //$scope.SpedizioneAIstituto           = false;
                   $scope.IstitutoSelezionato           = '';
                   $scope.SpedizioneInEditing.INDIRIZZO = '';
                   $scope.SpedizioneInEditing.COMUNE    = '';
                   $scope.SpedizioneInEditing.CAP       = '';
                   $scope.SpedizioneInEditing.PROVINCIA = -1;
                 }
               }               

               if($scope.IstitutoSelezionato != '')
               {
                 $scope.SpedizioneAIstituto           = true;
                 IstitutoCorrisp                      = $scope.ListaIstitutiSped.find(function(AIstituto){return(AIstituto.Chiave == $scope.IstitutoSelezionato);});
                 
                 if(IstitutoCorrisp != undefined)
                 {
                    $scope.IstitutoSelezionato           = IstitutoCorrisp.Istituto;
                    $scope.SpedizioneInEditing.INDIRIZZO = IstitutoCorrisp.Indirizzo;
                    $scope.SpedizioneInEditing.COMUNE    = IstitutoCorrisp.Comune;
                    $scope.SpedizioneInEditing.CAP       = IstitutoCorrisp.Cap;
                    $scope.SpedizioneInEditing.PROVINCIA = IstitutoCorrisp.Provincia;
                    $scope.SpedizioneInEditing.ISTITUTO  = IstitutoCorrisp.Chiave;
                 }
                 else
                 {
                    $scope.SpedizioneInEditing.INDIRIZZO = '';
                    $scope.SpedizioneInEditing.COMUNE    = '';
                    $scope.SpedizioneInEditing.CAP       = '';
                    $scope.SpedizioneInEditing.PROVINCIA = -1;
                    $scope.SpedizioneInEditing.ISTITUTO  = -1;
                 }
               }
               
               if($scope.SpedizioneMultipla)
               {
                  //$scope.Multipla = true;
                  if($scope.IstitutoSelezionato != '')
                     $scope.NumeroDocenti = $scope.ListaDocentiSpedizionePerMultipla.length
                  else $scope.NumeroDocenti = $scope.ListaDocentiSpedizione.length;
               }
               
               $scope.PassaADaSpedire = function (Titolo)
               {
                 if(!$scope.SpedizioneMultipla)
                 {
                    if (Titolo.STATO == 'P')
                    {
                        if(Titolo.Nuovo == true)
                           Titolo.STATO = 'S';
                        else 
                        {
                          Titolo.STATO = 'S';
                          Titolo.Modificato = true;
                        }          
                    }
                 }
                 else 
                 {
                   if(Titolo.STATO == 'P')
                   {
                      (Titolo.QUANTITA * $scope.NumeroDocenti > Titolo.QUANTITA_DISP)
                        ZCustomAlert($mdDialog,'ATTENZIONE',"LA GIACENZA E' INSUFFICIENTE!")
                   }
                 }
               }

               $scope.RimuoviDocenteTabella = function(DocenteTab)
               {
                 DocenteTabellaIndex = $scope.ListaDocentiSpedizione.findIndex(function(ADoc){return(ADoc.ChiaveDocente == DocenteTab.ChiaveDocente);})
                 $scope.ListaDocentiSpedizione.splice(DocenteTabellaIndex,1);
               }

               $scope.RimuoviDocenteIncluso = function(DocenteIncl)
               {
                DocenteInclusoIndex = $scope.ListaDocentiSpedizione.findIndex(function(ADoc){return(ADoc.ChiaveDocente == DocenteIncl.ChiaveDocente);})
                $scope.ListaDocentiSpedizione.splice(DocenteInclusoIndex,1);
               }

               $scope.RimuoviDocenteEscluso = function(DocenteEscl)
               {
                DocenteEsclusoIndex = $scope.ListaDocentiEsclusi.findIndex(function(ADoc){return(ADoc.ChiaveDocente == DocenteEscl.ChiaveDocente);})
                $scope.ListaDocentiEsclusi.splice(DocenteEsclusoIndex,1);
               }

               $scope.queryIstituto = function(searchTextIstituto)
               {
                  searchTextIstituto = searchTextIstituto.toUpperCase();
                  return($scope.ListaIstitutiSped.grep(function(Elemento) 
                  { 
                    return(Elemento.Istituto.toUpperCase().indexOf(searchTextIstituto) != -1);
                  }));
               }
               
               $scope.selectedItemChangeIstituto = function(itemIstituto)
               {
                 if(itemIstituto != undefined)
                 {
                    $scope.SpedizioneInEditing.INDIRIZZO = '';
                    $scope.SpedizioneInEditing.COMUNE    = '';
                    $scope.SpedizioneInEditing.CAP       = '';
                    $scope.SpedizioneInEditing.PROVINCIA = '';
                    $scope.IstitutoSelezionato           = itemIstituto.Chiave;
                    $scope.SpedizioneInEditing.INDIRIZZO = itemIstituto.Indirizzo;
                    $scope.SpedizioneInEditing.COMUNE    = itemIstituto.Comune;
                    $scope.SpedizioneInEditing.CAP       = itemIstituto.Cap;
                    $scope.SpedizioneInEditing.PROVINCIA = itemIstituto.Provincia;
                    $scope.SpedizioneInEditing.ISTITUTO  = itemIstituto.Chiave;
                    $scope.SpedizioneAIstituto = true;
                 }
                 else 
                 {
                    $scope.IstitutoSelezionato = -1;
                    $scope.SpedizioneAIstituto = false; //ANAKIN
                 }
               }                     
            }
            else SystemInformation.ApplyOnError('Modello indirizzi istituti per spedizione non conforme','');   
          },'SelectInstituteDelivery');               
       }
       
       //NUOVA SPEDIZIONE DOCENTE       
       if($scope.ChiaveDocente != -1 && $scope.ChiaveSpedizione == -1 && !($scope.SpedizioneMultipla))
       {    
          $scope.SpedizioneInEditing    = {};
          $scope.ProvinciaDoc           = {};
          
          SystemInformation.GetSQL('Teacher', {CHIAVE : $scope.ChiaveDocente}, function(Results)
          {
            DocenteDettaglio = SystemInformation.FindResults(Results,'TeacherDettaglio');
            IstitutiDoc      = SystemInformation.FindResults(Results,'TeacherInstitute');
            ProvinciaDoc     = $scope.ListaProvinceAll.find(function(AProvincia){return(AProvincia.Chiave == DocenteDettaglio[0].PROVINCIA);});

            if(DocenteDettaglio != undefined && IstitutiDoc != undefined)
            {

              $scope.ListaIstitutiDoc                    = IstitutiDoc;
              $scope.ListaTitoliSpedizione               = [];
              $scope.ListaTitoliEliminati                = [];
              $scope.SpedizioneInEditing.CHIAVE          = -1;
              $scope.SpedizioneInEditing.DOCENTE         = $scope.ChiaveDocente;
              $scope.SpedizioneInEditing.DOCENTE_NOME    = DocenteDettaglio[0].RAGIONE_SOCIALE;
              $scope.SpedizioneInEditing.PRESSO          = DocenteDettaglio[0].RAGIONE_SOCIALE;
              $scope.SpedizioneInEditing.DATA            = new Date();
              $scope.SpedizioneInEditing.ISTITUTO        = -1;              
              
              if($scope.ListaIstitutiDoc.length == 1)
              {
                 $scope.IstitutoDoc = $scope.ListaIstitutiDoc[0].CHIAVE;
                 $scope.IndirizzoByIstituto($scope.ListaIstitutiDoc[0].CHIAVE);
                 $scope.SpedizioneInEditing.ISTITUTO = $scope.IstitutoDoc;               
              }
              else
              {
                 $scope.SpedizioneInEditing.INDIRIZZO       = '';
                 $scope.SpedizioneInEditing.COMUNE          = '';
                 $scope.SpedizioneInEditing.CAP             = '';
                 $scope.SpedizioneInEditing.PROVINCIA       = -1;
                 $scope.SpedizioneInEditing.PROVINCIA_NOME  = '';
              }
              
              if(parseInt(SystemInformation.DataBetweenController.IstitutoFiltrato) != -1)
              {
                $scope.IstitutoDoc = parseInt(SystemInformation.DataBetweenController.IstitutoFiltrato)
                $scope.SpedizioneInEditing.ISTITUTO = $scope.IstitutoDoc;    
                $scope.IndirizzoByIstituto(parseInt(SystemInformation.DataBetweenController.IstitutoFiltrato));
              }   
            }       
            else SystemInformation.ApplyOnError('Modello docente per spedizione non conforme','');      
          },'SQLDettaglio'); 
          
          $scope.PassaADaSpedire = function (Titolo)
          {
            if (Titolo.STATO == 'P')
            {
                if(Titolo.Nuovo == true)
                   Titolo.STATO = 'S';
                else 
                {
                  Titolo.STATO = 'S';
                  Titolo.Modificato = true;
                }          
            }
          }        
       }
       
       //MODIFICA SPEDIZIONE DOCENTE       
       if($scope.ChiaveDocente != -1 && $scope.ChiaveSpedizione != -1 && !($scope.SpedizioneMultipla))
       {              
          SystemInformation.GetSQL('Delivery',{CHIAVE : $scope.ChiaveSpedizione},function(Results)
          {
            $scope.SpedizioneInEditing = {};
            
            DettaglioSpedizioneDoc       = SystemInformation.FindResults(Results,'TeacherDelivery');
            DettaglioSpedizioneTitoloDoc = SystemInformation.FindResults(Results,'TeacherDeliveryBook');
           
            if(DettaglioSpedizioneDoc != undefined && DettaglioSpedizioneTitoloDoc != undefined)
            { 
                $scope.SpedizioneInEditing.CHIAVE           = $scope.ChiaveSpedizione;
                $scope.SpedizioneInEditing.DOCENTE          = $scope.ChiaveDocente;
                $scope.SpedizioneInEditing.PRESSO           = DettaglioSpedizioneDoc[0].PRESSO;
                $scope.SpedizioneInEditing.STATO            = DettaglioSpedizioneDoc[0].STATO;
                $scope.SpedizioneInEditing.INDIRIZZO        = DettaglioSpedizioneDoc[0].INDIRIZZO;
                $scope.SpedizioneInEditing.COMUNE           = DettaglioSpedizioneDoc[0].COMUNE;
                $scope.SpedizioneInEditing.CAP              = DettaglioSpedizioneDoc[0].CAP;
                $scope.SpedizioneInEditing.PROVINCIA        = DettaglioSpedizioneDoc[0].PROVINCIA
                $scope.SpedizioneInEditing.DATA             = new Date(DettaglioSpedizioneDoc[0].DATA);
                $scope.ListaTitoliSpedizione                = [];
                $scope.ListaTitoliEliminati                 = [];
                $scope.SpedizioneInEditing.ISTITUTO         = DettaglioSpedizioneDoc[0].ISTITUTO == null ? -1 : DettaglioSpedizioneDoc[0].ISTITUTO;
                if($scope.SpedizioneInEditing.ISTITUTO != -1)
                   $scope.IstitutoDoc = $scope.SpedizioneInEditing.ISTITUTO;
                for(let i = 0;i < DettaglioSpedizioneTitoloDoc.length;i ++)
                {
                    if(DettaglioSpedizioneTitoloDoc[i].SPEDIZIONE == $scope.ChiaveSpedizione)
                    $scope.ListaTitoliSpedizione.push({
                                                        "CHIAVE"        : DettaglioSpedizioneTitoloDoc[i].CHIAVE,
                                                        "SPEDIZIONE"    : DettaglioSpedizioneTitoloDoc[i].SPEDIZIONE,
                                                        "TITOLO"        : DettaglioSpedizioneTitoloDoc[i].TITOLO,
                                                        "ISBN_TITOLO"   : DettaglioSpedizioneTitoloDoc[i].ISBN_TITOLO,
                                                        "NOME_TITOLO"   : DettaglioSpedizioneTitoloDoc[i].NOME_TITOLO,
                                                        "QUANTITA"      : parseInt(DettaglioSpedizioneTitoloDoc[i].QUANTITA),
                                                        "STATO"         : DettaglioSpedizioneTitoloDoc[i].STATO,
                                                        "QUANTITA_MGZN" : parseInt(DettaglioSpedizioneTitoloDoc[i].QUANTITA_MGZN),
                                                        "QUANTITA_DISP" : parseInt(DettaglioSpedizioneTitoloDoc[i].QUANTITA_DISP),
                                                        "Nuovo"         : false,
                                                        "Modificato"    : false,
                                                        "Eliminato"     : false,
                                                        "DATA"          : DettaglioSpedizioneTitoloDoc[i].DATA_ULTIMA_MODIFICA
                                                      }) 
                }
                SystemInformation.GetSQL('Teacher', {CHIAVE : $scope.ChiaveDocente}, function(Results)
                { 
                  $scope.DocenteDati = {};
                  DocenteDettaglio   = SystemInformation.FindResults(Results,'TeacherDettaglio');
                  IstitutiDoc        = SystemInformation.FindResults(Results,'TeacherInstitute');
                  ProvinciaDoc       = $scope.ListaProvinceAll.find(function(AProvincia){return(AProvincia.Chiave == DocenteDettaglio[0].PROVINCIA);});

                  if(DocenteDettaglio != undefined && IstitutiDoc != undefined)
                  {
                    $scope.SpedizioneInEditing.DOCENTE_NOME = DocenteDettaglio[0].RAGIONE_SOCIALE;
                    $scope.DocenteDati.PRESSO               = DocenteDettaglio[0].RAGIONE_SOCIALE;
                    $scope.DocenteDati.INDIRIZZO            = DocenteDettaglio[0].INDIRIZZO;
                    $scope.DocenteDati.COMUNE               = DocenteDettaglio[0].COMUNE;
                    $scope.DocenteDati.CAP                  = DocenteDettaglio[0].CAP;
                    $scope.DocenteDati.PROVINCIA            = DocenteDettaglio[0].PROVINCIA;
                    $scope.ListaIstitutiDoc                 = IstitutiDoc;    
                    $scope.CheckTitoliAlreadyGestitiDocente();         
                  }       
                  else SystemInformation.ApplyOnError('Modello dati docente per spedizione non conforme','');      
                },'SQLDettaglio'); 
            }
            else SystemInformation.ApplyOnError('Modello spedizione docente non conforme','');      
          },'SQLDettaglioSpedizioneDocente'); 
          
          $scope.PassaADaSpedire = function (Titolo)
          {
            if (Titolo.STATO == 'P')
            {
                if(Titolo.Nuovo == true)
                   Titolo.STATO = 'S';
                else 
                {
                  Titolo.STATO = 'S';
                  Titolo.Modificato = true;
                }          
            }
          }        
       }     

       //NUOVA SPEDIZIONE CASA EDITRICE
       if($scope.ChiaveDocente == -1 && $scope.ChiaveSpedizione == -1 && !($scope.SpedizioneMultipla))
       {
         $scope.NuovaSpedizioneCasaEd = true;
         $scope.SpedizioneInEditing = {};
         
         $scope.SpedizioneInEditing.CHIAVE          = -1;
         $scope.SpedizioneInEditing.PRESSO          = '';
         $scope.SpedizioneInEditing.STATO           = 'P';
         $scope.SpedizioneInEditing.INDIRIZZO       = '';
         $scope.SpedizioneInEditing.COMUNE          = '';
         $scope.SpedizioneInEditing.CAP             = '';
         $scope.SpedizioneInEditing.ISTITUTO        = -1;
         $scope.SpedizioneInEditing.PROVINCIA       = -1;
         $scope.SpedizioneInEditing.DATA            = new Date();
         $scope.ListaTitoliSpedizione               = [];
         $scope.ListaTitoliEliminati                = []; 
         
          $scope.PassaADaSpedire = function (Titolo)
          {
            if (Titolo.STATO == 'P')
            {
                if(Titolo.Nuovo == true)
                   Titolo.STATO = 'S';
                else 
                {
                  Titolo.STATO = 'S';
                  Titolo.Modificato = true;
                }          
            }
          } 
       }
       
       //MODIFICA SPEDIZIONE CASA EDITRICE
       if($scope.ChiaveDocente == -1 && $scope.ChiaveSpedizione != -1 && !($scope.SpedizioneMultipla))
       {         
         SystemInformation.GetSQL('Delivery',{CHIAVE : $scope.ChiaveSpedizione},function(Results)
         {
           $scope.SpedizioneInEditing = {};
           
           DettaglioSpedizioneCasa       = SystemInformation.FindResults(Results,'PublisherDelivery');
           DettaglioSpedizioneTitoloCasa = SystemInformation.FindResults(Results,'PublisherDeliveryBook');
           
           if(DettaglioSpedizioneCasa != undefined && DettaglioSpedizioneTitoloCasa != undefined)
           { 
               $scope.SpedizioneInEditing.CHIAVE           = $scope.ChiaveSpedizione;
               $scope.SpedizioneInEditing.PRESSO           = DettaglioSpedizioneCasa[0].PRESSO;
               $scope.SpedizioneInEditing.STATO            = DettaglioSpedizioneCasa[0].STATO;
               $scope.SpedizioneInEditing.INDIRIZZO        = DettaglioSpedizioneCasa[0].INDIRIZZO;
               $scope.SpedizioneInEditing.COMUNE           = DettaglioSpedizioneCasa[0].COMUNE;
               $scope.SpedizioneInEditing.CAP              = DettaglioSpedizioneCasa[0].CAP;
               $scope.SpedizioneInEditing.PROVINCIA        = DettaglioSpedizioneCasa[0].PROVINCIA
               $scope.SpedizioneInEditing.DATA             = new Date(DettaglioSpedizioneCasa[0].DATA);
               $scope.SpedizioneInEditing.ISTITUTO         = -1;
               $scope.ListaTitoliSpedizione                = [];
               $scope.ListaTitoliEliminati                 = [];
               
               for(let i = 0;i < DettaglioSpedizioneTitoloCasa.length;i ++)
               {
                   if(DettaglioSpedizioneTitoloCasa[i].SPEDIZIONE == $scope.ChiaveSpedizione)
                   $scope.ListaTitoliSpedizione.push({
                                                       "CHIAVE"        : DettaglioSpedizioneTitoloCasa[i].CHIAVE,
                                                       "SPEDIZIONE"    : DettaglioSpedizioneTitoloCasa[i].SPEDIZIONE,
                                                       "TITOLO"        : DettaglioSpedizioneTitoloCasa[i].TITOLO,
                                                       "ISBN_TITOLO"   : DettaglioSpedizioneTitoloCasa[i].ISBN_TITOLO,
                                                       "NOME_TITOLO"   : DettaglioSpedizioneTitoloCasa[i].NOME_TITOLO,
                                                       "QUANTITA"      : parseInt(DettaglioSpedizioneTitoloCasa[i].QUANTITA),
                                                       "STATO"         : DettaglioSpedizioneTitoloCasa[i].STATO,
                                                       "QUANTITA_MGZN" : parseInt(DettaglioSpedizioneTitoloCasa[i].QUANTITA_MGZN),
                                                       "QUANTITA_DISP" : parseInt(DettaglioSpedizioneTitoloCasa[i].QUANTITA_DISP),                                                       
                                                       "Nuovo"         : false,
                                                       "Modificato"    : false,
                                                       "Eliminato"     : false,
                                                       "DATA"          : DettaglioSpedizioneTitoloCasa[i].DATA_ULTIMA_MODIFICA
                                                     }) 
               }
           }
           else SystemInformation.ApplyOnError('Modello spedizione casa editrice non conforme','');      
         },'SQLDettaglioSpedizioneCasa');
         
         $scope.PassaADaSpedire = function (Titolo)
         {
           if (Titolo.STATO == 'P')
           {
               if(Titolo.Nuovo == true)
                  Titolo.STATO = 'S';
               else 
               {
                 Titolo.STATO = 'S';
                 Titolo.Modificato = true;
               }          
           }
         } 
       }
    }  

    $scope.CheckTitoliAlreadyGestitiDocente = function()
    {
      if($scope.ChiaveDocente != -1 && !$scope.SpedizioneMultipla && $scope.ChiaveDocente != undefined)
      {
         SystemInformation.GetSQL('Teacher',{SPEDIZIONE : $scope.ChiaveSpedizione , DOCENTE : $scope.ChiaveDocente},function(Results)
         {
           var ListaTitoliDocente = SystemInformation.FindResults(Results,'SearchTitoloGestito');
           if(ListaTitoliDocente != undefined)
           {
              if(ListaTitoliDocente.length > 0 && $scope.ListaTitoliSpedizione.length > 0)
              {
                 for(let i = 0; i < $scope.ListaTitoliSpedizione.length; i ++)
                 {
                    var TitoloCorrispondenteIndex = ListaTitoliDocente.findIndex(function(ATitolo){return(ATitolo.TITOLO == $scope.ListaTitoliSpedizione[i].TITOLO);});
                    if(TitoloCorrispondenteIndex != -1)
                       $scope.ListaTitoliSpedizione[i].GESTITO_PAST = true
                    else $scope.ListaTitoliSpedizione[i].GESTITO_PAST = false; 
                 }
              }
           }
           else SystemInformation.ApplyOnError('Modello titoli gestiti in passato dal docente non conforme','');       
         },'SearchTitolo');
      }
    } 
   
    /*$scope.AggiungiTitoloSpedizione = function (ev)
    {    
      $mdDialog.show({ 
                       controller          : DialogControllerTitoloSpedizione,
                       templateUrl         : "template/bookDeliveryPopup.html",
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
 
    function DialogControllerTitoloSpedizione($scope,$mdDialog)  
    {
      $scope.Titolo        = {};
      $scope.Multipla      = false;
      
      $scope.Titolo = {
                         "CHIAVE"        : -1,
                         "TITOLO"        : -1,
                         "NOME_TITOLO"   : '',
                         "ISBN_TITOLO"   : '',
                         "QUANTITA"      : 1,
                         "STATO"         : 'P',
                         "QUANTITA_MGZN" : null,
                         "QUANTITA_DISP" : 0,
                         "Nuovo"         : true,
                         "Modificato"    : false,
                         "Eliminato"     : false,
                         "DATA"          : new Date().toISOString().split('T')[0]                                
                      } 
                      
      if($scope.SpedizioneMultipla)
      {
         $scope.Multipla = true;
         if($scope.IstitutoSelezionato != '')
            $scope.NumeroDocenti = $scope.ListaDocentiSpedizionePerMultipla.length
         else $scope.NumeroDocenti = $scope.ListaDocentiSpedizione.length;
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
        {
           $scope.Titolo.TITOLO            = itemTit.Chiave;
           $scope.Titolo.NOME_TITOLO       = itemTit.Nome;
           $scope.Titolo.ISBN_TITOLO       = itemTit.Codice;
           $scope.Titolo.QUANTITA_MGZN     = itemTit.Quantita;
           $scope.Titolo.QUANTITA_MGZN_VOL = itemTit.QuantitaVol;
           $scope.Titolo.QUANTITA_DISP     = itemTit.QuantitaDisp;
        }
      }

      $scope.hide = function() 
      {
        $scope.TitoloPopup = undefined;
        $scope.searchTextTit = '';
        $mdDialog.hide();
      };

      $scope.AnnullaPopupTitolo = function() 
      {
        $scope.TitoloPopup = undefined;
        $scope.searchTextTit = '';
        $mdDialog.cancel();
      };

      $scope.ConfermaPopupTitolo = function()
      { 
        if($scope.Titolo.TITOLO == -1 || $scope.Titolo.QUANTITA == 0 || $scope.Titolo.STATO == null)
        {
          ZCustomAlert($mdDialog,'ATTENZIONE','DATI TITOLO MANCANTI!');
          return
        }
        else
        {                         
          $scope.ListaTitoliSpedizione.push($scope.Titolo);
          $scope.TitoloPopup = undefined;
          $scope.searchTextTit = '';
          $mdDialog.hide();
          $scope.CheckTitoliAlreadyGestitiDocente();
        }             
      }
    }*/
    
    $scope.EliminaTitolo = function(Titolo, index)
    {
      var EliminaTit = function()
      {
        if ($scope.ListaTitoliSpedizione[index].Nuovo)
            $scope.ListaTitoliSpedizione.splice(index,1)
        else
        {
          $scope.ListaTitoliEliminati.push($scope.ListaTitoliSpedizione[index]);
          $scope.ListaTitoliEliminati[$scope.ListaTitoliEliminati.length-1].Eliminato = true;
          $scope.ListaTitoliSpedizione.splice(index,1);
        }  
      } 
      ZConfirm.GetConfirmBox('AVVISO',"Eliminare il titolo " + Titolo.NOME_TITOLO + ' (ISBN:' + Titolo.ISBN_TITOLO + ')' + " dalla spedizione?",EliminaTit,function(){});      
    }
    
    $scope.ModificaTitolo = function (Titolo)
    {
      $mdDialog.show({ 
                       controller          : DialogControllerTitoloSpedizioneMod,
                       templateUrl         : "template/bookDeliveryPopup.html",
                       targetEvent         : Titolo,
                       scope               : $scope,
                       preserveScope       : true,
                       clickOutsideToClose : true,
                       locals              : {Titolo}
                     })
      .then(function(answer) 
      {}, 
      function() 
      {});
    }
    
    function DialogControllerTitoloSpedizioneMod($scope,$mdDialog,Titolo)  
    {       
      var OldTitolo = Titolo;

      $scope.Titolo = {
                         "CHIAVE"        : Titolo.CHIAVE, //CHIAVE DELLA RIGA DI SPEDIZIONE
                         "TITOLO"        : Titolo.TITOLO,
                         "NOME_TITOLO"   : Titolo.NOME_TITOLO,
                         "ISBN_TITOLO"   : Titolo.ISBN_TITOLO,
                         "QUANTITA"      : parseInt(Titolo.QUANTITA),
                         "QUANTITA_MGZN" : Titolo.QUANTITA_MGZN,
                         "QUANTITA_DISP" : Titolo.QUANTITA_DISP,
                         "STATO"         : Titolo.STATO,
                         "Nuovo"         : Titolo.Nuovo,
                         "Modificato"    : Titolo.Modificato,
                         "Eliminato"     : Titolo.Eliminato,
                         "GESTITO_PAST"  : false                                   
                      }
                      
      $scope.searchTextTit = Titolo.NOME_TITOLO;

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
        {
          $scope.Titolo.TITOLO        = itemTit.Chiave;
          $scope.Titolo.NOME_TITOLO   = itemTit.Nome;
          $scope.Titolo.ISBN_TITOLO   = itemTit.Codice;
          $scope.Titolo.QUANTITA_MGZN = itemTit.Quantita;
          $scope.Titolo.QUANTITA_DISP = itemTit.QuantitaDisp;
          $scope.Titolo.QUANTITA_VOL  = itemTit.QuantitaVol;
          $scope.Titolo.STATO         = "P";
          $scope.Titolo.Modificato    = true;
        }
      }
      
      $scope.hide = function() 
      {
        $scope.TitoloPopup = undefined;
        $scope.searchTextTit = '';
        $mdDialog.hide();
      };

      $scope.AnnullaPopupTitolo = function() 
      {
        $scope.TitoloPopup = undefined;
        $scope.searchTextTit = '';
        $mdDialog.cancel();
      };
      
      $scope.ConfermaPopupTitolo = function()
      { 
        if($scope.Titolo.TITOLO == -1 || $scope.Titolo.QUANTITA == 0 || $scope.Titolo.STATO == null)
        {
          ZCustomAlert($mdDialog,'ATTENZIONE','DATI TITOLO MANCANTI!');
          return
        }
        else
        {        
           if(OldTitolo.TITOLO == $scope.Titolo.TITOLO) //QUI TUTTO OLDTITOLO ERA TITOLO CORRISPONDENTE
           {
              //var TitoloCorrispondente = $scope.ListaTitoliSpedizione.find(function(ATitolo){return (ATitolo.CHIAVE == $scope.Titolo.CHIAVE);});
              if($scope.SpedizioneMultipla)
              {
                 if($scope.Titolo.STATO == 'S')
                 {
                    if(($scope.Titolo.QUANTITA * $scope.NumeroDocenti) > $scope.Titolo.QUANTITA_DISP)
                        OldTitolo.STATO = 'P'
                    else OldTitolo.STATO = 'S'
                 }
                 else OldTitolo.STATO = $scope.Titolo.STATO;
                 OldTitolo.QUANTITA = $scope.Titolo.QUANTITA;
                 if(OldTitolo.Nuovo)
                    OldTitolo.Modificato = false
                 else OldTitolo.Modificato = true; 
                 OldTitolo.DATA = new Date().toISOString().split('T')[0];  
              }
              else 
              {
                 if($scope.Titolo.STATO == 'S')
                 {
                    if($scope.Titolo.QUANTITA > $scope.Titolo.QUANTITA_DISP)
                    {
                        if($scope.Titolo.QUANTITA_DISP > 0)
                        {
                           $scope.ListaTitoliSpedizione.push(JSON.parse(JSON.stringify(OldTitolo)));
                           $scope.ListaTitoliSpedizione[$scope.ListaTitoliSpedizione.length - 1].CHIAVE        = -1;
                           $scope.ListaTitoliSpedizione[$scope.ListaTitoliSpedizione.length - 1].QUANTITA      = $scope.Titolo.QUANTITA_DISP;                 
                           $scope.ListaTitoliSpedizione[$scope.ListaTitoliSpedizione.length - 1].QUANTITA_MGZN = $scope.Titolo.QUANTITA_MGZN;
                           $scope.ListaTitoliSpedizione[$scope.ListaTitoliSpedizione.length - 1].QUANTITA_DISP = $scope.Titolo.QUANTITA_DISP;
                           $scope.ListaTitoliSpedizione[$scope.ListaTitoliSpedizione.length - 1].QUANTITA_VOL  = $scope.Titolo.QUANTITA_VOL;
                           $scope.ListaTitoliSpedizione[$scope.ListaTitoliSpedizione.length - 1].STATO         = 'S';
                           $scope.ListaTitoliSpedizione[$scope.ListaTitoliSpedizione.length - 1].Nuovo         = true;
                           $scope.ListaTitoliSpedizione[$scope.ListaTitoliSpedizione.length - 1].Modificato    = false;
                           $scope.ListaTitoliSpedizione[$scope.ListaTitoliSpedizione.length - 1].DATA          = new Date().toISOString().split('T')[0];
                        }
                        OldTitolo.QUANTITA   = $scope.Titolo.QUANTITA - $scope.Titolo.QUANTITA_DISP;
                        OldTitolo.STATO      = 'P';
                        OldTitolo.Modificato = true;
                    }
                    else
                    {
                        OldTitolo.QUANTITA = $scope.Titolo.QUANTITA;
                        OldTitolo.STATO    = 'S';
                        if(OldTitolo.Nuovo)
                           OldTitolo.Modificato = false
                        else OldTitolo.Modificato = true;  
                    }
                    OldTitolo.DATA = new Date().toISOString().split('T')[0]; 
                 }
                 else 
                 {
                    OldTitolo.QUANTITA = $scope.Titolo.QUANTITA;
                    OldTitolo.STATO    =  $scope.Titolo.STATO;
                    if(OldTitolo.Nuovo)
                       OldTitolo.Modificato = false
                    else OldTitolo.Modificato = true; 
                 }
              }
           }
           else 
           {
              if($scope.SpedizioneMultipla)
              {
                 if($scope.Titolo.STATO == 'S')
                 {
                    if(($scope.Titolo.QUANTITA * $scope.NumeroDocenti) > $scope.Titolo.QUANTITA_DISP)
                        OldTitolo.STATO = 'P';
                    else OldTitolo.STATO = 'S'; 
                 }
                 else OldTitolo.STATO = $scope.Titolo.STATO;

                 OldTitolo.TITOLO        = $scope.Titolo.TITOLO;
                 OldTitolo.ISBN_TITOLO   = $scope.Titolo.ISBN_TITOLO;
                 OldTitolo.NOME_TITOLO   = $scope.Titolo.NOME_TITOLO;
                 OldTitolo.QUANTITA      = $scope.Titolo.QUANTITA;
                 OldTitolo.QUANTITA_MGZN = $scope.Titolo.QUANTITA_MGZN;
                 OldTitolo.QUANTITA_DISP = $scope.Titolo.QUANTITA_DISP;  
                 OldTitolo.QUANTITA_VOL  = $scope.Titolo.QUANTITA_VOL;                                                    
                 OldTitolo.DATA          = new Date().toISOString().split('T')[0]; 
                 if(OldTitolo.Nuovo)
                    OldTitolo.Modificato = false
                 else OldTitolo.Modificato = true; 
              }
              else 
              {
                 if($scope.Titolo.STATO == 'S')
                 {
                    if($scope.Titolo.QUANTITA > $scope.Titolo.QUANTITA_DISP)
                    {     
                       if($scope.Titolo.QUANTITA_DISP > 0)
                       {
                          $scope.ListaTitoliSpedizione.push(JSON.parse(JSON.stringify(OldTitolo)));
                          $scope.ListaTitoliSpedizione[$scope.ListaTitoliSpedizione.length - 1].CHIAVE        = -1;
                          $scope.ListaTitoliSpedizione[$scope.ListaTitoliSpedizione.length - 1].QUANTITA      = $scope.Titolo.QUANTITA_DISP;                 
                          $scope.ListaTitoliSpedizione[$scope.ListaTitoliSpedizione.length - 1].QUANTITA_MGZN = $scope.Titolo.QUANTITA_MGZN;
                          $scope.ListaTitoliSpedizione[$scope.ListaTitoliSpedizione.length - 1].QUANTITA_DISP = $scope.Titolo.QUANTITA_DISP;
                          $scope.ListaTitoliSpedizione[$scope.ListaTitoliSpedizione.length - 1].QUANTITA_VOL  = $scope.Titolo.QUANTITA_VOL;
                          $scope.ListaTitoliSpedizione[$scope.ListaTitoliSpedizione.length - 1].STATO         = 'S';
                          $scope.ListaTitoliSpedizione[$scope.ListaTitoliSpedizione.length - 1].TITOLO        = $scope.Titolo.TITOLO;
                          $scope.ListaTitoliSpedizione[$scope.ListaTitoliSpedizione.length - 1].ISBN_TITOLO   = $scope.Titolo.ISBN_TITOLO;
                          $scope.ListaTitoliSpedizione[$scope.ListaTitoliSpedizione.length - 1].NOME_TITOLO   = $scope.Titolo.NOME_TITOLO;
                          $scope.ListaTitoliSpedizione[$scope.ListaTitoliSpedizione.length - 1].Nuovo         = true;
                          $scope.ListaTitoliSpedizione[$scope.ListaTitoliSpedizione.length - 1].Modificato    = false;
                          $scope.ListaTitoliSpedizione[$scope.ListaTitoliSpedizione.length - 1].DATA          = new Date().toISOString().split('T')[0];
                       }
                       OldTitolo.QUANTITA      = $scope.Titolo.QUANTITA - $scope.Titolo.QUANTITA_DISP;
                       OldTitolo.STATO         = 'P';
                    } 
                    else 
                    {
                        OldTitolo.STATO    = 'S';
                        OldTitolo.QUANTITA = $scope.Titolo.QUANTITA;
                    }
                    OldTitolo.TITOLO        = $scope.Titolo.TITOLO;
                    OldTitolo.ISBN_TITOLO   = $scope.Titolo.ISBN_TITOLO;
                    OldTitolo.NOME_TITOLO   = $scope.Titolo.NOME_TITOLO;
                    OldTitolo.QUANTITA_MGZN = $scope.Titolo.QUANTITA_MGZN;
                    OldTitolo.QUANTITA_DISP = $scope.Titolo.QUANTITA_DISP;  
                    OldTitolo.QUANTITA_VOL  = $scope.Titolo.QUANTITA_VOL; 
                    OldTitolo.DATA          = new Date().toISOString().split('T')[0];  
                    if(OldTitolo.Nuovo)
                       OldTitolo.Modificato = false
                    else OldTitolo.Modificato = true; 
                 }
                 else
                 {
                    OldTitolo.TITOLO        = $scope.Titolo.TITOLO;
                    OldTitolo.ISBN_TITOLO   = $scope.Titolo.ISBN_TITOLO;
                    OldTitolo.NOME_TITOLO   = $scope.Titolo.NOME_TITOLO;
                    OldTitolo.QUANTITA      = $scope.Titolo.QUANTITA;
                    OldTitolo.QUANTITA_MGZN = $scope.Titolo.QUANTITA_MGZN;
                    OldTitolo.QUANTITA_DISP = $scope.Titolo.QUANTITA_DISP;  
                    OldTitolo.QUANTITA_VOL  = $scope.Titolo.QUANTITA_VOL;  
                    OldTitolo.STATO         =  $scope.Titolo.STATO; 
                    OldTitolo.DATA          = new Date().toISOString().split('T')[0];  
                    if(OldTitolo.Nuovo)
                       OldTitolo.Modificato = false
                    else OldTitolo.Modificato = true; 
                 }
              }
           }
        }
        $scope.TitoloPopup = undefined;
        $scope.CheckTitoliAlreadyGestitiDocente();

        $scope.searchTextTit = '';        
        $mdDialog.hide();           
      }
    }

    $scope.AggiungiTitoliMultipli = function(ev)
    {
      $mdDialog.show({ 
                       controller          : DialogControllerTitoliMultipli,
                       templateUrl         : "template/addMultipleBookFilterPopup.html",
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

    function DialogControllerTitoliMultipli()
    {
      $scope.NomeFiltro        = '';
      $scope.CodiceFiltro      = '';
      $scope.AutoreFiltro      = '';              
      $scope.ListaTitoliToAdd  = [];

      $scope.GridOptions_3 = {
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
      
      $scope.hide = function() 
      {
        $mdDialog.hide();
      };
  
      $scope.AnnullaPopup = function() 
      {
        for(let i = 0;i < $scope.ListaTitoliPopup.length;i ++)
            $scope.ListaTitoliPopup[i].DaAggiungere = false;
        $scope.NomeFiltro        = '';
        $scope.CodiceFiltro      = '';              
        $scope.ListaTitoliToAdd  = [];
        $mdDialog.cancel();
      };
  
      $scope.ConfermaPopup = function()
      {  
        for(let j = 0;j < $scope.ListaTitoliPopup.length;j ++)
        {
          if($scope.ListaTitoliPopup[j].DaAggiungere)
          {
             $scope.ListaTitoliToAdd.push($scope.ListaTitoliPopup[j]); 
             $scope.ListaTitoliPopup[j].DaAggiungere = false;
          }
        }                   
        $scope.NomeFiltro   = '';
        $scope.CodiceFiltro = '';        
        $mdDialog.hide();
        $scope.GestisciTitoliAggiunti($scope.ListaTitoliToAdd)          
      };
    }

    $scope.GestisciTitoliAggiunti = function(ListaTitoli)
    {
      $mdDialog.show({ 
                        controller          : DialogControllerGestioneTitoliMultipli,
                        templateUrl         : "template/handleMultipleBookPopup.html",
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

    function DialogControllerGestioneTitoliMultipli($scope,$mdDialog,ListaTitoli)
    {
      $scope.ListaTitoliToHandle = ListaTitoli
      
      if($scope.SpedizioneMultipla)
      {
          //$scope.Multipla = true;
          if($scope.IstitutoSelezionato != '')
            $scope.NumeroDocenti = $scope.ListaDocentiSpedizionePerMultipla.length
          else $scope.NumeroDocenti = $scope.ListaDocentiSpedizione.length;
      }

      for(let i = 0;i < $scope.ListaTitoliToHandle.length;i ++)
      {
        $scope.ListaTitoliToHandle[i] = {
                                          //"CHIAVE"            : -1,
                                          "TITOLO"            : $scope.ListaTitoliToHandle[i].Chiave,
                                          "NOME_TITOLO"       : $scope.ListaTitoliToHandle[i].Nome,
                                          "QUANTITA"          : 1,
                                          "ISBN_TITOLO"       : $scope.ListaTitoliToHandle[i].Codice,
                                          "STATO"             : null,
                                          "QUANTITA_MGZN"     : $scope.ListaTitoliToHandle[i].Quantita,
                                          "QUANTITA_MGZN_VOL" : $scope.ListaTitoliToHandle[i].QuantitaVol,
                                          "QUANTITA_DISP"     : $scope.ListaTitoliToHandle[i].QuantitaDisp,
                                          "Nuovo"             : true,
                                          "Modificato"        : false,
                                          "Eliminato"         : false,
                                          "DATA"              : new Date().toISOString().split('T')[0]                                    
                                        }
      }

      $scope.hide = function() 
      {
        $mdDialog.hide();
      };

      $scope.SetTuttiPrenotati = function()
      {
        for(let i = 0;i < $scope.ListaTitoliToHandle.length;i ++)
            $scope.ListaTitoliToHandle[i].STATO = 'P'
      }

      $scope.SetTuttiDaSpedire = function()
      {
        for(let i = 0;i < $scope.ListaTitoliToHandle.length;i ++)
            if($scope.SpedizioneMultipla)
            {
               if(($scope.ListaTitoliToHandle[i].QUANTITA * $scope.NumeroDocenti) <= $scope.ListaTitoliToHandle[i].QUANTITA_DISP)
                   $scope.ListaTitoliToHandle[i].STATO = 'S'
               else $scope.ListaTitoliToHandle[i].STATO = 'P';   
            }
            else $scope.ListaTitoliToHandle[i].STATO = 'S'
      }

      $scope.AnnullaMultipliPopup = function() 
      {
        $scope.ListaTitoliToHandle = [];
        $mdDialog.cancel();
      };

      $scope.ConfermaMultipliPopup = function()
      {
        for(let i = 0;i < $scope.ListaTitoliToHandle.length;i ++)
        {
           if($scope.ListaTitoliToHandle[i].TITOLO == -1 || $scope.ListaTitoliToHandle[i].QUANTITA == 0 || $scope.ListaTitoliToHandle[i].STATO == null)
           {
              ZCustomAlert($mdDialog,'ATTENZIONE','DATI TITOLO MANCANTI!');
              return
           }
           else
           {
              if($scope.SpedizioneMultipla)
              {
                if((($scope.ListaTitoliToHandle[i].QUANTITA * $scope.NumeroDocenti) > $scope.ListaTitoliToHandle[i].QUANTITA_DISP) && $scope.ListaTitoliToHandle[i].STATO == 'S')
                {
                  $scope.ListaTitoliToHandle[i].STATO = 'P';  
                  $scope.ListaTitoliSpedizione.push($scope.ListaTitoliToHandle[i]);
                } 
                else $scope.ListaTitoliSpedizione.push($scope.ListaTitoliToHandle[i]);
              }
              else
              {
                /*if(($scope.ListaTitoliToHandle[i].QUANTITA >  $scope.ListaTitoliToHandle[i].QUANTITA_DISP) && $scope.ListaTitoliToHandle[i].STATO == 'S') 
                    $scope.ListaTitoliToHandle[i].STATO = 'P';*/

                if($scope.ListaTitoliToHandle[i].STATO == 'S')
                {
                   if(($scope.ListaTitoliToHandle[i].QUANTITA >  $scope.ListaTitoliToHandle[i].QUANTITA_DISP))
                   {
                       if($scope.ListaTitoliToHandle[i].QUANTITA_DISP > 0)
                       {
                          $scope.ListaTitoliSpedizione.push(JSON.parse(JSON.stringify($scope.ListaTitoliToHandle[i])));
                          $scope.ListaTitoliSpedizione[$scope.ListaTitoliSpedizione.length - 1].QUANTITA = $scope.ListaTitoliToHandle[i].QUANTITA_DISP;
                       }
                       $scope.ListaTitoliSpedizione.push(JSON.parse(JSON.stringify($scope.ListaTitoliToHandle[i])));
                       $scope.ListaTitoliSpedizione[$scope.ListaTitoliSpedizione.length - 1].QUANTITA = $scope.ListaTitoliToHandle[i].QUANTITA - $scope.ListaTitoliToHandle[i].QUANTITA_DISP;
                       $scope.ListaTitoliSpedizione[$scope.ListaTitoliSpedizione.length - 1].STATO    = 'P';
                   }
                   else $scope.ListaTitoliSpedizione.push(JSON.parse(JSON.stringify($scope.ListaTitoliToHandle[i])));  
                }
                else $scope.ListaTitoliSpedizione.push(JSON.parse(JSON.stringify($scope.ListaTitoliToHandle[i])));
              } 
              //$scope.ListaTitoliSpedizione.push($scope.ListaTitoliToHandle[i]);
           }
        }
        $scope.ListaTitoliToHandle = [];
        $mdDialog.hide();
        $scope.CheckTitoliAlreadyGestitiDocente();
      }
    }  

    $scope.ShowInfoCsv = function()
    {
      $scope.ViewInfoCsv = !$scope.ViewInfoCsv;
    }
    
    function Base64DecodeUnicode(str) 
    {
      percentEncodedStr = atob(str).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''); 
      return decodeURIComponent(percentEncodedStr);
    } 

    $scope.ImportazioneTitoliCsv = function()
    { 
      document.getElementById('fileLoadCVSDocument').click();    
    }

    $scope.CVSLoaded = function(fileInfo)
    { 
      var ListaCodiciEsclusi    = [];
      var ListaTitoliNonGestiti = [];
      var ListaTitoliErrati     = [];
      var ListaEccedenza        = [];
      var file                  = fileInfo.files[0];
      if(file) 
      {
        var reader = new FileReader();
        reader.onloadend = function(evt)
        {
          var Csv            = reader.result.split(",");         
          var CsvSplitted    = (Base64DecodeUnicode(Csv[1])).split("\n");
          var i = 0;
          
          var CreaSpedizione = function()
          {
            while (i < CsvSplitted.length)          
            {
              let RecordOrdine  = CsvSplitted[i++].split(";");
              if(RecordOrdine.length > 1)
              {         
                 RecordOrdine[0]   = RecordOrdine[0].trim();
                 RecordOrdine[1]   = RecordOrdine[1].trim();
                 let TitoloCorrisp = $scope.ListaTitoliCsv.find(function(ATitolo) {return(ATitolo.Codice == RecordOrdine[0]);});
                 if (TitoloCorrisp == undefined)
                 {
                   ListaCodiciEsclusi.push({
                                             Codice     : RecordOrdine[0],
                                             Quantita   : parseInt(RecordOrdine[1])
                                           })
                 }
                 else            
                 { 
                   if(parseInt(RecordOrdine[1]) <= TitoloCorrisp.QuantitaDisp) 
                   {                
                      $scope.ListaTitoliSpedizione.push({
                                                          "CHIAVE"            : -1,
                                                          "TITOLO"            : TitoloCorrisp.Chiave,
                                                          "NOME_TITOLO"       : TitoloCorrisp.Nome,
                                                          "QUANTITA"          : parseInt(RecordOrdine[1]),
                                                          "ISBN_TITOLO"       : TitoloCorrisp.Codice,
                                                          "STATO"             : 'S',
                                                          "QUANTITA_MGZN"     : TitoloCorrisp.Quantita,
                                                          "QUANTITA_MGZN_VOL" : TitoloCorrisp.QuantitaVol,
                                                          "QUANTITA_DISP"     : TitoloCorrisp.QuantitaDisp,
                                                          "Nuovo"             : true,
                                                          "Modificato"        : false,
                                                          "Eliminato"         : false,
                                                          "DATA"              : new Date().toISOString().split('T')[0]     
                                                        })
                   }
                   else 
                   {
                      $scope.ListaTitoliSpedizione.push({
                                                          "CHIAVE"            : -1,
                                                          "TITOLO"            : TitoloCorrisp.Chiave,
                                                          "NOME_TITOLO"       : TitoloCorrisp.Nome,
                                                          "QUANTITA"          : TitoloCorrisp.QuantitaDisp,
                                                          "ISBN_TITOLO"       : TitoloCorrisp.Codice,
                                                          "STATO"             : 'S',
                                                          "QUANTITA_MGZN"     : TitoloCorrisp.Quantita,
                                                          "QUANTITA_MGZN_VOL" : TitoloCorrisp.QuantitaVol,
                                                          "QUANTITA_DISP"     : TitoloCorrisp.QuantitaDisp,
                                                          "Nuovo"             : true,
                                                          "Modificato"        : false,
                                                          "Eliminato"         : false,
                                                          "DATA"              : new Date().toISOString().split('T')[0]    
                                                        })
                      ListaEccedenza.push({
                                              QuantitaOltre : parseInt(RecordOrdine[1]) - TitoloCorrisp.QuantitaDisp,
                                              Codice        : RecordOrdine[0],
                                              Nome          : TitoloCorrisp.Nome
                                            }) 
                   }
                   if($scope.ListaTitoliSpedizione[$scope.ListaTitoliSpedizione.length - 1].QUANTITA == 0)
                      $scope.ListaTitoliSpedizione.pop();                                   
                 } 
              }
            }
            if(ListaCodiciEsclusi.length != 0)
            {
               for(let i = 0;i < ListaCodiciEsclusi.length;i ++)
               {
                   TitoloTrovato = $scope.ListaTitoliCsvNoFilter.find(function(ATitolo){return(ATitolo.Codice == ListaCodiciEsclusi[i].Codice);});
                   if(TitoloTrovato != undefined)
                   {
                    ListaTitoliNonGestiti.push({
                                                 Codice     : TitoloTrovato.Codice,
                                                 Quantita   : ListaCodiciEsclusi[i].Quantita,
                                                 Nome       : TitoloTrovato.Nome,
                                                 Editore    : TitoloTrovato.Editore                                                 
                                               })
                   }
                   else ListaTitoliErrati.push({
                                                 Codice     : ListaCodiciEsclusi[i].Codice,
                                                 Quantita   : ListaCodiciEsclusi[i].Quantita,
                                               })                        
               }
            }
            var StringaEccedenza  = '⬤ TITOLI INSERITI MA LA GIACENZA NON COPRE LA QUANTITA RICHIESTA : ';
            var StringaNonGestiti = ' ⬤ TITOLI NON GESTITI : ';
            var StringaErrati     = ' ⬤ ISBN ERRATI : ';
            var StringaFinale     = '';

            for(let i = 0;i < ListaEccedenza.length; i ++)
            {
                StringaEccedenza = StringaEccedenza + ' • ' + ListaEccedenza[i].Nome + ' (' + ListaEccedenza[i].Codice + ') (-' + ListaEccedenza[i].QuantitaOltre + ')'; 
            }
            for(let i = 0;i < ListaTitoliNonGestiti.length; i ++)
            {
                StringaNonGestiti = StringaNonGestiti +  ' • ' + ListaTitoliNonGestiti[i].Nome + ' (' + ListaTitoliNonGestiti[i].Codice + ') (' + ListaTitoliNonGestiti[i].Quantita + ') (' + ListaTitoliNonGestiti[i].Editore + ')'; 
            }
            for(let i = 0;i < ListaTitoliErrati.length; i ++)
            {
                StringaErrati = StringaErrati +  ' • ' + ListaTitoliErrati[i].Codice + ' (' + ListaTitoliErrati[i].Quantita + ')'; 
            }
            StringaFinale = StringaFinale + (ListaEccedenza.length != 0 ? StringaEccedenza : '') + (ListaTitoliNonGestiti.length != 0 ? StringaNonGestiti : '') + (ListaTitoliErrati.length != 0 ? StringaErrati : '');
            
            if(ListaEccedenza.length != 0 || ListaTitoliNonGestiti.length != 0 || ListaTitoliErrati.length != 0) 
               ZCustomAlert($mdDialog,'ATTENZIONE!',StringaFinale);           
          }
          CreaSpedizione()
        }
      }
      reader.readAsDataURL(file); 
    }
    
    $scope.OnAnnullaSpedizione = function()
    { 
      $scope.SpedizioneInEditing  = {};
      $scope.DocenteDati          = {};
      $scope.ListaIstitutiDoc     = [];
      $scope.ListaTitoliEliminati = [];      
      switch (SystemInformation.DataBetweenController.Provenienza)
      {
         case 'TeacherPage'  : SystemInformation.DataBetweenDelivery.MateriaFiltro        = SystemInformation.DataBetweenController.MateriaFiltro;
                               SystemInformation.DataBetweenDelivery.MateriaFiltroNome    = SystemInformation.DataBetweenController.MateriaFiltroNome;
                               SystemInformation.DataBetweenDelivery.IstitutoFiltrato     = SystemInformation.DataBetweenController.IstitutoFiltrato;
                               SystemInformation.DataBetweenDelivery.IstitutoFiltratoNome = SystemInformation.DataBetweenController.IstitutoFiltratoNome;
                               SystemInformation.DataBetweenDelivery.Provenienza          = SystemInformation.DataBetweenController.Provenienza;
                               $state.go("teacherListPage");
                               //SystemInformation.DataBetweenDelivery.Pagina               = SystemInformation.DataBetweenController.Pagina;
                               SystemInformation.DataBetweenController = {};
                               break;
         case 'DeliveryPage' : $state.go("deliveryListPage");
                               SystemInformation.DataBetweenController = {};
                               break;
         case 'StartPage'    : $state.go("startPage");
                               SystemInformation.DataBetweenController = {};
                               break;
      }  
    }

    $scope.ConfermaSpedizione = function()
    {
      if($scope.ListaTitoliSpedizione.length == 0)
      {
         ZCustomAlert($mdDialog,'ATTENZIONE','NESSUN TITOLO INSERITO PER LA SPEDIZIONE!')
         return
      }
      else
      {   
          var VaiAvanti = function()
          {    
             var SalvaEStampa = function()
             {
                 var ChiaviDaFiltrare = [];
                 $ObjQuery = {Operazioni : []};

                 var Finito = function()
                 {
                   ChiaviDaFiltrare = ChiaviDaFiltrare.toString();
                   SystemInformation.GetSQL('Delivery',{KeyToSearch : ChiaviDaFiltrare} ,function(Results)
                   {
                     NewChiaviToSend = SystemInformation.FindResults(Results,'SmallNewToSend');
                     SystemInformation.DataBetweenController.ListaChiaviFromAdvanced = [];
                     if(NewChiaviToSend != undefined)
                     {
                       for(let i = 0;i < NewChiaviToSend.length;i ++)
                           SystemInformation.DataBetweenController.ListaChiaviFromAdvanced.push(NewChiaviToSend[i].CHIAVE)
                       
                       if(SystemInformation.DataBetweenController.ListaChiaviFromAdvanced.length > 0)
                       {
                         $ObjQuery.Operazioni          = [];
                         $scope.SpedizioneInEditing    = {};
                         $scope.ListaDocentiSpedizione = [];
                         $scope.ListaDocentiEsclusi    = [];
                         SystemInformation.DataBetweenDelivery.MateriaFiltro        = SystemInformation.DataBetweenController.MateriaFiltro;
                         SystemInformation.DataBetweenDelivery.MateriaFiltroNome    = SystemInformation.DataBetweenController.MateriaFiltroNome;
                         SystemInformation.DataBetweenDelivery.IstitutoFiltrato     = SystemInformation.DataBetweenController.IstitutoFiltrato;
                         SystemInformation.DataBetweenDelivery.IstitutoFiltratoNome = SystemInformation.DataBetweenController.IstitutoFiltratoNome;
                         SystemInformation.DataBetweenDelivery.Provenienza          = SystemInformation.DataBetweenController.Provenienza;
                         $state.go('printLabelPage');
                       }
                     }
                     else SystemInformation.ApplyOnError("Errore nell'ottenimento delle chiavi appena generate")
                   },'SelectKeyToSend')
                 }

                 if ($scope.SpedizioneMultipla && !($scope.SpedizioneAIstituto))
                 {
                     SystemInformation.DataBetweenController.ListaChiaviFromAdvanced = [];
                     var i = 0;
                     
                     var GestisciDocInclusi = function()
                     {
                       if(i > $scope.ListaDocentiSpedizione.length - 1)
                          Finito()
                       else
                       {
                             $ObjQuery = {Operazioni : []};
                             ParamSpedizione = {
                                                 "CHIAVE"         : $scope.SpedizioneInEditing.CHIAVE,
                                                 "DOCENTE"        : $scope.ListaDocentiSpedizione[i].ChiaveDocente,
                                                 "PRESSO"         : $scope.ListaDocentiSpedizione[i].NomeDocente,
                                                 "INDIRIZZO"      : $scope.ListaDocentiSpedizione[i].IndirizzoDocente,
                                                 "COMUNE"         : $scope.ListaDocentiSpedizione[i].ComuneDocente,
                                                 "CAP"            : $scope.ListaDocentiSpedizione[i].CapDocente,
                                                 "PROVINCIA"      : $scope.ListaDocentiSpedizione[i].ProvinciaDocente,
                                                 "DATA"           : $scope.SpedizioneInEditing.DATA,
                                                 "ISTITUTO"       : null
                                               }
                             $ObjQuery.Operazioni.push({
                                                         Query     : 'InsertDelivery',
                                                         Parametri : ParamSpedizione   
                                                       });
                             for(let j = 0; j < $scope.ListaTitoliSpedizione.length;j ++)
                             {
                                 var ParamTitolo = {
                                                     "TITOLO"     : $scope.ListaTitoliSpedizione[j].TITOLO,  
                                                     "QUANTITA"   : $scope.ListaTitoliSpedizione[j].QUANTITA,
                                                     "STATO"      : $scope.ListaTitoliSpedizione[j].STATO
                                                   }
                                 if($scope.ListaTitoliSpedizione[j].Nuovo)
                                 {
                                   $ObjQuery.Operazioni.push({
                                                               Query     : 'InsertDeliveryBookAfterInsert',
                                                               Parametri : ParamTitolo,
                                                               ResetKeys : [2]
                                                             });
                                 }             
                             }
                             SystemInformation.PostSQL('Delivery',$ObjQuery,function(Answer)
                             {
                               for(let k = 0;k < Answer.NewKeys.length;k ++)
                               {                           
                               if(Answer.NewKeys[k].Id == 2)                            
                                   ChiaviDaFiltrare.push(Answer.NewKeys[k].Value)
                               } 
                               i++;
                               GestisciDocInclusi();            
                             });  
                       }
                     }
                     if($scope.ListaDocentiSpedizione.length > 0)
                        GestisciDocInclusi()                 
                 }
                 else if ($scope.SpedizioneMultipla && $scope.SpedizioneAIstituto)
                 {
                         
                         SystemInformation.DataBetweenController.ListaChiaviFromAdvanced = [];
                         //SystemInformation.DataBetweenController.Provenienza = 'NOT_ADVANCED';
                         var SaltaInclusi = false;

                         var i = 0;
                         var m = 0;
                         var GestisciDocInclusi = function()
                         {
                           if(i > $scope.ListaDocentiSpedizione.length - 1 || SaltaInclusi)
                           {
                             if($scope.ListaDocentiEsclusi.length == 0)
                                Finito()
                             else 
                                if(m > $scope.ListaDocentiEsclusi.length - 1)
                                   Finito()
                                else GestisciDocEsclusi()
                           }
                           else
                           {
                                 $ObjQuery = {Operazioni : []};
                                 ParamSpedizione = {
                                                     "CHIAVE"         : $scope.SpedizioneInEditing.CHIAVE,
                                                     "DOCENTE"        : $scope.ListaDocentiSpedizione[i].ChiaveDocente,
                                                     "PRESSO"         : $scope.ListaDocentiSpedizione[i].NomeDocente,
                                                     "INDIRIZZO"      : $scope.SpedizioneInEditing.INDIRIZZO,
                                                     "COMUNE"         : $scope.SpedizioneInEditing.COMUNE,
                                                     "CAP"            : $scope.SpedizioneInEditing.CAP,
                                                     "PROVINCIA"      : $scope.SpedizioneInEditing.PROVINCIA,
                                                     "DATA"           : $scope.SpedizioneInEditing.DATA,
                                                     "ISTITUTO"       : $scope.SpedizioneInEditing.ISTITUTO
                                                   }
                                 $ObjQuery.Operazioni.push({
                                                             Query     : 'InsertDelivery',
                                                             Parametri : ParamSpedizione   
                                                           });
                                 for(let j = 0; j < $scope.ListaTitoliSpedizione.length;j ++)
                                 {
                                     var ParamTitolo = {
                                                         "TITOLO"     : $scope.ListaTitoliSpedizione[j].TITOLO,  
                                                         "QUANTITA"   : $scope.ListaTitoliSpedizione[j].QUANTITA,
                                                         "STATO"      : $scope.ListaTitoliSpedizione[j].STATO
                                                       }
                                     if($scope.ListaTitoliSpedizione[j].Nuovo)
                                     {
                                       $ObjQuery.Operazioni.push({
                                                                   Query     : 'InsertDeliveryBookAfterInsert',
                                                                   Parametri : ParamTitolo,
                                                                   ResetKeys : [2]
                                                                 });
                                     }             
                                 }
                                 SystemInformation.PostSQL('Delivery',$ObjQuery,function(Answer)
                                 {
                                   for(let k = 0;k < Answer.NewKeys.length;k ++)
                                   {                           
                                   if(Answer.NewKeys[k].Id == 2)                            
                                       ChiaviDaFiltrare.push(Answer.NewKeys[k].Value)
                                   } 
                                   i++;
                                   GestisciDocInclusi();            
                                 });  
                           }
                         }

                         var GestisciDocEsclusi = function()
                         {
                                 $ObjQuery = {Operazioni : []};
                                 ParamSpedizione = {
                                                     "CHIAVE"         : $scope.SpedizioneInEditing.CHIAVE,
                                                     "DOCENTE"        : $scope.ListaDocentiEsclusi[m].ChiaveDocente,
                                                     "PRESSO"         : $scope.ListaDocentiEsclusi[m].NomeDocente,
                                                     "INDIRIZZO"      : $scope.SpedizioneInEditing.INDIRIZZO,
                                                     "COMUNE"         : $scope.SpedizioneInEditing.COMUNE,
                                                     "CAP"            : $scope.SpedizioneInEditing.CAP,
                                                     "PROVINCIA"      : $scope.SpedizioneInEditing.PROVINCIA,
                                                     "DATA"           : $scope.SpedizioneInEditing.DATA,
                                                     "ISTITUTO"       : $scope.SpedizioneInEditing.ISTITUTO                                          
                                                   }
                                 $ObjQuery.Operazioni.push({
                                                             Query     : 'InsertDelivery',
                                                             Parametri : ParamSpedizione   
                                                           });
                                 for(let n = 0; n < $scope.ListaTitoliSpedizione.length;n ++)
                                 {
                                     var ParamTitolo = {
                                                         "TITOLO"     : $scope.ListaTitoliSpedizione[n].TITOLO,  
                                                         "QUANTITA"   : $scope.ListaTitoliSpedizione[n].QUANTITA,
                                                         "STATO"      : $scope.ListaTitoliSpedizione[n].STATO
                                                       }
                                     if($scope.ListaTitoliSpedizione[n].Nuovo)
                                     {
                                       $ObjQuery.Operazioni.push({
                                                                   Query     : 'InsertDeliveryBookAfterInsert',
                                                                   Parametri : ParamTitolo,
                                                                   ResetKeys : [2]
                                                                 });
                                     }             
                                 }
                                 SystemInformation.PostSQL('Delivery',$ObjQuery,function(Answer)
                                 {
                                   for(let o = 0;o < Answer.NewKeys.length;o ++)
                                   {                           
                                    if(Answer.NewKeys[o].Id == 2)                            
                                       ChiaviDaFiltrare.push(Answer.NewKeys[o].Value)
                                   }
                                   m++;
                                   if(m > $scope.ListaDocentiEsclusi.length - 1)
                                      Finito()
                                   else GestisciDocEsclusi()                  
                                 });          
                         } 

                         if($scope.ListaDocentiSpedizione.length > 0)
                             GestisciDocInclusi()
                         else 
                         {
                           SaltaInclusi = true;
                           GestisciDocEsclusi() 
                         }                   
                 }
                 else
                 {         
                     if ($scope.SpedizioneInEditing.INDIRIZZO == '' || $scope.SpedizioneInEditing.COMUNE == '' || $scope.SpedizioneInEditing.CAP == '' || $scope.SpedizioneInEditing.PROVINCIA == -1)
                     {    
                         ZCustomAlert($mdDialog,'ATTENZIONE','DATI SPEDIZIONE MANCANTI!')
                         return         
                     }
                     else
                     {
                       $ObjQuery = {Operazioni : []};
                       ParamSpedizione  = {
                                           "CHIAVE"         : $scope.SpedizioneInEditing.CHIAVE,
                                           "DOCENTE"        : $scope.SpedizioneInEditing.DOCENTE == undefined ? null : $scope.SpedizioneInEditing.DOCENTE,
                                           "PRESSO"         : $scope.SpedizioneInEditing.PRESSO,
                                           "INDIRIZZO"      : $scope.SpedizioneInEditing.INDIRIZZO,
                                           "COMUNE"         : $scope.SpedizioneInEditing.COMUNE,
                                           "CAP"            : $scope.SpedizioneInEditing.CAP,
                                           "PROVINCIA"      : $scope.SpedizioneInEditing.PROVINCIA,
                                           "DATA"           : $scope.SpedizioneInEditing.DATA,
                                           "ISTITUTO"       : ($scope.SpedizioneInEditing.ISTITUTO == -1 || $scope.SpedizioneInEditing.ISTITUTO == '') ? null : $scope.SpedizioneInEditing.ISTITUTO  
                                         }
                                             
                       var NuovaSpedizione = ($scope.SpedizioneInEditing.CHIAVE == -1);
                       if (NuovaSpedizione)
                       {
                         $ObjQuery.Operazioni.push({
                                                     Query     : 'InsertDelivery',
                                                     Parametri : ParamSpedizione   
                                                   })
                       }
                       else
                       {
                         $ObjQuery.Operazioni.push({
                                                     Query     : 'UpdateDelivery',
                                                     Parametri : ParamSpedizione   
                                                   })         
                       }
                       
                       if (!NuovaSpedizione && $scope.ListaTitoliEliminati.length != 0)
                       {
                         for(let j = 0; j < $scope.ListaTitoliEliminati.length ;j ++)
                         {
                           var ParamTitolo = {
                                               CHIAVE : $scope.ListaTitoliEliminati[j].CHIAVE
                                             }
                           if ($scope.ListaTitoliEliminati[j].Eliminato)
                           {
                             $ObjQuery.Operazioni.push({
                                                         Query     : 'DeleteDeliveryBook',
                                                         Parametri : ParamTitolo
                                                       });
                           }
                         }
                         SystemInformation.PostSQL('Delivery',$ObjQuery,function(Answer)
                         {
                           $scope.ListaTitoliEliminati = [];
                           $ObjQuery.Operazioni = [];
                         });  
                       }           
                       
                       for(let i = 0; i < $scope.ListaTitoliSpedizione.length;i ++)
                       {
                           var ParamTitolo = {
                                               "TITOLO"     : $scope.ListaTitoliSpedizione[i].TITOLO,  
                                               "QUANTITA"   : $scope.ListaTitoliSpedizione[i].QUANTITA,
                                               "STATO"      : $scope.ListaTitoliSpedizione[i].STATO
                                             }
                           if(NuovaSpedizione && $scope.ListaTitoliSpedizione[i].Nuovo)
                           {
                             $ObjQuery.Operazioni.push({
                                                         Query     : 'InsertDeliveryBookAfterInsert',
                                                         Parametri : ParamTitolo,
                                                         ResetKeys : [2]
                                                       });
                           }
                           if(!NuovaSpedizione && $scope.ListaTitoliSpedizione[i].Nuovo)
                           {
                             var ParamTitolo  = {
                                                   "SPEDIZIONE" : $scope.SpedizioneInEditing.CHIAVE,
                                                   "TITOLO"     : $scope.ListaTitoliSpedizione[i].TITOLO,  
                                                   "QUANTITA"   : $scope.ListaTitoliSpedizione[i].QUANTITA,
                                                   "STATO"      : $scope.ListaTitoliSpedizione[i].STATO
                                                 }
                             $ObjQuery.Operazioni.push({
                                                         Query     : 'InsertDeliveryBook',
                                                         Parametri : ParamTitolo,
                                                         ResetKeys : [1]
                                                       });
                           }
                           if(!NuovaSpedizione && $scope.ListaTitoliSpedizione[i].Modificato)
                           {
                             var ParamTitolo  = {
                                                 "CHIAVE"   : $scope.ListaTitoliSpedizione[i].CHIAVE,
                                                 "TITOLO"   : $scope.ListaTitoliSpedizione[i].TITOLO,  
                                                 "QUANTITA" : $scope.ListaTitoliSpedizione[i].QUANTITA,
                                                 "STATO"    : $scope.ListaTitoliSpedizione[i].STATO
                                               }
                             $ObjQuery.Operazioni.push({
                                                         Query     : 'UpdateDeliveryBook',
                                                         Parametri : ParamTitolo
                                                       });             
                           }             
                       }
                       
                       SystemInformation.PostSQL('Delivery',$ObjQuery,function(Answer)
                       {
                         $ObjQuery.Operazioni       = [];
                         $scope.SpedizioneInEditing = {};
                         var ChiaviDaFiltrare       = [];

                         if(NuovaSpedizione)
                         {
                           for(let i = 0;i < Answer.NewKeys.length;i ++)
                           {                           
                            if(Answer.NewKeys[i].Id == 2)                            
                               ChiaviDaFiltrare.push(Answer.NewKeys[i].Value)
                           }
                           ChiaviDaFiltrare = ChiaviDaFiltrare.toString();
                           SystemInformation.GetSQL('Delivery',{KeyToSearch : ChiaviDaFiltrare} ,function(Results)
                           {
                             NewChiaviToSend = SystemInformation.FindResults(Results,'SmallNewToSend');
                             SystemInformation.DataBetweenController.ListaChiaviFromAdvanced = [];
                             //SystemInformation.DataBetweenController.Provenienza = 'NOT_ADVANCED';
                             if(NewChiaviToSend != undefined)
                             {
                               for(let i = 0;i < NewChiaviToSend.length;i ++)
                                   SystemInformation.DataBetweenController.ListaChiaviFromAdvanced.push(NewChiaviToSend[i].CHIAVE)
                               
                               SystemInformation.DataBetweenDelivery.MateriaFiltro        = SystemInformation.DataBetweenController.MateriaFiltro;
                               SystemInformation.DataBetweenDelivery.MateriaFiltroNome    = SystemInformation.DataBetweenController.MateriaFiltroNome;
                               SystemInformation.DataBetweenDelivery.IstitutoFiltrato     = SystemInformation.DataBetweenController.IstitutoFiltrato;
                               SystemInformation.DataBetweenDelivery.IstitutoFiltratoNome = SystemInformation.DataBetweenController.IstitutoFiltratoNome;
                               SystemInformation.DataBetweenDelivery.Provenienza          = SystemInformation.DataBetweenController.Provenienza;    
                               $state.go('printLabelPage');
                             }
                           },'SelectKeyToSend')
                         }
                         else
                         {
                           if(!NuovaSpedizione)
                           {
                             if(Answer.NewKeys.length != 0)
                             {
                               for(let i = 0;i < Answer.NewKeys.length;i ++)
                               {                           
                                if(Answer.NewKeys[i].Id == 1)                            
                                   ChiaviDaFiltrare.push(Answer.NewKeys[i].Value)
                               }
                               ChiaviDaFiltrare = ChiaviDaFiltrare.toString();
                               SystemInformation.GetSQL('Delivery',{KeyToSearch : ChiaviDaFiltrare} ,function(Results)
                               {
                                 NewChiaviToSend = SystemInformation.FindResults(Results,'SmallNewToSend');
                                 SystemInformation.DataBetweenController.ListaChiaviFromAdvanced = [];
                                 SystemInformation.DataBetweenController.Provenienza = 'NOT_ADVANCED';
                                 if(NewChiaviToSend != undefined)
                                 {
                                   for(let i = 0;i < NewChiaviToSend.length;i ++)
                                       SystemInformation.DataBetweenController.ListaChiaviFromAdvanced.push(NewChiaviToSend[i].CHIAVE)
                                   if(DaSpedireEsistenti.length != 0)
                                      for(let j = 0;j < DaSpedireEsistenti.length;j ++)
                                          SystemInformation.DataBetweenController.ListaChiaviFromAdvanced.push(DaSpedireEsistenti[j])   
                                   $state.go('printLabelPage');
                                 }
                               },'SelectKeyToSend')
                             }
                             else
                             {
                               SystemInformation.DataBetweenController.ListaChiaviFromAdvanced = [];
                               SystemInformation.DataBetweenController.Provenienza = 'NOT_ADVANCED';
                               if(DaSpedireEsistenti.length != 0)
                                  for(let j = 0;j < DaSpedireEsistenti.length;j ++)
                                      SystemInformation.DataBetweenController.ListaChiaviFromAdvanced.push(DaSpedireEsistenti[j])   
                               $state.go('printLabelPage');
                             }
                           }                       
                         }  
                       });
                     }
                 }

             }
           
             var SalvaSpedizione = function()
             {

                 if ($scope.SpedizioneMultipla && !($scope.SpedizioneAIstituto))
                 {
                     if($scope.ListaDocentiSpedizione.length > 0)
                     {
                       for (let d = 0; d < $scope.ListaDocentiSpedizione.length;d ++)
                       {
                             $ObjQuery = {Operazioni : []};
                             ParamSpedizione = {
                                                 "CHIAVE"         : $scope.SpedizioneInEditing.CHIAVE,
                                                 "DOCENTE"        : $scope.ListaDocentiSpedizione[d].ChiaveDocente,
                                                 "PRESSO"         : $scope.ListaDocentiSpedizione[d].NomeDocente,
                                                 "INDIRIZZO"      : $scope.ListaDocentiSpedizione[d].IndirizzoDocente,
                                                 "COMUNE"         : $scope.ListaDocentiSpedizione[d].ComuneDocente,
                                                 "CAP"            : $scope.ListaDocentiSpedizione[d].CapDocente,
                                                 "PROVINCIA"      : $scope.ListaDocentiSpedizione[d].ProvinciaDocente,
                                                 "DATA"           : $scope.SpedizioneInEditing.DATA,
                                                 "ISTITUTO"       : null
                                               }
                             $ObjQuery.Operazioni.push({
                                                         Query     : 'InsertDelivery',
                                                         Parametri : ParamSpedizione   
                                                       });
                             for(let t = 0; t < $scope.ListaTitoliSpedizione.length;t ++)
                             {
                                 var ParamTitolo = {
                                                     "TITOLO"     : $scope.ListaTitoliSpedizione[t].TITOLO,  
                                                     "QUANTITA"   : $scope.ListaTitoliSpedizione[t].QUANTITA,
                                                     "STATO"      : $scope.ListaTitoliSpedizione[t].STATO
                                                   }
                                 if($scope.ListaTitoliSpedizione[t].Nuovo)
                                 {
                                   $ObjQuery.Operazioni.push({
                                                               Query     : 'InsertDeliveryBookAfterInsert',
                                                               Parametri : ParamTitolo,
                                                               ResetKeys : [2]
                                                             });
                                 }             
                             }
                             SystemInformation.PostSQL('Delivery',$ObjQuery,function(Answer)
                             {
                               $ObjQuery.Operazioni          = [];
                               $scope.SpedizioneInEditing    = {};
                               $scope.ListaDocentiSpedizione = [];
                               $scope.ListaDocentiEsclusi    = [];
                               switch (SystemInformation.DataBetweenController.Provenienza)
                               {
                                 case 'TeacherPage'  : SystemInformation.DataBetweenDelivery.MateriaFiltro        = SystemInformation.DataBetweenController.MateriaFiltro;
                                                       SystemInformation.DataBetweenDelivery.MateriaFiltroNome    = SystemInformation.DataBetweenController.MateriaFiltroNome;
                                                       SystemInformation.DataBetweenDelivery.IstitutoFiltrato     = SystemInformation.DataBetweenController.IstitutoFiltrato;
                                                       SystemInformation.DataBetweenDelivery.IstitutoFiltratoNome = SystemInformation.DataBetweenController.IstitutoFiltratoNome;
                                                       SystemInformation.DataBetweenDelivery.Provenienza          = SystemInformation.DataBetweenController.Provenienza;
                                                       $state.go("teacherListPage");
                                                       //SystemInformation.DataBetweenDelivery.Pagina               = SystemInformation.DataBetweenController.Pagina;
                                                       SystemInformation.DataBetweenController = {};
                                                       break;
                                 case 'DeliveryPage' : $state.go("deliveryListPage");
                                                       SystemInformation.DataBetweenController = {};
                                                       break;
                                 case 'StartPage'    : $state.go("startPage");
                                                       SystemInformation.DataBetweenController = {};
                                                       break;
                               }          
                             })          
                       }
                     } else ZCustomAlert($mdDialog,'ATTENZIONE','IMPOSSIBILE SPEDIRE, NESSUNO DEI DOCENTI HA UN INDIRIZZO DI SPEDIZIONE VALIDO!')
                 }
                 else if ($scope.SpedizioneMultipla && $scope.SpedizioneAIstituto)
                 {
                         for (let d = 0; d < $scope.ListaDocentiSpedizione.length;d ++)
                         {
                               $ObjQuery = {Operazioni : []};
                               ParamSpedizione = {
                                                   "CHIAVE"         : $scope.SpedizioneInEditing.CHIAVE,
                                                   "DOCENTE"        : $scope.ListaDocentiSpedizione[d].ChiaveDocente,
                                                   "PRESSO"         : $scope.ListaDocentiSpedizione[d].NomeDocente,
                                                   "INDIRIZZO"      : $scope.SpedizioneInEditing.INDIRIZZO,
                                                   "COMUNE"         : $scope.SpedizioneInEditing.COMUNE,
                                                   "CAP"            : $scope.SpedizioneInEditing.CAP,
                                                   "PROVINCIA"      : $scope.SpedizioneInEditing.PROVINCIA,
                                                   "DATA"           : $scope.SpedizioneInEditing.DATA,
                                                   "ISTITUTO"       : $scope.SpedizioneInEditing.ISTITUTO
                                                 }
                               $ObjQuery.Operazioni.push({
                                                           Query     : 'InsertDelivery',
                                                           Parametri : ParamSpedizione   
                                                         });
                               for(let t = 0; t < $scope.ListaTitoliSpedizione.length;t ++)
                               {
                                   var ParamTitolo = {
                                                       "TITOLO"     : $scope.ListaTitoliSpedizione[t].TITOLO,  
                                                       "QUANTITA"   : $scope.ListaTitoliSpedizione[t].QUANTITA,
                                                       "STATO"      : $scope.ListaTitoliSpedizione[t].STATO
                                                     }
                                   if($scope.ListaTitoliSpedizione[t].Nuovo)
                                   {
                                     $ObjQuery.Operazioni.push({
                                                                 Query     : 'InsertDeliveryBookAfterInsert',
                                                                 Parametri : ParamTitolo,
                                                                 ResetKeys : [2]
                                                               });
                                   }             
                               }
                               SystemInformation.PostSQL('Delivery',$ObjQuery,function(Answer)
                               {
                                 $ObjQuery.Operazioni = [];                      
                               });          
                         }
                         
                         for (let d = 0; d < $scope.ListaDocentiEsclusi.length;d ++)
                         {
                               $ObjQuery = {Operazioni : []};
                               ParamSpedizione = {
                                                   "CHIAVE"         : $scope.SpedizioneInEditing.CHIAVE,
                                                   "DOCENTE"        : $scope.ListaDocentiEsclusi[d].ChiaveDocente,
                                                   "PRESSO"         : $scope.ListaDocentiEsclusi[d].NomeDocente,
                                                   "INDIRIZZO"      : $scope.SpedizioneInEditing.INDIRIZZO,
                                                   "COMUNE"         : $scope.SpedizioneInEditing.COMUNE,
                                                   "CAP"            : $scope.SpedizioneInEditing.CAP,
                                                   "PROVINCIA"      : $scope.SpedizioneInEditing.PROVINCIA,
                                                   "DATA"           : $scope.SpedizioneInEditing.DATA,
                                                   "ISTITUTO"       : $scope.SpedizioneInEditing.ISTITUTO                                          
                                                 }
                               $ObjQuery.Operazioni.push({
                                                           Query     : 'InsertDelivery',
                                                           Parametri : ParamSpedizione   
                                                         });
                               for(let t = 0; t < $scope.ListaTitoliSpedizione.length;t ++)
                               {
                                   var ParamTitolo = {
                                                       "TITOLO"     : $scope.ListaTitoliSpedizione[t].TITOLO,  
                                                       "QUANTITA"   : $scope.ListaTitoliSpedizione[t].QUANTITA,
                                                       "STATO"      : $scope.ListaTitoliSpedizione[t].STATO
                                                     }
                                   if($scope.ListaTitoliSpedizione[t].Nuovo)
                                   {
                                     $ObjQuery.Operazioni.push({
                                                                 Query     : 'InsertDeliveryBookAfterInsert',
                                                                 Parametri : ParamTitolo,
                                                                 ResetKeys : [2]
                                                               });
                                   }             
                               }
                               SystemInformation.PostSQL('Delivery',$ObjQuery,function(Answer)
                               {
                                 $ObjQuery.Operazioni = [];                      
                               });          
                         }               
                         $scope.SpedizioneInEditing    = {};
                         $scope.ListaDocentiSpedizione = [];
                         $scope.ListaDocentiEsclusi    = [];
                         $scope.ListaDocentiSpedizioneAIstituto = [];
       
                         switch (SystemInformation.DataBetweenController.Provenienza)
                         {
                             case 'TeacherPage'  : SystemInformation.DataBetweenDelivery.MateriaFiltro        = SystemInformation.DataBetweenController.MateriaFiltro;
                                                   SystemInformation.DataBetweenDelivery.MateriaFiltroNome    = SystemInformation.DataBetweenController.MateriaFiltroNome;
                                                   SystemInformation.DataBetweenDelivery.IstitutoFiltrato     = SystemInformation.DataBetweenController.IstitutoFiltrato;
                                                   SystemInformation.DataBetweenDelivery.IstitutoFiltratoNome = SystemInformation.DataBetweenController.IstitutoFiltratoNome;
                                                   SystemInformation.DataBetweenDelivery.Provenienza          = SystemInformation.DataBetweenController.Provenienza;
                                                   $state.go("teacherListPage");
                                                   //SystemInformation.DataBetweenDelivery.Pagina               = SystemInformation.DataBetweenController.Pagina;
                                                   SystemInformation.DataBetweenController = {};
                                                   break;
                             case 'DeliveryPage' : $state.go("deliveryListPage");
                                                   SystemInformation.DataBetweenController = {};
                                                   break;
                             case 'StartPage'    : $state.go("startPage");
                                                   SystemInformation.DataBetweenController = {};
                                                   break;
                         }                         
                 }
                 else
                 {         
                     if ($scope.SpedizioneInEditing.INDIRIZZO == '' || $scope.SpedizioneInEditing.COMUNE == '' || $scope.SpedizioneInEditing.CAP == '' || $scope.SpedizioneInEditing.PROVINCIA == -1)
                     {    
                         ZCustomAlert($mdDialog,'ATTENZIONE','DATI SPEDIZIONE MANCANTI!')
                         return         
                     }
                     else
                     {
                       $ObjQuery = {Operazioni : []};
                       ParamSpedizione  = {
                                           "CHIAVE"         : $scope.SpedizioneInEditing.CHIAVE,
                                           "DOCENTE"        : $scope.SpedizioneInEditing.DOCENTE == undefined ? null : $scope.SpedizioneInEditing.DOCENTE,
                                           "PRESSO"         : $scope.SpedizioneInEditing.PRESSO,
                                           "INDIRIZZO"      : $scope.SpedizioneInEditing.INDIRIZZO,
                                           "COMUNE"         : $scope.SpedizioneInEditing.COMUNE,
                                           "CAP"            : $scope.SpedizioneInEditing.CAP,
                                           "PROVINCIA"      : $scope.SpedizioneInEditing.PROVINCIA,
                                           "DATA"           : $scope.SpedizioneInEditing.DATA,
                                           "ISTITUTO"       : ($scope.SpedizioneInEditing.ISTITUTO == -1 || $scope.SpedizioneInEditing.ISTITUTO == '') ? null : $scope.SpedizioneInEditing.ISTITUTO  
                                         }
                                             
                       var NuovaSpedizione = ($scope.SpedizioneInEditing.CHIAVE == -1);
                       if (NuovaSpedizione)
                       {
                         $ObjQuery.Operazioni.push({
                                                     Query     : 'InsertDelivery',
                                                     Parametri : ParamSpedizione   
                                                   })
                       }
                       else
                       {
                         $ObjQuery.Operazioni.push({
                                                     Query     : 'UpdateDelivery',
                                                     Parametri : ParamSpedizione   
                                                   })         
                       }
                       
                       if (!NuovaSpedizione && $scope.ListaTitoliEliminati.length != 0)
                       {
                         for(let j = 0; j < $scope.ListaTitoliEliminati.length ;j ++)
                         {
                           var ParamTitolo = {
                                               CHIAVE : $scope.ListaTitoliEliminati[j].CHIAVE
                                             }
                           if ($scope.ListaTitoliEliminati[j].Eliminato)
                           {
                             $ObjQuery.Operazioni.push({
                                                         Query     : 'DeleteDeliveryBook',
                                                         Parametri : ParamTitolo
                                                       });
                           }
                         }
                         SystemInformation.PostSQL('Delivery',$ObjQuery,function(Answer)
                         {
                           $scope.ListaTitoliEliminati = [];
                           $ObjQuery.Operazioni = [];
                         });  
                       }           
                       
                       for(let i = 0; i < $scope.ListaTitoliSpedizione.length;i ++)
                       {
                           var ParamTitolo = {
                                               "TITOLO"     : $scope.ListaTitoliSpedizione[i].TITOLO,  
                                               "QUANTITA"   : $scope.ListaTitoliSpedizione[i].QUANTITA,
                                               "STATO"      : $scope.ListaTitoliSpedizione[i].STATO
                                             }
                           if(NuovaSpedizione && $scope.ListaTitoliSpedizione[i].Nuovo)
                           {
                             $ObjQuery.Operazioni.push({
                                                         Query     : 'InsertDeliveryBookAfterInsert',
                                                         Parametri : ParamTitolo,
                                                         ResetKeys : [2]
                                                       });
                           }
                           if(!NuovaSpedizione && $scope.ListaTitoliSpedizione[i].Nuovo)
                           {
                             var ParamTitolo  = {
                                                   "SPEDIZIONE" : $scope.SpedizioneInEditing.CHIAVE,
                                                   "TITOLO"     : $scope.ListaTitoliSpedizione[i].TITOLO,  
                                                   "QUANTITA"   : $scope.ListaTitoliSpedizione[i].QUANTITA,
                                                   "STATO"      : $scope.ListaTitoliSpedizione[i].STATO
                                                 }
                             $ObjQuery.Operazioni.push({
                                                         Query     : 'InsertDeliveryBook',
                                                         Parametri : ParamTitolo,
                                                         ResetKeys : [1]
                                                       });
                           }
                           if(!NuovaSpedizione && $scope.ListaTitoliSpedizione[i].Modificato)
                           {
                             var ParamTitolo  = {
                                                 "CHIAVE"   : $scope.ListaTitoliSpedizione[i].CHIAVE,
                                                 "TITOLO"   : $scope.ListaTitoliSpedizione[i].TITOLO,  
                                                 "QUANTITA" : $scope.ListaTitoliSpedizione[i].QUANTITA,
                                                 "STATO"    : $scope.ListaTitoliSpedizione[i].STATO
                                               }
                             $ObjQuery.Operazioni.push({
                                                         Query     : 'UpdateDeliveryBook',
                                                         Parametri : ParamTitolo
                                                       });             
                           }             
                       }
                       
                       SystemInformation.PostSQL('Delivery',$ObjQuery,function(Answer)
                       {
                         $ObjQuery.Operazioni       = [];
                         $scope.SpedizioneInEditing = {};
                         switch (SystemInformation.DataBetweenController.Provenienza)
                         {
                           case 'TeacherPage'  : SystemInformation.DataBetweenDelivery.MateriaFiltro        = SystemInformation.DataBetweenController.MateriaFiltro;
                                                 SystemInformation.DataBetweenDelivery.MateriaFiltroNome    = SystemInformation.DataBetweenController.MateriaFiltroNome;
                                                 SystemInformation.DataBetweenDelivery.IstitutoFiltrato     = SystemInformation.DataBetweenController.IstitutoFiltrato;
                                                 SystemInformation.DataBetweenDelivery.IstitutoFiltratoNome = SystemInformation.DataBetweenController.IstitutoFiltratoNome;
                                                 SystemInformation.DataBetweenDelivery.Provenienza          = SystemInformation.DataBetweenController.Provenienza;
                                                 $state.go("teacherListPage");
                                                 //SystemInformation.DataBetweenDelivery.Pagina               = SystemInformation.DataBetweenController.Pagina;
                                                 SystemInformation.DataBetweenController = {};
                                                 break;
                           case 'DeliveryPage' : $state.go("deliveryListPage");
                                                 SystemInformation.DataBetweenController = {};
                                                 break;
                           case 'StartPage'    : $state.go("startPage");
                                                 SystemInformation.DataBetweenController = {};
                                                 break;
                         }          
                       });
                     }
                 }

             }

             var ListaTitoliNonSpedibili = [];
             
             for(let i = 0; i < $scope.ListaTitoliSpedizione.length;i ++)
             {
                var SecondSpedizione = {};
                var QuantitaToBook   = 0;

                if(!$scope.SpedizioneMultipla)
                {
                   if(($scope.ListaTitoliSpedizione[i].QUANTITA > $scope.ListaTitoliSpedizione[i].QUANTITA_DISP) && $scope.ListaTitoliSpedizione[i].STATO == 'S')
                   {
                       QuantitaToBook                           = $scope.ListaTitoliSpedizione[i].QUANTITA - $scope.ListaTitoliSpedizione[i].QUANTITA_DISP;
                       $scope.ListaTitoliSpedizione[i].QUANTITA = $scope.ListaTitoliSpedizione[i].QUANTITA_DISP;
                       Object.assign(SecondSpedizione, $scope.ListaTitoliSpedizione[i]);                    
                       SecondSpedizione.QUANTITA                = QuantitaToBook;
                       SecondSpedizione.STATO                   = 'P';
                       $scope.ListaTitoliSpedizione.push(SecondSpedizione);
                       ListaTitoliNonSpedibili.push('\n' + $scope.ListaTitoliSpedizione[i].NOME_TITOLO + ' (' + $scope.ListaTitoliSpedizione[i].ISBN_TITOLO + ')');
                   }
                }
                else
                {
                  if((($scope.ListaTitoliSpedizione[i].QUANTITA * $scope.NumeroDocenti) > $scope.ListaTitoliSpedizione[i].QUANTITA_DISP) && $scope.ListaTitoliSpedizione[i].STATO == 'S')
                  { 
                       $scope.ListaTitoliSpedizione[i].STATO = 'P';
                       ListaTitoliNonSpedibili.push($scope.ListaTitoliSpedizione[i].NOME_TITOLO + ' (' + $scope.ListaTitoliSpedizione[i].ISBN_TITOLO + ')');
                  }
                }
             } 
             
             var DaSpedireEsistenti = [];
             var ChiediEtichetta = false;
             var ContatoreDaSpedire = 0;
             for(let i = 0;i < $scope.ListaTitoliSpedizione.length;i ++)
             {
                 if($scope.ListaTitoliSpedizione[i].STATO == 'S')
                   ContatoreDaSpedire ++;
                 if($scope.ListaTitoliSpedizione[i].STATO == 'S' && $scope.ListaTitoliSpedizione[i].CHIAVE != -1)
                    DaSpedireEsistenti.push($scope.ListaTitoliSpedizione[i].TITOLO)
             }
             if(ContatoreDaSpedire > 0)
               ChiediEtichetta = true;
               
             if(ListaTitoliNonSpedibili.length != 0 && ChiediEtichetta == false)
                ZCustomAlert($mdDialog,'ATTENZIONE',"I SEGUENTI TITOLI NON POSSONO ESSERE SEGNATI COME DA SPEDIRE, E SONO STATI SEGNATI COME PRENOTATI (LA QUANTITA'' DISPONIBILE NON COPRE LA QUANTITA'' RICHIESTA)! " + ListaTitoliNonSpedibili.toString());

             if(ChiediEtichetta)
             {
                var StringaConfirm = '';
                if(ListaTitoliNonSpedibili.length != 0)
                   StringaConfirm = "I SEGUENTI TITOLI NON POSSONO ESSERE SEGNATI COME DA SPEDIRE, E SONO STATI SEGNATI COME PRENOTATI (LA QUANTITA' DISPONIBILE NON COPRE LA QUANTITA' RICHIESTA) : " + ListaTitoliNonSpedibili.toString() + '. \n\n' + "LA SPEDIZIONE CONTIENE ALCUNI TITOLI DA SPEDIRE,VUOI CREARE ORA L'ETICHETTA?"
                else StringaConfirm = "LA SPEDIZIONE CONTIENE ALCUNI TITOLI DA SPEDIRE,VUOI CREARE ORA L'ETICHETTA?"; 
                ZConfirm.GetConfirmBox('AVVISO',StringaConfirm,SalvaEStampa,SalvaSpedizione);
             }       
             else SalvaSpedizione();
          }

          if($scope.ChiaveDocente != -1 && !$scope.SpedizioneMultipla && $scope.ChiaveDocente != undefined)
          {
             var Result = false;
             for(let i = 0; i < $scope.ListaTitoliSpedizione.length; i ++)
             {
                 if($scope.ListaTitoliSpedizione[i].GESTITO_PAST)
                 {
                    Result = true;
                    break;
                 }
             }
             if(Result)
                ZConfirm.GetConfirmBox('ATTENZIONE',"Questa spedizione contiene alcuni titoli già gestiti dal docente, procedere con il salvataggio della spedizione?",VaiAvanti,function(){})
             else VaiAvanti()
          }
          else VaiAvanti();

      }      
    }    
  } 
}]);

SIRIOApp.filter('TitoliMultipliPopupByFiltro',function()
{
  return function(ListaTitoliPopup,NomeFiltro,CodiceFiltro,AutoreFiltro)
         {
           if(NomeFiltro == '' && CodiceFiltro == '' && AutoreFiltro == '') 
             return(ListaTitoliPopup);
           var ListaFiltrata = [];
           NomeFiltro = NomeFiltro.toUpperCase();
           CodiceFiltro = CodiceFiltro.toUpperCase();
           AutoreFiltro = AutoreFiltro.toUpperCase();
           
           var TitoloOk = function(Titolo)
           {  
              var Result = true;
              
              if(NomeFiltro != '')              
                if(Titolo.Nome.toUpperCase().indexOf(NomeFiltro) < 0)
                   Result = false;
              
              if(CodiceFiltro != '')
                 if(Titolo.Codice.toUpperCase().indexOf(CodiceFiltro) < 0)
                   Result = false; 
                   
              if(AutoreFiltro != '')
                 if(Titolo.Autore.toUpperCase().indexOf(AutoreFiltro) < 0)
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

