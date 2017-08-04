myApp.controller('HeatsCtrl', function ($scope, TemplateService, $state, NavigationService, $stateParams, toastr, $timeout, errorService, loginService, selectService, $rootScope) {
  $scope.template = TemplateService.getHTML("content/heats.html");
  TemplateService.title = "Heats"; //This is the Title of the Website
  $scope.navigation = NavigationService.getNavigation();

});