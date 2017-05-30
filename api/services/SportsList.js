var schema = new Schema({
    name: String,
    sporttype: String,
    tableContent: Schema.Types.Mixed,
    drawFormat: String,
    inactiveimage: String,
    image: String
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('SportsList', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {};
module.exports = _.assign(module.exports, exports, model);