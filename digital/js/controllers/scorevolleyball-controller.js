myApp.controller('VolleyballScoreCtrl', function($scope, TemplateService, NavigationService, $timeout, $uibModal, $stateParams, $state, $interval, toastr, $rootScope) {
    $scope.template = TemplateService.getHTML("content/scorevolleyball.html");
    TemplateService.title = "Score Football"; //This is the Title of the Website
    $scope.navigation = NavigationService.getNavigation();
    // ************

    // INITIALISE VARIABLES
    $scope.match = {};
    $scope.matchData = {};
    $scope.setLength  = [];
    $scope.setDisplay = {
      value: 0
    };
    $scope.setDelete = {
      value: 0
    };
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

    // API CALLS
    // GET MATCH
    $scope.getOneMatch = function() {
        $scope.matchData.matchId = $stateParams.id;
        NavigationService.getOneMatch($scope.matchData, function(data) {
            if (data.value == true) {
              if(data.data.error){
                $scope.matchError = data.data.error;
                console.log($scope.matchError,'error');
                toastr.error('Invalid MatchID. Please check the MatchID entered.', 'Error');
              }
                $scope.match = data.data;
                $scope.match.matchId = $scope.matchData.matchId;
            } else {
                console.log("ERROR IN getOneMatch");
            }
        })
    };
    $scope.getOneMatch();
    // GET MATCH END
    // API CALLS END

    // FUNCTIONS
    // SELECT TEAM
    $scope.selectTeam = function(result){
      var teamSelection;
      $scope.result = result;
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
        case 'corners':
          $scope.team.teamResults.corners = $scope.team.teamResults.corners + 1;
        break;
        case 'penalty':
          $scope.team.teamResults.penalty = $scope.team.teamResults.penalty + 1;
        break;
        case 'saves':
          $scope.team.teamResults.saves = $scope.team.teamResults.saves + 1;
        break;
        case 'fouls':
          $scope.team.teamResults.fouls = $scope.team.teamResults.fouls + 1;
        break;
        case 'offSide':
          $scope.team.teamResults.offSide = $scope.team.teamResults.offSide + 1;
        break;
        case 'cleanSheet':
          $scope.team.teamResults.cleanSheet = $scope.team.teamResults.cleanSheet + 1;
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
        case 'corners':
          if ($scope.team.teamResults.corners>0) {
            $scope.team.teamResults.corners = $scope.team.teamResults.corners - 1;
          }
        break;
        case 'penalty':
          if ($scope.team.teamResults.penalty>0) {
            $scope.team.teamResults.penalty = $scope.team.teamResults.penalty - 1;
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
        case 'offSide':
          if ($scope.team.teamResults.offSide>0) {
            $scope.team.teamResults.offSide = $scope.team.teamResults.offSide - 1;
          }
        break;
        case 'cleanSheet':
          if ($scope.team.teamResults.cleanSheet) {
            $scope.team.teamResults.cleanSheet = $scope.team.teamResults.cleanSheet - 1;
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
      }
      console.log('inPP');
    };
    // PLAYER SCORE INCREMENT END
    // PLAYER SCORE DECREMENT
    $scope.decrementPlayerPoint = function(player,point){
      $scope.player = player;
      switch (point) {
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
      }
      console.log('dePP');
    };
    // PLAYER SCORE DECREMENT END
    // TEAM SETS
    // SCORE INCREMENT
    $scope.incrementScore = function(set, model){
      $scope.set = set;
      switch (model) {
        case 'points':
          $scope.set.points = $scope.set.points + 1;
        break;
      }
      console.log("increment");
    };
    // SCORE INCREMENT END
    // SCORE DECREMENT
    $scope.decrementScore = function(set, model){
      $scope.set = set;
      switch (model) {
        case 'points':
          if($scope.set.points>0 ){
            $scope.set.points = $scope.set.points - 1;
          }
        break;
      }
      console.log("decrement");
    };
    // SCORE DECREMENT END
    // ADD SET
    $scope.addSet = function(){
      _.each($scope.match.resultVolleyball.teams, function(n){
        n.teamResults.sets.push({
              points: 0
        });
      })
      _.each($scope.match.resultVolleyball.teams[0].teamResults.sets, function(n,key){
        $scope.setLength[key] = {
          setShow : true
        }
      })
    }
    // ADD SET END
    // REMOVE SET
    $scope.removeSets = function(){
      var modalSetDelete;
        $rootScope.modalInstance = $uibModal.open({
          animation: true,
          scope: $scope,
          keyboard: false,
          templateUrl: 'views/modal/removeset.html',
          windowClass: 'removeset-modal'
        })
    }
    $scope.deleteSet = function(index){
      console.log(index, 'index che');
      _.each($scope.match.resultVolleyball.teams, function(n){
        if (n.teamResults.sets.length>1) {
          // delete n.sets[index];
          n.sets.splice(index,1);
          $scope.setLength = [];
          _.each($scope.match.resultVolleyball.teams[0].teamResults.sets, function(n,key){
            $scope.setLength[key] = {
              setShow : true
            }
          });
          $scope.setDisplay = {
            value: 0
          };
          $scope.setDelete = {
            value: 0
          };
          toastr.success('Set deleted successfully');
          $rootScope.modalInstance.close('a');
          console.log($scope.match.resultVolleyball, 'After delete');
        } else{
          toastr.warning('Minimum 1 Set required');
        }
      });
    }
    // REMOVE SET END
    // TEAM SETS END
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
        templateUrl: 'views/modal/scoreplayer-volleyball.html',
        windowClass: 'scoreplayer-volleyball-modal'
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
      sportsName: 'Volleyball',
      age: 'u-11',
      gender: 'female',
      round: 'final',
      minPlayers: 4,
      resultVolleyball:{
        teams:[{
          teamId: '987654',
          teamResults:{
            block:1,
            spike:1,
            fouls:1,
            sets: [{
              points: 1
            },{
              points: 0
            },{
              points: 0
            }]
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
            block:1,
            spike:1,
            fouls:1,
            sets: [{
              points: 0
            },{
              points: 5
            },{
              points: 0
            }]
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
