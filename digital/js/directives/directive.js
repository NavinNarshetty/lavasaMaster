myApp.directive('img', function ($compile, $parse) {
        return {
            restrict: 'E',
            replace: false,
            link: function ($scope, element, attrs) {
                var $element = $(element);
                if (!attrs.noloading) {
                    $element.after("<img src='img/loading.gif' class='loading' />");
                    var $loading = $element.next(".loading");
                    $element.load(function () {
                        $loading.remove();
                        $(this).addClass("doneLoading");
                    });
                } else {
                    $($element).addClass("doneLoading");
                }
            }
        };
    })

    .directive('hideOnScroll', function ($document) {
        return {
            restrict: 'EA',
            replace: false,
            link: function (scope, element, attr) {
                var $element = $(element);
                var lastScrollTop = 0;
                $(window).scroll(function (event) {
                    var st = $(this).scrollTop();
                    if (st > lastScrollTop) {
                        $(element).addClass('nav-up');
                    } else {
                        $(element).removeClass('nav-up');
                    }
                    lastScrollTop = st;
                });
            }
        };
    })


    .directive('fancybox', function ($document) {
        return {
            restrict: 'EA',
            replace: false,
            link: function (scope, element, attr) {
                var $element = $(element);
                var target;
                if (attr.rel) {
                    target = $("[rel='" + attr.rel + "']");
                } else {
                    target = element;
                }

                target.fancybox({
                    openEffect: 'fade',
                    closeEffect: 'fade',
                    closeBtn: true,
                    padding: 0,
                    helpers: {
                        media: {}
                    }
                });
            }
        };
    })

    .directive('autoHeight', function ($compile, $parse) {
        return {
            restrict: 'EA',
            replace: false,
            link: function ($scope, element, attrs) {
                var $element = $(element);
                var windowHeight = $(window).height();
                $element.css("min-height", windowHeight);
            }
        };
    })

    .directive('uploadImage', function ($http, $filter, $timeout) {
        return {
            templateUrl: 'views/directive/uploadFile.html',
            scope: {
                model: '=ngModel',
                type: "@type",
                callback: "&ngCallback"
            },
            link: function ($scope, element, attrs) {
                $scope.showImage = function () {};
                $scope.check = true;
                if (!$scope.type) {
                    $scope.type = "image";
                }
                $scope.isMultiple = false;
                $scope.inObject = false;
                if (attrs.multiple || attrs.multiple === "") {
                    $scope.isMultiple = true;
                    $("#inputImage").attr("multiple", "ADD");
                }
                if (attrs.noView || attrs.noView === "") {
                    $scope.noShow = true;
                }
                // if (attrs.required) {
                //     $scope.required = true;
                // } else {
                //     $scope.required = false;
                // }

                $scope.$watch("image", function (newVal, oldVal) {
                    isArr = _.isArray(newVal);
                    if (!isArr && newVal && newVal.file) {
                        $scope.uploadNow(newVal);
                    } else if (isArr && newVal.length > 0 && newVal[0].file) {

                        $timeout(function () {
                            console.log(oldVal, newVal);
                            console.log(newVal.length);
                            _.each(newVal, function (newV, key) {
                                if (newV && newV.file) {
                                    $scope.uploadNow(newV);
                                }
                            });
                        }, 100);

                    }
                });

                if ($scope.model) {
                    if (_.isArray($scope.model)) {
                        $scope.image = [];
                        _.each($scope.model, function (n) {
                            $scope.image.push({
                                url: n
                            });
                        });
                    } else {
                        if (_.endsWith($scope.model, ".pdf")) {
                            $scope.type = "pdf";
                        }
                    }

                }
                if (attrs.inobj || attrs.inobj === "") {
                    $scope.inObject = true;
                }
                $scope.clearOld = function () {
                    $scope.model = [];
                };
                $scope.uploadNow = function (image) {
                    $scope.uploadStatus = "uploading";

                    var Template = this;
                    image.hide = true;
                    var formData = new FormData();
                    formData.append('file', image.file, image.name);
                    $http.post(uploadurl, formData, {
                        headers: {
                            'Content-Type': undefined
                        },
                        transformRequest: angular.identity
                    }).then(function (data) {
                        // console.log(data);
                        data = data.data;
                        console.log(data);
                        $scope.uploadStatus = "uploaded";
                        if ($scope.isMultiple) {
                            if ($scope.inObject) {
                                $scope.model.push({
                                    "image": data.data[0]
                                });
                            } else {
                                if (!$scope.model) {
                                    $scope.clearOld();
                                }
                                $scope.model.push(data.data[0]);
                            }
                        } else {
                            if (_.endsWith(data.data[0], ".pdf")) {
                                $scope.type = "pdf";
                            } else {
                                $scope.type = "image";
                            }
                            $scope.model = data.data[0];
                            console.log($scope.model, 'model means blob')

                        }
                        $timeout(function () {
                            $scope.callback({
                                'data': data.data[0]
                            });
                            // $scope.callback();
                        }, 100);

                    });
                };
            }
        };
    })

    .directive('replace', function () {
        return {
            require: 'ngModel',
            scope: {
                regex: '@replace',
                with: '@with'
            },
            link: function (scope, element, attrs, model) {
                model.$parsers.push(function (val) {
                    if (!val) {
                        return;
                    }
                    var regex = new RegExp(scope.regex);
                    var replaced = val.replace(regex, scope.with);
                    if (replaced !== val) {
                        model.$setViewValue(replaced);
                        model.$render();
                    }
                    return replaced;
                });
            }
        };
    })

    .directive("limitToMax", function () {
        return {
            link: function (scope, element, attributes) {
                var oldVal = null;
                element.on("keydown keyup", function (e) {
                    if (Number(element.val()) > Number(attributes.max) &&
                        e.keyCode != 46 // delete
                        &&
                        e.keyCode != 8 // backspace
                    ) {
                        e.preventDefault();
                        element.val(oldVal);
                    } else {
                        oldVal = Number(element.val());
                    }
                });
            }
        };
    })

    // ROTATE IMAGE
    .directive('rotateImage', function($http, $filter, $timeout){
      return{
        templateUrl: 'views/directive/rotateImage.html',
        restrict: 'E',
        scope: {
          model: '=ngModel',
        },
        link: function($scope, element, attrs){
          var img = null;
          var  canvas = null;
          var imgId = 'rotateInput.'+ $scope.model;
          var canvasId = 'rotateCanvas.'+ $scope.model;
          $scope.resultImage = "";
          // UPLOAD IMAGE
          // $scope.rotateUpload = function(){
          //   console.log('UPLOAD');
          // }
          $scope.uploadNow = function (image) {
              $scope.uploadStatus = "uploading";

              var Template = this;
              image.hide = true;
              var formData = new FormData();
              formData.append('file', image.file, image.name);
              $http.post(uploadurl, formData, {
                  headers: {
                      'Content-Type': undefined
                  },
                  transformRequest: angular.identity
              }).then(function (data) {
                  data = data.data;
                  console.log(data);
                  $scope.uploadStatus = "uploaded";
                  $scope.model = data.data[0];
                  console.log($scope.model, 'model means blob')
                  $timeout(function () {
                      $scope.callback({
                          'data': data.data[0]
                      });
                  }, 100);
              });
          };
          // UPLOAD IMAGE END
          // ROTATE FUNCTION
          $scope.rotateImage = function(degree) {
              if (document.getElementById(canvasId)) {
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
                          console.log('90', cw, ch, cx, cy, img);
                          break;
                      case 180:
                          cx = $(img).width() * (-1);
                          cy = $(img).height() * (-1);
                          console.log('180', cw, ch, cx, cy, img);
                          break;
                      case 270:
                          cw = $(img).height();
                          ch = $(img).width();
                          cx = $(img).width() * (-1);
                          console.log('270', cw, ch, cx, cy, img);
                          break;
                  }

                  //  Rotate image
                  canvas.setAttribute('width', cw);
                  canvas.setAttribute('height', ch);
                  cContext.rotate(degree * Math.PI / 180);
                  cContext.drawImage(img, cx, cy);
                  var result = canvas.toDataURL("image/png");
                  $scope.resultImage = result;
              }
          }
          // ROTATE FUNCTION END
          // $scope.$on('$viewContentLoaded', function () {
            $timeout(function () {
              //  Initialize image and canvas

              console.log("img", imgId, 'canvaa', canvasId);
              img = document.getElementById(imgId);
              canvas = document.getElementById(canvasId);

              if (!canvas || !canvas.getContext) {
                  canvas.parentNode.removeChild(canvas);
              } else {
                  img.style.position = 'absolute';
                  img.style.visibility = 'hidden';
              }
              $scope.rotateImage(0);
            }, 100);
          // })
        }
      }
    })
    // ROTATE IMAGE END


;