var schema = new Schema({
    code: String,
    percent: Number,
    amount: Number,
    fromDate: Date,
    toDate: Date,
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('CouponCode', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {

    validateCode: function (data, callback) {
        CouponCode.findOne({
            code: data.code
        }).lean().exec(function (err, found) {
            if (err) {
                callback(err, null);
            } else if (_.isEmpty(found)) {
                callback(null, "No promocode matched");
            } else {
                var date = new Date();
                var check = moment(date).isBetween(found.fromDate, found.toDate);
                if (check == true) {
                    callback(null, found);
                } else {
                    callback(null, "Not a Valid Code");
                }
            }
        });

    }
};
module.exports = _.assign(module.exports, exports, model);
