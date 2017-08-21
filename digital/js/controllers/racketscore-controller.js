myApp.controller('RacketScoreCtrl', function($scope, TemplateService, NavigationService, $timeout, $uibModal) {
    $scope.template = TemplateService.getHTML("content/score-racket.html");
    TemplateService.title = "Score Racket"; //This is the Title of the Website
    $scope.navigation = NavigationService.getNavigation();

    // MATCH JSON
    $scope.match = {
      id: 123,
      sfaid: 123456,
      sport: 'judo',
      round: 'round 1',
      age: 'u-16',
      gender: 'male',
      players : [{
        player: '1',
        sfaid: '1234',
        noShow: true,
        walkover: true,
        color: 'blue',
        name: 'Jaiveeraj Singh ShikaWat ',
        school: 'Jamnabai Shivveeraj Singh ShikaWath school',
        sets:[{
          serviceError: 0,
          winner: 0,
          unforcedError: 0
        }]
      },{
        player: '2',
        sfaid: '1234',
        color: 'red',
        noShow: true,
        walkover: true,
        name: 'Shivveeraj Singh ShikaWat',
        school: 'Jamnabai Shivveeraj Singh ShikaWat school',
        sets:[{
          serviceError: 0,
          winner: 0,
          unforcedError: 0
        }]
      }],
      winner:{},
    };
    // MATCH JSON END

    $scope.reasons = ['WP','RSC','RSC-I','DSQ','KO','WO','NC'];

    // SCORE INCREMENT
    $scope.incrementScore = function(set, model){
      $scope.set = set;
      switch (model) {
        case 'serviceError':
          $scope.set.serviceError = $scope.set.serviceError + 1;
        break;
        case 'winner':
          $scope.set.winner = $scope.set.winner + 1;
        break;
        case 'unforcedError':
          $scope.set.unforcedError = $scope.set.unforcedError + 1;
        break;
      }
      console.log("increment");
    };
    // SCORE INCREMENT END
    // SCORE DECREMENT
    $scope.decrementScore = function(set, model){
      $scope.set = set;
      switch (model) {
        case 'serviceError':
        if($scope.set.serviceError>0 ){
          $scope.set.serviceError = $scope.set.serviceError - 1;
        }
        break;
        case 'winner':
        if($scope.set.winner>0 ){
          $scope.set.winner = $scope.set.winner - 1;
        }
        break;
        case 'unforcedError':
        if($scope.set.unforcedError>0 ){
          $scope.set.unforcedError = $scope.set.unforcedError - 1;
        }
        case 'ace':
        if($scope.set.ace>0 ){
          $scope.set.ace = $scope.set.ace - 1;
        }
        case 'doubleFaults':
        if($scope.set.doubleFaults>0 ){
          $scope.set.doubleFaults = $scope.set.doubleFaults - 1;
        }
        break;
      }
      console.log("decrement");
    };
    // SCORE DECREMENT END

    // ADD SET
    $scope.addSet = function(){
    }
    // ADD SET END
})
