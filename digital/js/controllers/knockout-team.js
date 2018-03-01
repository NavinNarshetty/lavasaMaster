myApp.controller('KnockoutTeamCtrl', function ($scope, TemplateService, $state, NavigationService, $stateParams, toastr, $timeout, errorService, $rootScope, $uibModal, ResultSportInitialization, knockoutService) {
  $scope.template = TemplateService.getHTML("content/knockout-team.html");
  TemplateService.title = "Time Trial"; //This is the Title of the Website
  $scope.navigation = NavigationService.getNavigation();
  $scope.resultVar = {};
  // SWIPER
  $scope.initSwiper = function(){
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
    }, 600);
  };
  // $scope.$on('$viewContentLoaded', function (event) {
  //   $scope.initSwiper();
  // });
  $scope.initSwiper();
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
        if (card.sport.sportslist.name == 'Kho Kho' ) {
          $state.go("matchstart",{
            drawFormat: $stateParams.drawFormat,
            sport: $stateParams.id,
            id: card.matchId
          });
        } else {
          $state.go("matchteam", {
            drawFormat: $stateParams.drawFormat,
            sport: $stateParams.id,
            id: card.matchId
          });
        }
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
                  } else if (value && value.resultThrowball && value.resultThrowball.teams) {
                    value.finalResult = value.resultThrowball;
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

  // MATCH CENTER MODAL
  $scope.matchCenter = function (card) {
    $scope.currentMatch = card;
    $scope.currentMatch.sportName = $scope.currentMatch.sport.sportslist.sportsListSubCategory.name;
    switch ($scope.currentMatch.sportName) {
      case "Basketball":
        $scope.currentMatch.result = $scope.currentMatch.resultBasketball;
      break;
      case "Handball":
        $scope.currentMatch.result = $scope.currentMatch.resultHandball;
      break;
      case "Hockey":
        $scope.currentMatch.result = $scope.currentMatch.resultHockey;
      break;
      case "Kabaddi":
        $scope.currentMatch.result = $scope.currentMatch.resultKabaddi;
      break;
      case "Water Polo":
        $scope.currentMatch.result = $scope.currentMatch.resultWaterPolo;
      break;
      case "Volleyball":
        $scope.currentMatch.result = $scope.currentMatch.resultVolleyball;
      break;
      case "Kho Kho":
        $scope.currentMatch.result = $scope.currentMatch.resultsCombat;
      break;
      case "Throwball":
        $scope.currentMatch.result = $scope.currentMatch.resultThrowball;
      break;
    }
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
