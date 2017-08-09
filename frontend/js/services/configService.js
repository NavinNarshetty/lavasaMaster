myApp.service('configService', function ($http, TemplateService, $state, toastr, NavigationService, errorService) {
    this.getDetail = function (callback) {
        $http({
            url: adminUrl2 + 'ConfigProperty/getDetail',
            method: 'POST',
        }).then(function (data) {
            var all = {};
            errorService.errorCode(data, function (allData, callback) {
                if (!allData.message) {
                    if (allData.value === true) {
                        all.city = allData.data.city;
                        all.district = allData.data.district;
                        all.state = allData.data.state;
                        all.year = allData.data.year;
                        all.sfaCity = allData.data.sfaCity;
                        if (allData.data.type == 'school') {
                            all.isCollege = false;
                            all.type = allData.data.type;
                            // callback(allData.data);
                        } else {
                            all.isCollege = true;
                            all.type = allData.data.type;
                        }
                    }
                } else {
                    toastr.error(allData.message, 'Error Message');
                }
            });
            callback(all);
        });
    };
});

// var globalLinkSchool = schoolLink + "formregis";
// var globalLinkSchoolAthlete = schoolLink + "formathlete";
// var globalLinkCollege = collegeLink + "formregis";
// var globalLinkCollegeAthlete = collegeLink + "formathlete";
// var globalLinkSchoolSportsRegistration = schoolLink + "sports-registration";
// var globalLinkCollegeSportsRegistration = collegeLink + "sports-registration";
/// STATIC VALUES ///
// var globalLinkSchool = "http://sfa5.wohlig.co.in/formregis";
// var globalLinkSchoolAthlete = "http://sfa5.wohlig.co.in/formathlete";
// var globalLinkCollege = "http://testmumbaicollege.sfanow.in/formregis";
// var globalLinkCollegeAthlete = "http://testmumbaicollege.sfanow.in/formathlete";
// var globalLinkSchoolSportsRegistration = "http://sfa5.wohlig.co.in/sports-registration";
// var globalLinkCollegeSportsRegistration = "http://testmumbaicollege.sfanow.in/sports-registration";

// console.log($scope.helloSample);
// console.log(configService);
// NavigationService.getDetail(function (data) {
//     errorService.errorCode(data, function (allData) {
//         console.log(allData);
//         if (!allData.message) {
//             if (allData.value === true) {
//                 $scope.city = allData.data.city;
//                 $scope.district = allData.data.district;
//                 $scope.state = allData.data.state;
//                 $scope.year = allData.data.year;
//                 $scope.sfaCity = allData.data.sfaCity;
//                 if (allData.data.type == 'school') {
//                     $scope.isCollege = false;
//                     $scope.type = allData.data.type;
//                     // $scope.registrationLink = globalLinkSchool;
//                     // $scope.athleteLink = globalLinkSchoolAthlete;
//                     // $scope.sportsRegistrationLink = globalLinkSchoolSportsRegistration;
//                 } else {
//                     $scope.isCollege = true;
//                     $scope.type = allData.data.type;
//                     // $scope.registrationLink = globalLinkCollege;
//                     // $scope.athleteLink = globalLinkCollegeAthlete;
//                     // $scope.sportsRegistrationLink = globalLinkCollegeSportsRegistration;
//                 }
//             }
//         } else {
//             toastr.error(allData.message, 'Error Message');
//         }
//     });
// });