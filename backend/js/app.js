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
        .state('schoolOps', {
            url: "/schoolOps",
            templateUrl: "views/template.html",
            controller: 'SchoolCtrl'
        })

        .state('schoolpayustatus', {
            url: "/schoolpayustatus",
            templateUrl: "views/template.html",
            controller: 'SchoolpayustatuslCtrl'
        })

        .state('athlete', {
            url: "/athlete",
            templateUrl: "views/template.html",
            controller: 'AthleteCtrl'
        })
        .state('athleteOps', {
            url: "/athleteOps",
            templateUrl: "views/template.html",
            controller: 'AthleteCtrl'
        })
        .state('athletepayustatus', {
            url: "/athletepayustatus",
            templateUrl: "views/template.html",
            controller: 'AthletepayustatusCtrl'
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
        .state('editSchool', {
            url: "/editSchool/:id",
            templateUrl: "views/template.html",
            controller: 'EditSchoolCtrl'
        })
        .state('editAthlete', {
            url: "/editAthlete/:id",
            templateUrl: "views/template.html",
            controller: 'EditAthleteCtrl'
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
        .state('media', {
            url: "/media",
            templateUrl: "views/template.html",
            controller: 'MediaCtrl'
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
        // folder
        .state('folder', {
            url: "/folder",
            templateUrl: "views/template.html",
            controller: 'FolderCtrl'
        })
        //galleryDetail
        .state('galleryDetail', {
            url: "/gallerydetail/:id",
            templateUrl: "views/template.html",
            controller: 'DetailGalleryCtrl'
        })
        // ad gallery
        .state('adgallery', {
            url: "/adgallery",
            templateUrl: "views/template.html",
            controller: 'AdGalleryCtrl'
        })
        //detail gallery
        .state('detailadgallery', {
            url: "/detailadgallery/:id",
            templateUrl: "views/template.html",
            controller: 'DetailAdGalleryCtrl'
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
        // table sponsor
        .state('sponsor', {
            url: "/sponsor",
            templateUrl: "views/template.html",
            controller: 'SponsorCtrl'
        })
        // detail sponsor
        .state('detail-sponsor', {
            url: "/detail-sponsor/:id",
            templateUrl: "views/template.html",
            controller: 'DetailSponsorCtrl'
        })
        // sponsor card
        .state('sponsorcard', {
            url: "/sponsorcard",
            templateUrl: "views/template.html",
            controller: 'SponsorCardCtrl'
        })
        // detail sponsor card
        .state('detail-sponsorcard', {
            url: "/detail-sponsorcard/:id",
            templateUrl: "views/template.html",
            controller: 'DetailSponsorCardCtrl'
        })
        // special award banner
        .state('specialaward-banner', {
            url: "/specialaward-banner",
            templateUrl: "views/template.html",
            controller: 'SpecialAwardBannerCtrl'
        })
        // detail special award banner
        .state('detailspecialaward-banner', {
            url: "/detailspecialaward-banner/:id",
            templateUrl: "views/template.html",
            controller: 'DetailSpecialAwardBannerCtrl'
        })
        // special award
        .state('specialaward', {
            url: "/specialaward",
            templateUrl: "views/template.html",
            controller: 'SpecialAwardCtrl'
        })
        // detail special award
        .state('detailspecialaward', {
            url: "/detailspecialaward/:id",
            templateUrl: "views/template.html",
            controller: 'DetailSpecialAwardCtrl'
        })
        // special award detail
        .state('specialaward-detail', {
            url: "/specialaward-detail",
            templateUrl: "views/template.html",
            controller: 'SpecialAwardDetailCtrl'
        })
        // DETAIL special award detil
        .state('detailawardspecial', {
            url: "/detailawardspecial/:id",
            templateUrl: "views/template.html",
            controller: 'DetailAwardSpecialCtrl'
        })
        // Rising award
        .state('risingstar', {
            url: "/risingstar",
            templateUrl: "views/template.html",
            controller: 'RisingCtrl'
        })
        // Detail Rising
        .state('detail-rising', {
            url: "/detail-rising/:id",
            templateUrl: "views/template.html",
            controller: 'DetailRisingCtrl'
        })
        // Detail schedule
        .state('detail-championschedule', {
            url: "/detail-championschedule/:id",
            templateUrl: "views/template.html",
            controller: 'DetailScheduleCtrl'
        })
        .state('championschedule', {
            url: "/championschedule",
            templateUrl: "views/template.html",
            controller: 'ChampionScheduleCtrl'
        })
        //additional payment
        .state('additional-payment', {
            url: "/additional-payment",
            templateUrl: "views/template.html",
            controller: 'AdditionalPaymentCtrl'
        })
        //detail additional payment
        .state('detailadditionalpayment', {
            url: "/detailadditionalpayment/:id",
            templateUrl: "views/template.html",
            controller: 'DetailAdditionalPaymentCtrl'
        })
        // ARCHIVE
        .state('archive', {
            url: "/archive",
            templateUrl: "views/template.html",
            controller: 'ArchiveCtrl'
        })
        .state('detailarchive', {
            url: "/detailarchive/:id",
            templateUrl: "views/template.html",
            controller: 'DetailArchiveCtrl'
        })
        // HIGHLIGHTS VIDEO
        .state('highlight-video', {
            url: "/highlight-video",
            templateUrl: "views/template.html",
            controller: 'HighlightvideoCtrl'
        })
        .state('detailhighlights', {
            url: "/detailhighlights/:id",
            templateUrl: "views/template.html",
            controller: 'DetailHighlightCtrl'
        })

        // **********************PLAYER REGISTORION ********************
        .state('registorcontent', {
            url: "/registorcontent",
            templateUrl: "views/template.html",
            controller: 'RegistorContentCtrl'
        })
        .state('detailregistorcontent', {
            url: "/detailregistorcontent/:id",
            templateUrl: "views/template.html",
            controller: 'DetailRegistorContentCtrl'
        })
        .state('testimonial', {
            url: "/testimonial",
            templateUrl: "views/template.html",
            controller: 'TestimonialCtrl'
        })
        .state('detailtestimonial', {
            url: "/detailtestimonial/:id",
            templateUrl: "views/template.html",
            controller: 'DetailTestimonialCtrl'
        })
        .state('playerquestion', {
            url: "/playerquestion",
            templateUrl: "views/template.html",
            controller: 'PlayerQuestionCtrl'
        })
        .state('detailplayerquestion', {
            url: "/detailplayerquestion/:id",
            templateUrl: "views/template.html",
            controller: 'DetailPlayerQuestionCtrl'
        })


        // **********************PLAYER REGISTORION END ********************

        // *******************PACKAGE START******************************
        .state('package', {
            url: "/package",
            templateUrl: "views/template.html",
            controller: 'PackageCtrl'
        })
        .state('detailpackage', {
            url: "/detailpackage/:id",
            templateUrl: "views/template.html",
            controller: 'DetailPackageCtrl'
        })
        .state('featurepackage', {
            url: "/featurepackage",
            templateUrl: "views/template.html",
            controller: 'featurePackageCtrl'
        })
        .state('detailfeature', {
            url: "/detailfeature/:id",
            templateUrl: "views/template.html",
            controller: 'detailFeatureCtrl'
        })
        .state('couponcode', {
            url: "/couponcode",
            templateUrl: "views/template.html",
            controller: 'CouponCtrl'
        })
        .state('detailcouponcode', {
            url: "/detailcouponcode/:id",
            templateUrl: "views/template.html",
            controller: 'detailCouponCtrl'
        })
        // *******************PACKAGE END******************************

        // *******************ACOUNT **********************************
        .state('athleteaccount', {
            url: "/athleteaccount",
            templateUrl: "views/template.html",
            controller: 'athleteAccountCtrl'
        })
        .state('schoolaccount', {
            url: "/schoolaccount",
            templateUrl: "views/template.html",
            controller: 'schoolAccountCtrl'
        })
        // *******************ACOUNT END********************************** 
        .state('jagz', {
            url: "/jagz",
            templateUrl: "views/jagz.html",
            controller: 'JagzCtrl'
        })

        .state('loginapp', {
            url: "/login/:id",
            templateUrl: "views/login.html",
            controller: 'LoginCtrl'
        })


    $urlRouterProvider.otherwise("/dashboard");
    $locationProvider.html5Mode(isproduction);
});

myApp.config(function ($translateProvider) {
    $translateProvider.translations('en', LanguageEnglish);
    $translateProvider.translations('hi', LanguageHindi);
    $translateProvider.preferredLanguage('en');
});