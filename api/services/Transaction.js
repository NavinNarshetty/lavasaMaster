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
    dateOfTransaction: Date,
    package: {
        type: Schema.Types.ObjectId,
        ref: 'Package',
        index: true
    },
    amountToPay: String,
    amountPaid: String,
    paymentMode: String,
    PayuId: String,
    accountType: String,
    paymentMode: String,
    receiptId: [{
        type: String,
    }],
    discount: Number,
    sgstAmount: Number,
    cgstAmount: Number,
});

schema.plugin(deepPopulate, {

});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('Transaction', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {

    saveTransaction: function (data, callback) {
        async.waterfall([
                function (callback) {
                    var param = {};
                    if (data.athlete) {
                        param.athlete = data.athlete;
                        param.school = undefined;
                    } else {
                        param.school = data.school;
                        param.athlete = undefined;
                    }
                    if (data.coupon.amount) {
                        param.discount = data.coupon.amount;
                    } else if (data.coupon.percent) {
                        param.discount = (data.package.finalPrice * data.coupon.percent) / 100;
                    } else {
                        param.discount = 0;
                    }
                    param.dateOfTransaction = new date();
                    param.package = data.package._id;
                    param.amountToPay = (data.package.finalPrice - param.discount);
                    param.paymentMode = data.paymentMode;
                    param.amountPaid = data.amountPaid;
                    param.PayuId = data.PayuId;
                    param.receiptId = data.receiptId;
                    param.accountType = data.accountType;
                    Transaction.saveData(param, function (err, transactData) {
                        if (err || _.isEmpty(transactData)) {
                            callback(null, {
                                error: "No Data",
                                data: found
                            });
                        } else {
                            callback(null, transactData);
                        }
                    });
                },
                function (transactData, callback) {
                    var transaction = [];
                    if (transactData.athlete != undefined) {
                        Transaction.accountsSaveAthleteTransaction(transactData, function (err, vData) {
                            if (err) {
                                callback(err, null);
                            } else if (vData) {
                                callback(null, vData);
                            }
                        });
                    } else {
                        Transaction.accountsSaveSchoolTransaction(transactData, function (err, vData) {
                            if (err) {
                                callback(err, null);
                            } else if (vData) {
                                callback(null, vData);
                            }
                        });
                    }

                },
            ],
            function (err, complete) {
                if (err) {
                    callback(err, null);
                } else {
                    callback(null, complete);
                }
            });
    },

    accountsFirstTransaction: function (transactData, callback) {
        var transaction = [];
        var receipt = [];
        transaction.push(transactData._id);
        receipt.push(transactData.receiptId);
        if (transactData.paymentMode == "cash" && transactData.amountToPay == 0) {
            var matchObj = {
                $set: {
                    athlete: transactData.athlete,
                    transaction: transaction,
                    totalToPay: transactData.amountToPay,
                    totalPaid: transactData.amountPaid,
                    outstandingAmount: 0,
                    paymentMode: transactData.paymentMode,
                    receiptId: receipt,
                }
            };
        } else {
            var matchObj = {
                $set: {
                    athlete: transactData.athlete,
                    transaction: transaction,
                    totalToPay: transactData.amountToPay,
                    totalPaid: transactData.amountPaid,
                    outstandingAmount: 0,
                    PayuId: transactData.PayuId,
                    accountType: transactData.accountType,
                    paymentMode: transactData.paymentMode,
                    receiptId: receipt,
                }
            };
        }
        Accounts.update({
            athlete: transactData.athlete
        }, matchObj).exec(
            function (err, data3) {
                if (err) {
                    callback(err, null);
                } else if (data3) {
                    callback(null, transactData);
                }
            });
    },

    accountsFirstTransactionSchool: function (transactData, callback) {
        var transaction = [];
        transaction.push(transactData._id);
        if (transactData.paymentMode == "cash" && transactData.amountToPay == 0) {
            var matchObj = {
                $set: {
                    school: transactData.school,
                    transaction: transaction,
                    totalToPay: transactData.amountToPay,
                    totalPaid: transactData.amountPaid,
                    outstandingAmount: 0,
                    paymentMode: transactData.paymentMode,
                }
            };
        } else {
            var matchObj = {
                $set: {
                    school: transactData.school,
                    transaction: transaction,
                    totalToPay: transactData.amountToPay,
                    totalPaid: transactData.amountPaid,
                    outstandingAmount: 0,
                    PayuId: transactData.PayuId,
                    accountType: transactData.accountType,
                    paymentMode: transactData.paymentMode,
                    receiptId: transactData.receiptId,
                }
            };
        }
        Accounts.update({
            school: transactData.school
        }, matchObj).exec(
            function (err, data3) {
                if (err) {
                    callback(err, null);
                } else if (data3) {
                    callback(null, transactData);
                }
            });
    },

    accountsSaveAthleteTransaction: function (transactData, callback) {
        async.waterfall([
            function (callback) {
                Accounts.findOne({
                    athlete: transactData.athlete
                }).lean().exec(function (err, accountsData) {
                    if (err || _.isEmpty(accountsData)) {
                        callback(null, {
                            error: "NO accounts found",
                            data: transactData
                        });
                    } else {
                        callback(null, accountsData);
                    }
                });
            },
            function (accountsData, callback) {
                if (accountsData.error) {
                    callback(null, accountsData);
                } else {
                    if (_.isEmpty(accountsData.transaction) || accountsData.transaction.length == 0) {
                        Transaction.accountsFirstTransaction(transactData, function (err, vData) {
                            if (err) {
                                callback(err, null);
                            } else if (vData) {
                                callback(null, vData);
                            }
                        });
                    } else {
                        var transaction = [];
                        var toPay;
                        _.each(accountsData.transaction, function (n) {
                            transaction.push(n);
                            toPay = accountsData.totalToPay;
                        });
                        transaction.push(transactData._id);
                        if (toPay > 0) {
                            toPay = transactData.package.finalPrice - (toPay + transactData.amountToPay);
                        } else {
                            toPay = transactData.package.finalPrice - transactData.amountToPay;
                        }
                        var amount = transactData.amountPaid + accountsData.totalPaid;
                        // var outstanding=
                        if (transactData.paymentMode == "cash") {
                            var matchObj = {
                                $set: {
                                    athlete: transactData.athlete,
                                    transaction: transaction,
                                    totalToPay: toPay,
                                    totalPaid: amount,
                                    outstandingAmount: 0,
                                    paymentMode: transactData.paymentMode,
                                }
                            };
                        } else {
                            var matchObj = {
                                $set: {
                                    athlete: transactData.athlete,
                                    transaction: transaction,
                                    totalToPay: toPay,
                                    totalPaid: amount,
                                    outstandingAmount: 0,
                                    PayuId: transactData.PayuId,
                                    accountType: transactData.accountType,
                                    paymentMode: transactData.paymentMode,
                                    receiptId: transactData.receiptId,
                                }
                            };
                        }
                        Accounts.update({
                            athlete: transactData.athlete
                        }, matchObj).exec(
                            function (err, data3) {
                                if (err) {
                                    callback(err, null);
                                } else if (data3) {
                                    callback(null, transactData);
                                }
                            });
                    }
                }
            }
        ], function (err, complete) {

        });

    },

    accountsSaveSchoolTransaction: function (transactData, callback) {
        async.waterfall([
            function (callback) {
                Accounts.findOne({
                    school: transactData.school
                }).lean().exec(function (err, accountsData) {
                    if (err || _.isEmpty(accountsData)) {
                        callback(null, {
                            error: "NO accounts found",
                            data: transactData
                        });
                    } else {
                        callback(null, accountsData);
                    }
                });
            },
            function (accountsData, callback) {
                if (accountsData.error) {
                    callback(null, accountsData);
                } else {
                    if (_.isEmpty(accountsData.transaction) || accountsData.transaction.length == 0) {
                        Transaction.accountsFirstTransactionSchool(transactData, function (err, vData) {
                            if (err) {
                                callback(err, null);
                            } else if (vData) {
                                callback(null, vData);
                            }
                        });
                    } else {
                        var transaction = [];
                        var toPay;
                        _.each(accountsData.transaction, function (n) {
                            transaction.push(n);
                            toPay = accountsData.totalToPay;
                        });
                        transaction.push(transactData._id);
                        if (toPay > 0) {
                            toPay = transactData.package.finalPrice - (toPay + transactData.amountToPay);
                        } else {
                            toPay = transactData.package.finalPrice - transactData.amountToPay;
                        }
                        var amount = transactData.amountPaid + accountsData.totalPaid;
                        // var outstanding=
                        if (transactData.paymentMode == "cash") {
                            var matchObj = {
                                $set: {
                                    school: transactData.school,
                                    transaction: transaction,
                                    totalToPay: toPay,
                                    totalPaid: amount,
                                    outstandingAmount: 0,
                                    paymentMode: transactData.paymentMode,
                                }
                            };
                        } else {
                            var matchObj = {
                                $set: {
                                    school: transactData.school,
                                    transaction: transaction,
                                    totalToPay: toPay,
                                    totalPaid: amount,
                                    outstandingAmount: 0,
                                    PayuId: transactData.PayuId,
                                    accountType: transactData.accountType,
                                    paymentMode: transactData.paymentMode,
                                    receiptId: transactData.receiptId,
                                }
                            };
                        }
                        Accounts.update({
                            school: transactData.school
                        }, matchObj).exec(
                            function (err, data3) {
                                if (err) {
                                    callback(err, null);
                                } else if (data3) {
                                    callback(null, transactData);
                                }
                            });
                    }
                }
            }
        ], function (err, complete) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, complete);
            }
        });

    },

    saveCashTransaction: function (data, callback) {
        data.transaction = [];
        data.receipt = [];
        async.waterfall([
                function (callback) {
                    async.each(data.packageData, function (n, callback) {
                        if (data.athleteId) {
                            Transaction.findOne({
                                athlete: data.athleteId,
                                package: n.package._id
                            }).lean().exec(function (err, foundTransact) {
                                if (err) {
                                    callback(err, null);
                                } else if (_.isEmpty(foundTransact)) {
                                    var param = {};
                                    param.athlete = data.athleteId;
                                    param.school = undefined;
                                    param.dateOfTransaction = new Date();
                                    param.package = n.package._id;
                                    param.amountToPay = n.package.amount;
                                    param.paymentMode = data.modePayment;
                                    if (data.cgst) {
                                        param.cgstAmount = data.cgst;
                                    }
                                    if (data.sgst) {
                                        param.sgstAmount = data.sgst;
                                    }
                                    if (data.discount) {
                                        param.discount = data.discount;
                                    }
                                    var recepit = n.reciptNo.split(",");
                                    param.receiptId = recepit;
                                    data.receipt = _.concat(data.receipt,  recepit);
                                    Transaction.saveData(param, function (err, transactData) {
                                        if (err || _.isEmpty(transactData)) {
                                            callback(null, {
                                                error: "no data found",
                                                data: data
                                            });
                                        } else {
                                            data.transaction.push(transactData._id);
                                            callback(null, data);
                                        }
                                    });
                                } else {
                                    var receipt = n.reciptNo.split(",");
                                    data.receipt = _.concat(data.receipt, receipt);
                                    var matchObj = {
                                        $set: {
                                            dateOfTransaction: new Date(),
                                            discount: data.discount,
                                            receiptId: receipt,
                                            paymentMode: data.modePayment,
                                            cgstAmount: data.cgst,
                                            sgstAmount: data.sgst,
                                        }
                                    };
                                    Transaction.update({
                                        athlete: data.athleteId
                                    }, matchObj).exec(
                                        function (err, data3) {
                                            if (err) {
                                                callback(err, null);
                                            } else if (data3) {
                                                callback(null, data);
                                            }
                                        });
                                }
                            });
                        } else {
                            Transaction.findOne({
                                school: data.school,
                                package: n._id
                            }).lean().exec(function (err, foundTransact) {
                                if (err) {
                                    callback(err, null);
                                } else if (_.isEmpty(foundTransact)) {
                                    var param = {};
                                    param.school = data.school;
                                    param.athlete = undefined;
                                    param.dateOfTransaction = new Date();
                                    param.package = n.package._id;
                                    param.amountToPay = n.package.amount;
                                    param.paymentMode = data.modePayment;
                                    if (data.cgst) {
                                        param.cgstAmount = data.cgst;
                                    }
                                    if (data.sgst) {
                                        param.sgstAmount = data.sgst;
                                    }
                                    if (data.discount) {
                                        param.discount = data.discount;
                                    }
                                    var receipt = n.reciptNo.split(",");
                                    param.receiptId = receipt;
                                    var mainReceipt = _.concat(data.receipt, receipt);
                                    data.receipt = _.uniq(mainReceipt);
                                    Transaction.saveData(param, function (err, transactData) {
                                        if (err || _.isEmpty(transactData)) {
                                            callback(null, {
                                                error: "no data found",
                                                data: data
                                            });
                                        } else {
                                            data.transaction.push(transactData._id);
                                            callback(null, data);
                                        }
                                    });
                                } else {
                                    var receipt = n.reciptNo.split(",");
                                    var mainReceipt = _.concat(data.receipt,  receipt);
                                    data.receipt = _.uniq(mainReceipt);
                                    var matchObj = {
                                        $set: {
                                            dateOfTransaction: new Date(),
                                            discount: data.discount,
                                            receiptId: receipt,
                                            paymentMode: data.modePayment,
                                            cgstAmount: data.cgst,
                                            sgstAmount: data.sgst,
                                        }
                                    };
                                    Transaction.update({
                                        school: data.school
                                    }, matchObj).exec(
                                        function (err, data3) {
                                            if (err) {
                                                callback(err, null);
                                            } else if (data3) {
                                                callback(null, data);
                                            }
                                        });
                                }
                            });
                        }
                    }, function (err) {
                        callback(null, data);
                    });
                },
                function (data, callback) {
                    if (data.athleteId) {
                        Accounts.findOne({
                            athlete: data.athleteId
                        }).lean().exec(function (err, accountsData) {
                            if (err) {
                                callback(err, null);
                            } else if (_.isEmpty(accountsData)) {
                                var param = {};
                                param.athlete = data.athleteId;
                                param.school = undefined;
                                param.transaction = data.transaction;
                                param.totalToPay = data.netTotal;
                                param.paymentMode = data.modePayment;
                                if (data.discount) {
                                    param.discount = data.discount;
                                }
                                if (data.sgst) {
                                    param.sgst = data.sgst;
                                }
                                if (data.cgst) {
                                    param.cgst = data.cgst;
                                }
                                if (data.checkNo) {
                                    param.checkNo = data.checkNo;
                                }
                                if (data.remarks) {
                                    param.remarks = data.remarks;
                                }
                                param.receiptId = data.receipt;
                                Accounts.saveData(param, function (err, accountsDataNew) {
                                    if (err || _.isEmpty(accountsDataNew)) {
                                        callback(null, {
                                            error: "no data found",
                                            data: data
                                        });
                                    } else {
                                        callback(null, accountsDataNew);
                                    }
                                });
                            } else {
                                var transactionFinal = _.concat(accountsData.transaction, data.transaction);
                                var matchObj = {
                                    $set: {
                                        transaction: transactionFinal,
                                        totalToPay: data.netTotal,
                                        discount: data.discount,
                                        receiptId: data.receipt,
                                        paymentMode: data.modePayment,
                                        checkNo: data.checkNo,
                                        cgst: data.cgst,
                                        sgst: data.sgst,
                                        remarks: data.remarks
                                    }
                                };
                                Accounts.update({
                                    athlete: data.athleteId
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
                                var param = {};
                                param.athlete = data.athleteId;
                                param.school = undefined;
                                param.transaction = data.transaction;
                                param.totalToPay = data.netTotal;
                                param.paymentMode = data.modePayment;
                                if (data.discount) {
                                    param.discount = data.discount;
                                }
                                if (data.sgst) {
                                    param.sgst = data.sgst;
                                }
                                if (data.cgst) {
                                    param.cgst = data.cgst;
                                }
                                if (data.checkNo) {
                                    param.checkNo = data.checkNo;
                                }
                                if (data.remarks) {
                                    param.remarks = data.remarks;
                                }
                                param.receiptId = data.receipt;
                                Accounts.saveData(param, function (err, accountsDataNew) {
                                    if (err || _.isEmpty(accountsDataNew)) {
                                        callback(null, {
                                            error: "no data found",
                                            data: data
                                        });
                                    } else {
                                        callback(null, accountsData);
                                    }
                                });
                            } else {
                                var transactionFinal = _.concat(accountsData.transaction, data.transaction);
                                var matchObj = {
                                    $set: {
                                        transaction: transactionFinal,
                                        totalToPay: data.netTotal,
                                        discount: data.discount,
                                        receiptId: data.receipt,
                                        paymentMode: data.modePayment,
                                        checkNo: data.checkNo,
                                        cgst: data.cgst,
                                        sgst: data.sgst,
                                        remarks: data.remarks
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
                },
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