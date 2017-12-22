myApp.controller('CreateMatchHeatsCtrl', function($scope, TemplateService, NavigationService, $timeout, $uibModal, $stateParams, $state, $interval, toastr, knockoutService) {
    $scope.template = TemplateService.getHTML("content/creatematch-heats.html");
    TemplateService.title = "Score Combat"; //This is the Title of the Website
    $scope.navigation = NavigationService.getNavigation();
    // CODE STARTS HERE
    // INITIALISE VARIABLES
    $scope.matchForm = {
      sportType: "",
      matchCount: '',
      prefix: '',
      roundName: ''
    }
    $scope.roundType = [{
      type: 'Heat'
    },{
      type: 'Qualifying'
    }];
    // INITIALISE VARIABLES END
    // FUNCTIONS
    $scope.createMatches = function(){
      console.log('createMatches', $scope.matchForm);
    }
    // FUNCTIONS END

    // JSONS
    $scope.matchList = [{
      matchId: 'LOLRAJ123',
    },{
      matchId: 'LOLRAJ123',
    },{
      matchId: 'LOLRAJ123',
    },{
      matchId: 'LOLRAJ123',
    },{
      matchId: 'LOLRAJ123',
    }]
    // JSONS END

    // CODE ENDS HERE
});
