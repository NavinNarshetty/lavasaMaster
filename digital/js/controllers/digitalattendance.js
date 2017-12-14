myApp.controller('DigitalAttendanceCtrl', function ($scope, TemplateService, $state, NavigationService, $stateParams, toastr, $timeout, errorService, $rootScope, $uibModal) {
    $scope.template = TemplateService.getHTML("content/digital-attendance.html");
    TemplateService.title = "Sport Attendance"; //This is the Title of the Website
    $scope.navigation = NavigationService.getNavigation();

    // VARIABLE INITIALISE
    $scope.genderList = ['male', 'female', 'mixed'];
    $scope.data = [1, 2, 3, 4, 5, 6, 7, 8];
    $scope.formData = {};
    $scope.nameOfSport = {};
    $scope.requestObj = {};
    // VARIABLE INITIALISE END

    // API CALLS
    NavigationService.getAllSpotsList(function (data) {
        errorService.errorCode(data, function (allData) {
            if (!allData.message) {
                if (allData.value) {
                    $scope.sportList = allData.data;
                    console.log("$scope.sportList", $scope.sportList);
                }
            } else {
                toastr.error(allData.message, 'Error Message');
            }
        });
    });
    NavigationService.getAllAgeGroups(function (data) {
        errorService.errorCode(data, function (allData) {
            if (!allData.message) {
                if (allData.value) {
                    $scope.ageGroups = allData.data;
                }
            } else {
                toastr.error(allData.message, 'Error Message');
            }
        });
    });
    NavigationService.getAllWeights(function (data) {
        errorService.errorCode(data, function (allData) {
            if (!allData.message) {
                if (allData.value) {
                    $scope.allWeights = allData.data;
                }
            } else {
                toastr.error(allData.message, 'Error Message');
            }
        });
    });
    // API CALLS END

    $scope.sportName = function (sportName, sportId) {
        console.log("sportId", sportId);
        $scope.nameOfSport = sportName;
        console.log("$scope.nameOfSport", $scope.nameOfSport);
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
                        console.log("  allData.data;", allData.data);
                        $scope.getAllBySport = allData.data;
                    }
                } else {
                    toastr.error(allData.message, 'Error Message');
                }
            });

        });

    };

    // VIEW DRAWS
    $scope.viewDraw = function (formData) {
        console.log("$scope.viewDraw", $scope.nameOfSport);
        NavigationService.getQuickSportId(formData, function (data) {
            errorService.errorCode(data, function (allData) {
                if (!allData.message) {
                    if (allData.value) {
                        $scope.drawDetails = allData.data;
                        if ($scope.drawDetails === 'No Data Found') {
                            toastr.error('No Event Found', 'Error Message');
                        }
                        //FOR CHECKING SPORT TYPE
                        console.log($scope.drawDetails.sportType);
                        if ($scope.drawDetails.matchFound) {
                            if ($scope.drawDetails.sportType) {
                                switch ($scope.drawDetails.sportType) {
                                    case 'Racquet Sports':
                                        if ($scope.drawDetails.isTeam) {
                                            $state.go('knockout-doubles', {
                                                drawFormat: $scope.drawDetails.drawFormat,
                                                id: $scope.drawDetails.sport
                                            });
                                        } else {
                                            $state.go('knockout', {
                                                drawFormat: $scope.drawDetails.drawFormat,
                                                id: $scope.drawDetails.sport
                                            });
                                        }
                                        break;
                                    case 'Combat Sports':
                                        if ($scope.drawDetails.drawFormat === 'League cum Knockout') {
                                            // $state.go('league-knockout', {
                                            //     drawFormat: $scope.drawDetails.drawFormat,
                                            //     id: $scope.drawDetails.sport,
                                            // });
                                            if ($scope.drawDetails.isTeam === true) {
                                                console.log("isTeam");
                                                $state.go('league-knockoutTeam', {
                                                    drawFormat: $scope.drawDetails.drawFormat,
                                                    id: $scope.drawDetails.sport,
                                                });
                                            } else {
                                                $state.go('league-knockoutIndividual', {
                                                    drawFormat: $scope.drawDetails.drawFormat,
                                                    id: $scope.drawDetails.sport,
                                                });
                                            }

                                        } else {
                                            if ($scope.drawDetails.isTeam) {
                                                $state.go('knockout-team', {
                                                    drawFormat: $scope.drawDetails.drawFormat,
                                                    id: $scope.drawDetails.sport
                                                });
                                            } else {
                                                $state.go('knockout', {
                                                    drawFormat: $scope.drawDetails.drawFormat,
                                                    id: $scope.drawDetails.sport
                                                });
                                            }

                                        }
                                        break;
                                    case 'Team Sports':
                                        if ($scope.drawDetails.drawFormat === 'League cum Knockout') {
                                            $state.go('league-knockoutTeam', {
                                                drawFormat: $scope.drawDetails.drawFormat,
                                                id: $scope.drawDetails.sport,
                                            });
                                        } else {
                                            $state.go('knockout-team', {
                                                drawFormat: $scope.drawDetails.drawFormat,
                                                id: $scope.drawDetails.sport
                                            });
                                        }
                                        break;
                                    case 'Individual Sports':
                                        switch ($scope.drawDetails.drawFormat) {
                                            case 'Heats':
                                                console.log("im in else");
                                                $state.go('heats', {
                                                    id: $scope.drawDetails.sport,
                                                    sportName: $scope.nameOfSport,
                                                    drawFormat: $scope.drawDetails.drawFormat
                                                });
                                                break;
                                            case 'Qualifying Round':
                                                $state.go('qf-final', {
                                                    id: $scope.drawDetails.sport,
                                                    name: $scope.nameOfSport,
                                                    drawFormat: $scope.drawDetails.drawFormat
                                                });
                                                break;
                                            case 'Knockout':
                                                $state.go('knockout', {
                                                    id: $scope.drawDetails.sport,
                                                    drawFormat: $scope.drawDetails.drawFormat
                                                });
                                                break;
                                            case 'Swiss League':
                                                $state.go('swiss-league', {
                                                    id: $scope.drawDetails.sport,
                                                    drawFormat: $scope.drawDetails.drawFormat,
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
                                                // $state.go('qf-knockout', {
                                                //     id: $scope.drawDetails.sport,
                                                //     drawFormat: $scope.drawDetails.drawFormat,
                                                // });
                                                toastr.error('Digital Scoring Not Available for this sport', 'Error');
                                                break;
                                            case 'Qualifying Round':
                                                $state.go('qf-final', {
                                                    id: $scope.drawDetails.sport,
                                                    name: $scope.nameOfSport,
                                                    drawFormat: $scope.drawDetails.drawFormat,
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
                                                    name: $scope.nameOfSport,
                                                    drawFormat: $scope.drawDetails.drawFormat
                                                });
                                                break;
                                        }
                                        break;
                                    default:
                                        toastr.error("Found New Sport Type");
                                        break;
                                }
                            }
                        } else {
                            toastr.error("No Matches for this Selected Sport");
                        }

                    }
                } else {
                    toastr.error(allData.message, 'Error Message');
                }
            });
        });
    };
    // VIEW DRAWS END
});
