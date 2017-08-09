myApp.controller('KnockoutCtrl', function ($scope, TemplateService, $state, NavigationService, $stateParams, toastr, $timeout, errorService, loginService, selectService, $rootScope, $uibModal) {
  $scope.template = TemplateService.getHTML("content/draws-schedule/knockout.html");
  TemplateService.title = "Time Trial"; //This is the Title of the Website
  $scope.navigation = NavigationService.getNavigation();
})