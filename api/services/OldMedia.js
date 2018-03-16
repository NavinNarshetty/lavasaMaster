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
        required: true
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
module.exports = mongoose.model('OldMedia', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {

    getAllPhoto: function (data, callback) {
        OldMedia.find({
            mediatype: {
                $ne: "photo"
            },
        }).lean().exec(function (err, found) {
            if (err) {
                callback(err, null);
            } else {
                if (_.isEmpty(found)) {
                    callback(null, []);
                } else {
                    async.concatSeries(found, function (n, callback) {
                        console.log("n", n);
                        var formData = {};
                        formData.year = n.year;
                        formData.folder = n.folder;
                        formData.imageorder = n.imageorder;
                        formData.Date = n.date;
                        formData.order = n.order;
                        formData.medialink = n.medialink;
                        formData.mediatype = n.mediatype;
                        formData.mediatitle = n.mediatitle;
                        Media.saveData(formData, function (err, saveData) {
                            if (err) {
                                callback(err, null);
                            } else {
                                callback(null, saveData);
                            }
                        });
                    }, function (err, complete) {
                        if (err) {
                            callback(err, null);
                        } else {
                            callback(null, complete);
                        }
                    });
                }
            }
        });
    },

    getAllGallery: function (data, callback) {
        OldMedia.find({
            mediatype: "photo"
        }).lean().exec(function (err, found) {
            if (err) {
                callback(err, null);
            } else {
                if (_.isEmpty(found)) {
                    callback(null, []);
                } else {
                    async.concatSeries(found, function (n, callback) {
                        var formData = {};
                        formData.year = n.year;
                        formData.folder = n.folder;
                        formData.imageorder = n.imageorder;
                        formData.Date = n.date;
                        formData.order = n.order;
                        formData.medialink = n.medialink;
                        formData.mediatype = n.mediatype;
                        formData.mediatitle = n.mediatitle;
                        Gallery.saveData(formData, function (err, saveData) {
                            if (err) {
                                callback(err, null);
                            } else {
                                callback(null, saveData);
                            }
                        });
                    }, function (err, complete) {
                        if (err) {
                            callback(err, null);
                        } else {
                            callback(null, complete);
                        }
                    });
                }
            }
        });
    }
};
module.exports = _.assign(module.exports, exports, model);