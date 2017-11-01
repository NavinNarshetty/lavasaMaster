var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate')(mongoose);
var uniqueValidator = require('mongoose-unique-validator');
var timestamps = require('mongoose-timestamp');
var validators = require('mongoose-validators');
var monguurl = require('monguurl');
require('mongoose-middleware').initialize(mongoose);

var Schema = mongoose.Schema;

var schema = new Schema({});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('Result', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {

    getAggregatePipeline: function (data) {
        var pipeline = [
            // Stage 1
            {
                $lookup: {
                    "from": "individualsports",
                    "localField": "opponentsSingle",
                    "foreignField": "_id",
                    "as": "opponentsSingle"
                }
            },

            // Stage 2
            {
                $unwind: {
                    path: "$opponentsSingle",

                }
            },

            // Stage 3
            {
                $lookup: {
                    "from": "atheletes",
                    "localField": "opponentsSingle.athleteId",
                    "foreignField": "_id",
                    "as": "opponentsSingle.athleteId"
                }
            },

            // Stage 4
            {
                $unwind: {
                    path: "$opponentsSingle.athleteId",
                }
            },

            // Stage 5
            {
                $lookup: {
                    "from": "schools",
                    "localField": "opponentsSingle.athleteId.school",
                    "foreignField": "_id",
                    "as": "opponentsSingle.athleteId.school"
                }
            },

            // Stage 6
            {
                $unwind: {
                    path: "$opponentsSingle.athleteId.school",

                }
            },

            // Stage 7
            {
                $match: {
                    $or: [{
                        "opponentsSingle.athleteId.school.name": data.school
                    }, {
                        "opponentsSingle.athleteId.atheleteSchoolName": data.school
                    }]
                }
            },

            // Stage 8
            {
                $count: "count"
            },

        ];
        return pipeline;
    },

    getMedalsSchool: function (data, callback) {
        var medals = [];
        async.waterfall([
                function (callback) {
                    Medal.find().deepPopulate("sport sport.sportslist sport.sportslist.sportsListSubCategory").lean().exec(function (err, found) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(found)) {
                                callback(null, found);
                            } else {
                                callback(null, found);
                            }
                        }
                    });
                },
                function (found, callback) {
                    if (_.isEmpty(found)) {
                        callback(null, found);
                    } else {
                        var sendObj = {};

                        _.each(found, function (singleData) {
                            if (!_.isEmpty(singleData.school)) {
                                _.each(singleData.school, function (school) {
                                    var result = {};
                                    result.school = school.schoolName;
                                    result.medals = singleData;
                                    medals.push(result);
                                });
                            }
                        });

                        sendObj.medals = medals;

                        var medalRank = _(medals)
                            .groupBy('school')
                            .map(function (items, name) {
                                var gender = _(items)
                                    .groupBy('medals.medalType')
                                    .map(function (values, name) {
                                        return {
                                            name: name,
                                            count: values.length,
                                            points: values.length * Config.medalPoints[name]
                                        };
                                    }).value();
                                var countArr = _.map(gender, function (n) {
                                    return n.count;
                                });

                                var pointsArr = _.map(gender, function (n) {
                                    return n.points;
                                });

                                var totalCount = _.sum(countArr);
                                var totalPoints = _.sum(pointsArr);
                                // var result = _.sortBy(gender, item => parseFloat(item[1]));
                                return {
                                    name: name,
                                    medal: gender,
                                    totalCount: totalCount,
                                    totalPoints: totalPoints
                                };
                            }).value();
                        sendObj.medalRank = medalRank
                        callback(null, sendObj);
                    }
                },
            ],
            function (err, data2) {
                callback(null, data2);
            });
    },

    getRankSchool: function (data, callback) {
        var medals = [];
        async.waterfall([
                function (callback) {
                    Result.getMedalsSchool(data, function (err, medalRank) {
                        if (err) {
                            callback(err, null);
                        } else if (_.isEmpty(medalRank)) {
                            callback(null, []);
                        } else {
                            var result = _.sortBy(medalRank, item => parseFloat(item[1]));
                            callback(null, result);
                        }
                    });
                },
                function (result, callback) {
                    async.concatSeries(result, function (mainData, callback) {
                        console.log("mainData", mainData);
                        data.school = mainData.name;
                        var pipeLine = Result.getAggregatePipeline(data);
                        Match.aggregate(pipeLine, function (err, matchData) {
                            if (err) {
                                callback(err, "error in mongoose");
                            } else {
                                console.log("matchData", matchData);
                                mainData.totalMatch = matchData[0].count;
                                callback(null, mainData);
                            }
                        });
                    }, function (err, complete) {
                        if (err) {
                            callback(err, null);
                        } else {
                            var result = _(complete).chain()
                                .sort("totalMatch")
                                .reverse() // sort by date descending
                                .sort("totalCount") // sort by name ascending
                                .result()
                            callback(null, result);
                        }
                    });
                }
            ],
            function (err, data2) {
                callback(null, data2);
            });
    },

    getMatchesBySchool: function (callback) {

        var oppSingPipeline = [{
            $unwind: {
                path: "$opponentsSingle",
                includeArrayIndex: "arrayIndex", // optional
                preserveNullAndEmptyArrays: false // optional
            }
        }, {
            $lookup: {
                "from": "individualsports",
                "localField": "opponentsSingle",
                "foreignField": "_id",
                "as": "opponentsSingle"
            }
        }, {
            $unwind: {
                path: "$opponentsSingle",
                includeArrayIndex: "arrayIndex", // optional
                preserveNullAndEmptyArrays: false // optional
            }
        }, {
            $lookup: {
                "from": "atheletes",
                "localField": "opponentsSingle.athleteId",
                "foreignField": "_id",
                "as": "opponentsSingle.athleteId"
            }
        }, {
            $unwind: {
                path: "$opponentsSingle.athleteId",
                includeArrayIndex: "arrayIndex", // optional
                preserveNullAndEmptyArrays: false // optional
            }
        }, {
            $lookup: {
                "from": "schools",
                "localField": "opponentsSingle.athleteId.school",
                "foreignField": "_id",
                "as": "opponentsSingle.athleteId.school"
            }
        }, {
            $unwind: {
                path: "$opponentsSingle.athleteId.school",
                includeArrayIndex: "arrayIndex", // optional
                preserveNullAndEmptyArrays: false // optional
            }
        }, {
            $lookup: {
                "from": "sports",
                "localField": "sport",
                "foreignField": "_id",
                "as": "sport"
            }
        }, {
            $unwind: {
                path: "$sport",
                includeArrayIndex: "arrayIndex", // optional
                preserveNullAndEmptyArrays: false // optional
            }
        }];

        var oppTeamPipeline = [{
                $unwind: {
                    path: "$opponentsTeam",
                    includeArrayIndex: "arrayIndex", // optional
                    preserveNullAndEmptyArrays: false // optional
                }
            }, {
                $lookup: {
                    "from": "teamsports",
                    "localField": "opponentsTeam",
                    "foreignField": "_id",
                    "as": "opponentsTeam"
                }
            }, {
                $unwind: {
                    path: "$opponentsTeam",
                    includeArrayIndex: "arrayIndex", // optional
                    preserveNullAndEmptyArrays: false // optional
                }
            }, {
                $lookup: {
                    "from": "registrations",
                    "localField": "opponentsTeam.school",
                    "foreignField": "_id",
                    "as": "opponentsTeam.school"
                }
            }, {
                $unwind: {
                    path: "$opponentsTeam.school",
                    includeArrayIndex: "arrayIndex", // optional
                    preserveNullAndEmptyArrays: true // optional
                }
            },

        ];


        async.waterfall([

            function (callback) {
                var individualMatches = [];
                Match.aggregate(oppSingPipeline, function (err, result1) {
                    _.each(result1, function (n, k) {
                        var obj = {};
                        obj.matchId = n.matchId;
                        if (n.opponentsSingle.athleteId.school) {
                            obj.name = n.opponentsSingle.athleteId.school.name;
                        } else {
                            obj.name = n.opponentsSingle.athleteId.atheleteSchoolName;
                        }
                        individualMatches.push(obj);
                        if (k == result1.length - 1) {
                            callback(null, individualMatches);
                        }
                    });

                })
            },

            function (individualMatches, callback) {
                var teamMatches = [];
                Match.aggregate(oppTeamPipeline, function (err, result1) {
                    _.each(result1, function (n, k) {
                        var obj = {};
                        obj.matchId = n.matchId;
                        obj.name = n.opponentsTeam.schoolName;
                        teamMatches.push(obj);
                        if (k == result1.length - 1) {
                            callback(null, individualMatches, teamMatches);
                        }
                    });

                })
            }

        ], function (err, arr1, arr2) {
            finalArr = _.concat(arr1, arr2);
            finalArr = _.uniqBy(finalArr, 'matchId');
            finalArr = _(finalArr)
                .groupBy('name')
                .map(function (schoolMatches, schoolName) {
                    var tm = schoolMatches.length;
                    return {
                        name: schoolName,
                        totalMatches: tm
                    }
                }).value();

            callback(null, finalArr);
        })
    },

    getSchool: function (data, fcallback) {
        //get all medals deepPopulate sport->sportslist->sportsListSubCategory
        //for each school get schoolname,sport,and all medaldata
        async.waterfall([

            function (callback) {
                Result.getMedalsSchool({}, function (err, totalMedals) {
                    var medalRank = totalMedals.medalRank;
                    var medals = totalMedals.medals;
                    callback(null, medalRank, medals);
                });
            },

            function (medalRank, medals, callback) {
                Result.getMatchesBySchool(function (err, totalMatches) {
                    if (err) {
                        callback(err, null);
                    } else {
                        callback(null, medalRank, totalMatches, medals);
                    }
                });
            },

            function (medalRank, totalMatches, medals, callback) {
                var medalRanksBySport = _(medals)
                    .groupBy('school')
                    .map(function (items, name) {
                        var gender = _(items)
                            .groupBy('medals.sport.sportslist.sportsListSubCategory.name')
                            .map(function (values, name) {
                                var qwerty = _(values)
                                    .groupBy('medals.medalType')
                                    .map(function (values, name) {
                                        return {
                                            name: name,
                                            count: values.length,
                                            points: values.length * Config.medalPoints[name]
                                        };
                                    }).value();
                                var countArr = _.map(qwerty, function (n) {
                                    return n.count;
                                });

                                var pointsArr = _.map(qwerty, function (n) {
                                    return n.points;
                                });

                                var totalCount = _.sum(countArr);
                                var totalPoints = _.sum(pointsArr);
                                return {
                                    name: name,
                                    medals: qwerty,
                                    count: values.length,
                                    totalCount: totalCount,
                                    totalPoints: totalPoints
                                };
                            }).value();
                        return {
                            name: name,
                            sportData: gender,
                        };
                    }).value();
                callback(null,medalRank, totalMatches,medalRanksBySport);
            },

            function (medalRank, totalMatches,medalRanksBySport, callback){
                var totalLength= medalRank.length + totalMatches.length + medalRanksBySport.length;
                var finalArr=_.concat(medalRank, totalMatches,medalRanksBySport);
                var finalArrLength=finalArr.length;

                var tp=_(finalArr)
                .groupBy('name')
                .map(function(items,name){
                    return  _.assign.apply(_, items)
                })

                fcallback(null,tp);
            }

        ], function (err,result) {
            if (err) {

            } else {

            }
        })
    },

    getMedalsPerSport: function (data, callback) {
        //group by school->parallel groupBy medalType and groupBy (sportsListSubCategory.name and medalType)

    },





};
module.exports = _.assign(module.exports, exports, model);