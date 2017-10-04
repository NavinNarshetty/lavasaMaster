var schema = new Schema({
    year: String,
    matchid: Number,
    order: Number,
    sport: {
        type: Schema.Types.ObjectId,
        ref: "Sport",
        index: true
    },
    event: {
        type: String,
        default: "Heats"
    },
    participantType: {
        type: String
    },
    round: {
        type: String,
        default: "Round"
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
    heats: [{
        player: {
            type: Schema.Types.ObjectId,
            ref: 'Student'
        },
        team: {
            type: Schema.Types.ObjectId,
            ref: 'Team'
        },
        laneno: {
            type: Number
        },
        result: {
            type: String
        },
        timing: {
            type: String
        },
        standing: {
            type: Number
        },
        video: {
            type: String
        }
    }]
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('OldHeat', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {

    getknockoutPlayer1AggregatePipeLine: function (data) {

        var pipeline = [{
                $match: {
                    "participantType": "player",
                    "year": data.year
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
                var pipeLine = OldHeat.getknockoutPlayer1AggregatePipeLine(data);
                OldHeat.aggregate(pipeLine, function (err, complete) {
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
            },
        ], function (err, data3) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, data3);
            }
        });
    },

    saveIn: function (complete, individualSport, callback) {
        async.concatSeries(complete, function (mainData, callback) {
            var i = 0;
            async.eachSeries(mainData._id, function (singleData, callback) {
                if (i == mainData.sport.length) {
                    i = 0;
                }
                // console.log("singleData", singleData, "mainData", mainData.sport);
                individualSport.sport = [];
                async.waterfall([
                    function (callback) {
                        var athelete = {};
                        athelete._id = singleData;
                        // individualSport.oldId = singleData;
                        OldKnockout.getAthleteId(athelete, function (err, athelete) {
                            if (err) {
                                callback(err, null);
                            } else {
                                if (_.isEmpty(athelete)) {
                                    var err = {
                                        error: "no athelete",
                                        data: athelete
                                    }
                                    callback(null, err);
                                } else {
                                    console.log("singleData", athelete._id);
                                    callback(null, athelete);
                                }
                            }
                        });
                    },
                    function (athelete, callback) {
                        if (athelete.error) {
                            callback(null, athelete);
                        } else {
                            var param = {};
                            console.log("size", mainData.sport.length);
                            console.log("i", i);
                            param.sport = mainData.sport[i];
                            console.log("param", param);
                            OldKnockout.getSportId(param, function (err, sport) {
                                if (sport.error) {
                                    if (i < mainData.sport.length) {
                                        i++;
                                    }
                                    callback(null, sport);
                                } else {
                                    if (i < mainData.sport.length) {
                                        i++;
                                    }
                                    console.log("mainData", sport._id);
                                    individualSport.sport.push(sport._id);

                                    individualSport.sportsListSubCategory = sport.sportslist.sportsListSubCategory._id;
                                    callback(null, athelete);
                                }
                            });

                        }
                    },
                    function (athelete, callback) {
                        if (athelete.error) {
                            callback(null, athelete);
                        } else {
                            individualSport.athleteId = athelete._id;
                            individualSport.createdBy = "School";
                            individualSport.oldId = singleData;
                            IndividualSport.saveData(individualSport, function (err, saveData) {
                                if (err) {
                                    callback(err, null);
                                } else {
                                    if (_.isEmpty(saveData)) {
                                        callback(null, []);
                                    } else {
                                        individualSport.sport = [];
                                        callback(null, saveData);
                                    }
                                }
                            });
                        }
                    }
                ], function (err, data3) {
                    if (err) {
                        callback(err, null);
                    } else {
                        if (_.isEmpty(data3)) {
                            callback(null, data3);
                        } else {
                            callback(null, data3);
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

    //---------------------------------Match--------------------------------

    saveHeatMatch: function (data, callback) {
        async.waterfall([
            function (callback) {
                OldHeat.find({
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
                        OldHeat.getMatchDetails(singleData, function (err, matchData) {
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
                Sport.find({
                    oldId: data.sport
                }).lean().exec(function (err, found) {
                    if (err) {
                        callback(err, null);
                    } else if (_.isEmpty(found)) {
                        callback(null, []);
                    } else {
                        console.log("sport", found);
                        match.sport = found[0]._id;
                        match.scheduleDate = data.date;
                        var round = data.round.toLowerCase();
                        match.round = data.name;
                        match.heatNo = data.name.lastIndexOf(" " + 1);
                        match.incrementalId = data.matchid;
                        match.matchId = "heat";
                        callback(null, found);
                    }
                });
            },
            function (found, callback) {
                async.eachSeries(data.heats, function (n, callback) {
                    if (found[0]) {
                        IndividualSport.find({
                            oldId: n.player,
                            sport: found[0]._id
                        }).lean().exec(function (err, individualData) {
                            if (err) {
                                callback(err, null);
                            } else if (_.isEmpty(individualData)) {
                                callback(null, []);
                            } else {
                                console.log("inside push", individualData);
                                match.opponentsSingle.push(individualData[0]._id);
                                callback(null, individualData);
                            }
                        });
                    } else {
                        callback(null, found);
                    }
                }, function (err) {
                    if (err) {
                        callback(err, null);
                    } else {
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
        ], function (err, data3) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, data3);
            }
        });
    },

    saveMatch: function (data, callback) {
        async.waterfall([
                function (callback) {
                    Match.findOne().sort({
                        createdAt: -1
                    }).lean().exec(function (err, match) {
                        if (err) {
                            callback(err, null);
                        } else if (_.isEmpty(match)) {
                            data.matchId = data.matchId + data.incrementalId;
                            callback(null, data);
                        } else {
                            data.matchId = data.matchId + data.incrementalId;
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
};
module.exports = _.assign(module.exports, exports, model);