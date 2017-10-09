var schema = new Schema({
    year: String,
    matchid: Number,
    roundno: Number,
    qualifyingknockout: {
        type: String
    },
    round: {
        type: String,
        default: "Round"
    },
    order: Number,
    qualifyingorder: Number,
    sport: {
        type: Schema.Types.ObjectId,
        ref: "Sport",
        index: true
    },
    event: {
        type: String,
        default: "Qualifying Knockout"
    },
    participantType: {
        type: String
    },
    player1: {
        type: Schema.Types.ObjectId,
        ref: 'Student'
    },
    player2: {
        type: Schema.Types.ObjectId,
        ref: 'Student'
    },
    team1: {
        type: Schema.Types.ObjectId,
        ref: 'Team'
    },
    team2: {
        type: Schema.Types.ObjectId,
        ref: 'Team'
    },
    result1: {
        type: String
    },
    result2: {
        type: String
    },
    name: {
        type: String,
        default: "Heat 1"
    },
    video: {
        type: String
    },
    date: {
        type: Date
    },
    startTime: {
        type: Date
    },
    totalTime: {
        type: String,
        default: ""
    },
    endTime: {
        type: Date
    },
    score: {
        type: String,
        default: ""
    },
    heats: [{
        player: {
            type: Schema.Types.ObjectId,
            ref: 'Student'
        },
        team: {
            type: Schema.Types.ObjectId,
            ref: 'Team'
        },
        score: {
            type: Number
        },
        result: {
            type: String
        },
        position: {
            type: String
        }
    }]
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('OldQualifyingKnockout', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {

    getknockoutPlayer1AggregatePipeLine: function (data) {

        var pipeline = [{
                $match: {
                    "participantType": "player",
                    "year": data.year,
                    round: "Qualifying Round"
                }
            },
            // Stage 2
            {
                $group: {
                    _id: "$heats.player",
                    sport: {
                        $addToSet: "$sport"
                    }
                }
            },


        ];
        return pipeline;
    },

    getAllPlayer: function (data, callback) {
        var individualSport = {};
        async.waterfall([
            function (callback) {
                var pipeLine = OldQualifyingKnockout.getknockoutPlayer1AggregatePipeLine(data);
                OldQualifyingKnockout.aggregate(pipeLine, function (err, complete) {
                    if (err) {
                        callback(err, "error in mongoose");
                    } else {
                        if (_.isEmpty(complete)) {
                            callback(null, complete);
                        } else {
                            callback(null, complete);
                        }
                    }
                });
            },
            function (complete, callback) {
                OldHeat.saveIn(complete, individualSport, function (err, saveData) {
                    if (err) {
                        callback(err, null);
                    } else {
                        if (_.isEmpty(saveData)) {
                            var err = {
                                error: "no saveData",
                                data: saveData
                            }
                            callback(null, err);
                        } else {
                            callback(null, saveData);
                        }
                    }
                });
                // callback(null, complete);
            },
        ], function (err, data3) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, data3);
            }
        });
    },

    //---------------------------------Match Creation--------------------------------

    saveQualifyingMatchIndividual: function (data, callback) {
        var thirdPlace = {};
        async.waterfall([
                function (callback) {
                    OldQualifyingKnockout.find({
                        participantType: "player",
                        year: data.year,
                        round: "Qualifying Round"
                    }).lean().exec(function (err, found) {
                        if (err) {
                            callback(err, null);
                        } else if (_.isEmpty(found)) {
                            callback(null, []);
                        } else {
                            callback(null, found);
                        }
                    });
                },
                function (found, callback) {
                    var complete = _.groupBy(found, "sport");
                    async.concatSeries(complete, function (mainData, callback) {
                            async.concatSeries(mainData, function (singleData, callback) {
                                    singleData.excelType = "qualifying";
                                    singleData.roundName = singleData.name;
                                    OldQualifyingKnockout.getMatchDetails(singleData, function (err, matchData) {
                                        if (err) {
                                            callback(err, null);
                                        } else {
                                            if (_.isEmpty(matchData)) {
                                                var err = {
                                                    error: "no matchData",
                                                    data: matchData
                                                }
                                                callback(null, err);
                                            } else {
                                                callback(null, matchData);
                                            }
                                        }
                                    });
                                },
                                function (err, finalData) {
                                    if (err) {
                                        callback(err, null);
                                    } else {
                                        callback(null, finalData);
                                    }
                                });
                        },
                        function (err, finalData) {
                            if (err) {
                                callback(err, null);
                            } else {
                                callback(null, finalData);
                            }
                        });

                    // callback(null, complete);
                },
            ],
            function (err, data3) {
                if (err) {
                    callback(err, null);
                } else {
                    callback(null, data3);
                }
            });
    },

    saveknockoutMatchIndividual: function (data, callback) {
        var thirdPlace = {};
        async.waterfall([
                function (callback) {
                    OldQualifyingKnockout.find({
                        participantType: "player",
                        year: data.year,
                        round: "Final"
                    }).lean().exec(function (err, found) {
                        if (err) {
                            callback(err, null);
                        } else if (_.isEmpty(found)) {
                            callback(null, []);
                        } else {
                            callback(null, found);
                        }
                    });
                },
                function (found, callback) {
                    var complete = _.groupBy(found, "sport");
                    async.concatSeries(complete, function (mainData, callback) {
                            async.concatSeries(mainData, function (singleData, callback) {
                                    singleData.excelType = "knockout";
                                    singleData.roundName = singleData.name;
                                    OldLeagueKnockout.getMatchDetails(singleData, function (err, matchData) {
                                        if (err) {
                                            callback(err, null);
                                        } else {
                                            if (_.isEmpty(matchData)) {
                                                var err = {
                                                    error: "no matchData",
                                                    data: matchData
                                                }
                                                callback(null, err);
                                            } else {
                                                callback(null, matchData);
                                            }
                                        }
                                    });
                                },
                                function (err, finalData) {
                                    if (err) {
                                        callback(err, null);
                                    } else {
                                        callback(null, finalData);
                                    }
                                });
                        },
                        function (err, finalData) {
                            if (err) {
                                callback(err, null);
                            } else {
                                callback(null, finalData);
                            }
                        });
                },
            ],
            function (err, data3) {
                if (err) {
                    callback(err, null);
                } else {
                    callback(null, data3);
                }
            });
    },

    getMatchDetails: function (data, callback) {
        console.log("data", data);
        // var match = {};
        async.concatSeries(data.heats, function (n, callback) {
            var match = {};
            match.opponentsSingle = [];
            match.opponentsTeam = [];
            async.waterfall([
                    function (callback) {
                        Sport.findOne({
                            oldId: data.sport
                        }).lean().exec(function (err, found) {
                            if (err) {
                                callback(err, null);
                            } else if (_.isEmpty(found)) {
                                callback(null, []);
                            } else {
                                console.log("sport", found);
                                match.sport = found._id;
                                match.scheduleDate = data.date;
                                match.round = data.roundName;
                                match.incrementalId = data.matchid;
                                match.excelType = data.excelType;
                                match.matchId = "Q.k.";
                                callback(null, found);
                            }
                        });
                    },
                    function (found, callback) {
                        IndividualSport.findOne({
                            oldId: n.player,
                            // sport: found._id
                        }).lean().exec(function (err, individualData) {
                            if (err) {
                                callback(err, null);
                            } else if (_.isEmpty(individualData)) {
                                console.log("empty");
                                callback(null, []);
                            } else {
                                match.opponentsSingle.push(individualData._id);
                                callback(null, found);
                            }
                        });
                    },
                    function (found, callback) {
                        OldHeat.saveMatch(match, function (err, matchData) {
                            if (err) {
                                callback(err, null);
                            } else {
                                if (_.isEmpty(matchData)) {
                                    var err = {
                                        error: "no matchData",
                                        data: matchData
                                    }
                                    callback(null, err);
                                } else {
                                    callback(null, matchData);
                                }
                            }
                        });
                    },
                ],
                function (err, data3) {
                    if (err) {
                        callback(err, null);
                    } else {
                        callback(null, data3);
                    }
                });
        }, function (err, found) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, found);
            }
        });
    },
};
module.exports = _.assign(module.exports, exports, model);