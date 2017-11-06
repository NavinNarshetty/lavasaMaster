myApp.controller('ChampionshipScheduleCtrl', function ($scope, TemplateService, $state, NavigationService, $stateParams, toastr, $timeout, errorService, loginService, selectService, $rootScope, $uibModal, configService) {
    $scope.template = TemplateService.getHTML("content/draws-schedule/championship-schedule.html");
    TemplateService.title = "Direct Final"; //This is the Title of the Website
    TemplateService.header = "views/template/header1.html";
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
        if ($scope.type == 'school') {
            if ($scope.sfaCity == 'Mumbai') {
                $scope.schedulelist = [{
                    sport: 'Archery',
                    date1: '15',
                    date2: '17',
                    month: 'Dec'
                }, {
                    sport: 'Athletics',
                    date1: '9',
                    date2: '12',
                    month: 'Dec'
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
                    date1: '2',
                    date2: '5',
                    month: 'Dec'
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
                }];

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
                    date1: '6',
                    date2: '9',
                    month: 'Dec'
                }, {
                    sport: 'Squash',
                    date1: '7',
                    date2: '10',
                    month: 'Dec'
                }, {
                    sport: 'Swimming',
                    date1: '9',
                    date2: '10',
                    month: 'Dec'
                }, {
                    sport: 'Table Tennis',
                    date1: '13',
                    date2: '17',
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
                    sport: 'Wrestling',
                    date1: '14',
                    date2: '15',
                    month: 'Dec'
                }];
            } else if ($scope.sfaCity == 'Hyderabad') {
                $scope.schedulelist = [{
                    sport: 'Archery',
                    date1: '11',
                    date2: '12',
                    month: 'Nov'
                }, {
                    sport: 'Athletics',
                    date1: '13',
                    date2: '15',
                    month: 'Nov'
                }, {
                    sport: 'Badminton',
                    date1: '10',
                    date2: '14',
                    month: 'Nov'
                }, {
                    sport: 'Basketball',
                    date1: '11',
                    date2: '17',
                    month: 'Nov'
                }, {
                    sport: 'Boxing',
                    date1: '16',
                    date2: '17',
                    month: 'Nov'
                }, {
                    sport: 'Carrom',
                    date1: '11',
                    date2: '14',
                    month: 'Nov'
                }, {
                    sport: 'Chess',
                    date1: '11',
                    date2: '13',
                    month: 'Nov'
                }, {
                    sport: 'Fencing',
                    date1: '16',
                    date2: '17',
                    month: 'Nov'
                }, {
                    sport: 'Football',
                    date1: '11',
                    date2: '17',
                    month: 'Nov'
                }, {
                    sport: 'Handball',
                    date1: '16',
                    date2: '17',
                    month: 'Nov'
                }, {
                    sport: 'Hockey',
                    date1: '11',
                    date2: '12',
                    month: 'Nov'
                }, {
                    sport: 'Judo',
                    date: '15',
                    month: 'Nov'
                }];

                $scope.schedulelist2 = [{
                    sport: 'Kabaddi',
                    date1: '10',
                    date2: '14',
                    month: 'Nov'
                }, {
                    sport: 'Karate',
                    date: '15',
                    month: 'Nov'
                }, {
                    sport: 'Kho Kho',
                    date1: '14',
                    date2: '17',
                    month: 'Nov'
                }, {
                    sport: 'Shooting',
                    date: '12',
                    month: 'Nov'
                }, {
                    sport: 'Swimming',
                    date1: '11',
                    date2: '12',
                    month: 'Nov'
                }, {
                    sport: 'Table Tennis',
                    date1: '15',
                    date2: '17',
                    month: 'Nov'
                }, {
                    sport: 'Taekwondo',
                    date: '15',
                    month: 'Nov'
                }, {
                    sport: 'Tennis',
                    date1: '15',
                    date2: '17',
                    month: 'Nov'
                }, {
                    sport: 'Throwball',
                    date1: '14',
                    date2: '17',
                    month: 'Nov'
                }, {
                    sport: 'Volleyball',
                    date1: '12',
                    date2: '17',
                    month: 'Nov'
                }, {
                    sport: 'Water Polo',
                    date: '13',
                    month: 'Nov'
                }, {
                    sport: '',
                    date: '',
                    month: ''
                }];
            }
        } else {
            $scope.schedulelist = [{
                sport: 'Archery',
                date1: '15',
                date2: '17',
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
                date1: '9',
                date2: '11',
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
                sport: 'Handball',
                date1: '6',
                date2: '17',
                month: 'Dec'
            }, {
                sport: 'Hockey',
                date1: '2',
                date2: '5',
                month: 'Dec'
            }, {
                sport: 'Judo',
                date1: '16',
                date2: '17',
                month: 'Dec'
            }];

            $scope.schedulelist2 = [{
                sport: 'Kabaddi',
                date1: '6',
                date2: '12',
                month: 'Dec'
            }, {
                sport: 'Shooting',
                date1: '6',
                date2: '9',
                month: 'Dec'
            }, {
                sport: 'Squash',
                date1: '7',
                date2: '10',
                month: 'Dec'
            }, {
                sport: 'Swimming',
                date1: '9',
                date2: '10',
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
        }
    });
    // $scope.schedulelist = [{
    //     sport: 'Archery',
    //     date1: '15',
    //     date2: '17',
    //     month: 'Dec'
    // }, {
    //     sport: 'Athletics',

    // }, {
    //     sport: 'Badminton',
    //     date1: '6',
    //     date2: '13',
    //     month: 'Dec'
    // }, {
    //     sport: 'Basketball',
    //     date1: '6',
    //     date2: '17',
    //     month: 'Dec'
    // }, {
    //     sport: 'Boxing',
    //     date1: '13',
    //     date2: '17',
    //     month: 'Dec'
    // }, {
    //     sport: 'Carrom',
    //     date1: '13',
    //     date2: '17',
    //     month: 'Dec'
    // }, {
    //     sport: 'Chess',
    //     date1: '13',
    //     date2: '17',
    //     month: 'Dec'
    // }, {
    //     sport: 'Fencing',
    //     date1: '14',
    //     date2: '17',
    //     month: 'Dec'
    // }, {
    //     sport: 'Football',
    //     date1: '6',
    //     date2: '17',
    //     month: 'Dec'
    // }, {
    //     sport: 'Handball',
    //     date1: '6',
    //     date2: '17',
    //     month: 'Dec'
    // }, {
    //     sport: 'Hockey',
    // }, {
    //     sport: 'Judo',
    //     date1: '16',
    //     date2: '17',
    //     month: 'Dec'
    // }, {
    //     sport: 'Kabaddi',
    //     date1: '6',
    //     date2: '12',
    //     month: 'Dec'
    // }]

    // $scope.schedulelist2 = [{
    //     sport: 'Karate',
    //     date1: '8',
    //     date2: '10',
    //     month: 'Dec'
    // }, {
    //     sport: 'Kho Kho',
    //     date1: '7',
    //     date2: '10',
    //     month: 'Dec'


    // }, {
    //     sport: 'Sport MMA',
    //     date1: '11',
    //     date2: '12',
    //     month: 'Dec'
    // }, {
    //     sport: 'Shooting',
    //     date1: '13',
    //     date2: '17',
    //     month: 'Dec'
    // }, {
    //     sport: 'Squash',
    //     date1: '12',
    //     date2: '14',
    //     month: 'Dec'
    // }, {
    //     sport: 'Swimming',
    //     date1: '9',
    //     date2: '10',
    //     month: 'Dec'
    // }, {
    //     sport: 'Table Tennis',
    //     date1: '6',
    //     date2: '11',
    //     month: 'Dec'
    // }, {
    //     sport: 'Taekwondo',
    //     date1: '6',
    //     date2: '7',
    //     month: 'Dec'
    // }, {
    //     sport: 'Tennis',
    //     date1: '7',
    //     date2: '13',
    //     month: 'Dec'
    // }, {
    //     sport: 'Throwball',
    //     date1: '14',
    //     date2: '17',
    //     month: 'Dec'
    // }, {
    //     sport: 'Volleyball',
    //     date1: '6',
    //     date2: '17',
    //     month: 'Dec'

    // }, {
    //     sport: 'Water Polo',
    //     date: '11',
    //     month: 'Dec'
    // }, {
    //     sport: '',
    //     date: '',
    //     month: ''
    // }];
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
    //view Draw Schedule 
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
                        console.log($scope.drawDetails, "$scope.drawDetails ");
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
                                            $state.go('league-knockout', {
                                                id: $scope.drawDetails.sport,
                                            });

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
                                            $state.go('league-knockout', {
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