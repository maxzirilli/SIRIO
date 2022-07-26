// Inizializzazioni
const VERSIONE_ATTUALE = '1.53.72';

SIRIOApp.config(['$qProvider', function ($qProvider)
{
    $qProvider.errorOnUnhandledRejections(false);
}]);


SIRIOApp.config(['$mdThemingProvider', function($mdThemingProvider)
{
    $mdThemingProvider.theme('default')
      .primaryPalette('orange')
      .accentPalette('orange')
      .warnPalette('red');
}]);
  

SIRIOApp.config(['$stateProvider','$urlRouterProvider','$mdAriaProvider',function ($stateProvider, $urlRouterProvider,$mdAriaProvider)
{

    $mdAriaProvider.disableWarnings();

    $stateProvider.state('emptyPage', 
    {
        template: "<div></div>",
        url: '/emptyPage'
    });

    $stateProvider.state('loginPage', 
    {
        templateUrl: "template/loginPage.html",
        url: '/loginPage'
    });

    $stateProvider.state('startPage', 
    {
        templateUrl: "template/startPage.html",
        url: '/startPage'
    });

    $stateProvider.state('changePasswordPage', 
    {
        templateUrl: "template/changePasswordPage.html",
        url: '/changePasswordPage'
    });
    
    $stateProvider.state('userListPage', 
    {
        templateUrl: "template/userListPage.html",
        url: '/userListPage'
    });
    
    $stateProvider.state('instituteListPage', 
    {
        templateUrl: "template/instituteListPage.html",
        url: '/instituteListPage'
    });
    
    $stateProvider.state('teacherListPage', 
    {
        templateUrl: "template/teacherListPage.html",
        url: '/teacherListPage/:istituto',
        params : {
          istituto : null
        }
    });
    
    $stateProvider.state('orderEntryPage', 
    {
        templateUrl: "template/orderEntryPage.html",
        url: '/orderEntryPage'
    });
    
    $stateProvider.state('titleListPage', 
    {
        templateUrl: "template/titleListPage.html",
        url: '/titleListPage'
    });
    
    $stateProvider.state('configurationsListPage', 
    {
        templateUrl: "template/configurationsListPage.html",
        url: '/configurationsListPage'
    });
    
    $stateProvider.state('csvInstitutePage', 
    {
        templateUrl: "template/csvInstitutePage.html",
        url: '/csvInstitutePage'
    });
    
    $stateProvider.state('csvBookPage', 
    {
        templateUrl: "template/csvBookPage.html",
        url: '/csvBookPage'
    });
    
    $stateProvider.state('csvTeacherPage', 
    {
        templateUrl: "template/csvTeacherPage.html",
        url: '/csvTeacherPage'
    });
   
    $stateProvider.state('deliveryListPage', 
    {
        templateUrl: "template/deliveryListPage.html",
        url: '/deliveryListPage'
    });
    
    $stateProvider.state('deliveryModDetailPage', 
    {
        templateUrl: "template/deliveryModDetailPage.html",
        url: '/deliveryModDetailPage'
    });

    $stateProvider.state('printLabelPage', 
    {
        templateUrl: "template/printLabelPage.html",
        url: '/printLabelPage'
    });
    
    $stateProvider.state('storageLogPage', 
    {
        templateUrl: "template/storageLogPage.html",
        url: '/storageLogPage'
    });
    
    $stateProvider.state('flyingStoragePage', 
    {
        templateUrl: "template/flyingStoragePage.html",
        url: '/flyingStoragePage'
    });
    
    $stateProvider.state('csvCatalogDeAgostiniPage', 
    {
        templateUrl: "template/csvCatalogDeAgostiniPage.html",
        url: '/csvCatalogDeAgostiniPage'
    })
    
    $stateProvider.state('versionPage', 
    {
        templateUrl: "template/versionPage.html",
        url: '/versionPage'
    })
    
    $stateProvider.state('mailPage', 
    {
        templateUrl: "template/mailPage.html",
        url: '/mailPage'
    })
    
    $stateProvider.state('deliveryAdvancedManagementPage', 
    {
        templateUrl: "template/deliveryAdvancedManagementPage.html",
        url: '/deliveryAdvancedManagementPage'
    })
    
    $stateProvider.state('mailchimpUploadPage', 
    {
        templateUrl: "template/mailchimpUploadPage.html",
        url: '/mailchimpUploadPage'
    })

    $stateProvider.state('inventoryManagementPage', 
    {
        templateUrl: "template/inventoryManagementPage.html",
        url: '/inventoryManagementPage'
    }) 

    $stateProvider.state('communicationPage', 
    {
        templateUrl: "template/communicationPage.html",
        url: '/communicationPage'
    })

    $stateProvider.state('adoptionDeadlinePage', 
    {
        templateUrl: "template/adoptionDeadlinePage.html",
        url: '/adoptionDeadlinePage'
    })

    $stateProvider.state('orderEntryBarCodeGunPage', 
    {
        templateUrl: "template/orderEntryBarCodeGunPage.html",
        url: '/orderEntryBarCodeGunPage'
    })

    $stateProvider.state('statisticsPage', 
    {
        templateUrl: "template/statisticsPage.html",
        url: '/statisticsPage'
    })

    $urlRouterProvider.otherwise('loginPage');
}]);

var ScopeHeaderController = undefined;
SIRIOApp.controller("headerController",['$scope','SystemInformation','$state','$location',function($scope,SystemInformation,$state,$location)
{
   var Self = this;
   ScopeHeaderController = $scope;
   $scope.LoginEffettuato = false;
   $scope.VisButtonHome = false;
   $scope.VisButtonChangePassword = false;

   $scope.ApriListaUtenti = function()
   {    
     $state.go("userListPage"); 
   }  
   
   $scope.ApriListaIstituti = function()
   {    
     $state.go("instituteListPage"); 
   }
   
   $scope.ApriListaDocenti = function()
   {    
     $state.go("teacherListPage"); 
   } 

   $scope.ApriListaTitoli = function()
   {    
     $state.go("titleListPage"); 
   }  

   $scope.ApriListaOrdiniIngresso = function()
   {    
     $state.go("orderEntryPage"); 
   } 
   
   $scope.ApriListaConfigurazioni = function()
   {    
     $state.go("configurationsListPage"); 
   } 

   $scope.ApriListaSpedizioni = function()
   {    
     $state.go("deliveryListPage"); 
   } 

   $scope.ApriGestioneComunicazioni = function()
   {
     $state.go("communicationPage");
   }

   $scope.IsAdministrator = SystemInformation.IsAdministrator;

   $scope.checkCurrentPage = function(aPage)
   {
      var path = $location.path();
      return (path != aPage);
   }
   
   $scope.CheckVersions = function()
   {
     $state.go("versionPage");
   }
   
   $scope.CheckButtons = function()
   {
      $scope.VisButtonChangePassword = $state.current.name != 'changePasswordPage';
      $scope.VisButtonHome           = $state.current.name != 'startPage';
      $scope.VisButtonInfo           = $state.current.name != 'versionPage';
   }
   
   $scope.ChangeStatoLogin = function(_LoginEffettuato)
   {
      $scope.LoginEffettuato = _LoginEffettuato;
   }
   
   $scope.Logout = function()
   {
     SystemInformation.Logout();
     $scope.LoginEffettuato = false;
   };
   
   $scope.GoHome = function()
   {
      $state.go("startPage");
   };
   
      $scope.ChangePassword = function()
   {
      $state.go("changePasswordPage");
   }
}]);

SIRIOApp.run(['$rootScope','SystemInformation','$state','$http',function($rootScope,SystemInformation,$state,$http)
{
   $rootScope.appVersion = VERSIONE_ATTUALE;
   $rootScope.currentUserLogged = '';
   $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
   SystemInformation.GetInformation(
       function()
       {
         if($state.current.name == 'loginPage')
         {
            $state.go('startPage');
         }
       },
       function()
       {
         if(SystemInformation.HTTPResponse == HTTP_ERROR_NOT_LOGGED)
         {
            SystemInformation.HTTPError = '';
            SystemInformation.SubHTTPError = '';
         }
       });
}]);