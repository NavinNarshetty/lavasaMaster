myApp.controller('ReportCardCtrl', function ($scope, TemplateService, $state, NavigationService, $stateParams, toastr, $rootScope, $uibModal, $timeout, configService) {
  $scope.template = TemplateService.getHTML("content/reportcard.html");
  TemplateService.title = "Report Card"; //This is the Title of the Website
  $scope.navigation = NavigationService.getNavigation();

  configService.getDetail(function (data) {
    $scope.state = data.state;
    $scope.year = data.year;
    $scope.eventYear = data.eventYear;
    $scope.sfaCity = data.sfaCity;
    $scope.isCollege = data.isCollege;
    $scope.type = data.type;
  });

  // VARIABLE INITITALISE
  // VARIABLE INITITALISE END

  // FUNCTIONS
  // PRINT FUNCTION
  $scope.printFunction = function (printSectionId) {
      var innerContents = document.getElementById(printSectionId).innerHTML;
      // var popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
      // popupWinindow.document.open();
      var popupWinindow = window.open('width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
      // popupWinindow.document.open();
      popupWinindow.document.write('<html><head><link rel="stylesheet" type="text/css" href="../../css/main.css" /></head><body onload="window.print()">' + innerContents + '</html>');
      popupWinindow.document.close();
  };
  // PRINT FUNCTION
  // FUNCTIONS END

  // API CALLS
  // API CALLS END
  // JSONS
  $scope.lists = [0,1,2,3,4,5,6,7,8,9];
  // JSONS END

  //
})
