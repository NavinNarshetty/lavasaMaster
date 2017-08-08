myApp.controller('HeatsCtrl', function ($scope, TemplateService, $state, NavigationService, $stateParams, toastr, $timeout, errorService, loginService, selectService, $rootScope) {
  $scope.template = TemplateService.getHTML("content/draws-schedule/heats.html");
  TemplateService.title = "Heats"; //This is the Title of the Website
  $scope.navigation = NavigationService.getNavigation();

  // ACCORDIAN

  $scope.oneAtATime = true;
  $scope.status = {
    isCustomHeaderOpen: false,
    isFirstOpen: true,
    isFirstDisabled: false
  };
  // END ACCORDIAN


  $scope.heatsTable = [{
    name: "manav mehta",
    schoolname: "dirubhai ambani internationational school",
    time: "10s:09ms",
    result: "qualified"
  }, {
    name: "manav mehta",
    schoolname: "dirubhai ambani internationational school",
    time: "10s:09ms",
    result: "qualified"
  }, {
    name: "manav mehta",
    schoolname: "dirubhai ambani internationational school",
    time: "10s:09ms",
    result: "qualified"
  }, {
    name: "manav mehta",
    schoolname: "dirubhai ambani internationational school",
    time: "10s:09ms",
    result: "did not qualify"
  }, {
    name: "manav mehta",
    schoolname: "dirubhai ambani internationational school",
    time: "10s:09ms",
    result: "did not qualify"
  }, {
    name: "manav mehta",
    schoolname: "dirubhai ambani internationational school",
    time: "10s:09ms",
    result: "qualified"
  }, {
    name: "manav mehta",
    schoolname: "dirubhai ambani internationational school",
    time: "10s:09ms",
    result: "did not qualify"
  }, {
    name: "manav mehta",
    schoolname: "dirubhai ambani internationational school",
    time: "10s:09ms",
    result: "qualified"
  }]

  $scope.semiTable = [{
    round: "Semifinal",
    tablecontent: [{
      name: "manav mehta",
      schoolname: "dirubhai ambani internationational school",
      time: "10s:09ms",
      result: "did not qualify"
    }, {
      name: "manav mehta",
      schoolname: "dirubhai ambani internationational school",
      time: "10s:09ms",
      result: "did not qualify"
    }, {
      name: "manav mehta",
      schoolname: "dirubhai ambani internationational school",
      time: "10s:09ms",
      result: "did not qualify"
    }]
  }, {
    round: "Qualifying",
    tablecontent: [{
      name: "manav mehta",
      schoolname: "dirubhai ambani internationational school",
      time: "10s:09ms",
      result: "did not qualify"
    }, {
      name: "manav mehta",
      schoolname: "dirubhai ambani internationational school",
      time: "10s:09ms",
      result: "did not qualify"
    }, {
      name: "manav mehta",
      schoolname: "dirubhai ambani internationational school",
      time: "10s:09ms",
      result: "did not qualify"
    }, {
      name: "manav mehta",
      schoolname: "dirubhai ambani internationational school",
      time: "10s:09ms",
      result: "did not qualify"
    }, {
      name: "manav mehta",
      schoolname: "dirubhai ambani internationational school",
      time: "10s:09ms",
      result: "did not qualify"
    }, {
      name: "manav mehta",
      schoolname: "dirubhai ambani internationational school",
      time: "10s:09ms",
      result: "did not qualify"
    }]
  }, ];

});