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
                                    error: "No data Data",
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
                            }, formdata).lean().exec(function (err, updateData) {
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
                            }, formdata).lean().exec(function (err, updateData) {
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
                                    error: "No data Data",
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
                                    error: "No data Data",
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
    }

};
module.exports = _.assign(module.exports, exports, model);