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

    generateExcel: function (res) {
        async.waterfall([
                function (callback) {
                    SportsList.find().deepPopulate("sportsListSubCategory drawFormat").lean().sort({
                        createdAt: -1
                    }).exec(
                        function (err, complete) {
                            if (err) {
                                console.log(err);
                                callback(err, null);
                            } else if (complete) {
                                callback(null, complete);
                            } else {
                                callback("Invalid data", null);
                            }
                        });
                },
                function (complete, callback) {
                    var excelData = [];
                    _.each(complete, function (n) {
                        var obj = {};
                        var dateTime = moment.utc(n.createdAt).utcOffset("+05:30").format('YYYY-MM-DD HH:mm');
                        obj.createdAt = dateTime;
                        obj.sportsList = n.sportslist.name;
                        obj.ageGroup = n.ageGroup.name;

                        obj.gender = n.gender;
                        obj.maxTeamPlayers = n.maxTeamPlayers;
                        obj.minTeamPlayers = n.minTeamPlayers;
                        obj.maxTeam = n.maxTeam;
                        if (n.weight) {
                            obj.weight = n.weight;
                        } else {
                            obj.weight = " ";
                        }
                        obj.fromDate = n.fromDate;
                        obj.toDate = n.toDate;
                        excelData.push(obj);
                    });
                    console.log("excel:", excelData);
                    Config.generateExcelOld("Sport", excelData, res);
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

};
module.exports = _.assign(module.exports, exports, model);