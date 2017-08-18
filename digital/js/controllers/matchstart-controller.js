myApp.controller('MatchStartCtrl', function($scope, TemplateService, NavigationService, $timeout, $uibModal, $stateParams, $state) {
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
                $scope.matchDetails = data.data;
                $scope.matchDetails.matchId = $scope.matchData.matchId;
                    // INITIALISE RESULTS
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
      console.log($scope.matchDetails.resultsCombat.players, 'player');
    }
    // NO MATCH END
    // SAVE RESULT
    $scope.saveResult = function(formData){
      $scope.matchResult = {
        resultsCombat : formData,
        matchId: $scope.matchData.matchId
      }
      NavigationService.saveMatch($scope.matchResult, function(data){
        if(data.value == true){
          $state.go("scorecombat",{
            id: $scope.matchData.matchId
          });
        } else{
          alert('fail save');
        }
      });
      console.log($scope.matchResult, 'result#');
    }
    // SAVE RESULT END
    // SAVE WINNER
    $scope.saveWinner = function(){
      if($scope.formData.players[0].noShow == true && $scope.formData.players[1].noShow == true){
        $scope.formData.isNoMatch = true;
      } else {
        $scope.formData.isNoMatch = false;
      }
      $scope.matchResult = {
        resultsCombat : $scope.formData,
        matchId: $scope.matchData.matchId
      }
      NavigationService.saveMatch($scope.matchResult, function(data){
        if(data.value == true){
          $state.go("home");
        } else{
          alert('fail save');
        }
      });
      // $state.go("home");
    }
    // SAVE WINNER  END
    // INTEGRATION END

    // OPEN MATCH-NO MATCH MODAL
    $scope.showNoMatch = function() {
      $uibModal.open({
        animation: true,
        scope: $scope,
        backdrop: 'static',
        keyboard: false,
        templateUrl: 'views/modal/match-nomatch.html',
        size: 'lg',
        windowClass: 'match-nomatch'
      })
    }
    // OPEN MATCH-NO MATCH MODAL

})
