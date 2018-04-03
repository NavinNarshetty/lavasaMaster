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
    totalToPay: {
        type: Number,
        default: 0
    },
    totalPaid: {
        type: Number,
        default: 0
    },
    outstandingAmount: {
        type: Number,
        default: 0
    },
    PayuId: [{
        type: String
    }],
    accountType: String,
    paymentMode: String,
    receiptId: [{
        type: String,
    }],
    discount: {
        type: Number,
        default: 0
    },
    sgst: {
        type: Number,
        default: 0
    },
    cgst: {
        type: Number,
        default: 0
    },
    igst: {
        type: Number,
        default: 0
    },
    checkNo: [{
        type: String,
    }],
    remarks: String,
});

schema.plugin(deepPopulate, {
    populate: {
        "athlete": {
            select: '_id sfaId status year registrationFee firstName middleName surname school paymentStatus package'
        },
        "athlete.school": {
            select: ''
        },
        "school": {
            select: '_id schoolName schoolType schoolCategory year paymentStatus status sfaID'
        },
        "transaction": {
            select: ''
        },
        "transaction.package": {
            select: ''
        }
    }
});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('Accounts', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {

    getAthleteAccount: function (data, callback) {
        var matchObj = {
            athlete: {
                $exists: true
            }
        };
        var Model = this;
        var Const = this(data);
        var maxRow = Config.maxRow;

        var page = 1;
        if (data.page) {
            page = data.page;
        }
        var field = data.field;
        var options = {
            field: data.field,
            filters: {
                keyword: {
                    fields: ['name'],
                    term: data.keyword
                }
            },
            sort: {
                desc: 'createdAt'
            },
            start: (page - 1) * maxRow,
            count: maxRow
        };
        var Search = Model.find(matchObj)
            .order(options)
            .deepPopulate("athlete athlete.school school transaction")
            .keyword(options)
            .page(options, callback);
    },

    getSchoolAccount: function (data, callback) {
        var matchObj = {
            school: {
                $exists: true
            }
        };
        var Model = this;
        var Const = this(data);
        var maxRow = Config.maxRow;

        var page = 1;
        if (data.page) {
            page = data.page;
        }
        var field = data.field;
        var options = {
            field: data.field,
            filters: {
                keyword: {
                    fields: ['name'],
                    term: data.keyword
                }
            },
            sort: {
                desc: 'createdAt'
            },
            start: (page - 1) * maxRow,
            count: maxRow
        };
        var Search = Model.find(matchObj)
            .order(options)
            .deepPopulate("athlete athlete.school school transaction")
            .keyword(options)
            .page(options, callback);
    },

    getAccount: function (data, callback) {
        Accounts.findOne({
            _id: data._id
        }).lean().deepPopulate('athlete school athlete.school transaction transaction.package').exec(
            function (err, found) {
                if (err) {
                    callback(err, null);
                } else if (_.isEmpty(found)) {
                    callback("Empty Data", null);
                } else {
                    found.display = {};
                    found.display.paymentMode = found.paymentMode;
                    found.display.payuId = found.PayuId;
                    found.display.AmountPaid = found.totalPaid;
                    found.display.AmountToPay = found.totalToPay;
                    found.display.outstandingAmount = found.outstandingAmount;
                    found.display.sgst = found.sgst;
                    found.display.cgst = found.cgst;
                    found.display.discount = found.discount;
                    found.display.receiptId = found.receiptId;
                    if (found.checkNo) {
                        found.display.checkNo = found.checkNo;
                    }
                    if (found.school) {
                        found.display.verified = found.school.status;
                    } else {
                        found.display.verified = found.athlete.status;
                    }
                    var i = 1;
                    _.each(found.transaction, function (n) {
                        found.display["package " + i] = {};
                        found.display["package " + i].name = n.package.name;
                        found.display["package " + i].date = n.createdAt;
                        found.display["package " + i].user = n.package.packageUser;
                        found.display["package " + i].amount = n.package.finalPrice;
                        i++;
                    });

                    callback(null, found);
                }
            });
    },

    getStatuts: function (data, callback) {
        Accounts.findOne({
            $or: [{
                athlete: data._id
            }, {
                school: data._id
            }]
        }, 'outstandingAmount totalPaid totalToPay igst cgst sgst athlete').lean().deepPopulate("athlete").exec(
            function (err, found) {
                if (err) {
                    callback(err, null);
                } else if (_.isEmpty(found)) {
                    callback("Empty Data", null);
                } else {
                    callback(null, found);
                }
            });
    }

};
module.exports = _.assign(module.exports, exports, model);