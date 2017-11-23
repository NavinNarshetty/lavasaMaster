myApp.controller('StudentsCtrl', function ($scope, TemplateService, NavigationService, $timeout, configService) {
    //Used to name the .html file
    $scope.template = TemplateService.getHTML("content/students.html");
    TemplateService.title = "Athletes"; //This is the Title of the Website
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
        NavigationService.getSearchDataStudent($scope.searchFilter, function (data) {
            console.log('athlete', data);
            $scope.getSearchData = data.data.results;
            $scope.maxSize = data.data.options.count;
            $scope.totalItem = data.data.total;
        });
    };
});

myApp.controller('StudentProfileCtrl', function ($scope, $filter, TemplateService, NavigationService, $timeout, $stateParams, $state, $window, $uibModal, configService) {
    //Used to name the .html file
    // $scope.exportCertificate = function(data) {
    //     if (data) {
    //         console.log("data", data);
    //         window.open(adminUrl + 'Config/generatePdf' + data, '_blank');
    //         // window.close();
    //     }
    //
    // };


    // $scope.abc;

    // $scope.SPORTDATA = {};
    // $scope.medalData = {};
    // console.log("PARAMS", $state.params.id);
    // var student_id = {
    //     _id: $state.params.id
    // };
    // NavigationService.getMedal(student_id, function (data) {
    //     $scope.medalData = data;
    //     console.log("MEDAL DATA", data);
    // });

    // $scope.exportCertificate = function (studentProfile, sportName, medalName) {
    //     studentProfile.ageGroup = $filter('ageFilter')(studentProfile.dob);
    //     // studentProfile.dob = studentProfile.dobDemo;
    //     console.log('studentProfile.dob', studentProfile.dobDemo);
    //     console.log("LOg", studentProfile);
    //     var studentProfile = studentProfile;
    //     var sportname = sportName;
    //     var medal = medalName;
    //     var spname = [];
    //     _.forEach(sportName, function (name) {
    //         //    console.log("THE SPORTS NAME", name.name);
    //         spname.push(name.name);
    //     });
    //     var MAINDATA = [];
    //     _.each(medal, function (innermedal) {
    //         console.log("Medal", innermedal);
    //         _.forEach(innermedal, function (data) {
    //             console.log("INNER DATAA", data.year);

    //             if (data.year != "2015") {
    //                 if (data.medal === 1) {
    //                     data.medal = "Gold";
    //                 } else if (data.medal === 2) {
    //                     data.medal = "Silver";
    //                 } else if (data.medal === 3) {
    //                     data.medal = "Bronze";

    //                 }


    //                 console.log("INNER DATAA", data.medal);
    //                 console.log("SPNAME", data.sport.sportslist.name);
    //                 MAINDATA.medal = data.medal;
    //                 MAINDATA.sport = data.sport.sportslist.name;
    //                 MAINDATA.push({
    //                     "medal": data.medal,
    //                     "sport": data.sport.sportslist.name,
    //                     "isMedal": true
    //                 });
    //                 //          console.log("JSONNN", MAINDATA);
    //             }

    //         });
    //         console.log("JSON", MAINDATA);

    //     });

    //     studentProfile.sports = spname;
    //     studentProfile.medal = MAINDATA;
    //     $scope.OBJECT = studentProfile;




    //     console.log("sportname NEW OBJ", studentProfile);
    //     NavigationService.pdfGenerate(studentProfile, function (data) {
    //         console.log("PDF", data);
    //     });


    // };
    // console.log("Testing Consoles");

    $scope.template = TemplateService.getHTML("content/student-profile.html");
    TemplateService.title = "Athlete Profile"; //This is the Title of the Website
    $scope.navigation = NavigationService.getNavigation();
    configService.getDetail(function (data) {
        $scope.state = data.state;
        $scope.year = data.year;
        $scope.eventYear = data.eventYear;
        $scope.sfaCity = data.sfaCity;
        $scope.isCollege = data.isCollege;
        $scope.type = data.type;
    });
    $scope.studentProfile = {};
    $scope.tabs = 'photos';
    $scope.classp = 'active-list';
    $scope.classv = '';
    $scope.filter = {};
    $scope.filterStatistics = {};
    $scope.studentSportList = [];
    $scope.dropdowns = {};
    $scope.table = {};
    $scope.dropdowns.category = [];
    $scope.studentid = $stateParams.id;
    // $scope.drawDispatcher = function (drawFormat, id) {
    //     $state.go(NavigationService.resultDispatcher(drawFormat), {
    //         id: id
    //     });
    // };

    // $scope.OBJECT = {};

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

    $scope.tab = 'record';
    $scope.classa = 'active-list';
    $scope.classb = '';
    $scope.classc = '';

    $scope.tabchange = function (tab, a) {
        //        console.log(tab);
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
    $scope.getStudentProfile = function () {
        NavigationService.getStudentProfile($stateParams.id, function (data) {
            if (data.value) {
                console.log($scope.studentProfile);
                $scope.studentProfile = data.data;
                $scope.athlete = $scope.studentProfile.athlete;
                if ($scope.athlete) {
                    if ($scope.athlete.middleName) {
                        $scope.fullName = $scope.athlete.firstName + ' ' + $scope.athlete.middleName + ' ' + $scope.athlete.surname;
                    } else {
                        $scope.fullName = $scope.athlete.firstName + ' ' + $scope.athlete.surname;
                    }

                    if ($scope.athlete.atheleteSchoolName) {
                        $scope.schoolName = $scope.athlete.atheleteSchoolName;
                    } else {
                        $scope.schoolName = $scope.athlete.school.name;
                    }
                }


                if ($scope.studentProfile.sport.length > 0) {
                    $scope.certificate = true;
                } else {
                    $scope.certificate = false;
                }
                var arrLength = 0;
                var subArrLength = 0;

                _.each($scope.studentProfile.sport, function (n) {
                    n.subCategory = [];
                    n.subCategory.push(n.sportslist.sportsListSubCategory._id);
                    arrLength = arrLength + 1;
                });
                if (arrLength == $scope.studentProfile.sport.length) {
                    _.each($scope.studentProfile.sport, function (n, key) {
                        var sportArr = [];
                        var sportName = [];
                        if (n.sportslist.sportsListSubCategory.name == 'Kho Kho' || n.sportslist.sportsListSubCategory.name == 'Water Polo' || n.sportslist.sportsListSubCategory.name == 'Table Tennis' || n.sportslist.sportsListSubCategory.name == 'Sport MMA') {
                            sportArr[0] = n.sportslist.sportsListSubCategory.name;
                            sportName = sportArr;
                        } else {
                            sportName = _.split(n.sportslist.sportsListSubCategory.name, " ");
                        }
                        console.log(sportName);
                        if (n.sportslist.sportsListSubCategory.name == 'Table Tennis Doubles') {
                            var bindName = sportName[0] + ' ' +
                                sportName[1];
                            $scope.sportObj = _.findIndex($scope.studentProfile.sport, ['sportslist.sportsListSubCategory.name', bindName]);
                        } else {
                            $scope.sportObj = _.findIndex($scope.studentProfile.sport, ['sportslist.sportsListSubCategory.name', sportName[0]]);
                        }
                        if ($scope.sportObj != key && $scope.sportObj != -1) {
                            $scope.studentProfile.sport[$scope.sportObj].subCategory.push(n.sportslist.sportsListSubCategory._id);
                            n.removeElement = true;
                        } else if ($scope.sportObj != key && $scope.sportObj == -1) {
                            if (n.sportslist.sportsListSubCategory.name == 'Table Tennis Doubles') {
                                n.sportslist.sportsListSubCategory.name = sportName[0] + ' ' +
                                    sportName[1];
                            } else {
                                n.sportslist.sportsListSubCategory.name = sportName[0];
                            }
                        }
                        subArrLength = subArrLength + 1;
                    });
                    $scope.studentProfile.sport = _.filter($scope.studentProfile.sport, function (n) {
                        return !n.removeElement;
                    });
                }
                if (subArrLength >= $scope.studentProfile.sport.length) {
                    console.log(" $scope.studentProfile.sport", $scope.studentProfile.sport);
                    $scope.sport = $scope.studentProfile.sport;
                }

                $scope.specialAward = $scope.studentProfile.isSpecialAward;
                $scope.medals = $scope.studentProfile.medalData;
                _.each($scope.medals, function (n) {
                    console.log('n', n);
                    if (n.name == 'gold') {
                        $scope.goldCount = n.count;
                    } else if (n.name == 'silver') {
                        $scope.silverCount = n.count;
                    } else if (n.name == 'bronze') {
                        $scope.bronzeCount = n.count;
                    }
                });
            } else {
                $scope.studentProfile = [];
                console.log("Error while fetching Student Profile.");
            }
        });
    };
    $scope.getStudentProfile();

    $scope.url = window.location.origin;
    $scope.getCertificate = function (athleteId) {
        $scope.constraints = {};
        $scope.constraints._id = athleteId;
        NavigationService.getCertificate($scope.constraints, function (data) {
            console.log(data.data);
            window.open($scope.url + '/pdf/' + data.data, '_blank');
        });
    };
    $scope.getSpecialAward = function (athleteId) {
        $scope.constraints = {};
        $scope.constraints.athlete = athleteId;
        NavigationService.getAwardsCertificate($scope.constraints, function (data) {
            console.log(data);
            if (data.value) {
                _.each(data.data, function (key) {
                    window.open($scope.url + '/pdf/' + key.url, '_blank');
                    //   window.open(adminUrl2 + 'pdf' + data, '_blank');
                });
            }

        });
    };

    $scope.sportStats = function (data) {
        console.log('stats', data);
        $scope.table.layout = data.sportslist.drawFormat.name;
        $scope.constraints = {};
        $scope.constraints.athleteId = $scope.studentid;
        $scope.constraints.sportsListSubCategory = data.subCategory;
        NavigationService.getAthleteStats($scope.constraints, function (data) {
            console.log('stats inside', data);
            $scope.studentStats = data.data;

        });
    };
    // $scope.changeYear = function () {
    //     var constraints = {};
    //     constraints.year = $scope.filter.year;
    //     constraints.student = $stateParams.id;
    //     $scope.filterStatistics.sport = undefined;
    //     $scope.studentStats = [];
    //     $scope.getStudentSport(constraints);
    //     $scope.studentMedalCount(constraints);
    // };
    // $scope.getStudentSport = function (constraints) {
    //     //console.log("constraints : ",constraints);
    //     var i = 0;
    //     $scope.studentSport = undefined;
    //     NavigationService.getStudentSport(constraints, function (response) {
    //         if (response.value) {
    //             //   console.log(s"studentSport data = ",data);
    //             $scope.studentSport = response.data;
    //             $scope.SPORTDATA = response.data;
    //             console.log($scope.studentSport);
    //             _.each($scope.studentSport, function (key) {
    //                 key.active = false;
    //             });
    //         } else {
    //             $scope.studentSport = [];
    //             console.log("Error while fetching Student Sports.");
    //         }
    //     });
    // };

    // $scope.studentMedalCount = function (constraints) {
    //     NavigationService.getStudentMedalCount(constraints, function (data) {
    //         if (data.value) {
    //             $scope.studentMedal = data.data;
    //         } else {
    //             $scope.studentMedal = '';
    //             console.log("No Student Medal found");
    //         }
    //     });
    // };
    $scope.activateSports = function (sportid) {
        _.each($scope.sport, function (key) {
            if (key.sportslist.sportsListSubCategory._id == sportid) {
                key.active = true;
            } else {
                key.active = false;
            }
        });
    };
    $scope.nowSport = {};
    $scope.sportsSelected = function (sport, index) {
        console.log("$index", index);
        console.log(sport);
        $scope.nowSport = sport;
        $scope.activateSports(sport.sportslist.sportsListSubCategory._id);
        // $scope.participatedSports = _.groupBy(sport.sports, function (key) {
        //     return key.year;
        // });
        // $scope.filterStatistics.category = undefined;
        // $scope.filterStatistics.year = $scope.filter.year;
        // $scope.filterStatistics.sport = sport._id;
        $scope.filterStatistics.sport = sport;
        console.log("sport.sportslist.drawFormat.name", sport.sportslist.drawFormat.name);
        $scope.table.layout = sport.sportslist.drawFormat.name;
        // console.log(" $scope.table.layout", $scope.table.layout);
        // NavigationService.filterCategoryBySport({
        //     sportList: sport._id
        // }, function (response) {
        //     if (response.value) {
        //         console.log(response);
        //         $scope.dropdowns.category = response.data;
        //         $scope.dropdowns.category.unshift({
        //             name: ""
        //         });
        //         $scope.filterStatistics.category = $scope.dropdowns.category[0].name;
        //     } else {
        //         $scope.dropdowns.category = [];
        //     }
        //     // $scope.getStats();
        // });
        $scope.sportStats($scope.nowSport);
    };
    // $scope.getStats = function () {
    //     $scope.filterStatistics.student = $stateParams.id;
    //     $scope.studentStats = undefined;

    //     NavigationService.getStatsForStudent($scope.filterStatistics, function (response) {
    //         if (response.value) {
    //             $scope.studentStats = response.data;
    //             console.log($scope.studentStats);
    //             var drawf = "";
    //             if ($scope.studentStats[0].drawFormat == 'Knockout') {
    //                 drawf = "knockout";
    //             } else if ($scope.studentStats[0].drawFormat == "Swiss League") {
    //                 drawf = "swissleague"
    //             } else if ($scope.studentStats[0].drawFormat == "Qualifying Knockout") {
    //                 drawf = "qualifyingknockout"
    //             }
    //             if ($scope.studentStats) {
    //                 if ($scope.studentStats[0].drawFormat == 'Knockout' || $scope.studentStats[0].drawFormat == 'Swiss League') {
    //                     _.each($scope.studentStats, function (key) {
    //                         key.opponent = {};
    //                         //jagruti
    //                         key.self = {};
    //                         console.log("layout", key);
    //                         if (key[drawf].participantType == 'player') {
    //                             console.log("");
    //                             if (key[drawf][key[drawf].participantType + '1']._id == $stateParams.id) {
    //                                 console.log("here");
    //                                 key.opponent.detail = key[drawf][key[drawf].participantType + '2'];
    //                                 key.opponent.result = drawf == "knockout" ? key[drawf]["result" + key[drawf].participantType + '2'] : key[drawf]["result2"];
    //                                 key.self.result = drawf == "knockout" ? key[drawf]["result" + key[drawf].participantType + '1'] : key[drawf]["result1"];
    //                             } else {
    //                                 key.opponent.detail = key[drawf][key[drawf].participantType + '1'];
    //                                 key.opponent.result = drawf == "knockout" ? key[drawf]["result" + key[drawf].participantType + '1'] : key[drawf]["result1"];
    //                                 key.self.result = drawf == "knockout" ? key[drawf]["result" + key[drawf].participantType + '2'] : key[drawf]["result2"];
    //                             }
    //                         } else {
    //                             if (key[drawf][key[drawf].participantType + '1']._id == key.team._id) {
    //                                 key.opponent.detail = key[drawf][key[drawf].participantType + '2'];
    //                                 key.opponent.result = drawf == "knockout" ? key[drawf]["result" + key[drawf].participantType + '2'] : key[drawf]["result2"];
    //                                 key.self.result = drawf == "knockout" ? key[drawf]["result" + key[drawf].participantType + '1'] : key[drawf]["result1"];
    //                             } else {
    //                                 key.opponent.detail = key[drawf][key[drawf].participantType + '1'];
    //                                 key.opponent.result = drawf == "knockout" ? key[drawf]["result" + key[drawf].participantType + '1'] : key[drawf]["result1"];
    //                                 key.self.result = drawf == "knockout" ? key[drawf]["result" + key[drawf].participantType + '2'] : key[drawf]["result2"];
    //                             }
    //                         }
    //                     });
    //                     // console.log("opponent", $scope.studentStats);

    //                 } else if ($scope.studentStats[0].drawFormat == 'League') {
    //                     _.each($scope.studentStats, function (key) {
    //                         key.opponent = {};
    //                         key.self = {};
    //                         if (key.league.participantType == 'player') {
    //                             if (key.league[key.league.participantType + '1']._id == $stateParams.id) {
    //                                 key.opponent.detail = key.league[key.league.participantType + '2'];
    //                                 key.opponent.result = key.league.result2;
    //                                 key.self.result = key.league.result1;
    //                             } else {
    //                                 key.opponent.detail = key.league[key.league.participantType + '1'];
    //                                 key.opponent.result = key.league.result1;
    //                                 key.self.result = key.league.result2;
    //                             }
    //                         } else {
    //                             if (key.league[key.league.participantType + '1']._id == key.team._id) {
    //                                 key.opponent.detail = key.league[key.league.participantType + '2'];
    //                                 key.opponent.result = key.league.result2;
    //                                 key.self.result = key.league.result1;
    //                             } else {
    //                                 key.opponent.detail = key.league[key.league.participantType + '1'];
    //                                 key.opponent.result = key.league.result1;
    //                                 key.self.result = key.league.result2;
    //                             }
    //                         }
    //                     });
    //                 } else if ($scope.studentStats[0].drawFormat == 'Heats') {
    //                     _.each($scope.studentStats, function (key) {
    //                         key.self = {};
    //                         _.each(key.heat.heats, function (single) {
    //                             if (key.heat.participantType == "team") {
    //                                 if (key.team._id == single.team._id) {
    //                                     key.self = single;
    //                                 }
    //                             } else {
    //                                 if (single.player._id == $stateParams.id) {
    //                                     key.self = single;
    //                                 }
    //                             }
    //                         });
    //                     });
    //                 } else if ($scope.studentStats[0].drawFormat == 'League cum Knockout') {
    //                     _.each($scope.studentStats, function (key) {
    //                         key.opponent = {};
    //                         key.self = {};
    //                         console.log("layout", key);
    //                         if (key.leagueknockout.participantType == 'player') {
    //                             console.log("");
    //                             if (key.leagueknockout[key.leagueknockout.participantType + '1']._id == $stateParams.id) {
    //                                 console.log("here");
    //                                 key.opponent.detail = key.leagueknockout[key.leagueknockout.participantType + '2'];
    //                                 key.opponent.result = key.leagueknockout["result2"];
    //                                 key.self.result = key.leagueknockout["result1"];
    //                             } else {
    //                                 key.opponent.detail = key.leagueknockout[key.leagueknockout.participantType + '1'];
    //                                 key.opponent.result = key.leagueknockout["result1"];
    //                                 key.self.result = key.leagueknockout["result2"];
    //                             }
    //                         } else {
    //                             if (key.leagueknockout[key.leagueknockout.participantType + '1']._id == key.team._id) {
    //                                 key.opponent.detail = key.leagueknockout[key.leagueknockout.participantType + '2'];
    //                                 key.opponent.result = key.leagueknockout["result2"];
    //                                 key.self.result = key.leagueknockout["result1"];
    //                             } else {
    //                                 key.opponent.detail = key.leagueknockout[key.leagueknockout.participantType + '1'];
    //                                 key.opponent.result = key.leagueknockout["result1"];
    //                                 key.self.result = key.leagueknockout["result2"];
    //                             }
    //                         }
    //                     });
    //                 } else if ($scope.studentStats[0].drawFormat == 'Qualifying Knockout') {
    //                     _.each($scope.studentStats, function (key) {
    //                         key.opponent = {};
    //                         key.self = {};
    //                         if (key[drawf].heats.length == 0) {
    //                             if (key.qualifyingknockout.participantType == 'player') {
    //                                 console.log("");
    //                                 if (key.qualifyingknockout[key.qualifyingknockout.participantType + '1']._id == $stateParams.id) {
    //                                     console.log("here");
    //                                     key.opponent.detail = key.qualifyingknockout[key.qualifyingknockout.participantType + '2'];
    //                                     key.opponent.result = key.qualifyingknockout["result2"];
    //                                     key.self.result = key.qualifyingknockout["result1"];
    //                                 } else {
    //                                     key.opponent.detail = key.qualifyingknockout[key.qualifyingknockout.participantType + '1'];
    //                                     key.opponent.result = key.qualifyingknockout["result1"];
    //                                     key.self.result = key.qualifyingknockout["result2"];
    //                                 }
    //                             } else {
    //                                 if (key.qualifyingknockout[key.qualifyingknockout.participantType + '1']._id == key.team._id) {
    //                                     key.opponent.detail = key.qualifyingknockout[key.qualifyingknockout.participantType + '2'];
    //                                     key.opponent.result = key.qualifyingknockout["result2"];
    //                                     key.self.result = key.qualifyingknockout["result1"];
    //                                 } else {
    //                                     key.opponent.detail = key.qualifyingknockout[key.qualifyingknockout.participantType + '1'];
    //                                     key.opponent.result = key.qualifyingknockout["result1"];
    //                                     key.self.result = key.qualifyingknockout["result2"];
    //                                 }
    //                             }
    //                         } else {
    //                             _.each(key[drawf].heats, function (single) {
    //                                 if (key[drawf].participantType == "team") {
    //                                     if (key.team._id == single.team._id) {
    //                                         key.self = single;
    //                                     }
    //                                 } else {
    //                                     if (single.player._id == $stateParams.id) {
    //                                         key.self = single;
    //                                     }
    //                                 }
    //                             });
    //                         }
    //                     });
    //                 }
    //             }
    //             console.log($scope.studentStats);
    //         } else {
    //             $scope.studentStats = [];
    //         }
    //     });
    // };
    // $scope.makeActive = function(sports) {
    //     //console.log("sports : ",sports.sportslist);
    //     console.log(sports);
    // };

    $scope.filter.year = "2016";
    // $scope.changeYear();

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

myApp.controller('StudentBioCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state) {
    //Used to name the .html file

    console.log("Testing Consoles");

    $scope.template = TemplateService.getHTML("content/students-bio.html");
    TemplateService.title = "Athlete Biography"; //This is the Title of the Website
    $scope.navigation = NavigationService.getNavigation();
    $scope.studentProfile = {};
    $scope.filter = {};
    $scope.filter.year = '2016';
    $scope.tabs = 'photos';
    $scope.classp = 'active-list';
    $scope.classv = '';
    $scope.studentMedal = {};
    var constraints = {};




    $scope.getSport = function (sport) {
        console.log(sport);

        constraints.agegroup = sport.agegroup.name;
        if (sport.firstcategory) {
            constraints.category = sport.firstcategory.name;
        }
        constraints.sport = sport.sportslist._id;
        constraints.year = sport.year;
        NavigationService.getOneSportForResult(constraints, function (response) {
            $scope.doesNotHaveSport = response.value;
            if (response.value) {
                $state.go(NavigationService.resultDispatcher(response.data.drawFormat), {
                    id: response.data._id
                });
            }
        });
    };
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

    $scope.tab = 'record';
    $scope.classa = 'active-list';
    $scope.classb = '';
    $scope.classc = '';

    $scope.tabchange = function (tab, a) {
        //        console.log(tab);
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

    $scope.games = // JavaScript Document
        [{
            "icon": "img/sf-icon.png",
            "icon2": "img/sf-icon-big.png",
            "url": "tabletennis",
            "game": "table tennis"
        }, {
            "icon": "img/sf-icon.png",
            "icon2": "img/sf-icon-big.png",
            "url": "tennis",
            "game": "tennis"
        }, {
            "icon": "img/sf-icon.png",
            "icon2": "img/sf-icon-big.png",
            "url": "badminton",
            "game": "badminton"
        }];


    $scope.photos = [
        'img/m1.jpg',
        'img/m2.jpg',
        'img/m3.jpg',
        'img/m1.jpg',
        'img/m2.jpg',
        'img/m3.jpg'
    ];
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
    $scope.getStudentProfile = function () {
        NavigationService.getStudentProfile($stateParams.id, function (data) {
            if (data.value) {
                console.log(data);
                $scope.studentProfile = data.data;
                constraints.gender = data.data.gender;
                if ($scope.studentProfile.gender == "Boys") {
                    $scope.studentProfile.gender = "Male";
                } else {
                    $scope.studentProfile.gender = "Female";
                }
            } else {
                $scope.studentProfile = [];
                console.log("Error while fetching Student Profile.");
            }
        });
    };
    $scope.getStudentProfile();
    $scope.changeYear = function () {
        var constraints = {};
        constraints.year = $scope.filter.year;
        constraints.student = $stateParams.id;
        // $scope.filterStatistics.sport = undefined;
        // $scope.studentStats = [];
        $scope.getStudentSport(constraints);
        $scope.studentMedalCount(constraints);
    };

    $scope.studentMedalCount = function (constraints) {
        NavigationService.getStudentMedalCount(constraints, function (data) {
            if (data.value) {
                $scope.studentMedal[constraints.year] = data.data;
                console.log($scope.studentMedal);
            } else {
                $scope.studentMedal[constraints.year] = {};
                console.log("No Student Medal found");
            }
        });
    };
    // $scope.statuses.emptyobject = {};
    $scope.profiles = function (participantType, id) {
        if (participantType == 'player') {
            sfastate = 'student-profile';
        } else {
            sfastate = 'team-detail';
        }
        $state.go(sfastate, {
            _id: id
        });
    };
    $scope.getStudentSport = function (constraints) {
        //console.log("constraints : ",constraints);
        var i = 0;
        $scope.studentSport = {};
        NavigationService.getStudentSport(constraints, function (response) {
            if (response.value) {
                //   console.log("studentSport data = ",data);
                $scope.studentSport[constraints.year] = response.data;
                console.log($scope.studentSport);
                _.each($scope.studentSport[constraints.year], function (key) {
                    key.active = false;
                });
            } else {
                $scope.studentSport[constraints.year] = [];
            }
        });
    };
    $scope.changeYear();
});
