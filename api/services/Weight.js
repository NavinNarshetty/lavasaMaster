var schema = new Schema({
    name: {
        type: String,
    }
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('Weight', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {
    getAll: function (data, callback) {
        Weight.find().lean().exec(function (err, found) {
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

    getWeightsByEvent: function (data, callback) {
        Sport.find(data, "weight").deepPopulate("weight").select({
            "_id": 0
        }).lean().exec(function (err, data) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, data);
            }
        });
    },

    getWeightPerSportslist: function (data, callback) {
        Sport.find({
            sportslist: data.sportslist
        }).lean().deepPopulate("weight").exec(function (err, found) {
            if (err) {
                callback(err, null);
            } else {
                console.log(found);
                if (_.isEmpty(found)) {
                    callback(null, []);
                } else {
                    var age = _.uniqBy(found, "weight.name");
                    if (age.length <= 1) {
                        if (age.length <= 0) {
                            callback(null, []);
                        } else {
                            if (_.isEmpty(age[0].weight)) {
                                callback(null, []);
                            } else {
                                callback(null, age);
                            }
                        }
                    } else {
                        callback(null, age);
                    }
                }
            }
        });
    },

    getAthletesByEvent: function (data, callback) {
        // console.log("sport",data);
        IndividualSport.find(data, "athleteId sport").deepPopulate("athleteId athleteId.school").exec(function (err, result) {
            if (err) {
                callback(err, null);
            } else if (!_.isEmpty(result)) {
                callback(null, result);
            } else {
                callback("No Athletes Found", []);
            }
        });
    },

    setWeightDuplicate: function (data, callback) {
        async.waterfall([
            function (callback) {
                SportsList.findOne({
                    name: "Judo"
                }).lean().exec(function (err, found) {
                    if (err || _.isEmpty(found)) {
                        var err = "SportsList not Found";
                        callback(null, {
                            error: err,
                            data: "Judo"
                        });
                    } else {
                        callback(null, found);
                    }
                });
            },
            function (found, callback) {
                if (found.error) {
                    callback(null, found);
                } else {
                    Sport.find({
                        sportslist: found._id
                    }).lean().deepPopulate("weight ageGroup").exec(function (err, sportData) {
                        if (err || _.isEmpty(sportData)) {
                            var err = "Sport not Found";
                            callback(null, {
                                error: err,
                                data: "Judo"
                            });
                        } else {
                            var ageGroup = _.groupBy(sportData, "weight.name");
                            var final = [];
                            _.each(ageGroup, function (ageGroup, key) {
                                ageGroup[key] = _.groupBy(ageGroup, 'gender');
                                // final.push(ageGroup[key]);
                                ageGroup[key].male = _.groupBy(ageGroup[key].male, "ageGroup.name");
                                ageGroup[key].female = _.groupBy(ageGroup[key].female, "ageGroup.name");
                                if (ageGroup[key].male && ageGroup[key].female) {
                                    final.push(ageGroup[key].male);
                                    final.push(ageGroup[key].female);
                                } else if (ageGroup[key].male) {
                                    final.push(ageGroup[key].male);
                                } else if (ageGroup[key].female) {
                                    final.push(ageGroup[key].female);
                                }
                            });
                            callback(null, final);
                        }
                    });
                }
            },
            function (final, callback) {
                var finalData = [];
                _.each(final, function (singleData) {
                    _.each(singleData, function (n) {
                        var i = 1;
                        if (n.length > 1) {
                            _.each(n, function (single) {
                                var param = {};
                                param.sportId = single._id;
                                param.weight = single.weight._id;
                                param.weightName = single.weight.name + "(" + i + ")";
                                Weight.changeWeight(param, function (err, sportData) {
                                    console.log("sportData", sportData);
                                    finalData.push(sportData);
                                });
                                i++;
                            });
                        }
                    });
                });
                callback(null, finalData);
            },
        ], function (err, complete) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, complete);
            }
        });
    },

    changeWeight: function (data, callback) {
        async.waterfall([
            function (callback) {
                var param = {};
                param.name = data.weightName;
                Weight.saveData(param, function (err, complete) {
                    if (err || _.isEmpty(complete)) {
                        err = "Save Failed !";
                        callback(null, {
                            error: err,
                            success: complete
                        });
                    } else {
                        console.log("weight", complete);
                        callback(null, complete);
                    }
                });
            },
            function (complete, callback) {
                if (complete.error) {
                    callback(null, complete);
                } else {
                    var matchObj = {
                        $set: {
                            weight: complete.weight
                        }
                    };
                    Weight.update({
                        _id: complete.sportId
                    }, matchObj).exec(
                        function (err, match) {
                            if (err) {
                                callback(err, null);
                            } else {
                                callback(null, match);
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
    }



};
module.exports = _.assign(module.exports, exports, model);