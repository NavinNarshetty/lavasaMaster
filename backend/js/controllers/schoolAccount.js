myApp.controller('schoolAccountCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, crudService, $state, toastr, $uibModal) {
  //Used to name the .html file
  $scope.template = TemplateService.changecontent("accounts/school/schoolaccount");
  $scope.menutitle = NavigationService.makeactive("School Account");
  TemplateService.title = $scope.menutitle;
  $scope.navigation = NavigationService.getnav();

  // ACCORDIAN

  $scope.oneAtATime = true;
  $scope.status = {
    isCustomHeaderOpen: false,
    isFirstOpen: true,
    isFirstDisabled: false
  };
  // END ACCORDIAN

  // VARIABLE
  $scope.formData = {};
  $scope.schoolformData = {};
  $scope.formData.packageData = [];
  $scope.formData.transaction = [];
  $scope.schoolformData.page = 1;
  $scope.schoolformData.keyword = '';

  // VIEW TABLE
  $scope.viewTable = function () {
    $scope.url = "Accounts/getSchoolAccount";
    $scope.schoolformData.page = $scope.schoolformData.page++;
    $scope.schoolformData.filter = {};
    NavigationService.apiCall($scope.url, $scope.schoolformData, function (data) {
      console.log("data.value", data);
      $scope.items = data.data.results;
      $scope.totalItems = data.data.total;
      $scope.maxRow = data.data.options.count;
      _.each($scope.items, function (key) {
        key.schoolData = {};
        console.log(key._id, "key in array");
        if (key._id) {
          // key.schoolData = $scope.getSchoolAccountDetails(key._id);
          key.schoolData = {};
          $scope.getOneUrl = "Accounts/getAccount";
          $scope.getOneConstraints = {}
          $scope.getOneConstraints._id = {}
          $scope.getOneConstraints._id = key._id;
          NavigationService.apiCall($scope.getOneUrl, $scope.getOneConstraints, function (data) {
            key.schoolData = data.data;
            if (data.data.display) {
              key.displayData = data.data.display;
            }
            // console.log("getOne", key.schoolData);
          })
          console.log("key", key.schoolData);
        } else {
          // DO NOTHING
        }
      })
    });
  }
  $scope.viewTable();
  // VIEW TABLE
  // GET ATHLETE DATA
  $scope.getSchoolAccountDetails = function (schoolAccountId) {
    console.log(schoolAccountId, "after function");
    $scope.url = "Accounts/getOne";
    $scope.constraints = {}
    $scope.constraints._id = {}
    $scope.constraints._id = schoolAccountId;
    NavigationService.apiCall($scope.url, $scope.constraints, function (data) {
      console.log(data, "new api call")
      $scope.schoolData = data.data;
    })
  }
  // GET ATHLETE DATA END

  // MODAL
  $scope.editAccountModal = function (school) {
    console.log("school", school);
    $scope.formData.school = school.school._id;
    $scope.formData._id = school._id;
    $scope.formData.cgst = school.schoolData.cgst;
    $scope.formData.sgst = school.schoolData.sgst;
    $scope.formData.igst = school.schoolData.igst;
    $scope.formData.discount = school.schoolData.discount;
    $scope.formData.netTotal = school.schoolData.totalPaid;
    $scope.formData.paymentMode = school.schoolData.paymentMode;
    // $scope.formData.checkNo = school.schoolData.checkNo;
    $scope.formData.remarks = school.schoolData.remarks;
    $scope.formData.transactions = school.schoolData.transaction;
    // CONVERT RECEIPT ARRAY TO COMMA SEPERATED STRING
    // _.each($scope.formData.transaction, function(n){
    //   n.receiptNo = "";
    //   _.each(n.receiptId, function(m){
    //     console.log("m", m);
    //     if (n.receiptNo == "") {
    //       n.receiptNo = m;
    //     } else {
    //       n.receiptNo = n.receiptNo + ',' + m;
    //     }
    //   });
    //   console.log("n.receiptNo", n.receiptNo);
    // });
    // CONVERT RECEIPT ARRAY TO COMMA SEPERATED STRING END

    $scope.modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'views/modal/manualschool.html',
      // backdrop: 'static',
      keyboard: false,
      size: 'lg',
      scope: $scope

    });
  }
  // MODAL END

  // ADD ROW
  $scope.manualPackageEntry = function (formData) {
    if (!formData) {
      $scope.formData.transactions.push({
        "package": '',
        "receiptId": '',
        "checkNo": '',
      })
    } else {
      formData.transactions.push({
        "package": '',
        "receiptId": '',
        "checkNo": '',
      })
    }
  }
  // ADD ROW FUNCTION END

  // DELETE ROW
  $scope.deleteRow = function (formData, index) {
    console.log(formData, "check this");
    formData.transactions.splice(index, 1);
  }
  // DELETE ROW END

  // PACKAGES
  $scope.packageData = function () {
    $scope.url = "Package/getAllPackages";
    $scope.formData.param = 'school';
    NavigationService.apiCall($scope.url, $scope.formData, function (data) {
      console.log("packageNameData", data);
      $scope.packageNameData = data.data;
    });
  }
  $scope.packageData();
  // PACKAGES END

  // SAVE
  $scope.saveTable = function (data) {
    if (data.sgst == '' || data.sgst == 0 || !data.sgst) {
      data.sgst = 0;
    }
    if (data.cgst == '' || data.cgst == 0 || !data.cgst) {
      data.cgst = 0;
    }
    if (data.discount == '' || data.discount == 0 || !data.discount) {
      data.discount = 0;
    }
    if (data.outstandingAmount == '' || data.outstandingAmount == 0 || !data.outstandingAmount) {
      data.outstandingAmount = 0;
    }
    console.log(data, "save data");
    $scope.url = "Transaction/saveCashTransaction";
    NavigationService.apiCall($scope.url, data, function (data) {
      console.log("data saved", data);
      $scope.modalInstance.close();
    });
  }
  // SAVE END
})