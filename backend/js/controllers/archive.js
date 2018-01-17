myApp.controller('ArchiveCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, toastr, $uibModal) {
  //Used to name the .html file
  $scope.template = TemplateService.changecontent("tablearchive");
  $scope.menutitle = NavigationService.makeactive("Archive Page");
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
    $scope.url = "Championshiparchive/Search"
    $scope.formData.page = $scope.formData.page++;
    NavigationService.apiCall($scope.url, $scope.formData, function (data) {
      console.log("DATA in search", data);
      $scope.viewTableData = data.data.results;
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
    $scope.url = "Championshiparchive/delete";
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

myApp.controller('DetailArchiveCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, toastr, $uibModal) {
  //Used to name the .html file
  $scope.template = TemplateService.changecontent("detailarchive");
  $scope.menutitle = NavigationService.makeactive("Detail Archive Page");
  TemplateService.title = $scope.menutitle;
  $scope.navigation = NavigationService.getnav();
  // INITALIAZE
  $scope.formData = {};
  $scope.formData.galleryImage = [];
  $scope.formData.highlightVideo = [];
  $scope.formData.counts = [];
  $scope.formData.galleryVideo = [];


  if ($stateParams.id) {
    $scope.getOneArchive = function () {
      $scope.url = "Championshiparchive/getOne";
      $scope.constraints = {};
      $scope.constraints._id = $stateParams.id;
      NavigationService.apiCall($scope.url, $scope.constraints, function (data) {
        console.log(data, 'get one data');
        $scope.formData = data.data;
      });
    }
    $scope.getOneArchive();
  }


  // ADD COUNTS
  $scope.addCount = function (formData) {
    if (!formData) {
      $scope.formData.counts.push({
        'count': '',
        'countHeader': ''
      })
    } else {
      if (formData.counts.length !== 4) {
        console.log("in")
        $scope.formData.counts.push({
          'count': '',
          'countHeader': ''
        })
      } else {
        toastr.error('Only 3 can be Added', 'Error');
      }

    }
  }
  $scope.addCount();
  // ADD COUNTS END

  // DELETE
  $scope.deleteCount = function (formData, index) {
    formData.counts.splice(index, 1);
  }




  // ADD GALLERY VIDEO
  $scope.addVideoGallery = function (formData) {
    if (!formData) {
      $scope.formData.galleryVideo.push({
        'mediaType': 'video',
        'videoThumbnail': '',
        'videoSource': '',
        'videoLink': ''
      })
    } else {
      $scope.formData.galleryVideo.push({
        'mediaType': 'video',
        'videoThumbnail': '',
        'videoSource': '',
        'videoLink': ''
      })
    }
  }
  $scope.addVideoGallery();


  // DELETE
  $scope.deleteRow = function (formData, index) {
    formData.galleryVideo.splice(index, 1);
  }

  $scope.saveData = function (data) {
    console.log("data in save", data);
    $scope.url = "Championshiparchive/save";
    NavigationService.apiCall($scope.url, data, function (data) {
      console.log(data, "save data archive")
      if (data.value) {
        if (data.data.nModified === 1) {
          toastr.success("Successfully Updated", 'Updated');
          $state.go('archive')
        } else {
          toastr.success("Successfully Created", 'Saved');
          $state.go('archive')
        }

      } else {
        toastr.error("Something went Wrong", "Error");
      }

    })
  }

});