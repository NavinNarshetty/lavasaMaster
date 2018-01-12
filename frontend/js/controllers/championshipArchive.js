myApp.controller('championArchiveCtrl', function ($scope, TemplateService, $state, NavigationService, $stateParams, toastr, $rootScope, $uibModal, $timeout, configService) {
  $scope.template = TemplateService.getHTML("content/championshiparchive.html");
  TemplateService.title = "Sponser Partner"; //This is the Title of the Website
  $scope.navigation = NavigationService.getNavigation();

  $scope.data = [1, 2, 3]
  // HIGHLIGHTS
  $scope.highlights = [{
    thumbnail: '/img/sa2.jpg',
    content: 'Sfa 2015 | Mumbai | Football Highlights',
    vlink: '2Vv-BfVoq4g',
    vtype: 'youtube'
  }, {
    thumbnail: '/img/sa6.jpg',
    content: 'Sfa 2015 | Mumbai | Tennis Highlights',
    vlink: '249632916',
    vtype: 'vimeo'
  }, {
    thumbnail: '/img/About_Mobile_Hyd.jpg',
    content: 'Sfa 2015 | Mumbai | Badminton Highlights',
    vlink: '2Vv-BfVoq4g',
    vtype: 'youtube'
  }, {
    thumbnail: '/img/sa8.jpg',
    content: 'Sfa 2015 | Mumbai | Basketball Highlights',
    vlink: '249632916',
    vtype: 'vimeo'
  }, {
    thumbnail: '/img/sa11.jpg',
    content: 'Sfa 2015 | Mumbai | Swimming Highlights',
    vlink: '2Vv-BfVoq4g',
    vtype: 'youtube'
  }];
  // HIGHLIGHTS END


  $scope.schoolRankingTable = [{
    name: "Lady Ratanbai & Sir MathuradasVissanji Academy",
    goldPoints: '200',
    silverPoints: '300',
    bronzePoints: '400',
    total: '999'
  }, {
    name: "Lady Ratanbai & Sir MathuradasVissanji Academy",
    goldPoints: '200',
    silverPoints: '300',
    bronzePoints: '400',
    total: '999'
  }, {
    name: "St.Xavier's High School (Airoli)",
    goldPoints: '200',
    silverPoints: '300',
    bronzePoints: '400',
    total: '999'
  }, {
    name: "Ryan International School, Kharghar",
    goldPoints: '200',
    silverPoints: '300',
    bronzePoints: '400',
    total: '999'
  }, {
    name: "Lady Ratanbai & Sir MathuradasVissanji Academy",
    goldPoints: '200',
    silverPoints: '300',
    bronzePoints: '400',
    total: '999'
  }]


  // SPORT SPECIFIC
  $scope.sportSpecific = [{
    name: 'archery'
  }, {
    name: 'athletics'
  }, {
    name: 'badminton'
  }, {
    name: 'basketball'
  }, {
    name: 'boxing'
  }, {
    name: 'carrom'
  }, {
    name: 'chess'
  }, {
    name: 'fencing'
  }, {
    name: 'football'
  }, {
    name: 'handball'
  }, {
    name: 'hockey'
  }, {
    name: 'judo'
  }, {
    name: 'kabaddi'
  }, {
    name: 'karate'
  }, {
    name: 'kho kho'
  }, {
    name: 'sport mma'
  }, {
    name: 'shooting'
  }, {
    name: 'squash'
  }, {
    name: 'swimming'
  }, {
    name: 'table tennis'
  }, {
    name: 'taekwondo'
  }, {
    name: 'tennis'
  }, {
    name: 'throwball'
  }, {
    name: 'volleyball'
  }, {
    name: 'water polo'
  }]

  // SPORT SPECIFIC END


  $scope.galleryData = [{
    galleryType: 'Image',
    image: 'img/sa2.jpg'
  }, {
    galleryType: 'Video',
    vlink: '2Vv-BfVoq4g',
    vtype: 'youtube',
    vimage: 'img/sl1.jpg'
  }, {
    galleryType: 'Image',
    image: 'img/sa4.jpg'
  }, {
    galleryType: 'Video',
    vlink: '249632916',
    vtype: 'vimeo',
    vimage: 'img/sl1.jpg'
  }, {
    galleryType: 'Image',
    image: 'img/sa6.jpg'
  }, {
    galleryType: 'Video',
    vlink: '2Vv-BfVoq4g',
    vtype: 'youtube',
    vimage: 'img/sl1.jpg'
  }, {
    galleryType: 'Image',
    image: 'img/sa8.jpg'
  }, {
    galleryType: 'Image',
    image: 'img/sa3.jpg'
  }]
});