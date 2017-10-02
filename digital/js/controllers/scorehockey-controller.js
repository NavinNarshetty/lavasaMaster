myApp.controller('HockeyScoreCtrl', function($scope, TemplateService, NavigationService, $timeout, $uibModal, $stateParams, $state, $interval, toastr) {
    $scope.template = TemplateService.getHTML("content/scorehockey.html");
    TemplateService.title = "Score Hockey"; //This is the Title of the Website
    $scope.navigation = NavigationService.getNavigation();
    // ************

    // INITIALISE VARIABLES
    $scope.match = {};
    // INITIALISE VARIABLES END

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

    // FUNCTIONS
    // SELECT TEAM
    $scope.selectTeam = function(result){
      $scope.result = result;
      var teamSelection;
      teamSelection = $uibModal.open({
        animation: true,
        scope: $scope,
        backdrop: 'static',
        keyboard: false,
        size: 'lg',
        templateUrl: 'views/modal/teamselection-modal.html',
        windowClass: 'teamselection-modal'
      })
    }
    // SELECT TEAM END
    // SELECT PLAYING
    $scope.selectPlaying = function(team, player){
      console.log('isPlaying');
      $scope.isPlayer = player;
      $scope.playingTeam = team;
      var playingCount = 0;
      if($scope.isPlayer.isPlaying == false){
        _.each($scope.playingTeam.players,function(n){
          if(n.isPlaying == true){
            playingCount = playingCount + 1;
          }
        });
        if(playingCount <  $scope.match.minPlayers){
          if($scope.isPlayer.isPlaying == true){
            $scope.isPlayer.isPlaying = false;
          } else{
            $scope.isPlayer.isPlaying = true;
          }
        } else {
          toastr.warning('Maximum players selected');
        }
      } else {
        if($scope.isPlayer.isPlaying == true){
          $scope.isPlayer.isPlaying = false;
        } else{
          $scope.isPlayer.isPlaying = true;
        }
      }
      console.log(playingCount, 'playingCount');
      console.log($scope.isPlayer, 'playa');
    }
    // SELECT PLAYING END
    // TEAM SCORE INCREMENT
    $scope.incrementTeamPoint = function(team, point){
      $scope.team = team;
      switch (point) {
        case 'totalShots':
          $scope.team.teamResults.totalShots = $scope.team.teamResults.totalShots + 1;
        break;
        case 'shotsOnGoal':
          $scope.team.teamResults.shotsOnGoal = $scope.team.teamResults.shotsOnGoal + 1;
        break;
        case 'penaltyCorners':
          $scope.team.teamResults.penaltyCorners = $scope.team.teamResults.penaltyCorners + 1;
        break;
        case 'penaltyPoints':
          $scope.team.teamResults.penaltyPoints = $scope.team.teamResults.penaltyPoints + 1;
        break;
        case 'saves':
          $scope.team.teamResults.saves = $scope.team.teamResults.saves + 1;
        break;
        case 'fouls':
          $scope.team.teamResults.fouls = $scope.team.teamResults.fouls + 1;
        break;
        case 'penaltyStroke':
          $scope.team.teamResults.penaltyStroke = $scope.team.teamResults.penaltyStroke + 1;
        break;
      }
      console.log(point,'inTP');
    };
    // TEAM SCORE INCREMENT END
    // TEAM SCORE DECREMENT
    $scope.decrementTeamPoint = function(team, point){
      $scope.team = team;
      switch (point) {
        case 'totalShots':
          if ($scope.team.teamResults.totalShots>0) {
            $scope.team.teamResults.totalShots = $scope.team.teamResults.totalShots - 1;
          }
        break;
        case 'shotsOnGoal':
          if ($scope.team.teamResults.shotsOnGoal>0) {
            $scope.team.teamResults.shotsOnGoal = $scope.team.teamResults.shotsOnGoal - 1;
          }
        break;
        case 'penaltyCorners':
          if ($scope.team.teamResults.penaltyCorners>0) {
            $scope.team.teamResults.penaltyCorners = $scope.team.teamResults.penaltyCorners - 1;
          }
        break;
        case 'penaltyPoints':
          if ($scope.team.teamResults.penaltyPoints>0) {
            $scope.team.teamResults.penaltyPoints = $scope.team.teamResults.penaltyPoints - 1;
          }
        break;
        case 'saves':
          if ($scope.team.teamResults.saves>0) {
            $scope.team.teamResults.saves = $scope.team.teamResults.saves - 1;
          }
        break;
        case 'fouls':
          if ($scope.team.teamResults.fouls>0) {
            $scope.team.teamResults.fouls = $scope.team.teamResults.fouls - 1;
          }
        break;
        case 'penaltyStroke':
          if ($scope.team.teamResults.penaltyStroke>0) {
            $scope.team.teamResults.penaltyStroke = $scope.team.teamResults.penaltyStroke - 1;
          }
        break;
      }
      console.log(point,'deTP');
    };
    // TEAM SCORE DECREMENT END
    // PLAYER SCORE INCREMENT
    $scope.incrementPlayerPoint = function(player, point){
      $scope.player = player;
      switch (point) {
        case 'goals':
          $scope.player.playerPoints.goals.push({
            time: 0
          });
        break;
        case 'assist':
          $scope.player.playerPoints.assist.push({
            time: 0
          });
        break;
        case 'redCard':
          $scope.player.playerPoints.redCard.push({
            time: 0
          });
        break;
        case 'yellowCard':
          $scope.player.playerPoints.yellowCard.push({
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
          $scope.player.playerPoints.penaltyPoint =  $scope.player.penaltyPoint + 1;
        break;
      }
      console.log('inPP');
    };
    // PLAYER SCORE INCREMENT END
    // PLAYER SCORE DECREMENT
    $scope.decrementPlayerPoint = function(player,point){
      $scope.player = player;
      switch (point) {
        case 'goals':
          if ($scope.player.playerPoints.goals.length>0) {
            var length = $scope.player.playerPoints.goals.length -1;
            _.remove($scope.player.playerPoints.goals, function(m,index){
              return length == index;
            })
          }
        break;
        case 'assist':
          if ($scope.player.playerPoints.assist.length>0) {
            var length = $scope.player.playerPoints.assist.length -1;
            _.remove($scope.player.playerPoints.assist, function(m,index){
              return length == index;
            })
          }
        break;
        case 'redCard':
          if ($scope.player.playerPoints.redCard.length>0) {
            var length = $scope.player.playerPoints.redCard.length -1;
            _.remove($scope.player.playerPoints.redCard, function(m,index){
              return length == index;
            })
          }
        break;
        case 'yellowCard':
          if ($scope.player.playerPoints.yellowCard.length>0) {
            var length = $scope.player.playerPoints.yellowCard.length -1;
            _.remove($scope.player.playerPoints.yellowCard, function(m,index){
              return length == index;
            })
          }
        break;
        case 'in':
          if ($scope.player.playerPoints.in.length>0) {
            var length = $scope.player.playerPoints.in.length -1;
            _.remove($scope.player.playerPoints.in, function(m,index){
              return length == index;
            })
          }
        break;
        case 'out':
          if ($scope.player.playerPoints.out.length>0) {
            var length = $scope.player.playerPoints.out.length -1;
            _.remove($scope.player.playerPoints.out, function(m,index){
              return length == index;
            })
          }
        break;
        case 'penaltyPoint':
          if ($scope.player.playerPoints.penaltyPoint>0) {
            $scope.player.playerPoints.penaltyPoint = $scope.player.playerPoints.penaltyPoint - 1;
          }
        break;
      }
      console.log('dePP');
    };
    // PLAYER SCORE DECREMENT END
    // PLAYER POINTS MODAL
    $scope.addPlayerPoints = function(player, index){
      $scope.selectedPlayer = player;
      var playerScoreModal;
      playerScoreModal = $uibModal.open({
        animation: true,
        scope: $scope,
        // backdrop: 'static',
        keyboard: false,
        size: 'lg',
        templateUrl: 'views/modal/scoreplayer-football.html',
        windowClass: 'scoreplayer-football-modal'
      })
    }
    // PLAYER POINTS MODAL END
    // PENALTY SHOOTOUTS MODAL
    $scope.startPenalty = function(){
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
    // FUNCTIONS END
    // JSON
    $scope.match = {
      matchId: '123456',
      sportsName: 'Hockey',
      age: 'u-11',
      gender: 'female',
      round: 'final',
      minPlayers: 4,
      resultHockey:{
        teams:[{
          teamId: '987654',
          teamResults:{
          goalPoints:[{
                goal:20,
          }],
          finalGoalPoints:22,
          shotsOnGoal: 2,
          totalShots:2,
          penaltyPoints:10,
          penaltyCorners:2,
          penaltyStroke:1,
          saves:1,
          fouls:1,
          },
          players: [{
            name: 'hello',
            isPlaying: true,
            jerseyNo: 1,
            playerPoints: {
              goals: [],
              assist: [],
              redCard: [],
              yellowCard: [],
              penaltyPoint: 0,
              in: [],
              out: []
            }
          },{
            name: 'hello',
            isPlaying: true,
            jerseyNo: 1,
            playerPoints: {
              goals: [],
              redCard: [],
              yellowCard: [],
              penaltyPoint: 0,
              in: [],
              out: []
            }
          },{
            name: 'hello',
            isPlaying: false,
            jerseyNo: 1,
            playerPoints: {
              goals: [],
              assist: [],
              redCard: [],
              yellowCard: [],
              penaltyPoint: 0,
              in: [],
              out: []
            }
          },{
            name: 'hello',
            isPlaying: true,
            jerseyNo: 1,
            playerPoints: {
              goals: [],
              assist: [],
              redCard: [],
              yellowCard: [],
              penaltyPoint: 0,
              in: [],
              out: []
            }
          },{
            name: 'hello',
            isPlaying: false,
            jerseyNo: 1,
            playerPoints: {
              goals: [],
              assist: [],
              redCard: [],
              yellowCard: [],
              penaltyPoint: 0,
              in: [],
              out: []
            }
          }]
        },{
          teamId: '54321',
          teamResults:{
          goalPoints:[{
                goal:20,
          }],
          finalGoalPoints:22,
          shotsOnGoal: 2,
          totalShots:2,
          penaltyPoints:10,
          penaltyCorners:2,
          penaltyStroke:1,
          saves:1,
          fouls:1,
          },
          players: [{
            name: 'hello',
            isPlaying: false,
            jerseyNo: 1,
            playerPoints: {
              goals: [],
              assist: [],
              redCard: [],
              yellowCard: [],
              penaltyPoint: 0,
              in: [],
              out: []
            }
          },{
            name: 'hello',
            isPlaying: true,
            jerseyNo: 1,
            playerPoints: {
              goals: [],
              assist: [],
              redCard: [],
              yellowCard: [],
              penaltyPoint: 0,
              in: [],
              out: []
            }
          },{
            name: 'hello',
            isPlaying: false,
            jerseyNo: 1,
            playerPoints: {
              goals: [],
              assist: [],
              redCard: [],
              yellowCard: [],
              penaltyPoint: 0,
              in: [],
              out: []
            }
          },{
            name: 'hello',
            isPlaying: false,
            jerseyNo: 1,
            playerPoints: {
              goals: [],
              assist: [],
              redCard: [],
              yellowCard: [],
              penaltyPoint: 0,
              in: [],
              out: []
            }
          },{
            name: 'hello',
            isPlaying: true,
            jerseyNo: 1,
            playerPoints: {
              goals: [],
              assist: [],
              redCard: [],
              yellowCard: [],
              penaltyPoint: 0,
              in: [],
              out: []
            }
          }]
        }]
      },
      teams: [
        {
        schoolName: 'jamnabai narsee school',
        teamId: '987654',
        players: [{
          firstName: 'Jaiviraj singh rajputrajput singh'
        },{
          firstName: 'hello2'
        },{
          firstName: 'hello3'
        },{
          firstName: 'hello4'
        },{
          firstName: 'hello5'
        }]
        },
        {
        schoolName: 'Marvel iron high school',
        teamId: '54321',
        players: [{
          firstName: 'hello6'
        },{
          firstName: 'hello7'
        },{
          firstName: 'hello8'
        },{
          firstName: 'hello9'
        },{
          firstName: 'hello10'
        }]
        }
      ]
    }
    // JSON END

    // ************
})
