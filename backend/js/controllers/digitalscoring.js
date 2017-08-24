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

  $scope.formData = {
    "isTeam": true,
    "sportsName": "Badminton Doubles",
    "age": "U-13",
    "gender": "male",
    "sportType": "Racquet Sports",
    "teams": [{
        "_id": "599c3321e3ac9c213d37b5a8",
        "name": "Lady Ratanbai & Sir Mathuradas Vissanji Academy-Badminton Doubles-U-13-Male",
        "sport": "594cf3d57779072cb65c352e",
        "school": "5926ef64d12134147e80ceb4",
        "schoolName": "Lady Ratanbai & Sir Mathuradas Vissanji Academy",
        "createdBy": "School",
        "teamId": "MT1790",
        "studentTeam": [{
            "_id": "599c3321e3ac9c213d37b5a9",
            "createdAt": "2017-08-22T13:35:29.605Z",
            "updatedAt": "2017-08-22T13:35:29.605Z",
            "teamId": "599c3321e3ac9c213d37b5a8",
            "sport": "594cf3d57779072cb65c352e",
            "studentId": {
              "_id": "5926ec17d12134147e80ce7e",
              "school": "57a9a5fb8ac8bd0c117dacc6",
              "surname": "sahab",
              "firstName": "Maya",
              "dob": "2005-05-09T18:30:00.000Z",
              "city": "Kalyan-Dombivali",
              "sfaId": "MA1620000"
            },
            "isCaptain": false,
            "isGoalKeeper": false,
            "perSportUniqueId": "599c3321e3ac9c213d37b5a8594cf3d57779072cb65c352e",
            "__v": 0
          },
          {
            "_id": "599c3321e3ac9c213d37b5aa",
            "createdAt": "2017-08-22T13:35:29.616Z",
            "updatedAt": "2017-08-22T13:35:29.616Z",
            "teamId": "599c3321e3ac9c213d37b5a8",
            "sport": "594cf3d57779072cb65c352e",
            "studentId": {
              "_id": "59302cae96966b0686c2d582",
              "school": "57a9a5fb8ac8bd0c117dacc6",
              "surname": "Ambani",
              "firstName": "Mukesh",
              "dob": "2006-04-30T18:30:00.000Z",
              "photograph": "592678017ee12e24adc29947.jpg",
              "city": "Vasai-Virar",
              "sfaId": "MA171"
            },
            "isCaptain": false,
            "isGoalKeeper": false,
            "perSportUniqueId": "599c3321e3ac9c213d37b5a8594cf3d57779072cb65c352e",
            "__v": 0
          }
        ]
      },
      {
        "_id": "599c33e7e3ac9c213d37b5b1",
        "name": "Jamnabai Narsee School-Badminton Doubles-U-13-Male",
        "sport": "594cf3d57779072cb65c352e",
        "school": "595385929af4299cd967efb8",
        "schoolName": "Jamnabai Narsee School",
        "createdBy": "School",
        "teamId": "MT1793",
        "studentTeam": [{
            "_id": "599c33e7e3ac9c213d37b5b2",
            "createdAt": "2017-08-22T13:38:47.935Z",
            "updatedAt": "2017-08-22T13:38:47.935Z",
            "teamId": "599c33e7e3ac9c213d37b5b1",
            "sport": "594cf3d57779072cb65c352e",
            "studentId": {
              "_id": "59267152797a292dc186ec98",
              "school": "5797369b667cd1715dfa326d",
              "surname": "rahi",
              "firstName": "rahi",
              "middleName": "rahi",
              "dob": "2004-12-31T18:30:00.000Z",
              "photograph": "592670ed797a292dc186ec8b.jpg",
              "city": "Kalyan-Dombivali",
              "sfaId": "MA175"
            },
            "isCaptain": false,
            "isGoalKeeper": false,
            "perSportUniqueId": "599c33e7e3ac9c213d37b5b1594cf3d57779072cb65c352e",
            "__v": 0
          },
          {
            "_id": "599c33e7e3ac9c213d37b5b3",
            "createdAt": "2017-08-22T13:38:47.947Z",
            "updatedAt": "2017-08-22T13:38:47.947Z",
            "teamId": "599c33e7e3ac9c213d37b5b1",
            "sport": "594cf3d57779072cb65c352e",
            "studentId": {
              "_id": "5940cfac8d3a2259febad3a1",
              "school": "5797369b667cd1715dfa326d",
              "surname": "Marry",
              "firstName": "Jane",
              "photograph": "5940ce3d8d3a2259febad392.pdf",
              "dob": "2004-12-31T18:30:00.000Z",
              "city": "Vasai-Virar",
              "sfaId": "MA1719"
            },
            "isCaptain": false,
            "isGoalKeeper": false,
            "perSportUniqueId": "599c33e7e3ac9c213d37b5b1594cf3d57779072cb65c352e",
            "__v": 0
          }
        ]
      }
    ],
    "resultsCombat": "",
    "resultsRacquet": {
      "players": [],
      "matchPhoto": [],
      "scoreSheet": [],
      "status": "IsLive"
    }
  };
})
// EDIT TEAM END