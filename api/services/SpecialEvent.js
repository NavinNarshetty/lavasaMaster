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
    getAllEventsByMonth: function (data, callback) {
        async.waterfall([
            //find all events
            function (callback) {
                SpecialEvent.find().lean().exec(function (err, found) {
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
            //Group by month
            function (found, callback) {
                var sendObj = [];
                sendObj = found;
                _.each(sendObj, function (n) {
                    var dateVal = moment(n.eventDate, 'YYYY/MM/DD');
                    var year = dateVal.format('YYYY');
                    var month = dateVal.format('MMMM');
                    n.name = month + ' ' + year;
                });
                console.log('SEND OBJ', sendObj);
                var tempData = _.groupBy(sendObj, "name");
                console.log('after', tempData);
                var value = _.partition(tempData, "name");
                console.log('value', tempData);
                // callback(null, "hehehe");
            }
        ], function (err, result) {
            console.log("result", result);
            if (err) {
                callback(err, null);
            } else {
                callback(null, result);
            }
        });
    }
};
module.exports = _.assign(module.exports, exports, model);