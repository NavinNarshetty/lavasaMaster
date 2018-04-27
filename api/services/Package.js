var schema = new Schema({
    name: String,
    order: Number,
    price: Number,
    discount: Number,
    finalPrice: Number,
    igstPercent: Number,
    cgstPercent: Number,
    sgstPercent: Number,
    igstAmt: Number,
    cgstAmt: Number,
    sgstAmt: Number,
    eventCount: Number,
    description: String,
    color: {
        type: String,
        enum: ["blue", "green", "red", "yellow", "silver", "gold", "bronze"]
    },
    header: String,
    packageUser: String,
    headerImg: String
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('Package', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {};
module.exports = _.assign(module.exports, exports, model);