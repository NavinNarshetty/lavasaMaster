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
    }
});

schema.plugin(deepPopulate, {
    populate: {
        'drawFormat': {
            select: '_id name'
        },
        'sportsListSubCategory': {
            select: '_id name isTeam sportsListCategory'
        },
        "sportsListSubCategory.sportsListCategory": {
            select: ''
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
                        obj.date = dateTime;
                        obj.name = n.name;
                        obj.sportsListSubCategory = n.sportsListSubCategory.name;
                        obj.drawFormat = n.drawFormat.name;
                        excelData.push(obj);
                    });
                    console.log("excel:", excelData);
                    Config.generateExcelOld("SportsList", excelData, res);
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
    getAll: function (data, callback) {
        SportsList.find().lean().exec(function (err, found) {
            if (err) {
                callback(err, null);
            } else {
                if (_.isEmpty(found)) {
                    callback(null, []);
                } else {
                    console.log("found0", found);
                    callback(null, found);
                }
            }
        });
    },

    getAllBySport: function (data, callback) {
        SportsList.find({
            sportsListSubCategory: data._id
        }).lean().exec(
            function (err, found) {
                if (err) {
                    callback(err, null);
                } else if (found) {
                    callback(null, found);
                } else {
                    callback("Invalid data", null);
                }
            });
    }

};
module.exports = _.assign(module.exports, exports, model);