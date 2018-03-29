myApp.controller('UpgradePackageCtrl', function ($scope, TemplateService, NavigationService, $timeout, $uibModal, $filter, configService) {
  $scope.template = TemplateService.getHTML("content/registration/upgrade-package.html");
  TemplateService.title = "School Registration Form"; //This is the Title of the Website
  $scope.navigation = NavigationService.getNavigation();
  // START
  // VARIABLES
  $scope.packages = [];
  // $scope.features = [];
  $scope.formPackage = {
    filter: {
      packageUser: 'athlete'
    }
  }
  // $scope.formFeature = {
  //   filter: {
  //     featureUserType: 'athlete'
  //   }
  // }
  // VARIABLES END
  // API
  // GET PACKAGES
  NavigationService.getPackages($scope.formPackage,function(data){
    data = data.data;
    console.log("dat",data);
    if (data.value = true) {
      $scope.packages = data.data.results;
      console.log("packages", $scope.packages);
    } else {
      console.log("packages search failed", data);
    }
  });
  // GET PACKAGES END
  // GET FEATURES
  // NavigationService.getPackageFeatures($scope.formFeature, function(data){
  //   data = data.data;
  //   console.log("dat",data);
  //   if (data.value = true) {
  //     $scope.features = data.data.results;
  //     console.log("features", $scope.features);
  //   } else {
  //     console.log("features search failed", data);
  //   }
  // });
  // GET FEATURES END
  // API END
  // END
});
