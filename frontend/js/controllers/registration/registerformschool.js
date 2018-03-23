myApp.controller('RegisterFormSchoolCtrl', function ($scope, TemplateService, NavigationService, $timeout, $uibModal, $filter, configService) {
  $scope.template = TemplateService.getHTML("content/registration/registerform-school.html");
  TemplateService.title = "School Registration Form"; //This is the Title of the Website
  $scope.navigation = NavigationService.getNavigation();
});