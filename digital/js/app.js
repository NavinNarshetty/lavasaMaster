// Link all the JS Docs here
var myApp = angular.module('myApp', [
    'ui.router',
    'pascalprecht.translate',
    'angulartics',
    'imageupload',
    // 'angulartics.google.analytics',
    'ui.bootstrap',
    'ngAnimate',
    'ngSanitize',
    'angular-flexslider',
    'ui.swiper',
    'angularPromiseButtons',
    'toastr',
    'ui.select',
    'cleave.js'
]);

// Define all the routes below
myApp.config(function ($stateProvider, $urlRouterProvider, $httpProvider, $locationProvider) {
    var tempateURL = "views/template/template.html"; //Default Template URL

    // for http request with session
    $httpProvider.defaults.withCredentials = true;
    $stateProvider
        .state('home', {
            url: "/",
            templateUrl: tempateURL,
            controller: 'HomeCtrl'
        })
        .state('digital-home', {
            url: "/digital-home",
            templateUrl: tempateURL,
            controller: 'DigitalHomeCtrl'
        })
        .state('matchstart', {
            url: "/match/:drawFormat/:id/:sport",
            templateUrl: tempateURL,
            controller: 'MatchStartCtrl'
        })
        .state('matchteam', {
            url: "/matchteam/:drawFormat/:id/:sport",
            templateUrl: tempateURL,
            controller: 'MatchTeamCtrl'
        })
        .state('scorecombat', {
            url: "/scorecombat/:drawFormat/:id/:sport",
            templateUrl: tempateURL,
            controller: 'CombatScoreCtrl'
        })
        .state('scoreracquet', {
            url: "/scoreracquet/:drawFormat/:id/:sport",
            templateUrl: tempateURL,
            controller: 'RacquetScoreCtrl'
        })
        .state('scoreracquetdoubles', {
            url: "/score-racquetdoubles/:id",
            templateUrl: tempateURL,
            controller: 'RacquetDoublesScoreCtrl'
        })
        .state('scorefootball', {
            url: "/scorefootball",
            templateUrl: tempateURL,
            controller: 'FootballScoreCtrl'
        })
        .state('scorehockey', {
            url: "/scorehockey",
            templateUrl: tempateURL,
            controller: 'HockeyScoreCtrl'
        })
        .state('scorebasketball', {
            url: "/scorebasketball/:drawFormat/:id/:sport",
            templateUrl: tempateURL,
            controller: 'BasketballScoreCtrl'
        })
        .state('scorevolleyball', {
            url: "/volleyball/:drawFormat/:id/:sport",
            templateUrl: tempateURL,
            controller: 'VolleyballScoreCtrl'
        })
        .state('scorehandball', {
            url: "/scorehandball",
            templateUrl: tempateURL,
            controller: 'HandballScoreCtrl'
        })
        .state('scorewaterpolo', {
            url: "/waterpolo",
            templateUrl: tempateURL,
            controller: 'WaterPoloScoreCtrl'
        })
        .state('scorekabaddi', {
            url: "/scorekabaddi",
            templateUrl: tempateURL,
            controller: 'KabaddiScoreCtrl'
        })
        .state('knockout-team', {
            url: "/knockout-team/:id",
            templateUrl: tempateURL,
            controller: 'KnockoutTeamCtrl'
        })
        .state('knockout', {
            url: "/:drawFormat/:id",
            templateUrl: tempateURL,
            controller: 'KnockoutCtrl'
        })
        .state('knockout-doubles', {
            url: "/knockout-doubles",
            templateUrl: tempateURL,
            controller: 'KnockoutDoublesCtrl'
        })
        .state('form', {
            url: "/form",
            templateUrl: tempateURL,
            controller: 'FormCtrl'
        })
        .state('grid', {
            url: "/grid",
            templateUrl: tempateURL,
            controller: 'GridCtrl'
        });
    $urlRouterProvider.otherwise("/");
    $locationProvider.html5Mode(isproduction);
});

// For Language JS
myApp.config(function ($translateProvider) {
    $translateProvider.translations('en', LanguageEnglish);
    $translateProvider.translations('hi', LanguageHindi);
    $translateProvider.preferredLanguage('en');
});