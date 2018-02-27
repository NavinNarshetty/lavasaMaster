myApp.controller('HighlightvideoCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, toastr, $uibModal) {
  //Used to name the .html file
  $scope.template = TemplateService.changecontent("champions-archive/tablehighlights");
  $scope.menutitle = NavigationService.makeactive("Highlights Page");
  TemplateService.title = $scope.menutitle;
  $scope.navigation = NavigationService.getnav();

  $scope.formData = {};
  $scope.formData.page = 1;
  $scope.formData.type = '';
  $scope.formData.keyword = '';

  $scope.searchInTable = function (data) {
    $scope.formData.page = 1;
    if (data.length >= 2) {
      $scope.formData.keyword = data;
      $scope.viewTable();
    } else if (data.length == '') {
      $scope.formData.keyword = data;
      $scope.viewTable();
    }
  }

  $scope.viewTable = function () {
    $scope.url = 'HighlightVideo/Search';
    $scope.formData.page = $scope.formData.page++;
    NavigationService.apiCall($scope.url, $scope.formData, function (data) {
      console.log(data, "Highlight Video");
      $scope.viewData = data.data.results;
      console.log($scope.viewData, "check")
    });
  }
  $scope.viewTable();

  $scope.confDel = function (data) {
    console.log(data, "delete ID")
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
    $scope.url = "HighlightVideo/delete";
    $scope.constraints = {};
    $scope.constraints._id = data;
    NavigationService.apiCall($scope.url, $scope.constraints, function (data) {
      if (data.value) {
        toastr.success('Successfully Deleted', 'HighLight Video');
        $scope.modalInstance.close();
        $state.reload();
      } else {
        toastr.error('Something Went Wrong while Deleting', 'HighLight Video');
      }
    });
  }
});

myApp.controller('DetailHighlightCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, toastr, $uibModal) {
  //Used to name the .html file
  $scope.template = TemplateService.changecontent("champions-archive/detailhighlights");
  $scope.menutitle = NavigationService.makeactive("Detail Highlights Page");
  TemplateService.title = $scope.menutitle;
  $scope.navigation = NavigationService.getnav();

  // INITALIAZE
  $scope.formData = {};
  $scope.formData.highlightVideo = [];

  if ($stateParams.id) {
    $scope.getOnehighlight = function () {
      $scope.url = "HighlightVideo/getOne"
      $scope.constraints = {};
      $scope.constraints._id = $stateParams.id;
      NavigationService.apiCall($scope.url, $scope.constraints, function (data) {
        console.log("data in getone", data);
        $scope.formData = data.data;
        console.log($scope.formData, "in formdata")
      })
    }
    $scope.getOnehighlight();
  }

  // ADD HIGHLIGHT
  $scope.addHighlight = function (formData) {
    console.log("formdata", formData)
    if (!formData) {
      $scope.formData.highlightVideo.push({
        'mediaType': 'video',
        'source': '',
        'link': '',
        'title': ''
      })

    } else {
      $scope.formData.highlightVideo.push({
        'mediaType': 'video',
        'source': '',
        'link': '',
        'title': ''
      })
    }
  }
  $scope.addHighlight();

  // DELETE
  $scope.deleteRow = function (formData, index) {
    console.log(formData, index, 'in delete')
    formData.highlightVideo.splice(index, 1);
  }


  // SAVE
  $scope.saveData = function (data) {
    console.log(data, "formData iin save")
    $scope.url = 'HighlightVideo/saveVideoHighlight';
    NavigationService.apiCall($scope.url, data, function (data) {
      console.log(data, 'save data after apicall');
      if (data.value) {
        if (data.data.nModified === 1) {
          toastr.success("Videos Uploaded", 'Updated')
          $state.go('highlight-video')
        } else {
          toastr.success("Videos Uploaded", 'Success')
          $state.go('highlight-video')
        }

      } else {
        toastr.error("Something Went Wrong", 'Error')
      }
    });
  }
});