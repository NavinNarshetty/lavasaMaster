myApp.controller('RegisterPlayerCtrl', function ($scope, TemplateService, NavigationService, $timeout, $uibModal, $sce, $filter, configService, $stateParams) {
  $scope.template = TemplateService.getHTML("content/registration/register-player.html");
  TemplateService.title = "Player Registration"; //This is the Title of the Website
  $scope.navigation = NavigationService.getNavigation();
  // CODE START
  // VARIABLE INITIALISE
  $scope.flag = $stateParams.type;
  // SET FLAG
  if ($scope.flag == 'player') {
    $scope.pageType = 'player';
    TemplateService.title = "Player Registration";
  } else if ($scope.flag = 'school') {
    $scope.pageType = 'school';
    TemplateService.title = "School Registration"; 
  }
  // SET FLAG END
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
          nextButton: '.registerplayer-testimonialslider .swiper-button-next',
          prevButton: '.registerplayer-testimonialslider .swiper-button-prev',
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
    $scope.gallerySlides = _.chunk(gallery, 6);
    _.each($scope.gallerySlides, function(n, nkey){
      $scope.allGallery.slidePhotos[nkey] =_.chunk(n,3);
    })
    // console.log("picslide",$scope.allGallery);
  }
  // GALLERY END
  // FUNCTIONS END
  // API CALLS
  // CONFIG SERVICE
  configService.getDetail(function(data){
    console.log(data);
    $scope.state = data.state;
    $scope.year = data.year;
    $scope.eventYear = data.eventYear;
    $scope.sfaCity = data.sfaCity;
    $scope.isCollege = data.isCollege;
    $scope.type = data.type;
    $scope.sports = data.sports;
    $scope.sfaDates = data.date;
    $scope.venue = data.venue;
  });
  // CONFIG SERVICE END
  // GET REGISTERATION CONTENT
  $scope.getPlayerRegistration = function(){
    NavigationService.getPlayerRegistration(function(data){
      console.log("data", data);
      data = data.data;
      if(data.value == true){
        console.log("content success", data.data.results);
        $scope.banners = data.data.results[0].banner;
        $scope.ageEventPdf = $sce.trustAsResourceUrl($filter('uploadpathTwo')(data.data.results[0].ageEventPdf));
        console.log("pdf", $scope.ageEventPdf);
        $scope.gallery = data.data.results[0].gallery;
        $scope.counts = data.data.results[0].eventCount;
        if ($scope.pageType == 'player') {
          $scope.content = data.data.results[0].playerContent;
        } else if ($scope.pageType == 'school') {
          $scope.content = data.data.results[0].schoolContent;
        }
        $scope.getGallerySlides($scope.gallery);
      } else {
        console.log("content fail", data);
      }
    });
  }
  $scope.getPlayerRegistration();
  // GET REGISTERATION CONTENT END
  // GET QUESTIONS
  $scope.getPlayerQuestions = function(){
    $scope.questionObj={
      filter: {
        typeQuestion: $scope.pageType
      }
    };
    NavigationService.getPlayerQuestions($scope.questionObj, function(data){
      console.log("questions",data);
      // data = data.data;
      if(data.value == true){
        $scope.questionList = data.data.results;
        console.log("questions success", $scope.questionList);
      } else {
        console.log("questions fail", data);
      }
    })
  }
  $scope.getPlayerQuestions();
  // GET QUESTIONS END
  // GET TESTIMONIALS
  $scope.getTestimonials = function(){
    NavigationService.getTestimonials(function(data){
      data = data.data;
      if(data.value == true){
        $scope.testimonials = data.data.results;
        console.log("testimonials success", $scope.testimonials);
      } else {
        console.log("testimonials fail", data);
      }
    });
  }
  $scope.getTestimonials();
  // GET TESTIMONIALS END
  // API CALLS END
  // JSONS
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
  // $scope.testimonials = [1,2,3,4,5,6];
  // TESTIMONIALS END
  // COUNTS
  // $scope.counts = [{
  //   number: 2,
  //   label: 'Cities'
  // },{
  //   number: 3,
  //   label: 'Championships'
  // },{
  //   number: 25,
  //   label: 'Sports'
  // },{
  //   number: 1000,
  //   label: 'Schools'
  // },{
  //   number: 70000,
  //   label: 'Athletes'
  // }]
  // COUNTS END
  // $scope.gallery = [{
  //   image: 'img/featuredthumbnail.jpg'
  // },{
  //   image: 'img/featuredthumbnail.jpg'
  // },{
  //   image: 'img/featuredthumbnail.jpg'
  // },{
  //   image: 'img/featuredthumbnail.jpg'
  // },{
  //   image: 'img/featuredthumbnail.jpg'
  // },{
  //   image: 'img/featuredthumbnail.jpg'
  // },{
  //   image: 'img/featuredthumbnail.jpg'
  // },{
  //   image: 'img/featuredthumbnail.jpg'
  // },{
  //   image: 'img/featuredthumbnail.jpg'
  // },{
  //   image: 'img/featuredthumbnail.jpg'
  // }];

  // CODE  END
  // JSONS END
});
