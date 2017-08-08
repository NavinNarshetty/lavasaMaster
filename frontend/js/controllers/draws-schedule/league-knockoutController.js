myApp.controller('LeagueKnockoutCtrl', function ($scope, TemplateService, $state, NavigationService, $stateParams, toastr, $timeout, errorService, loginService, selectService, $rootScope) {
  $scope.template = TemplateService.getHTML("content/draws-schedule/league-knockout.html");
  TemplateService.title = "League Knockout"; //This is the Title of the Website
  $scope.navigation = NavigationService.getNavigation();

  $scope.oneAtATime = true;
  $scope.status = {
    isCustomHeaderOpen: false,
    isFirstOpen: true,
    isFirstDisabled: false
  };

  $scope.knockTabe = [{
    name: "manav mehta",
    team1: "dirubhai ambani internationational school",
    team2: "dirubhai ambani internationational school",
    score: "1-5",
    round: "final"
  }, {
    name: "manav mehta",
    team1: "dirubhai ambani internationational school",
    team2: "dirubhai ambani internationational school",
    score: "1-5",
    round: "semi-final"
  }, {
    name: "manav mehta",
    team1: "dirubhai ambani internationational school",
    team2: "dirubhai ambani internationational school",
    score: "1-5",
    round: "semi-final"
  }];


  $scope.pointTable = [{
    round: "Pool A",
    detail: [{
      name: "manav mehta",
      team1: "dirubhai ambani internationational school",
      team2: "dirubhai ambani internationational school",
      score: "1-5",
      match: "3",
      won: "2",
      lost: "1",
      draw: "1",
      points: "6"
    }, {
      name: "manav mehta",
      team1: "dirubhai ambani internationational school",
      team2: "dirubhai ambani internationational school",
      score: "1-5",
      match: "3",
      won: "2",
      lost: "1",
      draw: "1",
      points: "6"
    }, {
      name: "manav mehta",
      team1: "dirubhai ambani internationational school",
      team2: "dirubhai ambani internationational school",
      score: "1-5",
      match: "3",
      won: "2",
      lost: "1",
      draw: "1",
      points: "6"
    }]
  }, {
    round: "Pool B",
    detail: [{
      name: "manav mehta",
      team1: "dirubhai ambani internationational school",
      team2: "dirubhai ambani internationational school",
      score: "1-5",
      match: "3",
      won: "2",
      lost: "1",
      draw: "1",
      points: "6"
    }, {
      name: "manav mehta",
      team1: "dirubhai ambani internationational school",
      team2: "dirubhai ambani internationational school",
      score: "1-5",
      match: "3",
      won: "2",
      lost: "1",
      draw: "1",
      points: "6"
    }, {
      name: "manav mehta",
      team1: "dirubhai ambani internationational school",
      team2: "dirubhai ambani internationational school",
      score: "1-5",
      match: "3",
      won: "2",
      lost: "1",
      draw: "1",
      points: "6"
    }]
  }, {
    round: "Pool C",
    detail: [{
      name: "manav mehta",
      team1: "dirubhai ambani internationational school",
      team2: "dirubhai ambani internationational school",
      score: "1-5",
      match: "3",
      won: "2",
      lost: "1",
      draw: "1",
      points: "6"
    }, {
      name: "manav mehta",
      team1: "dirubhai ambani internationational school",
      team2: "dirubhai ambani internationational school",
      score: "1-5",
      match: "3",
      won: "2",
      lost: "1",
      draw: "1",
      points: "6"
    }, {
      name: "manav mehta",
      team1: "dirubhai ambani internationational school",
      team2: "dirubhai ambani internationational school",
      score: "1-5",
      match: "3",
      won: "2",
      lost: "1",
      draw: "1",
      points: "6"
    }]
  }, {
    round: "Pool d",
    detail: [{
      name: "manav mehta",
      team1: "dirubhai ambani internationational school",
      team2: "dirubhai ambani internationational school",
      score: "1-5",
      match: "3",
      won: "2",
      lost: "1",
      draw: "1",
      points: "6"
    }, {
      name: "manav mehta",
      team1: "dirubhai ambani internationational school",
      team2: "dirubhai ambani internationational school",
      score: "1-5",
      match: "3",
      won: "2",
      lost: "1",
      draw: "1",
      points: "6"
    }, {
      name: "manav mehta",
      team1: "dirubhai ambani internationational school",
      team2: "dirubhai ambani internationational school",
      score: "1-5",
      match: "3",
      won: "2",
      lost: "1",
      draw: "1",
      points: "6"
    }]
  }, {
    round: "Pool E",
    detail: [{
      name: "manav mehta",
      team1: "dirubhai ambani internationational school",
      team2: "dirubhai ambani internationational school",
      score: "1-5",
      match: "3",
      won: "2",
      lost: "1",
      draw: "1",
      points: "6"
    }, {
      name: "manav mehta",
      team1: "dirubhai ambani internationational school",
      team2: "dirubhai ambani internationational school",
      score: "1-5",
      match: "3",
      won: "2",
      lost: "1",
      draw: "1",
      points: "6"
    }, {
      name: "manav mehta",
      team1: "dirubhai ambani internationational school",
      team2: "dirubhai ambani internationational school",
      score: "1-5",
      match: "3",
      won: "2",
      lost: "1",
      draw: "1",
      points: "6"
    }, ]
  }];


});