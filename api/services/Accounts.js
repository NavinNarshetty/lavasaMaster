var schema = new Schema({
    athlete: {
        type: Schema.Types.ObjectId,
        ref: 'Athelete',
        index: true
    },
    school: {
        type: Schema.Types.ObjectId,
        ref: 'Registration',
        index: true
    },
    transaction: [{
        type: Schema.Types.ObjectId,
        ref: 'Transaction',
        index: true
    }],
    totalToPay: String,
    totalPaid: String,
    outstandingAmount: String,
    PayuId: String,
    accountType: String,
    paymentMode: String,
    receiptId: [{
        type: String,
    }],

});

schema.plugin(deepPopulate, {
    "athlete": '',
    "athlete.school": '',
    "school": '',
    "transaction": ''
});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('Accounts', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {

};
module.exports = _.assign(module.exports, exports, model);