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
                        _.each(singleData.sport, function (n) {
                            var param = {};
                            param.sport = n;
                            OldKnockout.getSportId(param, function (err, sport) {
                                if (sport.error) {
                                    callback(null, sport);
                                } else {
                                    individualSport.sport.push(sport._id);
                                    individualSport.sportsListSubCategory = sport.sportslist.sportsListSubCategory._id;
                                    callback(null, athelete);
                                }
                            });
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
    }
};
module.exports = _.assign(module.exports, exports, model);