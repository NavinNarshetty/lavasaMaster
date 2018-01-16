var schema = new Schema({
    year: String,
    matchid: Number,
    roundno: Number,
    leagueknockoutround: {
        type: String
    },
    round: {
        type: String
    },
    order: Number,
    leagueknockoutorder: Number,
    sport: {
        type: Schema.Types.ObjectId,
        ref: "Sport",
        index: true
    },
    event: {
        type: String,
        default: "League cum Knockout"
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
    point1: {
        type: Number,
        default: 0.0
    },
    point2: {
        type: Number,
        default: 0.0
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
    video: {
        type: String
    }
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('OldLeagueKnockout', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {

    getAllPlayer1: function (data, callback) {
        var individualSport = {};
        async.waterfall([
            function (callback) {
                var pipeLine = OldKnockout.getknockoutPlayer1AggregatePipeLine(data);
                OldLeagueKnockout.aggregate(pipeLine, function (err, complete) {
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

    getAllPlayer2: function (data, callback) {
        var individualSport = {};
        async.waterfall([
            function (callback) {
                var pipeLine = OldKnockout.getknockoutPlayer2AggregatePipeLine(data);
                OldLeagueKnockout.aggregate(pipeLine, function (err, complete) {
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


    getAllTeam1: function (data, callback) {
        var individualSport = {};
        async.waterfall([
            function (callback) {
                var pipeLine = OldKnockout.getKnockoutTeam1AggregatePipeLine(data);
                OldLeagueKnockout.aggregate(pipeLine, function (err, complete) {
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
                console.log("complete 1", complete);
                OldKnockout.saveInTeam(complete, function (err, saveData) {
                    if (err) {
                        callback(err, null);
                    } else {
                        if (_.isEmpty(saveData)) {
                            callback(null, []);
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

    getAllTeam2: function (data, callback) {
        var individualSport = {};
        async.waterfall([
            function (callback) {
                var pipeLine = OldKnockout.getKnockoutTeam2AggregatePipeLine(data);
                OldLeagueKnockout.aggregate(pipeLine, function (err, complete) {
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
                OldKnockout.saveInTeam(complete, function (err, saveData) {
                    if (err) {
                        callback(err, null);
                    } else {
                        if (_.isEmpty(saveData)) {
                            callback(null, []);
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

    //--------------------------------Match Created----------------------------------------

    saveLeagueMatchIndividual: function (data, callback) {
        var thirdPlace = {};
        async.waterfall([
                function (callback) {
                    OldLeagueKnockout.find({
                        participantType: "player",
                        year: data.year,
                        player1: {
                            $ne: ObjectId("57eb7a3f418a945c43a7bc77")
                        },
                        player2: {
                            $ne: ObjectId("57eb7a3f418a945c43a7bc77")
                        },
                        $and: [{
                            leagueknockoutround: {
                                $exists: true
                            }
                        }, {
                            round: {
                                $exists: false
                            }
                        }]
                    }).sort({
                        leagueknockoutround: 1
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
                                    singleData.excelType = "league";
                                    singleData.roundName = singleData.leagueknockoutround;
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
                    OldLeagueKnockout.find({
                        participantType: "player",
                        year: data.year,
                        player1: {
                            $ne: ObjectId("57eb7a3f418a945c43a7bc77")
                        },
                        player2: {
                            $ne: ObjectId("57eb7a3f418a945c43a7bc77")
                        },
                        $and: [{
                            leagueknockoutround: {
                                $exists: true
                            }
                        }, {
                            round: {
                                $exists: true
                            }
                        }]
                    }).sort({
                        leagueknockoutround: 1
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
                                    singleData.roundName = singleData.round;
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
                            match.oldId = data._id;
                            match.matchId = "League";
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

    saveLeagueMatchTeam: function (data, callback) {
        var thirdPlace = {};
        async.waterfall([
                function (callback) {
                    OldLeagueKnockout.find({
                        participantType: "team",
                        year: data.year,
                        $and: [{
                            leagueknockoutround: {
                                $exists: true
                            }
                        }, {
                            round: {
                                $exists: false
                            }
                        }]
                    }).sort({
                        leagueknockoutround: 1
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
                                    singleData.excelType = "league";
                                    singleData.roundName = singleData.leagueknockoutround;
                                    OldLeagueKnockout.getMatchDetailsTeam(singleData, function (err, matchData) {
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

    saveknockoutMatchTeam: function (data, callback) {
        var thirdPlace = {};
        async.waterfall([
                function (callback) {
                    OldLeagueKnockout.find({
                        participantType: "team",
                        year: data.year,
                        $and: [{
                            leagueknockoutround: {
                                $exists: true
                            }
                        }, {
                            round: {
                                $exists: true
                            }
                        }]
                    }).sort({
                        leagueknockoutround: 1
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
                                    singleData.roundName = singleData.round;
                                    OldLeagueKnockout.getMatchDetailsTeam(singleData, function (err, matchData) {
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

    getMatchDetailsTeam: function (data, callback) {
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
                        // var round = data.round.toLowerCase();
                        match.round = data.roundName;
                        match.incrementalId = data.matchid;
                        match.excelType = data.excelType;
                        match.matchId = "League";
                        callback(null, found);
                    }
                });
            },
            function (found, callback) {
                TeamSport.find({
                    oldId: data.team1
                }).lean().exec(function (err, individualData) {
                    if (err) {
                        callback(err, null);
                    } else if (_.isEmpty(individualData)) {
                        console.log("empty");
                        callback(null, []);
                    } else {
                        console.log("inside push", individualData);
                        match.opponentsTeam.push(individualData[0]._id);
                        callback(null, found);
                    }
                });
            },
            function (found, callback) {
                TeamSport.find({
                    oldId: data.team2
                }).lean().exec(function (err, individualData) {
                    if (err) {
                        callback(err, null);
                    } else if (_.isEmpty(individualData)) {
                        console.log("empty");
                        callback(null, []);
                    } else {
                        console.log("inside push", individualData);
                        match.opponentsTeam.push(individualData[0]._id);
                        callback(null, individualData);
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

};
module.exports = _.assign(module.exports, exports, model);