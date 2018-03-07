myApp.controller('ResultsCtrl', function ($scope, TemplateService, $state, NavigationService, $stateParams, toastr, $rootScope, $uibModal, $timeout, knockoutService, configService, $stateParams) {
  $scope.template = TemplateService.getHTML("content/results.html");
  TemplateService.title = "Results"; //This is the Title of the Website
  $scope.navigation = NavigationService.getNavigation();

  // FILTER OPTIONS
  $scope.getFilterOptions = function (n) {
    if (n.type == 'school') {
      if (n.sfaCity == 'Mumbai') {
        $scope.filterOptions = [{
          name: 'Archery'
        }, {
          name: 'Athletics'
        }, {
          name: 'Badminton'
        }, {
          name: 'Basketball'
        }, {
          name: 'Boxing'
        }, {
          name: 'Carrom'
        }, {
          name: 'Chess'
        }, {
          name: 'Fencing'
        }, {
          name: 'Football'
        }, {
          name: 'Handball'
        }, {
          name: 'Hockey'
        }, {
          name: 'Judo'
        }, {
          name: 'Kabaddi'
        }, {
          name: 'Karate'
        }, {
          name: 'Kho Kho'
        }, {
          name: 'Sport MMA'
        }, {
          name: 'Shooting'
        }, {
          name: 'Squash'
        }, {
          name: 'Swimming'
        }, {
          name: 'Table Tennis'
        }, {
          name: 'Taekwondo'
        }, {
          name: 'Tennis'
        }, {
          name: 'Throwball'
        }, {
          name: 'Volleyball'
        }, {
          name: 'Water Polo'
        }, {
          name: 'Wrestling'
        }];
      } else {
        $scope.filterOptions = [{
          name: 'Archery'
        }, {
          name: 'Athletics'
        }, {
          name: 'Badminton'
        }, {
          name: 'Basketball'
        }, {
          name: 'Boxing'
        }, {
          name: 'Carrom'
        }, {
          name: 'Chess'
        }, {
          name: 'Fencing'
        }, {
          name: 'Football'
        }, {
          name: 'Handball'
        }, {
          name: 'Hockey'
        }, {
          name: 'Judo'
        }, {
          name: 'Kabaddi'
        }, {
          name: 'Karate'
        }, {
          name: 'Kho Kho'
        }, {
          name: 'Shooting'
        }, {
          name: 'Swimming'
        }, {
          name: 'Table Tennis'
        }, {
          name: 'Taekwondo'
        }, {
          name: 'Tennis'
        }, {
          name: 'Throwball'
        }, {
          name: 'Volleyball'
        }, {
          name: 'Water Polo'
        }];
      }
    } else {
      $scope.filterOptions = [{
        name: 'Archery'
      }, {
        name: 'Athletics'
      }, {
        name: 'Basketball'
      }, {
        name: 'Boxing'
      }, {
        name: 'Carrom'
      }, {
        name: 'Chess'
      }, {
        name: 'Fencing'
      }, {
        name: 'Handball'
      }, {
        name: 'Hockey'
      }, {
        name: 'Judo'
      }, {
        name: 'Kabaddi'
      }, {
        name: 'Shooting'
      }, {
        name: 'Swimming'
      }, {
        name: 'Taekwondo'
      }, {
        name: 'Tennis'
      }, {
        name: 'Volleyball'
      }, {
        name: 'Water Polo'
      }, {
        name: 'Wrestling'
      }];
    }
  };
  // FILTER OPTIONS END
  // CONFIG SET
  configService.getDetail(function (data) {
    $scope.state = data.state;
    $scope.year = data.year;
    $scope.eventYear = data.eventYear;
    $scope.sfaCity = data.sfaCity;
    $scope.isCollege = data.isCollege;
    $scope.type = data.type;
    $scope.getFilterOptions(data);
  });
  // CONFIG SET END
  // VARIABLE INITITALISE
  $scope.showEventFilter = false;
  $scope.defaultEvent = "sfa mumbai 2015-16";
  $scope.showAllMedalWinner = false;
  if ($stateParams.name) {
    $scope.sportFilter = {
      name: $stateParams.name
    };
    $scope.sportName = "$stateParams.name";

  } else {
    $scope.sportFilter = {
      name: "Archery"
    };
    $scope.sportName = "Archery";
  }

  // MEDAL FILTER OPTIONS
  $scope.medalFilter = {
    name: $scope.sportFilter.name,
  }
  $scope.filter = {
    year: "2017"
  }
  // MEDAL FILTER OPTIONS END
  // VARIABLE INITITALISE END

  // FUNCTIONS
  $scope.log = function () {
    // console.log($scope.sportFilter, 'filter');
  };
  // SELECT YEAR FILTER
  $scope.loadResult = function (year) {
    if (year == '2015' || year == '2016') {
      window.open("https://mumbai.sfanow.in/school-ranking", '_self');
    }
  }
  // SELECT YEAR FILTER END
  // VIEW MEDAL WINNER
  $scope.showMedalWinner = function () {
    if ($scope.showAllMedalWinner == true) {
      $scope.showAllMedalWinner = false;
      $scope.medalFilter = {
        name: $scope.sportFilter.name
      }
    } else {
      $scope.showAllMedalWinner = true;
      $scope.getMedalFilter();
      $scope.getMedalWinners();
    }
  }
  // VIEW MEDAL WINNER END
  $scope.closeAllOpen = function (index, detail) {
    _.each($scope.rankTable, function (n, nindex) {
      if (n.rowDetail == true && nindex != index) {
        $scope.addMedalDetail(nindex, n);
      }
    });
    $scope.addMedalDetail(index, detail);
  };

  $scope.addMedalDetail = function (index, detail) {
    // console.log(detail, 'detail');
    // console.log(index, 'indexS');
    var id = "#rank" + index;
    var demo = "";
    // GET WIDTH OF DIVS
    var widthGold = $(id+"gold").outerWidth();
    var widthSilver = $(id+"silver").outerWidth();
    var widthBronze = $(id+"bronze").outerWidth();
    var widthTotal = $(id+"total").outerWidth();
    console.log("Width",widthGold,widthSilver,widthBronze,widthTotal);
    // GET WIDTH OF DIVS END
    if (detail.rowDetail == true) {
      detailId = "#rankDetail" + index;
      // console.log(detailId, 'det');
      $(detailId).remove();
      detail.rowDetail = false;
      // $(id).after(demo);
    } else {
      var detailTable = "";
      _.each(detail.sportData, function (n) {
        n.goldMedal = 0;
        n.silverMedal = 0;
        n.bronzeMedal = 0;
        if (n.medals) {
          if (n.medals.gold) {
            n.goldMedal = n.medals.gold.count;
          }
          if (n.medals.silver) {
            n.silverMedal = n.medals.silver.count;
          }
          if (n.medals.bronze) {
            n.bronzeMedal = n.medals.bronze.count;
          }
        }
        // console.log('sport', n);
        // <td colspan="3"> <div> </div> </td>
        detailTable = detailTable + '<tr><td class="dd-sportname " colspan="2">' + n.name + ' </td> <td colspan="1" style="width:'+ widthGold +'px"> <div class="detail-resultholder"> ' + n.goldMedal + ' </div> </td> <td colspan="1" style="width:'+ widthSilver +'px"> <div class="detail-resultholder">' + n.silverMedal + ' </div> </td> <td colspan="1" style="width:'+ widthBronze + 'px"> <div class="detail-resultholder">' + n.bronzeMedal + ' </div> </td> <td colspan="1" style="width: '+ widthTotal +'px"> <div class="detail-resultholder">' + n.totalPoints + ' </div> </td> </tr>';
      });
      $scope.rankDetail = detail;
      demo = '<tr id="rankDetail' + index + '"> <td class = "pad-clear" colspan = "6"> <div class="schoolrank-details"> <table class = "table"> ' + detailTable + '</table> </div> </td> </tr>'
      detail.rowDetail = true;
      $(id).after(demo);
    }
  };

  // VIEW MORE / LESS FUNCTIONS
  // SCHOOL RANKING TABLE
  $scope.viewMoreRanking = function (bool) {
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
  // SPORT RANKING TABLE
  $scope.viewMoreSport = function (bool) {
    if (bool) {
      $scope.sportTable.showTable = false;
      $scope.sportTable.tableLimit = $scope.sportTable.length;
    } else {
      $scope.sportTable.showTable = true;
      $scope.sportTable.tableLimit = 5;
      TemplateService.scrollTo('sportRankingTable', 'id');
    }
  }
  // SPORT RANKING TABLE END
  // VIEW MORE / LESS FUNCTIONS END
  // CLEAR FILTER
  $scope.clearMedalFilter = function () {
    $scope.medalFilter = {
      name: $scope.sportFilter.name
    }
    $scope.getMedalWinners();
    // console.log($scope.medalFilter, 'clear');
  }
  // CLEAR FILTER END
  // TEAM PROFILE REDIRECT
  $scope.medalSchoolRedirect = function (player) {
    if (player.schoolId) {
      $state.go('team-detail', {
        id: player.team
      })
    } else {
      // console.log("noid");
    }
  }
  // TEAM PROFILE REDIRECT END
  // FUNCTIONS END

  // APIS
  $scope.getSchoolByRanks = function () {
    NavigationService.getSchoolByRanks(function (data) {
      // console.log('rankingTable', data);
      if (data.value == true) {
        $scope.rankTable = data.data;
        $scope.rankTable.tableLimit = 20;
        $scope.rankTable.showTable = true;
        _.each($scope.rankTable, function (n, nkey) {
          n.sportData = _.sortBy(n.sportData, 'name');
          n.rowDetail = false;
          n.goldCount = 0;
          n.silverCount = 0;
          n.bronzeCount = 0;
          if (n.medal) {
            if (n.medal.gold) {
              n.goldCount = n.medal.gold.count;
            }
            if (n.medal.silver) {
              n.silverCount = n.medal.silver.count;
            }
            if (n.medal.bronze) {
              n.bronzeCount = n.medal.bronze.count;
            }
          }
          if (!n.totalPoints) {
            n.totalPoints = 0;
          }
        });
      } else {
        toastr.error('Ranking Table Error', 'Error');
      }
    });
  }
  $scope.getSchoolByRanks();

  // GET RANKING TABLE END
  // GET MEDAL FILTER
  $scope.getMedalFilter = function () {
    NavigationService.getAgeGroupsAndEvents($scope.sportFilter, function (data) {
      // console.log('getAgeGroupsAndEvents',data);
      if (data.value = true) {
        var data = data.data;
        $scope.medalFilterList = {
          ageGroups: data.ageGroups,
          events: data.events,
          gender: data.gender
        }
        // console.log('medalFilterList',$scope.medalFilterList);
      } else {
        // console.log("getAgeGroupsAndEvents Failed", data);
      }
    });
  }
  // GET MEDAL FILTER END
  // GET MEDAL WINNER
  $scope.getMedalWinners = function () {
    $scope.medalFilter.name = $scope.sportFilter.name;
    NavigationService.getMedalWinners($scope.medalFilter, function (data) {
      // console.log('getMedalWinners',data);
      if (data.value == true) {
        $scope.medalWinners = data.data;
        _.each($scope.medalWinners, function (n) {
          if (n.male) {
            _.each(n.male, function (m) {
              _.each(m.medals, function (o) {
                if (o.medal === 'gold') {
                  o.medalOrder = 1;
                } else if (o.medal === 'silver') {
                  o.medalOrder = 2;
                } else if (o.medal === 'bronze') {
                  o.medalOrder = 3;
                }
              });
            })
          }
          if (n.female) {
            _.each(n.female, function (m) {
              _.each(m.medals, function (o) {
                if (o.medal === 'gold') {
                  o.medalOrder = 1;
                } else if (o.medal === 'silver') {
                  o.medalOrder = 2;
                } else if (o.medal === 'bronze') {
                  o.medalOrder = 3;
                }
              });
            })
          }
        })
        if (_.isEmpty($scope.medalWinners)) {
          $scope.showMedalList = false;
        } else {
          $scope.showMedalList = true;
        }
        // console.log('$scope.medalWinners',$scope.medalWinners);
      } else {
        toastr.error('Error in getMedalWinners');
      }

    });
  }
  // GET MEDAL WINNER END
  // GET SPORT RANKING TABLE
  $scope.getSchoolBySport = function () {
    NavigationService.getSchoolBySport($scope.sportFilter, function (data) {
      var data = data.data;
      if (data.value == true) {
        $scope.sportName = $scope.sportFilter.name;
        $scope.sportTable = data.data.table;
        $scope.risingAthletes = data.data.risingAthletes;
        // if(data.data.medalWinners){
        //   $scope.medalWinners = data.data.medalWinners;
        //   $scope.medalWinners = _.groupBy($scope.medalWinners, 'name');
        // }
        $scope.medalWinners = {};
        $scope.sportTable.tableLimit = 5;
        $scope.sportTable.showTable = true;
        _.each($scope.risingAthletes, function (n) {
          n.countGold = n.countSilver = n.countBronze = 0;
          if(n.athleteProfile.middleName){
            n.fullName = n.athleteProfile.firstName + ' ' + n.athleteProfile.middleName + ' ' + n.athleteProfile.surname;
          } else{
            n.fullName = n.athleteProfile.firstName + ' ' + n.athleteProfile.surname;
          }
          if(n.medalData.gold){
            n.countGold = n.medalData.gold[0].count;
          }
          if(n.medalData.silver){
            n.countSilver = n.medalData.silver[0].count;
          }
          if(n.medalData.bronze){
            n.countBronze = n.medalData.bronze[0].count;
          }
        });
        $scope.showAllMedalWinner = false;
        // console.log('School Table', $scope.sportTable);
        // console.log('rising', $scope.risingAthletes);
      } else {
        toastr.error('Sport Ranking Error', 'Error');
      }
    });
  };
  $scope.getSchoolBySport();
  // GET SPORT RANKING TABLE END
  // APIS END

  // JSONS
  $scope.eventList = ['sfa mumbai 2015-16', 'sfa ahmedabad 2015-16', 'sfa hyderabad 2015-16'];

  // ALL MEDAL WINNERS
  $scope.medalWinners = [{
    sport: "Athletics",
    eventName: "50m",
    age: "U-6",
    winners: [{
      gender: "male",
      list: [{
        name: "Anwar Hatela",
        school: "jamnabai high school",
        medal: 'gold'
      }, {
        name: "Dawood Ibrahim",
        school: "jamnabai high school",
        medal: 'silver'
      }, {
        name: "Chota Shakeel",
        school: "jamnabai high school",
        medal: 'bronze'
      }]
    }, {
      gender: "female",
      list: [{
        name: "Anwar Hatela",
        school: "jamnabai high school",
        medal: 'gold'
      }, {
        name: "Dawood Ibrahim",
        school: "jamnabai high school",
        medal: 'silver'
      }, {
        name: "Chota Shakeel",
        school: "jamnabai high school",
        medal: 'bronze'
      }]
    }]
  }, {
    sport: "Athletics",
    eventName: "100m",
    age: "U-12",
    winners: [{
      gender: "male",
      list: [{
        name: "Anwar Hatela",
        school: "jamnabai high school",
        medal: 'gold'
      }, {
        name: "Dawood Ibrahim",
        school: "jamnabai high school",
        medal: 'silver'
      }, {
        name: "Chota Shakeel",
        school: "jamnabai high school",
        medal: 'bronze'
      }]
    }, {
      gender: "female",
      list: [{
        name: "Anwar Hatela",
        school: "jamnabai high school",
        medal: 'gold'
      }, {
        name: "Dawood Ibrahim",
        school: "jamnabai high school",
        medal: 'silver'
      }, {
        name: "Chota Shakeel",
        school: "jamnabai high school",
        medal: 'bronze'
      }]
    }]
  }, {
    sport: "Athletics",
    eventName: "200m",
    age: "U-16",
    winners: [{
      gender: "male",
      list: [{
        name: "Anwar Hatela",
        school: "jamnabai high school",
        medal: 'gold'
      }, {
        name: "Dawood Ibrahim",
        school: "jamnabai high school",
        medal: 'silver'
      }, {
        name: "Chota Shakeel",
        school: "jamnabai high school",
        medal: 'bronze'
      }]
    }, {
      gender: "female",
      list: [{
        name: "Anwar Hatela",
        school: "jamnabai high school",
        medal: 'gold'
      }, {
        name: "Dawood Ibrahim",
        school: "jamnabai high school",
        medal: 'silver'
      }, {
        name: "Chota Shakeel",
        school: "jamnabai high school",
        medal: 'bronze'
      }]
    }]
  }];
  // ALL MEDAL WINNERS END
  // JSONS END

  //

  console.log($stateParams, "check state params")
  if ($stateParams.name) {
    $timeout(function () {
      console.log("in timeout")
      $scope.scrollID = 'result-sportwise';
      TemplateService.scrollTo($scope.scrollID, 'class');
    }, 1000);
  }
})