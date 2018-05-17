var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate')(mongoose);
var uniqueValidator = require('mongoose-unique-validator');
// var timestamps = require('mongoose-timestamp');
var validators = require('mongoose-validators');
var monguurl = require('monguurl');
var autoIncrement = require('mongoose-auto-increment');
var objectid = require("mongodb").ObjectID;
var moment = require('moment');
var request = require("request");
var generator = require('generate-password');
autoIncrement.initialize(mongoose);
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
    amountToPay: {
        type: Number,
        default: 0
    },
    amountPaid: {
        type: Number,
        default: 0
    },
    PayuId: String,
    accountType: String,
    paymentMode: String,
    receiptId: [{
        type: String,
    }],
    checkNo: [{
        type: String,
    }],
    discount: {
        type: Number,
        default: 0
    },
    sgstAmount: {
        type: Number,
        default: 0
    },
    cgstAmount: {
        type: Number,
        default: 0
    },
    igstAmount: {
        type: Number,
        default: 0
    },
    outstandingAmount: {
        type: Number,
        default: 0
    },
    paymentStatus: String,
    receiptKeyId: Number,

});

schema.plugin(deepPopulate, {
    populate: {
        package: {
            select: ''
        }
    }
});
schema.plugin(uniqueValidator);
schema.plugin(autoIncrement.plugin, {
    model: 'Transaction',
    field: 'receiptKeyId',
    startAt: 1,
    incrementBy: 1
});
schema.plugin(timestamps);
module.exports = mongoose.model('Transaction', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {

    saveTransaction: function (data, found, callback) {
        // console.log("data", data, "found", found);
        async.waterfall([
                function (callback) {
                    var param = {};
                    if (data.athlete) {
                        param.athlete = found._id;
                        param.school = undefined;
                    } else {
                        // console.log("inside school");
                        param.school = found._id;
                        param.athlete = undefined;
                    }
                    param.dateOfTransaction = new Date();
                    param.package = found.package;
                    param.amountPaid = found.accounts.totalPaid;
                    param.amountToPay = found.accounts.totalToPay;
                    param.paymentMode = "online PAYU";
                    param.discount = found.accounts.discount;
                    param.sgstAmount = found.accounts.sgst;
                    param.cgstAmount = found.accounts.cgst;
                    param.igstAmount = found.accounts.igst;
                    if (data.transactionid) {
                        param.PayuId = data.transactionid;
                    } else {
                        param.PayuId = data.transactionID;
                    }
                    param.paymentStatus = "Paid";
                    var receipt = [];
                    var temp = "SFA" + found.receiptId;
                    receipt.push(temp);
                    param.receiptId = receipt;
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
                    if (transactData.error) {
                        callback(null, transactData);
                    } else {
                        // console.log("transactData", transactData);
                        var transaction = [];
                        var payu = [];
                        transaction.push(transactData._id);
                        payu.push(transactData.PayuId);
                        if (transactData.athlete != undefined) {
                            var matchObj = {
                                $set: {
                                    transaction: transaction,
                                    PayuId: payu,
                                    receiptId: transactData.receiptId,
                                    paymentMode: transactData.paymentMode,
                                    coupon: data.coupon
                                }
                            };
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

                        } else {
                            var matchObj = {
                                $set: {
                                    transaction: transaction,
                                    PayuId: payu,
                                    receiptId: transactData.receiptId,
                                    paymentMode: transactData.paymentMode,
                                    coupon: data.coupon
                                }
                            };
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

    saveUpdateTransaction: function (data, found, callback) {
        console.log("data***", data, "found****", found);
        async.waterfall([
                function (callback) {
                    var len = found.accounts.transaction.length;
                    len--;
                    Transaction.findOne({
                        _id: found.accounts.transaction[len]
                    }).lean().exec(function (err, transactData) {
                        if (err || _.isEmpty(transactData)) {
                            callback(null, {
                                error: "no data found",
                                data: found
                            });
                        } else {
                            if (transactData.athlete) {
                                data.athlete = true;
                            } else {
                                data.athlete = false;
                            }
                            data.package = transactData.package;
                            callback(null, transactData);
                        }
                    });
                },
                function (transactData, callback) {
                    if (transactData.error) {
                        callback(null, transactData);
                    } else {
                        var receipt = [];
                        var temp = "SFA-UP-" + transactData.receiptKeyId;
                        receipt.push(temp);
                        var PayuId = [];
                        PayuId.push(data.transactionid);
                        var date = new Date();
                        var matchObj = {
                            $set: {
                                receiptId: receipt,
                                amountToPay: found.accounts.outstandingAmount,
                                amountPaid: found.accounts.outstandingAmount,
                                outstandingAmount: 0,
                                paymentStatus: "Paid",
                                PayuId: PayuId,
                                dateOfTransaction: date,
                            }
                        };
                        Transaction.update({
                            _id: transactData._id
                        }, matchObj).exec(
                            function (err, data3) {
                                if (err || _.isEmpty(data3)) {
                                    callback(null, {
                                        error: "no data found",
                                        data: transactData
                                    });
                                } else {
                                    callback(null, transactData);
                                }
                            });
                    }
                },
                function (transactData, callback) {
                    console.log("transactData--------", transactData);
                    if (transactData.error) {
                        callback(null, transactData);
                    } else {
                        var receipt = [];
                        var temp = "SFA-UP-" + transactData.receiptKeyId;
                        receipt.push(temp);
                        var receiptId = _.concat(found.accounts.receiptId, receipt);
                        var payu = [];
                        payu.push(data.transactionid);
                        var PayuId = _.concat(found.accounts.PayuId, payu);
                        if (transactData.athlete != undefined) {
                            var matchObj = {
                                $set: {
                                    // transaction: transaction,
                                    PayuId: PayuId,
                                    receiptId: receiptId,
                                    totalPaid: found.accounts.outstandingAmount,
                                    totalToPay: found.accounts.outstandingAmount,
                                    outstandingAmount: 0,
                                    upgradePaymentStatus: "Paid",
                                    // upgrade: false,

                                }
                            };
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

                        } else {
                            var matchObj = {
                                $set: {
                                    // transaction: transaction,
                                    PayuId: PayuId,
                                    receiptId: receiptId,
                                    upgradePaymentStatus: "Paid",
                                    totalPaid: found.accounts.outstandingAmount,
                                    totalToPay: found.accounts.outstandingAmount,
                                    outstandingAmount: 0,
                                    // upgrade: false,
                                }
                            };
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
                },
                function (transactData, callback) {
                    if (data.athlete) {
                        var matchObj = {
                            $set: {
                                package: data.package
                            }
                        };
                        Athelete.update({
                            _id: transactData.athlete
                        }, matchObj).exec(
                            function (err, data3) {
                                if (err) {
                                    console.log(err);
                                    callback(err, null);
                                } else if (data3) {
                                    callback(null, data)
                                }
                            });
                    } else {
                        var matchObj = {
                            $set: {
                                package: data.package
                            }
                        };
                        Registration.update({
                            _id: transactData.school
                        }, matchObj).exec(
                            function (err, data3) {
                                if (err) {
                                    console.log(err);
                                    callback(err, null);
                                } else if (data3) {
                                    callback(null, data)
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
    },

    deleteUpdateTransaction: function (data, found, callback) {
        var len = found.accounts.transaction.length;
        len--;
        async.waterfall([
            function (callback) {
                Transaction.findOne({
                    _id: found.accounts.transaction[len]
                }).exec(function (err, transactData) {
                    if (err || _.isEmpty(transactData)) {
                        callback(null, {
                            error: "no data found",
                            data: found
                        });
                    } else {
                        found.accounts.amountPaid = found.accounts.amountPaid + transactData.amountPaid;
                        if (transactData.amountPaid <= found.accounts.outstandingAmount) {
                            found.accounts.outstandingAmount = found.accounts.outstandingAmount - transactData.amountPaid;
                        } else {
                            found.accounts.outstandingAmount = 0;
                        }
                        var matchObj = {
                            $set: {
                                outstandingAmount: found.accounts.outstandingAmount,
                                amountPaid: found.accounts.amountPaid
                            }
                        };
                        Accounts.update({
                            _id: found.accounts._id
                        }, matchObj).exec(
                            function (err, data3) {
                                if (err) {
                                    callback(null, {
                                        error: "accounts not updated",
                                        data: transactData
                                    });
                                } else if (data3) {
                                    callback(null, transactData);
                                }
                            });
                    }
                });
            },
            function (transactData, callback) {
                if (transactData.error) {
                    callback(null, transactData);
                } else {
                    Transaction.remove({
                        _id: found.accounts.transaction[len]
                    }).exec(function (err, transactData) {
                        if (err || _.isEmpty(transactData)) {
                            callback(null, {
                                error: "no data found",
                                data: found
                            });
                        } else {
                            callback(null, transactData);
                        }
                    });
                }
            },
            function (transactData, callback) {
                if (transactData.error) {
                    callback(null, transactData);
                } else {
                    len--;
                    Transaction.findOne({
                        _id: found.accounts.transaction[len]
                    }).exec(function (err, transactData) {
                        if (err || _.isEmpty(transactData)) {
                            callback(null, {
                                error: "no data found",
                                data: found
                            });
                        } else {
                            callback(null, transactData);
                        }
                    });
                }
            }
        ], function (err, complete) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, complete);
            }
        })

    },

    saveCashTransaction: function (data, callback) {
        var finaloutstanding = 0;
        var paymentStatusFinal;
        var paymentModeFinal
        var finalPay = 0;
        data.transaction = [];
        data.receipt = [];
        data.checkNo = [];
        async.waterfall([
                function (callback) {
                    var len = data.transactions.length;
                    len--;
                    paymentStatusFinal = data.transactions[len].paymentStatus;
                    paymentModeFinal = data.transactions[len].paymentMode;
                    async.each(data.transactions, function (n, callback) {
                            if (data.athleteId) {
                                Transaction.findOne({
                                    athlete: data.athleteId,
                                    package: n.package._id
                                }).lean().exec(function (err, foundTransact) {
                                    if (err || _.isEmpty(foundTransact)) {
                                        callback(null, {
                                            error: "data not found",
                                            data: data
                                        });
                                    } else {
                                        if (n.amountPaid < foundTransact.outstandingAmount) {
                                            var outstanding = foundTransact.outstandingAmount - n.amountPaid;
                                        } else {
                                            var outstanding = 0;
                                        }
                                        if (data.transactions[len].package._id.toString() === foundTransact.package.toString()) {
                                            finaloutstanding = finaloutstanding + outstanding;
                                        }
                                        finalPay = finalPay + n.amountPaid;
                                        console.log("outstanding", outstanding, "data.outstanding", data.outstanding);
                                        var receipt = n.receiptId;
                                        var mainReceipt = _.concat(data.receipt,  receipt);
                                        data.receipt = _.uniq(mainReceipt);
                                        if (n.checkNo) {
                                            var checkNo = n.checkNo;
                                            var mainCheckNo = _.concat(data.checkNo, checkNo);
                                            data.checkNo = _.uniq(mainCheckNo);
                                        } else {
                                            var checkNo = [];
                                        }
                                        var matchObj = {
                                            $set: {
                                                dateOfTransaction: n.dateOfTransaction,
                                                discount: data.discount,
                                                amountPaid: n.amountPaid,
                                                receiptId: receipt,
                                                amountToPay: foundTransact.outstandingAmount,
                                                checkNo: checkNo,
                                                paymentMode: n.paymentMode,
                                                cgstAmount: data.cgst,
                                                sgstAmount: data.sgst,
                                                outstandingAmount: outstanding,
                                                paymentStatus: n.paymentStatus,
                                            }
                                        };
                                        Transaction.update({
                                            _id: foundTransact._id
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
                                    package: n.package._id
                                }).lean().exec(function (err, foundTransact) {
                                    if (err || _.isEmpty(foundTransact)) {
                                        callback(null, {
                                            error: "data not found",
                                            data: data
                                        });
                                    } else {
                                        console.log("package", data.transactions[len].package._id, "package", foundTransact.package);
                                        if (n.amountPaid < foundTransact.outstandingAmount) {
                                            var outstanding = foundTransact.outstandingAmount - n.amountPaid;
                                        } else {
                                            var outstanding = 0;
                                        }
                                        if (data.transactions[len].package._id.toString() === foundTransact.package.toString()) {
                                            console.log("inside");
                                            finaloutstanding = finaloutstanding + outstanding;
                                        }
                                        finalPay = finalPay + n.amountPaid;
                                        var receipt = n.receiptId;
                                        var mainReceipt = _.concat(data.receipt,  receipt);
                                        data.receipt = _.uniq(mainReceipt);
                                        if (n.checkNo) {
                                            var checkNo = n.checkNo;
                                            var mainCheckNo = _.concat(data.checkNo, checkNo);
                                            data.checkNo = _.uniq(mainCheckNo);
                                        } else {
                                            var checkNo = [];
                                        }
                                        var matchObj = {
                                            $set: {
                                                dateOfTransaction: n.dateOfTransaction,
                                                discount: data.discount,
                                                receiptId: receipt,
                                                checkNo: checkNo,
                                                amountToPay: n.amountPaid,
                                                amountPaid: n.amountPaid,
                                                paymentMode: n.paymentMode,
                                                cgstAmount: data.cgst,
                                                sgstAmount: data.sgst,
                                                outstandingAmount: outstanding,
                                                paymentStatus: n.paymentStatus,
                                            }
                                        };
                                        Transaction.update({
                                            _id: foundTransact._id
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
                        },
                        function (err) {
                            callback(null, data);
                        });
                },
                function (data, callback) {
                    if (data.error) {
                        callback(null, data);
                    } else {
                        if (data.athleteId) {
                            Accounts.findOne({
                                athlete: data.athleteId
                            }).lean().exec(function (err, accountsData) {
                                if (err || _.isEmpty(accountsData)) {
                                    callback(null, data);
                                } else {
                                    // var finalPaid = accountsData.totalPaid + (accountsData.outstandingAmount - finaloutstanding);
                                    var transactionFinal = _.concat(accountsData.transaction, data.transaction);
                                    var matchObj = {
                                        $set: {
                                            transaction: transactionFinal,
                                            totalToPay: finalPay,
                                            totalPaid: finalPay,
                                            discount: data.discount,
                                            receiptId: data.receipt,
                                            checkNo: data.checkNo,
                                            paymentMode: paymentModeFinal,
                                            checkNo: data.checkNo,
                                            cgst: data.cgst,
                                            sgst: data.sgst,
                                            remarks: data.remarks,
                                            outstandingAmount: finaloutstanding,
                                            // upgrade: false,

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
                                if (err || _.isEmpty(accountsData)) {
                                    callback(null, data);
                                } else {
                                    // var finalPaid = accountsData.totalPaid + (accountsData.outstandingAmount - finaloutstanding);
                                    var transactionFinal = _.concat(accountsData.transaction, data.transaction);
                                    var matchObj = {
                                        $set: {
                                            transaction: transactionFinal,
                                            totalToPay: finalPay,
                                            totalPaid: finalPay,
                                            discount: data.discount,
                                            receiptId: data.receipt,
                                            paymentMode: paymentModeFinal,
                                            checkNo: data.checkNo,
                                            cgst: data.cgst,
                                            sgst: data.sgst,
                                            remarks: data.remarks,
                                            outstandingAmount: finaloutstanding,
                                            // upgrade: false,
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
                },
                function (accountsData, callback) {
                    if (data.athleteId) {
                        var matchObj = {
                            $set: {
                                paymentStatus: paymentStatusFinal,
                                registrationFee: paymentModeFinal
                            }
                        };
                        Athelete.update({
                            _id: data.athleteId
                        }, matchObj).exec(
                            function (err, data3) {
                                if (err) {
                                    console.log(err);
                                    callback(err, null);
                                } else if (data3) {
                                    callback(null, data3)
                                }
                            });
                    } else {
                        var matchObj = {
                            $set: {
                                paymentStatus: paymentStatusFinal,
                                registrationFee: paymentModeFinal
                            }
                        };
                        Registration.update({
                            _id: data.school
                        }, matchObj).exec(
                            function (err, data3) {
                                if (err) {
                                    console.log(err);
                                    callback(err, null);
                                } else if (data3) {
                                    callback(null, data3)
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
    },

};
module.exports = _.assign(module.exports, exports, model);