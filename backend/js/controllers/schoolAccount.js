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
      // $scope.maxRow = data.data.options.count;
      _.each($scope.items, function (key) {
        console.log(key._id, "key in array");
        if (key._id) {
          $scope.getSchoolAccountDetails(key._id)
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
    $scope.url = "Accounts/getAccount";
    $scope.constraints = {}
    $scope.constraints._id = {}
    $scope.constraints._id = schoolAccountId;
    NavigationService.apiCall($scope.url, $scope.constraints, function (data) {
      console.log(data, "new api call")
      $scope.schoolData = data.data.school;
    })
  }
  // GET ATHLETE DATA END

  // MODAL
  $scope.editAccountModal = function (schoolId, accountId, transactionData) {
    $scope.formData.school = schoolId;
    $scope.formData._id = accountId;
    $scope.formData.transaction = transactionData;
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
      $scope.formData.packageData.push({
        "package": '',
        "reciptNo": ''
      })
    } else {
      formData.packageData.push({
        "package": '',
        "reciptNo": ''
      })
    }
  }
  // ADD ROW FUNCTION END

  // DELETE ROW
  $scope.deleteRow = function (formData, index) {
    console.log(formData, "check this");
    formData.packageData.splice(index, 1);
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
    console.log(data, "save data");
    $scope.url = "Transaction/saveCashTransaction";
    NavigationService.apiCall($scope.url, data, function (data) {
      console.log("data saved", data);
      $scope.modalInstance.close();
    });
  }
  // SAVE END
})