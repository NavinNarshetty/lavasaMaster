myApp.controller('ResultsCtrl', function ($scope, TemplateService, $state, NavigationService, $stateParams, toastr, $rootScope, $uibModal) {
    $scope.template = TemplateService.getHTML("content/results.html");
    TemplateService.title = "Direct Final"; //This is the Title of the Website
    $scope.navigation = NavigationService.getNavigation();

    // VARIABLE INITITALISE
    $scope.showEventFilter = false;
    $scope.defaultEvent = "sfa mumbai 2015-16";
    $scope.showAllMedalWinner = false;
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
    // VIEW MEDAL WINNER
    $scope.showMedalWinner = function(){
      if ($scope.showAllMedalWinner == true) {
        $scope.showAllMedalWinner = false;
      } else {
        $scope.showAllMedalWinner = true;
      }
    }
    // VIEW MEDAL WINNER END
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

    // ALL MEDAL WINNERS
    $scope.medalWinners = [{
      sport: "Athletics",
      eventName: "50m",
      age: "U-6",
      winners:[
        {
          gender: "male",
          list: [{
            name: "Anwar Hatela",
            school: "jamnabai high school",
            medal: 'gold'
          },{
            name: "Dawood Ibrahim",
            school: "jamnabai high school",
            medal: 'silver'
          },{
            name: "Chota Shakeel",
            school: "jamnabai high school",
            medal: 'bronze'
          }]
        },{
          gender: "female",
          list: [{
            name: "Anwar Hatela",
            school: "jamnabai high school",
            medal: 'gold'
          },{
            name: "Dawood Ibrahim",
            school: "jamnabai high school",
            medal: 'silver'
          },{
            name: "Chota Shakeel",
            school: "jamnabai high school",
            medal: 'bronze'
          }]
        }
      ]
    },{
      sport: "Athletics",
      eventName: "100m",
      age: "U-12",
      winners:[
        {
          gender: "male",
          list: [{
            name: "Anwar Hatela",
            school: "jamnabai high school",
            medal: 'gold'
          },{
            name: "Dawood Ibrahim",
            school: "jamnabai high school",
            medal: 'silver'
          },{
            name: "Chota Shakeel",
            school: "jamnabai high school",
            medal: 'bronze'
          }]
        },{
          gender: "female",
          list: [{
            name: "Anwar Hatela",
            school: "jamnabai high school",
            medal: 'gold'
          },{
            name: "Dawood Ibrahim",
            school: "jamnabai high school",
            medal: 'silver'
          },{
            name: "Chota Shakeel",
            school: "jamnabai high school",
            medal: 'bronze'
          }]
        }
      ]
    },{
      sport: "Athletics",
      eventName: "200m",
      age: "U-16",
      winners:[
        {
          gender: "male",
          list: [{
            name: "Anwar Hatela",
            school: "jamnabai high school",
            medal: 'gold'
          },{
            name: "Dawood Ibrahim",
            school: "jamnabai high school",
            medal: 'silver'
          },{
            name: "Chota Shakeel",
            school: "jamnabai high school",
            medal: 'bronze'
          }]
        },{
          gender: "female",
          list: [{
            name: "Anwar Hatela",
            school: "jamnabai high school",
            medal: 'gold'
          },{
            name: "Dawood Ibrahim",
            school: "jamnabai high school",
            medal: 'silver'
          },{
            name: "Chota Shakeel",
            school: "jamnabai high school",
            medal: 'bronze'
          }]
        }
      ]
    }];
    // ALL MEDAL WINNERS END
    // JSONS END

  //
})
