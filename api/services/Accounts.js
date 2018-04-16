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
    upgrade: Boolean,
    upgradePaymentStatus: String,
    refundAmount: {
        type: Number,
        default: 0
    },

});

schema.plugin(deepPopulate, {
    populate: {
        "athlete": {
            select: '_id sfaId status year registrationFee firstName middleName surname school paymentStatus package atheleteSchoolName transactionID'
        },
        "athlete.school": {
            select: ''
        },
        "school": {
            select: '_id schoolName schoolType schoolCategory year paymentStatus status sfaID package'
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
        if (data.keyword == "") {
            var matchObj = {
                athlete: {
                    $exists: true
                }
            };
            var Search = Model.find(matchObj)
                .order(options)
                .deepPopulate("athlete athlete.school transaction")
                .keyword(options)
                .page(options, callback);
        } else {
            Accounts.aggregate(
                [{
                        $lookup: {
                            "from": "atheletes",
                            "localField": "athlete",
                            "foreignField": "_id",
                            "as": "athlete"
                        }
                    },
                    // Stage 2
                    {
                        $unwind: {
                            path: "$athlete",
                        }
                    },
                    // Stage 3
                    {
                        $match: {

                            $or: [{
                                "athlete.firstName": {
                                    $regex: data.keyword,
                                    $options: "i"
                                }
                            }, {
                                "athlete.middleName": {
                                    $regex: data.keyword,
                                    $options: "i"
                                }
                            }, {
                                "athlete.surname": {
                                    $regex: data.keyword,
                                    $options: "i"
                                }
                            }, {
                                "athlete.sfaId": {
                                    $regex: data.keyword,
                                    $options: "i"
                                }
                            }]

                        }
                    },
                    {
                        $sort: {
                            "createdAt": -1

                        }
                    }, {
                        $skip: options.start
                    },
                    {
                        $limit: options.count
                    }
                ],
                function (err, returnReq) {
                    console.log("returnReq : ", returnReq);
                    if (err) {
                        console.log(err);
                        callback(null, err);
                    } else {
                        if (_.isEmpty(returnReq)) {
                            var count = returnReq.length;
                            console.log("count", count);

                            var data = {};
                            data.options = options;

                            data.results = returnReq;
                            data.total = count;
                            callback(null, data);
                        } else {
                            var count = returnReq.length;
                            console.log("count", count);

                            var data = {};
                            data.options = options;

                            data.results = returnReq;
                            data.total = count;
                            callback(null, data);

                        }
                    }
                });

        }
    },

    getSchoolAccount: function (data, callback) {

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
        if (data.keyword == "") {
            var matchObj = {
                school: {
                    $exists: true
                }
            };

            var Search = Model.find(matchObj)
                .order(options)
                .deepPopulate("school transaction")
                .keyword(options)
                .page(options, callback);
        } else {
            Accounts.aggregate(
                [{
                        $lookup: {
                            "from": "registrations",
                            "localField": "school",
                            "foreignField": "_id",
                            "as": "school"
                        }
                    },
                    // Stage 2
                    {
                        $unwind: {
                            path: "$school",
                        }
                    },
                    // Stage 3
                    {
                        $match: {
                            $or: [{
                                "school.schoolName": {
                                    $regex: data.keyword,
                                    $options: "i"
                                }
                            }, {
                                "school.sfaID": {
                                    $regex: data.keyword,
                                    $options: "i"
                                }
                            }]
                        }
                    },
                    {
                        $sort: {
                            "createdAt": -1
                        }
                    },
                    {
                        $skip: options.start
                    },
                    {
                        $limit: options.count
                    }
                ],
                function (err, returnReq) {
                    console.log("returnReq : ", returnReq);
                    if (err) {
                        console.log(err);
                        callback(null, err);
                    } else {
                        if (_.isEmpty(returnReq)) {
                            var count = returnReq.length;
                            console.log("count", count);

                            var data = {};
                            data.options = options;

                            data.results = returnReq;
                            data.total = count;
                            callback(null, data);
                        } else {
                            var count = returnReq.length;
                            console.log("count", count);

                            var data = {};
                            data.options = options;

                            data.results = returnReq;
                            data.total = count;
                            callback(null, data);

                        }
                    }
                });
        }
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
                    found.display.igst = found.igst;
                    found.display.sgst = found.sgst;
                    found.display.cgst = found.cgst;
                    found.display.refundAmount = found.refundAmount;
                    found.display.discount = found.discount;
                    found.display.receiptId = found.receiptId;
                    if (found.remarks) {
                        found.display.remarks = found.remarks;
                    }
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
                        found.display["package" + i] = {};
                        found.display["package" + i].name = n.package.name;
                        found.display["package" + i].date = n.createdAt;
                        found.display["package" + i].dateOfTransaction = n.dateOfTransaction;
                        found.display["package" + i].user = n.package.packageUser;
                        found.display["package" + i].amount = n.package.finalPrice;
                        i++;
                    });

                    callback(null, found);
                }
            });
    },

    getStatus: function (data, callback) {
        Accounts.findOne({
            $or: [{
                athlete: data._id
            }, {
                school: data._id
            }]
        }, 'outstandingAmount upgradePaymentStatus totalPaid totalToPay igst cgst sgst athlete school transaction').lean().deepPopulate("athlete school transaction").exec(
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

    upgradeAccount1: function (data, callback) {
        if (data.athlete) {
            Accounts.findOne({
                athlete: data.athlete
            }).lean().exec(function (err, accountsData) {
                if (err) {
                    callback(err, null);
                } else if (_.isEmpty(accountsData)) {
                    callback(null, accountsData);
                } else {

                    var matchObj = {
                        $set: {
                            sgst: data.sgstAmt,
                            cgst: data.cgstAmt,
                            igst: data.igstAmt,
                            discount: data.discount,
                            outstandingAmount: data.amountPaid,
                            upgradePackage: data.package
                        }
                    };
                    Accounts.update({
                        athlete: data.athlete
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
            Accounts.findOne({
                school: data.school
            }).lean().exec(function (err, accountsData) {
                if (err) {
                    callback(err, null);
                } else if (_.isEmpty(accountsData)) {
                    var matchObj = {
                        $set: {
                            sgst: data.sgstAmt,
                            cgst: data.cgstAmt,
                            igst: data.igstAmt,
                            discount: data.discount,
                            outstandingAmount: data.amountPaid,
                            upgradePackage: data.package
                        }
                    };
                    Accounts.update({
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
    },

    upgradeAccount: function (data, callback) {
        // console.log("data", data);
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
                    param.package = data.package;
                    param.outstandingAmount = data.amountPaid;
                    param.paymentMode = data.registrationFee;
                    param.cgstAmount = data.cgstAmt;
                    param.sgstAmount = data.sgstAmt;
                    param.igstAmount = data.igstAmt;
                    param.paymentStatus = "Pending";
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
                    console.log("transactData", transactData, "data", data);
                    if (data.athlete) {
                        Accounts.findOne({
                            athlete: data.athlete
                        }).lean().exec(function (err, accountsData) {
                            if (err) {
                                callback(err, null);
                            } else if (_.isEmpty(accountsData)) {
                                callback(null, accountsData);
                            } else {
                                var check = false;
                                _.each(accountsData.transaction, function (n) {
                                    if (n.equals(transactData._id)) {
                                        check = true;
                                    }
                                })
                                var transaction = [];
                                if (check == false) {
                                    transaction.push(transactData._id);
                                }
                                transaction = _.concat(accountsData.transaction, transaction);
                                var matchObj = {
                                    $set: {
                                        sgst: data.sgstAmt,
                                        cgst: data.cgstAmt,
                                        igst: data.igstAmt,
                                        outstandingAmount: data.amountPaid,
                                        transaction: transaction,
                                        upgradePaymentStatus: "Pending",
                                        upgrade: true
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
                        console.log("inside");
                        Accounts.findOne({
                            school: transactData.school
                        }).lean().exec(function (err, accountsData) {
                            if (err || _.isEmpty(accountsData)) {
                                callback(null, {
                                    error: "no data",
                                    data: transactData
                                });
                            } else {
                                var check = false;
                                _.each(accountsData.transaction, function (n) {
                                    if (n.equals(transactData._id)) {
                                        check = true;
                                    }
                                })
                                var transaction = [];
                                if (check == false) {
                                    transaction.push(transactData._id);
                                }
                                transaction = _.concat(transaction, accountsData.transaction);

                                var matchObj = {
                                    $set: {
                                        sgst: data.sgstAmt,
                                        cgst: data.cgstAmt,
                                        igst: data.igstAmt,
                                        outstandingAmount: data.amountPaid,
                                        transaction: transaction,
                                        upgradePaymentStatus: "Pending",
                                        upgrade: true
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
                function (accountsData, callback) {
                    if (accountsData.error) {
                        callback(null, accountsData);
                    } else {
                        if (data.athlete) {
                            var matchObj = {
                                $set: {
                                    package: data.package
                                }
                            };
                            Athelete.update({
                                _id: data.athlete
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
                                _id: data.school
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
                },
                function (data, callback) {
                    if (data.athlete) {
                        var found = {};
                        found._id = data.athlete;
                        Accounts.updateAthleteMailAndSms(found, function (err, mailData) {
                            if (err) {
                                callback(err, null);
                            } else {
                                callback(null, mailData);
                            }
                        });
                    } else {
                        found._id = data.school;
                        Accounts.updateScoolMailAndSms(found, function (err, mailData) {
                            if (err) {
                                callback(err, null);
                            } else {
                                callback(null, mailData);
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

    updateAthletePaymentStatusOld: function (data, callback) {
        async.waterfall([
                function (callback) {
                    Athelete.findOne({ //finds one with refrence to id
                        firstName: data.firstName,
                        surname: data.surname,
                        email: data.email,
                    }).lean().exec(function (err, found) {
                        if (err) {
                            callback(err, null);
                        } else if (_.isEmpty(found)) {
                            console.log("empty in Athelete found");
                            callback(null, "Data is empty");
                        } else {
                            async.waterfall([
                                    function (callback) {
                                        Accounts.findOne({
                                            athlete: found._id
                                        }).lean().exec(function (err, accountsData) {
                                            if (err || _.isEmpty(accountsData)) {
                                                callback(null, {
                                                    error: "no data found",
                                                    data: found
                                                });
                                            } else {
                                                found.accounts = accountsData;
                                                callback(null, found);
                                            }
                                        });
                                    },
                                    function (found, callback) {
                                        data.athlete = true;
                                        Transaction.saveUpdateTransaction(data, found, function (err, vData) {
                                            if (err || _.isEmpty(vData)) {
                                                callback(null, {
                                                    error: "no data found",
                                                    data: found
                                                });
                                            } else {
                                                console.log("vData", vData.package);
                                                found.packageNew = vData.package;
                                                callback(null, found);
                                            }
                                        });
                                    },
                                ],
                                function (err, complete) {
                                    if (err) {
                                        callback(err, callback);
                                    } else {
                                        callback(null, complete);
                                    }
                                });
                        }
                    });
                },
                function (found, callback) {
                    if (found.error) {
                        callback(null, found);
                    } else {
                        console.log("found in update", found);

                        var matchObj = {
                            $set: {
                                package: found.packageNew
                            }
                        };
                        Athelete.update({
                            _id: found._id
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
                },
            ],
            function (err, data2) {
                if (err) {
                    console.log(err);
                    callback(err, null);
                } else {
                    callback(null, data2);
                }

            });
    },

    updateSchoolPaymentStatusOld: function (data, callback) {
        async.waterfall([
                function (callback) {
                    ConfigProperty.find().lean().exec(function (err, property) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(property)) {
                                callback(null, []);
                            } else {
                                callback(null, property);
                            }
                        }
                    });
                },
                function (property, callback) {
                    console.log("inside update", data);
                    Registration.findOne({ //finds one with refrence to id
                        schoolName: data.schoolName
                    }).exec(function (err, found) {
                        if (err) {
                            callback(err, null);
                        } else if (_.isEmpty(found)) {
                            callback(null, "Data is empty");
                        } else {
                            async.waterfall([
                                    function (callback) {
                                        Accounts.findOne({
                                            school: found._id
                                        }).lean().exec(function (err, accountsData) {
                                            if (err || _.isEmpty(accountsData)) {
                                                callback(null, {
                                                    error: "no data found",
                                                    data: found
                                                });
                                            } else {
                                                found.accounts = accountsData;
                                                callback(null, found);
                                            }
                                        });
                                    },
                                    function (found, callback) {
                                        data.school = true;
                                        Transaction.saveUpdateTransaction(data, found, function (err, vData) {
                                            if (err || _.isEmpty(vData)) {
                                                callback(null, {
                                                    error: "no data found",
                                                    data: found
                                                });
                                            } else {
                                                found.packageNew = vData.package;
                                                callback(null, found);
                                            }
                                        });
                                    },
                                    function (found, callback) {
                                        if (found.error) {
                                            callback(null, found);
                                        } else {
                                            var matchObj = {
                                                $set: {
                                                    package: found.packageNew
                                                }
                                            };
                                            console.log("found in update", found);
                                            Registration.update({
                                                _id: found._id
                                            }, matchObj).exec(
                                                function (err, data3) {
                                                    callback(err, data3);
                                                    if (err) {
                                                        callback(err, null);
                                                    } else {
                                                        callback(null, data3);
                                                    }
                                                });
                                        }
                                    }
                                ],
                                function (err, complete) {
                                    if (err) {
                                        callback(err, callback);
                                    } else {
                                        callback(null, complete);
                                    }
                                });

                        }
                    });
                }
            ],
            function (err, data2) {
                if (err) {
                    console.log(err);
                    callback(err, null);
                } else {
                    callback(null, data2);
                }

            });
    },

    updateAthletePaymentStatus: function (data, callback) {
        async.waterfall([
                function (callback) {
                    Athelete.findOne({ //finds one with refrence to id
                        firstName: data.firstName,
                        surname: data.surname,
                        email: data.email,
                    }).lean().exec(function (err, found) {
                        if (err) {
                            callback(err, null);
                        } else if (_.isEmpty(found)) {
                            console.log("empty in Athelete found");
                            callback(null, "Data is empty");
                        } else {
                            async.waterfall([
                                    function (callback) {
                                        Accounts.findOne({
                                            athlete: found._id
                                        }).lean().exec(function (err, accountsData) {
                                            if (err || _.isEmpty(accountsData)) {
                                                callback(null, {
                                                    error: "no data found",
                                                    data: found
                                                });
                                            } else {
                                                found.accounts = accountsData;
                                                callback(null, found);
                                            }
                                        });
                                    },
                                    function (found, callback) {
                                        data.athlete = true;
                                        Transaction.saveUpdateTransaction(data, found, function (err, vData) {
                                            if (err || _.isEmpty(vData)) {
                                                callback(null, {
                                                    error: "no data found",
                                                    data: found
                                                });
                                            } else {
                                                console.log("vData", vData.package);
                                                found.packageNew = vData.package;
                                                callback(null, found);
                                            }
                                        });
                                    },
                                ],
                                function (err, complete) {
                                    if (err) {
                                        callback(err, callback);
                                    } else {
                                        callback(null, complete);
                                    }
                                });
                        }
                    });
                },
                function (found, callback) {
                    if (found.error) {
                        callback(null, found);
                    } else {
                        console.log("found in update", found);

                        var matchObj = {
                            $set: {
                                package: found.packageNew
                            }
                        };
                        Athelete.update({
                            _id: found._id
                        }, matchObj).exec(
                            function (err, data3) {
                                if (err) {
                                    console.log(err);
                                    callback(err, null);
                                } else if (data3) {
                                    callback(null, found);
                                }
                            });
                    }
                },
                function (found, callback) {
                    Accounts.updateAthleteMailAndSms(found, function (err, mailData) {
                        if (err) {
                            callback(err, null);
                        } else {
                            callback(null, found);
                        }
                    });
                },
                function (found, callback) {
                    Accounts.upgradeInvoiceAthlete(found, function (err, mailData) {
                        if (err) {
                            callback(err, null);
                        } else {
                            callback(null, mailData);
                        }
                    });
                }
            ],
            function (err, data2) {
                if (err) {
                    console.log(err);
                    callback(err, null);
                } else {
                    callback(null, data2);
                }

            });
    },

    updateSchoolPaymentStatus: function (data, callback) {
        async.waterfall([
                function (callback) {
                    ConfigProperty.find().lean().exec(function (err, property) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(property)) {
                                callback(null, []);
                            } else {
                                callback(null, property);
                            }
                        }
                    });
                },
                function (property, callback) {
                    console.log("inside update", data);
                    Registration.findOne({ //finds one with refrence to id
                        schoolName: data.schoolName
                    }).exec(function (err, found) {
                        if (err) {
                            callback(err, null);
                        } else if (_.isEmpty(found)) {
                            callback(null, "Data is empty");
                        } else {
                            async.waterfall([
                                    function (callback) {
                                        Accounts.findOne({
                                            school: found._id
                                        }).lean().exec(function (err, accountsData) {
                                            if (err || _.isEmpty(accountsData)) {
                                                callback(null, {
                                                    error: "no data found",
                                                    data: found
                                                });
                                            } else {
                                                found.accounts = accountsData;
                                                callback(null, found);
                                            }
                                        });
                                    },
                                    function (found, callback) {
                                        data.school = true;
                                        Transaction.saveUpdateTransaction(data, found, function (err, vData) {
                                            if (err || _.isEmpty(vData)) {
                                                callback(null, {
                                                    error: "no data found",
                                                    data: found
                                                });
                                            } else {
                                                found.packageNew = vData.package;
                                                callback(null, found);
                                            }
                                        });
                                    },
                                    function (found, callback) {
                                        if (found.error) {
                                            callback(null, found);
                                        } else {
                                            var matchObj = {
                                                $set: {
                                                    package: found.packageNew
                                                }
                                            };
                                            console.log("found in update", found);
                                            Registration.update({
                                                _id: found._id
                                            }, matchObj).exec(
                                                function (err, data3) {
                                                    callback(err, data3);
                                                    if (err) {
                                                        callback(err, null);
                                                    } else {
                                                        callback(null, found);
                                                    }
                                                });
                                        }
                                    },
                                    function (found, callback) {
                                        Accounts.updateSchoolMailAndSms(found, function (err, mailData) {
                                            if (err) {
                                                callback(err, null);
                                            } else {
                                                callback(null, mailData);
                                            }
                                        });
                                    }
                                ],
                                function (err, complete) {
                                    if (err) {
                                        callback(err, callback);
                                    } else {
                                        callback(null, complete);
                                    }
                                });
                        }
                    });
                }
            ],
            function (err, data2) {
                if (err) {
                    console.log(err);
                    callback(err, null);
                } else {
                    callback(null, data2);
                }

            });
    },

    generateAthleteExcel: function (data, res) {
        async.waterfall([
                function (callback) {
                    Accounts.find({
                            athlete: {
                                $exists: true
                            }
                        }).lean().sort({
                            createdAt: -1
                        })
                        .deepPopulate("athlete athlete.school athlete.package transaction transaction.package")
                        .exec(function (err, found) {
                            if (err || _.isEmpty(found)) {
                                callback(null, {
                                    error: "no data found",
                                    data: data
                                });
                            } else {
                                callback(null, found);
                            }
                        });
                },
                function (found, callback) {
                    async.concatSeries(found, function (mainData, callback) {
                            var obj = {};
                            var currentPackName;
                            var packPrice;
                            var cgstPercent;
                            var sgstPercent;
                            var igstPercent;
                            var finalPrice = 0;
                            if (mainData.athlete) {
                                if (mainData.athlete.sfaId) {
                                    obj["SFA ID"] = mainData.athlete.sfaId;
                                } else {
                                    obj["SFA ID"] = " ";
                                }
                                if (mainData.athlete.middleName) {
                                    obj["ATHLETE NAME"] = mainData.athlete.firstName + " " + mainData.athlete.middleName + " " + mainData.athlete.surname;
                                } else {
                                    obj["ATHLETE NAME"] = mainData.athlete.firstName + " " + mainData.athlete.surname;
                                }
                                if (mainData.athlete.atheleteSchoolName) {
                                    obj["ATHLETE SCHOOL NAME"] = mainData.athlete.atheleteSchoolName;
                                } else if (mainData.athlete.school) {
                                    obj["ATHLETE SCHOOL NAME"] = mainData.athlete.school.name;
                                } else {
                                    obj["ATHLETE SCHOOL NAME"] = "";
                                }
                                currentPackName = mainData.athlete.package.name;
                                packPrice = mainData.athlete.package.finalPrice;
                                cgstPercent = mainData.athlete.package.cgstPercent;
                                sgstPercent = mainData.athlete.package.sgstPercent;
                                igstPercent = mainData.athlete.package.igstPercent;
                                finalPrice = mainData.athlete.package.finalPrice;

                            } else {
                                obj["SFA ID"] = " ";
                                obj["ATHLETE NAME"] = "";
                                obj["ATHLETE SCHOOL NAME"] = "";
                            }

                            var i = 0;
                            var paymentMode;
                            var payu;

                            _.each(mainData.transaction, function (n) {
                                if (i == 0) {
                                    obj["SELECTED PACKAGES"] = n.package.name;
                                    paymentMode = n.paymentMode;
                                    payu = n.PayuId;
                                } else {
                                    obj["SELECTED PACKAGES"] = obj["SELECTED PACKAGES"] + "," + n.package.name;
                                    paymentMode = paymentMode + "," + n.paymentMode;
                                    payu = payu + "," + n.PayuId
                                }

                                i++;
                            });

                            obj["CURRENT PACKAGE"] = currentPackName;
                            obj["CURRENT PACKAGE AMOUNT"] = finalPrice;
                            if (cgstPercent) {
                                obj["CGST PERCENT"] = mainData.athlete.package.cgstPercent;
                            } else {
                                obj["CGST PERCENT"] = 0;
                            }
                            if (mainData.cgst != null) {
                                obj["CGST AMOUNT"] = mainData.cgst;
                            } else {
                                obj["CGST AMOUNT"] = 0;
                            }
                            if (sgstPercent) {
                                obj["SGST PERCENT"] = mainData.athlete.package.sgstPercent;
                            } else {
                                obj["SGST PERCENT"] = 0;
                            }
                            if (mainData.sgst != null) {
                                obj["SGST AMOUNT"] = mainData.sgst;
                            } else {
                                obj["SGST AMOUNT"] = 0;
                            }
                            if (igstPercent) {
                                obj["IGST PERCENT"] = igstPercent;
                            } else {
                                obj["IGST PERCENT"] = 0;
                            }
                            if (mainData.igst != null) {
                                obj["IGST AMOUNT"] = mainData.igst;
                            } else {
                                obj["IGST AMOUNT"] = 0;
                            }
                            obj["DISCOUNT"] = mainData.discount;
                            if (obj["IGST AMOUNT"] > 0) {
                                obj["TOTAL TO PAY"] = (finalPrice + obj["IGST AMOUNT"]) - mainData.discount;
                            } else {
                                obj["TOTAL TO PAY"] = (finalPrice + obj["CGST AMOUNT"] + obj["SGST AMOUNT"]) - mainData.discount;
                            }
                            obj["TOTAL PAID"] = mainData.totalPaid;
                            obj["OUTSTANDING AMOUNT"] = mainData.outstandingAmount;
                            if (mainData.upgrade == true) {
                                obj["UPGRADED"] = "YES";
                            } else {
                                obj["UPGRADED"] = "NO";
                            }
                            if (mainData.transaction) {
                                var len = mainData.transaction.length;
                                if (len > 0) {
                                    len--;
                                    obj["LAST PAYMENT DATE"] = mainData.transaction[len].dateOfTransaction;
                                } else {
                                    obj["LAST PAYMENT DATE"] = "";
                                }
                            } else {
                                obj["LAST PAYMENT DATE"] = "";
                            }
                            obj["PAYMENT MODE"] = paymentMode;

                            obj["PAYU ID"] = payu;
                            var j = 0;
                            _.each(mainData.receiptId, function (n) {
                                if (j == 0) {
                                    obj["RECEIPT NO"] = n;
                                } else {
                                    obj["RECEIPT NO"] = obj["RECEIPT NO"] + "," + n
                                }
                                j++;
                            });
                            var k = 0;
                            _.each(mainData.checkNo, function (n) {
                                if (k == 0) {
                                    obj["CHECK NO"] = n;
                                } else {
                                    obj["CHECK NO"] = obj["CHECK NO"] + "," + n
                                }
                                k++;
                            });

                            callback(null, obj);
                        },
                        function (err, singleData) {
                            // Config.generateExcel("KnockoutIndividual", singleData, res);
                            callback(null, singleData);
                        });
                }

            ],
            function (err, complete) {
                if (err) {
                    callback(err, null);
                } else {
                    // callback(null, complete);
                    Config.generateExcel("KnockoutIndividual", complete, res);
                }
            })
    },

    generateSchoolExcel: function (data, res) {
        async.waterfall([
            function (callback) {
                Accounts.find({
                        school: {
                            $exists: true
                        }
                    }).lean()
                    .deepPopulate("school school.package transaction transaction.package")
                    .exec(function (err, found) {
                        if (err || _.isEmpty(found)) {
                            callback(null, {
                                error: "no data found",
                                data: data
                            });
                        } else {
                            callback(null, found);
                        }
                    });
            },
            function (found, callback) {
                async.concatSeries(found, function (mainData, callback) {
                        var obj = {};
                        var currentPackName;
                        var packPrice;
                        var cgstPercent;
                        var sgstPercent;
                        var igstPercent;
                        var finalPrice = 0;
                        if (mainData.school) {
                            obj["SFA ID"] = mainData.school.sfaID;
                            obj["SCHOOL NAME"] = mainData.school.schoolName;
                            if (mainData.school.package == undefined) {
                                currentPackName = mainData.school.package.name;
                                packPrice = mainData.school.package.finalPrice;
                                cgstPercent = mainData.school.package.cgstPercent;
                                sgstPercent = mainData.school.package.sgstPercent;
                                igstPercent = mainData.school.package.igstPercent;
                                finalPrice = mainData.school.package.finalPrice;
                            }

                        } else {
                            obj["SFA ID"] = "";
                            obj["SCHOOL NAME"] = "";
                        }
                        var i = 0;
                        var paymentMode;
                        var payu;

                        _.each(mainData.transaction, function (n) {
                            if (i == 0) {
                                paymentMode = n.paymentMode;
                                payu = n.PayuId;
                            } else {
                                paymentMode = paymentMode + "," + n.paymentMode;
                                payu = payu + "," + n.PayuId
                            }
                            i++;
                        });

                        obj["PACKAGE"] = currentPackName;
                        obj["PACKAGE AMOUNT"] = finalPrice;
                        if (cgstPercent) {
                            obj["CGST PERCENT"] = cgstPercent;
                        } else {
                            obj["CGST PERCENT"] = 0;
                        }
                        if (mainData.cgstAmt != null) {
                            obj["CGST AMOUNT"] = mainData.cgstAmt;
                        } else {
                            obj["CGST AMOUNT"] = 0;
                        }
                        if (sgstPercent != null) {
                            obj["SGST PERCENT"] = mainData.sgstPercent;
                        } else {
                            obj["SGST PERCENT"] = 0;
                        }
                        if (mainData.sgstAmt != null) {
                            obj["SGST AMOUNT"] = mainData.sgstAmt;
                        } else {
                            obj["SGST AMOUNT"] = 0;
                        }
                        if (igstPercent != null) {
                            obj["IGST PERCENT"] = igstPercent;
                        } else {
                            obj["IGST PERCENT"] = 0;
                        }
                        if (mainData.igstAmt != null) {
                            obj["IGST AMOUNT"] = mainData.igstAmt;
                        } else {
                            obj["IGST AMOUNT"] = 0;
                        }
                        obj["DISCOUNT"] = mainData.discount;
                        if (obj["IGST AMOUNT"] > 0) {
                            obj["TOTAL TO PAY"] = (finalPrice + obj["IGST AMOUNT"]) - mainData.discount;
                        } else {
                            obj["TOTAL TO PAY"] = (finalPrice + obj["CGST AMOUNT"] + obj["SGST AMOUNT"]) - mainData.discount;
                        }
                        obj["TOTAL PAID"] = mainData.totalPaid;
                        obj["OUTSTANDING AMOUNT"] = mainData.outstandingAmount;
                        if (mainData.upgrade == true) {
                            obj["UPGRADED"] = "YES";
                        } else {
                            obj["UPGRADED"] = "NO";
                        }
                        if (mainData.transaction) {
                            var len = mainData.transaction.length;
                            if (len > 0) {
                                len--;
                                obj["LAST PAYMENT DATE"] = mainData.transaction[len].dateOfTransaction;
                            } else {
                                obj["LAST PAYMENT DATE"] = "";
                            }
                        } else {
                            obj["LAST PAYMENT DATE"] = "";
                        }
                        obj["PAYMENT MODE"] = paymentMode;

                        obj["PAYU ID"] = payu;
                        var j = 0;
                        _.each(mainData.receiptId, function (n) {
                            if (j == 0) {
                                obj["RECEIPT NO"] = n;
                            } else {
                                obj["RECEIPT NO"] = obj["RECEIPT NO"] + "," + n
                            }
                            j++;
                        });
                        var k = 0;
                        _.each(mainData.receiptId, function (n) {
                            if (k == 0) {
                                obj["CHECK NO"] = n;
                            } else {
                                obj["CHECK NO"] = obj["CHECK NO"] + "," + n
                            }
                            k++;
                        });
                        callback(null, obj);
                    },
                    function (err, singleData) {
                        // Config.generateExcel("KnockoutIndividual", singleData, res);
                        callback(null, singleData);
                    });
            }
        ], function (err, complete) {
            if (err) {
                callback(err, null);
            } else {
                // callback(null, complete);
                Config.generateExcel("KnockoutIndividual", complete, res);
            }
        })
    },

    updateSchoolMailAndSms: function (found, callback) {
        async.waterfall([
                function (callback) {
                    ConfigProperty.find().lean().exec(function (err, property) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(property)) {
                                callback(null, []);
                            } else {
                                callback(null, property);
                            }
                        }
                    });
                },
                function (property, callback) {
                    Registration.findOne({
                        _id: found._id
                    }).lean().deepPopulate("package").exec(
                        function (err, schoolData) {
                            if (err) {
                                console.log(err);
                                callback(err, null);
                            } else if (schoolData) {
                                callback(null, property, schoolData);
                            }
                        });
                },
                function (property, schoolData, callback) {
                    var packageId = {};
                    packageId._id = schoolData.package._id;
                    Featurepackage.featureDetailByPackage(packageId, function (err, features) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(features)) {
                                callback(null, []);
                            } else {
                                var finalData = {};
                                finalData.property = property;
                                finalData.schoolData = schoolData;
                                finalData.features = features;
                                callback(null, finalData);
                            }
                        }
                    });
                },
                function (finalData, callback) {
                    var property = finalData.property;
                    var schoolData = finalData.schoolData;
                    var features = finalData.features;
                    async.parallel([
                            function (callback) {
                                var emailData = {};
                                // emailData.from = "info@sfanow.in";
                                emailData.from = property[0].infoId;
                                emailData.email = schoolData.email;
                                emailData.infoId = property[0].infoId;
                                emailData.infoNo = property[0].infoNo;
                                emailData.cityAddress = property[0].cityAddress;
                                emailData.ddFavour = property[0].ddFavour;
                                emailData.city = property[0].sfaCity;
                                emailData.year = property[0].year;
                                emailData.eventYear = property[0].eventYear;
                                emailData.type = property[0].institutionType;
                                emailData.packageName = schoolData.package.name;
                                emailData.packageOrder = schoolData.package.order;
                                emailData.featureDetail = features;
                                emailData.flag = emailData.type;
                                emailData.filename = "player-school/upgrade.ejs";
                                emailData.subject = "SFA: Thank you for upgrading your package for SFA " + emailData.city + " " + emailData.eventYear;
                                // console.log("emaildata", emailData);
                                Config.email(emailData, function (err, emailRespo) {
                                    if (err) {
                                        console.log(err);
                                        callback(null, err);
                                    } else if (emailRespo) {
                                        callback(null, emailRespo);
                                    } else {
                                        callback(null, "Invalid data");
                                    }
                                });
                            },
                            function (callback) {
                                var smsData = {};
                                smsData.mobile = schoolData.mobile;
                                smsData.content = "Thank you for upgrading your package for SFA " + property[0].sfaCity + " " + property[0].eventYear + ". For further details please check your registered email ID.";
                                // console.log("smsdata", smsData);
                                Config.sendSms(smsData, function (err, smsRespo) {
                                    if (err) {
                                        console.log(err);
                                        callback(err, null);
                                    } else if (smsRespo) {
                                        console.log(smsRespo, "sms sent");
                                        callback(null, smsRespo);
                                    } else {
                                        callback(null, "Invalid data");
                                    }
                                });
                            }
                        ],
                        function (err, final) {
                            if (err) {
                                callback(err, null);
                            } else {
                                callback(null, final);
                            }

                        });
                }
            ],
            function (err, data2) {
                if (err) {
                    console.log(err);
                    callback(err, null);
                } else {
                    callback(null, data2);
                }

            });
    },

    updateAthleteMailAndSms: function (found, callback) {
        async.waterfall([
                function (callback) {
                    ConfigProperty.find().lean().exec(function (err, property) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(property)) {
                                callback(null, []);
                            } else {
                                callback(null, property);
                            }
                        }
                    });
                },
                function (property, callback) {
                    Athelete.findOne({
                        _id: found._id
                    }).lean().deepPopulate("package").exec(
                        function (err, athleteData) {
                            if (err) {
                                console.log(err);
                                callback(err, null);
                            } else if (athleteData) {
                                callback(null, property, athleteData);
                            }
                        });
                },
                function (property, athleteData, callback) {
                    var packageId = {};
                    packageId._id = athleteData.package._id;
                    Featurepackage.featureDetailByPackage(packageId, function (err, features) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(features)) {
                                callback(null, []);
                            } else {
                                var finalData = {};
                                finalData.property = property;
                                finalData.athleteData = athleteData;
                                finalData.features = features;
                                callback(null, finalData);
                            }
                        }
                    });
                },
                function (finalData, callback) {
                    var property = finalData.property;
                    var athleteData = finalData.athleteData;
                    var features = finalData.features;
                    async.parallel([
                            function (callback) {
                                var emailData = {};
                                // emailData.from = "info@sfanow.in";
                                emailData.from = property[0].infoId;
                                emailData.email = athleteData.email;
                                emailData.infoId = property[0].infoId;
                                emailData.infoNo = property[0].infoNo;
                                emailData.cityAddress = property[0].cityAddress;
                                emailData.ddFavour = property[0].ddFavour;
                                emailData.city = property[0].sfaCity;
                                emailData.year = property[0].year;
                                emailData.eventYear = property[0].eventYear;
                                emailData.type = property[0].institutionType;
                                emailData.packageName = athleteData.package.name;
                                emailData.packageOrder = athleteData.package.order;
                                emailData.featureDetail = features;
                                emailData.flag = emailData.type;
                                emailData.filename = "player-school/upgrade.ejs";
                                emailData.subject = "SFA: Thank you for upgrading your package for SFA " + emailData.city + " " + emailData.eventYear;
                                // console.log("emaildata", emailData);
                                Config.email(emailData, function (err, emailRespo) {
                                    if (err) {
                                        console.log(err);
                                        callback(null, err);
                                    } else if (emailRespo) {
                                        callback(null, emailRespo);
                                    } else {
                                        callback(null, "Invalid data");
                                    }
                                });
                            },
                            function (callback) {
                                var smsData = {};
                                smsData.mobile = athleteData.mobile;
                                smsData.content = "Thank you for upgrading your package for SFA " + property[0].sfaCity + " " + property[0].eventYear + ". For further details please check your registered email ID.";
                                // console.log("smsdata", smsData);
                                Config.sendSms(smsData, function (err, smsRespo) {
                                    if (err) {
                                        console.log(err);
                                        callback(err, null);
                                    } else if (smsRespo) {
                                        console.log(smsRespo, "sms sent");
                                        callback(null, smsRespo);
                                    } else {
                                        callback(null, "Invalid data");
                                    }
                                });
                            }
                        ],
                        function (err, final) {
                            if (err) {
                                callback(err, null);
                            } else {
                                callback(null, final);
                            }

                        });
                }
            ],
            function (err, data2) {
                if (err) {
                    console.log(err);
                    callback(err, null);
                } else {
                    callback(null, data2);
                }

            });
    },

    upgradeInvoiceAthlete: function (data, callback) {
        async.waterfall([
            function (callback) {
                ConfigProperty.find().lean().exec(function (err, property) {
                    if (err) {
                        callback(err, null);
                    } else {
                        if (_.isEmpty(property)) {
                            callback(null, []);
                        } else {
                            callback(null, property);
                        }
                    }
                });
            },
            function (property, callback) {
                Accounts.findOne({
                        athlete: data._id
                    }).lean()
                    .deepPopulate("athlete athlete.school athlete.package transaction transaction.package")
                    .exec(function (err, accountsData) {
                        if (err || _.isEmpty(accountsData)) {
                            callback(null, {
                                error: "no accounts found",
                                data: data
                            });
                        } else {
                            var final = {};
                            final.accounts = accountsData;
                            final.property = property[0];
                            callback(null, final);
                        }
                    });
            },
            function (final, callback) {
                var len = final.accounts.transaction.length;
                var temp = len;
                len--;
                var emailData = {};
                emailData.city = final.property.sfaCity;
                emailData.type = final.property.institutionType;
                emailData.infoNo = final.property.infoNo;
                emailData.infoId = final.property.infoId;
                if (final.accounts.upgrade) {
                    emailData.upgrade = final.accounts.upgrade;
                } else {
                    emailData.upgrade = false;
                }
                emailData.packageName = final.accounts.transaction[len].package.name;
                emailData.amountWithoutTax = final.accounts.transaction[len].package.finalPrice;
                emailData.cgstPercent = final.accounts.transaction[len].package.cgstPercent;
                emailData.sgstPercent = final.accounts.transaction[len].package.sgstPercent;
                emailData.igstPercent = final.accounts.transaction[len].package.igstPercent;
                emailData.cgstAmount = final.accounts.transaction[len].cgstAmount;
                emailData.sgstAmount = final.accounts.transaction[len].sgstAmount;
                emailData.igstAmount = final.accounts.transaction[len].igstAmount;
                emailData.eventYear = final.property.eventYear;
                if (temp > 1) {
                    temp = temp - 2;
                } else {
                    temp = 0;
                }
                emailData.prevPaidAmount = final.accounts.transaction[temp].amountPaid;
                emailData.discount = final.accounts.discount;
                emailData.firstName = final.accounts.athlete.firstName;
                emailData.receiptNo = final.accounts.athlete.receiptId;
                emailData.surname = final.accounts.athlete.surname;
                emailData.paymentMode = final.accounts.transaction[len].paymentMode;
                emailData.athleteAmount = final.accounts.transaction[len].amountPaid;
                if (final.accounts.transaction[len].PayuId) {
                    emailData.transactionId = final.accounts.transaction[len].PayuId;
                }
                emailData.amountToWords = Accounts.amountToWords(final.accounts.transaction[len].amountPaid);
                emailData.from = final.property.infoId;
                emailData.email1 = [{
                    email: final.accounts.athlete.email
                }];
                emailData.bcc1 = [{
                    email: "payments@sfanow.in"
                }, {
                    email: "admin@sfanow.in"
                }];
                emailData.filename = "player/receipt.ejs";
                emailData.subject = "SFA: Your Payment Receipt as an Athlete for SFA " + emailData.city + " " + emailData.type + " " + emailData.eventYear + ".";
                console.log("emaildata", emailData);
                Config.emailTo(emailData, function (err, emailRespo) {
                    if (err) {
                        console.log(err);
                        callback(null, err);
                    } else {
                        callback(null, emailRespo);
                    }
                });

            },

        ], function (err, complete) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, complete);
            }
        })
    },

    amountToWords: function (num) {
        var a = ['', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine ', 'ten ', 'eleven ', 'twelve ', 'thirteen ', 'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ', 'nineteen '];
        var b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

        if ((num = num.toString()).length > 9) return 'overflow';
        n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
        if (!n) return;
        var str = '';
        str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'crore ' : '';
        str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'lakh ' : '';
        str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'thousand ' : '';
        str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'hundred ' : '';
        str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
        return str;
    }

};
module.exports = _.assign(module.exports, exports, model);