var schema = new Schema({
    year: String,
    eventYear: String,
    eventName: String,
    fromMonth: String,
    toMonth: String,
    date: String,
    venue: [{
        type: String,
    }],
    endDate: String,
    institutionType: {
        type: String,
    },
    state: String,
    sfaCity: String,
    cityAddress: String,
    infoNo: String,
    infoNoArr: [{
        type: String
    }],
    infoId: String,
    ddFavour: String,
    city: [{
        type: String
    }],
    country: String,
    district: [{
        type: String,
    }],
    totalSport: Number,
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

    additionalFee: Number,
    additionalFeeInWords: String,
    amoutWithoutTaxAdditional: Number,
    amoutWithoutTaxAdditionalInWords: String,
    taxTotalAmountAdditionalInWords: String,
    taxTotalAmountAdditional: Number,
    cgstAmoutAdditional: Number,
    cgstPercentAdditional: Number,
    sgstAmoutAdditional: Number,
    sgstPercentAdditional: Number,
    igstAmoutAdditional: Number,
    igstPercentAdditional: Number,
    reqUrl: String,
    // domainUrl: String,
    // paymentUrl: String,
    // backendUrl: String,
    // dbName: String,
    athleteStandards: [{
        type: String
    }],
    termsAndCondition: String,
    // university: String
    sports: [{
        type: String,

    }],
    goldMedal: Number,
    silverMedal: Number,
    bronzeMedal: Number,
    minWonMatch: Number,
    minNoShow: Number,
    bucketName: String,
    cloudUrlPrefix: String,
    keyfileName: String,
    playerUrl: String,
    schoolUrl: String,
    ruleUrl: String

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
                    finalData.eventName = property[0].eventName;
                    finalData.toMonth = property[0].toMonth;
                    finalData.fromMonth = property[0].fromMonth;
                    finalData.sfaCity = property[0].sfaCity;
                    finalData.amount = property[0].totalAmountType;
                    finalData.athleteAmount = property[0].totalAmountAthlete;
                    finalData.cityAddress = property[0].cityAddress;
                    finalData.infoNo = property[0].infoNo;
                    finalData.infoNoArr = property[0].infoNoArr;
                    finalData.infoId = property[0].infoId;
                    finalData.ddFavour = property[0].ddFavour;
                    finalData.additionalFee = property[0].additionalFee;
                    finalData.sports = property[0].sports;
                    finalData.goldMedal = property[0].goldMedal;
                    finalData.silverMedal = property[0].silverMedal;
                    finalData.bronzeMedal = property[0].bronzeMedal;
                    finalData.date = property[0].date;
                    finalData.venue = property[0].venue;
                    finalData.endDate = property[0].endDate;
                    finalData.playerUrl = property[0].playerUrl;
                    finalData.schoolUrl = property[0].schoolUrl;
                    finalData.ruleUrl = property[0].ruleUrl;

                    callback(null, finalData);
                }
            }
        });
    },

};
module.exports = _.assign(module.exports, exports, model);