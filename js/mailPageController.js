SIRIOApp.controller("mailPageController",['$scope','SystemInformation','$state','$rootScope', function($scope,SystemInformation,$state,$rootScope)
{
  ScopeHeaderController.CheckButtons();
  $scope.MailInEditing = {
                           Destinatario : '',
                           Oggetto      : '',
                           Testo        : ''
                         };
  
  $scope.MailInEditing.Destinatario       = SystemInformation.DataBetweenController.DocMail;
  SystemInformation.DataBetweenController = {};
  
  $scope.InviaMail = function()
  {
    /*SystemInformation.PostSQL('MailTeacher',{Oggetto : $scope.MailInEditing.Oggetto.xSQL(),Testo : $scope.MailInEditing.Testo.xSQL(), Destinatario : $scope.MailInEditing.Destinatario.xSQL()},
    {       
      $scope.MailInEditing = {};
      $state.go('teacherListPage');
    },InvioMail = true,alertMessages = false)*/
  }
  
  $scope.OnAnnullaMailClicked = function()
  {
    $scope.MailInEditing = {};
    $state.go('teacherListPage');
  }
}]);