myApp.controller('RegisterFormPlayerCtrl', function ($scope, TemplateService, NavigationService, $timeout, $uibModal, $filter, configService) {
  $scope.template = TemplateService.getHTML("content/registration/registerform-player.html");
  TemplateService.title = "Player Registration Form"; //This is the Title of the Website
  $scope.navigation = NavigationService.getNavigation();
});
