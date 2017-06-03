var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate')(mongoose);
var uniqueValidator = require('mongoose-unique-validator');
var timestamps = require('mongoose-timestamp');
var validators = require('mongoose-validators');
var monguurl = require('monguurl');
var objectid = require("mongodb").ObjectID;
var lodash = require('lodash');
var moment = require('moment');

var schema = new Schema({
    gender: String,
    year: String,
    minPlayers: Number,
    maxPlayers: Number,
    sportslist: {
        type: Schema.Types.ObjectId,
        ref: 'SportsList',
        index: true
    },
    ageGroup: [{
        type: Schema.Types.ObjectId,
        ref: 'AgeGroup',
        index: true
    }],
    firstCategory: {
        type: Schema.Types.ObjectId,
        ref: 'FirstCategory',
        index: true
    },
    secondCategory: {
        type: Schema.Types.ObjectId,
        ref: 'SecondCategory',
        index: true
    },
    thirdCategory: {
        type: Schema.Types.ObjectId,
        ref: 'ThirdCategory',
        index: true
    },
    drawFormat: {
        type: Schema.Types.ObjectId,
        ref: 'DrawFormat',
        index: true

    },
});

// schema.plugin(deepPopulate, {});
schema.plugin(deepPopulate, {
    populate: {
        'sportslist': {
            select: '_id name sporttype drawFormat inactiveimage image'
        },
        'ageGroup': {
            select: '_id name'
        },
        'firstCategory': {
            select: '_id name'
        },
        'secondCategory': {
            select: '_id name'
        },
        'thirdCategory': {
            select: '_id name'
        }
    }
});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('Sport', schema);
var exports = _.cloneDeep(require("sails-wohlig-service")(schema, "sportslist ageGroup firstCategory secondCategory thirdCategory", "sportslist ageGroup firstCategory secondCategory thirdCategory"));
var model = {

    getOneSport: function (data, callback) {
        var deepSearch = "sportslist ageGroup firstCategory secondCategory thirdCategory";
        Sport.findOne({
            _id: data._id
        }).deepPopulate(deepSearch).lean().exec(
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

    getAllSports: function (data, callback) {
        var deepSearch = "sportslist ageGroup firstCategory secondCategory thirdCategory";
        Sport.find().deepPopulate(deepSearch).lean().exec(
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