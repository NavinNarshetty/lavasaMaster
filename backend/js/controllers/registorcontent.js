// TABLE REGISTER CONTENT
myApp.controller('RegistorContentCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, toastr, $uibModal, crudService) {
  //Used to name the .html file
  $scope.template = TemplateService.changecontent("player-registration/registor-content/tableregistorcontent");
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
    $scope.url = "Playerregistration/search";
    $scope.formData.page = $scope.formData.page++;
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
  var url = "Playerregistration/delete";
  $scope.confirmDelete = function (data) {
    crudService.confirmDelete(data, url, $scope);
  }
  // DELETE END

});
// TABLE REGISTER CONTENT END

// DETAIL REGISTER CONTENT 

myApp.controller('DetailRegistorContentCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, toastr, $uibModal, crudService) {
  //Used to name the .html file
  $scope.template = TemplateService.changecontent("player-registration/registor-content/detailregistorcontent");
  $scope.menutitle = NavigationService.makeactive("Ad Gallery");
  TemplateService.title = $scope.menutitle;
  $scope.navigation = NavigationService.getnav();

  // VAR
  $scope.formData = {};
  $scope.formData.banner = {};
  $scope.formData.banner.desktop = [];
  $scope.formData.banner.mobile = [];
  $scope.formData.eventCount = [];
  $scope.formData.gallery = [];


  var url = 'Playerregistration'


  // GET ONE
  if ($stateParams.id) {
    $scope.title = 'Edit';
    var id = $stateParams.id;
    crudService.getOneData(url, id, function (data) {
      if (data) {
        $scope.formData = data;
      }
    })
  }
  // GET ONE END


  // SAVE FUNCTION
  var state = 'registorcontent'
  $scope.saveData = function (data) {
    crudService.saveData(data, url, state);
  }
  // SAVE FUNCTION END





  // ADD AND DELETE ROW GALLERY BANNER
  $scope.addRow = function (formData, type) {
    console.log(type, formData, "check this")

    if (!formData) {
      $scope.formData.banner.desktop.push({
        "image": '',
        "link": '',
      })
      $scope.formData.banner.mobile.push({
        "image": '',
        "link": '',
      })
    } else {
      formData.banner[type].push({
        "image": '',
        "link": '',
      })
    }


  }
  $scope.addRow();

  $scope.deleteRow = function (formData, type, index) {
    console.log(type, "check this");
    formData.banner[type].splice(index, 1);
  }
  // ADD AND DELETE ROW END



  // ADD ROW EVENT COUNT
  $scope.addRowButton = function (formData, type) {
    console.log(formData, type, "check this event")
    if (!formData) {
      $scope.formData.eventCount.push({
        "value": '',
        "name": '',
      })
      $scope.formData.gallery.push({
        "value": '',
        "name": '',
      })
    } else if (type == 'eventCount') {
      formData[type].push({
        "value": '',
        "name": '',
      })
    } else if (type == 'gallery') {
      formData[type].push({
        "title": '',
        "mediaLink": '',
      })
    }



  }
  $scope.addRowButton();

  $scope.deleteRowButton = function (formData, type, index) {
    console.log(type, "check this");
    formData[type].splice(index, 1);
  }
  // ADD ROW EVENT COUNT END




});
// DETAIL REGISTER CONTENT  END