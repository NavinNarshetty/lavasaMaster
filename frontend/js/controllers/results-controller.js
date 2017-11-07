myApp.controller('ResultsCtrl', function ($scope, TemplateService, $state, NavigationService, $stateParams, toastr, $rootScope, $uibModal, $timeout, knockoutService) {
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
          // <td colspan="3"> <div> </div> </td>
          detailTable = detailTable  + '<tr>   <td class="dd-sportname">'+ n.name+' </td> <td > <div class="detail-resultholder"> ' + n.goldMedal + ' </div> </td> <td > <div class="detail-resultholder">' + n.silverMedal + ' </div> </td> <td > <div class="detail-resultholder">' + n.bronzeMedal + ' </div> </td> <td > <div class="detail-resultholder">' + n.totalPoints + ' </div> </td> </tr>';
        });
        $scope.rankDetail = detail;
         demo = '<tr id="rankDetail' + index +'"> <td class = "pad-clear" colspan = "6"> <div class="schoolrank-details"> <table class = "table"> '+ detailTable +'</table> </div> </td> </tr>'
        detail.rowDetail = true;
        $(id).after(demo);
      }
    };

    // VIEW MORE / LESS FUNCTIONS
    // SCHOOL RANKING TABLE
    $scope.viewMoreRanking = function(bool){
      if (bool) {
        $scope.rankTable.showTable = false;
        $scope.rankTable.tableLimit = $scope.rankTable.length;
      } else {
        $scope.rankTable.showTable = true;
        $scope.rankTable.tableLimit = 20;
        TemplateService.scrollTo('schoolRankTable', 'id');
      }
    }
    // SCHOOL RANKING TABLE END
    // VIEW MORE / LESS FUNCTIONS END
    // FUNCTIONS END

    // APIS
    // GENERATE RANKING TABLE
    // $scope.generateTable = function(){
    //   NavigationService.getSchoolRank(function(data){
    //     if (data.data = true) {
    //       console.log("table GENERATED");
    //     }
    //   });
    // };
    // GENERATE RANKING TABLE END
    // GET RANKING TABLE
    NavigationService.getSchoolByRanks(function(data){
      console.log('rankingTable',data);
      if (data.value == true) {
        $scope.rankTable = data.data;
        $scope.rankTable.tableLimit = 20;
        $scope.rankTable.showTable = true;
        _.each($scope.rankTable, function(n){
          n.rowDetail = false;
        });
      } else {
        toastr.error('Ranking Table Error','Error');
      }
    })
    // GET RANKING TABLE END

    // APIS END

    // JSONS
    $scope.eventList = ['sfa mumbai 2015-16', 'sfa ahmedabad 2015-16', 'sfa hyderabad 2015-16'];
    // SCHOOL RANKING TABLE
    $scope.sportTable = [{
      rank: 1,
      name: 'jamnabai high school jamnabai high school',
      medals: {
        gold: {
          points: 20
        },
        silver: {
          points: 20
        },
        bronze: {
          points: 20
        }
      },
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
      name: 'jamnabai high school',
      medals: {
        gold: {
          points: 20
        },
        silver: {
          points: 20
        },
        bronze: {
          points: 20
        }
      },
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
      name: 'jamnabai high school',
      medals: {
        gold: {
          points: 20
        },
        silver: {
          points: 20
        },
        bronze: {
          points: 20
        }
      },
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
      name: 'jamnabai high school',
      medals: {
        gold: {
          points: 20
        },
        silver: {
          points: 20
        },
        bronze: {
          points: 20
        }
      },
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
      name: 'jamnabai high school',
      medals: {
        gold: {
          points: 20
        },
        silver: {
          points: 20
        },
        bronze: {
          points: 20
        }
      },
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
