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
        // required: function (v) {
        //     return this.mediatype === 'photo';
        // }
    },
    mediatype: {
        type: String,
        // /required: true
    },
    medialink: {
        type: String,
        // required: true
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
            mediatype: "video",
            year: data.year
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
                        if (n.year) {
                            formData.year = n.year;
                        }
                        if (n.folder) {
                            formData.folder = n.folder;
                        }
                        if (n.imageorder) {
                            formData.imageorder = n.imageorder;
                        }
                        if (n.date) {
                            formData.Date = n.date;
                        }
                        if (n.order) {
                            formData.order = n.order;
                        }
                        if (n.medialink) {
                            formData.medialink = n.medialink;
                        }
                        if (n.mediatype) {
                            formData.mediatype = n.mediatype;
                        }
                        if (n.mediatitle) {
                            formData.mediatitle = n.mediatitle;
                        }
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
            mediatype: "photo",
            year: data.year
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
    },

    getAllPressPhoto: function (data, callback) {
        OldMedia.find({
            mediatype: "press-photo",
            year: data.year
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
                        if (n.year) {
                            formData.year = n.year;
                        }
                        if (n.folder) {
                            formData.folder = n.folder;
                        }
                        if (n.imageorder) {
                            formData.imageorder = n.imageorder;
                        }
                        if (n.date) {
                            formData.Date = n.date;
                        }
                        if (n.order) {
                            formData.order = n.order;
                        }
                        if (n.medialink) {
                            formData.medialink = n.medialink;
                        }
                        if (n.mediatype) {
                            formData.mediatype = n.mediatype;
                        }
                        if (n.mediatitle) {
                            formData.mediatitle = n.mediatitle;
                        }
                        Pressnew.saveData(formData, function (err, saveData) {
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
};
module.exports = _.assign(module.exports, exports, model);