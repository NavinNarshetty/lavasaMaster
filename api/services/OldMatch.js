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
                                    callback(null, {
                                        error: err,
                                        data: n
                                    });
                                } else {
                                    callback(null, complete);
                                }
                            });
                        },
                        function (complete, callback) {
                            console.log("complete", complete);
                            if (complete.error) {
                                callback(null, complete);
                            } else {
                                var final = {};
                                final.sportData = complete;
                                final.opponentsSingle = [];
                                async.eachSeries(n.opponentsSingle, function (single, callback) {
                                    // console.log("single", single)
                                    IndividualSport.findOne({
                                        oldId: single
                                    }).lean().exec(function (err, found) {
                                        // console.log("found***", found);
                                        if (err) {
                                            callback(err, null);
                                        } else {
                                            if (!_.isEmpty(found)) {
                                                final.opponentsSingle.push(found._id);
                                            }
                                            callback(null, final);
                                        }
                                    });
                                }, function (err, complete) {
                                    if (err) {
                                        callback(null, {
                                            error: "error found",
                                            data: data
                                        });
                                    } else {
                                        // console.log("final", final);
                                        callback(null, final);
                                    }
                                });
                            }
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
                                // console.log("matchData", matchData);
                                if (err) {
                                    callback(err, null);
                                } else {
                                    if (_.isEmpty(matchData)) {
                                        callback(null, []);
                                    } else {
                                        var final = {};
                                        if (matchData.sportType != "Aquatics Sports" && matchData.sportsCategory != "Athletics" && matchData.sportsCategory != "Karate" && matchData.sportsCategory != "Archery") {
                                            var result = ResultInitialize.getResultVar(matchData.sportsName, matchData.sportType);
                                        } else {
                                            var result = ResultInitialize.getResultVar(matchData.sportsCategory, matchData.sportType);
                                        }
                                        console.log("matchData[result.resultVar]***", result, "************", matchData);
                                        if (!(matchData[result.resultVar] == '')) {
                                            console.log("result***", result);
                                            final.result = result;
                                            final.score = matchData[result.resultVar];
                                            final.nextData = nextData;
                                            callback(null, final);
                                        } else {
                                            // console.log("matchData[result.resultVar]------", result, "-------------", nextData);
                                            if (result.resultVar != "resultHeat" && matchData.sportsCategory != "Karate") {
                                                final.resultName = result.resultVar;
                                                final.nextData = nextData;
                                                ResultInitialize.getMyResult(matchData.sportsName, matchData, function (err, complete) {
                                                    if (matchData.isTeam == true && nextData.oldmatch[result.resultVar]) {
                                                        if (nextData.oldmatch[result.resultVar].teams[0] && nextData.oldmatch[result.resultVar].teams[0].teamResults) {
                                                            complete[result.resultVar].teams[0].teamResults = nextData.oldmatch[result.resultVar].teams[0].teamResults;
                                                        }
                                                        if (nextData.oldmatch[result.resultVar].teams[0] && nextData.oldmatch[result.resultVar].teams[0].noShow) {
                                                            complete[result.resultVar].teams[0].noShow = nextData.oldmatch[result.resultVar].teams[0].noShow;
                                                        }
                                                        if (nextData.oldmatch[result.resultVar].teams[0] && nextData.oldmatch[result.resultVar].teams[0].walkover) {
                                                            complete[result.resultVar].teams[0].noShow = nextData.oldmatch[result.resultVar].teams[0].walkover;
                                                        }
                                                        _.each(nextData.oldmatch[result.resultVar].teams[0].players, function (n) {
                                                            complete[result.resultVar].teams[0].players.isPlaying = n.isPlaying;
                                                            complete[result.resultVar].teams[0].players.noShow = n.noShow;
                                                            complete[result.resultVar].teams[0].players.walkover = n.walkover;
                                                            complete[result.resultVar].teams[0].players.playerPoints = n.playerPoints;
                                                        });
                                                        if (nextData.oldmatch[result.resultVar].teams[1] && nextData.oldmatch[result.resultVar].teams[1].teamResults) {
                                                            complete[result.resultVar].teams[1].teamResults = nextData.oldmatch[result.resultVar].teams[1].teamResults;
                                                        }
                                                        if (nextData.oldmatch[result.resultVar].teams[1] && nextData.oldmatch[result.resultVar].teams[1].noShow) {
                                                            complete[result.resultVar].teams[1].noShow = nextData.oldmatch[result.resultVar].teams[1].noShow;
                                                        }
                                                        if (nextData.oldmatch[result.resultVar].teams[1] && nextData.oldmatch[result.resultVar].teams[1].walkover) {
                                                            complete[result.resultVar].teams[1].walkover = nextData.oldmatch[result.resultVar].teams[1].walkover;
                                                        }
                                                        _.each(nextData.oldmatch[result.resultVar].teams[1].players, function (n) {
                                                            complete[result.resultVar].teams[1].players.isPlaying = n.isPlaying;
                                                            complete[result.resultVar].teams[1].players.noShow = n.noShow;
                                                            complete[result.resultVar].teams[1].players.walkover = n.walkover;
                                                            complete[result.resultVar].teams[1].players.playerPoints = n.playerPoints;
                                                        });
                                                        console.log("nextData.oldmatch[result.resultVar].matchPhoto", nextData.oldmatch[result.resultVar].matchPhoto);
                                                        if (nextData.oldmatch[result.resultVar].matchPhoto != undefined) {
                                                            complete[result.resultVar].matchPhoto = nextData.oldmatch[result.resultVar].matchPhoto;
                                                        }
                                                        if (nextData.oldmatch[result.resultVar].scoreSheet != undefined) {
                                                            complete[result.resultVar].scoreSheet = nextData.oldmatch[result.resultVar].scoreSheet;
                                                        }
                                                        if (nextData.oldmatch[result.resultVar].isNoMatch != undefined) {
                                                            complete[result.resultVar].isNoMatch = nextData.oldmatch[result.resultVar].isNoMatch;
                                                        }
                                                        if (nextData.oldmatch[result.resultVar].status != undefined) {
                                                            complete[result.resultVar].status = nextData.oldmatch[result.resultVar].status;
                                                        }
                                                    } else if (matchData.isTeam == false && nextData.oldmatch[result.resultVar] && nextData.oldmatch[result.resultVar].players[0]) {
                                                        if (result.resultVar == "resultsCombat" || result.resultVar == "resultsRacquet") {
                                                            complete[result.resultVar].players[0].sets = nextData.oldmatch[result.resultVar].players[0].sets;
                                                            complete[result.resultVar].players[0].noShow = nextData.oldmatch[result.resultVar].players[0].noShow;
                                                            complete[result.resultVar].players[0].walkover = nextData.oldmatch[result.resultVar].players[0].walkover;
                                                            console.log("nextData.oldmatch[result.resultVar].matchPhoto", nextData.oldmatch[result.resultVar].matchPhoto);
                                                            if (nextData.oldmatch[result.resultVar].matchPhoto != undefined) {
                                                                complete[result.resultVar].matchPhoto = nextData.oldmatch[result.resultVar].matchPhoto;
                                                            }
                                                            if (nextData.oldmatch[result.resultVar].scoreSheet != undefined) {
                                                                complete[result.resultVar].scoreSheet = nextData.oldmatch[result.resultVar].scoreSheet;
                                                            }
                                                            if (nextData.oldmatch[result.resultVar].isNoMatch != undefined) {
                                                                complete[result.resultVar].isNoMatch = nextData.oldmatch[result.resultVar].isNoMatch;
                                                            }
                                                            if (nextData.oldmatch[result.resultVar].status != undefined) {
                                                                complete[result.resultVar].status = nextData.oldmatch[result.resultVar].status;
                                                            }
                                                        } else if (result.resultVar == "resultSwiss") {
                                                            complete[result.resultVar].players[0].score = nextData.oldmatch[result.resultVar].players[0].score;
                                                            complete[result.resultVar].players[0].rank = nextData.oldmatch[result.resultVar].players[0].rank;
                                                            complete[result.resultVar].players[0].noShow = nextData.oldmatch[result.resultVar].players[0].noShow;
                                                            complete[result.resultVar].players[0].walkover = nextData.oldmatch[result.resultVar].players[0].walkover;
                                                            if (nextData.oldmatch[result.resultVar].isDraw) {
                                                                complete[result.resultVar].isDraw = nextData.oldmatch[result.resultVar].isDraw;
                                                            }
                                                        } else if (result.resultVar == "resultFencing") {
                                                            complete[result.resultVar].players[0].finalPoints = nextData.oldmatch[result.resultVar].players[0].finalPoints;
                                                            complete[result.resultVar].players[0].noShow = nextData.oldmatch[result.resultVar].players[0].noShow;
                                                            complete[result.resultVar].players[0].walkover = nextData.oldmatch[result.resultVar].players[0].walkover;
                                                            console.log("nextData.oldmatch[result.resultVar].matchPhoto", nextData.oldmatch[result.resultVar].matchPhoto);
                                                            if (nextData.oldmatch[result.resultVar].matchPhoto != undefined) {
                                                                complete[result.resultVar].matchPhoto = nextData.oldmatch[result.resultVar].matchPhoto;
                                                            }
                                                            if (nextData.oldmatch[result.resultVar].scoreSheet != undefined) {
                                                                complete[result.resultVar].scoreSheet = nextData.oldmatch[result.resultVar].scoreSheet;
                                                            }
                                                            if (nextData.oldmatch[result.resultVar].isNoMatch != undefined) {
                                                                complete[result.resultVar].isNoMatch = nextData.oldmatch[result.resultVar].isNoMatch;
                                                            }
                                                            if (nextData.oldmatch[result.resultVar].status != undefined) {
                                                                complete[result.resultVar].status = nextData.oldmatch[result.resultVar].status;
                                                            }
                                                        } else if (result.resultVar == "resultKnockout") {
                                                            complete[result.resultVar].players[0].finalPoints = nextData.oldmatch[result.resultVar].players[0].finalPoints;
                                                            complete[result.resultVar].players[0].noShow = nextData.oldmatch[result.resultVar].players[0].noShow;
                                                            complete[result.resultVar].players[0].walkover = nextData.oldmatch[result.resultVar].players[0].walkover;
                                                            console.log("nextData.oldmatch[result.resultVar].matchPhoto", nextData.oldmatch[result.resultVar].matchPhoto);
                                                            if (nextData.oldmatch[result.resultVar].matchPhoto != undefined) {
                                                                complete[result.resultVar].matchPhoto = nextData.oldmatch[result.resultVar].matchPhoto;
                                                            }
                                                            if (nextData.oldmatch[result.resultVar].scoreSheet != undefined) {
                                                                complete[result.resultVar].scoreSheet = nextData.oldmatch[result.resultVar].scoreSheet;
                                                            }
                                                            if (nextData.oldmatch[result.resultVar].isNoMatch != undefined) {
                                                                complete[result.resultVar].isNoMatch = nextData.oldmatch[result.resultVar].isNoMatch;
                                                            }
                                                            if (nextData.oldmatch[result.resultVar].status != undefined) {
                                                                complete[result.resultVar].status = nextData.oldmatch[result.resultVar].status;
                                                            }
                                                        }
                                                    } else if (matchData.isTeam == false && nextData.oldmatch[result.resultVar] && nextData.oldmatch[result.resultVar].players[1]) {
                                                        if (result.resultVar == "resultsCombat" || result.resultVar == "resultsRacquet") {
                                                            complete[result.resultVar].players[1].sets = nextData.oldmatch[result.resultVar].players[1].sets;
                                                            complete[result.resultVar].players[1].noShow = nextData.oldmatch[result.resultVar].players[1].noShow;
                                                            complete[result.resultVar].players[1].walkover = nextData.oldmatch[result.resultVar].players[1].walkover;
                                                        } else if (result.resultVar == "resultSwiss") {
                                                            complete[result.resultVar].players[1].score = nextData.oldmatch[result.resultVar].players[1].score;
                                                            complete[result.resultVar].players[1].rank = nextData.oldmatch[result.resultVar].players[1].rank;
                                                            complete[result.resultVar].players[1].noShow = nextData.oldmatch[result.resultVar].players[1].noShow;
                                                            complete[result.resultVar].players[1].walkover = nextData.oldmatch[result.resultVar].players[1].walkover;
                                                            if (nextData.oldmatch[result.resultVar].isDraw) {
                                                                complete[result.resultVar].isDraw = nextData.oldmatch[result.resultVar].isDraw;
                                                            }
                                                        } else if (result.resultVar == "resultFencing") {
                                                            complete[result.resultVar].players[1].finalPoints = nextData.oldmatch[result.resultVar].players[1].finalPoints;
                                                            complete[result.resultVar].players[1].noShow = nextData.oldmatch[result.resultVar].players[1].noShow;
                                                            complete[result.resultVar].players[1].walkover = nextData.oldmatch[result.resultVar].players[1].walkover;
                                                        } else if (result.resultVar == "resultKnockout") {
                                                            complete[result.resultVar].players[1].finalPoints = nextData.oldmatch[result.resultVar].players[1].finalPoints;
                                                            complete[result.resultVar].players[1].noShow = nextData.oldmatch[result.resultVar].players[1].noShow;
                                                            complete[result.resultVar].players[1].walkover = nextData.oldmatch[result.resultVar].players[1].walkover;
                                                        }
                                                    } else if (matchData.isTeam == false && result.resultVar == "resultQualifyingRound") {
                                                        complete[result.resultVar].player.attempts = nextData.oldmatch[result.resultVar].player.attempts;
                                                        complete[result.resultVar].player.bestAttempt = nextData.oldmatch[result.resultVar].player.bestAttempt;
                                                        complete[result.resultVar].player.noShow = nextData.oldmatch[result.resultVar].player.noShow;
                                                        complete[result.resultVar].player.result = nextData.oldmatch[result.resultVar].player.result;
                                                        console.log("nextData.oldmatch[result.resultVar].matchPhoto", nextData.oldmatch[result.resultVar].matchPhoto);
                                                        if (nextData.oldmatch[result.resultVar].matchPhoto != undefined) {
                                                            complete[result.resultVar].matchPhoto = nextData.oldmatch[result.resultVar].matchPhoto;
                                                        }
                                                        if (nextData.oldmatch[result.resultVar].scoreSheet != undefined) {
                                                            complete[result.resultVar].scoreSheet = nextData.oldmatch[result.resultVar].scoreSheet;
                                                        }
                                                        if (nextData.oldmatch[result.resultVar].isNoMatch != undefined) {
                                                            complete[result.resultVar].isNoMatch = nextData.oldmatch[result.resultVar].isNoMatch;
                                                        }
                                                        if (nextData.oldmatch[result.resultVar].status != undefined) {
                                                            complete[result.resultVar].status = nextData.oldmatch[result.resultVar].status;
                                                        }
                                                    } else if (matchData.isTeam == false && result.resultVar == "resultShooting") {
                                                        complete[result.resultVar] = nextData.oldmatch[result.resultVar];
                                                    }
                                                    if (nextData.oldmatch[result.resultVar] && nextData.oldmatch[result.resultVar].winner) {
                                                        var params = {};
                                                        param.isTeam = matchData.isTeam;
                                                        param.winner = nextData.oldmatch[result.resultVar].winner;
                                                        OldMatch.setWinner(matchData, function (err, winnerData) {
                                                            if (!winnerData.error) {
                                                                complete[result.resultVar].winner = winnerData;
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
                                                    }
                                                });
                                            } else {
                                                final.resultName = result.resultVar;
                                                final.nextData = nextData;
                                                ResultInitialize.getMyResult(matchData.sportsCategory, matchData, function (err, complete) {
                                                    // console.log("complete", complete, "players", complete[result.resultVar].players);
                                                    matchData[result.resultVar] = complete[result.resultVar];
                                                    if (nextData.oldmatch[result.resultVar]) {
                                                        var i = 0;
                                                        _.each(nextData.oldmatch[result.resultVar].players, function (n) {
                                                            if (n != null) {
                                                                if (n.time) {
                                                                    complete[result.resultVar].players[i].time = n.time;
                                                                } else {
                                                                    complete[result.resultVar].players[i].time = 0;
                                                                }
                                                                if (n.result != '') {
                                                                    complete[result.resultVar].players[i].result = n.result;
                                                                } else {
                                                                    complete[result.resultVar].players[i].result = 0;
                                                                }
                                                                if (n.laneNo != '') {
                                                                    complete[result.resultVar].players[i].laneNo = n.laneNo;
                                                                } else {
                                                                    complete[result.resultVar].players[i].laneNo = 0;
                                                                }
                                                                i++;
                                                            }
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
                    ],
                    function (err, complete) {
                        if (err) {
                            callback(err, null);
                        } else {
                            callback(null, complete);
                        }
                    });
            },
            function (err) {
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
                // console.log("n", n);
                async.waterfall([
                        function (callback) {
                            OldIndividualSport.getSportId(n.sport, function (err, complete) {
                                if (err || _.isEmpty(complete)) {
                                    var err = "Error found in Rules";
                                    callback(err, null);
                                } else {
                                    console.log("sport complete", complete);
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
                                    // console.log("found old***", found);
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
                            // console.log("final", final);
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
                                if (err) {
                                    callback(err, null);
                                } else {
                                    if (_.isEmpty(matchData)) {
                                        callback(null, []);
                                    } else {
                                        var final = {};
                                        if (matchData.sportType != "Aquatics Sports" && matchData.sportsCategory != "Athletics" && matchData.sportsCategory != "Karate" && matchData.sportsCategory != "Archery") {
                                            var result = ResultInitialize.getResultVar(matchData.sportsName, matchData.sportType);
                                        } else {
                                            var result = ResultInitialize.getResultVar(matchData.sportsCategory, matchData.sportType);
                                        }

                                        if (!(matchData[result.resultVar] == '')) {

                                            final.result = result;
                                            final.score = matchData[result.resultVar];
                                            final.nextData = nextData;
                                            callback(null, final);
                                        } else {

                                            if (result.resultVar != "resultHeat" && matchData.sportsCategory != "Karate") {
                                                final.resultName = result.resultVar;
                                                final.nextData = nextData;
                                                ResultInitialize.getMyResult(matchData.sportsName, matchData, function (err, complete) {
                                                    if (matchData.isTeam == true && nextData.oldmatch[result.resultVar]) {
                                                        if (nextData.oldmatch[result.resultVar].teams[0] && nextData.oldmatch[result.resultVar].teams[0].teamResults) {

                                                            complete[result.resultVar].teams[0].teamResults = nextData.oldmatch[result.resultVar].teams[0].teamResults;
                                                        }
                                                        if (nextData.oldmatch[result.resultVar].teams[0] && nextData.oldmatch[result.resultVar].teams[0].noShow) {
                                                            complete[result.resultVar].teams[0].noShow = nextData.oldmatch[result.resultVar].teams[0].noShow;
                                                        }
                                                        if (nextData.oldmatch[result.resultVar].teams[0] && nextData.oldmatch[result.resultVar].teams[0].walkover) {
                                                            complete[result.resultVar].teams[0].noShow = nextData.oldmatch[result.resultVar].teams[0].walkover;
                                                        }
                                                        _.each(nextData.oldmatch[result.resultVar].teams[0].players, function (n) {
                                                            complete[result.resultVar].teams[0].players.isPlaying = n.isPlaying;
                                                            complete[result.resultVar].teams[0].players.noShow = n.noShow;
                                                            complete[result.resultVar].teams[0].players.walkover = n.walkover;
                                                            complete[result.resultVar].teams[0].players.playerPoints = n.playerPoints;
                                                        });
                                                        if (nextData.oldmatch[result.resultVar].teams[1] && nextData.oldmatch[result.resultVar].teams[1].teamResults) {
                                                            complete[result.resultVar].teams[1].teamResults = nextData.oldmatch[result.resultVar].teams[1].teamResults;
                                                        }
                                                        if (nextData.oldmatch[result.resultVar].teams[1] && nextData.oldmatch[result.resultVar].teams[1].noShow) {
                                                            complete[result.resultVar].teams[1].noShow = nextData.oldmatch[result.resultVar].teams[1].noShow;
                                                        }
                                                        if (nextData.oldmatch[result.resultVar].teams[1] && nextData.oldmatch[result.resultVar].teams[1].walkover) {
                                                            complete[result.resultVar].teams[1].walkover = nextData.oldmatch[result.resultVar].teams[1].walkover;
                                                        }
                                                        if (nextData.oldmatch[result.resultVar].teams[1]) {
                                                            _.each(nextData.oldmatch[result.resultVar].teams[1].players, function (n) {
                                                                complete[result.resultVar].teams[1].players.isPlaying = n.isPlaying;
                                                                complete[result.resultVar].teams[1].players.noShow = n.noShow;
                                                                complete[result.resultVar].teams[1].players.walkover = n.walkover;
                                                                complete[result.resultVar].teams[1].players.playerPoints = n.playerPoints;
                                                            });
                                                        }
                                                        if (nextData.oldmatch[result.resultVar].matchPhoto != undefined) {
                                                            complete[result.resultVar].matchPhoto = nextData.oldmatch[result.resultVar].matchPhoto;
                                                        }
                                                        if (nextData.oldmatch[result.resultVar].scoreSheet != undefined) {
                                                            complete[result.resultVar].scoreSheet = nextData.oldmatch[result.resultVar].scoreSheet;
                                                        }
                                                        if (nextData.oldmatch[result.resultVar].isNoMatch != undefined) {
                                                            complete[result.resultVar].isNoMatch = nextData.oldmatch[result.resultVar].isNoMatch;
                                                        }
                                                        if (nextData.oldmatch[result.resultVar].status != undefined) {
                                                            complete[result.resultVar].status = nextData.oldmatch[result.resultVar].status;
                                                        }
                                                    }
                                                    console.log("nextData.oldmatch[result.resultVar].winner", nextData.oldmatch[result.resultVar]);
                                                    if (nextData.oldmatch[result.resultVar] && nextData.oldmatch[result.resultVar].winner) {
                                                        console.log("nextData.oldmatch[result.resultVar].winner", nextData.oldmatch[result.resultVar].winner);
                                                        var params = {};
                                                        param.isTeam = matchData.isTeam;
                                                        param.winner = nextData.oldmatch[result.resultVar].winner;
                                                        param.matchId = nextData.match.matchId;
                                                        OldMatch.setWinner(param, function (err, winnerData) {
                                                            if (!winnerData.error) {
                                                                complete[result.resultVar].winner = winnerData;
                                                            }
                                                            var placeholder = {};
                                                            placeholder[result.resultVar] = complete[result.resultVar];
                                                            var matchObj = {
                                                                $set: placeholder
                                                            };
                                                            final.placeholder = placeholder;
                                                            Match.update({
                                                                matchId: param.matchId
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
                                                        var placeholder = {};
                                                        placeholder[result.resultVar] = complete[result.resultVar];
                                                        var matchObj = {
                                                            $set: placeholder
                                                        };
                                                        final.placeholder = placeholder;
                                                        Match.update({
                                                            matchId: param.matchId
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
                                                    }
                                                });
                                            } else {
                                                final.resultName = result.resultVar;
                                                final.nextData = nextData;
                                                ResultInitialize.getMyResult(matchData.sportsCategory, matchData, function (err, complete) {
                                                    // console.log("complete", complete, "players", complete[result.resultVar].players);
                                                    matchData[result.resultVar] = complete[result.resultVar];
                                                    if (nextData.oldmatch[result.resultVar]) {
                                                        var i = 0;
                                                        _.each(nextData.oldmatch[result.resultVar].players, function (n) {
                                                            console.log("n", n);
                                                            if (n != null) {
                                                                if (n.time) {
                                                                    complete[result.resultVar].players[i].time = n.time;
                                                                } else {
                                                                    complete[result.resultVar].players[i].time = 0;
                                                                }
                                                                if (n.result != '') {
                                                                    complete[result.resultVar].players[i].result = n.result;
                                                                } else {
                                                                    complete[result.resultVar].players[i].result = 0;
                                                                }
                                                                if (n.laneNo != '') {
                                                                    complete[result.resultVar].players[i].laneNo = n.laneNo;
                                                                } else {
                                                                    complete[result.resultVar].players[i].laneNo = 0;
                                                                }
                                                                i++;
                                                            }
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
                        }
                    ],
                    function (err, complete) {
                        if (err) {
                            callback(err, null);
                        } else {
                            callback(null, complete);
                        }
                    });
            },
            function (err, data2) {
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

    setWinner: function (data, callback) {
        console.log("data", data);
        if (data.isTeam == true && data.winner.player != '') {
            TeamSport.findOne({
                oldId: ObjectId(data.winner.player)
            }).lean().exec(function (err, teamData) {
                if (err || _.isEmpty(teamData)) {
                    callback(null, {
                        error: "No team Found"
                    });
                } else {
                    var winner = {};
                    winner.player = teamData._id;
                    if (data.winner.reason) {
                        winner.reason = data.winner.reason;
                    }
                    callback(null, winner);
                }
            });
        } else if (data.isTeam == false && data.winner.player != '' && data.winner.opponentsSingle != '') {
            async.waterfall([
                function (callback) {
                    Athelete.findOne({
                        oldId: ObjectId(data.winner.player)
                    }).lean().exec(function (err, playerData) {
                        if (err || _.isEmpty(playerData)) {
                            callback(null, {
                                error: "No team Found"
                            });
                        } else {
                            callback(null, playerData);
                        }
                    });
                },
                function (playerData, callback) {
                    IndividualSport.findOne({
                        oldId: ObjectId(data.winner.opponentsSingle)
                    }).lean().exec(function (err, individualData) {
                        if (err || _.isEmpty(individualData)) {
                            callback(null, {
                                error: "No team Found"
                            });
                        } else {
                            var winner = {};
                            winner.opponentsSingle = individualData._id;
                            winner.player = playerData._id;
                            if (data.winner.reason) {
                                winner.reason = data.winner.reason;
                            }
                            callback(null, winner);
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
        } else {
            callback(null, {
                error: "No team Found"
            });
        }
    }

};
module.exports = _.assign(module.exports, exports, model);