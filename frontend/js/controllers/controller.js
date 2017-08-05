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
            console.log("This is a button Click");
        };



    })

    .controller('FormCtrl', function ($scope, TemplateService, NavigationService, $timeout) {
        $scope.template = TemplateService.getHTML("content/form.html");
        TemplateService.title = "Form"; //This is the Title of the Website
        $scope.navigation = NavigationService.getNavigation();
        $scope.formSubmitted = false;
        $scope.submitForm = function (data) {
            console.log(data);
            $scope.formSubmitted = true;
        };
    })

    //Example API Controller
    .controller('DemoAPICtrl', function ($scope, TemplateService, apiService, NavigationService, $timeout) {
        apiService.getDemo($scope.formData, function (data) {
            console.log(data);
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
    }

    // if (window.location.host == 'mumbaischool.sfanow.in') {
    //     $scope.isCollege = false;
    // } else  if (window.location.host == 'mumbaicollege.sfanow.in') {
    //     $scope.isCollege = true;
    // }
    // NavigationService.getDetail(function (data) {
    //     errorService.errorCode(data, function (allData) {
    //         console.log(allData);
    //         if (!allData.message) {
    //             if (allData.value === true) {
    //                 $scope.city = allData.data.city;
    //                 $scope.district = allData.data.district;
    //                 $scope.state = allData.data.state;
    //                 $scope.year = allData.data.year;
    //                 $scope.sfaCity = allData.data.sfaCity;
    //                 if (allData.data.type == 'school') {
    //                     $scope.isCollege = false;
    //                     $scope.type = allData.data.type;
    //                     // $scope.registrationLink = globalLinkSchool;
    //                     // $scope.athleteLink = globalLinkSchoolAthlete;
    //                     // $scope.sportsRegistrationLink = globalLinkSchoolSportsRegistration;
    //                 } else {
    //                     $scope.isCollege = true;
    //                     $scope.type = allData.data.type;
    //                     // $scope.registrationLink = globalLinkCollege;
    //                     // $scope.athleteLink = globalLinkCollegeAthlete;
    //                     // $scope.sportsRegistrationLink = globalLinkCollegeSportsRegistration;
    //                 }
    //             }
    //         } else {
    //             toastr.error(allData.message, 'Error Message');
    //         }
    //     });
    // });
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
                console.log($scope.sports);
            }
        });
    };
    $scope.getSportList();

});

myApp.controller('ChampionshipCtrl', function ($scope, TemplateService, NavigationService, $timeout) {
    //Used to name the .html file
    $scope.template = TemplateService.getHTML("content/championship.html");
    TemplateService.title = "Championship"; //This is the Title of the Website
    $scope.navigation = NavigationService.getNavigation();
});