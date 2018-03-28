// TABLE COUPON CODE
myApp.controller('CouponCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, crudService, $state, toastr, $uibModal) {
  //Used to name the .html file
  $scope.template = TemplateService.changecontent("package/coupon/tablecoupon");
  $scope.menutitle = NavigationService.makeactive("Coupon Code");
  TemplateService.title = $scope.menutitle;
  $scope.navigation = NavigationService.getnav();

  // VAR
  $scope.formData = {};
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
    $scope.url = "CouponCode/search";
    $scope.formData.page = $scope.formData.page++;
    $scope.formData.filter = {};
    // $scope.formData.filter.pageType = '';
    NavigationService.apiCall($scope.url, $scope.formData, function (data) {
      console.log("data.value", data);
      $scope.items = data.data.results;
      $scope.totalItems = data.data.total;
      $scope.maxRow = data.data.options.count;
    });
  }
  $scope.viewTable();
  // VIEW TABLE

  // DELETE
  $scope.crudService = crudService;
  var url = "CouponCode/delete";
  $scope.confirmDelete = function (data) {
    crudService.confirmDelete(data, url, $scope);
  };
  // DELETE END
})

// TABLE COUPON CODE END


// DETAIL COUPON 
myApp.controller('detailCouponCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, crudService, $state, toastr, $uibModal) {
  //Used to name the .html file
  $scope.template = TemplateService.changecontent("package/coupon/detailcoupon");
  $scope.menutitle = NavigationService.makeactive("Detail Coupon");
  TemplateService.title = $scope.menutitle;
  $scope.navigation = NavigationService.getnav();

  var url = 'CouponCode';
  // GET ONE
  // GET ONE
  if ($stateParams.id) {
    $scope.title = 'Edit';
    var id = $stateParams.id;
    crudService.getOneData(url, id, function (data) {
      if (data) {
        $scope.formData = data;
      }
    });
  }
  // GET ONE END
  // GET ONE END


  // SAVE FUNCTION
  var state = 'couponcode';
  $scope.saveData = function (data) {
    crudService.saveData(data, url, state);
  };
  // SAVE FUNCTION END
})
// DETAIL COUPON  END