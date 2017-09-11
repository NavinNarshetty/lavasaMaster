myApp.controller('BasketballScoreCtrl', function ($scope, TemplateService, NavigationService, $timeout, $uibModal, $stateParams, $state, $interval, toastr) {
  $scope.template = TemplateService.getHTML("content/scorebasketball.html");
  TemplateService.title = "Score Basketball"; //This is the Title of the Website
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
    var playerScoreModal;
    playerScoreModal = $uibModal.open({
      animation: true,
      scope: $scope,
      // backdrop: 'static',
      keyboard: false,
      size: 'lg',
      templateUrl: 'views/modal/scoreplayer-basketball.html',
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
    }
    console.log(point, 'inTP');
  };
  // TEAM SCORE INCREMENT END

  // PLAYER SCORE DECREMENT
  $scope.decrementPlayerPoint = function (player, point) {
    $scope.player = player;
    switch (point) {
      case 'freeThrow':
        if ($scope.player.playerPoints.freeThrow.length > 0) {
          var length = $scope.player.playerPoints.freeThrow.length - 1;
          _.remove($scope.player.playerPoints.freeThrow, function (m, index) {
            return length == index;
          })
        }
        break;
      case 'Points2':
        if ($scope.player.playerPoints.Points2.length > 0) {
          var length = $scope.player.playerPoints.Points2.length - 1;
          _.remove($scope.player.playerPoints.Points2, function (m, index) {
            return length == index;
          })
        }
        break;
      case 'Points3':
        if ($scope.player.playerPoints.Points3.length > 0) {
          var length = $scope.player.playerPoints.Points3.length - 1;
          _.remove($scope.player.playerPoints.Points3, function (m, index) {
            return length == index;
          })
        }
        break;
      case 'personalFoul':
        if ($scope.player.playerPoints.personalFoul.length > 0) {
          var length = $scope.player.playerPoints.personalFoul.length - 1;
          _.remove($scope.player.playerPoints.personalFoul, function (m, index) {
            return length == index;
          })
        }
        break;
      case 'technicalFoul':
        if ($scope.player.playerPoints.technicalFoul.length > 0) {
          var length = $scope.player.playerPoints.technicalFoul.length - 1;
          _.remove($scope.player.playerPoints.technicalFoul, function (m, index) {
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
      case 'freeThrow':
        $scope.player.playerPoints.freeThrow.push({
          time: 0
        });
        break;
      case 'Points2':
        $scope.player.playerPoints.Points2.push({
          time: 0
        });
        break;
      case 'Points3':
        $scope.player.playerPoints.Points3.push({
          time: 0
        });
        break;
      case 'personalFoul':
        $scope.player.playerPoints.personalFoul.push({
          time: 0
        });
        break;
      case 'technicalFoul':
        $scope.player.playerPoints.technicalFoul.push({
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
        _.remove($scope.match.resultBasketball.matchPhoto, function (n) {
          return n.image === pic.image;
        })
        break;
      case 'scoreSheet':
        _.remove($scope.match.resultBasketball.scoreSheet, function (n) {
          return n.image === pic.image;
        })
        break;
    }
  }
  // REMOVE MATCH SCORESHEET END
  // JSON
  $scope.match = {
    matchId: '123456',
    sportsName: 'Basketball',
    age: 'u-11',
    gender: 'female',
    round: 'final',
    minPlayers: 4,
    resultBasketball: {
      teams: [{
        teamId: '987654',
        teamResults: {
          quarterPoints: [{
            basket: 20,
          }, {
            basket: 20,
          }, {
            basket: 20,
          }, {
            basket: 20,
          }],
          finalGoalPoints: 22,
        },
        players: [{
          name: 'hello',
          isPlaying: true,
          jerseyNo: 1,
          noShow: true,
          walkover: true,
          color: "Blue/Red",
          playerPoints: {
            freeThrow: [{
              count: 1,
              time: 11
            }],
            Points2: [{
              count: 1,
              time: 11

            }],
            Points3: [{
              count: 1,
              time: 11
            }],
            personalFoul: [{
              count: 1,
              time: 11
            }],
            technicalFoul: [{
              count: 1,
              time: 11
            }],
          }
        }, {
          name: 'hello',
          isPlaying: true,
          jerseyNo: 1,
          noShow: true,
          walkover: true,
          color: "Blue/Red",
          playerPoints: {
            freeThrow: [{
              count: 1,
              time: 11
            }],
            Points2: [{
              count: 1,
              time: 11

            }],
            Points3: [{
              count: 1,
              time: 11
            }],
            personalFoul: [{
              count: 1,
              time: 11
            }],
            technicalFoul: [{
              count: 1,
              time: 11
            }],
          }
        }, {
          name: 'hello',
          isPlaying: false,
          jerseyNo: 1,
          noShow: true,
          walkover: true,
          color: "Blue/Red",
          playerPoints: {
            freeThrow: [{
              count: 1,
              time: 11
            }],
            Points2: [{
              count: 1,
              time: 11

            }],
            Points3: [{
              count: 1,
              time: 11
            }],
            personalFoul: [{
              count: 1,
              time: 11
            }],
            technicalFoul: [{
              count: 1,
              time: 11
            }],
          }
        }]
      }, {
        teamId: '124358',
        teamResults: {
          quarterPoints: [{
            basket: 20,
          }, {
            basket: 20,
          }, {
            basket: 20,
          }, {
            basket: 20,
          }],
          finalGoalPoints: 22,
        },
        players: [{
          name: 'hello',
          isPlaying: false,
          jerseyNo: 1,
          noShow: true,
          walkover: true,
          color: "Blue/Red",
          playerPoints: {
            freeThrow: [{
              count: 1,
              time: 11
            }],
            Points2: [{
              count: 1,
              time: 11

            }],
            Points3: [{
              count: 1,
              time: 11
            }],
            personalFoul: [{
              count: 1,
              time: 11
            }],
            technicalFoul: [{
              count: 1,
              time: 11
            }],
          }
        }, {
          name: 'hello',
          isPlaying: true,
          jerseyNo: 1,
          noShow: true,
          walkover: true,
          color: "Blue/Red",
          playerPoints: {
            freeThrow: [{
              count: 1,
              time: 11
            }],
            Points2: [{
              count: 1,
              time: 11

            }],
            Points3: [{
              count: 1,
              time: 11
            }],
            personalFoul: [{
              count: 1,
              time: 11
            }],
            technicalFoul: [{
              count: 1,
              time: 11
            }],
          }
        }, {
          name: 'hello',
          isPlaying: true,
          jerseyNo: 1,
          noShow: true,
          walkover: true,
          color: "Blue/Red",
          playerPoints: {
            freeThrow: [{
              count: 1,
              time: 11
            }],
            Points2: [{
              count: 1,
              time: 11

            }],
            Points3: [{
              count: 1,
              time: 11
            }],
            personalFoul: [{
              count: 1,
              time: 11
            }],
            technicalFoul: [{
              count: 1,
              time: 11
            }],
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
});