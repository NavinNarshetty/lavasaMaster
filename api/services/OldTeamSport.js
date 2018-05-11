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
        ref: 'OldStudentTeam',
        index: true
    }],
    school: {
        type: Schema.Types.ObjectId,
        ref: 'OldRegistration',
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
module.exports = mongoose.model('OldTeamSport', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {

    getAllTeamSport: function (data, callback) {
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
                OldTeamSport.find().lean().exec(function (err, found) {
                    if (err) {
                        callback(err, null);
                    } else {
                        if (_.isEmpty(found)) {
                            callback(null, []);
                        } else {
                            var final = {};
                            final.event = eventData._id;
                            final.teamData = found;
                            callback(null, final);
                        }
                    }
                });
            },
            function (final, callback) {
                OldTeamSport.setAllTeamSport(final, function (err, complete) {
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

    setAllTeamSport: function (data, callback) {
        async.eachSeries(data.teamData, function (n, callback) {
            var nextData = {};
            async.waterfall([
                function (callback) {
                    OldIndividualSport.getSportId(n.sport, function (err, complete) {
                        if (err || _.isEmpty(complete)) {
                            var err = "Error found in Rules";
                            callback(err, null);
                        } else {
                            console.log("complete", complete);
                            nextData.sport = complete.sport;
                            callback(null, nextData);
                        }
                    });
                },
                function (nextData, callback) {
                    Registration.findOne({
                        oldId: n.school
                    }).lean().exec(function (err, schoolData) {
                        if (err || _.isEmpty(schoolData)) {
                            callback(null, {
                                error: "school not found"
                            });
                        } else {
                            console.log("schoolData", schoolData);
                            nextData.school = schoolData._id;
                            nextData.schoolName = schoolData.schoolName;
                            callback(null, nextData);
                        }
                    });
                },
                function (nextData, callback) {
                    console.log("n inside", n);
                    var formData = {};
                    formData.teamId = n.teamId;
                    formData.sport = nextData.sport;
                    formData.school = nextData.school;
                    formData.name = n.name;
                    formData.schoolName = nextData.schoolName;
                    formData.createdBy = n.createdBy;
                    formData.eventId = data.event;
                    formData.oldId = n._id;
                    console.log("formData", formData);
                    TeamSport.saveData(formData, function (err, complete) {
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
                function (complete, callback) {
                    n.teamId = complete._id;
                    console.log("n in student", n);
                    OldTeamSport.setStudentTeam(n, function (err, complete) {
                        if (err || _.isEmpty(complete)) {
                            var err = "Error found in Rules";
                            callback(err, null);
                        } else {
                            callback(null, complete);
                        }
                    });
                },
                function (complete, callback) {
                    if (complete.studentTeam.length > 0) {
                        console.log("complete", complete);
                        var studentTeam = [];
                        _.each(complete.studentTeam, function (n) {
                            studentTeam.push(n._id);
                        });
                        updateObj = {
                            $set: {
                                studentTeam: studentTeam
                            }
                        };
                        TeamSport.update({
                            _id: complete.studentTeam[0].teamId
                        }, updateObj).exec(
                            function (err, teamData) {
                                if (err) {
                                    callback(err, null);
                                } else if (_.isEmpty(teamData)) {
                                    callback(null, []);
                                } else {
                                    callback(null, teamData);
                                }
                            });
                    } else {
                        callback(null, complete);
                    }
                }
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

    setStudentTeam: function (data, callback) {
        var final = {};
        final.studentTeam = [];
        async.eachSeries(data.studentTeam, function (n, callback) {
            console.log("data", n);
            async.waterfall([
                function (callback) {
                    OldStudentTeam.findOne({
                        _id: n
                    }).lean().exec(function (err, found) {
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
                    Athelete.findOne({
                        oldId: found.studentId
                    }).lean().exec(function (err, found) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(found)) {
                                callback(null, []);
                            } else {
                                found.studentId = found._id;
                                callback(null, found);
                            }
                        }
                    });
                },
                function (found, callback) {
                    var formData = {};
                    formData.teamId = data.teamId;
                    formData.sport = data.sport;
                    formData.studentId = found.studentId;
                    formData.isCaptain = found.isCaptain;
                    formData.isGoalKeeper = found.isGoalKeeper;
                    StudentTeam.saveData(formData, function (err, complete) {
                        if (err || _.isEmpty(complete)) {
                            callback(null, {
                                error: "Error",
                                success: complete
                            });
                        } else {
                            final.studentTeam.push(complete);
                            callback(null, final);
                        }
                    });

                }
            ], function (err, complete) {
                if (err) {
                    callback(err, null);
                } else {
                    // console.log("data2", final);
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
                callback(null, final);
            }
        });
    },



};
module.exports = _.assign(module.exports, exports, model);