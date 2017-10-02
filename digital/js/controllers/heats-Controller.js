myApp.controller('HeatsCtrl', function ($scope, TemplateService, $state, NavigationService, $stateParams, toastr, $timeout, errorService, $rootScope) {
  $scope.template = TemplateService.getHTML("content/heats.html");
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
  }
    // {
    //   round: "Qualifying",
    //   tablecontent: [{
    //     name: "manav mehta",
    //     schoolname: "dirubhai ambani internationational school",
    //     time: "10s:09ms",
    //     result: "did not qualify"
    //   }, {
    //     name: "manav mehta",
    //     schoolname: "dirubhai ambani internationational school",
    //     time: "10s:09ms",
    //     result: "did not qualify"
    //   }, {
    //     name: "manav mehta",
    //     schoolname: "dirubhai ambani internationational school",
    //     time: "10s:09ms",
    //     result: "did not qualify"
    //   }, {
    //     name: "manav mehta",
    //     schoolname: "dirubhai ambani internationational school",
    //     time: "10s:09ms",
    //     result: "did not qualify"
    //   }, {
    //     name: "manav mehta",
    //     schoolname: "dirubhai ambani internationational school",
    //     time: "10s:09ms",
    //     result: "did not qualify"
    //   }, {
    //     name: "manav mehta",
    //     schoolname: "dirubhai ambani internationational school",
    //     time: "10s:09ms",
    //     result: "did not qualify"
    //   }]
    // },
  ];



  var tempObjINdex;
  $scope.constraints = {};
  $scope.eventName = $stateParams.sportName;
  console.log("eventName", $scope.eventName);
  $scope.getSportSpecificRounds = function (roundName) {
    if ($stateParams.id) {
      if (roundName) {
        $scope.constraints.round = roundName;
      }
      $scope.constraints.sport = $stateParams.id;
      NavigationService.getSportSpecificQualifyingRound($scope.constraints, function (data) {
        errorService.errorCode(data, function (allData) {
          if (!allData.message) {
            if (allData.value) {
              $scope.roundsListName = allData.data.roundsListName;
              $scope.roundsList = allData.data.roundsList;
              if ($scope.roundsListName.length === 0 || $scope.roundsList.length === 0) {
                toastr.error("No Data Found", 'Error Message');
                $state.go('championshipschedule');
              }
              $scope.roundsList = $scope.roundsList.reverse();
              _.each($scope.roundsList, function (key) {
                _.each(key.match, function (value) {
                  if (value.sport.sportslist.sportsListSubCategory.isTeam) {
                    value.opponentsSingle = [];
                  } else {
                    value.opponentsTeam = [];
                  }
                  if (value.opponentsSingle.length > 0) {
                    if (value.opponentsSingle.length < value.resultHeat.players.length) {
                      _.each(value.resultHeat.players, function (player) {
                        if (player.id === undefined) {
                          var tempObjIndex = _.findIndex(value.resultHeat.players, player);
                          value.opponentsSingle.splice(tempObjIndex, 0, {});
                        }
                      });
                    }
                    _.each(value.opponentsSingle, function (obj, index1) {
                      if (!_.isEmpty(obj.athleteId)) {
                        obj.athleteId.fullName = obj.athleteId.firstName + '  ' + obj.athleteId.surname;
                      }
                      if (value.resultHeat.players !== undefined && value.resultHeat.players[index1] && value.resultHeat.players[index1] !== undefined && value.resultHeat.players[index1] !== null && value.resultHeat.players.length === value.opponentsSingle.length) {
                        obj.result = value.resultHeat.players[index1].result;
                        obj.laneNo = value.resultHeat.players[index1].laneNo;
                        obj.time = value.resultHeat.players[index1].time;
                      }
                    });
                  }
                  if (value.opponentsTeam.length > 0) {
                    if (value.opponentsTeam.length < value.resultHeat.teams.length) {
                      _.each(value.resultHeat.teams, function (team) {
                        if (team.id === undefined) {
                          var tempObjIndex = _.findIndex(value.resultHeat.teams, team);
                          value.opponentsTeam.splice(tempObjIndex, 0, {});
                        }
                      });
                    }
                    _.each(value.opponentsTeam, function (obj, index1) {
                      if (!_.isEmpty(obj.teamId)) {
                        obj.schoolNameWithTeamId = obj.teamId + ' - ' + obj.schoolName;
                      }
                      if (value.resultHeat.teams !== undefined && value.resultHeat.teams[index1] && value.resultHeat.teams[index1] !== undefined && value.resultHeat.teams[index1] !== null && value.resultHeat.teams.length === value.opponentsTeam.length) {
                        obj.result = value.resultHeat.teams[index1].result;
                        obj.laneNo = value.resultHeat.teams[index1].laneNo;
                        obj.time = value.resultHeat.teams[index1].time;
                      }
                    });
                  }
                });
              });
              console.log($scope.roundsListName, " $scope.roundsListName ");
              console.log($scope.roundsList, " $scope.roundsList ");
            }
          } else {
            toastr.error(allData.message, 'Error Message');
          }
        });
      });
    }
  };
  $scope.getSportSpecificRounds();
  // for showing More Or Less data
  $scope.limitValue = 8;
  $scope.finalLimit = 8;
  $scope.heatLImit = 8;
  $scope.showMore = true;
  $scope.showHeat = true;
  $scope.showFinal = true;
  $scope.showMoreData = function (bool, roundName) {
    if (roundName === 'heat') {
      if (bool === true) {
        $scope.heatLImit = 2000;
        $scope.showHeat = false;
      } else {
        $scope.heatLImit = 8;
        $scope.showHeat = true;
      }
    } else if (roundName === 'semi-final') {
      if (bool === true) {
        $scope.limitValue = 2000;
        $scope.showMore = false;
      } else {
        $scope.limitValue = 8;
        $scope.showMore = true;
      }
    } else if (roundName === 'final') {
      if (bool === true) {
        $scope.finalLimit = 5000;
        $scope.showFinal = false;
      } else {
        $scope.finalLimit = 8;
        $scope.showFinal = true;
      }

    }
  };

  // START SCORING FUNCTION
  $scope.startScoring = function (match) {
    console.log(match, 'startScoring');
    if (match.status == 'IsCompleted') {
      toastr.warning("This match has already been scored.", 'Scoring Completed');
    } else {
      $state.go("scoringimages", {
        sportName: $stateParams.sportName,
        id: $stateParams.id,
        id: match.matchId
      });
    }
  }
  // START SCORING FUNCTION END


});