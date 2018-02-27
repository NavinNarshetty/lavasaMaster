myApp.controller('SfaGalleryCtrl', function ($scope, TemplateService, errorService, configService, MediaPopupService, NavigationService, $timeout) {
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
            _.each($scope.allPhotosbyCategory, function (key) {
              key.mediaThumbnail = _.compact(key.mediaThumbnail);
              if (key.mediaThumbnail.length > 0) {
                key.mediaThumbnail = key.mediaThumbnail[0];
              } else {
                key.mediaThumbnail = key.mediaLink;
              }
            });
            console.log(" $scope.allPhotosbyCategory ", $scope.allPhotosbyCategory);
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
            _.each($scope.allPhotosbySport, function (key) {
              key.mediaThumbnail = _.compact(key.mediaThumbnail);
              if (key.mediaThumbnail.length > 0) {
                key.mediaThumbnail = key.mediaThumbnail[0];
              } else {
                key.mediaThumbnail = key.mediaLink;
              }
            });

          } else {
            console.log("im in else");
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
  NavigationService.getVideos(function (data) {
    errorService.errorCode(data, function (allData) {
      if (!allData.message) {
        if (allData.value === true) {
          $scope.eventVideos = allData.data;
          _.each($scope.eventVideos, function (key) {
            console.log("key.thumbails", key.thumbnails);
            if (key.thumbnails != null && key.thumbnails.length == 0) {
              key.thumbnail = "img/media-video-thumb.jpg";
            } else if (key.thumbnails == null) {
              key.thumbnail = "img/media-video-thumb.jpg";
            } else {
              // console.log("here thumb", nk);
              key.thumbnail = key.thumbnails[3].link;
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

  $scope.showPopup = function (picIndex, picList) {
    MediaPopupService.openMediaPopup(picIndex, picList, $scope);
  }
  $scope.nextSlides = function (currentindex, click) {

    MediaPopupService.nextSlide(currentindex, $scope.eventVideos, $scope, click);
  }
  $scope.prevSlides = function (currentindex, click) {

    MediaPopupService.prevSlide(currentindex, $scope.eventVideos, $scope, click);
  }


  // GET AD BANNERS
  $scope.adBanners = function () {
    $scope.url = "AdGallery/search";
    NavigationService.apiCallWithoutformData($scope.url, function (data) {
      console.log(data, "ad data");
      $scope.adBanners = data.data.results;
      $scope.positionadBanners = _.each($scope.adBanners, function (key) {
        console.log(key, "inside key");
        if (key.adPlacement === '2ndbanner') {
          if (key.status == 'enable') {
            $scope.secondAdBanner = key;
          } else {
            $scope.secondAdBanner = ' ';
          }
        } else if (key.adPlacement === '1stbanner') {
          if (key.status === 'enable') {
            $scope.firstAdBanner = key;
          } else {
            $scope.firstAdBanner = ' ';
          }
        }
      })
    });

  }
  $scope.adBanners();
  // GET AD BANNERS

});