myApp.controller('headerCtrl', function ($scope, TemplateService, $state) {
    $scope.template = TemplateService;
    $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
        $(window).scrollTop(0);
    });
    $.fancybox.close(true);
    // INITIALISE VARIABLES
    $scope.user = $.jStorage.get("user");
    $scope.logoutShow = false;

    // INITIALISE VARIABLES END
    // FUNCTIONS
    // CHECK FOR LOGGED IN
    if ($scope.user != null || $scope.user != undefined) {
      $scope.logoutShow = true;
    } else {
      if ($state.current.name != "home") {
        $state.go('home');
        $scope.logoutShow = false;
      }
    }
    // CHECK FOR LOGGED IN  END
    // LOGOUT
    $scope.logoutDigital = function(){
      console.log('LOGOUT');
      $.jStorage.set("user", null);
      $scope.logoutShow = false;
      $state.go('home');
    }
    // LOGOUT END
    // FUNCTIONS END
});