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
        var sport = data.name;
        var index = sport.indexOf("-");
        data.name = sport.slice(++index, sport.length);
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
                                var total = {};
                                total.teamSport = complete;
                                total.studentTeam = complete1;
                                callback(null, total);
                            }
                        }
                    });
                },
                function (total, callback) {
                    Registration.findOne({
                        sfaID: data.schoolSFA,
                        _id: data.school
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
                                //athlete email
                                function (callback) {
                                    TeamSport.athleteMailers(found, data, total, function (err, mailData) {
                                        if (err) {
                                            callback(err, null);
                                        } else {
                                            if (_.isEmpty(mailData)) {
                                                callback(null, []);
                                            } else {
                                                callback(null, mailData)
                                            }
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

    athleteMailers: function (found, data, total, callback) {
        async.each(total.studentTeam, function (n, callback) {

            var emailData = {};
            emailData.sportName = data.name;
            emailData.schoolName = found.schoolName;
            emailData.schoolSFA = found.sfaID;
            emailData.from = "info@sfanow.in";
            emailData.email = n.email;
            emailData.filename = "studentTeam.ejs";
            emailData.teamId = total.teamSport.teamId;
            emailData.students = total.studentTeam;
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
                                callback(null, complete)
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
                                    callback(null, complete2)
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

    athleteRelease: function (data, callback) {
        async.each(data.studentTeam, function (n, callback) {
            StudentTeam.remove({
                _id: n
            }).exec(function (err, found) {
                if (err) {
                    callback(err, null);
                } else {
                    if (_.isEmpty(found)) {
                        callback(null, []);
                    } else {
                        callback(null, found)
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
                    var pipeLine = Sport.getSportPipeLine();
                    Sport.aggregate(pipeLine, function (err, complete) {
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
                    var excelData = [];
                    _.each(complete, function (n) {
                        var obj = {};
                        obj.sportsList = n.sportslist.name;
                        obj.ageGroup = n.ageGroup.name;
                        var dateTime = moment.utc(n.createdAt).utcOffset("+05:30").format('YYYY-MM-DD HH:mm');
                        obj.date = dateTime;
                        obj.gender = n.gender;
                        obj.maxTeamPlayers = n.maxTeamPlayers;
                        obj.minTeamPlayers = n.minTeamPlayers;
                        obj.maxTeam = n.maxTeam;
                        if (n.weight) {
                            obj.weight = n.weight.name;
                        } else {
                            obj.weight = " ";
                        }
                        var from = moment.utc(n.fromDate).utcOffset("+05:30").format('YYYY-MM-DD');
                        obj.fromDate = from;
                        var todate = moment.utc(n.toDate).utcOffset("+05:30").format('YYYY-MM-DD');
                        obj.toDate = todate;
                        excelData.push(obj);
                    });
                    console.log("excel:", excelData);
                    Config.generateExcelOld("Sport", excelData, res);
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

    getTeamPipeLine: function () {

        var pipeline = [
            // Stage 1
            {
                $lookup: {
                    "from": "sportslists",
                    "localField": "sportslist",
                    "foreignField": "_id",
                    "as": "sportslist"
                }
            },
            // Stage 2
            {
                $unwind: {
                    path: "$sportslist",
                    // preserveNullAndEmptyArrays: true // optional
                }
            },
            // Stage 3
            {
                $lookup: {
                    "from": "agegroups",
                    "localField": "ageGroup",
                    "foreignField": "_id",
                    "as": "ageGroup"
                }
            },

            // Stage 4
            {
                $unwind: {
                    path: "$ageGroup",

                }
            },
            // Stage 5
            {
                $lookup: {
                    "from": "weights",
                    "localField": "weight",
                    "foreignField": "_id",
                    "as": "weight"
                }
            },
            // Stage 2
            {
                $unwind: {
                    path: "$weight",
                    preserveNullAndEmptyArrays: true // optional
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

};
module.exports = _.assign(module.exports, exports, model);