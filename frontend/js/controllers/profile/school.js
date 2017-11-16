myApp.controller('SchoolCtrl', function ($scope, TemplateService, NavigationService, $timeout, configService) {
    //Used to name the .html file
    $scope.template = TemplateService.getHTML("content/school.html");
    TemplateService.title = "Schools"; //This is the Title of the Website
    $scope.navigation = NavigationService.getNavigation();
    configService.getDetail(function (data) {
        $scope.state = data.state;
        $scope.year = data.year;
        $scope.eventYear = data.eventYear;
        $scope.sfaCity = data.sfaCity;
        $scope.isCollege = data.isCollege;
        $scope.type = data.type;
    });
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
    $scope.search = {};
    $scope.search.active = false;
    $scope.filter = {};
    $scope.filterselected = {};
    $scope.school = {};
    $scope.pagination = {};
    $scope.pagination.pagesize = 20;
    $scope.filter.pagenumber = 1;
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
    $scope.getSchoolPerChoice = function (constraintsObj) {
        NavigationService.getSchoolPerChoice(constraintsObj, function (data) {
            console.log(data, "data");
            if (data.value) {
                $scope.topschools = data.data;
            }

        });

    }
    $scope.changeYear = function () {
        $scope.filterselected.title = "";

        if ($scope.filter.year == "top20" || !$scope.filter.year) {
            $scope.constraintsObj = {};
            $scope.constraintsObj.choice = 'top20';
            $scope.school.showAll = false;
            $scope.school.showTop20 = false;
            // $scope.submitSearch();
            $scope.filterselected.title = "SFA MUMBAI " + eventYear + " - Top 20 Schools";
            console.log("year16", year16);
            $scope.getSchoolPerChoice($scope.constraintsObj);
        } else {
            var constraints = {};
            constraints.choice = 'all';
            constraints.year = null;
            $scope.filterselected.title = "All Schools";
            // if ($scope.filter.year == '2015') {
            //     $scope.filterselected.title = "SFA MUMBAI " + year15;
            //     constraints.year = $scope.filter.year;
            // } else if ($scope.filter.year == '2016') {
            //     $scope.filterselected.title = "SFA MUMBAI " + year16;
            //     constraints.year = $scope.filter.year;
            // }
            $scope.allSchoolByYear(constraints);
            $scope.school.showAll = true;
            $scope.school.showTop20 = true;
        }
    };


    $scope.allSchoolByYear = function (constraints) {
        // NavigationService.getSchoolByYear(constraints, function (data) {
        //     if (data.value !== false) {
        //         $scope.allSchools = data.data.data;
        //         $scope.schoolSplit = Math.round($scope.allSchools.length / 2);
        //         $scope.schoolsData = _.chunk($scope.allSchools, $scope.schoolSplit);
        //     } else {
        //         $scope.allSchools = [];
        //         $scope.schoolsData = [];
        //     }
        // });
        NavigationService.getSchoolPerChoice(constraints, function (data) {
            console.log(data, "data");
            if (data.value === true) {
                $scope.allSchools = data.data;
                $scope.schoolSplit = Math.round($scope.allSchools.length / 2);
                $scope.schoolsData = _.chunk($scope.allSchools, $scope.schoolSplit);
            } else {
                $scope.allSchools = [];
                $scope.schoolsData = [];
            }
        });
    };
    $scope.filter.year = "top20";
    $scope.changeYear();
});

myApp.controller('SchoolProfileCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, $uibModal, configService) {
    //Used to name the .html file
    $scope.template = TemplateService.getHTML("content/school-profile.html");
    TemplateService.title = "School Profile"; //This is the Title of the Website
    $scope.navigation = NavigationService.getNavigation();
    var year = new Date();
    $scope.filter = {};
    $scope.schooldata = {};
    $scope.sportsStudentGender = {};
    $scope.dropdowns = {};
    $scope.dropdowns.category = [];
    $scope.filterStatistics = {};
    $scope.filterStatistics.school = $stateParams.id;
    $scope.filterStatistics.pagenumber = 1;
    $scope.filterStatistics.pagesize = 8;
    $scope.table = {};
    $scope.students = {};
    // $scope.state = $state;
    $scope.schoolData = {};
    $scope.schoolData.page = 1;
    $scope.schoolData.school = $stateParams.id;
    $scope.schoolData.maxSize = 8;
    // $scope.allYears = NavigationService.getAllYears();
    configService.getDetail(function (data) {
        $scope.state = data.state;
        $scope.year = data.year;
        $scope.eventYear = data.eventYear;
        $scope.sfaCity = data.sfaCity;
        $scope.isCollege = data.isCollege;
        $scope.type = data.type;
    });

    $scope.getSchoolProfiles = function () {
        $scope.schoolData.page = $scope.schoolData.page++;
        NavigationService.getSchoolProfileData($scope.schoolData, function (data) {
            if (data.value) {
                $scope.getSchoolProfile = data.data;
                $scope.athletes = data.data.athletes;
                $scope.schoolName = data.data.schoolName;
                // $scope.schoolSports = data.data.registerSport;
                var schoolSport = 0;
                var subArrLength = 0;

                //Count of male and female from sport array and image active and inactive placement in upperlayer of json.
                _.each($scope.getSchoolProfile.registerSport, function (n) {
                    n.subCategory = [];
                    if ((n.gender).length > 1) {
                        if (n.gender[0].name == 'male') {
                            if (n.gender[0].count) {
                                n.maleCount = n.gender[0].count;
                            } else {
                                n.maleCount = 0;
                            }
                        } else if (n.gender[0].name == 'female') {
                            if (n.gender[0].count) {
                                n.femaleCount = n.gender[0].count;
                            } else {
                                n.femaleCount = 0;
                            }
                        }
                        if (n.gender[1].name == 'male') {
                            if (n.gender[1].count) {
                                n.maleCount = n.gender[1].count;
                            } else {
                                n.maleCount = 0;
                            }
                        } else if (n.gender[1].name == 'female') {
                            if (n.gender[1].count) {
                                n.femaleCount = n.gender[1].count;
                            } else {
                                n.femaleCount = 0;
                            }
                        }
                    } else if ((n.gender).length == 1) {
                        if (n.gender[0].name == 'male') {
                            if (n.gender[0].count) {
                                n.maleCount = n.gender[0].count;
                            } else {
                                n.maleCount = 0;
                            }
                            n.femaleCount = 0;
                        } else if (n.gender[0].name == 'female') {
                            if (n.gender[0].count) {
                                n.femaleCount = n.gender[0].count;
                            } else {
                                n.femaleCount = 0;
                            }
                            n.maleCount = 0;
                        }
                    }
                    if (!_.isEmpty(n.gender[0].team)) {
                        n.inactiveimage = n.gender[0].team[0].inactiveimage;
                        n.image = n.gender[0].team[0].image;
                        if (n.inactiveimage === undefined) {
                            n.inactiveimage = '';
                        }
                        if (n.image === undefined) {
                            n.image = '';
                        }
                        n.subCategory.push(n.gender[0].team[0].sportsListSubCategoryId);
                    } else if (!_.isEmpty(n.gender[0].individual)) {
                        n.inactiveimage = n.gender[0].individual[0].inactiveimage;
                        n.image = n.gender[0].individual[0].image;
                        if (n.inactiveimage === undefined) {
                            n.inactiveimage = '';
                        }
                        if (n.image === undefined) {
                            n.image = '';
                        }
                        n.subCategory.push(n.gender[0].individual[0].sportsListSubCategoryId);
                    }
                    schoolSport = schoolSport + 1;
                });

                console.log('before', $scope.getSchoolProfile.registerSport);
                if (schoolSport == $scope.getSchoolProfile.registerSport.length) {
                    _.each($scope.getSchoolProfile.registerSport, function (n, key) {
                        var sportArr = [];
                        var sportName = [];
                        if (n.name == 'Kho Kho' || n.name == 'Water Polo' || n.name == 'Table Tennis' || n.name == 'Sport MMA') {
                            sportArr[0] = n.name;
                            sportName = sportArr;
                        } else {
                            sportName = _.split(n.name, " ");
                        }
                        if (n.name == 'Table Tennis Doubles') {
                            var bindName = sportName[0] + ' ' +
                                sportName[1];
                            $scope.sportObj = _.findIndex($scope.getSchoolProfile.registerSport, ['name', bindName]);
                        } else {
                            $scope.sportObj = _.findIndex($scope.getSchoolProfile.registerSport, ['name', sportName[0]]);
                        }
                        if ($scope.sportObj != key && $scope.sportObj != -1) {
                            console.log('before assign each to main',
                                n.name, n.maleCount);
                            console.log('before assign each to main',
                                n.name, n.femaleCount);
                            console.log('before assign to main', $scope.getSchoolProfile.registerSport[$scope.sportObj].maleCount);
                            console.log('before assign to main', $scope.getSchoolProfile.registerSport[$scope.sportObj].femaleCount);
                            $scope.getSchoolProfile.registerSport[$scope.sportObj].subCategory.push(n.subCategory[0]);
                            $scope.getSchoolProfile.registerSport[$scope.sportObj].maleCount = $scope.getSchoolProfile.registerSport[$scope.sportObj].maleCount + n.maleCount;
                            $scope.getSchoolProfile.registerSport[$scope.sportObj].femaleCount = $scope.getSchoolProfile.registerSport[$scope.sportObj].femaleCount + n.femaleCount;
                            console.log('after assign to main', $scope.getSchoolProfile.registerSport[$scope.sportObj].maleCount);
                            console.log('after assign to main', $scope.getSchoolProfile.registerSport[$scope.sportObj].femaleCount);
                            n.removeElement = true;
                        } else if ($scope.sportObj != key && $scope.sportObj == -1) {
                            if (n.name == 'Table Tennis Doubles') {
                                n.name = sportName[0] + ' ' +
                                    sportName[1];
                            } else {
                                n.name = sportName[0];
                            }
                        }
                        subArrLength = subArrLength + 1;
                    });
                    $scope.getSchoolProfile.registerSport = _.filter($scope.getSchoolProfile.registerSport, function (n) {
                        return !n.removeElement;
                    });
                }
                if (subArrLength >= $scope.getSchoolProfile.registerSport.length) {
                    console.log('Final', $scope.getSchoolProfile.registerSport);
                    $scope.schoolSports = $scope.getSchoolProfile.registerSport;
                }


                $scope.athletesCount = data.data.athletesCount;
                _.each($scope.athletesCount, function (n) {
                    if (n.name == 'male') {
                        $scope.maleCount = n.count;
                    } else if (n.name == 'female') {
                        $scope.femaleCount = n.count;
                    }
                });
                if ($scope.maleCount || $scope.femaleCount) {
                    if ($scope.femaleCount === undefined && $scope.maleCount === undefined) {
                        $scope.totalCount = 0;
                    } else if ($scope.femaleCount !== undefined && $scope.maleCount === undefined) {
                        $scope.totalCount = $scope.femaleCount;
                        $scope.maleCount = 0;
                    } else if ($scope.femaleCount === undefined && $scope.maleCount !== undefined) {
                        $scope.totalCount = $scope.maleCount;
                        $scope.femaleCount = 0;
                    } else {
                        $scope.totalCount = parseInt($scope.maleCount) + parseInt($scope.femaleCount);
                    }
                }
                $scope.medals = data.data.medalData;
                _.each($scope.medals, function (n) {
                    if (n.name == 'gold') {
                        $scope.goldCount = n.count;
                    } else if (n.name == 'silver') {
                        $scope.silverCount = n.count;
                    } else if (n.name == 'bronze') {
                        $scope.bronzeCount = n.count;
                    }
                });
            } else {
                {
                    $scope.getSchoolProfile = '';
                    $scope.schoolSports = '';
                    console.log("Error while fetching School Profile.");
                }
            }
        });
    };
    $scope.getSchoolProfiles();
    $scope.url = window.location.origin;
    $scope.getSpecialAward = function (schoolId) {
        $scope.constraints = {};
        $scope.constraints.school = schoolId;
        NavigationService.getAwardsCertificate($scope.constraints, function (data) {
            console.log(data);
            if (data.value) {
                _.each(data.data, function (key) {
                    window.open($scope.url + '/pdf/' + key.url, '_blank');
                });
            }
        });
    };
    // $scope.setPage = function (pageNo) {
    //     $scope.currentPage = pageNo;
    // };

    $scope.gender = [{
        value: "",
        name: "All"
    }, {
        value: "male",
        name: "Male"
    }, {
        value: "female",
        name: "Female"
    }];
    $scope.tabchange = function (tab, a) {
        $scope.tab = tab;
        if (a == 1) {
            $scope.classa = "active-list";
            $scope.classb = '';
            $scope.classc = '';
        } else if (a == 2) {
            $scope.classa = '';
            $scope.classb = "active-list";
            $scope.classc = "";

        } else {
            $scope.classa = '';
            $scope.classb = '';
            $scope.classc = "active-list";
        }
    };
    $scope.sportContingent = {};

    // $scope.onChangeContingentYear = function () {
    //     $scope.filterStatistics.pagenumber = 1;
    //     $scope.contingent = {};
    //     $scope.contingentStrengthByYear();
    // };
    // $scope.contingentStrengthByYear = function () {
    //     $scope.contingent.data = undefined;

    //     //This was to fix the All being sent in year, if you dont understand this fix I am sorry.
    //     var constraints = {};
    //     constraints = _.cloneDeep($scope.filterStatistics);
    //     constraints.year = null;
    //     if ($scope.filterStatistics.year == '2015' || $scope.filterStatistics.year == '2016') {
    //         constraints.year = $scope.filterStatistics.year;
    //     }
    //     //end
    //     NavigationService.contingentStrengthByYear(constraints, function (response) {
    //         if (response.value) {
    //             $scope.contingent = response.data;
    //         } else {
    //             $scope.contingent.data = [];
    //         }
    //     });
    // };
    // $scope.changeYear = function () {
    //     $scope.schooldata.Boys = 0;
    //     $scope.schooldata.Girls = 0;
    //     $scope.filter.sport = undefined;
    //     $scope.filterStatistics.sport = undefined;
    //     var constraints = {};
    //     constraints.year = $scope.filter.year;
    //     constraints._id = $stateParams.id;
    //     constraints.school = $stateParams.id;
    //     $scope.getSportParticipated(constraints);
    //     $scope.schoolMedalCount(constraints);
    //     $scope.filterStatistics.year = $scope.filter.year;
    //     $scope.contingentStrengthByYear();
    //     $scope.filterStatistics.pagenumber = 1;

    // };
    $scope.getSportAgeGroup = function () {
        NavigationService.getAgeGroupsAndEvents({
            name: $scope.filter.sport.name
        }, function (response) {
            console.log(response);
            if (response.value) {
                $scope.agegroup = response.data.ageGroups;
            } else {
                $scope.agegroup = [];
            }
        });
    };
    $scope.getSchoolStats = function () {
        $scope.filterStatistics.schoolName = $scope.schoolName;
        $scope.schoolStats = undefined;
        NavigationService.getSchoolStats($scope.filterStatistics, function (response) {
            //     console.log('STATS AND PLAYERS:', response);
            if (response.value) {
                $scope.schoolStats = response.data;
                console.log('initial', $scope.schoolStats.players.length);
                $scope.schoolStats.players = _.uniqBy($scope.schoolStats.players, 'sfaId');
                console.log($scope.schoolStats.players.length);
                _.each($scope.schoolStats.match, function (n) {

                    // console.log(n.score);
                    if (n.sportslist == 'High jump' || n.sportslist == 'high jump' || n.sportslist == 'high jump' || n.sportslist == 'High Jump') {
                        if (n.score.length === undefined) {
                            n.score = n.score;
                        } else {
                            var count = 0;
                            _.each(n.score, function (m) {
                                if (m !== '') {
                                    count++;
                                }
                                if (count === 0) {
                                    n.score = '-';
                                } else {
                                    n.score = count;
                                }
                            });
                        }
                    } else {
                        n.score = n.score;
                    }
                });
            } else {
                $scope.schoolStats = [];
            }
        });
    };
    $scope.getDrawFormats = function () {
        $scope.schoolStats = undefined;
        NavigationService.getDrawFormats($scope.filterStatistics, function (response) {
            // console.log('DRAW FORMATS:', response);
            if (response.value) {
                $scope.formats = response.data;
                if ($scope.formats[0].drawFormat.name == 'Qualifying Round' || $scope.formats[0].drawFormat.name == 'Heats') {
                    $scope.table.layout = 'Heats';
                } else {
                    $scope.table.layout = $scope.formats[0].drawFormat.name;
                }
            } else {
                $scope.schoolStats = [];
            }
        });
    };
    $scope.selectSport = function (selected) {
        // console.log(selected);
        $scope.filterStatistics = {};
        $scope.schoolStats = [];
        $scope.sportContingent.showContingent = true;
        $scope.statsDetail = selected;
        $scope.filter.sport = selected;
        $scope.filterStatistics.sportsListSubCategory = selected.subCategory;
        $scope.tabchange('player', 1);
        $scope.getSchoolStats();
        $scope.getDrawFormats();
        $scope.filterStatistics.age = '';
        $scope.filterStatistics.gender = '';
        $scope.getSportAgeGroup();
        // $scope.filter.sport = selected;
        // $scope.agegroup = [];
        // $scope.filterStatistics.year = _.clone($scope.filter.year);
        // $scope.callObject.year = _.clone($scope.filter.year);
        // $scope.getSportAgeGroup();
    };
    $scope.callReload = function (data, option) {
        if (option == 'gender') {
            $scope.filterStatistics.gender = data;
        }
        if (option == 'age') {
            $scope.filterStatistics.age = data;
        }
        if ($scope.filterStatistics.gender !== '' || $scope.filterStatistics.age !== '') {
            $scope.getSchoolStats();
        } else {
            $scope.getSchoolStats();
        }
    };
    // $scope.schoolMedalCount = function (constraints) {
    //     NavigationService.getSchoolMedalCount(constraints, function (data) {
    //         if (data.value) {
    //             $scope.schoolMedal = data.data;
    //         } else {
    //             $scope.schoolMedal = '';
    //             console.log("No School Medal data found");
    //         }
    //     });
    // };
    // NavigationService.getAllSchoolRank({
    //     year: "2016"
    // }, function (data) {
    //     var school = _.find(data, function (school) {
    //         return school._id == $stateParams.id;
    //     });
    //     $scope.schooldata.rank = school.rank;
    // });


    // $scope.getSportParticipated = function (constraints) {
    //     $scope.sportsStudentGender[constraints.year] = undefined;
    //     NavigationService.getSchoolSportByGender(constraints, function (data) {

    //         if (data.value) {
    //             $scope.sportsStudentGender[constraints.year] = data.data.sports;
    //             $scope.schooldata.gender = data.data.gender;
    //             // $scope.schooldata.rank = data.data.rank;
    //             _.each($scope.sportsStudentGender[constraints.year], function (key) {
    //                 _.each(key.gender, function (value) {
    //                     key[value.name] = value.count;
    //                 });
    //             });
    //         } else {
    //             $scope.sportsStudentGender[constraints.year] = [];
    //         }
    //     });
    // };
    // $scope.filter.year = "2016";
    // $scope.changeYear();
    // $scope.getSportAgeGroup = function () {
    //     NavigationService.filterAgegroupBySport({
    //         sportList: $scope.filter.sport._id
    //     }, function (response) {
    //         if (response.value) {
    //             $scope.agegroup = response.data;
    //         } else {
    //             $scope.agegroup = [];
    //         }
    //     });
    // };

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