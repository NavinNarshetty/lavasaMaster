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
        // callback(null, data);
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
                    // console.log("count", found.length);
                    async.concatSeries(found, function (sportData, callback) {
                            // console.log('Hi', sportData);
                            var team = {};
                            // team.sport = sportData.sport;
                            team.athleteTeam = [];
                            async.waterfall([
                                    function (callback) {
                                        var paramData = {};
                                        paramData.sportslist = sportData.sport;
                                        paramData.age = sportData.agegroup;
                                        if (sportData.gender == "Boys") {
                                            sportData.gender = "male";
                                        } else {
                                            sportData.gender = "female";
                                        }
                                        paramData.gender = sportData.gender;
                                        paramData.weight = undefined;
                                        OldTeam.getSportId(paramData, function (err, sport) {
                                            if (err) {
                                                callback(err, null);
                                            } else {
                                                if (_.isEmpty(sport)) {
                                                    callback(null, []);
                                                } else {
                                                    // console.log("sport", sport);
                                                    team.sport = sport.sportId;
                                                    team.name = sportData.name;
                                                    callback(null, sportData);
                                                }
                                            }
                                        });
                                    },
                                    function (sportData, callback) {
                                        async.concatSeries(sportData.players, function (player, callback) {
                                                var playerData = {};
                                                playerData.athlete = player;
                                                OldTeam.getAthleteId(playerData, sportData, function (err, sport) {
                                                    if (err) {
                                                        callback(err, null);
                                                    } else {
                                                        if (_.isEmpty(sport)) {
                                                            console.log("sport", sport, "captain", sportData.captain);
                                                            callback(null, []);
                                                        } else {
                                                            team.id = sportData._id;
                                                            var studentTeam = {};
                                                            studentTeam.studentId = sport._id;
                                                            console.log("sport", sport, "captain", sportData.captain);
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

                                                            team.sfaid = sportData.sfaid;
                                                            team.oldId = sportData._id;
                                                            callback(null, team);
                                                        }
                                                    }
                                                });
                                                // callback(null, player);
                                            },
                                            function (err) {
                                                callback(null, team);
                                                if (!final.includes(team)) {
                                                    final.push(team);
                                                }
                                            });
                                    },
                                    // function (team, callback) {
                                    //     OldTeam.teamConfirm(team, function (err, sport) {
                                    //         if (err) {
                                    //             callback(err, null);
                                    //         } else {
                                    //             if (_.isEmpty(sport)) {
                                    //                 callback(null, []);
                                    //             } else {
                                    //                 callback(null, sportData);
                                    //             }
                                    //         }
                                    //     });
                                    // }
                                ],
                                function (err, found) {
                                    if (err) {
                                        callback(err, null);
                                    } else if (_.isEmpty(found)) {
                                        callback(null, found);
                                    } else {

                                        callback(null, found);
                                    }
                                });
                        },
                        function (err, final) {
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
                    if (sport.error) {
                        callback(null, sport);
                    } else {
                        AgeGroup.findOne({
                            oldId: data.age.toString()
                        }).lean().exec(function (err, found) {
                            if (err || _.isEmpty(found)) {
                                callback(null, {
                                    error: "No Age found!",
                                    success: data
                                });
                            } else {
                                sport.age = found._id;
                                callback(null, sport);
                            }
                        });
                    }
                },
                function (sport, callback) {
                    if (sport.error) {
                        callback(null, sport);
                    } else if (_.isEmpty(data.weight) || data.weight == undefined) {
                        callback(null, sport);
                    } else {
                        Weight.findOne({
                            name: data.weight.toString()
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
                        console.log("matchObj", matchObj);
                        Sport.findOne(matchObj).lean().exec(function (err, found) {
                            if (err || _.isEmpty(found)) {
                                // sport.sportId = null;
                                callback(null, {
                                    error: "No sport found",
                                    data: matchObj
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
                callback(null, results);
            });

    },

    getAthleteId: function (data, mainData, callback) {
        var athlete = {};
        // var id = data.athlete.toString();
        async.waterfall([
                function (callback) {
                    Athelete.findOne({
                        oldId: data.athlete
                    }).lean().exec(function (err, found) {
                        if (err || _.isEmpty(found)) {
                            callback(err, {
                                error: "No Athelete found!",
                                success: data
                            });
                        } else {
                            athlete._id = found._id;
                            callback(null, found);
                        }
                    });
                },
                function (found, callback) {
                    if (found.error) {
                        callback(null, []);
                    } else {
                        Registration.findOne({
                            oldId: mainData.school
                        }).lean().exec(function (err, athleteData) {
                            if (err || _.isEmpty(athleteData)) {
                                callback(null, []);
                            } else {
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
        // console.log("data", data);
        async.waterfall([
                function (callback) {
                    ConfigProperty.find().lean().exec(function (err, property) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(property)) {
                                callback(null, []);
                            } else {
                                callback(null, property);
                            }
                        }
                    });
                },
                function (property, callback) {
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
                    team.oldId = data.oldId;
                    data.property = property[0];
                    // console.log('DATA TEAM', data);
                    callback(null, team);
                },
                function (team, callback) {
                    team.sfaid = data.sfaid;
                    TeamSport.saveInTeam(team, data, function (err, complete) {
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
                    if (complete.error) {
                        callback(null, complete);
                    } else {
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
                    }
                },
            ],
            function (err, data2) {
                if (err) {
                    // console.log(err);
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

    getAllIndividual: function (data, callback) {
        var final = [];
        async.waterfall([
                function (callback) {
                    OldTeam.find({
                        year: data.year,
                        players: {
                            $exists: true
                        },
                        $where: 'this.players.length==1'
                    }).lean().exec(function (err, found) {
                        if (err) {
                            callback(err, null);
                        } else {
                            // console.log("found", found);
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
                                        if (!_.isEmpty(sportData) && !_.isEmpty(sportData.players)) {
                                            async.eachSeries(sportData.players, function (player, callback) {
                                                    var playerData = {};
                                                    playerData.athlete = player;
                                                    OldTeam.getAthleteId(playerData, sportData, function (err, sport) {
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
                                            //     } else {
                                            //         console.log("count", sportData.players.length);
                                            //         var err = {
                                            //             error: "not team",
                                            //             data: team
                                            //         };
                                            //         callback(null, err);
                                            //     }
                                        } else {
                                            var err = {
                                                error: "empty",
                                                data: team
                                            };
                                            callback(null, err);
                                        }
                                    }
                                    // function (team, callback) {
                                    //     if (team.error) {
                                    //         callback(null, team);
                                    //     } else {
                                    //         OldTeam.teamConfirm(team, function (err, sport) {
                                    //             if (err) {
                                    //                 callback(err, null);
                                    //             } else {
                                    //                 if (_.isEmpty(sport)) {
                                    //                     callback(null, []);
                                    //                 } else {
                                    //                     callback(null, sportData);
                                    //                 }
                                    //             }
                                    //         });
                                    //     }
                                    // }
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
};
module.exports = _.assign(module.exports, exports, model);