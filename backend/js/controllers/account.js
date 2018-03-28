myApp.controller('athleteAccountCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, crudService, $state, toastr, $uibModal) {
  //Used to name the .html file
  $scope.template = TemplateService.changecontent("accounts/athleteaccount");
  $scope.menutitle = NavigationService.makeactive("Athlete Account");
  TemplateService.title = $scope.menutitle;
  $scope.navigation = NavigationService.getnav();

  // ACCORDIAN

  $scope.oneAtATime = true;
  $scope.status = {
    isCustomHeaderOpen: false,
    isFirstOpen: true,
    isFirstDisabled: false
  };
  // END ACCORDIAN

  $scope.athleteAccountPlayer = {
    sfaId: 'HA20178',
    athlete: {
      name: "Akshay Sriharsha Tadi Tadi Tadi",
      school: "The Future Kid's Future Kid's Future Kid's School (Puppal Guda)",
      upgradePackage: "Yes"
    }
  }

  $scope.athleteAccountData = {
    payementMode: 'Online,Cash,Online,Cash',
    packagea: '2000',
    packageb: '5000',
    packagec: '5000',
    packaged: '5000',
    sgst: '9%',
    cgst: '8%',
    discount: '5000',
    nettotal: '50000',
    modepay: 'cash',
    chaqtransctionno: '5a21034562bcd',
    receiptno: '1234567891',
    remark: 'check the Receipt',
  }

})