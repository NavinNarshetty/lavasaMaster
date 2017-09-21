myApp.controller('MatchStartCtrl', function($scope, TemplateService, NavigationService, $timeout, $uibModal, $stateParams, $state, toastr, $rootScope) {
    $scope.template = TemplateService.getHTML("content/match-start.html");
    TemplateService.title = "Sport Match"; //This is the Title of the Website
    $scope.navigation = NavigationService.getNavigation();
    $scope.matchId=$stateParams.id;
    // VARIABLE INITIALISE
    $scope.showMatchPhoto = false;
    $scope.matchData = {};
    $scope.matchDetails = {};
    $scope.matchPics = [];
    $scope.disableWinner = false;
    $scope.matchError = "";
    $scope.showError = false;
    $scope.removeReset = true;
    // VARIABLE INITIALISE END

    //INTEGRATION
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
                $scope.matchDetails = data.data;
                $scope.matchDetails.matchId = $scope.matchData.matchId;
                console.log($scope.matchDetails, '$scope.matchDetails');
                // INITIALISE RESULTS
                switch ($scope.matchDetails.sportType) {
                  case "Combat Sports":
                    if ($scope.matchDetails.isTeam == false) {
                      console.log("COMBAT SINGLE!");
                      if ($scope.matchDetails.resultsCombat == null || $scope.matchDetails.resultsCombat == "" || $scope.matchDetails.resultsCombat == undefined) {
                        $scope.matchDetails.resultsCombat = {};
                          $scope.formData = {
                              "players": [],
                              "matchPhoto": [],
                              "scoreSheet": [],
                              "winner": {},
                              "isNoMatch": false
                          }
                          _.each($scope.matchDetails.players, function(n, key) {
                              $scope.formData.players[key] = {
                                  "player": n._id,
                                  "noShow": false,
                                  "walkover": false,
                                  "sets": [{
                                      point: "",
                                  }]
                              }
                          })
                      } else{
                        $scope.formData = $scope.matchDetails.resultsCombat;
                        if($scope.matchDetails.resultsCombat.status == 'IsCompleted'){
                          toastr.warning("This match has already been scored.", "Match Complete");
                          if ($stateParams.drawFormat === 'Knockout') {
                              $state.go('knockout', {
                                drawFormat: $stateParams.drawFormat,
                                id: $stateParams.sport
                              });
                          } else if ($stateParams.drawFormat === 'Heats') {
                              $state.go('heats', {
                                drawFormat: $stateParams.drawFormat,
                                id: $stateParams.sport
                              });
                          }
                        }
                      }
                    } else if ($scope.matchDetails.isTeam == true) {
                      if ($scope.matchDetails.resultsCombat == null || $scope.matchDetails.resultsCombat == "" || $scope.matchDetails.resultsCombat == undefined) {
                        $scope.matchDetails.resultsCombat = {};
                          $scope.formData = {
                              "teams": [],
                              "matchPhoto": [],
                              "scoreSheet": [],
                              "winner": {},
                              "isNoMatch": false
                          }
                          _.each($scope.matchDetails.teams, function(n, key) {
                              $scope.formData.teams[key] = {
                                  "team": n._id,
                                  "teamId": n.teamId,
                                  "schoolName": n.schoolName,
                                  "noShow": false,
                                  "walkover": false,
                                  "sets": [{
                                      point: "",
                                  }]
                              }
                          })
                          _.each($scope.matchDetails.teams[key].studentTeam, function (m, mkey) {
                              $scope.formData.teams[key].players[mkey] = {
                                  "player": m.studentId._id,
                                  "firstName": m.studentId.firstName,
                                  "surname": m.studentId.surname,
                                  "fullName": m.studentId.firstName + " " + m.studentId.surname,
                                  "isPlaying": false,
                                  "jerseyNo": "",
                              }
                          })
                      } else{
                        $scope.formData = $scope.matchDetails.resultsCombat;
                        if($scope.matchDetails.resultsCombat.status == 'IsCompleted'){
                          toastr.warning("This match has already been scored.", "Match Complete");
                          if ($stateParams.drawFormat === 'Knockout') {
                              $state.go('knockout-team', {
                                drawFormat: $stateParams.drawFormat,
                                id: $stateParams.sport
                              });
                          } else if ($stateParams.drawFormat === 'Heats') {
                              $state.go('heats', {
                                drawFormat: $stateParams.drawFormat,
                                id: $stateParams.sport
                              });
                          }
                        }
                      }
                    }
                  break;
                  case "Racquet Sports":
                    if ($scope.matchDetails.isTeam == false) {
                      console.log("RACQUET SINGLE!");
                      if ($scope.matchDetails.resultsRacquet == null || $scope.matchDetails.resultsRacquet == "" || $scope.matchDetails.resultsRacquet == undefined) {
                        $scope.matchDetails.resultsRacquet = {};
                          $scope.formData = {
                              "players": [],
                              "matchPhoto": [],
                              "scoreSheet": [],
                              "winner": {},
                              "isNoMatch": false
                          }
                          _.each($scope.matchDetails.players, function(n, key) {
                              $scope.formData.players[key] = {
                                  "player": n._id,
                                  "noShow": false,
                                  "walkover": false,
                                  "sets": [{
                                      point: "",
                                      ace: "",
                                      winner: "",
                                      unforcedError: "",
                                      serviceError: "",
                                      doubleFaults: ""
                                  }]
                              }
                          })
                      } else{
                        $scope.formData = $scope.matchDetails.resultsRacquet;
                        if($scope.matchDetails.resultsRacquet.status == 'IsCompleted'){
                          if ($stateParams.drawFormat === 'Knockout') {
                            toastr.warning("This match has already been scored.", 'Scoring Completed');
                              $state.go('knockout', {
                                drawFormat: $stateParams.drawFormat,
                                id: $stateParams.sport
                              });
                          } else if ($stateParams.drawFormat === 'Heats') {
                            toastr.warning("This match has already been scored.", 'Scoring Completed');
                              $state.go('heats', {
                                drawFormat: $stateParams.drawFormat,
                                id: $stateParams.sport
                              });
                          }
                        }
                      }
                    } else if ($scope.matchDetails.isTeam == true) {
                      console.log("RACQUET TEAMS!");
                      if ($scope.matchDetails.resultsRacquet == null || $scope.matchDetails.resultsRacquet == "" || $scope.matchDetails.resultsRacquet == undefined) {
                        $scope.matchDetails.resultsRacquet = {};
                          $scope.formData = {
                              "teams": [],
                              "matchPhoto": [],
                              "scoreSheet": [],
                              "winner": {},
                              "isNoMatch": false
                          }
                          _.each($scope.matchDetails.teams, function(n, key) {
                              $scope.formData.teams[key] = {
                                  "team": n._id,
                                  "teamId": n.teamId,
                                  "schoolName": n.schoolName,
                                  "noShow": false,
                                  "walkover": false,
                                  "sets": [{
                                      point: "",
                                      ace: "",
                                      winner: "",
                                      unforcedError: "",
                                      serviceError: "",
                                      doubleFaults: ""
                                  }]
                              }
                          })
                      } else{
                        $scope.formData = $scope.matchDetails.resultsRacquet;
                        if($scope.matchDetails.resultsRacquet.status == 'IsCompleted'){
                          toastr.warning("This match has already been scored.", "Match Complete");
                          if ($stateParams.drawFormat === 'Knockout') {
                              $state.go('knockout-doubles', {
                                drawFormat: $stateParams.drawFormat,
                                id: $stateParams.sport
                              });
                          } else if ($stateParams.drawFormat === 'Heats') {
                              $state.go('heats', {
                                drawFormat: $stateParams.drawFormat,
                                id: $stateParams.sport
                              });
                          }
                        }
                      }
                    }
                  break;
                  case "Team Sports":
                    switch ($scope.matchDetails.sportsName) {
                      case "Football":
                        if($scope.matchDetails.resultFootball == null || $scope.matchDetails.resultFootball == "" || $scope.matchDetails.resultFootball == undefined){
                          $scope.matchDetails.resultFootball = {};
                          $scope.formData = {
                            "teams": [],
                            "matchPhoto": [],
                            "scoreSheet": [],
                            "status": "",
                            "winner": {},
                            "isNoMatch": false
                          }
                          _.each($scope.matchDetails.teams, function(n, key) {
                              $scope.formData.teams[key] = {
                                  "team": n._id,
                                  "noShow": false,
                                  "walkover": false,
                                  "players": [],
                                  "teamResults": {
                                    halfPoints: "",
                                    finalPoints: "",
                                    penalityPoints: "",
                                    shotsOnGoal: "",
                                    totalShots: "",
                                    corners: "",
                                    penality: "",
                                    saves: "",
                                    fouls: "",
                                    offSide: "",
                                    cleanSheet: ""
                                  }
                              }
                              _.each($scope.matchDetails.teams[key].studentTeam, function(m, mkey){
                                $scope.formData.teams[key].players[mkey] = {
                                  "player" : m.studentId._id,
                                  "isPlaying": false,
                                  "jerseyNo": "",
                                  "playerPoints": {
                                    "goals": [],
                                    "assist": [],
                                    "redCard": [],
                                    "yellowCard": [],
                                    "penalityPoint": "",
                                    "in": [],
                                    "out": []
                                  }
                                }
                              })
                          });
                        } else{
                          toastr.success('Wallah habibi');
                        }
                        console.log($scope.formData, 'football result');
                      break;
                    }
                  break;
                }
            // INITIALISE RESULTS END
            } else {
                console.log("ERROR IN getOneMatch");
                //redirect back to sportselection page
                    // $state.go("sport-selection");
            }
        })
    };
    $scope.getOneMatch();
    // GET MATCH END
    // GET MATCH SCORESHEET
    $scope.getMatchPhoto = function(detail) {
        console.log(detail, 'pic return');
        $scope.showMatchPhoto = true;
        $scope.swiperInit();
    };
    // GET MATCH SCORESHEET END
    // REMOVE MATCH SCORESHEET
    $scope.removeMatchScore = function(pic) {
      _.remove($scope.formData.matchPhoto, function(n) {
        return n.image === pic.image;
      })
    }
    // REMOVE MATCH SCORESHEET END
    // NO MATCH
    $scope.setNoMatch = function() {
      _.each($scope.formData.players, function(player) {
          player.noShow = true;
          player.walkover = false;
      })
      $scope.formData.isNoMatch = true;
    }
    // NO MATCH END
    // TEAM NO MATCH
    $scope.setTeamNoMatch = function() {
      _.each($scope.formData.teams, function(team) {
          team.noShow = true;
          team.walkover = false;
      })
      $scope.formData.isNoMatch = true;
    }
    // TEAM NO MATCH END
    // SAVE RESULT
    $scope.saveResult = function(formData){
      console.log(formData, 'svae data');
      if(formData){
        if($scope.matchDetails.players.length == 1){
          toastr.error('Minimum 2 Players required to start scoring');
        } else {
          if (formData.matchPhoto.length == 0) {
            toastr.error('Please upload match photo.', 'Data Incomplete');
          } else {
            $scope.matchResult = {
              matchId: $scope.matchData.matchId
            }
            switch ($scope.matchDetails.sportType) {
              case "Combat Sports":
                $scope.matchResult.resultsCombat = formData;
                if(!$scope.matchResult.resultsCombat.status){
                  $scope.matchResult.resultsCombat.status = "IsLive";
                }
              break;
              case "Racquet Sports":
                $scope.matchResult.resultsRacquet = formData;
                if(!$scope.matchResult.resultsRacquet.status){
                  $scope.matchResult.resultsRacquet.status = "IsLive";
                }
              break;
            }
            NavigationService.saveMatch($scope.matchResult, function(data){
              if(data.value == true){
                switch ($scope.matchDetails.sportType) {
                  case "Combat Sports":
                  if($scope.matchDetails.isTeam==false){
                    $state.go("scorecombat",{
                      drawFormat: $stateParams.drawFormat,
                      sport: $stateParams.sport,
                      id: $scope.matchData.matchId
                    });
                  } else if ($scope.matchDetails.isTeam==true) {
                    $state.go("scorecombatteam",{
                      drawFormat: $stateParams.drawFormat,
                      sport: $stateParams.sport,
                      id: $scope.matchData.matchId
                    });
                  }

                  break;
                  case "Racquet Sports":
                  if($scope.matchDetails.isTeam==false){
                    $state.go("scoreracquet",{
                      drawFormat: $stateParams.drawFormat,
                      sport: $stateParams.sport,
                      id: $scope.matchData.matchId
                    });
                  } else if ($scope.matchDetails.isTeam==true) {
                    $state.go("scoreracquetdoubles",{
                      drawFormat: $stateParams.drawFormat,
                      sport: $stateParams.sport,
                      id: $scope.matchData.matchId
                    });
                  }

                  break;
                }
              } else{
                toastr.error('Data save failed. Please try again or check your internet connection.', 'Save Error');
              }
            });
          }
      }
    } else{
        toastr.error('No data to save. Please check for valid MatchID.', 'Save Error');
      }
    }
    // SAVE RESULT END
    // SAVE TEAM RESULT
    $scope.saveTeamResult = function(formData){
      console.log(formData, 'svae data');
      if(formData){
        if($scope.matchDetails.teams.length == 1){
          toastr.error('Minimum 2 Teams required to start scoring');
        } else {
          if (formData.matchPhoto.length == 0) {
            toastr.error('Please upload match photo.', 'Data Incomplete');
          } else {

        $scope.matchResult = {
          matchId: $scope.matchData.matchId
        }
        switch ($scope.matchDetails.sportType) {
          case "Combat Sports":
            $scope.matchResult.resultsCombat = formData;
            if(!$scope.matchResult.resultsCombat.status){
              $scope.matchResult.resultsCombat.status = "IsLive";
            }
          break;
          case "Racquet Sports":
            $scope.matchResult.resultsRacquet = formData;
            if(!$scope.matchResult.resultsRacquet.status){
              $scope.matchResult.resultsRacquet.status = "IsLive";
            }
          break;
        }
        NavigationService.saveMatch($scope.matchResult, function(data){
          if(data.value == true){
            switch ($scope.matchDetails.sportType) {
              case "Combat Sports":
                $state.go("scorecombatteam",{
                  drawFormat: $stateParams.drawFormat,
                  sport: $stateParams.sport,
                  id: $scope.matchData.matchId
                });

              break;
              case "Racquet Sports":
                $state.go("scoreracquetdoubles",{
                  drawFormat: $stateParams.drawFormat,
                  sport: $stateParams.sport,
                  id: $scope.matchData.matchId
                });

              break;
            }
          } else{
            toastr.error('Data save failed. Please try again.', 'Save Error');
          }
        });
      }
    }
    } else{
        toastr.error('No data to save. Please check for valid MatchID.', 'Save Error');
      }
    }
    // SAVE TEAM RESULT END
    // UPDATE WINNER RESULT
    $scope.updateWinnerResult = function(){
      $scope.matchResult = {
        matchId: $scope.matchData.matchId
      }
      switch ($scope.matchDetails.sportType) {
        case "Combat Sports":
          $scope.matchResult.resultsCombat = $scope.formData;
          $scope.matchResult.resultsCombat.status = "IsCompleted";
        break;
        case "Racquet Sports":
          $scope.matchResult.resultsRacquet = $scope.formData;
          $scope.matchResult.resultsRacquet.status = "IsCompleted";
        break;
      }
      NavigationService.saveMatch($scope.matchResult, function(data){
        if(data.value == true){
          if ($stateParams.drawFormat === 'Knockout') {
              $state.go('knockout', {
                drawFormat: $stateParams.drawFormat,
                id: $stateParams.sport
              });
          } else if ($stateParams.drawFormat === 'Heats') {
              $state.go('heats', {
                drawFormat: $stateParams.drawFormat,
                id: $stateParams.sport
              });
          }
        } else{
          toastr.error('Match save failed. Please try again','Scoring Save Failed');
        }
      });
    }
    // SAVE WINNER
    $scope.saveWinner = function(){
      console.log($scope.formData, 'savedata');
      if($scope.matchDetails.players.length == 1){
        if($scope.formData.players[0].noShow == true){
          $scope.formData.isNoMatch = true;
          $scope.formData.winner.player = "";
          $scope.formData.winner.opponentsSingle = "";
          $scope.updateWinnerResult();
        } else{
          $scope.formData.isNoMatch = false;
          if($scope.formData.winner.player =="" || !$scope.formData.winner.player){
            toastr.warning('Please select a winner');
          } else {
            if ($scope.formData.players[0].walkover == true ) {
              $scope.updateWinnerResult();
            } else {
              $scope.formData.winner.reason = 'Bye';
              $scope.updateWinnerResult();
            }
          }
        }
      } else{
        if($scope.formData.players[0].noShow == true && $scope.formData.players[1].noShow == true){
          $scope.formData.isNoMatch = true;
          $scope.formData.winner = {};
          $scope.formData.winner.player = "";
          $scope.formData.winner.opponentsSingle = "";
          $scope.updateWinnerResult();
        } else {
          $scope.formData.isNoMatch = false;
          if($scope.formData.winner.player =="" || !$scope.formData.winner.player){
            toastr.warning('Please select a winner');
          } else{
            _.each($scope.formData.players,function(n){
              if($scope.formData.winner.player == n.player){
                n.walkover = true;
                n.noShow = false;
              } else{
                n.walkover = false;
                n.noShow = true;
              }
            })
            $scope.updateWinnerResult();
          }
        }
      }
    }
    // SAVE WINNER  END
    // SAVE TEAM WINNER
    $scope.updateTeamWinner = function () {
      $scope.matchResult = {
        matchId: $scope.matchData.matchId
      }
      switch ($scope.matchDetails.sportType) {
        case "Combat Sports":
          $scope.matchResult.resultsCombat = $scope.formData;
          $scope.matchResult.resultsCombat.status = "IsCompleted";
        break;
        case "Racquet Sports":
          $scope.matchResult.resultsRacquet = $scope.formData;
          $scope.matchResult.resultsRacquet.status = "IsCompleted";
        break;
      }
      NavigationService.saveMatch($scope.matchResult, function(data){
        if(data.value == true){
          if ($stateParams.drawFormat === 'Knockout') {
              $state.go('knockout-doubles', {
                drawFormat: $stateParams.drawFormat,
                id: $stateParams.sport
              });
          } else if ($stateParams.drawFormat === 'Heats') {
              $state.go('heats', {
                drawFormat: $stateParams.drawFormat,
                id: $stateParams.sport
              });
          }
        } else{
          alert('fail save');
        }
      });
    }
    $scope.saveTeamWinner = function(){
      if($scope.matchDetails.teams.length == 1){
        if($scope.formData.teams[0].noShow == true){
          $scope.formData.isNoMatch = true;
          $scope.formData.winner.player = "";
          $scope.updateTeamWinner();
        } else{
          $scope.formData.isNoMatch = false;
          if($scope.formData.winner.player =="" || !$scope.formData.winner.player){
            toastr.warning('Please select a winner');
          } else {
            if ($scope.formData.teams[0].walkover == true ) {
              $scope.updateTeamWinner();
            } else {
              $scope.formData.winner.reason = 'Bye';
              $scope.updateTeamWinner();
            }
          }
        }
      } else{
        if($scope.formData.teams[0].noShow == true && $scope.formData.teams[1].noShow == true){
          $scope.formData.isNoMatch = true;
          $scope.formData.winner = {};
          $scope.formData.winner.player = "";
          $scope.updateTeamWinner();
        } else {
          $scope.formData.isNoMatch = false;
          if($scope.formData.winner.player =="" || !$scope.formData.winner.player){
            toastr.warning('Please select a winner');
          } else{
            _.each($scope.formData.teams,function(n){
              if($scope.formData.winner.player == n.team){
                n.walkover = true;
                n.noShow = false;
              } else{
                n.walkover = false;
                n.noShow = true;
              }
            })
            $scope.updateTeamWinner();
          }
        }
      }
    }
    // SAVE TEAM WINNER END
    // INTEGRATION END

    // OPEN MATCH-NO MATCH MODAL
    $scope.showNoMatch = function() {
      if($scope.formData){
        if ($scope.matchDetails.isTeam == false) {
          $uibModal.open({
            animation: true,
            scope: $scope,
            backdrop: 'static',
            keyboard: false,
            templateUrl: 'views/modal/match-nomatch.html',
            size: 'lg',
            windowClass: 'match-nomatch'
          })
        } else if ($scope.matchDetails.isTeam == true) {
          $uibModal.open({
            animation: true,
            scope: $scope,
            backdrop: 'static',
            keyboard: false,
            templateUrl: 'views/modal/team-match-nomatch.html',
            size: 'lg',
            windowClass: 'match-nomatch'
          })
        }

      }else{
        toastr.error('No player data to enter.', 'Error');
      }

    }
    // OPEN MATCH-NO MATCH MODAL
    // RESET RESULT POPUP
    $scope.resetResultPop = function(){
        $rootScope.modalInstance = $uibModal.open({
          animation: true,
          scope: $scope,
          templateUrl: 'views/modal/resetresult.html',
          windowClass: 'completematch-modal resetresult-modal'
        })
    }
    // RESET RESULT POPUP END
    // RESET MATCH RESULT
    $scope.resetMatchResult = function(){
      $scope.formData = {};
      $scope.matchResult = {
        matchId: $scope.matchData.matchId
      }
      switch ($scope.matchDetails.sportType) {
        case "Combat Sports":
          $scope.matchResult.resultsCombat = $scope.formData;
          if(!$scope.matchResult.resultsCombat.status){
            $scope.matchResult.resultsCombat.status = "IsLive";
          }
        break;
        case "Racquet Sports":
          $scope.matchResult.resultsRacquet = $scope.formData;
          if(!$scope.matchResult.resultsRacquet.status){
            $scope.matchResult.resultsRacquet.status = "IsLive";
          }
        break;
      }
      NavigationService.saveMatch($scope.matchResult, function(data){
        if(data.value == true){
          $rootScope.modalInstance.close('a');
          toastr.success('Match result has been successfully reset', 'Result Reset');
          if ($stateParams.drawFormat === 'Knockout') {
              $state.go('knockout', {
                drawFormat: $stateParams.drawFormat,
                id: $stateParams.sport
              });
          } else if ($stateParams.drawFormat === 'Heats') {
              $state.go('heats', {
                drawFormat: $stateParams.drawFormat,
                id: $stateParams.sport
              });
          }
        } else{
          toastr.error('Match result reset failed. Please try again', 'Result Reset Failed');
        }
      });
    }
    // RESET MATCH RESULT
    // REMOVE RESET
    $scope.removeReset = function(){
      $scope.removeReset = false;
    }
    // REMOVE RESET END

})
