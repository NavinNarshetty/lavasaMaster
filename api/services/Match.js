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
    },
    opponentsSingle: [{
        type: Schema.Types.ObjectId,
        ref: 'Athelete'
    }],
    opponentsTeam: [{
        type: Schema.Types.ObjectId,
        ref: 'TeamSport'
    }],
    prevMatch: {
        type: Schema.Types.ObjectId,
        ref: 'Match'
    },
    nextMatch: {
        type: Schema.Types.ObjectId,
        ref: 'Match'
    },
    scoreCard: Schema.Types.Mixed,
    results: Schema.Types.Mixed
});

schema.plugin(deepPopulate, {
    "sport": {
        select: '_id name '
    },
    "opponentsSingle": {
        select: '_id name '
    },
    "opponentsTeam": {
        select: '_id name '
    },
    "prevMatch": {
        select: '_id name '
    },
    "nextMatch": {
        select: '_id name '
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
    }
};
module.exports = _.assign(module.exports, exports, model);