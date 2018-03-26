myApp.controller('RegisterFormSchoolCtrl', function ($scope, TemplateService, NavigationService, $timeout, $uibModal, $filter, configService) {
  $scope.template = TemplateService.getHTML("content/registration/registerform-school.html");
  TemplateService.title = "School Registration Form"; //This is the Title of the Website
  $scope.navigation = NavigationService.getNavigation();

  $scope.formData = {};
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
  $scope.changeitSchoolLogo = function (err, data) {
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
  $scope.formData.sportsDepartment = [];
  $scope.sportDepart = {
    name: "",
    designation: "",
    email: "",
    photo: "",
    mobile: ""
  };
  // $scope.dateOptions = {
  //     changeYear: true,
  //     changeMonth: true,
  //     yearRange: '1900:-0',
  //     dateFormat: "dd/mm/yy"
  // };
  // $scope.menu = "menu-out";
  // $scope.getMenu = function () {
  //     if ($scope.menu == "menu-out") {
  //         $scope.menu = "menu-out";
  //     } else {
  //         $scope.menu = "menu-in";
  //     }
  // }

  $scope.formdata = {};

  $scope.openModal = function () {
    $timeout(function () {
      // fbq('track', 'CompleteRegistration');
      fbq('track', 'CompleteRegistration');
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
  // $scope.redirectTo = function () {
  //     $scope.isDisabled1 = true;
  //     fbq('track', 'CompleteRegistration');
  //     GoogleAdWordsService.sendRegisterCustomerConversion();
  //     $state.go('register');
  // };

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
  $scope.regisBenModal = function (type, sfaCity, year, eventYear) {
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
      templateUrl: "views/modal/registerbenefits.html",
      size: 'lg'
    });
  };

  $scope.firstTime = 0;
  if ($scope.firstTime === 0) {
    $scope.formData.sportsDepartment.push($scope.sportDepart);
    $scope.firstTime++;
  }

  $scope.addSportForm = function () {
    if ($scope.formData.sportsDepartment.length < 3) {
      $scope.sportDepart = {
        name: '',
        designation: '',
        email: '',
        photo: '',
        mobile: ''
      };
      $scope.formData.sportsDepartment.push($scope.sportDepart);
    }
  };


  $scope.removeSportForm = function (index) {
    if (index !== 0) {
      $scope.formData.sportsDepartment.splice(index, 1);
    }
  };
  $scope.teamSport = [];
  $scope.aquaticsSports = [];
  $scope.racquetSports = [];
  $scope.combatSports = [];
  $scope.targetSports = [];
  $scope.individualSports = [];
  $scope.sfaID = '';
  $scope.emailOtp = {};
  $scope.showOtpSuccess = {};

  // var isSportSelected = function (form) {
  //     if (formdata.teamSports.length > 0 || formdata.racquetSports.length > 0 || formdata.combatSports.length > 0 || formdata.targetSports.length > 0 || formdata.individualSports.length > 0 || formdata.aquaticsSports.length > 0) {
  //         $scope.showTeamSports = false;
  //     } else {
  //         console.log('enter');
  //         $scope.showTeamSports = true;
  //     }
  // }

  //save registerform to database
  $scope.isDisabled = false;
  $scope.saveRegis = function (formdata, formvalid) {
    formdata.teamSports = $scope.teamSport;
    formdata.racquetSports = $scope.racquetSports;
    formdata.combatSports = $scope.combatSports;
    formdata.targetSports = $scope.targetSports;
    formdata.individualSports = $scope.individualSports;
    formdata.aquaticsSports = $scope.aquaticsSports;
    formdata.sfaID = $scope.sfaID;

    $scope.value = {};

    // if (formdata.teamSports == '' || formdata.racquetSports == '' || formdata.combatSports == '' || formdata.targetSports == '' || formdata.individualSports == '' || formdata.aquaticsSports == '') {
    //     $scope.showTeamSports = true;
    // } else {
    //     $scope.showTeamSports = false;
    // }

    // if (formdata.teamSports == '') {
    //     $scope.showTeamSports = true;
    // } else
    // if (formdata.racquetSports == '') {
    //     $scope.showTeamSports = true;
    // } else if (formdata.combatSports == '') {
    //     $scope.showTeamSports = true;
    // } else if (formdata.targetSports == '') {
    //     $scope.showTeamSports = true;
    // } else if (formdata.individualSports == '') {
    //     $scope.showTeamSports = true;
    // } else if (formdata.aquaticsSports == '') {
    //     $scope.showTeamSports = true;
    // } else {
    //     $scope.showTeamSports = false;
    // }

    // if (formdata.teamSports != null || formdata.racquetSports != null || formdata.combatSports != null || formdata.targetSports != null || formdata.individualSports != null || formdata.aquaticsSports != null) {
    //     $scope.showTeamSports = false;
    // } else {
    //     console.log(enter);
    //     $scope.showTeamSports = true;
    // }
    if (formdata.teamSports.length > 0 || formdata.racquetSports.length > 0 || formdata.combatSports.length > 0 || formdata.targetSports.length > 0 || formdata.individualSports.length > 0 || formdata.aquaticsSports.length > 0) {
      $scope.showTeamSports = false;
    } else {
      // console.log('enter');
      $scope.showTeamSports = true;
    }

    if (formdata.termsAndCondition === undefined || formdata.termsAndCondition === false) {
      $scope.showTerm = true;
    } else {
      $scope.showTerm = false;
    }
    if (_.isEmpty($location.search())) {
      $scope.extras = {};
    } else {
      $scope.extras = $location.search();
      // console.log($scope.extras);
      formdata.utm_medium = $scope.extras.utm_medium;
      formdata.utm_source = $scope.extras.utm_source;
      formdata.utm_campaign = $scope.extras.utm_campaign;
    }

    if (formdata.affiliatedBoard == 'Other') {
      if (formdata.affiliatedBoards) {
        formdata.affiliatedBoard = formdata.affiliatedBoards;
      } else {
        toastr.error('Please Enter Affiliated Board.');
      }
    } else {
      delete formdata.affiliatedBoards;
    }

    $scope.url = "registration/saveRegistrationForm";
    // console.log($scope.url);
    // console.log('final data', formdata);
    if (formvalid.$valid && $scope.showTerm === false && $scope.showTeamSports === false) {
      if ($scope.showOtpSuccess === false) {
        $scope.isDisabled = true;
        NavigationService.apiCallWithData($scope.url, formdata, function (data) {
          if (data.value === true) {
            if (data.data.registrationFee == "online PAYU") {
              var id = data.data._id;
              // console.log("true and in payment");
              var url = "payU/schoolPayment?id=" + id;
              window.location.href = adminUrl2 + url;
            } else {
              // console.log("opening modal");
              $scope.openModal();
            }
          } else {
            $scope.isDisabled = false;
            $scope.openErrModal();
            $timeout(function () {
              $scope.errInstances.close();
            }, 3000);
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
  // $scope.checkOTP = function (otp) {
  //     console.log("opt", $scope.emailOtp, otp);
  //     if ($scope.emailOtp == otp) {
  //         console.log("email OTP verified");
  //     } else {
  //         alert("Incorrect OTP!");
  //     }
  // }

  // $scope.checkOTP = function (otp) {
  //     console.log("opt", $scope.emailOtp, otp);
  //     if (_.isEqual($scope.emailOtp, otp)) {
  //         $(' .verify-otp-regis').html('<i class="fa fa-check"></i>').css("color", "green");
  //         console.log("email OTP verified");
  //     } else {
  //         alert("Incorrect OTP!");
  //         $(' .verify-otp-regis').html('<i class="fa fa-times"></i>').css("color", "red");
  //     }
  // }

  $scope.checkOTP = function (otp) {
    // console.log("opt", $scope.emailOtp, otp);
    // console.log(typeof otp, typeof $scope.emailOtp);

    var otpCheck = otp.toString();
    // console.log("length", otpCheck.length);
    if (otpCheck.length == 4) {

      if (_.isEqual($scope.emailOtp, otpCheck)) {
        // $(' .verify-otp-regis').html('<i class="fa fa-check"></i>').css("color", "green");
        // console.log("email OTP verified");
        $scope.showOtpSuccess = false;

      } else {
        // alert("Incorrect OTP!");
        // $(' .verify-otp-regis').html('<i class="fa fa-times"></i>').css("color", "red");
        $scope.showOtpSuccess = true;
      }
    } else if (otpCheck.length == 3) {
      otpCheck = "0" + otpCheck;
      // console.log("otpCheck", otpCheck);
      if (_.isEqual($scope.emailOtp, otpCheck)) {
        // $(' .verify-otp-regis').html('<i class="fa fa-check"></i>').css("color", "green");
        // console.log("email OTP verified");
        $scope.showOtpSuccess = false;

      } else {
        // alert("Incorrect OTP!");
        // $(' .verify-otp-regis').html('<i class="fa fa-times"></i>').css("color", "red");
        $scope.showOtpSuccess = true;
      }
    }

  };



  $scope.sendOTP = function (email) {
    // console.log(" i am in click")
    var formdata = {};
    formdata.email = email;
    // console.log("form", formdata);
    $scope.url = "registration/generateOTP";
    // console.log($scope.url);
    NavigationService.apiCallWithData($scope.url, formdata, function (data) {
      $scope.emailOtp = data.data;
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
      templateUrl: 'views/modal/terms-school.html',
      scope: $scope,
      size: size,
      windowClass: "termcondition-modal"

    });
  };

  // $scope.addTeamSports = function (formdata) {
  //         // formdata.serviceRequest = $scope.serviceList;
  //         console.log("formdata", formdata);
  //         var frm = {};
  //         frm.name = formdata;
  //         //document.getElementById(formdata).checked
  //         $scope.teamSport.push(frm);

  //     }

  //team sports array
  $scope.addTeamSports = function (formdata) {
    var index = _.findIndex($scope.teamSport, function (n) {
      return n.name == formdata;
    });
    if (index >= 0) {
      _.pullAt($scope.teamSport, index);
    } else {
      $scope.teamSport.push({
        name: formdata
      });
    }
    // console.log($scope.teamSport);
  };

  //racquet sports array
  $scope.addRacquetSports = function (formdata) {
    // $scope.combatSports = [];
    // $scope.targetSports = [];
    // $scope.individualSports = [];
    var index = _.findIndex($scope.racquetSports, function (n) {
      return n.name == formdata;
    });
    if (index >= 0) {
      _.pullAt($scope.racquetSports, index);
    } else {
      $scope.racquetSports.push({
        name: formdata
      });
    }
  };

  //combatSports array
  $scope.addCombatSports = function (formdata) {
    var index = _.findIndex($scope.combatSports, function (n) {
      return n.name == formdata;
    });
    if (index >= 0) {
      _.pullAt($scope.combatSports, index);
    } else {
      $scope.combatSports.push({
        name: formdata
      });
    }
  };

  //targetSports array
  $scope.addTargetSports = function (formdata) {
    var index = _.findIndex($scope.targetSports, function (n) {
      return n.name == formdata;
    });
    if (index >= 0) {
      _.pullAt($scope.targetSports, index);
    } else {
      $scope.targetSports.push({
        name: formdata
      });
    }
  };

  //individualSports array
  $scope.addIndividualSports = function (formdata) {
    var index = _.findIndex($scope.individualSports, function (n) {
      return n.name == formdata;
    });
    if (index >= 0) {
      _.pullAt($scope.individualSports, index);
    } else {
      $scope.individualSports.push({
        name: formdata
      });
    }

  };
  //aquaticsSports array
  $scope.addAquaticsSports = function (formdata) {
    var index = _.findIndex($scope.aquaticsSports, function (n) {
      return n.name == formdata;
    });
    if (index >= 0) {
      _.pullAt($scope.aquaticsSports, index);
    } else {
      $scope.aquaticsSports.push({
        name: formdata
      });
    }
  };

  //called on refresh
  $scope.refreshSFA = function (paramData) {
    NavigationService.getSchoolSFA(paramData, function (data) {
      // console.log("sfa regis", data);
      $scope.schoolList = data.data.results;
      //$scope.schoolList = data.data;
    });
  };

  //called on select for taking value
  $scope.searchSFA = function (paramData) {
    // console.log("changekeyword", paramData);
    $scope.sfaID = paramData;
    // console.log("sfaid", $scope.sfaID);
  };
  $scope.searchSFACollege = function (paramData) {
    // console.log("changekeyword", paramData);
    $scope.sfaID = paramData.sfaid;
    // console.log("sfaid", $scope.sfaID);
  };
  $scope.searchSFAHyderabad = function (paramData) {
    // console.log("changekeyword", paramData);
    $scope.sfaID = paramData.sfaid;
    // console.log("sfaid", $scope.sfaID);
  };

  //get school name for binding with dropdown
  // NavigationService.getSchoolSFA("", function (data) {
  //     console.log("sfa regis", data);
  //     $scope.schoolList = data.data.results;
  //     //$scope.schoolList = data.data;
  // });

  $scope.test = function (size) {
    $scope.testModal = $uibModal.open({
      animation: true,
      templateUrl: 'views/modal/modsub.html',
      scope: $scope,
      size: size,
      windowClass: "test-modal"

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

  //removes image uploaded
  $scope.removeImage = function (data, className) {
    // console.log("remove me", document.getElementById("inputImage").value);
    // $scope.formData.schoolLogo = null;
    // console.log(className);
    $("." + className + " input").val("");
    delete $scope.formData.schoolLogo;
    $scope.show = 0;
  };
  $scope.removeArrayImage = function (index, className) {
    // console.log("remove me", document.getElementById("inputImage").value);
    // $scope.formData.sportsDepartment[index].photograph = null;
    // console.log(className);
    $("." + className + " input").val("");
    // console.log($scope.formData.sportsDepartment[index].photograph);
    delete $scope.formData.sportsDepartment[index].photograph;
    // console.log($scope.formData.sportsDepartment[index].photograph);
    $scope.show = 0;
  };

  $timeout(function () {
    $('.selectpicker').selectpicker()
  }, 200);


  // SPORTS JSON INDIVIDUAL/TEAM
  $scope.schoolRegisterSportsForm = [{
    name: "Individual Sports",
    sportName: [
      [{
        name: 'Archery',
        type: 'targetSports'
      }, {
        name: 'Athletics',
        type: 'individualSports'
      }, {
        name: 'Badminton',
        type: 'racquetSports',
      }, {
        name: 'Boxing',
        type: 'combatSports'
      }, {
        name: 'Chess',
        type: 'individualSports'
      }, {
        name: 'Carrom',
        type: 'individualSports'
      }],
      [{
        name: 'Fencing',
        type: 'combatSports'
      }, {
        name: 'Judo',
        type: 'combatSports'
      }, {
        name: 'Karate',
        type: 'combatSports'
      }, {
        name: 'Shooting',
        type: 'targetSports'
      }, {
        name: 'Swimming',
        type: 'aquaticsSports'
      }, {
        name: 'Sport MMA',
        type: 'combatSports',
        hide: true
      }],
      [{
        name: 'Squash',
        type: 'racquetSports'
      }, {
        name: 'Table Tennis',
        type: 'racquetSports'
      }, {
        name: 'Taekwondo',
        type: 'combatSports'
      }, {
        name: 'Tennis',
        type: 'racquetSports'
      }, {
        name: 'Wrestling',
        type: 'combatSports'
      }]
    ]
  }, {
    name: 'Team Sports',
    sportName: [
      [{
        name: 'Basketball',
        type: 'teamSport'
      }, {
        name: 'Football',
        type: 'teamSport'
      }, {
        name: 'Handball',
        type: 'teamSport'
      }, {
        name: 'Hockey',
        type: 'teamSport'
      }, {
        name: 'Kabaddi',
        type: 'teamSport'
      }, {
        name: 'Kho Kho',
        type: 'teamSport'
      }],
      [{
        name: 'Throwball',
        type: 'teamSport'
      }, {
        name: 'Volleyball',
        type: 'teamSport'
      }, {
        name: 'Water Polo',
        type: 'teamSport'
      }]
    ]
  }]

  // DOUBLES/RELAY
  $scope.schoolRegisterSportForm2 = [{
      name: "Doubles",
      sportName: [{
        name: 'Badminton Doubles',
        type: 'racquetSports'
      }, {
        name: 'Table Tennis Doubles',
        type: 'racquetSports'
      }, {
        name: 'Tennis Doubles',
        type: 'racquetSports'
      }, {
        name: 'Tennis Mixed Doubles',
        type: 'racquetSports'
      }]

    },
    {
      name: "Relay",
      sportName: [{
        name: 'Athletics 4x50m Relay',
        type: 'individualSports'
      }, {
        name: 'Athletics 4x100m Relay',
        type: 'individualSports'
      }, {
        name: 'Athletics Medley Relay',
        type: 'individualSports'
      }, {
        name: 'Swimming 4x50m Freestyle Relay',
        type: 'aquaticsSports'
      }, {
        name: 'Swimming 4x50m Medley Relay',
        type: 'aquaticsSports'
      }]
    }
  ]
  $scope.addSportsTest = function (data, sportType) {
    console.log(data, sportType, "check on sport click");
    var index = _.findIndex($scope[sportType], function (n) {
      return n.name == data;
    });
    if (index >= 0) {
      _.pullAt($scope[sportType], index);
    } else {
      $scope[sportType].push({
        name: data
      });
    }
    console.log($scope[sportType], "final push")
  }

  // SPORTS JSON END
});