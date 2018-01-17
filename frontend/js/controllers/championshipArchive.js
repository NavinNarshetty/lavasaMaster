myApp.controller('championArchiveCtrl', function ($scope, TemplateService, $state, NavigationService, $stateParams, toastr, $rootScope, $uibModal, $timeout, configService, sportMergeService) {
  $scope.template = TemplateService.getHTML("content/championshiparchive.html");
  TemplateService.title = "Sponser Partner"; //This is the Title of the Website
  $scope.navigation = NavigationService.getNavigation();
  $scope.defaultThumbnail = 'img/media-video-thumb.jpg';
  $scope.data = [1, 2, 3]
  $scope.readvariable = false;
  $scope.showRead = false;

  $scope.setReadMore = function () {
    $timeout(function () {
      $scope.readHeight = $(".championsarchive-content").height();
      console.log($scope.readHeight, 'height');
      if ($scope.readHeight < 100) {
        $scope.showRead = false;
      } else {
        $scope.showRead = true;
      }
    }, 200)



  }


  // ARCHIVE PAGE
  $scope.archivePage = function () {
    $scope.url = "Championshiparchive/Search";
    $scope.constraints = {}
    $scope.constraints.keyword = "";
    $scope.constraints.page = 1;
    $scope.constraints.type = "";

    NavigationService.apiCallWithData($scope.url, $scope.constraints, function (data) {

      $scope.archiveData = data.data.results[0];
      $scope.archiveGallery = $scope.archiveData.galleryVideo.concat($scope.archiveData.galleryImage)
      $scope.archiveGallery = _.shuffle($scope.archiveGallery);
      console.log($scope.archiveGallery, "final gallery")
      console.log("data from backend", $scope.archiveData);
      $scope.setReadMore();
    });
  }
  $scope.archivePage();
  // ARCHIVE PAGE END

  // SPORTS
  $scope.archiveSports = function () {
    NavigationService.getAllSpotsList(function (data) {
      console.log(data, "before service sports data");
      $scope.archiveSportsData = _.compact(data.data.data);
      $scope.archiveSportsData = sportMergeService.sportMerge($scope.archiveSportsData);
    });
  }
  $scope.archiveSports();
  // SPORTS END

  // RANK
  $scope.archiveRank = function () {
    NavigationService.getSchoolByRanks(function (data) {
      console.log('rankingTable', data);
      if (data.value == true) {
        $scope.rankTable = data.data;
        $scope.rankTable.tableLimit = 20;
        $scope.rankTable.showTable = true;
        _.each($scope.rankTable, function (n, nkey) {
          n.rowDetail = false;
          n.goldCount = 0;
          n.silverCount = 0;
          n.bronzeCount = 0;
          if (n.medal) {
            if (n.medal.gold) {
              n.goldCount = n.medal.gold.count;
            }
            if (n.medal.silver) {
              n.silverCount = n.medal.silver.count;
            }
            if (n.medal.bronze) {
              n.bronzeCount = n.medal.bronze.count;
            }
          }
          if (!n.totalPoints) {
            n.totalPoints = 0;
          }
        });
      } else {
        toastr.error('Ranking Table Error', 'Error');
      }
    });
  }
  $scope.archiveRank();
  // RANK END


  $scope.archiveHighlights = function () {
    $scope.url = 'HighlightVideo/Search';
    $scope.parameter = {}
    $scope.parameter.keyword = "";
    $scope.parameter.page = 1;
    $scope.parameter.type = "";
    NavigationService.apiCallWithData($scope.url, $scope.parameter, function (data) {
      console.log(data, "highlights")
      $scope.archiveHighlightsData = data.data.results[0].highlightVideo;


    });
  }
  $scope.archiveHighlights();

  // READ MORE
  $scope.readMore = function () {
    $scope.readvariable = !$scope.readvariable;
  }
  // READ MORE END

});