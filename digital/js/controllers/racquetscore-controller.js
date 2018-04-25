myApp.controller('RacquetScoreCtrl', function($scope, TemplateService, NavigationService, $timeout, $uibModal,$stateParams, $state, $interval, toastr, $rootScope) {
    $scope.template = TemplateService.getHTML("content/score-racquet.html");
    TemplateService.title = "Score Racquet"; //This is the Title of the Website
    $scope.navigation = NavigationService.getNavigation();

    // VARIABLE INITIALISE
    $scope.match = {};
    $scope.matchData = {};
    var promise;
    $scope.showSet = true;
    $scope.setDisplay = {
      value: 0
    };
    $scope.setDelete = {
      value: 0
    };
    $scope.setLength  = [];
    $scope.matchError = "";
    $scope.stateParam = $stateParams;
    $scope.btnDisable = false;
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
                _.each($scope.match.resultsRacquet.players[0].sets, function(n,key){
                  $scope.setLength[key] = {
                    setShow : true
                  }
                })
                console.log($scope.setLength, 'setlength');
                console.log($scope.match, 'match');
                // $scope.autoSave();
                if($scope.match.resultsRacquet.status == 'IsCompleted'){
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
            } else {
                console.log("ERROR IN getOneMatch");
            }
        })
    };
    $scope.getOneMatch();
    // GET MATCH END
    // SAVE RESULT
    $scope.saveResult = function(formData){
      console.log(formData, 'form');
      $scope.matchResult = {
        resultsRacquet : formData.resultsRacquet,
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
      if($scope.match){
        console.log('auto start');
        $scope.$on('$viewContentLoaded', function(event) {
          promise = $interval(function () {
            $scope.saveResult($scope.match);
            console.log('auto');
          }, 10000);
        })
      }
    }
    $scope.autoSave();
    // AUTO SAVE FUNCTION END
    // DESTROY AUTO SAVE
      $scope.$on('$destroy', function(){
        console.log('destroy');
        $interval.cancel(promise);
      })
    // DESTROY AUTO SAVE END
    // MATCH COMPLETE
    $scope.completePopup = function(){
      // if($scope.match.resultsRacquet.matchPhoto.length == 0){
      //   toastr.error('Please upload match photo.', 'Data Incomplete');
      // } else if ($scope.match.resultsRacquet.scoreSheet.length == 0) {
      //   toastr.error('Please upload scoresheet.', 'Data Incomplete');
      // } else
      if(!$scope.match.resultsRacquet.winner.player){
        toastr.error('Please select a winner.', 'Data Incomplete');
      } else {
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
    $scope.matchComplete = function(){
      if($scope.match.resultsRacquet){
      _.each($scope.match.resultsRacquet.players, function(n){
        _.each(n.sets, function(m){
          if (m.point == "") {
            m.point = 0;
          }
          if (m.ace == "") {
            m.ace = 0;
          }
          if (m.unforcedError == "") {
            m.unforcedError = 0;
          }
          if (m.serviceError == "") {
            m.serviceError = 0;
          }
          if (m.doubleFaults == "") {
            m.doubleFaults = 0;
          }
          if (m.winner == "") {
            m.winner = 0;
          }
        })
      });
      $scope.btnDisable = true;
      $scope.match.resultsRacquet.status = "IsCompleted";
      $scope.matchResult = {
        resultsRacquet : $scope.match.resultsRacquet,
        matchId: $scope.matchData.matchId
      }
      $interval.cancel(promise);
      NavigationService.saveMatch($scope.matchResult, function(data){
        if(data.value == true){
          $scope.btnDisable = false;
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
    } else{
      toastr.error('No data to save. Please check for valid MatchID.', 'Save Error');
    }

    }
    // MATCH COMPLETE END
    // API CALLN INTEGRATION END

    // SCORE INCREMENT
    $scope.incrementScore = function(set, model){
      $scope.set = set;
      switch (model) {
        case 'ace':
          if ($scope.set.ace == "") {
            $scope.set.ace = 1;
          } else {
            $scope.set.ace = $scope.set.ace + 1;
          }
        break;
        case 'winner':
          if ($scope.set.winner == "") {
            $scope.set.winner = 1;
          } else {
            $scope.set.winner = $scope.set.winner + 1;
          }
        break;
        case 'unforcedError':
          if ($scope.set.unforcedError == "") {
            $scope.set.unforcedError = 1;
          } else{
            $scope.set.unforcedError = $scope.set.unforcedError + 1;
          }
        break;
        case 'serviceError':
          if ($scope.set.serviceError == "") {
            $scope.set.serviceError = 1;
          } else {
            $scope.set.serviceError = $scope.set.serviceError + 1;
          }
        break;
        case 'doubleFaults':
          if ($scope.set.doubleFaults == "") {
            $scope.set.doubleFaults = 1;
          } else {
            $scope.set.doubleFaults = $scope.set.doubleFaults + 1;
          }
        break;
      }
      console.log("increment");
    };
    // SCORE INCREMENT END
    // SCORE DECREMENT
    $scope.decrementScore = function(set, model){
      $scope.set = set;
      switch (model) {
        case 'ace':
          if($scope.set.ace>0 ){
            $scope.set.ace = $scope.set.ace - 1;
          }
        break;
        case 'winner':
        if($scope.set.winner>0 ){
          $scope.set.winner = $scope.set.winner - 1;
        }
        break;
        case 'unforcedError':
          if($scope.set.unforcedError>0 ){
            $scope.set.unforcedError = $scope.set.unforcedError - 1;
          }
        break;
        case 'serviceError':
          if($scope.set.serviceError>0 ){
            $scope.set.serviceError = $scope.set.serviceError - 1;
          }
        break;
        case 'doubleFaults':
          if($scope.set.doubleFaults>0 ){
            $scope.set.doubleFaults = $scope.set.doubleFaults - 1;
          }
        break;
      }
      console.log("decrement");
    };
    // SCORE DECREMENT END
    // ADD SET
    $scope.addSet = function(){
      _.each($scope.match.resultsRacquet.players, function(n){
        n.sets.push({
              point: "",
              ace: "",
              winner: "",
              unforcedError: "",
              serviceError: "",
              doubleFaults: ""
        });
      })
      _.each($scope.match.resultsRacquet.players[0].sets, function(n,key){
        $scope.setLength[key] = {
          setShow : true
        }
      })
      $scope.setDisplay.value = $scope.match.resultsRacquet.players[0].sets.length - 1;
    }
    // ADD SET END
    // REMOVE SET
    $scope.removeSets = function(){
      var modalSetDelete;
        $rootScope.modalInstance = $uibModal.open({
          animation: true,
          scope: $scope,
          // backdrop: 'static',
          keyboard: false,
          templateUrl: 'views/modal/removeset.html',
          windowClass: 'removeset-modal'
        })
    }
    $scope.deleteSet = function(index){
      console.log(index, 'index che');
      _.each($scope.match.resultsRacquet.players, function(n){
        if (n.sets.length>1) {
          // delete n.sets[index];
          n.sets.splice(index,1);
          $scope.setLength = [];
          _.each($scope.match.resultsRacquet.players[0].sets, function(n,key){
            $scope.setLength[key] = {
              setShow : true
            }
          });
          $scope.setDisplay = {
            value: 0
          };
          $scope.setDelete = {
            value: 0
          };
          toastr.success('Set deleted successfully');
          $rootScope.modalInstance.close('a');
          console.log($scope.match.resultsRacquet, 'After delete');
        } else{
          toastr.warning('Minimum 1 Set required');
        }
      });
    }
    // REMOVE SET END
    // REMOVE MATCH SCORESHEET
    $scope.removeMatchScore = function(pic, type) {
      switch (type) {
        case 'matchPhoto':
          _.remove($scope.match.resultsRacquet.matchPhoto, function(n) {
              return n.image === pic.image;
          })
        break;
        case 'scoreSheet':
          _.remove($scope.match.resultsRacquet.scoreSheet, function(n) {
            return n.image === pic.image;
          })
        break;
      }
    }
    // REMOVE MATCH SCORESHEET END
})
