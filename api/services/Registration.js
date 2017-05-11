var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate')(mongoose);
var uniqueValidator = require('mongoose-unique-validator');
var timestamps = require('mongoose-timestamp');
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
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);

schema.plugin(autoIncrement.plugin, {
    model: 'Registration',
    field: 'registerID',
    startAt: 1,
    incrementBy: 1
});
schema.plugin(timestamps);
module.exports = mongoose.model('Registration', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {

    saveRegistrationForm: function (data, callback) {
        //auto password generator

        console.log("data", data);
        data.year = new Date().getFullYear();

        Registration.saveData(data, function (err, registerData) {
            console.log("registerData", registerData);
            if (err) {
                console.log("err", err);
                callback("There was an error while saving data", null);
            } else {
                if (_.isEmpty(registerData)) {
                    callback("No register data found", null);
                } else {
                    if (registerData.registrationFee == "online PAYU") {
                        PayU.schoolPayment(data, function (err, found) {
                            if (err) {
                                callback(err, null);
                            } else {
                                if (_.isEmpty(found)) {
                                    callback(null, "Data not found");
                                } else {
                                    Registration.onlinePaymentMailSms(data, function (err, mailsms) {
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
                            }

                        });
                    } else if (registerData.registrationFee == "Cash" && registerData.registrationFee == "Cheque/DD") {
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
            }
        });
    },
    //on backend save click (update)
    generateSfaID: function (data, callback) {
        console.log("inside");
        var schoolname = data.schoolname;
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
                    console.log("regiserid", schoolData.registerID);
                    if (data.status == "Verified") {
                        data.password = generator.generate({
                            length: 10,
                            numbers: true
                        });
                        if (_.isEmpty(data.sfaID)) {
                            var year = new Date().getFullYear().toString().substr(2, 2);

                            console.log("City", city);
                            if (_.isEmpty(schoolData.city)) {
                                schoolData.city = "Mumbai"
                            }
                            var city = schoolData.city;
                            var prefixCity = city.charAt(0);
                            console.log("prefixCity", prefixCity);
                            var register = schoolData.registerID; //increment with previous refrence
                            data.sfaID = "M" + "S" + year + register; // prefix "S" for school
                        }

                    }
                    console.log("data", data);
                    Registration.saveData(data, function (err, registerData) {
                        console.log("Registration", registerData);
                        if (err) {
                            console.log("err", err);
                            callback("There was an error while saving order", null);
                        } else {
                            if (_.isEmpty(registerData)) {
                                callback("No order data found", null);
                            } else {
                                if (data.status == "Verified") {
                                    // async.parallel([
                                    //         function (callback) {
                                    Registration.successVerifiedMailSms(data, function (err, vData) {
                                        if (err) {
                                            callback(err, null);
                                        } else if (vData) {
                                            callback(null, vData);
                                        }
                                    });
                                    //     },
                                    //     function (callback) {
                                    //         // School.find({

                                    //         // });

                                    //     }
                                    // ],
                                    // function (err, data2) {
                                    //     if (err) {
                                    //         console.log(err);
                                    //         callback(null, []);
                                    //     } else if (data2) {
                                    //         if (_.isEmpty(data2)) {
                                    //             callback(null, []);
                                    //         } else {
                                    //             callback(null, data2);
                                    //         }
                                    //     }
                                    // });

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

                            }
                        }
                    });
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
        var mobileOtp = (Math.random() + "").substring(2, 6);
        var smsData = {};
        console.log("mobileOtp", mobileOtp);
        smsData.mobile = data.mobile;

        smsData.content = "OTP School:Your Mobile OTP (One time Password) for SFA registration is " + mobileOtp;
        console.log("smsdata", smsData);
        Config.sendSms(smsData, function (err, smsRespo) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else if (smsRespo) {
                console.log(smsRespo, "sms sent");
                callback(null, mobileOtp);
            } else {
                callback(null, "Invalid data");
            }
        });
    },

    updatePaymentStatus: function (data, callback) {
        var matchObj = {
            $set: {
                paymentStatus: "Paid"
            }
        }
        Registration.update({
            _id: data._id
        }, matchObj).exec(
            function (err, data3) {
                if (err) {
                    console.log(err);
                    callback(err, null);
                } else if (data3) {
                    console.log("data3", data3);
                    callback(null, data3);
                }
            });
    },

    onlinePaymentMailSms: function (data, callback) {
        async.parallel([
                function (callback) {
                    var emailOtp = (Math.random() + "").substring(2, 6);

                    var emailData = {};
                    emailData.from = "info@sfanow.in";
                    emailData.email = data.email;
                    emailData.filename = "schoolOnlinePayment.ejs";
                    emailData.subject = "SFA: Thank you for registering for SFA Mumbai 2017";
                    console.log("emaildata", emailData);

                    Config.email(emailData, function (err, emailRespo) {
                        if (err) {
                            console.log(err);
                            callback(null, err);
                        } else if (emailRespo) {
                            //callback(null, emailRespo);
                        } else {
                            //callback(null, "Invalid data");
                        }
                    });
                },
                function (callback) {

                    var smsData = {};
                    console.log("mobileOtp", mobileOtp);
                    smsData.mobile = data.mobile;

                    smsData.content = "Thank you for registering for SFA Mumbai 2017. For further details please check your registered email ID.";
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
    },

    cashPaymentMailSms: function (data, callback) {
        async.parallel([
                function (callback) {

                    var emailData = {};
                    emailData.from = "info@sfanow.in";
                    emailData.email = data.email;
                    emailData.filename = "schoolCashPayment.ejs";
                    emailData.subject = "SFA: Thank you for registering for SFA Mumbai 2017";
                    console.log("emaildata", emailData);

                    Config.email(emailData, function (err, emailRespo) {
                        if (err) {
                            console.log(err);
                            callback(null, err);
                        } else if (emailRespo) {
                            //callback(null, emailRespo);
                        } else {
                            //callback(null, "Invalid data");
                        }
                    });
                },
                function (callback) {

                    var smsData = {};
                    console.log("mobileOtp", mobileOtp);
                    smsData.mobile = data.mobile;

                    smsData.content = "Thank you for registering for SFA Mumbai 2017. For further details please check your registered email ID.";
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
    },

    successVerifiedMailSms: function (data, callback) {
        async.parallel([
                function (callback) {
                    var emailData = {};
                    emailData.from = "info@sfanow.in";
                    emailData.email = data.email;
                    emailData.sfaID = data.sfaID;
                    emailData.password = data.password;
                    emailData.filename = "successVerification.ejs";
                    emailData.subject = "SFA: You are now a verified School for SFA Mumbai 2017";
                    console.log("emaildata", emailData);

                    Config.email(emailData, function (err, emailRespo) {
                        if (err) {
                            console.log(err);
                            callback(null, err);
                        } else if (emailRespo) {
                            //callback(null, emailRespo);
                        } else {
                            //callback(null, "Invalid data");
                        }
                    });
                },
                function (callback) {

                    var smsData = {};
                    console.log("mobileOtp", mobileOtp);
                    smsData.mobile = data.mobile;

                    smsData.content = "Congratulations! You are now a verified SFA Athlete. Kindly check your registered Email ID for your SFA ID and Password.";
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
    },

    failureVerifiedMailSms: function (data, callback) {
        async.parallel([
                function (callback) {
                    var emailData = {};
                    emailData.from = "info@sfanow.in";
                    emailData.email = data.email;
                    emailData.sfaID = data.sfaID;
                    emailData.password = data.password;
                    emailData.filename = "rejection.ejs";
                    emailData.subject = "SFA: Rejection of Your Application for SFA Mumbai 2017";
                    console.log("emaildata", emailData);

                    Config.email(emailData, function (err, emailRespo) {
                        if (err) {
                            console.log(err);
                            callback(null, err);
                        } else if (emailRespo) {
                            //callback(null, emailRespo);
                        } else {
                            //callback(null, "Invalid data");
                        }
                    });
                },
                function (callback) {

                    var smsData = {};
                    console.log("mobileOtp", mobileOtp);
                    smsData.mobile = data.mobile;

                    smsData.content = "We regret to inform you that your application has been rejected for SFA Mumbai 2017. For further queries please email us at info@sfanow.in";
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
    },


};
module.exports = _.assign(module.exports, exports, model);