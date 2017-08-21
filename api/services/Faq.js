var schema = new Schema({
    order: Number,
    name: String,
    relatedContentOne: String,
    relatedContentTwo: String,
    tableContent1: Schema.Types.Mixed,
    tableContent2: Schema.Types.Mixed,
    tableContent3: Schema.Types.Mixed,
    tableContent4: Schema.Types.Mixed,
    tableContent5: Schema.Types.Mixed,
    tableContent6: Schema.Types.Mixed,
    tableContent7: Schema.Types.Mixed,
    tableContent8: Schema.Types.Mixed,
    tableContent9: Schema.Types.Mixed,
    tableContent10: Schema.Types.Mixed,



});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('Faq', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {

};
module.exports = _.assign(module.exports, exports, model);