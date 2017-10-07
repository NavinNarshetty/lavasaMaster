var schema = new Schema({
    name: String,
    city: String,
    headerImage: String,
    content: String,
    sponsorType: String,
    video: {
        link: String,
        videotype: String,
        videoimage: String,
    },
    gallery: [{
        galleryimage: String,
        galleryType: {
            type: String,
            default: 'image'
        }
    }],
    videoGallery: [{
        vimage: String,
        vlink: String,
        vtype: String,
        videoType: {
            type: String,
            default: 'video'
        }
    }]
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('SponsorPage', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {

};
module.exports = _.assign(module.exports, exports, model);