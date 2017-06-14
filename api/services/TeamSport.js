var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate')(mongoose);
var uniqueValidator = require('mongoose-unique-validator');
var timestamps = require('mongoose-timestamp');
var validators = require('mongoose-validators');
var monguurl = require('monguurl');
var md5 = require('md5');
var moment = require('moment');
var autoIncrement = require('mongoose-auto-increment');
var objectid = require("mongodb").ObjectID;
autoIncrement.initialize(mongoose);
require('mongoose-middleware').initialize(mongoose);
var schema = new Schema({
    autoID: {
        type: Number,
        default: ""
    },
    teamId: String,
    name: {
        type: String,
    },
    sport: {
        type: Schema.Types.ObjectId,
        ref: 'Sport',
        index: true
    },
    studentTeam: [{
        type: Schema.Types.ObjectId,
        ref: 'StudentTeam',
        index: true
    }],
    school: {
        type: Schema.Types.ObjectId,
        ref: 'School',
        index: true
    },
    nominatedName: String,
    nominatedSchoolName: String,
    nominatedContactDetails: String,
    nominatedEmailId: String,
    isVideoAnalysis: Boolean
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
schema.plugin(autoIncrement.plugin, {
    model: 'TeamSport',
    field: 'autoID',
    startAt: 1,
    incrementBy: 1
});
module.exports = mongoose.model('TeamSport', schema);
var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {


    saveInTeam: function (data, callback) {
        async.waterfall([
                function (callback) {
                    TeamSport.findOne().sort({
                        autoID: -1
                    }).exec(function (err, team) {
                        if (err) {
                            callback(err, null);
                        } else if (_.isEmpty(team)) {
                            var year = new Date().getFullYear().toString().substr(2, 2);
                            var teamid = "M" + "T" + year + 1;
                            callback(null, teamid);
                        } else {
                            var year = new Date().getFullYear().toString().substr(2, 2);
                            var teamid = "M" + "T" + year + ++team.autoID;
                            callback(null, teamid);

                        }
                    });
                },
                function (teamid, callback) {
                    data.teamId = teamid;
                    TeamSport.saveData(data, function (err, teamData) {
                        console.log("teamData", teamData);
                        if (err) {
                            console.log("err", err);
                            callback("There was an error ", null);
                        } else {
                            if (_.isEmpty(teamData)) {
                                callback("No data found", null);
                            } else {
                                callback(null, teamData);
                            }
                        }
                    });
                }
            ],
            function (err, data2) {
                if (err) {
                    console.log(err);
                    callback(null, []);
                } else if (data2) {
                    if (_.isEmpty(data2)) {
                        callback(null, []);
                    } else {
                        callback(null, data2);
                    }
                }
            });
    },

    // Team Confirm function
    teamConfirm: function (data, callback) { // Data -> array of (StudentID, Sport,isCaptain,isGoalkeeper)
        //      Waterfall
        //          1. CreateTeamSportWithSchool 
        //          2. async.each(data,fuction() { SaveInTeam })
        //          3. FindAthelete $in ID
        //          4. Send Emails     
        var team = {};
        team.name = data.name;
        team.sport = data.sport;
        team.studentTeam = [];
        team.school = data.school;
        async.waterfall([
            function (callback) {
                TeamSport.saveInTeam(team, function (err, complete) {
                    if (err) {
                        callback(err, null);
                    } else {
                        if (_.isEmpty(complete)) {
                            callback(null, []);
                        } else {
                            callback(null, complete)
                        }
                    }
                });
            },
            function (complete, callback) {
                TeamSport.createStudentTeam(complete, data, function (err, complete1) {
                    if (err) {
                        callback(err, null);
                    } else {
                        if (_.isEmpty(complete1)) {
                            callback(null, []);
                        } else {
                            callback(null, complete1)
                        }
                    }
                });

            },
            function (complete1, callback) {
                Registration.findOne({
                    _id: data.school
                }).exec(function (err, found) {
                    if (err) {
                        callback(err, null);
                    } else if (_.isEmpty(found)) {
                        callback(null, "Data is empty");
                    } else {
                        var emailData = {};
                        emailData.from = "info@sfanow.in";
                        emailData.email = found.email;
                        emailData.filename = "teamSport.ejs";
                        emailData.student = complete1.atheleteName;
                        emailData.subject = "SFA: subject is missing";
                        console.log("emaildata", emailData);

                        Config.email(emailData, function (err, emailRespo) {
                            if (err) {
                                console.log(err);
                                callback(null, err);
                            } else if (emailRespo) {
                                callback(null, emailRespo);
                            } else {
                                callback(null, "Invalid data");
                            }
                        });
                    }
                });

            }
        ], function (err, data2) {
            if (err) {
                console.log(err);
                callback(null, []);
            } else if (data2) {
                if (_.isEmpty(data2)) {
                    callback(null, []);
                } else {
                    callback(null, data2);
                }
            }
        });
    },

    createStudentTeam: function (team, data, callback) {
        async.each(data.athleteTeam, function (n, callback) {
            async.waterfall([
                    function (callback) {
                        var teamStudent = {};
                        teamStudent.teamId = team._id,
                            teamStudent.sport = data.sport;
                        teamStudent.studentId = n.studentId; //individual array studentId
                        teamStudent.isCaptain = n.isCaptain;
                        teamStudent.isGoalKeeper = n.isGoalKeeper;
                        teamStudent.perSportUniqueId = team._id + data.sport;

                        StudentTeam.saveInTeam(team, function (err, saveData) {
                            if (err) {
                                callback(err, null);
                            } else {
                                if (_.isEmpty(saveData)) {
                                    callback(null, []);
                                } else {
                                    callback(null, saveData)
                                }
                            }
                        });
                    },
                    function (saveData, callback) {
                        Athelete.findOne({
                            _id: saveData.studentId
                        }).exec(function (err, found) { //finds all athelete
                            if (err) {
                                callback(err, null);
                            } else if (_.isEmpty(found)) {
                                callback(null, "Data is empty");
                            } else {
                                callback(null, found);
                            }
                        });
                    },
                    function (found, callback) {
                        var emailData = {};
                        var atheleteName = [];
                        var name = found.firstName + found.middleName + found.surname;
                        atheleteName.push(name);
                        emailData.from = "info@sfanow.in";
                        emailData.email = found.email;
                        emailData.filename = "StudentTeam.ejs";
                        emailData.subject = "SFA: subject is missing";
                        console.log("emaildata", emailData);

                        Config.email(emailData, function (err, emailRespo) {
                            if (err) {
                                console.log(err);
                                callback(null, err);
                            } else if (emailRespo) {
                                callback(null, emailRespo);
                            } else {
                                callback(null, atheleteName);
                            }
                        });
                    }

                ],
                function (err, data2) {
                    if (err) {
                        console.log(err);
                        callback(null, []);
                    } else if (data2) {
                        if (_.isEmpty(data2)) {
                            callback(null, []);
                        } else {
                            callback(null, atheleteName);
                        }
                    }
                });
        }, function (err) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else {
                callback(null, atheleteName);
            }
        });
    },
};
module.exports = _.assign(module.exports, exports, model);