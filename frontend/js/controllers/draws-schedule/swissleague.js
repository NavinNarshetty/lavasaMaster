myApp.controller('swissLeagueCtrl', function ($scope, TemplateService, $state, NavigationService, $stateParams, toastr, $timeout, errorService, loginService, selectService, $rootScope) {
  $scope.template = TemplateService.getHTML("content/draws-schedule/swiss-league.html");
  TemplateService.title = "Qualifying Rounds"; //This is the Title of the Website
  $scope.navigation = NavigationService.getNavigation();

  $scope.swissTable = [{
    name: "manav mehta",
    schoolname: "dirubhai ambani internationational school",
    points: "9"
  }, {
    name: "manav mehta",
    schoolname: "dirubhai ambani internationational school",
    points: "9"
  }, {
    name: "manav mehta",
    schoolname: "dirubhai ambani internationational school",
    points: "9"
  }];

  $scope.swissroundTable = [{
    name: "round1",
    player1: {
      name: "manav mehta",
      schoolname: "dirubhai ambani internationational school",
      points: 9,
      standing: 1
    },
    player2: {
      name: "manav mehta",
      schoolname: "dirubhai ambani internationational school",
      points: 9,
      standing: 2
    }
  }, {
    name: "round1",
    player1: {
      name: "manav mehta",
      schoolname: "dirubhai ambani internationational school",
      points: 9,
      standing: 3
    },
    player2: {
      name: "manav mehta",
      schoolname: "dirubhai ambani internationational school",
      points: 9,
      standing: 4
    }
  }, {
    name: "round1",
    player1: {
      name: "manav mehta",
      schoolname: "dirubhai ambani internationational school",
      points: 9,
      standing: 5
    },
    player2: {
      name: "manav mehta",
      schoolname: "dirubhai ambani internationational school",
      points: 9,
      standing: 6
    }
  }]


});