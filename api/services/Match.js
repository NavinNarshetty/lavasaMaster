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
    resultHeat: Schema.Types.Mixed,
    resultHockey: Schema.Types.Mixed,
    resultBasketBall: Schema.Types.Mixed,
    resultVollyBall: Schema.Types.Mixed,
    resultHandBall: Schema.Types.Mixed,
    resultWaterPolo: Schema.Types.Mixed,
    resultKabaddi: Schema.Types.Mixed,
    resultFootball: Schema.Types.Mixed,
    resultQualifyingRound: Schema.Types.Mixed,
    resultKnockout: Schema.Types.Mixed,
    scheduleDate: Date,
    scheduleTime: String,
    video: String,
    matchCenter: String,
    excelType: String
});

schema.plugin(deepPopulate, {
    populate: {
        "sport": {
            select: '_id sportslist gender ageGroup'
        },
        "opponentsSingle": {
            select: '_id athleteId sportsListSubCategory createdBy'
        },
        "opponentsSingle.athleteId": {
            select: '_id sfaId firstName middleName surname school photograph dob city'
        },
        "opponentsSingle.athleteId.school": {
            select: '_id name'
        },
        "opponentsTeam": {
            select: '_id name teamId schoolName studentTeam createdBy sport school'
        },
        "opponentsTeam.studentTeam.studentId": {
            select: '_id sfaId firstName middleName surname school photograph dob city'
        },
        "prevMatch": {
            select: '_id incrementalId'
        },
        "nextMatch": {
            select: '_id incrementalId'
        },
    }
});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('Match', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema, "sport", "sport"));
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
        Match.find().lean().deepPopulate(deepSearch).exec(function (err, found) {
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

    getPerSport: function (data, callback) {
        async.waterfall([
            function (callback) {
                var matchObj = {
                    sportslist: data.sportslist,
                    gender: data.gender,
                    ageGroup: data.ageGroup,
                }
                if (!_.isEmpty(data.weight)) {
                    matchObj.weight = data.weight;
                }
                Sport.findOne(matchObj).exec(function (err, sportDetails) {
                    if (err) {
                        callback(err, null);
                    } else if (!_.isEmpty(sportDetails)) {
                        callback(null, sportDetails);
                    } else {
                        callback(null, "No Data Found");
                    }

                });
            },
            function (sportDetails, callback) {
                console.log("paramData", data);
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
                var deepSearch = "sport.sportslist.sportsListSubCategory.sportsListCategory sport.ageGroup opponentsSingle.athleteId.school opponentsTeam";
                Match.find({
                        sport: sportDetails._id
                    }).lean().sort({
                        createdAt: -1
                    })
                    .order(options)
                    .keyword(options)
                    .deepPopulate(deepSearch)
                    .page(options, function (err, found) {
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
            }
        ], function (err, result) {
            console.log("Final Callback");
            if (err) {
                callback(err, null);
            } else {
                callback(null, result);
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
        var deepSearch = "sport.sportslist.sportsListSubCategory.sportsListCategory sport.ageGroup sport.weight opponentsSingle.athleteId.school opponentsTeam.studentTeam.studentId";
        if (_.isEmpty(data.keyword)) {
            var matchObj = {};
        } else {
            var matchObj = {
                $or: [{
                    round: {
                        $regex: data.keyword,
                        $options: "i"
                    },
                    matchId: {
                        $regex: data.keyword,
                        $options: "i"
                    },
                    "sport.sportslist.name": {
                        $regex: data.keyword,
                        $options: "i"
                    }
                }]
            };
        }
        console.log("matchObj", matchObj);
        console.log("matchObj", data.keyword);
        Match.find(matchObj)
            .sort({
                createdAt: -1
            })
            .order(options)
            .keyword(options)
            .deepPopulate(deepSearch)
            .page(options, function (err, found) {
                if (err) {
                    callback(err, null);
                } else if (_.isEmpty(found)) {
                    callback(null, "Data is empty");
                } else {
                    callback(null, found);
                }
            });
    },

    getOne: function (data, callback) {
        async.waterfall([
                function (callback) {
                    var deepSearch = "sport.sportslist.sportsListSubCategory.sportsListCategory sport.ageGroup sport.weight opponentsSingle.athleteId.school opponentsTeam.studentTeam.studentId";
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
                    if (_.isEmpty(found)) {
                        callback(null, {
                            error: "Wrong MatchId"
                        });
                    } else {
                        var finalData = {};
                        finalData.isTeam = found.sport.sportslist.sportsListSubCategory.isTeam;
                        finalData.sportsName = found.sport.sportslist.name;
                        finalData.age = found.sport.ageGroup.name;
                        finalData.gender = found.sport.gender;
                        finalData.minTeamPlayers = found.sport.minTeamPlayers;
                        finalData.maxTeamPlayers = found.sport.maxTeamPlayers;
                        finalData.sportType = found.sport.sportslist.sportsListSubCategory.sportsListCategory.name;
                        if (!_.isEmpty(found.opponentsSingle)) {
                            finalData.players = [];
                            finalData.opponentsSingle = [];
                            _.each(found.opponentsSingle, function (n) {
                                finalData.players.push(n.athleteId);
                                finalData.opponentsSingle.push(n._id);
                            });
                        } else {
                            finalData.teams = [];
                            _.each(found.opponentsTeam, function (n) {
                                finalData.teams.push(n);
                            });
                        }
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


                }
            ],
            function (err, data2) {
                if (err) {
                    callback(null, []);
                } else if (data2) {
                    if (_.isEmpty(data2)) {
                        callback(null, data2);
                    } else {
                        callback(null, data2);
                    }
                }
            });
    },

    saveMatch: function (data, callback) {
        async.waterfall([
                function (callback) {
                    Match.findOne().sort({
                        // incrementalId: -1,
                        createdAt: -1
                    }).lean().exec(function (err, match) {
                        if (err) {
                            callback(err, null);
                        } else if (_.isEmpty(match)) {
                            // data.year = year = new Date().getFullYear().toString();
                            data.incrementalId = 1;
                            data.matchId = data.matchId + data.incrementalId;
                            callback(null, data);
                        } else {
                            data.incrementalId = ++match.incrementalId;
                            data.matchId = data.matchId + data.incrementalId;
                            // console.log("id", match.incrementalId);
                            // var year = new Date(match.createdAt).getFullYear();
                            // var currentYear = new Date().getFullYear();
                            // if (year == currentYear) {
                            //     data.incrementalId = ++match.incrementalId;
                            //     data.matchId = data.matchId + data.incrementalId;
                            // } else {
                            //     data.incrementalId = 1;
                            //     data.matchId = data.matchId + data.incrementalId;
                            // }
                            callback(null, data);
                        }
                    });
                },
                function (data, callback) {
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
                        if (err || _.isEmpty(complete)) {
                            callback(err, null);
                        } else {
                            callback(null, {
                                error: err,
                                success: complete
                            });
                        }
                    });
                }
            ],
            function (err, results) {
                if (err || _.isEmpty(results)) {
                    callback(err, null);
                } else {
                    callback(null, results);
                }
            });
    },

    getSportId: function (data, callback) {
        // console.log("data", datsa);
        var sport = {};
        async.waterfall([
                function (callback) {
                    SportsList.findOne({
                        name: data.name
                    }).lean().deepPopulate("sportsListSubCategory").exec(function (err, found) {
                        // console.log(found, "found");
                        if (err || _.isEmpty(found)) {
                            callback(null, {
                                error: "No SportsList found!",
                                success: data
                            });
                        } else {
                            sport.sportslist = found._id;
                            sport.sportsListSubCategory = found.sportsListSubCategory._id;
                            // console.log("sport", sport);
                            callback(null, sport);
                        }
                    });
                },
                function (sport, callback) {
                    AgeGroup.findOne({
                        name: data.age
                    }).lean().exec(function (err, found) {
                        if (err || _.isEmpty(found)) {
                            callback(null, {
                                error: "No Age found!",
                                success: data
                            });
                        } else {
                            sport.age = found._id;
                            callback(null, sport);
                        }
                    });
                },
                function (sport, callback) {
                    if (_.isEmpty(data.weight) || data.weight == undefined) {
                        callback(null, sport);
                    } else {
                        Weight.findOne({
                            name: data.weight
                        }).lean().exec(function (err, found) {
                            if (err || _.isEmpty(found)) {
                                callback(null, {
                                    error: "No Weight found!",
                                    success: data
                                });
                            } else {
                                sport.weight = found._id;
                                callback(null, sport);
                            }
                        });
                    }
                },
                function (sport, callback) {
                    if (sport.error) {
                        callback(null, sport);
                    } else {
                        var matchObj = {};
                        matchObj.gender = data.gender;
                        matchObj.sportslist = sport.sportslist;
                        matchObj.ageGroup = sport.age;
                        if (sport.weight) {
                            matchObj.weight = sport.weight;
                        }
                        // console.log("matchObj", matchObj);
                        Sport.findOne(matchObj).lean().exec(function (err, found) {
                            if (err || _.isEmpty(found)) {
                                callback(null, {
                                    error: "No Sport found!",
                                    success: data
                                });
                            } else {
                                sport.sportId = found._id;
                                callback(null, sport);
                            }
                        });
                    }
                }

            ],
            function (err, results) {
                if (results.error) {
                    callback(null, []);
                } else {
                    callback(null, results);
                }
            });

    },

    getAthleteId: function (data, callback) {
        async.waterfall([
                function (callback) {
                    Athelete.findOne({
                        sfaId: data.participant
                    }).lean().exec(function (err, found) {
                        if (err || _.isEmpty(found)) {
                            callback(err, {
                                error: "No Athelete found!",
                                success: data
                            });
                        } else {
                            callback(null, found);
                        }
                    });
                },
                function (found, callback) {
                    if (found.error) {
                        callback(null, []);
                    } else {
                        // console.log("found1", found, "data", data);
                        IndividualSport.findOne({
                            sport: data.sport,
                            athleteId: found._id
                        }).lean().exec(function (err, athleteData) {
                            if (err || _.isEmpty(athleteData)) {
                                callback(null, []);
                            } else {
                                callback(null, athleteData);
                            }
                        });
                    }
                }
            ],
            function (err, results) {
                if (err || _.isEmpty(results)) {
                    callback(null, results);
                } else {
                    callback(null, results);
                }
            });
    },

    getTeamId: function (data, callback) {
        async.waterfall([
                function (callback) {
                    TeamSport.findOne({
                        teamId: data.team,
                        sport: data.sport
                    }).lean().exec(function (err, found) {
                        if (err || _.isEmpty(found)) {
                            callback(err, {
                                error: "No Team found!",
                                success: data
                            });
                        } else {
                            callback(null, found);
                        }
                    });
                }
            ],
            function (err, results) {
                console.log("results", results);
                if (err || _.isEmpty(results)) {
                    callback(null, results);
                } else {
                    callback(null, results);
                }
            });
    },

    getQuickSportId: function (matchObj, callback) {
        var sendObj = {};
        async.waterfall([
            function (callback) {
                console.log("Finding DrawFormat");
                SportsList.findOne({
                    "_id": matchObj.sportslist
                }).deepPopulate("drawFormat").exec(function (err, sportslist) {
                    if (err) {
                        callback(err, null);
                    } else if (!_.isEmpty(sportslist)) {
                        sendObj.drawFormat = sportslist.drawFormat.name;
                        callback(null, sportslist);
                    } else {
                        console.log(matchObj.sportslist, "SportList Not Found");
                        callback("No Data Found", null);
                    }
                });
            },
            function (sportslist, callback) {
                console.log("Finding sportId");
                Sport.findOne(matchObj).exec(function (err, sportDetails) {
                    if (err) {
                        callback(err, null);
                    } else if (!_.isEmpty(sportDetails)) {
                        sendObj.sport = sportDetails._id;
                        callback(null, sendObj);
                    } else {
                        console.log(matchObj, "Sport Not Found with this selection");
                        callback(null, "No Data Found");
                    }

                });
            }
        ], function (err, result) {
            console.log("Final Callback");
            if (err) {
                callback(err, null);
            } else {
                callback(null, result);
            }
        });
    },

    getSportSpecificRounds: function (data, callback) {
        // var finalData = [];
        var matchData = [];
        async.waterfall([
            function (callback) {
                var deepSearch = "sport.sportslist.sportsListSubCategory.sportsListCategory sport.ageGroup sport.weight opponentsSingle.athleteId.school opponentsTeam.studentTeam.studentId";
                Match.find({
                    sport: data.sport
                }).lean().deepPopulate(deepSearch).exec(function (err, found) {
                    if (err) {
                        callback(err, null);
                    } else {
                        if (_.isEmpty(found)) {
                            callback(null, []);
                        } else {
                            var matches = _.groupBy(found, 'round');
                            callback(null, matches);
                        }
                    }
                });
            },
            function (matches, callback) {
                var i = 0;
                var dummy = [];
                var arr = _.keys(matches);
                _.each(matches, function (n) {
                    dummy.push(n);
                });
                while (i != arr.length) {
                    var match = {};
                    match.name = arr[i];
                    match.match = dummy[i];
                    // match.sportType = match.match[0].sport.sportslist.sportsListSubCategory.sportsListCategory.name
                    matchData.push(match);
                    i++;
                }
                var sendObj = {};
                sendObj.roundsListName = _.keys(matches);
                sendObj.roundsList = matchData;
                if (data.round) {
                    var index = _.findIndex(matchData, function (n) {
                        return n.name == data.round
                    });

                    if (index != -1) {
                        sendObj.roundsList = _.slice(matchData, index, index + 3);
                        callback(null, sendObj);
                    } else {
                        callback(null, sendObj);
                    }

                } else {
                    callback(null, sendObj);
                }
            }
        ], function (err, result) {
            console.log("Final Callback");
            if (err) {
                callback(err, null);
            } else {
                callback(null, result);
            }
        });

    },

    //-----------------------------SAVE Excel ---------------------------------------------

    saveKnockoutIndividual: function (importData, data, callback) {
        var countError = 0;
        async.waterfall([
                function (callback) {
                    async.concatSeries(importData, function (singleData, callback) {
                        async.waterfall([
                                function (callback) {
                                    var date = Math.round((singleData.DATE - 25569) * 86400 * 1000);
                                    date = new Date(date);
                                    singleData.DATE = date.toISOString();
                                    callback(null, singleData);
                                },
                                function (singleData, callback) {
                                    console.log("singleData", singleData);
                                    var paramData = {};
                                    paramData.name = singleData.EVENT;
                                    console.log("para,", paramData.name);
                                    paramData.age = singleData["AGE GROUP"];
                                    if (singleData.GENDER == "Boys" || singleData.GENDER == "Male" || singleData.GENDER == "male") {
                                        paramData.gender = "male";
                                    } else if (singleData.GENDER == "Girls" || singleData.GENDER == "Female" || singleData.GENDER == "female") {
                                        paramData.gender = "female";
                                    }
                                    paramData.weight = singleData["WEIGHT CATEGORIES"];
                                    Match.getSportId(paramData, function (err, sportData) {
                                        if (err || _.isEmpty(sportData)) {
                                            singleData.SPORT = null;
                                            err = "Sport,Event,AgeGroup,Gender may have wrong values";
                                            callback(null, {
                                                error: err,
                                                success: singleData
                                            });
                                        } else {
                                            singleData.SPORT = sportData.sportId;
                                            callback(null, singleData);
                                        }
                                    });
                                },
                                function (singleData, callback) {
                                    // console.log("logssss", singleData);
                                    if (singleData.error) {
                                        countError++;
                                        callback(null, singleData);
                                    } else {
                                        if (_.isEmpty(singleData["SFAID 1"])) {
                                            callback(null, singleData);
                                        } else {
                                            // console.log("singleData1", singleData);
                                            var paramData = {};
                                            paramData.participant = singleData["SFAID 1"];
                                            paramData.sport = singleData.SPORT;
                                            Match.getAthleteId(paramData, function (err, complete) {
                                                if (err || _.isEmpty(complete)) {
                                                    singleData["PARTICIPANT 1"] = null;
                                                    err = "SFAID 1 may have wrong values";
                                                    callback(null, {
                                                        error: err,
                                                        success: singleData
                                                    });
                                                } else {
                                                    singleData["PARTICIPANT 1"] = complete._id;
                                                    callback(null, singleData);
                                                }
                                            });
                                        }
                                    }


                                },
                                function (singleData, callback) {
                                    // console.log("logssss", singleData);
                                    if (singleData.error) {
                                        countError++;
                                        callback(null, singleData);
                                    } else {
                                        if (_.isEmpty(singleData["SFAID 2"])) {
                                            // console.log("inside sfa");
                                            callback(null, singleData);
                                        } else {
                                            var paramData = {};
                                            paramData.participant = singleData["SFAID 2"];
                                            paramData.sport = singleData.SPORT;
                                            Match.getAthleteId(paramData, function (err, complete) {
                                                if (err || _.isEmpty(complete)) {
                                                    singleData["PARTICIPANT 2"] = null;
                                                    err = "SFAID 2 may have wrong values";
                                                    callback(err, null);
                                                } else {
                                                    singleData["PARTICIPANT 2"] = complete._id;
                                                    callback(null, singleData);
                                                }
                                            });
                                        }
                                    }

                                },
                                function (singleData, callback) {
                                    // console.log("logssss", singleData);
                                    if (singleData.error) {
                                        countError++;
                                        callback(null, singleData);
                                    } else {
                                        var paramData = {};
                                        paramData.opponentsSingle = [];
                                        paramData.matchId = data.matchId;
                                        paramData.round = singleData["ROUND NAME"];
                                        if (_.isEmpty(singleData["PARTICIPANT 1"]) && _.isEmpty(singleData["PARTICIPANT 2"])) {
                                            paramData.opponentsSingle = "";
                                        } else if (_.isEmpty(singleData["PARTICIPANT 1"])) {
                                            paramData.opponentsSingle.push(singleData["PARTICIPANT 2"]);
                                        } else if (_.isEmpty(singleData["PARTICIPANT 2"])) {
                                            paramData.opponentsSingle.push(singleData["PARTICIPANT 1"]);
                                        } else {
                                            paramData.opponentsSingle.push(singleData["PARTICIPANT 1"]);
                                            paramData.opponentsSingle.push(singleData["PARTICIPANT 2"]);
                                        }
                                        paramData.sport = singleData.SPORT;
                                        paramData.scheduleDate = singleData.DATE;
                                        paramData.scheduleTime = singleData.TIME;
                                        if (data.resultType == 'qualifying-knockout' && data.excelType == 'knockout') {
                                            paramData.excelType = data.excelType;
                                        }
                                        Match.saveMatch(paramData, function (err, complete) {
                                            if (err || _.isEmpty(complete)) {
                                                callback(err, null);
                                            } else {
                                                callback(null, complete);
                                            }
                                        });
                                    }
                                }
                            ],
                            function (err, results) {
                                if (err || _.isEmpty(results)) {
                                    callback(err, null);
                                } else {
                                    callback(null, results);
                                }
                            });
                    }, function (err, singleData) {
                        callback(null, singleData)
                    });
                },
                function (singleData, callback) {
                    async.concatSeries(singleData, function (n, callback) {
                            // console.log("n", n);
                            if (countError != 0 && n.error == null) {
                                // console.log("inside", n.success._id, "count", countError);
                                Match.remove({
                                    _id: n.success._id
                                }).exec(function (err, found) {
                                    if (err || _.isEmpty(found)) {
                                        callback(err, null);
                                    } else {
                                        callback(null, n);
                                    }
                                });
                            } else {
                                callback(null, n);
                            }
                        },
                        function (err, singleData) {
                            callback(null, singleData);
                        });

                },
                function (singleData, callback) {
                    data.sport = singleData[0].success.sport;
                    Match.addPreviousMatch(data, function (err, sportData) {
                        callback(null, singleData);
                    });
                }
            ],
            function (err, results) {
                if (err || _.isEmpty(results)) {
                    callback(err, null);
                } else {
                    callback(null, results);
                }
            });
    },

    saveHeatIndividual: function (importData, data, callback) {
        var countError = 0;
        var arrMathes = [];

        async.waterfall([
                function (callback) {
                    async.concatSeries(importData, function (mainData, callback) {
                        async.concatSeries(mainData, function (arrData, callback) {
                            var paramData = {};
                            paramData.opponentsSingle = [];
                            var result = {};
                            result.players = [];
                            async.concatSeries(arrData, function (singleData, callback) {
                                var date = Math.round((singleData.DATE - 25569) * 86400 * 1000);
                                date = new Date(date);
                                singleData.DATE = date.toISOString();
                                async.waterfall([
                                        function (callback) {
                                            var paramData = {};
                                            paramData.name = singleData["EVENT "];
                                            paramData.age = singleData["AGE GROUP"];
                                            if (singleData.GENDER == "Boys" || singleData.GENDER == "Male" || singleData.GENDER == "male") {
                                                paramData.gender = "male";
                                            } else if (singleData.GENDER == "Girls" || singleData.GENDER == "Female" || singleData.GENDER == "female") {
                                                paramData.gender = "female";
                                            }
                                            paramData.weight = undefined;
                                            Match.getSportId(paramData, function (err, sportData) {
                                                if (err || _.isEmpty(sportData)) {
                                                    singleData.SPORT = null;
                                                    err = "Sport,Event,AgeGroup,Gender may have wrong values";
                                                    callback(null, {
                                                        error: err,
                                                        success: singleData
                                                    });
                                                } else {
                                                    singleData.SPORT = sportData.sportId;
                                                    callback(null, singleData);
                                                }
                                            });
                                        },
                                        function (singleData, callback) {
                                            if (singleData.error) {
                                                countError++;
                                                finalData = singleData;
                                                callback(null, singleData);
                                            } else {
                                                if (_.isEmpty(singleData["SFA ID"])) {
                                                    finalData.error = "SFA ID is empty";
                                                    finalData.success = singleData;
                                                    callback(null, singleData);
                                                } else {
                                                    var param = {};
                                                    param.participant = singleData["SFA ID"];
                                                    param.sport = singleData.SPORT;
                                                    Match.getAthleteId(param, function (err, complete) {
                                                        if (err || _.isEmpty(complete)) {
                                                            singleData["PARTICIPANT 1"] = null;
                                                            err = "SFA ID may have wrong values";
                                                            // console.log("err found");
                                                            callback(null, {
                                                                error: err,
                                                                success: singleData
                                                            });
                                                        } else {
                                                            singleData["PARTICIPANT 1"] = complete._id;
                                                            callback(null, singleData);
                                                        }
                                                    });
                                                }
                                            }
                                        },
                                        function (singleData, callback) {
                                            if (singleData.error) {
                                                countError++;
                                                finalData = singleData;
                                                callback(null, singleData);
                                            } else {
                                                callback(null, {
                                                    error: null,
                                                    success: singleData
                                                });
                                            }
                                        }
                                    ],
                                    function (err, results) {
                                        if (err || _.isEmpty(results)) {
                                            callback(err, null);
                                        } else {
                                            callback(null, results);
                                        }
                                    });

                            }, function (err, singleData) {
                                // console.log("for save", singleData);
                                async.each(singleData, function (n, callback) {
                                    if (n.error) {
                                        countError++;
                                        callback(null, n);
                                    } else {
                                        paramData.matchId = data.matchId;
                                        paramData.round = n.success["ROUND "];
                                        if (!_.isEmpty(n.success["PARTICIPANT 1"])) {
                                            paramData.opponentsSingle.push(n.success["PARTICIPANT 1"]);
                                        }
                                        paramData.sport = n.success.SPORT;
                                        paramData.scheduleDate = n.success.DATE;
                                        paramData.scheduleTime = n.success.TIME;
                                        var player = {};
                                        player.id = n.success["PARTICIPANT 1"];
                                        player.laneNo = n.success["LANE NUMBER"];
                                        result.players.push(player);
                                        paramData.resultHeat = result;
                                        callback(null, paramData);
                                    }
                                }, function (err) {
                                    Match.saveMatch(paramData, function (err, complete) {
                                        if (err || _.isEmpty(complete)) {
                                            err = "Save Failed !";
                                            callback(null, {
                                                error: err,
                                                success: complete
                                            });
                                        } else {
                                            arrMathes.push(complete);
                                            callback(null, singleData);
                                        }
                                    });
                                });
                            });
                        }, function (err, singleData) {
                            callback(null, singleData);
                        });
                    }, function (err, singleData) {
                        callback(null, singleData);
                    });
                },
                function (singleData, callback) {
                    async.each(arrMathes, function (n, callback) {
                            // console.log("n", n);
                            if (countError != 0 && n.error == null) {
                                // console.log("inside", n.success._id, "count", countError);
                                Match.remove({
                                    _id: n.success._id
                                }).exec(function (err, found) {
                                    if (err || _.isEmpty(found)) {
                                        callback(err, null);
                                    } else {
                                        callback(null, n);
                                    }
                                });
                            } else {
                                callback(null, n);
                            }
                        },
                        function (err) {
                            callback(null, singleData);
                        });

                }
            ],
            function (err, results) {
                if (err || _.isEmpty(results)) {
                    callback(err, null);
                } else {
                    callback(null, results);
                }
            });
    },

    saveHeatTeam: function (importData, data, callback) {
        var countError = 0;
        var arrMathes = [];
        async.waterfall([
                function (callback) {
                    async.concatSeries(importData, function (mainData, callback) {
                        async.concatSeries(mainData, function (arrData, callback) {
                            var paramData = {};
                            paramData.opponentsTeam = [];
                            var result = {};
                            result.teams = [];
                            async.concatSeries(arrData, function (singleData, callback) {
                                var date = Math.round((singleData.DATE - 25569) * 86400 * 1000);
                                date = new Date(date);
                                singleData.DATE = date.toISOString();
                                async.waterfall([
                                        function (callback) {
                                            var paramData = {};
                                            paramData.name = singleData["EVENT "];
                                            paramData.age = singleData["AGE GROUP"];
                                            if (singleData.GENDER == "Boys" || singleData.GENDER == "Male" || singleData.GENDER == "male") {
                                                paramData.gender = "male";
                                            } else if (singleData.GENDER == "Girls" || singleData.GENDER == "Female" || singleData.GENDER == "female") {
                                                paramData.gender = "female";
                                            }
                                            paramData.weight = undefined;
                                            Match.getSportId(paramData, function (err, sportData) {
                                                if (err || _.isEmpty(sportData)) {
                                                    singleData.SPORT = null;
                                                    err = "Sport,Event,AgeGroup,Gender may have wrong values";
                                                    callback(null, {
                                                        error: err,
                                                        success: singleData
                                                    });
                                                } else {
                                                    singleData.SPORT = sportData.sportId;
                                                    callback(null, singleData);
                                                }
                                            });
                                        },
                                        function (singleData, callback) {
                                            if (singleData.error) {
                                                countError++;
                                                finalData = singleData;
                                                callback(null, singleData);
                                            } else {
                                                if (_.isEmpty(singleData["TEAM ID"])) {
                                                    finalData.error = "TEAM ID is empty";
                                                    finalData.success = singleData;
                                                    callback(null, singleData);
                                                } else {
                                                    var param = {};
                                                    param.team = singleData["TEAM ID"];
                                                    param.sport = singleData.SPORT;
                                                    console.log(param);
                                                    Match.getTeamId(param, function (err, complete) {
                                                        if (err || _.isEmpty(complete)) {
                                                            singleData["TEAM 1"] = null;
                                                            err = "TEAM ID may have wrong values";
                                                            console.log("err found");
                                                            callback(null, {
                                                                error: err,
                                                                success: singleData
                                                            });
                                                        } else {
                                                            singleData["TEAM 1"] = complete._id;
                                                            callback(null, singleData);
                                                        }
                                                    });
                                                }
                                            }
                                        },
                                        function (singleData, callback) {
                                            if (singleData.error) {
                                                countError++;
                                                finalData = singleData;
                                                callback(null, singleData);
                                            } else {
                                                callback(null, {
                                                    error: null,
                                                    success: singleData
                                                });
                                            }
                                        }
                                    ],
                                    function (err, results) {
                                        if (err || _.isEmpty(results)) {
                                            callback(err, null);
                                        } else {
                                            callback(null, results);
                                        }
                                    });

                            }, function (err, singleData) {
                                console.log("for save", singleData);
                                async.each(singleData, function (n, callback) {
                                    if (n.error) {
                                        countError++;
                                        callback(null, n);
                                    } else {
                                        paramData.matchId = data.matchId;
                                        paramData.round = n.success["ROUND "];
                                        if (!_.isEmpty(n.success["TEAM 1"])) {
                                            paramData.opponentsTeam.push(n.success["TEAM 1"]);
                                        }
                                        paramData.sport = n.success.SPORT;
                                        paramData.scheduleDate = n.success.DATE;
                                        paramData.scheduleTime = n.success.TIME;
                                        var team = {};
                                        team.id = n.success["TEAM 1"];
                                        team.laneNo = n.success["LANE NUMBER"];
                                        result.teams.push(team);
                                        paramData.resultHeat = result;
                                        callback(null, paramData);
                                    }
                                }, function (err) {
                                    Match.saveMatch(paramData, function (err, complete) {
                                        if (err || _.isEmpty(complete)) {
                                            callback(err, null);
                                        } else {
                                            arrMathes.push(complete);
                                            callback(null, singleData);
                                        }
                                    });
                                });
                            });
                        }, function (err, singleData) {
                            callback(null, singleData);
                        });
                    }, function (err, singleData) {
                        callback(null, singleData);
                    });
                },
                function (singleData, callback) {
                    async.each(arrMathes, function (n, callback) {
                            console.log("n", n);
                            if (countError != 0 && n.error == null) {
                                console.log("inside", n.success._id, "count", countError);
                                Match.remove({
                                    _id: n.success._id
                                }).exec(function (err, found) {
                                    if (err || _.isEmpty(found)) {
                                        callback(err, null);
                                    } else {
                                        callback(null, n);
                                    }
                                });
                            } else {
                                callback(null, n);
                            }
                        },
                        function (err) {
                            callback(null, singleData);
                        });

                }
            ],
            function (err, results) {
                if (err || _.isEmpty(results)) {
                    callback(err, null);
                } else {
                    callback(null, results);
                }
            });
    },

    saveQualifyingRoundIndividual: function (importData, data, callback) {
        var countError = 0;
        async.waterfall([
                function (callback) {
                    async.concatSeries(importData, function (singleData, callback) {
                        async.waterfall([
                                function (callback) {
                                    var date = Math.round((singleData.DATE - 25569) * 86400 * 1000);
                                    date = new Date(date);
                                    singleData.DATE = date.toISOString();
                                    callback(null, singleData);
                                },
                                function (singleData, callback) {
                                    console.log("singleData", singleData);
                                    var paramData = {};
                                    paramData.name = singleData['EVENT '];
                                    paramData.age = singleData["AGE GROUP"];
                                    if (singleData.GENDER == "Boys" || singleData.GENDER == "Male" || singleData.GENDER == "male") {
                                        paramData.gender = "male";
                                    } else if (singleData.GENDER == "Girls" || singleData.GENDER == "Female" || singleData.GENDER == "female") {
                                        paramData.gender = "female";
                                    }
                                    paramData.weight = undefined;
                                    Match.getSportId(paramData, function (err, sportData) {
                                        if (err || _.isEmpty(sportData)) {
                                            singleData.SPORT = null;
                                            err = "Sport,Event,AgeGroup,Gender may have wrong values";
                                            callback(null, {
                                                error: err,
                                                success: singleData
                                            });
                                        } else {
                                            singleData.SPORT = sportData.sportId;
                                            callback(null, singleData);
                                        }
                                    });
                                },
                                function (singleData, callback) {
                                    // console.log("logssss", singleData);
                                    if (singleData.error) {
                                        countError++;
                                        callback(null, singleData);
                                    } else {
                                        if (_.isEmpty(singleData["SFA ID"])) {
                                            callback(null, singleData);
                                        } else {
                                            // console.log("singleData1", singleData);
                                            var paramData = {};
                                            paramData.participant = singleData["SFA ID"];
                                            paramData.sport = singleData.SPORT;
                                            Match.getAthleteId(paramData, function (err, complete) {
                                                if (err || _.isEmpty(complete)) {
                                                    singleData["PARTICIPANT 1"] = null;
                                                    err = "SFA ID may have wrong values";
                                                    callback(null, {
                                                        error: err,
                                                        success: singleData
                                                    });
                                                } else {
                                                    singleData["PARTICIPANT 1"] = complete._id;
                                                    callback(null, singleData);
                                                }
                                            });
                                        }
                                    }
                                },
                                function (singleData, callback) {
                                    console.log("logssss", singleData);
                                    if (singleData.error) {
                                        countError++;
                                        callback(null, singleData);
                                    } else {
                                        var paramData = {};
                                        paramData.opponentsSingle = [];
                                        paramData.matchId = data.matchId;
                                        // paramData.round = "Qualifying Round";
                                        paramData.round = singleData["ROUND"];
                                        if (_.isEmpty(singleData["PARTICIPANT 1"])) {
                                            paramData.opponentsSingle = "";
                                        } else {
                                            paramData.opponentsSingle.push(singleData["PARTICIPANT 1"]);
                                        }
                                        paramData.sport = singleData.SPORT;
                                        paramData.scheduleDate = singleData.DATE;
                                        paramData.scheduleTime = singleData.TIME;
                                        Match.saveMatch(paramData, function (err, complete) {
                                            if (err || _.isEmpty(complete)) {
                                                callback(err, null);
                                            } else {
                                                callback(null, complete);
                                            }
                                        });
                                    }
                                }
                            ],
                            function (err, results) {
                                if (err || _.isEmpty(results)) {
                                    callback(err, null);
                                } else {
                                    callback(null, results);
                                }
                            });
                    }, function (err, singleData) {
                        callback(null, singleData)
                    });
                },
                function (singleData, callback) {
                    async.concatSeries(singleData, function (n, callback) {
                            console.log("n", n);
                            if (countError != 0 && n.error == null) {
                                console.log("inside", n.success._id, "count", countError);
                                Match.remove({
                                    _id: n.success._id
                                }).exec(function (err, found) {
                                    if (err || _.isEmpty(found)) {
                                        callback(err, null);
                                    } else {
                                        callback(null, n);
                                    }
                                });
                            } else {
                                callback(null, n);
                            }
                        },
                        function (err, singleData) {
                            callback(null, singleData);
                        });
                }
            ],
            function (err, results) {
                if (err || _.isEmpty(results)) {
                    callback(err, null);
                } else {
                    callback(null, results);
                }
            });

    },

    saveKnockoutTeam: function (importData, data, callback) {
        var countError = 0;
        async.waterfall([
            function (callback) {
                async.concatSeries(importData, function (singleData, callback) {
                    async.waterfall([
                            function (callback) {
                                var date = Math.round((singleData.DATE - 25569) * 86400 * 1000);
                                date = new Date(date);
                                singleData.DATE = date.toISOString();
                                callback(null, singleData);
                            },
                            function (singleData, callback) {
                                console.log("singleData", singleData);
                                var paramData = {};
                                paramData.name = singleData.EVENT;
                                paramData.age = singleData["AGE GROUP"];
                                if (singleData.GENDER == "Boys" || singleData.GENDER == "Male" || singleData.GENDER == "male") {
                                    paramData.gender = "male";
                                } else if (singleData.GENDER == "Girls" || singleData.GENDER == "Female" || singleData.GENDER == "female") {
                                    paramData.gender = "female";
                                }
                                paramData.weight = singleData["WEIGHT CATEGORIES"];
                                Match.getSportId(paramData, function (err, sportData) {
                                    if (err || _.isEmpty(sportData)) {
                                        singleData.SPORT = null;
                                        err = "Sport,Event,AgeGroup,Gender may have wrong values";
                                        callback(null, {
                                            error: err,
                                            success: singleData
                                        });
                                    } else {
                                        singleData.SPORT = sportData.sportId;
                                        callback(null, singleData);
                                    }
                                });
                            },
                            function (singleData, callback) {
                                if (singleData.error) {
                                    countError++;
                                    callback(null, singleData);
                                } else {
                                    if (_.isEmpty(singleData["TEAMID 1"])) {
                                        callback(null, singleData);
                                    } else {
                                        console.log("singleData1", singleData);
                                        var paramData = {};
                                        paramData.team = singleData["TEAMID 1"];
                                        paramData.sport = singleData.SPORT;
                                        Match.getTeamId(paramData, function (err, complete) {
                                            if (err || _.isEmpty(complete)) {
                                                singleData["TEAM 1"] = null;
                                                err = "TEAMID 1 may have wrong values";
                                                callback(null, {
                                                    error: err,
                                                    success: singleData
                                                });
                                            } else {
                                                singleData["TEAM 1"] = complete._id;
                                                callback(null, singleData);
                                            }
                                        });
                                    }
                                }


                            },
                            function (singleData, callback) {
                                if (singleData.err) {
                                    countError++;
                                    callback(null, singleData);
                                } else {
                                    if (_.isEmpty(singleData["TEAMID 2"])) {
                                        console.log("inside sfa");
                                        callback(null, singleData);
                                    } else {
                                        var paramData = {};
                                        paramData.team = singleData["TEAMID 2"];
                                        paramData.sport = singleData.SPORT;
                                        Match.getTeamId(paramData, function (err, complete) {
                                            if (err || _.isEmpty(complete)) {
                                                singleData["TEAM 2"] = null;
                                                err = "TEAMID 2 may have wrong values";
                                                callback(err, null);
                                            } else {
                                                singleData["TEAM 2"] = complete._id;
                                                callback(null, singleData);
                                            }
                                        });
                                    }
                                }

                            },
                            function (singleData, callback) {
                                if (singleData.error) {
                                    countError++;
                                    callback(null, singleData);
                                } else {
                                    var paramData = {};
                                    paramData.opponentsTeam = [];
                                    paramData.matchId = data.matchId;
                                    paramData.round = singleData["ROUND NAME"];
                                    if (_.isEmpty(singleData["TEAM 1"]) || _.isEmpty(singleData["TEAM 2"])) {
                                        paramData.opponentsTeam = "";
                                    } else {
                                        paramData.opponentsTeam.push(singleData["TEAM 1"]);
                                        paramData.opponentsTeam.push(singleData["TEAM 2"]);
                                    }
                                    paramData.sport = singleData.SPORT;
                                    paramData.scheduleDate = singleData.DATE;
                                    paramData.scheduleTime = singleData.TIME;
                                    Match.saveMatch(paramData, function (err, complete) {
                                        if (err || _.isEmpty(complete)) {
                                            callback(err, null);
                                        } else {
                                            callback(null, complete);
                                        }
                                    });
                                }
                            }
                        ],
                        function (err, results) {
                            if (err || _.isEmpty(results)) {
                                callback(err, null);
                            } else {
                                callback(null, results);
                            }
                        });
                }, function (err, singleData) {
                    callback(null, singleData)
                });
            },
            function (singleData, callback) {
                async.concatSeries(singleData, function (n, callback) {
                        console.log("n", n);
                        if (countError != 0 && n.error == null) {
                            console.log("inside", n._id, "count", countError);
                            Match.remove({
                                _id: n.success._id
                            }).exec(function (err, found) {
                                if (err || _.isEmpty(found)) {
                                    callback(err, null);
                                } else {
                                    callback(null, n);
                                }
                            });
                        } else {
                            callback(null, n);
                        }
                    },
                    function (err, singleData) {
                        callback(null, singleData);
                    });

            },
            function (singleData, callback) {
                data.sport = singleData[0].success.sport;
                Match.addPreviousMatch(data, function (err, sportData) {
                    callback(null, singleData);
                });
            }
        ], function (err, results) {
            if (err || _.isEmpty(results)) {
                callback(err, null);
            } else {
                callback(null, results);
            }
        });

    },

    addPreviousMatch: function (data, callback) {
        var count = 0;
        var match = {};
        var final = {};
        match.prev = [];
        final.finalPrevious = [];
        async.waterfall([
                function (callback) {
                    Match.find({
                        sport: data.sport
                    }).lean().sort({
                        createdAt: -1
                    }).exec(function (err, found) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(found)) {
                                callback(null, []);
                            } else {
                                callback(null, found);
                            }
                        }
                    });
                },
                function (found, callback) {
                    final.matchData = found;
                    async.eachSeries(found, function (singleData, callback) {
                        if (count < 2) {
                            match.prev.push(singleData._id);
                            count++;
                        }
                        if (count == 2) {
                            final.finalPrevious.push(match.prev);
                            match.prev = [];
                            count = 0;
                        }
                        callback(null, count);
                    }, function (err) {
                        callback(null, final);
                    });
                },
                function (final, callback) {
                    var range = parseInt(data.range) + 1;
                    var rangeTotal = data.rangeTotal;
                    var i = 0;
                    var row = 0;
                    var ThirdPlace = [];
                    async.eachSeries(final.finalPrevious, function (singleData, callback) {
                            var id = final.matchData[row]._id;
                            var updateObj = {
                                $set: {
                                    prevMatch: final.finalPrevious[i]
                                }
                            };
                            console.log("row", row, "rangeTotal", rangeTotal);
                            if (final.matchData[row].round != "Third Place") {
                                Match.update({
                                    _id: id
                                }, updateObj).exec(
                                    function (err, match) {
                                        console.log("updated");
                                    });
                            }
                            i++;
                            row++;
                            callback(null, final);
                        },
                        function (err) {
                            callback(null, final);
                        });
                },
                function (final, callback) {
                    if (data.thirdPlace == "yes") {
                        Match.findOne({
                            sport: data.sport,
                            round: "Final"
                        }).lean().exec(function (err, found) {
                            if (err) {
                                callback(err, null);
                            } else {
                                if (_.isEmpty(found)) {
                                    callback(null, []);
                                } else {

                                    var updateObj = {
                                        $set: {
                                            prevMatch: found.prevMatch
                                        }
                                    };
                                    Match.update({
                                        sport: data.sport,
                                        round: "Third Place"
                                    }, updateObj).exec(
                                        function (err, match) {
                                            callback(null, final);
                                        });
                                }
                            }
                        });
                    } else {
                        callback(null, final);
                    }
                },
            ],
            function (err, results) {
                if (err || _.isEmpty(results)) {
                    callback(err, null);
                } else {
                    callback(null, results);
                }
            });
    },

    saveQualifyingIndividual: function (importData, data, callback) {
        var countError = 0;
        async.waterfall([
                function (callback) {
                    async.concatSeries(importData, function (singleData, callback) {
                        async.waterfall([
                                function (callback) {
                                    var date = Math.round((singleData.DATE - 25569) * 86400 * 1000);
                                    date = new Date(date);
                                    singleData.DATE = date.toISOString();
                                    callback(null, singleData);
                                },
                                function (singleData, callback) {
                                    console.log("singleData", singleData);
                                    var paramData = {};
                                    paramData.name = singleData['EVENT '];
                                    paramData.age = singleData["AGE GROUP"];
                                    if (singleData.GENDER == "Boys" || singleData.GENDER == "Male" || singleData.GENDER == "male") {
                                        paramData.gender = "male";
                                    } else if (singleData.GENDER == "Girls" || singleData.GENDER == "Female" || singleData.GENDER == "female") {
                                        paramData.gender = "female";
                                    }
                                    paramData.weight = undefined;
                                    Match.getSportId(paramData, function (err, sportData) {
                                        if (err || _.isEmpty(sportData)) {
                                            singleData.SPORT = null;
                                            err = "Sport,Event,AgeGroup,Gender may have wrong values";
                                            callback(null, {
                                                error: err,
                                                success: singleData
                                            });
                                        } else {
                                            singleData.SPORT = sportData.sportId;
                                            callback(null, singleData);
                                        }
                                    });
                                },
                                function (singleData, callback) {
                                    // console.log("logssss", singleData);
                                    if (singleData.error) {
                                        countError++;
                                        callback(null, singleData);
                                    } else {
                                        if (_.isEmpty(singleData["SFA ID"])) {
                                            callback(null, singleData);
                                        } else {
                                            // console.log("singleData1", singleData);
                                            var paramData = {};
                                            paramData.participant = singleData["SFA ID"];
                                            paramData.sport = singleData.SPORT;
                                            Match.getAthleteId(paramData, function (err, complete) {
                                                if (err || _.isEmpty(complete)) {
                                                    singleData["PARTICIPANT 1"] = null;
                                                    err = "SFA ID may have wrong values";
                                                    callback(null, {
                                                        error: err,
                                                        success: singleData
                                                    });
                                                } else {
                                                    singleData["PARTICIPANT 1"] = complete._id;
                                                    callback(null, singleData);
                                                }
                                            });
                                        }
                                    }
                                },
                                function (singleData, callback) {
                                    console.log("logssss", singleData);
                                    if (singleData.error) {
                                        countError++;
                                        callback(null, singleData);
                                    } else {
                                        var paramData = {};
                                        paramData.opponentsSingle = [];
                                        paramData.matchId = data.matchId;
                                        // paramData.round = "Qualifying Round";
                                        paramData.round = singleData["ROUND "];
                                        if (_.isEmpty(singleData["PARTICIPANT 1"])) {
                                            paramData.opponentsSingle = "";
                                        } else {
                                            paramData.opponentsSingle.push(singleData["PARTICIPANT 1"]);
                                        }
                                        paramData.sport = singleData.SPORT;
                                        paramData.scheduleDate = singleData.DATE;
                                        paramData.scheduleTime = singleData.TIME;
                                        paramData.excelType = data.excelType;
                                        Match.saveMatch(paramData, function (err, complete) {
                                            if (err || _.isEmpty(complete)) {
                                                callback(err, null);
                                            } else {
                                                callback(null, complete);
                                            }
                                        });
                                    }
                                }
                            ],
                            function (err, results) {
                                if (err || _.isEmpty(results)) {
                                    callback(err, null);
                                } else {
                                    callback(null, results);
                                }
                            });
                    }, function (err, singleData) {
                        callback(null, singleData)
                    });
                },
                function (singleData, callback) {
                    async.concatSeries(singleData, function (n, callback) {
                            console.log("n", n);
                            if (countError != 0 && n.error == null) {
                                console.log("inside", n.success._id, "count", countError);
                                Match.remove({
                                    _id: n.success._id
                                }).exec(function (err, found) {
                                    if (err || _.isEmpty(found)) {
                                        callback(err, null);
                                    } else {
                                        callback(null, n);
                                    }
                                });
                            } else {
                                callback(null, n);
                            }
                        },
                        function (err, singleData) {
                            callback(null, singleData);
                        });
                }
            ],
            function (err, results) {
                if (err || _.isEmpty(results)) {
                    callback(err, null);
                } else {
                    callback(null, results);
                }
            });

    },

    //-----------------------------Generate Excel-----------------------------------------

    generateExcelKnockout: function (data, res) {
        async.waterfall([
                function (callback) {
                    var deepSearch = "sport.sportslist.sportsListSubCategory.sportsListCategory sport.ageGroup sport.weight opponentsSingle.athleteId.school opponentsTeam.studentTeam.studentId";
                    Match.find({
                        sport: data.sport
                    }).lean().deepPopulate(deepSearch).exec(function (err, match) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(match)) {
                                callback(null, []);
                            } else {
                                console.log("found0", match);
                                callback(null, match);
                            }
                        }
                    });
                },
                function (match, callback) {
                    if (data.playerType == "individual") {
                        Match.generateExcelKnockoutIndividual(match, function (err, singleData) {
                            Config.generateExcel("KnockoutIndividual", singleData, res);
                        });
                    } else if (data.playerType == "team") {
                        Match.generateExcelKnockoutTeam(match, function (err, singleData) {
                            Config.generateExcel("KnockoutIndividual", singleData, res);
                        });
                    } else {
                        res.json({
                            "data": "Body not Found",
                            "value": false
                        })
                    }

                },
            ],
            function (err, excelData) {
                if (err) {
                    console.log(err);
                    callback(null, []);
                } else if (excelData) {
                    if (_.isEmpty(excelData)) {
                        callback(null, []);
                    } else {
                        callback(null, excelData);
                    }
                }
            });
    },

    generateExcelKnockoutIndividual: function (match, callback) {
        async.concatSeries(match, function (mainData, callback) {
                var obj = {};
                obj["MATCH ID"] = mainData.matchId;
                obj["ROUND NAME"] = mainData.round;
                obj.SPORT = mainData.sport.sportslist.sportsListSubCategory.name;
                if (mainData.sport.gender == "male") {
                    obj.GENDER = "Male";
                } else if (mainData.sport.gender == "female") {
                    obj.GENDER = "Female";
                } else {
                    obj.GENDER = "Male & Female"
                }
                obj["AGE GROUP"] = mainData.sport.ageGroup.name;
                obj.EVENT = mainData.sport.sportslist.name;
                if (mainData.sport.weight) {
                    obj["WEIGHT CATEGORIES"] = mainData.sport.weight.name;
                } else {
                    obj["WEIGHT CATEGORIES"] = "";
                }
                var dateTime = moment(mainData.scheduleDate).format('DD-MM-YYYY');
                obj.DATE = dateTime;
                obj.TIME = mainData.scheduleTime;
                if (mainData.opponentsSingle.length > 0) {
                    obj["SFAID 1"] = mainData.opponentsSingle[0].athleteId.sfaId;
                    if (mainData.opponentsSingle[0].athleteId.middleName) {
                        obj["PARTICIPANT 1"] = mainData.opponentsSingle[0].athleteId.firstName + " " + mainData.opponentsSingle[0].athleteId.middleName + " " + mainData.opponentsSingle[0].athleteId.surname;
                    } else {
                        obj["PARTICIPANT 1"] = mainData.opponentsSingle[0].athleteId.firstName + " " + mainData.opponentsSingle[0].athleteId.surname;
                    }
                    obj["SCHOOL 1"] = mainData.opponentsSingle[0].athleteId.school.name;
                    if (mainData.resultsCombat) {
                        if (mainData.opponentsSingle[0].athleteId._id.equals(mainData.resultsCombat.winnner.player)) {
                            obj["RESULT 1"] = "Won";
                        } else {
                            obj["RESULT 1"] = "Lost";
                        }
                        var i;
                        for (i = 0; i < mainData.resultsCombat.players[0].sets.length; i++) {
                            if (i == 0) {
                                obj["SCORE 1"] = "Set" + i + "-" + mainData.resultsCombat.players[0].sets[i].point;
                                obj["DATA POINTS 1"] = mainData.resultsCombat.players[0].sets[i];

                            } else {
                                obj["SCORE 1"] = obj["SCORE 1"] + "," + "Set" + i + "-" + mainData.resultsCombat.players[0].sets[i].point;
                                obj["DATA POINTS 1"] = obj["DATA POINTS 1"] + "," + mainData.resultsCombat.players[0].sets[i];
                            }

                        }
                        // obj["DATA POINTS 1"] = mainData.resultsCombat.players[0].sets;
                    } else if (mainData.resultsRacquet) {
                        if (mainData.opponentsSingle[0].athleteId._id.equals(mainData.resultsRacquet.winnner.player)) {
                            obj["RESULT 1"] = "Won";
                        } else {
                            obj["RESULT 1"] = "Lost";
                        }
                        var i;
                        for (i = 0; i < mainData.resultsRacquet.players[0].sets.length; i++) {
                            if (i == 0) {
                                obj["SCORE 1"] = "Set" + i + "-" + mainData.resultsRacquet.players[0].sets[i].point;
                                obj["DATA POINTS 1"] = mainData.resultsRacquet.players[0].sets[i];

                            } else {
                                obj["SCORE 1"] = obj["SCORE 1"] + "," + "Set" + i + "-" + mainData.resultsRacquet.players[0].sets[i].point;
                                obj["DATA POINTS 1"] = obj["DATA POINTS 1"] + "," + mainData.resultsRacquet.players[0].sets[i];
                            }

                        }
                        // obj["DATA POINTS 1"] = mainData.resultsCombat.players[0].sets;
                    }
                } else {
                    obj["SFAID 1"] = "";
                    obj["PARTICIPANT 1"] = "";
                    obj["SCHOOL 1"] = "";
                    obj["RESULT 1"] = "";
                    obj["SCORE 1"] = "";
                    obj["DATA POINTS 1"] = "";
                }

                if (mainData.opponentsSingle.length > 1) {
                    obj["SFAID 2"] = mainData.opponentsSingle[1].athleteId.sfaId;

                    if (mainData.opponentsSingle[0].athleteId.middleName) {
                        obj["PARTICIPANT 2"] = mainData.opponentsSingle[1].athleteId.firstName + " " + mainData.opponentsSingle[0].athleteId.middleName + " " + mainData.opponentsSingle[0].athleteId.surname;
                    } else {
                        obj["PARTICIPANT 2"] = mainData.opponentsSingle[1].athleteId.firstName + " " + mainData.opponentsSingle[0].athleteId.surname;
                    }
                    obj["SCHOOL 2"] = mainData.opponentsSingle[1].athleteId.school.name;
                    if (mainData.resultsCombat) {

                        if (mainData.opponentsSingle[1].athleteId._id === mainData.resultsCombat.winnner.player) {
                            obj["RESULT 2"] = "Won";
                        } else {
                            obj["RESULT 2"] = "Lost";
                        }
                        var i;
                        for (i = 0; i < mainData.resultsCombat.players[1].sets.length; i++) {
                            if (i == 0) {
                                obj["SCORE 2"] = "Set" + i + "-" + mainData.resultsCombat.players[1].sets[i].point;
                                obj["DATA POINTS 2"] = mainData.resultsCombat.players[1].sets[i];
                            } else {
                                obj["SCORE 2"] = obj["SCORE 2"] + "," + "Set" + i + "-" + mainData.resultsCombat.players[1].sets[i].point;
                                obj["DATA POINTS 2"] = obj["DATA POINTS 2"] + "," + mainData.resultsCombat.players[1].sets[i];
                            }
                        }
                        // obj["DATA POINTS 2"] = mainData.resultsCombat.players[1].sets[;
                    } else if (mainData.resultsRacquet) {

                        if (mainData.opponentsSingle[1].athleteId._id === mainData.resultsRacquet.winnner.player) {
                            obj["RESULT 2"] = "Won";
                        } else {
                            obj["RESULT 2"] = "Lost";
                        }
                        var i;
                        for (i = 0; i < mainData.resultsRacquet.players[1].sets.length; i++) {
                            if (i == 0) {
                                obj["SCORE 2"] = "Set" + i + "-" + mainData.resultsRacquet.players[1].sets[i].point;
                                obj["DATA POINTS 2"] = mainData.resultsRacquet.players[1].sets[i];
                            } else {
                                obj["SCORE 2"] = obj["SCORE 2"] + "," + "Set" + i + "-" + mainData.resultsRacquet.players[1].sets[i].point;
                                obj["DATA POINTS 2"] = obj["DATA POINTS 2"] + "," + mainData.resultsRacquet.players[1].sets[i];
                            }
                        }
                        // obj["DATA POINTS 2"] = mainData.resultsRacquet.players[1].sets[;
                    }
                } else {
                    obj["SFAID 2"] = "";
                    obj["PARTICIPANT 2"] = "";
                    obj["SCHOOL 2"] = "";
                    obj["RESULT 2"] = "";
                    obj["SCORE 2"] = "";
                    obj["DATA POINTS 2"] = "";
                }
                callback(null, obj);
            },
            function (err, singleData) {
                // Config.generateExcel("KnockoutIndividual", singleData, res);
                callback(null, singleData);
            });

    },

    generateBlankExcel: function (data, res) {
        var finalData = [];
        if (data.resultType == 'knockout' && data.playerType == 'individual') {
            var obj = {};
            // obj["MATCH ID"] = "";
            obj["ROUND NAME"] = "";
            obj["SPORT"] = "";
            obj.GENDER = ""
            obj["AGE GROUP"] = "";
            obj["EVENT"] = "";
            obj["WEIGHT CATEGORIES"] = "";
            obj.DATE = "";
            obj.TIME = "";
            obj["SFAID 1"] = "";
            obj["PARTICIPANT 1"] = "";
            obj["SCHOOL 1"] = "";
            // obj["RESULT 1"] = "";
            // obj["SCORE 1"] = "";
            // obj["DATA POINTS 1"] = "";
            obj["SFAID 2"] = "";
            obj["PARTICIPANT 2"] = "";
            obj["SCHOOL 2"] = "";
            // obj["RESULT 2"] = "";
            // obj["SCORE 2"] = "";
            // obj["DATA POINTS 2"] = "";
            finalData.push(obj);
            Config.generateExcel("KnockoutIndividual", finalData, res);
        } else if (data.resultType == 'knockout' && data.playerType == 'team') {
            var obj = {};
            // obj["MATCH ID"] = "";
            obj["ROUND NAME"] = "";
            obj["SPORT"] = "";
            obj.GENDER = ""
            obj["AGE GROUP"] = "";
            obj["EVENT"] = "";
            obj["WEIGHT CATEGORIES"] = "";
            obj.DATE = "";
            obj.TIME = "";
            obj["SFAID 1"] = "";
            obj["PARTICIPANT 1"] = "";
            obj["SCHOOL 1"] = "";
            obj["SFAID 2"] = "";
            obj["PARTICIPANT 2"] = "";
            obj["SCHOOL 2"] = "";
            // obj["RESULT 1"] = "";
            // obj["SCORE 1"] = "";
            // obj["DATA POINTS 1"] = "";
            // obj["RESULT 2"] = "";
            // obj["SCORE 2"] = "";
            // obj["DATA POINTS 2"] = "";
            finalData.push(obj);
            Config.generateExcel("KnockoutIndividual", finalData, res);
        } else if (data.resultType == 'heat' && data.playerType == 'individual') {
            var obj = {};
            // obj["MATCH ID"] = "";
            obj.DATE = "";
            obj.TIME = "";
            obj.SPORT = "";
            obj["EVENT "] = "";
            obj.GENDER = ""
            obj["AGE GROUP"] = "";
            obj["ROUND "] = "";
            obj["HEAT NUMBER"] = "";
            obj["LANE NUMBER"] = "";
            obj["SFA ID"] = " ";
            obj["NAME"] = " ";
            obj["SCHOOL"] = "";
            // obj["TIMING"] = " ";
            // obj["RESULT"] = " ";
            // obj["SCORE 1"] = "";
            // obj["DATA POINTS 1"] = "";
            finalData.push(obj);
            Config.generateExcel("KnockoutIndividual", finalData, res);
        } else if (data.resultType == 'heat' && data.playerType == 'team') {
            var obj = {};
            var obj = {};
            obj["MATCH ID"] = "";
            obj.DATE = "";
            obj.TIME = "";
            obj.SPORT = "";
            obj["EVENT "] = "";
            obj.GENDER = ""
            obj["AGE GROUP"] = "";
            obj["ROUND "] = "";
            obj["HEAT NUMBER"] = "";
            obj["LANE NUMBER"] = "";
            obj["TEAMID 1"] = "";
            obj["TEAM 1"] = "";
            obj["SCHOOL 1"] = "";
            // obj["TIMING"] = " ";
            // obj["RESULT 1"] = "";
            // obj["SCORE 1"] = "";
            // obj["DATA POINTS 1"] = "";
            finalData.push(obj);
            Config.generateExcel("KnockoutIndividual", finalData, res);
        } else if (data.resultType == "qualifying-round") {
            var obj = {};
            obj.DATE = "";
            obj.TIME = "";
            obj.SPORT = "";
            obj["EVENT "] = "";
            obj["GENDER"] = ""
            obj["AGE GROUP"] = "";
            // obj["WEIGHT CATEGORIES"] = "";
            obj["ROUND"] = "";
            obj["SFA ID"] = "";
            obj["NAME"] = "";
            obj["SCHOOL"] = "";
            // obj["ATTEMPT 1"] = "";
            // obj["ATTEMPT 2"] = "";
            // obj["ATTEMPT 3"] = "";
            // obj["RESULT"] = "";
            finalData.push(obj);
            Config.generateExcel("KnockoutIndividual", finalData, res);
        }

    },

    generateExcelKnockoutTeam: function (match, callback) {
        async.concatSeries(match, function (mainData, callback) {
                var obj = {};
                // console.log(JSON.stringify(mainData, null, "    "));
                obj["MATCH ID"] = mainData.matchId;
                obj["ROUND NAME"] = mainData.round;
                obj.SPORT = mainData.sport.sportslist.sportsListSubCategory.name;
                if (mainData.sport.gender == "male") {
                    obj.GENDER = "Male";
                } else if (mainData.sport.gender == "female") {
                    obj.GENDER = "Female";
                } else {
                    obj.GENDER = "Male & Female"
                }
                obj["AGE GROUP"] = mainData.sport.ageGroup.name;
                obj.EVENT = mainData.sport.sportslist.name;
                if (mainData.sport.weight) {
                    obj["WEIGHT CATEGORIES"] = mainData.sport.weight.name;
                } else {
                    obj["WEIGHT CATEGORIES"] = "";
                }
                var dateTime = moment(mainData.scheduleDate).format('DD-MM-YYYY');
                obj.DATE = dateTime;
                obj.TIME = mainData.scheduleTime;
                console.log(JSON.stringify(mainData.opponentsTeam, null, "    "), "-------------");
                if (mainData.opponentsTeam.length > 0) {
                    obj["TEAMID 1"] = mainData.opponentsTeam[0].teamId;
                    obj["SCHOOL 1"] = mainData.opponentsTeam[0].schoolName;
                    // console.log(JSON.stringify(mainData.resultsCombat, null, "    "),"-------------");                                    
                    if (mainData.resultsCombat) {
                        if (mainData.opponentsTeam[0].athleteId._id.equals(mainData.resultsCombat.winnner[0].player)) {
                            obj["RESULT 1"] = "Won";
                        } else {
                            obj["RESULT 1"] = "Lost";
                        }
                        var i;
                        for (i = 0; i < mainData.resultsCombat.players[0].sets.length; i++) {
                            if (i == 0) {
                                obj["SCORE 1"] = "Set" + i + "-" + mainData.resultsCombat.players[0].sets[i].point;
                                obj["DATA POINTS 1"] = mainData.resultsCombat.players[0].sets[i];

                            } else {
                                obj["SCORE 1"] = obj["SCORE 1"] + "," + "Set" + i + "-" + mainData.resultsCombat.players[0].sets[i].point;
                                obj["DATA POINTS 1"] = obj["DATA POINTS 1"] + "," + mainData.resultsCombat.players[0].sets[i];
                            }

                        }
                        // obj["DATA POINTS 1"] = mainData.resultsCombat.players[0].sets;
                    }
                } else {
                    obj["TEAMID 1"] = "";
                    obj["PARTICIPANT 1"] = "";
                    obj["SCHOOL 1"] = "";
                    obj["RESULT 1"] = "";
                    obj["SCORE 1"] = "";
                    obj["DATA POINTS 1"] = "";
                }

                if (mainData.opponentsTeam.length > 1) {
                    obj["TEAMID 2"] = mainData.opponentsTeam[1].teamId;
                    obj["SCHOOL 2"] = mainData.opponentsTeam[1].schoolName;
                    if (mainData.resultsCombat) {
                        if (mainData.opponentsTeam[1].athleteId._id === mainData.resultsCombat.winnner[0].player) {
                            obj["RESULT 2"] = "Won";
                        } else {
                            obj["RESULT 2"] = "Lost";
                        }
                        var i;
                        for (i = 0; i < mainData.resultsCombat.players[1].sets.length; i++) {
                            if (i == 0) {
                                obj["SCORE 2"] = "Set" + i + "-" + mainData.resultsCombat.players[1].sets[i].point;
                                obj["DATA POINTS 2"] = mainData.resultsCombat.players[1].sets[i];
                            } else {
                                obj["SCORE 2"] = obj["SCORE 2"] + "," + "Set" + i + "-" + mainData.resultsCombat.players[1].sets[i].point;
                                obj["DATA POINTS 2"] = obj["DATA POINTS 2"] + "," + mainData.resultsCombat.players[1].sets[i];
                            }
                        }
                        // obj["DATA POINTS 2"] = mainData.resultsCombat.players[1].sets[;
                    }
                } else {
                    obj["TEAMID 2"] = "";
                    obj["PARTICIPANT 2"] = "";
                    obj["SCHOOL 2"] = "";
                    obj["RESULT 2"] = "";
                    obj["SCORE 2"] = "";
                    obj["DATA POINTS 2"] = "";
                }
                // console.log(obj,"---------------------------");
                callback(null, obj);

            },
            function (err, singleData) {
                // Config.generateExcel("KnockoutIndividual", singleData, res);
                callback(null, singleData);
            });

    },

    generateExcelHeat: function (data, res) {
        async.waterfall([
                function (callback) {
                    var deepSearch = "sport.sportslist.sportsListSubCategory.sportsListCategory sport.ageGroup sport.weight opponentsSingle.athleteId.school opponentsTeam.studentTeam.studentId";
                    Match.find({
                        sport: data.sport
                    }).lean().deepPopulate(deepSearch).exec(function (err, match) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(match)) {
                                callback(null, []);
                            } else {
                                console.log("found0", match);
                                callback(null, match);
                            }
                        }
                    });
                },
                function (match, callback) {
                    if (data.playerType == "individual") {
                        Match.generateExcelHeatIndividual(match, function (err, singleData) {
                            Config.generateExcel("KnockoutIndividual", singleData, res);
                        });
                    } else if (data.playerType == "team") {
                        Match.generateExcelHeatTeam(match, function (err, singleData) {
                            Config.generateExcel("KnockoutTeam", singleData, res);
                        });
                    } else {
                        res.json({
                            "data": "Body not Found",
                            "value": false
                        })
                    }

                },
            ],
            function (err, excelData) {
                if (err) {
                    console.log(err);
                    callback(null, []);
                } else if (excelData) {
                    if (_.isEmpty(excelData)) {
                        callback(null, []);
                    } else {
                        callback(null, excelData);
                    }
                }
            });
    },

    generateExcelHeatIndividual: function (match, callback) {
        var count = 0;
        var prevRound = undefined;
        async.concatSeries(match, function (matchData, callback) {
                if (prevRound == undefined) {
                    count++;
                    prevRound = matchData.round;
                } else if (prevRound == matchData.round) {
                    count++;
                    prevRound = matchData.round;
                } else {
                    count = 1;
                    prevRound = matchData.round;
                }
                var i = 0;
                async.concatSeries(matchData.opponentsSingle, function (mainData, callback) {
                        var obj = {};
                        obj["MATCH ID"] = matchData.matchId;
                        var dateTime = moment(matchData.scheduleDate).format('DD/MM/YYYY');
                        obj.DATE = dateTime;
                        obj.TIME = matchData.scheduleTime;
                        obj.SPORT = matchData.sport.sportslist.sportsListSubCategory.name;
                        if (matchData.sport.gender == "male") {
                            obj.GENDER = "Male";
                        } else if (matchData.sport.gender == "female") {
                            obj.GENDER = "Female";
                        } else {
                            obj.GENDER = "Male & Female"
                        }
                        obj["AGE GROUP"] = matchData.sport.ageGroup.name;
                        obj.EVENT = matchData.sport.sportslist.name;
                        obj["ROUND "] = matchData.round;
                        obj["HEAT NUMBER"] = count;
                        obj["LANE NUMBER"] = matchData.resultHeat.players[i].laneNo;
                        if (mainData) {
                            obj["SFA ID"] = mainData.athleteId.sfaId;
                            if (mainData.athleteId.middleName) {
                                obj["NAME"] = mainData.athleteId.firstName + " " + mainData.athleteId.middleName + " " + mainData.athleteId.surname;
                            } else {
                                obj["NAME"] = mainData.athleteId.firstName + " " + mainData.athleteId.surname;
                            }
                            obj["SCHOOL"] = mainData.athleteId.school.name;
                            if (matchData.resultHeat.players[i].time) {
                                obj["TIMING"] = matchData.resultHeat.players[i].time;
                            } else {
                                obj["TIMING"] = " ";
                            }
                            if (matchData.resultHeat.players[i].result) {
                                obj["RESULT"] = matchData.resultHeat.players[i].result;
                            } else {
                                obj["RESULT"] = " ";
                            }

                        } else {
                            obj["SFA ID"] = " ";
                            obj["NAME"] = " ";
                            obj["SCHOOL"] = "";
                            obj["TIMING"] = " ";
                            obj["RESULT"] = " ";
                        }
                        i++;
                        callback(null, obj);
                    },
                    function (err, singleData) {
                        callback(null, singleData);
                    });
            },
            function (err, singleData) {
                callback(null, singleData);
            });
    },

    generateExcelHeatTeam: function (match, callback) {
        var count = 0;
        var prevRound = undefined;
        async.concatSeries(match, function (matchData, callback) {
                if (prevRound == undefined) {
                    count++;
                    prevRound = matchData.round;
                } else if (prevRound == matchData.round) {
                    count++;
                    prevRound = matchData.round;
                } else {
                    count = 1;
                    prevRound = matchData.round;
                }
                var laneNo = 1;
                var i = 0;
                async.concatSeries(matchData.opponentsTeam, function (mainData, callback) {
                        var obj = {};
                        obj["MATCH ID"] = matchData.matchId;
                        var dateTime = moment(matchData.scheduleDate).format('DD/MM/YYYY');
                        obj.DATE = dateTime;
                        obj.TIME = matchData.scheduleTime;
                        console.log("sport", matchData.sport.sportslist.sportsListSubCategory.name);
                        obj.SPORT = matchData.sport.sportslist.sportsListSubCategory.name;
                        if (matchData.sport.gender == "male") {
                            obj.GENDER = "Male";
                        } else if (matchData.sport.gender == "Female") {
                            obj.GENDER = "Female";
                        } else {
                            obj.GENDER = "Male & Female"
                        }
                        obj["AGE GROUP"] = matchData.sport.ageGroup.name;
                        obj.EVENT = matchData.sport.sportslist.name;
                        obj["ROUND "] = matchData.round;
                        obj["HEAT NUMBER"] = count;
                        obj["LANE NUMBER"] = laneNo;
                        laneNo++;
                        if (mainData) {
                            obj["TEAM ID"] = mainData.teamId;
                            obj["NAME"] = mainData.name;
                            obj["SCHOOL"] = mainData.schoolName;
                            if (matchData.resultHeat.teams[i].time) {
                                obj["TIMING"] = matchData.resultHeat.teams[i].time;
                            } else {
                                obj["TIMING"] = " ";
                            }
                            if (matchData.resultHeat.teams[i].result) {
                                obj["RESULT"] = matchData.resultHeat.teams[i].result;
                            } else {
                                obj["RESULT"] = " ";
                            }
                        } else {
                            obj["TEAMID 1"] = "";
                            obj["TEAM 1"] = "";
                            obj["SCHOOL 1"] = "";
                            obj["RESULT 1"] = "";
                            obj["SCORE 1"] = "";
                            obj["DATA POINTS 1"] = "";
                        }
                        callback(null, obj);
                    },
                    function (err, singleData) {
                        callback(null, singleData);
                    });
                // count++;
            },
            function (err, singleData) {
                callback(null, singleData);
            });
    },

    generateExcelQualifyingRound: function (data, res) {
        async.waterfall([
                function (callback) {
                    var deepSearch = "sport.sportslist.sportsListSubCategory.sportsListCategory sport.ageGroup sport.weight opponentsSingle.athleteId.school opponentsTeam.studentTeam.studentId";
                    Match.find({
                        sport: data.sport
                    }).lean().deepPopulate(deepSearch).exec(function (err, match) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(match)) {
                                callback(null, []);
                            } else {
                                console.log("found0", match);
                                callback(null, match);
                            }
                        }
                    });
                },
                function (match, callback) {
                    Match.generateExcelQualifyingRoundIndividual(match, function (err, singleData) {
                        Config.generateExcel("QualifyingRoundIndividual", singleData, res);
                    });
                },
            ],
            function (err, excelData) {
                if (err) {
                    console.log(err);
                    callback(null, []);
                } else if (excelData) {
                    if (_.isEmpty(excelData)) {
                        callback(null, []);
                    } else {
                        callback(null, excelData);
                    }
                }
            });
    },

    generateExcelQualifyingRoundIndividual: function (match, callback) {
        async.concatSeries(match, function (mainData, callback) {
                var obj = {};
                obj["MATCH ID"] = mainData.matchId;
                obj["ROUND NAME"] = mainData.round;
                obj.SPORT = mainData.sport.sportslist.sportsListSubCategory.name;
                if (mainData.sport.gender == "male") {
                    obj.GENDER = "Male";
                } else if (mainData.sport.gender == "female") {
                    obj.GENDER = "Female";
                } else {
                    obj.GENDER = "Male & Female"
                }
                obj["AGE GROUP"] = mainData.sport.ageGroup.name;
                obj.EVENT = mainData.sport.sportslist.name;
                if (mainData.sport.weight) {
                    obj["WEIGHT CATEGORIES"] = mainData.sport.weight.name;
                } else {
                    obj["WEIGHT CATEGORIES"] = "";
                }
                var dateTime = moment(mainData.scheduleDate).format('DD-MM-YYYY');
                obj.DATE = dateTime;
                obj.TIME = mainData.scheduleTime;
                if (mainData.opponentsSingle[0]) {
                    obj["SFA ID"] = mainData.opponentsSingle[0].athleteId.sfaId;
                    if (mainData.opponentsSingle[0].athleteId.middleName) {
                        obj["PARTICIPANT 1"] = mainData.opponentsSingle[0].athleteId.firstName + " " + mainData.opponentsSingle[0].athleteId.middleName + " " + mainData.opponentsSingle[0].athleteId.surname;
                    } else {
                        obj["PARTICIPANT 1"] = mainData.opponentsSingle[0].athleteId.firstName + " " + mainData.opponentsSingle[0].athleteId.surname;
                    }
                    obj["SCHOOL"] = mainData.opponentsSingle[0].athleteId.school.name;
                    if (mainData.resultQualifyingRound) {
                        if (mainData.resultQualifyingRound.player.attempt[0]) {
                            obj["ATTEMPT 1"] = mainData.resultQualifyingRound.player.attempt[0];
                        } else if (mainData.resultQualifyingRound.player.attempt[1]) {
                            obj["ATTEMPT 2"] = mainData.resultQualifyingRound.player.attempt[1];
                        } else if (mainData.resultQualifyingRound.player.attempt[2]) {
                            obj["ATTEMPT 3"] = mainData.resultQualifyingRound.player.attempt[2];
                        }
                        if (mainData.resultQualifyingRound.player.result) {
                            obj["RESULT"] = mainData.resultQualifyingRound.player.result;
                        } else {
                            obj["RESULT"] = "";
                        }
                    } else {
                        obj["ATTEMPT 1"] = "";
                        obj["ATTEMPT 2"] = "";
                        obj["ATTEMPT 3"] = "";
                        obj["RESULT"] = "";
                    }
                } else {
                    obj["SFA ID"] = "";
                    obj["PARTICIPANT"] = "";
                    obj["SCHOOL"] = "";
                    obj["ATTEMPT 1"] = "";
                    obj["ATTEMPT 2"] = "";
                    obj["ATTEMPT 3"] = "";
                    obj["RESULT"] = "";

                }
                callback(null, obj);

            },
            function (err, singleData) {
                // Config.generateExcel("KnockoutIndividual", singleData, res);
                callback(null, singleData);
            });

    },

    generateExcelQualifying: function (data, res) {
        async.waterfall([
                function (callback) {
                    var deepSearch = "sport.sportslist.sportsListSubCategory.sportsListCategory sport.ageGroup sport.weight opponentsSingle.athleteId.school opponentsTeam.studentTeam.studentId";
                    Match.find({
                        sport: data.sport,
                        excelType: "qualifying"
                    }).lean().deepPopulate(deepSearch).exec(function (err, match) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(match)) {
                                callback(null, []);
                            } else {
                                callback(null, match);
                            }
                        }
                    });
                },
                function (match, callback) {
                    async.concatSeries(match, function (mainData, callback) {
                            var obj = {};
                            obj["MATCH ID"] = mainData.matchId;
                            var dateTime = moment(mainData.scheduleDate).format('DD-MM-YYYY');
                            obj.DATE = dateTime;
                            obj.TIME = mainData.scheduleTime;
                            obj.SPORT = mainData.sport.sportslist.sportsListSubCategory.name;
                            obj.EVENT = mainData.sport.sportslist.name;
                            if (mainData.sport.gender == "male") {
                                obj.GENDER = "Male";
                            } else if (mainData.sport.gender == "female") {
                                obj.GENDER = "Female";
                            } else {
                                obj.GENDER = "Male & Female"
                            }
                            obj["AGE GROUP"] = mainData.sport.ageGroup.name;
                            obj["ROUND"] = mainData.round;
                            if (mainData.opponentsSingle.length > 0) {
                                obj["SFA ID"] = mainData.opponentsSingle[0].athleteId.sfaId;
                                if (mainData.opponentsSingle[0].athleteId.middleName) {
                                    obj["NAME"] = mainData.opponentsSingle[0].athleteId.firstName + " " + mainData.opponentsSingle[0].athleteId.middleName + " " + mainData.opponentsSingle[0].athleteId.surname;
                                } else {
                                    obj["NAME"] = mainData.opponentsSingle[0].athleteId.firstName + " " + mainData.opponentsSingle[0].athleteId.surname;
                                }
                                obj["SCHOOL"] = mainData.opponentsSingle[0].athleteId.school.name;

                                if (mainData.resultQualifyingRound) {
                                    obj["SCORE - ROUND 1"] = mainData.resultQualifyingRound.player.attempt[0];
                                    obj["SCORE - ROUND 2"] = mainData.resultQualifyingRound.player.attempt[1];
                                    obj["FINAL SCORE"] = mainData.resultQualifyingRound.player.attempt[2];
                                    obj["RANK"] = mainData.resultQualifyingRound.player.rank;
                                    obj["RESULT"] = mainData.resultQualifyingRound.player.result;
                                    if (mainData.resultQualifyingRound.player.video) {
                                        obj["Video"] = mainData.resultQualifyingRound.player.video;
                                    } else {
                                        obj["Video"] = "";
                                    }
                                    if (mainData.resultQualifyingRound.player.matchCenter) {
                                        obj["MatchCenter"] = mainData.resultQualifyingRound.player.matchCenter;
                                    } else {
                                        obj["MatchCenter"] = "";
                                    }
                                } else {
                                    obj["SCORE - ROUND 1"] = "";
                                    obj["SCORE - ROUND 2"] = "";
                                    obj["FINAL SCORE"] = "";
                                    obj["RANK"] = "";
                                    obj["RESULT"] = "";
                                    obj["Video"] = "";
                                    obj["MatchCenter"] = "";
                                }

                            } else {
                                obj["SFA ID"] = "";
                                obj["NAME"] = "";
                                obj["SCHOOL"] = "";
                                obj["SCORE - ROUND 1"] = "";
                                obj["SCORE - ROUND 2"] = "";
                                obj["FINAL SCORE"] = "";
                                obj["RANK"] = "";
                                obj["RESULT"] = "";
                                obj["Video"] = "";
                                obj["MatchCenter"] = "";
                            }
                            callback(null, obj);

                        },
                        function (err, singleData) {
                            callback(null, singleData);
                        });
                },
            ],
            function (err, excelData) {
                if (err) {
                    console.log(err);
                    callback(null, []);
                } else if (excelData) {
                    if (_.isEmpty(excelData)) {
                        callback(null, []);
                    } else {
                        Config.generateExcel("QualifyingRoundIndividual", excelData, res);
                    }
                }
            });
    },

    generateExcelQualifyingKnockout: function (data, res) {
        async.waterfall([
                function (callback) {
                    var deepSearch = "sport.sportslist.sportsListSubCategory.sportsListCategory sport.ageGroup sport.weight opponentsSingle.athleteId.school opponentsTeam.studentTeam.studentId";
                    Match.find({
                        sport: data.sport,
                        excelType: "knockout"
                    }).lean().deepPopulate(deepSearch).exec(function (err, match) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(match)) {
                                callback(null, []);
                            } else {
                                callback(null, match);
                            }
                        }
                    });
                },
                function (match, callback) {
                    async.concatSeries(match, function (mainData, callback) {
                            var obj = {};
                            obj["MATCH ID"] = mainData.matchId;
                            obj["ROUND NAME"] = mainData.round;
                            obj.SPORT = mainData.sport.sportslist.sportsListSubCategory.name;
                            if (mainData.sport.gender == "male") {
                                obj.GENDER = "Male";
                            } else if (mainData.sport.gender == "female") {
                                obj.GENDER = "Female";
                            } else {
                                obj.GENDER = "Male & Female"
                            }
                            obj["AGE GROUP"] = mainData.sport.ageGroup.name;
                            obj.EVENT = mainData.sport.sportslist.name;
                            if (mainData.sport.weight) {
                                obj["WEIGHT CATEGORIES"] = mainData.sport.weight.name;
                            } else {
                                obj["WEIGHT CATEGORIES"] = "";
                            }
                            var dateTime = moment(mainData.scheduleDate).format('DD-MM-YYYY');
                            obj.DATE = dateTime;
                            obj.TIME = mainData.scheduleTime;
                            if (mainData.opponentsSingle.length > 0) {
                                obj["SFAID 1"] = mainData.opponentsSingle[0].athleteId.sfaId;
                                if (mainData.opponentsSingle[0].athleteId.middleName) {
                                    obj["PARTICIPANT 1"] = mainData.opponentsSingle[0].athleteId.firstName + " " + mainData.opponentsSingle[0].athleteId.middleName + " " + mainData.opponentsSingle[0].athleteId.surname;
                                } else {
                                    obj["PARTICIPANT 1"] = mainData.opponentsSingle[0].athleteId.firstName + " " + mainData.opponentsSingle[0].athleteId.surname;
                                }
                                obj["SCHOOL 1"] = mainData.opponentsSingle[0].athleteId.school.name;

                            } else {
                                obj["SFAID 1"] = "";
                                obj["PARTICIPANT 1"] = "";
                                obj["SCHOOL 1"] = "";
                            }

                            if (mainData.opponentsSingle.length > 1) {
                                obj["SFAID 2"] = mainData.opponentsSingle[1].athleteId.sfaId;

                                if (mainData.opponentsSingle[0].athleteId.middleName) {
                                    obj["PARTICIPANT 2"] = mainData.opponentsSingle[1].athleteId.firstName + " " + mainData.opponentsSingle[0].athleteId.middleName + " " + mainData.opponentsSingle[0].athleteId.surname;
                                } else {
                                    obj["PARTICIPANT 2"] = mainData.opponentsSingle[1].athleteId.firstName + " " + mainData.opponentsSingle[0].athleteId.surname;
                                }
                                obj["SCHOOL 2"] = mainData.opponentsSingle[1].athleteId.school.name;
                                if (mainData.resultKnockout) {
                                    obj["FINAL SCORE "] = mainData.resultKnockout.finalScore;
                                    if (mainData.resultKnockout.shootOutScore) {
                                        obj["SHOOTOUT SCORE"] = mainData.resultKnockout.shootOutScore;
                                    } else {
                                        obj["SHOOTOUT SCORE"] = "";
                                    }
                                    if (mainData.opponentsSingle[0].athleteId._id.equals(mainData.resultKnockout.winnner.player)) {
                                        if (mainData.opponentsSingle[0].athleteId.middleName) {
                                            var name = mainData.opponentsSingle[0].athleteId.firstName + mainData.opponentsSingle[0].athleteId.middleName + mainData.opponentsSingle[0].athleteId.surname;
                                        } else {
                                            var name = mainData.opponentsSingle[0].athleteId.firstName + mainData.opponentsSingle[0].athleteId.surname;
                                        }
                                        obj["WINNER NAME"] = name;
                                        obj["WINNER SFA ID "] = mainData.opponentsSingle[0].athleteId.sfaId;
                                    } else {
                                        if (mainData.opponentsSingle[1].athleteId.middleName) {
                                            var name = mainData.opponentsSingle[1].athleteId.firstName + mainData.opponentsSingle[1].athleteId.middleName + mainData.opponentsSingle[1].athleteId.surname;
                                        } else {
                                            var name = mainData.opponentsSingle[1].athleteId.firstName + mainData.opponentsSingle[1].athleteId.surname;
                                        }
                                        obj["WINNER NAME"] = name;
                                        obj["WINNER SFA ID "] = mainData.opponentsSingle[1].athleteId.sfaId;
                                    }

                                } else {
                                    obj["FINAL SCORE "] = "";
                                    obj["SHOOTOUT SCORE"] = "";
                                    obj["WINNER NAME"] = "";
                                    obj["WINNER SFA ID "] = "";

                                }

                            } else {
                                obj["SFAID 2"] = "";
                                obj["PARTICIPANT 2"] = "";
                                obj["SCHOOL 2"] = "";
                                obj["FINAL SCORE "] = "";
                                obj["SHOOTOUT SCORE"] = "";
                                obj["WINNER NAME"] = "";
                                obj["WINNER SFA ID "] = "";
                            }
                            callback(null, obj);
                        },
                        function (err, singleData) {
                            // Config.generateExcel("KnockoutIndividual", singleData, res);
                            callback(null, singleData);
                        });
                },
            ],
            function (err, excelData) {
                if (err) {
                    console.log(err);
                    callback(null, []);
                } else if (excelData) {
                    if (_.isEmpty(excelData)) {
                        callback(null, []);
                    } else {
                        Config.generateExcel("QualifyingRoundIndividual", excelData, res);
                    }
                }
            });

    },
    //  ----------------------------  UPDATE SCORE RESULT  --------------------------------------

    //update from digital score
    updateResult: function (data, callback) {
        var updateObj = {};
        var updateObj1 = {};
        async.waterfall([
                function (callback) {
                    if (data.resultsCombat) {
                        var matchObj = {
                            $set: {
                                resultsCombat: data.resultsCombat
                            }
                        };
                        callback(null, matchObj);

                    } else if (data.resultsRacquet) {
                        var matchObj = {
                            $set: {
                                resultsRacquet: data.resultsRacquet
                            }
                        };
                        callback(null, matchObj);
                    }
                },
                function (matchObj, callback) {
                    Match.update({
                        matchId: data.matchId
                    }, matchObj).exec(
                        function (err, match) {
                            if (err) {
                                callback(err, null);
                            } else {
                                if (_.isEmpty(match)) {
                                    callback(null, []);
                                } else {
                                    callback(null, match);
                                }
                            }
                        });
                },
                function (matchObj, callback) {
                    // var deepSearch = "sport.sportslist.sportsListSubCategory.sportsListCategory sport.ageGroup sport.weight opponentsSingle.athleteId.school opponentsTeam.studentTeam.studentId";
                    Match.findOne({
                        matchId: data.matchId
                    }).lean().exec(function (err, found) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(found)) {
                                callback(null, []);
                            } else {
                                if (!_.isEmpty(found.opponentsSingle)) {
                                    data.isTeam = false;
                                } else if (!_.isEmpty(found.opponentsTeam)) {
                                    data.isTeam = true;
                                }
                                data._id = found._id;
                                data.found = found;
                                callback(null, found);
                            }
                        }
                    });
                },
                function (found, callback) {
                    Match.find({
                        prevMatch: data._id
                    }).lean().exec(function (err, found) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(found)) {
                                callback(null, []);
                            } else {
                                callback(null, found);
                            }
                        }
                    });
                },
                function (found, callback) {
                    if (_.isEmpty(found)) {
                        callback(null, data.found);
                    } else {
                        var winPlayer = [];
                        var lostPlayer = [];
                        if (data.found.round == "Semi Final") {
                            if (data.isTeam == false && _.isEmpty(found[0].opponentsSingle) && _.isEmpty(found[1].opponentsSingle)) {
                                // console.log("inside found", data.found.resultsCombat.status);
                                if (data.found.resultsCombat && data.found.resultsCombat.status == 'IsCompleted') {
                                    if (data.found.opponentsSingle[0].equals(data.found.resultsCombat.winner.opponentsSingle)) {
                                        lostPlayer.push(data.found.opponentsSingle[1]);
                                        winPlayer.push(data.found.resultsCombat.winner.opponentsSingle);
                                        console.log("player", winPlayer);
                                    } else {
                                        lostPlayer.push(data.found.opponentsSingle[0]);
                                        winPlayer.push(data.found.resultsCombat.winner.opponentsSingle);
                                        console.log("player", winPlayer);
                                    }
                                    updateObj = {
                                        $set: {
                                            opponentsSingle: winPlayer
                                        }
                                    };
                                    updateObj1 = {
                                        $set: {
                                            opponentsSingle: lostPlayer
                                        }
                                    };
                                } else if (data.found.resultsRacquet && data.found.resultsRacquet.status == 'IsCompleted') {
                                    if (data.found.opponentsSingle[0].equals(data.found.resultsRacquet.winner.opponentsSingle)) {
                                        lostPlayer.push(data.found.opponentsSingle[1]);
                                        winPlayer.push(data.found.resultsRacquet.winner.opponentsSingle);
                                        console.log("player", winPlayer);
                                    } else {
                                        lostPlayer.push(data.found.opponentsSingle[0]);
                                        winPlayer.push(data.found.resultsRacquet.winner.opponentsSingle);
                                        console.log("player", winPlayer);
                                    }
                                    updateObj = {
                                        $set: {
                                            opponentsSingle: winPlayer
                                        }
                                    };
                                    updateObj1 = {
                                        $set: {
                                            opponentsSingle: lostPlayer
                                        }
                                    };
                                }


                            } else if (data.isTeam == false && !_.isEmpty(found[0].opponentsSingle) && !_.isEmpty(found[1].opponentsSingle)) {
                                if (found[0].opponentsSingle.length == 1 && found[1].opponentsSingle.length == 1) {
                                    var playerId = found[0].opponentsSingle[0];
                                    var playerId1 = found[1].opponentsSingle[0];
                                    winPlayer.push(playerId);
                                    lostPlayer.push(playerId1);
                                    if (data.found.resultsCombat && data.found.resultsCombat.status == 'IsCompleted') {
                                        if (data.found.opponentsSingle[0].equals(data.found.resultsCombat.winner.opponentsSingle)) {
                                            lostPlayer.push(data.found.opponentsSingle[1]);
                                            winPlayer.push(data.found.resultsCombat.winner.opponentsSingle);
                                            console.log("player", winPlayer);
                                        } else {
                                            lostPlayer.push(data.found.opponentsSingle[0]);
                                            winPlayer.push(data.found.resultsCombat.winner.opponentsSingle);
                                            console.log("player", winPlayer);
                                        }
                                        updateObj = {
                                            $set: {
                                                opponentsSingle: winPlayer
                                            }
                                        };
                                        updateObj1 = {
                                            $set: {
                                                opponentsSingle: lostPlayer
                                            }
                                        };
                                    } else if (data.found.resultsRacquet && data.found.resultsRacquet.status == 'IsCompleted') {
                                        if (data.found.opponentsSingle[0].equals(data.found.resultsRacquet.winner.opponentsSingle)) {
                                            lostPlayer.push(data.found.opponentsSingle[1]);
                                            winPlayer.push(data.found.resultsRacquet.winner.opponentsSingle);
                                            console.log("player", winPlayer);
                                        } else {
                                            lostPlayer.push(data.found.opponentsSingle[0]);
                                            winPlayer.push(data.found.resultsRacquet.winner.opponentsSingle);
                                            console.log("player", winPlayer);
                                        }
                                        updateObj = {
                                            $set: {
                                                opponentsSingle: winPlayer
                                            }
                                        };
                                        updateObj1 = {
                                            $set: {
                                                opponentsSingle: lostPlayer
                                            }
                                        };
                                    }

                                } else {
                                    updateObj = {};
                                }
                            } else if (data.isTeam == true && _.isEmpty(found[0].opponentsTeam) && _.isEmpty(found[1].opponentsTeam)) {
                                // console.log("inside found", data.found.resultsCombat.status);
                                if (data.found.resultsRacquet && data.found.resultsRacquet.status == 'IsCompleted') {
                                    if (data.found.opponentsTeam[0].equals(data.found.resultsRacquet.winner.player)) {
                                        lostPlayer.push(data.found.opponentsTeam[1]);
                                        winPlayer.push(data.found.resultsRacquet.winner.player);
                                        console.log("player", winPlayer);
                                    } else {
                                        lostPlayer.push(data.found.opponentsTeam[0]);
                                        winPlayer.push(data.found.resultsRacquet.winner.player);
                                        console.log("player", winPlayer);
                                    }
                                    updateObj = {
                                        $set: {
                                            opponentsSingle: winPlayer
                                        }
                                    };
                                    updateObj1 = {
                                        $set: {
                                            opponentsSingle: lostPlayer
                                        }
                                    };
                                }
                            } else if (data.isTeam == true && !_.isEmpty(found[0].opponentsTeam) && !_.isEmpty(found[1].opponentsTeam)) {
                                if (found[0].opponentsTeam.length == 1 && found[1].opponentsTeam.length == 1) {
                                    var playerId = found[0].opponentsTeam[0];
                                    var playerId1 = found[1].opponentsTeam[0];
                                    winPlayer.push(playerId);
                                    lostPlayer.push(playerId1);
                                    if (data.found.resultsRacquet && data.found.resultsRacquet.status == 'IsCompleted') {
                                        if (data.found.opponentsTeam[0].equals(data.found.resultsRacquet.winner.player)) {
                                            lostPlayer.push(data.found.opponentsTeam[1]);
                                            winPlayer.push(data.found.resultsRacquet.winner.player);
                                            console.log("player", winPlayer);
                                        } else {
                                            lostPlayer.push(data.found.opponentsTeam[0]);
                                            winPlayer.push(data.found.resultsRacquet.winner.player);
                                            console.log("player", winPlayer);
                                        }
                                        updateObj = {
                                            $set: {
                                                opponentsSingle: winPlayer
                                            }
                                        };
                                        updateObj1 = {
                                            $set: {
                                                opponentsSingle: lostPlayer
                                            }
                                        };
                                    }

                                } else {
                                    updateObj = {};
                                }
                            }

                        } else {
                            console.log("in found", found, "data", data);
                            if (data.isTeam == false && _.isEmpty(found[0].opponentsSingle)) {
                                if (data.found.resultsCombat && data.found.resultsCombat.status == 'IsCompleted') {
                                    winPlayer.push(data.found.resultsCombat.winner.opponentsSingle);
                                    updateObj = {
                                        $set: {
                                            opponentsSingle: winPlayer
                                        }
                                    };
                                } else if (data.found.resultsRacquet && data.found.resultsRacquet.status == 'IsCompleted') {
                                    winPlayer.push(data.found.resultsRacquet.winner.opponentsSingle);
                                    console.log("player", winPlayer);
                                    updateObj = {
                                        $set: {
                                            opponentsSingle: winPlayer
                                        }
                                    };
                                }
                            } else if (data.isTeam == false && !_.isEmpty(found[0].opponentsSingle)) {
                                console.log("updating match", data.found);
                                if (found[0].opponentsSingle.length == 1) {
                                    var playerId = found[0].opponentsSingle[0];
                                    winPlayer.push(playerId);
                                    if (data.found.resultsCombat && data.found.resultsCombat.status == 'IsCompleted') {
                                        winPlayer.push(data.found.resultsCombat.winner.opponentsSingle);
                                        console.log("player", winPlayer);
                                        updateObj = {
                                            $set: {
                                                opponentsSingle: winPlayer
                                            }
                                        };
                                    } else if (data.found.resultsRacquet && data.found.resultsRacquet.status == "IsCompleted") {
                                        winPlayer.push(data.found.resultsRacquet.winner.opponentsSingle);
                                        console.log("player", winPlayer);
                                        updateObj = {
                                            $set: {
                                                opponentsSingle: winPlayer
                                            }
                                        };
                                    }
                                } else {
                                    updateObj = {};
                                }
                            } else if (data.isTeam == true && _.isEmpty(found[0].opponentsTeam)) {
                                if (data.found.resultsRacquet && data.found.resultsRacquet.status == 'IsCompleted') {
                                    winPlayer.push(data.found.resultsRacquet.winner.player);
                                    console.log("player", winPlayer);
                                    updateObj = {
                                        $set: {
                                            opponentsTeam: winPlayer
                                        }
                                    };
                                }
                            } else if (data.isTeam == true && !_.isEmpty(found[0].opponentsTeam)) {
                                console.log("updating match", data.found);
                                if (found[0].opponentsTeam.length == 1) {
                                    var playerId = found[0].opponentsTeam[0];
                                    winPlayer.push(playerId);
                                    if (data.found.resultsRacquet && data.found.resultsRacquet.status == "IsCompleted") {
                                        winPlayer.push(data.found.resultsRacquet.winner.player);
                                        console.log("player", winPlayer);
                                        updateObj = {
                                            $set: {
                                                opponentsTeam: winPlayer
                                            }
                                        };
                                    }
                                } else {
                                    updateObj = {};
                                }
                            }
                        }
                        if (!_.isEmpty(updateObj) && !_.isEmpty(updateObj1)) {
                            async.parallel([
                                function (callback) {
                                    Match.update({
                                        matchId: found[0].matchId
                                    }, updateObj).exec(
                                        function (err, match) {
                                            if (err) {
                                                callback(err, null);
                                            } else {
                                                if (_.isEmpty(match)) {
                                                    callback(null, []);
                                                } else {
                                                    callback(null, match);
                                                }
                                            }
                                        });
                                },
                                function (callback) {
                                    Match.update({
                                        matchId: found[1].matchId
                                    }, updateObj1).exec(
                                        function (err, match) {
                                            if (err) {
                                                callback(err, null);
                                            } else {
                                                if (_.isEmpty(match)) {
                                                    callback(null, []);
                                                } else {
                                                    callback(null, match);
                                                }
                                            }
                                        });
                                }
                            ], function (err, results) {
                                if (err || _.isEmpty(results)) {
                                    callback(err, null);
                                } else {
                                    callback(null, results);
                                }
                            });
                        } else if (!_.isEmpty(updateObj)) {
                            console.log("update", updateObj, "found", found);
                            Match.update({
                                matchId: found[0].matchId
                            }, updateObj).exec(
                                function (err, match) {
                                    if (err) {
                                        callback(err, null);
                                    } else {
                                        if (_.isEmpty(match)) {
                                            callback(null, []);
                                        } else {
                                            callback(null, match);
                                        }
                                    }
                                });
                        } else {
                            callback(null, found);
                        }
                    }
                }

            ],
            function (err, results) {
                if (err || _.isEmpty(results)) {
                    callback(err, null);
                } else {
                    callback(null, results);
                }
            });
    },

    UpdateHeatIndividual: function (importData, callback) {
        var countError = 0;
        var arrMathes = [];
        async.waterfall([
                function (callback) {
                    async.concatSeries(importData, function (mainData, callback) {
                            async.concatSeries(mainData, function (arrData, callback) {
                                    var paramData = {};
                                    paramData.opponentsSingle = [];
                                    var result = {};
                                    result.players = [];
                                    async.concatSeries(arrData, function (singleData, callback) {
                                        var date = moment(singleData.DATE, "DD-MM-YYYY");
                                        singleData.DATE = date;
                                        async.waterfall([
                                                function (callback) {
                                                    var paramData = {};
                                                    paramData.name = singleData.EVENT;
                                                    paramData.age = singleData["AGE GROUP"];
                                                    if (singleData.GENDER == "Boys" || singleData.GENDER == "Male" || singleData.GENDER == "male") {
                                                        paramData.gender = "male";
                                                    } else if (singleData.GENDER == "Girls" || singleData.GENDER == "Female" || singleData.GENDER == "female") {
                                                        paramData.gender = "female";
                                                    }
                                                    paramData.weight = undefined;
                                                    Match.getSportId(paramData, function (err, sportData) {
                                                        if (err || _.isEmpty(sportData)) {
                                                            singleData.SPORT = null;
                                                            err = "Sport,Event,AgeGroup,Gender may have wrong values";
                                                            callback(null, {
                                                                error: err,
                                                                success: singleData
                                                            });
                                                        } else {
                                                            singleData.SPORT = sportData.sportId;
                                                            callback(null, singleData);
                                                        }
                                                    });
                                                },
                                                function (singleData, callback) {
                                                    if (singleData.error) {
                                                        countError++;
                                                        finalData = singleData;
                                                        callback(null, singleData);
                                                    } else {
                                                        if (_.isEmpty(singleData["SFA ID"])) {
                                                            finalData.error = "SFA ID is empty";
                                                            finalData.success = singleData;
                                                            callback(null, singleData);
                                                        } else {
                                                            var param = {};
                                                            param.participant = singleData["SFA ID"];
                                                            param.sport = singleData.SPORT;
                                                            Match.getAthleteId(param, function (err, complete) {
                                                                if (err || _.isEmpty(complete)) {
                                                                    singleData["PARTICIPANT 1"] = null;
                                                                    err = "SFA ID may have wrong values";
                                                                    console.log("err found");
                                                                    callback(null, {
                                                                        error: err,
                                                                        success: singleData
                                                                    });
                                                                } else {
                                                                    singleData["PARTICIPANT 1"] = complete._id;
                                                                    callback(null, singleData);
                                                                }
                                                            });
                                                        }
                                                    }
                                                },
                                                function (singleData, callback) {
                                                    if (singleData.error) {
                                                        countError++;
                                                        finalData = singleData;
                                                        callback(null, singleData);
                                                    } else {
                                                        callback(null, {
                                                            error: null,
                                                            success: singleData
                                                        });
                                                    }
                                                }
                                            ],
                                            function (err, results) {
                                                if (err || _.isEmpty(results)) {
                                                    callback(err, null);
                                                } else {
                                                    callback(null, results);
                                                }
                                            });

                                    }, function (err, singleData) {
                                        console.log("for save", singleData);
                                        async.concatSeries(singleData, function (n, callback) {
                                            if (n.error) {
                                                countError++;
                                                callback(null, n);
                                            } else {
                                                var player = {};
                                                paramData.matchId = n.success["MATCH ID"];
                                                paramData.round = n.success["ROUND "];
                                                if (!_.isEmpty(n.success["PARTICIPANT 1"])) {
                                                    paramData.opponentsSingle.push(n.success["PARTICIPANT 1"]);
                                                    player.id = n.success["PARTICIPANT 1"];
                                                    player.time = n.success["TIMING"];
                                                    player.result = n.success["RESULT"];
                                                    player.laneNo = n.success["LANE NUMBER"];
                                                    result.players.push(player);
                                                }
                                                paramData.sport = n.success.SPORT;
                                                paramData.scheduleDate = moment(n.success.DATE).format();
                                                paramData.scheduleTime = n.success.TIME;
                                                paramData.resultHeat = result;
                                                callback(null, paramData);
                                            }
                                        }, function (err, n) {
                                            if (countError != 0) {
                                                countError++;
                                                callback(null, n);
                                            } else {
                                                Match.update({
                                                    matchId: paramData.matchId
                                                }, paramData).exec(
                                                    function (err, complete) {
                                                        if (err || _.isEmpty(complete)) {
                                                            callback(null, {
                                                                error: err,
                                                                success: paramData
                                                            });
                                                        } else {
                                                            callback(null, complete);
                                                        }
                                                    });
                                            }
                                        });
                                    });
                                },
                                function (err, singleData) {
                                    callback(null, singleData);
                                });
                        },
                        function (err, singleData) {
                            callback(null, singleData);
                        });
                }
            ],
            function (err, results) {
                if (err || _.isEmpty(results)) {
                    callback(err, results);
                } else {
                    callback(null, results);
                }
            });
    },

    updateQualifyingRoundIndividual: function (importData, data, callback) {
        var countError = 0;
        async.waterfall([
                function (callback) {
                    async.concatSeries(importData, function (singleData, callback) {
                        async.waterfall([
                                function (callback) {
                                    var date = moment(singleData.DATE, "DD-MM-YYYY");
                                    singleData.DATE = date;
                                    callback(null, singleData);
                                },
                                function (singleData, callback) {
                                    console.log("singleData", singleData);
                                    var paramData = {};
                                    paramData.name = singleData['EVENT'];
                                    paramData.age = singleData["AGE GROUP"];
                                    if (singleData.GENDER == "Boys" || singleData.GENDER == "Male" || singleData.GENDER == "male") {
                                        paramData.gender = "male";
                                    } else if (singleData.GENDER == "Girls" || singleData.GENDER == "Female" || singleData.GENDER == "female") {
                                        paramData.gender = "female";
                                    }
                                    Match.getSportId(paramData, function (err, sportData) {
                                        if (err || _.isEmpty(sportData)) {
                                            singleData.SPORT = null;
                                            err = "Sport,Event,AgeGroup,Gender may have wrong values";
                                            callback(null, {
                                                error: err,
                                                success: singleData
                                            });
                                        } else {
                                            singleData.SPORT = sportData.sportId;
                                            callback(null, singleData);
                                        }
                                    });
                                },
                                function (singleData, callback) {
                                    // console.log("logssss", singleData);
                                    if (singleData.error) {
                                        countError++;
                                        callback(null, singleData);
                                    } else {
                                        if (_.isEmpty(singleData["SFA ID"])) {
                                            callback(null, singleData);
                                        } else {
                                            // console.log("singleData1", singleData);
                                            var paramData = {};
                                            paramData.participant = singleData["SFA ID"];
                                            paramData.sport = singleData.SPORT;
                                            Match.getAthleteId(paramData, function (err, complete) {
                                                if (err || _.isEmpty(complete)) {
                                                    singleData["PARTICIPANT"] = null;
                                                    err = "SFA ID may have wrong values";
                                                    callback(null, {
                                                        error: err,
                                                        success: singleData
                                                    });
                                                } else {
                                                    singleData["PARTICIPANT"] = complete._id;
                                                    callback(null, singleData);
                                                }
                                            });
                                        }
                                    }
                                },
                                function (singleData, callback) {
                                    console.log("logssss", singleData);
                                    if (singleData.error) {
                                        countError++;
                                        callback(null, singleData);
                                    } else {
                                        var paramData = {};
                                        var resultData = {};
                                        var player = {};

                                        paramData.opponentsSingle = [];
                                        paramData.matchId = singleData["MATCH ID"];
                                        // paramData.round = "Qualifying Round";
                                        paramData.round = singleData["ROUND"];
                                        if (_.isEmpty(singleData["PARTICIPANT"])) {
                                            paramData.opponentsSingle = "";
                                        } else {
                                            paramData.opponentsSingle.push(singleData["PARTICIPANT"]);
                                            player.id = singleData["PARTICIPANT"];
                                        }
                                        player.attempt = [];
                                        if (singleData["ATTEMPT 1"]) {
                                            player.attempt.push(singleData["ATTEMPT 1"]);
                                        }
                                        if (singleData["ATTEMPT 2"]) {
                                            player.attempt.push(singleData["ATTEMPT 2"]);
                                        }
                                        if (singleData["ATTEMPT 3"]) {
                                            player.attempt.push(singleData["ATTEMPT 3"]);
                                        }

                                        if (singleData["RESULT"]) {
                                            if (singleData["RESULT"] == "noShow" || singleData["RESULT"] == "NOSHOW" || singleData["RESULT"] == "NoShow") {
                                                player.noShow = "true";
                                            } else {
                                                player.noShow = "false";
                                                player.result = singleData["RESULT"];
                                            }
                                        }
                                        resultData.player = player;
                                        paramData.resultQualifyingRound = resultData;
                                        paramData.sport = singleData.SPORT;
                                        paramData.scheduleDate = singleData.DATE;
                                        paramData.scheduleTime = singleData.TIME;
                                        Match.update({
                                            matchId: paramData.matchId
                                        }, paramData).exec(
                                            function (err, complete) {
                                                if (err || _.isEmpty(complete)) {
                                                    callback(null, {
                                                        error: err,
                                                        success: paramData
                                                    });
                                                } else {
                                                    callback(null, complete);
                                                }
                                            });
                                    }
                                }
                            ],
                            function (err, results) {
                                callback(null, results);
                            });
                    }, function (err, singleData) {
                        callback(null, singleData)
                    });
                },
                function (singleData, callback) {
                    async.concatSeries(singleData, function (n, callback) {
                            console.log("n", n);
                            if (countError != 0 && n.error == null) {
                                console.log("inside", n.success._id, "count", countError);
                                Match.remove({
                                    _id: n.success._id
                                }).exec(function (err, found) {
                                    if (err || _.isEmpty(found)) {
                                        callback(err, null);
                                    } else {
                                        callback(null, n);
                                    }
                                });
                            } else {
                                callback(null, n);
                            }
                        },
                        function (err, singleData) {
                            callback(null, singleData);
                        });
                }
            ],
            function (err, results) {
                if (err || _.isEmpty(results)) {
                    callback(err, null);
                } else {
                    callback(null, results);
                }
            });

    },

    UpdateHeatTeam: function (importData, callback) {
        {
            // importdata structure
            // [
            //     "heat":[
            //         "1":[
            //             {},
            //             {}
            //         ],
            //         "2":[
            //             {},
            //             {}
            //         ]
            //     ],
            //     "semi-final":[
            //         "1":[
            //             {},
            //             {}
            //         ],
            //         "2":[
            //             {},
            //             {}
            //         ]
            //     ],
            //     "final":[
            //         "1":[
            //             {},
            //             {}
            //         ],
            //         "2":[
            //             {},
            //             {}
            //         ]
            //     ],
            // ]
        }

        var countError = 0;
        var arrMathes = [];
        async.waterfall([
                function (callback) {

                    async.concatSeries(importData, function (mainData, callback) {
                            async.concatSeries(mainData, function (arrData, callback) {
                                    var paramData = {};
                                    paramData.opponentsTeam = [];
                                    var result = {};
                                    result.players = [];
                                    async.concatSeries(arrData, function (singleData, callback) {
                                        var date = moment(singleData.DATE, "DD-MM-YYYY");
                                        singleData.DATE = date;
                                        async.waterfall([
                                                // Find SportId
                                                function (callback) {
                                                    var paramData = {};
                                                    paramData.name = singleData.EVENT;
                                                    paramData.age = singleData["AGE GROUP"];
                                                    if (singleData.GENDER == "Boys" || singleData.GENDER == "Male" || singleData.GENDER == "male") {
                                                        paramData.gender = "male";
                                                    } else if (singleData.GENDER == "Girls" || singleData.GENDER == "Female" || singleData.GENDER == "female") {
                                                        paramData.gender = "female";
                                                    }
                                                    paramData.weight = undefined;
                                                    Match.getSportId(paramData, function (err, sportData) {
                                                        // console.log("sportData", sportData);
                                                        if (err || _.isEmpty(sportData)) {
                                                            singleData.SPORT = null;
                                                            err = "Sport,Event,AgeGroup,Gender may have wrong values";
                                                            callback(null, {
                                                                error: err,
                                                                success: singleData
                                                            });
                                                        } else {
                                                            singleData.SPORT = sportData.sportId;
                                                            callback(null, singleData);
                                                        }
                                                    });
                                                },
                                                //Find TeamId
                                                function (singleData, callback) {
                                                    if (singleData.error) {
                                                        countError++;
                                                        finalData = singleData;
                                                        callback(null, singleData);
                                                    } else {
                                                        if (_.isEmpty(singleData["TEAM ID"])) {
                                                            finalData.error = "TEAM ID is empty";
                                                            finalData.success = singleData;
                                                            callback(null, singleData);
                                                        } else {
                                                            var param = {};
                                                            param.team = singleData["TEAM ID"];
                                                            param.sport = singleData.SPORT;
                                                            Match.getTeamId(param, function (err, complete) {
                                                                if (err || _.isEmpty(complete)) {
                                                                    singleData["TEAM 1"] = null;
                                                                    err = "TEAM ID may have wrong values";
                                                                    console.log("err found");
                                                                    callback(null, {
                                                                        error: err,
                                                                        success: singleData
                                                                    });
                                                                } else {
                                                                    singleData["TEAM 1"] = complete._id;
                                                                    callback(null, singleData);
                                                                }
                                                            });

                                                        }
                                                    }
                                                },
                                                function (singleData, callback) {
                                                    if (singleData.error) {
                                                        countError++;
                                                        finalData = singleData;
                                                        callback(null, singleData);
                                                    } else {
                                                        callback(null, {
                                                            error: null,
                                                            success: singleData
                                                        });
                                                    }
                                                }
                                            ],
                                            function (err, results) {
                                                if (err || _.isEmpty(results)) {
                                                    callback(err, null);
                                                } else {
                                                    callback(null, results);
                                                }
                                            });

                                    }, function (err, singleData) {
                                        // console.log("for save", singleData);
                                        async.concatSeries(singleData, function (n, callback) {
                                            if (n.error) {
                                                countError++;
                                                callback(null, n);
                                            } else {
                                                var player = {};
                                                paramData.matchId = n.success["MATCH ID"];
                                                paramData.round = n.success["ROUND "];
                                                if (!_.isEmpty(n.success["TEAM 1"])) {
                                                    paramData.opponentsTeam.push(n.success["TEAM 1"]);
                                                    player.id = n.success["TEAM 1"];
                                                    player.time = n.success["TIMING"];
                                                    player.result = n.success["RESULT"];
                                                    player.laneNo = n.success["LANE NUMBER"];
                                                    result.players.push(player);
                                                }
                                                console.log(paramData.opponentsSingle);
                                                paramData.sport = n.success.SPORT;
                                                paramData.scheduleDate = moment(n.success.DATE).format();
                                                paramData.scheduleTime = n.success.TIME;
                                                paramData.resultHeat = result;
                                                callback(null, paramData);
                                            }
                                        }, function (err, n) {
                                            if (countError != 0) {
                                                countError++;
                                                callback(null, n);
                                            } else {
                                                console.log(paramData);
                                                Match.update({
                                                    matchId: paramData.matchId
                                                }, paramData).exec(
                                                    function (err, complete) {
                                                        if (err || _.isEmpty(complete)) {
                                                            callback(null, {
                                                                error: err,
                                                                success: paramData
                                                            });
                                                        } else {
                                                            callback(null, complete);
                                                        }
                                                    });
                                            }
                                        });
                                    });
                                },
                                function (err, singleData) {
                                    callback(null, singleData);
                                });
                        },
                        function (err, singleData) {
                            callback(null, singleData);
                        });
                }
            ],
            function (err, results) {
                if (err || _.isEmpty(results)) {
                    callback(err, results);
                } else {
                    callback(null, results);
                }
            });
    },

    updateQualifying: function (importData, data, callback) {
        var countError = 0;
        async.waterfall([
                function (callback) {
                    async.concatSeries(importData, function (singleData, callback) {
                        async.waterfall([
                                function (callback) {
                                    var date = moment(singleData.DATE, "DD-MM-YYYY");
                                    singleData.DATE = date;
                                    callback(null, singleData);
                                },
                                function (singleData, callback) {
                                    // console.log("singleData", singleData);
                                    var paramData = {};
                                    paramData.name = singleData['EVENT'];
                                    paramData.age = singleData["AGE GROUP"];
                                    if (singleData.GENDER == "Boys" || singleData.GENDER == "Male" || singleData.GENDER == "male") {
                                        paramData.gender = "male";
                                    } else if (singleData.GENDER == "Girls" || singleData.GENDER == "Female" || singleData.GENDER == "female") {
                                        paramData.gender = "female";
                                    }
                                    Match.getSportId(paramData, function (err, sportData) {
                                        if (err || _.isEmpty(sportData)) {
                                            singleData.SPORT = null;
                                            err = "Sport,Event,AgeGroup,Gender may have wrong values";
                                            callback(null, {
                                                error: err,
                                                success: singleData
                                            });
                                        } else {
                                            singleData.SPORT = sportData.sportId;
                                            callback(null, singleData);
                                        }
                                    });
                                },
                                function (singleData, callback) {
                                    // console.log("logssss", singleData);
                                    if (singleData.error) {
                                        countError++;
                                        callback(null, singleData);
                                    } else {
                                        if (_.isEmpty(singleData["SFA ID"])) {
                                            callback(null, singleData);
                                        } else {
                                            // console.log("singleData1", singleData);
                                            var paramData = {};
                                            paramData.participant = singleData["SFA ID"];
                                            paramData.sport = singleData.SPORT;
                                            Match.getAthleteId(paramData, function (err, complete) {
                                                if (err || _.isEmpty(complete)) {
                                                    singleData["PARTICIPANT 1"] = null;
                                                    err = "SFA ID may have wrong values";
                                                    callback(null, {
                                                        error: err,
                                                        success: singleData
                                                    });
                                                } else {
                                                    singleData["PARTICIPANT 1"] = complete._id;
                                                    callback(null, singleData);
                                                }
                                            });
                                        }
                                    }
                                },
                                function (singleData, callback) {
                                    console.log("logssss", singleData);
                                    if (singleData.error) {
                                        countError++;
                                        callback(null, singleData);
                                    } else {
                                        var paramData = {};
                                        var resultData = {};
                                        var player = {};

                                        paramData.opponentsSingle = [];
                                        paramData.matchId = singleData["MATCH ID"];
                                        // paramData.round = "Qualifying Round";
                                        paramData.round = singleData["ROUND"];
                                        if (_.isEmpty(singleData["PARTICIPANT 1"])) {
                                            paramData.opponentsSingle = "";
                                        } else {
                                            paramData.opponentsSingle.push(singleData["PARTICIPANT 1"]);
                                            player.id = singleData["PARTICIPANT 1"];
                                        }
                                        player.attempt = [];
                                        if (singleData["SCORE - ROUND 1"]) {
                                            player.attempt.push(singleData["SCORE - ROUND 1"]);
                                        }
                                        if (singleData["SCORE - ROUND 2"]) {
                                            player.attempt.push(singleData["SCORE - ROUND 2"]);
                                        }
                                        if (singleData["FINAL SCORE"]) {
                                            player.attempt.push(singleData["FINAL SCORE"]);
                                        }
                                        if (singleData["RANK"]) {
                                            player.rank.push(singleData["RANK"]);
                                        }
                                        if (singleData["Video"]) {
                                            player.video.push(singleData["Video"]);
                                        }
                                        if (singleData["MatchCenter"]) {
                                            player.matchCenter.push(singleData["MatchCenter"]);
                                        }

                                        if (singleData["RESULT"]) {
                                            if (singleData["RESULT"] == "noShow" || singleData["RESULT"] == "NOSHOW" || singleData["RESULT"] == "NoShow") {
                                                player.noShow = "true";
                                            } else {
                                                player.noShow = "false";
                                                player.result = singleData["RESULT"];
                                            }
                                        }
                                        resultData.player = player;
                                        paramData.resultQualifyingRound = resultData;
                                        paramData.sport = singleData.SPORT;
                                        paramData.scheduleDate = singleData.DATE;
                                        paramData.scheduleTime = singleData.TIME;
                                        Match.update({
                                            matchId: paramData.matchId
                                        }, paramData).exec(
                                            function (err, complete) {
                                                if (err || _.isEmpty(complete)) {
                                                    callback(null, {
                                                        error: err,
                                                        success: paramData
                                                    });
                                                } else {
                                                    callback(null, complete);
                                                }
                                            });
                                    }
                                }
                            ],
                            function (err, results) {
                                callback(null, results);
                            });
                    }, function (err, singleData) {
                        callback(null, singleData)
                    });
                },
                function (singleData, callback) {
                    async.concatSeries(singleData, function (n, callback) {
                            console.log("n", n);
                            if (countError != 0 && n.error == null) {
                                console.log("inside", n.success._id, "count", countError);
                                Match.remove({
                                    _id: n.success._id
                                }).exec(function (err, found) {
                                    if (err || _.isEmpty(found)) {
                                        callback(err, null);
                                    } else {
                                        callback(null, n);
                                    }
                                });
                            } else {
                                callback(null, n);
                            }
                        },
                        function (err, singleData) {
                            callback(null, singleData);
                        });
                }
            ],
            function (err, results) {
                if (err || _.isEmpty(results)) {
                    callback(err, null);
                } else {
                    callback(null, results);
                }
            });

    },

    updateQualifyingKnockout: function (importData, data, callback) {
        var result = {};
        result.players = [];
        var countError = 0;
        async.waterfall([
                function (callback) {
                    async.concatSeries(importData, function (singleData, callback) {
                        async.waterfall([
                                function (callback) {
                                    var date = moment(singleData.DATE, "DD-MM-YYYY");
                                    singleData.DATE = date;
                                    callback(null, singleData);
                                },
                                function (singleData, callback) {
                                    console.log("singleData", singleData);
                                    var paramData = {};
                                    paramData.name = singleData.EVENT;
                                    console.log("para,", paramData.name);
                                    paramData.age = singleData["AGE GROUP"];
                                    if (singleData.GENDER == "Boys" || singleData.GENDER == "Male" || singleData.GENDER == "male") {
                                        paramData.gender = "male";
                                    } else if (singleData.GENDER == "Girls" || singleData.GENDER == "Female" || singleData.GENDER == "female") {
                                        paramData.gender = "female";
                                    }
                                    paramData.weight = undefined;
                                    Match.getSportId(paramData, function (err, sportData) {
                                        if (err || _.isEmpty(sportData)) {
                                            singleData.SPORT = null;
                                            err = "Sport,Event,AgeGroup,Gender may have wrong values";
                                            callback(null, {
                                                error: err,
                                                success: singleData
                                            });
                                        } else {
                                            singleData.SPORT = sportData.sportId;
                                            callback(null, singleData);
                                        }
                                    });
                                },
                                function (singleData, callback) {
                                    // console.log("logssss", singleData);
                                    if (singleData.error) {
                                        countError++;
                                        callback(null, singleData);
                                    } else {
                                        if (_.isEmpty(singleData["SFAID 1"])) {
                                            callback(null, singleData);
                                        } else {
                                            var paramData = {};
                                            paramData.participant = singleData["SFAID 1"];
                                            paramData.sport = singleData.SPORT;
                                            Match.getAthleteId(paramData, function (err, complete) {
                                                if (err || _.isEmpty(complete)) {
                                                    singleData["PARTICIPANT 1"] = null;
                                                    err = "SFAID 1 may have wrong values";
                                                    callback(null, {
                                                        error: err,
                                                        success: singleData
                                                    });
                                                } else {
                                                    if (singleData["WINNER SFA ID "] == singleData.singleData["PARTICIPANT 2"]) {

                                                    }
                                                    singleData["PARTICIPANT 1"] = complete._id;
                                                    var info = {};
                                                    info.playerId = singleData["PARTICIPANT 1"];
                                                    info.noShow = false;
                                                    info.walkover = false;
                                                    result.player.push(info);
                                                    callback(null, singleData);
                                                }
                                            });
                                        }
                                    }


                                },
                                function (singleData, callback) {
                                    // console.log("logssss", singleData);
                                    if (singleData.error) {
                                        countError++;
                                        callback(null, singleData);
                                    } else {
                                        if (_.isEmpty(singleData["SFAID 2"])) {
                                            callback(null, singleData);
                                        } else {
                                            var paramData = {};
                                            paramData.participant = singleData["SFAID 2"];
                                            paramData.sport = singleData.SPORT;
                                            Match.getAthleteId(paramData, function (err, complete) {
                                                if (err || _.isEmpty(complete)) {
                                                    singleData["PARTICIPANT 2"] = null;
                                                    err = "SFAID 2 may have wrong values";
                                                    callback(err, null);
                                                } else {
                                                    singleData["PARTICIPANT 2"] = complete._id;
                                                    info.playerId = singleData["PARTICIPANT 2"];
                                                    info.noShow = false;
                                                    info.walkover = false;
                                                    result.player.push(info);
                                                    // singleData.
                                                    callback(null, singleData);
                                                }
                                            });
                                        }
                                    }

                                },
                                function (singleData, callback) {
                                    if (singleData.error) {
                                        countError++;
                                        callback(null, singleData);
                                    } else {
                                        if (_.isEmpty(singleData["FINAL SCORE "])) {
                                            callback(null, singleData);
                                        } else {
                                            result.finalScore = singleData["FINAL SCORE "];
                                            if (singleData["SHOOTOUT SCORE"]) {
                                                result.shootOutScore = singleData["SHOOTOUT SCORE"];
                                            }

                                            if (singleData["SFAID 1"] === singleData["WINNER SFA ID "]) {
                                                result.winner = {};
                                                result.winner.player = singleData["PARTICIPANT 2"];
                                            }

                                        }
                                    }
                                },
                                function (singleData, callback) {
                                    // console.log("logssss", singleData);
                                    if (singleData.error) {
                                        countError++;
                                        callback(null, singleData);
                                    } else {
                                        var paramData = {};
                                        paramData.opponentsSingle = [];
                                        paramData.matchId = data.matchId;
                                        paramData.round = singleData["ROUND NAME"];
                                        if (_.isEmpty(singleData["PARTICIPANT 1"]) && _.isEmpty(singleData["PARTICIPANT 2"])) {
                                            paramData.opponentsSingle = "";
                                        } else if (_.isEmpty(singleData["PARTICIPANT 1"])) {
                                            paramData.opponentsSingle.push(singleData["PARTICIPANT 2"]);
                                        } else if (_.isEmpty(singleData["PARTICIPANT 2"])) {
                                            paramData.opponentsSingle.push(singleData["PARTICIPANT 1"]);
                                        } else {
                                            paramData.opponentsSingle.push(singleData["PARTICIPANT 1"]);
                                            paramData.opponentsSingle.push(singleData["PARTICIPANT 2"]);
                                        }
                                        paramData.sport = singleData.SPORT;
                                        paramData.scheduleDate = singleData.DATE;
                                        paramData.scheduleTime = singleData.TIME;
                                        Match.saveMatch(paramData, function (err, complete) {
                                            if (err || _.isEmpty(complete)) {
                                                callback(err, null);
                                            } else {
                                                callback(null, complete);
                                            }
                                        });
                                    }
                                }
                            ],
                            function (err, results) {
                                callback(null, results);
                            });
                    }, function (err, singleData) {
                        callback(null, singleData)
                    });
                },
                function (singleData, callback) {
                    async.concatSeries(singleData, function (n, callback) {
                            console.log("n", n);
                            if (countError != 0 && n.error == null) {
                                console.log("inside", n.success._id, "count", countError);
                                Match.remove({
                                    _id: n.success._id
                                }).exec(function (err, found) {
                                    if (err || _.isEmpty(found)) {
                                        callback(err, null);
                                    } else {
                                        callback(null, n);
                                    }
                                });
                            } else {
                                callback(null, n);
                            }
                        },
                        function (err, singleData) {
                            callback(null, singleData);
                        });
                }
            ],
            function (err, results) {
                if (err || _.isEmpty(results)) {
                    callback(err, null);
                } else {
                    callback(null, results);
                }
            });

    }


};
module.exports = _.assign(module.exports, exports, model);