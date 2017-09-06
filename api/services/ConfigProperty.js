var schema = new Schema({
    year: String,
    eventYear: String,
    fromMonth: String,
    toMonth: String,
    institutionType: {
        type: String,
    },
    state: String,
    sfaCity: String,
    cityAddress: String,
    infoNo: String,
    infoId: String,
    ddFavour: String,
    city: [{
        type: String
    }],
    country: String,
    district: [{
        type: String,
    }],
    totalAmountType: Number,
    totalAmountInWordsType: String,
    taxTotalAmountInWords: String,
    taxTotalAmount: Number,
    amoutWithoutTaxType: Number,
    amoutWithoutTaxTypeInWords: String,
    cgstAmout: Number,

    cgstPercent: Number,
    sgstAmout: Number,

    sgstPercent: Number,
    igstAmout: Number,

    igstPercent: Number,
    totalAmountAthlete: Number,
    totalAmountInWordsAthlete: String,
    amoutWithoutTaxAthlete: Number,
    amoutWithoutTaxAthleteInWords: String,
    taxTotalAmountAthleteInWords: String,
    taxTotalAmountAthlete: Number,
    cgstAmoutAthlete: Number,

    cgstPercentAthlete: Number,
    sgstAmoutAthlete: Number,

    sgstPercentAthlete: Number,
    igstAmoutAthlete: Number,

    igstPercentAthlete: Number,
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
                    finalData.year = property[0].year;
                    finalData.eventYear = property[0].eventYear;
                    finalData.toMonth = property[0].toMonth;
                    finalData.fromMonth = property[0].fromMonth;
                    finalData.sfaCity = property[0].sfaCity;
                    finalData.amount = property[0].totalAmountType;
                    finalData.athleteAmount = property[0].totalAmountAthlete;
                    finalData.cityAddress = property[0].cityAddress;
                    finalData.infoNo = property[0].infoNo;
                    finalData.infoId = property[0].infoId;
                    finalData.ddFavour = property[0].ddFavour;
                    callback(null, finalData);
                }
            }
        });
    }

};
module.exports = _.assign(module.exports, exports, model);