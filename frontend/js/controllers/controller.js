// var year15 = '2015-16';
// var year16 = '2016-17';
// // var year15 = '2015';
// // var year16 = '2016';
myApp.controller('HomeCtrl', function ($scope, TemplateService, NavigationService, $timeout) {
        $scope.template = TemplateService.getHTML("content/home.html");
        TemplateService.title = "Home"; //This is the Title of the Website
        $scope.navigation = NavigationService.getNavigation();

        $scope.mySlides = [
            'http://flexslider.woothemes.com/images/kitchen_adventurer_cheesecake_brownie.jpg',
            'http://flexslider.woothemes.com/images/kitchen_adventurer_lemon.jpg',
            'http://flexslider.woothemes.com/images/kitchen_adventurer_donut.jpg',
            'http://flexslider.woothemes.com/images/kitchen_adventurer_caramel.jpg'
        ];
        var abc = _.times(100, function (n) {
            return n;
        });

        var i = 0;
        $scope.buttonClick = function () {
            i++;
            // console.log("This is a button Click");
        };



    })

    .controller('FormCtrl', function ($scope, TemplateService, NavigationService, $timeout) {
        $scope.template = TemplateService.getHTML("content/form.html");
        TemplateService.title = "Form"; //This is the Title of the Website
        $scope.navigation = NavigationService.getNavigation();
        $scope.formSubmitted = false;
        $scope.submitForm = function (data) {
            // console.log(data);
            $scope.formSubmitted = true;
        };
    })

    //Example API Controller
    .controller('DemoAPICtrl', function ($scope, TemplateService, apiService, NavigationService, $timeout) {
        apiService.getDemo($scope.formData, function (data) {
            // console.log(data);
        });
    })

;

myApp.controller('VenueCtrl', function ($scope, TemplateService, NavigationService, $timeout) {
    //Used to name the .html file
    $scope.template = TemplateService.getHTML("content/venue.html");
    TemplateService.title = "Venue"; //This is the Title of the Website
    $scope.navigation = NavigationService.getNavigation();
});

myApp.controller('FaqCtrl', function ($scope, TemplateService, NavigationService, $timeout, errorService, toastr) {
    //Used to name the .html file
    $scope.template = TemplateService.getHTML("content/faq.html");
    TemplateService.title = "FAQ"; //This is the Title of the Website
    $scope.navigation = NavigationService.getNavigation();

    $scope.oneAtATime = true;
    $scope.status = {
        isCustomHeaderOpen: false,
        isFirstOpen: true,
        isFirstDisabled: false
    };

    if (window.location.host == 'testmumbaischool.sfanow.in') {
        $scope.isCollege = false;
    } else if (window.location.host == 'testmumbaicollege.sfanow.in') {
        $scope.isCollege = true;
    } else if (window.location.host == "testhyderabadschool.sfanow.in") {
        $scope.isCollege = false;
    } else if (window.location.host == "testhyderabadcollege.sfanow.in") {
        $scope.isCollege = true;
    } else if (window.location.host == "testahmedabadschool.sfanow.in") {
        $scope.isCollege = false;
    } else if (window.location.host == "testahmedabadcollege.sfanow.in") {
        $scope.isCollege = true;
    } else if (window.location.host == "mumbaischool.sfanow.in") {
        $scope.isCollege = false;
    } else if (window.location.host == "mumbaicollege.sfanow.in") {
        $scope.isCollege = true;
    } else if (window.location.host == "hyderabadschool.sfanow.in") {
        $scope.isCollege = false;
    } else if (window.location.host == "hyderabadcollege.sfanow.in") {
        $scope.isCollege = true;
    } else if (window.location.host == "ahmedabadschool.sfanow.in") {
        $scope.isCollege = false;
    } else if (window.location.host == "ahmedabadcollege.sfanow.in") {
        $scope.isCollege = true;
    }

    NavigationService.getAllFaqs(function (data) {
        errorService.errorCode(data, function (allData) {
            if (!allData.message) {
                if (allData.value) {
                    // console.log(allData.data.results, "allData");
                    $scope.allFaqs = allData.data.results;

                } else {
                    //    
                }
            } else {
                toastr.error(allData.message, 'Error Message');
            }
        });
    });
});


myApp.controller('TermsConditionCtrl', function ($scope, TemplateService, NavigationService, $timeout) {
    //Used to name the .html file
    $scope.template = TemplateService.getHTML("content/terms-condition.html");
    TemplateService.title = "Terms & Condition"; //This is the Title of the Website
    $scope.navigation = NavigationService.getNavigation();
});

myApp.controller('ChampionsCtrl', function ($scope, TemplateService, NavigationService, $timeout, $state) {
    //Used to name the .html file
    $scope.template = TemplateService.getHTML("content/champions.html");
    TemplateService.title = "Champions"; //This is the Title of the Website
    $scope.navigation = NavigationService.getNavigation();
    $scope.oneAtATime = true;
    $scope.sportName = ['Badminton', 'Tennis', 'Table Tennis', 'Volleyball', 'Handball', 'Squash', 'Basketball', 'Swimming', 'Judo'];
    $scope.filter = {};
    $scope.filter.year = "2016";
    $scope.winners = [];
    $scope.statuses = {};
    $scope.statuses.open = {};
    $scope.statuses.doubleBronze = false;
    $scope.profiles = function (participantType, studentid, teamid) {
        if (participantType == 'player') {
            $state.go('student-profile', {
                id: studentid
            });
        } else {
            sfastate = 'team-detail';
            $state.go(sfastate, {
                id: teamid
            });
        }

    };
    $scope.getWinners = function (sportid) {
        var constraints = {};
        constraints.sport = sportid;
        _.each($scope.statuses.open, function (value, key) {
            $scope.statuses.open[key] = false;
        });
        constraints.year = $scope.filter.year;
        $scope.statuses.doubleBronze = false;
        $scope.winners = undefined;
        NavigationService.getWinners(constraints, function (response) {
            if (response.value) {
                $scope.winners = response.data;
                _.each($scope.winners, function (key) {
                    if (key.Bronze.length > 1) {
                        $scope.statuses.doubleBronze = true;
                    }
                });
            } else {
                $scope.winners = [];
            }
        });
    };
    $scope.getSportList = function () {
        $scope.sports = undefined;
        NavigationService.getAllSportList(function (response) {
            if (response.value) {
                if ($scope.filter.year == '2015') {
                    _.remove(response.data, function (key) {
                        return !_.includes($scope.sportName, key.name);
                    });
                }
                $scope.sports = _.chain(response.data)
                    .groupBy("sporttype")
                    .toPairs()
                    .map(function (currentItem) {
                        return _.zipObject(["sporttype", "name"], currentItem);
                    })
                    .value();
                // console.log($scope.sports);
            }
        });
    };
    $scope.getSportList();

});

myApp.controller('ChampionshipCtrl', function ($scope, TemplateService, NavigationService, $timeout, configService, $uibModal) {
    //Used to name the .html file
    $scope.template = TemplateService.getHTML("content/championship.html");
    TemplateService.title = "Championship"; //This is the Title of the Website
    $scope.navigation = NavigationService.getNavigation();
    // $scope.year15 = year15;
    // $scope.year16 = year16;
    configService.getDetail(function (data) {
        $scope.state = data.state;
        $scope.year = data.year;
        $scope.eventYear = data.eventYear;
        $scope.sfaCity = data.sfaCity;
        $scope.isCollege = data.isCollege;
        $scope.type = data.type;
    });

    $scope.sfaFund = function () {
        $scope.sfafundModal = $uibModal.open({
            animation: true,
            scope: $scope,
            backdrop: 'static',
            keyboard: false,
            size: 'lg',
            templateUrl: "views/modal/sfafund.html"
        });
    }
});