var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate')(mongoose);
var uniqueValidator = require('mongoose-unique-validator');
var timestamps = require('mongoose-timestamp');
var validators = require('mongoose-validators');
var monguurl = require('monguurl');
var objectid = require("mongodb").ObjectID;
var lodash = require('lodash');
var moment = require('moment');
require('mongoose-middleware').initialize(mongoose);

var Schema = mongoose.Schema;

var schema = new Schema({
    eventDate: Date,
    color: {
        type: String,
        enum: ["yellow", "green", "blue"]
    },
    format: {
        type: String,
        enum: ["card2", "card3", "card4"]
    },
    section1: Schema.Types.Mixed,
    section2: Schema.Types.Mixed,
    section3: Schema.Types.Mixed
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('SpecialEvent', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {

    getAggregatePipeLine: function (data) {
        var pipeline = [
            // Stage 1
            {
                $group: {
                    _id: {
                        year: {
                            $year: "$eventDate"
                        },
                        month: {
                            $month: "$eventDate"
                        }
                    },
                    info: {
                        $push: {
                            "format": "$format",
                            "eventDate": {
                                dayOfWeek: {
                                    $dayOfWeek: "$eventDate"
                                },
                                day: {
                                    $dayOfMonth: "$eventDate"
                                },
                            },
                            "color": "$color",
                            "section1": "$section1",
                            "section2": "$section2",
                            "section3": "$section3"
                        }
                    }
                }
            },
            {
                $sort: {
                    $eventDate: 1
                }
            }

        ];
        return pipeline;
    },

    getAllEventsByMonth: function (data, callback) {
        async.waterfall([
            function (callback) {
                var pipeLine = SpecialEvent.getAggregatePipeLine(data);
                SpecialEvent.aggregate(pipeLine, function (err, totals) {
                    if (err) {
                        callback(err, "error in mongoose");
                    } else {
                        if (_.isEmpty(totals)) {
                            callback(null, []);
                        } else {
                            console.log("data", totals);
                            callback(null, totals);
                        }
                    }
                });
            },
            function (totals, callback) {
                var monthNames = ["", "January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"
                ];
                async.concatSeries(totals, function (n, callback) {
                    console.log("n", n);
                    var d = new Date(n._id.event);
                    n._id.month = monthNames[n._id.month];
                    callback(null, n);
                }, function (err, complete) {
                    if (err) {
                        callback(err, null);
                    } else {
                        callback(null, complete);
                    }
                });
            }
        ], function (err, data2) {
            if (err) {
                callback(err, null);
            } else if (data2) {
                if (_.isEmpty(data2)) {
                    callback("Data is empty", null);
                } else {
                    callback(null, data2);
                }
            }
        });
    },
};
module.exports = _.assign(module.exports, exports, model);