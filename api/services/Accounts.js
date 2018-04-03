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
    },

    upgradeAccount: function (data, callback) {
        async.waterfall([
                function (callback) {
                    var param = {};
                    if (data.athlete) {
                        param.athlete = data.athlete;
                        param.school = undefined;

                    } else {
                        param.school = data.athlete;
                        param.athlete = undefined;
                    }
                    param.dateOfTransaction = new Date();
                    param.package = data.package;
                    param.amountToPay = data.amountToPay;
                    param.amountPaid = data.amountPaid;
                    param.paymentMode = data.registrationFee;
                    if (data.cgstAmt) {
                        param.cgstAmount = data.cgstAmt;
                    }
                    if (data.sgstAmt) {
                        param.sgstAmount = data.sgstAmt;
                    }

                    if (data.igstAmt) {
                        param.sgstAmount = data.igstAmt;
                    }
                    if (data.discount) {
                        param.discount = data.discount;
                    }
                    Transaction.saveData(param, function (err, transactData) {
                        if (err || _.isEmpty(transactData)) {
                            callback(null, {
                                error: "no data found",
                                data: data
                            });
                        } else {
                            callback(null, transactData);
                        }
                    });
                },
                function (transactData, callback) {
                    if (data.athlete) {
                        Accounts.findOne({
                            athlete: data.athlete
                        }).lean().exec(function (err, accountsData) {
                            if (err) {
                                callback(err, null);
                            } else if (_.isEmpty(accountsData)) {
                                var transaction = [];
                                transaction.push(transactData._id);
                                transaction = _.concat(transaction, accountsData.transaction);

                                var matchObj = {
                                    $set: {
                                        sgst: data.sgstAmt,
                                        cgst: data.cgstAmt,
                                        igst: data.igstAmt,
                                        totalToPay: data.amountToPay,
                                        totalPaid: data.amountPaid,
                                        discount: data.discount,
                                        outstandingAmount: data.outstanding,
                                        transaction: transaction,
                                    }
                                };
                                Accounts.update({
                                    athlete: data.athlete
                                }, matchObj).exec(
                                    function (err, data3) {
                                        if (err) {
                                            callback(err, null);
                                        } else if (data3) {
                                            callback(null, accountsData);
                                        }
                                    });
                            }
                        });
                    } else {
                        Accounts.findOne({
                            school: data.school
                        }).lean().exec(function (err, accountsData) {
                            if (err) {
                                callback(err, null);
                            } else if (_.isEmpty(accountsData)) {
                                var transaction = [];
                                transaction.push(transactData._id);
                                transaction = _.concat(transaction, accountsData.transaction);

                                var matchObj = {
                                    $set: {
                                        sgst: data.sgstAmt,
                                        cgst: data.cgstAmt,
                                        igst: data.igstAmt,
                                        totalToPay: data.amountToPay,
                                        totalPaid: data.amountPaid,
                                        discount: data.discount,
                                        outstandingAmount: data.outstanding,
                                        transaction: transaction,
                                    }
                                };
                                Accounts.update({
                                    school: data.school
                                }, matchObj).exec(
                                    function (err, data3) {
                                        if (err) {
                                            callback(err, null);
                                        } else if (data3) {
                                            callback(null, accountsData);
                                        }
                                    });
                            }
                        });
                    }
                }
            ],
            function (err, complete) {
                if (err) {
                    callback(err, null);
                } else {
                    callback(null, complete);
                }
            });
    }

};
module.exports = _.assign(module.exports, exports, model);