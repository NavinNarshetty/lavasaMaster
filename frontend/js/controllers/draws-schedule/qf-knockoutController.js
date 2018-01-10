myApp.controller('QfKnockoutCtrl', function ($scope, knockoutService, TemplateService, $state, NavigationService, $filter, $sce, $stateParams, toastr, $timeout, errorService, loginService, selectService, $rootScope) {
  $scope.template = TemplateService.getHTML("content/draws-schedule/qf-knockout.html");
  TemplateService.title = "QuaterFinal Knockout"; //This is the Title of the Website
  $scope.navigation = NavigationService.getNavigation();



  // TABLE JSON
  $scope.knockoutTable = [{
    name: "manav mehta",
    schoolname: "dirubhai ambani internationational school",
    bestattempt: "1.10m",
    result: "qualified",
    round: "final",
    score: "1-5",
    qscore: "11"
  }, {
    name: "manav mehta",
    schoolname: "dirubhai ambani internationational school",
    bestattempt: "1.10m",
    result: "did not qualify",
    round: "semi-final",
    score: "1-5",
    qscore: "11"
  }, {
    name: "manav mehta",
    schoolname: "dirubhai ambani internationational school",
    bestattempt: "1.10m",
    result: "qualified",
    round: "semi-final",
    score: "1-5",
    qscore: "11"
  }, {
    name: "manav mehta",
    schoolname: "dirubhai ambani internationational school",
    bestattempt: "1.10m",
    result: "qualified",
    round: "final",
    score: "1-5",
    qscore: "11"
  }, {
    name: "manav mehta",
    schoolname: "dirubhai ambani internationational school",
    bestattempt: "1.10m",
    result: "qualified",
    round: "final",
    score: "1-5",
    qscore: "11"
  }, {
    name: "manav mehta",
    schoolname: "dirubhai ambani internationational school",
    bestattempt: "1.10m",
    result: "did not qualify",
    round: "final",
    score: "1-5",
    qscore: "11"
  },];

  // END TABLE JSON

  $scope.constraints = {};
  $scope.knockoutArr = [];
  $scope.getSportSpecificRounds = function (roundName) {
    if ($stateParams.id) {
      if (roundName) {
        $scope.constraints.round = roundName;
      }
      $scope.constraints.sport = $stateParams.id;
      NavigationService.getSportQualifyingKnockoutRounds($scope.constraints, function (data) {
        errorService.errorCode(data, function (allData) {
          if (!allData.message) {
            if (allData.value) {
              if (allData.data.qualifying != undefined && allData.data.qualifying.roundsList.length > 0) {
                $scope.qualifying = allData.data.qualifying.roundsList;
              }
              // console.log("$scope.qualifying", $scope.qualifying);
              if (allData.data.knockout.roundsList.length > 0) {
                $scope.knockout = allData.data.knockout.roundsList;
                $scope.knockout = $scope.knockout.reverse();
                _.each($scope.knockout, function (data, index) {
                  _.each(data.match, function (key) {
                    if (key.sport.eventPdf) {
                      $scope.showPdf = true;
                      $scope.pdfdata = key.sport.eventPdf;
                      $scope.pdfURL = $filter('uploadpathTwo')($scope.pdfdata);
                      $scope.trustedURL = $sce.trustAsResourceUrl($scope.pdfURL);

                    }
                    _.each(key.opponentsSingle, function (obj) {
                      if (obj.athleteId.middleName) {
                        obj.athleteId.fullName = obj.athleteId.sfaId + " - " + obj.athleteId.firstName + ' ' + obj.athleteId.middleName + ' ' + obj.athleteId.surname;
                      } else {
                        obj.athleteId.fullName = obj.athleteId.sfaId + " - " + obj.athleteId.firstName + ' ' + obj.athleteId.surname;
                      }

                    });
                  });

                });
                _.each($scope.knockout, function (data) {
                  $scope.knockoutArr.push(data.match);
                });
                $scope.knockout = _.flattenDeep($scope.knockoutArr);

                _.each($scope.knockout, function (key) {
                  knockoutService.sortQfKnockout(key);
                });
                console.log("$scope.knockout", $scope.knockout);

              }

              if ($scope.qualifying && $scope.qualifying[0].match.length > 0) {
                _.each($scope.qualifying, function (data, index) {
                  _.each(data.match, function (key) {
                    if (key.sport.eventPdf) {
                      $scope.showPdf = true;
                      $scope.pdfdata = key.sport.eventPdf;
                      $scope.pdfURL = $filter('uploadpathTwo')($scope.pdfdata);
                      $scope.trustedURL = $sce.trustAsResourceUrl($scope.pdfURL);

                    }
                    _.each(key.opponentsSingle, function (obj) {
                      if (obj.athleteId.middleName) {
                        obj.athleteId.fullName = obj.athleteId.sfaId + ' - ' + obj.athleteId.firstName + ' ' + obj.athleteId.middleName + ' ' + obj.athleteId.surname;
                      } else {
                        obj.athleteId.fullName = obj.athleteId.sfaId + ' - ' + obj.athleteId.firstName + ' ' + obj.athleteId.surname;
                      }
                    });
                  });
                });
              }

              if ($scope.knockout.length > 0) {
                $scope.sportsListSubCategoryName = $scope.knockout[0].sport.sportslist.sportsListSubCategory.name;
                $scope.sportsListSubCategoryGender = $scope.knockout[0].sport.gender;
                $scope.sportsListSubCategoryAgeGroup = $scope.knockout[0].sport.ageGroup.name;
                $scope.sportsListSubCategorySportlistName = $scope.knockout[0].sport.sportslist.name;

              } else if ($scope.qualifying.length > 0) {
                $scope.sportsListSubCategoryGender = $scope.qualifying[0].sport.gender;
                $scope.sportsListSubCategoryAgeGroup = $scope.qualifying[0].sport.ageGroup.name;
                $scope.sportsListSubCategoryName = $scope.qualifying[0].sport.sportslist.sportsListSubCategory.name;
                $scope.sportsListSubCategorySportlistName = qualifying[0].sport.sportslist.name;
              }



            }
          } else {
            toastr.error(allData.message, 'Error Message');
          }
        });
      });
    }
  };
  $scope.getSportSpecificRounds();
  // console.log("immmmmmmmmmmmmmmmmmmmmmmmmmm");

  //show more data
  $scope.limitKnockout = 8;
  $scope.limitValue = 8;
  $scope.showMoreData = function (bool, type) {
    if (type === 'knockout') {
      // console.log("im inn");
      if (bool) {
        $scope.showKnockout = true;
        $scope.limitKnockout = 5000;
      } else {
        $scope.limitKnockout = 8;
        $scope.showKnockout = false;
        $scope.scrollID = 'qfknockout';
        knockoutService.scrollTo($scope.scrollID, 'id');
      }
    } else {
      if (type === 'qualifying') {
        if (bool === true) {
          // console.log("im inn");
          $scope.showMore = true;
          $scope.limitValue = 5000;
        } else {
          $scope.showMore = false;
          $scope.limitValue = 8;
          $scope.scrollID = 'qfknockout';
          knockoutService.scrollTo($scope.scrollID, 'id');
        }
      }
    }
  };


});