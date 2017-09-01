  myApp.controller('KnockoutCtrl', function ($scope, TemplateService, $state, NavigationService, $stateParams, toastr, $timeout, errorService, $rootScope, $uibModal) {
    $scope.template = TemplateService.getHTML("content/knockout.html");
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
        }, 300)
    });
    // END SWIPER

    // START SCORING FUNCTION
    $scope.startScoring = function(card){
      console.log(card,'startScoring');
      $state.go("matchstart",{
        drawFormat: $stateParams.drawFormat,
        sport: $stateParams.id,
        id: card.matchId
      });
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
                            if ($scope.roundsListName.length === 0 && $scope.roundsList.length === 0) {
                                toastr.error("No Data Found", 'Error Message');
                            }
                            _.each($scope.roundsList, function (key) {
                                _.each(key.match, function (value) {
                                    _.each(value.opponentsSingle, function (obj) {
                                        obj.athleteId.fullName = obj.athleteId.firstName + '  ' + obj.athleteId.surname;
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

myApp.controller('KnockoutDoublesCtrl', function ($scope, TemplateService, $state, NavigationService, $stateParams, toastr, $timeout, errorService, $rootScope, $uibModal) {
    $scope.template = TemplateService.getHTML("content/knockout-doubles.html");
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
        }, 300)
    });
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
    }]
});
