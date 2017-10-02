myApp.controller('KabaddiScoreCtrl', function ($scope, TemplateService, NavigationService, $timeout, $uibModal, $stateParams, $state, $interval, toastr) {
  $scope.template = TemplateService.getHTML("content/scorekabaddi.html");
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
      templateUrl: 'views/modal/scoreplayer-kabaddi.html',
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
      case 'superTackle':
        if ($scope.team.teamResults.superTackle > 0) {
          $scope.team.teamResults.superTackle = $scope.team.teamResults.superTackle - 1;
        }
        break;
      case 'allOut':
        if ($scope.team.teamResults.allOut > 0) {
          $scope.team.teamResults.allOut = $scope.team.teamResults.allOut - 1;
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
      case 'superTackle':
        $scope.team.teamResults.superTackle = $scope.team.teamResults.superTackle + 1;
        break;
      case 'allOut':
        $scope.team.teamResults.allOut = $scope.team.teamResults.allOut + 1;
        break;
    }
    console.log(point, 'inTP');
  };
  // TEAM SCORE INCREMENT END

  // PLAYER SCORE DECREMENT
  $scope.decrementPlayerPoint = function (player, point) {
    $scope.player = player;
    switch (point) {
      case 'raids':
        if ($scope.player.playerPoints.raids.length > 0) {
          var length = $scope.player.playerPoints.raids.length - 1;
          _.remove($scope.player.playerPoints.raids, function (m, index) {
            return length == index;
          })
        }
        break;
      case 'bonusPoint':
        if ($scope.player.playerPoints.bonusPoint.length > 0) {
          var length = $scope.player.playerPoints.bonusPoint.length - 1;
          _.remove($scope.player.playerPoints.bonusPoint, function (m, index) {
            return length == index;
          })
        }
        break;
      case 'superRaid':
        if ($scope.player.playerPoints.superRaid.length > 0) {
          var length = $scope.player.playerPoints.superRaid.length - 1;
          _.remove($scope.player.playerPoints.superRaid, function (m, index) {
            return length == index;
          })
        }
        break;
      case 'tackle':
        if ($scope.player.playerPoints.tackle.length > 0) {
          var length = $scope.player.playerPoints.tackle.length - 1;
          _.remove($scope.player.playerPoints.tackle, function (m, index) {
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
      case 'raids':
        $scope.player.playerPoints.raids.push({
          time: 0
        });
        break;
      case 'bonusPoint':
        $scope.player.playerPoints.bonusPoint.push({
          time: 0
        });
        break;
      case 'superRaid':
        $scope.player.playerPoints.superRaid.push({
          time: 0
        });
        break;
      case 'tackle':
        $scope.player.playerPoints.tackle.push({
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
        _.remove($scope.match.resultKabaddi.matchPhoto, function (n) {
          return n.image === pic.image;
        })
        break;
      case 'scoreSheet':
        _.remove($scope.match.resultKabaddi.scoreSheet, function (n) {
          return n.image === pic.image;
        })
        break;
    }
  }
  // REMOVE MATCH SCORESHEET END
  // JSON
  $scope.match = {
    matchId: '123456',
    sportsName: 'KAbaddi',
    age: 'u-11',
    gender: 'female',
    round: 'final',
    minPlayers: 4,
    resultKabaddi: {
      teams: [{
        teamId: '987654',
        teamResults: {
          halfPoints: 10,
          finalPoints: 22,
          finalGoalPoints: 22,
          superTackle: 1,
          allOut: 1
        },
        players: [{
          name: 'hello',
          isPlaying: true,
          jerseyNo: 1,
          noShow: true,
          walkover: true,
          color: "Blue/Red",
          playerPoints: {
            raids: [{
              count: 1,
              time: 11
            }],
            bonusPoint: [{
              count: 1,
              time: 11
            }],
            superRaid: [{
              count: 1,
              time: 11
            }],
            tackle: [{
              count: 1,
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
            raids: [{
              count: 1,
              time: 11
            }],
            bonusPoint: [{
              count: 1,
              time: 11
            }],
            superRaid: [{
              count: 1,
              time: 11
            }],
            tackle: [{
              count: 1,
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
            raids: [{
              count: 1,
              time: 11
            }],
            bonusPoint: [{
              count: 1,
              time: 11
            }],
            superRaid: [{
              count: 1,
              time: 11
            }],
            tackle: [{
              count: 1,
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
          halfPoints: 10,
          finalPoints: 22,
          finalGoalPoints: 22,
          superTackle: 1,
          allOut: 1
        },
        players: [{
          name: 'hello',
          isPlaying: false,
          jerseyNo: 1,
          noShow: true,
          walkover: true,
          color: "Blue/Red",
          playerPoints: {
            raids: [{
              count: 1,
              time: 11
            }],
            bonusPoint: [{
              count: 1,
              time: 11
            }],
            superRaid: [{
              count: 1,
              time: 11
            }],
            tackle: [{
              count: 1,
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
            raids: [{
              count: 1,
              time: 11
            }],
            bonusPoint: [{
              count: 1,
              time: 11
            }],
            superRaid: [{
              count: 1,
              time: 11
            }],
            tackle: [{
              count: 1,
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
            raids: [{
              count: 1,
              time: 11
            }],
            bonusPoint: [{
              count: 1,
              time: 11
            }],
            superRaid: [{
              count: 1,
              time: 11
            }],
            tackle: [{
              count: 1,
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