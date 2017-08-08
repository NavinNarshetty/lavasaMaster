myApp.controller('TimeTrialCtrl', function ($scope, TemplateService, $state, NavigationService, $stateParams, toastr, $timeout, errorService, loginService, selectService, $rootScope, $uibModal) {
  $scope.template = TemplateService.getHTML("content/draws-schedule/time-trial.html");
  TemplateService.title = "Time Trial"; //This is the Title of the Website
  $scope.navigation = NavigationService.getNavigation();

  // ACCORDIAN
  $scope.oneAtATime = true;
  $scope.status = {
    isCustomHeaderOpen: false,
    isFirstOpen: true,
    isFirstDisabled: false
  };
  // END ACCORDIAN


  $scope.teamAccor = [1, 2, 3, 4, 5, 6, 7, 8];


  $scope.timeTable = [{
    name: "manav mehta",
    schoolname: "dirubhai ambani internationational school",
    time: "10s:09ms",
    position: "1"
  }, {
    name: "manav mehta",
    schoolname: "dirubhai ambani internationational school",
    time: "10s:09ms",
    position: "2"
  }, {
    name: "manav mehta",
    schoolname: "dirubhai ambani internationational school",
    time: "10s:09ms",
    position: "3"
  }, {
    name: "manav mehta",
    schoolname: "dirubhai ambani internationational school",
    time: "10s:09ms",
    position: "4"
  }, {
    name: "manav mehta",
    schoolname: "dirubhai ambani internationational school",
    time: "10s:09ms",
    position: "5"
  }, {
    name: "manav mehta",
    schoolname: "dirubhai ambani internationational school",
    time: "10s:09ms",
    position: "6"
  }, {
    name: "manav mehta",
    schoolname: "dirubhai ambani internationational school",
    time: "10s:09ms",
    position: "7"
  }, {
    name: "manav mehta",
    schoolname: "dirubhai ambani internationational school",
    time: "10s:09ms",
    position: "8"
  }]

});