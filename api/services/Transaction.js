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
    amountToPay: String,
    amountPaid: String,
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
        package: ''
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
        async.waterfall([
                function (callback) {
                    var param = {};
                    if (data.athlete) {
                        param.athlete = found._id;
                        param.school = undefined;
                    } else {
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
                    param.PayuId = data.transactionid;
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

                        var matchObj = {
                            $set: {
                                receiptId: receipt,
                                amountToPay: found.accounts.outstandingAmount,
                                amountPaid: found.accounts.outstandingAmount,
                                outstandingAmount: 0,
                                paymentStatus: "paid",
                                PayuId: PayuId,
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
                                    upgradePaymentStatus: "paid",

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
                                    upgradePaymentStatus: "paid",
                                    totalPaid: found.accounts.outstandingAmount,
                                    totalToPay: found.accounts.outstandingAmount,
                                    outstandingAmount: 0
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
        data.checkNo = [];
        async.waterfall([
                function (callback) {
                    async.each(data.transactions, function (n, callback) {
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
                                    param.dateOfTransaction = n.dateOfTransaction;
                                    param.package = n.package._id;
                                    param.amountToPay = n.package.amount;
                                    param.amountPaid = n.package.amount;
                                    param.paymentMode = data.paymentMode;
                                    if (data.cgst) {
                                        param.cgstAmount = data.cgst;
                                    }
                                    if (data.sgst) {
                                        param.sgstAmount = data.sgst;
                                    }
                                    if (data.discount) {
                                        param.discount = data.discount;
                                    }
                                    // var recepit = n.receiptId.split(",");
                                    // param.receiptId = recepit;
                                    param.receiptId = n.receiptId;
                                    var mainReceipt = _.concat(data.receipt, param.receiptId);
                                    data.receipt = _.uniq(mainReceipt);
                                    if (n.checkNo) {
                                        // var checkNo = n.checkNo.split(",");
                                        // param.checkNo = checkNo;
                                        param.checkNo = n.checkNo;
                                        var mainCheckNo = _.concat(data.checkNo, param.checkNo);
                                        data.checkNo = _.uniq(mainCheckNo);
                                    } else {
                                        var checkNo = [];
                                    }
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
                                    // if (n.isDelete == true) {
                                    //     Transaction.remove({
                                    //         _id: n._id
                                    //     }).exec(
                                    //         function (err, data3) {
                                    //             if (err) {
                                    //                 callback(err, null);
                                    //             } else if (data3) {
                                    //                 callback(null, data);
                                    //             }
                                    //         });
                                    // } else {
                                    // var receipt = n.receiptId.split(",");
                                    var receipt = n.receiptId;
                                    var mainReceipt = _.concat(data.receipt,  receipt);
                                    data.receipt = _.uniq(mainReceipt);
                                    if (n.checkNo) {
                                        // var checkNo = n.checkNo.split(",");
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
                                            amountPaid: n.package.amount,
                                            receiptId: receipt,
                                            amountToPay: n.package.amount,
                                            checkNo: checkNo,
                                            paymentMode: data.paymentMode,
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

                                // }
                            });
                        } else {
                            console.log(data, "school data");
                            Transaction.findOne({
                                school: data.school,
                                package: n.package._id
                            }).lean().exec(function (err, foundTransact) {
                                if (err) {
                                    callback(err, null);
                                } else if (_.isEmpty(foundTransact)) {
                                    var param = {};
                                    param.school = data.school;
                                    param.athlete = undefined;
                                    param.dateOfTransaction = n.dateOfTransaction;
                                    param.package = n.package._id;
                                    param.amountToPay = n.package.amount;
                                    param.amountPaid = n.package.amount;
                                    param.paymentMode = data.paymentMode;
                                    if (data.cgst) {
                                        console.log("in cgst");
                                        param.cgstAmount = data.cgst;
                                    }
                                    if (data.sgst) {
                                        console.log("in sgst");
                                        param.sgstAmount = data.sgst;
                                    }
                                    if (data.discount) {
                                        param.discount = data.discount;
                                    }
                                    // var receipt = n.receiptId.split(",");
                                    var receipt = n.receiptId;
                                    param.receiptId = receipt;
                                    var mainReceipt = _.concat(data.receipt, receipt);
                                    data.receipt = _.uniq(mainReceipt);
                                    if (n.checkNo) {
                                        // var checkNo = n.checkNo.split(",");
                                        var checkNo = n.checkNo;
                                        param.checkNo = n.checkNo;
                                        var mainCheckNo = _.concat(data.checkNo, checkNo);
                                        data.checkNo = _.uniq(mainCheckNo);
                                    } else {
                                        var checkNo = [];
                                    }

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
                                    // var receipt = n.receiptId.split(",");
                                    var receipt = n.receiptId;
                                    var mainReceipt = _.concat(data.receipt,  receipt);
                                    data.receipt = _.uniq(mainReceipt);
                                    if (n.checkNo) {
                                        // var checkNo = n.checkNo.split(",");
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
                                            amountToPay: n.package.amount,
                                            amountPaid: n.package.amount,
                                            paymentMode: data.paymentMode,
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
                                param.totalPaid = data.netTotal;
                                param.paymentMode = data.paymentMode;
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
                                param.checkNo = data.checkNo;
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
                                // if (data.transactions.length >= accountsData.transaction) {
                                var transactionFinal = _.concat(accountsData.transaction, data.transaction);
                                // } else {
                                //     _.each(data.transactions, function (n) {
                                //         var transactionFinal = [];
                                //         // data.receipt=[];
                                //         transactionFinal.push(n._id);
                                //     });
                                // }
                                //    if(accounts)
                                var matchObj = {
                                    $set: {
                                        transaction: transactionFinal,
                                        totalToPay: data.netTotal,
                                        totalPaid: data.netTotal,
                                        discount: data.discount,
                                        receiptId: data.receipt,
                                        checkNo: data.checkNo,
                                        paymentMode: data.paymentMode,
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
                                param.totalPaid = data.netTotal;
                                param.paymentMode = data.paymentMode;
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
                                param.checkNo = data.checkNo;
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
                                        totalPaid: data.netTotal,
                                        discount: data.discount,
                                        receiptId: data.receipt,
                                        paymentMode: data.paymentMode,
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