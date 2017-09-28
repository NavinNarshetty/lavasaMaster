myApp.controller('SponserPartnerCtrl', function ($scope, TemplateService, $state, NavigationService, $stateParams, toastr, $rootScope, $uibModal, $timeout) {
  $scope.template = TemplateService.getHTML("content/sponsor-partner.html");
  TemplateService.title = "Direct Final"; //This is the Title of the Website
  $scope.navigation = NavigationService.getNavigation();

  $scope.data = [1, 2, 3, 4, 5, 6];
});