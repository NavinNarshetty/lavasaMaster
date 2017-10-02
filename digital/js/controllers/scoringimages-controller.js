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
          _.remove($scope.match.resultImages.matchPhoto, function(n) {
              return n.image === pic.image;
          })
        break;
        case 'scoreSheet':
          _.remove($scope.match.resultImages.scoreSheet, function(n) {
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
        console.log($scope.matchData, 'matchData');
        NavigationService.getOneMatch($scope.matchData, function(data) {
            if (data.value == true) {
              if(data.data.error){
                $scope.matchError = data.data.error;
                console.log($scope.matchError,'error');
                toastr.error('Invalid MatchID. Please check the MatchID entered.', 'Error');
              }
                $scope.match = data.data;
                $scope.match.matchId = $scope.matchData.matchId;
                $scope.match.resultImages = {
                  "matchPhoto": [],
                  "scoreSheet": [],
                  "status": "IsLive"
                }
                console.log($scope.match, 'Match');
            } else {
                console.log("ERROR IN getOneMatch");
            }
        })
    };
    $scope.getOneMatch();

    // GET MATCH END
    // MATCH COMPLETE
    $scope.completePopup = function(){
      if($scope.match.resultImages.matchPhoto.length == 0){
        toastr.error('Please upload match photo.', 'Data Incomplete');
      } else if ($scope.match.resultImages.scoreSheet.length == 0) {
        toastr.error('Please upload scoresheet.', 'Data Incomplete');
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
      if ($scope.match.resultImages) {
        $scope.match.resultImages.status = "IsCompleted";
          $scope.matchResult = {
            resultImages : $scope.match.resultImages,
            matchId: $scope.matchData.matchId
          }
          // NavigationService.saveMatch($scope.matchResult, function(data){
          //   if(data.value == true){
          //     console.log('save success');
          //   } else{
          //     // alert('fail save');
          //     toastr.error('Data save failed. Please try again.', 'Save Error');
          //   }
          // });
          console.log($scope.matchResult, 'result#');
      } else {
        toastr.error('No data to save. Please check for valid MatchID.', 'Save Error');
      }
    }
    // MATCH COMPLETE END
    // API CALLN INTEGRATION END
})
