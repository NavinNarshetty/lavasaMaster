var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate')(mongoose);
var uniqueValidator = require('mongoose-unique-validator');
var timestamps = require('mongoose-timestamp');
var validators = require('mongoose-validators');
var monguurl = require('monguurl');
var autoIncrement = require('mongoose-auto-increment');
var objectid = require("mongodb").ObjectID;
var moment = require('moment');
var request = require("request");
autoIncrement.initialize(mongoose);

var schema = new Schema({
    incrementalId: Number,
    sport: {
        type: Schema.Types.ObjectId,
        ref: 'Sport'
    },
    round: {
        type: Schema.Types.ObjectId,
        ref: 'Round'
    },
    opponentsSingle: [{
        type: Schema.Types.ObjectId,
        ref: 'IndividualSport'
    }],
    opponentsTeam: [{
        type: Schema.Types.ObjectId,
        ref: 'TeamSport'
    }],
    prevMatch: [{
        type: Schema.Types.ObjectId,
        ref: 'Match'
    }],
    nextMatch: {
        type: Schema.Types.ObjectId,
        ref: 'Match'
    },
    scoreCard: Schema.Types.Mixed,
    results: Schema.Types.Mixed,
    scheduleDate: Date,
});

schema.plugin(deepPopulate, {
    "sport": {
        select: '_id sportslist gender ageGroup'
    },
    "round": {
        select: '_id name '
    },
    "opponentsSingle": {
        select: '_id sport athleteId sportsListSubCategory createdBy '
    },
    "opponentsTeam": {
        select: '_id name teamId schoolName studentTeam createdBy sport school'
    },
    "prevMatch": {
        select: '_id incrementalId '
    },
    "nextMatch": {
        select: '_id incrementalId '
    },
});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
schema.plugin(autoIncrement.plugin, {
    model: 'Match',
    field: 'incrementalId',
    startAt: 1,
    incrementBy: 1
});
module.exports = mongoose.model('Match', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {

    getAggregatePipeline: function () {
        var pipeline = [{
            $lookup: {
                "from": "atheletes",
                "localField": "opponentsSingle",
                "foreignField": "_id",
                "as": "opponentsSingle"
            }
        }, {
            $lookup: {
                "from": "sports",
                "localField": "sport",
                "foreignField": "_id",
                "as": "sport"
            }
        }, {
            $unwind: {
                path: "$sport",
                preserveNullAndEmptyArrays: false // optional
            }
        }];
        return pipeline;
    },
    getOneMatch: function (data, callback) {
        if (!_.isEmpty(data)) {
            var commonPipeline = Match.getAggregatePipeline();
            var newPipeline = [{
                $match: {
                    "_id": ObjectId(data._id)
                }
            }];
            _.each(commonPipeline, function (n) {
                newPipeline.push(n);
            });
            Match.aggregate(newPipeline, function (err, result) {
                if (err || _.isEmpty(result)) {
                    callback(err, result);
                } else {
                    callback(null, result);
                }
            });
        } else {
            callback("Invalid Params", null);
        }
    },
    getAll: function (data, callback) {
        var pipeline = Match.getAggregatePipeline(data);
        Match.aggregate(pipeline, function (err, result) {
            if (err || _.isEmpty(result)) {
                callback(err, result);
            } else {
                callback(null, result);
            }
        });
    },

    getAllwithFind: function (data, callback) {
        var deepSearch = "sport nextMatch opponentsSingle opponentsTeam prevMatch nextMatch";
        Match.find().lean().deepPopulate(deepSearch).exec(function (err, found) {
            if (err) {
                callback(err, null);
            } else {
                if (_.isEmpty()) {
                    callback(null, []);
                } else {
                    callback(null, found);
                }
            }
        });
    },

    saveMatch: function (data, callback) {
        async.waterfall([
                function (callback) {
                    if (_.isEmpty(data.opponentsSingle)) {
                        data.opponentsSingle = undefined;
                    }
                    if (_.isEmpty(data.opponentsTeam)) {
                        data.opponentsTeam = undefined;
                    }
                    if (_.isEmpty(data.prevMatch)) {
                        data.prevMatch = undefined;
                    }
                    if (_.isEmpty(data.nextMatch)) {
                        data.nextMatch = undefined;
                    }
                    callback(null, data);
                },
                function (data, callback) {
                    Match.saveData(data, function (err, complete) {
                        if (err) {
                            console.log("err", err);
                            callback("There was an error while saving", null);
                        } else {
                            if (_.isEmpty(complete)) {
                                callback(null, []);
                            } else {
                                callback(null, complete);
                            }
                        }
                    });
                }
            ],
            function (err, results) {
                if (err) {
                    console.log(err);
                    callback(null, results);
                } else if (results) {
                    if (_.isEmpty(results)) {
                        callback(null, results);
                    } else {
                        callback(null, results);
                    }
                }
            });
    }
};
module.exports = _.assign(module.exports, exports, model);