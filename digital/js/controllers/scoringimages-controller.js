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
                console.log($scope.match, 'getMatch');
                $scope.match.matchId = $scope.matchData.matchId;
              if ($scope.match.resultImages == {} || !$scope.match.resultImages) {
                  $scope.match.resultImages = {
                    "matchPhoto": [],
                    "scoreSheet": [],
                    "status": "IsLive"
                  }
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
          NavigationService.updateResultImages($scope.matchResult, function(data){
            if(data.value == true){
              switch ($scope.match.sportType) {
                case "Individual Sports":
                    switch ($stateParams.drawFormat) {
                      case 'Heats':
                          console.log("im in else");
                          $state.go('heats', {
                              id: $stateParams.sport,
                              sportName: $stateParams.sportName,
                              drawFormat: $stateParams.drawFormat
                          });
                          break;
                      case 'Qualifying Round':
                          $state.go('qf-final', {
                              id: $stateParams.sport,
                              name: $stateParams.sportName,
                              drawFormat: $stateParams.drawFormat
                          });
                          break;
                      case 'Knockout':
                          $state.go('knockout', {
                              id: $stateParams.sport,
                              drawFormat: $stateParams.drawFormat
                          });
                          break;
                      case 'Swiss League':
                          $state.go('swiss-league', {
                              id: $stateParams.sport,
                              drawFormat: $stateParams.drawFormat,
                          });
                          break;
                    }
                break;
                case 'Target Sports':
                    switch ($stateParams.drawFormat) {
                        case 'Qualifying Knockout':
                            $state.go('qf-knockout', {
                                id: $stateParams.sport,
                                drawFormat: $stateParams.drawFormat,
                            });
                            break;
                        case 'Qualifying Round':
                            $state.go('qf-final', {
                                id: $stateParams.sport,
                                name: $stateParams.sportName,
                                drawFormat: $stateParams.drawFormat,
                            });
                            break;
                        default:
                            toastr.error("Case :Target Sports ,New Draw Format Found ");
                            break;
                    }
                    break;
                    case 'Aquatics Sports':
                        switch ($stateParams.drawFormat) {
                            case 'Knockout':
                                if ($scope.drawDetails.isTeam === true) {
                                    $state.go('knockout-team', {
                                        id: $stateParams.sport
                                    });
                                } else {
                                    $state.go('knockout', {
                                        id: $stateParams.sport
                                    });
                                }
                                break;

                            default:
                                $state.go('time-trial', {
                                    id: $stateParams.sport,
                                    name: $stateParams.sportName,
                                    drawFormat: $stateParams.drawFormat
                                });
                                break;
                        }
                        break;
              }
            } else{
              toastr.error('Data save failed. Please try again.', 'Save Error');
            }
          });
          console.log($scope.matchResult, 'result#');
      } else {
        toastr.error('No data to save. Please check for valid MatchID.', 'Save Error');
      }
    }
    // MATCH COMPLETE END
    // BACK FUNCTION
    $scope.backFunc = function(){

        switch ($scope.match.sportType) {
          case "Individual Sports":
              switch ($stateParams.drawFormat) {
                case 'Heats':
                    console.log("im in else");
                    $state.go('heats', {
                        id: $stateParams.sport,
                        sportName: $stateParams.sportName,
                        drawFormat: $stateParams.drawFormat
                    });
                    break;
                case 'Qualifying Round':
                    $state.go('qf-final', {
                        id: $stateParams.sport,
                        name: $stateParams.sportName,
                        drawFormat: $stateParams.drawFormat
                    });
                    break;
                case 'Knockout':
                    $state.go('knockout', {
                        id: $stateParams.sport,
                        drawFormat: $stateParams.drawFormat
                    });
                    break;
                case 'Swiss League':
                    $state.go('swiss-league', {
                        id: $stateParams.sport,
                        drawFormat: $stateParams.drawFormat,
                    });
                    break;
              }
          break;
          case 'Target Sports':
              switch ($stateParams.drawFormat) {
                  case 'Qualifying Knockout':
                      $state.go('qf-knockout', {
                          id: $stateParams.sport,
                          drawFormat: $stateParams.drawFormat,
                      });
                      break;
                  case 'Qualifying Round':
                      $state.go('qf-final', {
                          id: $stateParams.sport,
                          name: $stateParams.sportName,
                          drawFormat: $stateParams.drawFormat,
                      });
                      break;
                  default:
                      toastr.error("Case :Target Sports ,New Draw Format Found ");
                      break;
              }
              break;
              case 'Aquatics Sports':
                  switch ($stateParams.drawFormat) {
                      case 'Knockout':
                          if ($scope.drawDetails.isTeam === true) {
                              $state.go('knockout-team', {
                                  id: $stateParams.sport
                              });
                          } else {
                              $state.go('knockout', {
                                  id: $stateParams.sport
                              });
                          }
                          break;

                      default:
                          $state.go('time-trial', {
                              id: $stateParams.sport,
                              name: $stateParams.sportName,
                              drawFormat: $stateParams.drawFormat
                          });
                          break;
                  }
                  break;
        }
    }
    // BACK FUNCTION END
    // API CALLN INTEGRATION END
})
