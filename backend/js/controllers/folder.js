myApp.controller('FolderCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, toastr, $uibModal) {
  //Used to name the .html file
  $scope.template = TemplateService.changecontent("tablefolderpage");
  $scope.menutitle = NavigationService.makeactive("Folder Page");
  TemplateService.title = $scope.menutitle;
  $scope.navigation = NavigationService.getnav();



  // FOLDER DATA
  $scope.getFolder = function (data) {
    $scope.url = 'vimeo/getAllFolderNameCloud'
    $scope.constraints = {};
    $scope.constraints.folderType = data;
    $scope.folderType = data;
    NavigationService.apiCall($scope.url, $scope.constraints, function (data) {
      console.log("get data", data);
      $scope.foldersData = data.data;
    });
  }
  // FOLDER DATA END

  // CONFIG DETAIL
  $scope.getDetailConfig = function () {
    NavigationService.getDetailConfig(function (data) {
      console.log(data, "config data");
      $scope.year = data.data.data.year;
      console.log($scope.year, "year");

    })
  }
  $scope.getDetailConfig();
  // CONFIG DETAIL END

  // DELETE
  $scope.confDel = function (data) {
    $scope.id = data;
    $scope.modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'views/modal/delete.html',
      backdrop: 'static',
      keyboard: false,
      size: 'sm',
      scope: $scope

    });
  };
  $scope.noDelete = function () {
    $scope.modalInstance.close();
  }
  $scope.delete = function (data) {
    console.log(data);
    $scope.url = "Medal/delete";
    $scope.url = "Vimeo/deleteFolderImage";
    $scope.parameter = {};
    $scope.parameter.prefix = $scope.year + '/' + $scope.folderType + '/' + data;
    console.log($scope.parameter, "in modal")
    NavigationService.apiCall($scope.url, $scope.parameter, function (data) {
      console.log("data.value", data);
      if (data.value) {
        toastr.success('Successfully Deleted', 'Folder Message');
        $scope.modalInstance.close();
        $state.reload();
      } else {
        toastr.error('Something went wrong while Deleting', 'Folder Message');
      }

    });
  }

  // DELETE END




});