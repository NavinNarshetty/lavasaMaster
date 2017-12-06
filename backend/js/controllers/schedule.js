//DETAIL SCHEDULE
myApp.controller('DetailScheduleCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, toastr) {
  //Used to name the .html file
  $scope.template = TemplateService.changecontent("detailchampionschedule");
  $scope.menutitle = NavigationService.makeactive("Detail Champion Schedule");
  TemplateService.title = $scope.menutitle;
  $scope.navigation = NavigationService.getnav();
  $scope.formData = {};
  $scope.formData.pdfDetail = [];
  $scope.formData.page = 1;
  $scope.formData.type = '';
  $scope.formData.keyword = '';
  $scope.title = 'Create'

  if ($stateParams.id) {
    $scope.title = 'Edit'
    $scope.getOneOldSchoolById = function () {
      $scope.url = "Schedule/getOne";
      $scope.constraints = {};
      $scope.constraints._id = $stateParams.id;
      NavigationService.getOneOldSchoolById($scope.url, $scope.constraints, function (data) {
        $scope.formData = data.data;
        console.log($scope.formData, 'inside get one')
      });
    };
    $scope.getOneOldSchoolById();
  }

  $scope.getAllSportList = function (data) {
    $scope.url = "SportsListSubCategory/search";
    console.log(data);
    $scope.constraints = {};
    $scope.constraints.keyword = data;
    NavigationService.apiCall($scope.url, $scope.constraints, function (data) {
      console.log("data.value sportlist", data);
      $scope.sportitems = data.data.results;

    });
  };
  $scope.searchSportList = function (data) {
    $scope.draws = data;
  };


  $scope.addRow = function (formData) {
    if (!formData) {
      console.log(formData, "in add row");
      $scope.formData.pdfDetail.push({
        "pdfType": '',
        "textHeader": '',
        "pdfName": ''
      });
    } else {
      $scope.formData.pdfDetail.push({
        "pdfType": '',
        "textHeader": '',
        "pdfName": ''
      });
    }

  };
  $scope.addRow();

  $scope.deleteRow = function (formData, index) {
    console.log("in delete")
    formData.pdfDetail.splice(index, 1);
  };

  $scope.saveschedule = function (formData) {
    if (formData) {
      $scope.url = "Schedule/save";
      NavigationService.apiCall($scope.url, formData, function (data) {
        console.log("data.value", data);
        if (data.value === true) {
          toastr.success(" Saved Successfully", "SportList Message");
          $state.go('championschedule')
          if (data.data.nModified == '1') {
            toastr.success(" Modified Successfully", "SportList Message");
            $state.go('championschedule')
          }
        } else {
          toastr.error(" Something went Wrong", "Error");
        }

      });
    }
  };
  $scope.callMe = function (value, index) {
    if (value) {
      if (value === 'resultlink') {
        $scope.formData.pdfDetail[index].disableDirective = true;
      } else {
        $scope.formData.pdfDetail[index].disableDirective = false;
      }

    }
  };
});
//DETAIL SCHEDULE END

// TABLE SCHEDULE
myApp.controller('ChampionScheduleCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, toastr, $uibModal) {
  //Used to name the .html file
  $scope.template = TemplateService.changecontent("tablechampionsschedule");
  $scope.menutitle = NavigationService.makeactive("Champion Schedule");
  TemplateService.title = $scope.menutitle;
  $scope.navigation = NavigationService.getnav();
  $scope.formData = {};
  $scope.formData.page = 1;
  $scope.formData.type = '';
  $scope.formData.keyword = '';

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

  $scope.viewTable = function () {

    $scope.url = "Schedule/search";
    // $scope.search = $scope.formData.keyword;
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
    $scope.url = "Schedule/delete";
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
// TABLE SCHEDULE END