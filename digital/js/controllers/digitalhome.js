myApp.controller('DigitalHomeCtrl', function ($scope, TemplateService, $state, NavigationService, $stateParams, toastr, $timeout, errorService, $rootScope, $uibModal) {
    $scope.template = TemplateService.getHTML("content/digital-home.html");
    TemplateService.title = "Direct Final"; //This is the Title of the Website
    $scope.navigation = NavigationService.getNavigation();

    $scope.sportList = ['football', 'Basketball', 'tennis', 'chess'];
    $scope.genderList = ['male', 'female', 'mixed'];
    $scope.data = [1, 2, 3, 4, 5, 6, 7, 8];
    $scope.schedulelist = [{
        sport: 'Archery',
        date1: '15',
        date2: '17',
        month: 'Dec'
    }, {
        sport: 'Athletics',

    }, {
        sport: 'Badminton',
        date1: '6',
        date2: '13',
        month: 'Dec'
    }, {
        sport: 'Basketball',
        date1: '6',
        date2: '17',
        month: 'Dec'
    }, {
        sport: 'Boxing',
        date1: '13',
        date2: '17',
        month: 'Dec'
    }, {
        sport: 'Carrom',
        date1: '13',
        date2: '17',
        month: 'Dec'
    }, {
        sport: 'Chess',
        date1: '13',
        date2: '17',
        month: 'Dec'
    }, {
        sport: 'Fencing',
        date1: '14',
        date2: '17',
        month: 'Dec'
    }, {
        sport: 'Football',
        date1: '6',
        date2: '17',
        month: 'Dec'
    }, {
        sport: 'Handball',
        date1: '6',
        date2: '17',
        month: 'Dec'
    }, {
        sport: 'Hockey',
    }, {
        sport: 'Judo',
        date1: '16',
        date2: '17',
        month: 'Dec'
    }, {
        sport: 'Kabaddi',
        date1: '6',
        date2: '12',
        month: 'Dec'
    }]

    $scope.schedulelist2 = [{
        sport: 'Karate',
        date1: '8',
        date2: '10',
        month: 'Dec'
    }, {
        sport: 'Kho Kho',
        date1: '7',
        date2: '10',
        month: 'Dec'


    }, {
        sport: 'Sport MMA',
        date1: '11',
        date2: '12',
        month: 'Dec'
    }, {
        sport: 'Shooting',
        date1: '13',
        date2: '17',
        month: 'Dec'
    }, {
        sport: 'Squash',
        date1: '12',
        date2: '14',
        month: 'Dec'
    }, {
        sport: 'Swimming',
        date1: '9',
        date2: '10',
        month: 'Dec'
    }, {
        sport: 'Table Tennis',
        date1: '6',
        date2: '11',
        month: 'Dec'
    }, {
        sport: 'Taekwondo',
        date1: '6',
        date2: '7',
        month: 'Dec'
    }, {
        sport: 'Tennis',
        date1: '7',
        date2: '13',
        month: 'Dec'
    }, {
        sport: 'Throwball',
        date1: '14',
        date2: '17',
        month: 'Dec'
    }, {
        sport: 'Volleyball',
        date1: '6',
        date2: '17',
        month: 'Dec'

    }, {
        sport: 'Water Polo',
        date: '11',
        month: 'Dec'
    }, {
        sport: '',
        date: '',
        month: ''
    }];
    $scope.formData = {};


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
    $scope.nameOfSport = {};
    $scope.requestObj = {};
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
                                        $state.go('league-knockout', {
                                          drawFormat: $scope.drawDetails.drawFormat,
                                            id: $scope.drawDetails.sport,
                                        });

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
                                        $state.go('league-knockout', {
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
                                              drawFormat: $scope.drawDetails.drawFormat,
                                                id: $scope.drawDetails.sport
                                            });
                                            break;
                                        case 'Swiss League':
                                            $state.go('swiss-league');
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
                                    $state.go('time-trial', {
                                        id: $scope.drawDetails.sport,
                                        name: $scope.nameOfSport
                                    });
                                    break;
                                default:
                                    toastr.error("Found New Sport Type");
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


    // $scope.viewDraw = function (formData) {
    //     NavigationService.getQuickSportId(formData, function (data) {
    //         errorService.errorCode(data, function (allData) {
    //             if (!allData.message) {
    //                 if (allData.value) {
    //                     $scope.drawDetails = allData.data;
    //                     if ($scope.drawDetails === 'No Data Found') {
    //                         toastr.error('No Event Found', 'Error Message');
    //                     }
    //                     console.log($scope.drawDetails, " $scope.drawDetails");
    //                     // if ($scope.drawDetails.drawFormat === 'Knockout') {
    //
    //                     //     if ($scope.drawDetails.isTeam) {
    //                     //         console.log("im in knockout team");
    //                     //         $state.go('knockout-team', {
    //                     //             drawFormat: $scope.drawDetails.drawFormat,
    //                     //             id: $scope.drawDetails.sport
    //                     //         });
    //                     //         console.log("knockout-team");
    //                     //     } else {
    //                     //         $state.go('knockout', {
    //                     //             drawFormat: $scope.drawDetails.drawFormat,
    //                     //             id: $scope.drawDetails.sport
    //                     //         });
    //                     //     }
    //                     // } else
    //                     if ($scope.drawDetails.sportType) {
    //                         switch ($scope.drawDetails.sportType) {
    //                             case 'Racquet Sports':
    //                                 if ($scope.drawDetails.isTeam) {
    //                                     $state.go('knockout-doubles', {
    //                                         drawFormat: $scope.drawDetails.drawFormat,
    //                                         id: $scope.drawDetails.sport
    //                                     });
    //                                 } else {
    //                                     $state.go('knockout', {
    //                                         drawFormat: $scope.drawDetails.drawFormat,
    //                                         id: $scope.drawDetails.sport
    //                                     });
    //                                 }
    //
    //                                 break;
    //                             case 'Combat Sports':
    //                                 $state.go('knockout', {
    //                                     drawFormat: $scope.drawDetails.drawFormat,
    //                                     id: $scope.drawDetails.sport
    //                                 });
    //
    //                                 break;
    //                             case 'Team Sports':
    //                               $state.go('knockout-team', {
    //                                 drawFormat: $scope.drawDetails.drawFormat,
    //                                 id: $scope.drawDetails.sport
    //                               });
    //                             break;
    //                         }
    //                     }
    //                     if ($scope.drawDetails.drawFormat === 'Heats') {
    //                         $state.go('heats', {
    //                             drawFormat: $scope.drawDetails.drawFormat,
    //                             id: $scope.drawDetails.sport
    //                         });
    //                     } else if ($scope.drawDetails.drawFormat === 'League cum Knockout') {
    //                         $state.go('knockout-team', {
    //                             drawFormat: $scope.drawDetails.drawFormat,
    //                             id: $scope.drawDetails.sport
    //                         });
    //                     }
    //                 }
    //             } else {
    //                 toastr.error(allData.message, 'Error Message');
    //             }
    //         });
    //     });
    // };
});
