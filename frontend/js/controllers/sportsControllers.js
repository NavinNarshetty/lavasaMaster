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
    $scope.sportsschool = false;
    $scope.sportsregistered = false;
    $scope.classactive = 'blue-active';
    $scope.classinactive = '';
    $scope.constraints = {};
    $scope.userBySfa = {};

    // if ($.jStorage.get("userDetails")) {
    //     $scope.userDetails = $.jStorage.get("userDetails");
    //     $scope.hideChangePassword = false;
    // }

    $scope.setTeamIdNull = function () {
        $.jStorage.set("teamId", null);
        NavigationService.editTeamId(null);
    };

    $timeout(function () {
        if ($.jStorage.get("userDetails")) {
            $scope.userDetails = $.jStorage.get("userDetails");
            $scope.hideChangePassword = false;
            //Initialise For Upgrade
            $scope.upgrade = {};
            $scope.upgrade.id = $scope.userDetails._id;
            $scope.upgrade.package = $scope.userDetails.package;
            if ($scope.detail.userType == 'athlete') {
                $scope.upgrade.userType = 'player';
            } else if ($scope.detail.userType == 'school') {
                if ($scope.userDetails.institutionType == 'school') {
                    $scope.upgrade.userType = 'school';
                } else if ($scope.userDetails.institutionType == 'college') {
                    $scope.upgrade.userType = 'college';
                }
            }
            //Initialise For Upgrade End
        }
    }, 500);

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
                                // console.log("athlete", $scope.detail);
                                if ($scope.detail.userType === "athlete" && !$scope.detail.mixAccess && $.jStorage.get("IsColg") === 'school' && (
                                    sport.name === 'Water Polo' || sport.name === 'Athletics 4x100m Relay' || sport.name === 'Athletics 4x50m Relay' || sport.name === 'Athletics Medley Relay')) {
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
            // console.log($scope.detail);
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
            $scope.data = {};
            if ($.jStorage.get("userType") === 'athlete') {
                $scope.data.type = 'player';
            } else {
                $scope.data.type = 'school';
            }
            $state.go('registerplayer', {
                type: $scope.data.type
            });
        }
        $scope.callLogin();
    }

    // SHOW UPGRADE POPUP
    $scope.showUpgradeModal = function () {
        $scope.modalInstance = $uibModal.open({
            animation: true,
            scope: $scope,
            // backdrop: 'static',
            // keyboard: false,
            templateUrl: 'views/modal/upgradepackage-modal.html',
            windowClass: 'modal-upgradepackage'
        });
    }
    // SHOW UPGRADE POPUP END


    $scope.logoutCandidate = function () {
        console.log("iminnn");
        loginService.logoutCandidate(function (data) {
            console.log("data", data);
            if (data.isLoggedIn === false) {
                console.log("imiinnnnnnnnnnn");
                toastr.success('Successfully Logged Out', 'Logout Message');
                $state.go('registerplayer', {
                    type: data.type
                });
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
        function redirect() {
            // console.log(val);
            $scope.currentDate = new Date();
            // console.log($scope.currentDate, " $scope.currentDate ");
            $scope.currentDate = $scope.currentDate.setHours(0, 0, 0, 0);
            $scope.endDate = new Date(val.endDate);
            // console.log("$scope.endDate ", $scope.endDate);
            $scope.endDate = $scope.endDate.setHours(0, 0, 0, 0);
            if ($scope.currentDate && $scope.endDate) {
                if ($scope.currentDate <= $scope.endDate) {
                    // console.log("eligible for registering sport");
                    $.jStorage.set("confirmPageKey", val.sportType);
                    selectService.redirectTo = val.sportType;
                    // console.log(selectService.redirectTo);
                    if ($.jStorage.get('userType') == 'athlete') {
                        NavigationService.getIndividualAthlete({
                            'athleteToken': $.jStorage.get('userDetails').accessToken,
                            '_id': val._id,
                            'age': '',
                            'gender': '',
                            'page': 1
                        }, function (data) {
                            // console.log(data);
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
                    // console.log("Not eligible for registering sport");
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
                        // console.log("eligible for registering sport");
                        $.jStorage.set("confirmPageKey", val.sportType);
                        selectService.redirectTo = val.sportType;
                        // console.log(selectService.redirectTo);
                        if ($.jStorage.get('userType') == 'athlete') {
                            NavigationService.getIndividualAthlete({
                                'athleteToken': $.jStorage.get('userDetails').accessToken,
                                '_id': val._id,
                                'age': '',
                                'gender': '',
                                'page': 1
                            }, function (data) {
                                // console.log(data);
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
        }

        if ($scope.detail.userType === 'athlete') {
            console.log("package", $scope.detail);

            if (($.jStorage.get("userDetails").selectedEvent < $.jStorage.get("userDetails").package.eventCount)) {
                if ($.jStorage.get("userDetails").package.order != 4) {
                    redirect();
                } else {
                    if (val.isTeam && (val.sportsListCategory.name == "Team Sports" || val.name == "Water Polo")) {
                        redirect();
                    } else {
                        $scope.showUpgradeModal();
                        // toastr.error("Only Team Sports Can be Selected As Per Your Package");
                    }
                }
            } else {
                if ($scope.userDetails.package.order == 1) {
                    toastr.error("Maximum Sport Selected");
                } else {
                    $scope.showUpgradeModal();
                }
                // toastr.error("Upgrade Your Package To Register Additional Sports", "Maximum Sport Selected");
            }
        } else {
            redirect();
        }

    };
    //for Tennis Mixed Doubles
    $scope.redirectForTennis = function (val) {
        if (val) {
            $scope.currentDate = new Date();
            // console.log($scope.currentDate, " $scope.currentDate ");
            $scope.currentDate = $scope.currentDate.setHours(0, 0, 0, 0);
            $scope.endDate = new Date(val.endDate);
            // console.log("$scope.endDate ", $scope.endDate);
            $scope.endDate = $scope.endDate.setHours(0, 0, 0, 0);
            if ($scope.currentDate && $scope.endDate) {
                if ($scope.currentDate <= $scope.endDate) {
                    // console.log("eligible for registering sport");
                    $state.go('sports-rules', {
                        id: val._id
                    });

                } else {
                    // console.log("Not eligible for registering sport");
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
                        // console.log("eligible for registering sport");
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
        $scope.selectService.disableNextOnRules = false;
        $scope.selectService.isDisabled = false;
    });
    loginService.loginGet(function (data) {
        $scope.detail = data;
    });

    if ($.jStorage.get("userDetails") === null) {
        $scope.data = {};
        if ($.jStorage.get("userType") === 'athlete') {
            $scope.data.type = 'player';
        } else {
            $scope.data.type = 'school';
        }
        $state.go('registerplayer', {
            type: $scope.data.type
        });
    }

    if ($.jStorage.get("userDetails")) {
        $scope.userDetails = $.jStorage.get("userDetails");
        $scope.hideChangePassword = true;
    }

    $scope.logoutCandidate = function () {
        loginService.logoutCandidate(function (data) {
            if (data.isLoggedIn === false) {
                toastr.success('Successfully Logged Out', 'Logout Message');
                $state.go('registerplayer', {
                    type: data.type
                });
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
                        // console.log("no data found");
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
                            // console.log($scope.basicSportDetails);
                            $scope.selectService.goNext($scope.basicSportDetails, null, null, null);
                        }

                    }

                }
            }
        });
    };


});

myApp.controller('SportIndividualCtrl', function ($scope, TemplateService, toastr, $filter, $uibModal, NavigationService, $timeout, $state, $stateParams, loginService, errorService, configService) {
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
        $scope.data = {};
        if ($.jStorage.get("userType") === 'athlete') {
            $scope.data.type = 'player';
        } else {
            $scope.data.type = 'school';
        }
        $state.go('registerplayer', {
            type: $scope.data.type
        });

    }

    if ($.jStorage.get("userDetails")) {
        $scope.userDetails = $.jStorage.get("userDetails");
        $scope.hideChangePassword = true;
    }

    $scope.logoutCandidate = function () {
        loginService.logoutCandidate(function (data) {
            if (data.isLoggedIn === false) {
                toastr.success('Successfully Logged Out', 'Logout Message');
                $state.go('registerplayer', {
                    type: data.type
                });
            } else {
                toastr.error('Something went wrong', 'Logout Message');
            }
        });
    };

    if ($.jStorage.get("userType") === "school") {
        $scope.userType = $filter('firstcapitalize')($.jStorage.get("userType"));
        if ($.jStorage.get("userDetails") != null) {
            $scope.constraints.schoolToken = $.jStorage.get("userDetails").accessToken;
        }

    } else {
        $scope.userType = $filter('firstcapitalize')($.jStorage.get("userType"));
        if ($.jStorage.get("userDetails") != null) {
            $scope.constraints.athleteToken = $.jStorage.get("userDetails").accessToken;
        }


    }

    if ($stateParams.id) {
        // console.log($stateParams.id);
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
                        // console.log('enter');
                    } else {
                        $scope.getIndividualDetails = allData.data;
                        // console.log($scope.getIndividualDetails);
                        $scope.sportBy = $scope.getIndividualDetails[0].info[0].createdBy.toLowerCase();
                    }
                }
            });
        });
    };
    $scope.getDetailRegisteredSport();


    $scope.deletePlayer = function (sportInfo) {
        $scope.sportNameLists = [];
        $scope.sportInfo = sportInfo;
        $scope.sportName = sportInfo.name;
        _.each($scope.getIndividualDetails, function (value) {
            _.each(value.info, function (key) {
                if (key.mainid == sportInfo.mainid && key.name !== sportInfo.name) {
                    $scope.sportNameLists.push(key.name);
                }
            });
        });
        if ($.jStorage.get("userType") == 'school') {
            if (sportInfo.middlename) {
                $scope.sportInfo.athleteName = sportInfo.firstname + ' ' + sportInfo.middlename + ' ' + sportInfo.lastname + ' - ' + sportInfo.sfaid;
            } else {
                $scope.sportInfo.athleteName = sportInfo.firstname + ' ' + sportInfo.lastname + ' - ' + sportInfo.sfaid;
            }
        }
        $scope.modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'views/modal/deleteSport.html',
            // backdrop: 'static',
            keyboard: false,
            size: 'sm',
            scope: $scope

        });

    };

    $scope.confirmDelete = function () {
        var obj = {};
        obj._id = $scope.sportInfo.mainid;
        var url = 'IndividualSport/delete';
        console.log("id", $scope.sportInfo);
        NavigationService.deleteData(url, obj, function (data) {
            $scope.getDetailRegisteredSport();
            if (data.value == true) {
                if (($.jStorage.get("userType") == 'school')) {
                    toastr.success($scope.sportInfo.athleteName + ' ' + 'registration for' + ' ' + $scope.sportInfo.sportName + ' ' + 'has been deleted successfully');
                } else {
                    toastr.success('Your registration for' + ' ' + $scope.sportInfo.sportName + ' ' + 'has been deleted successfully');
                }

            }
            if ($scope.getIndividualDetails === undefined) {
                $state.go('sports-selection');
            }
        });
    };

    // function for printing..
    $scope.hideDeleteEdit = false;
    $scope.printFunction = function (printSectionId) {
        $scope.hideDeleteEdit = true;
        $timeout(function () {
            var innerContents = document.getElementById(printSectionId).innerHTML;
            // var popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
            // popupWinindow.document.open();
            var popupWinindow = window.open('width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
            // popupWinindow.document.open();
            popupWinindow.document.write('<html><head><link rel="stylesheet" type="text/css" href="../../css/main.css" /></head><body onload="window.print()">' + innerContents + '</html>');
            popupWinindow.document.close();
        }, 1000);
        $timeout(function () {
            $scope.hideDeleteEdit = false;
        }, 1000);

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
    $scope.setTeamid = function (id, stateId) {
        NavigationService.setTeamid(id);
        NavigationService.setVariable(true);
        $scope.selectService.team = [];
        $state.go('team-selection', {
            id: stateId
        });
    };

    if ($.jStorage.get("userDetails") === null) {
        $scope.data = {};
        if ($.jStorage.get("userType") === 'athlete') {
            $scope.data.type = 'player';
        } else {
            $scope.data.type = 'school';
        }
        $state.go('registerplayer', {
            type: $scope.data.type
        });

    }

    if ($.jStorage.get("userDetails")) {
        $scope.userDetails = $.jStorage.get("userDetails");
        $scope.hideChangePassword = true;
    }

    $scope.logoutCandidate = function () {
        loginService.logoutCandidate(function (data) {
            if (data.isLoggedIn === false) {
                toastr.success('Successfully Logged Out', 'Logout Message');
                $state.go('registerplayer', {
                    type: data.type
                });
            } else {
                toastr.error('Something went wrong', 'Logout Message');
            }
        });
    };

    if ($.jStorage.get("userType") === "school") {
        if ($.jStorage.get("userDetails") != null) {
            $scope.constraints.schoolToken = $.jStorage.get("userDetails").accessToken;
        }

    } else {
        if ($.jStorage.get("userDetails") != null) {
            $scope.constraints.athleteToken = $.jStorage.get("userDetails").accessToken;
        }

    }

    if ($stateParams.id) {
        // console.log($stateParams.id);
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
    $scope.hideDeleteEdit = false;
    $scope.printFunction = function (printSectionId) {
        $scope.hideDeleteEdit = true;
        $timeout(function () {
            var innerContents = document.getElementById(printSectionId).innerHTML;
            // var popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
            // popupWinindow.document.open();
            var popupWinindow = window.open('width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
            // popupWinindow.document.open();
            popupWinindow.document.write('<html><head><link rel="stylesheet" type="text/css" href="../../css/main.css" /></head><body onload="window.print()">' + innerContents + '</html>');
            popupWinindow.document.close();
        }, 1000);

        $timeout(function () {
            $scope.hideDeleteEdit = false;
        }, 1000);


    };


});