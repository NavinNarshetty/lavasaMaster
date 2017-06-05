var imgurl = adminurl + "upload/";

var imgpath = imgurl + "readFile";
var uploadurl = imgurl;



myApp.factory('NavigationService', function ($http) {
    var navigation = [{
            name: "School",
            classis: "active",
            sref: "#!/page/viewRegistration//",
            icon: "phone"
        },
        {
            name: "Athelete",
            classis: "active",
            sref: "#!/page/viewAthelete//",
            icon: "phone"
        },
        {
            name: "Old School",
            classis: "active",
            sref: "#!/page/viewOldSchool//",
            icon: "phone"
        },
        {
            name: "View School",
            classis: "active",
            sref: "#!/school",
            icon: "phone"
        },
        {
            name: "View Athlete",
            classis: "active",
            sref: "#!/athlete",
            icon: "phone"
        },
        {
            name: "View Old School",
            classis: "active",
            sref: "#!/oldschool",
            icon: "phone"
        },
        // {
        //     name: "Age Group",
        //     classis: "active",
        //     sref: "#!/page/viewAgeGroup//",
        //     icon: "phone"
        // }
        {
            name: "Age Group",
            classis: "active",
            sref: "#!/agegroup",
            icon: "phone"
        },
        // {
        //     name: "Rules",
        //     classis: "active",
        //     sref: "#!/page/viewRules//",
        //     icon: "phone"
        // },
        {
            name: "Rules",
            classis: "active",
            sref: "#!/rules",
            icon: "phone"
        },
        // {
        //     name: "First Category",
        //     classis: "active",
        //     sref: "#!/page/viewFirstCategory//",
        //     icon: "phone"
        // },
        {
            name: "First Category",
            classis: "active",
            sref: "#!/firstcategory",
            icon: "phone"
        },
        // {
        //     name: "Second Category",
        //     classis: "active",
        //     sref: "#!/page/viewSecondCategory//",
        //     icon: "phone"
        // },
        {
            name: "Second Category",
            classis: "active",
            sref: "#!/secondcategory",
            icon: "phone"
        },
        // {
        //     name: "Third Category",
        //     classis: "active",
        //     sref: "#!/page/viewThirdCategory//",
        //     icon: "phone"
        // },
        {
            name: "Third Category",
            classis: "active",
            sref: "#!/thirdcategory",
            icon: "phone"
        },

        {
            name: "Sport",
            classis: "active",
            sref: "#!/page/viewSport//",
            icon: "phone"
        },
        {
            name: "Sports List",
            classis: "active",
            sref: "#!/page/viewSportsList//",
            icon: "phone"
        },
        // {
        //     name: "Draw Format",
        //     classis: "active",
        //     sref: "#!/page/viewDrawFormat//",
        //     icon: "phone"
        // },
        {
            name: "Draw Format",
            classis: "active",
            sref: "#!/drawformat",
            icon: "phone"
        },
        //{
        //     name: "Users",
        //     classis: "active",
        //     sref: "#!/page/viewUser//",
        //     icon: "phone"
        // }, {
        //     name: "Users",
        //     classis: "active",
        //     sref: "#!/page/viewUser//",
        //     icon: "phone"
        //}
    ];

    return {
        getnav: function () {
            return navigation;
        },

        parseAccessToken: function (data, callback) {
            if (data) {
                $.jStorage.set("accessToken", data);
                callback();
            }
        },
        removeAccessToken: function (data, callback) {
            $.jStorage.flush();
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
        makeactive: function (menuname) {
            for (var i = 0; i < navigation.length; i++) {
                if (navigation[i].name == menuname) {
                    navigation[i].classis = "active";
                } else {
                    navigation[i].classis = "";
                }
            }
            return menuname;
        },

        search: function (url, formData, i, callback) {
            $http.post(adminurl + url, formData).then(function (data) {
                data = data.data;
                callback(data, i);
            });
        },
        delete: function (url, formData, callback) {
            $http.post(adminurl + url, formData).then(function (data) {
                data = data.data;
                callback(data);
            });
        },
        countrySave: function (formData, callback) {
            $http.post(adminurl + 'country/save', formData).then(function (data) {
                data = data.data;
                callback(data);

            });
        },

        apiCall: function (url, formData, callback) {
            $http.post(adminurl + url, formData).then(function (data) {
                data = data.data;
                callback(data);

            });
        },
        searchCall: function (url, formData, i, callback) {
            $http.post(adminurl + url, formData).then(function (data) {
                data = data.data;
                callback(data, i);
            });
        },
        getOneOldSchoolById: function (url, formData, callback) {
            $http.post(adminurl + url, formData).then(function (data) {
                data = data.data;
                callback(data);
            });
        },
        getOneCountry: function (id, callback) {
            $http.post(adminurl + 'country/getOne', {
                _id: id
            }).then(function (data) {
                data = data.data;
                callback(data);

            });
        },
        getLatLng: function (address, i, callback) {
            $http({
                url: "https://maps.googleapis.com/maps/api/geocode/json?address=" + address + "&key=AIzaSyC62zlixVsjaq4zDaL4cefNCubjCgxkte4",
                method: 'GET',
                withCredentials: false,
            }).then(function (data) {
                data = data.data;
                callback(data, i);
            });
        },
        uploadExcel: function (form, callback) {
            $http.post(adminurl + form.model + '/import', {
                file: form.file
            }).then(function (data) {
                data = data.data;
                callback(data);

            });

        },

    };
});