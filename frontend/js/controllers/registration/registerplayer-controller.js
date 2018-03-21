myApp.controller('RegisterPlayerCtrl', function ($scope, TemplateService, NavigationService, $timeout, $uibModal) {
  $scope.template = TemplateService.getHTML("content/registration/register-player.html");
  TemplateService.title = "Player Registration"; //This is the Title of the Website
  $scope.navigation = NavigationService.getNavigation();
  // CODE START
  // VARIABLE INITIALISE
  $scope.oneAtATime = true;
  $scope.questionLimit = {
    value: 2,
    more: true
  };
  $scope.banners = $scope.questionList = $scope.testimonials = $scope.counts = $scope.gallery = [];
  $scope.showForm = false;
  $scope.stepTab = 0;
  $scope.stepForm = false;
  // VARIABLE INITIALISE END
  // FUNCTIONS
  // SWIPER INITIALISE
  $scope.swiperInit = function(){
    $timeout(function (){
      // TESTIMONIALS
      var bannerSlide = new Swiper('.registerplayer-bannerslider .swiper-container', {
          slidesPerView: 1,
          paginationClickable: true,
          loop: true,
          autoplay: 3000,
          // grabCursor: true,
      })
      // BANNER END
      // TESTIMONIALS
      var testimonialSlide = new Swiper('.registerplayer-testimonialslider .swiper-container', {
          slidesPerView: 2,
          paginationClickable: true,
          loop: true,
          grabCursor: true,
          spaceBetween: 10,
          nextButton: '.swiper-button-next',
          prevButton: '.swiper-button-prev',
          touchEventsTarget: 'container',
          breakpoints: {
              992: {
                  slidesPerView: 2
              },
              768: {
                  slidesPerView: 2

              },
              481: {
                  slidesPerView: 1
              },
              320: {
                  slidesPerView: 1
              }
          }
      })
      // TESTIMONIALS END
      // TESTIMONIALS END
      var gallerySlide = new Swiper('.registerplayer-galleryslider .swiper-container', {
          slidesPerView: 1,
          paginationClickable: true,
          loop: true,
          grabCursor: true,
          spaceBetween: 10,
          nextButton: '.swiper-button-next',
          prevButton: '.swiper-button-prev',
          touchEventsTarget: 'container'
      })
    }, 600);
  }
  $scope.$on('$viewContentLoaded', function (event) {
    $scope.swiperInit();
  })
  // SWIPER INITIALISE END
  // FORM
  // OPEN FORM
  $scope.registerOpen = function(){
    $scope.showForm = !$scope.showForm;
    $scope.stepTab = 0;
  }
  // OPEN FORM END
  // SELECT STEP
  $scope.showStep = function(step){
    $scope.stepTab = step;
    $scope.stepForm = false;
  }
  // SELECT STEP END
  // SHOW STEP 1 FORM
  $scope.showStepForm = function(){
    $scope.stepForm = !$scope.stepForm;
  }
  // SHOW STEP 1 FORM
  // CHANGE DETAILS POPUP
  $scope.changeDetails = function(){
    $uibModal.open({
      animation: true,
      scope: $scope,
      templateUrl: 'views/modal/changecontact.html',
      size: 'sm',
      windowClass: 'modal-changedetails'
    })
  }
  // CHANGE DETAILS POPUP END
  // FORGOT PASSWORD POPUP
  $scope.showForgotPassword = function(){
    $uibModal.open({
      animation: true,
      scope: $scope,
      // backdrop: 'static',
      keyboard: false,
      templateUrl: 'views/modal/forgotpassword.html',
      windowClass: 'modal-forgotpassword'
    })
  }
  // FORGOT PASSWORD POPUP END
  // FORM END
  // QUESTIONS SECTION
  $scope.moreQuestions = function(){
    if ($scope.questionLimit.value == 2) {
      $scope.questionLimit = {
        value: $scope.questionList.length,
        more: false
      };
      $scope.questionLimit = $scope.questionList.length;
    } else {
      $scope.questionLimit = {
        value: 2,
        more: true
      };
    }
    console.log("$scope.questionLimit", $scope.questionLimit);
  }
  // QUESTIONS SECTION END
  // GALLERY
  $scope.gallerySlides = []
  $scope.allGallery = {
    'photoSlide': [],
    'slidePhotos':[]
  };
  $scope.getGallerySlides = function(gallery){
    console.log("gallery", gallery);
    $scope.gallerySlides = _.chunk(gallery, 6);
    console.log("slides", $scope.gallerySlides);
    _.each($scope.gallerySlides, function(n, nkey){
      $scope.allGallery.slidePhotos[nkey] =_.chunk(n,3);
    })
    console.log("picslide",$scope.allGallery);
  }
  // GALLERY END
  // FUNCTIONS END
  // JSONS
  // JSONS END
  // BANNERS
  $scope.banners = [{
    image: 'img/About_Web_Hyd.jpg'
  },{
    image: 'img/About_Web_Hyd.jpg'
  },{
    image: 'img/About_Web_Hyd.jpg'
  }];
  // BANNERS END
  // TESTIMONIALS
  $scope.testimonials = [1,2,3,4,5,6];
  // TESTIMONIALS END
  // COUNTS
  $scope.counts = [{
    number: 2,
    label: 'Cities'
  },{
    number: 3,
    label: 'Championships'
  },{
    number: 25,
    label: 'Sports'
  },{
    number: 1000,
    label: 'Schools'
  },{
    number: 70000,
    label: 'Athletes'
  }]
  // COUNTS END
  $scope.gallery = [{
    image: 'img/featuredthumbnail.jpg'
  },{
    image: 'img/featuredthumbnail.jpg'
  },{
    image: 'img/featuredthumbnail.jpg'
  },{
    image: 'img/featuredthumbnail.jpg'
  },{
    image: 'img/featuredthumbnail.jpg'
  },{
    image: 'img/featuredthumbnail.jpg'
  },{
    image: 'img/featuredthumbnail.jpg'
  },{
    image: 'img/featuredthumbnail.jpg'
  },{
    image: 'img/featuredthumbnail.jpg'
  },{
    image: 'img/featuredthumbnail.jpg'
  }];
  $scope.getGallerySlides($scope.gallery);
  // CODE  END
});
