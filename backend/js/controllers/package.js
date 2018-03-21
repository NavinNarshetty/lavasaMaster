// TABLE GALLERY
myApp.controller('PackageCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, toastr, $uibModal) {
  //Used to name the .html file
  $scope.template = TemplateService.changecontent("playerregistration/tablepackage");
  $scope.menutitle = NavigationService.makeactive("Ad Gallery");
  TemplateService.title = $scope.menutitle;
  $scope.navigation = NavigationService.getnav();

  // VAR
  $scope.formData = {};
  $scope.formData.page = 1;
  $scope.formData.type = '';
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
    $scope.url = "AdGallery/search";
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
    // console.log(data);
    $scope.url = "AdGallery/delete";
    $scope.constraints = {};
    $scope.constraints._id = data;
    NavigationService.apiCall($scope.url, $scope.constraints, function (data) {
      if (data.value) {
        toastr.success('Successfully Deleted', 'Age Group Message');
        $scope.modalInstance.close();
        $scope.viewTable();
      } else {
        toastr.error('Something Went Wrong while Deleting', 'Age Group Message');
      }
    });
  }
});

// DETAIL GALLERY
myApp.controller('DetailAdGalleryCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, toastr, $uibModal) {
  //Used to name the .html file
  $scope.template = TemplateService.changecontent("adbanners/detailadgallery");
  $scope.menutitle = NavigationService.makeactive("Detail Gallery");
  TemplateService.title = $scope.menutitle;
  $scope.navigation = NavigationService.getnav();


  // GETONE
  if ($stateParams.id != '') {
    $scope.title = 'Edit';
    $scope.url = "AdGallery/getOne"
    $scope.constraints = {};
    $scope.constraints._id = $stateParams.id;
    $scope.getOneAdGallery = function () {
      NavigationService.apiCall($scope.url, $scope.constraints, function (data) {
        console.log(data, "get on data");
        $scope.formData = data.data;
      })
    }
    $scope.getOneAdGallery();
  }


  // SAVEDATA
  $scope.saveData = function (data) {
    console.log(data, "save data")
    $scope.url = "AdGallery/save";
    NavigationService.apiCall($scope.url, data, function (data) {
      console.log(data, "data insode api")
      if (data.value) {
        if (data.data.nModified == 1) {
          toastr.success('Ad Updated Successfully', 'Ad Gallery')
          $state.go('adgallery')
        } else {
          toastr.success('Ad saved Successfully ', 'Ad Gallery');
          $state.go('adgallery')
        }
      } else {
        toastr.error("Something went wrong", 'Error')
      }
    });
  };
  // SAVEDATA END
});