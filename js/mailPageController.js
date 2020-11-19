SIRIOApp.controller("mailPageController",['$scope','SystemInformation','$state','$mdDialog', function($scope,SystemInformation,$state,$mdDialog)
{
  $scope.MailMultipla             = false;
  $scope.ListaDocentiMailMultipla = [];
  $scope.NumeroDestinatari        = 0;
  $scope.ContatoreInvio           = 0;
  $scope.InvioInCorso             = false;

  ScopeHeaderController.CheckButtons();

  if(Array.isArray(SystemInformation.DataBetweenController.ListaDocMail) && 
     SystemInformation.DataBetweenController.ListaDocMail.length > 0 && 
     SystemInformation.DataBetweenController.MailMultipla)
  {   
     $scope.MailMultipla             = true;
     $scope.ListaDocentiMailMultipla = Array.from(SystemInformation.DataBetweenController.ListaDocMail);
     $scope.NumeroDestinatari = $scope.ListaDocentiMailMultipla.length;
     SystemInformation.DataBetweenController = {};     
  }

  $scope.MailInEditing = {
                           Destinatario : '',
                           Oggetto      : '',
                           Testo        : ''
                         };
  
  if(!$scope.MailMultipla)
     $scope.MailInEditing.Destinatario = SystemInformation.DataBetweenController.DocMail;
  
  $scope.InviaMail = function()
  {
    if(!$scope.MailMultipla)
    {
      SystemInformation.PostSQL('MailTeacher',{
                                                Oggetto      : $scope.MailInEditing.Oggetto.xSQL(),
                                                Testo        : $scope.MailInEditing.Testo.xSQL(), 
                                                Destinatario : $scope.MailInEditing.Destinatario.xSQL()
                                              },
      function()
      {       
        $scope.MailInEditing = {};
        ZCustomAlert($mdDialog,'OK','INVIO MAIL ESEGUITO');
        $state.go('teacherListPage');
      },InvioMail = true,alertMessages = false)
    }
    else
    {
      $scope.InvioInCorso = true;
      $scope.ContatoreInvio = 0;
      var SendSingolaMail = function()
      {
        SystemInformation.PostSQL('MailTeacher',
                                 {
                                   Oggetto      : $scope.MailInEditing.Oggetto.xSQL(),
                                   Testo        : $scope.MailInEditing.Testo.xSQL(), 
                                   Destinatario : $scope.ListaDocentiMailMultipla[$scope.ContatoreInvio].xSQL()
                                 },
                                 function()
                                 {       
                                    $scope.ContatoreInvio++;
                                    if($scope.ContatoreInvio >= $scope.ListaDocentiMailMultipla.length)
                                    {
                                      $scope.InvioInCorso  = false;     
                                      ZCustomAlert($mdDialog,'OK','INVIO MAIL ESEGUITO');
                                      $state.go('teacherListPage')
                                    }
                                    else SendSingolaMail();
                                 },
                                 InvioMail     = true,
                                 alertMessages = false)                  
      }
      SendSingolaMail();
    }   
  }
  
  $scope.OnAnnullaMailClicked = function()
  {
    $scope.MailInEditing = {};
    $state.go('teacherListPage');
  }
}]);