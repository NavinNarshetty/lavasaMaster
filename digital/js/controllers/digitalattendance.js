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
    $scope.eventSportName = '';
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
        if ($scope.formData.sportId) {
            $scope.requestObj._id = $scope.formData.sportId;
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
        }

    };
    //EVENT SPORT NAME
    $scope.eventSportFun = function (eventName) {
        $scope.eventSportName = eventName;
        if (eventName === 'Boxing' || eventName === 'Judo' || eventName === 'Kumite' || eventName === 'Taekwondo' || eventName === 'Sport MMA') {
            $scope.showWeight = true;
        } else {
            $scope.showWeight = false;
        }
    };
    // VIEW DRAWS
    $scope.viewDraw = function (formData, flag) {
        if (!formData.weight) {
            if ($scope.eventSportName === 'Boxing' || $scope.eventSportName === 'Judo' || $scope.eventSportName === 'Kumite' || $scope.eventSportName === 'Taekwondo' || $scope.eventSportName === 'Sport MMA') {
                formData.weight = null;
            }
        }

        NavigationService.getQuickSportId(formData, function (data) {
            errorService.errorCode(data, function (allData) {
                if (!allData.message) {
                    if (allData.value) {
                        $scope.drawDetails = allData.data;
                        if ($scope.drawDetails === 'No Data Found') {
                            toastr.error('No Event Found', 'Error Message');
                        } else {
                            console.log(" $scope.drawDetails.sport", $scope.drawDetails.sport);
                            //FOR CHECKING SPORT TYPE
                            switch ($scope.nameOfSport) {
                                //CASE ONE : Team-Sport
                                case 'Athletics Medley Relay':
                                case 'Athletics 4x50m Relay':
                                case 'Swimming 4x50m Freestyle Relay':
                                case 'Swimming 4x50m Medley Relay':
                                case 'Athletics 4x100m Relay':
                                console.log("ath");
                                    if (flag == 'attendance') {
                                        $state.go('attendancesheet-team', {
                                            sport: $scope.drawDetails.sport
                                        });
                                    } else if (flag == 'matches') {
                                        $state.go('creatematch-heats', {
                                            sport: $scope.drawDetails.sport
                                        });
                                    }
                                    break;
                                //CASE TWO : Individual-Sport
                                case 'Swimming':
                                case 'Athletics':
                                case 'Shooting':
                                console.log("swim");
                                    if (flag == 'attendance') {
                                        $state.go('attendancesheet', {
                                            sport: $scope.drawDetails.sport
                                        });
                                    } else if (flag == 'matches') {
                                        $state.go('creatematch-heats', {
                                            sport: $scope.drawDetails.sport
                                        });
                                    }
                                    break;
                                case 'Boxing':
                                case 'Wrestling':
                                case 'Taekwondo':
                                case 'Judo':
                                case 'Sport MMA':
                                case 'Karate':
                                console.log("weight");
                                    if ($scope.eventSportName != 'Kata') {
                                      console.log("no Kata");
                                        if (flag == 'attendance') {
                                          console.log("yo atten");
                                            $state.go('addweight', {
                                                sport: $scope.drawDetails.sport
                                            });
                                        } else if (flag == 'matches') {
                                          console.log("yo match");
                                            $state.go('creatematch-weight',{
                                                sport: $scope.drawDetails.sport
                                            });
                                        }

                                    } else {
                                        toastr.error('Attendance not available for this Sport');
                                    }
                                break;
                                default:
                                    if (flag == 'attendance') {
                                        toastr.error('Attendance not available for this Sport');
                                    } else if (flag == 'matches') {
                                        toastr.error('Match create not available  for this Sport');
                                    }
                                    break;
                            }
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
