var schema = new Schema({
    title: String,
    folderName: String,
    gender: [{
        type: String
    }],
    tags: [{
        type: String
    }],
    shareUrl: String,
    mediaType: String,
    videoType: String,
    mediaLink: String,
    year: String
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('Gallery', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {};
module.exports = _.assign(module.exports, exports, model);