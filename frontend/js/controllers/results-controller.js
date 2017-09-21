myApp.controller('ResultsCtrl', function ($scope, TemplateService, $state, NavigationService, $stateParams, toastr, $rootScope, $uibModal) {
    $scope.template = TemplateService.getHTML("content/results.html");
    TemplateService.title = "Direct Final"; //This is the Title of the Website
    $scope.navigation = NavigationService.getNavigation();

    // VARIABLE INITITALISE
    $scope.showEventFilter = false;
    $scope.defaultEvent = "sfa mumbai 2015-16";
    // VARIABLE INITITALISE END

    // FUNCTIONS
    // SELECT CITY FILTER
    $scope.viewEvent = function(){
      if($scope.showEventFilter == false){
        $scope.showEventFilter = true;
      } else {
        $scope.showEventFilter = false;
      }
    }
    $scope.selectEvent = function(event){
      $scope.selectEvent = event;
      $scope.defaultEvent = event;
      $scope.viewEvent();
      console.log($scope.selectEvent, 'selected event');
    }
    // SELECT CITY FILTER END
    // FUNCTIONS END

    // JSONS
    $scope.eventList = ['sfa mumbai 2015-16', 'sfa ahmedabad 2015-16', 'sfa hyderabad 2015-16'];
    // SCHOOL RANKING TABLE
    $scope.rankTable = [{
      rank: 1,
      school: 'jamnabai high school jamnabai high school',
      goldPoints: 20,
      silverPoints: 20,
      bronzePoints: 20,
      totalPoints: 200
    },{
      rank: 2,
      school: 'jamnabai high school',
      goldPoints: 20,
      silverPoints: 20,
      bronzePoints: 20,
      totalPoints: 200
    },{
      rank: 3,
      school: 'jamnabai high school',
      goldPoints: 20,
      silverPoints: 20,
      bronzePoints: 20,
      totalPoints: 200
    },{
      rank: 4,
      school: 'jamnabai high school',
      goldPoints: 20,
      silverPoints: 20,
      bronzePoints: 20,
      totalPoints: 200
    },{
      rank: 5,
      school: 'jamnabai high school',
      goldPoints: 20,
      silverPoints: 20,
      bronzePoints: 20,
      totalPoints: 200
    }];
    // SCHOOL RANKING TABLE END
    // JSONS END

  //
})
