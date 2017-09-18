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
  $scope.constraints = {};
  $scope.knockoutLimit = 8;
  $scope.limitValue = 8;
  $scope.pointsLimit = 3;
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
                _.each($scope.matches, function (data) {
                  _.each(data.match, function (key) {
                    if (key.opponentsTeam) {
                      _.each(key.opponentsTeam, function (team, index) {
                        if (key.resultFootball !== undefined) {
                          if (team._id === key.resultFootball.winner.player) {
                            team.isWinner = true;
                          }
                        }
                        if (key.resultFootball !== undefined && key.resultFootball.teams) {
                          _.each(key.resultFootball.teams, function (n) {
                            n.walkover = Boolean(n.walkover);
                            n.noShow = Boolean(n.noShow);
                            team.finalPoint = key.resultFootball.teams[index].teamResults.finalPoints;

                          });
                          $scope.tempWakover = _.find(key.resultFootball.teams, ['walkover', true]);
                          $scope.tempNoshow = _.find(key.resultFootball.teams, ['noShow', true]);
                          if ($scope.tempWakover) {
                            key.walkover = $scope.tempWakover.walkover;
                          }
                          if ($scope.tempNoshow) {
                            key.noShow = $scope.tempNoshow.noShow;
                          }

                        }

                      });
                    }
                    if (key.resultFootball) {
                      key.isNoMatch = key.resultFootball.isNoMatch;
                      key.isDraw = key.resultFootball.isDraw;
                      key.status = key.resultFootball.status;
                    } else {
                      console.log("im in else");
                    }
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

});