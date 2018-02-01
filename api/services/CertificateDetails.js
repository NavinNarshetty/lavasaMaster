var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate')(mongoose);
var uniqueValidator = require('mongoose-unique-validator');
// var timestamps = require('mongoose-timestamp');
var validators = require('mongoose-validators');
var monguurl = require('monguurl');
require('mongoose-middleware').initialize(mongoose);

var Schema = mongoose.Schema;

var schema = new Schema({
    city: String,
    institutionType: String,
    sportsListSubCategory: {
        type: Schema.Types.ObjectId,
        ref: 'SportsListSubCategory',
        index: true
    },
    banner: String
});

schema.plugin(deepPopulate, {
    populate: {
        'sportsListSubCategory': {
            select: '_id name isTeam sportsListCategory'
        }
    }
});


schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('CertificateDetails', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema, "sportsListSubCategory", "sportsListSubCategory"));
var model = {};
module.exports = _.assign(module.exports, exports, model);