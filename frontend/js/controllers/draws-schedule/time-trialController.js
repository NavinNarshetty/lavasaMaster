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
  }];


  $scope.constraints = {};
  $scope.eventName = $stateParams.name;
  console.log(" $scope.eventName", $scope.eventName);
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
                key.showHeat = true;
                _.each(key.match, function (value) {
                  if (value.opponentsSingle.length > 0) {
                    _.each(value.opponentsSingle, function (obj, index1) {
                      obj.athleteId.fullName = obj.athleteId.firstName + '  ' + obj.athleteId.surname;
                      obj.result = value.resultHeat.players[index1].result;
                      obj.laneNo = value.resultHeat.players[index1].laneNo;
                      obj.time = value.resultHeat.players[index1].time;
                    });
                  }
                  if (value.opponentsTeam.length > 0) {
                    _.each(value.opponentsTeam, function (obj, index1) {
                      obj.result = value.resultHeat.players[index1].result;
                      obj.laneNo = value.resultHeat.players[index1].laneNo;
                      obj.time = value.resultHeat.players[index1].time;
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
  $scope.showMoreData = function (bool, index) {
    if (bool === true) {
      $scope.roundsList[index].limitValue = 5000;
      $scope.roundsList[index].showHeat = false;

    } else {
      $scope.roundsList[index].limitValue = 8;
      $scope.roundsList[index].showHeat = true;

    }
  };

});