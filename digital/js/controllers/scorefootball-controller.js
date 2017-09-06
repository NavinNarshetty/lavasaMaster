myApp.controller('FootballScoreCtrl', function($scope, TemplateService, NavigationService, $timeout, $uibModal, $stateParams, $state, $interval, toastr) {
    $scope.template = TemplateService.getHTML("content/scorefootball.html");
    TemplateService.title = "Score Football"; //This is the Title of the Website
    $scope.navigation = NavigationService.getNavigation();
    // ************

    // INITIALISE VARIABLES
    $scope.match = {};
    // INITIALISE VARIABLES END

    // FUNCTIONS
    // SELECT TEAM
    $scope.selectTeam = function(){
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
        case 'penality':
          $scope.team.teamResults.penality = $scope.team.teamResults.penality + 1;
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
        case 'penality':
          if ($scope.team.teamResults.penality>0) {
            $scope.team.teamResults.penality = $scope.team.teamResults.penality - 1;
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
        case 'goals':
          $scope.player.goals.push({
            time: 0
          });
        break;
        case 'assist':
          $scope.player.assist.push({
            time: 0
          });
        break;
        case 'redCard':
          $scope.player.redCard.push({
            time: 0
          });
        break;
        case 'yellowCard':
          $scope.player.yellowCard.push({
            time: 0
          });
        break;
        case 'in':
          $scope.player.in.push({
            time: 0
          });
          $scope.player.isPlaying = true;
        break;
        case 'out':
          $scope.player.out.push({
            time: 0
          });
          $scope.player.isPlaying = false;
        break;
        case 'penalityPoint':
          $scope.player.penalityPoint =  $scope.player.penalityPoint + 1;
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
          if ($scope.player.goals.length>0) {
            var length = $scope.player.goals.length -1;
            _.remove($scope.player.goals, function(m,index){
              return length == index;
            })
          }
        break;
        case 'assist':
          if ($scope.player.assist.length>0) {
            var length = $scope.player.assist.length -1;
            _.remove($scope.player.assist, function(m,index){
              return length == index;
            })
          }
        break;
        case 'redCard':
          if ($scope.player.redCard.length>0) {
            var length = $scope.player.redCard.length -1;
            _.remove($scope.player.redCard, function(m,index){
              return length == index;
            })
          }
        break;
        case 'yellowCard':
          if ($scope.player.yellowCard.length>0) {
            var length = $scope.player.yellowCard.length -1;
            _.remove($scope.player.yellowCard, function(m,index){
              return length == index;
            })
          }
        break;
        case 'in':
          if ($scope.player.in.length>0) {
            var length = $scope.player.in.length -1;
            _.remove($scope.player.in, function(m,index){
              return length == index;
            })
          }
        break;
        case 'out':
          if ($scope.player.out.length>0) {
            var length = $scope.player.out.length -1;
            _.remove($scope.player.out, function(m,index){
              return length == index;
            })
          }
        break;
        case 'penalityPoint':
          if ($scope.player.penalityPoint>0) {
            $scope.player.penalityPoint = $scope.player.penalityPoint - 1;
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
      sportsName: 'Football',
      age: 'u-11',
      gender: 'female',
      round: 'final',
      resultFootball:{
        teams:[{
          teamId: '987654',
          teamResults:{
            halfPoints:10,
            finalPoints:22,
            penalityPoints:1,
            shotsOnGoal: 2,
            totalShots:2,
            corners:2,
            penality:1,
            saves:1,
            fouls:1,
            offSide:1,
            cleanSheet:1
          },
          players: [{
            name: 'hello',
            isPlaying: true,
            jerseyNo: '1',
            goals: [],
            assist: [],
            redCard: [],
            yellowCard: [],
            penalityPoint: 0,
            in: [],
            out: []
          },{
            name: 'hello',
            isPlaying: true,
            jerseyNo: '1',
            goals: [],
            redCard: [],
            yellowCard: [],
            penalityPoint: 0,
            in: [],
            out: []
          },{
            name: 'hello',
            isPlaying: false,
            jerseyNo: '1',
            goals: [],
            redCard: [],
            yellowCard: [],
            penalityPoint: 0,
            in: [],
            out: []
          },{
            name: 'hello',
            isPlaying: true,
            jerseyNo: '1',
            goals:[],
            redCard: [],
            yellowCard: [],
            penalityPoint: 0,
            in: [],
            out: []
          },{
            name: 'hello',
            isPlaying: false,
            jerseyNo: '1',
            goals: [],
            redCard: [],
            yellowCard: [],
            penalityPoint: 0,
            in: [],
            out: []
          }]
        },{
          teamId: '54321',
          teamResults:{
            halfPoints:10,
            finalPoints:22,
            penalityPoints:1,
            shotsOnGoal: 2,
            totalShots:2,
            corners:2,
            penality:1,
            saves:1,
            fouls:1,
            offSide:1,
            cleanSheet:1
          },
          players: [{
            name: 'hello',
            isPlaying: false,
            jerseyNo: '1',
            goals: [],
            redCard: [],
            yellowCard: [],
            penalityPoint: 0,
            in: [],
            out: []
          },{
            name: 'hello',
            isPlaying: true,
            jerseyNo: '1',
            goals: [],
            redCard: [],
            yellowCard: [],
            penalityPoint: 0,
            in: [],
            out: []
          },{
            name: 'hello',
            isPlaying: false,
            jerseyNo: '1',
            goals: [],
            redCard: [],
            yellowCard: [],
            penalityPoint: 0,
            in: [],
            out: []
          },{
            name: 'hello',
            isPlaying: false,
            jerseyNo: '1',
            goals: [],
            redCard: [],
            yellowCard: [],
            penalityPoint: 0,
            in: [],
            out: []
          },{
            name: 'hello',
            isPlaying: true,
            jerseyNo: '1',
            goals: [],
            redCard: [],
            yellowCard: [],
            penalityPoint: 0,
            in: [],
            out: []
          }]
        }]
      },
      teams: [
        {
        schoolName: 'jamnabai narsee school',
        teamId: '987654',
        players: [{
          firstName: 'hello1'
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
