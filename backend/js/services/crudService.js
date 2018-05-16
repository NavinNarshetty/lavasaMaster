myApp.service('crudService', function ($http, TemplateService, $state, toastr, $uibModal, NavigationService, $timeout) {

  // DELETE SERVICE
  // VARIABLES
  // var urlType;
  this.data;
  this.url;
  // VARIABLES

  // OPEN MODAL FUNCTION
  this.confirmDelete = function (data, urlType, varScope) {
    console.log(varScope, "global variable");
    this.data = data;
    this.url = urlType;
    console.log(data, urlType, "i am in service");
    modalInstance = $uibModal.open({
      animation: true,
      scope: varScope,
      backdrop: 'static',
      keyboard: false,
      templateUrl: 'views/modal/servicedelete.html',
      size: 'sm',
      windowClass: ''
    })
  }

  // CLICK YES ON MODAL
  this.confirmYes = function () {
    var constraints = {};
    constraints._id = this.data;
    // console.log(constraints, "check this again");
    // console.log(this.url, this.data, "check this");
    NavigationService.apiCall(this.url, constraints, function (data) {
      if (data.value) {
        toastr.success("Successfully Deleted", 'Success');
        modalInstance.close();
        $state.reload();
      } else {
        toastr.error("Something Went Wrong", 'Deleted');
      }
    })
  }


  // CLICK NO ON MODAL
  this.confirmNo = function () {
    console.log("no click")
    modalInstance.close();
  }
  // DELETE SERVICE END


  // SAVE SERVICE

  this.saveData = function (data, url, state) {
    // console.log(data, url, state, "iam in save");
    var newurl = url + '/' + 'Save';
    NavigationService.apiCall(newurl, data, function (data) {
      if (data.value) {
        if (data.data.nModified) {
          toastr.success("Data Modified Successfully", "Success");
        } else {
          toastr.success("Data Saved Successfully", "Success");
        }
        if ($state.current.name == state) {
          $state.reload();
        } else {
          $state.go(state);
        }
      } else {
        toastr.error("Something went wrong", "Error");
      }
    });
  };

  // SAVE SERVICE END


  // GET ONE DATA
  this.getOneData = function (url, id, callback) {
    var getUrl = url + '/' + 'getOne'; // CONCAT FOR getONE URL
    // console.log(id, "check")
    var paraM = {};
    paraM._id = id; //STATE PARAMS
    NavigationService.apiCall(getUrl, paraM, function (data) {
      if (data.value) {
        var formData = {};
        formData = data.data; //FETCH THE DATA
        console.log(formData, "in service");
        callback(formData); //RETURN THE DATA TO THE CONTROLLER
      }
    });
    // console.log(url, id, "check get one");
  };
  // GET ONE DATA END



  // SEARCH DATA

  // SEARCH DATA END

});
