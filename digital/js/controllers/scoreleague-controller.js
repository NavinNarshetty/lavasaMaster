myApp.controller('LeagueScoreCtrl', function($scope, TemplateService, NavigationService, $timeout, $uibModal, $stateParams, $state, $interval, toastr, $rootScope) {
    $scope.template = TemplateService.getHTML("content/score-league.html");
    TemplateService.title = "Score League"; //This is the Title of the Website
    $scope.navigation = NavigationService.getNavigation();
    // VARIABLE INITIALISE
    $scope.matchId=$stateParams.id;
    $scope.match={};
    $scope.showScoreSheet = false;
    $scope.showMatchPhoto = false;
    $scope.matchData = {};
    var promise;
    $scope.stateParam = $stateParams;
    // $scope.matchData = {};
    // VARIABLE INITIALISE END


    // API CALLN INTEGRATION
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

        console.log("getone", $scope.match);
    };
    $scope.getOneMatch();
    // GET MATCH END
    // SAVE RESULT
    $scope.saveResult = function(formData){
      $scope.matchResult = {
        resultFencing : formData.resultFencing,
        matchId: $scope.matchData.matchId
      }
      NavigationService.saveFencing($scope.matchResult, function(data){
        if(data.value == true){
          console.log('save success');
        } else{
          alert('fail save');
        }
      });
    }
    // SAVE RESULT END
    // AUTO SAVE FUNCTION
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
    // MATCH COMPLETE
    $scope.completePopup = function(){
      if($scope.match.resultFencing.matchPhoto.length == 0){
        toastr.error('Please upload match photo.', 'Data Incomplete');
      } else if ($scope.match.resultFencing.scoreSheet.length == 0) {
        toastr.error('Please upload scoresheet.', 'Data Incomplete');
      } else if(!$scope.match.resultFencing.winner.player){
        toastr.error('Please select a winner.', 'Data Incomplete');
      } else {
        console.log("comp", $scope.match);
      var modalCompleteMatch;
        $rootScope.modalInstance = $uibModal.open({
          animation: true,
          scope: $scope,
          templateUrl: 'views/modal/confirmcomplete.html',
          windowClass: 'completematch-modal'
        })
      }
    };
    $scope.matchComplete = function(){
      if ($scope.match.resultFencing) {
        $scope.match.resultFencing.status = "IsCompleted";
          $scope.matchResult = {
            resultFencing : $scope.match.resultFencing,
            matchId: $scope.matchData.matchId
          }
          NavigationService.saveFencing($scope.matchResult, function(data){
            if(data.value == true){
              $state.go('league-knockout', {
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
    // API CALLN INTEGRATION END

    $scope.reasons = ['WP', 'RSC', 'RSC-I', 'DSQ', 'KO', 'WO', 'NC'];

    // SCORE INCREMENT
    $scope.incrementLeague = function(player) {
        $scope.player = player;
              if ($scope.player.finalPoints == "") {
                $scope.player.finalPoints = 1;
              } else {
                $scope.player.finalPoints = $scope.player.finalPoints + 1;
              }
        console.log("increment");
    };
    // SCORE INCREMENT END
    // SCORE DECREMENT
    $scope.decrementLeague = function(player) {
        $scope.player = player;
          if ($scope.player.finalPoints > 0) {
              $scope.player.finalPoints = $scope.player.finalPoints - 1;
          }
        console.log("decrement");
    };
    // SCORE DECREMENT END
    // REMOVE MATCH SCORESHEET
    $scope.removeMatchScore = function(pic, type) {
      switch (type) {
        case 'matchPhoto':
          _.remove($scope.match.resultFencing.matchPhoto, function(n) {
              return n.image === pic.image;
          })
        break;
        case 'scoreSheet':
          _.remove($scope.match.resultFencing.scoreSheet, function(n) {
            return n.image === pic.image;
          })
        break;
      }
    }
    // REMOVE MATCH SCORESHEET END
    // JSON
    // DUMMY RESULT FENCING
    $scope.resultDummy  = {
        "players":[{
          "player":"5927c073ca58e7532822f4e8",
          "firstName":"Chris",
          "surname":"Gayle",
          "fullName":"Chris Gayle",
          "sfaId":"MA1721",
          "noShow":false,
          "walkover":false,
          "finalPoints": 2
        },{
          "player":"592814c7efc661782c07aca3",
          "firstName":"Venky",
          "surname":"Rathod",
          "fullName":"Venky Rathod",
          "sfaId":"MA1713",
          "noShow":false,
          "walkover":false,
          "finalPoints": 3
        }],
        "matchPhoto":[{
          "image":"5a03543c1b0d0a114f704154.jpg"
        }],
        "scoreSheet":[],
        "winner":{},
        "isNoMatch":false,
        "status":"IsLive"
      }
      // DUMMY RESULT FENCING END
    // JSON END
})
