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
        required: true,
        validate: [validators.matches(/\.(gif|jpg|jpeg|tiff|png)$/i)]
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
                        obj.date = moment(singleMedia.date).format('DD/MM/YY');
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
            var obj = {};
            var name="";
            obj.year = "2015";
            obj.order = 1;
            obj.imageorder = 1;
            obj.date = moment().format('DD/MM/YY');
            obj.mediatitle = "Tennis day 1";

            if (data.press == 'true') {
                name="sampleMediaPress";
                obj.folder = "press-coverage";
                obj.mediatype = "press-photo";
                obj.medialink = "1.jpeg";

            } else {
                name="sampleMediaGallery";                
                obj.folder = "Tennis";
                obj.mediatype = "photo";
                obj.medialink = "2.jpg";
            }
            Config.generateExcel(name, [obj], res);
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





    }
};
module.exports = _.assign(module.exports, exports, model);