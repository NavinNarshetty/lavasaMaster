myApp.controller('UpgradePackageCtrl', function ($scope, TemplateService, NavigationService, $timeout, $uibModal, $filter, configService) {
  $scope.template = TemplateService.getHTML("content/registration/upgrade-package.html");
  TemplateService.title = "School Registration Form"; //This is the Title of the Website
  $scope.navigation = NavigationService.getNavigation();
  // START
  $scope.formData = {
    package:''
  }
  $scope.packages = [];
  $scope.features = [];
  NavigationService.getPackages(function(data){
    data = data.data;
    console.log("dat",data);
    if (data.value = true) {
      $scope.packages = data.data.results;
      console.log("packages", $scope.packages);
    } else {
      console.log("packages search failed", data);
    }
  });
  NavigationService.getPackageFeatures(function(data){
    data = data.data;
    console.log("dat",data);
    if (data.value = true) {
      $scope.features = data.data.results;
      console.log("features", $scope.features);
    } else {
      console.log("features search failed", data);
    }
  });
  // END
});
