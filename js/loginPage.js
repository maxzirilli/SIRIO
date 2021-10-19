SIRIOApp.controller("loginController",['$scope','SystemInformation','$state','$rootScope',
function($scope,SystemInformation,$state,$rootScope)
{
  $scope.HTTPError = SystemInformation.HTTPError;
  $scope.SubHTTPError = SystemInformation.SubHTTPError;

  $scope.Invia = function()
  {
   SystemInformation.Login($scope.Account,$scope.Password,
        function()
        {
          SystemInformation.GetInformation(
          function()
          { 
            $rootScope.ActualTheme = STATE_LOGGED;
            $state.go('startPage');
          },
          function()
          {
            $scope.HTTPError = SystemInformation.HTTPError;
            $scope.SubHTTPError = SystemInformation.SubHTTPError;
            $rootScope.ActualTheme = STATE_NOT_LOGGED;
          });
        },
        function(Errore)
        {
          $scope.HTTPError = Errore;
          $scope.SubHTTPError = SystemInformation.SubHTTPError;
        });
  }
}]);

