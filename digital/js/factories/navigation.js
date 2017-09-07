var uploadurl = adminurl + "upload/";
myApp.factory('NavigationService', function ($http) {
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
        },
        {
            name: "Grid",
            classis: "active",
            anchor: "grid",
            subnav: []
        }
    ];

    return {
        getNavigation: function () {
            return navigation;
        },
        getOneMatch: function(formData, callback){
          $http({
              url: adminurl + "match/getOne",
              method: "POST",
              data: formData
          }).success(function (data) {
            console.log(data,"nav");
              callback(data)
          });
        },
        saveMatch: function(formData, callback){
          // console.log(formData, 'saveMatch');
          $http({
              url: adminurl + "match/updateResult",
              method: "POST",
              data: formData
          }).success(function (data) {
              callback(data)
          });
        },
        getAllSportsList: function(callback) {
            $http({
                url: adminurl + 'SportsList/getAll',
                method: 'POST'
            }).then(callback);
        },
        getAllAgeGroups: function(callback) {
            $http({
                url: adminurl + 'AgeGroup/getAll',
                method: 'POST'
            }).then(callback);
        },
        getAllWeights: function(callback) {
            $http({
                url: adminurl + 'Weight/getAll',
                method: 'POST'
            }).then(callback);
        },
        getQuickSportId: function(request, callback) {
            $http({
                url: adminurl + 'match/getQuickSportId',
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
                var knockout = data.data.data;
                console.log(knockout);

                function sortOpponents(arrToSort, match1, match2) {
                    console.log("arrToSort", arrToSort);
                    console.log("match1", match1);
                    console.log("match2", match2);
                    var sortedArr = _.cloneDeep(arrToSort);

                    if (_.isEmpty(arrToSort)) {
                        console.log("------------------------------------------");

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
                        console.log("arrayLength 1");
                        console.log("------------------------------------------");

                        return sortedArr;
                    } else if (arrToSort.length == 2) {
                        if (_.findIndex(match1, ["_id", arrToSort[0]._id]) == -1) {
                            sortedArr[0] = arrToSort[1];
                            sortedArr[1] = arrToSort[0];
                        } else {
                            sortedArr[0] = arrToSort[0];
                            sortedArr[1] = arrToSort[1];
                        }
                        console.log("sortedArr", sortedArr);
                        console.log("arrayLength 2");
                        console.log("------------------------------------------");

                        return sortedArr;
                    }
                }
                _.each(knockout.roundsList, function (round, key) {
                    if (key > 0 && key < 3) {
                        _.each(round.match, function (match, index) {
                            var match1, match2;

                            if (knockout && knockout.roundsList[key - 1] && knockout.roundsList[key - 1].match[index * 2] && knockout.roundsList[key - 1].match[index * 2].opponentsSingle) {
                                match1 = knockout.roundsList[key - 1].match[index * 2].opponentsSingle;
                            }
                            if (knockout && knockout.roundsList[key - 1] && knockout.roundsList[key - 1].match[index * 2 + 1] && knockout.roundsList[key - 1].match[index * 2].opponentsSingle) {
                                match2 = knockout.roundsList[key - 1].match[index * 2 + 1].opponentsSingle;
                            }
                            match.opponentsSingle = sortOpponents(match.opponentsSingle, match1, match2);
                        });
                    }
                });
                console.log(data.data.data);
                callback(data);
            });
        },
        getAllSpotsList: function (callback) {
            $http({
                url: adminurl + 'SportsListSubCategory/getAllSport',
                method: 'POST'
            }).then(callback);
        },
        getAllBySport: function (request, callback) {
            $http({
                url: adminurl + 'SportsList/getAllBySport',
                method: 'POST',
                data: request
            }).then(callback);
        }
    };
});
