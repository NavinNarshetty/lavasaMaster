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
    $scope.getOneSport = function(){};
    $scope.getOneMatch = function(){
      $scope.getUrl = "Match/getOneBackend";
      NavigationService.apiCallWithData($scope.getUrl, $scope.matchData, function(data){
        if (data.value == true) {
          $scope.match = data.data;
          $scope.match.matchId = $scope.matchData.matchId;
          $scope.match.sportName = $scope.match.sport.sportslist.sportsListSubCategory.name;
          $scope.match.winner = _.find($scope.match.resultsRacquet.players, ['player', $scope.match.resultsRacquet.winner.player]);
          _.each($scope.match.resultsRacquet.players, function(n, nkey){
            var school= _.find($scope.match.opponentsSingle, ['athleteId._id', n.player]);
            n.school = school.athleteId.school.name;
          });
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
    $scope.getOneSport = function(){};
    $scope.getOneMatch = function(){
      $scope.getUrl = "Match/getOneBackend";
      NavigationService.apiCallWithData($scope.getUrl, $scope.matchData, function(data){
        if (data.value == true) {
          $scope.match = data.data;
          $scope.match.matchId = $scope.matchData.matchId;
          $scope.match.sportName = $scope.match.sport.sportslist.sportsListSubCategory.name;
          $scope.match.winner = _.find($scope.match.resultsRacquet.teams, ['team', $scope.match.resultsRacquet.winner.player]);
          console.log("match", $scope.match);
        }
      });
    }
    $scope.getOneMatch();
    // API CALLS END
    // CODE ENDS HERE
});
// *********************DOUBLES END******************************
// *********************TEAM START******************************
myApp.controller('MatchCenterTeamCtrl', function($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, knockoutService, $rootScope) {
    $scope.template = TemplateService.getHTML("content/matchcenter/team.html");
    TemplateService.title = "Match Center Team Sports"; //This is the Title of the Website
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
    // API CALLS END
    // CODE ENDS HERE
});
// *********************TEAM END******************************
// *********************TIMETRIAL START******************************
myApp.controller('MatchCenterTimeTrialCtrl', function($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, knockoutService, $rootScope) {
    $scope.template = TemplateService.getHTML("content/matchcenter/timetrial.html");
    TemplateService.title = "Match Center Time Trials"; //This is the Title of the Website
    // TemplateService.header = ""; //TO HIDE HEADER
    $scope.navigation = NavigationService.getNavigation();
    // CODE STARTS HERE
    // VARIABLES
    $scope.eventName = "Swimming";
    $scope.matchData = {};
    $scope.match = {};
    // $scope.matchData.matchId = 'H17SW6081'; //INDIVIDUAL
    $scope.matchData.matchId = 'H17SW8011'; //TEAM
    // VARIABLES END
    // FUNCTIONS
    // FUNCTIONS END
    // API CALLS
    $scope.getOneMatch = function(){
      $scope.getUrl = "Match/getOneBackend";
      NavigationService.apiCallWithData($scope.getUrl, $scope.matchData, function(data){
        if (data.value == true) {
          $scope.match = data.data;
          $scope.match.matchId = $scope.matchData.matchId;
          $scope.match.sportName = $scope.match.sport.sportslist.sportsListSubCategory.name;
          $scope.eventName = $scope.match.sport.sportslist.name;

          console.log("match", $scope.match);
        }
      });
    }
    $scope.getOneMatch();
    // API CALLS END
    // CODE ENDS HERE
});
// *********************TIMETRIAL END******************************
