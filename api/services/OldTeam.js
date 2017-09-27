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
        async.waterfall([
            function (callback) {
                OldTeam.find().lean().exec(function (err, found) {
                    if (err) {
                        callback(err, null);
                    } else {
                        // console.log("found", found);
                        callback(null, found);
                    }
                });
            },
            function (found, callback) {
                async.concatSeries(found, function (sportData, callback) {
                        var sportParam = {};
                        sportParam.sportslist = sportData.sport;
                        sportParam.age = sportData.agegroup;
                        if (sportData.gender == "Boys") {
                            sportParam.gender = "male";
                        } else {
                            sportParam.gender = "female";
                        }
                        sportParam.weight = undefined;
                        console.log("sportParam", sportParam);
                        OldTeam.getSportId(sportParam, function (err, sport) {
                            if (err) {
                                callback(err, null);
                            } else {
                                if (_.isEmpty(sport)) {
                                    callback(null, []);
                                } else {
                                    callback(null, sport);
                                }
                            }
                        });
                    },
                    function (err, found) {
                        callback(null, found);
                    });
            }
        ], function (err, found) {
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
                            console.log("sport", sport);
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
                            console.log("sport", sport);
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
                                console.log("sport", sport);
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
                                console.log("sport", sport);
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




};
module.exports = _.assign(module.exports, exports, model);