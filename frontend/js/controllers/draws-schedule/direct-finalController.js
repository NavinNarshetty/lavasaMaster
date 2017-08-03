myApp.controller('DirectFinalCtrl', function ($scope, TemplateService, $state, NavigationService, $stateParams, toastr, $timeout, errorService, loginService, selectService, $rootScope) {
  $scope.template = TemplateService.getHTML("content/direct-final.html");
  TemplateService.title = "Direct Final"; //This is the Title of the Website
  $scope.navigation = NavigationService.getNavigation();

});