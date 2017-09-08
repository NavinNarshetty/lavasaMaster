myApp.controller('MatchTeamCtrl', function($scope, TemplateService, NavigationService, $timeout, $uibModal, $stateParams, $state, toastr) {
    $scope.template = TemplateService.getHTML("content/match-team.html");
    TemplateService.title = "Sport Match"; //This is the Title of the Website
    $scope.navigation = NavigationService.getNavigation();
    $scope.matchId = $stateParams.id;
    // VARIABLE INITIALISE
    $scope.showMatchPhoto = false;
    $scope.matchData = {};
    $scope.matchDetails = {};
    $scope.matchPics = [];
    $scope.disableWinner = false;
    $scope.matchError = "";
    $scope.showError = false;
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

    //INTEGRATION
    // GET MATCH
    $scope.getOneMatch = function() {
        $scope.matchData.matchId = $stateParams.id;
        NavigationService.getOneMatch($scope.matchData, function(data) {
            if (data.value == true) {
                if (data.data.error) {
                    $scope.matchError = data.data.error;
                    console.log($scope.matchError, 'error');
                    toastr.error('Invalid MatchID. Please check the MatchID entered.', 'Error');
                }
                $scope.matchDetails = data.data;
                $scope.matchDetails.matchId = $scope.matchData.matchId;
                console.log($scope.matchDetails, '$scope.matchDetails');
                if ($scope.matchDetails.teams.length == 0) {
                    if ($stateParams.drawFormat === 'Knockout') {
                        $state.go('knockout', {
                            drawFormat: $stateParams.drawFormat,
                            id: $stateParams.sport
                        });
                    } else if ($stateParams.drawFormat === 'Heats') {
                        $state.go('heats', {
                            drawFormat: $stateParams.drawFormat,
                            id: $stateParams.sport
                        });
                    }
                } else {
                    // INITIALISE RESULTS
                    switch ($scope.matchDetails.sportsName) {
                        case "Football":
                            if ($scope.matchDetails.resultFootball == null || $scope.matchDetails.resultFootball == "" || $scope.matchDetails.resultFootball == undefined) {
                                $scope.matchDetails.resultFootball = {};
                                $scope.formData = {
                                    "teams": [],
                                    "matchPhoto": [],
                                    "scoreSheet": [],
                                    "status": "",
                                    "winner": {}
                                }
                                _.each($scope.matchDetails.teams, function(n, key) {
                                    $scope.formData.teams[key] = {
                                        "team": n._id,
                                        "noShow": false,
                                        "walkover": false,
                                        "players": [],
                                        "teamResults": {
                                            halfPoints: 0,
                                            finalPoints: 0,
                                            penalityPoints: 0,
                                            shotsOnGoal: 0,
                                            totalShots: 0,
                                            corners: 0,
                                            penality: 0,
                                            saves: 0,
                                            fouls: 0,
                                            offSide: 0,
                                            cleanSheet: 0
                                        }
                                    }
                                    _.each($scope.matchDetails.teams[key].studentTeam, function(m, mkey) {
                                        $scope.formData.teams[key].players[mkey] = {
                                            "player": m.studentId._id,
                                            "isPlaying": false,
                                            "jerseyNo": 0,
                                            "playerPoints": {
                                                "goals": [],
                                                "assist": [],
                                                "redCard": [],
                                                "yellowCard": [],
                                                "penalityPoint": 0,
                                                "in": [],
                                                "out": []
                                            }
                                        }
                                    })
                                });
                            } else {
                                $scope.formData = $scope.matchDetails.resultFootball;
                                if ($scope.matchDetails.resultFootball.status == 'IsCompleted') {
                                    if ($stateParams.drawFormat === 'Knockout') {
                                        $state.go('knockout', {
                                            drawFormat: $stateParams.drawFormat,
                                            id: $stateParams.sport
                                        });
                                    } else if ($stateParams.drawFormat === 'Heats') {
                                        $state.go('heats', {
                                            drawFormat: $stateParams.drawFormat,
                                            id: $stateParams.sport
                                        });
                                    }
                                }
                            }
                            console.log($scope.formData, 'football result');
                            break;
                        case "Volleyball":
                            if ($scope.matchDetails.resultVolleyball == null || $scope.matchDetails.resultVolleyball == "" || $scope.matchDetails.resultVolleyball == undefined) {
                                $scope.matchDetails.resultVolleyball = {};
                                $scope.formData = {
                                    "teams": [],
                                    "matchPhoto": [],
                                    "scoreSheet": [],
                                    "status": "",
                                    "winner": {}
                                }
                                _.each($scope.matchDetails.teams, function(n, key) {
                                    $scope.formData.teams[key] = {
                                        "team": n._id,
                                        "noShow": false,
                                        "walkover": false,
                                        "players": [],
                                        "teamResults": {
                                            sets: [{
                                                points: 0
                                            }],
                                            spike: 0,
                                            fouls: 0,
                                        }
                                    }
                                    _.each($scope.matchDetails.teams[key].studentTeam, function(m, mkey) {
                                        $scope.formData.teams[key].players[mkey] = {
                                            "player": m.studentId._id,
                                            "isPlaying": false,
                                            "jerseyNo": 0,
                                            "playerPoints": {
                                                "in": [],
                                                "out": []
                                            }
                                        }
                                    })
                                });
                            } else {
                                $scope.formData = $scope.matchDetails.resultVolleyball;
                                if ($scope.matchDetails.resultVolleyball.status == 'IsCompleted') {
                                    if ($stateParams.drawFormat === 'Knockout') {
                                        $state.go('knockout', {
                                            drawFormat: $stateParams.drawFormat,
                                            id: $stateParams.sport
                                        });
                                    } else if ($stateParams.drawFormat === 'Heats') {
                                        $state.go('heats', {
                                            drawFormat: $stateParams.drawFormat,
                                            id: $stateParams.sport
                                        });
                                    }
                                }
                            }
                            console.log($scope.formData, 'Volleyball result');
                            break;
                    }
                    // INITIALISE RESULTS END
                }
            } else {
                console.log("ERROR IN getOneMatch");
            }
        })
    };
    $scope.getOneMatch();
    // GET MATCH END
    // GET MATCH SCORESHEET
    $scope.getMatchPhoto = function(detail) {
        console.log(detail, 'pic return');
        $scope.showMatchPhoto = true;
        $scope.swiperInit();
    };
    // GET MATCH SCORESHEET END
    // REMOVE MATCH SCORESHEET
    $scope.removeMatchScore = function(pic) {
            _.remove($scope.formData.matchPhoto, function(n) {
                return n.image === pic.image;
            })
        }
        // REMOVE MATCH SCORESHEET END
        // TEAM NO MATCH
    $scope.setTeamNoMatch = function() {
            _.each($scope.formData.teams, function(team) {
                team.noShow = true;
                team.walkover = false;
            })
        }
        // TEAM NO MATCH END
        // SAVE RESULT
    $scope.saveResult = function(formData) {
            console.log(formData, 'svae data');
            if (formData) {
                if ($scope.matchDetails.teams.length == 1) {
                    toastr.error('Minimum 2 Players required to start scoring');
                } else {
                    $scope.matchResult = {
                        matchId: $scope.matchData.matchId
                    }
                    switch ($scope.matchDetails.sportName) {
                        case "Volleyball":
                            $scope.matchResult.resultVolleyball = formData;
                            if (!$scope.matchResult.resultVolleyball.status) {
                                $scope.matchResult.resultVolleyball.status = "IsLive";
                            }
                            break;
                        case "Football":
                            $scope.matchResult.resultFootball = formData;
                            if (!$scope.matchResult.resultFootball.status) {
                                $scope.matchResult.resultFootball.status = "IsLive";
                            }
                            break;
                    }
                    NavigationService.saveMatch($scope.matchResult, function(data) {
                        if (data.value == true) {
                            switch ($scope.matchDetails.sportName) {
                                case "Volleyball":
                                  $state.go("scorevolleyball",{
                                    drawFormat: $stateParams.drawFormat,
                                    sport: $stateParams.sport,
                                    id: $scope.matchData.matchId
                                  });
                                break;
                                case "Football":
                                    $state.go("scorefootball");
                                    break;
                            }
                        } else {
                            toastr.error('Data save failed. Please try again or check your internet connection.', 'Save Error');
                        }
                    });
                }
            } else {
                toastr.error('No data to save. Please check for valid MatchID.', 'Save Error');
            }
        }
        // SAVE RESULT END
    $scope.updateWinnerResult = function() {
            $scope.matchResult = {
                matchId: $scope.matchData.matchId
            }
            switch ($scope.matchDetails.sportsName) {
                case "Football":
                    $scope.matchResult.resultFootball = $scope.formData;
                    $scope.matchResult.resultFootball.status = "IsCompleted";
                    break;
                case "Racquet Sports":
                    $scope.matchResult.resultsRacquet = $scope.formData;
                    $scope.matchResult.resultsRacquet.status = "IsCompleted";
                    break;
            }
            NavigationService.saveMatch($scope.matchResult, function(data) {
                if (data.value == true) {
                    if ($stateParams.drawFormat === 'Knockout') {
                        $state.go('knockout', {
                            drawFormat: $stateParams.drawFormat,
                            id: $stateParams.sport
                        });
                    } else if ($stateParams.drawFormat === 'Heats') {
                        $state.go('heats', {
                            drawFormat: $stateParams.drawFormat,
                            id: $stateParams.sport
                        });
                    }
                } else {
                    toastr.error('Match save failed. Please try again', 'Scoring Save Failed');
                }
            });
        }
        // SAVE WINNER
    $scope.saveWinner = function() {
            console.log($scope.formData, 'savedata');
            if ($scope.matchDetails.players.length == 1) {
                $scope.formData.winner.reason = 'Bye';
                $scope.updateWinnerResult();
            } else {
                if ($scope.formData.players[0].noShow == true && $scope.formData.players[1].noShow == true) {
                    $scope.formData.isNoMatch = true;
                    $scope.formData.winner = {};
                    $scope.formData.winner.player = "";
                    $scope.updateWinnerResult();
                } else {
                    $scope.formData.isNoMatch = false;
                    if ($scope.formData.winner.player == "" || !$scope.formData.winner.player) {
                        toastr.warning('Please select a winner');
                    } else {
                        _.each($scope.formData.players, function(n) {
                            if ($scope.formData.winner.player == n.player) {
                                n.walkover = true;
                                n.noShow = false;
                            } else {
                                n.walkover = false;
                                n.noShow = true;
                            }
                        })
                        $scope.updateWinnerResult();
                    }
                }
            }
        }
        // SAVE WINNER  END
        // SAVE TEAM WINNER
    $scope.updateTeamWinner = function() {
        $scope.matchResult = {
            matchId: $scope.matchData.matchId
        }
        switch ($scope.matchDetails.sportsName) {
            case "Football":
                $scope.matchResult.resultFootball = $scope.formData;
                $scope.matchResult.resultFootball.status = "IsCompleted";
                break;
            case "Volleyball":
                $scope.matchResult.resultVolleyball = $scope.formData;
                $scope.matchResult.resultVolleyball.status = "IsCompleted";
                break;
        }
        switch ($scope.matchDetails.sportsName) {
            case "Volleyball":
                NavigationService.saveMatch($scope.matchResult, function(data) {
                    if (data.value == true) {
                        if ($stateParams.drawFormat === 'Knockout') {
                            $state.go('knockout', {
                                drawFormat: $stateParams.drawFormat,
                                id: $stateParams.sport
                            });
                        } else if ($stateParams.drawFormat === 'Heats') {
                            $state.go('heats', {
                                drawFormat: $stateParams.drawFormat,
                                id: $stateParams.sport
                            });
                        }
                    } else {
                        toastr.error('Match save failed. Please try again', 'Scoring Save Failed');
                    }
                });
                break;
            case "Football":
                toatsr.success('Football Api Call');
                break;
        }
    }
    $scope.saveTeamWinner = function() {
            if ($scope.matchDetails.teams.length == 1) {
                $scope.formData.winner.reason = 'Bye';
                $scope.updateTeamWinner();
            } else {
                if ($scope.formData.teams[0].noShow == true && $scope.formData.teams[1].noShow == true) {
                    $scope.formData.isNoMatch = true;
                    $scope.formData.winner = {};
                    $scope.formData.winner.player = "";
                    $scope.updateTeamWinner();
                } else {
                    $scope.formData.isNoMatch = false;
                    if ($scope.formData.winner.player == "" || !$scope.formData.winner.player) {
                        toastr.warning('Please select a winner');
                    } else {
                        _.each($scope.formData.teams, function(n) {
                            if ($scope.formData.winner.player == n.team) {
                                n.walkover = true;
                                n.noShow = false;
                            } else {
                                n.walkover = false;
                                n.noShow = true;
                            }
                        });
                        $scope.updateTeamWinner();
                    }
                }
            }
        }
        // SAVE TEAM WINNER END
        // INTEGRATION END

    // OPEN MATCH-NO MATCH MODAL
    $scope.showNoMatch = function() {
            if ($scope.formData) {
                if ($scope.matchDetails.isTeam == false) {
                    $uibModal.open({
                        animation: true,
                        scope: $scope,
                        backdrop: 'static',
                        keyboard: false,
                        templateUrl: 'views/modal/match-nomatch.html',
                        size: 'lg',
                        windowClass: 'match-nomatch'
                    })
                } else if ($scope.matchDetails.isTeam == true) {
                    $uibModal.open({
                        animation: true,
                        scope: $scope,
                        backdrop: 'static',
                        keyboard: false,
                        templateUrl: 'views/modal/team-match-nomatch.html',
                        size: 'lg',
                        windowClass: 'match-nomatch'
                    })
                }

            } else {
                toastr.error('No player data to enter.', 'Error');
            }

        }
        // OPEN MATCH-NO MATCH MODAL

})
