// JavaScript Document
var myApp = angular.module('myApp', [
    'ui.select',
    'ui.router',
    'pascalprecht.translate',
    'angulartics',
    'angulartics.google.analytics',
    'imageupload',
    'ui.date',
    'ui.bootstrap',
    'ngAnimate',
    'ngSanitize',
    'angular-flexslider',
    'angular-loading-bar',
    'ordinal',
    'wt.responsive',
    'toastr',
    'infinite-scroll',
    'angularPromiseButtons',
    'ui.swiper',

]);

// Define all the routes below
myApp.config(function ($stateProvider, $urlRouterProvider, $httpProvider, $locationProvider, cfpLoadingBarProvider, angularPromiseButtonsProvider) {
    var tempateURL = "views/template/template.html"; //Default Template URL

    // for http request with session
    $httpProvider.defaults.withCredentials = true;

    //PROMISE BUTTON//
    angularPromiseButtonsProvider.extendConfig({
        spinnerTpl: '<span class="btn-spinner"></span>',
        disableBtn: true,
        btnLoadingClass: 'is-loading',
        addClassToCurrentBtnOnly: false,
        disableCurrentBtnOnly: false,
        minDuration: false,
        CLICK_EVENT: 'click',
        CLICK_ATTR: 'ngClick',
        SUBMIT_EVENT: 'submit',
        SUBMIT_ATTR: 'ngSubmit',
        BTN_SELECTOR: 'button'
    });


    //Custom Toastr//  //app.js mention toastrConfig//
    // angular.extend(toastrConfig, {
    //     autoDismiss: false,
    //     containerId: 'toast-container',
    //     maxOpened: 0,
    //     newestOnTop: true,
    //     positionClass: 'toast-centered',
    //     preventDuplicates: false,
    //     preventOpenDuplicates: false,
    //     target: 'body'
    // });


    //LOADING BAR//

    // cfpLoadingBarProvider.latencyThreshold = 2000;
    // cfpLoadingBarProvider.includeBar = true;
    cfpLoadingBarProvider.includeSpinner = false;
    cfpLoadingBarProvider.includeBar = true;
    // cfpLoadingBarProvider.spinnerTemplate = '<div class="loaderHeader"><img src="img/load.gif" alt="" /></div>';
    $stateProvider
        // .state('home', {
        //     url: "/",
        //     templateUrl: tempateURL,
        //     controller: 'HomeCtrl'
        // })

        .state('form', {
            url: "/form",
            templateUrl: tempateURL,
            controller: 'FormCtrl'
        })

        .state('championship', {
            url: "/championship",
            templateUrl: tempateURL,
            controller: 'ChampionshipCtrl'
        })

        .state('register', {
            url: "/register",
            templateUrl: tempateURL,
            controller: 'RegisterCtrl'
        })

        .state('venue', {
            url: "/venue",
            templateUrl: tempateURL,
            controller: 'VenueCtrl'
        })

        .state('champions', {
            url: "/champions",
            templateUrl: tempateURL,
            controller: 'ChampionsCtrl'
        })

        .state('faq', {
            url: "/faq",
            templateUrl: tempateURL,
            controller: 'FaqCtrl'
        })

        .state('terms-condition', {
            url: "/terms-condition",
            templateUrl: tempateURL,
            controller: 'TermsConditionCtrl'
        })




        //Form Registration

        .state('formathlete', {
            url: "/formathlete",
            templateUrl: tempateURL,
            controller: 'FormathleteCtrl'
        })

        .state('formregis', {
            url: "/formregis",
            templateUrl: tempateURL,
            controller: 'FormregisCtrl'
        })

        .state('paymentSuccess', {
            url: "/paymentSuccess",
            templateUrl: tempateURL,
            controller: 'PaymentSuccessCtrl'
        })

        .state('sorryAthelete', {
            url: "/sorryAthelete",
            templateUrl: tempateURL,
            controller: 'SorryAtheleteCtrl'
        })

        .state('paymentFailure', {
            url: "/paymentFailure",
            templateUrl: tempateURL,
            controller: 'PaymentFailureCtrl'
        })




        //SPORTS REGISTRATION MODULE

        .state('sports-registration', {
            url: "/sports-registration",
            templateUrl: tempateURL,
            controller: 'SportsRegistrationCtrl'
        })

        .state('forgot-password', {
            url: "/forgot-password",
            templateUrl: tempateURL,
            controller: 'ForgotPasswordCtrl'
        })

        .state('change-password', {
            url: "/change-password",
            templateUrl: tempateURL,
            controller: 'ChangePasswordCtrl'
        })

        .state('sports-rules', {
            url: "/sports-rules/:id",
            templateUrl: tempateURL,
            controller: 'SportsRulesCtrl'
        })

        .state('team-congrats', {
            url: "/team-congrats",
            templateUrl: tempateURL,
            controller: 'TeamCongratsCtrl'
        })

        .state('individual-congrats', {
            url: "/individual-congrats",
            templateUrl: tempateURL,
            controller: 'IndividualCongratsCtrl'
        })

        .state('sports-selection', {
            url: "/sports-selection",
            templateUrl: tempateURL,
            controller: 'SportsSelectionCtrl'
        })

        .state('sports-selection-', {
            url: "/sports-selection/:userType/:id",
            templateUrl: tempateURL,
            controller: 'SportsSelectionCtrl'
        })

        .state('team-selection', {
            url: "/team-selection/:id",
            templateUrl: tempateURL,
            controller: 'TeamSelectionCtrl'
        })

        .state('individual-selection', {
            url: "/individual-selection/:id",
            templateUrl: tempateURL,
            controller: 'IndividualSelectionCtrl'
        })

        .state('confirmteam', {
            url: "/confirm1/:name",
            templateUrl: tempateURL,
            controller: 'ConfirmTeamCtrl'
        })

        .state('confirm-individual', {
            url: "/confirm2/:name",
            templateUrl: tempateURL,
            controller: 'ConfirmIndividualCtrl'
        })

        .state('confirm-fencing', {
            url: "/confirm3/:name",
            templateUrl: tempateURL,
            controller: 'ConfirmFencingCtrl'
        })

        .state('confirm-karate', {
            url: "/confirm4/:name",
            templateUrl: tempateURL,
            controller: 'ConfirmKarateCtrl'
        })

        .state('confirm-athleteswim', {
            url: "/confirm5/:name",
            templateUrl: tempateURL,
            controller: 'ConfirmAthSwmCtrl'
        })

        .state('test', {
            url: "/test",
            templateUrl: tempateURL,
            controller: 'DummyCtrl'
        })

        .state('sport-individualdetail', {
            url: "/sport-individualdetail/:id",
            templateUrl: tempateURL,
            controller: 'SportIndividualCtrl'
        })

        .state('sport-teamdetail', {
            url: "/sport-teamdetail/:id",
            templateUrl: tempateURL,
            controller: 'SportTeamCtrl'
        })
        .state('college-faq', {
            url: "/college-faq",
            templateUrl: tempateURL,
            controller: 'CollegeFaqCtrl'
        })
        .state('championshipschedules', {
            url: "/championship-schedule",
            templateUrl: tempateURL,
            controller: 'ChampionshipSchedulesCtrl'
        })
        .state('hyderabad', {
            url: "/hyderabad",
            templateUrl: tempateURL,
            controller: 'HyderabadCtrl'
        })
        // Draws and Schedule
        .state('championshipschedule', {
            url: "/draws-schedule",
            templateUrl: tempateURL,
            controller: 'ChampionshipScheduleCtrl'
        })
        .state('heats', {
            url: "/heats/:id/:sportName",
            templateUrl: tempateURL,
            controller: 'HeatsCtrl'
        })
        .state('time-trial', {
            url: "/time-trial/:id/:name",
            templateUrl: tempateURL,
            controller: 'TimeTrialCtrl'
        })
        .state('direct-final', {
            url: "/direct-final",
            templateUrl: tempateURL,
            controller: 'DirectFinalCtrl'
        })
        .state('qf-final', {
            url: "/qf-final/:id/:name",
            templateUrl: tempateURL,
            controller: 'qfFinalCtrl'
        })
        .state('swiss-league', {
            url: "/swiss-league",
            templateUrl: tempateURL,
            controller: 'swissLeagueCtrl'
        })
        .state('league-knockout', {
            url: "/league-knockout/:id",
            templateUrl: tempateURL,
            controller: 'LeagueKnockoutCtrl'
        })
        .state('qf-knockout', {
            url: "/qf-knockout/:id",
            templateUrl: tempateURL,
            controller: 'QfKnockoutCtrl'
        })
        .state('knockout', {
            url: "/knockout/:id",
            templateUrl: tempateURL,
            controller: 'KnockoutCtrl'
        })
        .state('knockout-team', {
            url: "/knockout-team/:id",
            templateUrl: tempateURL,
            controller: 'KnockoutTeamCtrl'
        })
        .state('knockout-doubles', {
            url: "/knockout-doubles/:id",
            templateUrl: tempateURL,
            controller: 'KnockoutDoublesCtrl'
        })
        .state('results', {
            url: "/wohlig/results",
            templateUrl: tempateURL,
            controller: 'ResultsCtrl'
        });
    // if (window.location.origin != "http://testmumbaischool.sfanow.in") {
    if (window.location.origin == "http://mumbaischool.sfanow.in") {
        $urlRouterProvider.otherwise("/championship");
    } else if (window.location.origin == "http://mumbaicollege.sfanow.in") {
        $urlRouterProvider.otherwise("/register");
    } else if (window.location.origin == "http://hyderabadschool.sfanow.in") {
        $urlRouterProvider.otherwise("/championship");
    } else if (window.location.origin == "http://hyderabadcollege.sfanow.in") {
        $urlRouterProvider.otherwise("/register");
    } else if (window.location.origin == "http://ahmedabadschool.sfanow.in") {
        $urlRouterProvider.otherwise("/championship");
    } else if (window.location.origin == "http://ahmedabadcollege.sfanow.in") {
        $urlRouterProvider.otherwise("/register");
    } else if (window.location.origin == "http://testmumbaischool.sfanow.in") {
        $urlRouterProvider.otherwise("/championship");
    } else if (window.location.origin == "http://testmumbaicollege.sfanow.in") {
        $urlRouterProvider.otherwise("/register");
    } else if (window.location.origin == "http://testhyderabadschool.sfanow.in") {
        $urlRouterProvider.otherwise("/championship");
    } else if (window.location.origin == "http://testhyderabadcollege.sfanow.in") {
        $urlRouterProvider.otherwise("/register");
    } else if (window.location.origin == "http://testahmedabadschool.sfanow.in") {
        $urlRouterProvider.otherwise("/championship");
    } else if (window.location.origin == "http://testahmedabadcollege.sfanow.in") {
        $urlRouterProvider.otherwise("/register");
    }
    $locationProvider.html5Mode(isproduction);
});

// For Language JS
myApp.config(function ($translateProvider) {
    $translateProvider.translations('en', LanguageEnglish);
    $translateProvider.translations('hi', LanguageHindi);
    $translateProvider.preferredLanguage('en');
});
