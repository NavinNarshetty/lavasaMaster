myApp.controller('ScoringImagestCtrl', function($scope, TemplateService, NavigationService, $timeout, $uibModal, $stateParams, $state, $interval, toastr, $rootScope) {
    $scope.template = TemplateService.getHTML("content/scoringimages.html");
    TemplateService.title = "Score Images"; //This is the Title of the Website
    $scope.navigation = NavigationService.getNavigation();
    // VARIABLE INITIALISE
    $scope.matchId=$stateParams.id;
    $scope.match={};
    $scope.showScoreSheet = false;
    $scope.showMatchPhoto = false;
    $scope.matchData = {};
    var promise;
    $scope.stateParam = $stateParams;
    // VARIABLE INITIALISE END

    // FUNCTIONS
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
    // FUNCTIONS END
    
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
    // $scope.getOneMatch();

    // GET MATCH END
    // SAVE RESULT
    $scope.saveResult = function(formData){
      $scope.matchResult = {
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
    // API CALLN INTEGRATION END
})
