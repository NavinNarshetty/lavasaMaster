// EVENT ATTENDANCE
myApp.controller('eventAttendanceCtrl', function ($scope, TemplateService, $state, NavigationService, $stateParams, toastr, $rootScope, $uibModal, $timeout, configService) {
  $scope.template = TemplateService.getHTML("content/event-attendance.html");
  TemplateService.title = "Attendance"; //This is the Title of the Website
  $scope.navigation = NavigationService.getNavigation();
  $scope.formData = {};
  $scope.athlete = false;

  // GENDER
  $scope.genderList = ['male', 'female', 'mixed'];
  // GENDER END

  // INDIVIDUAL ATHELTE
  $scope.getAthleteName = function () {
    NavigationService.getAthletesfaID(function (data) {
      console.log(data, 'athlete for individual')
      $scope.athleteData = data.data.data.results;
      $scope.athleteData.fullName = '';
      _.each($scope.athleteData, function (value) {
        if (value.middleName) {
          value.fullName = value.sfaId + ' - ' + value.firstName + ' ' + value.middleName + ' ' + value.surname;
        } else {
          value.fullName = value.sfaId + ' - ' + value.firstName + ' ' + value.surname;
        }
      })

      console.log($scope.athleteData, "check this athlete")
    });
  }
  $scope.getAthleteName();


  $scope.selectSchool = function (data) {
    console.log(data, "on select of school")
    if (data == undefined) {
      $scope.athlete = false;
    } else {
      $scope.athlete = true;
    }
    $scope.constraints = {};
    $scope.constraints.schoolId = data;
    $scope.constraints.input = ''
    $scope.url = 'EventBib/getAllAthleteBySchoolId'
    NavigationService.apiCallWithData($scope.url, $scope.constraints, function (data) {
      console.log(data, 'data of athlete fo selected school')
      $scope.selectAthleteData = data.data.results;
      _.each($scope.selectAthleteData, function (key) {
        if (key.middleName) {
          key.fullName = key.sfaId + ' - ' + key.firstName + ' ' + key.middleName + ' ' + key.surname;
        } else {
          key.fullName = key.sfaId + ' - ' + key.firstName + ' ' + key.surname;
        }
      })
    })

  }

  // INDIVIDUAL
  // GET ALL SPORTS
  $scope.getAllSports = function () {
    NavigationService.getSportsList(function (data) {
      console.log(data, "get all sports");
      $scope.sportList = data.data.data;
    });
  }
  $scope.getAllSports();
  // GET ALL SPORTS END

  // GET ALL AGE GROUP
  $scope.getAllAge = function () {
    NavigationService.getAllAgeGroups(function (data) {
      console.log(data, "get all age");
      $scope.ageGroups = data.data.data;
    });
  }
  $scope.getAllAge();

  // GET ALL AGE GROUP END

  // GET ALL SCHOOL
  $scope.getSchoolreg = function () {
    // $scope.constraints = {};
    // $scope.constraints.keyword = ''
    // $scope.url = 'school/search';
    NavigationService.getSchoolRegistration(function (data) {
      console.log(data, "get all school");
      $scope.schoolData = data.data.data.results;
      console.log($scope.schoolData, "check this")
    });
  }
  $scope.getSchoolreg();
  // GET ALL SCHOOL END


  // ng-change
  $scope.getTeam = function (data) {
    console.log(data, "ng-change")
    $scope.constraints = {};
    $scope.constraints.sportslist = data.sportslist;
    $scope.constraints.gender = data.gender;
    $scope.constraints.ageGroup = data.ageGroup;
    $scope.constraints.team = ''
    if ($scope.constraints.sportslist && $scope.constraints.gender && $scope.constraints.ageGroup) {
      $scope.getPerTeamFilter($scope.constraints);
    } else {
      console.log('')
    }

  }
  // ng-change end

  // TEAM AS PER FILTER
  $scope.getPerTeamFilter = function (constraints) {
    NavigationService.getPerTeamFilter(constraints, function (data) {
      console.log(data, 'team on filter')
      $scope.teamData = data.data.data;
      _.each($scope.teamData, function (key) {
        key.nameId = key.teamId + '-' + key.schoolName;
      })
    })
  }
  // TEAM AS PER FILTER END

  // VIEW PLAYER
  $scope.table = false
  $scope.viewPlayer = function (data) {
    $scope.table = true
    $scope.form = {}
    $scope.form.teamId = data.team //send team id 
    console.log(data, "view player data");
    NavigationService.getPlayerPerTeam($scope.form, function (data) {
      console.log(data, "table data");
      $scope.players = data.data.data;
      _.each($scope.players, function (value) {
        console.log(value, 'inside each value')
        console.log(value.studentId, 'inside each value middle')
        if (value.studentId != undefined) {
          if (value.studentId.middleName) {
            value.fullName = value.studentId.sfaId + ' ' + value.studentId.firstName + ' ' + value.studentId.middleName + ' ' + value.studentId.surname;
          } else {
            value.fullName = value.studentId.sfaId + ' ' + value.studentId.firstName + ' ' + value.studentId.surname;
          }
        }
        console.log($scope.players, "after each")
      })
    })
  }
  // VIEW PLAYER END

  // VIEW PROFILE

  // VIEW PROFILE END
});

// EVENT ATTENDANCE END


// EVENT ATTENDANCE PROFILE
myApp.controller('eventAttendanceProfileCtrl', function ($scope, TemplateService, $state, NavigationService, $stateParams, toastr, $rootScope, $uibModal, $timeout, configService) {
  $scope.template = TemplateService.getHTML("content/eventattendance-profile.html");
  TemplateService.title = "Athlete Profile"; //This is the Title of the Website
  $scope.navigation = NavigationService.getNavigation();

  if ($stateParams.id) {
    $scope.constraints = {}
    $scope.constraints._id = $stateParams.id;
    console.log($scope.constraints, 'id for profile get one')
    NavigationService.getteamAthleteID($scope.constraints, function (data) {
      console.log(data, "athlete profile data")
      $scope.playerDetail = data.data.data;
      if ($scope.playerDetail.isBib != undefined) {
        $scope.playerDetail.isBib = $scope.playerDetail.isBib.toString();
      }
      if ($scope.playerDetail.middleName) {
        $scope.playerDetail.fullName = $scope.playerDetail.firstName + ' ' + $scope.playerDetail.middleName + ' ' + $scope.playerDetail.surname;
      } else {
        $scope.playerDetail.fullName = $scope.playerDetail.firstName + ' ' + $scope.playerDetail.surname;
      }
    })

    $scope.saveBib = function (data) {
      console.log(data, 'save bib')
      console.log(data.isBib, 'save bib b')
      data.isBib = NavigationService.Boolean(data.isBib);
      $scope.saveDetail = {};
      $scope.saveDetail.isBib = data.isBib;
      $scope.saveDetail._id = data._id; //id for save
      $scope.url = 'Athelete/Save'
      NavigationService.apiCallWithData($scope.url, $scope.saveDetail, function (data) {
        console.log(data, 'savedata');
        if (data.data.nModified === 1) {
          $state.go('event-attendance')
        }
      })
    }
  }
});
// EVENT ATTENDANCE PROFILE END