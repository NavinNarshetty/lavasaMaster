myApp.controller('featuredGalleryCtrl', function ($scope, TemplateService, NavigationService, $timeout) {
  //Used to name the .html file

  $scope.template = TemplateService.getHTML("content/featured-gallery.html");
  TemplateService.title = "SFA Gallery";
  $scope.navigation = NavigationService.getNavigation();

  $scope.showFolderFilter = false;
  $scope.defaultFolder = 'all';
  $scope.selectfolder = '';
  // SELECT FOLDER
  $scope.viewFolder = function () {
    if ($scope.showFolderFilter == false) {
      $scope.showFolderFilter = true;
    } else {
      $scope.showFolderFilter = false
    }
  }

  $scope.selectFolder = function (folder) {
    if ($scope.selectFolder == 'all') {
      $scope.selectfolder = '';

    } else {
      $scope.selectfolder = folder;
    }
    $scope.defaultFolder = folder;
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


});