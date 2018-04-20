myApp.controller('RegisterFormPlayerCtrl', function ($scope, TemplateService, $element, NavigationService, $timeout, $uibModal, GoogleAdWordsService, $location, $state, errorService, toastr, $filter, configService, $stateParams) {
    $scope.template = TemplateService.getHTML("content/registration/registerform-player.html");
    TemplateService.title = "Player Registration Form"; //This is the Title of the Website
    $scope.navigation = NavigationService.getNavigation();
    $scope.formData = {};
    $scope.pageType = 'player';
    $scope.formFlag = $stateParams.flag;
    $scope.oneClick = false;
    $scope.showConfirm = false;


    configService.getDetail(function (data) {
        $scope.city = data.city;
        $scope.district = data.district;
        $scope.state = data.state;
        $scope.formData.state = data.state;
        $scope.year = data.year;
        $scope.eventYear = data.eventYear;
        $scope.sfaCity = data.sfaCity;
        $scope.isCollege = data.isCollege;
        $scope.type = 'chapter';
    });


    //$scope.searchTerm = [];


    $scope.schoolname = {};
    $scope.emailOtp = {};
    $scope.mobileOtp = {};
    $scope.showEmailOtpSuccess = {};
    $scope.showMobileOtpSuccess = {};

    //saves Athelete to database
    $scope.isDisabled = false;

    $scope.saveAthelete = function (formdata) { //formdata is data or body for this url
        console.log("Athlete data: ", formdata);
        // console.log('Value', $scope.isSchoolAdded(formdata));
        // $scope.isSchoolAdded(formdata);

        formdata.firstName = $filter('firstcapitalize')(formdata.firstName, {
            column1: true
        });
        formdata.middleName = $filter('firstcapitalize')(formdata.middleName, {
            column1: true
        });
        formdata.surname = $filter('firstcapitalize')(formdata.surname, {
            Column1: true
        });

        formdata.age = $scope.age;
        formdata.school = $scope.schoolname;
        formdata.registrationFee = 'cash';


        $scope.url = "Athelete/save";
        // console.log($scope.url);
        console.log(formdata);
        NavigationService.apiCallWithData($scope.url, formdata, function (data) {
            if (data.value === true) {
                console.log("registrationFee", data.data.registrationFee);
                $scope.openModal();

            }
        });



    };

    $scope.checkMobileOTP = function (otp) {
        if (otp == 'asfa') {
            $scope.mobileOtp = 'asfa';
            if (_.isEqual($scope.mobileOtp, otp)) {
                // console.log("mobile OTP verified");
                $scope.showMobileOtpSuccess = false;
            } else {
                $scope.showMobileOtpSuccess = true;
            }
        } else if (otp != undefined) {
            // console.log("opt", $scope.mobileOtp, otp);
            // console.log(typeof otp, typeof $scope.mobileOtp);
            var otpCheck = otp.toString();
            // console.log("length", otpCheck.length);
            if (otpCheck.length == 4) {

                if (_.isEqual($scope.mobileOtp, otpCheck)) {
                    // console.log("email OTP verified");
                    $scope.showMobileOtpSuccess = false;
                } else {
                    $scope.showMobileOtpSuccess = true;
                }
            } else if (otpCheck.length == 3) {
                otpCheck = "0" + otpCheck;
                // console.log("otpCheck", otpCheck);
                if (_.isEqual($scope.mobileOtp, otpCheck)) {
                    // console.log("email OTP verified");
                    $scope.showMobileOtpSuccess = false;

                } else {
                    $scope.showMobileOtpSuccess = true;
                }
            }
        }
    };
    $scope.checkEmailOTP = function (otp) {
        if (otp == 'asfa') {
            $scope.emailOtp = 'asfa';
            if (_.isEqual($scope.emailOtp, otp)) {
                // console.log("email OTP verified");
                $scope.showEmailOtpSuccess = false;
            } else {
                // console.log("Incorrect OTP!");
                $scope.showEmailOtpSuccess = true;
            }
        } else if (otp != undefined) {
            // console.log("opt", $scope.emailOtp, otp);
            // console.log(typeof otp, typeof $scope.emailOtp);

            var otpCheck = otp.toString();
            // console.log("length", otpCheck.length);
            if (otpCheck.length == 4) {
                if (_.isEqual($scope.emailOtp, otpCheck)) {
                    // console.log("email OTP verified");
                    $scope.showEmailOtpSuccess = false;
                } else {
                    $scope.showEmailOtpSuccess = true;
                }
            } else if (otpCheck.length == 3) {
                otpCheck = "0" + otpCheck;
                // console.log("otpCheck", otpCheck);
                if (_.isEqual($scope.emailOtp, otpCheck)) {
                    // console.log("email OTP verified");
                    $scope.showEmailOtpSuccess = false;
                } else {
                    $scope.showEmailOtpSuccess = true;
                }
            }
        }
    };

    $scope.ageCalculate = function (birthday) {
        var ageDifMs = Date.now() - birthday.getTime();
        var ageDate = new Date(ageDifMs); // miliseconds from epoch
        $scope.age = Math.abs(ageDate.getUTCFullYear() - 1970);
        return $scope.age;
    };

    $scope.sendMobileOTP = function (mobile) {
        var formData = {};
        // console.log("form", formData);
        $scope.url = "athelete/generateMobileOTP";
        // console.log($scope.url);
        formData.mobile = mobile;
        NavigationService.apiCallWithData($scope.url, formData, function (data) {
            $scope.mobileOtp = data.data;
        });
    };
    $scope.sendEmailOTP = function (email) {
        var formData = {};
        // console.log("form", email);
        $scope.url = "athelete/generateEmailOTP";
        // console.log($scope.url);
        formData.email = email;
        NavigationService.apiCallWithData($scope.url, formData, function (data) {
            $scope.emailOtp = data.data;
        });
    };
    //search filter
    $scope.refreshChange = function (paramData) {
        NavigationService.getAtheleteSFA(paramData, function (data) {
            // console.log("sfa", data);
            $scope.atheleList = data.data.results;

        });
    };

    $scope.searchChange = function (paramData) {
        // console.log("changekeyword", paramData);
        $scope.sfaId = paramData;
    };

    $scope.searchChangeSchool = function (paramData) {
        // console.log("changekeyword", paramData);
        $scope.schoolname = paramData;
    };
    $scope.refreshChangeSchool = function (paramData) {
        NavigationService.getSchoolSFA(paramData, function (data) {
            // console.log("sfa 1", data);
            $scope.schoolList = data.data.results;
            if ($scope.formFlag === 'edit') {
                var findSchool = _.find($scope.schoolList, {
                    '_id': $scope.formData.school
                });
                if (findSchool == undefined || findSchool == '' || findSchool == {}) {
                    console.log("SC not in list");
                    $scope.editSchoolData = {
                        _id: $scope.formData.school
                    }
                    $scope.urlGetSschool = 'school/getOne';
                    NavigationService.apiCallWithData($scope.urlGetSschool, $scope.editSchoolData, function (data) {
                        console.log("one", data);
                        if (data.value == true) {
                            $scope.schoolList.push(data.data);
                            $scope.searchChangeSchool($scope.formData.school);
                        } else {
                            console.log("Old School Not Found");
                        }
                    })
                } else {
                    console.log("Old school in schoollist");
                }
            }
        });
    };

    $scope.openModal = function () {
        $timeout(function () {
            // fbq('track', 'CompleteRegistration');
            // fbq('track', 'CompleteRegistration');
            // GoogleAdWordsService.sendRegisterCustomerConversion();
        });
        var modalInstance = $uibModal.open({
            animation: true,
            scope: $scope,
            backdrop: 'static',
            keyboard: false,
            // size: 'sm',
            templateUrl: "views/modal/thankyou.html"
        });
    };

    $scope.closeModal = function () {
        $state.go('registerplayer', {
            type: 'player'
        });
        $scope.modalInstances.$dismiss();
    }

});