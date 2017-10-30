var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate')(mongoose);
var uniqueValidator = require('mongoose-unique-validator');
var timestamps = require('mongoose-timestamp');
var validators = require('mongoose-validators');
var monguurl = require('monguurl');
var autoIncrement = require('mongoose-auto-increment');
var objectid = require("mongodb").ObjectID;
var schema = new Schema({});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('Profile', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {

    getIndivivualAggregatePipeline: function (data) {
        var pipeline = [
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
                }
            },

            // Stage 5
            {
                $match: {
                    "athleteId.school.name": data.school
                }
            },

            // Stage 6
            {
                $lookup: {
                    "from": "sportslistsubcategories",
                    "localField": "sportsListSubCategory",
                    "foreignField": "_id",
                    "as": "sportsListSubCategory"
                }
            },

            // Stage 7
            {
                $unwind: {
                    path: "$sportsListSubCategory",
                }
            },

        ];
        return pipeline;
    },

    getTeamAggregatePipeline: function (data) {
        var pipeline = [
            // Stage 1
            {
                $match: {
                    schoolName: data.school
                }
            },

            // Stage 2
            {
                $lookup: {
                    "from": "sports",
                    "localField": "sport",
                    "foreignField": "_id",
                    "as": "sport"
                }
            },

            // Stage 3
            {
                $unwind: {
                    path: "$sport",
                }
            },

            // Stage 4
            {
                $lookup: {
                    "from": "sportslists",
                    "localField": "sport.sportslist",
                    "foreignField": "_id",
                    "as": "sport.sportslist"
                }
            },

            // Stage 5
            {
                $unwind: {
                    path: "$sport.sportslist",

                }
            },

            // Stage 6
            {
                $lookup: {
                    "from": "sportslistsubcategories",
                    "localField": "sport.sportslist.sportsListSubCategory",
                    "foreignField": "_id",
                    "as": "sportsListSubCategory"
                }
            },

            // Stage 7
            {
                $unwind: {
                    path: "$sportsListSubCategory",

                }
            },

        ];
        return pipeline;
    },

    getAthleteAggregatePipeline: function (data) {
        var pipeline = [
            // Stage 1
            {
                $lookup: {
                    "from": "schools",
                    "localField": "school",
                    "foreignField": "_id",
                    "as": "school"
                }
            },

            // Stage 2
            {
                $unwind: {
                    path: "$school",
                    preserveNullAndEmptyArrays: true
                }
            },

            // Stage 3
            {
                $match: {
                    $or: [{
                            "school.name": data.school
                        },
                        {
                            atheleteSchoolName: data.school
                        }
                    ]
                }
            },

        ];
        return pipeline;
    },

    getSchoolSpecialAwardsAggregatePipeline: function (data) {
        var pipeline = [
            // Stage 1
            {
                $lookup: {
                    "from": "registration",
                    "localField": "school",
                    "foreignField": "_id",
                    "as": "school"
                }
            },

            // Stage 2
            {
                $unwind: {
                    path: "$school",
                    preserveNullAndEmptyArrays: true
                }
            },

            // Stage 3
            {
                $match: {
                    "school.schoolName": data.school
                }
            },
        ];
        return pipeline;
    },

    searchAthlete: function (data, callback) {
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
                    fields: ['firstName', 'middleName', 'surname', 'sfaId'],
                    term: data.keyword
                }
            },
            sort: {
                asc: 'createdAt'
            },
            start: (page - 1) * maxRow,
            count: maxRow
        };
        var deepSearch = "school";
        var profile = {};
        profile.results = [];
        async.waterfall([
            function (callback) {
                Athelete.find(data.term)
                    .sort({
                        createdAt: -1
                    })
                    .order(options)
                    .keyword(options)
                    .deepPopulate(deepSearch)
                    .page(options, function (err, found) {
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
                async.concatSeries(found.results, function (mainData, callback) {
                        console.log("mainData", mainData);
                        var player = {};
                        player._id = mainData._id;
                        player.sfaId = mainData.sfaId;
                        if (mainData.middleName) {
                            player.fullName = mainData.firstName + " " + mainData.middleName + " " + mainData.surname;
                        } else {
                            player.fullName = mainData.firstName + " " + mainData.surname;
                        }
                        if (mainData.photograph) {
                            player.profilePic = mainData.photograph;
                        } else {
                            player.profilePic = '';
                        }
                        callback(null, player);
                    },
                    function (err, playerData) {
                        if (err) {
                            callback(err, null);
                        } else {
                            profile.results = playerData;
                            profile.options = found.options;
                            profile.total = found.total;
                            callback(null, profile);
                        }
                    });
            }
        ], function (err, data2) {
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

    searchSchool: function (data, callback) {
        var maxRow = 18;

        var page = 1;
        if (data.page) {
            page = data.page;
        }
        var field = data.field;
        var options = {
            field: data.field,
            filters: {
                keyword: {
                    fields: ['schoolName'],
                    term: data.keyword
                }
            },
            sort: {
                asc: 'createdAt'
            },
            start: (page - 1) * maxRow,
            count: maxRow
        };
        var profile = {};
        profile.results = [];
        async.waterfall([
            function (callback) {
                Registration.find(data.term)
                    .sort({
                        createdAt: -1
                    })
                    .order(options)
                    .keyword(options)
                    .deepPopulate()
                    .page(options, function (err, found) {
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
                async.concatSeries(found.results, function (mainData, callback) {
                        console.log("mainData", mainData);
                        var player = {};
                        player._id = mainData._id;
                        if (mainData.sfaID) {
                            player.sfaId = mainData.sfaID;
                        } else {
                            player.sfaId = '';
                        }
                        player.schoolName = mainData.schoolName;
                        if (mainData.schoolLogo) {
                            player.schoolLogo = mainData.schoolLogo;
                        } else {
                            player.schoolLogo = '';
                        }
                        callback(null, player);
                    },
                    function (err, playerData) {
                        if (err) {
                            callback(err, null);
                        } else {
                            profile.results = playerData;
                            profile.options = found.options;
                            profile.total = found.total;
                            callback(null, profile);
                        }
                    });
            }
        ], function (err, data2) {
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

    searchTeam: function (data, callback) {
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
                    fields: ['schoolName', 'name', 'teamId'],
                    term: data.keyword
                }
            },
            sort: {
                asc: 'createdAt'
            },
            start: (page - 1) * maxRow,
            count: maxRow
        };

        var deepSearch = "sport.sportslist.sportsListSubCategory.sportsListCategory sport.ageGroup sport.weight  studentTeam";
        TeamSport.find(data.term)
            .sort({
                createdAt: -1
            })
            .order(options)
            .keyword(options)
            .deepPopulate(deepSearch)
            .page(options, function (err, found) {
                if (err) {
                    callback(err, null);
                } else if (_.isEmpty(found)) {
                    callback(null, "Data is empty");
                } else {
                    callback(null, found);
                }
            });
    },

    getAthleteProfile: function (data, callback) {
        var profile = {};
        profile.sport = [];
        async.waterfall([
                function (callback) {
                    var deepSearch = "school";
                    Athelete.findOne({
                        _id: data.athleteId
                    }).lean().deepPopulate(deepSearch).exec(function (err, found) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(found)) {
                                callback(null, []);
                            } else {
                                profile.athlete = found;
                                callback(null, found);
                            }
                        }
                    });
                },
                function (found, callback) {
                    var deepSearch = "sport.sportslist.sportsListSubCategory.sportsListCategory sport.ageGroup sport.weight";
                    StudentTeam.find({
                        studentId: data.athleteId
                    }).lean().deepPopulate(deepSearch).exec(function (err, teamData) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(teamData)) {
                                callback(null, []);
                            } else {
                                _.each(teamData, function (n) {
                                    profile.sport.push(n.sport);
                                });
                                callback(null, teamData);
                            }
                        }
                    });
                },
                function (teamData, callback) {
                    var deepSearch = "sport.sportslist.sportsListSubCategory.sportsListCategory sport.ageGroup sport.weight";
                    IndividualSport.find({
                        athleteId: data.athleteId
                    }).lean().deepPopulate(deepSearch).exec(function (err, individualData) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(individualData)) {
                                callback(null, []);
                            } else {
                                _.each(individualData, function (individual) {
                                    _.each(individual.sport, function (n) {
                                        profile.sport.push(n);
                                    });
                                });
                                callback(null, individualData);
                            }
                        }
                    });
                },
                function (individualData, callback) {
                    data.sport = profile.sport;
                    Profile.getMedalsInProfile(data, function (err, medalData) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(medalData)) {
                                profile.medalData = medalData;
                            } else {
                                // profile.medalData = _.groupBy(medalData, 'medalType');
                                profile.medalData = _(medalData)
                                    .groupBy('medalType')
                                    .map(function (items, name) {
                                        return {
                                            name: name,
                                            count: items.length
                                        };
                                    }).value();
                            }
                            callback(null, profile);
                        }
                    });
                },
                function (profile, callback) {
                    SpecialAwardDetails.find({
                        athlete: data.athleteId
                    }).lean().exec(function (err, found) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(found)) {
                                profile.isSpecialAward = false;
                                callback(null, profile);
                            } else {
                                profile.isSpecialAward = true;
                                callback(null, profile);
                            }
                        }
                    });
                }
            ],
            function (err, data2) {
                if (err) {
                    callback(null, []);
                } else if (data2) {
                    if (_.isEmpty(data2)) {
                        callback(null, data2);
                    } else {
                        profile.sport = _.uniqBy(profile.sport, "sportslist.sportsListSubCategory.name");
                        console.log("length", profile.sport.length);
                        callback(null, profile);
                    }
                }
            });
    },

    getMedalsInProfile: function (data, callback) {
        var medals = [];
        async.concatSeries(data.sport, function (mainData, callback) {
                async.waterfall([
                        function (callback) {
                            Medal.find({
                                sport: mainData._id
                            }).lean().exec(function (err, found) {
                                if (err) {
                                    callback(err, null);
                                } else {
                                    if (_.isEmpty(found)) {
                                        callback(null, found);
                                    } else {
                                        callback(null, found);
                                    }
                                }
                            });
                        },
                        function (found, callback) {
                            if (_.isEmpty(found)) {
                                callback(null, medals);
                            } else {
                                async.eachSeries(found, function (singleData, callback) {
                                        if (!_.isEmpty(singleData.player)) {
                                            async.eachSeries(singleData.player, function (player, callback) {
                                                    if (player.equals(data.athleteId)) {
                                                        medals.push(singleData);
                                                    }
                                                    callback(null, singleData);
                                                },
                                                function (err) {
                                                    callback(null, singleData);
                                                });
                                        } else {
                                            // console.log("team", singleData.team);
                                            async.eachSeries(singleData.team, function (teamData, callback) {
                                                    StudentTeam.find({
                                                        sport: mainData._id,
                                                        teamId: teamData,
                                                        studentId: data.athleteId
                                                    }).lean().exec(function (err, found) {
                                                        console.log("found", found);
                                                        medals.push(singleData);
                                                        callback(null, found);
                                                    });
                                                },
                                                function (err) {
                                                    callback(null, singleData);
                                                });
                                        }
                                    },
                                    function (err) {
                                        // console.log("medals", medals)
                                        callback(null, medals);
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
            function (err, singleData) {
                callback(null, medals);
            });
    },

    getTeamProfile: function (data, callback) {
        var profile = {};
        profile.players = [];
        async.waterfall([
                function (callback) {
                    var deepSearch = "studentTeam.studentId school";
                    TeamSport.findOne({
                        _id: data.teamId
                    }).lean().deepPopulate(deepSearch).exec(function (err, found) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(found)) {
                                callback(null, []);
                            } else {
                                profile.teamName = found.name;
                                profile.teamId = found.teamId;
                                profile.school = found.schoolName;
                                profile.schoolLogo = found.school.schoolLogo;
                                callback(null, found);
                            }
                        }
                    });
                },
                function (found, callback) {
                    async.concatSeries(found.studentTeam, function (n, callback) {
                            var player = {};
                            if (n.studentId.middleName) {
                                player.playerName = n.studentId.firstName + " " + n.studentId.middleName + " " + n.studentId.surname;
                            } else {
                                player.playerName = n.studentId.firstName + " " + n.studentId.surname;
                            }
                            player.sfaId = n.studentId.sfaId;
                            player.profilePic = n.studentId.photograph;
                            player.isCaptain = n.isCaptain;
                            player.isGoalKeeper = n.isGoalKeeper;
                            player._id = n.studentId._id;
                            callback(null, player);
                        },
                        function (err, playerData) {
                            if (err) {
                                callback(err, null);
                            } else {
                                profile.players = playerData;
                                callback(null, profile);
                            }
                        });
                }
            ],
            function (err, data2) {
                if (err) {
                    callback(err, null);
                } else if (_.isEmpty(profile)) {
                    callback(null, []);
                } else {
                    callback(null, profile);
                }
            });
    },

    getSchoolProfile: function (data, callback) {
        var profile = {};
        // profile.medals = [];
        async.waterfall([
                function (callback) {
                    Registration.findOne({
                        _id: data.school
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
                    data.school = found.schoolName;
                    var pipeLine = Profile.getIndivivualAggregatePipeline(data);
                    IndividualSport.aggregate(pipeLine, function (err, matchData) {
                        if (err) {
                            callback(err, "error in mongoose");
                        } else {
                            profile.schoolName = found.schoolName;
                            profile.schoolLogo = found.schoolLogo;
                            callback(null, matchData);
                        }
                    });
                },
                function (matchData, callback) {
                    var pipeLine = Profile.getTeamAggregatePipeline(data);
                    TeamSport.aggregate(pipeLine, function (err, teamSportData) {
                        if (err) {
                            callback(err, "error in mongoose");
                        } else {
                            var sport = {};
                            sport.medals = [];
                            sport.teamData = teamSportData;
                            sport.individualData = matchData;
                            async.waterfall([
                                    function (callback) {
                                        async.each(teamSportData, function (team, callback) {
                                            data.sport = team.sport._id
                                            Profile.getMedalsInSchoolProfile(data, function (err, medalData) {
                                                if (err) {
                                                    callback(err, null);
                                                } else if (_.isEmpty(medalData)) {
                                                    callback(null, sport);
                                                } else {
                                                    sport.medals.push(medalData);
                                                    callback(null, sport);
                                                }
                                            });
                                        }, function (err) {
                                            callback(null, sport);
                                        });
                                    },
                                    function (found, callback) {
                                        async.each(matchData, function (team, callback) {
                                            async.each(team.sport, function (n, callback) {
                                                data.sport = n;
                                                Profile.getMedalsInSchoolProfile(data, function (err, medalData) {
                                                    if (err) {
                                                        callback(err, null);
                                                    } else if (_.isEmpty(medalData)) {
                                                        callback(null, sport);
                                                    } else {
                                                        sport.medals.push(medalData);
                                                        callback(null, sport);
                                                    }
                                                });
                                            }, function (err) {
                                                callback(null, sport);
                                            });
                                        }, function (err) {
                                            callback(null, sport);
                                        });
                                    }
                                ],
                                function (err, data2) {
                                    if (err) {
                                        callback(err, null);
                                    } else {
                                        callback(null, data2);
                                    }
                                });
                        }
                    });
                },
                function (sport, callback) {
                    console.log("sport", sport.medals);
                    var medalsUnique = _.uniqBy(sport.medals, function (item) {
                        return JSON.stringify(item);
                    });
                    medalsUnique = [].concat.apply([], medalsUnique);
                    profile.medalData = _(medalsUnique)
                        .groupBy('medalType')
                        .map(function (items, name) {
                            return {
                                name: name,
                                count: items.length
                            };
                        }).value();
                    var teamGroup = _(sport.teamData)
                        .groupBy('sportsListSubCategory.name')
                        .map(function (items, name) {
                            var gender = _(items)
                                .groupBy('sport.gender')
                                .map(function (values, name) {
                                    var teams = [];
                                    _.each(values, function (n) {
                                        var team = {};
                                        team.sportsListSubCategoryId = n.sportsListSubCategory._id;
                                        team.sportsListSubCategoryName = n.sportsListSubCategory.name;
                                        team.inactiveimage = n.sportsListSubCategory.inactiveimage;
                                        team.image = n.sportsListSubCategory.image;
                                        teams.push(team);
                                    });
                                    return {
                                        name: name,
                                        team: teams,
                                        count: items.length
                                    };
                                }).value();
                            return {
                                name: name,
                                gender: gender,
                                totalCount: items.length
                            };
                        }).value();

                    var individualGroup = _(sport.individualData)
                        .groupBy('sportsListSubCategory.name')
                        .map(function (items, name) {
                            var gender = _(items)
                                .groupBy('athleteId.gender')
                                .map(function (values, name) {
                                    var teams = [];
                                    _.each(values, function (n) {
                                        var team = {};
                                        team.sportsListSubCategoryId = n.sportsListSubCategory._id;
                                        team.sportsListSubCategoryName = n.sportsListSubCategory.name;
                                        team.inactiveimage = n.sportsListSubCategory.inactiveimage;
                                        team.image = n.sportsListSubCategory.image;
                                        teams.push(team);
                                    });
                                    return {
                                        name: name,
                                        individual: teams,
                                        count: items.length
                                    };
                                }).value();
                            return {
                                name: name,
                                gender: gender,
                                count: items.length
                            };
                        }).value();
                    var registerSport = [].concat.apply([], [
                        teamGroup,
                        individualGroup
                    ]);
                    profile.registerSport = registerSport;
                    callback(null, profile);
                },
                function (profile, callback) {
                    var pipeLine = Profile.getAthleteAggregatePipeline(data);
                    Athelete.aggregate(pipeLine, function (err, matchData) {
                        if (err) {
                            callback(err, "error in mongoose");
                        } else {
                            var atheletes = [];
                            _.each(matchData, function (n) {
                                var athlete = {};
                                athlete.gender = n.gender;
                                atheletes.push(athlete);
                            });
                            var atheleteData = _(atheletes)
                                .groupBy('gender')
                                .map(function (items, name) {
                                    return {
                                        name: name,
                                        // items: items,
                                        count: items.length
                                    };
                                }).value();
                            profile.athletesCount = atheleteData;
                            callback(null, profile);
                        }
                    });
                },
                function (profile, callback) {
                    var maxRow = 8;
                    var page = 1;
                    if (data.page) {
                        page = data.page;
                    }
                    var start = (page - 1) * maxRow;
                    var pipeLine = Profile.getAthleteAggregatePipeline(data);
                    var newPipeLine = _.cloneDeep(pipeLine);
                    newPipeLine.push(
                        // Stage 6
                        {
                            '$skip': parseInt(start)
                        }, {
                            '$limit': maxRow
                        });
                    Athelete.aggregate(newPipeLine, function (err, matchData) {
                        if (err) {
                            callback(err, "error in mongoose");
                        } else {
                            var atheletes = [];
                            _.each(matchData, function (n) {
                                var athlete = {};
                                if (n.middleName) {
                                    athlete.name = n.firstName + " " + n.middleName + " " + n.surname;
                                } else {
                                    athlete.name = n.firstName + " " + n.surname;
                                }
                                athlete.sfaId = n.sfaId;
                                athlete._id = n._id;
                                athlete.gender = n.gender;
                                athlete.profilePic = n.photograph;
                                atheletes.push(athlete);
                            });
                            profile.athletes = atheletes;
                            callback(null, profile);
                        }
                    });
                },
                function (profile, callback) {
                    var pipeLine = Profile.getSchoolSpecialAwardsAggregatePipeline(data);
                    SpecialAwardDetails.aggregate(pipeLine, function (err, awardData) {
                        if (err) {
                            callback(err, "error in mongoose");
                        } else if (_.isEmpty(awardData)) {
                            profile.isSpecialAward = false;
                            callback(null, profile);
                        } else {
                            profile.isSpecialAward = true;
                            callback(null, profile);
                        }
                    });
                }
            ],
            function (err, data2) {
                if (err) {
                    callback(null, []);
                } else if (data2) {
                    if (_.isEmpty(data2)) {
                        callback(null, data2);
                    } else {
                        callback(null, profile);
                    }
                }
            });
    },

    getMedalsInSchoolProfile: function (data, callback) {
        var medals = [];
        async.waterfall([
                function (callback) {
                    Medal.find({
                        sport: data.sport,
                    }).lean().exec(function (err, found) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(found)) {
                                callback(null, found);
                            } else {
                                callback(null, found);
                            }
                        }
                    });
                },
                function (found, callback) {
                    if (_.isEmpty(found)) {
                        callback(null, medals);
                    } else {
                        _.each(found, function (singleData) {
                            if (!_.isEmpty(singleData.school)) {
                                _.each(singleData.school, function (school) {
                                    if (school.schoolName === data.school) {
                                        medals.push(singleData);
                                    }
                                });
                            }
                        });
                        callback(null, medals);
                    }
                }
            ],
            function (err, data2) {
                // console.log("medal", data2);
                callback(null, data2);
            });
    },

    getAthleteStatAggregatePipeline: function (data) {
        var pipeline = [
            // Stage 1
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

            // Stage 3
            {
                $lookup: {
                    "from": "sportslists",
                    "localField": "sport.sportslist",
                    "foreignField": "_id",
                    "as": "sport.sportslist"
                }
            },

            // Stage 4
            {
                $unwind: {
                    path: "$sport.sportslist",

                }
            },
            // Stage 5
            {
                $match: {
                    "sport.sportslist.sportsListSubCategory": objectid(data.sportsListSubCategory)
                }
            },
        ];
        return pipeline;
    },

    getAthleteStats: function (data, callback) {
        var stats = {};
        async.waterfall([
                function (callback) {
                    SportsListSubCategory.findOne({
                        _id: data.sportsListSubCategory,
                    }).lean().exec(function (err, found) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(found)) {
                                callback(null, found);
                            } else {
                                callback(null, found);
                            }
                        }
                    });
                },
                function (found, callback) {
                    if (found.isTeam == false) {
                        console.log("found", found);
                        var pipeLine = Profile.getAthleteStatAggregatePipeline(data);
                        var newPipeLine = _.cloneDeep(pipeLine);
                        newPipeLine.push(
                            // Stage 6
                            {
                                $lookup: {
                                    "from": "individualsports",
                                    "localField": "opponentsSingle",
                                    "foreignField": "_id",
                                    "as": "opponentsSingle"
                                }
                            },

                            // Stage 7
                            {
                                $match: {
                                    "opponentsSingle.athleteId": objectid(data.athleteId),
                                }
                            }
                        );
                        Match.aggregate(newPipeLine, function (err, matchData) {
                            console.log("match", matchData);
                            if (err) {
                                callback(err, "error in mongoose");
                            } else {
                                var match = [];
                                _.each(matchData, function (singleData) {
                                    _.each(singleData.opponentsSingle, function (n) {
                                        if (n.athleteId.equals(data.athleteId)) {
                                            match.push(singleData);
                                        }
                                    });
                                });
                                callback(null, match);
                            }
                        });
                    } else {
                        console.log("found in else", found);
                        var pipeLine = Profile.getAthleteStatAggregatePipeline(data);
                        var newPipeLine = _.cloneDeep(pipeLine);
                        newPipeLine.push(
                            // Stage 7
                            {
                                $lookup: {
                                    "from": "teamsports",
                                    "localField": "opponentsTeam",
                                    "foreignField": "_id",
                                    "as": "opponentsTeam"
                                }
                            },

                            // Stage 8
                            {
                                $unwind: {
                                    path: "$opponentsTeam",
                                    preserveNullAndEmptyArrays: true // optional
                                }
                            },

                            // Stage 9
                            {
                                $lookup: {
                                    "from": "studentteams",
                                    "localField": "opponentsTeam.studentTeam",
                                    "foreignField": "_id",
                                    "as": "opponentsTeam.studentTeam"
                                }
                            },
                            // Stage 10
                            {
                                $match: {
                                    "opponentsTeam.studentTeam.studentId": data.athleteId
                                }
                            }
                        );
                        Match.aggregate(newPipeLine, function (err, matchData) {
                            console.log("matchData", matchData);
                            if (err) {
                                callback(err, "error in mongoose");
                            } else {
                                var match = [];
                                _.each(matchData, function (singleData) {
                                    _.each(singleData.opponentsSingle, function (n) {
                                        if (n.athleteId.equals(data.athleteId)) {
                                            match.push(singleData);
                                        }
                                    });
                                });
                                callback(null, match);
                            }
                        });
                    }
                }
            ],
            function (err, data2) {
                callback(null, data2);
            });
    },


};
module.exports = _.assign(module.exports, exports, model);