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
                OldIndividualSport.find().lean().exec(function (err, found) {
                    if (err) {
                        callback(err, null);
                    } else if (_.isEmpty(found)) {
                        callback(null, []);
                    } else {
                        var final = {};
                        final.event = eventData._id;
                        final.individualData = found;
                        callback(null, final);
                    }
                });
            },
            function (final, callback) {
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

    setsportId: function (data, callback) {
        var sportData = {};
        sportData.sport = [];
        var length = data.length;
        async.eachSeries(data, function (n, callback) {
            async.waterfall([
                function (callback) {
                    var deepSearch = "sportslist.sportsListSubCategory.sportsListCategory sportslist.sportsListSubCategory.rules ageGroup weight sportslist.drawFormat";
                    OldSport.findOne({
                        _id: n
                    }).lean().deepPopulate(deepSearch).exec(function (err, found) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(found)) {
                                callback(null, []);
                            } else {
                                sportData.gender = found.gender;
                                callback(null, found);
                            }
                        }
                    });
                },
                function (found, callback) {
                    SportsList.findOne({
                        name: found.sportslist.name
                    }).lean().exec(function (err, sportslistData) {
                        if (err) {
                            callback(err, null);
                        } else {
                            sportData.sportslist = sportslistData._id;
                            callback(null, found);
                        }
                    });
                },
                function (found, callback) {
                    AgeGroup.findOne({
                        name: found.ageGroup.name
                    }).lean().exec(function (err, ageData) {
                        if (err) {
                            callback(err, null);
                        } else {
                            sportData.ageGroup = ageData._id;
                            callback(null, found);
                        }
                    });
                },
                function (found, callback) {
                    if (found.weight) {
                        Weight.findOne({
                            name: found.weight.name
                        }).lean().exec(function (err, ageData) {
                            if (err) {
                                callback(err, null);
                            } else {
                                sportData.weight = ageData._id;
                                callback(null, found);
                            }
                        });
                    } else {
                        callback(null, found);
                    }
                },
                function (found, callback) {
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
                                sportData.sport.push(sport._id);
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
                                sportData.sport.push(sport._id);
                                sportData.sportsListSubCategory = sport.sportslist.sportsListSubCategory._id;
                                callback(null, sportData);
                            }
                        });
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
                callback(null, sportData);
            }
        });
    },

    setAthleteId: function (data, callback) {
        Athelete.findOne({
            oldId: data
        }).lean().exec(function (err, found) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, found);
            }
        });
    },

    setIndividualSports: function (data, callback) {
        async.eachSeries(data.individualData, function (n, callback) {
            async.waterfall([
                function (callback) {
                    OldIndividualSport.setsportId(n.sport, function (err, complete) {
                        if (err || _.isEmpty(complete)) {
                            var err = "Error found in Rules";
                            callback(err, null);
                        } else {
                            n.sport = complete.sport;
                            n.sportsListSubCategory = complete.sportsListSubCategory;
                            callback(null, n);
                        }
                    });
                },
                function (n, callback) {
                    OldIndividualSport.setAthleteId(n.athleteId, function (err, complete) {
                        if (err || _.isEmpty(complete)) {
                            var err = "Error found in Rules";
                            callback(err, null);
                        } else {
                            n.athleteId = complete._id;
                            n.oldId = n._id;
                            callback(null, n);
                        }
                    });
                },
                function (n, callback) {
                    var formData = {};
                    formData.oldId = n.oldId;
                    formData.sport = n.sport;
                    formData.sportsListSubCategory = n.sportsListSubCategory;
                    formData.createdBy = n.createdBy;
                    formData.athleteId = n.athleteId;
                    formData.createdBy = n.createdBy;
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
};
module.exports = _.assign(module.exports, exports, model);