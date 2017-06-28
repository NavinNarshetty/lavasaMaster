var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate')(mongoose);
var uniqueValidator = require('mongoose-unique-validator');
var timestamps = require('mongoose-timestamp');
var validators = require('mongoose-validators');
var monguurl = require('monguurl');
var objectid = require("mongodb").ObjectID;
var lodash = require('lodash');
var moment = require('moment');

var schema = new Schema({
    gender: String,
    maxTeam: Number,
    minTeamPlayers: Number,
    maxTeamPlayers: Number,
    sportslist: {
        type: Schema.Types.ObjectId,
        ref: 'SportsList',
        index: true
    },
    ageGroup: {
        type: Schema.Types.ObjectId,
        ref: 'AgeGroup',
        index: true
    },
    weight: {
        type: Schema.Types.ObjectId,
        ref: 'Weight',
        index: true
    },
    fromDate: Date,
    toDate: Date
});

schema.plugin(deepPopulate, {
    populate: {
        'sportslist': {
            select: '_id name sporttype drawFormat rules inactiveimage image'
        },
        'ageGroup': {
            select: '_id name'
        },
        'weight': {
            select: '_id name'
        }

    }
});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('Sport', schema);
var exports = _.cloneDeep(require("sails-wohlig-service")(schema, "sportslist ageGroup weight", "sportslist ageGroup weight"));
var model = {

    getAggregatePipeLine: function (data) {

        var pipeline = [
            // Stage 1
            {
                $lookup: {
                    "from": "schools",
                    "localField": "school",
                    "foreignField": "_id",
                    "as": "school"
                }
            },
            // Stage 2
            {
                $unwind: {
                    path: "$school",
                    preserveNullAndEmptyArrays: true // optional
                }
            },
            // Stage 3
            {
                $match: {

                    $or: [{
                            "school.name": {
                                $regex: data.school
                            }
                        },
                        {
                            "atheleteSchoolName": {
                                $regex: data.school
                            }
                        }
                    ]

                }
            },
            // Stage 4
            {
                $match: {
                    $or: [{
                        registrationFee: {
                            $ne: "online PAYU"
                        }
                    }, {
                        paymentStatus: {
                            $ne: "Pending"
                        }
                    }]
                }
            }, {
                $match: {
                    "gender": data.gender,
                    "dob": {
                        $gte: new Date(data.fromDate),
                        $lte: new Date(data.toDate),
                    }
                }
            },

        ];
        return pipeline;
    },

    getSearchPipeLine: function (data) {

        var pipeline = [
            // Stage 1
            {
                $lookup: {
                    "from": "sportslists",
                    "localField": "sportslist",
                    "foreignField": "_id",
                    "as": "sportslist"
                }
            },
            // Stage 2
            {
                $unwind: {
                    path: "$sportslist",
                    // preserveNullAndEmptyArrays: true // optional
                }
            },
            // Stage 3
            {
                $lookup: {
                    "from": "agegroups",
                    "localField": "ageGroup",
                    "foreignField": "_id",
                    "as": "ageGroup"
                }
            },

            // Stage 4
            {
                $unwind: {
                    path: "$ageGroup",

                }
            },
            // Stage 5
            {
                $match: {
                    "sportslist.name": {
                        $regex: data.keyword,
                        $options: "i"

                    }
                }
            },
            {
                $sort: {
                    "createdAt": -1
                }
            },
        ];
        return pipeline;
    },

    getAthletePerSchool: function (data, callback) {

        async.waterfall([
                function (callback) {
                    Sport.findOne({
                        _id: data.sport
                    }).exec(function (err, found) {
                        if (_.isEmpty(found)) {
                            callback(null, []);
                        } else {
                            data.fromDate = found.fromDate;
                            data.toDate = found.toDate;
                            console.log("fromDate", data.fromDate);
                            console.log("toDate", data.toDate);
                            callback(null, data);
                        }
                    });
                },
                function (data, callback) {
                    Sport.allAthelete(data, function (err, complete) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(complete)) {
                                callback(null, []);
                            } else {
                                console.log("complete", complete);
                                callback(null, complete);
                            }
                        }
                    });
                },
                function (complete, callback) {
                    var results = {};
                    var finalData = [];
                    console.log("total", complete.total);
                    async.each(complete.results, function (n, callback) {
                        StudentTeam.find({
                            studentId: n._id,
                            sport: data.sport
                        }).lean().exec(function (err, found) {
                            if (_.isEmpty(found)) {
                                var athlete = {};
                                athlete = n;
                                athlete.isTeamSelected = false;
                                finalData.push(athlete);
                                results.data = finalData;
                                results.total = complete.total;
                                console.log("data", results);
                                callback(null, results);
                            } else {
                                var athlete = {};
                                athlete = n
                                athlete.isTeamSelected = true;
                                finalData.push(athlete);
                                results.data = finalData;
                                results.total = complete.total;
                                console.log("data", results);
                                callback(null, results);
                            }
                        });
                    }, function (err) {
                        if (err) {
                            callback(err, null);
                        } else if (_.isEmpty(results)) {
                            callback(null, []);
                        } else {
                            callback(null, results);
                        }
                    });
                }
            ],
            function (err, results) {
                if (err) {
                    console.log(err);
                    callback(null, []);
                } else if (results) {
                    if (_.isEmpty(results)) {
                        callback(null, []);
                    } else {
                        callback(null, results);
                    }
                }
            });

        // findAll Athlete with filters school,Gender, AgeGroup, AtheleteId - > Pagination 20
        //    asycn.eachLimit();
        //        SportId -> Student -> Team Callback ->  
        // if(teamID) -> CurrentTeam

    },

    allAthelete: function (data, callback) {
        async.waterfall([
                function (callback) {
                    console.log("school", data.school);
                    var maxRow = 9;
                    var page = 1;
                    if (data.page) {
                        page = data.page;
                    }
                    var start = (page - 1) * maxRow;
                    console.log("options", start);
                    if (_.isEmpty(data.sfaid)) {
                        var pipeLine = Sport.getAggregatePipeLine(data);
                        console.log("pipeLine", pipeLine);
                        async.waterfall([
                                function (callback) {
                                    var dataFinal = {};
                                    Sport.totalAthlete(data, function (err, complete1) {
                                        if (err) {
                                            callback(err, null);
                                        } else {
                                            console.log("complete1", complete1);
                                            dataFinal.total = complete1;
                                            callback(null, dataFinal);
                                        }

                                    });
                                },
                                function (dataFinal, callback) {
                                    var newPipeLine = _.cloneDeep(pipeLine);
                                    newPipeLine.push(
                                        // Stage 6
                                        {
                                            '$skip': parseInt(start)
                                        }, {
                                            '$limit': maxRow
                                        });
                                    Athelete.aggregate(newPipeLine, function (err, totals) {
                                        if (err) {
                                            console.log(err);
                                            callback(err, "error in mongoose");
                                        } else {
                                            if (_.isEmpty(totals)) {
                                                callback(null, []);
                                            } else {
                                                // data.options = options;
                                                dataFinal.results = totals;
                                                console.log("athelete", dataFinal);
                                                callback(null, dataFinal);
                                            }
                                        }
                                    });
                                }

                            ],
                            function (err, data2) {
                                if (err) {
                                    console.log(err);
                                    callback(null, []);
                                } else if (data2) {
                                    if (_.isEmpty(data2)) {
                                        callback(null, []);
                                    } else {
                                        callback(null, data2);
                                    }
                                }
                            });

                    } else {
                        var pipeLine = Sport.getAggregatePipeLine(data);
                        async.waterfall([
                                function (callback) {
                                    var dataFinal = {};
                                    Sport.totalAthlete(data, function (err, complete1) {
                                        if (err) {
                                            callback(err, null);
                                        } else {
                                            dataFinal.total = complete1;
                                            callback(null, dataFinal);
                                        }
                                    });
                                },
                                function (dataFinal, callback) {
                                    var newPipeLine = _.cloneDeep(pipeLine);
                                    newPipeLine.push({
                                        $match: {
                                            sfaId: data.sfaid,
                                        },
                                        // Stage 6
                                    });
                                    newPipeLine.push(
                                        // Stage 6
                                        {
                                            '$skip': parseInt(start)
                                        }, {
                                            '$limit': maxRow
                                        });
                                    Athelete.aggregate(newPipeLine, function (err, totals) {
                                        if (err) {
                                            console.log(err);
                                            callback(err, "error in mongoose");
                                        } else {
                                            if (_.isEmpty(totals)) {
                                                callback(null, "No Athlete with this SFA-ID found");
                                            } else {
                                                // var data = {};
                                                // data.options = options;
                                                dataFinal.results = totals;
                                                // data.total = count;
                                                callback(null, dataFinal);
                                            }
                                        }

                                    });
                                }

                            ],
                            function (err, data2) {
                                if (err) {
                                    console.log(err);
                                    callback(null, []);
                                } else if (data2) {
                                    if (_.isEmpty(data2)) {
                                        callback(null, []);
                                    } else {
                                        callback(null, data2);
                                    }
                                }
                            });
                    }
                }
            ],
            function (err, data2) {
                if (err) {
                    console.log(err);
                    callback(null, []);
                } else if (data2) {
                    if (_.isEmpty(data2)) {
                        callback(null, []);
                    } else {
                        callback(null, data2);
                    }
                }
            });

    },

    totalAthlete: function (data, callback) {
        if (_.isEmpty(data.sfaid)) {
            var pipeLine = Sport.getAggregatePipeLine(data);
            Athelete.aggregate(pipeLine, function (err, totals) {
                if (err) {
                    console.log(err);
                    callback(err, "error in mongoose");
                } else {
                    if (_.isEmpty(totals)) {
                        callback(null, 0);
                    } else {
                        var count = totals.length;
                        console.log("counttotal", count);
                        callback(null, count);
                    }
                }
            });
        } else {
            var pipeLine = Sport.getAggregatePipeLine(data);
            var newPipeLine = _.cloneDeep(pipeLine);
            newPipeLine.push({
                $match: {
                    sfaId: data.sfaid,
                },
                // Stage 6
            });
            Athelete.aggregate(newPipeLine, function (err, totals) {
                if (err) {
                    console.log(err);
                    callback(err, "error in mongoose");
                } else {
                    if (_.isEmpty(totals)) {
                        callback(null, 0);
                    } else {
                        var count = totals.length;
                        console.log("counttotal", count);
                        callback(null, count);
                    }
                }
            });
        }
    },

    search: function (data, callback) {
        var Model = this;
        var Const = this(data);
        var maxRow = Config.maxRow;

        var page = 1;
        if (data.page) {
            page = data.page;
        }
        var field = data.field;
        var options = {
            field: data.field,
            filters: {
                keyword: {
                    fields: ['name'],
                    term: data.keyword
                }
            },
            sort: {
                desc: 'createdAt'
            },
            start: (page - 1) * maxRow,
            count: maxRow
        };
        if (data.keyword == "") {
            var deepSearch = "sportslist ageGroup weight";
            var Search = Model.find(data.keyword)

                .order(options)
                .deepPopulate(deepSearch)
                .keyword(options)
                .page(options, callback);

        } else {
            async.waterfall([
                    function (callback) {
                        var dataFinal = {};
                        var pipeLine = Sport.getSearchPipeLine(data);
                        Sport.aggregate(pipeLine, function (err, totals) {
                            if (err) {
                                console.log(err);
                                callback(err, "error in mongoose");
                            } else {
                                if (_.isEmpty(totals)) {
                                    callback(null, 0);
                                } else {
                                    dataFinal.total = totals.length;
                                    // console.log("counttotal", dataFinal.count);
                                    callback(null, dataFinal);
                                }
                            }
                        });

                    },
                    function (dataFinal, callback) {
                        var pipeLine = Sport.getSearchPipeLine(data);
                        var newPipeLine = _.cloneDeep(pipeLine);
                        newPipeLine.push(
                            // Stage 6
                            {
                                '$skip': parseInt(options.start)
                            }, {
                                '$limit': maxRow
                            });
                        Sport.aggregate(newPipeLine, function (err, totals) {
                            if (err) {
                                console.log(err);
                                callback(err, "error in mongoose");
                            } else {
                                if (_.isEmpty(totals)) {
                                    callback(null, []);
                                } else {
                                    dataFinal.options = options;
                                    dataFinal.results = totals;
                                    console.log("athelete", dataFinal);
                                    callback(null, dataFinal);
                                }
                            }
                        });
                    }

                ],
                function (err, data2) {
                    if (err) {
                        console.log(err);
                        callback(null, []);
                    } else if (data2) {
                        if (_.isEmpty(data2)) {
                            callback(null, []);
                        } else {
                            callback(null, data2);
                        }
                    }
                });

        }

    },

    saveSport: function (data, callback) {
        if (_.isEmpty(data.weight)) {
            data.weight = undefined;
        }
        if (_.isEmpty(data.ageGroup)) {
            data.ageGroup = undefined;
        }
        if (_.isEmpty(data.sportslist)) {
            data.sportslist = undefined;
        }
        Sport.saveData(data, function (err, sportData) {
            if (err) {
                console.log("err", err);
                callback("There was an error while saving", null);
            } else {
                if (_.isEmpty(sportData)) {
                    callback("No order data found", null);
                } else {
                    callback(null, sportData);
                }
            }
        });
    },


};
module.exports = _.assign(module.exports, exports, model);