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

  // SEARCHTABLE
  $scope.searchInTable = function (data) {
    $scope.schoolformData.page = 1;
    if (data.length >= 2) {
      $scope.schoolformData.keyword = data;
      $scope.viewTable();
    } else if (data.length == '') {
      $scope.schoolformData.keyword = data;
      $scope.viewTable();
    }
  };

  // VIEW TABLE
  $scope.viewTable = function () {
    $scope.url = "Accounts/getSchoolAccount";
    $scope.schoolformData.page = $scope.schoolformData.page++;
    $scope.schoolformData.filter = {};
    NavigationService.apiCall($scope.url, $scope.schoolformData, function (data) {
      // console.log("data.value", data);
      $scope.items = data.data.results;
      $scope.totalItems = data.data.total;
      $scope.maxRow = data.data.options.count;
      _.each($scope.items, function (key) {
        key.schoolData = {};
        // console.log(key._id, "key in array");
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
          // console.log("key", key.schoolData);
        } else {
          // DO NOTHING
        }
      })
    });
  }
  $scope.viewTable();
  // VIEW TABLE

  // GET SCHOOL DATA
  $scope.getSchoolAccountDetails = function (schoolAccountId) {
    console.log(schoolAccountId, "after function");
    $scope.url = "Accounts/getOne";
    $scope.constraints = {}
    $scope.constraints._id = {}
    $scope.constraints._id = schoolAccountId;
    NavigationService.apiCall($scope.url, $scope.constraints, function (data) {
      // console.log(data, "new api call")
      $scope.schoolData = data.data;
    })
  }
  // GET SCHOOL DATA END

  // MODAL
  $scope.editAccountModal = function (school) {
    // console.log("school", school);
    // ASSIGN VALUES IN MODAL
    $scope.formData.school = school.school._id;
    $scope.formData._id = school._id;
    $scope.formData.cgst = school.schoolData.cgst;
    $scope.formData.sgst = school.schoolData.sgst;
    $scope.formData.igst = school.schoolData.igst;
    $scope.formData.discount = school.schoolData.discount;
    $scope.formData.netTotal = school.schoolData.totalPaid;
    $scope.formData.paymentMode = school.schoolData.paymentMode;
    $scope.formData.outstandingAmount = school.schoolData.outstandingAmount;
    // $scope.formData.checkNo = school.schoolData.checkNo;
    $scope.formData.remarks = school.schoolData.remarks;
    $scope.formData.transactions = school.schoolData.transaction;
    var upgradePackage = school.school.package;
    // console.log(upgradePackage, "check for package");

    // HIGHLIGHT PACKAGE 
    if (school.schoolData.transaction.length) {
      _.each(school.schoolData.transaction, function (key) {
        if (key.package._id == upgradePackage) {
          // console.log("key i am in value")
          key.currentSchoolPackage = true;
        }
      })
    }
    // HIGHLIGHT PACKAGE

    $scope.modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'views/modal/manualschool.html',
      // backdrop: 'static',
      keyboard: false,
      size: 'lg',
      scope: $scope,
      windowClass: 'accounts-modal'

    });
  }
  // MODAL END

  // ADD ROW
  $scope.manualPackageEntry = function (formData) {
    if (!formData) {
      $scope.formData.transactions.push({
        "dateOfTransaction": '',
        "finalPrice": '',
        "package": '',
        "receiptId": '',
        "checkNo": '',
        "isDelete": false
      })
    } else {
      formData.transactions.push({
        "dateOfTransaction": '',
        "finalPrice": '',
        "package": '',
        "receiptId": '',
        "checkNo": '',
        "isDelete": false
      })
    }
  }
  // ADD ROW FUNCTION END

  // DELETE ROW
  $scope.deleteRow = function (formData, index, status) {
    formData.transactions[index].isDelete = !status;
    formData.transactions.splice(index, 1);
    // console.log(formData, "check this");
  }
  // DELETE ROW END

  // PACKAGES
  $scope.packageData = function () {
    $scope.url = "Package/getAllPackages";
    $scope.formData.param = 'school';
    NavigationService.apiCall($scope.url, $scope.formData, function (data) {
      // console.log("packageNameData", data);
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
    if (data.igst == '' || data.isgt == 0 || !data.igst) {
      data.igst = 0;
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
    if (data.netTotal == '' || data.netTotal == 0 || !data.netTotal) {
      data.netTotal = 0;
    }
    console.log(data, "save data");
    $scope.url = "Transaction/saveCashTransaction";
    NavigationService.apiCall($scope.url, data, function (data) {
      // console.log("data saved", data);
      $scope.modalInstance.close();
    });
    $scope.viewTable();
  }
  // SAVE END
})