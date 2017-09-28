var schema = new Schema({
    name: {
        type: String,
    }
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('OldTeam', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {

    getAllTeam: function (data, callback) {
        var final = [];
        async.waterfall([
                function (callback) {
                    OldTeam.find({
                        year: data.year
                    }).lean().exec(function (err, found) {
                        if (err) {
                            callback(err, null);
                        } else {
                            callback(null, found);
                        }
                    });
                },
                function (found, callback) {
                    async.eachLimit(found, 10, function (sportData, callback) {
                            var team = {};
                            team.athleteTeam = [];
                            async.waterfall([
                                    function (callback) {
                                        var sportParam = {};
                                        sportParam.sportslist = sportData.sport;
                                        sportParam.age = sportData.agegroup;
                                        if (sportData.gender == "Boys") {
                                            sportParam.gender = "male";
                                        } else {
                                            sportParam.gender = "female";
                                        }
                                        sportParam.weight = undefined;
                                        OldTeam.getSportId(sportParam, function (err, sport) {
                                            if (err) {
                                                callback(err, null);
                                            } else {
                                                if (_.isEmpty(sport)) {
                                                    callback(null, []);
                                                } else {
                                                    team.sport = sport.sportId;
                                                    callback(null, sportData);
                                                }
                                            }
                                        });
                                    },
                                    function (sportData, callback) {
                                        console.log("count", sportData);
                                        async.eachSeries(sportData.players, function (player, callback) {
                                                var playerData = {};
                                                playerData.athlete = player;
                                                OldTeam.getAthleteId(playerData, function (err, sport) {
                                                    if (err) {
                                                        callback(err, null);
                                                    } else {
                                                        if (_.isEmpty(sport)) {
                                                            callback(null, []);
                                                        } else {
                                                            team.id = sportData._id;
                                                            var studentTeam = {};
                                                            studentTeam.studentId = sport._id;
                                                            if (sport._id.equals(sportData.captain)) {
                                                                studentTeam.isCaptain = true;
                                                            } else {
                                                                studentTeam.isCaptain = false;
                                                            }
                                                            studentTeam.isGoalKeeper = false;
                                                            team.athleteTeam.push(studentTeam);
                                                            team.school = sport.school;
                                                            team.schoolName = sport.schoolName;
                                                            team.createdBy = "School";
                                                            team.name = sportData.name;
                                                            callback(null, team);
                                                        }
                                                    }
                                                });
                                            },
                                            function (err) {
                                                callback(null, team);
                                                final.push(team);
                                            });
                                    },
                                    function (team, callback) {
                                        OldTeam.teamConfirm(team, function (err, sport) {
                                            if (err) {
                                                callback(err, null);
                                            } else {
                                                if (_.isEmpty(sport)) {
                                                    callback(null, []);
                                                } else {
                                                    callback(null, sportData);
                                                }
                                            }
                                        });
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
                        function (err) {
                            callback(null, final);
                        });
                },
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

    getSportId: function (data, callback) {
        var sport = {};
        async.waterfall([
                function (callback) {
                    SportsList.findOne({
                        oldId: data.sportslist
                    }).lean().deepPopulate("sportsListSubCategory").exec(function (err, found) {
                        if (err || _.isEmpty(found)) {
                            callback(null, {
                                error: "No SportsList found!",
                                success: data
                            });
                        } else {
                            sport.sportslist = found._id;
                            sport.sportsListSubCategory = found.sportsListSubCategory._id;
                            // console.log("sport", sport);
                            callback(null, sport);
                        }
                    });
                },
                function (sport, callback) {
                    AgeGroup.findOne({
                        oldId: data.age
                    }).lean().exec(function (err, found) {
                        if (err || _.isEmpty(found)) {
                            callback(null, {
                                error: "No Age found!",
                                success: data
                            });
                        } else {
                            sport.age = found._id;
                            // console.log("sport", sport);
                            callback(null, sport);
                        }
                    });
                },
                function (sport, callback) {
                    if (_.isEmpty(data.weight) || data.weight == undefined) {
                        callback(null, sport);
                    } else {
                        Weight.findOne({
                            name: data.weight
                        }).lean().exec(function (err, found) {
                            if (err || _.isEmpty(found)) {
                                callback(null, {
                                    error: "No Weight found!",
                                    success: data
                                });
                            } else {
                                sport.weight = found._id;
                                // console.log("sport", sport);
                                callback(null, sport);
                            }
                        });
                    }
                },
                function (sport, callback) {
                    if (sport.error) {
                        callback(null, sport);
                    } else {
                        var matchObj = {};
                        matchObj.gender = data.gender;
                        matchObj.sportslist = sport.sportslist;
                        matchObj.ageGroup = sport.age;
                        if (sport.weight) {
                            matchObj.weight = sport.weight;
                        }
                        // console.log("matchObj", matchObj);
                        Sport.findOne(matchObj).lean().exec(function (err, found) {
                            if (err || _.isEmpty(found)) {
                                callback(null, {
                                    error: "No Sport found!",
                                    success: data
                                });
                            } else {
                                sport.sportId = found._id;
                                // console.log("sport", sport);
                                callback(null, sport);
                            }
                        });
                    }
                }

            ],
            function (err, results) {
                if (results.error) {
                    callback(null, []);
                } else {
                    callback(null, results);
                }
            });

    },

    getAthleteId: function (data, callback) {
        var athlete = {};
        var id = data.athlete.toString();
        async.waterfall([
                function (callback) {
                    Athelete.findOne({
                        oldId: {
                            $regex: id,
                            $options: "i"
                        }
                    }).lean().exec(function (err, found) {
                        if (err || _.isEmpty(found)) {
                            callback(err, {
                                error: "No Athelete found!",
                                success: data
                            });
                        } else {
                            // console.log("athlete", found);
                            callback(null, found);
                        }
                    });
                },
                function (found, callback) {
                    if (found.error) {
                        callback(null, []);
                    } else {
                        Registration.findOne({
                            oldId: found.school
                        }).lean().exec(function (err, athleteData) {
                            if (err || _.isEmpty(athleteData)) {
                                callback(null, []);
                            } else {
                                // console.log("school", athleteData);
                                athlete._id = found._id;
                                athlete.school = athleteData._id;
                                athlete.schoolName = athleteData.schoolName;
                                callback(null, athlete);
                            }
                        });
                    }
                }
            ],
            function (err, results) {
                if (err || _.isEmpty(results)) {
                    callback(null, results);
                } else {
                    callback(null, results);
                }
            });
    },

    teamConfirm: function (data, callback) {
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
                    // data.property = property[0];
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




};
module.exports = _.assign(module.exports, exports, model);