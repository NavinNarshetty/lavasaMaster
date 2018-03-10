var schema = new Schema({
    skip: {
        type: Number,
        default: 0
    },
    limit: {
        type: Number
    },
    isCronRunning: Boolean
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('UploadSkipLimit', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {};
module.exports = _.assign(module.exports, exports, model);
