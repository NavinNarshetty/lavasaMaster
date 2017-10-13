myApp.controller('HomeCtrl', function ($scope, TemplateService, NavigationService, $timeout, $uibModal, toastr, $state ) {
        $scope.template = TemplateService.getHTML("content/home.html");
        TemplateService.title = "Home"; //This is the Title of the Website
        $scope.navigation = NavigationService.getNavigation();

        // INITIALISE VARIABLES
        $scope.user = $.jStorage.get("user");
        console.  log($state);
        $scope.login = {};
        $scope.admin = {
          "email": "digital@sfanow.in",
          "password": "12345678"
        }
        // INITIALISE VARIABLES END

        // FUNCTIONS
        // LOGIN POPUP CONTROLLER
        $scope.loginPopup = function(){
          $uibModal.open({
            animation: true,
            scope: $scope,
            backdrop: 'static',
            keyboard: false,
            templateUrl: 'views/modal/login-popup.html',
            size: 'md',
            windowClass: 'loginpopup'
          })
        }
        $scope.loginSubmit = function(login){
          $scope.dataResult = {
            "data": "",
            "value": false
          }
          if (login) {
            if (login.email == $scope.admin.email) {
              if (login.password == $scope.admin.password) {
                // EMAIL AND PASSWORD SUCCESS
                $scope.showError = false;
                $scope.dataResult = {
                  "data": login,
                  "value": true
                }
                $.jStorage.set("user", $scope.dataResult.data.email);
                $state.go("digital-home");
                toastr.success('Login Successfull');
                // EMAIL AND PASSWORD SUCCESS END
              } else{
                // PASSWORD ERROR
                toastr.error('Please check Password entered', 'Login Failed');
                console.log($scope.dataResult, "password Fail");
                // PASSWORD ERROR END
              }
            } else{
              // EMAIL ERROR
              $scope.dataResult = {
                "data": "Please check the Email entered.",
                "value": false
              }
              toastr.error('Please check Email entered', 'Login Failed');
              console.log($scope.dataResult, "email Fail");
              // EMAIL ERROR END
            }
          }
        }
        // LOGIN POPUP CONTROLLER END
        // CHECK FOR LOGGED IN
        if ($scope.user != null || $scope.user != undefined) {
          console.log('hello');
        } else {
          $scope.loginPopup();
        }
        // CHECK FOR LOGGED IN  END
        var abc = _.times(100, function (n) {
            return n;
        });

        var i = 0;
        $scope.buttonClick = function () {
            i++;
            console.log("This is a button Click");
        };
        // FUNCTIONS END

        // DEMO STUFF
        $scope.tableOption = function(){
          $uibModal.open({
            animation: true,
            scope: $scope,
            // backdrop: 'static',
            keyboard: false,
            templateUrl: 'views/modal/result-rank.html',
            // size: 'lg',
            windowClass: 'match-nomatch'
          })
        }
        // DEMO STUFF END

    })

    .controller('FormCtrl', function ($scope, TemplateService, NavigationService, $timeout, toastr, $http) {
        $scope.template = TemplateService.getHTML("content/form.html");
        TemplateService.title = "Form"; //This is the Title of the Website
        $scope.navigation = NavigationService.getNavigation();
        $scope.formSubmitted = false;
        // $scope.data = {
        //     name: "Chintan",
        //     "age": 20,
        //     "email": "chinyan@wohlig.com",
        //     "query": "query"
        // };
        $scope.submitForm = function (data) {
            console.log("This is it");
            return new Promise(function (callback) {
                $timeout(function () {
                    callback();
                }, 5000);
            });
        };
    })
    .controller('GridCtrl', function ($scope, TemplateService, NavigationService, $timeout, toastr, $http) {
        $scope.template = TemplateService.getHTML("content/grid.html");
        TemplateService.title = "Grid"; // This is the Title of the Website
        $scope.navigation = NavigationService.getNavigation();
    })

    // Example API Controller
    .controller('DemoAPICtrl', function ($scope, TemplateService, apiService, NavigationService, $timeout) {
        apiService.getDemo($scope.formData, function (data) {
            console.log(data);
        });
    });
