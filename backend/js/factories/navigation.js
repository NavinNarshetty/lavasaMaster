var imgurl = adminurl + "upload/";

var imgpath = imgurl + "readFile";
var uploadurl = imgurl;



myApp.factory('NavigationService', function ($http) {
    var navigation = [{
        name: "Registration",
        classis: "activeColor",
        sref: "",
        icon: "phone",
        subnav: [{
            name: "School",
            classis: "activeColor",
            sref: "",
            icon: "phone",
            subnavs: [{
                name: "Edit School",
                classis: "",
                sref: "#/page/viewRegistration//",
                icon: "phone"
            }, {
                name: "View School",
                classis: "",
                sref: "#/school",
                icon: "phone"
            }]
        }, {
            name: "Athlete",
            classis: "activeColor",
            sref: "",
            icon: "phone",
            subnavs: [{
                name: "Edit Athlete",
                classis: "",
                sref: "#/page/viewAthelete//",
                icon: "phone"
            }, {
                name: "View Athlete",
                classis: "",
                sref: "#/athlete",
                icon: "phone"
            }]
        }, {
            name: "Old School",
            classis: "activeColor",
            sref: "",
            icon: "phone",
            subnavs: [{
                name: "Edit Old School",
                classis: "",
                sref: "#/page/viewOldSchool//",
                icon: "phone"
            }, {
                name: "View Old School",
                classis: "",
                sref: "#/oldschool",
                icon: "phone"
            }]
        }, {
            name: "Additional Payment",
            classis: "activeColor",
            sref: "#/additional-payment",
            icon: "phone"
        }]
    }, {
        name: "Sports Detail",
        classis: "activeColor",
        sref: "",
        icon: "phone",
        subnav: [{
            name: "Age Group",
            classis: "activeColor",
            sref: "#/agegroup",
            icon: "phone"
        }, {
            name: "Rules",
            classis: "activeColor",
            sref: "#/rules",
            icon: "phone"
        }, {
            name: "Weight",
            classis: "activeColor",
            sref: "#/firstcategory",
            icon: "phone"
        }, {
            name: "Draw Format",
            classis: "activeColor",
            sref: "#/drawformat",
            icon: "phone"
        }, {
            name: "Category",
            classis: "activeColor",
            sref: "#/sports-list-cat",
            icon: "phone"
        }, {
            name: "Sub Category",
            classis: "activeColor",
            sref: "#/sports-list-subcat",
            icon: "phone"
        }, {
            name: "Sports List",
            classis: "activeColor",
            sref: "#/sports-list",
            icon: "phone"
        }, {
            name: "Sports",
            classis: "activeColor",
            sref: "#/sports",
            icon: "phone"
        }, {
            name: "Rounds",
            classis: "activeColor",
            sref: "#/rounds",
            icon: "phone"
        }, {
            name: "Event Pdf",
            classis: "activeColor",
            sref: "#/tablepdf",
            icon: "phone",
        }]


    },
    {
        name: "Matches",
        classis: "activeColor",
        sref: "#/matches",
        icon: "phone"
    },
    {
        name: "Individual Sport",
        classis: "activeColor",
        sref: "#/individual-sport",
        icon: "phone"
    }, {
        name: "Team Sport",
        classis: "activeColor",
        sref: "#/teamsport",
        icon: "phone"
    }, {
        name: "Medals",
        classis: "activeColor",
        sref: "#/medals",
        icon: "phone"
    }, {
        name: "Other",
        classis: "activeColor",
        sref: "",
        icon: "phone",
        subnav: [{
            name: "Media",
            classis: "activeColor",
            sref: "#/media",
            icon: "phone",
        }, {
            name: "Calender",
            classis: "activeColor",
            sref: "#/calender",
            icon: "phone"
        }, {
            name: "Sponsor",
            classis: "activeColor",
            sref: "",
            icon: "phone",
            subnavs: [{
                name: "Sponsor Page",
                classis: "",
                sref: "#/sponsor",
                icon: "phone"
            }, {
                name: "Sponsor Card",
                classis: "",
                sref: "#/sponsorcard",
                icon: "phone"
            }]
        }, {
            name: "Special Awards",
            classis: "activeColor",
            sref: "",
            icon: "phone",
            subnavs: [{
                name: "Award Banner",
                classis: "",
                sref: "#/specialaward-banner",
                icon: "phone"
            }, {
                name: "List of Award",
                classis: "",
                sref: "#/specialaward",
                icon: "phone"
            }, {
                name: "Award Detail",
                classis: "",
                sref: "#/specialaward-detail",
                icon: "phone"
            }, {
                name: "Rising Star",
                classis: "",
                sref: "#/risingstar",
                icon: "phone"
            }]
        }, {
            name: "Champion Schedule",
            classis: "activeColor",
            sref: "#/championschedule",
            icon: "phone"
        }, {
            name: "Faq",
            classis: "activeColor",
            sref: "#/faq",
            icon: "phone"
        }, {
            name: "Certificate",
            classis: "activeColor",
            sref: "",
            icon: "phone",
            subnavs: [{
                name: "Certificate Banner",
                classis: "",
                sref: "#/certificatebanner",
                icon: "phone"
            }, {
                name: "Certificate Details",
                classis: "",
                sref: "#/certificatedetails",
                icon: "phone"
            }]
        }]


    }, {
        name: "ConfigProperty",
        classis: "activeColor",
        sref: "#/page/viewConfigProperty//",
        icon: "phone",
    },
    {
        name: "Gallery",
        classis: "activeColor",
        sref: "#/gallery",
        icon: "phone",
    },

        // {
        //     name: "Second Category",
        //     classis: "activeColor",
        //     sref: "#/secondcategory",
        //     icon: "phone"
        // },
        // {
        //     name: "Third Category",
        //     classis: "activeColor",
        //     sref: "#/thirdcategory",
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
        saveRising: function (url, formData, callback) {
            $http.post(adminurl + url, formData).then(function (data) {
                data = data.data;
                callback(data);

            });
        },
        searchCall: function (url, formData, i, callback) {
            $http.post(adminurl + url, formData).then(function (data) {
                data = data.data;
                console.log(data, i);
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
        generateAdditionalPaymentExcel: function (callback) {
            $http.post(adminurl + 'AdditionalPayment/generateExcel').then(function (data) {
                callback(data);
            });
        },
        generateMedalExcel: function (callback) {
            $http.post(adminurl + 'Medal/generateExcel').then(function (data) {
                callback(data);
            });
        },
        generateMediaExcel: function (url, data, callback) {
            $http.post(adminurl + url, data).then(function (data) {
                // data = data.data;
                callback(data);
            });
        },
        // generateAthleteExcelWithData: function (data, callback) {
        //     console.log('from Controller', data);
        //     $http.get(adminurl + 'Athelete/generateExcel', data).then(function (data) {
        //         console.log('from navigation', data);
        //         // data = data.data;
        //         callback(data);
        //     });
        // },

        generateAthleteExcelWithData: function (data, callback) {
            console.log('from Controller', data);
            $http.post(adminurl + 'Athelete/generateExcel', data, {
                responseType: 'arraybuffer'
            }).then(function (response) {
                var header = response.headers('Content-Disposition')
                var fileName = "Athlete" + "-" + moment().format("MMM-DD-YYYY-hh-mm-ss-a") + ".xlsx";
                console.log(fileName);
                var blob = new Blob([response.data], {
                    type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation;charset=UTF-8'
                });
                var objectUrl = (window.URL || window.webkitURL).createObjectURL(blob);
                var link = angular.element('<a/>');
                link.attr({
                    href: objectUrl,
                    download: fileName
                })[0].click();
                callback(null, fileName);
            })
        },

        generateCommonExcelWithData: function (url, data, filename, callback) {
            console.log('from Controller', data);
            $http.post(adminurl + url, data, {
                responseType: 'arraybuffer'
            }).then(function (response) {
                var header = response.headers('Content-Disposition')
                var fileName = filename + "-" + moment().format("MMM-DD-YYYY-hh-mm-ss-a") + ".xlsx";
                console.log(fileName);
                var blob = new Blob([response.data], {
                    type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation;charset=UTF-8'
                });
                var objectUrl = (window.URL || window.webkitURL).createObjectURL(blob);
                var link = angular.element('<a/>');
                link.attr({
                    href: objectUrl,
                    download: fileName
                })[0].click();
                callback(null, fileName);
            })
        },

        generateSchoolExcelWithData: function (data, callback) {
            console.log('from Controller', data);
            $http.post(adminurl + 'Registration/generateExcel', data, {
                responseType: 'arraybuffer'
            }).then(function (response) {
                var header = response.headers('Content-Disposition')
                var fileName = "Registration" + "-" + moment().format("MMM-DD-YYYY-hh-mm-ss-a") + ".xlsx";
                console.log(fileName);

                var blob = new Blob([response.data], {
                    type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation;charset=UTF-8'
                });
                var objectUrl = (window.URL || window.webkitURL).createObjectURL(blob);
                var link = angular.element('<a/>');
                link.attr({
                    href: objectUrl,
                    download: fileName
                })[0].click();
                callback(null, fileName);
            })
        },

        generateExcelWithoutData: function (url, data, callback) {
            $http.post(adminurl + url, data, {
                responseType: 'arraybuffer'
            }).then(function (response) {
                var header = response.headers('Content-Disposition')
                var fileName = data.file + "-" + moment().format("MMM-DD-YYYY-hh-mm-ss-a") + ".xlsx";
                console.log(fileName);

                var blob = new Blob([response.data], {
                    type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation;charset=UTF-8'
                });
                var objectUrl = (window.URL || window.webkitURL).createObjectURL(blob);
                var link = angular.element('<a/>');
                link.attr({
                    href: objectUrl,
                    download: fileName
                })[0].click();
                callback(null, fileName);
            })
        },

        generateExcel: function (url, callback) {
            $http.post(adminurl + url).then(function (data) {
                // data = data.data;
                callback(data);
            });
        },

        generateExcelWithData: function (url, data, callback) {
            $http.post(adminurl + url, data, {
                responseType: 'arraybuffer'
            }).then(function (response) {
                if (!_.isEmpty(data.playerType)) {
                    var fname = data.resultType + data.playerType + "-" + data.sportslist.name + " " + data.ageGroup.name + " " + data.gender;
                } else {
                    if (!_.isEmpty(data.excelType)) {
                        var fname = data.resultType + "-" + data.excelType + "-" + data.sportslist.name + " " + data.ageGroup.name + " " + data.gender;
                    } else {
                        var fname = data.resultType + "-" + data.sportslist.name + " " + data.ageGroup.name + " " + data.gender;
                    }
                }
                var header = response.headers('Content-Disposition')
                var fileName = fname + "-" + moment().format("MMM-DD-YYYY-hh-mm-ss-a") + ".xlsx";
                var blob = new Blob([response.data], {
                    type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation;charset=UTF-8'
                });
                var objectUrl = (window.URL || window.webkitURL).createObjectURL(blob);
                var link = angular.element('<a/>');
                link.attr({
                    href: objectUrl,
                    download: fileName
                })[0].click();
                callback(null, fileName);
            })
        },

        generateBlankExcelWithData: function (url, data, callback) {
            $http.post(adminurl + url, data, {
                responseType: 'arraybuffer'
            }).then(function (response) {
                if (!_.isEmpty(data.playerType)) {
                    var fname = data.resultType + data.playerType;
                } else {
                    var fname = data.resultType;
                }
                var header = response.headers('Content-Disposition')
                var fileName = fname + "-" + moment().format("MMM-DD-YYYY-hh-mm-ss-a") + ".xlsx";
                var blob = new Blob([response.data], {
                    type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation;charset=UTF-8'
                });
                var objectUrl = (window.URL || window.webkitURL).createObjectURL(blob);
                var link = angular.element('<a/>');
                link.attr({
                    href: objectUrl,
                    download: fileName
                })[0].click();
                callback(null, fileName);
            })
        },

        generateOldSchoolExcel: function (callback) {
            $http.post(adminurl + 'School/generateExcel').then(function (data) {
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

        uploadExcel: function (url, form, callback) {
            $http.post(adminurl + url, form).then(function (data) {
                data = data.data;
                callback(data);

            });

        },

        getOneMatch: function (formData, callback) {
            $http({
                url: adminurl + "match/getOne",
                method: "POST",
                data: formData
            }).success(function (data) {
                console.log(data, "nav");
                callback(data)
            });
        },

        saveMatch: function (formData, callback) {
            console.log(formData, 'saveMatch');
            $http({
                url: adminurl + "match/updateBackend",
                method: "POST",
                data: formData
            }).success(function (data) {
                callback(data)
            });
        },

        getOneBackend: function (formData, callback) {
            $http({
                url: adminurl + "match/getOneBackend",
                method: "POST",
                data: formData
            }).success(function (data) {
                console.log(data, "nav");
                callback(data)
            });
        },

        setEventPdf: function (formData, callback) {
            $http({
                url: adminurl + "Sport/setEventPdf",
                method: "POST",
                data: formData
            }).success(function (data) {
                console.log(data, "nav");
                callback(data)
            });
        },
        searchForEventPdf: function (formData, callback) {
            console.log(formData, 'search');

            $http({
                url: adminurl + "Sport/searchForEventPdf",
                method: "POST",
                data: formData
            }).success(function (data) {
                console.log(data, "nav");
                callback(data)
            });
        },
        getAllSpotsList: function (constraints, callback) {
            $http({
                url: adminurl + 'sportsList/search',
                method: 'POST',
                data: constraints,
                withCredentials: true
            }).success(callback);
        },
        getAllAgeGroups: function (callback) {
            $http({
                url: adminurl + 'AgeGroup/getAll',
                method: 'POST'
            }).then(callback);
        },
        getAllWeights: function (callback) {
            $http({
                url: adminurl + 'Weight/getAll',
                method: 'POST'
            }).then(callback);
        },

        getOneSchool: function (constraints, url, callback) {
            console.log("constraints", constraints);
            $http({
                url: adminurl + url,
                data: constraints,
                method: 'POST'

            }).then(callback);
        },
        getAwardsList: function (constraints, callback) {
            console.log("constraints", constraints);
            $http({
                url: adminurl + 'SpecialAwardDetails/getAwardsList',
                data: constraints,
                method: 'POST'

            }).then(callback);
        },
        getGenderAthlete: function (constraints, url, callback) {
            console.log("constraints gender", constraints);
            $http({
                url: adminurl + url,
                data: constraints,
                method: 'POST'

            }).then(callback);
        },
        getAllAwardDetails: function (constraints, callback) {
            console.log("constraints gender", constraints);
            $http({
                url: adminurl + 'SpecialAwardDetails/getAllAwardDetails',
                data: constraints,
                method: 'POST'

            }).then(callback);
        },
        getOneAwardDetails: function (constraints, callback) {
            console.log("constraints ", constraints);
            $http({
                url: adminurl + 'SpecialAwardDetails/getOneAwardDetails',
                data: constraints,
                method: 'POST'

            }).then(callback);
        },
        getAllRegSportsByID: function (constraints, callback) {
            console.log("constraints ", constraints);
            $http({
                url: adminurl + 'SpecialAwardDetails/getAllSportsSubCatByAth',
                data: constraints,
                method: 'POST'

            }).then(callback);
        },
        getTeamsAthletesBySport: function (data, callback) {
            $http({
                url: adminurl + 'Medal/getTeamsAthletesBySport',
                data: data,
                method: 'POST'
            }).then(callback);
        },
        getConfigDetail: function (callback) {
            $http({
                url: adminurl + 'ConfigProperty/getDetail',
                method: 'POST'
            }).then(callback);
        },
        rotateImage: function (data, callback) {
            $http({
                url: adminurl + 'upload/rotateImage',
                data: data,
                method: 'POST'
            }).then(function (data) {
                callback(data.data);
            });
        },


        setDetail: function (data, callback) {
            if (data) {
                $.jStorage.set("detail", data);
                callback();
            }
        },

        removeDetail: function (data, callback) {
            // console.log('value', data);
            $.jStorage.flush(data);
            // callback();
        },
        getAllFolderNameCloud: function (type, callback) {
            $http({
                url: adminurl + 'vimeo/getAllFolderNameCloud',
                data: type,
                method: 'POST'

            }).then(callback);
        },
        // getFilesPerFolder: function (req, callback) {
        //     $http({
        //         url: adminurl + 'vimeo/getFilesPerFolder',
        //         data: req,
        //         method: 'POST'

        //     }).then(callback);
        // },

    };
});