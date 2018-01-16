var schema = new Schema({
    year: String,
    matchid: Number,
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
    sport: {
        type: Schema.Types.ObjectId,
        ref: "Sport",
        index: true
    },
    event: {
        type: String,
        default: "Knockout"
    },
    participantType: {
        type: String,
        default: "player"
    },
    date: {
        type: Date,
        default: Date.now
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
    },
    player1: {
        type: Schema.Types.ObjectId,
        ref: 'Student'
    },
    player2: {
        type: Schema.Types.ObjectId,
        ref: 'Student'
    },
    resultplayer1: {
        type: String,
    },
    resultteam1: {
        type: String,
    },
    resultplayer2: {
        type: String,
    },
    resultteam2: {
        type: String,
    },
    team1: {
        type: Schema.Types.ObjectId,
        ref: 'Team'
    },
    team2: {
        type: Schema.Types.ObjectId,
        ref: 'Team'
    },
    score: {
        type: String,
        default: ""
    },
    video: {
        type: String
    },
    parent1: {
        type: Schema.Types.ObjectId,
        ref: 'Knockout'
    },
    parent2: {
        type: Schema.Types.ObjectId,
        ref: 'Knockout'
    }
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('OldKnockout', schema);

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

    getAllPlayer1: function (data, callback) {
        var individualSport = {};
        async.waterfall([
            function (callback) {
                var pipeLine = OldKnockout.getknockoutPlayer1AggregatePipeLine(data);
                OldKnockout.aggregate(pipeLine, function (err, complete) {
                    if (err) {
                        callback(err, "error in mongoose");
                    } else {
                        if (_.isEmpty(complete)) {
                            callback(null, complete);
                        } else {
                            console.log("complete.count", complete.length);
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
                OldKnockout.aggregate(pipeLine, function (err, complete) {
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

    getSportId: function (data, callback) {
        var deepSearch = "sportslist.sportsListSubCategory";
        Sport.findOne({
            oldId: data.sport
        }).lean().deepPopulate(deepSearch).exec(function (err, found) {
            if (err || _.isEmpty(found)) {
                callback(null, {
                    error: "No SportsList found!",
                    success: data
                });
            } else {
                callback(null, found);
            }
        });

    },

    getAthleteId: function (data, callback) {
        Athelete.findOne({
            oldId: data._id
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

    saveIn: function (complete, individualSport, callback) {
        async.concatSeries(complete, function (singleData, callback) {
            individualSport.sport = [];
            async.waterfall([
                function (callback) {
                    OldKnockout.getAthleteId(singleData, function (err, athelete) {
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
                                callback(null, athelete);
                            }
                        }
                    });
                },
                function (athelete, callback) {
                    if (athelete.error) {
                        callback(null, athelete);
                    } else {
                        async.eachSeries(singleData.sport, function (n, callback) {
                            var param = {};
                            param.sport = n;
                            OldKnockout.getSportId(param, function (err, sport) {
                                if (sport.error) {
                                    callback(null, sport);
                                } else {
                                    individualSport.sport.push(sport._id);
                                    individualSport.sportsListSubCategory = sport.sportslist.sportsListSubCategory._id;
                                    callback(null, individualSport);
                                }
                            });
                        }, function (err) {
                            callback(null, athelete);
                        });
                    }
                },
                function (athelete, callback) {
                    if (athelete.error) {
                        individualSport.athleteId = null;
                        individualSport.createdBy = "School";
                        individualSport.oldId = singleData._id;
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
                    } else {
                        console.log("sport", individualSport.sport);
                        IndividualSport.findOne({
                            athleteId: athelete._id,
                            sport: individualSport.sport
                        }).lean().exec(function (err, found) {
                            if (err) {
                                callback(null, {
                                    error: "No SportsList found!",
                                    success: data
                                });
                            } else if (_.isEmpty(found)) {
                                individualSport.athleteId = athelete._id;
                                individualSport.createdBy = "School";
                                individualSport.oldId = singleData._id;
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
                            } else {
                                callback(null, found);
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
    },
    //-----------------------------------For Team Sport-------------------------------------
    getKnockoutTeam1AggregatePipeLine: function (data) {

        var pipeline = [{
                $match: {
                    "participantType": "team",
                    "year": data.year
                }
            },
            // Stage 2
            {
                $group: {
                    _id: "$team1",
                    sport: {
                        $addToSet: "$sport"
                    }
                }
            },


        ];
        return pipeline;
    },

    getAllTeam1: function (data, callback) {
        var individualSport = {};
        async.waterfall([
            function (callback) {
                var pipeLine = OldKnockout.getKnockoutTeam1AggregatePipeLine(data);
                OldKnockout.aggregate(pipeLine, function (err, complete) {
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
            },
        ], function (err, data3) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, data3);
            }
        });
    },

    getKnockoutTeam2AggregatePipeLine: function (data) {

        var pipeline = [{
                $match: {
                    "participantType": "team",
                    "year": data.year
                }
            },
            // Stage 2
            {
                $group: {
                    _id: "$team2",
                    sport: {
                        $addToSet: "$sport"
                    }
                }
            },


        ];
        return pipeline;
    },

    getAllTeam2: function (data, callback) {
        var individualSport = {};
        async.waterfall([
            function (callback) {
                var pipeLine = OldKnockout.getKnockoutTeam2AggregatePipeLine(data);
                OldKnockout.aggregate(pipeLine, function (err, complete) {
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
            },
        ], function (err, data3) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, data3);
            }
        });
    },

    saveInTeam: function (complete, callback) {
        async.concatSeries(complete, function (mainData, callback) {
            var i = 0;
            var team = {};
            team.team = mainData._id;
            team.sport = mainData.sport[0];
            OldTeam.getAllTeam(team, function (err, teamData) {
                if (err) {
                    callback(err, null);
                } else if (_.isEmpty(teamData)) {
                    callback(null, []);
                } else {
                    callback(null, teamData);
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

    //------------------------------Match Creation-----------------------------------------

    saveKnockoutMatchIndividual: function (data, callback) {
        var thirdPlace = {};
        async.waterfall([
                function (callback) {
                    OldKnockout.find({
                        participantType: "player",
                        year: data.year,
                        player1: {
                            $ne: ObjectId("57eb7a3f418a945c43a7bc77")
                        },
                        player2: {
                            $ne: ObjectId("57eb7a3f418a945c43a7bc77")
                        }
                    }).sort({
                        order: 1,
                        roundno: 1
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
                    var final = {};
                    var complete = _.groupBy(found, "sport");
                    async.concatSeries(complete, function (mainData, callback) {
                            async.concatSeries(mainData, function (singleData, callback) {
                                    console.log("singleData", singleData);
                                    if (singleData.round != "Third Place") {
                                        OldKnockout.getMatchDetails(singleData, function (err, matchData) {
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
                                    } else {
                                        thirdPlace = singleData;
                                        callback(null, singleData);
                                    }
                                },
                                function (err, finalData) {
                                    if (err) {
                                        callback(err, null);
                                    } else {
                                        if (_.isEmpty(thirdPlace)) {
                                            callback(null, finalData);
                                        } else {
                                            OldKnockout.getMatchDetails(thirdPlace, function (err, matchData) {
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
                                                        thirdPlace = {};
                                                        callback(null, matchData);
                                                    }
                                                }
                                            });
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
                            // console.log("sport", found);
                            match.sport = found._id;
                            match.scheduleDate = data.date;
                            match.round = data.round;
                            match.incrementalId = data.matchid;
                            match.oldId = data._id;
                            match.matchId = "Knockout";
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
                                // console.log("inside push", individualData);
                                match.opponentsSingle.push(individualData._id);
                                callback(null, found);
                            }
                        });
                    } else {
                        callback(null, found);
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
                                // console.log("inside push1", individualData);
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
                    // console.log("match********", match);
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

    saveKnockoutMatchTeam: function (data, callback) {
        var thirdPlace = {};
        async.waterfall([
            function (callback) {
                OldKnockout.find({
                    participantType: "team",
                    year: data.year
                }).sort({
                    order: 1,
                    roundno: 1
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
                        if (singleData.round != "Third Place") {
                            OldKnockout.getMatchDetailsTeam(singleData, function (err, matchData) {
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
                        } else {
                            thirdPlace = singleData;
                            callback(null, singleData);
                        }
                    }, function (err, finalData) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(thirdPlace)) {
                                callback(null, finalData);
                            } else {
                                OldKnockout.getMatchDetailsTeam(thirdPlace, function (err, matchData) {
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
                                            thirdPlace = {};
                                            callback(null, matchData);
                                        }
                                    }
                                });
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
            },
        ], function (err, data3) {
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
                        // console.log("sport", found);
                        match.sport = found._id;
                        match.scheduleDate = data.date;
                        // var round = data.round.toLowerCase();
                        match.round = data.round;
                        match.incrementalId = data.matchid;
                        match.matchId = "Knockout";
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
                        // console.log("empty");
                        callback(null, []);
                    } else {
                        // console.log("inside push", individualData);
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
                        // console.log("empty");
                        callback(null, []);
                    } else {
                        // console.log("inside push", individualData);
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