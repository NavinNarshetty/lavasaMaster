myApp.controller('AddWeightCtrl', function($scope, TemplateService, NavigationService, $timeout, $uibModal, $stateParams, $state, $interval, toastr, knockoutService, $rootScope) {
    $scope.template = TemplateService.getHTML("content/addweight.html");
    TemplateService.title = "Add Weight"; //This is the Title of the Website
    $scope.navigation = NavigationService.getNavigation();
    // CODE STARTS HERE

    // VARIABLE INIT
    $scope.sportId = {
      sport: $stateParams.sport
    }
    // $scope.sportId = {
    //   sport: '5954d444db1eec2729986d18'
    //   // sport: '5a40db50d549e46d9126b5fc'
    // }
    $scope.objId = {
      _id: $scope.sportId.sport
    }
    $scope.search = {
      sfaId: ''
    };
    // VARIABLE INIT END

    // FUNCTIONS
    // SEARCH FUNCTION
    $scope.searchAthlete = function(){
      $scope.search.sfaId = $scope.search.sfaId.toUpperCase();
      console.log('Search', $scope.search.sfaId);
      $scope.scrollId = $scope.search.sfaId;
      knockoutService.scrollTo($scope.scrollId, 'id', 120);
    }
    // SEARCH FUNCTION END
    // getWeightsByEvent
    $scope.getWeightsByEvent = function(){
      NavigationService.getWeightsByEvent($scope.sportDetails, function(data){
        if (data.value = true) {
          $scope.weightList = data.data;
          console.log("getWeightsByEvent.data", $scope.weightList);
        } else {
          toastr.error("Weight List Failed", "Error");
        }
      });
    }
    // getWeightsByEvent END
    // FUNCTIONS END

    // API CALLS
    NavigationService.getOneSportDetail( $scope.objId, function(data){
      data = data.data;
      if (data.value == true) {
        $scope.sportdata = data.data;
        $scope.sportDetails = {
          gender: $scope.sportdata.gender,
          sportslist: $scope.sportdata.sportslist._id,
          ageGroup: $scope.sportdata.ageGroup._id
        }
        $scope.getWeightsByEvent();
        $scope.isTeam = $scope.sportdata.sportslist.sportsListSubCategory.isTeam;
        console.log("getonesport", $scope.sportdata);
      } else {
        toastr.error("Failed to get sport details.", "Error");
      }
    });
    // GET ATTENDANCE LIST
    $scope.getAthletesByEvent = function(){
      NavigationService.getAthletesByEvent($scope.sportId, function(data){
        console.log("getAthletesByEvent.data",data);
        if (data.value == true) {
          $scope.attendanceList = data.data;
          _.each($scope.attendanceList.athletes, function(n){
            n.oldSportId = $scope.attendanceList.oldSportId;
            n.weight = "";
          });
        } else {
          $scope.attendanceList = [];
          toastr.error("No Athletes Found","Error");
        }
      });
    }
    $scope.getAthletesByEvent();
    // GET ATTENDANCE LIST END
    // SAVE ATHLETE WEIGHT
    $scope.saveAthleteWeight = function(player){
      console.log("player", player);
      $scope.athleteSave = {
        sportslist: $scope.sportDetails.sportslist,
        gender: $scope.sportDetails.gender,
        ageGroup: $scope.sportDetails.ageGroup,
        individualSportId: player._id,
        oldSportId: player.oldSportId,
        weight: player.weight
      };
        console.log("saveAthlete", $scope.athleteSave);
        NavigationService.updateIndividualSport($scope.athleteSave , function(data){
          if (data.value == true) {
            $scope.getAthletesByEvent();
            toastr.success("Athlete weight successfully updated.");
            $rootScope.modalInstance.close('a');
          } else {
            toastr.error("Athlete weight update failed.","Error");
          }
        });
    };
    // SAVE ATHLETE WEIGHT END
    // SAVE ATHLETE POPUP
    $scope.saveAthletePopup = function(player){
      if (player.weight != '') {
        $scope.savePlayer = player;
        _.each($scope.weightList, function(n){
          console.log(n);
          if (n.weight != null) {
            if (n.weight._id == player.weight) {
              $scope.savePlayer.weightName = n.weight.name;
            }
          }
        });
        $rootScope.modalInstance = $uibModal.open({
          animation: true,
          scope: $scope,
          // backdrop: 'static',
          // keyboard: false,
          templateUrl: 'views/modal/confirm-weight.html',
          size: 'sm',
          windowClass: 'confirm-weight'
        });
      }else {
        toastr.error("Please select weight","Error");
      }
    };
    // SAVE ATHLETE POPUP END
    // API CALLS END

    // JSONS
    $scope.attendaneLists = [{
      sfaId: 'HA12345',
      athleteName: 'Chandrasheskhar Mulayam Azad Singh Rana',
      schoolName: 'Col. Chandrasheskhar Mulayam Azad Singh Rana',
      attendance:  false
    },{
      sfaId: 'HA12346',
      athleteName: 'Chandrasheskhar Mulayam Azad Singh Rana',
      schoolName: 'Col. Chandrasheskhar Mulayam Azad Singh Rana',
      attendance:  false
    },{
      sfaId: 'HA12347',
      athleteName: 'Chandrasheskhar Mulayam Azad Singh Rana',
      schoolName: 'Col. Chandrasheskhar Mulayam Azad Singh Rana',
      attendance:  false
    },{
      sfaId: 'HA12348',
      athleteName: 'Chandrasheskhar Mulayam Azad Singh Rana',
      schoolName: 'Col. Chandrasheskhar Mulayam Azad Singh Rana',
      attendance:  false
    },{
      sfaId: 'HA12349',
      athleteName: 'Chandrasheskhar Mulayam Azad Singh Rana',
      schoolName: 'Col. Chandrasheskhar Mulayam Azad Singh Rana',
      attendance:  false
    },{
      sfaId: 'HA12319',
      athleteName: 'Chandrasheskhar Mulayam Azad Singh Rana',
      schoolName: 'Col. Chandrasheskhar Mulayam Azad Singh Rana',
      attendance:  false
    },{
      sfaId: 'HA12329',
      athleteName: 'Chandrasheskhar Mulayam Azad Singh Rana',
      schoolName: 'Col. Chandrasheskhar Mulayam Azad Singh Rana',
      attendance:  false
    },{
      sfaId: 'HA12449',
      athleteName: 'Chandrasheskhar Mulayam Azad Singh Rana',
      schoolName: 'Col. Chandrasheskhar Mulayam Azad Singh Rana',
      attendance:  false
    },{
      sfaId: 'HA12849',
      athleteName: 'Chandrasheskhar Mulayam Azad Singh Rana',
      schoolName: 'Col. Chandrasheskhar Mulayam Azad Singh Rana',
      attendance:  false
    },{
      sfaId: 'HA14349',
      athleteName: 'Chandrasheskhar Mulayam Azad Singh Rana',
      schoolName: 'Col. Chandrasheskhar Mulayam Azad Singh Rana',
      attendance:  false
    },{
      sfaId: 'HA02349',
      athleteName: 'Chandrasheskhar Mulayam Azad Singh Rana',
      schoolName: 'Col. Chandrasheskhar Mulayam Azad Singh Rana',
      attendance:  false
    }];
    // JSONS END

    // CODE ENDS HERE
});
