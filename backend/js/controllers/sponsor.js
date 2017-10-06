// TABLE SPONSOR
myApp.controller('SponsorCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, toastr) {
  //Used to name the .html file
  $scope.template = TemplateService.changecontent("tablesponsor");
  $scope.menutitle = NavigationService.makeactive("Sponsor");
  TemplateService.title = $scope.menutitle;
  $scope.navigation = NavigationService.getnav();
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
  $scope.formData.videoTable = [];


  $scope.addRow = function (formData) {
    if (!formData) {
      $scope.formData.videoTable.push({
        "image": '',
        "link": '',
        "type": ''
      })
    } else {
      formData.videoTable.push({
        "image": '',
        "link": '',
        "type": ''
      })
    }


  }
  $scope.addRow();

  $scope.deleteRow = function (formData, index) {
    formData.videoTable.splice(index, 1);
  }
});

// DETAIL SPONSOR END


// TABLE SPONSOR CARD
myApp.controller('SponsorCardCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, toastr) {
  //Used to name the .html file
  $scope.template = TemplateService.changecontent("tablesponsorcard");
  $scope.menutitle = NavigationService.makeactive("Sponsor");
  TemplateService.title = $scope.menutitle;
  $scope.navigation = NavigationService.getnav();
});
// TABLE SPONSOR CARD END


// DETAIL SPONSOR CARD
myApp.controller('DetailSponsorCardCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, toastr) {
  //Used to name the .html file
  $scope.template = TemplateService.changecontent("detailponsorcard");
  $scope.menutitle = NavigationService.makeactive("Sponsor");
  TemplateService.title = $scope.menutitle;
  $scope.navigation = NavigationService.getnav();
});
// DETAIL SPONSOR CARD END