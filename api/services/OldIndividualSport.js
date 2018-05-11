var schema = new Schema({
    sport: [{
        type: Schema.Types.ObjectId,
        ref: 'OldSport',
        index: true
    }],
    athleteId: {
        type: Schema.Types.ObjectId,
        ref: 'OldAthelete',
        index: true
    },
    sportsListSubCategory: {
        type: Schema.Types.ObjectId,
        ref: 'OldSportsListSubCategory',
        index: true
    },
    perSportUnique: String,
    createdBy: String,
    nominatedName: String,
    nominatedSchoolName: String,
    nominatedContactDetails: String,
    nominatedEmailId: String,
    isVideoAnalysis: Boolean
});

schema.plugin(deepPopulate, {
    populate: {
        'athleteId': {
            select: ''
        }
    }
});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('OldIndividualSport', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {

    getIndividualSports: function (data, callback) {
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
                // console.log("config", property);
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
                // console.log("event", eventData);
                OldIndividualSport.find().lean().deepPopulate("athleteId").exec(function (err, found) {
                    if (err) {
                        callback(err, null);
                    } else if (_.isEmpty(found)) {
                        callback(null, []);
                    } else {
                        console.log("found", found);
                        var final = {};
                        final.event = eventData._id;
                        final.individualData = found;
                        callback(null, final);
                    }
                });
            },
            function (final, callback) {
                console.log("final", final);
                OldIndividualSport.setIndividualSports(final, function (err, complete) {
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

    getSportId: function (data, callback) {
        var sportData = {};
        async.waterfall([
                function (callback) {
                    var deepSearch = "sportslist.sportsListSubCategory.sportsListCategory sportslist.sportsListSubCategory.rules ageGroup weight sportslist.drawFormat";
                    OldSport.findOne({
                        _id: data
                    }).lean().deepPopulate(deepSearch).exec(function (err, found) {
                        if (err || _.isEmpty(found)) {
                            callback(null, {
                                error: "empty or error"
                            });
                        } else {
                            sportData.gender = found.gender;
                            callback(null, found);
                        }
                    });
                },
                function (found, callback) {
                    // console.log("found", found);
                    if (found.error) {
                        callback(null, found);
                    } else {
                        SportsList.findOne({
                            name: found.sportslist.name
                        }).lean().exec(function (err, sportslistData) {
                            if (err || _.isEmpty(sportData)) {
                                callback(null, {
                                    error: "sportslist not found"
                                });
                            } else {
                                // console.log("sportData", sportData);
                                sportData.sportslist = sportslistData._id;
                                callback(null, found);
                            }
                        });
                    }
                },
                function (found, callback) {
                    if (found.error) {
                        callback(null, found);
                    } else {
                        AgeGroup.findOne({
                            name: found.ageGroup.name
                        }).lean().exec(function (err, ageData) {
                            if (err || _.isEmpty(ageData)) {
                                callback(ageData, null);
                            } else {
                                // console.log("sportData", ageData);
                                sportData.ageGroup = ageData._id;
                                callback(null, found);
                            }
                        });
                    }
                },
                function (found, callback) {
                    if (found.error) {
                        callback(null, found);
                    } else {
                        // console.log("found.weight", found.weight);
                        if (found.weight) {
                            Weight.findOne({
                                name: found.weight.name
                            }).lean().exec(function (err, weightData) {
                                // console.log("weightData out", weightData);
                                if (err || _.isEmpty(weightData)) {
                                    callback(null, weightData);
                                } else {
                                    // console.log("weightData", weightData);
                                    sportData.weight = weightData._id;
                                    callback(null, found);
                                }
                            });
                        } else {
                            callback(null, found);
                        }
                    }
                },
                function (found, callback) {
                    if (found.error) {
                        callback(null, found);
                    } else {
                        if (sportData.weight) {
                            var deepSearch = "sportslist.sportsListSubCategory";
                            Sport.findOne({
                                sportslist: sportData.sportslist,
                                ageGroup: sportData.ageGroup,
                                gender: sportData.gender,
                                weight: sportData.weight
                            }).lean().deepPopulate(deepSearch).exec(function (err, sport) {
                                if (err) {
                                    callback(err, null);
                                } else {
                                    // console.log("sport", sport, "sportData", sportData);
                                    sportData.sport = sport._id;
                                    sportData.sportsListSubCategory = sport.sportslist.sportsListSubCategory._id;
                                    callback(null, sportData);
                                }
                            });
                        } else {
                            var deepSearch = "sportslist.sportsListSubCategory";
                            Sport.findOne({
                                sportslist: sportData.sportslist,
                                ageGroup: sportData.ageGroup,
                                gender: sportData.gender,
                            }).lean().deepPopulate(deepSearch).exec(function (err, sport) {
                                if (err) {
                                    callback(err, null);
                                } else {
                                    // console.log("sport", sport, "sportData", sportData);
                                    sportData.sport = sport._id;
                                    sportData.sportsListSubCategory = sport.sportslist.sportsListSubCategory._id;
                                    callback(null, sportData);
                                }
                            });
                        }
                    }
                }
            ],
            function (err, complete) {
                if (err) {
                    callback(err, null);
                } else {
                    callback(null, complete);
                }
            });
    },

    setsportId: function (data, callback) {
        var sportData = {};
        sportData.sport = [];
        var length = data.length;
        async.eachSeries(data, function (n, callback) {
            OldIndividualSport.getSportId(n, function (err, complete) {
                if (err || _.isEmpty(complete)) {
                    var err = "Error found in Rules";
                    callback(err, null);
                } else {
                    sportData.ageGroup = complete.ageGroup;
                    sportData.gender = complete.gender;
                    sportData.weight = complete.weight;
                    sportData.sportslist = complete.sportslist;
                    sportData.sport.push(complete.sport);
                    sportData.sportsListSubCategory = complete.sportsListSubCategory;
                    callback(null, sportData);
                }
            });
        }, function (err) {
            if (err) {
                callback(null, {
                    error: "error found",
                    data: data
                });
            } else {
                callback(null, sportData);
            }
        });
    },

    setAthleteId: function (data, callback) {
        console.log("data", data);
        if (data != null) {
            Athelete.findOne({
                sfaId: data.sfaId
            }).lean().exec(function (err, found) {
                if (err) {
                    callback(err, null);
                } else {
                    console.log("athleteId", found);
                    callback(null, found);
                }
            });
        } else {
            callback(null, data);
        }
    },

    setIndividualSports: function (data, callback) {
        async.concatSeries(data.individualData, function (n, callback) {
            console.log("n in each individual", n);
            async.waterfall([
                function (callback) {
                    var sport = {};
                    OldIndividualSport.setsportId(n.sport, function (err, complete) {
                        if (err || _.isEmpty(complete)) {
                            var err = "Error found in setsportId";
                            callback(null, {
                                error: err
                            });
                        } else {
                            console.log("complete", complete);
                            sport.sport = complete.sport;
                            sport.sportsListSubCategory = complete.sportsListSubCategory;
                            callback(null, sport);
                        }
                    });
                },
                function (sport, callback) {
                    console.log("sport", sport, "n", n);
                    var next = {};
                    OldIndividualSport.setAthleteId(n.athleteId, function (err, athleteData) {
                        if (athleteData != null) {
                            console.log("complete", athleteData);
                            next.athleteId = athleteData._id;
                        } else {
                            next.athleteId = null;
                        }
                        next.oldId = n._id;
                        next.sport = sport;
                        console.log("n", next);
                        callback(null, next);
                    });
                },
                function (next, callback) {
                    // console.log("formData n", n);
                    var formData = {};
                    formData.oldId = next.oldId;
                    formData.sport = next.sport.sport;
                    formData.sportsListSubCategory = next.sport.sportsListSubCategory;
                    formData.createdAt = next.createdAt;
                    if (n.athleteId != null) {
                        formData.athleteId = next.athleteId;
                    } else {
                        formData.athleteId = undefined;
                    }
                    formData.createdBy = next.createdBy;
                    formData.eventId = data.event;
                    console.log("formData", formData);
                    IndividualSport.saveData(formData, function (err, complete) {
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
            ], function (err, complete) {
                if (err) {
                    callback(err, null);
                } else {
                    callback(null, complete);
                }
            });
        }, function (err, complete1) {
            if (err) {
                callback(null, {
                    error: "error found",
                    data: complete1
                });
            } else {
                callback(null, complete1);
            }
        });
    },
};
module.exports = _.assign(module.exports, exports, model);