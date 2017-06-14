var imgurl = adminurl + "upload/";

var imgpath = imgurl + "readFile";
var uploadurl = imgurl;



myApp.factory('NavigationService', function ($http) {
    var navigation = [{
            name: "School",
            classis: "activeColor",
            sref: "",
            icon: "phone",
            subnav: [{
                name: "Edit School",
                classis: "",
                sref: "#!/page/viewRegistration//",
                icon: "phone"
            }, {
                name: "View School",
                classis: "",
                sref: "#!/school",
                icon: "phone"
            }]
        },
        {
            name: "Athlete",
            classis: "activeColor",
            sref: "",
            icon: "phone",
            subnav: [{
                name: "Edit Athlete",
                classis: "",
                sref: "#!/page/viewAthelete//",
                icon: "phone"
            }, {
                name: "View Athlete",
                classis: "",
                sref: "#!/athlete",
                icon: "phone"
            }]
        },
        {
            name: "Old School",
            classis: "activeColor",
            sref: "",
            icon: "phone",
            subnav: [{
                name: "Edit Old School",
                classis: "",
                sref: "#!/page/viewOldSchool//",
                icon: "phone"
            }, {
                name: "View Old School",
                classis: "",
                sref: "#!/oldschool",
                icon: "phone"
            }]
        }, {
            name: "Age Group",
            classis: "activeColor",
            sref: "#!/agegroup",
            icon: "phone"
        },
        {
            name: "Rules",
            classis: "activeColor",
            sref: "#!/rules",
            icon: "phone"
        },
        {
            name: "Weight",
            classis: "activeColor",
            sref: "#!/firstcategory",
            icon: "phone"
        },
        {
            name: "Draw Format",
            classis: "activeColor",
            sref: "#!/drawformat",
            icon: "phone"
        },
        {
            name: "Category",
            classis: "activeColor",
            sref: "#!/sports-list-cat",
            icon: "phone"
        },
        {
            name: "Sub Category",
            classis: "activeColor",
            sref: "#!/sports-list-subcat",
            icon: "phone"
        },
        {
            name: "Sports List",
            classis: "activeColor",
            sref: "#!/sports-list",
            icon: "phone"
        },
        {
            name: "Sports",
            classis: "activeColor",
            sref: "#!/sports",
            icon: "phone"
        }

        // {
        //     name: "Second Category",
        //     classis: "activeColor",
        //     sref: "#!/secondcategory",
        //     icon: "phone"
        // },
        // {
        //     name: "Third Category",
        //     classis: "activeColor",
        //     sref: "#!/thirdcategory",
        //     icon: "phone"
        // },
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
                    navigation[i].classis = "activeColor";
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
        generateSchoolExcel: function (callback) {
            $http.post(adminurl + 'Registration/generateExcel').then(function (data) {
                // data = data.data;
                callback(data);
            });
        },
        generateAthleteExcel: function (callback) {
            $http.post(adminurl + 'Athelete/generateExcel').then(function (data) {
                // data = data.data;
                callback(data);
            });
        },
        generateAthleteExcelWithData: function (data, callback) {
            console.log('from Controller', data);
            $http.post(adminurl + 'Athelete/generateExcel', data).then(function (data) {
                console.log('from navigation', data);
                // data = data.data;
                callback(data);
            });
        },
        generateOldSchoolExcel: function (callback) {
            $http.post(adminurl + 'School/generateExcel').then(function (data) {
                // data = data.data;
                callback(data);
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