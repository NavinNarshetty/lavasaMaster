myApp.controller('MatchStartCtrl', function($scope, TemplateService, NavigationService, $timeout, $uibModal, $stateParams, $state, toastr) {
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
    // VARIABLE INITIALISE END

    // INITIALSE SWIPER
    $scope.tp=function(a){
      alert(a);
    };
    $scope.swiperInit = function() {
        $scope.$on('$viewContentLoaded', function(event) {
            $timeout(function() {
                var athleteKnow = new Swiper('.scorescard-swiper .swiper-container', {
                    paginationClickable: true,
                    loop: true,
                    grabCursor: true,
                    spaceBetween: 10,
                    nextButton: '.scorecard-next',
                    prevButton: '.scorecard-prev',
                    touchEventsTarget: 'container',
                })
            }, 100);
        })
    }
    $scope.swiperInit();
    // INITIALSE SWIPER END
    $scope.mySlides = ['1', '2', '3', '4', '5'];

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
                              "scoreSheet": []
                          }
                          _.each($scope.matchDetails.players, function(n, key) {
                              $scope.formData.players[key] = {
                                  "team": n._id,
                                  "noShow": false,
                                  "walkover": false,
                                  "sets": [{
                                      point: 0,
                                  }]
                              }
                          })
                      } else{
                        $scope.formData = $scope.matchDetails.resultsCombat;
                        if($scope.matchDetails.resultsCombat.status == 'IsCompleted'){
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
                      console.log("COMBAT TEAM!");
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
                              "scoreSheet": []
                          }
                          _.each($scope.matchDetails.players, function(n, key) {
                              $scope.formData.players[key] = {
                                  "player": n._id,
                                  "noShow": false,
                                  "walkover": false,
                                  "sets": [{
                                      point: 0,
                                      ace: 0,
                                      winner: 0,
                                      unforcedError: 0,
                                      serviceError: 0,
                                      doubleFaults: 0
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
                              "scoreSheet": []
                          }
                          _.each($scope.matchDetails.teams, function(n, key) {
                              $scope.formData.teams[key] = {
                                  "team": n._id,
                                  "noShow": false,
                                  "walkover": false,
                                  "sets": [{
                                      point: 0,
                                      ace: 0,
                                      winner: 0,
                                      unforcedError: 0,
                                      serviceError: 0,
                                      doubleFaults: 0
                                  }]
                              }
                          })
                      } else{
                        $scope.formData = $scope.matchDetails.resultsRacquet;
                        if($scope.matchDetails.resultsRacquet.status == 'IsCompleted'){
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
    }
    // NO MATCH END
    // TEAM NO MATCH
    $scope.setTeamNoMatch = function() {
      _.each($scope.formData.teams, function(team) {
          team.noShow = true;
          team.walkover = false;
      })
    }
    // TEAM NO MATCH END
    // SAVE RESULT
    $scope.saveResult = function(formData){
      console.log(formData, 'svae data');
      if(formData){
        if($scope.matchDetails.players.length == 1){
          toastr.error('Minimum 2 Players required to start scoring');
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
    } else{
        toastr.error('No data to save. Please check for valid MatchID.', 'Save Error');
      }
    }
    // SAVE RESULT END
    // SAVE WINNER
    $scope.saveWinner = function(){
      if($scope.formData.players[0].noShow == true && $scope.formData.players[1].noShow == true){
        $scope.formData.isNoMatch = true;
        $scope.formData.winner.player = "";
      } else {
        $scope.formData.isNoMatch = false;
      }
      if($scope.matchDetails.players.length == 1){
        $scope.formData.winner.reason = 'Bye';
      }
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
          alert('fail save');
        }
      });
    }
    // SAVE WINNER  END
    // SAVE TEAM WINNER
    $scope.saveTeamWinner = function(){
      if($scope.formData.teams[0].noShow == true && $scope.formData.teams[1].noShow == true){
        $scope.formData.isNoMatch = true;
        $scope.formData.winner.team = "";
      } else {
        $scope.formData.isNoMatch = false;
      }
      if($scope.formData.teams.length == 1){
        $scope.formData.winner.reason = 'Bye';
      }
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
          $state.go("home");
        } else{
          alert('fail save');
        }
      });
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

})
