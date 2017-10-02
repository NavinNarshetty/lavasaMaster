myApp.controller('ResultsCtrl', function ($scope, TemplateService, $state, NavigationService, $stateParams, toastr, $rootScope, $uibModal, $timeout) {
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

    $scope.addMedalDetail = function(index, detail){
      console.log(detail, 'detail');
      console.log(index, 'indexS');
      var index = $(this).closest('tr').index();
      index = index + 2;
      if (detail.rowDetail == true) {
        document.getElementById("schoolRankTable").deleteRow(index);
        detail.rowDetail = false;
      } else{
        $timeout(function () {
          detail.rowDetail = true;
          console.log(index, 'index + 2');
          var rankTable = document.getElementById("schoolRankTable");
          var rowDetail = rankTable.insertRow(index);
          var cell = rowDetail.insertCell(0);
          cell.innerHTML = "NEW CELL1";
          console.log(rowDetail, 'rowDetail');
          console.log('cell', cell);
          console.log(rankTable,'table');
        }, 100);
      }
    };

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
      totalPoints: 200,
      details: [{
        name: 'Athletics',
        gold: 2,
        silver: 2,
        bronze: 2
      },{
        name: 'Archery ',
        gold: 2,
        silver: 2,
        bronze: 2
      },{
        name: 'Badminton',
        gold: 2,
        silver: 2,
        bronze: 2
      }]
    },{
      rank: 2,
      school: 'jamnabai high school',
      goldPoints: 20,
      silverPoints: 20,
      bronzePoints: 20,
      totalPoints: 200,
      details: [{
        name: 'Athletics',
        gold: 2,
        silver: 2,
        bronze: 2
      },{
        name: 'Archery ',
        gold: 2,
        silver: 2,
        bronze: 2
      },{
        name: 'Badminton',
        gold: 2,
        silver: 2,
        bronze: 2
      }]
    },{
      rank: 3,
      school: 'jamnabai high school',
      goldPoints: 20,
      silverPoints: 20,
      bronzePoints: 20,
      totalPoints: 200,
      details: [{
        name: 'Athletics',
        gold: 2,
        silver: 2,
        bronze: 2
      },{
        name: 'Archery ',
        gold: 2,
        silver: 2,
        bronze: 2
      },{
        name: 'Badminton',
        gold: 2,
        silver: 2,
        bronze: 2
      }]
    },{
      rank: 4,
      school: 'jamnabai high school',
      goldPoints: 20,
      silverPoints: 20,
      bronzePoints: 20,
      totalPoints: 200,
      details: [{
        name: 'Athletics',
        gold: 2,
        silver: 2,
        bronze: 2
      },{
        name: 'Archery ',
        gold: 2,
        silver: 2,
        bronze: 2
      },{
        name: 'Badminton',
        gold: 2,
        silver: 2,
        bronze: 2
      }]
    },{
      rank: 5,
      school: 'jamnabai high school',
      goldPoints: 20,
      silverPoints: 20,
      bronzePoints: 20,
      totalPoints: 200,
      details: [{
        name: 'Athletics',
        gold: 2,
        silver: 2,
        bronze: 2
      },{
        name: 'Archery ',
        gold: 2,
        silver: 2,
        bronze: 2
      },{
        name: 'Badminton',
        gold: 2,
        silver: 2,
        bronze: 2
      }]
    }];

    _.each($scope.rankTable, function(n){
      n.rowDetail = false;
    });
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
