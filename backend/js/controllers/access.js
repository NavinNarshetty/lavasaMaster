myApp.controller('NoAccessCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, toastr, $uibModal, crudService) {
  //Used to name the .html file
  $scope.template = TemplateService.changecontent("access/noaccess");
  $scope.menutitle = NavigationService.makeactive("No Access");
  TemplateService.title = $scope.menutitle;
  $scope.navigation = NavigationService.getnav();
  // CODE START
  
  // CODE END
});
