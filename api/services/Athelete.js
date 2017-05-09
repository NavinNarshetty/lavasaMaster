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
var schema = new Schema({

    atheleteID: Number,
    sfaId: String,
    status: {
        type: String,
        default: "Pending"
    },
    school: {
        type: Schema.Types.ObjectId,
        ref: 'Registration',
        index: true
    },
    year: String,
    idProof: String,

    surname: String,
    password: String,
    firstName: String,
    middleName: String,
    gender: String,
    standard: String,
    bloodGroup: String,
    photograph: String,
    dob: Date,
    age: String,
    ageProof: String,
    photoImage: String,
    birthImage: String,
    playedTournaments: {
        type: Boolean,
        default: "false"
    },
    sportLevel: [{
        level: String,
        sport: String,
    }],


    mobile: String,
    smsOTP: String,
    email: String,
    emailOTP: String,

    address: String,
    addressLine2: String,
    state: String,
    district: String,
    city: String,
    pinCode: String,

    termsAndCondition: {
        type: Boolean,
        default: "false"
    },
    parentDetails: [{
        relation: String,
        name: String,
        surname: String,
        mobile: String,
        email: String
    }],
    atheleteSchoolName: String,
    atheleteSchoolLocality: String,
    atheleteSchoolContact: String,
    atheleteSchoolIdImage: String,
    registrationFee: String,
    paymentStatus: {
        type: String,
        default: "Pending"
    },
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(autoIncrement.plugin, {
    model: 'Athelete',
    field: 'atheleteID',
    startAt: 1,
    incrementBy: 1
});
schema.plugin(timestamps);
module.exports = mongoose.model('Athelete', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {

    //on athelete save and submit press 
    saveAthelete: function (data, callback) {
        data.year = new Date().getFullYear();

        // data.status = "Pending";
        Athelete.saveData(data, function (err, athleteData) {
            console.log("athleteData", athleteData);
            if (err) {
                console.log("err", err);
                callback("There was an error while saving order", null);
            } else {
                if (_.isEmpty(athleteData)) {
                    callback("No order data found", null);
                } else {
                    if (athleteData.atheleteSchoolName) {
                        var schoolData = {};
                        schoolData.name = athleteData.atheleteSchoolName;
                        schoolData.locality = athleteData.atheleteSchoolLocality;
                        schoolData.schoolLogo = athleteData.atheleteSchoolIdImage;
                        schoolData.mobile = athleteData.atheleteSchoolContact;
                        console.log("need to save");
                        Registration.saveData(schoolData, function (err, registerData) {
                            console.log("registerData", registerData);
                            // if (err) {
                            //     console.log("err", err);
                            //     callback("There was an error while saving data", null);
                            // } else {
                            //     if (_.isEmpty(registerData)) {
                            //         callback("No register data found", null);
                            //     } else {
                            //        // callback(null, registerData)
                            //     }
                            // }
                        });

                    }
                    if (athleteData.registrationFee == "online PAYU") {
                        PayU.atheletePayment(athleteData, function (err, found) {
                            if (err) {
                                callback(err, null);
                            } else {
                                if (_.isEmpty(found)) {
                                    callback(null, "Data not found");
                                } else {
                                    callback(null, found);
                                }
                            }

                        });
                    } else {
                        callback(null, athleteData);
                    }
                }
            }
        });
    },

    //genarate sfa when status changes to verified and sfaid is blank
    generateAtheleteSfaID: function (data, callback) {
        //find and first time atheleteID idea is for string id generation if required
        Athelete.findOne({
            _id: data._id
        }).sort({
            createdAt: -1
        }).exec(function (err, found) {
            console.log("found", found);
            if (err) {
                console.log(err);
                callback(err, null);
            } else {
                if (_.isEmpty(found)) {
                    console.log("isempty");
                    callback("No order data found", null);
                } else {
                    if (data.status == "verified") {
                        data.password = generator.generate({
                            length: 10,
                            numbers: true
                        });
                        if (_.isEmpty(data.sfaID)) {
                            console.log(data.password);
                            var year = new Date().getFullYear().toString().substr(2, 2);
                            // var value = newDate.getFullYear();
                            // var year = value.splice(2, 3);
                            if (_.isEmpty(found.city)) {
                                found.city = "Mumbai"
                            }
                            var city = found.city;
                            var prefixCity = city.charAt(0);
                            console.log("prefixCity", prefixCity);
                            data.sfaId = prefixCity + "A" + year + found.atheleteID;
                        }
                    }
                    Athelete.saveData(data, function (err, athleteData) { //saves data to database collection
                        console.log("athleteData", athleteData);
                        if (err) {
                            console.log("err", err);
                            callback("There was an error while saving order", null);
                        } else {
                            if (_.isEmpty(athleteData)) {
                                callback("No order data found", null);
                            } else {
                                callback(null, athleteData);
                            }
                        }
                    });
                }
            }
        });
    },
    getAllAtheleteDetails: function (data, callback) {
        Athelete.find().exec(function (err, found) { //finds all athelete
            if (err) {
                callback(err, null);
            } else if (_.isEmpty(found)) {
                callback(null, "Data is empty");
            } else {
                callback(null, found);
            }
        });

    },

    getOneAtheleteDetails: function (data, callback) {
        Athelete.findOne({ //finds one with refrence to id
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

    updatePaymentStatus: function (data, callback) {
        var matchObj = {
            $set: {
                paymentStatus: "Paid"
            }
        }
        Athelete.update({
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

    generateOTP: function (data, callback) {
        async.parallel([
                function (callback) {
                    var emailOtp = (Math.random() + "").substring(2, 6);

                    var emailData = {};
                    emailData.from = "info@sfanow.in";
                    emailData.email = data.email;
                    emailData.otp = emailOtp;
                    emailData.filename = "emailOtp.ejs";
                    emailData.subject = "SFA: Your Email OTP (One time Password) for SFA registration is";
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

                    var mobileOtp = (Math.random() + "").substring(2, 6);
                    var smsData = {};
                    console.log("mobileOtp", mobileOtp);
                    smsData.mobile = data.mobile;

                    smsData.content = "OTP Athlete: Your Mobile OTP (One time Password) for SFA registration is" + mobileOtp;
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

    onlinePaymentMailSms: function (data, callback) {
        async.parallel([
                function (callback) {
                    var emailOtp = (Math.random() + "").substring(2, 6);

                    var emailData = {};
                    emailData.from = "info@sfanow.in";
                    emailData.email = data.email;
                    emailData.filename = "atheleteOnlinePayment.ejs";
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
                    emailData.filename = "atheleteCashPayment.ejs";
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

    registedVerifiedMailSms: function (data, callback) {
        async.parallel([
                function (callback) {
                    var emailData = {};
                    emailData.from = "info@sfanow.in";
                    emailData.email = data.email;
                    emailData.sfaID = data.sfaID;
                    emailData.password = data.password;
                    emailData.filename = "registeredVerification.ejs";
                    emailData.subject = "SFA: Congratulations, You are now a verified School for SFA Mumbai 2017";
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

    unregistedVerifiedMailSms: function (data, callback) {
        async.parallel([
                function (callback) {
                    var emailData = {};
                    emailData.from = "info@sfanow.in";
                    emailData.email = data.email;
                    emailData.sfaID = data.sfaID;
                    emailData.password = data.password;
                    emailData.filename = "unregisteredVerification.ejs";
                    emailData.subject = "SFA: Congratulations, You are now a verified School for SFA Mumbai 2017";
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

    unregistedOnlinePaymentMailSms: function (data, callback) {
        async.parallel([
                function (callback) {
                    var emailData = {};
                    emailData.from = "info@sfanow.in";
                    emailData.email = data.email;
                    emailData.sfaID = data.sfaID;
                    emailData.password = data.password;
                    emailData.filename = "unregisteredOnlinePayment.ejs";
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







};
module.exports = _.assign(module.exports, exports, model);