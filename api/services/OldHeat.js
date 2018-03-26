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
            async.concatSeries(mainData._id, function (singleData, callback) {
                if (i == mainData.sport.length) {
                    i = 0;
                }
                individualSport.sport = [];
                async.waterfall([
                    function (callback) {
                        var athelete = {};
                        athelete._id = singleData;
                        individualSport.oldId = singleData;
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
                            individualSport.athleteId = null;
                            individualSport.createdBy = "School";
                            // individualSport.oldId = singleData;
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
                            individualSport.athleteId = athelete._id;
                            individualSport.createdBy = "School";
                            // individualSport.oldId = singleData;
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

    getHeatTeamAggregatePipeLine: function (data) {

        var pipeline = [{
                $match: {
                    "participantType": "team",
                    "year": data.year
                }
            },
            // Stage 2
            {
                $group: {
                    _id: "$heats.team",
                    info: {
                        $push: {
                            sport: "$sport",
                            year: "$year"
                        }
                    }
                }
            },


        ];
        return pipeline;
    },

    getAllTeam: function (data, callback) {
        var individualSport = {};
        async.waterfall([
            function (callback) {
                var pipeLine = OldHeat.getHeatTeamAggregatePipeLine(data);
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
                OldHeat.saveInTeam(complete, function (err, saveData) {
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
            async.concatSeries(mainData._id, function (singleData, callback) {
                var team = {};
                team.team = singleData;
                team.sport = mainData.info[0].sport;
                team.year = mainData.info[0].year;
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
        }, function (err, finalData) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, finalData);
            }
        });
    },

    //---------------------------------Match--------------------------------

    saveHeatMatchIndividual: function (data, callback) {
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
        var listOfSport = ["Triple jump",
            "Hammer throw",
            "Discuss throw",
            "High jump",
            "Javelin throw",
            "Long jump",
            "Shot put (3kg)",
            "Shot put (4kg)",
            "Shot put (5kg)"
        ]
        var match = {};
        match.opponentsSingle = [];
        match.opponentsTeam = [];
        var players = [];
        var flag = false;
        async.waterfall([
            function (callback) {
                Sport.find({
                    oldId: data.sport
                }).lean().deepPopulate("sportslist").exec(function (err, found) {
                    if (err) {
                        callback(err, null);
                    } else if (_.isEmpty(found)) {
                        callback(null, []);
                    } else {
                        if (!listOfSport.includes(found[0].sportslist.name)) {
                            console.log("sport", found);
                            match.sport = found[0]._id;
                            match.scheduleDate = data.date;
                            // var round = data.round.toLowerCase();
                            match.round = data.name;
                            match.oldId = data._id
                            // match.heatNo = data.name.lastIndexOf(" " + 1);
                            match.incrementalId = data.matchid;
                            match.matchId = "heat";
                        }
                        callback(null, found);
                    }
                });
            },
            function (found, callback) {
                var i = 0;
                async.eachSeries(data.heats, function (n, callback) {
                    if (found[0]) {
                        IndividualSport.find({
                            oldId: n.player,
                            sport: found[0]._id
                        }).lean().exec(function (err, individualData) {
                            if (err) {
                                callback(err, null);
                            } else if (_.isEmpty(individualData)) {

                                var player = {};
                                if (n.laneno) {
                                    player.laneno = n.laneno;
                                }
                                if (!listOfSport.includes(found[0].sportslist.name)) {
                                    players.push(player);
                                }
                                match.resultHeat = {};
                                callback(null, []);
                            } else {
                                if (listOfSport.includes(found[0].sportslist.name)) {
                                    flag = true;
                                    console.log("sport", individualData);
                                    match = {};
                                    match.opponentsSingle = [];
                                    match.sport = found[0]._id;
                                    match.scheduleDate = data.date;
                                    // var round = data.round.toLowerCase();
                                    match.round = data.name;
                                    match.oldId = data._id
                                    // match.heatNo = data.name.lastIndexOf(" " + 1);

                                    match.incrementalId = data.matchid + i;
                                    i++;
                                    match.matchId = "heatQualifying";
                                    match.opponentsSingle.push(individualData[0]._id);
                                    OldHeat.saveMatch(match, function (err, matchData) {
                                        if (err) {
                                            callback(err, null);
                                        } else {
                                            callback(null, matchData);
                                        }
                                    });
                                } else {
                                    var player = {};
                                    player.id = individualData[0]._id;
                                    player.laneno = n.laneno;
                                    players.push(player);
                                    match.resultHeat = {};
                                    match.opponentsSingle.push(individualData[0]._id);
                                    callback(null, individualData);
                                }
                            }
                        });
                    } else {
                        callback(null, found);
                    }
                }, function (err) {
                    if (err) {
                        callback(err, null);
                    } else {
                        if (!_.isEmpty(players)) {
                            match.resultHeat.players = players;
                            players = [];
                        }
                        callback(null, found);
                    }
                });
            },
            function (found, callback) {
                console.log("flag", flag);
                if (flag == false) {
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
                } else {
                    flag = false;
                    callback(null, flag);
                }
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
        console.log("data", data);
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
                            data.incrementalId = ++match.incrementalId;
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

    saveHeatMatchTeam: function (data, callback) {
        console.log("Inside", data);
        async.waterfall([
            function (callback) {
                OldHeat.find({
                    participantType: "team",
                    year: data.year
                }).lean().exec(function (err, found) {
                    if (err) {
                        callback(err, null);
                    } else if (_.isEmpty(found)) {
                        callback(null, []);
                    } else {
                        console.log("found", found);
                        callback(null, found);
                    }
                });
            },
            function (found, callback) {
                var complete = _.groupBy(found, "sport");
                async.concatSeries(complete, function (mainData, callback) {
                    async.concatSeries(mainData, function (singleData, callback) {
                        OldHeat.getMatchDetailsTeam(singleData, function (err, matchData) {
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

    getMatchDetailsTeam: function (data, callback) {
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
                        // console.log("sport", found);
                        match.sport = found[0]._id;
                        match.scheduleDate = data.date;
                        var round = data.round.toLowerCase();
                        match.round = data.name;
                        match.incrementalId = data.matchid;
                        match.matchId = "heat";
                        callback(null, found);
                    }
                });
            },
            function (found, callback) {
                console.log("heats", data.heats);
                var players = [];
                async.eachSeries(data.heats, function (n, callback) {
                    if (found[0]) {
                        TeamSport.find({
                            oldId: n.team,
                        }).lean().exec(function (err, individualData) {
                            if (err) {
                                callback(err, null);
                            } else if (_.isEmpty(individualData)) {
                                // console.log("empty");
                                callback(null, []);
                            } else {
                                // console.log("inside push", individualData);
                                var player = {};
                                player.id = individualData[0]._id;
                                players.push(player);
                                match.resultHeat = {};
                                match.opponentsTeam.push(individualData[0]._id);
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
                        match.resultHeat.players = players;
                        players = [];
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
};
module.exports = _.assign(module.exports, exports, model);