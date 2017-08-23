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
    scheduleDate: Date,
    scheduleTime: String,
    video: String,
    matchCenter: String,
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
                        finalData.players = [];
                        finalData.sportsName = found.sport.sportslist.name;
                        finalData.age = found.sport.ageGroup.name;
                        finalData.gender = found.sport.gender;
                        finalData.sportType = found.sport.sportslist.sportsListSubCategory.sportsListCategory.name;
                        if (found.opponentsSingle) {
                            _.each(found.opponentsSingle, function (n) {
                                finalData.players.push(n.athleteId);
                            });
                        } else {
                            _.each(found.opponentsSingle.studentTeam, function (n) {
                                finalData.players.push(n.studentId);
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
        console.log("data", data);
        var sport = {};
        async.waterfall([
                function (callback) {
                    SportsList.findOne({
                        name: data.name
                    }).lean().deepPopulate("sportsListSubCategory").exec(function (err, found) {
                        console.log(found, "found");
                        if (err || _.isEmpty(found)) {
                            sport.sportslist = found._id;
                            callback(null, sport);
                        } else {
                            sport.sportslist = found._id;
                            sport.sportsListSubCategory = found.sportsListSubCategory._id;
                            console.log("sport", sport);
                            callback(null, sport);
                        }
                    });
                },
                function (sport, callback) {
                    AgeGroup.findOne({
                        name: data.age
                    }).lean().exec(function (err, found) {
                        if (err || _.isEmpty(found)) {
                            callback(err, null);
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
                                callback(err, null);
                            } else {
                                sport.weight = found._id;
                                callback(null, sport);
                            }
                        });
                    }
                },
                function (sport, callback) {
                    console.log("allsport", sport);
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
                            callback(err, {
                                error: "No Sport found!",
                                success: data
                            });
                        } else {
                            sport.sportId = found._id;
                            callback(null, sport);
                        }
                    });
                }

            ],
            function (err, results) {
                if (err || _.isEmpty(results)) {
                    callback(results, null);
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
                        callback(null, found);
                    } else {
                        console.log("found1", found, "data", data);
                        IndividualSport.findOne({
                            sport: data.sport,
                            athleteId: found._id
                        }).lean().exec(function (err, athleteData) {
                            if (err || _.isEmpty(athleteData)) {
                                callback(err, {
                                    error: "No Athelete found!",
                                    success: data
                                });
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
                            callback(err, null);
                        } else {
                            callback(null, found);
                        }
                    });
                }
            ],
            function (err, results) {
                console.log("results", results);
                if (err || _.isEmpty(results)) {
                    callback(results, null);
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
                        callback(err, null);
                    }
                });
            },
            function (sportslist, callback) {
                console.log("Finding sportId");
                Sport.findOne(matchObj).exec(function (err, sportDetails) {
                    if (err) {
                        callback(err, null);
                    } else if (sportDetails) {
                        if (_.isEmpty(sportDetails)) {
                            callback(null, []);
                        } else {
                            sendObj.sport = sportDetails._id;
                            callback(null, sendObj);
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

    getSportSpecificRounds: function (data, callback) {
        // console.log("data", data);

        Match.aggregate(
            [
                // Stage 1
                {
                    $match: {
                        "sport": ObjectId(data.sport)
                    }
                },

                // Stage 2
                {
                    $group: {
                        "_id": "$round",
                        "matches": {
                            $push: "$$ROOT"
                        }
                    }
                },
                // Stage 3
                {
                    $sort: {
                        "matches.createdAt": 1
                    }
                },

            ],
            function (err, matches) {
                console.log("matches : ", matches);
                if (err) {
                    console.log(err);
                    callback(err, null);
                } else {
                    if (_.isEmpty(matches)) {
                        callback(null, []);
                    } else {
                        var sendObj = {};
                        sendObj.roundsListName = _.map(matches, '_id');
                        sendObj.roundsList = matches;
                        if (data.round) {
                            var index = _.findIndex(matches, function (n) {
                                return n._id == data.round
                            });

                            if (index != -1) {
                                sendObj.roundsList = _.slice(matches, index, index + 3);
                                callback(null, sendObj);
                            } else {
                                callback(null, sendObj);
                            }

                        } else {
                            callback(null, sendObj);
                        }
                    }
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
                                    // paramData.name = singleData["EVENT "];
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

    saveHeatIndividual: function (importData, data, callback) {
        var countError = 0;
        var arrMathes = [];
        async.waterfall([
                function (callback) {
                    async.concatSeries(importData, function (mainData, callback) {
                        async.concatSeries(mainData, function (arrData, callback) {
                            var paramData = {};
                            paramData.opponentsSingle = [];
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
                                        callback(null, paramData)
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
                                    var match = singleData["MATCH ID"];
                                    paramData.matchId = match;
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

            }
        ], function (err, results) {
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
                } else if (mainData.sport.gender == "Female") {
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
                        if (mainData.opponentsSingle[0].athleteId._id.equals(mainData.resultsCombat.winnner[0].player)) {
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

                        if (mainData.opponentsSingle[1].athleteId._id === mainData.resultsCombat.winnner[0].player) {
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

    generateExcelKnockoutTeam: function (match, callback) {
        async.concatSeries(match, function (mainData, callback) {
                var obj = {};
                // console.log(JSON.stringify(mainData, null, "    "));
                obj["MATCH ID"] = mainData.matchId;
                obj["ROUND NAME"] = mainData.round;
                obj.SPORT = mainData.sport.sportslist.sportsListSubCategory.name;
                if (mainData.sport.gender == "male") {
                    obj.GENDER = "Male";
                } else if (mainData.sport.gender == "Female") {
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
                var laneNo = 1;
                async.concatSeries(matchData.opponentsSingle, function (mainData, callback) {
                        var obj = {};
                        obj["MATCH ID"] = matchData.matchId;
                        var dateTime = moment(matchData.scheduleDate).format('DD/MM/YYYY');
                        obj.DATE = dateTime;
                        obj.TIME = matchData.scheduleTime;
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
                            obj["SFA ID"] = mainData.athleteId.sfaId;
                            if (mainData.athleteId.middleName) {
                                obj["NAME"] = mainData.athleteId.firstName + " " + mainData.athleteId.middleName + " " + mainData.athleteId.surname;
                            } else {
                                obj["NAME"] = mainData.athleteId.firstName + " " + mainData.athleteId.surname;
                            }
                            obj["SCHOOL"] = mainData.athleteId.school.name;

                        } else {
                            obj["SFAID 1"] = "";
                            obj["PARTICIPANT 1"] = "";
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

    //  ----------------------------  UPDATE SCORE RESULT  --------------------------------------

    //update from digital score
    updateResult: function (data, callback) {
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
                                        // var date = Math.round((singleData.DATE - 25569) * 86400 * 1000);
                                        // console.log('date', date, "singleData", singleData);
                                        // date = new Date(date);
                                        // singleData.DATE = date.toISOString();
                                        async.waterfall([
                                                function (callback) {
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
                                                var player = {};
                                                paramData.matchId = n.success["MATCH ID"];
                                                paramData.round = n.success["ROUND "];
                                                if (!_.isEmpty(n.success["PARTICIPANT 1"])) {
                                                    paramData.opponentsSingle.push(n.success["PARTICIPANT 1"]);
                                                    player.id = n.success["PARTICIPANT 1"];
                                                    player.time = n.success["TIMING"];
                                                    player.result = n.success["RESULT"];
                                                    result.players.push(player);
                                                }
                                                paramData.sport = n.success.SPORT;
                                                paramData.scheduleDate = moment(n.success.DATE).format();
                                                paramData.scheduleTime = n.success.TIME;
                                                paramData.resultHeat = result;
                                                callback(null, paramData);
                                            }
                                        }, function (err) {
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
                    callback(err, null);
                } else {
                    callback(null, results);
                }
            });
    },

};
module.exports = _.assign(module.exports, exports, model);