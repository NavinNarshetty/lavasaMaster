myApp.controller('MatchStartCtrl', function ($scope, TemplateService, NavigationService, $timeout, $uibModal) {
        $scope.template = TemplateService.getHTML("content/match-start.html");
        TemplateService.title = "Sport Match"; //This is the Title of the Website
        $scope.navigation = NavigationService.getNavigation();
        $scope.players = [{
          id: '1',
          name: 'Shiva Singh',
          school: 'Jamnabai school'
        },{
          id: '2',
          name: 'Shiva Singh',
          school: 'Jamnabai school'
        }];
        $scope.showNoMatch = function(){
          $uibModal.open({
            animation: true,
            scope: $scope,
            backdrop: 'static',
            keyboard: false,
            templateUrl: 'views/modal/match-nomatch.html',
            size: 'lg',
            windowClass: 'match-nomatch'
          })
        }



      })
