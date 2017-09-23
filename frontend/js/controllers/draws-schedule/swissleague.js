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
  }];

  $scope.constraints = {};


  $scope.getSportSpecificRounds = function () {
    if ($stateParams.id) {

      $scope.constraints.sport = $stateParams.id;
      NavigationService.getSportSpecificQualifyingRound($scope.constraints, function (data) {
        errorService.errorCode(data, function (allData) {
          if (!allData.message) {
            if (allData.value) {
              $scope.roundsListName = allData.data.roundsListName;
              $scope.roundsList = allData.data.roundsList;
              // $scope.roundsList = $scope.roundsList.reverse();
              _.each($scope.roundsList, function (data) {
                data.showMore = true;
                data.limitVale = 8;
                _.each(data.match, function (key) {
                  _.each(key.opponentsSingle, function (n) {
                    n.athleteId.fullName = n.athleteId.firstName + '  ' + n.athleteId.surname;
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

  $scope.showMoreData = function (bool, index) {
    if (bool) {
      $scope.roundsList[index].limitVale = 50000;
      $scope.roundsList[index].showMore = false;
    } else {
      $scope.roundsList[index].limitVale = 8;
      $scope.roundsList[index].showMore = true;
    }

  };


});