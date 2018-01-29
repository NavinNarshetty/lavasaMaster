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
    oldId: {
        type: Schema.Types.ObjectId,
        index: true
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
    resultFencing: Schema.Types.Mixed,
    resultImages: Schema.Types.Mixed,
    resultThrowball: Schema.Types.Mixed,
    scheduleDate: Date,
    scheduleTime: String,
    video: String,
    videoType: String,
    thumbnails: [],
    matchCenter: String,
    excelType: String,
    heatNo: String,
    resultType: String,
    drawFormat: String,
});

schema.plugin(deepPopulate, {
    populate: {
        "sport": {
            select: '_id sportslist gender ageGroup maxTeamPlayers minTeamPlayers weight eventPdf'
        },
        "opponentsSingle": {
            select: '_id athleteId sportsListSubCategory createdBy'
        },
        "opponentsSingle.athleteId": {
            select: '_id sfaId firstName middleName surname school photograph dob city atheleteSchoolName'
        },
        "opponentsSingle.athleteId.school": {
            select: '_id sfaid name screenName'
        },
        "opponentsTeam": {
            select: '_id name teamId schoolName studentTeam createdBy sport school'
        },
        "opponentsTeam.studentTeam.studentId": {
            select: '_id sfaId firstName middleName surname school photograph dob city'
        },
        "opponentsTeam.studentTeam.studentId.school": {
            select: '_id sfaid name screenName'
        },
        "opponentsTeam.school": {
            select: '_id schoolLogo schoolName'
        },
        "prevMatch": {
            select: ''
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
                        if (found.drawFormat) {
                            finalData.drawFormat = found.drawFormat;
                        } else {
                            finalData.drawFormat = found.sport.sportslist.drawFormat;
                        }

                        finalData.gender = found.sport.gender;
                        finalData.prevMatch = found.prevMatch;
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
                        if (_.isEmpty(found.resultThrowball)) {
                            finalData.resultThrowball = "";
                        } else {
                            finalData.resultThrowball = found.resultThrowball;
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
                        if (_.isEmpty(found.resultImages)) {
                            finalData.resultImages = "";
                        } else {
                            finalData.resultImages = found.resultImages;
                        }
                        if (_.isEmpty(found.resultFencing)) {
                            finalData.resultFencing = "";
                        } else {
                            finalData.resultFencing = found.resultFencing;
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
        var sport = {};
        async.waterfall([
                function (callback) {
                    SportsList.findOne({
                        name: data.name
                    }).lean().deepPopulate("sportsListSubCategory").exec(function (err, found) {
                        if (err || _.isEmpty(found)) {
                            callback(null, {
                                error: "No SportsList found!",
                                success: data
                            });
                        } else {
                            sport.sportslist = found._id;
                            sport.sportsListSubCategory = found.sportsListSubCategory._id;
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
                        console.log("matchObj", matchObj);
                        Sport.findOne(matchObj).lean().exec(function (err, found) {
                            console.log("sport", found);
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
            function (sendObj, callback) {
                Match.findOne({
                    "sport": sendObj.sport
                }).exec(function (err, matchData) {
                    if (err) {
                        callback(err, null);
                    } else if (!_.isEmpty(matchData)) {
                        console.log("matchData*******", matchData);
                        if (matchData.drawFormat) {
                            sendObj.drawFormat = matchData.drawFormat;
                        }
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
        var matchData = [];
        async.waterfall([
            function (callback) {
                var deepSearch = "sport.sportslist.sportsListSubCategory.sportsListCategory sport.ageGroup sport.weight opponentsSingle.athleteId.school opponentsTeam.studentTeam.studentId opponentsTeam.school";
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
                    matchData1.push(match);
                    i++;
                }
                var sendObj = {};
                sendObj.roundsListName = _.keys(matches);
                sendObj.roundsList = matchData1;
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
                            finalData.qualifying = sendObj;
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
                    matchData2.push(match);
                    i++;
                }
                var sendObj = {};
                sendObj.roundsListName = _.keys(matches);
                sendObj.roundsList = matchData2;
                // console.log("sendObj", sendObj);
                if (data.round) {
                    var index = _.findIndex(matchData2, function (n) {
                        return n.name == data.round
                    });
                    if (index != -1) {
                        sendObj.roundsList = _.slice(matchData2, index, index + 3);
                        finalData.knockout = sendObj;
                        // console.log("Final Data", finalData);
                        callback(null, finalData);
                    } else {
                        finalData.knockout = sendObj;
                        // console.log("Final Data else 0", finalData);
                        callback(null, finalData);
                    }
                } else {
                    finalData.knockout = sendObj;
                    // console.log("Final Data else", finalData);
                    callback(null, finalData);
                }
            }
        ], function (err, result) {
            // console.log("Final Callback", result);
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
                var deepSearch = "opponentsTeam.studentTeam.studentId opponentsSingle.athleteId.school";
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
                            // console.log("matches", matches);
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
                var deepSearch = "opponentsTeam.studentTeam.studentId opponentsSingle.athleteId.school";
                Match.find({
                    sport: data.sport,
                    excelType: {
                        $regex: "knockout",
                        $options: "i"
                    }
                }).lean().deepPopulate(deepSearch).sort({
                    createdAt: 1
                }).exec(function (err, found) {
                    // console.log("found", found);
                    if (err) {
                        callback(err, null);
                    } else {
                        if (_.isEmpty(found)) {
                            finalData.qualifying = sendObj;
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
                if (data.round) {
                    var index = _.findIndex(matchData2, function (n) {
                        return n.name == data.round
                    });

                    if (index != -1) {
                        sendObj.roundsList = _.slice(matchData2, index, index + 3);
                        finalData.knockout = sendObj;
                        // console.log("finalData", finalData);
                        callback(null, finalData);
                    } else {
                        finalData.knockout = sendObj;
                        // console.log("finalData", finalData);
                        callback(null, finalData);
                    }

                } else {
                    finalData.knockout = sendObj;
                    callback(null, finalData);
                }
            }
        ], function (err, result) {
            // console.log("Final Callback");
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
                        console.log("n", n, "matchName", matchesPerPool[name]);
                        _.each(matchesPerPool[name], function (match) {
                            console.log("match", match);
                            var team = {};
                            var team1 = {};
                            if (match.opponentsTeam[0]) {
                                team = match.opponentsTeam[0];
                                console.log("team7777", team);
                                teams.push(team);

                                console.log("teams1", teams);
                            }
                            if (match.opponentsTeam[1]) {
                                team1 = match.opponentsTeam[1];
                                console.log("team2222", team1);
                                teams.push(team1);
                                console.log("Teams2", teams);
                            }
                        });
                        console.log("teams****", teams);
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
                        console.log("*****", n);
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
        console.log('get pool standings', standings);
        console.log('get pool data', data);
        async.concatSeries(standings.teams, function (team, callback) {
            async.waterfall([
                    function (callback) {
                        var teamData = {};
                        teamData.teamId = team.teamId;
                        teamData.schoolName = team.schoolName;
                        teamData._id = team._id;
                        var teamid = team._id.toString();
                        var matchObj = {
                            sport: data.sport,
                            excelType: {
                                $regex: "league",
                                $options: "i"
                            },
                            $or: [{
                                "resultFootball.teams.team": teamid,
                            }, {
                                "resultHockey.teams.team": teamid,
                            }, {
                                "resultHandball.teams.team": teamid,
                            }, {
                                "resultKabaddi.teams.team": teamid,
                            }, {
                                "resultBasketball.teams.team": teamid,
                            }, {
                                "resultVolleyball.teams.team": teamid,
                            }, {
                                "resultWaterPolo.teams.team": teamid,
                            }, {
                                "resultThrowball.teams.team": teamid,
                            }],
                            round: standings.name
                        }
                        console.log('MatchObj', matchObj);
                        Match.find(matchObj).lean().deepPopulate("opponentsTeam").sort({
                            createdAt: 1
                        }).exec(function (err, found) {
                            if (err) {
                                callback(err, null);
                            } else {
                                if (_.isEmpty(found)) {
                                    console.log('Without Data', found);
                                    teamData.matches = found;
                                    callback(null, teamData);
                                } else {
                                    console.log('With Data', found);
                                    teamData.matches = found;
                                    callback(null, teamData);
                                }
                            }
                        });
                    },
                    function (teamData, callback) {
                        console.log('teamdata', teamData);
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
                        console.log('teamdata matches', teamData.matches);
                        _.each(teamData.matches, function (match) {
                            scores.matchCount = teamData.matches.length;
                            if (match.resultFootball) {
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
                            } else if (match.resultHockey) {
                                if (match.resultHockey.teams.length == 2) {
                                    if (teamData._id == match.resultHockey.teams[0].team && match.resultHockey.teams[0].noShow == true) {
                                        scores.noShow = ++scores.noShow;
                                    } else if (teamData._id == match.resultHockey.teams[1].team && match.resultHockey.teams[1].noShow == true) {
                                        scores.noShow = ++scores.noShow;
                                    }
                                } else {
                                    if (teamData._id == match.resultHockey.teams[0].team && match.resultHockey.teams[0].noShow == true) {
                                        scores.noShow = ++scores.noShow;
                                    }
                                }
                                if (teamData._id == match.resultHockey.winner.player) {
                                    scores.win = ++scores.win;
                                    scores.points = scores.points + 3;
                                } else if (_.isEmpty(match.resultHockey.winner.player) && match.resultHockey.isDraw == true) {
                                    scores.draw = ++scores.draw;
                                    scores.points = scores.points + 1;
                                } else {
                                    scores.loss = ++scores.loss;
                                }
                            } else if (match.resultBasketball) {
                                if (match.resultBasketball.teams.length == 2) {
                                    if (teamData._id == match.resultBasketball.teams[0].team && match.resultBasketball.teams[0].noShow == true) {
                                        scores.noShow = ++scores.noShow;
                                    } else if (teamData._id == match.resultBasketball.teams[1].team && match.resultBasketball.teams[1].noShow == true) {
                                        scores.noShow = ++scores.noShow;
                                    }
                                } else {
                                    if (teamData._id == match.resultBasketball.teams[0].team && match.resultBasketball.teams[0].noShow == true) {
                                        scores.noShow = ++scores.noShow;
                                    }
                                }
                                if (teamData._id == match.resultBasketball.winner.player) {
                                    scores.win = ++scores.win;
                                    scores.points = scores.points + 3;
                                } else if (_.isEmpty(match.resultBasketball.winner.player) && match.resultBasketball.isDraw == true) {
                                    scores.draw = ++scores.draw;
                                    scores.points = scores.points + 1;
                                } else {
                                    scores.loss = ++scores.loss;
                                }
                            } else if (match.resultHandball) {
                                if (match.resultHandball.teams.length == 2) {
                                    if (teamData._id == match.resultHandball.teams[0].team && match.resultHandball.teams[0].noShow == true) {
                                        scores.noShow = ++scores.noShow;
                                    } else if (teamData._id == match.resultHandball.teams[1].team && match.resultHandball.teams[1].noShow == true) {
                                        scores.noShow = ++scores.noShow;
                                    }
                                } else {
                                    if (teamData._id == match.resultHandball.teams[0].team && match.resultHandball.teams[0].noShow == true) {
                                        scores.noShow = ++scores.noShow;
                                    }
                                }
                                if (teamData._id == match.resultHandball.winner.player) {
                                    scores.win = ++scores.win;
                                    scores.points = scores.points + 3;
                                } else if (_.isEmpty(match.resultHandball.winner.player) && match.resultHandball.isDraw == true) {
                                    scores.draw = ++scores.draw;
                                    scores.points = scores.points + 1;
                                } else {
                                    scores.loss = ++scores.loss;
                                }
                            } else if (match.resultKabaddi) {
                                if (match.resultKabaddi.teams.length == 2) {
                                    if (teamData._id == match.resultKabaddi.teams[0].team && match.resultKabaddi.teams[0].noShow == true) {
                                        scores.noShow = ++scores.noShow;
                                    } else if (teamData._id == match.resultKabaddi.teams[1].team && match.resultKabaddi.teams[1].noShow == true) {
                                        scores.noShow = ++scores.noShow;
                                    }
                                } else {
                                    if (teamData._id == match.resultKabaddi.teams[0].team && match.resultKabaddi.teams[0].noShow == true) {
                                        scores.noShow = ++scores.noShow;
                                    }
                                }
                                if (teamData._id == match.resultKabaddi.winner.player) {
                                    scores.win = ++scores.win;
                                    scores.points = scores.points + 3;
                                } else if (_.isEmpty(match.resultKabaddi.winner.player) && match.resultKabaddi.isDraw == true) {
                                    scores.draw = ++scores.draw;
                                    scores.points = scores.points + 1;
                                } else {
                                    scores.loss = ++scores.loss;
                                }
                            } else if (match.resultVolleyball) {
                                if (match.resultVolleyball.teams.length == 2) {
                                    if (teamData._id == match.resultVolleyball.teams[0].team && match.resultVolleyball.teams[0].noShow == true) {
                                        scores.noShow = ++scores.noShow;
                                    } else if (teamData._id == match.resultVolleyball.teams[1].team && match.resultVolleyball.teams[1].noShow == true) {
                                        scores.noShow = ++scores.noShow;
                                    }
                                } else {
                                    if (teamData._id == match.resultVolleyball.teams[0].team && match.resultVolleyball.teams[0].noShow == true) {
                                        scores.noShow = ++scores.noShow;
                                    }
                                }
                                if (teamData._id == match.resultVolleyball.winner.player) {
                                    scores.win = ++scores.win;
                                    scores.points = scores.points + 3;
                                } else if (_.isEmpty(match.resultVolleyball.winner.player) && match.resultVolleyball.isDraw == true) {
                                    scores.draw = ++scores.draw;
                                    scores.points = scores.points + 1;
                                } else {
                                    scores.loss = ++scores.loss;
                                }
                            } else if (match.resultWaterPolo) {
                                if (match.resultWaterPolo.teams.length == 2) {
                                    if (teamData._id == match.resultWaterPolo.teams[0].team && match.resultWaterPolo.teams[0].noShow == true) {
                                        scores.noShow = ++scores.noShow;
                                    } else if (teamData._id == match.resultWaterPolo.teams[1].team && match.resultWaterPolo.teams[1].noShow == true) {
                                        scores.noShow = ++scores.noShow;
                                    }
                                } else {
                                    if (teamData._id == match.resultWaterPolo.teams[0].team && match.resultWaterPolo.teams[0].noShow == true) {
                                        scores.noShow = ++scores.noShow;
                                    }
                                }
                                if (teamData._id == match.resultWaterPolo.winner.player) {
                                    scores.win = ++scores.win;
                                    scores.points = scores.points + 3;
                                } else if (_.isEmpty(match.resultWaterPolo.winner.player) && match.resultWaterPolo.isDraw == true) {
                                    scores.draw = ++scores.draw;
                                    scores.points = scores.points + 1;
                                } else {
                                    scores.loss = ++scores.loss;
                                }
                            } else if (match.resultThrowball) {
                                console.log('Inside match result', match.resultThrowball);
                                if (match.resultThrowball.teams.length === 2) {
                                    if (teamData._id == match.resultThrowball.teams[0].team && match.resultThrowball.teams[0].noShow == true) {
                                        scores.noShow = ++scores.noShow;
                                    } else if (teamData._id == match.resultThrowball.teams[1].team && match.resultThrowball.teams[1].noShow == true) {
                                        scores.noShow = ++scores.noShow;
                                    }
                                } else {
                                    if (teamData._id == match.resultThrowball.teams[0].team && match.resultThrowball.teams[0].noShow == true) {
                                        scores.noShow = ++scores.noShow;
                                    }
                                }
                                if (teamData._id == match.resultThrowball.winner.player) {
                                    scores.win = ++scores.win;
                                    scores.points = scores.points + 3;
                                } else if (_.isEmpty(match.resultThrowball.winner.player) && match.resultThrowball.isDraw == true) {
                                    scores.draw = ++scores.draw;
                                    scores.points = scores.points + 1;
                                } else {
                                    scores.loss = ++scores.loss;
                                }
                            }
                        });
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

    getStandingsFencing: function (data, callback) {
        var deepSearch = "opponentsSingle.athleteId.school";
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
                    // console.log("matchesPerPool", matchesPerPool);
                    var arr = _.keys(matchesPerPool);
                    var i = 0;
                    while (i < arr.length) {
                        var match = {};
                        var name = arr[i];
                        match.name = arr[i];

                        var n = matchesPerPool[name].length;
                        _.each(matchesPerPool[name], function (match) {
                            var team = {};
                            var team1 = {};
                            if (match.opponentsSingle[0]) {
                                team = match.opponentsSingle[0];
                                teams.push(team);
                            }
                            if (match.opponentsSingle[1]) {
                                team1 = match.opponentsSingle[1];
                                teams.push(team1);
                            }
                        });
                        var t = _.uniq(teams, function (x) {
                            return x;
                        });
                        match.teams = t;
                        // console.log("match", match);
                        teams = [];
                        standings.push(match);
                        i++;
                    }
                    callback(null, standings);
                },
                function (standings, callback) {
                    async.eachSeries(standings, function (n, callback) {
                        console.log("n", n);
                        Match.getPointsPerPoolFencing(n, data, function (err, complete) {
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

    getPointsPerPoolFencing: function (standings, data, callback) {
        async.concatSeries(standings.teams, function (team, callback) {
            // console.log("team", team);
            async.waterfall([
                    function (callback) {
                        var teamData = {};
                        teamData.teamId = team.athleteId.sfaId;
                        if (team.athleteId.atheleteSchoolName) {
                            teamData.schoolName = team.athleteId.atheleteSchoolName;
                        } else {
                            teamData.schoolName = team.athleteId.school.name;
                        }
                        teamData._id = team.athleteId._id;
                        teamData.opponentsSingle = team._id;
                        teamData.player = team.athleteId;
                        console.log("teamId", teamData._id, "sport", data.sport, "round", standings.name);
                        var teamid = teamData._id.toString();
                        var matchObj = {
                            sport: data.sport,
                            excelType: {
                                $regex: "league",
                                $options: "i"
                            },
                            "resultFencing.players.player": teamid,
                            round: standings.name
                        }
                        Match.find(matchObj).lean().deepPopulate("opponentsSingle.athleteId.school").sort({
                            createdAt: 1
                        }).exec(function (err, found) {
                            if (err) {
                                callback(err, null);
                            } else {
                                console.log("found****", found);
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
                        console.log("teamdata", teamData);
                        var scores = {};
                        scores._id = teamData._id;
                        scores.player = teamData.player;
                        scores.sfaId = teamData.teamId;
                        scores.schoolName = teamData.schoolName;
                        scores.win = 0;
                        scores.draw = 0;
                        scores.points = 0;
                        scores.loss = 0;
                        scores.matchCount = 0;
                        scores.noShow = 0;

                        _.each(teamData.matches, function (match) {
                            scores.matchCount = teamData.matches.length;
                            // console.log("teamdata._id", teamData._id, "player", match.resultFencing.winner.player);
                            if (match.resultFencing.players.length == 2) {
                                if (teamData._id == match.resultFencing.players[0].player && match.resultFencing.players[0].noShow == true) {
                                    scores.noShow = ++scores.noShow;
                                } else if (teamData._id == match.resultFencing.players[1].player && match.resultFencing.players[1].noShow == true) {
                                    scores.noShow = ++scores.noShow;
                                }
                            } else {
                                if (teamData._id == match.resultFencing.players[0].player && match.resultFencing.players[0].noShow == true) {
                                    scores.noShow = ++scores.noShow;
                                }
                            }
                            if (teamData._id == match.resultFencing.winner.player) {
                                scores.win = ++scores.win;
                                scores.points = scores.points + 3;
                            } else if (_.isEmpty(match.resultFencing.winner.player) && match.resultFencing.isDraw == true) {
                                scores.draw = ++scores.draw;
                                scores.points = scores.points + 1;
                            } else {
                                scores.loss = ++scores.loss;
                            }
                            // }
                        });
                        // console.log("scores", scores);
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

    getAllQualifyingPerRound: function (data, callback) {
        var deepSearch = "sport.sportslist.sportsListSubCategory.sportsListCategory sport.ageGroup sport.weight opponentsSingle.athleteId.school";
        Match.find({
            sport: data.sport,
            round: data.round
        }).lean().deepPopulate(deepSearch).sort({
            createdAt: 1
        }).exec(function (err, found) {
            if (err) {
                callback(err, null);
            } else if (_.isEmpty(found)) {
                callback(null, []);
            } else {
                callback(null, found);
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
                                        var paramData = {};
                                        paramData.name = _.trim(singleData.EVENT);
                                        paramData.age = _.trim(singleData["AGE GROUP"]);
                                        var gen = _.trim(singleData.GENDER);
                                        if (gen == "Boys" || gen == "Male" || gen == "male") {
                                            paramData.gender = "male";
                                        } else if (gen == "Girls" || gen == "Female" || gen == "female") {
                                            paramData.gender = "female";
                                        }
                                        var weight = singleData["WEIGHT CATEGORIES"];
                                        paramData.weight = _.trimStart(weight, " ");
                                        // console.log("para,", paramData);
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
                                                singleData["PARTICIPANT 1"] = null;
                                                callback(null, singleData);
                                            } else {
                                                // console.log("singleData1", singleData);
                                                var paramData = {};
                                                paramData.participant = _.trim(singleData["SFAID 1"]);
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
                                        // console.log("logssss***", singleData);
                                        if (singleData.error) {
                                            countError++;
                                            callback(null, singleData);
                                        } else {
                                            if (_.isEmpty(singleData["SFAID 2"])) {
                                                singleData["PARTICIPANT 2"] = "";
                                                callback(null, singleData);
                                            } else {
                                                var paramData = {};
                                                paramData.participant = _.trim(singleData["SFAID 2"]);
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
                                            paramData.round = _.trim(singleData["ROUND NAME"]);
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
                                            if (!_.isEmpty(singleData.TIME) || singleData.TIME != null) {
                                                paramData.scheduleTime = singleData.TIME;
                                            }
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
                        },
                        function (err, singleData) {
                            callback(null, singleData)
                        });
                },
                function (singleData, callback) {
                    async.concatSeries(singleData, function (n, callback) {
                            if (countError != 0 && n.error == null) {
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

    saveforWeightIndividual: function (importData, callback) {
        var countError = 0;
        async.waterfall([
                function (callback) {
                    async.concatSeries(importData, function (singleData, callback) {
                            async.waterfall([
                                    function (callback) {
                                        var paramData = {};
                                        paramData.name = _.trim(singleData.EVENT);
                                        paramData.age = _.trim(singleData["AGE GROUP"]);
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
                                        if (singleData.error) {
                                            countError++;
                                            callback(null, singleData);
                                        } else {
                                            if (_.isEmpty(singleData["SFAID"])) {
                                                singleData["PARTICIPANT"] = null;
                                                callback(null, singleData);
                                            } else {
                                                var paramData = {};
                                                paramData.participant = _.trim(singleData["SFAID"]);
                                                paramData.sport = _.trim(singleData.SPORT);
                                                Match.getAthleteId(paramData, function (err, complete) {
                                                    if (err || _.isEmpty(complete)) {
                                                        singleData["PARTICIPANT"] = "";
                                                        err = "SFAID 1 may have wrong values";
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
                                        if (singleData.error) {
                                            countError++;
                                            callback(null, singleData);
                                        } else if (!_.isEmpty(singleData["NEW WEIGHT"])) {
                                            Match.saveWeightChangeNew(singleData, function (err, complete) {
                                                if (err || _.isEmpty(complete)) {
                                                    err = "New weight not valid";
                                                    callback(err, null);
                                                } else {
                                                    singleData.SPORT = complete.sportId;
                                                    callback(null, singleData);
                                                }
                                            });
                                        } else {
                                            callback(null, singleData);
                                        }
                                    },
                                ],
                                function (err, results) {
                                    if (err || _.isEmpty(results)) {
                                        callback(null, results);
                                    } else {
                                        callback(null, results);
                                    }
                                });
                        },
                        function (err, singleData) {
                            callback(null, singleData);
                        });
                },
            ],
            function (err, results) {
                if (err || _.isEmpty(results)) {
                    callback(null, results);
                } else {
                    callback(null, results);
                }
            });
    },

    saveWeightChangeNew: function (singleData, callback) {
        var countError = 0;
        console.log("called");
        async.waterfall([
                function (callback) {
                    var paramData = {};
                    paramData.name = _.trim(singleData["EVENT"]);
                    paramData.age = _.trim(singleData["AGE GROUP"]);
                    if (singleData.GENDER == "Boys" || singleData.GENDER == "Male" || singleData.GENDER == "male") {
                        paramData.gender = "male";
                    } else if (singleData.GENDER == "Girls" || singleData.GENDER == "Female" || singleData.GENDER == "female") {
                        paramData.gender = "female";
                    }
                    var weight = _.trim(singleData["NEW WEIGHT"]);
                    paramData.weight = _.trimStart(weight, " ");

                    Match.getSportId(paramData, function (err, sportData) {
                        if (err || _.isEmpty(sportData)) {
                            err = "Weight may have wrong values";
                            callback(null, {
                                error: err,
                                success: sportData
                            });
                        } else {
                            callback(null, sportData);
                        }
                    });
                },
                function (sportData, callback) {
                    console.log("new data", sportData);
                    if (sportData.error) {
                        countError++;
                        callback(null, sportData);
                    } else {
                        if (singleData["PARTICIPANT"]) {
                            var participant = {};
                            participant.id = _.trim(singleData["PARTICIPANT"]);
                            participant.sport = _.trim(singleData.SPORT);
                            Match.updateIndividualSport(participant, sportData, function (err, updatedData) {
                                if (err || _.isEmpty(updatedData)) {
                                    err = "Weight may have wrong values";
                                    callback(null, {
                                        error: err,
                                        success: sportData
                                    });
                                } else {
                                    callback(null, sportData);
                                }
                            });
                        } else {
                            callback(null, sportData);
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

    saveWeightChange: function (singleData, callback) {
        var countError = 0;
        async.waterfall([
                function (callback) {
                    var paramData = {};
                    paramData.name = _.trim(singleData["EVENT"]);
                    paramData.age = _.trim(singleData["AGE GROUP"]);
                    if (singleData.GENDER == "Boys" || singleData.GENDER == "Male" || singleData.GENDER == "male") {
                        paramData.gender = "male";
                    } else if (singleData.GENDER == "Girls" || singleData.GENDER == "Female" || singleData.GENDER == "female") {
                        paramData.gender = "female";
                    }
                    var weight = _.trim(singleData["NEW WEIGHT"]);
                    paramData.weight = _.trimStart(weight, " ");
                    Match.getSportId(paramData, function (err, sportData) {
                        if (err || _.isEmpty(sportData)) {
                            err = "Weight may have wrong values";
                            callback(null, {
                                error: err,
                                success: sportData
                            });
                        } else {
                            callback(null, sportData);
                        }
                    });
                },
                function (sportData, callback) {
                    console.log("new weight", sportData);
                    if (sportData.error) {
                        countError++;
                        callback(null, sportData);
                    } else {
                        if (singleData["PARTICIPANT 1"] && singleData["PARTICIPANT 2"]) {
                            var updateData = {};
                            var participant = {};
                            participant.id = _.trim(singleData["PARTICIPANT 1"]);
                            Match.updateIndividualSport(participant, sportData, function (err, updatedData) {
                                if (err || _.isEmpty(updatedData)) {
                                    err = "Weight may have wrong values";
                                    updateData.err = err;
                                    updateData.data = sportData;
                                } else {

                                    updateData = sportData;
                                }
                            });
                            var participant1 = {};
                            participant1.id = _.trim(singleData["PARTICIPANT 2"]);
                            Match.updateIndividualSport(participant1, sportData, function (err, updatedData) {
                                if (err || _.isEmpty(updatedData)) {
                                    err = "Weight may have wrong values";
                                    updateData.err1 = err;
                                    updateData.data1 = sportData;
                                } else {
                                    updateData = sportData;
                                }
                            });
                            callback(null, updateData);
                        } else if (singleData["PARTICIPANT 1"]) {
                            var participant = {};
                            participant.id = _.trim(singleData["PARTICIPANT 1"]);
                            Match.updateIndividualSport(participant, sportData, function (err, updatedData) {
                                if (err || _.isEmpty(updatedData)) {
                                    err = "Weight may have wrong values";
                                    callback(null, {
                                        error: err,
                                        success: sportData
                                    });
                                } else {
                                    callback(null, sportData);
                                }
                            });
                        } else if (singleData["PARTICIPANT 2"]) {
                            var participant = {};
                            participant.id = _.trim(singleData["PARTICIPANT 2"]);
                            Match.updateIndividualSport(participant, sportData, function (err, updatedData) {
                                if (err || _.isEmpty(updatedData)) {
                                    err = "Weight may have wrong values";
                                    callback(null, {
                                        error: err,
                                        success: sportData
                                    });
                                } else {
                                    callback(null, sportData);
                                }
                            });
                        } else {
                            callback(null, sportData);
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

    updateIndividualSport: function (data, param, callback) {
        async.waterfall([
                function (callback) {
                    IndividualSport.findOne({
                        _id: data.id,
                        sport: data.sport
                    }).lean().exec(function (err, found) {
                        if (err || _.isEmpty(found)) {
                            callback(null, {
                                error: "No Age found!",
                                success: data
                            });
                        } else {
                            callback(null, found);
                        }
                    });
                },
                function (found, callback) {
                    var sportArry = [];
                    _.each(found.sport, function (n) {
                        if (data.sport === n.toString()) {
                            sportArry.push(param.sportId);
                        } else {
                            sportArry.push(n);
                        }
                    });
                    var matchobj = {
                        $set: {
                            sport: sportArry
                        }
                    };
                    IndividualSport.update({
                        _id: data.id
                    }, matchobj).lean().exec(function (err, updateData) {
                        if (err || _.isEmpty(updateData)) {
                            callback(null, {
                                error: "No Age found!",
                                success: data
                            });
                        } else {
                            callback(null, found);
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
                                            paramData.name = _.trim(singleData["EVENT"]);
                                            paramData.age = _.trim(singleData["AGE GROUP"]);
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
                                                    param.participant = _.trim(singleData["SFA ID"]);
                                                    param.sport = singleData.SPORT;
                                                    Match.getAthleteId(param, function (err, complete) {
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
                                async.each(singleData, function (n, callback) {
                                    if (n.error) {
                                        countError++;
                                        callback(null, n);
                                    } else {
                                        paramData.matchId = data.matchId;
                                        paramData.round = _.trim(n.success["ROUND"]);
                                        if (!_.isEmpty(n.success["NAME"])) {
                                            paramData.opponentsSingle.push(n.success["NAME"]);
                                        }
                                        paramData.sport = n.success.SPORT;
                                        paramData.scheduleDate = n.success.DATE;
                                        if (!_.isEmpty(n.success.TIME) || n.success.TIME != null) {
                                            paramData.scheduleTime = n.success.TIME;
                                        }
                                        var player = {};
                                        player.id = _.trim(n.success["NAME"]);
                                        player.laneNo = _.trim(n.success["LANE NUMBER"]);
                                        result.players.push(player);
                                        paramData.heatNo = _.trim(n.success["HEAT NUMBER"]);
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
                                            paramData.name = _.trim(singleData["EVENT"]);
                                            paramData.age = _.trim(singleData["AGE GROUP"]);
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
                                                    param.team = _.trim(singleData["TEAM ID"]);
                                                    param.sport = singleData.SPORT;
                                                    Match.getTeamId(param, function (err, complete) {
                                                        if (err || _.isEmpty(complete)) {
                                                            singleData["NAME"] = null;
                                                            err = "TEAM ID may have wrong values";
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
                                async.each(singleData, function (n, callback) {
                                    if (n.error) {
                                        countError++;
                                        callback(null, n);
                                    } else {
                                        paramData.matchId = data.matchId;
                                        paramData.round = _.trim(n.success["ROUND"]);
                                        if (!_.isEmpty(n.success["NAME"])) {
                                            paramData.opponentsTeam.push(n.success["NAME"]);
                                        }
                                        paramData.sport = n.success.SPORT;
                                        paramData.scheduleDate = n.success.DATE;
                                        if (!_.isEmpty(n.success.TIME) || n.success.TIME != null) {
                                            paramData.scheduleTime = _.trim(n.success.TIME);
                                        }
                                        paramData.heatNo = _.trim(n.success["HEAT NUMBER"]);
                                        var team = {};
                                        team.id = n.success["NAME"];
                                        team.laneNo = _.trim(n.success["LANE NUMBER"]);
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
                                    var paramData = {};
                                    paramData.name = _.trim(singleData['EVENT']);
                                    paramData.age = _.trim(singleData["AGE GROUP"]);
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
                                            paramData.participant = _.trim(singleData["SFA ID"]);
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
                                    // console.log("logssss", singleData);
                                    if (singleData.error) {
                                        countError++;
                                        callback(null, singleData);
                                    } else {
                                        var paramData = {};
                                        paramData.opponentsSingle = [];
                                        paramData.matchId = data.matchId;
                                        paramData.round = _.trim(singleData["ROUND"]);
                                        if (_.isEmpty(singleData["PARTICIPANT 1"])) {
                                            paramData.opponentsSingle = "";
                                        } else {
                                            paramData.opponentsSingle.push(singleData["PARTICIPANT 1"]);
                                        }
                                        paramData.sport = singleData.SPORT;
                                        paramData.scheduleDate = singleData.DATE;
                                        if (!_.isEmpty(singleData.TIME) || singleData.TIME != null) {
                                            paramData.scheduleTime = singleData.TIME;
                                        }
                                        if (data.resultType == "direct-final") {
                                            var result = {};
                                            result.laneNo = _.trim(singleData["LANE NUMBER"]);
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
                                var paramData = {};
                                paramData.name = _.trim(singleData.EVENT);
                                paramData.age = _.trim(singleData["AGE GROUP"]);
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
                                if (singleData.error) {
                                    countError++;
                                    callback(null, singleData);
                                } else {
                                    if (_.isEmpty(singleData["TEAM 1"])) {
                                        callback(null, singleData);
                                    } else {
                                        var paramData = {};
                                        paramData.team = _.trim(singleData["TEAM 1"]);
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
                                                singleData["PARTICIPANT 1"] = complete._id;
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
                                        callback(null, singleData);
                                    } else {
                                        var paramData = {};
                                        paramData.team = _.trim(singleData["TEAM 2"]);
                                        paramData.sport = singleData.SPORT;
                                        Match.getTeamId(paramData, function (err, complete) {
                                            if (err || _.isEmpty(complete)) {
                                                singleData["PARTICIPANT 2"] = "";
                                                err = "TEAM ID 2 may have wrong values";
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
                                if (singleData.error) {
                                    countError++;
                                    callback(null, singleData);
                                } else {
                                    var paramData = {};
                                    paramData.opponentsTeam = [];
                                    paramData.matchId = data.matchId;
                                    paramData.round = _.trim(singleData["ROUND NAME"]);
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
                                    if (!_.isEmpty(singleData.TIME) || singleData.TIME != null) {
                                        paramData.scheduleTime = singleData.TIME;
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
                    console.log("final match", final);
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
                            console.log("id", id);
                            console.log("final.finalPrevious[i]", final.finalPrevious[i]);
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
                        // console.log("inside third place");
                        Match.findOne({
                            sport: data.sport,
                            $or: [{
                                round: "Final"
                            }, {
                                round: "final"
                            }, {
                                round: "FINAL"
                            }]
                        }).lean().exec(function (err, found) {
                            if (err) {
                                callback(err, null);
                            } else {
                                if (_.isEmpty(found)) {
                                    callback(null, []);
                                    // console.log("empty");
                                } else {
                                    // console.log("final", found);
                                    var updateObj = {
                                        $set: {
                                            prevMatch: found.prevMatch
                                        }
                                    };
                                    // console.log("updateObj", updateObj)
                                    Match.update({
                                        sport: data.sport,
                                        round: {
                                            $regex: "third place",
                                            $options: "i"
                                        }
                                    }, updateObj).exec(
                                        function (err, match) {
                                            // console.log("match", match);
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

    addPreviousMatchUpdate: function (data, callback) {
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
                        // var round = found[0].round.toLowerCase();
                        thirdPlaceCount = 0;
                    } else {
                        thirdPlaceCount = 1;
                    }

                    final.matchData = found;
                    console.log("final match", final);
                    async.eachSeries(found, function (singleData, callback) {
                        console.log("singleData", singleData);
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
                    // var range = parseInt(data.range) + 1;
                    // var rangeTotal = data.rangeTotal;
                    var i = 0;
                    var row = 0;
                    var ThirdPlace = [];
                    async.eachSeries(final.finalPrevious, function (singleData, callback) {
                            console.log("i", i, "row", final.matchData[row]._id);
                            var id = final.matchData[row]._id;
                            var updateObj = {
                                $set: {
                                    prevMatch: final.finalPrevious[i]
                                }
                            };
                            console.log("matchData", final.matchData[row]);
                            console.log("row round", final.matchData[row].round);
                            if (final.matchData[row].round != "Final") {
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
                        // console.log("inside third place");
                        Match.findOne({
                            sport: data.sport,
                            $or: [{
                                round: "Third Place"
                            }, {
                                round: "third place"
                            }, {
                                round: "THIRD PLACE"
                            }]
                        }).lean().exec(function (err, found) {
                            if (err) {
                                callback(err, null);
                            } else {
                                if (_.isEmpty(found)) {
                                    callback(null, []);
                                    console.log("empty");
                                } else {
                                    console.log("final", found);
                                    var updateObj = {
                                        $set: {
                                            prevMatch: found.prevMatch
                                        }
                                    };
                                    console.log("updateObj", updateObj);
                                    Match.update({
                                        sport: data.sport,
                                        round: "Final"
                                    }, updateObj).exec(
                                        function (err, match) {
                                            console.log("match", match);
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
                                    paramData.name = _.trim(singleData['EVENT']);
                                    paramData.age = _.trim(singleData["AGE GROUP"]);
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
                                            paramData.participant = _.trim(singleData["SFA ID"]);
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
                                        paramData.round = _.trim(singleData["ROUND"]);
                                        if (_.isEmpty(singleData["NAME"])) {
                                            paramData.opponentsSingle = "";
                                        } else {
                                            paramData.opponentsSingle.push(singleData["NAME"]);
                                        }
                                        paramData.sport = singleData.SPORT;
                                        paramData.scheduleDate = singleData.DATE;
                                        if (!_.isEmpty(singleData.TIME) || singleData.TIME != null) {
                                            paramData.scheduleTime = singleData.TIME;
                                        }
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
                                paramData.name = _.trim(singleData.EVENT);
                                paramData.age = _.trim(singleData["AGE GROUP"]);
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
                                        paramData.team = _.trim(singleData["TEAM 1"]);
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
                                        paramData.team = _.trim(singleData["TEAM 2"]);
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
                                    paramData.round = _.trim(singleData["ROUND"]);
                                    if (_.isEmpty(singleData["TEAM NAME 1"]) && _.isEmpty(singleData["TEAM NAME 2"])) {
                                        paramData.opponentsTeam = "";
                                    } else if (_.isEmpty(singleData["TEAM NAME 1"])) {
                                        paramData.opponentsTeam.push(singleData["TEAM NAME 2"]);
                                    } else if (_.isEmpty(singleData["TEAM NAME 2"])) {
                                        paramData.opponentsTeam.push(singleData["TEAM NAME 1"]);
                                    } else {
                                        paramData.opponentsTeam.push(singleData["TEAM NAME 1"]);
                                        paramData.opponentsTeam.push(singleData["TEAM NAME 2"]);
                                    }
                                    paramData.sport = singleData.SPORT;
                                    paramData.scheduleDate = singleData.DATE;
                                    if (!_.isEmpty(singleData.TIME) || singleData.TIME != null) {
                                        paramData.scheduleTime = singleData.TIME;
                                    }
                                    paramData.excelType = _.trim(singleData["STAGE"]);
                                    if (data.resultType == "league-cum-knockout") {
                                        paramData.drawFormat = 'League cum Knockout';
                                    } else {
                                        paramData.drawFormat = data.resultType;
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
                    Match.addPreviousMatchUpdate(data, function (err, sportData) {
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

    saveLeagueKnockoutFencing: function (importData, data, callback) {
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
                                    if (_.isEmpty(singleData["SFAID 1"])) {
                                        callback(null, singleData);
                                    } else {
                                        console.log("singleData1", singleData);
                                        var paramData = {};
                                        paramData.participant = singleData["SFAID 1"];
                                        paramData.sport = singleData.SPORT;
                                        Match.getAthleteId(paramData, function (err, complete) {
                                            if (err || _.isEmpty(complete)) {
                                                singleData["NAME 1"] = null;
                                                err = "NAME 1 may have wrong values";
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
                                if (singleData.err) {
                                    countError++;
                                    callback(null, singleData);
                                } else {
                                    if (_.isEmpty(singleData["SFAID 2"])) {
                                        console.log("inside sfa");
                                        callback(null, singleData);
                                    } else {
                                        var paramData = {};
                                        paramData.participant = singleData["SFAID 2"];
                                        paramData.sport = singleData.SPORT;
                                        Match.getAthleteId(paramData, function (err, complete) {
                                            if (err || _.isEmpty(complete)) {
                                                singleData["NAME 2"] = null;
                                                err = "NAME 2 may have wrong values";
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
                                if (singleData.error) {
                                    countError++;
                                    callback(null, singleData);
                                } else {
                                    var paramData = {};
                                    paramData.opponentsSingle = [];
                                    paramData.matchId = data.matchId;
                                    paramData.round = singleData["ROUND"];
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
                                    if (!_.isEmpty(singleData.TIME) || singleData.TIME != null) {
                                        paramData.scheduleTime = singleData.TIME;
                                    }
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
                                    paramData.name = _.trim(singleData.EVENT);
                                    paramData.age = _.trim(singleData["AGE GROUP"]);
                                    if (singleData.GENDER == "Boys" || singleData.GENDER == "Male" || singleData.GENDER == "male") {
                                        paramData.gender = "male";
                                    } else if (singleData.GENDER == "Girls" || singleData.GENDER == "Female" || singleData.GENDER == "female") {
                                        paramData.gender = "female";
                                    }
                                    paramData.weight = undefined;
                                    Match.getSportId(paramData, function (err, sportData) {
                                        if (err || _.isEmpty(sportData)) {
                                            singleData.SPORT = null;
                                            var err = "Sport,Event,AgeGroup,Gender may have wrong values";
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
                                        if (_.isEmpty(singleData["SFAID 1"])) {
                                            singleData["NAME 1"] = null;
                                            callback(null, singleData);
                                        } else {
                                            var paramData = {};
                                            paramData.participant = _.trim(singleData["SFAID 1"]);
                                            paramData.sport = singleData.SPORT;
                                            Match.getAthleteId(paramData, function (err, complete) {
                                                if (err || _.isEmpty(complete)) {
                                                    singleData["NAME 1"] = "";
                                                    var err = "SFAID 1 may have wrong values";
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
                                    if (singleData.error) {
                                        countError++;
                                        callback(null, singleData);
                                    } else {
                                        if (_.isEmpty(singleData["SFAID 2"])) {
                                            singleData["NAME 2"] = "";
                                            callback(null, singleData);
                                        } else {
                                            var paramData = {};
                                            paramData.participant = _.trim(singleData["SFAID 2"]);
                                            paramData.sport = singleData.SPORT;
                                            Match.getAthleteId(paramData, function (err, complete) {
                                                if (err || _.isEmpty(complete)) {
                                                    singleData["NAME 2"] = null;
                                                    var err = "SFAID 2 may have wrong values";
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
                                    if (singleData.error) {
                                        countError++;
                                        callback(null, singleData);
                                    } else {
                                        var paramData = {};
                                        paramData.opponentsSingle = [];
                                        paramData.matchId = data.matchId;
                                        paramData.round = _.trim(singleData["ROUND NAME"]);
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
                                        if (!_.isEmpty(singleData.TIME) || singleData.TIME != null) {
                                            paramData.scheduleTime = singleData.TIME;
                                        }
                                        if (data.resultType == 'qualifying-knockout' && data.excelType == 'knockout') {
                                            paramData.excelType = data.excelType;
                                        }
                                        Match.saveMatch(paramData, function (err, complete) {
                                            if (err || _.isEmpty(complete)) {
                                                var err = "SFAID 2 may have wrong values";
                                                callback(null, {
                                                    error: err,
                                                    success: singleData
                                                });
                                            } else {
                                                callback(null, complete);
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
                                        callback(null, found);
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
                    callback(null, results);
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
                    } else if (data.playerType == "team" && data.playerSpecific == "no") {
                        Match.generateExcelKnockoutTeam(match, function (err, singleData) {
                            Config.generateExcel("KnockoutIndividual", singleData, res);
                        });
                    } else if (data.playerType == "team" && data.playerSpecific == "yes") {
                        Match.generatePlayerSpecific(data, match, function (err, singleData) {
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
                console.log('mainData', mainData);
                console.log('mainData opponents', mainData.opponentsSingle[0].athleteId);
                // console.log('mainData opponents length', mainData.opponentsSingle.length);
                if (mainData.opponentsSingle.length > 0) {
                    console.log('mainData opponents 0', mainData.opponentsSingle[0]);
                    obj["SFAID 1"] = mainData.opponentsSingle[0].athleteId.sfaId;
                    if (mainData.opponentsSingle[0].athleteId.middleName) {
                        obj["PARTICIPANT 1"] = mainData.opponentsSingle[0].athleteId.firstName + " " + mainData.opponentsSingle[0].athleteId.middleName + " " + mainData.opponentsSingle[0].athleteId.surname;
                    } else {
                        obj["PARTICIPANT 1"] = mainData.opponentsSingle[0].athleteId.firstName + " " + mainData.opponentsSingle[0].athleteId.surname;
                    }
                    if (mainData.opponentsSingle[0].athleteId.atheleteSchoolName) {
                        obj["SCHOOL 1"] = mainData.opponentsSingle[0].athleteId.atheleteSchoolName;
                    } else {
                        obj["SCHOOL 1"] = mainData.opponentsSingle[0].athleteId.school.name;
                    }
                    if (mainData.resultsCombat) {
                        if (mainData.resultsCombat.winner) {
                            if (mainData.opponentsSingle.length == 1 && mainData.opponentsSingle[0].athleteId._id.equals(mainData.resultsCombat.winner.player)) {
                                obj["RESULT 1"] = "Bye";
                            } else if (mainData.opponentsSingle[0].athleteId._id.equals(mainData.resultsCombat.winner.player)) {
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
                            if (mainData.opponentsSingle.length == 1 && mainData.opponentsSingle[0].athleteId._id.equals(mainData.resultsRacquet.winner.player)) {
                                obj["RESULT 1"] = "Bye";
                            } else if (mainData.opponentsSingle[0].athleteId._id.equals(mainData.resultsRacquet.winner.player)) {
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
                    console.log('mainData opponents 1', mainData.opponentsSingle[1]);
                    obj["SFAID 2"] = mainData.opponentsSingle[1].athleteId.sfaId;

                    if (mainData.opponentsSingle[1].athleteId.middleName) {
                        obj["PARTICIPANT 2"] = mainData.opponentsSingle[1].athleteId.firstName + " " + mainData.opponentsSingle[1].athleteId.middleName + " " + mainData.opponentsSingle[1].athleteId.surname;
                    } else {
                        obj["PARTICIPANT 2"] = mainData.opponentsSingle[1].athleteId.firstName + " " + mainData.opponentsSingle[1].athleteId.surname;
                    }
                    if (mainData.opponentsSingle[1].athleteId.atheleteSchoolName) {
                        obj["SCHOOL 2"] = mainData.opponentsSingle[1].athleteId.atheleteSchoolName;
                    } else {
                        obj["SCHOOL 2"] = mainData.opponentsSingle[1].athleteId.school.name;
                    }
                    if (mainData.resultsCombat) {
                        console.log('mainData resultsCombat', mainData.resultsCombat.players);
                        console.log('mainData resultsCombat length', mainData.resultsCombat.players.length);
                        console.log('mainData resultsCombat 0', mainData.resultsCombat.players[0]);
                        console.log('mainData resultsCombat 1', mainData.resultsCombat.players[1]);

                        // if (mainData.opponentsSingle[1].athleteId._id === mainData.resultsCombat.winner.player) {
                        if (mainData.opponentsSingle[1].athleteId._id.equals(mainData.resultsCombat.winner.player)) {
                            if (mainData.resultsCombat.players[1].walkover == true) {
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
                                obj["SCORE 2"] = "Set" + sNo + "-" + mainData.resultsCombat.players[1].sets[i].point;
                                obj["DATA POINTS 2"] = "Set" + sNo + "{ point:" + mainData.resultsCombat.players[1].sets[i].point + "ace:" + mainData.resultsCombat.players[1].sets[i].ace + "winner:" + mainData.resultsCombat.players[1].sets[i].winner + "unforcedError:" + mainData.resultsCombat.players[1].sets[i].unforcedError + "serviceError:" + mainData.resultsCombat.players[1].sets[i].serviceError + "doubleFaults:" + mainData.resultsCombat.players[1].sets[i].doubleFaults + "}";
                                sNo++;
                            } else {
                                obj["SCORE 2"] = obj["SCORE 1"] + "," + "Set" + sNo + "-" + mainData.resultsCombat.players[1].sets[i].point;
                                obj["DATA POINTS 2"] = obj["DATA POINTS 1"] + "," + "Set" + sNo + "{ point:" + mainData.resultsCombat.players[1].sets[i].point + "ace:" + mainData.resultsCombat.players[1].sets[i].ace + "winner:" + mainData.resultsCombat.players[1].sets[i].winner + "unforcedError:" + mainData.resultsCombat.players[1].sets[i].unforcedError + "serviceError:" + mainData.resultsCombat.players[1].sets[i].serviceError + "doubleFaults:" + mainData.resultsCombat.players[1].sets[i].doubleFaults + "}";
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
                    } else {
                        obj["RESULT 2"] = "";
                        obj["SCORE 2"] = "";
                        obj["DATA POINTS 2"] = "";
                    }
                    if (mainData.videoType) {
                        obj["VIDEO TYPE"] = mainData.videoType;
                    } else {
                        obj["VIDEO TYPE"] = "";
                    }
                    if (mainData.video) {
                        obj["VIDEO"] = mainData.video;
                    } else {
                        obj["VIDEO"] = "";
                    }
                } else {
                    obj["SFAID 2"] = "";
                    obj["PARTICIPANT 2"] = "";
                    obj["SCHOOL 2"] = "";
                    obj["RESULT 2"] = "";
                    obj["SCORE 2"] = "";
                    obj["DATA POINTS 2"] = "";
                    obj["VIDEO TYPE"] = "";
                    obj["VIDEO"] = "";
                }
                console.log(obj);
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
            // obj["NEW WEIGHT"] = "";
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
        } else if (data.resultType == 'league-cum-knockout' && data.playerType == 'team') {
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
        } else if (data.resultType == 'league-cum-knockout' && data.playerType == 'individual') {
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
            obj["SFAID 1"] = "";
            obj["NAME 1"] = "";
            obj["SCHOOL 1"] = "";
            obj["COACH NAME 1"] = "";
            obj["SFAID 2"] = "";
            obj["NAME 2"] = "";
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
                if (mainData.opponentsTeam.length > 0) {
                    obj["TEAM ID 1"] = mainData.opponentsTeam[0].teamId;
                    obj["SCHOOL 1"] = mainData.opponentsTeam[0].schoolName;
                    if (mainData.resultsCombat) {
                        if (mainData.opponentsTeam.length == 1 && mainData.resultsCombat.winner.player === mainData.opponentsTeam[0]._id.toString()) {
                            obj["RESULT 1"] = "Bye";
                        } else if (mainData.resultsCombat.winner.player === mainData.opponentsTeam[0]._id.toString()) {
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
                        if (mainData.opponentsTeam.length == 1 && mainData.resultsRacquet.winner.player === mainData.opponentsTeam[0]._id.toString()) {
                            obj["RESULT 1"] = "Bye";
                        } else if (mainData.resultsRacquet.winner.player === mainData.opponentsTeam[0]._id.toString()) {
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
                    } else if (mainData.resultBasketball) {
                        if (mainData.opponentsTeam.length == 1 && mainData.resultBasketball.winner.player === mainData.opponentsTeam[0]._id.toString()) {
                            obj["RESULT 1"] = "Bye";
                        } else if (mainData.resultBasketball.winner.player === mainData.opponentsTeam[0]._id.toString()) {
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
                        // obj["DATA POINTS 1"] = mainData.resultBasketball.teams[0].finalGoalPoints;
                    } else if (mainData.resultThrowball) {
                        if (mainData.opponentsTeam.length == 1 && mainData.resultThrowball.winner.player === mainData.opponentsTeam[0]._id.toString()) {
                            obj["RESULT 1"] = "Bye";
                        } else if (mainData.resultThrowball.winner.player === mainData.opponentsTeam[0]._id.toString()) {
                            if (mainData.resultThrowball.teams[0].walkover == true) {
                                obj["RESULT 1"] = "walkover";
                            } else {
                                obj["RESULT 1"] = "Won";
                            }
                        } else {
                            if (mainData.resultThrowball.isNoMatch == false) {
                                if (mainData.resultThrowball.teams[0].walkover == false && mainData.resultThrowball.teams[0].noShow == false) {
                                    obj["RESULT 1"] = "Lost";
                                } else if (mainData.resultThrowball.teams[0].walkover == true) {
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
                        for (i = 0; i < mainData.resultThrowball.teams[0].teamResults.sets.length; i++) {
                            if (i == 0) {
                                obj["Set 1"] = "Set" + sNo + "-" + mainData.resultThrowball.teams[0].teamResults.sets[i].point;
                                sNo++;
                            } else {
                                obj["Set 1"] = obj["Set 1"] + "," + "Set" + sNo + "-" + mainData.resultThrowball.teams[0].teamResults.points[i].basket;
                                sNo++;
                            }
                        }
                        // obj["DATA POINTS 1"] = mainData.resultThrowball.teams[0].finalGoalPoints;
                    } else if (mainData.resultWaterPolo) {
                        if (mainData.opponentsTeam.length == 1 && mainData.resultWaterPolo.winner.player === mainData.opponentsTeam[0]._id.toString()) {
                            obj["RESULT 1"] = "Bye";
                        } else if (mainData.resultWaterPolo.winner.player === mainData.opponentsTeam[0]._id.toString()) {
                            if (mainData.resultWaterPolo.teams[0].walkover == true) {
                                obj["RESULT 1"] = "walkover";
                            } else {
                                obj["RESULT 1"] = "Won";
                            }
                        } else {
                            if (mainData.resultWaterPolo.isNoMatch == false) {
                                if (mainData.resultWaterPolo.teams[0].walkover == false && mainData.resultWaterPolo.teams[0].noShow == false) {
                                    obj["RESULT 1"] = "Lost";
                                } else if (mainData.resultWaterPolo.teams[0].walkover == true) {
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
                        for (i = 0; i < mainData.resultWaterPolo.teams[0].teamResults.quarterPoints.length; i++) {
                            if (i == 0) {
                                obj["QUARTER SCORE 1"] = "Q" + sNo + "-" + mainData.resultWaterPolo.teams[0].teamResults.quarterPoints[i].basket;
                                sNo++;
                            } else {
                                obj["QUARTER SCORE 1"] = obj["QUARTER SCORE 0"] + "," + "Q" + i + "-" + mainData.resultWaterPolo.teams[0].teamResults.quarterPoints[i].basket;
                                sNo++;
                            }
                        }
                        if (mainData.opponentsTeam[0]) {
                            obj["FINAL SCORE 1"] = mainData.resultWaterPolo.teams[0].teamResults.finalGoalPoints + "-" + mainData.resultWaterPolo.teams[0].teamResults.finalGoalPoints;
                        } else {
                            obj["FINAL SCORE 1"] = mainData.resultWaterPolo.teams[0].teamResults.finalGoalPoints;
                        }
                        obj["DATA POINTS 1"] = "shotsOnGoal:" + mainData.resultHockey.teams[0].teamResults.shotsOnGoal + ",totalShots:" + mainData.resultHockey.teams[0].teamResults.totalShots + ",penalty:" + mainData.resultHockey.teams[0].teamResults.penalty + ",penaltyPoints:" + mainData.resultHockey.teams[0].teamResults.penaltyPoints + ",saves:" + mainData.resultHockey.teams[0].teamResults.saves;
                    } else if (mainData.resultVolleyball) {
                        if (mainData.opponentsTeam.length == 1 && mainData.resultVolleyball.winner.player === mainData.opponentsTeam[0]._id.toString()) {
                            obj["RESULT 1"] = "Bye";
                        } else if (mainData.resultVolleyball.winner.player === mainData.opponentsTeam[0]._id.toString()) {
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
                                obj["SCORE 1"] = obj["SCORE 1"] + "," + "Set" + sNo + "-" + mainData.resultVolleyball.teams[0].teamResults.sets[i].points;
                                sNo++;
                            }
                        }
                        obj["DATA POINTS 1"] = "Spike:" + mainData.resultVolleyball.teams[0].teamResults.spike + ",Fouls:" + mainData.resultVolleyball.teams[0].teamResults.fouls + ",Block:" + mainData.resultVolleyball.teams[0].teamResults.block;
                    } else if (mainData.resultHockey) {
                        if (mainData.opponentsTeam.length == 1 && mainData.resultHockey.winner.player === mainData.opponentsTeam[0]._id.toString()) {
                            obj["RESULT 1"] = "Bye";
                        } else if (mainData.resultHockey.winner.player === mainData.opponentsTeam[0]._id.toString()) {
                            if (mainData.resultHockey.teams[0].walkover == true) {
                                obj["RESULT 1"] = "walkover";
                            } else {
                                obj["RESULT 1"] = "Won";
                            }
                        } else {
                            if (mainData.resultHockey.isNoMatch == false) {
                                if (mainData.resultHockey.teams[0].walkover == false && mainData.resultHockey.teams[0].noShow == false) {
                                    obj["RESULT 1"] = "Lost";
                                } else if (mainData.resultHockey.teams[0].walkover == true) {
                                    obj["RESULT 1"] = "walkover";
                                } else {
                                    obj["RESULT 1"] = "noShow";
                                }
                            } else {
                                obj["RESULT 1"] = "No Match";
                            }
                        }
                        obj["DATA POINTS 1"] = "Penality:" + mainData.resultHockey.teams[0].teamResults.penality + ",penaltyPoints:" + mainData.resultHockey.teams[0].teamResults.penaltyPoints + ",penaltyCorners:" + mainData.resultHockey.teams[0].teamResults.penaltyCorners + ",penaltyStroke:" + mainData.resultHockey.teams[0].teamResults.penaltyStroke + ",saves:" + mainData.resultHockey.teams[0].teamResults.saves + ",fouls:" + mainData.resultHockey.teams[0].teamResults.fouls;
                        obj["SCORE 1"] = "HalfPoints: " + mainData.resultHockey.teams[0].teamResults.halfPoints + "," + "FinalPoints: " + mainData.resultHockey.teams[0].teamResults.finalPoints;
                    } else if (mainData.resultHandball) {
                        if (mainData.opponentsTeam.length == 1 && mainData.resultHandball.winner.player === mainData.opponentsTeam[0]._id.toString()) {
                            obj["RESULT 1"] = "Bye";
                        } else if (mainData.resultHandball.winner.player === mainData.opponentsTeam[0]._id.toString()) {
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
                        if (mainData.opponentsTeam.length == 1 && mainData.resultKabaddi.winner.player === mainData.opponentsTeam[0]._id.toString()) {
                            obj["RESULT 1"] = "Bye";
                        } else if (mainData.resultKabaddi.winner.player === mainData.opponentsTeam[0]._id.toString()) {
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
                    obj["TEAM ID 1"] = "";
                    obj["SCHOOL 1"] = "";
                    obj["RESULT 1"] = "";
                    obj["SCORE 1"] = "";
                    obj["DATA POINTS 1"] = "";
                }

                if (mainData.opponentsTeam.length > 1) {
                    obj["TEAM ID 2"] = mainData.opponentsTeam[1].teamId;
                    obj["SCHOOL 2"] = mainData.opponentsTeam[1].schoolName;
                    if (mainData.resultsCombat) {
                        if (mainData.resultsCombat.winner.player === mainData.opponentsTeam[1]._id.toString()) {
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
                        if (mainData.resultsRacquet.winner.player === mainData.opponentsTeam[1]._id.toString()) {
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
                    } else if (mainData.resultBasketball) {
                        if (mainData.resultBasketball.winner.player === mainData.opponentsTeam[1]._id.toString()) {
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
                                obj["QUARTER SCORE 2"] = obj["QUARTER SCORE 2"] + "," + "Q" + i + "-" + mainData.resultBasketball.teams[1].teamResults.quarterPoints[i].basket;
                                sNo++;
                            }
                        }
                        if (mainData.opponentsTeam[1]) {
                            obj["FINAL SCORE"] = mainData.resultBasketball.teams[0].teamResults.finalGoalPoints + "-" + mainData.resultBasketball.teams[1].teamResults.finalGoalPoints;
                        } else {
                            obj["FINAL SCORE"] = mainData.resultBasketball.teams[0].teamResults.finalGoalPoints;
                        }
                    } else if (mainData.resultThrowball) {
                        if (mainData.resultThrowball.winner.player === mainData.opponentsTeam[1]._id.toString()) {
                            if (mainData.resultThrowball.teams[1].walkover == true) {
                                obj["RESULT 2"] = "walkover";
                            } else {
                                obj["RESULT 2"] = "Won";
                            }
                        } else {
                            if (mainData.resultThrowball.isNoMatch == false) {
                                if (mainData.resultThrowball.teams[1].walkover == false && mainData.resultThrowball.teams[1].noShow == false) {
                                    obj["RESULT 2"] = "Lost";
                                } else if (mainData.resultThrowball.teams[1].walkover == true) {
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
                        for (i = 0; i < mainData.resultThrowball.teams[1].teamResults.sets.length; i++) {
                            if (i == 0) {
                                obj["Set 2"] = "Set" + sNo + "-" + mainData.resultThrowball.teams[1].teamResults.sets[i].point;
                                sNo++;
                            } else {
                                obj["Set 2"] = obj["Set 2"] + "," + "Set" + i + "-" + mainData.resultThrowball.teams[1].teamResults.sets[i].point;
                                sNo++;
                            }
                        }
                        if (mainData.opponentsTeam[1]) {
                            obj["FINAL SCORE"] = mainData.resultThrowball.teams[0].teamResults.finalGoalPoints + "-" + mainData.resultThrowball.teams[1].teamResults.finalGoalPoints;
                        } else {
                            obj["FINAL SCORE"] = mainData.resultThrowball.teams[0].teamResults.finalGoalPoints;
                        }
                    } else if (mainData.resultWaterPolo) {
                        if (mainData.resultWaterPolo.winner.player === mainData.opponentsTeam[1]._id.toString()) {
                            if (mainData.resultWaterPolo.teams[1].walkover == true) {
                                obj["RESULT 2"] = "walkover";
                            } else {
                                obj["RESULT 2"] = "Won";
                            }
                        } else {
                            if (mainData.resultWaterPolo.isNoMatch == false) {
                                if (mainData.resultWaterPolo.teams[1].walkover == false && mainData.resultWaterPolo.teams[1].noShow == false) {
                                    obj["RESULT 2"] = "Lost";
                                } else if (mainData.resultWaterPolo.teams[1].walkover == true) {
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
                        for (i = 0; i < mainData.resultWaterPolo.teams[1].teamResults.quarterPoints.length; i++) {
                            if (i == 0) {
                                obj["QUARTER SCORE 2"] = "Q" + sNo + "-" + mainData.resultWaterPolo.teams[1].teamResults.quarterPoints[i].basket;
                                sNo++;
                            } else {
                                obj["QUARTER SCORE 2"] = obj["QUARTER SCORE 1"] + "," + "Q" + i + "-" + mainData.resultWaterPolo.teams[1].teamResults.quarterPoints[i].basket;
                                sNo++;
                            }
                        }
                        if (mainData.opponentsTeam[1]) {
                            obj["FINAL SCORE"] = mainData.resultWaterPolo.teams[0].teamResults.finalGoalPoints + "-" + mainData.resultWaterPolo.teams[1].teamResults.finalGoalPoints;
                        } else {
                            obj["FINAL SCORE"] = mainData.resultWaterPolo.teams[0].teamResults.finalGoalPoints;
                        }
                        obj["DATA POINTS 2"] = "shotsOnGoal:" + mainData.resultHockey.teams[1].teamResults.shotsOnGoal + ",totalShots:" + mainData.resultHockey.teams[1].teamResults.totalShots + ",penalty:" + mainData.resultHockey.teams[1].teamResults.penalty + ",penaltyPoints:" + mainData.resultHockey.teams[1].teamResults.penaltyPoints + ",saves:" + mainData.resultHockey.teams[1].teamResults.saves;
                    } else if (mainData.resultHockey) {
                        if (mainData.resultHockey.winner.player === mainData.opponentsTeam[1]._id.toString()) {
                            if (mainData.resultHockey.teams[0].walkover == true) {
                                obj["RESULT 2"] = "walkover";
                            } else {
                                obj["RESULT 2"] = "Won";
                            }
                        } else {
                            if (mainData.resultHockey.isNoMatch == false) {
                                if (mainData.resultHockey.teams[1].walkover == false && mainData.resultHockey.teams[1].noShow == false) {
                                    obj["RESULT 2"] = "Lost";
                                } else if (mainData.resultHockey.teams[1].walkover == true) {
                                    obj["RESULT 2"] = "walkover";
                                } else {
                                    obj["RESULT 2"] = "noShow";
                                }
                            } else {
                                obj["RESULT 2"] = "No Match";
                            }
                        }
                        obj["DATA POINTS 2"] = "Penality:" + mainData.resultHockey.teams[1].teamResults.penality + ",penaltyPoints:" + mainData.resultHockey.teams[1].teamResults.penaltyPoints + ",penaltyCorners:" + mainData.resultHockey.teams[1].teamResults.penaltyCorners + ",penaltyStroke:" + mainData.resultHockey.teams[1].teamResults.penaltyStroke + ",saves:" + mainData.resultHockey.teams[1].teamResults.saves + ",fouls:" + mainData.resultHockey.teams[1].teamResults.fouls;
                        obj["SCORE 2"] = "HalfPoints: " + mainData.resultHockey.teams[1].teamResults.halfPoints + "," + "FinalPoints: " + mainData.resultHockey.teams[1].teamResults.finalPoints;
                    } else if (mainData.resultVolleyball) {
                        if (mainData.resultVolleyball.winner.player === mainData.opponentsTeam[1]._id.toString()) {
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
                        for (i = 1; i < mainData.resultVolleyball.teams[1].teamResults.sets.length; i++) {
                            if (i == 0) {
                                obj["SCORE 2"] = "Set" + sNo + "-" + mainData.resultVolleyball.teams[1].teamResults.sets[i].points;
                                sNo++;
                            } else {
                                obj["SCORE 2"] = obj["SCORE 2"] + "," + "Set" + sNo + "-" + mainData.resultVolleyball.teams[1].teamResults.sets[i].points;
                                sNo++;
                            }
                        }
                        obj["DATA POINTS 2"] = "Spike:" + mainData.resultVolleyball.teams[1].teamResults.spike + ",Fouls:" + mainData.resultVolleyball.teams[0].teamResults.fouls + ",Block:" + mainData.resultVolleyball.teams[0].teamResults.block;
                    } else if (mainData.resultHandball) {
                        if (mainData.resultHandball.winner.player === mainData.opponentsTeam[1]._id.toString()) {
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
                        if (mainData.resultKabaddi.winner.player === mainData.opponentsTeam[1]._id.toString()) {
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
                    if (mainData.videoType) {
                        obj["VIDEO TYPE"] = mainData.videoType;
                    } else {
                        obj["VIDEO TYPE"] = "";
                    }
                    if (mainData.video) {
                        obj["VIDEO"] = mainData.video;
                    } else {
                        obj["VIDEO"] = "";
                    }
                } else {
                    obj["TEAM ID 2"] = "";
                    // obj["PARTICIPANT 2"] = "";
                    obj["SCHOOL 2"] = "";
                    obj["RESULT 2"] = "";
                    if (mainData.resultBasketball) {
                        obj["QUARTER SCORE 2"] = "";
                        obj["FINAL SCORE"] = "";
                        obj["VIDEO TYPE"] = "";
                        obj["VIDEO"] = "";
                    } else if (mainData.resultThrowball) {
                        obj["Set 2"] = "";
                        obj["FINAL SCORE"] = "";
                        obj["VIDEO TYPE"] = "";
                        obj["VIDEO"] = "";
                    } else if (mainData.resultHandball || mainData.resultKabaddi) {
                        obj["HALF SCORE 2"] = "";
                        obj["FINAL SCORE 2"] = "";
                        obj["DATA POINTS 2"] = "";
                        obj["VIDEO TYPE"] = "";
                        obj["VIDEO"] = "";
                    } else if (mainData.resultWaterPolo) {
                        obj["QUARTER SCORE 2"] = "";
                        obj["FINAL SCORE"] = "";
                        obj["DATA POINTS 2"] = "";
                        obj["VIDEO TYPE"] = "";
                        obj["VIDEO"] = "";
                    } else {
                        obj["SCORE 2"] = "";
                        obj["DATA POINTS 2"] = "";
                        obj["VIDEO TYPE"] = "";
                        obj["VIDEO"] = "";
                    }
                }
                callback(null, obj);

            },
            function (err, singleData) {
                // Config.generateExcel("KnockoutIndividual", singleData, res);
                callback(null, singleData);
            });

    },

    generatePlayerSpecific: function (data, match, callback) {
        var finalData = [];
        async.waterfall([
                function (callback) {
                    async.each(match, function (n, callback) {
                        if (n.resultBasketball) {
                            var result = n.resultBasketball;
                            Match.getResultArray(n, finalData, result, function (err, complete) {
                                callback(null, complete);
                            });
                        } else if (n.resultFootball) {
                            var result = n.resultFootball;
                            Match.getResultArray(n, finalData, result, function (err, complete) {
                                callback(null, complete);
                            });
                        } else if (n.resultHandball) {
                            var result = n.resultHandball;
                            Match.getResultArray(n, finalData, result, function (err, complete) {
                                callback(null, complete);
                            });
                        } else if (n.resultHockey) {
                            var result = n.resultHockey;
                            Match.getResultArray(n, finalData, result, function (err, complete) {
                                callback(null, complete);
                            });
                        } else if (n.resultKabaddi) {
                            var result = n.resultKabaddi;
                            Match.getResultArray(n, finalData, result, function (err, complete) {
                                callback(null, complete);
                            });
                        } else if (n.resultVolleyball) {
                            var result = n.resultVolleyball;
                            Match.getResultArray(n, finalData, result, function (err, complete) {
                                callback(null, complete);
                            });
                        } else if (n.resultWaterPolo) {
                            var result = n.resultWaterPolo;
                            Match.getResultArray(n, finalData, result, function (err, complete) {
                                callback(null, complete);
                            });
                        } else if (n.resultsRacquet) {
                            var result = n.resultsRacquet;
                            Match.getResultArray(n, finalData, result, function (err, complete) {
                                callback(null, complete);
                            });
                        } else {
                            callback(null, finalData);
                        }
                    }, function (err) {
                        callback(null, finalData);
                    });
                },
                function (finalData, callback) {
                    var excelData = [];
                    var page = 1;
                    _.each(finalData, function (mainData) {
                        console.log("mainData", mainData);
                        for (var i = 0; i < mainData.max; i++) {
                            var obj = {};
                            obj["MATCH ID"] = mainData.matchId;
                            obj["TEAM 1"] = mainData.teamId1;
                            if (!_.isEmpty(mainData.team1) && mainData.team1[i] != undefined) {
                                obj["SFA ID 1"] = mainData.team1[i].sfaId;
                                if (mainData.team1[i].middleName) {
                                    obj["STARTING LINE UP SCREEN NAME 1"] = mainData.team1[i].firstName.charAt(0) + "." + mainData.team1[i].middleName.charAt(0) + "." + mainData.team1[i].surname;
                                } else {
                                    obj["STARTING LINE UP SCREEN NAME 1"] = mainData.team1[i].firstName.charAt(0) + "." + mainData.team1[i].surname;
                                }
                            } else {
                                obj["SFA ID 1"] = "-";
                                obj["STARTING LINE UP SCREEN NAME 1"] = "-";
                            }
                            if (!_.isEmpty(mainData.team1Sub) && mainData.team1Sub[i] != undefined) {
                                obj["SUBSTITUTES SFA ID 1"] = mainData.team1Sub[i].sub1;
                                if (mainData.team1Sub[i].middleName) {
                                    obj["SUBSTITUTES SCREEN NAME 1"] = mainData.team1Sub[i].firstName.charAt(0) + "." + mainData.team1Sub[i].middleName.charAt(0) + "." + mainData.team1Sub[i].surname;
                                } else {
                                    obj["SUBSTITUTES SCREEN NAME 1"] = mainData.team1Sub[i].firstName.charAt(0) + "." + mainData.team1Sub[i].surname;
                                }
                            } else {
                                obj["SUBSTITUTES ID 1"] = "-";
                                obj["SUBSTITUTES SCREEN NAME 1"] = "-";
                            }
                            obj["TEAM 2"] = mainData.teamId2;

                            if (!_.isEmpty(mainData.team2) && mainData.team2[i] != undefined) {
                                obj["SFA ID 2"] = mainData.team2[i].sfaId2;
                                if (mainData.team2[i].middleName) {
                                    obj["STARTING LINE UP SCREEN NAME 2"] = mainData.team2[i].firstName.charAt(0) + "." + mainData.team2[i].middleName.charAt(0) + "." + mainData.team2[i].surname;
                                } else {
                                    obj["STARTING LINE UP SCREEN NAME 2"] = mainData.team2[i].firstName.charAt(0) + "." + mainData.team2[i].surname;
                                }
                            } else {
                                obj["SFA ID 2"] = "-";
                                obj["STARTING LINE UP SCREEN NAME 2"] = "-";
                            }
                            if (!_.isEmpty(mainData.team2Sub) && mainData.team2Sub[i] != undefined) {
                                obj["SUBSTITUTES SFA ID 2"] = mainData.team2Sub[i].sub2;
                                if (mainData.team2Sub[i].middleName) {
                                    obj["SUBSTITUTES SCREEN NAME 2"] = mainData.team2Sub[i].firstName.charAt(0) + "." + mainData.team2Sub[i].middleName.charAt(0) + "." + mainData.team2Sub[i].surname;
                                } else {
                                    obj["SUBSTITUTES SCREEN NAME 2"] = mainData.team2Sub[i].firstName.charAt(0) + "." + mainData.team2Sub[i].surname;
                                }
                            } else {
                                obj["SUBSTITUTES SFA ID 2"] = "-";
                                obj["SUBSTITUTES SCREEN NAME 2"] = "-";
                            }
                            excelData.push(obj);
                        }
                        var obj = {};
                        excelData.push(obj);
                    });
                    callback(null, excelData);
                }
            ],
            function (err, complete) {
                if (err) {
                    callback(null, []);
                } else if (complete) {
                    callback(null, complete);
                }
            });
    },

    generateLeaguePlayerSpecific: function (data, res) {
        var deepSearch = "sport.sportslist.sportsListSubCategory.sportsListCategory sport.ageGroup sport.weight opponentsSingle.athleteId.school opponentsTeam.studentTeam.studentId";
        Match.find({
            sport: data.sport
        }).lean().deepPopulate(deepSearch).exec(function (err, match) {
            if (err) {
                res.callback(err, null);
            } else {
                if (_.isEmpty(match)) {
                    res.callback(null, []);
                } else {
                    Match.generatePlayerSpecific(data, match, function (err, singleData) {
                        Config.generateExcel("KnockoutIndividual", singleData, res);
                    });
                }
            }
        });
    },

    getResultArray: function (n, finalData, result, callback) {
        var final = {};
        var count = [];
        var team1 = [];
        var team1Sub = [];
        var team2 = [];
        var team2Sub = [];
        final.matchId = n.matchId;
        console.log('TTD N', n);
        console.log('TTD Final Data', finalData);
        console.log('TTD result', result);
        if (result.teams.length > 1) {
            final.teamId1 = result.teams[0].teamId;
            final.teamId2 = result.teams[1].teamId;
            console.log("team0", result.teams[0].players.length);
            console.log("team1", result.teams[1].players.length);
            if (result.teams.length == 2 && result.teams[0].players.length >= result.teams[1].players.length) {
                console.log('inside 2');
                for (var i = 0; i < result.teams[0].players.length; i++) {
                    if (result.teams[0].players[i].isPlaying == true) {
                        var team = {};
                        team.sfaId = result.teams[0].players[i].sfaId;
                        team.firstName = result.teams[0].players[i].firstName;
                        team.surname = result.teams[0].players[i].surname;
                        if (result.teams[0].players[i].middleName) {
                            team.surname = result.teams[0].players[i].middleName;
                        }
                        team1.push(team);
                    } else {
                        var team = {};
                        team.sub1 = result.teams[0].players[i].sfaId;
                        team.firstName = result.teams[0].players[i].firstName;
                        team.surname = result.teams[0].players[i].surname;
                        if (result.teams[0].players[i].middleName) {
                            team.surname = result.teams[0].players[i].middleName;
                        }
                        team1Sub.push(team);
                    }
                    if (result.teams[1].players[i]) {
                        if (result.teams[1].players[i].isPlaying == true) {
                            var team = {};
                            team.sfaId2 = result.teams[1].players[i].sfaId;
                            team.firstName = result.teams[1].players[i].firstName;
                            team.surname = result.teams[1].players[i].surname;
                            if (result.teams[1].players[i].middleName) {
                                team.surname = result.teams[1].players[i].middleName;
                            }
                            team2.push(team);
                        } else {
                            var team = {};
                            team.sub2 = result.teams[1].players[i].sfaId;
                            team.firstName = result.teams[1].players[i].firstName;
                            team.surname = result.teams[1].players[i].surname;
                            if (result.teams[1].players[i].middleName) {
                                team.surname = result.teams[1].players[i].middleName;
                            }
                            team2Sub.push(team);
                        }
                    }

                }
                final.team1 = team1;
                count.push(team1.length);
                final.team1Sub = team1Sub;
                count.push(team1Sub.length);
                final.team2 = team2;
                count.push(team2.length);
                final.team2Sub = team2Sub;
                count.push(team2Sub.length);
                var max = count.sort(function (a, b) {
                    return b - a;
                });
                final.max = max[0];
                console.log("max", max);
                finalData.push(final);
                callback(null, finalData);
            } else if (result.teams.length == 2 && result.teams[0].players.length < result.teams[1].players.length) {
                console.log('inside 2 less');
                for (var i = 0; i < result.teams[1].players.length; i++) {
                    if (result.teams[0].players[i]) {
                        if (result.teams[0].players[i].isPlaying == true) {
                            var team = {};
                            team.sfaId = result.teams[0].players[i].sfaId;
                            team.firstName = result.teams[0].players[i].firstName;
                            team.surname = result.teams[0].players[i].surname;
                            if (result.teams[0].players[i].middleName) {
                                team.surname = result.teams[0].players[i].middleName;
                            }
                            team1.push(team);
                        } else {
                            var team = {};
                            team.sub1 = result.teams[0].players[i].sfaId;
                            team.firstName = result.teams[0].players[i].firstName;
                            team.surname = result.teams[0].players[i].surname;
                            if (result.teams[0].players[i].middleName) {
                                team.surname = result.teams[0].players[i].middleName;
                            }
                            team1Sub.push(team);
                        }
                    }
                    if (result.teams[1].players[i].isPlaying == true) {
                        var team = {};
                        team.sfaId2 = result.teams[1].players[i].sfaId;
                        team.firstName = result.teams[1].players[i].firstName;
                        team.surname = result.teams[1].players[i].surname;
                        if (result.teams[1].players[i].middleName) {
                            team.surname = result.teams[1].players[i].middleName;
                        }
                        team2.push(team);
                    } else {
                        var team = {};
                        team.sub2 = result.teams[1].players[i].sfaId;
                        team.firstName = result.teams[1].players[i].firstName;
                        team.surname = result.teams[1].players[i].surname;
                        if (result.teams[1].players[i].middleName) {
                            team.surname = result.teams[1].players[i].middleName;
                        }
                        team2Sub.push(team);
                    }
                }
                final.team1 = team1;
                count.push(team1.length);
                final.team1Sub = team1Sub;
                count.push(team1Sub.length);
                final.team2 = team2;
                count.push(team2.length);
                final.team2Sub = team2Sub;
                count.push(team2Sub.length);
                var max = count.sort(function (a, b) {
                    return b - a;
                });
                final.max = max[0];
                console.log("max", max);
                finalData.push(final);
                callback(null, finalData);
            }
        } else if (result.teams[0]) {
            final.teamId1 = result.teams[0].teamId;
            for (var i = 0; i < result.teams[0].players.length; i++) {
                if (result.teams[0].players[i].isPlaying == true) {
                    var team = {};
                    team.sfaId = result.teams[0].players[i].sfaId;
                    team.firstName = result.teams[0].players[i].firstName;
                    team.surname = result.teams[0].players[i].surname;
                    if (result.teams[0].players[i].middleName) {
                        team.surname = result.teams[0].players[i].middleName;
                    }
                    team1.push(team);
                } else {
                    var team = {};
                    team.sub1 = result.teams[0].players[i].sfaId;
                    team.firstName = result.teams[0].players[i].firstName;
                    team.surname = result.teams[0].players[i].surname;
                    if (result.teams[0].players[i].middleName) {
                        team.surname = result.teams[0].players[i].middleName;
                    }
                    team1Sub.push(team);
                }
            }
            final.team1 = team1;
            count.push(team1.length);
            final.team1Sub = team1Sub;
            count.push(team1Sub.length);
            var max = count.sort(function (a, b) {
                return b - a;
            });
            console.log("max", max);
            final.max = max[0];
            finalData.push(final);
            callback(null, finalData);
        }
    },

    generatePlayerSpecificHeat: function (data, res) {
        async.waterfall([
                function (callback) {
                    Match.find({
                        sport: data.sport,
                        resultHeat: {
                            $exists: true
                        },
                        opponentsTeam: {
                            $ne: []
                        }
                    }).lean().exec(function (err, match) {
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
                    var finalData = [];
                    var team = {};
                    async.eachSeries(match, function (teams, callback) {
                        var players = [];
                        var matchId = teams.matchId;
                        async.eachSeries(teams.opponentsTeam, function (team, callback) {
                            StudentTeam.find({
                                teamId: team
                            }).lean().deepPopulate("studentId.school teamId").exec(function (err, playerData) {
                                if (err) {
                                    callback(err, null);
                                } else {
                                    if (_.isEmpty(playerData)) {
                                        callback(null, []);
                                    } else {
                                        _.each(playerData, function (n) {
                                            var final = {};
                                            final.matchId = matchId;
                                            final.teamId = n.teamId.teamId;
                                            final.sfaId = n.studentId.sfaId;
                                            final.firstName = n.studentId.firstName;
                                            final.surname = n.studentId.surname;
                                            if (n.studentId.middleName) {
                                                final.middleName = n.studentId.middleName;
                                            }
                                            players.push(final);
                                        });
                                        callback(null, players);
                                    }
                                }
                            });
                        }, function (err) {
                            players = _(players)
                                .groupBy('teamId')
                                .map(function (items, name) {
                                    return {
                                        name: name,
                                        items: items,
                                        count: items.length
                                    };
                                }).value();

                            // console.log("players", players);
                            var teams = {};
                            teams.max = players.length;
                            teams.team = players;
                            var maxplayer = players.sort(function (a, b) {
                                return b.count - a.count
                            });
                            teams.maxplayer = maxplayer[0].count;
                            finalData.push(teams);
                            callback(null, finalData);
                        });
                    }, function (err) {
                        var max = finalData.sort(function (a, b) {
                            return b.max - a.max
                        });
                        var final = {};
                        final.max = max[0].max;
                        final.maxplayer = finalData[0].maxplayer;
                        final.data = finalData;
                        // console.log("max", max);
                        callback(null, final);
                    });
                },
                function (final, callback) {
                    var excelData = [];
                    _.each(final.data, function (n) {
                        var obj = {};
                        obj["MATCH ID"] = n.team[0].items[0].matchId;
                        var c = 0;
                        var playerCount = 0;
                        while (c < final.maxplayer) {
                            playerCount = playerCount + 1;
                            var teamCount = 0;

                            for (var i = 0; i < final.max; i++) {
                                teamCount = teamCount + 1;
                                if (!_.isEmpty(n.team[i])) {
                                    obj["MATCH ID"] = n.team[i].items[c].matchId;
                                    obj["TEAM " + teamCount] = n.team[i].name;
                                    obj["TEAM " + teamCount + " SFA ID "] = n.team[i].items[c].sfaId;
                                    if (n.team[i].items[c].middleName) {
                                        obj["TEAM " + teamCount + " SCREEN NAME"] = n.team[i].items[c].firstName.charAt(0) + "." + n.team[i].items[c].middleName.charAt(0) + "." + n.team[i].items[c].surname;
                                    } else {
                                        obj["TEAM " + teamCount + " SCREEN NAME"] = n.team[i].items[c].firstName.charAt(0) + "." + n.team[i].items[c].surname;
                                    }

                                } else {
                                    obj["TEAM " + teamCount] = "";
                                    obj["SFA ID" + playerCount] = "";
                                    obj["SCREEN NAME " + playerCount] = "";
                                }
                            }
                            excelData.push(obj);
                            var obj = {};
                            c++;
                        }

                        var temp = {};
                        excelData.push(temp);
                    });
                    callback(null, excelData);
                }
            ],
            function (err, excelData) {
                // callback(null, excelData);
                Config.generateExcel("KnockoutIndividual", excelData, res);
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
                    } else if (data.playerType == "team" && data.playerSpecific == "no") {
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
                                console.log("opponentsSingle********", matchData.opponentsSingle[i], "matchid", matchData.matchId);
                                obj["SFA ID"] = matchData.opponentsSingle[i].athleteId.sfaId;
                                if (matchData.opponentsSingle[i].athleteId.middleName) {
                                    obj["NAME"] = matchData.opponentsSingle[i].athleteId.firstName + " " + matchData.opponentsSingle[i].athleteId.middleName + " " + matchData.opponentsSingle[i].athleteId.surname;
                                } else {
                                    obj["NAME"] = matchData.opponentsSingle[i].athleteId.firstName + " " + matchData.opponentsSingle[i].athleteId.surname;
                                }
                                if (matchData.opponentsSingle[i].athleteId.atheleteSchoolName) {
                                    obj["SCHOOL"] = matchData.opponentsSingle[i].athleteId.atheleteSchoolName;
                                } else {
                                    obj["SCHOOL"] = matchData.opponentsSingle[i].athleteId.school.name;
                                }
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
                                obj["VIDEO TYPE"] = "";
                                obj["VIDEO"] = "";
                            } else {
                                if (!_.isEmpty(obj["SFA ID"])) {
                                    obj["RESULT"] = "-";
                                    obj["VIDEO TYPE"] = "";
                                    obj["VIDEO"] = "";
                                } else {
                                    obj["RESULT"] = "";
                                    obj["VIDEO TYPE"] = "";
                                    obj["VIDEO"] = "";
                                }
                            }
                            if (mainData.videoType) {
                                obj["VIDEO TYPE"] = mainData.videoType;
                            } else {
                                obj["VIDEO TYPE"] = "";
                            }
                            if (mainData.video) {
                                obj["VIDEO"] = mainData.video;
                            } else {
                                obj["VIDEO"] = "";
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
                    obj["VIDEO TYPE"] = "";
                    obj["VIDEO"] = "";
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
                    async.concatSeries(matchData.resultHeat.teams, function (mainData, callback) {
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
                            if (mainData.videoType) {
                                obj["VIDEO TYPE"] = mainData.videoType;
                            } else {
                                obj["VIDEO TYPE"] = "";
                            }
                            if (mainData.video) {
                                obj["VIDEO"] = mainData.video;
                            } else {
                                obj["VIDEO"] = "";
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
                    } else if (matchData.sport.gender == "female") {
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
                    callback(null, obj);
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
                var dateTime = moment(mainData.scheduleDate).format('DD/MM/YYYY');
                obj.DATE = dateTime;
                obj.TIME = mainData.scheduleTime;
                if (mainData.opponentsSingle[0]) {
                    obj["SFA ID"] = mainData.opponentsSingle[0].athleteId.sfaId;
                    if (mainData.opponentsSingle[0].athleteId.middleName) {
                        obj["NAME"] = mainData.opponentsSingle[0].athleteId.firstName + " " + mainData.opponentsSingle[0].athleteId.middleName + " " + mainData.opponentsSingle[0].athleteId.surname;
                    } else {
                        obj["NAME"] = mainData.opponentsSingle[0].athleteId.firstName + " " + mainData.opponentsSingle[0].athleteId.surname;
                    }
                    if (mainData.opponentsSingle[0].athleteId.atheleteSchoolName) {
                        obj["SCHOOL"] = mainData.opponentsSingle[0].athleteId.atheleteSchoolName;
                    } else {
                        obj["SCHOOL"] = mainData.opponentsSingle[0].athleteId.school.name;
                    }
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
                        if (mainData.resultQualifyingRound.player.attempt[3]) {
                            obj["ATTEMPT 4"] = mainData.resultQualifyingRound.player.attempt[3];
                        } else {
                            obj["ATTEMPT 4"] = "";
                        }
                        if (mainData.resultQualifyingRound.player.attempt[4]) {
                            obj["ATTEMPT 5"] = mainData.resultQualifyingRound.player.attempt[4];
                        } else {
                            obj["ATTEMPT 5"] = "";
                        }
                        if (mainData.resultQualifyingRound.player.attempt[5]) {
                            obj["ATTEMPT 6"] = mainData.resultQualifyingRound.player.attempt[5];
                        } else {
                            obj["ATTEMPT 6"] = "";
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
                        obj["ATTEMPT 4"] = "";
                        obj["ATTEMPT 5"] = "";
                        obj["ATTEMPT 6"] = "";
                        obj["BEST ATTEMPT"] = "";
                        obj["RESULT"] = "";
                    }
                    if (mainData.videoType) {
                        obj["VIDEO TYPE"] = mainData.videoType;
                    } else {
                        obj["VIDEO TYPE"] = "";
                    }
                    if (mainData.video) {
                        obj["VIDEO"] = mainData.video;
                    } else {
                        obj["VIDEO"] = "";
                    }
                } else {
                    obj["SFA ID"] = "";
                    obj["NAME"] = "";
                    obj["SCHOOL"] = "";
                    obj["ATTEMPT 1"] = "";
                    obj["ATTEMPT 2"] = "";
                    obj["ATTEMPT 3"] = "";
                    obj["ATTEMPT 4"] = "";
                    obj["ATTEMPT 5"] = "";
                    obj["ATTEMPT 6"] = "";
                    obj["BEST ATTEMPT"] = "";
                    obj["RESULT"] = "";
                    obj["VIDEO TYPE"] = "";
                    obj["VIDEO"] = "";
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
                            var dateTime = moment(mainData.scheduleDate).format('DD/MM/YYYY');
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
                                if (mainData.opponentsSingle[0].athleteId.atheleteSchoolName) {
                                    obj["SCHOOL"] = mainData.opponentsSingle[0].athleteId.atheleteSchoolName;
                                } else {
                                    obj["SCHOOL"] = mainData.opponentsSingle[0].athleteId.school.name;

                                }

                                if (mainData.resultQualifyingRound) {
                                    obj["SCORE - ROUND 1"] = mainData.resultQualifyingRound.player.attempt[0];
                                    obj["SCORE - ROUND 2"] = mainData.resultQualifyingRound.player.attempt[1];
                                    obj["FINAL SCORE"] = mainData.resultQualifyingRound.player.finalScore;
                                    obj["RANK"] = mainData.resultQualifyingRound.player.rank;
                                    obj["RESULT"] = mainData.resultQualifyingRound.player.result;
                                    // if (mainData.resultQualifyingRound.player.video) {
                                    //     obj["Video"] = mainData.resultQualifyingRound.player.video;
                                    // } else {
                                    //     obj["Video"] = "";
                                    // }
                                    // if (mainData.resultQualifyingRound.player.matchCenter) {
                                    //     obj["MatchCenter"] = mainData.resultQualifyingRound.player.matchCenter;
                                    // } else {
                                    //     obj["MatchCenter"] = "";
                                    // }
                                    obj["VIDEO TYPE"] = "";
                                    obj["VIDEO"] = "";
                                } else {
                                    obj["SCORE - ROUND 1"] = "";
                                    obj["SCORE - ROUND 2"] = "";
                                    obj["FINAL SCORE"] = "";
                                    obj["RANK"] = "";
                                    obj["RESULT"] = "";
                                    obj["MatchCenter"] = "";
                                }
                                if (mainData.videoType) {
                                    obj["VIDEO TYPE"] = mainData.videoType;
                                } else {
                                    obj["VIDEO TYPE"] = "";
                                }
                                if (mainData.video) {
                                    obj["VIDEO"] = mainData.video;
                                } else {
                                    obj["VIDEO"] = "";
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
                                obj["VIDEO TYPE"] = "";
                                obj["VIDEO"] = "";
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
                            var dateTime = moment(mainData.scheduleDate).format('DD/MM/YYYY');
                            obj.DATE = dateTime;
                            obj.TIME = mainData.scheduleTime;
                            if (mainData.opponentsSingle.length > 0) {
                                obj["SFAID 1"] = mainData.opponentsSingle[0].athleteId.sfaId;
                                if (mainData.opponentsSingle[0].athleteId.middleName) {
                                    obj["PARTICIPANT 1"] = mainData.opponentsSingle[0].athleteId.firstName + " " + mainData.opponentsSingle[0].athleteId.middleName + " " + mainData.opponentsSingle[0].athleteId.surname;
                                } else {
                                    obj["PARTICIPANT 1"] = mainData.opponentsSingle[0].athleteId.firstName + " " + mainData.opponentsSingle[0].athleteId.surname;
                                }

                                if (mainData.opponentsSingle[0].athleteId.atheleteSchoolName) {
                                    obj["SCHOOL 1"] = mainData.opponentsSingle[0].athleteId.atheleteSchoolName;
                                } else {
                                    obj["SCHOOL 1"] = mainData.opponentsSingle[0].athleteId.school.name;
                                }
                            } else {
                                obj["SFAID 1"] = "";
                                obj["PARTICIPANT 1"] = "";
                                obj["SCHOOL 1"] = "";
                            }

                            if (mainData.opponentsSingle.length > 1) {
                                obj["SFAID 2"] = mainData.opponentsSingle[1].athleteId.sfaId;
                                if (mainData.opponentsSingle[1].athleteId.middleName) {
                                    obj["PARTICIPANT 2"] = mainData.opponentsSingle[1].athleteId.firstName + " " + mainData.opponentsSingle[1].athleteId.middleName + " " + mainData.opponentsSingle[1].athleteId.surname;
                                } else {
                                    obj["PARTICIPANT 2"] = mainData.opponentsSingle[1].athleteId.firstName + " " + mainData.opponentsSingle[1].athleteId.surname;
                                }
                                if (mainData.opponentsSingle[1].athleteId.atheleteSchoolName) {
                                    obj["SCHOOL 2"] = mainData.opponentsSingle[1].athleteId.atheleteSchoolName;
                                } else {
                                    obj["SCHOOL 2"] = mainData.opponentsSingle[1].athleteId.school.name;
                                }
                            } else {
                                obj["SFAID 2"] = "";
                                obj["PARTICIPANT 2"] = "";
                                obj["SCHOOL 2"] = "";
                            }

                            if (mainData.resultKnockout) {
                                if (mainData.resultKnockout.players.length == 2) {
                                    if (mainData.players[0].player.noShow == true) {
                                        obj["Player 1 Attendence"] = "A";
                                    } else {
                                        obj["Player 1 Attendence"] = "P";
                                    }
                                    if (mainData.players[1].player.noShow == true) {
                                        obj["Player 2 Attendence"] = "A";
                                    } else {
                                        obj["Player 2 Attendence"] = "P";
                                    }
                                } else if (mainData.resultKnockout.players.length == 1) {
                                    if (mainData.players[0].player.noShow == true) {
                                        obj["Player 1 Attendence"] = "A";
                                    } else {
                                        obj["Player 1 Attendence"] = "P";
                                    }
                                }
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
                                obj["Player 1 Attendence"] = "";
                                obj["Player 2 Attendence"] = "";
                                obj["FINAL SCORE "] = "";
                                obj["SHOOTOUT SCORE"] = "";
                                obj["WINNER NAME"] = "";
                                obj["WINNER SFA ID "] = "";

                            }
                            if (mainData.videoType) {
                                obj["VIDEO TYPE"] = mainData.videoType;
                            } else {
                                obj["VIDEO TYPE"] = "";
                            }
                            if (mainData.video) {
                                obj["VIDEO"] = mainData.video;
                            } else {
                                obj["VIDEO"] = "";
                            }

                            // } else {
                            //     obj["SFAID 2"] = "";
                            //     obj["PARTICIPANT 2"] = "";
                            //     obj["SCHOOL 2"] = "";
                            //     obj["Player 1 Attendence"] = "";
                            //     obj["Player 2 Attendence"] = "";
                            //     obj["FINAL SCORE "] = "";
                            //     obj["SHOOTOUT SCORE"] = "";
                            //     obj["WINNER NAME"] = "";
                            //     obj["WINNER SFA ID "] = "";
                            //     obj["VIDEO TYPE"] = "";
                            //     obj["VIDEO"] = "";
                            // }
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
                            obj["MATCH ID"] = mainData.matchId;
                            var dateTime = moment(mainData.scheduleDate).format('DD/MM/YYYY');
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
                            obj["ROUND"] = mainData.round;
                            if (stage == "league") {
                                if (i == 1) {
                                    prevRound = mainData.round;
                                    obj["MATCH NO"] = "MATCH " + i++;
                                } else {
                                    if (prevRound == mainData.round) {
                                        obj["MATCH NO"] = "MATCH " + i++;
                                    } else {
                                        i = 1;
                                        prevRound = mainData.round;
                                        obj["MATCH NO"] = "MATCH " + i++;
                                    }
                                }
                            } else {
                                obj["MATCH NO"] = "";
                            }
                            if (mainData.opponentsTeam.length > 0) {
                                obj["TEAM 1"] = mainData.opponentsTeam[0].teamId;
                                obj["TEAM NAME 1"] = mainData.opponentsTeam[0].name;
                                obj["SCHOOL 1"] = mainData.opponentsTeam[0].schoolName;
                                if (mainData.resultFootball) {
                                    obj["COACH NAME 1"] = mainData.resultFootball.teams[0].coach;
                                    obj["TEAM SPECIFIC DATA POINTS 1"] = "ShotsOnGoal:" + mainData.resultFootball.teams[0].teamResults.shotsOnGoal + ", TotalShots:" + mainData.resultFootball.teams[0].teamResults.totalShots + ", Corners:" + mainData.resultFootball.teams[0].teamResults.corners + ", Penalty:" + mainData.resultFootball.teams[0].teamResults.penalty + ", Saves:" + mainData.resultFootball.teams[0].teamResults.saves + ", Fouls:" + mainData.resultFootball.teams[0].teamResults.fouls + ", OffSide:" + mainData.resultFootball.teams[0].teamResults.offSide + ", CleanSheet:" + mainData.resultFootball.teams[0].teamResults.cleanSheet;
                                    if (mainData.opponentsTeam.length == 1 && mainData.resultFootball.winner.player === mainData.opponentsTeam[0]._id.toString()) {
                                        obj["RESULT 1"] = "Bye";
                                    } else if (mainData.resultFootball.winner.player === mainData.opponentsTeam[0]._id.toString()) {
                                        if (mainData.resultFootball.teams[0].walkover == true) {
                                            obj["RESULT 1"] = "walkover";
                                        } else {
                                            obj["RESULT 1"] = "Won";
                                        }
                                    } else {
                                        if (mainData.resultFootball.isNoMatch == false) {
                                            if (mainData.resultFootball.teams[0].walkover == false && mainData.resultFootball.teams[0].noShow == false) {
                                                obj["RESULT 1"] = "Lost";
                                            } else if (mainData.resultFootball.teams[0].walkover == true) {
                                                obj["RESULT 1"] = "walkover";
                                            } else {
                                                obj["RESULT 1"] = "noShow";
                                            }
                                        } else {
                                            obj["RESULT 1"] = "No Match";
                                        }
                                    }
                                } else if (mainData.resultBasketball) {
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
                                    if (mainData.opponentsTeam.length == 1 && mainData.resultBasketball.winner.player === mainData.opponentsTeam[0]._id.toString()) {
                                        obj["RESULT 1"] = "Bye";
                                    } else if (mainData.resultBasketball.winner.player === mainData.opponentsTeam[0]._id.toString()) {
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

                                } else if (mainData.resultThrowball) {
                                    var i;
                                    var sNo = 1;
                                    for (i = 0; i < mainData.resultThrowball.teams[0].teamResults.sets.length; i++) {
                                        if (i == 0) {
                                            obj["Set 1"] = "Set" + sNo + "-" + mainData.resultThrowball.teams[0].teamResults.sets[i].point;
                                            sNo++;
                                        } else {
                                            obj["Set 1"] = obj["Set 1"] + "," + "Set" + sNo + "-" + mainData.resultThrowball.teams[0].teamResults.sets[i].point;
                                            sNo++;
                                        }
                                    }
                                    if (mainData.opponentsTeam.length == 1 && mainData.resultThrowball.winner.player === mainData.opponentsTeam[0]._id.toString()) {
                                        obj["RESULT 1"] = "Bye";
                                    } else if (mainData.resultThrowball.winner.player === mainData.opponentsTeam[0]._id.toString()) {
                                        if (mainData.resultThrowball.teams[0].walkover == true) {
                                            obj["RESULT 1"] = "walkover";
                                        } else {
                                            obj["RESULT 1"] = "Won";
                                        }
                                    } else {
                                        if (mainData.resultThrowball.isNoMatch == false) {
                                            if (mainData.resultThrowball.teams[0].walkover == false && mainData.resultThrowball.teams[0].noShow == false) {
                                                obj["RESULT 1"] = "Lost";
                                            } else if (mainData.resultThrowball.teams[0].walkover == true) {
                                                obj["RESULT 1"] = "walkover";
                                            } else {
                                                obj["RESULT 1"] = "noShow";
                                            }
                                        } else {
                                            obj["RESULT 1"] = "No Match";
                                        }
                                    }

                                } else if (mainData.resultWaterPolo) {
                                    var i;
                                    var sNo = 1;
                                    for (i = 0; i < mainData.resultWaterPolo.teams[0].teamResults.quarterPoints.length; i++) {
                                        if (i == 0) {
                                            obj["QUARTER SCORE 1"] = "Q" + sNo + "-" + mainData.resultWaterPolo.teams[0].teamResults.quarterPoints[i].basket;
                                            sNo++;
                                        } else {
                                            obj["QUARTER SCORE 1"] = obj["QUARTER SCORE 0"] + "," + "Q" + i + "-" + mainData.resultWaterPolo.teams[0].teamResults.quarterPoints[i].basket;
                                            sNo++;
                                        }
                                    }
                                    if (mainData.opponentsTeam[0]) {
                                        obj["FINAL SCORE 1"] = mainData.resultWaterPolo.teams[0].teamResults.finalGoalPoints + "-" + mainData.resultWaterPolo.teams[0].teamResults.finalGoalPoints;
                                    } else {
                                        obj["FINAL SCORE 1"] = mainData.resultWaterPolo.teams[0].teamResults.finalGoalPoints;
                                    }
                                    obj["DATA POINTS 1"] = "shotsOnGoal:" + mainData.resultWaterPolo.teams[0].teamResults.shotsOnGoal + ",totalShots:" + mainData.resultWaterPolo.teams[0].teamResults.totalShots + ",penalty:" + mainData.resultWaterPolo.teams[0].teamResults.penalty + ",penaltyPoints:" + mainData.resultWaterPolo.teams[0].teamResults.penaltyPoints + ",saves:" + mainData.resultWaterPolo.teams[0].teamResults.saves;
                                    if (mainData.opponentsTeam.length == 1 && mainData.resultWaterPolo.winner.player === mainData.opponentsTeam[0]._id.toString()) {
                                        obj["RESULT 1"] = "Bye";
                                    } else if (mainData.resultWaterPolo.winner.player === mainData.opponentsTeam[0]._id.toString()) {
                                        if (mainData.resultWaterPolo.teams[0].walkover == true) {
                                            obj["RESULT 1"] = "walkover";
                                        } else {
                                            obj["RESULT 1"] = "Won";
                                        }
                                    } else {
                                        if (mainData.resultWaterPolo.isNoMatch == false) {
                                            if (mainData.resultWaterPolo.teams[0].walkover == false && mainData.resultWaterPolo.teams[0].noShow == false) {
                                                obj["RESULT 1"] = "Lost";
                                            } else if (mainData.resultWaterPolo.teams[0].walkover == true) {
                                                obj["RESULT 1"] = "walkover";
                                            } else {
                                                obj["RESULT 1"] = "noShow";
                                            }
                                        } else {
                                            obj["RESULT 1"] = "No Match";
                                        }
                                    }
                                } else if (mainData.resultVolleyball) {
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
                                    if (mainData.opponentsTeam.length == 1 && mainData.resultVolleyball.winner.player === mainData.opponentsTeam[0]._id.toString()) {
                                        obj["RESULT 1"] = "Bye";
                                    } else if (mainData.resultVolleyball.winner.player === mainData.opponentsTeam[0]._id.toString()) {
                                        console.log('----------------------++++++++++++++++++++++++++++++++-----------------------------');
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
                                } else if (mainData.resultHockey) {
                                    obj["DATA POINTS 1"] = "Penality:" + mainData.resultHockey.teams[0].teamResults.penality + ",penaltyPoints:" + mainData.resultHockey.teams[0].teamResults.penaltyPoints + ",penaltyCorners:" + mainData.resultHockey.teams[0].teamResults.penaltyCorners + ",penaltyStroke:" + mainData.resultHockey.teams[0].teamResults.penaltyStroke + ",saves:" + mainData.resultHockey.teams[0].teamResults.saves + ",fouls:" + mainData.resultHockey.teams[0].teamResults.fouls;
                                    obj["SCORE 1"] = "HalfPoints: " + mainData.resultHockey.teams[0].teamResults.halfPoints + "," + "FinalPoints: " + mainData.resultHockey.teams[0].teamResults.finalPoints;
                                    if (mainData.opponentsTeam.length == 1 && mainData.resultHockey.winner.player === mainData.opponentsTeam[0]._id.toString()) {
                                        obj["RESULT 1"] = "Bye";
                                    } else if (mainData.resultHockey.winner.player === mainData.opponentsTeam[0]._id.toString()) {
                                        if (mainData.resultHockey.teams[0].walkover == true) {
                                            obj["RESULT 1"] = "walkover";
                                        } else {
                                            obj["RESULT 1"] = "Won";
                                        }
                                    } else {
                                        if (mainData.resultHockey.isNoMatch == false) {
                                            if (mainData.resultHockey.teams[0].walkover == false && mainData.resultHockey.teams[0].noShow == false) {
                                                obj["RESULT 1"] = "Lost";
                                            } else if (mainData.resultHockey.teams[0].walkover == true) {
                                                obj["RESULT 1"] = "walkover";
                                            } else {
                                                obj["RESULT 1"] = "noShow";
                                            }
                                        } else {
                                            obj["RESULT 1"] = "No Match";
                                        }
                                    }
                                } else if (mainData.resultHandball) {
                                    obj["HALF SCORE 1"] = mainData.resultHandball.teams[0].teamResults.halfPoints;
                                    obj["FINAL SCORE 1"] = mainData.resultHandball.teams[0].teamResults.finalPoints;
                                    obj["DATA POINTS 1"] = "Penalty:" + mainData.resultHandball.teams[0].teamResults.penalty + ",Saves:" + mainData.resultHandball.teams[0].teamResults.saves + ",ShotsOnGoal:" + mainData.resultHandball.teams[0].teamResults.shotsOnGoal;
                                    if (mainData.opponentsTeam.length == 1 && mainData.resultHandball.winner.player === mainData.opponentsTeam[0]._id.toString()) {
                                        obj["RESULT 1"] = "Bye";
                                    } else if (mainData.resultHandball.winner.player === mainData.opponentsTeam[0]._id.toString()) {
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
                                } else if (mainData.resultKabaddi) {
                                    obj["HALF SCORE 1"] = mainData.resultKabaddi.teams[0].teamResults.halfPoints;
                                    obj["FINAL SCORE 1"] = mainData.resultKabaddi.teams[0].teamResults.finalPoints;
                                    obj["DATA POINTS 1"] = "AllOut:" + mainData.resultKabaddi.teams[0].teamResults.allOut + ",SuperTackle:" + mainData.resultKabaddi.teams[0].teamResults.superTackle;

                                    if (mainData.opponentsTeam.length == 1 && mainData.resultKabaddi.winner.player === mainData.opponentsTeam[0]._id.toString()) {
                                        obj["RESULT 1"] = "Bye";
                                    } else if (mainData.resultKabaddi.winner.player === mainData.opponentsTeam[0]._id.toString()) {
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
                                    obj["COACH NAME 2"] = mainData.resultFootball.teams[1].coach;
                                    obj["TEAM SPECIFIC DATA POINTS 2"] = "ShotsOnGoal:" + mainData.resultFootball.teams[1].teamResults.shotsOnGoal + ", TotalShots:" + mainData.resultFootball.teams[1].teamResults.totalShots + ", Corners:" + mainData.resultFootball.teams[1].teamResults.corners + ", Penalty:" + mainData.resultFootball.teams[1].teamResults.penalty + ", Saves:" + mainData.resultFootball.teams[1].teamResults.saves + ", Fouls:" + mainData.resultFootball.teams[1].teamResults.fouls + ", OffSide:" + mainData.resultFootball.teams[1].teamResults.offSide + ", CleanSheet:" + mainData.resultFootball.teams[1].teamResults.cleanSheet;
                                    obj["FINAL SCORE"] = mainData.resultFootball.teams[0].teamResults.finalPoints + "-" + mainData.resultFootball.teams[1].teamResults.finalPoints;
                                    if (mainData.resultFootball.winner.player === mainData.opponentsTeam[1]._id.toString()) {
                                        if (mainData.resultFootball.teams[1].walkover == true) {
                                            obj["RESULT 2"] = "walkover";
                                        } else {
                                            obj["RESULT 2"] = "Won";
                                        }
                                    } else {
                                        if (mainData.resultFootball.isNoMatch == false) {
                                            if (mainData.resultFootball.teams[1].walkover == false && mainData.resultFootball.teams[1].noShow == false) {
                                                obj["RESULT 2"] = "Lost";
                                            } else if (mainData.resultFootball.teams[1].walkover == true) {
                                                obj["RESULT 2"] = "walkover";
                                            } else {
                                                obj["RESULT 2"] = "noShow";
                                            }
                                        } else {
                                            obj["RESULT 2"] = "No Match";
                                        }
                                    }

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
                                } else if (mainData.resultBasketball) {
                                    if (mainData.resultBasketball.winner.player === mainData.opponentsTeam[1]._id.toString()) {
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
                                    if (!_.isEmpty(mainData.resultBasketball.winner) && mainData.resultBasketball.isNoMatch == false || mainData.resultBasketball.isDraw == false) {
                                        if (mainData.opponentsTeam[0]._id.equals(mainData.resultBasketball.winner.player)) {
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

                                    var i;
                                    var sNo = 1;
                                    for (i = 0; i < mainData.resultBasketball.teams[1].teamResults.quarterPoints.length; i++) {
                                        if (i == 0) {
                                            obj["QUARTER SCORE 2"] = "Q" + sNo + "-" + mainData.resultBasketball.teams[1].teamResults.quarterPoints[i].basket;
                                            sNo++;
                                        } else {
                                            obj["QUARTER SCORE 2"] = obj["QUARTER SCORE 2"] + "," + "Q" + i + "-" + mainData.resultBasketball.teams[1].teamResults.quarterPoints[i].basket;
                                            sNo++;
                                        }
                                    }
                                    if (mainData.opponentsTeam[1]) {
                                        obj["FINAL SCORE"] = mainData.resultBasketball.teams[0].teamResults.finalGoalPoints + "-" + mainData.resultBasketball.teams[1].teamResults.finalGoalPoints;
                                    } else {
                                        obj["FINAL SCORE"] = mainData.resultBasketball.teams[0].teamResults.finalGoalPoints;
                                    }
                                } else if (mainData.resultThrowball) {
                                    if (mainData.resultThrowball.winner.player === mainData.opponentsTeam[1]._id.toString()) {
                                        if (mainData.resultThrowball.teams[1].walkover == true) {
                                            obj["RESULT 2"] = "walkover";
                                        } else {
                                            obj["RESULT 2"] = "Won";
                                        }
                                    } else {
                                        if (mainData.resultThrowball.isNoMatch == false) {
                                            if (mainData.resultThrowball.teams[1].walkover == false && mainData.resultThrowball.teams[1].noShow == false) {
                                                obj["RESULT 2"] = "Lost";
                                            } else if (mainData.resultThrowball.teams[1].walkover == true) {
                                                obj["RESULT 2"] = "walkover";
                                            } else {
                                                obj["RESULT 2"] = "noShow";
                                            }
                                        } else {
                                            obj["RESULT 2"] = "No Match";
                                        }
                                    }
                                    if (!_.isEmpty(mainData.resultThrowball.winner) && mainData.resultThrowball.isNoMatch == false || mainData.resultThrowball.isDraw == false) {
                                        if (mainData.opponentsTeam[0]._id.equals(mainData.resultThrowball.winner.player)) {
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

                                    var i;
                                    var sNo = 1;
                                    for (i = 0; i < mainData.resultThrowball.teams[1].teamResults.sets.length; i++) {
                                        if (i == 0) {
                                            obj["Set 2"] = "Set" + sNo + "-" + mainData.resultThrowball.teams[1].teamResults.sets[i].point;
                                            sNo++;
                                        } else {
                                            obj["Set 2"] = obj["Set 2"] + "," + "Set" + i + "-" + mainData.resultThrowball.teams[1].teamResults.sets[i].point;
                                            sNo++;
                                        }
                                    }
                                    if (mainData.opponentsTeam[1]) {
                                        obj["FINAL SCORE"] = mainData.resultThrowball.teams[0].teamResults.finalGoalPoints + "-" + mainData.resultThrowball.teams[1].teamResults.finalGoalPoints;
                                    } else {
                                        obj["FINAL SCORE"] = mainData.resultThrowball.teams[0].teamResults.finalGoalPoints;
                                    }
                                } else if (mainData.resultWaterPolo) {
                                    if (mainData.resultWaterPolo.winner.player === mainData.opponentsTeam[1]._id.toString()) {
                                        if (mainData.resultWaterPolo.teams[1].walkover == true) {
                                            obj["RESULT 2"] = "walkover";
                                        } else {
                                            obj["RESULT 2"] = "Won";
                                        }
                                    } else {
                                        if (mainData.resultWaterPolo.isNoMatch == false) {
                                            if (mainData.resultWaterPolo.teams[1].walkover == false && mainData.resultWaterPolo.teams[1].noShow == false) {
                                                obj["RESULT 2"] = "Lost";
                                            } else if (mainData.resultWaterPolo.teams[1].walkover == true) {
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
                                    for (i = 0; i < mainData.resultWaterPolo.teams[1].teamResults.quarterPoints.length; i++) {
                                        if (i == 0) {
                                            obj["QUARTER SCORE 2"] = "Q" + sNo + "-" + mainData.resultWaterPolo.teams[1].teamResults.quarterPoints[i].basket;
                                            sNo++;
                                        } else {
                                            obj["QUARTER SCORE 2"] = obj["QUARTER SCORE 1"] + "," + "Q" + i + "-" + mainData.resultWaterPolo.teams[1].teamResults.quarterPoints[i].basket;
                                            sNo++;
                                        }
                                    }
                                    if (mainData.opponentsTeam[1]) {
                                        obj["FINAL SCORE"] = mainData.resultWaterPolo.teams[0].teamResults.finalGoalPoints + "-" + mainData.resultWaterPolo.teams[1].teamResults.finalGoalPoints;
                                    } else {
                                        obj["FINAL SCORE"] = mainData.resultWaterPolo.teams[0].teamResults.finalGoalPoints;
                                    }
                                    obj["DATA POINTS 2"] = "shotsOnGoal:" + mainData.resultHockey.teams[1].teamResults.shotsOnGoal + ",totalShots:" + mainData.resultHockey.teams[1].teamResults.totalShots + ",penalty:" + mainData.resultHockey.teams[1].teamResults.penalty + ",penaltyPoints:" + mainData.resultHockey.teams[1].teamResults.penaltyPoints + ",saves:" + mainData.resultHockey.teams[1].teamResults.saves;
                                    if (!_.isEmpty(mainData.resultWaterPolo.winner) && mainData.resultWaterPolo.isNoMatch == false || mainData.resultWaterPolo.isDraw == false) {
                                        if (mainData.opponentsTeam[0]._id.equals(mainData.resultWaterPolo.winner.player)) {
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
                                } else if (mainData.resultHockey) {
                                    if (mainData.resultHockey.winner.player === mainData.opponentsTeam[1]._id.toString()) {
                                        if (mainData.resultHockey.teams[0].walkover == true) {
                                            obj["RESULT 2"] = "walkover";
                                        } else {
                                            obj["RESULT 2"] = "Won";
                                        }
                                    } else {
                                        if (mainData.resultHockey.isNoMatch == false) {
                                            if (mainData.resultHockey.teams[1].walkover == false && mainData.resultHockey.teams[1].noShow == false) {
                                                obj["RESULT 2"] = "Lost";
                                            } else if (mainData.resultHockey.teams[1].walkover == true) {
                                                obj["RESULT 2"] = "walkover";
                                            } else {
                                                obj["RESULT 2"] = "noShow";
                                            }
                                        } else {
                                            obj["RESULT 2"] = "No Match";
                                        }
                                    }
                                    obj["DATA POINTS 2"] = "Penality:" + mainData.resultHockey.teams[1].teamResults.penality + ",penaltyPoints:" + mainData.resultHockey.teams[1].teamResults.penaltyPoints + ",penaltyCorners:" + mainData.resultHockey.teams[1].teamResults.penaltyCorners + ",penaltyStroke:" + mainData.resultHockey.teams[1].teamResults.penaltyStroke + ",saves:" + mainData.resultHockey.teams[1].teamResults.saves + ",fouls:" + mainData.resultHockey.teams[1].teamResults.fouls;
                                    obj["SCORE 2"] = "HalfPoints: " + mainData.resultHockey.teams[1].teamResults.halfPoints + "," + "FinalPoints: " + mainData.resultHockey.teams[1].teamResults.finalPoints;
                                    if (!_.isEmpty(mainData.resultHockey.winner) && mainData.resultHockey.isNoMatch == false || mainData.resultHockey.isDraw == false) {
                                        if (mainData.opponentsTeam[0]._id.equals(mainData.resultHockey.winner.player)) {
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
                                } else if (mainData.resultVolleyball) {

                                    if (mainData.resultVolleyball.winner.player === mainData.opponentsTeam[1]._id.toString()) {
                                        console.log('++++++++++++++++++++------------------------------+++++++++++++++++++++++++');
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
                                            } else if (mainData.resultVolleyball.teams[1].noShow == true) {
                                                obj["RESULT 2"] = "noShow";
                                            }
                                        } else {
                                            obj["RESULT 2"] = "No Match";
                                        }
                                    }
                                    var i;
                                    var sNo = 1;
                                    for (i = 1; i < mainData.resultVolleyball.teams[1].teamResults.sets.length; i++) {
                                        if (i == 0) {
                                            obj["SCORE 2"] = "Set" + sNo + "-" + mainData.resultVolleyball.teams[1].teamResults.sets[i].points;
                                            sNo++;
                                        } else {
                                            obj["SCORE 2"] = obj["SCORE 2"] + "," + "Set" + sNo + "-" + mainData.resultVolleyball.teams[1].teamResults.quarterPoints[i].basket;
                                            sNo++;
                                        }
                                    }
                                    obj["DATA POINTS 2"] = "Spike:" + mainData.resultVolleyball.teams[1].teamResults.spike + ",Fouls:" + mainData.resultVolleyball.teams[0].teamResults.fouls + ",Block:" + mainData.resultVolleyball.teams[0].teamResults.block;
                                    if (!_.isEmpty(mainData.resultVolleyball.winner) && mainData.resultVolleyball.isNoMatch == false || mainData.resultVolleyball.isDraw == false) {
                                        if (mainData.opponentsTeam[0]._id.equals(mainData.resultVolleyball.winner.player)) {
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
                                } else if (mainData.resultHandball) {
                                    if (!_.isEmpty(mainData.resultHandball.winner) && mainData.resultHandball.isNoMatch == false || mainData.resultHandball.isDraw == false) {
                                        if (mainData.opponentsTeam[0]._id.equals(mainData.resultHandball.winner.player)) {
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
                                    // if (mainData.resultHandball.winner.player === mainData.opponentsTeam[1]._id.toString()) {
                                    //     if (mainData.resultHandball.teams[1].walkover == true) {
                                    //         obj["RESULT 2"] = "walkover";
                                    //     } else {
                                    //         obj["RESULT 2"] = "Won";
                                    //     }
                                    // } else {
                                    //     if (mainData.resultHandball.isNoMatch == false) {
                                    //         if (mainData.resultHandball.teams[1].walkover == false && mainData.resultHandball.teams[1].noShow == false) {
                                    //             obj["RESULT 2"] = "Lost";
                                    //         } else if (mainData.resultHandball.teams[0].walkover == true) {
                                    //             obj["RESULT 2"] = "walkover";
                                    //         } else {
                                    //             obj["RESULT 2"] = "noShow";
                                    //         }
                                    //     } else {
                                    //         obj["RESULT 2"] = "No Match";
                                    //     }
                                    // }
                                    obj["HALF SCORE 2"] = mainData.resultHandball.teams[1].teamResults.halfPoints;
                                    obj["FINAL SCORE 2"] = mainData.resultHandball.teams[1].teamResults.finalPoints;
                                    obj["DATA POINTS 2"] = "Penalty:" + mainData.resultHandball.teams[1].teamResults.penalty + ",Saves:" + mainData.resultHandball.teams[0].teamResults.saves + ",ShotsOnGoal:" + mainData.resultHandball.teams[0].teamResults.shotsOnGoal;
                                } else if (mainData.resultKabaddi) {
                                    if (mainData.resultKabaddi.winner.player === mainData.opponentsTeam[1]._id.toString()) {
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
                                    if (!_.isEmpty(mainData.resultKabaddi.winner) && mainData.resultKabaddi.isNoMatch == false || mainData.resultKabaddi.isDraw == false) {
                                        if (mainData.opponentsTeam[0]._id.equals(mainData.resultKabaddi.winner.player)) {
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
                                } else {
                                    obj["COACH NAME 1"] = "";
                                    obj["TEAM SPECIFIC DATA POINTS 1"] = "";
                                    obj["FINAL SCORE"] = "";
                                    obj["WINNER NAME"] = "";
                                    obj["WINNER TEAM ID"] = "";
                                }
                                if (mainData.videoType) {
                                    obj["VIDEO TYPE"] = mainData.videoType;
                                } else {
                                    obj["VIDEO TYPE"] = "";
                                }
                                if (mainData.video) {
                                    obj["VIDEO"] = mainData.video;
                                } else {
                                    obj["VIDEO"] = "";
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
                                obj["VIDEO TYPE"] = "";
                                obj["VIDEO"] = "";
                            }
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

    generateLeagueKnockoutFencing: function (data, res) {
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
                            obj["MATCH ID"] = mainData.matchId;
                            var dateTime = moment(mainData.scheduleDate).format('DD/MM/YYYY');
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
                            obj["ROUND"] = mainData.round;
                            if (stage == "league") {
                                if (i == 1) {
                                    prevRound = mainData.round;
                                    obj["MATCH NO"] = "MATCH " + i++;
                                } else {
                                    if (prevRound == mainData.round) {
                                        obj["MATCH NO"] = "MATCH " + i++;
                                    } else {
                                        i = 1;
                                        prevRound = mainData.round;
                                        obj["MATCH NO"] = "MATCH " + i++;
                                    }
                                }
                            } else {
                                obj["MATCH NO"] = "";
                            }
                            if (mainData.opponentsSingle.length > 0) {
                                obj["SFAID 1"] = mainData.opponentsSingle[0].teamId;
                                obj["NAME 1"] = mainData.opponentsSingle[0].name;
                                if (mainData.opponentsSingle[0].athleteId.atheleteSchoolName) {
                                    obj["SCHOOL 1"] = mainData.opponentsSingle[0].athleteId.atheleteSchoolName;
                                } else {
                                    obj["SCHOOL 1"] = mainData.opponentsSingle[0].athleteId.school.name;
                                }
                                if (mainData.resultFencing) {
                                    obj["SCORE 1"] = mainData.resultFencing.players[0].finalPoints;
                                    if (mainData.opponentsSingle.length == 1 && mainData.resultFencing.winner.opponentsSingle === mainData.opponentsSingle[0]._id.toString()) {
                                        obj["RESULT 1"] = "Bye";
                                    } else if (mainData.resultFencing.winner.opponentsSingle === mainData.opponentsSingle[0]._id.toString()) {
                                        if (mainData.resultFencing.players[0].walkover == true) {
                                            obj["RESULT 1"] = "walkover";
                                        } else {
                                            obj["RESULT 1"] = "Won";
                                        }
                                    } else {
                                        if (mainData.resultFencing.isNoMatch == false) {
                                            if (mainData.resultFencing.players[0].walkover == false && mainData.resultFencing.players[0].noShow == false) {
                                                obj["RESULT 1"] = "Lost";
                                            } else if (mainData.resultFencing.players[0].walkover == true) {
                                                obj["RESULT 1"] = "walkover";
                                            } else {
                                                obj["RESULT 1"] = "noShow";
                                            }
                                        } else {
                                            obj["RESULT 1"] = "No Match";
                                        }
                                    }
                                } else {
                                    obj["SCORE 1"] = "";
                                    obj["RESULT 1"] = "";
                                }
                            } else {
                                obj["SFAID 1"] = "";
                                obj["NAME 1"] = "";
                                obj["SCHOOL 1"] = "";
                                obj["SCORE 1"] = "";
                            }

                            if (mainData.opponentsSingle.length > 1) {
                                obj["SFAID 2"] = mainData.opponentsSingle[1].teamId;
                                obj["NAME 2"] = mainData.opponentsSingle[0].name;
                                if (mainData.opponentsSingle[1].athleteId.atheleteSchoolName) {
                                    obj["SCHOOL 2"] = mainData.opponentsSingle[1].athleteId.atheleteSchoolName;
                                } else {
                                    obj["SCHOOL 2"] = mainData.opponentsSingle[1].athleteId.school.name;
                                }
                                if (mainData.resultFencing) {
                                    obj["SCORE 2"] = mainData.resultFencing.players[1].finalPoints;
                                    if (mainData.resultFencing.winner.opponentsSingle === mainData.opponentsSingle[1]._id.toString()) {
                                        if (mainData.resultFencing.players[1].walkover == true) {
                                            obj["RESULT 2"] = "walkover";
                                        } else {
                                            obj["RESULT 2"] = "Won";
                                        }
                                    } else {
                                        if (mainData.resultFencing.isNoMatch == false) {
                                            if (mainData.resultFencing.players[1].walkover == false && mainData.resultFencing.players[1].noShow == false) {
                                                obj["RESULT 2"] = "Lost";
                                            } else if (mainData.resultFencing.players[1].walkover == true) {
                                                obj["RESULT 2"] = "walkover";
                                            } else {
                                                obj["RESULT 2"] = "noShow";
                                            }
                                        } else {
                                            obj["RESULT 2"] = "No Match";
                                        }
                                    }

                                    if (!_.isEmpty(mainData.resultFencing.winner) && mainData.resultFencing.isNoMatch == false || mainData.resultFencing.isDraw == false) {
                                        if (mainData.opponentsSingle[0]._id.toString() === mainData.resultFencing.winner.opponentsSingle) {
                                            if (mainData.opponentsSingle[0].athleteId.middleName) {
                                                obj["WINNER NAME"] = mainData.opponentsSingle[0].athleteId.firstName + " " + mainData.opponentsSingle[0].athleteId.middleName + " " + mainData.opponentsSingle[0].athleteId.surname;
                                            } else {
                                                obj["WINNER NAME"] = mainData.opponentsSingle[0].athleteId.firstName + " " + mainData.opponentsSingle[0].athleteId.surname;
                                            }
                                            obj["WINNER SFAID"] = mainData.opponentsSingle[0].athleteId.sfaId;
                                        } else {
                                            if (mainData.opponentsSingle[1].athleteId.middleName) {
                                                obj["WINNER NAME"] = mainData.opponentsSingle[1].athleteId.firstName + " " + mainData.opponentsSingle[1].athleteId.middleName + " " + mainData.opponentsSingle[1].athleteId.surname;
                                            } else {
                                                obj["WINNER NAME"] = mainData.opponentsSingle[1].athleteId.firstName + " " + mainData.opponentsSingle[1].athleteId.surname;
                                            }
                                            obj["WINNER SFAID"] = mainData.opponentsSingle[1].athleteId.sfaId;
                                        }
                                    } else {
                                        obj["WINNER NAME"] = "";
                                        obj["WINNER SFAID"] = "";
                                    }
                                } else {
                                    obj["SCORE 2"] = "";
                                    obj["RESULT 2"] = "";
                                    obj["WINNER NAME"] = "";
                                    obj["WINNER SFAID"] = "";
                                }
                                obj["VIDEO"] = "";
                                obj["MATCH CENTER"] = "";
                            } else {
                                obj["COACH NAME 1"] = "";
                                obj["DATA POINTS 1"] = "";
                                obj["FINAL SCORE"] = "";
                                obj["WINNER NAME"] = "";
                                obj["WINNER SFAID"] = "";
                            }
                            if (mainData.videoType) {
                                obj["VIDEO TYPE"] = mainData.videoType;
                            } else {
                                obj["VIDEO TYPE"] = "";
                            }
                            if (mainData.video) {
                                obj["VIDEO"] = mainData.video;
                            } else {
                                obj["VIDEO"] = "";
                            }
                            // } else {
                            //     obj["TEAM 2"] = "";
                            //     obj["TEAM NAME 2"] = "";
                            //     obj["SCHOOL 2"] = "";
                            //     obj["COACH NAME 1"] = "";
                            //     obj["DATA POINTS 1"] = "";
                            //     obj["FINAL SCORE"] = "";
                            //     obj["WINNER NAME"] = "";
                            //     obj["WINNER SFAID"] = "";
                            //     obj["VIDEO TYPE"] = "";
                            //     obj["VIDEO"] = "";
                            // }
                            callback(null, obj);

                        },
                        function (err, singleData) {
                            Config.generateExcel("KnockoutIndividual", singleData, res);
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
                var dateTime = moment(mainData.scheduleDate).format('DD/MM/YYYY');
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
                    if (mainData.videoType) {
                        obj["VIDEO TYPE"] = mainData.videoType;
                    } else {
                        obj["VIDEO TYPE"] = "";
                    }
                    if (mainData.video) {
                        obj["VIDEO"] = mainData.video;
                    } else {
                        obj["VIDEO"] = "";
                    }
                } else {
                    obj["SFA ID"] = "";
                    obj["NAME"] = "";
                    obj["SCHOOL"] = "";
                    obj["DETAIL NO."] = "";
                    obj["FINAL SCORE"] = "";
                    obj["RESULT"] = "";
                    obj["VIDEO TYPE"] = "";
                    obj["VIDEO"] = "";
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
                            var dateTime = moment(mainData.scheduleDate).format('DD/MM/YYYY');
                            obj.DATE = dateTime;
                            obj.TIME = mainData.scheduleTime;
                            if (mainData.opponentsSingle.length > 0) {
                                obj["SFAID 1"] = mainData.opponentsSingle[0].athleteId.sfaId;
                                if (mainData.opponentsSingle[0].athleteId.middleName) {
                                    obj["NAME 1"] = mainData.opponentsSingle[0].athleteId.firstName + " " + mainData.opponentsSingle[0].athleteId.middleName + " " + mainData.opponentsSingle[0].athleteId.surname;
                                } else {
                                    obj["NAME 1"] = mainData.opponentsSingle[0].athleteId.firstName + " " + mainData.opponentsSingle[0].athleteId.surname;
                                }
                                // console.log("school", mainData.opponentsSingle[0].athleteId.atheleteSchoolName);
                                if (!_.isEmpty(mainData.opponentsSingle[0].athleteId.school)) {
                                    obj["SCHOOL 1"] = mainData.opponentsSingle[0].athleteId.school.name;
                                } else {
                                    obj["SCHOOL 1"] = mainData.opponentsSingle[0].athleteId.atheleteSchoolName;
                                }
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
                                console.log("school", mainData.opponentsSingle[1].athleteId.atheleteSchoolName);
                                if (!_.isEmpty(mainData.opponentsSingle[0].athleteId.school)) {
                                    obj["SCHOOL 2"] = mainData.opponentsSingle[1].athleteId.school.name;
                                } else {
                                    obj["SCHOOL 2"] = mainData.opponentsSingle[1].athleteId.atheleteSchoolName;
                                }
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
                                if (mainData.opponentsSingle.length == 1) {
                                    obj["RESULT 1"] = "Bye";
                                } else if (mainData.resultSwiss.winner.player === mainData.opponentsSingle[0]._id.toString()) {
                                    if (mainData.resultSwiss.players[0].walkover == true) {
                                        obj["RESULT 1"] = "walkover";
                                    } else {
                                        obj["RESULT 1"] = "Won";
                                    }
                                } else {
                                    if (mainData.resultSwiss.isNoMatch == false) {
                                        if (mainData.resultSwiss.players[0].walkover == false && mainData.resultSwiss.players[0].noShow == false) {
                                            obj["RESULT 1"] = "Lost";
                                        } else if (mainData.resultSwiss.players[0].walkover == true) {
                                            obj["RESULT 1"] = "walkover";
                                        } else {
                                            obj["RESULT 1"] = "noShow";
                                        }
                                    } else if (mainData.resultSwiss.isDraw == true) {
                                        obj["RESULT 1"] = "Draw";
                                    } else {
                                        obj["RESULT 1"] = "No Match";
                                    }
                                }
                                if (mainData.opponentsSingle.length == 2) {
                                    if (mainData.resultSwiss.winner.player === mainData.opponentsSingle[1]._id.toString()) {
                                        if (mainData.resultSwiss.players[1].walkover == true) {
                                            obj["RESULT 2"] = "walkover";
                                        } else {
                                            obj["RESULT 2"] = "Won";
                                        }
                                    } else {
                                        if (mainData.resultSwiss.isNoMatch == false) {
                                            if (mainData.resultSwiss.players[1].walkover == false && mainData.resultSwiss.players[1].noShow == false) {
                                                obj["RESULT 2"] = "Lost";
                                            } else if (mainData.resultSwiss.players[1].walkover == true) {
                                                obj["RESULT 2"] = "walkover";
                                            } else {
                                                obj["RESULT 2"] = "noShow";
                                            }
                                        } else if (mainData.resultSwiss.isDraw == true) {
                                            obj["RESULT 2"] = "Draw";
                                        } else {
                                            obj["RESULT 2"] = "No Match";
                                        }
                                    }
                                }
                                if (!_.isEmpty(mainData.resultSwiss.winner)) {
                                    console.log("opponentsSingle", mainData.opponentsSingle[0], "player", mainData.resultSwiss.winner.player);
                                    if (mainData.opponentsSingle[0]._id.equals(mainData.resultSwiss.winner.player)) {
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
                                if (mainData.videoType) {
                                    obj["VIDEO TYPE"] = mainData.videoType;
                                } else {
                                    obj["VIDEO TYPE"] = "";
                                }
                                if (mainData.video) {
                                    obj["VIDEO"] = mainData.video;
                                } else {
                                    obj["VIDEO"] = "";
                                }
                            } else {
                                obj["P1 SCORE"] = "";
                                obj["P2 SCORE"] = "";
                                obj["P1 RANK"] = "";
                                obj["P2 RANK"] = "";
                                obj["RESULT 1"] = "";
                                obj["RESULT 2"] = "";
                                obj["WINNER NAME"] = "";
                                obj["WINNER SFAID"] = "";
                                obj["VIDEO TYPE"] = "";
                                obj["VIDEO"] = "";
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
                Config.generateExcel("KnockoutIndividual", excelData, res);
            });
    },

    //--------------------------------UPDATE RESULT EXCEL--------------------------------------------

    updateExcel: function (data, callback) {
        async.waterfall([
                function (callback) {
                    Config.importGS(data.file, function (err, importData) {
                        if (err || _.isEmpty(importData)) {
                            var err = "NO data to import";
                            callback(null, {
                                error: err,
                                data: data
                            });
                        } else {
                            callback(null, importData);
                        }
                    });
                },
                function (importData, callback) {
                    if (importData.error) {
                        callback(null, importData);
                    } else {
                        async.concatSeries(importData, function (n, callback) {
                                async.waterfall([
                                        function (callback) {
                                            var param = {};
                                            param.matchId = n["MATCH ID"];
                                            Match.getOne(param, function (err, matchData) {
                                                if (err) {
                                                    callback(err, null);
                                                } else {
                                                    if (_.isEmpty(matchData)) {
                                                        callback(null, []);
                                                    } else {
                                                        console.log("matchData", matchData);
                                                        var final = {};
                                                        var result = ResultInitialize.getResultVar(matchData.sportsName, matchData.sportType);
                                                        if (!matchData[result.resultVar] == '') {
                                                            final.result = result;
                                                            final.score = matchData[result.resultVar];
                                                            callback(null, final);
                                                        } else {
                                                            final.resultName = result.resultVar;
                                                            ResultInitialize.getMyResult(matchData.sportsName, matchData, function (err, complete) {
                                                                matchData[result.resultVar] = complete[result.resultVar];
                                                                var placeholder = {};
                                                                placeholder[result.resultVar] = complete[result.resultVar];
                                                                var matchObj = {
                                                                    $set: placeholder
                                                                };
                                                                Match.update({
                                                                    matchId: n["MATCH ID"]
                                                                }, matchObj).exec(
                                                                    function (err, match) {
                                                                        if (err) {
                                                                            callback(err, null);
                                                                        } else {
                                                                            final.result = result;
                                                                            final.score = matchData[result.resultVar];
                                                                            callback(null, final);
                                                                        }
                                                                    });
                                                            });
                                                        }
                                                    }
                                                }
                                            });
                                        },
                                        function (result, callback) {
                                            var team1 = {};
                                            var team2 = {};
                                            var main = {};
                                            var complete = {};
                                            var resultData = result.score;
                                            if (n['TEAM 1 Attendence'] == 'P' || n['TEAM 1 Attendence'] == 'p') {
                                                team1.noShow = false;
                                                team2.walkover = false;
                                            } else {
                                                team1.noShow = true;
                                                if (n['TEAM 2 Attendence'] == 'P' || n['TEAM 2 Attendence'] == 'p') {
                                                    team2.walkover = true;
                                                } else {
                                                    team2.walkover = false;
                                                }
                                            }
                                            if (n['TEAM 2 Attendence'] == 'P' || n['TEAM 2 Attendence'] == 'p') {
                                                team2.noShow = false;
                                                team1.walkover = false;
                                            } else {
                                                team2.noShow = true;
                                                if (n['TEAM 1 Attendence'] == 'P' || n['TEAM 1 Attendence'] == 'p') {
                                                    team2.walkover = true;
                                                } else {
                                                    team2.walkover = false;
                                                }
                                            }

                                            if (n['NO MATCH'] == 'yes') {
                                                main.isNoMatch = true;
                                            } else {
                                                main.isNoMatch = false;
                                            }

                                            if (n['DRAW'] == 'yes') {
                                                main.isDraw = true;
                                            } else {
                                                main.isDraw = false;
                                            }

                                            main.status = "IsCompleted";
                                            if (n['SCORE 1']) {
                                                if (result.result.resultVar == "resultBasketball") {
                                                    resultData.teams[0].teamResults.finalGoalPoints = n['SCORE 1'];
                                                    resultData.teams[0].teamResults.quarterPoints[0].basket = 0;
                                                    resultData.teams[0].teamResults.quarterPoints[1].basket = 0;
                                                    resultData.teams[0].teamResults.quarterPoints[2].basket = 0;
                                                    resultData.teams[0].teamResults.quarterPoints[3].basket = 0;
                                                } else if (result.result.resultVar == "resultsCombat") {
                                                    resultData.teams[0].teamResults.sets[0] = n['SCORE 1'];
                                                } else {
                                                    resultData.teams[0].teamResults.finalPoints = n['SCORE 1'];
                                                }
                                            }
                                            if (!_.isEmpty(n['SCORE 2'])) {
                                                if (result.result.resultVar == "resultBasketball") {
                                                    resultData.teams[1].teamResults.finalGoalPoints = n['SCORE 2'];
                                                    resultData.teams[1].teamResults.quarterPoints[0].basket = 0;
                                                    resultData.teams[1].teamResults.quarterPoints[1].basket = 0;
                                                    resultData.teams[1].teamResults.quarterPoints[2].basket = 0;
                                                    resultData.teams[1].teamResults.quarterPoints[3].basket = 0;
                                                } else if (result.result.resultVar == "resultsCombat") {
                                                    resultData.teams[1].teamResults.sets[0].points = n['SCORE 2'];
                                                } else {
                                                    resultData.teams[1].teamResults.finalPoints = n['SCORE 2'];
                                                }
                                            }
                                            if (resultData.teams.length == 2) {
                                                resultData.isDraw = main.isDraw;
                                                resultData.status = main.status;
                                                resultData.isNoMatch = main.isNoMatch;
                                                resultData.teams[0].noShow = team1.noShow;
                                                resultData.teams[0].walkover = team1.walkover;
                                                resultData.teams[1].noShow = team2.noShow;
                                                resultData.teams[1].walkover = team2.walkover;
                                                // console.log("main", main);
                                            } else {
                                                // console.log("main", main);
                                                resultData.isDraw = main.isDraw;
                                                resultData.status = main.status;
                                                resultData.isNoMatch = main.isNoMatch;
                                                resultData.teams[0].noShow = team1.noShow;
                                                resultData.teams[0].walkover = team1.walkover;
                                            }
                                            var placeholder = {};
                                            placeholder[result.result.resultVar] = resultData;
                                            var matchObj = {
                                                $set: placeholder
                                            };
                                            Match.update({
                                                matchId: n["MATCH ID"]
                                            }, matchObj).exec(
                                                function (err, match) {
                                                    if (err) {
                                                        callback(err, null);
                                                    } else {
                                                        callback(null, match);
                                                    }
                                                });
                                        }
                                    ],
                                    function (err, excelData) {
                                        callback(null, excelData);
                                    });

                            },
                            function (err, final) {
                                callback(null, final)
                            });
                    }
                }
            ],
            function (err, excelData) {
                callback(null, excelData);
            });
    },

    excelScoringTeam: function (data, res) {
        async.waterfall([
                function (callback) {
                    var paramData = {};
                    paramData.name = data.sportslist.name;
                    paramData.age = data.ageGroup.name;
                    paramData.gender = data.gender;
                    Match.getSportId(paramData, function (err, sportData) {
                        if (err || _.isEmpty(sportData)) {
                            err = "Sport,Event,AgeGroup,Gender may have wrong values";
                            callback(null, {
                                error: err,
                                success: sportData
                            });
                        } else {
                            console.log("sportData", sportData);
                            callback(null, sportData);
                        }
                    });
                },
                function (sportData, callback) {
                    var deepSearch = "sport.sportslist.sportsListSubCategory.sportsListCategory sport.ageGroup sport.weight opponentsSingle.athleteId.school opponentsTeam.studentTeam.studentId.school";
                    Match.find({
                        sport: sportData.sportId,
                    }).lean().deepPopulate(deepSearch).sort({
                        incrementalId: 1
                    }).exec(function (err, match) {
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
                            if (mainData.opponentsTeam.length > 0) {
                                obj["TEAM ID 1"] = mainData.opponentsTeam[0].teamId;
                                obj["SCHOOL 1"] = mainData.opponentsTeam[0].schoolName;
                            } else {
                                obj["TEAM ID 1"] = "";
                                obj["SCHOOL 1"] = "";
                            }

                            if (mainData.opponentsTeam.length > 1) {
                                obj["TEAM ID 2"] = mainData.opponentsTeam[1].teamId;
                                obj["SCHOOL 2"] = mainData.opponentsTeam[1].schoolName;
                            } else {
                                obj["TEAM ID 2"] = "";
                                obj["SCHOOL 2"] = "";
                            }
                            obj["TEAM 1 Attendence"] = "";
                            obj["SCORE 1"] = "";
                            obj["TEAM 2 Attendence"] = "";
                            obj["SCORE 2"] = "";
                            obj["NO MATCH"] = "";
                            obj["DRAW"] = "";
                            callback(null, obj);

                        },
                        function (err, singleData) {
                            callback(null, singleData);

                        });
                }
            ],
            function (err, singleData) {
                Config.generateExcel("KnockoutIndividual", singleData, res);
            });


    },

    //--------------------------------  UPDATE SCORE RESULT  ------------------------------------------
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
                    } else if (data.resultThrowball) {
                        var matchObj = {
                            $set: {
                                resultThrowball: data.resultThrowball
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
                    } else {
                        var matchObj = {};
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
                                    updateObj = {};
                                    callback(null, "match is live");
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
                                        callback(null, "match is live");
                                    }

                                } else {
                                    updateObj = {};
                                    callback(null, "match is live");
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
                                } else if (data.found.resultThrowball && data.found.resultThrowball.status == 'IsCompleted' && data.found.resultThrowball.isNoMatch == false) {
                                    if (data.found.opponentsTeam[0].equals(data.found.resultThrowball.winner.player)) {
                                        lostPlayer.push(data.found.opponentsTeam[1]);
                                        winPlayer.push(data.found.resultThrowball.winner.player);
                                        console.log("player", winPlayer);
                                    } else {
                                        lostPlayer.push(data.found.opponentsTeam[0]);
                                        winPlayer.push(data.found.resultThrowball.winner.player);
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
                                } else if (data.found.resultKabaddi && data.found.resultKabaddi.status == 'IsCompleted' && data.found.resultKabaddi.isNoMatch == false) {
                                    if (data.found.opponentsTeam[0].equals(data.found.resultKabaddi.winner.player)) {
                                        lostPlayer.push(data.found.opponentsTeam[1]);
                                        winPlayer.push(data.found.resultKabaddi.winner.player);
                                        console.log("player", winPlayer);
                                    } else {
                                        lostPlayer.push(data.found.opponentsTeam[0]);
                                        winPlayer.push(data.found.resultKabaddi.winner.player);
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
                                } else if (data.found.resultHandball && data.found.resultHandball.status == 'IsCompleted' && data.found.resultHandball.isNoMatch == false) {
                                    if (data.found.opponentsTeam[0].equals(data.found.resultHandball.winner.player)) {
                                        lostPlayer.push(data.found.opponentsTeam[1]);
                                        winPlayer.push(data.found.resultHandball.winner.player);
                                        console.log("player", winPlayer);
                                    } else {
                                        lostPlayer.push(data.found.opponentsTeam[0]);
                                        winPlayer.push(data.found.resultHandball.winner.player);
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
                                } else if (data.found.resultsCombat && data.found.resultsCombat.status == 'IsCompleted' && data.found.resultsCombat.isNoMatch == false) {
                                    if (data.found.opponentsTeam[0].equals(data.found.resultsCombat.winner.player)) {
                                        lostPlayer.push(data.found.opponentsTeam[1]);
                                        winPlayer.push(data.found.resultsCombat.winner.player);
                                        console.log("player", winPlayer);
                                    } else {
                                        lostPlayer.push(data.found.opponentsTeam[0]);
                                        winPlayer.push(data.found.resultsCombat.winner.player);
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
                                    updateObj = {};
                                    callback(null, "match is live");
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
                                    } else if (data.found.resultThrowball && data.found.resultThrowball.status == 'IsCompleted' && data.found.resultThrowball.isNoMatch == false) {
                                        if (data.found.opponentsTeam[0].equals(data.found.resultThrowball.winner.player)) {
                                            lostPlayer.push(data.found.opponentsTeam[1]);
                                            winPlayer.push(data.found.resultThrowball.winner.player);
                                            console.log("player", winPlayer);
                                        } else {
                                            lostPlayer.push(data.found.opponentsTeam[0]);
                                            winPlayer.push(data.found.resultThrowball.winner.player);
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
                                    } else if (data.found.resultKabaddi && data.found.resultKabaddi.status == 'IsCompleted' && data.found.resultKabaddi.isNoMatch == false) {
                                        if (data.found.opponentsTeam[0].equals(data.found.resultKabaddi.winner.player)) {
                                            lostPlayer.push(data.found.opponentsTeam[1]);
                                            winPlayer.push(data.found.resultKabaddi.winner.player);
                                            console.log("player", winPlayer);
                                        } else {
                                            lostPlayer.push(data.found.opponentsTeam[0]);
                                            winPlayer.push(data.found.resultKabaddi.winner.player);
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
                                    } else if (data.found.resultHandball && data.found.resultHandball.status == 'IsCompleted' && data.found.resultHandball.isNoMatch == false) {
                                        if (data.found.opponentsTeam[0].equals(data.found.resultHandball.winner.player)) {
                                            lostPlayer.push(data.found.opponentsTeam[1]);
                                            winPlayer.push(data.found.resultHandball.winner.player);
                                            console.log("player", winPlayer);
                                        } else {
                                            lostPlayer.push(data.found.opponentsTeam[0]);
                                            winPlayer.push(data.found.resultHandball.winner.player);
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
                                    } else if (data.found.resultsCombat && data.found.resultsCombat.status == 'IsCompleted' && data.found.resultsCombat.isNoMatch == false) {
                                        if (data.found.opponentsTeam[0].equals(data.found.resultsCombat.winner.player)) {
                                            lostPlayer.push(data.found.opponentsTeam[1]);
                                            winPlayer.push(data.found.resultsCombat.winner.player);
                                            console.log("player", winPlayer);
                                        } else {
                                            lostPlayer.push(data.found.opponentsTeam[0]);
                                            winPlayer.push(data.found.resultsCombat.winner.player);
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
                                        updateObj = {};
                                        callback(null, "match is live");
                                    }
                                } else {
                                    updateObj = {};
                                    callback(null, "match is live");
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
                                    updateObj = {};
                                    callback(null, "match is live");
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
                                        updateObj = {};
                                        callback(null, "match is live");
                                    }
                                } else {
                                    updateObj = {};
                                    callback(null, "match is live");
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
                                } else if (data.found.resultThrowball && data.found.resultThrowball.status == 'IsCompleted' && data.found.resultThrowball.isNoMatch == false) {
                                    winPlayer.push(data.found.resultThrowball.winner.player);
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
                                } else if (data.found.resultWaterPolo && data.found.resultWaterPolo.status == 'IsCompleted' && data.found.resultWaterPolo.isNoMatch == false) {
                                    winPlayer.push(data.found.resultWaterPolo.winner.player);
                                    console.log("player", winPlayer);
                                    updateObj = {
                                        $set: {
                                            opponentsTeam: winPlayer
                                        }
                                    };
                                } else if (data.found.resultKabaddi && data.found.resultKabaddi.status == 'IsCompleted' && data.found.resultKabaddi.isNoMatch == false) {
                                    winPlayer.push(data.found.resultKabaddi.winner.player);
                                    console.log("player", winPlayer);
                                    updateObj = {
                                        $set: {
                                            opponentsTeam: winPlayer
                                        }
                                    };
                                } else if (data.found.resultHandball && data.found.resultHandball.status == 'IsCompleted' && data.found.resultHandball.isNoMatch == false) {
                                    winPlayer.push(data.found.resultHandball.winner.player);
                                    console.log("player", winPlayer);
                                    updateObj = {
                                        $set: {
                                            opponentsTeam: winPlayer
                                        }
                                    };
                                } else if (data.found.resultsCombat && data.found.resultsCombat.status == 'IsCompleted' && data.found.resultsCombat.isNoMatch == false) {
                                    winPlayer.push(data.found.resultsCombat.winner.player);
                                    console.log("player", winPlayer);
                                    updateObj = {
                                        $set: {
                                            opponentsTeam: winPlayer
                                        }
                                    };
                                } else {
                                    updateObj = {};
                                    callback(null, "match is live");
                                }
                            } else if (data.isTeam == true && !_.isEmpty(found[0].opponentsTeam)) {
                                console.log("updating match", data.found);
                                console.log("found0***", found[0].opponentsTeam);
                                if (found[0].opponentsTeam.length == 1) {
                                    console.log("found again in 1", found[0].opponentsTeam);
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
                                    } else if (data.found.resultThrowball && data.found.resultThrowball.status == "IsCompleted" && data.found.resultThrowball.isNoMatch == false) {
                                        winPlayer.push(data.found.resultThrowball.winner.player);
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
                                    } else if (data.found.resultWaterPolo && data.found.resultWaterPolo.status == "IsCompleted" && data.found.resultWaterPolo.isNoMatch == false) {
                                        winPlayer.push(data.found.resultWaterPolo.winner.player);
                                        console.log("player", winPlayer);
                                        updateObj = {
                                            $set: {
                                                opponentsTeam: winPlayer
                                            }
                                        };
                                    } else if (data.found.resultKabaddi && data.found.resultKabaddi.status == "IsCompleted" && data.found.resultKabaddi.isNoMatch == false) {
                                        winPlayer.push(data.found.resultKabaddi.winner.player);
                                        console.log("player", winPlayer);
                                        updateObj = {
                                            $set: {
                                                opponentsTeam: winPlayer
                                            }
                                        };
                                    } else if (data.found.resultHandball && data.found.resultHandball.status == "IsCompleted" && data.found.resultHandball.isNoMatch == false) {
                                        winPlayer.push(data.found.resultHandball.winner.player);
                                        console.log("player", winPlayer);
                                        updateObj = {
                                            $set: {
                                                opponentsTeam: winPlayer
                                            }
                                        };
                                    } else if (data.found.resultsCombat && data.found.resultsCombat.status == "IsCompleted" && data.found.resultsCombat.isNoMatch == false) {
                                        winPlayer.push(data.found.resultsCombat.winner.player);
                                        console.log("player", winPlayer);
                                        updateObj = {
                                            $set: {
                                                opponentsTeam: winPlayer
                                            }
                                        };
                                    } else {
                                        updateObj = {};
                                        callback(null, "match is live");
                                    }
                                } else {
                                    updateObj = {};
                                    callback(null, "match is live");
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
                                                    callback(null, match);
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
                                                    callback(null, match);
                                                } else {
                                                    callback(null, match);
                                                }
                                            }
                                        });
                                }
                            ], function (err, results) {
                                if (err) {
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
                        }
                    }
                }
            ],
            function (err, results) {
                if (err) {
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
                                        var dateTime = moment(singleData.DATE, "DD-MM-YYYY").add(1, 'days');
                                        singleData.DATE = dateTime;
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
                                                // console.log("n", n.success);
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
                                                paramData.heatNo = n.success["HEAT NUMBER"];
                                                paramData.scheduleDate = n.success.DATE;
                                                paramData.scheduleTime = n.success.TIME;
                                                paramData.video = n.success["VIDEO TYPE"];
                                                paramData.videoType = n.success["VIDEO"];
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
                                                // console.log("param", paramData);
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
                        var dateTime = moment(singleData.DATE, "DD-MM-YYYY").add(1, 'days');
                        singleData.DATE = dateTime;
                        async.waterfall([
                                function (callback) {
                                    // console.log("singleData", singleData);
                                    var paramData = {};
                                    paramData.name = singleData['EVENT'];
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
                                        if (singleData["ATTEMPT 4"]) {
                                            player.attempt.push(singleData["ATTEMPT 4"]);
                                        }
                                        if (singleData["ATTEMPT 5"]) {
                                            player.attempt.push(singleData["ATTEMPT 5"]);
                                        }
                                        if (singleData["ATTEMPT 6"]) {
                                            player.attempt.push(singleData["ATTEMPT 6"]);
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
                                        paramData.video = singleData["VIDEO"];
                                        paramData.video = singleData["VIDEO TYPE"];
                                        Match.updateQualifyingRound(paramData, function (err, complete) {
                                            if (err) {
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

    },

    updateQualifyingRound: function (data, callback) {
        var update = {};
        async.waterfall([
                function (callback) {
                    Match.findOne({
                        matchId: data.matchId
                    }).lean().exec(
                        function (err, found) {
                            if (_.isEmpty(found.resultQualifyingRound)) {
                                update.isReady = true;
                            } else if (found.resultQualifyingRound.status == "isCompleted") {
                                update.isReady = false;
                            } else {
                                update.isReady = true;
                            }
                            callback(null, update);
                        });
                },
                function (update, callback) {
                    if (update.isReady == true) {
                        Match.update({
                            matchId: data.matchId
                        }, data).exec(
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
                    } else {
                        callback(null, data);
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

    updateQualifyingDigital: function (data, callback) {
        async.concatLimit(data, 10, function (singleData, callback) {
            if (singleData.resultImage) {
                var updateObj = {
                    $set: {
                        "resultQualifyingRound.resultImage": singleData.resultImage
                    }
                }
            } else if (singleData.result && singleData.scoreSheet) {
                var updateObj = {
                    $set: {
                        "resultQualifyingRound.player": singleData.result,
                        "resultQualifyingRound.scoreSheet": singleData.scoreSheet
                    }
                }
            } else if (singleData.result) {
                var updateObj = {
                    $set: {
                        "resultQualifyingRound.player": singleData.result,
                    }
                }
            }
            Match.update({
                matchId: singleData.matchId
            }, updateObj).exec(
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
        }, function (err, singleData) {
            callback(null, singleData)
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
                                    result.teams = [];
                                    async.concatSeries(arrData, function (singleData, callback) {
                                        var dateTime = moment(singleData.DATE, "DD-MM-YYYY").add(1, 'days');
                                        singleData.DATE = dateTime;
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
                                                    result.teams.push(player);
                                                }
                                                console.log(paramData.opponentsSingle);
                                                paramData.sport = n.success.SPORT;
                                                paramData.scheduleDate = n.success.DATE;
                                                paramData.scheduleTime = n.success.TIME;
                                                paramData.video = singleData["VIDEO"];
                                                paramData.video = singleData["VIDEO TYPE"];
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
                        var dateTime = moment(singleData.DATE, "DD-MM-YYYY").add(1, 'days');
                        singleData.DATE = dateTime;
                        async.waterfall([
                                function (callback) {
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
                                        paramData.video = singleData["VIDEO"];
                                        paramData.video = singleData["VIDEO TYPE"];
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
            var dateTime = moment(singleData.DATE, "DD-MM-YYYY").add(1, 'days');
            singleData.DATE = dateTime;
            var result = {};
            result.players = [];
            result.winner = {};
            async.waterfall([
                    function (callback) {
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
                                        // console.log("complete", complete);
                                        singleData.playerId1 = complete.athleteId;
                                        var info = {};
                                        info.player = singleData["PARTICIPANT 1"];
                                        if (singleData["Player 1 Attendence"].toLowerCase() === "p") {
                                            info.noShow = false;
                                        } else {
                                            info.noShow = true;
                                        }
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
                                        info.player = singleData["PARTICIPANT 2"];
                                        if (singleData["Player 2 Attendence"].toLowerCase() === "p") {
                                            info.noShow = false;
                                        } else {
                                            info.noShow = true;
                                        }
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
                            // console.log("///////single", singleData);
                            if (_.isEmpty(singleData["FINAL SCORE"])) {
                                callback(null, singleData);
                            } else {
                                result.finalScore = singleData["FINAL SCORE"];
                                if (singleData["SHOOTOUT SCORE"]) {
                                    result.shootOutScore = singleData["SHOOTOUT SCORE"];
                                }
                                if (singleData["SFAID 1"] === singleData["WINNER SFA ID"]) {
                                    var winner = {};
                                    winner.player = singleData.playerId1;
                                    // console.log("playerId1", singleData.playerId1);
                                    winner.opponentsSingle = singleData["PARTICIPANT 1"];
                                    result.winner = winner;
                                    result.status = 'IsCompleted';
                                } else if (singleData["SFAID 2"] === singleData["WINNER SFA ID"]) {
                                    var winner = {};
                                    winner = {};
                                    // console.log("playerId2", singleData.playerId2);
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
                            paramData.video = singleData["VIDEO"];
                            paramData.video = singleData["VIDEO TYPE"];
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
                        var dateTime = moment(singleData.DATE, "DD-MM-YYYY").add(1, 'days');
                        singleData.DATE = dateTime;
                        async.waterfall([
                                function (callback) {
                                    console.log("singleData", singleData);
                                    var paramData = {};
                                    paramData.name = singleData['EVENT'];
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
                                        paramData.video = singleData["VIDEO"];
                                        paramData.video = singleData["VIDEO TYPE"];
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
                            console.log("n", n, singleData);
                            if (countError != 0 && n.error != null) {
                                console.log("inside", n);
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

    updateLeagueKnockoutTeam: function (importData, data, callback) {
        var countError = 0;
        async.waterfall([
                function (callback) {
                    async.concatSeries(importData, function (singleData, callback) {
                            var dateTime = moment(singleData.DATE, "DD-MM-YYYY").add(1, 'days');
                            singleData.DATE = dateTime;
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
                                                // console.log("singleData1", singleData);
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
                                                // console.log("inside sfa");
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
                                            var paramData = {};
                                            paramData.opponentsTeam = [];
                                            paramData.matchId = singleData["MATCH ID"];
                                            paramData.round = singleData["ROUND"];
                                            if (_.isEmpty(singleData["TEAM NAME 1"]) || _.isEmpty(singleData["TEAM NAME 2"])) {
                                                paramData.opponentsTeam = [];
                                            } else if (_.isEmpty(singleData["TEAM NAME 1"])) {
                                                paramData.opponentsTeam.push(singleData["TEAM NAME 2"]);
                                            } else if (_.isEmpty(singleData["TEAM NAME 2"])) {
                                                paramData.opponentsTeam.push(singleData["TEAM NAME 1"]);
                                            } else {
                                                paramData.opponentsTeam.push(singleData["TEAM NAME 1"]);
                                                paramData.opponentsTeam.push(singleData["TEAM NAME 2"]);
                                            }
                                            paramData.sport = singleData.SPORT;
                                            var storeDate = singleData.DATE;
                                            var splitDate = storeDate.indexOf('/');
                                            console.log('++++++++++++++++++++++++++++++', splitDate);
                                            if (splitDate !== -1) {
                                                paramData.scheduleDate = singleData.DATE;
                                            }
                                            paramData.scheduleTime = singleData.TIME;
                                            paramData.excelType = singleData["STAGE"];
                                            paramData.video = singleData["VIDEO"];
                                            paramData.video = singleData["VIDEO TYPE"];
                                            if (!_.isEmpty(paramData.opponentsTeam)) {
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
                                                var obj = {
                                                    $set: {
                                                        round: paramData.round,
                                                        scheduleDate: paramData.scheduleDate,
                                                        scheduleTime: paramData.scheduleTime
                                                    }
                                                }
                                                Match.update({
                                                    matchId: paramData.matchId
                                                }, obj).exec(
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
                            var excelType = n.STAGE.toLowerCase();
                            var thirdplace = n.ROUND.toLowerCase();
                            if (excelType == 'knockout') {
                                data.isLeagueKnockout = true;
                                data.sport = n.SPORT;
                                if (thirdplace == "third place") {
                                    data.thirdPlace = "yes";
                                }
                                callback(null, singleData);
                            } else {
                                callback(null, singleData);
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
                        Match.addPreviousMatchUpdate(data, function (err, sportData) {
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

    updateLeagueKnockoutIndividual: function (importData, data, callback) {
        var countError = 0;
        async.waterfall([
                function (callback) {
                    async.concatSeries(importData, function (singleData, callback) {
                            var dateTime = moment(singleData.DATE, "DD-MM-YYYY").add(1, 'days');
                            singleData.DATE = dateTime;
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
                                            if (_.isEmpty(singleData["SFAID 1"])) {
                                                callback(null, singleData);
                                            } else {
                                                // console.log("singleData1", singleData);
                                                var paramData = {};
                                                paramData.team = singleData["SFAID 1"];
                                                paramData.sport = singleData.SPORT;
                                                Match.getTeamId(paramData, function (err, complete) {
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
                                        if (singleData.err) {
                                            countError++;
                                            callback(null, singleData);
                                        } else {
                                            if (_.isEmpty(singleData["SFAID 2"])) {
                                                // console.log("inside sfa");
                                                callback(null, singleData);
                                            } else {
                                                var paramData = {};
                                                paramData.team = singleData["SFAID 2"];
                                                paramData.sport = singleData.SPORT;
                                                Match.getTeamId(paramData, function (err, complete) {
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
                                        if (singleData.error) {
                                            countError++;
                                            callback(null, singleData);
                                        } else {
                                            var excelType = singleData["STAGE"].toLowerCase();
                                            // if (excelType == 'knockout') {
                                            var paramData = {};
                                            paramData.opponentsSingle = [];
                                            paramData.matchId = singleData["MATCH ID"];
                                            // paramData.matchId = data.matchId;
                                            paramData.round = singleData["ROUND"];
                                            if (_.isEmpty(singleData["NAME 1"]) || _.isEmpty(singleData["NAME 2"])) {
                                                paramData.opponentsSingle = [];
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
                                            paramData.excelType = singleData["STAGE"];
                                            paramData.video = singleData["VIDEO"];
                                            paramData.video = singleData["VIDEO TYPE"];
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
                                            // callback(null, singleData);
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
                                console.log("type", type);
                                if (type === "knockout") {
                                    data.isKnockout = true;
                                    console.log("isKnockout", data.isKnockout);
                                } else {
                                    data.isKnockout = false;
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

    updateLeagueKnockout: function (data, callback) {
        // console.log("data", data);
        var updateObj = {};
        var updateObj1 = {};
        async.waterfall([
                function (callback) {
                    if (data.resultFootball) {
                        var matchObj = {
                            $set: {
                                resultFootball: data.resultFootball
                            }
                        };
                    } else if (data.resultBasketball) {
                        var matchObj = {
                            $set: {
                                resultBasketball: data.resultBasketball
                            }
                        };
                    } else if (data.resultThrowball) {
                        var matchObj = {
                            $set: {
                                resultThrowball: data.resultThrowball
                            }
                        };
                    } else if (data.resultHandball) {
                        var matchObj = {
                            $set: {
                                resultHandball: data.resultHandball
                            }
                        };
                    } else if (data.resultHockey) {
                        var matchObj = {
                            $set: {
                                resultHockey: data.resultHockey
                            }
                        };
                    } else if (data.resultVolleyball) {
                        var matchObj = {
                            $set: {
                                resultVolleyball: data.resultVolleyball
                            }
                        };
                    } else if (data.resultWaterPolo) {
                        var matchObj = {
                            $set: {
                                resultWaterPolo: data.resultWaterPolo
                            }
                        };
                    } else if (data.resultKabaddi) {
                        var matchObj = {
                            $set: {
                                resultKabaddi: data.resultKabaddi
                            }
                        };
                    } else if (data.resultsCombat) {
                        var matchObj = {
                            $set: {
                                resultsCombat: data.resultsCombat
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
                                if (type === "knockout") {
                                    data.isKnockout = true;
                                } else {
                                    data.isKnockout = false;
                                }
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
                                    // console.log("prev", found);
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
                                    } else if (data.found.resultThrowball && data.found.resultThrowball.status == 'IsCompleted' && data.found.resultThrowball.isNoMatch == false) {
                                        if (data.found.opponentsTeam[0].equals(data.found.resultThrowball.winner.player)) {
                                            lostPlayer.push(data.found.opponentsTeam[1]);
                                            winPlayer.push(data.found.resultThrowball.winner.player);
                                            console.log("player", winPlayer);
                                        } else {
                                            lostPlayer.push(data.found.opponentsTeam[0]);
                                            winPlayer.push(data.found.resultThrowball.winner.player);
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
                                    } else if (data.found.resultHandball && data.found.resultHandball.status == 'IsCompleted' && data.found.resultHandball.isNoMatch == false) {
                                        if (data.found.opponentsTeam[0].equals(data.found.resultHandball.winner.player)) {
                                            lostPlayer.push(data.found.opponentsTeam[1]);
                                            winPlayer.push(data.found.resultHandball.winner.player);
                                            console.log("player", winPlayer);
                                        } else {
                                            lostPlayer.push(data.found.opponentsTeam[0]);
                                            winPlayer.push(data.found.resultHandball.winner.player);
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
                                    } else if (data.found.resultKabaddi && data.found.resultKabaddi.status == 'IsCompleted' && data.found.resultKabaddi.isNoMatch == false) {
                                        if (data.found.opponentsTeam[0].equals(data.found.resultKabaddi.winner.player)) {
                                            lostPlayer.push(data.found.opponentsTeam[1]);
                                            winPlayer.push(data.found.resultKabaddi.winner.player);
                                            console.log("player", winPlayer);
                                        } else {
                                            lostPlayer.push(data.found.opponentsTeam[0]);
                                            winPlayer.push(data.found.resultKabaddi.winner.player);
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
                                    } else if (data.found.resultsCombat && data.found.resultsCombat.status == 'IsCompleted' && data.found.resultsCombat.isNoMatch == false) {
                                        if (data.found.opponentsTeam[0].equals(data.found.resultsCombat.winner.player)) {
                                            lostPlayer.push(data.found.opponentsTeam[1]);
                                            winPlayer.push(data.found.resultsCombat.winner.player);
                                            console.log("player", winPlayer);
                                        } else {
                                            lostPlayer.push(data.found.opponentsTeam[0]);
                                            winPlayer.push(data.found.resultsCombat.winner.player);
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
                                        var playerId = found[1].opponentsTeam[0];
                                        var playerId1 = found[0].opponentsTeam[0];
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
                                        } else if (data.found.resultThrowball && data.found.resultThrowball.status == 'IsCompleted' && data.found.resultThrowball.isNoMatch == false) {
                                            if (data.found.opponentsTeam[0].equals(data.found.resultThrowball.winner.player)) {
                                                lostPlayer.push(data.found.opponentsTeam[1]);
                                                winPlayer.push(data.found.resultThrowball.winner.player);
                                                console.log("player", winPlayer);
                                            } else {
                                                lostPlayer.push(data.found.opponentsTeam[0]);
                                                winPlayer.push(data.found.resultThrowball.winner.player);
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
                                        } else if (data.found.resultHandball && data.found.resultHandball.status == 'IsCompleted' && data.found.resultHandball.isNoMatch == false) {
                                            if (data.found.opponentsTeam[0].equals(data.found.resultHandball.winner.player)) {
                                                lostPlayer.push(data.found.opponentsTeam[1]);
                                                winPlayer.push(data.found.resultHandball.winner.player);
                                                console.log("player", winPlayer);
                                            } else {
                                                lostPlayer.push(data.found.opponentsTeam[0]);
                                                winPlayer.push(data.found.resultHandball.winner.player);
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
                                        } else if (data.found.resultKabaddi && data.found.resultKabaddi.status == 'IsCompleted' && data.found.resultKabaddi.isNoMatch == false) {
                                            if (data.found.opponentsTeam[0].equals(data.found.resultKabaddi.winner.player)) {
                                                lostPlayer.push(data.found.opponentsTeam[1]);
                                                winPlayer.push(data.found.resultKabaddi.winner.player);
                                                console.log("player", winPlayer);
                                            } else {
                                                lostPlayer.push(data.found.opponentsTeam[0]);
                                                winPlayer.push(data.found.resultKabaddi.winner.player);
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
                                        } else if (data.found.resultsCombat && data.found.resultsCombat.status == 'IsCompleted' && data.found.resultsCombat.isNoMatch == false) {
                                            if (data.found.opponentsTeam[0].equals(data.found.resultsCombat.winner.player)) {
                                                lostPlayer.push(data.found.opponentsTeam[1]);
                                                winPlayer.push(data.found.resultsCombat.winner.player);
                                                console.log("player", winPlayer);
                                            } else {
                                                lostPlayer.push(data.found.opponentsTeam[0]);
                                                winPlayer.push(data.found.resultsCombat.winner.player);
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
                                        // console.log("player", winPlayer);
                                        updateObj = {
                                            $set: {
                                                opponentsTeam: winPlayer
                                            }
                                        };
                                    } else if (data.found.resultBasketball && data.found.resultBasketball.status == 'IsCompleted' && data.found.resultBasketball.isNoMatch == false) {
                                        winPlayer.push(data.found.resultBasketball.winner.player);
                                        // console.log("player", winPlayer);
                                        updateObj = {
                                            $set: {
                                                opponentsTeam: winPlayer
                                            }
                                        };
                                    } else if (data.found.resultThrowball && data.found.resultThrowball.status == 'IsCompleted' && data.found.resultThrowball.isNoMatch == false) {
                                        winPlayer.push(data.found.resultThrowball.winner.player);
                                        // console.log("player", winPlayer);
                                        updateObj = {
                                            $set: {
                                                opponentsTeam: winPlayer
                                            }
                                        };
                                    } else if (data.found.resultHandball && data.found.resultHandball.status == 'IsCompleted' && data.found.resultHandball.isNoMatch == false) {
                                        winPlayer.push(data.found.resultHandball.winner.player);
                                        // console.log("player", winPlayer);
                                        updateObj = {
                                            $set: {
                                                opponentsTeam: winPlayer
                                            }
                                        };
                                    } else if (data.found.resultHockey && data.found.resultHockey.status == 'IsCompleted' && data.found.resultHockey.isNoMatch == false) {
                                        winPlayer.push(data.found.resultHockey.winner.player);
                                        // console.log("player", winPlayer);
                                        updateObj = {
                                            $set: {
                                                opponentsTeam: winPlayer
                                            }
                                        };
                                    } else if (data.found.resultKabaddi && data.found.resultKabaddi.status == 'IsCompleted' && data.found.resultKabaddi.isNoMatch == false) {
                                        winPlayer.push(data.found.resultKabaddi.winner.player);
                                        // console.log("player", winPlayer);
                                        updateObj = {
                                            $set: {
                                                opponentsTeam: winPlayer
                                            }
                                        };
                                    } else if (data.found.resultVolleyball && data.found.resultVolleyball.status == 'IsCompleted' && data.found.resultVolleyball.isNoMatch == false) {
                                        winPlayer.push(data.found.resultVolleyball.winner.player);
                                        // console.log("player", winPlayer);
                                        updateObj = {
                                            $set: {
                                                opponentsTeam: winPlayer
                                            }
                                        };
                                    } else if (data.found.resultWaterPolo && data.found.resultWaterPolo.status == 'IsCompleted' && data.found.resultWaterPolo.isNoMatch == false) {
                                        winPlayer.push(data.found.resultWaterPolo.winner.player);
                                        // console.log("player", winPlayer);
                                        updateObj = {
                                            $set: {
                                                opponentsTeam: winPlayer
                                            }
                                        };
                                    } else if (data.found.resultsCombat && data.found.resultsCombat.status == 'IsCompleted' && data.found.resultsCombat.isNoMatch == false) {
                                        winPlayer.push(data.found.resultsCombat.winner.player);
                                        // console.log("player", winPlayer);
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
                                        } else if (data.found.resultBasketball && data.found.resultBasketball.status == "IsCompleted" && data.found.resultBasketball.isNoMatch == false) {
                                            winPlayer.push(data.found.resultBasketball.winner.player);
                                            console.log("player", winPlayer);
                                            updateObj = {
                                                $set: {
                                                    opponentsTeam: winPlayer
                                                }
                                            };
                                        } else if (data.found.resultThrowball && data.found.resultThrowball.status == "IsCompleted" && data.found.resultThrowball.isNoMatch == false) {
                                            winPlayer.push(data.found.resultThrowball.winner.player);
                                            console.log("player", winPlayer);
                                            updateObj = {
                                                $set: {
                                                    opponentsTeam: winPlayer
                                                }
                                            };
                                        } else if (data.found.resultHandball && data.found.resultHandball.status == "IsCompleted" && data.found.resultHandball.isNoMatch == false) {
                                            winPlayer.push(data.found.resultHandball.winner.player);
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
                                        } else if (data.found.resultKabaddi && data.found.resultKabaddi.status == "IsCompleted" && data.found.resultKabaddi.isNoMatch == false) {
                                            winPlayer.push(data.found.resultKabaddi.winner.player);
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
                                        } else if (data.found.resultWaterPolo && data.found.resultWaterPolo.status == "IsCompleted" && data.found.resultWaterPolo.isNoMatch == false) {
                                            winPlayer.push(data.found.resultWaterPolo.winner.player);
                                            console.log("player", winPlayer);
                                            updateObj = {
                                                $set: {
                                                    opponentsTeam: winPlayer
                                                }
                                            };
                                        } else if (data.found.resultsCombat && data.found.resultsCombat.status == "IsCompleted" && data.found.resultsCombat.isNoMatch == false) {
                                            winPlayer.push(data.found.resultsCombat.winner.player);
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
                            console.log("updateObj", updateObj, "updateObj1", updateObj1);
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
                                // console.log("update", updateObj, "found", found);
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

    updateFencing: function (data, callback) {
        var updateObj = {};
        var updateObj1 = {};
        async.waterfall([
                function (callback) {
                    var matchObj = {
                        $set: {
                            resultFencing: data.resultFencing
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
                                if (type === "knockout") {
                                    data.isKnockout = true;
                                } else {
                                    data.isKnockout = false;
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
                    if (data.isKnockout == false) {
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
                    if (data.isKnockout == false) {
                        if (_.isEmpty(found)) {
                            callback(null, data.found);
                        } else {
                            var winPlayer = [];
                            var lostPlayer = [];
                            var foundLength = found.length;
                            if (data.found.round == "Semi Final" && foundLength == 2) {
                                if (data.isTeam == false && _.isEmpty(found[0].opponentsSingle) && _.isEmpty(found[1].opponentsSingle)) {
                                    if (data.found.resultFencing && data.found.resultFencing.status == 'IsCompleted' && data.found.resultFencing.isNoMatch == false) {
                                        if (data.found.opponentsSingle[0].equals(data.found.resultFencing.winner.player)) {
                                            lostPlayer.push(data.found.opponentsSingle[1]);
                                            winPlayer.push(data.found.resultFencing.winner.player);
                                            console.log("player", winPlayer);
                                        } else {
                                            lostPlayer.push(data.found.opponentsSingle[0]);
                                            winPlayer.push(data.found.resultFencing.winner.player);
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
                                        if (data.found.resultFencing && data.found.resultFencing.status == 'IsCompleted' && data.found.resultFencing.isNoMatch == false) {
                                            if (data.found.opponentsSingle[0].equals(data.found.resultFencing.winner.player)) {
                                                lostPlayer.push(data.found.opponentsSingle[1]);
                                                winPlayer.push(data.found.resultFencing.winner.player);
                                                console.log("player", winPlayer);
                                            } else {
                                                lostPlayer.push(data.found.opponentsSingle[0]);
                                                winPlayer.push(data.found.resultFencing.winner.player);
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
                                }
                            } else {
                                console.log("in found", found, "data", data);
                                if (data.isTeam == false && _.isEmpty(found[0].opponentsSingle)) {
                                    if (data.found.resultFencing && data.found.resultFencing.status == 'IsCompleted' && data.found.resultFencing.isNoMatch == false) {
                                        winPlayer.push(data.found.resultFencing.winner.player);
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
                                        if (data.found.resultFencing && data.found.resultFencing.status == "IsCompleted" && data.found.resultFencing.isNoMatch == false) {
                                            winPlayer.push(data.found.resultFencing.winner.player);
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

        } else if (data.resultThrowball) {
            var matchObj = {
                $set: {
                    resultThrowball: data.resultThrowball
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
        } else if (data.resultSwiss) {
            var matchObj = {
                $set: {
                    resultSwiss: data.resultSwiss
                }
            };
        } else if (data.resultFencing) {
            var matchObj = {
                $set: {
                    resultFencing: data.resultFencing
                }
            };
        }
        var updateObj = {};
        var updateObj1 = {};
        async.waterfall([
                function (callback) {
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
                                // console.log("data.isTeam", data.isNoMatch);
                                data._id = found._id;
                                data.found = found;
                                callback(null, found);
                            }
                        }
                    });
                },
                function (found, callback) {
                    var deepSearch = "prevMatch prevMatch.opponentsTeam prevMatch.opponentsSingle";
                    Match.find({
                        prevMatch: data._id
                    }).lean().deepPopulate(deepSearch).exec(function (err, found) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(found)) {
                                callback(null, []);
                            } else {
                                console.log("found*******", found[0]);
                                if (data.found.resultsRacquet && data.found.resultsRacquet.status == 'IsCompleted') {
                                    if (_.isEmpty(found[0].resultsRacquet)) {
                                        callback(null, found);
                                    } else {
                                        callback(null, []);
                                    }

                                } else if (data.found.resultVolleyball && data.found.resultVolleyball.status == 'IsCompleted') {
                                    if (_.isEmpty(found[0].resultVolleyball)) {
                                        callback(null, found);
                                    } else {
                                        callback(null, []);
                                    }
                                } else if (data.found.resultBasketball && data.found.resultBasketball.status == 'IsCompleted') {
                                    if (_.isEmpty(found[0].resultBasketball)) {
                                        callback(null, found);
                                    } else {
                                        callback(null, []);
                                    }
                                } else if (data.found.resultHockey && data.found.resultHockey.status == 'IsCompleted') {
                                    if (_.isEmpty(found[0].resultHockey)) {
                                        callback(null, found);
                                    } else {
                                        callback(null, []);
                                    }
                                } else if (data.found.resultWaterPolo && data.found.resultWaterPolo.status == 'IsCompleted') {
                                    if (_.isEmpty(found[0].resultWaterPolo)) {
                                        callback(null, found);
                                    } else {
                                        callback(null, []);
                                    }
                                } else if (data.found.resultKabaddi && data.found.resultKabaddi.status == 'IsCompleted') {
                                    if (_.isEmpty(found[0].resultKabaddi)) {
                                        callback(null, found);
                                    } else {
                                        callback(null, []);
                                    }
                                } else if (data.found.resultHandball && data.found.resultHandball.status == 'IsCompleted') {
                                    if (_.isEmpty(found[0].resultHandball)) {
                                        callback(null, found);
                                    } else {
                                        callback(null, []);
                                    }
                                } else if (data.found.resultsCombat && data.found.resultsCombat.status == 'IsCompleted') {
                                    if (_.isEmpty(found[0].resultsCombat)) {
                                        callback(null, found);
                                    } else {
                                        callback(null, []);
                                    }
                                } else {
                                    callback(null, []);
                                }
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
                                } else if (data.found.resultFencing && data.found.resultFencing.status == 'IsCompleted' && data.found.resultFencing.isNoMatch == false) {
                                    if (data.found.opponentsSingle[0].equals(data.found.resultFencing.winner.opponentsSingle)) {
                                        lostPlayer.push(data.found.opponentsSingle[1]);
                                        winPlayer.push(data.found.resultFencing.winner.opponentsSingle);
                                        console.log("player", winPlayer);
                                    } else {
                                        lostPlayer.push(data.found.opponentsSingle[0]);
                                        winPlayer.push(data.found.resultFencing.winner.opponentsSingle);
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
                                    } else if (data.found.resultFencing && data.found.resultFencing.status == 'IsCompleted' && data.found.resultFencing.isNoMatch == false) {
                                        if (data.found.opponentsSingle[0].equals(data.found.resultFencing.winner.opponentsSingle)) {
                                            lostPlayer.push(data.found.opponentsSingle[1]);
                                            winPlayer.push(data.found.resultFencing.winner.opponentsSingle);
                                            console.log("player", winPlayer);
                                        } else {
                                            lostPlayer.push(data.found.opponentsSingle[0]);
                                            winPlayer.push(data.found.resultFencing.winner.opponentsSingle);
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
                                } else if (found[0].opponentsSingle.length == 2 && found[1].opponentsSingle.length == 2) {
                                    if (data.found.resultsCombat && data.found.resultsCombat.status == 'IsCompleted' && data.found.resultsCombat.isNoMatch == false) {
                                        if (data.found.resultsCombat.winner.opponentsSingle === found[1].opponentsSingle[0].toString()) {
                                            playerId1 = found[1].opponentsSingle[1];
                                            playerId = found[0].opponentsSingle[1];
                                            lostPlayer.push(playerId1);
                                            lostPlayer.push(found[0].opponentsSingle[0]);

                                        } else if (data.found.resultsCombat.winner.opponentsSingle === found[1].opponentsSingle[1].toString()) {
                                            playerId1 = found[1].opponentsSingle[0];
                                            playerId = found[0].opponentsSingle[0];
                                            lostPlayer.push(playerId1);
                                            lostPlayer.push(found[0].opponentsSingle[1]);
                                        }
                                        winPlayer.push(playerId);
                                        winPlayer.push(data.found.resultsCombat.winner.opponentsSingle);
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
                                        if (data.found.resultsRacquet.winner.opponentsSingle === found[1].opponentsSingle[0].toString()) {
                                            playerId1 = found[1].opponentsSingle[1];
                                            playerId = found[0].opponentsSingle[1];
                                            lostPlayer.push(playerId1);
                                            lostPlayer.push(found[0].opponentsSingle[0]);

                                        } else if (data.found.resultsRacquet.winner.opponentsSingle === found[1].opponentsSingle[1].toString()) {
                                            playerId1 = found[1].opponentsSingle[0];
                                            playerId = found[0].opponentsSingle[0];
                                            lostPlayer.push(playerId1);
                                            lostPlayer.push(found[0].opponentsSingle[1]);
                                        }
                                        winPlayer.push(playerId);
                                        winPlayer.push(data.found.resultsRacquet.winner.opponentsSingle);
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
                                    } else if (data.found.resultFencing && data.found.resultFencing.status == 'IsCompleted' && data.found.resultFencing.isNoMatch == false) {
                                        if (data.found.resultFencing.winner.opponentsSingle === found[1].opponentsSingle[0].toString()) {
                                            playerId1 = found[1].opponentsSingle[1];
                                            playerId = found[0].opponentsSingle[1];
                                            lostPlayer.push(playerId1);
                                            lostPlayer.push(found[0].opponentsSingle[0]);

                                        } else if (data.found.resultFencing.winner.opponentsSingle === found[1].opponentsSingle[1].toString()) {
                                            playerId1 = found[1].opponentsSingle[0];
                                            playerId = found[0].opponentsSingle[0];
                                            lostPlayer.push(playerId1);
                                            lostPlayer.push(found[0].opponentsSingle[1]);
                                        }
                                        winPlayer.push(playerId);
                                        winPlayer.push(data.found.resultFencing.winner.opponentsSingle);
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
                                } else if (data.found.resultKabaddi && data.found.resultKabaddi.status == 'IsCompleted' && data.found.resultKabaddi.isNoMatch == false) {
                                    if (data.found.opponentsTeam[0].equals(data.found.resultKabaddi.winner.player)) {
                                        lostPlayer.push(data.found.opponentsTeam[1]);
                                        winPlayer.push(data.found.resultKabaddi.winner.player);
                                        console.log("player", winPlayer);
                                    } else {
                                        lostPlayer.push(data.found.opponentsTeam[0]);
                                        winPlayer.push(data.found.resultKabaddi.winner.player);
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
                                } else if (data.found.resultHandball && data.found.resultHandball.status == 'IsCompleted' && data.found.resultHandball.isNoMatch == false) {
                                    if (data.found.opponentsTeam[0].equals(data.found.resultHandball.winner.player)) {
                                        lostPlayer.push(data.found.opponentsTeam[1]);
                                        winPlayer.push(data.found.resultHandball.winner.player);
                                        console.log("player", winPlayer);
                                    } else {
                                        lostPlayer.push(data.found.opponentsTeam[0]);
                                        winPlayer.push(data.found.resultHandball.winner.player);
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
                                } else if (data.found.resultsCombat && data.found.resultsCombat.status == 'IsCompleted' && data.found.resultsCombat.isNoMatch == false) {
                                    if (data.found.opponentsTeam[0].equals(data.found.resultsCombat.winner.player)) {
                                        lostPlayer.push(data.found.opponentsTeam[1]);
                                        winPlayer.push(data.found.resultsCombat.winner.player);
                                        console.log("player", winPlayer);
                                    } else {
                                        lostPlayer.push(data.found.opponentsTeam[0]);
                                        winPlayer.push(data.found.resultsCombat.winner.player);
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
                                    // var playerId = found[0].opponentsTeam[0];
                                    // var playerId1 = found[1].opponentsTeam[0];
                                    // winPlayer.push(playerId);
                                    // lostPlayer.push(playerId1);
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
                                    } else if (data.found.resultKabaddi && data.found.resultKabaddi.status == 'IsCompleted' && data.found.resultKabaddi.isNoMatch == false) {
                                        if (data.found.opponentsTeam[0].equals(data.found.resultKabaddi.winner.player)) {
                                            lostPlayer.push(data.found.opponentsTeam[1]);
                                            winPlayer.push(data.found.resultKabaddi.winner.player);
                                            console.log("player", winPlayer);
                                        } else {
                                            lostPlayer.push(data.found.opponentsTeam[0]);
                                            winPlayer.push(data.found.resultKabaddi.winner.player);
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
                                    } else if (data.found.resultHandball && data.found.resultHandball.status == 'IsCompleted' && data.found.resultHandball.isNoMatch == false) {
                                        if (data.found.opponentsTeam[0].equals(data.found.resultHandball.winner.player)) {
                                            lostPlayer.push(data.found.opponentsTeam[1]);
                                            winPlayer.push(data.found.resultHandball.winner.player);
                                            console.log("player", winPlayer);
                                        } else {
                                            lostPlayer.push(data.found.opponentsTeam[0]);
                                            winPlayer.push(data.found.resultHandball.winner.player);
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
                                    } else if (data.found.resultsCombat && data.found.resultsCombat.status == 'IsCompleted' && data.found.resultsCombat.isNoMatch == false) {
                                        if (data.found.opponentsTeam[0].equals(data.found.resultsCombat.winner.player)) {
                                            lostPlayer.push(data.found.opponentsTeam[1]);
                                            winPlayer.push(data.found.resultsCombat.winner.player);
                                            console.log("player", winPlayer);
                                        } else {
                                            lostPlayer.push(data.found.opponentsTeam[0]);
                                            winPlayer.push(data.found.resultsCombat.winner.player);
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
                                } else if (found[0].opponentsTeam.length == 2 && found[1].opponentsTeam.length == 2) {
                                    if (data.found.resultsRacquet && data.found.resultsRacquet.status == 'IsCompleted' && data.found.resultsRacquet.isNoMatch == false) {
                                        if (data.found.resultsRacquet.winner.player === found[1].opponentsTeam[0].toString()) {
                                            playerId1 = found[1].opponentsTeam[1];
                                            playerId = found[0].opponentsTeam[1];
                                            lostPlayer.push(playerId1);
                                            lostPlayer.push(found[0].opponentsTeam[0]);
                                        } else if (data.found.resultsRacquet.winner.player === found[1].opponentsTeam[1].toString()) {
                                            playerId1 = found[1].opponentsTeam[0];
                                            playerId = found[0].opponentsTeam[0];
                                            lostPlayer.push(playerId1);
                                            lostPlayer.push(found[0].opponentsTeam[1]);
                                        }
                                        winPlayer.push(playerId);
                                        winPlayer.push(data.found.resultsRacquet.winner.player);
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
                                        if (data.found.resultVolleyball.winner.player === found[1].opponentsTeam[0].toString()) {
                                            playerId1 = found[1].opponentsTeam[1];
                                            playerId = found[0].opponentsTeam[1];
                                            lostPlayer.push(playerId1);
                                            lostPlayer.push(found[0].opponentsTeam[0]);

                                        } else if (data.found.resultVolleyball.winner.player === found[1].opponentsTeam[1].toString()) {
                                            playerId1 = found[1].opponentsTeam[0];
                                            playerId = found[0].opponentsTeam[0];
                                            lostPlayer.push(playerId1);
                                            lostPlayer.push(found[0].opponentsTeam[1]);
                                        }
                                        winPlayer.push(playerId);
                                        winPlayer.push(data.found.resultVolleyball.winner.player);

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
                                        var winner = data.found.resultBasketball.winner.player;
                                        if (winner === found[1].opponentsTeam[0].toString()) {
                                            playerId1 = found[1].opponentsTeam[1];
                                            playerId = found[0].opponentsTeam[1];
                                            lostPlayer.push(playerId1);
                                            lostPlayer.push(found[0].opponentsTeam[0]);

                                        } else if (winner === found[1].opponentsTeam[1].toString()) {
                                            playerId1 = found[1].opponentsTeam[0];
                                            playerId = found[0].opponentsTeam[0];
                                            lostPlayer.push(playerId1);
                                            lostPlayer.push(found[0].opponentsTeam[1]);
                                        }
                                        winPlayer.push(playerId);
                                        winPlayer.push(data.found.resultBasketball.winner.player);

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
                                        if (data.found.resultHockey.winner.player === found[1].opponentsTeam[0].toString()) {
                                            playerId1 = found[1].opponentsTeam[1];
                                            playerId = found[0].opponentsTeam[1];
                                            lostPlayer.push(playerId1);
                                            lostPlayer.push(found[0].opponentsTeam[0]);

                                        } else if (data.found.resultHockey.winner.player === found[1].opponentsTeam[1].toString()) {
                                            playerId1 = found[1].opponentsTeam[0];
                                            playerId = found[0].opponentsTeam[0];
                                            lostPlayer.push(playerId1);
                                            lostPlayer.push(found[0].opponentsTeam[1]);
                                        }
                                        winPlayer.push(playerId);
                                        winPlayer.push(data.found.resultHockey.winner.player);

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
                                        if (data.found.resultWaterPolo.winner.player === found[1].opponentsTeam[0].toString()) {
                                            playerId1 = found[1].opponentsTeam[1];
                                            playerId = found[0].opponentsTeam[1];
                                            lostPlayer.push(playerId1);
                                            lostPlayer.push(found[0].opponentsTeam[0]);

                                        } else if (data.found.resultWaterPolo.winner.player === found[1].opponentsTeam[1].toString()) {
                                            playerId1 = found[1].opponentsTeam[0];
                                            playerId = found[0].opponentsTeam[0];
                                            lostPlayer.push(playerId1);
                                            lostPlayer.push(found[0].opponentsTeam[1]);
                                        }
                                        winPlayer.push(playerId);
                                        winPlayer.push(data.found.resultWaterPolo.winner.player);
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
                                    } else if (data.found.resultKabaddi && data.found.resultKabaddi.status == 'IsCompleted' && data.found.resultKabaddi.isNoMatch == false) {
                                        if (data.found.resultKabaddi.winner.player === found[1].opponentsTeam[0].toString()) {
                                            playerId1 = found[1].opponentsTeam[1];
                                            playerId = found[0].opponentsTeam[1];
                                            lostPlayer.push(playerId1);
                                            lostPlayer.push(found[0].opponentsTeam[0]);

                                        } else if (data.found.resultKabaddi.winner.player === found[1].opponentsTeam[1].toString()) {
                                            playerId1 = found[1].opponentsTeam[0];
                                            playerId = found[0].opponentsTeam[0];
                                            lostPlayer.push(playerId1);
                                            lostPlayer.push(found[0].opponentsTeam[1]);
                                        }
                                        winPlayer.push(playerId);
                                        winPlayer.push(data.found.resultKabaddi.winner.player);
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
                                    } else if (data.found.resultHandball && data.found.resultHandball.status == 'IsCompleted' && data.found.resultHandball.isNoMatch == false) {
                                        if (data.found.resultHandball.winner.player === found[1].opponentsTeam[0].toString()) {
                                            playerId1 = found[1].opponentsTeam[1];
                                            playerId = found[0].opponentsTeam[1];
                                            lostPlayer.push(playerId1);
                                            lostPlayer.push(found[0].opponentsTeam[0]);

                                        } else if (data.found.resultHandball.winner.player === found[1].opponentsTeam[1].toString()) {
                                            playerId1 = found[1].opponentsTeam[0];
                                            playerId = found[0].opponentsTeam[0];
                                            lostPlayer.push(playerId1);
                                            lostPlayer.push(found[0].opponentsTeam[1]);
                                        }
                                        winPlayer.push(playerId);
                                        winPlayer.push(data.found.resultHandball.winner.player);
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
                                    } else if (data.found.resultsCombat && data.found.resultsCombat.status == 'IsCompleted' && data.found.resultsCombat.isNoMatch == false) {
                                        if (data.found.resultsCombat.winner.player === found[1].opponentsTeam[0].toString()) {
                                            playerId1 = found[1].opponentsTeam[1];
                                            playerId = found[0].opponentsTeam[1];
                                            lostPlayer.push(playerId1);
                                            lostPlayer.push(found[0].opponentsTeam[0]);

                                        } else if (data.found.resultsCombat.winner.player === found[1].opponentsTeam[1].toString()) {
                                            playerId1 = found[1].opponentsTeam[0];
                                            playerId = found[0].opponentsTeam[0];
                                            lostPlayer.push(playerId1);
                                            lostPlayer.push(found[0].opponentsTeam[1]);
                                        }
                                        winPlayer.push(playerId);
                                        winPlayer.push(data.found.resultsCombat.winner.player);
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
                            // console.log("in found", found, "data", data);
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
                                } else if (data.found.resultFencing && data.found.resultFencing.status == 'IsCompleted' && data.found.resultFencing.isNoMatch == false) {
                                    winPlayer.push(data.found.resultFencing.winner.opponentsSingle);
                                    console.log("player", winPlayer);
                                    updateObj = {
                                        $set: {
                                            opponentsSingle: winPlayer
                                        }
                                    };
                                }
                            } else if (data.isTeam == false && !_.isEmpty(found[0].opponentsSingle)) {
                                if (found[0].opponentsSingle.length == 1) {
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
                                    } else if (data.found.resultFencing && data.found.resultFencing.status == "IsCompleted" && data.found.resultFencing.isNoMatch == false) {
                                        winPlayer.push(data.found.resultFencing.winner.opponentsSingle);
                                        console.log("player", winPlayer);
                                        updateObj = {
                                            $set: {
                                                opponentsSingle: winPlayer
                                            }
                                        };
                                    }
                                } else if (found[0].opponentsSingle.length == 2) {
                                    if (data.found.resultsCombat && data.found.resultsCombat.status == 'IsCompleted' && data.found.resultsCombat.isNoMatch == false) {
                                        if (data._id.equals(found[0].prevMatch[1]._id)) {
                                            var playerId = found[0].prevMatch[0].resultsCombat.winner.opponentsSingle;
                                            winPlayer.push(playerId);
                                        } else {
                                            var playerId = found[0].prevMatch[1].resultsCombat.winner.opponentsSingle;
                                            winPlayer.push(playerId);
                                        }
                                        winPlayer.push(data.found.resultsCombat.winner.opponentsSingle);
                                        updateObj = {
                                            $set: {
                                                opponentsSingle: winPlayer
                                            }
                                        };
                                    } else if (data.found.resultsRacquet && data.found.resultsRacquet.status == "IsCompleted" && data.found.resultsRacquet.isNoMatch == false) {
                                        if (data._id.equals(found[0].prevMatch[1]._id)) {
                                            var playerId = found[0].prevMatch[0].resultsRacquet.winner.opponentsSingle;
                                            winPlayer.push(playerId);
                                        } else {
                                            var playerId = found[0].prevMatch[1].resultsRacquet.winner.opponentsSingle;
                                            winPlayer.push(playerId);
                                        }
                                        winPlayer.push(data.found.resultsRacquet.winner.opponentsSingle);
                                        updateObj = {
                                            $set: {
                                                opponentsSingle: winPlayer
                                            }
                                        };
                                    } else if (data.found.resultFencing && data.found.resultFencing.status == "IsCompleted" && data.found.resultFencing.isNoMatch == false) {
                                        if (data._id.equals(found[0].prevMatch[1]._id)) {
                                            var playerId = found[0].prevMatch[0].resultFencing.winner.opponentsSingle;
                                            winPlayer.push(playerId);
                                        } else {
                                            var playerId = found[0].prevMatch[1].resultFencing.winner.opponentsSingle;
                                            winPlayer.push(playerId);
                                        }
                                        winPlayer.push(data.found.resultFencing.winner.opponentsSingle);
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
                                } else if (data.found.resultWaterPolo && data.found.resultWaterPolo.status == 'IsCompleted' && data.found.resultWaterPolo.isNoMatch == false) {
                                    winPlayer.push(data.found.resultWaterPolo.winner.player);
                                    console.log("player", winPlayer);
                                    updateObj = {
                                        $set: {
                                            opponentsTeam: winPlayer
                                        }
                                    };
                                } else if (data.found.resultKabaddi && data.found.resultKabaddi.status == 'IsCompleted' && data.found.resultKabaddi.isNoMatch == false) {
                                    winPlayer.push(data.found.resultKabaddi.winner.player);
                                    console.log("player", winPlayer);
                                    updateObj = {
                                        $set: {
                                            opponentsTeam: winPlayer
                                        }
                                    };
                                } else if (data.found.resultHandball && data.found.resultHandball.status == 'IsCompleted' && data.found.resultHandball.isNoMatch == false) {
                                    winPlayer.push(data.found.resultHandball.winner.player);
                                    console.log("player", winPlayer);
                                    updateObj = {
                                        $set: {
                                            opponentsTeam: winPlayer
                                        }
                                    };
                                } else if (data.found.resultsCombat && data.found.resultsCombat.status == 'IsCompleted' && data.found.resultsCombat.isNoMatch == false) {
                                    winPlayer.push(data.found.resultsCombat.winner.player);
                                    console.log("player", winPlayer);
                                    updateObj = {
                                        $set: {
                                            opponentsTeam: winPlayer
                                        }
                                    };
                                } else {
                                    // callback(null, found);
                                }
                            } else if (data.isTeam == true && !_.isEmpty(found[0].opponentsTeam)) {
                                if (found[0].opponentsTeam.length == 1) {
                                    if (data.found.resultsRacquet && data.found.resultsRacquet.status == "IsCompleted" && data.found.resultsRacquet.isNoMatch == false) {
                                        winPlayer.push(data.found.resultsRacquet.winner.player);
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
                                    } else if (data.found.resultWaterPolo && data.found.resultWaterPolo.status == "IsCompleted" && data.found.resultWaterPolo.isNoMatch == false) {
                                        winPlayer.push(data.found.resultWaterPolo.winner.player);
                                        console.log("player", winPlayer);
                                        updateObj = {
                                            $set: {
                                                opponentsTeam: winPlayer
                                            }
                                        };
                                    } else if (data.found.resultKabaddi && data.found.resultKabaddi.status == "IsCompleted" && data.found.resultKabaddi.isNoMatch == false) {
                                        winPlayer.push(data.found.resultKabaddi.winner.player);
                                        console.log("player", winPlayer);
                                        updateObj = {
                                            $set: {
                                                opponentsTeam: winPlayer
                                            }
                                        };
                                    } else if (data.found.resultHandball && data.found.resultHandball.status == "IsCompleted" && data.found.resultHandball.isNoMatch == false) {
                                        winPlayer.push(data.found.resultHandball.winner.player);
                                        console.log("player", winPlayer);
                                        updateObj = {
                                            $set: {
                                                opponentsTeam: winPlayer
                                            }
                                        };
                                    } else if (data.found.resultsCombat && data.found.resultsCombat.status == "IsCompleted" && data.found.resultsCombat.isNoMatch == false) {
                                        winPlayer.push(data.found.resultsCombat.winner.player);
                                        console.log("player", winPlayer);
                                        updateObj = {
                                            $set: {
                                                opponentsTeam: winPlayer
                                            }
                                        };
                                    } else {
                                        // callback(null, found);
                                    }
                                } else if (found[0].opponentsTeam.length == 2) {
                                    if (data.found.resultsRacquet && data.found.resultsRacquet.status == "IsCompleted" && data.found.resultsRacquet.isNoMatch == false) {
                                        if (data._id.equals(found[0].prevMatch[1]._id)) {
                                            var playerId = found[0].prevMatch[0].resultsRacquet.winner.player;
                                            winPlayer.push(playerId);
                                        } else {
                                            var playerId = found[0].prevMatch[1].resultsRacquet.winner.player;
                                            winPlayer.push(playerId);
                                        }
                                        winPlayer.push(data.found.resultsRacquet.winner.player);
                                        updateObj = {
                                            $set: {
                                                opponentsTeam: winPlayer
                                            }
                                        };
                                    } else if (data.found.resultVolleyball && data.found.resultVolleyball.status == "IsCompleted" && data.found.resultVolleyball.isNoMatch == false) {
                                        if (data._id.equals(found[0].prevMatch[1]._id)) {
                                            var playerId = found[0].prevMatch[0].resultVolleyball.winner.player;
                                            winPlayer.push(playerId);
                                        } else {
                                            var playerId = found[0].prevMatch[1].resultVolleyball.winner.player;
                                            winPlayer.push(playerId);
                                        }
                                        winPlayer.push(data.found.resultVolleyball.winner.player);
                                        updateObj = {
                                            $set: {
                                                opponentsTeam: winPlayer
                                            }
                                        };
                                    } else if (data.found.resultBasketball && data.found.resultBasketball.status == "IsCompleted" && data.found.resultBasketball.isNoMatch == false) {
                                        if (data._id.equals(found[0].prevMatch[1]._id)) {
                                            var playerId = found[0].prevMatch[0].resultBasketball.winner.player;
                                            winPlayer.push(playerId);
                                        } else {
                                            var playerId = found[0].prevMatch[1].resultBasketball.winner.player;
                                            winPlayer.push(playerId);
                                        }
                                        winPlayer.push(data.found.resultBasketball.winner.player);
                                        updateObj = {
                                            $set: {
                                                opponentsTeam: winPlayer
                                            }
                                        };
                                    } else if (data.found.resultHockey && data.found.resultHockey.status == "IsCompleted" && data.found.resultHockey.isNoMatch == false) {
                                        if (data._id.equals(found[0].prevMatch[1]._id)) {
                                            var playerId = found[0].prevMatch[0].resultHockey.winner.player;
                                            winPlayer.push(playerId);
                                        } else {
                                            var playerId = found[0].prevMatch[1].resultHockey.winner.player;
                                            winPlayer.push(playerId);
                                        }
                                        winPlayer.push(data.found.resultHockey.winner.player);
                                        updateObj = {
                                            $set: {
                                                opponentsTeam: winPlayer
                                            }
                                        };
                                    } else if (data.found.resultWaterPolo && data.found.resultWaterPolo.status == "IsCompleted" && data.found.resultWaterPolo.isNoMatch == false) {
                                        if (data._id.equals(found[0].prevMatch[1]._id)) {
                                            var playerId = found[0].prevMatch[0].resultWaterPolo.winner.player;
                                            winPlayer.push(playerId);
                                        } else {
                                            var playerId = found[0].prevMatch[1].resultWaterPolo.winner.player;
                                            winPlayer.push(playerId);
                                        }
                                        winPlayer.push(data.found.resultWaterPolo.winner.player);
                                        updateObj = {
                                            $set: {
                                                opponentsTeam: winPlayer
                                            }
                                        };
                                    } else if (data.found.resultKabaddi && data.found.resultKabaddi.status == "IsCompleted" && data.found.resultKabaddi.isNoMatch == false) {
                                        if (data._id.equals(found[0].prevMatch[1]._id)) {
                                            var playerId = found[0].prevMatch[0].resultKabaddi.winner.player;
                                            winPlayer.push(playerId);
                                        } else {
                                            var playerId = found[0].prevMatch[1].resultKabaddi.winner.player;
                                            winPlayer.push(playerId);
                                        }
                                        winPlayer.push(data.found.resultKabaddi.winner.player);
                                        updateObj = {
                                            $set: {
                                                opponentsTeam: winPlayer
                                            }
                                        };
                                    } else if (data.found.resultHandball && data.found.resultHandball.status == "IsCompleted" && data.found.resultHandball.isNoMatch == false) {
                                        if (data._id.equals(found[0].prevMatch[1]._id)) {
                                            var playerId = found[0].prevMatch[0].resultHandball.winner.player;
                                            winPlayer.push(playerId);
                                        } else {
                                            var playerId = found[0].prevMatch[1].resultHandball.winner.player;
                                            winPlayer.push(playerId);
                                        }
                                        winPlayer.push(data.found.resultHandball.winner.player);
                                        updateObj = {
                                            $set: {
                                                opponentsTeam: winPlayer
                                            }
                                        };
                                    } else if (data.found.resultsCombat && data.found.resultsCombat.status == "IsCompleted" && data.found.resultsCombat.isNoMatch == false) {
                                        if (data._id.equals(found[0].prevMatch[1]._id)) {
                                            var playerId = found[0].prevMatch[0].resultsCombat.winner.player;
                                            winPlayer.push(playerId);
                                        } else {
                                            var playerId = found[0].prevMatch[1].resultsCombat.winner.player;
                                            winPlayer.push(playerId);
                                        }
                                        winPlayer.push(data.found.resultsCombat.winner.player);
                                        updateObj = {
                                            $set: {
                                                opponentsTeam: winPlayer
                                            }
                                        };
                                    } else {
                                        callback(null, found);
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
                                                    callback(null, found[0]);
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
                                                    callback(null, found[1]);
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
                                            callback(null, found[0]);
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

    updateSwiss: function (importData, data, callback) {
        var countError = 0;
        async.waterfall([
                function (callback) {
                    async.concatSeries(importData, function (singleData, callback) {
                            var dateTime = moment(singleData.DATE, "DD-MM-YYYY").add(1, 'days');
                            singleData.DATE = dateTime;
                            async.waterfall([
                                    function (callback) {
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
                                                        var err = "SFAID 1 may have wrong values";
                                                        callback(null, {
                                                            error: err,
                                                            success: singleData
                                                        });
                                                    } else {
                                                        singleData["NAME 1"] = complete._id;
                                                        singleData["Athlete 1"] = complete.athleteId;
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
                                                        singleData["NAME 2"] = null;
                                                        var err = "SFAID 2 may have wrong values";
                                                        callback(null, {
                                                            error: err,
                                                            success: singleData
                                                        });
                                                    } else {
                                                        singleData["NAME 2"] = complete._id;
                                                        singleData["Athlete 2"] = complete.athleteId;
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
                                            var temp = {};
                                            temp.isNoMatch1 = false;
                                            temp.isNoMatch2 = false;
                                            paramData.opponentsSingle = [];
                                            paramData.matchId = singleData["MATCH ID"];
                                            paramData.round = singleData["ROUND NAME"];

                                            if (_.isEmpty(singleData["NAME 1"]) && _.isEmpty(singleData["NAME 2"])) {
                                                paramData.opponentsSingle = "";
                                                resultData.isNoMatch = true;
                                            } else {
                                                if (_.isEmpty(singleData["NAME 1"])) {
                                                    paramData.opponentsSingle.push(singleData["NAME 2"]);
                                                    player.id = singleData["NAME 2"];
                                                    player.player = singleData["Athlete 2"];
                                                    player.score = singleData["P2 SCORE"];
                                                    player.rank = singleData["P2 RANK"];
                                                    resultData.players.push(player);
                                                    resultData.isNoMatch = false;
                                                } else if (_.isEmpty(singleData["NAME 2"])) {
                                                    paramData.opponentsSingle.push(singleData["NAME 1"]);
                                                    player.id = singleData["NAME 1"];
                                                    player.player = singleData["Athlete 1"];
                                                    player.score = singleData["P1 SCORE"];
                                                    player.rank = singleData["P1 RANK"];
                                                    resultData.players.push(player);
                                                    resultData.isNoMatch = false;
                                                } else {
                                                    paramData.opponentsSingle.push(singleData["NAME 1"]);
                                                    player.id = singleData["NAME 1"];
                                                    player.player = singleData["Athlete 1"];
                                                    if (singleData["P1 SCORE"] !== undefined || !_.isEmpty(singleData["P1 SCORE"])) {
                                                        player.score = singleData["P1 SCORE"];
                                                        if (singleData["P1 RANK"] !== undefined || !_.isEmpty(singleData["P1 RANK"])) {
                                                            player.rank = singleData["P1 RANK"];
                                                        } else {
                                                            player.rank = "";
                                                        }
                                                        player.noShow = false;
                                                        player.walkover = false;
                                                    } else {
                                                        if (singleData["WINNER SFAID"] == singleData["SFAID 1"]) {
                                                            player.score = "";
                                                            player.rank = "";
                                                            player.noShow = false;
                                                            player.walkover = true;
                                                            player1.walkover = false;
                                                            player1.noShow = true;
                                                        } else if (singleData["WINNER SFAID"] == singleData["SFAID 2"]) {
                                                            player.score = "";
                                                            player.rank = "";
                                                            player.noShow = true;
                                                            player.walkover = false;
                                                            player1.walkover = true;
                                                            player1.noShow = false;
                                                        } else {
                                                            player.score = "";
                                                            player.rank = "";
                                                            player.noShow = false;
                                                            player.walkover = false;
                                                            player1.walkover = false;
                                                            player1.noShow = false;
                                                            temp.isNoMatch1 = true;
                                                        }
                                                    }
                                                    paramData.opponentsSingle.push(singleData["NAME 2"]);
                                                    player1.id = singleData["NAME 2"];
                                                    player1.player = singleData["Athlete 2"];
                                                    if (singleData["P2 SCORE"] !== undefined || !_.isEmpty(singleData["P2 SCORE"])) {
                                                        console.log("Player 2", player1);
                                                        player1.score = singleData["P2 SCORE"];
                                                        if (singleData["P2 RANK"] !== undefined || !_.isEmpty(singleData["P2 RANK"])) {
                                                            player1.rank = singleData["P2 RANK"];
                                                        } else {
                                                            player1.rank = "";
                                                        }
                                                        player1.noShow = false;
                                                        player1.walkover = false;
                                                    } else {
                                                        if (singleData["WINNER SFAID"] == singleData["SFAID 1"]) {
                                                            player1.score = "";
                                                            player1.rank = "";
                                                            player1.noShow = false;
                                                            player1.walkover = true;
                                                            player.noShow = true;
                                                            player.walkover = false;
                                                        } else if (singleData["WINNER SFAID"] == singleData["SFAID 2"]) {
                                                            player1.score = "";
                                                            player1.rank = "";
                                                            player1.noShow = true;
                                                            player1.walkover = false;
                                                            player.walkover = true;
                                                            player.noShow = false;
                                                        } else {
                                                            player1.score = "";
                                                            player1.rank = "";
                                                            player.noShow = false;
                                                            player.walkover = false;
                                                            player1.walkover = false;
                                                            player1.noShow = false;
                                                            temp.isNoMatch2 = true;
                                                        }
                                                    }
                                                    resultData.players.push(player);
                                                    resultData.players.push(player1);
                                                }
                                            }
                                            if (singleData["WINNER SFAID"] == singleData["SFAID 1"]) {
                                                winner.player = singleData["NAME 1"];
                                                resultData.isDraw = false;
                                            } else if (singleData["WINNER SFAID"] == singleData["SFAID 2"]) {
                                                winner.player = singleData["NAME 2"];
                                                resultData.isDraw = false;
                                            } else if (temp.isNoMatch1 == true && temp.isNoMatch2 == true) {
                                                resultData.isNoMatch = true;
                                            } else {
                                                resultData.isDraw = true;
                                            }
                                            resultData.winner = winner;
                                            paramData.resultSwiss = resultData;
                                            paramData.sport = singleData.SPORT;
                                            paramData.scheduleDate = singleData.DATE;
                                            paramData.scheduleTime = singleData.TIME;
                                            paramData.video = singleData["VIDEO"];
                                            paramData.video = singleData["VIDEO TYPE"];
                                            Match.update({
                                                matchId: paramData.matchId
                                            }, paramData).exec(
                                                function (err, complete) {
                                                    if (err || _.isEmpty(complete)) {
                                                        var err = "Not updated";
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
                        },
                        function (err, singleData) {
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
                    console.log("data******", importData[0]);
                    callback(null, results);
                }
            });

    },

    updateResultImages: function (data, callback) {
        var matchObj = {
            $set: {
                resultImages: data.resultImages
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

    updateVideo: function (data, callback) {
        var countError = 0;
        async.concatSeries(importData, function (singleData, callback) {
                var paramData = {};
                paramData.opponentsTeam = [];
                paramData.matchId = singleData["MATCH ID"];
                paramData.video = singleData["VIDEO"];
                paramData.video = singleData["VIDEO TYPE"];
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
            },
            function (err, singleData) {
                callback(null, singleData);
            });
    },

    updateKnockoutTeam: function (importData, data, callback) {
        var countError = 0;
        async.waterfall([
                function (callback) {
                    async.concatSeries(importData, function (singleData, callback) {
                            var dateTime = moment(singleData.DATE, "DD-MM-YYYY").add(1, 'days');
                            singleData.DATE = dateTime;
                            async.waterfall([
                                    function (callback) {
                                        var paramData = {};
                                        paramData.name = _.trim(singleData.EVENT);
                                        paramData.age = _.trim(singleData["AGE GROUP"]);
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
                                        if (singleData.error) {
                                            countError++;
                                            callback(null, singleData);
                                        } else {
                                            if (_.isEmpty(singleData["TEAM ID 1"])) {
                                                callback(null, singleData);
                                            } else {
                                                var paramData = {};
                                                paramData.team = _.trim(singleData["TEAM ID 1"]);
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
                                                        singleData["PARTICIPANT 1"] = complete._id;
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
                                            if (_.isEmpty(singleData["TEAM ID 2"])) {
                                                callback(null, singleData);
                                            } else {
                                                var paramData = {};
                                                paramData.team = _.trim(singleData["TEAM ID 2"]);
                                                paramData.sport = singleData.SPORT;
                                                Match.getTeamId(paramData, function (err, complete) {
                                                    if (err || _.isEmpty(complete)) {
                                                        singleData["PARTICIPANT 2"] = "";
                                                        err = "TEAM ID 2 may have wrong values";
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
                                        if (singleData.error) {
                                            countError++;
                                            callback(null, singleData);
                                        } else {
                                            var paramData = {};
                                            paramData.opponentsTeam = [];
                                            paramData.matchId = singleData["MATCH ID"];
                                            paramData.round = _.trim(singleData["ROUND NAME"]);
                                            if (_.isEmpty(singleData["PARTICIPANT 1"]) && _.isEmpty(singleData["PARTICIPANT 2"])) {
                                                paramData.opponentsTeam = [];
                                            } else if (_.isEmpty(singleData["PARTICIPANT 1"])) {
                                                paramData.opponentsTeam.push(singleData["PARTICIPANT 2"]);
                                            } else if (_.isEmpty(singleData["PARTICIPANT 2"])) {
                                                paramData.opponentsTeam.push(singleData["PARTICIPANT 1"]);
                                            } else {
                                                paramData.opponentsTeam.push(singleData["PARTICIPANT 1"]);
                                                paramData.opponentsTeam.push(singleData["PARTICIPANT 2"]);
                                            }
                                            // console.log("singleData", singleData);
                                            // console.log("opponentsTeam", paramData.opponentsTeam);
                                            paramData.sport = singleData.SPORT;
                                            paramData.scheduleDate = singleData.DATE;
                                            if (!_.isEmpty(singleData.TIME) || singleData.TIME != null) {
                                                paramData.scheduleTime = singleData.TIME;
                                            }
                                            if (!_.isEmpty(paramData.opponentsTeam)) {
                                                Match.update({
                                                    matchId: paramData.matchId
                                                }, paramData).exec(function (err, match) {
                                                    if (err) {
                                                        callback(err, null);
                                                    } else {
                                                        if (_.isEmpty(match)) {
                                                            callback(null, []);
                                                        } else {
                                                            console.log("match", match);
                                                            callback(null, match);
                                                        }
                                                    }
                                                });
                                            } else {
                                                callback(null, singleData);
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
                        function (err, singleData) {
                            callback(null, singleData)
                        });
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

    updateKnockoutIndividual: function (importData, data, callback) {
        var countError = 0;
        async.waterfall([
                function (callback) {
                    async.concatSeries(importData, function (singleData, callback) {
                            var dateTime = moment(singleData.DATE, "DD-MM-YYYY").add(1, 'days');
                            singleData.DATE = dateTime;
                            async.waterfall([
                                    function (callback) {
                                        var paramData = {};
                                        paramData.name = _.trim(singleData.EVENT);
                                        paramData.age = _.trim(singleData["AGE GROUP"]);
                                        var gen = _.trim(singleData.GENDER);
                                        if (gen == "Boys" || gen == "Male" || gen == "male") {
                                            paramData.gender = "male";
                                        } else if (gen == "Girls" || gen == "Female" || gen == "female") {
                                            paramData.gender = "female";
                                        }
                                        var weight = singleData["WEIGHT CATEGORIES"];
                                        paramData.weight = _.trimStart(weight, " ");
                                        // console.log("para,", paramData);
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
                                                singleData["PARTICIPANT 1"] = null;
                                                callback(null, singleData);
                                            } else {
                                                // console.log("singleData1", singleData);
                                                var paramData = {};
                                                paramData.participant = _.trim(singleData["SFAID 1"]);
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
                                        // console.log("logssss***", singleData);
                                        if (singleData.error) {
                                            countError++;
                                            callback(null, singleData);
                                        } else {
                                            if (_.isEmpty(singleData["SFAID 2"])) {
                                                singleData["PARTICIPANT 2"] = "";
                                                callback(null, singleData);
                                            } else {
                                                var paramData = {};
                                                paramData.participant = _.trim(singleData["SFAID 2"]);
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
                                        if (singleData.error) {
                                            countError++;
                                            callback(null, singleData);
                                        } else {
                                            var paramData = {};
                                            paramData.opponentsSingle = [];
                                            paramData.matchId = singleData["MATCH ID"];
                                            paramData.round = _.trim(singleData["ROUND NAME"]);
                                            if (_.isEmpty(singleData["PARTICIPANT 1"]) && _.isEmpty(singleData["PARTICIPANT 2"])) {
                                                paramData.opponentsSingle = [];
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
                                            if (!_.isEmpty(singleData.TIME) || singleData.TIME != null) {
                                                paramData.scheduleTime = singleData.TIME;
                                            }
                                            if (data.resultType == 'qualifying-knockout' && data.excelType == 'knockout') {
                                                paramData.excelType = data.excelType;
                                            }
                                            paramData.video = singleData["VIDEO TYPE"];
                                            paramData.videoType = singleData["VIDEO"];
                                            Match.update({
                                                matchId: paramData.matchId
                                            }, paramData).exec(function (err, match) {
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
            ],
            function (err, results) {
                if (err || _.isEmpty(results)) {
                    callback(err, null);
                } else {
                    callback(null, results);
                }
            });
    },

    //----------------------------------Winners-------------------------------------------

    getAggregatePipelineIndividual: function (data) {
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
                    preserveNullAndEmptyArrays: false // optional
                }
            },

            // Stage 3
            {
                $match: {
                    sport: objectid(data.sport),
                    "opponentsSingle.athleteId": objectid(data.athlete),
                }
            },
            // Stage 4
            {
                $sort: {
                    createdAt: -1
                }
            },
            // Stage 5
            {
                $limit: 1
            },

        ];
        return pipeline;
    },

    getTeamAggregatePipeline: function (data) {
        // console.log(data);
        var pipeline = [
            // Stage 1
            {
                $lookup: {
                    "from": "teamsports",
                    "localField": "opponentsTeam",
                    "foreignField": "_id",
                    "as": "opponentsTeam"
                }
            },

            // Stage 2
            {
                $unwind: {
                    path: "$opponentsTeam",
                    preserveNullAndEmptyArrays: true // optional
                }
            },

            // Stage 3
            {
                $match: {

                }
            },

            // Stage 4
            {
                $match: {
                    sport: objectid(data.sport),
                    "opponentsTeam._id": objectid(data.team)
                }
            },

            // Stage 5
            {
                $sort: {
                    createdAt: -1
                }
            },

            // Stage 6
            {
                $limit: 1
            },

        ];
        return pipeline;
    },

    getAllWinners: function (data, callback) {
        async.waterfall([
                function (callback) {
                    var deepSearch = "player team.studentTeam.studentId team.school";
                    Medal.find({
                        sport: data.sport
                    }).lean().deepPopulate(deepSearch).exec(function (err, found) {
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
                    console.log("found", found);
                    var finalData = [];
                    async.eachSeries(found, function (singleData, callback) {
                            // console.log("singleData", singleData);
                            if (!_.isEmpty(singleData.player)) {
                                async.eachSeries(singleData.player, function (n, callback) {
                                    console.log("n", n);
                                    data.athlete = n._id;
                                    var pipeLine = Match.getAggregatePipelineIndividual(data);
                                    Match.aggregate(pipeLine, function (err, matchData) {
                                        if (err) {
                                            callback(err, "error in mongoose");
                                        } else if (_.isEmpty(matchData)) {
                                            callback(null, []);
                                        } else {
                                            var result = {};
                                            async.waterfall([
                                                    function (callback) {
                                                        console.log('match data', matchData);
                                                        if (matchData[0].resultHeat) {
                                                            if (n.middleName) {
                                                                result.name = n.firstName + " " + n.middleName + " " + n.surname;
                                                            } else {
                                                                result.name = n.firstName + " " + n.surname;
                                                            }
                                                            result.sfaId = n.sfaId;
                                                            result.gender = n.gender;
                                                            result.school = singleData.school[0].schoolName;
                                                            result.profile = n.photograph;
                                                            result.medaltype = singleData.medalType;
                                                            async.each(matchData[0].resultHeat.players, function (player, callback) {
                                                                console.log("player", player, "n", n._id);
                                                                IndividualSport.findOne({
                                                                    _id: player.id,
                                                                    athleteId: n._id
                                                                }).lean().exec(function (err, found) {
                                                                    if (!_.isEmpty(found)) {
                                                                        result.result = player.time;
                                                                    }
                                                                    callback(null, result);

                                                                });
                                                            }, function (err) {
                                                                callback(null, result);
                                                            });
                                                        } else if (matchData[0].resultQualifyingRound) {
                                                            if (n.middleName) {
                                                                result.name = n.firstName + " " + n.middleName + " " + n.surname;
                                                            } else {
                                                                result.name = n.firstName + " " + n.surname;
                                                            }
                                                            result.sfaId = n.sfaId;
                                                            result.gender = n.gender;
                                                            result.profile = n.photograph;
                                                            result.school = singleData.school[0].schoolName;
                                                            result.medaltype = singleData.medalType;
                                                            if (matchData[0].resultQualifyingRound.player.bestAttempt) {
                                                                result.result = matchData[0].resultQualifyingRound.player.bestAttempt;
                                                            } else {
                                                                var height = matchData[0].resultQualifyingRound.round.substr(7, 8);
                                                                result.result = height;
                                                            }
                                                            callback(null, result);
                                                        } else if (matchData[0].resultSwiss) {
                                                            if (n.middleName) {
                                                                result.name = n.firstName + " " + n.middleName + " " + n.surname;
                                                            } else {
                                                                result.name = n.firstName + " " + n.surname;
                                                            }
                                                            result.sfaId = n.sfaId;
                                                            result.gender = n.gender;
                                                            result.profile = n.photograph;
                                                            result.school = singleData.school[0].schoolName;
                                                            result.medaltype = singleData.medalType;
                                                            async.each(matchData[0].resultSwiss.players, function (player, callback) {
                                                                console.log("player", player, "n", n._id);
                                                                IndividualSport.findOne({
                                                                    _id: player.id,
                                                                    athleteId: n._id
                                                                }).lean().exec(function (err, found) {
                                                                    if (!_.isEmpty(found)) {
                                                                        result.result = player.score;

                                                                    }
                                                                    callback(null, result);
                                                                });
                                                            }, function (err) {
                                                                callback(null, result);
                                                            });
                                                        } else if (matchData[0].resultShooting) {
                                                            if (n.middleName) {
                                                                result.name = n.firstName + " " + n.middleName + " " + n.surname;
                                                            } else {
                                                                result.name = n.firstName + " " + n.surname;
                                                            }
                                                            result.sfaId = n.sfaId;
                                                            result.gender = n.gender;
                                                            result.profile = n.photograph;
                                                            result.school = singleData.school[0].schoolName;
                                                            result.medaltype = singleData.medalType;
                                                            result.result = matchData[0].resultShooting.finalScore;
                                                            callback(null, result);
                                                        } else {
                                                            if (n.middleName) {
                                                                result.name = n.firstName + " " + n.middleName + " " + n.surname;
                                                            } else {
                                                                result.name = n.firstName + " " + n.surname;
                                                            }
                                                            result.profile = n.photograph;
                                                            result.gender = n.gender;
                                                            result.sfaId = n.sfaId;
                                                            result.school = singleData.school[0].schoolName;
                                                            result.medaltype = singleData.medalType;
                                                            callback(null, result);
                                                        }
                                                    },
                                                    function (result, callback) {
                                                        finalData.push(result);
                                                        callback(null, finalData);
                                                    }
                                                ],
                                                function (err, finalData) {
                                                    if (err) {
                                                        callback(null, []);
                                                    } else if (finalData) {
                                                        if (_.isEmpty(finalData)) {
                                                            callback(null, finalData);
                                                        } else {
                                                            callback(null, finalData);
                                                        }
                                                    }
                                                });
                                        }
                                    });
                                }, function (err, playerData) {
                                    if (err) {
                                        callback(err, null);
                                    } else {
                                        callback(null, playerData);
                                    }
                                });

                            } else {
                                async.eachSeries(singleData.team, function (n, callback) {
                                    console.log("n in team", n);
                                    data.sport = n.sport;
                                    data.team = n._id;
                                    console.log("data", data);
                                    var pipeLine = Match.getTeamAggregatePipeline(data);
                                    Match.aggregate(pipeLine, function (err, matchData) {
                                        if (err) {
                                            callback(err, "error in mongoose");
                                        } else if (_.isEmpty(matchData)) {
                                            console.log("empty match", matchData);
                                            callback(null, []);
                                        } else {
                                            console.log("match", matchData);
                                            async.waterfall([
                                                    function (callback) {
                                                        console.log("matchData[0]", matchData[0]);
                                                        var result = {};
                                                        if (matchData[0].resultHeat) {
                                                            result.name = n.name;
                                                            result.teamId = n.teamId;
                                                            result.gender = n.studentTeam[0].studentId.gender;

                                                            console.log("school", n.school);
                                                            if (n.school != null) {
                                                                result.profile = n.school.schoolLogo;
                                                            } else {
                                                                result.profile = "";
                                                            }
                                                            result.school = n.schoolName;
                                                            result.medaltype = singleData.medalType;
                                                            async.each(matchData[0].resultHeat.teams, function (player, callback) {
                                                                console.log("player", player, "n", n._id);
                                                                if (player.id.equals(n._id)) {
                                                                    console.log("matched", player.time);
                                                                    result.result = player.time;
                                                                }
                                                                callback(null, result);
                                                            }, function (err) {
                                                                callback(null, result);
                                                            });
                                                        } else if (matchData[0].resultQualifyingRound) {
                                                            result.name = n.name;
                                                            result.teamId = n.teamId;
                                                            result.gender = n.studentTeam[0].studentId.gender;
                                                            if (n.school != null) {
                                                                result.profile = n.school.schoolLogo;
                                                            } else {
                                                                result.profile = "";
                                                            }
                                                            result.school = n.schoolName;
                                                            result.medaltype = singleData.medalType;
                                                            if (matchData[0].resultQualifyingRound.player.bestAttempt) {
                                                                result.result = matchData[0].resultQualifyingRound.player.bestAttempt;
                                                            } else {
                                                                var height = matchData[0].resultQualifyingRound.round.substring(7, 8);
                                                                result.result = height;
                                                            }
                                                            callback(null, result);
                                                        } else if (matchData[0].resultSwiss) {
                                                            result.name = n.name;
                                                            result.teamId = n.teamId;
                                                            result.gender = n.studentTeam[0].studentId.gender;
                                                            if (n.school != null) {
                                                                result.profile = n.school.schoolLogo;
                                                            } else {
                                                                result.profile = "";
                                                            }
                                                            result.school = n.schoolName;
                                                            result.medaltype = singleData.medalType;
                                                            async.each(matchData[0].resultSwiss.players, function (player, callback) {
                                                                if (player.id.equals(n._id)) {
                                                                    result.result = player.score;
                                                                }
                                                                callback(null, result);
                                                            }, function (err) {
                                                                callback(null, result);
                                                            });
                                                        } else if (matchData[0].resultShooting) {
                                                            result.name = n.name;
                                                            result.teamId = n.teamId;
                                                            result.gender = n.schoolName;
                                                            if (n.school != null) {
                                                                result.profile = n.school.schoolLogo;
                                                            } else {
                                                                result.profile = "";
                                                            }
                                                            result.school = n.schoolName;
                                                            result.medaltype = singleData.medalType;
                                                            result.result = matchData[0].resultShooting.finalScore;
                                                            callback(null, result);
                                                        } else if (matchData[0].resultsRacquet) {
                                                            console.log("matchData[0]", matchData[0]);
                                                            result.name = n.name;
                                                            result.teamId = n.teamId;
                                                            result.gender = n.studentTeam[0].studentId.gender;
                                                            if (n.school != null) {
                                                                result.profile = n.school.schoolLogo;
                                                            } else {
                                                                result.profile = "";
                                                            }
                                                            result.school = n.schoolName;
                                                            result.medaltype = singleData.medalType;
                                                            async.each(matchData[0].resultsRacquet.teams, function (team, callback) {
                                                                console.log("team", team, "n", n);
                                                                var teamid = team.team;
                                                                var nId = n._id.toString();
                                                                if (teamid === nId) {
                                                                    console.log("inside", team.players);
                                                                    // result.players = [];
                                                                    var listPlayers = [];
                                                                    async.each(team.players, function (playerList, callback) {
                                                                        console.log("playerlist", playerList);
                                                                        listPlayers.push({
                                                                            name: playerList.fullName,
                                                                            sfaId: playerList.sfaId
                                                                        });
                                                                        callback();
                                                                    }, function (err) {
                                                                        result.players = listPlayers;
                                                                        callback(null, result);
                                                                    });
                                                                } else {
                                                                    callback(null, result);
                                                                }
                                                            }, function (err) {
                                                                callback(null, result);
                                                            });
                                                        } else {
                                                            result.name = n.name;
                                                            result.teamId = n.teamId;
                                                            result.gender = n.studentTeam[0].studentId.gender;
                                                            if (n.school != null) {
                                                                result.profile = n.school.schoolLogo;
                                                            } else {
                                                                result.profile = "";
                                                            }
                                                            result.school = n.schoolName;
                                                            result.medaltype = singleData.medalType;
                                                            callback(null, result);
                                                        }
                                                    },
                                                    function (result, callback) {
                                                        finalData.push(result);
                                                        callback(null, finalData);
                                                    }
                                                ],
                                                function (err, finalData) {
                                                    if (err) {
                                                        callback(null, []);
                                                    } else if (finalData) {
                                                        if (_.isEmpty(finalData)) {
                                                            callback(null, finalData);
                                                        } else {
                                                            callback(null, finalData);
                                                        }
                                                    }
                                                });
                                        }
                                    });
                                }, function (err, playerData) {
                                    if (err) {
                                        callback(err, null);
                                    } else {
                                        callback(null, playerData);
                                    }
                                });
                            }
                        },
                        function (err) {
                            if (err) {
                                callback(err, null);
                            } else {
                                callback(null, finalData);
                            }
                        });
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

    //--------------------VIDEO EXCEL---------------------------------------------------------

    getVideoExcelAthlete: function (single, callback) {
        async.waterfall([
                function (callback) {
                    var pipeLine = Match.getSinglesAggregatePipeline(single);
                    Match.aggregate(pipeLine, function (err, singleData) {
                        console.log("single", singleData);
                        if (err) {
                            callback(err, "error in mongoose");
                        } else if (_.isEmpty(singleData)) {
                            callback(null, []);
                        } else {
                            callback(null, singleData);
                        }
                    });
                },
                function (singleData, callback) {
                    var pipeLine = Match.getTeamAggregatePipelineNew(single);
                    Match.aggregate(pipeLine, function (err, matchData) {
                        console.log("team", matchData);
                        if (err) {
                            callback(err, "error in mongoose");
                        } else if (_.isEmpty(matchData)) {
                            var final = singleData
                            callback(null, final);
                        } else {
                            var final = [].concat.apply([], [
                                singleData,
                                matchData
                            ]);
                            callback(null, final);
                        }
                    });
                },
                function (finals, callback) {
                    var singleAthlete = [];
                    _.each(finals, function (final) {
                        var obj = {};
                        obj.athleteSFAID = single.sfaId;
                        if (single.middleName) {
                            obj.athleteName = single.firstName + " " + single.middleName + " " + single.surname;
                        } else {
                            obj.athleteName = single.firstName + " " + single.surname;
                        }
                        if (single.atheleteSchoolName) {
                            obj.athleteSchool = single.atheleteSchoolName;
                        } else if (single.school.name != null) {
                            obj.athleteSchool = single.school.name;
                        } else {
                            obj.athleteSchool = "";
                        }
                        if (final.sport.gender == "male") {
                            obj.gender = "Male";
                        } else if (final.sport.gender == "female") {
                            obj.gender = "Female";
                        } else {
                            obj.gender = "Male & Female";
                        }
                        obj.year = single.year;
                        if (final.sport.ageGroup) {
                            obj.ageCategory = final.sport.ageGroup.name;
                        } else {
                            obj.ageCategory = "";
                        }
                        obj.sport = final.sport.sportslist.sportsListSubCategory.name;
                        if (final.sport.sportslist) {
                            obj.event = final.sport.sportslist.name;
                        } else {
                            obj.event = "-";
                        }
                        if (final.sport.weight) {
                            obj.weight = final.sport.weight.name;
                        } else {
                            obj.weight = "-";
                        }
                        if (final.video) {
                            obj.videoLink = final.video;
                        } else {
                            obj.videoLink = "-";
                        }
                        AthleteVideo.saveData(obj, function (err, excelData) {
                            console.log("excelData", excelData);
                            singleAthlete.push(obj);
                        });
                    });
                    callback(null, singleAthlete);
                }
            ],
            function (err, excelData) {
                if (err) {
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

    getSinglesAggregatePipeline: function (data) {
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
                    preserveNullAndEmptyArrays: false // optional
                }
            },

            // Stage 3
            {
                $match: {
                    "opponentsSingle.athleteId": objectid(data._id)
                }
            },

            // // Stage 5
            // {
            //     $lookup: {
            //         "from": "atheletes",
            //         "localField": "opponentsSingle.athleteId",
            //         "foreignField": "_id",
            //         "as": "opponentsSingle.athleteId"
            //     }
            // },
            // //
            // {
            //     $unwind: {
            //         path: "$opponentsSingle.athleteId",
            //         preserveNullAndEmptyArrays: false // optional
            //     }
            // },
            // Stage 7
            {
                $lookup: {
                    "from": "sports",
                    "localField": "sport",
                    "foreignField": "_id",
                    "as": "sport"
                }
            },

            // Stage 8
            {
                $unwind: {
                    path: "$sport",
                }
            },
            // Stage 7
            {
                $lookup: {
                    "from": "sportslists",
                    "localField": "sport.sportslist",
                    "foreignField": "_id",
                    "as": "sport.sportslist"
                }
            },

            // Stage 8
            {
                $unwind: {
                    path: "$sport.sportslist",
                }
            },
            {
                $lookup: {
                    "from": "sportslistsubcategories",
                    "localField": "sport.sportslist.sportsListSubCategory",
                    "foreignField": "_id",
                    "as": "sport.sportslist.sportsListSubCategory"
                }
            },

            // Stage 8
            {
                $unwind: {
                    path: "$sport.sportslist.sportsListSubCategory",
                }
            },
            // Stage 7
            {
                $lookup: {
                    "from": "agegroups",
                    "localField": "sport.ageGroup",
                    "foreignField": "_id",
                    "as": "sport.ageGroup"
                }
            },

            // Stage 8
            {
                $unwind: {
                    path: "$sport.ageGroup",
                }
            },
            // Stage 7
            {
                $lookup: {
                    "from": "weights",
                    "localField": "sport.weight",
                    "foreignField": "_id",
                    "as": "sport.weight"
                }
            },

            // Stage 8
            {
                $unwind: {
                    path: "$sport.weight",
                    preserveNullAndEmptyArrays: true // optional
                }
            },

        ];
        return pipeline;
    },

    getTeamAggregatePipelineNew: function (data) {
        var pipeline = [
            // Stage 1
            {
                $lookup: {
                    "from": "teamsports",
                    "localField": "opponentsTeam",
                    "foreignField": "_id",
                    "as": "opponentsTeam"
                }
            },

            // Stage 3
            {
                $unwind: {
                    path: "$opponentsTeam",
                    preserveNullAndEmptyArrays: false // optional
                }
            },

            // Stage 4
            {
                $lookup: {
                    "from": "studentteams",
                    "localField": "opponentsTeam.studentTeam",
                    "foreignField": "_id",
                    "as": "opponentsTeam.studentTeam"
                }
            },

            // Stage 6
            {
                $unwind: {
                    path: "$opponentsTeam.studentTeam",

                }
            },
            // Stage 5
            {
                $match: {
                    "opponentsTeam.studentTeam.studentId": objectid(data._id)
                }
            },

            // Stage 7
            {
                $lookup: {
                    "from": "sports",
                    "localField": "sport",
                    "foreignField": "_id",
                    "as": "sport"
                }
            },

            // Stage 8
            {
                $unwind: {
                    path: "$sport",
                }
            },
            // Stage 7
            {
                $lookup: {
                    "from": "sportslists",
                    "localField": "sport.sportslist",
                    "foreignField": "_id",
                    "as": "sport.sportslist"
                }
            },

            // Stage 8
            {
                $unwind: {
                    path: "$sport.sportslist",
                }
            },
            {
                $lookup: {
                    "from": "sportslistsubcategories",
                    "localField": "sport.sportslist.sportsListSubCategory",
                    "foreignField": "_id",
                    "as": "sport.sportslist.sportsListSubCategory"
                }
            },

            // Stage 8
            {
                $unwind: {
                    path: "$sport.sportslist.sportsListSubCategory",
                }
            },
            // Stage 7
            {
                $lookup: {
                    "from": "agegroups",
                    "localField": "sport.ageGroup",
                    "foreignField": "_id",
                    "as": "sport.ageGroup"
                }
            },

            // Stage 8
            {
                $unwind: {
                    path: "$sport.ageGroup",
                }
            },

            // Stage 7
            {
                $lookup: {
                    "from": "weight",
                    "localField": "sport.weight",
                    "foreignField": "_id",
                    "as": "sport.weight"
                }
            },

            // Stage 8
            {
                $unwind: {
                    path: "$sport.weight",
                    preserveNullAndEmptyArrays: true // optional
                }
            },

        ];
        return pipeline;
    },

    getDrawFormats: function (data, callback) {
        var flag = true;
        var count;
        async.waterfall([
                function (callback) {
                    Athelete.find().lean().exec(function (err, students) {
                        if (err) {
                            callback(err, null);
                        } else if (_.isEmpty(students)) {
                            callback(null, []);
                        } else {
                            count = students;
                            console.log("count", count);
                            callback(null, count);
                        }
                    });
                },
                function (count, callback) {
                    AthleteCheck.findOne({
                        name: "check"
                    }).lean().exec(function (err, checkData) {
                        if (err) {
                            callback(err, null);
                        } else {
                            callback(null, checkData);
                        }
                    });
                },
                function (checkData, callback) {
                    if (checkData.athlete.length != count) {
                        Match.getDrawFormats1(data, function (err, excelData) {
                            callback(null, "Success");
                        });
                    } else {
                        flag = false;
                        callback();
                    }
                },
            ],
            function (err, data2) {
                if (err) {
                    callback(null, []);
                } else if (data2) {
                    if (_.isEmpty(data2)) {
                        callback(null, data2);
                    } else {
                        if (flag == true) {
                            Match.getDrawFormats(data, function (err, excelData) {
                                callback(null, "Success");
                            });
                        } else {
                            callback(null, data2);
                        }
                    }
                }
            });
    },

    getDrawFormats1: function (data, callback) {
        var data = {};
        async.waterfall([
                function (callback) {
                    AthleteCheck.findOne({
                        name: "check"
                    }).lean().exec(function (err, checkData) {
                        if (err) {
                            callback(err, null);
                        } else {
                            callback(null, checkData);
                        }
                    });
                },
                function (checkData, callback) {
                    console.log("checkData", checkData);
                    var start;
                    if (_.isEmpty(checkData.athlete)) {
                        start = 0;
                    } else {
                        start = checkData.athlete.length;
                    }
                    console.log("start", start);
                    Athelete.find({}, {
                        _id: 1,
                        firstName: 1,
                        surname: 1,
                        middleName: 1,
                        gender: 1,
                        school: 1,
                        atheleteSchoolName: 1,
                        year: 1
                    }).deepPopulate('school').skip(start).limit(1).lean().exec(function (err, students) {
                        if (err) {
                            callback(err, null);
                        } else if (_.isEmpty(students)) {
                            callback(null, []);
                        } else {
                            console.log("student", students);
                            data.studentId = students[0]._id;
                            callback(null, students);
                        }
                    });
                },
                function (students, callback) {
                    console.log("student", students);
                    async.concatSeries(students, function (single, callback) {
                        Match.getVideoExcelAthlete(single, function (err, sportData) {
                            if (err || _.isEmpty(sportData)) {
                                err = "No Data Found";
                                callback(null, {
                                    error: err,
                                    success: single
                                });
                            } else {
                                callback(null, sportData);
                            }
                        });
                    }, function (err, sport) {
                        callback(null, sport);
                    });
                },
                function (sport, callback) {
                    if (sport.err) {
                        callback(null, sport);
                    } else {
                        var check = {};
                        check.name = "check";
                        check.athlete = data.studentId;
                        AthleteCheck.updateCheck(check, function (err, checkData) {
                            if (err) {
                                err = "No Data Found";
                                callback(null, {
                                    error: err,
                                    success: athlete
                                });
                            } else {
                                console.log("check", checkData);
                                callback(null, checkData);
                            }
                        });
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

    //---------------------------Backend Players API--------------------------------------------

    getIndividualPlayers: function (data, callback) {
        async.waterfall([
                function (callback) {
                    var test = {};
                    test._id = data.sport;
                    Sport.getOne(test, function (err, found) {
                        if (err || _.isEmpty(found)) {
                            err = "Sport,Event,AgeGroup,Gender may have wrong values";
                            callback(null, {
                                error: err,
                                success: found
                            });
                        } else {
                            callback(null, found);
                        }
                    });
                },
                function (found, callback) {
                    if (found.error) {
                        callback(null, found);
                    } else if (found.sportslist.sportsListSubCategory.isTeam == true) {
                        Match.getTeam(data, function (err, found) {
                            if (err || _.isEmpty(found)) {
                                err = "No values";
                                callback(null, {
                                    error: err,
                                    success: found
                                });
                            } else {
                                callback(null, found);
                            }
                        });
                    } else {
                        Match.getindividual(data, function (err, found) {
                            if (err || _.isEmpty(found)) {
                                err = "No values";
                                callback(null, {
                                    error: err,
                                    success: found
                                });
                            } else {
                                callback(null, found);
                            }
                        });
                    }
                },
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

    getindividual: function (data, callback) {
        async.waterfall([
                function (callback) {
                    IndividualSport.find({
                        sport: data.sport
                    }, {
                        athleteId: 1
                    }).deepPopulate("athleteId.school").lean().exec(function (err, individualData) {
                        if (err || _.isEmpty(individualData)) {
                            callback(null, {
                                error: "No data teamData",
                                data: data
                            });
                        } else {
                            callback(null, individualData);
                        }
                    });
                },
                function (individualData, callback) {
                    var final = {};
                    final.match = [];
                    async.eachSeries(individualData, function (n, callback) {
                        Match.find({
                            sport: data.sport,
                            opponentsSingle: n._id
                        }).lean().exec(function (err, match) {
                            if (err) {
                                callback(null, {
                                    error: "No data teamData",
                                    data: data
                                });
                            } else if (_.isEmpty(match)) {
                                var param = {};
                                param._id = n._id;
                                param.athleteId = n.athleteId._id;
                                if (n.athleteId.middleName) {
                                    param.name = n.athleteId.firstName + " " + n.athleteId.middleName + " " + n.athleteId.surname;
                                } else {
                                    param.name = n.athleteId.firstName + " " + n.athleteId.surname;
                                }
                                param.sfaId = n.athleteId.sfaId
                                param.count = match.length;
                                final.match.push(param);
                                callback();
                            } else {
                                if (match.length == 0) {
                                    var param = {};
                                    param._id = n._id;
                                    param.athleteId = n.athleteId._id;
                                    if (n.athleteId.middleName) {
                                        param.name = n.athleteId.firstName + n.athleteId.middleName + n.athleteId.surname;
                                    } else {
                                        param.name = n.athleteId.firstName + n.athleteId.surname;
                                    }
                                    param.sfaId = n.athleteId.sfaId
                                    param.count = match.length;
                                    final.match.push(param);
                                }
                                callback();
                            }
                        });
                    }, function (err) {
                        callback(null, final);
                    });

                },
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

    getTeam: function (data, callback) {
        async.waterfall([
                function (callback) {
                    TeamSport.find({
                        sport: data.sport
                    }, {
                        name: 1,
                        schoolName: 1,
                        teamId: 1
                    }).lean().exec(function (err, studentData) {
                        if (err || _.isEmpty(studentData)) {
                            callback(null, {
                                error: "No Data Found",
                                data: data
                            });
                        } else {
                            callback(null, studentData);
                        }
                    });
                },
                function (studentData, callback) {
                    var final = {};
                    final.match = [];
                    async.eachSeries(studentData, function (n, callback) {
                        Match.find({
                            sport: data.sport,
                            $or: [{
                                excelType: {
                                    $exists: false
                                }
                            }, {
                                excelType: "Knockout"
                            }],
                            opponentsTeam: n._id
                        }).lean().exec(function (err, match) {
                            if (err) {
                                callback(null, {
                                    error: "No data teamData",
                                    data: data
                                });
                            } else if (_.isEmpty(match)) {
                                var param = {};
                                param._id = n._id;
                                param.teamName = n.name;
                                param.teamId = n.teamId;
                                param.count = match.length;
                                final.match.push(param);
                                callback();
                            } else {
                                if (match.length == 0) {
                                    var param = {};
                                    param._id = n._id;
                                    param.teamName = n.name;
                                    param.teamId = n.teamId;
                                    param.count = match.length;
                                    final.match.push(param);
                                }
                                callback();
                            }
                        });
                    }, function (err) {
                        callback(null, final);
                    });

                },
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

    addPlayerToMatch: function (data, callback) {
        async.waterfall([
                function (callback) {
                    Match.findOne({
                        matchId: data.matchId,
                        $or: [{
                            excelType: {
                                $exists: false
                            }
                        }, {
                            excelType: "Knockout"
                        }],
                        $and: [{
                            resultsCombat: {
                                $exists: false
                            },
                        }, {
                            resultBasketball: {
                                $exists: false
                            }
                        }, {
                            resultFencing: {
                                $exists: false
                            }
                        }, {
                            resultFootball: {
                                $exists: false
                            }
                        }, {
                            resultHandball: {
                                $exists: false
                            }
                        }, {
                            resultHockey: {
                                $exists: false
                            }
                        }, {
                            resultKabaddi: {
                                $exists: false
                            }
                        }, {
                            resultsRacquet: {
                                $exists: false
                            }
                        }]
                    }).deepPopulate("sport.sportslist.sportsListSubCategory").lean().exec(function (err, matchData) {
                        if (err || _.isEmpty(matchData)) {
                            callback(null, {
                                error: "No Data Found",
                                data: data
                            });
                        } else {
                            callback(null, matchData);
                        }
                    });
                },
                function (matchData, callback) {
                    if (matchData.error) {
                        callback(null, matchData);
                    } else {
                        Match.findOne({
                            prevMatch: matchData._id,
                            $and: [{
                                resultsCombat: {
                                    $exists: false
                                },
                            }, {
                                resultBasketball: {
                                    $exists: false
                                }
                            }, {
                                resultFencing: {
                                    $exists: false
                                }
                            }, {
                                resultFootball: {
                                    $exists: false
                                }
                            }, {
                                resultHandball: {
                                    $exists: false
                                }
                            }, {
                                resultHockey: {
                                    $exists: false
                                }
                            }, {
                                resultKabaddi: {
                                    $exists: false
                                }
                            }, {
                                resultsRacquet: {
                                    $exists: false
                                }
                            }]
                        }).lean().exec(function (err, nextMatchData) {
                            if (err || _.isEmpty(nextMatchData)) {
                                callback(null, {
                                    error: "Next Match Scored",
                                    data: data
                                });
                            } else {
                                callback(null, matchData);
                            }
                        });
                    }
                },
                function (matchData, callback) {
                    if (matchData.error) {
                        callback(null, matchData);
                    } else {
                        if (matchData.sport.sportslist.sportsListSubCategory.isTeam == false) {
                            var final = [];
                            if (matchData.opponentsSingle.length == 1 || matchData.opponentsSingle.length == 0) {
                                final = data.opponentsSingle;
                                var matchObj = {
                                    $set: {
                                        opponentsSingle: final
                                    }
                                };
                                Match.update({
                                    matchId: data.matchId
                                }, matchObj).exec(
                                    function (err, match) {
                                        callback(null, match);
                                    });
                            } else {
                                callback(null, {
                                    error: "opponentsSingle have enough players",
                                    data: matchData.opponentsSingle
                                });
                            }
                        } else {
                            var final = [];
                            if (matchData.opponentsTeam.length == 1 || matchData.opponentsTeam.length == 0) {
                                final = data.opponentsTeam;
                                var matchObj = {
                                    $set: {
                                        opponentsTeam: final
                                    }
                                };
                                Match.update({
                                    matchId: data.matchId
                                }, matchObj).exec(
                                    function (err, match) {
                                        callback(null, match);
                                    });
                            } else {
                                callback(null, {
                                    error: "opponentsTeam have enough players",
                                    data: matchData.opponentsTeam
                                });
                            }
                        }
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

    deletePlayerFromMatch: function (data, callback) {
        async.waterfall([
                function (callback) {
                    Match.findOne({
                        matchId: data.matchId,
                        $and: [{
                            resultsCombat: {
                                $exists: false
                            },
                        }, {
                            resultBasketball: {
                                $exists: false
                            }
                        }, {
                            resultFencing: {
                                $exists: false
                            }
                        }, {
                            resultFootball: {
                                $exists: false
                            }
                        }, {
                            resultHandball: {
                                $exists: false
                            }
                        }, {
                            resultHockey: {
                                $exists: false
                            }
                        }, {
                            resultKabaddi: {
                                $exists: false
                            }
                        }, {
                            resultsRacquet: {
                                $exists: false
                            }
                        }]
                    }).deepPopulate("sport.sportslist.sportsListSubCategory").lean().exec(function (err, matchData) {
                        if (err || _.isEmpty(matchData)) {
                            callback(null, {
                                error: "No Data Found",
                                data: data
                            });
                        } else {
                            callback(null, matchData);
                        }
                    });
                },
                function (matchData, callback) {
                    if (matchData.error) {
                        callback(null, matchData);
                    } else {
                        if (matchData.sport.sportslist.sportsListSubCategory.isTeam == false) {
                            var final = [];
                            if (matchData.opponentsSingle.length == 1) {
                                final = [];
                                var matchObj = {
                                    $set: {
                                        opponentsSingle: final
                                    }
                                };
                                Match.update({
                                    matchId: data.matchId
                                }, matchObj).exec(
                                    function (err, match) {
                                        callback(null, match);
                                    });
                            } else if (matchData.opponentsSingle.length == 2) {
                                if (matchData.opponentsSingle[0].equals(data.opponentsSingle)) {
                                    final.push(matchData.opponentsSingle[1]);
                                } else {
                                    final.push(matchData.opponentsSingle[0]);
                                }
                                var matchObj = {
                                    $set: {
                                        opponentsSingle: final
                                    }
                                };
                                Match.update({
                                    matchId: data.matchId
                                }, matchObj).exec(
                                    function (err, match) {
                                        callback(null, match);
                                    });
                            } else {
                                callback(null, {
                                    error: "opponentsSingle have no players to delete",
                                    data: matchData.opponentsSingle
                                });
                            }
                        } else {
                            var final = [];
                            if (matchData.opponentsTeam.length == 1) {
                                final = [];
                                var matchObj = {
                                    $set: {
                                        opponentsTeam: final
                                    }
                                };
                                Match.update({
                                    matchId: data.matchId
                                }, matchObj).exec(
                                    function (err, match) {
                                        callback(null, match);
                                    });
                            } else if (matchData.opponentsTeam.length == 2) {
                                if (matchData.opponentsTeam[0].equals(data.opponentsTeam)) {
                                    final.push(matchData.opponentsTeam[1]);
                                } else {
                                    final.push(matchData.opponentsTeam[0]);
                                }
                                var matchObj = {
                                    $set: {
                                        opponentsTeam: final
                                    }
                                };
                                Match.update({
                                    matchId: data.matchId
                                }, matchObj).exec(
                                    function (err, match) {
                                        callback(null, match);
                                    });
                            } else {
                                callback(null, {
                                    error: "opponentsTeam have no players to delete",
                                    data: matchData.opponentsTeam
                                });
                            }
                        }
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

    deleteResult: function (data, callback) {
        async.waterfall([
                function (callback) {
                    Match.findOne({
                        matchId: data.matchId
                    }).deepPopulate("sport.sportslist.sportsListSubCategory").lean().exec(function (err, matchData) {
                        if (err || _.isEmpty(matchData)) {
                            callback(null, {
                                error: "No Data Found",
                                data: data
                            });
                        } else {
                            callback(null, matchData);
                        }
                    });
                },
                function (matchData, callback) {
                    if (matchData.error) {
                        callback(null, matchData);
                    } else {
                        if (matchData.sport.sportslist.sportsListSubCategory.isTeam == false) {
                            if (matchData.resultsCombat) {
                                var matchObj = {
                                    $unset: {
                                        resultsCombat: undefined
                                    }
                                };
                                Match.update({
                                    matchId: data.matchId
                                }, matchObj).exec(
                                    function (err, match) {
                                        callback(null, match);
                                    });
                            } else if (matchData.resultsRacquet) {
                                var matchObj = {
                                    $unset: {
                                        resultsRacquet: undefined
                                    }
                                };
                                Match.update({
                                    matchId: data.matchId
                                }, matchObj).exec(
                                    function (err, match) {
                                        callback(null, match);
                                    });
                            } else if (matchData.resultFencing) {
                                var matchObj = {
                                    $unset: {
                                        resultFencing: undefined
                                    }
                                };
                                Match.update({
                                    matchId: data.matchId
                                }, matchObj).exec(
                                    function (err, match) {
                                        callback(null, match);
                                    });
                            } else if (matchData.resultSwiss) {
                                var matchObj = {
                                    $unset: {
                                        resultSwiss: undefined
                                    }
                                };
                                Match.update({
                                    matchId: data.matchId
                                }, matchObj).exec(
                                    function (err, match) {
                                        callback(null, match);
                                    });
                            }
                        } else {
                            if (matchData.resultsCombat) {
                                var matchObj = {
                                    $unset: {
                                        resultsCombat: undefined
                                    }
                                };
                                Match.update({
                                    matchId: data.matchId
                                }, matchObj).exec(
                                    function (err, match) {
                                        callback(null, match);
                                    });
                            } else if (matchData.resultsRacquet) {
                                var matchObj = {
                                    $unset: {
                                        resultsRacquet: undefined
                                    }
                                };
                                Match.update({
                                    matchId: data.matchId
                                }, matchObj).exec(
                                    function (err, match) {
                                        callback(null, match);
                                    });
                            } else if (matchData.resultBasketball) {
                                var matchObj = {
                                    $unset: {
                                        resultBasketball: undefined
                                    }
                                };
                                Match.update({
                                    matchId: data.matchId
                                }, matchObj).exec(
                                    function (err, match) {
                                        callback(null, match);
                                    });
                            } else if (matchData.resultThrowball) {
                                var matchObj = {
                                    $unset: {
                                        resultThrowball: undefined
                                    }
                                };
                                Match.update({
                                    matchId: data.matchId
                                }, matchObj).exec(
                                    function (err, match) {
                                        callback(null, match);
                                    });
                            } else if (matchData.resultFootball) {
                                var matchObj = {
                                    $unset: {
                                        resultFootball: undefined
                                    }
                                };
                                Match.update({
                                    matchId: data.matchId
                                }, matchObj).exec(
                                    function (err, match) {
                                        callback(null, match);
                                    });
                            } else if (matchData.resultHandball) {
                                var matchObj = {
                                    $unset: {
                                        resultHandball: undefined
                                    }
                                };
                                Match.update({
                                    matchId: data.matchId
                                }, matchObj).exec(
                                    function (err, match) {
                                        callback(null, match);
                                    });
                            } else if (matchData.resultHockey) {
                                var matchObj = {
                                    $unset: {
                                        resultHockey: undefined
                                    }
                                };
                                Match.update({
                                    matchId: data.matchId
                                }, matchObj).exec(
                                    function (err, match) {
                                        callback(null, match);
                                    });
                            } else if (matchData.resultKabaddi) {
                                var matchObj = {
                                    $unset: {
                                        resultKabaddi: undefined
                                    }
                                };
                                Match.update({
                                    matchId: data.matchId
                                }, matchObj).exec(
                                    function (err, match) {
                                        callback(null, match);
                                    });
                            } else if (matchData.resultVolleyball) {
                                var matchObj = {
                                    $unset: {
                                        resultVolleyball: undefined
                                    }
                                };
                                Match.update({
                                    matchId: data.matchId
                                }, matchObj).exec(
                                    function (err, match) {
                                        callback(null, match);
                                    });
                            } else if (matchData.resultWaterPolo) {
                                var matchObj = {
                                    $unset: {
                                        resultWaterPolo: undefined
                                    }
                                };
                                Match.update({
                                    matchId: data.matchId
                                }, matchObj).exec(
                                    function (err, match) {
                                        callback(null, match);
                                    });
                            } else {
                                callback(null, {
                                    error: "no result to delete",
                                    data: matchData
                                });
                            }
                        }
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
};
module.exports = _.assign(module.exports, exports, model);