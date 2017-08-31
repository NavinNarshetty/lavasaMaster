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

  $scope.limitValue = 8;
  $scope.showHeat = true;
  $scope.constraints = {};
  $scope.getSportSpecificRounds = function (roundName) {
    if ($stateParams.id) {
      if (roundName) {
        $scope.constraints.round = roundName;
      }
      $scope.constraints.sport = $stateParams.id;
      NavigationService.getSportSpecificRounds($scope.constraints, function (data) {
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
                  _.each(value.opponentsSingle, function (obj, index1) {
                    obj.athleteId.fullName = obj.athleteId.firstName + '  ' + obj.athleteId.surname;
                    obj.result = value.resultHeat.players[index1].result;
                    obj.laneNo = value.resultHeat.players[index1].laneNo;
                    obj.time = value.resultHeat.players[index1].time;
                  });

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
  $scope.showMoreData = function (bool) {
    if (bool === true) {
      $scope.limitValue = 2000;
      $scope.showHeat = false;
    } else {
      $scope.limitValue = 8;
      $scope.showHeat = true;
    }
  };

});