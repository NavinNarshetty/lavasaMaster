var schema = new Schema({
    year: String,
    matchid: Number,
    order: {
        type: Number,
        default: 0
    },
    sport: {
        type: Schema.Types.ObjectId,
        ref: "Sport",
        index: true
    },
    event: {
        type: String,
        default: "Swiss League"
    },
    participantType: {
        type: String,
        default: "player"
    },
    roundno: {
        type: Number,
        default: 0
    },
    round: {
        type: String
    },
    order: {
        type: Number,
        default: 0
    },
    date: {
        type: Date,
        default: Date.now
    },
    player1: {
        type: Schema.Types.ObjectId,
        ref: 'Student'
    },
    player2: {
        type: Schema.Types.ObjectId,
        ref: 'Student'
    },
    result1: {
        type: String,
    },
    result2: {
        type: String,
    },
    startTime: {
        type: Date
    },
    endTime: {
        type: Date
    },
    totalTime: {
        type: String,
        default: ""
    }
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('OldSwissLeague', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {

    getknockoutPlayer1AggregatePipeLine: function (data) {

        var pipeline = [{
                $match: {
                    "participantType": "player",
                    "round": "Round 1",
                    "year": data.year
                }
            },
            // Stage 2
            {
                $group: {
                    _id: "$player1",
                    sport: {
                        $addToSet: "$sport"
                    }
                }
            },


        ];
        return pipeline;
    },

    getknockoutPlayer2AggregatePipeLine: function (data) {

        var pipeline = [{
                $match: {
                    "participantType": "player",
                    "round": "Round 1",
                    "year": data.year
                }
            },
            // Stage 2
            {
                $group: {
                    _id: "$player2",
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
                var pipeLine = OldSwissLeague.getknockoutPlayer1AggregatePipeLine(data);
                OldSwissLeague.aggregate(pipeLine, function (err, complete) {
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
                var pipeLine = OldSwissLeague.getknockoutPlayer2AggregatePipeLine(data);
                OldSwissLeague.aggregate(pipeLine, function (err, complete1) {
                    if (err) {
                        callback(err, "error in mongoose");
                    } else {
                        if (_.isEmpty(complete1)) {
                            callback(null, complete1);
                        } else {
                            var final = _.concat(complete, complete1);
                            console.log("final", final);
                            final = _.uniqBy(final, '_id');
                            callback(null, final);
                        }
                    }
                });
            },
            function (final, callback) {
                OldKnockout.saveIn(final, individualSport, function (err, saveData) {
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
            },
        ], function (err, data3) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, data3);
            }
        });
    },

    //--------------------------Match Creation--------------------------------

    saveMatchIndividual: function (data, callback) {
        async.waterfall([
                function (callback) {
                    OldSwissLeague.find({
                        participantType: "player",
                        year: data.year
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
                                    OldSwissLeague.getMatchDetails(singleData, function (err, matchData) {
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
                            match.round = data.round;
                            match.incrementalId = data.matchid;
                            match.matchId = "swiss";
                            callback(null, found);
                        }
                    });
                },
                function (found, callback) {
                    if (data.player1) {
                        IndividualSport.findOne({
                            oldId: data.player1,
                            sport: found._id
                        }).lean().exec(function (err, individualData) {
                            if (err) {
                                callback(err, null);
                            } else if (_.isEmpty(individualData)) {
                                callback(null, []);
                            } else {
                                console.log("inside push", individualData);
                                match.opponentsSingle.push(individualData._id);
                                callback(null, found);
                            }
                        });
                    } else {
                        callback(null, {
                            error: "no player",
                            data: data
                        });
                    }
                },
                function (found, callback) {
                    if (data.player2) {
                        IndividualSport.findOne({
                            oldId: data.player2,
                            sport: found._id
                        }).lean().exec(function (err, individualData) {
                            if (err) {
                                callback(err, null);
                            } else if (_.isEmpty(individualData)) {
                                callback(null, []);
                            } else {
                                console.log("inside push1", individualData);
                                match.opponentsSingle.push(individualData._id);
                                callback(null, individualData);
                            }
                        });
                    } else {
                        callback(null, {
                            error: "no player",
                            data: data
                        });
                    }
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
    },


};
module.exports = _.assign(module.exports, exports, model);