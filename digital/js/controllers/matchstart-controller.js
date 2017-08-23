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
                if ($scope.matchDetails.sportType == "Combat Sports") {
                  if ($scope.matchDetails.resultsCombat == null || $scope.matchDetails.resultsCombat == "" || $scope.matchDetails.resultsCombat == undefined) {
                    $scope.matchDetails.resultsCombat = {};
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
                              }]
                          }
                      })
                  } else{
                    $scope.formData = $scope.matchDetails.resultsCombat;
                  }
            } else if ($scope.matchDetails.sportType == "Racquet Sports") {
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
              }
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
    // SAVE RESULT
    $scope.saveResult = function(formData){
      if(formData){
        $scope.matchResult = {
          matchId: $scope.matchData.matchId
        }
        switch ($scope.matchDetails.sportType) {
          case "Combat Sports":
            $scope.matchResult.resultsCombat = formData;
            $scope.matchResult.resultsCombat.status = "IsLive";
          break;
          case "Racquet Sports":
            $scope.matchResult.resultsRacquet = formData;
            $scope.matchResult.resultsRacquet.status = "IsLive";
          break;
        }
        NavigationService.saveMatch($scope.matchResult, function(data){
          if(data.value == true){
            switch ($scope.matchDetails.sportType) {
              case "Combat Sports":
              if($scope.matchDetails.isTeam==false){
                $state.go("scorecombat",{
                  id: $scope.matchData.matchId
                });
              } else if ($scope.matchDetails.isTeam==true) {
                $state.go("scorecombatteam",{
                  id: $scope.matchData.matchId
                });
              }

              break;
              case "Racquet Sports":
              if($scope.matchDetails.isTeam==false){
                $state.go("scoreracquet",{
                  id: $scope.matchData.matchId
                });
              } else if ($scope.matchDetails.isTeam==true) {
                $state.go("scoreracquetdoubles",{
                  id: $scope.matchData.matchId
                });
              }

              break;
            }
          } else{
            toastr.error('Data save failed. Please try again or check your internet connection.', 'Save Error');
          }
        });
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
    // SAVE WINNER  END
    // INTEGRATION END

    // OPEN MATCH-NO MATCH MODAL
    $scope.showNoMatch = function() {
      if($scope.formData){
        $uibModal.open({
          animation: true,
          scope: $scope,
          backdrop: 'static',
          keyboard: false,
          templateUrl: 'views/modal/match-nomatch.html',
          size: 'lg',
          windowClass: 'match-nomatch'
        })
      }else{
        toastr.error('No player data to enter.', 'Error');
      }

    }
    // OPEN MATCH-NO MATCH MODAL

})
