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
        // validate: [validators.matches(/\.(gif|jpg|jpeg|tiff|png)$/i)]
    },
    videotype: {
        type: String
    },
    thumbnails: []
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('OldGallery', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {

    getAllMedia: function (data, callback) {
        async.waterfall([
            function (callback) {
                ConfigProperty.findOne().exec(function (err, property) {
                    if (err || _.isEmpty(property)) {
                        callback(null, {
                            error: "error"
                        });
                    } else {
                        callback(null, property);
                    }
                });
            },
            function (property, callback) {
                Event.findOne({
                    city: property.city,
                    year: property.year
                }).exec(function (err, eventData) {
                    if (err || _.isEmpty(eventData)) {
                        callback(null, {
                            error: "error"
                        });
                    } else {
                        callback(null, eventData);
                    }
                });
            },
            function (eventData, callback) {
                OldGallery.find({}).lean().exec(function (err, found) {
                    if (err) {
                        callback(err, null);
                    } else if (_.isEmpty(found)) {
                        callback(null, []);
                    } else {
                        var final = {};
                        final.event = eventData._id;
                        final.media = found;
                        callback(null, final);
                    }
                });
            },
            function (final, callback) {
                async.eachSeries(final.media, function (n, callback) {
                    var formData = {};
                    formData.eventId = final.event;
                    formData.year = n.year;
                    formData.folder = n.folder;
                    formData.imageorder = n.imageorder;
                    formData.medialink = n.medialink;
                    formData.mediatype = n.mediatype;
                    formData.mediatitle = n.mediatitle;
                    formData.thumbnails = n.thumbnails;
                    Gallery.saveData(formData, function (err, mediaData) {
                        // console.log("mediaData", mediaData);
                        if (err) {
                            callback(err, null);
                        } else if (_.isEmpty(mediaData)) {
                            callback("No media data found", null);
                        } else {
                            callback(null, mediaData);
                        }
                    });

                }, function (err, completeLoop) {
                    if (err) {
                        callback(err, null);
                    } else {
                        callback(null, completeLoop);
                    }
                })
            }
        ], function (err, complete) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, complete);
            }
        });
    },


};
module.exports = _.assign(module.exports, exports, model);