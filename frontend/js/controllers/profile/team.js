myApp.controller('TeamCtrl', function ($scope, TemplateService, NavigationService, $timeout) {
    //Used to name the .html file
    $scope.template = TemplateService.getHTML("content/team.html");
    TemplateService.title = "Team"; //This is the Title of the Website
    $scope.navigation = NavigationService.getNavigation();
    $scope.oneAtATime = true;
    $scope.inputs = {};
    $scope.status = {
        isCustomHeaderOpen: false,
        isFirstOpen: true,
        isFirstDisabled: false
    };
    $scope.setPage = function (pageNo) {
        $scope.currentPage = pageNo;
    };

    $scope.maxSize = 20;

    NavigationService.countTeam(function (data) {
        $scope.count = data.data;
    });
    $scope.getsearch = false;
    $scope.searchFilter = {};
    $scope.searchFilter.pagenumber = 1;
    $scope.searchFilter.pagesize = 12;
    $scope.searchFilter.search = "";
    $scope.parseSearch = function (input) {
        $scope.searchFilter.pagenumber = 1;

        if (input === '' || input === null) {
            $scope.searchFilter.search = undefined;
            $scope.searchFilter.sfaid = undefined;
            $scope.getsearch = false;
        } else {
            $scope.getsearch = true;

            if (isNaN(input)) {
                $scope.searchFilter.search = input;
                $scope.searchFilter.sfaid = undefined;
            } else {
                $scope.searchFilter.search = undefined;
                $scope.searchFilter.sfaid = parseInt(input);
            }

        }
        $scope.doSearch();
    };
    var i = 0;
    $scope.doSearch = function () {
        NavigationService.getSearchDataTeam($scope.searchFilter, ++i, function (data, ini) {
            if (i == ini) {
                $scope.getSearchData = data.data;

            }
        });
    };

});

myApp.controller('TeamDetailCtrl', function ($scope, TemplateService, NavigationService, $stateParams, $timeout, $uibModal) {
    //Used to name the .html file
    $scope.template = TemplateService.getHTML("content/team-detail.html");
    TemplateService.title = "Team Detail"; //This is the Title of the Website
    $scope.navigation = NavigationService.getNavigation();
    $scope.filterStatistics = {};

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

    $scope.tab = 'squad';
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
            $scope.getStats();
        } else {

            $scope.classa = '';
            $scope.classb = '';
            $scope.classc = "active-list";
        }
    };

    $scope.student = [{
        icon: "img/sf-student-profile.png",
        name: "Harshit Shah",
        dep: "45211"
    }, {
        icon: "img/sf-student-profile.png",
        name: "Harshit Shah",
        dep: "45211"
    }, {
        icon: "img/sf-student-profile.png",
        name: "Harshit Shah",
        dep: "45211"
    }, {
        icon: "img/sf-student-profile.png",
        name: "Harshit Shah",
        dep: "45211"
    }, {
        icon: "img/sf-student-profile.png",
        name: "Harshit Shah",
        dep: "45211"
    }, {
        icon: "img/sf-student-profile.png",
        name: "Harshit Shah",
        dep: "45211"
    }, {
        icon: "img/sf-student-profile.png",
        name: "Harshit Shah",
        dep: "45211"
    }, {
        icon: "img/sf-student-profile.png",
        name: "Harshit Shah",
        dep: "45211"
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

    $scope.teamDetail = function () {
        NavigationService.getTeamDetail($stateParams.id, function (data) {
            console.log(data.data);
            if (data.value) {
                $scope.teamDetails = data.data;
                console.log($scope.teamDetails);
            } else {
                $scope.teamDetails = {};
                console.log("Error while fetching team details");
            }
        });
    };
    $scope.teamDetail();
    $scope.getStats = function () {
        $scope.filterStatistics.team = $stateParams.id;
        $scope.teamStats = undefined;
        NavigationService.getStatsForTeam($scope.filterStatistics, function (response) {
            if (response.value) {
                $scope.teamStats = response.data;
                console.log($scope.teamStats);
                var drawF = "";
                if ($scope.teamStats[0].drawFormat == 'Knockout') {
                    drawF = "knockout";
                } else if ($scope.teamStats[0].drawFormat == 'League cum Knockout') {
                    drawF = "leagueknockout"
                } else if ($scope.teamStats[0].drawFormat == 'Qualifying Knockout') {
                    drawF = "qualifyingknockout"
                }
                if ($scope.teamStats) {
                    if ($scope.teamStats[0].drawFormat == 'Knockout' || $scope.teamStats[0].drawFormat == 'League cum Knockout' || $scope.teamStats[0].drawFormat == 'Qualifying Knockout') {
                        _.each($scope.teamStats, function (key) {
                            key.opponent = {};
                            key.self = {};
                            if (key[drawF].participantType == 'player') {
                                if (key[drawF][key[drawF].participantType + '1']._id == $stateParams.id) {
                                    key.opponent.detail = key[drawF][key[drawF].participantType + '2'];
                                    key.self.detail = key[drawF][key[drawF].participantType + '1'];
                                    key.opponent.result = key[drawF]["result" + key[drawF].participantType + '2'];
                                    key.self.result = drawF == "knockout" ? key[drawF]["result" + key[drawF].participantType + '1'] : key[drawF]["result1"];
                                } else {
                                    key.opponent.detail = key[drawF][key[drawF].participantType + '1'];
                                    key.self.detail = key[drawF][key[drawF].participantType + '2'];
                                    key.opponent.result = key[drawF]["result" + key[drawF].participantType + '1'];
                                    key.self.result = drawF == "knockout" ? key[drawF]["result" + key[drawF].participantType + '2'] : key[drawF]["result2"];
                                }
                            } else {
                                if (key[drawF][key[drawF].participantType + '1']._id == $stateParams.id) {
                                    key.opponent.detail = key[drawF][key[drawF].participantType + '2'];
                                    key.self.detail = key[drawF][key[drawF].participantType + '1'];
                                    key.opponent.result = key[drawF]["result" + key[drawF].participantType + '2'];
                                    key.self.result = drawF == "knockout" ? key[drawF]["result" + key[drawF].participantType + '1'] : key[drawF]["result1"];
                                } else {
                                    key.opponent.detail = key[drawF][key[drawF].participantType + '1'];
                                    key.self.detail = key[drawF][key[drawF].participantType + '2'];
                                    key.opponent.result = key[drawF]["result" + key[drawF].participantType + '1'];
                                    key.self.result = drawF == "knockout" ? key[drawF]["result" + key[drawF].participantType + '2'] : key[drawF]["result2"];
                                }
                            }
                        });
                    } else if ($scope.teamStats[0].drawFormat == 'Heats') {
                        _.each($scope.teamStats, function (key) {
                            key.self = {};
                            _.each(key.heat.heats, function (single) {
                                var schoolid = single.team._id;
                                if (schoolid == $stateParams.id) {
                                    key.self = single;
                                }

                                // if (key.heat.participantType == "team") {
                                //     if (key.team._id == $stateParams.id) {
                                //         key.self = single;
                                //     }
                                // } else {
                                //     if (single.player._id == single.team._id) {
                                //         key.self = single;
                                //     }
                                // }
                            });
                        });
                    }
                }
            } else {
                $scope.teamStats = [];
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