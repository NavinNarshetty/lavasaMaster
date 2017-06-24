var schema = new Schema({
    name: String,
    sportsListSubCategory: {
        type: Schema.Types.ObjectId,
        ref: 'SportsListSubCategory',
        index: true
    },
    drawFormat: {
        type: Schema.Types.ObjectId,
        ref: 'DrawFormat',
        index: true
    },
    // inactiveimage: String,
    // image: String
});

schema.plugin(deepPopulate, {
    populate: {
        'rules': {
            select: '_id name tournamentFormat rulesAndRegulation ageGroupContent ageGroupTable eligibilityContent eligibilityTable tournamentCommittee'
        },
        'drawFormat': {
            select: '_id name'
        },
        'sportsListSubCategory': {
            select: '_id name'
        }
    }
});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('SportsList', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema, "rules drawFormat sportsListSubCategory", "rules drawFormat sportsListSubCategory"));
var model = {

    getAllSportByType: function (data, callback) {
        var results = {};
        results.teamSports = [];
        results.combatSports = [];
        results.acquaticSports = [];
        results.individualSports = [];
        results.racquetSports = [];
        results.targetSports = [];
        async.waterfall([
                function (callback) {
                    SportsList.find({
                        sporttype: "Team"
                    }).lean().exec(
                        function (err, found) {
                            if (err) {
                                console.log(err);
                                callback(err, null);
                            } else if (found) {
                                results.teamSports = found;
                                callback(null, results);
                            } else {
                                callback("Invalid data", null);
                            }
                        });
                },
                function (results, callback) {
                    SportsList.find({
                        sporttype: "Combat"
                    }).lean().exec(
                        function (err, found) {
                            if (err) {
                                console.log(err);
                                callback(err, null);
                            } else if (found) {
                                results.combatSports = found;
                                callback(null, results);
                            } else {
                                callback("Invalid data", null);
                            }
                        });
                },
                function (results, callback) {
                    SportsList.find({
                        sporttype: "Acquatics"
                    }).lean().exec(
                        function (err, found) {
                            if (err) {
                                console.log(err);
                                callback(err, null);
                            } else if (found) {
                                results.acquaticSports = found;
                                callback(null, results);
                            } else {
                                callback("Invalid data", null);
                            }
                        });
                },
                function (results, callback) {
                    SportsList.find({
                        sporttype: "Individual"
                    }).lean().exec(
                        function (err, found) {
                            if (err) {
                                console.log(err);
                                callback(err, null);
                            } else if (found) {
                                results.individualSports = found;
                                callback(null, results);
                            } else {
                                callback("Invalid data", null);
                            }
                        });
                },
                function (results, callback) {
                    SportsList.find({
                        sporttype: "Target"
                    }).lean().exec(
                        function (err, found) {
                            if (err) {
                                console.log(err);
                                callback(err, null);
                            } else if (found) {
                                results.targetSports = found;
                                callback(null, results);
                            } else {
                                callback("Invalid data", null);
                            }
                        });
                },
                function (results, callback) {
                    SportsList.find({
                        sporttype: "Racquet"
                    }).lean().exec(
                        function (err, found) {
                            if (err) {
                                console.log(err);
                                callback(err, null);
                            } else if (found) {
                                results.racquetSports = found;
                                callback(null, results);
                            } else {
                                callback("Invalid data", null);
                            }
                        });
                }
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

    getSportsRule: function (data, callback) {
        SportsList.find({
            _id: data._id
        }).deepPopulate("rules").lean().exec(
            function (err, found) {
                if (err) {
                    console.log(err);
                    callback(err, null);
                } else if (found) {
                    callback(null, found);
                } else {
                    callback("Invalid data", null);
                }
            });

    },

};
module.exports = _.assign(module.exports, exports, model);