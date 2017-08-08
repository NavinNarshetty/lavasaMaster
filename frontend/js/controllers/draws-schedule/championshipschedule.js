myApp.controller('ChampionshipScheduleCtrl', function ($scope, TemplateService, $state, NavigationService, $stateParams, toastr, $timeout, errorService, loginService, selectService, $rootScope) {
  $scope.template = TemplateService.getHTML("content/draws-schedule/championship-schedule.html");
  TemplateService.title = "Direct Final"; //This is the Title of the Website
  $scope.navigation = NavigationService.getNavigation();

  $scope.sportList = ['football', 'Basketball', 'tennis', 'chess'];
  $scope.schedulelist = [{
    sport: 'Archery',
    date1: '15',
    date2: '17',
    month: 'Dec'
  }, {
    sport: 'Athletics',

  }, {
    sport: 'Badminton',
    date1: '6',
    date2: '13',
    month: 'Dec'
  }, {
    sport: 'Basketball',
    date1: '6',
    date2: '17',
    month: 'Dec'
  }, {
    sport: 'Boxing',
    date1: '13',
    date2: '17',
    month: 'Dec'
  }, {
    sport: 'Carrom',
    date1: '13',
    date2: '17',
    month: 'Dec'
  }, {
    sport: 'Chess',
    date1: '13',
    date2: '17',
    month: 'Dec'
  }, {
    sport: 'Fencing',
    date1: '14',
    date2: '17',
    month: 'Dec'
  }, {
    sport: 'Football',
    date1: '6',
    date2: '17',
    month: 'Dec'
  }, {
    sport: 'Handball',
    date1: '6',
    date2: '17',
    month: 'Dec'
  }, {
    sport: 'Hockey',
  }, {
    sport: 'Judo',
    date1: '16',
    date2: '17',
    month: 'Dec'
  }, {
    sport: 'Kabaddi',
    date1: '6',
    date2: '12',
    month: 'Dec'
  }]

  $scope.schedulelist2 = [{
    sport: 'Karate',
    date1: '8',
    date2: '10',
    month: 'Dec'
  }, {
    sport: 'Kho Kho',
    date1: '7',
    date2: '10',
    month: 'Dec'


  }, {
    sport: 'Sport MMA',
    date1: '11',
    date2: '12',
    month: 'Dec'
  }, {
    sport: 'Shooting',
    date1: '13',
    date2: '17',
    month: 'Dec'
  }, {
    sport: 'Squash',
    date1: '12',
    date2: '14',
    month: 'Dec'
  }, {
    sport: 'Swimming',
    date1: '9',
    date2: '10',
    month: 'Dec'
  }, {
    sport: 'Table Tennis',
    date1: '6',
    date2: '11',
    month: 'Dec'
  }, {
    sport: 'Taekwondo',
    date1: '6',
    date2: '7',
    month: 'Dec'
  }, {
    sport: 'Tennis',
    date1: '7',
    date2: '13',
    month: 'Dec'
  }, {
    sport: 'Throwball',
    date1: '14',
    date2: '17',
    month: 'Dec'
  }, {
    sport: 'Volleyball',
    date1: '6',
    date2: '17',
    month: 'Dec'

  }, {
    sport: 'Water Polo',
    date: '11',
    month: 'Dec'
  }, {
    sport: '',
    date: '',
    month: ''
  }]

});