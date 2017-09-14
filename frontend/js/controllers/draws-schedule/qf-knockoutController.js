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
  },];

  // END TABLE JSON

  $scope.constraints = {};
  $scope.knockoutArr = [];
  $scope.getSportSpecificRounds = function (roundName) {
    if ($stateParams.id) {
      if (roundName) {
        $scope.constraints.round = roundName;
      }
      $scope.constraints.sport = $stateParams.id;
      NavigationService.getSportQualifyingKnockoutRounds($scope.constraints, function (data) {
        errorService.errorCode(data, function (allData) {
          if (!allData.message) {
            if (allData.value) {
              $scope.knockout = allData.data.knockout.roundsList;
              $scope.qualifying = allData.data.qualifying.roundsList;
              $scope.knockout = $scope.knockout.reverse();
              _.each($scope.knockout, function (data, index) {
                _.each(data.match, function (key) {
                  _.each(key.opponentsSingle, function (obj) {
                    obj.athleteId.fullName = obj.athleteId.firstName + ' ' + obj.athleteId.surname;
                  });
                });

              });
              _.each($scope.knockout, function (data) {
                $scope.knockoutArr.push(data.match);
              });
              $scope.knockout = _.flattenDeep($scope.knockoutArr);
              _.each($scope.qualifying, function (data, index) {
                _.each(data.match, function (key) {
                  _.each(key.opponentsSingle, function (obj) {
                    obj.athleteId.fullName = obj.athleteId.firstName + ' ' + obj.athleteId.surname;
                  });
                });
              });
            }
          } else {
            toastr.error(allData.message, 'Error Message');
          }
        });
      });
    }
  };
  $scope.getSportSpecificRounds();

  //show more data
  $scope.limitKnockout = 8;
  $scope.limitValue = 8;
  $scope.showMoreData = function (bool, type) {
    if (type === 'knockout') {
      console.log("im inn");
      if (bool) {
        $scope.showKnockout = true;
        $scope.limitKnockout = 5000;
      } else {
        $scope.limitKnockout = 8;
        $scope.showKnockout = false;
      }
    } else {
      if (type === 'qualifying') {
        if (bool === true) {
          console.log("im inn");
          $scope.showMore = true;
          $scope.limitValue = 5000;
        } else {
          $scope.showMore = false;
          $scope.limitValue = 8;
        }
      }
    }
  };


});