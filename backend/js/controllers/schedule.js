//DETAIL SCHEDULE
myApp.controller('DetailScheduleCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, toastr) {
  //Used to name the .html file
  $scope.template = TemplateService.changecontent("detailchampionschedule");
  $scope.menutitle = NavigationService.makeactive("Detail Champion Schedule");
  TemplateService.title = $scope.menutitle;
  $scope.navigation = NavigationService.getnav();
  $scope.formData = {};
  $scope.formData.pdfDetail = [];
  $scope.formData.page = 1;
  $scope.formData.type = '';
  $scope.formData.keyword = '';

  $scope.getAllSportList = function (data) {
    $scope.url = "SportsListSubCategory/search";
    console.log(data);
    $scope.constraints = {};
    $scope.constraints.keyword = data;
    NavigationService.apiCall($scope.url, $scope.constraints, function (data) {
      console.log("data.value sportlist", data);
      $scope.sportitems = data.data.results;

    });
  }
  $scope.searchSportList = function (data) {
    $scope.draws = data;
  }


  $scope.addRow = function (formData) {
    if (!formData) {
      console.log(formData, "in add row");
      $scope.formData.pdfDetail.push({
        "pdfType": '',
        "textHeader": '',
        "dpdf": ''
      })
    } else {
      $scope.formData.pdfDetail.push({
        "pdfType": '',
        "textHeader": '',
        "dpdf": ''
      })
    }

  }
  $scope.addRow();

  $scope.deleteRow = function (formData, index) {
    formData.pdfDetail.splice(index, 1);
  }
});
//DETAIL SCHEDULE END