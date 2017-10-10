// TABLE SPECIAL AWARD BANNER
myApp.controller('SpecialAwardBannerCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, toastr) {
  //Used to name the .html file
  $scope.template = TemplateService.changecontent("tablespecialawardbanner");
  $scope.menutitle = NavigationService.makeactive("Special Award");
  TemplateService.title = $scope.menutitle;
  $scope.navigation = NavigationService.getnav();
});
// TABLE SPECIAL AWARD BANNER END

// DETAIL SPECIAL AWARD BANNER
myApp.controller('DetailSpecialAwardBannerCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, toastr) {
  //Used to name the .html file
  $scope.template = TemplateService.changecontent("detailspecialawardbanner");
  $scope.menutitle = NavigationService.makeactive("Special Award");
  TemplateService.title = $scope.menutitle;
  $scope.navigation = NavigationService.getnav();



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
        // toastr.success("Data saved successfully", 'Success');
        // $state.go('sponsor')
      } else {
        // toastr.error("Something went wrong", 'Error');
      }
    })
  }
  // SAVE END
});
// DETAIL SPECIAL AWARD BANNER END



// TABLE SPECIAL AWARD
myApp.controller('SpecialAwardCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, toastr) {
  //Used to name the .html file
  $scope.template = TemplateService.changecontent("tablespecialaward");
  $scope.menutitle = NavigationService.makeactive("Special Award");
  TemplateService.title = $scope.menutitle;
  $scope.navigation = NavigationService.getnav();
});
// TABLE END