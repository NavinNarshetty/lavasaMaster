myApp.controller('SportsSelectionCtrl', function ($scope, $stateParams, $location, TemplateService, NavigationService, $timeout, toastr, $state, errorService, loginService, selectService, $uibModal, configService) {
    $scope.template = TemplateService.getHTML("content/sports-selection.html");
    TemplateService.title = "Sports Selection";
    $scope.navigation = NavigationService.getNavigation();
    configService.getDetail(function (data) {
        $scope.state = data.state;
        $scope.year = data.year;
        $scope.eventYear = data.eventYear;
        $scope.sfaCity = data.sfaCity;
        $scope.isCollege = data.isCollege;
        $scope.type = data.type;
    });
    selectService.reset();
    $scope.sportsschool = true;
    $scope.sportsregistered = false;
    $scope.classactive = 'blue-active';
    $scope.classinactive = '';
    $scope.constraints = {};
    $scope.userBySfa = {};
    $scope.setTeamIdNull = function () {
        $.jStorage.set("teamId", null);
        NavigationService.editTeamId(null);
    };

    // ==========getAllSportsListSubCategory==============
    // $scope.allSportsListSubCatArr = [];
    var tempObj = {};
    tempObj.tempArr = [];
    $scope.getAllSport = function () {
        NavigationService.getAllSportsListSubCategory(function (data) {
            $scope.allSportsListSubCatArr = undefined;
            errorService.errorCode(data, function (allData) {
                if (!allData.message) {
                    if (allData.value) {
                        $scope.allSportsListSubCatArr = [];
                        $scope.allSportsListSubCat = allData.data;
                        _.each($scope.allSportsListSubCat, function (key, value) {
                            tempObj.sportName = value;
                            tempObj.tempArr = _.cloneDeep(key);
                            _.each(tempObj.tempArr, function (sport) {
                                console.log("athlete", $scope.detail);
                                if ($scope.detail.userType === "athlete" && !$scope.detail.mixAccess && $.jStorage.get("IsColg") === 'school' &&
                                    sport.name === 'Water Polo') {
                                    sport.isVisibleSport = true;
                                } else {
                                    sport.isVisibleSport = false;
                                }
                            });

                            if ($scope.detail.userType === "athlete" && !$scope.detail.mixAccess && $.jStorage.get("IsColg") === 'school' && tempObj.sportName === 'Team Sports') {
                                tempObj.hideTeamSport = true;
                            } else {
                                tempObj.hideTeamSport = false;
                            }
                            $scope.allSportsListSubCatArr.push(tempObj);
                            tempObj = {};
                        });
                    }
                } else {
                    $scope.isDisabled = false;
                    toastr.error(allData.message, 'Error Message');
                }
            });
        });
    }

    $scope.callLogin = function () {
        loginService.loginGet(function (data) {
            $scope.detail = data;
            console.log($scope.detail);
        });
        if ($.jStorage.get("userType") !== null && $.jStorage.get("userDetails") !== null) {
            if ($.jStorage.get("userType") === "school") {
                $scope.constraints.schoolToken = $.jStorage.get("userDetails").accessToken;
            } else {
                $scope.constraints.athleteToken = $.jStorage.get("userDetails").accessToken;
            }
        }
        $scope.getAllSport();
    };


    $scope.getOneDetails = function (parameterId) {
        var count = 1;
        NavigationService.editDetails(parameterId, function (data) {
            errorService.errorCode(data, function (allData) {

                if (!allData.message) {

                    if (allData.value) {
                        $scope.userBySfa = allData.data.data;
                        $scope.userBySfa.mixAccess = allData.data.mixAccess;
                        // if ($stateParams.userType === 'athlete') {
                        //     $scope.userBySfa = allData.data.data[0];
                        //     $scope.userBySfa.mixAccess = allData.data.mixAccess;
                        // }
                        NavigationService.setUser($scope.userBySfa);
                        $scope.callLogin();
                    } else {
                        toastr.error('Something went wrong', 'Error Message');
                    }
                } else {
                    toastr.error(allData.message, 'Error Message');
                }
            });
        });
    };

    if ($stateParams.id) {
        // $.jStorage.flush();
        $scope.parameterId = {};
        if ($stateParams.userType === 'school') {
            NavigationService.setUserType('school');
            $scope.parameterId.schoolId = $stateParams.id;
            $scope.getOneDetails($scope.parameterId);
        } else {
            NavigationService.setUserType('athlete');
            $scope.parameterId.athleteId = $stateParams.id;
            $scope.getOneDetails($scope.parameterId);
        }
    } else {
        if ($.jStorage.get("userDetails") === null) {
            $state.go('sports-registration');
        }
        $scope.callLogin();
    }




    $scope.logoutCandidate = function () {
        loginService.logoutCandidate(function (data) {
            if (data.isLoggedIn === false) {
                toastr.success('Successfully Logged Out', 'Logout Message');
                $state.go('sports-registration');
            } else {
                toastr.error('Something went wrong', 'Logout Message');
            }
        });
    };

    $scope.sptabchange = function (data) {
        if (data == 1) {
            $scope.sportsregistered = false;
            $scope.sportsschool = true;
        } else {
            $scope.sportsschool = false;
            $scope.sportsregistered = true;
            $scope.getAllRegisteredSport();
        }
    };
    // ===========removeThis========
    $scope.redirectTo = function (val) {
        console.log(val);
        $scope.currentDate = new Date();
        console.log($scope.currentDate, " $scope.currentDate ");
        $scope.currentDate = $scope.currentDate.setHours(0, 0, 0, 0);
        $scope.endDate = new Date(val.endDate);
        console.log("$scope.endDate ", $scope.endDate);
        $scope.endDate = $scope.endDate.setHours(0, 0, 0, 0);
        if ($scope.currentDate && $scope.endDate) {
            if ($scope.currentDate <= $scope.endDate) {
                console.log("eligible for registering sport");
                $.jStorage.set("confirmPageKey", val.sportType);
                selectService.redirectTo = val.sportType;
                console.log(selectService.redirectTo);
                if ($.jStorage.get('userType') == 'athlete') {
                    NavigationService.getIndividualAthlete({
                        'athleteToken': $.jStorage.get('userDetails').accessToken,
                        '_id': val._id,
                        'age': '',
                        'gender': '',
                        'page': 1
                    }, function (data) {
                        console.log(data);
                        if (data.data.data._id) {
                            $state.go('sports-rules', {
                                id: val._id
                            });
                        } else {
                            toastr.error("You are already selected for this sport");
                        }
                    });
                } else {
                    $state.go('sports-rules', {
                        id: val._id
                    });
                }
            } else {
                console.log("Not eligible for registering sport");
                var tempData = $.jStorage.get('userDetails');
                if (!tempData.mixAccess) {
                    $scope.particularSport = val.name;
                    $scope.registrationEnd = $uibModal.open({
                        animation: true,
                        scope: $scope,
                        backdrop: 'static',
                        keyboard: false,
                        // size: 'sm',
                        templateUrl: "views/modal/registrationend.html"
                    });
                    $timeout(function () {
                        $scope.registrationEnd.close();
                    }, 8000);
                } else {
                    console.log("eligible for registering sport");
                    $.jStorage.set("confirmPageKey", val.sportType);
                    selectService.redirectTo = val.sportType;
                    console.log(selectService.redirectTo);
                    if ($.jStorage.get('userType') == 'athlete') {
                        NavigationService.getIndividualAthlete({
                            'athleteToken': $.jStorage.get('userDetails').accessToken,
                            '_id': val._id,
                            'age': '',
                            'gender': '',
                            'page': 1
                        }, function (data) {
                            console.log(data);
                            if (data.data.data._id) {
                                $state.go('sports-rules', {
                                    id: val._id
                                });
                            } else {
                                toastr.error("You are already selected for this sport");
                            }
                        });
                    } else {
                        $state.go('sports-rules', {
                            id: val._id
                        });
                    }
                }
            }
        }
    };
    //for Tennis Mixed Doubles
    $scope.redirectForTennis = function (val) {
        if (val) {
            $scope.currentDate = new Date();
            console.log($scope.currentDate, " $scope.currentDate ");
            $scope.currentDate = $scope.currentDate.setHours(0, 0, 0, 0);
            $scope.endDate = new Date(val.endDate);
            console.log("$scope.endDate ", $scope.endDate);
            $scope.endDate = $scope.endDate.setHours(0, 0, 0, 0);
            if ($scope.currentDate && $scope.endDate) {
                if ($scope.currentDate <= $scope.endDate) {
                    console.log("eligible for registering sport");
                    $state.go('sports-rules', {
                        id: val._id
                    });

                } else {
                    console.log("Not eligible for registering sport");
                    var tempData = $.jStorage.get('userDetails');
                    if (!tempData.mixAccess) {
                        $scope.particularSport = val.name;
                        $scope.registrationEnd = $uibModal.open({
                            animation: true,
                            scope: $scope,
                            backdrop: 'static',
                            keyboard: false,
                            // size: 'sm',
                            templateUrl: "views/modal/registrationend.html"
                        });
                        $timeout(function () {
                            $scope.registrationEnd.close();
                        }, 8000);
                    } else {
                        console.log("eligible for registering sport");
                        $state.go('sports-rules', {
                            id: val._id
                        });
                    }

                }
            }
        }
    };

    $scope.messageForTennisMixedDoubles = function () {
        $scope.uploadSizeInstances = $uibModal.open({
            animation: true,
            scope: $scope,
            backdrop: 'static',
            keyboard: false,
            // size: 'sm',
            templateUrl: "views/modal/messageForTennisMixedDoubles.html"
        });
        $timeout(function () {
            $scope.uploadSizeInstances.close();
        }, 8000);
    };

    $scope.getAllRegisteredSport = function () {
        $scope.registerSport = undefined;
        NavigationService.getAllRegisteredSport($scope.constraints, function (data) {
            errorService.errorCode(data, function (allData) {
                if (allData.value) {
                    if (_.isEmpty(allData.data)) {
                        $scope.registerSport = [];
                    } else {
                        $scope.registerSport = allData.data;
                        // $scope.registerSportTeam = allData.data[0];
                        // $scope.registerSportIndividual = allData.data[1];
                        // _.each($scope.registerSportTeam, function (n) {
                        //     $scope.registerSport.push(n);
                        // });
                        // _.each($scope.registerSportIndividual, function (n) {
                        //     $scope.registerSport.push(n);
                        // });
                    }
                }
            });
        });
    };
});

myApp.controller('SportsRulesCtrl', function ($scope, TemplateService, $state, NavigationService, toastr, $timeout, $stateParams, errorService, loginService, selectService, configService) {
    $scope.template = TemplateService.getHTML("content/sports-rules.html");
    TemplateService.title = "Sports Rules And Regulations";
    $scope.navigation = NavigationService.getNavigation();
    configService.getDetail(function (data) {
        $scope.state = data.state;
        $scope.year = data.year;
        $scope.eventYear = data.eventYear;
        $scope.sfaCity = data.sfaCity;
        $scope.isCollege = data.isCollege;
        $scope.type = data.type;
    });
    $scope.selectService = selectService;
    $scope.basicSportDetails = {};
    $scope.selectService.setBasicSportDetails({
        '_id': $stateParams.id
    }, function (obj) {
        $scope.basicSportDetails = obj;
        $scope.selectService.sportName = obj.sportName;
        $scope.selectService.sportType = obj.sportType;
        $scope.selectService.isTeam = obj.isTeam;

    });
    loginService.loginGet(function (data) {
        $scope.detail = data;
    });

    if ($.jStorage.get("userDetails") === null) {
        $state.go('sports-registration');
    }

    $scope.logoutCandidate = function () {
        loginService.logoutCandidate(function (data) {
            if (data.isLoggedIn === false) {
                toastr.success('Successfully Logged Out', 'Logout Message');
                $state.go('sports-registration');
            } else {
                toastr.error('Something went wrong', 'Logout Message');
            }
        });
    };



    if ($stateParams.id) {
        $.jStorage.set("sportsId", $stateParams.id);
        NavigationService.getSportsRules($stateParams.id, function (data) {
            errorService.errorCode(data, function (allData) {
                if (!allData.message) {
                    if (allData.value) {
                        $scope.sportsRulesAndRegulation = allData.data;
                        $scope.ruleArray = [];
                        $scope.ruleArray.push(allData.data.rules);
                    } else {
                        console.log("no data found");
                    }
                } else {
                    $scope.isDisabled = false;
                    toastr.error(allData.message, 'Error Message');
                }
            });
        });
        if ($.jStorage.get('userType') == 'athlete') {
            NavigationService.getEvents({
                'athleteToken': $.jStorage.get('userDetails').accessToken,
                '_id': $stateParams.id
            }, function (data) {
                errorService.errorCode(data, function (allData) {
                    if (!allData.message) {
                        $scope.getEvents = allData.data;
                        $scope.selectService.pushToTeam($.jStorage.get('userDetails'), true, [], $scope.getEvents);
                    } else {
                        $scope.isDisabled = false;
                        toastr.error(allData.message, 'Error Message');
                    }
                });
            });
        }

    }
    $scope.goTotermsCheck = function (val, id, isTeam) {
        $scope.yourPromise = NavigationService.success().then(function () {
            if (val === undefined) {
                toastr.error('Please Accept Terms And Conditions');
                $scope.errorMsg = true;
            } else {
                if (val === true) {
                    if (isTeam === true) {
                        $state.go('team-selection', {
                            id: id
                        });
                    } else {
                        if ($.jStorage.get('userType') == 'school') {
                            $state.go('individual-selection', {
                                id: id
                            });
                        } else if ($.jStorage.get('userType') == 'athlete') {
                            console.log($scope.basicSportDetails);
                            $scope.selectService.goNext($scope.basicSportDetails, null, null, null);
                        }

                    }

                }
            }
        });
    };


});

myApp.controller('SportIndividualCtrl', function ($scope, TemplateService, toastr, NavigationService, $timeout, $state, $stateParams, loginService, errorService, configService) {
    $scope.template = TemplateService.getHTML("content/sport-individualdetail.html");
    TemplateService.title = "Registered Individual Detail";
    $scope.navigation = NavigationService.getNavigation();
    configService.getDetail(function (data) {
        $scope.state = data.state;
        $scope.year = data.year;
        $scope.eventYear = data.eventYear;
        $scope.sfaCity = data.sfaCity;
        $scope.isCollege = data.isCollege;
        $scope.type = data.type;
    });
    // $scope.formData = {};
    $scope.constraints = {};
    loginService.loginGet(function (data) {
        $scope.detail = data;
    });

    if ($.jStorage.get("userDetails") === null) {
        $state.go('sports-registration');
    }

    $scope.logoutCandidate = function () {
        loginService.logoutCandidate(function (data) {
            if (data.isLoggedIn === false) {
                toastr.success('Successfully Logged Out', 'Logout Message');
                $state.go('sports-registration');
            } else {
                toastr.error('Something went wrong', 'Logout Message');
            }
        });
    };

    if ($.jStorage.get("userType") === "school") {
        $scope.constraints.schoolToken = $.jStorage.get("userDetails").accessToken;
    } else {
        $scope.constraints.athleteToken = $.jStorage.get("userDetails").accessToken;
    }

    if ($stateParams.id) {
        console.log($stateParams.id);
        $scope.constraints.sportsListSubCategory = $stateParams.id;
        $scope.constraints.type = 'Individual';
    }

    $scope.getDetailRegisteredSport = function () {
        $scope.getIndividualDetails = undefined;
        NavigationService.getDetailRegisteredSport($scope.constraints, function (data) {
            errorService.errorCode(data, function (allData) {
                if (allData.value) {
                    if (_.isEmpty(allData.data)) {
                        $scope.getIndividualDetails = [];
                        console.log('enter');
                    } else {
                        $scope.getIndividualDetails = allData.data;
                        console.log($scope.getIndividualDetails);
                        $scope.sportBy = $scope.getIndividualDetails[0].info[0].createdBy.toLowerCase();
                    }
                }
            });
        });
    };
    $scope.getDetailRegisteredSport();

    // function for printing..
    $scope.printFunction = function (printSectionId) {
        var innerContents = document.getElementById(printSectionId).innerHTML;
        // var popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
        // popupWinindow.document.open();
        var popupWinindow = window.open('width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
        // popupWinindow.document.open();
        popupWinindow.document.write('<html><head><link rel="stylesheet" type="text/css" href="../../css/main.css" /></head><body onload="window.print()">' + innerContents + '</html>');
        popupWinindow.document.close();
    };
});

myApp.controller('SportTeamCtrl', function ($scope, TemplateService, toastr, NavigationService, $timeout, $state, $stateParams, loginService, errorService, selectService, configService) {
    $scope.template = TemplateService.getHTML("content/sport-teamdetail.html");
    TemplateService.title = "Registered Team Detail";
    $scope.navigation = NavigationService.getNavigation();
    configService.getDetail(function (data) {
        $scope.state = data.state;
        $scope.year = data.year;
        $scope.eventYear = data.eventYear;
        $scope.sfaCity = data.sfaCity;
        $scope.isCollege = data.isCollege;
        $scope.type = data.type;
    });
    // $scope.formData = {};
    $scope.selectService = selectService;
    $scope.stateId = $stateParams.id;
    $scope.constraints = {};
    loginService.loginGet(function (data) {
        $scope.detail = data;
    });
    $scope.setTeamid = function (id) {
        NavigationService.setTeamid(id);
        NavigationService.setVariable(true);
    };

    if ($.jStorage.get("userDetails") === null) {
        $state.go('sports-registration');
    }

    $scope.logoutCandidate = function () {
        loginService.logoutCandidate(function (data) {
            if (data.isLoggedIn === false) {
                toastr.success('Successfully Logged Out', 'Logout Message');
                $state.go('sports-registration');
            } else {
                toastr.error('Something went wrong', 'Logout Message');
            }
        });
    };

    if ($.jStorage.get("userType") === "school") {
        $scope.constraints.schoolToken = $.jStorage.get("userDetails").accessToken;
    } else {
        $scope.constraints.athleteToken = $.jStorage.get("userDetails").accessToken;
    }

    if ($stateParams.id) {
        console.log($stateParams.id);
        $scope.constraints.sportsListSubCategory = $stateParams.id;
        $scope.constraints.type = 'Team';
    }

    $scope.getDetailRegisteredSport = function () {
        $scope.getTeamDetails = undefined;
        NavigationService.getDetailRegisteredSport($scope.constraints, function (data) {
            errorService.errorCode(data, function (allData) {
                if (allData.value) {
                    if (_.isEmpty(allData.data)) {
                        $scope.getTeamDetails = [];
                    } else {
                        $scope.getTeamDetails = allData.data;
                        $scope.sportTitle = $scope.getTeamDetails[0].info[0].sportName;
                        $scope.sportBy = $scope.getTeamDetails[0].info[0].createdBy;

                    }
                }
            });
        });
    };
    $scope.getDetailRegisteredSport();

    // function for printing..
    $scope.printFunction = function (printSectionId) {
        var innerContents = document.getElementById(printSectionId).innerHTML;
        // var popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
        // popupWinindow.document.open();
        var popupWinindow = window.open('width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
        // popupWinindow.document.open();
        popupWinindow.document.write('<html><head><link rel="stylesheet" type="text/css" href="../../css/main.css" /></head><body onload="window.print()">' + innerContents + '</html>');
        popupWinindow.document.close();
    };


});