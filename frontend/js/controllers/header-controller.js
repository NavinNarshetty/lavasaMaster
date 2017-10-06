// For Test
// var globalLinkSchoolRegister = "http://testmumbaischool.sfanow.in";
// var globalLinkCollegeRegister = "http://testmumbaicollege.sfanow.in";
// var globalLinkForAll = "http://testmumbai.sfanow.in/";
// var globalLinkSchoolRegister = "http://testhyderabadschool.sfanow.in";
// var globalLinkCollegeRegister = "http://testhyderabadcollege.sfanow.in";
// var globalLinkForAll = "http://testhyderabad.sfanow.in/";
// var globalLinkSchoolRegister = "http://testahmedabadschool.sfanow.in";
// var globalLinkCollegeRegister = "http://testahmedabadcollege.sfanow.in";
// var globalLinkForAll = "http://testahmedabad.sfanow.in/";
var year15 = '2015-16';
var year16 = '2016-17';
var eventYear = '2017-18';

//For Live
var globalLinkSchoolRegister = "http://mumbaischool.sfanow.in";
var globalLinkCollegeRegister = "http://mumbaicollege.sfanow.in";
var globalLinkForAll = "https://mumbai.sfanow.in/";
// var globalLinkSchoolRegister = "http://hyderabadschool.sfanow.in";
// var globalLinkCollegeRegister = "http://hyderabadcollege.sfanow.in";
// var globalLinkForAll = "https://hyderabad.sfanow.in/";
// var year15 = '2015';
// var year16 = '2016';
// var eventYear = '2017';

myApp.controller('headerCtrl', function ($scope, TemplateService, $rootScope, NavigationService, errorService, toastr) {
    $scope.template = TemplateService;
    $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
        $(window).scrollTop(0);
    });
    $.fancybox.close(true);
    $scope.variables = {};
    $scope.$watch('online', function (newStatus) {
        $scope.variables.online = $rootScope.online;
    });

    $rootScope.year15 = year15;
    $rootScope.year16 = year16;
    if (globalLinkForAll == 'https://mumbai.sfanow.in/') {
        $scope.selectedCity = 'mumbai';
    } else if (globalLinkForAll == 'https://hyderabad.sfanow.in/') {
        $scope.selectedCity = 'hyderabad';
    } else if (globalLinkForAll == 'https://ahmedabad.sfanow.in/') {
        $scope.selectedCity = 'ahmedabad';
    } else if (globalLinkForAll == 'http://testmumbai.sfanow.in/') {
        $scope.selectedCity = 'mumbai';
    } else if (globalLinkForAll == 'http://testhyderabad.sfanow.in/') {
        $scope.selectedCity = 'hyderabad';
    } else if (globalLinkForAll == 'http://testahmedabad.sfanow.in/') {
        $scope.selectedCity = 'ahmedabad';
    }

    $scope.changeUrl = function (selectedCity) {
        var sublink = '';
        console.log(selectedCity);
        switch (selectedCity) {
            case 'mumbai':
                $scope.selectedCity = 'mumbai';
                if (window.location.pathname == '/') {
                    if (window.location.href == 'http://hyderabadschool.sfanow.in') {
                        sublink = "http://mumbaischool.sfanow.in";
                        window.open(sublink, '_self');
                    } else if (window.location.href == 'http://hyderabadcollege.sfanow.in') {
                        sublink = "http://mumbaicollege.sfanow.in";
                        window.open(sublink, '_self');
                    } else if (window.location.href == 'http://ahmedabadschool.sfanow.in') {
                        sublink = "http://mumbaischool.sfanow.in";
                        window.open(sublink, '_self');
                    } else if (window.location.href == 'http://ahmedabadcollege.sfanow.in') {
                        sublink = "http://mumbaicollege.sfanow.in";
                        window.open(sublink, '_self');
                    }
                } else {
                    if (window.location.href == 'http://hyderabadschool.sfanow.in' + window.location.pathname) {
                        sublink = "http://mumbaischool.sfanow.in" + window.location.pathname;
                        window.open(sublink, '_self');
                    } else if (window.location.href == 'http://hyderabadcollege.sfanow.in' + window.location.pathname) {
                        sublink = "http://mumbaicollege.sfanow.in" + window.location.pathname;
                        window.open(sublink, '_self');
                    } else if (window.location.href == 'http://ahmedabadschool.sfanow.in' + window.location.pathname) {
                        sublink = "http://mumbaischool.sfanow.in" + window.location.pathname;
                        window.open(sublink, '_self');
                    } else if (window.location.href == 'http://ahmedabadcollege.sfanow.in' + window.location.pathname) {
                        sublink = "http://mumbaicollege.sfanow.in" + window.location.pathname;
                        window.open(sublink, '_self');
                    }
                }
                break;
            case 'hyderabad':
                $scope.selectedCity = 'hyderabad';
                if (window.location.pathname == '/') {
                    if (window.location.href == 'http://mumbaischool.sfanow.in') {
                        sublink = "http://hyderabadschool.sfanow.in";
                        window.open(sublink, '_self');
                    } else if (window.location.href == 'http://mumbaicollege.sfanow.in') {
                        sublink = "http://hyderabadcollege.sfanow.in";
                        window.open(sublink, '_self');
                    } else if (window.location.href == 'http://ahmedabadschool.sfanow.in') {
                        sublink = "http://hyderabadschool.sfanow.in";
                        window.open(sublink, '_self');
                    } else if (window.location.href == 'http://ahmedabadcollege.sfanow.in') {
                        sublink = "http://hyderabadcollege.sfanow.in";
                        window.open(sublink, '_self');
                    }
                } else {
                    if (window.location.href == 'http://mumbaischool.sfanow.in' + window.location.pathname) {
                        sublink = "http://hyderabadschool.sfanow.in" + window.location.pathname;
                        window.open(sublink, '_self');
                    } else if (window.location.href == 'http://mumbaicollege.sfanow.in' + window.location.pathname) {
                        sublink = "http://hyderabadcollege.sfanow.in" + window.location.pathname;
                        window.open(sublink, '_self');
                    } else if (window.location.href == 'http://ahmedabadschool.sfanow.in' + window.location.pathname) {
                        sublink = "http://hyderabadschool.sfanow.in" + window.location.pathname;
                        window.open(sublink, '_self');
                    } else if (window.location.href == 'http://ahmedabadcollege.sfanow.in' + window.location.pathname) {
                        sublink = "http://hyderabadcollege.sfanow.in" + window.location.pathname;
                        window.open(sublink, '_self');
                    }
                }
                break;
            case 'ahmedabad':
                $scope.selectedCity = 'ahmedabad';
                if (window.location.pathname == '/') {
                    if (window.location.href == 'http://hyderabadschool.sfanow.in') {
                        sublink = "http://ahmedabadschool.sfanow.in";
                        window.open(sublink, '_self');
                    } else if (window.location.href == 'http://hyderabadcollege.sfanow.in') {
                        sublink = "http://ahmedabadcollege.sfanow.in";
                        window.open(sublink, '_self');
                    } else if (window.location.href == 'http://mumbaischool.sfanow.in') {
                        sublink = "http://ahmedabadschool.sfanow.in";
                        window.open(sublink, '_self');
                    } else if (window.location.href == 'http://mumbaicollege.sfanow.in') {
                        sublink = "http://ahmedabadcollege.sfanow.in";
                        window.open(sublink, '_self');
                    }
                } else {
                    if (window.location.href == 'http://hyderabadschool.sfanow.in' + window.location.pathname) {
                        sublink = "http://ahmedabadschool.sfanow.in" + window.location.pathname;
                        window.open(sublink, '_self');
                    } else if (window.location.href == 'http://hyderabadcollege.sfanow.in' + window.location.pathname) {
                        sublink = "http://ahmedabadcollege.sfanow.in" + window.location.pathname;
                        window.open(sublink, '_self');
                    } else if (window.location.href == 'http://mumbaischool.sfanow.in' + window.location.pathname) {
                        sublink = "http://ahmedabadschool.sfanow.in" + window.location.pathname;
                        window.open(sublink, '_self');
                    } else if (window.location.href == 'http://mumbaicollege.sfanow.in' + window.location.pathname) {
                        sublink = "http://ahmedabadcollege.sfanow.in" + window.location.pathname;
                        window.open(sublink, '_self');
                    }
                }
                break;
            default:
                break;
        }
    };

    if (window.location.host == "mumbaischool.sfanow.in" || window.location.host == "mumbaicollege.sfanow.in") {
        $scope.selectedCity = 'mumbai';
    } else if (window.location.host == "hyderabadschool.sfanow.in" || window.location.host == "hyderabadcollege.sfanow.in") {
        $scope.selectedCity = 'hyderabad';
    } else if (window.location.host == "ahmedabadschool.sfanow.in" || window.location.host == "ahmedabadcollege.sfanow.in") {
        $scope.selectedCity = 'ahmedabad';
    }

    // $scope.changeUrl = function (selectedCity) {
    //     var sublink = '';
    //     console.log(selectedCity);
    //     switch (selectedCity) {
    //         case 'mumbai':
    //             $scope.selectedCity = 'mumbai';
    //             if (window.location.pathname == '/') {
    //                 if (window.location.href == 'http://testhyderabadschool.sfanow.in') {
    //                     sublink = "http://testmumbaischool.sfanow.in";
    //                     window.open(sublink, '_self');
    //                 } else if (window.location.href == 'http://testhyderabadcollege.sfanow.in') {
    //                     sublink = "http://testmumbaicollege.sfanow.in";
    //                     window.open(sublink, '_self');
    //                 } else if (window.location.href == 'http://testahmedabadschool.sfanow.in') {
    //                     sublink = "http://testmumbaischool.sfanow.in";
    //                     window.open(sublink, '_self');
    //                 } else if (window.location.href == 'http://testahmedabadcollege.sfanow.in') {
    //                     sublink = "http://testmumbaicollege.sfanow.in";
    //                     window.open(sublink, '_self');
    //                 }
    //             } else {
    //                 if (window.location.href == 'http://testhyderabadschool.sfanow.in' + window.location.pathname) {
    //                     sublink = "http://testmumbaischool.sfanow.in" + window.location.pathname;
    //                     window.open(sublink, '_self');
    //                 } else if (window.location.href == 'http://testhyderabadcollege.sfanow.in' + window.location.pathname) {
    //                     sublink = "http://testmumbaicollege.sfanow.in" + window.location.pathname;
    //                     window.open(sublink, '_self');
    //                 } else if (window.location.href == 'http://testahmedabadschool.sfanow.in' + window.location.pathname) {
    //                     sublink = "http://testmumbaischool.sfanow.in" + window.location.pathname;
    //                     window.open(sublink, '_self');
    //                 } else if (window.location.href == 'http://testahmedabadcollege.sfanow.in' + window.location.pathname) {
    //                     sublink = "http://testmumbaicollege.sfanow.in" + window.location.pathname;
    //                     window.open(sublink, '_self');
    //                 }
    //             }
    //             break;
    //         case 'hyderabad':
    //             $scope.selectedCity = 'hyderabad';
    //             if (window.location.pathname == '/') {
    //                 if (window.location.href == 'http://testmumbaischool.sfanow.in') {
    //                     sublink = "http://testhyderabadschool.sfanow.in";
    //                     window.open(sublink, '_self');
    //                 } else if (window.location.href == 'http://testmumbaicollege.sfanow.in') {
    //                     sublink = "http://testhyderabadcollege.sfanow.in";
    //                     window.open(sublink, '_self');
    //                 } else if (window.location.href == 'http://testahmedabadschool.sfanow.in') {
    //                     sublink = "http://testhyderabadschool.sfanow.in";
    //                     window.open(sublink, '_self');
    //                 } else if (window.location.href == 'http://testahmedabadcollege.sfanow.in') {
    //                     sublink = "http://testhyderabadcollege.sfanow.in";
    //                     window.open(sublink, '_self');
    //                 }
    //             } else {
    //                 if (window.location.href == 'http://testmumbaischool.sfanow.in' + window.location.pathname) {
    //                     sublink = "http://testhyderabadschool.sfanow.in" + window.location.pathname;
    //                     window.open(sublink, '_self');
    //                 } else if (window.location.href == 'http://testmumbaicollege.sfanow.in' + window.location.pathname) {
    //                     sublink = "http://testhyderabadcollege.sfanow.in" + window.location.pathname;
    //                     window.open(sublink, '_self');
    //                 } else if (window.location.href == 'http://testahmedabadschool.sfanow.in' + window.location.pathname) {
    //                     sublink = "http://testhyderabadschool.sfanow.in" + window.location.pathname;
    //                     window.open(sublink, '_self');
    //                 } else if (window.location.href == 'http://testahmedabadcollege.sfanow.in' + window.location.pathname) {
    //                     sublink = "http://testhyderabadcollege.sfanow.in" + window.location.pathname;
    //                     window.open(sublink, '_self');
    //                 }
    //             }
    //             break;
    //         case 'ahmedabad':
    //             $scope.selectedCity = 'ahmedabad';
    //             if (window.location.pathname == '/') {
    //                 if (window.location.href == 'http://testhyderabadschool.sfanow.in') {
    //                     sublink = "http://testahmedabadschool.sfanow.in";
    //                     window.open(sublink, '_self');
    //                 } else if (window.location.href == 'http://testhyderabadcollege.sfanow.in') {
    //                     sublink = "http://testahmedabadcollege.sfanow.in";
    //                     window.open(sublink, '_self');
    //                 } else if (window.location.href == 'http://testmumbaischool.sfanow.in') {
    //                     sublink = "http://testahmedabadschool.sfanow.in";
    //                     window.open(sublink, '_self');
    //                 } else if (window.location.href == 'http://testmumbaicollege.sfanow.in') {
    //                     sublink = "http://testahmedabadcollege.sfanow.in";
    //                     window.open(sublink, '_self');
    //                 }
    //             } else {
    //                 if (window.location.href == 'http://testhyderabadschool.sfanow.in' + window.location.pathname) {
    //                     sublink = "http://testahmedabadschool.sfanow.in" + window.location.pathname;
    //                     window.open(sublink, '_self');
    //                 } else if (window.location.href == 'http://testhyderabadcollege.sfanow.in' + window.location.pathname) {
    //                     sublink = "http://testahmedabadcollege.sfanow.in" + window.location.pathname;
    //                     window.open(sublink, '_self');
    //                 } else if (window.location.href == 'http://testmumbaischool.sfanow.in' + window.location.pathname) {
    //                     sublink = "http://testahmedabadschool.sfanow.in" + window.location.pathname;
    //                     window.open(sublink, '_self');
    //                 } else if (window.location.href == 'http://testmumbaicollege.sfanow.in' + window.location.pathname) {
    //                     sublink = "http://testahmedabadcollege.sfanow.in" + window.location.pathname;
    //                     window.open(sublink, '_self');
    //                 }
    //             }
    //             break;
    //         default:
    //             break;
    //     }
    // };

    // if (window.location.host == "testmumbaischool.sfanow.in" || window.location.host == "testmumbaicollege.sfanow.in") {
    //     $scope.selectedCity = 'mumbai';
    // } else if (window.location.host == "testhyderabadschool.sfanow.in" || window.location.host == "testhyderabadcollege.sfanow.in") {
    //     $scope.selectedCity = 'hyderabad';
    // } else if (window.location.host == "testahmedabadschool.sfanow.in" || window.location.host == "testahmedabadcollege.sfanow.in") {
    //     $scope.selectedCity = 'ahmedabad';
    // }

    if (window.location.origin != globalLinkSchoolRegister) {
        $scope.registerSchool = globalLinkSchoolRegister;
    } else if (window.location.origin != globalLinkCollegeRegister) {
        $scope.registerCollege = globalLinkCollegeRegister;
    }
    $scope.linkForAll = globalLinkForAll;
    $scope.linkForAllSports = globalLinkForAll + "sport/";
    $scope.eventYear = eventYear;
    $scope.games = [{
        "img": "img/footer/n1.jpg",
        "href": "http://madeofgreat.tatamotors.com/tiago/",
        "game": "Fantastico Partner"
    }, {
        "img": "img/footer/n2.jpg",
        "href": "",
        "game": "Smartphone Partner"
    }, {
        "img": "img/footer/p4.jpg",
        "href": "",
        "game": "Hydration partner"
    }, {
        "img": "img/footer/n3.jpg",
        "href": "",
        "game": "Support Partner"
    }, {
        "img": "img/footer/p7.jpg",
        "href": "",
        "game": "Media Partner "
    }, {
        "img": "img/footer/n4.jpg",
        "href": "https://www.facebook.com/sportsillustratedindia/",
        "game": "Magazine Partner"
    }];
    $scope.partner = [{
            "img": "img/footer/p1.jpg",
            "href": "",
            "game": "Venue Partner"
        }, {
            "img": "img/footer/p6.jpg",
            "href": "",
            "game": "Hospital Partner"
        },
        // {
        //     "img": "img/footer/na1.jpg",
        //     "href": "",
        //     "game": "Sports Equipment Partner"
        // }, {
        //     "img": "img/footer/na2.jpg",
        //     "href": "",
        //     "game": "Apparel Partner"
        // },
        {
            "img": "img/footer/na3.jpg",
            "href": "",
            "game": "Sports Surface Partner"
        }, {
            "img": "img/footer/na6.jpg",
            "href": "",
            "game": "Sports Mentorship Partner"
        }, {
            "img": "img/footer/na4.jpg",
            "href": "",
            "game": "Shooting Range Partner"
        }, {
            "img": "img/footer/p5.jpg",
            "href": "",
            "game": "Medical Partner"
        }, {
            "img": "img/footer/na5.jpg",
            "href": "",
            "game": "Event Partner "
        }
    ];
    $scope.supportedBy = [{
        "img": "img/footer/hyd/government.png",
        "href": "",
        "game": "Government of Telangana"
    }, {
        "img": "img/footer/hyd/authority.png",
        "href": "",
        "game": "Under the aegis of SATS"
    }];
    $scope.sponsor_partner = [{
        "img": "img/footer/hyd/enerzal.png",
        "href": "",
        "game": "Energy Drink Partner"
    }, {
        "img": "img/footer/hyd/fever.png",
        "href": "",
        "game": "Radio Partner"
    }, {
        "img": "img/footer/hyd/tv5.png",
        "href": "",
        "game": "News Channel Partner"
    }, {
        "img": "img/footer/hyd/ibrand.png",
        "href": "",
        "game": "Marketing & Strategy Partner"
    }, {
        "img": "img/footer/hyd/wizcraft.png",
        "href": "",
        "game": "Event Partner"
    }];
    // TV Support Partner
    // Hydration partner
});