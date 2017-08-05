var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate')(mongoose);
var uniqueValidator = require('mongoose-unique-validator');
var timestamps = require('mongoose-timestamp');
var validators = require('mongoose-validators');
var monguurl = require('monguurl');
var autoIncrement = require('mongoose-auto-increment');
var objectid = require("mongodb").ObjectID;
var moment = require('moment');
var request = require("request");
autoIncrement.initialize(mongoose);

var schema = new Schema({
    incrementalId: Number,
    matchId: String,
    sport: {
        type: Schema.Types.ObjectId,
        ref: 'Sport'
    },
    round: String,
    opponentsSingle: [{
        type: Schema.Types.ObjectId,
        ref: 'IndividualSport'
    }],
    opponentsTeam: [{
        type: Schema.Types.ObjectId,
        ref: 'TeamSport'
    }],
    prevMatch: [{
        type: Schema.Types.ObjectId,
        ref: 'Match'
    }],
    nextMatch: {
        type: Schema.Types.ObjectId,
        ref: 'Match'
    },
    scoreCard: Schema.Types.Mixed,
    resultsCombat: Schema.Types.Mixed,
    resultsRacquet: Schema.Types.Mixed,
    scheduleDate: Date,
    scheduleTime: String,
});

schema.plugin(deepPopulate, {
    populate: {
        "sport": {
            select: '_id sportslist gender ageGroup'
        },
        "opponentsSingle": {
            select: '_id athleteId sportsListSubCategory createdBy '
        },
        "opponentsSingle.athleteId": {
            select: '_id sfaId firstName middleName surname school photograph dob city '
        },
        "opponentsSingle.athleteId.school": {
            select: '_id name'
        },
        "opponentsTeam": {
            select: '_id name teamId schoolName studentTeam createdBy sport school'
        },
        "prevMatch": {
            select: '_id incrementalId '
        },
        "nextMatch": {
            select: '_id incrementalId '
        },
    }
});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
schema.plugin(autoIncrement.plugin, {
    model: 'Match',
    field: 'incrementalId',
    startAt: 1,
    incrementBy: 1
});
module.exports = mongoose.model('Match', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema, "sport", "sport", "opponentsSingle", "opponentsSingle"));
var model = {

    getAggregatePipeline: function (data) {
        var pipeline = [{
                $lookup: {
                    "from": "atheletes",
                    "localField": "opponentsSingle",
                    "foreignField": "_id",
                    "as": "opponentsSingle"
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
                }
            }, {
                $lookup: {
                    "from": "sportslists",
                    "localField": "sport.sportslist",
                    "foreignField": "_id",
                    "as": "sport.sportslist"
                }
            },
            // Stage 2
            {
                $unwind: {
                    path: "$sport.sportslist",
                }
            },
            // Stage 3
            {
                $lookup: {
                    "from": "agegroups",
                    "localField": "sport.ageGroup",
                    "foreignField": "_id",
                    "as": "sport.ageGroup"
                }
            },

            // Stage 4
            {
                $unwind: {
                    path: "$sport.ageGroup",

                }
            }
        ];
        return pipeline;
    },

    getAll: function (data, callback) {
        var deepSearch = "sport.sportslist.sportsListSubCategory.sportsListCategory sport.ageGroup opponentsSingle.athleteId.school opponentsTeam";
        Match.findOne().lean().deepPopulate(deepSearch).exec(function (err, found) {
            if (err) {
                callback(err, null);
            } else {
                if (_.isEmpty(found)) {
                    callback(null, []);
                } else {
                    console.log("found0", found);
                    callback(null, found);
                }
            }
        });
    },

    search: function (data, callback) {
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
                    fields: ['matchId', 'round'],
                    term: data.keyword
                }
            },
            sort: {
                asc: 'createdAt'
            },
            start: (page - 1) * maxRow,
            count: maxRow
        };
        var matchObj = {};
        if (data.keyword == "") {
            var pipeline = Match.getAggregatePipeline(data);
            Match.aggregate(pipeline, function (err, result) {
                if (err) {
                    console.log(err);
                    callback(null, err);
                } else {
                    if (_.isEmpty(result)) {
                        var count = result.length;
                        console.log("count", count);

                        var data = {};
                        data.options = options;

                        data.results = result;
                        data.total = count;
                        callback(null, data);
                    } else {
                        var count = result.length;
                        console.log("count", count);

                        var data = {};
                        data.options = options;
                        data.results = result;
                        data.total = count;
                        callback(null, data);

                    }
                }
            });
        } else {
            matchObj = {
                round: {
                    $regex: data.keyword,
                    $options: "i"
                },
                matchId: {
                    $regex: data.keyword,
                    $options: "i"
                }
            };
            Match.find(matchObj)
                .sort({
                    createdAt: -1
                })
                .order(options)
                .keyword(options)
                .page(options, function (err, found) {
                    if (err) {
                        callback(err, null);
                    } else if (_.isEmpty(found)) {
                        callback(null, "Data is empty");
                    } else {
                        callback(null, found);
                    }
                });

        }
    },

    getOne: function (data, callback) {
        async.waterfall([
                function (callback) {
                    var deepSearch = "sport.sportslist.sportsListSubCategory.sportsListCategory sport.ageGroup opponentsSingle.athleteId.school opponentsTeam";
                    Match.findOne({
                        matchId: data.matchId
                    }).lean().deepPopulate(deepSearch).exec(function (err, found) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(found)) {
                                callback(null, []);
                            } else {
                                console.log("found0", found);
                                callback(null, found);
                            }
                        }
                    });
                },
                function (found, callback) {
                    var finalData = {};
                    finalData.players = [];
                    finalData.sportsName = found.sport.sportslist.name + "-" + found.sport.ageGroup.name + "-" + found.sport.gender;
                    finalData.sportType = found.sport.sportslist.sportsListSubCategory.sportsListCategory.name;
                    _.each(found.opponentsSingle, function (n) {
                        finalData.players.push(n.athleteId);
                    });
                    if (_.isEmpty(found.resultsCombat)) {
                        finalData.resultsCombat = "";
                    } else {
                        finalData.resultsCombat = found.resultsCombat;
                    }
                    if (_.isEmpty(found.resultsRacquet)) {
                        finalData.resultsRacquet = "";
                    } else {
                        finalData.resultsRacquet = found.resultsRacquet;
                    }
                    callback(null, finalData);

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

    saveMatch: function (data, callback) {
        async.waterfall([
                function (callback) {
                    if (_.isEmpty(data.opponentsSingle)) {
                        data.opponentsSingle = undefined;
                    }
                    if (_.isEmpty(data.opponentsTeam)) {
                        data.opponentsTeam = undefined;
                    }
                    if (_.isEmpty(data.prevMatch)) {
                        data.prevMatch = undefined;
                    }
                    if (_.isEmpty(data.nextMatch)) {
                        data.nextMatch = undefined;
                    }
                    callback(null, data);
                },
                function (data, callback) {
                    Match.saveData(data, function (err, complete) {
                        if (err) {
                            console.log("err", err);
                            callback("There was an error while saving", null);
                        } else {
                            if (_.isEmpty(complete)) {
                                callback(null, []);
                            } else {
                                callback(null, complete);
                            }
                        }
                    });
                }
            ],
            function (err, results) {
                if (err) {
                    console.log(err);
                    callback(null, results);
                } else if (results) {
                    if (_.isEmpty(results)) {
                        callback(null, results);
                    } else {
                        callback(null, results);
                    }
                }
            });
    },

    uploadExcelMatch: function (data, callback) {
        async.waterfall([
                function (callback) {
                    Config.importGS(data.file, function (err, importData) {
                        console.log("importData", importData);
                        if (err || _.isEmpty(importData)) {
                            callback(err, null);
                        } else {
                            callback(null, importData);
                        }
                    });
                },
                function (importData, callback) {
                    async.concatSeries(importData, function (singleData, callback) {
                        console.log("singleData", singleData["MATCH ID"]);
                        async.waterfall([
                                function (callback) {
                                    var sport = _.split(singleData.SPORT, " ");
                                    console.log("sport", sport);
                                    callback(null, sport);
                                }
                            ],
                            function (err, results) {
                                if (err) {
                                    console.log(err);
                                    callback(null, results);
                                } else if (results) {
                                    if (_.isEmpty(results)) {
                                        callback(null, results);
                                    } else {
                                        callback(null, results);
                                    }
                                }
                            });
                    }, function (err, singleData) {
                        // console.log("singleData", singleData);
                        callback(null, singleData)
                    });
                }
            ],
            function (err, results) {
                if (err) {
                    console.log(err);
                    callback(null, results);
                } else if (results) {
                    if (_.isEmpty(results)) {
                        callback(null, results);
                    } else {
                        callback(null, results);
                    }
                }
            });
    },



};
module.exports = _.assign(module.exports, exports, model);