var validators = require('mongoose-validators');


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
        required: true
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
    }
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('Media', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {

    uploadExcel: function (importData, callback) {
        var errorFound = false;
        async.concatSeries(importData, function (singleData, callback) {
            singleData.date = new Date(Math.round((singleData.date - 25569) * 86400 * 1000));

            Media.saveData(singleData, function (err, data) {
                if (err) {
                    errorFound = true;
                    callback(null, {
                        error: true,
                        data: err
                    });
                } else {
                    callback(null, {
                        error: false,
                        data: data
                    });
                }
            });
        }, function (err, result) {
            callback(null, result);
            if (errorFound) {
                async.each(result, function (singleData, callback) {
                    if (!singleData.error && singleData.data._id) {
                        Media.deleteData({
                            '_id': singleData.data._id
                        }, function (err, deleted) {
                            callback(null);
                        })
                    } else {
                        callback(null);
                    }
                }, function (err) {
                    if (err) {

                    } else {
                        console.log("Successfully Deleted");
                    }
                });

            }
        });

    },

    generateExcel: function (data, res) {
        var matchObj = {};
        var name = "";

        function populatedExcel(matchObj) {
            Media.find(matchObj).lean().exec(function (err, medias) {
                async.concatSeries(medias, function (singleMedia, callback) {
                    var obj = {};
                    obj.year = singleMedia.year;
                    obj.folder = singleMedia.folder;
                    obj.order = singleMedia.order;
                    obj.imageorder = singleMedia.imageorder;
                    obj.date = moment(singleMedia.date).format('DD-MM-YY');
                    obj.mediatitle = singleMedia.mediatitle;
                    obj.mediatype = singleMedia.mediatype;
                    obj.medialink = singleMedia.medialink;
                    callback(null, obj);
                },
                    function (err, allMedias) {
                        Config.generateExcel(name, allMedias, res);
                    });

            });
        }

        function sampleExcel() {
            var arrJsonExcel = [];

            function initObj(folder, mediatype, medialink, videotype) {
                var obj = {};
                var name = "";
                obj.year = "2015";
                obj.order = 1;
                obj.imageorder = 1;
                obj.date = moment().format('DD/MM/YY');
                obj.mediatitle = "Tennis day 1";
                obj.folder = folder;
                obj.mediatype = mediatype;
                obj.medialink = medialink;
                obj.videotype = videotype;

                arrJsonExcel.push(obj);
            }
            if (data.press == 'true') {
                // "sampleMediaPress"
                // "press-coverage"
                name = "sampleMediaPress";
                initObj("press-coverage", "press-photo", "qwerty.jpg", "NA");
                initObj("press-coverage", "press-video", "58fe4jfkls849", "youtube");
                initObj("press-coverage", "press-video", "12345678", "vimeo");
                Config.generateExcel(name, arrJsonExcel, res);

            } else {
                // "sampleMediaGallery"
                // "Tennis"
                name = "sampleMediaGallery";
                initObj("TENNIS", "photo", "qwerty.jpg", "NA");
                initObj("TENNIS", "video", "58fe4jfkls849", "youtube");
                initObj("TENNIS", "video", "12345678", "vimeo");
                Config.generateExcel(name, arrJsonExcel, res);
            }


        }

        if (data.sample == 'true') {
            sampleExcel();
        } else {
            if (data.press == 'true') {
                name = "mediaPress";
                matchObj = {
                    $or: [{
                        mediatype: "press-photo"
                    }, {
                        mediatype: "press-video"
                    }]
                }
            } else {
                name = "mediaGallery";
                matchObj = {
                    $or: [{
                        mediatype: "photo"
                    }, {
                        mediatype: "video"
                    }]
                }
            }
            populatedExcel(matchObj);
        }
    },

    getFolders: function (data, callback) {
        var matchObj = {
            "mediatype": data.mediatype
        }
        var pipeline = [{
            $match: matchObj
        }, {
            $group: {
                "_id": '$folder',
                "media": {
                    "$push": "$medialink"
                },
                "videotype": {
                    "$push": "$videotype"
                }
            }
        }];

        Media.aggregate(pipeline, function (err, mediaFolders) {
            if (err || _.isEmpty(mediaFolders)) {
                callback(err, "Folders Not Found");
            } else {
                console.log(mediaFolders);
                _.each(mediaFolders, function (n, key) {
                    n.media = n.media[0];
                    n.videotype = n.videotype[0];
                    if (key == mediaFolders.length - 1)
                        callback(null, mediaFolders);
                });
            }
        });

    },


    getMedias: function (data, callback) {
        var found = {};
        var matchObj = {
            "folder": data.folder,
            "mediatype": data.mediatype,
            "year": data.year
        };
        var maxRow = Config.maxRow;
        var page = 1;
        if (data && data.page) {
            page = data.page;
        }
        var field = data.field;
        var options = {
            field: data.field,
            filters: {
                keyword: {
                    fields: ['medalType'],
                    term: data.keyword
                }
            },
            sort: {
                asc: 'createdAt'
            },
            start: (page - 1) * maxRow,
            count: maxRow
        };

        // sendObj.options = options;
        
        Media.count(matchObj, function (err, count) {
            console.log('count',count);
            found.total = count;
        });
        Medal.find(matchObj).lean().exec(options, function (err, found) {
            if (err) {
                callback(err, null);
            } else if (_.isEmpty(found)) {
                callback(null, "Data is empty");
            } else {
                console.log(found);
                callback(null, found);
            }
        });
    },

    ByPratikgetMedias: function (data, callback) {
        var sendObj = {};
        var matchObj = {
            "folder": data.folder,
            "mediatype": data.mediatype,
            "year": data.year
        };
        var maxRow = Config.maxRow;
        var page = 1;
        if (data && data.page) {
            page = data.page;
        }
        var field = data.field;
        var options = {
            field: data.field,
            filters: {
                keyword: {
                    fields: ['medalType'],
                    term: data.keyword
                }
            },
            sort: {
                asc: 'createdAt'
            },
            start: (page - 1) * maxRow,
            count: maxRow
        };

        // sendObj.options = options;
        Media.count(matchObj, function (err, count) {
            console.log('count',count);
            sendObj.total = count;
        });

        Media.find(matchObj).lean().skip(options.start).limit(options.count).exec(function (err, medias) {
                if (err || _.isEmpty(data)) {
                    callback(err, "Medias Not Found");
                } else {
                    sendObj.results = medias;
                    callback(null, sendObj);
                }
            });
    }
};
module.exports = _.assign(module.exports, exports, model);