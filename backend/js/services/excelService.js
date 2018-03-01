myApp.service('excelService', function ($http, TemplateService, $state, toastr, $uibModal, NavigationService, $timeout) {
  var modalInstance;
  var commonExcelData;
  var type;
  var admin = {
    "email": "digital@sfanow.in",
    "password": "sfabackend2017-18"
  };
  var adminPayu = {
    "schoolPassword": "123",
    "atheletePassword": "456"

  }
  this.loginPopup = function (data, varScope, type) {
    console.log(data);
    commonExcelData = data;
    type = type;
    modalInstance = $uibModal.open({
      animation: true,
      scope: varScope,
      // backdrop: 'static',
      // keyboard: false,
      templateUrl: 'views/modal/login-popup.html',
      size: 'sm',
      windowClass: 'loginpopup'
    })
  }
  this.loginSubmit = function (login, url, filename) {
    console.log(login, url, filename, "check")
    var dataResult = {
      "data": "",
      "value": false
    }

    if (login) {
      if (login.password == admin.password) {
        // EMAIL AND PASSWORD SUCCESS
        var showError = false;
        var dataResult = {
          "data": login,
          "value": true
        }
        toastr.success('Login Successfull');
        modalInstance.close()
        $timeout(function () {
          console.log(commonExcelData, "in timeout")
          console.log(NavigationService, "nav")

          if (type === 'targetexcel') {
            var param = {};
            param.file = "targetAthlete"
            // var url = "Athelete/getTargetAthlete"
            NavigationService.generateExcelWithoutData(url, param, function (data) { });
          } else {
            NavigationService.generateCommonExcelWithData(url, commonExcelData, filename, function (data) { });
          }
          console.log("after")
          // if (_.isEmpty(athleteexcelData.type)) {
          //   console.log("else");
          //   NavigationService.generateAthleteExcelWithData(athleteexcelData, function (data) {});
          // } else {
          //   console.log(athleteexcelData);
          //   NavigationService.generateAthleteExcelWithData(athleteexcelData, function (data) {});
          // }
        }, 1000);
        // EMAIL AND PASSWORD SUCCESS END
      } else {
        // PASSWORD ERROR
        toastr.error('Please check Password entered', 'Acess Denied');
        console.log(dataResult, "password Fail");
        // PASSWORD ERROR END
      }
      login.password = '';
    }
  };

  // FOR SCHOOL AND ATHELETE PAYU 
  this.loginPayuPopup = function (varScope) {
    modalInstance1 = $uibModal.open({
      animation: true,
      scope: varScope,
      backdrop: 'static',
      keyboard: false,
      templateUrl: 'views/modal/loginPayuPopup.html',
      size: 'sm',
      windowClass: 'loginpopup'
    });
  };
  this.submitPayuPopup = function (login, type) {
    if (type == 'School') {
      if (login.password == adminPayu.schoolPassword) {
        $.jStorage.set("isSchoolPayu", 'school');
        modalInstance1.close();
        toastr.success('Login Successfull', 'Success Message');
      } else {
        toastr.error('Please check Password entered', 'Acess Denied')
      }

    } else if (type == 'Athelete') {
      if (login.password == adminPayu.atheletePassword) {
        $.jStorage.set("isAtheletePayu", 'athelete');
        modalInstance1.close();
        toastr.success('Login Successfull', 'Success Message');
      } else {
        toastr.error('Please check Password entered', 'Acess Denied');
      }

    }

  };

});