myApp.controller('CreateMatchHeatsCtrl', function($scope, TemplateService, NavigationService, $timeout, $uibModal, $stateParams, $state, $interval, toastr, knockoutService) {
    $scope.template = TemplateService.getHTML("content/creatematch-heats.html");
    TemplateService.title = "Score Combat"; //This is the Title of the Website
    $scope.navigation = NavigationService.getNavigation();
    // CODE STARTS HERE
    // INITIALISE VARIABLES
    // $scope.sport = $stateParams.sport;
    $scope.sportDetails = {
      sport: '59562b524e87533db9811d41'
    }
    $scope.matchForm = {
      sport: $scope.sportDetails.sport,
      prefix: '',
      round: "",
      sportType: ""
    }
    $scope.roundType = [{
      type: 'Heat'
    },{
      type: 'Qualifying'
    }];
    // INITIALISE VARIABLES END
    // FUNCTIONS
    // GET ROUNDS AND MATCHES
    $scope.getSportSpecificRounds = function(){
      console.log("getSportSpecificRounds", $scope.sportDetails);
      NavigationService.getSportSpecificRounds($scope.sportDetails, function(data){
        data = data.data;
        if (data.value == true) {
          $scope.roundsList = data.data.roundsList;
          console.log("getSportSpecificRounds.data", $scope.roundsList);
        } else {
          toastr.error("Error");
        }
      });
    }
    $scope.getSportSpecificRounds();
    // GET ROUNDS AND MATCHES
    // CREATE MATCHES
    $scope.createMatches = function(){
      console.log('createMatches', $scope.matchForm);
      // NavigationService.createMatch($scope.matchForm, function(data){
      //   if (data.value == true) {
      //     console.log("createMatch.data",data.data);
      //   } else {
      //     toastr.error("Match create failed.","Error");
      //   }
      // });
    }
    // CREATE MATCHES END
    // ADD MATCH PLAYERS
    $scope.getPlayersMatchSelection = function(){
      console.log("getPlayersMatchSelection", $scope.sportDetails);
      // NavigationService.getPlayersMatchSelection($scope.sportDetails, function(data){
      //   if (data.value == true) {
      //     console.log("getPlayersMatchSelection.data", data.data);
      //   } else {
      //     toastr.error("Players not found","Error");
      //   }
      // });
    }
    // ADD MATCH PLAYERS END
    // PLAYER SELECTION POPUP
    $scope.matchEdit = function(currentMatch, flag){
      $scope.flag = flag;
      $scope.currentMatch = currentMatch;
      console.log("current", $scope.currentMatch);
      $uibModal.open({
        animation: true,
        scope: $scope,
        // backdrop: 'static',
        // keyboard: false,
        templateUrl: 'views/modal/creatematch-selectplayers.html',
        size: 'lg',
        windowClass: 'creatematch-selectplayers'
      })
    };
    // PLAYER SELECTION POPUP END
    // FUNCTIONS END

    // APIS
    // APIS END

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
