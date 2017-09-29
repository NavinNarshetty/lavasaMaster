// TABLE CALENDER
myApp.controller('TableCalenderCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, toastr) {
  //Used to name the .html file
  $scope.template = TemplateService.changecontent("table-calender");
  $scope.menutitle = NavigationService.makeactive("Calender");
  TemplateService.title = $scope.menutitle;
  $scope.navigation = NavigationService.getnav();
});

// TABLE CALENDER END


// DETAIL CALENDER
myApp.controller('DetailCalenderCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, toastr) {
  //Used to name the .html file
  $scope.template = TemplateService.changecontent("detail-calender");
  $scope.menutitle = NavigationService.makeactive("Detail Calender");
  TemplateService.title = $scope.menutitle;
  $scope.navigation = NavigationService.getnav();
});

// DETAIL CALENDER END