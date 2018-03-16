var schema = new Schema({
    year: {
        type: String,
        required: true
    },
    folder: {
        type: String,
        required: true
    },
    order: {
        type: Number,
        required: true
    },
    imageorder: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        // required: true
    },
    mediatitle: {
        type: String,
        required: function (v) {
            return this.mediatype === 'photo';
        }
    },
    mediatype: {
        type: String,
        required: true
    },
    medialink: {
        type: String,
        required: true
        // validate: [validators.matches(/\.(gif|jpg|jpeg|tiff|png)$/i)]
    },
    videotype: {
        type: String
    },
    thumbnails: [],
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('Gallery', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {};
module.exports = _.assign(module.exports, exports, model);