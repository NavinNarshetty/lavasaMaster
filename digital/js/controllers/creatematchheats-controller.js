myApp.controller('CreateMatchHeatsCtrl', function($scope, TemplateService, NavigationService, $timeout, $uibModal, $stateParams, $state, $interval, toastr, knockoutService) {
    $scope.template = TemplateService.getHTML("content/creatematch-heats.html");
    TemplateService.title = "Score Combat"; //This is the Title of the Website
    $scope.navigation = NavigationService.getNavigation();
    // CODE STARTS HERE
    // INITIALISE VARIABLES
    $scope.matchForm = {
      sportType: "",
      roundType: "",
      prefix: ''
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
    $scope.roundList = [{
      name: 'Heats',
      matches: [{
        matchId: 'HA1234',
        matchName: 'Heat 1'
      },{
        matchId: 'HA1234',
        matchName: 'Heat 1'
      },{
        matchId: 'HA1234',
        matchName: 'Heat 1'
      },{
        matchId: 'HA1234',
        matchName: 'Heat 1'
      },{
        matchId: 'HA1234',
        matchName: 'Heat 1'
      }]
    },{
      name: 'Semi Final',
      matches: [{
        matchId: 'HA1234',
        matchName: 'Heat 1'
      },{
        matchId: 'HA1234',
        matchName: 'Heat 1'
      },{
        matchId: 'HA1234',
        matchName: 'Heat 1'
      },{
        matchId: 'HA1234',
        matchName: 'Heat 1'
      },{
        matchId: 'HA1234',
        matchName: 'Heat 1'
      }]
    },{
      name: 'Final',
      matches: [{
        matchId: 'HA1234',
        matchName: 'Heat 1'
      },{
        matchId: 'HA1234',
        matchName: 'Heat 1'
      },{
        matchId: 'HA1234',
        matchName: 'Heat 1'
      },{
        matchId: 'HA1234',
        matchName: 'Heat 1'
      },{
        matchId: 'HA1234',
        matchName: 'Heat 1'
      }]
    }]
    // JSONS END

    // CODE ENDS HERE
});
