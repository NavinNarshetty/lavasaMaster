myApp.controller('athleteAccountCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, crudService, $state, toastr, $uibModal) {
  //Used to name the .html file
  $scope.template = TemplateService.changecontent("accounts/athleteaccount");
  $scope.menutitle = NavigationService.makeactive("Athlete Account");
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

  $scope.formData = {};
  $scope.formData.packageData = [];
  $scope.formData.page = 1;
  // $scope.formData.type = '';
  $scope.formData.keyword = '';

  // SEARCHTABLE
  $scope.searchInTable = function (data) {
    $scope.formData.page = 1;
    if (data.length >= 2) {
      $scope.formData.keyword = data;
      $scope.viewTable();
    } else if (data.length == '') {
      $scope.formData.keyword = data;
      $scope.viewTable();
    }
  };

  // VIEW TABLE
  $scope.viewTable = function () {
    $scope.url = "Accounts/search";
    $scope.formData.page = $scope.formData.page++;
    $scope.formData.filter = {};
    // $scope.formData.filter.pageType = '';
    NavigationService.apiCall($scope.url, $scope.formData, function (data) {
      console.log("data.value", data);
      $scope.items = data.data.results;
      $scope.totalItems = data.data.total;
      $scope.maxRow = data.data.options.count;
      _.each($scope.items, function (key) {
        console.log(key._id, "key in array");
        $scope.getAthleteAccountDetails(key._id)
      })
    });
  }
  $scope.viewTable();
  // VIEW TABLE

  $scope.getAthleteAccountDetails = function (athleteAccountId) {
    console.log(athleteAccountId, "after function");
    $scope.url = "Accounts/getAccount";
    $scope.constraints = {}
    $scope.constraints._id = {}
    $scope.constraints._id = athleteAccountId;
    NavigationService.apiCall($scope.url, $scope.constraints, function (data) {
      console.log(data, "new api call")
      $scope.athleteData = data.data;
    })
  }


  $scope.editAccountModal = function (athleteId, accountId) {
    $scope.formData.athleteId = athleteId;
    $scope.formData._id = accountId;
    $scope.modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'views/modal/manualaccount.html',
      backdrop: 'static',
      keyboard: false,
      size: 'lg',
      scope: $scope

    });
  }

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

  $scope.deleteRow = function (formData, index) {
    console.log(formData, "check this");
    formData.packageData.splice(index, 1);
  }


  $scope.packageData = function () {
    $scope.url = "Package/getAllPackages";
    $scope.formData.param = 'athlete';
    NavigationService.apiCall($scope.url, $scope.formData, function (data) {
      console.log("packageNameData", data);
      $scope.packageNameData = data.data;
    });
  }
  $scope.packageData();

  $scope.athleteAccountData = {
    payementMode: 'Online,Cash,Online,Cash',
    packagea: '2000',
    packageb: '5000',
    packagec: '5000',
    packaged: '5000',
    sgst: '9%',
    cgst: '8%',
    discount: '5000',
    nettotal: '50000',
    modepay: 'cash',
    chaqtransctionno: '5a21034562bcd',
    receiptno: '1234567891',
    remark: 'check the Receipt',
  }


})