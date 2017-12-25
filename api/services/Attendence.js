var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate')(mongoose);
var uniqueValidator = require('mongoose-unique-validator');
var timestamps = require('mongoose-timestamp');
var validators = require('mongoose-validators');
var monguurl = require('monguurl');
var autoIncrement = require('mongoose-auto-increment');
var objectid = require("mongodb").ObjectID;
var moment = require('moment');
var request = require("request");
autoIncrement.initialize(mongoose);

var schema = new Schema({
    sport: {
        type: Schema.Types.ObjectId,
        ref: 'Sport'
    },
    attendenceListIndividual: [{
        athleteId: {
            type: Schema.Types.ObjectId,
            ref: 'Athelete'
        },
        athleteName: String,
        sfaId: String,
        schoolName: String,
        attendance: Boolean,
        opponentSingle: {
            type: Schema.Types.ObjectId,
            ref: 'IndividualSport'
        },
    }],
    attendenceListTeam: [{
        team: {
            type: Schema.Types.ObjectId,
            ref: 'TeamSport'
        },
        teamName: String,
        teamId: String,
        schoolName: String,
        players: [{
            sfaId: String,
            playerName: String
        }],
        attendance: Boolean,
    }]
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('Attendence', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {

    getAthleteForAttendence: function (data, callback) {
        async.waterfall([
                function (callback) {
                    var test = {};
                    test._id = data.sport;
                    Sport.getOne(test, function (err, found) {
                        if (err || _.isEmpty(found)) {
                            err = "Sport,Event,AgeGroup,Gender may have wrong values";
                            callback(null, {
                                error: err,
                                success: found
                            });
                        } else {
                            console.log("found----->", found);
                            callback(null, found);
                        }
                    });
                },
                function (found, callback) {
                    if (found.error) {
                        callback(null, found);
                    } else if (found.sportslist.sportsListSubCategory.isTeam == true) {
                        StudentTeam.find({
                            sport: data.sport
                        }).deepPopulate("teamId studentId").lean().exec(function (err, studentData) {
                            if (err || _.isEmpty(studentData)) {
                                callback(null, {
                                    error: "No Data Found",
                                    data: data
                                });
                            } else {
                                var complete = {};
                                complete.isTeam = true;
                                complete.attendenceListTeam = [];
                                var teamData = _.groupBy(studentData, 'teamId.name');
                                _.each(teamData, function (teams) {
                                    var team = {};
                                    team.team = teams[0].teamId._id;
                                    team.teamId = teams[0].teamId.teamId;
                                    team.teamName = teams[0].teamId.name;
                                    team.schoolName = teams[0].teamId.schoolName;
                                    team.players = [];
                                    _.each(teams, function (player) {
                                        console.log("player", player);
                                        var member = {};
                                        member.sfaId = player.studentId.sfaId;
                                        if (player.studentId.middleName) {
                                            member.playerName = player.studentId.firstName + " " + player.studentId.middleName + " " + player.studentId.surname;
                                        } else {
                                            member.playerName = player.studentId.firstName + " " + player.studentId.surname;
                                        }
                                        team.players.push(member);
                                    });
                                    team.attendance = false;
                                    complete.attendenceListTeam.push(team);
                                });
                                callback(null, complete);
                            }
                        });
                    } else {
                        IndividualSport.find({
                            sport: data.sport
                        }).deepPopulate("athleteId.school").lean().exec(function (err, individualData) {
                            if (err || _.isEmpty(individualData)) {
                                callback(null, {
                                    error: "No data teamData",
                                    data: data
                                });
                            } else {
                                var complete = {};
                                complete.isTeam = false;
                                complete.attendenceListIndividual = [];
                                _.each(individualData, function (n) {
                                    var single = {};
                                    single.athleteId = n.athleteId._id;
                                    if (n.middleName) {
                                        single.athleteName = n.athleteId.firstName + " " + n.athleteId.middleName + " " + n.athleteId.surname;
                                    } else {
                                        single.athleteName = n.athleteId.firstName + " " + n.athleteId.surname;
                                    }
                                    single.sfaId = n.athleteId.sfaId;
                                    if (n.athleteId.atheleteSchoolName) {
                                        single.schoolName = n.athleteId.atheleteSchoolName;
                                    } else {
                                        single.schoolName = n.athleteId.school.name;
                                    }
                                    single.opponentSingle = n._id;
                                    single.attendance = false;
                                    complete.attendenceListIndividual.push(single);
                                });
                                callback(null, complete);
                            }
                        });
                    }
                },
                function (complete, callback) {
                    if (complete.error) {
                        callback(null, complete);
                    } else {
                        Attendence.findOne({
                            sport: objectid(data.sport)
                        }).lean().exec(function (err, attendenceData) {
                            if (err || _.isEmpty(attendenceData)) {
                                callback(null, complete);
                            } else {
                                if (complete.isTeam == true) {
                                    var common = {};
                                    common.sport = attendenceData.sport;
                                    common.isTeam = true;
                                    common.attendenceListTeam = attendenceData.attendenceListTeam;

                                } else {
                                    var common = {};
                                    common.sport = attendenceData.sport;
                                    common.isTeam = false;
                                    common.attendenceListIndividual = attendenceData.attendenceListIndividual;
                                }
                                callback(null, common);
                            }
                        });
                    }
                },
            ],
            function (err, data2) {
                if (err) {
                    callback(null, []);
                } else if (data2) {
                    if (_.isEmpty(data2)) {
                        callback(null, data2);
                    } else {
                        callback(null, data2);
                    }
                }
            });
    },

    saveAttendence: function (data, callback) {
        async.waterfall([
                function (callback) {
                    // console.log("data", data);
                    Attendence.findOne({
                        sport: objectid(data.sport)
                    }).lean().exec(function (err, found) {
                        if (err) {
                            callback(null, {
                                error: "data not found"
                            });
                        } else if (found == null) {
                            callback(null, []);
                        } else {
                            callback(null, found);
                        }
                    });
                },
                function (found, callback) {
                    console.log("found", found);
                    if (found.error) {
                        callback(null, found);
                    } else if (_.isEmpty(found)) {
                        if (data.isTeam == true) {
                            var formdata = {};
                            formdata.sport = objectid(data.sport);
                            formdata.attendenceListTeam = data.attendenceListTeam;
                        } else {
                            var formdata = {};
                            formdata.sport = objectid(data.sport);
                            formdata.attendenceListIndividual = data.attendenceListIndividual;
                        }
                        Attendence.saveData(formdata, function (err, complete) {
                            if (err || _.isEmpty(complete)) {
                                callback(err, null);
                            } else {
                                callback(null, complete);
                            }
                        });
                    } else {
                        if (data.isTeam == true) {
                            var formdata = {
                                $set: {
                                    attendenceListTeam: data.attendenceListTeam
                                }
                            };
                            Attendence.update({
                                sport: objectid(data.sport)
                            }, formdata).exec(function (err, updateData) {
                                if (err || _.isEmpty(updateData)) {
                                    callback(null, {
                                        error: "No data found!",
                                        success: data
                                    });
                                } else {
                                    callback(null, updateData);
                                }
                            });
                        } else {
                            console.log("individual", data.attendenceListIndividual);
                            var formdata = {
                                $set: {
                                    attendenceListIndividual: data.attendenceListIndividual
                                }
                            };
                            Attendence.update({
                                sport: objectid(data.sport)
                            }, formdata).exec(function (err, updateData) {
                                if (err || _.isEmpty(updateData)) {
                                    callback(null, {
                                        error: "No data found!",
                                        success: data
                                    });
                                } else {
                                    callback(null, updateData);
                                }
                            });
                        }
                    }
                }
            ],
            function (err, data2) {
                if (err) {
                    callback(null, []);
                } else if (data2) {
                    if (_.isEmpty(data2)) {
                        callback(null, data2);
                    } else {
                        callback(null, data2);
                    }
                }
            });

    },

    getPlayersMatchSelection: function (data, callback) {
        async.waterfall([
                function (callback) {
                    var test = {};
                    test._id = data.sport;
                    Sport.getOne(test, function (err, found) {
                        if (err || _.isEmpty(found)) {
                            err = "Sport,Event,AgeGroup,Gender may have wrong values";
                            callback(null, {
                                error: err,
                                success: found
                            });
                        } else {
                            callback(null, found);
                        }
                    });
                },
                function (found, callback) {
                    if (found.error) {
                        callback(null, found);
                    } else if (found.sportslist.sportsListSubCategory.isTeam == true) {
                        Attendence.findOne({
                            sport: data.sport
                        }).lean().exec(function (err, teamData) {
                            if (err || _.isEmpty(teamData)) {
                                callback(null, {
                                    error: "No Data found",
                                    data: data
                                });
                            } else {
                                var team = _.filter(teamData.attendenceListTeam, function (o) {
                                    return o.attendance == true;
                                });
                                callback(null, team);
                            }
                        });
                    } else {
                        Attendence.findOne({
                            sport: data.sport
                        }).lean().exec(function (err, individualData) {
                            if (err || _.isEmpty(individualData)) {
                                callback(null, {
                                    error: "No Data Found",
                                    data: data
                                });
                            } else {
                                var single = _.filter(individualData.attendenceListIndividual, function (o) {
                                    return o.attendance == true;
                                });
                                callback(null, single);
                            }
                        });
                    }
                },
            ],
            function (err, data2) {
                if (err) {
                    callback(null, []);
                } else if (data2) {
                    if (_.isEmpty(data2)) {
                        callback(null, data2);
                    } else {
                        callback(null, data2);
                    }
                }
            });
    },

    createMatchHeat: function (data, callback) {
        async.waterfall([
                function (callback) {
                    Attendence.updateMatchPrefix(data, function (err, found) {
                        if (err || _.isEmpty(found)) {
                            err = "Headers may have wrong values";
                            callback(null, {
                                error: err,
                                success: found
                            });
                        } else {
                            console.log("found----->", found);
                            callback(null, found);
                        }
                    });
                },
                function (found, callback) {
                    Match.findOne({
                        sport: objectid(data.sport)
                    }).sort({
                        createdAt: -1
                    }).lean().exec(function (err, matchData) {
                        if (err) {
                            callback(null, {
                                error: "No data Found"
                            });
                        } else if (_.isEmpty(matchData)) {
                            var formData = {};
                            formData.sport = data.sport;
                            if (!found.matchPrefix) {
                                formData.matchId = data.prefix;
                            } else {
                                formData.matchId = found.matchPrefix;
                            }
                            formData.round = data.round;
                            formData.heatNo = 1;
                            callback(null, formData);
                        } else {
                            var formData = {};
                            formData.sport = data.sport;
                            if (!found.matchPrefix) {
                                formData.matchId = data.prefix;
                            } else {
                                formData.matchId = found.matchPrefix;
                            }
                            if (data.round) {
                                formData.round = data.round;
                                if (data.round != matchData.round) {
                                    formData.heatNo = 1;
                                } else {
                                    formData.heatNo = ++matchData.heatNo;
                                }
                            } else {
                                formData.round = matchData.round;
                                formData.heatNo = ++matchData.heatNo;
                            }
                            callback(null, formData);
                        }
                    });
                },
                function (formData, callback) {
                    Match.saveMatch(formData, function (err, complete) {
                        if (err || _.isEmpty(complete)) {
                            callback(err, null);
                        } else {
                            callback(null, complete);
                        }
                    });
                },
            ],
            function (err, data2) {
                if (err) {
                    callback(null, []);
                } else if (data2) {
                    if (_.isEmpty(data2)) {
                        callback(null, data2);
                    } else {
                        callback(null, data2);
                    }
                }
            });
    },

    createMatchQualifying: function (data, callback) {
        async.waterfall([
                function (callback) {
                    Attendence.updateMatchPrefix(data, function (err, found) {
                        if (err || _.isEmpty(found)) {
                            err = "Headers may have wrong values";
                            callback(null, {
                                error: err,
                                success: found
                            });
                        } else {
                            console.log("found----->", found);
                            callback(null, found);
                        }
                    });
                },
                function (found, callback) {
                    Attendence.getPlayersMatchSelection(data, function (err, playersData) {
                        if (err || _.isEmpty(playersData)) {
                            err = "Sport,Event,AgeGroup,Gender may have wrong values";
                            callback(null, {
                                error: err,
                                success: playersData
                            });
                        } else {
                            console.log("playersData----->", playersData);
                            var final = {};
                            final.players = playersData;
                            final.found = found;
                            callback(null, final);
                        }
                    });
                },
                function (final, callback) {
                    async.eachSeries(final.players, function (n, callback) {
                        Match.findOne({
                            sport: objectid(data.sport)
                        }).sort({
                            createdAt: -1
                        }).lean().exec(function (err, matchData) {
                            if (err) {
                                callback(null, {
                                    error: "No data Found"
                                });
                            } else if (_.isEmpty(matchData)) {
                                var formData = {};
                                formData.sport = data.sport;
                                if (!final.found.matchPrefix) {
                                    formData.matchId = data.prefix;
                                } else {
                                    formData.matchId = final.found.matchPrefix;
                                }
                                formData.round = data.round;
                                formData.opponentSingle = [];
                                formData.opponentSingle.push(n.opponentSingle);
                                Match.saveMatch(formData, function (err, complete) {
                                    if (err || _.isEmpty(complete)) {
                                        callback(err, null);
                                    } else {
                                        callback(null, complete);
                                    }
                                });
                            } else {
                                var formData = {};
                                formData.sport = data.sport;
                                if (!final.found.matchPrefix) {
                                    formData.matchId = data.prefix;
                                } else {
                                    formData.matchId = final.found.matchPrefix;
                                }
                                if (data.round) {
                                    formData.round = data.round;
                                } else {
                                    formData.round = matchData.round;
                                }
                                formData.opponentSingle = [];
                                formData.opponentSingle.push(n.opponentSingle);
                                Match.saveMatch(formData, function (err, complete) {
                                    if (err || _.isEmpty(complete)) {
                                        callback(err, null);
                                    } else {
                                        callback(null, complete);
                                    }
                                });
                            }
                        });

                    });
                },
            ],
            function (err, data2) {
                if (err) {
                    callback(null, []);
                } else if (data2) {
                    if (_.isEmpty(data2)) {
                        callback(null, data2);
                    } else {
                        callback(null, data2);
                    }
                }
            });

    },

    updateMatchPrefix: function (data, callback) {
        async.waterfall([
                function (callback) {
                    var test = {};
                    test._id = objectid(data.sport);
                    Sport.getOne(test, function (err, found) {
                        if (err || _.isEmpty(found)) {
                            err = "Sport,Event,AgeGroup,Gender may have wrong values";
                            callback(null, {
                                error: err,
                                success: found
                            });
                        } else {
                            console.log("found----->", found);
                            callback(null, found);
                        }
                    });
                },
                function (found, callback) {
                    if (found.error) {
                        callback(null, found);
                    } else if (found.matchPrefix) {
                        callback(null, found);
                    } else {
                        var formData = {
                            $set: {
                                matchPrefix: data.prefix
                            }
                        };
                        Sport.update({
                            _id: objectid(data.sport)
                        }, formData).exec(function (err, updateData) {
                            if (err || _.isEmpty(updateData)) {
                                callback(null, {
                                    error: "No data found!",
                                    success: data
                                });
                            } else {
                                callback(null, found);
                            }
                        });
                    }
                },
            ],
            function (err, data2) {
                if (err) {
                    callback(null, []);
                } else if (data2) {
                    if (_.isEmpty(data2)) {
                        callback(null, data2);
                    } else {
                        callback(null, data2);
                    }
                }
            });
    },

    addPlayersToMatchHeat: function (data, callback) {
        async.waterfall([
                function (callback) {
                    var test = {};
                    test._id = data.sport;
                    Sport.getOne(test, function (err, found) {
                        if (err || _.isEmpty(found)) {
                            err = "Sport,Event,AgeGroup,Gender may have wrong values";
                            callback(null, {
                                error: err,
                                success: found
                            });
                        } else {
                            callback(null, found);
                        }
                    });
                },
                function (found, callback) {
                    if (found.error) {
                        callback(null, found);
                    } else if (found.sportslist.sportsListSubCategory.isTeam == true) {
                        Match.findOne({
                            matchId: data.matchId
                        }).exec(function (err, matchData) {
                            if (err || _.isEmpty(matchData)) {
                                callback(null, {
                                    error: "No data found!",
                                    success: data
                                });
                            } else {
                                var final = {};
                                final.opponents = matchData.opponentsTeam;
                                if (matchData.resultHeat) {
                                    final.teams = matchData.resultHeat.teams;
                                }
                                final.isTeam = true;
                                callback(null, final);
                            }
                        });
                    } else {
                        Match.findOne({
                            matchId: data.matchId
                        }).exec(function (err, matchData) {
                            if (err || _.isEmpty(matchData)) {
                                callback(null, {
                                    error: "No data found!",
                                    success: data
                                });
                            } else {
                                var final = {};
                                final.opponents = matchData.opponentsSingle;
                                if (matchData.resultHeat) {
                                    final.players = matchData.resultHeat.players;
                                }
                                final.isTeam = false;
                                callback(null, final);
                            }
                        });
                    }
                },
                function (final, callback) {
                    if (final.error) {
                        callback(null, final);
                    } else if (final.isTeam == true) {
                        var opponets = final.opponets;
                        var result = {};
                        result.teams = final.teams;
                        _.each(data.players, function (n) {
                            opponets.push(n.team);
                            var player = {};
                            player.id = n.team;
                            player.laneNo = n.laneNo;
                            result.teams.push(player);
                        });
                        if (!_.isEmpty(final.teams)) {
                            var players = [].concat.apply([], [
                                final.teams,
                                result.teams,
                            ]);
                            result.players = players;
                        }
                        var formData = {
                            $set: {
                                opponentsTeam: opponets,
                                resultHeat: result

                            }
                        };
                        Match.update({
                            matchId: data.matchId
                        }, formData).exec(function (err, updateData) {
                            if (err || _.isEmpty(updateData)) {
                                callback(null, {
                                    error: "No data found!",
                                    success: data
                                });
                            } else {
                                callback(null, updateData);
                            }
                        });
                    } else {
                        var opponets = final.opponents;
                        var result = {};
                        result.players = [];
                        _.each(data.players, function (n) {
                            opponets.push(n.opponentSingle);
                            var player = {};
                            player.id = n.opponentSingle;
                            player.laneNo = n.laneNo;
                            result.players.push(player);
                        });
                        if (!_.isEmpty(final.players)) {
                            var players = [].concat.apply([], [
                                final.players,
                                result.players,
                            ]);
                            result.players = players;
                        }
                        var formData = {
                            $set: {
                                opponentsSingle: opponets,
                                resultHeat: result
                            }
                        };
                        Match.update({
                            matchId: data.matchId
                        }, formData).exec(function (err, updateData) {
                            if (err || _.isEmpty(updateData)) {
                                callback(null, {
                                    error: "No data found!",
                                    success: data
                                });
                            } else {
                                callback(null, updateData);
                            }
                        });
                    }
                }
            ],
            function (err, data2) {
                if (err) {
                    callback(null, []);
                } else if (data2) {
                    if (_.isEmpty(data2)) {
                        callback(null, data2);
                    } else {
                        callback(null, data2);
                    }
                }
            });
    },



};
module.exports = _.assign(module.exports, exports, model);