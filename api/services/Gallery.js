var schema = new Schema({
    title: {
        type: String,
        unique: true
    },
    folderName: String,
    gender: [{
        type: String
    }],
    tags: [{
        type: String
    }],
    shareUrl: String,
    mediatype: String,
    mediaLink: String,
    mediaThumbnail: String,
    isThumbnail: Boolean,
    year: String,
    folderType: String,
    eventName: String
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('Gallery', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {

    getAllPhotosByType: function (data, callback) {
        Gallery.aggregate(
            [
                // Stage 1
                {
                    $match: {
                        "mediatype": "photo",
                        "folderType": data.folderType,
                    }
                },

                // Stage 2
                {
                    $group: {
                        "_id": "$folderName",
                        "folderName": {
                            "$first": "$folderName"
                        },
                        "totalCount": {
                            "$sum": 1
                        },
                        "mediaLink": {
                            "$first": "$mediaLink"
                        },
                        "mediatype": {
                            "$first": "$mediatype"
                        },
                        "mediaThumbnail": {
                            "$push": { "$cond": ["$isThumbnail", "$mediaThumbnail", ""] }
                        }

                    }
                },

            ],
            function (err, photos) {
                if (err) {
                    callback(err, null);
                } else if (!_.isEmpty(photos)) {
                    callback(null, photos);
                } else {
                    callback(null, []);
                }
            }
        );
    },

    getAllPhotosByFolder: function (data, callback) {
        Gallery.find({
            "mediatype": "photo",
            "folderType": data.folderType,
            "folderName": data.folderName
        }, "mediaLink title tags shareUrl mediatype mediaThumbnail").lean().exec(function (err, photos) {
            if (err) {
                callback(err, null);
            } else if (!_.isEmpty(photos)) {
                callback(null, photos);
            } else {
                callback(null, []);
            }
        });

    },
    setThumbnail: function (data, callback) {
        Gallery.find({ folderName: data.folderName }, function (err, found) {
            if (err) {
                callback(err, null);
            } else {
                if (!_.isEmpty(found)) {
                    async.concatSeries(found, function (singleData, callback) {
                        if (data.isThumbnail == true) {
                            if (singleData._id == data._id) {
                                singleData.mediaThumbnail = data.thumbnail;
                                singleData.isThumbnail = true;
                            } else {
                                singleData.mediaThumbnail = " ";
                                singleData.isThumbnail = false;
                            }

                        } else {
                            if (singleData._id == data._id) {
                                singleData.mediaThumbnail = " ";
                                singleData.isThumbnail = false;
                            }
                        }

                        Gallery.saveData(singleData, function (err, saved) {
                            if (err) {
                                callback(err, null);
                            } else {
                                callback(null, saved);
                            }
                        });

                    }, function (err, finalResult) {
                        if (err) {
                            callback(err, null);
                        } else {
                            callback(null, finalResult);
                        }
                    });
                }
            }

        });
    }


};
module.exports = _.assign(module.exports, exports, model);