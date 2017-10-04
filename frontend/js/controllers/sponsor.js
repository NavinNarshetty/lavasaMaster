myApp.controller('SponserPartnerCtrl', function ($scope, TemplateService, $state, NavigationService, $stateParams, toastr, $rootScope, $uibModal, $timeout, configService) {
  $scope.template = TemplateService.getHTML("content/sponsor-partner.html");
  TemplateService.title = "Direct Final"; //This is the Title of the Website
  $scope.navigation = NavigationService.getNavigation();

  configService.getDetail(function (data) {
    $scope.city = data.city;
    $scope.district = data.district;
    $scope.state = data.state;
    $scope.year = data.year;
    $scope.eventYear = data.eventYear;
    $scope.sfaCity = data.sfaCity;
    $scope.formData = data.sfaCity;
    $scope.isCollege = data.isCollege;
    $scope.type = data.type;
    if ($scope.sfaCity == 'Hyderabad') {
      $scope.header1 = 'Supported By'
      $scope.header2 = 'Partners'
      $scope.partner = [{
        img: 'img/sponser/enerzal.png'
      }, {
        img: 'img/sponser/fever.png'
      }, {
        img: 'img/sponser/ibrand.png'
      }, {
        img: 'img/sponser/tv5.png'
      }, {
        img: 'img/sponser/wizcraft.png'
      }];
      $scope.sponser = [{
        img: 'img/sponser/SATS.png'
      }, {
        img: 'img/sponser/telengana-state.png'
      }];

    } else if ($scope.sfaCity == 'Mumbai') {
      $scope.header1 = 'Sponser'
      $scope.header2 = 'Partners'
      $scope.update = "Updating Soon"



    } else if ($scope.sfaCity == 'Ahmedabad') {

    }
  });

  $scope.data = [1, 2, 3, 4, 5, 6, 7];


});