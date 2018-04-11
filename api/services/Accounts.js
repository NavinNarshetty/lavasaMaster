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
                                "athlete.sfaID": {
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
                                        callback(null, data3)
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
                                        callback(null, data3)
                                    }
                                });
                        }
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

    generateAthleteExcel: function (data, callback) {
        async.waterfall([
            function (callback) {
                Accounts.find({
                        athlete: {
                            $exists: true
                        }
                    }).lean()
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
                        obj["SFA ID"] = mainData.athlete.sfaId;
                        if (mainData.athlete.middleName) {
                            obj["ATHLETE NAME"] = mainData.athlete.firstName + " " + mainData.athlete.middleName + " " + mainData.athlete.surname;
                        } else {
                            obj["ATHLETE NAME"] = mainData.athlete.firstName + " " + mainData.athlete.surname;
                        }
                        if (mainData.athlete.atheleteSchoolName) {
                            obj["ATHLETE SCHOOL NAME"] = mainData.athlete.atheleteSchoolName;
                        } else {
                            obj["ATHLETE SCHOOL NAME"] = mainData.athlete.school.name;
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

                        obj["CURRENT PACKAGE"] = mainData.athlete.package.name;
                        obj["CURRENT PACKAGE AMOUNT"] = mainData.athlete.package.finalPrice;
                        if (mainData.athlete.package.cgstPercent != null) {
                            obj["CGST PERCENT"] = mainData.athlete.package.cgstPercent;
                        } else {
                            mainData.athlete.package.cgstPercent = 0;
                        }
                        if (mainData.cgst != null) {
                            obj["CGST AMOUNT"] = mainData.cgst;
                        } else {
                            obj["CGST AMOUNT"] = 0;
                        }
                        if (mainData.athlete.package.sgstPercent != null) {
                            obj["SGST PERCENT"] = mainData.athlete.package.sgstPercent;
                        } else {
                            mainData.athlete.package.sgstPercent = 0;
                        }
                        if (mainData.athlete.package.sgstAmt != null) {
                            obj["SGST AMOUNT"] = mainData.sgst;
                        } else {
                            obj["SGST AMOUNT"] = 0;
                        }
                        if (mainData.igst != null) {
                            obj["IGST PERCENT"] = mainData.igst;
                        } else {
                            mainData.athlete.package.igstPercent = 0;
                        }
                        if (mainData.igst != null) {
                            obj["IGST AMOUNT"] = mainData.igst;
                        } else {
                            obj["IGST AMOUNT"] = 0;
                        }
                        obj["DISCOUNT"] = mainData.discount;
                        if (obj["IGST AMOUNT"] > 0) {
                            obj["TOTAL TO PAY"] = (mainData.athlete.package.finalPrice + obj["IGST AMOUNT"]) - mainData.discount;
                        } else {
                            obj["TOTAL TO PAY"] = (mainData.athlete.package.finalPrice + obj["CGST AMOUNT"] + obj["SGST AMOUNT"]) - mainData.discount;
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
                callback(null, complete);
                // Config.generateExcel("KnockoutIndividual", complete, res);
            }
        })
    },

    generateSchoolExcel: function (data, callback) {
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
                        obj["SFA ID"] = mainData.school.sfaID;
                        obj["SCHOOL NAME"] = mainData.school.schoolName;
                        var i = 0;
                        var paymentMode;
                        var payu;

                        _.each(mainData.transaction, function (n) {
                            if (i == 0) {
                                // obj["SELECTED PACKAGES"] = n.package.name;
                                paymentMode = n.paymentMode;
                                payu = n.PayuId;
                            } else {
                                // obj["SELECTED PACKAGES"] = obj["SELECTED PACKAGES"] + "," + n.package.name;
                                paymentMode = paymentMode + "," + n.paymentMode;
                                payu = payu + "," + n.PayuId
                            }

                            i++;
                        });

                        obj["PACKAGE"] = mainData.athlete.package.name;
                        obj["PACKAGE AMOUNT"] = mainData.athlete.package.finalPrice;
                        if (mainData.athlete.package.cgstPercent != null) {
                            obj["CGST PERCENT"] = mainData.athlete.package.cgstPercent;
                        } else {
                            mainData.athlete.package.cgstPercent = 0;
                        }
                        if (mainData.athlete.package.cgstAmt != null) {
                            obj["CGST AMOUNT"] = mainData.cgstAmount;
                        } else {
                            mainData.athlete.package.cgstAmt = 0;
                        }
                        if (mainData.athlete.package.sgstPercent != null) {
                            obj["SGST PERCENT"] = mainData.athlete.package.sgstPercent;
                        } else {
                            mainData.athlete.package.sgstPercent = 0;
                        }
                        if (mainData.athlete.package.sgstAmt != null) {
                            obj["SGST AMOUNT"] = mainData.sgstAmount;
                        } else {
                            mainData.athlete.package.sgstAmt = 0;
                        }
                        if (mainData.athlete.package.igstPercent != null) {
                            obj["IGST PERCENT"] = mainData.athlete.package.igstPercent;
                        } else {
                            mainData.athlete.package.igstPercent = 0;
                        }
                        if (mainData.igstAmt != null) {
                            obj["IGST AMOUNT"] = mainData.igstAmount;
                        } else {
                            mainData.athlete.package.igstAmt = 0;
                        }
                        obj["DISCOUNT"] = mainData.discount;
                        if (obj["IGST AMOUNT"] > 0) {
                            obj["TOTAL TO PAY"] = (mainData.athlete.package.finalPrice + obj["IGST AMOUNT"]) - mainData.discount;
                        } else {
                            obj["TOTAL TO PAY"] = (mainData.athlete.package.finalPrice + obj["CGST AMOUNT"] + obj["SGST AMOUNT"]) - mainData.discount;
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
                callback(null, complete);
                // Config.generateExcel("KnockoutIndividual", complete, res);
            }
        })
    }


};
module.exports = _.assign(module.exports, exports, model);