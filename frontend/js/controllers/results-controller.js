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
    $scope.closeAllOpen = function(index, detail){
      _.each($scope.rankTable, function(n, nindex){
        if(n.rowDetail == true && nindex != index){
          $scope.addMedalDetail(nindex, n);
        }
      });
      $scope.addMedalDetail(index, detail);
    };

    $scope.addMedalDetail = function(index, detail){
      console.log(detail, 'detail');
      console.log(index, 'indexS');
      var id = "#rank" + index;
      var demo = "";
      if (detail.rowDetail == true) {
        detailId = "#rankDetail" + index;
        console.log(detailId, 'det');
        $(detailId).remove();
        detail.rowDetail = false;
        // $(id).after(demo);
      } else {
        var detailTable = "";
        _.each(detail.sportData, function(n){
          n.goldMedal = "-";
          n.silverMedal = "-";
          n.bronzeMedal = "-";
          if (n.medals) {
            if (n.medals.gold) {
              n.goldMedal = n.medals.gold.points;
            }
            if (n.medals.silver) {
              n.silverMedal = n.medals.silver.points;
            }
            if (n.medals.bronze) {
              n.bronzeMedal = n.medals.bronze.points;
            }
          }
          console.log('sport', n);
          detailTable = detailTable  + '<tr> <td colspan="3"> <div> </div> </td>   <td colspan="1" class="dd-sportname">'+ n.name+' </td> <td colspan="1"> ' + n.goldMedal + ' </td> <td colspan="1">' + n.silverMedal + ' </td> <td colspan="1">' + n.bronzeMedal + ' </td> <td colspan="1">' + n.totalPoints + ' </td> </tr>';
        });
        $scope.rankDetail = detail;
         demo = '<tr id="rankDetail' + index +'"> <td class = "pad-clear" colspan = "6"> <div class="schoolrank-details"> <table class = "table"> '+ detailTable +'</table> </div> </td> </tr>'
        detail.rowDetail = true;
        $(id).after(demo);
      }
    };

    // FUNCTIONS END

    // // SCROLLDOWN
    // .directive('scrolldown', function ($compile, $parse) {
    //     return {
    //         restrict: 'EA',
    //         replace: false,
    //         link: function ($scope, element, destination, type,  attrs) {
    //             var $element = $(element);
    //             if(type == 'id'){
    //               var destination = '#' + destination;
    //             } else if(type == 'class') {
    //               var destination = '.' + destination;
    //             }
    //             $scope.scrollDown = function () {
    //                 $('html,body').animate({
    //                         scrollTop: $(destination).offset().top
    //                     },
    //                     'slow');
    //             };
    //         }
    //     };
    // });
    // // SCROLLDOWN END

    // APIS
    NavigationService.getSchoolByRanks(function(data){
      console.log('rankingTable',data);
      if (data.value == true) {
        $scope.rankTable = data.data
        _.each($scope.rankTable, function(n){
          n.rowDetail = false;
        });
      } else {
        toastr.error('Ranking Table Error','Error');
      }
    })

    // APIS END

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
        bronze: 2,
        total: 2
      },{
        name: 'Archery ',
        gold: 2,
        silver: 2,
        bronze: 2,
        total: 2
      },{
        name: 'Badminton',
        gold: 2,
        silver: 2,
        bronze: 2,
        total: 2
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
        bronze: 2,
        total: 2
      },{
        name: 'Archery ',
        gold: 2,
        silver: 2,
        bronze: 2,
        total: 2
      },{
        name: 'Badminton',
        gold: 2,
        silver: 2,
        bronze: 2,
        total: 2
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
        bronze: 2,
        total: 2
      },{
        name: 'Archery ',
        gold: 2,
        silver: 2,
        bronze: 2,
        total: 2
      },{
        name: 'Badminton',
        gold: 2,
        silver: 2,
        bronze: 2,
        total: 2
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
        bronze: 2,
        total: 2
      },{
        name: 'Archery ',
        gold: 2,
        silver: 2,
        bronze: 2,
        total: 2
      },{
        name: 'Badminton',
        gold: 2,
        silver: 2,
        bronze: 2,
        total: 2
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
        bronze: 2,
        total: 2
      },{
        name: 'Archery ',
        gold: 2,
        silver: 2,
        bronze: 2,
        total: 2
      },{
        name: 'Badminton',
        gold: 2,
        silver: 2,
        bronze: 2,
        total: 2
      }]
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
