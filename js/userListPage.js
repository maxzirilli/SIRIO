SIRIOApp.controller("userListPageController",['$scope','SystemInformation','$state','$rootScope', function($scope,SystemInformation,$state,$rootScope)
{ 

  $scope.ListaUtenti     = [];
  $scope.EditingOn       = false;
  $scope.UtenteInEditing = {};
  $scope.NuovoUtente     = false;
  $scope.MyKey           = [];
  
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
                                   Ruolo          : UtentiInfoList[i].ROLE  
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
  }
  
  $scope.NuovoUtente = function()
  { 
    $scope.EditingOn   = true;
    
    $scope.UtenteInEditing = {
                               CHIAVE          : -1,
                               USERNAME        : '',
                               RAGIONE_SOCIALE : '',
                               EMAIL           : '',
                               ROLE            : 0       
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
                         ROLE            : $scope.UtenteInEditing.ROLE
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
        alert('IMPOSSIBILE ELIMINARE IL PROPRIO ACCOUNT DA QUESTA POSIZIONE');
        return
    }
    else
    {
        if(confirm('Eliminare l\'utente: ' + Utente.Username + ' ?'))
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
    }
  }
  
  $scope.RefreshListaUtenti();
  
}]);