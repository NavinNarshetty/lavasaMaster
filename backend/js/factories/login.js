myApp.factory('LoginService', function ($http,$state) {
    return { 
        parseAccessToken: function (accessToken,accessLevel, callback) {
            $.jStorage.set("accessLevel", accessLevel);
            $.jStorage.set("accessToken", accessToken);
            callback();
        },

        profile: function (callback, errorCallback) {
            var data = {
                accessToken: $.jStorage.get("accessToken")
            };
            $http.post(adminurl + 'user/profile', data).then(function (data) {
                data = data.data;
                if (data.value === true) {
                    $.jStorage.set("profile", data.data);
                    callback();
                } else {
                    errorCallback(data.error);
                }
            });
        },

        removeAccessToken: function (data, callback) {
            $.jStorage.flush();
        },
    }
});