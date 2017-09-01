// DETAIL MATCHES
myApp.controller('DetailMatchesCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, toastr) {
  //Used to name the .html file
  $scope.template = TemplateService.changecontent("detailmatch");
  $scope.menutitle = NavigationService.makeactive("Detail Match");
  TemplateService.title = $scope.menutitle;
  $scope.navigation = NavigationService.getnav();
})

// DETAIL MATCHES END


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

  // SAVE
  $scope.saveDataMatch = function () {
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
})

// DETAIL TEAM SPORT