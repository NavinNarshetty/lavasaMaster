myApp.controller('BasketballScoreCtrl', function ($scope, TemplateService, NavigationService, $timeout, $uibModal, $stateParams, $state, $interval, toastr) {
  $scope.template = TemplateService.getHTML("content/scorebasketball.html");
  TemplateService.title = "Score Basketball"; //This is the Title of the Website
  $scope.navigation = NavigationService.getNavigation();





  // JSON
  $scope.match = {
    matchId: '123456',
    sportsName: 'Basketball',
    age: 'u-11',
    gender: 'female',
    round: 'final',
    minPlayers: 4,
    resultBasketball: {
      team: [{
        teamId: '987654',
        teamResults: {
          quarterPoints: [{
            basket: 20,
          }],
          finalGoalPoints: 22,
        },
        players: [{
          name: 'hello',
          isPlaying: true,
          jerseyNo: 1,
          noShow: true,
          walkover: true,
          color: "Blue/Red",
          playerPoints: {
            freeThrow: [{
              count: 1,
              time: 11
            }],
            Points2: [{
              count: 1,
              time: 11

            }],
            Points3: [{
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
          isPlaying: true,
          jerseyNo: 1,
          noShow: true,
          walkover: true,
          color: "Blue/Red",
          playerPoints: {
            freeThrow: [{
              count: 1,
              time: 11
            }],
            Points2: [{
              count: 1,
              time: 11

            }],
            Points3: [{
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
          isPlaying: true,
          jerseyNo: 1,
          noShow: true,
          walkover: true,
          color: "Blue/Red",
          playerPoints: {
            freeThrow: [{
              count: 1,
              time: 11
            }],
            Points2: [{
              count: 1,
              time: 11

            }],
            Points3: [{
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
      }, {
        teamId: '124358',
        teamResults: {
          quarterPoints: [{
            basket: 20,
          }],
          finalGoalPoints: 22,
        },
        players: [{
          name: 'hello',
          isPlaying: true,
          jerseyNo: 1,
          noShow: true,
          walkover: true,
          color: "Blue/Red",
          playerPoints: {
            freeThrow: [{
              count: 1,
              time: 11
            }],
            Points2: [{
              count: 1,
              time: 11

            }],
            Points3: [{
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
          isPlaying: true,
          jerseyNo: 1,
          noShow: true,
          walkover: true,
          color: "Blue/Red",
          playerPoints: {
            freeThrow: [{
              count: 1,
              time: 11
            }],
            Points2: [{
              count: 1,
              time: 11

            }],
            Points3: [{
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
          isPlaying: true,
          jerseyNo: 1,
          noShow: true,
          walkover: true,
          color: "Blue/Red",
          playerPoints: {
            freeThrow: [{
              count: 1,
              time: 11
            }],
            Points2: [{
              count: 1,
              time: 11

            }],
            Points3: [{
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
      }],

      isNoMatch: true,
      isDraw: true,
      winnner: [{
        team: 12211,
        reason: "",
      }],
      matchPhoto: ["6732673862837342323423.jpg"],
      status: "IsLive,IsPending,IsCompleted",
      scoreSheet: ["588372837289379283789.jpg"]
    }
  }
  // JSON END
});