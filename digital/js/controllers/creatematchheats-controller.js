myApp.controller('CreateMatchHeatsCtrl', function($scope, TemplateService, NavigationService, $timeout, $uibModal, $stateParams, $state, $interval, toastr, knockoutService, $rootScope) {
    $scope.template = TemplateService.getHTML("content/creatematch-heats.html");
    TemplateService.title = "Score Combat"; //This is the Title of the Website
    $scope.navigation = NavigationService.getNavigation();
    // CODE STARTS HERE
    // INITIALISE VARIABLES
    $scope.selectDisable = false;
    // $scope.sportDetails = {
    //   sport: $stateParams.sport
    // }
    $scope.sportDetails = {
      sport: '5955e816accee91486acf6a0'
      // sport: '59563d8b97cd023787820d68'
    }
    $scope.objId = {
      _id: $scope.sportDetails.sport
    }
    $scope.matchForm = {
      sport: $scope.sportDetails.sport,
      prefix: '',
      round: "",
      sportType: ""
    }
    $scope.listRound = [{
      type: 'Heat'
    },{
      type: 'Time Trial'
    },{
       type: 'Height'
    },{
      type: 'Qualifying Round'
    },{
      type: 'Quarter Final'
    },{
      type: 'Semi Final'
    },{
      type: 'Final'
    },{
      type: 'Pre Quarter Final'
    }]
    // INITIALISE VARIABLES END
    // FUNCTIONS
    // GET ROUNDS AND MATCHES
    $scope.getSportSpecificRounds = function(){
      // console.log("getSportSpecificRounds", $scope.sportDetails);
      NavigationService.getSportSpecificRoundsMatch($scope.sportDetails, function(data){
        if (data.value == true) {
          $scope.roundsList = data.data.roundsList;
          $scope.roundsListName = data.data.roundsListName;
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
      if ($scope.matchForm.round != '') {
        if ($scope.matchForm.sportType != '') {
          NavigationService.createMatch($scope.matchForm, function(data){
            if (data.value == true) {
              console.log("createMatch.data",data.data);
              $scope.getSportSpecificRounds();
              $rootScope.modalInstance.close('a');
              $scope.matchForm.round = '';
            } else {
              toastr.error("Match create failed.","Error");
            }
          });
        } else {
          toastr.error("Please Select Sport Type", "Error");
        }
      } else {
        toastr.error("Please Select Round Type","Error");
      }

    }
    // CREATE MATCHES END
    // ADD MATCH PLAYERS
    $scope.getPlayersMatchSelection = function(){
      console.log("getPlayersMatchSelection", $scope.sportDetails);
      NavigationService.getPlayersMatchSelection($scope.sportDetails, function(data){
        if (data.value == true) {
          $scope.playerList = data.data;
          _.each($scope.playerList, function(n){
            n.select = false;
            n.laneNo = "";
          });
          $scope.checkSelected();
          console.log("getPlayersMatchSelection.data", $scope.playerList);
        } else {
          toastr.error("Players not found","Error");
        }
      });
    }
    // ADD MATCH PLAYERS END
    $scope.addQualifyingRoundPlayers = function(){
      $scope.sportDetails.roundsListName = $scope.roundsListName;
      NavigationService.addQualifyingRoundPlayers($scope.sportDetails, function(data){
        if (data.value == true) {
          $scope.qualifyingList = data.data;
          _.each($scope.qualifyingList, function(n){
            n.select = false;
            n.noOfJumps = 0;
            _.each(n.attempt, function(m){
              if (!_.isEmpty(m)) {
                n.noOfJumps += 1;
              }
            });
          });
          $scope.checkSelectedQf();
          console.log("getPlayersMatchSelection.data", $scope.qualifyingList);
        } else {
          toastr.error("Players not found","Error");
        }
      });
    }
    // PLAYER SELECTION POPUP HEATS
    $scope.matchEdit = function(currentMatch, flag){
      $scope.flag = flag;
      if ($scope.flag == 'view') {
        // $scope.match.open = true;
      }
      $scope.currentMatch = currentMatch;
      console.log("current", $scope.currentMatch);
      $rootScope.modalInstance = $uibModal.open({
        animation: true,
        scope: $scope,
        // backdrop: 'static',
        // keyboard: false,
        templateUrl: 'views/modal/creatematch-selectplayers.html',
        size: 'lg',
        windowClass: 'creatematch-selectplayers'
      })
      $scope.getPlayersMatchSelection();
    };
    // PLAYER SELECTION POPUP HEATS END

    // PLAYER SELECTION POPUP QUALIFYING
    $scope.matchEditQf = function(currentMatch, flag){
      $scope.flag = flag;
      if ($scope.flag == 'view') {
        // $scope.match.open = true;
      }
      $scope.currentMatch = currentMatch;
      console.log("current", $scope.currentMatch);
      $rootScope.modalInstance = $uibModal.open({
        animation: true,
        scope: $scope,
        // backdrop: 'static',
        // keyboard: false,
        templateUrl: 'views/modal/creatematchqf-selectplayers.html',
        size: 'lg',
        windowClass: 'creatematchqf-selectplayers'
      })
      $scope.addQualifyingRoundPlayers();
    };
    // PLAYER SELECTION POPUP QUALIFYING END
    // checkSelected
    $scope.checkSelected = function(player){
      $scope.checkCount = 0;
      _.each($scope.playerList, function(n){
        if (n.select == true) {
          $scope.checkCount = $scope.checkCount + 1;
        }
      });
      // console.log($scope.checkCount);
      // FOR LIMITING NO OF PLAYERS
      // if ($scope.checkCount > 2) {
      //   toastr.warning("Maximum Players selected");
      //   $scope.selectDisable = true;
      //   player.select = false;
      // } else if($scope.checkCount <= 2){
      //   $scope.selectDisable = false;
      // }
      // FOR LIMITING NO OF PLAYERS END
    }
    // checkSelected END

    // checkSelectedQf
    $scope.checkSelectedQf = function(player){
      $scope.checkCount = 0;
      _.each($scope.qualifyingList, function(n){
        if (n.select == true) {
          $scope.checkCount = $scope.checkCount + 1;
        }
      });
      console.log($scope.checkCount);
      // FOR LIMITING NO OF PLAYERS/
      if ($scope.checkCount > 1) {
        toastr.warning("Maximum Players selected");
        $scope.selectDisable = true;
        player.select = false;
      } else if($scope.checkCount <= 1){
        $scope.selectDisable = false;
      }
      // FOR LIMITING NO OF PLAYERS END
    }
    // checkSelectedQf END
    // ADD PLAYERS
    $scope.addPlayersToMatch = function(match){
      // console.log(match);
      $scope.matchSave = {
        sport: $scope.sportDetails.sport,
        matchId: match.matchId,
        players: [],
      };
      if($scope.isTeam){
        _.each($scope.playerList, function(n, nkey){
          if (n.select == true) {
            $scope.matchSave.players.push({
              team: n.team,
              laneNo: n.laneNo
            })
          }
        });
      } else {
        _.each($scope.playerList, function(n, nkey){
          if (n.select == true) {
            $scope.matchSave.players.push({
              opponentSingle: n.opponentSingle,
              laneNo: n.laneNo
            })
          }
        });
      }
      console.log("matchSave", $scope.matchSave);
      NavigationService.addPlayersToMatch ($scope.matchSave, function(data){
        if (data.value == true) {
          toastr.success("Athletes added to match successfully.");
          $scope.getPlayersMatchSelection();
          $rootScope.modalInstance.close('a');
          console.log("true");
        } else {
          console.log("false");
        }
      });
    }
    // ADD PLAYERS END
    // ADD PLAYERS QUALIFYING
    $scope.addPlayersQualifying = function(match){
      $scope.matchForm.sport= $scope.sportDetails.sport;
      $scope.matchForm.matchId= match.matchId;
      $scope.matchForm.players= [];
      $scope.matchForm.round = match.round;
      _.each($scope.qualifyingList, function(n, nkey){
        if (n.select == true) {
          $scope.matchForm.players.push({
            opponentSingle: n.opponentSingle
          })
        }
      });
      $scope.createMatches();
    }
    // ADD PLAYERS QUALIFYING END
    // REMOVE PLAYER
    $scope.deletePlayerMatch = function(player, match){
      $scope.removeMatch = {
        matchId: match.matchId,
        isTeam: $scope.isTeam
      }
      if ($scope.isTeam) {
        $scope.removeMatch.team = player;
      } else {
        $scope.removeMatch.opponentSingle = player;
      }
      console.log("removeMatch", $scope.removeMatch);
      NavigationService.deletePlayerMatch($scope.removeMatch, function(data){
        if (data.value == true) {
          $scope.currentMatch = data.data;
          $scope.getSportSpecificRounds();
          $scope.getPlayersMatchSelection();
          console.log("deletePlayerMatch",data.data);
        } else{
          toastr.error("Error while removing player.", "Error");
        }
      });
    }
    // REMOVE PLAYER  END
    // FUNCTIONS END

    // APIS
    NavigationService.getOneSportDetail( $scope.objId, function(data){
      data = data.data;
      if (data.value == true) {
        $scope.sportdata = data.data;
        $scope.matchForm.prefix = $scope.sportdata.matchPrefix;
        $scope.matchForm.sportType = $scope.sportdata.sportslist.drawFormat.name;
        $scope.isTeam = $scope.sportdata.sportslist.sportsListSubCategory.isTeam;
        console.log("getonesport", $scope.sportdata);
      } else {
        toastr.error("Failed to get sport details.", "Error");
      }
    });
    // APIS END

    // JSONS
    $scope.roundsist = [{
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
