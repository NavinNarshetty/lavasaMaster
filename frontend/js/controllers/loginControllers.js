myApp.controller('SportsRegistrationCtrl', function ($scope, selectService, TemplateService, loginService, NavigationService, $timeout, toastr, $state, $rootScope, errorService, configService, $uibModal) {
    $scope.template = TemplateService.getHTML("content/sports-registration.html");
    TemplateService.title = "Sports Registration";
    $scope.navigation = NavigationService.getNavigation();
    configService.getDetail(function (data) {
        $scope.state = data.state;
        $scope.year = data.year;
        $scope.eventYear = data.eventYear;
        $scope.sfaCity = data.sfaCity;
        $scope.isCollege = data.isCollege;
        $scope.type = data.type;
    });
    $scope.formData = {};
    if ($.jStorage.get("userType") === null) {
        NavigationService.setUserType("athlete");
    }
    if ($.jStorage.get("userDetails") !== null) {
        $state.go('sports-selection');
    }
    if ($.jStorage.get("userType") !== null) {
        if ($.jStorage.get("userType") == "athlete") {
            $scope.formData.type = "athlete";
            $scope.ath = true;
            $scope.sch = false;
        } else {
            $scope.formData.type = "school";
            $scope.ath = false;
            $scope.sch = true;
        }
    }
    $scope.classa = 'active-list';
    $scope.classb = '';
    $scope.tabchange = function (data) {
        if (data == 1) {
            $scope.ath = true;
            $scope.sch = false;
            $scope.formData.type = "athlete";
            if ($scope.formData.type) {
                NavigationService.setUserType($scope.formData.type);
            }
        } else {
            $scope.ath = false;
            $scope.sch = true;
            $scope.formData.type = "school";
            if ($scope.formData.type) {
                NavigationService.setUserType($scope.formData.type);
            }
        }

    };


    $scope.login = function (formData, formSports) {
        $scope.yourPromise = NavigationService.success().then(function () {
            if (formSports.$valid) {
                if (formData) {
                    formData.type = $.jStorage.get("userType");
                    if (formData.sfaid) {
                        if ($scope.type == 'school') {
                            // console.log('enter school');
                            if (formData.sfaid.charAt(1) == "S" && formData.type == "athlete") {
                                toastr.error('Only Athlete Can Log In.', 'Login Message');
                            } else {
                                if (formData.sfaid.charAt(1) == "A" && formData.type == "school") {
                                    toastr.error('Only School Can Log In.', 'Login Message');
                                } else {
                                    if (formData.sfaid.charAt(1) == "C" && formData.type == "school") {
                                        toastr.error('Only School Can Log In.', 'Login Message');
                                    }
                                }
                            }
                            if (formData.sfaid.charAt(1) == "S" && formData.type == "school") {
                                $scope.loginFunction(formData);
                            } else {
                                if (formData.sfaid.charAt(1) == "A" && formData.type == "athlete") {
                                    $scope.loginFunction(formData);
                                }
                            }
                        } else {
                            // console.log('enter');
                            if (formData.sfaid.charAt(1) == "C" && formData.type == "athlete") {
                                toastr.error('Only Athlete Can Log In.', 'Login Message');
                            } else {
                                if (formData.sfaid.charAt(1) == "A" && formData.type == "school") {
                                    toastr.error('Only College Can Log In.', 'Login Message');
                                } else {
                                    if (formData.sfaid.charAt(1) == "S" && formData.type == "school") {
                                        toastr.error('Only College Can Log In.', 'Login Message');
                                    }
                                }
                            }
                            if (formData.sfaid.charAt(1) == "C" && formData.type == "school") {
                                $scope.loginFunction(formData);
                            } else {
                                if (formData.sfaid.charAt(1) == "A" && formData.type == "athlete") {
                                    $scope.loginFunction(formData);
                                }
                            }
                        }
                    }
                }
            } else {
                toastr.error('Please Enter All Fields.', 'Login Message');
            }
        });
    };

    $scope.loginFunction = function (formData) {
        NavigationService.login(formData, function (data) {
            errorService.errorCode(data, function (allData) {
                if (!allData.message) {
                    if (allData.value) {
                        NavigationService.setUser(allData.data);
                        toastr.success('Successfully Logged In.', 'Login Message');
                        $state.go('sports-selection');
                    } else {
                        toastr.error('Please Enter Valid SFA Id And Password.', 'Login Message');
                    }
                } else {
                    toastr.error(allData.message, 'Error Message');
                }
            });
        });
    };

    // FORGOT PASSWORD POPUP
    $scope.popForgot = function(){
      $uibModal.open({
        animation: true,
        scope: $scope,
        // backdrop: 'static',
        keyboard: false,
        templateUrl: 'views/modal/forgotpassword.html',
        // size: 'lg',
        windowClass: 'modal-forgotpassword'
      })
    }
    // FORGOT PASSWORD POPUP END
});

myApp.controller('ForgotPasswordCtrl', function ($scope, TemplateService, NavigationService, $timeout, toastr, $state, errorService, $filter, configService) {
    $scope.template = TemplateService.getHTML("content/forgot-password.html");
    TemplateService.title = "Forgot Password";
    $scope.navigation = NavigationService.getNavigation();
    configService.getDetail(function (data) {
        $scope.state = data.state;
        $scope.year = data.year;
        $scope.eventYear = data.eventYear;
        $scope.sfaCity = data.sfaCity;
        $scope.isCollege = data.isCollege;
        $scope.type = data.type;
    });
    $scope.formData = {};
    $scope.formData.type = $.jStorage.get("userType");
    $scope.typeFirst = $filter('firstcapitalize')($.jStorage.get("IsColg"));
    $scope.forgotPasswordFunction = function (formData, url) {
        NavigationService.forgotPassword(formData, url, function (data) {
            errorService.errorCode(data, function (allData) {
                if (!allData.message) {
                    if (allData.value) {
                        toastr.success('The Password Has Been Sent Successfully To Your Registered Email Id.', 'Forgot Password Message');
                        $state.go('sports-registration');
                    } else {
                        if (allData.error == "Incorrect Type") {
                            if ($scope.formData.type == 'athlete') {
                                toastr.error('Only Athlete Can Apply From Here For Forgot Password. Please Check You Are ' + $scope.typeFirst + ' Or Athlete, Please Try Again.', 'Forgot Password Message');
                            } else {
                                toastr.error('Only ' + $scope.typeFirst + ' Can Apply From Here For Forgot Password. Please Check You Are ' + $scope.typeFirst + ' Or Athlete, Please Try Again.', 'Forgot Password Message');
                            }
                        } else {
                            toastr.error('Please Try Again By Entering Valid  SFA Id And Email Id.', 'Forgot Password Message');
                        }
                    }
                } else {
                    toastr.error(allData.message, 'Error Message');
                }

            });
        });
    };

    $scope.forgotPassword = function (formData, formSports) {
        $scope.yourPromise = NavigationService.success().then(function () {
            if (formSports.$valid) {
                if (formData.type) {
                    if (formData.type == "school") {
                        $scope.typeUrl = 'login/forgotPasswordSchool';
                        $scope.forgotPasswordFunction(formData, $scope.typeUrl);
                    } else {
                        $scope.typeUrl = 'login/forgotPasswordAthlete';
                        $scope.forgotPasswordFunction(formData, $scope.typeUrl);
                    }
                }

            } else {
                toastr.error("Please Enter All Fields", 'Forgot Password Message');
            }
        });
    };

});

myApp.controller('ChangePasswordCtrl', function ($scope, TemplateService, NavigationService, $timeout, toastr, $state, errorService, loginService, configService) {
    $scope.template = TemplateService.getHTML("content/change-password.html");
    TemplateService.title = "Change Password";
    $scope.navigation = NavigationService.getNavigation();
    configService.getDetail(function (data) {
        $scope.state = data.state;
        $scope.year = data.year;
        $scope.eventYear = data.eventYear;
        $scope.sfaCity = data.sfaCity;
        $scope.isCollege = data.isCollege;
        $scope.type = data.type;
    });
    if ($.jStorage.get("userDetails") === null) {
        $state.go('sports-registration');
    }

    loginService.loginGet(function (data) {
        $scope.detail = data;
    });

    $scope.logoutCandidate = function () {
        loginService.logoutCandidate(function (data) {
            if (data.isLoggedIn === false) {
                toastr.success('Successfully Logged Out', 'Logout Message');
                $state.go('sports-registration');
            } else {
                toastr.error('Something went wrong', 'Logout Message');
            }
        });
    };
    $scope.data = {};
    $scope.formChange = {};

    $scope.changePassword = function (formSports, formChange) {
        $scope.yourPromise = NavigationService.success().then(function () {
            if (formSports.$valid) {
                if (formChange.password == formChange.confirmPassword) {
                    if ($.jStorage.get("userType") !== null) {
                        if ($.jStorage.get("userType") == "school") {
                            formChange.schoolToken = $.jStorage.get("userDetails").accessToken;
                        } else {
                            formChange.athleteToken = $.jStorage.get("userDetails").accessToken;
                        }
                        NavigationService.changePassword(formChange, function (data) {
                            errorService.errorCode(data, function (allData) {
                                if (!allData.message) {
                                    if (allData.value) {
                                        toastr.success("Password Is Sucessfully changed.", "Change Password Message");
                                        $timeout(function () {
                                            $state.go('sports-selection');
                                        }, 2000);
                                    } else {
                                        if (allData.error == "Incorrect Old Password") {
                                            toastr.error("Enter Valid Old Password.", "Change Password Message");
                                        } else {
                                            if (allData.error == "Password match or Same password exist") {
                                                toastr.error("The New Password is similar to the Old Password.", "Change Password Message");
                                            }
                                        }
                                    }
                                } else {
                                    toastr.error(allData.message, 'Error Message');
                                }
                            });
                        });
                    }
                } else {
                    toastr.error("New Password and Confirm Password Do Not Match.");
                }

            } else {
                toastr.error("Please Enter All Fields.", "Change Password Message");
            }
        });
    };

});
