var schema = new Schema({
    year: String,
    school: {
        type: Schema.Types.ObjectId,
        ref: 'OldSchool'
    },
    player: {
        type: Schema.Types.ObjectId,
        ref: 'OldAthlete'
    },
    team: {
        type: Schema.Types.ObjectId,
        ref: 'OldTeam'
    },
    participantType: {
        type: String
    },
    sport: {
        type: Schema.Types.ObjectId,
        ref: 'OldSport'
    },
    isAddedFromTeam: {
        type: Boolean,
        default: false
    },
    medal: Number
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('OldMedal', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {

    saveMedalsPlayer: function (data, callback) {
        var medal = {};
        async.waterfall([
            function (callback) {
                OldMedal.find({
                    year: data.year,
                    participantType: "player"
                }).lean().exec(function (err, medalData) {
                    if (err) {
                        callback(err, null);
                    } else if (_.isEmpty(medalData)) {
                        callback(null, []);
                    } else {
                        var mainData = _.groupBy(medalData, "medal");
                        var finalData = [];
                        _.each(mainData, function (mainData, key) {
                            finalData.push(_.groupBy(mainData, 'sport'));
                        });
                        callback(null, finalData);
                    }
                });
            },
            function (mainData, callback) {
                // var medalArr = [];
                var final = {};
                async.concatSeries(mainData, function (singleData, callback) {
                    // var final = {};
                    final.sport = [];
                    final.athlete = [];
                    final.school = [];
                    final.medal = [];
                    async.eachSeries(singleData, function (n, callback) {
                        final.medal.push(n.medal);
                        async.waterfall([
                            function (callback) {
                                Sport.findOne({
                                    oldId: n.sport
                                }).lean().exec(function (err, sportData) {
                                    if (err) {
                                        callback(err, null);
                                    } else if (_.isEmpty(sportData)) {
                                        callback(null, []);
                                    } else {
                                        final.sport = sportData._id;
                                        callback(null, sportData);
                                    }
                                });
                            },
                            function (sportData, callback) {
                                Athelete.find({
                                    oldId: n.player
                                }).lean().deepPopulate("school").exec(function (err, athleteData) {
                                    if (err) {
                                        callback(err, null);
                                    } else if (_.isEmpty(athleteData)) {
                                        callback(null, []);
                                    } else {
                                        // console.log("athleteData", athleteData);
                                        _.each(athleteData, function (athlete) {
                                            final.athlete.push(athlete._id);
                                            final.school.push(athlete.school._id);
                                        });
                                        // medalArr.push(final);
                                        callback();
                                    }
                                });
                            }
                        ], function (err, complete) {
                            if (err) {
                                callback(err, null);
                            } else {
                                callback(null, final);
                            }
                        });
                    }, function (err) {
                        if (err) {
                            callback(err, null);
                        } else {
                            callback(null, final);
                        }
                    });
                }, function (err, complete) {
                    if (err) {
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

};
module.exports = _.assign(module.exports, exports, model);