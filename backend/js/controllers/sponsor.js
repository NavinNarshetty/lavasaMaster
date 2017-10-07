// TABLE SPONSOR
myApp.controller('SponsorCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, toastr, $uibModal) {
  //Used to name the .html file
  $scope.template = TemplateService.changecontent("tablesponsor");
  $scope.menutitle = NavigationService.makeactive("Sponsor");
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

    $scope.url = "SponsorPage/search";
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
    $scope.url = "SponsorPage/delete";
    $scope.constraints = {};
    $scope.constraints._id = data;
    NavigationService.apiCall($scope.url, $scope.constraints, function (data) {
      if (data.value) {
        toastr.success('Successfully Deleted', 'Sponsor Page');
        $scope.modalInstance.close();
        $scope.viewTable();
      } else {
        toastr.error('Something Went Wrong while Deleting', 'Sponsor Page');
      }
    });
  }
});
// TABLE SPONSOR END


// DETAIL SPONSOR
myApp.controller('DetailSponsorCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, toastr) {
  //Used to name the .html file
  $scope.template = TemplateService.changecontent("detailsponsor");
  $scope.menutitle = NavigationService.makeactive("Detail Sponsor");
  TemplateService.title = $scope.menutitle;
  $scope.navigation = NavigationService.getnav();
  $scope.formData = {};
  $scope.formData.videoGallery = [];

  if ($stateParams.id) {
    $scope.getOneOldSchoolById = function () {
      $scope.url = 'SponsorPage/getOne';
      $scope.constraints = {};
      $scope.constraints._id = $stateParams.id;
      NavigationService.getOneOldSchoolById($scope.url, $scope.constraints, function (data) {
        $scope.formData = data.data;
      });
    };
    $scope.getOneOldSchoolById();
  }

  $scope.savesponsor = function (data) {
    console.log("i am in ");
    console.log(data, "save")
    _.each(data.videoGallery, function (n) {
      n.videoType = "video";
    });
    _.each(data.galleryImage, function (n) {
      n.videoType = "image";
    })
    $scope.url = "SponsorPage/save";
    NavigationService.apiCall($scope.url, data, function (data) {
      console.log("save sponsor")
      if (data.value) {
        toastr.success("Data saved successfully", 'Success');
        $state.go('sponsor')
      } else if (data.data.nModified == '1') {
        toastr.success("Data saved successfully", 'Success');
        $state.go('sponsor')
      } else {
        toastr.error("Something went wrong", 'Error');
      }
    })
  }


  $scope.addRow = function (formData) {
    if (!formData) {
      $scope.formData.videoGallery.push({
        "vimage": '',
        "vlink": '',
        "vtype": ''
      })
    } else {
      formData.videoGallery.push({
        "vimage": '',
        "vlink": '',
        "vtype": ''
      })
    }


  }
  $scope.addRow();

  $scope.deleteRow = function (formData, index) {
    formData.videoGallery.splice(index, 1);
  }
});

// DETAIL SPONSOR END


// TABLE SPONSOR CARD
myApp.controller('SponsorCardCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, toastr, $uibModal) {
  //Used to name the .html file
  $scope.template = TemplateService.changecontent("tablesponsorcard");
  $scope.menutitle = NavigationService.makeactive("Sponsor");
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

    $scope.url = "SponsorCard/search";
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
    $scope.url = "SponsorCard/delete";
    $scope.constraints = {};
    $scope.constraints._id = data;
    NavigationService.apiCall($scope.url, $scope.constraints, function (data) {
      if (data.value) {
        toastr.success('Successfully Deleted', 'Sponsor Card');
        $scope.modalInstance.close();
        // $scope.viewTable();
        $state.reload();
      } else {
        toastr.error('Something Went Wrong while Deleting', 'Sponsor Card');
      }
    });
  }
});
// TABLE SPONSOR CARD END


// DETAIL SPONSOR CARD
myApp.controller('DetailSponsorCardCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, toastr) {
  //Used to name the .html file
  $scope.template = TemplateService.changecontent("detailponsorcard");
  $scope.menutitle = NavigationService.makeactive("Sponsor");
  TemplateService.title = $scope.menutitle;
  $scope.navigation = NavigationService.getnav();
  $scope.title = 'Create';

  if ($stateParams.id) {
    $scope.title = "Edit";
    $scope.setDisabled = true;
    $scope.getOneOldSchoolById = function () {
      $scope.url = 'SponsorCard/getOne';
      $scope.constraints = {};
      $scope.constraints._id = $stateParams.id;
      NavigationService.getOneOldSchoolById($scope.url, $scope.constraints, function (data) {
        $scope.formData = data.data;
      });
    };
    $scope.getOneOldSchoolById();
  }



  // GET ALL SPONSOR
  $scope.getAllSponsor = function () {
    $scope.url = "SponsorPage/search";
    // $scope.search = $scope.formData.keyword;
    NavigationService.apiCall($scope.url, $scope.formData, function (data) {
      console.log("data.value", data);
      $scope.items = data.data.results;
    });
  }
  $scope.getAllSponsor();
  $scope.searchSponsor = function (data) {
    $scope.drawing = data;
  }
  // GET ALL SPONSOR END

  // SAVE
  $scope.savesponsorcard = function (data) {
    console.log("i am in ");
    console.log(data, "save")
    $scope.url = "SponsorCard/save";
    NavigationService.apiCall($scope.url, data, function (data) {
      console.log("schema is easy")
      if (data.value) {
        toastr.success("Data saved successfully", 'Success');
        $state.go('sponsorcard')
      } else if (data.data.nModified == '1') {
        toastr.success("Data saved successfully", 'Success');
        $state.go('sponsorcard')
      } else {
        toastr.error("Something went wrong", 'Error');
      }
    })
  }
  // SAVE END
});
// DETAIL SPONSOR CARD END