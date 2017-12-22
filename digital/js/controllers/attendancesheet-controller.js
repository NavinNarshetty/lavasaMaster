myApp.controller('AttendanceSheetCtrl', function($scope, TemplateService, NavigationService, $timeout, $uibModal, $stateParams, $state, $interval, toastr, knockoutService) {
    $scope.template = TemplateService.getHTML("content/attendancesheet.html");
    TemplateService.title = "Score Combat"; //This is the Title of the Website
    $scope.navigation = NavigationService.getNavigation();
    // CODE STARTS HERE

    // VARIABLE INIT
    // $scope.sportId = {
    //   sport: $stateParams.sport
    // }
    $scope.sportId = {
      sport: '5955eb87accee91486acf749'
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
    // FUNCTIONS END

    // API CALLS
    // GET ATTENDANCE LIST
    $scope.getAttendanceList = function(){
      NavigationService.getAthleteForAttendance($scope.sportId, function(data){
        console.log("get",data);
        if (data.value == true) {
          $scope.attendanceList = data.data;
        } else {
          toastr.error("No Data Found","Error");
        }
      });
    }
    $scope.getAttendanceList();
    // GET ATTENDANCE LIST END
    // SAVE ATTENDANCE
    $scope.saveAttendance = function(){
      console.log("$scope.attendanceList",$scope.attendanceList);
      $scope.attendanceList.sport = $scope.sportId.sport;
      NavigationService.saveAttendance($scope.attendanceList, function(data){
        console.log("save", data);
        if (data.value == true) {
          toastr.success("Save Successful");
          $scope.getAttendanceList();
        } else {
          toastr.error("Save Failed", "Save");
        }
      });
    }
    // SAVE ATTENDANCE END
    // API CALLS END

    // JSONS
    $scope.attendanceLists = [{
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
