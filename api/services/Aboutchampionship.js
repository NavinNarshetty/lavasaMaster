var schema = new Schema({
    city: String,
    title: String,
    mediaType: String,
    mediaLink: String,
    mediaSource: String,
    contentData: String,
    buttonData: [{
        buttonTitle: String,
        buttonLinkType: String,
        buttonLink: String,
        buttonStatus: String
    }]
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('Aboutchampionship', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {};
module.exports = _.assign(module.exports, exports, model);