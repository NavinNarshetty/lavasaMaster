myApp.controller('KnockoutTeamCtrl', function ($scope, TemplateService, $state, NavigationService, $stateParams, toastr, $timeout, errorService, $rootScope, $uibModal) {
  $scope.template = TemplateService.getHTML("content/knockout-team.html");
  TemplateService.title = "Time Trial"; //This is the Title of the Website
  $scope.navigation = NavigationService.getNavigation();
  $scope.resultVar = {};
  // SWIPER
  $scope.$on('$viewContentLoaded', function (event) {
    $scope.matchDetails = {};
    $timeout(function () {
      mySwiper = new Swiper('.swiper-container', {
        paginationClickable: true,
        nextButton: '.swiper-button-next',
        prevButton: '.swiper-button-prev',
        slidesPerView: 3,
        spaceBetween: 5,
        grabCursor: true,
        breakpoints: {
          992: {
            slidesPerView: 3
          },
          768: {
            slidesPerView: 2

          },
          481: {
            slidesPerView: 1
          },
          320: {
            slidesPerView: 1
          }
        }
      });
    }, 300);
  });
  // END SWIPER

  // START SCORING FUNCTION
  $scope.startScoring = function (card) {
    console.log(card, 'startScoring');
    if (_.isEmpty(card.opponentsTeam[0]) && _.isEmpty(card.opponentsTeam[1])) {
      toastr.error('No players found for match.', 'No match');
    } else {
      if (card && card[$scope.resultVar.resultVar] && card[$scope.resultVar.resultVar].status == 'IsCompleted') {
        toastr.warning("This match has already been scored.", 'Scoring Completed');
      } else {
        $state.go("matchteam", {
          drawFormat: $stateParams.drawFormat,
          sport: $stateParams.id,
          id: card.matchId
        });
      }
    }
  }
  // START SCORING FUNCTION END

  // DOUBLES JSON
  console.log("imin knockout team ctrl");
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
                $state.go('digital-home');
              }
              sportName = $scope.roundsList[0].match[0].sport.sportslist.name;
              $scope.resultVar = ResultSportInitialization.getResultVariable(sportName);
              console.log($scope.resultVar);
              //ResultSportInitialization--for getting Result Variable End
              var resultVar = $scope.resultVar.resultVar;
              _.each($scope.roundsList, function (key) {
                _.each(key.match, function (value) {
                  _.each(value.opponentsSingle, function (obj, index) {
                    if (obj && obj._id) {
                      obj.athleteId.fullName = obj.athleteId.firstName + '  ' + obj.athleteId.surname;


                      if (value[resultVar]) {
                        console.log("resultsCombat", value[resultVar]);
                        console.log(" im in resultsCombat");
                        if (value[resultVar].players[index]) {
                          obj.noShow = Boolean(value[resultVar].players[index].noShow);
                          obj.walkover = Boolean(value[resultVar].players[index].walkover);
                        }

                        value.status = value[resultVar].status;
                        value.isNoMatch = value[resultVar].isNoMatch;
                        value.video = value[resultVar].video;
                        if (obj.walkover) {
                          value.walkover = obj.walkover;
                        }
                        if (value[resultVar].winner) {
                          value.reason = value[resultVar].winner.reason;
                          if (obj.athleteId._id === value[resultVar].winner.player) {
                            obj.isWinner = true;
                            value.isWinner = obj.isWinner;
                          } else {
                            obj.isWinner = false;
                          }
                        }

                      }
                    }

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


});