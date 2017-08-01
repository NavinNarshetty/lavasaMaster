myApp.service('errorService', function ($http, TemplateService, $state, toastr, $uibModal, NavigationService) {
    this.errorCode = function (received, callback) {
        var errorObj = {};
        errorObj = received;
        if (errorObj.status == 200) {
            callback(errorObj.data);
        } else if (errorObj.status == 500) {
            errorObj = {};
            errorObj.message = 'Error while processing your request. Try again.';
            callback(errorObj);
        } else if (errorObj.status == 502) {
            errorObj = {};
            errorObj.message = 'Internet error. Check network and try again.';
            callback(errorObj);
        } else if (errorObj.status == 404) {
            errorObj = {};
            errorObj.message = 'Not found. Reload and Try again.';
            callback(errorObj);
        } else {
            errorObj = {};
            errorObj.message = 'Something went wrong. Try again.';
            callback(errorObj);
        }
    };
});