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
        console.log($scope.formData, "****************form")
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
        _.each($scope.formData.resultHeat.players, function (n) {
          console.log("******", n);
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
    $scope.result = {};
    // result.result = $scope.formData.resultHeat;
    // $scope.obj = $.jStorage.get("detail")
    _.each($scope.formData.resultHeat.players, function (key) {
      key.show = false;
    })
    NavigationService.saveMatch($scope.formData, function (data) {
      if (data.value == true) {
        console.log("in")
        console.log($scope.formData, "suksha");
        $scope.getOneBackend()


        // $scope.draw = $scope.data.sport.sportslist.drawFormat.name
        // console.log(draw, "in draw")
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


  $scope.heat = [{
    laneno: 1,
    sfaId: 1234,
    name: "shiva",
    school: "joseph",
    time: 10,
    result: "Q"
  }, {
    laneno: 1,
    sfaId: 1234,
    name: "shiva",
    school: "joseph",
    time: 10,
    result: "Q"
  }, {
    laneno: 1,
    sfaId: 1234,
    name: "shiva",
    school: "joseph",
    time: 10,
    result: "Q"
  }]
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
        $scope.formData.scheduleTime = new Date();
        console.log($scope.formData, "form")


        // })
        console.log($scope.formData, "****************form")
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
          // $scope.formData.resultHeat.players[i]
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
        console.log("in")
        console.log($scope.formData, "suksha");
        $scope.show = false;


        // $scope.draw = $scope.data.sport.sportslist.drawFormat.name
        // console.log(draw, "in draw")
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