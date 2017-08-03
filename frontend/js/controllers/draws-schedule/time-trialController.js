myApp.controller('TimeTrialCtrl', function ($scope, TemplateService, $state, NavigationService, $stateParams, toastr, $timeout, errorService, loginService, selectService, $rootScope) {
  $scope.template = TemplateService.getHTML("content/time-trial.html");
  TemplateService.title = "Time Trial"; //This is the Title of the Website
  $scope.navigation = NavigationService.getNavigation();

});