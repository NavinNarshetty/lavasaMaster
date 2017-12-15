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
  });

  // VARIABLE INITITALISE
  $scope.school = {
    name: "Silver Oaks International School"
  }
  $scope.schoolData = {};
  // VARIABLE INITITALISE END

  // FUNCTIONS

  // FUNCTIONS END

  // API CALLS
  NavigationService.getOneReportCard($scope.school, function(data) {
    if (data.value == true) {
      $scope.schoolData = data.data;
      console.log("$scope.schoolData", $scope.schoolData);
    } else {
      console.log("Error in call");
      console.log("Error", data);
    }
  })
  // API CALLS END
  // JSONS
  $scope.lists = [0,1,2,3,4,5,6,7,8,9];
  // JSONS END

  //
})
