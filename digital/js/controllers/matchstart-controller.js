myApp.controller('MatchStartCtrl', function($scope, TemplateService, NavigationService, $timeout, $uibModal, $stateParams) {
    $scope.template = TemplateService.getHTML("content/match-start.html");
    TemplateService.title = "Sport Match"; //This is the Title of the Website
    $scope.navigation = NavigationService.getNavigation();

    // VARIABLE INITIALISE
    $scope.showMatchPhoto = false;
    $scope.matchData = {};
    $scope.matchDetails = {};
    $scope.matchPics = [];
    // VARIABLE INITIALISE END

    // INITIALSE SWIPER
    $scope.swiperInit = function() {
        $scope.$on('$viewContentLoaded', function(event) {
            $timeout(function() {
                var athleteKnow = new Swiper('.scorescard-swiper .swiper-container', {
                    paginationClickable: true,
                    loop: true,
                    grabCursor: true,
                    spaceBetween: 10,
                    nextButton: '.scorecard-next',
                    prevButton: '.scorecard-prev',
                    touchEventsTarget: 'container',
                })
            }, 100);
        })
    }
    $scope.swiperInit();
    // INITIALSE SWIPER END
    $scope.mySlides = ['1', '2', '3', '4', '5'];

    // API CALLN INTEGRATION
    // GET MATCH
    $scope.getOneMatch = function() {
        $scope.matchData.matchId = $stateParams.id;
        NavigationService.getOneMatch($scope.matchData, function(data) {
            if (data.value == true) {
                $scope.matchDetails = data.data;
                // INITIALISE RESULTS
                if ($scope.matchDetails.resultsCombat == null || $scope.matchDetails.resultsCombat == "" || $scope.matchDetails.resultsCombat == undefined) {
                    $scope.matchDetails.resultsCombat = {
                        "players": [],
                        "matchPhoto": [],
                        "scoreSheet": []
                    }
                    _.each($scope.matchDetails.players, function(n, key) {
                        $scope.matchDetails.resultsCombat.players[key] = {
                            "player": n._id,
                            "noShow": false,
                            "walkover": false,
                            "sets": [{
                                point: 0,
                            }]
                        }
                    })
                }
                console.log($scope.matchDetails, 'match');
                // INITIALISE RESULTS END
            } else {
                console.log("ERROR IN getOneMatch");
            }
        })
    };
    $scope.getOneMatch();
    // GET MATCH END
    // API CALLN INTEGRATION END

    // NO MATCH
    $scope.setNoMatch = function() {
            _.each($scope.matchDetails.resultsCombat.players, function(player) {
                player.noShow = true;
                player.walkover = false;
            })
            console.log($scope.matchDetails.resultsCombat.players, 'player');
        }
        // NO MATCH END
        // SAVE WINNER
        // SAVE WINNER  END

    $scope.players = [{
        id: '1',
        name: 'Shiva Singh',
        school: 'Jamnabai school'
    }, {
        id: '2',
        name: 'Raj Shah',
        school: 'Jamnabai school'
    }];
    $scope.showNoMatch = function() {
        $uibModal.open({
            animation: true,
            scope: $scope,
            backdrop: 'static',
            keyboard: false,
            templateUrl: 'views/modal/match-nomatch.html',
            size: 'lg',
            windowClass: 'match-nomatch'
        })
    }

    $scope.match = {
        id: 123,
        sfaid: 123456,
        sport: 'judo',
        round: 'round 1',
        age: 'u-16',
        gender: 'male',
        players: [{
            player: '1',
            sfaid: '1234',
            noShow: true,
            walkover: true,
            color: 'blue',
            name: 'Shiva Singh',
            school: 'Jamnabai school',
            sets: [{
                point: 0,
            }]
        }, {
            player: '2',
            sfaid: '1234',
            color: 'red',
            noShow: true,
            walkover: true,
            name: 'Raj Shah',
            school: 'Jamnabai school',
            sets: [{
                point: 0,
            }]
        }],
        winner: {},
    };

})
