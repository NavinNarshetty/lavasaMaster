myApp.controller('qfFinalCtrl', function ($scope, TemplateService, $state, NavigationService, $stateParams, toastr, $timeout, errorService, $rootScope) {
  $scope.template = TemplateService.getHTML("content/qf-final.html");
  TemplateService.title = "Qualifying Rounds"; //This is the Title of the Website
  $scope.navigation = NavigationService.getNavigation();

  // JSON FOR QF_FINAL
  $scope.Qffinal = [{
    name: "manav mehta",
    schoolname: "dirubhai ambani internationational school",
    bestattempt: "1.10m",
    result: "qualified",
    position: 2
  }, {
    name: "manav mehta",
    schoolname: "dirubhai ambani internationational school",
    bestattempt: "1.10m",
    result: "qualified",
    position: 2
  }, {
    name: "manav mehta",
    schoolname: "dirubhai ambani internationational school",
    bestattempt: "1.10m",
    result: "qualified",
    position: 2
  }, {
    name: "manav mehta",
    schoolname: "dirubhai ambani internationational school",
    bestattempt: "1.10m",
    result: "qualified",
    position: 2
  }, {
    name: "manav mehta",
    schoolname: "dirubhai ambani internationational school",
    bestattempt: "1.10m",
    result: "qualified",
    position: 2
  }, {
    name: "manav mehta",
    schoolname: "dirubhai ambani internationational school",
    bestattempt: "1.10m",
    result: "qualified",
    position: 2
  }, {
    name: "manav mehta",
    schoolname: "dirubhai ambani internationational school",
    bestattempt: "1.10m",
    result: "qualified",
    position: 2
  }, {
    name: "manav mehta",
    schoolname: "dirubhai ambani internationational school",
    bestattempt: "1.10m",
    result: "qualified",
    position: 2
  }, {
    name: "manav mehta",
    schoolname: "dirubhai ambani internationational school",
    bestattempt: "1.10m",
    result: "qualified",
    position: 2
  }, {
    name: "manav mehta",
    schoolname: "dirubhai ambani internationational school",
    bestattempt: "1.10m",
    result: "qualified",
    position: 2
  }, {
    name: "manav mehta",
    schoolname: "dirubhai ambani internationational school",
    bestattempt: "1.10m",
    result: "qualified",
    position: 2
  }];
  $scope.timeTable = [{
    name: "manav mehta",
    schoolname: "dirubhai ambani internationational school",
    time: "10s:09ms",
    position: "1",
    bestattempt: 2
  }, {
    name: "manav mehta",
    schoolname: "dirubhai ambani internationational school",
    time: "10s:09ms",
    position: "2",
    bestattempt: 2
  }, {
    name: "manav mehta",
    schoolname: "dirubhai ambani internationational school",
    time: "10s:09ms",
    position: "3",
    bestattempt: 2
  }, {
    name: "manav mehta",
    schoolname: "dirubhai ambani internationational school",
    time: "10s:09ms",
    position: "4",
    bestattempt: 2
  }, {
    name: "manav mehta",
    schoolname: "dirubhai ambani internationational school",
    time: "10s:09ms",
    position: "5",
    bestattempt: 2
  }, {
    name: "manav mehta",
    schoolname: "dirubhai ambani internationational school",
    time: "10s:09ms",
    position: "6",
    bestattempt: 2
  }, {
    name: "manav mehta",
    schoolname: "dirubhai ambani internationational school",
    time: "10s:09ms",
    position: "7",
    bestattempt: 2
  }, {
    name: "manav mehta",
    schoolname: "dirubhai ambani internationational school",
    time: "10s:09ms",
    position: "8",
    bestattempt: 2
  }];

  // END JSON FOR QF_FINAL



  $scope.constraints = {};
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
                key.limitValue = 8;
                key.showMore = true;
                _.each(key.match, function (value) {
                  if (value.opponentsSingle.length > 0) {
                    _.each(value.opponentsSingle, function (obj, index1) {

                      if (!_.isEmpty(obj.athleteId)) {
                        obj.athleteId.fullName = obj.athleteId.firstName + '  ' + obj.athleteId.surname;
                      }


                      if (value.resultQualifyingRound !== undefined) {
                        obj.result = value.resultQualifyingRound.player.result;
                        obj.noOfJumps = value.resultQualifyingRound.player.attempt.length;
                        obj.score = value.resultQualifyingRound.player.attempt[index1];
                        if (value.resultQualifyingRound.player.attempt.length > 0) {
                          obj.bestAttempt = value.resultQualifyingRound.player.bestAttempt;
                          obj.noShow = NavigationService.Boolean(value.resultQualifyingRound.player.noShow);
                          // obj.bestattempt = Math.max.apply(Math, value.resultQualifyingRound.player.attempt);
                          console.log(obj.noShow);

                        }

                      }
                      console.log("value", value.resultShooting);
                      if (value.resultShooting != undefined) {
                        obj.laneNo = value.resultShooting.laneNo;
                        obj.detail = value.resultShooting.detail;
                        obj.finalScore = value.resultShooting.finalScore;
                        obj.noShow = value.resultShooting.noShow;
                        obj.result = value.resultShooting.result;

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
  //for showing More Data
  $scope.showMoreData = function (bool, index) {
    if (bool) {
      $scope.roundsList[index].limitValue = 5000;
      $scope.roundsList[index].showMore = false;
    } else {
      $scope.roundsList[index].limitValue = 8;
      $scope.roundsList[index].showMore = true;
    }
  };

  // START SCORING FUNCTION
  $scope.startScoring = function (data) {
    console.log(data, 'startScoring');
      $state.go("scorequalifying", {
        sportName: $stateParams.name,
        sport: $stateParams.id,
        drawFormat: $stateParams.drawFormat,
        roundName: data.name,
        sportId: data.match[0].sport._id
      });
  }
  // START SCORING FUNCTION END

});
