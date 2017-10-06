myApp.controller('SponserPartnerCtrl', function ($scope, TemplateService, $state, NavigationService, $stateParams, toastr, $rootScope, $uibModal, $timeout, configService) {
  $scope.template = TemplateService.getHTML("content/sponsor-partner.html");
  TemplateService.title = "Sponser Partner"; //This is the Title of the Website
  $scope.navigation = NavigationService.getNavigation();

  configService.getDetail(function (data) {
    $scope.city = data.city;
    $scope.district = data.district;
    $scope.state = data.state;
    $scope.year = data.year;
    $scope.eventYear = data.eventYear;
    $scope.sfaCity = data.sfaCity;
    $scope.formData = data.sfaCity;
    $scope.isCollege = data.isCollege;
    $scope.type = data.type;
    if ($scope.sfaCity == 'Hyderabad') {
      $scope.header1 = 'Supported By'
      $scope.header2 = 'Partners'
      $scope.partner = [{
        img: 'img/sponser/enerzal.png'
      }, {
        img: 'img/sponser/fever.png'
      }, {
        img: 'img/sponser/ibrand.png'
      }, {
        img: 'img/sponser/tv5.png'
      }, {
        img: 'img/sponser/wizcraft.png'
      }];
      $scope.sponser = [{
        img: 'img/sponser/SATS.png'
      }, {
        img: 'img/sponser/telengana-state.png'
      }];

    } else if ($scope.sfaCity == 'Mumbai') {
      $scope.header1 = 'Sponser'
      $scope.header2 = 'Partners'
      $scope.update = "Updating Soon"



    } else if ($scope.sfaCity == 'Ahmedabad') {

    }
  });

  $scope.data = [1, 2, 3, 4, 5, 6, 7];


});

// ADDITIONAL SPONSER

myApp.controller('IndividualSponserCtrl', function ($scope, TemplateService, $state, NavigationService, $stateParams, toastr, $rootScope, $uibModal, $timeout, configService) {
  $scope.template = TemplateService.getHTML("content/individualsponser.html");
  TemplateService.title = "Sponser"; //This is the Title of the Website
  $scope.navigation = NavigationService.getNavigation();

  $scope.data = [1, 2, 3, 4]
  // SWIPER
  $scope.$on('$viewContentLoaded', function (event) {

    $timeout(function () {
      mySwiper1 = new Swiper('.swiper-container', {
        paginationClickable: true,
        nextButton: '.swiper-button-next ',
        prevButton: '.swiper-button-prev ',
        slidesPerView: 1,
        grabCursor: true,
        breakpoints: {
          992: {
            slidesPerView: 1
          },
          768: {
            slidesPerView: 1

          },
          481: {
            slidesPerView: 1
          },
          320: {
            slidesPerView: 1
          }
        }
      });
    }, 300);
  });
  // END SWIPER
  $scope.individual = {
    headerimg: "img/sponser/enerzal.png",
    bannerimg: "img/Register_Web_College.jpg"

  }

  $scope.gallery = [{
    img: 'img/dishapatani1.jpg',
    type: 'image'
  }, {
    img: 'img/sa1.jpg',
    type: 'video'
  }, {
    img: 'img/sa2.jpg',
    type: 'image'
  }, {
    img: 'img/sl1.jpg',
    type: 'image'
  }, {
    img: 'img/sa4.jpg',
    type: 'video'
  }, {
    img: 'img/sa5.jpg',
    type: 'image'
  }, {
    img: 'img/sa6.jpg',
    type: 'image'
  }, {
    img: 'img/sa7.jpg',
    type: 'image'
  }, {
    img: 'img/sa8.jpg',
    type: 'video'
  }]

});