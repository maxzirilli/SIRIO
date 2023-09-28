SIRIOApp.controller("communicationController",['$scope','SystemInformation','$state','$rootScope','$mdDialog','ZConfirm', function($scope,SystemInformation,$state,$rootScope,$mdDialog,ZConfirm)
{ 

  $scope.ListaComunicazioni = [];
  $scope.EditingOn          = false;
  $scope.CommInEditing      = {};
  $scope.NuovaComunicazione = false;
  
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

  $scope.ConvertiData = function (Data)
  {
     return(ZFormatDateTime('dd/mm/yyyy',ZDateFromHTMLInput(Data)));
  }
  
  $scope.RefreshListaComunicazioni = function ()
  {
    SystemInformation.GetSQL('Communication', {}, function(Results)  
    {
      CommInfoList = SystemInformation.FindResults(Results,'CommunicationInfoList');
      if(CommInfoList != undefined)
      { 
        for(let i = 0;i < CommInfoList.length;i ++)
            CommInfoList[i] = { 
                                 Chiave : CommInfoList[i].CHIAVE,
                                 Data   : CommInfoList[i].DATA,
                                 Titolo : CommInfoList[i].TITOLO,   
                                 Testo  : CommInfoList[i].TESTO,  
                                 Link   : CommInfoList[i].LINK
                              };    
          $scope.ListaComunicazioni = CommInfoList;
      }
      else SystemInformation.ApplyOnError('Modello comunicazioni non conforme','');   
    });
  }
  
  $scope.ModificaComunicazione = function(Comunicazione)
  {
    $scope.EditingOn   = true;

    $scope.CommInEditing.Chiave = Comunicazione.Chiave;
    $scope.CommInEditing.Data   = new Date(Comunicazione.Data);
    $scope.CommInEditing.Titolo = Comunicazione.Titolo;
    $scope.CommInEditing.Testo  = Comunicazione.Testo;
    $scope.CommInEditing.Link   = Comunicazione.Link;
  }
  
  $scope.NuovaComunicazione = function()
  { 
    $scope.EditingOn   = true;
    
    $scope.CommInEditing = {
                             Chiave : -1,
                             Data   : new Date(),
                             Titolo : '',
                             Testo  : '',
                             Link   : ''     
                           }
  }
  
  $scope.OnAnnullaComunicazioneClicked = function()
  {
    $scope.EditingOn = false;
    $scope.RefreshListaComunicazioni();
  }
  
  
  $scope.ConfermaComunicazione = function()
  {       
     var $ObjQuery = { Operazioni : [] };          
     var ParamComm = {
                       CHIAVE : $scope.CommInEditing.Chiave,
                       DATA   : ConstPrepareForRecordDate($scope.CommInEditing.Data),
                       TITOLO : $scope.CommInEditing.Titolo,
                       TESTO  : $scope.CommInEditing.Testo,
                       LINK   : $scope.CommInEditing.Link
                     };
                     
     var NuovaComm = ($scope.CommInEditing.Chiave == -1);
     if(NuovaComm)     
     { 
          
       $ObjQuery.Operazioni.push({
                                   Query     : 'InsertCommunication',
                                   Parametri : ParamComm
                                 }); 
     }
     else
     {
       $ObjQuery.Operazioni.push({
                                   Query     : 'UpdateCommunication',
                                   Parametri : ParamComm
                                 });
     };
  
     SystemInformation.PostSQL('Communication',$ObjQuery,function(Answer)
     {
       $scope.EditingOn = false;
       $scope.RefreshListaComunicazioni();
     });  
  }
  
  $scope.EliminaComunicazione = function(Comunicazione)
  {
    var EliminaComm = function()
    {
      var $ObjQuery = { Operazioni : [] };
      var ParamComm = { CHIAVE : Comunicazione.Chiave };
       
      $ObjQuery.Operazioni.push({
                                  Query     : 'DeleteCommunication',
                                  Parametri : ParamComm
                                });
                                
      SystemInformation.PostSQL('Communication',$ObjQuery,function(Answer)
      {
        $scope.RefreshListaComunicazioni();
      });  
    }
    ZConfirm.GetConfirmBox('AVVISO','Eliminare la comunicazione: ' + Comunicazione.Titolo + ' ?',EliminaComm,function(){});   
  }
  
  $scope.RefreshListaComunicazioni();
  
}]);