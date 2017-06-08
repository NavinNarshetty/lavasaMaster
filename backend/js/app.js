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
            url: "/detail-sports-list-subcat",
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
            url: "/detail-sports-list-cat",
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
            url: "/detail-sports-list",
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
        .state('login', {
            url: "/login",
            templateUrl: "views/login.html",
            controller: 'LoginCtrl'
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

        .state('loginapp', {
            url: "/login/:id",
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
            url: "/excel-upload/:model",
            templateUrl: "views/template.html",
            controller: 'ExcelUploadCtrl'
        })

        .state('jagz', {
            url: "/jagz",
            templateUrl: "views/jagz.html",
            controller: 'JagzCtrl'
        });

    $urlRouterProvider.otherwise("/dashboard");
    $locationProvider.html5Mode(isproduction);
});
myApp.directive('inputDate', function ($compile, $parse) {
    return {
        restrict: 'E',
        replace: false,
        scope: {
            value: "=ngModel",
        },
        templateUrl: 'views/directive/date.html',
        link: function ($scope, element, attrs) {
            console.log("This is loaded atlease");
            $scope.data = {};
            console.log($scope.value);
            $scope.dateOptions = {
                dateFormat: "dd/mm/yy",
                changeYear: true,
                changeMonth: true,
                yearRange: "1900:-0"
            };
            if (!_.isEmpty($scope.value)) {
                $scope.data.dob = moment($scope.value).toDate();
            }
            $scope.changeDate = function (data) {
                console.log("ChangeDate Called");
                $scope.value = $scope.data.dob;
            };
        }
    };
})

myApp.config(function ($translateProvider) {
    $translateProvider.translations('en', LanguageEnglish);
    $translateProvider.translations('hi', LanguageHindi);
    $translateProvider.preferredLanguage('en');
});