var schema = new Schema({
    year: String,
    matchid: Number,
    sport: {
        type: Schema.Types.ObjectId,
        ref: "Sport",
        index: true
    },
    event: {
        type: String,
        default: "Qualifying Round"
    },
    order: Number,
    participantType: {
        type: String,
        default: "player"
    },
    player: {
        type: Schema.Types.ObjectId,
        ref: 'Student'
    },
    score: {
        type: String
    },
    result: {
        type: String
    },
    video: {
        type: String,
        default: ""
    },
    position: {
        type: Number,
        default: 0
    },
    date: {
        type: Date
    },
    round: {
        type: String
    }
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('OldQualifyingRound', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {

    getAggregatePipeLine: function (data) {
        var pipeline = [{
                $match: {
                    "participantType": "player",
                    "year": data.year
                }
            },
            // Stage 2
            {
                $group: {
                    _id: "$player",
                    sport: {
                        $addToSet: "$sport"
                    }
                }
            },


        ];
        return pipeline;
    },

    getAllPlayer: function (data, callback) {
        var individualSport = {};
        async.waterfall([
            function (callback) {
                var pipeLine = OldQualifyingRound.getAggregatePipeLine(data);
                OldQualifyingRound.aggregate(pipeLine, function (err, complete) {
                    if (err) {
                        callback(err, "error in mongoose");
                    } else {
                        if (_.isEmpty(complete)) {
                            callback(null, complete);
                        } else {
                            callback(null, complete);
                        }
                    }
                });
            },
            function (complete, callback) {
                OldKnockout.saveIn(complete, individualSport, function (err, saveData) {
                    if (err) {
                        callback(err, null);
                    } else {
                        if (_.isEmpty(saveData)) {
                            var err = {
                                error: "no saveData",
                                data: saveData
                            }
                            callback(null, err);
                        } else {
                            callback(null, saveData);
                        }
                    }
                });
            },
        ], function (err, data3) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, data3);
            }
        });
    },

};
module.exports = _.assign(module.exports, exports, model);