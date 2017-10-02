myApp.controller('HandballScoreCtrl', function ($scope, TemplateService, NavigationService, $timeout, $uibModal, $stateParams, $state, $interval, toastr) {
  $scope.template = TemplateService.getHTML("content/scorehandball.html");
  TemplateService.title = "Score Hockey"; //This is the Title of the Website
  $scope.navigation = NavigationService.getNavigation();


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
    // console.log(player, "hhh")s
    var playerScoreModal;
    playerScoreModal = $uibModal.open({
      animation: true,
      scope: $scope,
      // backdrop: 'static',
      keyboard: false,
      size: 'lg',
      templateUrl: 'views/modal/scoreplayer-handball.html',
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
      case 'shotsOnGoal':
        $scope.team.teamResults.shotsOnGoal = $scope.team.teamResults.shotsOnGoal + 1;
        break;
      case 'penalty':
        $scope.team.teamResults.penalty = $scope.team.teamResults.penalty + 1;
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
      case 'goal':
        if ($scope.player.playerPoints.goal.length > 0) {
          var length = $scope.player.playerPoints.goal.length - 1;
          _.remove($scope.player.playerPoints.goal, function (m, index) {
            return length == index;
          })
        }
        break;
      case 'yellowCard':
        if ($scope.player.playerPoints.yellowCard.length > 0) {
          var length = $scope.player.playerPoints.yellowCard.length - 1;
          _.remove($scope.player.playerPoints.yellowCard, function (m, index) {
            return length == index;
          })
        }
        break;
      case 'greenCard':
        if ($scope.player.playerPoints.greenCard.length > 0) {
          var length = $scope.player.playerPoints.greenCard.length - 1;
          _.remove($scope.player.playerPoints.greenCard, function (m, index) {
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
    }
    console.log('dePP');
  };
  // PLAYER SCORE DECREMENT END
  // PLAYER SCORE INCREMENT
  $scope.incrementPlayerPoint = function (player, point) {
    $scope.player = player;
    switch (point) {
      case 'goal':
        $scope.player.playerPoints.goal.push({
          time: 0
        });
        break;
      case 'yellowCard':
        $scope.player.playerPoints.yellowCard.push({
          time: 0
        });
        break;
      case 'greenCard':
        $scope.player.playerPoints.greenCard.push({
          time: 0
        });
        break;
      case 'in':
        $scope.player.playerPoints.in.push({
          time: 0
        });
        break;
      case 'out':
        $scope.player.playerPoints.out.push({
          time: 0
        });
        $scope.player.isPlaying = true;
        break;
    }
    console.log('inPP');
  };
  // PLAYER SCORE INCREMENT END

  // REMOVE MATCH SCORESHEET
  $scope.removeMatchScore = function (pic, type) {
    switch (type) {
      case 'matchPhoto':
        _.remove($scope.match.resultHandball.matchPhoto, function (n) {
          return n.image === pic.image;
        })
        break;
      case 'scoreSheet':
        _.remove($scope.match.resultHandball.scoreSheet, function (n) {
          return n.image === pic.image;
        })
        break;
    }
  }
  // REMOVE MATCH SCORESHEET END

  // PENALTY SHOOTOUTS MODAL
  $scope.startPenalty = function () {
    var teamPenaltyModal;
    teamPenaltyModal = $uibModal.open({
      animation: true,
      scope: $scope,
      backdrop: 'static',
      keyboard: false,
      size: 'lg',
      templateUrl: 'views/modal/penaltyshootouts.html',
      windowClass: 'penaltyshootouts-modal'
    })
  }
  // PENALTY SHOOTOUTS MODAL END
  // JSON
  $scope.match = {
    matchId: '123456',
    sportsName: 'Handball',
    age: 'u-11',
    gender: 'female',
    round: 'final',
    minPlayers: 4,
    resultHandball: {
      teams: [{
        teamId: '987654',
        teamResults: {
          goalPoints: [{
            goal: 20,
          }],
          finalGoalPoints: 22,
          shotsOnGoal: 2,
          penalty: 10,
          saves: 1,
        },
        players: [{
          name: 'hello',
          isPlaying: true,
          jerseyNo: 1,
          noShow: true,
          walkover: true,
          color: "Blue/Red",
          playerPoints: {
            goal: [{
              points: 1,
              time: 11
            }],
            yellowCard: [{
              time: 11
            }],
            greenCard: [{
              time: 11
            }],
            in: [{
              time: 11
            }],
            out: [{
              time: 11
            }]
          }
        }, {
          name: 'hello',
          isPlaying: true,
          jerseyNo: 1,
          noShow: true,
          walkover: true,
          color: "Blue/Red",
          playerPoints: {
            goal: [{
              points: 1,
              time: 11
            }],
            yellowCard: [{
              time: 11
            }],
            greenCard: [{
              time: 11
            }],
            in: [{
              time: 11
            }],
            out: [{
              time: 11
            }]
          }
        }, {
          name: 'hello',
          isPlaying: false,
          jerseyNo: 1,
          noShow: true,
          walkover: true,
          color: "Blue/Red",
          playerPoints: {
            goal: [{
              points: 1,
              time: 11
            }],
            yellowCard: [{
              time: 11
            }],
            greenCard: [{
              time: 11
            }],
            in: [{
              time: 11
            }],
            out: [{
              time: 11
            }]
          }
        }]
      }, {
        teamId: '124358',
        teamResults: {
          goalPoints: [{
            goal: 20,
          }],
          finalGoalPoints: 22,
          shotsOnGoal: 2,
          penalty: 10,
          saves: 1,
        },
        players: [{
          name: 'hello',
          isPlaying: false,
          jerseyNo: 1,
          noShow: true,
          walkover: true,
          color: "Blue/Red",
          playerPoints: {
            goal: [{
              points: 1,
              time: 11
            }],
            yellowCard: [{
              time: 11
            }],
            greenCard: [{
              time: 11
            }],
            in: [{
              time: 11
            }],
            out: [{
              time: 11
            }]
          }
        }, {
          name: 'hello',
          isPlaying: true,
          jerseyNo: 1,
          noShow: true,
          walkover: true,
          color: "Blue/Red",
          playerPoints: {
            goal: [{
              points: 1,
              time: 11
            }],
            yellowCard: [{
              time: 11
            }],
            greenCard: [{
              time: 11
            }],
            in: [{
              time: 11
            }],
            out: [{
              time: 11
            }]
          }
        }, {
          name: 'hello',
          isPlaying: true,
          jerseyNo: 1,
          noShow: true,
          walkover: true,
          color: "Blue/Red",
          playerPoints: {
            goal: [{
              points: 1,
              time: 11
            }],
            yellowCard: [{
              time: 11
            }],
            greenCard: [{
              time: 11
            }],
            in: [{
              time: 11
            }],
            out: [{
              time: 11
            }]
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
})