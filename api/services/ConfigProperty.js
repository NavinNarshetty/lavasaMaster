var schema = new Schema({
    year: String,
    institutionType: {
        type: String,
    },
    city: String,
    country: String,
    area: [{
        name: String,
    }],
    totalPayAmount: Number,
    totalPayAmountInWords: String,
    taxAmount: String,
    taxType: [{
        name: String,
    }],
    percentTax: Number,
    reqUrl: String,
    domainUrl: String,
    paymentUrl: String,
    backendUrl: String,
    dbName: String,
    athleteStandards: [{
        type: String
    }],
    termsAndCondition: String,
    university: String
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('ConfigProperty', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {

    getCityArea: function (data, callback) {
        var finalData = {};
        finalData.area = [];
        ConfigProperty.find().lean().exec(function (err, property) {
            if (err) {
                console.log("err", err);
                callback("No city and area available", null);
            } else {
                if (_.isEmpty(property)) {
                    callback(null, []);
                } else {
                    finalData.city = property.city;
                    finalData.area = property.area;
                    callback(null, finalData);
                }
            }
        });
    }

};
module.exports = _.assign(module.exports, exports, model);