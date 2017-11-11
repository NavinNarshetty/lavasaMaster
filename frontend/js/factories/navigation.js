// var imgPath = adminurl + "upload/readFile";
// var uploadUrl = adminurl + "upload/";
var adminUrl2 = adminurl;
var imgPath2 = adminUrl2 + "upload/readFile";
var uploadUrl2 = adminUrl2 + "upload/";

// var currentYears = ["2015", "2016"];
myApp.factory('NavigationService', function ($http, $window, $q, $timeout, $log, ResultSportInitialization) {
    var standardDelay = 1000;
    var navigation = [{
        name: "Home",
        classis: "active",
        anchor: "home",
        subnav: [{
            name: "Subnav1",
            classis: "active",
            anchor: "home"
        }]
    }, {
        name: "Form",
        classis: "active",
        anchor: "form",
        subnav: []
    }];

    return {
        getNavigation: function () {
            return navigation;
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


        getAwardsCertificate: function (request, callback) {
            $http({
                url: adminUrl2 + 'SpecialAwardDetails/getAwardsCertificate',
                method: 'POST',
                withCredentials: true,
                data: request
            }).then(function (data) {
                callback(data.data);
            });
        },

        getCertificate: function (request, callback) {
            $http({
                url: adminUrl2 + 'Medal/getCertificate',
                method: 'POST',
                withCredentials: true,
                data: request
            }).then(function (data) {
                callback(data.data);
            });
        },

        getAllYears: function () {
            return currentYears;
        },

        getAllBanner: function (callback) {
            $http({
                url: adminUrl + 'banner/getAll',
                method: 'POST',
                withCredentials: true
            }).success(callback);
        },

        getAllEnabledBanner: function (callback) {
            $http({
                url: adminUrl + 'banner/getAllEnabledBanner',
                method: 'POST',
                withCredentials: true
            }).success(callback);
        },

        getFirstListSchool: function (request, callback) {
            $http({
                url: adminUrl + 'school/getFirstList',
                method: 'POST',
                withCredentials: true,
                data: request
            }).success(callback);
        },

        getAllSchoolRank: function (request, callback) {
            $http({
                url: adminUrl + 'school/getAllSchoolRank',
                method: 'POST',
                withCredentials: true,
                data: request
            }).success(function (data) {
                data.data = _.filter(data.data, function (n) {
                    return n._id != "585764172f6a2920432518fb";
                });
                var ranks = _.map(data.data, function (n) {
                    n.points = (n.gold * 5) + (n.silver * 3) + (n.bronze * 2);
                    return n;
                });
                ranks = _.orderBy(ranks, ['points', 'gold', "silver", "bronze"], ["desc", 'desc', 'desc', 'desc']);
                ranks = _.map(ranks, function (n, key) {
                    n.rank = key + 1;
                    return n;
                });
                callback(ranks);
            });
        },

        getSearchDataSchool: function (input, callback) {
            $http({
                url: adminUrl + 'school/searchSchool',
                method: 'POST',
                withCredentials: true,
                data: input
            }).success(callback);
        },

        getDrawUpdatedSports: function (request, callback) {
            $http({
                url: adminUrl + 'StudentStats/getDrawUpdatedSports',
                method: 'POST',
                withCredentials: true,
                data: request
            }).success(callback);
        },

        getLeagueKnockout: function (request, callback) {
            $http({
                url: adminUrl + 'leagueknockout/getAll',
                method: 'POST',
                withCredentials: true,
                data: request
            }).success(callback);
        },

        getQualifyingRound: function (request, callback) {
            $http({
                url: adminUrl + 'qualifyinground/getAll',
                method: 'POST',
                withCredentials: true,
                data: request
            }).success(callback);
        },

        getSearchDataStudent: function (input, callback) {
            $http({
                url: adminUrl2 + 'profile/searchAthlete',
                method: 'POST',
                withCredentials: true,
                data: input
            }).then(function (data) {
                callback(data.data);
            });
        },

        resultDispatcher: function (drawFormat) {
            switch (drawFormat) {
                case 'Knockout':
                    return 'draw';
                case 'League':
                    return 'round-robin';
                case 'League cum Knockout':
                    return 'league-knockout';
                case 'Heats':
                    return 'heats';
                case 'Qualifying Round':
                    return 'qualify';
                case 'Swiss League':
                    return 'draw';
            }
        },

        getSearchDataTeam: function (input, callback) {
            $http({
                url: adminUrl2 + 'profile/searchTeam',
                method: 'POST',
                withCredentials: true,
                data: input
            }).then(function (data) {
                callback(data.data);
            });
        },

        getSchoolProfile: function (id, callback) {
            $http({
                url: adminUrl + 'school/getOne',
                method: 'POST',
                withCredentials: true,
                data: {
                    "_id": id
                }
            }).success(callback);
        },

        getOneSportForResult: function (request, callback) {
            $http({
                url: adminUrl + 'sport/getOneSportForResult',
                method: 'POST',
                withCredentials: true,
                data: request
            }).success(callback);
        },

        getOneSport: function (request, callback) {
            $http({
                url: adminUrl + 'sport/getOne',
                method: 'POST',
                data: request
            }).success(callback);
        },

        getOnePopulated: function (id, callback) {
            $http({
                url: adminUrl + 'school/getOnePopulated',
                method: 'POST',
                withCredentials: true,
                data: {
                    "_id": id
                }
            }).success(callback);
        },

        contingentStrengthByYear: function (request, callback) {
            $http({
                url: adminUrl + 'school/contingentStrengthByYear',
                method: 'POST',
                withCredentials: true,
                data: request
            }).success(callback);
        },

        getSchoolByYear: function (request, callback) {
            $http({
                url: adminUrl + 'school/getSchoolByYear',
                method: 'POST',
                withCredentials: true,
                data: request
            }).success(callback);
        },

        getSportRuleByName: function (request, callback) {
            $http({
                url: adminUrl + 'sportrule/getOneByName',
                method: 'POST',
                withCredentials: true,
                data: request
            }).success(callback);
        },

        getAllSportList: function (callback) {
            $http({
                url: adminUrl + 'sportsList/getAll',
                method: 'POST',
                withCredentials: true
            }).success(callback);
        },

        getOneBySportId: function (request, callback) {
            $http({
                url: adminUrl + 'sportrule/getOneBySportId',
                method: 'POST',
                withCredentials: true,
                data: request
            }).success(callback);
        },

        getStudentProfile: function (id, callback) {
            $http({
                url: adminUrl2 + 'profile/getAthleteProfile',
                method: 'POST',
                withCredentials: true,
                data: {
                    "athleteId": id
                }
            }).then(function (data) {
                callback(data.data);
            });
        },

        getSchoolProfileData: function (id, callback) {
            $http({
                url: adminUrl2 + 'profile/getSchoolProfile',
                method: 'POST',
                withCredentials: true,
                data: id
            }).then(function (data) {
                callback(data.data);
            });
        },

        editStudent: function (request, callback) {
            $http({
                url: adminUrl + 'student/editStudent',
                method: 'POST',
                withCredentials: true,
                data: request
            }).success(callback);
        },

        getTeamDetail: function (id, callback) {
            $http({
                url: adminUrl2 + 'profile/getTeamProfile',
                method: 'POST',
                withCredentials: true,
                data: {
                    "teamId": id
                }
            }).then(function (data) {
                callback(data.data);
            });
        },

        schoolSearch: function (request, callback) {
            $http({
                url: adminUrl2 + 'profile/searchSchool',
                method: 'POST',
                withCredentials: true,
                data: request
            }).then(function (data) {
                callback(data.data);
            });
        },

        getSchoolSportByGender: function (request, callback) {
            $http({
                url: adminUrl + 'studentsport/getSchoolSportByGender',
                method: 'POST',
                withCredentials: true,
                data: request
            }).success(callback);
        },

        getStudentSport: function (request, callback) {
            $http({
                url: adminUrl + 'studentsport/getsportspopulated',
                method: 'POST',
                withCredentials: true,
                data: request
            }).success(callback);
        },

        forFormSearch: function (request, i, callback) {
            $http({
                url: adminUrl + 'student/forFormSearch',
                method: 'POST',
                withCredentials: true,
                data: request
            }).success(function (data) {
                callback(data, i);
            });
        },

        forFormSearchSchool: function (request, i, callback) {
            $http({
                url: adminUrl + 'school/getLimitedSchool',
                method: 'POST',
                withCredentials: true,
                data: request
            }).success(function (data) {
                callback(data, i);
            });
        },

        getSchoolMedalCount: function (request, callback) {
            $http({
                url: adminUrl + 'medal/countOneSchoolMedal',
                method: 'POST',
                withCredentials: true,
                data: request
            }).success(callback);
        },

        getStudentMedalCount: function (request, callback) {
            $http({
                url: adminUrl + 'medal/countOneStudentMedal',
                method: 'POST',
                withCredentials: true,
                data: request
            }).success(callback);
        },

        getWinners: function (request, callback) {
            $http({
                url: adminUrl + 'medal/getMedalsBySport',
                method: 'POST',
                withCredentials: true,
                data: request
            }).success(callback);
        },

        getAthleteStats: function (request, callback) {
            $http({
                url: adminUrl2 + 'profile/getAthleteStats',
                method: 'POST',
                withCredentials: true,
                data: request
            }).then(function (data) {
                callback(data.data);
            });
        },

        getSchoolStats: function (request, callback) {
            $http({
                url: adminUrl2 + 'profile/getSchoolStats',
                method: 'POST',
                withCredentials: true,
                data: request
            }).then(function (data) {
                callback(data.data);
            });
        },
        getSchoolPerChoice: function (request, callback) {
            $http({
                url: adminUrl2 + 'Profile/getSchoolPerChoice',
                method: 'POST',
                data: request
            }).success(callback);
        },

        getDrawFormats: function (request, callback) {
            $http({
                url: adminUrl2 + 'profile/getDrawFormats',
                method: 'POST',
                withCredentials: true,
                data: request
            }).then(function (data) {
                callback(data.data);
            });
        },

        getTeamStats: function (request, callback) {
            $http({
                url: adminUrl2 + 'profile/getTeamStats',
                method: 'POST',
                withCredentials: true,
                data: request
            }).then(function (data) {
                callback(data.data);
            });
        },

        getAgegroup: function (callback) {
            $http({
                url: adminUrl + 'agegroup/getAll',
                method: 'POST'
            }).success(callback);
        },

        countStudent: function (callback) {
            $http({
                url: adminUrl + 'student/countStudent',
                method: 'POST'
            }).success(callback);
        },

        countTeam: function (callback) {
            $http({
                url: adminUrl + 'team/countTeam',
                method: 'POST'
            }).success(callback);
        },

        filterStud: function (data, callback) {
            $http({
                url: adminUrl + 'school/filterStud',
                method: 'POST',
                data: data
            }).success(callback);
        },

        filterCategoryBySport: function (request, callback) {
            $http({
                url: adminUrl + 'sport/filterCategoryForFrontend',
                method: 'POST',
                data: request
            }).success(callback);
        },

        filterCategoryForFrontendGender: function (request, callback) {
            $http({
                url: adminUrl + 'sport/filterCategoryForFrontendGender',
                method: 'POST',
                data: request
            }).success(callback);
        },

        filterAgegroupBySport: function (request, callback) {
            $http({
                url: adminUrl + 'sport/filterAgegroupForFrontend',
                method: 'POST',
                data: request
            }).success(callback);
        },

        // getFolders: function (request, callback) {
        //     $http({
        //         url: adminUrl + 'media/getFolders',
        //         method: 'POST',
        //         data: request
        //     }).success(callback);
        // },

        getSportRoundKnockout: function (request, callback) {
            $http({
                url: adminUrl + 'knockout/getSportRoundKnockout',
                method: 'POST',
                data: request
            }).success(callback);
        },

        getSportRoundHeat: function (request, callback) {
            $http({
                url: adminUrl + 'heat/getSportRoundHeat',
                method: 'POST',
                data: request
            }).success(callback);
        },

        apiCallWithData: function (url, formData, callback) {
            $http.post(adminUrl2 + url, formData).then(function (data) {
                data = data.data;
                callback(data);

            });
        },

        getSportRoundLeague: function (request, callback) {
            $http({
                url: adminUrl + 'league/getSportRoundLeague',
                method: 'POST',
                data: request
            }).success(callback);
        },

        getMedal: function (formData, callback) {
            $http.post(adminUrl + 'medal/getStudentMedal', formData).success(callback);
        },

        pdfGenerate: function (formData, callback) {
            $http.post(adminUrl + 'student/generatePdf', formData).then(function (data) {
                data = data.data;
                _.each(data.data, function (n) {
                    window.open(n);

                });
                // window.open(data.url);
            });
            //   $window.open(data.url);
        },

        // getLimitedMedia: function (request, callback) {
        //     $http({
        //         url: adminUrl + 'media/getLimitedMedia',
        //         method: 'POST',
        //         data: request
        //     }).success(callback);
        // },

        //**********NEW MODULE Form Registration***********//

        getSchoolName: function (request, callback) {
            $http({
                url: adminUrl2 + 'school/getAllSchoolDetails',
                method: 'POST',
                data: request
            }).success(callback);
        },

        getFolders: function (request, callback) {
            $http({
                url: adminUrl2 + 'media/getFolders',
                method: 'POST',
                data: request
            }).success(callback);
        },

        getLimitedMedia: function (request, callback) {
            $http({
                // url: adminUrl2 + 'media/getLimitedMedia',
                url: adminUrl2 + 'media/getMedias',
                method: 'POST',
                data: request
            }).success(callback);
        },



        getVideoThumbnail: function (mediaArr) {
            _.each(mediaArr, function (key) {
                if (key.videotype === 'youtube') {
                    key.thumbnail = "http://img.youtube.com/vi/" + key.medialink + "/hqdefault.jpg";

                } else if (key.videotype === 'vimeo') {
                    $http.jsonp('http://vimeo.com/api/v2/video/' + key.medialink + '.json?callback=JSON_CALLBACK&_=')
                        .success(function (res) {
                            if (res) {
                                // key.thumbnail = res[0].thumbnail_large;
                                key.thumbnail = res[0].thumbnail_medium;
                                // key.thumbnail = res[0].thumbnail_small;
                            }
                        })
                        .error(function (err) {
                            console.log('error', err);

                        });
                }
                return mediaArr;
            });

        },

        getSchoolSFA: function (request, callback) {
            $http({
                url: adminUrl2 + 'school/search',
                method: 'POST',
                data: {
                    keyword: request
                },
            }).success(callback);
        },

        getAtheleteSFA: function (request, callback) {
            $http({
                url: adminUrl2 + 'student/search',
                method: 'POST',
                data: {
                    keyword: request
                },
            }).success(callback);
        },

        //**********NEW MODULE SPORTS REGISTRATION***********//

        login: function (request, callback) {
            $http({
                url: adminUrl2 + 'login/login',
                method: 'POST',
                data: request
            }).then(callback);
        },

        setUser: function (data) {
            $.jStorage.set("userDetails", data, {
                TTL: 86400000
            });
        },
        setTeamid: function (id) {
            $.jStorage.set("teamId", id);
            $.jStorage.set("tempTeamId", id);
        },
        setVariable: function (flag) {
            $.jStorage.set("flag", flag);
        },
        setIsColg: function (data) {
            $.jStorage.set("IsColg", data);
        },

        editTeamId: function (id) {
            $.jStorage.set("editTeamId", id);
        },
        setSportId: function (data) {
            $.jStorage.set("sportId", data);
        },
        setAgeTitle: function (data) {
            $.jStorage.set("ageTitle", data);
        },
        setGender: function (data) {
            $.jStorage.set("gender", data);
        },
        setSportTitle: function (data) {
            $.jStorage.set("sportTitle", data);
        },
        setUserType: function (data) {
            $.jStorage.set("userType", data);
        },

        setUserSchool: function (schoolName) {
            $.jStorage.set("schoolName", schoolName);
        },
        setSportTeamMembers: function (teamMember) {
            $.jStorage.set("sportTeamMember", teamMember);
        },

        // logoutCandidate: function (callback) {
        //     var requestObjUserType = {};
        //     var logoutObj = {};
        //     if ($.jStorage.get("userType") !== null && $.jStorage.get("userDetails") !== null) {
        //         if ($.jStorage.get("userType") == "school") {
        //             requestObjUserType.schoolToken = $.jStorage.get("userDetails").accessToken;
        //             this.logoutCommonFun(requestObjUserType, function (data) {
        //                 logoutObj.isLoggedIn = data;
        //                 callback(logoutObj);
        //             });
        //         } else {
        //             requestObjUserType.athleteToken = $.jStorage.get("userDetails").accessToken;
        //             this.logoutCommonFun(requestObjUserType, function (data) {
        //                 logoutObj.isLoggedIn = data;
        //                 callback(logoutObj);
        //             });
        //         }
        //     }
        // },

        // logoutCommonFun: function (logData, callback) {
        //     var returnObj = '';
        //     this.logout(logData, function (data) {
        //         if (data.value) {
        //             returnObj = false;
        //             callback(returnObj);
        //         } else {
        //             returnObj = true;
        //             callback(returnObj);
        //         }
        //     });
        // },

        logout: function (request, callback) {
            $.jStorage.flush();
            $http({
                url: adminUrl2 + 'login/logout',
                method: 'POST',
                data: request
            }).success(callback);
        },

        forgotPassword: function (request, url, callback) {
            $http({
                url: adminUrl2 + url,
                method: 'POST',
                withCredentials: true,
                data: request
            }).then(callback);
        },

        changePassword: function (request, callback) {
            $http({
                url: adminUrl2 + 'login/changePassword',
                method: 'POST',
                withCredentials: true,
                data: request
            }).then(callback);
        },

        getAllSportsListSubCategory: function (callback) {
            $http({
                url: adminUrl2 + 'SportsListSubCategory/getAll',
                method: 'POST'
            }).then(callback);
        },

        getSportsRules: function (id, callback) {
            var data = {
                _id: id
            };
            $http({
                url: adminUrl2 + 'SportsListSubCategory/getRules',
                method: 'POST',
                data: data
            }).then(callback);
        },

        getOneRuleBySportsName: function (name, callback) {
            var data = {
                sportName: name
            };
            $http({
                url: adminUrl2 + 'SportsListSubCategory/getOneRuleBySportsName',
                method: 'POST',
                data: data
            }).then(callback);
        },

        getSports: function (id, callback) {
            $http({
                url: adminUrl2 + 'SportsListSubCategory/getSports',
                method: 'POST',
                data: id
            }).then(callback);
        },

        getOneSportForRegistration: function (data, url, callback) {
            $http({
                url: adminUrl2 + url,
                method: 'POST',
                data: data
            }).then(callback);
        },

        getAthletePerSchool: function (request, url, callback) {
            $http({
                url: adminUrl2 + url,
                //    url: adminUrl2 + 'sport/getAthletePerSchool',
                method: 'POST',
                data: request
            }).then(callback);
        },
        getIndividualAthlete: function (request, callback) {
            $http({
                url: adminUrl2 + 'IndividualSport/getAthletePerSchool',
                method: 'POST',
                data: request
            }).then(callback);
        },
        teamConfirm: function (request, callback) {
            var url = '';
            if ($.jStorage.get("editTeamId") !== null) {
                url = 'teamSport/editSaveTeam';
            } else {
                url = 'teamSport/teamConfirm';
            }
            $http({
                url: adminUrl2 + url,
                method: 'POST',
                data: request
            }).then(callback);
        },
        individualConfirm: function (request, callback) {
            $http({
                url: adminUrl2 + 'individualSport/saveInIndividual',
                method: 'POST',
                data: request
            }).then(callback);
        },
        getAllFaqs: function (callback) {
            $http({
                url: adminUrl2 + 'Faq/search',
                method: 'POST'
            }).then(callback);
        },
        getEvents: function (request, callback) {
            // var data = {
            //     _id: id
            // };
            $http({
                url: adminUrl2 + 'SportsListSubCategory/getEvents',
                method: 'POST',
                data: request
            }).then(callback);
        },
        success: function () {
            var defer = $q.defer();
            $timeout(function () {
                $log.info('resolve');
                defer.resolve({
                    msg: 'SUCCESS'
                });
            }, standardDelay);
            return defer.promise;
        },
        // error: function () {
        //     var defer = $q.defer();
        //     $timeout(function () {
        //         $log.info('error');
        //         defer.reject({
        //             msg: 'ERROR'
        //         });
        //     }, standardDelay);
        //     return defer.promise;
        // },
        // endless: function () {
        //     var defer = $q.defer();
        //     return defer.promise;
        // }
        //get subCategory Type Basic Details
        getSportDetails: function (subCategoryId, callback) {
            $http({
                url: adminUrl2 + 'SportsListSubCategory/getSportsDeails',
                method: 'POST',
                data: subCategoryId
            }).then(function (data) {
                if (data.data.value) {
                    callback(data.data);
                } else {
                    console.log(data);
                }
            });
        },
        getAllRegisteredSport: function (request, callback) {
            $http({
                url: adminUrl2 + 'RegisteredSports/getAllRegisteredSport',
                method: 'POST',
                data: request
            }).then(callback);
        },
        getDetailRegisteredSport: function (request, callback) {
            $http({
                url: adminUrl2 + 'RegisteredSports/getDetailRegisteredSport',
                method: 'POST',
                data: request
            }).then(callback);
        },
        getQuickSportId: function (request, callback) {
            $http({
                url: adminUrl2 + 'match/getQuickSportId',
                method: 'POST',
                data: request
            }).then(callback);
        },
        getAllBySport: function (request, callback) {
            $http({
                url: adminUrl2 + 'SportsList/getAllBySport',
                method: 'POST',
                data: request
            }).then(callback);
        },
        getSportQualifyingKnockoutRounds: function (request, callback) {
            $http({
                url: adminUrl2 + 'match/getSportQualifyingKnockoutRounds',
                method: 'POST',
                data: request
            }).then(callback);
        },
        getSportLeagueKnockoutRounds: function (request, callback) {
            $http({
                url: adminUrl2 + 'match/getSportLeagueKnockoutRounds',
                method: 'POST',
                data: request
            }).then(callback);
        },
        getSportSpecificQualifyingRound: function (request, callback) {
            $http({
                url: adminUrl2 + 'match/getSportSpecificRounds',
                method: 'POST',
                data: request
            }).then(callback);
        },
        getSportStandings: function (request, url, callback) {
            $http({
                url: adminUrl2 + url,
                method: 'POST',
                data: request
            }).then(callback);
        },
        getOneSportDetail: function (request, callback) {
            $http({
                url: adminUrl2 + 'sport/getOne',
                method: 'POST',
                data: request
            }).then(callback);
        },
        getSportSpecificRounds: function (request, callback) {

            $http({
                url: adminurl + 'match/getSportSpecificRounds',
                method: 'POST',
                data: request
            }).then(function (data) {
                if (!_.isEmpty(data.data.data.roundsList)) {
                    var knockout = data.data.data;
                    var sportType = knockout.roundsList[0].match[0].sport.sportslist.sportsListSubCategory.sportsListCategory.name;
                    var sportName = knockout.roundsList[0].match[0].sport.sportslist.name;
                    console.log(sportType, sportName);
                    var resultVar = ResultSportInitialization.getResultVariable(sportName, sportType);
                    console.log(resultVar);

                    function sortOpponents(arrToSort, match1, match2, key) {
                        console.log("arrToSort", arrToSort);
                        console.log("match1", match1);
                        console.log("match2", match2);
                        console.log("key", key);

                        _.remove(arrToSort, function (n) {
                            return n == null;
                        });
                        // console.log("match1", match1);
                        // console.log("match2", match2);
                        var sortedArr = _.cloneDeep(arrToSort);

                        if (_.isEmpty(arrToSort)) {
                            // console.log("------------------------------------------");

                            return [{}, {}];
                        } else if (arrToSort.length == 1) {
                            var index = _.findIndex(match1, ["_id", arrToSort[0]._id]);
                            console.log(index);
                            if (index == -1) {
                                sortedArr[0] = {};
                                sortedArr[1] = arrToSort[0];
                            } else {
                                sortedArr[0] = arrToSort[0];
                                sortedArr[1] = {};
                            }
                            console.log("sortedArr", sortedArr);
                            // console.log("arrayLength 1");
                            // console.log("------------------------------------------");

                            return sortedArr;
                        } else if (arrToSort.length == 2) {
                            if (_.findIndex(match1, ["_id", arrToSort[0]._id]) == -1) {
                                sortedArr[0] = arrToSort[1];
                                sortedArr[1] = arrToSort[0];
                            } else {
                                sortedArr[0] = arrToSort[0];
                                sortedArr[1] = arrToSort[1];
                            }
                            // console.log("sortedArr", sortedArr);
                            // console.log("arrayLength 2");
                            // console.log("------------------------------------------");

                            return sortedArr;
                        }
                    }
                    _.each(knockout.roundsList, function (round, key) {
                        if (key > 0 && key < 3) {
                            _.each(round.match, function (match, index) {
                                console.log(match);
                                var match1, match2;

                                if (knockout && knockout.roundsList[key - 1] && knockout.roundsList[key - 1].match[index * 2] && knockout.roundsList[key - 1].match[index * 2][resultVar.opponentsVar]) {
                                    match1 = knockout.roundsList[key - 1].match[index * 2][resultVar.opponentsVar];
                                }
                                if (knockout && knockout.roundsList[key - 1] && knockout.roundsList[key - 1].match[index * 2 + 1] && knockout.roundsList[key - 1].match[index * 2][resultVar.opponentsVar]) {
                                    match2 = knockout.roundsList[key - 1].match[index * 2 + 1][resultVar.opponentsVar];
                                }
                                console.log(match[resultVar.opponentsVar], "resultVar.opponentsVar");
                                match[resultVar.opponentsVar] = sortOpponents(match[resultVar.opponentsVar], match1, match2, key);
                                console.log(match[resultVar.opponentsVar], "resultVar.opponentsVar");
                            });
                        }
                    });
                    console.log(data.data.data);
                    callback(data);
                }

            });
        },
        editDetails: function (id, callback) {
            $http({
                url: adminUrl2 + 'Login/editAccess',
                method: 'POST',
                data: id
            }).then(callback);
        },
        editTeam: function (id, callback) {
            $http({
                url: adminUrl2 + 'teamsport/editTeam',
                method: 'POST',
                data: id
            }).then(callback);
        },
        getDetail: function (callback) {
            $http({
                url: adminUrl2 + 'ConfigProperty/getDetail',
                method: 'POST'
            }).then(callback);
        },
        getAllSpotsList: function (callback) {
            $http({
                url: adminUrl2 + 'SportsListSubCategory/getAllSport',
                method: 'POST'
            }).then(callback);
        },
        getSportsList: function (callback) {
            $http({
                url: adminUrl2 + 'SportsList/getAll',
                method: 'POST'
            }).then(callback);
        },

        getAllAgeGroups: function (callback) {
            $http({
                url: adminUrl2 + 'AgeGroup/getAll',
                method: 'POST'
            }).then(callback);
        },
        getAllAgeGroupsByEvent: function (req, callback) {
            $http({
                url: adminUrl2 + 'AgeGroup/getperSportslist',
                data: req,
                method: 'POST'
            }).then(callback);
        },
        getAllWeights: function (callback) {
            $http({
                url: adminUrl2 + 'Weight/getAll',
                method: 'POST'
            }).then(callback);
        },
        getAllWeightsByEvent: function (req, callback) {
            $http({
                url: adminUrl2 + 'Weight/getWeightPerSportslist',
                data: req,
                method: 'POST'
            }).then(callback);
        },
        Boolean: function (str) {
            if (str) {
                if (str == 'true' || str === true) {
                    return true;
                } else {
                    return false;
                }
            }
        },
        getAllEventsByMonth: function (callback) {
            $http({
                url: adminUrl2 + 'SpecialEvent/getAllEventsByMonth',
                method: 'POST'
            }).then(callback);
        },
        savePaymentAdditional: function (formData, callback) {
            $http({
                url: adminUrl2 + 'AdditionalPayment/save',
                method: 'POST',
                data: formData
            }).then(callback);
        },
        getOneBySfaId: function (formData, callback) {
            $http({
                url: adminUrl2 + 'Athelete/getOneBySfaId',
                method: 'POST',
                data: formData
            }).then(callback);
        },
        getOneSponsor: function (formData, callback) {
            $http({
                url: adminUrl2 + 'SponsorPage/getOne',
                method: 'POST',
                data: formData
            }).then(callback);
        },
        getSponsorCard: function (formData, callback) {
            $http({
                url: adminUrl2 + 'SponsorCard/getAllBySponsorPageId',
                method: 'POST',
                data: formData
            }).then(callback);
        },
        getPerTeamFilter: function (formData, callback) {
            $http({
                url: adminUrl2 + 'EventBib/getAllTeamSport',
                method: 'POST',
                data: formData
            }).then(callback);
        },
        getPlayerPerTeam: function (formData, callback) {
            $http({
                url: adminUrl2 + 'EventBib/getPlayerPerTeam',
                method: 'POST',
                data: formData
            }).then(callback);
        },
        getteamAthleteID: function (formData, callback) {
            $http({
                url: adminUrl2 + 'EventBib/getAthleteProfile',
                method: 'POST',
                data: formData
            }).then(callback);
        },
        getAthletesfaID: function (id, callback) {
            $http({
                url: adminUrl2 + 'Athelete/searchByNameId',
                method: 'POST',
                data: id
            }).then(callback);
        },
        getSponsor: function (callback) {
            $http({
                url: adminUrl2 + 'SponsorPage/getAllBySponsorType',
                method: 'POST'
            }).then(callback);
        },
        getAllWinners: function (sportId, callback) {
            $http({
                url: adminUrl2 + 'Match/getAllWinners',
                data: sportId,
                method: 'POST'
            }).then(callback);
        },

        getSchool: function (callback) {
            $http({
                url: adminUrl2 + 'school/searchByFilter',
                method: 'POST'
            }).then(callback);
        },
        getSchoolRegistration: function (formData, callback) {
            $http({
                url: adminUrl2 + 'registration/search',
                method: 'POST',
                data: formData
            }).then(callback);
        },
        getSchoolByRanks: function (callback) {
            $http({
                url: adminUrl2 + 'rank/getSchoolByRanks',
                method: 'POST',
            }).success(callback);
        },
        getSchoolBySport: function (formData, callback) {
            $http({
                url: adminUrl2 + 'rank/getSchoolBySport',
                method: 'POST',
                data: formData
            }).then(callback);
        },
    };
});