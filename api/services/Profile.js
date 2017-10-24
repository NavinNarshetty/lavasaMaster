var schema = new Schema({});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('Profile', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {

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

    searchSchool: function (data, callback) {
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

    getProfile: function (data, callback) {
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
                                profile.medalData = _.groupBy(medalData, 'medalType');
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
                        profile.sport = _.uniqBy(profile.sport, "_id");
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
                            // console.log("found", found);
                            if (_.isEmpty(found)) {
                                callback(null, medals);
                            } else {
                                async.eachSeries(found, function (singleData, callback) {
                                        if (!_.isEmpty(singleData.player)) {
                                            // console.log("player", singleData.player);
                                            async.eachSeries(singleData.player, function (player, callback) {
                                                    if (player === data.athleteId.toString()) {
                                                        // var medals=sin
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



};
module.exports = _.assign(module.exports, exports, model);