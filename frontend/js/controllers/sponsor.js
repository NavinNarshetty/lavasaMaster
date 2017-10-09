myApp.controller('SponsorPartnerCtrl', function ($scope, TemplateService, $state, NavigationService, $stateParams, toastr, $rootScope, $uibModal, $timeout, configService) {
  $scope.template = TemplateService.getHTML("content/sponsor-partner.html");
  TemplateService.title = "Sponser Partner"; //This is the Title of the Website
  $scope.navigation = NavigationService.getNavigation();

  // configService.getDetail(function (data) {
  //   $scope.city = data.city;
  //   $scope.district = data.district;
  //   $scope.state = data.state;
  //   $scope.year = data.year;
  //   $scope.eventYear = data.eventYear;
  //   $scope.sfaCity = data.sfaCity;
  //   $scope.formData = data.sfaCity;
  //   $scope.isCollege = data.isCollege;
  //   $scope.type = data.type;
  //   if ($scope.sfaCity == 'Hyderabad') {
  //     $scope.header1 = 'Supported By'
  //     $scope.header2 = 'Partners'
  //     $scope.partner = [{
  //       img: 'img/sponser/enerzal.png'
  //     }, {
  //       img: 'img/sponser/fever.png'
  //     }, {
  //       img: 'img/sponser/ibrand.png'
  //     }, {
  //       img: 'img/sponser/tv5.png'
  //     }, {
  //       img: 'img/sponser/wizcraft.png'
  //     }];
  //     $scope.sponser = [{
  //       img: 'img/sponser/SATS.png'
  //     }, {
  //       img: 'img/sponser/telengana-state.png'
  //     }];

  //   } else if ($scope.sfaCity == 'Mumbai') {
  //     $scope.header1 = 'Sponser'
  //     $scope.header2 = 'Partners'
  //     $scope.update = "Updating Soon"



  //   } else if ($scope.sfaCity == 'Ahmedabad') {

  //   }
  // });


  $scope.getSponsor = function () {
    NavigationService.getSponsor(function (data) {
      $scope.sponsorData = data.data.data;
      console.log($scope.sponsorData, "console")
    });

  }
  $scope.getSponsor();
  $scope.data = [1, 2, 3, 4, 5, 6, 7];


});

// ADDITIONAL SPONSER

myApp.controller('IndividualSponsorCtrl', function ($scope, TemplateService, $state, NavigationService, $stateParams, toastr, $rootScope, $uibModal, $timeout, configService) {
  $scope.template = TemplateService.getHTML("content/individualsponser.html");
  TemplateService.title = "Sponser"; //This is the Title of the Website
  $scope.navigation = NavigationService.getNavigation();
  $scope.constraints = {};
  $scope.constraints._id = $stateParams.id;
  console.log($stateParams.id)

  $scope.getOneSponsor = function () {
    $scope.constraints._id = $stateParams.id;
    NavigationService.getOneSponsor($scope.constraints, function (data) {
      $scope.sponsorData = data.data.data;
      $scope.sponsorGallery = $scope.sponsorData.videoGallery.concat($scope.sponsorData.gallery);
      $scope.sponsorGallery = _.shuffle($scope.sponsorGallery)
      console.log($scope.sponsorGallery, "gallery")
      console.log($scope.sponsorData, "console")
    });
  }
  $scope.getOneSponsor();

  $scope.getSponsorCard = function () {
    $scope.constraints.sponsorId = $stateParams.id;
    NavigationService.getSponsorCard($scope.constraints, function (data) {
      $scope.sponsorCard = data.data.data;
      console.log($scope.sponsorCard, "console card")
    });
  }
  $scope.getSponsorCard();



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



});