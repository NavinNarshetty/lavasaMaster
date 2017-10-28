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
                    Medal.find().lean().exec(function (err, found) {
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

                        var medalRank = _(medals)
                            .groupBy('school')
                            .map(function (items, name) {
                                var gender = _(items)
                                    .groupBy('medals.medalType')
                                    .map(function (values, name) {
                                        return {
                                            name: name,
                                            count: values.length
                                        };
                                    }).value();
                                var result = _.sortBy(gender, item => parseFloat(item[1]));
                                return {
                                    name: name,
                                    medal: result,
                                    totalCount: items.length
                                };
                            }).value();
                        callback(null, medalRank);
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

    getSchool: function (data, callback) {
        //get all medals deepPopulate sport->sportslist->sportsListSubCategory
        //for each school get schoolname,sport,and all medaldata
    },

    getMedalsPerSport: function (data, callback) {
        //group by school->parallel groupBy medalType and groupBy (sportsListSubCategory.name and medalType)

    },





};
module.exports = _.assign(module.exports, exports, model);