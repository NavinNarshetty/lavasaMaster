myApp.controller('BasketballScoreCtrl', function ($scope, TemplateService, NavigationService,ResultSportInitialization,$timeout, $uibModal, $stateParams, $state, $interval, toastr) {

  $scope.matchData = {};
  $scope.stateParams = {
    "id": $stateParams.id,
    "drawFormat": $stateParams.drawFormat,
    "sport": $stateParams.sport
  }
  var teamSelection;

  $scope.getOneMatch = function () {
    
    NavigationService.getOneMatch({matchId:$stateParams.id}, function (data) {
      if (data.value == true) {
        if (data.data.error) {
          $scope.matchError = data.data.error;
          console.log($scope.matchError, 'error');
          toastr.error('Invalid MatchID. Please check the MatchID entered.', 'Error');
        }
        $scope.match = data.data;
        $scope.match.matchId = $stateParams.id;
        $scope.matchData=ResultSportInitialization.getResultVariable($scope.match.sportsName);
        $scope.matchData.matchId = $stateParams.id;
        console.log($scope.match);
        console.log($scope.matchData);
        if ($scope.match.resultBasketball.teams[0] == "" || $scope.match.resultBasketball.teams[0].formation == "" || $scope.match.resultBasketball.teams[1].coach == "" || $scope.match.resultBasketball.teams[1] == '') {
          $scope.selectTeam($scope.match.resultBasketball);
        }
      } else {
        console.log("ERROR IN getOneMatch");
      }
    })
  };
  $scope.getOneMatch();

  $scope.template = TemplateService.getHTML($scope.matchData.html);
  TemplateService.title = "Score Basketball"; //This is the Title of the Website
  $scope.navigation = NavigationService.getNavigation();


  // SELECT TEAM
  $scope.selectTeam = function (match) {
    $scope.clonedMatch = _.cloneDeep(match);
    $scope.result=clonedMatch.resultBasketball;
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
  // SELECT PLAYING
  $scope.selectPlaying = function (team, player) {
    $scope.isPlayer = player;
    $scope.playingTeam = team;
    $scope.playingCount = 0;
    _.each($scope.playingTeam.players, function (n) {
      if (n.isPlaying == true) {
        $scope.playingCount = $scope.playingCount + 1;
      }
    });
    console.log('isPlaying', player.isPlaying);
    console.log($scope.playingCount, 'playingCount');
    console.log("minTeamPlayers", $scope.match.minTeamPlayers);


    if ($scope.isPlayer.isPlaying == false) {
      if ($scope.playingCount < $scope.match.maxTeamPlayers) {
        if ($scope.isPlayer.isPlaying == true) {
          $scope.isPlayer.isPlaying = false;
        } else {
          $scope.isPlayer.isPlaying = true;
        }
      } else {
        toastr.warning('Maximum players selected');
      }
    } else {
      if ($scope.isPlayer.isPlaying == true) {
        $scope.isPlayer.isPlaying = false;
      } else {
        $scope.isPlayer.isPlaying = true;
      }
    }

    console.log($scope.isPlayer, 'playa');
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
      $scope.matchResult = {
        resultBasketball: result,
        matchId: $scope.matchData.matchId
      }
      console.log($scope.matchResult, "matchResult");
      $scope.saveMatch($scope.matchResult);
    }
  }
  // SELECT TEAM END

  // PLAYER POINTS MODAL
  $scope.modalPlayerPoints = function (player, index) {
    $scope.selectedPlayer = _.cloneDeep(player);
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
  // PLAYER POINTS MODAL END

  // TEAM SCORE INCREMENT
  $scope.scoreGoalPoints = function (team, pointVar, flag) {
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

  // SAVE RESULT
  $scope.saveMatch = function (match) {
    NavigationService.saveMatchPp(match, function (data) {
      if (data.value == true) {
        $scope.getOneMatch();
        teamSelection.close();
      } else {
        toastr.error('Save Failed, Please Try Again');
      }
    });
  }


  // AUTO SAVE
  $scope.autoSave = function () {
    $scope.$on('$viewContentLoaded', function (event) {
      promise = $interval(function () {
        $scope.saveMatch($scope.match);
      }, 10000);
    })
  }
  $scope.autoSave();

  $scope.$on('$destroy', function () {
    console.log('destroy');
    $interval.cancel(promise);
  })
  // AUTO SAVE FUNCTION END
 
});