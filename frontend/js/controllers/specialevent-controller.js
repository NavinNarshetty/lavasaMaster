myApp.controller('SpecialEventCtrl', function ($scope, TemplateService, $state, NavigationService, $stateParams, toastr, $rootScope, $uibModal, $timeout) {
    $scope.template = TemplateService.getHTML("content/special-events.html");
    TemplateService.title = "Special Events"; //This is the Title of the Website
    $scope.navigation = NavigationService.getNavigation();

    // VARIABLE INITITALISE
    // VARIABLE INITITALISE END

    // FUNCTIONS
    // FUNCTIONS END

    // JSONS
    $scope.event = [{
      name: 'December 2017',
      dates: [{
        date: ' 6 December 2017',
        day: 'Wednesday',

      }]
    }];
    // JSONS END

  //
})
