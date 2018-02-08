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
    landline: String,
    email: String,
    website: String,
    mobile: String,
    enterOTP: String,


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

schema.plugin(deepPopulate, {});
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
                Registration.saveData(data, function (err, registerData) {
                    console.log("registerData", registerData);
                    if (err) {
                        console.log("err", err);
                        callback("There was an error while saving data", null);
                    } else {
                        if (_.isEmpty(registerData)) {
                            callback("No register data found", null);
                        } else {
                            callback(null, registerData);
                        }
                    }
                });
            },
            function (registerData, callback) {
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
                                    data.password = generator.generate({
                                        length: 8,
                                        numbers: true
                                    });
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
                                    async.waterfall([
                                        function (callback) {
                                            Registration.findOne({
                                                _id: schoolData._id
                                            }).lean().exec(function (err, school) {
                                                if (err) {
                                                    console.log("err", err);
                                                    callback("No school Found!", null);
                                                } else {
                                                    var schoolSfa = school.sfaID;
                                                    console.log("schoolSfa", schoolSfa);
                                                    callback(null, schoolSfa);
                                                }
                                            });
                                            // callback(null, "schoolSfa");
                                        },
                                        // callback(null, vData);
                                        function (schoolSfa, callback) {
                                            School.findOne({ //to check registration exist and if it exist retrive previous data
                                                sfaid: schoolSfa
                                            }).sort({
                                                createdAt: -1
                                            }).lean().exec(function (err, replica) {
                                                console.log("replica", replica); // retrives registration data
                                                if (err) {
                                                    console.log(err);
                                                    callback(err, null);
                                                } else {
                                                    if (_.isEmpty(replica)) {
                                                        console.log("isempty");
                                                        callback(null, "No data found");
                                                    } else {
                                                        Athelete.aggregate([{
                                                            $match: {
                                                                $or: [{
                                                                    school: replica._id
                                                                }, {
                                                                    $or: [{
                                                                        atheleteSchoolName: replica.name
                                                                    }]
                                                                }]
                                                            }
                                                        }],
                                                            function (err, found) {
                                                                console.log("found athelete", found);
                                                                if (err) {
                                                                    console.log(err);
                                                                    callback(err, null);
                                                                } else if (found) {
                                                                    if (_.isEmpty(found)) {
                                                                        callback(null, "No data found");
                                                                    } else {
                                                                        async.each(found, function (data, callback) {
                                                                            Registration.allAtheleteMailSms(data, function (err, vData) {
                                                                                if (err) {
                                                                                    callback(err, null);
                                                                                } else if (vData) {
                                                                                    callback(null, vData);
                                                                                }
                                                                            });
                                                                        }, function (err, data4) {
                                                                            if (err) {
                                                                                console.log(err);
                                                                                callback(err, null);
                                                                            } else {
                                                                                callback(null, "Successfully removed!");
                                                                            }
                                                                        });


                                                                    }

                                                                }
                                                            });

                                                    }
                                                }
                                            });
                                        }
                                    ], function (err, finalData) {
                                        if (err) {
                                            callback(err, null);
                                        } else {
                                            callback(null, finalData);
                                        }
                                    });
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
                emailData.cityAddress = property[0].cityAddress;
                emailData.ddFavour = property[0].ddFavour;
                emailData.email = data.email;
                emailData.city = property[0].sfaCity;
                emailData.year = property[0].year;
                emailData.eventYear = property[0].eventYear;
                emailData.otp = emailOtp;
                emailData.filename = "emailOtp.ejs";
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
        var matchObj = {
            $set: {
                paymentStatus: "Paid",
                transactionID: data.transactionid
            }
        };
        Registration.findOne({ //finds one with refrence to id
            schoolName: data.schoolName
        }).exec(function (err, found) {
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
                        emailData.cityAddress = property[0].cityAddress;
                        emailData.ddFavour = property[0].ddFavour;
                        emailData.email = data.email;
                        emailData.city = property[0].sfaCity;
                        emailData.year = property[0].year;
                        emailData.eventYear = property[0].eventYear;
                        emailData.filename = "schoolOnlinePayment.ejs";
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
                        var emailData = {};
                        // emailData.from = "info@sfanow.in";
                        emailData.from = property[0].infoId;
                        emailData.infoId = property[0].infoId;
                        emailData.infoNo = property[0].infoNo;
                        emailData.cityAddress = property[0].cityAddress;
                        emailData.ddFavour = property[0].ddFavour;
                        emailData.email = data.email;
                        emailData.city = property[0].sfaCity;
                        emailData.year = property[0].year;
                        emailData.eventYear = property[0].eventYear;
                        emailData.type = property[0].institutionType;
                        emailData.amount = property[0].totalAmountType;
                        emailData.filename = "schoolCashPayment.ejs";
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
                        emailData.cityAddress = property[0].cityAddress;
                        emailData.ddFavour = property[0].ddFavour;
                        emailData.sfaID = data.sfaID;
                        emailData.password = data.password;
                        emailData.filename = "successVerification.ejs";
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
                        emailData.cityAddress = property[0].cityAddress;
                        emailData.ddFavour = property[0].ddFavour;
                        emailData.email = data.email;
                        emailData.sfaID = data.sfaID;
                        emailData.city = property[0].sfaCity;
                        emailData.year = property[0].year;
                        emailData.eventYear = property[0].eventYear;
                        emailData.type = property[0].institutionType;
                        emailData.password = data.password;
                        emailData.filename = "rejection.ejs";
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
                        emailData.cityAddress = property[0].cityAddress;
                        emailData.ddFavour = property[0].ddFavour;
                        emailData.filename = "allAthelete.ejs";
                        emailData.subject = "SFA: Your " + emailData.type + " has officially registered for SFA " + emailData.city + " " + emailData.eventYear;
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
                        smsData.content = "Congratulations! Your school has officially registered for SFA " + property[0].sfaCity + " " + property[0].eventYear + ".";
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
                async.parallel([
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
                                emailData.cgstAmout = property[0].cgstAmout;
                                emailData.cgstPercent = property[0].cgstPercent;
                                emailData.sgstAmout = property[0].sgstAmout;
                                emailData.sgstPercent = property[0].sgstPercent;
                                emailData.transactionID = found.transactionID;
                                emailData.Date = moment().format("DD-MM-YYYY");
                                emailData.igstAmout = property[0].igstAmout;
                                emailData.igstPercent = property[0].igstPercent;
                                var receipt = "SFA" + found.registerID;
                                emailData.receiptNo = receipt;
                                emailData.infoId = property[0].infoId;
                                emailData.infoNo = property[0].infoNo;
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
                    if (found.registrationFee != "online PAYU" && found.paymentStatus != "Pending") {
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
                            emailData.from = data.property.infoId;
                            emailData.infoId = data.property.infoId;
                            emailData.infoNo = data.property.infoNo;
                            emailData.cityAddress = data.property.cityAddress;
                            emailData.ddFavour = data.property.ddFavour;
                            emailData.email = data.email;
                            emailData.city = data.property.sfaCity;
                            emailData.year = data.property.year;
                            emailData.eventYear = data.property.eventYear;
                            emailData.type = data.property.institutionType;
                            emailData.schoolAmount = data.property.totalAmountType;
                            emailData.filename = "paymentReminderSchool.ejs";
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
                            emailData.from = data.property.infoId;
                            emailData.infoId = data.property.infoId;
                            emailData.infoNo = data.property.infoNo;
                            emailData.cityAddress = data.property.cityAddress;
                            emailData.ddFavour = data.property.ddFavour;
                            emailData.email = data.email;
                            emailData.city = data.property.sfaCity;
                            emailData.year = data.property.year;
                            emailData.eventYear = data.property.eventYear;
                            emailData.type = data.property.institutionType;
                            emailData.schoolAmount = data.property.totalAmountType;
                            emailData.filename = "paymentReminderSchool.ejs";
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
    }
};
module.exports = _.assign(module.exports, exports, model);