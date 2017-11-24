myApp.controller('ReportCardCtrl', function ($scope, TemplateService, $state, NavigationService, $stateParams, toastr, $rootScope, $uibModal, $timeout, configService) {
  $scope.template = TemplateService.getHTML("content/reportcard.html");
  TemplateService.title = "Report Card"; //This is the Title of the Website
  $scope.navigation = NavigationService.getNavigation();

  configService.getDetail(function (data) {
    $scope.state = data.state;
    $scope.year = data.year;
    $scope.eventYear = data.eventYear;
    $scope.sfaCity = data.sfaCity;
    $scope.isCollege = data.isCollege;
    $scope.type = data.type;
    $scope.getFilterOptions(data);
  });

  // VARIABLE INITITALISE
  // VARIABLE INITITALISE END

  // FUNCTIONS
  // FUNCTIONS END

  // API CALLS
  // API CALLS END


  // JSONS
  // JSONS END

  //
})
