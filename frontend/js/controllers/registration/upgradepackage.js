myApp.controller('UpgradePackageCtrl', function ($scope, $stateParams, TemplateService, NavigationService, $timeout, $uibModal, $filter, configService, toastr, $state, loginService) {
  $scope.template = TemplateService.getHTML("content/registration/upgrade-package.html");
  TemplateService.title = "School Registration Form"; //This is the Title of the Website
  $scope.navigation = NavigationService.getNavigation();
  // START
  // VARIABLES
  $scope.disableUpgrade = false;
  $scope.showPaymentTab = false;
  $scope.packages = [];
  $scope.flag = $stateParams.type;
  // SET FLAGS
  if ($scope.flag == 'player') {
    $scope.pageType = 'athlete';
  } else if ($scope.flag == 'school' || $scope.flag == 'college') {
    $scope.pageType = 'school';
  } else {
    $state.go('registerplayer', {
      type: 'player'
    });
  }
  // SET FLAGS END
  if ($stateParams.id) {
    $scope.pageData = {
      // _id: "5ac374ad4a0b3006e5a7b97d"
      _id: $stateParams.id
    };
  } else {
    $state.go('registerplayer', {
      type: $scope.pageType
    });
  }
  $scope.formData = {
    package: "",
    registrationFee: ""
  }
  $scope.formPackage = {
    filter: {
      packageUser: $scope.pageType
    }
  };
  // CHECK LOGIN
  loginService.loginGet(function(data){
    $scope.loginCheck = data;
    if ($scope.loginCheck.isLoggedIn == false) {
      toastr.error("Please login to upgrade", "Error");
      $state.go('registerplayer', {
        type: $scope.flag
      });
    } else if ($scope.loginCheck.userType != $scope.pageType) {
      console.log("Type no match");
      toastr.error("User type does not match", "Error");
      $state.go('registerplayer', {
        type: $scope.flag
      });
    } else {
      console.log("log in and type match");
    }
  })
  // CHECK LOGIN END
  // VARIABLES END
  // FUNCTIONS
  // SET PACKAGE DETAILS
  $scope.setPackageDetails = function (id, type) {
    var selectedPackage = _.find($scope.packages, ['_id', id]);
    console.log("select", selectedPackage);
    $scope.formData.package = selectedPackage._id;
    $scope.formData.packageName = selectedPackage.name;
    $scope.formData.order = selectedPackage.order;
    // if ($scope.formData.paymentStatus == 'Pending') {
    //   $scope.formData.amountToPay = selectedPackage.finalPrice + $scope.formData.outstandingAmount;
    //   console.log($scope.formData.amountToPay , selectedPackage.finalPrice , $scope.formData.outstandingAmount , $scope.formData.totalPaid);
    // } else{
    //   $scope.formData.amountToPay = selectedPackage.finalPrice;
    // }
    $scope.formData.amountToPay = selectedPackage.finalPrice;
    // var paidPrice = $scope.formData.amountToPay - $scope.formData.totalPaid;
    $scope.formData.cgstAmt = 0;
    $scope.formData.cgstPercent = 0;
    $scope.formData.sgstAmt = 0;
    $scope.formData.sgstPercent = 0;
    $scope.formData.igstAmt = 0;
    $scope.formData.igstPercent = 0;
    $scope.formData.discount = 0;
    if (selectedPackage.cgstPercent && selectedPackage.sgstPercent) {
      $scope.formData.cgstPercent = selectedPackage.cgstPercent;
      $scope.formData.cgstAmt = _.round(TemplateService.calculatePercentage($scope.formData.amountToPay, $scope.formData.cgstPercent));
      $scope.formData.sgstPercent = selectedPackage.sgstPercent;
      $scope.formData.sgstAmt = _.round(TemplateService.calculatePercentage($scope.formData.amountToPay, $scope.formData.sgstPercent));
      $scope.formData.amountPaid = $scope.formData.amountToPay + $scope.formData.cgstAmt + $scope.formData.sgstAmt - $scope.formData.totalPaid;
    } else if (selectedPackage.igstPercent) {
      $scope.formData.igstPercent = selectedPackage.igstPercent;
      $scope.formData.igstAmt = _.round(TemplateService.calculatePercentage($scope.formData.amountToPay, $scope.formData.igstPercent));
      $scope.formData.amountPaid = $scope.formData.amountToPay + $scope.formData.igstAmt - $scope.formData.totalPaid;
    }
    if (type == 'click') {
      $scope.showPaymentTab = true;
    }
  }
  // SET PACKAGE DETAILS
  // THANKYOU MODAL
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
  // THANKYOU MODAL END
  // UPGRADE PACKAGE
  $scope.packageUpgrade = function (formData) {
    $scope.formData.upgrade = true;
    // console.log("upgrade", formData);
    if (formData.registrationFee != "") {
      $scope.disableUpgrade = true;
      if ($scope.formData.package != $scope.currentPackage._id) {
        $scope.disableUpgrade = true;
        NavigationService.upgradeAccount(formData, function (data) {
          console.log("upgrade return", data);
          if (formData.registrationFee == "online PAYU") {
            $scope.disableUpgrade = true;
            console.log($scope.disableUpgrade, "payu");
            if (formData.athlete) {
              var id = formData.athlete;
              console.log("id**", id);
              var url = "payU/upgradeAthletePayment?id=" + id;
              window.location.href = adminUrl2 + url;
            } else {
              var id = formData.school;
              console.log("id**", id);
              var url = "payU/upgradeSchoolPayment?id=" + id;
              window.location.href = adminUrl2 + url;
            }
          } else if(formData.registrationFee == "cash") {
            $scope.disableUpgrade = true;
            toastr.success("Package upgraded Successfully");
            $state.go("sports-selection");
            console.log($scope.disableUpgrade, "cash");
          }
        });
      } else {
        $scope.disableUpgrade = false;
        toastr.warning("Cannot upgrade to the current package. Please select a different package to upgrade");
      }
    } else {
      toastr.error("Please select Mode of Payment");
      $scope.disableUpgrade = false;
    }
  }
  // UPGRADE PACKAGE END
  // GET ATHLETE DATA
  $scope.getStatusUpgrade = function () {
    NavigationService.getStatusUpgrade($scope.pageData, function (data) {
      data = data.data;
      if (data.value == true) {
        $scope.detail = data.data;
        console.log($scope.detail, $scope.loginCheck, '111');
        if ($scope.pageType == 'athlete') {
          if ($scope.loginCheck.sfaIdObj == $scope.detail.athlete.sfaId) {
            $scope.formData.athlete = $scope.detail.athlete._id;
            $scope.currentPackage = _.find($scope.packages, ['_id', $scope.detail.athlete.package]);
            $scope.setPackageDetails($scope.detail.athlete.package, 'load');
          } else {
            console.log("ID NO match");
            toastr.error("User does not match", "Error");
            $state.go('registerplayer', {
              type: $scope.flag
            });
          }
        } else if ($scope.pageType == 'school') {
          if ($scope.loginCheck.sfaIdObj == $scope.detail.school.sfaId) {

            $scope.formData.school = $scope.detail.school._id;
            $scope.currentPackage = _.find($scope.packages, ['_id', $scope.detail.school.package]);
            $scope.setPackageDetails($scope.detail.school.package, 'load');
          } else {
            console.log("ID NO match");
            toastr.error("User does not match", "Error");
            $state.go('registerplayer', {
              type: $scope.flag
            });
          }
        }
        console.log("ath", $scope.detail);
        $scope.formData.outstandingAmount = $scope.detail.outstandingAmount;
        $scope.formData.totalPaid = $scope.detail.totalPaid || 0;
        $scope.formData.totalToPay = $scope.detail.totalToPay || 0;
        var len = $scope.detail.transaction.length;
        if (len > 0) {
          $scope.formData.paymentStatus = $scope.detail.transaction[len - 1].paymentStatus;
          console.log($scope.formData.paymentStatus, "pay");
        }
        console.log("athlete", $scope.detail);
      } else {
        console.log("Error in getOne athlete", data);
      }
    });
  }

  // GET ATHLETE DATA END
  // FUNCTIONS END
  // API
  // GET PACKAGES
  NavigationService.getPackages($scope.formPackage, function (data) {
    data = data.data;
    // console.log("dat",data);
    if (data.value = true) {
      $scope.packages = data.data.results;
      $scope.getStatusUpgrade();
      // console.log("packages", $scope.packages);
    } else {
      console.log("packages search failed", data);
    }
  });
  // GET PACKAGES END
  // API END
  // END
});
