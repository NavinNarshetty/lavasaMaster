myApp.controller('CreateMatchWeightCtrl', function($scope, TemplateService, NavigationService, $timeout, $uibModal, $stateParams, $state, $interval, toastr, knockoutService, $rootScope, $filter) {
    $scope.template = TemplateService.getHTML("content/creatematch-weight.html");
    TemplateService.title = "Create Match Weights"; //This is the Title of the Website
    $scope.navigation = NavigationService.getNavigation();
    // CODE STARTS HERE
    // INITIALISE VARIABLES
    $scope.selectDisable = false;
    $scope.sportDetails = {
      sport: $stateParams.sport
    }
    // $scope.sportDetails = {
    //   sport: '5955e816accee91486acf6a0'
    //   sport: '59563d8b97cd023787820d68'
    // }
    // MATCH FORM
    $scope.matchForm = {
      sport: $scope.sportDetails.sport,
      range: 0,
      prefix:"",
      rounds:"",
      thirdPlace: false
    }
    // MATCH FORM END
    // RANGE LIST
    $scope.rangeList = [0, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024];
    // RANGE LIST END

    // INITIALISE VARIABLES END
    // FUNCTIONS
    // CALCULATE ROUND NUMBER
    $scope.calcRoundNo = function(range){
      $scope.noRound = 0;
      if (range == 0) {
        $scope.noRound = 1;
      } else {
        while(range >= 1){
          range = range/2;
          $scope.noRound++;
          // console.log($scope.noRound, range);
        }
      }
      console.log($scope.noRound, $scope.matchForm.range);
    }
    $scope.calcRoundNo($scope.matchForm.range);
    // CALCULATE ROUND NUMBER END
    // GENERATE MATCHES
    $scope.generateMatches = function(){
      if ($scope.matchForm.range != '') {
        if ($scope.matchForm.prefix != '') {
          if ($scope.matchForm.rounds != '') {
            $scope.matchForm.prefix = $filter('capitalize')($scope.matchForm.prefix);
            $scope.matchForm.rounds = $filter('firstcapitalize')($scope.matchForm.rounds,{column1:true});
            console.log("Match", $scope.matchForm);
            // API CALL
            NavigationService.generateWeightMatches($scope.matchForm, function(data){
              if (data.value == true) {
                console.log("match created");
              } else {
                toaster.error("Error");
              }
            });
            // API CALL END
          } else {
            toastr.error("Please enter comma separated round names", "Error");
          }
        } else {
          toastr.error("Please enter prefix", "Error");
        }
      } else {
        toastr.error("Please select range", "Error");
      }
    }
    // GENERATE MATCHES END
    // FUNCTIONS END

    // APIS
    NavigationService.getOneSportDetail( $scope.objId, function(data){
      data = data.data;
      if (data.value == true) {
        $scope.sportdata = data.data;
        console.log("getonesport", $scope.sportdata);
      } else {
        toastr.error("Failed to get sport details.", "Error");
      }
    });
    // APIS END

    // JSONS
    // JSONS END

    // CODE ENDS HERE
});
