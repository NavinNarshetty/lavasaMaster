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
    amountPaid: String,
    paymentMode: String,
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('Transaction', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {

    saveTransactionOnline: function (data, callback) {
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
                    param.dateOfTransaction = new date();
                    param.package = data.package._id;
                    param.amountPaid = data.package.finalPrice;
                    param.paymentMode = "onlinePayu";
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
                        Accounts.findOne({
                            athlete: transactData.athlete
                        }).lean().exec(function (err, accountsData) {
                            if (err) {
                                callback(err, null);
                            } else if (_.isEmpty(accountsData)) {
                                transaction.push(transactData._id);
                                var matchObj = {
                                    $set: {
                                        athlete: transactData.athlete,
                                        transaction: transaction,
                                        totalToPay: transactData.amountPaid,
                                        totalPaid: 0,
                                        outstandingAmount: 0,
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
                                _.each(accountsData.transaction, function (n) {
                                    transaction.push(n);
                                });
                                transaction.push(transactData._id);
                                var matchObj = {
                                    $set: {
                                        athlete: transactData.athlete,
                                        transaction: transaction,
                                        amount: transactData.amountPai,
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
                            }
                        });
                    } else {
                        Accounts.findOne({
                            school: transactData.school
                        }).lean().exec(function (err, accountsData) {
                            if (err) {
                                callback(err, null);
                            } else if (_.isEmpty(accountsData)) {
                                var param = {};
                                param.school = transactData.school;
                                param.transaction = transactData._id;
                                param.amonnt = transactData.amountPaid;
                                param.paymentMode = transactData.paymentMode;
                            } else {

                            }
                        });
                    }

                },
                function (transactData, callback) {
                    var matchObj = {
                        $set: {
                            // transacti
                        }
                    }
                    Accounts.update({
                        athlete: transactData.athlete
                    }, matchObj).exec(
                        function (err, data3) {
                            if (err) {
                                console.log(err);
                                callback(err, null);
                            } else if (data3) {}
                        });
                }
            ],
            function (err, complete) {
                if (err) {
                    callback(err, null);
                } else {
                    callback(null, complete);
                }
            })
    }

};
module.exports = _.assign(module.exports, exports, model);