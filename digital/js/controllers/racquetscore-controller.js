myApp.controller('RacquetScoreCtrl', function($scope, TemplateService, NavigationService, $timeout, $uibModal,$stateParams, $state, $interval) {
    $scope.template = TemplateService.getHTML("content/score-racquet.html");
    TemplateService.title = "Score Racquet"; //This is the Title of the Website
    $scope.navigation = NavigationService.getNavigation();

    // VARIABLE INITIALISE
    $scope.match = {};
    $scope.matchData = {};
    var promise;
    $scope.showSet = true;
    $scope.setLength  = [];
    // VARIABLE INITIALISE END

    // API CALLN INTEGRATION
    // GET MATCH
    $scope.getOneMatch = function() {
        $scope.matchData.matchId = $stateParams.id;
        NavigationService.getOneMatch($scope.matchData, function(data) {
            if (data.value == true) {
                $scope.match = data.data;
                $scope.match.matchId = $scope.matchData.matchId;
                _.each($scope.match.resultsRacquet.players[0].sets, function(n,key){
                  $scope.setLength[key] = {
                    setShow : true
                  }
                })
                console.log($scope.setLength, 'setlength');
                console.log($scope.match, 'match');
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
      $scope.$on('$viewContentLoaded', function(event) {
        promise = $interval(function () {
          $scope.saveResult($scope.match);
        }, 10000);
      })
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
    $scope.matchComplete = function(){
        $scope.match.resultsRacquet.status = "IsCompleted";
        $scope.matchResult = {
          resultsRacquet : $scope.match.resultsRacquet,
          matchId: $scope.matchData.matchId
        }
        NavigationService.saveMatch($scope.matchResult, function(data){
          if(data.value == true){
            $state.go('home');
            console.log('save success');
          } else{
            alert('fail save');
          }
        });
        console.log($scope.matchResult, 'result#');
    }
    // MATCH COMPLETE END
    // API CALLN INTEGRATION END

    // SCORE INCREMENT
    $scope.incrementScore = function(set, model){
      $scope.set = set;
      switch (model) {
        case 'ace':
          $scope.set.ace = $scope.set.ace + 1;
        break;
        case 'winner':
          $scope.set.winner = $scope.set.winner + 1;
        break;
        case 'unforcedError':
          $scope.set.unforcedError = $scope.set.unforcedError + 1;
        break;
        case 'serviceError':
          $scope.set.serviceError = $scope.set.serviceError + 1;
        break;
        case 'doubleFaults':
          $scope.set.doubleFaults = $scope.set.doubleFaults + 1;
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
              point: 0,
              ace: 0,
              winner: 0,
              unforcedError: 0,
              serviceError: 0,
              doubleFaults: 0
        });
      })
      _.each($scope.match.resultsRacquet.players[0].sets, function(n,key){
        $scope.setLength[key] = {
          setShow : true
        }
      })
    }
    // ADD SET END
    // REMOVE SET
    $scope.removeSet = function(){
      _.each($scope.match.resultsRacquet.players, function(n){
        if(n.sets.length>1){
          var length = n.sets.length - 1;
          _.remove(n.sets,function(m,index){
            return length==index;
          })
          console.log(n.sets, 'sets');
        } else {
          console.log('atleast 1 set');
        }
      });
      $scope.setLength = [];
      _.each($scope.match.resultsRacquet.players[0].sets, function(n,key){
        $scope.setLength[key] = {
          setShow : true
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
