myApp.controller('QfKnockoutCtrl', function ($scope, TemplateService, $state, NavigationService, $stateParams, toastr, $timeout, errorService, loginService, selectService, $rootScope) {
  $scope.template = TemplateService.getHTML("content/qf-knockout.html");
  TemplateService.title = "QuaterFinal Knockout"; //This is the Title of the Website
  $scope.navigation = NavigationService.getNavigation();

});