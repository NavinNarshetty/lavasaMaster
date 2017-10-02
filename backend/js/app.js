// JavaScript Document
var myApp = angular.module('myApp', [
    'ui.router',
    'pascalprecht.translate',
    'angulartics',
    'angulartics.google.analytics',
    'imageupload',
    "ngMap",
    "internationalPhoneNumber",
    'ui.bootstrap',
    'ui.select',
    'toastr',
    'textAngular',
    'angular-flexslider',
    'imageupload',
    'ngMap',
    'toggle-switch',
    'cfp.hotkeys',
    'ui.sortable',
    'ui.date'
]);

myApp.config(function ($stateProvider, $urlRouterProvider, $httpProvider, $locationProvider) {
    // for http request with session
    $httpProvider.defaults.withCredentials = true;
    $stateProvider

        .state('dashboard', {
            url: "/dashboard",
            templateUrl: "views/template.html",
            controller: 'DashboardCtrl',
        })

        .state('school', {
            url: "/school",
            templateUrl: "views/template.html",
            controller: 'SchoolCtrl'
        })

        .state('athlete', {
            url: "/athlete",
            templateUrl: "views/template.html",
            controller: 'AthleteCtrl'
        })
        .state('oldschool', {
            url: "/oldschool",
            templateUrl: "views/template.html",
            controller: 'OldSchoolCtrl'
        })
        .state('viewSchool', {
            url: "/viewSchool/:id",
            templateUrl: "views/template.html",
            controller: 'ViewSchoolCtrl'
        })

        .state('viewAthlete', {
            url: "/viewAthlete/:id",
            templateUrl: "views/template.html",
            controller: 'ViewAthleteCtrl'
        })
        .state('viewOldSchool', {
            url: "/viewOldSchool/:id",
            templateUrl: "views/template.html",
            controller: 'ViewOldSchoolCtrl'
        })
        //age group
        .state('agegroup', {
            url: "/agegroup",
            templateUrl: "views/template.html",
            controller: 'AgeGroupCtrl'
        })
        //detail age group
        .state('detailagegroup', {
            url: "/detailagegroup/:id",
            templateUrl: "views/template.html",
            controller: 'DetailAgeGroupCtrl'
        })
        //rules
        .state('rules', {
            url: "/rules",
            templateUrl: "views/template.html",
            controller: 'RulesCtrl'
        })
        //detail rules
        .state('detailrules', {
            url: "/detailrules/:id",
            templateUrl: "views/template.html",
            controller: 'DetailRulesCtrl'
        })
        //first-category
        .state('firstcategory', {
            url: "/firstcategory",
            templateUrl: "views/template.html",
            controller: 'FirstCategoryCtrl'
        })
        //detail first
        .state('detailfirstcategory', {
            url: "/detailfirstcategory/:id",
            templateUrl: "views/template.html",
            controller: 'DetailFirstCategoryCtrl'
        })
        //second-category
        .state('secondcategory', {
            url: "/secondcategory",
            templateUrl: "views/template.html",
            controller: 'SecondCategoryCtrl'
        })
        //detail second
        .state('detailsecondcategory', {
            url: "/detailsecondcategory/:id",
            templateUrl: "views/template.html",
            controller: 'DetailSecondCategoryCtrl'
        })

        //third-category
        .state('thirdcategory', {
            url: "/thirdcategory",
            templateUrl: "views/template.html",
            controller: 'ThirdCategoryCtrl'
        })
        //detail third
        .state('detailthirdcategory', {
            url: "/detailthirdcategory/:id",
            templateUrl: "views/template.html",
            controller: 'DetailThirdCategoryCtrl'
        })
        //draw-format
        .state('drawformat', {
            url: "/drawformat",
            templateUrl: "views/template.html",
            controller: 'DrawFormatCtrl'
        })
        //detail draw
        .state('detaildraw', {
            url: "/detaildraw/:id",
            templateUrl: "views/template.html",
            controller: 'DetailDrawCtrl'
        })
        //sports list sub category
        .state('sportslistsubcat', {
            url: "/sports-list-subcat",
            templateUrl: "views/template.html",
            controller: 'SportsListSubCategoryCtrl'
        })
        //detail sports lis sub category
        .state('detailsportslistsubcat', {
            url: "/detail-sports-list-subcat/:id",
            templateUrl: "views/template.html",
            controller: 'DetailSportsListSubCategoryCtrl'
        })
        //sports list category
        .state('sportslistcat', {
            url: "/sports-list-cat",
            templateUrl: "views/template.html",
            controller: 'SportsListCategoryCtrl'
        })
        //detail sport list category
        .state('detailsportslistcat', {
            url: "/detail-sports-list-cat/:id",
            templateUrl: "views/template.html",
            controller: 'DetailSportsListCategoryCtrl'
        })
        // sports list
        .state('sportslist', {
            url: "/sports-list",
            templateUrl: "views/template.html",
            controller: 'SportsListCtrl'
        })
        //detail sports list
        .state('detailsportslist', {
            url: "/detail-sports-list/:id",
            templateUrl: "views/template.html",
            controller: 'DetailSportsListCtrl'
        })
        //sports
        .state('sports', {
            url: "/sports",
            templateUrl: "views/template.html",
            controller: 'SportsCtrl'
        })
        //detailsports
        .state('detailsports', {
            url: "/detailsports/:id",
            templateUrl: "views/template.html",
            controller: 'DetailSportsCtrl'
        })
        //Team sport
        .state('teamsport', {
            url: "/teamsport",
            templateUrl: "views/template.html",
            controller: 'TeamSportCtrl'
        })
        //Detail team sport
        .state('detail-teamsport', {
            url: "/detail-teamsport/:id",
            templateUrl: "views/template.html",
            controller: 'DetailTeamSportCtrl'
        })
        //student team
        .state('student-team', {
            url: "/student-team",
            templateUrl: "views/template.html",
            controller: 'StudentTeamCtrl'
        })
        //individual-sport
        .state('individual-sport', {
            url: "/individual-sport",
            templateUrl: "views/template.html",
            controller: 'IndividualTeamCtrl'
        })
        //view individual-sport
        .state('view-individualsport', {
            url: "/view-individualsport/:id",
            templateUrl: "views/template.html",
            controller: 'ViewIndividualSportCtrl'
        })

        .state('page', {
            url: "/page/:id/{page:.*}/{keyword:.*}",
            templateUrl: "views/template.html",
            controller: 'PageJsonCtrl'
        })
        // .state('page', {
        //     url: "/page/:id/{page:.*}/{keyword:.*}/{filter:.*}",
        //     templateUrl: "views/template.html",
        //     controller: 'PageJsonCtrl'
        // })
        .state('login', {
            url: "/login",
            templateUrl: "views/login.html",
            controller: 'LoginCtrl'
        })

        .state('country-list', {
            url: "/country-list/{page:.*}/{keyword:.*}",
            templateUrl: "views/template.html",
            controller: 'CountryCtrl',
            params: {
                page: "1",
                keyword: ""
            }
        })

        .state('createcountry', {
            url: "/country-create",
            templateUrl: "views/template.html",
            controller: 'CreateCountryCtrl'
        })

        .state('editcountry', {
            url: "/country-edit/:id",
            templateUrl: "views/template.html",
            controller: 'EditCountryCtrl'
        })

        .state('schema-creator', {
            url: "/schema-creator",
            templateUrl: "views/template.html",
            controller: 'SchemaCreatorCtrl'
        })

        .state('excel-upload', {
            url: "/excel-upload/:controller/:funcName/:view",
            templateUrl: "views/template.html",
            controller: 'ExcelUploadCtrl'
        })
        //rounds
        .state('rounds', {
            url: "/rounds",
            templateUrl: "views/template.html",
            controller: 'RoundCtrl'
        })
        //detailrounds
        .state('detailrounds', {
            url: "/detailrounds/:id",
            templateUrl: "views/template.html",
            controller: 'DetailRoundCtrl'
        })
        //matches
        .state('matches', {
            url: "/matches",
            templateUrl: "views/template.html",
            controller: 'MatchesCtrl'
        })
        //Event pdf
        .state('tablepdf', {
            url: "/tablepdf",
            templateUrl: "views/template.html",
            controller: 'TablePdfCtrl'
        })
        .state('detailpdf', {
            url: "/detailpdf/:id",
            templateUrl: "views/template.html",
            controller: 'DetailPdfCtrl'
        })
        //detailmatches
        .state('detailmatches', {
            url: "/detailmatches",
            templateUrl: "views/template.html",
            controller: 'DetailMatchesCtrl'
        })
        // ***************EDIT PAGES FOR DIGITAL SCORING *******************
        //detailplayer
        .state('detailplayer', {
            url: "/detailplayer/:id",
            templateUrl: "views/template.html",
            controller: 'DetailPlayerCtrl'
        })
        // detailteam
        .state('detailteam', {
            url: "/detailteam/:id",
            templateUrl: "views/template.html",
            controller: 'DetailTeamCtrl'
        })
        // detailteamsport
        .state('detailtsport-team', {
            url: "/detailsport-team/:id",
            templateUrl: "views/template.html",
            controller: 'DetailSportTeamCtrl'
        })
        .state('format-table', {
            url: "/format-table/:type",
            templateUrl: "views/template.html",
            controller: 'FormatTableCtrl'
        })
        .state('format-teamtable', {
            url: "/format-teamtable/:type",
            templateUrl: "views/template.html",
            controller: 'FormatTableTeamCtrl'
        })
        .state('detail-heats', {
            url: "/detail-heats/:id",
            templateUrl: "views/template.html",
            controller: 'DetailHeatCtrl'
        })
        .state('detail-qualifying', {
            url: "/detail-qualifying/:id",
            templateUrl: "views/template.html",
            controller: 'DetailQualifyingCtrl'
        })
        // **************************END EDIT DIGITAL *******************
        //medals
        .state('medals', {
            url: "/medals",
            templateUrl: "views/template.html",
            controller: 'MedalsCtrl'
        })
        //detailmedal
        .state('detailmedal', {
            url: "/detailmedal/:id",
            templateUrl: "views/template.html",
            controller: 'DetailMedalCtrl'
        })
        //gallery
        .state('gallery', {
            url: "/gallery",
            templateUrl: "views/template.html",
            controller: 'GalleryCtrl'
        })
        //galleryDetail
        .state('galleryDetail', {
            url: "/gallerydetail",
            templateUrl: "views/template.html",
            controller: 'DetailGalleryCtrl'
        })
        //faq
        .state('faq', {
            url: "/faq",
            templateUrl: "views/template.html",
            controller: 'FaqCtrl'
        })
        //detail faq
        .state('detailfaq', {
            url: "/detailfaq/:id",
            templateUrl: "views/template.html",
            controller: 'DetailFaqCtrl'
        })
        //certificate banner
        .state('certificatebanner', {
            url: "/certificatebanner",
            templateUrl: "views/template.html",
            controller: 'CertificateBannerCtrl'
        })
        //detail certificate banner
        .state('detailcertificatebanner', {
            url: "/detailcertificatebanner/:id",
            templateUrl: "views/template.html",
            controller: 'DetailCertificateBannerCtrl'
        })
        //certificate detail
        .state('certificatedetails', {
            url: "/certificatedetails",
            templateUrl: "views/template.html",
            controller: 'CertificateDetailsCtrl'
        })
        //detail certificate detail
        .state('detailcertificatedetails', {
            url: "/detailcertificatedetails/:id",
            templateUrl: "views/template.html",
            controller: 'DetailCertificateDetailsCtrl'
        })
        // table calender
        .state('calender', {
            url: "/calender",
            templateUrl: "views/template.html",
            controller: 'TableCalenderCtrl'
        })
        // detail calender
        .state('detail-calender', {
            url: "/detail-calender/:id",
            templateUrl: "views/template.html",
            controller: 'DetailCalenderCtrl'
        })

        .state('jagz', {
            url: "/jagz",
            templateUrl: "views/jagz.html",
            controller: 'JagzCtrl'
        })

        .state('loginapp', {
            url: "/login/:id",
            templateUrl: "views/login.html",
            controller: 'LoginCtrl'
        });

    $urlRouterProvider.otherwise("/dashboard");
    $locationProvider.html5Mode(isproduction);
});

myApp.config(function ($translateProvider) {
    $translateProvider.translations('en', LanguageEnglish);
    $translateProvider.translations('hi', LanguageHindi);
    $translateProvider.preferredLanguage('en');
});