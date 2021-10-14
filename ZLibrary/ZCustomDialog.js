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

  .controller('ZCustomSelectController',['$scope','$mdDialog','Titolo','Testo','Valore','Lista','Placeholder',function($scope,$mdDialog,Titolo,Testo,Valore,Lista,Placeholder)
  {
    $scope.TitoloSelect      = Titolo;
    $scope.TestoSelect       = Testo;
    $scope.ValoreSelect      = Valore;
    $scope.ListaSelect       = Lista;
    $scope.ElementoSelected  = Valore;
    $scope.PlaceholderSelect = Placeholder;
    
    $scope.GoOnSelect = function() 
    {     
      $mdDialog.hide($scope.ElementoSelected);
      //OnConfirm;
    };

    $scope.AnnullaSelect = function() 
    {     
      $mdDialog.hide();
      //OnCancel;
    };

  }])
  .service('ZSelect',['$mdDialog',function($mdDialog)
  {  
     this.GetSelectBox = function(TitoloP,TestoP,ValoreInput,ListaInput,PlaceInput,OnConfirm,OnCancel)
     {
       $mdDialog.show({
                       controller: 'ZCustomSelectController',
                       templateUrl: 'ZLibrary/ZCustomSelect.html',
                       parent: angular.element(document.body),
                       //targetEvent: ev,
                       clickOutsideToClose:false,
                       locals: {Titolo : TitoloP, Testo : TestoP, Valore : ValoreInput,Lista : ListaInput, Placeholder : PlaceInput},
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

 .controller('ZCustomCheckListBoxController',['$scope','$mdDialog','Titolo','Testo','Intestazione','Lista',function($scope,$mdDialog,Titolo,Testo,Intestazione,Lista)
  {
    $scope.TitoloCheckListBox       = Titolo;
    $scope.TestoCheckListBox        = Testo;
    $scope.IntestazioneCheckListBox = Intestazione;
    $scope.ListaCheckListBox        = Lista;

    $scope.GridOptions_Ck = {
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

    $scope.ModificaValore = function(elemento)
    {
      elemento.Selezionata = !elemento.Selezionata;

      if(elemento.Selezionata)
      {
        //if(!elemento.Nuova)
        //    elemento.Nuova = true  
      }
      else
      {
        if(!elemento.Nuova)
            elemento.Eliminata = true;
      }
    }
    
    $scope.GoOnCheckListBox = function() 
    {     
      $mdDialog.hide($scope.ListaCheckListBox);
    };

    $scope.AnnullaCheckListBox = function() 
    {     
      $mdDialog.hide();
    };

  }])
  .service('ZCheckListBox',['$mdDialog',function($mdDialog)
  {    
     this.GetCheckListBox = function(TitoloP,TestoP,IntestazioneP,ListaP,OnConfirm,OnCancel)
     {
       $mdDialog.show({
                       controller: 'ZCustomCheckListBoxController',
                       templateUrl: 'ZLibrary/ZCustomCheckListBox.html',
                       parent: angular.element(document.body),
                       //targetEvent: ev,
                       clickOutsideToClose:false,
                       locals: { Titolo : TitoloP, Testo : TestoP, Intestazione : IntestazioneP, Lista : ListaP },
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


  
  



