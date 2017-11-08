var schema = new Schema({
    name: {
        type: String
    },
    medal: {
        "gold": {
            name: String,
            count: Number,
            points: Number
        },
        "silver": {
            name: String,
            count: Number,
            points: Number
        },
        "bronze": {
            name: String,
            count: Number,
            points: Number
        }
    },
    totalCount: Number,
    totalPoints: Number,
    totalMatches: Number,
    sportData: [{
        name: String,
        medals: {
            "gold": {
                name: String,
                count: Number,
                points: Number
            },
            "silver": {
                name: String,
                count: Number,
                points: Number
            },
            "bronze": {
                name: String,
                count: Number,
                points: Number
            }
        },
        count: Number,
        totalCount: Number,
        totalPoints: Number,
    }]
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('Rank', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {

    sortingOrder: {
        "totalPoints": -1,
        "medal.gold.points": -1,
        "medal.silver.points": -1,
        "medal.bronze.points": -1,
        "totalMatches": -1
    },

    getSchoolByRanks: function (callback) {
        Rank.find().sort(Rank.sortingOrder).lean().exec(function (err, data) {

            var sportsToMerge = ['Tennis', 'Badminton', 'Table Tennis', 'Athletics', 'Swimming']
            var sportsFound = [];
            var arr = [];


            async.concatSeries(data, function (singleData, callback) {

                _.each(sportsToMerge, function (sportName, key) {


                    singleData[sportName] = _.filter(singleData.sportData, function (sport) {
                        console.log(sport.name.indexOf(sportName) == 0);
                        if (sport.name.indexOf(sportName) != -1) {
                            return sport;
                        }
                    })

                    if (!_.isEmpty(singleData[sportName])) {
                        var obj = {
                            _ids: {},
                            name: sportName,
                            count: 0,
                            totalCount: 0,
                            totalPoints: 0,
                            medals: {
                                bronze: {
                                    name: "bronze",
                                    count: 0,
                                    points: 0
                                },
                                silver: {
                                    name: "silver",
                                    count: 0,
                                    points: 0
                                },
                                gold: {
                                    name: "gold",
                                    count: 0,
                                    points: 0
                                }
                            }
                        }
                        _.each(singleData[sportName], function (n) {
                            obj.count += n.count;
                            obj.totalCount += n.totalCount;
                            obj.totalPoints += n.totalPoints;
                            var o = {};
                            o[n.name] = n._id;
                            console.log("o", o);
                            obj._ids = _.assign(obj._ids, o);
                            console.log("obj", obj);
                            if (n && n.medals && n.medals['bronze']) {
                                obj.medals['bronze'].count += n.medals['bronze'].count;
                                obj.medals['bronze'].points += n.medals['bronze'].points;
                            }

                            if (n && n.medals && n.medals['silver']) {
                                obj.medals['silver'].count += n.medals['silver'].count;
                                obj.medals['silver'].points += n.medals['silver'].points;
                            }

                            if (n && n.medals && n.medals['gold']) {
                                obj.medals['gold'].count += n.medals['gold'].count;
                                obj.medals['gold'].points += n.medals['gold'].points;
                            }

                            n.removeElement = true;
                        });

                        singleData.sportData.push(obj);



                    }
                    delete singleData[sportName];
                    singleData.sportData = _.filter(singleData.sportData, function (n) {
                        return !n.removeElement;
                    });
                    if (sportsToMerge.length - 1 == key) {
                        callback(null, singleData);
                    }

                });

            }, function (err, result) {
                callback(null, result);
            });


            // if(err){
            //     callback(err,null);
            // }else{
            //     callback(null,data);
            // }
        });
    },

    getSchoolBySport: function (data, callback) {
        console.log("data", data);
        var str = '^' + data.name;
        var re = new RegExp(str, 'i');

        var sportRankipeline = [{
            $match: {
                "sportData.name": re
            }
        }, {
            $project: {
                "name": 1,
                "sportData": 1
            }
        }, {
            $unwind: {
                path: "$sportData",
                includeArrayIndex: "arrayIndex", // optional
                preserveNullAndEmptyArrays: false // optional
            }
        }, {
            $match: {
                "sportData.name": re
            }
        }, {
            $group: {
                "_id": "$name",
                "sportData": {
                    $push: "$sportData"
                },
                "count": {
                    "$sum": "$sportData.count"
                },
                "totalCount": {
                    "$sum": "$sportData.totalCount"
                },
                "totalPoints": {
                    "$sum": "$sportData.totalPoints"
                },
                "bronzeCount": {
                    "$sum": "$sportData.medals.bronze.count"
                },
                "bronzePoints": {
                    "$sum": "$sportData.medals.bronze.points"
                },
                "silverCount": {
                    "$sum": "$sportData.medals.silver.count"
                },
                "silverPoints": {
                    "$sum": "$sportData.medals.silver.points"
                },
                "goldCount": {
                    "$sum": "$sportData.medals.gold.count"
                },
                "goldPoints": {
                    "$sum": "$sportData.medals.gold.points"
                },
            }
        }, {
            $sort: {
                "totalPoints": -1,
                "goldPoints": -1,
                "silverPoints": -1,
                "bronzePoints": -1
            }
        }];

        var risingAwardPipeline = [{
            $lookup: {
                "from": "awards",
                "localField": "award",
                "foreignField": "_id",
                "as": "award"
            }
        }, {
            $unwind: {
                path: "$award",
                includeArrayIndex: "arrayIndex", // optional
                preserveNullAndEmptyArrays: false // optional
            }
        }, {
            $match: {
                "award.awardType": "rising"
            }
        }, {
            $unwind: {
                path: "$sports",
                includeArrayIndex: "arrayIndex", // optional
                preserveNullAndEmptyArrays: false // optional
            }
        }, {
            $lookup: {
                "from": "sportslistsubcategories",
                "localField": "sports",
                "foreignField": "_id",
                "as": "sports"
            }
        }, {
            $unwind: {
                path: "$sports",
                includeArrayIndex: "arrayIndex", // optional
                preserveNullAndEmptyArrays: false // optional
            }
        }, {
            $match: {
                "sports.name": data.name
            }
        },{
            $project: {
                "award": 1,
                "gender": 1,
                "athlete":1
            }
        }];


        var sendObj = {
            table: [],
            risingAthletes: []
        }

        // Rank.aggregate(sportRankipeline, function (err, result) {
        //     if (err) {
        //         callback(err, null);
        //     } else {
        //         sendObj.table = result;
        //         SpecialAwardDetails.aggregate(risingAwardPipeline, function (err, risingAwards) {
        //             sendObj.risingAthletes = risingAwards;
        //             console.log("risingAwards", risingAwards);
        //             if (err) {
        //                 callback(err, null);
        //             } else {
        //                 result.risingAthletes = risingAwards;
        //                 callback(null, sendObj);
        //             }
        //         })
        //     }
        // })

        async.waterfall([
            function (callback) {
                Rank.aggregate(sportRankipeline, function (err, result) {
                    if (err) {
                        callback(err, null);
                    } else {
                        var sendObj = {};
                        sendObj.table = result;
                        callback(null, sendObj);
                    }
                });
            },
            function(sendObj,callback){
                SpecialAwardDetails.aggregate(risingAwardPipeline, function (err, risingAwards) {
                    sendObj.risingAthletes = risingAwards;
                    console.log("risingAwards", risingAwards);
                    if (err) {
                        callback(err, null);
                    } else {
                        sendObj.risingAthletes = risingAwards;
                        callback(null, sendObj);
                    }
                })
            },
            function(sendObj,callback){
                async.concatSeries(sendObj.risingAthletes,function(singleData,callback){
                    var matchObj={
                        "athleteId":singleData.athlete
                    }
                    Profile.getAthleteProfile(matchObj,function(err,profile){
                        if(err){
                            callback(null,"");
                        }else{
                            singleData.medalData=_.groupBy(profile.medalData,'name'); 
                            singleData.sportsPlayed=_.map(profile.sport,'sportslist.sportsListSubCategory.name');
                            singleData.athleteProfile=profile.athlete;
                            callback(null,singleData);
                        }
                    })
                },function(err,result){
                    sendObj.risingAthletes=result;
                    callback(null,sendObj);
                })
            }

        ], function (err, finalData) {
            callback(null,finalData);
        })

    }
};
module.exports = _.assign(module.exports, exports, model);