// DETAIL HEATS
myApp.controller('DetailHeatCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, toastr, $uibModal) {
  //Used to name the .html file
  $scope.template = TemplateService.changecontent("detailheat");
  $scope.menutitle = NavigationService.makeactive("Detail Heat");
  TemplateService.title = $scope.menutitle;
  $scope.navigation = NavigationService.getnav();
  $scope.matchData = {};
  $scope.formData = {};
  $scope.high = [];

  // STATUS LIST END
  $scope.getOneBackend = function () {
    $scope.matchData.matchId = $stateParams.id;
    NavigationService.getOneBackend($scope.matchData, function (data) {
      if (data.value == true) {
        $scope.matchDetails = data.data;
        $scope.matchDetails.matchId = $scope.matchData.matchId;
        $scope.formData = data.data;
        $scope.formData.scheduleTime = new Date();
        console.log($scope.formData, "form")


        // })

        // console.log($scope.formData, "****************form")
        _.each($scope.formData.opponentsSingle, function (key) {
          // console.log($scope.formData.players, 'plr');
          key.sfaId = key.athleteId.sfaId;
          key.schoolname = key.athleteId.school.name
          if (key.athleteId.middleName == undefined) {
            key.fullname = key.athleteId.firstName + ' ' + key.athleteId.surname
          } else {
            key.fullname = key.athleteId.firstName + ' ' + key.middleName + ' ' + key.athleteId.surname
          }
          // $scope.formData.resultHeat.players[i]
        });
        var i = 0;
        if ($scope.formData.resultHeat) {
          _.each($scope.formData.resultHeat.players, function (n) {
            // console.log("******", n);
            if (n.id) {
              n.fullname = $scope.formData.opponentsSingle[i].fullname;
              n.sfaId = $scope.formData.opponentsSingle[i].sfaId;
              n.schoolname = $scope.formData.opponentsSingle[i].schoolname;
              i++;
            } else {
              n.fullname = "-";
              n.sfaId = "-";
              n.schoolname = "-";
            }
          });
        }



        console.log($scope.formData)



      } else {
        console.log("ERROR IN getOneMatch");
        //redirect back to sportselection page
        // $state.go("sport-selection");
      }
    })
  };
  $scope.getOneBackend();
  console.log($scope.formData, "last");
  // GET MATCH END

  // SAVE
  $scope.saveDataMatch = function () {
    console.log($scope.formData, "save");
    // result.result = $scope.formData.resultHeat;
    // $scope.obj = $.jStorage.get("detail")
    if ($scope.formData.resultHeat) {
      _.each($scope.formData.resultHeat.players, function (key) {
        key.show = false;
      })
    } else {
      console.log("in else and save")
    }

    NavigationService.saveMatch($scope.formData, function (data) {
      if (data.value == true) {
        console.log("in")
        console.log($scope.formData, "suksha");



        // $scope.draw = $scope.data.sport.sportslist.drawFormat.name
        // console.log(draw, "in draw")
        // toastr.success("Data saved successfully", 'Success');
        $state.go('format-table', {
          type: $scope.formData.sport.sportslist.drawFormat.name
        });
      } else {
        toastr.error("Data save failed ,please try again or check your internet connection", 'Save error');
      }
    })

  }
  // SAVE-END

  // EDIT
  $scope.editHeat = function (index) {
    console.log(index)
    $scope.formData.resultHeat.players[index].show = true;
  }
  // END EDIT

  // CANCEL
  $scope.cancelHeat = function (data) {
    // $state.go
    $state.go('format-table', {
      type: data
    })
  }
  // CANCEL END
  $scope.confDel = function (data) {
    $scope.id = data;
    console.log(data, "in modal")
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
      console.log(data, 'deleteeeeeeeeeeeeeeeeeeeeeeeee');
      if (data.value) {
        toastr.success('Successfully Deleted', 'Age Group Message');
        $scope.modalInstance.close();
      } else {
        toastr.error('Something Went Wrong while Deleting', 'Age Group Message');
      }
    });
  }
})
// DETAIL HEATS END


// DETAIL QUALIFYING
myApp.controller('DetailQualifyingCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, toastr) {
  //Used to name the .html file
  $scope.template = TemplateService.changecontent("detailqualifying");
  $scope.menutitle = NavigationService.makeactive("Detail Qualifying");
  TemplateService.title = $scope.menutitle;
  $scope.navigation = NavigationService.getnav();
  $scope.matchData = {};
  $scope.formData = {};

  // STATUS LIST END
  $scope.getOneBackend = function () {
    $scope.matchData.matchId = $stateParams.id;
    NavigationService.getOneBackend($scope.matchData, function (data) {
      if (data.value == true) {
        $scope.matchDetails = data.data;
        $scope.matchDetails.matchId = $scope.matchData.matchId;
        $scope.formData = data.data;
        $scope.sportName = data.data.sport.sportslist.sportsListSubCategory.name
        $scope.formData.scheduleTime = new Date();
        console.log($scope.formData, "form")


        // FOR ARCHERY
        if ($scope.sportName === 'Archery') {

          _.each($scope.formData.opponentsSingle, function (key) {
            console.log(key, 'new')
            key.sfaId = key.athleteId.sfaId;
            key.schoolname = key.athleteId.school.name
            if (key.athleteId.middleName == undefined || key.athleteId.middleName == '') {
              key.fullname = key.athleteId.firstName + ' ' + key.athleteId.surname;
            } else {
              key.fullname = key.athleteId.firstName + ' ' + key.athleteId.middleName + ' ' + key.athleteId.surname;
            }
          })
          if ($scope.formData.excelType === 'knockout') {
            $scope.formData.result = $scope.formData.resultKnockout;
          } else if ($scope.formData.excelType === 'qualifying') {
            $scope.formData.result = $scope.formData.resultQualifyingRound;
          }
        }
        // FOR ARCHERY END

        // })
        console.log($scope.formData, "****************form")
        if ($scope.formData.resultQualifyingRound && $scope.formData.sport.sportslist.sportsListSubCategory.sportsListCategory.name === 'Individual Sports') {
          console.log("SHOULD NOT BE HERE")
          _.each($scope.formData.opponentsSingle, function (key) {
            // console.log($scope.formData.players, 'plr');
            key.sfaId = key.athleteId.sfaId;
            key.schoolname = key.athleteId.school.name
            $scope.formData.resultQualifyingRound.player.schoolname = key.schoolname
            $scope.formData.resultQualifyingRound.player.sfaId = key.sfaId
            if (key.athleteId.middleName == undefined || key.athleteId.middleName == '') {
              key.fullname = key.athleteId.firstName + ' ' + key.athleteId.surname
              $scope.formData.resultQualifyingRound.player.fullname = key.fullname;
            } else {
              key.fullname = key.athleteId.firstName + ' ' + key.middleName + ' ' + key.athleteId.surname
              $scope.formData.resultQualifyingRound.player.fullname = key.fullname;
            }
          });
          var i = 0;
          _.each($scope.formData.resultQualifyingRound.player.attempt, function (n) {
            console.log("******", n);
            if (i == 0) {
              $scope.formData.resultQualifyingRound.player.set = n;
              i++;
            } else {
              $scope.formData.resultQualifyingRound.player.set = $scope.formData.resultQualifyingRound.player.set + ',' + n;
            }
          });


          console.log($scope.formData)

        } else if ($scope.formData.resultShooting) {
          if ($scope.formData.opponentsSingle[0].athleteId.middleName == undefined) {
            $scope.formData.opponentsSingle[0].athleteId.fullname = $scope.formData.opponentsSingle[0].athleteId.firstName + ' ' + $scope.formData.opponentsSingle[0].athleteId.surname;
          } else {
            $scope.formData.opponentsSingle[0].athleteId.fullname = $scope.formData.opponentsSingle[0].athleteId.firstName + ' ' + $scope.formData.opponentsSingle[0].athleteId.middleName + ' ' + $scope.formData.opponentsSingle[0].athleteId.surname;
          }
        }

      } else {
        console.log("ERROR IN getOneMatch");
        //redirect back to sportselection page
        // $state.go("sport-selection");
      }
    })
  };
  $scope.getOneBackend();
  console.log($scope.formData, "last");
  // GET MATCH END

  // SAVE
  $scope.saveDataMatch = function () {
    console.log($scope.formData, "save");
    NavigationService.saveMatch($scope.formData, function (data) {
      if (data.value == true) {
        // console.log("in")
        // console.log($scope.formData, "suksha");
        $scope.show = false;
        toastr.success("Data saved successfully", 'Success');
        $state.go('format-table', {
          type: $scope.formData.sport.sportslist.drawFormat.name
        })
      } else {
        toastr.error("Data save failed ,please try again or check your internet connection", 'Save error');
      }
    })

  }
  // SAVE-END

  // CANCEL
  $scope.cancelQualifying = function (data) {
    // $state.go
    $state.go('format-table', {
      type: data
    })
  }
  // CANCEL END
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

  $scope.heat = [{
    sfaId: 1234,
    name: "shiva",
    school: "joseph",
    time: 10,
    result: "Q"
  }, {
    sfaId: 1234,
    name: "shiva",
    school: "joseph",
    time: 10,
    result: "Q"
  }, {
    sfaId: 1234,
    name: "shiva",
    school: "joseph",
    time: 10,
    result: "Q"
  }]
  $scope.editHeat = function () {
    $scope.show = true;
  }

})

// DETAIL QUALIFYING END