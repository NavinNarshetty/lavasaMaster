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
                        callback(null, medalData);
                    }
                });
            },
            function (medalData, callback) {
                async.concatSeries(medalData, function (n, callback) {
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
                                    callback(null, sportData);
                                }
                            });
                        },
                        function (sportData, callback) {
                            Athelete.findOne({
                                oldId: n.player
                            }).lean().exec(function (err, athleteData) {
                                if (err) {
                                    callback(err, null);
                                } else if (_.isEmpty(athleteData)) {
                                    callback(null, []);
                                } else {
                                    callback(null, athleteData);
                                }
                            });
                        },
                        function (sportData, callback) {
                            TeamSport.findOne({
                                oldId: n.team
                            }).lean().exec(function (err, athleteData) {
                                if (err) {
                                    callback(err, null);
                                } else if (_.isEmpty(athleteData)) {
                                    callback(null, []);
                                } else {
                                    callback(null, athleteData);
                                }
                            });
                        },


                    ], function (err, complete) {
                        if (err) {
                            callback(err, null);
                        } else {
                            callback(null, complete);
                        }
                    })

                }, function (err, final) {
                    if (err) {
                        callback(err, null);
                    } else {
                        callback(null, final);
                    }
                })
            }
        ], function (err, complete) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, complete);
            }
        })
    }

};
module.exports = _.assign(module.exports, exports, model);