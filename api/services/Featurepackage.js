var schema = new Schema({
    featureName: String,
    featureDetails: [{
        packageName: {
            type: Schema.Types.ObjectId,
            ref: 'Package',
        },
        featureType: String,
        featureCheck: Boolean,
        featureText: String
    }]



});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('Featurepackage', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {};
module.exports = _.assign(module.exports, exports, model);