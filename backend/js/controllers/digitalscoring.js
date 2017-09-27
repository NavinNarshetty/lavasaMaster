// DETAIL MATCHES
myApp.controller('DetailMatchesCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, toastr) {
  //Used to name the .html file
  $scope.template = TemplateService.changecontent("detailmatch");
  $scope.menutitle = NavigationService.makeactive("Detail Match");
  TemplateService.title = $scope.menutitle;
  $scope.navigation = NavigationService.getnav();
});

// DETAIL MATCHES END

// TABLE PDF
myApp.controller('TablePdfCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, toastr) {
  //Used to name the .html file
  $scope.template = TemplateService.changecontent("tablepdf");
  $scope.menutitle = NavigationService.makeactive("Table Pdf");
  TemplateService.title = $scope.menutitle;
  $scope.navigation = NavigationService.getnav();
});

// TABLE PDF END

myApp.controller('DetailPdfCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, toastr) {
  //Used to name the .html file
  $scope.template = TemplateService.changecontent("detailpdf");
  $scope.menutitle = NavigationService.makeactive("Detail Pdf");
  TemplateService.title = $scope.menutitle;
  $scope.navigation = NavigationService.getnav();
});