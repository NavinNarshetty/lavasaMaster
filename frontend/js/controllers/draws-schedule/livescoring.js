myApp.controller('LiveScoringCtrl', function ($scope, TemplateService, $state, NavigationService, $stateParams, toastr, $timeout, errorService, loginService, selectService, $rootScope, $uibModal, configService, $filter, $sce) {
  $scope.template = TemplateService.getHTML("content/draws-schedule/live-scoring.html");
  TemplateService.title = "Draws & Schedules"; //This is the Title of the Website
  // TemplateService.header = "views/template/header1.html";
  // TemplateService.footer = "views/template/footer1.html";
  $scope.navigation = NavigationService.getNavigation();

  $scope.sportList = ['football', 'Basketball', 'tennis', 'chess'];
  $scope.genderList = ['male', 'female', 'mixed'];
  $scope.data = [1, 2, 3, 4, 5, 6, 7, 8];
  configService.getDetail(function (data) {
    $scope.state = data.state;
    $scope.year = data.year;
    $scope.eventYear = data.eventYear;
    $scope.sfaCity = data.sfaCity;
    $scope.isCollege = data.isCollege;
    $scope.type = data.type;

    $scope.getAllSchedule = function (data) {
      $scope.url = "Schedule/getAll";
      // console.log(data);
      $scope.constraints = {};
      $scope.constraints.keyword = data;
      NavigationService.apiCallWithData($scope.url, $scope.constraints, function (data) {
        // console.log("data.value sportlist", data);
        $scope.scheduleData = data.data;
        $scope.scheduleData = _.sortBy($scope.scheduleData, 'sport.name');
        $scope.scheduleOdd = $scope.scheduleData.length % 2;
        if ($scope.scheduleOdd !== 0) {
          // console.log('in not')
          $scope.scheduleData.push({})
        }
        _.each($scope.scheduleData, function (key) {
          _.each(key.pdfDetail, function (value) {
            if (value.pdfName) {
              $scope.pdfURL = $filter('uploadpathTwo')(value.pdfName);
              value.trustedURL = $sce.trustAsResourceUrl($scope.pdfURL);
            }
          })
        })
        $scope.scheduleData1 = $scope.scheduleData.slice(0, $scope.scheduleData.length / 2);
        // $scope.scheduleData1 = _.partition($scope.scheduleData, $scope.scheduleData = $scope.scheduleData.length % 2);
        $scope.scheduleData2 = $scope.scheduleData.slice($scope.scheduleData.length / 2);
        // console.log($scope.scheduleData1, 'chunk1');
        // console.log($scope.scheduleData2, 'chunk2');
        // console.log($scope.scheduleData, 'after push');


      });
    };
    $scope.getAllSchedule()
  });

  $scope.formData = {};

  $scope.downloadPdf = function (data) {
    // console.log(data);
    if (data == 'badminton') {
      window.open("img/pdf/allbadminton.pdf", "_blank");
      // window.open("img/pdf/badminton1.pdf", "_blank");
      // window.open("img/pdf/badminton2.pdf", "_blank");
    } else {
      window.open("img/pdf/kabaddi.pdf", "_blank");
    }
  };

  NavigationService.getAllSpotsList(function (data) {
    errorService.errorCode(data, function (allData) {
      if (!allData.message) {
        if (allData.value) {
          $scope.sportList = allData.data;
          // console.log("$scope.sportList", $scope.sportList);
        }
      } else {
        toastr.error(allData.message, 'Error Message');
      }
    });
  });
  $scope.getAllAgeGroupsByEvent = function (sportlist) {
    NavigationService.getAllAgeGroupsByEvent(sportlist, function (data) {
      errorService.errorCode(data, function (allData) {
        if (!allData.message) {
          if (allData.value) {

            $scope.ageGroups = allData.data;
            _.each($scope.ageGroups, function (n) {
              n.ageGroupId = n.ageGroup._id;
              n.ageGroupName = n.ageGroup.name;
            })
            // console.log($scope.ageGroups, "allData");
          }
        } else {
          toastr.error(allData.message, 'Error Message');
        }
      });
    });
  };

  $scope.getAllWeightsByEvent = function (sportlist) {
    NavigationService.getAllWeightsByEvent(sportlist, function (data) {
      errorService.errorCode(data, function (allData) {
        if (!allData.message) {
          if (allData.value) {
            // console.log("WEight", allData);
            $scope.allWeights = allData.data;
            if ($scope.allWeights.length > 0) {
              _.each($scope.allWeights, function (n) {
                n.weightId = n.weight._id;
                n.weightName = n.weight.name;
              });
            }

          }
        } else {
          toastr.error(allData.message, 'Error Message');
        }
      });
    });
  }
  $scope.nameOfSport = {};
  $scope.requestObj = {};
  $scope.sportName = function (sportName, sportId) {
    // console.log("sportId", sportId);
    $scope.nameOfSport = sportName;
    // console.log("$scope.nameOfSport", $scope.nameOfSport);
    if (sportName === 'Boxing' || sportName === 'Judo' || sportName === 'Kumite' || sportName === 'Taekwondo' || sportName === 'Sport MMA') {
      $scope.showWeight = true;
    } else {
      $scope.showWeight = false;
    }
    $scope.requestObj._id = sportId;
    NavigationService.getAllBySport($scope.requestObj, function (data) {

      errorService.errorCode(data, function (allData) {
        if (!allData.message) {
          if (allData.value) {
            // console.log("  allData.data;", allData.data);
            $scope.getAllBySport = allData.data;
          }
        } else {
          toastr.error(allData.message, 'Error Message');
        }
      });

    });

  };
  //get weight and age by Event
  $scope.getAgeOrWeightsByEvent = function (sportlistId) {
    // console.log("sportlistId", sportlistId);
    $scope.constraintsObj = {};
    $scope.constraintsObj.sportslist = sportlistId._id;
    $scope.getAllWeightsByEvent($scope.constraintsObj);
    $scope.getAllAgeGroupsByEvent($scope.constraintsObj);


  }
  //view Draw Schedule 
  $scope.viewDraw = function (formData) {
    // console.log("$scope.viewDraw", $scope.nameOfSport);
    NavigationService.getQuickSportId(formData, function (data) {
      errorService.errorCode(data, function (allData) {
        if (!allData.message) {
          if (allData.value) {
            $scope.drawDetails = allData.data;
            if ($scope.drawDetails === 'No Data Found') {
              toastr.error('No Event Found', 'Error Message');
            }
            // console.log($scope.drawDetails, "$scope.drawDetails ");
            //FOR CHECKING SPORT TYPE
            if ($scope.drawDetails.sportType) {
              if ($scope.drawDetails.matchFound) {
                switch ($scope.drawDetails.sportType) {
                  case 'Racquet Sports':
                    if ($scope.drawDetails.isTeam) {
                      $state.go('knockout-doubles', {
                        id: $scope.drawDetails.sport
                      });
                    } else {
                      $state.go('knockout', {
                        id: $scope.drawDetails.sport
                      });
                    }
                    break;
                  case 'Combat Sports':
                    if ($scope.drawDetails.drawFormat === 'League cum Knockout') {
                      if ($scope.drawDetails.isTeam === true) {
                        $state.go('league-knockoutTeam', {
                          id: $scope.drawDetails.sport,
                        });
                      } else {
                        $state.go('league-knockoutIndividual', {
                          id: $scope.drawDetails.sport,
                        });
                      }

                    } else {
                      if ($scope.drawDetails.isTeam) {
                        $state.go('knockout-team', {
                          id: $scope.drawDetails.sport
                        });
                      } else {
                        $state.go('knockout', {
                          id: $scope.drawDetails.sport
                        });
                      }

                    }
                    break;
                  case 'Team Sports':
                    if ($scope.drawDetails.drawFormat === 'League cum Knockout') {
                      $state.go('league-knockoutTeam', {
                        id: $scope.drawDetails.sport,
                      });
                    } else {
                      $state.go('knockout-team', {
                        id: $scope.drawDetails.sport
                      });
                    }
                    break;
                  case 'Individual Sports':
                    switch ($scope.drawDetails.drawFormat) {
                      case 'Heats':
                        // console.log("im in else");
                        $state.go('heats', {
                          id: $scope.drawDetails.sport,
                          sportName: $scope.nameOfSport
                        });
                        break;
                      case 'Qualifying Round':
                        $state.go('qf-final', {
                          id: $scope.drawDetails.sport,
                          name: $scope.nameOfSport
                        });
                        break;
                      case 'Knockout':
                        $state.go('knockout', {
                          id: $scope.drawDetails.sport
                        });
                        break;
                      case 'Swiss League':
                        $state.go('swiss-league', {
                          id: $scope.drawDetails.sport
                        });
                        break;
                      default:
                        toastr.error("Case :Individual Sports ,New Draw Format Found ");
                        break;
                    }
                    break;
                  case 'Target Sports':
                    switch ($scope.drawDetails.drawFormat) {
                      case 'Qualifying Knockout':
                        $state.go('qf-knockout', {
                          id: $scope.drawDetails.sport,
                        });
                        break;
                      case 'Qualifying Round':
                        $state.go('qf-final', {
                          id: $scope.drawDetails.sport,
                          name: $scope.nameOfSport
                        });
                        break;

                      default:
                        toastr.error("Case :Target Sports ,New Draw Format Found ");
                        break;
                    }
                    break;
                  case 'Aquatics Sports':
                    switch ($scope.drawDetails.drawFormat) {
                      case 'Knockout':
                        if ($scope.drawDetails.isTeam === true) {
                          $state.go('knockout-team', {
                            id: $scope.drawDetails.sport
                          });
                        } else {
                          $state.go('knockout', {
                            id: $scope.drawDetails.sport
                          });
                        }
                        break;

                      default:
                        $state.go('time-trial', {
                          id: $scope.drawDetails.sport,
                          name: $scope.nameOfSport
                        });
                        break;
                    }

                    break;
                  default:
                    toastr.error("Found New Sport Type");
                    break;
                }
              } else {
                toastr.error("No Matches found", 'Error Message');
              }

            }
          }
        } else {
          toastr.error(allData.message, 'Error Message');
        }
      });
    });
  };





});