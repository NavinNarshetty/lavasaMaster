// DETAIL MATCHES
myApp.controller('DetailMatchesCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, toastr) {
  //Used to name the .html file
  $scope.template = TemplateService.changecontent("detailmatch");
  $scope.menutitle = NavigationService.makeactive("Detail Match");
  TemplateService.title = $scope.menutitle;
  $scope.navigation = NavigationService.getnav();
});

// DETAIL MATCHES END

// TABLE PDF
myApp.controller('TablePdfCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, toastr) {
  //Used to name the .html file
  $scope.template = TemplateService.changecontent("tablepdf");
  $scope.menutitle = NavigationService.makeactive("Table Pdf");
  TemplateService.title = $scope.menutitle;
  $scope.navigation = NavigationService.getnav();
  $scope.formData = {};
  $scope.formData.page = 1;
  $scope.formData.type = '';
  $scope.formData.keyword = '';


  $scope.searchForEventPdf = function () {
    $scope.formData.page = $scope.formData.page++;
    NavigationService.searchForEventPdf($scope.formData, function (data) {
      console.log("data.value", data);
      $scope.items = data.data.results;
      $scope.totalItems = data.data.total;
      $scope.maxRow = data.data.options.count;
    });

  }
  $scope.searchForEventPdf();

});

// TABLE PDF END

myApp.controller('DetailPdfCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, toastr) {
  //Used to name the .html file
  $scope.template = TemplateService.changecontent("detailpdf");
  $scope.menutitle = NavigationService.makeactive("Detail Pdf");
  TemplateService.title = $scope.menutitle;
  $scope.navigation = NavigationService.getnav();
  $scope.form = {};
  $scope.flag = '';
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
  console.log("$stateParams.id", $stateParams.id);
  if ($stateParams.id != '') {
    console.log("edit")
    $scope.title = "Edit";
    $scope.flag = 'edit';
    $scope.getOneOldSchoolById = function () {
      $scope.url = "Sport/getOne";
      $scope.constraints = {};
      $scope.constraints._id = $stateParams.id;
      console.log($stateParams.id);
      NavigationService.apiCall($scope.url, $scope.constraints, function (data) {
        console.log("data.value sportlist", data);
        $scope.form.gender = data.data.gender;
        $scope.form = data.data;
      });
    }
    $scope.getOneOldSchoolById();
  } else {
    $scope.title = "Upload";
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

    $scope.searchSportList = function (data) {
      $scope.draws = data;
    }

    $scope.getAllAge = function (data) {
      $scope.url = "AgeGroup/search";
      console.log(data);
      $scope.constraints = {};
      $scope.constraints.keyword = data;
      NavigationService.apiCall($scope.url, $scope.constraints, function (data) {
        console.log("data.value age", data);
        $scope.ageitems = data.data.results;

      });
    }

    $scope.searchAge = function (data) {
      $scope.draw = data;
    }

    $scope.getAllWeight = function (data) {
      $scope.url = "Weight/search";
      console.log(data);
      $scope.constraints = {};
      $scope.constraints.keyword = data;
      NavigationService.apiCall($scope.url, $scope.constraints, function (data) {
        console.log("data.value weight", data);
        $scope.weightitems = data.data.results;

      });
    }

    $scope.searchWeight = function (data) {
      $scope.drawing = data;
    }

  }



  // SAVE
  $scope.saveDataMatch = function (formData) {
    var paramValue = {};
    paramValue.sportslist = formData.sportslist._id;
    paramValue.gender = formData.gender;
    paramValue.ageGroup = formData.ageGroup._id;
    paramValue.eventPdf = formData.eventPdf;

    // $scope.formData.matchId = $stateParams.id;
    console.log(paramValue, "save");
    // $scope.obj = $.jStorage.get("detail")
    NavigationService.setEventPdf(paramValue, function (data) {
      if (data.value == true) {
        console.log("res", data);
        toastr.success("Data saved successfully", 'Success');
        $state.go('tablepdf')

      } else {
        toastr.error("Data save failed ,please try again or check your internet connection", 'Save error');
      }
    })

  }
  // SAVE-END

});