myApp.controller('SfaGalleryCtrl', function ($scope, TemplateService, NavigationService, $timeout) {
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
  $scope.category = [{
    name: 'view category',
    cardDetail: [{
      image: '/img/day-04.png',
      title: 'All',
      count: '12'
    }, {
      image: '/img/day-03.png',
      title: 'Champion Moment',
      count: '12'
    }, {
      image: '/img/day-02.png',
      title: 'Girl day celebration with Sfa abcd',
      count: '12'
    }, {
      image: '/img/day-03.png',
      title: 'Prize Distribution',
      count: '12'
    }, {
      image: '/img/day-02.png',
      title: 'behind the scene',
      count: '12'
    }, {
      image: '/img/day-04.png',
      title: 'Champion moment',
      count: '12'
    }, {
      image: '/img/day-02.png',
      title: 'Prize distribution',
      count: '12'
    }]
  }]
  // VIEW BY CATEGORY END

  // VIEW BY SPORT
  $scope.viewBySport = [{
    name: 'view by Sport',
    sportDetail: [{
      image: '/img/sa2.jpg',
      title: 'Football',
      count: '12'
    }, {
      image: '/img/sa3.jpg',
      title: 'Athletics',
      count: '14'
    }, {
      image: '/img/day-04.png',
      title: 'Swimming',
      count: '15'
    }, {
      image: '/img/day-03.png',
      title: 'Basketball',
      count: '12'
    }]
  }]
  // VIEW BY SPORT END
});