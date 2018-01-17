var schema = new Schema({

    highlightVideo: [{
        mediaType: {
            type: String,
            default: 'video'
        },
        source: String,
        link: String,
        title: String,
        thumbnail: {
            type: String,
            default: ''
        }
    }]
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('HighlightVideo', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {};
module.exports = _.assign(module.exports, exports, model);