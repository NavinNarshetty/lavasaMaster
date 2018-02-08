// TEAM SPORTS -TABLE
myApp.controller('FormatTableTeamCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, toastr, $uibModal) {
  //Used to name the .html file
  $scope.template = TemplateService.changecontent("format-teamtable");
  $scope.menutitle = NavigationService.makeactive("Format Team");
  TemplateService.title = $scope.menutitle;
  $scope.navigation = NavigationService.getnav();
  console.log($.jStorage.get("detail"), 'JStorage');
  $scope.formData = {};
  $scope.formData.page = 1;
  $scope.formData.type = '';
  $scope.formData.keyword = '';
  $scope.form = {};
  $scope.form.page = 1;
  $scope.form.type = '';
  $scope.form.keyword = '';
  $scope.result = [];


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
  $scope.remove = function () {
    console.log("enter")
    $.jStorage.deleteKey('detail');
    $state.go('matches');

  }

  $scope.viewTable = function () {
    console.log("in")

    // console.log("data in table", formValue);
    $scope.url = "Match/getPerSport"
    // $scope.formData = formValue;
    $scope.form = $.jStorage.get("detail");
    $scope.form.page = $scope.form.page++;
    console.log("form......", $scope.form);
    NavigationService.apiCall($scope.url, $scope.form, function (data) {
      console.log("data.value heat", data);
      // console.log("$scope.name", $scope.name)
      $scope.items = data.data.results;
      // $scope.name = data.data.results[0].sport.sportslist.name;
      // console.log($scope.name);
      $scope.totalItems = data.data.total;
      $scope.maxRow = data.data.options.count;

    });
    $scope.specificFormat = function (data) {
      console.log("click")
      console.log("data", data);
      if (data.sport.sportslist.sportsListSubCategory.sportsListCategory.name == "Racquet Sports") {
        $state.go('detailteam', {
          id: data.matchId
        });
      } else if (data.sport.sportslist.sportsListSubCategory.sportsListCategory.name == "Team Sports") {

        console.log("in detail team page")
        $state.go('detailtsport-team', {
          id: data.matchId
        });
      } else if (data.sport.sportslist.sportsListSubCategory.sportsListCategory.name == "Aquatics Sports") {
        console.log("in water polo")
        $state.go('detailtsport-team', {
          id: data.matchId
        });
      } else if (data.sport.sportslist.drawFormat.name == "Heats") {
        console.log("in heats");
        $state.go('detailtsport-team', {
          id: data.matchId
        });
      }
    }
  }
  $scope.viewTable();


  $scope.confDel = function (data) {
    console.log(data, "modal id")
    $scope.id = data;
    console.log(data, "delete")
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
    console.log(data, "ID");
    $scope.url = "Match/delete";
    $scope.constraints = {};
    $scope.constraints._id = data;
    console.log($scope.constraints, "constraints")
    NavigationService.apiCall($scope.url, $scope.constraints, function (data) {
      if (data.value) {
        console.log(data.value, "in modal")
        toastr.success('Successfully Deleted', 'Team');
        $scope.modalInstance.close();
        $state.reload();
        // console.log($scope.viewTable());
        // $scope.viewTable();
      } else {
        toastr.error('Something Went Wrong while Deleting', 'Team');
      }

    });
  }

  // RULES MODAL
  $scope.rulesToFollow = function () {
    $scope.modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'views/modal/ruletofollow.html',
      // backdrop: 'static',
      // keyboard: false,
      size: 'md',
      scope: $scope
    });
  }
  // RULES MODAL END

})

// TEAM SPORTS END


// DETAIL TEAM SPORT EXPECT RACQUET
myApp.controller('DetailSportTeamCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, toastr, $uibModal) {
  //Used to name the .html file
  $scope.template = TemplateService.changecontent("detailsport-team");
  $scope.menutitle = NavigationService.makeactive("Detail Team Sport");
  TemplateService.title = $scope.menutitle;
  $scope.navigation = NavigationService.getnav();
  $scope.matchData = {};
  $scope.radio = {};
  $scope.formData = {};
  // FOR RADIO BUTTONS
  $scope.radioData = {
    radio1: 0
  }

  // STATUS LIST
  $scope.statusList = ["IsLive", "IsPending", "IsCompleted"];
  // STATUS LIST END
  // ACCORDIAN

  $scope.oneAtATime = true;
  $scope.status = {
    isCustomHeaderOpen: false,
    isFirstOpen: true,
    isFirstDisabled: false
  };
  // END ACCORDIAN

  $scope.data = [1, 2, 3, 4, 5, 6];

  // DELETE RESULT
  $scope.deleteResultModal = function (data) {
    console.log(data, "modal id")
    $scope.id = data;
    console.log(data, "delete")
    $scope.modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'views/modal/deleteresult.html',
      backdrop: 'static',
      keyboard: false,
      size: 'sm',
      scope: $scope
    });
  };

  // COMMON NO DELETE
  $scope.noDelete = function () {
    $scope.modalInstance.close();
  }
  // COMMON NO DELETE
  // DELETE RESULT API
  $scope.deleteResult = function (data) {
    console.log(data, "delete result match id")
    $scope.url = "Match/deleteResult"
    $scope.constraints = {};
    $scope.constraints.matchId = data;
    NavigationService.apiCall($scope.url, $scope.constraints, function () {
      console.log(data);
      if (data) {
        $scope.modalInstance.close();
        $state.reload();
      }

    });
  }
  // DELETE RESULT END


  // TO DELETE OPPONENT TEAM
  $scope.deleteOpponentModal = function (data, opponent) {
    console.log(data, opponent, "modal id")
    $scope.id = data;
    $scope.athlete = opponent;
    console.log(data, "delete")
    $scope.modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'views/modal/deleteopponent.html',
      // backdrop: 'static',
      // keyboard: false,
      size: 'sm',
      scope: $scope
    });
  };
  $scope.deleteOpponent = function (data) {
    console.log(data, "in delete opponent")
    $scope.url = "Match/deletePlayerFromMatch";
    $scope.constraints = {};
    $scope.constraints.matchId = $stateParams.id;
    $scope.constraints.opponentsTeam = data;
    console.log($scope.constraints, "in delete opponent constraints")
    NavigationService.apiCall($scope.url, $scope.constraints, function (data) {
      console.log(data);
      if (!data.data.error) {
        if (data) {
          $scope.modalInstance.close();
          $state.reload();
          toastr.success("Opponent Deleted Successfully")
        }
      } else if (data.data.error === "No Data Found") {
        toastr.error("Opponent Can't be Deleted", 'Error');
      }
    })
  }
  // TO DELETE OPPONENT TEAM END


  // TO GET OPPONENT TEAM
  $scope.teamOpponent = function (data) {
    console.log("inside function", data);
    $scope.url = "Match/getIndividualPlayers"
    console.log($scope.matchDetails, "data in formData")
    if ($scope.matchDetails.opponentsTeam.length === 1) {
      console.log("in legth ==1")
      $scope.opponent1 = true
    } else {
      $scope.opponent1 = false;
    }
    $scope.constraints = {}
    $scope.constraints.sport = data;
    NavigationService.apiCall($scope.url, $scope.constraints, function (data) {
      console.log(data, "oppo single")
      if (data) {
        $scope.playerSignles = data.data.match;
        _.each($scope.playerSignles, function (key) {
          console.log(key, "iniside each of player singles")
          key.sfaIdName = key.teamId + '-' + key.teamName;
        });
      }
      console.log($scope.playerSignles, "playerSingles");
    });
  }
  // TO GET OPPONENT TEAM END


  // SAVE OPPONENT TEAM
  $scope.saveOpponentTeam = function (data) {
    console.log(data, "in save opponent")
    $scope.url = "Match/addPlayerToMatch"
    $scope.constraints = {};
    $scope.constraints.matchId = $stateParams.id;
    if (_.isPlainObject(data[0])) {
      console.log("in the object case")
      $scope.constraints.opponentsTeam = []
      $scope.opponent1 = data[0]._id;
      console.log($scope.opponent1, "this is opponent1");
      $scope.opponent2 = data[1];
      $scope.constraints.opponentsTeam.push($scope.opponent1, $scope.opponent2);
      console.log($scope.constraints, "in object case")
    } else {
      $scope.constraints.opponentsTeam = data
      console.log($scope.constraints, "in no object case object case")
    }
    NavigationService.apiCall($scope.url, $scope.constraints, function (data) {
      if (!data.data.error) {
        if (data) {
          toastr.success("Opponent updated Successfully");
          $state.reload();
        }
      } else if (data.data.error === "Next Match Scored") {
        toastr.error("Next Match Already Scored", 'Error');
      } else if (data.data.error === "opponentsTeam have enough players") {
        toastr.error("opponentsTeam have enough players", 'Error')
      } else if (data.data.error === "No Data Found") {
        toastr.error("No Data found", "Error");
      }

    });
  }
  // SAVE OPPONENT TEAM END

  // STATUS LIST END

  // GET ONE BACKEND
  $scope.getOneBackend = function () {
    $scope.matchData.matchId = $stateParams.id;
    console.log($stateParams.id, "check")
    NavigationService.getOneBackend($scope.matchData, function (data) {
      if (data.value == true) {
        $scope.matchDetails = data.data;
        $scope.matchDetails.matchId = $scope.matchData.matchId;
        $scope.formData = data.data;
        $scope.sportId = data.data.sport._id;
        $scope.formData.scheduleTime = new Date();
        console.log($scope.formData, "form")
        console.log($scope.sportId, "the sport ID which need to be sent")



        _.each($scope.formData.opponentsTeam, function (key) {
          _.each(key.studentTeam, function (n) {
            if (n.studentId.middleName == undefined) {
              n.studentId.fullName = n.studentId.firstName + ' ' + n.studentId.surname;
            } else {
              n.studentId.fullName = n.studentId.firstName + ' ' + n.studentId.middleName + ' ' + n.studentId.surname;
            }

            // FOOTBALL
            if ($scope.formData.resultFootball) {
              _.each($scope.formData.resultFootball.teams, function (value) {
                _.each(value.players, function (j, index) {
                  if (key && key.studentTeam[index] && key.studentTeam[index].studentId.sfaId && key.studentTeam[index].studentId.fullName) {
                    j.sfaId = key.studentTeam[index].studentId.sfaId;
                    j.fullName = key.studentTeam[index].studentId.fullName;
                  }

                });

              });
            } else if ($scope.formData.resultVolleyball) {
              _.each($scope.formData.resultVolleyball.teams, function (value) {
                _.each(value.players, function (i, index) {
                  if (key && key.studentTeam[index] && key.studentTeam[index].studentId.sfaId && key.studentTeam[index].studentId.fullName) {
                    i.sfaId = key.studentTeam[index].studentId.sfaId;
                    i.fullName = key.studentTeam[index].studentId.fullName;
                  }
                });
              });
            } else if ($scope.formData.resultHeat) {
              // _.each($scope.formData, function (key) {
              // console.log(key, "key 1")
              // _.each($scope.formData, function (value) {
              var tempObjINdex;
              if ($scope.formData.opponentsTeam.length > 0) {
                // console.log(value, "im in")
                if ($scope.formData.opponentsTeam.length < $scope.formData.resultHeat.teams.length) {
                  _.each($scope.formData.resultHeat.teams, function (team) {
                    if (team.id === undefined) {
                      var tempObjIndex = _.findIndex($scope.formData.resultHeat.teams, team);
                      $scope.formData.opponentsTeam.splice(tempObjIndex, 0, {});
                    }
                  });
                }
                _.each($scope.formData.opponentsTeam, function (obj, index1) {
                  if (!_.isEmpty(obj.teamId)) {
                    obj.schoolNameWithTeamId = obj.teamId + ' - ' + obj.schoolName;
                  }
                  if ($scope.formData.resultHeat.teams !== undefined && $scope.formData.resultHeat.teams[index1] && $scope.formData.resultHeat.teams[index1] !== undefined && $scope.formData.resultHeat.teams[index1] !== null && $scope.formData.resultHeat.teams.length === $scope.formData.opponentsTeam.length) {
                    obj.result = $scope.formData.resultHeat.teams[index1].result;
                    obj.laneNo = $scope.formData.resultHeat.teams[index1].laneNo;
                    obj.time = $scope.formData.resultHeat.teams[index1].time;
                  }
                });
                console.log($scope.formData, "last")
              }
              // });
              // });
            }
          })

        });
        // console.log($scope.formData, "****************form")

        // TO MAKE A COMMON RESULT OBJECT FOR ALL SPORTS
        $scope.sportName = $scope.formData.sport.sportslist.sportsListSubCategory.name;
        console.log($scope.sportName, "check the sport name given here")
        switch ($scope.sportName) {
          case "Volleyball":
            $scope.formData.result = $scope.formData.resultVolleyball;
            break;
          case "Hockey":
            $scope.formData.result = $scope.formData.resultHockey;
            break;
          case "Football":
            $scope.formData.result = $scope.formData.resultFootball;
            break;
          case "Basketball":
            $scope.formData.result = $scope.formData.resultBasketball;
            break;
          case "Handball":
            $scope.formData.result = $scope.formData.resultHandball;
            break;
          case "WaterPolo":
            $scope.formData.result = $scope.formData.resultWaterPolo;
            break;
          case "Kabaddi":
            $scope.formData.result = $scope.formData.resultKabaddi;
            break;
          case "Throwball":
            $scope.formData.result = $scope.formData.resultThrowball;
            break;
          case "Kho Kho":
            $scope.formData.result = $scope.formData.resultsCombat;
            break;
        }
        // TO MAKE A COMMON RESULT OBJECT FOR ALL SPORTS END

        // FUNCTION TO GET OPPONENT TEAM
        $scope.teamOpponent($scope.sportId);
        // FUNCTION TO GET OPPONENT TEAM
      } else {
        console.log("ERROR IN getOneMatch");
        //redirect back to sportselection page
        // $state.go("sport-selection");
      }
    })
  };
  $scope.getOneBackend();

  // GET ONE BACKEND


  // SAVE
  $scope.saveDataMatch = function () {
    console.log($scope.formData, "save");
    $scope.obj = $.jStorage.get("detail")
    console.log($scope.obj, "check this")
    // $scope.formData.matchId=$stateParams.id;
    NavigationService.saveMatch($scope.formData, function (data) {
      if (data.value == true) {
        toastr.success("Data saved successfully", 'Success');
        $state.go('format-teamtable', {
          type: $scope.obj.sportslist.drawFormat.name
        })
      } else {
        toastr.error("Data save failed ,please try again or check your internet connection", 'Save error');
      }
    })

  }
  // SAVE-END

  // BACK
  $scope.back = function () {
    $scope.obj = $.jStorage.get("detail")
    $state.go('format-teamtable', {
      type: $scope.obj.sportslist.drawFormat.name
    })
  }
  // BACK END

  // ADD AND REMOVE FUNCTION
  $scope.addField = function (val, type, teamIndex, playerIndex) {
    console.log(val, type, teamIndex, playerIndex);
    $scope.formData[type].teams[teamIndex].players[playerIndex].playerPoints[val].push({
      time: 0
    });
  };
  $scope.removeField = function (val, type, teamIndex, playerIndex, goalIndex) {
    console.log(val, type, playerIndex, teamIndex, goalIndex);
    $scope.formData[type].teams[teamIndex].players[playerIndex].playerPoints[val].splice(goalIndex, 1);
  };
  // ADD AND REMOVE FUNCTION END


  // ADD SET 
  $scope.addTeamSet = function (data, result) {
    console.log(data, result, 'in add')
    $scope.formData[result].teams[data].teamResults.sets.push({
      points: ''
    });
  }
  // ADD SET  END

  // REMOVE  SET
  $scope.removeTeamSet = function (data, index, result) {
    console.log(data, index, 'in remove');
    $scope.formData[result].teams[data].teamResults.sets.splice(index, 1);
  }
  // REMOVE  SET END



})
// DETAIL TEAM SPORT EXPECT RACQUET


// TEAM SPORT ONLY FOR RACQUET
myApp.controller('DetailTeamCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, toastr, $uibModal) {
  //Used to name the .html file
  $scope.template = TemplateService.changecontent("detailteam");
  $scope.menutitle = NavigationService.makeactive("Detail Team");
  TemplateService.title = $scope.menutitle;
  $scope.navigation = NavigationService.getnav();
  $scope.matchData = {};
  $scope.formData = {};
  $scope.matchDetails = {};

  $scope.statusList = ["IsLive", "IsPending", "IsCompleted"];

  $scope.back = function () {
    $scope.obj = $.jStorage.get("detail")
    console.log($scope.obj, "jstorage")
    $state.go('format-teamtable', {
      type: $scope.obj.sportslist.drawFormat.name
    })
  }
  // BACK END


  // DELETE RESULT
  $scope.deleteResultModal = function (data) {
    console.log(data, "modal id")
    $scope.id = data;
    console.log(data, "delete")
    $scope.modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'views/modal/deleteresult.html',
      backdrop: 'static',
      keyboard: false,
      size: 'sm',
      scope: $scope
    });
  };

  // COMMON NO DELETE
  $scope.noDelete = function () {
    $scope.modalInstance.close();
  }
  // COMMON NO DELETE
  // DELETE RESULT API
  $scope.deleteResult = function (data) {
    console.log(data, "delete result match id")
    $scope.url = "Match/deleteResult"
    $scope.constraints = {};
    $scope.constraints.matchId = data;
    NavigationService.apiCall($scope.url, $scope.constraints, function () {
      console.log(data);
      if (data) {
        $scope.modalInstance.close();
        $state.reload();
      }

    });
  }
  // DELETE RESULT END


  // TO DELETE OPPONENT TEAM
  $scope.deleteOpponentModal = function (data, opponent) {
    console.log(data, opponent, "modal id")
    $scope.id = data;
    $scope.athlete = opponent;
    console.log(data, "delete")
    $scope.modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'views/modal/deleteopponent.html',
      // backdrop: 'static',
      // keyboard: false,
      size: 'sm',
      scope: $scope
    });
  };
  $scope.deleteOpponent = function (data) {
    console.log(data, "in delete opponent")
    $scope.url = "Match/deletePlayerFromMatch";
    $scope.constraints = {};
    $scope.constraints.matchId = $stateParams.id;
    $scope.constraints.opponentsTeam = data;
    console.log($scope.constraints, "in delete opponent constraints")
    NavigationService.apiCall($scope.url, $scope.constraints, function (data) {
      console.log(data);
      if (data) {
        $scope.modalInstance.close();
        $state.reload();
        toastr.success("Opponent Deleted Successfully", 'Success');
      }
    })
  }
  // TO DELETE OPPONENT TEAM END


  // TO GET OPPONENT TEAM
  $scope.teamOpponent = function (data) {
    console.log("inside function", data);
    $scope.url = "Match/getIndividualPlayers"
    console.log($scope.formData, "data in formData")
    if ($scope.formData.opponentsTeam.length === 1) {
      console.log("in legth ==1")
      $scope.opponent1 = true
    } else {
      $scope.opponent1 = false;
    }
    $scope.constraints = {}
    $scope.constraints.sport = data;
    NavigationService.apiCall($scope.url, $scope.constraints, function (data) {
      console.log(data, "oppo single")
      if (data) {
        $scope.playerSignles = data.data.match;
        _.each($scope.playerSignles, function (key) {
          console.log(key, "iniside each of player singles")
          key.sfaIdName = key.teamId + '-' + key.teamName;
        });
      }
      console.log($scope.playerSignles, "playerSingles");
    });
  }
  // TO GET OPPONENT TEAM END


  // SAVE OPPONENT TEAM
  $scope.saveOpponentTeam = function (data) {
    console.log(data, "in save opponent")
    $scope.url = "Match/addPlayerToMatch"
    $scope.constraints = {};
    $scope.constraints.matchId = $stateParams.id;
    if (_.isPlainObject(data[0])) {
      console.log("in the object case")
      $scope.constraints.opponentsTeam = []
      $scope.opponent1 = data[0]._id;
      console.log($scope.opponent1, "this is opponent1");
      $scope.opponent2 = data[1];
      $scope.constraints.opponentsTeam.push($scope.opponent1, $scope.opponent2);
      console.log($scope.constraints, "in object case")
    } else {
      $scope.constraints.opponentsTeam = data
      console.log($scope.constraints, "in no object case object case")
    }
    NavigationService.apiCall($scope.url, $scope.constraints, function (data) {
      if (!data.data.error) {
        if (data) {
          toastr.success("Opponent updated Successfully");
          $state.reload();
        }
      } else if (data.data.error === "Next Match Scored") {
        toastr.error("Next Match Already Scored", 'Error');
      } else if (data.data.error === "opponentsTeam have enough players") {
        toastr.error("Teams have enough players", 'Error')
        $state.reload();
      } else if (data.data.error === "No Data Found") {
        toastr.error("No Data found", "Error");
      }

    });
  }
  // SAVE OPPONENT TEAM END

  // GET ONE
  $scope.getOneBackend = function () {
    $scope.matchData.matchId = $stateParams.id;
    console.log($scope.matchData.matchId, "id");
    NavigationService.getOneBackend($scope.matchData, function (data) {
      if (data.value) {
        $scope.formData = data.data;
        $scope.matchDetails = data.data;
        $scope.sportId = data.data.sport._id;
        console.log($scope.formData, 'detail team data')
        $scope.teamOpponent($scope.sportId);
      } else {
        toastr.error("error");
      }
    })

  }
  $scope.getOneBackend();

  // END GET ONE
  // SAVE
  $scope.saveDataMatch = function () {
    $scope.formData.matchId = $stateParams.id;
    console.log($scope.formData, "save");
    $scope.obj = $.jStorage.get("detail")
    NavigationService.saveMatch($scope.formData, function (data) {
      if (data.value == true) {
        toastr.success("Data saved successfully", 'Success');
        $state.go('format-teamtable', {
          type: $scope.obj.sportslist.drawFormat.name
        })

      } else {
        toastr.error("Data save failed ,please try again or check your internet connection", 'Save error');
      }
    })

  }
  // SAVE-END

  // ADD RACQUET DOUBLES
  $scope.addRacquetSet = function (data) {
    console.log(data, 'in add')
    $scope.formData.resultsRacquet.teams[data].sets.push({
      'ace': '',
      'doubleFaults': '',
      'point': '',
      'serviceError': '',
      'unforcedError': '',
      'winner': ''
    })
  }
  // ADD RACQUET DOUBLES END

  // REMOVE
  $scope.removeRacquet = function (data, index) {
    console.log(data, index, 'in remove')
    $scope.formData.resultsRacquet.teams[data].sets.splice(index, 1);
  }
  // REMOVE END

})
// TEAM SPORT END FOR RACQUET