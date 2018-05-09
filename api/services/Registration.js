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
require('mongoose-middleware').initialize(mongoose);

var schema = new Schema({
    registerID: Number,
    institutionType: {
        type: String,
    },
    receiptId: Number,
    sfaID: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        default: "Pending"
    },
    password: String,
    year: String,

    schoolName: String,
    schoolType: String,
    schoolCategory: String,
    affiliatedBoard: String,
    schoolLogo: String,
    schoolAddress: String,
    schoolAddressLine2: String,
    state: String,
    district: String,
    city: String,
    locality: String,
    pinCode: String,
    contactPerson: String,
    contactDesignation: String,
    landline: String,
    email: String,
    website: String,
    mobile: String,
    enterOTP: String,
    package: {
        type: Schema.Types.ObjectId,
        ref: 'Package',
        index: true
    },
    schoolPrincipalName: String,
    schoolPrincipalMobile: String,
    schoolPrincipalLandline: String,
    schoolPrincipalEmail: String,
    sportsDepartment: [{
        name: String,
        designation: String,
        mobile: String,
        email: String,
        photograph: String
    }],
    teamSports: [{
        name: {
            type: String
        }
    }],
    racquetSports: [{
        name: {
            type: String
        }
    }],
    aquaticsSports: [{
        name: {
            type: String
        }
    }],
    combatSports: [{
        name: {
            type: String
        }
    }],
    targetSports: [{
        name: {
            type: String
        }
    }],
    individualSports: [{
        name: {
            type: String
        }
    }],

    registrationFee: String,
    paymentStatus: {
        type: String,
        default: "Pending"
    },
    verifyCount: {
        type: Number,
        default: 0,
    },
    transactionID: {
        type: String,
    },
    verifiedDate: Date,

    remarks: String,
    accessToken: String,
    utm_medium: String,
    utm_source: String,
    utm_campaign: String,
    panNo: String,
    gstNo: String
});

schema.plugin(deepPopulate, {
    populate: {
        package: {
            select: ''
        }
    }
});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
schema.plugin(autoIncrement.plugin, {
    model: 'Registration',
    field: 'receiptId',
    startAt: 1,
    incrementBy: 1
});
module.exports = mongoose.model('Registration', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {


    search: function (data, callback) {
        var Model = this;
        var Const = this(data);
        var maxRow = Config.maxRow;

        var matchObj = {
            $or: [{
                registrationFee: {
                    $ne: "online PAYU"
                }
            }, {
                paymentStatus: {
                    $ne: "Pending"
                }
            }],
            $or: [{
                schoolName: {
                    $regex: data.input,
                    $options: 'i'
                }
            }]
        };

        var page = 1;
        if (data.page) {
            page = data.page;
        }
        var field = data.field;
        var options = {
            field: data.field,
            filters: {
                keyword: {
                    fields: ['schoolName'],
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
            // .deepPopulate(deepSearch)
            .keyword(options)
            .page(options, callback);

    },

    saveRegistrationForm: function (data, callback) {
        Athelete.aggregate([{
                $match: {
                    $and: [{
                            schoolName: data.schoolName
                        },
                        {
                            $or: [{
                                email: data.email
                            }]
                        },
                    ]
                }
            }],
            function (err, found) {
                console.log("found school", found);
                if (err) {
                    console.log(err);
                    callback(err, null);
                } else if (found) {
                    if (_.isEmpty(found)) {

                        Registration.saveRegistration(data, function (err, vData) {
                            if (err) {
                                callback(err, null);
                            } else if (vData) {
                                callback(null, vData);
                            }
                        });
                    } else {
                        if (found.registrationFee == 'online PAYU' && found.paymentStatus == 'Pending') {
                            Registration.remove({ //finds one with refrence to id
                                _id: found._id
                            }).exec(function (err, removed) {
                                Registration.saveRegistration(data, function (err, vData) {
                                    if (err) {
                                        callback(err, null);
                                    } else if (vData) {
                                        callback(null, vData);
                                    }
                                });
                            });
                        } else {
                            Registration.saveRegistration(data, function (err, vData) {
                                if (err) {
                                    callback(err, null);
                                } else if (vData) {
                                    callback(null, vData);
                                }
                            });

                        }
                    }
                }
            });

    },

    saveRegistration: function (data, callback) {
        async.waterfall([
                function (callback) {
                    ConfigProperty.find().lean().exec(function (err, property) {
                        if (err) {
                            console.log("err", err);
                            callback("No school Found!", null);
                        } else {
                            if (_.isEmpty(property)) {
                                callback(null, []);
                            } else {
                                var institutionType = property[0].institutionType;
                                callback(null, institutionType);
                            }
                        }
                    });
                },
                function (institutionType, callback) {
                    data.verifyCount = 0;
                    data.registerID = 0;
                    data.institutionType = institutionType;
                    data.year = new Date().getFullYear();
                    console.log("data", data);
                    Registration.saveData(data, function (err, registerData1) {
                        if (err) {
                            console.log("err", err);
                            callback("There was an error while saving data", null);
                        } else {
                            if (_.isEmpty(registerData1)) {
                                callback("No register data found", null);
                            } else {
                                callback(null, registerData1);
                            }
                        }
                    });
                },
                function (registerData1, callback) {
                    Registration.findOne({
                        _id: registerData1._id
                    }).lean().deepPopulate("package").exec(function (err, registerData) {
                        if (err) {
                            console.log("err", err);
                            callback("No school Found!", null);
                        } else {
                            if (_.isEmpty(registerData)) {
                                callback(null, []);
                            } else {
                                console.log("package*****", registerData);
                                // registerData.package = found.package;
                                callback(null, registerData);
                            }
                        }
                    });
                },
                function (registerData, callback) {
                    data.transaction = [];
                    console.log("registerData", registerData);
                    if (registerData.registrationFee == "cash") {
                        var param = {};
                        param.athlete = undefined;
                        param.school = registerData._id;
                        var finalAmount = 0;
                        param.package = registerData.package._id;
                        if (registerData.package.sgstAmt) {
                            param.sgstAmount = registerData.package.sgstAmt;
                            finalAmount = finalAmount + registerData.package.sgstAmt;
                        }
                        if (registerData.package.cgstAmt) {
                            param.cgstAmount = registerData.package.cgstAmt;
                            finalAmount = finalAmount + registerData.package.cgstAmt;
                        }
                        if (registerData.package.igstAmt != null && registerData.package.igstAmt > 0) {
                            param.igstAmout = registerData.package.igstAmt;
                            finalAmount = registerData.package.igstAmt;
                        }
                        param.outstandingAmount = registerData.package.finalPrice + finalAmount;
                        param.paymentMode = registerData.registrationFee;
                        param.paymentStatus = registerData.paymentStatus;
                        param.receiptId = [];
                        param.checkNo = [];
                        Transaction.saveData(param, function (err, transactData) {
                            if (err || _.isEmpty(transactData)) {
                                callback(null, {
                                    error: "no data found",
                                    data: data
                                });
                            } else {
                                data.transaction.push(transactData._id);
                                callback(null, registerData);
                            }
                        });
                    } else {
                        callback(null, registerData);
                    }
                },
                function (registerData, callback) {
                    if (registerData.registrationFee == "online PAYU") {
                        var param = {};
                        param.athlete = undefined;
                        param.school = registerData._id;
                        var finalAmount = 0;
                        if (registerData.package.sgstAmt) {
                            param.sgst = registerData.package.sgstAmt;
                            finalAmount = finalAmount + registerData.package.sgstAmt;
                        }
                        if (registerData.package.cgstAmt) {
                            param.cgst = registerData.package.cgstAmt;
                            finalAmount = finalAmount + registerData.package.cgstAmt;
                        }
                        if (registerData.package.igstAmt != null && registerData.package.igstAmt > 0) {
                            param.igst = registerData.package.igstAmt;
                            finalAmount = registerData.package.igstAmt;
                        }
                        param.totalToPay = registerData.package.finalPrice + finalAmount;
                        param.totalPaid = registerData.package.finalPrice + finalAmount;
                        param.upgrade = false;
                        param.transaction = [];
                    } else {
                        var param = {};
                        var finalAmount = 0;
                        if (registerData.package.sgstAmt) {
                            param.sgst = registerData.package.sgstAmt;
                            finalAmount = finalAmount + registerData.package.sgstAmt;
                        }
                        if (registerData.package.cgstAmt) {
                            param.cgst = registerData.package.cgstAmt;
                            finalAmount = finalAmount + registerData.package.cgstAmt;
                        }
                        if (registerData.package.igstAmt != null && registerData.package.igstAmt > 0) {
                            param.igst = registerData.package.igstAmt;
                            finalAmount = registerData.package.igstAmt;
                        }
                        param.athlete = undefined;
                        param.school = registerData._id;
                        console.log("Transaction-----", data.transaction);
                        param.transaction = data.transaction;
                        param.outstandingAmount = registerData.package.finalPrice + finalAmount;
                        param.upgrade = false;
                    }
                    Accounts.saveData(param, function (err, accountsData) {
                        if (err || _.isEmpty(accountsData)) {
                            callback(null, {
                                error: "No data found",
                                data: registerData
                            });
                        } else {
                            callback(null, registerData);
                        }
                    });
                },
                function (registerData, callback) {
                    data.package = registerData.package;
                    if (registerData.registrationFee == "cash") {
                        Registration.cashPaymentMailSms(data, function (err, mailsms) {
                            if (err) {
                                callback(err, null);
                            } else {
                                if (_.isEmpty(mailsms)) {
                                    callback(null, "Data not found");
                                } else {
                                    callback(null, mailsms);
                                }
                            }

                        });
                    } else {
                        callback(null, registerData);
                    }
                }
            ],
            function (err, results) {
                if (err) {
                    console.log(err);
                    callback(null, results);
                } else if (results) {
                    if (_.isEmpty(results)) {
                        callback(null, results);
                    } else {
                        callback(null, results);
                    }
                }
            });
    },

    //on backend save click (update)
    generateSfaID: function (data, callback) {
        async.waterfall([
                function (callback) {
                    ConfigProperty.find().lean().exec(function (err, complete) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(complete)) {
                                callback(null, []);
                            } else {
                                data.complete = complete[0];
                                callback(null, complete);
                            }
                        }
                    });
                },
                function (complete, callback) {
                    console.log("inside");
                    Registration.findOne({ //to check registration exist and if it exist retrive previous data
                        _id: data._id
                    }).sort({
                        createdAt: -1
                    }).exec(function (err, schoolData) {
                        console.log("schoolData", schoolData); // retrives registration data
                        if (err) {
                            console.log(err);
                            callback(err, null);
                        } else {
                            if (_.isEmpty(schoolData)) {
                                console.log("isempty");
                                callback(null, "No data found");
                            } else {
                                if (schoolData.verifyCount === 0) {
                                    if (data.status == "Verified") {
                                        data.verifyCount = 1;
                                        data.password = schoolData.password;
                                        // data.password = generator.generate({
                                        //     length: 8,
                                        //     numbers: true
                                        // });
                                        if (_.isEmpty(data.sfaID)) {
                                            var year = new Date().getFullYear().toString().substr(2, 2);
                                            console.log("City", city);
                                            console.log("complete", complete[0]);
                                            if (_.isEmpty(complete[0].sfaCity)) {
                                                schoolData.city = "Mumbai";
                                            }
                                            var city = complete[0].sfaCity;
                                            var prefixCity = city.charAt(0);
                                            console.log("prefixCity", prefixCity);
                                            var institutionType = complete[0].institutionType.toUpperCase();
                                            var prefixType = institutionType.charAt(0);
                                            console.log("prefixCity", prefixCity);
                                            Registration.find({
                                                "status": 'Verified'
                                            }).sort({
                                                registerID: -1
                                            }).limit(1).lean().exec(
                                                function (err, datafound) {
                                                    console.log("found", datafound);
                                                    if (err) {
                                                        console.log(err);
                                                        callback(err, null);
                                                    } else {
                                                        var typeVal = complete[0].institutionType;
                                                        var typeVal1 = complete[0].sfaCity;
                                                        if (_.isEmpty(datafound) && typeVal == 'school') {
                                                            if (typeVal1 == 'Mumbai') {
                                                                data.registerID = 1;
                                                            } else if (typeVal1 == 'Hyderabad') {
                                                                data.registerID = 217;
                                                            } else if (typeVal1 == 'Ahmedabad') {
                                                                data.registerID = 101;
                                                            }
                                                            console.log("registerID", data.registerID);
                                                            data.sfaID = prefixCity + prefixType + year + data.registerID;
                                                        } else if (_.isEmpty(datafound) && typeVal == 'college') {
                                                            data.registerID = 101;
                                                            console.log("registerID", data.registerID);
                                                            data.sfaID = prefixCity + prefixType + year + data.registerID;
                                                        } else if (datafound.registerID == 0 && typeVal == 'school') {
                                                            if (typeVal1 == 'Mumbai') {
                                                                data.registerID = 1;
                                                            } else if (typeVal1 == 'Hyderabad') {
                                                                data.registerID = 217;
                                                            } else if (typeVal1 == 'Ahmedabad') {
                                                                data.registerID = 101;
                                                            }
                                                            console.log("registerID", data.registerID);
                                                            data.sfaID = prefixCity + prefixType + year + data.registerID;
                                                        } else if (datafound.registerID == 0 && typeVal == 'college') {
                                                            data.registerID = 101;
                                                            console.log("registerID", data.registerID);
                                                            data.sfaID = prefixCity + prefixType + year + data.registerID;
                                                        } else {
                                                            console.log("found", datafound[0].sfaID);
                                                            data.registerID = ++datafound[0].registerID;
                                                            console.log("registerID", data.registerID);
                                                            data.sfaID = prefixCity + prefixType + year + data.registerID;
                                                        }
                                                        data.verifiedDate = new Date();
                                                        async.parallel([
                                                            function (callback) {
                                                                School.findOne({ //finds one with refrence to id
                                                                    // name: schoolData.schoolName,
                                                                    sfaid: data.sfaID
                                                                }).exec(function (err, found) {
                                                                    console.log("found old school", found);
                                                                    if (err) {
                                                                        callback(err, null);
                                                                    } else if (_.isEmpty(found)) {

                                                                        var school = {};
                                                                        school.name = schoolData.schoolName;
                                                                        if (_.isEmpty(schoolData.sfaID)) {
                                                                            school.sfaid = data.sfaID;
                                                                            school.institutionType = complete[0].institutionType;
                                                                        } else {
                                                                            school.sfaid = schoolData.sfaID;
                                                                            school.institutionType = complete[0].institutionType;
                                                                        }
                                                                        School.saveData(school, function (err, newData) {
                                                                            console.log("school created", newData);
                                                                            if (err) {
                                                                                console.log("err", err);
                                                                                callback("There was an error while saving order", null);
                                                                            } else {
                                                                                if (_.isEmpty(newData)) {
                                                                                    callback("No order data found", null);
                                                                                } else {
                                                                                    callback(null, newData);
                                                                                }
                                                                            }
                                                                        });
                                                                    } else {
                                                                        callback(null, found);
                                                                    }

                                                                });
                                                            },
                                                            function (callback) {
                                                                Registration.saveVerify(data, schoolData, function (err, vData) {
                                                                    if (err) {
                                                                        callback(err, null);
                                                                    } else if (vData) {
                                                                        callback(null, vData);
                                                                    }
                                                                });
                                                                // if (data.complete.institutionType == "school") {
                                                                //     Registration.saveVerify(data, schoolData, function (err, vData) {
                                                                //         if (err) {
                                                                //             callback(err, null);
                                                                //         } else if (vData) {
                                                                //             callback(null, vData);
                                                                //         }
                                                                //     });
                                                                // } else {
                                                                //     Registration.saveVerifyCollege(data, schoolData, function (err, vData) {
                                                                //         if (err) {
                                                                //             callback(err, null);
                                                                //         } else if (vData) {
                                                                //             callback(null, vData);
                                                                //         }
                                                                //     });
                                                                // }


                                                            }
                                                        ], function (err, data3) {
                                                            console.log("data3 : ", data3);
                                                            if (err) {
                                                                console.log(err);
                                                                callback(err, null);
                                                            } else {
                                                                callback(null, data3);
                                                            }
                                                        });
                                                    }
                                                });
                                            // data.sfaId = sfa;

                                        } else {
                                            Registration.saveVerify(data, schoolData, function (err, vData) {
                                                if (err) {
                                                    callback(err, null);
                                                } else if (vData) {
                                                    callback(null, vData);
                                                }
                                            });
                                            // if (data.complete.institutionType == "school") {
                                            //     Registration.saveVerify(data, schoolData, function (err, vData) {
                                            //         if (err) {
                                            //             callback(err, null);
                                            //         } else if (vData) {
                                            //             callback(null, vData);
                                            //         }
                                            //     });
                                            // } else {
                                            //     Registration.saveVerifyCollege(data, schoolData, function (err, vData) {
                                            //         if (err) {
                                            //             callback(err, null);
                                            //         } else if (vData) {
                                            //             callback(null, vData);
                                            //         }
                                            //     });
                                            // }

                                        }
                                    } else {
                                        Registration.saveVerify(data, schoolData, function (err, vData) {
                                            if (err) {
                                                callback(err, null);
                                            } else if (vData) {
                                                callback(null, vData);
                                            }
                                        });
                                        // if (data.complete.institutionType == "school") {
                                        //     Registration.saveVerify(data, schoolData, function (err, vData) {
                                        //         if (err) {
                                        //             callback(err, null);
                                        //         } else if (vData) {
                                        //             callback(null, vData);
                                        //         }
                                        //     });
                                        // } else {
                                        //     Registration.saveVerifyCollege(data, schoolData, function (err, vData) {
                                        //         if (err) {
                                        //             callback(err, null);
                                        //         } else if (vData) {
                                        //             callback(null, vData);
                                        //         }
                                        //     });
                                        // }
                                    }
                                } else {
                                    Registration.saveVerify(data, schoolData, function (err, vData) {
                                        if (err) {
                                            callback(err, null);
                                        } else if (vData) {
                                            callback(null, vData);
                                        }
                                    });
                                    // if (data.complete.institutionType == "school") {
                                    //     Registration.saveVerify(data, schoolData, function (err, vData) {
                                    //         if (err) {
                                    //             callback(err, null);
                                    //         } else if (vData) {
                                    //             callback(null, vData);
                                    //         }
                                    //     });
                                    // } else {
                                    //     Registration.saveVerifyCollege(data, schoolData, function (err, vData) {
                                    //         if (err) {
                                    //             callback(err, null);
                                    //         } else if (vData) {
                                    //             callback(null, vData);
                                    //         }
                                    //     });
                                    // }
                                }

                            }
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

    saveVerify: function (data, schoolData, callback) {
        Registration.saveData(data, function (err, registerData) {
            console.log("Registration", registerData);
            console.log("schoolData", schoolData);
            if (err) {
                console.log("err", err);
                callback("There was an error while saving school", null);
            } else {
                if (_.isEmpty(registerData)) {
                    callback("No order data found", null);
                } else {
                    if (schoolData.verifyCount === 0) {
                        if (data.status == "Verified") {
                            Registration.successVerifiedMailSms(data, function (err, vData) {
                                if (err) {
                                    callback(err, null);
                                } else if (vData) {
                                    callback(null, vData);
                                }
                            });

                        } else if (data.status == "Rejected") {
                            Registration.failureVerifiedMailSms(data, function (err, vData) {
                                if (err) {
                                    callback(err, null);
                                } else if (vData) {
                                    callback(null, vData);
                                }
                            });
                        } else {
                            callback(null, registerData);
                        }
                    } else {
                        callback(null, "updated Successfully !!");
                    }

                }
            }
        });

    },

    saveVerifyCollege: function (data, schoolData, callback) {
        Registration.saveData(data, function (err, registerData) {
            console.log("Registration", registerData);
            console.log("schoolData", schoolData);
            if (err) {
                console.log("err", err);
                callback("There was an error while saving school", null);
            } else {
                if (_.isEmpty(registerData)) {
                    callback("No order data found", null);
                } else {
                    if (schoolData.verifyCount === 0) {
                        if (data.status == "Verified") {
                            Registration.successVerifiedMailSms(data, function (err, vData) {
                                if (err) {
                                    callback(err, null);
                                } else if (vData) {
                                    callback(null, vData);
                                }
                            });
                        } else if (data.status == "Rejected") {
                            Registration.failureVerifiedMailSms(data, function (err, vData) {
                                if (err) {
                                    callback(err, null);
                                } else if (vData) {
                                    callback(null, vData);
                                }
                            });
                        } else {
                            callback(null, registerData);
                        }
                    } else {
                        callback(null, "updated Successfully !!");
                    }

                }
            }
        });

    },

    getAllRegistrationDetails: function (data, callback) {
        Registration.find().exec(function (err, found) {
            if (err) {
                callback(err, null);
            } else if (_.isEmpty(found)) {
                callback(null, "Data is empty");
            } else {
                callback(null, found);
            }
        });

    },

    getOneRegistrationDetails: function (data, callback) {
        Registration.findOne({
            _id: data._id
        }).exec(function (err, found) {
            if (err) {
                callback(err, null);
            } else if (_.isEmpty(found)) {
                callback(null, "Data is empty");
            } else {
                callback(null, found);
            }

        });
    },

    generateOTP: function (data, callback) {
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
                    console.log("email otp");
                    var emailOtp = (Math.random() + "").substring(2, 6);
                    var emailData = {};
                    // emailData.from = "info@sfanow.in";
                    emailData.from = property[0].infoId;
                    emailData.infoId = property[0].infoId;
                    emailData.infoNo = property[0].infoNo;
                    emailData.infoNoArr = property[0].infoNoArr;
                    emailData.cityAddress = property[0].cityAddress;
                    emailData.ddFavour = property[0].ddFavour;
                    emailData.email = data.email;
                    emailData.city = property[0].sfaCity;
                    emailData.year = property[0].year;
                    emailData.eventYear = property[0].eventYear;
                    emailData.otp = emailOtp;
                    emailData.filename = "e-player-school/emailOtp.ejs";
                    emailData.subject = "SFA: Your Email OTP (One time Password) for SFA registration is";
                    console.log("emaildata", emailData);

                    Config.email(emailData, function (err, emailRespo) {
                        if (err) {
                            console.log(err);
                            callback(null, err);
                        } else if (emailRespo) {
                            callback(null, emailOtp);
                        } else {
                            callback(null, "Invalid data");
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

    updatePaymentStatus: function (data, callback) {
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
                    }).lean().deepPopulate("package").exec(function (err, found) {
                        if (err) {
                            callback(err, null);
                        } else if (_.isEmpty(found)) {
                            callback(null, "Data is empty");
                        } else {
                            console.log("inside found", found);
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
                                        console.log("data------", data, "found------", found);
                                        Transaction.saveTransaction(data, found, function (err, vData) {
                                            if (err || _.isEmpty(vData)) {
                                                callback(null, {
                                                    error: "no data found",
                                                    data: found
                                                });
                                            } else {
                                                callback(null, found);
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
                                                    paymentStatus: "Paid",
                                                    transactionID: data.transactionid
                                                }
                                            };
                                            Registration.update({
                                                _id: found._id
                                            }, matchObj).exec(
                                                function (err, data3) {
                                                    callback(err, data3);
                                                    if (err) {
                                                        callback(err, null);
                                                    } else {
                                                        async.parallel([
                                                                function (callback) {
                                                                    Registration.onlinePaymentMailSms(found, function (err, mailsms) {
                                                                        if (err) {
                                                                            callback(err, null);
                                                                        } else {
                                                                            if (_.isEmpty(mailsms)) {
                                                                                callback(null, "Data not found");
                                                                            } else {
                                                                                callback(null, mailsms);
                                                                            }
                                                                        }
                                                                    });
                                                                },
                                                                function (callback) {
                                                                    Registration.receiptMail(found, function (err, mailsms) {
                                                                        if (err) {
                                                                            callback(err, null);
                                                                        } else {
                                                                            if (_.isEmpty(mailsms)) {
                                                                                callback(null, "Data not found");
                                                                            } else {
                                                                                callback(null, mailsms);
                                                                            }
                                                                        }

                                                                    });
                                                                }
                                                            ],
                                                            function (err, data2) {
                                                                // if (err) {
                                                                //     // console.log(err);
                                                                //     callback(err, null);
                                                                // } else if (_.isEmpty(data2)) {
                                                                //     callback(null, data2);
                                                                // } else {
                                                                //     callback(null, data2);
                                                                // }
                                                            });
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

    updatePaymentStatusBackend: function (data, callback) {
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
                    }).lean().deepPopulate("package").exec(function (err, found) {
                        if (err) {
                            callback(err, null);
                        } else if (_.isEmpty(found)) {
                            callback(null, "Data is empty");
                        } else {
                            console.log("inside found", found);
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
                                        console.log("data------", data, "found------", found);
                                        Transaction.saveTransaction(data, found, function (err, vData) {
                                            if (err || _.isEmpty(vData)) {
                                                callback(null, {
                                                    error: "no data found",
                                                    data: found
                                                });
                                            } else {
                                                callback(null, found);
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
                                                    paymentStatus: "Paid",
                                                    transactionID: data.transactionid
                                                }
                                            };
                                            Registration.update({
                                                _id: found._id
                                            }, matchObj).exec(
                                                function (err, data3) {
                                                    if (err) {
                                                        callback(err, null);
                                                    } else if (_.isEmpty(data3)) {
                                                        callback(null, data3);
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

    updatePaymentStatusOld: function (data, callback) {
        var matchObj = {
            $set: {
                paymentStatus: "Paid",
                transactionID: data.transactionid
            }
        };
        Registration.findOne({ //finds one with refrence to id
            schoolName: data.schoolName
        }).lean().deepPopulate("package").exec(function (err, found) {
            if (err) {
                callback(err, null);
            } else if (_.isEmpty(found)) {
                callback(null, "Data is empty");
            } else {
                Registration.update({
                    _id: found._id
                }, matchObj).exec(
                    function (err, data3) {

                        callback(err, data3);
                        if (err) {
                            console.log(err);
                            // callback(err, null);
                        } else if (data3) {
                            async.parallel([
                                    function (callback) {
                                        Registration.onlinePaymentMailSms(found, function (err, mailsms) {
                                            if (err) {
                                                callback(err, null);
                                            } else {
                                                if (_.isEmpty(mailsms)) {
                                                    callback(null, "Data not found");
                                                } else {
                                                    callback(null, mailsms);
                                                }
                                            }
                                        });
                                    },
                                    function (callback) {
                                        Registration.receiptMail(found, function (err, mailsms) {
                                            if (err) {
                                                callback(err, null);
                                            } else {
                                                if (_.isEmpty(mailsms)) {
                                                    callback(null, "Data not found");
                                                } else {
                                                    callback(null, mailsms);
                                                }
                                            }

                                        });
                                    }
                                ],
                                function (err, data2) {
                                    // if (err) {
                                    //     console.log(err);

                                    // } else if (data2) {
                                    //     if (_.isEmpty(data2)) {
                                    //         callback(null, data2);
                                    //     } else {
                                    //         callback(null, data2);
                                    //     }
                                    // }
                                });
                        }
                    });
            }
        });
    },

    onlinePaymentMailSms: function (data, callback) {
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
                    async.parallel([
                            function (callback) {
                                var emailData = {};
                                // emailData.from = "info@sfanow.in";
                                emailData.from = property[0].infoId;
                                emailData.infoId = property[0].infoId;
                                emailData.infoNo = property[0].infoNo;
                                emailData.infoNoArr = property[0].infoNoArr;
                                emailData.cityAddress = property[0].cityAddress;
                                emailData.ddFavour = property[0].ddFavour;
                                emailData.email = data.email;
                                emailData.city = property[0].sfaCity;
                                emailData.year = property[0].year;
                                emailData.eventYear = property[0].eventYear;
                                emailData.type = property[0].institutionType;
                                emailData.amount = data.package.finalPrice;
                                emailData.registrationFee = data.registrationFee;
                                emailData.filename = "e-school/schoolRegistration.ejs";
                                emailData.subject = "SFA: Thank you for registering for SFA " + emailData.city + " " + emailData.eventYear;
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
                                // console.log("mobileOtp", mobileOtp);
                                smsData.mobile = data.mobile;

                                smsData.content = "Thank you for registering for SFA " + property[0].sfaCity + " " + property[0].eventYear + ". For further details please check your registered email ID.";
                                console.log("smsdata", smsData);
                                callback(null, smsData);
                                // Config.sendSms(smsData, function (err, smsRespo) {
                                //     if (err) {
                                //         console.log(err);
                                //         callback(err, null);
                                //     } else if (smsRespo) {
                                //         console.log(smsRespo, "sms sent");
                                //         callback(null, smsRespo);
                                //     } else {
                                //         callback(null, "Invalid data");
                                //     }
                                // });
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

    cashPaymentMailSms: function (data, callback) {
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
                    async.parallel([
                            function (callback) {
                                // console.log('Package', package);
                                console.log('data', data);
                                var emailData = {};
                                // emailData.from = "info@sfanow.in";
                                emailData.from = property[0].infoId;
                                emailData.infoId = property[0].infoId;
                                emailData.infoNo = property[0].infoNo;
                                emailData.infoNoArr = property[0].infoNoArr;
                                emailData.cityAddress = property[0].cityAddress;
                                emailData.ddFavour = property[0].ddFavour;
                                emailData.email = data.email;
                                emailData.city = property[0].sfaCity;
                                emailData.year = property[0].year;
                                emailData.eventYear = property[0].eventYear;
                                emailData.type = property[0].institutionType;
                                emailData.amount = data.package.finalPrice;
                                emailData.registrationFee = data.registrationFee;
                                emailData.filename = "e-school/schoolRegistration.ejs";
                                emailData.subject = "SFA: Thank you for registering for SFA " + emailData.city + " " + emailData.eventYear;
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
                                smsData.mobile = data.mobile;
                                smsData.content = "Thank you for registering for SFA " + property[0].sfaCity + " " + property[0].eventYear + ". For further details please check your registered email ID.";
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

    successVerifiedMailSms: function (data, callback) {
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
                    async.parallel([
                            function (callback) {
                                var emailData = {};
                                // emailData.from = "info@sfanow.in";
                                emailData.from = property[0].infoId;
                                emailData.city = property[0].sfaCity;
                                emailData.year = property[0].year;
                                emailData.eventYear = property[0].eventYear;
                                emailData.type = property[0].institutionType;
                                emailData.email = data.email;
                                emailData.infoId = property[0].infoId;
                                emailData.infoNo = property[0].infoNo;
                                emailData.infoNoArr = property[0].infoNoArr;
                                emailData.cityAddress = property[0].cityAddress;
                                emailData.ddFavour = property[0].ddFavour;
                                emailData.playerUrl = property[0].playerUrl;
                                emailData.schoolUrl = property[0].schoolUrl;
                                emailData.sfaId = data.sfaID;
                                emailData.password = data.password;
                                emailData.flag = emailData.type;
                                emailData.filename = "e-player-school/verification.ejs";
                                emailData.subject = "SFA: You are now a verified " + emailData.type + " for SFA " + emailData.city + " " + emailData.eventYear + ".";
                                console.log("emaildata", emailData);

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
                                smsData.mobile = data.mobile;
                                // smsData.content = "Congratulations! You are now a verified SFA " + property[0].institutionType + ". Kindly check your registered Email ID for your SFA ID and Password.";
                                smsData.content = "Congratulations ! SFA ID " + data.sfaID + "and Password " + data.password + ".Kindly complete your Sports Registrations";
                                console.log("smsdata", smsData);
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

    failureVerifiedMailSms: function (data, callback) {
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
                    async.parallel([
                            function (callback) {
                                var emailData = {};
                                // emailData.from = "info@sfanow.in";
                                emailData.from = property[0].infoId;
                                emailData.infoId = property[0].infoId;
                                emailData.infoNo = property[0].infoNo;
                                emailData.infoNoArr = property[0].infoNoArr;
                                emailData.cityAddress = property[0].cityAddress;
                                emailData.ddFavour = property[0].ddFavour;
                                emailData.email = data.email;
                                emailData.sfaId = data.sfaID;
                                emailData.city = property[0].sfaCity;
                                emailData.year = property[0].year;
                                emailData.eventYear = property[0].eventYear;
                                emailData.type = property[0].institutionType;
                                emailData.password = data.password;
                                emailData.filename = "e-player-school/rejection.ejs";
                                emailData.subject = "SFA: Rejection of Your Application for SFA " + emailData.city + " " + emailData.eventYear;
                                console.log("emaildata", emailData);

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
                                smsData.mobile = data.mobile;
                                smsData.content = "We regret to inform you that your application has been rejected for SFA " + property[0].sfaCity + " " + property[0].eventYear + ". For further queries please email us at info@sfanow.in";
                                console.log("smsdata", smsData);
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

    allAtheleteMailSms: function (data, callback) {
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
                    async.parallel([
                            function (callback) {
                                var emailData = {};
                                // emailData.from = "info@sfanow.in";
                                emailData.from = property[0].infoId;
                                emailData.email = data.email;
                                emailData.city = property[0].sfaCity;
                                emailData.year = property[0].year;
                                emailData.type = property[0].institutionType;
                                emailData.eventYear = property[0].eventYear;
                                emailData.infoId = property[0].infoId;
                                emailData.infoNo = property[0].infoNo;
                                emailData.infoNoArr = property[0].infoNoArr;
                                emailData.cityAddress = property[0].cityAddress;
                                emailData.ddFavour = property[0].ddFavour;
                                emailData.filename = "e-mails/allAthelete.ejs";
                                emailData.subject = "SFA: Your " + emailData.type + " has officially registered for SFA " + emailData.city + " " + emailData.eventYear;
                                console.log("emaildata", emailData);

                                // Config.email(emailData, function (err, emailRespo) {
                                //     if (err) {
                                //         console.log(err);
                                //         callback(null, err);
                                //     } else if (emailRespo) {
                                //         callback(null, emailRespo);
                                //     } else {
                                //         callback(null, "Invalid data");
                                //     }
                                // });
                            },
                            function (callback) {

                                var smsData = {};
                                smsData.mobile = data.mobile;
                                smsData.content = "Congratulations! Your school has officially registered for SFA " + property[0].sfaCity + " " + property[0].eventYear + ".";
                                console.log("smsdata", smsData);
                                // Config.sendSms(smsData, function (err, smsRespo) {
                                //     if (err) {
                                //         console.log(err);
                                //         callback(err, null);
                                //     } else if (smsRespo) {
                                //         console.log(smsRespo, "sms sent");
                                //         callback(null, smsRespo);
                                //     } else {
                                //         callback(null, "Invalid data");
                                //     }
                                // });
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

    receiptMailOld: function (data, callback) {
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
                    async.waterfall([
                            //Athlete email
                            function (callback) {
                                Registration.findOne({ //finds one with refrence to id
                                    _id: data._id
                                }).exec(function (err, found) {
                                    if (err) {
                                        callback(err, null);
                                    } else if (_.isEmpty(found)) {
                                        callback(null, "Data is empty");
                                    } else {
                                        var emailData = {};
                                        if (data.sfaID) {
                                            emailData.sfaID = found.sfaID;
                                        } else {
                                            emailData.sfaID = "";
                                        }
                                        emailData.schoolName = found.schoolName;
                                        emailData.transactionID = found.transactionID;
                                        emailData.Date = moment().format("DD-MM-YYYY");
                                        var receipt = "SFA" + found.receiptId;
                                        emailData.receiptNo = receipt;
                                        emailData.city = property[0].sfaCity;
                                        emailData.year = property[0].year;
                                        emailData.type = property[0].institutionType;
                                        emailData.eventYear = property[0].eventYear;
                                        emailData.typeAmount = property[0].totalAmountType;
                                        emailData.amountInWords = property[0].totalAmountInWordsType;
                                        emailData.amountWithoutTax = property[0].amoutWithoutTaxType;
                                        emailData.cgstAmout = property[0].cgstAmout;
                                        emailData.cgstPercent = property[0].cgstPercent;
                                        emailData.sgstAmout = property[0].sgstAmout;
                                        emailData.sgstPercent = property[0].sgstPercent;
                                        emailData.igstAmout = property[0].igstAmout;
                                        emailData.igstPercent = property[0].igstPercent;
                                        // emailData.from = "info@sfanow.in";
                                        emailData.from = property[0].infoId;
                                        emailData.infoId = property[0].infoId;
                                        emailData.infoNo = property[0].infoNo;
                                        emailData.infoNoArr = property[0].infoNoArr;
                                        emailData.cityAddress = property[0].cityAddress;
                                        emailData.ddFavour = property[0].ddFavour;
                                        emailData.email1 = [{
                                            email: found.email
                                        }];

                                        emailData.bcc1 = [{
                                            email: "payments@sfanow.in"
                                        }, {
                                            email: "admin@sfanow.in"
                                        }];
                                        // emailData.email = found.email;
                                        emailData.filename = "receipt.ejs";
                                        emailData.subject = "SFA: Your Payment Receipt as " + emailData.type + " for SFA " + emailData.city + " " + emailData.eventYear + ".";
                                        Config.emailTo(emailData, function (err, emailRespo) {
                                            if (err) {
                                                console.log(err);
                                                callback(null, err);
                                            } else if (emailRespo) {
                                                callback(null, emailRespo);
                                            } else {
                                                callback(null, "Invalid data");
                                            }
                                        });
                                    }
                                });
                            },
                            function (email, callback) {
                                Registration.findOne({ //finds one with refrence to id
                                    _id: data._id
                                }).exec(function (err, found) {
                                    if (err) {
                                        callback(err, null);
                                    } else if (_.isEmpty(found)) {
                                        callback(null, "Data is empty");
                                    } else {
                                        var emailData = {};
                                        if (data.sfaID) {
                                            emailData.sfaID = found.sfaID;
                                        } else {
                                            emailData.sfaID = "";
                                        }
                                        emailData.schoolName = found.schoolName;
                                        emailData.schoolAddress = found.schoolAddress;
                                        if (found.panNo) {
                                            emailData.panNo = found.panNo;
                                        } else {
                                            emailData.panNo = "";
                                        }
                                        if (found.gstNo) {
                                            emailData.gstNo = found.gstNo;
                                        } else {
                                            emailData.gstNo = "";
                                        }
                                        emailData.city = property[0].sfaCity;
                                        emailData.year = property[0].year;
                                        emailData.type = property[0].institutionType;
                                        emailData.eventYear = property[0].eventYear;
                                        emailData.typeAmount = property[0].totalAmountType;
                                        emailData.amountInWords = property[0].totalAmountInWordsType;
                                        emailData.amountWithoutTax = property[0].amoutWithoutTaxType;
                                        emailData.taxTotalAmountInWords = property[0].taxTotalAmountInWords;
                                        if (property[0].cgstAmout) {
                                            emailData.cgstAmout = property[0].cgstAmout;
                                        } else {
                                            emailData.cgstAmout = 0;
                                        }
                                        if (property[0].cgstPercent) {
                                            emailData.cgstPercent = property[0].cgstPercent;
                                        } else {
                                            emailData.cgstPercent = 0;
                                        }
                                        if (property[0].sgstAmout) {
                                            emailData.sgstAmout = property[0].sgstAmout;
                                        } else {
                                            emailData.sgstAmout = 0;
                                        }
                                        if (property[0].sgstPercent) {
                                            emailData.sgstPercent = property[0].sgstPercent;
                                        } else {
                                            emailData.sgstPercent = 0;
                                        }
                                        emailData.transactionID = found.transactionID;
                                        emailData.Date = moment().format("DD-MM-YYYY");
                                        emailData.igstAmout = property[0].igstAmout;
                                        emailData.igstPercent = property[0].igstPercent;
                                        var receipt = "SFA" + found.registerID;
                                        emailData.receiptNo = receipt;
                                        emailData.infoId = property[0].infoId;
                                        emailData.infoNo = property[0].infoNo;
                                        emailData.infoNoArr = property[0].infoNoArr;
                                        emailData.cityAddress = property[0].cityAddress;
                                        emailData.ddFavour = property[0].ddFavour;
                                        // emailData.from = "info@sfanow.in";
                                        emailData.from = property[0].infoId;
                                        emailData.email1 = [{
                                            email: found.email
                                        }];
                                        emailData.bcc1 = [{
                                            email: "payments@sfanow.in"
                                        }, {
                                            email: "admin@sfanow.in"
                                        }];
                                        // emailData.email = found.email;
                                        emailData.filename = "envoice.ejs";
                                        emailData.subject = "SFA: Your Payment Invoice as " + emailData.type + " for SFA " + emailData.city + " " + emailData.eventYear + ".";
                                        console.log("emaildata", emailData);

                                        Config.emailTo(emailData, function (err, emailRespo) {
                                            if (err) {
                                                console.log(err);
                                                callback(null, err);
                                            } else if (emailRespo) {
                                                callback(null, emailRespo);
                                            } else {
                                                callback(null, "Invalid data");
                                            }
                                        });
                                    }
                                });
                            },
                        ],
                        function (err, data3) {
                            if (err) {
                                console.log(err);
                                callback(err, null);
                            } else {
                                if (_.isEmpty(data3)) {
                                    callback(null, []);
                                } else {
                                    callback(null, data3);
                                }
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

    receiptMail: function (data, callback) {
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
                        school: data._id
                    }).lean()
                    .deepPopulate("school school.package transaction transaction.package")
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
                emailData.infoNoArr = final.property.infoNoArr;
                emailData.infoId = final.property.infoId;
                emailData.cityAddress = final.property.cityAddress;
                emailData.ddFavour = final.property.ddFavour;
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
                emailData.schoolName = final.accounts.school.schoolName;
                if (final.accounts.school.gstNo) {
                    emailData.schoolGstNo = final.accounts.school.gstNo;
                } else {
                    emailData.schoolGstNo = false;
                }
                emailData.receiptNo = final.accounts.transaction[len].receiptId[0];
                emailData.paymentMode = final.accounts.transaction[len].paymentMode;
                emailData.schoolAmount = final.accounts.transaction[len].amountPaid;
                var dateTime = moment().utc(final.accounts.transaction[len].dateOfTransaction).format("DD-MM-YYYY");
                emailData.registrationDate = dateTime;
                // emailData.registrationDate = final.accounts.transaction[len].dateOfTransaction;
                if (final.accounts.transaction[len].PayuId) {
                    emailData.transactionId = final.accounts.transaction[len].PayuId;
                }
                emailData.amountToWords = Accounts.amountToWords(final.accounts.transaction[len].amountPaid);
                emailData.from = final.property.infoId;
                emailData.email1 = [{
                    email: final.accounts.school.email
                }];
                emailData.bcc1 = [{
                    email: "payments@sfanow.in"
                }, {
                    email: "admin@sfanow.in"
                }];
                emailData.filename = "e-school/receipt.ejs";
                emailData.subject = "SFA: Your Payment Receipt as an " + emailData.type + " for SFA " + emailData.city + " " + emailData.eventYear + ".";
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

    excelFilterSchool: function (data, callback) {
        var maxRow = Config.maxRow;
        console.log(data);
        var page = 1;
        if (data.page) {
            page = data.page;
        }
        var field = data.field;
        var options = {
            field: data.field,
            filters: {
                keyword: {
                    fields: ['schoolName', 'sfaID'],
                    term: data.keyword
                }
            },
            sort: {
                desc: 'createdAt'
            },
            start: (page - 1) * maxRow,
            count: maxRow
        };
        var matchObj = {
            $or: [{
                registrationFee: {
                    $ne: "online PAYU"
                }
            }, {
                paymentStatus: {
                    $ne: "Pending"
                }
            }],
        };
        if (data.type == "Date") {
            matchObj.createdAt = {
                $gt: data.startDate,
                $lt: data.endDate,
            };
        } else if (data.type == "SFA-ID") {
            matchObj = {
                sfaID: {
                    $regex: data.input,
                    $options: "i"
                },
                $or: [{
                    registrationFee: {
                        $ne: "online PAYU"
                    }
                }, {
                    paymentStatus: {
                        $ne: "Pending"
                    }
                }]
            };
        } else if (data.type == "UTM_Source") {
            matchObj = {
                utm_source: {
                    $regex: data.input,
                    $options: "i"
                },
                $or: [{
                    registrationFee: {
                        $ne: "online PAYU"
                    }
                }, {
                    paymentStatus: {
                        $ne: "Pending"
                    }
                }]
            };
        } else if (data.type == "UTM_Campaign") {
            matchObj = {
                utm_campaign: {
                    $regex: data.input,
                    $options: "i"
                },
                $or: [{
                    registrationFee: {
                        $ne: "online PAYU"
                    }
                }, {
                    paymentStatus: {
                        $ne: "Pending"
                    }
                }]
            };
        } else if (data.type == "UTM_Medium") {
            matchObj = {
                utm_medium: {
                    $regex: data.input,
                    $options: "i"
                },
                $or: [{
                    registrationFee: {
                        $ne: "online PAYU"
                    }
                }, {
                    paymentStatus: {
                        $ne: "Pending"
                    }
                }]
            };
        } else if (data.type == "School Name") {
            matchObj = {
                'schoolName': {
                    $regex: data.input,
                    $options: "i"
                },
                $or: [{
                    registrationFee: {
                        $ne: "online PAYU"
                    }
                }, {
                    paymentStatus: {
                        $ne: "Pending"
                    }
                }]
            };
        } else if (data.type == "Payment Mode") {
            if (data.input == "cash" || data.input == "Cash") {
                matchObj = {
                    'registrationFee': "cash",
                };
            } else if (data.input == "online" || data.input == "Online") {
                matchObj = {
                    'registrationFee': "online PAYU",
                    paymentStatus: {
                        $ne: "Pending"
                    }
                };

            } else if (data.input == "sponsor" || data.input == "Sponsor") {
                matchObj = {
                    'registrationFee': "Sponsor",
                    paymentStatus: {
                        $ne: "Pending"
                    }
                };

            }
        } else if (data.type == "Payment Status") {
            if (data.input == "Paid" || data.input == "paid") {
                matchObj = {
                    'paymentStatus': "Paid",
                };
            } else if (data.input == "Pending" || data.input == "pending") {
                matchObj = {
                    'paymentStatus': "Pending",
                    registrationFee: {
                        $ne: "online PAYU"
                    }
                };
            }

        } else if (data.type == "Verified Status") {
            matchObj = {
                'status': {
                    $regex: data.input,
                    $options: "i"

                },

                $or: [{
                    registrationFee: {
                        $ne: "online PAYU"
                    }
                }, {
                    paymentStatus: {
                        $ne: "Pending"
                    }
                }]
            };
        } else {
            var matchObj = {
                $or: [{
                    registrationFee: {
                        $ne: "online PAYU"
                    }
                }, {
                    paymentStatus: {
                        $ne: "Pending"
                    }
                }]
            };
        }
        if (data.keyword !== "") {
            Registration.aggregate(
                [{
                        $match: {

                            $or: [{
                                    "schoolName": {
                                        $regex: data.keyword,
                                        $options: "i"
                                    }
                                },
                                {
                                    "sfaID": data.keyword
                                }
                            ]

                        }
                    },
                    // Stage 4
                    {
                        $match: {
                            $or: [{
                                registrationFee: {
                                    $ne: "online PAYU"
                                }
                            }, {
                                paymentStatus: {
                                    $ne: "Pending"
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
                            callback(null, returnReq);
                        } else {
                            var count = returnReq.length;
                            console.log("count", count);

                            var data = {};
                            data.options = options;

                            data.results = returnReq;
                            data.total = count;
                            callback(null, returnReq);

                        }
                    }
                });
        } else {
            Registration.find(matchObj).sort({
                    createdAt: -1
                })
                // .order(options)
                // .keyword(options)
                .exec(function (err, found) {
                    // console.log("found", found);

                    if (err) {
                        callback(err, null);
                    } else if (_.isEmpty(found)) {
                        callback(null, "Data is empty");
                    } else {
                        callback(null, found);
                    }
                });
        }
    },

    generateExcel: function (data, res) {
        async.waterfall([
                function (callback) {
                    Registration.excelFilterSchool(data, function (err, complete) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(complete)) {
                                callback(null, complete);
                            } else {
                                console.log('logs', complete);
                                callback(null, complete);
                            }
                        }
                    });

                },
                function (complete, callback) {
                    var excelData = [];
                    _.each(complete, function (n) {

                        var obj = {};
                        obj.sfaID = n.sfaID;
                        obj.schoolName = n.schoolName;
                        var dateTime = moment.utc(n.createdAt).utcOffset("+05:30").format('YYYY-MM-DD HH:mm');
                        // console.log("dateTime", n.createdAt, dateTime);
                        obj.date = dateTime;
                        // if (n.registerID) {
                        //     if (n.registrationFee == "online PAYU") {
                        //         obj.receiptNo = "SFA" + n.registerID;
                        //     } else {
                        //         obj.receiptNo = "";
                        //     }
                        // } else {
                        //     obj.receiptNo = "";
                        // }
                        obj.receiptNo = "SFA" + n.receiptId;
                        obj.schoolType = n.schoolType;
                        obj.schoolCategory = n.schoolCategory;
                        obj.affiliatedBoard = n.affiliatedBoard;
                        obj.schoolLogo = n.schoolLogo;
                        obj.schoolAddress = n.schoolAddress;
                        obj.schoolAddressLine2 = n.schoolAddressLine2;
                        var teamSports = '';
                        var racquetSports = '';
                        var targetSports = '';
                        var aquaticsSports = '';
                        var combatSports = '';
                        var individualSports = '';

                        //teamSports
                        _.each(n.teamSports, function (details) {
                            teamSports += "," + details.name;
                        });
                        console.log("name", teamSports);
                        if (teamSports) {
                            teamSports = teamSports.slice(1);
                            obj.teamSports = teamSports;
                        } else {
                            obj.teamSports = "";
                        }

                        //racquetSports
                        _.each(n.racquetSports, function (details) {
                            racquetSports += "," + details.name;
                        });
                        console.log("name", racquetSports);
                        if (racquetSports) {
                            racquetSports = racquetSports.slice(1);
                            obj.racquetSports = racquetSports;
                        } else {
                            obj.racquetSports = "";
                        }
                        //aquaticsSports
                        _.each(n.aquaticsSports, function (details) {
                            aquaticsSports += "," + details.name;
                        });
                        console.log("name", aquaticsSports);
                        if (aquaticsSports) {
                            aquaticsSports = aquaticsSports.slice(1);
                            obj.aquaticsSports = aquaticsSports;
                        } else {
                            obj.aquaticsSports = "";
                        }

                        //combatSports
                        _.each(n.combatSports, function (details) {
                            combatSports += "," + details.name;
                        });
                        console.log("name", combatSports);
                        if (combatSports) {
                            combatSports = combatSports.slice(1);
                            obj.combatSports = combatSports;
                        } else {
                            obj.combatSports = "";
                        }

                        //targetSports
                        _.each(n.targetSports, function (details) {
                            targetSports += "," + details.name;
                        });
                        console.log("name", targetSports);
                        if (targetSports) {
                            targetSports = targetSports.slice(1);
                            obj.targetSports = targetSports;
                        } else {
                            obj.targetSports = "";
                        }

                        //individualSports
                        _.each(n.individualSports, function (details) {
                            individualSports += "," + details.name;
                        });
                        console.log("name", individualSports);
                        if (individualSports) {
                            individualSports = individualSports.slice(1);
                            obj.individualSports = individualSports;
                        } else {
                            obj.individualSports = "";
                        }
                        var sportsInfo;
                        var count = 0;
                        _.each(n.sportsDepartment, function (details) {
                            var name = details.name;
                            var email = details.email;
                            var mobile = details.mobile;
                            var designation = details.designation;
                            if (count === 0) {
                                sportsInfo = "{ Name:" + name + "," + "Designation:" + designation + "," + "Email:" + email + "," + "Mobile:" + mobile + "}";
                            } else {
                                sportsInfo = sportsInfo + "{ Name:" + name + "," + "Designation:" + designation + "," + "Email:" + email + "," + "Mobile:" + mobile + "}";
                            }
                            count++;

                            console.log("sportsInfo", sportsInfo);

                        });
                        obj.sportsDepartment = sportsInfo;
                        obj.state = n.state;
                        obj.district = n.district;
                        obj.city = n.city;
                        obj.locality = n.locality;
                        obj.pinCode = n.pinCode;
                        obj.contactPerson = n.contactPerson;
                        obj.landline = n.landline;
                        obj.email = n.email;
                        obj.website = n.website;
                        obj.mobile = n.mobile;
                        obj.enterOTP = n.enterOTP;
                        obj.schoolPrincipalName = n.schoolPrincipalName;
                        obj.schoolPrincipalMobile = n.schoolPrincipalMobile;
                        obj.schoolPrincipalLandline = n.schoolPrincipalLandline;
                        obj.schoolPrincipalEmail = n.schoolPrincipalEmail;
                        obj.status = n.status;
                        obj.password = n.password;
                        obj.year = n.year;
                        obj.registrationFee = n.registrationFee;
                        obj.paymentStatus = n.paymentStatus;
                        obj.transactionID = n.transactionID;
                        obj.remarks = n.remarks;
                        if (n.panNo) {
                            obj.panNo = n.panNo;
                        } else {
                            obj.panNo = "";
                        }
                        if (n.gstNo) {
                            obj.gstNo = n.gstNo;
                        } else {
                            obj.gstNo = "";
                        }
                        if (n.utm_medium) {
                            obj.utm_medium = n.utm_medium;
                        } else {
                            obj.utm_medium = "";
                        }

                        if (n.utm_campaign) {
                            obj.utm_campaign = n.utm_campaign;
                        } else {
                            obj.utm_campaign = "";
                        }
                        if (n.utm_source) {
                            obj.utm_source = n.utm_source;
                        } else {
                            obj.utm_source = "";
                        }
                        excelData.push(obj);

                    });
                    Config.generateExcel("Registration", excelData, res);
                }
            ],
            function (err, data2) {
                if (err) {
                    console.log(err);
                    callback(null, []);
                } else if (data2) {
                    if (_.isEmpty(data2)) {
                        callback(null, []);
                    } else {
                        callback(null, data2);
                    }
                }
            });
    },

    generateExcelOld: function (res) {
        console.log("dataIN");
        var matchObj = {
            $or: [{
                registrationFee: {
                    $ne: "online PAYU"
                }
            }, {
                paymentStatus: {
                    $ne: "Pending"
                }
            }]
        };
        Registration.find(matchObj).sort({
            createdAt: -1
        }).lean().exec(function (err, data) {
            var excelData = [];
            _.each(data, function (n) {

                var obj = {};
                obj.sfaID = n.sfaID;
                obj.schoolName = n.schoolName;
                var dateTime = moment.utc(n.createdAt).utcOffset("+05:30").format('YYYY-MM-DD HH:mm');
                // console.log("dateTime", n.createdAt, dateTime);
                obj.date = dateTime;
                obj.schoolType = n.schoolType;
                obj.schoolCategory = n.schoolCategory;
                obj.affiliatedBoard = n.affiliatedBoard;
                obj.schoolLogo = n.schoolLogo;
                obj.schoolAddress = n.schoolAddress;
                obj.schoolAddressLine2 = n.schoolAddressLine2;
                var teamSports = '';
                var racquetSports = '';
                var targetSports = '';
                var aquaticsSports = '';
                var combatSports = '';
                var individualSports = '';

                //teamSports
                _.each(n.teamSports, function (details) {
                    teamSports += "," + details.name;
                });
                console.log("name", teamSports);
                if (teamSports) {
                    teamSports = teamSports.slice(1);
                    obj.teamSports = teamSports;
                } else {
                    obj.teamSports = "";
                }

                //racquetSports
                _.each(n.racquetSports, function (details) {
                    racquetSports += "," + details.name;
                });
                console.log("name", racquetSports);
                if (racquetSports) {
                    racquetSports = racquetSports.slice(1);
                    obj.racquetSports = racquetSports;
                } else {
                    obj.racquetSports = "";
                }
                //aquaticsSports
                _.each(n.aquaticsSports, function (details) {
                    aquaticsSports += "," + details.name;
                });
                console.log("name", aquaticsSports);
                if (aquaticsSports) {
                    aquaticsSports = aquaticsSports.slice(1);
                    obj.aquaticsSports = aquaticsSports;
                } else {
                    obj.aquaticsSports = "";
                }

                //combatSports
                _.each(n.combatSports, function (details) {
                    combatSports += "," + details.name;
                });
                console.log("name", combatSports);
                if (combatSports) {
                    combatSports = combatSports.slice(1);
                    obj.combatSports = combatSports;
                } else {
                    obj.combatSports = "";
                }

                //targetSports
                _.each(n.targetSports, function (details) {
                    targetSports += "," + details.name;
                });
                console.log("name", targetSports);
                if (targetSports) {
                    targetSports = targetSports.slice(1);
                    obj.targetSports = targetSports;
                } else {
                    obj.targetSports = "";
                }

                //individualSports
                _.each(n.individualSports, function (details) {
                    individualSports += "," + details.name;
                });
                console.log("name", individualSports);
                if (individualSports) {
                    individualSports = individualSports.slice(1);
                    obj.individualSports = individualSports;
                } else {
                    obj.individualSports = "";
                }
                var sportsInfo;
                var count = 0;
                _.each(n.sportsDepartment, function (details) {
                    var name = details.name;
                    var email = details.email;
                    var mobile = details.mobile;
                    var designation = details.designation;
                    if (count === 0) {
                        sportsInfo = "{ Name:" + name + "," + "Designation:" + designation + "," + "Email:" + email + "," + "Mobile:" + mobile + "}";
                        count++;
                    } else {
                        sportsInfo = sportsInfo + "{ Name:" + name + "," + "Designation:" + designation + "," + "Email:" + email + "," + "Mobile:" + mobile + "}";
                    }
                });
                console.log("sportsInfo", sportsInfo);
                obj.sportsDepartment = sportsInfo;
                obj.state = n.state;
                obj.district = n.district;
                obj.city = n.city;
                obj.locality = n.locality;
                obj.pinCode = n.pinCode;
                obj.contactPerson = n.contactPerson;
                obj.landline = n.landline;
                obj.email = n.email;
                obj.website = n.website;
                obj.mobile = n.mobile;
                obj.enterOTP = n.enterOTP;
                obj.schoolPrincipalName = n.schoolPrincipalName;
                obj.schoolPrincipalMobile = n.schoolPrincipalMobile;
                obj.schoolPrincipalLandline = n.schoolPrincipalLandline;
                obj.schoolPrincipalEmail = n.schoolPrincipalEmail;
                obj.status = n.status;
                obj.password = n.password;
                obj.year = n.year;
                obj.registrationFee = n.registrationFee;
                obj.paymentStatus = n.paymentStatus;
                obj.transactionID = n.transactionID;
                obj.remarks = n.remarks;
                if (n.panNo) {
                    obj.panNo = n.panNo;
                } else {
                    obj.panNo = "";
                }
                if (n.gstNo) {
                    obj.gstNo = n.gstNo;
                } else {
                    obj.gstNo = "";
                }
                if (n.utm_medium) {
                    obj.utm_medium = n.utm_medium;
                } else {
                    obj.utm_medium = "";
                }

                if (n.utm_campaign) {
                    obj.utm_campaign = n.utm_campaign;
                } else {
                    obj.utm_campaign = "";
                }
                if (n.utm_source) {
                    obj.utm_source = n.utm_source;
                } else {
                    obj.utm_source = "";
                }
                excelData.push(obj);

            });
            Config.generateExcelOld("Registration", excelData, res);
        });
    },

    filterSchool: function (data, callback) {
        var maxRow = Config.maxRow;
        console.log(data);
        var page = 1;
        if (data.page) {
            page = data.page;
        }
        var field = data.field;
        var options = {
            field: data.field,
            filters: {
                keyword: {
                    fields: ['schoolName', 'sfaID'],
                    term: data.keyword
                }
            },
            sort: {
                desc: 'createdAt'
            },
            start: (page - 1) * maxRow,
            count: maxRow
        };
        var matchObj = {
            $or: [{
                registrationFee: {
                    $ne: "online PAYU"
                }
            }, {
                paymentStatus: {
                    $ne: "Pending"
                }
            }],
        };
        if (data.type == "Date") {

            var endOfDay = moment(data.endDate).endOf("day").toDate();
            matchObj.createdAt = {
                $gt: data.startDate,
                $lt: endOfDay,
            };
        } else if (data.type == "SFA-ID") {
            matchObj = {
                sfaID: {
                    $regex: data.input,
                    $options: "i"
                },
                $or: [{
                    registrationFee: {
                        $ne: "online PAYU"
                    }
                }, {
                    paymentStatus: {
                        $ne: "Pending"
                    }
                }]
            };
        } else if (data.type == "UTM_Source") {
            matchObj = {
                utm_source: {
                    $regex: data.input,
                    $options: "i"
                },
                $or: [{
                    registrationFee: {
                        $ne: "online PAYU"
                    }
                }, {
                    paymentStatus: {
                        $ne: "Pending"
                    }
                }]
            };
        } else if (data.type == "UTM_Campaign") {
            matchObj = {
                utm_campaign: {
                    $regex: data.input,
                    $options: "i"
                },
                $or: [{
                    registrationFee: {
                        $ne: "online PAYU"
                    }
                }, {
                    paymentStatus: {
                        $ne: "Pending"
                    }
                }]
            };
        } else if (data.type == "UTM_Medium") {
            matchObj = {
                utm_medium: {
                    $regex: data.input,
                    $options: "i"
                },
                $or: [{
                    registrationFee: {
                        $ne: "online PAYU"
                    }
                }, {
                    paymentStatus: {
                        $ne: "Pending"
                    }
                }]
            };
        } else if (data.type == "School Name") {
            matchObj = {
                'schoolName': {
                    $regex: data.input,
                    $options: "i"
                },
                $or: [{
                    registrationFee: {
                        $ne: "online PAYU"
                    }
                }, {
                    paymentStatus: {
                        $ne: "Pending"
                    }
                }]

            };
        } else if (data.type == "Payment Mode") {
            if (data.input == "cash" || data.input == "Cash") {
                matchObj = {
                    'registrationFee': "cash",
                };
            } else if (data.input == "online" || data.input == "Online") {
                matchObj = {
                    'registrationFee': "online PAYU",
                    paymentStatus: {
                        $ne: "Pending"
                    }
                };

            }
            //-----------for sponsored---------
            else if (data.input == "sponsor" || data.input == "Sponsor") {
                matchObj = {
                    'registrationFee': "Sponsor",
                    paymentStatus: {
                        $ne: "Pending"
                    }
                };

            }
            //-----------for sponsored---------
        } else if (data.type == "Payment Status") {
            if (data.input == "Paid" || data.input == "paid") {
                matchObj = {
                    'paymentStatus': "Paid",
                };
            } else if (data.input == "Pending" || data.input == "pending") {
                matchObj = {
                    'paymentStatus': "Pending",
                    registrationFee: {
                        $ne: "online PAYU"
                    }
                };
            }

        } else if (data.type == "Verified Status") {
            matchObj = {
                'status': {
                    $regex: data.input,
                    $options: "i"

                },

                $or: [{
                    registrationFee: {
                        $ne: "online PAYU"
                    }
                }, {
                    paymentStatus: {
                        $ne: "Pending"
                    }
                }]
            };
        } else {
            var matchObj = {
                $or: [{
                    registrationFee: {
                        $ne: "online PAYU"
                    }
                }, {
                    paymentStatus: {
                        $ne: "Pending"
                    }
                }]
            };
        }
        if (data.keyword !== "") {
            Registration.aggregate(
                [{
                        $match: {

                            $or: [{
                                    "schoolName": {
                                        $regex: data.keyword,
                                        $options: "i"
                                    }
                                },
                                {
                                    "sfaID": data.keyword
                                }
                            ]

                        }
                    },
                    // Stage 4
                    {
                        $match: {
                            $or: [{
                                registrationFee: {
                                    $ne: "online PAYU"
                                }
                            }, {
                                paymentStatus: {
                                    $ne: "Pending"
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
        } else {
            Registration.find(matchObj)
                .order(options)
                .keyword(options)
                .page(options, function (err, found) {
                    // console.log("found", found);

                    if (err) {
                        callback(err, null);
                    } else if (_.isEmpty(found)) {
                        callback(null, "Data is empty");
                    } else {
                        callback(null, found);
                    }
                });
        }
    },

    cronSchoolWithPaymentDue: function (data, callback) {
        Registration.find({
            paymentStatus: "Pending"
        }).exec(function (err, found) {
            if (err) {
                callback(err, null);
            } else if (_.isEmpty(found)) {
                callback(null, "Data is empty");
            } else {
                // callback(null, found);
                async.each(found, function (data, callback) {
                    Accounts.findOne({
                        athlete: data1._id
                    }).lean().deepPopulate("transaction transaction.package").exec(function (err, accountsData) {
                        if (err || _.isEmpty(accountsData)) {
                            callback(null, "no accounts data");
                        } else {
                            if (found.registrationFee != "cash") {
                                console.log("data to show");
                                var now = moment(new Date()); //todays date
                                var end = moment(data.createdAt); // another date
                                var duration = moment.duration(now.diff(end));
                                var dump = duration.asDays();
                                var days = parseInt(dump);
                                console.log("days", days);
                                if (days == 5) {
                                    var emailData = {};
                                    // emailData.from = "info@sfanow.in";
                                    if (accountsData.upgrade) {
                                        emailData.upgrade = accountsData.upgrade;
                                    } else {
                                        emailData.upgrade = false;
                                    }
                                    emailData.player = false;
                                    emailData.from = data.property.infoId;
                                    emailData.infoId = data.property.infoId;
                                    emailData.infoNo = data.property.infoNo;
                                    emailData.infoNoArr = data.property.infoNoArr;
                                    emailData.cityAddress = data.property.cityAddress;
                                    emailData.ddFavour = data.property.ddFavour;
                                    emailData.email = data.email;
                                    emailData.city = data.property.sfaCity;
                                    emailData.year = data.property.year;
                                    emailData.eventYear = data.property.eventYear;
                                    emailData.type = data.property.institutionType;
                                    emailData.schoolAmount = data.property.totalAmountType;
                                    emailData.filename = "e-reminders/paymentRegistration.ejs";
                                    emailData.subject = "SFA: Your Payment Reminder for SFA " + emailData.city + " " + emailData.eventYear;
                                    console.log("emaildata", emailData);

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

                                } else if (days == 10) {
                                    var emailData = {};
                                    // emailData.from = "info@sfanow.in";
                                    if (accountsData.upgrade) {
                                        emailData.upgrade = accountsData.upgrade;
                                    } else {
                                        emailData.upgrade = false;
                                    }
                                    emailData.player = false;
                                    emailData.from = data.property.infoId;
                                    emailData.infoId = data.property.infoId;
                                    emailData.infoNo = data.property.infoNo;
                                    emailData.infoNoArr = data.property.infoNoArr;
                                    emailData.cityAddress = data.property.cityAddress;
                                    emailData.ddFavour = data.property.ddFavour;
                                    emailData.email = data.email;
                                    emailData.city = data.property.sfaCity;
                                    emailData.year = data.property.year;
                                    emailData.eventYear = data.property.eventYear;
                                    emailData.type = data.property.institutionType;
                                    emailData.schoolAmount = data.property.totalAmountType;
                                    emailData.filename = "e-reminders/paymentRegistration.ejs";
                                    emailData.subject = "SFA: Your Payment Reminder for SFA " + emailData.city + " " + emailData.eventYear;
                                    console.log("emaildata", emailData);
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

                                } else {
                                    callback(null, "no School found");
                                }
                            } else {
                                console.log("hidden School found");
                                callback(null, "hidden School found");
                            }
                        }
                    });
                }, callback);


            }
        });

    },

    updateSchoolContactDetails: function (data, callback) {
        Registration.find({}).lean().exec(function (err, found) {
            if (err) {
                callback(err, null);
            } else if (_.isEmpty(found)) {
                callback(null, 'No data found');

            } else {
                async.concatLimit(found, 10, function (key, callback) {
                    key.mobile = data.mobile;
                    key.email = data.email;
                    key.landline = data.landline;
                    Registration.saveData(key, function (err, res) {
                        if (err) {
                            callback(err, 'no data found');
                        } else {
                            if (_.isEmpty(res)) {
                                callback(null, "No data found");
                            } else {
                                callback(null, res);
                            }
                        }
                    });

                }, function (err, res) {
                    console.log("Finished");
                    if (err) {
                        callback(err, null);
                    } else {
                        callback(null, res);
                    }
                });
            }
        });
    },

    getSchoolPayuStatus: function (data, callback) {
        var maxRow = Config.maxRow;
        console.log(data);
        var page = 1;
        if (data.page) {
            page = data.page;
        }
        var field = data.field;
        var options = {
            field: data.field,
            filters: {
                keyword: {
                    fields: ['schoolName', 'sfaID'],
                    term: data.keyword
                }
            },
            sort: {
                desc: 'createdAt'
            },
            start: (page - 1) * maxRow,
            count: maxRow
        };
        var matchObj = {
            $and: [{
                registrationFee: {
                    $eq: "online PAYU"
                }
            }, {
                paymentStatus: {
                    $eq: "Pending"
                }
            }],
        };
        if (data.type == "Date") {

            var endOfDay = moment(data.endDate).endOf("day").toDate();
            matchObj.createdAt = {
                $gt: data.startDate,
                $lt: endOfDay,
            };
        } else if (data.type == "SFA-ID") {
            matchObj = {
                sfaID: {
                    $regex: data.input,
                    $options: "i"
                },
                $and: [{
                    registrationFee: {
                        $eq: "online PAYU"
                    }
                }, {
                    paymentStatus: {
                        $eq: "Pending"
                    }
                }]
            };
        } else if (data.type == "UTM_Source") {
            matchObj = {
                utm_source: {
                    $regex: data.input,
                    $options: "i"
                },
                $and: [{
                    registrationFee: {
                        $eq: "online PAYU"
                    }
                }, {
                    paymentStatus: {
                        $eq: "Pending"
                    }
                }]
            };
        } else if (data.type == "UTM_Campaign") {
            matchObj = {
                utm_campaign: {
                    $regex: data.input,
                    $options: "i"
                },
                $and: [{
                    registrationFee: {
                        $eq: "online PAYU"
                    }
                }, {
                    paymentStatus: {
                        $eq: "Pending"
                    }
                }]
            };
        } else if (data.type == "UTM_Medium") {
            matchObj = {
                utm_medium: {
                    $regex: data.input,
                    $options: "i"
                },
                $and: [{
                    registrationFee: {
                        $eq: "online PAYU"
                    }
                }, {
                    paymentStatus: {
                        $eq: "Pending"
                    }
                }]
            };
        } else if (data.type == "School Name") {
            matchObj = {
                'schoolName': {
                    $regex: data.input,
                    $options: "i"
                },
                $and: [{
                    registrationFee: {
                        $eq: "online PAYU"
                    }
                }, {
                    paymentStatus: {
                        $eq: "Pending"
                    }
                }]

            };
        } else if (data.type == "Payment Mode") {
            if (data.input == "cash" || data.input == "Cash") {
                matchObj = {
                    'registrationFee': "cash",
                };
            } else if (data.input == "online" || data.input == "Online") {
                matchObj = {
                    'registrationFee': "online PAYU",
                    paymentStatus: {
                        $eq: "Pending"
                    }
                };

            }
            //-----------for sponsored---------
            else if (data.input == "sponsor" || data.input == "Sponsor") {
                matchObj = {
                    'registrationFee': "Sponsor",
                    paymentStatus: {
                        $eq: "Pending"
                    }
                };

            }
            //-----------for sponsored---------
        } else if (data.type == "Payment Status") {
            if (data.input == "Paid" || data.input == "paid") {
                matchObj = {
                    'paymentStatus': "Paid",
                };
            } else if (data.input == "Pending" || data.input == "pending") {
                matchObj = {
                    'paymentStatus': "Pending",
                    registrationFee: {
                        $eq: "online PAYU"
                    }
                };
            }

        } else if (data.type == "Verified Status") {
            matchObj = {
                'status': {
                    $regex: data.input,
                    $options: "i"

                },

                $and: [{
                    registrationFee: {
                        $eq: "online PAYU"
                    }
                }, {
                    paymentStatus: {
                        $eq: "Pending"
                    }
                }]
            };
        } else {
            var matchObj = {
                $and: [{
                    registrationFee: {
                        $eq: "online PAYU"
                    }
                }, {
                    paymentStatus: {
                        $eq: "Pending"
                    }
                }]
            };
        }
        if (data.keyword !== "") {
            Registration.aggregate(
                [{
                        $match: {

                            $or: [{
                                    "schoolName": {
                                        $regex: data.keyword,
                                        $options: "i"
                                    }
                                },
                                {
                                    "sfaID": data.keyword
                                }
                            ]

                        }
                    },
                    // Stage 4
                    {
                        $match: {
                            $and: [{
                                registrationFee: {
                                    $eq: "online PAYU"
                                }
                            }, {
                                paymentStatus: {
                                    $eq: "Pending"
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
        } else {
            Registration.find(matchObj)
                .order(options)
                .keyword(options)
                .page(options, function (err, found) {
                    if (err) {
                        callback(err, null);
                    } else if (_.isEmpty(found)) {
                        callback(null, "Data is empty");
                    } else {
                        callback(null, found);
                    }
                });
        }
    },

    getOTP: function (data, callback) {
        var otp = '';
        async.waterfall([
            function (callback) {
                otp = Athelete.generateOtp();
                console.log("otp", otp);
                callback();
            },
            // send OTP on Mobile
            function (callback) {
                if (data.mobile) {
                    console.log("OTP Sent On Mobile ");
                    var mobileObj = {
                        "otp": otp,
                        "mobile": data.mobile,
                        "content": "OTP Athlete: Your Mobile OTP (One time Password) for SFA registration is "
                    };
                    console.log("mobileObj", mobileObj);
                    //uncomment this function 
                    Athelete.sendOTPMobile(mobileObj, callback);
                    // callback(null, "Move Ahead");
                } else {
                    callback(null, "Move Ahead");
                }
            },
            // send OTP on email
            function (res, callback) {
                if (data.email) {
                    console.log("second fun", res);
                    console.log("OTP Sent On Email");
                    var emailObj = {
                        "otp": otp,
                        "mobile": data.mobile,
                        "content": "OTP Athlete: Your Email OTP (One time Password) for SFA registration is ",
                        "from": "info@sfanow.in",
                        "filename": "e-player-school/emailOtp.ejs",
                        "subject": "SFA: Your Email OTP (One time Password) for SFA registration is",
                    };
                    ConfigProperty.find().lean().exec(function (err, property) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(property)) {
                                callback(null, []);
                            } else {
                                emailObj.sfaid = data.sfaId;
                                emailObj.email = data.email;
                                emailObj.city = property[0].sfaCity;
                                emailObj.year = property[0].year;
                                emailObj.eventYear = property[0].eventYear;
                                emailData.infoNo = property[0].infoNo;
                                emailData.infoNoArr = property[0].infoNoArr;
                                emailObj.cityAddress = property[0].cityAddress;
                                emailObj.ddFavour = property[0].ddFavour;
                                Config.email(emailObj, callback);

                            }
                        }
                    });
                } else {
                    callback(null, "Move Ahead");
                }
            },
            // send final Obj
            function (resp, callback) {
                if (data.email && data.mobile) {
                    var sendObj = {
                        "sfaId": data.sfaId,
                        "mobile": data.mobile,
                        "email": data.email,
                        "otp": otp
                    };
                } else if (data.email) {
                    var sendObj = {
                        "sfaId": data.sfaId,
                        "email": data.email,
                        "otp": otp
                    };
                } else if (data.mobile) {
                    var sendObj = {
                        "sfaId": data.sfaId,
                        "mobile": data.mobile,
                        "otp": otp
                    };
                } else {
                    var sendObj = {
                        "sfaId": data.sfaId,
                        "otp": otp
                    };
                }
                // var sendObj = {
                //     "sfaId": data.sfaId,
                //     "mobile": data.mobile,
                //     "email": data.email,
                //     "otp": otp

                // };
                callback(null, sendObj);
            }
        ], callback);

    },

    getOneBySfaId: function (data, callback) {
        Registration.findOne({ //finds one with refrence to id
            sfaID: data.sfaID
        }).exec(function (err, athleteInfo) {
            if (err) {
                callback(err, null);
            } else if (_.isEmpty(athleteInfo)) {
                callback("Data is empty", null);
            } else {
                callback(null, "data found");
            }
        });
    },

    getOneBySfaIdStatus: function (data, callback) {
        Registration.findOne({ //finds one with refrence to id
            sfaID: data.sfaID,
            $or: [{
                registrationFee: {
                    $ne: "online PAYU"
                }
            }, {
                paymentStatus: {
                    $ne: "Pending"
                }
            }]
        }).exec(function (err, athleteInfo) {
            if (err) {
                callback(err, null);
            } else if (_.isEmpty(athleteInfo)) {
                callback("Data is empty", null);
            } else {
                callback(null, "data found");
            }
        });
    },
};
module.exports = _.assign(module.exports, exports, model);