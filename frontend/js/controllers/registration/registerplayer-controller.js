myApp.controller('RegisterPlayerCtrl', function ($scope, TemplateService, NavigationService, errorService, toastr, $state, $timeout, $uibModal, $sce, $filter, configService, loginService, $stateParams) {
  $scope.template = TemplateService.getHTML("content/registration/register-player.html");
  TemplateService.title = "Player Registration"; //This is the Title of the Website
  $scope.navigation = NavigationService.getNavigation();
  // CODE START
  // VARIABLE INITIALISE
  $scope.oneAtATime = true
  // $scope.s.open = true;
  $scope.formData = {};
  $scope.searchSfaObj = {};
  $scope.verifyOtpObj = {};
  $scope.validateOtpObj = {};
  $scope.resetPassObj = {};
  $scope.forgotPassword = {};
  $scope.mobileNumber = '';
  $scope.emailId = '';
  $scope.showSec2 = false;

  $scope.flag = $stateParams.type;
  // SET FLAG
  if ($scope.flag == 'player') {
    $scope.pageType = 'player';
    $scope.displayType = 'player';
    $scope.formData.type = 'athlete';
    $scope.validateOtpObj.type = 'athlete';
    TemplateService.title = "Player Registration";
  } else if ($scope.flag = 'school' || $scope.flag == 'college') {
    $scope.pageType = 'school';
    $scope.formData.type = 'school';
    $scope.validateOtpObj.type = 'school';
    if ($scope.flag == 'school') {
      $scope.displayType = 'school';
      TemplateService.title = "School Registration";
    } else if ($scope.flag == 'college') {
      $scope.displayType = 'college';
      TemplateService.title = "College Registration";
    }
  }

  // SET FLAG END
  $scope.oneAtATime = true;
  $scope.questionLimit = {
    value: 2,
    more: true
  };
  $scope.banners = $scope.questionList = $scope.testimonials = $scope.counts = $scope.gallery = [];
  $scope.showForm = false;
  $scope.stepTab = 0;
  $scope.stepForm = false;
  // VARIABLE INITIALISE END
  // FUNCTIONS

  // CONFIG SERVICE
  configService.getDetail(function (data) {
    console.log(data);
    $scope.state = data.state;
    $scope.year = data.year;
    $scope.eventYear = data.eventYear;
    $scope.sfaCity = data.sfaCity;
    $scope.isCollege = data.isCollege;
    $scope.type = data.type;
    $scope.sports = data.sports;
    $scope.sfaDates = data.date;
    $scope.venue = data.venue;
    $scope.infoId = data.infoId;
    $scope.infoNo = data.infoNo;
  });
  $scope.logoutCandidate = function () {
    loginService.logoutCandidate(function (data) {
      if (data.isLoggedIn === false) {} else {}
    });
  };

  loginService.loginGet(function (data) {
    $scope.detail = data;
  });

  if ($scope.formData.type === 'athlete' && $.jStorage.get("userDetails") != null && $.jStorage.get("userDetails").atheleteID) {
    $scope.showErrorMsg = true;
  }
  if ($scope.formData.type === 'athlete' && $.jStorage.get("userDetails") != null && !$.jStorage.get("userDetails").atheleteID) {
    $scope.showErrorMsg = false;
    $scope.logoutCandidate();
  }
  if ($scope.formData.type == "school" && $.jStorage.get("userDetails") != null && !$.jStorage.get("userDetails").atheleteID) {
    $scope.showErrorMsg = true;
  }
  if ($scope.formData.type == "school" && $.jStorage.get("userDetails") != null && $.jStorage.get("userDetails").atheleteID) {
    $scope.showErrorMsg = false;
    $scope.logoutCandidate();
  }

  $scope.toChangeMObile = function () {
    $scope.showSec2 = !$scope.showSec2;
  };

  //LOGIN FUNCTION
  $scope.login = function (formData, formSports) {
    $scope.yourPromise = NavigationService.success().then(function () {
      // formData.type = $scope.formData.type;
      if ($stateParams.type == 'player') {
        formData.type = 'athlete';
      } else {
        formData.type = 'school';
      }
      console.log(" formData.type", formData.type);
      if (formSports.$valid) {
        if (formData) {
          if (formData.sfaid) {
            if (formData.sfaid.charAt(1) != "S" && formData.sfaid.charAt(1) != "A" && formData.sfaid.charAt(1) != "C") {
              toastr.error('Invalid SfaId.', 'Login Message');
            }
            if ($scope.type == 'school') {
              console.log('enter school');
              if (formData.sfaid.charAt(1) == "S" && formData.type == "athlete") {
                toastr.error('Only Player Can Log In.', 'Login Message');
              } else {
                if (formData.sfaid.charAt(1) == "A" && formData.type == "school") {
                  toastr.error('Only School Can Log In.', 'Login Message');
                } else {
                  if (formData.sfaid.charAt(1) == "C" && formData.type == "school") {
                    toastr.error('Only School Can Log In.', 'Login Message');
                  }
                  if (formData.sfaid.charAt(1) == "C" && formData.type == "athlete") {
                    toastr.error('Only Player Can Log In.', 'Login Message');
                  }
                }
              }
              if (formData.sfaid.charAt(1) == "S" && formData.type == "school") {
                $scope.loginFunction(formData);
              } else {
                console.log("iminnnnnnn", formData.type);

                if (formData.sfaid.charAt(1) == "A" && formData.type == "athlete") {
                  $scope.loginFunction(formData);
                }
              }

            } else {
              console.log('enter');
              if (formData.sfaid.charAt(1) == "C" && formData.type == "athlete") {
                toastr.error('Only Player Can Log In.', 'Login Message');
              } else {
                if (formData.sfaid.charAt(1) == "A" && formData.type == "school") {
                  toastr.error('Only College Can Log In.', 'Login Message');
                } else {
                  if (formData.sfaid.charAt(1) == "S" && formData.type == "school") {
                    toastr.error('Only College Can Log In.', 'Login Message');
                  }
                  if (formData.sfaid.charAt(1) == "S" && formData.type == "athlete") {
                    toastr.error('Only Player Can Log In.', 'Login Message');
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
    console.log("imnnn");
    NavigationService.login(formData, function (data) {
      errorService.errorCode(data, function (allData) {
        if (!allData.message) {
          if (allData.value) {
            NavigationService.setUser(allData.data);
            toastr.success('Successfully Logged In.', 'Login Message');
            $state.go('sports-selection');
          } else {
            if (allData.error == "Data not found") {
              toastr.error('You have not completed the Registration & Verification process.Kindly complete Step 1 and then proceed to Sports Registration', 'Login Message');
            } else {
              toastr.error('Please Enter Valid SFA Id And Password.', 'Login Message');
            }

          }
        } else {
          toastr.error(allData.message, 'Error Message');
        }
      });
    });
  };

  //END LOGIN FUNCTION

  // LOGOUT FUNCTION
  $scope.logoutCandidate = function () {
    console.log("iminnn");
    loginService.logoutCandidate(function (data) {
      console.log("data", data);
      if (data.isLoggedIn === false) {
        $scope.showErrorMsg = false;
        console.log("imiinnnnnnnnnnn");
        toastr.success('Successfully Logged Out', 'Logout Message');
      } else {
        toastr.error('Something went wrong', 'Logout Message');
      }
    });
  };
  // LOGOUT FUNCTION END


  //FORGOT PASSWORD FUNCTIONALITY

  if ($stateParams.type == 'player') {
    $scope.forgotPassword.type = 'athlete';
    NavigationService.setUserType('athlete');
    $scope.resetPassObj.type = 'athlete';
  } else if ($stateParams.type == 'school') {
    $scope.forgotPassword.type = 'school';
    $scope.resetPassObj.type = 'school';
    NavigationService.setUserType('school');
  }

  $scope.forgotPassFunction = function (url, forgotPassword) {
    if (forgotPassword.sfaId) {
      NavigationService.apiCallWithData(url, forgotPassword, function (data) {
        if (data.value) {
          $scope.hideThis = true;
          $scope.mobileNumber = data.data.mobile;
          $scope.emailId = data.data.email;
          $scope.showThis = true;
          console.log(" $scope.mobileNumber", $scope.mobileNumber);
        } else {
          if (data.error == "Data not found") {
            toastr.error('You have not completed the Registration & Verification process. Kindly complete Step 1 and then proceed to Sports Registration', 'Error Message');
          } else if (data.error == "Status pending") {
            toastr.error('Yet your Verification process has been not completed. For any further queries contact us on ' + $scope.infoNo + ' or email us at ' + $scope.infoId + '.', 'Error Message');
          } else {
            toastr.error('Incorrect User Details', 'Error Message');
          }
        }
      });
    } else {
      toastr.error("Please Enter SfaId", 'Error Message');
    }
  };

  $scope.sendOtp = function (forgotPassword) {
    var url = 'login/forgotPassword';
    console.log("sfaId", forgotPassword);
    if (forgotPassword.sfaId) {
      if (forgotPassword.sfaId.charAt(1) != "S" && forgotPassword.sfaId.charAt(1) != "A" && forgotPassword.sfaId.charAt(1) != "C") {
        toastr.error('Invalid SfaId.', 'Login Message');
      }
      if ($scope.type == 'school') {
        if (forgotPassword.sfaId.charAt(1) == "S" && forgotPassword.type == "athlete") {
          toastr.error('Only Player can have access, please check your SFAID', 'Forgot Password Message');
        } else {
          if (forgotPassword.sfaId.charAt(1) == "A" && forgotPassword.type == "school") {
            toastr.error('Only School can have access,please check your SFAID', 'Forgot Password Message');
          } else {
            if (forgotPassword.sfaId.charAt(1) == "C" && forgotPassword.type == "school") {
              toastr.error('Only School can have access,please check your SFAID', 'Forgot Password Message');
            }
            if (forgotPassword.sfaId.charAt(1) == "C" && forgotPassword.type == "athlete") {
              toastr.error('Only Player can have access , please check your SFAID', 'Forgot Password Message');
            }
          }
        }
        if (forgotPassword.sfaId.charAt(1) == "S" && forgotPassword.type == "school") {
          $scope.forgotPassFunction(url, forgotPassword);
        } else {
          if (forgotPassword.sfaId.charAt(1) == "A" && forgotPassword.type == "athlete") {
            $scope.forgotPassFunction(url, forgotPassword);
          }
        }
      } else {
        // console.log('enter');
        if (forgotPassword.sfaId.charAt(1) == "C" && forgotPassword.type == "athlete") {
          toastr.error('Only Player Can have access, please check your SFAID', 'Forgot Password Message');
        } else {
          if (forgotPassword.sfaId.charAt(1) == "A" && forgotPassword.type == "school") {
            toastr.error('Only College Can have access, please check your SFAID', 'Forgot Password Message');
          } else {
            if (forgotPassword.sfaId.charAt(1) == "S" && forgotPassword.type == "school") {
              toastr.error('Only College Can have access, please check your SFAID', 'Forgot Password Message');
            }
            if (forgotPassword.sfaId.charAt(1) == "S" && forgotPassword.type == "athlete") {
              toastr.error('Only Player Can have access, please check your SFAID', 'Forgot Password Message');
            }
          }
        }
        if (forgotPassword.sfaId.charAt(1) == "C" && forgotPassword.type == "school") {
          $scope.forgotPassFunction(url, forgotPassword);
        } else {
          if (forgotPassword.sfaId.charAt(1) == "A" && forgotPassword.type == "athlete") {
            $scope.forgotPassFunction(url, forgotPassword);
          }
        }
      }


    }
  };

  //VALODATE OTP


  // "type" : "school or athlete",
  //   "sfaId" : "HS17142/HA17142",
  $scope.validateOtp = function (formData) {
    var url = 'login/validateOtp';
    console.log("forgotPassword", $scope.forgotPassword);
    formData.sfaId = $scope.forgotPassword.sfaId;
    NavigationService.apiCallWithData(url, formData, function (data) {
      if (data.value) {
        console.log("data", data);
        $scope.showThis = false;
        $scope.hideThis = true;
        $scope.hideSec = true;
        $scope.showSec3 = true;

      } else {
        toastr.error("Incorrect OTP", 'Error Message');
      }
    });

  };


  //RESET PASSWORD FUNCTONALITY
  $scope.resetPass = function (resetPassObj) {
    var url = 'login/resetPassword';
    if (resetPassObj.newPassword === resetPassObj.confirmPassword) {
      resetPassObj.sfaId = $scope.forgotPassword.sfaId;
      NavigationService.apiCallWithData(url, resetPassObj, function (data) {
        if (data.value) {
          // $scope.modalInstance.close();
          toastr.success('Password changed successfully,Please login with new password', 'Success Message');
          $state.reload();
        } else {
          toastr.error('Your new password and confirmation password do not match', 'Error Message');

        }
      });
    } else {
      toastr.error('Your new password and confirmation password do not match', 'Error Message');
    }


  };



  //END FORGOT PASSWORD FUNCTIONALITY


  // SWIPER INITIALISE
  $scope.swiperInit = function () {
    $timeout(function () {
      // BANNER
      var bannerSlide = new Swiper('.registerplayer-bannerslider .swiper-container', {
        slidesPerView: 1,
        preloadImages: true,
        speed: 500,
        autoplay: 3000,
        reverseDirection: false,
        paginationClickable: true,
        // loop: true,
      });
      // BANNER END
      // TESTIMONIALS
      var testimonialSlide = new Swiper('.registerplayer-testimonialslider .swiper-container', {
        slidesPerView: 2,
        paginationClickable: true,
        loop: true,
        grabCursor: true,
        spaceBetween: 10,
        nextButton: '.registerplayer-testimonialslider .swiper-button-next',
        prevButton: '.registerplayer-testimonialslider .swiper-button-prev',
        touchEventsTarget: 'container',
        preloadImages: true,
        breakpoints: {
          992: {
            slidesPerView: 2
          },
          768: {
            slidesPerView: 2

          },
          481: {
            slidesPerView: 1
          },
          320: {
            slidesPerView: 1
          }
        }
      });
      // TESTIMONIALS END
      // TESTIMONIALS END
      var gallerySlide = new Swiper('.registerplayer-galleryslider .swiper-container', {
        slidesPerView: 1,
        paginationClickable: true,
        loop: true,
        grabCursor: true,
        spaceBetween: 10,
        nextButton: '.registerplayer-galleryslider .swiper-button-next',
        prevButton: '.registerplayer-galleryslider .swiper-button-prev',
        touchEventsTarget: 'container',
        preloadImages: true
      })
    }, 3000);
  }
  $scope.$on('$viewContentLoaded', function (event) {
    $scope.swiperInit();
  })
  // SWIPER INITIALISE END
  // FORM
  // OPEN FORM
  $scope.registerOpen = function () {
    $scope.showForm = !$scope.showForm;
    $scope.stepTab = 0;
  }
  // OPEN FORM END
  // SELECT STEP
  $scope.showStep = function (step) {
    $scope.stepTab = step;
    $scope.stepForm = false;
  }
  // SELECT STEP END
  // SHOW STEP 1 FORM
  $scope.showStepForm = function () {
    $scope.stepForm = !$scope.stepForm;
  }
  // SHOW STEP 1 FORM
  // CHANGE DETAILS POPUP
  $scope.changeDetails = function () {
    $uibModal.open({
      animation: true,
      scope: $scope,
      templateUrl: 'views/modal/changecontact.html',
      size: 'md',
      windowClass: 'modal-changedetails'
    })
  }
  // CHANGE DETAILS POPUP END
  // FORGOT PASSWORD POPUP
  $scope.showForgotPassword = function () {
    $scope.modalInstance = $uibModal.open({
      animation: true,
      scope: $scope,
      // backdrop: 'static',
      keyboard: false,
      templateUrl: 'views/modal/forgotpassword.html',
      windowClass: 'modal-forgotpassword'
    });
  }
  // FORGOT PASSWORD POPUP END
  // FORM END
  // QUESTIONS SECTION
  $scope.moreQuestions = function () {
    if ($scope.questionLimit.value == 2) {
      $scope.questionLimit = {
        value: $scope.questionList.length,
        more: false
      };
      $scope.questionLimit = $scope.questionList.length;
    } else {
      $scope.questionLimit = {
        value: 2,
        more: true
      };
    }
    console.log("$scope.questionLimit", $scope.questionLimit);
  };
  // QUESTIONS SECTION END
  // GALLERY
  $scope.gallerySlides = [];
  $scope.allGallery = {
    'photoSlide': [],
    'slidePhotos': []
  };
  $scope.getGallerySlides = function (gallery) {
    $scope.gallerySlides = _.chunk(gallery, 6);
    _.each($scope.gallerySlides, function (n, nkey) {
      $scope.allGallery.slidePhotos[nkey] = _.chunk(n, 3);
    });
    // console.log("picslide",$scope.allGallery);
  };
  // GALLERY END
  // FUNCTIONS END
  // API CALLS
  // GET REGISTERATION CONTENT
  $scope.getPlayerRegistration = function () {
    NavigationService.getPlayerRegistration(function (data) {
      console.log("data", data);
      data = data.data;
      if (data.value == true) {
        console.log("content success", data.data.results);
        if (data.data.results.length > 0) {
          $scope.banners = data.data.results[0].banner;
          $scope.ageEventPdf = $sce.trustAsResourceUrl($filter('uploadpathTwo')(data.data.results[0].ageEventPdf));
          console.log("pdf", $scope.ageEventPdf);
          $scope.gallery = data.data.results[0].gallery;
          $scope.counts = data.data.results[0].eventCount;
          if ($scope.pageType == 'player') {
            $scope.content = data.data.results[0].playerContent;
          } else if ($scope.pageType == 'school') {
            $scope.content = data.data.results[0].schoolContent;
          }
          $scope.getGallerySlides($scope.gallery);
        }

      } else {
        console.log("content fail", data);
      }
    });
  }
  $scope.getPlayerRegistration();
  // GET REGISTERATION CONTENT END
  // GET QUESTIONS

  $scope.getPlayerQuestions = function () {
    $scope.questionObj = {
      filter: {
        typeQuestion: $scope.pageType
      }
    };
    NavigationService.getPlayerQuestions($scope.questionObj, function (data) {
      console.log("questions", data);
      // data = data.data;
      if (data.value == true) {
        $scope.questionList = data.data.results;
        console.log("questions success", $scope.questionList);
      } else {
        console.log("questions fail", data);
      }
    })
  }
  $scope.getPlayerQuestions();
  // GET QUESTIONS END
  // GET TESTIMONIALS
  $scope.getTestimonials = function () {
    NavigationService.getTestimonials(function (data) {
      data = data.data;
      if (data.value == true) {
        $scope.testimonials = data.data.results;
        console.log("testimonials success", $scope.testimonials);
      } else {
        console.log("testimonials fail", data);
      }
    });
  }
  $scope.getTestimonials();
  // GET TESTIMONIALS END
  // START OF GENERATE OTP FOR PARTICIPATED BEFORE
  $scope.searchSfaObj.page = 1;
  $scope.searchSfaObj.keyword = '';
  $scope.masterSearchSFA = function (formData, $event) {
    // no event means first load!
    $scope.loading = true;
    if (!$event) {
      $scope.searchSfaObj.page = 1;
      $scope.masterData = [];
    } else {
      $event.stopPropagation();
      $event.preventDefault();
      $scope.searchSfaObj.page++;
    }
    // no event means first
    $scope.searchSfaObj.keyword = formData;
    var url;
    if ($.jStorage.get("userType") != null && $.jStorage.get("userType") === 'school') {
      url = 'Registration/getSearch';
    } else {
      url = 'Athelete/getSearch';
    }
    NavigationService.getMasterData($scope.searchSfaObj, url, function (data) {
      if (data.data.value) {
        // $scope.masterData = data.data.data.results;
        $scope.masterData = $scope.masterData.concat(data.data.data.results);
        _.each($scope.masterData, function (key) {
          if ($.jStorage.get("userType") != null && $.jStorage.get("userType") === 'school') {
            key.sfaId = key.sfaID;
            key.fullName = key.sfaID + ' - ' + key.schoolName;
          } else {
            if (key.middleName) {
              key.fullName = key.sfaId + ' - ' + key.firstName + ' ' + key.middleName + ' ' + key.surname;
            } else {
              key.fullName = key.sfaId + ' - ' + key.firstName + ' ' + key.surname;
            }

          }

        });
        if ($scope.masterData.length == data.data.data.total) {
          $scope.loading = false;
        }
      }
    });

  };



  $scope.generateOtp = function (otpObj) {
    var obj = {};
    var url;
    if ($scope.formData.type == 'school') {
      url = 'Registration/getOTP';
    } else {
      url = 'Athelete/getOTP';
    }
    obj.sfaId = otpObj.sfaId.sfaId;
    obj.mobile = otpObj.sfaId.mobile;
    obj.email = otpObj.sfaId.email;
    $scope.verifyOtpObj.id = otpObj.sfaId._id;
    $scope.showRegisteredCredentials = true;
    $scope.registeredMobileNo = otpObj.sfaId.mobile;
    $scope.registeredEmail = otpObj.sfaId.email;
    NavigationService.getOTP(obj, url, function (data) {
      if (data.data.value) {
        $scope.verifyOtpObj.validOtp = data.data.data.otp;
      }
    });
  };

  $scope.regenerateOtp = function (searchSfaObj) {
    $scope.verifyOtpObj.otp = '';
    $scope.generateOtp(searchSfaObj);
  };


  $scope.verifyOTP = function (otpObj) {
    console.log("otpObj", otpObj);
    if (otpObj.otp === otpObj.validOtp) {
      toastr.success('Successful OTP validation', 'Success Message');
      if ($scope.formData.type == 'school') {
        $state.go('registerformschooledit', {
          flag: 'edit',
          id: otpObj.id
        });
      } else {
        $state.go('registerformplayeredit', {
          flag: 'edit',
          id: otpObj.id
        });
      }
    } else {
      toastr.error('Please enter valid Otp', 'Success Message');
    }


  };
  // END OF GENERATE OTP FOR PARTICIPATED BEFORE


  // API CALLS END
  // JSONS
  // BANNERS
  $scope.banners = [{
    image: 'img/About_Web_Hyd.jpg'
  }, {
    image: 'img/About_Web_Hyd.jpg'
  }, {
    image: 'img/About_Web_Hyd.jpg'
  }];
  // BANNERS END
  // TESTIMONIALS
  // $scope.testimonials = [1,2,3,4,5,6];
  // TESTIMONIALS END
  // COUNTS
  // $scope.counts = [{
  //   number: 2,
  //   label: 'Cities'
  // },{
  //   number: 3,
  //   label: 'Championships'
  // },{
  //   number: 25,
  //   label: 'Sports'
  // },{
  //   number: 1000,
  //   label: 'Schools'
  // },{
  //   number: 70000,
  //   label: 'Athletes'
  // }]
  // COUNTS END
  // $scope.gallery = [{
  //   image: 'img/featuredthumbnail.jpg'
  // },{
  //   image: 'img/featuredthumbnail.jpg'
  // },{
  //   image: 'img/featuredthumbnail.jpg'
  // },{
  //   image: 'img/featuredthumbnail.jpg'
  // },{
  //   image: 'img/featuredthumbnail.jpg'
  // },{
  //   image: 'img/featuredthumbnail.jpg'
  // },{
  //   image: 'img/featuredthumbnail.jpg'
  // },{
  //   image: 'img/featuredthumbnail.jpg'
  // },{
  //   image: 'img/featuredthumbnail.jpg'
  // },{
  //   image: 'img/featuredthumbnail.jpg'
  // }];

  // CODE  END
  // JSONS END
});