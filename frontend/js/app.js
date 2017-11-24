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
    'cleave.js',
    'wu.masonry'

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

        .state('results', {
            url: "/results",
            templateUrl: tempateURL,
            controller: 'ResultsCtrl'
        })

        .state('sponsors-partner', {
            url: "/sponsors-partner",
            templateUrl: tempateURL,
            controller: 'SponsorPartnerCtrl'
        })

        .state('individual-sponsor', {
            url: "/individual-sponsor/:id",
            templateUrl: tempateURL,
            controller: 'IndividualSponsorCtrl'
        })

        .state('event-attendance', {
            url: "/event-attendance",
            templateUrl: tempateURL,
            controller: 'eventAttendanceCtrl'
        })

        .state('eventattendance-profile', {
            url: "/eventattendance-profile/:id",
            templateUrl: tempateURL,
            controller: 'eventAttendanceProfileCtrl'
        })

        .state('additional-paymentForm', {
            url: "/additional-paymentForm",
            templateUrl: tempateURL,
            controller: 'AdditionalPaymentFormCtrl'
        })

        .state('specialevents', {
            url: "/specialevents",
            templateUrl: tempateURL,
            controller: 'SpecialEventCtrl'
        })


        // Profile

        .state('students', {
            url: "/students",
            templateUrl: tempateURL,
            controller: 'StudentsCtrl'
        })

        .state('student-profile', {
            url: "/student-profile/:id",
            templateUrl: tempateURL,
            controller: 'StudentProfileCtrl'
        })

        .state('student-bio', {
            url: "/student-bio/:id",
            templateUrl: tempateURL,
            controller: 'StudentBioCtrl'
        })

        .state('school', {
            url: "/school",
            templateUrl: tempateURL,
            controller: 'SchoolCtrl'
        })

        .state('school-profile', {
            url: "/school-profile/:id",
            templateUrl: tempateURL,
            controller: 'SchoolProfileCtrl'
        })

        .state('school-bio', {
            url: "/school-bio/:id",
            templateUrl: tempateURL,
            controller: 'SchoolBioCtrl'
        })

        .state('team', {
            url: "/team",
            templateUrl: tempateURL,
            controller: 'TeamCtrl'
        })

        .state('team-detail', {
            url: "/team-detail/:id",
            templateUrl: tempateURL,
            controller: 'TeamDetailCtrl'
        })


        // Media

        .state('media-gallery', {
            url: "/media-gallery",
            templateUrl: tempateURL,
            controller: 'MediaGalleryCtrl'
        })

        .state('media-gallery-inside', {
            url: "/media-gallery/:type/:folder",
            templateUrl: tempateURL,
            controller: 'MediaGalleryCtrl'
        })

        .state('media-gallery-type', {
            url: "/media-gallery/:type",
            templateUrl: tempateURL,
            controller: 'MediaGalleryCtrl'
        })

        .state('media-press', {
            url: "/media-press",
            templateUrl: tempateURL,
            controller: 'MediaPressCtrl'
        })

        .state('media-press-inside', {
            url: "/media-press/:type/:folder",
            templateUrl: tempateURL,
            controller: 'MediaPressCtrl'
        })

        .state('media-press-type', {
            url: "/media-press/:type",
            templateUrl: tempateURL,
            controller: 'MediaPressCtrl'
        })

        //Form Registration

        .state('formathleteS', {
            url: "/formathleteS",
            templateUrl: tempateURL,
            controller: 'FormathleteCtrl'
        })

        .state('formregisS', {
            url: "/formregisS",
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
            url: "/swiss-league/:id",
            templateUrl: tempateURL,
            controller: 'swissLeagueCtrl'
        })
        .state('league-knockoutIndividual', {
            url: "/league-knockout/:id",
            templateUrl: tempateURL,
            params: {
                'isTeam': false
            },
            controller: 'LeagueKnockoutCtrl'
        })
        .state('league-knockoutTeam', {
            url: "/league-knockoutteam/:id",
            templateUrl: tempateURL,
            params: {
                'isTeam': true
            },
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
        // DRAWS SCHEDULE END
        .state('reportcard', {
            url: "/reportcard",
            templateUrl: tempateURL,
            controller: 'ReportCardCtrl'
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
