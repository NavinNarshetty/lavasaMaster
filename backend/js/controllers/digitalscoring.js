// DETAIL MATCHES
myApp.controller('DetailMatchesCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, toastr) {
  //Used to name the .html file
  $scope.template = TemplateService.changecontent("detailmatch");
  $scope.menutitle = NavigationService.makeactive("Detail Match");
  TemplateService.title = $scope.menutitle;
  $scope.navigation = NavigationService.getnav();
})

// DETAIL MATCHES END

// FORMAT TABLE
myApp.controller('FormatTableCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, toastr, $uibModal) {
  //Used to name the .html file
  $scope.template = TemplateService.changecontent("formattable");
  $scope.menutitle = NavigationService.makeactive("Draw Format Table");
  TemplateService.title = $scope.menutitle;
  $scope.navigation = NavigationService.getnav();
  $scope.drawType = $stateParams.type;
  console.log($.jStorage.get("detail"), 'JStorage');
  $scope.formData = {};
  $scope.formData.page = 1;
  $scope.formData.type = '';
  $scope.formData.keyword = '';
  $scope.form = {};
  $scope.form.page = 1;
  $scope.form.type = '';
  $scope.form.keyword = '';


  // SEARCH IN TABLE
  $scope.searchInTable = function (data) {
    console.log(data, "searchtable")
    $scope.form.page = 1;
    if (data.length >= 2) {
      $scope.form.keyword = data;
      $scope.viewTable();
    } else if (data.length == '') {
      $scope.form.keyword = data;
      $scope.viewTable();
    }
  }
  // SEARCH IN TABLE END

  $scope.viewTable = function () {
    console.log("in")
    // console.log("data in table", formValue);
    $scope.url = "Match/getPerSport"
    // $scope.formData = formValue;
    $scope.form = $.jStorage.get("detail");
    $scope.form.page = $scope.form.page++;
    console.log("form......", $scope.form);
    NavigationService.apiCall($scope.url, $scope.form, function (data) {
      console.log("data.value search", data);
      $scope.items = data.data.results;
      $scope.totalItems = data.data.total;
      $scope.maxRow = data.data.options.count;
      _.each($scope.items, function (key) {
        console.log($scope.formData.players, 'plr');
        _.each(key.opponentsSingle, function (value) {
          if (value.athleteId.middleName === undefined) {
            value.athleteId.fullname = value.athleteId.firstName + ' ' + value.athleteId.surname
          } else {
            value.athleteId.fullname = value.athleteId.firstName + ' ' + value.athleteId.middleName + ' ' + value.athleteId.surname
          }
        })
      });
      _.each($scope.items, function (data) {
        if (data.resultsCombat) {
          console.log("in combat")
        }
      })
    });
  }
  $scope.viewTable();



  $scope.remove = function () {
    console.log("enter")
    // $.jStorage.flush();
    // $state.go('matches');

    // NavigationService.removeDetail();
    // $state.go('matches');
    // $.jStorage.set("detail", null);
    $.jStorage.deleteKey('detail');
    $state.go('matches');

  }
  $scope.confDel = function (data) {
    $scope.id = data;
    $scope.modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'views/modal/delete.html',
      backdrop: 'static',
      keyboard: false,
      size: 'sm',
      scope: $scope
    });
  };


  $scope.noDelete = function () {
    $scope.modalInstance.close();
  }

  $scope.delete = function (data) {
    // console.log(data);
    $scope.url = "Match/delete";
    $scope.constraints = {};
    $scope.constraints._id = data;
    NavigationService.apiCall($scope.url, $scope.constraints, function (data) {
      if (data.value) {
        toastr.success('Successfully Deleted', 'Age Group Message');
        $scope.modalInstance.close();
        $scope.viewTable();
      } else {
        toastr.error('Something Went Wrong while Deleting', 'Age Group Message');
      }
    });
  }

  $scope.specificFormat = function (draw, matchid, team) {
    console.log("click")
    console.log(team)
    if (team == false) {
      console.log("team fasle")
      if (draw == "Combat Sports" || "Racquet Sports") {
        $state.go('detailplayer', {
          id: matchid
        });
      } else {
        toastr.error("Something went wrong")
      }
    } else if (team == true) {
      if (draw == "Combat Sports" || "Racquet Sports") {
        $state.go('detailteam', {
          id: matchid
        });
      } else {
        toastr.error("team error")
      }
    }
  }
})
// FORMAT TABLE END

// EDIT PLAYER
myApp.controller('DetailPlayerCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, toastr, $uibModal) {
  //Used to name the .html file
  $scope.template = TemplateService.changecontent("detailplayer");
  $scope.menutitle = NavigationService.makeactive("Edit Player");
  TemplateService.title = $scope.menutitle;
  $scope.navigation = NavigationService.getnav();
  $scope.formData = {};
  $scope.matchData = {};
  $scope.formData.scorecard = [];

  // STATUS LIST
  $scope.statusList = ["IsLive", "IsPending", "IsCompleted"];
  // STATUS LIST END
  $scope.getOneMatch = function () {
    $scope.matchData.matchId = $stateParams.id;
    NavigationService.getOneMatch($scope.matchData, function (data) {
      if (data.value == true) {
        $scope.matchDetails = data.data;
        $scope.matchDetails.matchId = $scope.matchData.matchId;
        $scope.formData = data.data;
        $scope.formData.scheduleTime = new Date();
        _.each($scope.formData.players, function (key) {
          console.log($scope.formData.players, 'plr');
          key.fullName = key.firstName + ' ' + key.surname;
          _.each($scope.formData.resultsCombat.players, function (value) {
            key.noShow = value.noShow;
            key.walkover = value.walkover;
            _.each(value.sets, function (data) {
              key.point = data.point;
            })
          })
        })

        console.log($scope.formData)

      } else {
        console.log("ERROR IN getOneMatch");
        //redirect back to sportselection page
        // $state.go("sport-selection");
      }
    })
  };
  $scope.getOneMatch();
  console.log($scope.formData, "last");
  // GET MATCH END
  // BACK
  $scope.back = function () {
    $scope.obj = $.jStorage.get("detail")
    $state.go('format-table', {
      type: $scope.obj.sportslist.drawFormat.name
    })
  }
  // BACK END
  // SAVE
  $scope.saveDataMatch = function () {
    console.log($scope.formData, "save");
    $scope.obj = $.jStorage.get("detail")
    NavigationService.saveMatch($scope.formData, function (data) {
      if (data.value == true) {
        toastr.success("Data saved successfully", 'Success');
        $state.go('format-table', {
          type: $scope.obj.sportslist.drawFormat.name
        })
      } else {
        toastr.error("Data save failed ,please try again or check your internet connection", 'Save error');
      }
    })

  }
  // SAVE-END
})
// END EDIT PLAYER


// EDIT TEAM
myApp.controller('DetailTeamCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, toastr) {
  //Used to name the .html file
  $scope.template = TemplateService.changecontent("detailteam");
  $scope.menutitle = NavigationService.makeactive("Detail Team");
  TemplateService.title = $scope.menutitle;
  $scope.navigation = NavigationService.getnav();
  $scope.matchData = {};
  $scope.formData = {};

  $scope.statusList = ["IsLive", "IsPending", "IsCompleted"];

  // GET ONE
  $scope.getOneMatch = function () {
    $scope.matchData.matchId = $stateParams.id;
    console.log($scope.matchData.matchId, "id");
    NavigationService.getOneMatch($scope.matchData, function (data) {
      if (data.value == true) {
        $scope.formData = data.data;
      } else {
        toastr.error("error");
      }
    })
  }
  $scope.getOneMatch();

  // END GET ONE
  // SAVE
  $scope.saveDataMatch = function () {
    $scope.matchData.matchId = $stateParams.id;
    console.log($scope.formData, "save");
    NavigationService.saveMatch($scope.formData, function (data) {
      if (data.value == true) {
        toastr.success("Data saved successfully", 'Success');
      } else {
        toastr.error("Data save failed ,please try again or check your internet connection", 'Save error');
      }
    })

  }
  // SAVE-END


})
// EDIT TEAM END

// DETAIL TEAM SPORT
myApp.controller('DetailSportTeamCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, toastr, $uibModal) {
  //Used to name the .html file
  $scope.template = TemplateService.changecontent("detailsport-team");
  $scope.menutitle = NavigationService.makeactive("Detail Team Sport");
  TemplateService.title = $scope.menutitle;
  $scope.navigation = NavigationService.getnav();

  // ACCORDIAN

  $scope.oneAtATime = true;
  $scope.status = {
    isCustomHeaderOpen: false,
    isFirstOpen: true,
    isFirstDisabled: false
  };
  // END ACCORDIAN

  $scope.data = [1, 2, 3, 4, 5, 6];

  $scope.heatsTable = [{
    sfaId: "Ma1234",
    name: "Jamnabai Narsee School",
    fullName: "Shiva Singh"
  }, {
    sfaId: "Ma1234",
    name: "Jamnabai Narsee School",
    fullName: "Shiva Singh"
  }, {
    sfaId: "Ma1234",
    name: "Jamnabai Narsee School",
    fullName: "Shiva Singh"
  }, {
    sfaId: "Ma1234",
    name: "Jamnabai Narsee School",
    fullName: "Shiva Singh"
  }, {
    sfaId: "Ma1234",
    name: "Jamnabai Narsee School",
    fullName: "Shiva Singh"
  }, {
    sfaId: "Ma1234",
    name: "Jamnabai Narsee School",
    fullName: "Shiva Singh"
  }, {
    sfaId: "Ma1234",
    name: "Jamnabai Narsee School",
    fullName: "Shiva Singh"
  }, {
    sfaId: "Ma1234",
    name: "Jamnabai Narsee School",
    fullName: "Shiva Singh"
  }, {
    sfaId: "Ma1234",
    name: "Jamnabai Narsee School",
    fullName: "Shiva Singh"
  }, {
    sfaId: "Ma1234",
    name: "Jamnabai Narsee School",
    fullName: "Shiva Singh"
  }, {
    sfaId: "Ma1234",
    name: "Jamnabai Narsee School",
    fullName: "Shiva Singh"
  }]

  var modal;
  $scope.editPlayer = function () {
    modal = $uibModal.open({
      animation: true,
      scope: $scope,
      // backdrop: 'static',
      keyboard: false,
      templateUrl: 'views/modal/editteamplayer.html',
      size: 'lg',
      windowClass: 'backmodal'
    })
  }
  // HOCKEY JSON
  $scope.match = {
    matchId: '123456',
    sportsName: 'Football',
    age: 'u-11',
    gender: 'female',
    round: 'final',
    minPlayers: 4,
    resultHockey: {
      teams: [{
        teamId: '987654',
        teamResults: {
          halfPoints: 10,
          finalPoints: 22,
          penalityPoints: 1,
          shotsOnGoal: 2,
          totalShots: 2,
          corners: 2,
          penality: 1,
          saves: 1,
          fouls: 1,
          offSide: 1,
          cleanSheet: 1
        },
        players: [{
          name: 'hello',
          sfaId: "Ma1234",
          fullName: "Shiva Singh",
          isPlaying: true,
          playerPoints: {
            goal: [{
              points: 1,
              time: 11
            }],
            assist: [{
              count: 1,
              time: 11
            }],
            redCard: [{
              time: 11
            }],
            yellowCard: [{
              time: 11
            }],
            greenCard: [{
              time: 11
            }],
            penalityPoint: 1,
            in: [{
              time: 11
            }],
            out: [{
              time: 11
            }]
          }
        }, {
          name: 'hello',
          sfaId: "Ma1234",
          fullName: "Shiva Singh",
          isPlaying: true,
          playerPoints: {
            goal: [{
              points: 1,
              time: 11
            }],
            assist: [{
              count: 1,
              time: 11
            }],
            redCard: [{
              time: 11
            }],
            yellowCard: [{
              time: 11
            }],
            greenCard: [{
              time: 11
            }],
            penalityPoint: 1,
            in: [{
              time: 11
            }],
            out: [{
              time: 11
            }]
          }

        }, {
          name: 'hello',
          sfaId: "Ma1234",
          fullName: "Shiva Singh",
          isPlaying: true,
          playerPoints: {
            goal: [{
              points: 1,
              time: 11
            }],
            assist: [{
              count: 1,
              time: 11
            }],
            redCard: [{
              time: 11
            }],
            yellowCard: [{
              time: 11
            }],
            greenCard: [{
              time: 11
            }],
            penalityPoint: 1,
            in: [{
              time: 11
            }],
            out: [{
              time: 11
            }]
          }

        }, {
          name: 'hello',
          sfaId: "Ma1234",
          fullName: "Shiva Singh",
          isPlaying: true,
          playerPoints: {
            goal: [{
              points: 1,
              time: 11
            }],
            assist: [{
              count: 1,
              time: 11
            }],
            redCard: [{
              time: 11
            }],
            yellowCard: [{
              time: 11
            }],
            greenCard: [{
              time: 11
            }],
            penalityPoint: 1,
            in: [{
              time: 11
            }],
            out: [{
              time: 11
            }]
          }

        }, {
          name: 'hello',
          sfaId: "Ma1234",
          fullName: "Shiva Singh",
          isPlaying: true,
          playerPoints: {
            goal: [{
              points: 1,
              time: 11
            }],
            assist: [{
              count: 1,
              time: 11
            }],
            redCard: [{
              time: 11
            }],
            yellowCard: [{
              time: 11
            }],
            greenCard: [{
              time: 11
            }],
            penalityPoint: 1,
            in: [{
              time: 11
            }],
            out: [{
              time: 11
            }]
          }

        }]
      }, {
        teamId: '54321',
        teamResults: {
          halfPoints: 10,
          finalPoints: 22,
          penalityPoints: 1,
          shotsOnGoal: 2,
          totalShots: 2,
          corners: 2,
          penality: 1,
          saves: 1,
          fouls: 1,
          offSide: 1,
          cleanSheet: 1
        },
        players: [{
          name: 'hello',
          sfaId: "Ma123467",
          fullName: "Shiva Singh",
          isPlaying: true,
          playerPoints: {
            goal: [{
              points: 1,
              time: 11
            }],
            assist: [{
              count: 1,
              time: 11
            }],
            redCard: [{
              time: 11
            }],
            yellowCard: [{
              time: 11
            }],
            greenCard: [{
              time: 11
            }],
            penalityPoint: 1,
            in: [{
              time: 11
            }],
            out: [{
              time: 11
            }]
          }

        }, {
          name: 'hello',
          sfaId: "Ma1234",
          fullName: "Shiva Singh",
          isPlaying: true,
          playerPoints: {
            goal: [{
              points: 1,
              time: 11
            }],
            assist: [{
              count: 1,
              time: 11
            }],
            redCard: [{
              time: 11
            }],
            yellowCard: [{
              time: 11
            }],
            greenCard: [{
              time: 11
            }],
            penalityPoint: 1,
            in: [{
              time: 11
            }],
            out: [{
              time: 11
            }]
          }

        }, {
          name: 'hello',
          sfaId: "Ma1234",
          fullName: "Shiva Singh",
          isPlaying: true,
          playerPoints: {
            goal: [{
              points: 1,
              time: 11
            }],
            assist: [{
              count: 1,
              time: 11
            }],
            redCard: [{
              time: 11
            }],
            yellowCard: [{
              time: 11
            }],
            greenCard: [{
              time: 11
            }],
            penalityPoint: 1,
            in: [{
              time: 11
            }],
            out: [{
              time: 11
            }]
          }

        }, {
          name: 'hello',
          sfaId: "Ma1234",
          fullName: "Shiva Singh",
          isPlaying: true,
          playerPoints: {
            goal: [{
              points: 1,
              time: 11
            }],
            assist: [{
              count: 1,
              time: 11
            }],
            redCard: [{
              time: 11
            }],
            yellowCard: [{
              time: 11
            }],
            greenCard: [{
              time: 11
            }],
            penalityPoint: 1,
            in: [{
              time: 11
            }],
            out: [{
              time: 11
            }]
          }

        }, {
          name: 'hello',
          sfaId: "Ma1234",
          fullName: "Shiva Singh",
          isPlaying: true,
          playerPoints: {
            goal: [{
              points: 1,
              time: 11
            }],
            assist: [{
              count: 1,
              time: 11
            }],
            redCard: [{
              time: 11
            }],
            yellowCard: [{
              time: 11
            }],
            greenCard: [{
              time: 11
            }],
            penalityPoint: 1,
            in: [{
              time: 11
            }],
            out: [{
              time: 11
            }]
          }

        }]
      }]
    },
    teams: [{
        schoolName: 'jamnabai narsee school',
        teamId: '987654',
        players: [{
          firstName: 'Jaiviraj singh rajputrajput singh'
        }, {
          firstName: 'hello2'
        }, {
          firstName: 'hello3'
        }, {
          firstName: 'hello4'
        }, {
          firstName: 'hello5'
        }]
      },
      {
        schoolName: 'Marvel iron high school',
        teamId: '54321',
        players: [{
          firstName: 'hello6'
        }, {
          firstName: 'hello7'
        }, {
          firstName: 'hello8'
        }, {
          firstName: 'hello9'
        }, {
          firstName: 'hello10'
        }]
      }
    ]
  }
  // HOCKEY JSON END

  // BASKETBALL JSON
  $scope.match = {
    matchId: '123456',
    sportsName: 'Football',
    age: 'u-11',
    gender: 'female',
    round: 'final',
    minPlayers: 4,
    resultBasketBall: {
      teams: [{
        teamId: '987654',
        teamResults: {
          halfPoints: 10,
          finalPoints: 22,
          penalityPoints: 1,
          shotsOnGoal: 2,
          totalShots: 2,
          corners: 2,
          penality: 1,
          saves: 1,
          fouls: 1,
          offSide: 1,
          cleanSheet: 1
        },
        players: [{
          name: 'hello',
          sfaId: "Ma1234",
          fullName: "Shiva Singh",
          isPlaying: true,
          playerPoints: {
            freeThrow: [{
              count: 1,
              time: 11
            }],
            points2: [{
              count: 1,
              time: 11

            }],
            points3: [{
              count: 1,
              time: 11
            }],
            personalFoul: [{
              count: 1,
              time: 11
            }],
            technicalFoul: [{
              count: 1,
              time: 11
            }],
          }
        }, {
          name: 'hello',
          sfaId: "Ma1234",
          fullName: "Shiva Singh",
          isPlaying: true,
          playerPoints: {
            freeThrow: [{
              count: 1,
              time: 11
            }],
            points2: [{
              count: 1,
              time: 11

            }],
            points3: [{
              count: 1,
              time: 11
            }],
            personalFoul: [{
              count: 1,
              time: 11
            }],
            technicalFoul: [{
              count: 1,
              time: 11
            }],
          }

        }, ]
      }, {
        teamId: '54321',
        teamResults: {
          halfPoints: 10,
          finalPoints: 22,
          penalityPoints: 1,
          shotsOnGoal: 2,
          totalShots: 2,
          corners: 2,
          penality: 1,
          saves: 1,
          fouls: 1,
          offSide: 1,
          cleanSheet: 1
        },
        players: [{
          name: 'hello',
          sfaId: "Ma123467",
          fullName: "Shiva Singh",
          isPlaying: true,
          playerPoints: {
            freeThrow: [{
              count: 1,
              time: 11
            }],
            points2: [{
              count: 1,
              time: 11

            }],
            points3: [{
              count: 1,
              time: 11
            }],
            personalFoul: [{
              count: 1,
              time: 11
            }],
            technicalFoul: [{
              count: 1,
              time: 11
            }],
          }

        }, {
          name: 'hello',
          sfaId: "Ma1234",
          fullName: "Shiva Singh",
          isPlaying: true,
          playerPoints: {
            freeThrow: [{
              count: 1,
              time: 11
            }],
            points2: [{
              count: 1,
              time: 11

            }],
            points3: [{
              count: 1,
              time: 11
            }],
            personalFoul: [{
              count: 1,
              time: 11
            }],
            technicalFoul: [{
              count: 1,
              time: 11
            }],
          }

        }]
      }]
    }
  }
  // BASKETBALL JSON

  // HANDLL JSON
  $scope.match = {
    matchId: '123456',
    sportsName: 'Football',
    age: 'u-11',
    gender: 'female',
    round: 'final',
    minPlayers: 4,
    resultHandBall: {
      teams: [{
        teamId: '987654',
        teamResults: {
          halfPoints: 10,
          finalPoints: 22,
          penalityPoints: 1,
          shotsOnGoal: 2,
          totalShots: 2,
          corners: 2,
          penality: 1,
          saves: 1,
          fouls: 1,
          offSide: 1,
          cleanSheet: 1
        },
        players: [{
          name: 'hello',
          sfaId: "Ma1234",
          fullName: "Shiva Singh",
          isPlaying: true,
          playerPoints: {
            goal: [{
              points: 1,
              time: 11
            }],
            yellowCard: [{
              time: 11
            }],
            greenCard: [{
              time: 11
            }],
            in: [{
              time: 11
            }],
            out: [{
              time: 11
            }]
          }
        }, {
          name: 'hello',
          sfaId: "Ma1234",
          fullName: "Shiva Singh",
          isPlaying: true,
          playerPoints: {
            goal: [{
              points: 1,
              time: 11
            }],
            yellowCard: [{
              time: 11
            }],
            greenCard: [{
              time: 11
            }],
            in: [{
              time: 11
            }],
            out: [{
              time: 11
            }]
          }

        }, ]
      }, {
        teamId: '54321',
        teamResults: {
          halfPoints: 10,
          finalPoints: 22,
          penalityPoints: 1,
          shotsOnGoal: 2,
          totalShots: 2,
          corners: 2,
          penality: 1,
          saves: 1,
          fouls: 1,
          offSide: 1,
          cleanSheet: 1
        },
        players: [{
          name: 'hello',
          sfaId: "Ma123467",
          fullName: "Shiva Singh",
          isPlaying: true,
          playerPoints: {
            goal: [{
              points: 1,
              time: 11
            }],
            yellowCard: [{
              time: 11
            }],
            greenCard: [{
              time: 11
            }],
            in: [{
              time: 11
            }],
            out: [{
              time: 11
            }]
          }

        }, {
          name: 'hello',
          sfaId: "Ma123466",
          fullName: "Shiva Singh",
          isPlaying: true,
          playerPoints: {
            goal: [{
              points: 1,
              time: 11
            }],
            yellowCard: [{
              time: 11
            }],
            greenCard: [{
              time: 11
            }],
            in: [{
              time: 11
            }],
            out: [{
              time: 11
            }]
          }

        }]
      }]
    }
  }

  // WATER POLO
  $scope.match = {
    matchId: '123456',
    sportsName: 'Football',
    age: 'u-11',
    gender: 'female',
    round: 'final',
    minPlayers: 4,
    resultWaterPolo: {
      teams: [{
        teamId: '987654',
        teamResults: {
          halfPoints: 10,
          finalPoints: 22,
          penalityPoints: 1,
          shotsOnGoal: 2,
          totalShots: 2,
          corners: 2,
          penality: 1,
          saves: 1,
          fouls: 1,
          offSide: 1,
          cleanSheet: 1
        },
        players: [{
          name: 'hello',
          sfaId: "Ma1234",
          fullName: "Shiva Singh",
          isPlaying: true,
          playerPoints: {
            goal: [{
              points: 1,
              time: 11
            }],
            penalityPoint: [{
              count: 1
            }],
            in: [{
              time: 11
            }],
            out: [{
              time: 11
            }]
          }
        }, {
          name: 'hello',
          sfaId: "Ma1234",
          fullName: "Shiva Singh",
          isPlaying: true,
          playerPoints: {
            goal: [{
              points: 1,
              time: 11
            }],
            penalityPoint: [{
              count: 1
            }],
            in: [{
              time: 11
            }],
            out: [{
              time: 11
            }]
          }

        }, ]
      }, {
        teamId: '54321',
        teamResults: {
          halfPoints: 10,
          finalPoints: 22,
          penalityPoints: 1,
          shotsOnGoal: 2,
          totalShots: 2,
          corners: 2,
          penality: 1,
          saves: 1,
          fouls: 1,
          offSide: 1,
          cleanSheet: 1
        },
        players: [{
          name: 'hello',
          sfaId: "Ma1467",
          fullName: "Shiva Singh",
          isPlaying: true,
          playerPoints: {
            goal: [{
              points: 1,
              time: 11
            }],
            penalityPoint: [{
              count: 1
            }],
            in: [{
              time: 11
            }],
            out: [{
              time: 11
            }]
          }

        }, {
          name: 'hello',
          sfaId: "Ma123466",
          fullName: "Shiva Singh",
          isPlaying: true,
          playerPoints: {
            goal: [{
              points: 1,
              time: 11
            }],
            penalityPoint: [{
              count: 1
            }],
            in: [{
              time: 11
            }],
            out: [{
              time: 11
            }]
          }

        }]
      }]
    }
  }
  // WATER POLO END

  // KABADI
  $scope.match = {
    matchId: '123456',
    sportsName: 'Football',
    age: 'u-11',
    gender: 'female',
    round: 'final',
    minPlayers: 4,
    resultKabaddi: {
      teams: [{
        teamId: '987654',
        teamResults: {
          halfPoints: 10,
          finalPoints: 22,
          penalityPoints: 1,
          shotsOnGoal: 2,
          totalShots: 2,
          corners: 2,
          penality: 1,
          saves: 1,
          fouls: 1,
          offSide: 1,
          cleanSheet: 1
        },
        players: [{
          name: 'hello',
          sfaId: "Ma1234",
          fullName: "Shiva Singh",
          isPlaying: true,
          playerPoints: {
            raids: [{
              count: 1,
              time: 11
            }],
            bonusPoint: [{
              count: 1,
              time: 11
            }],
            superRaid: [{
              count: 1,
              time: 11
            }],
            tackle: [{
              count: 1,
              time: 11
            }],
            in: [{
              time: 11
            }],
            out: [{
              time: 11
            }]
          }
        }, {
          name: 'hello',
          sfaId: "Ma1234",
          fullName: "Shiva Singh",
          isPlaying: true,
          playerPoints: {
            raids: [{
              count: 1,
              time: 11
            }],
            bonusPoint: [{
              count: 1,
              time: 11
            }],
            superRaid: [{
              count: 1,
              time: 11
            }],
            tackle: [{
              count: 1,
              time: 11
            }],
            in: [{
              time: 11
            }],
            out: [{
              time: 11
            }]
          }

        }, ]
      }, {
        teamId: '54321',
        teamResults: {
          halfPoints: 10,
          finalPoints: 22,
          penalityPoints: 1,
          shotsOnGoal: 2,
          totalShots: 2,
          corners: 2,
          penality: 1,
          saves: 1,
          fouls: 1,
          offSide: 1,
          cleanSheet: 1
        },
        players: [{
          name: 'hello',
          sfaId: "Ma1467",
          fullName: "Shiva Singh",
          isPlaying: true,
          playerPoints: {
            raids: [{
              count: 1,
              time: 11
            }],
            bonusPoint: [{
              count: 1,
              time: 11
            }],
            superRaid: [{
              count: 1,
              time: 11
            }],
            tackle: [{
              count: 1,
              time: 11
            }],
            in: [{
              time: 11
            }],
            out: [{
              time: 11
            }]
          }

        }, {
          name: 'hello',
          sfaId: "Ma123466",
          fullName: "Shiva Singh",
          isPlaying: true,
          playerPoints: {
            raids: [{
              count: 1,
              time: 11
            }],
            bonusPoint: [{
              count: 1,
              time: 11
            }],
            superRaid: [{
              count: 1,
              time: 11
            }],
            tackle: [{
              count: 1,
              time: 11
            }],
            in: [{
              time: 11
            }],
            out: [{
              time: 11
            }]
          }

        }]
      }]
    }
  }
  // KABADI JSON END
  $scope.match = {
    matchId: '123456',
    sportsName: 'Football',
    age: 'u-11',
    gender: 'female',
    round: 'final',
    minPlayers: 4,
    resultFootball: {
      teams: [{
        teamId: '987654',
        teamResults: {
          halfPoints: 10,
          finalPoints: 22,
          penalityPoints: 1,
          shotsOnGoal: 2,
          totalShots: 2,
          corners: 2,
          penality: 1,
          saves: 1,
          fouls: 1,
          offSide: 1,
          cleanSheet: 1
        },
        players: [{
          name: 'hello',
          sfaId: "Ma1234",
          fullName: "Shiva Singh",
          isPlaying: true,
          playerPoints: {
            goal: [{
              points: 1,
              time: 11
            }],
            assist: [{
              count: 1,
              time: 11
            }],
            redCard: [{
              time: 11
            }],
            yellowCard: [{
              time: 11
            }],
            penalityPoint: [{
              count: 1
            }],
            in: [{
              time: 11
            }],
            out: [{
              time: 11
            }]
          }
        }, {
          name: 'hello',
          sfaId: "Ma1234",
          fullName: "Shiva Singh",
          isPlaying: true,
          playerPoints: {
            goal: [{
              points: 1,
              time: 11
            }],
            assist: [{
              count: 1,
              time: 11
            }],
            redCard: [{
              time: 11
            }],
            yellowCard: [{
              time: 11
            }],
            penalityPoint: [{
              count: 1
            }],
            in: [{
              time: 11
            }],
            out: [{
              time: 11
            }]
          }

        }, ]
      }, {
        teamId: '54321',
        teamResults: {
          halfPoints: 10,
          finalPoints: 22,
          penalityPoints: 1,
          shotsOnGoal: 2,
          totalShots: 2,
          corners: 2,
          penality: 1,
          saves: 1,
          fouls: 1,
          offSide: 1,
          cleanSheet: 1
        },
        players: [{
          name: 'hello',
          sfaId: "Ma1467",
          fullName: "Shiva Singh",
          isPlaying: true,
          playerPoints: {
            goal: [{
              points: 1,
              time: 11
            }],
            assist: [{
              count: 1,
              time: 11
            }],
            redCard: [{
              time: 11
            }],
            yellowCard: [{
              time: 11
            }],
            penalityPoint: [{
              count: 1
            }],
            in: [{
              time: 11
            }],
            out: [{
              time: 11
            }]
          }

        }, {
          name: 'hello',
          sfaId: "Ma123466",
          fullName: "Shiva Singh",
          isPlaying: true,
          playerPoints: {
            goal: [{
              points: 1,
              time: 11
            }],
            assist: [{
              count: 1,
              time: 11
            }],
            redCard: [{
              time: 11
            }],
            yellowCard: [{
              time: 11
            }],
            penalityPoint: [{
              count: 1
            }],
            in: [{
              time: 11
            }],
            out: [{
              time: 11
            }]
          }

        }]
      }]
    }
  }
  // FOOTBALL JSON 

  // FOOTBALL JSON  END
  $scope.addField = function (val, type, teamIndex, playerIndex) {
    console.log(val, type, teamIndex, playerIndex);
    $scope.match[type].teams[teamIndex].players[playerIndex].playerPoints[val].push({
      time: 0
    });
  };
  $scope.removeField = function (val, type, teamIndex, playerIndex, goalIndex) {
    console.log(val, type, playerIndex, teamIndex, goalIndex);
    $scope.match[type].teams[teamIndex].players[playerIndex].playerPoints[val].splice(goalIndex, 1);
  };
})

// DETAIL TEAM SPORT