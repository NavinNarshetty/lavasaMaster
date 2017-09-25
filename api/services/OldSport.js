var schema = new Schema({
    gender: String,
    year: String,
    minPlayers: Number,
    maxPlayers: Number,
    sportslist: {
        _id: {
            type: Schema.Types.ObjectId,
            ref: 'SportsList'
        },
        name: String,
        sporttype: String
    },
    agegroup: {
        _id: {
            type: Schema.Types.ObjectId,
            ref: 'Agegroup'
        },
        name: String
    },
    firstcategory: {
        _id: {
            type: Schema.Types.ObjectId,
            ref: 'FirstCategory'
        },
        name: String
    },
    secondcategory: {

        _id: {
            type: Schema.Types.ObjectId,
            ref: 'SecondCategory'
        },
        name: String

    },
    thirdcategory: {

        _id: {
            type: Schema.Types.ObjectId,
            ref: 'ThirdCategory'
        },
        name: String

    },
    drawFormat: String
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('OldSport', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {

    getAllTeam: function (data, callback) {
        var sport = {};
        async.waterfall([
                function (callback) {
                    OldSport.find({
                        year: data.year,
                        "sportslist.sporttype": "Team"
                    }).lean().exec(function (err, oldSportData) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(oldSportData)) {
                                callback(null, []);
                            } else {
                                callback(null, oldSportData);
                            }
                        }
                    });
                },
                function (oldSportData, callback) {
                    var team = _.groupBy(oldSportData, "sportslist.name");
                    var arr = _.keys(team);
                    var sportlist;
                    async.eachSeries(team, function (sportData, callback) {
                            async.waterfall([
                                function (callback) {
                                    OldSport.saveCategory(sportData, function (err, category) {
                                        if (err) {
                                            callback(err, null);
                                        } else {
                                            if (_.isEmpty(category)) {
                                                callback(null, []);
                                            } else {
                                                callback(null, category);
                                            }
                                        }
                                    });
                                },
                                function (category, callback) {
                                    console.log("category", category);
                                    OldSport.saveSportsListSubCategory(sportData, category, function (err, subCategory) {
                                        if (err) {
                                            callback(err, null);
                                        } else {
                                            if (_.isEmpty(subCategory)) {
                                                callback(null, []);
                                            } else {
                                                callback(null, subCategory);
                                            }
                                        }
                                    });
                                },
                                function (subCategory, callback) {
                                    console.log("sportlist inside", subCategory);
                                    OldSport.saveSportsList(sportData, subCategory, function (err, drawFormat) {
                                        if (err) {
                                            callback(err, null);
                                        } else {
                                            if (_.isEmpty(drawFormat)) {
                                                callback(null, []);
                                            } else {
                                                console.log("drawFormat", drawFormat);
                                                sport.sportslist = drawFormat._id;
                                                callback(null, drawFormat);
                                            }
                                        }
                                    });
                                },
                                function (drawFormat, callback) {
                                    async.eachSeries(sportData, function (singleData, callback) {
                                            console.log("category", singleData);
                                            async.waterfall([
                                                    function (callback) {
                                                        OldSport.saveAge(singleData, function (err, ageData) {
                                                            if (err) {
                                                                callback(err, null);
                                                            } else {
                                                                if (_.isEmpty(ageData)) {
                                                                    callback(null, []);
                                                                } else {
                                                                    sport.ageGroup = ageData._id;
                                                                    callback(null, sport);
                                                                }
                                                            }
                                                        });
                                                    },
                                                    function (sport, callback) {
                                                        OldSport.saveSport(singleData, sport, function (err, drawFormat) {
                                                            if (err) {
                                                                callback(err, null);
                                                            } else {
                                                                if (_.isEmpty(drawFormat)) {
                                                                    callback(null, []);
                                                                } else {
                                                                    callback(null, drawFormat);
                                                                }
                                                            }
                                                        });
                                                    },
                                                ],
                                                function (err, found) {
                                                    if (found) {
                                                        callback(null, found);
                                                    } else {
                                                        callback(null, found);
                                                    }
                                                });
                                        },
                                        function (err, found) {
                                            callback(null, found);
                                        });
                                },
                            ], function (err, found) {
                                sport = {};
                                callback(null, found);
                            });
                        },
                        function (err, found) {
                            callback(null, found);
                        });
                }
            ],
            function (err, found) {
                if (found) {
                    callback(null, found);
                } else {
                    callback(null, found);
                }
            });
    },

    saveSportsList: function (data, subCategory, callback) {
        console.log("inside", data[0], "sub", subCategory);
        async.waterfall([
            function (callback) {
                var drawFormat = {};
                drawFormat.name = data[0].drawFormat;
                DrawFormat.saveData(drawFormat, function (err, drawFormat) {
                    if (err) {
                        callback(err, null);
                    } else {
                        if (_.isEmpty(drawFormat)) {
                            callback(null, []);
                        } else {
                            console.log("drawFormat", drawFormat);
                            callback(null, drawFormat);
                        }
                    }
                });
            },
            function (drawFormat, callback) {
                var sportslist = {};
                sportslist.name = data[0].sportslist.name;;
                sportslist.sportsListSubCategory = subCategory._id;
                sportslist.drawFormat = drawFormat._id;
                SportsList.saveData(sportslist, function (err, sportslist) {
                    if (err) {
                        callback(err, null);
                    } else {
                        if (_.isEmpty(sportslist)) {
                            callback(null, []);
                        } else {
                            sportlist = sportslist._id;
                            callback(null, sportslist);
                        }
                    }
                });
            },
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

    saveSportsListSubCategory: function (data, category, callback) {
        var sportsSubCategory = {};
        sportsSubCategory.name = data[0].sportslist.name;
        sportsSubCategory.sportsListCategory = category._id;
        sportsSubCategory.isTeam = true;
        SportsListSubCategory.saveData(sportsSubCategory, function (err, subCategory) {
            if (err) {
                callback(err, null);
            } else {
                if (_.isEmpty(subCategory)) {
                    callback(null, []);
                } else {
                    callback(null, subCategory);
                }
            }
        });
    },

    saveCategory: function (data, callback) {
        var sportsCategory = {};
        sportsCategory.name = data[0].sportslist.sporttype + "Sports";
        SportsListCategory.saveData(sportsCategory, function (err, category) {
            if (err) {
                callback(err, null);
            } else {
                if (_.isEmpty(category)) {
                    callback(null, []);
                } else {
                    callback(null, category);
                }
            }
        });
    },

    saveAge: function (data, callback) {
        console.log("data", data);
        async.waterfall([
            function (callback) {
                AgeGroup.find({
                    name: data.agegroup.name
                }).lean().exec(function (err, found) {
                    if (err) {
                        callback(err, null);
                    } else {
                        console.log("found", found);
                        callback(null, found);
                    }
                });
            },
            function (found, callback) {
                console.log("length", found.length);
                if (found.length == 0) {
                    var ageGroup = {};
                    ageGroup.name = data.agegroup.name;
                    AgeGroup.saveData(ageGroup, function (err, ageGroup) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(ageGroup)) {
                                callback(null, []);
                            } else {
                                callback(null, ageGroup);
                            }
                        }
                    });
                } else {
                    callback(null, found);
                }
            },
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

    saveSport: function (data, data1, callback) {
        var sport = {};
        if (data.gender == 'Boys') {
            sport.gender = "male";
        } else if (data.gender == 'Girls') {
            sport.gender = "female";
        } else {
            sport.gender = "both";
        }
        sport.sportslist = data1.SportsList;
        sport.ageGroup = data1.ageGroup;
        if (data1.weight) {
            sport.weight = data1.weight;
        } else {
            sport.weight = undefined;
        }
        sport.oldId = data._id;
        Sport.saveData(sport, function (err, subCategory) {
            if (err) {
                callback(err, null);
            } else {
                if (_.isEmpty(subCategory)) {
                    callback(null, []);
                } else {
                    callback(null, subCategory);
                }
            }
        });
    },



};
module.exports = _.assign(module.exports, exports, model);