myApp.controller('SfaGalleryCtrl', function ($scope, TemplateService, errorService, NavigationService, $timeout) {
  //Used to name the .html file

  $scope.template = TemplateService.getHTML("content/insidegallery.html");
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
  }
  $scope.initSwiper();

  $scope.eventVideos = [{
    thumbnail: '/img/sa2.jpg',
    content: '10 moments on the Football court you cannot miss check out now at sfa website',
  }, {
    thumbnail: '/img/sa3.jpg',
    content: '10 moments on the Athletics court you cannot miss check out now at sfa website',

  }, {
    thumbnail: '/img/day-04.png',
    content: '10 moments on the Swimming court you cannot miss check out now at sfa website',

  }, {
    thumbnail: '/img/day-03.png',
    content: '10 moments on the  Basketball court you cannot miss check out now at sfa website',
  }, {
    thumbnail: '/img/sa4.jpg',
    content: ' 10 moments on the Hockey court you cannot miss check out now at sfa website',

  }]

  // VIEW BY CATEGORY
  $scope.getAllPhotosByCategory = function () {
    $scope.photosbyCategory = {};
    $scope.photosbyCategory.folderType = 'Category';
    NavigationService.getAllPhotosByType($scope.photosbyCategory, function (data) {
      console.log(data, "response");
      errorService.errorCode(data, function (allData) {
        if (!allData.message) {
          if (allData.value === true) {
            // console.log(allData, "alldata");
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
      console.log(data, "response");
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



});