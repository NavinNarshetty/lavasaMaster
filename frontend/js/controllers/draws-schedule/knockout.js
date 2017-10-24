myApp.controller('KnockoutCtrl', function ($scope, TemplateService, $state, NavigationService, $filter, $sce, $stateParams, toastr, $timeout, errorService, loginService, selectService, $rootScope, $uibModal, knockoutService) {
    $scope.template = TemplateService.getHTML("content/draws-schedule/knockout.html");
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
    $scope.initSwiper = function () {
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
    };
    $scope.initSwiper();
    // END SWIPER


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
                                        if (value.sport.eventPdf) {
                                            $scope.showPdf = true;
                                            $scope.pdfdata = value.sport.eventPdf;
                                            $scope.pdfURL = $filter('uploadpathTwo')($scope.pdfdata);
                                            $scope.trustedURL = $sce.trustAsResourceUrl($scope.pdfURL);

                                        }
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

myApp.controller('KnockoutDoublesCtrl', function ($scope, TemplateService, $state, NavigationService, $filter, $sce, $stateParams, toastr, $timeout, errorService, loginService, selectService, $rootScope, $uibModal) {
    $scope.template = TemplateService.getHTML("content/draws-schedule/knockout-doubles.html");
    TemplateService.title = "Time Trial"; //This is the Title of the Website
    $scope.navigation = NavigationService.getNavigation();

    $scope.oneAtATime = true;
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

    }];


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
                                    if (value.sport.eventPdf) {
                                        $scope.showPdf = true;
                                        $scope.pdfdata = value.sport.eventPdf;
                                        $scope.pdfURL = $filter('uploadpathTwo')($scope.pdfdata);
                                        $scope.trustedURL = $sce.trustAsResourceUrl($scope.pdfURL);

                                    }
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
    $scope.getWinners = function () {
        if ($stateParams.id) {
            $scope.constraints.sport = $stateParams.id;
            NavigationService.getAllWinners($scope.constraints, function (data) {
                errorService.errorCode(data, function (allData) {
                    if (!allData.message) {
                        if (allData.value) {
                            $scope.winnerDoubles = allData.data;
                            _.each($scope.winnerDoubles, function (value) {
                                _.each(value.team, function (key) {
                                    _.each(key.studentTeam, function (n) {
                                        n.fullName = n.studentId.firstName + ' ' + n.studentId.surname;
                                    });
                                });
                            });
                            console.log("  $scope.winnerDoubles", $scope.winnerDoubles);
                        }
                    } else {
                        toastr.error(allData.message, 'Error Message');
                    }

                });


            });
        }
    },
        $scope.getWinners();

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

//knockout Team ctrl
myApp.controller('KnockoutTeamCtrl', function ($scope, TemplateService, $state, NavigationService, $stateParams, toastr, $timeout, errorService, loginService, selectService, knockoutService, $rootScope, $filter, $sce, $uibModal) {
    $scope.template = TemplateService.getHTML("content/draws-schedule/knockout-team.html");
    TemplateService.title = "Time Trial"; //This is the Title of the Website
    $scope.navigation = NavigationService.getNavigation();
    $scope.oneAtATime = true;
    // SWIPER
    $scope.$on('$viewContentLoaded', function (event) {

        $timeout(function () {
            mySwiper1 = new Swiper('.swiper-container', {
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

    }];



    console.log("im in konckout team");

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
                                    if (value.sport.eventPdf) {
                                        $scope.showPdf = true;
                                        $scope.pdfdata = value.sport.eventPdf;
                                        $scope.pdfURL = $filter('uploadpathTwo')($scope.pdfdata);
                                        $scope.trustedURL = $sce.trustAsResourceUrl($scope.pdfURL);

                                    }
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
            case "Throwball":
                $scope.currentMatch.result = $scope.currentMatch.resultsCombat;
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
