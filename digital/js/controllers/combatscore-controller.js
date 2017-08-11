myApp.controller('CombatScoreCtrl', function ($scope, TemplateService, NavigationService, $timeout, $uibModal) {
        $scope.template = TemplateService.getHTML("content/score-combat.html");
        TemplateService.title = "Sport Match"; //This is the Title of the Website
        $scope.navigation = NavigationService.getNavigation();

        // VARIABLE INITIALISE
        $scope.showScoreSheet = false;
        $scope.showMatchPhoto = false;
        // $scope.matchData = {};
        // VARIABLE INITIALISE END

        // API CALLN INTEGRATION
        $scope.getOneMatch = function(){
          NavigationService.getOneMatch(matchData, function(){

          })
        };
        // API CALLN INTEGRATION END

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
              point: 0,
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
              point: 0,
            }]
          }],
          winner:{},
        };
        // MATCH JSON END

        $scope.reasons = ['WP','RSC','RSC-I','DSQ','KO','WO','NC'];

        // SCORE INCREMENT
        $scope.incrementScore = function(set){
          $scope.set = set;
          $scope.set.point = $scope.set.point + 1;
          console.log("increment");
        };
        // SCORE INCREMENT END
        // SCORE DECREMENT
        $scope.decrementScore = function(set){
          $scope.set = set;
          if($scope.set.point >0 ){
            $scope.set.point = $scope.set.point - 1;
          }
          console.log("decrement");
        };
        // SCORE DECREMENT END
        // GET MATCH SCORESHEET
        $scope.getMatchScoreSheet = function(data){
          $scope.match.scoreSheet = data;
          $scope.showScoreSheet = true;
        };
        // GET MATCH SCORESHEET END
      })
