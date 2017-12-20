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
  // $scope.school = {
  //   name: $stateParams.school
  // }
  $scope.school = {
    name: "Silver Oaks International School"
  }
  $scope.schoolData = {};
  // VARIABLE INITITALISE END

  // FUNCTIONS

  // FUNCTIONS END

  // API CALLS
  if($scope.school.name != ""){
    NavigationService.getOneReportCard($scope.school, function(data) {
      if (data.value == true) {
        $scope.schoolData = data.data;
        _.each($scope.schoolData.contingent.sport, function(n){
          if(n.maleCount == n.femaleCount){
            n.malePercent = 50;
            n.femalePercent = 50;
          } else {
            var total = n.maleCount + n.femaleCount;
            var ratio = n.maleCount / total;
            console.log('ratio',n.sportName, ratio);
            var percent = ratio * 100;
            var percent = _.round(percent);
            console.log("percen", n.sportName, percent);
            if(percent < 20){
              n.malePercent = 20;
            } else if(percent > 80){
              n.malePercent = 80;
            } else {
              n.malePercent = percent;
            }
            n.femalePercent = 100 - n.malePercent;
          }
        });
        console.log("$scope.schoolData", $scope.schoolData);
      } else {
        toastr.error("Data not found.", "Error");
        console.log("Error", data);
      }
    });
  } else {
    toastr.error("Cannot Find School.","Error");
  }

  // API CALLS END
  // JSONS
  $scope.lists = [0,1,2,3,4,5,6,7,8,9];
  // JSONS END

  //
})
