myApp.controller('LeagueKnockoutCtrl', function ($scope, TemplateService, $state, NavigationService, $stateParams, toastr, $timeout, errorService, loginService, selectService, knockoutService, $rootScope, $uibModal) {
  $scope.template = TemplateService.getHTML("content/draws-schedule/league-knockout.html");
  TemplateService.title = "League Knockout"; //This is the Title of the Website
  $scope.navigation = NavigationService.getNavigation();

  $scope.oneAtATime = true;
  $scope.status = {
    isCustomHeaderOpen: false,
    isFirstOpen: true,
    isFirstDisabled: false
  };
  $scope.constraints = {};
  $scope.knockoutLimit = 8;
  $scope.limitValue = 8;
  $scope.pointsLimit = 3;
  $scope.knockoutArr = [];

  $scope.getOneSport = function (id) {
    $scope.objId = {};
    $scope.objId._id = id;
    NavigationService.getOneSportDetail($scope.objId, function (data) {
      errorService.errorCode(data, function (allData) {
        if (!allData.message) {
          if (allData.value) {
            $scope.oneSportDetail = allData.data;
          }
        } else {
          toastr.error(allData.message, 'Error Message');
        }
      });
    });


  };

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
              $scope.knockout = allData.data.knockout.roundsList;
              _.each($scope.knockout, function (n) {
                $scope.knockoutArr.push(n.match);

              });
              $scope.knockout = _.flattenDeep($scope.knockoutArr);
              $scope.knockout.reverse();
              console.log("  $scope.knockout", $scope.knockout);
              if ($scope.knockout.length > 0) {
                _.each($scope.knockout, function (key) {
                  knockoutService.sortLeagueKnockoutResult(key);
                });
              }
              if (allData.data.qualifying) {
                $scope.matches = allData.data.qualifying.roundsList;
                $scope.getOneSport($scope.matches[0].match[0].sport);
                _.each($scope.matches, function (data) {
                  _.each(data.match, function (key) {
                    knockoutService.sortLeagueKnockoutResult(key);
                  });
                });
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

  //for Knockout Tables
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
  //For Points table
  if ($stateParams.id) {
    var Obj = {};
    Obj.sport = $stateParams.id;
    NavigationService.getSportStandings(Obj, function (data) {
      console.log(data, "data");
      errorService.errorCode(data, function (allData) {
        if (!allData.message) {
          if (allData.value) {
            $scope.tablePoint = allData.data.tablePoint;
          }
        } else {
          toastr.error(allData.message, 'Error Message');
        }
      });
    });
  }
  //for Points Table
  $scope.showMorePoints = function (bool) {
    if (bool) {
      $scope.showPoints = true;
      $scope.pointsLimit = 5000;
    } else {
      $scope.showPoints = false;
      $scope.pointsLimit = 3;
    }
  };

  // MATCH CENTER MODAL
  $scope.matchCenter = function (card) {
    console.log($scope.oneSportDetail,'oneSportDetail');
    $scope.currentMatch = card;
    console.log(card, 'card');
    $scope.currentMatch.sport = {};
    $scope.currentMatch.sport = $scope.oneSportDetail;
    $scope.currentMatch.sportName = $scope.currentMatch.sport.sportslist.sportsListSubCategory.name;
    $scope.currentMatch.result = $scope.currentMatch.resultFootball;
      modal = $uibModal.open({
          animation: true,
          scope: $scope,
          keyboard: false,
          templateUrl: 'views/modal/matchcenter-team.html',
          size: 'lg',
          windowClass: 'teammatchcenter-modal'
      })
      console.log($scope.currentMatch, 'current');
  }
  // MATCH CENTER MODAL END
  // CLEAVE FUNCTION OPTIONS
  $scope.options = {
    formation: {
          blocks: [1, 1, 1, 1],
          uppercase: true,
          delimiters: ['-']
      },
      score: {
        blocks: [2],
        numeral: true
      }
  }
  // CLEAVE FUNCTION OPTIONS END

});
