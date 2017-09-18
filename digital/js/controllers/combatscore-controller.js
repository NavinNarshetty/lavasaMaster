myApp.controller('CombatScoreCtrl', function($scope, TemplateService, NavigationService, $timeout, $uibModal, $stateParams, $state, $interval, toastr, $rootScope) {
    $scope.template = TemplateService.getHTML("content/score-combat.html");
    TemplateService.title = "Score Combat"; //This is the Title of the Website
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
    };
    $scope.getOneMatch();
    // GET MATCH END
    // SAVE RESULT
    $scope.saveResult = function(formData){
      $scope.matchResult = {
        resultsCombat : formData.resultsCombat,
        matchId: $scope.matchData.matchId
      }
      NavigationService.saveMatch($scope.matchResult, function(data){
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
      if($scope.match.resultsCombat.matchPhoto.length == 0){
        toastr.error('Please upload match photo.', 'Data Incomplete');
      } else if ($scope.match.resultsCombat.scoreSheet.length == 0) {
        toastr.error('Please upload scoresheet.', 'Data Incomplete');
      } else if(!$scope.match.resultsCombat.winner.player){
        toastr.error('Please select a winner.', 'Data Incomplete');
      } else {

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
      if ($scope.match.resultsCombat) {
        $scope.match.resultsCombat.status = "IsCompleted";
          $scope.matchResult = {
            resultsCombat : $scope.match.resultsCombat,
            matchId: $scope.matchData.matchId
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
    $scope.incrementScore = function(set, model) {
        $scope.set = set;
        switch (model) {
            case 'point':
                $scope.set.point = $scope.set.point + 1;
                break;
        }
        console.log("increment");
    };
    // SCORE INCREMENT END
    // SCORE DECREMENT
    $scope.decrementScore = function(set, model) {
        $scope.set = set;
        switch (model) {
            case 'point':
                if ($scope.set.point > 0) {
                    $scope.set.point = $scope.set.point - 1;
                }
                break;
        }
        console.log("decrement");
    };
    // SCORE DECREMENT END
    // REMOVE MATCH SCORESHEET
    $scope.removeMatchScore = function(pic, type) {
      switch (type) {
        case 'matchPhoto':
          _.remove($scope.match.resultsCombat.matchPhoto, function(n) {
              return n.image === pic.image;
          })
        break;
        case 'scoreSheet':
          _.remove($scope.match.resultsCombat.scoreSheet, function(n) {
            return n.image === pic.image;
          })
        break;
      }
    }
    // REMOVE MATCH SCORESHEET END
})
