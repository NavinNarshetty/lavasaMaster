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
        .state('scoreleague', {
            url: "/league/:drawFormat/:id/:sport",
            templateUrl: tempateURL,
            controller: 'LeagueScoreCtrl'
        })
        .state('scoreracquet', {
            url: "/scoreracquet/:drawFormat/:id/:sport",
            templateUrl: tempateURL,
            controller: 'RacquetScoreCtrl'
        })
        .state('scoreracquetdoubles', {
            url: "/score-doubles/:drawFormat/:id/:sport",
            templateUrl: tempateURL,
            controller: 'RacquetDoublesScoreCtrl'
        })
        .state('scorefootball', {
            url: "/football/:drawFormat/:id/:sport",
            templateUrl: tempateURL,
            controller: 'FootballScoreCtrl'
        })
        .state('scorehockey', {
            url: "/scorehockey",
            templateUrl: tempateURL,
            controller: 'ScoringCtrl'
        })
        .state('scorebasketball', {
            url: "/scoreteam/:drawFormat/:id/:sport",
            templateUrl: tempateURL,
            controller: 'ScoringCtrl'
        })
        .state('scorecombatteam', {
            url: "/teamcombat/:drawFormat/:id/:sport",
            templateUrl: tempateURL,
            controller: 'CombatTeamCtrl'
        })
        .state('scorevolleyball', {
            url: "/volleyball/:drawFormat/:id/:sport",
            templateUrl: tempateURL,
            controller: 'VolleyballScoreCtrl'
        })
        .state('scorehandball', {
            url: "/scorehandball",
            templateUrl: tempateURL,
            controller: 'ScoringCtrl'
        })
        .state('scorewaterpolo', {
            url: "/waterpolo",
            templateUrl: tempateURL,
            controller: 'ScoringCtrl'
        })
        .state('scorekabaddi', {
            url: "/scorekabaddi",
            templateUrl: tempateURL,
            controller: 'ScoringCtrl'
        })
        .state('scorequalifying', {
            url: "/qualifying/:flag/:sportName/:drawFormat/:sport/:roundName/:sportId",
            templateUrl: tempateURL,
            controller: 'QualifyingScoreCtrl'
        })
        .state('knockout-doubles', {
            url: "/doubles/:drawFormat/:id",
            templateUrl: tempateURL,
            controller: 'KnockoutDoublesCtrl'
        })
        .state('knockout-team', {
            url: "/team/:drawFormat/:id",
            templateUrl: tempateURL,
            controller: 'KnockoutTeamCtrl'
        })
        .state('knockout', {
            url: "/knockout/:drawFormat/:id",
            templateUrl: tempateURL,
            controller: 'KnockoutCtrl'
        })
        .state('league-knockoutTeam', {
            url: "/league-knockoutTeam/:drawFormat/:id",
            templateUrl: tempateURL,
            controller: 'LeagueKnockoutCtrl',
            params: {
                isTeam: true
            }

        })
        .state('league-knockoutIndividual', {
            url: "/league-knockoutIndividual/:drawFormat/:id",
            templateUrl: tempateURL,
            controller: 'LeagueKnockoutCtrl',
            params: {
                isTeam: false
            }

        })
        .state('heats', {
            url: "/heats/:drawFormat/:id/:sportName",
            templateUrl: tempateURL,
            controller: 'HeatsCtrl'
        })
        .state('time-trial', {
            url: "/time-trial/:drawFormat/:id/:name",
            templateUrl: tempateURL,
            controller: 'TimeTrialCtrl'
        })
        .state('qf-final', {
            url: "/qf-final/:drawFormat/:id/:name",
            templateUrl: tempateURL,
            controller: 'qfFinalCtrl'
        })
        .state('swiss-league', {
            url: "/swiss-league/:drawFormat/:id",
            templateUrl: tempateURL,
            controller: 'swissLeagueCtrl'
        })
        .state('qf-knockout', {
            url: "/qf-knockout/:drawFormat/:id",
            templateUrl: tempateURL,
            controller: 'QfKnockoutCtrl'
        })
        .state('scoringimages', {
            url: "/scoringimages/:drawFormat/:id/:sport/:sportName",
            templateUrl: tempateURL,
            controller: 'ScoringImagestCtrl'
        })
        // ATTENDANCE PAGES
        .state('digital-attendance', {
            url: "/digital-attendance",
            templateUrl: tempateURL,
            controller: 'DigitalAttendanceCtrl'
        })
        .state('attendancesheet', {
            url: "/attendancesheet/:sport",
            templateUrl: tempateURL,
            controller: 'AttendanceSheetCtrl'
        })
        .state('attendancesheet-team', {
            url: "/team-attendancesheet/:sport",
            templateUrl: tempateURL,
            controller: 'AttendanceSheetTeamCtrl'
        })
        .state('addweight', {
            url: "/addweight",
            templateUrl: tempateURL,
            controller: 'AddWeightCtrl'
        })
        // ATTENDANCE PAGES
        // CREATE MATCHES
        .state('creatmatch-heats', {
            url: "/creatematch",
            templateUrl: tempateURL,
            controller: 'CreateMatchHeatsCtrl'
        })
        // CREATE MATCHES END
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
