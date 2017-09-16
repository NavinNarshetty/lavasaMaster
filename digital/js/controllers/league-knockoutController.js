myApp.controller('LeagueKnockoutCtrl', function ($scope, TemplateService, $state, NavigationService, $stateParams, toastr, $timeout, errorService, $rootScope) {
  $scope.template = TemplateService.getHTML("content/league-knockout.html");
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
    },]
  }];

  $scope.constraints = {};
  $scope.knockoutArr = [];
  $scope.getSportSpecificRounds = function (roundName) {
    if ($stateParams.id) {
      if (roundName) {
        $scope.constraints.round = roundName;
      }
      $scope.constraints.sport = $stateParams.id;
      NavigationService.getSportLeagueKnockoutRounds($scope.constraints, function (data) {
        errorService.errorCode(data, function (allData) {
          if (!allData.message) {
            if (allData.value) {
              console.log("alldata", allData.data);
              $scope.knockout = allData.data.knockout.roundsList;
              _.each($scope.knockout, function (n) {
                $scope.knockoutArr.push(n.match);

              });
              $scope.knockout = _.flattenDeep($scope.knockoutArr);
              if (allData.data.qualifying) {
                $scope.matches = allData.data.qualifying.roundsList;
              }

              console.log($scope.knockout, "$scope.knockout");
              console.log($scope.matches, "$scope.matches ");
            }
          } else {
            toastr.error(allData.message, 'Error Message');
          }
        });
      });
    }
  };
  $scope.getSportSpecificRounds();
  $scope.knockoutLimit = 8;
  $scope.limitValue = 8;
  $scope.showMoreData = function (bool, type) {
    if (type === 'knockout') {
      if (bool) {
        $scope.showKnockout = true;
        $scope.knockoutLimit = 5000;

      } else {
        $scope.showKnockout = false;
        $scope.knockoutLimit = 8;
      }

    } else {
      if (bool) {
        $scope.showMatch = true;
        $scope.limitValue = 5000;
      } else {
        $scope.showMatch = false;
        $scope.limitValue = 8;
      }
    }

  };

  // START SCORING
  $scope.startScoring = function (card) {
    console.log(card, 'startScoring');
    if (_.isEmpty(card.opponentsTeam[0]) && _.isEmpty(card.opponentsTeam[1])) {
      toastr.error('No players found for match.', 'No match');
    } else {
      // if (card && card[$scope.resultVar.resultVar] && card[$scope.resultVar.resultVar].status == 'IsCompleted') {
      //   toastr.warning("This match has already been scored.", 'Scoring Completed');
      // } else {
        $state.go("matchteam", {
          drawFormat: $stateParams.drawFormat,
          sport: $stateParams.id,
          id: card.matchId
        });
      // }
    }
  }
  // START SCORING END
});
