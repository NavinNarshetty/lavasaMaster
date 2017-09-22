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
    resultBasketball: Schema.Types.Mixed,
    resultVolleyball: Schema.Types.Mixed,
    resultHandball: Schema.Types.Mixed,
    resultWaterPolo: Schema.Types.Mixed,
    resultKabaddi: Schema.Types.Mixed,
    resultFootball: Schema.Types.Mixed,
    resultQualifyingRound: Schema.Types.Mixed,
    resultKnockout: Schema.Types.Mixed,
    resultShooting: Schema.Types.Mixed,
    resultSwiss: Schema.Types.Mixed,
    scheduleDate: Date,
    scheduleTime: String,
    video: String,
    matchCenter: String,
    excelType: String,
    heatNo: String,
});

schema.plugin(deepPopulate, {
    populate: {
        "sport": {
            select: '_id sportslist gender ageGroup maxTeamPlayers minTeamPlayers weight'
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
        // "resultsRacquet.team": {
        //     select: ''
        // },
        // "resultHeat.team": {
        //     select: ''
        // },
        // "resultHockey.team": {
        //     select: ''
        // },
        // "resultBasketball.team": {
        //     select: ''
        // },
        // "resultVolleyball.team": {
        //     select: ''
        // },
        // "resultHandball.team": {
        //     select: ''
        // },
        // "resultWaterPolo.team": {
        //     select: ''
        // },
        // "resultKabaddi.team": {
        //     select: ''
        // },
        // "resultFootball.team": {
        //     select: ''
        // },
        // "resultKnockout": {
        //     select: ''
        // },
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
                var deepSearch = "sport.sportslist.drawFormat, sport.sportslist.sportsListSubCategory.sportsListCategory sport.ageGroup opponentsSingle.athleteId.school opponentsTeam";
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
                        if (found.excelType) {
                            finalData.stage = found.excelType;
                        }
                        finalData.minTeamPlayers = found.sport.minTeamPlayers;
                        finalData.maxTeamPlayers = found.sport.maxTeamPlayers;
                        finalData.scheduleDate = found.scheduleDate;
                        finalData.scheduleTime = found.scheduleTime;
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
                        if (_.isEmpty(found.resultVolleyball)) {
                            finalData.resultVolleyball = "";
                        } else {
                            finalData.resultVolleyball = found.resultVolleyball;
                        }
                        if (_.isEmpty(found.resultHockey)) {
                            finalData.resultHockey = "";
                        } else {
                            finalData.resultHockey = found.resultHockey;
                        }
                        if (_.isEmpty(found.resultBasketball)) {
                            finalData.resultBasketball = "";
                        } else {
                            finalData.resultBasketball = found.resultBasketball;
                        }
                        if (_.isEmpty(found.resultFootball)) {
                            finalData.resultFootball = "";
                        } else {
                            finalData.resultFootball = found.resultFootball;
                        }
                        if (_.isEmpty(found.resultHandball)) {
                            finalData.resultHandball = "";
                        } else {
                            finalData.resultHandball = found.resultHandball;
                        }
                        if (_.isEmpty(found.resultKabaddi)) {
                            finalData.resultKabaddi = "";
                        } else {
                            finalData.resultKabaddi = found.resultKabaddi;
                        }
                         if (_.isEmpty(found.resultWaterPolo)) {
                            finalData.resultWaterPolo = "";
                        } else {
                            finalData.resultWaterPolo = found.resultWaterPolo;
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

    getOneBackend: function (data, callback) {
        var deepSearch = "sport.sportslist.sportsListSubCategory.sportsListCategory sport.sportslist.drawFormat sport.ageGroup sport.weight opponentsSingle.athleteId.school opponentsTeam.studentTeam.studentId";
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
                }).deepPopulate("drawFormat sportsListSubCategory sportsListSubCategory.sportsListCategory").exec(function (err, sportslist) {
                    if (err) {
                        callback(err, null);
                    } else if (!_.isEmpty(sportslist)) {
                        sendObj.drawFormat = sportslist.drawFormat.name;
                        sendObj.isTeam = sportslist.sportsListSubCategory.isTeam;
                        sendObj.sportType = sportslist.sportsListSubCategory.sportsListCategory.name;
                        callback(null, sportslist);
                    } else {
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
                        callback(null, "No Data Found");
                    }

                });
            },
            function(sendObj, callback){
                console.log(sendObj, "----------------------sendObj---------------");
                Match.findOne({"sport":sendObj.sport}).exec(function(err,data){
                    console.log(data,"---------------matchFound-------------------");
                    if (err) {
                        callback(err, null);
                    } else if (!_.isEmpty(data)) {
                        sendObj.matchFound = true;
                        callback(null, sendObj);
                    } else {
                        sendObj.matchFound = false;
                        callback(null, sendObj);
                    }
                });
            }
        ], function (err, result) {
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
                }).lean().deepPopulate(deepSearch).sort({
                    createdAt: 1
                }).exec(function (err, found) {
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

    getSportQualifyingKnockoutRounds: function (data, callback) {
        var finalData = {};
        var matchData1 = [];
        var matchData2 = [];
        async.waterfall([
            function (callback) {
                var deepSearch = "sport.sportslist.sportsListSubCategory.sportsListCategory sport.ageGroup sport.weight opponentsSingle.athleteId.school opponentsTeam.studentTeam.studentId";
                Match.find({
                    sport: data.sport,
                    excelType: "qualifying"
                }).lean().deepPopulate(deepSearch).sort({
                    createdAt: 1
                }).exec(function (err, found) {
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
                    matchData1.push(match);
                    i++;
                }
                var sendObj = {};
                sendObj.roundsListName = _.keys(matches);
                sendObj.roundsList = matchData1;
                console.log("sendObj", sendObj);
                if (data.round) {
                    var index = _.findIndex(matchData1, function (n) {
                        return n.name == data.round
                    });

                    if (index != -1) {
                        sendObj.roundsList = _.slice(matchData1, index, index + 3);
                        callback(null, sendObj);
                    } else {
                        callback(null, sendObj);
                    }

                } else {
                    callback(null, sendObj);
                }
            },
            function (sendObj, callback) {
                var deepSearch = "sport.sportslist.sportsListSubCategory.sportsListCategory sport.ageGroup sport.weight opponentsSingle.athleteId.school opponentsTeam.studentTeam.studentId";
                Match.find({
                    sport: data.sport,
                    excelType: "knockout"
                }).lean().deepPopulate(deepSearch).sort({
                    createdAt: 1
                }).exec(function (err, found) {
                    if (err) {
                        callback(err, null);
                    } else {
                        if (_.isEmpty(found)) {
                            callback(null, []);
                        } else {
                            finalData.qualifying = sendObj;
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
                    matchData2.push(match);
                    i++;
                }
                var sendObj = {};
                sendObj.roundsListName = _.keys(matches);
                sendObj.roundsList = matchData2;
                console.log("sendObj", sendObj);
                if (data.round) {
                    var index = _.findIndex(matchData2, function (n) {
                        return n.name == data.round
                    });

                    if (index != -1) {
                        sendObj.roundsList = _.slice(matchData2, index, index + 3);
                        finalData.knockout = sendObj;
                        callback(null, finalData);
                    } else {
                        finalData.knockout = sendObj;
                        callback(null, finalData);
                    }

                } else {
                    finalData.knockout = sendObj;
                    callback(null, finalData);
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

    getSportLeagueKnockoutRounds: function (data, callback) {
        var finalData = {};
        var matchData1 = [];
        var matchData2 = [];
        async.waterfall([
            function (callback) {
                var deepSearch = "opponentsTeam.studentTeam.studentId";
                Match.find({
                    sport: data.sport,
                    excelType: {
                        $regex: "league",
                        $options: "i"
                    }
                }).lean().deepPopulate(deepSearch).sort({
                    createdAt: 1
                }).exec(function (err, found) {
                    // console.log("found",found);
                    if (err) {
                        callback(err, null);
                    } else {
                        if (_.isEmpty(found)) {
                            callback(null, []);
                        } else {
                            var matches = _.groupBy(found, 'round');
                            console.log("matches", matches);
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
                    matchData1.push(match);
                    i++;
                }
                var sendObj = {};
                sendObj.roundsListName = _.keys(matches);
                sendObj.roundsList = matchData1;
                console.log("sendObj", sendObj);
                if (data.round) {
                    var index = _.findIndex(matchData1, function (n) {
                        return n.name == data.round
                    });

                    if (index != -1) {
                        sendObj.roundsList = _.slice(matchData1, index, index + 3);
                        callback(null, sendObj);
                    } else {
                        callback(null, sendObj);
                    }

                } else {
                    callback(null, sendObj);
                }
            },
            function (sendObj, callback) {
                // var deepSearch = "sport.sportslist.sportsListSubCategory.sportsListCategory sport.ageGroup sport.weight opponentsSingle.athleteId.school opponentsTeam.studentTeam.studentId";
                var deepSearch = "opponentsTeam.studentTeam.studentId";
                Match.find({
                    sport: data.sport,
                    excelType: {
                        $regex: "knockout",
                        $options: "i"
                    }
                }).lean().deepPopulate(deepSearch).sort({
                    createdAt: 1
                }).exec(function (err, found) {
                    console.log("found", found);
                    if (err) {
                        callback(err, null);
                    } else {
                        if (_.isEmpty(found)) {
                            callback(null, []);
                        } else {
                            finalData.qualifying = sendObj;
                            var matches = _.groupBy(found, 'round');
                            console.log("matches", matches);
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
                    matchData2.push(match);
                    i++;
                }
                var sendObj = {};
                sendObj.roundsListName = _.keys(matches);
                sendObj.roundsList = matchData2;
                if (data.round) {
                    var index = _.findIndex(matchData2, function (n) {
                        return n.name == data.round
                    });

                    if (index != -1) {
                        sendObj.roundsList = _.slice(matchData2, index, index + 3);
                        finalData.knockout = sendObj;
                        console.log("finalData", finalData);
                        callback(null, finalData);
                    } else {
                        finalData.knockout = sendObj;
                        console.log("finalData", finalData);
                        callback(null, finalData);
                    }

                } else {
                    finalData.knockout = sendObj;
                    callback(null, finalData);
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

    getStandings: function (data, callback) {
        var deepSearch = "opponentsTeam";
        var standings = [];
        var teams = [];
        var tablePoint = [];
        var final = {};
        async.waterfall([
                function (callback) {
                    Match.find({
                        sport: data.sport,
                        excelType: {
                            $regex: "league",
                            $options: "i"
                        }
                    }).lean().deepPopulate(deepSearch).sort({
                        createdAt: 1
                    }).exec(function (err, found) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(found)) {
                                callback(null, []);
                            } else {
                                var matchesPerPool = _.groupBy(found, 'round');
                                callback(null, matchesPerPool);
                            }
                        }
                    });
                },
                function (matchesPerPool, callback) {
                    var arr = _.keys(matchesPerPool);
                    var i = 0;
                    while (i < arr.length) {
                        var match = {};
                        var name = arr[i];
                        match.name = arr[i];

                        var n = matchesPerPool[name].length;
                        // console.log("n", n, "matchName", matchesPerPool[name]);
                        _.each(matchesPerPool[name], function (match) {
                            // console.log("match", match);
                            var team = {};
                            var team1 = {};
                            if (match.opponentsTeam[0]) {
                                team = match.opponentsTeam[0];
                                // console.log("team7777", team);
                                teams.push(team);

                                // console.log("teams1", teams);
                            }
                            if (match.opponentsTeam[1]) {
                                team1 = match.opponentsTeam[1];
                                // console.log("team2222", team1);
                                teams.push(team1);
                                // console.log("Teams2", teams);
                            }
                        });
                        // console.log("teams****", teams);
                        var t = _.uniq(teams, function (x) {
                            return x;
                        });
                        // console.log("unique", t);
                        match.teams = t;
                        teams = [];
                        // match.match = matchesPerPool[name];
                        standings.push(match);
                        i++;
                    }
                    callback(null, standings);
                },
                function (standings, callback) {
                    console.log("unique", standings);
                    async.eachSeries(standings, function (n, callback) {
                        // console.log("*****", n);
                        Match.getPointsPerPool(n, data, function (err, complete) {
                            if (err || _.isEmpty(complete)) {
                                callback(err, null);
                            } else {
                                var dummy = {};
                                dummy.name = n.name;
                                dummy.points = complete;
                                tablePoint.push(dummy);
                                callback(null, tablePoint);
                            }
                        });
                    }, function (err) {
                        final.tablePoint = tablePoint;
                        callback(null, final);
                    });
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

    getPointsPerPool: function (standings, data, callback) {
        async.concatSeries(standings.teams, function (team, callback) {
            async.waterfall([
                    function (callback) {
                        var teamData = {};
                        teamData.teamId = team.teamId;
                        teamData.schoolName = team.schoolName;
                        teamData._id = team._id;
                        var teamid = team._id.toString();
                        Match.find({
                            sport: data.sport,
                            excelType: {
                                $regex: "league",
                                $options: "i"
                            },
                            "resultFootball.teams.team": teamid,
                            round: standings.name
                        }).lean().deepPopulate("opponentsTeam").sort({
                            createdAt: 1
                        }).exec(function (err, found) {
                            if (err) {
                                callback(err, null);
                            } else {
                                if (_.isEmpty(found)) {
                                    teamData.matches = found;
                                    callback(null, teamData);
                                } else {
                                    teamData.matches = found;
                                    callback(null, teamData);
                                }
                            }
                        });
                    },
                    function (teamData, callback) {
                        var scores = {};
                        scores._id = teamData._id;
                        scores.teamid = teamData.teamId;
                        scores.schoolName = teamData.schoolName;
                        scores.win = 0;
                        scores.draw = 0;
                        scores.points = 0;
                        scores.loss = 0;
                        scores.matchCount = 0;
                        scores.noShow = 0;

                        _.each(teamData.matches, function (match) {
                            scores.matchCount = teamData.matches.length;
                            if (match.resultFootball.teams.length == 2) {
                                if (teamData._id == match.resultFootball.teams[0].team && match.resultFootball.teams[0].noShow == true) {
                                    scores.noShow = ++scores.noShow;
                                } else if (teamData._id == match.resultFootball.teams[1].team && match.resultFootball.teams[1].noShow == true) {
                                    scores.noShow = ++scores.noShow;
                                }
                            } else {
                                if (teamData._id == match.resultFootball.teams[0].team && match.resultFootball.teams[0].noShow == true) {
                                    scores.noShow = ++scores.noShow;
                                }
                            }
                            if (teamData._id == match.resultFootball.winner.player) {
                                scores.win = ++scores.win;
                                scores.points = scores.points + 3;
                            } else if (_.isEmpty(match.resultFootball.winner.player) && match.resultFootball.isDraw == true) {
                                scores.draw = ++scores.draw;
                                scores.points = scores.points + 1;
                            } else {
                                scores.loss = ++scores.loss;
                            }
                        });
                        // scores.teamData = teamData;
                        callback(null, scores);
                    },
                ],
                function (err, results) {
                    if (err || _.isEmpty(results)) {
                        callback(null, results);
                    } else {
                        callback(null, results);
                    }
                });
        }, function (err, result) {
            callback(null, result);
        });

    },

    //-----------------------------SAVE Excel ---------------------------------------------

    saveKnockoutIndividual: function (importData, data, callback) {
        // console.log("import", importData);
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
                                    // console.log("singleData", singleData);
                                    var paramData = {};
                                    paramData.name = singleData.EVENT;
                                    console.log("para,", paramData.name);
                                    paramData.age = singleData["AGE GROUP"];
                                    if (singleData.GENDER == "Boys" || singleData.GENDER == "Male" || singleData.GENDER == "male") {
                                        paramData.gender = "male";
                                    } else if (singleData.GENDER == "Girls" || singleData.GENDER == "Female" || singleData.GENDER == "female") {
                                        paramData.gender = "female";
                                    }
                                    var weight = singleData["WEIGHT CATEGORIES"];
                                    paramData.weight = _.trimStart(weight, " ");
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
                                    console.log("logssss", singleData);
                                    if (singleData.error) {
                                        countError++;
                                        callback(null, singleData);
                                    } else {
                                        if (_.isEmpty(singleData["SFAID 1"])) {
                                            singleData["PARTICIPANT 1"] = null;
                                            callback(null, singleData);
                                        } else {
                                            // console.log("singleData1", singleData);
                                            var paramData = {};
                                            paramData.participant = singleData["SFAID 1"];
                                            paramData.sport = singleData.SPORT;
                                            Match.getAthleteId(paramData, function (err, complete) {
                                                if (err || _.isEmpty(complete)) {
                                                    singleData["PARTICIPANT 1"] = "";
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
                                    console.log("logssss***", singleData);
                                    if (singleData.error) {
                                        countError++;
                                        callback(null, singleData);
                                    } else {
                                        if (_.isEmpty(singleData["SFAID 2"])) {
                                            singleData["PARTICIPANT 2"] = "";
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
                                    console.log("logssss", singleData);
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
                    console.log("singleData", singleData);
                    if (singleData.error) {
                        callback(null, singleData);
                    } else {
                        data.isLeagueKnockout = false;
                        data.sport = singleData[0].success.sport;
                        Match.addPreviousMatch(data, function (err, sportData) {
                            callback(null, singleData);
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
    },

    saveHeatIndividual: function (importData, data, callback) {
        var countError = 0;
        var arrMathes = [];
        async.waterfall([
                function (callback) {
                    async.concatSeries(importData, function (mainData, callback) {
                        async.concatSeries(mainData, function (arrData, callback) {
                            // var finalData = {};
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
                                            paramData.name = singleData["EVENT"];
                                            paramData.age = singleData["AGE GROUP"];
                                            if (singleData.GENDER == "Boys" || singleData.GENDER == "Male" || singleData.GENDER == "male") {
                                                paramData.gender = "male";
                                            } else if (singleData.GENDER == "Girls" || singleData.GENDER == "Female" || singleData.GENDER == "female") {
                                                paramData.gender = "female";
                                            }
                                            paramData.weight = undefined;
                                            console.log("paramData", paramData);
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
                                                if (_.isEmpty(singleData["SFA ID"])) {
                                                    callback(null, singleData);
                                                } else {
                                                    var param = {};
                                                    param.participant = singleData["SFA ID"];
                                                    param.sport = singleData.SPORT;
                                                    Match.getAthleteId(param, function (err, complete) {
                                                        if (err || _.isEmpty(complete)) {
                                                            singleData["NAME"] = null;
                                                            err = "SFA ID may have wrong values";
                                                            // console.log("err found");
                                                            callback(null, {
                                                                error: err,
                                                                success: singleData
                                                            });
                                                        } else {
                                                            singleData["NAME"] = complete._id;
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
                                        paramData.round = n.success["ROUND"];
                                        if (!_.isEmpty(n.success["NAME"])) {
                                            paramData.opponentsSingle.push(n.success["NAME"]);
                                        }
                                        paramData.sport = n.success.SPORT;
                                        paramData.scheduleDate = n.success.DATE;
                                        paramData.scheduleTime = n.success.TIME;
                                        var player = {};
                                        player.id = n.success["NAME"];
                                        player.laneNo = n.success["LANE NUMBER"];
                                        result.players.push(player);
                                        paramData.heatNo = n.success["HEAT NUMBER"]
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
                                            paramData.name = singleData["EVENT"];
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
                                                callback(null, singleData);
                                            } else {
                                                if (_.isEmpty(singleData["TEAM ID"])) {

                                                    callback(null, singleData);
                                                } else {
                                                    var param = {};
                                                    param.team = singleData["TEAM ID"];
                                                    param.sport = singleData.SPORT;
                                                    console.log(param);
                                                    Match.getTeamId(param, function (err, complete) {
                                                        if (err || _.isEmpty(complete)) {
                                                            singleData["NAME"] = null;
                                                            err = "TEAM ID may have wrong values";
                                                            console.log("err found");
                                                            callback(null, {
                                                                error: err,
                                                                success: singleData
                                                            });
                                                        } else {
                                                            singleData["NAME"] = complete._id;
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
                                        paramData.round = n.success["ROUND"];
                                        if (!_.isEmpty(n.success["NAME"])) {
                                            paramData.opponentsTeam.push(n.success["NAME"]);
                                        }
                                        paramData.sport = n.success.SPORT;
                                        paramData.scheduleDate = n.success.DATE;
                                        paramData.scheduleTime = n.success.TIME;
                                        paramData.heatNo = n.success["HEAT NUMBER"];
                                        var team = {};
                                        team.id = n.success["NAME"];
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
                                    paramData.name = singleData['EVENT'];
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
                                        callback(null, singleData);
                                    } else {
                                        if (_.isEmpty(singleData["SFA ID"])) {
                                            callback(null, singleData);
                                        } else {
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
                                        paramData.round = singleData["ROUND"];
                                        if (_.isEmpty(singleData["PARTICIPANT 1"])) {
                                            paramData.opponentsSingle = "";
                                        } else {
                                            paramData.opponentsSingle.push(singleData["PARTICIPANT 1"]);
                                        }
                                        paramData.sport = singleData.SPORT;
                                        paramData.scheduleDate = singleData.DATE;
                                        paramData.scheduleTime = singleData.TIME;
                                        if (data.resultType == "direct-final") {
                                            var result = {};
                                            result.laneNo = singleData["LANE NUMBER"];
                                            paramData.resultShooting = result;
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
                                var weight = singleData["WEIGHT CATEGORIES"];
                                paramData.weight = _.trimStart(weight, " ");
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
                                        console.log("sport", singleData.SPORT);
                                        callback(null, singleData);
                                    }
                                });
                            },
                            function (singleData, callback) {
                                if (singleData.error) {
                                    countError++;
                                    callback(null, singleData);
                                } else {
                                    if (_.isEmpty(singleData["TEAM 1"])) {
                                        callback(null, singleData);
                                    } else {
                                        // console.log("singleData1", singleData);
                                        var paramData = {};
                                        paramData.team = singleData["TEAM 1"];
                                        paramData.sport = singleData.SPORT;
                                        Match.getTeamId(paramData, function (err, complete) {
                                            if (err || _.isEmpty(complete)) {
                                                singleData["PARTICIPANT 1"] = "";
                                                err = "PARTICIPANT 1 may have wrong values";
                                                callback(null, {
                                                    error: err,
                                                    success: singleData
                                                });
                                            } else {
                                                // console.log("complete", complete);
                                                singleData["PARTICIPANT 1"] = complete._id;
                                                // console.log("team1", singleData["PARTICIPANT 1"]);
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
                                    if (_.isEmpty(singleData["TEAM 2"])) {
                                        console.log("inside sfa");
                                        callback(null, singleData);
                                    } else {
                                        var paramData = {};
                                        paramData.team = singleData["TEAM 2"];
                                        paramData.sport = singleData.SPORT;
                                        Match.getTeamId(paramData, function (err, complete) {
                                            if (err || _.isEmpty(complete)) {
                                                singleData["PARTICIPANT 2"] = "";
                                                err = "TEAMID 2 may have wrong values";
                                                callback(err, null);
                                            } else {
                                                singleData["PARTICIPANT 2"] = complete._id;
                                                // console.log("team2", singleData["PARTICIPANT 2"]);
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
                                    if (_.isEmpty(singleData["PARTICIPANT 1"]) && _.isEmpty(singleData["PARTICIPANT 2"])) {
                                        paramData.opponentsTeam = "";
                                    } else if (_.isEmpty(singleData["PARTICIPANT 1"])) {
                                        paramData.opponentsTeam.push(singleData["PARTICIPANT 2"]);
                                    } else if (_.isEmpty(singleData["PARTICIPANT 2"])) {
                                        paramData.opponentsTeam.push(singleData["PARTICIPANT 1"]);
                                    } else {
                                        paramData.opponentsTeam.push(singleData["PARTICIPANT 1"]);
                                        paramData.opponentsTeam.push(singleData["PARTICIPANT 2"]);
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
                console.log("*********", singleData);
                async.concatSeries(singleData, function (n, callback) {
                        // console.log("n", n);
                        if (countError != 0 && n.error == null) {
                            // console.log("inside", n._id, "count", countError);
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
                // console.log("singleData", singleData);
                if (singleData.error) {
                    callback(null, singleData);
                } else {
                    data.sport = singleData[0].success.sport;
                    Match.addPreviousMatch(data, function (err, sportData) {
                        callback(null, singleData);
                    });
                }
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
        var thirdPlaceCount = 0;
        async.waterfall([
                function (callback) {
                    if (data.isLeagueKnockout == false) {
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
                    } else {
                        Match.find({
                            sport: data.sport,
                            excelType: {
                                $regex: "knockout",
                                $options: "i"
                            }
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
                    }
                },
                function (found, callback) {
                    if (data.thirdPlace == 'yes') {
                        thirdPlaceCount = 0;
                    } else {
                        thirdPlaceCount = 1;
                    }

                    final.matchData = found;
                    async.eachSeries(found, function (singleData, callback) {
                        if (thirdPlaceCount == 0) {
                            if (count < 2) {
                                match.prev.push(singleData._id);
                                count++;
                            }
                            if (count == 2) {
                                final.finalPrevious.push(match.prev);
                                match.prev = [];
                                count = 0;
                            }
                        } else {
                            thirdPlaceCount = 0;
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
                            round: {
                                $regex: "final",
                                $options: "i"
                            }
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
                                        round: {
                                            $regex: "third place",
                                            $options: "i"
                                        }
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
                                    paramData.name = singleData['EVENT'];
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
                                                    singleData["NAME"] = null;
                                                    err = "SFA ID may have wrong values";
                                                    callback(null, {
                                                        error: err,
                                                        success: singleData
                                                    });
                                                } else {
                                                    singleData["NAME"] = complete._id;
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
                                        if (_.isEmpty(singleData["NAME"])) {
                                            paramData.opponentsSingle = "";
                                        } else {
                                            paramData.opponentsSingle.push(singleData["NAME"]);
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

    saveLeagueKnockout: function (importData, data, callback) {
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
                                if (_.isEmpty(singleData["WEIGHT CATEGORIES"])) {
                                    paramData.weight = undefined;
                                } else {
                                    var weight = singleData["WEIGHT CATEGORIES"];
                                    paramData.weight = _.trimStart(weight, " ");
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
                                if (singleData.error) {
                                    countError++;
                                    callback(null, singleData);
                                } else {
                                    if (_.isEmpty(singleData["TEAM 1"])) {
                                        callback(null, singleData);
                                    } else {
                                        console.log("singleData1", singleData);
                                        var paramData = {};
                                        paramData.team = singleData["TEAM 1"];
                                        paramData.sport = singleData.SPORT;
                                        Match.getTeamId(paramData, function (err, complete) {
                                            if (err || _.isEmpty(complete)) {
                                                singleData["TEAM NAME 1"] = null;
                                                err = "TEAM 1 may have wrong values";
                                                callback(null, {
                                                    error: err,
                                                    success: singleData
                                                });
                                            } else {
                                                singleData["TEAM NAME 1"] = complete._id;
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
                                    if (_.isEmpty(singleData["TEAM 2"])) {
                                        console.log("inside sfa");
                                        callback(null, singleData);
                                    } else {
                                        var paramData = {};
                                        paramData.team = singleData["TEAM 2"];
                                        paramData.sport = singleData.SPORT;
                                        Match.getTeamId(paramData, function (err, complete) {
                                            if (err || _.isEmpty(complete)) {
                                                singleData["TEAM NAME 2"] = null;
                                                err = "TEAM 2 may have wrong values";
                                                callback(err, null);
                                            } else {
                                                singleData["TEAM NAME 2"] = complete._id;
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
                                    paramData.round = singleData["ROUND"];
                                    if (_.isEmpty(singleData["TEAM NAME 1"]) || _.isEmpty(singleData["TEAM NAME 2"])) {
                                        paramData.opponentsTeam = "";
                                    } else if (_.isEmpty(singleData["TEAM NAME 1"])) {
                                        paramData.opponentsSingle.push(singleData["TEAM NAME 2"]);
                                    } else if (_.isEmpty(singleData["TEAM NAME 2"])) {
                                        paramData.opponentsSingle.push(singleData["TEAM NAME 1"]);
                                    } else {
                                        paramData.opponentsTeam.push(singleData["TEAM NAME 1"]);
                                        paramData.opponentsTeam.push(singleData["TEAM NAME 2"]);
                                    }
                                    paramData.sport = singleData.SPORT;
                                    paramData.scheduleDate = singleData.DATE;
                                    paramData.scheduleTime = singleData.TIME;
                                    paramData.excelType = singleData["STAGE"];
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
                console.log("singleData", singleData);
                if (singleData.error) {
                    callback(null, singleData);
                } else {
                    data.isLeagueKnockout = true;
                    data.sport = singleData[0].success.sport;
                    Match.addPreviousMatch(data, function (err, sportData) {
                        callback(null, singleData);
                    });
                }
            }
        ], function (err, results) {
            if (err || _.isEmpty(results)) {
                callback(err, null);
            } else {
                callback(null, results);
            }
        });
    },

    saveSwissLeague: function (importData, data, callback) {
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
                                    // console.log("singleData", singleData);
                                    var paramData = {};
                                    paramData.name = singleData.EVENT;
                                    console.log("para,", paramData.name);
                                    paramData.age = singleData["AGE GROUP"];
                                    if (singleData.GENDER == "Boys" || singleData.GENDER == "Male" || singleData.GENDER == "male") {
                                        paramData.gender = "male";
                                    } else if (singleData.GENDER == "Girls" || singleData.GENDER == "Female" || singleData.GENDER == "female") {
                                        paramData.gender = "female";
                                    }
                                    // var weight = singleData["WEIGHT CATEGORIES"];
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
                                    console.log("logssss", singleData);
                                    if (singleData.error) {
                                        countError++;
                                        callback(null, singleData);
                                    } else {
                                        if (_.isEmpty(singleData["SFAID 1"])) {
                                            singleData["NAME 1"] = null;
                                            callback(null, singleData);
                                        } else {
                                            // console.log("singleData1", singleData);
                                            var paramData = {};
                                            paramData.participant = singleData["SFAID 1"];
                                            paramData.sport = singleData.SPORT;
                                            Match.getAthleteId(paramData, function (err, complete) {
                                                if (err || _.isEmpty(complete)) {
                                                    singleData["NAME 1"] = "";
                                                    err = "SFAID 1 may have wrong values";
                                                    callback(null, {
                                                        error: err,
                                                        success: singleData
                                                    });
                                                } else {
                                                    singleData["NAME 1"] = complete._id;
                                                    callback(null, singleData);
                                                }
                                            });
                                        }
                                    }


                                },
                                function (singleData, callback) {
                                    console.log("logssss***", singleData);
                                    if (singleData.error) {
                                        countError++;
                                        callback(null, singleData);
                                    } else {
                                        if (_.isEmpty(singleData["SFAID 2"])) {
                                            singleData["NAME 2"] = "";
                                            callback(null, singleData);
                                        } else {
                                            var paramData = {};
                                            paramData.participant = singleData["SFAID 2"];
                                            paramData.sport = singleData.SPORT;
                                            Match.getAthleteId(paramData, function (err, complete) {
                                                if (err || _.isEmpty(complete)) {
                                                    singleData["NAME 2"] = null;
                                                    err = "SFAID 2 may have wrong values";
                                                    callback(err, null);
                                                } else {
                                                    singleData["NAME 2"] = complete._id;
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
                                        paramData.round = singleData["ROUND NAME"];
                                        if (_.isEmpty(singleData["NAME 1"]) && _.isEmpty(singleData["NAME 2"])) {
                                            paramData.opponentsSingle = "";
                                        } else if (_.isEmpty(singleData["NAME 1"])) {
                                            paramData.opponentsSingle.push(singleData["NAME 2"]);
                                        } else if (_.isEmpty(singleData["NAME 2"])) {
                                            paramData.opponentsSingle.push(singleData["NAME 1"]);
                                        } else {
                                            paramData.opponentsSingle.push(singleData["NAME 1"]);
                                            paramData.opponentsSingle.push(singleData["NAME 2"]);
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
                                // console.log("found0", match);
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
                        if (mainData.resultsCombat.winner) {
                            if (mainData.opponentsSingle[0].athleteId._id.equals(mainData.resultsCombat.winner.player)) {
                                if (mainData.resultsCombat.players[0].walkover == true) {
                                    obj["RESULT 1"] = "walkover";
                                } else {
                                    obj["RESULT 1"] = "Won";
                                }
                            } else {
                                if (mainData.resultsCombat.isNoMatch == false) {
                                    if (mainData.resultsCombat.players[0].walkover == false && mainData.resultsCombat.players[0].noShow == false) {
                                        obj["RESULT 1"] = "Lost";
                                    } else if (mainData.resultsCombat.players[0].walkover == true) {
                                        obj["RESULT 1"] = "walkover";
                                    } else {
                                        obj["RESULT 1"] = "noShow";
                                    }
                                } else {
                                    obj["RESULT 1"] = "No Match";
                                }
                            }
                            var i;
                            var sNo = 1;
                            for (i = 0; i < mainData.resultsCombat.players[0].sets.length; i++) {
                                if (i == 0) {
                                    obj["SCORE 1"] = "Set" + sNo + "-" + mainData.resultsCombat.players[0].sets[i].point;
                                    obj["DATA POINTS 1"] = "Set" + sNo + "{ point:" + mainData.resultsCombat.players[0].sets[i].point + "ace:" + mainData.resultsCombat.players[0].sets[i].ace + "winner:" + mainData.resultsCombat.players[0].sets[i].winner + "unforcedError:" + mainData.resultsCombat.players[0].sets[i].unforcedError + "serviceError:" + mainData.resultsCombat.players[0].sets[i].serviceError + "doubleFaults:" + mainData.resultsCombat.players[0].sets[i].doubleFaults + "}";
                                    sNo++;
                                } else {
                                    obj["SCORE 1"] = obj["SCORE 1"] + "," + "Set" + i + "-" + mainData.resultsCombat.players[0].sets[i].point;
                                    obj["DATA POINTS 1"] = obj["DATA POINTS 1"] + "," + "Set" + sNo + "{ point:" + mainData.resultsCombat.players[0].sets[i].point + "ace:" + mainData.resultsCombat.players[0].sets[i].ace + "winner:" + mainData.resultsCombat.players[0].sets[i].winner + "unforcedError:" + mainData.resultsCombat.players[0].sets[i].unforcedError + "serviceError:" + mainData.resultsCombat.players[0].sets[i].serviceError + "doubleFaults:" + mainData.resultsCombat.players[0].sets[i].doubleFaults + "}";
                                    sNo++;
                                }
                            }
                        } else {
                            obj["RESULT 1"] = "";
                            obj["SCORE 1"] = "";
                            obj["DATA POINTS 1"] = "";
                        }
                        // obj["DATA POINTS 1"] = mainData.resultsCombat.players[0].sets;
                    } else if (mainData.resultsRacquet) {
                        if (mainData.resultsRacquet.winner) {
                            if (mainData.opponentsSingle[0].athleteId._id.equals(mainData.resultsRacquet.winner.player)) {
                                if (mainData.resultsRacquet.players[0].walkover == true) {
                                    obj["RESULT 1"] = "walkover";
                                } else {
                                    obj["RESULT 1"] = "Won";
                                }
                            } else {
                                if (mainData.resultsRacquet.isNoMatch == false) {
                                    if (mainData.resultsRacquet.players[0].walkover == false && mainData.resultsRacquet.players[0].noShow == false) {
                                        obj["RESULT 1"] = "Lost";
                                    } else if (mainData.resultsRacquet.players[0].walkover == true) {
                                        obj["RESULT 1"] = "walkover";
                                    } else {
                                        obj["RESULT 1"] = "noShow";
                                    }
                                } else {
                                    obj["RESULT 1"] = "No Match";
                                }
                            }
                            var i;
                            var sNo = 1;
                            for (i = 0; i < mainData.resultsRacquet.players[0].sets.length; i++) {
                                if (i == 0) {
                                    obj["SCORE 1"] = "Set" + sNo + "-" + mainData.resultsRacquet.players[0].sets[i].point;
                                    obj["DATA POINTS 1"] = "Set" + sNo + "{ point:" + mainData.resultsRacquet.players[0].sets[i].point + "ace:" + mainData.resultsRacquet.players[0].sets[i].ace + "winner:" + mainData.resultsRacquet.players[0].sets[i].winner + "unforcedError:" + mainData.resultsRacquet.players[0].sets[i].unforcedError + "serviceError:" + mainData.resultsRacquet.players[0].sets[i].serviceError + "doubleFaults:" + mainData.resultsRacquet.players[0].sets[i].doubleFaults + "}";
                                    sNo++;
                                } else {
                                    obj["SCORE 1"] = obj["SCORE 1"] + "," + "Set" + i + "-" + mainData.resultsRacquet.players[0].sets[i].point;
                                    obj["DATA POINTS 1"] = obj["DATA POINTS 1"] + "," + "Set" + sNo + "{ point:" + mainData.resultsRacquet.players[0].sets[i].point + "ace:" + mainData.resultsRacquet.players[0].sets[i].ace + "winner:" + mainData.resultsRacquet.players[0].sets[i].winner + "unforcedError:" + mainData.resultsRacquet.players[0].sets[i].unforcedError + "serviceError:" + mainData.resultsRacquet.players[0].sets[i].serviceError + "doubleFaults:" + mainData.resultsRacquet.players[0].sets[i].doubleFaults + "}";
                                    sNo++;
                                }
                            }
                        } else {
                            obj["RESULT 1"] = "";
                            obj["SCORE 1"] = "";
                            obj["DATA POINTS 1"] = "";
                        }
                        // obj["DATA POINTS 1"] = mainData.resultsRacquet.players[0].sets;
                    } else {
                        obj["RESULT 1"] = "";
                        obj["SCORE 1"] = "";
                        obj["DATA POINTS 1"] = "";
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

                    if (mainData.opponentsSingle[1].athleteId.middleName) {
                        obj["PARTICIPANT 2"] = mainData.opponentsSingle[1].athleteId.firstName + " " + mainData.opponentsSingle[1].athleteId.middleName + " " + mainData.opponentsSingle[1].athleteId.surname;
                    } else {
                        obj["PARTICIPANT 2"] = mainData.opponentsSingle[1].athleteId.firstName + " " + mainData.opponentsSingle[1].athleteId.surname;
                    }
                    obj["SCHOOL 2"] = mainData.opponentsSingle[1].athleteId.school.name;
                    if (mainData.resultsCombat) {

                        if (mainData.opponentsSingle[1].athleteId._id === mainData.resultsCombat.winner.player) {
                            if (mainData.resultsCombat.players[0].walkover == true) {
                                obj["RESULT 2"] = "walkover";
                            } else {
                                obj["RESULT 2"] = "Won";
                            }
                        } else {
                            if (mainData.resultsCombat.isNoMatch == false) {
                                if (mainData.resultsCombat.players[1].walkover == false && mainData.resultsCombat.players[1].noShow == false) {
                                    obj["RESULT 2"] = "Lost";
                                } else if (mainData.resultsCombat.players[1].walkover == true) {
                                    obj["RESULT 2"] = "walkover";
                                } else {
                                    obj["RESULT 2"] = "noShow";
                                }
                            } else {
                                obj["RESULT 2"] = "No Match";
                            }
                        }
                        var i;
                        var sNo = 1;
                        for (i = 0; i < mainData.resultsCombat.players[1].sets.length; i++) {
                            if (i == 0) {
                                obj["SCORE 1"] = "Set" + sNo + "-" + mainData.resultsCombat.players[1].sets[i].point;
                                obj["DATA POINTS 1"] = "Set" + sNo + "{ point:" + mainData.resultsCombat.players[1].sets[i].point + "ace:" + mainData.resultsCombat.players[1].sets[i].ace + "winner:" + mainData.resultsCombat.players[1].sets[i].winner + "unforcedError:" + mainData.resultsCombat.players[1].sets[i].unforcedError + "serviceError:" + mainData.resultsCombat.players[1].sets[i].serviceError + "doubleFaults:" + mainData.resultsCombat.players[1].sets[i].doubleFaults + "}";
                                sNo++;
                            } else {
                                obj["SCORE 1"] = obj["SCORE 1"] + "," + "Set" + sNo + "-" + mainData.resultsCombat.players[1].sets[i].point;
                                obj["DATA POINTS 1"] = obj["DATA POINTS 1"] + "," + "Set" + sNo + "{ point:" + mainData.resultsCombat.players[1].sets[i].point + "ace:" + mainData.resultsCombat.players[1].sets[i].ace + "winner:" + mainData.resultsCombat.players[1].sets[i].winner + "unforcedError:" + mainData.resultsCombat.players[1].sets[i].unforcedError + "serviceError:" + mainData.resultsCombat.players[1].sets[i].serviceError + "doubleFaults:" + mainData.resultsCombat.players[1].sets[i].doubleFaults + "}";
                                sNo++;
                            }
                        }
                        // obj["DATA POINTS 2"] = mainData.resultsCombat.players[1].sets[;
                    } else if (mainData.resultsRacquet) {
                        if (mainData.opponentsSingle[1].athleteId._id === mainData.resultsRacquet.winner.player) {
                            if (mainData.resultsRacquet.players[0].walkover == true) {
                                obj["RESULT 2"] = "walkover";
                            } else {
                                obj["RESULT 2"] = "Won";
                            }
                        } else {
                            if (mainData.resultsRacquet.isNoMatch == false) {
                                if (mainData.resultsRacquet.players[1].walkover == false && mainData.resultsRacquet.players[1].noShow == false) {
                                    obj["RESULT 2"] = "Lost";
                                } else if (mainData.resultsRacquet.players[1].walkover == true) {
                                    obj["RESULT 2"] = "walkover";
                                } else {
                                    obj["RESULT 2"] = "noShow";
                                }
                            } else {
                                obj["RESULT 2"] = "No Match";
                            }
                        }
                        var i;
                        for (i = 0; i < mainData.resultsRacquet.players[1].sets.length; i++) {
                            if (i == 0) {
                                obj["SCORE 1"] = "Set" + sNo + "-" + mainData.resultsRacquet.players[1].sets[i].point;
                                obj["DATA POINTS 1"] = "Set" + sNo + "{ point:" + mainData.resultsRacquet.players[1].sets[i].point + "ace:" + mainData.resultsRacquet.players[1].sets[i].ace + "winner:" + mainData.resultsRacquet.players[1].sets[i].winner + "unforcedError:" + mainData.resultsRacquet.players[1].sets[i].unforcedError + "serviceError:" + mainData.resultsRacquet.players[1].sets[i].serviceError + "doubleFaults:" + mainData.resultsRacquet.players[1].sets[i].doubleFaults + "}";
                                sNo++;
                            } else {
                                obj["SCORE 1"] = obj["SCORE 1"] + "," + "Set" + i + "-" + mainData.resultsRacquet.players[1].sets[i].point;
                                obj["DATA POINTS 1"] = obj["DATA POINTS 1"] + "," + "Set" + sNo + "{ point:" + mainData.resultsRacquet.players[1].sets[i].point + "ace:" + mainData.resultsRacquet.players[1].sets[i].ace + "winner:" + mainData.resultsRacquet.players[1].sets[i].winner + "unforcedError:" + mainData.resultsRacquet.players[1].sets[i].unforcedError + "serviceError:" + mainData.resultsRacquet.players[1].sets[i].serviceError + "doubleFaults:" + mainData.resultsRacquet.players[1].sets[i].doubleFaults + "}";
                                sNo++;
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
            obj["SFAID 2"] = "";
            obj["PARTICIPANT 2"] = "";
            obj["SCHOOL 2"] = "";
            finalData.push(obj);
            Config.generateExcel("KnockoutIndividual", finalData, res);
        } else if (data.resultType == 'knockout' && data.playerType == 'team') {
            var obj = {};
            obj["ROUND NAME"] = "";
            obj["SPORT"] = "";
            obj.GENDER = ""
            obj["AGE GROUP"] = "";
            obj["EVENT"] = "";
            obj["WEIGHT CATEGORIES"] = "";
            obj.DATE = "";
            obj.TIME = "";
            obj["TEAM 1"] = "";
            obj["PARTICIPANT 1"] = "";
            obj["SCHOOL 1"] = "";
            obj["TEAM 2"] = "";
            obj["PARTICIPANT 2"] = "";
            obj["SCHOOL 2"] = "";
            finalData.push(obj);
            Config.generateExcel("KnockoutIndividual", finalData, res);
        } else if (data.resultType == 'heat' && data.playerType == 'individual') {
            var obj = {};
            obj.DATE = "";
            obj.TIME = "";
            obj.SPORT = "";
            obj["EVENT"] = "";
            obj.GENDER = ""
            obj["AGE GROUP"] = "";
            obj["ROUND"] = "";
            obj["HEAT NUMBER"] = "";
            obj["LANE NUMBER"] = "";
            obj["SFA ID"] = " ";
            obj["NAME"] = " ";
            obj["SCHOOL"] = "";
            finalData.push(obj);
            Config.generateExcel("KnockoutIndividual", finalData, res);
        } else if (data.resultType == 'heat' && data.playerType == 'team') {
            var obj = {};
            // var obj = {};
            obj["MATCH ID"] = "";
            obj.DATE = "";
            obj.TIME = "";
            obj.SPORT = "";
            obj["EVENT"] = "";
            obj.GENDER = ""
            obj["AGE GROUP"] = "";
            obj["ROUND"] = "";
            obj["HEAT NUMBER"] = "";
            obj["LANE NUMBER"] = "";
            obj["TEAM ID"] = "";
            obj["NAME"] = "";
            obj["SCHOOL"] = "";
            finalData.push(obj);
            Config.generateExcel("KnockoutIndividual", finalData, res);
        } else if (data.resultType == "qualifying-round" || data.resultType == "direct-final") {
            var obj = {};
            obj.DATE = "";
            obj.TIME = "";
            obj.SPORT = "";
            obj["EVENT"] = "";
            obj["GENDER"] = ""
            obj["AGE GROUP"] = "";
            obj["ROUND"] = "";
            obj["SFA ID"] = "";
            obj["NAME"] = "";
            obj["SCHOOL"] = "";
            if (data.resultType == "direct-final") {
                obj["LANE NUMBER"] = "";
                obj["DETAIL NO."] = "";
            }
            finalData.push(obj);
            Config.generateExcel("KnockoutIndividual", finalData, res);
        } else if (data.resultType == "qualifying-knockout" && data.excelType == "qualifying") {
            var obj = {};
            obj.DATE = "";
            obj.TIME = "";
            obj.SPORT = "";
            obj["EVENT"] = "";
            obj["GENDER"] = ""
            obj["AGE GROUP"] = "";
            obj["ROUND"] = "";
            obj["SFA ID"] = "";
            obj["NAME"] = "";
            obj["SCHOOL"] = "";
            finalData.push(obj);
            Config.generateExcel("KnockoutIndividual", finalData, res);
        } else if (data.resultType == "qualifying-knockout" && data.excelType == 'knockout') {
            var obj = {};
            obj["ROUND NAME"] = "";
            obj["SPORT"] = "";
            obj.GENDER = ""
            obj["AGE GROUP"] = "";
            obj["EVENT"] = "";
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
            finalData.push(obj);
            Config.generateExcel("KnockoutIndividual", finalData, res);
        } else if (data.resultType == 'league-cum-knockout') {
            var obj = {};
            obj.DATE = "";
            obj.TIME = "";
            obj["SPORT"] = "";
            obj.GENDER = ""
            obj["AGE GROUP"] = "";
            obj["EVENT"] = "";
            obj["WEIGHT CATEGORIES"] = "";
            obj["STAGE"] = "";
            obj["ROUND"] = "";
            obj["MATCH NO"] = "";
            obj["TEAM 1"] = "";
            obj["TEAM NAME 1"] = "";
            obj["SCHOOL 1"] = "";
            obj["COACH NAME 1"] = "";
            obj["TEAM 2"] = "";
            obj["TEAM NAME 2"] = "";
            obj["SCHOOL 2"] = "";
            obj["COACH NAME 2"] = "";
            finalData.push(obj);
            Config.generateExcel("KnockoutIndividual", finalData, res);
        } else if (data.resultType == 'swiss-league') {
            var obj = {};
            obj["ROUND NAME"] = "";
            obj["SPORT"] = "";
            obj.GENDER = ""
            obj["AGE GROUP"] = "";
            obj["EVENT"] = "";
            obj["WEIGHT CATEGORIES"] = "";
            obj.DATE = "";
            obj.TIME = "";
            obj["SFAID 1"] = "";
            obj["NAME 1"] = "";
            obj["SCHOOL 1"] = "";
            obj["SFAID 2"] = "";
            obj["NAME 2"] = "";
            obj["SCHOOL 2"] = "";
            finalData.push(obj);
            Config.generateExcel("KnockoutIndividual", finalData, res);
        }

    },

    generateExcelKnockoutTeam: function (match, callback) {
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
                console.log(JSON.stringify(mainData.opponentsTeam, null, "    "), "-------------");
                if (mainData.opponentsTeam.length > 0) {
                    obj["TEAMID 1"] = mainData.opponentsTeam[0].teamId;
                    obj["SCHOOL 1"] = mainData.opponentsTeam[0].schoolName;
                    // console.log(JSON.stringify(mainData.resultsCombat, null, "    "),"-------------");                                    
                    if (mainData.resultsCombat) {
                        if (mainData.opponentsTeam[0]._id.equals(mainData.resultsCombat.winner.player)) {
                            if (mainData.resultsCombat.teams[0].walkover == true) {
                                obj["RESULT 1"] = "walkover";
                            } else {
                                obj["RESULT 1"] = "Won";
                            }
                        } else {
                            if (mainData.resultsCombat.isNoMatch == false) {
                                if (mainData.resultsCombat.teams[0].walkover == false && mainData.resultsCombat.teams[0].noShow == false) {
                                    obj["RESULT 1"] = "Lost";
                                } else if (mainData.resultsCombat.teams[0].walkover == true) {
                                    obj["RESULT 1"] = "walkover";
                                } else {
                                    obj["RESULT 1"] = "noShow";
                                }
                            } else {
                                obj["RESULT 1"] = "No Match";
                            }
                        }

                        var i;
                        var sNo = 1;
                        for (i = 0; i < mainData.resultsCombat.teams[0].sets.length; i++) {
                            if (i == 0) {
                                obj["SCORE 1"] = "Set" + sNo + "-" + mainData.resultsCombat.teams[0].sets[i].point;
                                obj["DATA POINTS 1"] = mainData.resultsCombat.teams[0].sets[i];
                                sNo++;

                            } else {
                                obj["SCORE 1"] = obj["SCORE 1"] + "," + "Set" + sNo + "-" + mainData.resultsCombat.teams[0].sets[i].point;
                                obj["DATA POINTS 1"] = obj["DATA POINTS 1"] + "," + mainData.resultsCombat.teams[0].sets[i];
                                sNo++;
                            }
                        }
                        // obj["DATA POINTS 1"] = mainData.resultsCombat.teams[0].sets;
                    } else if (mainData.resultsRacquet) {
                        if (mainData.opponentsTeam[0]._id === mainData.resultsRacquet.winner.player) {
                            if (mainData.resultsRacquet.teams[0].walkover == true) {
                                obj["RESULT 1"] = "walkover";
                            } else {
                                obj["RESULT 1"] = "Won";
                            }
                        } else {
                            if (mainData.resultsRacquet.isNoMatch == false) {
                                if (mainData.resultsRacquet.teams[0].walkover == false && mainData.resultsRacquet.teams[0].noShow == false) {
                                    obj["RESULT 1"] = "Lost";
                                } else if (mainData.resultsRacquet.teams[0].walkover == true) {
                                    obj["RESULT 1"] = "walkover";
                                } else {
                                    obj["RESULT 1"] = "noShow";
                                }
                            } else {
                                obj["RESULT 1"] = "No Match";
                            }
                        }
                        var i;
                        var sNo = 1;
                        for (i = 0; i < mainData.resultsRacquet.teams[0].sets.length; i++) {
                            if (i == 0) {
                                obj["SCORE 1"] = "Set" + sNo + "-" + mainData.resultsRacquet.teams[0].sets[i].point;
                                obj["DATA POINTS 1"] = "Set" + sNo + "{ point:" + mainData.resultsRacquet.teams[0].sets[i].point + "ace:" + mainData.resultsRacquet.teams[0].sets[i].ace + "winner:" + mainData.resultsRacquet.teams[0].sets[i].winner + "unforcedError:" + mainData.resultsRacquet.teams[0].sets[i].unforcedError + "serviceError:" + mainData.resultsRacquet.teams[0].sets[i].serviceError + "doubleFaults:" + mainData.resultsRacquet.teams[0].sets[i].doubleFaults + "}";
                                sNo++;
                            } else {
                                obj["SCORE 1"] = obj["SCORE 1"] + "," + "Set" + sNo + "-" + mainData.resultsRacquet.teams[0].sets[i].point;
                                obj["DATA POINTS 1"] = obj["DATA POINTS 1"] + "," + "Set" + sNo + "{ point:" + mainData.resultsRacquet.teams[0].sets[i].point + "ace:" + mainData.resultsRacquet.teams[0].sets[i].ace + "winner:" + mainData.resultsRacquet.teams[0].sets[i].winner + "unforcedError:" + mainData.resultsRacquet.teams[0].sets[i].unforcedError + "serviceError:" + mainData.resultsRacquet.teams[0].sets[i].serviceError + "doubleFaults:" + mainData.resultsRacquet.teams[0].sets[i].doubleFaults + "}";
                                sNo++;
                            }
                        }
                        // obj["DATA POINTS 2"] = mainData.resultsRacquet.teams[1].sets[;
                    } else {
                        obj["RESULT 1"] = "";
                        obj["SCORE 1"] = "";
                        obj["DATA POINTS 1"] = "";
                    }
                    if (mainData.resultBasketball) {
                        if (mainData.opponentsTeam[0]._id === mainData.resultBasketball.winner.player) {
                            if (mainData.resultBasketball.teams[0].walkover == true) {
                                obj["RESULT 1"] = "walkover";
                            } else {
                                obj["RESULT 1"] = "Won";
                            }
                        } else {
                            if (mainData.resultBasketball.isNoMatch == false) {
                                if (mainData.resultBasketball.teams[0].walkover == false && mainData.resultBasketball.teams[0].noShow == false) {
                                    obj["RESULT 1"] = "Lost";
                                } else if (mainData.resultBasketball.teams[0].walkover == true) {
                                    obj["RESULT 1"] = "walkover";
                                } else {
                                    obj["RESULT 1"] = "noShow";
                                }
                            } else {
                                obj["RESULT 1"] = "No Match";
                            }
                        }
                        var i;
                        var sNo = 1;
                        for (i = 0; i < mainData.resultBasketball.teams[0].teamResults.quarterPoints.length; i++) {
                            if (i == 0) {
                                obj["QUARTER SCORE 1"] = "Q" + sNo + "-" + mainData.resultBasketball.teams[0].teamResults.quarterPoints[i].basket;
                                sNo++;
                            } else {
                                obj["QUARTER SCORE 1"] = obj["QUARTER SCORE 1"] + "," + "Q" + sNo + "-" + mainData.resultBasketball.teams[0].teamResults.quarterPoints[i].basket;
                                sNo++;
                            }
                        }
                    } else {
                        obj["RESULT 1"] = "";
                        obj["QUARTER SCORE 1"] = "";
                    }
                    if (mainData.resultVolleyball) {
                        if (mainData.opponentsTeam[0]._id === mainData.resultVolleyball.winner.player) {
                            if (mainData.resultVolleyball.teams[0].walkover == true) {
                                obj["RESULT 1"] = "walkover";
                            } else {
                                obj["RESULT 1"] = "Won";
                            }
                        } else {
                            if (mainData.resultVolleyball.isNoMatch == false) {
                                if (mainData.resultVolleyball.teams[0].walkover == false && mainData.resultVolleyball.teams[0].noShow == false) {
                                    obj["RESULT 1"] = "Lost";
                                } else if (mainData.resultVolleyball.teams[0].walkover == true) {
                                    obj["RESULT 1"] = "walkover";
                                } else {
                                    obj["RESULT 1"] = "noShow";
                                }
                            } else {
                                obj["RESULT 1"] = "No Match";
                            }
                        }
                        var i;
                        var sNo = 1;
                        for (i = 0; i < mainData.resultVolleyball.teams[0].teamResults.sets.length; i++) {
                            if (i == 0) {
                                obj["SCORE 1"] = "Set" + sNo + "-" + mainData.resultVolleyball.teams[0].teamResults.sets[i].points;
                                sNo++;
                            } else {
                                obj["SCORE 1"] = obj["SCORE 1"] + "," + "Set" + sNo + "-" + mainData.resultVolleyball.teams[0].teamResults.quarterPoints[i].basket;
                                sNo++;
                            }
                        }
                        obj["DATA POINTS 1"] = "Spike:" + mainData.resultVolleyball.teams[0].teamResults.spike + ",Fouls:" + mainData.resultVolleyball.teams[0].teamResults.fouls + ",Block:" + mainData.resultVolleyball.teams[0].teamResults.block;
                    } else {
                        obj["RESULT 1"] = "";
                        obj["SCORE 1"] = "";
                        obj["DATA POINTS 1"] = "";
                    }
                    if (mainData.resultHandball) {
                        if (mainData.opponentsTeam[0]._id === mainData.resultHandball.winner.player) {
                            if (mainData.resultHandball.teams[0].walkover == true) {
                                obj["RESULT 1"] = "walkover";
                            } else {
                                obj["RESULT 1"] = "Won";
                            }
                        } else {
                            if (mainData.resultHandball.isNoMatch == false) {
                                if (mainData.resultHandball.teams[0].walkover == false && mainData.resultHandball.teams[0].noShow == false) {
                                    obj["RESULT 1"] = "Lost";
                                } else if (mainData.resultHandball.teams[0].walkover == true) {
                                    obj["RESULT 1"] = "walkover";
                                } else {
                                    obj["RESULT 1"] = "noShow";
                                }
                            } else {
                                obj["RESULT 1"] = "No Match";
                            }
                        }

                        obj["HALF SCORE 1"] = mainData.resultHandball.teams[0].teamResults.halfPoints;
                        obj["FINAL SCORE 1"] = mainData.resultHandball.teams[0].teamResults.finalPoints;
                        obj["DATA POINTS 1"] = "Penalty:" + mainData.resultHandball.teams[0].teamResults.penalty + ",Saves:" + mainData.resultHandball.teams[0].teamResults.saves + ",ShotsOnGoal:" + mainData.resultHandball.teams[0].teamResults.shotsOnGoal;
                    } else if (mainData.resultKabaddi) {
                        if (mainData.opponentsTeam[0]._id === mainData.resultKabaddi.winner.player) {
                            if (mainData.resultKabaddi.teams[0].walkover == true) {
                                obj["RESULT 1"] = "walkover";
                            } else {
                                obj["RESULT 1"] = "Won";
                            }
                        } else {
                            if (mainData.resultKabaddi.isNoMatch == false) {
                                if (mainData.resultKabaddi.teams[0].walkover == false && mainData.resultKabaddi.teams[0].noShow == false) {
                                    obj["RESULT 1"] = "Lost";
                                } else if (mainData.resultKabaddi.teams[0].walkover == true) {
                                    obj["RESULT 1"] = "walkover";
                                } else {
                                    obj["RESULT 1"] = "noShow";
                                }
                            } else {
                                obj["RESULT 1"] = "No Match";
                            }
                        }

                        obj["HALF SCORE 1"] = mainData.resultKabaddi.teams[0].teamResults.halfPoints;
                        obj["FINAL SCORE 1"] = mainData.resultKabaddi.teams[0].teamResults.finalPoints;
                        obj["DATA POINTS 1"] = "AllOut:" + mainData.resultKabaddi.teams[0].teamResults.allOut + ",SuperTackle:" + mainData.resultKabaddi.teams[0].teamResults.superTackle;
                    } else {
                        obj["RESULT 1"] = "";
                        obj["HALF SCORE 1"] = "";
                        obj["FINAL SCORE 1"] = "";
                        obj["DATA POINTS 1"] = "";
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
                        if (mainData.opponentsTeam[1]._id.equals(mainData.resultsCombat.winner.player)) {
                            if (mainData.resultsCombat.teams[1].walkover == true) {
                                obj["RESULT 2"] = "walkover";
                            } else {
                                obj["RESULT 2"] = "Won";
                            }
                        } else {
                            if (mainData.resultsCombat.isNoMatch == false) {
                                if (mainData.resultsCombat.teams[1].walkover == false && mainData.resultsCombat.teams[1].noShow == false) {
                                    obj["RESULT 2"] = "Lost";
                                } else if (mainData.resultsCombat.teams[1].walkover == true) {
                                    obj["RESULT 2"] = "walkover";
                                } else {
                                    obj["RESULT 2"] = "noShow";
                                }
                            } else {
                                obj["RESULT 2"] = "No Match";
                            }
                        }
                        var i;
                        var sNo = 1;
                        for (i = 0; i < mainData.resultsCombat.teams[1].sets.length; i++) {
                            if (i == 0) {
                                obj["SCORE 2"] = "Set" + sNo + "-" + mainData.resultsCombat.teams[1].sets[i].point;
                                obj["DATA POINTS 2"] = mainData.resultsCombat.teams[1].sets[i];
                                sNo++;
                            } else {
                                obj["SCORE 2"] = obj["SCORE 2"] + "," + "Set" + sNo + "-" + mainData.resultsCombat.teams[1].sets[i].point;
                                obj["DATA POINTS 2"] = obj["DATA POINTS 2"] + "," + mainData.resultsCombat.teams[1].sets[i];
                                sNo++;
                            }
                        }
                        // obj["DATA POINTS 2"] = mainData.resultsCombat.teams[1].sets[;
                    } else if (mainData.resultsRacquet) {
                        if (mainData.opponentsTeam[1]._id === mainData.resultsRacquet.winner.player) {
                            if (mainData.resultsRacquet.teams[1].walkover == true) {
                                obj["RESULT 2"] = "walkover";
                            } else {
                                obj["RESULT 2"] = "Won";
                            }
                        } else {
                            if (mainData.resultsRacquet.isNoMatch == false) {
                                if (mainData.resultsRacquet.teams[1].walkover == false && mainData.resultsRacquet.teams[1].noShow == false) {
                                    obj["RESULT 2"] = "Lost";
                                } else if (mainData.resultsRacquet.teams[1].walkover == true) {
                                    obj["RESULT 2"] = "walkover";
                                } else {
                                    obj["RESULT 2"] = "noShow";
                                }
                            } else {
                                obj["RESULT 2"] = "No Match";
                            }
                        }
                        var i;
                        var sNo = 1;
                        for (i = 0; i < mainData.resultsRacquet.teams[1].sets.length; i++) {
                            if (i == 0) {
                                obj["SCORE 1"] = "Set" + sNo + "-" + mainData.resultsRacquet.teams[1].sets[i].point;
                                obj["DATA POINTS 1"] = "Set" + sNo + "{ point:" + mainData.resultsRacquet.teams[1].sets[i].point + "ace:" + mainData.resultsRacquet.teams[1].sets[i].ace + "winner:" + mainData.resultsRacquet.teams[1].sets[i].winner + "unforcedError:" + mainData.resultsRacquet.teams[1].sets[i].unforcedError + "serviceError:" + mainData.resultsRacquet.teams[1].sets[i].serviceError + "doubleFaults:" + mainData.resultsRacquet.teams[1].sets[i].doubleFaults + "}";
                                sNo++;
                            } else {
                                obj["SCORE 1"] = obj["SCORE 1"] + "," + "Set" + i + "-" + mainData.resultsRacquet.teams[1].sets[i].point;
                                obj["DATA POINTS 1"] = obj["DATA POINTS 1"] + "," + "Set" + sNo + "{ point:" + mainData.resultsRacquet.teams[1].sets[i].point + "ace:" + mainData.resultsRacquet.teams[1].sets[i].ace + "winner:" + mainData.resultsRacquet.teams[1].sets[i].winner + "unforcedError:" + mainData.resultsRacquet.teams[1].sets[i].unforcedError + "serviceError:" + mainData.resultsRacquet.teams[1].sets[i].serviceError + "doubleFaults:" + mainData.resultsRacquet.teams[1].sets[i].doubleFaults + "}";
                                sNo++;
                            }
                        }
                        // obj["DATA POINTS 2"] = mainData.resultsRacquet.teams[1].sets[;
                    } else {
                        obj["RESULT 2"] = "";
                        obj["SCORE 2"] = "";
                        obj["DATA POINTS 2"] = "";
                    }

                    if (mainData.resultBasketball) {
                        if (mainData.opponentsTeam[1]._id === mainData.resultBasketball.winner.player) {
                            if (mainData.resultBasketball.teams[1].walkover == true) {
                                obj["RESULT 2"] = "walkover";
                            } else {
                                obj["RESULT 2"] = "Won";
                            }
                        } else {
                            if (mainData.resultBasketball.isNoMatch == false) {
                                if (mainData.resultBasketball.teams[1].walkover == false && mainData.resultBasketball.teams[1].noShow == false) {
                                    obj["RESULT 2"] = "Lost";
                                } else if (mainData.resultBasketball.teams[1].walkover == true) {
                                    obj["RESULT 2"] = "walkover";
                                } else {
                                    obj["RESULT 2"] = "noShow";
                                }
                            } else {
                                obj["RESULT 2"] = "No Match";
                            }
                        }
                        var i;
                        var sNo = 1;
                        for (i = 0; i < mainData.resultBasketball.teams[1].teamResults.quarterPoints.length; i++) {
                            if (i == 0) {
                                obj["QUARTER SCORE 2"] = "Q" + sNo + "-" + mainData.resultBasketball.teams[1].teamResults.quarterPoints[i].basket;
                                sNo++;
                            } else {
                                obj["QUARTER SCORE 2"] = obj["QUARTER SCORE 1"] + "," + "Q" + i + "-" + mainData.resultBasketball.teams[1].teamResults.quarterPoints[i].basket;
                                sNo++;
                            }
                        }
                        if (mainData.opponentsTeam[1]) {
                            obj["FINAL SCORE"] = mainData.resultBasketball.teams[0].teamResults.finalGoalPoints + "-" + mainData.resultBasketball.teams[1].teamResults.finalGoalPoints;
                        } else {
                            obj["FINAL SCORE"] = mainData.resultBasketball.teams[0].teamResults.finalGoalPoints;
                        }
                    } else {
                        obj["RESULT 2"] = "";
                        obj["QUARTER SCORE 2"] = "";
                        obj["FINAL SCORE"] = "";
                    }

                    if (mainData.resultVolleyball) {
                        if (mainData.opponentsTeam[1]._id === mainData.resultVolleyball.winner.player) {
                            if (mainData.resultVolleyball.teams[1].walkover == true) {
                                obj["RESULT 2"] = "walkover";
                            } else {
                                obj["RESULT 2"] = "Won";
                            }
                        } else {
                            if (mainData.resultVolleyball.isNoMatch == false) {
                                if (mainData.resultVolleyball.teams[1].walkover == false && mainData.resultVolleyball.teams[1].noShow == false) {
                                    obj["RESULT 2"] = "Lost";
                                } else if (mainData.resultVolleyball.teams[1].walkover == true) {
                                    obj["RESULT 2"] = "walkover";
                                } else {
                                    obj["RESULT 2"] = "noShow";
                                }
                            } else {
                                obj["RESULT 2"] = "No Match";
                            }
                        }
                        var i;
                        var sNo = 1;
                        for (i = 0; i < mainData.resultVolleyball.teams[1].teamResults.sets.length; i++) {
                            if (i == 0) {
                                obj["SCORE 2"] = "Set" + sNo + "-" + mainData.resultVolleyball.teams[1].teamResults.sets[i].points;
                                sNo++;
                            } else {
                                obj["SCORE 2"] = obj["SCORE 2"] + "," + "Set" + sNo + "-" + mainData.resultVolleyball.teams[1].teamResults.quarterPoints[i].basket;
                                sNo++;
                            }
                        }
                        obj["DATA POINTS 2"] = "Spike:" + mainData.resultVolleyball.teams[1].teamResults.spike + ",Fouls:" + mainData.resultVolleyball.teams[0].teamResults.fouls + ",Block:" + mainData.resultVolleyball.teams[0].teamResults.block;
                    } else {
                        obj["RESULT 2"] = "";
                        obj["SCORE 2"] = "";
                        obj["DATA POINTS 2"] = "";
                    }

                    if (mainData.resultHandball) {
                        if (mainData.opponentsTeam[1]._id === mainData.resultHandball.winner.player) {
                            if (mainData.resultHandball.teams[1].walkover == true) {
                                obj["RESULT 2"] = "walkover";
                            } else {
                                obj["RESULT 2"] = "Won";
                            }
                        } else {
                            if (mainData.resultHandball.isNoMatch == false) {
                                if (mainData.resultHandball.teams[1].walkover == false && mainData.resultHandball.teams[1].noShow == false) {
                                    obj["RESULT 2"] = "Lost";
                                } else if (mainData.resultHandball.teams[0].walkover == true) {
                                    obj["RESULT 2"] = "walkover";
                                } else {
                                    obj["RESULT 2"] = "noShow";
                                }
                            } else {
                                obj["RESULT 2"] = "No Match";
                            }
                        }
                        obj["HALF SCORE 2"] = mainData.resultHandball.teams[1].teamResults.halfPoints;
                        obj["FINAL SCORE 2"] = mainData.resultHandball.teams[1].teamResults.finalPoints;
                        obj["DATA POINTS 2"] = "Penalty:" + mainData.resultHandball.teams[1].teamResults.penalty + ",Saves:" + mainData.resultHandball.teams[0].teamResults.saves + ",ShotsOnGoal:" + mainData.resultHandball.teams[0].teamResults.shotsOnGoal;
                    } else if (mainData.resultKabaddi) {
                        if (mainData.opponentsTeam[1]._id === mainData.resultKabaddi.winner.player) {
                            if (mainData.resultKabaddi.teams[1].walkover == true) {
                                obj["RESULT 1"] = "walkover";
                            } else {
                                obj["RESULT 1"] = "Won";
                            }
                        } else {
                            if (mainData.resultKabaddi.isNoMatch == false) {
                                if (mainData.resultKabaddi.teams[1].walkover == false && mainData.resultKabaddi.teams[1].noShow == false) {
                                    obj["RESULT 1"] = "Lost";
                                } else if (mainData.resultKabaddi.teams[1].walkover == true) {
                                    obj["RESULT 1"] = "walkover";
                                } else {
                                    obj["RESULT 1"] = "noShow";
                                }
                            } else {
                                obj["RESULT 1"] = "No Match";
                            }
                        }

                        obj["HALF SCORE 1"] = mainData.resultKabaddi.teams[1].teamResults.halfPoints;
                        obj["FINAL SCORE 1"] = mainData.resultKabaddi.teams[1].teamResults.finalPoints;
                        obj["DATA POINTS 1"] = "AllOut:" + mainData.resultKabaddi.teams[1].teamResults.allOut + ",SuperTackle:" + mainData.resultKabaddi.teams[1].teamResults.superTackle;
                    } else {
                        obj["RESULT 2"] = "";
                        obj["HALF SCORE 2"] = "";
                        obj["FINAL SCORE 2"] = "";
                        obj["DATA POINTS 2"] = "";
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
                if (!_.isEmpty(matchData.resultHeat)) {
                    async.concatSeries(matchData.resultHeat.players, function (mainData, callback) {
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
                                obj.GENDER = "Male & Female";
                            }
                            obj["AGE GROUP"] = matchData.sport.ageGroup.name;
                            obj.EVENT = matchData.sport.sportslist.name;
                            obj["ROUND"] = matchData.round;
                            obj["HEAT NUMBER"] = matchData.heatNo;
                            obj["LANE NUMBER"] = mainData.laneNo;
                            // obj["SFA ID"] = mainData.athleteId.sfaId;
                            if (mainData.id) {
                                obj["SFA ID"] = matchData.opponentsSingle[i].athleteId.sfaId;
                                if (matchData.opponentsSingle[i].athleteId.middleName) {
                                    obj["NAME"] = matchData.opponentsSingle[i].athleteId.firstName + " " + matchData.opponentsSingle[i].athleteId.middleName + " " + matchData.opponentsSingle[i].athleteId.surname;
                                } else {
                                    obj["NAME"] = matchData.opponentsSingle[i].athleteId.firstName + " " + matchData.opponentsSingle[i].athleteId.surname;
                                }
                                obj["SCHOOL"] = matchData.opponentsSingle[i].athleteId.school.name;
                                i++;
                            } else {
                                obj["SFA ID"] = "";
                                obj["NAME"] = "";
                                obj["SCHOOL"] = "";
                            }


                            if (mainData.time) {
                                obj["TIMING"] = mainData.time;
                            } else {
                                if (!_.isEmpty(obj["SFA ID"])) {
                                    obj["TIMING"] = "-";
                                } else {
                                    obj["TIMING"] = "";
                                }
                            }
                            if (mainData.result) {
                                obj["RESULT"] = mainData.result;
                            } else {
                                if (!_.isEmpty(obj["SFA ID"])) {
                                    obj["RESULT"] = "-";
                                } else {
                                    obj["RESULT"] = "";
                                }
                            }
                            callback(null, obj);
                        },
                        function (err, singleData) {
                            callback(null, singleData);
                        });
                } else {
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
                    obj["ROUND"] = matchData.round;
                    obj["HEAT NUMBER"] = matchData.heatNo;
                    obj["LANE NUMBER"] = "";
                    obj["SFA ID"] = " ";
                    obj["NAME"] = " ";
                    obj["SCHOOL"] = "";
                    obj["TIMING"] = " ";
                    obj["RESULT"] = " ";
                    callback(null, obj);
                }
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
                if (!_.isEmpty(matchData.resultHeat)) {
                    async.concatSeries(matchData.resultHeat.players, function (mainData, callback) {
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
                                obj.GENDER = "Male & Female";
                            }
                            obj["AGE GROUP"] = matchData.sport.ageGroup.name;
                            obj.EVENT = matchData.sport.sportslist.name;
                            obj["ROUND"] = matchData.round;
                            obj["HEAT NUMBER"] = matchData.heatNo;
                            obj["LANE NUMBER"] = mainData.laneNo;
                            // obj["SFA ID"] = mainData.athleteId.sfaId;
                            if (mainData.id) {
                                obj["TEAM ID"] = matchData.opponentsTeam[i].teamId;
                                obj["NAME"] = matchData.opponentsTeam[i].name;
                                obj["SCHOOL"] = matchData.opponentsTeam[i].schoolName;
                                i++;
                            } else {
                                obj["TEAM ID"] = "";
                                obj["NAME"] = "";
                                obj["SCHOOL"] = "";
                            }


                            if (mainData.time) {
                                obj["TIMING"] = mainData.time;
                            } else {
                                if (!_.isEmpty(obj["TEAM ID"])) {
                                    obj["TIMING"] = "-";
                                } else {
                                    obj["TIMING"] = "";
                                }
                            }
                            if (mainData.result) {
                                obj["RESULT"] = mainData.result;
                            } else {
                                if (!_.isEmpty(obj["TEAM ID"])) {
                                    obj["RESULT"] = "-";
                                } else {
                                    obj["RESULT"] = "";
                                }
                            }
                            callback(null, obj);
                        },
                        function (err, singleData) {
                            callback(null, singleData);
                        });
                } else {
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
                    obj["LANE NUMBER"] = "";
                    obj["TEAM ID"] = "";
                    obj["NAME"] = "";
                    obj["SCHOOL"] = "";
                    obj["TIMING"] = " ";
                    obj["RESULT"] = "";
                }
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
                    if (data.resultType == "direct-final") {
                        Match.generateDirectFinal(match, function (err, singleData) {
                            Config.generateExcel("QualifyingRoundIndividual", singleData, res);
                        });
                    } else {
                        Match.generateExcelQualifyingRoundIndividual(match, function (err, singleData) {
                            Config.generateExcel("QualifyingRoundIndividual", singleData, res);
                        });
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

    generateExcelQualifyingRoundIndividual: function (match, callback) {
        async.concatSeries(match, function (mainData, callback) {
                var obj = {};
                obj["MATCH ID"] = mainData.matchId;
                obj["ROUND"] = mainData.round;
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
                        obj["NAME"] = mainData.opponentsSingle[0].athleteId.firstName + " " + mainData.opponentsSingle[0].athleteId.middleName + " " + mainData.opponentsSingle[0].athleteId.surname;
                    } else {
                        obj["NAME"] = mainData.opponentsSingle[0].athleteId.firstName + " " + mainData.opponentsSingle[0].athleteId.surname;
                    }
                    obj["SCHOOL"] = mainData.opponentsSingle[0].athleteId.school.name;
                    if (mainData.resultQualifyingRound) {
                        if (mainData.resultQualifyingRound.player.attempt[0]) {
                            obj["ATTEMPT 1"] = mainData.resultQualifyingRound.player.attempt[0];
                        } else {
                            obj["ATTEMPT 1"] = "";
                        }
                        if (mainData.resultQualifyingRound.player.attempt[1]) {
                            obj["ATTEMPT 2"] = mainData.resultQualifyingRound.player.attempt[1];
                        } else {
                            obj["ATTEMPT 2"] = "";
                        }
                        if (mainData.resultQualifyingRound.player.attempt[2]) {
                            obj["ATTEMPT 3"] = mainData.resultQualifyingRound.player.attempt[2];
                        } else {
                            obj["ATTEMPT 3"] = "";
                        }
                        if (mainData.resultQualifyingRound.player.bestAttempt) {
                            obj["BEST ATTEMPT"] = mainData.resultQualifyingRound.player.bestAttempt;
                        } else {
                            obj["BEST ATTEMPT"] = "";
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
                        obj["BEST ATTEMPT"] = "";
                        obj["RESULT"] = "";
                    }
                } else {
                    obj["SFA ID"] = "";
                    obj["NAME"] = "";
                    obj["SCHOOL"] = "";
                    obj["ATTEMPT 1"] = "";
                    obj["ATTEMPT 2"] = "";
                    obj["ATTEMPT 3"] = "";
                    obj["BEST ATTEMPT"] = "";
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
                                    obj["FINAL SCORE"] = mainData.resultQualifyingRound.player.finalScore;
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
                            console.log("mainData.result", mainData.resultKnockout);
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
                                    if (!_.isEmpty(mainData.resultKnockout.winner)) {
                                        if (mainData.opponentsSingle[0].athleteId._id.equals(mainData.resultKnockout.winner.player)) {
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
                                        obj["WINNER NAME"] = "";
                                        obj["WINNER SFA ID "] = "";
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

    generateLeagueKnockout: function (data, res) {
        var i = 1;
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
                                callback(null, match);
                            }
                        }
                    });
                },
                function (match, callback) {
                    var prevRound;
                    var stage;
                    async.concatSeries(match, function (mainData, callback) {
                            var obj = {};
                            console.log("mainData*************", mainData.excelType);
                            obj["MATCH ID"] = mainData.matchId;
                            var dateTime = moment(mainData.scheduleDate).format('DD-MM-YYYY');
                            obj.DATE = dateTime;
                            obj.TIME = mainData.scheduleTime;
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
                            obj["STAGE"] = mainData.excelType;
                            stage = mainData.excelType.toLowerCase();
                            console.log("stage", stage);
                            obj["ROUND"] = mainData.round;
                            console.log("i----", i);
                            if (stage == "league") {
                                if (i == 1) {
                                    prevRound = mainData.round;
                                    obj["MATCH NO"] = "MATCH " + i++;
                                    console.log("i-1", i);
                                } else {
                                    console.log("prevRound", prevRound);
                                    if (prevRound == mainData.round) {
                                        obj["MATCH NO"] = "MATCH " + i++;
                                        // i = i++;
                                        console.log("i-2", i);
                                    } else {
                                        i = 1;
                                        prevRound = mainData.round;
                                        obj["MATCH NO"] = "MATCH " + i++;
                                        // i = i++;
                                        console.log("i-3", i);
                                    }
                                }
                            } else {
                                obj["MATCH NO"] = "";
                            }
                            if (mainData.opponentsTeam.length > 0) {
                                obj["TEAM 1"] = mainData.opponentsTeam[0].teamId;
                                obj["TEAM NAME 1"] = mainData.opponentsTeam[0].name;
                                obj["SCHOOL 1"] = mainData.opponentsTeam[0].schoolName;
                                // console.log(JSON.stringify(mainData.resultsCombat, null, "    "),"-------------");                                    
                                if (mainData.resultFootball) {
                                    obj["COACH NAME 1"] = mainData.resultFootball.teams[0].coach;
                                    obj["TEAM SPECIFIC DATA POINTS 1"] = "ShotsOnGoal:" + mainData.resultFootball.teams[0].teamResults.shotsOnGoal + ", TotalShots:" + mainData.resultFootball.teams[0].teamResults.totalShots + ", Corners:" + mainData.resultFootball.teams[0].teamResults.corners + ", Penalty:" + mainData.resultFootball.teams[0].teamResults.penalty + ", Saves:" + mainData.resultFootball.teams[0].teamResults.saves + ", Fouls:" + mainData.resultFootball.teams[0].teamResults.fouls + ", OffSide:" + mainData.resultFootball.teams[0].teamResults.offSide + ", CleanSheet:" + mainData.resultFootball.teams[0].teamResults.cleanSheet;
                                }
                            } else {
                                obj["TEAM 1"] = "";
                                obj["TEAM NAME 1"] = "";
                                obj["SCHOOL 1"] = "";
                                obj["COACH NAME 1"] = "";
                                obj["TEAM SPECIFIC DATA POINTS 1"] = "";

                            }

                            if (mainData.opponentsTeam.length > 1) {
                                obj["TEAM 2"] = mainData.opponentsTeam[1].teamId;
                                obj["TEAM NAME 2"] = mainData.opponentsTeam[0].name;
                                obj["SCHOOL 2"] = mainData.opponentsTeam[1].schoolName;
                                if (mainData.resultFootball) {
                                    console.log("opponentsTeam", mainData.opponentsTeam[0]);
                                    obj["COACH NAME 2"] = mainData.resultFootball.teams[1].coach;
                                    obj["TEAM SPECIFIC DATA POINTS 2"] = "ShotsOnGoal:" + mainData.resultFootball.teams[1].teamResults.shotsOnGoal + ", TotalShots:" + mainData.resultFootball.teams[1].teamResults.totalShots + ", Corners:" + mainData.resultFootball.teams[1].teamResults.corners + ", Penalty:" + mainData.resultFootball.teams[1].teamResults.penalty + ", Saves:" + mainData.resultFootball.teams[1].teamResults.saves + ", Fouls:" + mainData.resultFootball.teams[1].teamResults.fouls + ", OffSide:" + mainData.resultFootball.teams[1].teamResults.offSide + ", CleanSheet:" + mainData.resultFootball.teams[1].teamResults.cleanSheet;
                                    obj["FINAL SCORE"] = mainData.resultFootball.teams[0].teamResults.finalPoints + "-" + mainData.resultFootball.teams[1].teamResults.finalPoints;

                                    if (!_.isEmpty(mainData.resultFootball.winner) && mainData.resultFootball.isNoMatch == false || mainData.resultFootball.isDraw == false) {
                                        if (mainData.opponentsTeam[0]._id.equals(mainData.resultFootball.winner.player)) {
                                            obj["WINNER NAME"] = mainData.opponentsTeam[0].name;
                                            obj["WINNER TEAM ID"] = mainData.opponentsTeam[0].teamId;
                                        } else {
                                            obj["WINNER NAME"] = mainData.opponentsTeam[1].name;
                                            obj["WINNER TEAM ID"] = mainData.opponentsTeam[1].teamId;
                                        }
                                    } else {
                                        obj["WINNER NAME"] = "";
                                        obj["WINNER TEAM ID"] = "";
                                    }
                                    obj["VIDEO"] = "";
                                    obj["MATCH CENTER"] = "";
                                } else {
                                    obj["COACH NAME 1"] = "";
                                    obj["TEAM SPECIFIC DATA POINTS 1"] = "";
                                    obj["FINAL SCORE"] = "";
                                    obj["WINNER NAME"] = "";
                                    obj["WINNER TEAM ID"] = "";
                                    obj["VIDEO"] = "";
                                    obj["MATCH CENTER"] = "";
                                }
                            } else {
                                obj["TEAM 2"] = "";
                                obj["TEAM NAME 2"] = "";
                                obj["SCHOOL 2"] = "";
                                obj["COACH NAME 1"] = "";
                                obj["TEAM SPECIFIC DATA POINTS 1"] = "";
                                obj["FINAL SCORE"] = "";
                                obj["WINNER NAME"] = "";
                                obj["WINNER TEAM ID"] = "";
                                obj["VIDEO"] = "";
                                obj["MATCH CENTER"] = "";
                            }
                            // console.log(obj,"---------------------------");
                            callback(null, obj);

                        },
                        function (err, singleData) {
                            Config.generateExcel("KnockoutIndividual", singleData, res);
                            // callback(null, singleData);
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

    generateDirectFinal: function (match, callback) {
        async.concatSeries(match, function (mainData, callback) {
                var obj = {};
                obj["MATCH ID"] = mainData.matchId;
                obj["ROUND"] = mainData.round;
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
                        obj["NAME"] = mainData.opponentsSingle[0].athleteId.firstName + " " + mainData.opponentsSingle[0].athleteId.middleName + " " + mainData.opponentsSingle[0].athleteId.surname;
                    } else {
                        obj["NAME"] = mainData.opponentsSingle[0].athleteId.firstName + " " + mainData.opponentsSingle[0].athleteId.surname;
                    }
                    obj["SCHOOL"] = mainData.opponentsSingle[0].athleteId.school.name;
                    if (mainData.resultShooting) {
                        obj["LANE NUMBER"] = mainData.resultShooting.laneNo;
                        if (mainData.resultShooting.detail) {
                            obj["DETAIL NO."] = mainData.resultShooting.detail;
                        } else {
                            obj["DETAIL NO."] = "";
                        }

                        if (mainData.resultShooting.finalScore) {
                            obj["FINAL SCORE"] = mainData.resultShooting.finalScore;
                        } else {
                            obj["FINAL SCORE"] = "";
                        }
                        if (mainData.resultShooting.result) {
                            obj["RESULT"] = mainData.resultShooting.result;
                        } else {
                            obj["RESULT"] = "";
                        }
                    } else {
                        obj["DETAIL NO."] = "";
                        obj["FINAL SCORE"] = "";
                        obj["RESULT"] = "";
                    }
                } else {
                    obj["SFA ID"] = "";
                    obj["NAME"] = "";
                    obj["SCHOOL"] = "";
                    obj["DETAIL NO."] = "";
                    obj["FINAL SCORE"] = "";
                    obj["RESULT"] = "";
                }
                callback(null, obj);

            },
            function (err, singleData) {
                // Config.generateExcel("KnockoutIndividual", singleData, res);
                callback(null, singleData);
            });

    },

    generateExcelSwiss: function (data, res) {
        var i = 1;
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
                            var dateTime = moment(mainData.scheduleDate).format('DD-MM-YYYY');
                            obj.DATE = dateTime;
                            obj.TIME = mainData.scheduleTime;
                            if (mainData.opponentsSingle.length > 0) {
                                obj["SFAID 1"] = mainData.opponentsSingle[0].athleteId.sfaId;
                                if (mainData.opponentsSingle[0].athleteId.middleName) {
                                    obj["NAME 1"] = mainData.opponentsSingle[0].athleteId.firstName + " " + mainData.opponentsSingle[0].athleteId.middleName + " " + mainData.opponentsSingle[0].athleteId.surname;
                                } else {
                                    obj["NAME 1"] = mainData.opponentsSingle[0].athleteId.firstName + " " + mainData.opponentsSingle[0].athleteId.surname;
                                }
                                obj["SCHOOL 1"] = mainData.opponentsSingle[0].athleteId.school.name;
                            } else {
                                obj["SFAID 1"] = "";
                                obj["NAME 1"] = "";
                                obj["SCHOOL 1"] = "";
                                obj["RESULT 1"] = "";
                                obj["SCORE 1"] = "";
                                obj["DATA POINTS 1"] = "";
                            }
                            if (mainData.opponentsSingle.length > 1) {
                                obj["SFAID 2"] = mainData.opponentsSingle[1].athleteId.sfaId;

                                if (mainData.opponentsSingle[1].athleteId.middleName) {
                                    obj["NAME 2"] = mainData.opponentsSingle[1].athleteId.firstName + " " + mainData.opponentsSingle[1].athleteId.middleName + " " + mainData.opponentsSingle[1].athleteId.surname;
                                } else {
                                    obj["NAME 2"] = mainData.opponentsSingle[1].athleteId.firstName + " " + mainData.opponentsSingle[1].athleteId.surname;
                                }
                                obj["SCHOOL 2"] = mainData.opponentsSingle[1].athleteId.school.name;
                            } else {
                                obj["SFAID 2"] = "";
                                obj["PARTICIPANT 2"] = "";
                                obj["SCHOOL 2"] = "";
                            }
                            if (mainData.resultSwiss) {
                                if (mainData.resultSwiss.players.length == 2) {
                                    obj["P1 SCORE"] = mainData.resultSwiss.players[0].score;
                                    obj["P2 SCORE"] = mainData.resultSwiss.players[1].score;
                                    obj["P1 RANK"] = mainData.resultSwiss.players[0].rank;
                                    obj["P2 RANK"] = mainData.resultSwiss.players[1].score;
                                } else {
                                    obj["P1 SCORE"] = mainData.resultSwiss.players[0].score;
                                    obj["P2 SCORE"] = "";
                                    obj["P1 RANK"] = mainData.resultSwiss.players[0].rank;
                                    obj["P2 RANK"] = "";
                                }
                                if (!_.isEmpty(mainData.resultSwiss.winner)) {
                                    if (mainData.opponentsSingle[0].equals(mainData.resultSwiss.winner.player)) {
                                        obj["WINNER NAME"] = obj["NAME 1"];
                                        obj["WINNER SFAID"] = mainData.opponentsSingle[0].athleteId.sfaId;
                                    } else {
                                        obj["WINNER NAME"] = obj["NAME 2"];
                                        obj["WINNER SFAID"] = mainData.opponentsSingle[1].athleteId.sfaId;
                                    }
                                } else {
                                    obj["WINNER NAME"] = "";
                                    obj["WINNER SFAID"] = "";
                                }
                            } else {
                                obj["P1 SCORE"] = "";
                                obj["P2 SCORE"] = "";
                                obj["P1 RANK"] = "";
                                obj["P2 RANK"] = "";
                                obj["WINNER NAME"] = "";
                                obj["WINNER SFAID"] = "";
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
                        callback(null, excelData);
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
                    } else if (data.resultVolleyball) {
                        var matchObj = {
                            $set: {
                                resultVolleyball: data.resultVolleyball
                            }
                        };
                        callback(null, matchObj);
                    } else if (data.resultBasketball) {
                        var matchObj = {
                            $set: {
                                resultBasketball: data.resultBasketball
                            }
                        };
                        callback(null, matchObj);
                    } else if (data.resultHockey) {
                        var matchObj = {
                            $set: {
                                resultHockey: data.resultHockey
                            }
                        };
                        callback(null, matchObj);
                    } else if (data.resultHandball) {
                        var matchObj = {
                            $set: {
                                resultHandball: data.resultHandball
                            }
                        };
                        callback(null, matchObj);
                    } else if (data.resultKabaddi) {
                        var matchObj = {
                            $set: {
                                resultKabaddi: data.resultKabaddi
                            }
                        };
                        callback(null, matchObj);
                    } else if (data.resultWaterPolo) {
                        var matchObj = {
                            $set: {
                                resultWaterPolo: data.resultWaterPolo
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
                                console.log("data.isTeam", data.isNoMatch);
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
                        var foundLength = found.length;
                        if (data.found.round == "Semi Final" && foundLength == 2) {
                            if (data.isTeam == false && _.isEmpty(found[0].opponentsSingle) && _.isEmpty(found[1].opponentsSingle)) {
                                // console.log("inside found", data.found.resultsCombat.status);
                                if (data.found.resultsCombat && data.found.resultsCombat.status == 'IsCompleted' && data.found.resultsCombat.isNoMatch == false) {
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
                                } else if (data.found.resultsRacquet && data.found.resultsRacquet.status == 'IsCompleted' && data.found.resultsRacquet.isNoMatch == false) {
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
                                } else {
                                    callback(null, data.found);
                                }


                            } else if (data.isTeam == false && !_.isEmpty(found[0].opponentsSingle) && !_.isEmpty(found[1].opponentsSingle)) {
                                if (found[0].opponentsSingle.length == 1 && found[1].opponentsSingle.length == 1) {
                                    var playerId = found[0].opponentsSingle[0];
                                    var playerId1 = found[1].opponentsSingle[0];
                                    winPlayer.push(playerId);
                                    lostPlayer.push(playerId1);
                                    if (data.found.resultsCombat && data.found.resultsCombat.status == 'IsCompleted' && data.found.resultsCombat.isNoMatch == false) {
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
                                    } else if (data.found.resultsRacquet && data.found.resultsRacquet.status == 'IsCompleted' && data.found.resultsRacquet.isNoMatch == false) {
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
                                    } else {
                                        callback(null, data.found);
                                    }

                                } else {
                                    updateObj = {};
                                }
                            } else if (data.isTeam == true && _.isEmpty(found[0].opponentsTeam) && _.isEmpty(found[1].opponentsTeam)) {
                                // console.log("inside found", data.found.resultsCombat.status);
                                if (data.found.resultsRacquet && data.found.resultsRacquet.status == 'IsCompleted' && data.found.resultsRacquet.isNoMatch == false) {
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
                                            opponentsTeam: winPlayer
                                        }
                                    };
                                    updateObj1 = {
                                        $set: {
                                            opponentsTeam: lostPlayer
                                        }
                                    };
                                } else if (data.found.resultVolleyball && data.found.resultVolleyball.status == 'IsCompleted' && data.found.resultVolleyball.isNoMatch == false) {
                                    if (data.found.opponentsTeam[0].equals(data.found.resultVolleyball.winner.player)) {
                                        lostPlayer.push(data.found.opponentsTeam[1]);
                                        winPlayer.push(data.found.resultVolleyball.winner.player);
                                        console.log("player", winPlayer);
                                    } else {
                                        lostPlayer.push(data.found.opponentsTeam[0]);
                                        winPlayer.push(data.found.resultVolleyball.winner.player);
                                        console.log("player", winPlayer);
                                    }
                                    updateObj = {
                                        $set: {
                                            opponentsTeam: winPlayer
                                        }
                                    };
                                    updateObj1 = {
                                        $set: {
                                            opponentsTeam: lostPlayer
                                        }
                                    };
                                } else if (data.found.resultBasketball && data.found.resultBasketball.status == 'IsCompleted' && data.found.resultBasketball.isNoMatch == false) {
                                    if (data.found.opponentsTeam[0].equals(data.found.resultBasketball.winner.player)) {
                                        lostPlayer.push(data.found.opponentsTeam[1]);
                                        winPlayer.push(data.found.resultBasketball.winner.player);
                                        console.log("player", winPlayer);
                                    } else {
                                        lostPlayer.push(data.found.opponentsTeam[0]);
                                        winPlayer.push(data.found.resultBasketball.winner.player);
                                        console.log("player", winPlayer);
                                    }
                                    updateObj = {
                                        $set: {
                                            opponentsTeam: winPlayer
                                        }
                                    };
                                    updateObj1 = {
                                        $set: {
                                            opponentsTeam: lostPlayer
                                        }
                                    };
                                } else if (data.found.resultHockey && data.found.resultHockey.status == 'IsCompleted' && data.found.resultHockey.isNoMatch == false) {
                                    if (data.found.opponentsTeam[0].equals(data.found.resultHockey.winner.player)) {
                                        lostPlayer.push(data.found.opponentsTeam[1]);
                                        winPlayer.push(data.found.resultHockey.winner.player);
                                        console.log("player", winPlayer);
                                    } else {
                                        lostPlayer.push(data.found.opponentsTeam[0]);
                                        winPlayer.push(data.found.resultHockey.winner.player);
                                        console.log("player", winPlayer);
                                    }
                                    updateObj = {
                                        $set: {
                                            opponentsTeam: winPlayer
                                        }
                                    };
                                    updateObj1 = {
                                        $set: {
                                            opponentsTeam: lostPlayer
                                        }
                                    };
                                } else if (data.found.resultWaterPolo && data.found.resultWaterPolo.status == 'IsCompleted' && data.found.resultWaterPolo.isNoMatch == false) {
                                    if (data.found.opponentsTeam[0].equals(data.found.resultWaterPolo.winner.player)) {
                                        lostPlayer.push(data.found.opponentsTeam[1]);
                                        winPlayer.push(data.found.resultWaterPolo.winner.player);
                                        console.log("player", winPlayer);
                                    } else {
                                        lostPlayer.push(data.found.opponentsTeam[0]);
                                        winPlayer.push(data.found.resultWaterPolo.winner.player);
                                        console.log("player", winPlayer);
                                    }
                                    updateObj = {
                                        $set: {
                                            opponentsTeam: winPlayer
                                        }
                                    };
                                    updateObj1 = {
                                        $set: {
                                            opponentsTeam: lostPlayer
                                        }
                                    };
                                }else {
                                    callback(null, data.found);
                                }
                            } else if (data.isTeam == true && !_.isEmpty(found[0].opponentsTeam) && !_.isEmpty(found[1].opponentsTeam)) {
                                if (found[0].opponentsTeam.length == 1 && found[1].opponentsTeam.length == 1) {
                                    var playerId = found[0].opponentsTeam[0];
                                    var playerId1 = found[1].opponentsTeam[0];
                                    winPlayer.push(playerId);
                                    lostPlayer.push(playerId1);
                                    if (data.found.resultsRacquet && data.found.resultsRacquet.status == 'IsCompleted' && data.found.resultsRacquet.isNoMatch == false) {
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
                                                opponentsTeam: winPlayer
                                            }
                                        };
                                        updateObj1 = {
                                            $set: {
                                                opponentsTeam: lostPlayer
                                            }
                                        };
                                    } else if (data.found.resultVolleyball && data.found.resultVolleyball.status == 'IsCompleted' && data.found.resultVolleyball.isNoMatch == false) {
                                        if (data.found.opponentsTeam[0].equals(data.found.resultVolleyball.winner.player)) {
                                            lostPlayer.push(data.found.opponentsTeam[1]);
                                            winPlayer.push(data.found.resultVolleyball.winner.player);
                                            console.log("player", winPlayer);
                                        } else {
                                            lostPlayer.push(data.found.opponentsTeam[0]);
                                            winPlayer.push(data.found.resultVolleyball.winner.player);
                                            console.log("player", winPlayer);
                                        }
                                        updateObj = {
                                            $set: {
                                                opponentsTeam: winPlayer
                                            }
                                        };
                                        updateObj1 = {
                                            $set: {
                                                opponentsTeam: lostPlayer
                                            }
                                        };
                                    } else if (data.found.resultBasketball && data.found.resultBasketball.status == 'IsCompleted' && data.found.resultBasketball.isNoMatch == false) {
                                        if (data.found.opponentsTeam[0].equals(data.found.resultBasketball.winner.player)) {
                                            lostPlayer.push(data.found.opponentsTeam[1]);
                                            winPlayer.push(data.found.resultBasketball.winner.player);
                                            console.log("player", winPlayer);
                                        } else {
                                            lostPlayer.push(data.found.opponentsTeam[0]);
                                            winPlayer.push(data.found.resultBasketball.winner.player);
                                            console.log("player", winPlayer);
                                        }
                                        updateObj = {
                                            $set: {
                                                opponentsTeam: winPlayer
                                            }
                                        };
                                        updateObj1 = {
                                            $set: {
                                                opponentsTeam: lostPlayer
                                            }
                                        };
                                    } else if (data.found.resultHockey && data.found.resultHockey.status == 'IsCompleted' && data.found.resultHockey.isNoMatch == false) {
                                        if (data.found.opponentsTeam[0].equals(data.found.resultHockey.winner.player)) {
                                            lostPlayer.push(data.found.opponentsTeam[1]);
                                            winPlayer.push(data.found.resultHockey.winner.player);
                                            console.log("player", winPlayer);
                                        } else {
                                            lostPlayer.push(data.found.opponentsTeam[0]);
                                            winPlayer.push(data.found.resultHockey.winner.player);
                                            console.log("player", winPlayer);
                                        }
                                        updateObj = {
                                            $set: {
                                                opponentsTeam: winPlayer
                                            }
                                        };
                                        updateObj1 = {
                                            $set: {
                                                opponentsTeam: lostPlayer
                                            }
                                        };
                                    } else if (data.found.resultWaterPolo && data.found.resultWaterPolo.status == 'IsCompleted' && data.found.resultWaterPolo.isNoMatch == false) {
                                        if (data.found.opponentsTeam[0].equals(data.found.resultWaterPolo.winner.player)) {
                                            lostPlayer.push(data.found.opponentsTeam[1]);
                                            winPlayer.push(data.found.resultWaterPolo.winner.player);
                                            console.log("player", winPlayer);
                                        } else {
                                            lostPlayer.push(data.found.opponentsTeam[0]);
                                            winPlayer.push(data.found.resultWaterPolo.winner.player);
                                            console.log("player", winPlayer);
                                        }
                                        updateObj = {
                                            $set: {
                                                opponentsTeam: winPlayer
                                            }
                                        };
                                        updateObj1 = {
                                            $set: {
                                                opponentsTeam: lostPlayer
                                            }
                                        };
                                    }else {
                                        callback(null, data.found);
                                    }
                                } else {
                                    updateObj = {};
                                }
                            }
                        } else {
                            console.log("in found", found, "data", data);
                            if (data.isTeam == false && _.isEmpty(found[0].opponentsSingle)) {
                                if (data.found.resultsCombat && data.found.resultsCombat.status == 'IsCompleted' && data.found.resultsCombat.isNoMatch == false) {
                                    winPlayer.push(data.found.resultsCombat.winner.opponentsSingle);
                                    updateObj = {
                                        $set: {
                                            opponentsSingle: winPlayer
                                        }
                                    };
                                } else if (data.found.resultsRacquet && data.found.resultsRacquet.status == 'IsCompleted' && data.found.resultsRacquet.isNoMatch == false) {
                                    winPlayer.push(data.found.resultsRacquet.winner.opponentsSingle);
                                    console.log("player", winPlayer);
                                    updateObj = {
                                        $set: {
                                            opponentsSingle: winPlayer
                                        }
                                    };
                                } else {
                                    callback(null, data.found);
                                }
                            } else if (data.isTeam == false && !_.isEmpty(found[0].opponentsSingle)) {
                                console.log("updating match", data.found);
                                if (found[0].opponentsSingle.length == 1) {
                                    var playerId = found[0].opponentsSingle[0];
                                    winPlayer.push(playerId);
                                    if (data.found.resultsCombat && data.found.resultsCombat.status == 'IsCompleted' && data.found.resultsCombat.isNoMatch == false) {
                                        winPlayer.push(data.found.resultsCombat.winner.opponentsSingle);
                                        console.log("player", winPlayer);
                                        updateObj = {
                                            $set: {
                                                opponentsSingle: winPlayer
                                            }
                                        };
                                    } else if (data.found.resultsRacquet && data.found.resultsRacquet.status == "IsCompleted" && data.found.resultsRacquet.isNoMatch == false) {
                                        winPlayer.push(data.found.resultsRacquet.winner.opponentsSingle);
                                        console.log("player", winPlayer);
                                        updateObj = {
                                            $set: {
                                                opponentsSingle: winPlayer
                                            }
                                        };
                                    } else {
                                        callback(null, data.found);
                                    }
                                } else {
                                    updateObj = {};
                                }
                            } else if (data.isTeam == true && _.isEmpty(found[0].opponentsTeam)) {
                                if (data.found.resultsRacquet && data.found.resultsRacquet.status == 'IsCompleted' && data.found.resultsRacquet.isNoMatch == false) {
                                    winPlayer.push(data.found.resultsRacquet.winner.player);
                                    console.log("player", winPlayer);
                                    updateObj = {
                                        $set: {
                                            opponentsTeam: winPlayer
                                        }
                                    };
                                } else if (data.found.resultVolleyball && data.found.resultVolleyball.status == 'IsCompleted' && data.found.resultVolleyball.isNoMatch == false) {
                                    winPlayer.push(data.found.resultVolleyball.winner.player);
                                    console.log("player", winPlayer);
                                    updateObj = {
                                        $set: {
                                            opponentsTeam: winPlayer
                                        }
                                    };
                                } else if (data.found.resultBasketball && data.found.resultBasketball.status == 'IsCompleted' && data.found.resultBasketball.isNoMatch == false) {
                                    winPlayer.push(data.found.resultBasketball.winner.player);
                                    console.log("player", winPlayer);
                                    updateObj = {
                                        $set: {
                                            opponentsTeam: winPlayer
                                        }
                                    };
                                } else if (data.found.resultHockey && data.found.resultHockey.status == 'IsCompleted' && data.found.resultHockey.isNoMatch == false) {
                                    winPlayer.push(data.found.resultHockey.winner.player);
                                    console.log("player", winPlayer);
                                    updateObj = {
                                        $set: {
                                            opponentsTeam: winPlayer
                                        }
                                    };
                                }else if (data.found.resultWaterPolo && data.found.resultWaterPolo.status == 'IsCompleted' && data.found.resultWaterPolo.isNoMatch == false) {
                                    winPlayer.push(data.found.resultWaterPolo.winner.player);
                                    console.log("player", winPlayer);
                                    updateObj = {
                                        $set: {
                                            opponentsTeam: winPlayer
                                        }
                                    };
                                } else {
                                    callback(null, data.found);
                                }
                            } else if (data.isTeam == true && !_.isEmpty(found[0].opponentsTeam)) {
                                console.log("updating match", data.found);
                                if (found[0].opponentsTeam.length == 1) {
                                    var playerId = found[0].opponentsTeam[0];
                                    winPlayer.push(playerId);
                                    if (data.found.resultsRacquet && data.found.resultsRacquet.status == "IsCompleted" && data.found.resultsRacquet.isNoMatch == false) {
                                        winPlayer.push(data.found.resultsRacquet.winner.player);
                                        console.log("player", winPlayer);
                                        updateObj = {
                                            $set: {
                                                opponentsTeam: winPlayer
                                            }
                                        };
                                    } else if (data.found.resultVolleyball && data.found.resultVolleyball.status == "IsCompleted" && data.found.resultVolleyball.isNoMatch == false) {
                                        winPlayer.push(data.found.resultVolleyball.winner.player);
                                        console.log("player", winPlayer);
                                        updateObj = {
                                            $set: {
                                                opponentsTeam: winPlayer
                                            }
                                        };
                                    } else if (data.found.resultBasketball && data.found.resultBasketball.status == "IsCompleted" && data.found.resultBasketball.isNoMatch == false) {
                                        winPlayer.push(data.found.resultBasketball.winner.player);
                                        console.log("player", winPlayer);
                                        updateObj = {
                                            $set: {
                                                opponentsTeam: winPlayer
                                            }
                                        };
                                    } else if (data.found.resultHockey && data.found.resultHockey.status == "IsCompleted" && data.found.resultHockey.isNoMatch == false) {
                                        winPlayer.push(data.found.resultHockey.winner.player);
                                        console.log("player", winPlayer);
                                        updateObj = {
                                            $set: {
                                                opponentsTeam: winPlayer
                                            }
                                        };
                                    }else if (data.found.resultWaterPolo && data.found.resultWaterPolo.status == "IsCompleted" && data.found.resultWaterPolo.isNoMatch == false) {
                                        winPlayer.push(data.found.resultWaterPolo.winner.player);
                                        console.log("player", winPlayer);
                                        updateObj = {
                                            $set: {
                                                opponentsTeam: winPlayer
                                            }
                                        };
                                    } else {
                                        callback(null, data.found);
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
                                                        callback(null, singleData);
                                                    } else {
                                                        if (_.isEmpty(singleData["SFA ID"])) {
                                                            callback(null, singleData);
                                                        } else {
                                                            var param = {};
                                                            param.participant = singleData["SFA ID"];
                                                            param.sport = singleData.SPORT;
                                                            Match.getAthleteId(param, function (err, complete) {
                                                                if (err || _.isEmpty(complete)) {
                                                                    singleData["NAME"] = null;
                                                                    err = "SFA ID may have wrong values";
                                                                    // console.log("err found");
                                                                    callback(null, {
                                                                        error: err,
                                                                        success: singleData
                                                                    });
                                                                } else {
                                                                    singleData["NAME"] = complete._id;
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
                                                paramData.round = n.success["ROUND"];
                                                if (!_.isEmpty(n.success["NAME"])) {
                                                    paramData.opponentsSingle.push(n.success["NAME"]);
                                                    player.id = n.success["NAME"];
                                                    if (n.success["TIMING"]) {
                                                        player.time = n.success["TIMING"];
                                                    }
                                                    if (n.success["RESULT"]) {
                                                        player.result = n.success["RESULT"];
                                                    }
                                                    // player.result = n.success["RESULT"];
                                                    player.laneNo = n.success["LANE NUMBER"];
                                                    result.players.push(player);
                                                } else {
                                                    player.laneNo = n.success["LANE NUMBER"];
                                                    result.players.push(player);
                                                }
                                                paramData.sport = n.success.SPORT;
                                                paramData.scheduleDate = moment(n.success.DATE).format();
                                                paramData.scheduleTime = n.success.TIME;
                                                if (!_.isEmpty(result)) {
                                                    paramData.resultHeat = result;
                                                }
                                                callback(null, paramData);
                                            }
                                        }, function (err, n) {
                                            if (countError != 0) {
                                                countError++;
                                                callback(null, n);
                                            } else {
                                                console.log("param", paramData);
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
                                                    singleData["NAME"] = null;
                                                    err = "SFA ID may have wrong values";
                                                    callback(null, {
                                                        error: err,
                                                        success: singleData
                                                    });
                                                } else {
                                                    singleData["NAME"] = complete._id;
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
                                        if (_.isEmpty(singleData["NAME"])) {
                                            paramData.opponentsSingle = "";
                                        } else {
                                            paramData.opponentsSingle.push(singleData["NAME"]);
                                            player.id = singleData["NAME"];
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
                                        if (singleData["BEST ATTEMPT"]) {
                                            player.bestAttempt = singleData["BEST ATTEMPT"];
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
                                                        callback(null, singleData);
                                                    } else {
                                                        if (_.isEmpty(singleData["TEAM ID"])) {
                                                            callback(null, singleData);
                                                        } else {
                                                            var param = {};
                                                            param.team = singleData["TEAM ID"];
                                                            param.sport = singleData.SPORT;
                                                            Match.getTeamId(param, function (err, complete) {
                                                                if (err || _.isEmpty(complete)) {
                                                                    singleData["NAME"] = null;
                                                                    err = "TEAM ID may have wrong values";
                                                                    console.log("err found");
                                                                    callback(null, {
                                                                        error: err,
                                                                        success: singleData
                                                                    });
                                                                } else {
                                                                    singleData["NAME"] = complete._id;
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
                                                paramData.round = n.success["ROUND"];
                                                if (!_.isEmpty(n.success["NAME"])) {
                                                    paramData.opponentsTeam.push(n.success["NAME"]);
                                                    player.id = n.success["NAME"];
                                                    if (n.success["TIMING"]) {
                                                        player.time = n.success["TIMING"];
                                                    }
                                                    if (n.success["RESULT"]) {
                                                        player.result = n.success["RESULT"];
                                                    }
                                                    player.laneNo = n.success["LANE NUMBER"];
                                                    result.players.push(player);
                                                }
                                                console.log(paramData.opponentsSingle);
                                                paramData.sport = n.success.SPORT;
                                                paramData.scheduleDate = moment(n.success.DATE).format();
                                                paramData.scheduleTime = n.success.TIME;
                                                if (!_.isEmpty(result)) {
                                                    paramData.resultHeat = result;
                                                }
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
                                        // player.rank = [];
                                        resultData.video = [];
                                        resultData.matchCenter = [];
                                        if (singleData["SCORE - ROUND 1"]) {
                                            player.attempt.push(singleData["SCORE - ROUND 1"]);
                                        }
                                        if (singleData["SCORE - ROUND 2"]) {
                                            player.attempt.push(singleData["SCORE - ROUND 2"]);
                                        }
                                        if (singleData["FINAL SCORE"]) {
                                            player.finalScore = singleData["FINAL SCORE"];
                                        }
                                        if (singleData["RANK"]) {
                                            player.rank = singleData["RANK"];
                                        }
                                        if (singleData["Video"]) {
                                            resultData.video.push(singleData["Video"]);
                                        }
                                        if (singleData["MatchCenter"]) {
                                            resultData.matchCenter.push(singleData["MatchCenter"]);
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
        var updateObj = {};
        var updateObj1 = {};
        var countError = 0;
        async.concatSeries(importData, function (singleData, callback) {
            var result = {};
            result.players = [];
            result.winner = {};
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
                                        singleData["PARTICIPANT 1"] = complete._id;
                                        console.log("complete", complete);
                                        singleData.playerId1 = complete.athleteId;
                                        var info = {};
                                        info.playerId = singleData["PARTICIPANT 1"];
                                        info.noShow = false;
                                        info.walkover = false;
                                        result.players.push(info);
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
                                        singleData.playerId2 = complete.athleteId;
                                        var info = {};
                                        info.playerId2 = singleData["PARTICIPANT 2"];
                                        info.noShow = false;
                                        info.walkover = false;
                                        result.players.push(info);
                                        console.log("result", result);
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
                                    var winner = {};
                                    winner.player = singleData.playerId1;
                                    console.log("playerId1", singleData.playerId1);
                                    winner.opponentsSingle = singleData["PARTICIPANT 1"];
                                    result.winner = winner;
                                    result.status = 'IsCompleted';
                                } else if (singleData["SFAID 2"] === singleData["WINNER SFA ID "]) {
                                    var winner = {};
                                    winner = {};
                                    console.log("playerId2", singleData.playerId2);
                                    winner.player = singleData.playerId2;
                                    winner.opponentsSingle = singleData["PARTICIPANT 2"];
                                    result.winner = winner;
                                    result.status = 'IsCompleted';
                                } else {
                                    result.status = 'isLive';
                                }
                                callback(null, singleData);
                            }
                        }
                    },
                    function (singleData, callback) {
                        if (singleData.error) {
                            countError++;
                            callback(null, singleData);
                        } else {
                            var paramData = {};
                            paramData.opponentsSingle = [];
                            paramData.matchId = singleData["MATCH ID"];
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
                            console.log("***result***", result);
                            paramData.resultKnockout = result;
                            Match.update({
                                matchId: paramData.matchId
                            }, paramData).exec(
                                function (err, complete) {
                                    if (err || _.isEmpty(complete)) {
                                        callback(null, {
                                            error: err,
                                            success: singleData
                                        });
                                    } else {
                                        callback(null, singleData);
                                    }
                                });
                        }
                    }
                ],
                function (err, results) {
                    callback(null, results);
                });
        }, function (err, singleData) {
            callback(null, singleData);
        });


    },

    updateDirectFinal: function (importData, data, callback) {
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
                                                    singleData["NAME"] = null;
                                                    err = "SFA ID may have wrong values";
                                                    callback(null, {
                                                        error: err,
                                                        success: singleData
                                                    });
                                                } else {
                                                    singleData["NAME"] = complete._id;
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
                                        if (_.isEmpty(singleData["NAME"])) {
                                            paramData.opponentsSingle = "";
                                        } else {
                                            paramData.opponentsSingle.push(singleData["NAME"]);
                                            // player.id = singleData["NAME"];
                                        }
                                        // player.attempt = [];
                                        player.laneNo = singleData["LANE NUMBER"];
                                        if (singleData["DETAIL NO."]) {
                                            player.detail = singleData["DETAIL NO."];
                                        }
                                        if (singleData["FINAL SCORE"]) {
                                            player.finalScore = singleData["FINAL SCORE"];
                                        }
                                        if (singleData["RESULT"]) {
                                            if (singleData["RESULT"] == "noShow" || singleData["RESULT"] == "NOSHOW" || singleData["RESULT"] == "NoShow") {
                                                player.noShow = "true";
                                            } else {
                                                player.noShow = "false";
                                                player.result = singleData["RESULT"];
                                            }
                                        }
                                        // resultData.player = player;
                                        paramData.resultShooting = player;
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

    updateKnockoutFootball: function (data, callback) {
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
                                        paramData.age = singleData["AGE GROUP"];
                                        if (singleData.GENDER == "Boys" || singleData.GENDER == "Male" || singleData.GENDER == "male") {
                                            paramData.gender = "male";
                                        } else if (singleData.GENDER == "Girls" || singleData.GENDER == "Female" || singleData.GENDER == "female") {
                                            paramData.gender = "female";
                                        }
                                        if (_.isEmpty(singleData["WEIGHT CATEGORIES"])) {
                                            paramData.weight = undefined;
                                        } else {
                                            var weight = singleData["WEIGHT CATEGORIES"];
                                            paramData.weight = _.trimStart(weight, " ");
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
                                        if (singleData.error) {
                                            countError++;
                                            callback(null, singleData);
                                        } else {
                                            if (_.isEmpty(singleData["TEAM 1"])) {
                                                callback(null, singleData);
                                            } else {
                                                console.log("singleData1", singleData);
                                                var paramData = {};
                                                paramData.team = singleData["TEAM 1"];
                                                paramData.sport = singleData.SPORT;
                                                Match.getTeamId(paramData, function (err, complete) {
                                                    if (err || _.isEmpty(complete)) {
                                                        singleData["TEAM NAME 1"] = null;
                                                        err = "TEAM 1 may have wrong values";
                                                        callback(null, {
                                                            error: err,
                                                            success: singleData
                                                        });
                                                    } else {
                                                        singleData["TEAM NAME 1"] = complete._id;
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
                                            if (_.isEmpty(singleData["TEAM 2"])) {
                                                console.log("inside sfa");
                                                callback(null, singleData);
                                            } else {
                                                var paramData = {};
                                                paramData.team = singleData["TEAM 2"];
                                                paramData.sport = singleData.SPORT;
                                                Match.getTeamId(paramData, function (err, complete) {
                                                    if (err || _.isEmpty(complete)) {
                                                        singleData["TEAM NAME 2"] = null;
                                                        err = "TEAM 2 may have wrong values";
                                                        callback(err, null);
                                                    } else {
                                                        singleData["TEAM NAME 2"] = complete._id;
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
                                            var excelType = singleData["STAGE"].toLowerCase();
                                            if (excelType == 'knockout') {
                                                var paramData = {};
                                                paramData.opponentsTeam = [];
                                                paramData.matchId = singleData["MATCH ID"];
                                                // paramData.matchId = data.matchId;
                                                paramData.round = singleData["ROUND"];
                                                if (_.isEmpty(singleData["TEAM NAME 1"]) || _.isEmpty(singleData["TEAM NAME 2"])) {
                                                    paramData.opponentsTeam = "";
                                                } else if (_.isEmpty(singleData["TEAM NAME 1"])) {
                                                    paramData.opponentsSingle.push(singleData["TEAM NAME 2"]);
                                                } else if (_.isEmpty(singleData["TEAM NAME 2"])) {
                                                    paramData.opponentsSingle.push(singleData["TEAM NAME 1"]);
                                                } else {
                                                    paramData.opponentsTeam.push(singleData["TEAM NAME 1"]);
                                                    paramData.opponentsTeam.push(singleData["TEAM NAME 2"]);
                                                }
                                                paramData.sport = singleData.SPORT;
                                                paramData.scheduleDate = singleData.DATE;
                                                paramData.scheduleTime = singleData.TIME;
                                                paramData.excelType = singleData["STAGE"];
                                                Match.update({
                                                    matchId: paramData.matchId
                                                }, paramData).exec(
                                                    function (err, complete) {
                                                        if (err || _.isEmpty(complete)) {
                                                            callback(null, {
                                                                error: err,
                                                                success: singleData
                                                            });
                                                        } else {
                                                            callback(null, singleData);
                                                        }
                                                    });
                                            } else {

                                            }
                                            callback(null, singleData);
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
                        function (err, singleData) {
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
                    console.log("singleData", singleData);
                    if (singleData.error) {
                        callback(null, singleData);
                    } else {
                        data.isLeagueKnockout = true;
                        data.sport = singleData[0].success.sport;
                        Match.addPreviousMatch(data, function (err, sportData) {
                            callback(null, singleData);
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
    },
    //update from digitalscore 
    updateFootball: function (data, callback) {
        var updateObj = {};
        var updateObj1 = {};
        async.waterfall([
                function (callback) {
                    var matchObj = {
                        $set: {
                            resultFootball: data.resultFootball
                        }
                    };
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
                                var type = found.excelType.toLowerCase();
                                if (type == "knockout") {
                                    data.isKnockout == true;
                                } else {
                                    data.isKnockout == false;
                                }
                                // console.log("data.isTeam", data.isNoMatch);
                                data._id = found._id;
                                data.found = found;
                                callback(null, found);
                            }
                        }
                    });
                },
                function (found, callback) {
                    if (data.isKnockout == true) {
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
                    } else {
                        callback(null, found);
                    }
                },
                function (found, callback) {
                    if (data.isKnockout == true) {
                        if (_.isEmpty(found)) {
                            callback(null, data.found);
                        } else {
                            var winPlayer = [];
                            var lostPlayer = [];
                            var foundLength = found.length;
                            if (data.found.round == "Semi Final" && foundLength == 2) {
                                if (data.isTeam == true && _.isEmpty(found[0].opponentsTeam) && _.isEmpty(found[1].opponentsTeam)) {
                                    if (data.found.resultFootball && data.found.resultFootball.status == 'IsCompleted' && data.found.resultFootball.isNoMatch == false) {
                                        if (data.found.opponentsTeam[0].equals(data.found.resultFootball.winner.player)) {
                                            lostPlayer.push(data.found.opponentsTeam[1]);
                                            winPlayer.push(data.found.resultFootball.winner.player);
                                            console.log("player", winPlayer);
                                        } else {
                                            lostPlayer.push(data.found.opponentsTeam[0]);
                                            winPlayer.push(data.found.resultFootball.winner.player);
                                            console.log("player", winPlayer);
                                        }
                                        updateObj = {
                                            $set: {
                                                opponentsTeam: winPlayer
                                            }
                                        };
                                        updateObj1 = {
                                            $set: {
                                                opponentsTeam: lostPlayer
                                            }
                                        };
                                    } else {
                                        callback(null, data.found);
                                    }
                                } else if (data.isTeam == true && !_.isEmpty(found[0].opponentsTeam) && !_.isEmpty(found[1].opponentsTeam)) {
                                    if (found[0].opponentsTeam.length == 1 && found[1].opponentsTeam.length == 1) {
                                        var playerId = found[0].opponentsTeam[0];
                                        var playerId1 = found[1].opponentsTeam[0];
                                        winPlayer.push(playerId);
                                        lostPlayer.push(playerId1);
                                        if (data.found.resultFootball && data.found.resultFootball.status == 'IsCompleted' && data.found.resultFootball.isNoMatch == false) {
                                            if (data.found.opponentsTeam[0].equals(data.found.resultFootball.winner.player)) {
                                                lostPlayer.push(data.found.opponentsTeam[1]);
                                                winPlayer.push(data.found.resultFootball.winner.player);
                                                console.log("player", winPlayer);
                                            } else {
                                                lostPlayer.push(data.found.opponentsTeam[0]);
                                                winPlayer.push(data.found.resultFootball.winner.player);
                                                console.log("player", winPlayer);
                                            }
                                            updateObj = {
                                                $set: {
                                                    opponentsTeam: winPlayer
                                                }
                                            };
                                            updateObj1 = {
                                                $set: {
                                                    opponentsTeam: lostPlayer
                                                }
                                            };
                                        } else {
                                            callback(null, data.found);
                                        }
                                    } else {
                                        updateObj = {};
                                    }
                                }
                            } else {
                                console.log("in found", found, "data", data);
                                if (data.isTeam == true && _.isEmpty(found[0].opponentsTeam)) {
                                    if (data.found.resultFootball && data.found.resultFootball.status == 'IsCompleted' && data.found.resultFootball.isNoMatch == false) {
                                        winPlayer.push(data.found.resultFootball.winner.player);
                                        console.log("player", winPlayer);
                                        updateObj = {
                                            $set: {
                                                opponentsTeam: winPlayer
                                            }
                                        };
                                    } else {
                                        callback(null, data.found);
                                    }
                                } else if (data.isTeam == true && !_.isEmpty(found[0].opponentsTeam)) {
                                    console.log("updating match", data.found);
                                    if (found[0].opponentsTeam.length == 1) {
                                        var playerId = found[0].opponentsTeam[0];
                                        winPlayer.push(playerId);
                                        if (data.found.resultFootball && data.found.resultFootball.status == "IsCompleted" && data.found.resultFootball.isNoMatch == false) {
                                            winPlayer.push(data.found.resultFootball.winner.player);
                                            console.log("player", winPlayer);
                                            updateObj = {
                                                $set: {
                                                    opponentsTeam: winPlayer
                                                }
                                            };
                                        } else {
                                            callback(null, data.found);
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
                                            matchId: found[1].matchId
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
                                            matchId: found[0].matchId
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
                    } else {
                        callback(null, found);
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

    updateBackend: function (data, callback) {
        if (data.resultsCombat) {
            var matchObj = {
                $set: {
                    resultsCombat: data.resultsCombat
                }
            };


        } else if (data.resultsRacquet) {
            var matchObj = {
                $set: {
                    resultsRacquet: data.resultsRacquet
                }
            };

        } else if (data.resultVolleyball) {
            var matchObj = {
                $set: {
                    resultVolleyball: data.resultVolleyball
                }
            };

        } else if (data.resultBasketball) {
            var matchObj = {
                $set: {
                    resultBasketball: data.resultBasketball
                }
            };

        } else if (data.resultHockey) {
            var matchObj = {
                $set: {
                    resultHockey: data.resultHockey
                }
            };

        } else if (data.resultHeat) {
            var matchObj = {
                $set: {
                    resultHeat: data.resultHeat
                }
            };
        } else if (data.resultQualifyingRound) {
            var matchObj = {
                $set: {
                    resultQualifyingRound: data.resultQualifyingRound
                }
            };
        } else if (data.resultShooting) {
            var matchObj = {
                $set: {
                    resultShooting: data.resultShooting
                }
            };
        } else if (data.resultKnockout) {
            var matchObj = {
                $set: {
                    resultKnockout: data.resultKnockout
                }
            };
        } else if (data.resultFootball) {
            var matchObj = {
                $set: {
                    resultFootball: data.resultFootball
                }
            };
        } else if (data.resultKabaddi) {
            var matchObj = {
                $set: {
                    resultKabaddi: data.resultKabaddi
                }
            };
        } else if (data.resultHandball) {
            var matchObj = {
                $set: {
                    resultHandball: data.resultHandball
                }
            };
        } else if (data.resultWaterPolo) {
            var matchObj = {
                $set: {
                    resultWaterPolo: data.resultWaterPolo
                }
            };
        }

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

    updateSwiss: function (importData, data, callback) {
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
                                        if (_.isEmpty(singleData["SFAID 1"])) {
                                            callback(null, singleData);
                                        } else {
                                            // console.log("singleData1", singleData);
                                            var paramData = {};
                                            paramData.participant = singleData["SFAID 1"];
                                            paramData.sport = singleData.SPORT;
                                            Match.getAthleteId(paramData, function (err, complete) {
                                                if (err || _.isEmpty(complete)) {
                                                    singleData["NAME 1"] = null;
                                                    err = "SFAID 1 may have wrong values";
                                                    callback(null, {
                                                        error: err,
                                                        success: singleData
                                                    });
                                                } else {
                                                    singleData["NAME 1"] = complete._id;
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
                                            // console.log("singleData1", singleData);
                                            var paramData = {};
                                            paramData.participant = singleData["SFAID 2"];
                                            paramData.sport = singleData.SPORT;
                                            Match.getAthleteId(paramData, function (err, complete) {
                                                if (err || _.isEmpty(complete)) {
                                                    singleData["NAME 2"] = null;
                                                    err = "SFAID 2 may have wrong values";
                                                    callback(null, {
                                                        error: err,
                                                        success: singleData
                                                    });
                                                } else {
                                                    singleData["NAME 2"] = complete._id;
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
                                        resultData.players = [];
                                        var player = {};
                                        var player1 = {};
                                        var winner = {};

                                        paramData.opponentsSingle = [];
                                        paramData.matchId = singleData["MATCH ID"];
                                        paramData.round = singleData["ROUND NAME"];
                                        if (_.isEmpty(singleData["NAME 1"]) && _.isEmpty(singleData["NAME 2"])) {
                                            paramData.opponentsSingle = "";
                                        } else {
                                            if (_.isEmpty(singleData["NAME 1"])) {
                                                paramData.opponentsSingle.push(singleData["NAME 2"]);
                                                player.id = singleData["NAME 2"];
                                                player.score = singleData["P2 SCORE"];
                                                player.rank = singleData["P2 RANK"];
                                                resultData.players.push(player);
                                            } else if (_.isEmpty(singleData["NAME 2"])) {
                                                paramData.opponentsSingle.push(singleData["NAME 1"]);
                                                player.id = singleData["NAME 1"];
                                                player.score = singleData["P1 SCORE"];
                                                player.rank = singleData["P1 RANK"];
                                                resultData.players.push(player);
                                            } else {
                                                paramData.opponentsSingle.push(singleData["NAME 1"]);
                                                player.id = singleData["NAME 1"];
                                                player.score = singleData["P1 SCORE"];
                                                player.rank = singleData["P1 RANK"];
                                                paramData.opponentsSingle.push(singleData["NAME 2"]);
                                                player1.id = singleData["NAME 2"];
                                                player1.score = singleData["P2 SCORE"];
                                                player1.rank = singleData["P2 RANK"];
                                                resultData.players.push(player);
                                                resultData.players.push(player1);

                                            }
                                        }

                                        if (singleData["WINNER SFAID"] == singleData["SFAID 1"]) {
                                            winner.player = singleData["NAME 1"];
                                        } else if (singleData["WINNER SFAID"] == singleData["SFAID 2"]) {
                                            winner.player = singleData["NAME 2"];
                                        }
                                        resultData.winner = winner;
                                        paramData.resultSwiss = resultData;
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
};
module.exports = _.assign(module.exports, exports, model);