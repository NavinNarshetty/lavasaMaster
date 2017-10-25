var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate')(mongoose);
var uniqueValidator = require('mongoose-unique-validator');
var timestamps = require('mongoose-timestamp');
var validators = require('mongoose-validators');
var monguurl = require('monguurl');
require('mongoose-middleware').initialize(mongoose);

var Schema = mongoose.Schema;

var schema = new Schema({});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('Result', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {

    getMedalsSchool: function (data, callback) {
        var medals = [];
        async.waterfall([
                function (callback) {
                    Medal.find().lean().exec(function (err, found) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(found)) {
                                callback(null, found);
                            } else {
                                callback(null, found);
                            }
                        }
                    });
                },
                function (found, callback) {
                    if (_.isEmpty(found)) {
                        callback(null, found);
                    } else {
                        _.each(found, function (singleData) {
                            if (!_.isEmpty(singleData.school)) {
                                _.each(singleData.school, function (school) {
                                    var result = {};
                                    result.school = school.schoolName;
                                    result.medals = singleData;
                                    medals.push(result);
                                });
                            }
                        });

                        var medalRank = _(medals)
                            .groupBy('school')
                            .map(function (items, name) {

                                var gender = _(items)
                                    .groupBy('medals.medalType')
                                    .map(function (values, name) {
                                        return {
                                            name: name,
                                            count: values.length
                                        };
                                    }).value();
                                return {
                                    name: name,
                                    medal: gender,
                                    totalCount: items.length
                                };
                            }).value();
                        callback(null, medalRank);
                    }
                },
            ],
            function (err, data2) {
                callback(null, data2);
            });
    },

    getRankSchool: function (data, callback) {
        var medals = [];
        async.waterfall([
                function (callback) {
                    Result.getMedalsSchool(data, function (err, medalRank) {
                        if (err) {
                            callback(err, null);
                        } else if (_.isEmpty(medalRank)) {
                            callback(null, []);
                        } else {
                            var result = _.sortBy(medalRank, item => parseFloat(item[1]));
                            callback(null, result);
                        }
                    });
                },

            ],
            function (err, data2) {
                callback(null, data2);
            });
    }


};
module.exports = _.assign(module.exports, exports, model);