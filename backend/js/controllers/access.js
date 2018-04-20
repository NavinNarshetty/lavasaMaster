myApp.controller('NoAccessCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, toastr, $uibModal, crudService) {
  //Used to name the .html file
  $scope.template = TemplateService.changecontent("access/noaccess");
  $scope.menutitle = NavigationService.makeactive("No Access");
  TemplateService.title = $scope.menutitle;
  $scope.navigation = NavigationService.getnav();
  // CODE START

  // CODE END
});

myApp.controller('UsersCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, toastr, $uibModal, crudService) {
  //Used to name the .html file
  $scope.template = TemplateService.changecontent("access/users/users");
  $scope.menutitle = NavigationService.makeactive("Users");
  TemplateService.title = $scope.menutitle;
  $scope.navigation = NavigationService.getnav();
  // CODE START

  NavigationService.getAllUsers(function (data) {
    console.log("data", data.data.data);
    $scope.items = data.data.data;
  });

  $scope.crudService = crudService;
  var url = "user/delete";
  $scope.confirmDelete = function (data) {
    crudService.confirmDelete(data, url, $scope);
  }

  // CODE END
});

myApp.controller('DetailUsersCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, toastr, $uibModal, crudService) {
  //Used to name the .html file
  $scope.template = TemplateService.changecontent("access/users/detail-users");
  $scope.menutitle = NavigationService.makeactive("Users");
  TemplateService.title = $scope.menutitle;
  $scope.navigation = NavigationService.getnav();
  // CODE START

  if ($stateParams.id) {

    NavigationService.getOneUser({
      "_id": $stateParams.id
    }, function (data) {
      console.log("getOneUser", data);
      $scope.formData = data.data.data;
    });
  }

  $scope.crudService = crudService;
  var url = "user/delete";
  $scope.confirmDelete = function (data) {
    crudService.confirmDelete(data, url, $scope);
  }

  // $scope.roles = [{
  //   accessLevel: "Super Admin"
  // }, {
  //   accessLevel: "Admin"
  // }, {
  //   accessLevel: "Sports Ops"
  // }, {
  //   accessLevel: "Volunteers"
  // }, {
  //   accessLevel: "Accounts"
  // }];

  $scope.roles = [
    "New User",
    "Super Admin",
    "Admin",
    "Sports Ops",
    "Volunteers",
    "Accounts"
  ]

  $scope.saveData=function(data){
    NavigationService.saveUser(data,function(data){
      if(data.data.value){
        toastr.success("Successfully Saved");
      }
      console.log("data",data);
    })
  }

  // CODE END
});