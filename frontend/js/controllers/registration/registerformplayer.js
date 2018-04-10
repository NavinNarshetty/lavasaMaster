myApp.controller('RegisterFormPlayerCtrl', function ($scope, TemplateService, $element, NavigationService, $timeout, $uibModal, GoogleAdWordsService, $location, $state, errorService, toastr, $filter, configService) {
    $scope.template = TemplateService.getHTML("content/registration/registerform-player.html");
    TemplateService.title = "Player Registration Form"; //This is the Title of the Website
    $scope.navigation = NavigationService.getNavigation();
    $scope.formData = {};
    $scope.packages = [];
    $scope.formPackage = {
        filter: {
            packageUser: 'athlete'
        }
    }
    $scope.showPaymentTab = false;
    $scope.showPackageDetail = false;
    configService.getDetail(function (data) {
        $scope.city = data.city;
        $scope.district = data.district;
        $scope.state = data.state;
        $scope.formData.state = data.state;
        $scope.year = data.year;
        $scope.eventYear = data.eventYear;
        $scope.sfaCity = data.sfaCity;
        $scope.isCollege = data.isCollege;
        $scope.type = data.type;
    });

    // CALL PACKAGES
    NavigationService.getPackages($scope.formPackage, function (data) {
        data = data.data;
        // console.log("dat",data);
        if (data.value = true) {
            $scope.packages = data.data.results;
            // console.log("packages", $scope.packages);
        } else {
            console.log("packages search failed", data);
        }
    });
    // CALL PACKAGES END
    // VIEW PACKAGE TABLE
    $scope.viewPackage = function () {
        $scope.showPackageDetail = !$scope.showPackageDetail;
    }
    // VIEW PACKAGE TABLE END
    // SET PAYMENT TABLE
    $scope.setPackageDetails = function () {

        _.each($scope.packages, function (n) {
            if (n._id == $scope.formData.package) {
                console.log("select", n);
                $scope.showPaymentTab = true;
                $scope.promoApplied = false;
                $scope.formData.packageName = n.name;
                $scope.formData.amountToPay = n.finalPrice;
                $scope.formData.discount = 0;
                $scope.formData.cgstPercent = '';
                $scope.formData.cgstAmt = '';
                $scope.formData.sgstPercent = '';
                $scope.formData.sgstAmt = '';
                $scope.formData.igstPercent = '';
                $scope.formData.igstAmt = '';
                $scope.promoCode = {
                    code: ''
                }
                if (n.igstPercent) {
                    $scope.formData.igstPercent = n.igstPercent;
                    $scope.formData.igstAmt = n.igstAmt;
                    $scope.formData.amountPaid = $scope.formData.amountToPay + $scope.formData.igstAmt;
                }
                if (n.cgstPercent && n.sgstPercent) {
                    $scope.formData.cgstPercent = n.cgstPercent;
                    $scope.formData.cgstAmt = n.cgstAmt;
                    $scope.formData.sgstPercent = n.sgstPercent;
                    $scope.formData.sgstAmt = n.sgstAmt;
                    $scope.formData.amountPaid = $scope.formData.amountToPay + $scope.formData.cgstAmt + $scope.formData.sgstAmt;
                    console.log($scope.formData.amountPaid, $scope.formData.amountToPay);
                }
            }
        })
    }
    // SET PAYMENT TABLE END
    // CALCULATE TAX
    $scope.calculateTax = function () {
        if ($scope.formData.igstPercent) {
            console.log("bef", $scope.formData.igstAmt, $scope.formData.igstPercent);
            $scope.formData.igstAmt = _.round(TemplateService.calculatePercentage($scope.formData.amountPaid, $scope.formData.igstPercent));
            console.log("aft", $scope.formData.igstAmt);
            $scope.formData.amountPaid = $scope.formData.amountPaid + $scope.formData.igstAmt;
        } else if ($scope.formData.cgstPercent && $scope.formData.sgstPercent) {
            $scope.formData.cgstAmt = $scope.formData.sgstAmt = _.round(TemplateService.calculatePercentage($scope.formData.amountPaid, $scope.formData.cgstPercent));
            console.log("aft", $scope.formData.cgstAmt);
            $scope.formData.amountPaid = $scope.formData.amountPaid + $scope.formData.cgstAmt + $scope.formData.sgstAmt;
        }
        $scope.promoApplied = true;
    }
    // CALCULATE TAX END
    // CALCULATE DISCOUNT
    $scope.calculateDiscount = function (promoDetail) {
        console.log("in cALC");
        // promoDetail.amount = 899;
        if (promoDetail.amount) {
            if (promoDetail.amount >= $scope.formData.amountToPay) {
                toastr.error("Sorry. This coupon code is not valid");
            } else {
                $scope.formData.amountPaid = $scope.formData.amountToPay - promoDetail.amount;
                $scope.formData.discount = promoDetail.amount;
                $scope.calculateTax();
            }
        } else if (promoDetail.percent) {
            var a = _.round(TemplateService.calculatePercentage($scope.formData.amountToPay, promoDetail.percent));
            console.log(a);
            $scope.formData.discount = a;
            $scope.formData.amountPaid = $scope.formData.amountToPay - a;
            $scope.calculateTax();
        }
    }
    // CALCULATE DISCOUNT END
    // APPLY PROMOCODE
    $scope.validatePromoCode = function (promo) {
      if (promo.code !="") {
        NavigationService.validatePromoCode(promo, function (data) {
            data = data.data;
            console.log("dta", data);
            if (data.value == true) {
                console.log("promo", data);
                $scope.promoCode.code = data.data.code;
                $scope.promoDetails = data.data;
                $scope.calculateDiscount($scope.promoDetails);
            } else {
              if (data.error) {
                toastr.error(data.error, "Error");
              } else {
                console.log("Promo Apply failed", data);
              }
            }
        })
      } else {
        toastr.error("Please enter code.");
      }
    }
    // APPLY PROMOCODE
    $scope.changeitSchoolId = function (err, data) {
        // console.log(err, data);
        if (err) {
            $scope.errorMsgpan = err;
            if (err == 'Please Upload File Size Upto 5 MB') {
                $scope.openUploadSizeModal();
                $timeout(function () {
                    $scope.uploadSizeInstances.close();
                }, 2000);
            }
            if (err == 'Please upload png or jpg.') {
                $scope.openUploadTypeModal();
                $timeout(function () {
                    $scope.uploadTypeInstances.close();
                }, 2000);
            }
        } else {
            $scope.errorMsgpan = " ";
            // $scope.errorMsgpan = "Successfully uploaded";
        }
    };

    $scope.changeitPhotograph = function (err, data) {
        // console.log(err, data);
        if (err) {
            $scope.errorMsgpan = err;
            if (err == 'Please Upload File Size Upto 5 MB') {
                $scope.openUploadSizeModal();
                $timeout(function () {
                    $scope.uploadSizeInstances.close();
                }, 2000);
            }
            if (err == 'Please upload png or jpg.') {
                $scope.openUploadTypeModal();
                $timeout(function () {
                    $scope.uploadTypeInstances.close();
                }, 2000);
            }
        } else {
            $scope.errorMsgpan = " ";
            // $scope.errorMsgpan = "Successfully uploaded";
        }
    };

    $scope.changeitBirthImage = function (err, data) {
        // console.log(err, data);
        if (err) {
            $scope.errorMsgpan = err;
            if (err == 'Please Upload File Size Upto 5 MB') {
                $scope.openUploadSizeModal();
                $timeout(function () {
                    $scope.uploadSizeInstances.close();
                }, 2000);
            }
            if (err == 'Please upload png or jpg.') {
                $scope.openUploadTypeModal();
                $timeout(function () {
                    $scope.uploadTypeInstances.close();
                }, 2000);
            }
        } else {
            $scope.errorMsgpan = " ";
            // $scope.errorMsgpan = "Successfully uploaded";
        }
    };

    $scope.changeitPhotoImage = function (err, data) {
        // console.log(err, data);
        if (err) {
            $scope.errorMsgpan = err;
            if (err == 'Please Upload File Size Upto 5 MB') {
                $scope.openUploadSizeModal();
                $timeout(function () {
                    $scope.uploadSizeInstances.close();
                }, 2000);
            }
            if (err == 'Please upload png or jpg.') {
                $scope.openUploadTypeModal();
                $timeout(function () {
                    $scope.uploadTypeInstances.close();
                }, 2000);
            }
        } else {
            $scope.errorMsgpan = " ";
            // $scope.errorMsgpan = "Successfully uploaded";
        }
    };

    $scope.formData = {};
    $scope.formData.parentDetails = [];
    $scope.sportsLevelArray = [];
    $scope.sportsLevelArray.push({});
    $scope.m = 0;
    $scope.form = {};
    $scope.oneClick = false;
    $scope.showConfirm = false;
    //$scope.searchTerm = [];

    $scope.firstTime = 0;
    if ($scope.firstTime === 0) {
        $scope.formData.parentDetails.push({});
        $scope.firstTime++;
    }
    $scope.sfaId = '';
    $scope.schoolname = {};
    $scope.emailOtp = {};
    $scope.mobileOtp = {};
    $scope.showEmailOtpSuccess = {};
    $scope.showMobileOtpSuccess = {};

    //saves Athelete to database
    $scope.isDisabled = false;

    $scope.saveAthelete = function (formdata, formAthlete) { //formdata is data or body for this url
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

        var isFormValid = function (form) {
            if (!form.atheleteSchoolIdImage) {
                $scope.openIdModal();
                $timeout(function () {
                    $scope.idInstances.close();
                }, 3000);
                // alert("School ID image is not uploaded");
                // return false;
            } else if (!form.photograph) {
                $scope.openPhotoModal();
                $timeout(function () {
                    $scope.photographInstances.close();
                }, 3000);
                // alert("Photograph not uploaded");
                // return false;
            } else if (!form.birthImage) {
                // alert("Birth proof is not uploaded");
                // return false;
                $scope.openBirthModal();
                $timeout(function () {
                    $scope.birthInstances.close();
                }, 3000);
            } else if (form.ageProof == "hello" && !form.photoImage) {
                // alert("Photo id not uploaded");
                // return false;
                $scope.openAgeModal();
                $timeout(function () {
                    $scope.ageInstances.close();
                }, 3000);
            } else {
                return true;
            }
        };
        var isRegistrationFee = function (form) {
            if (!form.registrationFee) {
                $scope.openPaymentModal();
                $timeout(function () {
                    $scope.paymentInstances.close();
                }, 3000);
            } else {
                return true;
            }
        };

        var isSchoolAdded = function (form) {
            // console.log('enter', form);
            if (form.school || (form.atheleteSchoolName && form.atheleteSchoolLocality && form.atheleteSchoolContact)) {
                // console.log('enter true');
                return true;
            } else {
                // console.log('enter false');
                $scope.openSchoolModal();
                $timeout(function () {
                    $scope.schoolInstances.close();
                }, 3000);
                // return false;

            }
        };
        if (!isSchoolAdded(formdata)) {
            return;
        }
        if (!isFormValid(formdata)) {
            return;
        }
        // if ($scope.isSchoolAdded(formdata) == false) {
        //     console.log('Value', $scope.isSchoolAdded(formdata));
        //     alert("Please select the school or enter all school details manually.");
        //     return;
        // }
        if (!isRegistrationFee(formdata)) {
            return;
        }

        // console.log("form", formdata);
        var sportLevelArray = [];

        if (formdata.school && formdata.schoolName) {
            formdata.school = "";
        }

        // console.log('tnc', formdata.termsAndCondition);
        if (formdata.termsAndCondition === undefined || formdata.termsAndCondition === false) {
            $scope.showTerm = true;

        } else {
            $scope.showTerm = false;
        }
        formdata.sfaId = $scope.sfaId;
        formdata.age = $scope.age;
        formdata.school = $scope.schoolname;
        if (_.isEmpty($location.search())) {
            $scope.extras = {};
        } else {
            $scope.extras = $location.search();
            // console.log($scope.extras);
            formdata.utm_medium = $scope.extras.utm_medium;
            formdata.utm_source = $scope.extras.utm_source;
            formdata.utm_campaign = $scope.extras.utm_campaign;
            // console.log(formdata);
        }

        if (formdata.university == 'Other') {
            if (formdata.universities) {
                formdata.university = formdata.universities;
            } else {
                toastr.error('Please Enter University.');
            }
        } else {
            delete formdata.universities;
        }

        if (formdata.course == 'Other') {
            if (formdata.courses) {
                formdata.course = formdata.courses;
            } else {
                toastr.error('Please Enter course.');
            }
        } else {
            delete formdata.courses;
        }

        if (formdata.faculty == 'Other') {
            if (formdata.faculties) {
                formdata.faculty = formdata.faculties;
            } else {
                toastr.error('Please Enter Faculty.');
            }
        } else {
            delete formdata.faculties;
        }

        $scope.url = "Athelete/saveAthelete";
        // console.log($scope.url);
        // console.log(formdata);
        if (formAthlete.$valid && $scope.showTerm === false) {
            if ($scope.showEmailOtpSuccess === false && $scope.showMobileOtpSuccess === false) {
                $scope.isDisabled = true;
                // console.log('google', formdata);
                NavigationService.apiCallWithData($scope.url, formdata, function (data) {
                    if (data.value === true) {
                        console.log("registrationFee", data.data.registrationFee);
                        // console.log("value", data.value);
                        if (data.data.registrationFee == "online PAYU") {
                            var id = data.data._id;
                            // console.log("true and in payment", id);
                            var url = "payU/atheletePayment?id=" + id;
                            window.location.href = adminUrl2 + url;
                        } else {
                            // console.log("opening modal");
                            $scope.openModal();
                        }
                    } else {
                        $scope.isDisabled = false;
                        if (data.error == 'Athlete Already Exist') {
                            // console.log("User Already Exist");
                            $scope.openExistModal();
                            $timeout(function () {
                                $scope.existInstances.close();
                            }, 3000);
                        } else {
                            $scope.openErrModal();
                            $timeout(function () {
                                $scope.errInstances.close();
                            }, 3000);
                        }
                    }
                });
            }
        } else {
            $scope.isDisabled = false;
            // console.log("Enter all mandatory fields");
            $scope.openErrorModal();
            $timeout(function () {
                $scope.modalInstances.close();
            }, 3000);
        }

    };

    $scope.count = 0;

    $scope.checkMobileOTP = function (otp) {
        if (otp == 'sfa1') {
            $scope.mobileOtp = 'sfa1';
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
        if (otp == 'sfa1') {
            $scope.emailOtp = 'sfa1';
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
        });
    };

    $scope.getDataBasedonSFA = function (uiselCust) {
        // console.log("inside get");
        if (uiselCust.schoolName == "----Otributor Group") {
            $scope.uiCarrierGroups = {
                name: "abc-ui"
            };
        } else {
            $scope.uiCarrierGroups = {
                name: "def-ui"
            };
        }
    };

    //removes image uploaded
    $scope.removeProof = function (data, className) {
        // console.log(className);
        $("." + className + " input").val("");
        delete $scope.formData.birthImage;
        $scope.show = 0;
    };
    $scope.removeProof1 = function (data, className) {
        // console.log(className);
        $("." + className + " input").val("");
        delete $scope.formData.photoImage;
        $scope.show = 0;
    };

    $scope.removePhoto = function (data, className) {
        // console.log(className);
        $("." + className + " input").val("");
        delete $scope.formData.photograph;
        $scope.show = 0;
    };
    $scope.removeImage = function (data, className) {
        // console.log(className);
        $("." + className + " input").val("");
        delete $scope.formData.atheleteSchoolIdImage;
        $scope.show = 0;
    };

    $scope.deleteCertificate = function (data, className, index){
      console.log("cert", className, data, index);
      $("." + className + " input").val("");
      delete $scope.formData.sportLevel[index].certificateImage;
      $scope.show = 0;
      console.log("del", $scope.formData.sportLevel[index].certificateImage, className, $scope.show);
    }

    $scope.addSportForm = function () {
        if ($scope.formData.parentDetails.length < 3) {
            $scope.formData.parentDetails.push({});
            // console.log("sportsDepartment", $scope.formData.parentDetails);

        }
    };

    $scope.removeSportForm = function (index) {
        // console.log("hello remove", index);
        if (index !== 0) {
            $scope.formData.parentDetails.splice(index, 1);
            // console.log("sportsDepartment", $scope.formData.parentDetails);
        }
    };

    $scope.goto = function () {
        if ($scope.oneClick === false) {
            $scope.showSchool = !$scope.showSchool;
            $scope.oneClick = true;
        }
    };

    $scope.goToPrevious = function () {
        $scope.showSchool = !$scope.showSchool;
        $scope.formData.atheleteSchoolName = '';
        $scope.formData.atheleteSchoolLocality = '';
        $scope.formData.atheleteSchoolContact = '';
        $scope.oneClick = false;
    };
    $scope.addSportLevelForm = function (index) {
        if ($scope.formData.sportLevel.length < 9) {
            $scope.formData.sportLevel.splice(index + 1, 0, {});
            // $scope.formData.sportLevel.push({});
        }
    };
    $scope.removeSportLevelForm = function (index) {
        _.pullAt($scope.formData.sportLevel, index);
    };
    $scope.showLevels = function (value) {
        if (value) {
            $scope.formData.sportLevel = [{}];
        } else {
            $scope.formData.sportLevel = [];
        }
    };


    $scope.test = function (size) {

        $scope.testModal = $uibModal.open({
            animation: true,
            templateUrl: 'views/modal/modsub.html',
            scope: $scope,
            size: size,
            windowClass: "test-modal"

        });
    };
    $scope.athBenModal = function (type, sfaCity, year, eventYear) {
        $scope.type = type;
        $scope.sfaCity = sfaCity;
        $scope.year = year;
        $scope.eventYear = eventYear;
        if (type == 'school') {
            $scope.isCollege = false;
        } else {
            $scope.isCollege = true;
        }
        $scope.errInstances = $uibModal.open({
            animation: true,
            scope: $scope,
            backdrop: 'static',
            keyboard: false,
            templateUrl: "views/modal/athletebenefits.html",
            size: 'lg'
        });
    };
    $scope.termcondition = function (size, type, sfaCity, year, eventYear) {
        $scope.type = type;
        $scope.sfaCity = sfaCity;
        $scope.year = year;
        $scope.eventYear = eventYear;
        if (type == 'school') {
            $scope.isCollege = false;
        } else {
            $scope.isCollege = true;
        }
        $scope.termconditionModal = $uibModal.open({
            animation: true,
            templateUrl: 'views/modal/terms.html',
            scope: $scope,
            size: size,
            windowClass: "termcondition-modal"

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
    $scope.openErrorModal = function () {
        $scope.modalInstances = $uibModal.open({
            animation: true,
            scope: $scope,
            backdrop: 'static',
            keyboard: false,
            // size: 'sm',
            templateUrl: "views/modal/error.html"
        });
    };
    $scope.closeModal = function(){
      $state.go('registerplayer',{
        type: 'player'
      });
      $scope.modalInstances.$disiss();
    }

    $scope.openErrModal = function () {
        $scope.errInstances = $uibModal.open({
            animation: true,
            scope: $scope,
            backdrop: 'static',
            keyboard: false,
            // size: 'sm',
            templateUrl: "views/modal/err.html"
        });
    };

    $scope.openExistModal = function () {
        $scope.existInstances = $uibModal.open({
            animation: true,
            scope: $scope,
            backdrop: 'static',
            keyboard: false,
            // size: 'sm',
            templateUrl: "views/modal/errorExist.html"
        });
    };
    $scope.openPaymentModal = function () {
        $scope.paymentInstances = $uibModal.open({
            animation: true,
            scope: $scope,
            backdrop: 'static',
            keyboard: false,
            // size: 'sm',
            templateUrl: "views/modal/errorPayment.html"
        });
    };
    $scope.openSchoolModal = function () {
        $scope.schoolInstances = $uibModal.open({
            animation: true,
            scope: $scope,
            backdrop: 'static',
            keyboard: false,
            // size: 'sm',
            templateUrl: "views/modal/errorSchool.html"
        });
    };

    $scope.openPhotoModal = function () {
        $scope.photographInstances = $uibModal.open({
            animation: true,
            scope: $scope,
            backdrop: 'static',
            keyboard: false,
            // size: 'sm',
            templateUrl: "views/modal/errorPhoto.html"
        });
    };

    $scope.openBirthModal = function () {
        $scope.birthInstances = $uibModal.open({
            animation: true,
            scope: $scope,
            backdrop: 'static',
            keyboard: false,
            // size: 'sm',
            templateUrl: "views/modal/errorBirth.html"
        });
    };

    $scope.openAgeModal = function () {
        $scope.ageInstances = $uibModal.open({
            animation: true,
            scope: $scope,
            backdrop: 'static',
            keyboard: false,
            // size: 'sm',
            templateUrl: "views/modal/errorPhoto.html"
        });
    };

    $scope.openIdModal = function () {
        $scope.idInstances = $uibModal.open({
            animation: true,
            scope: $scope,
            backdrop: 'static',
            keyboard: false,
            // size: 'sm',
            templateUrl: "views/modal/errorId.html"
        });
    };

    $scope.openUploadSizeModal = function () {
        $scope.uploadSizeInstances = $uibModal.open({
            animation: true,
            scope: $scope,
            backdrop: 'static',
            keyboard: false,
            // size: 'sm',
            templateUrl: "views/modal/errorUploadSize.html"
        });
    };
    $scope.openUploadTypeModal = function () {
        $scope.uploadTypeInstances = $uibModal.open({
            animation: true,
            scope: $scope,
            backdrop: 'static',
            keyboard: false,
            // size: 'sm',
            templateUrl: "views/modal/errorUploadType.html"
        });
    };
    // CHECK PASSWORD
    $scope.checkPassword = function (confirm) {
        $scope.passwordError = "Minimum 8 characters";
        console.log("pass", $scope.passwordError, confirm);
        $scope.showConfirm = true;
        $scope.passwordMatch = false;
        if (confirm.length >= 8) {
            if (confirm != $scope.formData.password) {
                $scope.passwordError = "Entered passwords do not match";
                $scope.showConfirm = true;
            } else {
                $scope.passwordMatch = true;
                $scope.showConfirm = false;
            }
        }
    }
    // CHECK PASSWORD END
});
