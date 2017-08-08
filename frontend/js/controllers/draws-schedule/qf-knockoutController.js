myApp.controller('QfKnockoutCtrl', function ($scope, TemplateService, $state, NavigationService, $stateParams, toastr, $timeout, errorService, loginService, selectService, $rootScope) {
  $scope.template = TemplateService.getHTML("content/draws-schedule/qf-knockout.html");
  TemplateService.title = "QuaterFinal Knockout"; //This is the Title of the Website
  $scope.navigation = NavigationService.getNavigation();



  // TABLE JSON
  $scope.knockoutTable = [{
    name: "manav mehta",
    schoolname: "dirubhai ambani internationational school",
    bestattempt: "1.10m",
    result: "qualified",
    round: "final",
    score: "1-5",
    qscore: "11"
  }, {
    name: "manav mehta",
    schoolname: "dirubhai ambani internationational school",
    bestattempt: "1.10m",
    result: "did not qualify",
    round: "semi-final",
    score: "1-5",
    qscore: "11"
  }, {
    name: "manav mehta",
    schoolname: "dirubhai ambani internationational school",
    bestattempt: "1.10m",
    result: "qualified",
    round: "semi-final",
    score: "1-5",
    qscore: "11"
  }, {
    name: "manav mehta",
    schoolname: "dirubhai ambani internationational school",
    bestattempt: "1.10m",
    result: "qualified",
    round: "final",
    score: "1-5",
    qscore: "11"
  }, {
    name: "manav mehta",
    schoolname: "dirubhai ambani internationational school",
    bestattempt: "1.10m",
    result: "qualified",
    round: "final",
    score: "1-5",
    qscore: "11"
  }, {
    name: "manav mehta",
    schoolname: "dirubhai ambani internationational school",
    bestattempt: "1.10m",
    result: "did not qualify",
    round: "final",
    score: "1-5",
    qscore: "11"
  }, ]

  // END TABLE JSON

});