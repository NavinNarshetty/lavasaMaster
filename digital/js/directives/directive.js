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
                console.log($scope.model, 'yo modell');
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
                    console.log(newVal, oldVal);
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


;
