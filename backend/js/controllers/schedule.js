//DETAIL SCHEDULE
myApp.controller('DetailScheduleCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, toastr) {
  //Used to name the .html file
  $scope.template = TemplateService.changecontent("detailchampionschedule");
  $scope.menutitle = NavigationService.makeactive("Detail Champion Schedule");
  TemplateService.title = $scope.menutitle;
  $scope.navigation = NavigationService.getnav();
  $scope.formData = {};
  $scope.formData.pdf = [];

  $scope.addRow = function (formData) {
    if (!formData) {
      console.log(formData, "in add row");
      $scope.formData.pdf.push({
        "pdfType": '',
        "textHeader": '',
        "dpdf": ''
      })
    } else {
      $scope.formData.pdf.push({
        "pdfType": '',
        "textHeader": '',
        "dpdf": ''
      })
    }

  }
  $scope.addRow();
});
//DETAIL SCHEDULE END