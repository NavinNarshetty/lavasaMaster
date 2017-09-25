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
                    async.waterfall([
                        function (callback) {
                            async.each(arr, function (sportData, callback) {
                                    async.parallel([
                                        function (callback) {
                                            var sportsCategory = {};
                                            sportsCategory.name = sportData.sportslist.sporttype + "Sports";
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
                                        function (callback) {
                                            var sportsCategory = {};
                                            sportsCategory.name = sportData.sportslist.sporttype + "Sports";
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
                                        }
                                    ], function (err, found) {
                                        if (found) {
                                            callback(null, found);
                                        } else {
                                            callback(null, found);
                                        }
                                    });
                                },
                                function (err) {
                                    callback(null, "All data Stored");
                                });
                        },
                        function (oldSchoolData, callback) {
                            async.each(oldSchoolData, function (mainData, callback) {

                                },
                                function (err) {
                                    callback(null, "All data Stored");
                                });
                        }
                    ], function (err, found) {
                        if (found) {
                            callback(null, found);
                        } else {
                            callback(null, found);
                        }
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



};
module.exports = _.assign(module.exports, exports, model);