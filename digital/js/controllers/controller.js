myApp.controller('HomeCtrl', function($scope, TemplateService, NavigationService, $timeout, $uibModal, toastr, $state) {
    $scope.template = TemplateService.getHTML("content/home.html");
    TemplateService.title = "Home"; //This is the Title of the Website
    $scope.navigation = NavigationService.getNavigation();

    // INITIALISE VARIABLES
    $scope.user = $.jStorage.get("user");
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
    var abc = _.times(100, function(n) {
        return n;
    });

    var i = 0;
    $scope.buttonClick = function() {
        i++;
        console.log("This is a button Click");
    };
    // FUNCTIONS END

    // DEMO STUFF
    $scope.tableOption = function() {
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
        // ROTATE FUNCTION
        $scope.image = 'img/dishapatani1.jpg';
        var img = null;
        var  canvas = null;
        $scope.resultImage = "";
        $scope.showResult = false;

        $scope.rotateImage = function(degree) {
            if (document.getElementById('canvas')) {
                var cContext = canvas.getContext('2d');
                // TAKE WIDTH AND HEIGHT YOU WANT TO SET FOR IMAGE
                var imgWidth, imgHeight;
                var cw = $(img).width(),
                    ch = $(img).height(),
                    cx = 0,
                    cy = 0;

                //   Calculate new canvas size and x/y coorditates for image
                switch (degree) {
                    case 90:
                        cw = $(img).height();
                        ch = $(img).width();
                        cy = $(img).height() * (-1);
                        break;
                    case 180:
                        cx = $(img).width() * (-1);
                        cy = $(img).height() * (-1);
                        break;
                    case 270:
                        cw = $(img).height();
                        ch = $(img).width();
                        cx = $(img).width() * (-1);
                        break;
                }

                //  Rotate image
                canvas.setAttribute('width', cw);
                canvas.setAttribute('height', ch);
                cContext.rotate(degree * Math.PI / 180);
                cContext.drawImage(img, cx, cy, cw, ch);
                var result = canvas.toDataURL("image/png")
                $scope.resultImage = result;
                $('#download').attr('href', $scope.resultImage)
            }
            // else {
            //     //  Use DXImageTransform.Microsoft.BasicImage filter for MSIE
            //     switch (degree) {
            //         case 0:
            //             image.style.filter = 'progid:DXImageTransform.Microsoft.BasicImage(rotation=0)';
            //             break;
            //         case 90:
            //             image.style.filter = 'progid:DXImageTransform.Microsoft.BasicImage(rotation=1)';
            //             break;
            //         case 180:
            //             image.style.filter = 'progid:DXImageTransform.Microsoft.BasicImage(rotation=2)';
            //             break;
            //         case 270:
            //             image.style.filter = 'progid:DXImageTransform.Microsoft.BasicImage(rotation=3)';
            //             break;
            //     }
            // }
        }
        $scope.saveImage =  function(){
          console.log('save');
          $scope.image = $scope.resultImage;
          $scope.showResult = true;
        }
        $scope.rotateStart = function(){
          $scope.showResult = false;
        }

        $scope.$on('$viewContentLoaded', function (event) {
          $timeout(function () {
            //  Initialize image and canvas
            img = document.getElementById('rotateimg');
            canvas = document.getElementById('canvas');

            if (!canvas || !canvas.getContext) {
                canvas.parentNode.removeChild(canvas);
                // img.style.position = 'absolute';
                // img.style.visibility = 'hidden';
            } else {
                img.style.position = 'absolute';
                img.style.visibility = 'hidden';
            }
            $scope.rotateImage(0);

            //  Handle clicks for control links
            // $scope.rotateImage(deg);
          }, 100);
        })
        // ROTATE FUNCTION END
})

.controller('FormCtrl', function($scope, TemplateService, NavigationService, $timeout, toastr, $http) {
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
        $scope.submitForm = function(data) {
            console.log("This is it");
            return new Promise(function(callback) {
                $timeout(function() {
                    callback();
                }, 5000);
            });
        };
    })
    .controller('GridCtrl', function($scope, TemplateService, NavigationService, $timeout, toastr, $http) {
        $scope.template = TemplateService.getHTML("content/grid.html");
        TemplateService.title = "Grid"; // This is the Title of the Website
        $scope.navigation = NavigationService.getNavigation();
    })

// Example API Controller
.controller('DemoAPICtrl', function($scope, TemplateService, apiService, NavigationService, $timeout) {
    apiService.getDemo($scope.formData, function(data) {
        console.log(data);
    });
});
