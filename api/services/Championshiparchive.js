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
        videoThumbnail: [],
        videoSource: String,
        videoLink: String
    }]
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('Championshiparchive', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {

    saveVideoArchive: function (data, callback) {
        async.waterfall([
            function (callback) {
                async.each(data.galleryVideo, function (n, callback) {
                    if (n.videoSource === 'vimeo') {
                        var urlData = {};
                        urlData.videoId = n.videoLink;
                        Vimeo.getThumnailsFromVimeo(urlData, function (err, pictures) {
                            if (err || _.isEmpty(pictures)) {
                                var err = "All wrong values";
                                callback(null, {
                                    error: err,
                                    success: vimeoData
                                });
                            } else {
                                n.videoThumbnail = pictures.sizes;
                                callback();
                            }
                        });
                    }
                }, function (err) {
                    callback(null, data);
                });

            },
            function (data, callback) {
                Championshiparchive.saveData(data, function (err, complete) {
                    if (err || _.isEmpty(complete)) {
                        callback(err, null);
                    } else {
                        callback(null, {
                            error: err,
                            success: complete
                        });
                    }
                });
            }
        ], function (err, complete) {
            if (err) {
                callback(err, callback);
            } else {
                callback(null, complete);
            }
        });
    }
};
module.exports = _.assign(module.exports, exports, model);