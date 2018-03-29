///***************************START OF PACKAGE************************** */
myApp.controller('PackageCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, crudService, $state, toastr, $uibModal) {
  //Used to name the .html file
  $scope.template = TemplateService.changecontent("package/detailpackage/tablepackage");
  $scope.menutitle = NavigationService.makeactive("Package");
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
    $scope.url = "Package/search";
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
  var url = "Package/delete";
  $scope.confirmDelete = function (data) {
    crudService.confirmDelete(data, url, $scope);
  };
  // DELETE END


});

// DETAIL PACKAGE
myApp.controller('DetailPackageCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, crudService, $state, toastr, $uibModal) {
  //Used to name the .html file
  $scope.template = TemplateService.changecontent("package/detailpackage/detailpackage");
  $scope.menutitle = NavigationService.makeactive("Detail Package");
  TemplateService.title = $scope.menutitle;
  $scope.navigation = NavigationService.getnav();
  $scope.title = 'Create';
  $scope.formData = {};
  $scope.formData.pageType = ' ';

  var url = 'Package';
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
  var state = 'package';
  $scope.saveData = function (data) {
    crudService.saveData(data, url, state);
  };
  // SAVE FUNCTION END


  //
  $scope.onCancel = function (state) {
    $state.go(state);
  };

});
///***************************END OF PACKAGE************************** */



///***************************START OF FEATURED PACKAGE************************** */
// TABLE FEATURE PACKAGE
myApp.controller('featurePackageCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, crudService, $state, toastr, $uibModal) {
  //Used to name the .html file
  $scope.template = TemplateService.changecontent("package/featuredpackage/featuretable");
  $scope.menutitle = NavigationService.makeactive("Package");
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
  }

  // VIEW TABLE
  $scope.viewTable = function () {
    $scope.url = "Featurepackage/search";
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
  var url = "Featurepackage/delete";
  $scope.confirmDelete = function (data) {
    crudService.confirmDelete(data, url, $scope);
  };
  // DELETE END






});

// DETAIL FEATURE PACKAGE
myApp.controller('detailFeatureCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, crudService, $state, toastr, $uibModal) {
  //Used to name the .html file
  $scope.template = TemplateService.changecontent("package/featuredpackage/detailfeature");
  $scope.menutitle = NavigationService.makeactive("Detail Package");
  TemplateService.title = $scope.menutitle;
  $scope.navigation = NavigationService.getnav();
  $scope.title = 'Create';
  $scope.packages = [];
  $scope.formData = {};
  $scope.formData = {};
  $scope.formData.featureDetails = [];
  $scope.formData.pageType = ' ';
  var url = 'Featurepackage';

  $scope.formData.featureUserType = ''

  $scope.getAllPackages = function (filterName) {
    console.log('filter', filterName);
    $scope.url = "package/search";
    $scope.getpackageobj = {};
    $scope.getpackageobj.filter = {};
    $scope.getpackageobj.filter.packageUser = filterName;

    NavigationService.apiCall($scope.url, $scope.getpackageobj, function (data) {
      console.log("data.value", data);
      if (data.value == true) {
        $scope.packages = data.data.results;
        $scope.totalItems = data.data.total;
        $scope.maxRow = data.data.options.count;
      }
    });

  }
  // END OF GET ALL PACKAGE

  // GET ONE
  // GET ONE
  if ($stateParams.id) {
    $scope.title = 'Edit';
    var id = $stateParams.id;
    crudService.getOneData(url, id, function (data) {
      if (data) {
        $scope.formData = data;
        $scope.getAllPackages($scope.formData.featureUserType, function (data) {
          _.each($scope.formData.featureDetails, function (key) {
            var obj = _.find(data.data.results, ['_id', key.packageName]);
            key.tempobj = {};
            key.tempobj._id = key.packageName;
            key.tempobj.name = obj.name;
            key.packageName = key.tempobj;
          });
        });
      }
    });
  }
  // GET ONE END
  // GET ONE END


  // SAVE FUNCTION
  var state = 'featurepackage';
  $scope.saveData = function (data) {
    _.each(data.featureDetails, function (key) {
      key.packageName = key.packageName._id;
    });
    crudService.saveData(data, url, state);
  };
  // SAVE FUNCTION END


  //
  $scope.onCancel = function (state) {
    $state.go(state);
  };

  //ADD


  $scope.formData.featureDetails.push({
    "packageName": '',
    "featureType": '',
    "featureCheck": '',
    "featureText": ''
  });

  $scope.addRow = function () {
    $scope.formData.featureDetails.push({
      "packageName": '',
      "featureType": '',
      "featureCheck": '',
      "featureText": ''
    });

  };
  console.log("$scope.formData", $scope.formData.featureDetails.length);
  $scope.deleteRowButton = function (formData, index) {
    console.log("$index", index);

    $scope.formData.featureDetails.splice(index, 1);
    // $scope.formData.featureDetails
    console.log("formdata", $scope.formData.featureDetails);


  };


});


///***************************END OF FEATURED PACKAGE************************** */