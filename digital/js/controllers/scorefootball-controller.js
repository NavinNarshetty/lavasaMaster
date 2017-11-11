myApp.controller('FootballScoreCtrl', function($scope, TemplateService, NavigationService, $timeout, $uibModal, $stateParams, $state, $interval, toastr, $rootScope) {
    $scope.template = TemplateService.getHTML("content/scorefootball.html");
    TemplateService.title = "Score Football"; //This is the Title of the Website
    $scope.navigation = NavigationService.getNavigation();
    // ************

    // INITIALISE VARIABLES
    $scope.match = {};
    $scope.stateParam = $stateParams;
    $scope.matchId=$stateParams.id;
    $scope.matchData = {};
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
      $rootScope.modalInstance = $uibModal.open({
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
        if(playingCount <  $scope.match.minTeamPlayers){
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
    // SAVE PLAYING TEAM
    $scope.savePlayingTeam = function(result){
      console.log(result,'result');
      var saveCounter = 0;
      _.each(result.teams, function(n, nKey){
        var countLength = 0;
        var tkey = 0;
        var tKey = nKey + 1;
        if(n.coach == ""){
          toastr.error("Please enter coach of Team " + tKey, "Enter Details");
        } else if (n.formation == "") {
          toastr.error("Please enter formation of Team " + tKey, "Enter Details");
        } else{
          _.each(n.players, function(m, mkey){
            if(m.isPlaying == true){
              countLength = countLength + 1;
            }
          });
          if(countLength < $scope.match.minTeamPlayers){
            toastr.error("Select minimum " +  $scope.match.minTeamPlayers + " players for Team " + tKey + " to start scoring.","Enter Details");
          }
          else {
            saveCounter = saveCounter + 1;
          }
        }
      });
      if(saveCounter == 2){
        $scope.matchResult = {
          resultFootball : result,
          matchId: $scope.matchData.matchId
        }

        console.log($scope.matchResult, "matchResult");
        NavigationService.saveFootball($scope.matchResult, function(data){
          if(data.value == true){
            console.log('save success');
            $rootScope.modalInstance.close('a');
          } else{
            alert('fail save');
          }
        });
      }
    }
    // SAVE PLAYING TEAM END
    // TEAM SCORE INCREMENT
    $scope.incrementTeamPoint = function(team, point){
      $scope.team = team;
      switch (point) {
        case 'totalShots':
          if ($scope.team.teamResults.totalShots == "") {
            $scope.team.teamResults.totalShots = 1;
          } else {
            $scope.team.teamResults.totalShots = $scope.team.teamResults.totalShots + 1;
          }
        break;
        case 'shotsOnGoal':
          if ($scope.team.teamResults.shotsOnGoal == "") {
            $scope.team.teamResults.shotsOnGoal = 1;
          } else {
            $scope.team.teamResults.shotsOnGoal = $scope.team.teamResults.shotsOnGoal + 1;
          }
        break;
        case 'corners':
          if ($scope.team.teamResults.corners == "") {
            $scope.team.teamResults.corners = 1;
          } else {
            $scope.team.teamResults.corners = $scope.team.teamResults.corners + 1;
          }
        break;
        case 'penalty':
          if ($scope.team.teamResults.penalty == "") {
            $scope.team.teamResults.penalty = 1;
          } else {
            $scope.team.teamResults.penalty = $scope.team.teamResults.penalty + 1;
          }
        break;
        case 'saves':
          if ($scope.team.teamResults.saves == "") {
            $scope.team.teamResults.saves = 1;
          } else {
            $scope.team.teamResults.saves = $scope.team.teamResults.saves + 1;
          }
        break;
        case 'fouls':
          if ($scope.team.teamResults.fouls =="") {
            $scope.team.teamResults.fouls = 1;
          } else {
            $scope.team.teamResults.fouls = $scope.team.teamResults.fouls + 1;
          }
        break;
        case 'offSide':
          if ($scope.team.teamResults.offSide == "") {
            $scope.team.teamResults.offSide = 1;
          } else {
            $scope.team.teamResults.offSide = $scope.team.teamResults.offSide + 1;
          }
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
      console.log(point,'point');
      switch (point) {
        case 'goals':
          $scope.player.playerPoints.goals.push({
            time: ""
          });
        break;
        case 'assist':
          $scope.player.playerPoints.assist.push({
            time: ""
          });
        break;
        case 'redCard':
          $scope.player.playerPoints.redCard.push({
            time: ""
          });
        break;
        case 'yellowCard':
          $scope.player.playerPoints.yellowCard.push({
            time: ""
          });
        break;
        case 'in':
          $scope.player.playerPoints.in.push({
            time: ""
          });
          $scope.player.isPlaying = true;
        break;
        case 'out':
          $scope.player.playerPoints.out.push({
            time: ""
          });
          $scope.player.isPlaying = false;
        break;
        case 'penaltyPoint':
          if ($scope.player.playerPoints.penaltyPoint == "") {
            $scope.player.playerPoints.penaltyPoint = 1;
          } else {
            $scope.player.playerPoints.penaltyPoint =  $scope.player.playerPoints.penaltyPoint + 1;
          }
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
          if ($scope.player.playerPoints.penaltyPoint > 0) {
            $scope.player.playerPoints.penaltyPoint = $scope.player.playerPoints.penaltyPoint - 1;
          }
        break;
      }
      console.log('dePP');
    };
    // PLAYER SCORE DECREMENT END
    // PLAYER POINTS MODAL
    $scope.addPlayerPoints = function(player, index, teamIndex){
      $scope.selectedPlayer = player;
      $scope.selectedInPlayer = {};
      $scope.teamIndex = teamIndex;
      $scope.selectedTeam = $scope.match.teams[$scope.teamIndex];
      _.each($scope.selectedTeam.studentTeam, function(n, index){
        n.isPlaying = "";
        _.each($scope.match.resultFootball.teams[$scope.teamIndex].players, function(m, mkey){
          if(n.studentId._id == m.player){
            n.isPlaying = m.isPlaying;
          }
        });
      });
      $rootScope.modalInstance = $uibModal.open({
        animation: true,
        scope: $scope,
        keyboard: false,
        size: 'lg',
        templateUrl: 'views/modal/scoreplayer-football.html',
        windowClass: 'scoreplayer-football-modal'
      })
    }
    // PLAYER POINTS MODAL END
    // CANCEL PLAYER POINTS SAVE
    $scope.cancelPlayerPoints = function(){
      if($scope.selectedPlayer.isPlaying == false){
        $scope.selectedPlayer.isPlaying = true;
        if ($scope.selectedPlayer.playerPoints.out.length>0) {
          var length = $scope.player.playerPoints.out.length -1;
          _.remove($scope.player.playerPoints.out, function(m,index){
            return length == index;
          })
        }
      }
      _.each($scope.match.resultFootball.teams[$scope.teamIndex].players, function(n){
        if(n.player == $scope.selectedInPlayer.player){
          n.isPlaying = false;
        }
      });
      $rootScope.modalInstance.close('a');
    }
    // CANCEL PLAYER POINTS SAVE END
    // SAVE PLAYER POINTS
    $scope.savePlayerPoints = function(){
      if($scope.selectedPlayer.isPlaying == false){
        var inLength = $scope.selectedPlayer.playerPoints.out.length - 1;
        _.each($scope.match.resultFootball.teams[$scope.teamIndex].players, function(n){
          if(n.player == $scope.selectedInPlayer.player){
            n.isPlaying = true;
            n.playerPoints.in.push({
              time: $scope.selectedPlayer.playerPoints.out[inLength].time
            });
            console.log(n, 'yomama');
          }
        });
      }
      $rootScope.modalInstance.close('a');
    }
    // SAVE PLAYER POINTS END
    // PENALTY SHOOTOUTS MODAL
    $scope.startPenalty = function(matchPenalty){
      // var matchPenalty;
      $scope.matchPenalty = matchPenalty;
      _.each($scope.matchPenalty.teams, function(n){
        if (!n.teamResults.penaltyPoints) {
          n.teamResults.penaltyPoints = "";
        }
      });
      $rootScope.modalInstance = $uibModal.open({
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
    // SAVE PENALTY POINTS
    $scope.savePenaltyScore = function(matchPenalty){
      $scope.match.resultFootball = matchPenalty;
      $rootScope.modalInstance.close('a');
    }
    // SAVE PENALTY POINTS END
    // REMOVE MATCH SCORESHEET
    $scope.removeMatchScore = function(pic, type) {
      switch (type) {
        case 'matchPhoto':
          _.remove($scope.match.resultFootball.matchPhoto, function(n) {
              return n.image === pic.image;
          })
        break;
        case 'scoreSheet':
          _.remove($scope.match.resultFootball.scoreSheet, function(n) {
            return n.image === pic.image;
          })
        break;
      }
    }
    // REMOVE MATCH SCORESHEET END
    // MATCH DRAW
    $scope.matchDraw = function(){
      if ($scope.match.resultFootball.isDraw == false) {
        $scope.match.resultFootball.isDraw = true;
      } else {
        $scope.match.resultFootball.isDraw = false;
      }
    }
    // MATCH DRAW END
    // FUNCTIONS END

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
                $state.go('league-knockout', {
                  drawFormat: $stateParams.drawFormat,
                  id: $stateParams.sport
                });
              }
                $scope.match = data.data;
                $scope.match.matchId = $scope.matchData.matchId;
                // $scope.match.resultFootball.isDraw = false;
                _.each($scope.match.resultFootball.teams[0].teamResults.sets, function(n,key){
                  $scope.setLength[key] = {
                    setShow : true
                  }
                });
                if($scope.match.resultFootball.teams[0] == "" || $scope.match.resultFootball.teams[0].formation == "" ||$scope.match.resultFootball.teams[1].coach == "" || $scope.match.resultFootball.teams[1] == ''){
                  $scope.selectTeam($scope.match.resultFootball);
                }
            } else {
                console.log("ERROR IN getOneMatch");
            }
        })
    };
    $scope.getOneMatch();
    // GET MATCH END
    // SAVE RESULT
    $scope.saveResult = function(formData){
      $scope.matchResult = {
        resultFootball : formData.resultFootball,
        matchId: $scope.matchData.matchId
      }
      NavigationService.saveFootball($scope.matchResult, function(data){
        if(data.value == true){
          console.log('save success');
        } else{
          alert('fail save');
        }
      });
    }
    // SAVE RESULT END
    // AUTO SAVE
    $scope.autoSave = function(){
      $scope.$on('$viewContentLoaded', function(event) {
        promise = $interval(function () {
          $scope.saveResult($scope.match);
        }, 10000);
      })
    }
    $scope.autoSave();
    // AUTO SAVE FUNCTION END
    // DESTROY AUTO SAVE
    // $scope.destroyAutoSave = function(){
      $scope.$on('$destroy', function(){
        console.log('destroy');
        $interval.cancel(promise);
      })
    // }
    // DESTROY AUTO SAVE END
    // AUTO SAVE END
    // MATCH COMPLETE
    // FOR KNOCKOUT
    $scope.completePopup = function(){
      if($scope.match.resultFootball.matchPhoto.length == 0){
        toastr.error('Please upload match photo.', 'Data Incomplete');
      } else if ($scope.match.resultFootball.scoreSheet.length == 0) {
        toastr.error('Please upload scoresheet.', 'Data Incomplete');
      }else if(!$scope.match.resultFootball.winner.player){
        toastr.error('Please select a winner.', 'Data Incomplete');
      }  else {
      var modalCompleteMatch;
        $rootScope.modalInstance = $uibModal.open({
          animation: true,
          scope: $scope,
          // backdrop: 'static',
          // keyboard: false,
          templateUrl: 'views/modal/confirmcomplete.html',
          windowClass: 'completematch-modal'
        })
      }
    };
    // FOR KNOCKOUT END
    // FOR LEAGUE
    $scope.completePopupDraw = function(){
      if($scope.match.resultFootball.matchPhoto.length == 0){
        toastr.error('Please upload match photo.', 'Data Incomplete');
      } else if ($scope.match.resultFootball.scoreSheet.length == 0) {
        toastr.error('Please upload scoresheet.', 'Data Incomplete');
      } else {
        if ($scope.match.resultFootball.isDraw == true) {
          $scope.match.resultFootball.winner = {};
          $rootScope.modalInstance = $uibModal.open({
            animation: true,
            scope: $scope,
            // backdrop: 'static',
            // keyboard: false,
            templateUrl: 'views/modal/confirmcomplete.html',
            windowClass: 'completematch-modal'
          })
        } else{
          if(!$scope.match.resultFootball.winner.player){
            toastr.error('Please select a winner.', 'Data Incomplete');
          } else {
            $rootScope.modalInstance = $uibModal.open({
              animation: true,
              scope: $scope,
              // backdrop: 'static',
              // keyboard: false,
              templateUrl: 'views/modal/confirmcomplete.html',
              windowClass: 'completematch-modal'
            })
          }
        }
      }
    };
    // FOR LEAGUE END
    $scope.matchComplete = function(){
      if ($scope.match.resultFootball) {
        $scope.match.resultFootball.status = "IsCompleted";
          $scope.matchResult = {
            resultFootball : $scope.match.resultFootball,
            matchId: $scope.matchData.matchId
          }
          NavigationService.saveFootball($scope.matchResult, function(data){
            if(data.value == true){
              $state.go('league-knockoutTeam', {
                drawFormat: $stateParams.drawFormat,
                id: $stateParams.sport
              });
              console.log('save success');
            } else{
              // alert('fail save');
              toastr.error('Data save failed. Please try again or check your internet connection.', 'Save Error');
            }
          });
          console.log($scope.matchResult, 'result#');
      } else {
        toastr.error('No data to save. Please check for valid MatchID.', 'Save Error');
      }
    }
    // MATCH COMPLETE END
    // API CALLS END


    // JSON
    $scope.smatch = {
      matchId: '123456',
      sportsName: 'Football',
      age: 'u-11',
      gender: 'female',
      round: 'final',
      minTeamPlayers: 4,
      resultFootball:{
        teams:[{
          teamId: '987654',
          teamResults:{
            halfPoints:10,
            finalPoints:22,
            penaltyPoints:1,
            shotsOnGoal: 2,
            totalShots:2,
            corners:2,
            penalty:1,
            saves:1,
            fouls:1,
            offSide:1,
            cleanSheet:1
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
            halfPoints:10,
            finalPoints:22,
            penaltyPoints:1,
            shotsOnGoal: 2,
            totalShots:2,
            corners:2,
            penalty:1,
            saves:1,
            fouls:1,
            offSide:1,
            cleanSheet:1
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
