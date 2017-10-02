var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate')(mongoose);
var uniqueValidator = require('mongoose-unique-validator');
var timestamps = require('mongoose-timestamp');
var validators = require('mongoose-validators');
var monguurl = require('monguurl');
require('mongoose-middleware').initialize(mongoose);
var autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(mongoose);

var Schema = mongoose.Schema;

var schema = new Schema({
    receiptNo: Number,
    athleteId: {
        type: Schema.Types.ObjectId,
        ref: 'Athelete',
        index: true
    },
    feeType: String,
    email: String,
    paymentStatus: {
        type: String,
        default: "Pending"
    },
    transactionId: {
        type: String,
    }
});

schema.plugin(deepPopulate, {});
schema.plugin(autoIncrement.plugin, {
    model: 'AdditionalPayment',
    field: 'receiptNo',
    startAt: 1,
    incrementBy: 1
});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('AdditionalPayment', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {
    paymentMail: function (data, callback) {
        console.log("getting inside", data);
        Athelete.findOne({ //finds one with refrence to id
            _id: data.athleteId
        }).exec(function (err, athleteInfo) {
            if (err) {
                callback(err, null);
            } else if (_.isEmpty(athleteInfo)) {
                callback(null, "Data is empty");
            } else {
                data.firstName = athleteInfo.firstName;
                data.mobile = athleteInfo.mobile;
                if (athleteInfo.atheleteSchoolName) {
                    if (data.feeType == "online PAYU") {
                        console.log("online payment mail");
                        AdditionalPayment.unregistedOnlinePaymentMailSms(data, function (err, vData) {
                            if (err) {
                                callback(err, null);
                            } else if (vData) {
                                callback(null, vData);
                            }
                        });
                    }
                } else {
                    School.findOne({ //finds one with refrence to id
                        _id: athleteInfo.school
                    }).exec(function (err, found) {
                        // console.log("found", found);
                        if (err) {
                            callback(err, null);
                        } else if (_.isEmpty(found)) {
                            callback(null, "Data is empty");
                        } else {
                            console.log("school", found.name);
                            Registration.findOne({ //finds one with refrence to id
                                schoolName: found.name
                            }).exec(function (err, school) {
                                if (err) {
                                    callback(err, null);
                                } else if (_.isEmpty(school)) {
                                    if (data.feeType == "online PAYU") {
                                        console.log("online payment mail");
                                        AdditionalPayment.unregistedOnlinePaymentMailSms(data, function (err, vData) {
                                            if (err) {
                                                callback(err, null);
                                            } else if (vData) {
                                                callback(null, vData);
                                            }
                                        });
                                    }
                                } else {
                                    var val = school.createdAt;
                                    console.log("data of register school", val);
                                    var year = new Date(val).getFullYear().toString().substr(2, 2);
                                    console.log("year", year);
                                    if (school.status == "Verified" && year == '17') {
                                        console.log("inside verified");
                                        if (data.feeType == "online PAYU") {
                                            console.log("online payment mail");
                                            AdditionalPayment.registeredOnlinePaymentMailSms(data, function (err, vData) {
                                                if (err) {
                                                    callback(err, null);
                                                } else if (vData) {
                                                    callback(null, vData);
                                                }
                                            });
                                        }
                                    } else {
                                        if (data.feeType == "online PAYU") {
                                            console.log("online payment mail");
                                            AdditionalPayment.unregistedOnlinePaymentMailSms(data, function (err, vData) {
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

                        }

                    });
                }
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
                    Athelete.findOne({ //finds one with refrence to id
                        _id: data.athleteId
                    }).exec(function (err, found) {
                        if (err) {
                            callback(err, null);
                        } else if (_.isEmpty(found)) {
                            callback(null, "Data is empty");
                        } else {
                            var emailData = {};
                            if (found.sfaId) {
                                emailData.sfaId = found.sfaId;
                            } else {
                                emailData.sfaId = "";
                            }
                            emailData.firstName = found.firstName;
                            emailData.surname = found.surname;
                            emailData.transactionID = data.transactionId;
                            emailData.Date = moment().format("DD-MM-YYYY");
                            emailData.receiptNo = "SFA" + data.receiptNo;
                            emailData.city = property[0].sfaCity;
                            emailData.year = property[0].year;
                            emailData.eventYear = property[0].eventYear;
                            emailData.athleteAmount = property[0].totalAmountAthlete;
                            emailData.amountInWords = property[0].totalAmountInWordsAthlete;
                            emailData.amountWithoutTax = property[0].amoutWithoutTaxAthlete;
                            emailData.cgstAmout = property[0].cgstAmoutAthlete;
                            emailData.cgstPercent = property[0].cgstPercentAthlete;
                            emailData.sgstAmout = property[0].sgstAmoutAthlete;
                            emailData.sgstPercent = property[0].sgstPercentAthlete;
                            emailData.igstAmout = property[0].igstAmoutAthlete;
                            emailData.igstPercent = property[0].igstPercentAthlete;

                            // emailData.from = "info@sfanow.in";
                            emailData.from = property[0].infoId;
                            emailData.infoId = property[0].infoId;
                            emailData.infoNo = property[0].infoNo;
                            emailData.cityAddress = property[0].cityAddress;
                            emailData.ddFavour = property[0].ddFavour;
                            emailData.email1 = [{
                                email: data.email
                            }];
                            emailData.bcc1 = [{
                                email: "payments@sfanow.in"
                            }, {
                                email: "admin@sfanow.in"
                            }];
                            emailData.filename = "receiptAthelete.ejs";
                            emailData.subject = "SFA: Your Payment Receipt as an Athlete for SFA " + emailData.city + " " + emailData.eventYear + ".";
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

    registeredOnlinePaymentMailSms: function (data, callback) {
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
                                var emailOtp = (Math.random() + "").substring(2, 6);
                                var emailData = {};
                                // emailData.from = "info@sfanow.in";
                                emailData.from = property[0].infoId;
                                emailData.name = data.firstName;
                                emailData.email = data.email;
                                emailData.city = property[0].sfaCity;
                                emailData.year = property[0].year;
                                emailData.eventYear = property[0].eventYear;
                                emailData.infoId = property[0].infoId;
                                emailData.infoNo = property[0].infoNo;
                                emailData.cityAddress = property[0].cityAddress;
                                emailData.ddFavour = property[0].ddFavour;
                                emailData.filename = "atheleteOnlinePayment.ejs";
                                emailData.subject = "SFA: Thank you for registering for SFA " + emailData.city + " " + emailData.year;
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

    unregistedOnlinePaymentMailSms: function (data, callback) {
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
                                emailData.name = data.firstName;
                                emailData.city = property[0].sfaCity;
                                emailData.year = property[0].year;
                                emailData.type = property[0].institutionType;
                                emailData.eventYear = property[0].eventYear;
                                emailData.athleteAmount = property[0].totalAmountAthlete;
                                // emailData.sfaID = data.sfaID;
                                // emailData.password = data.password;
                                emailData.filename = "unregisteredOnlinePayment.ejs";
                                emailData.subject = "SFA: Thank you for registering for SFA " + emailData.city + " " + emailData.eventYear + ".";
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
                                var city = property[0].sfaCity;
                                var year = property[0].year;
                                var eventYear = property[0].eventYear;
                                smsData.content = "Thank you for registering for SFA " + city + " " + eventYear + ". For further details please check your registered email ID.";
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
};
module.exports = _.assign(module.exports, exports, model);