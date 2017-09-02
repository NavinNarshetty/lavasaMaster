myApp.controller('FootballScoreCtrl', function($scope, TemplateService, NavigationService, $timeout, $uibModal, $stateParams, $state, $interval, toastr) {
    $scope.template = TemplateService.getHTML("content/scorefootball.html");
    TemplateService.title = "Score Football"; //This is the Title of the Website
    $scope.navigation = NavigationService.getNavigation();
    // ************
    $scope.match = {};
    // JSON
    $scope.match = {
      matchId: '123456',
      sportsName: 'Football',
      age: 'u-11',
      gender: 'female',
      round: 'final',
      teams: [{
        schoolName: 'jamnabai narsee school',
        teamId: '987654',
        teamResults:{
          halfPoints:10,
          finalPoints:22,
          penalityPoints:1,
          shotsOnGoal: 2,
          totalShots:2,
          corners:2,
          penality:1,
          saves:1,
          fouls:1,
          offSide:1,
          cleanSheet:1
        },
        players: [{
          name: 'hello',
          isPlaying: true
        },{
          name: 'hello',
          isPlaying: true
        },{
          name: 'hello',
          isPlaying: false
        },{
          name: 'hello',
          isPlaying: true
        },{
          name: 'hello',
          isPlaying: false
        }]
      },{
        schoolName: 'Marvel iron high school',
        teamId: '54321',
        teamResults:{
          halfPoints:10,
          finalPoints:22,
          penalityPoints:1,
          shotsOnGoal: 2,
          totalShots:2,
          corners:2,
          penality:1,
          saves:1,
          fouls:1,
          offSide:1,
          cleanSheet:1
        },
        players: [{
          name: 'hello',
          isPlaying: false
        },{
          name: 'hello',
          isPlaying: true
        },{
          name: 'hello',
          isPlaying: false
        },{
          name: 'hello',
          isPlaying: false
        },{
          name: 'hello',
          isPlaying: true
        }]
      }]
    }
    // JSON END

    // ************
})
