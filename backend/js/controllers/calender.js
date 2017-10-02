// TABLE CALENDER
myApp.controller('TableCalenderCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, toastr, $uibModal) {
  //Used to name the .html file
  $scope.template = TemplateService.changecontent("table-calender");
  $scope.menutitle = NavigationService.makeactive("Calender");
  TemplateService.title = $scope.menutitle;
  $scope.navigation = NavigationService.getnav();
  $scope.formData = {};
  $scope.formData.page = 1;
  $scope.formData.type = '';
  $scope.formData.keyword = '';

  // $scope.searchInTable = function (data) {
  //   console.log(data, 'search')
  //   $scope.formData.page = 1;
  //   console.log(data.length, "count")
  //   if (data.length >= 2) {
  //     console.log("iam in ")
  //     $scope.formData.keyword = data;
  //     $scope.viewTable();
  //   } else if (data.length == '') {
  //     $scope.formData.keyword = data;
  //     $scope.viewTable();
  //   }
  // }

  $scope.viewTable = function () {
    $scope.url = "SpecialEvent/search";
    $scope.formData.page = $scope.formData.page++;
    NavigationService.apiCall($scope.url, $scope.formData, function (data) {
      console.log("data.value", data);
      $scope.items = data.data.results;
      $scope.totalItems = data.data.total;
      $scope.maxRow = data.data.options.count;

    });

  }
  $scope.viewTable();

  $scope.confDel = function (data) {
    $scope.id = data;
    $scope.modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'views/modal/delete.html',
      backdrop: 'static',
      keyboard: false,
      size: 'sm',
      scope: $scope

    });
  };

  $scope.noDelete = function () {
    $scope.modalInstance.close();
  }
  $scope.delete = function (data) {
    console.log(data);
    $scope.url = "SpecialEvent/delete";
    $scope.constraints = {};
    $scope.constraints._id = data;
    NavigationService.apiCall($scope.url, $scope.constraints, function (data) {
      console.log("data.value", data);
      if (data.value) {
        toastr.success('Successfully Deleted', 'Special Event');
        $scope.modalInstance.close();
        $scope.viewTable();
      } else {
        toastr.error('Something went wrong while Deleting', 'Special Event');
      }

    });
  }

});

// TABLE CALENDER END


// DETAIL CALENDER
myApp.controller('DetailCalenderCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, toastr) {
  //Used to name the .html file
  $scope.template = TemplateService.changecontent("detail-calender");
  $scope.menutitle = NavigationService.makeactive("Detail Calender");
  TemplateService.title = $scope.menutitle;
  $scope.navigation = NavigationService.getnav();
  console.log("$stateParams.id", $stateParams.id);
  if ($stateParams.id != '') {
    console.log("edit")
    $scope.title = "Edit";
    $scope.getOneOldSchoolById = function () {
      $scope.url = "SpecialEvent/getOne";
      $scope.constraints = {};
      $scope.constraints._id = $stateParams.id;
      console.log($stateParams.id);
      NavigationService.apiCall($scope.url, $scope.constraints, function (data) {
        console.log("data.value sportlist", data);
        $scope.formData = data.data;
      });
    }
    $scope.getOneOldSchoolById();

  } else {

  }


  $scope.savecalender = function (data) {
    console.log("i am in ");
    console.log(data, "save")
    $scope.url = "SpecialEvent/save";
    NavigationService.apiCall($scope.url, data, function (data) {
      if (data.value) {
        toastr.success("Data saved successfully", 'Success');
        $state.go('calender')
      } else {
        toastr.error("Something went wrong", 'Error');
      }
    })
  }
});

// DETAIL CALENDER END