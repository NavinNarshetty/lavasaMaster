// Below Function is Used in ConfirmAthSwmCtrl and ConfirmFencingCtrl
var selectPicker = function (team, toastr, sT, sN, $filter, $scope, $uibModal, userDetails, userType) {
    var howMuchSelectPicker;
    var id;
    var flag = false;
    var openNow = false;
    switch (sT) {
        case "K":

            break;
        case "FA":
            if (sN == 'Fencing') {
                howMuchSelectPicker = 1;
                id = "#selectpicker_";
            } else if (sN == 'Archery') {
                howMuchSelectPicker = 2;
                id = "#selectpicker_";
            }
            break;
        case "AAS":
            if (sN == "Athletics" || sN == "Swimming") {
                howMuchSelectPicker = 1;
                id = "#selectpicker_";
            } else if (sN == "Shooting") {
                howMuchSelectPicker = 3;
                id = "#selectpicker_";
            }

            break;
        case "I":

            break;
        case "CT":
            break;
    }

    setTimeout(function () {
        for (i = 1; i <= howMuchSelectPicker; i++) {
            _.each(team, function (n, k) {
                var tp = id + i + "_" + k;

                var data_id = "." + tp.substring(1);
                console.log("data_id", data_id);

                $(data_id).find("[data-original-index]").click(function (e) {

                    setTimeout(function () {
                        console.log($(data_id).find(".selected").length);
                        //functionality to detect max Limit is reached and modal should get open when limit is exceeded
                        // e.g.: if (selectLimit=2) then open modal on third selection 
                        if (((team[k].packageCount - team[k].registeredSportCount) == $(data_id).find(".selected").length)) {
                            if (flag) {
                                openNow = true;
                            } else {
                                flag = true;
                            }
                        } else {
                            flag = false;
                            openNow = false;
                        }
                        //ends here

                        if ((team[k].packageCount - team[k].registeredSportCount) <= $(data_id).find(".selected").length) {
                            if ($.jStorage.get('userType') == "school") {
                                toastr.info("Sfa Id " + team[k].sfaId + " Can Only Participate In " + team[k].selectLimit + " Event. As per Selected Package", "Upgrade Package");
                            } else {
                                // SHOW UPGRADE POPUP
                                $scope.upgrade = {};
                                if (userType == 'athlete') {
                                    $scope.upgrade.userType = 'player';
                                } else {
                                    $scope.upgrade.userType = 'school';
                                }
                                $scope.upgrade.id = userDetails._id;
                                $scope.upgrade.package = userDetails.package;

                                // if(team[k].hasOnlyLimitOne){
                                //     if($(data_id).find(".selected").length>1){
                                //         $(e.currentTarget).removeClass('selected');
                                //         $(e.currentTarget).find("[aria-selected]").attr("aria-selected","false");
                                //         var nameArr = $(data_id+' ul li a[aria-selected=true]').find('span:first').map(function(e,k){return $(this).text()}).get();
                                //         var nameStr = nameArr.join(", ");
                                        
                                //         $(data_id+' button').find("span:first").text(nameStr);
                                //         team[k].sport.pop();
                                //         $uibModal.open({
                                //             animation: true,
                                //             scope: $scope,
                                //             templateUrl: 'views/modal/upgradepackage-modal.html',
                                //             windowClass: 'modal-upgradepackage'
                                //         });
                                //     }else{                                        
                                //         var nameArr = $(data_id+' ul li a[aria-selected=true]').find('span:first').map(function(e,k){return $(this).text()}).get();
                                //         var nameStr = nameArr.join(", ");
                                //         $(data_id+' button').find("span:first").text(nameStr);
                                //         console.log("nameStr",nameStr);
                                //     }
                                // }else{
                                    if (((sN == "Athletics" && team[k].selectLimit < 2) || sN != "Athletics") && openNow) {
                                        $uibModal.open({
                                            animation: true,
                                            scope: $scope,
                                            templateUrl: 'views/modal/upgradepackage-modal.html',
                                            windowClass: 'modal-upgradepackage'
                                        });
                                    }
                                // }
                            }
                        }
                        // else{
                        //     console.log("-------------");
                            
                        //         if(team[k].hasOnlyLimitOne){
                        //             team[k].sport=[];
                        //         }
                            
                        // }



                    }, 50);
                });

            });
        }

    }, 200);
}

myApp.controller('IndividualSelectionCtrl', function ($scope, TemplateService, errorService, $state, NavigationService, $stateParams, toastr, $timeout, loginService, selectService, configService) {
    $scope.template = TemplateService.getHTML("content/individual-selection.html");
    TemplateService.title = "Individual Selection";
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
    $.jStorage.set("sportsId", $stateParams.id);
    $scope.selectService.sportsId = $stateParams.id;
    $scope.ageGroup = [];
    $scope.listOfAthelete = [];
    $scope.selectAthlete = [];
    $scope.maleAgeGrp = [];
    $scope.femaleAgeGrp = [];
    $scope.getEvents = [];
    $scope.getAthletePerSchoolObj = {};
    $scope.getEventObj = {};
    $scope.getAthletePerSchoolObj.sfaid = '';
    $scope.getAthletePerSchoolObj.page = '1';
    $scope.getAthletePerSchoolObj.age = '';
    $scope.getAthletePerSchoolObj.gender = '';
    $scope.isLoading = true;
    $scope.busy = false;

    loginService.loginGet(function (data) {
        $scope.detail = data;
    });

    if ($.jStorage.get("schoolName") !== null) {
        $scope.getAthletePerSchoolObj.school = $.jStorage.get("schoolName");
    }
    if ($.jStorage.get("userType") === "school") {
        $scope.getAthletePerSchoolObj.schoolToken = $.jStorage.get("userDetails").accessToken;
    } else {
        $scope.getAthletePerSchoolObj.athleteToken = $.jStorage.get("userDetails").accessToken;
    }

    if ($stateParams.id) {
        $scope.getEventObj._id = $stateParams.id;
        $scope.getAthletePerSchoolObj._id = $stateParams.id;
        if ($scope.detail.userType === "athlete") {
            $scope.getEventObj.athleteToken = $scope.detail.accessToken;
        } else {
            $scope.getEventObj.schoolToken = $scope.detail.accessToken;
        }
    }

    NavigationService.getSportDetails({
        '_id': $stateParams.id
    }, function (data) {
        // console.log(data);
        $scope.basicSportDetails = data.data;
        $scope.selectService.sportName = data.data.sportName;
        $scope.selectService.sportType = data.data.sportType;
        $.jStorage.set("confirmPageKey", data.data.sportType);
    });

    var data = {};
    if ($.jStorage.get("userDetails") === null) {
        if ($.jStorage.get("userType") == "school") {
            data.type = "school";
        } else {
            data.type = "player";
        }
        $state.go('registerplayer', {
            type: data.type
        });
    } else {
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



    $scope.getAllAges = function () {
        NavigationService.getEvents($scope.getEventObj, function (data) {
            errorService.errorCode(data, function (allData) {
                if (!allData.message) {
                    $scope.getEvents = allData.data;
                    // $scope.sportTitle = allData.data.sportName;
                    // NavigationService.setSportTitle($scope.sportTitle);
                } else {
                    $scope.isDisabled = false;
                    toastr.error(allData.message, 'Error Message');
                }
            });
        });
    };

    $scope.getAllAges();

    $scope.sortGenderWise = function (gender) {
        $scope.getEvents = [];
        $scope.getAllAges();
        if (gender) {
            $scope.showAges = true;
            $scope.getAthletePerSchoolObj.gender = gender;
            NavigationService.setGender(gender);
        } else {
            $scope.showAges = false;
        }
    };



    $scope.getAllAthletes = function (getAthletePerSchoolObj) {
        if ($scope.busy) return;
        $scope.busy = true;
        NavigationService.getIndividualAthlete(getAthletePerSchoolObj, function (data) {
            errorService.errorCode(data, function (allData) {
                if (!allData.message) {
                    if (allData.value) {
                        $scope.isLoading = false;
                        if (allData.data.total >= getAthletePerSchoolObj.page) {
                            _.each(allData.data.data, function (value) {
                                value.fullNameWithsfaId = value.sfaId + " - " + value.firstName + " " + value.surname;
                                $scope.selectAthlete.push(value);
                                $scope.busy = false;
                            });

                            $scope.listOfAthelete = $scope.selectService.isAtheleteSelected($scope.selectAthlete);
                        }
                    }
                } else {
                    toastr.error(allData.message, 'Error Message');
                }
            });
        });
    };
    // Initial function call
    $scope.getAllAthletes($scope.getAthletePerSchoolObj);

    // *****search by sfaId*****
    $scope.searchaBysfaId = function (serach) {
        $scope.selectAthlete = [];
        $scope.listOfAthelete = [];
        $scope.busy = false;
        $scope.getAthletePerSchoolObj.page = '1';
        $scope.getAllAthletes($scope.getAthletePerSchoolObj);
    };
    // *****for loading more data *****

    $scope.loadMore = function () {
        $scope.getAthletePerSchoolObj.page++;
        // console.log("$scope.getAthletePerSchoolObj", $scope.getAthletePerSchoolObj);
        $scope.getAllAthletes($scope.getAthletePerSchoolObj);
    };
    //***** for getting age group *****
    $scope.filterAge = function (ageId) {
        $scope.getAthletePerSchoolObj.page = 1;
        $scope.selectAthlete = [];
        $scope.listOfAthelete = [];
        $scope.showAgeObj = '';
        $scope.busy = false;
        $scope.showAgeObj = ageId;
        NavigationService.setAgeTitle($scope.showAgeObj);
        $scope.getAthletePerSchoolObj.age = ageId;
        $scope.getAllAthletes($scope.getAthletePerSchoolObj);
        // console.log("$scope.getAthletePerSchoolObj", $scope.getAthletePerSchoolObj);
    };




});

//Confirm-Individual // Individual (I-confirm2)
myApp.controller('ConfirmIndividualCtrl', function ($scope, TemplateService, NavigationService, $timeout, $state, loginService, errorService, selectService, toastr, $stateParams, $filter, configService) {
    //Used to name the .html file
    $scope.sportTab = $filter('firstcapitalize')($stateParams.name);
    $scope.template = TemplateService.getHTML("content/confirmindividual.html");
    TemplateService.title = "Confirm" + ' ' + $scope.sportTab;
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
    $scope.redirectTo = $.jStorage.get("confirmPageKey");
    // console.log($scope.selectService.team);
    $scope.config = {
        'weightsReq': false,
        'varSet': false,
        'selectAgeExpression': ''
    };
    if (selectService.sportName === 'Judo' || selectService.sportName === 'judo' || selectService.sportName === 'Boxing' || selectService.sportName === 'boxing' || selectService.sportName === 'Taekwondo' || selectService.sportName === 'taekwondo' || selectService.sportName === 'Sport MMA' || selectService.sportName === 'sport MMA' || selectService.sportName === 'Wrestling' || selectService.sportName === 'wrestling') {
        $scope.withWeight = true;
    } else {
        $scope.withWeight = false;
    }

    function configureVariables() {
        if ($scope.selectService && $scope.selectService.sportName) {
            var st = $scope.selectService.sportName;
            if (st == 'Judo' || st == 'Boxing' || st == 'Taekwondo' || st == 'Sport MMA' || st == 'Wrestling') {
                $scope.config.weightsReq = true;
                $scope.config.ageVar = 'athelete.ageSelected';
                $scope.config.weightVar = 'athelete.sport';
                $scope.config.selectAgeExpression = "age._id for age in athelete.ageGroups | orderBy:'_id' track by age._id";
            } else {
                $scope.config.weightsReq = false;
                $scope.config.ageVar = 'athelete.sport';
                $scope.config.weightVar = '';
                $scope.config.selectAgeExpression = "age.data[0].sport as age._id for age in athelete.ageGroups | orderBy:'_id' track by age._id";
            }
        }
    }


    configureVariables();


    $scope.formData = {};
    loginService.loginGet(function (data) {
        $scope.detail = data;
        $scope.formData.schoolName = $scope.detail.schoolName;
    });

    var data = {};
    if ($.jStorage.get("userDetails") === null) {
        if ($.jStorage.get("userType") == "school") {
            data.type = "school";
        } else {
            data.type = "player";
        }
        $state.go('registerplayer', {
            type: data.type
        });
    } else {
        $scope.userDetails = $.jStorage.get("userDetails");
        $scope.hideChangePassword = true;
    }

    $scope.logoutCandidate = function () {
        loginService.logoutCandidate(function (data) {
            console.log("data", data);
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

    $scope.tp = function (data) {
        // console.log(data);
    };

    $scope.saveIt = function (team) {
        // console.log(team);
    };


});

//Confirm-Fencing // Fencing And Archery (FA-confirm3)
myApp.controller('ConfirmFencingCtrl', function ($scope, TemplateService, NavigationService, $timeout, $state, loginService, errorService, selectService, toastr, $stateParams, $filter, $uibModal, configService) {
    //Used to name the .html file
    $scope.sportTab = $filter('firstcapitalize')($stateParams.name);
    $scope.template = TemplateService.getHTML("content/confirmfencing.html");
    TemplateService.title = "Confirm" + ' ' + $scope.sportTab;
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
    $scope.formData = {};
    loginService.loginGet(function (data) {
        $scope.detail = data;
        $scope.formData.schoolName = $scope.detail.schoolName;
    });

    var data = {};
    if ($.jStorage.get("userDetails") === null) {
        if ($.jStorage.get("userType") == "school") {
            data.type = "school";
        } else {
            data.type = "player";
        }
        $state.go('registerplayer', {
            type: data.type
        });
    } else {
        $scope.userDetails = $.jStorage.get("userDetails");
        $scope.hideChangePassword = true;
    }

    $scope.config = {};

    function configureVariables() {
        if ($scope.selectService && $scope.selectService.sportName) {
            var st = $scope.selectService.sportName;
            if (st == 'Fencing') {
                // $scope.config.weightsReq = true;
                // $scope.config.event1Expression = "epee.data[0].sport as epee._id | formatEvent:'Epee' for epee in athelete.eventEpee | orderBy:'_id' track by epee._id";
                // $scope.config.event2Expression = "sabre.data[0].sport as sabre._id | formatEvent:'Sabre' for sabre in athelete.eventSabre | orderBy:'_id' track by sabre._id";
                // $scope.config.event3Expression = "foil.data[0].sport as foil._id | formatEvent:'Foil' for foil in athelete.eventFoil | orderBy:'_id' track by foil._id";
                $scope.config.event3Expression = "event.data[0].sport as event._id  for event in athelete.events"
            } else {
                // $scope.config.weightsReq = false;
                $scope.config.event1Expression = "event1 as event1._id | formatEvent:event1.eventName for event1 in athelete.allEvents";
                $scope.config.event2Expression = "event2 as event2._id | formatEvent:event2.eventName for event2 in athelete.optionalEvents";
            }
        }
    }

    configureVariables();

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

    $timeout(function () {
        $('.selectpicker').selectpicker()
        $('.bs-searchbox input[type="text"]').attr('placeholder', 'Search Event');
    }, 200);

    // $timeout(function () {
    //     $('.table-responsive').on('show.bs.dropdown', function () {
    //         $('.table-responsive').css( "overflow", "inherit" );
    //    });

    //    $('.table-responsive').on('hide.bs.dropdown', function () {
    //         $('.table-responsive').css( "overflow", "auto" );
    //    })
    // }, 200);

    $scope.selectEvent = function (ath, whichSelectTag, justClicked) {
        console.log("$scope.selectLimit",$scope.selectLimit);
        if ($scope.selectLimit == 1) {
            if (whichSelectTag == "Fen1" && (ath.fen1flag == false && ath.fen2flag == false)) {
                ath.fen1flag = true;
            } else if (whichSelectTag == "Fen2" && (ath.fen1flag == false && ath.fen2flag == false)) {
                ath.fen2flag = true;
            }
            if (ath.fen1flag && (whichSelectTag == "Fen1")) {
                console.log("1");
                ath.sport[1] = "";
            } else if (ath.fen2flag && (whichSelectTag == "Fen2")) {
                console.log("2");
                ath.sport[0] = "";
            } else if (ath.fen1flag && (whichSelectTag == "Fen2")) {
                console.log("3");
                ath.sport[1] = "";
                toastr.error("Max Reached", "Error Messege");
            } else if (ath.fen2flag && (whichSelectTag == "Fen1")) {
                console.log("4");
                if (justClicked.eventName == "Indian Bow") {
                    toastr.error("Only 1 Event Is Left As Per Your Package");
                    ath.sport[1] = "";
                } else {
                    ath.sport[0] = "";
                    toastr.error("Max Reached", "Error Messege");
                }

            }
            ath.disableEvent2 = true;
        }

    };

    var selectPickerClone = selectPicker(selectService.team, toastr, selectService.sportType, selectService.sportName, $filter, $scope, $uibModal, $.jStorage.get("userDetails"), $.jStorage.get("userType"));

    $('selectpicker').on('hidden.bs.select', function (e) {
        console.log("hidden", e);
    });

    $scope.isValidSelection = function (athelete, fen) {
        $scope.selectService.isValidSelection(athelete, fen, $scope);
    };

});

//Confirm-karate // Karate (K-confirm4)
myApp.controller('ConfirmKarateCtrl', function ($scope, TemplateService, NavigationService, $timeout, $state, loginService, errorService, selectService, toastr, $stateParams, $filter, configService) {
    //Used to name the .html file
    $scope.sportTab = $filter('firstcapitalize')($stateParams.name);
    $scope.template = TemplateService.getHTML("content/confirmkarate.html");
    TemplateService.title = "Confirm" + ' ' + $scope.sportTab;
    $scope.navigation = NavigationService.getNavigation();
    configService.getDetail(function (data) {
        $scope.state = data.state;
        $scope.year = data.year;
        $scope.eventYear = data.eventYear;
        $scope.sfaCity = data.sfaCity;
        $scope.isCollege = data.isCollege;
        $scope.type = data.type;
    });
    $scope.formData = {};
    $scope.selectService = selectService;
    loginService.loginGet(function (data) {
        $scope.detail = data;
        $scope.formData.schoolName = $scope.detail.schoolName;
    });

    var data = {};
    if ($.jStorage.get("userDetails") === null) {
        if ($.jStorage.get("userType") == "school") {
            data.type = "school";
        } else {
            data.type = "player";
        }
        $state.go('registerplayer', {
            type: data.type
        });
    } else {
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

    $scope.selectEvent = function (ath, whichSelectTag, justClicked) {
        console.log("$scope.selectLimit",$scope.selectLimit);
        if ($scope.selectLimit == 1) {
            if (whichSelectTag == "E1" && (ath.e1flag == false && ath.e2flag == false)) {
                ath.e1flag = true;
            } else if (whichSelectTag == "E2" && (ath.e1flag == false && ath.e2flag == false)) {
                ath.e2flag = true;
            }
            if (ath.e1flag && (whichSelectTag == "E1")) {
                console.log("1");
                ath.sport[1] = "";
            } else if (ath.e2flag && (whichSelectTag == "E2")) {
                console.log("2");
                ath.sport[0] = "";
            } else if (ath.e1flag && (whichSelectTag == "E2")) {
                console.log("3");
                ath.sport[1] = "";
                toastr.error("Max Reached", "Error Messege");
            } else if (ath.e2flag && (whichSelectTag == "E1")) {
                console.log("4");
                if (justClicked.eventName == "Indian Bow") {
                    toastr.error("Only 1 Event Is Left As Per Your Package");
                    ath.sport[1] = "";
                } else {
                    ath.sport[0] = "";
                    toastr.error("Max Reached", "Error Messege");
                }

            }
            ath.disableEvent2 = true;
        }

    };

    $scope.isValidSelection = function (athelete, E) {
        $scope.selectService.isValidSelection(athelete, E, $scope);
    };

});

//Confirm-athlete-swimming // Athletics Swimming And Shooting (AAS-confirm5)
myApp.controller('ConfirmAthSwmCtrl', function ($scope, TemplateService, NavigationService, loginService, $timeout, $state, selectService, toastr, $stateParams, $filter, configService, $uibModal, errorService) {
    //Used to name the .html file
    $scope.sportTab = $filter('firstcapitalize')($stateParams.name);
    $scope.template = TemplateService.getHTML("content/confirmathleteswim.html");
    TemplateService.title = "Confirm" + ' ' + $scope.sportTab;
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

    $scope.formData = {};
    loginService.loginGet(function (data) {
        $scope.detail = data;
        $scope.formData.schoolName = $scope.detail.schoolName;
    });

    var data = {};
    if ($.jStorage.get("userDetails") === null) {
        if ($.jStorage.get("userType") == "school") {
            data.type = "school";
        } else {
            data.type = "player";
        }
        $state.go('registerplayer', {
            type: data.type
        });
    } else {
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

    $scope.tp = function (team) {
        // console.log(team);
    };

    $scope.disableFunction = function (event, eventArr, index) {
        if (event === 'Pistol') {
            selectService.team[index].disablepeep = true;
            selectService.team[index].disableopen = true;
            selectService.team[index].disablepistol = false;
        } else if (event === 'Peep') {
            selectService.team[index].disablepeep = false;
            selectService.team[index].disableopen = true;
            selectService.team[index].disablepistol = true;
        } else if (event === 'Open') {
            selectService.team[index].disablepeep = true;
            selectService.team[index].disableopen = false;
            selectService.team[index].disablepistol = true;
        }
        if (eventArr.length === 0) {
            selectService.team[index].disablepeep = false;
            selectService.team[index].disableopen = false;
            selectService.team[index].disablepistol = false;
        }

    };
    // $timeout(function () {
    //     $('.selectpicker').selectpicker()
    //     $('.bs-searchbox input[type="text"]').attr('placeholder', 'Search Event');
    // }, 200);
    $scope.obj = {
        "qwerty": true
    }
    $scope.call = function (ath) {
        selectService.isValidSelection(ath);
        $timeout(function () {
            $('.selectpicker').selectpicker("refresh")
            $('.bs-searchbox input[type="text"]').attr('placeholder', 'Search Event');
        }, 200);
        var selectPickerClone = selectPicker(selectService.team, toastr, selectService.sportType, selectService.sportName, $filter, $scope, $uibModal, $.jStorage.get("userDetails"), $.jStorage.get("userType"));

    }
    $timeout(function () {
        $('.selectpicker').selectpicker("refresh")
        $('.bs-searchbox input[type="text"]').attr('placeholder', 'Search Event');
    }, 200);

    var selectPickerClone = selectPicker(selectService.team, toastr, selectService.sportType, selectService.sportName, $filter, $scope, $uibModal, $.jStorage.get("userDetails"), $.jStorage.get("userType"));
});

myApp.controller('IndividualCongratsCtrl', function ($scope, TemplateService, toastr, NavigationService, $timeout, $state, $stateParams, loginService, errorService, configService) {
    $scope.template = TemplateService.getHTML("content/individual-congrats.html");
    TemplateService.title = "Confirm" + ' ' + $scope.sportTab;
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

    var data = {};
    if ($.jStorage.get("userDetails") === null) {
        if ($.jStorage.get("userType") == "school") {
            data.type = "school";
        } else {
            data.type = "player";
        }
        $state.go('registerplayer', {
            type: data.type
        });
    } else {
        $timeout(function () {
            if ($.jStorage.get("userDetails")) {
                $scope.userDetails = $.jStorage.get("userDetails");
                $scope.hideChangePassword = true;
            }
        }, 500);
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

});