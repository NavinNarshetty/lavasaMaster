myApp.controller('qfFinalCtrl', function ($scope, TemplateService, $state, NavigationService, $stateParams, toastr, $timeout, errorService, loginService, selectService, $rootScope) {
  $scope.template = TemplateService.getHTML("content/qf-final.html");
  TemplateService.title = "Qualifying Rounds"; //This is the Title of the Website
  $scope.navigation = NavigationService.getNavigation();





  // JSON FOR QF_FINAL
  $scope.Qffinal = [{
    name: "manav mehta",
    schoolname: "dirubhai ambani internationational school",
    bestattempt: "1.10m",
    result: "qualified"
  }, {
    name: "manav mehta",
    schoolname: "dirubhai ambani internationational school",
    bestattempt: "1.10m",
    result: "qualified"
  }, {
    name: "manav mehta",
    schoolname: "dirubhai ambani internationational school",
    bestattempt: "1.10m",
    result: "qualified"
  }, {
    name: "manav mehta",
    schoolname: "dirubhai ambani internationational school",
    bestattempt: "1.10m",
    result: "qualified"
  }, {
    name: "manav mehta",
    schoolname: "dirubhai ambani internationational school",
    bestattempt: "1.10m",
    result: "qualified"
  }, {
    name: "manav mehta",
    schoolname: "dirubhai ambani internationational school",
    bestattempt: "1.10m",
    result: "qualified"
  }, {
    name: "manav mehta",
    schoolname: "dirubhai ambani internationational school",
    bestattempt: "1.10m",
    result: "qualified"
  }, {
    name: "manav mehta",
    schoolname: "dirubhai ambani internationational school",
    bestattempt: "1.10m",
    result: "qualified"
  }, {
    name: "manav mehta",
    schoolname: "dirubhai ambani internationational school",
    bestattempt: "1.10m",
    result: "qualified"
  }, {
    name: "manav mehta",
    schoolname: "dirubhai ambani internationational school",
    bestattempt: "1.10m",
    result: "qualified"
  }, {
    name: "manav mehta",
    schoolname: "dirubhai ambani internationational school",
    bestattempt: "1.10m",
    result: "qualified"
  }]

  // END JSON FOR QF_FINAL

});