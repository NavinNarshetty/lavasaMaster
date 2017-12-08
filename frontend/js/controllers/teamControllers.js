myApp.controller('TeamSelectionCtrl', function ($scope, TemplateService, $state, NavigationService, $stateParams, toastr, $timeout, errorService, loginService, selectService, $rootScope, configService) {
    $scope.template = TemplateService.getHTML("content/team-selection.html");
    TemplateService.title = "Team Selection"; //This is the Title of the Website
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
    // console.log("$scope.selectService", $scope.selectService);

    $scope.selectService.sportsId = $stateParams.id;
    $scope.ageGroup = [];
    $scope.formData = {};
    $scope.selectAthlete = [];
    $scope.listOfAthelete = [];
    $scope.maleAgeGrp = [];
    $scope.femaleAgeGrp = [];
    $scope.teamMembers = [];
    $scope.constraints = {};
    $scope.constraints._id = $stateParams.id;
    $scope.getAthletePerSchoolObj = {};
    $scope.getAthletePerSchoolObj.sfaid = '';
    $scope.getAthletePerSchoolObj.page = 1;
    $scope.busy = false;
    $scope.noAthletefound = false;
    $scope.editablestudentTeam = [];
    // mixAccess

    loginService.loginGet(function (data) {
        $scope.detail = data;
    });

    window.onbeforeunload = function () {
        NavigationService.setVariable(true);
    };
    if ($scope.detail.userType === "athlete") {
        $scope.constraints.athleteToken = $scope.detail.accessToken;
        $scope.getAthletePerSchoolObj.athleteToken = $scope.detail.accessToken;
    } else {
        $scope.constraints.schoolToken = $scope.detail.accessToken;
        $scope.getAthletePerSchoolObj.schoolToken = $scope.detail.accessToken;
    }
    $scope.getSportDetails = function () {
        // $scope.constraints._id = $stateParams.id;
        NavigationService.getSportDetails($scope.constraints,
            function (data) {
                $scope.basicSportDetails = data.data;
                $scope.selectService.sportName = data.data.sportName;
                $scope.selectService.sportType = data.data.sportType;
            });
    };
    $scope.getSportDetails();

    if ($.jStorage.get("userDetails") === null) {
        $state.go('sports-registration');
    } else if ($stateParams.id === '') {
        $state.go('sports-selection');
    }
    //*** logout function
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

    if ($.jStorage.get("schoolName") !== null) {
        $scope.getAthletePerSchoolObj.school = $.jStorage.get("schoolName");
    }

    // *****for getting all athletes*****
    $scope.athletePerSchool = function (getAthletePerSchoolObj) {
        var url = '';
        if ($.jStorage.get("editTeamId") !== null) {
            if ($scope.detail.mixAccess === true || !$scope.detail.mixAccess) {
                url = 'sport/editAthletePerSchool';
                getAthletePerSchoolObj.teamid = $.jStorage.get("editTeamId");
            } else {
                toastr.error('Something went wrong, Try again', 'Error Message');
            }
        } else {
            url = 'sport/getAthletePerSchool';
        }
        $scope.setDisabled = false;
        if ($scope.busy) return;
        $scope.busy = true;
        NavigationService.getAthletePerSchool(getAthletePerSchoolObj, url, function (data) {
            errorService.errorCode(data, function (allData) {
                if (!allData.message) {
                    if (allData.value) {
                        $scope.isLoading = false;
                        if (allData.data.data === undefined) {
                            if ($scope.selectAthlete.length === 0) {
                                $scope.noAthletefound = true;
                            } else {
                                $scope.noAthletefound = false;
                            }
                        } else {
                            $scope.noAthletefound = false;
                            if (allData.data.totalpages >= getAthletePerSchoolObj.page) {
                                $scope.showMsg = true;
                                $scope.isLoading = false;
                                _.each(allData.data.data, function (value) {
                                    value.fullNameWithsfaId = value.sfaId + " - " + value.firstName + "   " + value.surname;
                                    $scope.selectAthlete.push(value);
                                    $scope.busy = false;
                                });
                                $scope.selectAthlete = _.uniqBy($scope.selectAthlete, 'sfaId');
                                if ($.jStorage.get("flag") === true) {
                                    if ($scope.editablestudentTeam) {
                                        _.each($scope.selectService.team, function (j) {
                                            _.each($scope.editablestudentTeam, function (k, index) {
                                                if (k != undefined) {
                                                    if (j._id != k.studentId) {
                                                        $scope.editablestudentTeam.splice(index, 1);
                                                    }
                                                }

                                            });

                                        });
                                    }
                                    _.each($scope.editablestudentTeam, function (key) {
                                        // console.log("edit key", key);
                                        if (key != undefined) {
                                            _.each($scope.selectAthlete, function (value) {
                                                // console.log("edit value", value._id);
                                                if (key.studentId === value._id) {
                                                    // console.log("im intrue");
                                                    value.isTeamSelected = false;
                                                    value.checked = true;
                                                    $scope.selectService.team = _.filter($scope.selectService.team, 'checked');
                                                    $scope.pushToTeam(value, value.checked, $scope.selectAthlete);
                                                }
                                            });
                                        }


                                    });
                                } else {
                                    // console.log("flag is not found");
                                    _.each($scope.editablestudentTeam, function (key) {
                                        _.each($scope.selectAthlete, function (value) {
                                            if (key.studentId === value._id) {
                                                value.isTeamSelected = false;
                                            }
                                        });

                                    });
                                }
                                $scope.listOfAthelete = $scope.selectService.isAtheleteSelected($scope.selectAthlete);
                                //***for athlete purpose
                                if ($scope.detail.userType === 'athlete') {
                                    var indexOfAthlete = _.findIndex($scope.listOfAthelete, ['sfaId', $scope.detail.sfaIdObj]);
                                    if (indexOfAthlete >= 0) {
                                        $scope.listOfAthelete[indexOfAthlete].checked = true;
                                        $scope.listOfAthelete[indexOfAthlete].setDisabled = true;
                                        if (selectService.team.length === 0) {
                                            if ($scope.listOfAthelete[indexOfAthlete].isTeamSelected === true) {
                                                toastr.error("Already registered for this sports.");
                                                $scope.setDisabled = true;
                                                $scope.busy = true;
                                            } else {
                                                $scope.setDisabled = false;
                                                selectService.pushToTeam($scope.listOfAthelete[indexOfAthlete], $scope.listOfAthelete[indexOfAthlete].checked, $scope.listOfAthelete);
                                            }
                                        }
                                    } else {
                                        // $scope.setDisabled = true;
                                        // console.log("Im in else");
                                    }
                                }
                            }
                        }

                    }
                } else {
                    $scope.isDisabled = false;
                    toastr.error(allData.message, 'Error Message');
                }
            });
        });
    };


    // *****for getting one sportId*****
    $scope.getSportId = function (constraints) {
        var getOneSportUrl = '';
        if ($.jStorage.get("editTeamId") !== null) {
            getOneSportUrl = 'SportsListSubCategory/editOneSport';
        } else {
            getOneSportUrl = 'SportsListSubCategory/getOneSport';
        }
        NavigationService.getOneSportForRegistration(constraints, getOneSportUrl, function (data) {
            errorService.errorCode(data, function (allData) {
                if (!allData.message) {
                    if (allData.value) {
                        $scope.showMsg = true;
                        $scope.selectAthlete = [];
                        $scope.listOfAthelete = [];
                        $scope.getAthletePerSchoolObj.sport = allData.data.sport;
                        NavigationService.setSportId(allData.data.sport);
                        $scope.minPlayer = allData.data.minplayer;
                        $scope.maxPlayer = allData.data.maxPlayer;
                        $scope.getAthletePerSchoolObj.page = 1;
                        $scope.busy = false;
                        $scope.athletePerSchool($scope.getAthletePerSchoolObj);
                    } else {
                        $scope.isLoading = false;
                        $scope.showMsg = false;
                        if (allData.data === 'No User Found') {
                            toastr.error("No User Found", 'Error Message');
                        }
                        if (allData.error === "Max Team Created") {
                            toastr.error("Maximum Team is Already Created", 'Error Message');
                        }
                    }
                } else {
                    $scope.isDisabled = false;
                    toastr.error(allData.message, 'Error Message');
                }
            });
        });
    };

    //***** for getting age group *****
    $scope.filterAge = function (ageId, ageName) {
        $scope.listOfAthelete = [];
        $scope.isLoading = true;
        $scope.busy = false;
        $scope.noAthletefound = false;
        $scope.constraints.age = ageId;
        $scope.showAgeObj = ageName;
        NavigationService.setAgeTitle($scope.showAgeObj);
        $scope.getAthletePerSchoolObj.age = ageId;
        $scope.getSportId($scope.constraints);
    };

    // *****search by sfaId*****
    $scope.searchaBysfaId = function (serach) {
        $scope.selectAthlete = [];
        $scope.listOfAthelete = [];
        $scope.busy = false;
        $scope.getAthletePerSchoolObj.page = 1;
        $scope.athletePerSchool($scope.getAthletePerSchoolObj);
    };
    // *****load more data *****
    $scope.loadMore = function () {
        ++$scope.getAthletePerSchoolObj.page;
        $scope.athletePerSchool($scope.getAthletePerSchoolObj);
    };

    //    *****sorting age genderwise*****
    $scope.sortGenderWise = function (gender) {
        if (gender == 'both') {
            $scope.showFemale = false;
            $scope.showMale = false;
            $scope.showBoth = true;
            $scope.constraints.gender = gender;
            $scope.getAthletePerSchoolObj.gender = gender;
            NavigationService.setGender($scope.constraints.gender);
        } else {
            $scope.showBoth = false;
            if (gender == "female") {
                $scope.showFemale = true;
                $scope.showMale = false;
                $scope.constraints.gender = gender;
                NavigationService.setGender($scope.constraints.gender);
                $scope.getAthletePerSchoolObj.gender = gender;
            } else {
                $scope.showMale = true;
                $scope.showFemale = false;
                $scope.constraints.gender = gender;
                $scope.getAthletePerSchoolObj.gender = gender;
                NavigationService.setGender($scope.constraints.gender);

            }
        }

    };
    // function
    // $scope.specifyGender = function (sportTitle) {
    //     if (sportTitle === 'Tennis Mixed Doubles') {
    //         $scope.selectService.gender = 'both';
    //     } else {
    //         if ($.jStorage.get("userDetails") !== null) {
    //             if ($scope.detail.userType === 'athlete') {
    //                 if ($.jStorage.get("userDetails").gender !== null) {
    //                     $scope.selectService.gender = $.jStorage.get("userDetails").gender;
    //                     console.log($scope.selectService.gender, "$scope.selectService.gender");
    //                 }
    //             } else {
    //                 $scope.selectService.gender = 'male';
    //             }
    //         }
    //     }
    // };

    if ($scope.detail.userType === 'athlete') {
        if ($.jStorage.get("userDetails").gender !== null) {
            $scope.selectService.gender = $.jStorage.get("userDetails").gender;
        }
    }

    //  *****getting all age group ***** 
    $scope.sportGet = function (ageGroup) {
        if ($stateParams.id) {
            NavigationService.getSports($scope.constraints, function (data) {
                errorService.errorCode(data, function (allData) {
                    if (!allData.message) {
                        if (allData.value === true) {
                            if (allData.data.length === 0) {
                                $scope.visibleDiv = false;
                                toastr.error('No Data Found', 'Error Message');
                            } else {
                                $scope.visibleDiv = true;
                                $scope.getSports = allData.data.results;
                                $scope.sportTitle = allData.data.sportName;
                                if ($scope.sportTitle === 'Tennis Mixed Doubles') {
                                    $scope.selectService.gender = 'both';
                                }
                                // $scope.specifyGender($scope.sportTitle);
                                NavigationService.setSportTitle($scope.sportTitle);
                                $scope.maleAgeGrp = _.cloneDeep($scope.getSports.male);
                                $scope.femaleAgeGrp = _.cloneDeep($scope.getSports.female);
                                $scope.maleAndFemale = _.cloneDeep($scope.getSports.both);
                                var sortIt = [$scope.maleAgeGrp, $scope.femaleAgeGrp, $scope.maleAndFemale];
                                _.each(sortIt, function (arr) {
                                    _.each(arr, function (key) {
                                        if (key) {
                                            key.orderage = parseInt(key.ageData.name.slice(2));
                                        }
                                    });
                                });
                                if (ageGroup) {
                                    _.each(sortIt, function (arr) {
                                        // console.log("arr", arr);
                                        _.each(arr, function (key) {
                                            if (key.ageGroup === ageGroup) {
                                                key.disablethis = false;
                                            } else {
                                                key.disablethis = true;
                                            }
                                        });

                                    });

                                }
                                $scope.sortGenderWise($scope.selectService.gender);
                                //  $scope.sortGenderWise('male');
                            }

                        } else {
                            // console.log("im in false");
                            $scope.visibleDiv = false;
                            if (allData.error === "Sports Category Not Found") {
                                toastr.error('You are not Eligible for this Sport', 'Error Message');
                                $state.go('sports-selection');
                            }
                        }
                    } else {
                        $scope.isDisabled = false;
                        toastr.error(allData.message, 'Error Message');
                    }
                });
            });
        }
    };

    $scope.sportGet();

    // function pushToTeam
    $scope.pushToTeam = function (checked, bool, listOfAthelete, objIndex, flag) {
        // console.log("flag", flag);
        if ($.jStorage.get("sportTitle") === "Tennis Mixed Doubles") {
            if (flag == 'true') {
                if ($scope.editablestudentTeam.length > 0) {
                    var foundAthleteIndex = _.findIndex($scope.editablestudentTeam, ['studentId', checked._id]);
                    // console.log("foundAthleteIndex", foundAthleteIndex);
                    $scope.editablestudentTeam.splice(foundAthleteIndex, 1);
                    // console.log("scope.editablestudentTeam", $scope.editablestudentTeam);
                }
            }
            $scope.selectService.pushToTeam(checked, bool, listOfAthelete);
            $scope.selectService.team = _.filter($scope.selectService.team, 'checked');
            $scope.selectService.team = _.uniqBy($scope.selectService.team, 'gender');
            if (bool) {
                var indexOfAthlete = _.findIndex($scope.selectService.team, ['sfaId', checked.sfaId]);
                if (indexOfAthlete < 0) {
                    var findIndex = _.findIndex($scope.listOfAthelete, ['sfaId', checked.sfaId]);
                    if (findIndex >= 0) {
                        $scope.listOfAthelete[findIndex].disableGender = true;
                        $scope.listOfAthelete[findIndex].checked = false;
                    } else {
                        // console.log("im in false");
                    }
                } else {
                    // console.log("outer false");
                }
            }

            if ($scope.selectService.team.length === 2) {
                $scope.setDisabled = true;
            } else {
                $scope.setDisabled = false;
            }
            if ($scope.selectService.team.length === 0) {
                _.each($scope.listOfAthelete, function (key) {
                    if (key.disableGender) {
                        key.disableGender = false;
                    }
                });
            }
        } else {
            // console.log("scope.editablestudentTeam", $scope.editablestudentTeam);
            if (flag == 'true') {
                if ($scope.editablestudentTeam.length > 0) {
                    var foundAthleteIndex = _.findIndex($scope.editablestudentTeam, ['studentId', checked._id]);
                    // console.log("foundAthleteIndex", foundAthleteIndex);
                    $scope.editablestudentTeam.splice(foundAthleteIndex, 1);
                    // console.log("scope.editablestudentTeam", $scope.editablestudentTeam);
                }
            }

            $scope.selectService.pushToTeam(checked, bool, listOfAthelete);

            if ($scope.selectService.team.length <= $scope.maxPlayer) {
                // console.log("$scope.selectService.team.length ", $scope.selectService.team.length);

            } else {
                if (objIndex !== undefined) {
                    $scope.listOfAthelete[objIndex].checked = false;
                }
                $scope.setDisabled = true;
            }
            $scope.selectService.team = _.filter($scope.selectService.team, 'checked');
        }

    };
    // function
    $scope.deselectCheckbx = function () {
        $scope.setDisabled = false;
        if ($.jStorage.get("sportTitle") === "Tennis Mixed Doubles") {
            _.each($scope.listOfAthelete, function (key) {
                if (key.disableGender) {
                    key.disableGender = false;
                    key.checked = false;
                }
            });
        }
    };

    // function
    $scope.maxPlayerAllow = function (index) {
        if (selectService.team.length > $scope.maxPlayer) {
            toastr.error('Kindly select a minimum of' + ' ' + ' ' + $scope.minPlayer + ' ' + 'players and a maximum of' + ' ' + $scope.maxPlayer + ' ' +
                'players');
        }
    };


    if ($scope.selectService && $scope.selectService.ageGroup) {
        $scope.showAgeObj = $.jStorage.get("ageTitle");
        $scope.constraints.gender = $scope.selectService.gender;
        $scope.filterAge($scope.selectService.ageGroup, $scope.showAgeObj);
    }

    $scope.editTeamFun = function () {
        if ($.jStorage.get("teamId") !== null) {
            $scope.isEdit = true;
            $scope.teamIdObj = {};
            $scope.teamIdObj.teamid = $.jStorage.get("teamId");
            NavigationService.editTeam($scope.teamIdObj, function (data) {
                errorService.errorCode(data, function (allData) {
                    if (!allData.message) {
                        if (allData.value) {
                            $scope.editTeamData = allData.data[0];
                            NavigationService.editTeamId($scope.editTeamData._id);
                            $scope.editGender = $scope.editTeamData.sport.gender;
                            $scope.selectService.gender = $scope.editGender;
                            $scope.editAgeGrp = $scope.editTeamData.sport.ageGroup._id;
                            $scope.selectService.ageGroup = $scope.editAgeGrp;
                            $scope.showAgeObj = $scope.editTeamData.sport.ageGroup.name;
                            $scope.constraints.gender = $scope.selectService.gender;
                            if ($.jStorage.get("flag") === true) {
                                $scope.filterAge($scope.selectService.ageGroup, $scope.showAgeObj);
                            }
                            $scope.sportGet($scope.selectService.ageGroup);
                            $scope.editablestudentTeam = _.cloneDeep($scope.editTeamData.studentTeam);
                        }
                    } else {
                        toastr.error(allData.message, 'Error Message');
                    }
                });
            });
        }
    };
    $scope.editTeamFun();

});

myApp.controller('ConfirmTeamCtrl', function ($scope, TemplateService, NavigationService, $timeout, toastr, $state, $stateParams, loginService, selectService, $filter, errorService, configService) {
    $scope.template = TemplateService.getHTML("content/confirmteam.html");
    TemplateService.title = "Confirm Team"; //This is the Title of the Website
    $scope.navigation = NavigationService.getNavigation();
    configService.getDetail(function (data) {
        $scope.state = data.state;
        $scope.year = data.year;
        $scope.eventYear = data.eventYear;
        $scope.sfaCity = data.sfaCity;
        $scope.isCollege = data.isCollege;
        $scope.type = data.type;
    });
    $scope.teamMembers = selectService.team;
    $scope.selectService = selectService;
    $scope.isDisabledConfirm = false;
    // NavigationService.setSportTeamMembers($scope.teamMembers);
    $scope.formData = {};
    $scope.tempStrArr = [];
    $scope.confirmTeamObject = {};
    if ($.jStorage.get("editTeamId") !== null) {
        $scope.confirmTeamObject.teamid = $.jStorage.get("editTeamId");
    }
    $scope.isBoth = false;
    // $scope.isCap = false;
    // $scope.isGoal = false;
    // if ($scope.isCap === false &&
    //     $scope.isGoal === false) {
    //     $scope.isBoth = true;
    // }
    // $scope.setTeamIdNull = function () {
    //     $.jStorage.set("teamId", null);
    // };
    $scope.setVariable = function () {
        NavigationService.setVariable(true);
    };

    $scope.ageTitle = $.jStorage.get("ageTitle");
    $scope.gender = $.jStorage.get("gender");
    _.each($scope.teamMembers, function (n) {
        n.isCaptain = false;
        n.isGoalKeeper = false;
        n.studentId = n._id;
    });
    $scope.sportTitle = $.jStorage.get("sportTitle");
    if ($.jStorage.get("userDetails") === null) {
        $state.go('sports-registration');
    }
    loginService.loginGet(function (data) {
        $scope.detail = data;
        $scope.formData.schoolName = $scope.detail.schoolName;
    });
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

    if ($scope.sportTitle === 'Basketball' || $scope.sportTitle === 'basketball' || $scope.sportTitle === 'Football' || $scope.sportTitle === 'football' || $scope.sportTitle === 'Handball' || $scope.sportTitle === 'handball' || $scope.sportTitle === 'Hockey' || $scope.sportTitle === 'hockey' || $scope.sportTitle === 'Kabaddi' || $scope.sportTitle === 'kabaddi' || $scope.sportTitle === 'Kho Kho' || $scope.sportTitle === 'kho kho' || $scope.sportTitle === 'Throwball' || $scope.sportTitle === 'throwball' || $scope.sportTitle === 'Volleyball' || $scope.sportTitle === 'volleyball' || $scope.sportTitle === 'Water Polo' || $scope.sportTitle === 'water polo') {
        $scope.isCap = true;
        $scope.isBoth = false;
        $scope.isGoal = false;
    }
    if ($scope.sportTitle !== 'Basketball' && $scope.sportTitle !== 'basketball' && $scope.sportTitle !== 'Football' && $scope.sportTitle !== 'football' && $scope.sportTitle !== 'Handball' && $scope.sportTitle !== 'handball' && $scope.sportTitle !== 'Hockey' && $scope.sportTitle !== 'hockey' && $scope.sportTitle !== 'Kabaddi' && $scope.sportTitle !== 'kabaddi' && $scope.sportTitle !== 'Kho Kho' && $scope.sportTitle !== 'kho kho' && $scope.sportTitle !== 'Throwball' && $scope.sportTitle !== 'throwball' && $scope.sportTitle !== 'Volleyball' && $scope.sportTitle !== 'volleyball' && $scope.sportTitle !== 'Water Polo' && $scope.sportTitle !== 'water polo') {
        // console.log('enter', $scope.sportTitle);
        $scope.isBoth = true;
    }
    if ($scope.sportTitle === 'Handball' || $scope.sportTitle === 'handball' || $scope.sportTitle === 'Football' || $scope.sportTitle === 'football' || $scope.sportTitle === 'Hockey' || $scope.sportTitle === 'hockey' || $scope.sportTitle === 'Water Polo' || $scope.sportTitle === 'water polo ') {
        $scope.isGoal = true;
        $scope.isBoth = false;
    }

    var tempStr1 = $scope.detail.schoolName;
    $scope.gender = $filter('firstcapitalize')($scope.gender);
    $scope.tempStrArr.push(tempStr1, $scope.sportTitle, $scope.ageTitle, $scope.gender);
    $scope.confirmTeamObject.name = $scope.tempStrArr.join("-");
    $scope.confirmTeamObject.sport = $.jStorage.get("sportId");
    $scope.confirmTeamObject.school = $.jStorage.get("userDetails")._id;
    if ($.jStorage.get("userType") === "school") {
        $scope.confirmTeamObject.schoolToken = $.jStorage.get("userDetails").accessToken;
    } else {
        $scope.confirmTeamObject.athleteToken = $.jStorage.get("userDetails").accessToken;
    }
    $scope.isCaptainFun = function (index) {
        _.each($scope.teamMembers, function (key) {
            key.isCaptain = false;
        });
        $scope.teamMembers[index].isCaptain = true;
        $scope.teamMembers[index].isCap = 'Capt';
    };

    $scope.isGoalKeeperFun = function (index) {
        _.each($scope.teamMembers, function (key) {
            key.isGoalKeeper = false;
        });
        $scope.teamMembers[index].isGoalKeeper = true;
    };
    $scope.confirmTeamToGo = function (confirmTeamObject) {
        // console.log("confirmTeamObject", confirmTeamObject);
        $scope.isDisabledConfirm = true;
        NavigationService.teamConfirm(confirmTeamObject, function (data) {
            errorService.errorCode(data, function (allData) {
                if (!allData.message) {
                    if (allData.value) {
                        toastr.success("Successfully Confirmed", 'Success Message');
                        NavigationService.setSportId(null);
                        $state.go("team-congrats");
                    } else {
                        $scope.isDisabledConfirm = false;
                    }
                } else {
                    toastr.error(allData.message, 'Error Message');
                    $scope.isDisabledConfirm = false;
                }
            });
        });
    };
    $scope.finalConfirmTeam = function (sportTitle) {
        // console.log($scope.confirmTeamObject, "$scope.confirmTeamObject");
        $scope.yourPromise = NavigationService.success().then(function () {
            $scope.confirmTeamObject.athleteTeam = _.cloneDeep($scope.teamMembers);
            // console.log($scope.confirmTeamObject, "$scope.confirmTeamObject");
            var isCapObj = _.find($scope.teamMembers, function (key) {
                return key.isCaptain === true;
            });
            var isGoalKeeperObj = _.find($scope.teamMembers, function (key) {
                return key.isGoalKeeper === true;
            });

            if (sportTitle === 'Basketball' || sportTitle === 'basketball' || sportTitle === 'Football' || sportTitle === 'football' || sportTitle === 'Handball' || sportTitle === 'Hockey' || sportTitle === 'hockey' || sportTitle === 'Kabaddi' || sportTitle === 'kabaddi' || sportTitle === 'Kho Kho' || sportTitle === 'kho kho' || sportTitle === 'Throwball' || sportTitle === 'throwball' || sportTitle === 'Volleyball' || sportTitle === 'volleyball' || sportTitle === 'Water Polo' || sportTitle === 'water polo') {
                $scope.isCap = true;
                if (isCapObj === undefined) {
                    toastr.error("Please select Captain", 'Error Message');
                } else {
                    if (sportTitle === 'Handball' || sportTitle === 'handball' || sportTitle === 'Football' || sportTitle === 'football' || sportTitle === 'Hockey' || sportTitle === 'hockey' || sportTitle === 'Water Polo' || sportTitle === 'water polo ') {
                        if (isGoalKeeperObj === undefined) {
                            toastr.error("Please select GoalKeeper", 'Error Message');
                        } else {
                            $scope.confirmTeamObject.athleteTeam = _.cloneDeep($scope.teamMembers);
                            $scope.confirmTeamToGo($scope.confirmTeamObject);
                        }
                    } else {
                        $scope.confirmTeamObject.athleteTeam = _.cloneDeep($scope.teamMembers);
                        $scope.confirmTeamToGo($scope.confirmTeamObject);
                    }
                }
            } else {
                if (sportTitle === 'Handball' || sportTitle === 'handball' || sportTitle === 'Football' || sportTitle === 'football' || sportTitle === 'Hockey' || sportTitle === 'hockey' || sportTitle === 'Water Polo' || sportTitle === 'water polo ') {
                    if (isGoalKeeperObj === undefined) {
                        toastr.error("Please select GoalKeeper", 'Error Message');
                    } else {
                        $scope.confirmTeamObject.athleteTeam = _.cloneDeep($scope.teamMembers);
                        $scope.confirmTeamToGo($scope.confirmTeamObject);
                    }
                } else {
                    $scope.confirmTeamObject.athleteTeam = _.cloneDeep($scope.teamMembers);
                    $scope.confirmTeamToGo($scope.confirmTeamObject);
                }
            }

        });

    };




});

myApp.controller('TeamCongratsCtrl', function ($scope, TemplateService, toastr, NavigationService, $timeout, $state, $stateParams, loginService, errorService, configService) {
    $scope.template = TemplateService.getHTML("content/team-congrats.html");
    TemplateService.title = "Team Congrats"; //This is the Title of the Website
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
});