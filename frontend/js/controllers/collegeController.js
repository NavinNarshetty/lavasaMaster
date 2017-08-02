myApp.controller('CollegeFaqCtrl', function ($scope, TemplateService, $state, NavigationService, $stateParams, toastr, $timeout, errorService, loginService, selectService, $rootScope) {
  $scope.template = TemplateService.getHTML("content/college-faq.html");
  TemplateService.title = "College FAQ"; //This is the Title of the Website
  $scope.navigation = NavigationService.getNavigation();
  $scope.oneAtATime = true;
  $scope.status = {
    isCustomHeaderOpen: false,
    isFirstOpen: true,
    isFirstDisabled: false
  };
});