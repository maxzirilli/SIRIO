SIRIOApp.controller("deliveryModDetailPageController",['$scope','SystemInformation','$state','$rootScope','$mdDialog',
function($scope,SystemInformation,$state,$rootScope,$mdDialog)
{ 
  $scope.NuovaSpedizioneCasa       = false;
  $scope.NuovaSpedizioneDocente    = false;
  $scope.ModificaSpedizioneCasa    = false;
  $scope.ModificaSpedizioneDocente = false;
  $scope.ListaIstitutiDoc          = [];
  $scope.ListaTitoliEliminati      = [];
  
  ScopeHeaderController.CheckButtons();
  
  $scope.ChiaveSpedizione                                  = SystemInformation.DataBetweenController.ChiaveSpedizione;
  $scope.ChiaveDocente                                     = SystemInformation.DataBetweenController.ChiaveDocente;
  SystemInformation.DataBetweenController.ChiaveSpedizione = '';
  SystemInformation.DataBetweenController.ChiaveDocente    = '';
  console.log($scope.ChiaveDocente);
  
  if($scope.ChiaveDocente == undefined && $scope.ChiaveSpedizione == undefined)
     $state.go("deliveryListPage")
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
                                      Chiave   : TitoliInfoLista[i].CHIAVE,
                                      Nome     : TitoliInfoLista[i].TITOLO,
                                      Quantita : TitoliInfoLista[i].QUANTITA_MGZN,
                                      Codice   : TitoliInfoLista[i].CODICE_ISBN
                                    }
           $scope.ListaTitoli = TitoliInfoLista;
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
        IstitutiInfoLista = SystemInformation.FindResults(Results,'InstituteInfoList');
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
      });
    }
    
    LoadIstituti();
    
    
    
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
                         
    var GestioneParametri = function()
    {    
       if($scope.ChiaveDocente != -1 && $scope.ChiaveSpedizione == -1)
       {    
          $scope.NuovaSpedizioneDocente = true;
          $scope.SpedizioneInEditing    = {};
          $scope.ProvinciaDoc           = {};
          
          SystemInformation.GetSQL('Teacher', {CHIAVE : $scope.ChiaveDocente}, function(Results)
          {
            DocenteDettaglio = SystemInformation.FindResults(Results,'TeacherDettaglio');
            IstitutiDoc      = SystemInformation.FindResults(Results,'TeacherInstitute');
            ProvinciaDoc     = $scope.ListaProvinceAll.find(function(AProvincia){return(AProvincia.Chiave == DocenteDettaglio[0].PROVINCIA);});

            if(DocenteDettaglio != undefined && IstitutiDoc != undefined)
            {
              $scope.SpedizioneInEditing.CHIAVE          = -1;
              $scope.SpedizioneInEditing.DOCENTE         = $scope.ChiaveDocente;
              $scope.SpedizioneInEditing.DOCENTE_NOME    = DocenteDettaglio[0].RAGIONE_SOCIALE;
              $scope.SpedizioneInEditing.PRESSO          = DocenteDettaglio[0].RAGIONE_SOCIALE;
              $scope.SpedizioneInEditing.STATO           = 'P';
              $scope.SpedizioneInEditing.INDIRIZZO       = DocenteDettaglio[0].INDIRIZZO == null ? '' : DocenteDettaglio[0].INDIRIZZO;
              $scope.SpedizioneInEditing.COMUNE          = DocenteDettaglio[0].COMUNE    == null ? '' : DocenteDettaglio[0].COMUNE;
              $scope.SpedizioneInEditing.CAP             = DocenteDettaglio[0].CAP       == null ? '' : DocenteDettaglio[0].CAP;
              $scope.SpedizioneInEditing.PROVINCIA       = DocenteDettaglio[0].PROVINCIA == null ? -1 : DocenteDettaglio[0].PROVINCIA;
              $scope.SpedizioneInEditing.PROVINCIA_NOME  = ProvinciaDoc.Nome             == undefined ? '' : ProvinciaDoc.Nome; 
              $scope.SpedizioneInEditing.DATA            = new Date();
              $scope.ListaIstitutiDoc                    = IstitutiDoc;
              $scope.ListaTitoliSpedizione               = [];
              $scope.ListaTitoliEliminati                = [];           
            }       
            else SystemInformation.ApplyOnError('Modello docente per spedizione non conforme','');      
          },'SQLDettaglio'); 
          
          $scope.IndirizzoByIstituto = function (Istituto)
          {
            if(Istituto == -1)
            {
             $scope.SpedizioneInEditing.INDIRIZZO       = DocenteDettaglio[0].INDIRIZZO == null ? '' : DocenteDettaglio[0].INDIRIZZO;
             $scope.SpedizioneInEditing.COMUNE          = DocenteDettaglio[0].COMUNE    == null ? '' : DocenteDettaglio[0].COMUNE;
             $scope.SpedizioneInEditing.CAP             = DocenteDettaglio[0].CAP       == null ? '' : DocenteDettaglio[0].CAP;
             $scope.SpedizioneInEditing.PROVINCIA       = DocenteDettaglio[0].PROVINCIA == null ? -1 : DocenteDettaglio[0].PROVINCIA;
             $scope.SpedizioneInEditing.PROVINCIA_NOME  = ProvinciaDoc                  == undefined ? '' : ProvinciaDoc.Nome
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
            }
          }
          
          $scope.PassaADaSpedire = function (Titolo)
          {
            if (Titolo.STATO == 'P' && (Titolo.QUANTITA <= Titolo.QUANTITA_MGZN))
            {
                alert('q' + Titolo.QUANTITA + 'qm' + Titolo.QUANTITA_MGZN);
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
           
       if($scope.ChiaveDocente != -1 && $scope.ChiaveSpedizione != -1)
       {    
          $scope.ModificaSpedizioneDocente = true;       
          
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
                
                for(let i = 0;i < DettaglioSpedizioneTitoloDoc.length;i ++)
                {
                    if(DettaglioSpedizioneTitoloDoc[i].SPEDIZIONE == $scope.ChiaveSpedizione)
                    $scope.ListaTitoliSpedizione.push({
                                                        "CHIAVE"        : DettaglioSpedizioneTitoloDoc[i].CHIAVE,
                                                        "SPEDIZIONE"    : DettaglioSpedizioneTitoloDoc[i].SPEDIZIONE,
                                                        "TITOLO"        : DettaglioSpedizioneTitoloDoc[i].TITOLO,
                                                        "NOME_TITOLO"   : DettaglioSpedizioneTitoloDoc[i].NOME_TITOLO,
                                                        "QUANTITA"      : DettaglioSpedizioneTitoloDoc[i].QUANTITA,
                                                        "STATO"         : DettaglioSpedizioneTitoloDoc[i].STATO,
                                                        "QUANTITA_MGZN" : DettaglioSpedizioneTitoloDoc[i].QUANTITA_MGZN,
                                                        "Nuovo"         : false,
                                                        "Modificato"    : false,
                                                        "Eliminato"     : false
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
                  }       
                  else SystemInformation.ApplyOnError('Modello dati docente per spedizione non conforme','');      
                },'SQLDettaglio'); 
            }
            else SystemInformation.ApplyOnError('Modello spedizione docente non conforme','');      
          },'SQLDettaglioSpedizioneDocente'); 
          
          $scope.IndirizzoByIstituto = function (Istituto)
          {
            if(Istituto == -1)
            {
             $scope.SpedizioneInEditing.INDIRIZZO       = DocenteDettaglio[0].INDIRIZZO == null ? '' : DocenteDettaglio[0].INDIRIZZO;
             $scope.SpedizioneInEditing.COMUNE          = DocenteDettaglio[0].COMUNE    == null ? '' : DocenteDettaglio[0].COMUNE;
             $scope.SpedizioneInEditing.CAP             = DocenteDettaglio[0].CAP       == null ? '' : DocenteDettaglio[0].CAP;
             $scope.SpedizioneInEditing.PROVINCIA       = DocenteDettaglio[0].PROVINCIA == null ? -1 : DocenteDettaglio[0].PROVINCIA;
             $scope.SpedizioneInEditing.PROVINCIA_NOME  = ProvinciaDoc                  == undefined ? '' : ProvinciaDoc.Nome
            }
            else
            {
              IstitutoCorrisp = $scope.ListaIstitutiDoc.find(function(AIstituto){return(AIstituto.CHIAVE == Istituto);});
              ProvinciaAllCorrisp = $scope.ListaProvinceAll.find(function(AProvincia){return(AProvincia.Nome == IstitutoCorrisp.PROVINCIA_NOME);});
             
              $scope.SpedizioneInEditing.INDIRIZZO       = IstitutoCorrisp.INDIRIZZO  == null ? '': IstitutoCorrisp.INDIRIZZO;
              $scope.SpedizioneInEditing.COMUNE          = IstitutoCorrisp.COMUNE     == null ? '': IstitutoCorrisp.COMUNE;
              $scope.SpedizioneInEditing.CAP             = IstitutoCorrisp.CAP        == null ? '': IstitutoCorrisp.CAP;
              $scope.SpedizioneInEditing.PROVINCIA       = ProvinciaAllCorrisp.Chiave == undefined ? -1 : ProvinciaAllCorrisp.Chiave;
              $scope.SpedizioneInEditing.PROVINCIA_NOME  = ProvinciaAllCorrisp.Nome   == undefined ? '' : IstitutoCorrisp.Nome; 
            }
          } 
          
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

       if($scope.ChiaveDocente == -1 && $scope.ChiaveSpedizione == -1)
       {
         $scope.NuovaSpedizioneCasa = true;
         $scope.SpedizioneInEditing = {};
         
         $scope.SpedizioneInEditing.CHIAVE          = -1;
         $scope.SpedizioneInEditing.PRESSO          = '';
         $scope.SpedizioneInEditing.STATO           = 'P';
         $scope.SpedizioneInEditing.INDIRIZZO       = '';
         $scope.SpedizioneInEditing.COMUNE          = '';
         $scope.SpedizioneInEditing.CAP             = '';
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
       
       if($scope.ChiaveDocente == -1 && $scope.ChiaveSpedizione != -1)
       {
         $scope.ModificaSpedizioneCasa = true;
         
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
               $scope.ListaTitoliSpedizione                = [];
               $scope.ListaTitoliEliminati                 = [];
               
               for(let i = 0;i < DettaglioSpedizioneTitoloCasa.length;i ++)
               {
                   if(DettaglioSpedizioneTitoloCasa[i].SPEDIZIONE == $scope.ChiaveSpedizione)
                   $scope.ListaTitoliSpedizione.push({
                                                       "CHIAVE"        : DettaglioSpedizioneTitoloCasa[i].CHIAVE,
                                                       "SPEDIZIONE"    : DettaglioSpedizioneTitoloCasa[i].SPEDIZIONE,
                                                       "TITOLO"        : DettaglioSpedizioneTitoloCasa[i].TITOLO,
                                                       "NOME_TITOLO"   : DettaglioSpedizioneTitoloCasa[i].NOME_TITOLO,
                                                       "QUANTITA"      : DettaglioSpedizioneTitoloCasa[i].QUANTITA,
                                                       "STATO"         : DettaglioSpedizioneTitoloCasa[i].STATO,
                                                       "QUANTITA_MGZN" : DettaglioSpedizioneTitoloCasa[i].QUANTITA_MGZN,                                                    
                                                       "Nuovo"         : false,
                                                       "Modificato"    : false,
                                                       "Eliminato"     : false
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
   
    $scope.AggiungiTitoloSpedizione = function (ev)
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
      $scope.Titolo = {};
      
      $scope.Titolo = {
                         "CHIAVE"        : -1,
                         "TITOLO"        : -1,
                         "NOME_TITOLO"   : '',
                         "QUANTITA"      : 1,
                         "STATO"         : 'S',
                         "QUANTITA_MGZN" : null,
                         "Nuovo"         : true,
                         "Modificato"    : false,
                         "Eliminato"     : false                                   
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
           $scope.Titolo.TITOLO        = itemTit.Chiave;
           $scope.Titolo.NOME_TITOLO   = itemTit.Nome;
           $scope.Titolo.QUANTITA_MGZN = itemTit.Quantita;
        }
      }

      $scope.hide = function() 
      {
        $mdDialog.hide();
      };

      $scope.AnnullaPopupTitolo = function() 
      {
        $scope.TitoloPopup = undefined;
        $mdDialog.cancel();
      };

      $scope.ConfermaPopupTitolo = function()
      { 
        if($scope.Titolo.TITOLO == -1 || $scope.Titolo.QUANTITA == 0)
        {
          alert ('Dati titolo mancanti!');
          return
        }
        else
        {                         
          $scope.ListaTitoliSpedizione.push($scope.Titolo);
          $mdDialog.hide();
        }             
      }
    }
    
    $scope.EliminaTitolo = function(Titolo)
    {
      if(confirm('Eliminare il titolo ' + Titolo.NOME_TITOLO + ' dalla spedizione?'))
      {
        TitoloCorrispondente = $scope.ListaTitoliSpedizione.findIndex(function(ATitolo){return(ATitolo.CHIAVE == Titolo.CHIAVE);});     
        if ($scope.ListaTitoliSpedizione[TitoloCorrispondente].Nuovo)
            $scope.ListaTitoliSpedizione.splice(TitoloCorrispondente,1)
        else
        {
          $scope.ListaTitoliEliminati.push($scope.ListaTitoliSpedizione[TitoloCorrispondente]);
          $scope.ListaTitoliEliminati[$scope.ListaTitoliEliminati.length-1].Eliminato = true;
          $scope.ListaTitoliSpedizione.splice(TitoloCorrispondente,1);
        }       
      }      
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
    
      $scope.Titolo = {
                         "CHIAVE"        : Titolo.CHIAVE,
                         "TITOLO"        : Titolo.TITOLO,
                         "NOME_TITOLO"   : Titolo.NOME_TITOLO,
                         "QUANTITA"      : parseInt(Titolo.QUANTITA),
                         "QUANTITA_MGZN" : Titolo.QUANTITA_MGZN,
                         "STATO"         : Titolo.STATO,
                         "Nuovo"         : Titolo.Nuovo,
                         "Modificato"    : Titolo.Modificato,
                         "Eliminato"     : Titolo.Eliminato                                   
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
          $scope.Titolo.TITOLO        = itemTit.Chiave;
          $scope.Titolo.NOME_TITOLO   = itemTit.Nome;
          $scope.Titolo.QUANTITA_MGZN = itemTit.Quantita;
        }
      }

      $scope.AnnullaPopupTitolo = function() 
      {
        //$scope.TitoloPopup = undefined;
        $mdDialog.cancel();
      };
      
      $scope.ConfermaPopupTitolo = function()
      { 
        TitoloCorrispondente = $scope.ListaTitoliSpedizione.findIndex(function(ATitolo){return (ATitolo.CHIAVE == Titolo.CHIAVE);});
        if($scope.Titolo.TITOLO == -1 || $scope.Titolo.QUANTITA == 0)
        {
          alert ('Dati titolo mancanti!');
          return
        }
        else
        {        
          $scope.ListaTitoliSpedizione[TitoloCorrispondente].TITOLO        = $scope.Titolo.TITOLO;
          $scope.ListaTitoliSpedizione[TitoloCorrispondente].NOME_TITOLO   = $scope.Titolo.NOME_TITOLO;
          $scope.ListaTitoliSpedizione[TitoloCorrispondente].QUANTITA      = $scope.Titolo.QUANTITA;
          $scope.ListaTitoliSpedizione[TitoloCorrispondente].STATO         = $scope.Titolo.STATO;
          $scope.ListaTitoliSpedizione[TitoloCorrispondente].QUANTITA_MGZN = $scope.Titolo.QUANTITA_MGZN;
          if($scope.ListaTitoliSpedizione[TitoloCorrispondente].Nuovo)
             $scope.ListaTitoliSpedizione[TitoloCorrispondente].Modificato = false
          else
             $scope.ListaTitoliSpedizione[TitoloCorrispondente].Modificato = true;
        }          
        $mdDialog.hide();           
      }
    }
    
    $scope.OnAnnullaSpedizione = function()
    { 
      $scope.SpedizioneInEditing  = {};
      $scope.DocenteDati          = {};
      $scope.ListaIstitutiDoc     = [];
      $scope.ListaTitoliEliminati = [];      
      switch (SystemInformation.DataBetweenController.Provenienza)
      {
         case 'TeacherPage'  : $state.go("teacherListPage");
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
      if ($scope.SpedizioneInEditing.PRESSO == '' || $scope.SpedizioneInEditing.INDIRIZZO == '' || $scope.SpedizioneInEditing.COMUNE == '' || $scope.SpedizioneInEditing.CAP == '' || $scope.SpedizioneInEditing.PROVINCIA == -1)
      {    
          alert ('DATI SPEDIZIONE MANCANTI!');
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
                             "DATA"           : $scope.SpedizioneInEditing.DATA
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
          $ObjQuery.Operazioni = [];
          $scope.SpedizioneInEditing = {};
          switch (SystemInformation.DataBetweenController.Provenienza)
          {
             case 'TeacherPage'  : $state.go("teacherListPage");
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
  
}]);
