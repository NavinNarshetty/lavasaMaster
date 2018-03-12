myApp.controller('ScoringCtrl', function ($scope, TemplateService, NavigationService, ResultSportInitialization, $timeout, $uibModal, $rootScope, $stateParams, $state, $interval, toastr) {

  var promise;
  $scope.matchData = {};
  $scope.drawFormat = $stateParams.drawFormat;
  $scope.stateParam = {
    "id": $stateParams.id,
    "drawFormat": $stateParams.drawFormat,
    "sport": $stateParams.sport
  };

  $scope.matchId = $stateParams.id;
  var teamSelectionModal;
  var completeMatchModal;
  var playerScoreModal;
  var penaltyShootoutModal;
  var resultVar;
  $scope.btnDisable = false;

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

  var initPage = function () {
    $scope.template = TemplateService.getHTML("content/" + $scope.matchData.html);
    TemplateService.title = "Score Basketball"; //This is the Title of the Website
    $scope.navigation = NavigationService.getNavigation();
  }

  $scope.getOneMatch = function () {

    NavigationService.getOneMatch({
      matchId: $stateParams.id
    }, function (data) {
      if (data.value == true) {
        if (data.data.error) {
          $scope.matchError = data.data.error;

          toastr.error('Invalid MatchID. Please check the MatchID entered.', 'Error');
          $state.go('knockout-team', {
            drawFormat: $stateParams.drawFormat,
            id: $stateParams.sport
          });
        }
        $scope.match = data.data;
        $scope.match.matchId = $stateParams.id;

        $scope.matchData = ResultSportInitialization.getResultVariable($scope.match.sportsName, $scope.match.sportType);
        resultVar = $scope.matchData.resultVar;
        $scope.matchData.matchId = $stateParams.id;
        initPage();

        if ($scope.match[resultVar] && $scope.match[resultVar].teams && ($scope.match[resultVar].teams[0] == "" || $scope.match[resultVar].teams[1].coach == "" || $scope.match[resultVar].teams[1] == '')) {

          if ($scope.match.sportsName != "Karate Team Kumite") {
            $scope.selectTeam($scope.match);
          }
        }
      } else {
        console.log("ERROR IN getOneMatch");
      }
    })
  };
  $scope.getOneMatch();



  //Common Modal For All Matches
  //SELECT TEAM POPUP
  $scope.selectTeam = function (match) {
    $scope.clonedMatch = _.cloneDeep(match);

    $scope.result = $scope.clonedMatch[resultVar];

    teamSelectionModal = $uibModal.open({
      animation: true,
      scope: $scope,
      backdrop: 'static',
      keyboard: false,
      size: 'lg',
      templateUrl: 'views/modal/teamselection-modal.html',
      windowClass: 'teamselection-modal'
    })
  }
  //SELECT PLAYING
  //Common Modal For All Matches ends


  $scope.selectPlaying = function (team, player) {
    $scope.playingCount = 0;
    _.each(team.players, function (n) {
      if (n.isPlaying == true) {
        $scope.playingCount = $scope.playingCount + 1;
      }
    });


    if (player.isPlaying == false) {
      if ($scope.playingCount < $scope.match.minTeamPlayers) {
        if (player.isPlaying == true) {
          player.isPlaying = false;
        } else {
          player.isPlaying = true;
        }
      } else {
        toastr.warning('Maximum players selected');
      }
    } else {
      if (player.isPlaying == true) {
        player.isPlaying = false;
      } else {
        player.isPlaying = true;
      }
    }
  }
  // SELECT PLAYING END


  $scope.savePlayingTeam = function (result) {

    var saveCounter = 0;
    _.each(result.teams, function (n, nKey) {
      var countLength = 0;
      var tkey = 0;
      var tKey = nKey + 1;
      if (n.coach == "") {
        toastr.error("Please enter coach of Team " + tKey, "Enter Details");
      } else {
        _.each(n.players, function (m, mkey) {
          if (m.isPlaying == true) {
            countLength = countLength + 1;
          }
        });
        if (countLength < $scope.match.minTeamPlayers) {
          toastr.error("Select minimum " + $scope.match.minTeamPlayers + " players for Team " + tKey + " to start scoring.", "Enter Details");
        } else {
          saveCounter = saveCounter + 1;
        }
      }
    });
    if (saveCounter == 2) {
      result.teamInitialized = true;
      $scope.matchResult = {};
      $scope.matchResult[resultVar] = result
      $scope.matchResult.matchId = $scope.matchData.matchId;


      $scope.saveMatch($scope.matchResult, '1');
    }
  }
  // SELECT TEAM END

  // PLAYER POINTS MODAL
  $scope.modalPlayerPoints = function (player, teamIndex, playerIndex) {
    $scope.selectedTeamIndex = teamIndex;
    $scope.selectedPlayerIndex = playerIndex;
    $scope.selectedPlayer = _.cloneDeep(player);

    // in out section
    $scope.inOutTime = {
      time: ""
    };
    $scope.substitutePlayer = {};
    // in out section end

    playerScoreModal = $uibModal.open({
      animation: true,
      scope: $scope,
      // backdrop: 'static',
      keyboard: false,
      size: 'lg',
      templateUrl: 'views/modal/' + $scope.matchData.scoringModal,
      windowClass: 'scoreplayer-football-modal'
    })
  }



  // PLAYER SCORE INCREMENT
  $scope.scorePlayerPoints = function (player, pointVar, flag) {
    var isArray = Array.isArray(player.playerPoints[pointVar]);

    if (flag == '+') {
      if (isArray) {
        player.playerPoints[pointVar].push({
          time: ''
        });
      } else {
        if (!player.playerPoints[pointVar]) {
          player.playerPoints[pointVar] = 1;
        } else {
          ++player.playerPoints[pointVar];
        }
      }
    } else {
      if (isArray) {
        player.playerPoints[pointVar].pop();
      } else {
        if (!player.playerPoints[pointVar]) {

        } else {
          --player.playerPoints[pointVar];
        }
      }

    }
  };
  // PLAYER SCORE INCREMENT END




  $scope.updatePlayerDetails = function (playingPlayer, substitutePlayer) {

    var playingPlayerIndex = _.findIndex($scope.match[resultVar].teams[$scope.selectedTeamIndex].players, ['player', playingPlayer.player]);
    if (!playingPlayer.isPlaying) {
      if (!_.isEmpty(substitutePlayer)) {
        if ($scope.inOutTime && $scope.inOutTime.time && $scope.inOutTime.time != '') {
          var substitutePlayerIndex = _.findIndex($scope.match[resultVar].teams[$scope.selectedTeamIndex].players, ['player', substitutePlayer.player]);
          playingPlayer.isPlaying = false;
          substitutePlayer.isPlaying = true;
          var outTimeObj = _.cloneDeep($scope.inOutTime);
          var inTimeObj = _.cloneDeep($scope.inOutTime);
          outTimeObj.substitute = substitutePlayer.player;
          inTimeObj.substitute = playingPlayer.player;
          playingPlayer.playerPoints.out.push(outTimeObj);
          substitutePlayer.playerPoints.in.push(inTimeObj);

          $scope.match[resultVar].teams[$scope.selectedTeamIndex].players[playingPlayerIndex] = playingPlayer;
          $scope.match[resultVar].teams[$scope.selectedTeamIndex].players[substitutePlayerIndex] = substitutePlayer;
          playerScoreModal.close();
        } else {
          toastr.error("Please Enter, OUT Time");
        }
      } else {
        toastr.error("SUBSTITUTE is required");
      }
    } else {
      $scope.match[resultVar].teams[$scope.selectedTeamIndex].players[playingPlayerIndex] = playingPlayer;
      playerScoreModal.close();
    }

  }
  // PLAYER POINTS MODAL END

  // TEAM SCORE INCREMENT
  $scope.scoreTeamPoints = function (team, pointVar, flag) {
    // console.log(team.teamResults,Array.isArray(team.teamResults[pointVar]));
    // var obj=ResultSportInitialization.getFormattedObject(Array.isArray(team.teamResults[pointVar]));
    // if(){}
    if (flag == '+') {
      if (!team.teamResults[pointVar]) {
        team.teamResults[pointVar] = 1;
      } else {
        ++team.teamResults[pointVar];
      }
    } else if (flag == '-') {
      if (!team.teamResults[pointVar]) {

      } else {
        --team.teamResults[pointVar];
      }
    }
  };
  // TEAM SCORE INCREMENT END


  // REMOVE MATCH SCORESHEET
  //type scoreSheet/matchPhoto
  $scope.removeMatchScore = function (pic, type) {
    _.remove($scope.match[resultVar][type], function (n) {
      return n.image === pic.image;
    });
  }
  // REMOVE MATCH SCORESHEET END


  $scope.modalPenaltyShootout = function (matchPenalty) {
    // var matchPenalty;
    $scope.matchPenalty = _.cloneDeep(matchPenalty);

    penaltyShootoutModal = $uibModal.open({
      animation: true,
      scope: $scope,
      backdrop: 'static',
      keyboard: false,
      size: 'lg',
      templateUrl: 'views/modal/penaltyshootoutsteam.html',
      windowClass: 'penaltyshootouts-modal'
    })
  }


  // SAVE RESULT
  //1-save AND getONE
  //2-just save i.e. for autoSave
  //3-complete and save
  //
  $scope.saveMatch = function (match, flag) {
    console.log("match",match);
    var url = "";

    function save() {
      if ($stateParams.drawFormat == "Knockout") {
        url = "match/updateResult";
      } else if ($stateParams.drawFormat == "League cum Knockout") {
        url = "match/updateLeagueKnockout";
      }

      NavigationService.saveMatchPp(match, $scope.matchData.resultVar, url, function (data) {
        if (data.value == true) {
          //for saving players selected
          if (flag == '1') {
            $scope.getOneMatch();
            $('.modal-backdrop').remove();
            teamSelectionModal.close();
          } else if (flag == '2') {
            //Do Nothing
          } else if (flag == '3') {
            if ($scope.drawFormat == 'League cum Knockout') {
              $state.go('league-knockoutTeam', {
                drawFormat: $stateParams.drawFormat,
                id: $stateParams.sport
              })
            } else {
              $state.go('knockout-team', {
                drawFormat: $stateParams.drawFormat,
                id: $stateParams.sport
              });
            }
          }
        } else {
          toastr.error('Save Failed, Please Try Again');
        }
      });
    }

    $scope.matchComplete = function () {
      $scope.btnDisable = true;
      $scope.match[resultVar].status = "IsCompleted";
      flag = '3';
      $interval.cancel(promise);
      save();
      $scope.btnDisable = false;
      completeMatchModal.close();
    };


    if (flag == '3') {
      _.each(match[resultVar].teams, function (team, tk) {
        noScore = ResultSportInitialization.nullOrEmptyTo0($scope.match.sportsName, team);
        if(noScore){
          return false;
        }
      });
      if (noScore == false) {
        if (match[resultVar].matchPhoto.length != 0) {
          if (match[resultVar].scoreSheet.length != 0) {
            if (match.stage != 'League' || (match.stage == 'League' && match[resultVar].isDraw == false)) {
              if (match[resultVar].winner && match[resultVar].winner.player && match[resultVar].winner.player != "") {
                // match[resultVar].status = "IsCompleted";
                completeMatchModal = $uibModal.open({
                  animation: true,
                  scope: $scope,
                  // backdrop: 'static',
                  // keyboard: false,
                  templateUrl: 'views/modal/confirmcomplete.html',
                  windowClass: 'completematch-modal'
                })
              } else {
                toastr.error('Winner is compulsury BEFORE completing match');
                return;
              }
            } else {

              if (match.stage == 'League' && match[resultVar].isDraw == true) {
                completeMatchModal = $uibModal.open({
                  animation: true,
                  scope: $scope,
                  // backdrop: 'static',
                  // keyboard: false,
                  templateUrl: 'views/modal/confirmcomplete.html',
                  windowClass: 'completematch-modal'
                })
              }
            }
          } else {
            toastr.error('Please upload atleast one scoresheets photo');
            return;
          }
        } else {
          toastr.error('Please upload atleast one match photo');
          return;
        }
      } else {
        toastr.error("Please fill all madatory fields");
      }

    } else {
      save();
    }


  };

  $scope.savePenaltyScore = function (result) {
    console.log("result",result);
   _.each(result.teams,function(n,k){
    if(n.teamResults.penaltyPoints || n.teamResults.penaltyPoints===0){
      console.log(k);
      if(k==1){
        $scope.match[resultVar] = result;
        $scope.saveMatch($scope.match, '2');
        // $('body').removeClass('modal-open');
        penaltyShootoutModal.close();     
      }
    }else{
      toastr.error("Please Fill Up final Penalty Points");
      return false;
    }
   });
  }


  // AUTO SAVE
  $scope.autoSave = function () {
    $scope.$on('$viewContentLoaded', function (event) {
      promise = $interval(function () {
        $scope.saveMatch($scope.match, '2');
      }, 10000);
    })
  }
  $scope.autoSave();

  $scope.$on('$destroy', function () {
    $interval.cancel(promise);
  })
  // AUTO SAVE FUNCTION END

  // MATCH DRAW
  $scope.matchDraw = function () {
    if ($scope.match[resultVar].isDraw == false) {
      $scope.match[resultVar].isDraw = true;
    } else {
      $scope.match[resultVar].isDraw = false;
    }
  }

  // ADD SET
  $scope.setLength = [];
  $scope.addSet = function () {
    var obj = {};
    var allowAddSet;
    if ($scope.match.sportsName == "Karate Team Kumite") {
      var t1Length = $scope.match[resultVar].teams[0].players.length;
      var t2Length = $scope.match[resultVar].teams[1].players.length;
      console.log("t1Length,t2Length",t1Length,t2Length);
      var minSetLength ;

      if(t1Length<=t2Length){
        minSetLength =t1Length;
      }else{
        minSetLength =t2Length;
      }

      if(minSetLength>$scope.match[resultVar].teams[0].teamResults.sets.length){
        allowAddSet = true;
      }else{
        allowAddSet = false;
      }

      obj.playerId = '',
        obj.playerName = '',
        obj.points = ''
    } else {
      obj.points = null
      allowAddSet = true;
    }

    if(allowAddSet){
      _.each($scope.match[resultVar].teams, function (n) {
        n.teamResults.sets.push(_.cloneDeep(obj));
      })

      _.each($scope.match[resultVar].teams[0].teamResults.sets, function (n, key) {
        $scope.setLength[key] = {
          setShow: true
        }
      })
    }else{
      toastr.error("Cant add more sets");
    }
    $scope.setDisplay = {
      value: 0
    };
    $scope.setDelete = {
      value: 0
    };
  }
  // ADD SET END
  // REMOVE SET
  $scope.removeSets = function () {
    $scope.sets = new Array($scope.match[resultVar].teams[0].teamResults.sets.length);
    $scope.setDelete = {
      value: 0
    };

    $rootScope.modalInstance = $uibModal.open({
      animation: true,
      scope: $scope,
      keyboard: false,
      templateUrl: 'views/modal/removeset.html',
      windowClass: 'removeset-modal'
    })
  }
  $scope.deleteSet = function (index) {
    var limit = 1;
    _.each($scope.match[resultVar].teams, function (n,key) {
      if($scope.match.sportsName=="Karate Team Kumite"){
        limit=0;
      }
      if (n.teamResults.sets.length > limit) {
        n.teamResults.sets.splice(index, 1);
        $scope.setLength = [];
        _.each($scope.match[resultVar].teams[0].teamResults.sets, function (n, key) {
          $scope.setLength[key] = {
            setShow: true
          }
        });
        $scope.setDisplay = {
          value: 0
        };
        if(key==1){
          toastr.success('Set '+ (index+1) +' deleted successfully');
        }
        $rootScope.modalInstance.close('a');

      } else {
        toastr.warning('Minimum 1 Set required');
      }
    });
  }


  $scope.isClicked = function(player,team){
    if(player){
      obj = _.find(team,['sfaId',player.sfaId]);
      if(obj){
        obj.isPlaying=true;
        console.log("obj",obj);
      }
    }
    _.each($scope.match.resultKumite.teams,function(team){
      team.teamResults.sets = _.map(team.teamResults.sets,function(n){
        return {
          "playerId":n.player || n.playerId,
          "playerName":n.fullName || n.playerName,
          "points":n.points,
          "sfaId":n.sfaId
        }
      })
    });
  }
  // REMOVE SET END
  // MATCH DRAW END
});