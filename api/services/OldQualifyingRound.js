var schema = new Schema({
    year: String,
    matchid: Number,
    sport: {
        type: Schema.Types.ObjectId,
        ref: "Sport",
        index: true
    },
    event: {
        type: String,
        default: "Qualifying Round"
    },
    order: Number,
    participantType: {
        type: String,
        default: "player"
    },
    player: {
        type: Schema.Types.ObjectId,
        ref: 'Student'
    },
    score: {
        type: String
    },
    result: {
        type: String
    },
    video: {
        type: String,
        default: ""
    },
    position: {
        type: Number,
        default: 0
    },
    date: {
        type: Date
    },
    round: {
        type: String
    }
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('OldQualifyingRound', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {

    getAggregatePipeLine: function (data) {
        var pipeline = [{
                $match: {
                    "participantType": "player",
                    "year": data.year
                }
            },
            // Stage 2
            {
                $group: {
                    _id: "$player",
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
                var pipeLine = OldQualifyingRound.getAggregatePipeLine(data);
                OldQualifyingRound.aggregate(pipeLine, function (err, complete) {
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
                OldKnockout.saveIn(complete, individualSport, function (err, saveData) {
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

    //---------------------------------Match Creation--------------------------------

    saveMatchIndividual: function (data, callback) {
        async.waterfall([
            function (callback) {
                OldQualifyingRound.find({
                    participantType: "player",
                    year: data.year,
                    player: {
                        $ne: ObjectId("57eb7a3f418a945c43a7bc77")
                    }
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
                        OldQualifyingRound.getMatchDetails(singleData, function (err, matchData) {
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
                    }, function (err, finalData) {
                        if (err) {
                            callback(err, null);
                        } else {
                            callback(null, finalData);
                        }
                    });
                }, function (err, finalData) {
                    if (err) {
                        callback(err, null);
                    } else {
                        callback(null, finalData);
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
                            match.matchId = "Qualifying";
                            callback(null, found);
                        }
                    });
                },
                function (found, callback) {
                    IndividualSport.findOne({
                        oldId: data.player,
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