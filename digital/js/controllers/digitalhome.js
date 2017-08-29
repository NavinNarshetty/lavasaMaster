myApp.controller('DigitalHomeCtrl', function ($scope, TemplateService, NavigationService, $timeout) {
  $scope.template = TemplateService.getHTML("content/digital-home.html");
  TemplateService.title = "Home"; //This is the Title of the Website
  $scope.navigation = NavigationService.getNavigation();

})