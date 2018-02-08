myApp.controller('QualifyingScoreCtrl', function ($scope, TemplateService, NavigationService, $timeout, $uibModal, $stateParams, $state, $interval, toastr, $rootScope) {
  $scope.template = TemplateService.getHTML("content/score-qualifying.html");
  TemplateService.title = "Score Qualifying"; //This is the Title of the Website
  $scope.navigation = NavigationService.getNavigation();
  // VARIABLE INITIALISE
  $scope.matchId = $stateParams.id;
  $scope.match = {};
  $scope.showScoreSheet = false;
  $scope.showMatchPhoto = false;
  $scope.editFlag = $stateParams.flag;
  $scope.matchData = {};
  $scope.scoreSheet = [];
  var promise;
  $scope.stateParam = $stateParams;
  $scope.matchDetails = {
    sportName: $scope.stateParam.sportName,
    matchRound: $scope.stateParam.roundName
  }
  // $scope.matchData = {};
  // VARIABLE INITIALISE END
  // FUNCTIONS
  // BACK FUNCTION
  $scope.qualifyingBack = function () {
    switch ($stateParams.drawFormat) {
      case 'Qualifying Round':
        $state.go('qf-final', {
          id: $stateParams.sport,
          name: $stateParams.sportName,
          drawFormat: $stateParams.drawFormat,
        });
        break;
      case 'Qualifying Knockout':
        $state.go('qf-knockout', {
          id: $stateParams.sport,
          drawFormat: $scope.drawDetails.drawFormat,
        });
        break;
    }
  }

  // BACK FUNCTION END
  // REMOVE MATCH SCORESHEET
  $scope.removeMatchScore = function (pic, match, type) {
    switch (type) {
      case 'matchPhoto':
        _.remove(match.resultImage.matchPhoto, function (n) {
          return n.image === pic.image;
        })
        break;
      case 'scoreSheet':
        _.remove($scope.scoreSheet, function (n) {
          return n.image === pic.image;
        })
        break;
    }
  }
  // REMOVE MATCH SCORESHEET END
  // FUNCTIONS END

  // API CALLN INTEGRATION
  // GET MATCH
  $scope.getQualifyingRound = function () {
    $scope.matchData = {
      sport: $scope.stateParam.sportId,
      round: $scope.stateParam.roundName
    }
    NavigationService.getQualifyingRound($scope.matchData, function (data) {
      if (data.value == true) {
        if (data.data.error) {
          $scope.matchError = data.data.error;
          console.log($scope.matchError, 'error');
          toastr.error('Invalid MatchID. Please check the MatchID entered.', 'Error');
        }
        $scope.qualifyingRound = data.data;
        _.each($scope.qualifyingRound, function (n) {
          console.log('n1 ', n);
          if (!n.resultQualifyingRound) {
            n.resultQualifyingRound = {};
          }

          switch ($stateParams.flag) {
            case 'score':
              console.log('n switch', n);
              if (!n.resultQualifyingRound.player) {
                n.resultQualifyingRound = {
                  "player": {
                    "id": n.opponentsSingle[0]._id,
                    "attempt": [],
                  }
                };
              }
              if ($scope.qualifyingRound[0].resultQualifyingRound && $scope.qualifyingRound[0].resultQualifyingRound.scoreSheet && $scope.qualifyingRound[0].resultQualifyingRound.scoreSheet.length != 0) {
                $scope.scoreSheet = $scope.qualifyingRound[0].resultQualifyingRound.scoreSheet;
              }
              if (n.resultQualifyingRound.player.attempt.length == 0 && !n.resultQualifyingRound.scoreSheet) {
                if (n.opponentsSingle.length > 0) {
                  console.log('n ', n.matchId, n);
                  n.resultQualifyingRound = {};
                  n.resultQualifyingRound = {
                    "player": {
                      "id": n.opponentsSingle[0]._id,
                      "noShow": false,
                      "attempt": ["", "", "", "", "", ""],
                      "bestAttempt": "",
                      "result": ""
                    },
                    "scoreSheet": []
                  };
                } else {
                  toastr.error("Some matches have incomplete data. Please Check them", "Error");
                  $scope.qualifyingBack();
                }
              } else {
                console.log("lenove");
              }
              break;
            case 'image':
              if (!n.resultQualifyingRound.resultImage) {
                console.log("in heres");
                n.resultQualifyingRound.resultImage = {};
                n.resultQualifyingRound.resultImage = {
                  "matchPhoto": [],
                  "attendance": false
                };
              } else {
                console.log('not in');
              }
              break;
          }
        });
      } else {
        console.log("ERROR IN getOneMatch");
      }
    })
  };
  $scope.getQualifyingRound();
  // GET MATCH END
  // SAVE RESULT
  $scope.saveResult = function () {
    $scope.qualifyingResult = [];
    _.each($scope.qualifyingRound, function (n, nindex) {
      $scope.qualifyingResult[nindex] = {
        matchId: n.matchId,
      }
      if ($stateParams.flag == 'image') {
        $scope.qualifyingResult[nindex].resultImage = {};
        $scope.qualifyingResult[nindex].resultImage = n.resultQualifyingRound.resultImage;
      } else if ($stateParams.flag == 'score') {
        $scope.qualifyingResult[nindex].result = {};
        $scope.qualifyingResult[nindex].result = n.resultQualifyingRound.player;
        $scope.qualifyingResult[nindex].scoreSheet = $scope.scoreSheet;
      }
    });
    console.log($scope.qualifyingResult, 'save Result');
    NavigationService.updateQualifyingDigital($scope.qualifyingResult, function (data) {
      if (data.value == true) {
        console.log('save success');
      } else {
        alert('fail save');
      }
    });
  }
  // SAVE RESULT END
  // AUTO SAVE FUNCTION
  $scope.autoSave = function () {
    $scope.$on('$viewContentLoaded', function (event) {
      promise = $interval(function () {
        $scope.saveResult();
      }, 10000);
    })
  }
  $scope.autoSave();
  // AUTO SAVE FUNCTION END
  // DESTROY AUTO SAVE
  // $scope.destroyAutoSave = function(){
  $scope.$on('$destroy', function () {
    console.log('destroy');
    $interval.cancel(promise);
  })
  // }
  // DESTROY AUTO SAVE END
  // MATCH COMPLETE
  $scope.completePopup = function () {
    if ( $stateParams.flag == 'score' && $scope.scoreSheet.length == 0) {
      toastr.error("Please upload Scoresheet", "Error");
    } else{
      var modalCompleteMatch;
      $rootScope.modalInstance = $uibModal.open({
        animation: true,
        scope: $scope,
        templateUrl: 'views/modal/confirmcomplete.html',
        windowClass: 'completematch-modal'
      })
    }
  };
  $scope.matchComplete = function () {
    $scope.qualifyingResult = [];
    _.each($scope.qualifyingRound, function (n, nindex) {
      $scope.qualifyingResult[nindex] = {
        matchId: n.matchId,
      }
      if ($stateParams.flag == 'image') {
        $scope.qualifyingResult[nindex].resultImage = {};
        $scope.qualifyingResult[nindex].resultImage = n.resultQualifyingRound.resultImage;
      } else if ($stateParams.flag == 'score' && n.resultQualifyingRound) {
        $scope.qualifyingResult[nindex].result = {};
        $scope.qualifyingResult[nindex].result = n.resultQualifyingRound.player;
        $scope.qualifyingResult[nindex].scoreSheet = $scope.scoreSheet;
      }
    });
    console.log($scope.qualifyingResult, 'save Result');
    NavigationService.updateQualifyingDigital($scope.qualifyingResult, function (data) {
      if (data.value == true) {
        console.log('save success');
        switch ($stateParams.drawFormat) {
          case 'Qualifying Round':
            $state.go('qf-final', {
              id: $stateParams.sport,
              name: $stateParams.sportName,
              drawFormat: $stateParams.drawFormat,
            });
            break;
          case 'Qualifying Knockout':
            $state.go('qf-knockout', {
              id: $stateParams.sport,
              drawFormat: $scope.drawDetails.drawFormat,
            });
            break;
        }
      } else {
        alert('fail save');
      }
    });
  }
  // MATCH COMPLETE END
  // API CALLN INTEGRATION END
})
