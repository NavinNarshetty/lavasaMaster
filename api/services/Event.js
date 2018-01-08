var schema = new Schema({
    city: String,
    state: String,
    venue: String,
    year: String,
    school: Boolean,
    college: Boolean,
    toMonth: String,
    fromMonth: String,
    eventYear: String,
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('Event', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {
    setEvent: function (data, callback) {
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
                if (property.error) {
                    callback(null, property);
                } else {
                    var formData = {};
                    formData.city = property.sfaCity;
                    formData.venue = property.cityAddress;
                    formData.year = property.year;
                    formData.state = property.state;
                    formData.toMonth = property.toMonth;
                    formData.fromMonth = property.fromMonth;
                    formData.eventYear = property.eventYear;
                    if (property.institutionType == "school") {
                        formData.school = true;
                        formData.college = false;
                    } else {
                        formData.college = true;
                        formData.school = false;
                    }
                    Event.saveData(formData, function (err, complete) {
                        if (err || _.isEmpty(complete)) {
                            callback(null, {
                                error: "Error",
                                success: complete
                            });
                        } else {
                            callback(null, complete);
                        }
                    });
                }
            }
        ], function (err, result) {
            console.log("Final Callback");
            if (err) {
                callback(err, null);
            } else {
                callback(null, result);
            }
        });
    }
};
module.exports = _.assign(module.exports, exports, model);