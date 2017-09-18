myApp.controller('KnockoutTeamCtrl', function ($scope, TemplateService, $state, NavigationService, $stateParams, toastr, $timeout, errorService, $rootScope, $uibModal, ResultSportInitialization, knockoutService) {
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
                $state.go('championshipschedule');
              }
              _.each($scope.roundsList, function (key) {
                _.each(key.match, function (value) {
                  if (value && value.resultVolleyball && value.resultVolleyball.teams) {
                    value.finalResult = value.resultVolleyball;
                    knockoutService.sortResult($scope.roundsList);

                  } else if (value && value.resultHockey && value.resultHockey.teams) {
                    value.finalResult = value.resultHockey;
                    knockoutService.sortResult($scope.roundsList);
                  } else if (value && value.resultBasketball && value.resultBasketball.teams) {
                    value.finalResult = value.resultBasketball;
                    knockoutService.sortResult($scope.roundsList);
                  } else if (value && value.resultHandball && value.resultHandball.teams) {
                    value.finalResult = value.resultHandball;
                    knockoutService.sortResult($scope.roundsList);
                  } else if (value && value.resultWaterPolo && value.resultWaterPolo.teams) {
                    value.finalResult = value.resultWaterPolo;
                    knockoutService.sortResult($scope.roundsList);
                  } else if (value && value.resultKabaddi && value.resultKabaddi.teams) {
                    value.finalResult = value.resultKabaddi;
                    knockoutService.sortResult($scope.roundsList);
                  } else if (value && value.resultsCombat && value.resultsCombat.teams) {
                    value.finalResult = value.resultsCombat;
                    knockoutService.sortResult($scope.roundsList);
                  } else {
                    console.log("no Sport Result Found");
                  }
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


});