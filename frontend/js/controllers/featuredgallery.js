myApp.controller('featuredGalleryCtrl', function ($scope, TemplateService, NavigationService, $state, errorService, $stateParams, $timeout) {
  //Used to name the .html file

  $scope.template = TemplateService.getHTML("content/featured-gallery.html");
  TemplateService.title = "SFA Gallery";
  $scope.navigation = NavigationService.getNavigation();

  $scope.showFolderFilter = false;
  $scope.defaultFolder = $stateParams.name;
  $scope.selectedType = $stateParams.type;
  $scope.selectfolder = '';
  // SELECT FOLDER
  $scope.viewFolder = function () {

    $state.go('featuredgallery', {
      type: $stateParams.type,
      name: $scope.defaultFolder
    });

    if ($scope.showFolderFilter == false) {
      $scope.showFolderFilter = true;

    } else {
      $scope.showFolderFilter = false;
    }
  }

  $scope.selectFolder = function (folder) {
    if ($scope.selectFolder == 'all') {
      $scope.selectfolder = '';

    } else {
      $scope.selectfolder = folder._id;
    }
    $scope.defaultFolder = folder._id;
    $scope.viewFolder();
  }
  $scope.folderName = ['Girl celebrations with Sania', 'Prize distribution', 'Children Day', 'Behind scene'];


  // END FOLDER END
  // GENDER
  $scope.showGenderFilter = false;
  $scope.defaultGender = 'all';
  $scope.selectgender = '';
  $scope.viewGender = function () {
    if ($scope.showGenderFilter == false) {
      $scope.showGenderFilter = true;
    } else {
      $scope.showGenderFilter = false
    }
  }

  $scope.selectGender = function (gender) {
    if ($scope.selectGender == 'all') {
      $scope.selectgender = '';

    } else {
      $scope.selectgender = gender;
    }
    $scope.defaultGender = gender;
    $scope.viewGender();
  }

  $scope.genderItem = ['Boys', 'Girls', 'Boys & Girls']
  // GENDER END

  // SPORTS
  $scope.showSportFilter = false;
  $scope.defaultSport = 'all';
  $scope.selectsport = '';
  $scope.viewSport = function () {
    if ($scope.showSportFilter == false) {
      $scope.showSportFilter = true;
    } else {
      $scope.showSportFilter = false
    }
  }

  $scope.selectSport = function (sport) {
    if ($scope.selectSport == 'all') {
      $scope.selectsport = '';

    } else {
      $scope.selectsport = sport;
    }
    $scope.defaultSport = sport;
    $scope.viewSport();
  }

  $scope.sports = ['Badminton', 'Tennis', 'Football', 'Hockey', 'Table Tennis']
  // SPORTS END

  $scope.Images = [{
    img: 'drone-video.png',
    type: 'photo'
  }, {
    img: 'sa8.jpg',
    type: 'video'
  }, {
    img: 'sa2.jpg',
    type: 'photo'
  }, {
    img: 'sa3.jpg',
    type: 'video'
  }, {
    img: 'sa4.jpg',
    type: 'photo'
  }, {
    img: 'sa11.jpg',
    type: 'video'
  }, {
    img: 'sa6.jpg',
    type: 'video'
  }, {
    img: 'mobweb-3.jpg',
    type: 'photo'
  }, {
    img: 'day-02.png',
    type: 'photo'
  }, {
    img: 'day-03.png',
    type: 'photo'
  }, {
    img: 'sa7.jpg',
    type: 'photo'
  }]

  if ($stateParams.type && $stateParams.name) {
    $scope.filterObj = {};
    $scope.filterObj.folderType = $stateParams.type;
    $scope.filterObj.folderName = $stateParams.name;
    NavigationService.getAllPhotosByFolder($scope.filterObj, function (data) {
      if (data) {
        console.log(data, "data");
        errorService.errorCode(data, function (allData) {
          if (!allData.message) {
            if (allData.value === true) {
              console.log(allData, "alldata");
              $scope.allphotosbyfolder = allData.data;
              console.log("allphotosbyfolder", $scope.allphotosbyfolder);
            } else {

            }
          } else {

            toastr.error(allData.message, 'Error Message');
          }
        });
      }
    });
  }

  if ($stateParams.type) {
    $scope.typefilter = {};
    $scope.typefilter.folderType = $stateParams.type;
    NavigationService.getAllPhotosByType($scope.typefilter, function (data) {
      console.log(data, "response");
      errorService.errorCode(data, function (allData) {
        if (!allData.message) {
          if (allData.value === true) {

            $scope.allfolderName = allData.data;
            console.log($scope.allfolderName, "$scope.allfolderName ");

          } else {

          }
        } else {

          toastr.error(allData.message, 'Error Message');
        }
      });
    });
  }


});