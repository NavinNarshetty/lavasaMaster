// FORMAT TABLE FOR INDIVIDUAL SPORTS
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

  $scope.viewTable = function () {
    console.log("in")
    $scope.result = [];
    // console.log("data in table", formValue);
    $scope.url = "Match/getPerSport"
    // $scope.formData = formValue;
    $scope.form = $.jStorage.get("detail");
    $scope.form.page = $scope.form.page++;
    console.log("form......", $scope.form);
    $scope.tableSportName = $scope.form.sportslist.name;
    $scope.tableAge = $scope.form.ageGroup.name;
    $scope.tableGender = $scope.form.gender;
    NavigationService.apiCall($scope.url, $scope.form, function (data) {
      console.log("data.value heat", data);
      $scope.items = data.data.results;
      $scope.totalItems = data.data.total;
      $scope.maxRow = data.data.options.count;

      // TO MAKE COMMON RESULT
      _.each($scope.items, function (value) {
        $scope.draw = value.sport.sportslist.drawFormat.name;
        $scope.sportName = value.sport.sportslist.sportsListSubCategory.sportsListCategory.name
        switch ($scope.sportName) {
          case "Combat Sports":
            if (value.sport.sportslist.sportsListSubCategory.name === 'Fencing') {
              console.log("in switch fencing")
              value.commonResult = value.resultFencing;
            } else {
              console.log("in switch")
              value.commonResult = value.resultsCombat;
            }
            break;
          case "Racquet Sports":
            console.log("in racquet")
            value.commonResult = value.resultsRacquet;
            break;
          case "Individual Sports":
            console.log("in individual")
            if (value.sport.sportslist.name === "Carrom") {
              value.commonResult = value.resultsCombat;
            } else if (value.sport.sportslist.drawFormat.name === 'Qualifying Round') {
              console.log("in secon")
              value.commonResult = value.resultQualifyingRound;
            }
        }
      })
      console.log($scope.sportName, "Sport NAme")

      // TO MAKE COMMON RESULT END


      _.each($scope.items, function (data) {

        // TO MAKE COMMON FULLNAME FOR DISPLAY IN TABLE
        _.each(data.opponentsSingle, function (key) {
          // console.log(key, "new each")
          if (key.athleteId) {
            if (key.athleteId.middleName) {
              key.fullName = key.athleteId.firstName + ' ' + key.athleteId.middleName + ' ' + key.athleteId.surname;
            } else {
              key.fullName = key.athleteId.firstName + ' ' + key.athleteId.surname;
            }
          }
        });
      });
    });
  }
  $scope.viewTable();



  $scope.remove = function () {
    console.log("enter")
    $.jStorage.deleteKey('detail');
    $state.go('matches');
  }

  // DELETE FUNCTION
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

  // CANCEL DELETE-NO
  $scope.noDelete = function () {
    $scope.modalInstance.close();
  }

  // DELETE FUNCTION-YES
  $scope.delete = function (data) {
    console.log(data, "ID");
    $scope.url = "Match/delete";
    $scope.constraints = {};
    $scope.constraints._id = data;
    console.log($scope.constraints, "constraints")
    NavigationService.apiCall($scope.url, $scope.constraints, function (data) {
      if (data.value) {
        console.log(data.value, "in modal")
        toastr.success('Successfully Deleted', 'Deleted');
        $scope.modalInstance.close();
        $state.reload();
      } else {
        toastr.error('Something Went Wrong while Deleting', 'Error');
      }

    });
  }

  // EDIT FUNCTION FOR ALL THE SPORTS
  $scope.specificFormat = function (editData) {
    console.log("click", editData)
    // console.log("data", matchid, team, type, drawformat);
    $scope.matchid = editData.matchId;
    $scope.team = editData.sport.sportslist.sportsListSubCategory.isTeam
    $scope.type = editData.sport.sportslist.sportsListSubCategory.sportsListCategory.name
    $scope.drawformat = editData.sport.sportslist.drawFormat.name;
    // TEAM IS TRUE
    if ($scope.team) {

    }
    // FOR INDIVIDUAL SPORT - TEAM IS FALSE
    else {
      if ($scope.type === "Racquet Sports" || $scope.type === "Combat Sports") {
        $state.go('detailplayer', {
          id: $scope.matchid
        });
      } else if ($scope.type === "Individual Sports" || $scope.type === "Aquatics Sports") {
        // console.log("IN CARROM");
        if ($scope.drawformat === "Heats") {
          $state.go('detail-heats', {
            id: $scope.matchid
          });
        } else if ($scope.drawformat === "Qualifying Round") {
          $state.go('detail-qualifying', {
            id: $scope.matchid
          });
        } else if ($scope.drawformat === "Knockout") {
          $state.go('detailplayer', {
            id: $scope.matchid
          });
        } else if ($scope.drawformat === 'Swiss League') {
          $state.go('detailplayer', {
            id: $scope.matchid
          });
        }
      } else if ($scope.type === "Target Sports") {
        $state.go('detail-qualifying', {
          id: $scope.matchid
        });
      }
    }
  }
  // END EDIT FUNCTION FOR ALL THE SPORTS


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
// FORMAT TABLE END



// EDIT PLAYER ONLY FOR RACQUET AND COMBAT
myApp.controller('DetailPlayerCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, toastr, $uibModal) {
  //Used to name the .html file
  $scope.template = TemplateService.changecontent("detailplayer");
  $scope.menutitle = NavigationService.makeactive("Edit Player");
  TemplateService.title = $scope.menutitle;
  $scope.navigation = NavigationService.getnav();
  $scope.formData = {};
  $scope.matchData = {};
  $scope.formData.scorecard = [];


  $scope.reasons = ['WP', 'RSC', 'RSC-I', 'DSQ', 'KO', 'WO', 'NC', 'Bye'];

  // STATUS LIST
  $scope.statusList = ["IsLive", "IsPending", "IsCompleted"];
  // STATUS LIST END


  // TO DELETE OPPONENT SINGLES
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
    $scope.constraints.opponentsSingle = data;
    console.log($scope.constraints, "in delete opponent constraints")
    NavigationService.apiCall($scope.url, $scope.constraints, function (data) {
      console.log(data);
      if (!data.data.error) {
        $scope.modalInstance.close();
        $state.reload();
        toastr.success("Opponent Deleted Successfully")
      } else if (data.data.error === "No Data Found") {
        toastr.error("Opponent Can't be Deleted", 'Error');
      }
    })
  }
  // TO DELETE OPPONENT SINGLES END

  // TO GET OPPONENT SINGLES
  $scope.singlesOpponent = function (data) {
    console.log("inside function", data);
    $scope.url = "Match/getIndividualPlayers"
    console.log($scope.matchDetails, "data in formData")
    if ($scope.matchDetails.opponentsSingle.length === 1) {
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
          key.sfaIdName = key.sfaId + '-' + key.name;
        });
      }
      console.log($scope.playerSignles, "playerSingles");
    });
  }
  // TO GET OPPONENT SINGLES END


  // SAVE OPPONENT SINGLE
  $scope.saveOpponentSingle = function (data) {
    console.log(data, "in save opponent")
    $scope.url = "Match/addPlayerToMatch"
    $scope.constraints = {};
    $scope.constraints.matchId = $stateParams.id;
    if (_.isPlainObject(data[0])) {
      console.log("in the object case")
      $scope.constraints.opponentsSingle = []
      $scope.opponent1 = data[0]._id;
      console.log($scope.opponent1, "this is opponent1");
      $scope.opponent2 = data[1];
      $scope.constraints.opponentsSingle.push($scope.opponent1, $scope.opponent2);
      console.log($scope.constraints, "in object case")
    } else {
      $scope.constraints.opponentsSingle = data
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
      } else if (data.data.error === "opponentsSingle have enough players") {
        toastr.error("Opponents have enough players", 'Error')
        $state.reload();
      } else if (data.data.error === "No Data Found") {
        toastr.error("Opponent Cannot be Added", 'Error');
      }

    });
    console.log($scope.constraints.opponentsSingle, "after in save")
  }
  // SAVE OPPONENT SINGLE END

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

  // GET ONE BACKEND
  $scope.getOneBackend = function () {
    $scope.matchData.matchId = $stateParams.id;
    console.log($scope.matchData, "match id")
    NavigationService.getOneBackend($scope.matchData, function (data) {
      console.log(data, "get data");
      $scope.sportId = data.data.sport._id;
      if (data.value == true) {
        $scope.matchDetails = data.data;
        $scope.matchDetails.matchId = $scope.matchData.matchId;
        $scope.formData = data.data;
        $scope.sportId = data.data.sport._id;

        $scope.sportName = $scope.formData.sport.sportslist.sportsListSubCategory.sportsListCategory.name;
        switch ($scope.sportName) {
          case "Combat Sports":
            if ($scope.formData.sport.sportslist.sportsListSubCategory.name === 'Fencing') {
              console.log("in switch fencing")
              $scope.formData.result = $scope.formData.resultFencing;
            } else {
              console.log("in switch")
              $scope.formData.result = $scope.formData.resultsCombat;
            }
            break;
          case "Racquet Sports":
            console.log("in racquet")
            $scope.formData.result = $scope.formData.resultsRacquet;
            break;
          case "Individual Sports":
            console.log("in chess")
            if ($scope.formData.sport.sportslist.name === "Carrom") {
              $scope.formData.result = $scope.formData.resultsCombat;
            } else {
              $scope.formData.result = $scope.formData.resultSwiss;
            }
        }

        _.each($scope.formData.opponentsSingle, function (key, index) {
          console.log($scope.formData.opponentsSingle, 'plr');
          if (key.athleteId.middleName == undefined) {
            key.athleteId.fullName = key.athleteId.firstName + ' ' + key.athleteId.surname;
          } else {
            key.athleteId.fullName = key.athleteId.firstName + ' ' + key.athleteId.middleName + ' ' + key.athleteId.surname;
          }

          // key.fullName = key.firstName + ' ' + key.surname;

          if ($scope.formData.resultsCombat) {
            _.each($scope.formData.resultsCombat.players, function (value) {
              key.noShow = value.noShow;
              key.walkover = value.walkover;
              _.each(value.sets, function (data) {
                key.point = data.point;
              })
            })
          } else if ($scope.formData.resultSwiss) {

            $scope.formData.resultSwiss.players[index].fullName = key.athleteId.fullName;
            if (key.athleteId.school) {
              $scope.formData.resultSwiss.players[index].schoolName = key.athleteId.school.name;
            }

          } else if ($scope.formData.resultFencing) {
            console.log("in fencing")
            if (key.athleteId.school) {
              $scope.formData.resultFencing.players[index].schoolName = key.athleteId.school.name;
            }
          }

        })
        // console.log($scope.formData)
        console.log($scope.sportId, "check sportid")
        $scope.singlesOpponent($scope.sportId);

      } else {
        console.log("ERROR IN getOneMatch");
        //redirect back to sportselection page
        // $state.go("sport-selection");
      }
    })
  };
  $scope.getOneBackend();


  $scope.dateOptions = {
    dateFormat: "dd/mm/yy",
    changeYear: true,
    changeMonth: true,
    yearRange: "1900:2050"
  };
  $scope.changeDate = function (data) {
    console.log("ChangeDate Called");
    $scope.formData.scheduleDate = data;
  };
  // GET MATCH END
  // BACK
  $scope.back = function () {
    $scope.obj = $.jStorage.get("detail")
    console.log($scope.obj, "in for cancel");
    $state.go('format-table', {
      type: $scope.obj.sportslist.drawFormat.name
    })
  }
  // BACK END
  // CHANGE OPPONENTS SINGLES
  $scope.changeOpponentSingles = function (id) {
    console.log(id, 'oppsingles id');
    console.log('loop for opp singles', $scope.matchDetails);
    _.each($scope.matchDetails.opponentsSingle, function (key) {
      console.log(key, 'in each')
      if (key.athleteId._id == id) {
        $scope.formData.result.winner.opponentsSingle = key._id;
      }

    })
  }
  // CHANGE OPPONENTS SINGLES END

  $scope.addField = function (data) {
    console.log('in add')
    $scope.formData.resultsRacquet.players[data].sets.push({
      'ace': '',
      'doubleFaults': '',
      'point': '',
      'serviceError': '',
      'unforcedError': '',
      'winner': ''

    })
  };

  $scope.removeField = function (data, index) {
    console.log(data, index, 'in remove')
    $scope.formData.resultsRacquet.players[data].sets.splice(index, 1);
  }
  // SAVE
  $scope.saveDataMatch = function () {
    $scope.formData.matchId = $stateParams.id;
    console.log($scope.formData, "save");
    $scope.obj = $.jStorage.get("detail")
    NavigationService.saveMatch($scope.formData, function (data) {
      console.log(data);
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

// FOR HEATS AND QUALIFYING SEE heats.js