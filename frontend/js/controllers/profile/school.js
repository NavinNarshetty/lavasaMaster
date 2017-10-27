myApp.controller('SchoolCtrl', function ($scope, TemplateService, NavigationService, $timeout) {
    //Used to name the .html file
    $scope.template = TemplateService.getHTML("content/school.html");
    TemplateService.title = "Schools"; //This is the Title of the Website
    $scope.navigation = NavigationService.getNavigation();
    $scope.inputs = {};
    $scope.searchFilter = {};

    $scope.searchFilter.page = 1;
    $scope.searchFilter.type = '';
    $scope.searchFilter.keyword = '';
    $scope.$on('$stateChangeSuccess', function () {
        NavigationService.schoolSearch($scope.searchFilter, function (data) {
            $scope.total = data.data.total;
        });
    });

    $scope.searchInTable = function (data) {
        $scope.searchFilter.page = 1;
        if (data.length >= 2) {
            $scope.searchFilter.keyword = data;
        } else if (data.length === '') {
            $scope.searchFilter.keyword = data;
        }
        $scope.doSearch();
    };

    $scope.doSearch = function () {
        $scope.searchFilter.page = $scope.searchFilter.page++;
        NavigationService.schoolSearch($scope.searchFilter, function (data) {
            console.log('school', data);
            $scope.getSearchData = data.data.results;
            $scope.maxSize = data.data.options.count;
            $scope.totalItem = data.data.total;
        });
    };
    // $scope.search = {};
    // $scope.search.active = false;
    // $scope.filter = {};
    // $scope.filterselected = {};
    // $scope.school = {};
    // $scope.pagination = {};
    // $scope.pagination.pagesize = 20;
    // $scope.filter.pagenumber = 1;
    // $scope.setPage = function (pageNo) {
    //     $scope.currentPage = pageNo;
    // };

    // $scope.maxSize = 20;
    // $scope.parseSearch = function (input) {
    //     $scope.search.active = false;
    //     $scope.filter.pagenumber = 1;
    //     if (input === '' || input === null) {
    //         $scope.filter.name = undefined;
    //         $scope.filter.sfaid = undefined;
    //     } else {
    //         if (isNaN(input)) {
    //             $scope.filter.name = input;
    //             $scope.filter.sfaid = undefined;
    //         } else {
    //             $scope.filter.name = undefined;
    //             $scope.filter.sfaid = parseInt(input);
    //         }
    //         $scope.schools = [];
    //         $scope.pagination.total = 0;
    //         $scope.pagination.totalpages = 0;
    //         $scope.search.active = true;
    //     }
    //     $scope.submitSearch();
    // };
    // var i = 0;
    // $scope.submitSearch = function () {
    //     if ($scope.search.active) {
    //         NavigationService.schoolSearch($scope.filter, ++i, function (data, ini) {
    //             console.log(data);
    //             if (i == ini) {
    //                 if (data.value) {
    //                     $scope.schools = data.data.data;
    //                     console.log("Schools data", $scope.schools);
    //                     $scope.pagination.totalpages = data.data.totalpages;
    //                     $scope.pagination.total = data.data.total;
    //                 }
    //             }
    //         });
    //     } else {
    //         NavigationService.getFirstListSchool({
    //             year: "2016"
    //         }, function (data) {
    //             if (data.value !== false) {
    //                 $scope.topschools = data.data.data;
    //                 //console.log("top school",$scope.topschools);
    //                 $scope.count = data.data.count;
    //             } else {
    //                 $scope.getFirstList = [];
    //             }
    //         });
    //     }
    // };

    // $scope.changeYear = function () {
    //     $scope.filterselected.title = "";

    //     if ($scope.filter.year == "top20") {
    //         $scope.school.showAll = false;
    //         $scope.school.showTop20 = false;
    //         $scope.submitSearch();
    //         $scope.filterselected.title = "SFA MUMBAI " + year16 + " - Top 20 Schools";
    //     } else {
    //         var constraints = {};
    //         constraints.year = null;
    //         $scope.filterselected.title = "All Schools";
    //         if ($scope.filter.year == '2015') {
    //             $scope.filterselected.title = "SFA MUMBAI " + year15;
    //             constraints.year = $scope.filter.year;
    //         } else if ($scope.filter.year == '2016') {
    //             $scope.filterselected.title = "SFA MUMBAI " + year16;
    //             constraints.year = $scope.filter.year;
    //         }
    //         $scope.allSchoolByYear(constraints);
    //         $scope.school.showAll = true;
    //         $scope.school.showTop20 = true;
    //     }
    // };

    // $scope.allSchoolByYear = function (constraints) {
    //     NavigationService.getSchoolByYear(constraints, function (data) {
    //         if (data.value !== false) {
    //             $scope.allSchools = data.data.data;
    //             $scope.schoolSplit = Math.round($scope.allSchools.length / 2);
    //             $scope.schoolsData = _.chunk($scope.allSchools, $scope.schoolSplit);
    //         } else {
    //             $scope.allSchools = [];
    //             $scope.schoolsData = [];
    //         }
    //     });
    // };
    // $scope.filter.year = "top20";
    // $scope.changeYear();
});

myApp.controller('SchoolProfileCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, $uibModal) {
    //Used to name the .html file
    $scope.template = TemplateService.getHTML("content/school-profile.html");
    TemplateService.title = "School Profile"; //This is the Title of the Website
    $scope.navigation = NavigationService.getNavigation();
    $scope.callObject = {};
    var year = new Date();
    $scope.filter = {};
    $scope.callObject._id = $stateParams.id;
    $scope.callObject.year = year.getFullYear().toString();
    $scope.callObject.gender = "All";
    $scope.callObject.agegroup = "All";
    console.log($scope.callObject);
    $scope.schooldata = {};
    $scope.schooldata['Boys'] = 0;
    $scope.schooldata['Girls'] = 0;
    $scope.sportsStudentGender = {};
    $scope.dropdowns = {};
    $scope.dropdowns.category = [];
    $scope.filterStatistics = {};
    $scope.filterStatistics.pagenumber = 1;
    $scope.filterStatistics.pagesize = 8;
    $scope.filterStatistics.school = $stateParams.id;
    $scope.table = {};
    $scope.state = $state;
    $scope.students = {};
    $scope.allYears = NavigationService.getAllYears();

    $scope.setPage = function (pageNo) {
        $scope.currentPage = pageNo;
    };

    $scope.maxSize = 20;
    $scope.gender = [{
        value: "",
        name: "All"
    }, {
        value: "Boys",
        name: "Boys"
    }, {
        value: "Girls",
        name: "Girls"
    }];
    $scope.sportContingent = {};
    // $scope.schooldata.boys
    $scope.callReload = function () {
        if ($scope.filterStatistics.sport) {
            $scope.callObject.sport = $scope.filterStatistics.sport;
        }
        $scope.students.student = undefined;
        NavigationService.filterStud($scope.callObject, function (data) {
            console.log(data.data);
            if (data.value !== false) {
                $scope.students = data.data;
                if ($scope.students.student && $scope.students.student.length > 0 && $scope.students.school.contingentLeader && $scope.students.school.contingentLeader.length > 0) {
                    _.each($scope.students.student, function (z) {
                        _.each($scope.students.school.contingentLeader, function (n) {
                            if (n.student._id == z._id && n.year == $scope.callObject.year) {
                                z.isCl = true;
                            }
                        });
                    });
                }
            } else {
                $scope.students = {};
                $scope.students.student = [];
                $scope.students.school = {};
            }
        });
    };
    $scope.tabchange = function (tab, a) {
        $scope.tab = tab;
        if (a == 1) {
            $scope.classa = "active-list";
            $scope.classb = '';
            $scope.classc = '';
            $scope.callReload();

        } else if (a == 2) {
            $scope.classa = '';
            $scope.classb = "active-list";
            $scope.classc = "";

        } else {
            $scope.classa = '';
            $scope.classb = '';
            $scope.classc = "active-list";
            NavigationService.filterCategoryBySport({
                sportList: $scope.filterStatistics.sport
            }, function (response) {
                if (response.value) {
                    $scope.dropdowns.category = response.data;
                    $scope.dropdowns.category.unshift({
                        name: ""
                    });
                    $scope.filterStatistics.category = $scope.dropdowns.category[0].name;

                } else {
                    $scope.dropdowns.category = [];
                }
                NavigationService.filterAgegroupBySport({
                    sportList: $scope.filterStatistics.sport
                }, function (response) {
                    if (response.value) {
                        console.log(response);
                        $scope.dropdowns.agegroup = response.data;
                        $scope.dropdowns.agegroup.unshift({
                            name: ""
                        });
                        $scope.filterStatistics.agegroup = $scope.dropdowns.agegroup[0].name;
                    } else {
                        $scope.dropdowns.agegroup = [];
                    }
                    $scope.getStats();
                });
            });
        }
    };
    $scope.contingent = {};
    $scope.onChangeContingentYear = function () {
        $scope.filterStatistics.pagenumber = 1;
        $scope.contingent = {};
        $scope.contingentStrengthByYear();
    };
    $scope.contingentStrengthByYear = function () {
        $scope.contingent.data = undefined;

        //This was to fix the All being sent in year, if you dont understand this fix I am sorry.
        var constraints = {};
        constraints = _.cloneDeep($scope.filterStatistics);
        constraints.year = null;
        if ($scope.filterStatistics.year == '2015' || $scope.filterStatistics.year == '2016') {
            constraints.year = $scope.filterStatistics.year;
        }
        //end
        NavigationService.contingentStrengthByYear(constraints, function (response) {
            if (response.value) {
                $scope.contingent = response.data;
            } else {
                $scope.contingent.data = [];
            }
        });
    };
    $scope.video = [{
        icon: "img/m1.jpg",
        name: "girls | u-14 | semi final- Harshit shah VS Manav mehta"

    }, {
        icon: "img/m2.jpg",
        name: "girls | u-14 | semi final- Harshit shah VS Manav mehta"
    }, {
        icon: "img/m3.jpg",
        name: "girls | u-14 | semi final- Harshit shah VS Manav mehta"
    }, {
        icon: "img/m2.jpg",
        name: "girls | u-14 | semi final- Harshit shah VS Manav mehta"
    }, {
        icon: "img/m1.jpg",
        name: "girls | u-14 | semi final- Harshit shah VS Manav mehta"
    }, {
        icon: "img/m3.jpg",
        name: "girls | u-14 | semi final- Harshit shah VS Manav mehta"
    }];
    NavigationService.getSchoolProfile($stateParams.id, function (data) {
        if (data.value) {
            console.log("school data : ", data.data);
            $scope.getSchoolProfile = data.data;
            $scope.schoolSports = data.data.sports;
        } else {
            {
                $scope.getSchoolProfile = '';
                $scope.schoolSports = '';
                console.log("Error while fetching School Profile.");
            }
        }
    });
    $scope.changeYear = function () {
        $scope.schooldata.Boys = 0;
        $scope.schooldata.Girls = 0;
        $scope.filter.sport = undefined;
        $scope.filterStatistics.sport = undefined;
        var constraints = {};
        constraints.year = $scope.filter.year;
        constraints._id = $stateParams.id;
        constraints.school = $stateParams.id;
        $scope.getSportParticipated(constraints);
        $scope.schoolMedalCount(constraints);
        $scope.filterStatistics.year = $scope.filter.year;
        $scope.contingentStrengthByYear();
        $scope.filterStatistics.pagenumber = 1;

    };

    $scope.selectSport = function (selected) {
        $scope.filterStatistics = {};
        $scope.schoolStats = [];
        $scope.sportContingent.showContingent = true;
        $scope.filter.sport = selected;
        $scope.filterStatistics.sport = selected._id;
        $scope.table.layout = selected.drawFormat;
        $scope.tabchange('player', 1);
        $scope.agegroup = [];
        $scope.filterStatistics.year = _.clone($scope.filter.year);
        $scope.callObject.year = _.clone($scope.filter.year);
        $scope.getSportAgeGroup();
    };
    $scope.getStats = function () {
        $scope.filterStatistics.school = $stateParams.id;
        $scope.schoolStats = undefined;
        NavigationService.getStatsForSchool($scope.filterStatistics, function (response) {
            if (response.value) {
                $scope.schoolStats = response.data;
                // console.log($scope.schoolStats);
                var drawF = "";
                if ($scope.schoolStats[0].drawFormat == 'Knockout') {
                    drawF = "knockout";
                } else if ($scope.schoolStats[0].drawFormat == "Swiss League") {
                    drawF = "swissleague"
                } else {
                    drawF = "leagueknockout"
                }
                if ($scope.schoolStats) {
                    if ($scope.schoolStats[0].drawFormat == 'Knockout' || $scope.schoolStats[0].drawFormat == 'League cum Knockout' || $scope.schoolStats[0].drawFormat == 'Swiss League') {
                        _.each($scope.schoolStats, function (key) {
                            key.opponent = {};
                            key.self = {};
                            if (key[drawF].participantType == 'player') {
                                if (key[drawF][key[drawF].participantType + '1'] && key[drawF][key[drawF].participantType + '1'].school._id == $stateParams.id) {
                                    key.opponent.detail = key[drawF][key[drawF].participantType + '2'];
                                    key.self.detail = key[drawF][key[drawF].participantType + '1'];
                                    key.opponent.result = drawF == "knockout" ? key[drawF]["result" + key[drawF].participantType + '2'] : key[drawF]["result2"];
                                    key.self.result = drawF == "knockout" ? key[drawF]["result" + key[drawF].participantType + '1'] : key[drawF]["result1"];
                                } else {
                                    key.opponent.detail = key[drawF][key[drawF].participantType + '1'];
                                    key.self.detail = key[drawF][key[drawF].participantType + '2'];
                                    key.opponent.result = drawF == "knockout" ? key[drawF]["result" + key[drawF].participantType + '1'] : key[drawF]["result1"];
                                    key.self.result = drawF == "knockout" ? key[drawF]["result" + key[drawF].participantType + '2'] : key[drawF]["result2"];
                                }
                            } else {
                                if (key[drawF][key[drawF].participantType + '1'] && key[drawF][key[drawF].participantType + '1'].school._id == key.team.school._id) {
                                    key.opponent.detail = key[drawF][key[drawF].participantType + '2'];
                                    key.self.detail = key[drawF][key[drawF].participantType + '1'];
                                    key.opponent.result = drawF == "knockout" ? key[drawF]["result" + key[drawF].participantType + '2'] : key[drawF]["result2"];
                                    key.self.result = drawF == "knockout" ? key[drawF]["result" + key[drawF].participantType + '1'] : key[drawF]["result1"];
                                } else {
                                    key.opponent.detail = key[drawF][key[drawF].participantType + '1'];
                                    key.self.detail = key[drawF][key[drawF].participantType + '2'];
                                    key.opponent.result = drawF == "knockout" ? key[drawF]["result" + key[drawF].participantType + '1'] : key[drawF]["result1"];
                                    key.self.result = drawF == "knockout" ? key[drawF]["result" + key[drawF].participantType + '2'] : key[drawF]["result2"];
                                }
                            }

                        });

                    } else if ($scope.schoolStats[0].drawFormat == 'Heats') {
                        _.each($scope.schoolStats, function (key) {
                            key.self = {};
                            _.each(key.heat.heats, function (single) {
                                var schoolid = single.player ? single.player.school._id : single.team.school._id;
                                if (schoolid == $stateParams.id) {
                                    key.self = single;
                                }
                            });
                        });
                    } else if ($scope.schoolStats[0].drawFormat == 'Qualifying Knockout') {
                        _.each($scope.schoolStats, function (key) {
                            key.opponent = {};
                            key.self = {};
                            if (key.qualifyingknockout.heats.length == 0) {
                                if (key.qualifyingknockout.participantType == 'player') {
                                    console.log("");
                                    if (key.qualifyingknockout[key.qualifyingknockout.participantType + '1']._id == $stateParams.id) {
                                        console.log("here");
                                        key.opponent.detail = key.qualifyingknockout[key.qualifyingknockout.participantType + '2'];
                                        key.opponent.result = key.qualifyingknockout["result2"];
                                        key.self.result = key.qualifyingknockout["result1"];
                                    } else {
                                        key.opponent.detail = key.qualifyingknockout[key.qualifyingknockout.participantType + '1'];
                                        key.opponent.result = key.qualifyingknockout["result1"];
                                        key.self.result = key.qualifyingknockout["result2"];
                                    }
                                } else {
                                    if (key.qualifyingknockout[key.qualifyingknockout.participantType + '1']._id == key.team._id) {
                                        key.opponent.detail = key.qualifyingknockout[key.qualifyingknockout.participantType + '2'];
                                        key.opponent.result = key.qualifyingknockout["result2"];
                                        key.self.result = key.qualifyingknockout["result1"];
                                    } else {
                                        key.opponent.detail = key.qualifyingknockout[key.qualifyingknockout.participantType + '1'];
                                        key.opponent.result = key.qualifyingknockout["result1"];
                                        key.self.result = key.qualifyingknockout["result2"];
                                    }
                                }
                            } else {

                                _.each(key.qualifyingknockout.heats, function (single) {
                                    var schoolid = single.player ? single.player.school._id : single.team.school._id;
                                    if (schoolid == $stateParams.id) {
                                        key.self = single;
                                    }
                                });

                            }
                        });
                    }
                    console.log($scope.schoolStats);
                }
            } else {
                $scope.schoolStats = [];
            }
        });
    };
    $scope.schoolMedalCount = function (constraints) {
        NavigationService.getSchoolMedalCount(constraints, function (data) {
            if (data.value) {
                $scope.schoolMedal = data.data;
            } else {
                $scope.schoolMedal = '';
                console.log("No School Medal data found");
            }
        });
    };
    NavigationService.getAllSchoolRank({
        year: "2016"
    }, function (data) {
        var school = _.find(data, function (school) {
            return school._id == $stateParams.id;
        });
        $scope.schooldata.rank = school.rank;
    });


    $scope.getSportParticipated = function (constraints) {
        $scope.sportsStudentGender[constraints.year] = undefined;
        NavigationService.getSchoolSportByGender(constraints, function (data) {

            if (data.value) {
                $scope.sportsStudentGender[constraints.year] = data.data.sports;
                $scope.schooldata.gender = data.data.gender;
                // $scope.schooldata.rank = data.data.rank;
                _.each($scope.sportsStudentGender[constraints.year], function (key) {
                    _.each(key.gender, function (value) {
                        key[value.name] = value.count;
                    });
                });
            } else {
                $scope.sportsStudentGender[constraints.year] = [];
            }
        });
    };
    $scope.filter.year = "2016";
    $scope.changeYear();
    $scope.getSportAgeGroup = function () {
        NavigationService.filterAgegroupBySport({
            sportList: $scope.filter.sport._id
        }, function (response) {
            if (response.value) {
                $scope.agegroup = response.data;
            } else {
                $scope.agegroup = [];
            }
        });
    };

    $scope.videoNA = function () {
        var modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'views/modal/videoNA.html',
            size: 'sm',
            scope: $scope
        });
    };

    $scope.videoYTU = function () {
        var modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'views/modal/videoYTU.html',
            size: 'sm',
            scope: $scope
        });
    };

});

myApp.controller('SchoolBioCtrl', function ($scope, TemplateService, NavigationService, $timeout, $uibModal, $stateParams) {
    //Used to name the .html file


    $scope.template = TemplateService.getHTML("content/school-bio.html");
    TemplateService.title = "School Biography"; //This is the Title of the Website
    $scope.navigation = NavigationService.getNavigation();
    $scope.school = {};


    $scope.photos = [
        'img/m1.jpg',
        'img/m2.jpg',
        'img/m3.jpg',
        'img/m1.jpg',
        'img/m2.jpg',
        'img/m3.jpg'
    ];

    $scope.open = function (sports, size) {
        $scope.modalSports = sports;
        console.log($scope.modalSports);
        var modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'views/modal/sports.html',
            size: size,
            scope: $scope
        });
    };
    $scope.tabs = 'photos';
    $scope.classp = 'active-list';
    $scope.classv = '';


    $scope.tabchanges = function (tabs, a) {
        //        console.log(tab);
        $scope.tabs = tabs;
        if (a == 1) {

            $scope.classp = "active-list";
            $scope.classv = '';

        } else {

            $scope.classp = '';
            $scope.classv = "active-list";
        }
    };


    $scope.oneAtATime = true;

    $scope.tab = 'about';
    $scope.classa = 'active-list';
    $scope.classb = '';
    $scope.classc = '';
    $scope.classd = '';

    $scope.tabchange = function (tab, a) {
        //        console.log(tab);
        $scope.tab = tab;
        if (a == 1) {

            $scope.classa = "active-list";
            $scope.classb = '';
            $scope.classc = '';
            $scope.classd = '';
        } else if (a == 2) {

            $scope.classa = '';
            $scope.classb = "active-list";
            $scope.classc = "";
            $scope.classd = "";

        } else if (a == 3) {

            $scope.classa = '';
            $scope.classc = "active-list";
            $scope.classb = "";
            $scope.classd = "";
        } else {

            $scope.classa = '';
            $scope.classb = '';
            $scope.classd = "active-list";
            $scope.classc = "";
        }
    };
    $scope.video = [{
        icon: "img/m1.jpg",
        name: "girls | u-14 | semi final- Harshit shah VS Manav mehta"

    }, {
        icon: "img/m2.jpg",
        name: "girls | u-14 | semi final- Harshit shah VS Manav mehta"
    }, {
        icon: "img/m3.jpg",
        name: "girls | u-14 | semi final- Harshit shah VS Manav mehta"
    }, {
        icon: "img/m2.jpg",
        name: "girls | u-14 | semi final- Harshit shah VS Manav mehta"
    }, {
        icon: "img/m1.jpg",
        name: "girls | u-14 | semi final- Harshit shah VS Manav mehta"
    }, {
        icon: "img/m3.jpg",
        name: "girls | u-14 | semi final- Harshit shah VS Manav mehta"
    }];

    $scope.getSchoolProfile = function () {
        NavigationService.getOnePopulated($stateParams.id, function (data) {
            console.log(data.data);
            $scope.school = data.data.school;
            $scope.school.medal = data.data.medal;
            $scope.school.rank = data.data.rank;
            $scope.school.contingent = data.data.contingent;
            if ($scope.school.status) {
                $scope.school.isVerified = "Verified";
            } else {
                $scope.school.isVerified = "Not Verif ied";
            }
            $scope.school.contingentLeader = _.map($scope.school.contingentLeader).join(', ');
            $scope.department = $scope.school.department;

            // _.forEach($scope.department, function(value, key) {
            //     value = _.merge(value, {
            //         icon: "img/sf-student-profile.png"
            //     });
            // });
            $scope.school.sports = _.groupBy($scope.school.sports, function (key) {
                return key.year;
            });
            $scope.school.departmentSorted = _.groupBy($scope.school.department, function (key) {
                return key.year;
            });
            console.log($scope.school);
        });
    };
    $scope.getSchoolProfile();
});