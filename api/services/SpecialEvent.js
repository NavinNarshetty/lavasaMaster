var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate')(mongoose);
var uniqueValidator = require('mongoose-unique-validator');
var timestamps = require('mongoose-timestamp');
var validators = require('mongoose-validators');
var monguurl = require('monguurl');
require('mongoose-middleware').initialize(mongoose);

var Schema = mongoose.Schema;

var schema = new Schema({
    eventDate: date,
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
var model = {};
module.exports = _.assign(module.exports, exports, model);