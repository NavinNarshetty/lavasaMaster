myApp.controller('UpgradePackageCtrl', function ($scope, TemplateService, NavigationService, $timeout, $uibModal, $filter, configService) {
  $scope.template = TemplateService.getHTML("content/registration/upgrade-package.html");
  TemplateService.title = "School Registration Form"; //This is the Title of the Website
  $scope.navigation = NavigationService.getNavigation();
  // START
  // VARIABLES
  $scope.showPaymentTab = false;
  $scope.packages = [];
  $scope.formData = {
    package:""
  }
  // $scope.features = [];
  $scope.formPackage = {
    filter: {
      packageUser: 'athlete'
    }
  };
  $scope.athleteData = {
    // _id: "5ac25bacfb4c255959bcba32"
    _id: "5ac374ad4a0b3006e5a7b97d"
  };
  // VARIABLES END
  // FUNCTIONS
  $scope.setPackageDetails = function(id, type){
    var selectedPackage = _.find($scope.packages, ['_id', id]);
    console.log("select", selectedPackage);
      $scope.formData.package= selectedPackage._id;
      $scope.formData.packageName= selectedPackage.name;
      $scope.formData.order= selectedPackage.order;
      $scope.formData.amountToPay= selectedPackage.finalPrice + $scope.formData.outstandingAmount - $scope.formData.totalPaid;
      $scope.formData.cgstAmt= '';
      $scope.formData.cgstPercent= '';
      $scope.formData.sgstAmt= '';
      $scope.formData.sgstPercent= '';
      $scope.formData.igstAmt= '';
      $scope.formData.igstPercent= '';
    $scope.formData.discount= selectedPackage.discount || 0;
    if (selectedPackage.cgstPercent && selectedPackage.sgstPercent) {
      $scope.formData.cgstAmt = selectedPackage.cgstAmt;
      $scope.formData.cgstPercent = selectedPackage.cgstPercent;
      $scope.formData.sgstAmt = selectedPackage.sgstAmt;
      $scope.formData.sgstPercent = selectedPackage.sgstPercent;
      $scope.formData.amountPaid =  $scope.formData.amountToPay + $scope.formData.cgstAmt + $scope.formData.sgstAmt;
    } else if (selectedPackage.igstPercent) {
      $scope.formData.igstAmt = selectedPackage.igstAmt;
      $scope.formData.igstPercent = selectedPackage.igstPercent;
      $scope.formData.amountPaid =  $scope.formData.amountToPay + $scope.formData.igstAmt;
    }
    if (type == 'click') {
      $scope.showPaymentTab = true;
    }
  }
  // UPGRADE PACKAGE
  $scope.packageUpgrade = function(formData){
    console.log("upgrade", formData);
    $scope.formData.upgrade = true;
    // if (formData.registrationFee == 'online PAYU') {
    //   formData.outstandingAmount = 0;
    // }
    NavigationService.upgradeAccount(formData, function(data){
      console.log("upgrade ret", data);
    });
  }
  // UPGRADE PACKAGE END
  // FUNCTIONS END
  // API
  // GET PACKAGES
  NavigationService.getPackages($scope.formPackage,function(data){
    data = data.data;
    // console.log("dat",data);
    if (data.value = true) {
      $scope.packages = data.data.results;
      // console.log("packages", $scope.packages);
    } else {
      console.log("packages search failed", data);
    }
  });
  // GET PACKAGES END
  // GET ATHLETE DATA
  NavigationService.getStatusUpgrade($scope.athleteData, function(data){
    data = data.data;
    if (data.value == true) {
      $scope.athleteDetail = data.data;
      console.log("ath", $scope.athleteDetail);
      $scope.formData.athlete = $scope.athleteDetail.athlete._id;
      $scope.formData.outstandingAmount= $scope.athleteDetail.outstandingAmount;
      $scope.formData.totalPaid= $scope.athleteDetail.totalPaid;
      $scope.formData.totalToPay= $scope.athleteDetail.totalToPay;
      $scope.currentPackage = _.find($scope.packages, ['_id', $scope.athleteDetail.athlete.package]);
      $scope.setPackageDetails($scope.athleteDetail.athlete.package, 'load');
      console.log("athlete", $scope.athleteDetail);
    } else {
      console.log("Error in getOne athlete", data);
    }
  });
  // GET ATHLETE DATA END
  // API END
  // END
});
