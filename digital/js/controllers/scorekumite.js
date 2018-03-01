myApp.controller('KumiteScoreCtrl', function($scope, TemplateService, NavigationService, $timeout, $uibModal, $stateParams, $state, $interval, toastr, $rootScope) {
    $scope.template = TemplateService.getHTML("content/score-teamkumite.html");
    TemplateService.title = "Score Football"; //This is the Title of the Website
    $scope.navigation = NavigationService.getNavigation();
    // ************
    // JSONS
    $scope.match = {
            isTeam: true,
            sportsName: "Karate Team Kumite",
            age: "U-14",
            drawFormat: "League cum Knockout",
            gender: "female",
            prevMatch: [],
            stage: "League",
            minTeamPlayers: 3,
            maxTeamPlayers: 5,
            sportType: "Team Sports",
            resultKumite:{
              isDraw: false,
              isNoMatch: false,
              matchPhoto: [],
              scoreSheet: [],
              status: "",
              winner: {},
              teams: [{
                teamId: 'HA123',
                noShow: false,
                walkover: false,
                coach: "",
                schoolName: 'Telangana State School',
                teamResults: {
                  sets:[{
                    points: '12',
                    playerName: 'Ramu',
                    playerId: '2135464'
                  },{
                    points: '12',
                    playerName: 'Ramu',
                    playerId: '2135464'
                  },{
                    points: '12',
                    playerName: 'Ramu',
                    playerId: '2135464'
                  }],
                  finalPoints: ''
                },
                players: [{
                  sfaId: 'MA123',
                  player: '123456',
                  jerseyNo: "",
                  isPlaying: true,
                  noShow: false,
                  walkover: false,
                  color: "",
                  firstName: 'Jam',
                  surname: 'Prasad',
                  fullName: 'Jam Prasad'
                },{
                  sfaId: 'MA123',
                  player: '123456',
                  jerseyNo: "",
                  isPlaying: false,
                  noShow: false,
                  walkover: false,
                  color: "",
                  firstName: 'Jam',
                  surname: 'Prasad',
                  fullName: 'Jam Prasad 2'
                },{
                  sfaId: 'MA123',
                  player: '123456',
                  jerseyNo: "",
                  isPlaying: false,
                  noShow: false,
                  walkover: false,
                  color: "",
                  firstName: 'Jam',
                  surname: 'Prasad',
                  fullName: 'Jam Prasad 3'
                }]
              },{
                teamId: 'HA123',
                noShow: false,
                walkover: false,
                coach: "",
                schoolName: 'Silver Oaks School',
                teamResults: {
                  sets:[{
                    points: '12',
                    playerName: 'Ramu',
                    playerId: '2135464'
                  },{
                    points: '12',
                    playerName: 'Ramu',
                    playerId: '2135464'
                  },{
                    points: '12',
                    playerName: 'Ramu',
                    playerId: '2135464'
                  }],
                  finalPoints: ''
                },
                players: [{
                  sfaId: 'MA123',
                  player: '123456',
                  jerseyNo: "",
                  isPlaying: false,
                  noShow: false,
                  walkover: false,
                  color: "",
                  firstName: 'Ram',
                  surname: 'Prasad',
                  fullName: 'Ram Prasad'
                },{
                  sfaId: 'MA123',
                  player: '123456',
                  jerseyNo: "",
                  isPlaying: false,
                  noShow: false,
                  walkover: false,
                  color: "",
                  firstName: 'Ram',
                  surname: 'Prasad',
                  fullName: 'Ram Prasad 2'
                },{
                  sfaId: 'MA123',
                  player: '123456',
                  jerseyNo: "",
                  isPlaying: false,
                  noShow: false,
                  walkover: false,
                  color: "",
                  firstName: 'Ram',
                  surname: 'Prasad',
                  fullName: 'Ram Prasad 3'
                }]
              }],
            }

        }
        console.log("match", $scope.match);
        // JSONS END
        // ************
})
