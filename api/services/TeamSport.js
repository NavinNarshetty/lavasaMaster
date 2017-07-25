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
        ref: 'Registration',
        index: true
    },
    schoolName: String,
    createdBy: String,
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

    // Team Confirm function (save in teamSport,StudentTeam and triggers email to all)
    teamConfirm: function (data, callback) { // Data -> array of (StudentID, Sport,isCaptain,isGoalkeeper)
        //      Waterfall
        //          1. CreateTeamSportWithSchool 
        //          2. async.each(data,fuction() { SaveInTeam })
        //          3. FindAthelete $in ID
        //          4. Send Emails  
        var sport = data.name;
        var index = sport.indexOf("-");
        var tempName = sport.slice(++index, sport.length);
        var indexNext = tempName.indexOf("-");
        data.linkSportName = tempName.slice(0, indexNext);
        console.log("data", data);
        async.waterfall([
                function (callback) {
                    var team = {};
                    team.name = data.name;
                    team.sport = data.sport;
                    team.studentTeam = [];
                    team.school = data.school;
                    team.schoolName = data.schoolName;
                    team.createdBy = data.createdBy;
                    if (data.nominatedName) {
                        team.nominatedName = data.nominatedName;
                    }
                    if (data.nominatedSchoolName) {
                        team.nominatedSchoolName = data.nominatedSchoolName;
                    }
                    if (data.nominatedContactDetails) {
                        team.nominatedContactDetails = data.nominatedContactDetails;
                    }
                    if (data.nominatedEmailId) {
                        team.nominatedEmailId = data.nominatedEmailId;
                    }
                    if (data.isVideoAnalysis) {
                        team.isVideoAnalysis = data.isVideoAnalysis;
                    }
                    callback(null, team);
                },
                function (team, callback) {
                    TeamSport.saveInTeam(team, function (err, complete) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(complete)) {
                                callback(null, []);
                            } else {
                                callback(null, complete);
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
                                var total = {};
                                total.teamSport = complete;
                                total.studentTeam = complete1;
                                callback(null, total);
                            }
                        }
                    });
                },
                function (total, callback) {
                    if (data.schoolToken) {
                        TeamSport.schoolTeamMailers(data, total, function (err, final) {
                            if (err) {
                                callback(err, null);
                            } else {
                                if (_.isEmpty(final)) {
                                    callback(null, []);
                                } else {
                                    callback(null, final);
                                }
                            }
                        });
                    } else if (data.athleteToken) {
                        TeamSport.atheleteTeamMailers(data, total, function (err, final) {
                            if (err) {
                                callback(err, null);
                            } else {
                                if (_.isEmpty(final)) {
                                    callback(null, []);
                                } else {
                                    callback(null, final);
                                }
                            }
                        });

                    }
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

    teamConfirmAthlete: function (data, callback) {
        async.waterfall([
                function (callback) {
                    Athelete.findOne({
                        accessToken: data.athleteToken
                    }).exec(function (err, found) {
                        if (_.isEmpty(found)) {
                            callback(null, []);
                        } else {
                            data.athleteSFA = found.sfaId;
                            callback(null, found);
                        }
                    });
                },
                function (found, callback) {
                    if (found.atheleteSchoolName) {
                        var schoolName = {};
                        schoolName.name = found.atheleteSchoolName;
                        data.schoolName = found.atheleteSchoolName;
                        callback(null, schoolName);
                    } else {
                        School.findOne({
                            _id: found.school
                        }).exec(function (err, schoolData) {
                            if (_.isEmpty(schoolData)) {
                                callback(null, []);
                            } else {
                                var schoolName = {};
                                schoolName.name = schoolData.name;
                                data.schoolName = schoolData.name;
                                callback(null, schoolName);
                            }
                        });
                    }

                },
                function (schoolName, callback) {
                    Registration.findOne({
                        schoolName: schoolName.name
                    }).exec(function (err, complete) {
                        if (_.isEmpty(complete)) {
                            data.school = undefined;
                            TeamSport.teamConfirm(data, function (err, complete1) {
                                if (err) {
                                    callback(err, null);
                                } else {
                                    callback(null, complete1);
                                }
                            });
                        } else {
                            data.school = complete._id;
                            TeamSport.teamConfirm(data, function (err, complete1) {
                                if (err) {
                                    callback(err, null);
                                } else {
                                    callback(null, complete1);
                                }
                            });
                        }
                    });
                },
            ],
            function (err, data2) {
                if (err) {
                    console.log(err);
                    callback(err, null);
                } else if (data2) {
                    if (_.isEmpty(data2)) {
                        callback("Max Team Created", null);
                    } else {
                        callback(null, data2);
                    }
                }
            });
    },

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

    createStudentTeam: function (team, data, callback) {
        var atheleteName = [];
        var i = 0;
        async.eachSeries(data.athleteTeam, function (n, callback) {
            async.waterfall([
                    function (callback) {
                        var teamStudent = {};
                        teamStudent.teamId = team._id,
                            teamStudent.sport = data.sport;
                        teamStudent.studentId = n.studentId; //individual array studentId
                        teamStudent.isCaptain = n.isCaptain;
                        teamStudent.isGoalKeeper = n.isGoalKeeper;
                        teamStudent.perSportUniqueId = team._id + data.sport;

                        StudentTeam.saveInTeam(teamStudent, function (err, saveData) {
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
                    function (saveData, callback) {
                        Athelete.findOne({
                            _id: saveData.studentId
                        }).exec(function (err, found) { //finds all athelete
                            if (err) {
                                callback(err, null);
                            } else if (_.isEmpty(found)) {
                                callback(null, "Data is empty");
                            } else {
                                console.log(" found athlete");
                                var athleteInfo = {};
                                athleteInfo.srno = ++i;
                                if (found.middleName) {
                                    athleteInfo.name = found.firstName + ' ' + found.middleName + ' ' + found.surname;
                                } else {
                                    athleteInfo.name = found.firstName + ' ' + found.surname;
                                }
                                athleteInfo.email = found.email;
                                athleteInfo.sfaid = found.sfaId;
                                athleteInfo.isCaptain = n.isCaptain;
                                athleteInfo.isGoalKeeper = n.isGoalKeeper;
                                atheleteName.push(athleteInfo);
                                callback(null, atheleteName);
                            }
                        });
                    },
                ],
                function (err, atheleteName) {
                    if (err) {
                        console.log(err);
                        callback(null, []);
                    } else if (atheleteName) {
                        if (_.isEmpty(atheleteName)) {
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
                console.log("array", atheleteName);
                callback(null, atheleteName);
            }
        });
    },

    schoolTeamMailers: function (data, total, callback) {
        Registration.findOne({
            sfaID: data.schoolSFA,
        }).exec(function (err, found) {
            if (err) {
                callback(err, null);
            } else if (_.isEmpty(found)) {
                callback(null, "Data is empty");
            } else {
                async.parallel([
                    //school email
                    function (callback) {
                        console.log("total", total);
                        var emailData = {};
                        emailData.schoolName = found.schoolName;
                        emailData.sportName = data.name;
                        emailData.schoolSFA = found.sfaID;
                        emailData.from = "info@sfanow.in";
                        emailData.email = found.email;
                        emailData.filename = "teamSport.ejs";
                        emailData.teamId = total.teamSport.teamId;
                        emailData.students = total.studentTeam;
                        emailData.linkSportName = data.linkSportName;
                        emailData.subject = "SFA: Successful Team Sport Registered";
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

                    },
                    //school sms
                    function (callback) {
                        var smsData = {};
                        smsData.mobile = found.mobile;
                        smsData.content = "SFA: Thank you for registering for Team Sports at SFA 2017. For Further details Please check your registered email ID.";
                        console.log("smsdata", smsData);
                        Config.sendSms(smsData, function (err, smsRespo) {
                            if (err) {
                                console.log(err);
                                callback(err, null);
                            } else if (smsRespo) {
                                console.log(smsRespo, "sms sent");
                                callback(null, smsRespo);
                            } else {
                                callback(null, "Invalid data");
                            }
                        });
                    },
                    //athlete email
                    function (callback) {
                        data.emailfile = "studentmailTeam.ejs";
                        data.schoolSFA = found.sfaID;
                        data.schoolName = found.schoolName;
                        TeamSport.athleteMailers(data, total, function (err, mailData) {
                            if (err) {
                                callback(err, null);
                            } else {
                                if (_.isEmpty(mailData)) {
                                    callback(null, []);
                                } else {
                                    callback(null, mailData);
                                }
                            }
                        });

                    },
                ], function (err, data3) {
                    if (err) {
                        console.log(err);
                        callback(err, null);
                    } else {
                        if (_.isEmpty(data3)) {
                            callback(null, []);
                        } else {
                            callback(null, data3);
                        }
                    }
                });
            }
        });
    },

    atheleteTeamMailers: function (data, total, callback) {
        async.waterfall([
                function (callback) {
                    Athelete.findOne({
                        sfaId: data.athleteSFA,
                    }).exec(function (err, found) {
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
                    if (found.atheleteSchoolName) {
                        Registration.findOne({
                            schoolName: found.atheleteSchoolName
                        }).exec(function (err, schoolData) {
                            if (err) {
                                callback(err, null);
                            } else if (_.isEmpty(schoolData)) {
                                data.mobile = found.mobile;
                                data.schoolName = found.atheleteSchoolName;
                                data.schoolSFA = "Unregistered";
                                data.emailfile = "studentTeamUnregister.ejs";
                                callback(null, data);

                            } else {
                                data.mobile = found.mobile;
                                data.schoolName = schoolData.schoolName;
                                data.schoolSFA = schoolData.sfaID;
                                data.emailfile = "studentTeam.ejs";
                                callback(null, data);
                            }
                        });
                    } else {
                        School.findOne({
                            _id: found.school,
                        }).exec(function (err, schoolData) {
                            if (err) {
                                callback(err, null);
                            } else if (_.isEmpty(schoolData)) {
                                callback(null, "Data is empty");
                            } else {
                                Registration.findOne({
                                    schoolName: schoolData.name
                                }).exec(function (err, schoolData) {
                                    if (err) {
                                        callback(err, null);
                                    } else if (_.isEmpty(schoolData)) {
                                        data.mobile = found.mobile;
                                        data.schoolName = found.atheleteSchoolName;
                                        data.schoolSFA = "Unregistered";
                                        data.emailfile = "studentTeamUnregister.ejs";
                                        callback(null, data);

                                    } else {
                                        data.mobile = found.mobile;
                                        data.schoolName = schoolData.schoolName;
                                        data.schoolSFA = schoolData.sfaID;
                                        data.emailfile = "studentTeam.ejs";
                                        callback(null, data);
                                    }
                                });
                            }
                        });
                    }
                },
                function (data, callback) {
                    TeamSport.athleteMailers(data, total, function (err, mailData) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(mailData)) {
                                callback(null, []);
                            } else {
                                callback(null, mailData);
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

    athleteMailers: function (data, total, callback) {
        console.log("data", data);
        async.each(total.studentTeam, function (n, callback) {
            console.log("n", n);
            async.parallel([
                function (callback) {
                    var emailData = {};
                    emailData.sportName = data.name;
                    emailData.schoolName = data.schoolName;
                    emailData.schoolSFA = data.schoolSFA;
                    emailData.from = "info@sfanow.in";
                    emailData.email = n.email;
                    emailData.filename = data.emailfile;
                    emailData.teamId = total.teamSport.teamId;
                    emailData.students = total.studentTeam;
                    emailData.linkSportName = data.linkSportName;
                    emailData.subject = "SFA: Successful Team Sport Registered";
                    // console.log("emaildata", emailData);
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
                },
                //school sms
                function (callback) {
                    var smsData = {};
                    smsData.mobile = data.mobile;
                    smsData.content = "SFA: Thank you for registering for Team Sports at SFA 2017. For Further details Please check your rehistered email ID.";
                    console.log("smsdata", smsData);
                    // callback(null, smsData);
                    Config.sendSms(smsData, function (err, smsRespo) {
                        if (err) {
                            console.log(err);
                            callback(err, null);
                        } else if (smsRespo) {
                            console.log(smsRespo, "sms sent");
                            callback(null, smsRespo);
                        } else {
                            callback(null, "Invalid data");
                        }
                    });
                }
            ], function (err, data3) {
                if (err) {
                    console.log(err);
                    callback(err, null);
                } else {
                    if (_.isEmpty(data3)) {
                        callback(null, []);
                    } else {
                        callback(null, data3);
                    }
                }
            });
        }, function (err) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else {
                callback(null, "All email sent!!");
            }
        });
    },

    rejectionTeam: function (data, callback) {
        async.waterfall([
                function (callback) {
                    TeamSport.findOne({
                        teamId: data.teamId
                    }).exec(function (err, complete) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(complete)) {
                                callback(null, []);
                            } else {
                                callback(null, complete);
                            }
                        }
                    });
                },
                function (complete, callback) {
                    TeamSport.athleteRelease(complete, function (err, complete1) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(complete1)) {
                                callback(null, []);
                            } else {
                                callback(null, complete1);
                            }
                        }
                    });
                },
                function (complete1, callback) {
                    if (complete1 == "deleted") {
                        TeamSport.remove({
                            teamId: data.teamId
                        }).exec(function (err, complete2) {
                            if (err) {
                                callback(err, null);
                            } else {
                                if (_.isEmpty(complete2)) {
                                    callback(null, []);
                                } else {
                                    callback(null, complete2);
                                }
                            }
                        });
                    }

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

    getAggregatePipeLine: function (data) {

        var pipeline = [
            // Stage 1
            {
                $match: {
                    "_id": objectid(data)
                }
            },

            // Stage 2
            {
                $lookup: {
                    "from": "atheletes",
                    "localField": "studentId",
                    "foreignField": "_id",
                    "as": "studentId"
                }
            },

            // Stage 3
            {
                $unwind: {
                    path: "$studentId",
                }
            },

            // Stage 4
            {
                $lookup: {
                    "from": "teamsports",
                    "localField": "teamId",
                    "foreignField": "_id",
                    "as": "teamId"
                }
            },

            // Stage 5
            {
                $unwind: {
                    path: "$teamId",
                }
            },

        ];
        return pipeline;
    },

    athleteRelease: function (data, callback) {
        async.each(data.studentTeam, function (n, callback) {
            async.waterfall([
                    function (callback) {
                        var pipeLine = TeamSport.getAggregatePipeLine(n);
                        StudentTeam.aggregate(pipeLine, function (err, totals) {
                            if (err) {
                                console.log(err);
                                callback(err, "error in mongoose");
                            } else {
                                if (_.isEmpty(totals)) {
                                    callback(null, []);
                                } else {
                                    callback(null, totals);
                                }
                            }
                        });
                    },
                    function (totals, callback) {
                        console.log("totals", totals);
                        var emailData = {};
                        var index = totals[0].teamId.name.indexOf("-");
                        emailData.sportName = totals[0].teamId.name.slice(++index, totals[0].teamId.name.length);
                        emailData.from = "info@sfanow.in";
                        emailData.email = totals[0].studentId.email;
                        emailData.filename = "rejectionTeam.ejs";
                        emailData.teamId = totals[0].teamId.teamId;
                        emailData.subject = "SFA: Team Rejected";
                        console.log("emaildata", emailData);
                        Config.email(emailData, function (err, emailRespo) {
                            if (err) {
                                console.log(err);
                                callback(null, err);
                            } else if (emailRespo) {

                                callback(null, emailRespo);
                            } else {
                                callback(null, emailRespo);
                            }
                        });
                    },
                    function (emailRespo, callback) {
                        StudentTeam.remove({
                            _id: n
                        }).exec(function (err, found) {
                            if (err) {
                                callback(err, null);
                            } else {
                                if (_.isEmpty(found)) {
                                    callback(null, []);
                                } else {
                                    callback(null, found);
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
        }, function (err) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else {
                callback(null, "deleted");
            }
        });
    },

    search: function (data, callback) {
        var Model = this;
        var Const = this(data);
        var maxRow = Config.maxRow;

        var page = 1;
        if (data.page) {
            page = data.page;
        }
        var field = data.field;
        var options = {
            field: data.field,
            filters: {
                keyword: {
                    fields: ['name'],
                    term: data.keyword
                }
            },
            sort: {
                desc: 'createdAt'
            },
            start: (page - 1) * maxRow,
            count: maxRow
        };
        // var deepSearch = "sportslist ageGroup weight";
        var Search = Model.find(data.keyword)

            .order(options)
            // .deepPopulate(deepSearch)
            .keyword(options)
            .page(options, callback);

    },

    generateExcel: function (res) {
        async.waterfall([
                function (callback) {
                    var pipeLine = TeamSport.getTeamPipeLine();
                    TeamSport.aggregate(pipeLine, function (err, complete) {
                        if (err) {
                            callback(err, "error in mongoose");
                        } else {
                            if (_.isEmpty(complete)) {
                                callback(null, []);
                            } else {
                                callback(null, complete);
                            }
                        }
                    });
                },
                function (complete, callback) {
                    console.log(complete);
                    var excelData = [];
                    async.each(complete, function (mainData, callback) {
                        var obj = {};
                        obj.year = new Date().getFullYear();
                        obj.Teamid = mainData.teamId;
                        obj.SchoolName = mainData.schoolName;
                        obj.TeamName = mainData.name;
                        obj.Sport = mainData.sport.sportslist.name;
                        obj.Gender = mainData.sport.gender;
                        obj.AgeGroup = mainData.sport.ageGroup.name;

                        var StudentTeam;
                        var count = 0;
                        var Captain;
                        var GoalKeeper;
                        async.each(mainData.studentTeam, function (n, innerEachCallback) {
                            var name;
                            Athelete.findOne({
                                _id: n.studentId
                            }).exec(function (err, found) {

                                if (found.middleName) {
                                    name = found.firstName + " " + found.middleName + " " + found.surname;
                                } else {
                                    name = found.firstName + " " + found.surname;
                                }
                                name = found.sfaId + " - " + name;
                                if (n.isCaptain == true) {
                                    Captain = name;
                                }

                                if (n.isGoalKeeper == true) {
                                    GoalKeeper = name;
                                }
                                if (count == 0) {
                                    StudentTeam = name;
                                } else {
                                    StudentTeam = StudentTeam + " , " + name;
                                }
                                count++;
                                obj.Captain = Captain;
                                obj.GoalKeeper = GoalKeeper;
                                obj.All_Players = StudentTeam;
                                obj.createdBy = mainData.createdBy;

                                if (mainData.nominatedSchoolName) {
                                    obj.nominatedSchoolName = mainData.nominatedSchoolName;
                                } else {
                                    obj.nominatedSchoolName = "";
                                }
                                if (mainData.nominatedContactDetails) {
                                    obj.nominatedContactDetails = mainData.nominatedContactDetails;
                                } else {
                                    obj.nominatedContactDetails = "";
                                }
                                if (mainData.nominatedEmailId) {
                                    obj.nominatedEmailId = mainData.nominatedEmailId;
                                } else {
                                    obj.nominatedEmailId = "";
                                }
                                if (mainData.isVideoAnalysis) {
                                    obj.isVideoAnalysis = mainData.isVideoAnalysis;
                                } else {
                                    obj.isVideoAnalysis = "";
                                }
                                console.log("obj-----", obj);
                                excelData.push(obj);
                                innerEachCallback(null, excelData);
                            });
                        }, function (err) {
                            callback(null, excelData);
                        });
                    }, function (err) {
                        Config.generateExcelOld("TeamSport", excelData, res);
                    });

                },
            ],
            function (err, excelData) {
                if (err) {
                    console.log(err);
                    callback(null, []);
                } else if (excelData) {
                    if (_.isEmpty(excelData)) {
                        callback(null, []);
                    } else {
                        callback(null, excelData);
                    }
                }
            });
    },

    getTeamPipeLine: function () {

        var pipeline = [
            // Stage 1
            {
                $unwind: {
                    path: "$sport",
                }
            },
            {
                $lookup: {
                    "from": "sports",
                    "localField": "sport",
                    "foreignField": "_id",
                    "as": "sport"
                }
            },

            // Stage 2
            {
                $unwind: {
                    path: "$sport",
                }
            },
            {
                $lookup: {
                    "from": "sportslists",
                    "localField": "sport.sportslist",
                    "foreignField": "_id",
                    "as": "sport.sportslist"
                }
            },

            // Stage 2
            {
                $unwind: {
                    path: "$sport.sportslist",
                }
            },
            {
                $lookup: {
                    "from": "agegroups",
                    "localField": "sport.ageGroup",
                    "foreignField": "_id",
                    "as": "sport.ageGroup"
                }
            },

            // Stage 2
            {
                $unwind: {
                    path: "$sport.ageGroup",
                }
            },

            // Stage 5
            {
                $lookup: {
                    "from": "studentteams",
                    "localField": "studentTeam",
                    "foreignField": "_id",
                    "as": "studentTeam"
                }
            },
            {
                $sort: {
                    "createdAt": -1
                }
            },
        ];
        return pipeline;
    },

    getTeamPipeLine1: function (data) {

        var pipeline = [
            // Stage 1
            {
                $match: {
                    "teamId": data.teamid
                }
            },
            {
                $lookup: {
                    "from": "sports",
                    "localField": "sport",
                    "foreignField": "_id",
                    "as": "sport"
                }
            },

            // Stage 2
            {
                $unwind: {
                    path: "$sport",
                }
            },
            {
                $lookup: {
                    "from": "sportslists",
                    "localField": "sport.sportslist",
                    "foreignField": "_id",
                    "as": "sport.sportslist"
                }
            },

            // Stage 2
            {
                $unwind: {
                    path: "$sport.sportslist",
                }
            },
            {
                $lookup: {
                    "from": "agegroups",
                    "localField": "sport.ageGroup",
                    "foreignField": "_id",
                    "as": "sport.ageGroup"
                }
            },

            // Stage 2
            {
                $unwind: {
                    path: "$sport.ageGroup",
                }
            },

            // Stage 5
            {
                $lookup: {
                    "from": "studentteams",
                    "localField": "studentTeam",
                    "foreignField": "_id",
                    "as": "studentTeam"
                }
            },
            {
                $sort: {
                    "createdAt": -1
                }
            },
        ];
        return pipeline;
    },

    getIndividualPipeLine: function (data) {

        var pipeline = [

            {
                $match: {
                    "_id": data.studentId
                }
            },
            // Stage 1
            {
                $lookup: {
                    "from": "atheletes",
                    "localField": "athleteId",
                    "foreignField": "_id",
                    "as": "athleteId"
                }
            },

            // Stage 2
            {
                $unwind: {
                    path: "$athleteId",

                }
            },

            // Stage 3
            {
                $lookup: {
                    "from": "schools",
                    "localField": "athleteId.school",
                    "foreignField": "_id",
                    "as": "athleteId.school"
                }
            },

            // Stage 4
            {
                $unwind: {
                    path: "$athleteId.school",
                    preserveNullAndEmptyArrays: true // optional
                }
            },

            // Stage 5
            {
                $lookup: {
                    "from": "sportslistsubcategories",
                    "localField": "sportsListSubCategory",
                    "foreignField": "_id",
                    "as": "sportsListSubCategory"
                }
            },

            // Stage 6
            {
                $unwind: {
                    path: "$sportsListSubCategory",

                }
            },
        ];
        return pipeline;
    },

    //----------------------------------------EDIT-----------------------------------------

    editTeam: function (data, callback) {
        var final = {};
        final.students = [];
        async.waterfall([
                function (callback) {
                    var pipeLine = TeamSport.getTeamPipeLine1(data);
                    TeamSport.aggregate(pipeLine, function (err, complete) {
                        if (err) {
                            callback(err, "error in mongoose");
                        } else {
                            if (_.isEmpty(complete)) {
                                callback(null, []);
                            } else {
                                callback(null, complete);
                            }
                        }
                    });
                }
            ],
            function (err, complete1) {
                if (err) {
                    console.log(err);
                    callback(null, []);
                } else {
                    callback(null, complete1);
                }

            });

    },

    editAggregatePipeLine: function (data) {

        var pipeline = [
            // Stage 1
            {
                $match: {
                    "_id": objectid(data._id)
                }
            },

            // Stage 2
            {
                $lookup: {
                    "from": "atheletes",
                    "localField": "studentId",
                    "foreignField": "_id",
                    "as": "studentId"
                }
            },

            // Stage 3
            {
                $unwind: {
                    path: "$studentId",
                }
            },

            // Stage 4
            {
                $lookup: {
                    "from": "teamsports",
                    "localField": "teamId",
                    "foreignField": "_id",
                    "as": "teamId"
                }
            },

            // Stage 5
            {
                $unwind: {
                    path: "$teamId",
                }
            },

        ];
        return pipeline;
    },

    editSaveTeam: function (data, callback) {
        var sport = data.name;
        var index = sport.indexOf("-");
        var tempName = sport.slice(++index, sport.length);
        var indexNext = tempName.indexOf("-");
        data.linkSportName = tempName.slice(0, indexNext);
        data.countEdit = 0;
        async.waterfall([
                function (callback) {
                    var matchToken = {
                        $set: {
                            studentTeam: []
                        }
                    }
                    TeamSport.update({
                        _id: data.teamid
                    }, matchToken).exec(
                        function (err, data3) {
                            if (err) {
                                console.log(err);
                                callback(err, null);
                            } else if (data3) {
                                console.log("value :", data3);
                                callback(null, data3);
                            }
                        });
                },
                function (data3, callback) {
                    StudentTeam.find({
                        teamId: data.teamid
                    }).exec(function (err, found) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(found)) {
                                callback(null, []);
                            } else {
                                callback(null, found);
                            }
                        }
                    });
                },
                function (found, callback) {
                    console.log("found", found);
                    async.each(found, function (n, callback) {
                        async.waterfall([
                                function (callback) {
                                    TeamSport.editAthleteRelease(n, data, function (err, complete1) {
                                        if (err) {
                                            callback(err, null);
                                        } else {
                                            if (_.isEmpty(complete1)) {
                                                callback(null, []);
                                            } else {
                                                callback(null, complete1);
                                            }
                                        }
                                    });
                                },

                                function (complete1, callback) {
                                    StudentTeam.remove({
                                        _id: n._id
                                    }).exec(function (err, found) {
                                        if (err) {
                                            callback(err, null);
                                        } else {
                                            if (_.isEmpty(found)) {
                                                callback(null, []);
                                            } else {
                                                callback(null, found);
                                            }
                                        }
                                    });
                                }
                            ],
                            function (err, complete1) {
                                if (err) {
                                    console.log(err);
                                    callback(null, []);
                                } else if (complete1) {
                                    if (_.isEmpty(complete1)) {
                                        callback(null, []);
                                    } else {
                                        callback(null, complete1);
                                    }
                                }
                            });
                    }, function (err, found) {
                        if (err) {
                            callback(err, null);
                        } else {
                            callback(null, found);
                        }
                    });
                },
                function (found, callback) {
                    TeamSport.findOne({
                        _id: data.teamid
                    }).exec(function (err, complete) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(complete)) {
                                callback(null, []);
                            } else {
                                callback(null, complete);
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
                                var total = {};
                                total.teamSport = complete;
                                total.studentTeam = complete1;
                                callback(null, total);
                            }
                        }
                    });
                },
                function (total, callback) {
                    if (data.schoolToken && data.countEdit > 0) {
                        TeamSport.editSchoolTeamMailers(data, total, function (err, final) {
                            if (err) {
                                callback(err, null);
                            } else {
                                if (_.isEmpty(final)) {
                                    callback(null, []);
                                } else {
                                    callback(null, final);
                                }
                            }
                        });
                        callback(null, data);
                    } else if (data.athleteToken && data.countEdit > 0) {
                        callback(null, data);
                        TeamSport.editAtheleteTeamMailers(data, total, function (err, final) {
                            if (err) {
                                callback(err, null);
                            } else {
                                if (_.isEmpty(final)) {
                                    callback(null, []);
                                } else {
                                    callback(null, final);
                                }
                            }
                        });

                    } else {
                        callback(null, data);
                    }
                }

            ],
            function (err, complete1) {
                if (err) {
                    console.log(err);
                    callback(null, []);
                } else if (complete1) {
                    if (_.isEmpty(complete1)) {
                        callback(null, []);
                    } else {
                        callback(null, complete1);
                    }
                }
            });
    },

    editAthleteRelease: function (data, param, callback) {
        async.waterfall([
                function (callback) {
                    var pipeLine = TeamSport.editAggregatePipeLine(data);
                    StudentTeam.aggregate(pipeLine, function (err, totals) {
                        if (err) {
                            console.log(err);
                            callback(err, "error in mongoose");
                        } else {
                            if (_.isEmpty(totals)) {
                                callback(null, []);
                            } else {
                                callback(null, totals);
                            }
                        }
                    });
                },
                function (totals, callback) {
                    totals.count = 0;
                    var length = param.atheleteName.length;
                    console.log("length", length);
                    _.each(param.athleteTeam, function (m) {
                        console.log("id", totals[0].studentId._id);
                        console.log("edit", m.studentId);
                        if (totals[0].studentId._id.equals(m.studentId)) {
                            totals.count++;
                            param.countEdit++;
                        }
                    });
                    console.log("params", param.countEdit);
                    if (param.countEdit <= length) {
                        param.countEdit = 0;
                    } else {
                        param.countEdit = 1;
                    }
                    callback(null, totals);
                },
                function (totals, callback) {
                    console.log("totals", totals);
                    if (totals.count == 0) {
                        var emailData = {};
                        var index = totals[0].teamId.name.indexOf("-");
                        emailData.sportName = totals[0].teamId.name.slice(++index, totals[0].teamId.name.length);
                        emailData.from = "info@sfanow.in";
                        emailData.email = totals[0].studentId.email;
                        emailData.filename = "athleteRejectionEdit.ejs";
                        emailData.teamId = totals[0].teamId.teamId;
                        emailData.subject = "SFA: Athlete Removed On Edit";
                        // console.log("emaildata", emailData);
                        // callback(null, emailData);
                        Config.email(emailData, function (err, emailRespo) {
                            if (err) {
                                console.log(err);
                                callback(null, err);
                            } else if (emailRespo) {

                                callback(null, emailRespo);
                            } else {
                                callback(null, emailRespo);
                            }
                        });
                    } else {
                        callback(null, totals);
                    }
                },
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

    editteamAthlete: function (data, callback) {
        async.waterfall([
                function (callback) {
                    Athelete.findOne({
                        accessToken: data.athleteToken
                    }).exec(function (err, found) {
                        if (_.isEmpty(found)) {
                            callback(null, []);
                        } else {
                            data.athleteSFA = found.sfaId;
                            callback(null, found);
                        }
                    });
                },
                function (found, callback) {
                    if (found.atheleteSchoolName) {
                        var schoolName = {};
                        schoolName.name = found.atheleteSchoolName;
                        data.schoolName = found.atheleteSchoolName;
                        callback(null, schoolName);
                    } else {
                        School.findOne({
                            _id: found.school
                        }).exec(function (err, schoolData) {
                            if (_.isEmpty(schoolData)) {
                                callback(null, []);
                            } else {
                                var schoolName = {};
                                schoolName.name = schoolData.name;
                                data.schoolName = schoolData.name;
                                callback(null, schoolName);
                            }
                        });
                    }

                },
                function (schoolName, callback) {
                    Registration.findOne({
                        schoolName: schoolName.name
                    }).exec(function (err, complete) {
                        if (_.isEmpty(complete)) {
                            data.school = undefined;
                            TeamSport.editSaveTeam(data, function (err, complete1) {
                                if (err) {
                                    callback(err, null);
                                } else {
                                    callback(null, complete1);
                                }
                            });
                        } else {
                            data.school = complete._id;
                            TeamSport.editSaveTeam(data, function (err, complete1) {
                                if (err) {
                                    callback(err, null);
                                } else {
                                    callback(null, complete1);
                                }
                            });
                        }
                    });
                },
            ],
            function (err, data2) {
                if (err) {
                    console.log(err);
                    callback(err, null);
                } else if (data2) {
                    if (_.isEmpty(data2)) {
                        callback("Max Team Created", null);
                    } else {
                        callback(null, data2);
                    }
                }
            });
    },

    editSchoolTeamMailers: function (data, total, callback) {
        Registration.findOne({
            sfaID: data.schoolSFA,
        }).exec(function (err, found) {
            if (err) {
                callback(err, null);
            } else if (_.isEmpty(found)) {
                callback(null, "Data is empty");
            } else {
                async.parallel([
                    //school email
                    function (callback) {
                        console.log("total", total);
                        var emailData = {};
                        emailData.schoolName = found.schoolName;
                        emailData.sportName = data.name;
                        emailData.schoolSFA = found.sfaID;
                        emailData.from = "info@sfanow.in";
                        emailData.email = found.email;
                        emailData.filename = "editTeamSport.ejs";
                        emailData.teamId = total.teamSport.teamId;
                        emailData.students = total.studentTeam;
                        emailData.linkSportName = data.linkSportName;
                        emailData.subject = "SFA: Successful Team Sport Registered";
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

                    },
                    //school sms
                    function (callback) {
                        var smsData = {};
                        smsData.mobile = found.mobile;
                        smsData.content = "SFA: Thank you for registering for Team Sports at SFA 2017. For Further details Please check your registered email ID.";
                        console.log("smsdata", smsData);
                        Config.sendSms(smsData, function (err, smsRespo) {
                            if (err) {
                                console.log(err);
                                callback(err, null);
                            } else if (smsRespo) {
                                console.log(smsRespo, "sms sent");
                                callback(null, smsRespo);
                            } else {
                                callback(null, "Invalid data");
                            }
                        });
                    },
                    //athlete email
                    function (callback) {
                        data.emailfile = "studentmailTeam.ejs";
                        data.schoolSFA = found.sfaID;
                        data.mobile = found.mobile;
                        data.schoolName = found.schoolName;
                        TeamSport.athleteMailers(data, total, function (err, mailData) {
                            if (err) {
                                callback(err, null);
                            } else {
                                if (_.isEmpty(mailData)) {
                                    callback(null, []);
                                } else {
                                    callback(null, mailData);
                                }
                            }
                        });

                    },
                ], function (err, data3) {
                    if (err) {
                        console.log(err);
                        callback(err, null);
                    } else {
                        if (_.isEmpty(data3)) {
                            callback(null, []);
                        } else {
                            callback(null, data3);
                        }
                    }
                });
            }
        });
    },

    editAtheleteTeamMailers: function (data, total, callback) {
        async.waterfall([
                function (callback) {
                    Athelete.findOne({
                        sfaId: data.athleteSFA,
                    }).exec(function (err, found) {
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
                    if (found.atheleteSchoolName) {
                        Registration.findOne({
                            schoolName: found.atheleteSchoolName
                        }).exec(function (err, schoolData) {
                            if (err) {
                                callback(err, null);
                            } else if (_.isEmpty(schoolData)) {
                                data.mobile = found.mobile;
                                data.schoolName = found.atheleteSchoolName;
                                data.schoolSFA = "Unregistered";
                                data.emailfile = "studentTeamUnregister.ejs";
                                callback(null, data);

                            } else {
                                data.mobile = found.mobile;
                                data.schoolName = schoolData.schoolName;
                                data.schoolSFA = schoolData.sfaID;
                                data.emailfile = "studentTeam.ejs";
                                callback(null, data);
                            }
                        });
                    } else {
                        School.findOne({
                            _id: found.school,
                        }).exec(function (err, schoolData) {
                            if (err) {
                                callback(err, null);
                            } else if (_.isEmpty(schoolData)) {
                                callback(null, "Data is empty");
                            } else {
                                Registration.findOne({
                                    schoolName: schoolData.name
                                }).exec(function (err, schoolData) {
                                    if (err) {
                                        callback(err, null);
                                    } else if (_.isEmpty(schoolData)) {
                                        data.mobile = found.mobile;
                                        data.schoolName = found.atheleteSchoolName;
                                        data.schoolSFA = "Unregistered";
                                        data.emailfile = "studentTeamUnregister.ejs";
                                        callback(null, data);

                                    } else {
                                        data.mobile = found.mobile;
                                        data.schoolName = schoolData.schoolName;
                                        data.schoolSFA = schoolData.sfaID;
                                        data.emailfile = "studentTeam.ejs";
                                        callback(null, data);
                                    }
                                });
                            }
                        });
                    }
                },
                function (data, callback) {
                    TeamSport.athleteMailers(data, total, function (err, mailData) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(mailData)) {
                                callback(null, []);
                            } else {
                                callback(null, mailData);
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

    editCheck: function (data, callback) {

    },



};
module.exports = _.assign(module.exports, exports, model);