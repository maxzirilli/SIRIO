SIRIOApp.controller("changePasswordPageController",['$scope','SystemInformation','$state',function($scope,SystemInformation,$state)
{
  $scope.Profile = SystemInformation.UserInformation;
  $scope.VecchiaPassword = '';
  $scope.NuovaPassword = '';
  $scope.RidigitaPassword = '';
  $scope.PasswordErrorMessage = '';
  $scope.PasswordError = false;

  ScopeHeaderController.CheckButtons();

  $scope.ChangePassword = function()
  {
     if($scope.NuovaPassword != $scope.RidigitaPassword)
     {
      $scope.PasswordError = true;
      $scope.PasswordErrorMessage = 'Le password non corrispondono';
     }
     else
     {
        SystemInformation.ChangePassword($scope.VecchiaPassword,$scope.NuovaPassword,
                                         function(Response)
                                         {
                                            $scope.PasswordError = !Response;
                                            $scope.PasswordErrorMessage = 'Password errata'; 
                                            if(Response)
                                               $state.go('startPage');
                                         });
     }
  }

  $scope.OnAnnullaClicked = function()
  {
     $state.go('startPage');
  }
}]);

