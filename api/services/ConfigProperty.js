var schema = new Schema({
    year: String,
    institutionType: {
        type: String,
    },
    state: String,
    sfaCity: String,
    city: [{
        type: String
    }],
    country: String,
    district: [{
        type: String,
    }],
    totalPayAmountType: Number,
    totalPayAmountInWordsType: String,
    taxAmountType: String,
    taxTypeOfInstitutionType: [{
        type: String,
    }],
    percentTaxOfType: Number,

    totalPayAmountAthlete: Number,
    totalPayAmountInWordsAthlete: String,
    taxAmountAthlete: String,
    taxTypeOfAthlete: [{
        type: String,
    }],
    percentTaxOfAthlete: Number,
    reqUrl: String,
    domainUrl: String,
    paymentUrl: String,
    backendUrl: String,
    // dbName: String,
    athleteStandards: [{
        type: String
    }],
    termsAndCondition: String,
    // university: String
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('ConfigProperty', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {

    getDetail: function (data, callback) {
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
                    finalData.city = property[0].city;
                    finalData.district = property[0].district;
                    finalData.type = property[0].institutionType;
                    finalData.state = property[0].state;
                    callback(null, finalData);
                }
            }
        });
    }

};
module.exports = _.assign(module.exports, exports, model);