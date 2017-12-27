myApp.controller('MatchVideoCtrl', function ($scope, TemplateService, $state, NavigationService, $stateParams, toastr, $rootScope, $uibModal, $timeout, configService) {
  $scope.template = TemplateService.getHTML("content/matchvideo.html");
  TemplateService.title = "Match Video"; //This is the Title of the Website
  $scope.navigation = NavigationService.getNavigation();


  // FEATURED VIDEO JSON
  $scope.featured = [{
    featuredCard: [{
      thumbnail: 'img/featuredthumbnail.jpg',
      content: '10 Moments on Athletics',
      link: '235618360',
      type: 'vimeo'
    }, {
      thumbnail: 'img/featuredthumbnail.jpg',
      content: '10 Moments on Basketball',
      link: 'HCjNJDNzw8Y',
      type: 'youtube'
    }, {
      thumbnail: 'img/featuredthumbnail.jpg',
      content: '10 Moments on Tennis',
      link: '235618360',
      type: 'vimeo'
    }]

  }, {
    featuredCard: [{
      thumbnail: 'img/featuredthumbnail.jpg',
      content: '10 Moments on Tennis',
      link: 'HCjNJDNzw8Y',
      type: 'youtube'
    }, {
      thumbnail: 'img/featuredthumbnail.jpg',
      content: '10 Moments on Badminton',
      link: '235618360',
      type: 'vimeo'
    }, {
      thumbnail: 'img/featuredthumbnail.jpg',
      content: '10 Moments on Swimming',
      link: 'HCjNJDNzw8Y',
      type: 'youtube'
    }]
  }]
  // FEATURED VIDEO JSON END



  // TOP MATCH SPORT JSON
  $scope.topMatch = [{
    sportname: 'Archery',
    videos: [{
      thumbnail: 'img/featuredthumbnail.jpg',
      content: '10 Moments on the Archery Field',
      link: '235618360',
      type: 'vimeo'
    }, {
      thumbnail: 'img/featuredthumbnail.jpg',
      content: '10 Moments on the Archery Field',
      link: 'HCjNJDNzw8Y',
      type: 'youtube'
    }, {
      thumbnail: 'img/featuredthumbnail.jpg',
      content: '10 Moments on the Archery Field',
      link: '235618360',
      type: 'vimeo'
    }, {
      thumbnail: 'img/featuredthumbnail.jpg',
      content: '10 Moments on the Archery Field',
      link: 'HCjNJDNzw8Y',
      type: 'youtube'
    }]
  }, {
    sportname: 'Athletics',
    videos: [{
      thumbnail: 'img/featuredthumbnail.jpg',
      content: '10 Moments on the Athletics Field',
      link: '235618360',
      type: 'vimeo'
    }, {
      thumbnail: 'img/featuredthumbnail.jpg',
      content: '10 Moments on the Athletics Field',
      link: 'HCjNJDNzw8Y',
      type: 'youtube'
    }, {
      thumbnail: 'img/featuredthumbnail.jpg',
      content: '10 Moments on the Athletics Field',
      link: '235618360',
      type: 'vimeo'
    }, {
      thumbnail: 'img/featuredthumbnail.jpg',
      content: '10 Moments on the Athletics Field',
      link: 'HCjNJDNzw8Y',
      type: 'youtube'
    }]
  }, {
    sportname: 'Basketball',
    videos: [{
      thumbnail: 'img/featuredthumbnail.jpg',
      content: '10 Moments on the Basketball court',
      link: '235618360',
      type: 'vimeo'
    }, {
      thumbnail: 'img/featuredthumbnail.jpg',
      content: '10 Moments on the Basketball court',
      link: 'HCjNJDNzw8Y',
      type: 'youtube'
    }, {
      thumbnail: 'img/featuredthumbnail.jpg',
      content: '10 Moments on the Basketball court',
      link: '235618360',
      type: 'vimeo'
    }, {
      thumbnail: 'img/featuredthumbnail.jpg',
      content: '10 Moments on the Basketball court',
      link: 'HCjNJDNzw8Y',
      type: 'youtube'
    }]
  }]
  // TOP MATCH SPORT JSON END
});