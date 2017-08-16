myApp.controller('CombatScoreCtrl', function($scope, TemplateService, NavigationService, $timeout, $uibModal, $stateParams) {
    $scope.template = TemplateService.getHTML("content/score-combat.html");
    TemplateService.title = "Score Combat"; //This is the Title of the Website
    $scope.navigation = NavigationService.getNavigation();

    // VARIABLE INITIALISE
    $scope.showScoreSheet = false;
    $scope.showMatchPhoto = false;
    $scope.matchData = {};
    // $scope.matchData = {};
    // VARIABLE INITIALISE END

    // API CALLN INTEGRATION
    // GET MATCH
    $scope.getOneMatch = function() {
        $scope.matchData.matchId = $stateParams.id;
        NavigationService.getOneMatch($scope.matchData, function(data) {
            if (data.value == true) {
                $scope.match = data.data;
                $scope.match.matchId = $scope.matchData.matchId;
            } else {
                console.log("ERROR IN getOneMatch");
            }
        })
    };
    $scope.getOneMatch();
    // GET MATCH END
    // API CALLN INTEGRATION END

    // MATCH JSON
    $scope.match = {
        id: 123,
        matchId: 123456,
        sportsName: 'judo-u-16-male-round 1',
        players: [{
            _id: 1,
            sfaId: 1234,
            firstName: 'Shivveeraj',
            surname: 'ShikaWat',
            school: {
                name: 'Jamnabai Shivveeraj Singh ShikaWat school'
            },
        }, {
            _id: 2,
            sfaId: 1234,
            firstName: 'Shivveeraj',
            surname: 'ShikaWat',
            school: {
                name: 'Jamnabai Shivveeraj Singh ShikaWat school'
            },
            sets: [{
                point: 0,
            }]
        }],
        resultsCombat: {
            players: [{
                _id: 1,
                sets: [{
                    point: 0
                }]
            }, {
                _id: 2,
                sets: [{
                    point: 0
                }]
            }],
            matchPhoto: [{
                image: 'img/dishapatani1.jpg'
            }, {
                image: 'img/dishapatani1.jpg'
            }, {
                image: 'img/dishapatani1.jpg'
            }],
            scoreSheet: [],
            winner: {}
        }
    };
    // MATCH JSON END

    $scope.reasons = ['WP', 'RSC', 'RSC-I', 'DSQ', 'KO', 'WO', 'NC'];

    // SCORE INCREMENT
    $scope.incrementScore = function(set, model) {
        $scope.set = set;
        switch (model) {
            case 'point':
                $scope.set.point = $scope.set.point + 1;
                break;
        }
        console.log("increment");
    };
    // SCORE INCREMENT END
    // SCORE DECREMENT
    $scope.decrementScore = function(set, model) {
        $scope.set = set;
        switch (model) {
            case 'point':
                if ($scope.set.point > 0) {
                    $scope.set.point = $scope.set.point - 1;
                }
                break;
        }
        console.log("decrement");
    };
    // SCORE DECREMENT END
    // REMOVE MATCH SCORESHEET
    $scope.removeMatchScore = function(pic, type) {
      switch (type) {
        case 'matchPhoto':
          _.remove($scope.match.resultsCombat.matchPhoto, function(n) {
              return n.image === pic.image;
          })
        break;
        case 'scoreSheet':
          _.remove($scope.match.resultsCombat.scoreSheet, function(n) {
            return n.image === pic.image;
          })
        break;
      }
    }
        // REMOVE MATCH SCORESHEET END
})
