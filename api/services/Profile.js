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
                    $or: [{
                        "athleteId.school.name": data.schoolName
                    }, {
                        "athleteId.atheleteSchoolName": data.schoolName
                    }]
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
                    schoolName: data.schoolName
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
                            "school.name": data.schoolName
                        },
                        {
                            atheleteSchoolName: data.schoolName
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
                    "school": objecid(data.school)
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
                    var deepSearch = "sport.sportslist.sportsListSubCategory.sportsListCategory sport.ageGroup sport.weight sport.sportslist.drawFormat";
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
                    var deepSearch = "sport.sportslist.sportsListSubCategory.sportsListCategory sport.ageGroup sport.weight sport.sportslist.drawFormat";
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
                    var deepSearch = "studentTeam.studentId school sport sport.sportslist sport.sportslist.sportsListSubCategory sport.sportslist.drawFormat";
                    TeamSport.findOne({
                        _id: data.teamId
                    }).lean().deepPopulate(deepSearch).exec(function (err, found) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(found)) {
                                callback(null, []);
                            } else {
                                // console.log(found)
                                profile.teamName = found.name;
                                profile.teamId = found.teamId;
                                profile.school = found.schoolName;
                                profile.sportName = found.sport.sportslist.sportsListSubCategory.name;
                                profile.sportsListSubCategory = found.sport.sportslist.sportsListSubCategory._id;
                                profile.drawFormat = found.sport.sportslist.drawFormat;
                                if (found.school) {
                                    profile.schoolLogo = found.school.schoolLogo;
                                } else {
                                    profile.schoolLogo = '';
                                }
                                callback(null, found);
                            }
                        }
                    });
                },
                function (found, callback) {
                    async.concatSeries(found.studentTeam, function (n, callback) {
                            console.log(n);
                            var player = {};
                            if (n.studentId !== null) {
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
                            } else {
                                callback(null, player);
                            }
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
        async.waterfall([
                function (callback) {
                    if (!_.isEmpty(data.sfaId)) {
                        var matchObj = {
                            sfaId: "MS16" + data.sfaId
                        };
                    } else {
                        var matchObj = {
                            _id: data.school
                        };
                    }
                    Registration.findOne(matchObj).lean().exec(function (err, found) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(found)) {
                                callback(null, []);
                            } else {
                                data.schoolName = found.schoolName;
                                callback(null, found);
                            }
                        }
                    });
                },
                function (found, callback) {
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
                    // var pipeLine = Profile.getSchoolSpecialAwardsAggregatePipeline(data);
                    SpecialAwardDetails.findOne({
                        school: data.school
                    }).lean().exec(function (err, awardData) {
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
                },
                function (profile, callback) {
                    Profile.getSchoolRank(data, function (err, rankData) {
                        if (err) {
                            callback(err, null);
                        } else if (_.isEmpty(rankData)) {
                            profile.rank = "";
                            callback(null, profile);
                        } else {
                            profile.rank = rankData.rank;
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
            }

        ];
        return pipeline;
    },

    getAthleteStats: function (data, callback) {
        var match = [];
        var stats = {};
        async.each(data.sportsListSubCategory, function (sportName, callback) {
            async.waterfall([
                    function (callback) {
                        SportsListSubCategory.findOne({
                            _id: sportName,
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
                                // Stage 5
                                {
                                    $match: {
                                        "sport.sportslist.sportsListSubCategory": objectid(sportName)
                                    }
                                },
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
                                },
                                // Stage 8
                                {
                                    $lookup: {
                                        "from": "agegroups",
                                        "localField": "sport.ageGroup",
                                        "foreignField": "_id",
                                        "as": "sport.ageGroup"
                                    }
                                },

                                // Stage 9
                                {
                                    $unwind: {
                                        path: "$sport.ageGroup",

                                    }
                                },

                                // Stage 10
                                {
                                    $lookup: {
                                        "from": "weights",
                                        "localField": "sport.weight",
                                        "foreignField": "_id",
                                        "as": "sport.weight"
                                    }
                                },

                                // Stage 11
                                {
                                    $unwind: {
                                        path: "$sport.weight",
                                        preserveNullAndEmptyArrays: true // optional
                                    }
                                }
                            );
                            Match.aggregate(newPipeLine, function (err, matchData) {
                                // console.log("match", matchData);
                                if (err) {
                                    callback(err, "error in mongoose");
                                } else {
                                    // var match = [];
                                    async.each(matchData, function (singleData, callback) {
                                        var stats = {};
                                        stats.year = new Date(singleData.createdAt).getFullYear();
                                        stats.ageGroup = singleData.sport.ageGroup.name;
                                        stats.sportslist = singleData.sport.sportslist.name;
                                        stats.gender = singleData.sport.gender;
                                        if (singleData.sport.weight) {
                                            stats.weight = singleData.sport.weight.name;
                                        }
                                        stats.round = singleData.round;

                                        stats.video = singleData.video;
                                        stats.videoType = singleData.videoType;
                                        if (singleData.resultsCombat) {
                                            var i = 0;
                                            var result;
                                            async.each(singleData.opponentsSingle, function (n, callback) {
                                                if (singleData.opponentsSingle.length == 1 && n.athleteId === data.athleteId) {
                                                    var length = singleData.resultsCombat.players[0].sets.length;
                                                    while (i < length) {
                                                        console.log("players", singleData.resultsCombat.players[0].sets[i]);
                                                        if (i == 0) {
                                                            result = singleData.resultsCombat.players[0].sets[i].point;
                                                        } else {
                                                            result = result + "," + singleData.resultsCombat.players[0].sets[i].point;
                                                        }
                                                        i++;
                                                        // console.log("i", result);
                                                    }
                                                    stats.score = result;
                                                    stats.isAthleteWinner = true;
                                                    match.push(stats);
                                                    callback(null, match);
                                                } else if (!n.athleteId.equals(data.athleteId)) {
                                                    console.log("inside match else ", singleData.opponentsSingle.length, "matched id", n.athleteId, "matching", data.athleteId);
                                                    Athelete.findOne({
                                                        _id: n.athleteId
                                                    }).lean().deepPopulate("school").exec(function (err, found) {
                                                        if (found.middleName) {
                                                            stats.opponentName = found.firstName + " " + found.middleName + " " + found.surname;
                                                        } else {
                                                            stats.opponentName = found.firstName + " " + found.surname;
                                                        }
                                                        if (found.atheleteSchoolName) {
                                                            stats.school = found.atheleteSchoolName;
                                                        } else {
                                                            stats.school = found.school.name;
                                                        }
                                                        var length = singleData.resultsCombat.players[0].sets.length;
                                                        while (i < length) {
                                                            console.log("players", singleData.resultsCombat.players[0].sets[i]);
                                                            if (i == 0) {
                                                                result = singleData.resultsCombat.players[0].sets[i].point + "-" + singleData.resultsCombat.players[1].sets[i].point;
                                                            } else {
                                                                result = result + "," + singleData.resultsCombat.players[0].sets[i].point + "-" + singleData.resultsCombat.players[1].sets[i].point;
                                                            }
                                                            i++;
                                                            console.log("i", result);
                                                        }
                                                        stats.score = result;
                                                        if (singleData.resultsCombat.winner.player === n.athleteId) {
                                                            stats.isAthleteWinner = false;
                                                        } else {
                                                            stats.isAthleteWinner = true;
                                                        }
                                                        match.push(stats);
                                                        callback(null, match);
                                                    });
                                                } else {
                                                    callback(null, match);
                                                }
                                            }, function (err) {
                                                callback(null, match);
                                            });
                                        } else if (singleData.resultRacquet) {
                                            var i = 0;
                                            var result;
                                            async.each(singleData.opponentsSingle, function (n, callback) {
                                                if (singleData.opponentsSingle.length == 1 && n.athleteId === data.athleteId) {
                                                    var length = singleData.resultRacquet.players[0].sets.length;
                                                    while (i < length) {
                                                        if (i == 0) {
                                                            result = singleData.resultRacquet.players[0].sets[i].point;
                                                        } else {
                                                            result = result + "," + singleData.resultRacquet.players[0].sets[i].point;
                                                        }
                                                        i++;
                                                    }
                                                    stats.score = result;
                                                    stats.isAthleteWinner = true;
                                                    match.push(stats);
                                                    callback(null, match);
                                                } else if (!n.athleteId.equals(data.athleteId)) {
                                                    Athelete.findOne({
                                                        _id: n.athleteId
                                                    }).lean().deepPopulate("school").exec(function (err, found) {
                                                        if (found.middleName) {
                                                            stats.opponentName = found.firstName + " " + found.middleName + " " + found.surname;
                                                        } else {
                                                            stats.opponentName = found.firstName + " " + found.surname;
                                                        }
                                                        if (found.atheleteSchoolName) {
                                                            stats.school = found.atheleteSchoolName;
                                                        } else {
                                                            stats.school = found.school.name;
                                                        }
                                                        var length = singleData.resultRacquet.players[0].sets.length;
                                                        while (i < length) {
                                                            if (i == 0) {
                                                                result = singleData.resultRacquet.players[0].sets[i].point + "-" + singleData.resultRacquet.players[1].sets[i].point;
                                                            } else {
                                                                result = result + "," + singleData.resultRacquet.players[0].sets[i].point + "-" + singleData.resultRacquet.players[1].sets[i].point;
                                                            }
                                                            i++;
                                                        }
                                                        stats.score = result;
                                                        if (singleData.resultRacquet.winner.player === n.athleteId) {
                                                            stats.isAthleteWinner = false;
                                                        } else {
                                                            stats.isAthleteWinner = true;
                                                        }
                                                        match.push(stats);
                                                        callback(null, match);
                                                    });
                                                } else {
                                                    callback(null, match);
                                                }
                                            }, function (err) {
                                                callback(null, match);
                                            });
                                        } else if (singleData.resultHeat) {
                                            var i = 0;
                                            var result;
                                            async.each(singleData.resultHeat.players, function (n, callback) {
                                                if (n._id === data.athleteId) {
                                                    stats.score = n.time;
                                                    stats.result = n.result;
                                                    match.push(stats);
                                                    callback(null, match);
                                                } else {
                                                    callback(null, match);
                                                }
                                            }, function (err) {
                                                callback(null, match);
                                            });
                                        } else if (singleData.resultQualifyingRound) {
                                            if (singleData.resultQualifyingRound.player.bestAttempt) {
                                                stats.score = singleData.resultQualifyingRound.player.bestAttempt;
                                            } else if (singleData.resultQualifyingRound.player.finalScore) {
                                                stats.score = singleData.resultQualifyingRound.player.finalScore;
                                            } else {
                                                stats.score = singleData.resultQualifyingRound.player.attempt;
                                            }
                                            stats.result = singleData.resultQualifyingRound.player.result;
                                            match.push(stats);
                                            callback(null, match);
                                        } else if (singleData.resultSwiss) {
                                            var result;
                                            async.each(singleData.resultSwiss.players, function (n, callback) {
                                                if (n.athleteId === data.athleteId) {
                                                    stats.score = n.score;
                                                    stats.rank = n.rank;
                                                    match.push(stats);
                                                    callback(null, match);
                                                } else if (!n.athleteId.equals(data.athleteId)) {
                                                    Athelete.findOne({
                                                        _id: n.athleteId
                                                    }).lean().deepPopulate("school").exec(function (err, found) {
                                                        if (found.middleName) {
                                                            stats.opponentName = found.firstName + " " + found.middleName + " " + found.surname;
                                                        } else {
                                                            stats.opponentName = found.firstName + " " + found.surname;
                                                        }
                                                        if (found.atheleteSchoolName) {
                                                            stats.school = found.atheleteSchoolName;
                                                        } else {
                                                            stats.school = found.school.name;
                                                        }
                                                        if (singleData.resultSwiss.winner.player === n.athleteId) {
                                                            stats.isAthleteWinner = false;
                                                        } else {
                                                            stats.isAthleteWinner = true;
                                                        }
                                                        match.push(stats);
                                                        callback(null, match);
                                                    });
                                                } else {
                                                    callback(null, match);
                                                }
                                            }, function (err) {
                                                callback(null, match);
                                            });
                                        } else if (singleData.resultKnockout) {
                                            var result;
                                            async.each(singleData.resultKnockout.players, function (n, callback) {
                                                if (n.athleteId === data.athleteId) {
                                                    stats.score = n.score;
                                                    stats.rank = n.rank;

                                                    match.push(stats);
                                                    callback(null, match);
                                                } else if (!n.athleteId.equals(data.athleteId)) {

                                                    Athelete.findOne({
                                                        _id: n.athleteId
                                                    }).lean().deepPopulate("school").exec(function (err, found) {
                                                        if (found.middleName) {
                                                            stats.opponentName = found.firstName + " " + found.middleName + " " + found.surname;
                                                        } else {
                                                            stats.opponentName = found.firstName + " " + found.surname;
                                                        }
                                                        if (found.atheleteSchoolName) {
                                                            stats.school = found.atheleteSchoolName;
                                                        } else {
                                                            stats.school = found.school.name;
                                                        }
                                                        if (singleData.resultKnockout.winner.player === n.athleteId) {
                                                            stats.isAthleteWinner = false;
                                                        } else {
                                                            stats.isAthleteWinner = true;
                                                        }
                                                        match.push(stats);
                                                        callback(null, match);
                                                    });
                                                } else {
                                                    callback(null, match);
                                                }
                                            }, function (err) {
                                                callback(null, match);
                                            });
                                        } else if (singleData.resultShooting) {
                                            stats.score = singleData.resultShooting.finalScore;
                                            stats.result = singleData.resultShooting.result;
                                            match.push(stats);
                                            callback(null, match);

                                        } else {
                                            callback(null, match);
                                        }
                                    }, function (err) {
                                        callback(null, match);
                                    });
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
                                },
                                // Stage 8
                                {
                                    $lookup: {
                                        "from": "agegroups",
                                        "localField": "sport.ageGroup",
                                        "foreignField": "_id",
                                        "as": "sport.ageGroup"
                                    }
                                },

                                // Stage 9
                                {
                                    $unwind: {
                                        path: "$sport.ageGroup",

                                    }
                                },

                                // Stage 10
                                {
                                    $lookup: {
                                        "from": "weights",
                                        "localField": "sport.weight",
                                        "foreignField": "_id",
                                        "as": "sport.weight"
                                    }
                                },

                                // Stage 11
                                {
                                    $unwind: {
                                        path: "$sport.weight",
                                        preserveNullAndEmptyArrays: true // optional
                                    }
                                }
                            );
                            Match.aggregate(newPipeLine, function (err, matchData) {
                                console.log("matchData", matchData);
                                if (err) {
                                    callback(err, "error in mongoose");
                                } else {
                                    var match = [];
                                    async.each(matchData, function (singleData, callback) {
                                            var stats = {};
                                            stats.year = new Date(singleData.createdAt).getFullYear();
                                            stats.ageGroup = singleData.sport.ageGroup.name;
                                            stats.sportslist = singleData.sport.sportslist.name;
                                            stats.gender = singleData.sport.gender;
                                            if (singleData.sport.weight) {
                                                stats.weight = singleData.sport.weight.name;
                                            }
                                            stats.round = singleData.round;

                                            stats.video = singleData.video;
                                            stats.videoType = singleData.videoType;
                                            if (singleData.resultsCombat) {
                                                var i = 0;
                                                var result;
                                                async.each(singleData.opponentsTeam, function (n, callback) {
                                                        if (singleData.opponentsTeam.length == 1) {
                                                            var length = singleData.resultsCombat.teams[0].sets.length;
                                                            while (i < length) {
                                                                console.log("players", singleData.resultsCombat.teams[0].sets[i]);
                                                                if (i == 0) {
                                                                    result = singleData.resultsCombat.teams[0].sets[i].point;
                                                                } else {
                                                                    result = result + "," + singleData.resultsCombat.teams[0].sets[i].point;
                                                                }
                                                                i++;
                                                            }
                                                            console.log("i", result);
                                                            stats.score = result;

                                                            match.push(stats);
                                                            callback(null, match);
                                                        } else {
                                                            StudentTeam.findOne({
                                                                studentId: data.athleteId,
                                                                teamId: n
                                                            }).lean().deepPopulate("studentId.school teamId").exec(function (err, found) {
                                                                if (err) {
                                                                    callback(null, err);
                                                                } else if (_.isEmpty(found)) {
                                                                    callback(null, match);
                                                                } else {
                                                                    stats.opponentName = found.teamId.name;
                                                                    stats.school = found.teamId.schoolName;
                                                                    stats.teamId = found.teamId.teamId;
                                                                    if (singleData.resultsCombat.winner.player === n) {
                                                                        stats.isAthleteWinner = false;
                                                                        var length = singleData.resultsCombat.teams[0].sets.length;
                                                                        while (i < length) {
                                                                            console.log("teams", singleData.resultsCombat.teams[0].sets[i]);
                                                                            if (i == 0) {
                                                                                result = singleData.resultsCombat.teams[0].sets[i].point + "-" + singleData.resultsCombat.teams[1].sets[i].point;
                                                                            } else {
                                                                                result = result + "," + singleData.resultsCombat.teams[0].sets[i].point + "-" + singleData.resultsCombat.teams[1].sets[i].point;
                                                                            }
                                                                            i++;
                                                                            console.log("i", result);
                                                                        }
                                                                        stats.score = result;
                                                                    } else {
                                                                        stats.isAthleteWinner = true;
                                                                    }
                                                                    match.push(stats);
                                                                    callback(null, match);
                                                                }

                                                            });
                                                        }
                                                    },
                                                    function (err) {
                                                        callback(null, match);
                                                    });
                                            } else if (singleData.resultRacquet) {
                                                var i = 0;
                                                var result;
                                                async.each(singleData.opponentsTeam, function (n, callback) {
                                                    if (singleData.opponentsTeam.length == 1) {
                                                        var length = singleData.resultRacquet.teams[0].sets.length;
                                                        while (i < length) {
                                                            if (i == 0) {
                                                                result = singleData.resultRacquet.teams[0].sets[i].point;
                                                            } else {
                                                                result = result + "," + singleData.resultRacquet.teams[0].sets[i].point;
                                                            }
                                                            i++;
                                                        }
                                                        stats.score = result;
                                                        match.push(stats);
                                                        callback(null, match);
                                                    } else {
                                                        StudentTeam.findOne({
                                                            studentId: data.athleteId,
                                                            teamId: n
                                                        }).lean().deepPopulate("studentId.school teamId").exec(function (err, found) {
                                                            if (err) {
                                                                callback(null, err);
                                                            } else if (_.isEmpty(found)) {
                                                                callback(null, match);
                                                            } else {
                                                                stats.opponentName = found.teamId.name;
                                                                stats.school = found.teamId.schoolName;
                                                                stats.teamId = found.teamId.teamId;
                                                                if (singleData.resultRacquet.winner.player === n) {
                                                                    stats.isAthleteWinner = false;
                                                                    var length = singleData.resultRacquet.teams[0].sets.length;
                                                                    while (i < length) {

                                                                        if (i == 0) {
                                                                            result = singleData.resultRacquet.teams[0].sets[i].point + "-" + singleData.resultRacquet.teams[1].sets[i].point;
                                                                        } else {
                                                                            result = result + "," + singleData.resultRacquet.teams[0].sets[i].point + "-" + singleData.resultRacquet.teams[1].sets[i].point;
                                                                        }
                                                                        i++;
                                                                        console.log("i", result);
                                                                    }
                                                                    stats.score = result;
                                                                } else {
                                                                    stats.isAthleteWinner = true;
                                                                }
                                                                match.push(stats);
                                                                callback(null, match);
                                                            }

                                                        });
                                                    }
                                                }, function (err) {
                                                    callback(null, match);
                                                });
                                            } else if (singleData.resultHeat) {
                                                var i = 0;
                                                var result;
                                                async.each(singleData.resultHeat.teams, function (n, callback) {
                                                    StudentTeam.findOne({
                                                        studentId: data.athleteId,
                                                        teamId: n.team
                                                    }).lean().deepPopulate("studentId.school teamId").exec(function (err, found) {
                                                        if (err) {
                                                            callback(null, err);
                                                        } else if (_.isEmpty(found)) {
                                                            callback(null, match);
                                                        } else {
                                                            stats.score = n.time;
                                                            stats.result = n.result;
                                                            match.push(stats);
                                                            callback(null, match);
                                                        }
                                                    });
                                                }, function (err) {
                                                    callback(null, match);
                                                });
                                            } else if (singleData.resultBasketball) {
                                                var i = 0;
                                                var result;
                                                async.each(singleData.opponentsTeam, function (n, callback) {
                                                    if (singleData.opponentsTeam.length == 1) {
                                                        stats.score = singleData.resultBasketball.teams[0].teamResults.finalGoalPoints;
                                                        stats.isAthleteWinner = true;
                                                        match.push(stats);
                                                        callback(null, match);
                                                    } else {
                                                        StudentTeam.findOne({
                                                            studentId: data.athleteId,
                                                            teamId: n
                                                        }).lean().deepPopulate("studentId.school").exec(function (err, found) {
                                                            if (err) {
                                                                callback(null, err);
                                                            } else if (_.isEmpty(found)) {
                                                                callback(null, match);
                                                            } else {
                                                                if (found.studentId.middleName) {
                                                                    stats.opponentName = found.studentId.firstName + " " + found.studentId.middleName + " " + found.studentId.surname;
                                                                } else {
                                                                    stats.opponentName = found.studentId.firstName + " " + found.studentId.surname;
                                                                }
                                                                if (found.studentId.atheleteSchoolName) {
                                                                    stats.school = found.studentId.atheleteSchoolName;
                                                                } else {
                                                                    stats.school = found.studentId.school.name;
                                                                }
                                                                stats.score = singleData.resultBasketball.teams[0].teamResults.finalGoalPoints + "-" + singleData.resultBasketball.teams[1].teamResults.finalGoalPoints;
                                                                if (singleData.resultBasketball.winner.player === n) {
                                                                    stats.isAthleteWinner = false;
                                                                } else {
                                                                    stats.isAthleteWinner = true;
                                                                }
                                                                match.push(stats);
                                                                callback(null, match);
                                                            }

                                                        });
                                                    }
                                                }, function (err) {
                                                    callback(null, match);
                                                });
                                            } else if (singleData.resultFootball) {
                                                var i = 0;
                                                var result;
                                                async.each(singleData.opponentsTeam, function (n, callback) {
                                                    if (singleData.opponentsTeam.length == 1) {
                                                        stats.score = singleData.resultFootball.teams[0].teamResults.finalPoints;
                                                        stats.isAthleteWinner = true;
                                                        match.push(stats);
                                                        callback(null, match);
                                                    } else {
                                                        StudentTeam.findOne({
                                                            studentId: data.athleteId,
                                                            teamId: n
                                                        }).lean().deepPopulate("studentId.school").exec(function (err, found) {
                                                            if (err) {
                                                                callback(null, err);
                                                            } else if (_.isEmpty(found)) {
                                                                callback(null, match);
                                                            } else {
                                                                if (found.studentId.middleName) {
                                                                    stats.opponentName = found.studentId.firstName + " " + found.studentId.middleName + " " + found.studentId.surname;
                                                                } else {
                                                                    stats.opponentName = found.studentId.firstName + " " + found.studentId.surname;
                                                                }
                                                                if (found.studentId.atheleteSchoolName) {
                                                                    stats.school = found.studentId.atheleteSchoolName;
                                                                } else {
                                                                    stats.school = found.studentId.school.name;
                                                                }
                                                                stats.score = singleData.resultFootball.teams[0].teamResults.finalPoints + "-" + singleData.resultFootball.teams[1].teamResults.finalPoints;
                                                                if (singleData.resultFootball.winner.player === n) {
                                                                    stats.isAthleteWinner = false;
                                                                } else {
                                                                    stats.isAthleteWinner = true;
                                                                }
                                                                match.push(stats);
                                                                callback(null, match);
                                                            }

                                                        });
                                                    }
                                                }, function (err) {
                                                    callback(null, match);
                                                });
                                            } else if (singleData.resultVolleyball) {
                                                var i = 0;
                                                var result;
                                                async.each(singleData.opponentsTeam, function (n, callback) {
                                                    if (singleData.opponentsTeam.length == 1) {
                                                        var length = singleData.resultVolleyball.teams[0].teamResults.sets.length;
                                                        while (i < length) {
                                                            if (i == 0) {
                                                                result = singleData.resultVolleyball.teams[0].teamResults.sets[i].point;
                                                            } else {
                                                                result = result + "," + singleData.resultVolleyball.teams[0].teamResults.sets[i].point;
                                                            }
                                                            i++;
                                                            console.log("i", result);
                                                        }
                                                        stats.score = result;
                                                        stats.isAthleteWinner = true;
                                                        match.push(stats);
                                                        callback(null, match);
                                                    } else {
                                                        StudentTeam.findOne({
                                                            studentId: data.athleteId,
                                                            teamId: n
                                                        }).lean().deepPopulate("studentId.school").exec(function (err, found) {
                                                            if (err) {
                                                                callback(null, err);
                                                            } else if (_.isEmpty(found)) {
                                                                callback(null, match);
                                                            } else {
                                                                if (found.studentId.middleName) {
                                                                    stats.opponentName = found.studentId.firstName + " " + found.studentId.middleName + " " + found.studentId.surname;
                                                                } else {
                                                                    stats.opponentName = found.studentId.firstName + " " + found.studentId.surname;
                                                                }
                                                                if (found.studentId.atheleteSchoolName) {
                                                                    stats.school = found.studentId.atheleteSchoolName;
                                                                } else {
                                                                    stats.school = found.studentId.school.name;
                                                                }
                                                                var length = singleData.resultVolleyball.teams[0].teamResults.sets.length;
                                                                while (i < length) {
                                                                    console.log("players", singleData.resultVolleyball.teams[0].teamResults.sets[i]);
                                                                    if (i == 0) {
                                                                        result = singleData.resultVolleyball.teams[0].teamResults.sets[i].point + "-" + singleData.resultVolleyball.teams[1].teamResults.sets[i].point;
                                                                    } else {
                                                                        result = result + "," + singleData.resultVolleyball.teams[0].teamResults.sets[i].point + "-" + singleData.resultVolleyball.teams[1].teamResults.sets[i].point;
                                                                    }
                                                                    i++;
                                                                    console.log("i", result);
                                                                }
                                                                stats.score = result;
                                                                if (singleData.resultVolleyball.winner.player === n) {
                                                                    stats.isAthleteWinner = false;
                                                                } else {
                                                                    stats.isAthleteWinner = true;
                                                                }
                                                                match.push(stats);
                                                                callback(null, match);
                                                            }

                                                        });
                                                    }
                                                }, function (err) {
                                                    callback(null, match);
                                                });
                                            } else if (singleData.resultHockey) {
                                                var i = 0;
                                                var result;
                                                async.each(singleData.opponentsTeam, function (n, callback) {
                                                    if (singleData.opponentsTeam.length == 1) {
                                                        stats.score = singleData.resultHockey.teams[0].teamResults.finalPoints;
                                                        stats.isAthleteWinner = true;
                                                        match.push(stats);
                                                        callback(null, match);
                                                    } else {
                                                        StudentTeam.findOne({
                                                            studentId: data.athleteId,
                                                            teamId: n
                                                        }).lean().deepPopulate("studentId.school").exec(function (err, found) {
                                                            if (err) {
                                                                callback(null, err);
                                                            } else if (_.isEmpty(found)) {
                                                                callback(null, match);
                                                            } else {
                                                                if (found.studentId.middleName) {
                                                                    stats.opponentName = found.studentId.firstName + " " + found.studentId.middleName + " " + found.studentId.surname;
                                                                } else {
                                                                    stats.opponentName = found.studentId.firstName + " " + found.studentId.surname;
                                                                }
                                                                if (found.studentId.atheleteSchoolName) {
                                                                    stats.school = found.studentId.atheleteSchoolName;
                                                                } else {
                                                                    stats.school = found.studentId.school.name;
                                                                }
                                                                stats.score = singleData.resultHockey.teams[0].teamResults.finalPoints + "-" + singleData.resultHockey.teams[0].teamResults.finalPoints;;
                                                                if (singleData.resultHockey.winner.player === n) {
                                                                    stats.isAthleteWinner = false;
                                                                } else {
                                                                    stats.isAthleteWinner = true;
                                                                }
                                                                match.push(stats);
                                                                callback(null, match);
                                                            }

                                                        });
                                                    }
                                                }, function (err) {
                                                    callback(null, match);
                                                });
                                            } else if (singleData.resultWaterPolo) {
                                                var i = 0;
                                                var result;
                                                async.each(singleData.opponentsTeam, function (n, callback) {
                                                    if (singleData.opponentsTeam.length == 1) {
                                                        stats.score = singleData.resultWaterPolo.teams[0].teamResults.finalGoalPoint;
                                                        stats.isAthleteWinner = true;
                                                        match.push(stats);
                                                        callback(null, match);
                                                    } else {
                                                        StudentTeam.findOne({
                                                            studentId: data.athleteId,
                                                            teamId: n
                                                        }).lean().deepPopulate("studentId.school").exec(function (err, found) {
                                                            if (err) {
                                                                callback(null, err);
                                                            } else if (_.isEmpty(found)) {
                                                                callback(null, match);
                                                            } else {
                                                                if (found.studentId.middleName) {
                                                                    stats.opponentName = found.studentId.firstName + " " + found.studentId.middleName + " " + found.studentId.surname;
                                                                } else {
                                                                    stats.opponentName = found.studentId.firstName + " " + found.studentId.surname;
                                                                }
                                                                if (found.studentId.atheleteSchoolName) {
                                                                    stats.school = found.studentId.atheleteSchoolName;
                                                                } else {
                                                                    stats.school = found.studentId.school.name;
                                                                }
                                                                stats.score = singleData.resultWaterPolo.teams[0].teamResults.finalGoalPoint + "-" + singleData.resultWaterPolo.teams[0].teamResults.finalGoalPoint;;
                                                                if (singleData.resultWaterPolo.winner.player === n) {
                                                                    stats.isAthleteWinner = false;
                                                                } else {
                                                                    stats.isAthleteWinner = true;
                                                                }
                                                                match.push(stats);
                                                                callback(null, match);
                                                            }

                                                        });
                                                    }
                                                }, function (err) {
                                                    callback(null, match);
                                                });
                                            } else if (singleData.resultKabaddi) {
                                                var i = 0;
                                                var result;
                                                async.each(singleData.opponentsTeam, function (n, callback) {
                                                    if (singleData.opponentsTeam.length == 1) {
                                                        stats.score = singleData.resultKabaddi.teams[0].teamResults.finalPoints;
                                                        stats.isAthleteWinner = true;
                                                        match.push(stats);
                                                        callback(null, match);
                                                    } else {
                                                        StudentTeam.findOne({
                                                            studentId: data.athleteId,
                                                            teamId: n
                                                        }).lean().deepPopulate("studentId.school").exec(function (err, found) {
                                                            if (err) {
                                                                callback(null, err);
                                                            } else if (_.isEmpty(found)) {
                                                                callback(null, match);
                                                            } else {
                                                                if (found.studentId.middleName) {
                                                                    stats.opponentName = found.studentId.firstName + " " + found.studentId.middleName + " " + found.studentId.surname;
                                                                } else {
                                                                    stats.opponentName = found.studentId.firstName + " " + found.studentId.surname;
                                                                }
                                                                if (found.studentId.atheleteSchoolName) {
                                                                    stats.school = found.studentId.atheleteSchoolName;
                                                                } else {
                                                                    stats.school = found.studentId.school.name;
                                                                }
                                                                stats.score = singleData.resultKabaddi.teams[0].teamResults.finalPoints + "-" + singleData.resultKabaddi.teams[0].teamResults.finalPoints;;
                                                                if (singleData.resultKabaddi.winner.player === n) {
                                                                    stats.isAthleteWinner = false;
                                                                } else {
                                                                    stats.isAthleteWinner = true;
                                                                }
                                                                match.push(stats);
                                                                callback(null, match);
                                                            }

                                                        });
                                                    }
                                                }, function (err) {
                                                    callback(null, match);
                                                });
                                            } else if (singleData.resultHandball) {
                                                var i = 0;
                                                var result;
                                                async.each(singleData.opponentsTeam, function (n, callback) {
                                                    if (singleData.opponentsTeam.length == 1) {
                                                        stats.score = singleData.resultHandball.teams[0].teamResults.finalPoints;
                                                        stats.isAthleteWinner = true;
                                                        match.push(stats);
                                                        callback(null, match);
                                                    } else {
                                                        StudentTeam.findOne({
                                                            studentId: data.athleteId,
                                                            teamId: n
                                                        }).lean().deepPopulate("studentId.school").exec(function (err, found) {
                                                            if (err) {
                                                                callback(null, err);
                                                            } else if (_.isEmpty(found)) {
                                                                callback(null, match);
                                                            } else {
                                                                if (found.studentId.middleName) {
                                                                    stats.opponentName = found.studentId.firstName + " " + found.studentId.middleName + " " + found.studentId.surname;
                                                                } else {
                                                                    stats.opponentName = found.studentId.firstName + " " + found.studentId.surname;
                                                                }
                                                                if (found.studentId.atheleteSchoolName) {
                                                                    stats.school = found.studentId.atheleteSchoolName;
                                                                } else {
                                                                    stats.school = found.studentId.school.name;
                                                                }
                                                                stats.score = singleData.resultHandball.teams[0].teamResults.finalPoints + "-" + singleData.resultHandball.teams[0].teamResults.finalPoints;;
                                                                if (singleData.resultHandball.winner.player === n) {
                                                                    stats.isAthleteWinner = false;
                                                                } else {
                                                                    stats.isAthleteWinner = true;
                                                                }
                                                                match.push(stats);
                                                                callback(null, match);
                                                            }

                                                        });
                                                    }
                                                }, function (err) {
                                                    callback(null, match);
                                                });
                                            } else {
                                                callback(null, match);
                                            }
                                        },
                                        function (err) {
                                            callback(null, match);
                                        });
                                    callback(null, match);
                                }
                            });
                        }
                    },

                ],
                function (err, data2) {
                    callback(null, data2);
                });
        }, function (err) {
            callback(null, match);
        });

    },

    getTeamStats: function (data, callback) {
        var stats = {};
        var pipeLine = Profile.getAthleteStatAggregatePipeline(data);
        var newPipeLine = _.cloneDeep(pipeLine);
        newPipeLine.push(
            // Stage 5
            {
                $match: {
                    "sport.sportslist.sportsListSubCategory": objectid(data.sportsListSubCategory)
                }
            }, {
                $match: {
                    "opponentsTeam": objectid(data.teamId)
                }
            },
            // Stage 8
            {
                $lookup: {
                    "from": "agegroups",
                    "localField": "sport.ageGroup",
                    "foreignField": "_id",
                    "as": "sport.ageGroup"
                }
            },

            // Stage 9
            {
                $unwind: {
                    path: "$sport.ageGroup",

                }
            },

            // Stage 10
            {
                $lookup: {
                    "from": "weights",
                    "localField": "sport.weight",
                    "foreignField": "_id",
                    "as": "sport.weight"
                }
            },

            // Stage 11
            {
                $unwind: {
                    path: "$sport.weight",
                    preserveNullAndEmptyArrays: true // optional
                }
            });
        Match.aggregate(newPipeLine, function (err, matchData) {
            if (err) {
                callback(err, "error in mongoose");
            } else {
                var match = [];
                async.each(matchData, function (singleData, callback) {
                        var stats = {};
                        stats.year = new Date(singleData.createdAt).getFullYear();
                        stats.ageGroup = singleData.sport.ageGroup.name;
                        stats.sportslist = singleData.sport.sportslist.name;
                        stats.gender = singleData.sport.gender;
                        if (singleData.sport.weight) {
                            stats.weight = singleData.sport.weight.name;
                        }
                        stats.round = singleData.round;

                        stats.video = singleData.video;
                        stats.videoType = singleData.videoType;
                        if (singleData.resultsCombat) {
                            var i = 0;
                            var result;
                            if (singleData.opponentsTeam.length == 1) {
                                if (singleData.resultsCombat.status == "IsCompleted" && singleData.resultsCombat.isNoMatch == false) {
                                    var result;
                                    async.each(singleData.resultsCombat.teams[0].teamResults.sets, function (n, callback) {
                                        console.log("n", n, "i", i);
                                        if (i == 0) {
                                            result = n.points;
                                        } else {
                                            result = result + "," + n.points;
                                        }
                                        i++;
                                    }, function (err) {
                                        callback(null, result);
                                    });
                                    stats.score = result;
                                    stats.status = singleData.resultsCombat.status;
                                } else if (ingleData.resultsCombat.status == "IsCompleted" && singleData.resultsCombat.isNoMatch == true) {
                                    stats.reason = "No Match";
                                    stats.status = singleData.resultsCombat.status;
                                } else {
                                    stats.status = singleData.resultsCombat.status;
                                    stats.reason = "";
                                }
                                match.push(stats);
                                callback(null, match);
                            } else {
                                async.each(singleData.opponentsTeam, function (n, callback) {
                                        if (n.equals(data.teamId)) {
                                            callback();
                                        } else {
                                            TeamSport.findOne({
                                                _id: n
                                            }).lean().exec(function (err, found) {
                                                if (err) {
                                                    callback(null, err);
                                                } else if (_.isEmpty(found)) {
                                                    callback(null, match);
                                                } else {
                                                    stats.opponentName = found.name;
                                                    stats.school = found.schoolName;
                                                    stats.teamId = found.teamId;
                                                    if (singleData.resultsCombat.status == 'IsCompleted' && singleData.resultsCombat.isNoMatch == false) {
                                                        if (singleData.resultsCombat.teams[0].team === n.toString()) {
                                                            if (singleData.resultsCombat.teams[0].noShow == true && singleData.resultsCombat.teams[0].walkover == false) {
                                                                stats.reason = "Walkover";
                                                            } else if (singleData.resultsCombat.teams[0].noShow == false && singleData.resultsCombat.teams[0].walkover == true) {
                                                                stats.reason = "No Show";
                                                            } else {
                                                                stats.reason = "";
                                                            }
                                                        } else {
                                                            if (singleData.resultsCombat.teams[1].noShow == true && singleData.resultsCombat.teams[1].walkover == false) {
                                                                stats.reason = "No Show";
                                                            } else if (singleData.resultsCombat.teams[1].noShow == false && singleData.resultsCombat.teams[1].walkover == true) {
                                                                stats.reason = "Walkover";
                                                            } else {
                                                                stats.reason = "";
                                                            }
                                                        }
                                                        while (i < singleData.resultsCombat.teams[0].sets.length) {
                                                            if (i == 0) {
                                                                result = singleData.resultsCombat.teams[0].sets[i].point + "-" + singleData.resultsCombat.teams[1].sets[i].point;
                                                            } else {
                                                                result = result + "," + singleData.resultsCombat.teams[0].sets[i].point + "-" + singleData.resultsCombat.teams[1].sets[i].point;
                                                            }
                                                            i++;
                                                        }
                                                        stats.score = result;
                                                        if (singleData.resultsCombat.winner.player === n) {
                                                            stats.isAthleteWinner = false;
                                                        } else {
                                                            stats.isAthleteWinner = true;
                                                        }
                                                        stats.status = singleData.resultsCombat.status;
                                                    } else if (singleData.resultsCombat.status == 'IsCompleted' && singleData.resultsCombat.isNoMatch == true) {
                                                        stats.status = singleData.resultsCombat.status;
                                                        stats.reason = "No Match";
                                                    } else {
                                                        stats.status = singleData.resultsCombat.status;
                                                        stats.reason = "";
                                                    }
                                                    match.push(stats);
                                                    callback(null, match);
                                                }
                                            });
                                        }
                                    },
                                    function (err) {
                                        callback(null, match);
                                    });
                            }
                        } else if (singleData.resultsRacquet) {
                            var i = 0;
                            var result;
                            if (singleData.opponentsTeam.length == 1) {
                                if (singleData.resultsRacquet.status == "IsCompleted" && singleData.resultsRacquet.isNoMatch == false) {
                                    while (i < singleData.resultsRacquet.teams[0].sets.length) {
                                        if (i == 0) {
                                            result = singleData.resultsRacquet.teams[0].sets[i].point;
                                        } else {
                                            result = result + "," + singleData.resultsRacquet.teams[0].sets[i].point;
                                        }
                                        i++;
                                    }
                                    console.log("i", result);
                                    stats.score = result;
                                    stats.status = singleData.resultsRacquet.status;
                                    stats.isAthleteWinner = true;
                                } else if (singleData.resultsRacquet.status == "IsCompleted" && singleData.resultsRacquet.isNoMatch == false) {
                                    stats.status = singleData.resultsRacquet.status;
                                    stats.reason = "No Match";
                                } else {
                                    stats.status = singleData.resultsRacquet.status;
                                    stats.reason = "";
                                }
                                match.push(stats);
                                callback(null, match);
                            } else {
                                async.each(singleData.opponentsTeam, function (n, callback) {
                                        if (n.equals(n.teamId)) {
                                            callback();
                                        } else {
                                            TeamSport.findOne({
                                                _id: n
                                            }).lean().exec(function (err, found) {
                                                if (err) {
                                                    callback(null, err);
                                                } else if (_.isEmpty(found)) {
                                                    callback(null, match);
                                                } else {
                                                    stats.opponentName = found.name;
                                                    stats.school = found.schoolName;
                                                    stats.teamId = found.teamId;
                                                    if (singleData.resultsRacquet.status == "IsCompleted" && singleData.resultsRacquet.isNoMatch == false) {
                                                        if (singleData.resultsRacquet.teams[0].team === n.toString()) {
                                                            console.log("nn", singleData.resultsRacquet.teams[0].noShow);
                                                            if (singleData.resultsRacquet.teams[0].noShow == true && singleData.resultsRacquet.teams[0].walkover == false) {
                                                                stats.reason = "Walkover";
                                                            } else if (singleData.resultsRacquet.teams[0].noShow == false && singleData.resultsRacquet.teams[0].walkover == true) {
                                                                stats.reason = "No Show";
                                                            } else {
                                                                stats.reason = "";
                                                            }
                                                        } else {
                                                            if (singleData.resultsRacquet.teams[1].noShow == true && singleData.resultsRacquet.teams[1].walkover == false) {
                                                                stats.reason = "Walkover";
                                                            } else if (singleData.resultsRacquet.teams[1].noShow == false && singleData.resultsRacquet.teams[1].walkover == true) {
                                                                stats.reason = "No Show";
                                                            } else {
                                                                stats.reason = "";
                                                            }
                                                        }
                                                        while (i < singleData.resultsRacquet.teams[0].sets.length) {

                                                            if (i == 0) {
                                                                result = singleData.resultsRacquet.teams[0].sets[i].point + "-" + singleData.resultsRacquet.teams[1].sets[i].point;
                                                            } else {
                                                                result = result + "," + singleData.resultsRacquet.teams[0].sets[i].point + "-" + singleData.resultsRacquet.teams[1].sets[i].point;
                                                            }
                                                            i++;
                                                            console.log("i", result);
                                                        }
                                                        stats.score = result;
                                                        if (singleData.resultsRacquet.winner.player === n) {
                                                            stats.isAthleteWinner = false;
                                                        } else {
                                                            stats.isAthleteWinner = true;
                                                        }
                                                        stats.status = singleData.resultsRacquet.status;
                                                    } else if (singleData.resultsRacquet.status == "IsCompleted" && singleData.resultsRacquet.isNoMatch == true) {
                                                        stats.status = singleData.resultsRacquet.status;
                                                        stats.reason = "No Match";
                                                    } else {
                                                        stats.status = singleData.resultsRacquet.status;
                                                        stats.reason = "";
                                                    }
                                                    match.push(stats);
                                                    callback(null, match);
                                                }
                                            });
                                        }
                                    },
                                    function (err) {
                                        callback(null, match);
                                    });
                            }
                        } else if (singleData.resultHeat) {
                            var i = 0;
                            var result;
                            async.each(singleData.resultHeat.teams, function (n, callback) {
                                    console.log("n", n);
                                    if (n.id.equals(data.teamId)) {
                                        TeamSport.findOne({
                                            _id: n.id,
                                        }).lean().exec(function (err, found) {
                                            console.log("found", found);
                                            if (err) {
                                                callback(null, err);
                                            } else if (_.isEmpty(found)) {
                                                callback();
                                            } else {
                                                if (n.time) {
                                                    stats.score = n.time;
                                                } else {
                                                    stats.score = "";
                                                }
                                                if (n.result) {
                                                    stats.result = n.result;
                                                } else {
                                                    stats.result = "";
                                                }
                                                match.push(stats);
                                                callback(null, match);
                                            }
                                        });
                                    } else {
                                        callback();
                                    }
                                },
                                function (err) {
                                    callback(null, match);
                                });
                        } else if (singleData.resultBasketball) {
                            var i = 0;
                            var result;
                            if (singleData.opponentsTeam.length == 1) {
                                if (singleData.resultBasketball.status == "IsCompleted" && singleData.resultBasketball.isNoMatch == false) {
                                    stats.score = singleData.resultBasketball.teams[0].teamResults.finalGoalPoints;
                                    stats.isAthleteWinner = true;
                                    stats.status = singleData.resultBasketball.status;
                                    match.push(stats);
                                } else if (singleData.resultBasketball.status == "IsCompleted" && singleData.resultBasketball.isNoMatch == false) {
                                    stats.status = singleData.resultBasketball.status;
                                    stats.reason = "No Match";
                                } else {
                                    stats.status = singleData.resultBasketball.status;
                                    stats.reason = "";
                                }
                                callback(null, match);
                            } else {
                                async.each(singleData.opponentsTeam, function (n, callback) {
                                        console.log("n", n, "data.teamId", data.teamId);
                                        if (n.equals(data.teamId)) {
                                            callback();
                                        } else {
                                            TeamSport.findOne({
                                                _id: n,
                                            }).lean().exec(function (err, found) {
                                                if (err) {
                                                    callback(null, err);
                                                } else if (_.isEmpty(found)) {
                                                    callback(null, match);
                                                } else {
                                                    stats.opponentName = found.name;
                                                    stats.school = found.schoolName;
                                                    stats.teamId = found.teamId;
                                                    if (singleData.resultBasketball.status == "IsCompleted" && singleData.resultBasketball.isNoMatch == false) {
                                                        if (singleData.resultBasketball.teams[0].team === n.toString()) {
                                                            if (singleData.resultBasketball.teams[0].noShow == true && singleData.resultBasketball.teams[0].walkover == false) {
                                                                stats.reason = "Walkover";
                                                            } else if (singleData.resultBasketball.teams[0].noShow == false && singleData.resultBasketball.teams[0].walkover == true) {
                                                                stats.reason = "No Show";
                                                            } else {
                                                                stats.reason = "";
                                                            }
                                                        } else {
                                                            if (singleData.resultBasketball.teams[1].noShow == true && singleData.resultBasketball.teams[1].walkover == false) {
                                                                stats.reason = "Walkover";
                                                            } else if (singleData.resultBasketball.teams[1].noShow == false && singleData.resultBasketball.teams[1].walkover == true) {
                                                                stats.reason = "No Show";
                                                            } else {
                                                                stats.reason = "";
                                                            }
                                                        }
                                                        stats.score = singleData.resultBasketball.teams[0].teamResults.finalGoalPoints + "-" + singleData.resultBasketball.teams[1].teamResults.finalGoalPoints;
                                                        if (singleData.resultBasketball.winner.player === n) {
                                                            stats.isAthleteWinner = false;
                                                        } else {
                                                            stats.isAthleteWinner = true;
                                                        }
                                                        stats.status = singleData.resultBasketball.status;
                                                    } else if (singleData.resultBasketball.status == "IsCompleted" && singleData.resultBasketball.isNoMatch == true) {
                                                        stats.status = singleData.resultBasketball.status;
                                                        stats.reason = "No Match";
                                                    } else {
                                                        stats.status = singleData.resultBasketball.status;
                                                        stats.reason = "";
                                                    }
                                                    match.push(stats);
                                                    callback(null, match);
                                                }

                                            });
                                        }
                                    },
                                    function (err) {
                                        callback(null, match);
                                    });
                            }
                        } else if (singleData.resultFootball) {
                            var i = 0;
                            var result;
                            console.log("inside");
                            if (singleData.opponentsTeam.length == 1) {
                                if (singleData.resultFootball.status == "IsCompleted" && singleData.resultFootball.isNoMatch == false) {
                                    stats.score = singleData.resultFootball.teams[0].teamResults.finalPoints;
                                    stats.isAthleteWinner = true;
                                    stats.status = singleData.resultFootball.status;
                                } else if (singleData.resultFootball.status == "IsCompleted" && singleData.resultFootball.isNoMatch == false) {
                                    stats.status = singleData.resultFootball.status;
                                    stats.reason = "No Match";
                                } else {
                                    stats.status = singleData.resultFootball.status;
                                    stats.reason = "";
                                }
                                match.push(stats);
                                callback(null, match);
                            } else {
                                async.each(singleData.opponentsTeam, function (n, callback) {
                                    if (n.equals(data.teamId)) {
                                        callback();
                                    } else {
                                        TeamSport.findOne({
                                            _id: n,
                                        }).lean().exec(function (err, found) {
                                            if (err) {
                                                callback(null, err);
                                            } else if (_.isEmpty(found)) {
                                                callback();
                                            } else {
                                                stats.opponentName = found.name;
                                                stats.school = found.schoolName;
                                                stats.teamId = found.teamId;
                                                if (singleData.resultFootball.status == "IsCompleted" && singleData.resultFootball.isNoMatch == false) {
                                                    stats.status = singleData.resultFootball.status;
                                                    if (singleData.resultBasketball.teams[0].team === n.toString()) {
                                                        if (singleData.resultFootball.teams[0].noShow == true && singleData.resultFootball.teams[0].walkover == false) {
                                                            stats.reason = "Walkover";
                                                        } else if (singleData.resultFootball.teams[0].noShow == false && singleData.resultFootball.teams[0].walkover == true) {
                                                            stats.reason = "No Show";
                                                        } else {
                                                            stats.reason = "";
                                                        }
                                                    } else {
                                                        if (singleData.resultFootball.teams[1].noShow == true && singleData.resultFootball.teams[1].walkover == false) {
                                                            stats.reason = "Walkover";
                                                        } else if (singleData.resultFootball.teams[1].noShow == false && singleData.resultFootball.teams[1].walkover == true) {
                                                            stats.reason = "No Show";
                                                        } else {
                                                            stats.reason = "";
                                                        }
                                                    }
                                                    stats.score = singleData.resultFootball.teams[0].teamResults.finalPoints + "-" + singleData.resultFootball.teams[1].teamResults.finalPoints;
                                                    if (singleData.resultFootball.winner.player === n) {
                                                        stats.isAthleteWinner = false;
                                                    } else {
                                                        stats.isAthleteWinner = true;
                                                    }
                                                } else if (singleData.resultFootball.status == "IsCompleted" && singleData.resultFootball.isNoMatch == true) {
                                                    stats.status = singleData.resultFootball.status;
                                                    stats.reason = "No Match";
                                                } else {
                                                    stats.status = singleData.resultFootball.status;
                                                    stats.reason = "";
                                                }
                                                match.push(stats);
                                                callback(null, match);
                                            }

                                        });
                                    }
                                }, function (err) {
                                    callback(null, match);
                                });
                            }
                        } else if (singleData.resultVolleyball) {
                            var i = 0;
                            console.log("inside");
                            if (singleData.opponentsTeam.length == 1) {
                                if (singleData.resultVolleyball.status == "IsCompleted" && singleData.resultVolleyball.isNoMatch == "false") {
                                    var result;
                                    async.each(singleData.resultVolleyball.teams[0].teamResults.sets, function (n, callback) {
                                        console.log("n", n, "i", i);
                                        if (i == 0) {
                                            result = n.points + "-" + singleData.resultVolleyball.teams[0].teamResults.sets[i].points;
                                        } else {
                                            result = result + "," + n.points + "-" + singleData.resultVolleyball.teams[0].teamResults.sets[i].points;
                                        }
                                        i++;
                                    }, function (err) {
                                        callback(null, result);
                                    });
                                    stats.score = result;
                                    stats.isAthleteWinner = true;
                                    stats.status = singleData.resultVolleyball.status;
                                } else if (singleData.resultVolleyball.status == "IsCompleted" && singleData.resultVolleyball.isNoMatch == "true") {
                                    stats.status = singleData.resultVolleyball.status;
                                    stats.isAthleteWinner = false;
                                    stats.reason = "No Match";
                                } else {
                                    stats.status = singleData.resultVolleyball.status;
                                    stats.isAthleteWinner = true;
                                    stats.reason = "";
                                }
                                match.push(stats);
                                callback(null, match);
                            } else {
                                async.each(singleData.opponentsTeam, function (n, callback) {
                                    if (n.equals(data.teamId)) {
                                        if (singleData.resultVolleyball.status == "IsCompleted" && singleData.resultVolleyball.isNoMatch == false) {
                                            if (singleData.resultVolleyball.teams[0].team === n.toString()) {
                                                var i = 0;
                                                var result;
                                                if (singleData.resultVolleyball.teams[0].noShow == true && singleData.resultVolleyball.teams[0].walkover == false) {
                                                    stats.reason = "No Show";
                                                } else if (singleData.resultVolleyball.teams[0].noShow == false && singleData.resultVolleyball.teams[0].walkover == true) {
                                                    stats.reason = "Walkover";
                                                } else {
                                                    stats.reason = "";
                                                }
                                                async.each(singleData.resultVolleyball.teams[0].teamResults.sets, function (n, callback) {
                                                    if (i == 0) {
                                                        result = n.points + "-" + singleData.resultVolleyball.teams[0].teamResults.sets[i].points;
                                                    } else {
                                                        result = result + "," + n.points + "-" + singleData.resultVolleyball.teams[0].teamResults.sets[i].points;
                                                    }
                                                    i++;
                                                }, function (err) {
                                                    callback(null, result);
                                                });
                                            } else if (singleData.resultVolleyball.teams[1].team === n.toString()) {
                                                var i = 0;
                                                var result;
                                                if (singleData.resultVolleyball.teams[1].noShow == true && singleData.resultVolleyball.teams[1].walkover == false) {
                                                    stats.reason = "NO Show";
                                                } else if (singleData.resultVolleyball.teams[1].noShow == false && singleData.resultVolleyball.teams[1].walkover == true) {
                                                    stats.reason = "Walkover";
                                                } else {
                                                    stats.reason = "";
                                                }
                                                async.each(singleData.resultVolleyball.teams[1].teamResults.sets, function (n, callback) {
                                                    if (i == 0) {
                                                        result = n.points;
                                                    } else {
                                                        result = result + "," + n.points;
                                                    }
                                                    i++;
                                                }, function (err) {
                                                    callback(null, result);
                                                });
                                            }
                                        } else if (singleData.resultVolleyball.status == "IsCompleted" && singleData.resultVolleyball.isNoMatch == true) {
                                            stats.status = singleData.resultVolleyball.status;
                                            stats.reason = "No Match";
                                        } else {
                                            stats.status = singleData.resultVolleyball.status;
                                            stats.reason = "";
                                        }
                                        stats.score = result;
                                        match.push(stats);
                                        callback(null, match);
                                    } else {
                                        TeamSport.findOne({
                                            _id: n,
                                        }).lean().exec(function (err, found) {
                                            if (err) {
                                                callback(null, err);
                                            } else if (_.isEmpty(found)) {
                                                callback(null, match);
                                            } else {
                                                stats.opponentName = found.name;
                                                stats.school = found.schoolName;
                                                stats.teamId = found.teamId;
                                                if (singleData.resultVolleyball.status == "IsCompleted" && singleData.resultVolleyball.isNoMatch == false) {
                                                    if (singleData.resultVolleyball.winner.player === n) {
                                                        stats.isAthleteWinner = false;
                                                    } else {
                                                        stats.isAthleteWinner = true;
                                                    }
                                                    stats.status = singleData.resultVolleyball.status;

                                                } else if (singleData.resultVolleyball.status == "IsCompleted" && singleData.resultVolleyball.isNoMatch == true) {
                                                    stats.status = singleData.resultVolleyball.status;
                                                    stats.reason = "No Match";
                                                } else {
                                                    stats.status = singleData.resultVolleyball.status;
                                                }
                                                match.push(stats);
                                                callback(null, match);
                                            }
                                        });
                                    }
                                }, function (err) {
                                    callback(null, match);
                                });
                            }
                        } else if (singleData.resultHockey) {
                            console.log('Hockey', singleData.resultHockey);
                            var i = 0;
                            var result;
                            if (singleData.opponentsTeam.length == 1) {
                                if (singleData.resultHockey.status == "IsCompleted" && singleData.resultHockey.isNoMatch == false) {
                                    stats.score = singleData.resultHockey.teams[0].teamResults.finalPoints;
                                    stats.isAthleteWinner = true;
                                    stats.status = singleData.resultHockey.status;
                                } else if (singleData.resultHockey.status == "IsCompleted" && singleData.resultHockey.isNoMatch == true) {
                                    stats.status = singleData.resultHockey.status;
                                    stats.reason = "No Match";
                                } else {
                                    stats.status = singleData.resultHockey.status;
                                    stats.reason = "";
                                }
                                match.push(stats);
                                callback(null, match);
                            } else {
                                async.each(singleData.opponentsTeam, function (n, callback) {
                                    if (n.equals(data.teamId)) {
                                        callback();
                                    } else {
                                        TeamSport.findOne({
                                            _id: n,
                                        }).lean().exec(function (err, found) {
                                            if (err) {
                                                callback(null, err);
                                            } else if (_.isEmpty(found)) {
                                                callback(null, match);
                                            } else {
                                                stats.opponentName = found.name;
                                                stats.school = found.schoolName;
                                                stats.teamId = found.teamId;
                                                if (singleData.resultHockey.status == "IsCompleted" && singleData.resultHockey.isNoMatch == false) {
                                                    if (singleData.resultHockey.teams[0].team === n.toString()) {
                                                        if (singleData.resultHockey.teams[0].noShow == true && singleData.resultHockey.teams[0].walkover == false) {
                                                            stats.reason = "Walkover";
                                                        } else if (singleData.resultHockey.teams[0].noShow == false && singleData.resultHockey.teams[0].walkover == true) {
                                                            stats.reason = "No Show";
                                                        } else {
                                                            stats.reason = "";
                                                        }
                                                    } else {
                                                        if (singleData.resultHockey.teams[1].noShow == true && singleData.resultHockey.teams[1].walkover == false) {
                                                            stats.reason = "Walkover";
                                                        } else if (singleData.resultHockey.teams[1].noShow == false && singleData.resultHockey.teams[1].walkover == true) {
                                                            stats.reason = "No Show";
                                                        } else {
                                                            stats.reason = "";
                                                        }
                                                    }
                                                    stats.score = singleData.resultHockey.teams[0].teamResults.finalPoints + "-" + singleData.resultHockey.teams[1].teamResults.finalPoints;
                                                    if (singleData.resultHockey.winner.player === n.toString()) {
                                                        stats.isAthleteWinner = false;
                                                    } else {
                                                        stats.isAthleteWinner = true;
                                                    }
                                                    stats.status = singleData.resultHockey.status;
                                                } else if (singleData.resultHockey.status == "IsCompleted" && singleData.resultHockey.isNoMatch == false) {
                                                    stats.status = singleData.resultHockey.status;
                                                    stats.reason = "No Match";
                                                } else {
                                                    stats.status = singleData.resultHockey.status;
                                                    stats.reason = "";
                                                }
                                                match.push(stats);
                                                callback(null, match);
                                            }
                                        });
                                    }

                                }, function (err) {
                                    callback(null, match);
                                });
                            }
                        } else if (singleData.resultWaterPolo) {
                            var i = 0;
                            var result;
                            if (singleData.opponentsTeam.length == 1) {
                                if (singleData.resultWaterPolo.status == "IsCompleted" && singleData.resultWaterPolo.isNoMatch == false) {
                                    stats.score = singleData.resultWaterPolo.teams[0].teamResults.finalGoalPoint;
                                    stats.isAthleteWinner = true;
                                    stats.status = singleData.resultWaterPolo.status;
                                } else if (singleData.resultWaterPolo.status == "IsCompleted" && singleData.resultWaterPolo.isNoMatch == false) {
                                    stats.status = singleData.resultWaterPolo.status;
                                    stats.reason = "No Match";
                                } else {
                                    stats.status = singleData.resultWaterPolo.status;
                                    stats.reason = "";
                                }
                                match.push(stats);
                                callback(null, match);
                            } else {
                                async.each(singleData.opponentsTeam, function (n, callback) {
                                    if (n.equals(data.teamId)) {
                                        callback();
                                    } else {
                                        TeamSport.findOne({
                                            _id: n,
                                        }).lean().exec(function (err, found) {
                                            if (err) {
                                                callback(null, err);
                                            } else if (_.isEmpty(found)) {
                                                callback(null, match);
                                            } else {
                                                stats.opponentName = found.name;
                                                stats.school = found.schoolName;
                                                stats.teamId = found.teamId;
                                                if (singleData.resultWaterPolo.status = "IsCompleted" && singleData.resultWaterPolo.isNoMatch == false) {
                                                    if (singleData.resultWaterPolo.teams[0].team === n.toString()) {
                                                        if (singleData.resultWaterPolo.teams[0].noShow == true && singleData.resultWaterPolo.teams[0].walkover == false) {
                                                            stats.reason = "Walkover";
                                                        } else if (singleData.resultWaterPolo.teams[0].noShow == false && singleData.resultWaterPolo.teams[0].walkover == true) {
                                                            stats.reason = "No Show";
                                                        } else {
                                                            stats.reason = "";
                                                        }
                                                    } else {
                                                        if (singleData.resultWaterPolo.teams[1].noShow == true && singleData.resultWaterPolo.teams[1].walkover == false) {
                                                            stats.reason = "Walkover";
                                                        } else if (singleData.resultWaterPolo.teams[1].noShow == false && singleData.resultWaterPolo.teams[1].walkover == true) {
                                                            stats.reason = "No Show";
                                                        } else {
                                                            stats.reason = "";
                                                        }
                                                    }
                                                    stats.score = singleData.resultWaterPolo.teams[0].teamResults.finalGoalPoints + "-" + singleData.resultWaterPolo.teams[0].teamResults.finalGoalPoints;;
                                                    if (singleData.resultWaterPolo.winner.player === n.toString()) {
                                                        stats.isAthleteWinner = false;
                                                    } else {
                                                        stats.isAthleteWinner = true;
                                                    }
                                                    stats.status = singleData.resultWaterPolo.status;
                                                } else if (singleData.resultWaterPolo.status = "IsCompleted" && singleData.resultWaterPolo.isNoMatch == true) {
                                                    stats.status = singleData.resultWaterPolo.status;
                                                    stats.reason = "No Match";
                                                } else {
                                                    stats.status = singleData.resultWaterPolo.status;
                                                    stats.reason = "";
                                                }
                                                match.push(stats);
                                                callback(null, match);
                                            }
                                        });
                                    }
                                }, function (err) {
                                    callback(null, match);
                                });
                            }
                        } else if (singleData.resultKabaddi) {
                            var i = 0;
                            var result;
                            if (singleData.opponentsTeam.length == 1) {
                                if (singleData.resultKabaddi.status == "IsCompleted" && singleData.resultKabaddi.isNoMatch == false) {
                                    stats.score = singleData.resultKabaddi.teams[0].teamResults.finalPoints;
                                    stats.isAthleteWinner = true;
                                    stats.status = singleData.resultKabaddi.status;
                                } else if (singleData.resultKabaddi.status == "IsCompleted" && singleData.resultKabaddi.isNoMatch == false) {
                                    stats.status = singleData.resultKabaddi.status;
                                    stats.reason = "No Match";
                                } else {
                                    stats.status = singleData.resultKabaddi.status;
                                    stats.reason = "";
                                }
                                match.push(stats);
                                callback(null, match);
                            } else {
                                async.each(singleData.opponentsTeam, function (n, callback) {
                                    if (n.equals(data.teamId)) {
                                        callback();
                                    } else {
                                        TeamSport.findOne({
                                            _id: n,
                                        }).lean().exec(function (err, found) {
                                            if (err) {
                                                callback(null, err);
                                            } else if (_.isEmpty(found)) {
                                                callback(null, match);
                                            } else {
                                                stats.opponentName = found.name;
                                                stats.school = found.schoolName;
                                                stats.teamId = found.teamId;
                                                if (singleData.resultKabaddi.status == 'IsCompleted' && singleData.resultKabaddi.isNoMatch == false) {
                                                    if (singleData.resultKabaddi.teams[0].team === n.toString()) {
                                                        if (singleData.resultKabaddi.teams[0].noShow == true && singleData.resultKabaddi.teams[0].walkover == false) {
                                                            stats.reason = "Walkover";
                                                        } else if (singleData.resultKabaddi.teams[0].noShow == false && singleData.resultKabaddi.teams[0].walkover == true) {
                                                            stats.reason = "No Show";
                                                        } else {
                                                            stats.reason = "";
                                                        }
                                                    } else {
                                                        if (singleData.resultKabaddi.teams[1].noShow == true && singleData.resultKabaddi.teams[1].walkover == false) {
                                                            stats.reason = "Walkover";
                                                        } else if (singleData.resultKabaddi.teams[1].noShow == false && singleData.resultKabaddi.teams[1].walkover == true) {
                                                            stats.reason = "No Show";
                                                        } else {
                                                            stats.reason = "";
                                                        }
                                                    }
                                                    stats.score = singleData.resultKabaddi.teams[0].teamResults.finalPoints + "-" + singleData.resultKabaddi.teams[0].teamResults.finalPoints;
                                                    if (singleData.resultKabaddi.winner.player === n.toString()) {
                                                        stats.isAthleteWinner = false;
                                                    } else {
                                                        stats.isAthleteWinner = true;
                                                    }
                                                    stats.status = singleData.resultKabaddi.status;
                                                } else if (singleData.resultKabaddi.status == 'IsCompleted' && singleData.resultKabaddi.isNoMatch == false) {
                                                    stats.status = singleData.resultKabaddi.status;
                                                    stats.reason = "No Match";
                                                } else {
                                                    stats.status = singleData.resultKabaddi.status;
                                                    stats.reason = "";
                                                }
                                                match.push(stats);
                                                callback(null, match);
                                            }
                                        });
                                    }
                                }, function (err) {
                                    callback(null, match);
                                });
                            }
                        } else if (singleData.resultHandball) {
                            var i = 0;
                            var result;
                            if (singleData.opponentsTeam.length == 1) {
                                if (singleData.resultHandball.status == "IsCompleted" && singleData.resultHandball.isNoMatch == false) {
                                    stats.score = singleData.resultHandball.teams[0].teamResults.finalPoints;
                                    stats.isAthleteWinner = true;
                                    stats.status = singleData.resultHandball.status;
                                } else if (singleData.resultHandball.status == "IsCompleted" && singleData.resultHandball.isNoMatch == true) {
                                    stats.status = singleData.resultHandball.status;
                                    stats.reason = "No Match";
                                } else {
                                    stats.status = singleData.resultHandball.status;
                                    stats.reason = "";
                                }
                                match.push(stats);
                                callback(null, match);
                            } else {
                                async.each(singleData.opponentsTeam, function (n, callback) {
                                    if (n.equals(data.teamId)) {
                                        callback();
                                    } else {
                                        TeamSport.findOne({
                                            _id: n,
                                        }).lean().exec(function (err, found) {
                                            if (err) {
                                                callback(null, err);
                                            } else if (_.isEmpty(found)) {
                                                callback(null, match);
                                            } else {
                                                stats.opponentName = found.name;
                                                stats.school = found.schoolName;
                                                stats.teamId = found.teamId;
                                                if (singleData.resultHandball.status == 'IsCompleted' && singleData.resultHandball.isNoMatch == false) {
                                                    if (singleData.resultHandball.teams[0].team === n.toString()) {
                                                        if (singleData.resultHandball.teams[0].noShow == true && singleData.resultHandball.teams[0].walkover == false) {
                                                            stats.reason = "Walkover";
                                                        } else if (singleData.resultHandball.teams[0].noShow == false && singleData.resultHandball.teams[0].walkover == true) {
                                                            stats.reason = "No Show";
                                                        } else {
                                                            stats.reason = "";
                                                        }
                                                    } else {
                                                        if (singleData.resultHandball.teams[1].noShow == true && singleData.resultHandball.teams[1].walkover == false) {
                                                            stats.reason = "Walkover";
                                                        } else if (singleData.resultHandball.teams[1].noShow == false && singleData.resultHandball.teams[1].walkover == true) {
                                                            stats.reason = "No Show";
                                                        } else {
                                                            stats.reason = "";
                                                        }
                                                    }
                                                    stats.score = singleData.resultHandball.teams[0].teamResults.finalPoints + "-" + singleData.resultHandball.teams[0].teamResults.finalPoints;;
                                                    if (singleData.resultHandball.winner.player === n) {
                                                        stats.isAthleteWinner = false;
                                                    } else {
                                                        stats.isAthleteWinner = true;
                                                    }
                                                    stats.status = singleData.resultHandball.status;
                                                } else if (singleData.resultHandball.status == 'IsCompleted' && singleData.resultHandball.isNoMatch == false) {
                                                    stats.status = singleData.resultHandball.status;
                                                    stats.reason = "No Match";
                                                } else {
                                                    stats.status = singleData.resultHandball.status;
                                                    stats.reason = "";
                                                }
                                                match.push(stats);
                                                callback(null, match);
                                            }

                                        });
                                    }
                                }, function (err) {
                                    callback(null, match);
                                });
                            }
                        } else {
                            console.log('else', match);
                            callback(null, match);
                        }
                    },
                    function (err) {
                        callback(null, match);
                    });
            }
        });

    },

    getSchoolStats: function (data, callback) {
        var profile = {};
        profile.match = [];
        profile.players = [];
        async.each(data.sportsListSubCategory, function (sportName, callback) {
                console.log("data", data);
                async.waterfall([
                        function (callback) {
                            SportsListSubCategory.findOne({
                                _id: sportName,
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
                                    // Stage 5
                                    {
                                        $match: {
                                            "sport.sportslist.sportsListSubCategory": objectid(sportName)
                                        }
                                    },
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
                                        $unwind: {
                                            path: "$opponentsSingle",
                                        }
                                    },

                                    // Stage 8
                                    {
                                        $lookup: {
                                            "from": "atheletes",
                                            "localField": "opponentsSingle.athleteId",
                                            "foreignField": "_id",
                                            "as": "opponentsSingle.athleteId"
                                        }
                                    },

                                    // Stage 9
                                    {
                                        $unwind: {
                                            path: "$opponentsSingle.athleteId",
                                        }
                                    },

                                    // Stage 10
                                    {
                                        $lookup: {
                                            "from": "schools",
                                            "localField": "opponentsSingle.athleteId.school",
                                            "foreignField": "_id",
                                            "as": "opponentsSingle.athleteId.school"
                                        }
                                    },

                                    // Stage 11
                                    {
                                        $unwind: {
                                            path: "$opponentsSingle.athleteId.school",

                                        }
                                    },

                                    // Stage 12
                                    {
                                        $match: {
                                            "opponentsSingle.athleteId.school.name": data.schoolName
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

                                    {
                                        $unwind: {
                                            path: "$sport.ageGroup",

                                        }
                                    },

                                    {
                                        $lookup: {
                                            "from": "weights",
                                            "localField": "sport.weight",
                                            "foreignField": "_id",
                                            "as": "sport.weight"
                                        }
                                    }, {
                                        $unwind: {
                                            path: "$sport.weight",
                                            preserveNullAndEmptyArrays: true // optional
                                        }
                                    }, {
                                        $sort: {
                                            createdAt: 1
                                        }
                                    }
                                );
                                Match.aggregate(newPipeLine, function (err, matchData) {
                                    // console.log("matchData", matchData);
                                    if (err) {
                                        callback(err, "error in mongoose");
                                    } else {
                                        async.each(matchData, function (singleData, callback) {
                                                var stats = {};
                                                stats.year = new Date(singleData.createdAt).getFullYear();
                                                stats.ageGroup = singleData.sport.ageGroup.name;
                                                stats.sportslist = singleData.sport.sportslist.name;
                                                stats.gender = singleData.sport.gender;
                                                if (singleData.sport.weight) {
                                                    stats.weight = singleData.sport.weight.name;
                                                }
                                                stats.round = singleData.round;
                                                stats.video = singleData.video;
                                                stats.videoType = singleData.videoType;
                                                var player = {};
                                                // console.log("singleData", singleData);
                                                if (singleData.resultsCombat) {
                                                    var i = 0;
                                                    if (singleData.resultsCombat.players.length == 1) {
                                                        console.log('For single Combat', singleData.resultsCombat.players.player);
                                                        Athelete.findOne({
                                                            _id: singleData.resultsCombat.players.player
                                                        }).lean().deepPopulate("school").exec(function (err, found) {
                                                            console.log('For Single Player', found);
                                                            if (found.middleName) {
                                                                var name = found.firstName + " " + found.middleName + " " + found.surname;
                                                            } else {
                                                                var name = found.firstName + " " + found.surname;
                                                            }
                                                            if (found.atheleteSchoolName) {
                                                                var school = found.atheleteSchoolName;
                                                            } else {
                                                                var school = found.school.name;
                                                            }
                                                            var player = {};
                                                            player.name = name;
                                                            player.school = school;
                                                            player.sfaId = found.sfaId;
                                                            player.profilePic = found.photograph;
                                                            profile.players.push(player);
                                                            while (i < singleData.resultsCombat.players[0].sets.length) {
                                                                console.log("players", singleData.resultsCombat.players[0].sets[i]);
                                                                if (i == 0) {
                                                                    result = singleData.resultsCombat.players[0].sets[i].point;
                                                                } else {
                                                                    result = result + "," + singleData.resultsCombat.players[0].sets[i].point;
                                                                }
                                                                i++;
                                                            }
                                                            stats.isAthleteWinner = true;
                                                            stats.score = result;
                                                            profile.match.push(stats);
                                                            callback(null, stats);
                                                        });
                                                    } else {
                                                        async.each(singleData.resultsCombat.players, function (player, callback) {
                                                                console.log('list of player', player);
                                                                Athelete.findOne({
                                                                    _id: player.player
                                                                }).lean().deepPopulate("school").exec(function (err, found) {
                                                                    if (found.middleName) {
                                                                        var name = found.firstName + " " + found.middleName + " " + found.surname;
                                                                    } else {
                                                                        var name = found.firstName + " " + found.surname;
                                                                    }
                                                                    if (found.atheleteSchoolName) {
                                                                        var school = found.atheleteSchoolName;
                                                                    } else {
                                                                        var school = found.school.name;
                                                                    }
                                                                    if (!player.equals(singleData.opponentsSingle.athleteId)) {
                                                                        stats.opponentName = name;
                                                                        stats.school = school;
                                                                        if (singleData.resultsCombat.winner.player === player) {
                                                                            stats.isAthleteWinner = false;
                                                                        } else {
                                                                            stats.isAthleteWinner = true;
                                                                        }
                                                                        var player = {};
                                                                        player.name = name;
                                                                        player.school = school;
                                                                        player.sfaId = found.sfaId;
                                                                        player.profilePic = found.photograph;
                                                                        profile.match.push(stats);
                                                                        profile.players.push(player);
                                                                        callback(null, profile.match);
                                                                    } else {
                                                                        var player = {};
                                                                        player.name = name;
                                                                        player.school = school;
                                                                        player.sfaId = found.sfaId;
                                                                        player.profilePic = found.photograph;
                                                                        profile.players.push(player);
                                                                        while (i < singleData.resultsCombat.players[0].sets.length) {
                                                                            if (i == 0) {
                                                                                result = singleData.resultsCombat.players[0].sets[i].point + "-" + singleData.resultsCombat.players[1].sets[i].point;
                                                                            } else {
                                                                                result = result + "," + singleData.resultsCombat.players[0].sets[i].point + "-" + singleData.resultsCombat.players[1].sets[i].point;
                                                                            }
                                                                            i++;
                                                                        }
                                                                        stats.score = result;
                                                                        profile.match.push(stats);
                                                                        callback(null, stats);
                                                                    }
                                                                });
                                                            },
                                                            function (err) {
                                                                callback(null, stats);
                                                            });
                                                    }
                                                } else if (singleData.resultRacquets) {
                                                    var i = 0;
                                                    if (singleData.resultRacquets.players.length == 1) {
                                                        Athelete.findOne({
                                                            _id: singleData.resultRacquets.players.player
                                                        }).lean().deepPopulate("school").exec(function (err, found) {
                                                            if (found.middleName) {
                                                                var name = found.firstName + " " + found.middleName + " " + found.surname;
                                                            } else {
                                                                var name = found.firstName + " " + found.surname;
                                                            }
                                                            if (found.atheleteSchoolName) {
                                                                var school = found.atheleteSchoolName;
                                                            } else {
                                                                var school = found.school.name;
                                                            }
                                                            var player = {};
                                                            player.name = name;
                                                            player.school = school;
                                                            player.sfaId = found.sfaId;
                                                            player.profilePic = found.photograph;
                                                            profile.players.push(player);
                                                            while (i < singleData.resultRacquets.players[0].sets.length) {
                                                                console.log("players", singleData.resultRacquets.players[0].sets[i]);
                                                                if (i == 0) {
                                                                    result = singleData.resultRacquets.players[0].sets[i].point;
                                                                } else {
                                                                    result = result + "," + singleData.resultRacquets.players[0].sets[i].point;
                                                                }
                                                                i++;
                                                            }
                                                            stats.isAthleteWinner = true;
                                                            stats.score = result;
                                                            profile.match.push(stats);
                                                            callback(null, stats);
                                                        });
                                                    } else {
                                                        async.each(singleData.resultRacquets.players, function (player, callback) {
                                                                Athelete.findOne({
                                                                    _id: player.player
                                                                }).lean().deepPopulate("school").exec(function (err, found) {
                                                                    if (found.middleName) {
                                                                        var name = found.firstName + " " + found.middleName + " " + found.surname;
                                                                    } else {
                                                                        var name = found.firstName + " " + found.surname;
                                                                    }
                                                                    if (found.atheleteSchoolName) {
                                                                        var school = found.atheleteSchoolName;
                                                                    } else {
                                                                        var school = found.school.name;
                                                                    }
                                                                    if (!player.equals(singleData.opponentsSingle.athleteId)) {
                                                                        stats.opponentName = name;
                                                                        stats.school = school;
                                                                        if (singleData.resultRacquets.winner.player === player) {
                                                                            stats.isAthleteWinner = false;
                                                                        } else {
                                                                            stats.isAthleteWinner = true;
                                                                        }
                                                                        var player = {};
                                                                        player.name = name;
                                                                        player.school = school;
                                                                        player.sfaId = found.sfaId;
                                                                        player.profilePic = found.photograph;
                                                                        profile.players.push(player);
                                                                        profile.match.push(stats);
                                                                    } else {
                                                                        var player = {};
                                                                        player.name = name;
                                                                        player.school = school;
                                                                        player.sfaId = found.sfaId;
                                                                        player.profilePic = found.photograph;
                                                                        profile.players.push(player);
                                                                        while (i < singleData.resultRacquets.players[0].sets.length) {
                                                                            if (i == 0) {
                                                                                result = singleData.resultRacquets.players[0].sets[i].point + "-" + singleData.resultRacquets.players[1].sets[i].point;
                                                                            } else {
                                                                                result = result + "," + singleData.resultRacquets.players[0].sets[i].point + "-" + singleData.resultRacquets.players[1].sets[i].point;
                                                                            }
                                                                            i++;
                                                                        }
                                                                        stats.score = result;
                                                                    }
                                                                    profile.match.push(stats);
                                                                    callback(null, profile);
                                                                });
                                                            },
                                                            function (err) {
                                                                callback(null, stats);
                                                            });
                                                    }
                                                } else if (singleData.resultHeat) {
                                                    var i = 0;
                                                    var result;
                                                    async.each(singleData.resultHeat.players, function (n, callback) {
                                                        if (n.id) {
                                                            IndividualSport.findOne({
                                                                _id: n.id
                                                            }).lean().deepPopulate("athleteId.school").exec(function (err, found) {
                                                                if (found.athleteId.middleName) {
                                                                    var name = found.athleteId.firstName + " " + found.athleteId.middleName + " " + found.athleteId.surname;
                                                                } else {
                                                                    var name = found.athleteId.firstName + " " + found.athleteId.surname;
                                                                }
                                                                if (found.athleteId.atheleteSchoolName) {
                                                                    var school = found.athleteId.atheleteSchoolName;
                                                                } else {
                                                                    var school = found.athleteId.school.name;
                                                                }
                                                                var player = {};
                                                                player.name = name;
                                                                player.school = school;
                                                                player.sfaId = found.athleteId.sfaId;
                                                                player.profilePic = found.athleteId.photograph;
                                                                profile.players.push(player);
                                                                stats.score = n.time;
                                                                stats.result = n.result;
                                                                profile.match.push(stats);
                                                                callback(null, profile);
                                                            });
                                                        } else {
                                                            callback(null, profile);
                                                        }
                                                    }, function (err) {
                                                        callback(null, profile.match);
                                                    });
                                                } else if (singleData.resultQualifyingRound) {
                                                    Athelete.findOne({
                                                        _id: singleData.opponentsSingle.athleteId
                                                    }).lean().deepPopulate("school").exec(function (err, found) {
                                                        if (found.middleName) {
                                                            var name = found.firstName + " " + found.middleName + " " + found.surname;
                                                        } else {
                                                            var name = found.firstName + " " + found.surname;
                                                        }
                                                        if (found.atheleteSchoolName) {
                                                            var school = found.atheleteSchoolName;
                                                        } else {
                                                            var school = found.school.name;
                                                        }
                                                        var player = {};
                                                        player.name = name;
                                                        player.school = school;
                                                        player.sfaId = found.sfaId;
                                                        player.profilePic = found.photograph;
                                                        profile.players.push(player);
                                                        profile.match.push(stats);
                                                        if (singleData.resultQualifyingRound.player.bestAttempt) {
                                                            stats.score = singleData.resultQualifyingRound.player.bestAttempt;
                                                        } else if (singleData.resultQualifyingRound.player.finalScore) {
                                                            stats.score = singleData.resultQualifyingRound.player.finalScore;
                                                        } else {
                                                            stats.score = singleData.resultQualifyingRound.player.attempt;
                                                        }
                                                        stats.result = singleData.resultQualifyingRound.player.result;
                                                        profile.match.push(stats);
                                                        callback(null, profile.match);
                                                    });
                                                } else if (singleData.resultSwiss) {
                                                    var result;
                                                    var name;
                                                    var school;
                                                    Athelete.findOne({
                                                        _id: singleData.opponentsSingle.athleteId
                                                    }).lean().deepPopulate("school").exec(function (err, found) {
                                                        if (found.middleName) {
                                                            name = found.firstName + " " + found.middleName + " " + found.surname;
                                                        } else {
                                                            name = found.firstName + " " + found.surname;
                                                        }
                                                        if (found.atheleteSchoolName) {
                                                            school = found.atheleteSchoolName;
                                                        } else {
                                                            school = found.school.name;
                                                        }
                                                        var player = {};
                                                        player.name = name;
                                                        player.school = school;
                                                        player.sfaId = found.sfaId;
                                                        player.profilePic = found.photograph;
                                                        profile.players.push(player);
                                                    });
                                                    async.each(singleData.resultSwiss.players, function (n, callback) {
                                                        if (n.id === singleData.opponentsSingle._id) {
                                                            stats.score = n.score;
                                                            stats.rank = n.rank;
                                                            profile.match.push(stats);
                                                            callback(null, profile.match);
                                                        } else if (!n.id.equals(singleData.opponentsSingle._id)) {
                                                            if (singleData.resultSwiss.winner.player === n.athleteId) {
                                                                stats.isAthleteWinner = false;
                                                            } else {
                                                                stats.isAthleteWinner = true;
                                                            }
                                                            profile.match.push(stats);
                                                            callback(null, profile);
                                                        }
                                                    }, function (err) {
                                                        callback(null, profile);
                                                    });
                                                } else if (singleData.resultKnockout) {
                                                    var result;
                                                    var name;
                                                    var school;
                                                    Athelete.findOne({
                                                        _id: singleData.opponentsSingle.athleteId
                                                    }).lean().deepPopulate("school").exec(function (err, found) {
                                                        if (found.middleName) {
                                                            name = found.firstName + " " + found.middleName + " " + found.surname;
                                                        } else {
                                                            name = found.firstName + " " + found.surname;
                                                        }
                                                        if (found.atheleteSchoolName) {
                                                            school = found.atheleteSchoolName;
                                                        } else {
                                                            school = found.school.name;
                                                        }
                                                        var player = {};
                                                        player.name = name;
                                                        player.school = school;
                                                        player.sfaId = found.sfaId;
                                                        player.profilePic = found.photograph;
                                                        profile.players.push(player);
                                                    });
                                                    async.each(singleData.resultKnockout.players, function (n, callback) {
                                                        if (n.playerId === singleData.opponentsSingle._id) {
                                                            stats.score = n.score;
                                                            stats.rank = n.rank;
                                                            profile.match.push(stats);
                                                            callback(null, profile.match);
                                                        } else if (!n.playerId.equals(singleData.opponentsSingle._id)) {
                                                            if (singleData.resultKnockout.winner.player === n.athleteId) {
                                                                stats.isAthleteWinner = false;
                                                            } else {
                                                                stats.isAthleteWinner = true;
                                                            }
                                                            stats.opponentName = name;
                                                            stats.school = school;
                                                            profile.match.push(stats);
                                                            callback(null, profile.match);
                                                        }
                                                    }, function (err) {
                                                        callback(null, profile.match);
                                                    });
                                                } else if (singleData.resultShooting) {
                                                    console.log("inside resultShooting", singleData.opponentsSingle);
                                                    stats.score = singleData.resultShooting.finalScore;
                                                    stats.result = singleData.resultShooting.result;
                                                    if (singleData.opponentsSingle.athleteId.middleName) {
                                                        var name = singleData.opponentsSingle.athleteId.firstName + " " + singleData.opponentsSingle.athleteId.middleName + " " + singleData.opponentsSingle.athleteId.surname;
                                                    } else {
                                                        var name = singleData.opponentsSingle.athleteId.firstName + " " + singleData.opponentsSingle.athleteId.surname;
                                                    }
                                                    if (singleData.opponentsSingle.athleteId.atheleteSchoolName) {
                                                        var school = singleData.opponentsSingle.athleteId.atheleteSchoolName;
                                                    } else {
                                                        var school = singleData.opponentsSingle.athleteId.school.name;
                                                    }
                                                    var player1 = {};
                                                    player1.name = name;
                                                    player1.school = school;
                                                    player1.sfaId = singleData.opponentsSingle.athleteId.sfaId;
                                                    player1.profilePic = singleData.opponentsSingle.athleteId.photograph;
                                                    profile.players.push(player1);
                                                    profile.match.push(stats);
                                                    callback(null, profile);

                                                } else {
                                                    callback(null, profile);
                                                }
                                            },
                                            function (err) {
                                                callback(null, profile);
                                            });
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
                                    // Stage 7
                                    {
                                        $unwind: {
                                            path: "$opponentsTeam"
                                        }
                                    },

                                    {
                                        $match: {
                                            "$opponentsTeam.schoolName": data.schoolName
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

                                    {
                                        $unwind: {
                                            path: "$sport.ageGroup",

                                        }
                                    },

                                    {
                                        $lookup: {
                                            "from": "weights",
                                            "localField": "sport.weight",
                                            "foreignField": "_id",
                                            "as": "sport.weight"
                                        }
                                    }, {
                                        $unwind: {
                                            path: "$sport.weight",
                                            preserveNullAndEmptyArrays: true // optional
                                        }
                                    }, {
                                        $sort: {
                                            createdAt: 1
                                        }
                                    }
                                );
                                Match.aggregate(newPipeLine, function (err, matchData) {
                                    console.log("matchData", matchData);
                                    if (err) {
                                        callback(err, "error in mongoose");
                                    } else {
                                        // var match = [];
                                        async.each(matchData, function (singleData, callback) {
                                                var stats = {};
                                                stats.year = new Date(singleData.createdAt).getFullYear();
                                                stats.ageGroup = singleData.sport.ageGroup.name;
                                                stats.sportslist = singleData.sport.sportslist.name;
                                                stats.gender = singleData.sport.gender;
                                                if (singleData.sport.weight) {
                                                    stats.weight = singleData.sport.weight.name;
                                                }
                                                stats.round = singleData.round;
                                                stats.video = singleData.video;
                                                stats.videoType = singleData.videoType;
                                                if (singleData.resultsCombat) {
                                                    var i = 0;
                                                    var result;
                                                    if (singleData.resultsCombat.teams.length == 1) {
                                                        var p = 0;
                                                        while (p < singleData.resultsCombat.teams[0].players.length) {
                                                            Athelete.findOne({
                                                                _id: singleData.resultsCombat.teams[0].players[p].player
                                                            }).lean().deepPopulate("school").exec(function (err, found) {
                                                                if (found.middleName) {
                                                                    var name = found.firstName + " " + found.middleName + " " + found.surname;
                                                                } else {
                                                                    var name = found.firstName + " " + found.surname;
                                                                }
                                                                if (found.atheleteSchoolName) {
                                                                    var school = found.atheleteSchoolName;
                                                                } else {
                                                                    var school = found.school.name;
                                                                }
                                                                var player = {};
                                                                player.name = name;
                                                                player.school = school;
                                                                player.sfaId = found.sfaId;
                                                                player.profilePic = found.photograph;
                                                                profile.players.push(player);
                                                            });
                                                            p++;
                                                        }
                                                        while (i < singleData.resultsCombat.teams[0].sets.length) {
                                                            if (i == 0) {
                                                                result = singleData.resultsCombat.teams[0].sets[i].point;
                                                            } else {
                                                                result = result + "," + singleData.resultsCombat.teams[0].sets[i].point;
                                                            }
                                                            i++;
                                                            console.log("i", result);
                                                        }
                                                        stats.score = result;
                                                        stats.isAthleteWinner = true;
                                                        profile.match.push(stats);
                                                        callback(null, profile);
                                                    } else {
                                                        async.each(singleData.resultsCombat.teams, function (n, callback) {
                                                                var p = 0;
                                                                while (p < n.players.length) {
                                                                    Athelete.findOne({
                                                                        _id: n.players[p].player
                                                                    }).lean().deepPopulate("school").exec(function (err, found) {
                                                                        if (found.middleName) {
                                                                            var name = found.firstName + " " + found.middleName + " " + found.surname;
                                                                        } else {
                                                                            var name = found.firstName + " " + found.surname;
                                                                        }
                                                                        if (found.atheleteSchoolName) {
                                                                            var school = found.atheleteSchoolName;
                                                                        } else {
                                                                            var school = found.school.name;
                                                                        }
                                                                        var player = {};
                                                                        player.name = name;
                                                                        player.school = school;
                                                                        player.sfaId = found.sfaId;
                                                                        player.profilePic = found.photograph;
                                                                        profile.players.push(player);
                                                                    });
                                                                    p++;
                                                                }
                                                                if (n.team !== opponentsTeam._id) {
                                                                    TeamSport.findOne({
                                                                        teamId: n.team
                                                                    }).lean().exec(function (err, found) {
                                                                        if (err) {
                                                                            callback(null, err);
                                                                        } else if (_.isEmpty(found)) {
                                                                            callback(null, profile.match);
                                                                        } else {
                                                                            opponentName = found.teamId;
                                                                            opponentSchool = found.schoolName;
                                                                            if (singleData.resultsCombat.winner.player === n) {
                                                                                stats.isAthleteWinner = false;
                                                                            } else {
                                                                                stats.isAthleteWinner = true;
                                                                            }
                                                                            profile.match.push(stats);
                                                                            callback(null, profile);
                                                                        }
                                                                    });
                                                                } else {
                                                                    while (i < singleData.resultsCombat.teams[0].sets.length) {
                                                                        if (i == 0) {
                                                                            result = singleData.resultsCombat.teams[0].sets[i].point + "-" + singleData.resultsCombat.teams[1].sets[i].point;
                                                                        } else {
                                                                            result = result + "," + singleData.resultsCombat.teams[0].sets[i].point + "-" + singleData.resultsCombat.teams[1].sets[i].point;
                                                                        }
                                                                        i++;
                                                                        console.log("i", result);
                                                                    }
                                                                    stats.score = result;
                                                                    stats.isAthleteWinner = true;
                                                                    profile.match.push(stats);
                                                                    callback(null, profile);
                                                                }

                                                            },
                                                            function (err) {
                                                                callback(null, profile);
                                                            });
                                                    }
                                                } else if (singleData.resultRacquets) {
                                                    var i = 0;
                                                    var result;
                                                    if (singleData.resultRacquets.teams.length == 1) {
                                                        var p = 0;
                                                        while (p < singleData.resultRacquets.teams[0].players.length) {
                                                            Athelete.findOne({
                                                                _id: singleData.resultRacquets.teams[0].players[p].player
                                                            }).lean().deepPopulate("school").exec(function (err, found) {
                                                                if (found.middleName) {
                                                                    var name = found.firstName + " " + found.middleName + " " + found.surname;
                                                                } else {
                                                                    var name = found.firstName + " " + found.surname;
                                                                }
                                                                if (found.atheleteSchoolName) {
                                                                    var school = found.atheleteSchoolName;
                                                                } else {
                                                                    var school = found.school.name;
                                                                }
                                                                var player = {};
                                                                player.name = name;
                                                                player.school = school;
                                                                player.sfaId = found.sfaId;
                                                                player.profilePic = found.photograph;
                                                                profile.players.push(player);
                                                            });
                                                            p++;
                                                        }
                                                        while (i < singleData.resultRacquets.teams[0].sets.length) {
                                                            if (i == 0) {
                                                                result = singleData.resultRacquets.teams[0].sets[i].point;
                                                            } else {
                                                                result = result + "," + singleData.resultRacquets.teams[0].sets[i].point;
                                                            }
                                                            i++;
                                                            console.log("i", result);
                                                        }
                                                        stats.score = result;
                                                        stats.isAthleteWinner = true;
                                                        profile.match.push(stats);
                                                        callback(null, profile);
                                                    } else {
                                                        async.each(singleData.resultRacquets.teams, function (n, callback) {
                                                                if (n.team !== opponentsTeam._id) {
                                                                    TeamSport.findOne({
                                                                        teamId: n.team
                                                                    }).lean().exec(function (err, found) {
                                                                        if (err) {
                                                                            callback(null, err);
                                                                        } else if (_.isEmpty(found)) {
                                                                            callback(null, profile.match);
                                                                        } else {
                                                                            opponentName = found.teamId;
                                                                            opponentSchool = found.schoolName;
                                                                            if (singleData.resultsCombat.winner.player === n) {
                                                                                stats.isAthleteWinner = false;
                                                                            } else {
                                                                                stats.isAthleteWinner = true;
                                                                            }
                                                                            profile.match.push(stats);
                                                                            callback(null, profile.match);
                                                                        }
                                                                    });
                                                                } else {
                                                                    while (i < singleData.resultRacquets.teams[0].sets.length) {
                                                                        if (i == 0) {
                                                                            result = singleData.resultRacquets.teams[0].sets[i].point + "-" + singleData.resultRacquets.teams[1].sets[i].point;
                                                                        } else {
                                                                            result = result + "," + singleData.resultRacquets.teams[0].sets[i].point + "-" + singleData.resultRacquets.teams[1].sets[i].point;
                                                                        }
                                                                        i++;
                                                                        console.log("i", result);
                                                                    }
                                                                    stats.score = result;
                                                                    stats.isAthleteWinner = true;
                                                                    profile.match.push(stats);
                                                                    callback(null, profile.match);
                                                                }
                                                                var p = 0;
                                                                while (p < n.players.length) {
                                                                    Athelete.findOne({
                                                                        _id: n.players[p].player
                                                                    }).lean().deepPopulate("school").exec(function (err, found) {
                                                                        if (found.middleName) {
                                                                            var name = found.firstName + " " + found.middleName + " " + found.surname;
                                                                        } else {
                                                                            var name = found.firstName + " " + found.surname;
                                                                        }
                                                                        if (found.atheleteSchoolName) {
                                                                            var school = found.atheleteSchoolName;
                                                                        } else {
                                                                            var school = found.school.name;
                                                                        }
                                                                        var player = {};
                                                                        player.name = name;
                                                                        player.school = school;
                                                                        player.sfaId = found.sfaId;
                                                                        player.profilePic = found.photograph;
                                                                        profile.players.push(player);
                                                                    });
                                                                    p++;
                                                                }
                                                            },
                                                            function (err) {
                                                                callback(null, profile);
                                                            });
                                                    }
                                                } else if (singleData.resultHeat) {
                                                    var i = 0;
                                                    var result;
                                                    async.each(singleData.resultHeat.players, function (n, callback) {
                                                        StudentTeam.findOne({
                                                            teamId: n.id
                                                        }).lean().deepPopulate('studentId.school').exec(function (err, found) {
                                                            if (found.studentId.middleName) {
                                                                var name = found.studentId.firstName + " " + found.studentId.middleName + " " + found.studentId.surname;
                                                            } else {
                                                                var name = found.studentId.firstName + " " + found.studentId.surname;
                                                            }
                                                            if (found.studentId.atheleteSchoolName) {
                                                                var school = found.studentId.atheleteSchoolName;
                                                            } else {
                                                                var school = found.studentId.school.name;
                                                            }
                                                            var player = {};
                                                            player.name = name;
                                                            player.school = school;
                                                            player.sfaId = found.studentId.sfaId;
                                                            player.profilePic = found.studentId.photograph;
                                                            profile.players.push(player);
                                                        });
                                                        if (singleData.winner.player === n.player) {
                                                            stats.score = n.time;
                                                            stats.result = n.result;
                                                            profile.match.push(stats);
                                                            callback(null, profile);
                                                        } else {
                                                            callback(null, profile);
                                                        }
                                                    }, function (err) {
                                                        callback(null, profile);
                                                    });
                                                } else if (singleData.resultBasketball) {
                                                    var i = 0;
                                                    var result;
                                                    if (singleData.resultBasketball.teams.length == 1) {
                                                        StudentTeam.findOne({
                                                            teamId: singleData.resultBasketball.teams[0].team
                                                        }).lean().deepPopulate('studentId.school').exec(function (err, found) {
                                                            if (found.studentId.middleName) {
                                                                var name = found.studentId.firstName + " " + found.studentId.middleName + " " + found.studentId.surname;
                                                            } else {
                                                                var name = found.studentId.firstName + " " + found.studentId.surname;
                                                            }
                                                            if (found.studentId.atheleteSchoolName) {
                                                                var school = found.studentId.atheleteSchoolName;
                                                            } else {
                                                                var school = found.studentId.school.name;
                                                            }
                                                            var player = {};
                                                            player.name = name;
                                                            player.school = school;
                                                            player.sfaId = found.studentId.sfaId;
                                                            player.profilePic = found.studentId.photograph;
                                                            profile.players.push(player);
                                                            stats.score = singleData.resultBasketball.teams[0].teamResults.finalGoalPoints;
                                                            stats.isAthleteWinner = true;
                                                            profile.match.push(stats);
                                                            callback(null, profile);
                                                        });
                                                    } else {
                                                        async.each(singleData.resultBasketball.teams, function (n, callback) {
                                                            StudentTeam.findOne({
                                                                teamId: n.team
                                                            }).lean().deepPopulate("studentId.school teamId").exec(function (err, found) {
                                                                if (err) {
                                                                    callback(null, err);
                                                                } else if (_.isEmpty(found)) {
                                                                    callback(null, profile.match);
                                                                } else {
                                                                    if (found.studentId.middleName) {
                                                                        var name = found.studentId.firstName + " " + found.studentId.middleName + " " + found.studentId.surname;
                                                                    } else {
                                                                        var name = found.studentId.firstName + " " + found.studentId.surname;
                                                                    }
                                                                    if (found.studentId.atheleteSchoolName) {
                                                                        var school = found.studentId.atheleteSchoolName;
                                                                    } else {
                                                                        var school = found.studentId.school.name;
                                                                    }
                                                                    var player = {};
                                                                    player.name = name;
                                                                    player.school = school;
                                                                    player.sfaId = found.studentId.sfaId;
                                                                    player.profilePic = found.studentId.photograph;
                                                                    profile.players.push(player);
                                                                    stats.score = singleData.resultBasketball.teams[0].teamResults.finalGoalPoints + "-" + singleData.resultBasketball.teams[1].teamResults.finalGoalPoints;
                                                                    if (singleData.resultBasketball.winner.player === n.team) {
                                                                        stats.isAthleteWinner = true;
                                                                    } else {
                                                                        stats.opponentName = found.teamId.name;
                                                                        stats.school = found.teamId.schoolName;
                                                                        stats.teamId = found.teamId.teamId;
                                                                    }
                                                                    profile.match.push(stats);
                                                                    callback(null, profile);
                                                                }
                                                            });

                                                        }, function (err) {
                                                            callback(null, profile.match);
                                                        });
                                                    }
                                                } else if (singleData.resultFootball) {
                                                    var i = 0;
                                                    var result;
                                                    if (singleData.resultFootball.teams.length == 1) {
                                                        StudentTeam.findOne({
                                                            teamId: singleData.resultFootball.teams[0].team
                                                        }).lean().deepPopulate('studentId.school').exec(function (err, found) {
                                                            if (found.studentId.middleName) {
                                                                var name = found.studentId.firstName + " " + found.studentId.middleName + " " + found.studentId.surname;
                                                            } else {
                                                                var name = found.studentId.firstName + " " + found.studentId.surname;
                                                            }
                                                            if (found.studentId.atheleteSchoolName) {
                                                                var school = found.studentId.atheleteSchoolName;
                                                            } else {
                                                                var school = found.studentId.school.name;
                                                            }
                                                            var player = {};
                                                            player.name = name;
                                                            player.school = school;
                                                            player.sfaId = found.studentId.sfaId;
                                                            player.profilePic = found.studentId.photograph;
                                                            profile.players.push(player);
                                                            stats.score = singleData.resultFootball.teams[0].teamResults.finalPoints;
                                                            stats.isAthleteWinner = true;
                                                            profile.match.push(stats);
                                                            callback(null, profile);
                                                        });
                                                    } else {
                                                        async.each(singleData.resultFootball.teams, function (n, callback) {
                                                            StudentTeam.findOne({
                                                                teamId: n.team
                                                            }).lean().deepPopulate("studentId.school teamId").exec(function (err, found) {
                                                                if (err) {
                                                                    callback(null, err);
                                                                } else if (_.isEmpty(found)) {
                                                                    callback(null, profile.match);
                                                                } else {
                                                                    if (found.studentId.middleName) {
                                                                        var name = found.studentId.firstName + " " + found.studentId.middleName + " " + found.studentId.surname;
                                                                    } else {
                                                                        var name = found.studentId.firstName + " " + found.studentId.surname;
                                                                    }
                                                                    if (found.studentId.atheleteSchoolName) {
                                                                        var school = found.studentId.atheleteSchoolName;
                                                                    } else {
                                                                        var school = found.studentId.school.name;
                                                                    }
                                                                    var player = {};
                                                                    player.name = name;
                                                                    player.school = school;
                                                                    player.sfaId = found.studentId.sfaId;
                                                                    player.profilePic = found.studentId.photograph;
                                                                    profile.players.push(player);
                                                                    stats.score = singleData.resultFootball.teams[0].teamResults.finalPoints + "-" + singleData.resultFootball.teams[1].teamResults.finalPoints;
                                                                    if (singleData.resultFootball.winner.player === n.team) {
                                                                        stats.isAthleteWinner = true;
                                                                    } else {
                                                                        stats.opponentName = found.teamId.name
                                                                        stats.school = found.teamId.schoolName;
                                                                        stats.teamId = found.teamId.teamId;
                                                                    }
                                                                    profile.match.push(stats);
                                                                    callback(null, profile);
                                                                }

                                                            });

                                                        }, function (err) {
                                                            callback(null, profile.match);
                                                        });
                                                    }
                                                } else if (singleData.resultVolleyball) {
                                                    var i = 0;
                                                    var result;
                                                    if (singleData.resultVolleyball.teams.length == 1) {
                                                        StudentTeam.findOne({
                                                            teamId: singleData.resultVolleyball.teams[0].team
                                                        }).lean().deepPopulate('studentId.school').exec(function (err, found) {
                                                            if (found.studentId.middleName) {
                                                                var name = found.studentId.firstName + " " + found.studentId.middleName + " " + found.studentId.surname;
                                                            } else {
                                                                var name = found.studentId.firstName + " " + found.studentId.surname;
                                                            }
                                                            if (found.studentId.atheleteSchoolName) {
                                                                var school = found.studentId.atheleteSchoolName;
                                                            } else {
                                                                var school = found.studentId.school.name;
                                                            }
                                                            var player = {};
                                                            player.name = name;
                                                            player.school = school;
                                                            player.sfaId = found.studentId.sfaId;
                                                            player.profilePic = found.studentId.photograph;
                                                            profile.players.push(player);
                                                            var length = singleData.resultVolleyball.teams[0].teamResults.sets.length;
                                                            while (i < length) {
                                                                if (i == 0) {
                                                                    result = singleData.resultVolleyball.teams[0].teamResults.sets[i].point;
                                                                } else {
                                                                    result = result + "," + singleData.resultVolleyball.teams[0].teamResults.sets[i].point;
                                                                }
                                                                i++;
                                                                console.log("i", result);
                                                            }
                                                            stats.score = result;
                                                            stats.isAthleteWinner = true;
                                                            profile.match.push(stats);
                                                            callback(null, profile);
                                                        });
                                                    } else {
                                                        async.each(singleData.resultVolleyball.teams, function (n, callback) {
                                                            StudentTeam.findOne({
                                                                teamId: n.team
                                                            }).lean().deepPopulate("studentId.school teamId").exec(function (err, found) {
                                                                if (err) {
                                                                    callback(null, err);
                                                                } else if (_.isEmpty(found)) {
                                                                    callback(null, profile.match);
                                                                } else {
                                                                    if (found.studentId.middleName) {
                                                                        var name = found.studentId.firstName + " " + found.studentId.middleName + " " + found.studentId.surname;
                                                                    } else {
                                                                        var name = found.studentId.firstName + " " + found.studentId.surname;
                                                                    }
                                                                    if (found.studentId.atheleteSchoolName) {
                                                                        var school = found.studentId.atheleteSchoolName;
                                                                    } else {
                                                                        var school = found.studentId.school.name;
                                                                    }
                                                                    var player = {};
                                                                    player.name = name;
                                                                    player.school = school;
                                                                    player.sfaId = found.studentId.sfaId;
                                                                    player.profilePic = found.studentId.photograph;
                                                                    profile.players.push(player);
                                                                    var length = singleData.resultVolleyball.teams[0].teamResults.sets.length;
                                                                    while (i < length) {
                                                                        console.log("players", singleData.resultVolleyball.teams[0].teamResults.sets[i]);
                                                                        if (i == 0) {
                                                                            result = singleData.resultVolleyball.teams[0].teamResults.sets[i].point + "-" + singleData.resultVolleyball.teams[1].teamResults.sets[i].point;
                                                                        } else {
                                                                            result = result + "," + singleData.resultVolleyball.teams[0].teamResults.sets[i].point + "-" + singleData.resultVolleyball.teams[1].teamResults.sets[i].point;
                                                                        }
                                                                        i++;
                                                                        console.log("i", result);
                                                                    }
                                                                    stats.score = result;
                                                                    if (singleData.resultVolleyball.winner.player === n.team) {
                                                                        stats.isAthleteWinner = true;
                                                                    } else {
                                                                        stats.opponentName = found.teamId.name
                                                                        stats.school = found.teamId.schoolName;
                                                                        stats.teamId = found.teamId.teamId;
                                                                    }
                                                                    profile.match.push(stats);
                                                                    callback(null, profile);
                                                                }
                                                            });
                                                        }, function (err) {
                                                            callback(null, profile);
                                                        });
                                                    }
                                                } else if (singleData.resultHockey) {
                                                    var i = 0;
                                                    var result;
                                                    if (singleData.resultHockey.teams.length == 1) {
                                                        StudentTeam.findOne({
                                                            teamId: singleData.resultHockey.teams[0].team
                                                        }).lean().deepPopulate('studentId.school').exec(function (err, found) {
                                                            if (found.studentId.middleName) {
                                                                var name = found.studentId.firstName + " " + found.studentId.middleName + " " + found.studentId.surname;
                                                            } else {
                                                                var name = found.studentId.firstName + " " + found.studentId.surname;
                                                            }
                                                            if (found.studentId.atheleteSchoolName) {
                                                                var school = found.studentId.atheleteSchoolName;
                                                            } else {
                                                                var school = found.studentId.school.name;
                                                            }
                                                            var player = {};
                                                            player.name = name;
                                                            player.school = school;
                                                            player.sfaId = found.studentId.sfaId;
                                                            player.profilePic = found.studentId.photograph;
                                                            profile.players.push(player);
                                                            stats.score = singleData.resultHockey.teams[0].teamResults.finalPoints;
                                                            stats.isAthleteWinner = true;
                                                            profile.match.push(stats);
                                                            callback(null, profile);
                                                        });
                                                    } else {
                                                        async.each(singleData.resultHockey.teams, function (n, callback) {
                                                            StudentTeam.findOne({
                                                                teamId: n.team
                                                            }).lean().deepPopulate("studentId.school teamId").exec(function (err, found) {
                                                                if (err) {
                                                                    callback(null, err);
                                                                } else if (_.isEmpty(found)) {
                                                                    callback(null, profile.match);
                                                                } else {
                                                                    if (found.studentId.middleName) {
                                                                        var name = found.studentId.firstName + " " + found.studentId.middleName + " " + found.studentId.surname;
                                                                    } else {
                                                                        var name = found.studentId.firstName + " " + found.studentId.surname;
                                                                    }
                                                                    if (found.studentId.atheleteSchoolName) {
                                                                        var school = found.studentId.atheleteSchoolName;
                                                                    } else {
                                                                        var school = found.studentId.school.name;
                                                                    }
                                                                    var player = {};
                                                                    player.name = name;
                                                                    player.school = school;
                                                                    player.sfaId = found.studentId.sfaId;
                                                                    player.profilePic = found.studentId.photograph;
                                                                    profile.players.push(player);
                                                                    stats.score = singleData.resultHockey.teams[0].teamResults.finalPoints + "-" + singleData.resultHockey.teams[0].teamResults.finalPoints;;
                                                                    if (singleData.resultHockey.winner.player === n.team) {
                                                                        stats.isAthleteWinner = true;
                                                                    } else {
                                                                        stats.opponentName = found.teamId.name
                                                                        stats.school = found.teamId.schoolName;
                                                                        stats.teamId = found.teamId.teamId;
                                                                    }
                                                                    profile.match.push(stats);
                                                                    callback(null, profile);
                                                                }
                                                            });
                                                        }, function (err) {
                                                            callback(null, profile);
                                                        });
                                                    }
                                                } else if (singleData.resultWaterPolo) {
                                                    var i = 0;
                                                    var result;
                                                    if (singleData.resultWaterPolo.teams.length == 1) {
                                                        StudentTeam.findOne({
                                                            teamId: singleData.resultWaterPolo.teams[0].team
                                                        }).lean().deepPopulate('studentId.school').exec(function (err, found) {
                                                            if (found.studentId.middleName) {
                                                                var name = found.studentId.firstName + " " + found.studentId.middleName + " " + found.studentId.surname;
                                                            } else {
                                                                var name = found.studentId.firstName + " " + found.studentId.surname;
                                                            }
                                                            if (found.studentId.atheleteSchoolName) {
                                                                var school = found.studentId.atheleteSchoolName;
                                                            } else {
                                                                var school = found.studentId.school.name;
                                                            }
                                                            var player = {};
                                                            player.name = name;
                                                            player.school = school;
                                                            player.sfaId = found.studentId.sfaId;
                                                            player.profilePic = found.studentId.photograph;
                                                            profile.players.push(player);
                                                            stats.score = singleData.resultWaterPolo.teams[0].teamResults.finalGoalPoint;
                                                            stats.isAthleteWinner = true;
                                                            profile.match.push(stats);
                                                            callback(null, profile);
                                                        });
                                                    } else {
                                                        async.each(singleData.resultWaterPolo.teams, function (n, callback) {
                                                            StudentTeam.findOne({
                                                                teamId: n.team
                                                            }).lean().deepPopulate("studentId.school teamId").exec(function (err, found) {
                                                                if (err) {
                                                                    callback(null, err);
                                                                } else if (_.isEmpty(found)) {
                                                                    callback(null, profile);
                                                                } else {
                                                                    var player = {};
                                                                    player.name = name;
                                                                    player.school = school;
                                                                    player.sfaId = found.studentId.sfaId;
                                                                    player.profilePic = found.studentId.photograph;
                                                                    profile.players.push(player);
                                                                    stats.score = singleData.resultWaterPolo.teams[0].teamResults.finalGoalPoint + "-" + singleData.resultWaterPolo.teams[0].teamResults.finalGoalPoint;;
                                                                    if (singleData.resultWaterPolo.winner.player === n.team) {
                                                                        stats.isAthleteWinner = true;
                                                                    } else {
                                                                        stats.opponentName = found.teamId.name;
                                                                        stats.school = found.teamId.schoolName;
                                                                        stats.teamId = found.teamId.teamId;
                                                                    }
                                                                    profile.match.push(stats);
                                                                    callback(null, profile);
                                                                }

                                                            });

                                                        }, function (err) {
                                                            callback(null, profile.match);
                                                        });
                                                    }
                                                } else if (singleData.resultKabaddi) {
                                                    var i = 0;
                                                    var result;
                                                    if (singleData.opponentsTeam.length == 1) {
                                                        StudentTeam.findOne({
                                                            teamId: singleData.resultKabaddi.teams[0].team
                                                        }).lean().deepPopulate('studentId.school').exec(function (err, found) {
                                                            if (found.studentId.middleName) {
                                                                var name = found.studentId.firstName + " " + found.studentId.middleName + " " + found.studentId.surname;
                                                            } else {
                                                                var name = found.studentId.firstName + " " + found.studentId.surname;
                                                            }
                                                            if (found.studentId.atheleteSchoolName) {
                                                                var school = found.studentId.atheleteSchoolName;
                                                            } else {
                                                                var school = found.studentId.school.name;
                                                            }
                                                            var player = {};
                                                            player.name = name;
                                                            player.school = school;
                                                            player.sfaId = found.studentId.sfaId;
                                                            player.profilePic = found.studentId.photograph;
                                                            profile.players.push(player);
                                                            stats.score = singleData.resultKabaddi.teams[0].teamResults.finalPoints;
                                                            stats.isAthleteWinner = true;
                                                            profile.match.push(stats);
                                                            callback(null, profile.match);
                                                        });
                                                    } else {
                                                        async.each(singleData.resultKabaddi.teams, function (n, callback) {
                                                                StudentTeam.findOne({
                                                                    teamId: n.team
                                                                }).lean().deepPopulate("studentId.school teamId").exec(function (err, found) {
                                                                    if (err) {
                                                                        callback(null, err);
                                                                    } else if (_.isEmpty(found)) {
                                                                        callback(null, profile.match);
                                                                    } else {
                                                                        if (found.studentId.middleName) {
                                                                            var name = found.studentId.firstName + " " + found.studentId.middleName + " " + found.studentId.surname;
                                                                        } else {
                                                                            var name = found.studentId.firstName + " " + found.studentId.surname;
                                                                        }
                                                                        if (found.studentId.atheleteSchoolName) {
                                                                            var school = found.studentId.atheleteSchoolName;
                                                                        } else {
                                                                            var school = found.studentId.school.name;
                                                                        }
                                                                        var player = {};
                                                                        player.name = name;
                                                                        player.school = school;
                                                                        player.sfaId = found.studentId.sfaId;
                                                                        player.profilePic = found.studentId.photograph;
                                                                        profile.players.push(player);
                                                                        stats.score = singleData.resultKabaddi.teams[0].teamResults.finalPoints + "-" + singleData.resultKabaddi.teams[0].teamResults.finalPoints;;
                                                                        if (singleData.resultKabaddi.winner.player === n.team) {
                                                                            stats.isAthleteWinner = true;
                                                                        } else {
                                                                            if (found.studentId.middleName) {
                                                                                stats.opponentName = found.studentId.firstName + " " + found.studentId.middleName + " " + found.studentId.surname;
                                                                            } else {
                                                                                stats.opponentName = found.studentId.firstName + " " + found.studentId.surname;
                                                                            }
                                                                            if (found.studentId.atheleteSchoolName) {
                                                                                stats.school = found.studentId.atheleteSchoolName;
                                                                            } else {
                                                                                stats.school = found.studentId.school.name;
                                                                            }
                                                                        }
                                                                        profile.match.push(stats);
                                                                        callback(null, profile.match);
                                                                    }

                                                                });

                                                            },
                                                            function (err) {
                                                                callback(null, profile.match);
                                                            });
                                                    }
                                                } else if (singleData.resultHandball) {
                                                    var i = 0;
                                                    var result;
                                                    if (singleData.resultHandball.teams.length == 1) {
                                                        StudentTeam.findOne({
                                                            teamId: singleData.resultHandball.teams[0].team
                                                        }).lean().deepPopulate('studentId.school').exec(function (err, found) {
                                                            if (found.studentId.middleName) {
                                                                var name = found.studentId.firstName + " " + found.studentId.middleName + " " + found.studentId.surname;
                                                            } else {
                                                                var name = found.studentId.firstName + " " + found.studentId.surname;
                                                            }
                                                            if (found.studentId.atheleteSchoolName) {
                                                                var school = found.studentId.atheleteSchoolName;
                                                            } else {
                                                                var school = found.studentId.school.name;
                                                            }
                                                            var player = {};
                                                            player.name = name;
                                                            player.school = school;
                                                            player.sfaId = found.studentId.sfaId;
                                                            player.profilePic = found.studentId.photograph;
                                                            profile.players.push(player);
                                                            stats.score = singleData.resultHandball.teams[0].teamResults.finalPoints;
                                                            stats.isAthleteWinner = true;
                                                            profile.match.push(stats);
                                                            callback(null, profile);
                                                        });
                                                    } else {
                                                        async.each(singleData.resultHandball.teams, function (n, callback) {
                                                                StudentTeam.findOne({
                                                                    teamId: n.team
                                                                }).lean().deepPopulate("studentId.school teamId").exec(function (err, found) {
                                                                    if (err) {
                                                                        callback(null, err);
                                                                    } else if (_.isEmpty(found)) {
                                                                        callback(null, profile.match);
                                                                    } else {
                                                                        if (found.studentId.middleName) {
                                                                            var name = found.studentId.firstName + " " + found.studentId.middleName + " " + found.studentId.surname;
                                                                        } else {
                                                                            var name = found.studentId.firstName + " " + found.studentId.surname;
                                                                        }
                                                                        if (found.studentId.atheleteSchoolName) {
                                                                            var school = found.studentId.atheleteSchoolName;
                                                                        } else {
                                                                            var school = found.studentId.school.name;
                                                                        }
                                                                        var player = {};
                                                                        player.name = name;
                                                                        player.school = school;
                                                                        player.sfaId = found.studentId.sfaId;
                                                                        player.profilePic = found.studentId.photograph;
                                                                        profile.players.push(player);
                                                                        stats.score = singleData.resultHandball.teams[0].teamResults.finalPoints + "-" + singleData.resultHandball.teams[0].teamResults.finalPoints;;
                                                                        if (singleData.resultHandball.winner.player === n) {
                                                                            stats.isAthleteWinner = true;
                                                                        } else {
                                                                            stats.opponentName = found.teamId.name;
                                                                            stats.school = found.teamId.schoolName;
                                                                            stats.teamId = found.teamId.teamId;
                                                                        }
                                                                        profile.match.push(stats);
                                                                        callback(null, profile);
                                                                    }

                                                                });

                                                            },
                                                            function (err) {
                                                                callback(null, profile);
                                                            });
                                                    }
                                                } else {
                                                    callback(null, profile);
                                                }
                                            },
                                            function (err) {
                                                callback(null, profile);
                                            });
                                        callback(null, profile);
                                    }
                                });
                            }
                        },

                    ],
                    function (err, data2) {
                        callback(null, data2);
                    });
            },
            function (err) {
                callback(null, profile);
            });
    },

    getSchoolRank: function (data, callback) {
        Rank.getSchoolByRanks(function (err, rankData) {
            if (err) {
                callback(err, null);
            } else if (_.isEmpty(rankData)) {
                callback(null, []);
            } else {
                var rank = _.findIndex(rankData, {
                    'name': data.schoolName,
                });
                rank++;
                var profile = {};
                profile.rank = rank;
                callback(null, profile);
            }
        });
    },

    getTop20School: function (data, callback) {
        async.waterfall([
                function (callback) {
                    Rank.getSchoolByRanks(function (err, rankData) {
                        if (err) {
                            callback(err, null);
                        } else if (_.isEmpty(rankData)) {
                            callback(null, []);
                        } else {
                            var rankschool = rankData.slice(0, 20);
                            callback(null, rankschool);
                        }
                    });
                },
                function (rankschool, callback) {
                    async.concatSeries(rankschool, function (n, callback) {
                            var profile = {};
                            Registration.findOne({
                                schoolName: n.name
                            }).lean().exec(function (err, found) {
                                console.log("found", found);
                                if (found.schoolLogo) {
                                    profile.schoolLogo = found.schoolLogo;
                                } else {
                                    profile.schoolLogo = "";
                                }
                                profile.status = found.status;
                                profile.schoolName = n.name;
                                profile.totalPoints = n.totalPoints;
                                profile.medals = n.medal;
                                profile.schoolId = n._id;
                                callback(null, profile);
                            });
                        },
                        function (err, profile) {
                            callback(null, profile);
                        });
                }
            ],
            function (err, data2) {
                callback(null, data2);
            });
    },

    getAllRegisteredSchool: function (data, callback) {
        async.waterfall([
                function (callback) {
                    Registration.find({
                        status: "Verified"
                    }).lean().exec(function (err, found) {
                        if (err) {
                            callback(err, null);
                        } else if (_.isEmpty(found)) {
                            callback(null, []);
                        } else {
                            callback(null, found);
                        }
                    });
                },
                function (found, callback) {
                    if (_.isEmpty(found)) {
                        callback(null, found);
                    } else {
                        async.concatSeries(found, function (n, callback) {
                                var profile = {};
                                profile.name = n.schoolName;
                                profile.schoolId = n._id;
                                callback(null, profile);
                            },
                            function (err, profile) {
                                callback(null, profile);
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