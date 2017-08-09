// myApp.controller('headerCtrl', function ($scope, TemplateService) {
//     $scope.template = TemplateService;
//     $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
//         $(window).scrollTop(0);
//     });
//     $.fancybox.close(true);
// });

var globalLinkSchoolRegister = "http://mumbaischool.sfanow.in";
var globalLinkCollegeRegister = "http://mumbaicollege.sfanow.in";
var globalLinkForAll = "https://mumbai.sfanow.in/";
// var globalLinkForAll = "http://localhost:8082/";
// var globalLinkSchoolRegister = "http://testmumbaischool.sfanow.in";
// var globalLinkCollegeRegister = "http://testmumbaicollege.sfanow.in";
// var globalLinkForAll = "http://testmumbai.sfanow.in/";
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
                console.log('mumbai', selectedCity);
                $scope.selectedCity = 'mumbai';
                if (window.location.pathname == '/') {
                    console.log('in/', selectedCity);
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
                    console.log('in', selectedCity);
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
                console.log('hyderabad', selectedCity);
                $scope.selectedCity = 'hyderabad';
                if (window.location.pathname == '/') {
                    console.log('in/', selectedCity);
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
                    console.log('in', selectedCity);
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
                console.log('ahmedabad', selectedCity);
                if (window.location.pathname == '/') {
                    console.log('in/', selectedCity);
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
                    console.log('in', selectedCity);
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

    if (window.location.host == "testmumbaischool.sfanow.in" || window.location.host == "testmumbaicollege.sfanow.in") {
        $scope.selectedCity = 'mumbai';
    } else if (window.location.host == "testhyderabadschool.sfanow.in" || window.location.host == "testhyderabadcollege.sfanow.in") {
        $scope.selectedCity = 'hyderabad';
    } else if (window.location.host == "testahmedabadschool.sfanow.in" || window.location.host == "testahmedabadcollege.sfanow.in") {
        $scope.selectedCity = 'ahmedabad';
    }

    // if (window.location.origin != "http://testmumbaischool.sfanow.in") {
    if (window.location.origin != globalLinkSchoolRegister) {
        $scope.registerSchool = globalLinkSchoolRegister;
    } else if (window.location.origin != globalLinkCollegeRegister) {
        $scope.registerCollege = globalLinkCollegeRegister;
    }
    $scope.linkForAll = globalLinkForAll;
    $scope.linkForAllSports = globalLinkForAll + "sport/";

    $scope.games = // JavaScript Document
        [{
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
        }, {
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
        }];
    $scope.partner = // JavaScript Document
        [{
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

});