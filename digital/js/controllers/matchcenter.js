// *********************SINGLES START******************************
myApp.controller('MatchCenterRaquetCtrl', function($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, knockoutService, $rootScope) {
    $scope.template = TemplateService.getHTML("content/matchcenter/raquet.html");
    TemplateService.title = "Match Center Raquet"; //This is the Title of the Website
    // TemplateService.header = ""; //TO HIDE HEADER
    $scope.navigation = NavigationService.getNavigation();
    // CODE STARTS HERE
    // VARIABLES
    $scope.matchData = {};
    $scope.match = {};
    $scope.matchData.matchId = 'H17BD867';
    // VARIABLES END
    // FUNCTIONS
    // FUNCTIONS END
    // API CALLS
    $scope.getOneSport = function(){

    };
    $scope.getOneMatch = function(){
      NavigationService.getOneMatch($scope.matchData, function(data){
        if (data.value == true) {
          $scope.match = data.data;
          $scope.match.matchId = $scope.matchData.matchId;
          $scope.match.sportName = "Badminton";
          $scope.match.sport = {
            sportslist: {
              name: "Badminton Singles"
            }
          }
          // $scope.match.sportName = $scope.match.sport.sportslist.sportsListSubCategory.name;
          var playerArr = [];
          _.each($scope.match.opponentsSingle, function(n, nkey){
            console.log(n, $scope.match.resultsRacquet.players);
            // $scope.playerArr[nkey] = _.find(card.resultsRacquet.players, ['player', _.toString(n.athleteId._id)]);
          })
          // console.log("palyerarr",$scope.playerArr);
          // console.log("card.pla",card.resultsRacquet.players);
          // card.resultsRacquet.players = $scope.playerArr;
          console.log("match", $scope.match);
        }
      });
    }
    $scope.getOneMatch();
    // API CALLS END
    // CODE ENDS HERE
});
// *********************SINGLES END******************************

// *********************DOUBLES START******************************
myApp.controller('MatchCenterDoublesCtrl', function($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, knockoutService, $rootScope) {
    $scope.template = TemplateService.getHTML("content/matchcenter/doubles.html");
    TemplateService.title = "Match Center Doubles"; //This is the Title of the Website
    // TemplateService.header = ""; //TO HIDE HEADER
    $scope.navigation = NavigationService.getNavigation();
    // CODE STARTS HERE
    // VARIABLES
    $scope.matchData = {};
    $scope.match = {};
    $scope.matchData.matchId = 'H17BD4177';
    // VARIABLES END
    // FUNCTIONS
    // FUNCTIONS END
    // API CALLS
    $scope.getOneSport = function(){

    };
    $scope.getOneMatch = function(){
      NavigationService.getOneMatch($scope.matchData, function(data){
        if (data.value == true) {
          $scope.match = data.data;
          $scope.match.matchId = $scope.matchData.matchId;
          $scope.match.sportName = "Badminton Doubles";
          // $scope.match.sportName = $scope.match.sport.sportslist.sportsListSubCategory.name;

          console.log("match", $scope.match);
        }
      });
    }
    $scope.getOneMatch();
    // API CALLS END
    // CODE ENDS HERE
});
// *********************DOUBLES END******************************
