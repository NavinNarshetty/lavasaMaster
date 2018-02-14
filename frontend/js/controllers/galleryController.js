myApp.controller('SfaGalleryCtrl', function ($scope, TemplateService, errorService, configService, NavigationService, $timeout) {
  //Used to name the .html file

  $scope.template = TemplateService.getHTML("content/eventgallery.html");
  TemplateService.title = "SFA Gallery";
  $scope.navigation = NavigationService.getNavigation();


  $scope.initSwiper = function () {
    $timeout(function () {
      mySwiper = new Swiper('.swiper-container', {
        paginationClickable: true,
        nextButton: '.swiper-button-next',
        prevButton: '.swiper-button-prev',
        slidesPerView: 4,
        spaceBetween: 15,
        grabCursor: true,
        breakpoints: {
          992: {
            slidesPerView: 3
          },
          768: {
            slidesPerView: 3

          },
          481: {
            slidesPerView: 1
          },
          320: {
            slidesPerView: 1
          }
        }
      });
    }, 600);
  };
  $scope.initSwiper();
  //config property
  configService.getDetail(function (data) {
    $scope.state = data.state;
    $scope.year = data.year;
    $scope.eventYear = data.eventYear;
    $scope.sfaCity = data.sfaCity;
    $scope.isCollege = data.isCollege;
    $scope.type = data.type;

  });
  //

  // VIEW BY CATEGORY
  $scope.getAllPhotosByCategory = function () {
    $scope.photosbyCategory = {};
    $scope.photosbyCategory.folderType = 'Category';
    NavigationService.getAllPhotosByType($scope.photosbyCategory, function (data) {
      console.log(data, "response");
      errorService.errorCode(data, function (allData) {
        if (!allData.message) {
          if (allData.value === true) {
            $scope.allPhotosbyCategory = allData.data;
          } else {
            console.log("im in else");
          }
        } else {
          toastr.error(allData.message, 'Error Message');
        }
      });
    })

  };
  $scope.getAllPhotosByCategory();
  // VIEW BY CATEGORY END

  // VIEW BY SPORT
  $scope.getAllPhotosBySport = function () {
    $scope.photosbySport = {};
    $scope.photosbySport.folderType = 'Sport';
    NavigationService.getAllPhotosByType($scope.photosbySport, function (data) {
      errorService.errorCode(data, function (allData) {
        if (!allData.message) {
          if (allData.value === true) {
            $scope.allPhotosbySport = allData.data;
          } else {

          }
        } else {

          toastr.error(allData.message, 'Error Message');
        }
      });
    });

  };
  $scope.getAllPhotosBySport();
  // VIEW BY SPORT END

  // get all videos
  NavigationService.getAllVideos(function (data) {
    errorService.errorCode(data, function (allData) {
      if (!allData.message) {
        if (allData.value === true) {
          $scope.eventVideos = allData.data;
          _.each($scope.eventVideos, function (key) {
            console.log("key.thumbails", key.thumbnails);
            if (key.thumbnails != null && key.thumbnails.length == 0) {
              key.thumbnail = "img/media-video-thumb.jpg";
            } else if (key.thumbails == null) {
              key.thumbnail = "img/media-video-thumb.jpg";
            }
          })
        } else {
          console.log("im in else");
        }
      } else {

        toastr.error(allData.message, 'Error Message');
      }
    });
  });




});