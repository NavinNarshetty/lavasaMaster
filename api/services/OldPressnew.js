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
module.exports = mongoose.model('OldPressnew', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {

    getAllPress: function (data, callback) {
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
                OldMedia.find({}).lean().exec(function (err, found) {
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