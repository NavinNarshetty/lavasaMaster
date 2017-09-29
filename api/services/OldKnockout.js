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

    getAllIndividual1: function (data, callback) {
        async.waterfall([
                function (callback) {
                    OldKnockout.find({
                        year: data.year,
                        participantType: "player"
                    }).lean().exec(function (err, found) {
                        if (err) {
                            callback(err, null);
                        } else {
                            callback(null, found);
                        }
                    });
                },
                function (found, callback) {
                    var player = _.groupBy(found, "sport");
                    _.each(player, function (p, key) {
                        // player[key] = _.groupBy(p, 'sport');
                        player[key] = _.uniq(p, function (x) {
                            return x;
                        });
                        // console.log("---------------------");
                    });

                    callback(null, player);
                }
            ],
            function (err, found) {
                if (err) {
                    callback(err, null);
                } else if (_.isEmpty(found)) {
                    callback(null, []);
                } else {
                    callback(null, found);
                }
            });
    },

    getknockoutAggregatePipeLine: function (data) {

        var pipeline = [{
                $match: {
                    "participantType": "player"
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

    getAllIndividual: function (data, callback) {
        var individualSport = {};
        individualSport.sport = [];
        async.waterfall([
            function (callback) {
                var pipeLine = OldKnockout.getknockoutAggregatePipeLine(data);
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
                async.Series(complete, function (singleData, callback) {
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
                                        individualSport.athleteId = athelete._id;
                                        callback(null, singleData);
                                    }
                                }
                            });
                        },
                        function (singleData, callback) {
                            _.each(singleData.sport, function (n) {
                                var param = {};
                                param.sport = n;
                                OldKnockout.getSportId(param, function (err, sport) {
                                    if (!_.isEmpty(sport)) {
                                        individualSport.sport.push(sport);
                                        individualSport.sportsListSubCategory = sport.sportslist.sportsListSubCategory._id;
                                    }
                                });
                            });
                            callback(null, singleData);

                        },
                        function (singleData, callback) {

                        }
                    ], function (err, data3) {
                        if (err) {
                            console.log(err);
                            callback(err, null);
                        } else {
                            if (_.isEmpty(data3)) {
                                callback(null, data3);
                            } else {
                                callback(null, data3);
                            }
                        }
                    });
                }, function (err) {
                    if (err) {
                        callback(err, null);
                    } else {
                        callback(null, complete);
                    }
                });
            }
        ], function (err, data3) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else {
                if (_.isEmpty(data3)) {
                    callback(null, data3);
                } else {
                    callback(null, data3);
                }
            }
        });
    },

    getSportId: function (data, callback) {
        var deepSearch = "sport.sportslist.sportsListSubCategory";
        var sport = {};
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
            oldId: {
                $regex: data.id,
                $options: "i"
            }
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
};
module.exports = _.assign(module.exports, exports, model);