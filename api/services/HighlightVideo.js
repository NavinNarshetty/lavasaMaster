var schema = new Schema({

    highlightVideo: [{
        mediaType: {
            type: String,
            default: 'video'
        },
        source: String,
        link: String,
        title: String,
        thumbnails: []
    }]
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('HighlightVideo', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {

    saveVideoHighlight: function (data, callback) {
        // console.log("data", data);
        async.waterfall([
            function (callback) {
                async.each(data.highlightVideo, function (n, callback) {
                    // console.log("n", n);
                    if (n.source === 'vimeo') {
                        var urlData = {};
                        urlData.videoId = n.link;
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
                HighlightVideo.saveData(data, function (err, complete) {
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