myApp.controller('ScoringCtrl', function ($scope, TemplateService, NavigationService, ResultSportInitialization, $timeout, $uibModal, $stateParams, $state, $interval, toastr) {

  $scope.matchData = {};
  $scope.stateParam = {
    "id": $stateParams.id,
    "drawFormat": $stateParams.drawFormat,
    "sport": $stateParams.sport
  };
  $scope.matchId = $stateParams.id;
  var teamSelectionModal;
  var playerScoreModal;
  var resultVar;

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
          console.log($scope.matchError, 'error');
          toastr.error('Invalid MatchID. Please check the MatchID entered.', 'Error');
        }
        $scope.match = data.data;
        $scope.match.matchId = $stateParams.id;
        $scope.matchData = ResultSportInitialization.getResultVariable($scope.match.sportsName);
        resultVar = $scope.matchData.resultVar;
        $scope.matchData.matchId = $stateParams.id;
        initPage();
        console.log($scope.match);
        console.log($scope.matchData);
        console.log(resultVar);
        if ($scope.match[resultVar].teams[0] == "" || $scope.match[resultVar].teams[0].formation == "" || $scope.match[resultVar].teams[1].coach == "" || $scope.match[resultVar].teams[1] == '') {
          $scope.selectTeam($scope.match);
        }
      } else {
        console.log("ERROR IN getOneMatch");
      }
    })
  };
  $scope.getOneMatch();



  //Common Modal For All Matches
  //SELECT TEAM
  $scope.selectTeam = function (match) {
    $scope.clonedMatch = _.cloneDeep(match);
    console.log($scope.clonedMatch);
    $scope.result = $scope.clonedMatch[resultVar];
    console.log($scope.result);
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
    console.log('isPlaying', player.isPlaying);
    console.log($scope.playingCount, 'playingCount');
    console.log("minTeamPlayers", $scope.match.minTeamPlayers);

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
    console.log(result, 'result');
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

      console.log($scope.matchResult, "matchResult");
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
    if (flag == '+') {
      player.playerPoints[pointVar].push({
        time: ''
      });
    } else {
      player.playerPoints[pointVar].pop();
    }
    console.log('inPP');
  };
  // PLAYER SCORE INCREMENT END




  $scope.updatePlayerDetails = function (playingPlayer, substitutePlayer) {
    console.log(playingPlayer);
    var playingPlayerIndex = _.findIndex($scope.match[resultVar].teams[$scope.selectedTeamIndex].players, ['player', playingPlayer.player]);
    if (!playingPlayer.isPlaying) {
      if (!_.isEmpty(substitutePlayer)) {
        if ($scope.inOutTime.time != '') {
          var substitutePlayerIndex = _.findIndex($scope.match[resultVar].teams[$scope.selectedTeamIndex].players, ['player', substitutePlayer.player]);
          playingPlayer.isPlaying = false;
          substitutePlayer.isPlaying = true;
          playingPlayer.playerPoints.out.push($scope.inOutTime);
          substitutePlayer.playerPoints.in.push($scope.inOutTime);
          $scope.match[resultVar].teams[$scope.selectedTeamIndex].players[playingPlayerIndex] = playingPlayer;
          $scope.match[resultVar].teams[$scope.selectedTeamIndex].players[substitutePlayerIndex] = substitutePlayer;
          playerScoreModal.close();
        } else {
          toastr.error("Please Enter Out Time");
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
    _.remove($scope.match.resultBasketball[type], function (n) {
      return n.image === pic.image;
    });
  }
  // REMOVE MATCH SCORESHEET END


  $scope.modalPenaltyShootout = function (matchPenalty) {
    // var matchPenalty;
    $scope.matchPenalty = matchPenalty;
    _.each($scope.matchPenalty.teams, function (n) {
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


  // SAVE RESULT
  //1-save AND getONE 
  //2-just save i.e. for autoSave
  //3-complete and save
  $scope.saveMatch = function (match, flag) {
    if (flag == '3') {
      console.log(match);
      if (match[resultVar].matchPhoto.length != 0) {
        if (match[resultVar].scoreSheet.length != 0) {
          if (match[resultVar].winner && match[resultVar].winner.player && match[resultVar].winner.player != "") {
            match[resultVar].status = "IsCompleted";
          } else {
            toastr.error('Winner is compulsury BEFORE completing match');
            return;
          }
        } else {
          toastr.error('Please upload atleast one scoresheets photo');
          return;
        }
      } else {
        toastr.error('Please upload atleast one match photo');
        return;
      }

    };
    NavigationService.saveMatchPp(match, $scope.matchData.resultVar, function (data) {
      if (data.value == true) {
        //for saving players selected
        if (flag == '1') {
          $scope.getOneMatch();
          teamSelectionModal.close();
        } else if (flag == '2') {
          //Do Nothing
        } else if (flag == '3') {
          $state.go('knockout-team', {
            drawFormat: $stateParams.drawFormat,
            id: $stateParams.sport
          });
        }
      } else {
        toastr.error('Save Failed, Please Try Again');
      }
    });
  };


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
    console.log('destroy');
    $interval.cancel(promise);
  })
  // AUTO SAVE FUNCTION END

  $scope.matchComplete = function () {
    if ($scope.match.resultVolleyball) {
      $scope.match.resultVolleyball.status = "IsCompleted";
      $scope.matchResult = {
        resultVolleyball: $scope.match.resultVolleyball,
        matchId: $scope.matchData.matchId
      }
      NavigationService.saveMatch($scope.matchResult, function (data) {
        if (data.value == true) {
          $state.go('knockout-team', {
            drawFormat: $stateParams.drawFormat,
            id: $stateParams.sport
          });
          console.log('save success');
        } else {
          toastr.error('Data save failed. Please try again.', 'Save Error');
        }
      });
      console.log($scope.matchResult, 'result#');
    } else {
      toastr.error('No data to save. Please check for valid MatchID.', 'Save Error');
    }
  }

});