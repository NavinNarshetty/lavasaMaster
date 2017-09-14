myApp.controller('KnockoutTeamCtrl', function ($scope, TemplateService, $state, NavigationService, $stateParams, toastr, $timeout, errorService, $rootScope, $uibModal) {
  $scope.template = TemplateService.getHTML("content/knockout-team.html");
  TemplateService.title = "Time Trial"; //This is the Title of the Website
  $scope.navigation = NavigationService.getNavigation();
  // SWIPER
  $scope.$on('$viewContentLoaded', function (event) {

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
          if (card.status == 'IsCompleted') {
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
                $state.go('championshipschedule');
              }
              _.each($scope.roundsList, function (key) {
                _.each(key.match, function (value) {
                  _.each(value.opponentsSingle, function (obj, index) {
                    if (obj && obj.athleteId) {
                      obj.athleteId.fullName = obj.athleteId.firstName + '  ' + obj.athleteId.surname;


                      if (value.resultsCombat) {
                        console.log("resultsCombat", value.resultsCombat);
                        console.log(" im in resultsCombat");
                        if (value.resultsCombat.players[index]) {
                          obj.noShow = Boolean(value.resultsCombat.players[index].noShow);
                          obj.walkover = Boolean(value.resultsCombat.players[index].walkover);
                        }

                        value.status = value.resultsCombat.status;
                        value.isNoMatch = value.resultsCombat.isNoMatch;
                        value.video = value.resultsCombat.video;
                        if (obj.walkover) {
                          value.walkover = obj.walkover;
                        }
                        if (value.resultsCombat.winner) {
                          value.reason = value.resultsCombat.winner.reason;
                          if (obj.athleteId._id === value.resultsCombat.winner.player) {
                            obj.isWinner = true;
                            value.isWinner = obj.isWinner;
                          } else {
                            obj.isWinner = false;
                          }
                        }

                      } else if (value && value.resultsRacquet && value.resultsRacquet.players[index]) {
                        console.log("im in resultsRacquet");
                        console.log(value.resultsRacquet.players[index]);
                        obj.noShow = Boolean(value.resultsRacquet.players[index].noShow);
                        obj.walkover = Boolean(value.resultsRacquet.players[index].walkover);
                        value.status = value.resultsRacquet.status;
                        value.isNoMatch = value.resultsRacquet.isNoMatch;
                        value.video = value.resultsRacquet.video;

                        if (obj.walkover) {
                          value.walkover = obj.walkover;
                        }
                        if (value.resultsRacquet.winner) {
                          value.reason = value.resultsRacquet.winner.reason;
                          if (obj && obj.athleteId && (obj.athleteId._id === value.resultsRacquet.winner.player)) {
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
