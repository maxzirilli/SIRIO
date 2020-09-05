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
    alert('Invio email a docente');
    $state.go('teacherListPage');
  }
  
  $scope.OnAnnullaMailClicked = function()
  {
    $scope.MailInEditing = {};
    $state.go('teacherListPage');
  }
}]);