SIRIOApp.controller("instituteListPageController",['$scope','SystemInformation','$state','$rootScope','$mdDialog','$filter', function($scope,SystemInformation,$state,$rootScope,$mdDialog,$filter)
{
  $scope.EditingOn          = false;
  $scope.IstitutoInEditing  = {};
  $scope.ListaIstituti      = [];  
  $scope.ListaProvince      = [];
  $scope.ListaPromotori     = [];    
  
  $scope.SezioneMax         = -1;
  $scope.ListaSezioni       = ['A','B','C','D','E','F','G','H','I','L','M','N','O','P','Q','R','S','T','U','V','Z'];    
  $scope.Anno               = [1,2,3,4,5];
  $scope.ListaSezioniFinale = [];
  $scope.ArrayClassiFinale  = [];
  $scope.ClasseCliccata     = [];
  $scope.IstitutiNascosti   = false;
  
  $scope.ProvinciaFiltro    = -1;
  $scope.NomeFiltro         = ''; 
  $scope.NomeFiltroUnione   = '';
  //$scope.IstitutoDaUnire    = -1;
  
  ScopeHeaderController.CheckButtons();
  
  $scope.CreaListaSelezione = function(sezMax)
  { 
    $scope.ListaSezioniFinale = [];
    for(i = 0; i <= sezMax; i ++)
        $scope.ListaSezioniFinale.push($scope.ListaSezioni[i]);
  }
  
  ResetClassi = function ()
  {
    for(let i = 0;i < $scope.Anno.length;i ++)
    {
      for(let j = 0;j < $scope.ListaSezioni.length;j ++)
      {
        $scope.ClasseCliccata[$scope.ListaSezioni[j] + $scope.Anno[i]] = false;
      }
    }
  }
  
  CaricaClassi = function ()
  {
    for (let k = 0; k < $scope.ArrayClassiFinale.length ; k ++)
         $scope.ClasseCliccata[$scope.ArrayClassiFinale[k].Sezione + $scope.ArrayClassiFinale[k].Anno] = true;
  }
  
  $scope.CreaPdfListaDocenti = function (ChiaveIstituto,NomeIstituto,CodiceIstituto,ProvinciaIstituto)
  {
    $scope.StampaOn        = true;
    $scope.EditingOn       = false;
    var ListaDocenti       = [];
    var ListaDisponibilita = []
    SystemInformation.GetSQL('Institute',{CHIAVE : ChiaveIstituto},function(Results)
    {
      ListaDocenti       = SystemInformation.FindResults(Results,'InstituteTeacherList');
      ListaDisponibilita = SystemInformation.FindResults(Results,'InstituteTeacherAvailability');
      if(ListaDocenti != undefined && ListaDisponibilita != undefined)
      {
         if(ListaDocenti.length != 0)
         {
            ListaDocenti.forEach(function(Docente){Docente.DISPONIBILITA = []});
            
            for(let i = 0;i < ListaDocenti.length;i ++)
                for(let j = 0;j < ListaDisponibilita.length;j ++)
                    if (ListaDisponibilita[j].DOCENTE == ListaDocenti[i].DOCENTE)
                        ListaDocenti[i].DISPONIBILITA.push(ListaDisponibilita[j])
                       
            var Data           = new Date();
            var DataAnno       = Data.getFullYear();
            var DataMese       = Data.getMonth()+1; 
            var DataGiorno     = Data.getDate();
            var DataSpedizione = DataGiorno.toString() + '/' + DataMese.toString() +  '/' + DataAnno.toString();
          
            var doc = new jsPDF();
            doc.setProperties({title: 'LISTA DOCENTI ISTITUTO ' + DataSpedizione});
            doc.setFontSize(10); 
            doc.setFontType('bold');
            doc.text(10,20,"LISTA DOCENTI NELL'ISTITUTO:");
            doc.text(10,25,NomeIstituto + ' (CODICE: ' + CodiceIstituto + ' ), ' + ProvinciaIstituto);
            doc.setFontSize(8);
            var CoordY = 35;                       
            
            for(let k = 0;k < ListaDocenti.length;k ++)
            {
                if (CoordY >= 275) 
                {
                  doc.addPage();
                  CoordY = 10;
                }
                doc.setFontSize(8);
                doc.setFontType('bold');
                doc.text(10,CoordY+5,'DOCENTE: ' + ListaDocenti[k].NOME_DOCENTE);
                CoordY += 5;
                doc.setFontSize(7);
                doc.setFontType('italic');

                var StringaDisponibilita = [];
                if(ListaDocenti[k].DISPONIBILITA.length == 0)
                {
                   StringaDisponibilita.push('NESSUNA DISPONIBILITA ORARIA REGISTRATA');
                   doc.text(10,CoordY+5,StringaDisponibilita.toString());
                }
                else
                {  
                   CoordY += 5;
                   doc.text(40,CoordY,'DA');
                   doc.text(70,CoordY,'A');
                   doc.text(100,CoordY,'DA');
                   doc.text(130,CoordY,'A');
                   doc.text(160,CoordY,'DA');
                   doc.text(190,CoordY,'A');
                   CoordYTmp = CoordY;
                   CoordY += 5;
                   CoordYTmp = CoordY;
                   doc.text(10,CoordY,'Lun');
                   doc.setLineWidth(0.1);
                   doc.line(10, CoordY+1.5, 200, CoordY+2);
                   CoordY += 5;
                   doc.text(10,CoordY,'Mar');
                   doc.setLineWidth(0.1);
                   doc.line(10, CoordY+1.5, 200, CoordY+2);
                   CoordY += 5;
                   doc.text(10,CoordY,'Mer');
                   doc.setLineWidth(0.1);
                   doc.line(10, CoordY+1.5, 200, CoordY+2);
                   CoordY += 5;
                   doc.text(10,CoordY,'Gio');
                   doc.setLineWidth(0.1);
                   doc.line(10, CoordY+1.5, 200, CoordY+2);
                   CoordY += 5;
                   doc.text(10,CoordY,'Ven');
                   doc.setLineWidth(0.1);
                   doc.line(10, CoordY+1.5, 200, CoordY+2);
                   CoordY += 5;
                   doc.text(10,CoordY,'Sab');
                   doc.setLineWidth(0.1);
                   doc.line(10, CoordY+1.5, 200, CoordY+2);
                   CoordY += 5;
                   doc.text(10,CoordY,'Dom');
                   doc.setLineWidth(0.1);
                   doc.line(10, CoordY+1.5, 200, CoordY+2);
                   
                   for(let l = 0;l < ListaDocenti[k].DISPONIBILITA.length;l ++)
                   {
                      switch(parseInt(ListaDocenti[k].DISPONIBILITA[l].GIORNO))
                      {
                             case 0 : switch(parseInt(ListaDocenti[k].DISPONIBILITA[l].POSIZIONE))
                                      {
                                             case 0 : doc.text(40,CoordYTmp,ListaDocenti[k].DISPONIBILITA[l].DA == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].DA, 'HH:mm:ss').format('HH:mm'));
                                                      doc.text(70,CoordYTmp,ListaDocenti[k].DISPONIBILITA[l].A == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].A, 'HH:mm:ss').format('HH:mm'));
                                                      break;
                                             case 1 : doc.text(100,CoordYTmp,ListaDocenti[k].DISPONIBILITA[l].DA == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].DA, 'HH:mm:ss').format('HH:mm'));
                                                      doc.text(130,CoordYTmp,ListaDocenti[k].DISPONIBILITA[l].A == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].A, 'HH:mm:ss').format('HH:mm'));
                                                      break;
                                             case 2 : doc.text(160,CoordYTmp,ListaDocenti[k].DISPONIBILITA[l].DA == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].DA, 'HH:mm:ss').format('HH:mm'));
                                                      doc.text(190,CoordYTmp,ListaDocenti[k].DISPONIBILITA[l].A == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].A, 'HH:mm:ss').format('HH:mm'));
                                                      break;
                                      }
                                      break;
                             case 1 : switch(parseInt(ListaDocenti[k].DISPONIBILITA[l].POSIZIONE))
                                      {
                                             case 0 : doc.text(40,CoordYTmp+5,ListaDocenti[k].DISPONIBILITA[l].DA == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].DA, 'HH:mm:ss').format('HH:mm'));
                                                      doc.text(70,CoordYTmp+5,ListaDocenti[k].DISPONIBILITA[l].A == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].A, 'HH:mm:ss').format('HH:mm'));
                                                      break;
                                             case 1 : doc.text(100,CoordYTmp+5,ListaDocenti[k].DISPONIBILITA[l].DA == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].DA, 'HH:mm:ss').format('HH:mm'));
                                                      doc.text(130,CoordYTmp+5,ListaDocenti[k].DISPONIBILITA[l].A == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].A, 'HH:mm:ss').format('HH:mm'));
                                                      break;
                                             case 2 : doc.text(160,CoordYTmp+5,ListaDocenti[k].DISPONIBILITA[l].DA == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].DA, 'HH:mm:ss').format('HH:mm'));
                                                      doc.text(190,CoordYTmp+5,ListaDocenti[k].DISPONIBILITA[l].A == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].A, 'HH:mm:ss').format('HH:mm'));
                                                      break;
                                      }
                                      break;
                             case 2 : switch(parseInt(ListaDocenti[k].DISPONIBILITA[l].POSIZIONE))
                                      {
                                             case 0 : doc.text(40,CoordYTmp+10,ListaDocenti[k].DISPONIBILITA[l].DA == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].DA, 'HH:mm:ss').format('HH:mm'));
                                                      doc.text(70,CoordYTmp+10,ListaDocenti[k].DISPONIBILITA[l].A == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].A, 'HH:mm:ss').format('HH:mm'));
                                                      break;
                                             case 1 : doc.text(100,CoordYTmp+10,ListaDocenti[k].DISPONIBILITA[l].DA == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].DA, 'HH:mm:ss').format('HH:mm'));
                                                      doc.text(130,CoordYTmp+10,ListaDocenti[k].DISPONIBILITA[l].A == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].A, 'HH:mm:ss').format('HH:mm'));
                                                      break;
                                             case 2 : doc.text(160,CoordYTmp+10,ListaDocenti[k].DISPONIBILITA[l].DA == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].DA, 'HH:mm:ss').format('HH:mm'));
                                                      doc.text(190,CoordYTmp+10,ListaDocenti[k].DISPONIBILITA[l].A == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].A, 'HH:mm:ss').format('HH:mm'));
                                                      break;
                                      }
                                      break;
                             case 3 : switch(parseInt(ListaDocenti[k].DISPONIBILITA[l].POSIZIONE))
                                      {
                                             case 0 : doc.text(40,CoordYTmp+15,ListaDocenti[k].DISPONIBILITA[l].DA == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].DA, 'HH:mm:ss').format('HH:mm'));
                                                      doc.text(70,CoordYTmp+15,ListaDocenti[k].DISPONIBILITA[l].A == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].A, 'HH:mm:ss').format('HH:mm'));
                                                      break;
                                             case 1 : doc.text(100,CoordYTmp+15,ListaDocenti[k].DISPONIBILITA[l].DA == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].DA, 'HH:mm:ss').format('HH:mm'));
                                                      doc.text(130,CoordYTmp+15,ListaDocenti[k].DISPONIBILITA[l].A == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].A, 'HH:mm:ss').format('HH:mm'));
                                                      break;
                                             case 2 : doc.text(160,CoordYTmp+15,ListaDocenti[k].DISPONIBILITA[l].DA == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].DA, 'HH:mm:ss').format('HH:mm'));
                                                      doc.text(190,CoordYTmp+15,ListaDocenti[k].DISPONIBILITA[l].A == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].A, 'HH:mm:ss').format('HH:mm'));
                                                      break;
                                      }
                                      break;
                             case 4 : switch(parseInt(ListaDocenti[k].DISPONIBILITA[l].POSIZIONE))
                                      {
                                             case 0 : doc.text(40,CoordYTmp+20,ListaDocenti[k].DISPONIBILITA[l].DA == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].DA, 'HH:mm:ss').format('HH:mm'));
                                                      doc.text(70,CoordYTmp+20,ListaDocenti[k].DISPONIBILITA[l].A == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].A, 'HH:mm:ss').format('HH:mm'));
                                                      break;
                                             case 1 : doc.text(100,CoordYTmp+20,ListaDocenti[k].DISPONIBILITA[l].DA == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].DA, 'HH:mm:ss').format('HH:mm'));
                                                      doc.text(130,CoordYTmp+20,ListaDocenti[k].DISPONIBILITA[l].A == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].A, 'HH:mm:ss').format('HH:mm'));
                                                      break;
                                             case 2 : doc.text(160,CoordYTmp+20,ListaDocenti[k].DISPONIBILITA[l].DA == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].DA, 'HH:mm:ss').format('HH:mm'));
                                                      doc.text(190,CoordYTmp+20,ListaDocenti[k].DISPONIBILITA[l].A == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].A, 'HH:mm:ss').format('HH:mm'));
                                                      break; 
                                      }
                                      break;
                             case 5 : switch(parseInt(ListaDocenti[k].DISPONIBILITA[l].POSIZIONE))
                                      {
                                             case 0 : doc.text(40,CoordYTmp+25,ListaDocenti[k].DISPONIBILITA[l].DA == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].DA, 'HH:mm:ss').format('HH:mm'));
                                                      doc.text(70,CoordYTmp+25,ListaDocenti[k].DISPONIBILITA[l].A == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].A, 'HH:mm:ss').format('HH:mm'));
                                                      break;
                                             case 1 : doc.text(100,CoordYTmp+25,ListaDocenti[k].DISPONIBILITA[l].DA == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].DA, 'HH:mm:ss').format('HH:mm'));
                                                      doc.text(130,CoordYTmp+25,ListaDocenti[k].DISPONIBILITA[l].A == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].A, 'HH:mm:ss').format('HH:mm'));
                                                      break;
                                             case 2 : doc.text(160,CoordYTmp+25,ListaDocenti[k].DISPONIBILITA[l].DA == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].DA, 'HH:mm:ss').format('HH:mm'));
                                                      doc.text(190,CoordYTmp+25,ListaDocenti[k].DISPONIBILITA[l].A == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].A, 'HH:mm:ss').format('HH:mm'));
                                                      break;
                                      }
                                      break;
                             case 6 : switch(parseInt(ListaDocenti[k].DISPONIBILITA[l].POSIZIONE))
                                      {
                                             case 0 : doc.text(40,CoordYTmp+30,ListaDocenti[k].DISPONIBILITA[l].DA == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].DA, 'HH:mm:ss').format('HH:mm'));
                                                      doc.text(70,CoordYTmp+30,ListaDocenti[k].DISPONIBILITA[l].A == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].A, 'HH:mm:ss').format('HH:mm'));
                                                      break;
                                             case 1 : doc.text(100,CoordYTmp+30,ListaDocenti[k].DISPONIBILITA[l].DA == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].DA, 'HH:mm:ss').format('HH:mm'));
                                                      doc.text(130,CoordYTmp+30,ListaDocenti[k].DISPONIBILITA[l].A == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].A, 'HH:mm:ss').format('HH:mm'));
                                                      break;
                                             case 2 : doc.text(160,CoordYTmp+30,ListaDocenti[k].DISPONIBILITA[l].DA == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].DA, 'HH:mm:ss').format('HH:mm'));
                                                      doc.text(190,CoordYTmp+30,ListaDocenti[k].DISPONIBILITA[l].A == undefined ? '' : moment(ListaDocenti[k].DISPONIBILITA[l].A, 'HH:mm:ss').format('HH:mm'));
                                                      break;
                                      }
                                      break;
                      }                             
                   }
                }
                CoordY += 5;
                doc.setFontSize(6);
                doc.text(10,290,SystemInformation.VDocAdoption)       

                doc.text(10,290,SystemInformation.VDocListaDocIst)               
            }
 
            document.getElementById('teacherListPdf').src = doc.output('datauristring');        
         }
         else
         {
            var Data           = new Date();
            var DataAnno       = Data.getFullYear();
            var DataMese       = Data.getMonth()+1; 
            var DataGiorno     = Data.getDate();
            var DataSpedizione = DataGiorno.toString() + '/' + DataMese.toString() +  '/' + DataAnno.toString();
            var doc = new jsPDF();
            doc.setProperties({title: 'LISTA DOCENTI ISTITUTO ' + DataSpedizione});
            doc.setFontSize(10); 
            doc.setFontType('bold');
            doc.setTextColor(255,0,0);
            doc.text(60,20,'NESSUN DOCENTE ASSEGNATO A QUESTO ISTITUTO');
            document.getElementById('teacherListPdf').src = doc.output('datauristring')          
         }         
      }
      else SystemInformation.ApplyOnError('Modello docenti e disponibilita per istituto non conforme','');     
    },'SelectInstituteTeacherList')
  }
  
  $scope.ModificaListaClassi = function(sezione,anno)
  {
    var DatoTrovato = false;
    
    if($scope.ClasseCliccata[sezione + anno])                                                                       
    {    
      for(let i = 0; i < $scope.ArrayClassiFinale.length; i ++)
      {      
        if (($scope.ArrayClassiFinale[i].Sezione == sezione) && ($scope.ArrayClassiFinale[i].Anno == anno)) 
        {  
          $scope.ArrayClassiFinale[i].Eliminato = false;
          $scope.ArrayClassiFinale[i].Nuovo     = false;
          DatoTrovato                           = true;  
        }
      }        
      if (!DatoTrovato) 
      {
        $scope.ClasseAggiunta = { 
                                  Chiave    : -1,
                                  Eliminato : false,
                                  Nuovo     : true,
                                  Sezione   : sezione,
                                  Anno      : anno     
                                };
        $scope.ArrayClassiFinale.push($scope.ClasseAggiunta); 
        $scope.ClasseAggiunta = {};
      }
    }                      
    else
    {    
        for(let i = 0; i < $scope.ArrayClassiFinale.length; i ++)
        {
          if (($scope.ArrayClassiFinale[i].Sezione == sezione) && ($scope.ArrayClassiFinale[i].Anno == anno))
          {
                SystemInformation.GetSQL('Institute',
                                         {
                                           Istituto : $scope.IstitutoInEditing.Chiave,
                                           Sezione  : $scope.ArrayClassiFinale[i].Sezione,
                                           Anno     : $scope.ArrayClassiFinale[i].Anno
                                         },
                                         function(Results)
                                         {
                                           ContoAdozioni = SystemInformation.FindResults(Results,'GetAdoptionClass');
                                           if(ContoAdozioni != undefined)
                                           {
                                              ContoAdozioni = ContoAdozioni[0].COUNT_ADOZIONI;
                                              var VaiAvanti = true;
                                              if(ContoAdozioni != 0)
                                                 VaiAvanti = confirm('Sono presenti adozioni associate. Eliminare?');
                                              if(VaiAvanti)
                                              {
                                                 if ($scope.ArrayClassiFinale[i].Nuovo)                                                          
                                                     $scope.ArrayClassiFinale.splice(i,1)
                                                 else                                                                                             
                                                 {
                                                     $scope.ArrayClassiFinale[i].Nuovo = false;
                                                     $scope.ArrayClassiFinale[i].Eliminato = true;
                                                 }
                                              }
                                              else $scope.ClasseCliccata[$scope.ArrayClassiFinale[i].Sezione + $scope.ArrayClassiFinale[i].Anno] = true;
                                           }
                                           else SystemInformation.ApplyOnError('Modello adozioni per classe non conforme','');                  
                                         },'GetAdozioniClasse');               
          }  
        }
    }            
  }
  
  SystemInformation.GetSQL('Accessories',{}, function(Results)
  {
    ListaProvinceOpt = SystemInformation.FindResults(Results,'ProvinceList');
    if (ListaProvinceOpt != undefined) 
    {
      var ListaProvinceTmp = []
      var AddProvincia = function (Chiave,Nome)
      {
        ListaProvinceTmp.push({
                                Chiave : Chiave,
                                Nome   : Nome
                              });
      }
      ListaProvinceOpt.forEach(function(provincia)
      {
        AddProvincia(provincia.CHIAVE,provincia.NOME)
      });
      $scope.ListaProvince = ListaProvinceTmp;
    }
    else SystemInformation.ApplyOnError('Modello province non conforme','');     
  });
  
  SystemInformation.GetSQL('Accessories',{}, function(Results)
  {
    ListaTipologieOpt = SystemInformation.FindResults(Results,'InstituteTypeList');
    if (ListaTipologieOpt != undefined) 
    {
      var ListaTipologieTmp = []
      var AddTipologia = function (Chiave,Descrizione)
      {
        ListaTipologieTmp.push({
                                Chiave      : Chiave,
                                Descrizione : Descrizione
                              });
      }
      ListaTipologieOpt.forEach(function(tipologia)
      {
        AddTipologia(tipologia.CHIAVE,tipologia.DESCRIZIONE)
      });
      $scope.ListaTipologie = ListaTipologieTmp;
    }
    else SystemInformation.ApplyOnError('Modello tipologie non conforme','');     
  });
  
  SystemInformation.GetSQL('User',{}, function(Results)
  {
    ListaPromotoriOpt = SystemInformation.FindResults(Results,'UserInfoList');
    if (ListaPromotoriOpt != undefined) 
    {
      var ListaPromotoriTmp = []
      var AddPromotore = function (Chiave,RagioneSociale)
      {
        ListaPromotoriTmp.push({
                                Chiave         : Chiave,
                                RagioneSociale : RagioneSociale
                              });
      }
      ListaPromotoriOpt.forEach(function(promotore)
      {
        AddPromotore(promotore.CHIAVE,promotore.RAGIONE_SOCIALE)
      });
      $scope.ListaPromotori = ListaPromotoriTmp;
    }
    else SystemInformation.ApplyOnError('Modello promotori non conforme','');     
  });
    
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
  
  $scope.RefreshListaIstituti = function()
  {
    SystemInformation.GetSQL('Institute', {}, function(Results)  
    {
      IstitutiInfoLista = SystemInformation.FindResults(Results,'InstituteInfoList');
      if(IstitutiInfoLista != undefined)
      { 
         for(let i = 0;i < IstitutiInfoLista.length;i ++)
         
             IstitutiInfoLista[i] = {
                                      Chiave        : IstitutiInfoLista[i].CHIAVE,
                                      Codice        : (IstitutiInfoLista[i].CODICE == null || IstitutiInfoLista[i].CODICE == '') ? 'N.D.' : IstitutiInfoLista[i].CODICE,   
                                      Nome          : (IstitutiInfoLista[i].NOME == null || IstitutiInfoLista[i].NOME == '') ? 'N.D.' : IstitutiInfoLista[i].NOME,  
                                      Promotore     : IstitutiInfoLista[i].PROMOTORE,
                                      Provincia     : IstitutiInfoLista[i].PROVINCIA, 
                                      ProvinciaNome : IstitutiInfoLista[i].NOME_PROVINCIA,
                                      Nascosto      : (IstitutiInfoLista[i].NASCOSTO == null || IstitutiInfoLista[i].NASCOSTO == 0) ? false : 1                        
                                    }
         
            $scope.ListaIstituti = IstitutiInfoLista
            if(SystemInformation.DataBetweenController.ProvinciaF != undefined)
            {
               $scope.ProvinciaFiltro = SystemInformation.DataBetweenController.ProvinciaF;
               SystemInformation.DataBetweenController = {};
            }
      }
      else SystemInformation.ApplyOnError('Modello istituti non conforme','');   
    });
    
  }
  
  $scope.RendiVisibileIstituto = function (ChiaveIstituto,NomeIstituto)
  {
    if(confirm("Rendere visibile nuovamente l'istituto " + NomeIstituto + " ?"))
    {
       var $ObjQuery     = { Operazioni : [] };         
       $ObjQuery.Operazioni.push({
                                   Query     : 'SetInstituteVisibility',
                                   Parametri : {CHIAVE : ChiaveIstituto}
                                 }); 
       
       SystemInformation.PostSQL('Institute',$ObjQuery,function(Answer)
       {
         $scope.RefreshListaIstituti(); 
       });
    }
  }
  
  $scope.UnisciIstituti = function(IstitutoOld) 
  { 
    $mdDialog.show({ 
                     controller          : DialogControllerUnisciIstituti,
                     templateUrl         : "template/transferTeacherInstitutePopup.html",
                     targetEvent         : IstitutoOld,
                     scope               : $scope,
                     preserveScope       : true,
                     clickOutsideToClose : true,
                     locals              : {IstitutoOld}
                   })
    .then(function(answer) 
    {}, 
    function() 
    {});
  };

  function DialogControllerUnisciIstituti($scope,$mdDialog,IstitutoOld)
  {
    SystemInformation.GetSQL('Institute',{},function(Results)
    {
      $scope.IstitutoOld = IstitutoOld.Nome;
      $scope.ListaIstitutiPopupUnione = [];
      var ListaIstitutiPopupTmp = []
      
      ListaIstitutiPopupTmp = SystemInformation.FindResults(Results,'InstituteInfoListOnlyVisibile');
      if(ListaIstitutiPopupTmp != undefined)
      {
         for(let i = 0;i < ListaIstitutiPopupTmp.length;i ++)         
             ListaIstitutiPopupTmp[i] = {
                                          Chiave    : ListaIstitutiPopupTmp[i].CHIAVE,
                                          Nome      : ListaIstitutiPopupTmp[i].NOME,
                                          Codice    : ListaIstitutiPopupTmp[i].CODICE,
                                          Provincia : ListaIstitutiPopupTmp[i].PROVINCIA              
                                        }
             $scope.ListaIstitutiPopupUnione = ListaIstitutiPopupTmp;
             
         $scope.hide = function() 
         {
           $mdDialog.hide();
         };

         $scope.AnnullaPopup = function() 
         { 
           $scope.IstitutoDaUnire = -1;
           $mdDialog.cancel();
         };
         
         $scope.ConfermaPopup = function(Istituto) 
         {     
           if(Istituto == -1) 
           { 
             alert ('Nessun istituto selezionato!');      
             return
           }
           else
           {
             IstitutoCorrisp = $scope.ListaIstitutiPopupUnione.find(function(AIstituto){return(AIstituto.Chiave == $scope.IstitutoDaUnire);});            
             if(confirm("Cliccando CONFERMA tutti i docenti verranno passati dall'istituto " + IstitutoOld.Nome + " all'istituto " + IstitutoCorrisp.Nome + ".Confermi?"))
             {
                var $ObjQuery = {Operazioni:[]}
                ParametriUnione = {
                                    OldIstituto : IstitutoOld.Chiave, 
                                    NewIstituto : $scope.IstitutoDaUnire 
                                  }
                $ObjQuery.Operazioni.push({
                                            Query     : 'MergeInstitute',
                                            Parametri : ParametriUnione
                                          });
                SystemInformation.PostSQL('Institute',$ObjQuery,function(Answer)
                {
                  $scope.ListaIstitutiPopupUnione = [];
                  $mdDialog.hide();
                  $scope.RefreshListaIstituti();                 
                });
             }              
           }
                   
         };
             
             
      }
      else SystemInformation.ApplyOnError('Modello istituti visibili non conforme','')      
    },'SelectSQLOnlyVisible');
  }  
  
  GetCodeSezione = function(Sezione)
  {
     switch(Sezione)
     {
       case 'A' : return(0);
                  break;
       case 'B' : return(1);
                  break;
       case 'C' : return(2);
                  break;
       case 'D' : return(3);
                  break;
       case 'E' : return(4);
                  break;           
       case 'F' : return(5);
                  break;
       case 'G' : return(6);
                  break;
       case 'H' : return(7);
                  break;
       case 'I' : return(8);
                  break;
       case 'L' : return(9);
                  break;
       case 'M' : return(10);
                  break;
       case 'N':  return(11);
                  break; 
       case 'O' : return(12);
                  break;
       case 'P' : return(13);
                  break;
       case 'Q' : return(14);
                  break;
       case 'R' : return(15);
                  break;
       case 'S' : return(16);
                  break;
       case 'T' : return(17);
                  break;
       case 'U' : return(18);
                  break;
       case 'V' : return(19);
                  break;         
       case 'Z' : return(20);
                  break;
       default  : return(-1);
                  break;
     }        
  }
  
  $scope.ModificaIstituto = function(istituto)
  {
    //SystemInformation.DataBetweenController.ProvinciaF = $scope.ProvinciaFiltro;
    $scope.EditingOn = true;    
    SystemInformation.GetSQL('Institute', {CHIAVE : istituto.Chiave}, function(Results)
    {
      IstitutoDettaglio = SystemInformation.FindResults(Results, 'InstituteDettaglio');
      IstitutoDettaglioClassi = SystemInformation.FindResults(Results,'ClassiInstitute');
      if(IstitutoDettaglio != undefined && IstitutoDettaglioClassi != undefined)
      {
        // Carica dati istituto 
        $scope.IstitutoInEditing.Chiave             = IstitutoDettaglio[0].CHIAVE;
        $scope.IstitutoInEditing.Codice             = IstitutoDettaglio[0].CODICE      == undefined ? '' : IstitutoDettaglio[0].CODICE;
        $scope.IstitutoInEditing.Nome               = IstitutoDettaglio[0].NOME        == undefined ? '' : IstitutoDettaglio[0].NOME;
        $scope.IstitutoInEditing.Tipologia          = IstitutoDettaglio[0].TIPOLOGIA   == undefined ? -1 : IstitutoDettaglio[0].TIPOLOGIA;
        $scope.IstitutoInEditing.Indirizzo          = IstitutoDettaglio[0].CODICE      == undefined ? '' : IstitutoDettaglio[0].INDIRIZZO;
        $scope.IstitutoInEditing.Comune             = IstitutoDettaglio[0].COMUNE      == undefined ? '' : IstitutoDettaglio[0].COMUNE;
        $scope.IstitutoInEditing.Provincia          = IstitutoDettaglio[0].PROVINCIA   == undefined ? -1 : IstitutoDettaglio[0].PROVINCIA;
        $scope.IstitutoInEditing.Cap                = IstitutoDettaglio[0].CAP         == undefined ? '' : IstitutoDettaglio[0].CAP;
        $scope.IstitutoInEditing.Email              = IstitutoDettaglio[0].EMAIL       == undefined ? '' : IstitutoDettaglio[0].EMAIL;
        $scope.IstitutoInEditing.Pec                = IstitutoDettaglio[0].PEC         == undefined ? '' : IstitutoDettaglio[0].PEC;
        $scope.IstitutoInEditing.SitoWeb            = IstitutoDettaglio[0].SITO_WEB    == undefined ? '' : IstitutoDettaglio[0].SITO_WEB;
        $scope.IstitutoInEditing.SedeSuccursale     = IstitutoDettaglio[0].SEDE        == undefined ? 1  : IstitutoDettaglio[0].SEDE;
        $scope.IstitutoInEditing.Referente_1        = IstitutoDettaglio[0].REFERENTE_1 == undefined ? '' : IstitutoDettaglio[0].REFERENTE_1;
        $scope.IstitutoInEditing.NumeroTelefono_1   = IstitutoDettaglio[0].TELEFONO_1  == undefined ? '' : IstitutoDettaglio[0].TELEFONO_1;
        $scope.IstitutoInEditing.Referente_2        = IstitutoDettaglio[0].REFERENTE_2 == undefined ? '' : IstitutoDettaglio[0].REFERENTE_2;
        $scope.IstitutoInEditing.NumeroTelefono_2   = IstitutoDettaglio[0].TELEFONO_2  == undefined ? '' : IstitutoDettaglio[0].TELEFONO_2;
        $scope.IstitutoInEditing.Referente_3        = IstitutoDettaglio[0].REFERENTE_3 == undefined ? '' : IstitutoDettaglio[0].REFERENTE_3;
        $scope.IstitutoInEditing.NumeroTelefono_3   = IstitutoDettaglio[0].TELEFONO_3  == undefined ? '' : IstitutoDettaglio[0].TELEFONO_3;
        $scope.IstitutoInEditing.PromotoreAssegnato = IstitutoDettaglio[0].PROMOTORE   == undefined ? -1 : IstitutoDettaglio[0].PROMOTORE;
        $scope.IstitutoInEditing.Preside            = IstitutoDettaglio[0].PRESIDE     == undefined ? '' : IstitutoDettaglio[0].PRESIDE;
        $scope.IstitutoInEditing.Vicepreside        = IstitutoDettaglio[0].VICEPRESIDE == undefined ? '' : IstitutoDettaglio[0].VICEPRESIDE;
        $scope.IstitutoInEditing.DirAmmnstr         = IstitutoDettaglio[0].DIR_AMMNSTR == undefined ? '' : IstitutoDettaglio[0].DIR_AMMNSTR;
        // Carica dati classi
        ResetClassi();
        if(IstitutoDettaglioClassi.length > 0)
        {         
          $scope.SezioneMax = GetCodeSezione(IstitutoDettaglioClassi[IstitutoDettaglioClassi.length-1].SEZIONE);
          $scope.CreaListaSelezione($scope.SezioneMax);
          $scope.ArrayClassiFinale = [];
          for(let i = 0;i < IstitutoDettaglioClassi.length;i ++)
          {
            $scope.ArrayClassiFinale.push({
                                            Eliminato : false,
                                            Nuovo     : false,
                                            Sezione   : IstitutoDettaglioClassi[i].SEZIONE,
                                            Anno      : IstitutoDettaglioClassi[i].ANNO     
                                          })
            CaricaClassi();
          }
        }
        else 
        {
          $scope.SezioneMax = 10;
          $scope.CreaListaSelezione($scope.SezioneMax);
          $scope.ArrayClassiFinale = []       
        }
      }       
      else SystemInformation.ApplyOnError('Modello istituto non conforme',''); 
    },'SQLDettaglio'); 
  }
    
  
  $scope.NuovoIstituto = function()
  { 
    $scope.EditingOn = true; 
    ResetClassi();
    $scope.IstitutoInEditing = {
                                 Chiave             : -1,
                                 Codice             : '',
                                 Nome               : '',
                                 Tipologia          : -1,
                                 Indirizzo          : '',
                                 Comune             : '',
                                 Provincia          : -1,
                                 Cap                : '',
                                 Email              : '',
                                 Pec                : '',
                                 SitoWeb            : '',
                                 SedeSuccursale     : 1,
                                 Referente_1        : '',
                                 NumeroTelefono_1   : '',
                                 Referente_2        : '',
                                 NumeroTelefono_2   : '',
                                 Referente_3        : '',
                                 NumeroTelefono_3   : '',
                                 PromotoreAssegnato : -1,
                                 Preside            : '',
                                 Vicepreside        : '',
                                 DirAmmnstr         : ''                                 
                               };
    $scope.SezioneMax        = 10;   
    $scope.ArrayClassiFinale = [];
    $scope.CreaListaSelezione($scope.SezioneMax);
  }
  
  $scope.OnAnnullaIstitutoClicked = function()
  {
    $scope.EditingOn = false;
    $scope.RefreshListaIstituti();
  }
  
  $scope.ConfermaIstituto = function() 
  {       
     var $ObjQuery     = { Operazioni : [] };          
     var ParamIstituto = {
                           CHIAVE      : $scope.IstitutoInEditing.Chiave,
                           CODICE      : $scope.IstitutoInEditing.Codice,
                           NOME        : $scope.IstitutoInEditing.Nome.xSQL(),
                           INDIRIZZO   : $scope.IstitutoInEditing.Indirizzo.xSQL(),
                           TIPOLOGIA   : $scope.IstitutoInEditing.Tipologia == -1 ? null : $scope.IstitutoInEditing.Tipologia,
                           COMUNE      : $scope.IstitutoInEditing.Comune.xSQL(),
                           PROVINCIA   : $scope.IstitutoInEditing.Provincia == -1 ? null : $scope.IstitutoInEditing.Provincia,
                           CAP         : $scope.IstitutoInEditing.Cap.xSQL(),
                           EMAIL       : $scope.IstitutoInEditing.Email.xSQL(),
                           PEC         : $scope.IstitutoInEditing.Pec.xSQL(),
                           SITO_WEB    : $scope.IstitutoInEditing.SitoWeb.xSQL(),
                           SEDE        : $scope.IstitutoInEditing.SedeSuccursale,
                           REFERENTE_1 : $scope.IstitutoInEditing.Referente_1.xSQL(),
                           TELEFONO_1  : $scope.IstitutoInEditing.NumeroTelefono_1.xSQL(),
                           REFERENTE_2 : $scope.IstitutoInEditing.Referente_2.xSQL(),
                           TELEFONO_2  : $scope.IstitutoInEditing.NumeroTelefono_2.xSQL(),
                           REFERENTE_3 : $scope.IstitutoInEditing.Referente_3.xSQL(),
                           TELEFONO_3  : $scope.IstitutoInEditing.NumeroTelefono_3.xSQL(),
                           PROMOTORE   : $scope.IstitutoInEditing.PromotoreAssegnato == -1 ? null : $scope.IstitutoInEditing.PromotoreAssegnato,
                           PRESIDE     : $scope.IstitutoInEditing.Preside.xSQL(),
                           VICEPRESIDE : $scope.IstitutoInEditing.Vicepreside.xSQL(),
                           DIR_AMMNSTR : $scope.IstitutoInEditing.DirAmmnstr.xSQL()                         
                        };
                                                                  
     var NuovoIstituto = ($scope.IstitutoInEditing.Chiave == -1);
     if(NuovoIstituto)     
     {           
       $ObjQuery.Operazioni.push({
                                   Query     : 'InsertInstitute',
                                   Parametri : ParamIstituto
                                 });
     }
     else
     {
       $ObjQuery.Operazioni.push({
                                   Query     : 'UpdateInstitute',
                                   Parametri : ParamIstituto
                                 });
     };
     
     for(let i = 0; i < $scope.ArrayClassiFinale.length ;i ++)
     {  
       var NuovaClasse         = ($scope.ArrayClassiFinale[i].Chiave == -1);
       var ParamClassiIstituto = {
                                   CHIAVE   : $scope.ArrayClassiFinale[i].Chiave,
                                   ANNO     : $scope.ArrayClassiFinale[i].Anno,
                                   SEZIONE  : $scope.ArrayClassiFinale[i].Sezione,
                                   ISTITUTO : $scope.IstitutoInEditing.Chiave
                                 }
       if(NuovoIstituto && NuovaClasse && !($scope.ArrayClassiFinale[i].Eliminato))  
       { 
         $ObjQuery.Operazioni.push({
                                     Query     : 'InsertClassAfterInsert',
                                     Parametri : ParamClassiIstituto,
                                     ResetKeys : [2]
                                   });
       }
       if(!NuovoIstituto && NuovaClasse && $scope.ArrayClassiFinale[i].Nuovo && !($scope.ArrayClassiFinale[i].Eliminato))
       {  
         $ObjQuery.Operazioni.push({
                                     Query     : 'InsertClass',
                                     Parametri : ParamClassiIstituto,
                                     ResetKeys : [1]
                                   });
       }
       if (!NuovoIstituto && $scope.ArrayClassiFinale[i].Eliminato)
       {
         $ObjQuery.Operazioni.push({
                                     Query     : 'DeleteAdoption',
                                     Parametri : ParamClassiIstituto
                                   });
         $ObjQuery.Operazioni.push({
                                     Query     : 'DeleteClass',
                                     Parametri : ParamClassiIstituto
                                   });
       }         
     }
  
     SystemInformation.PostSQL('Institute',$ObjQuery,function(Answer)
     {  
       $scope.EditingOn = false;
       $scope.RefreshListaIstituti();
     });  
  }
  
  $scope.EliminaIstituto = function(Istituto)
  {
    if(confirm('Eliminare l\'istituto: ' + Istituto.Nome + ' ?'))
    {
      var $ObjQuery           = { Operazioni : [] };
      var ParamIstituto       = { CHIAVE     : Istituto.Chiave };
      var ParamClassiIstituto = { ISTITUTO   : Istituto.Chiave}
       
      $ObjQuery.Operazioni.push({
                                  Query     : 'DeleteClass',
                                  Parametri : ParamClassiIstituto
                                });
      
      $ObjQuery.Operazioni.push({
                                  Query     : 'DeleteInstitute',
                                  Parametri : ParamIstituto
                                });
                                
    
                                
      SystemInformation.PostSQL('Institute',$ObjQuery,function(Answer)
      {
        $scope.RefreshListaIstituti();
      });  
    }
  } 
  
  $scope.RefreshListaIstituti();
 
}]);


SIRIOApp.filter('IstitutoByFiltro',function()
{
  return function(ListaIstituti,ProvinciaFiltro,NomeFiltro,NascostoFiltro)
         {
           if(ProvinciaFiltro == -1 && NomeFiltro == '' && NascostoFiltro == true) return(ListaIstituti);
           var ListaFiltrata = [];
           NomeFiltro = NomeFiltro.toUpperCase();
           
           var IstitutoOK = function(Istituto)
           {  
              var Result = true;
              
              if(NomeFiltro != '')
                if(Istituto.Nome.toUpperCase().indexOf(NomeFiltro) < 0)
                   Result = false;
                  
              if(ProvinciaFiltro != -1)
                 if(ProvinciaFiltro != Istituto.Provincia)
                    Result = false;
                   
              if(!NascostoFiltro)
                 if(Istituto.Nascosto)
                    Result = false;
              
              return(Result);
           }
           
           ListaIstituti.forEach(function(Istituto)
           { 
             if(IstitutoOK(Istituto)) 
                ListaFiltrata.push(Istituto)                       
           });
            
           return(ListaFiltrata);
         }
});

SIRIOApp.filter('IstitutoByNomeFiltroUnione',function()
{
  return function(ListaIstitutiPopupUnione,NomeFiltroUnione)
         {
           if(NomeFiltroUnione == '') return(ListaIstitutiPopupUnione);
           var ListaFiltrata = [];
           NomeFiltroUnione = NomeFiltroUnione.toUpperCase();
           
           var IstitutoOK = function(Istituto)
           {  
              var Result = true;
              
              if(NomeFiltroUnione != '')
                if(Istituto.Nome.toUpperCase().indexOf(NomeFiltroUnione) < 0)
                   Result = false;
              
              return(Result);
           }
           
           ListaIstitutiPopupUnione.forEach(function(Istituto)
           { 
             if(IstitutoOK(Istituto)) 
                ListaFiltrata.push(Istituto)                       
           });
            
           return(ListaFiltrata);
         }
});