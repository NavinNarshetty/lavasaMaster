var schema = new Schema({
    bannerImg: String,
    mobilebannerImg: String,
    header: {
        logo: String,
        scheduleDate: String,
        scheduleVenu: String
    },
    counts: [{
        countNumber: Number,
        countHeader: String
    }],
    mainContent: {
        title: String,
        content: String
    },
    galleryImage: [{
        image: String,
        mediaType: {
            type: String,
            default: 'image'
        }
    }],
    galleryVideo: [{

        mediaType: {
            type: String,
            default: 'video'
        },
        videoThumbnail: String,
        videoSource: String,
        videoLink: String

    }]



});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('Championshiparchive', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {};
module.exports = _.assign(module.exports, exports, model);