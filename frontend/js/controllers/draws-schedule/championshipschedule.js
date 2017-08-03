myApp.controller('ChampionshipScheduleCtrl', function ($scope, TemplateService, $state, NavigationService, $stateParams, toastr, $timeout, errorService, loginService, selectService, $rootScope) {
  $scope.template = TemplateService.getHTML("content/championship-schedule.html");
  TemplateService.title = "Direct Final"; //This is the Title of the Website
  $scope.navigation = NavigationService.getNavigation();

  $scope.sportList= ['football', 'Basketball','tennis', 'chess'];
  $scope.schedulelist = [{
    sport: 'Archery',
    date:'TBA'
  },{
    sport: 'boxing',
    date:'24th august'
  },{
    sport: 'tennis',
    date:'20th june'
  },{
    sport: 'boxing',
    date:'02nd july'
  },{
    sport: 'judo',
    date:'3rd august'
  },{
    sport: 'Archery',
    date:'TBA'
  }]

});
