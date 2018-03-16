var schema = new Schema({
    name: String,
    price: Number,
    discount: Number,
    finalPrice: Number,
    tax: Number,
    eventCount: Number,
    description: String
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('Package', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {};
module.exports = _.assign(module.exports, exports, model);