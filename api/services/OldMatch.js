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
                    // if (n.resultHeat) {
                    //     formData.resultHeat = n.resultHeat;
                    // } else if (n.resultKnockout) {
                    //     formData.resultKnockout = n.resultKnockout;
                    // } else if (n.resultsCombat) {
                    //     formData.resultsCombat = n.resultsCombat;
                    // } else if (n.resultsRacquet) {
                    //     formData.resultsRacquet = n.resultsRacquet;
                    // } else if (n.resultQualifyingRound) {
                    //     formData.resultQualifyingRound = n.resultQualifyingRound;
                    // } else if (n.resultFencing) {
                    //     formData.resultFencing = n.resultFencing;
                    // } else if (n.resultSwiss) {
                    //     formData.resultSwiss = n.resultSwiss;
                    // } else if (n.resultShooting) {
                    //     formData.resultShooting = n.resultShooting;
                    // }
                    formData.opponentsSingle = final.opponentsSingle;
                    // console.log("formData", formData);
                    Match.saveData(formData, function (err, complete) {
                        if (err || _.isEmpty(complete)) {
                            callback(null, {
                                error: "Error",
                                success: complete
                            });
                        } else {
                            var nextData = {};
                            nextData.match = complete;
                            nextData.oldmatch = n;
                            callback(null, nextData);
                        }
                    });
                },
                function (nextData, callback) {
                    var param = {};
                    param.matchId = nextData.match.matchId;
                    Match.getOne(param, function (err, matchData) {
                        console.log("matchData", nextData.match.matchId);
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(matchData)) {
                                callback(null, []);
                            } else {
                                var final = {};
                                var result = ResultInitialize.getResultVar(matchData.sportsName, matchData.sportType);
                                console.log("result", matchData[result.resultVar]);
                                if (!(matchData[result.resultVar] == '')) {
                                    final.result = result;
                                    final.score = matchData[result.resultVar];
                                    final.nextData = nextData;
                                    callback(null, final);
                                } else {
                                    if (result.resultVar != "resultHeat") {
                                        final.resultName = result.resultVar;
                                        final.nextData = nextData;
                                        ResultInitialize.getMyResult(matchData.sportsName, matchData, function (err, complete) {
                                            console.log("complete", complete, "players", complete[result.resultVar].players);
                                            matchData[result.resultVar] = complete[result.resultVar];
                                            // if (nextData.oldmatch[result.resultVar]) {
                                            //     complete[result.resultVar].players[0].teamResults = nextData.oldmatch[result.resultVar].players[0].teamResults;
                                            //     complete[result.resultVar].players[0].noShow = nextData.oldmatch[result.resultVar].players[0].noShow;
                                            //     complete[result.resultVar].players[0].walkover = nextData.oldmatch[result.resultVar].players[0].walkover;
                                            //     _.each(nextData.oldmatch[result.resultVar].players[0].players, function (n) {
                                            //         complete[result.resultVar].players[0].players.isPlaying = n.isPlaying;
                                            //         complete[result.resultVar].players[0].players.noShow = n.noShow;
                                            //         complete[result.resultVar].players[0].players.walkover = n.walkover;
                                            //         complete[result.resultVar].players[0].players.playerPoints = n.playerPoints;
                                            //     });
                                            //     complete[result.resultVar].players[1].teamResults = nextData.oldmatch[result.resultVar].players[1].teamResults;
                                            //     complete[result.resultVar].players[1].noShow = nextData.oldmatch[result.resultVar].players[0].noShow;
                                            //     complete[result.resultVar].players[1].walkover = nextData.oldmatch[result.resultVar].players[0].walkover;
                                            //     _.each(nextData.oldmatch[result.resultVar].players[1].players, function (n) {
                                            //         complete[result.resultVar].players[1].players.isPlaying = n.isPlaying;
                                            //         complete[result.resultVar].players[1].players.noShow = n.noShow;
                                            //         complete[result.resultVar].players[1].players.walkover = n.walkover;
                                            //         complete[result.resultVar].players[1].players.playerPoints = n.playerPoints;
                                            //     });
                                            // }
                                            var placeholder = {};
                                            placeholder[result.resultVar] = complete[result.resultVar];
                                            var matchObj = {
                                                $set: placeholder
                                            };
                                            final.placeholder = placeholder;
                                            Match.update({
                                                matchId: nextData.match.matchId
                                            }, matchObj).exec(
                                                function (err, match) {
                                                    if (err || _.isEmpty(match)) {
                                                        callback(null, {
                                                            err: "no match update",
                                                            data: data
                                                        });
                                                    } else {
                                                        callback(null, final);
                                                    }
                                                });
                                        });
                                    } else {
                                        final.resultName = result.resultVar;
                                        final.nextData = nextData;
                                        ResultInitialize.getMyResult(matchData.sportsCategory, matchData, function (err, complete) {
                                            console.log("complete", complete, "players", complete[result.resultVar].players);
                                            matchData[result.resultVar] = complete[result.resultVar];
                                            if (nextData.oldmatch[result.resultVar]) {
                                                var i = 0;
                                                _.each(nextData.oldmatch[result.resultVar].players, function (n) {
                                                    complete[result.resultVar].players[i].time = n.time;
                                                    complete[result.resultVar].players[i].result = n.result;
                                                    complete[result.resultVar].players[i].laneNo = n.laneNo;
                                                    i++;
                                                });
                                            }
                                            var placeholder = {};
                                            placeholder[result.resultVar] = complete[result.resultVar];
                                            var matchObj = {
                                                $set: placeholder
                                            };
                                            final.placeholder = placeholder;
                                            Match.update({
                                                matchId: nextData.match.matchId
                                            }, matchObj).exec(
                                                function (err, match) {
                                                    if (err || _.isEmpty(match)) {
                                                        callback(null, {
                                                            err: "no match update",
                                                            data: data
                                                        });
                                                    } else {
                                                        callback(null, final);
                                                    }
                                                });
                                        });
                                    }

                                }
                            }
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
        async.concatSeries(data.matchData, function (n, callback) {
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
                            var nextData = {};
                            nextData.match = complete;
                            nextData.oldmatch = n;
                            callback(null, nextData);
                        }
                    });
                },
                function (nextData, callback) {
                    var param = {};
                    param.matchId = nextData.match.matchId;
                    Match.getOne(param, function (err, matchData) {
                        console.log("matchData", nextData.match.matchId);
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(matchData)) {
                                callback(null, []);
                            } else {
                                var final = {};
                                var result = ResultInitialize.getResultVar(matchData.sportsName, matchData.sportType);
                                console.log("result******", result, "-------------", matchData);
                                if (!(matchData[result.resultVar] == '')) {
                                    final.result = result;
                                    final.score = matchData[result.resultVar];
                                    final.nextData = nextData;
                                    callback(null, final);
                                } else {
                                    if (result.resultVar != "resultHeat") {
                                        final.resultName = result.resultVar;
                                        final.nextData = nextData;
                                        ResultInitialize.getMyResult(matchData.sportsName, matchData, function (err, complete) {
                                            console.log("teams results", nextData.oldmatch[result.resultVar]);
                                            matchData[result.resultVar] = complete[result.resultVar];
                                            if (nextData.oldmatch[result.resultVar]) {
                                                complete[result.resultVar].teams[0].teamResults = nextData.oldmatch[result.resultVar].teams[0].teamResults;
                                                complete[result.resultVar].teams[0].noShow = nextData.oldmatch[result.resultVar].teams[0].noShow;
                                                complete[result.resultVar].teams[0].walkover = nextData.oldmatch[result.resultVar].teams[0].walkover;
                                                var count = 0;
                                                _.each(nextData.oldmatch[result.resultVar].teams[0].players, function (n) {
                                                    complete[result.resultVar].teams[0].players[count].isPlaying = n.isPlaying;
                                                    complete[result.resultVar].teams[0].players[count].noShow = n.noShow;
                                                    complete[result.resultVar].teams[0].players[count].walkover = n.walkover;
                                                    complete[result.resultVar].teams[0].players[count].playerPoints = n.playerPoints;
                                                    count++;
                                                });
                                                complete[result.resultVar].teams[1].teamResults = nextData.oldmatch[result.resultVar].teams[1].teamResults;
                                                complete[result.resultVar].teams[1].noShow = nextData.oldmatch[result.resultVar].teams[0].noShow;
                                                complete[result.resultVar].teams[1].walkover = nextData.oldmatch[result.resultVar].teams[0].walkover;
                                                var j = 0;
                                                _.each(nextData.oldmatch[result.resultVar].teams[1].players, function (n) {
                                                    complete[result.resultVar].teams[1].players[j].isPlaying = n.isPlaying;
                                                    complete[result.resultVar].teams[1].players[j].noShow = n.noShow;
                                                    complete[result.resultVar].teams[1].players[j].walkover = n.walkover;
                                                    complete[result.resultVar].teams[1].players[j].playerPoints = n.playerPoints;
                                                    j++;
                                                });
                                            }
                                            var placeholder = {};
                                            placeholder[result.resultVar] = complete[result.resultVar];
                                            var matchObj = {
                                                $set: placeholder
                                            };
                                            final.placeholder = placeholder;
                                            Match.update({
                                                matchId: nextData.match.matchId
                                            }, matchObj).exec(
                                                function (err, match) {
                                                    if (err || _.isEmpty(match)) {
                                                        callback(null, {
                                                            err: "no match update",
                                                            data: data
                                                        });
                                                    } else {
                                                        callback(null, final);
                                                    }
                                                });
                                        });
                                    } else {
                                        final.resultName = result.resultVar;
                                        final.nextData = nextData;
                                        ResultInitialize.getMyResult(matchData.sportsCategory, matchData, function (err, complete) {
                                            console.log("complete", complete, "teams", complete[result.resultVar].teams);
                                            matchData[result.resultVar] = complete[result.resultVar];
                                            if (nextData.oldmatch[result.resultVar]) {
                                                var i = 0;
                                                _.each(nextData.oldmatch[result.resultVar].teams, function (n) {
                                                    complete[result.resultVar].teams[i].time = n.time;
                                                    complete[result.resultVar].teams[i].result = n.result;
                                                    complete[result.resultVar].teams[i].laneNo = n.laneNo;
                                                    i++;
                                                });
                                            }
                                            var placeholder = {};
                                            placeholder[result.resultVar] = complete[result.resultVar];
                                            var matchObj = {
                                                $set: placeholder
                                            };
                                            final.placeholder = placeholder;
                                            Match.update({
                                                matchId: nextData.match.matchId
                                            }, matchObj).exec(
                                                function (err, match) {
                                                    if (err || _.isEmpty(match)) {
                                                        callback(null, {
                                                            err: "no match update",
                                                            data: data
                                                        });
                                                    } else {
                                                        callback(null, final);
                                                    }
                                                });
                                        });
                                    }
                                }
                            }
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
        }, function (err, data2) {
            if (err) {
                callback(null, {
                    error: "error found",
                    data: data
                });
            } else {
                callback(null, data2);
            }
        });
    },

};
module.exports = _.assign(module.exports, exports, model);