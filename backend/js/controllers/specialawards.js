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
  $scope.formData = {};
  $scope.formData.page = 1;
  $scope.formData.type = '';
  $scope.formData.keyword = '';

  // TABLE VIEW 
  $scope.viewTable = function () {
    // $scope.search = $scope.formData.keyword;
    $scope.constraints = {};
    $scope.constraints.rising = {}
    $scope.constraints.rising = false;
    $scope.formData.page = $scope.formData.page++;
    NavigationService.getAllAwardDetails($scope.constraints, function (data) {
      console.log("data.value", data);
      $scope.items = data.data.data.results;
      console.log($scope.items, "item")
      $scope.totalItems = data.data.data.total;
      $scope.maxRow = data.data.data.options.count;
    });
  }
  $scope.viewTable();

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
    $scope.url = "SpecialAwardDetails/delete";
    $scope.constraints = {};
    $scope.constraints._id = data;
    NavigationService.apiCall($scope.url, $scope.constraints, function (data) {
      if (data.value) {
        toastr.success('Successfully Deleted', 'Special Detail');
        $scope.modalInstance.close();
        $scope.viewTable();
      } else {
        toastr.error('Something Went Wrong while Deleting', 'Special Detail');
      }
    });
  }
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
  $scope.flag = false;

  if ($stateParams.id) {
    $scope.flag = true;
    console.log("in")
    $scope.getOneAwardDetails = function () {
      $scope.constraints = {}
      $scope.constraints._id = $stateParams.id;
      NavigationService.getOneAwardDetails($scope.constraints, function (data) {
        console.log(data, "in edit awards");
        $scope.formData = data.data.data[0];
        $scope.typeData = $scope.formData.type
        console.log($scope.typeData, "type ")
        // FOR ATHLETE TYPE
        if ($scope.typeData === 'athlete') {
          $scope.formData.sports = data.data.data[0].sports;
          if (data.data.data[0].athlete.middleName) {
            $scope.formData.athlete.fullName = data.data.data[0].athlete.sfaId + '-' + data.data.data[0].athlete.firstName + ' ' + data.data.data[0].athlete.middleName + ' ' + data.data.data[0].athlete.surname
          } else {
            $scope.formData.athlete.fullName = data.data.data[0].athlete.sfaId + '-' + data.data.data[0].athlete.firstName + ' ' + data.data.data[0].athlete.surname
          }
        } else {
          if (data.data.data[0].school.sfaID) {
            console.log('enter');
            $scope.formData.school.schoolsfaId = data.data.data[0].school.sfaID + '-' + data.data.data[0].school.schoolName;
          } else {
            console.log('enter else');
            $scope.formData.school.schoolsfaId = data.data.data[0].school.schoolName;
          }
        }
        console.log($scope.formData, "edit data")
      });
    }
    $scope.getOneAwardDetails();
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

  }

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


  // ATHLETE BY GENDER
  $scope.getGenderAthlete = function (constraints) {
    $scope.url = "Athelete/searchByFilter";
    NavigationService.getGenderAthlete(constraints, $scope.url, function (data) {
      console.log('gender wise', data)
      $scope.playerData = data.data.data.results;
      _.each($scope.playerData, function (k) {
        if (k.status == 'Verified') {
          if (k.middleName == undefined) {
            k.fullName = k.sfaId + '-' + k.firstName + ' ' + k.surname;
          } else {
            k.fullName = k.sfaId + '-' + k.firstName + ' ' + k.middleName + ' ' + k.surname;
          }
        } else {
          if (k.middleName == undefined) {
            k.fullName = k.firstName + ' ' + k.surname;
          } else {
            k.fullName = k.firstName + ' ' + k.middleName + ' ' + k.surname;
          }
        }

      });
    });
  };
  // ATHLETE BY GENDER END

  // SPECIAL AWARD LIST 
  $scope.getAwardsList = function (constraints) {
    NavigationService.getAwardsList(constraints, function (data) {
      $scope.certificateType = data.data.data;
      console.log($scope.certificateType, "certificate data")
    });

  }
  $scope.getList = function (data) {
    $scope.formData.award = ''
    console.log(data, "ng-change")
    if (data.type === "athlete") {
      console.log("in")
      $scope.constraints = {}
      $scope.constraints.filter = {}
      $scope.constraints.type = data.type;
      $scope.constraints.gender = data.gender;
      $scope.constraints.filter.gender = data.gender;
      $scope.getAwardsList($scope.constraints);
      $scope.getGenderAthlete($scope.constraints)

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
    $scope.url = "SportsListSubCategory/search";
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
    if (data.type == 'school' || data.type == 'college') {
      delete data.gender;
    }
    $scope.url = "SpecialAwardDetails/save";
    NavigationService.apiCall($scope.url, data, function (data) {
      console.log("save sponsor")
      if (data.value) {
        console.log("in")
        toastr.success("Data saved successfully", 'Success');
        $state.go('specialaward-detail')
      } else if (data.data.nModified == '1') {
        toastr.success("Data saved successfully", 'Success');
        $state.go('specialaward-detail')
      } else {
        toastr.error("Something went wrong", 'Error');
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

// RISING STAR
myApp.controller('RisingCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, toastr, $uibModal) {
  //Used to name the .html file
  $scope.template = TemplateService.changecontent("tablerising");
  $scope.menutitle = NavigationService.makeactive("Rising Star");
  TemplateService.title = $scope.menutitle;
  $scope.navigation = NavigationService.getnav();
  $scope.formData = {}
  $scope.formData.page = 1;
  $scope.formData.type = '';
  $scope.formData.keyword = ''


  // TABLE VIEW 
  $scope.viewTable = function () {
    // $scope.search = $scope.formData.keyword;
    $scope.constraints = {};
    $scope.constraints.rising = {}
    $scope.constraints.rising = true;
    $scope.formData.page = $scope.formData.page++;
    NavigationService.getAllAwardDetails($scope.constraints, function (data) {
      console.log("data.value", data);
      $scope.items = data.data.data.results;
      console.log($scope.items, "item")
      $scope.totalItems = data.data.data.total;
      $scope.maxRow = data.data.data.options.count;

      // _.each($scope.items , function(value){
      //   if(value.athlete.middleName)
      //   value.fullName=value.athlete.sfaID + ' ' + ' '
      // });
    });
  }
  $scope.viewTable();

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
    $scope.url = "SpecialAwardDetails/delete";
    $scope.constraints = {};
    $scope.constraints._id = data;
    NavigationService.apiCall($scope.url, $scope.constraints, function (data) {
      if (data.value) {
        toastr.success('Successfully Deleted', 'Special Detail');
        $scope.modalInstance.close();
        $scope.viewTable();
      } else {
        toastr.error('Something Went Wrong while Deleting', 'Special Detail');
      }
    });
  }
});
// RISING STAR END

// DETAIL RISING STAR
myApp.controller('DetailRisingCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, toastr, $uibModal) {
  //Used to name the .html file
  $scope.template = TemplateService.changecontent("detailrising");
  $scope.menutitle = NavigationService.makeactive("Detail Rising Star");
  TemplateService.title = $scope.menutitle;
  $scope.navigation = NavigationService.getnav();
  $scope.formData = {}
  $scope.formData.type = 'athlete'
  $scope.formData.award = {}
  $scope.formData.award = "";


  if ($stateParams.id) {
    $scope.getOneAwardDetails = function () {
      $scope.constraints = {};
      $scope.constraints._id = $stateParams.id;
      NavigationService.getOneAwardDetails($scope.constraints, function (data) {
        console.log(data, 'detail rising edit');
        $scope.formData = data.data.data[0];
        $scope.getRegisterSport($scope.formData.athlete);
        $scope.typeData = $scope.formData.type;
        $scope.formData.sports.name = data.data.data[0].sports[0].name;

        if ($scope.typeData === 'athlete') {
          $scope.formData.sports = data.data.data[0].sports;
          if (data.data.data[0].athlete.middleName) {
            $scope.formData.athlete.fullName = data.data.data[0].athlete.sfaId + '-' + data.data.data[0].athlete.firstName + ' ' + data.data.data[0].athlete.middleName + ' ' + data.data.data[0].athlete.surname
          } else {
            $scope.formData.athlete.fullName = data.data.data[0].athlete.sfaId + '-' + data.data.data[0].athlete.firstName + ' ' + data.data.data[0].athlete.surname
          }
        } else {
          if (data.data.data[0].athlete.school.sfaid) {
            console.log('enter');
            $scope.formData.athlete.school.schoolsfaId = data.data.data[0].athlete.school.sfaid + '-' + data.data.data[0].athlete.school.schoolName;
          } else {
            console.log('enter else');
            $scope.formData.athlete.school.schoolsfaId = data.data.data[0].athlete.school.schoolName;
          }
        }
        console.log($scope.formData, 'check this form')
      });
    }
    $scope.getOneAwardDetails();

  }

  // ATHLETE BY GENDER
  $scope.getGenderAthlete = function (constraints) {
    $scope.url = "Athelete/searchByFilter";
    NavigationService.getGenderAthlete(constraints, $scope.url, function (data) {
      console.log('gender wise', data)
      $scope.playerData = data.data.data.results;
      _.each($scope.playerData, function (k) {
        if (k.status == 'Verified') {
          if (k.middleName == undefined) {
            k.fullName = k.sfaId + '-' + k.firstName + ' ' + k.surname;
          } else {
            k.fullName = k.sfaId + '-' + k.firstName + ' ' + k.middleName + ' ' + k.surname;
          }
        } else {
          if (k.middleName == undefined) {
            k.fullName = k.firstName + ' ' + k.surname;
          } else {
            k.fullName = k.firstName + ' ' + k.middleName + ' ' + k.surname;
          }
        }

      });
    });
  };

  // Registered Sport
  $scope.getRegisterSport = function (data) {
    console.log(data, "in on select")
    $scope.constraints = {};
    if (data && data !== null && data._id) {
      $scope.constraints._id = data._id;
      NavigationService.getAllRegSportsByID($scope.constraints, function (data) {
        console.log("data in register sport", data);
        $scope.sportitems = data.data.data;
      })
    } else {
      console.log("else")
      $scope.removeRegisterSport();
    }

  };
  $scope.removeRegisterSport = function () {
    console.log("in remove ****")
    // $scope.playerData = []
    $scope.sportitems = [];
    $scope.formData.sports = [];
    if ($stateParams.id) {
      $scope.getGenderAthlete();
    }
  }
  $scope.searchSportList = function (data) {
    $scope.draws = data;
  }
  // Registered Sport END

  $scope.getList = function (data) {
    // $scope.formData.award = ''
    console.log(data, "ng-change")
    if (data.type === "athlete") {
      console.log("in")
      $scope.constraints = {}
      $scope.constraints.filter = {}
      $scope.constraints.type = data.type;
      $scope.constraints.gender = data.gender;
      $scope.constraints.filter.gender = data.gender;
      $scope.constraints.rising = true;
      // $scope.getAwardsList($scope.constraints);
      $scope.getGenderAthlete($scope.constraints)

    } else {

    }
  }

  $scope.getAwardsList = function (constraints) {
    NavigationService.getAwardsList(constraints, function (data) {
      $scope.awardList = data.data.data;
      $scope.formData.award = data.data.data[0];
      // console.log($scope.formData.certificateType, "certificate data")
    });

  }

  $scope.getAwardsList({
    "rising": true
  });

  // SAVE
  $scope.saveAwardDetail = function (data) {
    console.log("i am in ");
    console.log(data, "save")
    data.award = data.award._id;
    data.sports = [data.sports._id];
    $scope.url = "SpecialAwardDetails/saveRising";
    NavigationService.apiCall($scope.url, data, function (data) {
      console.log("save sponsor")
      if (data.value) {
        console.log("in value true")
        if (data.data.nModified != undefined) {
          toastr.success("Data modified successfully", 'Success');
          $state.go('risingstar')
        } else {
          toastr.success("Data saved successfully", 'Success');
          $state.go('risingstar')
        }
      } else if (data.error) {
        toastr.error("Certificate Already Created", 'Error');
      } else {
        toastr.error("Something went wrong", 'Error');
      }
    })
  }
  // SAVE END
});
// DETAIL RISING STAR END