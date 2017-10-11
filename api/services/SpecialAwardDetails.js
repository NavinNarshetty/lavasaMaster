var schema = new Schema({
    type: {
        type: String,
        enum: ['athlete', 'school', 'college']
    },
    gender:"String",
    awardName:"String",
    
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('SpecialAwardDetails', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {};
module.exports = _.assign(module.exports, exports, model);