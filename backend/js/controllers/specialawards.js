// TABLE SPECIAL AWARD BANNER
myApp.controller('SpecialAwardBannerCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, toastr, $uibModal) {
  //Used to name the .html file
  $scope.template = TemplateService.changecontent("tablespecialawardbanner");
  $scope.menutitle = NavigationService.makeactive("Special Award");
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

  // TABLE VIEW 
  $scope.viewTable = function () {

    $scope.url = "SpecialAwardBanner/search";
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
  // TABLE VIEW END

  // DELETE
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
    $scope.url = "SpecialAwardBanner/delete";
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
  // DELETE END
});
// TABLE SPECIAL AWARD BANNER END

// DETAIL SPECIAL AWARD BANNER
myApp.controller('DetailSpecialAwardBannerCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, toastr) {
  //Used to name the .html file
  $scope.template = TemplateService.changecontent("detailspecialawardbanner");
  $scope.menutitle = NavigationService.makeactive("Special Award");
  TemplateService.title = $scope.menutitle;
  $scope.navigation = NavigationService.getnav();
  $scope.title = 'Create'

  if ($stateParams.id) {
    $scope.title = "Edit"
    $scope.getOneOldSchoolById = function () {
      $scope.url = 'SpecialAwardBanner/getOne';
      $scope.constraints = {};
      $scope.constraints._id = $stateParams.id;
      NavigationService.getOneOldSchoolById($scope.url, $scope.constraints, function (data) {
        $scope.formData = data.data;
      });
    };
    $scope.getOneOldSchoolById();
  } else {

  }


  // SAVE
  $scope.saveAwardBanner = function (data) {
    console.log("i am in ");
    console.log(data, "save")
    $scope.url = "SpecialAwardBanner/save";
    NavigationService.apiCall($scope.url, data, function (data) {
      console.log("save sponsor")
      if (data.value) {
        console.log("in")
        toastr.success("Data saved successfully", 'Success');
        $state.go('specialaward-banner')
      } else if (data.data.nModified == '1') {
        toastr.success("Data saved successfully", 'Success');
        $state.go('sponsor')
      } else {
        toastr.error("Something went wrong", 'Error');
      }
    })
  }
  // SAVE END
});
// DETAIL SPECIAL AWARD BANNER END



// TABLE SPECIAL AWARD
myApp.controller('SpecialAwardCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, toastr, $uibModal) {
  //Used to name the .html file
  $scope.template = TemplateService.changecontent("tablespecialaward");
  $scope.menutitle = NavigationService.makeactive("Special Award");
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

  // TABLE VIEW 
  $scope.viewTable = function () {

    $scope.url = "Awards/search";
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
  // TABLE VIEW END



  // DELETE
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
    $scope.url = "Awards/delete";
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
  // DELETE END
});
// TABLE END

// DETAIL TABLE SPECIAL AWARD
myApp.controller('DetailSpecialAwardCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, toastr) {
  //Used to name the .html file
  $scope.template = TemplateService.changecontent("detailspecialaward");
  $scope.menutitle = NavigationService.makeactive("Detail Special Award");
  TemplateService.title = $scope.menutitle;
  $scope.navigation = NavigationService.getnav();
  $scope.configData = {};

  // INSTITUTE
  $scope.getConfig = function () {
    NavigationService.getConfigDetail(function (data) {
      $scope.configData = data.data.data
      console.log($scope.configData);
      $scope.institute = $scope.configData.type;
      if ($scope.institute === 'school') {
        console.log("in")
        $scope.instituteTypes = ['athlete', 'school']
      } else {
        $scope.instituteTypes = ['athlete', 'college']
      }
      console.log($scope.institute)
    })
  }
  $scope.getConfig();
  // INSTITUTE END
  if ($stateParams.id) {
    $scope.title = "Edit"
    $scope.getOneOldSchoolById = function () {
      $scope.url = 'Awards/getOne';
      $scope.constraints = {};
      $scope.constraints._id = $stateParams.id;
      NavigationService.getOneOldSchoolById($scope.url, $scope.constraints, function (data) {
        $scope.formData = data.data;
      });
    };
    $scope.getOneOldSchoolById();
  } else {

  }


  // SAVE
  $scope.saveAward = function (data) {
    console.log("i am in ");
    console.log(data, "save")
    $scope.url = "Awards/save";
    NavigationService.apiCall($scope.url, data, function (data) {
      console.log("save sponsor")
      if (data.value) {
        console.log("in")
        toastr.success("Data saved successfully", 'Success');
        $state.go('specialaward')
      } else if (data.data.nModified == '1') {
        toastr.success("Data saved successfully", 'Success');
        $state.go('specialaward')
      } else {
        toastr.error("Something went wrong", 'Error');
      }
    })
  }
  // SAVE END

});
// DETAIL TABLE END

// SPORTS AWARDS DETAIL TABLE
myApp.controller('SpecialAwardDetailCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, toastr, $uibModal) {
  //Used to name the .html file
  $scope.template = TemplateService.changecontent("tablespecialawarddetail");
  $scope.menutitle = NavigationService.makeactive("Special Award");
  TemplateService.title = $scope.menutitle;
  $scope.navigation = NavigationService.getnav();
});
// SPORTS AWARDS DETAIL TABLE END

// SPORTS AWARDS DETAIL 
myApp.controller('DetailAwardSpecialCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, toastr, $uibModal) {
  //Used to name the .html file
  $scope.template = TemplateService.changecontent("detailawardspecial");
  $scope.menutitle = NavigationService.makeactive("Special Award");
  TemplateService.title = $scope.menutitle;
  $scope.navigation = NavigationService.getnav();
  $scope.formData = {};
  $scope.formData.boostDetail = [];

  // FOR INSTITUTE TYPE
  $scope.getConfig = function () {
    NavigationService.getConfigDetail(function (data) {
      $scope.configData = data.data.data
      console.log($scope.configData);
      $scope.institute = $scope.configData.type;
      console.log($scope.institute)
    })
  }
  $scope.getConfig();
  // INSTITUTE TYPE END

  // SPECIAL AWARD LIST 
  $scope.getAwardsList = function (constraints) {
    NavigationService.getAwardsList(constraints, function (data) {
      $scope.certificateType = data.data.data;
      console.log($scope.certificateType, "certificate data")
    });

  }
  $scope.getList = function (data) {
    console.log(data)
    if (data.type === "athlete") {
      console.log("in")
      $scope.constraints = {}
      $scope.constraints.type = data.type;
      $scope.constraints.gender = data.gender;
      $scope.getAwardsList($scope.constraints);
    } else {
      $scope.constraints = {};
      $scope.constraints.type = data.type;
      $scope.getAwardsList($scope.constraints);
    }
  }


  // SPECIAL AWARD LIST  END


  // BOOST AWARD
  $scope.addRow = function (formData) {
    if (!formData) {
      $scope.formData.boostDetail.push({
        "schoolRank": '',
        "total": '',
        "year": ''
      })
    } else {
      formData.boostDetail.push({
        "schoolRank": '',
        "total": '',
        "year": ''
      })
    }


  }
  $scope.addRow();

  $scope.deleteRow = function (formData, index) {
    formData.boostDetail.splice(index, 1);
  }
  // BOOST AWARD END

  // SPORTS
  $scope.getAllSportList = function (data) {
    $scope.url = "SportsList/search";
    console.log(data);
    $scope.constraints = {};
    $scope.constraints.keyword = data;
    NavigationService.apiCall($scope.url, $scope.constraints, function (data) {
      console.log("data.value sportlist", data);
      $scope.sportitems = data.data.results;

    });
  }
  // SPORTS END

  // SCHOOL
  $scope.getOneSchoolById = function () {
    $scope.url = 'registration/search';
    NavigationService.apiCall($scope.url, $scope.formData, function (data) {
      $scope.school = data.data.results;
      $scope.schoolData = data.data.results;
      _.each($scope.school, function (n) {
        if (n.status == 'Verified') {
          n.schoolsfaId = n.sfaID + '-' + n.schoolName;
        } else {
          n.schoolsfaId = n.schoolName;
        }
      });
      console.log($scope.school, "after each")
    });
  };
  $scope.getOneSchoolById();

  $scope.searchSportList = function (data) {
    $scope.draws = data;
  }

  // SCHOOL END

  // SAVE
  $scope.saveAwardDetail = function (data) {
    console.log("i am in ");
    console.log(data, "save")
    $scope.url = "SpecialAwardDetails/save";
    NavigationService.apiCall($scope.url, data, function (data) {
      console.log("save sponsor")
      if (data.value) {
        console.log("in")
        // toastr.success("Data saved successfully", 'Success');
        // $state.go('specialaward')
      } else if (data.data.nModified == '1') {
        // toastr.success("Data saved successfully", 'Success');
        // $state.go('sponsor')
      } else {
        // toastr.error("Something went wrong", 'Error');
      }
    })
  }
  // SAVE END

  // $scope.certificateType = [{
  //   name: 'Sport Max Award'
  // }, {
  //   name: 'Rising Star'
  // }, {
  //   name: 'Coach Award'
  // }, {
  //   name: 'Boost Award'
  // }]
});
// SPORTS AWARDS DETAIL  END