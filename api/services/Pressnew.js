var schema = new Schema({
    year: {
        type: String,
    },
    folder: {
        type: String,
    },
    order: {
        type: Number,
    },
    imageorder: {
        type: Number,
    },
    date: {
        type: Date,
    },
    mediatitle: {
        type: String,
    },
    mediatype: {
        type: String,
    },
    medialink: {
        type: String,
    },
    videotype: {
        type: String
    },
    thumbnails: [],
});
schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('Pressnew', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {};
module.exports = _.assign(module.exports, exports, model);