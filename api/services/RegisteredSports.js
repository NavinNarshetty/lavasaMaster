var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate')(mongoose);
var uniqueValidator = require('mongoose-unique-validator');
var timestamps = require('mongoose-timestamp');
var validators = require('mongoose-validators');
var monguurl = require('monguurl');
var md5 = require('md5');
var moment = require('moment');
var autoIncrement = require('mongoose-auto-increment');
var objectid = require("mongodb").ObjectID;
autoIncrement.initialize(mongoose);
require('mongoose-middleware').initialize(mongoose);
var schema = new Schema({});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('RegisteredSports', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {

    getTeamSportAggregatePipeLine: function (data) {

        var pipeline = [
            // Stage 1
            {
                $match: {
                    "school": objectid(data.school)
                }
            },

            // Stage 2
            {
                $lookup: {
                    "from": "sports",
                    "localField": "sport",
                    "foreignField": "_id",
                    "as": "sport"
                }
            },

            // Stage 3
            {
                $unwind: {
                    path: "$sport",
                }
            },

            // Stage 4
            {
                $lookup: {
                    "from": "sportslists",
                    "localField": "sport.sportslist",
                    "foreignField": "_id",
                    "as": "sport.sportslist"
                }
            },

            // Stage 5
            {
                $unwind: {
                    path: "$sport.sportslist",
                }
            },

            // Stage 6
            {
                $group: {
                    "_id": {
                        "sportName": "$sport.sportslist.name",
                        "sportsListSubCategory": "$sport.sportslist.sportsListSubCategory",
                    }
                }
            },

        ];
        return pipeline;
    },
    getStudentTeamAggregatePipeLine: function (data) {

        var pipeline = [
            // Stage 1
            {
                $match: {
                    "studentId": objectid(data.athleteid)
                }
            },

            // Stage 2
            {
                $lookup: {
                    "from": "sports",
                    "localField": "sport",
                    "foreignField": "_id",
                    "as": "sport"
                }
            },

            // Stage 3
            {
                $unwind: {
                    path: "$sport"
                }
            },

            // Stage 4
            {
                $lookup: {
                    "from": "sportslists",
                    "localField": "sport.sportslist",
                    "foreignField": "_id",
                    "as": "sport.sportslist"
                }
            },

            // Stage 5
            {
                $unwind: {
                    path: "$sport.sportslist",
                }
            },

            // Stage 6
            {
                $group: {
                    "_id": {
                        "sportName": "$sport.sportslist.name",
                        "sportsListSubCategory": "$sport.sportslist.sportsListSubCategory",
                    }

                }
            },
        ];
        return pipeline;
    },

    getAllRegisteredSport: function (data, callback) {
        var pipeLine = RegisteredSports.getTeamSportAggregatePipeLine(data);
        TeamSport.aggregate(pipeLine, function (err, complete) {
            if (err) {
                console.log(err);
                callback(err, "error in mongoose");
            } else {
                if (_.isEmpty(complete)) {
                    callback(null, []);
                } else {
                    callback(null, complete);
                }
            }
        });
    },

    getAllRegisteredSportAthlete: function (data, callback) {
        var pipeLine = RegisteredSports.getStudentTeamAggregatePipeLine(data);
        StudentTeam.aggregate(pipeLine, function (err, complete) {
            if (err) {
                console.log(err);
                callback(err, "error in mongoose");
            } else {
                if (_.isEmpty(complete)) {
                    callback(null, []);
                } else {
                    callback(null, complete);
                }
            }
        });
    },

};
module.exports = _.assign(module.exports, exports, model);