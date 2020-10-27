/*
***********************************************************
 ** ZCustomDialog - Gestione di alert,confirm e prompt personalizzati
 ** Versione 1.0  22 Ottobre 2020
 **               - Prima versione
 ***********************************************************/

ZCustomAlert = function ($mdDialog,TitoloAlert,ContenutoAlert) 
{
  $mdDialog.show(
    $mdDialog.alert()
      .parent(angular.element(document.querySelector('#popupContainer')))
      .clickOutsideToClose(true)
      .title(TitoloAlert)
      .textContent(ContenutoAlert)
      .ok('OK!')
  );
};

angular.module('ZDialogs',[])
  .controller('ZCustomConfirmController',['$scope','$mdDialog','Titolo','Testo',function($scope,$mdDialog,Titolo,Testo,OnConfirm,OnCancel)
  {
    $scope.TitoloConfirm = Titolo;
    $scope.TestoConfirm  = Testo;  
    
    $scope.GoOnConfirm = function() 
    {     
      $mdDialog.hide(true);
      OnConfirm;
    };

    $scope.AnnullaConfirm = function() 
    {     
      $mdDialog.hide(false);
      OnCancel;
    };

  }])
  .service('ZConfirm',['$mdDialog',function($mdDialog)
  {
          
     this.GetConfirmBox = function(TitoloP,TestoP,OnConfirm,OnCancel)
     {
       $mdDialog.show({
                       controller: 'ZCustomConfirmController',
                       templateUrl: 'ZLibrary/ZCustomConfirm.html',
                       parent: angular.element(document.body),
                       //targetEvent: ev,
                       clickOutsideToClose:false,
                       locals              : {Titolo : TitoloP,Testo : TestoP},
                       fullscreen: false,
                       onComplete : function()
                       {
                                     
                       }
                     })
                     .then(function(Answer) 
                     {
                       if(Answer)
                       {
                         if(OnConfirm != undefined) OnConfirm();
                       }
                       else
                       {
                         if(OnCancel != undefined) OnCancel();
                       }
                       
                     }, 
                     function() 
                     {
                       if(OnCancel != undefined) OnCancel();
                     });    
     }
  }])

  .controller('ZCustomPromptController',['$scope','$mdDialog','Titolo','Testo','Valore',function($scope,$mdDialog,Titolo,Testo,Valore)
  {
    $scope.TitoloPrompt = Titolo;
    $scope.TestoPrompt  = Testo;
    $scope.ValorePrompt = Valore;
    
    $scope.GoOnPrompt = function() 
    {     
      $mdDialog.hide($scope.ValorePrompt);
      //OnConfirm;
    };

    $scope.AnnullaPrompt = function() 
    {     
      $mdDialog.hide();
      //OnCancel;
    };

  }])
  .service('ZPrompt',['$mdDialog',function($mdDialog)
  {
          
     this.GetPromptBox = function(TitoloP,TestoP,ValoreInput,OnConfirm,OnCancel)
     {
       $mdDialog.show({
                       controller: 'ZCustomPromptController',
                       templateUrl: 'ZLibrary/ZCustomPrompt.html',
                       parent: angular.element(document.body),
                       //targetEvent: ev,
                       clickOutsideToClose:false,
                       locals              : {Titolo : TitoloP,Testo : TestoP,Valore : ValoreInput},
                       fullscreen: false,
                       onComplete : function()
                       {
                                     
                       }
                     })
                     .then(function(Answer) 
                     {
                       if(Answer != "")
                       {
                         if(OnConfirm != undefined) OnConfirm(Answer);
                       }
                       else
                       {
                         if(OnCancel != undefined) OnCancel();
                       }
                       
                     }, 
                     function() 
                     {
                       if(OnCancel != undefined) OnCancel();
                     });    
     }
  }])
  
  



