myApp.controller('KnockoutCtrl', function ($scope, TemplateService, $state, NavigationService, $stateParams, toastr, $timeout, errorService, knockoutService, $rootScope, $uibModal) {
    $scope.template = TemplateService.getHTML("content/knockout.html");
    TemplateService.title = "Time Trial"; //This is the Title of the Website
    $scope.navigation = NavigationService.getNavigation();

    $scope.oneAtATime = true;
    $scope.status = {
        isCustomHeaderOpen: false,
        isFirstOpen: true,
        isFirstDisabled: false
    };
    // MODAL END
    // SWIPER
    $scope.initSwiper = function(){
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
      }, 600)
    };
    // $scope.$on('$viewContentLoaded', function (event) {
    //   $scope.initSwiper();
    // });
    $scope.initSwiper();
    // END SWIPER

    // START SCORING FUNCTION
    $scope.startScoring = function (card) {
        console.log(card, 'startScoring');
        if (_.isEmpty(card.opponentsSingle[0]) && _.isEmpty(card.opponentsSingle[1])) {
            toastr.error('No players found for match.', 'No match');
        } else {
            if (card.status == 'IsCompleted') {
                toastr.warning("This match has already been scored.", 'Scoring Completed');
            } else {
                $state.go("matchstart", {
                    drawFormat: $stateParams.drawFormat,
                    sport: $stateParams.id,
                    id: card.matchId
                });
            }
        }
    }
    // START SCORING FUNCTION END

    // KNOCKOUT JSON
    $scope.knockoutMatch = [{
        players: [{
            player: 'Harshit shah',
            schoolname: 'Dhirubhai Ambani Intertional',
            winner: true
        }, {
            player: 'Harshit shah',
            schoolname: 'Dhirubhai Ambani Intertional'
        }],
        date: '27th July, 2017',
        time: '10.30am'
    }, {
        players: [{
            player: 'Harshit shah',
            schoolname: 'Dhirubhai Ambani Intertional'
        }, {
            player: 'Harshit shah',
            schoolname: 'Dhirubhai Ambani Intertional',
            winner: true
        }],
        matchcenter: true
    }, {
        players: [{
            player: 'Harshit shah',
            schoolname: 'Dhirubhai Ambani Intertional'
        }, {
            player: 'Harshit shah',
            schoolname: 'Dhirubhai Ambani Intertional'
        }],
        date: '27th July, 2017',
        time: '10.30am'
    }, {
        players: [{
            player: 'Harshit shah',
            schoolname: 'Dhirubhai Ambani Intertional'
        }],
        matchcenter: true
    }]
    // END KNOCK OUT JSON

    $scope.round2 = [{
        players: [{
            player: 'Harshit shah',
            schoolname: 'Dhirubhai Ambani Intertional',
            winner: true

        }, {
            player: 'Harshit shah',
            schoolname: 'Dhirubhai Ambani Intertional'
        }],
        date: '27th July, 2017',
        time: '10.30am'
    }, {
        players: [{
            player: 'Harshit shah',
            schoolname: 'Dhirubhai Ambani Intertional'
        }, {
            player: 'Harshit shah',
            schoolname: 'Dhirubhai Ambani Intertional',
            winner: true
        }],
        matchcenter: true
    }]

    $scope.winnersCard = [{
        player: 'Harshit shah',
        schoolname: 'Dhirubhai Ambani Intertional',
        medal: 'gold'

    }, {
        player: 'Harshit shah',
        schoolname: 'Dhirubhai Ambani Intertional',
        medal: 'silver'

    }, {
        player: 'Harshit shah',
        schoolname: 'Dhirubhai Ambani Intertional',
        medal: 'bronze'

    }, {
        player: 'Harshit shah',
        schoolname: 'Dhirubhai Ambani Intertional',
        medal: 'bronze'

    }]

    $scope.roundName = [{
        roundname: 'Round 1'
    }, {
        roundname: 'Round 2'
    }, {
        roundname: 'Round 3'
    }];
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
                            if ($scope.roundsList) {
                                _.each($scope.roundsList, function (key) {
                                    _.each(key.match, function (value) {
                                        _.each(value.opponentsSingle, function (obj, index) {
                                            if (obj && obj.athleteId) {
                                                obj.athleteId.fullName = obj.athleteId.firstName + '  ' + obj.athleteId.surname;
                                            }
                                            if (value && value.resultsRacquet) {
                                                value.finalResult = value.resultsRacquet;
                                                knockoutService.sortKnockoutResult($scope.roundsList);

                                            } else if (value && value.resultsCombat) {
                                                value.finalResult = value.resultsCombat;
                                                knockoutService.sortKnockoutResult($scope.roundsList);
                                            }
                                        });

                                    });

                                });

                            }
                        }
                    } else {
                        toastr.error(allData.message, 'Error Message');
                    }
                });
            });
        }
    };
    $scope.getSportSpecificRounds();

    // MATCH CENTER
    $scope.matchCenter = function (card) {
      $scope.currentMatch = card;
      $scope.currentMatch.sportName = $scope.currentMatch.sport.sportslist.sportsListSubCategory.name;
        modal = $uibModal.open({
            animation: true,
            scope: $scope,
            // backdrop: 'static',
            keyboard: false,
            templateUrl: 'views/modal/matchcenter.html',
            size: 'lg',
            windowClass: 'matchcenter-modal'
        })
        console.log($scope.currentMatch, 'current');
    }
    // MATCH CENTER END


});

myApp.controller('KnockoutDoublesCtrl', function ($scope, TemplateService, $state, NavigationService, $stateParams, toastr, $timeout, errorService, $rootScope, $uibModal) {
    $scope.template = TemplateService.getHTML("content/knockout-doubles.html");
    TemplateService.title = "Time Trial"; //This is the Title of the Website
    $scope.navigation = NavigationService.getNavigation();

    $scope.oneAtATime = true;
    // SWIPER
    $scope.initSwiper = function(){
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
    }
    // $scope.$on('$viewContentLoaded', function (event) {
    //   $scope.initSwiper();
    // });
    $scope.initSwiper();
    // END SWIPER

    // DOUBLES JSON
    $scope.knockoutMatch = [{
        players: [{
            player: 'Harshit shah',
            schoolname: 'Dhirubhai Ambani Intertional',
            winner: true
        }, {
            player: 'Harshit shah',
            schoolname: 'Dhirubhai Ambani Intertional',
            winner: true
        }, {
            player: 'Harshit shah',
            schoolname: 'Dhirubhai Ambani Intertional'
        }, {
            player: 'Harshit shah',
            schoolname: 'Dhirubhai Ambani Intertional'
        }],
        date: '27th July, 2017',
        time: '10.30am'
    }, {
        players: [{
            player: 'Harshit shah',
            schoolname: 'Dhirubhai Ambani Intertional',
            winner: true
        }, {
            player: 'Harshit shah',
            schoolname: 'Dhirubhai Ambani Intertional',
            winner: true
        }, {
            player: 'Harshit shah',
            schoolname: 'Dhirubhai Ambani Intertional'
        }, {
            player: 'Harshit shah',
            schoolname: 'Dhirubhai Ambani Intertional'
        }],
        matchcenter: true
    }, {
        players: [{
            player: 'Harshit shah',
            schoolname: 'Dhirubhai Ambani Intertional',
            winner: true
        }, {
            player: 'Harshit shah',
            schoolname: 'Dhirubhai Ambani Intertional',
            winner: true
        }, {
            player: 'Harshit shah',
            schoolname: 'Dhirubhai Ambani Intertional'
        }, {
            player: 'Harshit shah',
            schoolname: 'Dhirubhai Ambani Intertional'
        }],
        matchcenter: true
    }, {
        players: [{
            player: 'Harshit shah',
            schoolname: 'Dhirubhai Ambani Intertional',
            winner: true
        }, {
            player: 'Harshit shah',
            schoolname: 'Dhirubhai Ambani Intertional',
            winner: true
        }],
        date: '27th July, 2017',
        time: '10.30am'
    },]
    // END DOUBLES JSON

    $scope.winnersCard = [{
        player: 'Harshit shah',
        schoolname: 'Dhirubhai Ambani Intertional',
        medal: 'gold'

    }, {
        player: 'Harshit shah',
        schoolname: 'Dhirubhai Ambani Intertional',
        medal: 'silver'

    }, {
        player: 'Harshit shah',
        schoolname: 'Dhirubhai Ambani Intertional',
        medal: 'bronze'

    }, {
        player: 'Harshit shah',
        schoolname: 'Dhirubhai Ambani Intertional',
        medal: 'bronze'

    }]

    $scope.winnerDoubles = [{
        players: [{
            player: 'Harshit shah',
            schoolname: 'Dhirubhai Ambani Intertional',
            winner: true
        }, {
            player: 'Harshit shah',
            schoolname: 'Dhirubhai Ambani Intertional',
            winner: true
        }],
        medal: 'gold'

    }, {
        players: [{
            player: 'Harshit shah',
            schoolname: 'Dhirubhai Ambani Intertional',
            winner: true
        }, {
            player: 'Harshit shah',
            schoolname: 'Dhirubhai Ambani Intertional',
            winner: true
        }],
        medal: 'silver'

    }, {
        players: [{
            player: 'Harshit shah',
            schoolname: 'Dhirubhai Ambani Intertional',
            winner: true
        }, {
            player: 'Harshit shah',
            schoolname: 'Dhirubhai Ambani Intertional',
            winner: true
        }],
        medal: 'bronze'

    }]


    $scope.roundName = [{
        roundname: 'Round 1'
    }, {
        roundname: 'Round 2'
    }, {
        roundname: 'Round 3'
    }];
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
                                    console.log(value.opponentsTeam);
                                    _.each(value.opponentsTeam, function (obj) {
                                        console.log(obj, "obj");
                                        if (obj) {
                                            _.each(obj.studentTeam, function (value) {
                                                value.fullName = value.studentId.firstName + ' ' + value.studentId.surname;
                                            });
                                        }

                                        if (value && value.resultsRacquet) {
                                            value.isNoMatch = value.resultsRacquet.isNoMatch;
                                            value.status = value.resultsRacquet.status;
                                            // value.teams

                                        }
                                        if (value.resultsRacquet && value.resultsRacquet.winner) {
                                            value.reason = value.resultsRacquet.winner.reason;
                                            if (obj._id === value.resultsRacquet.winner.player) {
                                                obj.isWinner = true;
                                                value.isWinner = obj.isWinner;
                                                value.winnerName = obj.schoolName;

                                            } else {
                                                obj.isWinner = false;
                                            }
                                        }

                                        if (value.resultsRacquet !== undefined && value.resultsRacquet.teams) {
                                            _.each(value.resultsRacquet.teams, function (n) {
                                                n.walkover = NavigationService.Boolean(n.walkover);
                                                n.noShow = NavigationService.Boolean(n.noShow);
                                            });
                                            $scope.tempWakover = _.find(value.resultsRacquet.teams, ['walkover', true]);
                                            $scope.tempNoshow = _.find(value.resultsRacquet.teams, ['noShow', true]);
                                            if ($scope.tempWakover) {
                                                value.walkover = $scope.tempWakover.walkover;
                                            }
                                            if ($scope.tempNoshow) {
                                                value.noShow = $scope.tempNoshow.noShow;

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
    // START SCORING FUNCTION
    $scope.startScoring = function (card) {
        console.log(card, 'startScoring');
        if (_.isEmpty(card.opponentsTeam[0]) && _.isEmpty(card.opponentsTeam[1])) {
            toastr.error('No players found for match.', 'No match');
        } else {
            if (card.status == 'IsCompleted') {
                toastr.warning("This match has already been scored.", 'Scoring Completed');
            } else {
                $state.go("matchstart", {
                    drawFormat: $stateParams.drawFormat,
                    sport: $stateParams.id,
                    id: card.matchId
                });
            }
        }
    };
    // START SCORING FUNCTION END

    // MATCH CENTER
    $scope.matchCenter = function (card) {
      $scope.currentMatch = card;
      $scope.currentMatch.sportName = $scope.currentMatch.sport.sportslist.sportsListSubCategory.name;
        modal = $uibModal.open({
            animation: true,
            scope: $scope,
            keyboard: false,
            templateUrl: 'views/modal/matchcenter-doubles.html',
            size: 'lg',
            windowClass: 'matchcenter-modal'
        })
        console.log($scope.currentMatch, 'current');
    }
    // MATCH CENTER END
});
