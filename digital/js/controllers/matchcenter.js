// *********************SINGLES START******************************
myApp.controller('MatchCenterRaquetCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, knockoutService, $rootScope, configService) {
  $scope.template = TemplateService.getHTML("content/matchcenter/raquet.html");
  TemplateService.title = "Match Center Raquet"; //This is the Title of the Website
  TemplateService.header = ""; //TO HIDE HEADER
  $scope.navigation = NavigationService.getNavigation();
  // CODE STARTS HERE
  // VARIABLES
  $scope.matchData = {};
  $scope.match = {};
  $scope.matchData.matchId = $stateParams.id;
  // $scope.matchData.matchId = 'H17BD867';
  // VARIABLES END
  // FUNCTIONS
  // PRINT FUNCTION
  $scope.printFunction = function (printSectionId) {
    window.print();
    $timeout(function () {
      window.close();
    }, 300);
  };
  // PRINT FUNCTION END
  // FUNCTIONS END
  // API CALLS
  // GET CONFIG
  configService.getDetail(function (data) {
    $scope.eventName = data.eventName;
  })
  // GET CONFIG END
  // GET MATCH
  $scope.getOneMatch = function () {
    $scope.getUrl = "Match/getOneBackend";
    NavigationService.apiCallWithData($scope.getUrl, $scope.matchData, function (data) {
      if (data.value == true) {
        $scope.match = data.data;
        $scope.match.matchId = $scope.matchData.matchId;
        $scope.match.sportName = $scope.match.sport.sportslist.sportsListSubCategory.name;
        $scope.match.winner = _.find($scope.match.resultsRacquet.players, ['player', $scope.match.resultsRacquet.winner.player]);
        _.each($scope.match.resultsRacquet.players, function (n, nkey) {
          var school = _.find($scope.match.opponentsSingle, ['athleteId._id', n.player]);
          n.school = school.athleteId.school.name;
        });
        console.log("match", $scope.match);
        $timeout(function () {
          $scope.printFunction();
        }, 900);
      }
    });
  }
  $scope.getOneMatch();
  // GET MATCH END
  // API CALLS END
  // CODE ENDS HERE
});
// *********************SINGLES END********************************

// *********************DOUBLES START******************************
myApp.controller('MatchCenterDoublesCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, knockoutService, $rootScope, configService) {
  $scope.template = TemplateService.getHTML("content/matchcenter/doubles.html");
  TemplateService.title = "Match Center Doubles"; //This is the Title of the Website
  TemplateService.header = ""; //TO HIDE HEADER
  $scope.navigation = NavigationService.getNavigation();
  // CODE STARTS HERE
  // VARIABLES
  $scope.matchData = {};
  $scope.match = {};
  $scope.matchData.matchId = $stateParams.id;
  // $scope.matchData.matchId = 'H17BD4177';
  // VARIABLES END
  // FUNCTIONS
  // PRINT FUNCTION
  $scope.printFunction = function (printSectionId) {
    window.print();
    $timeout(function () {
      window.close();
    }, 300);
  };
  // PRINT FUNCTION END
  // FUNCTIONS END
  // API CALLS
  // GET CONFIG
  configService.getDetail(function (data) {
    $scope.eventName = data.eventName;
  })
  // GET CONFIG END
  // GET MATCH
  $scope.getOneMatch = function () {
    $scope.getUrl = "Match/getOneBackend";
    NavigationService.apiCallWithData($scope.getUrl, $scope.matchData, function (data) {
      if (data.value == true) {
        $scope.match = data.data;
        $scope.match.matchId = $scope.matchData.matchId;
        $scope.match.sportName = $scope.match.sport.sportslist.sportsListSubCategory.name;
        $scope.match.winner = _.find($scope.match.resultsRacquet.teams, ['team', $scope.match.resultsRacquet.winner.player]);
        console.log("match", $scope.match);
        $timeout(function () {
          $scope.printFunction();
        }, 900);
      }
    });
  }
  $scope.getOneMatch();
  // GET MATCH END
  // API CALLS END
  // CODE ENDS HERE
});
// *********************DOUBLES END********************************

// *********************TEAM START******************************
myApp.controller('MatchCenterTeamCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, knockoutService, $rootScope, configService) {
  $scope.template = TemplateService.getHTML("content/matchcenter/team.html");
  TemplateService.title = "Match Center Team Sports"; //This is the Title of the Website
  TemplateService.header = ""; //TO HIDE HEADER
  $scope.navigation = NavigationService.getNavigation();
  // CODE STARTS HERE
  // VARIABLES
  $scope.matchData = {};
  $scope.match = {};
  $scope.matchData.matchId = $stateParams.id;
  // $scope.matchData.matchId = 'H17BD867';
  // VARIABLES END
  // FUNCTIONS
  // PRINT FUNCTION
  $scope.printFunction = function (printSectionId) {
    window.print();
    $timeout(function () {
      window.close();
    }, 300);
  };
  // PRINT FUNCTION END
  // FUNCTIONS END
  // API CALLS
  // GET CONFIG
  configService.getDetail(function (data) {
    $scope.eventName = data.eventName;
  })
  // GET CONFIG END
  // API CALLS END
  // CODE ENDS HERE
});
// *********************TEAM END********************************

// *********************TIMETRIAL START******************************
myApp.controller('MatchCenterTimeTrialCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, knockoutService, $rootScope, configService) {
  $scope.template = TemplateService.getHTML("content/matchcenter/timetrial.html");
  TemplateService.title = "Match Center Time Trials"; //This is the Title of the Website
  // TemplateService.header = ""; //TO HIDE HEADER
  $scope.navigation = NavigationService.getNavigation();
  // CODE STARTS HERE
  // VARIABLES
  $scope.matchData = {};
  $scope.match = {};
  $scope.matchData.matchId = $stateParams.id;
  // VARIABLES END
  // FUNCTIONS
  // PRINT FUNCTION
  $scope.printFunction = function (printSectionId) {
    window.print();
    $timeout(function () {
      window.close();
    }, 300);
  };
  // PRINT FUNCTION END
  // FUNCTIONS END
  // API CALLS
  // GET CONFIG
  configService.getDetail(function (data) {
    $scope.eventName = data.eventName;
  })
  // GET CONFIG END
  // GET MATCH
  $scope.getOneMatch = function () {
    $scope.getUrl = "Match/getOneBackend";
    NavigationService.apiCallWithData($scope.getUrl, $scope.matchData, function (data) {
      if (data.value == true) {
        $scope.match = data.data;
        $scope.match.matchId = $scope.matchData.matchId;
        $scope.match.sportName = $scope.match.sport.sportslist.sportsListSubCategory.name;
        $scope.sport = $scope.match.sport.sportslist.name;
        if ($scope.match.opponentsSingle.length>0) {
          _.each($scope.match.opponentsSingle,function(n, nkey){
            var ath = _.find($scope.match.resultHeat.players, ['id', n._id]);
            n.fullName = n.athleteId.firstName +  " " + n.athleteId.surname;
            n.laneNo = ath.laneNo;
            n.time = ath.time;
            n.result = ath.result;
            console.log("n", n);
          });
        } else if ($scope.match.opponentsTeam.length>0) {
          _.each($scope.match.opponentsTeam,function(n, nkey){
            var ath = _.find($scope.match.resultHeat.teams, ['id', n._id]);
            n.fullName = n.athleteId.firstName +  " " + n.athleteId.surname;
            n.laneNo = ath.laneNo;
            n.time = ath.time;
            n.result = ath.result;
            console.log("n", n);
          });
        }
        console.log("match", $scope.match);
        $timeout(function () {
          $scope.printFunction();
        }, 900);
      }
    });
  }
  $scope.getOneMatch();
  // GET MATCH END
  // API CALLS END
  // CODE ENDS HERE
});
// *********************TIMETRIAL END********************************

// *********************SWISS LEAGUE START******************************
myApp.controller('MatchCenterSwissLeagueCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, knockoutService, $rootScope, configService) {
  $scope.template = TemplateService.getHTML("content/matchcenter/swissleague.html");
  TemplateService.title = "Match Center Time Trials"; //This is the Title of the Website
  TemplateService.header = ""; //TO HIDE HEADER
  $scope.navigation = NavigationService.getNavigation();
  // CODE STARTS HERE
  // VARIABLES
  $scope.matchData = {};
  $scope.match = {};
  $scope.matchs = {};
  $scope.matchData ={
    sport: $stateParams.id,
    round: $stateParams.round
  }
  // VARIABLES END
  // FUNCTIONS
  // PRINT FUNCTION
  $scope.printFunction = function (printSectionId) {
    window.print();
    $timeout(function () {
      window.close();
    }, 300);
  };
  // PRINT FUNCTION END
  // FUNCTIONS END
  // API CALLS
  // GET CONFIG
  configService.getDetail(function (data) {
    $scope.eventName = data.eventName;
  })
  // GET CONFIG END
  // GET MATCH
  $scope.getOneMatch = function () {
    $scope.getUrl = "Match/getAllQualifyingPerRound";
    NavigationService.apiCallWithData($scope.getUrl, $scope.matchData, function (data) {
      if (data.value == true) {
        $scope.matchs = data.data;
        $scope.match.round = $scope.matchData.round;
        $scope.match.sport = $scope.matchs[0].sport;
        $scope.match.sportName = $scope.match.sport.sportslist.sportsListSubCategory.name;
        _.each($scope.matchs, function(n, nkey){
          _.each(n.resultSwiss.players, function(m, mkey){
            var ath = _.find(n.opponentsSingle, ['_id', m.id]);
            m.fullName = ath.athleteId.firstName + ' ' + ath.athleteId.surname;
            if (m.id == n.resultSwiss.winner.player) {
              m.isWinner = true;
            }
            // console.log("m", nkey, m);
          });
          // console.log("n", n);
        });
        console.log("match",$scope.matchs, $scope.match);
        $timeout(function () {
          $scope.printFunction();
        }, 900);
      }
    });
  }
  $scope.getOneMatch();
  // GET MATCH END
  // API CALLS END
  // CODE ENDS HERE
});
// *********************SWISS LEAGUE END********************************
