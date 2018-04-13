myApp.controller('aboutChampionshipCtrl', function ($scope, TemplateService, $sce, $state, NavigationService, $stateParams, toastr, $rootScope, $uibModal, $timeout, configService, sportMergeService) {
  $scope.template = TemplateService.getHTML("content/aboutchampionship.html");
  TemplateService.title = "Championship Archive"; //This is the Title of the Website
  $scope.navigation = NavigationService.getNavigation();
  // VAR
  $scope.formData = {};
  $scope.formData.page = 1;
  $scope.formData.type = '';
  $scope.formData.keyword = '';


  // VIEW TABLE
  $scope.getChampionshipData = function () {
    $scope.url = "Aboutchampionship/search";
    $scope.formData.page = $scope.formData.page++;
    // $scope.formData.filter = {};
    // $scope.formData.filter.city = $stateParams.city;
    NavigationService.apiCallWithData($scope.url, $scope.formData, function (data) {
      console.log("data.value", data);
      $scope.championshipData = data.data.results[0];
      $scope.championshipData.contentData = $sce.trustAsHtml(data.data.results[0].contentData)
      $scope.championshipData.mediaLink = $sce.trustAsResourceUrl(data.data.results[0].mediaLink)
      $scope.totalItems = data.data.total;
      $scope.maxRow = data.data.options.count;
    });
  }
  $scope.getChampionshipData();
  // VIEW TABLE
});