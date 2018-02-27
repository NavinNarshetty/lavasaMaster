myApp.controller('CombatTeamCtrl', function($scope, TemplateService, NavigationService, $timeout, $uibModal, $stateParams, $state, $interval, toastr, $rootScope) {
    $scope.template = TemplateService.getHTML("content/scorecombat-team.html");
    TemplateService.title = "Score Combat"; //This is the Title of the Website
    $scope.navigation = NavigationService.getNavigation();
    // ************

    // INITIALISE VARIABLES
    $scope.match = {};
    $scope.stateParam = $stateParams;
    $scope.matchId=$stateParams.id;
    $scope.matchData = {};
    var promise;
    // INITIALISE VARIABLES END

    // CLEAVE FUNCTION OPTIONS
    $scope.options = {
      formation: {
            blocks: [1, 1, 1, 1],
            uppercase: true,
            delimiters: ['-']
        },
        score: {
          blocks: [2],
          numeral: true
        }
    }
    // CLEAVE FUNCTION OPTIONS END

    // FUNCTIONS
    // SELECT TEAM
    $scope.selectTeam = function(result){
      $scope.result = result;
      var teamSelection;
      $rootScope.modalInstance = $uibModal.open({
        animation: true,
        scope: $scope,
        backdrop: 'static',
        keyboard: false,
        size: 'lg',
        templateUrl: 'views/modal/teamselection-modal.html',
        windowClass: 'teamselection-modal'
      })
    }
    // SELECT TEAM END
    // SELECT PLAYING
    $scope.selectPlaying = function(team, player){
      console.log('isPlaying');
      $scope.isPlayer = player;
      $scope.playingTeam = team;
      var playingCount = 0;
      if($scope.isPlayer.isPlaying == false){
        _.each($scope.playingTeam.players,function(n){
          if(n.isPlaying == true){
            playingCount = playingCount + 1;
          }
        });
        if(playingCount <  $scope.match.minTeamPlayers){
          if($scope.isPlayer.isPlaying == true){
            $scope.isPlayer.isPlaying = false;
          } else{
            $scope.isPlayer.isPlaying = true;
          }
        } else {
          toastr.warning('Maximum players selected');
        }
      } else {
        if($scope.isPlayer.isPlaying == true){
          $scope.isPlayer.isPlaying = false;
        } else{
          $scope.isPlayer.isPlaying = true;
        }
      }
      console.log(playingCount, 'playingCount');
      console.log($scope.isPlayer, 'playa');
    }
    // SELECT PLAYING END
    // SAVE PLAYING TEAM
    $scope.savePlayingTeam = function(result){
      console.log(result,'result');
      var saveCounter = 0;
      _.each(result.teams, function(n, nKey){
        var countLength = 0;
        var tkey = 0;
        var tKey = nKey + 1;
        if(n.coach == ""){
          toastr.error("Please enter coach of Team " + tKey, "Enter Details");
        } else{
          _.each(n.players, function(m, mkey){
            if(m.isPlaying == true){
              countLength = countLength + 1;
            }
          });
          if(countLength < $scope.match.minTeamPlayers){
            toastr.error("Select minimum " +  $scope.match.minTeamPlayers + " players for Team " + tKey + " to start scoring.","Enter Details");
          }
          else {
            saveCounter = saveCounter + 1;
          }
        }
      });
      if(saveCounter == 2){
        $scope.matchResult = {
          resultsCombat : result,
          matchId: $scope.matchData.matchId
        }

        console.log($scope.matchResult, "matchResult");
        NavigationService.saveMatch($scope.matchResult, function(data){
          if(data.value == true){
            console.log('save success');
            $rootScope.modalInstance.close('a');
          } else{
            alert('fail save');
          }
        });
      }
    }
    // SAVE PLAYING TEAM END
    // SCORE INCREMENT
    $scope.incrementScore = function(set, model) {
        $scope.set = set;
        switch (model) {
            case 'point':
            if($scope.set.point == ""){
              $scope.set.point = 1;
            } else{
              $scope.set.point = $scope.set.point + 1;
            }
            break;
        }
        console.log("increment");
    };
    // SCORE INCREMENT END
    // SCORE DECREMENT
    $scope.decrementScore = function(set, model) {
        $scope.set = set;
        switch (model) {
            case 'point':
                if ($scope.set.point > 0) {
                    $scope.set.point = $scope.set.point - 1;
                }
                break;
        }
        console.log("decrement");
    };
    // SCORE DECREMENT END
    // REMOVE MATCH SCORESHEET
    $scope.removeMatchScore = function(pic, type) {
      switch (type) {
        case 'matchPhoto':
          _.remove($scope.match.resultsCombat.matchPhoto, function(n) {
              return n.image === pic.image;
          })
        break;
        case 'scoreSheet':
          _.remove($scope.match.resultsCombat.scoreSheet, function(n) {
            return n.image === pic.image;
          })
        break;
      }
    }
    // REMOVE MATCH SCORESHEET END
    // FUNCTIONS END

    // API CALLS
    // GET MATCH
    $scope.getOneMatch = function() {
        $scope.matchData.matchId = $stateParams.id;
        NavigationService.getOneMatch($scope.matchData, function(data) {
            if (data.value == true) {
              if(data.data.error){
                $scope.matchError = data.data.error;
                console.log($scope.matchError,'error');
                toastr.error('Invalid MatchID. Please check the MatchID entered.', 'Error');
              }
                $scope.match = data.data;
                $scope.match.matchId = $scope.matchData.matchId;
                console.log('in to');
                if($scope.match.resultsCombat.teams[0].coach == "" || $scope.match.resultsCombat.teams[1].coach == ""){
                  console.log('emp');
                  $scope.selectTeam($scope.match.resultsCombat);
                }
            } else {
                console.log("ERROR IN getOneMatch");
            }
        })
    };
    $scope.getOneMatch();
    // GET MATCH END
    // SAVE RESULT
    $scope.saveResult = function(formData){
      console.log(formData, 'yp');
      $scope.matchResult = {
        resultsCombat : formData.resultsCombat,
        matchId: $scope.matchData.matchId
      }
      NavigationService.saveMatch($scope.matchResult, function(data){
        if(data.value == true){
          console.log('save success');
        } else{
          alert('fail save');
        }
      });
    }
    // SAVE RESULT END
    // AUTO SAVE
    $scope.autoSave = function(){
      $scope.$on('$viewContentLoaded', function(event) {
        promise = $interval(function () {
          $scope.saveResult($scope.match);
        }, 10000);
      })
    }
    $scope.autoSave();
    // AUTO SAVE FUNCTION END
    // DESTROY AUTO SAVE
    // $scope.destroyAutoSave = function(){
      $scope.$on('$destroy', function(){
        console.log('destroy');
        $interval.cancel(promise);
      })
    // }
    // DESTROY AUTO SAVE END
    // AUTO SAVE END
    // MATCH COMPLETE
    // POPUP COMPLETE
    $scope.completePopup = function(){
      if($scope.match.resultsCombat.matchPhoto.length == 0){
        toastr.error('Please upload match photo.', 'Data Incomplete');
      } else if ($scope.match.resultsCombat.scoreSheet.length == 0) {
        toastr.error('Please upload scoresheet.', 'Data Incomplete');
      }else if(!$scope.match.resultsCombat.winner.player){
        toastr.error('Please select a winner.', 'Data Incomplete');
      }  else {
      var modalCompleteMatch;
        $rootScope.modalInstance = $uibModal.open({
          animation: true,
          scope: $scope,
          templateUrl: 'views/modal/confirmcomplete.html',
          windowClass: 'completematch-modal'
        })
      }
    };
    // POPUP COMPLETE END
    $scope.matchComplete = function(){
      if ($scope.match.resultsCombat) {
        $scope.match.resultsCombat.status = "IsCompleted";
          $scope.matchResult = {
            resultsCombat : $scope.match.resultsCombat,
            matchId: $scope.matchData.matchId
          }
          NavigationService.saveMatch($scope.matchResult, function(data){
            if(data.value == true){
              if ($stateParams.drawFormat === 'Knockout') {
                $state.go('knockout-team', {
                  drawFormat: $stateParams.drawFormat,
                  id: $stateParams.sport
                });
              } else if ($stateParams.drawFormat === 'League cum Knockout') {
                $state.go('league-knockoutTeam', {
                  drawFormat: $stateParams.drawFormat,
                  id: $stateParams.sport
                });
              }
              console.log('save success');
            } else{
              toastr.error('Data save failed. Please try again or check your internet connection.', 'Save Error');
            }
          });
          console.log($scope.matchResult, 'result#');
      } else {
        toastr.error('No data to save. Please check for valid MatchID.', 'Save Error');
      }
    }
    // MATCH COMPLETE END
    // API CALLS END

    // JSON
    $scope.smatch = {
      matchId: '123456',
      sportsName: 'Football',
      age: 'u-11',
      gender: 'female',
      round: 'final',
      minTeamPlayers: 4,
      resultsCombat:{
        teams:[{
          teamId: '987654',
          teamResults:{
            sets:[{
              point: 0,
            }]
          },
          players: [{
            name: 'hello',
            isPlaying: true,
            jerseyNo: 1,
          },{
            name: 'hello',
            isPlaying: true,
            jerseyNo: 1,
          },{
            name: 'hello',
            isPlaying: false,
            jerseyNo: 1,
          },{
            name: 'hello',
            isPlaying: true,
            jerseyNo: 1,
          },{
            name: 'hello',
            isPlaying: false,
            jerseyNo: 1,
          }]
        },{
          teamId: '54321',
          teamResults:{
            sets:[{
              point: 0,
            }]
          },
          players: [{
            name: 'hello',
            isPlaying: false,
            jerseyNo: 1,
          },{
            name: 'hello',
            isPlaying: true,
            jerseyNo: 1,
          },{
            name: 'hello',
            isPlaying: false,
            jerseyNo: 1,
          },{
            name: 'hello',
            isPlaying: false,
            jerseyNo: 1,
          },{
            name: 'hello',
            isPlaying: true,
            jerseyNo: 1,
          }]
        }]
      },
      teams: [
        {
        schoolName: 'jamnabai narsee school',
        teamId: '987654',
        players: [{
          firstName: 'Jaiviraj singh rajputrajput singh'
        },{
          firstName: 'hello2'
        },{
          firstName: 'hello3'
        },{
          firstName: 'hello4'
        },{
          firstName: 'hello5'
        }]
        },
        {
        schoolName: 'Marvel iron high school',
        teamId: '54321',
        players: [{
          firstName: 'hello6'
        },{
          firstName: 'hello7'
        },{
          firstName: 'hello8'
        },{
          firstName: 'hello9'
        },{
          firstName: 'hello10'
        }]
        }
      ]
    }
    // JSON END

    // ************
})
