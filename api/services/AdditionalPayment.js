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

schema.plugin(deepPopulate, {
    populate: {
        "athleteId.school": {
            select: ''
        },
    }
});
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
                            emailData.type = property[0].institutionType;
                            emailData.athleteAmount = property[0].additionalFee;
                            emailData.amountInWords = property[0].additionalFeeInWords;
                            emailData.amountWithoutTax = property[0].amoutWithoutTaxAdditional;
                            emailData.cgstAmout = property[0].cgstAmoutAdditional;
                            emailData.cgstPercent = property[0].cgstPercentAdditional;
                            emailData.sgstAmout = property[0].sgstAmoutAdditional;
                            emailData.sgstPercent = property[0].sgstPercentAdditional;
                            emailData.igstAmout = property[0].igstAmoutAdditional;
                            emailData.igstPercent = property[0].igstPercentAdditional;

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
                            emailData.subject = "SFA: Your Payment Receipt as an Athlete for SFA " + emailData.city + " " + emailData.type + " " + emailData.eventYear + ".";
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
                                emailData.type = property[0].institutionType;
                                emailData.eventYear = property[0].eventYear;
                                emailData.infoId = property[0].infoId;
                                emailData.infoNo = property[0].infoNo;
                                emailData.cityAddress = property[0].cityAddress;
                                emailData.ddFavour = property[0].ddFavour;
                                emailData.filename = "atheleteOnlinePaymentAdditional.ejs";
                                emailData.subject = "SFA: Thank you for payment for SFA " + emailData.city + " " + emailData.type + " " + emailData.eventYear + ".";
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
                                emailData.athleteAmount = property[0].additionalFee;
                                // emailData.sfaID = data.sfaID;
                                // emailData.password = data.password;
                                emailData.filename = "unregisteredOnlinePaymentAdditional.ejs";
                                emailData.subject = "SFA: Thank you for payment for SFA " + emailData.city + " " + emailData.type + " " + emailData.eventYear + ".";
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

    search: function (data, callback) {
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
                    fields: ['athleteId', 'feeType'],
                    term: data.keyword
                }
            },
            sort: {
                asc: 'createdAt'
            },
            start: (page - 1) * maxRow,
            count: maxRow
        };
        var deepSearch = "athleteId.school";

        AdditionalPayment.find(data.keyword)
            .sort({
                createdAt: -1
            })
            .order(options)
            .keyword(options)
            .deepPopulate(deepSearch)
            .page(options, function (err, found) {
                if (err) {
                    callback(err, null);
                } else if (_.isEmpty(found)) {
                    callback(null, "Data is empty");
                } else {
                    callback(null, found);
                }
            });
    },

    getOne: function (data, callback) {
        var deepSearch = "athleteId.school";
        AdditionalPayment.findOne({
            _id: data._id
        }).deepPopulate(deepSearch).lean().exec(function (err, found) {
            if (err) {
                callback(err, null);
            } else if (_.isEmpty(found)) {
                callback(null, []);
            } else {
                callback(null, found);
            }
        });
    },

    generateExcel: function (res) {
        async.waterfall([
                function (callback) {
                    var deepSearch = "athleteId.school";
                    AdditionalPayment.find().deepPopulate(deepSearch).lean().exec(function (err, found) {
                        if (err) {
                            callback(err, null);
                        } else if (_.isEmpty(found)) {
                            callback(null, []);
                        } else {
                            callback(null, found);
                        }
                    });
                },
                function (found, callback) {
                    async.concatSeries(found, function (mainData, callback) {
                            var obj = {};
                            obj["Date"] = moment.utc(mainData.createdAt).utcOffset("+05:30").format('DD-MM-YYYY');;
                            obj["Receipt No"] = mainData.receiptNo;
                            obj["SFA-Id"] = mainData.athleteId.sfaId;
                            obj["First Name"] = mainData.athleteId.firstName;
                            if (mainData.athleteId.middleName) {
                                obj["Middle Name"] = mainData.athleteId.middleName;
                            } else {
                                obj["Middle Name"] = " ";
                            }
                            obj["Last Name"] = mainData.athleteId.surname
                            if (mainData.athleteId.atheleteSchoolName) {
                                obj["School Name"] = mainData.athleteId.atheleteSchoolName;
                            } else {
                                obj["School Name"] = mainData.athleteId.school.name;
                            }
                            obj["Email"] = mainData.athleteId.email;
                            obj["Payment Mode"] = mainData.feeType;
                            obj["Payment Status"] = mainData.paymentStatus;
                            if (mainData.athleteId.middleName) {
                                obj["Transaction Id"] = mainData.transactionId;
                            } else {
                                obj["Transaction Id"] = " ";
                            }
                            console.log('obj', obj);
                            callback(null, obj);
                        },
                        function (err, singleData) {
                            Config.generateExcel("Additional-Payment", singleData, res);
                        });
                },
            ],
            function (err, excelData) {
                if (err) {
                    console.log(err);
                    callback(null, []);
                } else if (excelData) {
                    if (_.isEmpty(excelData)) {
                        callback(null, []);
                    } else {
                        callback(null, excelData);
                    }
                }
            });
    },

    getAggregatePipeline: function (data) {
        var pipeline = [
            // Stage 1
            {
                $lookup: {
                    "from": "atheletes",
                    "localField": "athleteId",
                    "foreignField": "_id",
                    "as": "athleteId"
                }
            },

            // Stage 2
            {
                $unwind: {
                    path: "$athleteId",

                }
            },

            // Stage 3
            {
                $lookup: {
                    "from": "schools",
                    "localField": "athleteId.school",
                    "foreignField": "_id",
                    "as": "athleteId.school"
                }
            },

            // Stage 4
            {
                $unwind: {
                    path: "$athleteId.school",
                    preserveNullAndEmptyArrays: true // optional
                }
            },

            // Stage 5
            {
                $match: {
                    $or: [{
                            feeType: data.keyword
                        },
                        {
                            "athleteId.sfaId": data.keyword
                        },
                        {
                            "athleteId.school.name": {
                                $regex: data.keyword,
                                $options: "i"
                            }
                        },
                        {
                            "athleteId.atheleteSchoolName": {
                                $regex: data.keyword,
                                $options: "i"
                            }
                        }

                    ]
                }
            },

        ];
        return pipeline;
    },

    filter: function (data, callback) {
        var maxRow = Config.maxRow;
        var page = 1;
        if (data.page) {
            page = data.page;
        }
        var start = (page - 1) * maxRow;

        var pipeLine = Profile.getAggregatePipeline(data);
        var newPipeLine = _.cloneDeep(pipeLine);
        newPipeLine.push(
            // Stage 6
            {
                '$skip': parseInt(start)
            }, {
                '$limit': maxRow
            });

        AdditionalPayment.aggregate(newPipeLine, function (err, additionalData) {
            if (err) {
                callback(err, "error in mongoose");
            } else if (_.isEmpty(additionalData)) {
                callback(null, []);
            } else {
                callback(null, additionalData);
            }
        });
    },


};
module.exports = _.assign(module.exports, exports, model);