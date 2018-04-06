myApp.controller('UpgradePackageCtrl', function ($scope, $stateParams, TemplateService, NavigationService, $timeout, $uibModal, $filter, configService, toastr, $state) {
  $scope.template = TemplateService.getHTML("content/registration/upgrade-package.html");
  TemplateService.title = "School Registration Form"; //This is the Title of the Website
  $scope.navigation = NavigationService.getNavigation();
  // START
  // VARIABLES
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
        type: data.type
    });
  }
  $scope.formData = {
    package: ""
  }
  $scope.formPackage = {
    filter: {
      packageUser: $scope.pageType
    }
  };
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
    $scope.formData.cgstAmt = '';
    $scope.formData.cgstPercent = '';
    $scope.formData.sgstAmt = '';
    $scope.formData.sgstPercent = '';
    $scope.formData.igstAmt = '';
    $scope.formData.igstPercent = '';
    $scope.formData.discount = selectedPackage.discount || 0;
    if (selectedPackage.cgstPercent && selectedPackage.sgstPercent) {
      $scope.formData.cgstAmt = selectedPackage.cgstAmt;
      $scope.formData.cgstPercent = selectedPackage.cgstPercent;
      $scope.formData.sgstAmt = selectedPackage.sgstAmt;
      $scope.formData.sgstPercent = selectedPackage.sgstPercent;
      $scope.formData.amountPaid = $scope.formData.amountToPay - $scope.formData.totalPaid + $scope.formData.cgstAmt + $scope.formData.sgstAmt;
    } else if (selectedPackage.igstPercent) {
      $scope.formData.igstAmt = selectedPackage.igstAmt;
      $scope.formData.igstPercent = selectedPackage.igstPercent;
      $scope.formData.amountPaid = $scope.formData.amountToPay - $scope.formData.totalPaid + $scope.formData.igstAmt;
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
    if (formData.registrationFee != '') {
      NavigationService.upgradeAccount(formData, function (data) {
        console.log("upgrade return", data);
        if (formData.registrationFee == "online PAYU") {
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
        } else {
          toastr.success("Package upgraded Successfully");
          $state.go("sports-selection");
        }
      });
    } else {
      toastr.error("Please select Mode of Payment");
    }
  }
  // UPGRADE PACKAGE END
  // GET ATHLETE DATA
  $scope.getStatusUpgrade = function(){
    NavigationService.getStatusUpgrade($scope.pageData, function (data) {
      data = data.data;
      if (data.value == true) {
        $scope.detail = data.data;
        if ($scope.pageType == 'athlete') {
          $scope.formData.athlete = $scope.detail.athlete._id;
          $scope.currentPackage = _.find($scope.packages, ['_id', $scope.detail.athlete.package]);
          $scope.setPackageDetails($scope.detail.athlete.package, 'load');
        } else if ($scope.pageType == 'school') {
          $scope.formData.school = $scope.detail.school._id;
          $scope.currentPackage = _.find($scope.packages, ['_id', $scope.detail.school.package]);
          $scope.setPackageDetails($scope.detail.school.package, 'load');
        }
        console.log("ath", $scope.detail);
        $scope.formData.outstandingAmount = $scope.detail.outstandingAmount;
        $scope.formData.totalPaid = $scope.detail.totalPaid;
        $scope.formData.totalToPay = $scope.detail.totalToPay;
        var len = $scope.detail.transaction.length;
        if(len > 0){
          $scope.formData.paymentStatus = $scope.detail.transaction[len-1].paymentStatus;
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
