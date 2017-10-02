myApp.controller('WaterPoloScoreCtrl', function ($scope, TemplateService, NavigationService, $timeout, $uibModal, $stateParams, $state, $interval, toastr, $rootScope) {
    $scope.template = TemplateService.getHTML("content/scorewaterpolo.html");
    TemplateService.title = "Score Football"; //This is the Title of the Website
    $scope.navigation = NavigationService.getNavigation();
    // ************

    // SELECT TEAM
    $scope.selectTeam = function (result) {
        $scope.result = result;
        var teamSelection;
        teamSelection = $uibModal.open({
            animation: true,
            scope: $scope,
            // backdrop: 'static',
            // keyboard: false,
            size: 'lg',
            templateUrl: 'views/modal/teamselection-modal.html',
            windowClass: 'teamselection-modal'
        })
    }
    // SELECT TEAM END

    // PLAYER POINTS MODAL
    $scope.addPlayerPoints = function (player, index) {
        $scope.selectedPlayer = player;
        var playerScoreModal;
        playerScoreModal = $uibModal.open({
            animation: true,
            scope: $scope,
            // backdrop: 'static',
            keyboard: false,
            size: 'lg',
            templateUrl: 'views/modal/scoreplayer-waterpolo.html',
            windowClass: 'scoreplayer-football-modal'
        })
    }
    // PLAYER POINTS MODAL END

    // TEAM SCORE DECREMENT
    $scope.decrementTeamPoint = function (team, point) {
        $scope.team = team;
        switch (point) {
            case 'finalGoalPoints':
                if ($scope.team.teamResults.finalGoalPoints > 0) {
                    $scope.team.teamResults.finalGoalPoints = $scope.team.teamResults.finalGoalPoints - 1;
                }
                break;
            case 'totalShots':
                if ($scope.team.teamResults.totalShots > 0) {
                    $scope.team.teamResults.totalShots = $scope.team.teamResults.totalShots - 1;
                }
                break;
            case 'shotsOnGoal':
                if ($scope.team.teamResults.shotsOnGoal > 0) {
                    $scope.team.teamResults.shotsOnGoal = $scope.team.teamResults.shotsOnGoal - 1;
                }
                break;
            case 'penalty':
                if ($scope.team.teamResults.penalty > 0) {
                    $scope.team.teamResults.penalty = $scope.team.teamResults.penalty - 1;
                }
                break;
            case 'penaltyPoints':
                if ($scope.team.teamResults.penaltyPoints > 0) {
                    $scope.team.teamResults.penaltyPoints = $scope.team.teamResults.penaltyPoints - 1;
                }
                break;
            case 'saves':
                if ($scope.team.teamResults.saves > 0) {
                    $scope.team.teamResults.saves = $scope.team.teamResults.saves - 1;
                }
                break;
        }
        console.log(point, 'deTP');
    };
    // TEAM SCORE DECREMENT END

    // TEAM SCORE INCREMENT
    $scope.incrementTeamPoint = function (team, point) {
        $scope.team = team;
        switch (point) {
            case 'finalGoalPoints':
                $scope.team.teamResults.finalGoalPoints = $scope.team.teamResults.finalGoalPoints + 1;
                break;
            case 'totalShots':
                $scope.team.teamResults.totalShots = $scope.team.teamResults.totalShots + 1;
                break;
            case 'shotsOnGoal':
                $scope.team.teamResults.shotsOnGoal = $scope.team.teamResults.shotsOnGoal + 1;
                break;
            case 'penalty':
                $scope.team.teamResults.penalty = $scope.team.teamResults.penalty + 1;
                break;
            case 'penaltyPoints':
                $scope.team.teamResults.penaltyPoints = $scope.team.teamResults.penaltyPoints + 1;
                break;
            case 'saves':
                $scope.team.teamResults.saves = $scope.team.teamResults.saves + 1;
                break;
        }
        console.log(point, 'inTP');
    };
    // TEAM SCORE INCREMENT END

    // PLAYER SCORE DECREMENT
    $scope.decrementPlayerPoint = function (player, point) {
        $scope.player = player;
        switch (point) {
            case 'goals':
                if ($scope.player.playerPoints.goals.length > 0) {
                    var length = $scope.player.playerPoints.goals.length - 1;
                    _.remove($scope.player.playerPoints.goals, function (m, index) {
                        return length == index;
                    })
                }
                break;
            case 'in':
                if ($scope.player.playerPoints.in.length > 0) {
                    var length = $scope.player.playerPoints.in.length - 1;
                    _.remove($scope.player.playerPoints.in, function (m, index) {
                        return length == index;
                    })
                }
                break;
            case 'out':
                if ($scope.player.playerPoints.out.length > 0) {
                    var length = $scope.player.playerPoints.out.length - 1;
                    _.remove($scope.player.playerPoints.out, function (m, index) {
                        return length == index;
                    })
                }
                break;
            case 'penaltyPoint':
                if ($scope.player.playerPoints.penaltyPoint > 0) {
                    $scope.player.playerPoints.penaltyPoint = $scope.player.playerPoints.penaltyPoint - 1;
                }
                break;
        }
        console.log('dePP');
    };
    // PLAYER SCORE DECREMENT END
    // PLAYER SCORE INCREMENT
    $scope.incrementPlayerPoint = function (player, point) {
        $scope.player = player;
        switch (point) {
            case 'goals':
                $scope.player.playerPoints.goals.push({
                    time: 0
                });
                break;
            case 'in':
                $scope.player.playerPoints.in.push({
                    time: 0
                });
                $scope.player.isPlaying = true;
                break;
            case 'out':
                $scope.player.playerPoints.out.push({
                    time: 0
                });
                $scope.player.isPlaying = false;
                break;
            case 'penaltyPoint':
                $scope.player.playerPoints.penaltyPoint = $scope.player.penaltyPoint + 1;
                break;
        }
        console.log('inPP');
    };
    // PLAYER SCORE INCREMENT END

    // REMOVE MATCH SCORESHEET
    $scope.removeMatchScore = function (pic, type) {
        switch (type) {
            case 'matchPhoto':
                _.remove($scope.match.resultWaterPolo.matchPhoto, function (n) {
                    return n.image === pic.image;
                })
                break;
            case 'scoreSheet':
                _.remove($scope.match.resultWaterPolo.scoreSheet, function (n) {
                    return n.image === pic.image;
                })
                break;
        }
    }
    // REMOVE MATCH SCORESHEET END
    // MATCH COMPLETE END
    // API CALLS END
    // JSON
    $scope.match = {
        matchId: '123456',
        sportsName: 'Water Polo',
        age: 'u-11',
        gender: 'male',
        round: 'final',
        minPlayers: 7,
        resultWaterPolo: {
            teams: [{
                teamId: '987654',
                teamResults: {
                    quarterPoints: [{
                        goal: 20,
                    }, {
                        goal: 20,
                    }, {
                        goal: 20,
                    }, {
                        goal: 20,
                    }],
                    finalGoalPoints: 22,
                    shotsOnGoal: 2,
                    totalShots: 2,
                    penaltyPoints: 10,
                    penalty: 0,
                    saves: 1
                },
                players: [{
                    name: 'hello',
                    isPlaying: true,
                    jerseyNo: 1,
                    playerPoints: {
                        goals: [],
                        penaltyPoint: 0,
                        in: [],
                        out: []
                    }
                }, {
                    name: 'hello',
                    isPlaying: true,
                    jerseyNo: 1,
                    playerPoints: {
                        goals: [],
                        penaltyPoint: 0,
                        in: [],
                        out: []
                    }
                }, {
                    name: 'hello',
                    isPlaying: false,
                    jerseyNo: 1,
                    playerPoints: {
                        goals: [],
                        penaltyPoint: 0,
                        in: [],
                        out: []
                    }
                }, {
                    name: 'hello',
                    isPlaying: true,
                    jerseyNo: 1,
                    playerPoints: {
                        goals: [],
                        penaltyPoint: 0,
                        in: [],
                        out: []
                    }
                }, {
                    name: 'hello',
                    isPlaying: false,
                    jerseyNo: 1,
                    playerPoints: {
                        goals: [],
                        penaltyPoint: 0,
                        in: [],
                        out: []
                    }
                }]
            }, {
                teamId: '54321',
                teamResults: {
                    quarterPoints: [{
                        goal: 20,
                    }, {
                        goal: 20,
                    }, {
                        goal: 20,
                    }, {
                        goal: 20,
                    }],
                    finalGoalPoints: 22,
                    shotsOnGoal: 2,
                    totalShots: 2,
                    penaltyPoints: 10,
                    penalty: 0,
                    saves: 1
                },
                players: [{
                    name: 'hello',
                    isPlaying: false,
                    jerseyNo: 1,
                    playerPoints: {
                        goals: [],
                        penaltyPoint: 0,
                        in: [],
                        out: []
                    }
                }, {
                    name: 'hello',
                    isPlaying: true,
                    jerseyNo: 1,
                    playerPoints: {
                        goals: [],
                        penaltyPoint: 0,
                        in: [],
                        out: []
                    }
                }, {
                    name: 'hello',
                    isPlaying: false,
                    jerseyNo: 1,
                    playerPoints: {
                        goals: [],
                        penaltyPoint: 0,
                        in: [],
                        out: []
                    }
                }, {
                    name: 'hello',
                    isPlaying: false,
                    jerseyNo: 1,
                    playerPoints: {
                        goals: [],
                        penaltyPoint: 0,
                        in: [],
                        out: []
                    }
                }, {
                    name: 'hello',
                    isPlaying: true,
                    jerseyNo: 1,
                    playerPoints: {
                        goals: [],
                        penaltyPoint: 0,
                        in: [],
                        out: []
                    }
                }]
            }],
            isNoMatch: true,
            isDraw: true,
            winnner: [{
                team: 12211,
                reason: "",
            }],
            matchPhoto: ["6732673862837342323423.jpg"],
            status: "IsLive,IsPending,IsCompleted",
            scoreSheet: ["588372837289379283789.jpg"]
        },
        teams: [{
                schoolName: 'jamnabai narsee school',
                teamId: '987654',
                players: [{
                    firstName: 'Jaiviraj singh rajputrajput singh'
                }, {
                    firstName: 'hello2'
                }, {
                    firstName: 'hello3'
                }, {
                    firstName: 'hello4'
                }, {
                    firstName: 'hello5'
                }]
            },
            {
                schoolName: 'Marvel iron high school',
                teamId: '54321',
                players: [{
                    firstName: 'hello6'
                }, {
                    firstName: 'hello7'
                }, {
                    firstName: 'hello8'
                }, {
                    firstName: 'hello9'
                }, {
                    firstName: 'hello10'
                }]
            }
        ]
    }
    // JSON END

    // ************
})