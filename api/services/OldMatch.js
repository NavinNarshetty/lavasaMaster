var schema = new Schema({
    incrementalId: Number,
    matchId: String,
    sport: {
        type: Schema.Types.ObjectId,
        ref: 'OldSport'
    },
    round: String,
    opponentsSingle: [{
        type: Schema.Types.ObjectId,
        ref: 'OldIndividualSport'
    }],
    opponentsTeam: [{
        type: Schema.Types.ObjectId,
        ref: 'OldTeamSport'
    }],
    prevMatch: [{
        type: Schema.Types.ObjectId,
        ref: 'Match'
    }],
    nextMatch: {
        type: Schema.Types.ObjectId,
        ref: 'Match'
    },
    scoreCard: Schema.Types.Mixed,
    resultsCombat: Schema.Types.Mixed,
    resultsRacquet: Schema.Types.Mixed,
    resultHeat: Schema.Types.Mixed,
    resultHockey: Schema.Types.Mixed,
    resultBasketball: Schema.Types.Mixed,
    resultVolleyball: Schema.Types.Mixed,
    resultHandball: Schema.Types.Mixed,
    resultWaterPolo: Schema.Types.Mixed,
    resultKabaddi: Schema.Types.Mixed,
    resultFootball: Schema.Types.Mixed,
    resultQualifyingRound: Schema.Types.Mixed,
    resultKnockout: Schema.Types.Mixed,
    resultShooting: Schema.Types.Mixed,
    resultSwiss: Schema.Types.Mixed,
    resultFencing: Schema.Types.Mixed,
    resultImages: Schema.Types.Mixed,
    resultThrowball: Schema.Types.Mixed,
    scheduleDate: Date,
    scheduleTime: String,
    video: String,
    videoType: String,
    thumbnails: [],
    matchCenter: String,
    excelType: String,
    heatNo: String,
    resultType: String,
    drawFormat: String,
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('OldMatch', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {

    getAllIndividualMatch: function (data, callback) {
        async.waterfall([
            function (callback) {
                ConfigProperty.findOne().exec(function (err, property) {
                    if (err || _.isEmpty(property)) {
                        callback(null, {
                            error: "error"
                        });
                    } else {
                        callback(null, property);
                    }
                });
            },
            function (property, callback) {
                Event.findOne({
                    city: property.city,
                    year: property.year
                }).exec(function (err, eventData) {
                    if (err || _.isEmpty(eventData)) {
                        callback(null, {
                            error: "error"
                        });
                    } else {
                        callback(null, eventData);
                    }
                });
            },
            function (eventData, callback) {
                OldMatch.find({
                    opponentsSingle: {
                        $exists: true
                    },
                    $where: 'this.opponentsSingle.length>1'
                }).lean().exec(function (err, found) {
                    if (err) {
                        callback(err, null);
                    } else if (_.isEmpty(found)) {
                        callback(null, []);
                    } else {
                        var final = {};
                        final.event = eventData._id;
                        final.matchData = found;
                        callback(null, final);
                    }
                });
            },
            function (final, callback) {
                OldMatch.setIndividualMatch(final, function (err, complete) {
                    if (err || _.isEmpty(complete)) {
                        var err = "Error found in Rules";
                        callback(err, null);
                    } else {
                        callback(null, complete);
                    }
                });
            }
        ], function (err, complete) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, complete);
            }
        });
    },

    setIndividualMatch: function (data, callback) {
        async.eachSeries(data.matchData, function (n, callback) {
            async.waterfall([
                function (callback) {
                    OldIndividualSport.getSportId(n.sport, function (err, complete) {
                        if (err || _.isEmpty(complete)) {
                            var err = "Error found in Rules";
                            callback(err, null);
                        } else {
                            callback(null, complete);
                        }
                    });
                },
                function (complete, callback) {
                    var final = {};
                    final.sportData = complete;
                    final.opponentsSingle = [];
                    async.eachSeries(n.opponentsSingle, function (single, callback) {
                        console.log("single", single)
                        IndividualSport.find({
                            oldId: single
                        }).lean().exec(function (err, found) {
                            console.log("found***", found);
                            if (err) {
                                callback(err, null);
                            } else if (_.isEmpty(found)) {
                                callback(null, []);
                            } else {
                                final.opponentsSingle.push(found[0]._id);
                                callback(null, final);
                            }
                        });
                    }, function (err) {
                        if (err) {
                            callback(null, {
                                error: "error found",
                                data: data
                            });
                        } else {
                            console.log("final", final);
                            callback(null, final);
                        }
                    });
                },
                function (final, callback) {
                    var formData = {};
                    formData.oldId = n._id;
                    formData.sport = final.sportData.sport;
                    formData.eventId = data.event;
                    formData.scheduleDate = n.scheduleDate;
                    formData.round = n.round;
                    formData.incrementalId = n.incrementalId;
                    formData.matchId = n.matchId;
                    if (n.resultHeat) {
                        formData.resultHeat = n.resultHeat;
                    } else if (n.resultKnockout) {
                        formData.resultKnockout = n.resultKnockout;
                    } else if (n.resultsCombat) {
                        formData.resultsCombat = n.resultsCombat;
                    } else if (n.resultsRacquet) {
                        formData.resultsRacquet = n.resultsRacquet;
                    } else if (n.resultQualifyingRound) {
                        formData.resultQualifyingRound = n.resultQualifyingRound;
                    } else if (n.resultFencing) {
                        formData.resultFencing = n.resultFencing;
                    } else if (n.resultSwiss) {
                        formData.resultSwiss = n.resultSwiss;
                    } else if (n.resultShooting) {
                        formData.resultShooting = n.resultShooting;
                    }
                    formData.opponentsSingle = final.opponentsSingle;
                    // console.log("formData", formData);
                    Match.saveData(formData, function (err, complete) {
                        if (err || _.isEmpty(complete)) {
                            callback(null, {
                                error: "Error",
                                success: complete
                            });
                        } else {
                            callback(null, complete);
                        }
                    });
                },
            ], function (err, complete) {
                if (err) {
                    callback(err, null);
                } else {
                    callback(null, complete);
                }
            });
        }, function (err) {
            if (err) {
                callback(null, {
                    error: "error found",
                    data: data
                });
            } else {
                callback(null, data);
            }
        });
    },

    getAllTeamMatch: function (data, callback) {
        async.waterfall([
            function (callback) {
                ConfigProperty.findOne().exec(function (err, property) {
                    if (err || _.isEmpty(property)) {
                        callback(null, {
                            error: "error"
                        });
                    } else {
                        callback(null, property);
                    }
                });
            },
            function (property, callback) {
                Event.findOne({
                    city: property.city,
                    year: property.year
                }).exec(function (err, eventData) {
                    if (err || _.isEmpty(eventData)) {
                        callback(null, {
                            error: "error"
                        });
                    } else {
                        callback(null, eventData);
                    }
                });
            },
            function (eventData, callback) {
                OldMatch.find({
                    opponentsTeam: {
                        $exists: true
                    },
                    $where: 'this.opponentsTeam.length>1'
                }).lean().exec(function (err, found) {
                    if (err) {
                        callback(err, null);
                    } else if (_.isEmpty(found)) {
                        callback(null, []);
                    } else {
                        var final = {};
                        final.event = eventData._id;
                        final.matchData = found;
                        callback(null, final);
                    }
                });
            },
            function (final, callback) {
                OldMatch.setTeamMatch(final, function (err, complete) {
                    if (err || _.isEmpty(complete)) {
                        var err = "Error found in Rules";
                        callback(err, null);
                    } else {
                        callback(null, complete);
                    }
                });
            }
        ], function (err, complete) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, complete);
            }
        });
    },

    setTeamMatch: function (data, callback) {
        async.eachSeries(data.matchData, function (n, callback) {
            async.waterfall([
                function (callback) {
                    OldIndividualSport.getSportId(n.sport, function (err, complete) {
                        if (err || _.isEmpty(complete)) {
                            var err = "Error found in Rules";
                            callback(err, null);
                        } else {
                            callback(null, complete);
                        }
                    });
                },
                function (complete, callback) {
                    var final = {};
                    final.sportData = complete;
                    final.opponentsTeam = [];
                    async.eachSeries(n.opponentsTeam, function (single, callback) {
                        // console.log("single", single);
                        TeamSport.findOne({
                            oldId: single
                        }).lean().exec(function (err, found) {
                            // console.log("found***", found);
                            if (err) {
                                callback(err, null);
                            } else if (_.isEmpty(found)) {
                                callback(null, []);
                            } else {
                                final.opponentsTeam.push(found._id);
                                callback(null, final);
                            }
                        });
                    }, function (err) {
                        if (err) {
                            callback(null, {
                                error: "error found",
                                data: data
                            });
                        } else {
                            callback(null, final);
                        }
                    });
                },
                function (final, callback) {
                    var formData = {};
                    formData.oldId = n._id;
                    formData.sport = final.sportData.sport;
                    formData.eventId = data.event;
                    formData.scheduleDate = n.scheduleDate;
                    formData.round = n.round;
                    formData.incrementalId = n.incrementalId;
                    formData.matchId = n.matchId;
                    formData.opponentsTeam = final.opponentsTeam;
                    Match.saveData(formData, function (err, complete) {
                        if (err || _.isEmpty(complete)) {
                            callback(null, {
                                error: "Error",
                                success: complete
                            });
                        } else {
                            callback(null, complete);
                        }
                    });
                },
            ], function (err, complete) {
                if (err) {
                    callback(err, null);
                } else {
                    callback(null, complete);
                }
            });
        }, function (err) {
            if (err) {
                callback(null, {
                    error: "error found",
                    data: data
                });
            } else {
                callback(null, data);
            }
        });
    },

};
module.exports = _.assign(module.exports, exports, model);