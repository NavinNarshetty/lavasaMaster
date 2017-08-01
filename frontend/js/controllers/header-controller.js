// myApp.controller('headerCtrl', function ($scope, TemplateService) {
//     $scope.template = TemplateService;
//     $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
//         $(window).scrollTop(0);
//     });
//     $.fancybox.close(true);
// });

var globalLinkSchoolRegister = "http://testmumbaischool.sfanow.in/register";
var globalLinkCollegeRegister = "http://testmumbaicollege.sfanow.in/register";
var globalLinkForAll = "http://mumbai.sfanow.in/";
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

    $scope.registerSchool = globalLinkSchoolRegister;
    $scope.registerCollege = globalLinkCollegeRegister;
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
        }, {
            "img": "img/footer/na1.jpg",
            "href": "",
            "game": "Sports Equipment Partner"
        }, {
            "img": "img/footer/na2.jpg",
            "href": "",
            "game": "Apparel Partner"
        }, {
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
        }];

});