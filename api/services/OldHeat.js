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
                        console.log("singleData", singleData);
                        callback(null, singleData);
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
                        match.sport = found._id;
                        match.scheduleDate = data.date;
                        var round = data.round.toLowerCase();
                        if (round == "heats" || round == "heat") {
                            match.round = data.name;
                        } else if (round == "sem final" || round == "sem final") {

                        }
                        callback(null, found);
                    }
                });
            },
            function (found, callback) {
                async.eachSeries(data.heats, function (n, callback) {
                    IndividualSport.find({
                        oldId: n.player
                    }).lean().exec(function (err, individualData) {
                        if (err) {
                            callback(err, null);
                        } else if (_.isEmpty(individualData)) {
                            callback(null, []);
                        } else {
                            match.opponentsSingle.push(individualData._id);
                            callback(null, individualData);
                        }
                    });

                }, function (err) {
                    if (err) {
                        callback(err, null);
                    } else {
                        callback(null, found);
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
    }
};
module.exports = _.assign(module.exports, exports, model);